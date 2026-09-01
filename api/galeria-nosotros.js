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

function isFilename(str) {
    if (!str || typeof str !== 'string') return true;
    const clean = str.trim();
    return /^img[-_]?\d+/i.test(clean) || 
           /^dsc[-_]?\d+/i.test(clean) || 
           /^\d+\.(jpg|jpeg|png|webp|heic)$/i.test(clean) || 
           /\.(jpg|jpeg|png|webp|heic)$/i.test(clean);
}

function formatMediaItem(img, idx, albumTitle = 'General') {
    const src = formatWixImageUrl(img.src, img.slug);
    const width = img.settings?.width || 1080;
    const height = img.settings?.height || 1080;
    const isTall = height > width * 1.15;
    const isWide = width > height * 1.35;

    let span = '';
    if (isTall && idx % 3 === 0) span = 'tall';
    else if (isWide && idx % 4 === 1) span = 'wide';

    // In Wix CMS: img.title is the City (e.g. "Busan", "Tokio", "Kioto", "Seúl")
    // img.description is the Description of the photo (e.g. "Tour Entretenimiento")
    const rawTitle = (img.title || '').trim();
    const rawDesc = (img.description || '').trim();

    const city = !isFilename(rawTitle) ? rawTitle : '';
    const description = !isFilename(rawDesc) ? rawDesc : '';

    return {
        id: img.slug || `img-${albumTitle}-${idx}`,
        src,
        city: city || albumTitle,
        title: city || albumTitle,
        description: description,
        caption: description || city || `Momento en ${albumTitle}`,
        alt: description || city || `Viaje ${albumTitle} con RutaXAsia`,
        album: albumTitle,
        span,
        width,
        height,
    };
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

        const targetTitle = (req.query?.title || '').trim().toLowerCase();

        const result = await wixClient.items.query('Galeriadenosotros').limit(50).find();
        const allItems = result.items || [];

        // Format all albums
        const albums = allItems.map(item => {
            const rawGallery = item.mediagallery || [];
            const images = rawGallery.map((img, idx) => formatMediaItem(img, idx, item.title || 'Galería'));
            const coverImage = images.length > 0 ? images[0].src : '';

            return {
                id: item._id,
                title: item.title || 'Sin Título',
                total: images.length,
                coverImage,
                images,
            };
        });

        // Flatten all images
        const allImages = albums.flatMap(alb => alb.images);

        // Filter for specific requested title if specified
        let activeAlbum = null;
        if (targetTitle && targetTitle !== 'all' && targetTitle !== 'todos') {
            activeAlbum = albums.find(a => a.title.trim().toLowerCase() === targetTitle);
        }

        // Default if title was requested or fallback
        const returnedImages = activeAlbum 
            ? activeAlbum.images 
            : targetTitle === 'all' || targetTitle === 'todos' 
                ? allImages 
                : (albums.find(a => a.title.trim().toLowerCase() === 'general')?.images || albums[0]?.images || []);

        const categories = albums
            .filter(a => a.total > 0)
            .map(a => a.title);

        return res.status(200).json({
            success: true,
            title: activeAlbum ? activeAlbum.title : targetTitle === 'all' ? 'Todos los Álbumes' : 'General',
            total: returnedImages.length,
            images: returnedImages,
            albums: albums.filter(a => a.total > 0),
            allAlbums: albums,
            categories,
            allImagesCount: allImages.length,
        });
    } catch (error) {
        console.error('[GaleriaNosotros API] Error fetching gallery:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error fetching gallery',
            images: [],
            albums: [],
            categories: [],
        });
    }
}
