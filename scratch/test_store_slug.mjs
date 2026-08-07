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
    console.log('=== INSPECTING STORE PRODUCTS URLS AND SLUGS ===')
    try {
        const res = await wixClient.items.query('StoreCatalog/Products').find()
        console.log(`Found ${res.items.length} products:`)
        res.items.forEach(p => {
            console.log(`- ID: ${p._id} | Name: "${p.name}" | Slug: "${p.slug}" | URL: "${p.url}"`)
        })
    } catch (e) {
        console.error('Error:', e.message)
    }
}

run()
