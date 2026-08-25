import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * GET /api/user-portal?email=...&memberId=...&reserva=...
 * Consolidates user data strictly isolated by Buyer Email or Reservation Code
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

        // 1. If searching by reservation code, resolve associated email and memberId first
        if (queryReserva) {
            try {
                // Check in ReservasdeViaje
                const resQuery = await wixClient.items.query('ReservasdeViaje').descending('_createdDate').limit(50).find()
                const matchingR = resQuery.items?.find(r => (r.desgloseCompleto || '').includes(queryReserva) || (r._id && r._id.toUpperCase().includes(queryReserva.replace('RUTA-', ''))))
                if (matchingR && matchingR.correoElectrnico) {
                    queryEmail = matchingR.correoElectrnico.toLowerCase().trim()
                }

                // Check in Pagosprogramados
                if (!queryEmail) {
                    const pagosMatch = await wixClient.items.query('Pagosprogramados').startsWith('reserva', queryReserva).find()
                    if (pagosMatch.items && pagosMatch.items.length > 0) {
                        const firstP = pagosMatch.items[0]
                        if (firstP.emailCliente) queryEmail = firstP.emailCliente.toLowerCase()
                        if (!queryMemberId && firstP.title && firstP.title.length > 10) queryMemberId = firstP.title
                    }
                }
            } catch (e) {
                // ignore
            }
        }

        // 2. Fetch Member Profile from Wix Members API
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

        // 3. Fetch Bookings from 'ReservasdeViaje' CMS strictly for this user/reserva
        let reservas = []
        try {
            const query = wixClient.items.query('ReservasdeViaje')
            const allItemsRes = await query.descending('_createdDate').limit(100).find()
            const allItems = allItemsRes.items || []

            reservas = allItems.filter(r => {
                const rEmail = (r.correoElectrnico || '').toLowerCase().trim()
                const rText = (r.desgloseCompleto || '') + ' ' + (r._id || '')

                if (queryReserva) {
                    return rText.includes(queryReserva)
                }
                if (effectiveEmail && rEmail === effectiveEmail) return true
                return false
            })
        } catch (rErr) {
            console.error('[UserPortal] Error fetching ReservasdeViaje:', rErr.message)
        }

        // 4. Compute exact user reservation codes set
        const userReservaCodes = new Set()
        if (queryReserva) userReservaCodes.add(queryReserva)
        reservas.forEach(r => {
            const codeMatch = (r.desgloseCompleto || '').match(/RUTA-\w+/i)
            if (codeMatch) userReservaCodes.add(codeMatch[0].toUpperCase())
            if (r._id) userReservaCodes.add(`RUTA-${r._id.slice(0, 6).toUpperCase()}`)
        })

        // 5. Fetch Scheduled Payments from 'Pagosprogramados' CMS strictly for this user
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
                    return pReserva.startsWith(queryReserva) || baseCode === queryReserva
                }
                if (effectiveEmail && pEmail === effectiveEmail) return true
                if (userReservaCodes.has(baseCode) || userReservaCodes.has(pReserva)) return true
                return false
            })
        } catch (pErr) {
            console.error('[UserPortal] Error fetching Pagosprogramados:', pErr.message)
        }

        // Add any codes found in user's payments to userReservaCodes
        pagosProgramados.forEach(p => {
            if (p.reserva) {
                const baseCode = p.reserva.split('-').slice(0, 2).join('-')
                userReservaCodes.add(baseCode)
            }
        })

        // Consolidate & Synthesize trip cards from Pagosprogramados if not present in ReservasdeViaje
        if (pagosProgramados.length > 0) {
            const pagosByCode = {}
            pagosProgramados.forEach(p => {
                const pRes = (p.reserva || '').trim().toUpperCase()
                const baseCode = pRes.split('-').slice(0, 2).join('-') || 'RUTA-1001'
                if (!pagosByCode[baseCode]) pagosByCode[baseCode] = []
                pagosByCode[baseCode].push(p)
                userReservaCodes.add(baseCode)
            })

            Object.entries(pagosByCode).forEach(([code, codePagos]) => {
                const alreadyExists = reservas.some(r => {
                    const rText = (r.desgloseCompleto || '') + ' ' + (r._id || '')
                    return rText.toUpperCase().includes(code)
                })

                if (!alreadyExists) {
                    const firstP = codePagos[0]
                    const totalEstimated = codePagos.reduce((sum, p) => sum + (Number(p.importeNmero) || 0), 0)
                    const hasPaid = codePagos.some(p => (p.estatus || p.estado || '').toUpperCase().includes('PAGAD') || p.fechaDePago || p.fechaPago)

                    reservas.push({
                        _id: firstP._id || `reserva-${code}`,
                        reservaCode: code,
                        nombreCompleto: firstP.cliente || memberProfile?.profile?.nickname || 'Viajero RutaXAsia',
                        correoElectrnico: firstP.emailCliente || effectiveEmail,
                        telfono: memberProfile?.profile?.phones?.[0] || '',
                        temporada: firstP.concepto?.split('—')?.[1]?.trim() || firstP.concepto || 'Japón Sakura 2027',
                        modalidad: `Plan en Cuotas Mensuales (${codePagos.length} cuotas programadas)`,
                        totalEstimado: totalEstimated || 5000,
                        montoAnticipo: codePagos[0]?.importeNmero || 5000,
                        desgloseCompleto: `[Código de Reserva: ${code}]\n${firstP.concepto || 'Plan de pagos programados'}\nTotal de cuotas: ${codePagos.length}`,
                        estadoReserva: hasPaid ? 'Activo' : 'Pendiente',
                        fechaRegistro: firstP._createdDate || new Date().toISOString()
                    })
                }
            })
        }

        // 6. Fetch Extras & Experiences from 'ExtrasReserva' CMS strictly for this user
        let extras = []
        try {
            const queryExtras = wixClient.items.query('ExtrasReserva')
            const allExtrasRes = await queryExtras.descending('_createdDate').limit(100).find()
            const allExtras = allExtrasRes.items || []

            extras = allExtras.filter(ex => {
                if (!ex.reserva) return false
                const exRes = ex.reserva.toUpperCase()
                if (queryReserva) {
                    return exRes === queryReserva || exRes.startsWith(queryReserva)
                }
                for (const code of userReservaCodes) {
                    if (exRes === code || exRes.startsWith(code)) return true
                }
                return false
            })
        } catch (exErr) {
            console.error('[UserPortal] Error fetching ExtrasReserva:', exErr.message)
        }

        // 7. Fetch Passengers from 'PASAJEROS' CMS strictly for this user
        let pasajeros = []
        try {
            const queryPas = wixClient.items.query('PASAJEROS')
            const allPasRes = await queryPas.descending('_createdDate').limit(100).find()
            const allPas = allPasRes.items || []

            pasajeros = allPas.filter(pas => {
                const pasRes = (pas.title || '').trim().toUpperCase()
                const pasEmail = (pas.correo || pas.email || '').toLowerCase().trim()
                if (effectiveEmail && pasEmail === effectiveEmail) return true
                if (queryReserva && (pasRes === queryReserva || pasRes.startsWith(queryReserva))) return true
                for (const code of userReservaCodes) {
                    if (pasRes === code || pasRes.startsWith(code)) return true
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

        // Determine best user display name
        const displayName = reservas[0]?.nombreCompleto ||
            pagosProgramados[0]?.cliente ||
            cotizaciones[0]?.nombre ||
            memberProfile?.profile?.nickname ||
            memberProfile?.profile?.firstName ||
            'Viajero RutaXAsia'

        const displayPhone = reservas[0]?.telfono ||
            memberProfile?.profile?.phones?.[0] ||
            cotizaciones[0]?.telefono ||
            ''

        return res.status(200).json({
            success: true,
            user: {
                memberId: effectiveMemberId,
                email: effectiveEmail,
                name: displayName,
                phone: displayPhone,
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
