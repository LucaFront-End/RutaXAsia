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

        // Test Popup collection
        try {
            const popupResult = await wixClient.items
                .queryDataItems({ dataCollectionId: 'Popup' })
                .limit(1)
                .find();
            
            results.popup = {
                totalCount: popupResult.totalCount || 0,
                hasItems: (popupResult.items || []).length > 0,
                sampleFieldKeys: popupResult.items?.[0]?.data 
                    ? Object.keys(popupResult.items[0].data)
                    : 'No items found — cannot determine field keys',
                sampleData: popupResult.items?.[0]?.data || null,
            };
        } catch (e) {
            results.popup = { error: e.message };
        }

        // Test LandingsdeCiudad collection
        try {
            const landingsResult = await wixClient.items
                .queryDataItems({ dataCollectionId: 'LandingsdeCiudad' })
                .limit(2)
                .find();
            
            results.landings = {
                totalCount: landingsResult.totalCount || 0,
                hasItems: (landingsResult.items || []).length > 0,
                sampleFieldKeys: landingsResult.items?.[0]?.data 
                    ? Object.keys(landingsResult.items[0].data)
                    : 'No items found — cannot determine field keys',
                sampleData: landingsResult.items?.[0]?.data || null,
                allSlugs: (landingsResult.items || []).map(i => i.data?.slug).filter(Boolean),
            };
        } catch (e) {
            results.landings = { error: e.message };
        }

        // Test write to Popup
        try {
            const testWrite = await wixClient.items.insertDataItem({
                dataCollectionId: 'Popup',
                dataItem: {
                    data: {
                        nombre: 'TEST - Borrar',
                        correo: 'test@test.com',
                        telefono: '0000000000',
                        estado: 'Test',
                        viajeDeInteres: 'Test',
                        fuente: 'TEST - API Debug',
                        fecha: new Date().toISOString(),
                    },
                },
            });
            results.popupWrite = {
                success: true,
                insertedId: testWrite?.dataItem?._id,
                returnedData: testWrite?.dataItem?.data || null,
            };
        } catch (e) {
            results.popupWrite = { error: e.message, details: e.details || null };
        }

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
