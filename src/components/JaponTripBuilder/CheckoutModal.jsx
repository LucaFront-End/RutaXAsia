import { useState, useEffect, useMemo } from 'react'
import { useTripSearch } from '../../context/TripContext'
import './StepStyles.css'

/**
 * CheckoutModal — Multi-Step Anticipation & Full Booking Checkout Modal
 *
 * 1. Tours Individuales (4 PASOS):
 *    - Step 1: Modalidad de Acompañamiento (🏮 Asistencia Locataria vs 👑 Anfitrión RutaXAsia)
 *    - Step 2: Datos del Comprador (Titular) y Cantidad de Personas
 *    - Step 3: Datos de los Viajeros / Asistentes
 *    - Step 4: Resumen de Tours y Pago Total en Línea (Wix Payments / WhatsApp)
 *
 * 2. Paquetes / Viajes Completos (3 PASOS):
 *    - Step 1: Datos del Comprador y Pasajeros
 *    - Step 2: Datos de los Viajeros
 *    - Step 3: Modalidad de Pago:
 *         a) 💳 Anticipo ($5,000 MXN) + Invoices mensuales automáticas (Wix Invoicing)
 *         b) 💎 Pago Total Completo (100% Liquidación inmediata)
 */
export default function CheckoutModal({
    isOpen,
    onClose,
    season,
    estilo,
    totalPrice,
    desglose,
    selectedTours = [],
    pendingTour = null,
    onConfirmTour = () => {},
    isWhatsAppMode = false,
}) {
    if (!isOpen) return null

    const { tripSearch } = useTripSearch() || {}
    const isToursSueltos = estilo === 'Tours Sueltos'

    // Step state: 1, 2, 3, 4
    const [step, setStep] = useState(1)

    // Assistance Type for Tours Sueltos: 'anfitrion' (default cheaper) | 'locataria'
    const [assistanceType, setAssistanceType] = useState('anfitrion')

    // Payment Mode for Packages: 'anticipo' ($5,000 + monthly invoices) | 'completo' (100% total)
    const [packagePaymentMode, setPackagePaymentMode] = useState('anticipo')
    const [selectedInstallments, setSelectedInstallments] = useState(5)

    // Buyer Information
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [telefono, setTelefono] = useState('')
    const [adultsCount, setAdultsCount] = useState(
        isToursSueltos
            ? (pendingTour?.quantity || (selectedTours[0]?.quantity || 1))
            : (tripSearch?.adults || 2)
    )
    const [childrenCount, setChildrenCount] = useState(isToursSueltos ? 0 : (tripSearch?.children || 0))

    const totalTravelers = Math.max(1, adultsCount + childrenCount)

    // Travelers Information list
    const [travelers, setTravelers] = useState([])

    // Reset and determine initial step every time the modal is opened
    useEffect(() => {
        if (isOpen) {
            // If opening from Tours Individuales with already chosen tours (each having their own modality), start at Step 2 (Buyer details)
            if (isToursSueltos && selectedTours.length > 0 && !pendingTour) {
                setStep(2)
            } else {
                setStep(1)
            }
            setStatus('checkout')
            setErrors({})
            setApiError('')
            setAssistanceType('anfitrion')
            if (pendingTour?.quantity) {
                setAdultsCount(pendingTour.quantity)
            } else if (selectedTours.length > 0 && selectedTours[0]?.quantity) {
                setAdultsCount(selectedTours[0].quantity)
            }
        }
    }, [isOpen, pendingTour, isToursSueltos, selectedTours.length])

    // Synchronize travelers array when totalTravelers changes
    useEffect(() => {
        setTravelers(prev => {
            const next = []
            for (let i = 0; i < totalTravelers; i++) {
                const isChild = i >= adultsCount
                const existing = prev[i] || {}
                next.push({
                    id: i + 1,
                    fullName: existing.fullName || (i === 0 ? nombre : ''),
                    type: existing.type || (isChild ? 'Menor' : 'Adulto'),
                    age: existing.age || '',
                    dietNotes: existing.dietNotes || '',
                })
            }
            return next
        })
    }, [totalTravelers, adultsCount])

    // Update Traveler 1 name if Buyer name changes
    const handleBuyerNameChange = (val) => {
        setNombre(val)
        setTravelers(prev => {
            if (prev.length === 0) return prev
            const copy = [...prev]
            copy[0] = { ...copy[0], fullName: val }
            return copy
        })
    }

    const handleTravelerChange = (index, field, value) => {
        setTravelers(prev => {
            const copy = [...prev]
            copy[index] = { ...copy[index], [field]: value }
            return copy
        })
    }

    const [status, setStatus] = useState('checkout') // checkout, processing, redirecting, error
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')
    const [resultData, setResultData] = useState(null)
    const [cotizacionId, setCotizacionId] = useState(null)
    const [memberId, setMemberId] = useState(null)

    // Calculate active tours list considering pendingTour
    const activeToursList = useMemo(() => {
        if (!isToursSueltos) return selectedTours
        if (pendingTour) {
            const exists = selectedTours.some(t => t.id === pendingTour.id)
            if (exists) {
                return selectedTours.map(t => t.id === pendingTour.id ? { ...t, ...pendingTour } : t)
            }
            return [...selectedTours, pendingTour]
        }
        return selectedTours
    }, [isToursSueltos, selectedTours, pendingTour])

    // Calculate maximum allowed monthly installments based on departure date
    const calculateMaxAllowedInstallments = () => {
        const today = new Date()
        let targetDate = null
        const text = `${season?.name || ''} ${season?.key || ''} ${desglose || ''}`.toLowerCase()

        if (text.includes('2026') && (text.includes('oct') || text.includes('otoño') || text.includes('momiji'))) {
            targetDate = new Date(2026, 9, 15)
        } else if (text.includes('2026') && (text.includes('nov') || text.includes('noviembre'))) {
            targetDate = new Date(2026, 10, 15)
        } else if (text.includes('2026') && (text.includes('dic') || text.includes('diciembre'))) {
            targetDate = new Date(2026, 11, 15)
        } else if (text.includes('2027') && (text.includes('mar') || text.includes('sakura') || text.includes('primavera') || text.includes('abr'))) {
            targetDate = new Date(2027, 2, 22)
        } else if (text.includes('2027') && (text.includes('jul') || text.includes('ago') || text.includes('verano'))) {
            targetDate = new Date(2027, 6, 15)
        } else {
            if (season?.key === 'momiji') targetDate = new Date(2026, 9, 15)
            else if (season?.key === 'sakura') targetDate = new Date(2027, 2, 22)
            else targetDate = new Date(today.getFullYear(), today.getMonth() + 6, 1)
        }

        const monthDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth())
        return Math.max(1, monthDiff)
    }

    const maxInstallments = calculateMaxAllowedInstallments()
    const allPossibleInstallments = [2, 3, 4, 5, 6, 7, 8, 10, 12]
    const availableInstallments = allPossibleInstallments.filter(n => n <= maxInstallments)
    if (availableInstallments.length === 0) availableInstallments.push(maxInstallments)

    useEffect(() => {
        if (!availableInstallments.includes(selectedInstallments)) {
            setSelectedInstallments(availableInstallments[availableInstallments.length - 1] || 1)
        }
    }, [maxInstallments])

    // Recalculate dynamic total based on each tour's individual modality or assistanceType for Tours Sueltos
    const effectiveTotalPrice = useMemo(() => {
        if (!isToursSueltos) return totalPrice || 0
        if (activeToursList && activeToursList.length > 0) {
            return activeToursList.reduce((sum, t) => {
                const tourMod = t.modality || assistanceType || 'anfitrion'
                const priceAnfitrion = t.priceAnfitrionNum || (t.modality === 'anfitrion' ? t.price : (t.priceNum || 800))
                const priceLocatario = t.priceLocatarioNum || (t.modality === 'locatario' ? t.price : Math.round(priceAnfitrion * 1.5))
                const unit = tourMod === 'anfitrion' ? priceAnfitrion : priceLocatario
                return sum + (unit * (t.quantity || 1))
            }, 0)
        }
        return totalPrice || 0
    }, [isToursSueltos, activeToursList, totalPrice, assistanceType])

    // Dynamic Pricing & Invoicing calculations
    const paymentAmount = isToursSueltos
        ? effectiveTotalPrice
        : (packagePaymentMode === 'anticipo' ? 5000 : effectiveTotalPrice)

    const remainder = Math.max(0, effectiveTotalPrice - paymentAmount)
    const effectiveInstallments = Math.min(selectedInstallments, maxInstallments)
    const installmentsCount = (!isToursSueltos && packagePaymentMode === 'anticipo') ? effectiveInstallments : 0
    const monthlyInstallment = installmentsCount > 0 ? Math.round(remainder / installmentsCount) : 0
    const generarInvoiceMensual = !isToursSueltos && packagePaymentMode === 'anticipo'

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    // Synchronize Quotation & Create/Find Member in Wix Members
    const syncCotizacion = async (actionType = 'step_advance', targetStep = step) => {
        if (!correo || !correo.includes('@')) return
        try {
            const res = await fetch('/api/wix-cotizacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cotizacionId,
                    nombre,
                    correo,
                    telefono,
                    temporada: isToursSueltos ? 'Tours Individuales' : (season?.name || 'Japón'),
                    estilo: isToursSueltos ? `Tours Sueltos (${assistanceType === 'anfitrion' ? 'Anfitrión de Viaje' : 'Asistencia Locataria'})` : (estilo || 'Reserva'),
                    totalPrice: effectiveTotalPrice,
                    paymentAmount,
                    packagePaymentMode,
                    selectedInstallments: effectiveInstallments,
                    monthlyInstallment,
                    travelers,
                    desglose,
                    step: targetStep,
                    action: actionType,
                })
            })
            const data = await res.json().catch(() => null)
            if (data?.cotizacionId) setCotizacionId(data.cotizacionId)
            if (data?.memberId) setMemberId(data.memberId)
        } catch (err) {
            console.error('[CheckoutModal] Cotizacion sync error:', err)
        }
    }

    const handleCloseModal = () => {
        if (status === 'checkout' && correo && correo.includes('@')) {
            syncCotizacion('modal_close', step)
        }
        onClose()
    }

    // Validation for Buyer Information
    const validateBuyer = () => {
        const errs = {}
        const cleanPhone = telefono.replace(/\D/g, '')
        const isAllSameDigits = /^(\d)\1{9}$/.test(cleanPhone)

        if (!nombre.trim()) errs.nombre = 'El nombre completo es obligatorio.'
        if (!correo.trim() || !/\S+@\S+\.\S+/.test(correo)) errs.correo = 'Introduce un correo válido.'
        if (!cleanPhone || cleanPhone.length !== 10) {
            errs.telefono = 'Introduce un número de teléfono de 10 dígitos.'
        } else if (isAllSameDigits) {
            errs.telefono = 'Número no válido (los dígitos no pueden ser todos iguales).'
        }
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handlePhoneChange = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 10)
        setTelefono(digits)
        setErrors(prev => ({ ...prev, telefono: '' }))
    }

    // Validation for Travelers Information
    const validateTravelers = () => {
        const errs = {}
        travelers.forEach((t, i) => {
            if (!t.fullName.trim()) {
                errs[`traveler_${i}`] = `Ingresa el nombre de la Persona ${i + 1}.`
            }
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleNextStep = (e) => {
        if (e) e.preventDefault()
        if (isToursSueltos) {
            if (step === 1) {
                // Confirm the staged tour with the chosen assistance type
                if (pendingTour) {
                    onConfirmTour(pendingTour, assistanceType)
                }
                setStep(2)
                syncCotizacion('step_advance', 2)
            } else if (step === 2) {
                if (validateBuyer()) {
                    setStep(3)
                    syncCotizacion('step_advance', 3)
                }
            } else if (step === 3) {
                if (validateTravelers()) {
                    setStep(4)
                    syncCotizacion('step_advance', 4)
                }
            }
        } else {
            if (step === 1) {
                if (validateBuyer()) {
                    setStep(2)
                    syncCotizacion('step_advance', 2)
                }
            } else if (step === 2) {
                if (validateTravelers()) {
                    setStep(3)
                    syncCotizacion('step_advance', 3)
                }
            }
        }
    }

    const handlePrevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleCheckoutSubmit = async (e) => {
        if (e) e.preventDefault()
        if (!validateBuyer() || !validateTravelers()) return

        setStatus('processing')
        setApiError('')
        syncCotizacion('checkout_initiated', isToursSueltos ? 4 : 3)

        const assistanceLabel = assistanceType === 'anfitrion' ? 'Anfitrión de Viaje' : 'Asistencia Locataria'
        const travelersSummary = travelers
            .map((t, i) => `Persona ${i + 1}: ${t.fullName} (${t.type}${t.age ? `, ${t.age} años` : ''}${t.dietNotes ? ` - Notas: ${t.dietNotes}` : ''})`)
            .join(' | ')

        const currentTipoPago = isToursSueltos ? 'tours_total' : packagePaymentMode

        try {
            const response = await fetch('/api/wix-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    correo,
                    telefono,
                    temporada: isToursSueltos ? 'Tours Individuales' : (season?.name || 'Japón'),
                    estilo: isToursSueltos ? `Tours Sueltos (${assistanceLabel})` : (estilo || 'Reserva'),
                    tipoPago: currentTipoPago,
                    totalViaje: effectiveTotalPrice,
                    montoAnticipo: paymentAmount,
                    saldoRestante: remainder,
                    mensualidadesCount: installmentsCount,
                    montoMensualidad: monthlyInstallment,
                    generarInvoiceMensual: generarInvoiceMensual,
                    desglose: `${desglose || ''} [Modalidad: ${assistanceLabel}] [Asistentes: ${travelersSummary}]`,
                    viajeros: travelers,
                })
            })

            const result = await response.json()

            // Notification email via FormSubmit
            try {
                const subjectText = isToursSueltos
                    ? `🎟️ [Wix Payment] Solicitud Pago Total Tours Individuales (${formatPrice(paymentAmount)} MXN) — ${nombre}`
                    : (packagePaymentMode === 'anticipo'
                        ? `💳 [Wix Invoicing] Nueva Reserva Apartado ($5,000 MXN) + 5 Invoices Mensuales — ${nombre} (${season?.name || 'Japón'})`
                        : `💎 [Wix Payment] Solicitud Pago Total de Viaje (${formatPrice(paymentAmount)} MXN) — ${nombre} (${season?.name || 'Japón'})`)

                await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: subjectText,
                        _cc: 'operaciones@rutaxasia.com',
                        _template: 'table',
                        _captcha: 'false',
                        _language: 'es',
                        'Comprador': nombre,
                        'Email': correo,
                        'Teléfono (WhatsApp)': telefono,
                        'Temporada / Sección': isToursSueltos ? 'Tours Individuales' : (season?.name || 'Japón'),
                        'Modalidad': isToursSueltos ? `Tours Sueltos (${assistanceLabel})` : (estilo || 'Reserva'),
                        'Tipo de Cobro': isToursSueltos
                            ? 'Pago Total Completo de Tours'
                            : (packagePaymentMode === 'anticipo' ? 'Anticipo ($5,000 MXN) + Plan de Invoices Mensuales' : 'Pago Total Completo (100%)'),
                        'Monto a Cobrar': `${formatPrice(paymentAmount)} MXN`,
                        'Total del Viaje': `${formatPrice(effectiveTotalPrice)} MXN`,
                        'Saldo Restante': `${formatPrice(remainder)} MXN`,
                        'Plan de Facturación (Wix Invoices)': generarInvoiceMensual
                            ? `5 facturas mensuales de ${formatPrice(monthlyInstallment)} MXN c/u emitidas al correo ${correo}`
                            : 'Liquidado en su totalidad',
                        'Total de Asistentes': totalTravelers,
                        'Detalle de Asistentes': travelersSummary,
                        'Desglose del Pedido': desglose,
                        'Fecha de Registro': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
                    }),
                })
            } catch (fsErr) {
                console.error('[CheckoutModal] FormSubmit error:', fsErr)
            }

            if (result.success && result.checkoutUrl) {
                setResultData(result)
                setStatus('redirecting')
                window.location.href = result.checkoutUrl
            } else {
                setApiError(result.error || 'Hubo un problema al conectar con la pasarela de pago.')
                setStatus('error')
            }

        } catch (err) {
            console.error('Checkout error:', err)
            setApiError('Error de conexión con la pasarela de pago. Inténtalo de nuevo por favor.')
            setStatus('error')
        }
    }

    const assistanceLabel = assistanceType === 'anfitrion' ? 'Anfitrión de Viaje' : 'Asistencia Locataria'
    const travelersWaText = travelers.map((t, i) => `Persona ${i + 1}: ${t.fullName || 'Pendiente'} (${t.type})`).join(', ')
    
    const waMsg = isToursSueltos
        ? `SW-Hola! Quiero reservar y pagar los siguientes Tours en Japón (${assistanceLabel}): ${desglose || ''}. ` +
          `Comprador: ${nombre || 'Cliente'}. Asistentes: ${travelersWaText}. Total a pagar: ${formatPrice(effectiveTotalPrice)} MXN.`
        : (packagePaymentMode === 'anticipo'
            ? `SW-Hola! Quiero realizar mi apartado de $5,000 MXN para el viaje: ${season?.name || 'Japón'} (${estilo}) y programar mis invoices mensuales. ` +
              `Comprador: ${nombre || 'Cliente'}. Pasajeros: ${travelersWaText}. Saldo restante: ${formatPrice(remainder)} MXN (5 cuotas de ${formatPrice(monthlyInstallment)} MXN).`
            : `SW-Hola! Quiero realizar el pago TOTAL COMPLETO de ${formatPrice(effectiveTotalPrice)} MXN para el viaje: ${season?.name || 'Japón'} (${estilo}). ` +
              `Comprador: ${nombre || 'Cliente'}. Pasajeros: ${travelersWaText}.`)

    const waUrl = `https://wa.me/525657929121?text=${encodeURIComponent(waMsg)}`

    return (
        <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 999999 }}>
            <div className="jtb-checkout-modal-card">
                <button className="jtb-modal-close" onClick={handleCloseModal}>&times;</button>

                {status === 'checkout' && (
                    <div className="jtb-checkout-form">
                        {/* Step Indicator Header */}
                        <div className="jtb-modal-header" style={{ marginBottom: '16px', textAlign: 'center' }}>
                            <h3 className="jtb-checkout-title">
                                {isToursSueltos ? '🎟️ Configuración y Reserva de Tours' : '💳 Reserva y Pago de Viaje a Japón'}
                            </h3>
                            <p className="jtb-checkout-subtitle">
                                {isToursSueltos
                                    ? 'Completa los 4 pasos para coordinar y asegurar tus lugares directamente por WhatsApp'
                                    : 'Aparta tus lugares con anticipo o liquida tu viaje de forma 100% segura'}
                            </p>
                            {memberId && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 800, marginTop: '6px' }}>
                                    <span>✓ Cuenta de Viajero Activa</span>
                                </div>
                            )}

                            {/* Multi-Step Progress Bar */}
                            {isToursSueltos ? (
                                /* 4 Steps Progress Bar for Tours Sueltos */
                                <div className="jtb-checkout-steps-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: step >= 1 ? 1 : 0.4 }}>
                                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 1 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: step === 1 ? 800 : 600, color: step === 1 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                            🎎 Modalidad
                                        </span>
                                    </div>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>→</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: step >= 2 ? 1 : 0.4 }}>
                                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 2 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: step === 2 ? 800 : 600, color: step === 2 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                            👤 Comprador
                                        </span>
                                    </div>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>→</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: step >= 3 ? 1 : 0.4 }}>
                                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 3 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: step === 3 ? 800 : 600, color: step === 3 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                            👥 Viajeros ({totalTravelers})
                                        </span>
                                    </div>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>→</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: step >= 4 ? 1 : 0.4 }}>
                                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 4 ? '#25D366' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: step === 4 ? 800 : 600, color: step === 4 ? '#059669' : '#64748b' }}>
                                            💬 WhatsApp
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* 3 Steps Progress Bar for Travel Packages */
                                <div className="jtb-checkout-steps-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: step >= 1 ? 1 : 0.4 }}>
                                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 1 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: step === 1 ? 800 : 600, color: step === 1 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                            Comprador
                                        </span>
                                    </div>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: step >= 2 ? 1 : 0.4 }}>
                                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 2 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: step === 2 ? 800 : 600, color: step === 2 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                            Viajeros ({totalTravelers})
                                        </span>
                                    </div>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: step >= 3 ? 1 : 0.4 }}>
                                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 3 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: step === 3 ? 800 : 600, color: step === 3 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                            Modalidad de Pago
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* =========================================================================
                            TOURS INDIVIDUALES: PASO 1 (MODALIDAD DE ACOMPAÑAMIENTO)
                           ========================================================================= */}
                        {isToursSueltos && step === 1 && (
                            <div>
                                <div className="jtb-form-section" style={{ marginTop: '6px' }}>
                                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '6px', color: 'var(--color-dark)' }}>
                                        🎎 Paso 1 de 4: Elige la Modalidad de Acompañamiento
                                    </h4>
                                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
                                        Selecciona el tipo de guía y asistencia para tus tours en Japón:
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Option A: Asistencia Locataria */}
                                        <div
                                            onClick={() => setAssistanceType('locataria')}
                                            style={{
                                                border: assistanceType === 'locataria' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                                background: assistanceType === 'locataria' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                                borderRadius: '14px',
                                                padding: '14px 16px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: assistanceType === 'locataria' ? '0 4px 14px rgba(225, 29, 72, 0.12)' : 'none'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1.4rem' }}>🏮</span>
                                                    <div>
                                                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>Asistencia Locataria</strong>
                                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Guía local experto de la zona</span>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="assistanceType"
                                                    checked={assistanceType === 'locataria'}
                                                    onChange={() => setAssistanceType('locataria')}
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
                                                Te acompaña un guía local residente en la ciudad para coordinar traslados, accesos y actividades paso a paso.
                                            </p>
                                        </div>

                                        {/* Option B: Anfitrión RutaXAsia */}
                                        <div
                                            onClick={() => setAssistanceType('anfitrion')}
                                            style={{
                                                border: assistanceType === 'anfitrion' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                                background: assistanceType === 'anfitrion' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                                borderRadius: '14px',
                                                padding: '14px 16px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: assistanceType === 'anfitrion' ? '0 4px 14px rgba(225, 29, 72, 0.12)' : 'none'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1.4rem' }}>👑</span>
                                                    <div>
                                                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>Anfitrión de Viaje RutaXAsia</strong>
                                                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 750 }}>Tarifa Estándar Optimizado</span>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="assistanceType"
                                                    checked={assistanceType === 'anfitrion'}
                                                    onChange={() => setAssistanceType('anfitrion')}
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
                                                Acompañamiento por nuestro equipo oficial RutaXAsia. Grupos reducidos con la mejor experiencia inmersiva.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Estimated Total Price Preview */}
                                    <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total con esta modalidad:</span>
                                        <strong style={{ fontSize: '1.15rem', color: 'var(--color-primary, #e11d48)' }}>
                                            {formatPrice(effectiveTotalPrice)} MXN
                                        </strong>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '13px', borderRadius: '100px', fontSize: '0.92rem', fontWeight: 800 }}
                                        onClick={handleNextStep}
                                    >
                                        Continuar a Datos del Comprador (Paso 2) →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* =========================================================================
                            STEP 2 PARA TOURS SUELTOS (O STEP 1 PARA PAQUETES): DATOS COMPRADOR
                           ========================================================================= */}
                        {((isToursSueltos && step === 2) || (!isToursSueltos && step === 1)) && (
                            <div>
                                <div className="jtb-form-section" style={{ marginTop: '6px' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '6px', color: 'var(--color-dark)' }}>
                                        👤 {isToursSueltos ? 'Paso 2 de 4: Datos del Comprador (Titular)' : 'Paso 1 de 3: Datos del Comprador'}
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                                        Ingresa los datos de contacto a donde enviaremos tus confirmaciones de reserva.
                                    </p>

                                    <div className="jtb-form-group" style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Nombre Completo *</label>
                                        <input
                                            type="text"
                                            placeholder="Como aparece en tu pasaporte o identificación oficial"
                                            value={nombre}
                                            onChange={(e) => handleBuyerNameChange(e.target.value)}
                                            className={errors.nombre ? 'input-error' : ''}
                                            style={{ width: '100%', padding: '11px 13px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                        />
                                        {errors.nombre && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.73rem', marginTop: '2px', display: 'block' }}>{errors.nombre}</span>}
                                    </div>

                                    <div className="jtb-input-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                                        <div className="jtb-input-group">
                                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Correo Electrónico *</label>
                                            <input
                                                type="email"
                                                placeholder="correo@ejemplo.com"
                                                value={correo}
                                                onChange={(e) => { setErrors(prev => ({ ...prev, correo: '' })); setCorreo(e.target.value); }}
                                                className={errors.correo ? 'input-error' : ''}
                                                style={{ width: '100%', padding: '11px 13px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                            />
                                            {errors.correo && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.73rem', marginTop: '2px', display: 'block' }}>{errors.correo}</span>}
                                        </div>

                                        <div className="jtb-input-group">
                                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Teléfono (WhatsApp 10 dígitos) *</label>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                maxLength={10}
                                                placeholder="5512345678"
                                                value={telefono}
                                                onChange={(e) => handlePhoneChange(e.target.value)}
                                                className={errors.telefono ? 'input-error' : ''}
                                                style={{ width: '100%', padding: '11px 13px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                            />
                                            {errors.telefono && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.73rem', marginTop: '2px', display: 'block' }}>{errors.telefono}</span>}
                                        </div>
                                    </div>

                                    {/* Number of Passengers Adjuster */}
                                    <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
                                        <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-dark)', display: 'block', marginBottom: '8px' }}>
                                            👥 Cantidad de Pasajeros / Asistentes:
                                        </label>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Adultos:</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
                                                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                                                >-</button>
                                                <span style={{ fontWeight: 800, minWidth: '16px', textAlign: 'center', fontSize: '0.85rem' }}>{adultsCount}</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
                                                    onClick={() => setAdultsCount(adultsCount + 1)}
                                                >+</button>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Menores:</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
                                                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                                                >-</button>
                                                <span style={{ fontWeight: 800, minWidth: '16px', textAlign: 'center', fontSize: '0.85rem' }}>{childrenCount}</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
                                                    onClick={() => setChildrenCount(childrenCount + 1)}
                                                >+</button>
                                            </div>

                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary, #e11d48)', fontWeight: 800, marginLeft: 'auto' }}>
                                                Total: {totalTravelers} {totalTravelers === 1 ? 'Persona' : 'Personas'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                                    {isToursSueltos && (
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            style={{ padding: '12px 16px', borderRadius: '100px', fontSize: '0.85rem', color: '#64748b', borderColor: '#cbd5e1' }}
                                            onClick={handlePrevStep}
                                        >
                                            ← Modalidad
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '13px', borderRadius: '100px', fontSize: '0.92rem', fontWeight: 800 }}
                                        onClick={handleNextStep}
                                    >
                                        Continuar con Datos de los {totalTravelers} Viajeros →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* =========================================================================
                            STEP 3 PARA TOURS SUELTOS (O STEP 2 PARA PAQUETES): DATOS VIAJEROS
                           ========================================================================= */}
                        {((isToursSueltos && step === 3) || (!isToursSueltos && step === 2)) && (
                            <div>
                                <div className="jtb-form-section" style={{ marginTop: '6px' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '6px', color: 'var(--color-dark)' }}>
                                        👥 {isToursSueltos ? 'Paso 3 de 4: Datos de los Asistentes' : 'Paso 2 de 3: Datos de los Viajeros'} ({totalTravelers} personas)
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                                        Ingresa los nombres de las personas que asistirán a los tours para registrar sus pases:
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {travelers.map((traveler, idx) => (
                                            <div
                                                key={traveler.id}
                                                style={{
                                                    background: '#f8fafc',
                                                    border: errors[`traveler_${idx}`] ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    padding: '12px 14px'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
                                                        Persona {idx + 1} {idx === 0 ? '(Titular)' : ''}
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', background: traveler.type === 'Menor' ? '#fef3c7' : '#e0f2fe', color: traveler.type === 'Menor' ? '#92400e' : '#0369a1', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                                                        {traveler.type}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        className={`jtb-input${errors[`traveler_${idx}`] ? ' jtb-input--error' : ''}`}
                                                        placeholder={`Nombre Completo Persona ${idx + 1}`}
                                                        value={traveler.fullName}
                                                        onChange={e => {
                                                            const val = e.target.value
                                                            setTravelers(prev => prev.map((t, i) => i === idx ? { ...t, fullName: val } : t))
                                                            setErrors(prev => ({ ...prev, [`traveler_${idx}`]: '' }))
                                                        }}
                                                        style={{ padding: '8px 12px', fontSize: '0.84rem' }}
                                                    />
                                                    <input
                                                        type="number"
                                                        className="jtb-input"
                                                        placeholder="Edad"
                                                        min={1}
                                                        max={120}
                                                        value={traveler.age}
                                                        onChange={e => {
                                                            const val = e.target.value
                                                            setTravelers(prev => prev.map((t, i) => i === idx ? { ...t, age: val } : t))
                                                        }}
                                                        style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                                                    />
                                                </div>
                                                {errors[`traveler_${idx}`] && (
                                                    <span className="jtb-error-text" style={{ marginTop: '4px' }}>{errors[`traveler_${idx}`]}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{ padding: '12px 16px', borderRadius: '100px', fontSize: '0.85rem', color: '#64748b', borderColor: '#cbd5e1' }}
                                        onClick={handlePrevStep}
                                    >
                                        ← Comprador
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '12px 16px', borderRadius: '100px', fontSize: '0.88rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                                        onClick={handleNextStep}
                                    >
                                        Continuar al Resumen y Pago →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* =========================================================================
                            STEP 4 PARA TOURS SUELTOS (O STEP 3 PARA PAQUETES): RESUMEN & PAGO
                           ========================================================================= */}
                        {((isToursSueltos && step === 4) || (!isToursSueltos && step === 3)) && (
                            <form onSubmit={handleCheckoutSubmit}>
                                <div style={{ marginTop: '6px' }}>

                                    {/* Package Payment Options Selector (Only for full travel packages) */}
                                    {!isToursSueltos && (
                                        <div style={{ marginBottom: '14px' }}>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-dark)', display: 'block', marginBottom: '8px' }}>
                                                💳 Elige tu Modalidad de Pago:
                                            </label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div
                                                    onClick={() => setPackagePaymentMode('anticipo')}
                                                    style={{
                                                        border: packagePaymentMode === 'anticipo' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                                        background: packagePaymentMode === 'anticipo' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                                        borderRadius: '14px',
                                                        padding: '12px 10px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        boxShadow: packagePaymentMode === 'anticipo' ? '0 4px 12px rgba(225,29,72,0.1)' : 'none'
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-primary, #e11d48)', background: 'rgba(225,29,72,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                ✨ Recomendado
                                                            </span>
                                                            <input
                                                                type="radio"
                                                                name="packagePaymentMode"
                                                                checked={packagePaymentMode === 'anticipo'}
                                                                onChange={() => setPackagePaymentMode('anticipo')}
                                                            />
                                                        </div>
                                                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                                                            Anticipo $5,000 MXN
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                                                            Aparta hoy + 5 Invoices mensuales
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={() => setPackagePaymentMode('completo')}
                                                    style={{
                                                        border: packagePaymentMode === 'completo' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                                        background: packagePaymentMode === 'completo' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                                        borderRadius: '14px',
                                                        padding: '12px 10px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        boxShadow: packagePaymentMode === 'completo' ? '0 4px 12px rgba(225,29,72,0.1)' : 'none'
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                                                                💎 100% Liquidado
                                                            </span>
                                                            <input
                                                                type="radio"
                                                                name="packagePaymentMode"
                                                                checked={packagePaymentMode === 'completo'}
                                                                onChange={() => setPackagePaymentMode('completo')}
                                                            />
                                                        </div>
                                                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                                                            Pago Total Completo
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                                                            {formatPrice(effectiveTotalPrice)} MXN de contado
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {packagePaymentMode === 'anticipo' && (
                                                <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b' }}>
                                                            📅 Plazo de Cuotas Mensuales:
                                                        </label>
                                                        <span style={{ fontSize: '0.7rem', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                                                            Máx. {maxInstallments} {maxInstallments === 1 ? 'mes' : 'meses'} antes del viaje
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {availableInstallments.map(count => (
                                                            <button
                                                                key={count}
                                                                type="button"
                                                                onClick={() => setSelectedInstallments(count)}
                                                                style={{
                                                                    flex: '1 1 auto',
                                                                    padding: '6px 10px',
                                                                    borderRadius: '8px',
                                                                    border: selectedInstallments === count ? '2px solid var(--color-primary, #e11d48)' : '1px solid #cbd5e1',
                                                                    background: selectedInstallments === count ? 'var(--color-primary, #e11d48)' : '#fff',
                                                                    color: selectedInstallments === count ? '#fff' : '#334155',
                                                                    fontWeight: 800,
                                                                    fontSize: '0.78rem',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.15s'
                                                                }}
                                                            >
                                                                {count} {count === 1 ? 'mes' : 'meses'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Detailed Summary */}
                                    <div className="jtb-checkout-summary" style={{ marginBottom: '14px' }}>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Concepto:</span>
                                            <strong>{isToursSueltos ? `Tours en Japón (${assistanceLabel})` : `Japón ${season?.emoji || ''} ${season?.name || ''} — ${estilo}`}</strong>
                                        </div>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Comprador:</span>
                                            <span>{nombre} ({telefono})</span>
                                        </div>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Asistentes / Pasajeros ({travelers.length}):</span>
                                            <span>{travelers.map(t => t.fullName || 'Persona').join(', ')}</span>
                                        </div>
                                        {isToursSueltos && (
                                            <div className="jtb-checkout-summary-row">
                                                <span>Modalidad Seleccionada:</span>
                                                <span style={{ color: 'var(--color-primary, #e11d48)', fontWeight: 800 }}>{assistanceLabel}</span>
                                            </div>
                                        )}

                                        {!isToursSueltos && packagePaymentMode === 'anticipo' && (
                                            <>
                                                <div className="jtb-checkout-summary-row">
                                                    <span>Total Estimado del Viaje:</span>
                                                    <span>{formatPrice(effectiveTotalPrice)} MXN</span>
                                                </div>
                                                <div className="jtb-checkout-summary-row">
                                                    <span>Saldo Restante a Financiar:</span>
                                                    <span>{formatPrice(remainder)} MXN</span>
                                                </div>
                                                <div className="jtb-checkout-summary-row">
                                                    <span>Plan de Mensualidades:</span>
                                                    <span style={{ color: '#0284c7', fontWeight: 800 }}>{selectedInstallments} cuotas de {formatPrice(monthlyInstallment)} MXN/mes</span>
                                                </div>
                                            </>
                                        )}

                                        <div className="jtb-checkout-summary-divider" />
                                        
                                        <div className="jtb-checkout-summary-row highlight">
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                                                {isToursSueltos
                                                    ? 'Total de Tours a Pagar:'
                                                    : (packagePaymentMode === 'anticipo' ? 'Monto a Pagar Hoy (Anticipo):' : 'Total a Pagar en Línea (100%):')}
                                            </span>
                                            <span style={{ color: 'var(--color-primary, #e11d48)', fontWeight: 900, fontSize: '1.25rem' }}>
                                                {formatPrice(paymentAmount)} MXN
                                            </span>
                                        </div>
                                    </div>

                                    {/* Information Banner */}
                                    <div className="jtb-checkout-disclaimer" style={{
                                        marginBottom: '14px',
                                        background: (isToursSueltos && isWhatsAppMode) ? '#ecfdf5' : ((packagePaymentMode === 'anticipo') ? '#eff6ff' : '#ecfdf5'),
                                        borderColor: (isToursSueltos && isWhatsAppMode) ? '#a7f3d0' : ((packagePaymentMode === 'anticipo') ? '#bfdbfe' : '#a7f3d0'),
                                        color: (isToursSueltos && isWhatsAppMode) ? '#065f46' : ((packagePaymentMode === 'anticipo') ? '#1e40af' : '#065f46'),
                                        fontSize: '0.82rem',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                    }}>
                                        {isToursSueltos ? (
                                            isWhatsAppMode ? (
                                                <span>💬 <strong>Atención Directa por WhatsApp:</strong> Al hacer clic serás transferido a nuestro WhatsApp oficial con tu itinerario listo. Nuestro equipo te confirmará disponibilidad y te brindará asistencia personalizada inmediata.</span>
                                            ) : (
                                                <span>🔒 <strong>Pago Seguro en Línea (Wix Payments):</strong> Pagarás <strong>{formatPrice(paymentAmount)} MXN</strong> en Wix Checkout para confirmar y asegurar de inmediato la reserva de tus tours seleccionados.</span>
                                            )
                                        ) : (packagePaymentMode === 'anticipo' ? (
                                            <span>📧 <strong>Apartado + Invoicing Automático:</strong> Pagarás tu anticipo de <strong>$5,000 MXN</strong> en la pasarela segura de Wix para congelar tu tarifa. El saldo se liquidará mediante <strong>5 facturas mensuales de {formatPrice(monthlyInstallment)} MXN</strong> enviadas a <strong>{correo}</strong>.</span>
                                        ) : (
                                            <span>🔒 <strong>Liquidación Total:</strong> Pagarás <strong>{formatPrice(paymentAmount)} MXN</strong> en Wix Checkout para dejar tu viaje liquidado al 100% sin cuotas pendientes.</span>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    {(isToursSueltos && isWhatsAppMode) ? (
                                        /* Tours Sueltos WhatsApp Mode: Direct WhatsApp Booking */
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="jtb-checkout-submit-btn"
                                                style={{
                                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.35)',
                                                    border: 'none',
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    fontSize: '1rem',
                                                    fontWeight: 800,
                                                    padding: '14px 20px',
                                                    borderRadius: '100px',
                                                    cursor: 'pointer',
                                                    width: '100%'
                                                }}
                                                onClick={async () => {
                                                    syncCotizacion('whatsapp_booking_initiated', 4)
                                                    try {
                                                        const travelersSummary = travelers
                                                            .map((t, i) => `Persona ${i + 1}: ${t.fullName} (${t.type}${t.age ? `, ${t.age} años` : ''}${t.dietNotes ? ` - Notas: ${t.dietNotes}` : ''})`)
                                                            .join(' | ')

                                                        await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                                            body: JSON.stringify({
                                                                _subject: `🎟️ [WhatsApp Booking] Nueva Reserva Tours Individuales (${formatPrice(effectiveTotalPrice)} MXN) — ${nombre}`,
                                                                _cc: 'operaciones@rutaxasia.com',
                                                                _template: 'table',
                                                                _captcha: 'false',
                                                                _language: 'es',
                                                                'Comprador': nombre,
                                                                'Email': correo,
                                                                'Teléfono (WhatsApp)': telefono,
                                                                'Temporada / Sección': 'Tours Individuales',
                                                                'Modalidad': `Tours Sueltos (${assistanceLabel})`,
                                                                'Tipo de Cobro': 'Cotización y Reserva por WhatsApp',
                                                                'Monto Total Estimado': `${formatPrice(effectiveTotalPrice)} MXN`,
                                                                'Total de Asistentes': totalTravelers,
                                                                'Detalle de Asistentes': travelersSummary,
                                                                'Desglose del Pedido': desglose,
                                                                'Fecha de Registro': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
                                                            }),
                                                        })
                                                    } catch (fsErr) {
                                                        console.error('[CheckoutModal] FormSubmit error:', fsErr)
                                                    }
                                                    window.open(waUrl, '_blank')
                                                }}
                                            >
                                                💬 Enviar y Reservar Tours por WhatsApp ({formatPrice(effectiveTotalPrice)} MXN)
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                style={{ padding: '11px 16px', borderRadius: '100px', fontSize: '0.84rem', color: '#64748b', borderColor: '#cbd5e1', width: '100%' }}
                                                onClick={handlePrevStep}
                                            >
                                                ← Volver a Datos de Viajeros
                                            </button>
                                        </div>
                                    ) : (
                                        /* Online Payment Options (Wix Payments for Tours Individuales & Travel Packages) */
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button type="submit" className="jtb-checkout-submit-btn">
                                                {isToursSueltos
                                                    ? `💳 Pagar Total de ${formatPrice(paymentAmount)} MXN en Wix`
                                                    : (packagePaymentMode === 'anticipo'
                                                        ? `💳 Pagar Anticipo de $5,000 MXN en Wix`
                                                        : `💳 Pagar Total de ${formatPrice(paymentAmount)} MXN en Wix`)}
                                            </button>

                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    style={{ padding: '11px 16px', borderRadius: '100px', fontSize: '0.82rem', color: '#64748b', borderColor: '#cbd5e1' }}
                                                    onClick={handlePrevStep}
                                                >
                                                    ← {isToursSueltos ? 'Volver a Viajeros' : 'Viajeros'}
                                                </button>
                                                
                                                <a
                                                    href={waUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline"
                                                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '11px 14px', borderRadius: '100px', fontSize: '0.84rem', color: '#25D366', borderColor: '#25D366', fontWeight: 800 }}
                                                >
                                                    💬 {isToursSueltos ? 'O Cotizar por WhatsApp' : (packagePaymentMode === 'anticipo' ? 'Apartar por WhatsApp' : 'Pagar Total por WhatsApp')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {status === 'processing' && (
                    <div className="jtb-modal-status-view">
                        <div className="jtb-checkout-loader" />
                        <h3 style={{ marginTop: '16px', fontSize: '1.2rem', fontWeight: 800 }}>Preparando Pago Seguro...</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                            Estamos registrando tu reservación y conectando con la pasarela oficial de Wix Payments. Un momento por favor...
                        </p>
                    </div>
                )}

                {status === 'redirecting' && (
                    <div className="jtb-modal-status-view">
                        <div className="jtb-checkout-loader" />
                        <h3 style={{ marginTop: '16px', fontSize: '1.2rem', fontWeight: 800 }}>Redirigiendo a Wix Checkout...</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>
                            Te estamos transfiriendo a la pasarela segura de Wix para procesar tu pago de <strong>{formatPrice(paymentAmount)} MXN</strong>.
                        </p>
                        {resultData?.checkoutUrl && (
                            <a
                                href={resultData.checkoutUrl}
                                className="jtb-checkout-submit-btn"
                                style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 24px', fontSize: '0.9rem' }}
                            >
                                💳 Hacer clic aquí si no redirige automáticamente →
                            </a>
                        )}
                    </div>
                )}

                {status === 'error' && (
                    <div className="jtb-modal-status-view error">
                        <div className="jtb-error-cross">&times;</div>
                        <h3>Error al Procesar Reserva</h3>
                        <p className="error-desc">{apiError}</p>
                        <p>Por favor, inténtalo de nuevo o contáctanos por WhatsApp para asistirte de inmediato.</p>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                            <button className="jtb-error-retry-btn" onClick={() => setStatus('checkout')}>
                                Reintentar
                            </button>
                            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '10px 20px', borderRadius: '100px', color: '#25D366', borderColor: '#25D366', fontWeight: 800 }}>
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
