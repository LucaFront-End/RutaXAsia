import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { posts } from '@wix/blog';
import { items } from '@wix/data';

const SITE_URL = 'https://rutaxasia.com';

/* ── Static pages ──────────────────────────────────────────────── */
const STATIC_PAGES = [
    { loc: '/',                            priority: '1.0',  changefreq: 'weekly'  },
    { loc: '/nosotros',                    priority: '0.7',  changefreq: 'monthly' },
    { loc: '/portafolio',                  priority: '0.8',  changefreq: 'weekly'  },
    { loc: '/comunidad/comentarios',       priority: '0.8',  changefreq: 'daily'   },
    { loc: '/registro-nacional-turismo',   priority: '0.7',  changefreq: 'monthly' },
    { loc: '/blog',                        priority: '0.8',  changefreq: 'daily'   },
    { loc: '/faq',                         priority: '0.6',  changefreq: 'monthly' },
    { loc: '/contacto',                    priority: '0.7',  changefreq: 'monthly' },
    { loc: '/viajes',                      priority: '0.9',  changefreq: 'weekly'  },
    { loc: '/viajes/japon',                priority: '0.9',  changefreq: 'weekly'  },
    { loc: '/viajes/japon/sakura',         priority: '0.9',  changefreq: 'weekly'  },
    { loc: '/viajes/japon/akari',          priority: '0.9',  changefreq: 'weekly'  },
    { loc: '/viajes/japon/kamakura',       priority: '0.9',  changefreq: 'weekly'  },
    { loc: '/viajes/corea',                priority: '0.9',  changefreq: 'weekly'  },
    { loc: '/viajes/china',                priority: '0.5',  changefreq: 'monthly' },
    { loc: '/tours-individuales',          priority: '0.8',  changefreq: 'weekly'  },
    { loc: '/zonas',                       priority: '0.8',  changefreq: 'weekly'  },
    { loc: '/aviso-de-privacidad',         priority: '0.3',  changefreq: 'yearly'  },
    { loc: '/terminos-y-condiciones',      priority: '0.3',  changefreq: 'yearly'  },
];

/* ── Hardcoded tour slugs as fallback ───────── */
const STATIC_TOUR_SLUGS = [
    'sakura-2027',
    'octubre-japon-2026',
    'japon-corea-2026',
    'corea-otono-2026',
    'sakura-2026',
    'japon-corea-mayo-2026',
    'corea-junio-2026',
    'verano-japon-2026',
    'corea-septiembre-2026',
    'otono-japon-2026',
];

const STATIC_TOUR_INDIVIDUAL_SLUGS = [
    'the-wizarding-world-of-harry-potter-tokyo',
    'ceremonia-del-te-en-kioto',
    'teamlab-planets-tokyo',
    'experiencia-samurai-en-tokio',
    'recorrido-gastronomico-en-osaka',
];

function generateSlug(title, id) {
    if (!title) return id || 'tour';
    return String(title)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

/* ── Create Wix client ─────────── */
function getWixClient() {
    return createClient({
        modules: { posts, items },
        auth: ApiKeyStrategy({
            siteId: process.env.VITE_WIX_SITE_ID,
            apiKey: process.env.VITE_WIX_API_KEY,
        }),
    });
}

/* ── Fetch tour slugs ──────────── */
async function fetchTourSlugs(wixClient) {
    try {
        const result = await wixClient.items.query('tours').find();
        const cmsSlugs = (result.items || []).map(item => item?.slug).filter(Boolean);
        if (cmsSlugs.length > 0) {
            const merged = new Set([...cmsSlugs, ...STATIC_TOUR_SLUGS]);
            return [...merged];
        }
        return STATIC_TOUR_SLUGS;
    } catch (error) {
        console.error('[Sitemap] Error fetching tours:', error.message);
        return STATIC_TOUR_SLUGS;
    }
}

/* ── Fetch tour individual slugs ──────────── */
async function fetchTourIndividualSlugs(wixClient) {
    try {
        let allItems = [];
        let result = await wixClient.items.query('TourIndividuales').limit(100).find();
        allItems.push(...(result.items || []));

        while (result.hasNext && result.hasNext()) {
            result = await result.next();
            allItems.push(...(result.items || []));
        }

        const cmsSlugs = allItems.map(item => {
            const rawSlug = item.slug || item.urlSlug || item.pageSlug || item['link-tour-individuales-title'];
            if (rawSlug) {
                return String(rawSlug).startsWith('/') 
                    ? String(rawSlug).replace(/^\/|\/$/g, '').split('/').pop() 
                    : generateSlug(rawSlug);
            }
            return generateSlug(item.title || item.tituloDePgina || item.tituloDePagina, item._id);
        }).filter(Boolean);

        if (cmsSlugs.length > 0) {
            const merged = new Set([...cmsSlugs, ...STATIC_TOUR_INDIVIDUAL_SLUGS]);
            return [...merged];
        }
        return STATIC_TOUR_INDIVIDUAL_SLUGS;
    } catch (error) {
        console.error('[Sitemap] Error fetching tour individuales:', error.message);
        return STATIC_TOUR_INDIVIDUAL_SLUGS;
    }
}

/* ── Fetch blog post slugs ───────────────────────── */
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

/* ── Build sitemap index XML ─────────────────────────────────────── */
function buildSitemapIndex() {
    const today = new Date().toISOString().split('T')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml?type=main</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-landings.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/* ── Build main sitemap (static + tours + tours individuales + blog) ──────────────────── */
function buildMainSitemap(tourSlugs, tourIndivSlugs, blogEntries) {
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const page of STATIC_PAGES) {
        xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Standard Tours
    for (const slug of tourSlugs) {
        xml += `  <url>
    <loc>${SITE_URL}/tours/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    }

    // Tours Individuales
    for (const slug of tourIndivSlugs) {
        xml += `  <url>
    <loc>${SITE_URL}/tours-individuales/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Blog posts
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

    xml += `</urlset>`;
    return xml;
}

/* ── Vercel Serverless Handler ─────────────────────────────────── */
export default async function handler(req, res) {
    try {
        const type = req.query?.type;

        // If no ?type= parameter → return sitemap index
        if (!type) {
            const xml = buildSitemapIndex();
            res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            return res.status(200).send(xml);
        }

        // ?type=main → return main sitemap (static + tours + tour individuales + blog)
        const wixClient = getWixClient();
        const [tourSlugs, tourIndivSlugs, blogEntries] = await Promise.all([
            fetchTourSlugs(wixClient),
            fetchTourIndividualSlugs(wixClient),
            fetchBlogSlugs(wixClient),
        ]);

        const xml = buildMainSitemap(tourSlugs, tourIndivSlugs, blogEntries);

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.status(200).send(xml);
    } catch (error) {
        console.error('[Sitemap] Fatal error:', error);
        res.status(500).send('Error generating sitemap');
    }
}
