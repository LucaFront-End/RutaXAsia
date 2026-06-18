import { useState, useRef, useCallback, useEffect } from 'react'
import {
    TEMPORADAS,
    TEMPORADA_ORDER,
    EXPERIENCIA_ORDER,
    EXPERIENCIAS,
    HIGHLIGHTS_STRIP,
} from '../../data/japonData'
import StepLibre from './StepLibre'
import StepGuiado from './StepGuiado'
import StepAcompanado from './StepAcompanado'
import StepSignature from './StepSignature'
import './JaponTripBuilder.css'


/**
 * JaponTripBuilder — Interactive multi-step Japan trip configurator.
 *
 * Step 1: Select Season (Sakura / Verano / Momiji)
 * Step 2: Select Style (Libre / Guiado / Acompañado / Signature)
 * Step 3: Dynamic landing unique per experience type
 */
export default function JaponTripBuilder() {
    const [step, setStep] = useState(1)
    const [selectedSeason, setSelectedSeason] = useState(null)
    const [selectedStyle, setSelectedStyle] = useState(null)
    const [progressScrolled, setProgressScrolled] = useState(false)

    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const builderRef = useRef(null)

    // Track scroll for progress bar shadow
    useEffect(() => {
        const onScroll = () => setProgressScrolled(window.scrollY > 200)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Re-observe [data-animate] elements when step changes (fixes opacity: 0 on dynamic content)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = parseInt(entry.target.dataset.delay || '0', 10)
                        setTimeout(() => entry.target.classList.add('animated'), delay)
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1 }
        )

        const timer = setTimeout(() => {
            const wrapper = builderRef.current
            if (!wrapper) return
            wrapper.querySelectorAll('[data-animate]:not(.animated)').forEach((el) => {
                observer.observe(el)
            })
        }, 150)

        return () => {
            clearTimeout(timer)
            observer.disconnect()
        }
    }, [step])

    // Smooth scroll to a ref after a short delay for DOM to render
    const scrollToRef = useCallback((ref) => {
        setTimeout(() => {
            ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 250)
    }, [])

    // STEP 1: Select season
    const handleSeasonSelect = useCallback((key) => {
        setSelectedSeason(key)
        setSelectedStyle(null)
        setStep(2)
        scrollToRef(step2Ref)
    }, [scrollToRef])

    // STEP 2: Select style
    const handleStyleSelect = useCallback((key) => {
        setSelectedStyle(key)
        setStep(3)
        scrollToRef(step3Ref)
    }, [scrollToRef])

    // Go back to a step
    const goToStep = useCallback((targetStep) => {
        if (targetStep < step) {
            if (targetStep === 1) {
                setSelectedSeason(null)
                setSelectedStyle(null)
            } else if (targetStep === 2) {
                setSelectedStyle(null)
            }
            setStep(targetStep)
        }
    }, [step])

    // Current colors
    const season = selectedSeason ? TEMPORADAS[selectedSeason] : null
    const style = selectedStyle ? EXPERIENCIAS[selectedStyle] : null

    const cssVars = {
        '--jtb-primary': season?.colors.primary || '#2d6a4f',
        '--jtb-bg': season?.colors.bg || '#f0faf4',
    }

    return (
        <div className="jtb-wrapper" style={cssVars} ref={builderRef}>
            {/* ===== PROGRESS BAR ===== */}
            <div className={`jtb-progress${progressScrolled ? ' jtb-progress--scrolled' : ''}`}>
                <div className="jtb-progress-inner">
                    {/* Step 1 */}
                    <div
                        className={`jtb-progress-step${step === 1 ? ' jtb-progress-step--active' : ''}${step > 1 ? ' jtb-progress-step--done' : ''}`}
                        onClick={() => goToStep(1)}
                    >
                        <span className="jtb-progress-num">{step > 1 ? '✓' : '1'}</span>
                        <span>Temporada</span>
                        {step > 1 && season && (
                            <span className="jtb-progress-selection">{season.emoji} {season.name}</span>
                        )}
                    </div>

                    <div className={`jtb-progress-connector${step > 1 ? ' jtb-progress-connector--filled' : ''}`} />

                    {/* Step 2 */}
                    <div
                        className={`jtb-progress-step${step === 2 ? ' jtb-progress-step--active' : ''}${step > 2 ? ' jtb-progress-step--done' : ''}${step < 2 ? '' : ''}`}
                        onClick={() => goToStep(2)}
                    >
                        <span className="jtb-progress-num">{step > 2 ? '✓' : '2'}</span>
                        <span>Estilo</span>
                        {step > 2 && style && (
                            <span className="jtb-progress-selection">{style.icon} {style.name}</span>
                        )}
                    </div>

                    <div className={`jtb-progress-connector${step > 2 ? ' jtb-progress-connector--filled' : ''}`} />

                    {/* Step 3 */}
                    <div
                        className={`jtb-progress-step${step === 3 ? ' jtb-progress-step--active' : ''}`}
                    >
                        <span className="jtb-progress-num">3</span>
                        <span>Tu Viaje</span>
                    </div>
                </div>
            </div>

            {/* ===== STEP 1: SEASON SELECTION ===== */}
            <div className={`jtb-step${step >= 1 ? ' jtb-step--visible' : ''}`}>
                <section className="jtb-seasons-section" id="jtb-step-1">
                    <div className="container">
                        <div className="jtb-seasons-header" data-animate="fade-up">
                            <span className="section-tag">Paso 1 de 3</span>
                            <h2 className="section-title">
                                ¿En qué temporada quieres viajar a <span className="text-accent">Japón</span>?
                            </h2>
                            <p className="section-subtitle">
                                Cada estación transforma Japón en una experiencia completamente diferente. Selecciona la tuya.
                            </p>
                        </div>

                        <div className="jtb-seasons-grid">
                            {TEMPORADA_ORDER.map((key, i) => {
                                const s = TEMPORADAS[key]
                                const isSelected = selectedSeason === key
                                const isDimmed = selectedSeason && !isSelected
                                return (
                                    <div
                                        key={key}
                                        className={`jtb-season-card${isSelected ? ' jtb-season-card--selected' : ''}${isDimmed ? ' jtb-season-card--dimmed' : ''}`}
                                        style={{ '--season-primary': s.colors.primary }}
                                        onClick={() => handleSeasonSelect(key)}
                                        data-animate="fade-up"
                                        data-delay={String(i * 150)}
                                    >
                                        <div className="jtb-season-card-img">
                                            <img src={s.cardImage} alt={s.name} loading="lazy" />
                                        </div>
                                        <div className="jtb-season-card-overlay" />
                                        <div className="jtb-season-card-check">✓</div>
                                        <div className="jtb-season-card-content">
                                            <div className="jtb-season-card-emoji">{s.emoji}</div>
                                            <div className="jtb-season-card-name">{s.name}</div>
                                            <div className="jtb-season-card-months">{s.months}</div>
                                            <p className="jtb-season-card-desc">{s.description}</p>
                                            <div className="jtb-season-select-label">
                                                {isSelected ? '✓ Seleccionada' : 'Seleccionar →'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </div>

            {/* ===== STEP 2: STYLE SELECTION ===== */}
            <div
                ref={step2Ref}
                className={`jtb-step${step >= 2 ? ' jtb-step--visible' : ''}`}
            >
                {season && (
                    <section className="jtb-styles-section" id="jtb-step-2">
                        <div className="container">
                            <div className="jtb-styles-header" data-animate="fade-up">
                                <span className="section-tag" style={{ background: season.colors.bg, color: season.colors.primary }}>
                                    {season.emoji} Paso 2 de 3
                                </span>
                                <h2 className="section-title">
                                    ¿Cómo quieres vivir <span style={{ color: season.colors.primary }}>{season.name}</span>?
                                </h2>
                                <p className="section-subtitle">
                                    Desde viajes a tu ritmo hasta la experiencia premium. Tú decides.
                                </p>
                            </div>

                            <div className="jtb-styles-grid">
                                {EXPERIENCIA_ORDER.map((key, i) => {
                                    const exp = EXPERIENCIAS[key]
                                    const isSelected = selectedStyle === key
                                    const isDimmed = selectedStyle && !isSelected
                                    return (
                                        <div
                                            key={key}
                                            className={`jtb-style-card${exp.isSignature ? ' jtb-style-card--signature' : ''}${isSelected ? ' jtb-style-card--selected' : ''}${isDimmed ? ' jtb-style-card--dimmed' : ''}`}
                                            onClick={() => handleStyleSelect(key)}
                                            data-animate="fade-up"
                                            data-delay={String(i * 120)}
                                        >
                                            <div className="jtb-style-card-check">✓</div>
                                            <div className="jtb-style-card-icon">{exp.icon}</div>
                                            <div className="jtb-style-card-season">{season.name}</div>
                                            <div className="jtb-style-card-name">{exp.name}</div>

                                            {/* Tier dots */}
                                            <div className="jtb-style-card-tier">
                                                {[1,2,3,4].map(n => (
                                                    <div
                                                        key={n}
                                                        className={`jtb-style-card-tier-dot${n <= exp.tier ? ' jtb-style-card-tier-dot--filled' : ''}`}
                                                    />
                                                ))}
                                            </div>

                                            <p className="jtb-style-card-tagline">{exp.tagline}</p>

                                            <ul className="jtb-style-card-features">
                                                {exp.includes.slice(0, 5).map((item, j) => (
                                                    <li key={j}>
                                                        <span className="jtb-check">✓</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="jtb-style-card-cta">
                                                {isSelected ? '✓ Seleccionado' : exp.ctaText}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* ===== STEP 3: DYNAMIC EXPERIENCE LANDING ===== */}
            <div
                ref={step3Ref}
                className={`jtb-step${step >= 3 ? ' jtb-step--visible' : ''}`}
            >
                {season && style && (
                    <>
                        <div id="jtb-step-3">
                            {selectedStyle === 'libre' && <StepLibre season={season} temporadaKey={selectedSeason} />}
                            {selectedStyle === 'guiado' && <StepGuiado season={season} temporadaKey={selectedSeason} />}
                            {selectedStyle === 'acompanado' && <StepAcompanado season={season} />}
                            {selectedStyle === 'signature' && <StepSignature season={season} />}

                        </div>

                        {/* Highlights strip */}
                        <section className="jac-highlights-strip" style={{ background: season.colors.primary }}>
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
                    </>
                )}
            </div>
        </div>
    )
}
