import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

const SITE_ID = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b';
const API_KEY = process.env.VITE_WIX_API_KEY;

function getWixClient() {
    return createClient({
        modules: { items },
        auth: ApiKeyStrategy({ siteId: SITE_ID, apiKey: API_KEY }),
    });
}

function formatWixImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) return url;
    if (url.startsWith('wix:image://v1/')) {
        const match = url.match(/wix:image:\/\/v1\/([^/#]+)/);
        if (match?.[1]) return `https://static.wixstatic.com/media/${match[1]}`;
    }
    return url;
}

function formatDateDisplay(dateVal) {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) throw new Error('invalid');
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
        const now = new Date();
        return `${months[now.getMonth()]} ${now.getFullYear()}`;
    }
}

function normalizeApproval(val) {
    const raw = String(val || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return raw === 'si' || raw === 'true' || raw === '1' || raw === 'aprobado' || raw === 'yes';
}

function parseReview(item) {
    let rawComment = item.comentarioYExperiencia || item.comentario || item.comment || item.mensaje || '';
    let trip = 'Experiencia RutaXAsia';

    const tagMatch = rawComment.match(/^\[(.*?)\]\s*/);
    if (tagMatch) {
        trip = tagMatch[1];
        rawComment = rawComment.replace(/^\[.*?\]\s*/, '');
    }

    const lowerTrip = trip.toLowerCase();
    let season = 'all';
    if (lowerTrip.includes('sakura') || lowerTrip.includes('primavera')) season = 'sakura';
    else if (lowerTrip.includes('verano') || lowerTrip.includes('festival') || lowerTrip.includes('akari')) season = 'verano';
    else if (lowerTrip.includes('otoño') || lowerTrip.includes('momiji') || lowerTrip.includes('kamakura')) season = 'otono';
    else if (lowerTrip.includes('corea')) season = 'corea';

    const photoUrl = formatWixImageUrl(item.fotografa || item.foto || item.photo || item.imagen)
        || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80';

    return {
        id: item._id,
        name: item.nombre || item.name || 'Viajero RutaXAsia',
        city: item.ciudad || item.city || item.estado || 'México',
        trip,
        season,
        rating: Math.min(5, Math.max(1, Number(item.calificacin || item.calificacion || item.rating) || 5)),
        date: formatDateDisplay(item.fechaVisible || item._createdDate),
        photo: photoUrl,
        tripPhoto: photoUrl,
        comment: rawComment,
        likes: Math.floor(Math.random() * 15) + 12,
        verified: true,
    };
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // ==========================================
    // GET: Return only APPROVED reviews
    // ==========================================
    if (req.method === 'GET') {
        try {
            const wixClient = getWixClient();
            const queryRes = await wixClient.items.query('Resenas')
                .descending('_createdDate')
                .limit(100)
                .find();

            const approved = (queryRes.items || []).filter(item => normalizeApproval(item.aprobado));
            const reviews = approved.map(parseReview);

            return res.status(200).json({ success: true, reviews, total: reviews.length });
        } catch (error) {
            console.error('[resenas] GET error:', error.message);
            return res.status(500).json({ success: false, error: error.message, reviews: [] });
        }
    }

    // ==========================================
    // POST: Submit new review (pending approval)
    // ==========================================
    if (req.method === 'POST') {
        try {
            const { name, email, phone, city, trip, rating, comment, photo } = req.body || {};

            if (!name || !comment) {
                return res.status(400).json({ success: false, error: 'El nombre y el comentario son campos requeridos.' });
            }

            const wixClient = getWixClient();

            // Find existing user account or contact ID to link the review
            let userTitleId = `REV-${Date.now()}`;
            let userPhoto = photo || '';

            if (email) {
                const cleanEmail = email.trim().toLowerCase();
                try {
                    const accQ = await wixClient.items.query('CuentasViajeros').eq('title', cleanEmail).limit(1).find();
                    if (accQ.items?.[0]) {
                        userTitleId = accQ.items[0].contactId || accQ.items[0]._id || userTitleId;
                        if (!userPhoto && accQ.items[0].fotoPerfil) userPhoto = accQ.items[0].fotoPerfil;
                    }
                } catch {
                    // best-effort
                }
            }

            const payload = {
                title: userTitleId,
                nombre: name.trim(),
                correo: email?.trim() || '',
                telfono: phone?.trim() || '',
                ciudad: city?.trim() || 'México',
                calificacin: Math.min(5, Math.max(1, Number(rating) || 5)),
                comentarioYExperiencia: trip ? `[${trip}] ${comment.trim()}` : comment.trim(),
                fotografa: userPhoto,
                aprobado: 'No',
                fechaVisible: new Date(),
            };

            const inserted = await wixClient.items.insert('Resenas', payload);

            return res.status(201).json({
                success: true,
                pendingApproval: true,
                id: inserted._id,
                message: '¡Tu reseña fue enviada con éxito y será publicada una vez aprobada por nuestro equipo!',
            });
        } catch (error) {
            console.error('[resenas] POST error:', error.message);
            return res.status(500).json({ success: false, error: error.message || 'Error al guardar la reseña.' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
