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

function parsePrice(val) {
    if (typeof val === 'number' && !isNaN(val)) return val
    if (!val) return 0
    const cleaned = String(val).replace(/[^0-9.]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
}

function generateSlug(title, id) {
    if (!title) return id || 'tour'
    return String(title)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
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
                priceNum = parsePrice(it.precioEnTexto)
            }

            const priceAnfitrionNum = parsePrice(it.precioAnfitrin) || priceNum || 800
            const priceLocatarioNum = parsePrice(it.tipoDeAnfitrin) || Math.round(priceAnfitrionNum * 1.5)

            const rawCategorias = String(it.categoras || '').toLowerCase()
            const rawTipo = String(it.tipoDeViaje || '').toLowerCase()

            const isEsencial = Boolean(
                it.esenciales === true || it.esencial === true ||
                rawCategorias.includes('esencial') || rawTipo.includes('esencial')
            )
            const isCompleto = Boolean(
                it.completo === true || it.acompanado === true ||
                rawCategorias.includes('completo') || rawCategorias.includes('acompañado') || rawCategorias.includes('acompanado') || rawTipo.includes('completo')
            )
            const isLibre = Boolean(
                it.libre === true ||
                rawCategorias.includes('libre') || rawTipo.includes('libre')
            )
            const isSignature = Boolean(
                it.signature === true || it.vip === true ||
                rawCategorias.includes('signature') || rawCategorias.includes('vip') || rawTipo.includes('signature') || rawTipo.includes('vip')
            )

            const pageTitle = it.tituloDePgina || it.title || 'Tour Individual'
            const slug = generateSlug(it.title || pageTitle, it._id)
            const shortDesc = it.descripcinAmplia || it.descripcionCorta || it.excerptDeTour || it.excerpt || ''
            const fullDesc = it.descripcinAmplia1 || it.descripcionAmplia || it.descripcinAmplia || it.excerptDeTour || it.excerpt || ''
            const daysVal = it.dasDeViaje || it.diasDeViaje || ''
            const hoursVal = it.horasDeViaje || ''
            const durationLabel = (daysVal && hoursVal) ? `${daysVal} (${hoursVal})` : (daysVal || hoursVal || '1 día')
            let cityVal = it.ciudad || it.city || it.ciudades || it.location || ''
            if (!cityVal) {
                const rawCityLookup = `${it.title || ''} ${pageTitle}`.toLowerCase()
                if (rawCityLookup.includes('tokyo') || rawCityLookup.includes('tokio')) cityVal = 'Tokio'
                else if (rawCityLookup.includes('osaka')) cityVal = 'Osaka'
                else if (rawCityLookup.includes('kyoto') || rawCityLookup.includes('kioto')) cityVal = 'Kioto'
                else if (rawCityLookup.includes('hiroshima')) cityVal = 'Hiroshima'
                else if (rawCityLookup.includes('takayama')) cityVal = 'Takayama'
                else if (rawCityLookup.includes('kanazawa')) cityVal = 'Kanazawa'
                else if (rawCityLookup.includes('fuji') || rawCityLookup.includes('hakone')) cityVal = 'Monte Fuji'
                else if (rawCityLookup.includes('kamakura')) cityVal = 'Kamakura'
                else if (rawCityLookup.includes('nikko')) cityVal = 'Nikko'
                else if (rawCityLookup.includes('nara')) cityVal = 'Nara'
                else cityVal = 'Japón'
            }
            const whatsappCustomUrl = it.whatsapp || it.urlWhatsapp || it.linkWhatsapp || it.enlaceWhatsapp || it.whatsappUrl || ''

            const rawAparece = String(it.apareceEnLista || '').trim().toLowerCase()
            const apareceEnLista = Boolean(
                rawAparece === 'sí' ||
                rawAparece === 'si' ||
                rawAparece === 'true' ||
                rawAparece === 'yes' ||
                rawAparece === '1' ||
                it.apareceEnLista === true
            )

            return {
                id: it._id,
                slug: slug,
                title: pageTitle,
                rawTitle: it.title || '',
                tituloDePgina: pageTitle,
                excerpt: it.excerptDeTour || it.excerpt || '',
                shortDescription: shortDesc,
                fullDescription: fullDesc,
                descripcinAmplia: it.descripcinAmplia || '',
                descripcinAmplia1: it.descripcinAmplia1 || '',
                description: fullDesc || shortDesc || '',
                image: formatWixImageUrl(it.image),
                priceText: it.precioEnTexto || (priceNum > 0 ? `$${priceNum.toLocaleString('es-MX')} MXN` : ''),
                priceNum: priceNum || priceAnfitrionNum,
                priceAnfitrion: it.precioAnfitrin || `$${priceAnfitrionNum.toLocaleString('es-MX')} MXN`,
                priceAnfitrionNum: priceAnfitrionNum,
                priceLocatario: it.tipoDeAnfitrin || `$${priceLocatarioNum.toLocaleString('es-MX')} MXN`,
                priceLocatarioNum: priceLocatarioNum,
                days: daysVal,
                hours: hoursVal,
                durationLabel: durationLabel,
                city: cityVal,
                observations: it.observaciones || it.notas || '',
                observaciones: it.observaciones || it.notas || '',
                category: category,
                rawCategory: rawCat,
                categorias: it.categoras || '',
                cmsLink: it['link-tour-individuales-title'] || '',
                whatsappUrl: whatsappCustomUrl,
                apareceEnLista: apareceEnLista,
                rawApareceEnLista: it.apareceEnLista || '',
                esencial: isEsencial,
                completo: isCompleto,
                libre: isLibre,
                signature: isSignature,
            }
        })

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
        res.status(200).json({ tours: formattedTours })
    } catch (error) {
        console.error('[TourIndividuales API] Error:', error.message)
        res.status(500).json({ tours: [], error: error.message })
    }
}
