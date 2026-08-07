import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

async function run() {
    console.log('=== TESTING LINE ITEM CATALOG SCHEMAS ===')

    const appIdsToTest = [
        '1380b703-ce81-ff05-f115-39571d94dfd3', // Wix Stores
        '215238eb-22a5-4caf-8f32-219d38e642d8', // Wix Ecom
        '2723ae37-3d69-4374-851c-0301705a23ca', // Category ID
    ]

    for (const appId of appIdsToTest) {
        try {
            console.log(`\nTesting appId: ${appId}`)
            const res = await fetch('https://www.wixapis.com/ecom/v1/checkouts', {
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
                                appId: appId,
                                catalogItemId: productId,
                            },
                            quantity: 1
                        }
                    ]
                })
            })
            const data = await res.json()
            const lineCount = data.checkout?.lineItems?.length || 0
            console.log(`AppId [${appId}] -> lineItems: ${lineCount}`)
            if (lineCount > 0) {
                console.log('SUCCESS! Checkout data:', JSON.stringify(data.checkout, null, 2))
            }
        } catch (e) {
            console.error('Error for appId', appId, e.message)
        }
    }
}

run()
