import { useState, useEffect } from 'react'
import FallingElements from './FallingElements'

/**
 * KamakuraSplitHero — Dual split interactive hero for Kamakura (Otoño & Invierno).
 * Usable on JaponTemporada and in Experience pages (Esencial, Libre, Completo, Signature).
 */
export default function KamakuraSplitHero({
    activeSubSeason = 'otono',
    onSelectSeason,
    experienceName = null,
    scrollTargetId = '#configurador',
    buttonText = null,
}) {
    const [activeSplit, setActiveSplit] = useState(null)
    const [mobileSeasonTab, setMobileSeasonTab] = useState(activeSubSeason || 'otono')

    useEffect(() => {
        if (activeSubSeason) {
            setMobileSeasonTab(activeSubSeason)
        }
    }, [activeSubSeason])

    const handleSelect = (sub) => {
        setMobileSeasonTab(sub)
        if (onSelectSeason) {
            onSelectSeason(sub)
        }
    }

    const defaultBtnText = buttonText || (experienceName ? `Configura tu Pase ${experienceName}` : 'Elige tu estilo de viaje')

    const handleActionClick = (e, sub) => {
        e.stopPropagation()
        handleSelect(sub)
        if (scrollTargetId) {
            const el = document.querySelector(scrollTargetId)
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }

    return (
        <section className="jac-split-hero">
            {/* Mobile toggle between Otoño and Invierno */}
            <div className="jac-split-mobile-switch">
                <button
                    type="button"
                    className={mobileSeasonTab === 'otono' ? 'active' : ''}
                    onClick={() => handleSelect('otono')}
                >
                    🍁 Otoño
                </button>
                <button
                    type="button"
                    className={mobileSeasonTab === 'invierno' ? 'active' : ''}
                    onClick={() => handleSelect('invierno')}
                >
                    ❄️ Invierno
                </button>
            </div>

            {/* Panel 1: Otoño (Momiji) */}
            <div
                className={`jac-split-panel jac-split-panel--otono ${activeSplit === 'otono' ? 'is-expanded' : activeSplit === 'invierno' ? 'is-collapsed' : ''} ${mobileSeasonTab === 'otono' ? 'mobile-active' : 'mobile-hidden'}`}
                onMouseEnter={() => { setActiveSplit('otono'); handleSelect('otono'); }}
                onMouseLeave={() => setActiveSplit(null)}
                onClick={() => { setActiveSplit(activeSplit === 'otono' ? null : 'otono'); handleSelect('otono'); }}
            >
                <div className="jac-split-bg">
                    <img src="/otono-japan.jpg" alt="Otoño en Japón" />
                    <div className="jac-hero-overlay" />
                </div>
                <FallingElements type="momiji" />

                {/* Collapsed vertical tab (only rendered when collapsed) */}
                {activeSplit === 'invierno' && (
                    <div className="jac-split-collapsed-tab">
                        <span>🍁 OTOÑO</span>
                    </div>
                )}

                <div className="jac-split-content">
                    <span className="jac-split-tag">
                        🍁 Temporada Otoño {experienceName ? `· ${experienceName}` : ''}
                    </span>
                    <div className="jac-split-torii">⛩️</div>
                    <h1 className="jac-split-title">
                        VIVE JAPÓN EN <span className="jac-split-accent jac-split-accent--otono">OTOÑO</span>
                    </h1>
                    <p className="jac-split-desc">
                        Los colores del otoño y templos serenos transforman Japón. Paisajes mágicos de Momiji, gastronomía de temporada y experiencias inolvidables.
                    </p>
                    <div className="jac-split-chips">
                        <span className="jac-split-chip">🍁 Momiji (Hojas rojas)</span>
                        <span className="jac-split-chip">🍁 Templos dorados</span>
                        <span className="jac-split-chip">🍁 Gastronomía otoñal</span>
                        <span className="jac-split-chip">🍁 Clima fresco y templado</span>
                    </div>
                    <a
                        href={scrollTargetId}
                        className="jac-split-btn"
                        onClick={(e) => handleActionClick(e, 'otono')}
                    >
                        {defaultBtnText} <span className="jac-split-arrow">↓</span>
                    </a>
                </div>
            </div>

            {/* Panel 2: Invierno (Nieve & Onsen) */}
            <div
                className={`jac-split-panel jac-split-panel--invierno ${activeSplit === 'invierno' ? 'is-expanded' : activeSplit === 'otono' ? 'is-collapsed' : ''} ${mobileSeasonTab === 'invierno' ? 'mobile-active' : 'mobile-hidden'}`}
                onMouseEnter={() => { setActiveSplit('invierno'); handleSelect('invierno'); }}
                onMouseLeave={() => setActiveSplit(null)}
                onClick={() => { setActiveSplit(activeSplit === 'invierno' ? null : 'invierno'); handleSelect('invierno'); }}
            >
                <div className="jac-split-bg">
                    <img src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1920&h=900&fit=crop&q=85" alt="Invierno en Japón" />
                    <div className="jac-hero-overlay" />
                </div>
                <FallingElements type="invierno" />

                {/* Collapsed vertical tab (only rendered when collapsed) */}
                {activeSplit === 'otono' && (
                    <div className="jac-split-collapsed-tab">
                        <span>❄️ INVIERNO</span>
                    </div>
                )}

                <div className="jac-split-content">
                    <span className="jac-split-tag jac-split-tag--invierno">
                        ❄️ Temporada Invierno {experienceName ? `· ${experienceName}` : ''}
                    </span>
                    <div className="jac-split-torii jac-split-torii--invierno">⛩️</div>
                    <h1 className="jac-split-title">
                        VIVE JAPÓN EN <span className="jac-split-accent jac-split-accent--invierno">INVIERNO</span>
                    </h1>
                    <p className="jac-split-desc">
                        Paisajes nevados, aguas termales Onsen humeantes con vista al Monte Fuji y las iluminaciones invernales más espectaculares de Japón.
                    </p>
                    <div className="jac-split-chips">
                        <span className="jac-split-chip">❄️ Onsen en la nieve</span>
                        <span className="jac-split-chip">🏔️ Monte Fuji nevado</span>
                        <span className="jac-split-chip">🏮 Iluminaciones invernales</span>
                        <span className="jac-split-chip">🐒 Monos de Jigokudani</span>
                    </div>
                    <a
                        href={scrollTargetId}
                        className="jac-split-btn"
                        onClick={(e) => handleActionClick(e, 'invierno')}
                    >
                        {defaultBtnText} <span className="jac-split-arrow">↓</span>
                    </a>
                </div>
            </div>

            {/* Subtle central hint */}
            <div className={`jac-split-hint ${activeSplit ? 'is-hidden' : ''}`}>
                <span>⇄ Pasa el mouse para explorar cada temporada</span>
            </div>
        </section>
    )
}
