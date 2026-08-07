import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

console.log('Using siteId:', siteId)

const wixClient = createClient({
    modules: { items },
    auth: ApiKeyStrategy({
        siteId,
        apiKey,
    }),
})

async function run() {
    try {
        const result = await wixClient.items
            .query('PreciosporCategoriasydias')
            .limit(100)
            .find()

        console.log('Total items in PreciosporCategoriasydias:', result.items.length)
        if (result.items.length > 0) {
            console.log('Sample item keys:', Object.keys(result.items[0]))
            console.log('Sample item:', JSON.stringify(result.items[0], null, 2))
        }

        console.log('\n--- ALL ITEMS ---')
        result.items.forEach((item, index) => {
            console.log(`\n[Item ${index + 1}] ID: ${item._id}`)
            console.log(JSON.stringify(item, null, 2))
        })
    } catch (err) {
        console.error('Error querying PreciosporCategoriasydias:', err)
    }
}

run()
