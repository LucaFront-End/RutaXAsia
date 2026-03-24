import express from 'express';
import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { posts } from '@wix/blog';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

function makeWixClient() {
    return createClient({
        modules: { posts },
        auth: ApiKeyStrategy({
            siteId: process.env.VITE_WIX_SITE_ID,
            apiKey: process.env.VITE_WIX_API_KEY,
        }),
    });
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

function mapPost(post, includeContent = false) {
    const result = {
        id: post._id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || '',
        coverImage: extractCoverImage(post),
        categoryLabel: post.categories?.[0]?.label || 'General',
        date: post.firstPublishedDate || post.lastPublishedDate || post._createdDate,
        readTime: `${post.minutesToRead || 3} min`,
        featured: post.featured || false,
    };

    if (includeContent && post.richContent) {
        result.contentHtml = renderRichContent(post.richContent);
    }

    return result;
}

// ---- List all blog posts ----
app.get('/api/blog', async (req, res) => {
    try {
        const wixClient = makeWixClient();
        console.log('[API] Fetching blog posts...');
        const result = await wixClient.posts.listPosts({
            fieldsets: ['RICH_CONTENT', 'URL'],
        });
        const blogPosts = (result?.posts || []).map(p => mapPost(p, false));
        console.log(`[API] Found ${blogPosts.length} posts`);
        res.json({ posts: blogPosts });
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
        const result = await wixClient.posts.getPostBySlug(slug, {
            fieldsets: ['RICH_CONTENT', 'URL'],
        });
        if (!result?.post) return res.status(404).json({ error: 'Not found' });
        const mapped = mapPost(result.post, true);
        console.log(`[API] Post "${mapped.title}" — coverImage: ${mapped.coverImage ? 'YES' : 'NO'}, contentHtml: ${mapped.contentHtml?.length || 0} chars`);
        res.json({ post: mapped });
    } catch (error) {
        console.error('[API] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`[API] Blog API dev server running on http://localhost:${PORT}`);
    console.log(`[API] Site ID: ${process.env.VITE_WIX_SITE_ID?.substring(0, 8)}...`);
});
