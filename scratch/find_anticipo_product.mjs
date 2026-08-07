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
    console.log('=== SEARCHING FOR ANTICIPO PRODUCT IN StoreCatalog/Products ===')
    try {
        const res = await wixClient.items.query('StoreCatalog/Products').find()
        console.log(`Found ${res.items.length} total products in StoreCatalog/Products:`)
        res.items.forEach(p => {
            console.log({
                id: p._id,
                name: p.name,
                slug: p.slug,
                url: p.url,
                price: p.actualPriceRange || p.priceData,
                visible: p.visible
            })
        })
    } catch (e) {
        console.error('Error querying StoreCatalog/Products:', e.message)
    }
}

run()
