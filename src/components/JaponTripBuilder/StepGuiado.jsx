import { useState } from 'react'
import {
    EXPERIENCIAS_DISPONIBLES,
    GUIADO_ASISTENCIA,
    COMPLEMENTOS,
    EXP_HEROES,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../../data/japonData'
import './StepStyles.css'

/**
 * StepGuiado — Step 3 for "Guiado" experience.
 * Features: selector for 2 included experiences, assistance features, extras.
 */
export default function StepGuiado({ season, temporadaKey }) {
    const [selectedExps, setSelectedExps] = useState([])

    const hero = EXP_HEROES.guiado

    const toggleExp = (id) => {
        setSelectedExps(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id)
            if (prev.length >= 2) return prev // Max 2
            return [...prev, id]
        })
    }

    const canSelect = selectedExps.length < 2
    const selectedNames = selectedExps.map(id => EXPERIENCIAS_DISPONIBLES.find(e => e.id === id)?.name).filter(Boolean)

    const waMsg = `SW-Hola quiero info sobre Japón a la Carta - ${season.name} Guiado${selectedNames.length ? ` con experiencias: ${selectedNames.join(', ')}` : ''}`

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
                    <img src={season.heroImage} alt={`${season.name} Guiado`} />
                </div>
                <div className="step3-hero-content container">
                    <div className="step3-hero-badge">
                        {season.emoji} {season.name} — Guiado
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
                    <div className="step3-section-title">🌸 Elige tus 2 experiencias incluidas</div>

                    <div className="guiado-selector-info-wrapper">
                        <div className={`guiado-selector-ring-dashboard${selectedExps.length === 2 ? ' guiado-selector-ring-dashboard--complete' : ''}`}>
                            <div className="guiado-selector-ring-value">{selectedExps.length} / 2</div>
                            <div className="guiado-selector-ring-text">EXPERIENCIAS</div>
                        </div>
                        <div className="guiado-selector-status-text">
                            {selectedExps.length === 2
                                ? `¡Listo! Has seleccionado: ${selectedNames.join(' y ')}`
                                : selectedExps.length === 1
                                    ? `Excelente. Selecciona 1 experiencia más. Activa: ${selectedNames[0]}`
                                    : 'Haz clic en las fotos del catálogo para incluir 2 experiencias en tu pase'
                            }
                        </div>
                    </div>

                    <div className="guiado-exp-grid">
                        {EXPERIENCIAS_DISPONIBLES.map(exp => {
                            const isSelected = selectedExps.includes(exp.id)
                            const isDisabled = !canSelect && !isSelected
                            return (
                                <div
                                    key={exp.id}
                                    className={`guiado-exp-card${isSelected ? ' guiado-exp-card--selected' : ''}${isDisabled ? ' guiado-exp-card--disabled' : ''}`}
                                    onClick={() => toggleExp(exp.id)}
                                >
                                    {badgesMap[exp.id] && (
                                        <span className="guiado-exp-badge-tag">{badgesMap[exp.id]}</span>
                                    )}
                                    <div className="guiado-exp-card-badge">✓ Incluida</div>
                                    <div className="guiado-exp-card-img">
                                        <img src={exp.img} alt={exp.name} loading="lazy" />
                                    </div>
                                    <div className="guiado-exp-card-body">
                                        <div className="guiado-exp-card-name">{exp.name}</div>
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
                    <div className="step3-section-title">✨ Agrega experiencias adicionales (con costo extra)</div>
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
            </section>

            {/* CTA */}
            <section className="step3-cta-section">
                <div className="container">
                    <h3 className="step3-cta-headline">¿Listo para vivir {season.name} Guiado?</h3>
                    <p className="step3-cta-sub">Escríbenos y armamos tu experiencia contigo.</p>
                    <a
                        href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                        className="step3-cta-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💬 Cotizar tu Viaje Guiado
                    </a>
                    <div className="step3-cta-phone">
                        o llámanos al <a href={`tel:+52${WHATSAPP_PHONE.replace(/\s/g, '')}`}>{WHATSAPP_PHONE}</a>
                    </div>
                </div>
            </section>
        </>
    )
}
