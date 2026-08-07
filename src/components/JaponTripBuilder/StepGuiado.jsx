import { useState } from 'react'
import {
    PRECIOS,
    EXPERIENCIAS_DISPONIBLES,
    GUIADO_ASISTENCIA,
    COMPLEMENTOS,
    EXP_HEROES,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../../data/japonData'
import './StepStyles.css'
import CheckoutModal from './CheckoutModal'

/**
 * StepGuiado — Step 3 for "Guiado" experience.
 * Features: selector for 2 included experiences, assistance features, extras.
 */
export default function StepGuiado({ season, temporadaKey }) {
    const [selectedExps, setSelectedExps] = useState([])
    const [selectedComps, setSelectedComps] = useState([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    const toggleComp = (title) => {
        setSelectedComps(prev =>
            prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
        )
    }

    const hero = EXP_HEROES.guiado

    const toggleExp = (id) => {
        setSelectedExps(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id)
            return [...prev, id]
        })
    }

    const formatPrice = (n) => `$${n.toLocaleString('es-MX')}`

    const includedNames = selectedExps.slice(0, 2).map(id => EXPERIENCIAS_DISPONIBLES.find(e => e.id === id)?.name).filter(Boolean)
    const extraNames = selectedExps.slice(2).map(id => EXPERIENCIAS_DISPONIBLES.find(e => e.id === id)?.name).filter(Boolean)
    const extraItems = selectedExps.slice(2).map(id => EXPERIENCIAS_DISPONIBLES.find(e => e.id === id)).filter(Boolean)
    const extraTotal = extraItems.reduce((sum, item) => sum + item.price, 0)

    let experiencesDetail = ''
    if (includedNames.length) {
        experiencesDetail += ` con experiencias incluidas: ${includedNames.join(', ')}`
    }
    if (extraNames.length) {
        experiencesDetail += ` y experiencias adicionales: ${extraNames.join(', ')} (Costo extra estimado: ${formatPrice(extraTotal)} MXN)`
    }
    if (selectedComps.length) {
        experiencesDetail += ` + Extras: ${selectedComps.join(', ')}`
    }

    const waMsg = `SW-Hola quiero info sobre Japón a la Carta - ${season.name} Esencial${experiencesDetail}`

    // Experiencias recomendadas/badged
    const badgesMap = {
        kioto: 'Imperdible 🌸',
        fuji: 'Top Destino 🗻',
        universal: 'Adrenalina 🎢',
        disney: 'Mágico 🏰',
        hiroshima: 'Cultura 🕊️',
    }

    return (
        <>
            {/* Hero */}
            <div className="step3-hero">
                <div className="step3-hero-bg">
                    <img src={season.heroImage} alt={`${season.name} Esencial`} />
                </div>
                <div className="step3-hero-content container">
                    <div className="step3-hero-badge">
                        {season.emoji} {season.name} — Esencial
                    </div>
                    <h2 className="step3-hero-headline">{hero.headline}</h2>
                    <p className="step3-hero-sub">{hero.subheadline}</p>
                    <p className="step3-hero-message">"{hero.message}"</p>
                </div>
            </div>

            {/* Includes */}
            <section className="step3-section" style={{ background: season.colors.bg }}>
                <div className="container">
                    <div className="step3-section-title">✅ Tu viaje ya incluye</div>
                    <div className="jtb-pass-includes-grid">
                        {[
                            { icon: '🏨', title: 'Hospedaje Seleccionado', desc: 'Estancia en habitaciones dobles en hoteles de alta valoración con desayunos incluidos.' },
                            { icon: '🚄', title: 'Movilidad Completa', desc: 'Boletos de tren bala Shinkansen, tarjetas IC recargables y todos los traslados programados.' },
                            { icon: '📋', title: 'Itinerario a Medida', desc: 'Organización experta con tiempos optimizados y guías detalladas.' },
                            { icon: '🎌', title: '2 Experiencias Incluidas', desc: 'Elige libremente 2 experiencias de nuestro catálogo sin costo adicional.' },
                            { icon: '📶', title: 'Conectividad eSIM', desc: 'Acceso a internet de alta velocidad ilimitado durante todo el viaje.' },
                            { icon: '🗂️', title: 'Asistencia 24/7', desc: 'Soporte activo y asesoría para organizar tus actividades en los días libres.' },
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

            {/* 2 Experience Selector */}
            <section className="step3-section">
                <div className="container">
                    <div className="step3-section-title">🌸 Elige tus experiencias incluidas y adicionales</div>

                    <div className="guiado-selector-info-wrapper">
                        <div className={`guiado-selector-ring-dashboard${selectedExps.length >= 2 ? ' guiado-selector-ring-dashboard--complete' : ''}`}>
                            <div className="guiado-selector-ring-value">
                                {selectedExps.length > 2 ? `${selectedExps.length}` : `${selectedExps.length} / 2`}
                            </div>
                            <div className="guiado-selector-ring-text">
                                {selectedExps.length === 1 ? 'EXPERIENCIA' : 'EXPERIENCIAS'}
                            </div>
                        </div>
                        <div className="guiado-selector-status-text">
                            {selectedExps.length === 0
                                ? 'Haz clic en las fotos del catálogo para incluir experiencias en tu pase (2 incluidas sin costo extra)'
                                : selectedExps.length === 1
                                    ? `Excelente. Tienes 1 experiencia seleccionada. Elige 1 más gratis. Activa: ${includedNames[0]}`
                                    : selectedExps.length === 2
                                        ? `¡Perfecto! Tus 2 experiencias incluidas: ${includedNames.join(' y ')}`
                                        : `¡Excelente! 2 incluidas gratis y ${extraNames.length} adicional(es) con costo extra.`
                            }
                        </div>

                        {/* Summary Ticket */}
                        {selectedExps.length > 0 && (
                            <div className="guiado-summary-ticket animate-slide-in">
                                <div className="guiado-summary-header">
                                    <h4>📋 Resumen de tu Selección</h4>
                                </div>
                                <div className="guiado-summary-lines">
                                    {selectedExps.map((id, index) => {
                                        const exp = EXPERIENCIAS_DISPONIBLES.find(e => e.id === id)
                                        if (!exp) return null
                                        const isFree = index < 2
                                        return (
                                            <div className="guiado-summary-line" key={id}>
                                                <span className="guiado-summary-line-dot">🌸</span>
                                                <span className="guiado-summary-line-name">{exp.name}</span>
                                                <span className={`guiado-summary-line-status ${isFree ? 'guiado-summary-line-status--free' : 'guiado-summary-line-status--paid'}`}>
                                                    {isFree ? 'Incluida (Gratis)' : `+ ${formatPrice(exp.price)}`}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {extraTotal > 0 && (
                                    <div className="guiado-summary-total">
                                        <span>Total Adicional Estimado:</span>
                                        <strong>{formatPrice(extraTotal)} MXN</strong>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="guiado-exp-grid">
                        {EXPERIENCIAS_DISPONIBLES.map(exp => {
                            const isSelected = selectedExps.includes(exp.id)
                            const selIndex = selectedExps.indexOf(exp.id)
                            const isIncluded = isSelected && selIndex < 2
                            const isAdditional = isSelected && selIndex >= 2
                            return (
                                <div
                                    key={exp.id}
                                    className={`guiado-exp-card${isSelected ? ' guiado-exp-card--selected' : ''}`}
                                    onClick={() => toggleExp(exp.id)}
                                >
                                    {badgesMap[exp.id] && (
                                        <span className="guiado-exp-badge-tag">{badgesMap[exp.id]}</span>
                                    )}
                                    {isSelected && (
                                        <div className="guiado-exp-card-badge" style={isAdditional ? { background: '#222' } : {}}>
                                            {isIncluded ? '✓ Incluida' : `✓ Adicional (+${formatPrice(exp.price)})`}
                                        </div>
                                    )}
                                    <div className="guiado-exp-card-img">
                                        <img src={exp.img} alt={exp.name} loading="lazy" />
                                    </div>
                                    <div className="guiado-exp-card-body">
                                        <div className="guiado-exp-card-name">{exp.name}</div>
                                        <div className="guiado-exp-card-price" style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '800',
                                            color: isIncluded ? '#2d6a4f' : 'var(--jtb-primary)',
                                            marginBottom: '6px'
                                        }}>
                                            {isIncluded ? (
                                                <span className="guiado-price-included">✨ Incluida gratis</span>
                                            ) : (
                                                <span className="guiado-price-additional">{formatPrice(exp.price)} MXN</span>
                                            )}
                                        </div>
                                        <div className="guiado-exp-card-desc">{exp.desc}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Assistance */}
            <section className="step3-section" style={{ background: '#faf9f6' }}>
                <div className="container">
                    <div className="step3-section-title">🛡️ Asistencia durante tu viaje</div>
                    <div className="guiado-asistencia-grid">
                        {GUIADO_ASISTENCIA.map((item, i) => (
                            <div className="guiado-asistencia-card" key={i}>
                                <div className="guiado-asistencia-icon">{item.icon}</div>
                                <h4 className="guiado-asistencia-title">{item.title}</h4>
                                <p className="guiado-asistencia-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Extras */}
            <section className="step3-section">
                <div className="container">
                    <div className="step3-section-title">✨ Completa tu experiencia (opcionales)</div>
                    <div className="jtb-extras-grid">
                        {COMPLEMENTOS.map((item, i) => {
                            const isSelected = selectedComps.includes(item.title)
                            return (
                                <div
                                    className={`jtb-extra-card${isSelected ? ' jtb-extra-card--selected' : ''}`}
                                    key={i}
                                    onClick={() => toggleComp(item.title)}
                                >
                                    {isSelected && <span className="jtb-extra-card-badge">✓</span>}
                                    <div className="jtb-extra-icon">{item.icon}</div>
                                    <h4 className="jtb-extra-title">{item.title}</h4>
                                    <p className="jtb-extra-desc">{item.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="step3-cta-section">
                <div className="container">
                    <h3 className="step3-cta-headline">¿Listo para vivir {season.name} Esencial?</h3>
                    <p className="step3-cta-sub">Escríbenos para armar tu cotización o aparta tu lugar ahora mismo.</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                        <a
                            href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                            className="step3-cta-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ margin: 0 }}
                        >
                            💬 Cotizar por WhatsApp
                        </a>
                        
                        <button
                            type="button"
                            className="step3-cta-checkout-btn"
                            onClick={() => setIsCheckoutOpen(true)}
                        >
                            💳 Apartar y Pagar Anticipo
                        </button>
                    </div>
                    
                    <div className="step3-cta-phone" style={{ marginTop: '24px' }}>
                        o llámanos al <a href={`tel:+52${WHATSAPP_PHONE.replace(/\s/g, '')}`}>{WHATSAPP_PHONE}</a>
                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={season}
                estilo="Esencial"
                totalPrice={(PRECIOS[temporadaKey]?.libre?.packages?.[0]?.priceNum || 22000) + extraTotal}
                desglose={
                    `Incluidas: ${includedNames.join(', ')}. ` +
                    `Adicionales: ${extraNames.join(', ')} (+${formatPrice(extraTotal)} MXN). ` +
                    `Extras: ${selectedComps.join(', ')}.`
                }
            />
        </>
    )
}
