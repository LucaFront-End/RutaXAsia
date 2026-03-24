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
 * Submit a form entry to Wix CMS collection "cmsformulario"
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
                    ciudad: data.ciudad,
                    estado: data.estado,
                    fuente: 'SW - Popup Descuento',
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

export default wixClient

/**
 * Fetch all published blog posts via our server-side API (avoids CORS).
 */
export async function fetchBlogPosts() {
    try {
        const res = await fetch('/api/blog')
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const data = await res.json()
        return data.posts || []
    } catch (error) {
        console.error('[Blog] Error fetching posts:', error.message)
        return []
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
