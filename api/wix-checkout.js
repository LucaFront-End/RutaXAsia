import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import { checkout } from '@wix/ecom'

/**
 * Serverless API handler for /api/wix-checkout
 * 1. Saves draft reservation to Wix CMS ('ReservasdeViaje') with 'Pendiente de Pago' status
 * 2. Generates genuine Wix Checkout session using Wix Stores catalog
 * 3. Obtains official checkout URL: https://dilodigitalmx.wixsite.com/rutaxasia/checkout?checkoutId=...
 * 4. Dispatches booking and invoice notification to reservas@rutaxasia.com
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
        // Official Wix Stores App ID for E-commerce catalog line items
        const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e'
        const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'

        let checkoutUrl = ''

        const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

        // Summary of travelers
        const travelersSummary = Array.isArray(viajeros) && viajeros.length > 0
            ? viajeros.map((t, i) => `Persona ${i + 1}: ${t.fullName || 'Pendiente'} (${t.type || 'Adulto'}${t.age ? `, ${t.age} años` : ''})`).join(' | ')
            : '1 Pasajero Titular'

        // Detailed invoicing breakdown description
        const invoicePlanText = generarInvoiceMensual
            ? `[Plan Invoicing: Anticipo de ${formatPrice(montoAnticipo)} MXN + ${mensualidadesCount} Invoices mensuales de ${formatPrice(montoMensualidad)} MXN c/u al correo ${correo}]`
            : `[Pago Total: ${formatPrice(montoAnticipo)} MXN liquidado al 100%]`

        const fullDescription = `${desglose || ''} ${invoicePlanText} [Asistentes: ${travelersSummary}]`

        const estadoReserva = tipoPago === 'anticipo'
            ? 'Pendiente de Pago Anticipo ($5,000 MXN) + Invoices Mensuales Programados'
            : 'Pendiente de Pago Total (100%)'

        if (apiKey) {
            const wixClient = createClient({
                modules: { items, checkout },
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
                    montoAnticipo: Number(montoAnticipo) || 0,
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
                    ? `💳 [Wix Invoicing] Nueva Reserva Apartado ($5,000 MXN) — ${nombre}`
                    : (tipoPago === 'tours_total'
                        ? `🎟️ [Wix Payment] Nueva Reserva Tours Individuales (${formatPrice(montoAnticipo)} MXN) — ${nombre}`
                        : `💎 [Wix Payment] Nueva Reserva Pago Total (${formatPrice(montoAnticipo)} MXN) — ${nombre}`)

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
                        'Monto a Cobrar': `${formatPrice(montoAnticipo)} MXN`,
                        'Total del Viaje / Tours': `${formatPrice(totalViaje)} MXN`,
                        'Saldo Restante': `${formatPrice(saldoRestante)} MXN`,
                        'Programa de Facturas (Wix Invoices)': generarInvoiceMensual
                            ? `${mensualidadesCount} mensualidades de ${formatPrice(montoMensualidad)} MXN c/u enviadas al correo ${correo}`
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

            // 3. Create Wix E-commerce Checkout Session with real line items
            try {
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
                console.error('[Wix Checkout API] Error generating checkout session:', chkErr.message)
            }
        }

        // Fallback checkout URL format if API key is not present or session creation failed
        if (!checkoutUrl) {
            checkoutUrl = `${wixBaseDomain}/p-gina-de-producto/anticipo-de-viaje`
        }

        return res.status(200).json({
            success: true,
            checkoutUrl: checkoutUrl,
            tipoPago: tipoPago,
            montoCobrado: montoAnticipo,
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
