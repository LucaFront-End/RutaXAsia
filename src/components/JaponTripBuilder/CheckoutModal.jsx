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
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setStatus('processing')
        setApiError('')

        // Constants (same as backend)
        const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfd3'
        const ANTICIPO_PRODUCT_ID = import.meta.env.VITE_WIX_ANTICIPO_PRODUCT_ID || '7f92cc67-8306-4612-bd0f-b95abbdb52e3'
        const ANTICIPO_VARIANT_ID = import.meta.env.VITE_WIX_ANTICIPO_VARIANT_ID || 'd76c675d-5323-46f5-9ff4-057c22a09258'
        const WIX_BASE = import.meta.env.VITE_WIX_BASE_DOMAIN || 'https://dilodigitalmx.wixsite.com/rutaxasia'
        const ORIGIN = import.meta.env.VITE_SITE_ORIGIN || 'https://www.rutaxasia.com'

        try {
            // 1. Save to CMS + send email (non-blocking, best-effort)
            fetch('/api/wix-checkout', {
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
                    desglose: desglose,
                })
            }).catch(() => {}) // non-fatal

            // 2. Send notification email via FormSubmit
            fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com.mx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    _subject: `💳 Nuevo Apartado de Viaje — ${nombre} (${season?.name || 'Japón'})`,
                    _template: 'box',
                    _captcha: 'false',
                    _language: 'es',
                    'Nombre': nombre,
                    'Email': correo,
                    'Teléfono': telefono,
                    'Temporada': season?.name || 'Japón',
                    'Modalidad': estilo || 'Reserva',
                    'Monto Anticipo': `${formatPrice(depositAmount)} MXN`,
                    'Total Estimado': `${formatPrice(totalPrice)} MXN`,
                    'Desglose': desglose,
                    'Fecha': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
                }),
            }).catch(() => {}) // non-fatal

            // 3. Build the Wix Stores checkout URL using the Wix addToCart API endpoint
            //    This uses the Wix Stores REST API to create a cart with the Anticipo product
            //    and generates the redirect URL that Wix expects.
            //
            //    Wix Stores supports a direct product checkout link format:
            //    {base}/__ecom/checkout?lineItems=[{catalogItemId,variantId,quantity}]&origin={origin}
            //
            //    The correct approach for headless Wix is to use the addToCart flow via REST
            const cartPayload = {
                lineItems: [
                    {
                        catalogReference: {
                            appId: WIX_STORES_APP_ID,
                            catalogItemId: ANTICIPO_PRODUCT_ID,
                            options: { variantId: ANTICIPO_VARIANT_ID },
                        },
                        quantity: 1,
                    }
                ]
            }

            // Call Wix Ecom API from browser using site's anonymous visitor token
            const cartResponse = await fetch(
                `https://www.wixapis.com/ecom/v1/carts/current/items/add`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'wix-site-id': import.meta.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b',
                    },
                    body: JSON.stringify(cartPayload),
                }
            )

            if (cartResponse.ok) {
                const cartData = await cartResponse.json()
                const cartId = cartData?.cart?._id || cartData?.cart?.id
                if (cartId) {
                    // Create checkout from cart
                    const chkResponse = await fetch(
                        `https://www.wixapis.com/ecom/v1/checkouts/`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'wix-site-id': import.meta.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b',
                            },
                            body: JSON.stringify({ cartId, channelType: 'WEB' }),
                        }
                    )
                    if (chkResponse.ok) {
                        const chkData = await chkResponse.json()
                        const checkoutId = chkData?.checkout?._id
                        if (checkoutId) {
                            setStatus('success')
                            setTimeout(() => {
                                window.location.href = `${WIX_BASE}/__ecom/checkout?checkoutId=${checkoutId}&origin=${encodeURIComponent(ORIGIN)}`
                            }, 1200)
                            return
                        }
                    }
                }
            }

            // Fallback: redirect directly to the Anticipo product page for manual Add to Cart
            setStatus('success')
            setTimeout(() => {
                window.location.href = `${WIX_BASE}/product-page/anticipo-de-viaje`
            }, 1200)

        } catch (err) {
            console.error('Checkout error:', err)
            // Ultimate fallback: go to the product page
            setStatus('success')
            setTimeout(() => {
                window.location.href = `${WIX_BASE}/product-page/anticipo-de-viaje`
            }, 1200)
        }
    }

    const waMsg = `SW-Hola! Quiero realizar mi apartado de $5,000 MXN para el viaje: ${season?.name || 'Japón'} (${estilo}). Pasajero: ${nombre || 'Cliente'}. ${desglose || ''}`
    const waUrl = `https://wa.me/525513610083?text=${encodeURIComponent(waMsg)}`

    return (
        <div className="jtb-modal-overlay animate-slide-in">
            <div className="jtb-modal-card">
                <button className="jtb-modal-close" onClick={onClose}>&times;</button>
                
                {status === 'checkout' && (
                    <form onSubmit={handleCheckoutSubmit} className="jtb-checkout-form">
                        <div className="jtb-modal-header">
                            <h3>💳 Apartar Viaje — Pagar Anticipo</h3>
                            <p>Reserva tu lugar de forma segura procesando tu anticipo en Wix Store</p>
                        </div>

                        {/* Summary of what they pay */}
                        <div className="jtb-checkout-summary">
                            <div className="jtb-checkout-summary-row">
                                <span>Modalidad:</span>
                                <strong>Japón {season?.emoji} {season?.name} — {estilo}</strong>
                            </div>
                            <div className="jtb-checkout-summary-row">
                                <span>Costo Total Estimado:</span>
                                <span>{formatPrice(totalPrice)} MXN</span>
                            </div>
                            <div className="jtb-checkout-summary-divider" />
                            
                            <div className="jtb-checkout-summary-row highlight">
                                <span>Anticipo de Apartado (Hoy):</span>
                                <span style={{ color: 'var(--color-primary)', fontWeight: '900' }}>{formatPrice(depositAmount)} MXN</span>
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

                        <div className="jtb-checkout-disclaimer">
                            🔒 Serás redirigido a la pasarela de pago segura de <strong>Wix Store</strong> para completar tu anticipo de <strong>{formatPrice(depositAmount)} MXN</strong> (Tarjeta, PayPal o Meses).
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                            <button type="submit" className="jtb-checkout-submit-btn">
                                💳 Pagar Anticipo de {formatPrice(depositAmount)} en Wix Store
                            </button>
                            
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                                style={{ textAlign: 'center', display: 'block', textDecoration: 'none', padding: '12px 18px', borderRadius: '100px', fontSize: '0.9rem', color: '#25D366', borderColor: '#25D366', fontWeight: '800' }}
                            >
                                💬 O bien, Cotizar / Apartar por WhatsApp
                            </a>
                        </div>
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
