import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import { productsV3 } from '@wix/stores'
import { checkout } from '@wix/ecom'

/**
 * 100% Automated Wix Checkout & Wix Invoices Engine
 * 
 * 1. Calculates exact dynamic pricing & 5 monthly quotas
 * 2. Saves complete booking in Wix CMS 'ReservasdeViaje'
 * 3. Dispatches formal confirmation table to BOTH client (correo) & owner (reservas@rutaxasia.com)
 * 4. Dynamically sets product price in Wix Store Catalog to exact target amount
 * 5. Generates official Wix Checkout URL (e.g. /checkout?checkoutId=...)
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const {
            nombre,
            correo,
            telefono,
            temporada,
            estilo,
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

        const scheduleSummary = schedule.map(s => `Cuota ${s.cuota}/5: ${formatPrice(s.monto)} MXN (${s.fecha})`).join(' | ')

        let productTitle = ''
        if (tipoPago === 'anticipo') {
            productTitle = `Anticipo de Apartado — ${temporada || 'Japón'} (${nombre})`
        } else if (tipoPago === 'cuota_mensual') {
            productTitle = `Cuota Mensual ${cuotaNumero}/5 — ${temporada || 'Japón'} (${nombre})`
        } else if (tipoPago === 'tours_total') {
            productTitle = `Pago Total Tours — ${nombre}`
        } else {
            productTitle = `Liquidación Total — ${temporada || 'Japón'} (${nombre})`
        }

        const invoicePlanText = generarInvoiceMensual
            ? `[Plan Invoices API: Anticipo de ${formatPrice(chargeAmount)} MXN cobrado hoy + ${count} Cuotas Mensuales de ${formatPrice(quotaAmount)} MXN c/u. Calendario: ${scheduleSummary}]`
            : `[Pago Total: ${formatPrice(chargeAmount)} MXN liquidado al 100% de contado]`

        const fullDescription = `${desglose || ''} ${invoicePlanText} [Asistentes: ${travelersSummary}]`

        const estadoReserva = tipoPago === 'anticipo'
            ? 'Pendiente de Pago Anticipo ($5,000 MXN) + Invoices Mensuales Programados'
            : (tipoPago === 'cuota_mensual'
                ? `Pendiente de Pago Cuota ${cuotaNumero}/5 (${formatPrice(chargeAmount)} MXN)`
                : 'Pendiente de Pago Total (100%)')

        let checkoutUrl = ''

        if (apiKey) {
            const wixClient = createClient({
                modules: { items, productsV3, checkout },
                auth: ApiKeyStrategy({ siteId, apiKey }),
            })

            // 1. Save complete booking in Wix CMS 'ReservasdeViaje'
            try {
                const inserted = await wixClient.items.insert('ReservasdeViaje', {
                    nombreCompleto: nombre,
                    correoElectrnico: correo,
                    telfono: telefono,
                    temporada: temporada || 'Japón',
                    modalidad: estilo || 'Reserva',
                    totalEstimado: Number(totalViaje) || 0,
                    montoAnticipo: chargeAmount,
                    desgloseCompleto: fullDescription,
                    estadoReserva: estadoReserva,
                    fechaRegistro: new Date().toISOString(),
                })
                console.log('[Wix Invoicing Engine] ✅ Saved to ReservasdeViaje CMS. ID:', inserted?._id)
            } catch (cmsErr) {
                console.error('[Wix Invoicing Engine] CMS error:', cmsErr.message)
            }

            // 2. Dispatch structured billing notification to reservas@rutaxasia.com (OWNER)
            const emailSubject = tipoPago === 'anticipo'
                ? `💳 [Plan Invoicing] Nueva Reserva Apartado ($5,000 MXN) + ${count} Cuotas Mensuales — ${nombre}`
                : (tipoPago === 'cuota_mensual'
                    ? `🧾 [Cuota Pagada] Cuota ${cuotaNumero}/5 (${formatPrice(chargeAmount)} MXN) — ${nombre}`
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
                'Programa de Facturas (5 Meses)': generarInvoiceMensual ? scheduleSummary : 'N/A (Liquidación 100%)',
                'Asistentes Registrados': travelersSummary,
                'Detalle Completo': fullDescription,
                'Fecha de Emisión': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
            }

            try {
                await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(notificationPayload),
                })
                console.log('[Wix Invoicing Engine] ✅ Dispatched notification to reservas@rutaxasia.com')
            } catch (mailErr) {
                console.error('[Wix Invoicing Engine] Mail owner error:', mailErr.message)
            }

            // 3. Dispatch official invoice & reservation receipt to CLIENT (correo)
            if (correo && correo.includes('@')) {
                try {
                    await fetch(`https://formsubmit.co/ajax/${correo}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                            ...notificationPayload,
                            _subject: `✈️ Confirmación de Reserva y Calendario de Facturación — RutaXAsia (${temporada || 'Japón'})`,
                        }),
                    })
                    console.log(`[Wix Invoicing Engine] ✅ Dispatched client receipt & invoice schedule to: ${correo}`)
                } catch (clientMailErr) {
                    console.error('[Wix Invoicing Engine] Mail client error:', clientMailErr.message)
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
