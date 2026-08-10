import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import TOURS, { TOUR_ORDER } from '../data/tourData'
import './pages.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

/**
 * ViajesCorea — Korea trips page with filtered tours.
 * Route: /viajes/corea
 */
export default function ViajesCorea() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    // Filter tours that include Korea
    const koreaTours = TOUR_ORDER
        .map(slug => ({ slug, ...TOURS[slug] }))
        .filter(t => t.flagIcons?.some(f => f.code === 'kr'))

    return (
        <>
            <Helmet>
                <title>Viajes a Corea del Sur desde México — Tours 2026 | RutaXAsia</title>
                <meta name="description" content="Descubre todos nuestros viajes a Corea del Sur desde México. Seúl, Busan, Jeju. Tours grupales todo incluido con guía en español. RutaXAsia." />
            </Helmet>

            {/* Hero */}
            <section className="viajes-hero">
                <div className="viajes-hero-bg">
                    <img src="https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1920&h=800&fit=crop&q=85" alt="Corea del Sur" />
                    <div className="viajes-hero-overlay" />
                </div>
                <div className="viajes-hero-content container">
                    <span className="viajes-hero-tag">🇰🇷 Corea del Sur</span>
                    <h1 className="viajes-hero-title">Viajes a <span>Corea</span></h1>
                    <p className="viajes-hero-subtitle">Palacios, K-culture, street food y playas paradisíacas. Descubrí Seúl, Busan y Jeju.</p>
                </div>
            </section>

            {/* Highlights */}
            <section style={{ backgroundColor: '#f5f0e8', padding: '5rem 0' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">¿Por qué Corea?</span>
                        <h2 className="section-title">Un destino que <span className="text-accent">enamora</span></h2>
                    </div>
                    <div className="viajes-highlights-grid" data-animate="fade-up">
                        {[
                            { emoji: '🏯', title: 'Palacios Reales', desc: 'Gyeongbokgung, Bukchon Hanok Village y siglos de historia coreana.' },
                            { emoji: '🎶', title: 'K-Culture', desc: 'Hongdae, Gangnam, K-pop y la cultura más trendy del mundo.' },
                            { emoji: '🍜', title: 'Street Food', desc: 'Korean BBQ, tteokbokki, chimaek y mercados nocturnos.' },
                            { emoji: '🏝️', title: 'Isla de Jeju', desc: 'Volcanes, playas turquesa, cascadas y las legendarias haenyeo.' },
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

            {/* Korea Tours */}
            <section className="departures-section" id="tours-corea">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Tours Disponibles</span>
                        <h2 className="section-title">Viajes a Corea <span className="text-accent">2026</span></h2>
                        <p className="section-subtitle">Todos los tours que incluyen Corea del Sur en su recorrido.</p>
                    </div>
                    <div className="bp-grid">
                        {koreaTours.map((tour, i) => (
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
