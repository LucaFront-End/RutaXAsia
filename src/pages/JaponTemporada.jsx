import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    TEMPORADAS,
    EXPERIENCIA_ORDER,
    EXPERIENCIAS,
    WHATSAPP_BASE,
} from '../data/japonData'
import TOURS, { TOUR_ORDER } from '../data/tourData'
import FallingElements from '../components/FallingElements'
import './pages.css'

/**
 * JaponTemporada — Season landing page matching the format of /viajes/corea.
 * Shows seasonal tours, highlights, fallback to "A la Carta" if no tours exist, and the 4 travel styles.
 * Route: /viajes/japon/:temporada
 */
export default function JaponTemporada() {
    const { temporada } = useParams()
    const rawTemp = (temporada || '').toLowerCase()

    // Map all common aliases to standard season keys
    const seasonKey = (rawTemp === 'verano' || rawTemp === 'akari' || rawTemp === 'matsuri')
        ? 'akari'
        : (rawTemp === 'momiji' || rawTemp === 'kamakura' || rawTemp === 'koyo' || rawTemp === 'otono' || rawTemp === 'otoño')
            ? 'kamakura'
            : (rawTemp === 'invierno' || rawTemp === 'fuyu' || rawTemp === 'nieve')
                ? 'invierno'
                : (rawTemp === 'sakura' || rawTemp === 'primavera')
                    ? 'sakura'
                    : rawTemp

    const season = TEMPORADAS[seasonKey]

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [temporada])

    if (!season) return <Navigate to="/viajes/japon" replace />

    // Match tours to this season based on slug/title/date keywords
    const seasonalTours = TOUR_ORDER
        .map(slug => ({ slug, ...TOURS[slug] }))
        .filter(t => {
            if (!t || !t.flagIcons?.some(f => f.code === 'jp')) return false
            const text = `${t.slug} ${t.title || ''} ${t.subtitle || ''} ${t.tagline || ''} ${t.badge || ''} ${t.date || ''}`.toLowerCase()

            if (seasonKey === 'sakura') {
                return text.includes('sakura') || text.includes('primavera') || text.includes('marzo') || text.includes('abril')
            }
            if (seasonKey === 'akari') {
                return text.includes('verano') || text.includes('akari') || text.includes('julio') || text.includes('agosto') || text.includes('junio')
            }
            if (seasonKey === 'kamakura') {
                return text.includes('otoño') || text.includes('otono') || text.includes('momiji') || text.includes('kamakura') || text.includes('octubre') || text.includes('noviembre')
            }
            if (seasonKey === 'invierno') {
                return text.includes('invierno') || text.includes('fuyu') || text.includes('diciembre') || text.includes('enero') || text.includes('febrero')
            }
            return false
        })

    // Custom 4 highlights per season
    const seasonalHighlights = {
        sakura: [
            { emoji: '🌸', title: 'Cerezos en Flor (Hanami)', desc: 'Tokyo, Kyoto y Osaka teñidos de rosa en la época más emblemática y fotogénica del año.' },
            { emoji: '🌡️', title: 'Clima Templado Ideal', desc: 'Temperaturas perfectas (12-20°C) para recorrer templos, jardines y castillos caminando.' },
            { emoji: '🍱', title: 'Festivales de Primavera', desc: 'Tradición milenaria de picnics bajo los árboles florecidos y gastronomía temática de flor de cerezo.' },
            { emoji: '🏯', title: 'Castillos & Templos Vivos', desc: 'El Castillo de Osaka, Senso-ji y los pabellones de Kioto en su máximo esplendor natural.' },
        ],
        akari: [
            { emoji: '🎆', title: 'Fuegos Artificiales (Hanabi)', desc: 'Festivales nocturnos masivos de pirotecnia sobre bahías y ríos con yukatas tradicionales.' },
            { emoji: '🏮', title: 'Festivales Matsuri', desc: 'Desfiles de carrozas, tambores taiko, puestos de street food y la vibra más festiva de Japón.' },
            { emoji: '🏔️', title: 'Naturaleza & Monte Fuji', desc: 'Temporada oficial de ascenso al Monte Fuji, paisajes verdes en Hakone y días soleados.' },
            { emoji: '🎢', title: 'Parques & Diversión', desc: 'Universal Studios Japan (Super Nintendo World) y Tokyo DisneySea en su máxima energía.' },
        ],
        kamakura: [
            { emoji: '🍁', title: 'Momiji (Follaje Rojo & Dorado)', desc: 'Los templos de Kioto y los bosques de Hakone transformados en una obra de arte carmesí.' },
            { emoji: '🍂', title: 'Clima Otoñal Nítido', desc: 'Cielos despejados, aire fresco y excelente visibilidad panorámica para contemplar el Monte Fuji.' },
            { emoji: '🌰', title: 'Gastronomía de Temporada', desc: 'Platos tradicionales con castañas, boniato dulce, setas matsutake y street food caliente.' },
            { emoji: '🏮', title: 'Iluminaciones Nocturnas', desc: 'Templos milenarios abiertos de noche con luces especiales que realzan el rojo de los arces.' },
        ],
        invierno: [
            { emoji: '♨️', title: 'Onsen en la Nieve', desc: 'Baños termales humeantes al aire libre con vista al Monte Fuji y montañas nevadas.' },
            { emoji: '🗻', title: 'Monte Fuji Nevado', desc: 'La mejor visibilidad del año con cielos azules cristalinos y la icónica cumbre blanca.' },
            { emoji: '✨', title: 'Iluminaciones de Invierno', desc: 'Millones de luces LED en Shibuya, Roppongi y parques temáticos durante la temporada navideña.' },
            { emoji: '🐵', title: 'Monos de Nieve (Nagano)', desc: 'Encuentro con los macacos salvajes bañándose en aguas termales naturales en los Alpes Japoneses.' },
        ],
    }[seasonKey] || [
        { emoji: '🏯', title: 'Templos & Tradición', desc: 'Descubre los rincones más espirituales y ancestrales de Japón.' },
        { emoji: '🚄', title: 'Tren Bala Shinkansen', desc: 'Conectividad a alta velocidad por todo el país.' },
        { emoji: '🍜', title: 'Gastronomía Única', desc: 'Sabores auténticos seleccionados para cada temporada.' },
        { emoji: '🗼', title: 'Futuro & Cultura', desc: 'La fascinante mezcla entre tecnología vanguardista y respeto al pasado.' },
    ]

    return (
        <>
            <Helmet>
                <title>{`Viajes a Japón en ${season.name} 2026 – 2027 — Tours Grupales y a la Carta | RutaXAsia`}</title>
                <meta name="description" content={`Descubre todos nuestros viajes a Japón en ${season.name}. ${season.description} Tours grupales y viajes a la carta con guía en español. RutaXAsia.`} />
            </Helmet>

            {/* ===== 1. HERO ===== */}
            <section className="viajes-hero">
                <div className="viajes-hero-bg">
                    <img src={season.heroImage} alt={season.name} />
                    <div className="viajes-hero-overlay" />
                </div>
                <FallingElements season={seasonKey} />
                <div className="viajes-hero-content container">
                    <span className="viajes-hero-tag">
                        {season.emoji} Japón en {season.name}
                    </span>
                    <h1 className="viajes-hero-title">
                        Viajes a Japón en <span>{season.name}</span>
                    </h1>
                    <p className="viajes-hero-subtitle">
                        {season.description}
                    </p>
                </div>
            </section>

            {/* ===== 2. HIGHLIGHTS (¿POR QUÉ VIAJAR EN ESTA TEMPORADA?) ===== */}
            <section style={{ backgroundColor: '#f5f0e8', padding: '5rem 0' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">¿Por qué viajar en {season.name}?</span>
                        <h2 className="section-title">
                            La magia de Japón en <span className="text-accent">{season.name}</span>
                        </h2>
                    </div>
                    <div className="viajes-highlights-grid" data-animate="fade-up">
                        {seasonalHighlights.map((h, i) => (
                            <div className="viajes-highlight-card" key={i}>
                                <span className="viajes-highlight-emoji">{h.emoji}</span>
                                <h3>{h.title}</h3>
                                <p>{h.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 3. TOURS SECTION (O FALLBACK A LA CARTA SI NO HAY) ===== */}
            <section className="departures-section" id="tours-temporada">
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag">Tours Disponibles</span>
                        <h2 className="section-title">
                            Viajes en <span className="text-accent">{season.name}</span>
                        </h2>
                        <p className="section-subtitle">
                            {seasonalTours.length > 0
                                ? `Salidas grupales programadas para la temporada de ${season.name}.`
                                : `Actualmente no tenemos salidas grupales fijas para ${season.name}, pero puedes personalizar tu viaje a la carta:`}
                        </p>
                    </div>

                    {seasonalTours.length > 0 ? (
                        <div className="bp-grid">
                            {seasonalTours.map((tour, i) => (
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
                    ) : (
                        /* Fallback Banner to Japón a la Carta when no group tours exist */
                        <div
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '24px',
                                padding: '48px 32px',
                                textAlign: 'center',
                                boxShadow: '0 12px 35px rgba(0,0,0,0.06)',
                                maxWidth: '840px',
                                margin: '0 auto',
                            }}
                        >
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>{season.emoji}</span>
                            <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: season.colors.primary, background: `${season.colors.primary}15`, padding: '6px 16px', borderRadius: '100px', marginBottom: '16px' }}>
                                ✨ Viaje Personalizado a la Carta
                            </span>
                            <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)', margin: '0 0 14px' }}>
                                Diseña tu viaje a Japón en {season.name} a tu medida
                            </h3>
                            <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 28px' }}>
                                Para la temporada de <strong>{season.name}</strong> organizamos viajes a la carta: tú eliges las fechas exactas, duración y experiencias, y nosotros coordinamos tus hoteles 3-4★ con desayuno, tren bala Shinkansen, vuelos y asistencia en español 24/7.
                            </p>
                            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link
                                    to={`/viajes/japon/${seasonKey}/completo`}
                                    className="btn btn-primary"
                                    style={{ padding: '14px 28px', borderRadius: '100px', fontWeight: '800' }}
                                >
                                    ⛩️ Ver Itinerario a la Carta ({season.name}) →
                                </Link>
                                <a
                                    href={`${WHATSAPP_BASE}SW-Hola%20quiero%20cotizar%20un%20viaje%20a%20la%20carta%20en%20Japón%20para%20la%20temporada%20de%20${encodeURIComponent(season.name)}`}
                                    className="btn btn-outline"
                                    style={{ padding: '14px 28px', borderRadius: '100px', fontWeight: '750' }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    💬 Cotizar por WhatsApp
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ===== 4. 4 ESTILOS DE VIAJE A LA CARTA ===== */}
            <section className="jac-experiences" id="estilos" style={{ backgroundColor: '#faf5f0', padding: '5rem 0' }}>
                <div className="container">
                    <div className="section-header" data-animate="fade-up">
                        <span className="section-tag" style={{ background: `${season.colors.primary}15`, color: season.colors.primary }}>
                            ⛩️ 4 Formas de Viajar
                        </span>
                        <h2 className="section-title">
                            Modalidades de Viaje en <span style={{ color: season.colors.primary }}>{season.name}</span>
                        </h2>
                        <p className="section-subtitle">
                            Elige el nivel de acompañamiento que mejor se adapte a tu estilo de viaje.
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

            {/* ===== 5. FINAL CTA ===== */}
            <section style={{ backgroundColor: '#111827', color: '#fff', padding: '5rem 0' }}>
                <div className="container" style={{ maxWidth: '860px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⛩️</div>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontFamily: 'var(--font-heading)', color: '#fff', margin: '0 0 16px' }}>
                        ¿Listo para vivir {season.name} en Japón?
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 32px' }}>
                        Cuéntanos con quién viajas y qué te gustaría conocer, y te armamos la mejor propuesta con vuelos, tren bala y hoteles garantizados.
                    </p>
                    <a
                        href={`${WHATSAPP_BASE}SW-Hola%20quiero%20información%20sobre%20viajes%20a%20Japón%20en%20temporada%20de%20${encodeURIComponent(season.name)}`}
                        className="btn btn-primary"
                        style={{ padding: '14px 32px', borderRadius: '100px', fontWeight: '800', display: 'inline-block' }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💬 Hablar con un Asesor por WhatsApp
                    </a>
                </div>
            </section>
        </>
    )
}
