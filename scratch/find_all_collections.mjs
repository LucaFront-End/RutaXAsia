import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

async function run() {
    console.log('Fetching list of all data collections via Wix REST API...')
    
    const endpoints = [
        'https://www.wixapis.com/wix-data/v2/collections',
        'https://www.wixapis.com/wix-data/v1/collections',
        'https://www.wixapis.com/wix-data/v1/data-collections',
    ]

    for (const url of endpoints) {
        try {
            const res = await fetch(url, {
                headers: {
                    'Authorization': apiKey,
                    'wix-site-id': siteId,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json()
            console.log(`Endpoint ${url} status: ${res.status}`)
            if (data.collections) {
                console.log('\n--- ALL COLLECTIONS FOUND ---')
                data.collections.forEach(c => {
                    console.log(`ID: "${c.id || c._id || c.name}" | Display Name: "${c.displayName || c.title || ''}"`)
                })
                return
            } else {
                console.log('Response body:', JSON.stringify(data).slice(0, 300))
            }
        } catch (e) {
            console.log(`Error ${url}:`, e.message)
        }
    }
}

run().catch(console.error)
