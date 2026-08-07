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
    console.log('=== CHECKING ANTICIPO DE VIAJE PRODUCT DATA ===')
    const res = await wixClient.items.query('StoreCatalog/Products').eq('_id', '7f92cc67-8306-4612-bd0f-b95abbdb52e3').find()
    if (res.items.length > 0) {
        const item = res.items[0]
        console.log('Name:', item.name)
        console.log('Slug:', item.slug)
        console.log('URL field from Wix CMS:', item.url)
    }
}

run()
