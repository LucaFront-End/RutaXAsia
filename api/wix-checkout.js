import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * Serverless API handler for /api/wix-checkout
 * 1. Saves booking reservation to Wix CMS ('ReservasdeViaje')
 * 2. Returns the Wix Store checkout link for the $5,000 MXN Anticipo product
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
            } catch (cmsErr) {
                console.error('[Wix Checkout API] CMS error:', cmsErr.message)
            }
        }

        // 2. Base Wix Site Domain for Store Checkout Redirect
        // Direct product URL / cart URL for Anticipo
        const defaultCheckoutUrl = process.env.VITE_WIX_ANTICIPO_URL || 'https://dilodigitalmx.wixsite.com/rutaxasia/cart'

        return res.status(200).json({
            success: true,
            checkoutUrl: defaultCheckoutUrl,
            message: 'Reserva guardada. Redirigiendo a pasarela de pago Wix Store...',
        })
    } catch (error) {
        console.error('[Wix Checkout API] Error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar checkout',
        })
    }
}
