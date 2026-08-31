import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { LuShieldCheck, LuFileCheck, LuCircleCheck, LuBuilding2, LuCreditCard, LuHeartHandshake, LuExternalLink, LuLock, LuInfo, LuSearch } from 'react-icons/lu'
import CmsGallery from '../components/CmsGallery/CmsGallery'
import RntModal from '../components/RntModal/RntModal'
import './RegistroTurismo.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

export default function RegistroTurismo() {
    const [searchParams] = useSearchParams()
    const [showRntModal, setShowRntModal] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        if (searchParams.get('verificar') === '1' || searchParams.get('consulta') === '1') {
            setShowRntModal(true)
        }
    }, [searchParams])

    return (
        <div className="rnt-page">
            <Helmet>
                <title>Registro Nacional de Turismo (RNT) & Legalidad | RutaXAsia</title>
                <meta name="description" content="Conoce las certificaciones, registro ante la Secretaría de Turismo (SECTUR), seguros y legalidad que respaldan tus viajes a Japón y Corea con RutaXAsia." />
            </Helmet>

            {/* ===== HERO ===== */}
            <section className="rnt-hero">
                <div className="rnt-hero-bg">
                    <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&h=800&fit=crop&q=80" alt="Legalidad RutaXAsia" />
                    <div className="rnt-hero-overlay" />
                </div>
                <div className="container rnt-hero-content">
                    <span className="rnt-hero-badge">
                        <LuShieldCheck size={16} /> SEGURIDAD Y CERTEZA JURÍDICA
                    </span>
                    <h1 className="rnt-hero-title">
                        Registro Nacional de Turismo <br />
                        <span className="rnt-glow-text">& Legalidad Oficial</span>
                    </h1>
                    <p className="rnt-hero-sub">
                        Tu tranquilidad y seguridad son nuestra máxima prioridad. Conoce las certificaciones, registros gubernamentales y garantías que respaldan cada uno de nuestros viajes desde México.
                    </p>

                    <div className="rnt-hero-trust-bar">
                        <div
                            className="rnt-trust-item"
                            onClick={() => setShowRntModal(true)}
                            style={{ cursor: 'pointer' }}
                            title="Haz clic para verificar constancia en línea"
                        >
                            <span className="rnt-trust-icon">🏛️</span>
                            <div>
                                <strong>SECTUR México</strong>
                                <small style={{ color: 'var(--color-primary, #e91e7a)', fontWeight: 700 }}>Verificar en Línea →</small>
                            </div>
                        </div>
                        <div className="rnt-trust-item">
                            <span className="rnt-trust-icon">📄</span>
                            <div>
                                <strong>SAT & Facturación</strong>
                                <small>Empresa 100% formal</small>
                            </div>
                        </div>
                        <div className="rnt-trust-item">
                            <span className="rnt-trust-icon">🏥</span>
                            <div>
                                <strong>Asistencia Médica</strong>
                                <small>Seguro Internacional</small>
                            </div>
                        </div>
                        <div className="rnt-trust-item">
                            <span className="rnt-trust-icon">🔒</span>
                            <div>
                                <strong>Pagos Protegidos</strong>
                                <small>Cuentas bancarias oficiales</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== MAIN LEGAL PILLARS ===== */}
            <section className="container rnt-section">
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <span className="section-tag">Transparencia Total</span>
                    <h2 className="section-title">¿Por qué viajar con una <span className="text-accent">agencia formal</span>?</h2>
                    <p className="section-subtitle" style={{ maxWidth: '650px', margin: '0 auto' }}>
                        En un viaje al otro lado del mundo, la informalidad puede salir muy cara. En RutaXAsia operamos con estricto apego a las leyes mexicanas e internacionales.
                    </p>
                </div>

                <div className="rnt-pillars-grid">
                    {/* Pillar 1 */}
                    <div className="rnt-pillar-card">
                        <div className="rnt-pillar-top">
                            <div className="rnt-pillar-icon"><LuFileCheck size={28} /></div>
                            <span className="rnt-pillar-status">Verificado ✓</span>
                        </div>
                        <h3>Registro Nacional de Turismo (SECTUR)</h3>
                        <p>
                            Estamos formalmente inscritos en el Registro Nacional de Turismo (RNT), catálogo público obligatorio establecido por la Secretaría de Turismo del Gobierno de México que certifica que somos una agencia de viajes legalmente constituida.
                        </p>
                        <ul className="rnt-pillar-bullets">
                            <li><LuCircleCheck size={16} /> Cumplimiento de la Ley General de Turismo</li>
                            <li><LuCircleCheck size={16} /> Supervisión y aval gubernamental</li>
                            <li><LuCircleCheck size={16} /> Respaldo ante cualquier contingencia</li>
                        </ul>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setShowRntModal(true)}
                            style={{
                                marginTop: '1.2rem',
                                width: '100%',
                                borderRadius: '100px',
                                fontSize: '0.86rem',
                                padding: '10px 16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontWeight: 700
                            }}
                        >
                            <LuSearch size={15} /> Consultar Certificado SECTUR en Línea →
                        </button>
                    </div>

                    {/* Pillar 2 */}
                    <div className="rnt-pillar-card">
                        <div className="rnt-pillar-top">
                            <div className="rnt-pillar-icon"><LuCreditCard size={28} /></div>
                            <span className="rnt-pillar-status">Fiscalmente Formal</span>
                        </div>
                        <h3>Cuentas Bancarias Oficiales & Facturación</h3>
                        <p>
                            Todos los depósitos, transferencias y pagos con tarjeta se realizan a cuentas bancarias morales/oficiales a nombre de nuestra empresa. Emitimos factura fiscal (CFDI) a todos los clientes que lo soliciten.
                        </p>
                        <ul className="rnt-pillar-bullets">
                            <li><LuCircleCheck size={16} /> Sin cuentas personales de terceros ni pagos opacos</li>
                            <li><LuCircleCheck size={16} /> Emisión de comprobantes fiscales válidos ante el SAT</li>
                            <li><LuCircleCheck size={16} /> Pasarelas de pago con encriptación bancaria SSL de 256 bits</li>
                        </ul>
                    </div>

                    {/* Pillar 3 */}
                    <div className="rnt-pillar-card">
                        <div className="rnt-pillar-top">
                            <div className="rnt-pillar-icon"><LuHeartHandshake size={28} /></div>
                            <span className="rnt-pillar-status">Cobertura 24/7</span>
                        </div>
                        <h3>Seguro de Asistencia Internacional</h3>
                        <p>
                            Cada uno de nuestros tours grupales y paquetes incluye seguro médico y de asistencia en viaje internacional, cubriendo gastos médicos por enfermedad, accidentes, hospitalización y repatriación en Japón y Corea del Sur.
                        </p>
                        <ul className="rnt-pillar-bullets">
                            <li><LuCircleCheck size={16} /> Cobertura médica en hospitales de primer nivel</li>
                            <li><LuCircleCheck size={16} /> Asistencia 24 horas en idioma español</li>
                            <li><LuCircleCheck size={16} /> Cobertura de equipaje y demoras de vuelo</li>
                        </ul>
                    </div>

                    {/* Pillar 4 */}
                    <div className="rnt-pillar-card">
                        <div className="rnt-pillar-top">
                            <div className="rnt-pillar-icon"><LuBuilding2 size={28} /></div>
                            <span className="rnt-pillar-status">Alianzas Locales</span>
                        </div>
                        <h3>Operadores Certificados en Japón y Corea</h3>
                        <p>
                            Nuestras reservas de trenes Shinkansen, hoteles 3 y 4 estrellas, entradas y transportación se gestionan a través de convenios directos con operadores receptivos certificados en Tokio, Kioto y Seúl.
                        </p>
                        <ul className="rnt-pillar-bullets">
                            <li><LuCircleCheck size={16} /> Hoteles verificados personalmente por Juan y Ale</li>
                            <li><LuCircleCheck size={16} /> Pases oficiales de Japan Rail (JR Pass)</li>
                            <li><LuCircleCheck size={16} /> Transportación terrestre con permisos de turismo vigentes</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ===== HOW TO VERIFY AN AGENCY ===== */}
            <section className="rnt-verify-guide">
                <div className="container">
                    <div className="rnt-guide-box">
                        <div className="rnt-guide-content">
                            <span className="rnt-guide-tag">CONSEJO DE SEGURIDAD PARA VIAJEROS</span>
                            <h2>¿Cómo comprobar que tu agencia no es un fraude?</h2>
                            <p>
                                Antes de depositar tu dinero a cualquier agencia de viajes en México, te sugerimos seguir estos 4 pasos básicos para proteger tu patrimonio:
                            </p>

                            <div className="rnt-steps-list">
                                <div className="rnt-step-item">
                                    <span className="rnt-step-num">1</span>
                                    <div>
                                        <h4>Exige el número de RNT ante SECTUR</h4>
                                        <p>
                                            Una agencia legal no tiene nada que ocultar y te compartirá su registro de inmediato. Nuestro folio oficial es <strong>0409015ae266f</strong> (RFC: <strong>SARJ740301GS3</strong>).
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowRntModal(true)}
                                            style={{
                                                background: 'rgba(233, 30, 122, 0.08)',
                                                border: '1px solid rgba(233, 30, 122, 0.3)',
                                                color: 'var(--color-primary, #e91e7a)',
                                                padding: '6px 14px',
                                                borderRadius: '100px',
                                                fontSize: '0.82rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                marginTop: '8px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <LuSearch size={14} /> Abrir Consulta Oficial SECTUR en pantalla →
                                        </button>
                                    </div>
                                </div>
                                <div className="rnt-step-item">
                                    <span className="rnt-step-num">2</span>
                                    <div>
                                        <h4>Verifica que la cuenta bancaria esté a nombre de la empresa</h4>
                                        <p>Nunca transfieras a cuentas personales desconocidas de bancos digitales sin respaldo fiscal.</p>
                                    </div>
                                </div>
                                <div className="rnt-step-item">
                                    <span className="rnt-step-num">3</span>
                                    <div>
                                        <h4>Solicita contrato de adhesión o términos claros</h4>
                                        <p>Toda agencia formal tiene políticas transparentes de apartado, cuotas, cancelaciones y seguro.</p>
                                    </div>
                                </div>
                                <div className="rnt-step-item">
                                    <span className="rnt-step-num">4</span>
                                    <div>
                                        <h4>Revisa reseñas reales de viajeros anteriores</h4>
                                        <p>Fotos reales, testimonios y personas comprobables que hayan regresado felices de su viaje.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rnt-guide-cta">
                                <a
                                    href={`${WHATSAPP_BASE}SW-Hola%20quiero%20conocer%20mas%20sobre%20la%20legalidad%20y%20garantias%20de%20RutaXAsia`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    💬 Solicitar constancia y datos fiscales por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== EXPERIENCIAS REALES / FOTOS DE VIAJEROS (CMS Galeriadenosotros - General) ===== */}
            <CmsGallery
                tag="Evidencia y Transparencia"
                title="Momentos reales con nuestros viajeros"
                subtitle="Fotos tomadas durante nuestros tours en Japón y Corea. Cada experiencia respaldada por una agencia 100% legal y formal."
                fixedCategory="General"
                showTabs={false}
                maxInitial={6}
                theme="light"
            />

            {/* ===== DIRECT FAQ SECTION ===== */}
            <section className="container rnt-faq-section">
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span className="section-tag">Preguntas de Confianza</span>
                    <h2 className="section-title">Dudas frecuentes sobre <span className="text-accent">legalidad y pagos</span></h2>
                </div>

                <div className="rnt-faq-grid">
                    <div className="rnt-faq-item">
                        <h4><LuInfo size={18} /> ¿Cómo aparto mi lugar y cuáles son las formas de pago?</h4>
                        <p>Apartas tu lugar con un anticipo inicial por persona. El saldo restante se liquida en cuotas mensuales sin intereses hasta 45 días antes de la fecha de salida. Aceptamos transferencias SPEI, depósitos bancarios y tarjetas de crédito/débito.</p>
                    </div>
                    <div className="rnt-faq-item">
                        <h4><LuInfo size={18} /> ¿Me entregan un contrato y comprobante oficial?</h4>
                        <p>Sí, una vez realizado tu anticipo se genera tu confirmación de reserva con número de folio, itinerario detallado, desglose de pagos y el contrato de prestación de servicios turísticos.</p>
                    </div>
                    <div className="rnt-faq-item">
                        <h4><LuInfo size={18} /> ¿Qué pasa si requiero factura fiscal?</h4>
                        <p>Emitimos factura electrónica (CFDI 4.0) a personas físicas o morales mexicanas con los requisitos fiscales vigentes ante el SAT.</p>
                    </div>
                    <div className="rnt-faq-item">
                        <h4><LuInfo size={18} /> ¿Quién responde por mí durante el viaje en Japón o Corea?</h4>
                        <p>Juan y Ale viajan en persona con el grupo desde México. Contamos con protocolos de emergencia, comunicación directa con la embajada mexicana y operadores locales de asistencia 24/7.</p>
                    </div>
                </div>
            </section>

            {/* In-App SECTUR Certificate Modal */}
            <RntModal isOpen={showRntModal} onClose={() => setShowRntModal(false)} />
        </div>
    )
}
