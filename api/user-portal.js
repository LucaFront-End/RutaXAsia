import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * GET /api/user-portal?email=...&memberId=...&reserva=...
 * Consolidates all user data: Profile, Bookings (ReservasdeViaje), Installments (Pagosprogramados), Extras (ExtrasReserva)
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { email, memberId, reserva } = req.query || {}
    const queryEmail = (email || '').trim().toLowerCase()
    const queryMemberId = (memberId || '').trim()
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

        // 1. Fetch Member Info from Wix Members API
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

        // 2. Fetch Bookings from 'ReservasdeViaje' CMS
        let reservas = []
        try {
            const query = wixClient.items.query('ReservasdeViaje')
            const allItemsRes = await query.descending('_createdDate').limit(50).find()
            const allItems = allItemsRes.items || []

            reservas = allItems.filter(r => {
                const rEmail = (r.correoElectrnico || '').toLowerCase().trim()
                const rText = (r.desgloseCompleto || '') + ' ' + (r._id || '')
                if (effectiveEmail && rEmail === effectiveEmail) return true
                if (queryReserva && rText.includes(queryReserva)) return true
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
                const pTitle = (p.title || '').trim()
                const pReserva = (p.reserva || '').trim().toUpperCase()

                if (effectiveEmail && pEmail === effectiveEmail) return true
                if (effectiveMemberId && pTitle === effectiveMemberId) return true
                if (queryReserva && pReserva.includes(queryReserva)) return true
                return false
            })
        } catch (pErr) {
            console.error('[UserPortal] Error fetching Pagosprogramados:', pErr.message)
        }

        // 4. Fetch Extras & Experiences from 'ExtrasReserva' CMS
        let extras = []
        try {
            const queryExtras = wixClient.items.query('ExtrasReserva')
            const allExtrasRes = await queryExtras.descending('_createdDate').limit(100).find()
            const allExtras = allExtrasRes.items || []

            // Match by booking codes in reservas or pagosProgramados
            const matchedReservaCodes = new Set()
            if (queryReserva) matchedReservaCodes.add(queryReserva)
            pagosProgramados.forEach(p => {
                if (p.reserva) {
                    const baseCode = p.reserva.split('-').slice(0, 2).join('-')
                    matchedReservaCodes.add(baseCode)
                    matchedReservaCodes.add(p.reserva)
                }
            })

            extras = allExtras.filter(ex => {
                if (!ex.reserva) return false
                const exRes = ex.reserva.toUpperCase()
                for (const code of matchedReservaCodes) {
                    if (exRes.includes(code) || code.includes(exRes)) return true
                }
                return false
            })
        } catch (exErr) {
            console.error('[UserPortal] Error fetching ExtrasReserva:', exErr.message)
        }

        // 5. Fetch Active Quotes from 'COTIZACIONES' CMS
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
                name: memberProfile?.profile?.nickname || memberProfile?.profile?.firstName || reservas[0]?.nombreCompleto || 'Viajero RutaXAsia',
                phone: memberProfile?.profile?.phones?.[0] || reservas[0]?.telfono || '',
                profile: memberProfile?.profile || null
            },
            reservas,
            pagosProgramados,
            extras,
            cotizaciones
        })
    } catch (error) {
        console.error('[UserPortal API] Fatal error:', error)
        return res.status(500).json({ error: error.message || 'Error al cargar el portal de usuario' })
    }
}
