import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import { members } from '@wix/members';

function getWixClient() {
    return createClient({
        modules: { items, members },
        auth: ApiKeyStrategy({
            siteId: process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b',
            apiKey: process.env.VITE_WIX_API_KEY,
        }),
    });
}

function formatWixImageUrl(wixUrl) {
    if (!wixUrl) return '';
    if (wixUrl.startsWith('http://') || wixUrl.startsWith('https://') || wixUrl.startsWith('data:image')) {
        return wixUrl;
    }
    if (wixUrl.startsWith('wix:image://v1/')) {
        const match = wixUrl.match(/wix:image:\/\/v1\/([^/#]+)/);
        if (match && match[1]) {
            return `https://static.wixstatic.com/media/${match[1]}`;
        }
    }
    return wixUrl;
}

function formatDateDisplay(dateVal) {
    if (!dateVal) {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const now = new Date();
        return `${months[now.getMonth()]} ${now.getFullYear()}`;
    }
    try {
        const d = new Date(dateVal);
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
        return 'Reciente';
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const wixClient = getWixClient();

    // ==========================================
    // GET: Query only APPROVED reviews from CMS
    // ==========================================
    if (req.method === 'GET') {
        try {
            const queryRes = await wixClient.items.query('Resenas')
                .descending('_createdDate')
                .limit(100)
                .find();
            const allItems = queryRes.items || [];

            // Filter for items where 'aprobado' is 'Sí', 'Si', 'SI', 'si', 'aprobado' or 'true'
            const approvedItems = allItems.filter(item => {
                const raw = String(item.aprobado || '').trim().toLowerCase();
                const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return normalized === 'si' || normalized === 'true' || normalized === '1' || normalized === 'aprobado' || normalized === 'yes';
            });

            const formattedReviews = approvedItems.map(item => {
                let trip = 'Experiencia RutaXAsia';
                let rawComment = item.comentarioYExperiencia || item.comentario || item.comment || item.mensaje || '';

                const tagMatch = rawComment.match(/^\[(.*?)\]\s*/);
                if (tagMatch) {
                    trip = tagMatch[1];
                    rawComment = rawComment.replace(/^\[.*?\]\s*/, '');
                }

                // Determine season tag
                let season = 'all';
                const lowerTrip = trip.toLowerCase();
                if (lowerTrip.includes('sakura') || lowerTrip.includes('primavera')) season = 'sakura';
                else if (lowerTrip.includes('verano') || lowerTrip.includes('festival') || lowerTrip.includes('akari')) season = 'verano';
                else if (lowerTrip.includes('otoño') || lowerTrip.includes('momiji') || lowerTrip.includes('kamakura')) season = 'otono';
                else if (lowerTrip.includes('corea')) season = 'corea';

                const photoUrl = formatWixImageUrl(item.fotografa || item.foto || item.photo || item.imagen) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80';

                return {
                    id: item._id,
                    name: item.nombre || item.name || 'Viajero RutaXAsia',
                    city: item.ciudad || item.city || item.estado || 'México',
                    trip,
                    season,
                    rating: Number(item.calificacin || item.calificacion || item.rating) || 5,
                    date: formatDateDisplay(item.fechaVisible || item._createdDate),
                    photo: photoUrl,
                    tripPhoto: photoUrl,
                    comment: rawComment,
                    likes: Math.floor(Math.random() * 15) + 12,
                    verified: true,
                };
            });

            return res.status(200).json({
                success: true,
                reviews: formattedReviews,
                total: formattedReviews.length,
            });
        } catch (error) {
            console.error('Error fetching approved reviews from Wix CMS:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                reviews: [],
            });
        }
    }

    // ==========================================
    // POST: Insert new review (Aprobado: 'No')
    // ==========================================
    if (req.method === 'POST') {
        try {
            const body = req.body || {};
            const {
                name,
                email,
                phone,
                city,
                trip,
                rating,
                comment,
                photo,
            } = body;

            if (!name || !comment) {
                return res.status(400).json({
                    success: false,
                    error: 'El nombre y el comentario son campos requeridos.',
                });
            }

            // Find member ID if exists
            let memberTitleId = `REV-${Date.now()}`;
            if (email) {
                try {
                    const memberQuery = await wixClient.members.queryMembers().eq('loginEmail', email.trim().toLowerCase()).find();
                    if (memberQuery.items && memberQuery.items.length > 0) {
                        memberTitleId = memberQuery.items[0]._id || memberTitleId;
                    }
                } catch {
                    // Ignore member lookup failure
                }
            }

            const formattedComment = trip ? `[${trip}] ${comment}` : comment;
            const now = new Date();

            const cmsPayload = {
                title: memberTitleId,
                nombre: name.trim(),
                correo: email ? email.trim() : '',
                telfono: phone ? phone.trim() : '',
                ciudad: city ? city.trim() : 'México',
                calificacin: Number(rating) || 5,
                comentarioYExperiencia: formattedComment,
                fotografa: photo || '',
                aprobado: 'No', // Pending moderation by staff
                fechaVisible: now,
            };

            const inserted = await wixClient.items.insert('Resenas', cmsPayload);

            return res.status(201).json({
                success: true,
                pendingApproval: true,
                id: inserted._id,
                message: '¡Tu reseña fue enviada con éxito y será publicada una vez aprobada por nuestro equipo!',
            });
        } catch (error) {
            console.error('Error creating review in Wix CMS:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al guardar la reseña en el CMS',
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
