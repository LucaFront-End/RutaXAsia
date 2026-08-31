import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuFlag, LuUsers, LuLanguages, LuPlane, LuShieldCheck, LuCreditCard, LuSearch, LuMessageCircle, LuCircleCheck, LuPackage, LuPlaneTakeoff, LuCheck, LuArrowRight } from 'react-icons/lu'
import './aboutus.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

const STATS = [
    { value: 500, suffix: '+', label: 'Viajeros felices' },
    { value: 15, suffix: '+', label: 'Viajes realizados' },
    { value: 4.9, suffix: '★', label: 'Calificación promedio', decimals: 1 },
    { value: 8, suffix: '', label: 'Destinos en Asia' },
]

const VALUES = [
    { icon: <LuFlag size={24} />, title: 'Auténtico', desc: 'Cada ruta está diseñada por nosotros, con experiencias que solo un local conoce. Nada genérico, todo curado.', accent: '#DC2626' },
    { icon: <LuUsers size={24} />, title: 'Grupos pequeños', desc: 'Máximo 20 personas. Experiencia personalizada, flexible y con atención real a cada viajero.', accent: '#2563EB' },
    { icon: <LuLanguages size={24} />, title: 'En español', desc: 'Guía hispanohablante durante todo el viaje. Sin barreras de idioma, todo resuelto en tu lengua.', accent: '#059669' },
    { icon: <LuPlane size={24} />, title: 'Todo incluido', desc: 'Vuelos, hospedaje, transporte, seguro y experiencias. Solo preocúpate por disfrutar.', accent: '#D97706' },
    { icon: <LuShieldCheck size={24} />, title: 'Seguridad total', desc: 'Seguro incluido, asistencia 24/7 y respaldo de una agencia formalmente establecida en México.', accent: '#7C3AED' },
    { icon: <LuCreditCard size={24} />, title: 'Pagos flexibles', desc: 'Aparta tu lugar con un anticipo y paga en cuotas sin intereses. Viaja sin estrés financiero.', accent: '#DB2777' },
]

const GALLERY = [
    { src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=750&fit=crop&q=80', caption: 'Templo Fushimi Inari, Kyoto', span: 'tall' },
    { src: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&q=80', caption: 'Tokyo skyline', span: '' },
    { src: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=400&fit=crop&q=80', caption: 'Monte Fuji', span: '' },
    { src: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop&q=80', caption: 'Bambú, Arashiyama', span: '' },
    { src: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=750&fit=crop&q=80', caption: 'Calles de Seúl', span: 'tall' },
    { src: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600&h=400&fit=crop&q=80', caption: 'Sakura season', span: '' },
]

const PROCESS = [
    { step: '01', title: 'Elige tu viaje', desc: 'Explora nuestros tours. Sakura, Verano, Otoño o Corea — cada temporada es única.', icon: <LuSearch size={22} /> },
    { step: '02', title: 'Contáctanos', desc: 'Escríbenos por WhatsApp o email. Respondemos en menos de 2 horas, sin compromiso.', icon: <LuMessageCircle size={22} /> },
    { step: '03', title: 'Reserva tu lugar', desc: 'Con un anticipo aseguras tu plaza. El resto se paga en cuotas cómodas.', icon: <LuCircleCheck size={22} /> },
    { step: '04', title: 'Kit pre-viaje', desc: 'Te enviamos qué llevar, apps útiles, frases básicas y tips de cada ciudad.', icon: <LuPackage size={22} /> },
    { step: '05', title: '¡A volar!', desc: 'Nos encontramos en el aeropuerto y desde ahí nos encargamos de todo.', icon: <LuPlaneTakeoff size={22} /> },
]

const TIMELINE_EVENTS = [
    {
        year: '2009',
        title: 'Mi primer viaje a Japón',
        desc: 'Juan viaja a Japón como becario y obtiene su primera certificación como facilitador. Un sueño de niño cumplido que dejó la espina de querer más.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop&q=80',
        side: 'left',
    },
    {
        year: '2011',
        title: 'Segunda certificación en Japón',
        desc: 'Con más preparación y estudio, Juan vuelve a Japón y lo disfruta al máximo. En esta visita supo que Japón se quedaba en él y él en Japón.',
        image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop&q=80',
        side: 'right',
    },
    {
        year: '2011-18',
        title: 'Años de experiencia profesional',
        desc: 'Viajes frecuentes como consultor, ponente y coordinador de logística. Experiencia en manejo de grupos, movilización y cultura japonesa más allá de las grandes ciudades.',
        image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=400&fit=crop&q=80',
        side: 'left',
    },
    {
        year: '2018',
        title: 'Nace Juan Santiago Mx Viajes',
        desc: 'El primer tour turístico con clientes: la ya clásica edición Otoño en Japón en noviembre. Nace formalmente Juan Santiago Mx Viajes.',
        image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop&q=80',
        side: 'right',
    },
    {
        year: '2019',
        title: '6 viajes grupales',
        desc: '3 grupos en Sakura, 2 en verano y 2 en otoño. De las primeras agencias en México con tours semi-personalizados y acompañamiento desde CDMX durante todo el viaje.',
        image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop&q=80',
        side: 'left',
    },
    {
        year: '2020-22',
        title: 'El año de la reinvención',
        desc: 'La pandemia cerró fronteras pero abrió oportunidades: reestructuración de rutas, nuevos convenios con hoteles y operadores locales, y creación de contenido educativo sobre Asia.',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&h=400&fit=crop&q=80',
        side: 'right',
    },
    {
        year: '2023',
        title: 'El gran regreso',
        desc: 'Reapertura de Japón al turismo internacional. Récord de salidas: 8 grupos en el año, 100% de satisfacción y la consolidación de la comunidad de viajeros RutaXAsia.',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&q=80',
        side: 'left',
    },
    {
        year: '2024',
        title: 'Expansión a Corea del Sur',
        desc: 'Lanzamiento oficial de los tours combinados Japón + Corea y Corea del Sur exclusivo. Nuevas rutas temáticas, grupos sold out en semanas y más de 500 viajeros felices.',
        image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=400&fit=crop&q=80',
        side: 'right',
    },
]

const TRUST = [
    'Agencia registrada ante la Secretaría de Turismo de México',
    'Seguro de responsabilidad civil para todos los viajeros',
    'Alianzas con operadores locales certificados en Japón y Corea',
    '+500 viajeros satisfechos desde 2022',
    'Hospedajes verificados 3-4 estrellas',
    'Protocolos de emergencia y asistencia médica internacional',
]

/* Animated counter hook */
function useCounter(end, duration = 2000, decimals = 0) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true
                const start = performance.now()
                const animate = (now) => {
                    const progress = Math.min((now - start) / duration, 1)
                    const eased = 1 - Math.pow(1 - progress, 3)
                    setCount(parseFloat((eased * end).toFixed(decimals)))
                    if (progress < 1) requestAnimationFrame(animate)
                }
                requestAnimationFrame(animate)
            }
        }, { threshold: 0.3 })
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [end, duration, decimals])

    return [count, ref]
}

function StatItem({ value, suffix, label, decimals = 0 }) {
    const [count, ref] = useCounter(value, 2000, decimals)
    return (
        <div className="au-stat" ref={ref}>
            <span className="au-stat-value">{count}{suffix}</span>
            <span className="au-stat-label">{label}</span>
        </div>
    )
}

/* Auto-reveal all .reveal elements on scroll */
function useRevealOnScroll() {
    useEffect(() => {
        const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target) } })
        }, { threshold: 0.12 })
        els.forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])
}

export default function AboutUs() {
    const [activeValue, setActiveValue] = useState(0)
    const timelineRef = useRef(null)
    const timelineLineRef = useRef(null)

    useEffect(() => { window.scrollTo(0, 0) }, [])
    useRevealOnScroll()

    // Timeline scroll-fill animation
    useEffect(() => {
        const handleTimelineScroll = () => {
            if (!timelineRef.current || !timelineLineRef.current) return
            const section = timelineRef.current
            const rect = section.getBoundingClientRect()
            const sectionTop = rect.top + window.scrollY
            const sectionH = section.offsetHeight
            const scrollPos = window.scrollY + window.innerHeight * 0.5
            const progress = Math.max(0, Math.min(1, (scrollPos - sectionTop) / sectionH))
            timelineLineRef.current.style.height = `${progress * 100}%`
        }
        window.addEventListener('scroll', handleTimelineScroll, { passive: true })
        handleTimelineScroll()
        return () => window.removeEventListener('scroll', handleTimelineScroll)
    }, [])

    return (
        <>
            <Helmet>
                <title>Nosotros | RutaXAsia Agencia #1 de Viajes a Japón desde México</title>
                <meta name="description" content="Conoce RutaXAsia, la agencia #1 de viajes a Japón desde México. Especialistas en viaje a Japón México, viajes a Corea del Sur y los mejores precios a Japón." />
            </Helmet>

            {/* ===== HERO — CINEMATIC SPLIT ===== */}
            <section className="au-hero">
                <div className="au-hero-bg">
                    <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=1080&fit=crop&q=80" alt="Fushimi Inari, Kyoto" />
                </div>
                <div className="au-hero-overlay" />
                <div className="au-hero-content container">
                    <div className="au-hero-badge">NUESTRA HISTORIA</div>
                    <h1 className="au-hero-h1">
                        Somos <span className="au-hero-accent">Juan</span> y <span className="au-hero-accent">Ale</span>
                    </h1>
                    <p className="au-hero-sub">
                        Expertos en viajes a Japón y Corea del Sur. Llevamos a viajeros latinos a vivir Asia de la forma más auténtica, segura e inolvidable.
                    </p>
                    <div className="au-hero-scroll">
                        <span>Scroll</span>
                        <div className="au-hero-scroll-line" />
                    </div>
                </div>
            </section>

            {/* ===== JUAN & ALE FOUNDER SPOTLIGHT (Showstopping Feature Strip) ===== */}
            <section className="au-founders-spotlight">
                <div className="container">
                    <div className="au-founders-header reveal">
                        <span className="au-founders-tag">✨ ACOMPAÑAMIENTO REAL Y HUMANO</span>
                        <h2 className="au-founders-title">
                            No somos una agencia impersonal.<br />
                            <span className="au-founders-glow">Viajamos contigo desde el primer día.</span>
                        </h2>
                        <p className="au-founders-sub">
                            Nosotros diseñamos las rutas, coordinamos la logística y te guiamos en persona por los rincones más fascinantes de Asia.
                        </p>
                    </div>

                    <div className="au-founders-grid">
                        {/* Juan Card */}
                        <div className="au-founder-card au-founder-card--juan reveal-left">
                            <div className="au-founder-photo-wrap">
                                <img
                                    src="/images/team/juan-rutaxasia.jpg"
                                    alt="Juan Santiago - Fundador"
                                    className="au-founder-img au-founder-img--juan"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&q=80'
                                    }}
                                />
                                <div className="au-founder-photo-overlay" />
                                <div className="au-founder-flag">🇲🇽 ➔ 🇯🇵</div>
                                <div className="au-founder-badge-pill">Fundador & Coordinador</div>
                            </div>
                            <div className="au-founder-info">
                                <span className="au-founder-pretitle">Logística, Cultura & Rutas</span>
                                <h3 className="au-founder-name">Juan Santiago</h3>
                                <div className="au-founder-pills">
                                    <span>🏛️ +15 Años en Japón</span>
                                    <span>🚅 Experto en Transporte & JR</span>
                                    <span>📍 Becario & Facilitador</span>
                                </div>
                                <p className="au-founder-desc">
                                    «Mi pasión es que conozcas el Japón auténtico: el callejón de ramen que solo los locales conocen, la sincronía perfecta de los trenes y la mística de los santuarios al amanecer.»
                                </p>
                                <div className="au-founder-quote-box">
                                    <span className="au-quote-symbol">“</span>
                                    <em>Japón no se visita como turista, se vive y se siente en cada detalle.</em>
                                </div>
                            </div>
                        </div>

                        {/* Ale Card */}
                        <div className="au-founder-card au-founder-card--ale reveal-right">
                            <div className="au-founder-photo-wrap">
                                <img
                                    src="/images/team/ale-rutaxasia.jpg"
                                    alt="Alejandra - Co-fundadora & Anfitriona"
                                    className="au-founder-img au-founder-img--ale"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop&q=80'
                                    }}
                                />
                                <div className="au-founder-photo-overlay" />
                                <div className="au-founder-flag">🇲🇽 ➔ 🇰🇷 🇯🇵</div>
                                <div className="au-founder-badge-pill">Co-Fundadora & Anfitriona</div>
                            </div>
                            <div className="au-founder-info">
                                <span className="au-founder-pretitle">Experiencias, Fotografía & Cuidado</span>
                                <h3 className="au-founder-name">Alejandra</h3>
                                <div className="au-founder-pills">
                                    <span>🌸 Anfitriona de Grupo</span>
                                    <span>👘 Ceremonias & Kimonos</span>
                                    <span>📸 Fotografía de Viaje</span>
                                </div>
                                <p className="au-founder-desc">
                                    «Viajar con nosotros es sentirte en familia desde el aeropuerto de CDMX. Estoy contigo para resolver cada duda, capturar tus mejores recuerdos y cuidar cada momento.»
                                </p>
                                <div className="au-founder-quote-box">
                                    <span className="au-quote-symbol">“</span>
                                    <em>Tu tranquilidad, tu seguridad y tu sonrisa son nuestra mayor satisfacción.</em>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3 Pillars strip */}
                    <div className="au-founders-pillars reveal">
                        <div className="au-pillar-item">
                            <div className="au-pillar-icon">🤝</div>
                            <div>
                                <h4>Trato 100% Personalizado</h4>
                                <p>Sin intermediarios ni call centers. Hablas y viajas directamente con los dueños.</p>
                            </div>
                        </div>
                        <div className="au-pillar-item">
                            <div className="au-pillar-icon">🗣️</div>
                            <div>
                                <h4>Acompañamiento en Español</h4>
                                <p>Guía hispanohablante presente durante todo el viaje. Cero barreras de idioma.</p>
                            </div>
                        </div>
                        <div className="au-pillar-item">
                            <div className="au-pillar-icon">👥</div>
                            <div>
                                <h4>Grupos Reducidos (Máx. 20)</h4>
                                <p>Experiencia ágil, humana y flexible para movernos con facilidad por cada ciudad.</p>
                            </div>
                        </div>
                    </div>

                    <div className="au-founders-cta reveal">
                        <a
                            href={`${WHATSAPP_BASE}SW-Hola%20Juan%20y%20Ale%20quiero%20conocer%20mas%20sobre%20sus%20viajes`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary au-founders-btn"
                        >
                            <span>💬 Habla directamente con Juan y Ale por WhatsApp</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* ===== STATS BAR ===== */}
            <section className="au-stats">
                <div className="container">
                    <div className="au-stats-grid">
                        {STATS.map((s, i) => (
                            <StatItem key={i} {...s} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== STORY — MAGAZINE LAYOUT ===== */}
            <section className="au-story container">
                <div className="au-story-header reveal">
                    <span className="au-label">De viajeros a expertos</span>
                    <h2 className="au-story-h2">Una historia que empezó con un vuelo a Tokio</h2>
                </div>

                <div className="au-story-blocks">
                    <div className="au-story-block au-story-block--img reveal-left">
                        <img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=1000&fit=crop&q=80" alt="Japón" />
                        <span className="au-story-block-year">2018</span>
                    </div>
                    <div className="au-story-block au-story-block--text reveal-right" style={{"--delay":"0.1s"}}>
                        <p className="au-story-lead">Todo empezó en 2018, cuando pisamos Japón por primera vez. Fue un flechazo instantáneo.</p>
                        <p>La cultura, la comida, la amabilidad de su gente, la perfección en cada detalle. Supimos que teníamos que compartir esta experiencia con otros viajeros latinos que, como nosotros, soñaban con conocer Asia pero no sabían por dónde empezar.</p>
                    </div>

                    <div className="au-story-block au-story-block--text au-story-block--dark reveal-left" style={{"--delay":"0.1s"}}>
                        <p className="au-story-lead" style={{color:'#fff'}}>En 2020, mientras el mundo se detuvo, nosotros planificamos cada ruta al detalle.</p>
                        <p style={{color:'rgba(255,255,255,0.6)'}}>Investigamos los mejores hospedajes, las experiencias más auténticas, los rincones que los turistas comunes no conocen. Cada restaurante, cada templo, cada experiencia fue elegida personalmente por nosotros. Así nació RutaXAsia.</p>
                    </div>
                    <div className="au-story-block au-story-block--img reveal-right">
                        <img src="https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=1000&fit=crop&q=80" alt="Corea" />
                        <span className="au-story-block-year">2022</span>
                    </div>

                    <div className="au-story-block au-story-block--wide reveal">
                        <div className="au-story-wide-inner">
                            <p className="au-story-lead">Desde 2022, llevamos a <strong>más de 500 viajeros</strong> a vivir Asia como nadie más.</p>
                            <p>No somos un intermediario. Somos los guías, los planificadores y los que viajamos contigo. Cada viaje lo lideramos personalmente, porque creemos que la diferencia está en los detalles y en la pasión que ponemos en cada experiencia.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== GALLERY MOSAIC ===== */}
            <section className="au-gallery">
                <div className="container">
                    <span className="au-label reveal">Momentos reales</span>
                    <h2 className="au-section-h2 reveal" style={{"--delay":"0.05s"}}>Así se vive un viaje con RutaXAsia</h2>
                    <div className="au-gallery-grid">
                        {GALLERY.map((img, i) => (
                            <div key={i} className={`au-gallery-item reveal-scale ${img.span ? `au-gallery-item--${img.span}` : ''}`} style={{"--delay":`${i * 0.08}s`}}>
                                <img src={img.src} alt={img.caption} />
                                <div className="au-gallery-caption">{img.caption}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== OUR JOURNEY TIMELINE (Moved from Home) ===== */}
            <section className="timeline-section" id="nuestra-historia" ref={timelineRef} style={{ backgroundColor: '#f5f0e8', padding: '5rem 0' }}>
                <div className="container">
                    <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span className="section-tag">Nuestra Historia</span>
                        <h2 className="section-title">El viaje que nos trajo <span className="text-accent" style={{ color: 'var(--color-primary, #e91e7a)' }}>hasta aquí</span></h2>
                        <p className="section-subtitle" style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>Cada año sumó una nueva razón para compartir Asia con el mundo.</p>
                    </div>

                    <div className="tl-track">
                        {/* Center spine */}
                        <div className="tl-spine">
                            <div className="tl-spine-fill" ref={timelineLineRef} />
                        </div>

                        {/* Timeline nodes */}
                        {TIMELINE_EVENTS.map((evt, i) => (
                            <div
                                key={i}
                                className={`tl-node tl-node--${evt.side}`}
                                style={{ margin: '2rem 0' }}
                            >
                                {/* Year badge on the spine */}
                                <div className="tl-year-badge">
                                    <span>{evt.year}</span>
                                </div>

                                {/* Content card */}
                                <div className="tl-card">
                                    <div className="tl-card-img-wrap">
                                        <img src={evt.image} alt={evt.title} className="tl-card-img" loading="lazy" />
                                    </div>
                                    <div className="tl-card-body">
                                        <h3 className="tl-card-title">{evt.title}</h3>
                                        <p className="tl-card-desc">{evt.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== VALUES — INTERACTIVE CARDS ===== */}
            <section className="au-values">
                <div className="container">
                    <span className="au-label reveal">¿Por qué RutaXAsia?</span>
                    <h2 className="au-section-h2 reveal" style={{color:'#fff', "--delay":"0.05s"}}>Lo que nos hace diferentes</h2>

                    <div className="au-values-layout reveal" style={{"--delay":"0.15s"}}>
                        <div className="au-values-tabs">
                            {VALUES.map((v, i) => (
                                <button
                                    key={i}
                                    className={`au-values-tab ${activeValue === i ? 'au-values-tab--active' : ''}`}
                                    onClick={() => setActiveValue(i)}
                                    style={activeValue === i ? { borderColor: v.accent } : {}}
                                >
                                    <span className="au-values-tab-icon" style={{color: v.accent}}>{v.icon}</span>
                                    <span className="au-values-tab-title">{v.title}</span>
                                </button>
                            ))}
                        </div>
                        <div className="au-values-panel">
                            <div className="au-values-panel-icon" style={{color: VALUES[activeValue].accent}}>
                                {VALUES[activeValue].icon}
                            </div>
                            <h3 className="au-values-panel-title">{VALUES[activeValue].title}</h3>
                            <p className="au-values-panel-desc">{VALUES[activeValue].desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PROCESS — VISUAL TIMELINE ===== */}
            <section className="au-process container">
                <span className="au-label reveal">Tu viaje en 5 pasos</span>
                <h2 className="au-section-h2 reveal" style={{"--delay":"0.05s"}}>¿Cómo funciona?</h2>
                <div className="au-process-track">
                    <div className="au-process-line" />
                    {PROCESS.map((p, i) => (
                        <div key={i} className="au-process-node reveal" style={{"--delay":`${i * 0.1}s`}}>
                            <div className="au-process-dot">
                                {p.icon}
                            </div>
                            <div className="au-process-card">
                                <span className="au-process-step">{p.step}</span>
                                <h4 className="au-process-title">{p.title}</h4>
                                <p className="au-process-desc">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== TRUST BADGES ===== */}
            <section className="au-trust">
                <div className="container">
                    <span className="au-label reveal">Respaldo y seguridad</span>
                    <h2 className="au-section-h2 reveal" style={{"--delay":"0.05s"}}>Viaja con tranquilidad</h2>
                    <div className="au-trust-grid">
                        {TRUST.map((t, i) => (
                            <div key={i} className="au-trust-item reveal" style={{"--delay":`${i * 0.07}s`}}>
                                <div className="au-trust-check"><LuCheck size={14} /></div>
                                <span>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CINEMATIC CTA ===== */}
            <section className="au-cta">
                <div className="au-cta-bg">
                    <img src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1920&h=800&fit=crop&q=80" alt="Japón" />
                </div>
                <div className="au-cta-overlay" />
                <div className="au-cta-content container">
                    <h2 className="au-cta-h2 reveal">¿Listo para vivir Asia?</h2>
                    <p className="au-cta-sub reveal" style={{"--delay":"0.1s"}}>Tu próxima aventura está a un mensaje de distancia</p>
                    <div className="au-cta-buttons reveal" style={{"--delay":"0.2s"}}>
                        <Link to="/#viajes" className="btn btn-primary">Ver Viajes <LuArrowRight size={16} style={{marginLeft:'0.3rem', verticalAlign:'middle'}} /></Link>
                        <a href={`${WHATSAPP_BASE}SW-Hola%20quiero%20info%20sobre%20viajes`} className="btn btn-outline au-cta-wa" target="_blank" rel="noopener noreferrer">
                            <LuMessageCircle size={16} style={{marginRight:'0.3rem', verticalAlign:'middle'}} /> WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
