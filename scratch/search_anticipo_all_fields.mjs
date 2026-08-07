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
    console.log('=== SEARCHING ALL CMS COLLECTIONS FOR ANTICIPO ===')
    const cols = ['StoreCatalog/Products', 'TourIndividuales', 'PreciosporCategoriasydias', 'ComplementosExtras']
    for (const col of cols) {
        try {
            const res = await wixClient.items.query(col).find()
            const matches = res.items.filter(item => JSON.stringify(item).toLowerCase().includes('anticipo'))
            console.log(`Collection [${col}]: Total ${res.items.length} items, Matches for "anticipo": ${matches.length}`)
            if (matches.length > 0) {
                console.log('Matches:', JSON.stringify(matches, null, 2))
            }
        } catch (e) {
            console.log(`Collection [${col}] error:`, e.message)
        }
    }
}

run()
