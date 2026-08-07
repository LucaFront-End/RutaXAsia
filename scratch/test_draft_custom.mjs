import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { draftOrders } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const variantId = 'd76c675d-5323-46f5-9ff4-057c22a09258'

const wixClient = createClient({
    modules: { draftOrders },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING DRAFT ORDER CUSTOM LINE ITEMS ===')

    try {
        const draft = await wixClient.draftOrders.createDraftOrder({
            draftOrder: {
                lineItems: [
                    {
                        productName: { original: 'Anticipo de Viaje - $5,000 MXN' },
                        itemType: { custom: {} },
                        price: { amount: '5000' },
                        quantity: 1,
                        catalogReference: {
                            appId: WIX_STORES_APP_ID,
                            catalogItemId: productId,
                            options: { variantId: variantId }
                        }
                    }
                ]
            }
        })

        const item = draft.calculatedDraftOrder?.draftOrder?.lineItems
        console.log('Line Items:', JSON.stringify(item, null, 2))

    } catch (e) {
        console.error('Error:', e.message)
    }
}

run()
