import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

/* ===== COUNTRY GALLERY CARDS (for landing hero) ===== */
const COUNTRY_CARDS = [
    {
        title: 'Japón',
        img: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=500&fit=crop',
        flag: '🇯🇵',
        link: '/viajes/japon',
    },
    {
        title: 'Corea',
        img: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=500&fit=crop',
        flag: '🇰🇷',
        link: '/viajes/corea',
    },
    {
        title: 'China',
        img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=500&fit=crop',
        flag: '🇨🇳',
        link: '/viajes/china',
        badge: 'Próximamente',
    },
]

/* ===== HERO BACKGROUNDS for landing pages (cycle through destinations) ===== */
const DEFAULT_HERO_IMAGES = [
    'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&h=1080&fit=crop&q=85',
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1920&h=1080&fit=crop&q=85',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=1080&fit=crop&q=85',
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1920&h=1080&fit=crop&q=85',
]

/* ===== DAY JOURNEY DATA ===== */
const JOURNEY_TITLE_IMG = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&h=1600&fit=crop&q=80'

const DAY_JOURNEY = [
    {
        time: '08:00 AM',
        activity: 'Río Sumida',
        heading: 'Caminata matutina por el río Sumida y fotos del amanecer sobre Tokyo',
        image: '/images/journey/rio-sumida.jpg',
        type: 'image',
        layout: 'horizontal',
    },
    {
        time: '10:00 AM',
        activity: 'Senso-ji & Asakusa',
        heading: 'Visita el templo Senso-ji y recorre el histórico barrio de Asakusa',
        image: '/images/journey/sensoji.jpeg',
        type: 'image',
        layout: 'vertical',
    },
    {
        time: '12:00 PM',
        activity: 'Kimono en Asakusa',
        heading: 'Vestite de kimono y recorré las calles históricas de Asakusa',
        image: '/images/journey/kimono-asakusa.jpg',
        type: 'image',
        layout: 'horizontal',
    },
    {
        time: '02:00 PM',
        activity: 'Ramen japonés',
        heading: 'Saborea un auténtico ramen japonés en uno de los mejores restaurantes locales',
        image: '/images/journey/ramen.jpg',
        type: 'image',
        layout: 'horizontal',
    },
    {
        time: '08:00 PM',
        activity: 'Neón nocturno',
        heading: 'Piérdete en la magia de las calles de neón de Shinjuku y Shibuya',
        image: '/images/journey/shibuya-noche.jpg',
        type: 'image',
        layout: 'vertical',
    },
]

const TESTIMONIALS = [
    { name: 'María Rodríguez', trip: 'Sakura 2025', location: 'Fushimi Inari, Kyoto', initials: 'MR', text: 'Fue la experiencia más increíble de mi vida. Juan y Ale nos hicieron sentir como en familia.', photo: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=500&fit=crop', rotate: -3 },
    { name: 'Carlos López', trip: 'Verano 2024', location: 'Shibuya, Tokyo', initials: 'CL', text: 'Ya llevo dos viajes con RutaXAsia y estoy planeando el tercero. ¡100% recomendado!', photo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=500&fit=crop', rotate: 2 },
    { name: 'Ana García', trip: 'Sakura 2025', location: 'Río Meguro, Sakura', initials: 'AG', text: 'Tenía miedo de viajar tan lejos sola, pero el grupo fue increíble. Hice amigos para toda la vida.', photo: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400&h=500&fit=crop', rotate: -1.5 },
    { name: 'Diego Martínez', trip: 'Corea 2025', location: 'Bukchon, Seúl', initials: 'DM', text: 'La organización es de primer nivel. Cada día fue una sorpresa nueva. Corea superó todas mis expectativas.', photo: '/images/tours/bukchon-seoul.jpg', rotate: 3 },
    { name: 'Lucía Fernández', trip: 'Sakura 2024', location: 'Monte Fuji', initials: 'LF', text: 'Ver el Monte Fuji con los cerezos en flor fue un sueño. Gracias RutaXAsia por hacerlo posible.', photo: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=500&fit=crop', rotate: -2.5 },
    { name: 'Roberto Sánchez', trip: 'Verano 2025', location: 'Kioto', initials: 'RS', text: 'La comida, la cultura, la gente... todo fue perfecto. Osaka de noche es otra experiencia.', photo: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=500&fit=crop', rotate: 1.5 },
]

/* ===== TRIPS DATA (for boarding pass cards section) ===== */
const TRIPS = [
    {
        id: 'sakura-2027',
        title: 'Sakura 2027',
        heroTagline: 'Japón',
        heroHeading: 'JAPÓN',
        heroSubheading: 'Sakura',
        excerpt: 'Cerezos en flor, templos milenarios y la esencia más pura de Japón. 12 días inolvidables.',
        date: '22 marzo – 2 abril',
        duration: '12 días',
        flagIcons: [{ code: 'jp', name: 'Japón' }],
        badge: 'DISPONIBLE 2027',
        soldOut: false,
        image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&h=400&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&h=1080&fit=crop&q=85',
        includes: ['Vuelos desde CDMX', 'Hospedaje incluido', 'JR Pass incluido', 'Guía hispanohablante'],
    },
    {
        id: 'octubre-japon-2026',
        title: 'Japón Octubre',
        heroTagline: 'Japón',
        heroHeading: 'KYOTO',
        heroSubheading: '& Osaka',
        excerpt: '12 días descubriendo Japón en la mejor época. Clima perfecto y los primeros colores otoñales.',
        date: '2 – 13 octubre',
        duration: '12 días',
        flagIcons: [{ code: 'jp', name: 'Japón' }],
        badge: '🍁 Trilogía Otoño',
        image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&h=400&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1920&h=1080&fit=crop&q=85',
        includes: ['10 noches con desayuno', 'Tours y entradas con guía', 'Transportación y tren bala', 'Coordinador 24/7 y Wi-Fi'],
    },
    {
        id: 'japon-corea-2026',
        title: 'Japón y Corea',
        heroTagline: 'Japón & Corea',
        heroHeading: 'JAPÓN',
        heroSubheading: '& COREA',
        excerpt: '14 días explorando lo mejor de dos mundos. Tokyo, Kyoto, Osaka, Seúl y Busan.',
        date: '17 – 30 octubre',
        duration: '14 días',
        flagIcons: [{ code: 'jp', name: 'Japón' }, { code: 'kr', name: 'Corea' }],
        badge: '🆕 Ya a la venta',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=1080&fit=crop&q=85',
        includes: ['Vuelos desde CDMX', 'Hospedaje incluido', 'JR Pass + KTX', 'Guía hispanohablante'],
    },
    {
        id: 'corea-otono-2026',
        title: 'Corea en Otoño',
        heroTagline: 'Corea del Sur',
        heroHeading: 'COREA OTOÑO',
        heroSubheading: 'Seúl y Busan',
        excerpt: '12 días viviendo la magia del otoño en Corea del Sur. Seúl, Busan y Gyeongju.',
        date: '27 octubre – 7 noviembre',
        duration: '12 días',
        flagIcons: [{ code: 'kr', name: 'Corea' }],
        badge: '🍁 Otoño 2026',
        soldOut: false,
        image: '/images/tours/gyeongju-otono-korea.jpg',
        heroImage: '/images/tours/gyeongju-otono-korea.jpg',
        includes: ['10 noches con desayuno', 'Tours y entradas con guía', 'Transportación y KTX', 'Coordinador 24/7 y Wi-Fi'],
    },
]

/**
 * LandingHome — Dynamic clone of the Home page for city landings.
 * 
 * Features:
 * 1. Dynamic Hero from CMS props (Title, Excerpt, City, WhatsApp)
 * 2. 1. Japón a la Carta Showcase (Modality steps & season shortcuts)
 * 3. 2. Seasons Explorer (¿Cuándo Viajar? 4 Estaciones)
 * 4. 3. Horizontal Day Journey (Sticky scroll with animations & video/images)
 * 5. 4. Próximas Salidas (Boarding Pass Cards)
 * 6. 5. Why Us (Swiss Grid 4 Pillars)
 * 7. 6. Comunidad Viajera (Dynamic CMS /api/resenas reviews)
 * 8. 7. CTA Final (Boarding Pass Ticket with dynamic city)
 */
function LandingHome({ landingData }) {
    const whatsappUrl = landingData?.whatsapp
        ? (landingData.whatsapp.includes('?') ? landingData.whatsapp + '&text=' : landingData.whatsapp + '?text=')
        : WHATSAPP_BASE

    const heroTitle = landingData?.title || 'RutaXAsia'
    const heroExcerpt = landingData?.excerpt || 'Agencia #1 de viajes a Japón y Corea del Sur desde México.'
    const cityName = landingData?.city || 'México'

    // Combine custom landing hero image if present
    const heroImages = landingData?.heroImage
        ? [landingData.heroImage, ...DEFAULT_HERO_IMAGES.filter(img => img !== landingData.heroImage)]
        : DEFAULT_HERO_IMAGES

    const [activeHeroBg, setActiveHeroBg] = useState(0)
    const [testimonials, setTestimonials] = useState(TESTIMONIALS)
    const timerRef = useRef(null)
    const hScrollRef = useRef(null)
    const hTrackRef = useRef(null)
    const hScrollProgressRef = useRef(null)
    const djSvgPaths = useRef([])

    // Fetch approved CMS reviews for Comunidad Viajera section
    useEffect(() => {
        let isMounted = true
        fetch('/api/resenas')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (isMounted && data?.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
                    const cmsPolaroids = data.reviews.map((r, idx) => ({
                        name: r.name,
                        trip: r.trip,
                        location: r.city,
                        text: r.comment,
                        photo: r.tripPhoto || r.photo,
                        rotate: (idx % 2 === 0 ? -1 : 1) * ((idx % 3) + 1.5)
                    }))
                    setTestimonials([...cmsPolaroids, ...TESTIMONIALS].slice(0, 8))
                }
            })
            .catch(() => {})
        return () => { isMounted = false }
    }, [])

    // Auto-advance hero background every 6s
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setActiveHeroBg(prev => (prev + 1) % heroImages.length)
        }, 6000)
        return () => clearInterval(timerRef.current)
    }, [heroImages.length])

    // Scroll-triggered animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = parseInt(entry.target.dataset.delay || '0', 10)
                        setTimeout(() => entry.target.classList.add('animated'), delay)
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.15 }
        )
        document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    // Horizontal scroll (Day Journey)
    useEffect(() => {
        const handleScroll = () => {
            const wrapper = hScrollRef.current
            const track = hTrackRef.current
            if (!wrapper || !track) return
            const rect = wrapper.getBoundingClientRect()
            const totalScrollable = wrapper.offsetHeight - window.innerHeight
            const scrolled = -rect.top
            const progress = Math.max(0, Math.min(1, scrolled / totalScrollable))
            const maxTranslate = track.scrollWidth - window.innerWidth
            track.style.transform = `translateX(-${progress * maxTranslate}px)`
            if (hScrollProgressRef.current) {
                hScrollProgressRef.current.style.width = `${progress * 100}%`
            }
            track.querySelectorAll('.dj-svg-wrap:not(.dj-svg-animate)').forEach(svgWrap => {
                const svgRect = svgWrap.getBoundingClientRect()
                if (svgRect.left < window.innerWidth) svgWrap.classList.add('dj-svg-animate')
            })
            track.querySelectorAll('.dj-reveal-mask:not(.dj-revealed)').forEach(mask => {
                const r = mask.getBoundingClientRect()
                if (r.left < window.innerWidth * 0.85) mask.classList.add('dj-revealed')
            })
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll, { passive: true })
        handleScroll()
        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
        }
    }, [])

    // Preload hero images
    useEffect(() => {
        heroImages.forEach(src => { const img = new Image(); img.src = src })
    }, [heroImages])

    return (
        <>
            {/* ===== DYNAMIC HERO ===== */}
            <section className="hero" id="hero">
                {/* Background images */}
                <div className="hero-backgrounds">
                    {heroImages.map((src, i) => (
                        <div className={`hero-bg${i === activeHeroBg ? ' hero-bg--active' : ''}`} key={i}>
                            <img src={src} alt="" />
                        </div>
                    ))}
                    <div className="hero-overlay" />
                </div>

                {/* Main Content Layout */}
                <div className="hero-layout">
                    {/* Dynamic Text Content from CMS */}
                    <div className="hero-main-content">
                        <div className="hero-destination-label">
                            <span className="hero-dest-line" />
                            <span>✈ Viajes a Asia desde {cityName}</span>
                        </div>

                        <h1 className="hero-title landing-hero-title">{heroTitle}</h1>

                        <p className="hero-excerpt">{heroExcerpt}</p>

                        {/* Dual CTA buttons */}
                        <div className="hero-meta-chips" style={{ gap: '12px', marginTop: '1.5rem' }}>
                            <a
                                href={`${whatsappUrl}SW-Hola%20quiero%20cotizar%20un%20viaje%20a%20Asia%20desde%20${encodeURIComponent(cityName)}`}
                                className="btn btn-primary hero-btn-explore"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <WhatsAppIcon /> Cotiza tu Viaje
                            </a>
                            <Link
                                to="/viajes"
                                className="btn btn-outline hero-btn-explore"
                                style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                            >
                                Ver Viajes <span className="hero-btn-arrow">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Country Gallery Cards (Japón, Corea, China) */}
                    <div className="hero-gallery-wrapper">
                        <div className="hero-gallery">
                            {COUNTRY_CARDS.map((card, j) => (
                                <Link
                                    to={card.link}
                                    className="hero-gcard"
                                    key={j}
                                    style={{ animationDelay: `${j * 0.15}s`, textDecoration: 'none', position: 'relative' }}
                                >
                                    <div className="hero-gcard-header">
                                        <span className="hero-gcard-title">{card.flag} {card.title}</span>
                                        {card.badge && <span className="hero-gcard-stars" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px' }}>{card.badge}</span>}
                                        {!card.badge && <span className="hero-gcard-stars">⭐⭐⭐⭐⭐</span>}
                                    </div>
                                    <div className="hero-gcard-imgbox">
                                        <img src={card.img} alt={card.title} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Area */}
                <div className="hero-footer">
                    <div className="hero-controls" />
                    <div className="hero-progress">
                        <span className="hero-progress-num">{String(activeHeroBg + 1).padStart(2, '0')}</span>
                        <div className="hero-progress-track">
                            <div className="hero-progress-fill" style={{ width: `${((activeHeroBg + 1) / heroImages.length) * 100}%` }} />
                        </div>
                        <span className="hero-progress-num">{String(heroImages.length).padStart(2, '0')}</span>
                    </div>
                </div>
            </section>

            {/* ===== 1. JAPÓN A LA CARTA SHOWCASE SECTION ===== */}
            <section className="home-modality-showcase">
                <div className="container">
                    <div className="hm-grid">
                        <div className="hm-left" data-animate="fade-right">
                            <span className="hm-left-tag">Nueva Forma de Viajar</span>
                            <h2 className="hm-title">
                                Diseña tu aventura con <br /><span>Japón a la Carta</span>
                            </h2>
                            <p className="hm-subtitle">
                                Elige tu temporada preferida, selecciona el estilo de viaje que se adapte a tu ritmo y complementa con actividades a tu medida. Vivir Japón nunca fue tan flexible y personalizado.
                            </p>
                            
                            <div className="hm-steps">
                                <div className="hm-step">
                                    <div className="hm-step-circle">1</div>
                                    <div>
                                        <h4 className="hm-step-title">Elige tu Temporada 🌸</h4>
                                        <p className="hm-step-desc">Sakura en primavera, Verano de festivales o los colores del Momiji en otoño.</p>
                                    </div>
                                </div>
                                <div className="hm-step">
                                    <div className="hm-step-circle">2</div>
                                    <div>
                                        <h4 className="hm-step-title">Elige tu Estilo de Viaje ⛩️</h4>
                                        <p className="hm-step-desc">Desde Libre (viaje a tu ritmo) hasta Signature (acompañamiento premium completo).</p>
                                    </div>
                                </div>
                                <div className="hm-step">
                                    <div className="hm-step-circle">3</div>
                                    <div>
                                        <h4 className="hm-step-title">Personaliza y Disfruta ✈️</h4>
                                        <p className="hm-step-desc">Agrega extensiones, upgrades de hoteles y actividades tradicionales exclusivas.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <Link to="/japon-a-la-carta" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                ¡Crea tu Japón a la Carta! <span>→</span>
                            </Link>
                        </div>
                        
                        <div className="hm-right" data-animate="fade-left">
                            <div className="hm-season-shortcuts">
                                <h3 className="hm-season-shortcuts-title">Explorar por Temporada</h3>
                                <div className="hm-season-links">
                                    <Link to="/temporadas/primavera" className="hm-season-link" style={{ '--season-primary': '#e91e7a' }}>
                                        <div className="hm-season-link-label">
                                            <span className="hm-season-link-emoji">🌸</span>
                                            <span className="hm-season-link-name">Primavera — Cerezos en Flor</span>
                                        </div>
                                        <span className="hm-season-link-arrow">→</span>
                                    </Link>
                                    
                                    <Link to="/temporadas/verano" className="hm-season-link" style={{ '--season-primary': '#2d6a4f' }}>
                                        <div className="hm-season-link-label">
                                            <span className="hm-season-link-emoji">☀️</span>
                                            <span className="hm-season-link-name">Verano — Festivales y Hanabi</span>
                                        </div>
                                        <span className="hm-season-link-arrow">→</span>
                                    </Link>
                                    
                                    <Link to="/temporadas/otono" className="hm-season-link" style={{ '--season-primary': '#c44900' }}>
                                        <div className="hm-season-link-label">
                                            <span className="hm-season-link-emoji">🍁</span>
                                            <span className="hm-season-link-name">Otoño — Momiji y Templos Dorados</span>
                                        </div>
                                        <span className="hm-season-link-arrow">→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 2. SEASONS EXPLORER (¿Cuándo Viajar?) ===== */}
            <section className="seasons-section" id="blog" style={{ backgroundColor: '#f5f0e8' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">¿Cuándo Viajar?</span>
                        <h2 className="section-title">Cada estación tiene su <span className="text-accent">magia</span></h2>
                        <p className="section-subtitle">{typeof window !== 'undefined' && window.innerWidth <= 768 ? 'Tocá una estación para descubrir lo que te espera.' : 'Pasá el cursor sobre una estación para descubrir lo que te espera.'}</p>
                    </div>
                    <div className="seasons-panels" data-animate="fade-up">
                        {[
                            {
                                season: 'Primavera',
                                emoji: '🌸',
                                months: '16 Mar — 15 Abr',
                                temp: '10°C — 20°C',
                                photo: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=1000&fit=crop',
                                color: '#f8b4c8',
                                link: '/temporadas/primavera',
                                highlights: ['Sakura (Cerezos en flor)', 'Festivales de primavera', 'Clima perfecto para caminar'],
                            },
                            {
                                season: 'Verano',
                                emoji: '☀️',
                                months: '16 Abr — 31 Ago',
                                temp: '25°C — 35°C',
                                photo: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=1000&fit=crop',
                                color: '#f5a623',
                                link: '/temporadas/verano',
                                highlights: ['Matsuri (Festivales)', 'Fuegos artificiales Hanabi', 'Playas de Okinawa'],
                            },
                            {
                                season: 'Otoño',
                                emoji: '🍂',
                                months: '1 Sep — 15 Mar',
                                temp: '10°C — 20°C',
                                photo: '/otono-japan.jpg',
                                color: '#d4602a',
                                link: '/temporadas/otono',
                                highlights: ['Momiji (Hojas rojas)', 'Templos en tonos dorados', 'Gastronomía otoñal'],
                            },
                            {
                                season: 'Invierno',
                                emoji: '❄️',
                                months: 'Diciembre — Febrero',
                                temp: '-2°C — 10°C',
                                photo: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=1000&fit=crop',
                                color: '#7bb8d9',
                                link: '/temporadas/invierno',
                                highlights: ['Onsen (Aguas termales)', 'Monos de nieve', 'Iluminaciones navideñas'],
                            },
                        ].map((s, i) => (
                            <div className="season-panel" key={i} style={{ '--accent': s.color }}>
                                <img src={s.photo} alt={s.season} className="season-photo" loading="lazy" />
                                <div className="season-overlay" />
                                <div className="season-label">
                                    <span className="season-emoji">{s.emoji}</span>
                                    <h3 className="season-name">{s.season}</h3>
                                </div>
                                <div className="season-details">
                                    <span className="season-temp">{s.temp}</span>
                                    <ul className="season-highlights">
                                        {s.highlights.map((h, j) => <li key={j}>{h}</li>)}
                                    </ul>
                                    <Link to={s.link} className="season-cta">
                                        Ver viajes →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 3. HORIZONTAL DAY JOURNEY (Un día con RutaXAsia) ===== */}
            <section className="hscroll-wrapper" ref={hScrollRef}>
                <div className="hscroll-sticky">
                    <div className="hscroll-track" ref={hTrackRef}>
                        <div className="dj-title-panel">
                            <div className="dj-title-img-container">
                                <img src={JOURNEY_TITLE_IMG} alt="Un día en Asia" className="dj-title-img" />
                            </div>
                            <h2 className="dj-title-text dj-title-text--behind">Un día con</h2>
                            <h2 className="dj-title-text dj-title-text--front">Un día con</h2>
                            <h2 className="dj-title-text dj-title-text--bottom dj-title-text--behind">RutaXAsia</h2>
                            <h2 className="dj-title-text dj-title-text--bottom dj-title-text--front">RutaXAsia</h2>
                        </div>

                        {/* SVG #1: Torii Gate */}
                        <div className="dj-svg-wrap dj-svg-1">
                            <svg viewBox="0 0 400 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path ref={el => djSvgPaths.current[0] = el} d="M80 440 L80 120 M320 440 L320 120 M50 120 C50 100 80 60 200 50 C320 60 350 100 350 120 L50 120 M60 140 L340 140 M120 140 L120 440 M280 140 L280 440 M40 50 C40 30 120 10 200 10 C280 10 360 30 360 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Day Journey Item 0 */}
                        <div className="dj-content-group">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[0].layout}`}>
                                <div className="dj-item-img-wrap">
                                    <img src={DAY_JOURNEY[0].image} alt={DAY_JOURNEY[0].activity} className="dj-item-img" loading="lazy" />
                                    <div className="dj-reveal-mask" />
                                </div>
                                <div className="dj-item-content">
                                    <div className="dj-time-row">
                                        <span className="dj-time">{DAY_JOURNEY[0].time}</span>
                                        <span className="dj-time-line" />
                                        <span className="dj-activity">{DAY_JOURNEY[0].activity}</span>
                                    </div>
                                    <h2 className="dj-heading">{DAY_JOURNEY[0].heading}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Day Journey Item 1 */}
                        <div className="dj-content-group dj-content-group--vertical">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[1].layout}`}>
                                <div className="dj-item-img-wrap">
                                    <img src={DAY_JOURNEY[1].image} alt={DAY_JOURNEY[1].activity} className="dj-item-img" loading="lazy" />
                                    <div className="dj-reveal-mask" />
                                </div>
                                <div className="dj-item-content">
                                    <div className="dj-time-row">
                                        <span className="dj-time">{DAY_JOURNEY[1].time}</span>
                                        <span className="dj-time-line" />
                                        <span className="dj-activity">{DAY_JOURNEY[1].activity}</span>
                                    </div>
                                    <h2 className="dj-heading">{DAY_JOURNEY[1].heading}</h2>
                                </div>
                            </div>
                        </div>

                        {/* SVG #2: Sakura Branch */}
                        <div className="dj-svg-wrap dj-svg-2">
                            <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path ref={el => djSvgPaths.current[1] = el} d="M10 380 C60 350 130 280 200 220 C270 160 320 130 400 100 C440 85 470 60 490 30 M200 220 C190 190 210 160 230 170 C250 180 230 210 200 220 M200 220 C170 210 160 180 180 165 C200 150 215 175 200 220 M300 160 C290 130 310 100 330 110 C350 120 330 150 300 160 M300 160 C270 150 260 120 280 105 C300 90 315 115 300 160 M400 100 C390 70 410 40 430 50 C450 60 430 90 400 100 M400 100 C370 90 360 60 380 45 C400 30 415 55 400 100 M130 300 C120 270 140 240 160 250 C180 260 160 290 130 300 M130 300 C100 290 90 260 110 245 C130 230 145 255 130 300" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Day Journey Item 2 */}
                        <div className="dj-content-group">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[2].layout}`}>
                                <div className="dj-item-img-wrap">
                                    <img src={DAY_JOURNEY[2].image} alt={DAY_JOURNEY[2].activity} className="dj-item-img" loading="lazy" />
                                    <div className="dj-reveal-mask" />
                                </div>
                                <div className="dj-item-content">
                                    <div className="dj-time-row">
                                        <span className="dj-time">{DAY_JOURNEY[2].time}</span>
                                        <span className="dj-time-line" />
                                        <span className="dj-activity">{DAY_JOURNEY[2].activity}</span>
                                    </div>
                                    <h2 className="dj-heading">{DAY_JOURNEY[2].heading}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Day Journey Item 3 */}
                        <div className="dj-content-group dj-content-group--vertical">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[3].layout}`}>
                                <div className="dj-item-img-wrap">
                                    <img src={DAY_JOURNEY[3].image} alt={DAY_JOURNEY[3].activity} className="dj-item-img" loading="lazy" />
                                    <div className="dj-reveal-mask" />
                                </div>
                                <div className="dj-item-content">
                                    <div className="dj-time-row">
                                        <span className="dj-time">{DAY_JOURNEY[3].time}</span>
                                        <span className="dj-time-line" />
                                        <span className="dj-activity">{DAY_JOURNEY[3].activity}</span>
                                    </div>
                                    <h2 className="dj-heading">{DAY_JOURNEY[3].heading}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Day Journey Item 4 */}
                        <div className="dj-content-group dj-content-group--vertical">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[4].layout}`}>
                                <div className="dj-item-img-wrap">
                                    <img src={DAY_JOURNEY[4].image} alt={DAY_JOURNEY[4].activity} className="dj-item-img" loading="lazy" />
                                    <div className="dj-reveal-mask" />
                                </div>
                                <div className="dj-item-content">
                                    <div className="dj-time-row">
                                        <span className="dj-time">{DAY_JOURNEY[4].time}</span>
                                        <span className="dj-time-line" />
                                        <span className="dj-activity">{DAY_JOURNEY[4].activity}</span>
                                    </div>
                                    <h2 className="dj-heading">{DAY_JOURNEY[4].heading}</h2>
                                </div>
                            </div>
                        </div>

                        {/* SVG #3: Japanese Fan */}
                        <div className="dj-svg-wrap dj-svg-3">
                            <svg viewBox="0 0 450 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path ref={el => djSvgPaths.current[2] = el} d="M225 380 L225 200 M225 200 C225 200 60 50 40 30 M225 200 C225 200 100 40 90 20 M225 200 C225 200 150 30 150 10 M225 200 C225 200 200 25 210 10 M225 200 C225 200 250 25 240 10 M225 200 C225 200 300 30 300 10 M225 200 C225 200 350 40 360 20 M225 200 C225 200 390 50 410 30 M40 30 C80 10 150 0 225 0 C300 0 370 10 410 30 M40 30 C60 60 130 100 225 120 C320 100 390 60 410 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* CTA panel */}
                        <div className="dj-cta-panel">
                            <span className="dj-cta-tag">Empieza tu aventura</span>
                            <h2 className="dj-cta-heading">Diseñemos tu viaje perfecto a Asia desde {cityName}. Habla hoy con nuestros expertos.</h2>
                            <a
                                href={`${whatsappUrl}SW-Hola%20quiero%20cotizar%20un%20viaje%20a%20Asia%20desde%20${encodeURIComponent(cityName)}`}
                                className="btn btn-primary dj-cta-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Cotizar mi Viaje →
                            </a>
                        </div>
                    </div>

                    <div className="hscroll-section-progress">
                        <div className="hscroll-section-fill" ref={hScrollProgressRef} />
                    </div>
                </div>
            </section>

            {/* ===== 4. PRÓXIMAS SALIDAS (Boarding Pass Cards) ===== */}
            <section className="departures-section" id="proximos-viajes">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Próximas Salidas</span>
                        <h2 className="section-title">Viajes que están por <span className="text-accent">despegar</span></h2>
                        <p className="section-subtitle">Grupos reducidos, experiencias completas. Aparta tu lugar.</p>
                    </div>
                    <div className="bp-grid">
                        {TRIPS.map((trip, i) => (
                            <div className="bp-card" key={trip.id} data-animate="fade-up" data-delay={String(i * 120)}>
                                <div className="bp-card-photo">
                                    <img src={trip.image} alt={trip.title} loading="lazy" />
                                    <div className="bp-card-photo-overlay" />
                                    {trip.badge && <div className="bp-badge">{trip.badge}</div>}
                                </div>

                                <div className="bp-tear">
                                    <div className="bp-tear-circle bp-tear-circle--top" />
                                    <div className="bp-tear-line" />
                                    <div className="bp-tear-circle bp-tear-circle--bottom" />
                                </div>

                                <div className="bp-card-info">
                                    <div className="bp-card-header">
                                        <span className="bp-card-label">DESTINO</span>
                                        <span className="bp-card-flags">{trip.flagIcons.map(f => <img key={f.code} src={`https://flagcdn.com/w40/${f.code}.png`} alt={f.name} className="bp-flag-img" />)}</span>
                                    </div>
                                    <h3 className="bp-card-title">{trip.title}</h3>
                                    <p className="bp-card-excerpt">{trip.excerpt}</p>

                                    <div className="bp-card-details">
                                        <div className="bp-detail">
                                            <span className="bp-detail-label">FECHA</span>
                                            <span className="bp-detail-value">{trip.date}</span>
                                        </div>
                                        <div className="bp-detail">
                                            <span className="bp-detail-label">DURACIÓN</span>
                                            <span className="bp-detail-value">{trip.duration}</span>
                                        </div>
                                        <div className="bp-detail">
                                            <span className="bp-detail-label">GRUPO</span>
                                            <span className="bp-detail-value">Máx. 20</span>
                                        </div>
                                    </div>

                                    <div className="bp-card-includes">
                                        {trip.includes.map((inc, j) => <span key={j} className="bp-include-tag">{inc}</span>)}
                                    </div>

                                    <div className="bp-card-actions">
                                        <a
                                            href={`${whatsappUrl}SW-Hola%20quiero%20cotizar%20${encodeURIComponent(trip.title)}%20desde%20${encodeURIComponent(cityName)}`}
                                            className="btn btn-primary bp-btn"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Cotizar Ahora
                                        </a>
                                        <Link to={`/tours/${trip.id}`} className="btn btn-outline bp-btn">
                                            Ver Itinerario
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 5. WHY US (Swiss Grid) ===== */}
            <section className="why-us" id="nosotros">
                <div className="container">
                    <div className="wu-layout">
                        <div className="wu-left" data-animate="fade-right">
                            <span className="section-tag">¿Por qué nosotros?</span>
                            <h2 className="wu-title">No somos una agencia más.<br /><span className="text-accent">Somos tu familia viajera.</span></h2>
                            <p className="wu-desc">Juan y Ale fundaron RutaXAsia con una misión: que cada mexicano pueda vivir Asia como ellos lo hicieron. Sin complicaciones, con grupos que se vuelven familia.</p>
                        </div>
                        <div className="wu-right">
                            {[
                                {
                                    title: 'Todo Incluido',
                                    desc: 'Vuelos, hospedaje, transporte, entradas y guía. Solo preocúpate por disfrutar.',
                                    icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 28L4 20l4-2 8 5 8-5 4 2-12 8z" /><path d="M4 20V10l12-8 12 8v10" /><path d="M16 18V2" /><path d="M4 10l12 8 12-8" /></svg>,
                                },
                                {
                                    title: 'Grupos Reducidos',
                                    desc: 'Máximo 20 personas para garantizar una experiencia personalizada y cercana.',
                                    icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="10" r="4" /><circle cx="22" cy="10" r="3" /><path d="M2 26c0-5 4-8 9-8s9 3 9 8" /><path d="M22 18c4 0 8 2.5 8 8" /></svg>,
                                },
                                {
                                    title: 'Experiencias Únicas',
                                    desc: 'Atención personalizada de Juan y Ale, vestir kimono tradicional, ceremonias del té y servicios adicionales exclusivos.',
                                    icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2l3.5 7.5L28 11l-6 5.5 1.5 8.5L16 21l-7.5 4 1.5-8.5L4 11l8.5-1.5z" /></svg>,
                                },
                                {
                                    title: 'Asistencia Presencial',
                                    desc: 'Antes y durante tu viaje, Juan y Ale están contigo presencialmente. Siempre disponibles por WhatsApp.',
                                    icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="10" r="5" /><path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" /><circle cx="24" cy="8" r="2" fill="currentColor" /><path d="M24 10v2" /></svg>,
                                },
                            ].map((f, i) => (
                                <div className="wu-card" key={i} data-animate="fade-up" data-delay={String(i * 100)}>
                                    <span className="wu-card-number">{String(i + 1).padStart(2, '0')}</span>
                                    <div className="wu-card-icon">{f.icon}</div>
                                    <h3 className="wu-card-title">{f.title}</h3>
                                    <p className="wu-card-desc">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 6. TESTIMONIALS (Comunidad Viajera) ===== */}
            <section className="polaroid-section" id="comunidad" style={{ backgroundColor: '#0c0e16' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>Comunidad Viajera</span>
                        <h2 className="section-title" style={{ color: '#fff' }}>Momentos que hablan por <span style={{ color: 'var(--color-primary)' }}>sí solos</span></h2>
                        <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.5)' }}>Cada foto es una historia. Pasá el cursor para conocerla.</p>
                    </div>
                    <div className="polaroid-grid">
                        {testimonials.map((t, i) => (
                            <div
                                className="polaroid-card"
                                key={i}
                                style={{ '--rotate': `${t.rotate}deg` }}
                                data-animate="fade-up"
                                data-delay={String(i * 80)}
                            >
                                <div className="polaroid-photo">
                                    <img src={t.photo} alt={`${t.name} en ${t.location}`} loading="lazy" />
                                    <div className="polaroid-overlay">
                                        <div className="polaroid-stars">★★★★★</div>
                                        <p className="polaroid-quote">"{t.text}"</p>
                                    </div>
                                </div>
                                <div className="polaroid-caption">
                                    <span className="polaroid-location">{t.location}</span>
                                    <div className="polaroid-author">
                                        <strong>{t.name}</strong>
                                        <span>{t.trip}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 7. CTA FINAL (Último Paso) ===== */}
            <section className="cta-bp-section" style={{ backgroundColor: '#0c0e16' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>Último Paso</span>
                        <h2 className="section-title" style={{ color: '#fff', fontSize: '2.4rem' }}>Tu asiento está reservado.<br /><span style={{ color: 'var(--color-primary)' }}>Solo falta tu nombre.</span></h2>
                        <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.5)' }}>Escríbenos por WhatsApp y en menos de 2 horas tenés tu cotización personalizada desde {cityName}.</p>
                    </div>

                    <div className="bp-ticket" data-animate="fade-up">
                        <div className="bp-ticket-left">
                            <div className="bp-ticket-header">
                                <span className="bp-airline">RUTAXASIA AIRLINES</span>
                                <span className="bp-urgency">
                                    <span className="bp-urgency-dot" />
                                    Últimos 8 lugares
                                </span>
                            </div>

                            <div className="bp-ticket-route">
                                <div className="bp-route-point">
                                    <span className="bp-route-code">{cityName.substring(0, 3).toUpperCase()}</span>
                                    <span className="bp-route-city">{cityName}</span>
                                </div>
                                <div className="bp-route-line">
                                    <span className="bp-route-plane">✈</span>
                                </div>
                                <div className="bp-route-point">
                                    <span className="bp-route-code">TYO</span>
                                    <span className="bp-route-city">Japón & Corea</span>
                                </div>
                            </div>

                            <div className="bp-ticket-fields">
                                <div className="bp-field bp-field--highlight">
                                    <span className="bp-field-label">PASAJERO</span>
                                    <span className="bp-field-value bp-field-blink">TU NOMBRE<span className="bp-cursor">|</span></span>
                                </div>
                                <div className="bp-field">
                                    <span className="bp-field-label">FECHA</span>
                                    <span className="bp-field-value">2026 — 2027</span>
                                </div>
                                <div className="bp-field">
                                    <span className="bp-field-label">GATE</span>
                                    <span className="bp-field-value">RXA</span>
                                </div>
                                <div className="bp-field">
                                    <span className="bp-field-label">CLASE</span>
                                    <span className="bp-field-value">FIRST ★</span>
                                </div>
                            </div>

                            <div className="bp-barcode">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <span key={i} className="bp-barcode-line" style={{ height: `${Math.random() * 20 + 10}px` }} />
                                ))}
                            </div>
                        </div>

                        <div className="bp-tear-line">
                            <div className="bp-tear-circle bp-tear-circle--top" />
                            <div className="bp-tear-circle bp-tear-circle--bottom" />
                        </div>

                        <div className="bp-ticket-right">
                            <div className="bp-stamps">
                                <img src="https://flagcdn.com/w40/jp.png" alt="Japón" className="bp-stamp-flag" style={{ transform: 'rotate(-8deg)' }} />
                                <img src="https://flagcdn.com/w40/kr.png" alt="Corea" className="bp-stamp-flag" style={{ transform: 'rotate(6deg)' }} />
                            </div>
                            <div className="bp-ticket-cta">
                                <p className="bp-cta-headline">¿Listo para despegar?</p>
                                <a
                                    href={`${whatsappUrl}SW-Hola%20quiero%20reservar%20mi%20lugar%20para%20viajar%20a%20Asia%20desde%20${encodeURIComponent(cityName)}%20🎫✈️`}
                                    className="bp-cta-button bp-cta-pulse"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <WhatsAppIcon />
                                    <span>¡Reservar mi lugar!</span>
                                </a>
                                <p className="bp-cta-sub">✓ Sin compromiso · ✓ Respuesta en &lt;2hs</p>
                            </div>
                        </div>
                    </div>

                    <div className="bp-secondary" data-animate="fade-up">
                        <div className="bp-secondary-options">
                            <a href="tel:+525657929121" className="bp-phone-link">📞 Prefiero llamar</a>
                            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                            <a href="mailto:reservas@rutaxasia.com" className="bp-phone-link">✉️ Enviar email</a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

/* WhatsApp SVG Icon */
function WhatsAppIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    )
}

export default LandingHome
