import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * GET /api/user-portal?email=...&memberId=...&reserva=...
 * Consolidates all user data: Profile, Bookings (ReservasdeViaje), Installments (Pagosprogramados), Extras (ExtrasReserva), Pasajeros (PASAJEROS)
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

    if (!queryEmail && !queryMemberId && !queryReserva) {
        return res.status(400).json({ error: 'Debes proporcionar un email, memberId o código de reserva para acceder.' })
    }

    try {
        const apiKey = process.env.VITE_WIX_API_KEY
        const siteId = process.env.VITE_WIX_SITE_ID
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({ siteId, apiKey }),
        })

        // 1. If searching by reservation code, resolve associated email and memberId from Pagosprogramados or PASAJEROS first
        if (queryReserva) {
            try {
                const pagosMatch = await wixClient.items.query('Pagosprogramados').startsWith('reserva', queryReserva).find()
                if (pagosMatch.items && pagosMatch.items.length > 0) {
                    const firstP = pagosMatch.items[0]
                    if (!queryEmail && firstP.emailCliente) queryEmail = firstP.emailCliente.toLowerCase()
                    if (!queryMemberId && firstP.title && firstP.title.length > 10) queryMemberId = firstP.title
                }
            } catch (e) {
                // ignore
            }
        }

        // 2. Fetch Member Info from Wix Members API
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

        const effectiveEmail = queryEmail || memberProfile?.loginEmail || ''
        const effectiveMemberId = queryMemberId || memberProfile?.id || ''

        // 3. Fetch Scheduled Payments from 'Pagosprogramados' CMS
        let pagosProgramados = []
        try {
            const queryPagos = wixClient.items.query('Pagosprogramados')
            const allPagosRes = await queryPagos.ascending('nmeorDePagoNmero').limit(100).find()
            const allPagos = allPagosRes.items || []

            pagosProgramados = allPagos.filter(p => {
                const pEmail = (p.emailCliente || '').toLowerCase().trim()
                const pTitle = (p.title || '').trim()
                const pReserva = (p.reserva || '').trim().toUpperCase()

                if (queryReserva) {
                    return pReserva.includes(queryReserva)
                }
                if (effectiveEmail && pEmail === effectiveEmail) return true
                if (effectiveMemberId && pTitle === effectiveMemberId) return true
                return false
            })
        } catch (pErr) {
            console.error('[UserPortal] Error fetching Pagosprogramados:', pErr.message)
        }

        // 4. Compute matched reservation codes
        const matchedReservaCodes = new Set()
        if (queryReserva) {
            matchedReservaCodes.add(queryReserva)
        } else {
            pagosProgramados.forEach(p => {
                if (p.reserva) {
                    const baseCode = p.reserva.split('-').slice(0, 2).join('-')
                    matchedReservaCodes.add(baseCode)
                    matchedReservaCodes.add(p.reserva)
                }
            })
        }

        // 5. Fetch Bookings from 'ReservasdeViaje' CMS
        let reservas = []
        try {
            const query = wixClient.items.query('ReservasdeViaje')
            const allItemsRes = await query.descending('_createdDate').limit(50).find()
            const allItems = allItemsRes.items || []

            reservas = allItems.filter(r => {
                const rEmail = (r.correoElectrnico || '').toLowerCase().trim()
                const rText = (r.desgloseCompleto || '') + ' ' + (r._id || '')

                if (queryReserva) {
                    return rText.includes(queryReserva)
                }
                if (effectiveEmail && rEmail === effectiveEmail) return true
                for (const code of matchedReservaCodes) {
                    if (rText.includes(code)) return true
                }
                return false
            })

            // If searching by queryReserva or specific booking and no exact record matched text, create synthetic reserva from payments
            if (reservas.length === 0 && pagosProgramados.length > 0) {
                const firstP = pagosProgramados[0]
                const totalEstimated = pagosProgramados.reduce((sum, p) => sum + (Number(p.importeNmero) || 0), 5000)
                reservas.push({
                    _id: firstP._id || 'reserva-synthetic',
                    nombreCompleto: firstP.cliente || memberProfile?.profile?.nickname || 'Viajero',
                    correoElectrnico: firstP.emailCliente || effectiveEmail,
                    telfono: memberProfile?.profile?.phones?.[0] || '',
                    temporada: firstP.concepto?.split('—')?.[1]?.trim() || 'Japón Sakura 2027',
                    modalidad: 'Plan en Cuotas Mensuales',
                    totalEstimado: totalEstimated,
                    montoAnticipo: 5000,
                    desgloseCompleto: `[Código de Reserva: ${queryReserva || firstP.reserva?.split('-').slice(0, 2).join('-')}]\n${firstP.concepto}`,
                    estadoReserva: 'No pagado',
                    fechaRegistro: firstP._createdDate || new Date().toISOString()
                })
            }
        } catch (rErr) {
            console.error('[UserPortal] Error fetching ReservasdeViaje:', rErr.message)
        }

        // 6. Fetch Extras & Experiences from 'ExtrasReserva' CMS
        let extras = []
        try {
            const queryExtras = wixClient.items.query('ExtrasReserva')
            const allExtrasRes = await queryExtras.descending('_createdDate').limit(100).find()
            const allExtras = allExtrasRes.items || []

            extras = allExtras.filter(ex => {
                if (!ex.reserva) return false
                const exRes = ex.reserva.toUpperCase()
                if (queryReserva) {
                    return exRes.includes(queryReserva) || queryReserva.includes(exRes)
                }
                for (const code of matchedReservaCodes) {
                    if (exRes.includes(code) || code.includes(exRes)) return true
                }
                return false
            })
        } catch (exErr) {
            console.error('[UserPortal] Error fetching ExtrasReserva:', exErr.message)
        }

        // 7. Fetch Passengers from 'PASAJEROS' CMS
        let pasajeros = []
        try {
            const queryPas = wixClient.items.query('PASAJEROS')
            const allPasRes = await queryPas.descending('_createdDate').limit(100).find()
            const allPas = allPasRes.items || []

            pasajeros = allPas.filter(pas => {
                if (!pas.title) return false
                const pasRes = pas.title.toUpperCase()
                if (queryReserva) {
                    return pasRes.includes(queryReserva) || queryReserva.includes(pasRes)
                }
                for (const code of matchedReservaCodes) {
                    if (pasRes.includes(code) || code.includes(pasRes)) return true
                }
                return false
            })
        } catch (pasErr) {
            console.error('[UserPortal] Error fetching PASAJEROS:', pasErr.message)
        }

        // 8. Fetch Active Quotes from 'COTIZACIONES' CMS
        let cotizaciones = []
        try {
            const queryCot = wixClient.items.query('COTIZACIONES')
            const allCotRes = await queryCot.descending('_createdDate').limit(20).find()
            const allCot = allCotRes.items || []

            cotizaciones = allCot.filter(c => {
                const cEmail = (c.correo || '').toLowerCase().trim()
                const cMember = (c.memberId || '').trim()
                if (effectiveEmail && cEmail === effectiveEmail) return true
                if (effectiveMemberId && cMember === effectiveMemberId) return true
                return false
            })
        } catch (cErr) {
            console.error('[UserPortal] Error fetching COTIZACIONES:', cErr.message)
        }

        return res.status(200).json({
            success: true,
            user: {
                memberId: effectiveMemberId,
                email: effectiveEmail,
                name: memberProfile?.profile?.nickname || memberProfile?.profile?.firstName || reservas[0]?.nombreCompleto || pagosProgramados[0]?.cliente || 'Viajero RutaXAsia',
                phone: memberProfile?.profile?.phones?.[0] || reservas[0]?.telfono || '',
                profile: memberProfile?.profile || null
            },
            reservas,
            pagosProgramados,
            extras,
            pasajeros,
            cotizaciones
        })
    } catch (error) {
        console.error('[UserPortal API] Fatal error:', error)
        return res.status(500).json({ error: error.message || 'Error al cargar el portal de usuario' })
    }
}
