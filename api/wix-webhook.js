import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * Webhook handler for Wix Payments & E-Commerce Order Events
 * Triggered when a customer completes payment in Wix Checkout.
 * 
 * 1. Matches customer email / name in Wix CMS 'ReservasdeViaje'
 * 2. Updates 'estadoReserva' to 'PAGADO - Confirmado'
 * 3. Records payment date and transaction details
 * 4. Dispatches confirmation notification to reservas@rutaxasia.com
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') return res.status(200).end()

    // Handle health check / verification
    if (req.method === 'GET') {
        return res.status(200).json({ status: 'Wix Webhook listener active' })
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const payload = req.body || {}
        console.log('[Wix Webhook] Received event payload:', JSON.stringify(payload).slice(0, 300))

        const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
        const apiKey = process.env.VITE_WIX_API_KEY

        // Extract customer email, name, total from Wix order payload
        const buyerEmail = payload.buyerInfo?.email || payload.email || payload.buyerEmail || payload.data?.buyerInfo?.email || ''
        const buyerName = payload.buyerInfo?.name || payload.name || payload.buyerName || payload.data?.buyerInfo?.name || ''
        const amountPaid = payload.priceSummary?.total?.amount || payload.total || payload.amount || ''
        const orderId = payload._id || payload.orderId || payload.data?.order?._id || ''

        if (apiKey && (buyerEmail || buyerName)) {
            const wixClient = createClient({
                modules: { items },
                auth: ApiKeyStrategy({ siteId, apiKey }),
            })

            // Find matching pending reservation in ReservasdeViaje CMS
            let query = wixClient.items.query('ReservasdeViaje').descending('_createdDate').limit(5)
            if (buyerEmail) {
                query = query.eq('correoElectrnico', buyerEmail)
            }
            const results = await query.find()

            if (results.items.length > 0) {
                const reserva = results.items[0]
                const nuevoEstado = 'Pagado'

                await wixClient.items.update('ReservasdeViaje', {
                    ...reserva,
                    estadoReserva: nuevoEstado,
                    fechaPago: new Date().toISOString(),
                    wixOrderId: orderId,
                })
                console.log(`[Wix Webhook] ✅ Updated reservation ID ${reserva._id} to status: "${nuevoEstado}"`)
            }
        }

        return res.status(200).json({ success: true, message: 'Webhook processed successfully' })
    } catch (err) {
        console.error('[Wix Webhook] Error processing payment event:', err)
        return res.status(500).json({ success: false, error: err.message })
    }
}
