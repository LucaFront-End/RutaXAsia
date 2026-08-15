import { useState, useEffect } from 'react'
import { useTripSearch } from '../../context/TripContext'
import './StepStyles.css'

/**
 * CheckoutModal — Multi-Step Anticipation Booking & Checkout Modal
 * For Packages (Libre, Esencial, Completo):
 *   Step 1: Información del Comprador
 *   Step 2: Información de los Viajantes
 *   Step 3: Pagar Anticipo ($5,000 MXN)
 *
 * For Tours Sueltos (Tours Individuales):
 *   Step 1: Modalidad de Asistencia (Locataria vs Anfitrión)
 *   Step 2: Información del Comprador y Viajantes (con selector dinámico de asistentes)
 *   Step 3: Pagar Total Completo de los Tours
 */
export default function CheckoutModal({ isOpen, onClose, season, estilo, totalPrice, desglose }) {
    if (!isOpen) return null

    const { tripSearch } = useTripSearch() || {}
    const isToursSueltos = estilo === 'Tours Sueltos'

    // Step state: 1, 2, 3
    const [step, setStep] = useState(1)

    // Assistance Type for Tours Sueltos
    const [assistanceType, setAssistanceType] = useState('locataria') // 'locataria' | 'anfitrion'

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

    // Update Traveler 1 name if Buyer name changes and Traveler 1 hasn't been manually diverged
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

    const [status, setStatus] = useState('checkout') // checkout, processing, success, error
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')
    const [resultData, setResultData] = useState(null)

    // Pricing details: Full price for Tours Sueltos, 5000 deposit for packages
    const paymentAmount = isToursSueltos ? totalPrice : 5000
    const remainder = Math.max(0, totalPrice - paymentAmount)
    const installmentsCount = 5
    const monthlyInstallment = Math.round(remainder / installmentsCount)

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    // Validation for Buyer Information
    const validateBuyer = () => {
        const errs = {}
        if (!nombre.trim()) errs.nombre = 'El nombre completo es obligatorio.'
        if (!correo.trim() || !/\S+@\S+\.\S+/.test(correo)) errs.correo = 'Introduce un correo válido.'
        if (!telefono.trim() || telefono.length < 10) errs.telefono = 'Introduce un teléfono de al menos 10 dígitos.'
        setErrors(errs)
        return Object.keys(errs).length === 0
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

        try {
            // 1. Call serverless API to save reservation in Wix CMS and create Checkout session
            const response = await fetch('/api/wix-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    correo,
                    telefono,
                    temporada: isToursSueltos ? 'Tours Individuales' : (season?.name || 'Japón'),
                    estilo: isToursSueltos ? `Tours Sueltos (${assistanceLabel})` : (estilo || 'Reserva'),
                    totalViaje: totalPrice,
                    montoAnticipo: paymentAmount,
                    desglose: `${desglose || ''} [Modalidad: ${assistanceLabel}] [Asistentes: ${travelersSummary}]`,
                    viajeros: travelers,
                })
            })

            const result = await response.json()

            // 2. Send notification email to reservas@rutaxasia.com.mx via FormSubmit
            try {
                await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com.mx', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: isToursSueltos
                            ? `🎟️ Nueva Reserva de Tours Individuales (${formatPrice(paymentAmount)} MXN) — ${nombre}`
                            : `💳 Nuevo Apartado de Viaje ($5,000 MXN) — ${nombre} (${season?.name || 'Japón'})`,
                        _template: 'box',
                        _captcha: 'false',
                        _language: 'es',
                        'Comprador': nombre,
                        'Email': correo,
                        'Teléfono (WhatsApp)': telefono,
                        'Temporada / Sección': isToursSueltos ? 'Tours Individuales' : (season?.name || 'Japón'),
                        'Modalidad': isToursSueltos ? `Tours Sueltos (${assistanceLabel})` : (estilo || 'Reserva'),
                        'Tipo de Asistencia': isToursSueltos ? assistanceLabel : 'Incluida en paquete',
                        'Monto a Pagar': `${formatPrice(paymentAmount)} MXN (${isToursSueltos ? 'Pago Total Completo' : 'Anticipo de Apartado'})`,
                        'Total Estimado': `${formatPrice(totalPrice)} MXN`,
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
                setStatus('success')
                // Redirect to exact checkout URL
                setTimeout(() => {
                    window.location.href = result.checkoutUrl
                }, 1200)
            } else {
                setApiError(result.error || 'Hubo un problema al conectar con la pasarela de pago.')
                setStatus('error')
            }

        } catch (err) {
            console.error('Checkout error:', err)
            setApiError('Error de conexión. Inténtalo de nuevo por favor.')
            setStatus('error')
        }
    }

    const assistanceLabel = assistanceType === 'anfitrion' ? 'Anfitrión de Viaje' : 'Asistencia Locataria'
    const travelersWaText = travelers.map((t, i) => `Persona ${i + 1}: ${t.fullName || 'Pendiente'} (${t.type})`).join(', ')
    const waMsg = isToursSueltos
        ? `SW-Hola! Quiero reservar los siguientes Tours en Japón (${assistanceLabel}): ${desglose || ''}. ` +
          `Comprador: ${nombre || 'Cliente'}. Asistentes: ${travelersWaText}. Total a pagar: ${formatPrice(totalPrice)} MXN.`
        : `SW-Hola! Quiero realizar mi apartado de $5,000 MXN para el viaje: ${season?.name || 'Japón'} (${estilo}). ` +
          `Comprador: ${nombre || 'Cliente'}. Pasajeros: ${travelersWaText}. Total: ${formatPrice(totalPrice)} MXN. ${desglose || ''}`

    const waUrl = `https://wa.me/525657929121?text=${encodeURIComponent(waMsg)}`

    return (
        <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 999999 }}>
            <div className="jtb-modal-card" style={{ maxWidth: '640px', padding: '36px 30px' }}>
                <button className="jtb-modal-close" onClick={onClose}>&times;</button>

                {status === 'checkout' && (
                    <div className="jtb-checkout-form">
                        {/* Step Indicator Header */}
                        <div className="jtb-modal-header" style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.45rem', marginBottom: '6px' }}>
                                {isToursSueltos ? '🎟️ Reserva y Pago de Tours en Japón' : '💳 Apartado de Viaje con Anticipo'}
                            </h3>
                            <p style={{ fontSize: '0.88rem' }}>
                                {isToursSueltos
                                    ? 'Personaliza tu asistencia y completa tu pago seguro para confirmar tus tours'
                                    : 'Congela tu tarifa y aparta tus lugares pagando únicamente $5,000 MXN'}
                            </p>

                            {/* 3 Steps Progress Bar */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '18px',
                                padding: '10px 14px',
                                background: '#f8fafc',
                                borderRadius: '100px',
                                border: '1px solid #e2e8f0',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: step >= 1 ? 1 : 0.4 }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 1 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: step === 1 ? 800 : 600, color: step === 1 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                        {isToursSueltos ? 'Asistencia' : 'Comprador'}
                                    </span>
                                </div>
                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>→</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: step >= 2 ? 1 : 0.4 }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 2 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: step === 2 ? 800 : 600, color: step === 2 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                        {isToursSueltos ? `Datos & Asistentes (${totalTravelers})` : `Viajeros (${totalTravelers})`}
                                    </span>
                                </div>
                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>→</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: step >= 3 ? 1 : 0.4 }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 3 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: step === 3 ? 800 : 600, color: step === 3 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>
                                        {isToursSueltos ? 'Pagar Total' : 'Pago Anticipo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ================= STEP 1: ASISTENCIA (FOR TOURS SUELTOS) OR COMPRADOR (FOR PACKAGES) ================= */}
                        {step === 1 && isToursSueltos && (
                            <div>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', color: 'var(--color-dark)' }}>
                                    🏮 1. Elige tu Modalidad de Acompañamiento:
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                                    {/* Card 1: Asistencia Locataria */}
                                    <div
                                        onClick={() => setAssistanceType('locataria')}
                                        style={{
                                            border: assistanceType === 'locataria' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                            background: assistanceType === 'locataria' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                            borderRadius: '16px',
                                            padding: '20px 16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: assistanceType === 'locataria' ? '0 8px 20px rgba(225,29,72,0.12)' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '2rem' }}>🏮</span>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    background: assistanceType === 'locataria' ? 'var(--color-primary, #e11d48)' : '#f1f5f9',
                                                    color: assistanceType === 'locataria' ? '#fff' : '#64748b'
                                                }}>
                                                    {assistanceType === 'locataria' ? '✓ Seleccionado' : 'Elegir'}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                Asistencia Locataria
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                                                Orientación y soporte local en destino. Disfruta tu recorrido con la asistencia y recomendaciones de coordinadores locales en español.
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
                                            padding: '20px 16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: assistanceType === 'anfitrion' ? '0 8px 20px rgba(225,29,72,0.12)' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '2rem' }}>👑</span>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    background: assistanceType === 'anfitrion' ? 'var(--color-primary, #e11d48)' : '#f1f5f9',
                                                    color: assistanceType === 'anfitrion' ? '#fff' : '#64748b'
                                                }}>
                                                    {assistanceType === 'anfitrion' ? '✓ Seleccionado' : 'Elegir'}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                Anfitrión de Viaje
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                                                Acompañamiento cercano y personalizado durante todo el tour. Atención dedicada para una inmersión completa sin preocuparte por traslados ni logística.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '14px', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 800 }}
                                    onClick={() => setStep(2)}
                                >
                                    Continuar con Datos de Asistentes →
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 1 (FOR PACKAGES) ================= */}
                        {step === 1 && !isToursSueltos && (
                            <div>
                                <div className="jtb-form-section" style={{ marginTop: '10px' }}>
                                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', color: 'var(--color-dark)' }}>
                                        👤 1. Información del Comprador (Titular de la Cuenta)
                                    </h4>

                                    <div className="jtb-input-group" style={{ marginBottom: '14px' }}>
                                        <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Nombre Completo</label>
                                        <input
                                            type="text"
                                            placeholder="Como aparece en tu pasaporte o identificación oficial"
                                            value={nombre}
                                            onChange={(e) => handleBuyerNameChange(e.target.value)}
                                            className={errors.nombre ? 'input-error' : ''}
                                            style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                        />
                                        {errors.nombre && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{errors.nombre}</span>}
                                    </div>

                                    <div className="jtb-input-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                                        <div className="jtb-input-group">
                                            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Correo Electrónico</label>
                                            <input
                                                type="email"
                                                placeholder="correo@ejemplo.com"
                                                value={correo}
                                                onChange={(e) => { setErrors(prev => ({ ...prev, correo: '' })); setCorreo(e.target.value); }}
                                                className={errors.correo ? 'input-error' : ''}
                                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                            />
                                            {errors.correo && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{errors.correo}</span>}
                                        </div>

                                        <div className="jtb-input-group">
                                            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Teléfono (WhatsApp)</label>
                                            <input
                                                type="tel"
                                                placeholder="55 1234 5678"
                                                value={telefono}
                                                onChange={(e) => { setErrors(prev => ({ ...prev, telefono: '' })); setTelefono(e.target.value); }}
                                                className={errors.telefono ? 'input-error' : ''}
                                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                            />
                                            {errors.telefono && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{errors.telefono}</span>}
                                        </div>
                                    </div>

                                    {/* Number of Passengers Adjuster */}
                                    <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)', display: 'block', marginBottom: '8px' }}>
                                            👥 Cantidad de Pasajeros para este Viaje:
                                        </label>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Adultos:</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
                                                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                                                >-</button>
                                                <span style={{ fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{adultsCount}</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
                                                    onClick={() => setAdultsCount(adultsCount + 1)}
                                                >+</button>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Menores:</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
                                                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                                                >-</button>
                                                <span style={{ fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{childrenCount}</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
                                                    onClick={() => setChildrenCount(childrenCount + 1)}
                                                >+</button>
                                            </div>

                                            <span style={{ fontSize: '0.82rem', color: 'var(--color-primary, #e11d48)', fontWeight: 800, marginLeft: 'auto' }}>
                                                Total: {totalTravelers} {totalTravelers === 1 ? 'Viajero' : 'Viajeros'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '24px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '14px', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 800 }}
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
                                <div className="jtb-form-section" style={{ marginTop: '10px' }}>
                                    {/* For Tours Sueltos, also capture buyer details in Step 2 */}
                                    {isToursSueltos && (
                                        <div style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--color-dark)' }}>
                                                👤 Información del Comprador
                                            </h4>
                                            <div className="jtb-input-group" style={{ marginBottom: '10px' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    placeholder="Nombre y apellidos"
                                                    value={nombre}
                                                    onChange={(e) => handleBuyerNameChange(e.target.value)}
                                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: errors.nombre ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                                />
                                                {errors.nombre && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors.nombre}</span>}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Correo Electrónico</label>
                                                    <input
                                                        type="email"
                                                        placeholder="correo@ejemplo.com"
                                                        value={correo}
                                                        onChange={(e) => setCorreo(e.target.value)}
                                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: errors.correo ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                                    />
                                                    {errors.correo && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors.correo}</span>}
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Teléfono (WhatsApp)</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="55 1234 5678"
                                                        value={telefono}
                                                        onChange={(e) => setTelefono(e.target.value)}
                                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: errors.telefono ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                                    />
                                                    {errors.telefono && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors.telefono}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-dark)' }}>
                                            📋 Nombre(s) de Asistente(s) ({totalTravelers})
                                        </h4>
                                        {/* Dynamic Passenger Counter for Tours Sueltos */}
                                        {isToursSueltos && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '100px', padding: '3px 8px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Cantidad:</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 900, color: '#333' }}
                                                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                                                >-</button>
                                                <span style={{ fontWeight: 800, minWidth: '16px', textAlign: 'center', fontSize: '0.85rem' }}>{totalTravelers}</span>
                                                <button
                                                    type="button"
                                                    style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 900, color: '#333' }}
                                                    onClick={() => setAdultsCount(adultsCount + 1)}
                                                >+</button>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '36vh', overflowY: 'auto', paddingRight: '4px' }}>
                                        {travelers.map((t, idx) => (
                                            <div key={idx} style={{
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '14px',
                                                padding: '14px',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                        Persona {idx + 1} {idx === 0 ? '(Titular)' : ''}
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: t.type === 'Menor' ? '#fef3c7' : '#e0f2fe', color: t.type === 'Menor' ? '#92400e' : '#0369a1' }}>
                                                        {t.type}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#475569', display: 'block', marginBottom: '2px' }}>Nombre Completo *</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`Nombre completo persona ${idx + 1}`}
                                                            value={t.fullName}
                                                            onChange={(e) => handleTravelerChange(idx, 'fullName', e.target.value)}
                                                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: errors[`traveler_${idx}`] ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                        />
                                                        {errors[`traveler_${idx}`] && <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>{errors[`traveler_${idx}`]}</span>}
                                                    </div>

                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#475569', display: 'block', marginBottom: '2px' }}>Edad</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ej. 25"
                                                            value={t.age}
                                                            onChange={(e) => handleTravelerChange(idx, 'age', e.target.value)}
                                                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{ padding: '14px 20px', borderRadius: '100px', fontSize: '0.9rem', color: '#64748b', borderColor: '#cbd5e1' }}
                                        onClick={handlePrevStep}
                                    >
                                        ← Volver
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '14px', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 800 }}
                                        onClick={handleNextStep}
                                    >
                                        {isToursSueltos ? 'Continuar al Pago del Total →' : 'Continuar al Pago del Anticipo →'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 3: PAGO DE TOTAL O ANTICIPO ================= */}
                        {step === 3 && (
                            <form onSubmit={handleCheckoutSubmit}>
                                <div style={{ marginTop: '10px' }}>
                                    {/* Detailed Summary */}
                                    <div className="jtb-checkout-summary" style={{ marginBottom: '18px' }}>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Concepto:</span>
                                            <strong>{isToursSueltos ? `Tours en Japón (${assistanceLabel})` : `Japón ${season?.emoji || ''} ${season?.name || ''} — ${estilo}`}</strong>
                                        </div>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Comprador:</span>
                                            <span>{nombre} ({telefono})</span>
                                        </div>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Asistentes Registrados ({travelers.length}):</span>
                                            <span>{travelers.map(t => t.fullName || 'Persona').join(', ')}</span>
                                        </div>
                                        {isToursSueltos && (
                                            <div className="jtb-checkout-summary-row">
                                                <span>Modalidad:</span>
                                                <span style={{ color: 'var(--color-primary, #e11d48)', fontWeight: 800 }}>{assistanceLabel}</span>
                                            </div>
                                        )}
                                        <div className="jtb-checkout-summary-divider" />
                                        
                                        <div className="jtb-checkout-summary-row highlight">
                                            <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                                                {isToursSueltos ? 'Total a Pagar en Línea (100%):' : 'Monto de Anticipo de Apartado (Hoy):'}
                                            </span>
                                            <span style={{ color: 'var(--color-primary, #e11d48)', fontWeight: 900, fontSize: '1.3rem' }}>
                                                {formatPrice(paymentAmount)} MXN
                                            </span>
                                        </div>
                                    </div>

                                    <div className="jtb-checkout-disclaimer" style={{ marginBottom: '16px', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
                                        {isToursSueltos ? (
                                            <span>🔒 <strong>Confirmación Inmediata:</strong> Al pagar el total de <strong>{formatPrice(paymentAmount)} MXN</strong>, tus tours quedan confirmados y programados con los nombres de tus asistentes.</span>
                                        ) : (
                                            <span>🔒 <strong>Garantía de Lugar:</strong> Tu anticipo de <strong>{formatPrice(paymentAmount)} MXN</strong> congela la tarifa y asegura tus lugares. El saldo restante se liquida en mensualidades.</span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button type="submit" className="jtb-checkout-submit-btn" style={{ padding: '16px', fontSize: '1rem', fontWeight: 800 }}>
                                            {isToursSueltos
                                                ? `💳 Pagar Total de ${formatPrice(paymentAmount)} MXN en Línea`
                                                : `💳 Pagar Anticipo de ${formatPrice(paymentAmount)} MXN en Línea`}
                                        </button>

                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                style={{ padding: '12px 18px', borderRadius: '100px', fontSize: '0.85rem', color: '#64748b', borderColor: '#cbd5e1' }}
                                                onClick={handlePrevStep}
                                            >
                                                ← Editar Datos
                                            </button>
                                            
                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline"
                                                style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '12px 16px', borderRadius: '100px', fontSize: '0.88rem', color: '#25D366', borderColor: '#25D366', fontWeight: 800 }}
                                            >
                                                💬 {isToursSueltos ? 'Pagar / Confirmar por WhatsApp' : 'Apartar por WhatsApp'}
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
                        <h3>Procesando Pago Seguro...</h3>
                        <p>Estamos registrando tu reservación y preparando la pasarela de pago segura de Wix. No cierres esta ventana.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="jtb-modal-status-view success">
                        <div className="jtb-success-checkmark">✓</div>
                        <h3>¡Reserva Registrada Exitosamente!</h3>
                        <p>Hola <strong>{nombre}</strong>, hemos registrado tu pedido correctamente para <strong>{travelers.length} persona(s)</strong>.</p>
                        
                        <div className="jtb-success-ticket animate-slide-in">
                            <div className="ticket-line">
                                <span>Código de Reserva:</span>
                                <span>{resultData?.wixId || 'Registrado'}</span>
                            </div>
                            <div className="ticket-line">
                                <span>Monto Cobrado:</span>
                                <span>{formatPrice(resultData?.depositPaid || paymentAmount)} MXN</span>
                            </div>
                            <div className="ticket-line">
                                <span>Estatus:</span>
                                <span className="status-badge">Aprobado</span>
                            </div>
                            <div className="ticket-line">
                                <span>Asistentes:</span>
                                <span className="status-highlight">{travelers.map(t => t.fullName).join(', ')}</span>
                            </div>
                        </div>

                        <p className="success-note">
                            Hemos enviado un recibo a tu correo <strong>{correo}</strong> con todos los detalles.
                        </p>

                        <button className="jtb-success-close-btn" onClick={onClose}>
                            Volver al Catálogo de Tours
                        </button>
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
