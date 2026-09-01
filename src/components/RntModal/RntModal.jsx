import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuExternalLink, LuCopy, LuCheck, LuShieldCheck, LuBuilding2, LuX, LuFileText, LuGlobe, LuCircleAlert, LuMapPin, LuSearch, LuArrowRight } from 'react-icons/lu'
import './RntModal.css'

const RNT_NUMBER = '0409015ae266f'
const RFC_NUMBER = 'SARJ740301GS3'
const SECTUR_URL = 'https://rnt-consulta.sectur.gob.mx/'
const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

export default function RntModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('cedula') // 'cedula' | 'portal'
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
                        className={`rnt-modal-tab-btn ${activeTab === 'portal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('portal')}
                    >
                        <LuGlobe size={15} />
                        <span>Consultar en Portal Federal SECTUR</span>
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
                                onClick={() => setActiveTab('portal')}
                            >
                                <LuGlobe size={15} />
                                <span>Ver Cómo Consultar en SECTUR</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: CONSULTA EN PORTAL FEDERAL SECTUR (GUÍA Y ENLACE DIRECTO) */}
                {activeTab === 'portal' && (
                    <div className="rnt-portal-guide-container">
                        <div className="rnt-portal-guide-card">
                            <div className="rnt-portal-guide-header">
                                <div className="rnt-portal-icon-box">🏛️</div>
                                <div>
                                    <h4>Buscador de Prestadores de Servicios Turísticos</h4>
                                    <p>Secretaría de Turismo del Gobierno Federal (SECTUR)</p>
                                </div>
                            </div>

                            <div className="rnt-portal-security-notice">
                                <LuShieldCheck size={18} className="rnt-sec-icon" />
                                <p>
                                    <strong>Aviso de Seguridad Web:</strong> Por normatividad del Gobierno de México (política <code>X-Frame-Options</code>), los buscadores federales no permiten ser incrustados en marcos internos. Para verificar nuestra alta oficial, haz clic en el botón inferior para abrir el portal directamente.
                                </p>
                            </div>

                            {/* Steps to verify */}
                            <div className="rnt-portal-steps">
                                <div className="rnt-portal-step-item">
                                    <span className="rnt-portal-step-badge">Paso 1</span>
                                    <div className="rnt-portal-step-body">
                                        <strong>Copia nuestro Folio o RFC oficial:</strong>
                                        <div className="rnt-portal-copy-row">
                                            <div className="rnt-portal-copy-pill">
                                                <span>Folio RNT: <code>{RNT_NUMBER}</code></span>
                                                <button
                                                    type="button"
                                                    className="rnt-mini-copy"
                                                    onClick={() => handleCopy(RNT_NUMBER, 'rnt-p')}
                                                >
                                                    {copiedField === 'rnt-p' ? <><LuCheck size={12} /> Copiado</> : <><LuCopy size={12} /> Copiar</>}
                                                </button>
                                            </div>
                                            <div className="rnt-portal-copy-pill">
                                                <span>RFC: <code>{RFC_NUMBER}</code></span>
                                                <button
                                                    type="button"
                                                    className="rnt-mini-copy"
                                                    onClick={() => handleCopy(RFC_NUMBER, 'rfc-p')}
                                                >
                                                    {copiedField === 'rfc-p' ? <><LuCheck size={12} /> Copiado</> : <><LuCopy size={12} /> Copiar</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rnt-portal-step-item">
                                    <span className="rnt-portal-step-badge">Paso 2</span>
                                    <div className="rnt-portal-step-body">
                                        <strong>Ingresa al Portal Oficial de SECTUR:</strong>
                                        <p>Pega el Folio o RFC en el buscador para consultar la constancia pública de legalidad.</p>
                                        <a
                                            href={SECTUR_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary rnt-portal-main-cta"
                                        >
                                            <LuSearch size={16} />
                                            <span>Abrir Buscador Oficial rnt-consulta.sectur.gob.mx ↗</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Return to Cedula */}
                        <div className="rnt-portal-footer-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setActiveTab('cedula')}
                            >
                                <LuFileText size={15} />
                                <span>Regresar a la Cédula Digital Verificada</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
