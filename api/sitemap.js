import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { posts } from '@wix/blog';
import { items } from '@wix/data';

const SITE_URL = 'https://rutaxasia.com';

/* ── Static pages ──────────────────────────────────────────────── */
const STATIC_PAGES = [
    { loc: '/',                       priority: '1.0',  changefreq: 'weekly'  },
    { loc: '/nosotros',               priority: '0.7',  changefreq: 'monthly' },
    { loc: '/blog',                   priority: '0.8',  changefreq: 'daily'   },
    { loc: '/faq',                    priority: '0.6',  changefreq: 'monthly' },
    { loc: '/contacto',               priority: '0.7',  changefreq: 'monthly' },
    { loc: '/aviso-de-privacidad',    priority: '0.3',  changefreq: 'yearly'  },
    { loc: '/terminos-y-condiciones', priority: '0.3',  changefreq: 'yearly'  },
];

/* ── Hardcoded tour slugs as fallback (from tourData.js) ───────── */
const STATIC_TOUR_SLUGS = [
    'sakura-2026',
    'japon-corea-mayo-2026',
    'corea-junio-2026',
    'verano-japon-2026',
    'corea-septiembre-2026',
    'octubre-japon-2026',
    'japon-corea-2026',
    'otono-japon-2026',
];

/* ── Create Wix client (server-side, uses process.env) ─────────── */
function getWixClient() {
    return createClient({
        modules: { posts, items },
        auth: ApiKeyStrategy({
            siteId: process.env.VITE_WIX_SITE_ID,
            apiKey: process.env.VITE_WIX_API_KEY,
        }),
    });
}

/* ── Fetch tour slugs from Wix CMS "tours" collection ──────────── */
async function fetchTourSlugs(wixClient) {
    try {
        const result = await wixClient.items.queryDataItems({
            dataCollectionId: 'tours',
        }).find();

        const cmsSlugs = (result.items || [])
            .map(item => item.data?.slug)
            .filter(Boolean);

        if (cmsSlugs.length > 0) {
            // Merge: CMS slugs + any static slugs not yet in CMS (belt & suspenders)
            const merged = new Set([...cmsSlugs, ...STATIC_TOUR_SLUGS]);
            return [...merged];
        }

        // CMS collection is empty → use static fallback
        return STATIC_TOUR_SLUGS;
    } catch (error) {
        console.error('[Sitemap] Error fetching tours from CMS:', error.message);
        return STATIC_TOUR_SLUGS;
    }
}

/* ── Fetch blog post slugs from Wix Blog ───────────────────────── */
async function fetchBlogSlugs(wixClient) {
    try {
        const allSlugs = [];
        let cursor = null;
        let hasMore = true;

        while (hasMore) {
            const query = { fieldsets: ['URL'], paging: { limit: 100 } };
            if (cursor) query.paging.cursor = cursor;

            const result = await wixClient.posts.listPosts(query);
            const fetched = result?.posts || [];

            for (const post of fetched) {
                if (post.slug) {
                    allSlugs.push({
                        slug: post.slug,
                        lastmod: post.lastPublishedDate || post.firstPublishedDate || post._updatedDate || null,
                    });
                }
            }

            cursor = result?.metaData?.cursor || result?.pagingMetadata?.cursors?.next || null;
            hasMore = fetched.length === 100 && !!cursor;
        }

        return allSlugs;
    } catch (error) {
        console.error('[Sitemap] Error fetching blog posts:', error.message);
        return [];
    }
}

/* ── Fetch city landing slugs from Wix CMS ─────────────────────── */
async function fetchCityLandingSlugs(wixClient) {
    try {
        const result = await wixClient.items.queryDataItems({
            dataCollectionId: 'LandingsdeCiudad',
        }).find();

        return (result.items || [])
            .map(item => item.data?.slug)
            .filter(Boolean);
    } catch (error) {
        console.error('[Sitemap] Error fetching city landings:', error.message);
        return [];
    }
}

/* ── Build XML ─────────────────────────────────────────────────── */
function buildSitemap(tourSlugs, blogEntries, cityLandings) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // 1) Static pages
    for (const page of STATIC_PAGES) {
        xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // 2) Tours (dynamic from CMS + static fallback)
    for (const slug of tourSlugs) {
        xml += `  <url>
    <loc>${SITE_URL}/tours/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    }

    // 3) Blog posts (dynamic from Wix Blog CMS)
    for (const entry of blogEntries) {
        const lastmod = entry.lastmod
            ? new Date(entry.lastmod).toISOString().split('T')[0]
            : today;
        xml += `  <url>
    <loc>${SITE_URL}/blog/${entry.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // 4) City landings (dynamic from CMS)
    for (const slug of cityLandings) {
        xml += `  <url>
    <loc>${SITE_URL}/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    xml += `</urlset>`;
    return xml;
}

/* ── Vercel Serverless Handler ─────────────────────────────────── */
export default async function handler(req, res) {
    try {
        const wixClient = getWixClient();

        // Fetch tours + blog posts + city landings in parallel for speed
        const [tourSlugs, blogEntries, cityLandings] = await Promise.all([
            fetchTourSlugs(wixClient),
            fetchBlogSlugs(wixClient),
            fetchCityLandingSlugs(wixClient),
        ]);

        const xml = buildSitemap(tourSlugs, blogEntries, cityLandings);

        // Cache for 1 hour, serve stale while revalidating
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.status(200).send(xml);
    } catch (error) {
        console.error('[Sitemap] Fatal error:', error);
        res.status(500).send('Error generating sitemap');
    }
}
