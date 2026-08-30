import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    TEMPORADAS,
    EXPERIENCIA_ORDER,
    EXPERIENCIAS,
    DESTINOS_DISPONIBLES,
    FLEXIBILIDAD,
    EXTENSIONES,
    HIGHLIGHTS_STRIP,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../data/japonData'
import { fetchTourIndividuales } from '../lib/wixClient'
import FallingElements from '../components/FallingElements'
import './pages.css'

/**
 * JaponTemporada — Season page showing the 4 travel styles.
 * Route: /viajes/japon/:temporada (verano | sakura | momiji)
 */

export default function JaponTemporada() {
    const { temporada } = useParams()
    const [cmsDestinos, setCmsDestinos] = useState([])
    const rawTemp = (temporada || '').toLowerCase()
    const seasonKey = (rawTemp === 'verano' || rawTemp === 'akari')
        ? 'akari'
        : (rawTemp === 'momiji' || rawTemp === 'kamakura' || rawTemp === 'koyo' || rawTemp === 'otono')
            ? 'kamakura'
            : (rawTemp === 'sakura' ? 'sakura' : rawTemp)

    const season = TEMPORADAS[seasonKey]

    useEffect(() => { window.scrollTo(0, 0) }, [temporada])

    useEffect(() => {
        let isMounted = true
        async function loadCmsExperiences() {
            try {
                const tours = await fetchTourIndividuales()
                if (isMounted && Array.isArray(tours) && tours.length > 0) {
                    const mapped = tours.slice(0, 12).map(t => ({
                        name: t.title || t.name,
                        img: t.image || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop',
                        city: t.city
                    }))
                    setCmsDestinos(mapped)
                }
            } catch (err) {
                console.error('[JaponTemporada] Error loading CMS tours:', err)
            }
        }
        loadCmsExperiences()
        return () => { isMounted = false }
    }, [])

    const displayDestinos = cmsDestinos.length > 0 ? cmsDestinos : DESTINOS_DISPONIBLES

    if (!season) return <Navigate to="/viajes/japon" replace />

    return (
        <>
            <Helmet>
                <title>{`Japón a la Carta — ${season.name} | RutaXAsia`}</title>
                <meta name="description" content={`Elige tu forma de viajar a Japón en ${season.name}. Libre, Esencial, Completo o Signature. ${season.description} RutaXAsia.`} />
            </Helmet>

            {/* ===== HERO ===== */}
            <section
                className="jac-hero jac-hero--season"
                style={{ '--season-primary': season.colors.primary }}
            >
                <div className="jac-hero-bg">
                    <img src={season.heroImage} alt={season.name} />
                    <div className="jac-hero-overlay" />
                </div>
                <FallingElements season={seasonKey} />
                <div className="jac-hero-content container">
                    <span className="jac-hero-tag" data-animate="fade-up" data-delay="100">
                        {season.emoji} Temporada {season.name}
                    </span>
                    <div className="jac-hero-torii" data-animate="fade-up" data-delay="200">⛩️</div>
                    <h1 className="jac-hero-title" data-animate="fade-up" data-delay="300">
                        VIVE JAPÓN EN <span className="jac-hero-title-accent">{season.name.toUpperCase()}</span>
                    </h1>
                    <p className="jac-hero-subtitle" data-animate="fade-up" data-delay="400">
                        {season.months} — {season.description}
                    </p>
                    <div className="jac-hero-chips" data-animate="fade-up" data-delay="500">
                        {season.highlights.map((h, i) => (
                            <span className="jac-hero-chip" key={i}>
                                {season.emoji} {h}
                            </span>
                        ))}
                    </div>
                    <a href="#estilos" className="jac-hero-scroll-btn" data-animate="fade-up" data-delay="600">
                        Elige tu estilo de viaje <span className="jac-hero-scroll-arrow">↓</span>
                    </a>
                </div>
            </section>

            {/* ===== 4 ESTILOS DE VIAJE ===== */}
            <section className="jac-experiences" id="estilos">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: `${season.colors.primary}15`, color: season.colors.primary }}>
                            ⛩️ 4 Formas de Viajar
                        </span>
                        <h2 className="section-title">
                            ¿Cómo quieres vivir <span style={{ color: season.colors.primary }}>{season.name}</span>?
                        </h2>
                        <p className="section-subtitle">
                            Desde viajes a tu propio ritmo hasta la experiencia más exclusiva. Elige tu nivel de acompañamiento.
                        </p>
                    </div>

                    <div className="jac-exp-grid">
                        {EXPERIENCIA_ORDER.map((key, i) => {
                            const exp = EXPERIENCIAS[key]
                            return (
                                <Link
                                    to={`/viajes/japon/${seasonKey}/${key}`}
                                    className={`jac-exp-card${exp.isSignature ? ' jac-exp-card--signature' : ''}`}
                                    key={key}
                                    data-animate="fade-up"
                                    data-delay={String(i * 120)}
                                >
                                    <div className="jac-exp-card-glow" />
                                    <div className="jac-exp-card-header">
                                        <span className="jac-exp-card-icon">{exp.icon}</span>
                                        <span className="jac-exp-card-season-name" style={{ color: exp.isSignature ? '#d4af37' : season.colors.primary }}>
                                            {season.name}
                                        </span>
                                        <h3 className="jac-exp-card-name">{exp.name}</h3>
                                        <p className="jac-exp-card-tagline">{exp.tagline}</p>
                                    </div>
                                    <ul className="jac-exp-card-features">
                                        {exp.includes.slice(0, 5).map((item, j) => (
                                            <li key={j}>
                                                <span className="jac-exp-check" style={{ color: exp.isSignature ? '#d4af37' : season.colors.primary }}>✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="jac-exp-card-cta-wrap">
                                        <span
                                            className="jac-exp-card-cta"
                                            style={{
                                                background: exp.isSignature ? 'linear-gradient(135deg, #d4af37, #f5d97e)' : season.colors.primary,
                                                color: exp.isSignature ? '#000' : '#fff',
                                            }}
                                        >
                                            {exp.ctaText} →
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ===== EXPERIENCIAS DISPONIBLES ===== */}
            <section className="jac-destinos">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: `${season.colors.primary}15`, color: season.colors.primary }}>
                            🌸 Experiencias Disponibles
                        </span>
                        <p className="section-subtitle">
                            Todas nuestras experiencias están seleccionadas y calendarizadas para la temporada.
                        </p>
                    </div>
                    <div className="jac-destinos-grid" data-animate="fade-up">
                        {displayDestinos.map((dest, i) => (
                            <div className="jac-destino-item" key={i}>
                                <div className="jac-destino-img">
                                    <img
                                        src={dest.img}
                                        alt={dest.name}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop'
                                        }}
                                    />
                                </div>
                                <span className="jac-destino-name">{dest.name}</span>
                            </div>
                        ))}
                    </div>
                    <p className="jac-destinos-note" style={{ color: season.colors.primary }}>Y muchas más...</p>
                </div>
            </section>

            {/* ===== FLEXIBILIDAD & EXTENSIONES ===== */}
            <section className="jac-flex-ext">
                <div className="container">
                    <div className="jac-flex-ext-grid" data-animate="fade-up">
                        <div className="jac-flex-box">
                            <h3 className="jac-flex-box-title" style={{ color: season.colors.primary }}>
                                🗺️ Flexibilidad
                            </h3>
                            {FLEXIBILIDAD.map((item, i) => (
                                <div className="jac-flex-item" key={i}>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Extensiones */}
                        <div className="jac-flex-box">
                            <h3 className="jac-flex-box-title" style={{ color: season.colors.primary }}>
                                🌏 Extensiones
                            </h3>
                            {EXTENSIONES.map((item, i) => (
                                <div className="jac-flex-item" key={i}>
                                    <span className="jac-ext-icon">{item.icon}</span>
                                    <div>
                                        <h4>{item.name}</h4>
                                        {item.duration && <p>{item.duration}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Plan de Pago */}
                        <div className="jac-flex-box jac-flex-box--pago">
                            <h3 className="jac-flex-box-title" style={{ color: season.colors.primary }}>
                                💳 Planes de Pago
                            </h3>
                            <p className="jac-pago-text">Anticipo + cómodas mensualidades</p>
                            <ul className="jac-pago-list">
                                <li>Aparta tu lugar con un anticipo accesible.</li>
                                <li>Paga en mensualidades cómodas y sin complicaciones.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HIGHLIGHTS STRIP ===== */}
            <section className="jac-highlights-strip" style={{ background: season.colors.primary }} data-animate="fade-up">
                <div className="container">
                    <div className="jac-highlights-row">
                        {HIGHLIGHTS_STRIP.map((h, i) => (
                            <div className="jac-highlight-item" key={i}>
                                <span className="jac-highlight-icon">{h.icon}</span>
                                <span className="jac-highlight-text">{h.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="jac-cta">
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="jac-cta-torii">⛩️</div>
                    <h2 className="jac-cta-title">
                        Cuéntanos cómo quieres vivir Japón
                    </h2>
                    <p className="jac-cta-subtitle">Y diseñamos tu experiencia contigo.</p>
                    <div className="jac-cta-actions">
                        <a
                            href={`${WHATSAPP_BASE}SW-Hola%20quiero%20info%20sobre%20Japón%20${season.name}`}
                            className="btn btn-primary jac-cta-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            💬 Escríbenos por WhatsApp
                        </a>
                        <a href={`tel:+52${WHATSAPP_PHONE.replace(/\s/g, '')}`} className="btn btn-outline jac-cta-btn">
                            📞 {WHATSAPP_PHONE}
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
