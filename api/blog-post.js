import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { posts } from '@wix/blog';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: 'Slug is required' });

    try {
        const wixClient = createClient({
            modules: { posts },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        const result = await wixClient.posts.getPostBySlug(slug, {
            fieldsets: ['RICH_CONTENT', 'URL'],
        });
        if (!result?.post) return res.status(404).json({ error: 'Post not found' });

        const post = result.post;
        const mapped = {
            id: post._id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || '',
            contentHtml: renderRichContent(post.richContent),
            coverImage: extractCoverImage(post),
            categoryLabel: post.categories?.[0]?.label || 'General',
            date: post.firstPublishedDate || post.lastPublishedDate || post._createdDate,
            readTime: `${post.minutesToRead || 3} min`,
            featured: post.featured || false,
        };

        res.status(200).json({ post: mapped });
    } catch (error) {
        console.error('Blog post API error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch post' });
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

function extractText(node) {
    if (!node.nodes) return '';
    return node.nodes.map(child => {
        if (child.type === 'TEXT' && child.textData) {
            let text = child.textData.text || '';
            for (const deco of (child.textData.decorations || [])) {
                if (deco.type === 'BOLD') text = `<strong>${text}</strong>`;
                if (deco.type === 'ITALIC') text = `<em>${text}</em>`;
                if (deco.type === 'LINK') text = `<a href="${deco.linkData?.link?.url || '#'}" target="_blank" rel="noopener noreferrer">${text}</a>`;
            }
            return text;
        }
        return extractText(child);
    }).join('');
}

function renderRichContent(richContent) {
    if (!richContent?.nodes) return '';
    return richContent.nodes.map(node => {
        switch (node.type) {
            case 'PARAGRAPH': {
                const text = extractText(node);
                return text ? `<p>${text}</p>` : '';
            }
            case 'HEADING': {
                const level = node.headingData?.level || 2;
                return `<h${level}>${extractText(node)}</h${level}>`;
            }
            case 'BULLETED_LIST':
            case 'ORDERED_LIST': {
                const tag = node.type === 'ORDERED_LIST' ? 'ol' : 'ul';
                const items = (node.nodes || []).map(li => `<li>${extractText(li.nodes?.[0] || li)}</li>`).join('');
                return `<${tag}>${items}</${tag}>`;
            }
            case 'IMAGE': {
                const url = wixMediaUrl(node.imageData?.image?.src?.id);
                return url ? `<img src="${url}" alt="${node.imageData?.altText || ''}" loading="lazy" />` : '';
            }
            case 'BLOCKQUOTE':
                return `<blockquote>${extractText(node)}</blockquote>`;
            case 'DIVIDER':
                return '<hr />';
            default:
                return '';
        }
    }).filter(Boolean).join('\n');
}
