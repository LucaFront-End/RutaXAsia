import { useEffect } from 'react'
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
import './pages.css'

/**
 * JaponTemporada — Season page showing the 4 travel styles.
 * Route: /viajes/japon/:temporada (verano | sakura | momiji)
 */

export default function JaponTemporada() {
    const { temporada } = useParams()
    const season = TEMPORADAS[temporada]

    useEffect(() => { window.scrollTo(0, 0) }, [temporada])

    if (!season) return <Navigate to="/viajes/japon" replace />

    return (
        <>
            <Helmet>
                <title>{`Japón a la Carta — ${season.name} | RutaXAsia`}</title>
                <meta name="description" content={`Elige tu forma de viajar a Japón en ${season.name}. Libre, Guiado, Acompañado o Signature. ${season.description} RutaXAsia.`} />
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
                <div className="jac-hero-content container">
                    <Link to="/viajes/japon" className="jac-hero-breadcrumb">
                        ← Japón a la Carta
                    </Link>
                    <div className="jac-hero-torii">⛩️</div>
                    <h1 className="jac-hero-title">
                        JAPÓN <span className="jac-hero-title-accent">A LA CARTA</span>
                    </h1>
                    <div className="jac-hero-season-badge" style={{ background: season.colors.primary }}>
                        {season.emoji} {season.name} — {season.months}
                    </div>
                    <p className="jac-hero-subtitle">{season.description}</p>
                </div>
            </section>

            {/* ===== ELIGE TU FORMA DE VIAJAR ===== */}
            <section
                className="jac-experiences"
                style={{
                    '--season-primary': season.colors.primary,
                    '--season-bg': season.colors.bg,
                }}
            >
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: season.colors.bg, color: season.colors.primary }}>
                            {season.emoji} Elige tu Forma de Viajar
                        </span>
                        <h2 className="section-title">
                            <span style={{ color: season.colors.primary }}>{season.name}</span> — 4 experiencias únicas
                        </h2>
                        <p className="section-subtitle">
                            Desde viajes a tu ritmo hasta la experiencia premium. Tú decides cómo vivir Japón en {season.name.toLowerCase()}.
                        </p>
                    </div>

                    <div className="jac-exp-grid" data-animate="fade-up">
                        {EXPERIENCIA_ORDER.map((key, i) => {
                            const exp = EXPERIENCIAS[key]
                            return (
                                <Link
                                    to={`/viajes/japon/${temporada}/${key}`}
                                    className={`jac-exp-card${exp.isSignature ? ' jac-exp-card--signature' : ''}`}
                                    key={key}
                                    style={{ '--season-primary': season.colors.primary, textDecoration: 'none' }}
                                    data-animate="fade-up"
                                    data-delay={String(i * 120)}
                                >
                                    <div className="jac-exp-card-icon">{exp.icon}</div>
                                    <div className="jac-exp-card-header">
                                        <span className="jac-exp-card-season-name" style={{ color: season.colors.primary }}>
                                            {season.name}
                                        </span>
                                        <h3 className="jac-exp-card-name">{exp.name}</h3>
                                    </div>
                                    <p className="jac-exp-card-tagline">{exp.tagline}</p>
                                    <ul className="jac-exp-card-features">
                                        {exp.includes.map((item, j) => (
                                            <li key={j}>
                                                <span className="jac-exp-check" style={{ color: season.colors.primary }}>●</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="jac-exp-card-cta-wrap">
                                        <span
                                            className="jac-exp-card-cta"
                                            style={{
                                                background: exp.isSignature ? '#1a1a1a' : season.colors.primary,
                                                color: '#fff',
                                            }}
                                        >
                                            {exp.ctaText}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ===== EXPERIENCIAS DISPONIBLES ===== */}
            <section className="jac-destinos" style={{ backgroundColor: season.colors.bg }}>
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
                        {DESTINOS_DISPONIBLES.map((dest, i) => (
                            <div className="jac-destino-item" key={i}>
                                <div className="jac-destino-img">
                                    <img src={dest.img} alt={dest.name} loading="lazy" />
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
                        {/* Flexibilidad */}
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
