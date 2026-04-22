import { useState, useEffect } from 'react'
import { submitPopupToCMS } from '../../lib/wixClient'
import './DiscountPopup.css'

const ESTADOS_MEXICO = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
    "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
    "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
    "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
    "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
    "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const VIAJES_OPTIONS = [
    'Sakura 2026',
    'Corea Junio 2026',
    'Verano Japón 2026',
    'Corea Septiembre 2026',
    'Japón Octubre 2026',
    'Japón y Corea Octubre 2026',
    'Otoño Japón 2026',
    'Otro / No sé todavía',
]

function DiscountPopup() {
    const [visible, setVisible] = useState(false)
    const [closing, setClosing] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = {
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono'),
            correo: formData.get('email'),
            estado: formData.get('estado'),
            viajeDeInteres: formData.get('viaje'),
        }

        setSubmitting(true)

        try {
            await submitPopupToCMS(data)
            setSubmitted(true)
            setTimeout(() => handleClose(), 2500)
        } catch (err) {
            console.error('Form submission error:', err)
            handleClose()
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
                    <span className="popup-tag">🎌 Oferta Exclusiva</span>
                    <h2 className="popup-title">Obtén un <span>10% de Descuento</span></h2>
                    <p className="popup-text">Válido en tu primer viaje con nosotros. Regístrate y recibe tu código exclusivo.</p>

                    {submitted ? (
                        <div className="popup-success">
                            <span style={{ fontSize: '2rem' }}>🎉</span>
                            <p>¡Registrado! Revisa tu correo para tu código.</p>
                        </div>
                    ) : (
                        <form className="popup-form" onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre completo" required disabled={submitting} />
                            <input type="tel" name="telefono" placeholder="WhatsApp / Teléfono" required disabled={submitting} />
                            <input type="email" name="email" placeholder="Correo electrónico" required disabled={submitting} />
                            <select name="estado" required disabled={submitting} defaultValue="">
                                <option value="" disabled>Estado de la República</option>
                                {ESTADOS_MEXICO.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                            <select name="viaje" required disabled={submitting} defaultValue="">
                                <option value="" disabled>Viaje de interés</option>
                                {VIAJES_OPTIONS.map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                                {submitting ? 'Enviando...' : '¡Quiero mi descuento!'}
                            </button>
                        </form>
                    )}

                    <small className="popup-disclaimer">No aplica con otras promociones.</small>
                </div>
            </div>
        </div>
    )
}

export default DiscountPopup
