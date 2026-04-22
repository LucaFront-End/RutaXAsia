import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

const SITE_ID = process.env.VITE_WIX_SITE_ID;
const API_KEY = process.env.VITE_WIX_API_KEY;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const errors = [];

    // --- Strategy 1: Wix Blog SDK ---
    try {
        console.log('[Blog] Trying SDK...');
        const { posts, categories } = await import('@wix/blog');
        const wixClient = createClient({
            modules: { posts, categories },
            auth: ApiKeyStrategy({ siteId: SITE_ID, apiKey: API_KEY }),
        });

        // Fetch categories (non-blocking)
        let catMap = {};
        try {
            const catsResult = await wixClient.categories.listCategories();
            for (const cat of (catsResult?.categories || [])) {
                catMap[cat._id] = cat.label;
            }
        } catch (e) {
            console.warn('[Blog SDK] Categories failed:', e.message);
        }

        // Fetch posts
        const postsResult = await wixClient.posts.listPosts({ fieldsets: ['RICH_CONTENT', 'URL'] });
        
        if (postsResult?.posts?.length > 0) {
            const blogPosts = postsResult.posts.map(post => {
                const labels = (post.categoryIds || []).map(id => catMap[id]).filter(Boolean);
                return {
                    id: post._id,
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt || '',
                    coverImage: extractCoverImage(post),
                    categoryLabel: labels[0] || 'General',
                    categoryLabels: labels.length > 0 ? labels : ['General'],
                    date: post.firstPublishedDate || post.lastPublishedDate || post._createdDate,
                    readTime: `${post.minutesToRead || 3} min`,
                    featured: post.featured || false,
                };
            });
            const cats = Object.entries(catMap).map(([id, label]) => ({ id, label }));
            console.log('[Blog] SDK returned', blogPosts.length, 'posts');
            return res.status(200).json({ posts: blogPosts, categories: cats });
        }
        errors.push(`SDK: returned 0 posts`);
    } catch (sdkErr) {
        const errMsg = typeof sdkErr === 'object' ? JSON.stringify(sdkErr, null, 2) : String(sdkErr);
        errors.push(`SDK: ${sdkErr.message || errMsg}`);
        console.error('[Blog SDK] Error:', errMsg);
    }

    // --- Strategy 2: Wix Data API (blog collection) ---
    try {
        console.log('[Blog] Trying Data API...');
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({ siteId: SITE_ID, apiKey: API_KEY }),
        });

        const collectionNames = ['Blog/Posts', 'BlogPosts', 'blog'];
        
        for (const collectionId of collectionNames) {
            try {
                console.log(`[Blog] Trying collection: "${collectionId}"`);
                const result = await wixClient.items
                    .queryDataItems({ dataCollectionId: collectionId })
                    .limit(50)
                    .find();

                if (result.items && result.items.length > 0) {
                    console.log(`[Blog] Found ${result.items.length} posts in "${collectionId}"`);
                    
                    const blogPosts = result.items.map(item => {
                        const d = item.data;
                        return {
                            id: d._id || item._id,
                            slug: d.slug || d._id,
                            title: d.title || 'Sin título',
                            excerpt: d.excerpt || d.description || '',
                            coverImage: extractCoverImageFromData(d),
                            categoryLabel: 'General',
                            categoryLabels: ['General'],
                            date: d.firstPublishedDate || d._createdDate,
                            readTime: `${d.minutesToRead || 3} min`,
                            featured: d.featured || false,
                        };
                    });

                    return res.status(200).json({ posts: blogPosts, categories: [], _source: collectionId });
                }
            } catch (collErr) {
                errors.push(`Data/${collectionId}: ${collErr.message}`);
            }
        }
    } catch (dataErr) {
        errors.push(`Data API: ${dataErr.message}`);
    }

    // All strategies failed — return errors for diagnosis
    console.error('[Blog] All strategies failed:', errors);
    res.status(200).json({ 
        posts: [], 
        categories: [], 
        _errors: errors,
        _hint: 'If you see "Entity not found" errors, your Wix API key may have expired. Generate a new one at: Wix Dashboard > Settings > API Keys'
    });
}

function wixMediaUrl(mediaId) {
    if (!mediaId) return '';
    if (mediaId.startsWith('http')) return mediaId;
    return `https://static.wixstatic.com/media/${mediaId}`;
}

function extractCoverImageFromData(d) {
    if (d.coverImage && typeof d.coverImage === 'string') {
        return d.coverImage.startsWith('http') ? d.coverImage : wixMediaUrl(d.coverImage);
    }
    if (d.coverImage?.url) return d.coverImage.url;
    if (d.coverImage?.image?.url) return d.coverImage.image.url;
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80';
}

function extractCoverImage(post) {
    if (post.coverImage?.image?.url) return post.coverImage.image.url;
    if (post.coverImage?.url) return post.coverImage.url;
    if (post.coverMedia?.image?.url) return post.coverMedia.image.url;
    if (post.richContent?.nodes) {
        for (const node of post.richContent.nodes) {
            if (node.type === 'IMAGE' && node.imageData?.image?.src?.id) {
                return wixMediaUrl(node.imageData.image.src.id);
            }
        }
    }
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80';
}
