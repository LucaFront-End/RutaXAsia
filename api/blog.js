import { createClient, ApiKeyStrategy } from '@wix/sdk';

const SITE_ID = process.env.VITE_WIX_SITE_ID;
const API_KEY = process.env.VITE_WIX_API_KEY;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // --- Strategy 1: Try the Wix REST API directly ---
        const restResult = await fetchPostsViaREST();
        if (restResult && restResult.length > 0) {
            console.log('[Blog] REST API returned', restResult.length, 'posts');
            return res.status(200).json({ posts: restResult, categories: [] });
        }

        // --- Strategy 2: Try the Wix SDK ---
        console.log('[Blog] REST API returned 0 posts, trying SDK...');
        const sdkResult = await fetchPostsViaSDK();
        if (sdkResult && sdkResult.posts.length > 0) {
            console.log('[Blog] SDK returned', sdkResult.posts.length, 'posts');
            return res.status(200).json(sdkResult);
        }

        console.log('[Blog] Both strategies returned 0 posts');
        res.status(200).json({ posts: [], categories: [] });
    } catch (error) {
        console.error('[Blog] Fatal error:', error.message);
        res.status(200).json({ posts: [], categories: [] });
    }
}

/**
 * Fetch blog posts via Wix REST API (v3) directly.
 * This avoids SDK version issues.
 */
async function fetchPostsViaREST() {
    try {
        const response = await fetch(
            `https://www.wixapis.com/blog/v3/posts?fieldsets=RICH_CONTENT&fieldsets=URL&paging.limit=50`,
            {
                method: 'GET',
                headers: {
                    'Authorization': API_KEY,
                    'wix-site-id': SITE_ID,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Blog REST] Error:', response.status, errorText);
            return [];
        }

        const data = await response.json();
        console.log('[Blog REST] Raw response keys:', Object.keys(data));
        console.log('[Blog REST] Posts count:', data.posts?.length || 0);

        return (data.posts || []).map(post => ({
            id: post._id || post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || '',
            coverImage: extractCoverImage(post),
            categoryLabel: 'General',
            categoryLabels: ['General'],
            date: post.firstPublishedDate || post.lastPublishedDate || post._createdDate,
            readTime: `${post.minutesToRead || 3} min`,
            featured: post.featured || false,
        }));
    } catch (error) {
        console.error('[Blog REST] Fetch error:', error.message);
        return [];
    }
}

/**
 * Fetch blog posts via Wix SDK (fallback).
 */
async function fetchPostsViaSDK() {
    try {
        const { posts, categories } = await import('@wix/blog');

        const wixClient = createClient({
            modules: { posts, categories },
            auth: ApiKeyStrategy({
                siteId: SITE_ID,
                apiKey: API_KEY,
            }),
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
        return { posts: blogPosts, categories: cats };
    } catch (error) {
        console.error('[Blog SDK] Error:', error.message);
        return { posts: [], categories: [] };
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
    // Try heroImage (REST API format)
    if (post.heroImage) return wixMediaUrl(post.heroImage);
    if (post.richContent?.nodes) {
        for (const node of post.richContent.nodes) {
            if (node.type === 'IMAGE' && node.imageData?.image?.src?.id) {
                return wixMediaUrl(node.imageData.image.src.id);
            }
        }
    }
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80';
}
