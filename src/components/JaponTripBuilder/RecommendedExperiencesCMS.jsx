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

export default function RecommendedExperiencesCMS({ addedExperiences = [], onToggleExperience, seasonName = 'tu viaje', tourLimit = null }) {
    const [tours, setTours] = useState([])
    const [loading, setLoading] = useState(true)
    const [openCategories, setOpenCategories] = useState(['rutas']) // "Rutas por Japón" open by default

    useEffect(() => {
        let isMounted = true
        async function loadData() {
            setLoading(true)
            const data = await fetchTourIndividuales()
            if (isMounted) {
                setTours(data)
                setLoading(false)
            }
        }
        loadData()
        return () => { isMounted = false }
    }, [])

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
                    Catálogo oficial de experiencias. Explora nuestras 3 categorías y selecciona tus experiencias:
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
                        const catTours = tours.filter(catConfig.matchFn)
                        const isOpen = openCategories.includes(catConfig.key)

                        return (
                            <div
                                key={catConfig.key}
                                className={`rec-cms-acc-item${isOpen ? ' rec-cms-acc-item--open' : ''}`}
                            >
                                {/* Accordion Header */}
                                <div
                                    className="rec-cms-acc-header"
                                    onClick={(e) => toggleCategory(catConfig.key, e)}
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

                                {/* Accordion Body Collapsible */}
                                {isOpen && (
                                    <div className="rec-cms-acc-body">
                                        <p className="rec-cms-cat-desc">{catConfig.desc}</p>
                                        {catTours.length === 0 ? (
                                            <p className="rec-cms-empty">No hay tours en esta categoría actualmente.</p>
                                        ) : (
                                            <div className="rec-cms-cards-grid">
                                                {catTours.map((tour) => {
                                                    const isAdded = addedExperiences.includes(tour.id) || addedExperiences.includes(tour.title)
                                                    const isDisabled = isLimitReached && !isAdded
                                                    return (
                                                        <div
                                                            key={tour.id}
                                                            className={`rec-cms-card${isAdded ? ' rec-cms-card--added' : ''}`}
                                                        >
                                                            <div className="rec-cms-card-img-box">
                                                                <img
                                                                    src={tour.image}
                                                                    alt={tour.title}
                                                                    loading="lazy"
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
                                                                    }}
                                                                />
                                                                {(tour.days || tour.hours) && (
                                                                    <span className="rec-cms-duration-badge">
                                                                        ⏱️ {tour.days ? `${tour.days}` : ''} {tour.hours ? `(${tour.hours})` : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="rec-cms-card-body">
                                                                <h5 className="rec-cms-card-title">{tour.title}</h5>
                                                                {tour.excerpt && (
                                                                    <p className="rec-cms-card-excerpt">{tour.excerpt}</p>
                                                                )}
                                                                <div className="rec-cms-card-footer">
                                                                    <div className="rec-cms-card-price">
                                                                        {tour.priceText || (tour.priceNum ? `$${tour.priceNum.toLocaleString('es-MX')} MXN` : 'Consultar')}
                                                                    </div>
                                                                    {onToggleExperience && (
                                                                        <button
                                                                            type="button"
                                                                            className={`rec-cms-add-btn${isAdded ? ' rec-cms-add-btn--added' : isDisabled ? ' rec-cms-add-btn--disabled' : ''}`}
                                                                            onClick={() => onToggleExperience(tour.id, tour.title, tour.priceNum)}
                                                                        >
                                                                            {isAdded ? '✓ Agregado' : isDisabled ? 'Límite alcanzado' : '+ Agregar'}
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
        </div>
    )
}
