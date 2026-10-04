import React from 'react'
import { createPortal } from 'react-dom'
import './TourDateRestrictionModal.css'

export default function TourDateRestrictionModal({ restrictionData, onClose }) {
    if (!restrictionData) return null

    const handleClose = () => {
        if (typeof onClose === 'function') {
            onClose()
        }
    }

    return createPortal(
        <div
            className="trip-restriction-overlay"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="trip-restriction-modal" onClick={e => e.stopPropagation()}>
                <button
                    type="button"
                    className="restriction-close-btn"
                    onClick={handleClose}
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                <div className="restriction-icon-wrap">
                    <span className="restriction-icon">⏳</span>
                </div>

                <div className="restriction-badge">
                    {restrictionData.seasonEmoji || '🏮'} {restrictionData.tourTitle || restrictionData.experienceName || 'Tours de RutaXAsia'}
                </div>

                <h3 className="restriction-title">{restrictionData.title || 'Se requieren 15 días de colchón de anticipación'}</h3>

                {restrictionData.formattedDate && (
                    <div className="restriction-date-box">
                        <div className="restriction-date-label">Fecha que seleccionaste:</div>
                        <div className="restriction-date-val">📅 {restrictionData.formattedDate}</div>
                    </div>
                )}

                <p className="restriction-desc">
                    {restrictionData.message || 'Para comprar o reservar tours de RutaXAsia solicitamos al menos 15 días de colchón de anticipación para coordinar accesos, traslados y guías locales.'}
                </p>
                <p className="restriction-cta-desc">
                    {restrictionData.ctaMessage || 'Para realizar este tour en una fecha próxima, por favor escríbenos directamente a WhatsApp y nuestro equipo verificará opciones de último momento para confirmar tu lugar.'}
                </p>

                <div className="restriction-actions">
                    <a
                        href={restrictionData.whatsappUrl || 'https://wa.me/525657929121'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn restriction-wa-btn"
                    >
                        💬 Enviar mensaje a WhatsApp para ver opciones →
                    </a>
                    <button
                        type="button"
                        className="btn restriction-back-btn"
                        onClick={handleClose}
                    >
                        Elegir otra fecha disponible
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
