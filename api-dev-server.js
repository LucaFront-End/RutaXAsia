import express from 'express';
import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { posts, categories } from '@wix/blog';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(express.json());

function makeWixClient() {
    return createClient({
        modules: { posts, categories },
        auth: ApiKeyStrategy({
            siteId: process.env.VITE_WIX_SITE_ID,
            apiKey: process.env.VITE_WIX_API_KEY,
        }),
    });
}

// Category cache — maps category ID to label
let categoryCache = {};

async function loadCategories(wixClient) {
    if (Object.keys(categoryCache).length > 0) return categoryCache;
    try {
        const result = await wixClient.categories.listCategories();
        categoryCache = {};
        for (const cat of (result?.categories || [])) {
            categoryCache[cat._id] = cat.label;
        }
        console.log('[API] Loaded categories:', Object.values(categoryCache).join(', '));
    } catch (e) {
        console.error('[API] Failed to load categories:', e.message);
    }
    return categoryCache;
}

function resolveCategoryLabels(post, catMap) {
    if (!post.categoryIds?.length) return ['General'];
    return post.categoryIds.map(id => catMap[id] || 'General').filter(Boolean);
}

/**
 * Convert a Wix media ID into a full HTTPS static URL.
 */
function wixMediaUrl(mediaId) {
    if (!mediaId) return '';
    if (mediaId.startsWith('http')) return mediaId;
    return `https://static.wixstatic.com/media/${mediaId}`;
}

/**
 * Extract a cover image URL from a Wix Blog post.
 * Priority: coverImage field > coverMedia > first IMAGE in richContent.
 */
function extractCoverImage(post) {
    // Standard cover image field
    if (post.coverImage?.image?.url) return post.coverImage.image.url;
    if (post.coverImage?.url) return post.coverImage.url;
    if (post.coverMedia?.image?.url) return post.coverMedia.image.url;
    if (post.media?.coverImage?.image?.url) return post.media.coverImage.image.url;

    // Fallback: first IMAGE node inside richContent
    if (post.richContent?.nodes) {
        for (const node of post.richContent.nodes) {
            if (node.type === 'IMAGE' && node.imageData?.image?.src?.id) {
                return wixMediaUrl(node.imageData.image.src.id);
            }
        }
    }

    // Default fallback cover image for posts without any images
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80';
}

/**
 * Render Wix richContent (Draft.js-style JSON) into HTML.
 */
function renderRichContent(richContent) {
    if (!richContent?.nodes) return '';

    return richContent.nodes.map(node => {
        switch (node.type) {
            case 'PARAGRAPH': {
                const text = extractText(node);
                if (!text) return '';
                return `<p>${text}</p>`;
            }
            case 'HEADING': {
                const level = node.headingData?.level || 2;
                const text = extractText(node);
                return `<h${level}>${text}</h${level}>`;
            }
            case 'BULLETED_LIST':
            case 'ORDERED_LIST': {
                const tag = node.type === 'ORDERED_LIST' ? 'ol' : 'ul';
                const items = (node.nodes || []).map(li => {
                    const liParagraph = li.nodes?.[0];
                    const text = liParagraph ? extractText(liParagraph) : '';
                    return `<li>${text}</li>`;
                }).join('');
                return `<${tag}>${items}</${tag}>`;
            }
            case 'IMAGE': {
                const mediaId = node.imageData?.image?.src?.id;
                const alt = node.imageData?.altText || '';
                const url = wixMediaUrl(mediaId);
                return url ? `<img src="${url}" alt="${alt}" loading="lazy" />` : '';
            }
            case 'BLOCKQUOTE': {
                const text = extractText(node);
                return `<blockquote>${text}</blockquote>`;
            }
            case 'DIVIDER':
                return '<hr />';
            default:
                return '';
        }
    }).filter(Boolean).join('\n');
}

/**
 * Recursively extract text from a node tree, preserving bold/italic decorations.
 */
function extractText(node) {
    if (!node.nodes) return '';
    return node.nodes.map(child => {
        if (child.type === 'TEXT' && child.textData) {
            let text = child.textData.text || '';
            const decorations = child.textData.decorations || [];
            for (const deco of decorations) {
                if (deco.type === 'BOLD') text = `<strong>${text}</strong>`;
                if (deco.type === 'ITALIC') text = `<em>${text}</em>`;
                if (deco.type === 'LINK') {
                    const href = deco.linkData?.link?.url || '#';
                    text = `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                }
            }
            return text;
        }
        // Recurse into nested nodes
        return extractText(child);
    }).join('');
}

function mapPost(post, includeContent = false, catMap = {}) {
    const labels = resolveCategoryLabels(post, catMap);
    const result = {
        id: post._id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || '',
        coverImage: extractCoverImage(post),
        categoryLabel: labels[0],
        categoryLabels: labels,
        date: post.firstPublishedDate || post.lastPublishedDate || post._createdDate,
        readTime: `${post.minutesToRead || 3} min`,
        featured: post.featured || false,
    };

    if (includeContent && post.richContent) {
        result.contentHtml = renderRichContent(post.richContent);
    }

    return result;
}

// ---- List categories ----
app.get('/api/blog-categories', async (req, res) => {
    try {
        const wixClient = makeWixClient();
        // Force refresh cache
        categoryCache = {};
        const catMap = await loadCategories(wixClient);
        const cats = Object.entries(catMap).map(([id, label]) => ({ id, label }));
        res.json({ categories: cats });
    } catch (error) {
        console.error('[API] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ---- List all blog posts ----
app.get('/api/blog', async (req, res) => {
    try {
        const wixClient = makeWixClient();
        console.log('[API] Fetching blog posts...');

        // Load categories and posts in parallel
        const [catMap, postsResult] = await Promise.all([
            loadCategories(wixClient),
            wixClient.posts.listPosts({ fieldsets: ['RICH_CONTENT', 'URL'] }),
        ]);

        const blogPosts = (postsResult?.posts || []).map(p => mapPost(p, false, catMap));
        const cats = Object.entries(catMap).map(([id, label]) => ({ id, label }));
        console.log(`[API] Found ${blogPosts.length} posts, ${cats.length} categories`);
        res.json({ posts: blogPosts, categories: cats });
    } catch (error) {
        console.error('[API] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ---- Get single blog post by slug ----
app.get('/api/blog-post', async (req, res) => {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: 'Slug required' });

    try {
        const wixClient = makeWixClient();
        console.log(`[API] Fetching post: ${slug}`);

        const [catMap, result] = await Promise.all([
            loadCategories(wixClient),
            wixClient.posts.getPostBySlug(slug, { fieldsets: ['RICH_CONTENT', 'URL'] }),
        ]);

        if (!result?.post) return res.status(404).json({ error: 'Not found' });
        const mapped = mapPost(result.post, true, catMap);
        console.log(`[API] Post "${mapped.title}" — coverImage: ${mapped.coverImage ? 'YES' : 'NO'}, contentHtml: ${mapped.contentHtml?.length || 0} chars`);
        res.json({ post: mapped });
    } catch (error) {
        console.error('[API] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ---- List all published landings from CMS ----
app.get('/api/landings', async (req, res) => {
    try {
        const { items } = await import('@wix/data');
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        console.log('[API] Fetching landings from LandingsdeCiudad...');

        // Paginate through ALL landings (Wix limits to 100 per page)
        let allItems = [];
        let result = await wixClient.items
            .query('LandingsdeCiudad')
            .limit(100)
            .find();

        allItems.push(...(result.items || []));

        while (result.hasNext && result.hasNext()) {
            result = await result.next();
            allItems.push(...(result.items || []));
        }

        const landings = allItems
            .filter(item => item.slug)
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

        console.log(`[API] Found ${landings.length} landings (from ${allItems.length} raw items)`);
        res.json({ landings });
    } catch (error) {
        console.error('[API] Landings error:', error.message);
        res.status(500).json({ landings: [], error: error.message });
    }
});

// ---- Sitemap Index ----
app.get('/api/sitemap.xml', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const SITE_URL = 'https://rutaxasia.com';

    if (!req.query.type) {
        // Return sitemap index
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
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
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        return res.send(xml);
    }

    // ?type=main → static + tours + blog (simplified for dev)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${SITE_URL}/viajes</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/zonas</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/blog</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/nosotros</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/contacto</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/faq</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
});

// ---- Sitemap Landings (100% dynamic) ----
app.get('/api/sitemap-landings.xml', async (req, res) => {
    try {
        const { items } = await import('@wix/data');
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        const SITE_URL = 'https://rutaxasia.com';
        const allItems = [];
        let result = await wixClient.items.query('LandingsdeCiudad').limit(100).find();
        allItems.push(...(result.items || []));
        while (result.hasNext && result.hasNext()) {
            result = await result.next();
            allItems.push(...(result.items || []));
        }

        const landings = allItems.filter(item => item.slug);
        console.log(`[API] Sitemap-landings: ${landings.length} URLs`);

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

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.send(xml);
    } catch (error) {
        console.error('[API] Sitemap-landings error:', error.message);
        res.status(500).send('Error generating landings sitemap');
    }
});

// ---- Wix Checkout & Invoicing Route ----
app.post('/api/wix-checkout', async (req, res) => {
    try {
        const handler = (await import('./api/wix-checkout.js')).default;
        return handler(req, res);
    } catch (err) {
        console.error('[API] /api/wix-checkout error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ---- Wix Webhook & Payment Sync Route ----
app.all('/api/wix-webhook', async (req, res) => {
    try {
        const handler = (await import('./api/wix-webhook.js')).default;
        return handler(req, res);
    } catch (err) {
        console.error('[API] /api/wix-webhook error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ---- Cron Monthly Invoicing Route ----
app.all('/api/cron-monthly-invoices', async (req, res) => {
    try {
        const handler = (await import('./api/cron-monthly-invoices.js')).default;
        return handler(req, res);
    } catch (err) {
        console.error('[API] /api/cron-monthly-invoices error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ---- Wix Members & Cotizaciones / Abandoned Cart Route ----
app.all('/api/wix-cotizacion', async (req, res) => {
    try {
        const handler = (await import('./api/wix-cotizacion.js')).default;
        return handler(req, res);
    } catch (err) {
        console.error('[API] /api/wix-cotizacion error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ---- User Portal & Client Dashboard Route ----
app.all('/api/user-portal', async (req, res) => {
    try {
        const handler = (await import('./api/user-portal.js')).default;
        return handler(req, res);
    } catch (err) {
        console.error('[API] /api/user-portal error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ---- Update Passengers in CMS Route ----
app.all('/api/user-update-viajeros', async (req, res) => {
    try {
        const handler = (await import('./api/user-update-viajeros.js')).default;
        return handler(req, res);
    } catch (err) {
        console.error('[API] /api/user-update-viajeros error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ---- Dynamic fallback for all /api/:route endpoints (tours-individuales, precios-categorias-dias, itinerarios-completos, etc.) ----
app.all('/api/:route', async (req, res) => {
    const route = req.params.route;
    try {
        const mod = await import(`./api/${route}.js`);
        if (mod && mod.default) {
            return mod.default(req, res);
        }
        return res.status(404).json({ error: `Handler not found for /api/${route}` });
    } catch (err) {
        console.error(`[API] /api/${route} error:`, err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`[API] API dev server running on http://localhost:${PORT}`);
    console.log(`[API] Site ID: ${process.env.VITE_WIX_SITE_ID?.substring(0, 8)}...`);
});
