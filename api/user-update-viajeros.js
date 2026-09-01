import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * POST /api/user-update-viajeros
 * Updates passengers / travelers data in 'ReservasdeViaje' Wix CMS
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.status(200).end()

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' })
    }

    const { reservaId, viajeros, notasAdicionales } = req.body || {}

    if (!reservaId) {
        return res.status(400).json({ error: 'Falta el ID de la reserva (reservaId).' })
    }

    if (!Array.isArray(viajeros) || viajeros.length === 0) {
        return res.status(400).json({ error: 'Debes proporcionar al menos un pasajero.' })
    }

    try {
        const apiKey = process.env.VITE_WIX_API_KEY
        const siteId = process.env.VITE_WIX_SITE_ID
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({ siteId, apiKey }),
        })

        // 1. Fetch or resolve reservation record
        let currentItem = null
        try {
            currentItem = await wixClient.items.get('ReservasdeViaje', reservaId).catch(() => null)
        } catch (e) {
            // ignore get error
        }

        if (!currentItem) {
            try {
                const searchRes = await wixClient.items.query('ReservasdeViaje').descending('_createdDate').limit(50).find()
                currentItem = searchRes.items?.find(r => 
                    r._id === reservaId || 
                    (r.desgloseCompleto || '').includes(reservaId) ||
                    (reservaId.startsWith('RUTA-') && (r.desgloseCompleto || '').includes(reservaId))
                )
            } catch (sErr) {
                // ignore
            }
        }

        // 2. Format detailed text for passengers
        const formattedViajerosText = viajeros.map((v, i) => {
            return `Pasajero ${i + 1} (${v.type || 'Adulto'}): ${v.fullName || 'Sin nombre'} | Pasaporte: ${v.passport || 'Pendiente'} | Vigencia Pasaporte: ${v.passportExpiry || 'Pendiente (Mínimo 6 meses)'} | Edad: ${v.age || 'N/A'} | Nacimiento: ${v.birthDate || 'N/A'} | Nacionalidad: ${v.nationality || 'Mexicana'} | Teléfono: ${v.phone || 'N/A'}${v.dietary ? ` | Preferencias/Dieta: ${v.dietary}` : ''}`
        }).join('\n')

        // 3. Update or Insert record in ReservasdeViaje Wix CMS if applicable
        if (currentItem) {
            const updatedDesglose = (currentItem.desgloseCompleto || '')
                .replace(/\n\n--- DATOS DE PASAJEROS ACTUALIZADOS ---[\s\S]*/, '') +
                `\n\n--- DATOS DE PASAJEROS ACTUALIZADOS ---\n${formattedViajerosText}${notasAdicionales ? `\nNotas de Viaje: ${notasAdicionales}` : ''}`

            const updatedItem = {
                ...currentItem,
                desgloseCompleto: updatedDesglose,
                nombreCompleto: viajeros[0]?.fullName || currentItem.nombreCompleto,
                telfono: viajeros[0]?.phone || currentItem.telfono,
            }
            await wixClient.items.update('ReservasdeViaje', updatedItem).catch(err => console.error('Error updating ReservasdeViaje:', err.message))
        }

        // 4. Extract booking code (e.g. RUTA-1001)
        const codeMatch = ((currentItem?.desgloseCompleto || '') + ' ' + reservaId).match(/RUTA-\w+/i)
        const reservaCode = codeMatch ? codeMatch[0].toUpperCase() : (reservaId.startsWith('RUTA-') ? reservaId : `RUTA-${(currentItem?._id || reservaId).slice(0, 6).toUpperCase()}`)

        // 5. Update/Insert in 'PASAJEROS' CMS
        try {
            // Check existing passengers for this reservaCode
            const existingPas = await wixClient.items.query('PASAJEROS').eq('title', reservaCode).find()
            if (existingPas.items && existingPas.items.length > 0) {
                for (const oldP of existingPas.items) {
                    try {
                        await wixClient.items.remove('PASAJEROS', oldP._id)
                    } catch (remErr) {
                        // ignore remove error
                    }
                }
            }

            for (const v of viajeros) {
                await wixClient.items.insert('PASAJEROS', {
                    title: reservaCode,
                    nombreCompleto: v.fullName || 'Viajero',
                    edad: String(v.age || (v.type ? `${v.type} (${v.age || ''})` : 'Adulto')).trim(),
                    numeroPasaporte: v.passport || '',
                    fechaVigenciaPasaporte: v.passportExpiry || '',
                    nacionalidad: v.nationality || 'Mexicana',
                    telefono: v.phone || '',
                    correo: v.email || '',
                })
            }
            console.log(`[UserUpdateViajeros] ✅ Synced ${viajeros.length} rows in PASAJEROS CMS (${reservaCode}) with passport and 6-month validity info`)
        } catch (cmsPasErr) {
            console.error('[UserUpdateViajeros] Error updating PASAJEROS collection:', cmsPasErr.message)
        }

        console.log(`[UserUpdateViajeros] ✅ Updated ${viajeros.length} passengers for Reserva ${reservaId}`)

        return res.status(200).json({
            success: true,
            message: 'Datos de pasajeros actualizados correctamente.',
            reservaId: currentItem?._id || reservaId,
            viajerosActualizados: viajeros.length
        })
    } catch (error) {
        console.error('[UserUpdateViajeros API] Error updating passengers:', error)
        return res.status(500).json({ error: error.message || 'Error al actualizar los datos en Wix CMS' })
    }
}
