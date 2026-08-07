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
    console.log('=== TESTING LINE ITEM STRUCTURES FOR createCheckout ===')

    const lineItemVariations = [
        {
            name: 'catalogReference + options.options.variantId',
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
        },
        {
            name: 'catalogReference + options.variantId as string',
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: productId,
                        options: {
                            variantId: variantId
                        }
                    },
                    quantity: 1
                }
            ]
        },
        {
            name: 'catalogReference with customItem',
            lineItems: [
                {
                    productName: { original: 'Anticipo de Viaje' },
                    price: { amount: '5000' },
                    quantity: 1
                }
            ]
        },
        {
            name: 'catalogReference with priceData',
            lineItems: [
                {
                    catalogReference: {
                        appId: WIX_STORES_APP_ID,
                        catalogItemId: productId,
                    },
                    priceData: {
                        price: { amount: '5000' }
                    },
                    quantity: 1
                }
            ]
        }
    ]

    for (const v of lineItemVariations) {
        try {
            console.log(`\nTesting variation: ${v.name}`)
            const res = await wixClient.checkout.createCheckout({
                channelType: 'WEB',
                lineItems: v.lineItems
            })
            console.log(`Variation "${v.name}" -> lineItems count:`, res.lineItems?.length)
            if (res.lineItems?.length > 0) {
                console.log('🎉 FOUND WORKING SDK PAYLOAD!')
                console.log('Checkout ID:', res._id)
                console.log('Full URL:', `https://dilodigitalmx.wixsite.com/rutaxasia/__ecom/checkout?checkoutId=${res._id}&origin=https%3A%2F%2Fwww.rutaxasia.com`)
            }
        } catch (e) {
            console.log(`Variation "${v.name}" error:`, e.message)
        }
    }
}

run()
