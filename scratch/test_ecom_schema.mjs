import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const variantId = 'd76c675d-5323-46f5-9ff4-057c22a09258'

async function run() {
    console.log('=== TESTING SCHEMA VARIATIONS FOR ECOM CHECKOUT ===')

    // Variation 1: Root level fields
    try {
        const res1 = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'wix-site-id': siteId,
            },
            body: JSON.stringify({
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
            })
        })
        const data1 = await res1.json()
        console.log('Variation 1 (Root fields):', JSON.stringify(data1, null, 2))
    } catch (e) {
        console.error('Var 1 error:', e.message)
    }

    // Variation 2: Create Cart via POST /ecom/v1/carts
    try {
        console.log('\n--- Variation 2: POST /ecom/v1/carts ---')
        const res2 = await fetch('https://www.wixapis.com/ecom/v1/carts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'wix-site-id': siteId,
            },
            body: JSON.stringify({
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
        })
        const data2 = await res2.json()
        console.log('Variation 2 (Create Cart):', JSON.stringify(data2, null, 2))
    } catch (e) {
        console.error('Var 2 error:', e.message)
    }
}

run()
