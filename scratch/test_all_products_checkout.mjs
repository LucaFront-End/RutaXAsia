import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'

const wixClient = createClient({
    modules: { items },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING ALL PRODUCTS FOR CHECKOUT LINE ITEM CREATION ===')
    const prods = await wixClient.items.query('StoreCatalog/Products').find()
    console.log(`Found ${prods.items.length} products. Testing each...`)

    for (const p of prods.items) {
        try {
            const res = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                    'wix-site-id': siteId,
                },
                body: JSON.stringify({
                    channelType: 'WEB',
                    lineItems: [
                        {
                            catalogReference: {
                                appId: WIX_STORES_APP_ID,
                                catalogItemId: p._id,
                            },
                            quantity: 1
                        }
                    ]
                })
            })
            const data = await res.json()
            const count = data.checkout?.lineItems?.length || 0
            console.log(`Product "${p.name}" (ID: ${p._id}) -> lineItems: ${count}`)
            if (count > 0) {
                console.log('SUCCESS FOR PRODUCT:', p.name, data.checkout)
                break
            }
        } catch (e) {
            console.log(`Product ${p.name} error:`, e.message)
        }
    }
}

run()
