import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * GET /api/precios-categorias-dias — Fetch all package pricing by season, duration, and category from Wix CMS
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
                siteId: process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b',
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        })

        let allItems = []
        let result = await wixClient.items
            .query('PreciosporCategoriasydias')
            .limit(100)
            .find()

        allItems.push(...(result.items || []))

        while (result.hasNext && result.hasNext()) {
            result = await result.next()
            allItems.push(...(result.items || []))
        }

        const formattedPrices = allItems.map(it => {
            let priceNum = typeof it.precioConNmero === 'number' ? it.precioConNmero : 0
            if (!priceNum && it.precioConDatos) {
                const cleaned = String(it.precioConDatos).replace(/[^0-9.]/g, '')
                const parsed = parseFloat(cleaned)
                if (!isNaN(parsed)) priceNum = parsed
            }

            const limiteDeToursVal = typeof it.lmiteDeTours === 'number'
                ? it.lmiteDeTours
                : (parseInt(it.lmiteDeTours || it.limiteDeTours) || 0)

            return {
                id: it._id,
                title: it.title || '',
                tituloComercial: it.tituloComercial || 'PASE',
                categoria: it.categora || '',
                temporada: it.temporada || '',
                dias: it.das || '',
                noches: it.noches || '',
                diasYNochesCompletos: it.dasYNochesCompletos || `${it.das || ''} ${it.noches || ''}`.trim(),
                precioNum: priceNum,
                precioText: it.precioConDatos || (priceNum ? `$${priceNum.toLocaleString('es-MX')}` : 'Consultar'),
                tourGratisQueIncluira: typeof it.tourGratisQueIncluira === 'number' ? it.tourGratisQueIncluira : (parseInt(it.tourGratisQueIncluira) || 0),
                limiteDeTours: limiteDeToursVal,
                fechasDeInicio: it.fechasDeInicio || '',
                fechaEntre: it.fechaEntre || '',
                flotanteDescriptivo: it.flotanteDescriptivo || 'Precio por persona en cupo doble',
            }
        })

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
        res.status(200).json({ prices: formattedPrices })
    } catch (error) {
        console.error('[Precios API] Error:', error.message)
        res.status(500).json({ prices: [], error: error.message })
    }
}
