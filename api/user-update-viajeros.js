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

        // 1. Fetch current reservation record
        const currentItem = await wixClient.items.get('ReservasdeViaje', reservaId)
        if (!currentItem) {
            return res.status(404).json({ error: 'Reserva no encontrada en Wix CMS.' })
        }

        // 2. Format detailed text for passengers
        const formattedViajerosText = viajeros.map((v, i) => {
            return `Pasajero ${i + 1} (${v.type || 'Adulto'}): ${v.fullName || 'Sin nombre'} | Pasaporte: ${v.passport || 'Pendiente'} | Edad: ${v.age || 'N/A'} | Nacimiento: ${v.birthDate || 'N/A'} | Nacionalidad: ${v.nationality || 'Mexicana'} | Teléfono: ${v.phone || 'N/A'}${v.dietary ? ` | Preferencias/Dieta: ${v.dietary}` : ''}`
        }).join('\n')

        // 3. Update record in Wix CMS
        const updatedDesglose = (currentItem.desgloseCompleto || '')
            .replace(/\n\n--- DATOS DE PASAJEROS ACTUALIZADOS ---[\s\S]*/, '') +
            `\n\n--- DATOS DE PASAJEROS ACTUALIZADOS ---\n${formattedViajerosText}${notasAdicionales ? `\nNotas de Viaje: ${notasAdicionales}` : ''}`

        const updatedItem = {
            ...currentItem,
            desgloseCompleto: updatedDesglose,
            nombreCompleto: viajeros[0]?.fullName || currentItem.nombreCompleto,
            telfono: viajeros[0]?.phone || currentItem.telfono,
        }

        const savedResult = await wixClient.items.update('ReservasdeViaje', updatedItem)

        console.log(`[UserUpdateViajeros] ✅ Updated ${viajeros.length} passengers for Reserva ${reservaId}`)

        return res.status(200).json({
            success: true,
            message: 'Datos de pasajeros actualizados correctamente en Wix CMS.',
            reservaId: savedResult._id,
            viajerosActualizados: viajeros.length
        })
    } catch (error) {
        console.error('[UserUpdateViajeros API] Error updating passengers:', error)
        return res.status(500).json({ error: error.message || 'Error al actualizar los datos en Wix CMS' })
    }
}
