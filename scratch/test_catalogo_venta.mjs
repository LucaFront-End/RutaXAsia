import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

const wixClient = createClient({
    modules: { items },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('Querying Wix CMS collections for Catálogo de Venta...')
    
    // Try querying common collection ID variations
    const possibleIds = [
        'CatalogodeVenta',
        'Catalogodeventa',
        'CatlogodeVenta',
        'catlogodeventa',
        'catalogodeventa',
        'CatalogoDeVenta',
        'Catálogo de Venta'
    ]

    for (const collId of possibleIds) {
        try {
            const res = await wixClient.items.query(collId).limit(10).find()
            if (res.items && res.items.length > 0) {
                console.log(`\n✅ FOUND COLLECTION MATCH: "${collId}" with ${res.items.length} items!`)
                console.log('Item sample fields:', Object.keys(res.items[0]))
                console.log('First item full content:', JSON.stringify(res.items[0], null, 2))
                return
            }
        } catch (e) {
            // collection ID not found under this name
        }
    }

    // If exact name didn't match, let's list data collections via data API or query system collections
    console.log('Trying to list all collections...')
    try {
        const queryRes = await wixClient.items.query('Stores/Products').limit(5).find()
        console.log('Stores/Products count:', queryRes.items.length)
    } catch (e) {
        console.log('Stores/Products query error:', e.message)
    }
}

run().catch(console.error)
