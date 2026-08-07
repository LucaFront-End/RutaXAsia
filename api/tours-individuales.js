import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

function formatWixImageUrl(wixUrl) {
    if (!wixUrl) return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
    if (wixUrl.startsWith('http://') || wixUrl.startsWith('https://')) return wixUrl
    if (wixUrl.startsWith('wix:image://v1/')) {
        const match = wixUrl.match(/wix:image:\/\/v1\/([^/#]+)/)
        if (match && match[1]) {
            return `https://static.wixstatic.com/media/${match[1]}`
        }
    }
    return wixUrl
}

/**
 * GET /api/tours-individuales — Fetch all tours from Wix CMS collection "TourIndividuales"
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.status(200).end()

    try {
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        })

        let allItems = []
        let result = await wixClient.items
            .query('TourIndividuales')
            .limit(100)
            .find()

        allItems.push(...(result.items || []))

        while (result.hasNext && result.hasNext()) {
            result = await result.next()
            allItems.push(...(result.items || []))
        }

        const formattedTours = allItems.map(it => {
            const rawCat = (it.tipoDeViaje || '').trim()
            let category = 'Rutas por Japón'
            if (rawCat === 'Parques temáticos') {
                category = 'Parques temáticos'
            } else if (rawCat === 'Expereicnias VIP' || rawCat === 'Experiencias' || rawCat === 'Experiencias Vip') {
                category = 'Experiencias Vip'
            } else if (rawCat === 'Rutas por Japón') {
                category = 'Rutas por Japón'
            }

            let priceNum = 0
            if (typeof it.precioNmero === 'number' && !isNaN(it.precioNmero) && it.precioNmero > 0) {
                priceNum = it.precioNmero
            } else if (it.precioEnTexto) {
                const cleaned = String(it.precioEnTexto).replace(/[^0-9.]/g, '')
                const parsed = parseFloat(cleaned)
                if (!isNaN(parsed)) priceNum = parsed
            }

            return {
                id: it._id,
                title: it.title || 'Tour Individual',
                excerpt: it.excerptDeTour || '',
                image: formatWixImageUrl(it.image),
                priceText: it.precioEnTexto || (priceNum > 0 ? `$${priceNum.toLocaleString('es-MX')} MXN` : ''),
                priceNum: priceNum,
                days: it.dasDeViaje || '',
                hours: it.horasDeViaje || '',
                observations: it.observaciones || '',
                category: category,
                rawCategory: rawCat,
            }
        })

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
        res.status(200).json({ tours: formattedTours })
    } catch (error) {
        console.error('[TourIndividuales API] Error:', error.message)
        res.status(500).json({ tours: [], error: error.message })
    }
}
