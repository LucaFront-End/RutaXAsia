import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuCamera, LuMapPin, LuCalendar, LuSparkles, LuX, LuArrowRight, LuPlane, LuImage, LuChevronLeft, LuChevronRight, LuUsers, LuCompass } from 'react-icons/lu'
import './Portafolio.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

// Curated Tour Metadata for CMS Albums
const ALBUM_METADATA = {
    'Corea 2024': {
        emoji: '🇰🇷',
        badge: 'Corea del Sur · Expedición 2024',
        location: 'Seúl, Busan, Isla Jeju & Bukchon',
        desc: 'Una travesía inolvidable por los palacios históricos en Hanbok, spots de K-Dramas, moda en Hongdae y gastronomía callejera en Myeongdong.',
        tourLink: '/viajes/corea',
        tourLabel: 'Ver Tour Corea',
    },
    'Japón Sakura 2025': {
        emoji: '🌸',
        badge: 'Japón Sakura · Primavera 2025',
        location: 'Tokio, Kioto, Osaka, Nara & Monte Fuji',
        desc: 'La temporada más codiciada del año: cerezos en flor en los templos milenarios de Kioto y vistas despejadas al Monte Fuji.',
        tourLink: '/viajes/japon',
        tourLabel: 'Ver Tour Sakura',
    },
    'Japón Sakura 2026': {
        emoji: '🌸',
        badge: 'Japón Sakura · Primavera 2026',
        location: 'Tokio, Kioto, Osaka & Kawaguchiko',
        desc: 'Próxima expedición en floración de cerezos. Experiencias seleccionadas, trenes bala Shinkansen y acompañamiento en español.',
        tourLink: '/viajes/japon',
        tourLabel: 'Apartar Sakura 2026',
    },
    'Japón Otoño': {
        emoji: '🍁',
        badge: 'Japón Momiji · Otoño Rojo',
        location: 'Tokio, Kioto, Kamakura & Nikko',
        desc: 'Los colores rojizos y dorados del Momiji en su máximo esplendor, clima templado y baños termales tradicionales Onsen.',
        tourLink: '/tours/octubre-japon-2026',
        tourLabel: 'Ver Tour Otoño',
    },
    'General': {
        emoji: '⛩️',
        badge: 'Japón & Asia · Experiencias Generales',
        location: 'Tokio, Kioto, Osaka, Miyajima & Nara',
        desc: 'Colección diversa de momentos capturados en múltiples expediciones: gastronomía callejera, templos ancestrales y vivencias de nuestros grupos.',
        tourLink: '/viajes/japon',
        tourLabel: 'Diseñar Viaje Libre',
    },
}

// Fallback items if API is temporarily loading
const FALLBACK_ALBUMS = [
    {
        id: 'fallback-corea',
        title: 'Corea 2024',
        total: 6,
        images: [
            { id: 'f-c-1', src: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=1000&fit=crop&q=80', title: 'Palacio en Hanbok', caption: 'Tradición y color en Seúl', album: 'Corea 2024', span: 'tall' },
            { id: 'f-c-2', src: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=600&fit=crop&q=80', title: 'Bukchon Hanok', caption: 'Calles tradicionales de Seúl', album: 'Corea 2024', span: '' },
            { id: 'f-c-3', src: 'https://images.unsplash.com/photo-1546874177-9e664107314e?w=800&h=600&fit=crop&q=80', title: 'Noche en Myeongdong', caption: 'Street food y compras', album: 'Corea 2024', span: '' },
        ]
    },
    {
        id: 'fallback-general',
        title: 'General',
        total: 6,
        images: [
            { id: 'f-g-1', src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=1000&fit=crop&q=80', title: 'Fushimi Inari, Kyoto', caption: 'Túnel de mil Torii', album: 'General', span: 'tall' },
            { id: 'f-g-2', src: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80', title: 'Tokyo Skyline', caption: 'Energía cosmopolita de Tokio', album: 'General', span: '' },
            { id: 'f-g-3', src: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop&q=80', title: 'Monte Fuji', caption: 'Vista despejada hacia el volcán sagrado', album: 'General', span: '' },
        ]
    }
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
        link: '/tours/octubre-japon-2026',
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
    const [albums, setAlbums] = useState(FALLBACK_ALBUMS)
    const [activeFilter, setActiveFilter] = useState('all') // 'all' | album title
    const [expandedAlbums, setExpandedAlbums] = useState({}) // { [albumTitle]: boolean }
    const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], index: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => { window.scrollTo(0, 0) }, [])

    // Fetch all albums from CMS
    useEffect(() => {
        let isMounted = true
        setIsLoading(true)

        fetch('/api/galeria-nosotros?title=all')
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return
                if (data.albums && data.albums.length > 0) {
                    setAlbums(data.albums)
                }
                setIsLoading(false)
            })
            .catch(err => {
                console.warn('[Portafolio] Error fetching albums:', err)
                if (isMounted) setIsLoading(false)
            })

        return () => { isMounted = false }
    }, [])

    // Keyboard controls for Lightbox
    useEffect(() => {
        if (!lightboxData.isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowRight') nextLightbox()
            if (e.key === 'ArrowLeft') prevLightbox()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [lightboxData])

    const openLightbox = (imagesList, startIndex) => {
        setLightboxData({
            isOpen: true,
            images: imagesList,
            index: startIndex,
        })
    }

    const closeLightbox = () => {
        setLightboxData(prev => ({ ...prev, isOpen: false }))
    }

    const nextLightbox = () => {
        setLightboxData(prev => ({
            ...prev,
            index: (prev.index + 1) % prev.images.length
        }))
    }

    const prevLightbox = () => {
        setLightboxData(prev => ({
            ...prev,
            index: (prev.index - 1 + prev.images.length) % prev.images.length
        }))
    }

    const toggleAlbumExpand = (albumTitle) => {
        setExpandedAlbums(prev => ({
            ...prev,
            [albumTitle]: !prev[albumTitle]
        }))
    }

    // Filter displayed albums
    const displayedAlbums = activeFilter === 'all'
        ? albums
        : albums.filter(a => a.title.toLowerCase() === activeFilter.toLowerCase())

    const totalPhotosCount = albums.reduce((sum, a) => sum + (a.images?.length || a.total || 0), 0)

    const currentLightboxImg = lightboxData.images[lightboxData.index]

    return (
        <div className="portafolio-page">
            <Helmet>
                <title>Portafolio de Viajes & Álbumes Reales | RutaXAsia</title>
                <meta name="description" content="Explora los álbumes y fotos reales de nuestros viajeros en Japón y Corea del Sur. Galerías seccionadas por expedición con Juan y Ale de RutaXAsia." />
            </Helmet>

            {/* ===== HERO ===== */}
            <section className="port-hero">
                <div className="port-hero-bg">
                    <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=800&fit=crop&q=80" alt="Portafolio RutaXAsia" />
                    <div className="port-hero-overlay" />
                </div>
                <div className="container port-hero-content">
                    <span className="port-hero-badge">
                        <LuCamera size={15} /> PORTAFOLIO & EXPEDICIONES REALES
                    </span>
                    <h1 className="port-hero-title">
                        Momentos Reales, <span className="port-glow-text">Historias Vivas</span>
                    </h1>
                    <p className="port-hero-sub">
                        Sin filtros de catálogo ni imágenes de archivo: 100% fotografías capturadas durante nuestros viajes en grupo por Japón y Corea del Sur.
                    </p>

                    {/* Stats Strip */}
                    <div className="port-stats-bar">
                        <div className="port-stat-item">
                            <span className="port-stat-num">{totalPhotosCount}+</span>
                            <span className="port-stat-lbl">Fotos en Galería</span>
                        </div>
                        <div className="port-stat-divider" />
                        <div className="port-stat-item">
                            <span className="port-stat-num">{albums.length}</span>
                            <span className="port-stat-lbl">Álbumes / Expediciones</span>
                        </div>
                        <div className="port-stat-divider" />
                        <div className="port-stat-item">
                            <span className="port-stat-num">+500</span>
                            <span className="port-stat-lbl">Viajeros Felices</span>
                        </div>
                        <div className="port-stat-divider" />
                        <div className="port-stat-item">
                            <span className="port-stat-num">4.9 ★</span>
                            <span className="port-stat-lbl">Calificación Promedio</span>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="port-filters">
                        <button
                            type="button"
                            className={`port-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            ✨ Todos los Álbumes ({totalPhotosCount})
                        </button>
                        {albums.map((alb) => {
                            const meta = ALBUM_METADATA[alb.title] || { emoji: '📸' }
                            return (
                                <button
                                    key={alb.id || alb.title}
                                    type="button"
                                    className={`port-filter-btn ${activeFilter === alb.title ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(alb.title)}
                                >
                                    {meta.emoji} {alb.title} ({alb.total || alb.images?.length || 0})
                                </button>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ===== SECTIONED EXPEDITIONS ALBUMS ===== */}
            <main className="port-albums-container">
                {displayedAlbums.map((album, aIdx) => {
                    const meta = ALBUM_METADATA[album.title] || {
                        emoji: '🌸',
                        badge: `Expedición · ${album.title}`,
                        location: 'Japón / Asia',
                        desc: 'Fotografías y vivencias compartidas por nuestros viajeros en este recorrido.',
                        tourLink: '/viajes/japon',
                        tourLabel: 'Conocer más',
                    }

                    const albumImages = album.images || []
                    const isExpanded = !!expandedAlbums[album.title]
                    const initialLimit = 8
                    const visibleImages = isExpanded ? albumImages : albumImages.slice(0, initialLimit)

                    return (
                        <section key={album.id || album.title} className="port-album-section" id={`album-${album.title.toLowerCase().replace(/\s+/g, '-')}`}>
                            <div className="container">
                                {/* Album Header Card */}
                                <div className="port-album-header">
                                    <div className="port-album-header-left">
                                        <div className="port-album-badge-row">
                                            <span className="port-album-badge">
                                                {meta.emoji} {meta.badge}
                                            </span>
                                            <span className="port-album-count-badge">
                                                <LuImage size={13} /> {albumImages.length} fotos
                                            </span>
                                        </div>
                                        <h2 className="port-album-title">{album.title}</h2>
                                        <p className="port-album-location">
                                            <LuMapPin size={15} /> {meta.location}
                                        </p>
                                        <p className="port-album-desc">{meta.desc}</p>
                                    </div>

                                    <div className="port-album-header-right">
                                        <Link to={meta.tourLink} className="btn btn-outline port-album-cta-btn">
                                            <span>{meta.tourLabel}</span>
                                            <LuArrowRight size={15} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Bento Grid for this Album */}
                                <div className="port-grid">
                                    {visibleImages.map((img, i) => (
                                        <div
                                            key={img.id || i}
                                            className={`port-card ${img.span ? `port-card--${img.span}` : ''}`}
                                            onClick={() => openLightbox(albumImages, i)}
                                        >
                                            <img
                                                src={img.src}
                                                alt={img.title || img.caption || 'Foto del tour'}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
                                                }}
                                            />
                                            <div className="port-card-overlay">
                                                <div className="port-card-top-tags">
                                                    <span className="port-tag">{meta.emoji} {album.title}</span>
                                                    <span className="port-year">#{i + 1}</span>
                                                </div>
                                                <div className="port-card-info">
                                                    <span className="port-location">
                                                        <LuMapPin size={13} /> {img.city || (img.title && !img.title.startsWith('IMG_') ? img.title : meta.location.split(',')[0])}
                                                    </span>
                                                    {(img.description || (img.caption && !img.caption.startsWith('IMG_') && img.caption !== img.title)) && (
                                                        <p className="port-caption">{img.description || img.caption}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* View More Photos for this Album */}
                                {albumImages.length > initialLimit && (
                                    <div className="port-album-footer">
                                        <button
                                            type="button"
                                            className="port-album-more-btn"
                                            onClick={() => toggleAlbumExpand(album.title)}
                                        >
                                            {isExpanded
                                                ? '▲ Ver menos fotos'
                                                : `📸 Ver todas las fotos de ${album.title} (${albumImages.length})`
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )
                })}
            </main>

            {/* ===== EDITIONS RECAP BAR ===== */}
            <section className="port-editions-section">
                <div className="container">
                    <div className="section-header" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <span className="section-tag">Nuestras Rutas</span>
                        <h2 className="section-title">¿Cuál es tu <span className="text-accent">temporada soñada</span>?</h2>
                        <p className="section-subtitle">Descubre las próximas ediciones anuales y aparta tu lugar con anticipación.</p>
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
                        <p>Platícanos qué fecha y destino tienes en mente. Juan y Ale te asesoran personalmente sin compromiso.</p>
                    </div>
                    <a
                        href={`${WHATSAPP_BASE}SW-Hola%20vi%20el%20portafolio%20de%20fotos%20y%20quiero%20cotizar%20mi%20viaje`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary port-cta-btn"
                    >
                        <span>💬 Cotizar mi Aventura por WhatsApp →</span>
                    </a>
                </div>
            </section>

            {/* ===== LIGHTBOX MODAL VIA PORTAL ===== */}
            {lightboxData.isOpen && currentLightboxImg && createPortal(
                <div className="port-lightbox-overlay" onClick={closeLightbox}>
                    <div className="port-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
                        <button className="port-lightbox-close" onClick={closeLightbox} aria-label="Cerrar foto">
                            <LuX size={22} />
                        </button>

                        {lightboxData.images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="port-lightbox-arrow port-lightbox-arrow--prev"
                                    onClick={prevLightbox}
                                    aria-label="Foto anterior"
                                >
                                    <LuChevronLeft size={28} />
                                </button>
                                <button
                                    type="button"
                                    className="port-lightbox-arrow port-lightbox-arrow--next"
                                    onClick={nextLightbox}
                                    aria-label="Siguiente foto"
                                >
                                    <LuChevronRight size={28} />
                                </button>
                            </>
                        )}

                        <div className="port-lightbox-img-wrapper">
                            <img
                                src={currentLightboxImg.src}
                                alt={currentLightboxImg.title || 'Foto de viaje'}
                                className="port-lightbox-img"
                            />
                        </div>

                        <div className="port-lightbox-info-bar">
                            <div>
                                <span className="port-lightbox-album-tag">
                                    {currentLightboxImg.album} · Foto {lightboxData.index + 1} de {lightboxData.images.length}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b9d', fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '6px' }}>
                                    <LuMapPin size={15} /> {currentLightboxImg.city || (currentLightboxImg.title && !currentLightboxImg.title.startsWith('IMG_') ? currentLightboxImg.title : currentLightboxImg.album)}
                                </div>
                                {currentLightboxImg.description && (
                                    <p className="port-lightbox-caption" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                                        {currentLightboxImg.description}
                                    </p>
                                )}
                            </div>

                            <a
                                href={`${WHATSAPP_BASE}SW-Hola%20me%20encanto%20la%20foto%20de%20${encodeURIComponent(currentLightboxImg.city || currentLightboxImg.album || 'viaje')}%20y%20quiero%20informes`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary port-lightbox-cta"
                            >
                                💬 Quiero este viaje
                            </a>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
