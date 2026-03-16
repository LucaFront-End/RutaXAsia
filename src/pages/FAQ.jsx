import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { LuClipboardList, LuCreditCard, LuPlane, LuMap, LuTicket, LuLanguages, LuBanknote, LuShieldCheck, LuWifi, LuUsers, LuMessageCircle, LuMail } from 'react-icons/lu'
import './faq.css'

const FAQ_CATEGORIES = [
    {
        category: 'Antes del viaje',
        icon: <LuClipboardList size={18} />,
        color: '#DC2626',
        items: [
            { q: '¿Necesito visa para viajar a Japón?', a: 'No. Los ciudadanos mexicanos no necesitan visa para estancias turísticas de hasta 90 días en Japón. Solo necesitás tu pasaporte vigente con al menos 6 meses de validez.' },
            { q: '¿Necesito visa para Corea del Sur?', a: 'No. México tiene un acuerdo de exención de visa con Corea del Sur para estancias turísticas de hasta 90 días. Solo se requiere pasaporte vigente y boleto de regreso.' },
            { q: '¿Cuánto tiempo antes debo reservar?', a: 'Recomendamos reservar con al menos 3-4 meses de anticipación. Nuestros grupos son de máximo 15 personas y se llenan rápido, especialmente la temporada de Sakura. Con el anticipo quedás asegurado.' },
            { q: '¿Puedo viajar solo/a?', a: 'Sí, la mayoría de nuestros viajeros van solos. Es una excelente oportunidad para conocer gente con intereses similares. Ofrecemos hospedaje compartido o individual según tu preferencia.' },
            { q: '¿Qué vacunas necesito?', a: 'Japón y Corea del Sur no requieren vacunas obligatorias para viajeros mexicanos. Sin embargo, recomendamos tener al día las vacunas básicas. Te enviamos una guía completa al reservar.' },
            { q: '¿Necesito saber japonés o coreano?', a: 'No es necesario. Nuestro guía hispanohablante te acompaña durante todo el viaje. Además, te enviamos un kit con frases básicas y apps útiles de traducción antes de partir.' },
        ],
    },
    {
        category: 'Pagos y precios',
        icon: <LuCreditCard size={18} />,
        color: '#2563EB',
        items: [
            { q: '¿Cuánto cuesta un viaje a Japón?', a: 'Nuestros tours a Japón van desde $2,690 USD hasta $3,490 USD por persona en base doble, dependiendo de la temporada y duración. Esto incluye vuelos internacionales, hospedaje, transporte interno, guía y seguro.' },
            { q: '¿Puedo pagar en cuotas?', a: 'Sí. Apartás tu lugar con un anticipo de $500 USD y el resto se paga en cuotas mensuales sin intereses antes de la fecha de salida. Te enviamos un plan de pagos personalizado.' },
            { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos transferencia bancaria (SPEI), depósito en efectivo, tarjeta de débito/crédito y PayPal. Para pagos con tarjeta de crédito puede aplicar una pequeña comisión bancaria.' },
            { q: '¿Qué pasa si necesito cancelar?', a: 'Tenemos una política clara de cancelación. Si cancelás con más de 60 días de anticipación, se devuelve el 80% del anticipo. Entre 30-60 días, el 50%. Menos de 30 días, el anticipo no es reembolsable. El seguro de viaje incluido cubre emergencias médicas.' },
            { q: '¿Hay costos ocultos?', a: 'No. El precio publicado incluye todo lo mencionado en el itinerario. Los únicos gastos adicionales son comidas no especificadas, propinas opcionales, gastos personales y actividades marcadas como opcionales.' },
        ],
    },
    {
        category: 'Durante el viaje',
        icon: <LuPlane size={18} />,
        color: '#059669',
        items: [
            { q: '¿Qué incluye el tour?', a: 'Todos nuestros tours incluyen: vuelos internacionales desde CDMX, hospedaje 3-4 estrellas, transporte interno (JR Pass en Japón, KTX en Corea), guía hispanohablante, seguro de viaje internacional, WiFi portátil o eSIM, y comidas especiales seleccionadas.' },
            { q: '¿Cuántas personas van en cada grupo?', a: 'Máximo 15 personas por grupo. Esto nos permite dar atención personalizada, ser flexibles con el itinerario y crear una experiencia mucho más íntima que los tours masivos de 40+ personas.' },
            { q: '¿Hay tiempo libre durante el viaje?', a: 'Sí. Cada día tiene un balance entre actividades organizadas y tiempo libre. Creemos que descubrir un lugar por tu cuenta es parte esencial del viaje. Te damos recomendaciones personalizadas para esas horas libres.' },
            { q: '¿Es seguro viajar a Japón y Corea?', a: 'Japón y Corea del Sur son de los países más seguros del mundo. Los índices de criminalidad son extremadamente bajos, el transporte es impecable y la gente es increíblemente amable. Además, viajás con nuestro grupo y guía en todo momento.' },
            { q: '¿Qué tipo de hospedaje usan?', a: 'Usamos hoteles 3-4 estrellas bien ubicados y verificados personalmente por nosotros. En algunos tours incluimos una noche en ryokan (posada tradicional japonesa) con onsen (baños termales). Todo seleccionado para una experiencia auténtica y cómoda.' },
            { q: '¿Puedo tener alguna experiencia exclusiva?', a: 'Sí. Ofrecemos experiencias como ceremonia del té privada, cenas kaiseki, clases de sushi, vestimenta con kimono/hanbok, y visitas a barrios locales que no están en ninguna guía turística.' },
        ],
    },
    {
        category: 'Logística',
        icon: <LuMap size={18} />,
        color: '#D97706',
        items: [
            { q: '¿Desde qué aeropuerto salen los vuelos?', a: 'Todos nuestros vuelos salen del Aeropuerto Internacional de la Ciudad de México (MEX). Si vivís en otra ciudad, podemos ayudarte a coordinar vuelos de conexión.' },
            { q: '¿Qué debo llevar?', a: 'Te enviamos un kit pre-viaje completo al reservar que incluye lista de equipaje según la temporada, apps recomendadas, adaptadores necesarios (Japón usa tipo A/B), tips de vestimenta para templos y recomendaciones de cada ciudad.' },
            { q: '¿Cómo funciona el internet en el viaje?', a: 'Incluimos WiFi portátil (Pocket WiFi) o eSIM con datos ilimitados para que estés siempre conectado. Funciona en todo Japón y Corea del Sur. Lo recibís al llegar al aeropuerto.' },
            { q: '¿Necesito cambiar dinero antes?', a: 'Recomendamos llevar algo de efectivo en yenes (Japón) o wones (Corea). Te explicamos las mejores formas de cambiar y las tarjetas que funcionan mejor. En general, las tarjetas Visa/Mastercard funcionan bien en ambos países.' },
        ],
    },
]

const QUICK_FACTS = [
    { icon: <LuTicket size={20} />, text: 'Sin visa para mexicanos' },
    { icon: <LuLanguages size={20} />, text: 'Guía en español 24/7' },
    { icon: <LuBanknote size={20} />, text: 'Pago en cuotas sin intereses' },
    { icon: <LuShieldCheck size={20} />, text: 'Seguro de viaje incluido' },
    { icon: <LuWifi size={20} />, text: 'WiFi portátil incluido' },
    { icon: <LuUsers size={20} />, text: 'Máx. 15 personas por grupo' },
]

export default function FAQ() {
    const [openItems, setOpenItems] = useState({})
    const [activeCategory, setActiveCategory] = useState(0)

    useEffect(() => { window.scrollTo(0, 0) }, [])

    useEffect(() => {
        const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target) } })
        }, { threshold: 0.12 })
        els.forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    const toggleItem = (catIdx, itemIdx) => {
        const key = `${catIdx}-${itemIdx}`
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const currentCat = FAQ_CATEGORIES[activeCategory]

    return (
        <>
            <Helmet>
                <title>Preguntas Frecuentes Viaje a Japón | RutaXAsia</title>
                <meta name="description" content="Resuelve dudas sobre viaje a Japón México y viajes a Corea del Sur con RutaXAsia, la agencia #1 de viajes a Japón desde México y expertos en viajes a Asia." />
            </Helmet>

            {/* ===== HERO ===== */}
            <section className="fq-hero">
                <div className="fq-hero-bg">
                    <img src="https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&h=1080&fit=crop&q=80" alt="Monte Fuji" />
                </div>
                <div className="fq-hero-overlay" />
                <div className="fq-hero-content container">
                    <div className="fq-hero-badge">CENTRO DE AYUDA</div>
                    <h1 className="fq-hero-h1">Preguntas Frecuentes</h1>
                    <p className="fq-hero-sub">Todo lo que necesitás saber antes de viajar a Japón y Corea con nosotros</p>
                </div>
            </section>

            {/* ===== QUICK FACTS STRIP ===== */}
            <section className="fq-quick">
                <div className="container">
                    <div className="fq-quick-grid">
                        {QUICK_FACTS.map((f, i) => (
                            <div key={i} className="fq-quick-item reveal" style={{"--delay":`${i * 0.06}s`}}>
                                <span className="fq-quick-icon">{f.icon}</span>
                                <span className="fq-quick-text">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== MAIN FAQ ===== */}
            <section className="fq-main container">
                <div className="fq-layout">
                    {/* Sidebar categories */}
                    <aside className="fq-sidebar reveal-left">
                        <span className="fq-sidebar-label">CATEGORÍAS</span>
                        {FAQ_CATEGORIES.map((cat, i) => (
                            <button
                                key={i}
                                className={`fq-sidebar-btn ${activeCategory === i ? 'fq-sidebar-btn--active' : ''}`}
                                onClick={() => setActiveCategory(i)}
                            >
                                <span className="fq-sidebar-icon">{cat.icon}</span>
                                <span className="fq-sidebar-name">{cat.category}</span>
                                <span className="fq-sidebar-count">{cat.items.length}</span>
                            </button>
                        ))}

                        {/* Still need help */}
                        <div className="fq-sidebar-help">
                            <p>¿No encontrás tu respuesta?</p>
                            <a href="https://wa.me/525513610083?text=SW-Hola%20tengo%20una%20pregunta%20sobre%20los%20viajes" className="btn btn-primary btn-full" target="_blank" rel="noopener noreferrer" style={{fontSize:'0.85rem', padding:'0.7rem 1.2rem'}}>
                                <LuMessageCircle size={14} style={{marginRight:'0.3rem', verticalAlign:'middle'}} /> Preguntá por WhatsApp
                            </a>
                        </div>
                    </aside>

                    {/* FAQ items */}
                    <div className="fq-questions reveal-right" style={{"--delay":"0.1s"}}>
                        <div className="fq-questions-header">
                            <span className="fq-questions-cat-icon" style={{background: currentCat.color, color: '#fff'}}>{currentCat.icon}</span>
                            <div>
                                <h2 className="fq-questions-title">{currentCat.category}</h2>
                                <p className="fq-questions-count">{currentCat.items.length} preguntas</p>
                            </div>
                        </div>

                        <div className="fq-list">
                            {currentCat.items.map((item, j) => {
                                const key = `${activeCategory}-${j}`
                                const isOpen = openItems[key]
                                return (
                                    <div key={key} className={`fq-item ${isOpen ? 'fq-item--open' : ''}`}>
                                        <button className="fq-question" onClick={() => toggleItem(activeCategory, j)}>
                                            <span className="fq-q-number">{String(j + 1).padStart(2, '0')}</span>
                                            <span className="fq-q-text">{item.q}</span>
                                            <svg className={`fq-q-arrow ${isOpen ? 'fq-q-arrow--open' : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        <div className={`fq-answer ${isOpen ? 'fq-answer--open' : ''}`}>
                                            <div className="fq-answer-inner">
                                                <p>{item.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA BANNER ===== */}
            <section className="fq-cta">
                <div className="container">
                        <div className="fq-cta-card reveal">
                        <div className="fq-cta-left">
                            <h3 className="fq-cta-title">¿Listo para el viaje de tu vida?</h3>
                            <p className="fq-cta-sub">Escribinos y te armamos un plan personalizado en menos de 24 horas</p>
                        </div>
                        <div className="fq-cta-right">
                            <a href="https://wa.me/525513610083?text=SW-Hola%20quiero%20cotizar%20un%20viaje" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                <LuMessageCircle size={16} style={{marginRight:'0.3rem', verticalAlign:'middle'}} /> WhatsApp
                            </a>
                            <a href="mailto:reservas@rutaxasia.com" className="btn btn-outline fq-cta-outline">
                                <LuMail size={16} style={{marginRight:'0.3rem', verticalAlign:'middle'}} /> Email
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
