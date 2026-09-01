import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuExternalLink, LuCopy, LuCheck, LuShieldCheck, LuX, LuSearch, LuMapPin, LuBuilding2 } from 'react-icons/lu'
import './RntModal.css'

const RNT_NUMBER = '0409015ae266f'
const RFC_NUMBER = 'SARJ740301GS3'
const SECTUR_URL = 'https://rnt-consulta.sectur.gob.mx/'
const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

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
                            <h3>Consulta de Registro Nacional de Turismo (RNT)</h3>
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
                                <span className="rnt-cred-lbl">Número de Folio RNT:</span>
                                <div className="rnt-cred-row">
                                    <code className="rnt-cred-code">{RNT_NUMBER}</code>
                                    <button
                                        type="button"
                                        className="rnt-cred-btn"
                                        onClick={() => handleCopy(RNT_NUMBER, 'rnt')}
                                    >
                                        {copiedField === 'rnt' ? <><LuCheck size={13} /> ¡Copiado!</> : <><LuCopy size={13} /> Copiar</>}
                                    </button>
                                </div>
                            </div>

                            <div className="rnt-sectur-cred-card">
                                <span className="rnt-cred-lbl">RFC Registrado ante SAT:</span>
                                <div className="rnt-cred-row">
                                    <code className="rnt-cred-code">{RFC_NUMBER}</code>
                                    <button
                                        type="button"
                                        className="rnt-cred-btn"
                                        onClick={() => handleCopy(RFC_NUMBER, 'rfc')}
                                    >
                                        {copiedField === 'rfc' ? <><LuCheck size={13} /> ¡Copiado!</> : <><LuCopy size={13} /> Copiar</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Company Details Row */}
                        <div className="rnt-sectur-details-list">
                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Prestador de Servicios:</span>
                                <strong>Juan Alejandro Salazar Rodriguez</strong>
                            </div>
                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Nombre Comercial:</span>
                                <strong>RutaXAsia / Juan Santiago MX Viajes</strong>
                            </div>
                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Tipo de Servicio:</span>
                                <span>Agencia de Viajes y Operadora Turística</span>
                            </div>
                            <div className="rnt-detail-item">
                                <span className="rnt-detail-lbl">Domicilio Fiscal:</span>
                                <span><LuMapPin size={13} /> Río Lerma 232, Piso 23 (Torre Diana), Cuauhtémoc, CDMX</span>
                            </div>
                        </div>
                    </div>

                    {/* How to verify in SECTUR Portal */}
                    <div className="rnt-sectur-action-box">
                        <div className="rnt-action-header">
                            <h4>¿Cómo verificar directamente en el portal del gobierno?</h4>
                            <p>Accede al buscador oficial de la Secretaría de Turismo federal:</p>
                        </div>

                        <div className="rnt-action-steps">
                            <div className="rnt-action-step">
                                <span className="rnt-step-circle">1</span>
                                <span>Copia el Folio <strong>{RNT_NUMBER}</strong> con el botón superior.</span>
                            </div>
                            <div className="rnt-action-step">
                                <span className="rnt-step-circle">2</span>
                                <span>Abre el buscador federal y pégalo para corroborar la constancia oficial emitida.</span>
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
