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
 * @param {{ nombre: string, email: string }} data
 */
export async function submitFormToCMS(data) {
    try {
        const result = await wixClient.items.insertDataItem({
            dataCollectionId: 'cmsformulario',
            dataItem: {
                data: {
                    nombre: data.nombre,
                    email: data.email,
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
