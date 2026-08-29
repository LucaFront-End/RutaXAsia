import { useState, useEffect } from 'react'
import { fetchTourIndividuales } from '../../lib/wixClient'
import './RecommendedExperiencesCMS.css'

const CATEGORIES_CONFIG = [
    {
        key: 'rutas',
        title: 'Rutas por Japón',
        icon: '⛩️',
        matchFn: (t) => t.category === 'Rutas por Japón' || (t.rawCategory && t.rawCategory.toLowerCase().includes('ruta')),
        desc: 'Recorridos guiados y city tours por Tokio, Kioto, Osaka, Hiroshima, Nara y pueblos tradicionales.',
    },
    {
        key: 'parques',
        title: 'Parques temáticos',
        icon: '🎢',
        matchFn: (t) => t.category === 'Parques temáticos' || (t.rawCategory && t.rawCategory.toLowerCase().includes('parque')),
        desc: 'Entradas y pases a DisneySea, Disneyland Tokio, Universal Studios Japan y Warner Bros Harry Potter.',
    },
    {
        key: 'vip',
        title: 'Experiencias Vip',
        icon: '✨',
        matchFn: (t) => t.category === 'Experiencias Vip' || (t.rawCategory && (t.rawCategory.toLowerCase().includes('vip') || t.rawCategory.toLowerCase().includes('experiencia'))),
        desc: 'Ceremonias de té, experiencias Samurai, vestimenta de Kimono, banquetes reales en crucero Yakatabune y más.',
    },
]

// Logical City Order Priority for Clean Grouping
const CITY_ORDER_PRIORITY = {
    'tokio': 1,
    'tokyo': 1,
    'kioto': 2,
    'kyoto': 2,
    'osaka': 3,
    'nara': 4,
    'takayama': 5,
    'shirakawago': 6,
    'kanazawa': 7,
    'hiroshima': 8,
    'fuji': 9,
    'hakone': 9,
    'kamakura': 10,
    'nikko': 11,
    'kobe': 12,
    'himeji': 13,
}

// Grouping of individual cities (1 franja por ciudad) for "Rutas por Japón"
const CITY_GROUPS = [
    {
        key: 'tokio',
        name: 'Tokio',
        icon: '🗼',
        tag: 'Barrios icónicos · Asakusa · Akihabara · Sky Tree',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return (raw.includes('tokio') || raw.includes('tokyo') || raw.includes('asakusa') || raw.includes('akihabara') || raw.includes('barrios')) &&
                   !raw.includes('nikko') && !raw.includes('fuji') && !raw.includes('hakone') && !raw.includes('kamakura') && !raw.includes('gotemba')
        }
    },
    {
        key: 'fuji-hakone',
        name: 'Monte Fuji y Hakone',
        icon: '🗻',
        tag: 'Vistas panorámicas del Monte Fuji · Lago Ashi · Gotemba',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('fuji') || raw.includes('hakone') || raw.includes('gotemba')
        }
    },
    {
        key: 'nikko',
        name: 'Nikko',
        icon: '⛩️',
        tag: 'Santuarios Patrimonio de la Humanidad y naturaleza',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('nikko')
        }
    },
    {
        key: 'kamakura',
        name: 'Kamakura',
        icon: '🌊',
        tag: 'Gran Buda de Kamakura · Templos y costa',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('kamakura')
        }
    },
    {
        key: 'osaka',
        name: 'Osaka',
        icon: '🏯',
        tag: 'Castillo de Osaka · Dotonbori · Gastronomía callejera',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return (raw.includes('osaka') || raw.includes('dotonbori')) && !raw.includes('himeji') && !raw.includes('naoshima')
        }
    },
    {
        key: 'kioto',
        name: 'Kioto',
        icon: '⛩️',
        tag: 'Templos milenarios · Gion · Pabellón Dorado y Arashiyama',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return (raw.includes('kyoto') || raw.includes('kioto')) && !raw.includes('osaka') && !raw.includes('nara') && !raw.includes('uji')
        }
    },
    {
        key: 'nara',
        name: 'Nara',
        icon: '🦌',
        tag: 'Parque de los Ciervos Sagrados y Templo Todaiji',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('nara')
        }
    },
    {
        key: 'uji',
        name: 'Uji',
        icon: '🍵',
        tag: 'Cuna del Té Matcha y Santuarios tradicionales',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('uji') && !raw.includes('nara')
        }
    },
    {
        key: 'himeji-kobe',
        name: 'Himeji y Kobe',
        icon: '🏰',
        tag: 'Castillo de la Garza Blanca y Bahía de Kobe',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('himeji') || raw.includes('kobe')
        }
    },
    {
        key: 'naoshima',
        name: 'Isla de Naoshima',
        icon: '🎨',
        tag: 'Isla del Arte Moderno y esculturas icónicas',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('naoshima')
        }
    },
    {
        key: 'hiroshima',
        name: 'Hiroshima',
        icon: '🕊️',
        tag: 'Parque Memorial de la Paz y Castillo de Hiroshima',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('hiroshima') && !raw.includes('miyajima')
        }
    },
    {
        key: 'miyajima',
        name: 'Isla de Miyajima',
        icon: '⛩️',
        tag: 'Torii Flotante del Santuario Itsukushima',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('miyajima')
        }
    },
    {
        key: 'fukuoka',
        name: 'Fukuoka',
        icon: '🍜',
        tag: 'Capital de Kyushu · Puestos Yatai y ramen Hakata',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('fukuoka')
        }
    },
    {
        key: 'takayama',
        name: 'Takayama',
        icon: '🏮',
        tag: 'Casco antiguo Sanmachi Suji y sake tradicional',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return (raw.includes('takayama') || (t.city && t.city.toLowerCase().includes('takayama'))) && !raw.includes('shirakawa') && !raw.includes('kanazawa')
        }
    },
    {
        key: 'shirakawago',
        name: 'Shirakawago',
        icon: '🏔️',
        tag: 'Aldea histórica con casas tradicionales Gassho-zukuri',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return raw.includes('shirakawago') || raw.includes('shirakawa')
        }
    },
    {
        key: 'kanazawa',
        name: 'Kanazawa',
        icon: '🏯',
        tag: 'Jardín Kenrokuen y barrio de Geishas Higashi Chaya',
        matchFn: (t) => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            return (raw.includes('kanazawa') || (t.city && t.city.toLowerCase().includes('kanazawa'))) && !raw.includes('shirakawa') && !raw.includes('takayama')
        }
    },
]

function getCityPriority(tour) {
    const raw = `${tour.city || ''} ${tour.title || ''}`.toLowerCase()
    for (const [key, prio] of Object.entries(CITY_ORDER_PRIORITY)) {
        if (raw.includes(key)) return prio
    }
    return 99
}

export default function RecommendedExperiencesCMS({ 
    addedExperiences = [], 
    onToggleExperience, 
    seasonName = 'tu viaje', 
    tourLimit = null,
    planStyle = 'Esencial',
    onPreselectTours = null
}) {
    const [tours, setTours] = useState([])
    const [loading, setLoading] = useState(true)
    const [openCategories, setOpenCategories] = useState(['rutas'])
    const [detailDrawerTour, setDetailDrawerTour] = useState(null)

    const checkIsFreeForThisPlan = (tour) => {
        if (!tour) return false
        const s = (planStyle || '').toLowerCase()
        if (s.includes('esencial') || s.includes('guiado')) return Boolean(tour.esencial)
        if (s.includes('completo') || s.includes('acompañado') || s.includes('acompanado')) return Boolean(tour.completo)
        if (s.includes('libre')) return Boolean(tour.libre)
        if (s.includes('signature') || s.includes('vip')) return Boolean(tour.signature)
        return false
    }

    // Close drawer on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setDetailDrawerTour(null)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        let isMounted = true
        async function loadData() {
            setLoading(true)
            const data = await fetchTourIndividuales()
            if (isMounted) {
                setTours(data || [])
                setLoading(false)

                // Auto pre-select tours that are tagged for this active plan dynamically from CMS
                if (onPreselectTours && Array.isArray(data)) {
                    const freeTours = data.filter(t => checkIsFreeForThisPlan(t))
                    if (freeTours.length > 0) {
                        onPreselectTours(freeTours)
                    }
                }
            }
        }
        loadData()
        return () => { isMounted = false }
    }, [planStyle])

    const toggleCategory = (key, event) => {
        const headerEl = event?.currentTarget
        const isOpening = !openCategories.includes(key)

        setOpenCategories(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )

        if (headerEl && isOpening) {
            setTimeout(() => {
            }, 80)
        }
    }

    const isLimitReached = tourLimit !== null && addedExperiences.length >= tourLimit

    const checkIsTourAdded = (tour) => {
        if (!tour || !Array.isArray(addedExperiences)) return false
        return addedExperiences.some(item => {
            if (!item) return false
            if (typeof item === 'object') {
                return item.id === tour.id || item.name === tour.title || item.title === tour.title
            }
            return item === tour.id || item === tour.title
        })
    }

    const renderTourCard = (tour) => {
        const isAdded = checkIsTourAdded(tour)
        const isDisabled = isLimitReached && !isAdded
        const isFreeForPlan = checkIsFreeForThisPlan(tour)

        return (
            <div
                key={tour.id}
                className={`rec-cms-card${isAdded ? ' rec-cms-card--added' : ''}`}
                style={{
                    border: isFreeForPlan ? '2px solid #10b981' : undefined
                }}
            >
                <div 
                    className="rec-cms-card-img-box"
                    onClick={() => setDetailDrawerTour(tour)}
                    style={{ cursor: 'pointer' }}
                >
                    <img
                        src={tour.image}
                        alt={tour.title}
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
                        }}
                    />
                    {isFreeForPlan ? (
                        <span className="rec-cms-free-badge">
                            ✨ Incluido Gratis
                        </span>
                    ) : tour.city ? (
                        <span className="rec-cms-city-badge">
                            📍 {tour.city}
                        </span>
                    ) : null}

                    {(tour.days || tour.hours) && (
                        <span className="rec-cms-duration-badge">
                            ⏱️ {tour.days ? `${tour.days}` : ''} {tour.hours ? `(${tour.hours})` : ''}
                        </span>
                    )}

                    {/* Top Right '+' Quick Info Button */}
                    <button
                        type="button"
                        className="rec-cms-plus-btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            setDetailDrawerTour(tour)
                        }}
                        title="Ver información completa del tour"
                        aria-label="Más información"
                    >
                        +
                    </button>
                </div>
                <div className="rec-cms-card-body">
                    <h5 
                        className="rec-cms-card-title"
                        onClick={() => setDetailDrawerTour(tour)}
                        style={{ cursor: 'pointer' }}
                    >
                        {tour.title}
                    </h5>
                    {tour.excerpt && (
                        <p className="rec-cms-card-excerpt">{tour.excerpt}</p>
                    )}
                    <div className="rec-cms-card-footer">
                        <div className="rec-cms-card-price">
                            {isFreeForPlan ? (
                                <span style={{ color: '#059669', fontWeight: 800 }}>$0 MXN (Gratis)</span>
                            ) : (
                                <span>+{tour.priceText || (tour.priceNum ? `$${tour.priceNum.toLocaleString('es-MX')} MXN` : 'Consultar')}</span>
                            )}
                        </div>
                        {onToggleExperience && (
                            <button
                                type="button"
                                className={`rec-cms-add-btn${isAdded ? ' rec-cms-add-btn--added' : isDisabled ? ' rec-cms-add-btn--disabled' : ''}`}
                                onClick={() => onToggleExperience(tour.id, tour.title, isFreeForPlan ? 0 : tour.priceNum)}
                                style={isFreeForPlan && isAdded ? { background: '#059669', borderColor: '#059669' } : undefined}
                            >
                                {isAdded ? (isFreeForPlan ? '✓ Incluido' : '✓ Agregado') : isDisabled ? 'Límite alcanzado' : (isFreeForPlan ? '+ Incluir Gratis' : '+ Agregar Extra')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rec-cms-wrapper">
            <div className="rec-cms-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 className="rec-cms-main-title">🌸 Experiencias recomendadas para {seasonName}</h3>
                    {tourLimit && (
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', background: 'rgba(233, 30, 99, 0.1)', color: 'var(--color-primary, #d6336c)', padding: '4px 12px', borderRadius: '100px' }}>
                            🎯 Límite del pase: {addedExperiences.length} / {tourLimit} tours
                        </span>
                    )}
                </div>
                <p className="rec-cms-subtitle">
                    Catálogo oficial de experiencias organizadas por ciudad. Los tours marcados para tu plan <strong>{planStyle}</strong> son <strong>100% Gratis</strong>. Haz clic en <strong>+</strong> para ver información detallada sin salir de la página:
                </p>
            </div>

            {loading ? (
                <div className="rec-cms-loading">
                    <span className="rec-cms-spinner">⛩️</span>
                    <p>Cargando experiencias...</p>
                </div>
            ) : (
                <div className="rec-cms-accordion-list">
                    {CATEGORIES_CONFIG.map((catConfig) => {
                        // Filter and sort tours logically by City order (only tours appearing in list)
                        const catTours = (tours || [])
                            .filter(t => Boolean(t.apareceEnLista))
                            .filter(catConfig.matchFn)
                            .sort((a, b) => {
                                const prioA = getCityPriority(a)
                                const prioB = getCityPriority(b)
                                if (prioA !== prioB) return prioA - prioB
                                return (a.city || '').localeCompare(b.city || '')
                            })
                        const isOpen = openCategories.includes(catConfig.key)

                        return (
                            <div
                                key={catConfig.key}
                                className={`rec-cms-acc-item${isOpen ? ' rec-cms-acc-item--open' : ''}`}
                            >
                                <div
                                    className="rec-cms-acc-header"
                                    onClick={(e) => toggleCategory(catConfig.key, e)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            toggleCategory(catConfig.key, e)
                                        }
                                    }}
                                >
                                    <div className="rec-cms-acc-title-wrap">
                                        <span className="rec-cms-acc-icon">{catConfig.icon}</span>
                                        <div>
                                            <h4 className="rec-cms-acc-title">{catConfig.title}</h4>
                                            <span className="rec-cms-acc-count">
                                                {catTours.length} tour{catTours.length !== 1 ? 's' : ''} disponible{catTours.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rec-cms-acc-chevron">
                                        {isOpen ? '▲' : '▼'}
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="rec-cms-acc-body">
                                        <p className="rec-cms-cat-desc">{catConfig.desc}</p>
                                        {catTours.length === 0 ? (
                                            <p className="rec-cms-empty">No hay tours en esta categoría actualmente.</p>
                                        ) : catConfig.key === 'rutas' ? (
                                            <div className="rec-cms-city-groups-list">
                                                {CITY_GROUPS.map((cityGrp) => {
                                                    const grpTours = catTours.filter(cityGrp.matchFn)
                                                    if (grpTours.length === 0) return null

                                                    return (
                                                        <div key={cityGrp.key} className="rec-cms-city-group-block">
                                                            <div className="rec-cms-city-group-header">
                                                                <div className="rec-cms-city-group-title-wrap">
                                                                    <span className="rec-cms-city-group-icon">{cityGrp.icon}</span>
                                                                    <div>
                                                                        <h5 className="rec-cms-city-group-title">{cityGrp.name}</h5>
                                                                        <span className="rec-cms-city-group-tag">{cityGrp.tag}</span>
                                                                    </div>
                                                                </div>
                                                                <span className="rec-cms-city-group-badge">
                                                                    {grpTours.length} tour{grpTours.length !== 1 ? 's' : ''} disponibles
                                                                </span>
                                                            </div>

                                                            <div className="rec-cms-cards-grid">
                                                                {grpTours.map((tour) => renderTourCard(tour))}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="rec-cms-cards-grid">
                                                {catTours.map((tour) => renderTourCard(tour))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Right Slide-in Info Drawer Backdrop & Panel */}
            <div
                className={`rec-drawer-overlay${detailDrawerTour ? ' rec-drawer-overlay--open' : ''}`}
                onClick={() => setDetailDrawerTour(null)}
            />

            <div className={`rec-drawer-panel${detailDrawerTour ? ' rec-drawer-panel--open' : ''}`}>
                {detailDrawerTour && (
                    <>
                        <div className="rec-drawer-header">
                            <div>
                                <span className="rec-drawer-badge">
                                    {detailDrawerTour.category || 'Tour'} • 📍 {detailDrawerTour.city || 'Japón'}
                                </span>
                                <h2 className="rec-drawer-title">{detailDrawerTour.title}</h2>
                            </div>
                            <button
                                type="button"
                                className="rec-drawer-close"
                                onClick={() => setDetailDrawerTour(null)}
                                aria-label="Cerrar detalles"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="rec-drawer-body">
                            <div className="rec-drawer-img-wrap">
                                <img
                                    src={detailDrawerTour.image}
                                    alt={detailDrawerTour.title}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
                                    }}
                                />
                                <div className="rec-drawer-img-overlay">
                                    <span>⏱️ Duración: <strong>{detailDrawerTour.days || '1 día'} {detailDrawerTour.hours ? `(${detailDrawerTour.hours})` : ''}</strong></span>
                                </div>
                            </div>

                            <div className="rec-drawer-highlights">
                                <div className="rec-drawer-highlight-card">
                                    <span className="rec-drawer-hl-icon">📍</span>
                                    <div>
                                        <span className="rec-drawer-hl-label">Destino</span>
                                        <strong className="rec-drawer-hl-val">{detailDrawerTour.city || 'Japón'}</strong>
                                    </div>
                                </div>
                                <div className="rec-drawer-highlight-card">
                                    <span className="rec-drawer-hl-icon">⏱️</span>
                                    <div>
                                        <span className="rec-drawer-hl-label">Duración</span>
                                        <strong className="rec-drawer-hl-val">{detailDrawerTour.days || '1 día'}</strong>
                                    </div>
                                </div>
                                <div className="rec-drawer-highlight-card">
                                    <span className="rec-drawer-hl-icon">🏷️</span>
                                    <div>
                                        <span className="rec-drawer-hl-label">Plan</span>
                                        <strong className="rec-drawer-hl-val" style={{ color: checkIsFreeForThisPlan(detailDrawerTour) ? '#059669' : '#e11d48' }}>
                                            {checkIsFreeForThisPlan(detailDrawerTour) ? 'Gratis' : 'Extra'}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="rec-drawer-section">
                                <h3>⛩️ Acerca de este Tour</h3>
                                <div className="rec-drawer-desc-content">
                                    {(detailDrawerTour.shortDescription || detailDrawerTour.descripcinAmplia || detailDrawerTour.excerpt) ? (
                                        (detailDrawerTour.shortDescription || detailDrawerTour.descripcinAmplia || detailDrawerTour.excerpt)
                                            .split('\n')
                                            .filter(p => p.trim())
                                            .map((paragraph, idx) => (
                                                <p key={idx}>{paragraph}</p>
                                            ))
                                    ) : (
                                        <p>Recorrido guiado de alta calidad con coordinadores y anfitriones de viaje en Japón.</p>
                                    )}
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <a
                                        href={`/tours-individuales/${detailDrawerTour.slug || detailDrawerTour.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                            color: 'var(--color-primary, #d6336c)',
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        🌐 Ver página completa del tour →
                                    </a>
                                </div>
                            </div>

                            {(detailDrawerTour.observations || detailDrawerTour.observaciones) && (
                                <div className="rec-drawer-section rec-drawer-obs-box">
                                    <h4>📝 Observaciones y Recomendaciones</h4>
                                    <p>{detailDrawerTour.observations || detailDrawerTour.observaciones}</p>
                                </div>
                            )}
                        </div>

                        {/* Sticky Footer CTA */}
                        <div className="rec-drawer-footer">
                            <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                                    {checkIsFreeForThisPlan(detailDrawerTour) ? 'Incluido en tu plan:' : 'Precio Extra:'}
                                </span>
                                <strong style={{ fontSize: '1.25rem', color: checkIsFreeForThisPlan(detailDrawerTour) ? '#059669' : 'var(--color-primary, #e11d48)', fontWeight: 900 }}>
                                    {checkIsFreeForThisPlan(detailDrawerTour) ? '$0 MXN (Gratis)' : (detailDrawerTour.priceText || (detailDrawerTour.priceNum ? `$${detailDrawerTour.priceNum.toLocaleString('es-MX')} MXN` : 'Consultar'))}
                                </strong>
                            </div>
                            {onToggleExperience && (
                                <button
                                    type="button"
                                    className={`rec-drawer-add-btn${checkIsTourAdded(detailDrawerTour) ? ' rec-drawer-add-btn--added' : ''}`}
                                    onClick={() => {
                                        const isFree = checkIsFreeForThisPlan(detailDrawerTour)
                                        onToggleExperience(detailDrawerTour.id, detailDrawerTour.title, isFree ? 0 : detailDrawerTour.priceNum)
                                    }}
                                    style={checkIsFreeForThisPlan(detailDrawerTour) && checkIsTourAdded(detailDrawerTour) ? { background: '#059669', borderColor: '#059669' } : undefined}
                                >
                                    {checkIsTourAdded(detailDrawerTour)
                                        ? (checkIsFreeForThisPlan(detailDrawerTour) ? '✓ Incluido en el Plan' : '✓ Agregado al Itinerario')
                                        : (checkIsFreeForThisPlan(detailDrawerTour) ? '✨ Incluir Gratis' : '+ Agregar Extra')}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
