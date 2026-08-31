import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

function formatWixImageUrl(wixUrl, slug) {
    if (slug && slug.includes('~mv2')) {
        return `https://static.wixstatic.com/media/${slug}`;
    }
    if (!wixUrl) return '';
    if (wixUrl.startsWith('http://') || wixUrl.startsWith('https://')) return wixUrl;
    if (wixUrl.startsWith('wix:image://v1/')) {
        const match = wixUrl.match(/wix:image:\/\/v1\/([^/#]+)/);
        if (match && match[1]) {
            return `https://static.wixstatic.com/media/${match[1]}`;
        }
    }
    return wixUrl;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        const targetTitle = (req.query?.title || 'General').trim().toLowerCase();

        const result = await wixClient.items.query('Galeriadenosotros').limit(50).find();
        const allItems = result.items || [];

        // Find matching gallery or fallback to General or first with images
        let matchedItem = allItems.find(item => (item.title || '').trim().toLowerCase() === targetTitle);
        if (!matchedItem || !matchedItem.mediagallery?.length) {
            matchedItem = allItems.find(item => (item.title || '').trim().toLowerCase() === 'general')
                || allItems.find(item => item.mediagallery && item.mediagallery.length > 0)
                || allItems[0];
        }

        const rawGallery = (matchedItem && matchedItem.mediagallery) || [];

        const images = rawGallery.map((img, idx) => {
            const src = formatWixImageUrl(img.src, img.slug);
            const width = img.settings?.width || 1080;
            const height = img.settings?.height || 1080;
            const isTall = height > width * 1.2 || idx % 5 === 0;

            return {
                id: img.slug || `img-${idx}`,
                src,
                caption: img.title && !img.title.startsWith('IMG_') && !img.title.match(/^\d+\.jpg$/i)
                    ? img.title.replace(/\.[^/.]+$/, '')
                    : 'Experiencia RutaXAsia',
                alt: img.alt || img.title || 'Viaje con RutaXAsia',
                span: isTall ? 'tall' : '',
                width,
                height,
            };
        });

        const categories = allItems
            .filter(item => item.mediagallery && item.mediagallery.length > 0)
            .map(item => item.title || 'Galería');

        return res.status(200).json({
            success: true,
            title: matchedItem?.title || 'General',
            total: images.length,
            images,
            categories,
        });
    } catch (error) {
        console.error('[GaleriaNosotros API] Error fetching gallery:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error fetching gallery',
            images: [],
        });
    }
}
