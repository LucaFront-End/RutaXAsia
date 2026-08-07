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
    try {
        const pricesRes = await wixClient.items
            .query('PreciosporCategoriasydias')
            .eq('temporada', 'Sakura')
            .find()

        console.log('=== SAKURA ITEMS IN PRECIOS ===')
        pricesRes.items.forEach(it => {
            console.log(`- ${it.title} | ${it.tituloComercial} | ${it.categora} | ${it.dasYNochesCompletos} | Price: ${it.precioConDatos} (${it.precioConNmero}) | FreeTours: ${it.tourGratisQueIncluira}`)
        })
    } catch (e) {
        console.error(e)
    }
}

run()
