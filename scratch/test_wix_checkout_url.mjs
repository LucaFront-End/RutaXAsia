import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { checkout } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'

const wixClient = createClient({
    modules: { checkout },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== CREATING WIX STORE CHECKOUT ID & CONSTRUCTING URL ===')
    try {
        // Query demo product or anticipo product ID (e.g. 7ef5f127-5e5d-4ebb-9957-d122ce56daec)
        const createCheckoutRes = await wixClient.checkout.createCheckout({
            lineItems: [
                {
                    catalogReference: {
                        appId: '1380b703-ce81-ff05-f115-39571d94dfd3', // Wix Stores App ID
                        catalogItemId: '7ef5f127-5e5d-4ebb-9957-d122ce56daec',
                    },
                    quantity: 1,
                }
            ],
            channelType: 'WEB',
        })

        const checkoutId = createCheckoutRes._id
        console.log('Generated Checkout ID:', checkoutId)

        const checkoutUrl = `${wixBaseDomain}/__ecom/checkout?checkoutId=${checkoutId}&origin=${encodeURIComponent('https://www.rutaxasia.com')}`
        console.log('Constructed Full Wix Checkout URL:', checkoutUrl)
    } catch (e) {
        console.error('Error creating checkout:', e.message)
    }
}

run()
