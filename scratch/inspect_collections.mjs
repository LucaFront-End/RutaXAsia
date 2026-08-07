import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY

const wixClient = createClient({
    modules: { items },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    const knownCollections = [
        'TourIndividuales',
        'PreciosporCategoriasydias',
        'Ventas',
        'Compras',
        'Carrito',
        'Pedidos',
        'Orders',
        'Productos',
        'CarritoDeItems',
        'ItemDeVenta',
        'ItemsDeVenta'
    ]

    console.log('=== CHECKING WIX CMS COLLECTIONS ===')
    for (const col of knownCollections) {
        try {
            const res = await wixClient.items.query(col).limit(5).find()
            console.log(`\nCollection [${col}]: Found ${res.items.length} items`)
            if (res.items.length > 0) {
                console.log(`Sample item keys in [${col}]:`, Object.keys(res.items[0]))
                console.log(JSON.stringify(res.items[0], null, 2))
            }
        } catch (e) {
            console.log(`Collection [${col}]: Error or not found (${e.message})`)
        }
    }
}

run()
