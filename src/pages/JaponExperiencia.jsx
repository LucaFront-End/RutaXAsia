import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    TEMPORADAS,
    EXPERIENCIAS,
    PRECIOS,
    DESTINOS_DISPONIBLES,
    COMPLEMENTOS,
    ACTIVIDADES_EXTRAS,
    HIGHLIGHTS_STRIP,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../data/japonData'
import FallingElements from '../components/FallingElements'
import './pages.css'

/**
 * JaponExperiencia — Individual experience landing page.
 * Route: /viajes/japon/:temporada/:experiencia
 * Example: /viajes/japon/verano/libre
 */

export default function JaponExperiencia() {
    const { temporada, experiencia } = useParams()
    const season = TEMPORADAS[temporada]
    const exp = EXPERIENCIAS[experiencia]
    const pricing = PRECIOS[temporada]?.[experiencia]

    useEffect(() => { window.scrollTo(0, 0) }, [temporada, experiencia])

    if (!season || !exp) return <Navigate to="/viajes/japon" replace />

    const hasPackages = pricing?.packages?.length > 0

    return (
        <>
            <Helmet>
                <title>{`${season.name} ${exp.name} — Japón a la Carta | RutaXAsia`}</title>
                <meta name="description" content={`${season.name} ${exp.name}: ${exp.tagline} Desde ${pricing?.startingPrice || 'consultar'} MXN por persona. Japón a la Carta con RutaXAsia.`} />
            </Helmet>

            {/* ===== HERO ===== */}
            <section
                className="jac-hero jac-hero--exp"
                style={{ '--season-primary': season.colors.primary }}
            >
                <div className="jac-hero-bg">
                    <img src={season.heroImage} alt={`${season.name} ${exp.name}`} />
                    <div className="jac-hero-overlay" />
                    <FallingElements type={temporada} />
                </div>
                <div className="jac-hero-content container">
                    <Link to={`/viajes/japon/${temporada}`} className="jac-hero-breadcrumb">
                        ← {season.name} — Elegir experiencia
                    </Link>
                    <div className="jac-hero-torii">⛩️</div>
                    <h1 className="jac-hero-title">
                        JAPÓN <span className="jac-hero-title-accent">A LA CARTA</span>
                    </h1>
                    <div className="jac-hero-season-badge" style={{ background: season.colors.primary }}>
                        — {season.name} —
                    </div>
                    <p className="jac-hero-subtitle-large">Tú eliges cómo vivir Japón.</p>
                </div>
            </section>

            {/* ===== STICKY SELECTION PATH ===== */}
            <div className="jac-selection-path">
                <div className="container jac-path-container">
                    <Link to="/viajes/japon" className="jac-path-step">
                        🇯🇵 Japón a la Carta
                    </Link>
                    <span className="jac-path-divider">/</span>
                    <Link to={`/viajes/japon/${temporada}`} className="jac-path-step">
                        {season.emoji} {season.name}
                    </Link>
                    <span className="jac-path-divider">/</span>
                    <span className="jac-path-step jac-path-step--active">
                        {exp.icon} {exp.name}
                    </span>
                </div>
            </div>

            {/* ===== EXPERIENCE HEADER ===== */}
            <section
                className="jac-exp-header"
                style={{
                    '--season-primary': season.colors.primary,
                    '--season-bg': season.colors.bg,
                    backgroundColor: season.colors.bg,
                }}
            >
                <div className="container">
                    <div className="jac-exp-header-content" data-animate="fade-up">
                        <div className="jac-exp-header-icon">{exp.icon}</div>
                        <h2 className="jac-exp-header-title">
                            <span style={{ color: season.colors.primary }}>{season.name}</span>{' '}
                            {exp.name}
                        </h2>
                        <p className="jac-exp-header-tagline">{exp.tagline}</p>

                        {/* Starting price badge */}
                        {hasPackages && (
                            <div className="jac-price-badge" style={{ borderColor: season.colors.primary }}>
                                <span className="jac-price-from">Desde</span>
                                <span className="jac-price-amount" style={{ color: season.colors.primary }}>
                                    {pricing.startingPrice}
                                </span>
                                <span className="jac-price-currency">MXN</span>
                                <span className="jac-price-per">por persona</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ===== PAQUETES / PRECIOS ===== */}
            {hasPackages && (
                <section className="jac-packages" style={{ '--season-primary': season.colors.primary }}>
                    <div className="container">
                        <div className="section-header" data-animate="fade-up">
                            <span className="section-tag" style={{ background: season.colors.bg, color: season.colors.primary }}>
                                🎋 Arma tu combo
                            </span>
                            <h2 className="section-title">
                                Elige la duración de tu <span style={{ color: season.colors.primary }}>experiencia</span>
                            </h2>
                        </div>

                        <div className="jac-packages-grid" data-animate="fade-up">
                            <div className="jac-packages-table">
                                <div className="jac-packages-table-header" style={{ background: season.colors.primary }}>
                                    <span>Pase de Abordar / Paquetes Disponibles</span>
                                </div>
                                {pricing.packages.map((pkg, i) => (
                                    <div className="jac-package-row" key={i} style={{ borderLeftColor: season.colors.primary }}>
                                        <span className="jac-package-days">{pkg.days}</span>
                                        
                                        {/* CSS Simulated Barcode */}
                                        <div className="jac-ticket-barcode-wrap">
                                            <div className="jac-ticket-barcode">
                                                <div className="jac-barcode-line" />
                                                <div className="jac-barcode-line jac-barcode-line--wide" />
                                                <div className="jac-barcode-line jac-barcode-line--narrow" />
                                                <div className="jac-barcode-line" />
                                                <div className="jac-barcode-line jac-barcode-line--wide" />
                                                <div className="jac-barcode-line jac-barcode-line--narrow" />
                                                <div className="jac-barcode-line" />
                                            </div>
                                            <span className="jac-barcode-num">JAC-{temporada.substring(0,3).toUpperCase()}-{i+1}</span>
                                        </div>

                                        <div className="jac-package-price-wrap">
                                            <span className="jac-package-price" style={{ color: season.colors.primary }}>
                                                {pkg.price}
                                            </span>
                                            <span className="jac-package-currency">MXN</span>
                                            <span className="jac-package-per">por persona</span>
                                        </div>
                                    </div>
                                ))}
                                <p className="jac-packages-note">{pricing.note}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== QUÉ INCLUYE ===== */}
            <section className="jac-includes" style={{ '--season-primary': season.colors.primary }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: season.colors.bg, color: season.colors.primary }}>
                            ✅ Incluye
                        </span>
                        <h2 className="section-title">
                            Todo lo que necesitas para tu <span style={{ color: season.colors.primary }}>viaje</span>
                        </h2>
                    </div>

                    <div className="jac-includes-grid" data-animate="fade-up">
                        {exp.detailedIncludes.map((item, i) => (
                            <div className="jac-include-card" key={i} data-animate="fade-up" data-delay={String(i * 100)}>
                                <div className="jac-include-icon">{item.icon}</div>
                                <h3 className="jac-include-title" style={{ color: season.colors.primary }}>{item.title}</h3>
                                <p className="jac-include-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== EXPERIENCIAS DISPONIBLES ===== */}
            <section className="jac-destinos" style={{ backgroundColor: season.colors.bg }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: `${season.colors.primary}20`, color: season.colors.primary }}>
                            🌸 Experiencias Disponibles
                        </span>
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
                    <p className="jac-destinos-note" style={{ color: season.colors.primary }}>
                        Vive Japón con una selección de experiencias pensadas para cada temporada.
                    </p>
                </div>
            </section>

            {/* ===== COMPLEMENTA TU EXPERIENCIA ===== */}
            <section className="jac-extras" style={{ '--season-primary': season.colors.primary }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: season.colors.bg, color: season.colors.primary }}>
                            ✨ Complementa tu Experiencia
                        </span>
                        <p className="section-subtitle">Servicios adicionales con costo extra.</p>
                    </div>

                    <div className="jac-extras-grid" data-animate="fade-up">
                        {COMPLEMENTOS.map((item, i) => (
                            <div className="jac-extra-card" key={i}>
                                <div className="jac-extra-icon">{item.icon}</div>
                                <h4 className="jac-extra-title">{item.title}</h4>
                                <p className="jac-extra-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Activities strip */}
                    <div className="jac-activities-strip" data-animate="fade-up">
                        {ACTIVIDADES_EXTRAS.map((act, i) => (
                            <div className="jac-activity-item" key={i}>
                                <span className="jac-activity-icon">{act.icon}</span>
                                <span className="jac-activity-name">{act.name}</span>
                            </div>
                        ))}
                    </div>

                    <p className="jac-extras-catalog" data-animate="fade-up">
                        Explora nuestro amplio catálogo de actividades y elige las que mejor se adapten a tu estilo de viaje para vivir Japón a tu manera con la asesoría de nuestros expertos.
                    </p>
                </div>
            </section>

            {/* ===== PLAN DE PAGO + NOTA ===== */}
            <section className="jac-pago-section" style={{ backgroundColor: season.colors.bg }}>
                <div className="container" data-animate="fade-up">
                    <div className="jac-pago-cards">
                        <div className="jac-pago-card">
                            <span className="jac-pago-card-icon">📋</span>
                            <p>Experiencias y actividades sujetas a disponibilidad y temporada.</p>
                        </div>
                        <div className="jac-pago-card">
                            <span className="jac-pago-card-icon">💳</span>
                            <h4>Plan de Pago</h4>
                            <p>Anticipo + cómodas mensualidades</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HIGHLIGHTS STRIP ===== */}
            <section className="jac-highlights-strip" style={{ background: season.colors.primary }}>
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
                            href={`${WHATSAPP_BASE}SW-Hola%20quiero%20info%20sobre%20${season.name}%20${exp.name}`}
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
