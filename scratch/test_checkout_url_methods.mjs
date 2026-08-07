import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { checkout } from '@wix/ecom'
import { redirects } from '@wix/redirects'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

const wixClient = createClient({
    modules: { checkout, redirects },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING CHECKOUT URL HELPERS ===')

    try {
        const session = await wixClient.checkout.createCheckout({
            channelType: 'WEB',
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: productId,
                    },
                    quantity: 1
                }
            ]
        })
        console.log('Checkout ID:', session._id)

        // Method 1: redirects.createRedirectSession
        try {
            const red = await wixClient.redirects.createRedirectSession({
                ecomCheckout: { checkoutId: session._id },
                callbacks: { postFlowUrl: 'https://www.rutaxasia.com' }
            })
            console.log('Redirect Session fullUrl:', red.redirectSession.fullUrl)
        } catch (rErr) {
            console.log('Redirect session error:', rErr.message)
        }
    } catch (e) {
        console.error('Error:', e.message)
    }
}

run()
