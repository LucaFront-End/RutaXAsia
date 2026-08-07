import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { checkout } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const anticipoProductId = process.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'
const originUrl = process.env.VITE_SITE_ORIGIN || 'https://www.rutaxasia.com'

const wixClient = createClient({
    modules: { checkout },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== CREATING ANTICIPO CHECKOUT SESSION ===')
    console.log('Product ID:', anticipoProductId)
    try {
        const checkoutSession = await wixClient.checkout.createCheckout({
            channelType: 'WEB',
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: anticipoProductId,
                    },
                    quantity: 1,
                }
            ],
        })

        const checkoutId = checkoutSession._id
        const checkoutUrl = `${wixBaseDomain}/__ecom/checkout?checkoutId=${checkoutId}&origin=${encodeURIComponent(originUrl)}`

        console.log('✅ Checkout ID:', checkoutId)
        console.log('✅ Full Checkout URL:', checkoutUrl)
        console.log('\nLine items in session:', JSON.stringify(checkoutSession.lineItems, null, 2))
    } catch (e) {
        console.error('❌ Error creating checkout:', e.message)
        console.error('Full error:', JSON.stringify(e, null, 2))
    }
}

run()
