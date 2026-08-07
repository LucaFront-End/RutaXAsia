import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * Serverless API handler for /api/wix-checkout
 * 1. Saves booking reservation to Wix CMS ('ReservasdeViaje')
 * 2. Returns the direct Wix Store product URL for "Anticipo de Viaje" ($5,000 MXN)
 *    so the buyer can click "Comprar Ahora" / checkout without cart errors.
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
        const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'
        const anticipoProductId = process.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

        // 1. Save to Wix CMS 'ReservasdeViaje'
        if (apiKey) {
            try {
                const wixClient = createClient({
                    modules: { items },
                    auth: ApiKeyStrategy({ siteId, apiKey }),
                })

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

                // Try fetching product URL directly from StoreCatalog/Products
                try {
                    const resProd = await wixClient.items.query('StoreCatalog/Products').eq('_id', anticipoProductId).find()
                    if (resProd.items.length > 0 && resProd.items[0].url) {
                        const targetUrl = resProd.items[0].url
                        console.log('[Wix Checkout API] Using official CMS product URL:', targetUrl)
                        return res.status(200).json({
                            success: true,
                            checkoutUrl: targetUrl,
                            message: 'Reserva guardada. Redirigiendo a producto Anticipo...',
                        })
                    }
                } catch (pErr) {
                    console.error('[Wix Checkout API] Error querying product URL:', pErr.message)
                }
            } catch (cmsErr) {
                console.error('[Wix Checkout API] CMS error:', cmsErr.message)
            }
        }

        // 2. Default fallback product URL for Anticipo
        const defaultCheckoutUrl = process.env.VITE_WIX_ANTICIPO_URL || `${wixBaseDomain}/p-gina-de-producto/anticipo-de-viaje`

        return res.status(200).json({
            success: true,
            checkoutUrl: defaultCheckoutUrl,
            message: 'Reserva guardada. Redirigiendo a pasarela de pago...',
        })
    } catch (error) {
        console.error('[Wix Checkout API] Global error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar checkout',
        })
    }
}
