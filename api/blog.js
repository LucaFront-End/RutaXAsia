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

        // Fetch categories and posts in parallel
        const [catsResult, postsResult] = await Promise.all([
            wixClient.categories.listCategories(),
            wixClient.posts.listPosts({ fieldsets: ['RICH_CONTENT', 'URL'] }),
        ]);

        // Build category ID -> label lookup
        const catMap = {};
        for (const cat of (catsResult?.categories || [])) {
            catMap[cat._id] = cat.label;
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
        res.status(500).json({ error: error.message || 'Failed to fetch posts' });
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
