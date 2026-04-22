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

    // --- Strategy 1: Query blog posts via Wix Data API (CMS collection) ---
    try {
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({ siteId: SITE_ID, apiKey: API_KEY }),
        });

        // Try the blog/posts CMS collection (Wix stores blog data here)
        const collectionNames = ['Blog/Posts', 'blog/posts', 'BlogPosts', 'blog'];
        
        for (const collectionId of collectionNames) {
            try {
                console.log(`[Blog] Trying CMS collection: "${collectionId}"`);
                const result = await wixClient.items.queryDataItems({
                    dataCollectionId: collectionId,
                }).limit(50).find();

                if (result.items && result.items.length > 0) {
                    console.log(`[Blog] Found ${result.items.length} posts in "${collectionId}"`);
                    
                    const blogPosts = result.items.map(item => {
                        const d = item.data;
                        return {
                            id: d._id || item._id,
                            slug: d.slug || d.postPageUrl || d._id,
                            title: d.title || d.name || 'Sin título',
                            excerpt: d.excerpt || d.description || '',
                            coverImage: extractCoverImageFromData(d),
                            categoryLabel: d.categoryLabel || d.category || 'General',
                            categoryLabels: [d.categoryLabel || d.category || 'General'],
                            date: d.firstPublishedDate || d.publishedDate || d._createdDate || d.date,
                            readTime: `${d.minutesToRead || d.readTime || 3} min`,
                            featured: d.featured || false,
                        };
                    });

                    return res.status(200).json({ posts: blogPosts, categories: [], _source: collectionId });
                }
            } catch (collErr) {
                errors.push(`${collectionId}: ${collErr.message}`);
                console.log(`[Blog] Collection "${collectionId}" failed:`, collErr.message);
            }
        }
    } catch (dataErr) {
        errors.push(`Data API: ${dataErr.message}`);
    }

    // --- Strategy 2: Direct Wix REST API for Blog ---
    try {
        console.log('[Blog] Trying REST API...');
        const response = await fetch(
            `https://www.wixapis.com/blog/v3/posts?paging.limit=50`,
            {
                method: 'GET',
                headers: {
                    'Authorization': API_KEY,
                    'wix-site-id': SITE_ID,
                    'Content-Type': 'application/json',
                },
            }
        );

        const responseText = await response.text();
        console.log('[Blog REST] Status:', response.status, 'Body:', responseText.substring(0, 500));

        if (response.ok) {
            const data = JSON.parse(responseText);
            if (data.posts && data.posts.length > 0) {
                const blogPosts = data.posts.map(post => ({
                    id: post._id || post.id,
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt || '',
                    coverImage: extractCoverImage(post),
                    categoryLabel: 'General',
                    categoryLabels: ['General'],
                    date: post.firstPublishedDate || post.lastPublishedDate,
                    readTime: `${post.minutesToRead || 3} min`,
                    featured: post.featured || false,
                }));
                return res.status(200).json({ posts: blogPosts, categories: [], _source: 'REST' });
            }
        }
        errors.push(`REST: ${response.status} - ${responseText.substring(0, 200)}`);
    } catch (restErr) {
        errors.push(`REST fetch: ${restErr.message}`);
    }

    // --- Strategy 3: Try Wix Blog SDK ---
    try {
        console.log('[Blog] Trying SDK...');
        const { posts } = await import('@wix/blog');
        const wixClient = createClient({
            modules: { posts },
            auth: ApiKeyStrategy({ siteId: SITE_ID, apiKey: API_KEY }),
        });

        const postsResult = await wixClient.posts.listPosts();
        console.log('[Blog SDK] Result:', JSON.stringify(postsResult).substring(0, 300));

        if (postsResult?.posts?.length > 0) {
            const blogPosts = postsResult.posts.map(post => ({
                id: post._id,
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt || '',
                coverImage: extractCoverImage(post),
                categoryLabel: 'General',
                categoryLabels: ['General'],
                date: post.firstPublishedDate || post.lastPublishedDate,
                readTime: `${post.minutesToRead || 3} min`,
                featured: post.featured || false,
            }));
            return res.status(200).json({ posts: blogPosts, categories: [], _source: 'SDK' });
        }
        errors.push(`SDK: returned ${postsResult?.posts?.length || 0} posts`);
    } catch (sdkErr) {
        errors.push(`SDK: ${sdkErr.message}`);
    }

    // All strategies failed
    console.error('[Blog] All strategies failed:', errors);
    res.status(200).json({ posts: [], categories: [], _errors: errors });
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
    if (d.image) return typeof d.image === 'string' ? wixMediaUrl(d.image) : (d.image?.url || '');
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80';
}

function extractCoverImage(post) {
    if (post.coverImage?.image?.url) return post.coverImage.image.url;
    if (post.coverImage?.url) return post.coverImage.url;
    if (post.coverMedia?.image?.url) return post.coverMedia.image.url;
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
