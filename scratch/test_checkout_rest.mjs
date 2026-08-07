import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const variantId = 'd76c675d-5323-46f5-9ff4-057c22a09258'

async function run() {
    console.log('=== TESTING WIX ECOM REST APIS FOR createCheckout ===')

    // Test A: Create checkout with channelType at root of checkout object
    try {
        const resA = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'wix-site-id': siteId,
            },
            body: JSON.stringify({
                checkout: {
                    channelType: 'WEB',
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
                }
            })
        })
        const dataA = await resA.json()
        console.log('Test A Response:', JSON.stringify(dataA, null, 2))
    } catch (e) {
        console.error('Test A Error:', e.message)
    }

    // Test B: Create cart first via REST, then create checkout from cart
    try {
        console.log('\n--- Test B: Create Cart then Checkout ---')
        const createCartRes = await fetch('https://www.wixapis.com/ecom/v1/carts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'wix-site-id': siteId,
            },
            body: JSON.stringify({
                cart: {
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
                }
            })
        })
        const cartData = await createCartRes.json()
        console.log('Cart Data:', JSON.stringify(cartData, null, 2))

        if (cartData?.cart?._id) {
            const cartId = cartData.cart._id
            console.log('Created Cart ID:', cartId)

            const chkRes = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                    'wix-site-id': siteId,
                },
                body: JSON.stringify({
                    checkout: {
                        cartId: cartId,
                        channelType: 'WEB'
                    }
                })
            })
            const chkData = await chkRes.json()
            console.log('Checkout Data from Cart:', JSON.stringify(chkData, null, 2))
            
            if (chkData?.checkout?._id) {
                console.log(`\n🎉 WORKING CHECKOUT URL: https://dilodigitalmx.wixsite.com/rutaxasia/__ecom/checkout?checkoutId=${chkData.checkout._id}&origin=https%3A%2F%2Fwww.rutaxasia.com`)
            }
        }
    } catch (e) {
        console.error('Test B Error:', e.message)
    }
}

run()
