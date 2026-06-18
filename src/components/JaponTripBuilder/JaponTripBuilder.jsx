import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    TEMPORADAS,
    TEMPORADA_ORDER,
    EXPERIENCIA_ORDER,
    EXPERIENCIAS,
    PRECIOS,
    DESTINOS_DISPONIBLES,
    COMPLEMENTOS,
    ACTIVIDADES_EXTRAS,
    HIGHLIGHTS_STRIP,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../../data/japonData'
import FallingElements from '../FallingElements'
import './JaponTripBuilder.css'

/**
 * WhatsApp SVG Icon
 */
function WhatsAppIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    )
}

/**
 * JaponTripBuilder — Interactive multi-step Japan trip configurator.
 *
 * Step 1: Select Season (Sakura / Verano / Momiji)
 * Step 2: Select Style (Libre / Guiado / Acompañado / Signature)
 * Step 3: Summary Boarding Pass with pricing, includes, destinations, CTA
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
    const pricing = selectedSeason && selectedStyle ? PRECIOS[selectedSeason]?.[selectedStyle] : null

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

                        <div className="jtb-seasons-grid" data-animate="fade-up">
                            {TEMPORADA_ORDER.map((key) => {
                                const s = TEMPORADAS[key]
                                const isSelected = selectedSeason === key
                                const isDimmed = selectedSeason && !isSelected
                                return (
                                    <div
                                        key={key}
                                        className={`jtb-season-card${isSelected ? ' jtb-season-card--selected' : ''}${isDimmed ? ' jtb-season-card--dimmed' : ''}`}
                                        style={{ '--season-primary': s.colors.primary }}
                                        onClick={() => handleSeasonSelect(key)}
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

                            <div className="jtb-styles-grid" data-animate="fade-up">
                                {EXPERIENCIA_ORDER.map((key) => {
                                    const exp = EXPERIENCIAS[key]
                                    const isSelected = selectedStyle === key
                                    const isDimmed = selectedStyle && !isSelected
                                    return (
                                        <div
                                            key={key}
                                            className={`jtb-style-card${exp.isSignature ? ' jtb-style-card--signature' : ''}${isSelected ? ' jtb-style-card--selected' : ''}${isDimmed ? ' jtb-style-card--dimmed' : ''}`}
                                            onClick={() => handleStyleSelect(key)}
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

            {/* ===== STEP 3: SUMMARY BOARDING PASS ===== */}
            <div
                ref={step3Ref}
                className={`jtb-step${step >= 3 ? ' jtb-step--visible' : ''}`}
            >
                {season && style && (
                    <>
                        <section className="jtb-summary-section" id="jtb-step-3">
                            <div className="container">
                                <div className="jtb-summary-header" data-animate="fade-up">
                                    <span className="section-tag" style={{ background: season.colors.bg, color: season.colors.primary }}>
                                        {season.emoji} Paso 3 de 3
                                    </span>
                                    <h2 className="section-title">
                                        Tu viaje a <span style={{ color: season.colors.primary }}>Japón</span> está listo
                                    </h2>
                                    <p className="section-subtitle">
                                        Aquí tienes el resumen de tu selección. El siguiente paso es contactarnos para armar tu experiencia.
                                    </p>
                                </div>

                                {/* Boarding Pass */}
                                <div className="jtb-boarding-pass" data-animate="fade-up">
                                    <div className="jtb-pass-header">
                                        <div className="jtb-pass-header-left">
                                            <div>
                                                <div className="jtb-pass-airline">RUTAXASIA · JAPÓN A LA CARTA</div>
                                                <div className="jtb-pass-route">
                                                    {season.name} — {style.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="jtb-pass-header-right">
                                            <div className="jtb-pass-emoji">{season.emoji}</div>
                                        </div>
                                    </div>

                                    <div className="jtb-pass-body">
                                        {/* Fields */}
                                        <div className="jtb-pass-fields">
                                            <div>
                                                <div className="jtb-pass-field-label">Temporada</div>
                                                <div className="jtb-pass-field-value">{season.emoji} {season.name}</div>
                                            </div>
                                            <div>
                                                <div className="jtb-pass-field-label">Estilo</div>
                                                <div className="jtb-pass-field-value">{style.icon} {style.name}</div>
                                            </div>
                                            <div>
                                                <div className="jtb-pass-field-label">Fechas</div>
                                                <div className="jtb-pass-field-value">{season.months}</div>
                                            </div>
                                            <div>
                                                <div className="jtb-pass-field-label">Desde</div>
                                                <div className="jtb-pass-field-value" style={{ color: season.colors.primary }}>
                                                    {pricing?.startingPrice || 'Cotizar'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prices */}
                                        {pricing?.packages?.length > 0 && (
                                            <div className="jtb-pass-price-section">
                                                <div className="jtb-pass-price-title">🎋 Paquetes Disponibles</div>
                                                <div className="jtb-pass-packages">
                                                    {pricing.packages.map((pkg, i) => (
                                                        <div className="jtb-pass-package-row" key={i}>
                                                            <span className="jtb-pass-package-days">{pkg.days}</span>
                                                            <div>
                                                                <span className="jtb-pass-package-price">{pkg.price}</span>
                                                                <span className="jtb-pass-package-per">MXN / persona</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {pricing.note && (
                                                    <p className="jtb-pass-price-note">{pricing.note}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Includes */}
                                        <div className="jtb-pass-includes">
                                            <div className="jtb-pass-includes-title">✅ ¿Qué Incluye?</div>
                                            <div className="jtb-pass-includes-grid">
                                                {style.detailedIncludes.map((item, i) => (
                                                    <div className="jtb-pass-include-item" key={i}>
                                                        <span className="jtb-pass-include-icon">{item.icon}</span>
                                                        <div className="jtb-pass-include-text">
                                                            <h4>{item.title}</h4>
                                                            <p>{item.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Destinations */}
                                        <div className="jtb-pass-destinos">
                                            <div className="jtb-pass-destinos-title">🌸 Experiencias Disponibles</div>
                                            <div className="jtb-pass-destinos-grid">
                                                {DESTINOS_DISPONIBLES.map((dest, i) => (
                                                    <div className="jtb-pass-destino" key={i}>
                                                        <div className="jtb-pass-destino-img">
                                                            <img src={dest.img} alt={dest.name} loading="lazy" />
                                                        </div>
                                                        <span className="jtb-pass-destino-name">{dest.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="jtb-pass-cta">
                                            <h3 className="jtb-pass-cta-headline">
                                                ¿Listo para vivir {season.name} en Japón?
                                            </h3>
                                            <p className="jtb-pass-cta-sub">
                                                Escríbenos y armamos tu experiencia {style.name} contigo.
                                            </p>
                                            <a
                                                href={`${WHATSAPP_BASE}SW-Hola%20quiero%20info%20sobre%20Japón%20a%20la%20Carta%20-%20${season.name}%20${style.name}`}
                                                className="jtb-pass-cta-btn"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <WhatsAppIcon />
                                                Cotiza tu Viaje — {season.name} {style.name}
                                            </a>
                                            <div className="jtb-pass-cta-phone">
                                                o llámanos al <a href={`tel:+52${WHATSAPP_PHONE.replace(/\s/g, '')}`}>{WHATSAPP_PHONE}</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Extras */}
                        <section className="jtb-extras-section" data-animate="fade-up">
                            <div className="container">
                                <div className="section-header" style={{ textAlign: 'center' }}>
                                    <span className="section-tag" style={{ background: season.colors.bg, color: season.colors.primary }}>
                                        ✨ Complementa tu Experiencia
                                    </span>
                                    <p className="section-subtitle">Servicios adicionales con costo extra.</p>
                                </div>
                                <div className="jtb-extras-grid">
                                    {COMPLEMENTOS.map((item, i) => (
                                        <div className="jtb-extra-card" key={i}>
                                            <div className="jtb-extra-icon">{item.icon}</div>
                                            <h4 className="jtb-extra-title">{item.title}</h4>
                                            <p className="jtb-extra-desc">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="jtb-activities-strip">
                                    {ACTIVIDADES_EXTRAS.map((act, i) => (
                                        <span className="jtb-activity-chip" key={i}>
                                            {act.icon} {act.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Highlights strip */}
                        <section className="jac-highlights-strip" style={{ background: season.colors.primary }} data-animate="fade-up">
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
