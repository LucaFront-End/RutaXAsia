import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { collections } from '@wix/data'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

const wixClient = createClient({
    modules: { collections },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    try {
        console.log('Listing collection schemas...')
        const res = await wixClient.collections.listDataCollections()
        console.log('Collections list:', res.collections.map(c => ({ id: c._id, displayName: c.displayName, pluginType: c.pluginType })))
    } catch (e) {
        console.error('Error listing collections:', e.message)
    }
}

run()
