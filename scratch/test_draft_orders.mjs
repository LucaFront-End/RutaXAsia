import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { draftOrders } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'
const originUrl = process.env.VITE_SITE_ORIGIN || 'https://www.rutaxasia.com'

const wixClient = createClient({
    modules: { draftOrders },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING DRAFT ORDERS FOR CHECKOUT LINK ===')

    try {
        const draft = await wixClient.draftOrders.createDraftOrder({
            draftOrder: {
                lineItems: [
                    {
                        catalogReference: {
                            appId: WIX_STORES_APP_ID,
                            catalogItemId: productId,
                        },
                        quantity: 1,
                    }
                ]
            }
        })

        console.log('Draft Order Created! ID:', draft._id || draft.id)
        console.log('Draft Order Full Object:', JSON.stringify(draft, null, 2))

    } catch (e) {
        console.error('Draft Order Error:', e.message)
    }
}

run()
