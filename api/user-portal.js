import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * GET /api/user-portal?email=...&contactId=...&memberId=...&reserva=...
 * Consolidates user data strictly isolated by Buyer Email or Contact ID
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { email, contactId, memberId, reserva } = req.query || {}
    let queryEmail = (email || '').trim().toLowerCase()
    let queryContactId = (contactId || '').trim()
    let queryMemberId = (memberId || '').trim()
    const queryReserva = (reserva || '').trim().toUpperCase()

    if (!queryEmail && !queryContactId && !queryMemberId && !queryReserva) {
        return res.status(400).json({ error: 'Debes proporcionar tu correo electrónico o iniciar sesión para acceder a tu panel.' })
    }

    try {
        const apiKey = process.env.VITE_WIX_API_KEY
        const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
        const wixClient = createClient({
            modules: { items },
            auth: ApiKeyStrategy({ siteId, apiKey }),
        })

        // 1. Fetch User Profile from CuentasViajeros if registered
        let userAccount = null
        if (queryEmail) {
            try {
                const accQ = await wixClient.items.query('CuentasViajeros')
                    .eq('title', queryEmail)
                    .limit(1)
                    .find()
                userAccount = accQ.items?.[0]
                if (userAccount) {
                    if (!queryContactId && userAccount.contactId) queryContactId = userAccount.contactId
                    if (!queryMemberId && userAccount.memberId) queryMemberId = userAccount.memberId
                }
            } catch (accErr) {
                console.warn('[UserPortal] Notice querying CuentasViajeros:', accErr.message)
            }
        }

        // 2. Fetch Wix Contact CRM Profile if needed
        let contactProfile = null
        if (queryContactId || queryEmail) {
            try {
                if (queryContactId && !queryContactId.startsWith('CNT-') && queryContactId !== '0fd8d34b-f6c0-43bd-be2c-c531fced4030') {
                    const cRes = await fetch(`https://www.wixapis.com/contacts/v4/contacts/${queryContactId}`, {
                        headers: { 'Authorization': apiKey, 'wix-site-id': siteId }
                    })
                    const cData = await cRes.json().catch(() => null)
                    if (cData?.contact) contactProfile = cData.contact
                } else if (queryEmail) {
                    const cRes = await fetch('https://www.wixapis.com/contacts/v4/contacts?paging.limit=100', {
                        headers: { 'Authorization': apiKey, 'wix-site-id': siteId }
                    })
                    const cData = await cRes.json().catch(() => null)
                    const contacts = cData?.contacts || []
                    const matched = contacts.find(c => {
                        const primaryEmail = (c.primaryInfo?.email || '').trim().toLowerCase()
                        const itemEmails = (c.info?.emails?.items || []).map(e => (e.email || '').trim().toLowerCase())
                        return primaryEmail === queryEmail || itemEmails.includes(queryEmail)
                    })
                    if (matched) {
                        contactProfile = matched
                        queryContactId = matched.id
                    }
                }
            } catch (cErr) {
                console.warn('[UserPortal] Contact lookup error:', cErr.message)
            }
        }

        const effectiveEmail = queryEmail || userAccount?.email || contactProfile?.info?.emails?.items?.[0]?.email || ''
        const effectiveContactId = queryContactId || userAccount?.contactId || contactProfile?.id || ''
        const effectiveMemberId = queryMemberId || userAccount?.memberId || effectiveContactId

        // 3. Fetch Bookings from 'ReservasdeViaje' CMS strictly for this user
        let reservas = []
        try {
            const query = wixClient.items.query('ReservasdeViaje')
            const allItemsRes = await query.descending('_createdDate').limit(100).find()
            const allItems = allItemsRes.items || []

            reservas = allItems.filter(r => {
                const rEmail = (r.correoElectrnico || '').toLowerCase().trim()
                const rTitle = (r.title || '').trim()
                const rText = ((r.desgloseCompleto || '') + ' ' + (r._id || '')).toUpperCase()

                if (queryReserva && rText.includes(queryReserva)) return true
                if (effectiveEmail && rEmail === effectiveEmail) return true
                if (effectiveContactId && (rTitle === effectiveContactId || r.contactId === effectiveContactId)) return true
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

                if (queryReserva && (pReserva.startsWith(queryReserva) || baseCode === queryReserva)) return true
                if (effectiveEmail && pEmail === effectiveEmail) return true
                if (userReservaCodes.has(baseCode) || userReservaCodes.has(pReserva)) return true
                if (effectiveContactId && p.title === effectiveContactId) return true
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

        // Synthesize trip cards from Pagosprogramados if not present in ReservasdeViaje
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
                    nombreCompleto: firstP.nombreCliente || userAccount?.nombreCompleto || 'Viajero RutaXAsia',
                    correoElectrnico: firstP.emailCliente || effectiveEmail,
                    telfono: firstP.telefonoCliente || userAccount?.telefono || '',
                    estadoDelPago: paidAmt >= totalAmt ? 'Liquidado' : (paidAmt > 0 ? 'En Cuotas' : 'Pendiente'),
                    precioTotalMxn: totalAmt,
                    montoAbonadoMxn: paidAmt,
                    montoRestanteMxn: Math.max(0, totalAmt - paidAmt),
                    numeroDeViajeros: 1,
                    desgloseCompleto: `Código de Reserva: ${code}\nViaje: ${firstP.tour || 'Viaje en Cuotas'}\nEstado: ${paidAmt >= totalAmt ? 'Liquidado' : 'Plan Activo'}`
                })
            })
        }

        // 6. Fetch Passenger Records from 'PASAJEROS' / 'Pasajeros' CMS
        let pasajeros = []
        try {
            const queryPasajeros = wixClient.items.query('PASAJEROS')
            const allPRes = await queryPasajeros.descending('_createdDate').limit(100).find()
            const allP = allPRes.items || []

            pasajeros = allP.filter(p => {
                const pEmail = (p.correoTitular || p.email || '').toLowerCase().trim()
                const pReserva = (p.codigoReserva || p.reserva || '').trim().toUpperCase()
                if (queryReserva && pReserva.includes(queryReserva)) return true
                if (effectiveEmail && pEmail === effectiveEmail) return true
                return false
            })
        } catch {
            // best-effort
        }

        // 7. Fetch Extras and Booked Add-ons from 'ExtrasReserva' / 'ExtrasReservados' CMS
        let extras = []
        try {
            const queryExtras = wixClient.items.query('ExtrasReserva')
            const allExtRes = await queryExtras.descending('_createdDate').limit(100).find()
            const allExt = allExtRes.items || []

            extras = allExt.filter(ext => {
                const eEmail = (ext.correoCliente || ext.email || '').toLowerCase().trim()
                const eReserva = (ext.codigoReserva || ext.reserva || '').trim().toUpperCase()
                if (queryReserva && eReserva.includes(queryReserva)) return true
                if (effectiveEmail && eEmail === effectiveEmail) return true
                return false
            })
        } catch {
            // best-effort
        }

        // 8. Fetch User's Submitted Reviews from 'Resenas' CMS
        let misResenas = []
        try {
            const queryResenas = wixClient.items.query('Resenas')
            const allResenasRes = await queryResenas.descending('_createdDate').limit(100).find()
            const allResenas = allResenasRes.items || []

            misResenas = allResenas.filter(rev => {
                const rEmail = (rev.correo || rev.email || '').toLowerCase().trim()
                const rTitle = (rev.title || '').trim()

                if (effectiveEmail && rEmail === effectiveEmail) return true
                if (effectiveContactId && rTitle === effectiveContactId) return true
                if (effectiveMemberId && rTitle === effectiveMemberId) return true
                return false
            }).map(rev => {
                let trip = 'Experiencia RutaXAsia'
                let rawComment = rev.comentarioYExperiencia || rev.comentario || rev.comment || ''
                const tagMatch = rawComment.match(/^\[(.*?)\]\s*/)
                if (tagMatch) {
                    trip = tagMatch[1]
                    rawComment = rawComment.replace(/^\[.*?\]\s*/, '')
                }

                const rawAprobado = String(rev.aprobado || '').trim().toLowerCase()
                const isApproved = rawAprobado === 'sí' || rawAprobado === 'si' || rawAprobado === 'true' || rawAprobado === 'aprobado' || rawAprobado === 'yes'

                return {
                    id: rev._id,
                    trip,
                    rating: Number(rev.calificacin || rev.calificacion || rev.rating) || 5,
                    comment: rawComment,
                    photo: rev.fotografa || rev.foto || rev.photo || '',
                    date: rev.fechaVisible || rev._createdDate,
                    aprobado: isApproved ? 'Sí' : 'No',
                    statusLabel: isApproved ? 'Publicada en la Web' : 'En revisión por el equipo',
                    isApproved,
                }
            })
        } catch (revErr) {
            console.warn('[UserPortal] Error fetching Resenas:', revErr.message)
        }

        // Compute resolved User Name
        const resolvedName = userAccount?.nombreCompleto
            || (contactProfile?.info?.name?.first ? `${contactProfile.info.name.first} ${contactProfile.info.name.last || ''}`.trim() : null)
            || reservas[0]?.nombreCompleto
            || pagosProgramados[0]?.nombreCliente
            || 'Viajero RutaXAsia'

        const resolvedPhone = userAccount?.telefono
            || contactProfile?.info?.phones?.items?.[0]?.phone
            || reservas[0]?.telfono
            || pagosProgramados[0]?.telefonoCliente
            || ''

        const resolvedCity = userAccount?.ciudad
            || contactProfile?.info?.addresses?.items?.[0]?.address?.city
            || 'México'

        const resolvedPhoto = userAccount?.fotoPerfil
            || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80'

        return res.status(200).json({
            success: true,
            user: {
                id: userAccount?._id || effectiveContactId,
                name: resolvedName,
                email: effectiveEmail,
                phone: resolvedPhone,
                city: resolvedCity,
                photo: resolvedPhoto,
                contactId: effectiveContactId,
                memberId: effectiveMemberId,
            },
            reservaCode: queryReserva,
            reservas,
            pagosProgramados,
            pasajeros,
            extras,
            misResenas,
        })
    } catch (err) {
        console.error('[UserPortal] Global Handler Error:', err)
        return res.status(500).json({ error: 'Ocurrió un error al cargar tu información. Intenta más tarde.' })
    }
}
