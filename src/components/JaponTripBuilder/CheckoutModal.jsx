import { useState, useEffect } from 'react'
import { useTripSearch } from '../../context/TripContext'
import './StepStyles.css'

/**
 * CheckoutModal — Multi-Step Anticipation Booking & Checkout Modal
 * Step 1: Información del Comprador (Titular)
 * Step 2: Información de los Viajantes (Generados según número de pasajeros)
 * Step 3: Pagar Anticipo ($5,000 MXN)
 */
export default function CheckoutModal({ isOpen, onClose, season, estilo, totalPrice, desglose }) {
    if (!isOpen) return null

    const { tripSearch } = useTripSearch() || {}

    // Step state: 1 (Comprador), 2 (Viajeros), 3 (Pago)
    const [step, setStep] = useState(1)

    // Buyer Information
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [telefono, setTelefono] = useState('')
    const [adultsCount, setAdultsCount] = useState(tripSearch?.adults || 2)
    const [childrenCount, setChildrenCount] = useState(tripSearch?.children || 0)

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

    // Pricing details
    const depositAmount = 5000
    const remainder = Math.max(0, totalPrice - depositAmount)
    const installmentsCount = 5
    const monthlyInstallment = Math.round(remainder / installmentsCount)

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    // Validation for Step 1
    const validateStep1 = () => {
        const errs = {}
        if (!nombre.trim()) errs.nombre = 'El nombre completo es obligatorio.'
        if (!correo.trim() || !/\S+@\S+\.\S+/.test(correo)) errs.correo = 'Introduce un correo válido.'
        if (!telefono.trim() || telefono.length < 10) errs.telefono = 'Introduce un teléfono de al menos 10 dígitos.'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    // Validation for Step 2
    const validateStep2 = () => {
        const errs = {}
        travelers.forEach((t, i) => {
            if (!t.fullName.trim()) {
                errs[`traveler_${i}`] = `Ingresa el nombre del Viajero ${i + 1}.`
            }
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleNextStep = (e) => {
        e.preventDefault()
        if (step === 1) {
            if (validateStep1()) setStep(2)
        } else if (step === 2) {
            if (validateStep2()) setStep(3)
        }
    }

    const handlePrevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault()
        if (!validateStep1() || !validateStep2()) return

        setStatus('processing')
        setApiError('')

        const travelersSummary = travelers
            .map((t, i) => `Viajero ${i + 1}: ${t.fullName} (${t.type}${t.age ? `, ${t.age} años` : ''}${t.dietNotes ? ` - Notas: ${t.dietNotes}` : ''})`)
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
                    temporada: season?.name || 'Japón',
                    estilo: estilo || 'Reserva',
                    totalViaje: totalPrice,
                    montoAnticipo: depositAmount,
                    desglose: `${desglose || ''} [Viajeros: ${travelersSummary}]`,
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
                        _subject: `💳 Nuevo Apartado de Viaje ($5,000 MXN) — ${nombre} (${season?.name || 'Japón'})`,
                        _template: 'box',
                        _captcha: 'false',
                        _language: 'es',
                        'Comprador': nombre,
                        'Email': correo,
                        'Teléfono (WhatsApp)': telefono,
                        'Temporada': season?.name || 'Japón',
                        'Modalidad': estilo || 'Reserva',
                        'Monto Anticipo Cobrado': `${formatPrice(depositAmount)} MXN`,
                        'Total Estimado': `${formatPrice(totalPrice)} MXN`,
                        'Total de Pasajeros': totalTravelers,
                        'Detalle de Viajantes': travelersSummary,
                        'Desglose del Itinerario': desglose,
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

    const travelersWaText = travelers.map((t, i) => `Viajero ${i + 1}: ${t.fullName || 'Pendiente'} (${t.type})`).join(', ')
    const waMsg = `SW-Hola! Quiero realizar mi apartado de $5,000 MXN para el viaje: ${season?.name || 'Japón'} (${estilo}). ` +
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
                            <h3 style={{ fontSize: '1.45rem', marginBottom: '6px' }}>💳 Apartado de Viaje con Anticipo</h3>
                            <p style={{ fontSize: '0.88rem' }}>Congela tu tarifa y aparta tus lugares pagando únicamente <strong>$5,000 MXN</strong></p>

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
                                    <span style={{ fontSize: '0.8rem', fontWeight: step === 1 ? 800 : 600, color: step === 1 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>Comprador</span>
                                </div>
                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>→</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: step >= 2 ? 1 : 0.4 }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 2 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: step === 2 ? 800 : 600, color: step === 2 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>Viajeros ({totalTravelers})</span>
                                </div>
                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>→</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: step >= 3 ? 1 : 0.4 }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step === 3 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: step === 3 ? 800 : 600, color: step === 3 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>Pago Anticipo</span>
                                </div>
                            </div>
                        </div>

                        {/* ================= STEP 1: COMPRADOR ================= */}
                        {step === 1 && (
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

                        {/* ================= STEP 2: VIAJEROS ================= */}
                        {step === 2 && (
                            <div>
                                <div className="jtb-form-section" style={{ marginTop: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-dark)' }}>
                                            📋 2. Información de los Viajantes ({travelers.length})
                                        </h4>
                                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Nombres para boletos y pases</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '42vh', overflowY: 'auto', paddingRight: '4px' }}>
                                        {travelers.map((t, idx) => (
                                            <div key={idx} style={{
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '16px',
                                                padding: '16px',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                        Viajero {idx + 1} {idx === 0 ? '(Titular / Comprador)' : ''}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: t.type === 'Menor' ? '#fef3c7' : '#e0f2fe', color: t.type === 'Menor' ? '#92400e' : '#0369a1' }}>
                                                        {t.type}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '8px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.78rem', color: '#475569', display: 'block', marginBottom: '2px' }}>Nombre Completo (como en pasaporte) *</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`Nombre completo Viajero ${idx + 1}`}
                                                            value={t.fullName}
                                                            onChange={(e) => handleTravelerChange(idx, 'fullName', e.target.value)}
                                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: errors[`traveler_${idx}`] ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                                        />
                                                        {errors[`traveler_${idx}`] && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors[`traveler_${idx}`]}</span>}
                                                    </div>

                                                    <div>
                                                        <label style={{ fontSize: '0.78rem', color: '#475569', display: 'block', marginBottom: '2px' }}>Edad / Rango</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ej. 28 años o fecha nac."
                                                            value={t.age}
                                                            onChange={(e) => handleTravelerChange(idx, 'age', e.target.value)}
                                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Notas especiales, alergias o requerimientos (opcional):</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej. Vegetariano, asistencia, etc."
                                                        value={t.dietNotes}
                                                        onChange={(e) => handleTravelerChange(idx, 'dietNotes', e.target.value)}
                                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', background: '#fff' }}
                                                    />
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
                                        Continuar al Pago del Anticipo →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 3: PAGO DE ANTICIPO ================= */}
                        {step === 3 && (
                            <form onSubmit={handleCheckoutSubmit}>
                                <div style={{ marginTop: '10px' }}>
                                    {/* Detailed Summary */}
                                    <div className="jtb-checkout-summary" style={{ marginBottom: '18px' }}>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Viaje & Modalidad:</span>
                                            <strong>Japón {season?.emoji} {season?.name} — {estilo}</strong>
                                        </div>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Comprador:</span>
                                            <span>{nombre} ({telefono})</span>
                                        </div>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Viajantes Registrados ({travelers.length}):</span>
                                            <span>{travelers.map(t => t.fullName || 'Viajero').join(', ')}</span>
                                        </div>
                                        <div className="jtb-checkout-summary-row">
                                            <span>Costo Total Estimado del Viaje:</span>
                                            <span>{formatPrice(totalPrice)} MXN</span>
                                        </div>
                                        <div className="jtb-checkout-summary-divider" />
                                        
                                        <div className="jtb-checkout-summary-row highlight">
                                            <span style={{ fontSize: '1rem', fontWeight: 800 }}>Monto de Anticipo de Apartado (Hoy):</span>
                                            <span style={{ color: 'var(--color-primary, #e11d48)', fontWeight: 900, fontSize: '1.25rem' }}>
                                                {formatPrice(depositAmount)} MXN
                                            </span>
                                        </div>
                                    </div>

                                    <div className="jtb-checkout-disclaimer" style={{ marginBottom: '16px', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
                                        🔒 <strong>Garantía de Lugar:</strong> Tu anticipo de <strong>{formatPrice(depositAmount)} MXN</strong> congela la tarifa y asegura los lugares de los {travelers.length} viajeros. El saldo restante se liquida en cómodas mensualidades.
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button type="submit" className="jtb-checkout-submit-btn" style={{ padding: '16px', fontSize: '1rem', fontWeight: 800 }}>
                                            💳 Pagar Anticipo de {formatPrice(depositAmount)} MXN en Línea
                                        </button>

                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                style={{ padding: '12px 18px', borderRadius: '100px', fontSize: '0.85rem', color: '#64748b', borderColor: '#cbd5e1' }}
                                                onClick={handlePrevStep}
                                            >
                                                ← Editar Viajeros
                                            </button>
                                            
                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline"
                                                style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '12px 16px', borderRadius: '100px', fontSize: '0.88rem', color: '#25D366', borderColor: '#25D366', fontWeight: 800 }}
                                            >
                                                💬 Apartar por WhatsApp
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
                        <h3>¡Lugar Apartado Exitosamente!</h3>
                        <p>Hola <strong>{nombre}</strong>, hemos registrado tu reserva correctamente para <strong>{travelers.length} viajero(s)</strong>.</p>
                        
                        <div className="jtb-success-ticket animate-slide-in">
                            <div className="ticket-line">
                                <span>Código de Reserva:</span>
                                <span>{resultData?.wixId || 'Registrado'}</span>
                            </div>
                            <div className="ticket-line">
                                <span>Anticipo Cobrado:</span>
                                <span>{formatPrice(resultData?.depositPaid || depositAmount)} MXN</span>
                            </div>
                            <div className="ticket-line">
                                <span>Estatus Cargo:</span>
                                <span className="status-badge">Aprobado</span>
                            </div>
                            <div className="ticket-line">
                                <span>Viajeros:</span>
                                <span className="status-highlight">{travelers.map(t => t.fullName).join(', ')}</span>
                            </div>
                        </div>

                        <p className="success-note">
                            Hemos enviado un recibo a tu correo <strong>{correo}</strong> con los detalles de tu anticipo.
                        </p>

                        <button className="jtb-success-close-btn" onClick={onClose}>
                            Volver al Constructor de Viaje
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
