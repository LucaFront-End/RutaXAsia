import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitPopupToCMS } from '../../lib/wixClient'
import './DiscountPopup.css'

const ESTADOS_MEXICO = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
    "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
    "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
    "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
    "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
    "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
]

function DiscountPopup() {
    const [visible, setVisible] = useState(false)
    const [closing, setClosing] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const dismissed = sessionStorage.getItem('rutaxasia_popup_dismissed')
        if (dismissed) return

        const timer = setTimeout(() => setVisible(true), 5000)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setVisible(false)
            setClosing(false)
            sessionStorage.setItem('rutaxasia_popup_dismissed', '1')
        }, 300)
    }

    const [phoneVal, setPhoneVal] = useState('')
    const [phoneError, setPhoneError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const cleanPhone = phoneVal.replace(/\D/g, '')
        const isAllSameDigits = /^(\d)\1{9}$/.test(cleanPhone)

        if (!cleanPhone || cleanPhone.length !== 10) {
            setPhoneError('Introduce un número de 10 dígitos.')
            return
        }
        if (isAllSameDigits) {
            setPhoneError('Número inválido (dígitos iguales).')
            return
        }

        const data = {
            nombre: formData.get('nombre'),
            telefono: cleanPhone,
            correo: formData.get('email'),
            estado: formData.get('estado'),
            viajeDeInteres: 'Sakura Completo 2027',
        }

        setSubmitting(true)

        try {
            // 1) Save to Wix CMS
            const result = await submitPopupToCMS(data)
            console.log('[Popup] CMS submission result:', result)

            // 2) Send email via FormSubmit.co to reservas@rutaxasia.com
            await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    _subject: `🌸 Registro Pop-up Sakura 2027 — ${data.nombre}`,
                    _template: 'table',
                    _captcha: 'false',
                    _language: 'es',
                    'Nombre': data.nombre,
                    'Teléfono': data.telefono,
                    'Email': data.correo,
                    'Estado': data.estado,
                    'Viaje de Interés': data.viajeDeInteres,
                    'Fecha': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
                }),
            })

            setSubmitted(true)
            setTimeout(() => {
                handleClose()
                navigate('/viajes/japon/sakura')
            }, 1800)
        } catch (err) {
            console.error('Form submission error:', err)
            handleClose()
            navigate('/viajes/japon/sakura')
        } finally {
            setSubmitting(false)
        }
    }

    if (!visible) return null

    return (
        <div className={`popup-overlay${closing ? ' popup-overlay--closing' : ''}`} onClick={handleClose}>
            <div className={`popup${closing ? ' popup--closing' : ''}`} onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={handleClose} aria-label="Cerrar">&times;</button>
                <div className="popup-content">
                    <span className="popup-tag">🌸 Ya disponible</span>
                    <h2 className="popup-title">VIAJE COMPLETO <span>SAKURA 2027</span></h2>
                    <p className="popup-subtitle" style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '1.05rem', margin: '4px 0 10px' }}>
                        ¿Quieres vivir el Sakura 2027? 🌸
                    </p>
                    <p className="popup-text">
                        Obtén un bono de <strong>$14,000 MXN</strong> en nuestro viaje Sakura Completo.
                    </p>

                    {submitted ? (
                        <div className="popup-success">
                            <span style={{ fontSize: '2rem' }}>🎉</span>
                            <p>¡Promoción registrada! Redirigiendo a Sakura Completo...</p>
                        </div>
                    ) : (
                        <form className="popup-form" onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre completo" required disabled={submitting} />
                            <div>
                                <input
                                    type="tel"
                                    name="telefono"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="Teléfono WhatsApp (10 dígitos)"
                                    required
                                    disabled={submitting}
                                    value={phoneVal}
                                    onChange={(e) => {
                                        setPhoneVal(e.target.value.replace(/\D/g, '').slice(0, 10))
                                        setPhoneError('')
                                    }}
                                />
                                {phoneError && (
                                    <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'block', marginTop: '2px', textAlign: 'left', fontWeight: 600 }}>
                                        {phoneError}
                                    </span>
                                )}
                            </div>
                            <input type="email" name="email" placeholder="Correo electrónico" required disabled={submitting} />
                            <select name="estado" required disabled={submitting} defaultValue="">
                                <option value="" disabled>Estado de la República</option>
                                {ESTADOS_MEXICO.map(e => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                                {submitting ? 'Enviando...' : 'Quiero recibir la promoción'}
                            </button>
                        </form>
                    )}

                    <small className="popup-disclaimer">No aplica con otras promociones. Válido para Sakura 2027.</small>
                </div>
            </div>
        </div>
    )
}

export default DiscountPopup


