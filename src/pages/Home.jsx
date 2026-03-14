import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'


const WHATSAPP_BASE = 'https://wa.me/525513610083?text='

/* ===== DATA ===== */
const TRIPS = [
    {
        id: 'sakura-2026',
        title: 'Sakura I 2026',
        heroTagline: 'Japón & Corea',
        heroHeading: 'JAPÓN',
        heroSubheading: '& Corea',
        excerpt: 'Cerezos en flor, templos milenarios y la vibrante cultura coreana en un viaje inolvidable de 14 días. Vuelos, hospedaje y guía incluidos.',
        date: '17 – 30 Mayo 2026',
        duration: '14 días',
        flagIcons: [{ code: 'jp', name: 'Japón' }, { code: 'kr', name: 'Corea' }],
        badge: '⭐ Más Popular',
        image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=1080&fit=crop&q=80',
        gallery: [
            { title: 'Fushimi Inari, Kyoto', img: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=500&fit=crop' },
            { title: 'Shibuya, Tokyo', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=500&fit=crop' },
            { title: 'Sakura Park', img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=500&fit=crop' },
        ],
        includes: ['✈️ Vuelos desde CDMX', '🏨 Hospedaje incluido', '🚄 Transporte interno', '🎌 Guía bilingüe'],
        seoTitle: 'Sakura I 2026 - Viaje Japón y Corea desde México',
        seoExcerpt: 'Viaje grupal Japón y Corea mayo 2026. Incluye vuelos, hospedaje, transporte y guía. Agencia RutaXAsia.',
    },
    {
        id: 'verano-japon-2026',
        title: 'Verano Japón 2026',
        heroTagline: 'Japón',
        heroHeading: 'TOKYO',
        heroSubheading: '& Osaka',
        excerpt: 'Festivales de verano, fuegos artificiales y la cultura japonesa en su máximo esplendor. 12 días de aventura pura por las ciudades más icónicas.',
        date: 'Julio 2026',
        duration: '12 días',
        flagIcons: [{ code: 'jp', name: 'Japón' }],
        image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&h=1080&fit=crop&q=80',
        gallery: [
            { title: 'Templo Senso-ji', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=500&fit=crop' },
            { title: 'Castillo Osaka', img: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=400&h=500&fit=crop' },
            { title: 'Monte Fuji', img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=500&fit=crop' },
        ],
        includes: ['✈️ Vuelos desde CDMX', '🏨 Hospedaje incluido', '🚄 JR Pass incluido', '🎌 Guía bilingüe'],
        seoTitle: 'Verano Japón 2026 - Tour completo por Japón',
        seoExcerpt: 'Tour de verano por Japón julio 2026. Festivales, gastronomía y cultura. Agencia RutaXAsia México.',
    },
    {
        id: 'corea-2026',
        title: 'Corea 2026',
        heroTagline: 'Corea del Sur',
        heroHeading: 'COREA',
        heroSubheading: 'del Sur',
        excerpt: 'K-pop, palacios, street food y tecnología. Descubre Seúl, Busan y la isla de Jeju en 10 días llenos de cultura y modernidad.',
        date: 'Octubre 2026',
        duration: '10 días',
        flagIcons: [{ code: 'kr', name: 'Corea' }],
        image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=400&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1920&h=1080&fit=crop&q=80',
        gallery: [
            { title: 'Gyeongbokgung, Seúl', img: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=500&fit=crop' },
            { title: 'Busan Beaches', img: 'https://cdn.sanity.io/images/nxpteyfv/goguides/84fccb3ef64ca065111d09bd75591078ccbd38ea-1600x1066.jpg' },
            { title: 'Nami Island', img: 'https://images.unsplash.com/photo-1596276020587-8044fe049813?w=400&h=500&fit=crop' },
        ],
        includes: ['✈️ Vuelos desde CDMX', '🏨 Hospedaje incluido', '🚆 Transporte KTX', '🇰🇷 Guía bilingüe'],
        seoTitle: 'Corea 2026 - Viaje grupal Seúl Busan Jeju',
        seoExcerpt: 'Viaje grupal a Corea del Sur octubre 2026. Seúl, Busan, Jeju. Todo incluido. Agencia RutaXAsia México.',
    },
    {
        id: 'otono-japon-2026',
        title: 'Otoño en Japón 2026',
        heroTagline: 'Japón',
        heroHeading: 'KYOTO',
        heroSubheading: '& Nara',
        excerpt: 'Los colores del momiji tiñen Japón de rojo y dorado. Una experiencia visual única con ryokan y onsen incluidos durante 12 días.',
        date: 'Noviembre 2026',
        duration: '12 días',
        flagIcons: [{ code: 'jp', name: 'Japón' }],
        badge: '🍁 Nuevo',
        image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&h=1080&fit=crop&q=80',
        gallery: [
            { title: 'Arashiyama Bamboo', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=500&fit=crop' },
            { title: 'Kinkaku-ji', img: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400&h=500&fit=crop' },
            { title: 'Momiji Autumn', img: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400&h=500&fit=crop' },
        ],
        includes: ['✈️ Vuelos desde CDMX', '🏨 Ryokan incluido', '🚄 JR Pass incluido', '♨️ Onsen incluido'],
        seoTitle: 'Otoño en Japón 2026 - Momiji Tour',
        seoExcerpt: 'Viaje otoño Japón noviembre 2026. Colores del momiji, ryokan y onsen incluidos. Agencia RutaXAsia.',
    },
]

// Deterministic star field (no re-render flicker)
const STARS = Array.from({ length: 65 }, (_, i) => {
    const t = Math.imul(i + 1, 2654435761) >>> 0
    return {
        x: (t % 1200),
        y: ((t >>> 11) % 700),
        r: ((t >>> 22) % 12) / 10 + 0.4,
        o: ((t >>> 5) % 28) / 100 + 0.04,
    }
})

/* ===== TIMELINE DATA ===== */
const TIMELINE_EVENTS = [
    {
        year: '2018',
        title: 'El primer viaje que lo cambió todo',
        desc: 'Santiago y Ale llegan a Japón por primera vez. Un país que los enamoró tanto que decidieron no solo volver, sino dedicar su vida a compartirlo.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop&q=80',
        side: 'left',
    },
    {
        year: '2019',
        title: 'Explorando Corea',
        desc: 'Seúl, Busan, los templos ocultos... Corea del Sur entra en la ruta. Ahora el sueño es claro: crear la mejor experiencia posible para viajeros latinos en Asia.',
        image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=400&fit=crop&q=80',
        side: 'right',
    },
    {
        year: '2020',
        title: 'Nace la idea',
        desc: 'En plena pandemia, mientras el mundo se detuvo, Santiago y Ale planearon cada detalle. Rutas, hospedajes, experiencias únicas. RutaXAsia empezaba a tomar forma.',
        image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop&q=80',
        side: 'left',
    },
    {
        year: '2022',
        title: 'RutaXAsia despega 🚀',
        desc: 'Se abren las fronteras y RutaXAsia lleva a su primer grupo a Japón. La experiencia supera todas las expectativas. Los viajeros lloran de emoción en Kyoto.',
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=400&fit=crop&q=80',
        side: 'right',
    },
    {
        year: '2023',
        title: '+300 viajeros felices',
        desc: 'Más de 300 personas viajaron con nosotros. 5 estrellas en cada reseña. La comunidad crece y los viajeros repiten.',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&q=80',
        side: 'left',
    },
    {
        year: '2024',
        title: 'Nuevos destinos, misma pasión',
        desc: 'Se suman rutas temáticas: Sakura, Verano, Otoño. Cada temporada, una experiencia completamente diferente. Japón y Corea como nunca los habías visto.',
        image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600&h=400&fit=crop&q=80',
        side: 'right',
    },
    {
        year: '2026',
        title: 'Tu viaje empieza aquí',
        desc: 'Hoy somos la agencia líder en México para viajes grupales a Japón y Corea. ¿Listo para ser parte de la historia?',
        image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&h=400&fit=crop&q=80',
        side: 'left',
    },
]

/* ===== DAY JOURNEY DATA (Insider-Madeira style) ===== */
const JOURNEY_TITLE_IMG = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&h=1600&fit=crop&q=80'

const DAY_JOURNEY = [
    {
        time: '06:00 AM',
        activity: 'Amanecer en el templo',
        heading: 'Comienza tu día con una ceremonia privada en un templo milenario de Kyoto',
        image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1600&h=1000&fit=crop&q=80',
        type: 'image',
        layout: 'horizontal',
    },
    {
        time: '10:00 AM',
        activity: 'Mercado de Nishiki',
        heading: 'Explora el mercado más famoso de Japón y prueba sabores que no sabías que existían',
        image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1000&h=1400&fit=crop&q=80',
        type: 'image',
        layout: 'vertical',
    },
    {
        time: '04:00 PM',
        activity: 'K-BBQ en Seúl',
        heading: 'Saborea la esencia de Corea con una experiencia gastronómica inolvidable',
        image: 'https://images.unsplash.com/photo-1583032015879-e5022cb87c3b?w=1600&h=1000&fit=crop&q=80',
        type: 'image',
        layout: 'horizontal',
    },
    {
        time: '08:00 PM',
        activity: 'Tokyo de noche',
        heading: 'Piérdete en la magia de las calles de neón de Shinjuku y Shibuya',
        image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1000&h=1400&fit=crop&q=80',
        type: 'image',
        layout: 'vertical',
    },
]

const TESTIMONIALS = [
    { name: 'María Rodríguez', trip: 'Sakura 2025', location: 'Fushimi Inari, Kyoto', initials: 'MR', text: 'Fue la experiencia más increíble de mi vida. Santiago y Ale nos hicieron sentir como en familia.', photo: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=500&fit=crop', rotate: -3 },
    { name: 'Carlos López', trip: 'Verano 2024', location: 'Shibuya, Tokyo', initials: 'CL', text: 'Ya llevo dos viajes con RutaXAsia y estoy planeando el tercero. ¡100% recomendado!', photo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=500&fit=crop', rotate: 2 },
    { name: 'Ana García', trip: 'Otoño 2025', location: 'Arashiyama, Kyoto', initials: 'AG', text: 'Tenía miedo de viajar tan lejos sola, pero el grupo fue increíble. Hice amigos para toda la vida.', photo: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400&h=500&fit=crop', rotate: -1.5 },
    { name: 'Diego Martínez', trip: 'Corea 2025', location: 'Bukchon, Seúl', initials: 'DM', text: 'La organización es de primer nivel. Cada día fue una sorpresa nueva. Corea superó todas mis expectativas.', photo: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=500&fit=crop', rotate: 3 },
    { name: 'Lucía Fernández', trip: 'Sakura 2024', location: 'Monte Fuji', initials: 'LF', text: 'Ver el Monte Fuji con los cerezos en flor fue un sueño. Gracias RutaXAsia por hacerlo posible.', photo: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=500&fit=crop', rotate: -2.5 },
    { name: 'Roberto Sánchez', trip: 'Verano 2025', location: 'Dotonbori, Osaka', initials: 'RS', text: 'La comida, la cultura, la gente... todo fue perfecto. Osaka de noche es otra experiencia.', photo: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=500&fit=crop', rotate: 1.5 },
]

/* ===== COMPONENT ===== */
function Home() {
    const [activeSlide, setActiveSlide] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const timerRef = useRef(null)
    const statsAnimated = useRef(false)
    const hScrollRef = useRef(null)
    const hTrackRef = useRef(null)
    const hScrollProgressRef = useRef(null)
    const djSvgPaths = useRef([])
    const timelineRef = useRef(null)
    const timelineLineRef = useRef(null)

    const goToSlide = useCallback((index) => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setActiveSlide(index)
        setTimeout(() => setIsTransitioning(false), 800)
    }, [isTransitioning])

    const nextSlide = useCallback(() => {
        goToSlide((activeSlide + 1) % TRIPS.length)
    }, [activeSlide, goToSlide])

    const prevSlide = useCallback(() => {
        goToSlide((activeSlide - 1 + TRIPS.length) % TRIPS.length)
    }, [activeSlide, goToSlide])

    // Auto-advance every 6 seconds
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setIsTransitioning(true)
            setActiveSlide(prev => (prev + 1) % TRIPS.length)
            setTimeout(() => setIsTransitioning(false), 800)
        }, 6000)
        return () => clearInterval(timerRef.current)
    }, [])

    // Reset timer on manual interaction
    const handleManualNav = useCallback((index) => {
        clearInterval(timerRef.current)
        goToSlide(index)
        timerRef.current = setInterval(() => {
            setIsTransitioning(true)
            setActiveSlide(prev => (prev + 1) % TRIPS.length)
            setTimeout(() => setIsTransitioning(false), 800)
        }, 6000)
    }, [goToSlide])

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

    // Counter animation for stats
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !statsAnimated.current) {
                        statsAnimated.current = true
                        document.querySelectorAll('[data-count]').forEach(el => {
                            const target = parseInt(el.dataset.count, 10)
                            const duration = 2000
                            const start = performance.now()
                            const animate = (now) => {
                                const progress = Math.min((now - start) / duration, 1)
                                const eased = 1 - Math.pow(1 - progress, 3)
                                el.textContent = Math.floor(eased * target)
                                if (progress < 1) requestAnimationFrame(animate)
                            }
                            requestAnimationFrame(animate)
                        })
                    }
                })
            },
            { threshold: 0.5 }
        )
        const statsEl = document.querySelector('.hero-stats')
        if (statsEl) observer.observe(statsEl)
        return () => observer.disconnect()
    }, [])

    // Preload hero images
    useEffect(() => {
        TRIPS.forEach(trip => {
            const img = new Image()
            img.src = trip.heroImage
        })
    }, [])

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
            // Update progress bar
            if (hScrollProgressRef.current) {
                hScrollProgressRef.current.style.width = `${progress * 100}%`
            }
            // Trigger SVG draw when entering viewport
            track.querySelectorAll('.dj-svg-wrap:not(.dj-svg-animate)').forEach(svgWrap => {
                const svgRect = svgWrap.getBoundingClientRect()
                if (svgRect.left < window.innerWidth) {
                    svgWrap.classList.add('dj-svg-animate')
                }
            })
            // Reveal images as they enter viewport
            track.querySelectorAll('.dj-reveal-mask:not(.dj-revealed)').forEach(mask => {
                const r = mask.getBoundingClientRect()
                if (r.left < window.innerWidth * 0.85) {
                    mask.classList.add('dj-revealed')
                }
            })
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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

    const currentTrip = TRIPS[activeSlide]

    return (
        <>
            <Helmet>
                <title>RutaXAsia | Agencia #1 de Viajes a Japón desde México</title>
                <meta name="description" content="RutaXAsia, agencia #1 de viajes a Japón desde México. Encuentra viaje a Japón desde México, viajes a Corea del Sur, tours a Japón y los mejores precios a Japón." />
            </Helmet>

            {/* ===== HERO CAROUSEL ===== */}
            <section className="hero" id="hero">
                {/* Background images & overlay */}
                <div className="hero-backgrounds">
                    {TRIPS.map((trip, i) => (
                        <div className={`hero-bg${i === activeSlide ? ' hero-bg--active' : ''}`} key={trip.id}>
                            <img src={trip.heroImage} alt={trip.heroHeading} />
                        </div>
                    ))}
                    {/* Stronger overlay for readability on left and bottom */}
                    <div className="hero-overlay" />
                </div>

                {/* Left vertical pagination */}
                <div className="hero-vertical-nav" aria-hidden="true">
                    <div className="hero-v-top">
                        <span className="hero-v-dot">{activeSlide + 1}</span>
                    </div>
                    <div className="hero-v-line"></div>
                    <div className="hero-v-bottom">
                        <span className="hero-v-num">{String(activeSlide + 1).padStart(2, '0')}</span>
                        <span className="hero-v-num hero-v-total">/ 0{TRIPS.length}</span>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="hero-layout">
                    {/* Main Text Content */}
                    <div className="hero-main-content" key={`text-${currentTrip.id}`}>
                        {/* Small country label above title */}
                        <div className="hero-destination-label">
                            <span className="hero-dest-line" />
                            <span>{currentTrip.flags} {currentTrip.heroTagline}</span>
                        </div>

                        <h1 className="hero-title">{currentTrip.heroHeading.toUpperCase()}</h1>

                        {currentTrip.heroSubheading && (
                            <span className="hero-title-sub">{currentTrip.heroSubheading}</span>
                        )}

                        <p className="hero-excerpt">{currentTrip.excerpt}</p>

                        {/* Trip meta chips */}
                        <div className="hero-meta-chips">
                            <span className="hero-chip">
                                <span className="hero-chip-icon">📅</span>
                                {currentTrip.date}
                            </span>
                            <span className="hero-chip">
                                <span className="hero-chip-icon">⏱️</span>
                                {currentTrip.duration}
                            </span>
                            {currentTrip.badge && (
                                <span className="hero-chip hero-chip--highlight">{currentTrip.badge}</span>
                            )}
                        </div>

                        <a
                            href={`${WHATSAPP_BASE}SW%20Hola%20quiero%20cotizar%20${encodeURIComponent(currentTrip.title)}`}
                            className="btn btn-primary hero-btn-explore"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Explorar <span className="hero-btn-arrow">→</span>
                        </a>
                    </div>

                    {/* Gallery Carousel */}
                    <div className="hero-gallery-wrapper">
                        <div className="hero-gallery" key={`gallery-${currentTrip.id}`}>
                            {currentTrip.gallery.map((item, j) => (
                                <div className="hero-gcard" key={j} style={{ animationDelay: `${j * 0.15}s` }}>
                                    <div className="hero-gcard-header">
                                        <span className="hero-gcard-title">{item.title}</span>
                                        <span className="hero-gcard-stars">⭐⭐⭐⭐⭐</span>
                                    </div>
                                    <div className="hero-gcard-imgbox">
                                        <img src={item.img} alt={item.title} />
                                        <button className="hero-gcard-bookmark" aria-label="Guardar">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Area */}
                <div className="hero-footer">
                    {/* Massive faded next destination */}
                    <div className="hero-next-label">
                        {TRIPS[(activeSlide + 1) % TRIPS.length].heroHeading}
                    </div>

                    {/* Controls */}
                    <div className="hero-controls">
                        <button
                            className="hero-arrow-btn"
                            onClick={() => handleManualNav((activeSlide - 1 + TRIPS.length) % TRIPS.length)}
                            aria-label="Anterior"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button
                            className="hero-arrow-btn"
                            onClick={() => handleManualNav((activeSlide + 1) % TRIPS.length)}
                            aria-label="Siguiente"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="hero-progress">
                        <span className="hero-progress-num">{String(activeSlide + 1).padStart(2, '0')}</span>
                        <div className="hero-progress-track">
                            <div className="hero-progress-fill" style={{ width: `${((activeSlide + 1) / TRIPS.length) * 100}%` }} />
                        </div>
                        <span className="hero-progress-num">{String(TRIPS.length).padStart(2, '0')}</span>
                    </div>
                </div>
            </section>

            {/* ===== HORIZONTAL DAY JOURNEY (Insider-Madeira style) ===== */}
            <section className="hscroll-wrapper" ref={hScrollRef}>
                <div className="hscroll-sticky">
                    <div className="hscroll-track" ref={hTrackRef}>

                        {/* ---- Hero title panel ---- */}
                        <div className="dj-title-panel">
                            <div className="dj-title-img-container">
                                <img src={JOURNEY_TITLE_IMG} alt="Un día en Asia" className="dj-title-img" />
                            </div>
                            <h2 className="dj-title-text dj-title-text--behind">Un día con</h2>
                            <h2 className="dj-title-text dj-title-text--front">Un día con</h2>
                            <h2 className="dj-title-text dj-title-text--bottom dj-title-text--behind">RutaXAsia</h2>
                            <h2 className="dj-title-text dj-title-text--bottom dj-title-text--front">RutaXAsia</h2>
                        </div>

                        {/* ---- SVG #1: Torii Gate ---- */}
                        <div className="dj-svg-wrap dj-svg-1">
                            <svg viewBox="0 0 400 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path ref={el => djSvgPaths.current[0] = el} d="M80 440 L80 120 M320 440 L320 120 M50 120 C50 100 80 60 200 50 C320 60 350 100 350 120 L50 120 M60 140 L340 140 M120 140 L120 440 M280 140 L280 440 M40 50 C40 30 120 10 200 10 C280 10 360 30 360 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* ---- Content block: item 0 (horizontal) + item 1 (vertical) ---- */}
                        <div className="dj-content-group">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[0].layout}`}>
                                <div className="dj-item-img-wrap">
                                    {DAY_JOURNEY[0].type === 'video' ? (
                                        <video src={DAY_JOURNEY[0].video} poster={DAY_JOURNEY[0].image} className="dj-item-img" autoPlay loop muted playsInline />
                                    ) : (
                                        <img src={DAY_JOURNEY[0].image} alt={DAY_JOURNEY[0].activity} className="dj-item-img" loading="lazy" />
                                    )}
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

                        {/* ---- Item 1 (vertical) ---- */}
                        <div className="dj-content-group dj-content-group--vertical">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[1].layout}`}>
                                <div className="dj-item-img-wrap">
                                    {DAY_JOURNEY[1].type === 'video' ? (
                                        <video src={DAY_JOURNEY[1].video} poster={DAY_JOURNEY[1].image} className="dj-item-img" autoPlay loop muted playsInline />
                                    ) : (
                                        <img src={DAY_JOURNEY[1].image} alt={DAY_JOURNEY[1].activity} className="dj-item-img" loading="lazy" />
                                    )}
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

                        {/* ---- SVG #2: Sakura Branch with Blossoms ---- */}
                        <div className="dj-svg-wrap dj-svg-2">
                            <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path ref={el => djSvgPaths.current[1] = el} d="M10 380 C60 350 130 280 200 220 C270 160 320 130 400 100 C440 85 470 60 490 30 M200 220 C190 190 210 160 230 170 C250 180 230 210 200 220 M200 220 C170 210 160 180 180 165 C200 150 215 175 200 220 M300 160 C290 130 310 100 330 110 C350 120 330 150 300 160 M300 160 C270 150 260 120 280 105 C300 90 315 115 300 160 M400 100 C390 70 410 40 430 50 C450 60 430 90 400 100 M400 100 C370 90 360 60 380 45 C400 30 415 55 400 100 M130 300 C120 270 140 240 160 250 C180 260 160 290 130 300 M130 300 C100 290 90 260 110 245 C130 230 145 255 130 300" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* ---- Item 2 (horizontal) ---- */}
                        <div className="dj-content-group">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[2].layout}`}>
                                <div className="dj-item-img-wrap">
                                    {DAY_JOURNEY[2].type === 'video' ? (
                                        <video src={DAY_JOURNEY[2].video} poster={DAY_JOURNEY[2].image} className="dj-item-img" autoPlay loop muted playsInline />
                                    ) : (
                                        <img src={DAY_JOURNEY[2].image} alt={DAY_JOURNEY[2].activity} className="dj-item-img" loading="lazy" />
                                    )}
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

                        {/* ---- Item 3 (vertical) ---- */}
                        <div className="dj-content-group dj-content-group--vertical">
                            <div className={`dj-item dj-item--${DAY_JOURNEY[3].layout}`}>
                                <div className="dj-item-img-wrap">
                                    {DAY_JOURNEY[3].type === 'video' ? (
                                        <video src={DAY_JOURNEY[3].video} poster={DAY_JOURNEY[3].image} className="dj-item-img" autoPlay loop muted playsInline />
                                    ) : (
                                        <img src={DAY_JOURNEY[3].image} alt={DAY_JOURNEY[3].activity} className="dj-item-img" loading="lazy" />
                                    )}
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

                        {/* ---- SVG #3: Japanese Fan (Sensu) ---- */}
                        <div className="dj-svg-wrap dj-svg-3">
                            <svg viewBox="0 0 450 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path ref={el => djSvgPaths.current[2] = el} d="M225 380 L225 200 M225 200 C225 200 60 50 40 30 M225 200 C225 200 100 40 90 20 M225 200 C225 200 150 30 150 10 M225 200 C225 200 200 25 210 10 M225 200 C225 200 250 25 240 10 M225 200 C225 200 300 30 300 10 M225 200 C225 200 350 40 360 20 M225 200 C225 200 390 50 410 30 M40 30 C80 10 150 0 225 0 C300 0 370 10 410 30 M40 30 C60 60 130 100 225 120 C320 100 390 60 410 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* ---- CTA panel ---- */}
                        <div className="dj-cta-panel">
                            <span className="dj-cta-tag">Empieza tu aventura</span>
                            <h2 className="dj-cta-heading">Diseñemos tu viaje perfecto a Asia. Habla hoy con nuestros expertos.</h2>
                            <a
                                href={`${WHATSAPP_BASE}SW%20Hola%20quiero%20cotizar%20un%20viaje%20a%20Asia`}
                                className="btn btn-primary dj-cta-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Cotizar mi Viaje →
                            </a>
                        </div>
                    </div>

                    {/* Thin progress bar at the very bottom */}
                    <div className="hscroll-section-progress">
                        <div className="hscroll-section-fill" ref={hScrollProgressRef} />
                    </div>
                </div>
            </section>

            {/* ===== OUR JOURNEY TIMELINE ===== */}
            <section className="timeline-section" id="nuestra-historia" ref={timelineRef} style={{ backgroundColor: '#f5f0e8' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Nuestra Historia</span>
                        <h2 className="section-title">El viaje que nos trajo <span className="text-accent">hasta aquí</span></h2>
                        <p className="section-subtitle">Cada año sumó una nueva razón para compartir Asia con el mundo.</p>
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
                                data-animate="fade-up"
                                data-delay={String(i * 80)}
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

            {/* ===== PRÓXIMAS SALIDAS (Boarding Pass Cards) ===== */}
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
                                {/* Left: Photo */}
                                <div className="bp-card-photo">
                                    <img src={trip.image} alt={trip.title} loading="lazy" />
                                    <div className="bp-card-photo-overlay" />
                                    {trip.badge && <div className="bp-badge">{trip.badge}</div>}
                                </div>

                                {/* Dashed tear line */}
                                <div className="bp-tear">
                                    <div className="bp-tear-circle bp-tear-circle--top" />
                                    <div className="bp-tear-line" />
                                    <div className="bp-tear-circle bp-tear-circle--bottom" />
                                </div>

                                {/* Right: Ticket info */}
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
                                        <a href={`${WHATSAPP_BASE}SW%20Hola%20quiero%20cotizar%20${encodeURIComponent(trip.title)}`} className="btn btn-primary bp-btn" target="_blank" rel="noopener noreferrer">Cotizar Ahora</a>
                                        <Link to={`/tours/${trip.id}`} className="btn btn-outline bp-btn">Ver Itinerario</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== WHY US (Swiss Grid) ===== */}
            <section className="why-us" id="nosotros">
                <div className="container">
                    <div className="wu-layout">
                        {/* Left: Big title */}
                        <div className="wu-left" data-animate="fade-right">
                            <span className="section-tag">¿Por qué nosotros?</span>
                            <h2 className="wu-title">No somos una agencia más.<br /><span className="text-accent">Somos tu familia viajera.</span></h2>
                            <p className="wu-desc">Santiago y Ale fundaron RutaXAsia con una misión: que cada mexicano pueda vivir Asia como ellos lo hicieron. Sin complicaciones, con grupos que se vuelven familia.</p>
                        </div>

                        {/* Right: 2×2 grid */}
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
                                    desc: 'Ceremonias del té, clases de ramen, K-pop dance y actividades que no encontrarás en otra agencia.',
                                    icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2l3.5 7.5L28 11l-6 5.5 1.5 8.5L16 21l-7.5 4 1.5-8.5L4 11l8.5-1.5z" /></svg>,
                                },
                                {
                                    title: 'Asistencia 24/7',
                                    desc: 'Estamos contigo antes, durante y después del viaje. Siempre disponibles por WhatsApp.',
                                    icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18v-4a10 10 0 0120 0v4" /><rect x="2" y="18" width="6" height="9" rx="2" /><rect x="24" y="18" width="6" height="9" rx="2" /><path d="M28 27v1a3 3 0 01-3 3h-5" /></svg>,
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

            {/* ===== TESTIMONIALS (Polaroid Gallery) ===== */}
            <section className="polaroid-section" id="comunidad" style={{ backgroundColor: '#0c0e16' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>Comunidad Viajera</span>
                        <h2 className="section-title" style={{ color: '#fff' }}>Momentos que hablan por <span style={{ color: 'var(--color-primary)' }}>sí solos</span></h2>
                        <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.5)' }}>Cada foto es una historia. Pasá el cursor para conocerla.</p>
                    </div>
                    <div className="polaroid-grid">
                        {TESTIMONIALS.map((t, i) => (
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

            {/* ===== SEASONS EXPLORER ===== */}
            <section className="seasons-section" id="blog" style={{ backgroundColor: '#f5f0e8' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">¿Cuándo Viajar?</span>
                        <h2 className="section-title">Cada estación tiene su <span className="text-accent">magia</span></h2>
                        <p className="section-subtitle">Pasá el cursor sobre una estación para descubrir lo que te espera.</p>
                    </div>
                    <div className="seasons-panels" data-animate="fade-up">
                        {[
                            {
                                season: 'Primavera',
                                emoji: '🌸',
                                months: 'Marzo — Mayo',
                                temp: '12°C — 22°C',
                                photo: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=1000&fit=crop',
                                color: '#f8b4c8',
                                highlights: ['Sakura (Cerezos en flor)', 'Festivales de primavera', 'Clima perfecto para caminar'],
                            },
                            {
                                season: 'Verano',
                                emoji: '☀️',
                                months: 'Junio — Agosto',
                                temp: '25°C — 35°C',
                                photo: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=1000&fit=crop',
                                color: '#f5a623',
                                highlights: ['Matsuri (Festivales)', 'Fuegos artificiales Hanabi', 'Playas de Okinawa'],
                            },
                            {
                                season: 'Otoño',
                                emoji: '🍂',
                                months: 'Sept — Noviembre',
                                temp: '10°C — 20°C',
                                photo: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&h=1000&fit=crop',
                                color: '#d4602a',
                                highlights: ['Momiji (Hojas rojas)', 'Templos en tonos dorados', 'Gastronomía otoñal'],
                            },
                            {
                                season: 'Invierno',
                                emoji: '❄️',
                                months: 'Diciembre — Febrero',
                                temp: '-2°C — 10°C',
                                photo: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=1000&fit=crop',
                                color: '#7bb8d9',
                                highlights: ['Onsen (Aguas termales)', 'Monos de nieve', 'Iluminaciones navideñas'],
                            },
                        ].map((s, i) => (
                            <div className="season-panel" key={i} style={{ '--accent': s.color }}>
                                <img src={s.photo} alt={s.season} className="season-photo" loading="lazy" />
                                <div className="season-overlay" />
                                <div className="season-label">
                                    <span className="season-emoji">{s.emoji}</span>
                                    <h3 className="season-name">{s.season}</h3>
                                    <span className="season-months">{s.months}</span>
                                </div>
                                <div className="season-details">
                                    <span className="season-temp">{s.temp}</span>
                                    <ul className="season-highlights">
                                        {s.highlights.map((h, j) => <li key={j}>{h}</li>)}
                                    </ul>
                                    <a href={`${WHATSAPP_BASE}SW%20Hola%20quiero%20info%20sobre%20viajes%20en%20${s.season}`} className="season-cta" target="_blank" rel="noopener noreferrer">
                                        Ver salidas →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA FINAL (Boarding Pass) ===== */}
            <section className="cta-bp-section" style={{ backgroundColor: '#0c0e16' }}>
                <div className="container">
                    {/* Strong headline */}
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>Último Paso</span>
                        <h2 className="section-title" style={{ color: '#fff', fontSize: '2.4rem' }}>Tu asiento está reservado.<br /><span style={{ color: 'var(--color-primary)' }}>Solo falta tu nombre.</span></h2>
                        <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.5)' }}>Escribinos por WhatsApp y en menos de 2 horas tenés tu cotización personalizada.</p>
                    </div>

                    <div className="bp-ticket" data-animate="fade-up">
                        {/* Left side - ticket info */}
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
                                    <span className="bp-route-code">MEX</span>
                                    <span className="bp-route-city">Tu Ciudad</span>
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
                                    <span className="bp-field-value">2025 — 2026</span>
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

                        {/* Tear line */}
                        <div className="bp-tear-line">
                            <div className="bp-tear-circle bp-tear-circle--top" />
                            <div className="bp-tear-circle bp-tear-circle--bottom" />
                        </div>

                        {/* Right side - BIG CTA */}
                        <div className="bp-ticket-right">
                            <div className="bp-stamps">
                                <img src="https://flagcdn.com/w40/jp.png" alt="Japón" className="bp-stamp-flag" style={{ transform: 'rotate(-8deg)' }} />
                                <img src="https://flagcdn.com/w40/kr.png" alt="Corea" className="bp-stamp-flag" style={{ transform: 'rotate(6deg)' }} />
                            </div>
                            <div className="bp-ticket-cta">
                                <p className="bp-cta-headline">¿Listo para despegar?</p>
                                <a
                                    href={`${WHATSAPP_BASE}SW%20Hola%20quiero%20reservar%20mi%20lugar%20para%20viajar%20a%20Asia%20🎫✈️`}
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

                    {/* Secondary CTAs */}
                    <div className="bp-secondary" data-animate="fade-up">
                        <div className="bp-secondary-options">
                            <a href="tel:+525513610083" className="bp-phone-link">📞 Prefiero llamar</a>
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

export default Home
