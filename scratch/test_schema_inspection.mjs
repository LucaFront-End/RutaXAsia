import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

async function run() {
    console.log('=== TESTING WIX ECOM API VALIDATION ERRORS ===')
    const itemTypes = ['PHYSICAL', 'DIGITAL', 'CUSTOM', 'UNSPECIFIED', 'STORE_PRODUCT', 'PRODUCT']

    for (const type of itemTypes) {
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
                        itemType: type,
                        quantity: 1
                    }
                ]
            })
        })
        const data = await res.json()
        console.log(`itemType [${type}] ->`, JSON.stringify(data.details || data.message))
    }
}

run()
