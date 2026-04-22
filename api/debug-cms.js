import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({
                siteId: process.env.VITE_WIX_SITE_ID,
                apiKey: process.env.VITE_WIX_API_KEY,
            }),
        });

        const results = {};

        // Test Popup collection — read
        try {
            const popupResult = await wixClient.items
                .query('Popup')
                .limit(1)
                .find();
            
            results.popup = {
                totalCount: popupResult.totalCount || popupResult.items?.length || 0,
                sampleFieldKeys: popupResult.items?.[0] 
                    ? Object.keys(popupResult.items[0])
                    : 'No items',
                sampleData: popupResult.items?.[0] || null,
            };
        } catch (e) {
            results.popup = { error: e.message };
        }

        // Test LandingsdeCiudad collection — read
        try {
            const landingsResult = await wixClient.items
                .query('LandingsdeCiudad')
                .limit(2)
                .find();
            
            results.landings = {
                totalCount: landingsResult.totalCount || landingsResult.items?.length || 0,
                sampleFieldKeys: landingsResult.items?.[0]
                    ? Object.keys(landingsResult.items[0])
                    : 'No items',
                sampleData: landingsResult.items?.[0] || null,
                allSlugs: (landingsResult.items || []).map(i => i?.slug).filter(Boolean),
            };
        } catch (e) {
            results.landings = { error: e.message };
        }

        // Test write to Popup
        try {
            const testData = {
                title_fld: 'debug-test@test.com',
                nombre: 'DEBUG TEST - Borrar',
                telfono: '0000000000',
                ciudad: 'Test',
                viajeDeInteres: 'Test',
                mensaje: 'Automated debug test',
            };
            const result = await wixClient.items.insert('Popup', testData);
            results.popupWrite = {
                success: true,
                insertedId: result?._id,
                returnedData: result || null,
            };
        } catch (e) {
            results.popupWrite = { error: e.message, details: e.details || null };
        }

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
