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
    console.log('Querying StoreCatalog/Products...')
    try {
        const res = await wixClient.items.query('StoreCatalog/Products').limit(10).find()
        console.log('Total Products in StoreCatalog/Products:', res.items.length)
        res.items.forEach(p => {
            console.log('---')
            console.log('ID:', p._id)
            console.log('Name:', p.name || p.title)
            console.log('Price:', p.price || p.priceData)
            console.log('ProductType:', p.productType)
            console.log('All Keys:', Object.keys(p))
            console.log('Full Item:', JSON.stringify(p, null, 2))
        })
    } catch (e) {
        console.log('Error querying StoreCatalog/Products:', e.message)
    }
}

run().catch(console.error)
