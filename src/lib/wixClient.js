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
 * Submit a form entry to Wix CMS collection "cmsformulario" (Contact page)
 */
export async function submitFormToCMS(data) {
    try {
        const result = await wixClient.items.insertDataItem({
            dataCollectionId: 'cmsformulario',
            dataItem: {
                data: {
                    nombre: data.nombre,
                    telefono: data.telefono,
                    email: data.email,
                    estado: data.estado,
                    viaje: data.viaje,
                    mensaje: data.mensaje,
                    origen: data.origen,
                    fuente: 'SW - Contacto',
                    fecha: new Date().toISOString(),
                },
            },
        })
        return { success: true, id: result?.dataItem?._id }
    } catch (error) {
        console.error('Error submitting to Wix CMS:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Submit popup lead to Wix CMS collection "Popup"
 */
export async function submitPopupToCMS(data) {
    try {
        const result = await wixClient.items.insertDataItem({
            dataCollectionId: 'Popup',
            dataItem: {
                data: {
                    nombre: data.nombre,
                    correo: data.correo,
                    telefono: data.telefono,
                    estado: data.estado,
                    viajeDeInteres: data.viajeDeInteres,
                    fuente: 'SW - Popup Descuento',
                    fecha: new Date().toISOString(),
                },
            },
        })
        return { success: true, id: result?.dataItem?._id }
    } catch (error) {
        console.error('Error submitting popup to Wix CMS:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Fetch a city landing page from Wix CMS collection "LandingsdeCiudad" by slug
 */
export async function fetchCityLanding(slug) {
    try {
        const result = await wixClient.items.queryDataItems({
            dataCollectionId: 'LandingsdeCiudad',
        }).eq('slug', slug).find()

        if (!result.items || result.items.length === 0) return null
        return result.items[0].data
    } catch (error) {
        console.error('Error fetching city landing:', error)
        return null
    }
}

export default wixClient

/**
 * Fetch all published blog posts via our server-side API (avoids CORS).
 */
export async function fetchBlogPosts() {
    try {
        const res = await fetch('/api/blog')
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const data = await res.json()
        // Return the full response: { posts: [...], categories: [...] }
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
