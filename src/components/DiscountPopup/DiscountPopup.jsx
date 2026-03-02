import { useState, useEffect } from 'react'
import './DiscountPopup.css'

function DiscountPopup() {
    const [visible, setVisible] = useState(false)
    const [closing, setClosing] = useState(false)

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

    const handleSubmit = (e) => {
        e.preventDefault()
        handleClose()
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
                    <form className="popup-form" onSubmit={handleSubmit}>
                        <input type="text" placeholder="Tu nombre" required />
                        <input type="email" placeholder="tu@email.com" required />
                        <button type="submit" className="btn btn-primary btn-full">¡Quiero mi descuento!</button>
                    </form>
                    <small className="popup-disclaimer">No aplica con otras promociones.</small>
                </div>
            </div>
        </div>
    )
}

export default DiscountPopup
