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
import { useTripSearch } from '../context/TripContext'
import FallingElements from '../components/FallingElements'
import KamakuraSplitHero from '../components/KamakuraSplitHero'
import './pages.css'

/**
 * JaponTemporada — Season page showing the 4 travel styles.
 * Route: /viajes/japon/:temporada (verano | sakura | momiji | kamakura | invierno)
 */

export default function JaponTemporada() {
    const { temporada } = useParams()
    const { tripSearch, updateTripSearch } = useTripSearch()
    const [cmsDestinos, setCmsDestinos] = useState([])
    const rawTemp = (temporada || '').toLowerCase()
    const seasonKey = (rawTemp === 'verano' || rawTemp === 'akari')
        ? 'akari'
        : (rawTemp === 'invierno' || rawTemp === 'fuyu' || rawTemp === 'nieve' || rawTemp === 'momiji' || rawTemp === 'kamakura' || rawTemp === 'koyo' || rawTemp === 'otono' || rawTemp === 'otoño')
            ? 'kamakura'
            : (rawTemp === 'sakura' || rawTemp === 'primavera' ? 'sakura' : rawTemp)

    const baseSeason = TEMPORADAS[seasonKey]

    // Track which sub-season is selected when viewing the dual Otoño/Invierno page
    const [selectedSubSeason, setSelectedSubSeason] = useState(() => {
        if (rawTemp === 'invierno' || rawTemp === 'fuyu' || rawTemp === 'nieve') return 'invierno'
        if (tripSearch?.subSeason === 'invierno' || tripSearch?.temporada === 'invierno') return 'invierno'
        return 'otono'
    })

    // Select season and dynamically update trip search dates
    const handleSelectSeason = (sub) => {
        setSelectedSubSeason(sub)
        if (sub === 'otono') {
            updateTripSearch({
                startDate: '2026-10-20',
                endDate: '2026-10-29',
                selectedMonth: 'Octubre 2026',
                temporada: 'kamakura',
                subSeason: 'otono',
            })
        } else if (sub === 'invierno') {
            updateTripSearch({
                startDate: '2026-12-15',
                endDate: '2026-12-24',
                selectedMonth: 'Diciembre 2026',
                temporada: 'invierno',
                subSeason: 'invierno',
            })
        }
    }

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

    if (!baseSeason) return <Navigate to="/viajes/japon" replace />

    // Active season object for colors and cards below the hero
    const isDualHero = seasonKey === 'kamakura'
    const activeSeason = isDualHero
        ? (selectedSubSeason === 'invierno' ? TEMPORADAS.invierno : TEMPORADAS.kamakura)
        : baseSeason
    const activeSeasonSlug = isDualHero
        ? (selectedSubSeason === 'invierno' ? 'invierno' : 'kamakura')
        : seasonKey

    const season = activeSeason

    return (
        <>
            <Helmet>
                <title>{`Japón a la Carta — ${activeSeason.name} | RutaXAsia`}</title>
                <meta name="description" content={`Elige tu forma de viajar a Japón en ${activeSeason.name}. Libre, Esencial, Completo o Signature. ${activeSeason.description} RutaXAsia.`} />
            </Helmet>

            {/* ===== HERO: DUAL SPLIT SLIDE FOR KAMAKURA (OTOÑO / INVIERNO) ===== */}
            {isDualHero ? (
                <KamakuraSplitHero
                    activeSubSeason={selectedSubSeason}
                    onSelectSeason={handleSelectSeason}
                    scrollTargetId="#estilos"
                    buttonText="Elige tu estilo de viaje"
                />
            ) : (
                /* Standard Hero for Sakura & Akari */
                <section
                    className="jac-hero jac-hero--season"
                    style={{ '--season-primary': season?.colors?.primary || '#d6336c' }}
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
                            VIVE JAPÓN EN <span className="jac-hero-title-accent">{(season.name || '').toUpperCase()}</span>
                        </h1>
                        <p className="jac-hero-subtitle" data-animate="fade-up" data-delay="400">
                            {season.description}
                        </p>
                        <div className="jac-hero-chips" data-animate="fade-up" data-delay="500">
                            {(season.highlights || []).map((h, i) => (
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
            )}

            {/* ===== 4 ESTILOS DE VIAJE ===== */}
            <section className="jac-experiences" id="estilos">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: `${activeSeason.colors.primary}15`, color: activeSeason.colors.primary }}>
                            ⛩️ 4 Formas de Viajar
                        </span>
                        <h2 className="section-title">
                            ¿Cómo quieres vivir <span style={{ color: activeSeason.colors.primary }}>{activeSeason.name}</span>?
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
                                    to={`/viajes/japon/${activeSeasonSlug}/${key}`}
                                    className={`jac-exp-card${exp.isSignature ? ' jac-exp-card--signature' : ''}`}
                                    key={key}
                                    data-animate="fade-up"
                                    data-delay={String(i * 120)}
                                >
                                    <div className="jac-exp-card-glow" />
                                    <div className="jac-exp-card-header">
                                        <span className="jac-exp-card-icon">{exp.icon}</span>
                                        <span className="jac-exp-card-season-name" style={{ color: exp.isSignature ? '#d4af37' : activeSeason.colors.primary }}>
                                            {activeSeason.name}
                                        </span>
                                        <h3 className="jac-exp-card-name">{exp.name}</h3>
                                        <p className="jac-exp-card-tagline">{exp.tagline}</p>
                                    </div>
                                    <ul className="jac-exp-card-features">
                                        {exp.includes.slice(0, 5).map((item, j) => (
                                            <li key={j}>
                                                <span className="jac-exp-check" style={{ color: exp.isSignature ? '#d4af37' : activeSeason.colors.primary }}>✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="jac-exp-card-cta-wrap">
                                        <span
                                            className="jac-exp-card-cta"
                                            style={{
                                                background: exp.isSignature ? 'linear-gradient(135deg, #d4af37, #f5d97e)' : activeSeason.colors.primary,
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
                        <span className="section-tag" style={{ background: `${activeSeason.colors.primary}15`, color: activeSeason.colors.primary }}>
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
                    <p className="jac-destinos-note" style={{ color: activeSeason.colors.primary }}>Y muchas más...</p>
                </div>
            </section>

            {/* ===== FLEXIBILIDAD & EXTENSIONES ===== */}
            <section className="jac-flex-ext">
                <div className="container">
                    <div className="jac-flex-ext-grid" data-animate="fade-up">
                        {/* 1. Flexibilidad */}
                        <div className="jac-flex-box">
                            <div className="jac-flex-box-header">
                                <span className="jac-flex-box-icon" style={{ background: `${activeSeason.colors.primary}15`, color: activeSeason.colors.primary }}>🗺️</span>
                                <h3 className="jac-flex-box-title" style={{ color: activeSeason.colors.primary }}>
                                    Flexibilidad Total
                                </h3>
                            </div>
                            <div className="jac-flex-items-list">
                                {FLEXIBILIDAD.map((item, i) => (
                                    <div className="jac-flex-item" key={i}>
                                        <span className="jac-flex-item-bullet" style={{ color: activeSeason.colors.primary }}>{item.icon || '✓'}</span>
                                        <div className="jac-flex-item-text">
                                            <h4>{item.title}</h4>
                                            <p>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Extensiones */}
                        <div className="jac-flex-box">
                            <div className="jac-flex-box-header">
                                <span className="jac-flex-box-icon" style={{ background: `${activeSeason.colors.primary}15`, color: activeSeason.colors.primary }}>🌏</span>
                                <h3 className="jac-flex-box-title" style={{ color: activeSeason.colors.primary }}>
                                    Extensiones de Viaje
                                </h3>
                            </div>
                            <div className="jac-flex-items-list">
                                {EXTENSIONES.map((item, i) => (
                                    <div className="jac-flex-item" key={i}>
                                        <span className="jac-flex-item-bullet" style={{ color: activeSeason.colors.primary }}>✦</span>
                                        <div className="jac-flex-item-text">
                                            <h4>
                                                {item.name}
                                                {item.days && <span className="jac-flex-badge">{item.days}</span>}
                                            </h4>
                                            <p>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Plan de Pago */}
                        <div className="jac-flex-box jac-flex-box--pago">
                            <div className="jac-flex-box-header">
                                <span className="jac-flex-box-icon" style={{ background: '#ecfdf5', color: '#059669' }}>💳</span>
                                <h3 className="jac-flex-box-title" style={{ color: '#059669' }}>
                                    Planes de Pago
                                </h3>
                            </div>
                            <div className="jac-pago-highlight">
                                <strong>Anticipo + cómodas mensualidades</strong>
                                <span>Paga a tu ritmo sin complicaciones</span>
                            </div>
                            <ul className="jac-pago-list">
                                <li>Aparta tu lugar con un anticipo accesible.</li>
                                <li>Paga en mensualidades cómodas sin intereses.</li>
                                <li>Liquida antes de la fecha de inicio del viaje.</li>
                                <li>Asistencia y confirmación inmediata en cada pago.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HIGHLIGHTS STRIP ===== */}
            <section className="jac-highlights-strip" style={{ background: activeSeason.colors.primary }} data-animate="fade-up">
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
                            href={`${WHATSAPP_BASE}SW-Hola%20quiero%20info%20sobre%20Japón%20${activeSeason.name}`}
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
