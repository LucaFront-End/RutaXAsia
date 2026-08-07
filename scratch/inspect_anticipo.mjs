import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import dotenv from 'dotenv'

dotenv.config()

const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
const apiKey = process.env.VITE_WIX_API_KEY
const anticipoProductId = process.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'

const wixClient = createClient({
    modules: { items },
    auth: ApiKeyStrategy({ siteId, apiKey }),
})

async function run() {
    console.log('=== INSPECTING ANTICIPO PRODUCT FULL SCHEMA ===')
    try {
        // Try to get the full product data including variants from the CMS
        const res = await wixClient.items.query('StoreCatalog/Products')
            .eq('_id', anticipoProductId)
            .find()
        
        if (res.items.length > 0) {
            const product = res.items[0]
            console.log('\n✅ Product found:')
            console.log(JSON.stringify(product, null, 2))
        } else {
            console.log('❌ Product not found with ID:', anticipoProductId)
        }

        // Also try StoreCatalog/Variants to get variants for this product
        console.log('\n=== QUERYING StoreCatalog/Variants for Anticipo ===')
        try {
            const variantsRes = await wixClient.items.query('StoreCatalog/Variants')
                .find()
            
            const anticipoVariants = variantsRes.items.filter(v => 
                v.productId === anticipoProductId || 
                JSON.stringify(v).includes(anticipoProductId)
            )
            console.log('Anticipo variants found:', anticipoVariants.length)
            if (anticipoVariants.length > 0) {
                console.log(JSON.stringify(anticipoVariants, null, 2))
            } else {
                console.log('All variants sample:')
                console.log(JSON.stringify(variantsRes.items.slice(0, 3), null, 2))
            }
        } catch (vErr) {
            console.log('Variants query error:', vErr.message)
        }
    } catch (e) {
        console.error('Error:', e.message)
    }
}

run()
