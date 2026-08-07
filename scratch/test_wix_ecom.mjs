import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { currentCart } from '@wix/ecom'
import { redirects } from '@wix/redirects'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

const wixClient = createClient({
    modules: { currentCart, redirects },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== CREATING WIX STORE CART FOR ANTICIPO ===')
    try {
        // Product ID for "Anticipo" or demo product in store catalog
        // Let's create an item in cart for product 7ef5f127-5e5d-4ebb-9957-d122ce56daec
        const addToCartRes = await wixClient.currentCart.addToCurrentCart({
            lineItems: [
                {
                    catalogReference: {
                        appId: '1380b703-ce81-ff05-f115-39571d94dfd3', // Wix Stores App ID
                        catalogItemId: '7ef5f127-5e5d-4ebb-9957-d122ce56daec',
                    },
                    quantity: 1,
                }
            ]
        })
        console.log('Cart updated:', addToCartRes.cart._id)
        
        // Generate checkout redirect session
        const redirectRes = await wixClient.redirects.createRedirectSession({
            ecomCheckout: { cartId: addToCartRes.cart._id },
            callbacks: {
                postFlowUrl: 'https://www.rutaxasia.com/viajes/japon',
            }
        })
        console.log('Redirect URL:', redirectRes.redirectSession.fullUrl)
    } catch (e) {
        console.log('Cart / Redirect Error:', e.message)
    }
}

run()
