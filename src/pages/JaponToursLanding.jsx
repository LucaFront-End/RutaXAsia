import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import TOURS, { TOUR_ORDER } from '../data/tourData'
import './pages.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

/**
 * JaponToursLanding — General Japan tours page matching the format of /viajes/corea.
 * Route: /tours/japon
 */
export default function JaponToursLanding() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Filter tours that include Japan
    const japanTours = TOUR_ORDER
        .map(slug => ({ slug, ...TOURS[slug] }))
        .filter(t => t && t.flagIcons?.some(f => f.code === 'jp'))

    const seasons = [
        {
            name: 'Primavera',
            link: '/temporadas/primavera',
            emoji: '🌸',
            desc: 'Cerezos en flor (Hanami), templos rosados y clima templado.',
            img: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=600&fit=crop&q=80',
            badge: 'Temporada Estrella',
        },
        {
            name: 'Verano',
            link: '/temporadas/verano',
            emoji: '☀️',
            desc: 'Matsuri tradicionales, fuegos artificiales Hanabi y parques temáticos.',
            img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop&q=80',
            badge: 'Festivales & Vida',
        },
        {
            name: 'Otoño',
            link: '/temporadas/otono',
            emoji: '🍁',
            desc: 'Momiji (hojas rojas y doradas), templos mágicos y gastronomía de temporada.',
            img: '/otono-japan.jpg',
            badge: 'Paisajes Dorados',
        },
        {
            name: 'Invierno',
            link: '/temporadas/invierno',
            emoji: '❄️',
            desc: 'Onsen humeante en la nieve, Monte Fuji blanco y luces invernales.',
            img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop&q=80',
            badge: 'Nieve & Onsen',
        },
    ]

    return (
        <>
            <Helmet>
                <title>Viajes a Japón desde México — Tours Grupales 2026 – 2027 | RutaXAsia</title>
                <meta name="description" content="Descubre todos nuestros viajes a Japón desde México. Tokyo, Kyoto, Osaka, Monte Fuji. Tours grupales todo incluido con vuelos, hoteles 3-4★ y guía en español. RutaXAsia." />
            </Helmet>

            {/* ===== 1. HERO ===== */}
            <section className="viajes-hero">
                <div className="viajes-hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=800&fit=crop&q=85"
                        alt="Japón"
                    />
                    <div className="viajes-hero-overlay" />
                </div>
                <div className="viajes-hero-content container">
                    <span className="viajes-hero-tag">🇯🇵 Japón</span>
                    <h1 className="viajes-hero-title">Viajes a <span>Japón</span></h1>
                    <p className="viajes-hero-subtitle">
                        Cerezos en flor, templos milenarios, trenes bala Shinkansen y megalópolis futuristas. Descubrí Tokyo, Kyoto, Osaka y el Monte Fuji.
                    </p>
                </div>
            </section>

            {/* ===== 2. HIGHLIGHTS (¿POR QUÉ JAPÓN?) ===== */}
            <section style={{ backgroundColor: '#f5f0e8', padding: '5rem 0' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">¿Por qué Japón?</span>
                        <h2 className="section-title">Un destino que <span className="text-accent">enamora</span></h2>
                    </div>
                    <div className="viajes-highlights-grid" data-animate="fade-up">
                        {[
                            { emoji: '🏯', title: 'Templos & Tradición', desc: 'Fushimi Inari, Kinkaku-ji, bosques de bambú en Arashiyama y la mística espiritual de Kioto.' },
                            { emoji: '🚄', title: 'Tren Bala Shinkansen', desc: 'Viaja a más de 300 km/h conectando ciudades con máxima puntualidad, confort y vistas panorámicas.' },
                            { emoji: '🍜', title: 'Gastronomía Única', desc: 'Ramen artesanal, auténtico sushi fresco, carne Wagyu certificada y street food en Dotonbori.' },
                            { emoji: '🗼', title: 'Futuro & Naturaleza', desc: 'Desde los neones de Shibuya y el arte inmersivo de TeamLab hasta la majestuosidad del Monte Fuji.' },
                        ].map((h, i) => (
                            <div className="viajes-highlight-card" key={i}>
                                <span className="viajes-highlight-emoji">{h.emoji}</span>
                                <h3>{h.title}</h3>
                                <p>{h.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 3. JAPAN TOURS (BOARDING PASS CARDS) ===== */}
            <section className="departures-section" id="tours-japon">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Tours Disponibles</span>
                        <h2 className="section-title">Viajes a Japón <span className="text-accent">2026 – 2027</span></h2>
                        <p className="section-subtitle">Salidas grupales todo incluido con vuelos, hoteles 3-4★, tren bala y guía en español 24/7.</p>
                    </div>

                    <div className="bp-grid">
                        {japanTours.map((tour, i) => (
                            <div className="bp-card" key={tour.slug} data-animate="fade-up" data-delay={String(i * 120)}>
                                <div className="bp-card-photo">
                                    <img src={tour.heroImage || tour.gallery?.[0]?.img} alt={tour.title} loading="lazy" />
                                    <div className="bp-card-photo-overlay" />
                                    {tour.badge && <div className="bp-badge">{tour.badge}</div>}
                                </div>
                                <div className="bp-tear">
                                    <div className="bp-tear-circle bp-tear-circle--top" />
                                    <div className="bp-tear-line" />
                                    <div className="bp-tear-circle bp-tear-circle--bottom" />
                                </div>
                                <div className="bp-card-info">
                                    <div className="bp-card-header">
                                        <span className="bp-card-label">DESTINO</span>
                                        <span className="bp-card-flags">
                                            {tour.flagIcons?.map(f => (
                                                <img key={f.code} src={`https://flagcdn.com/w40/${f.code}.png`} alt={f.name} className="bp-flag-img" />
                                            ))}
                                        </span>
                                    </div>
                                    <h3 className="bp-card-title">{tour.title}</h3>
                                    <p className="bp-card-excerpt">{tour.tagline}</p>
                                    <div className="bp-card-details">
                                        <div className="bp-detail"><span className="bp-detail-label">FECHA</span><span className="bp-detail-value">{tour.date}</span></div>
                                        <div className="bp-detail"><span className="bp-detail-label">DURACIÓN</span><span className="bp-detail-value">{tour.duration}</span></div>
                                        <div className="bp-detail"><span className="bp-detail-label">PRECIO</span><span className="bp-detail-value">{tour.price}</span></div>
                                    </div>
                                    <div className="bp-card-actions">
                                        {!tour.soldOut ? (
                                            <a href={`${WHATSAPP_BASE}SW-Hola%20quiero%20cotizar%20${encodeURIComponent(tour.title)}`} className="btn btn-primary bp-btn" target="_blank" rel="noopener noreferrer">Cotizar Ahora</a>
                                        ) : (
                                            <span className="btn btn-outline bp-btn" style={{ opacity: 0.5 }}>SOLD OUT</span>
                                        )}
                                        <Link to={`/tours/${tour.slug}`} className="btn btn-outline bp-btn">Ver Itinerario</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 4. SEASONS EXPLORER ===== */}
            <section style={{ backgroundColor: '#faf5f0', padding: '5rem 0' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Japón en Cada Estación</span>
                        <h2 className="section-title">Descubre Japón por <span className="text-accent">Temporada</span></h2>
                        <p className="section-subtitle">Cada época tiene paisajes, festivales y climas únicos. Elige tu estación ideal:</p>
                    </div>

                    <div className="viajes-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                        {seasons.map((s, i) => (
                            <Link to={s.link} key={i} className="viajes-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                                    <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                                    <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.75rem', fontWeight: '750', padding: '4px 12px', borderRadius: '100px', backdropFilter: 'blur(4px)' }}>
                                        {s.badge}
                                    </span>
                                </div>
                                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)', margin: '0 0 8px' }}>
                                            {s.emoji} {s.name}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, margin: '0 0 16px' }}>
                                            {s.desc}
                                        </p>
                                    </div>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: '750', fontSize: '0.9rem' }}>
                                        Ver viajes de {s.name} →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 5. JAPÓN A LA CARTA LINK CALLOUT ===== */}
            <section style={{ backgroundColor: '#111827', color: '#fff', padding: '5rem 0' }}>
                <div className="container" style={{ maxWidth: '960px', textAlign: 'center' }}>
                    <span className="viajes-hero-tag" style={{ background: 'rgba(233, 30, 99, 0.15)', borderColor: 'rgba(233, 30, 99, 0.3)', color: '#f472b6' }}>
                        ⛩️ ¿Prefieres viajar con fechas personalizadas?
                    </span>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-heading)', margin: '16px 0', color: '#fff' }}>
                        Japón a la Carta — Tu Viaje Personalizado
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto 32px' }}>
                        Si prefieres viajar en tus propias fechas y a tu propio ritmo, prueba nuestro configurador <strong>Japón a la Carta</strong> con modalidades Libre, Esencial, Completo y Signature.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/viajes/japon" className="btn btn-primary" style={{ padding: '14px 28px', borderRadius: '100px', fontWeight: '750' }}>
                            🌸 Abrir Japón a la Carta
                        </Link>
                        <a
                            href={`${WHATSAPP_BASE}SW-Hola%20quiero%20cotizar%20un%20viaje%20personalizado%20a%20Japón%20a%20la%20Carta`}
                            className="btn btn-outline"
                            style={{ padding: '14px 28px', borderRadius: '100px', fontWeight: '750', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            💬 Cotizar por WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
