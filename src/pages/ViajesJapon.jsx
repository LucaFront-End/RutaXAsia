import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    TEMPORADAS,
    TEMPORADA_ORDER,
    EXPERIENCIA_ORDER,
    EXPERIENCIAS,
    HIGHLIGHTS_STRIP,
    WHATSAPP_BASE,
} from '../data/japonData'
import './pages.css'

/**
 * ViajesJapon — Japan "À la Carte" country page.
 * Shows the 3 seasons (Sakura, Verano, Momiji) as premium cards.
 * Route: /viajes/japon
 */

export default function ViajesJapon() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    return (
        <>
            <Helmet>
                <title>Japón a la Carta — Viajes a Japón desde México | RutaXAsia</title>
                <meta name="description" content="Japón a la Carta: elige tu temporada, tu estilo de viaje y vive Japón a tu manera. Sakura, Verano o Momiji. Libre, Guiado, Acompañado o Signature. RutaXAsia." />
            </Helmet>

            {/* ===== HERO ===== */}
            <section className="jac-hero">
                <div className="jac-hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=900&fit=crop&q=85"
                        alt="Japón"
                    />
                    <div className="jac-hero-overlay" />
                </div>
                <div className="jac-hero-content container">
                    <span className="jac-hero-tag">🇯🇵 Japón</span>
                    <div className="jac-hero-torii">⛩️</div>
                    <h1 className="jac-hero-title">
                        JAPÓN <span className="jac-hero-title-accent">A LA CARTA</span>
                    </h1>
                    <p className="jac-hero-subtitle">
                        Tú eliges cómo vivir Japón, nosotros hacemos que suceda.
                    </p>
                    <a href="#pasos" className="jac-hero-scroll-btn">
                        Elige tu temporada <span className="jac-hero-scroll-arrow">↓</span>
                    </a>
                </div>
            </section>

            {/* ===== CÓMO FUNCIONA (PASO A PASO) ===== */}
            <section className="jac-steps-section" id="pasos">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Japón a la Carta</span>
                        <h2 className="section-title">
                            Tu viaje en <span className="text-accent">3 sencillos pasos</span>
                        </h2>
                        <p className="section-subtitle">
                            Diseñar el viaje de tus sueños a Japón es más fácil que nunca.
                        </p>
                    </div>

                    <div className="jac-steps-grid" data-animate="fade-up">
                        <div className="jac-step-card">
                            <div className="jac-step-num">1</div>
                            <h3 className="jac-step-title">Elige tu Temporada</h3>
                            <p className="jac-step-desc">
                                Disfruta los cerezos en flor de Sakura 🌸, los festivales en Verano ☀️ o el follaje de Momiji 🍁.
                            </p>
                        </div>
                        <div className="jac-step-arrow">→</div>
                        <div className="jac-step-card">
                            <div className="jac-step-num">2</div>
                            <h3 className="jac-step-title">Elige tu Estilo</h3>
                            <p className="jac-step-desc">
                                Desde la libertad del viaje Libre 🗺️ hasta el acompañamiento premium y de lujo de Signature 👑.
                            </p>
                        </div>
                        <div className="jac-step-arrow">→</div>
                        <div className="jac-step-card">
                            <div className="jac-step-num">3</div>
                            <h3 className="jac-step-title">Arma tu Experiencia</h3>
                            <p className="jac-step-desc">
                                Complementa con traslados, días asistidos locales y actividades tradicionales de nuestro catálogo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TEMPORADAS ===== */}
            <section className="jac-seasons" id="temporadas">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Elige tu Temporada</span>
                        <h2 className="section-title">
                            Cada estación tiene su <span className="text-accent">magia</span>
                        </h2>
                        <p className="section-subtitle">
                            Japón se transforma con cada temporada. Elige la que más te llame y vive una experiencia única.
                        </p>
                    </div>

                    <div className="jac-seasons-grid" data-animate="fade-up">
                        {TEMPORADA_ORDER.map((key, i) => {
                            const season = TEMPORADAS[key]
                            return (
                                <Link
                                    to={`/viajes/japon/${key}`}
                                    className="jac-season-card"
                                    key={key}
                                    style={{
                                        '--season-primary': season.colors.primary,
                                        '--season-secondary': season.colors.secondary,
                                        '--season-bg': season.colors.bg,
                                    }}
                                    data-animate="fade-up"
                                    data-delay={String(i * 150)}
                                >
                                    <div className="jac-season-card-img">
                                        <img src={season.cardImage} alt={season.name} loading="lazy" />
                                        <div className="jac-season-card-img-overlay" />
                                        <div className="jac-season-card-emoji">{season.emoji}</div>
                                    </div>
                                    <div className="jac-season-card-body">
                                        <span className="jac-season-card-months">{season.months}</span>
                                        <h3 className="jac-season-card-name">{season.name}</h3>
                                        <p className="jac-season-card-desc">{season.description}</p>
                                        <ul className="jac-season-card-highlights">
                                            {season.highlights.map((h, j) => (
                                                <li key={j}>{h}</li>
                                            ))}
                                        </ul>
                                        <span className="jac-season-card-cta">
                                            Explorar {season.name} <span>→</span>
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ===== 4 ESTILOS DE VIAJE (Preview) ===== */}
            <section className="jac-styles-preview">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Tu Forma de Viajar</span>
                        <h2 className="section-title">
                            <span className="text-accent">4 experiencias</span>, un mismo destino
                        </h2>
                        <p className="section-subtitle">
                            Desde viajes flexibles a tu ritmo hasta la experiencia premium Signature. Tú decides cómo vivir Japón.
                        </p>
                    </div>

                    <div className="jac-styles-grid" data-animate="fade-up">
                        {EXPERIENCIA_ORDER.map((key, i) => {
                            const exp = EXPERIENCIAS[key]
                            return (
                                <div
                                    className={`jac-style-card${exp.isSignature ? ' jac-style-card--signature' : ''}`}
                                    key={key}
                                    data-animate="fade-up"
                                    data-delay={String(i * 120)}
                                >
                                    <div className="jac-style-card-icon">{exp.icon}</div>
                                    <h3 className="jac-style-card-name">{exp.name}</h3>
                                    <p className="jac-style-card-tagline">{exp.tagline}</p>
                                    <ul className="jac-style-card-features">
                                        {exp.includes.slice(0, 5).map((item, j) => (
                                            <li key={j}>
                                                <span className="jac-style-check">✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ===== HIGHLIGHTS STRIP ===== */}
            <section className="jac-highlights-strip" data-animate="fade-up">
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
                    <p className="jac-cta-subtitle">
                        Y diseñamos tu experiencia contigo.
                    </p>
                    <a
                        href={`${WHATSAPP_BASE}SW-Hola%20quiero%20info%20sobre%20Japón%20a%20la%20Carta`}
                        className="btn btn-primary jac-cta-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💬 Cotiza tu Viaje a Japón
                    </a>
                </div>
            </section>
        </>
    )
}
