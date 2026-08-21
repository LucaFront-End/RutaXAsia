import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import { productsV3 } from '@wix/stores'
import { checkout } from '@wix/ecom'

/**
 * 100% Automated Wix Checkout & Wix Invoices Engine
 * 
 * 1. Calculates exact dynamic pricing & 5 monthly quotas
 * 2. Saves complete booking in Wix CMS 'ReservasdeViaje'
 * 3. Creates/Syncs Contact in Wix CRM Contacts
 * 4. Dispatches internal agency notification table to reservas@rutaxasia.com
 * 5. Dynamically sets product price in Wix Store Catalog to exact target amount
 * 6. Generates official Wix Checkout URL (where Wix automatically sends the verified receipt to the customer)
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const {
            nombre = '',
            correo = '',
            telefono = '',
            temporada = '',
            estilo = '',
            tipoPago = 'anticipo', // 'anticipo' | 'completo' | 'tours_total' | 'cuota_mensual'
            totalViaje = 0,
            montoAnticipo = 5000,
            saldoRestante = 0,
            mensualidadesCount = 5,
            montoMensualidad = 0,
            generarInvoiceMensual = false,
            desglose = '',
            viajeros = [],
            cuotaNumero = 1,
        } = req.body || {}

        const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
        const apiKey = process.env.VITE_WIX_API_KEY
        const anticipoProductId = process.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
        const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e'
        const wixBaseDomain = process.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'

        const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

        // Summary of travelers
        const travelersSummary = Array.isArray(viajeros) && viajeros.length > 0
            ? viajeros.map((t, i) => `Persona ${i + 1}: ${t.fullName || 'Pendiente'} (${t.type || 'Adulto'}${t.age ? `, ${t.age} años` : ''})`).join(' | ')
            : '1 Pasajero Titular'

        // Determine exact amount to charge on Wix Checkout
        const chargeAmount = Math.max(1, Math.round(Number(montoAnticipo) || (tipoPago === 'anticipo' ? 5000 : totalViaje)))
        const chargeAmountStr = String(chargeAmount)

        // Generate 5 Monthly Installments Schedule with exact calendar dates
        const schedule = []
        const now = new Date()
        const count = mensualidadesCount || 5
        const remainder = Math.max(0, (totalViaje || 0) - (tipoPago === 'anticipo' ? 5000 : 0))
        const quotaAmount = montoMensualidad || (count > 0 ? Math.round(remainder / count) : 0)

        for (let i = 1; i <= count; i++) {
            const dueDate = new Date(now)
            dueDate.setMonth(dueDate.getMonth() + i)
            schedule.push({
                cuota: i,
                monto: quotaAmount,
                fecha: dueDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
                isoDate: dueDate.toISOString().split('T')[0],
                estado: 'Pendiente',
            })
        }

        const scheduleSummary = schedule.map(s => `Cuota ${s.cuota}/${count}: ${formatPrice(s.monto)} MXN (${s.fecha})`).join(' | ')

        let productTitle = ''
        if (tipoPago === 'anticipo') {
            productTitle = `Anticipo de Apartado — ${temporada || 'Japón'} (${nombre})`
        } else if (tipoPago === 'cuota_mensual') {
            productTitle = `Cuota Mensual ${cuotaNumero}/${count} — ${temporada || 'Japón'} (${nombre})`
        } else if (tipoPago === 'tours_total') {
            productTitle = `Pago Total Tours — ${nombre}`
        } else {
            productTitle = `Liquidación Total — ${temporada || 'Japón'} (${nombre})`
        }

        const formattedTravelersList = Array.isArray(viajeros) && viajeros.length > 0
            ? viajeros.map((t, i) => `  • Persona ${i + 1} ${i === 0 ? '(Titular)' : ''}: ${t.fullName || 'Pendiente'} (${t.type || 'Adulto'}${t.age ? `, ${t.age} años` : ''})`).join('\n')
            : `  • Persona 1 (Titular): ${nombre}`

        const formattedScheduleList = schedule.map(s => `  • Cuota ${s.cuota}/${count}: ${formatPrice(s.monto)} MXN — Vencimiento: ${s.fecha} (Estado: Pendiente)`).join('\n')

        const detailedCmsText = [
            `📍 RESUMEN DE RESERVA Y PLAN FINANCIERO:`,
            `• Comprador Titular: ${nombre}`,
            `• Correo Electrónico: ${correo}`,
            `• Teléfono (WhatsApp): ${telefono}`,
            `• Destino / Temporada: ${temporada || 'Japón'}`,
            `• Pase / Modalidad: ${estilo || 'Reserva'}`,
            `\n👥 PASAJEROS REGISTRADOS (${viajeros.length || 1}):`,
            formattedTravelersList,
            `\n💰 ESQUEMA DE PAGOS:`,
            `• Costo Total del Viaje: ${formatPrice(totalViaje)} MXN`,
            `• Monto de Apartado / Anticipo (Cobrado Hoy): ${formatPrice(chargeAmount)} MXN`,
            `• Saldo Restante a Financiar: ${formatPrice(saldoRestante || remainder)} MXN`,
            generarInvoiceMensual ? `• Plazo Seleccionado por el Cliente: ${count} Cuotas Mensuales de ${formatPrice(quotaAmount)} MXN/mes` : '• Modalidad: Liquidación Total al 100% de contado',
            generarInvoiceMensual ? `\n📅 CALENDARIO DE FACTURACIÓN Y VENCIMIENTOS:\n${formattedScheduleList}` : '',
            desglose ? `\n📝 Notas y Configuración del Viaje:\n${desglose}` : ''
        ].filter(Boolean).join('\n')

        const estadoReserva = 'No pagado'

        let checkoutUrl = ''
        let contactId = null
        let memberId = null

        if (apiKey) {
            const wixClient = createClient({
                modules: { items, productsV3, checkout },
                auth: ApiKeyStrategy({ siteId, apiKey }),
            })

            // 1. Create / Upsert Contact in Wix CRM Contacts first
            try {
                const nameParts = (nombre || '').trim().split(' ')
                const firstName = nameParts[0] || 'Viajero'
                const lastName = nameParts.slice(1).join(' ') || ''

                // Contact sync
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

                // Member sync / creation in Wix Members
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
                                        nickname: nombre,
                                        firstName: firstName,
                                        lastName: lastName,
                                        phones: telefono ? [telefono] : []
                                    },
                                    contactId: contactId
                                }
                            })
                        })
                        const createMemberData = await createMemberRes.json().catch(() => null)
                        memberId = createMemberData?.member?.id || ''
                    }
                } catch (memberErr) {
                    console.log('[Wix Invoicing Engine] Member lookup warning:', memberErr.message)
                }

                console.log(`[Wix Invoicing Engine] ✅ Synced Wix Member: ${nombre} (${correo}) MemberID: ${memberId} ContactID: ${contactId}`)
            } catch (contactErr) {
                // Silently ignore if contact already exists
            }

            // 2. Compute Sequential Order Number (e.g. 1001, 1002...)
            let orderNumber = 1001
            try {
                const totalReservas = await wixClient.items.query('ReservasdeViaje').count()
                orderNumber = 1000 + (totalReservas || 0) + 1
            } catch (countErr) {
                orderNumber = Math.floor(1000 + Math.random() * 8999)
            }
            const baseReservaCode = `RUTA-${orderNumber}`

            // 2. Save complete booking in Wix CMS 'ReservasdeViaje'
            let insertedReservaId = ''
            try {
                const inserted = await wixClient.items.insert('ReservasdeViaje', {
                    nombreCompleto: nombre,
                    correoElectrnico: correo,
                    telfono: telefono,
                    temporada: temporada || 'Japón',
                    modalidad: estilo || 'Reserva',
                    totalEstimado: Number(totalViaje) || 0,
                    montoAnticipo: chargeAmount,
                    desgloseCompleto: `[Código de Reserva: ${baseReservaCode}]\n${detailedCmsText}`,
                    estadoReserva: estadoReserva, // 'No pagado'
                    fechaRegistro: new Date().toISOString(),
                })
                insertedReservaId = inserted?._id || ''
                console.log(`[Wix Invoicing Engine] ✅ Saved record to ReservasdeViaje CMS (${baseReservaCode}). ID:`, insertedReservaId)
            } catch (cmsErr) {
                console.error('[Wix Invoicing Engine] CMS error:', cmsErr.message)
            }

            // 3. Populate scheduled monthly installments into 'Pagosprogramados' CMS
            // Format: RUTA-{numPedido}-{numeroCuota} (e.g. RUTA-1001-1, RUTA-1001-2, RUTA-1001-3)
            if (generarInvoiceMensual && Array.isArray(schedule) && schedule.length > 0) {
                for (const s of schedule) {
                    const quotaReservaCode = `${baseReservaCode}-${s.cuota}`
                    try {
                        await wixClient.items.insert('Pagosprogramados', {
                            title: memberId || contactId || correo,
                            reserva: quotaReservaCode,
                            cliente: nombre,
                            concepto: `Cuota ${s.cuota} de ${count} — ${temporada || 'Japón'}`,
                            emailCliente: correo,
                            contactId: contactId || memberId || '',
                            nmeorDePagoNmero: Number(s.cuota),
                            importeNmero: Number(s.monto),
                            fechaDeFacturacin: s.isoDate,
                            fechaDeVencimientoCalendario: s.isoDate,
                            fechaDeVencimiento: s.fecha,
                            estatus: 'Pendiente',
                            facturaGenerada: false,
                        })
                    } catch (quotaErr) {
                        console.error('[Pagosprogramados] Error inserting quota:', quotaErr.message)
                    }
                }
                console.log(`[Wix Invoicing Engine] ✅ Created ${schedule.length} quotas in Pagosprogramados CMS (${baseReservaCode}-1 a ${baseReservaCode}-${schedule.length})`)
            }

            // 4. Populate Included & Extra Experiences into 'ExtrasReserva' CMS
            try {
                const travelersCount = Array.isArray(viajeros) && viajeros.length > 0 ? viajeros.length : 1
                const parsedExtras = []

                if (Array.isArray(req.body.extrasList) && req.body.extrasList.length > 0) {
                    parsedExtras.push(...req.body.extrasList)
                } else if (desglose) {
                    // Extract Incluidas (Free)
                    const incMatch = desglose.match(/Incluidas[^:]*:\s*([^.]+)/i)
                    if (incMatch && incMatch[1] && !incMatch[1].toLowerCase().includes('ningun')) {
                        incMatch[1].split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean).forEach(expName => {
                            parsedExtras.push({
                                title: `EXP-INC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                                tipoDeTourExtra: 'Gratis (Incluida en Pase)',
                                nombre: expName,
                                ciudad: expName.toLowerCase().includes('kioto') ? 'Kioto' : (expName.toLowerCase().includes('osaka') ? 'Osaka' : 'Tokio'),
                                precioUnitario: '$0 MXN',
                                cantidad: String(travelersCount),
                                subtotal: '$0 MXN',
                            })
                        })
                    }

                    // Extract Adicionales (Paid extras)
                    const addMatch = desglose.match(/Adicionales[^:]*:\s*([^.]+)/i)
                    if (addMatch && addMatch[1] && !addMatch[1].toLowerCase().includes('ningun')) {
                        addMatch[1].split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean).forEach(expName => {
                            const priceMatch = expName.match(/\(\+([0-9,]+)\s*MXN\)/i)
                            const unitPriceNum = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0
                            const cleanName = expName.replace(/\s*\(\+[^)]+\)/, '').trim()
                            parsedExtras.push({
                                title: `EXP-ADD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                                tipoDeTourExtra: 'Extra (De Pago)',
                                nombre: cleanName,
                                ciudad: cleanName.toLowerCase().includes('kioto') ? 'Kioto' : (cleanName.toLowerCase().includes('osaka') ? 'Osaka' : 'Tokio'),
                                precioUnitario: unitPriceNum > 0 ? `$${unitPriceNum.toLocaleString('es-MX')} MXN` : 'Precio Adicional',
                                cantidad: String(travelersCount),
                                subtotal: unitPriceNum > 0 ? `$${(unitPriceNum * travelersCount).toLocaleString('es-MX')} MXN` : 'Adicional',
                            })
                        })
                    }

                    // Extract Extras / Complementos
                    const extMatch = desglose.match(/Extras[^:]*:\s*([^.]+)/i)
                    if (extMatch && extMatch[1] && !extMatch[1].toLowerCase().includes('ningun')) {
                        extMatch[1].split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean).forEach(expName => {
                            parsedExtras.push({
                                title: `EXP-COMP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                                tipoDeTourExtra: 'Extra (De Pago)',
                                nombre: expName,
                                ciudad: 'Japón',
                                precioUnitario: 'Complemento',
                                cantidad: String(travelersCount),
                                subtotal: 'Complemento',
                            })
                        })
                    }
                }

                for (const extraItem of parsedExtras) {
                    try {
                        await wixClient.items.insert('ExtrasReserva', {
                            title: extraItem.title || `EXP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                            reserva: baseReservaCode,
                            tipoDeTourExtra: extraItem.tipoDeTourExtra || 'Extra',
                            nombre: extraItem.nombre || 'Experiencia',
                            ciudad: extraItem.ciudad || 'Japón',
                            precioUnitario: extraItem.precioUnitario || '$0 MXN',
                            cantidad: String(extraItem.cantidad || travelersCount),
                            subtotal: extraItem.subtotal || '$0 MXN',
                        })
                    } catch (insExtraErr) {
                        console.error('[ExtrasReserva] Error inserting item:', insExtraErr.message)
                    }
                }
                if (parsedExtras.length > 0) {
                    console.log(`[Wix Invoicing Engine] ✅ Created ${parsedExtras.length} items in ExtrasReserva CMS (${baseReservaCode})`)
                }
            } catch (extrasProcErr) {
                console.error('[ExtrasReserva] Processing error:', extrasProcErr.message)
            }

            // 5. Populate Individual Passengers into 'PASAJEROS' CMS
            try {
                const listToInsert = Array.isArray(viajeros) && viajeros.length > 0
                    ? viajeros
                    : [{ fullName: nombre, age: 'Adulto' }]

                for (const v of listToInsert) {
                    try {
                        await wixClient.items.insert('PASAJEROS', {
                            title: baseReservaCode,
                            nombreCompleto: v.fullName || v.nombre || nombre,
                            edad: String(v.age || v.edad || (v.type ? `${v.type} (${v.age || ''})` : 'Adulto')).trim(),
                        })
                    } catch (passErr) {
                        console.error('[PASAJEROS] Error inserting passenger:', passErr.message)
                    }
                }
                console.log(`[Wix Invoicing Engine] ✅ Created ${listToInsert.length} passengers in PASAJEROS CMS (${baseReservaCode})`)
            } catch (pProcErr) {
                console.error('[PASAJEROS] Processing error:', pProcErr.message)
            }

            // 6. Dispatch internal agency notification table to reservas@rutaxasia.com
            const emailSubject = tipoPago === 'anticipo'
                ? `💳 [Plan Invoicing] Nueva Reserva Apartado ($5,000 MXN) + ${count} Cuotas Mensuales — ${nombre}`
                : (tipoPago === 'cuota_mensual'
                    ? `🧾 [Cuota Pagada] Cuota ${cuotaNumero}/${count} (${formatPrice(chargeAmount)} MXN) — ${nombre}`
                    : `💎 [Wix Payment] Nueva Reserva Pago Total (${formatPrice(chargeAmount)} MXN) — ${nombre}`)

            const notificationPayload = {
                _subject: emailSubject,
                _template: 'table',
                _captcha: 'false',
                _language: 'es',
                'Cliente Titular': nombre,
                'Email': correo,
                'Teléfono (WhatsApp)': telefono,
                'Temporada / Sección': temporada || 'Japón',
                'Modalidad': estilo || 'Reserva',
                'Tipo de Pago': tipoPago === 'anticipo' ? 'Anticipo de Apartado ($5,000 MXN)' : 'Pago Total (100%)',
                'Monto Cobrado Hoy': `${formatPrice(chargeAmount)} MXN`,
                'Total Estimado del Viaje': `${formatPrice(totalViaje)} MXN`,
                'Saldo Restante por Liquidar': `${formatPrice(saldoRestante || remainder)} MXN`,
                'Programa de Facturas': generarInvoiceMensual ? formattedScheduleList : 'N/A (Liquidación 100%)',
                'Asistentes Registrados': formattedTravelersList,
                'Detalle Completo': detailedCmsText,
                'Fecha de Emisión': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
            }

            // A) Dispatched agency notification via FormSubmit
            try {
                await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Origin': 'https://rutaxasia.com',
                        'Referer': 'https://rutaxasia.com/',
                        'User-Agent': 'Mozilla/5.0'
                    },
                    body: JSON.stringify(notificationPayload),
                })
                console.log('[Wix Invoicing Engine] ✅ Dispatched agency notification to reservas@rutaxasia.com')
            } catch (mailErr) {
                console.error('[Wix Invoicing Engine] Mail owner error:', mailErr.message)
            }

            // B) Dispatched direct transactional email to CLIENT via RESEND
            const resendKey = process.env.RESEND_API_KEY
            if (resendKey && correo && correo.includes('@')) {
                try {
                    const clientHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b;">
                        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <div style="background: linear-gradient(135deg, #e11d48, #be123c); color: #fff; padding: 24px; text-align: center;">
                                <h1 style="margin:0; font-size: 1.4rem; font-weight: 900;">RutaXAsia</h1>
                                <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 0.85rem;">Confirmación de Reserva y Plan de Facturación</p>
                            </div>
                            <div style="padding: 24px;">
                                <h2 style="font-size: 1.15rem; font-weight: 800; margin: 0 0 8px 0; color: #0f172a;">¡Hola, ${nombre}!</h2>
                                <p style="margin: 0 0 16px 0; font-size: 0.88rem; line-height: 1.5; color: #475569;">
                                    Tu solicitud de reserva para <strong>${temporada || 'Japón'}</strong> ha sido registrada con éxito.
                                </p>
                                <div style="background: #f1f5f9; padding: 14px; border-radius: 10px; margin-bottom: 16px; font-size: 0.85rem;">
                                    <div><strong>Monto de Apartado:</strong> ${formatPrice(chargeAmount)} MXN</div>
                                    <div><strong>Total del Viaje:</strong> ${formatPrice(totalViaje)} MXN</div>
                                    <div><strong>Saldo a Financiar:</strong> ${formatPrice(saldoRestante || remainder)} MXN</div>
                                    ${generarInvoiceMensual ? `<div style="margin-top: 6px; color: #0284c7; font-weight: 700;"><strong>Plan de Pagos:</strong> ${count} cuotas de ${formatPrice(quotaAmount)} MXN/mes</div>` : ''}
                                </div>
                                ${generarInvoiceMensual ? `
                                <h4 style="font-size: 0.88rem; margin: 12px 0 6px 0;">📅 Calendario de Vencimientos:</h4>
                                <ul style="font-size: 0.82rem; color: #334155; padding-left: 18px; margin: 0 0 16px 0;">
                                    ${schedule.map(s => `<li>Cuota ${s.cuota}/${count}: <strong>${formatPrice(s.monto)} MXN</strong> — Vence el ${s.fecha}</li>`).join('')}
                                </ul>` : ''}
                                <p style="font-size: 0.8rem; color: #64748b; margin: 0;">Cada mes recibirás tu enlace oficial de cobro para liquidar tu cuota en línea en 1 clic.</p>
                            </div>
                        </div>
                    </div>`

                    const resendRes = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${resendKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            from: 'RutaXAsia <onboarding@resend.dev>',
                            to: [correo],
                            subject: `✈️ Confirmación de Reserva y Plan de Pagos — ${temporada || 'Japón'}`,
                            html: clientHtml
                        })
                    })
                    const resendData = await resendRes.json()
                    console.log(`[Wix Invoicing Engine] ✅ Dispatched Resend email to client (${correo}). ID:`, resendData?.id)
                } catch (resendErr) {
                    console.error('[Wix Invoicing Engine] Resend client email error:', resendErr.message)
                }
            }

            // 4. Dynamically configure Wix Store Catalog Item with exact amount
            try {
                const currentProd = await wixClient.productsV3.getProduct(anticipoProductId)
                if (currentProd) {
                    await wixClient.productsV3.updateProduct(anticipoProductId, {
                        ...currentProd,
                        name: productTitle,
                        actualPriceRange: {
                            minValue: { amount: chargeAmountStr },
                            maxValue: { amount: chargeAmountStr },
                        },
                        variantsInfo: {
                            variants: currentProd.variantsInfo.variants.map(v => ({
                                ...v,
                                price: { actualPrice: { amount: chargeAmountStr } },
                            })),
                        },
                    })
                    console.log(`[Wix Invoicing Engine] ✅ Catalog set to: "${productTitle}" - $${chargeAmountStr} MXN`)
                }

                // 5. Create official Wix Checkout Session
                const checkoutSession = await wixClient.checkout.createCheckout({
                    channelType: 'WEB',
                    lineItems: [
                        {
                            catalogReference: {
                                appId: WIX_STORES_APP_ID,
                                catalogItemId: anticipoProductId,
                            },
                            quantity: 1,
                        }
                    ],
                })

                if (checkoutSession && checkoutSession._id) {
                    // Pre-fill Buyer and Billing Details in Wix Checkout
                    const nameParts = (nombre || '').trim().split(' ')
                    const buyerFirstName = nameParts[0] || 'Viajero'
                    const buyerLastName = nameParts.slice(1).join(' ') || ' '
                    const buyerPhone = telefono ? (telefono.startsWith('+') ? telefono : `+52 ${telefono}`) : ''

                    try {
                        await wixClient.checkout.updateCheckout(checkoutSession._id, {
                            buyerInfo: {
                                email: correo,
                            },
                            billingInfo: {
                                address: {
                                    firstName: buyerFirstName,
                                    lastName: buyerLastName,
                                    phone: buyerPhone,
                                    country: 'MX',
                                },
                                contactDetails: {
                                    firstName: buyerFirstName,
                                    lastName: buyerLastName,
                                    phone: buyerPhone,
                                }
                            }
                        })
                        console.log(`[Wix Invoicing Engine] ✅ Pre-filled checkout for ${buyerFirstName} ${buyerLastName} (${correo})`)
                    } catch (prefillErr) {
                        console.warn('[Wix Invoicing Engine] Note on prefill:', prefillErr.message)
                    }

                    const urlResult = await wixClient.checkout.getCheckoutUrl(checkoutSession._id)
                    if (urlResult && urlResult.checkoutUrl) {
                        checkoutUrl = urlResult.checkoutUrl
                        console.log('[Wix Invoicing Engine] ✅ Generated Official Wix Checkout URL:', checkoutUrl)
                    }
                }
            } catch (chkErr) {
                console.error('[Wix Invoicing Engine] Error setting price or creating checkout:', chkErr.message)
            }
        }

        if (!checkoutUrl) {
            checkoutUrl = `${wixBaseDomain}/checkout`
        }

        return res.status(200).json({
            success: true,
            checkoutUrl: checkoutUrl,
            tipoPago: tipoPago,
            montoCobrado: chargeAmount,
            saldoRestante: saldoRestante || remainder,
            mensualidadesCount: count,
            montoMensualidad: quotaAmount,
            generarInvoiceMensual: generarInvoiceMensual,
            calendarioCuotas: schedule,
            message: 'Redirigiendo a pasarela de pago segura de Wix...',
        })
    } catch (error) {
        console.error('[Wix Invoicing Engine] Global error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar checkout',
        })
    }
}
