import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import './pages.css'

/**
 * Viajes — Hub page showing the 3 destination countries.
 * Route: /viajes
 */

const DESTINATIONS = [
    {
        title: 'Japón a la Carta',
        flag: '🇯🇵',
        slug: '/viajes/japon',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=85',
        excerpt: 'Diseña tu viaje a Japón a tu medida. Elige tu estación preferida (Sakura, Verano u Otoño) y el estilo de viaje que más te guste (Libre, Esencial, Completo o Signature).',
        seasons: ['🌸 Sakura', '☀️ Verano', '🍁 Momiji'],
        available: true,
        isCarta: true,
    },
    {
        title: 'Corea del Sur',
        flag: '🇰🇷',
        slug: '/viajes/corea',
        image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=500&fit=crop&q=85',
        excerpt: 'Palacios reales, K-culture, street food y la isla paradisíaca de Jeju. Un destino que supera todas tus expectativas.',
        seasons: ['🌸 Primavera', '🍂 Otoño'],
        available: true,
    },
    {
        title: 'China',
        flag: '🇨🇳',
        slug: '/viajes/china',
        image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=500&fit=crop&q=85',
        excerpt: 'La Gran Muralla, ciudades milenarias y una cultura que te dejará sin palabras. Pronto abrimos rutas a China.',
        seasons: [],
        available: false,
    },
]

export default function Viajes() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    return (
        <>
            <Helmet>
                <title>Viajes a Asia — Japón, Corea y China | RutaXAsia</title>
                <meta name="description" content="Descubre nuestros viajes a Japón, Corea del Sur y China. Tours grupales todo incluido con RutaXAsia, la agencia #1 de viajes a Asia desde México." />
            </Helmet>

            {/* Hero */}
            <section className="viajes-hero">
                <div className="viajes-hero-bg">
                    <img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&h=800&fit=crop&q=85" alt="" />
                    <div className="viajes-hero-overlay" />
                </div>
                <div className="viajes-hero-content container">
                    <span className="viajes-hero-tag">Nuestros Destinos</span>
                    <h1 className="viajes-hero-title">Viajes a <span>Asia</span></h1>
                    <p className="viajes-hero-subtitle">Elige tu destino y vive la aventura de tu vida con grupos reducidos y guía en español.</p>
                </div>
            </section>

            {/* Destination Cards */}
            <section className="viajes-grid-section">
                <div className="container">
                    <div className="viajes-grid">
                        {DESTINATIONS.map((dest, i) => (
                            <div className={`viajes-card${!dest.available ? ' viajes-card--disabled' : ''}`} key={i}>
                                <div className="viajes-card-img">
                                    <img src={dest.image} alt={dest.title} loading="lazy" />
                                    <div className="viajes-card-img-overlay" />
                                    {!dest.available && (
                                        <div className="viajes-card-badge">Próximamente</div>
                                    )}
                                    {dest.isCarta && (
                                        <div className="viajes-card-badge viajes-card-badge--carta">NUEVA MODALIDAD</div>
                                    )}
                                    <div className="viajes-card-flag">{dest.flag}</div>
                                </div>
                                <div className="viajes-card-body">
                                    <h2 className="viajes-card-title">{dest.title}</h2>
                                    <p className="viajes-card-excerpt">{dest.excerpt}</p>
                                    {dest.seasons.length > 0 && (
                                        <div className="viajes-card-seasons">
                                            {dest.seasons.map((s, j) => (
                                                <span className="viajes-season-tag" key={j}>{s}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="viajes-card-actions">
                                        {dest.available ? (
                                            <Link to={dest.slug} className="btn btn-primary">
                                                Explorar {dest.title} →
                                            </Link>
                                        ) : (
                                            <span className="btn btn-outline" style={{ opacity: 0.5, cursor: 'default' }}>
                                                Próximamente
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="viajes-cta">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="viajes-cta-title">¿No sabés por dónde empezar?</h2>
                    <p className="viajes-cta-text">Escribinos y te ayudamos a elegir el viaje perfecto para vos.</p>
                    <a
                        href="https://wa.me/525657929121?text=SW-Hola%20quiero%20info%20sobre%20viajes%20a%20Asia"
                        className="btn btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '1.1rem', padding: '16px 40px' }}
                    >
                        💬 Cotiza tu Viaje
                    </a>
                </div>
            </section>
        </>
    )
}
