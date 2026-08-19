import { useState, useEffect } from 'react'
import { useTripSearch } from '../../context/TripContext'
import './StepStyles.css'

/**
 * CheckoutModal — Multi-Step Anticipation & Full Booking Checkout Modal
 *
 * 1. Tours Individuales:
 *    - Step 1: Modalidad de Asistencia (Locataria vs Anfitrión)
 *    - Step 2: Datos del Comprador y Asistentes
 *    - Step 3: Pago Total Completo (100%) vía Wix Payments / Checkout
 *
 * 2. Paquetes / Viajes Completos:
 *    - Step 1: Datos del Comprador y Pasajeros
 *    - Step 2: Datos de los Viajeros
 *    - Step 3: Modalidad de Pago:
 *         a) 💳 Anticipo ($5,000 MXN) + 5 Facturas/Invoices mensuales automáticas (Wix Invoicing)
 *         b) 💎 Pago Total Completo (100% Liquidación inmediata)
 */
export default function CheckoutModal({ isOpen, onClose, season, estilo, totalPrice, desglose }) {
    if (!isOpen) return null

    const { tripSearch } = useTripSearch() || {}
    const isToursSueltos = estilo === 'Tours Sueltos'

    // Step state: 1, 2, 3
    const [step, setStep] = useState(1)

    // Assistance Type for Tours Sueltos
    const [assistanceType, setAssistanceType] = useState('locataria') // 'locataria' | 'anfitrion'

    // Payment Mode for Packages: 'anticipo' ($5,000 + monthly invoices) | 'completo' (100% total)
    const [packagePaymentMode, setPackagePaymentMode] = useState('anticipo')
    const [selectedInstallments, setSelectedInstallments] = useState(5) // 3, 4, 5, 6, 8, 10 months

    // Buyer Information
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [telefono, setTelefono] = useState('')
    const [adultsCount, setAdultsCount] = useState(isToursSueltos ? 1 : (tripSearch?.adults || 2))
    const [childrenCount, setChildrenCount] = useState(isToursSueltos ? 0 : (tripSearch?.children || 0))

    const totalTravelers = Math.max(1, adultsCount + childrenCount)

    // Travelers Information list
    const [travelers, setTravelers] = useState([])

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

    // Calculate maximum allowed monthly installments based on departure date
    const calculateMaxAllowedInstallments = () => {
        const today = new Date()
        let targetDate = null
        const text = `${season?.name || ''} ${season?.key || ''} ${desglose || ''}`.toLowerCase()

        if (text.includes('2026') && (text.includes('oct') || text.includes('otoño') || text.includes('momiji'))) {
            targetDate = new Date(2026, 9, 15) // Oct 15, 2026 (2 months away)
        } else if (text.includes('2026') && (text.includes('nov') || text.includes('noviembre'))) {
            targetDate = new Date(2026, 10, 15)
        } else if (text.includes('2026') && (text.includes('dic') || text.includes('diciembre'))) {
            targetDate = new Date(2026, 11, 15)
        } else if (text.includes('2027') && (text.includes('mar') || text.includes('sakura') || text.includes('primavera') || text.includes('abr'))) {
            targetDate = new Date(2027, 2, 22) // Mar 22, 2027 (7 months away)
        } else if (text.includes('2027') && (text.includes('jul') || text.includes('ago') || text.includes('verano'))) {
            targetDate = new Date(2027, 6, 15) // Jul 15, 2027 (11 months away)
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

    // Adjust selected installments if current selection exceeds allowed maximum
    useEffect(() => {
        if (!availableInstallments.includes(selectedInstallments)) {
            setSelectedInstallments(availableInstallments[availableInstallments.length - 1] || 1)
        }
    }, [maxInstallments])

    // Dynamic Pricing & Invoicing calculations
    const paymentAmount = isToursSueltos
        ? totalPrice
        : (packagePaymentMode === 'anticipo' ? 5000 : totalPrice)

    const remainder = Math.max(0, totalPrice - paymentAmount)
    const effectiveInstallments = Math.min(selectedInstallments, maxInstallments)
    const installmentsCount = (!isToursSueltos && packagePaymentMode === 'anticipo') ? effectiveInstallments : 0
    const monthlyInstallment = installmentsCount > 0 ? Math.round(remainder / installmentsCount) : 0
    const generarInvoiceMensual = !isToursSueltos && packagePaymentMode === 'anticipo'

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

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
        e.preventDefault()
        if (isToursSueltos) {
            if (step === 1) {
                setStep(2)
            } else if (step === 2) {
                if (validateBuyer() && validateTravelers()) setStep(3)
            }
        } else {
            if (step === 1) {
                if (validateBuyer()) setStep(2)
            } else if (step === 2) {
                if (validateTravelers()) setStep(3)
            }
        }
    }

    const handlePrevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault()
        if (!validateBuyer() || !validateTravelers()) return

        setStatus('processing')
        setApiError('')

        const assistanceLabel = assistanceType === 'anfitrion' ? 'Anfitrión de Viaje' : 'Asistencia Locataria'
        const travelersSummary = travelers
            .map((t, i) => `Persona ${i + 1}: ${t.fullName} (${t.type}${t.age ? `, ${t.age} años` : ''}${t.dietNotes ? ` - Notas: ${t.dietNotes}` : ''})`)
            .join(' | ')

        const currentTipoPago = isToursSueltos ? 'tours_total' : packagePaymentMode

        try {
            // 1. Call serverless API to save reservation in Wix CMS and create Wix Checkout session
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
                    totalViaje: totalPrice,
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

            // 2. Send notification email to reservas@rutaxasia.com via FormSubmit
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
                        'Total del Viaje': `${formatPrice(totalPrice)} MXN`,
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
                // Immediate redirect to real Wix checkout URL
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
          `Comprador: ${nombre || 'Cliente'}. Asistentes: ${travelersWaText}. Total a pagar: ${formatPrice(totalPrice)} MXN.`
        : (packagePaymentMode === 'anticipo'
            ? `SW-Hola! Quiero realizar mi apartado de $5,000 MXN para el viaje: ${season?.name || 'Japón'} (${estilo}) y programar mis invoices mensuales. ` +
              `Comprador: ${nombre || 'Cliente'}. Pasajeros: ${travelersWaText}. Saldo restante: ${formatPrice(remainder)} MXN (5 cuotas de ${formatPrice(monthlyInstallment)} MXN).`
            : `SW-Hola! Quiero realizar el pago TOTAL COMPLETO de ${formatPrice(totalPrice)} MXN para el viaje: ${season?.name || 'Japón'} (${estilo}). ` +
              `Comprador: ${nombre || 'Cliente'}. Pasajeros: ${travelersWaText}.`)

    const waUrl = `https://wa.me/525657929121?text=${encodeURIComponent(waMsg)}`

    return (
        <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 999999 }}>
            <div className="jtb-checkout-modal-card">
                <button className="jtb-modal-close" onClick={onClose}>&times;</button>

                {status === 'checkout' && (
                    <div className="jtb-checkout-form">
                        {/* Step Indicator Header */}
                        <div className="jtb-modal-header" style={{ marginBottom: '16px', textAlign: 'center' }}>
                            <h3 className="jtb-checkout-title">
                                {isToursSueltos ? '🎟️ Reserva y Pago de Tours' : '💳 Reserva y Pago de Viaje a Japón'}
                            </h3>
                            <p className="jtb-checkout-subtitle">
                                {isToursSueltos
                                    ? 'Personaliza tu asistencia y completa tu pago seguro'
                                    : 'Aparta tus lugares con anticipo o liquida tu viaje de forma 100% segura'}
                            </p>

                            {/* 3 Steps Progress Bar */}
                            <div className="jtb-checkout-steps-bar">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: step >= 1 ? 1 : 0.4 }}>
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 1 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: step === 1 ? 800 : 600, color: step === 1 ? 'var(--color-primary, #e11d48)' : '#64748b', whiteSpace: 'nowrap' }}>
                                        {isToursSueltos ? 'Asistencia' : 'Comprador'}
                                    </span>
                                </div>
                                <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: step >= 2 ? 1 : 0.4 }}>
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 2 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: step === 2 ? 800 : 600, color: step === 2 ? 'var(--color-primary, #e11d48)' : '#64748b', whiteSpace: 'nowrap' }}>
                                        Viajeros ({totalTravelers})
                                    </span>
                                </div>
                                <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: step >= 3 ? 1 : 0.4 }}>
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step >= 3 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: step === 3 ? 800 : 600, color: step === 3 ? 'var(--color-primary, #e11d48)' : '#64748b', whiteSpace: 'nowrap' }}>
                                        {isToursSueltos ? 'Pagar Total' : 'Modalidad de Pago'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ================= STEP 1: ASISTENCIA (FOR TOURS SUELTOS) ================= */}
                        {step === 1 && isToursSueltos && (
                            <div>
                                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '12px', color: 'var(--color-dark)' }}>
                                    🏮 1. Elige tu Modalidad de Acompañamiento:
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                    {/* Card 1: Asistencia Locataria */}
                                    <div
                                        onClick={() => setAssistanceType('locataria')}
                                        style={{
                                            border: assistanceType === 'locataria' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                            background: assistanceType === 'locataria' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                            borderRadius: '16px',
                                            padding: '16px 14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: assistanceType === 'locataria' ? '0 8px 20px rgba(225,29,72,0.12)' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '1.8rem' }}>🏮</span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    padding: '2px 7px',
                                                    borderRadius: '6px',
                                                    background: assistanceType === 'locataria' ? 'var(--color-primary, #e11d48)' : '#f1f5f9',
                                                    color: assistanceType === 'locataria' ? '#fff' : '#64748b'
                                                }}>
                                                    {assistanceType === 'locataria' ? '✓ Elegido' : 'Elegir'}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                Asistencia Locataria
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.35 }}>
                                                Orientación y soporte local en destino con recomendaciones de coordinadores locales en español.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card 2: Anfitrión de Viaje */}
                                    <div
                                        onClick={() => setAssistanceType('anfitrion')}
                                        style={{
                                            border: assistanceType === 'anfitrion' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                            background: assistanceType === 'anfitrion' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                            borderRadius: '16px',
                                            padding: '16px 14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: assistanceType === 'anfitrion' ? '0 8px 20px rgba(225,29,72,0.12)' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '1.8rem' }}>👑</span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    padding: '2px 7px',
                                                    borderRadius: '6px',
                                                    background: assistanceType === 'anfitrion' ? 'var(--color-primary, #e11d48)' : '#f1f5f9',
                                                    color: assistanceType === 'anfitrion' ? '#fff' : '#64748b'
                                                }}>
                                                    {assistanceType === 'anfitrion' ? '✓ Elegido' : 'Elegir'}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                Anfitrión de Viaje
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.35 }}>
                                                Acompañamiento dedicado y personalizado durante todo el tour para una inmersión completa.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '13px', borderRadius: '100px', fontSize: '0.92rem', fontWeight: 800 }}
                                    onClick={() => setStep(2)}
                                >
                                    Continuar con Datos de Asistentes →
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 1: COMPRADOR (FOR PACKAGES) ================= */}
                        {step === 1 && !isToursSueltos && (
                            <div>
                                <div className="jtb-form-section" style={{ marginTop: '6px' }}>
                                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '12px', color: 'var(--color-dark)' }}>
                                        👤 1. Información del Comprador (Titular)
                                    </h4>

                                    <div className="jtb-input-group" style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Nombre Completo</label>
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
                                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Correo Electrónico</label>
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
                                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Teléfono (WhatsApp)</label>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                maxLength={10}
                                                placeholder="10 dígitos (ej. 5512345678)"
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
                                            👥 Cantidad de Pasajeros para este Viaje:
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
                                                Total: {totalTravelers} {totalTravelers === 1 ? 'Viajero' : 'Viajeros'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '13px', borderRadius: '100px', fontSize: '0.92rem', fontWeight: 800 }}
                                        onClick={handleNextStep}
                                    >
                                        Continuar con Datos de los {totalTravelers} Viajeros →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 2: DATOS COMPRADOR & VIAJEROS ================= */}
                        {step === 2 && (
                            <div>
                                <div className="jtb-form-section" style={{ marginTop: '6px' }}>
                                    {/* For Tours Sueltos, capture buyer details in Step 2 */}
                                    {isToursSueltos && (
                                        <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--color-dark)' }}>
                                                👤 Información del Comprador
                                            </h4>
                                            <div className="jtb-input-group" style={{ marginBottom: '8px' }}>
                                                <label style={{ fontSize: '0.76rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    placeholder="Nombre y apellidos"
                                                    value={nombre}
                                                    onChange={(e) => handleBuyerNameChange(e.target.value)}
                                                    style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: errors.nombre ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                />
                                                {errors.nombre && <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>{errors.nombre}</span>}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.76rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Correo Electrónico</label>
                                                    <input
                                                        type="email"
                                                        placeholder="correo@ejemplo.com"
                                                        value={correo}
                                                        onChange={(e) => setCorreo(e.target.value)}
                                                        style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: errors.correo ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                    />
                                                    {errors.correo && <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>{errors.correo}</span>}
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.76rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Teléfono (WhatsApp)</label>
                                                    <input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        maxLength={10}
                                                        placeholder="10 dígitos"
                                                        value={telefono}
                                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                                        style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: errors.telefono ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                    />
                                                    {errors.telefono && <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>{errors.telefono}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h4 className="jtb-checkout-section-title">
                                            📋 Datos de Viajeros ({totalTravelers})
                                        </h4>
                                        {/* Dynamic Passenger Counter for Tours Sueltos */}
                                        {isToursSueltos && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '100px', padding: '2px 8px' }}>
                                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Total:</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 900, color: '#333' }}
                                                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                                                >-</button>
                                                <span style={{ fontWeight: 800, minWidth: '14px', textAlign: 'center', fontSize: '0.82rem' }}>{totalTravelers}</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 900, color: '#333' }}
                                                    onClick={() => setAdultsCount(adultsCount + 1)}
                                                >+</button>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '36vh', overflowY: 'auto', paddingRight: '4px' }}>
                                        {travelers.map((t, idx) => (
                                            <div key={idx} style={{
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '12px',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                        Persona {idx + 1} {idx === 0 ? '(Titular)' : ''}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: t.type === 'Menor' ? '#fef3c7' : '#e0f2fe', color: t.type === 'Menor' ? '#92400e' : '#0369a1' }}>
                                                        {t.type}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.72rem', color: '#475569', display: 'block', marginBottom: '2px' }}>Nombre Completo *</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`Nombre completo persona ${idx + 1}`}
                                                            value={t.fullName}
                                                            onChange={(e) => handleTravelerChange(idx, 'fullName', e.target.value)}
                                                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: errors[`traveler_${idx}`] ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.82rem' }}
                                                        />
                                                        {errors[`traveler_${idx}`] && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>{errors[`traveler_${idx}`]}</span>}
                                                    </div>

                                                    <div>
                                                        <label style={{ fontSize: '0.72rem', color: '#475569', display: 'block', marginBottom: '2px' }}>Edad</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ej. 25"
                                                            value={t.age}
                                                            onChange={(e) => handleTravelerChange(idx, 'age', e.target.value)}
                                                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                                                        />
                                                    </div>
                                                </div>
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
                                        ← Volver
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '12px 16px', borderRadius: '100px', fontSize: '0.88rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                                        onClick={handleNextStep}
                                    >
                                        Continuar al Pago →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 3: MODALIDAD DE PAGO Y CHECKOUT ================= */}
                        {step === 3 && (
                            <form onSubmit={handleCheckoutSubmit}>
                                <div style={{ marginTop: '6px' }}>

                                    {/* Package Payment Options Selector (Only for full travel packages) */}
                                    {!isToursSueltos && (
                                        <div style={{ marginBottom: '14px' }}>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-dark)', display: 'block', marginBottom: '8px' }}>
                                                💳 Elige tu Modalidad de Pago:
                                            </label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                {/* Option A: Anticipo + Monthly Invoices */}
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

                                                {/* Option B: Full Payment */}
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
                                                                100% Liquidado
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
                                                            {formatPrice(totalPrice)} MXN de contado
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic Monthly Installments Selector */}
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
                                            <span>Viajeros Registrados ({travelers.length}):</span>
                                            <span>{travelers.map(t => t.fullName || 'Persona').join(', ')}</span>
                                        </div>
                                        {isToursSueltos && (
                                            <div className="jtb-checkout-summary-row">
                                                <span>Modalidad:</span>
                                                <span style={{ color: 'var(--color-primary, #e11d48)', fontWeight: 800 }}>{assistanceLabel}</span>
                                            </div>
                                        )}

                                        {!isToursSueltos && packagePaymentMode === 'anticipo' && (
                                            <>
                                                <div className="jtb-checkout-summary-row">
                                                    <span>Total Estimado del Viaje:</span>
                                                    <span>{formatPrice(totalPrice)} MXN</span>
                                                </div>
                                                <div className="jtb-checkout-summary-row">
                                                    <span>Saldo Restante a Financiar:</span>
                                                    <span>{formatPrice(remainder)} MXN</span>
                                                </div>
                                                <div className="jtb-checkout-summary-row">
                                                    <span>Plan de Facturas Mensuales:</span>
                                                    <span style={{ color: '#0284c7', fontWeight: 800 }}>{selectedInstallments} cuotas de {formatPrice(monthlyInstallment)} MXN/mes</span>
                                                </div>
                                            </>
                                        )}

                                        <div className="jtb-checkout-summary-divider" />
                                        
                                        <div className="jtb-checkout-summary-row highlight">
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                                                {isToursSueltos
                                                    ? 'Total a Pagar en Línea (100%):'
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
                                        background: (!isToursSueltos && packagePaymentMode === 'anticipo') ? '#eff6ff' : '#ecfdf5',
                                        borderColor: (!isToursSueltos && packagePaymentMode === 'anticipo') ? '#bfdbfe' : '#a7f3d0',
                                        color: (!isToursSueltos && packagePaymentMode === 'anticipo') ? '#1e40af' : '#065f46',
                                        fontSize: '0.82rem',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                    }}>
                                        {isToursSueltos ? (
                                            <span>🔒 <strong>Pago Seguro en Wix:</strong> Al hacer clic serás transferido a Wix Checkout para liquidar <strong>{formatPrice(paymentAmount)} MXN</strong> de forma 100% protegida.</span>
                                        ) : (packagePaymentMode === 'anticipo' ? (
                                            <span>📧 <strong>Apartado + Invoicing Automático:</strong> Pagarás tu anticipo de <strong>$5,000 MXN</strong> en la pasarela segura de Wix para congelar tu tarifa. El saldo se liquidará mediante <strong>5 facturas mensuales de {formatPrice(monthlyInstallment)} MXN</strong> enviadas a <strong>{correo}</strong>.</span>
                                        ) : (
                                            <span>🔒 <strong>Liquidación Total:</strong> Pagarás <strong>{formatPrice(paymentAmount)} MXN</strong> en Wix Checkout para dejar tu viaje liquidado al 100% sin cuotas pendientes.</span>
                                        ))}
                                    </div>

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
                                                ← Editar Datos
                                            </button>
                                            
                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline"
                                                style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '11px 14px', borderRadius: '100px', fontSize: '0.84rem', color: '#25D366', borderColor: '#25D366', fontWeight: 800 }}
                                            >
                                                💬 {isToursSueltos ? 'Pagar por WhatsApp' : (packagePaymentMode === 'anticipo' ? 'Apartar por WhatsApp' : 'Pagar Total por WhatsApp')}
                                            </a>
                                        </div>
                                    </div>
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
