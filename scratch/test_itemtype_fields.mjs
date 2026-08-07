import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

async function run() {
    console.log('=== TESTING ITEMTYPE DIGITAL / PHYSICAL FIELD COMBINATIONS ===')

    const combinations = [
        {
            name: 'DIGITAL + catalogReference',
            body: {
                channelType: 'WEB',
                lineItems: [
                    {
                        itemType: 'DIGITAL',
                        catalogReference: {
                            appId: WIX_STORES_APP_ID,
                            catalogItemId: productId,
                        },
                        quantity: 1
                    }
                ]
            }
        },
        {
            name: 'PHYSICAL + catalogReference',
            body: {
                channelType: 'WEB',
                lineItems: [
                    {
                        itemType: 'PHYSICAL',
                        catalogReference: {
                            appId: WIX_STORES_APP_ID,
                            catalogItemId: productId,
                        },
                        quantity: 1
                    }
                ]
            }
        },
        {
            name: 'CUSTOM + productName + price',
            body: {
                channelType: 'WEB',
                lineItems: [
                    {
                        itemType: 'CUSTOM',
                        productName: { original: 'Anticipo de Viaje - $5,000 MXN' },
                        price: { amount: '5000', currency: 'MXN' },
                        quantity: 1
                    }
                ]
            }
        },
        {
            name: 'DIGITAL + name + price',
            body: {
                channelType: 'WEB',
                lineItems: [
                    {
                        itemType: 'DIGITAL',
                        name: { original: 'Anticipo de Viaje' },
                        price: { amount: '5000', currency: 'MXN' },
                        quantity: 1
                    }
                ]
            }
        }
    ]

    for (const c of combinations) {
        try {
            console.log(`\nTesting: ${c.name}`)
            const res = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                    'wix-site-id': siteId,
                },
                body: JSON.stringify(c.body)
            })
            const data = await res.json()
            const items = data.checkout?.lineItems || []
            console.log(`Result: ${c.name} -> lineItems count: ${items.length}`)
            if (items.length > 0) {
                console.log('🎉🎉🎉 WORKING CHECKOUT FOUND! 🎉🎉🎉')
                console.log(JSON.stringify(data.checkout, null, 2))
                console.log('\nURL:', `https://dilodigitalmx.wixsite.com/rutaxasia/__ecom/checkout?checkoutId=${data.checkout._id || data.checkout.id}&origin=https%3A%2F%2Fwww.rutaxasia.com`)
                break
            } else if (data.message || data.details) {
                console.log('API Msg/Details:', JSON.stringify(data.details || data.message))
            }
        } catch (e) {
            console.error('Error:', e.message)
        }
    }
}

run()
