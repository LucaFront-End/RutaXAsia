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
    console.log('=== INSPECTING ReservasdeViaje ===')
    try {
        const res1 = await wixClient.items.query('ReservasdeViaje').limit(5).find()
        console.log('Total items in ReservasdeViaje:', res1.items.length)
        if (res1.items.length > 0) {
            console.log('Sample item:', JSON.stringify(res1.items[0], null, 2))
        }
    } catch (e) {
        console.error('ReservasdeViaje error:', e.message)
    }

    console.log('\n=== INSPECTING StoreCatalog/Products ===')
    try {
        const res2 = await wixClient.items.query('StoreCatalog/Products').limit(5).find()
        console.log('Total items in StoreCatalog/Products:', res2.items.length)
        if (res2.items.length > 0) {
            console.log('Sample item:', JSON.stringify(res2.items[0], null, 2))
        }
    } catch (e) {
        console.error('StoreCatalog/Products error:', e.message)
    }
}

run()
