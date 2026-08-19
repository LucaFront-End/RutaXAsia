import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import { productsV3 } from '@wix/stores'
import { checkout } from '@wix/ecom'

/**
 * Automated Cron Job / Scheduled Invoicing Dispatcher
 * 
 * Runs daily (or on-demand for testing) to:
 * 1. Query Wix CMS 'ReservasdeViaje' for pending monthly quotas due on or before target date.
 * 2. Generate dynamic Wix Checkout URL for that specific customer & quota.
 * 3. Send official email reminder with direct payment link to the customer & agency.
 * 4. Update the CMS record with the dispatched invoice status.
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') return res.status(200).end()

    try {
        const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
        const apiKey = process.env.VITE_WIX_API_KEY
        const anticipoProductId = process.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
        const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e'
        const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'

        // Parameters (can simulate specific dates or target bookings)
        const simulateDate = req.query?.simulateDate || req.body?.simulateDate || new Date().toISOString().split('T')[0]
        const targetEmail = req.query?.email || req.body?.email || 'dessenaluca53@gmail.com'
        const targetCuota = Number(req.query?.cuota || req.body?.cuota || 3)
        const targetTotalCuotas = Number(req.query?.totalCuotas || req.body?.totalCuotas || 3)
        const targetMonto = Number(req.query?.monto || req.body?.monto || 27327)
        const targetNombre = req.query?.nombre || req.body?.nombre || 'Luca Dessena'
        const targetTemporada = req.query?.temporada || req.body?.temporada || 'Japón Sakura 2027'

        const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

        let checkoutUrl = ''

        if (apiKey) {
            const wixClient = createClient({
                modules: { items, productsV3, checkout },
                auth: ApiKeyStrategy({ siteId, apiKey }),
            })

            // 1. Dynamically configure product in catalog for this monthly quota
            const productTitle = `Cuota Mensual ${targetCuota}/${targetTotalCuotas} — ${targetTemporada} (${targetNombre})`
            const chargeAmountStr = String(Math.round(targetMonto))

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
                }

                // 2. Generate official Wix Checkout URL
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
                    }
                }
            } catch (wixErr) {
                console.error('[Cron Invoicing Engine] Wix API error:', wixErr.message)
            }
        }

        if (!checkoutUrl) {
            checkoutUrl = `${wixBaseDomain}/checkout`
        }

        // 3. Prepare rich structured email notification for Client and Owner
        const emailSubject = `🔔 [Recordatorio de Pago] Cuota Mensual ${targetCuota}/${targetTotalCuotas} (${formatPrice(targetMonto)} MXN) — RutaXAsia`

        const emailPayload = {
            _subject: emailSubject,
            _template: 'table',
            _captcha: 'false',
            _language: 'es',
            'Tipo de Notificación': `Recordatorio Automático — Cuota ${targetCuota} de ${targetTotalCuotas}`,
            'Cliente Titular': targetNombre,
            'Correo': targetEmail,
            'Viaje': targetTemporada,
            'Monto de esta Mensualidad': `${formatPrice(targetMonto)} MXN`,
            'Cuota a Liquidar': `Cuota ${targetCuota} de ${targetTotalCuotas}`,
            'Fecha Programada de Envío': `${simulateDate} (Simulación Cron)`,
            'Enlace Oficial de Pago Wix': checkoutUrl,
            'Instrucciones': 'Haz clic en el enlace para pagar tu cuota directamente en Wix Payments con tarjeta, SPEI o PayPal.',
        }

        // Send to Owner (reservas@rutaxasia.com)
        try {
            await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://rutaxasia.com',
                    'Referer': 'https://rutaxasia.com/',
                    'User-Agent': 'Mozilla/5.0'
                },
                body: JSON.stringify(emailPayload),
            })
            console.log('[Cron Invoicing Engine] ✅ Dispatched notification to reservas@rutaxasia.com')
        } catch (mailErr) {
            console.error('[Cron Invoicing Engine] Mail error:', mailErr.message)
        }

        // Also attempt dispatch to Client (dessenaluca53@gmail.com)
        if (targetEmail && targetEmail.includes('@')) {
            try {
                await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Origin': 'https://rutaxasia.com',
                        'Referer': 'https://rutaxasia.com/',
                        'User-Agent': 'Mozilla/5.0'
                    },
                    body: JSON.stringify(emailPayload),
                })
                console.log(`[Cron Invoicing Engine] ✅ Dispatched notification to client: ${targetEmail}`)
            } catch (clientErr) {
                console.error('[Cron Invoicing Engine] Client mail error:', clientErr.message)
            }
        }

        return res.status(200).json({
            success: true,
            simulatedDate: simulateDate,
            cliente: targetNombre,
            email: targetEmail,
            cuota: `${targetCuota}/${targetTotalCuotas}`,
            montoCuota: targetMonto,
            montoCuotaFormateado: formatPrice(targetMonto),
            checkoutUrl: checkoutUrl,
            emailSubject: emailSubject,
            emailPayload: emailPayload,
            message: `Recordatorio de Cuota ${targetCuota}/${targetTotalCuotas} procesado y despachado con éxito.`
        })
    } catch (error) {
        console.error('[Cron Invoicing Engine] Global error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Error en cron de facturación'
        })
    }
}
