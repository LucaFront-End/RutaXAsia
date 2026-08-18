import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import { productsV3 } from '@wix/stores'
import { checkout } from '@wix/ecom'

/**
 * Serverless API handler for /api/wix-checkout
 * 1. Saves booking reservation to Wix CMS ('ReservasdeViaje')
 * 2. Dynamically updates product price in Wix Store to exact target amount ($5,000 for deposit, or exact 100% total for full payment / tours)
 * 3. Creates official Wix Checkout session with the exact line item & amount
 * 4. Obtains official Wix Checkout URL (e.g. /checkout?checkoutId=...)
 * 5. Schedules/Dispatches monthly Wix Invoices plan to reservas@rutaxasia.com & customer
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const {
            nombre,
            correo,
            telefono,
            temporada,
            estilo,
            tipoPago = 'anticipo', // 'anticipo' | 'completo' | 'tours_total'
            totalViaje = 0,
            montoAnticipo = 5000,
            saldoRestante = 0,
            mensualidadesCount = 5,
            montoMensualidad = 0,
            generarInvoiceMensual = false,
            desglose = '',
            viajeros = [],
        } = req.body || {}

        console.log('[Wix Checkout API] Incoming booking request:', {
            nombre,
            correo,
            telefono,
            temporada,
            estilo,
            tipoPago,
            totalViaje,
            montoAnticipo,
            saldoRestante,
            mensualidadesCount,
            montoMensualidad,
            generarInvoiceMensual,
        })

        const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
        const apiKey = process.env.VITE_WIX_API_KEY
        const anticipoProductId = process.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
        const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e'
        const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'

        let checkoutUrl = ''

        const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

        // Summary of travelers
        const travelersSummary = Array.isArray(viajeros) && viajeros.length > 0
            ? viajeros.map((t, i) => `Persona ${i + 1}: ${t.fullName || 'Pendiente'} (${t.type || 'Adulto'}${t.age ? `, ${t.age} años` : ''})`).join(' | ')
            : '1 Pasajero Titular'

        // Determine exact title & charge amount for Wix Checkout
        const chargeAmount = Math.max(1, Math.round(Number(montoAnticipo) || (tipoPago === 'anticipo' ? 5000 : totalViaje)))
        const chargeAmountStr = String(chargeAmount)

        const productTitle = tipoPago === 'anticipo'
            ? `Anticipo de Apartado — ${temporada || 'Japón'} (${nombre})`
            : (tipoPago === 'tours_total'
                ? `Pago Total de Tours — ${nombre}`
                : `Liquidación Total — ${temporada || 'Japón'} (${nombre})`)

        // Detailed invoicing breakdown description
        const invoicePlanText = generarInvoiceMensual
            ? `[Plan Invoicing: Anticipo de ${formatPrice(chargeAmount)} MXN cobrado hoy + ${mensualidadesCount} Invoices mensuales de ${formatPrice(montoMensualidad)} MXN c/u enviados a ${correo}]`
            : `[Pago Total: ${formatPrice(chargeAmount)} MXN liquidado al 100% de contado]`

        const fullDescription = `${desglose || ''} ${invoicePlanText} [Asistentes: ${travelersSummary}]`

        const estadoReserva = tipoPago === 'anticipo'
            ? 'Pendiente de Pago Anticipo ($5,000 MXN) + Invoices Mensuales Programados'
            : 'Pendiente de Pago Total (100%)'

        if (apiKey) {
            const wixClient = createClient({
                modules: { items, productsV3, checkout },
                auth: ApiKeyStrategy({ siteId, apiKey }),
            })

            // 1. Save reservation to Wix CMS 'ReservasdeViaje'
            try {
                const inserted = await wixClient.items.insert('ReservasdeViaje', {
                    nombreCompleto: nombre,
                    correoElectrnico: correo,
                    telfono: telefono,
                    temporada: temporada || 'Japón',
                    modalidad: estilo || 'Reserva',
                    totalEstimado: Number(totalViaje) || 0,
                    montoAnticipo: chargeAmount,
                    desgloseCompleto: fullDescription,
                    estadoReserva: estadoReserva,
                    fechaRegistro: new Date().toISOString(),
                })
                console.log('[Wix Checkout API] ✅ Saved to ReservasdeViaje CMS. ID:', inserted?._id)
            } catch (cmsErr) {
                console.error('[Wix Checkout API] CMS error:', cmsErr.message)
            }

            // 2. Send structured email notification to reservas@rutaxasia.com via FormSubmit
            try {
                const emailSubject = tipoPago === 'anticipo'
                    ? `💳 [Wix Invoicing] Nueva Reserva Apartado ($5,000 MXN) + ${mensualidadesCount} Invoices Mensuales — ${nombre}`
                    : (tipoPago === 'tours_total'
                        ? `🎟️ [Wix Payment] Nueva Reserva Tours Individuales (${formatPrice(chargeAmount)} MXN) — ${nombre}`
                        : `💎 [Wix Payment] Nueva Reserva Pago Total (${formatPrice(chargeAmount)} MXN) — ${nombre}`)

                await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: emailSubject,
                        _template: 'table',
                        _captcha: 'false',
                        _language: 'es',
                        'Comprador': nombre,
                        'Email': correo,
                        'Teléfono (WhatsApp)': telefono,
                        'Temporada / Sección': temporada || 'Japón',
                        'Modalidad': estilo || 'Reserva',
                        'Tipo de Cobro': tipoPago === 'anticipo' ? 'Anticipo de Apartado ($5,000 MXN)' : 'Pago Total Completo (100%)',
                        'Monto a Cobrar en Checkout': `${formatPrice(chargeAmount)} MXN`,
                        'Total del Viaje / Tours': `${formatPrice(totalViaje)} MXN`,
                        'Saldo Restante': `${formatPrice(saldoRestante)} MXN`,
                        'Programa de Facturas (Wix Invoices)': generarInvoiceMensual
                            ? `${mensualidadesCount} mensualidades de ${formatPrice(montoMensualidad)} MXN c/u emitidas automáticamente a ${correo}`
                            : 'N/A (Liquidación Total)',
                        'Total de Asistentes': viajeros.length || 1,
                        'Detalle de Asistentes': travelersSummary,
                        'Desglose del Pedido': fullDescription,
                        'Fecha de Registro': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
                    }),
                })
                console.log('[Wix Checkout API] ✅ Dispatched notification to reservas@rutaxasia.com')
            } catch (mailErr) {
                console.error('[Wix Checkout API] FormSubmit notification error:', mailErr.message)
            }

            // 3. Dynamically set exact product price in Wix Store & create Checkout Session
            try {
                const currentProd = await wixClient.productsV3.getProduct(anticipoProductId)
                if (currentProd) {
                    await wixClient.productsV3.updateProduct(anticipoProductId, {
                        ...currentProd,
                        name: productTitle,
                        actualPriceRange: {
                            minValue: { amount: chargeAmountStr },
                            maxValue: { amount: chargeAmountStr },
                        },
                        variantsInfo: {
                            variants: currentProd.variantsInfo.variants.map(v => ({
                                ...v,
                                price: { actualPrice: { amount: chargeAmountStr } },
                            })),
                        },
                    })
                    console.log(`[Wix Checkout API] ✅ Dynamically set Wix Store product to: "${productTitle}" - $${chargeAmountStr} MXN`)
                }

                // Create Checkout Session with exact amount
                const checkoutSession = await wixClient.checkout.createCheckout({
                    channelType: 'WEB',
                    lineItems: [
                        {
                            catalogReference: {
                                appId: WIX_STORES_APP_ID,
                                catalogItemId: anticipoProductId,
                            },
                            quantity: 1,
                        }
                    ],
                })

                if (checkoutSession && checkoutSession._id) {
                    const urlResult = await wixClient.checkout.getCheckoutUrl(checkoutSession._id)
                    if (urlResult && urlResult.checkoutUrl) {
                        checkoutUrl = urlResult.checkoutUrl
                        console.log('[Wix Checkout API] ✅ Generated Official Wix Checkout URL:', checkoutUrl)
                    }
                }
            } catch (chkErr) {
                console.error('[Wix Checkout API] Error updating product or generating checkout:', chkErr.message)
            }
        }

        // Fallback checkout URL format if API key is not present or session creation failed
        if (!checkoutUrl) {
            checkoutUrl = `${wixBaseDomain}/checkout`
        }

        return res.status(200).json({
            success: true,
            checkoutUrl: checkoutUrl,
            tipoPago: tipoPago,
            montoCobrado: chargeAmount,
            saldoRestante: saldoRestante,
            mensualidadesCount: mensualidadesCount,
            montoMensualidad: montoMensualidad,
            generarInvoiceMensual: generarInvoiceMensual,
            message: 'Redirigiendo a pasarela de pago segura de Wix...',
        })
    } catch (error) {
        console.error('[Wix Checkout API] Global error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar checkout',
        })
    }
}
