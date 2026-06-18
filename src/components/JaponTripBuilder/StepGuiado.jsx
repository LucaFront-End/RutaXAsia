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

    return (
        <>
            {/* Hero */}
            <div className="step3-hero">
                <div className="step3-hero-bg">
                    <img src={hero.heroImg} alt={`${season.name} Guiado`} />
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
                            { icon: '🏨', title: 'Hospedaje y Desayuno', desc: 'Habitaciones dobles en hoteles seleccionados con desayuno incluido.' },
                            { icon: '🚄', title: 'Transporte Completo', desc: 'Tren bala, IC card y traslados incluidos.' },
                            { icon: '📋', title: 'Itinerario Organizado', desc: 'Itinerario cuidadosamente organizado con asesoría personalizada.' },
                            { icon: '🎌', title: '2 Experiencias Incluidas', desc: 'Elige 2 experiencias del catálogo que se incluyen en tu viaje.' },
                            { icon: '📶', title: 'Wi-Fi Ilimitado', desc: 'eSIM con datos ilimitados para todo tu viaje.' },
                            { icon: '🗂️', title: 'Asesoría para Días Libres', desc: 'Recomendaciones y apoyo para tus actividades en días libres.' },
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

                    <div className="guiado-selector-info">
                        <div className="guiado-selector-count">{selectedExps.length} / 2</div>
                        <div className="guiado-selector-label">
                            {selectedExps.length === 2
                                ? `✓ Has elegido: ${selectedNames.join(' y ')}`
                                : selectedExps.length === 1
                                    ? `Falta 1 experiencia. Seleccionada: ${selectedNames[0]}`
                                    : 'Selecciona 2 experiencias del catálogo'
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
            <section className="step3-section" style={{ background: '#faf9f7' }}>
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
                        💬 Cotiza tu Viaje Guiado
                    </a>
                    <div className="step3-cta-phone">
                        o llámanos al <a href={`tel:+52${WHATSAPP_PHONE.replace(/\s/g, '')}`}>{WHATSAPP_PHONE}</a>
                    </div>
                </div>
            </section>
        </>
    )
}
