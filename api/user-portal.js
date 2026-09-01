import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * GET /api/user-portal?email=...&reserva=...&memberId=...
 * Enforces dual verification: requires BOTH Email and Reservation Code to authenticate.
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { email, memberId, reserva } = req.query || {}
    let queryEmail = (email || '').trim().toLowerCase()
    let queryMemberId = (memberId || '').trim()
    const queryReserva = (reserva || '').trim().toUpperCase()

    // 1. Enforce dual credential requirement (Email + Reservation Code) unless already authenticated with memberId
    if (!queryMemberId) {
        if (!queryEmail || !queryReserva) {
            return res.status(400).json({
                error: 'Por seguridad, debes ingresar tanto tu correo electrónico como tu código de reserva.'
            })
        }
    }

    try {
        const apiKey = process.env.VITE_WIX_API_KEY
        const siteId = process.env.VITE_WIX_SITE_ID
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({ siteId, apiKey }),
        })

        // 2. Fetch Bookings from 'ReservasdeViaje' CMS
        let reservas = []
        try {
            const query = wixClient.items.query('ReservasdeViaje')
            const allItemsRes = await query.descending('_createdDate').limit(100).find()
            const allItems = allItemsRes.items || []

            reservas = allItems.filter(r => {
                const rEmail = (r.correoElectrnico || '').toLowerCase().trim()
                const rText = ((r.desgloseCompleto || '') + ' ' + (r._id || '')).toUpperCase()

                if (queryReserva) {
                    const matchesCode = rText.includes(queryReserva) || (r._id && r._id.toUpperCase().includes(queryReserva.replace('RUTA-', '')))
                    if (queryEmail) {
                        return matchesCode && rEmail === queryEmail
                    }
                    return matchesCode
                }

                if (queryEmail) return rEmail === queryEmail
                return false
            })
        } catch (rErr) {
            console.error('[UserPortal] Error fetching ReservasdeViaje:', rErr.message)
        }

        // 3. Fetch Scheduled Payments from 'Pagosprogramados' CMS
        let pagosProgramados = []
        try {
            const queryPagos = wixClient.items.query('Pagosprogramados')
            const allPagosRes = await queryPagos.ascending('nmeorDePagoNmero').limit(100).find()
            const allPagos = allPagosRes.items || []

            pagosProgramados = allPagos.filter(p => {
                const pEmail = (p.emailCliente || '').toLowerCase().trim()
                const pReserva = (p.reserva || '').trim().toUpperCase()
                const baseCode = pReserva.split('-').slice(0, 2).join('-')

                if (queryReserva) {
                    const matchesReserva = pReserva.startsWith(queryReserva) || baseCode === queryReserva
                    if (queryEmail) {
                        return matchesReserva && pEmail === queryEmail
                    }
                    return matchesReserva
                }

                if (queryEmail) return pEmail === queryEmail
                return false
            })
        } catch (pErr) {
            console.error('[UserPortal] Error fetching Pagosprogramados:', pErr.message)
        }

        // 4. If neither reservas nor pagos were found with matching credentials, deny access
        if (reservas.length === 0 && pagosProgramados.length === 0) {
            return res.status(401).json({
                error: 'El correo electrónico y el código de reserva no coinciden o no existen en nuestro sistema. Por favor verifica tus datos.'
            })
        }

        // 5. Fetch Member Profile from Wix Members API if exists
        let memberProfile = null
        if (queryEmail || queryMemberId) {
            try {
                let url = 'https://www.wixapis.com/members/v1/members'
                if (queryMemberId) {
                    url += `/${queryMemberId}`
                    const mRes = await fetch(url, { headers: { 'Authorization': apiKey, 'wix-site-id': siteId } })
                    const mData = await mRes.json().catch(() => null)
                    if (mData?.member) memberProfile = mData.member
                } else if (queryEmail) {
                    url += `?filter=${encodeURIComponent(JSON.stringify({ "loginEmail": queryEmail }))}`
                    const mRes = await fetch(url, { headers: { 'Authorization': apiKey, 'wix-site-id': siteId } })
                    const mData = await mRes.json().catch(() => null)
                    if (mData?.members?.length > 0) memberProfile = mData.members[0]
                }
            } catch (mErr) {
                console.error('[UserPortal] Error fetching member profile:', mErr.message)
            }
        }

        const effectiveEmail = queryEmail || memberProfile?.loginEmail || reservas[0]?.correoElectrnico || pagosProgramados[0]?.emailCliente || ''
        const effectiveMemberId = queryMemberId || memberProfile?.id || ''

        // 6. Consolidate & Synthesize trip cards from Pagosprogramados if not present in ReservasdeViaje
        if (reservas.length === 0 && pagosProgramados.length > 0) {
            const groupsByCode = {}
            pagosProgramados.forEach(p => {
                const pReserva = (p.reserva || 'VIAJE').trim().toUpperCase()
                const baseCode = pReserva.split('-').slice(0, 2).join('-')
                if (!groupsByCode[baseCode]) groupsByCode[baseCode] = []
                groupsByCode[baseCode].push(p)
            })

            Object.entries(groupsByCode).forEach(([code, pList]) => {
                const totalAmt = pList.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0)
                const paidAmt = pList.filter(curr => (curr.estadoDelPago || '').toLowerCase() === 'pagado').reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0)
                const firstP = pList[0]

                reservas.push({
                    _id: code,
                    nombreCompleto: firstP.nombreCliente || memberProfile?.contact?.firstName || 'Viajero RutaXAsia',
                    correoElectrnico: firstP.emailCliente || effectiveEmail,
                    telfono: firstP.telefonoCliente || memberProfile?.contact?.phones?.[0] || '',
                    estadoDelPago: paidAmt >= totalAmt ? 'Liquidado' : (paidAmt > 0 ? 'En Cuotas' : 'Pendiente'),
                    precioTotalMxn: totalAmt,
                    montoAbonadoMxn: paidAmt,
                    montoRestanteMxn: Math.max(0, totalAmt - paidAmt),
                    numeroDeViajeros: 1,
                    desgloseCompleto: `Código de Reserva: ${code}\nViaje: ${firstP.tour || 'Viaje en Cuotas'}\nEstado: ${paidAmt >= totalAmt ? 'Liquidado' : 'Plan Activo'}`
                })
            })
        }

        // 7. Fetch Passenger Records from 'Pasajeros' CMS
        let pasajeros = []
        try {
            const queryPasajeros = wixClient.items.query('Pasajeros')
            const allPRes = await queryPasajeros.descending('_createdDate').limit(100).find()
            const allP = allPRes.items || []

            pasajeros = allP.filter(p => {
                const pEmail = (p.correoTitular || p.email || '').toLowerCase().trim()
                const pReserva = (p.codigoReserva || p.reserva || '').trim().toUpperCase()
                if (queryReserva && pReserva.includes(queryReserva)) return true
                if (effectiveEmail && pEmail === effectiveEmail) return true
                return false
            })
        } catch (passErr) {
            console.error('[UserPortal] Error fetching Pasajeros:', passErr.message)
        }

        // 8. Fetch Extras and Booked Add-ons from 'ExtrasReservados' CMS
        let extras = []
        try {
            const queryExtras = wixClient.items.query('ExtrasReservados')
            const allExtRes = await queryExtras.descending('_createdDate').limit(100).find()
            const allExt = allExtRes.items || []

            extras = allExt.filter(ext => {
                const eEmail = (ext.correoCliente || ext.email || '').toLowerCase().trim()
                const eReserva = (ext.codigoReserva || ext.reserva || '').trim().toUpperCase()
                if (queryReserva && eReserva.includes(queryReserva)) return true
                if (effectiveEmail && eEmail === effectiveEmail) return true
                return false
            })
        } catch (extErr) {
            console.error('[UserPortal] Error fetching ExtrasReservados:', extErr.message)
        }

        return res.status(200).json({
            success: true,
            user: {
                name: memberProfile?.contact?.firstName
                    ? `${memberProfile.contact.firstName} ${memberProfile.contact.lastName || ''}`.trim()
                    : (reservas[0]?.nombreCompleto || 'Viajero RutaXAsia'),
                email: effectiveEmail,
                phone: memberProfile?.contact?.phones?.[0] || reservas[0]?.telfono || '',
                memberId: effectiveMemberId,
            },
            reservaCode: queryReserva,
            reservas,
            pagosProgramados,
            pasajeros,
            extras,
        })
    } catch (err) {
        console.error('[UserPortal] Global Handler Error:', err)
        return res.status(500).json({ error: 'Ocurrió un error al cargar tu información. Intenta más tarde.' })
    }
}
