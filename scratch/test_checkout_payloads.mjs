import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { checkout } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
const variantId = 'd76c675d-5323-46f5-9ff4-057c22a09258'

const wixClient = createClient({
    modules: { checkout },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING DIFFERENT PAYLOADS FOR createCheckout ===')

    // Payload 1: Basic catalogReference with options
    try {
        console.log('\n--- Payload 1 ---')
        const chk1 = await wixClient.checkout.createCheckout({
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
        console.log('Checkout 1 ID:', chk1._id, '| lineItems count:', chk1.lineItems?.length)
    } catch (e) {
        console.log('Payload 1 error:', e.message)
    }

    // Payload 2: catalogReference with options.options
    try {
        console.log('\n--- Payload 2 ---')
        const chk2 = await wixClient.checkout.createCheckout({
            channelType: 'WEB',
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: productId,
                        options: {
                            options: {
                                variantId: variantId
                            }
                        }
                    },
                    quantity: 1
                }
            ]
        })
        console.log('Checkout 2 ID:', chk2._id, '| lineItems count:', chk2.lineItems?.length)
    } catch (e) {
        console.log('Payload 2 error:', e.message)
    }

    // Payload 3: Direct item with name & price (Custom Line Item)
    try {
        console.log('\n--- Payload 3 (Custom Line Item) ---')
        const chk3 = await wixClient.checkout.createCheckout({
            channelType: 'WEB',
            lineItems: [
                {
                    projectName: 'Anticipo de Viaje',
                    quantity: 1,
                    price: '5000',
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: productId,
                    }
                }
            ]
        })
        console.log('Checkout 3 ID:', chk3._id, '| lineItems count:', chk3.lineItems?.length)
    } catch (e) {
        console.log('Payload 3 error:', e.message)
    }

    // Payload 4: Call raw Wix Ecom REST endpoint for createCheckout
    try {
        console.log('\n--- Payload 4 (Raw REST fetch to Wix Ecom API) ---')
        const rawRes = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
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
        const rawData = await rawRes.json()
        console.log('Raw REST response:', JSON.stringify(rawData, null, 2))
    } catch (e) {
        console.log('Payload 4 error:', e.message)
    }
}

run()
