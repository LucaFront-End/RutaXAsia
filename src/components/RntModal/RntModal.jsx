import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuExternalLink, LuCopy, LuCheck, LuShieldCheck, LuBuilding2, LuX, LuFileText, LuGlobe, LuCircleAlert, LuMapPin } from 'react-icons/lu'
import './RntModal.css'

const RNT_NUMBER = '0409015ae266f'
const RFC_NUMBER = 'SARJ740301GS3'
const SECTUR_URL = 'https://rnt-consulta.sectur.gob.mx/'
const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

export default function RntModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('cedula') // 'cedula' | 'web'
    const [copiedField, setCopiedField] = useState(null)
    const [iframeLoaded, setIframeLoaded] = useState(false)
    const [iframeTimeout, setIframeTimeout] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    useEffect(() => {
        if (activeTab === 'web' && !iframeLoaded) {
            const timer = setTimeout(() => {
                setIframeTimeout(true)
            }, 8000)
            return () => clearTimeout(timer)
        }
    }, [activeTab, iframeLoaded])

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
                                <LuShieldCheck size={13} /> CERTIFICACIÓN SECTUR GOBIERNO DE MÉXICO
                            </div>
                            <h3>Registro Nacional de Turismo (RNT)</h3>
                        </div>
                    </div>
                    <button type="button" className="rnt-modal-close" onClick={onClose} aria-label="Cerrar modal">
                        <LuX size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="rnt-modal-tabs">
                    <button
                        type="button"
                        className={`rnt-modal-tab-btn ${activeTab === 'cedula' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cedula')}
                    >
                        <LuFileText size={15} />
                        <span>Cédula Oficial Digital</span>
                        <span className="rnt-tab-pill-success">Verificada ✓</span>
                    </button>
                    <button
                        type="button"
                        className={`rnt-modal-tab-btn ${activeTab === 'web' ? 'active' : ''}`}
                        onClick={() => setActiveTab('web')}
                    >
                        <LuGlobe size={15} />
                        <span>Portal Web SECTUR</span>
                    </button>
                </div>

                {/* TAB 1: CÉDULA OFICIAL DIGITAL (100% DISPONIBLE Y RÁPIDA) */}
                {activeTab === 'cedula' && (
                    <div className="rnt-cedula-container">
                        <div className="rnt-cedula-sheet">
                            {/* Sheet Top Banner */}
                            <div className="rnt-cedula-top-banner">
                                <div className="rnt-cedula-gov-logo">
                                    <span className="rnt-gov-flag">🇲🇽</span>
                                    <div>
                                        <span className="rnt-gov-text-1">GOBIERNO DE MÉXICO</span>
                                        <span className="rnt-gov-text-2">SECRETARÍA DE TURISMO (SECTUR)</span>
                                    </div>
                                </div>
                                <div className="rnt-cedula-status-badge">
                                    <span className="rnt-status-dot" />
                                    <span>REGISTRO VIGENTE Y ACTIVO</span>
                                </div>
                            </div>

                            {/* Main Title of the Certificate */}
                            <div className="rnt-cedula-main-title">
                                <h4>CONSTANCIA DE INSCRIPCIÓN EN EL CATÁLOGO PÚBLICO</h4>
                                <p>Prestador de Servicios Turísticos Legalmente Autorizado</p>
                            </div>

                            {/* Credentials Grid */}
                            <div className="rnt-cedula-grid">
                                <div className="rnt-cedula-field rnt-cedula-field--highlight">
                                    <span className="rnt-field-lbl">Número de Folio RNT:</span>
                                    <div className="rnt-field-val-row">
                                        <code className="rnt-field-code">{RNT_NUMBER}</code>
                                        <button
                                            type="button"
                                            className="rnt-sheet-copy-btn"
                                            onClick={() => handleCopy(RNT_NUMBER, 'rnt')}
                                        >
                                            {copiedField === 'rnt' ? <><LuCheck size={13} /> ¡Copiado!</> : <><LuCopy size={13} /> Copiar</>}
                                        </button>
                                    </div>
                                </div>

                                <div className="rnt-cedula-field rnt-cedula-field--highlight">
                                    <span className="rnt-field-lbl">Registro Federal de Contribuyentes (RFC):</span>
                                    <div className="rnt-field-val-row">
                                        <code className="rnt-field-code">{RFC_NUMBER}</code>
                                        <button
                                            type="button"
                                            className="rnt-sheet-copy-btn"
                                            onClick={() => handleCopy(RFC_NUMBER, 'rfc')}
                                        >
                                            {copiedField === 'rfc' ? <><LuCheck size={13} /> ¡Copiado!</> : <><LuCopy size={13} /> Copiar</>}
                                        </button>
                                    </div>
                                </div>

                                <div className="rnt-cedula-field">
                                    <span className="rnt-field-lbl">Titular / Razón Registrada:</span>
                                    <strong className="rnt-field-val">Juan Alejandro Salazar Rodriguez</strong>
                                </div>

                                <div className="rnt-cedula-field">
                                    <span className="rnt-field-lbl">Nombre Comercial:</span>
                                    <strong className="rnt-field-val">RutaXAsia / Juan Santiago MX Viajes</strong>
                                </div>

                                <div className="rnt-cedula-field">
                                    <span className="rnt-field-lbl">Giro / Tipo de Prestador:</span>
                                    <span className="rnt-field-val">Agencia de Viajes y Operadora Turística</span>
                                </div>

                                <div className="rnt-cedula-field">
                                    <span className="rnt-field-lbl">Oficina Matriz Registrada:</span>
                                    <span className="rnt-field-val">
                                        <LuMapPin size={13} /> Río Lerma 232, Piso 23 (Torre Diana), Cuauhtémoc, CDMX, C.P. 06500
                                    </span>
                                </div>
                            </div>

                            {/* Legal Guarantees Banner */}
                            <div className="rnt-cedula-guarantees">
                                <div className="rnt-guarantee-badge">
                                    <LuShieldCheck size={16} />
                                    <span>Contrato Mercantil & Facturación Fiscal (CFDI 4.0)</span>
                                </div>
                                <div className="rnt-guarantee-badge">
                                    <LuShieldCheck size={16} />
                                    <span>Seguro de Asistencia Médica Internacional 24/7 Incluido</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="rnt-cedula-actions">
                            <a
                                href={`${WHATSAPP_BASE}SW-Hola%20quiero%20solicitar%20la%20constancia%20oficial%20del%20RNT%20en%20PDF`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary rnt-action-cta"
                            >
                                💬 Solicitar Constancia Oficial en PDF por WhatsApp
                            </a>

                            <button
                                type="button"
                                className="btn btn-outline rnt-action-secondary"
                                onClick={() => setActiveTab('web')}
                            >
                                <LuGlobe size={15} />
                                <span>Ver Portal Federal SECTUR</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: PORTAL FEDERAL SECTUR */}
                {activeTab === 'web' && (
                    <div className="rnt-web-tab-container">
                        {/* Notice Strip */}
                        <div className="rnt-web-notice">
                            <LuCircleAlert size={18} className="rnt-notice-icon" />
                            <div>
                                <p>
                                    <strong>Aviso sobre el servidor gubernamental:</strong> El portal de consulta federal de SECTUR (<code>rnt-consulta.sectur.gob.mx</code>) suele presentar tiempos de carga lentos o bloqueos de conexión externa. Si no carga el visor abajo, utiliza el botón directo o consulta la <strong>Cédula Oficial Digital</strong> en la primera pestaña.
                                </p>
                            </div>
                            <a
                                href={SECTUR_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary rnt-external-direct-btn"
                            >
                                <span>Abrir en SECTUR ↗</span>
                            </a>
                        </div>

                        {/* Embedded Iframe with fallback */}
                        <div className="rnt-iframe-wrapper">
                            {!iframeLoaded && !iframeTimeout && (
                                <div className="rnt-iframe-loading">
                                    <div className="rnt-spinner" />
                                    <p>Conectando con el servidor central de SECTUR...</p>
                                </div>
                            )}

                            {iframeTimeout && !iframeLoaded && (
                                <div className="rnt-iframe-timeout-fallback">
                                    <div className="rnt-timeout-icon">⏳</div>
                                    <h4>El servidor de SECTUR tardó en responder</h4>
                                    <p>
                                        Los servidores del Gobierno de México pueden demorar o restringir la visualización dentro de otras páginas.
                                    </p>
                                    <div className="rnt-timeout-btns">
                                        <a
                                            href={SECTUR_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                        >
                                            <LuExternalLink size={15} />
                                            <span>Abrir {SECTUR_URL} en Pestaña Nueva</span>
                                        </a>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={() => setActiveTab('cedula')}
                                        >
                                            <LuFileText size={15} />
                                            <span>Regresar a la Cédula Digital</span>
                                        </button>
                                    </div>
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
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
