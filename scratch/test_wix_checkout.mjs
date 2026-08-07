import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { checkout } from '@wix/ecom'
import { redirects } from '@wix/redirects'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

const wixClient = createClient({
    modules: { checkout, redirects },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING WIX CHECKOUT API ===')
    try {
        const createCheckoutRes = await wixClient.checkout.createCheckout({
            lineItems: [
                {
                    catalogReference: {
                        appId: '1380b703-ce81-ff05-f115-39571d94dfd3',
                        catalogItemId: '7ef5f127-5e5d-4ebb-9957-d122ce56daec',
                    },
                    quantity: 1,
                }
            ],
            channelType: 'WEB',
        })
        console.log('Checkout ID:', createCheckoutRes._id)

        const redirectRes = await wixClient.redirects.createRedirectSession({
            ecomCheckout: { checkoutId: createCheckoutRes._id },
            callbacks: {
                postFlowUrl: 'https://www.rutaxasia.com/viajes/japon',
            }
        })
        console.log('Full Redirect URL:', redirectRes.redirectSession.fullUrl)
    } catch (e) {
        console.log('Checkout Error:', e.message)
    }
}

run()
