import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

/**
 * GET /api/landings — Fetch all published landings from Wix CMS
 *
 * CMS Collection: "LandingsdeCiudad"
 * Field mapping (CSV display name → field key):
 *   Titulo de pagina      → title_fld
 *   Excerpt de página     → excerptDePgina
 *   ciudad                → ciudad
 *   Estado                → estado
 *   Slug                  → slug
 *   Whatsapp personalizado → whatsappPersonalizado
 *   Titulo de SEO         → tituloDeSeo
 *   Metadescripción       → metadescripcin
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        // Paginate through ALL landings (Wix limits to 100 per page)
        let allItems = [];
        let result = await wixClient.items
            .query('LandingsdeCiudad')
            .limit(100)
            .find();

        allItems.push(...(result.items || []));

        // Keep fetching while there are more pages
        while (result.hasNext && result.hasNext()) {
            result = await result.next();
            allItems.push(...(result.items || []));
        }

        const landings = allItems
            .filter(item => item.slug) // Only items with a slug
            .map(item => ({
                id: item._id,
                title: item.title_fld || '',
                excerpt: item.excerptDePgina || '',
                city: item.ciudad || '',
                state: item.estado || '',
                slug: item.slug || '',
                whatsapp: item.whatsappPersonalizado || '',
                seoTitle: item.tituloDeSeo || '',
                seoDescription: item.metadescripcin || '',
            }));

        console.log(`[Landings API] Returned ${landings.length} landings (from ${allItems.length} raw items)`);

        // Cache: 60s fresh, serve stale for 5min while revalidating
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        res.status(200).json({ landings });
    } catch (error) {
        console.error('[Landings API] Error:', error.message);
        res.status(500).json({ landings: [], error: error.message });
    }
}
