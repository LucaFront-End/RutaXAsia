import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

async function run() {
    console.log('=== TESTING STORES REST ENDPOINTS ===')

    const endpoints = [
        { name: 'v1/carts', url: 'https://www.wixapis.com/stores/v1/carts' },
        { name: 'v2/carts', url: 'https://www.wixapis.com/stores/v2/carts' },
        { name: 'v1/checkouts', url: 'https://www.wixapis.com/stores/v1/checkouts' },
        { name: 'ecom v1/carts/current', url: 'https://www.wixapis.com/ecom/v1/carts/current' },
        { name: 'ecom v1/checkouts/create-from-cart', url: 'https://www.wixapis.com/ecom/v1/checkouts/create-from-cart' },
    ]

    for (const ep of endpoints) {
        try {
            console.log(`\nTesting endpoint: ${ep.name}`)
            const res = await fetch(ep.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                    'wix-site-id': siteId,
                },
                body: JSON.stringify({
                    lineItems: [
                        {
                            productId: productId,
                            quantity: 1
                        }
                    ]
                })
            })
            const data = await res.json()
            console.log(`Endpoint ${ep.name} status ${res.status}:`, JSON.stringify(data, null, 2).slice(0, 300))
        } catch (e) {
            console.error('Error for endpoint', ep.name, e.message)
        }
    }
}

run()
