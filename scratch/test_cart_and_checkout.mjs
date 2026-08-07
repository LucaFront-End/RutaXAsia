import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { cart, checkout } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const variantId = 'd76c675d-5323-46f5-9ff4-057c22a09258'

const wixClient = createClient({
    modules: { cart, checkout },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING SDK cart.createCart AND cart.createCheckout ===')

    // Test 1: cart.createCart with lineItems
    try {
        console.log('\n--- Test 1: cart.createCart ---')
        const newCart = await wixClient.cart.createCart({
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: productId,
                        options: { variantId: variantId }
                    },
                    quantity: 1
                }
            ]
        })
        console.log('Created Cart ID:', newCart._id, '| lineItems:', newCart.lineItems?.length)
        
        if (newCart._id) {
            // Create checkout from this cart
            const chk = await wixClient.cart.createCheckout(newCart._id, { channelType: 'WEB' })
            console.log('Created Checkout ID from cart:', chk.checkoutId)
            console.log('Line items in checkout:', chk.checkout?.lineItems?.length)
            
            const checkoutUrl = `https://dilodigitalmx.wixsite.com/rutaxasia/__ecom/checkout?checkoutId=${chk.checkoutId}&origin=https%3A%2F%2Fwww.rutaxasia.com`
            console.log('🎉 CHECKOUT URL:', checkoutUrl)
        }
    } catch (e) {
        console.error('Test 1 Error:', e.message, e)
    }

    // Test 2: checkout.addToCheckout
    try {
        console.log('\n--- Test 2: checkout.createCheckout + checkout.addToCheckout ---')
        const emptyChk = await wixClient.checkout.createCheckout({ channelType: 'WEB' })
        console.log('Empty checkout created ID:', emptyChk._id)

        const updatedChk = await wixClient.checkout.addToCheckout(emptyChk._id, {
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: productId,
                        options: { variantId: variantId }
                    },
                    quantity: 1
                }
            ]
        })
        console.log('Updated checkout lineItems:', updatedChk.checkout?.lineItems?.length)
    } catch (e) {
        console.error('Test 2 Error:', e.message)
    }
}

run()
