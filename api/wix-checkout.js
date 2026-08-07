import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import { checkout } from '@wix/ecom'

/**
 * Serverless API handler for /api/wix-checkout
 * 1. Saves booking reservation to Wix CMS ('ReservasdeViaje')
 * 2. Generates Wix Store Checkout session and returns exact URL:
 *    https://dilodigitalmx.wixsite.com/rutaxasia/__ecom/checkout?checkoutId={checkoutId}&origin=https://www.rutaxasia.com
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
            totalViaje,
            desglose,
            montoAnticipo = 5000,
        } = req.body || {}

        console.log('[Wix Checkout API] Booking payload:', { nombre, correo, temporada, estilo, totalViaje, montoAnticipo })

        const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
        const apiKey = process.env.VITE_WIX_API_KEY
        const anticipoProductId = process.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
        const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
        const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'
        const originUrl = process.env.VITE_SITE_ORIGIN || 'https://www.rutaxasia.com'

        let checkoutUrl = process.env.VITE_WIX_CHECKOUT_URL || ''

        if (apiKey) {
            const wixClient = createClient({
                modules: { items, checkout },
                auth: ApiKeyStrategy({ siteId, apiKey }),
            })

            // 1. Save reservation to Wix CMS 'ReservasdeViaje'
            try {
                await wixClient.items.insert('ReservasdeViaje', {
                    nombreCompleto: nombre,
                    correoElectrnico: correo,
                    telfono: telefono,
                    temporada: temporada || 'Japón',
                    modalidad: estilo || 'Reserva',
                    totalEstimado: totalViaje || 0,
                    montoAnticipo: montoAnticipo,
                    desgloseCompleto: desglose || '',
                    estadoReserva: 'Pendiente de Pago',
                    fechaRegistro: new Date().toISOString(),
                })
                console.log('[Wix Checkout API] Saved to ReservasdeViaje CMS successfully.')
            } catch (cmsErr) {
                console.error('[Wix Checkout API] CMS error:', cmsErr.message)
            }

            // 2. Create Wix E-commerce Checkout Session
            if (!checkoutUrl) {
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
                        checkoutUrl = `${wixBaseDomain}/__ecom/checkout?checkoutId=${checkoutSession._id}&origin=${encodeURIComponent(originUrl)}`
                        console.log('[Wix Checkout API] ✅ Generated Wix Store Checkout URL:', checkoutUrl)
                    }
                } catch (chkErr) {
                    console.error('[Wix Checkout API] Error generating checkoutId:', chkErr.message)
                }
            }
        }

        // Fallback checkout URL format if API key is not present or error
        if (!checkoutUrl) {
            checkoutUrl = `${wixBaseDomain}/cart`
        }

        return res.status(200).json({
            success: true,
            checkoutUrl: checkoutUrl,
            message: 'Reserva guardada. Redirigiendo a pasarela de pago Wix Store...',
        })
    } catch (error) {
        console.error('[Wix Checkout API] Global error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar checkout',
        })
    }
}
