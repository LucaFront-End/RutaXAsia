import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuExternalLink, LuCopy, LuCheck, LuShieldCheck, LuBuilding2, LuX } from 'react-icons/lu'
import './RntModal.css'

const RNT_NUMBER = '0409015ae266f'
const RFC_NUMBER = 'SARJ740301GS3'
const SECTUR_URL = 'https://rnt-consulta.sectur.gob.mx/'

export default function RntModal({ isOpen, onClose }) {
    const [copiedField, setCopiedField] = useState(null)
    const [iframeLoaded, setIframeLoaded] = useState(false)

    // Listen for custom global event to open from anywhere (e.g. Footer)
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
            setTimeout(() => setCopiedField(null), 2500)
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
                                <LuShieldCheck size={13} /> CERTIFICACIÓN OFICIAL SECTUR
                            </div>
                            <h3>Consulta de Registro Nacional de Turismo (RNT)</h3>
                        </div>
                    </div>
                    <button type="button" className="rnt-modal-close" onClick={onClose} aria-label="Cerrar modal">
                        <LuX size={20} />
                    </button>
                </div>

                {/* Data Copy Strip */}
                <div className="rnt-modal-info-strip">
                    <div className="rnt-modal-data-box">
                        <span className="rnt-modal-data-label">Número de Folio RNT:</span>
                        <div className="rnt-modal-data-val-row">
                            <code className="rnt-modal-code">{RNT_NUMBER}</code>
                            <button
                                type="button"
                                className="rnt-copy-btn"
                                onClick={() => handleCopy(RNT_NUMBER, 'rnt')}
                                title="Copiar folio RNT"
                            >
                                {copiedField === 'rnt' ? <><LuCheck size={14} /> ¡Copiado!</> : <><LuCopy size={14} /> Copiar</>}
                            </button>
                        </div>
                    </div>

                    <div className="rnt-modal-data-box">
                        <span className="rnt-modal-data-label">RFC Registrado ante SAT:</span>
                        <div className="rnt-modal-data-val-row">
                            <code className="rnt-modal-code">{RFC_NUMBER}</code>
                            <button
                                type="button"
                                className="rnt-copy-btn"
                                onClick={() => handleCopy(RFC_NUMBER, 'rfc')}
                                title="Copiar RFC"
                            >
                                {copiedField === 'rfc' ? <><LuCheck size={14} /> ¡Copiado!</> : <><LuCopy size={14} /> Copiar</>}
                            </button>
                        </div>
                    </div>

                    <div className="rnt-modal-direct-btn-box">
                        <a
                            href={SECTUR_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary rnt-external-btn"
                        >
                            <span>Abrir Portal SECTUR</span>
                            <LuExternalLink size={15} />
                        </a>
                    </div>
                </div>

                {/* Embedded Viewer Iframe */}
                <div className="rnt-iframe-wrapper">
                    {!iframeLoaded && (
                        <div className="rnt-iframe-loading">
                            <div className="rnt-spinner" />
                            <p>Cargando portal oficial de consulta del Registro Nacional de Turismo (SECTUR)...</p>
                        </div>
                    )}
                    <iframe
                        src={SECTUR_URL}
                        title="Consulta Registro Nacional de Turismo SECTUR México"
                        className={`rnt-iframe ${iframeLoaded ? 'rnt-iframe--loaded' : ''}`}
                        onLoad={() => setIframeLoaded(true)}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                </div>

                {/* Footer Notice */}
                <div className="rnt-modal-footer">
                    <p>
                        💡 <strong>Instrucciones:</strong> En el portal oficial de SECTUR, ingresa nuestro número de folio <code>{RNT_NUMBER}</code> o RFC <code>{RFC_NUMBER}</code> para verificar los datos de alta, vigencia y legalidad como Agencia de Viajes.
                    </p>
                </div>
            </div>
        </div>,
        document.body
    )
}
