import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import useLandings from '../hooks/useLandings'
import './pages.css'

/**
 * Zonas — Dynamic hub page that auto-generates cards from Wix CMS landings.
 * Route: /zonas
 *
 * 100% dynamic: if a landing is created/deleted in Wix CMS,
 * the card will appear/disappear automatically on next page load.
 */
export default function Zonas() {
    const { landings, loading } = useLandings()

    useEffect(() => { window.scrollTo(0, 0) }, [])

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
            { threshold: 0.1 }
        )
        document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [landings]) // Re-run when landings load

    return (
        <>
            <Helmet>
                <title>Zonas — Viajes por Ciudad | RutaXAsia</title>
                <meta name="description" content="Encuentra viajes a Japón y Corea desde tu ciudad. RutaXAsia tiene presencia en todo México." />
            </Helmet>

            {/* Hero */}
            <section className="viajes-hero">
                <div className="viajes-hero-bg">
                    <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&h=800&fit=crop&q=85" alt="Zonas" />
                    <div className="viajes-hero-overlay" />
                </div>
                <div className="viajes-hero-content container">
                    <span className="viajes-hero-tag">📍 Zonas</span>
                    <h1 className="viajes-hero-title">Viajes desde <span>tu Ciudad</span></h1>
                    <p className="viajes-hero-subtitle">Encuentra información personalizada de viajes a Asia según tu ubicación en México.</p>
                </div>
            </section>

            {/* Dynamic Landing Cards Grid */}
            <section className="zonas-grid-section">
                <div className="container">
                    {loading ? (
                        <div className="zonas-loading">
                            <div className="zonas-loading-spinner" />
                            <p>Cargando zonas disponibles...</p>
                        </div>
                    ) : landings.length === 0 ? (
                        <div className="zonas-empty">
                            <p>No hay zonas disponibles por el momento. ¡Próximamente!</p>
                        </div>
                    ) : (
                        <>
                            <div className="section-header" data-animate="fade-up">
                                <h2 className="section-title">{landings.length} {landings.length === 1 ? 'zona disponible' : 'zonas disponibles'}</h2>
                                <p className="section-subtitle">Seleccioná tu ciudad para ver información personalizada.</p>
                            </div>
                            <div className="zonas-grid">
                                {landings.map((landing, i) => (
                                    <Link
                                        to={`/${landing.slug}`}
                                        className="zona-card"
                                        key={landing.id}
                                        data-animate="fade-up"
                                        data-delay={String(i * 80)}
                                    >
                                        <div className="zona-card-icon">📍</div>
                                        <div className="zona-card-body">
                                            <h3 className="zona-card-title">{landing.title}</h3>
                                            <p className="zona-card-excerpt">{landing.excerpt}</p>
                                            <div className="zona-card-meta">
                                                {landing.city && <span className="zona-card-city">🏙️ {landing.city}</span>}
                                                {landing.state && <span className="zona-card-state">{landing.state}</span>}
                                            </div>
                                        </div>
                                        <span className="zona-card-arrow">→</span>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="viajes-cta">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="viajes-cta-title">¿No ves tu ciudad?</h2>
                    <p className="viajes-cta-text">No importa de dónde seas, te ayudamos a planear tu viaje a Asia.</p>
                    <a
                        href="https://wa.me/525657929121?text=SW-Hola%20quiero%20info%20sobre%20viajes%20desde%20mi%20ciudad"
                        className="btn btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '1.1rem', padding: '16px 40px' }}
                    >
                        💬 Consultar mi Ciudad
                    </a>
                </div>
            </section>
        </>
    )
}
