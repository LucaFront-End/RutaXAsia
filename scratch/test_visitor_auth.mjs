import dotenv from 'dotenv'
dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const productId = '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

async function run() {
    console.log('=== TESTING VISITOR TOKEN GENERATION VIA WIX API ===')

    // 1. Create anonymous visitor session via POST /v2/sessions
    try {
        const res = await fetch('https://www.wixapis.com/apps/v1/anonymous-tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'wix-site-id': siteId,
            },
            body: JSON.stringify({})
        })
        const data = await res.json()
        console.log('Anonymous Token Response:', JSON.stringify(data, null, 2))
    } catch (e) {
        console.error('Error:', e.message)
    }
}

run()
