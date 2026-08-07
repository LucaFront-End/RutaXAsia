import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

async function run() {
    console.log('=== TESTING CUSTOM AND EXTENDED LINE ITEM SCHEMAS ===')

    const payloads = [
        {
            name: 'Schema A: itemType custom',
            body: {
                channelType: 'WEB',
                lineItems: [
                    {
                        itemType: { custom: {} },
                        productName: { original: 'Anticipo de Viaje' },
                        priceData: { price: { amount: '5000', currency: 'MXN' } },
                        quantity: 1
                    }
                ]
            }
        },
        {
            name: 'Schema B: catalogReference + priceData',
            body: {
                channelType: 'WEB',
                lineItems: [
                    {
                        catalogReference: {
                            appId: WIX_STORES_APP_ID,
                            catalogItemId: productId,
                        },
                        priceData: { price: { amount: '5000', currency: 'MXN' } },
                        quantity: 1
                    }
                ]
            }
        },
        {
            name: 'Schema C: catalogReference + productName',
            body: {
                channelType: 'WEB',
                lineItems: [
                    {
                        catalogReference: {
                            appId: WIX_STORES_APP_ID,
                            catalogItemId: productId,
                        },
                        productName: { original: 'Anticipo de Viaje' },
                        quantity: 1
                    }
                ]
            }
        },
        {
            name: 'Schema D: catalogReference + appId as string',
            body: {
                channelType: 'WEB',
                lineItems: [
                    {
                        catalogReference: {
                            appId: '1380b703-ce81-ff05-f115-39571d94dfd3',
                            catalogItemId: productId,
                            options: {
                                variantId: 'd76c675d-5323-46f5-9ff4-057c22a09258'
                            }
                        },
                        productName: { original: 'Anticipo de Viaje' },
                        priceData: { price: { amount: '5000', currency: 'MXN' } },
                        quantity: 1
                    }
                ]
            }
        }
    ]

    for (const p of payloads) {
        try {
            console.log(`\nTesting ${p.name}...`)
            const res = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                    'wix-site-id': siteId,
                },
                body: JSON.stringify(p.body)
            })
            const data = await res.json()
            if (data.checkout?.lineItems?.length > 0) {
                console.log(`🎉 SUCCESS FOR ${p.name}!`)
                console.log(JSON.stringify(data.checkout, null, 2))
            } else {
                console.log(`Result for ${p.name}:`, data.message || `lineItems count: ${data.checkout?.lineItems?.length || 0}`)
            }
        } catch (e) {
            console.error('Error:', e.message)
        }
    }
}

run()
