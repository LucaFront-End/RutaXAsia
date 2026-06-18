import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

const SITE_URL = 'https://rutaxasia.com';

/**
 * GET /api/sitemap-landings.xml
 *
 * 100% dynamic sitemap for city landings from Wix CMS.
 * Fetches ALL landings with pagination (no hardcoded data).
 *
 * Each <url> entry includes:
 *   - loc: https://rutaxasia.com/{slug}
 *   - lastmod: from CMS _updatedDate
 *   - changefreq: monthly
 *   - priority: 0.8
 */
export default async function handler(req, res) {
    try {
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        // Paginate through ALL landings
        const allItems = [];
        let result = await wixClient.items
            .query('LandingsdeCiudad')
            .limit(100)
            .find();

        allItems.push(...(result.items || []));

        while (result.hasNext && result.hasNext()) {
            result = await result.next();
            allItems.push(...(result.items || []));
        }

        // Filter only items with a slug
        const landings = allItems.filter(item => item.slug);

        console.log(`[Sitemap-Landings] Generated sitemap with ${landings.length} landings`);

        // Build XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

        for (const item of landings) {
            const lastmod = item._updatedDate
                ? new Date(item._updatedDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            xml += `  <url>
    <loc>${SITE_URL}/${item.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
        }

        xml += `</urlset>`;

        // Cache for 1 hour, serve stale while revalidating
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.status(200).send(xml);
    } catch (error) {
        console.error('[Sitemap-Landings] Fatal error:', error);
        res.status(500).send('Error generating landings sitemap');
    }
}
