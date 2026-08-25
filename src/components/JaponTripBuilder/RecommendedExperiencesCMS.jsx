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
                const rect = headerEl.getBoundingClientRect()
                const navbarHeight = 110
                if (rect.top < navbarHeight || rect.top > window.innerHeight - 100) {
                    const y = rect.top + window.scrollY - navbarHeight - 20
                    window.scrollTo({ top: y, behavior: 'smooth' })
                }
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
                        // Filter and sort tours logically by City order
                        const catTours = (tours || [])
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
                                        ) : (
                                            <div className="rec-cms-cards-grid">
                                                {catTours.map((tour) => {
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
                                                })}
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
                                    {(detailDrawerTour.descripcinAmplia || detailDrawerTour.descripcionAmplia || detailDrawerTour.itinerario || detailDrawerTour.excerpt) ? (
                                        (detailDrawerTour.descripcinAmplia || detailDrawerTour.descripcionAmplia || detailDrawerTour.itinerario || detailDrawerTour.excerpt)
                                            .split('\n')
                                            .filter(p => p.trim())
                                            .map((paragraph, idx) => (
                                                <p key={idx}>{paragraph}</p>
                                            ))
                                    ) : (
                                        <p>Recorrido guiado de alta calidad con coordinadores y anfitriones de viaje en Japón.</p>
                                    )}
                                </div>
                            </div>

                            {detailDrawerTour.observaciones && (
                                <div className="rec-drawer-section rec-drawer-obs-box">
                                    <h4>📝 Observaciones y Recomendaciones</h4>
                                    <p>{detailDrawerTour.observaciones}</p>
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
