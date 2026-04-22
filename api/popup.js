import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

/**
 * Server-side API endpoint for Popup form submission.
 * POST /api/popup — body: { nombre, telefono, correo, estado, viaje }
 *
 * CMS Collection: "Popup"
 * Field mapping (CSV display name → field key):
 *   Correo           → title_fld
 *   Nombre           → nombre
 *   Teléfono         → telfono
 *   Estado           → ciudad   (misleading ID, stores Estado)
 *   Viaje de interes → viajeDeInteres
 *   Mensaje          → mensaje
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { nombre, telefono, correo, estado, viaje, mensaje } = req.body || {};

        console.log('[Popup API] Received:', { nombre, telefono, correo, estado, viaje });

        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        const dataToInsert = {
            title_fld: correo || '',
            nombre: nombre || '',
            telfono: telefono || '',
            ciudad: estado || '',
            viajeDeInteres: viaje || '',
            mensaje: mensaje || '',
        };

        console.log('[Popup API] Inserting into Popup collection:', dataToInsert);

        const result = await wixClient.items.insert('Popup', dataToInsert);

        console.log('[Popup API] Success! ID:', result?._id);

        res.status(200).json({
            success: true,
            id: result?._id,
        });
    } catch (error) {
        console.error('[Popup API] Error:', error.message, error.details || '');
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.details || null,
        });
    }
}
