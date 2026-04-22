import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { posts, categories } from '@wix/blog';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const wixClient = createClient({
            modules: { posts, categories },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        // Fetch categories first (non-blocking — if it fails, continue without them)
        let catMap = {};
        try {
            const catsResult = await wixClient.categories.listCategories();
            for (const cat of (catsResult?.categories || [])) {
                catMap[cat._id] = cat.label;
            }
        } catch (catError) {
            console.warn('[Blog] Categories fetch failed (non-critical):', catError.message);
        }

        // Fetch posts — this is the critical call
        let postsResult;
        try {
            postsResult = await wixClient.posts.listPosts({ fieldsets: ['RICH_CONTENT', 'URL'] });
        } catch (postsError) {
            console.error('[Blog] Posts fetch failed:', postsError.message);
            // Try a simpler fetch without RICH_CONTENT
            try {
                postsResult = await wixClient.posts.listPosts();
            } catch (fallbackError) {
                console.error('[Blog] Posts fallback fetch also failed:', fallbackError.message);
                return res.status(200).json({ posts: [], categories: [] });
            }
        }

        const blogPosts = (postsResult?.posts || []).map(post => {
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

        res.status(200).json({ posts: blogPosts, categories: cats });
    } catch (error) {
        console.error('Blog API error:', error);
        // Return empty instead of 500 so frontend doesn't break
        res.status(200).json({ posts: [], categories: [], error: error.message });
    }
}

function wixMediaUrl(mediaId) {
    if (!mediaId) return '';
    if (mediaId.startsWith('http')) return mediaId;
    return `https://static.wixstatic.com/media/${mediaId}`;
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
