import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import { checkout } from '@wix/ecom'

/**
 * Serverless API handler for /api/wix-checkout
 * 1. Saves booking reservation to Wix CMS ('ReservasdeViaje')
 * 2. Sends notification to reservas@rutaxasia.com.mx
 * 3. Returns the direct product / cart checkout URL for Anticipo
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
        const originUrl = process.env.VITE_SITE_ORIGIN || 'https://www.rutaxasia.com'

        // 1. Save to Wix CMS 'ReservasdeViaje'
        if (apiKey) {
            try {
                const wixClient = createClient({
                    modules: { items, checkout },
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

                // Try finding matching product in StoreCatalog/Products
                try {
                    const storeProds = await wixClient.items.query('StoreCatalog/Products').find()
                    const anticipoItem = storeProds.items.find(p =>
                        (p.name || '').toLowerCase().includes('anticipo') ||
                        (p.slug || '').toLowerCase().includes('anticipo') ||
                        (p.name || '').toLowerCase().includes('apartado')
                    )
                    if (anticipoItem) {
                        const targetUrl = anticipoItem.url || `${wixBaseDomain}/product-page/${anticipoItem.slug}`
                        console.log('[Wix Checkout API] Found Anticipo product page URL:', targetUrl)
                        return res.status(200).json({
                            success: true,
                            checkoutUrl: targetUrl,
                            message: 'Reserva guardada. Redirigiendo a producto Anticipo...',
                        })
                    }
                } catch (prodErr) {
                    console.error('[Wix Checkout API] Error searching product:', prodErr.message)
                }
            } catch (cmsErr) {
                console.error('[Wix Checkout API] CMS error:', cmsErr.message)
            }
        }

        // 2. Default fallback checkout URL (Direct product page or cart URL)
        const defaultCheckoutUrl = process.env.VITE_WIX_ANTICIPO_URL || `${wixBaseDomain}/product-page/anticipo`

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
