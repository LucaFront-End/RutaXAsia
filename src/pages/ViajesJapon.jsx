import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import TOURS, { TOUR_ORDER } from '../data/tourData'
import './pages.css'

const WHATSAPP_BASE = 'https://wa.me/525513610083?text='

/**
 * ViajesJapon — Japan trips page with seasons + filtered tours.
 * Route: /viajes/japon
 */

const SEASONS = [
    { season: 'Primavera', emoji: '🌸', months: 'Marzo — Mayo', temp: '10°C — 20°C', photo: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=1000&fit=crop', color: '#f8b4c8', highlights: ['Sakura (Cerezos en flor)', 'Festivales de primavera', 'Clima perfecto para caminar'] },
    { season: 'Verano', emoji: '☀️', months: 'Junio — Agosto', temp: '25°C — 35°C', photo: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=1000&fit=crop', color: '#f5a623', highlights: ['Matsuri (Festivales)', 'Fuegos artificiales Hanabi', 'Universal Studios & Disney'] },
    { season: 'Otoño', emoji: '🍂', months: 'Sept — Noviembre', temp: '10°C — 20°C', photo: '/otono-japan.jpg', color: '#d4602a', highlights: ['Momiji (Hojas rojas)', 'Templos en tonos dorados', 'Gastronomía otoñal'] },
    { season: 'Invierno', emoji: '❄️', months: 'Diciembre — Febrero', temp: '-2°C — 10°C', photo: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=1000&fit=crop', color: '#7bb8d9', highlights: ['Onsen (Aguas termales)', 'Monos de nieve', 'Iluminaciones navideñas'] },
]

export default function ViajesJapon() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    // Filter tours that include Japan
    const japanTours = TOUR_ORDER
        .map(slug => ({ slug, ...TOURS[slug] }))
        .filter(t => t.flagIcons?.some(f => f.code === 'jp'))

    return (
        <>
            <Helmet>
                <title>Viajes a Japón desde México — Tours 2026 | RutaXAsia</title>
                <meta name="description" content="Descubre todos nuestros viajes a Japón desde México. Sakura, Verano, Otoño. Tours grupales todo incluido con guía en español. RutaXAsia." />
            </Helmet>

            {/* Hero */}
            <section className="viajes-hero">
                <div className="viajes-hero-bg">
                    <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=800&fit=crop&q=85" alt="Japón" />
                    <div className="viajes-hero-overlay" />
                </div>
                <div className="viajes-hero-content container">
                    <span className="viajes-hero-tag">🇯🇵 Japón</span>
                    <h1 className="viajes-hero-title">Viajes a <span>Japón</span></h1>
                    <p className="viajes-hero-subtitle">Templos, cerezos en flor, gastronomía y una cultura milenaria. Elegí tu temporada y viví Japón con nosotros.</p>
                </div>
            </section>

            {/* Seasons */}
            <section className="seasons-section" style={{ backgroundColor: '#f5f0e8' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">¿Cuándo Viajar?</span>
                        <h2 className="section-title">Cada estación tiene su <span className="text-accent">magia</span></h2>
                        <p className="section-subtitle">Japón se transforma con cada temporada. Elegí la que más te llame.</p>
                    </div>
                    <div className="seasons-panels" data-animate="fade-up">
                        {SEASONS.map((s, i) => (
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
                                    <ul className="season-highlights">{s.highlights.map((h, j) => <li key={j}>{h}</li>)}</ul>
                                    <a href={`${WHATSAPP_BASE}SW-Hola%20quiero%20info%20sobre%20viajes%20a%20Japón%20en%20${s.season}`} className="season-cta" target="_blank" rel="noopener noreferrer">Ver salidas →</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Japan Tours */}
            <section className="departures-section" id="tours-japon">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Tours Disponibles</span>
                        <h2 className="section-title">Viajes a Japón <span className="text-accent">2026</span></h2>
                        <p className="section-subtitle">Todos los tours que incluyen Japón en su recorrido.</p>
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
                                        <span className="bp-card-flags">{tour.flagIcons.map(f => <img key={f.code} src={`https://flagcdn.com/w40/${f.code}.png`} alt={f.name} className="bp-flag-img" />)}</span>
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
        </>
    )
}
