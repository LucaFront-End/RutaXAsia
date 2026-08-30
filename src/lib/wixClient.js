import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

const wixClient = createClient({
    modules: { items },
    auth: ApiKeyStrategy({
        siteId: import.meta.env.VITE_WIX_SITE_ID,
        apiKey: import.meta.env.VITE_WIX_API_KEY,
    }),
})

/**
 * Submit a form entry to Wix CMS collection "Popup" via backend endpoint (Contact page)
 */
export async function submitFormToCMS(data) {
    try {
        const response = await fetch('/api/popup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: data.nombre,
                telefono: data.telefono,
                correo: data.email || data.correo,
                estado: data.estado || '',
                viaje: data.viaje || data.viajeDeInteres || '',
                mensaje: data.mensaje || (data.origen ? `Origen: ${data.origen}` : ''),
            }),
        })
        const result = await response.json()
        return result
    } catch (error) {
        console.error('Error submitting to Wix CMS via /api/popup:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Submit popup lead via server-side API (more reliable than client-side).
 * POST /api/popup
 *
 * CMS Collection: "Popup"
 * Field mapping (CSV column → field key):
 *   Correo           → title_fld
 *   Nombre           → nombre
 *   Teléfono         → telfono
 *   Estado           → ciudad
 *   Viaje de interes → viajeDeInteres
 *   Mensaje          → mensaje
 */
export async function submitPopupToCMS(data) {
    try {
        const response = await fetch('/api/popup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: data.nombre,
                telefono: data.telefono,
                correo: data.correo,
                estado: data.estado || '',
                viaje: data.viajeDeInteres,
                mensaje: data.mensaje || '',
            }),
        })
        const result = await response.json()
        if (!result.success) {
            console.error('[Popup] Server returned error:', result.error)
        }
        return result
    } catch (error) {
        console.error('Error submitting popup:', error)
        return { success: false, error: error.message }
    }
}

export default wixClient

/**
 * Fetch all published landings from our server-side API.
 * Used by Zonas hub, Footer, and dynamic navigation.
 */
export async function fetchAllLandings() {
    try {
        const res = await fetch('/api/landings')
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const data = await res.json()
        return data.landings || []
    } catch (error) {
        console.error('[Landings] Error fetching landings:', error.message)
        return []
    }
}

/**
 * Fetch all published blog posts via our server-side API (avoids CORS).
 */
export async function fetchBlogPosts() {
    try {
        const res = await fetch('/api/blog')
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const data = await res.json()
        return { posts: data.posts || [], categories: data.categories || [] }
    } catch (error) {
        console.error('[Blog] Error fetching posts:', error.message)
        return { posts: [], categories: [] }
    }
}

/**
 * Fetch a single blog post by slug via our server-side API (avoids CORS).
 */
export async function fetchBlogPostBySlug(slug) {
    try {
        const res = await fetch(`/api/blog-post?slug=${encodeURIComponent(slug)}`)
        if (res.status === 404) return null
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const data = await res.json()
        return data.post || null
    } catch (error) {
        console.error('[Blog] Error fetching post:', error.message)
        return null
    }
}

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

function mapCmsTour(it) {
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

    const pageTitle = it.tituloDePgina || it.tituloDePagina || it.pageTitle || it.titulo || it.title || 'Tour Individual'
    const rawSlug = it.slug || it.urlSlug || it.pageSlug || it['link-tour-individuales-title'] || ''
    const slug = rawSlug
        ? (String(rawSlug).startsWith('/') ? String(rawSlug).replace(/^\/|\/$/g, '').split('/').pop() : generateSlug(rawSlug))
        : generateSlug(it.title || pageTitle, it._id)

    const seoTitle = it.tituloSeo || it.seoTitle || it.titleSeo || it.metaTitle || it.seo_title || it.tituloDePgina || it.title || pageTitle
    const seoDescription = it.descripcionSeo || it.seoDescription || it.metaDescription || it.seoDesc || it.seo_description || it.descripcinAmplia || it.excerptDeTour || it.excerpt || ''

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
        seoTitle: seoTitle,
        seoDescription: seoDescription,
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
}

/**
 * Fetch all TourIndividuales from Wix CMS via /api/tours-individuales (with direct SDK fallback)
 */
export async function fetchTourIndividuales() {
    try {
        const res = await fetch('/api/tours-individuales')
        if (res.ok) {
            const data = await res.json()
            if (data && Array.isArray(data.tours) && data.tours.length > 0) {
                return data.tours
            }
        }
    } catch (e) {
        // Fall back to direct query
    }

    try {
        let allItems = []
        let result = await wixClient.items.query('TourIndividuales').limit(50).find()
        allItems.push(...(result.items || []))
        while (result.hasNext && result.hasNext()) {
            result = await result.next()
            allItems.push(...(result.items || []))
        }
        return allItems.map(mapCmsTour)
    } catch (error) {
        console.error('[TourIndividuales] Error fetching tours:', error.message)
        return []
    }
}

/**
 * Fetch all PreciosporCategoriasydias from Wix CMS via /api/precios-categorias-dias (with direct SDK fallback)
 */
export async function fetchPreciosCategoriasDias() {
    try {
        const res = await fetch('/api/precios-categorias-dias')
        if (res.ok) {
            const data = await res.json()
            if (data && Array.isArray(data.prices) && data.prices.length > 0) {
                return data.prices
            }
        }
    } catch (e) {
        // Fall back
    }

    try {
        let allItems = []
        let result = await wixClient.items.query('PreciosporCategoriasydias').limit(50).find()
        allItems.push(...(result.items || []))
        while (result.hasNext && result.hasNext()) {
            result = await result.next()
            allItems.push(...(result.items || []))
        }
        return allItems.map(it => ({
            id: it._id,
            categoria: it.title || it.categoria || '',
            temporada: it.temporada || '',
            dias: it.dias || '',
            noches: it.noches || '',
            diasYNochesCompletos: it.diasYNochesCompletos || '',
            precioText: it.precio || '',
            precioNum: parsePrice(it.precio),
            tourGratisQueIncluira: it.tourGratisQueIncluira ? parseInt(String(it.tourGratisQueIncluira).replace(/\D/g, ''), 10) : 0,
            limiteDeTours: it.limiteDeTours ? parseInt(String(it.limiteDeTours).replace(/\D/g, ''), 10) : 0,
            tituloComercial: it.tituloComercial || '',
            fechasDeInicio: it.fechasDeInicio || '',
            fechaEntre: it.fechaEntre || '',
        }))
    } catch (error) {
        console.error('[PreciosCategoriasDias] Error fetching prices:', error.message)
        return []
    }
}

/**
 * Fetch all Itinerariosdecompletos from Wix CMS via /api/itinerarios-completos (with direct SDK fallback)
 */
export async function fetchItinerariosCompletos() {
    try {
        const res = await fetch('/api/itinerarios-completos')
        if (res.ok) {
            const data = await res.json()
            if (data && Array.isArray(data.itinerarios) && data.itinerarios.length > 0) {
                return data.itinerarios
            }
        }
    } catch (e) {
        // Fall back
    }

    try {
        let allItems = []
        let result = await wixClient.items.query('Itinerariosdecompletos').limit(50).find()
        allItems.push(...(result.items || []))
        while (result.hasNext && result.hasNext()) {
            result = await result.next()
            allItems.push(...(result.items || []))
        }
        return allItems
    } catch (error) {
        console.error('[ItinerariosCompletos] Error fetching itineraries:', error.message)
        return []
    }
}
