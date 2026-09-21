import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import TOURS, { TOUR_ORDER } from '../data/tourData'
import FallingElements from '../components/FallingElements'
import './pages.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

const SEASON_DATA = {
    primavera: {
        key: 'primavera',
        name: 'Primavera',
        fullName: 'Primavera en Japón (Sakura)',
        emoji: '🌸',
        cartaSlug: 'sakura',
        cartaName: 'Sakura',
        monthsText: '16 de Marzo — 15 de Abril',
        colors: {
            primary: '#d6336c',
            secondary: '#f8b4c8',
            bg: '#fff5f8',
        },
        heroImage: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&h=900&fit=crop&q=85',
        description: 'Vive la magia de los cerezos en flor (Hanami). Japón se tiñe de tonos rosados en la temporada más poética y emblemática del año.',
        highlights: [
            { emoji: '🌸', title: 'Cerezos en Flor (Hanami)', desc: 'Tokyo, Kyoto y Osaka teñidos de rosa en la época más emblemática y fotogénica del año.' },
            { emoji: '🌡️', title: 'Clima Templado Ideal', desc: 'Temperaturas perfectas (12-20°C) para recorrer templos, jardines y castillos caminando.' },
            { emoji: '🍱', title: 'Festivales de Primavera', desc: 'Tradición milenaria de picnics bajo los árboles florecidos y gastronomía temática de flor de cerezo.' },
            { emoji: '🏯', title: 'Castillos & Templos Vivos', desc: 'El Castillo de Osaka, Senso-ji y los pabellones de Kioto en su máximo esplendor natural.' },
        ],
        matchTour: (t, text) => text.includes('sakura') || text.includes('primavera') || text.includes('marzo') || text.includes('abril'),
        fallingSeason: 'sakura',
    },
    verano: {
        key: 'verano',
        name: 'Verano',
        fullName: 'Verano en Japón (Matsuri & Hanabi)',
        emoji: '☀️',
        cartaSlug: 'akari',
        cartaName: 'Akari',
        monthsText: '16 de Abril — 31 de Agosto',
        colors: {
            primary: '#2d6a4f',
            secondary: '#95d5b2',
            bg: '#f0faf4',
        },
        heroImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&h=900&fit=crop&q=85',
        description: 'Festivales Matsuri milenarios, espectaculares fuegos artificiales Hanabi sobre las bahías y la máxima energía del verano japonés.',
        highlights: [
            { emoji: '🎆', title: 'Fuegos Artificiales (Hanabi)', desc: 'Festivales nocturnos masivos de pirotecnia sobre bahías y ríos con yukatas tradicionales.' },
            { emoji: '🏮', title: 'Festivales Matsuri', desc: 'Desfiles de carrozas, tambores taiko, puestos de street food y la vibra más festiva de Japón.' },
            { emoji: '🏔️', title: 'Naturaleza & Monte Fuji', desc: 'Temporada oficial de ascenso al Monte Fuji, paisajes verdes en Hakone y días soleados.' },
            { emoji: '🎢', title: 'Parques & Diversión', desc: 'Universal Studios Japan (Super Nintendo World) y Tokyo DisneySea en su máxima energía.' },
        ],
        matchTour: (t, text) => text.includes('verano') || text.includes('akari') || text.includes('julio') || text.includes('agosto') || text.includes('junio') || text.includes('compras'),
        fallingSeason: 'akari',
    },
    otono: {
        key: 'otono',
        name: 'Otoño',
        fullName: 'Otoño en Japón (Momiji)',
        emoji: '🍁',
        cartaSlug: 'kamakura',
        cartaName: 'Kamakura',
        monthsText: '1 de Septiembre — 30 de Noviembre',
        colors: {
            primary: '#c44900',
            secondary: '#e8a87c',
            bg: '#fdf6f0',
        },
        heroImage: '/otono-japan.jpg',
        description: 'Los colores del otoño y templos milenarios en calma transforman Japón. Paisajes mágicos de Momiji, templos dorados y gastronomía de temporada.',
        highlights: [
            { emoji: '🍁', title: 'Momiji (Follaje Rojo & Dorado)', desc: 'Los templos de Kioto y los bosques de Hakone transformados en una obra de arte carmesí.' },
            { emoji: '🍂', title: 'Clima Otoñal Nítido', desc: 'Cielos despejados, aire fresco y excelente visibilidad panorámica para contemplar el Monte Fuji.' },
            { emoji: '🌰', title: 'Gastronomía de Temporada', desc: 'Platos tradicionales con castañas, boniato dulce, setas matsutake y street food caliente.' },
            { emoji: '🏮', title: 'Iluminaciones Nocturnas', desc: 'Templos milenarios abiertos de noche con luces especiales que realzan el rojo de los arces.' },
        ],
        matchTour: (t, text) => text.includes('otoño') || text.includes('otono') || text.includes('momiji') || text.includes('octubre') || text.includes('noviembre') || text.includes('septiembre'),
        fallingSeason: 'kamakura',
    },
    invierno: {
        key: 'invierno',
        name: 'Invierno',
        fullName: 'Invierno en Japón (Nieve & Onsen)',
        emoji: '❄️',
        cartaSlug: 'kamakura',
        cartaName: 'Kamakura',
        monthsText: '1 de Diciembre — 15 de Marzo',
        colors: {
            primary: '#0284c7',
            secondary: '#7dd3fc',
            bg: '#f0f9ff',
        },
        heroImage: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1920&h=900&fit=crop&q=85',
        description: 'Paisajes nevados de postal, aguas termales Onsen humeantes con vista al Monte Fuji y las iluminaciones festivas de Año Nuevo.',
        highlights: [
            { emoji: '♨️', title: 'Onsen en la Nieve', desc: 'Baños termales humeantes al aire libre con vista al Monte Fuji y montañas nevadas.' },
            { emoji: '🗻', title: 'Monte Fuji Nevado', desc: 'La mejor visibilidad del año con cielos azules cristalinos y la icónica cumbre blanca.' },
            { emoji: '✨', title: 'Iluminaciones de Invierno', desc: 'Millones de luces LED en Shibuya, Roppongi y celebraciones de Año Nuevo.' },
            { emoji: '🐵', title: 'Monos de Nieve (Nagano)', desc: 'Encuentro con los macacos salvajes bañándose en aguas termales naturales en los Alpes Japoneses.' },
        ],
        matchTour: (t, text) => text.includes('invierno') || text.includes('fuyu') || text.includes('diciembre') || text.includes('enero') || text.includes('febrero') || text.includes('año nuevo') || text.includes('ano nuevo'),
        fallingSeason: 'invierno',
    },
}

export default function TemporadaToursLanding() {
    const { temporada } = useParams()
    const rawTemp = (temporada || '').toLowerCase()

    // Normalize season alias to one of the 4 natural seasons
    let seasonKey = 'primavera'
    if (rawTemp === 'sakura' || rawTemp === 'primavera') {
        seasonKey = 'primavera'
    } else if (rawTemp === 'verano' || rawTemp === 'akari' || rawTemp === 'matsuri') {
        seasonKey = 'verano'
    } else if (rawTemp === 'otono' || rawTemp === 'otoño' || rawTemp === 'momiji' || rawTemp === 'koyo') {
        seasonKey = 'otono'
    } else if (rawTemp === 'invierno' || rawTemp === 'fuyu' || rawTemp === 'nieve') {
        seasonKey = 'invierno'
    } else if (rawTemp === 'kamakura') {
        seasonKey = 'otono'
    }

    const season = SEASON_DATA[seasonKey]

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [temporada])

    if (!season) return <Navigate to="/tours/japon" replace />

    // Match tours to this season
    const seasonalTours = TOUR_ORDER
        .map(slug => ({ slug, ...TOURS[slug] }))
        .filter(t => {
            if (!t || !t.flagIcons?.some(f => f.code === 'jp')) return false
            const text = `${t.slug} ${t.title || ''} ${t.subtitle || ''} ${t.tagline || ''} ${t.badge || ''} ${t.date || ''}`.toLowerCase()
            return season.matchTour(t, text)
        })

    return (
        <>
            <Helmet>
                <title>{`Viajes a Japón en ${season.name} 2026 – 2027 — Tours y Salidas Grupales | RutaXAsia`}</title>
                <meta name="description" content={`Descubre todos nuestros viajes a Japón en ${season.name}. ${season.description} Tours grupales todo incluido y asesoría personalizada. RutaXAsia.`} />
            </Helmet>

            {/* ===== 1. HERO ===== */}
            <section className="viajes-hero">
                <div className="viajes-hero-bg">
                    <img src={season.heroImage} alt={season.name} />
                    <div className="viajes-hero-overlay" />
                </div>
                <FallingElements season={season.fallingSeason} />
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
                        {season.highlights.map((h, i) => (
                            <div className="viajes-highlight-card" key={i}>
                                <span className="viajes-highlight-emoji">{h.emoji}</span>
                                <h3>{h.title}</h3>
                                <p>{h.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 3. TOURS SECTION ===== */}
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
                        /* Fallback to Japón a la Carta when no group tours exist */
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
                                Para la temporada de <strong>{season.name}</strong> organizamos viajes a la carta{season.key === 'otono' || season.key === 'invierno' ? ' (en la modalidad Kamakura)' : ''}: tú eliges las fechas exactas, duración y experiencias, y nosotros coordinamos tus hoteles 3-4★ con desayuno, tren bala Shinkansen, vuelos y asistencia en español 24/7.
                            </p>
                            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link
                                    to={`/viajes/japon/${season.cartaSlug}`}
                                    className="btn btn-primary"
                                    style={{ padding: '14px 28px', borderRadius: '100px', fontWeight: '800' }}
                                >
                                    ⛩️ Ver Japón a la Carta ({season.cartaName}) →
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

            {/* ===== 4. JAPÓN A LA CARTA LINK CALLOUT ===== */}
            <section style={{ backgroundColor: '#111827', color: '#fff', padding: '5rem 0' }}>
                <div className="container" style={{ maxWidth: '860px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⛩️</div>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontFamily: 'var(--font-heading)', color: '#fff', margin: '0 0 16px' }}>
                        ¿Buscas fechas o duración personalizada en {season.name}?
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 32px' }}>
                        {season.key === 'otono' || season.key === 'invierno'
                            ? <>En nuestra modalidad <strong>Japón a la Carta</strong>, tanto Otoño como Invierno se coordinan en la temporada <strong>Kamakura</strong> (1 Sep — 15 Mar), donde puedes elegir entre los colores del Momiji o los paisajes de nieve y Onsen. Descubre las 4 experiencias (Libre, Esencial, Completo y Signature) para viajar a tu propio ritmo.</>
                            : <>Explora las 4 modalidades de <strong>Japón a la Carta</strong> (Libre, Esencial, Completo y Signature) para viajar en temporada <strong>{season.cartaName}</strong> con fechas y duración a tu medida.</>
                        }
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            to={`/viajes/japon/${season.cartaSlug}`}
                            className="btn btn-primary"
                            style={{ padding: '14px 28px', borderRadius: '100px', fontWeight: '750' }}
                        >
                            🌸 Diseñar Japón a la Carta ({season.cartaName}) →
                        </Link>
                        <a
                            href={`${WHATSAPP_BASE}SW-Hola%20quiero%20información%20sobre%20viajes%20a%20Japón%20en%20temporada%20de%20${encodeURIComponent(season.name)}`}
                            className="btn btn-outline"
                            style={{ padding: '14px 28px', borderRadius: '100px', fontWeight: '750', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            💬 Asesoría por WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
