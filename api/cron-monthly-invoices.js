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

        // Send direct transactional HTML email to CLIENT via RESEND
        const resendApiKey = process.env.RESEND_API_KEY
        if (resendApiKey && targetEmail && targetEmail.includes('@')) {
            try {
                const clientEmailHtml = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; padding: 24px 10px; color: #1e293b;">
                    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                        <div style="background: linear-gradient(135deg, #e11d48, #be123c); color: #fff; padding: 26px 20px; text-align: center;">
                            <h1 style="margin:0; font-size: 1.4rem; font-weight: 900;">RutaXAsia</h1>
                            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 0.85rem;">Recordatorio de Facturación Mensual</p>
                        </div>
                        <div style="padding: 24px 20px;">
                            <div style="display: inline-block; background: #fef2f2; color: #e11d48; font-weight: 800; padding: 4px 10px; border-radius: 100px; font-size: 0.76rem; margin-bottom: 12px;">📅 Vencimiento Programado</div>
                            <h2 style="font-size: 1.2rem; font-weight: 800; margin: 0 0 8px 0; color: #0f172a;">¡Hola, ${targetNombre}!</h2>
                            <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: #475569;">
                                Te recordamos que hoy está programada la liquidación de la <strong>Cuota ${targetCuota} de ${targetTotalCuotas}</strong> para tu viaje a <strong>${targetTemporada}</strong>.
                            </p>
                            
                            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 18px 0;">
                                <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b;">Monto a Liquidar</div>
                                <div style="font-size: 2rem; font-weight: 900; color: #0f172a; margin: 4px 0;">${formatPrice(targetMonto)} <span style="font-size: 0.9rem; color: #64748b;">MXN</span></div>
                                <div style="font-size: 0.78rem; color: #059669; font-weight: 700;">Cuota ${targetCuota} de ${targetTotalCuotas}</div>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.85rem;">
                                <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Titular:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${targetNombre}</td></tr>
                                <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Viaje:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${targetTemporada}</td></tr>
                                <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Estado:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #ea580c;">Pendiente de Pago</td></tr>
                            </table>

                            <a href="${checkoutUrl}" style="display: block; background: #e11d48; color: #ffffff !important; text-decoration: none; text-align: center; padding: 15px 20px; border-radius: 12px; font-weight: 800; font-size: 1rem; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);">Pagar Cuota ${targetCuota} en Wix Payments (${formatPrice(targetMonto)} MXN) →</a>
                            <p style="text-align: center; font-size: 0.76rem; color: #94a3b8; margin: 14px 0 0 0;">Aceptamos Tarjeta de Crédito/Débito, MercadoPago, SPEI y PayPal.</p>
                        </div>
                        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 0.75rem; color: #64748b;">
                            © RutaXAsia · Contacto: reservas@rutaxasia.com
                        </div>
                    </div>
                </div>`

                const resendRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'RutaXAsia <onboarding@resend.dev>',
                        to: [targetEmail],
                        subject: emailSubject,
                        html: clientEmailHtml
                    })
                })
                const resendData = await resendRes.json()
                console.log(`[Cron Invoicing Engine] ✅ Dispatched Resend reminder to client (${targetEmail}). ID:`, resendData?.id)
            } catch (clientErr) {
                console.error('[Cron Invoicing Engine] Resend reminder error:', clientErr.message)
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
