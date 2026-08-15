import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * GET /api/itinerarios-completos — Fetch all day-by-day itinerary entries for Completo from Wix CMS "Itinerariosdecompletos"
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
            .query('Itinerariosdecompletos')
            .limit(100)
            .find()

        allItems.push(...(result.items || []))

        while (result.hasNext && result.hasNext()) {
            result = await result.next()
            allItems.push(...(result.items || []))
        }

        const formatted = allItems.map(it => {
            const dayNum = typeof it.da1 === 'number' ? it.da1 : parseInt(it.da1 || it.dia || it.day || '1', 10)
            return {
                id: it._id,
                temporada: it.temporada || '',
                tipoDePase: it.tipoDePase || '',
                day: dayNum,
                title: it.tituloDeDa || it.title || `Día ${dayNum}`,
                desc: it.excerptDeDa || '',
                icon: it.emojiGrande || '⛩️',
                categoria: it.categora || 'Japón Completo',
            }
        })

        // Sort by day ascending
        formatted.sort((a, b) => a.day - b.day)

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
        res.status(200).json({ itinerarios: formatted })
    } catch (error) {
        console.error('[ItinerariosCompletos API] Error:', error.message)
        res.status(500).json({ itinerarios: [], error: error.message })
    }
}
