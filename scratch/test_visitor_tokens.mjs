import { createClient, ApiKeyStrategy, OAuthStrategy } from '@wix/sdk'
import { checkout, currentCart } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'
const originUrl = process.env.VITE_SITE_ORIGIN || 'https://www.rutaxasia.com'

async function run() {
    console.log('=== TESTING API KEY CLIENT FOR CURRENT CART ===')

    const clientIds = [
        'a8ce3367-b4c4-40a0-8905-1e6aa606b654',
        '0cb520e0-6541-43f6-acea-75945df5bbfc',
        'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
    ]

    for (const cid of clientIds) {
        try {
            console.log(`\nTesting OAuth clientId: ${cid}`)
            const wixClient = createClient({
                modules: { currentCart, checkout },
                auth: OAuthStrategy({ clientId: cid }),
            })
            const tokens = await wixClient.auth.generateVisitorTokens()
            console.log(`OAuth ${cid} visitor tokens generated!`)
            wixClient.auth.setTokens(tokens)

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
            console.log('Cart created:', cartRes.cart._id, '| lineItems:', cartRes.cart.lineItems?.length)

            const chkRes = await wixClient.currentCart.createCheckoutFromCurrentCart({
                channelType: 'WEB'
            })
            console.log('Checkout ID:', chkRes.checkoutId)
            const url = `${wixBaseDomain}/__ecom/checkout?checkoutId=${chkRes.checkoutId}&origin=${encodeURIComponent(originUrl)}`
            console.log('🎉 🎉 🎉 WORKING CHECKOUT URL:', url)
            break
        } catch (e) {
            console.log(`OAuth ${cid} error:`, e.message)
        }
    }
}

run()
