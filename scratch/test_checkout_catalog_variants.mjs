import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const variantId = 'd76c675d-5323-46f5-9ff4-057c22a09258'

async function run() {
    console.log('=== TESTING CATALOG REFERENCE OPTIONS SCHEMAS ===')

    const testCases = [
        { name: 'options.variantId', options: { variantId: variantId } },
        { name: 'options.options.variantId', options: { options: { variantId: variantId } } },
        { name: 'options.options as object', options: { options: {} } },
        { name: 'options empty', options: {} },
        { name: 'catalogReference with variantId field', catExtra: { variantId: variantId } },
    ]

    for (const tc of testCases) {
        try {
            console.log(`\nTesting case: ${tc.name}`)
            const body = {
                channelType: 'WEB',
                lineItems: [
                    {
                        catalogReference: {
                            appId: WIX_STORES_APP_ID,
                            catalogItemId: productId,
                            ...(tc.options ? { options: tc.options } : {}),
                            ...(tc.catExtra || {})
                        },
                        quantity: 1
                    }
                ]
            }
            const res = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                    'wix-site-id': siteId,
                },
                body: JSON.stringify(body)
            })
            const data = await res.json()
            const items = data.checkout?.lineItems || []
            console.log(`Case "${tc.name}" -> lineItems count: ${items.length}`)
            if (items.length > 0) {
                console.log('🎉 FOUND WORKING PAYLOAD!', JSON.stringify(items, null, 2))
                console.log('Checkout ID:', data.checkout._id || data.checkout.id)
                console.log('URL:', `https://dilodigitalmx.wixsite.com/rutaxasia/__ecom/checkout?checkoutId=${data.checkout._id || data.checkout.id}&origin=https%3A%2F%2Fwww.rutaxasia.com`)
                break
            }
        } catch (e) {
            console.error('Test error:', e.message)
        }
    }
}

run()
