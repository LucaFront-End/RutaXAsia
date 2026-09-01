import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuExternalLink, LuCopy, LuCheck, LuShieldCheck, LuX, LuSearch, LuMapPin, LuPhone, LuMail, LuGlobe } from 'react-icons/lu'
import './RntModal.css'

const RNT_NUMBER = '0409015ae266f'
const RFC_NUMBER = 'SARJ740301GS3'
const SECTUR_URL = 'https://rnt-consulta.sectur.gob.mx/'
const WHATSAPP_BASE = 'https://wa.me/525657929121?text='
const MAPS_URL = 'https://www.google.com/maps?q=19.4267,-99.1721'

export default function RntModal({ isOpen, onClose }) {
    const [copiedField, setCopiedField] = useState(null)

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleCopy = (text, fieldName) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldName)
            setTimeout(() => setCopiedField(null), 2200)
        }).catch(() => {})
    }

    return createPortal(
        <div className="rnt-modal-overlay" onClick={onClose}>
            <div className="rnt-modal-dialog" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="rnt-modal-header">
                    <div className="rnt-modal-header-title">
                        <div className="rnt-modal-sectur-icon">🏛️</div>
                        <div>
                            <div className="rnt-modal-badge">
                                <LuShieldCheck size={13} /> GOBIERNO DE MÉXICO · SECTUR
                            </div>
                            <h3>Registro Nacional de Turismo (RNT) · Datos Oficiales</h3>
                        </div>
                    </div>
                    <button type="button" className="rnt-modal-close" onClick={onClose} aria-label="Cerrar modal">
                        <LuX size={20} />
                    </button>
                </div>

                {/* Main Content Body */}
                <div className="rnt-sectur-body">
                    {/* Status Badge Strip */}
                    <div className="rnt-sectur-top-card">
                        <div className="rnt-sectur-status">
                            <span className="rnt-status-dot" />
                            <span>AGENCIA VIGENTE Y REGISTRADA EN EL CATÁLOGO FEDERAL DE SECTUR</span>
                        </div>

                        {/* Copyable Credentials Box */}
                        <div className="rnt-sectur-cred-grid">
                            <div className="rnt-sectur-cred-card">
                                <span className="rnt-cred-lbl">Número de Certificado / Folio RNT:</span>
                                <div className="rnt-cred-row">
                                    <code className="rnt-cred-code">{RNT_NUMBER}</code>
                                    <button
                                        type="button"
                                        className="rnt-cred-btn"
                                        onClick={() => handleCopy(RNT_NUMBER, 'rnt')}
                                        title="Copiar Folio RNT"
                                    >
                                        {copiedField === 'rnt' ? <><LuCheck size={13} /> ¡Copiado!</> : <><LuCopy size={13} /> Copiar</>}
                                    </button>
                                </div>
                            </div>

                            <div className="rnt-sectur-cred-card">
                                <span className="rnt-cred-lbl">Registro Federal de Contribuyentes (RFC):</span>
                                <div className="rnt-cred-row">
                                    <code className="rnt-cred-code">{RFC_NUMBER}</code>
                                    <button
                                        type="button"
                                        className="rnt-cred-btn"
                                        onClick={() => handleCopy(RFC_NUMBER, 'rfc')}
                                        title="Copiar RFC"
                                    >
                                        {copiedField === 'rfc' ? <><LuCheck size={13} /> ¡Copiado!</> : <><LuCopy size={13} /> Copiar</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Official Details List from SECTUR database */}
                        <div className="rnt-sectur-details-list">
                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Razón Social:</span>
                                <strong>JUAN AGUSTIN SANTIAGO RODRIGUEZ</strong>
                            </div>

                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Nombre Comercial:</span>
                                <strong>JUAN SANTIAGO MX VIAJES <span className="rnt-trade-tag">(RutaXAsia)</span></strong>
                            </div>

                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Tipo de PST:</span>
                                <span>Agencia de viajes</span>
                            </div>

                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Domicilio Oficial:</span>
                                <span>
                                    Río Lerma 232, Int. P23 A, Col. Cuauhtémoc, Alcaldía Cuauhtémoc, Ciudad de México, C.P. 06500
                                </span>
                            </div>

                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Teléfono de Registro:</span>
                                <a href="tel:5588527893" className="rnt-detail-link">
                                    <LuPhone size={13} /> 55 8852 7893 / 56 5792 9121
                                </a>
                            </div>

                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Correo Electrónico:</span>
                                <span className="rnt-detail-val">
                                    <LuMail size={13} /> jasr_74@hotmail.com
                                </span>
                            </div>
                        </div>

                        {/* Location Link Button */}
                        <div className="rnt-map-link-row">
                            <a
                                href={MAPS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rnt-map-btn"
                            >
                                <LuMapPin size={14} />
                                <span>Ver Ubicación Fiscal en Google Maps ↗</span>
                            </a>
                        </div>
                    </div>

                    {/* How to verify in SECTUR Portal */}
                    <div className="rnt-sectur-action-box">
                        <div className="rnt-action-header">
                            <h4>¿Cómo verificar en el buscador oficial del gobierno?</h4>
                            <p>Accede directamente al portal central de la Secretaría de Turismo federal:</p>
                        </div>

                        <div className="rnt-action-steps">
                            <div className="rnt-action-step">
                                <span className="rnt-step-circle">1</span>
                                <span>Copia el Folio <strong>{RNT_NUMBER}</strong> o RFC <strong>{RFC_NUMBER}</strong> con los botones de arriba.</span>
                            </div>
                            <div className="rnt-action-step">
                                <span className="rnt-step-circle">2</span>
                                <span>Ingresa al portal de SECTUR y pégalo en el buscador para corroborar la constancia emitida.</span>
                            </div>
                        </div>

                        <div className="rnt-action-buttons">
                            <a
                                href={SECTUR_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary rnt-btn-portal-launch"
                            >
                                <LuSearch size={17} />
                                <span>Abrir Buscador Oficial rnt-consulta.sectur.gob.mx ↗</span>
                            </a>

                            <a
                                href={`${WHATSAPP_BASE}SW-Hola%20quiero%20solicitar%20la%20constancia%20oficial%20del%20RNT%20en%20PDF`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline rnt-btn-whatsapp-pdf"
                            >
                                💬 Solicitar Constancia Oficial en PDF por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
