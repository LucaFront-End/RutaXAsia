import { useState } from 'react'
import { submitFormToCMS, submitPopupToCMS } from '../../lib/wixClient'
import './DownloadItineraryModal.css'

export default function DownloadItineraryModal({ isOpen, onClose, tour }) {
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        correo: '',
        ciudad: '',
    })

    const [phoneError, setPhoneError] = useState('')

    if (!isOpen || !tour) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'telefono') {
            const digits = value.replace(/\D/g, '').slice(0, 10)
            setFormData(prev => ({ ...prev, telefono: digits }))
            setPhoneError('')
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const cleanPhone = formData.telefono.replace(/\D/g, '')
        const isAllSameDigits = /^(\d)\1{9}$/.test(cleanPhone)
        if (!cleanPhone || cleanPhone.length !== 10) {
            setPhoneError('Introduce un número de teléfono de 10 dígitos.')
            return
        }
        if (isAllSameDigits) {
            setPhoneError('Número no válido (los dígitos no pueden ser todos iguales).')
            return
        }

        setSubmitting(true)

        const pdfUrl = tour.pdfUrl || '/pdf/itinerario-japon-octubre-2026.pdf'

        try {
            // 1. Save to CMS
            await submitFormToCMS({
                nombre: formData.nombre,
                telefono: formData.telefono,
                email: formData.correo,
                estado: formData.ciudad,
                viaje: tour.title,
                mensaje: `Solicitud de descarga de itinerario en PDF para el viaje ${tour.title}`,
                origen: 'Descarga PDF Modal',
            })
            await submitPopupToCMS({
                nombre: formData.nombre,
                telefono: formData.telefono,
                correo: formData.correo,
                estado: formData.ciudad,
                viajeDeInteres: tour.title,
                mensaje: `Descarga de itinerario PDF: ${tour.title}`,
            })

            // 2. Send email notification to reservas@rutaxasia.com
            await fetch('https://formsubmit.co/ajax/reservas@rutaxasia.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    _subject: `📥 Descarga de Itinerario PDF — ${tour.title} — ${formData.nombre}`,
                    _template: 'table',
                    _captcha: 'false',
                    _language: 'es',
                    'Viaje / Tour': tour.title,
                    'Fecha del viaje': tour.date,
                    'Nombre completo': formData.nombre,
                    'Teléfono / WhatsApp': formData.telefono,
                    'Correo electrónico': formData.correo,
                    'Ciudad / Estado': formData.ciudad,
                    'Fecha de descarga': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
                }),
            })

            setSubmitted(true)

            // Trigger instant PDF download / view in new tab
            const link = document.createElement('a')
            link.href = pdfUrl
            link.download = `${tour.title.toLowerCase().replace(/\s+/g, '-')}-itinerario.pdf`
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Error al registrar solicitud de PDF:', error)
            // Even if network fails, still trigger PDF download
            setSubmitted(true)
            window.open(pdfUrl, '_blank')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="pdf-modal-overlay" onClick={onClose}>
            <div className="pdf-modal-card" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="pdf-modal-close" onClick={onClose} aria-label="Cerrar">
                    ✕
                </button>

                {!submitted ? (
                    <>
                        <div className="pdf-modal-header">
                            <div className="pdf-modal-badge">
                                <span>📄 ITINERARIO COMPLETO</span>
                            </div>
                            <h3 className="pdf-modal-title">Descarga nuestro itinerario en PDF</h3>
                            <p className="pdf-modal-desc">
                                Conoce el día a día detallado, hospedajes, actividades y todo lo que incluye el viaje <strong>{tour.title}</strong>.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="pdf-modal-form">
                            <div className="pdf-form-group">
                                <label htmlFor="pdf-nombre">Nombre completo *</label>
                                <input
                                    id="pdf-nombre"
                                    name="nombre"
                                    type="text"
                                    placeholder="Ej. Juan Pérez"
                                    required
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="pdf-form-group">
                                <label htmlFor="pdf-telefono">Teléfono / WhatsApp *</label>
                                <input
                                    id="pdf-telefono"
                                    name="telefono"
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="10 dígitos (ej. 5512345678)"
                                    required
                                    value={formData.telefono}
                                    onChange={handleChange}
                                />
                                {phoneError && (
                                    <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                                        {phoneError}
                                    </span>
                                )}
                            </div>

                            <div className="pdf-form-group">
                                <label htmlFor="pdf-correo">Correo electrónico *</label>
                                <input
                                    id="pdf-correo"
                                    name="correo"
                                    type="email"
                                    placeholder="tu@correo.com"
                                    required
                                    value={formData.correo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="pdf-form-group">
                                <label htmlFor="pdf-ciudad">Ciudad / Estado *</label>
                                <input
                                    id="pdf-ciudad"
                                    name="ciudad"
                                    type="text"
                                    placeholder="Ej. CDMX, Guadalajara, Monterrey..."
                                    required
                                    value={formData.ciudad}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                className="pdf-modal-submit-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Generando descarga...' : '📥 Descargar Itinerario en PDF'}
                            </button>

                            <p className="pdf-modal-privacy">
                                🔒 Tus datos están 100% seguros. Te enviaremos información y actualizaciones de tu viaje sin spam.
                            </p>
                        </form>
                    </>
                ) : (
                    <div className="pdf-modal-success">
                        <div className="pdf-success-icon">✨</div>
                        <h3>¡Itinerario listo!</h3>
                        <p>
                            La descarga de tu itinerario de <strong>{tour.title}</strong> ha comenzado. También hemos enviado una copia a <strong>{formData.correo}</strong>.
                        </p>
                        <a
                            href={tour.pdfUrl || '/pdf/itinerario-japon-octubre-2026.pdf'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-modal-submit-btn"
                            style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', marginTop: '15px' }}
                        >
                            📄 Abrir PDF de nuevo
                        </a>
                        <button
                            type="button"
                            className="pdf-modal-secondary-btn"
                            onClick={onClose}
                            style={{ marginTop: '10px' }}
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
