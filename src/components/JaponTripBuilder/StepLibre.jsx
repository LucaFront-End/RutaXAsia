import { useState, useMemo } from 'react'
import {
    PRECIOS,
    EXPERIENCIAS_DISPONIBLES,
    COMPLEMENTOS,
    EXP_HEROES,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../../data/japonData'
import './StepStyles.css'

/**
 * StepLibre — Step 3 for "Libre" experience.
 * Features: duration selector, experience toggle grid, live price calculator.
 */
export default function StepLibre({ season, temporadaKey }) {
    const [selectedDuration, setSelectedDuration] = useState(null)
    const [addedExperiences, setAddedExperiences] = useState([])

    const hero = EXP_HEROES.libre
    const pricing = PRECIOS[temporadaKey]?.libre
    const packages = pricing?.packages || []

    const toggleExperience = (id) => {
        setAddedExperiences(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const selectedPkg = packages.find((_, i) => i === selectedDuration)
    const basePrice = selectedPkg?.priceNum || 0

    const addedItems = useMemo(() =>
        EXPERIENCIAS_DISPONIBLES.filter(e => addedExperiences.includes(e.id)),
        [addedExperiences]
    )
    const extrasTotal = addedItems.reduce((sum, e) => sum + e.price, 0)
    const totalPrice = basePrice + extrasTotal

    const formatPrice = (n) => `$${n.toLocaleString('es-MX')}`

    const passNames = ['Pase Express', 'Pase Clásico', 'Pase Explorador', 'Pase Gran Tour']
    const passBadges = ['', 'Más Popular 🌟', '', 'Recomendado 🔥']

    // Build WhatsApp message
    const waMsg = `SW-Hola quiero info sobre Japón a la Carta - ${season.name} Libre${selectedPkg ? ` con el ${passNames[selectedDuration]} (${selectedPkg.days})` : ''}${addedItems.length ? ` agregando: ${addedItems.map(e => e.name).join(', ')}` : ''}`

    return (
        <>
            {/* Hero */}
            <div className="step3-hero">
                <div className="step3-hero-bg">
                    <img src={season.heroImage} alt={`${season.name} Libre`} />
                </div>
                <div className="step3-hero-content container">
                    <div className="step3-hero-badge">
                        {season.emoji} {season.name} — Libre
                    </div>
                    <h2 className="step3-hero-headline">{hero.headline}</h2>
                    <p className="step3-hero-sub">{hero.subheadline}</p>
                    <p className="step3-hero-message">"{hero.message}"</p>
                </div>
            </div>

            {/* Includes */}
            <section className="step3-section" style={{ background: season.colors.bg }}>
                <div className="container">
                    <div className="step3-section-title">✅ ¿Qué incluye tu viaje?</div>
                    <div className="jtb-pass-includes-grid">
                        {[
                            { icon: '🏨', title: 'Hospedaje y Desayuno', desc: 'Habitaciones dobles en APA hoteles de 3 y 4 estrellas con desayuno buffet de cortesía.' },
                            { icon: '🚄', title: 'Transporte Base', desc: 'Tren bala Shinkansen, tarjetas IC pre-cargadas y traslados de llegada y salida.' },
                            { icon: '🗺️', title: 'Asesoría de Expertos', desc: 'Organización integral y una guía digital personalizada de navegación.' },
                            { icon: '📶', title: 'Wi-Fi de Alta Velocidad', desc: 'Tarjeta eSIM con datos móviles ilimitados para mantenerte conectado.' },
                            { icon: '🎁', title: 'Soporte y Respaldo', desc: 'Asistencia y soporte remoto permanente en español durante tu estancia.' },
                        ].map((item, i) => (
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
            </section>

            {/* Duration + Calculator + Experiences */}
            <section className="step3-section">
                <div className="container">
                    <div className="libre-layout">
                        {/* Left column: duration + experiences */}
                        <div>
                            {/* Duration Selector */}
                            {packages.length > 0 && (
                                <div style={{ marginBottom: 60 }}>
                                    <div className="step3-section-title">🎋 Elige tu Pase de Viaje</div>
                                    <div className="libre-duration-grid">
                                        {packages.map((pkg, i) => (
                                            <div
                                                key={i}
                                                className={`libre-duration-card${selectedDuration === i ? ' libre-duration-card--selected' : ''}`}
                                                onClick={() => setSelectedDuration(i)}
                                            >
                                                {passBadges[i] && (
                                                    <span className="libre-duration-card-badge">{passBadges[i]}</span>
                                                )}
                                                <div className="libre-duration-check">✓</div>
                                                <span className="libre-duration-pass-name">{passNames[i]}</span>
                                                <div className="libre-duration-days">{pkg.days.split(' ')[0]} días</div>
                                                <div className="libre-duration-nights">{pkg.days.split(' ').slice(1).join(' ')}</div>
                                                <div className="libre-duration-price">{pkg.price}</div>
                                                <span className="libre-duration-per">MXN / persona</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experiences Grid */}
                            <div style={{ marginBottom: 60 }}>
                                <div className="step3-section-title">🌸 Experiencias recomendadas para {season.name}</div>
                                <div className="libre-exp-grid">
                                    {EXPERIENCIAS_DISPONIBLES.map(exp => {
                                        const added = addedExperiences.includes(exp.id)
                                        return (
                                            <div
                                                key={exp.id}
                                                className={`libre-exp-card${added ? ' libre-exp-card--added' : ''}`}
                                                onClick={() => toggleExperience(exp.id)}
                                            >
                                                <div className="libre-exp-card-toggle">
                                                    {added ? '✓' : '+'}
                                                </div>
                                                <div className="libre-exp-card-img">
                                                    <img src={exp.img} alt={exp.name} loading="lazy" />
                                                </div>
                                                <div className="libre-exp-card-body">
                                                    <div className="libre-exp-card-name">{exp.name}</div>
                                                    <div className="libre-exp-card-price">{formatPrice(exp.price)} MXN</div>
                                                    <div className="libre-exp-card-desc">{exp.desc}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Complementos */}
                            <div>
                                <div className="step3-section-title">✨ Completa tu experiencia</div>
                                <div className="jtb-extras-grid">
                                    {COMPLEMENTOS.map((item, i) => (
                                        <div className="jtb-extra-card" key={i}>
                                            <div className="jtb-extra-icon">{item.icon}</div>
                                            <h4 className="jtb-extra-title">{item.title}</h4>
                                            <p className="jtb-extra-desc">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right column: Calculator Ticket */}
                        <div className="libre-calculator">
                            <div className="libre-calc-ticket-top">
                                <div className="libre-calc-title">🎫 Pase de Abordar</div>
                                <div className="libre-calc-ticket-status">
                                    {selectedPkg ? 'CONFIGURADO' : 'INCOMPLETO'}
                                </div>
                            </div>

                            <div className="libre-calc-ticket-divider">
                                <div className="libre-calc-notch libre-calc-notch--left" />
                                <div className="libre-calc-dashed-line" />
                                <div className="libre-calc-notch libre-calc-notch--right" />
                            </div>

                            <div className="libre-calc-ticket-body">
                                {selectedPkg ? (
                                    <div className="libre-calc-line">
                                        <span className="libre-calc-line-name">{passNames[selectedDuration]} ({selectedPkg.days.split(' ')[0]} días)</span>
                                        <span className="libre-calc-line-price">{formatPrice(basePrice)}</span>
                                    </div>
                                ) : (
                                    <div className="libre-calc-line">
                                        <span className="libre-calc-line-name" style={{ fontStyle: 'italic', opacity: 0.5 }}>Selecciona una duración ↑</span>
                                        <span className="libre-calc-line-price">—</span>
                                    </div>
                                )}

                                {addedItems.map(exp => (
                                    <div className="libre-calc-line animate-slide-in" key={exp.id}>
                                        <span className="libre-calc-line-name">➕ {exp.name}</span>
                                        <span className="libre-calc-line-price">{formatPrice(exp.price)}</span>
                                    </div>
                                ))}

                                <div className="libre-calc-total">
                                    <span className="libre-calc-total-label">Total estimado</span>
                                    <div>
                                        <span className="libre-calc-total-price">
                                            {totalPrice > 0 ? formatPrice(totalPrice) : '—'}
                                        </span>
                                        {totalPrice > 0 && <span className="libre-calc-total-currency">MXN</span>}
                                    </div>
                                </div>

                                <p className="libre-calc-note">
                                    Tarifas por persona en base a habitación doble. Impuestos incluidos. El precio total de las experiencias adicionales se integra al presupuesto final.
                                </p>

                                <div className="libre-calc-barcode-wrapper">
                                    <div className="libre-calc-barcode">
                                        <div className="bar-line bar-line--w3" />
                                        <div className="bar-line bar-line--w1" />
                                        <div className="bar-line bar-line--w2" />
                                        <div className="bar-line bar-line--w1" />
                                        <div className="bar-line bar-line--w4" />
                                        <div className="bar-line bar-line--w1" />
                                        <div className="bar-line bar-line--w2" />
                                        <div className="bar-line bar-line--w3" />
                                        <div className="bar-line bar-line--w1" />
                                    </div>
                                    <span className="libre-calc-barcode-num">JAC-{temporadaKey.toUpperCase()}-LIBRE</span>
                                </div>

                                <a
                                    href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                                    className="libre-calc-cta"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    💬 Cotizar mi Viaje Libre
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
