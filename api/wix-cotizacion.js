import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * Wix Members & Abandoned Cart / Cotizaciones Engine
 * 
 * 1. Creates or finds a Member account in Wix Members API when buyer enters info in the modal
 * 2. Saves / updates the complete quotation and abandoned cart in Wix CMS 'COTIZACIONES'
 * 3. Generates custom recovery messages (e.g. "Te olvidaste de pagar el paquete Sakura Esencial 2027")
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const {
            cotizacionId = '',
            nombre = '',
            correo = '',
            telefono = '',
            temporada = '',
            estilo = '',
            totalPrice = 0,
            paymentAmount = 5000,
            packagePaymentMode = 'anticipo',
            selectedInstallments = 5,
            monthlyInstallment = 0,
            travelers = [],
            desglose = '',
            step = 1,
            action = 'step_advance', // 'step_advance' | 'modal_close' | 'checkout_initiated'
        } = req.body || {}

        const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
        const apiKey = process.env.VITE_WIX_API_KEY
        const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

        let memberId = null
        let contactId = null

        // 1. Create or Find Contact & Member in Wix Members API
        if (apiKey && correo && correo.includes('@')) {
            const nameParts = (nombre || '').trim().split(' ')
            const firstName = nameParts[0] || 'Viajero'
            const lastName = nameParts.slice(1).join(' ') || ''

            // A) Sincronizar Contacto en Wix CRM Contacts
            try {
                const contactRes = await fetch('https://www.wixapis.com/contacts/v4/contacts', {
                    method: 'POST',
                    headers: {
                        'Authorization': apiKey,
                        'wix-site-id': siteId,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        info: {
                            name: { first: firstName, last: lastName },
                            emails: { items: [{ tag: 'MAIN', email: correo, primary: true }] },
                            phones: telefono ? { items: [{ tag: 'MOBILE', phone: telefono, primary: true }] } : undefined
                        }
                    })
                })
                const contactData = await contactRes.json().catch(() => null)
                contactId = contactData?.contact?.id
            } catch (cErr) {
                // Silently ignore if contact already exists
            }

            // B) Buscar o Crear Miembro en Wix Members
            try {
                const searchRes = await fetch(`https://www.wixapis.com/members/v1/members?filter=${encodeURIComponent(JSON.stringify({ "loginEmail": correo }))}`, {
                    headers: { 'Authorization': apiKey, 'wix-site-id': siteId }
                })
                const searchData = await searchRes.json().catch(() => null)
                
                if (searchData?.members?.length > 0) {
                    memberId = searchData.members[0].id
                    contactId = searchData.members[0].contactId || contactId
                } else {
                    const createMemberRes = await fetch('https://www.wixapis.com/members/v1/members', {
                        method: 'POST',
                        headers: {
                            'Authorization': apiKey,
                            'wix-site-id': siteId,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            member: {
                                loginEmail: correo,
                                profile: {
                                    nickname: nombre || firstName,
                                    firstName: firstName,
                                    lastName: lastName,
                                    phones: telefono ? [telefono] : []
                                },
                                contactId: contactId
                            }
                        })
                    })
                    const createMemberData = await createMemberRes.json().catch(() => null)
                    memberId = createMemberData?.member?.id
                }
            } catch (mErr) {
                console.error('[Cotizaciones Engine] Member creation error:', mErr.message)
            }
        }

        // 2. Generate Recovery Message and Detailed Breakdown for CMS
        const packageName = `${temporada || 'Japón'} — ${estilo || 'Paquete'}`
        let recoveryMessage = `Te olvidaste de pagar el paquete ${packageName}`
        if (action === 'modal_close') {
            recoveryMessage = `Carrito Abandonado en Paso ${step}: Te olvidaste de pagar el paquete ${packageName}`
        } else if (action === 'checkout_initiated') {
            recoveryMessage = `Checkout Iniciado en Pasarela Wix para ${packageName}`
        }

        const travelersSummary = Array.isArray(travelers) && travelers.length > 0
            ? travelers.map((t, i) => `Persona ${i + 1}: ${t.fullName || 'Pendiente'} (${t.type || 'Adulto'}${t.age ? `, ${t.age} años` : ''})`).join(' | ')
            : `1 Pasajero (${nombre})`

        const remainder = Math.max(0, (totalPrice || 0) - (packagePaymentMode === 'anticipo' ? 5000 : totalPrice))
        const quotaAmount = monthlyInstallment || (selectedInstallments > 0 ? Math.round(remainder / selectedInstallments) : 0)

        const detailedCmsText = [
            `📍 COTIZACIÓN REGISTRADA (CARRITO ABANDONADO / SEGUIMIENTO):`,
            `• Cliente: ${nombre} (${correo} | Tel: ${telefono})`,
            `• Destino / Temporada: ${temporada || 'Japón'}`,
            `• Pase / Estilo: ${estilo || 'Reserva'}`,
            `• Total Estimado: ${formatPrice(totalPrice)} MXN`,
            `• Modalidad de Pago: ${packagePaymentMode === 'anticipo' ? `Anticipo $5,000 MXN + ${selectedInstallments} cuotas de ${formatPrice(quotaAmount)} MXN/mes` : 'Pago Total 100% de contado'}`,
            `• Pasajeros (${travelers.length || 1}): ${travelersSummary}`,
            desglose ? `• Configuración: ${desglose}` : '',
            `• ID Miembro Wix: ${memberId || 'Pendiente'}`,
            `• Mensaje de Recuperación Sugerido: "${recoveryMessage}"`
        ].filter(Boolean).join('\n')

        let savedCotizacionId = cotizacionId
        let estadoCotizacion = action === 'checkout_initiated'
            ? 'Checkout Iniciado en Wix'
            : (action === 'modal_close' ? 'Carrito Abandonado (Modal Cerrado sin Pagar)' : `Cotización en Proceso (Paso ${step})`)

        // 3. Save or Update in Wix CMS 'COTIZACIONES'
        if (apiKey) {
            const wixClient = createClient({
                modules: { items },
                auth: ApiKeyStrategy({ siteId, apiKey }),
            })

            const itemPayload = {
                title: `Cotización — ${packageName} (${nombre || 'Lead'})`,
                nombreCompleto: nombre,
                correo: correo,
                telefono: telefono,
                memberId: memberId || contactId || 'N/A',
                contactId: contactId || 'N/A',
                temporada: temporada || 'Japón',
                estilo: estilo || 'Reserva',
                pasajeros: travelers.length || 1,
                totalEstimado: Number(totalPrice) || 0,
                montoAnticipo: Number(paymentAmount) || 5000,
                cuotasElegidas: Number(selectedInstallments) || 5,
                montoPorCuota: Number(quotaAmount) || 0,
                estado: estadoCotizacion,
                mensajeRecuperacion: recoveryMessage,
                desgloseCompleto: detailedCmsText,
                fechaRegistro: new Date().toISOString(),
            }

            try {
                if (cotizacionId) {
                    const updated = await wixClient.items.update('COTIZACIONES', {
                        _id: cotizacionId,
                        ...itemPayload,
                    })
                    savedCotizacionId = updated._id
                    console.log('[Cotizaciones Engine] ✅ Updated COTIZACIONES CMS record ID:', savedCotizacionId)
                } else {
                    const inserted = await wixClient.items.insert('COTIZACIONES', itemPayload)
                    savedCotizacionId = inserted._id
                    console.log('[Cotizaciones Engine] ✅ Inserted into COTIZACIONES CMS. ID:', savedCotizacionId)
                }
            } catch (cmsErr) {
                console.error('[Cotizaciones Engine] CMS error:', cmsErr.message)
            }
        }

        return res.status(200).json({
            success: true,
            cotizacionId: savedCotizacionId,
            memberId: memberId || contactId,
            contactId: contactId,
            recoveryMessage: recoveryMessage,
            estado: estadoCotizacion,
            message: 'Cotización y usuario en Wix Members sincronizados con éxito.'
        })
    } catch (error) {
        console.error('[Cotizaciones Engine] Global error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar cotización'
        })
    }
}
