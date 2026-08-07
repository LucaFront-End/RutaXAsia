import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import { checkout } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const anticipoProductId = process.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const anticipoVariantId = process.env.VITE_WIX_ANTICIPO_VARIANT_ID || 'd76c675d-5323-46f5-9ff4-057c22a09258'
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'
const originUrl = process.env.VITE_SITE_ORIGIN || 'https://www.rutaxasia.com'

const wixClient = createClient({
    modules: { items, checkout },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    // 1. Check product visibility
    console.log('=== CHECK PRODUCT VISIBILITY ===')
    const res = await wixClient.items.query('StoreCatalog/Products').eq('_id', anticipoProductId).find()
    if (res.items.length > 0) {
        const p = res.items[0]
        console.log(`Name: "${p.name}" | Visible: ${p.visible} | VisibleInPos: ${p.visibleInPos} | Type: ${p.productType}`)
    }

    // 2. Try building URL pointing to checkout read the session
    console.log('\n=== CHECKOUT SESSION (fetch directly) ===')
    try {
        const session = await wixClient.checkout.createCheckout({
            channelType: 'WEB',
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: anticipoProductId,
                        options: { variantId: anticipoVariantId },
                    },
                    quantity: 1,
                }
            ],
        })
        console.log('Full session object keys:', Object.keys(session))
        console.log('lineItems raw:', JSON.stringify(session.lineItems))
        console.log('Checkout URL:', `${wixBaseDomain}/__ecom/checkout?checkoutId=${session._id}&origin=${encodeURIComponent(originUrl)}`)
        
        // 3. Now try to get the checkout session by ID to see full state
        const getSession = await wixClient.checkout.getCheckout(session._id)
        console.log('\n=== GET SESSION (by ID) ===')
        console.log('lineItems after get:', JSON.stringify(getSession.lineItems, null, 2))
        console.log('Status:', getSession.status)
    } catch (e) {
        console.error('Error:', e.message)
    }
}

run()
