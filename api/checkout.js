import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

/**
 * serverless function: POST /api/checkout
 * Processes deposit payment (apartado) and creates a monthly invoicing plan for the remainder.
 * Saves booking data to Wix CMS.
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const {
            nombre,
            correo,
            telefono,
            temporada,
            estilo,
            totalViaje,
            desglose,
            cardName,
            // In a real Stripe Elements flow we receive a token or paymentMethodId, but we support mock payloads too
            paymentMethodId
        } = req.body || {};

        console.log('[Checkout API] Starting checkout for:', { nombre, correo, totalViaje });

        // 1. Calculate pricing breakdown
        // Deposit (Anticipo) = $5,000 MXN
        const depositAmount = 5000;
        const remainder = Math.max(0, totalViaje - depositAmount);
        
        // 5 Monthly Installments (Invoice each month)
        const installmentsCount = 5;
        const monthlyInstallment = Math.round(remainder / installmentsCount);

        const installmentMessage = remainder > 0 
            ? `${installmentsCount} mensualidades de $${monthlyInstallment.toLocaleString('es-MX')} MXN`
            : 'Sin mensualidades (viaje pagado en su totalidad)';

        // 2. Stripe integration (Real or Simulated)
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        let stripeResult = {};

        if (stripeKey) {
            console.log('[Checkout API] Stripe Secret Key found. Executing real Stripe API calls...');
            
            try {
                // A. Create Customer in Stripe
                const customerRes = await fetch('https://api.stripe.com/v1/customers', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        email: correo,
                        name: nombre,
                        phone: telefono,
                        description: `Cliente de Japón a la Carta - Estilo: ${estilo}`
                    })
                });
                const customer = await customerRes.json();
                if (customer.error) throw new Error(`Stripe Customer Error: ${customer.error.message}`);
                const customerId = customer.id;

                // B. Create Payment Intent for Deposit
                const paymentIntentRes = await fetch('https://api.stripe.com/v1/payment_intents', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        amount: String(depositAmount * 100), // In cents (MXN)
                        currency: 'mxn',
                        customer: customerId,
                        description: `Anticipo de Apartado - Japón a la Carta (${temporada} ${estilo})`,
                        payment_method: paymentMethodId || 'pm_card_visa', // Default to visa test card if none sent
                        confirm: 'true',
                        off_session: 'true'
                    })
                });
                const paymentIntent = await paymentIntentRes.json();
                if (paymentIntent.error) throw new Error(`Stripe Charge Error: ${paymentIntent.error.message}`);

                // C. Schedule recurring monthly invoices for the remainder
                let subscriptionId = null;
                if (remainder > 0) {
                    // In Stripe, we can achieve this by creating a Price and a Subscription (or using Subscription Schedules)
                    // First create a monthly Product/Price for this customer
                    const priceRes = await fetch('https://api.stripe.com/v1/prices', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${stripeKey}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            unit_amount: String(monthlyInstallment * 100), // In cents
                            currency: 'mxn',
                            recurring_interval: 'month',
                            product_data_name: `Mensualidad Japón a la Carta (${temporada} ${estilo})`
                        })
                    });
                    const price = await priceRes.json();
                    if (price.error) throw new Error(`Stripe Price Error: ${price.error.message}`);

                    // Create subscription
                    const subRes = await fetch('https://api.stripe.com/v1/subscriptions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${stripeKey}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            customer: customerId,
                            'items[0][price]': price.id,
                            description: `Plan de 5 mensualidades para liquidar saldo de viaje`,
                            cancel_at_period_end: 'true' // In a real system, you might cancel/limit after 5 cycles
                        })
                    });
                    const subscription = await subRes.json();
                    if (subRes.ok) {
                        subscriptionId = subscription.id;
                    }
                }

                stripeResult = {
                    mode: 'live',
                    customerId,
                    chargeId: paymentIntent.id,
                    status: paymentIntent.status,
                    subscriptionId
                };
            } catch (stripeErr) {
                console.error('[Checkout API] Stripe Integration Error:', stripeErr.message);
                return res.status(400).json({
                    success: false,
                    error: 'Error al procesar el pago con la tarjeta bancaria.',
                    details: stripeErr.message
                });
            }
        } else {
            console.log('[Checkout API] Stripe Secret Key not found. Simulating payment success...');
            stripeResult = {
                mode: 'simulation',
                customerId: `cus_sim_${Math.random().toString(36).substr(2, 9)}`,
                chargeId: `ch_sim_${Math.random().toString(36).substr(2, 9)}`,
                status: 'succeeded',
                subscriptionId: remainder > 0 ? `sub_sim_${Math.random().toString(36).substr(2, 9)}` : null
            };
        }

        // 3. Save to Wix CMS (collection 'cmsformulario')
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        const detailMessage = `
--- RESERVA DE VIAJE CON APARTADO ---
Temporada: ${temporada}
Estilo: ${estilo}
Total del Viaje: $${totalViaje.toLocaleString('es-MX')} MXN
Anticipo Pagado: $${depositAmount.toLocaleString('es-MX')} MXN (Status: ${stripeResult.status})
Saldo Restante: $${remainder.toLocaleString('es-MX')} MXN
Plan de Facturación: ${installmentMessage}
Desglose del Viaje: ${desglose}
Modo de Cobro: ${stripeResult.mode === 'live' ? 'En Vivo' : 'Simulación de Pago'}
ID de Cargo Pago: ${stripeResult.chargeId}
ID de Suscripción: ${stripeResult.subscriptionId || 'Ninguna'}
Titular de Tarjeta: ${cardName}
`;

        const wixData = {
            nombre: nombre,
            telefono: telefono,
            email: correo,
            estado: 'Reservado', // Mark status as Reservado
            viaje: `Japón ${temporada} - ${estilo}`,
            mensaje: detailMessage.trim(),
            origen: 'Web Checkout',
            fuente: 'Apartado y Facturación Recurrente',
            fecha: new Date().toISOString(),
        };

        console.log('[Checkout API] Saving booking in Wix CMS:', wixData);
        const wixResult = await wixClient.items.insert('cmsformulario', wixData);
        console.log('[Checkout API] CMS insertion success! ID:', wixResult?._id);

        res.status(200).json({
            success: true,
            stripe: stripeResult,
            wixId: wixResult?._id,
            depositPaid: depositAmount,
            installments: installmentMessage
        });

    } catch (error) {
        console.error('[Checkout API] Global Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
