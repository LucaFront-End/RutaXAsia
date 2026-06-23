import { useState } from 'react'
import './StepStyles.css'

export default function CheckoutModal({ isOpen, onClose, season, estilo, totalPrice, desglose }) {
    if (!isOpen) return null

    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [telefono, setTelefono] = useState('')
    
    const [cardName, setCardName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [cardExpiry, setCardExpiry] = useState('')
    const [cardCvv, setCardCvv] = useState('')

    const [status, setStatus] = useState('checkout') // checkout, processing, success, error
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')
    const [resultData, setResultData] = useState(null)

    // Pricing details
    const depositAmount = 5000;
    const remainder = Math.max(0, totalPrice - depositAmount);
    const installmentsCount = 5;
    const monthlyInstallment = Math.round(remainder / installmentsCount);

    const formatPrice = (n) => `$${n.toLocaleString('es-MX')}`

    const handleInputChange = (field, value) => {
        setErrors(prev => ({ ...prev, [field]: '' }))
        if (field === 'nombre') setNombre(value)
        if (field === 'correo') setCorreo(value)
        if (field === 'telefono') setTelefono(value)
        if (field === 'cardName') setCardName(value)
        if (field === 'cardNumber') {
            // Format card number 0000 0000 0000 0000
            const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
            const matches = v.match(/\d{4,16}/g)
            const match = (matches && matches[0]) || ''
            const parts = []

            for (let i = 0, len = match.length; i < len; i += 4) {
                parts.push(match.substring(i, i + 4))
            }

            if (parts.length > 0) {
                setCardNumber(parts.join(' '))
            } else {
                setCardNumber(v.substring(0, 19))
            }
        }
        if (field === 'cardExpiry') {
            // Format MM/YY
            const v = value.replace(/[^0-9]/gi, '')
            if (v.length >= 2) {
                setCardExpiry(`${v.substring(0, 2)}/${v.substring(2, 4)}`)
            } else {
                setCardExpiry(v)
            }
        }
        if (field === 'cardCvv') {
            setCardCvv(value.replace(/[^0-9]/gi, '').substring(0, 4))
        }
    }

    const validate = () => {
        const errs = {}
        if (!nombre.trim()) errs.nombre = 'El nombre es obligatorio.'
        if (!correo.trim() || !/\S+@\S+\.\S+/.test(correo)) errs.correo = 'Introduce un correo válido.'
        if (!telefono.trim() || telefono.length < 10) errs.telefono = 'Introduce un teléfono de al menos 10 dígitos.'
        if (!cardName.trim()) errs.cardName = 'El nombre del titular es obligatorio.'
        
        const cleanCard = cardNumber.replace(/\s+/g, '')
        if (cleanCard.length < 15 || cleanCard.length > 16) errs.cardNumber = 'Número de tarjeta inválido.'
        
        if (!cardExpiry.includes('/') || cardExpiry.split('/')[0].length < 2 || cardExpiry.split('/')[1].length < 2) {
            errs.cardExpiry = 'Formato MM/YY requerido.'
        }
        if (cardCvv.length < 3) errs.cardCvv = 'CVV inválido.'

        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setStatus('processing')
        setApiError('')

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    correo,
                    telefono,
                    temporada: season.name,
                    estilo: estilo,
                    totalViaje: totalPrice,
                    desglose: desglose,
                    cardName,
                    paymentMethodId: 'pm_card_visa' // Mock payment method for test cards
                })
            })

            const result = await response.json()
            if (result.success) {
                setResultData(result)
                setStatus('success')
            } else {
                setApiError(result.error || 'Hubo un problema al procesar tu reserva.')
                setStatus('error')
            }
        } catch (err) {
            console.error('Checkout error:', err)
            setApiError('Error de red. Intenta de nuevo por favor.')
            setStatus('error')
        }
    }

    return (
        <div className="jtb-modal-overlay animate-slide-in">
            <div className="jtb-modal-card">
                <button className="jtb-modal-close" onClick={onClose}>&times;</button>
                
                {status === 'checkout' && (
                    <form onSubmit={handleCheckoutSubmit} className="jtb-checkout-form">
                        <div className="jtb-modal-header">
                            <h3>💳 Apartar Viaje — Japón a la Carta</h3>
                            <p>Reserva tu lugar de forma segura en segundos</p>
                        </div>

                        {/* Summary of what they pay */}
                        <div className="jtb-checkout-summary">
                            <div className="jtb-checkout-summary-row">
                                <span>Modalidad:</span>
                                <strong>Japón {season.emoji} {season.name} — {estilo}</strong>
                            </div>
                            <div className="jtb-checkout-summary-row">
                                <span>Costo Total:</span>
                                <span>{formatPrice(totalPrice)} MXN</span>
                            </div>
                            <div className="jtb-checkout-summary-divider" />
                            
                            <div className="jtb-checkout-summary-row highlight">
                                <span>Anticipo de Apartado (Hoy):</span>
                                <span>{formatPrice(depositAmount)} MXN</span>
                            </div>
                            <div className="jtb-checkout-summary-row installment">
                                <span>Plan Mensual Recurrente:</span>
                                <span>{installmentsCount} mensualidades de {formatPrice(monthlyInstallment)} MXN</span>
                            </div>
                        </div>

                        {/* Contact details */}
                        <div className="jtb-form-section">
                            <h4>📋 Información del Pasajero</h4>
                            <div className="jtb-input-group">
                                <label>Nombre Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Como aparece en tu pasaporte"
                                    value={nombre} 
                                    onChange={(e) => handleInputChange('nombre', e.target.value)} 
                                    className={errors.nombre ? 'input-error' : ''}
                                />
                                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                            </div>
                            <div className="jtb-input-row">
                                <div className="jtb-input-group">
                                    <label>Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        placeholder="correo@ejemplo.com"
                                        value={correo} 
                                        onChange={(e) => handleInputChange('correo', e.target.value)} 
                                        className={errors.correo ? 'input-error' : ''}
                                    />
                                    {errors.correo && <span className="error-text">{errors.correo}</span>}
                                </div>
                                <div className="jtb-input-group">
                                    <label>Teléfono (WhatsApp)</label>
                                    <input 
                                        type="tel" 
                                        placeholder="55 1234 5678"
                                        value={telefono} 
                                        onChange={(e) => handleInputChange('telefono', e.target.value)} 
                                        className={errors.telefono ? 'input-error' : ''}
                                    />
                                    {errors.telefono && <span className="error-text">{errors.telefono}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Card Details */}
                        <div className="jtb-form-section">
                            <h4>💳 Detalles de Pago (Conexión Encriptada Segura)</h4>
                            <div className="jtb-input-group">
                                <label>Titular de la Tarjeta</label>
                                <input 
                                    type="text" 
                                    placeholder="Nombre escrito en la tarjeta"
                                    value={cardName} 
                                    onChange={(e) => handleInputChange('cardName', e.target.value)} 
                                    className={errors.cardName ? 'input-error' : ''}
                                />
                                {errors.cardName && <span className="error-text">{errors.cardName}</span>}
                            </div>
                            <div className="jtb-input-group">
                                <label>Número de Tarjeta</label>
                                <input 
                                    type="text" 
                                    placeholder="4111 1111 1111 1111"
                                    value={cardNumber} 
                                    onChange={(e) => handleInputChange('cardNumber', e.target.value)} 
                                    className={errors.cardNumber ? 'input-error' : ''}
                                />
                                {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                            </div>
                            <div className="jtb-input-row">
                                <div className="jtb-input-group">
                                    <label>Vencimiento</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY"
                                        value={cardExpiry} 
                                        onChange={(e) => handleInputChange('cardExpiry', e.target.value)} 
                                        className={errors.cardExpiry ? 'input-error' : ''}
                                    />
                                    {errors.cardExpiry && <span className="error-text">{errors.cardExpiry}</span>}
                                </div>
                                <div className="jtb-input-group">
                                    <label>Cvv</label>
                                    <input 
                                        type="password" 
                                        placeholder="123"
                                        value={cardCvv} 
                                        onChange={(e) => handleInputChange('cardCvv', e.target.value)} 
                                        className={errors.cardCvv ? 'input-error' : ''}
                                    />
                                    {errors.cardCvv && <span className="error-text">{errors.cardCvv}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="jtb-checkout-disclaimer">
                            🔒 Tus datos de pago están encriptados y procesados de manera segura. Al reservar, aceptas los Términos y Condiciones de RutaXAsia.
                        </div>

                        <button type="submit" className="jtb-checkout-submit-btn">
                            Confirmar Apartado y Pagar {formatPrice(depositAmount)}
                        </button>
                    </form>
                )}

                {status === 'processing' && (
                    <div className="jtb-modal-status-view">
                        <div className="jtb-checkout-loader" />
                        <h3>Procesando Pago Seguro...</h3>
                        <p>Estamos registrando tu reservación en el CMS y configurando tu plan de facturación mensual. No cierres esta ventana.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="jtb-modal-status-view success">
                        <div className="jtb-success-checkmark">✓</div>
                        <h3>¡Lugar Apartado Exitosamente!</h3>
                        <p>Hola <strong>{nombre}</strong>, hemos registrado tu reserva correctamente.</p>
                        
                        <div className="jtb-success-ticket animate-slide-in">
                            <div className="ticket-line">
                                <span>ID Registro CMS:</span>
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
                                <span>Mensualidades:</span>
                                <span className="status-highlight">{resultData?.installments || installmentMessage}</span>
                            </div>
                        </div>

                        <p className="success-note">
                            Hemos enviado un recibo a tu correo <strong>{correo}</strong>. Cada mes recibirás de forma automática la factura correspondiente a tu mensualidad en tu correo.
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
                        <p>Por favor, verifica los datos de tu tarjeta bancaria e inténtalo de nuevo.</p>
                        
                        <button className="jtb-error-retry-btn" onClick={() => setStatus('checkout')}>
                            Reintentar Pago
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
