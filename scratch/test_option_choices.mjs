import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { checkout } from '@wix/ecom'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

const wixClient = createClient({
    modules: { checkout },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING CATALOG REFERENCE WITHOUT OPTIONS ===')

    const optionsTests = [
        { name: 'no options object at all', options: undefined },
        { name: 'options: {}', options: {} },
        { name: 'options: { options: {} }', options: { options: {} } },
        { name: 'options: { optionChoices: {} }', options: { optionChoices: {} } },
        { name: 'options: { variantId: "" }', options: { variantId: "" } },
    ]

    for (const ot of optionsTests) {
        try {
            console.log(`\nTesting: ${ot.name}`)
            const catRef = {
                appId: WIX_STORES_APP_ID,
                catalogItemId: productId,
            }
            if (ot.options !== undefined) catRef.options = ot.options

            const res = await wixClient.checkout.createCheckout({
                channelType: 'WEB',
                lineItems: [
                    {
                        catalogReference: catRef,
                        quantity: 1
                    }
                ]
            })
            console.log(`Test "${ot.name}" -> lineItems:`, res.lineItems?.length)
            if (res.lineItems?.length > 0) {
                console.log('🎉 SUCCESS! Line items count:', res.lineItems.length)
                console.log(JSON.stringify(res.lineItems, null, 2))
                console.log('\nURL:', `https://dilodigitalmx.wixsite.com/rutaxasia/__ecom/checkout?checkoutId=${res._id}&origin=https%3A%2F%2Fwww.rutaxasia.com`)
            }
        } catch (e) {
            console.log(`Test "${ot.name}" error:`, e.message)
        }
    }
}

run()
