import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { currentCart } from '@wix/ecom'
import { redirects } from '@wix/redirects'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

const wixClient = createClient({
    modules: { currentCart, redirects },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== TESTING WIX CART / CHECKOUT APIS ===')
    try {
        const cart = await wixClient.currentCart.getCart()
        console.log('Cart:', cart)
    } catch (e) {
        console.log('getCart error:', e.message)
    }
}

run()
