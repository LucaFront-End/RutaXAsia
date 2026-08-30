import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuCamera, LuMapPin, LuCalendar, LuSparkles, LuX, LuArrowRight, LuPlane } from 'react-icons/lu'
import './Portafolio.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

const PORTFOLIO_ITEMS = [
    {
        id: 1,
        title: 'Cerezos en Flor en Templo Kiyomizu-dera',
        location: 'Kioto, Japón',
        season: 'sakura',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&h=800&fit=crop&q=80',
        caption: 'Grupo Sakura 2025 admirando el atardecer entre los cerezos en flor en Kioto.',
        tag: '🌸 Sakura',
        span: 'wide',
    },
    {
        id: 2,
        title: 'Cruce de Shibuya Nocturno',
        location: 'Tokio, Japón',
        season: 'general',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=1000&fit=crop&q=80',
        caption: 'Explorando las luces de neón y la energía inagotable de Shibuya con nuestro grupo.',
        tag: '🗼 Tokio',
        span: 'tall',
    },
    {
        id: 3,
        title: 'Monte Fuji desde el Lago Kawaguchiko',
        location: 'Fuji Five Lakes, Japón',
        season: 'sakura',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop&q=80',
        caption: 'Uno de los días más mágicos de la expedición: vista despejada del Monte Fuji.',
        tag: '🗻 Monte Fuji',
        span: '',
    },
    {
        id: 4,
        title: 'Palacio Gyeongbokgung en Hanbok',
        location: 'Seúl, Corea del Sur',
        season: 'corea',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=1000&fit=crop&q=80',
        caption: 'Nuestros viajeros vestidos con trajes tradicionales Hanbok en Seúl.',
        tag: '🇰🇷 Corea del Sur',
        span: 'tall',
    },
    {
        id: 5,
        title: 'Torii Flotante del Santuario Itsukushima',
        location: 'Miyajima, Hiroshima',
        season: 'general',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&h=700&fit=crop&q=80',
        caption: 'Paseo en ferry hacia la isla sagrada de Miyajima y convivencia con los ciervos libres.',
        tag: '⛩️ Miyajima',
        span: 'wide',
    },
    {
        id: 6,
        title: 'Bosque de Bambú de Arashiyama',
        location: 'Kioto, Japón',
        season: 'verano',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&q=80',
        caption: 'Caminata matutina en el bosque de bambú antes de que lleguen las multitudes.',
        tag: '🎋 Arashiyama',
        span: '',
    },
    {
        id: 7,
        title: 'Momiji y Hojas Rojas en Templo Tofuku-ji',
        location: 'Kioto, Japón',
        season: 'otono',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1000&h=700&fit=crop&q=80',
        caption: 'Los tonos dorados y rojizos del otoño japonés en su máximo esplendor.',
        tag: '🍁 Momiji Otoño',
        span: 'wide',
    },
    {
        id: 8,
        title: 'Calles Tradicionales de Bukchon Hanok',
        location: 'Seúl, Corea del Sur',
        season: 'corea',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=600&fit=crop&q=80',
        caption: 'Recorriendo los rincones históricos de Seúl con guías locales y anfitriones.',
        tag: '🇰🇷 Bukchon',
        span: '',
    },
    {
        id: 9,
        title: 'Noche de Neón y Gastronomía en Dotonbori',
        location: 'Osaka, Japón',
        season: 'verano',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=1000&fit=crop&q=80',
        caption: 'Tour gastronómico de takoyaki, okonomiyaki y fotos con el icónico Glico Man.',
        tag: '🐙 Osaka Food',
        span: 'tall',
    },
    {
        id: 10,
        title: 'Ceremonia Tradicional del Té en Kioto',
        location: 'Gion, Kioto',
        season: 'experiencia',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&h=600&fit=crop&q=80',
        caption: 'Experiencia inmersiva de té matcha con maestros certificados en una casa de té histórica.',
        tag: '🍵 Ceremonia del Té',
        span: '',
    },
    {
        id: 11,
        title: 'Parque de los Ciervos de Nara',
        location: 'Nara, Japón',
        season: 'general',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop&q=80',
        caption: 'Alimentando a los ciervos sagrados de Nara frente al gran templo Todai-ji.',
        tag: '🦌 Nara',
        span: '',
    },
    {
        id: 12,
        title: 'Fuegos Artificiales Hanabi Matsuri',
        location: 'Río Sumida, Tokio',
        season: 'verano',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1000&h=700&fit=crop&q=80',
        caption: 'Viviendo la tradición milenaria de los festivales de verano con yukatas.',
        tag: '🎆 Hanabi Matsuri',
        span: 'wide',
    },
]

const EDITIONS = [
    {
        name: 'Sakura en Japón',
        dates: '16 Mar — 15 Abr',
        desc: 'La edición más demandada del año. Cerezos en flor en Tokio, Kioto, Osaka, Nara y vista al Monte Fuji.',
        badge: '🌸 Primavera',
        link: '/viajes/japon/sakura',
    },
    {
        name: 'Akari — Verano & Matsuri',
        dates: '16 Abr — 31 Ago',
        desc: 'Festivales tradicionales japoneses, espectáculos pirotécnicos Hanabi, ambiente vibrante y yukatas.',
        badge: '☀️ Verano',
        link: '/viajes/japon/akari',
    },
    {
        name: 'Kamakura — Otoño Momiji',
        dates: '1 Sep — 15 Mar',
        desc: 'Los templos milenarios teñidos de rojo y oro, clima templado perfecto para caminar y aguas termales Onsen.',
        badge: '🍁 Otoño / Invierno',
        link: '/viajes/japon/kamakura',
    },
    {
        name: 'Corea del Sur K-Culture',
        dates: 'Salidas Seleccionadas',
        desc: 'Seúl, palacios en Hanbok, spots de K-Dramas, moda en Hongdae y gastronomía callejera en Myeongdong.',
        badge: '🇰🇷 Corea',
        link: '/viajes/corea',
    },
]

export default function Portafolio() {
    const [filter, setFilter] = useState('all')
    const [selectedPhoto, setSelectedPhoto] = useState(null)

    useEffect(() => { window.scrollTo(0, 0) }, [])

    const filteredItems = filter === 'all'
        ? PORTFOLIO_ITEMS
        : PORTFOLIO_ITEMS.filter(item => item.season === filter)

    return (
        <div className="portafolio-page">
            <Helmet>
                <title>Portafolio de Viajes & Fotos Reales | RutaXAsia</title>
                <meta name="description" content="Explora las fotos reales y momentos vividos por nuestros viajeros en Japón y Corea del Sur. Galería de expediciones reales con Juan y Ale de RutaXAsia." />
            </Helmet>

            {/* ===== HERO ===== */}
            <section className="port-hero">
                <div className="port-hero-bg">
                    <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=800&fit=crop&q=80" alt="Portafolio RutaXAsia" />
                    <div className="port-hero-overlay" />
                </div>
                <div className="container port-hero-content">
                    <span className="port-hero-badge">
                        <LuCamera size={14} /> PORTAFOLIO & GALERÍA DE VIAJEROS
                    </span>
                    <h1 className="port-hero-title">
                        Momentos Reales, <span className="port-glow-text">Historias Vivas</span>
                    </h1>
                    <p className="port-hero-sub">
                        Cada fotografía es un testimonio de lo que significa viajar con nosotros. Sin filtros de catálogo, solo viajes reales y recuerdos para toda la vida.
                    </p>

                    {/* Filter Tabs */}
                    <div className="port-filters">
                        <button
                            className={`port-filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos ({PORTFOLIO_ITEMS.length})
                        </button>
                        <button
                            className={`port-filter-btn ${filter === 'sakura' ? 'active' : ''}`}
                            onClick={() => setFilter('sakura')}
                        >
                            🌸 Sakura
                        </button>
                        <button
                            className={`port-filter-btn ${filter === 'verano' ? 'active' : ''}`}
                            onClick={() => setFilter('verano')}
                        >
                            ☀️ Verano
                        </button>
                        <button
                            className={`port-filter-btn ${filter === 'otono' ? 'active' : ''}`}
                            onClick={() => setFilter('otono')}
                        >
                            🍁 Otoño Momiji
                        </button>
                        <button
                            className={`port-filter-btn ${filter === 'corea' ? 'active' : ''}`}
                            onClick={() => setFilter('corea')}
                        >
                            🇰🇷 Corea del Sur
                        </button>
                        <button
                            className={`port-filter-btn ${filter === 'experiencia' ? 'active' : ''}`}
                            onClick={() => setFilter('experiencia')}
                        >
                            🍵 Experiencias
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== BENTO PHOTO GALLERY ===== */}
            <section className="container port-gallery-section">
                <div className="port-grid">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={`port-card ${item.span ? `port-card--${item.span}` : ''}`}
                            onClick={() => setSelectedPhoto(item)}
                        >
                            <img src={item.image} alt={item.title} loading="lazy" />
                            <div className="port-card-overlay">
                                <div className="port-card-top-tags">
                                    <span className="port-tag">{item.tag}</span>
                                    <span className="port-year">{item.year}</span>
                                </div>
                                <div className="port-card-info">
                                    <span className="port-location"><LuMapPin size={13} /> {item.location}</span>
                                    <h3 className="port-title">{item.title}</h3>
                                    <p className="port-caption">{item.caption}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== EDITIONS RECAP BAR ===== */}
            <section className="port-editions-section">
                <div className="container">
                    <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span className="section-tag">Nuestras Rutas</span>
                        <h2 className="section-title" style={{ color: '#fff' }}>¿Cuál es tu <span style={{ color: 'var(--color-primary, #e91e63)' }}>temporada soñada</span>?</h2>
                        <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>Descubre las ediciones anuales y aparta tu lugar con anticipación.</p>
                    </div>

                    <div className="port-editions-grid">
                        {EDITIONS.map((ed, i) => (
                            <div className="port-edition-card" key={i}>
                                <div className="port-ed-badge">{ed.badge}</div>
                                <h3>{ed.name}</h3>
                                <span className="port-ed-dates">{ed.dates}</span>
                                <p>{ed.desc}</p>
                                <Link to={ed.link} className="btn btn-outline port-ed-btn">
                                    Explorar Edición <LuArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA BOTTOM ===== */}
            <section className="port-cta-section">
                <div className="container port-cta-box">
                    <div className="port-cta-text">
                        <h2>¿Listo para ser el protagonista de la próxima foto?</h2>
                        <p>Platícanos qué fecha tienes en mente y te asesoramos personalmente.</p>
                    </div>
                    <a
                        href={`${WHATSAPP_BASE}SW-Hola%20vi%20el%20portafolio%20de%20fotos%20y%20quiero%20cotizar%20mi%20viaje`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary port-cta-btn"
                    >
                        <span>💬 Cotizar mi Aventura →</span>
                    </a>
                </div>
            </section>

            {/* ===== LIGHTBOX MODAL ===== */}
            {selectedPhoto && (
                <div className="port-lightbox" onClick={() => setSelectedPhoto(null)}>
                    <div className="port-lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="port-lightbox-close" onClick={() => setSelectedPhoto(null)}>
                            <LuX size={24} />
                        </button>
                        <img src={selectedPhoto.image} alt={selectedPhoto.title} />
                        <div className="port-lightbox-info">
                            <span className="port-lightbox-tag">{selectedPhoto.tag} · {selectedPhoto.location}</span>
                            <h3>{selectedPhoto.title}</h3>
                            <p>{selectedPhoto.caption}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
