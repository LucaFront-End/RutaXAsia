import { createClient, OAuthStrategy } from '@wix/sdk'
import { checkout, currentCart } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

// Client ID for Wix Headless or site ID
const clientId = process.env.VITE_WIX_CLIENT_ID || '0cb520e0-6541-43f6-acea-75945df5bbfc'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'
const originUrl = process.env.VITE_SITE_ORIGIN || 'https://www.rutaxasia.com'

async function run() {
    console.log('=== TESTING OAUTH STRATEGY WITH CLIENT ID ===')
    console.log('Client ID:', clientId)

    try {
        const wixClient = createClient({
            modules: { currentCart, checkout },
            auth: OAuthStrategy({ clientId }),
        })

        // Generate visitor tokens
        const tokens = await wixClient.auth.generateVisitorTokens()
        wixClient.auth.setTokens(tokens)
        console.log('Generated visitor tokens successfully.')

        // Add item to cart
        const cartRes = await wixClient.currentCart.addToCurrentCart({
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: productId,
                    },
                    quantity: 1,
                }
            ]
        })

        console.log('✅ Added to Cart! Cart ID:', cartRes.cart._id, '| lineItems:', cartRes.cart.lineItems?.length)

        // Create checkout from current cart
        const chkRes = await wixClient.currentCart.createCheckoutFromCurrentCart({
            channelType: 'WEB'
        })

        const checkoutId = chkRes.checkoutId
        console.log('✅ Created Checkout! Checkout ID:', checkoutId)

        const checkoutUrl = `${wixBaseDomain}/__ecom/checkout?checkoutId=${checkoutId}&origin=${encodeURIComponent(originUrl)}`
        console.log('\n🎉 🎉 🎉 SUCCESS! WORKING CHECKOUT URL 🎉 🎉 🎉')
        console.log(checkoutUrl)

    } catch (e) {
        console.error('OAuth Strategy error:', e.message)
        console.error(JSON.stringify(e, null, 2))
    }
}

run()
