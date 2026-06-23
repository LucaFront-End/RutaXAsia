import { useState } from 'react'
import {
    ITINERARIO_ACOMPANADO,
    ITINERARIO_ACOMPANADO_MOMIJI,
    ACOMPANADO_TODO_INCLUIDO,
    ACOMPANADO_TODO_INCLUIDO_MOMIJI,
    ACOMPANADO_UPSELL,
    EXP_HEROES,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../../data/japonData'
import './StepStyles.css'
import CheckoutModal from './CheckoutModal'

/**
 * StepAcompanado — Step 3 for "Acompañado" (Sin Complicaciones) experience.
 * Features: all-inclusive list, day-by-day timeline, why choose this, upsell.
 */
export default function StepAcompanado({ season }) {
    const hero = EXP_HEROES.acompanado
    const [selectedComps, setSelectedComps] = useState([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    const toggleComp = (title) => {
        setSelectedComps(prev =>
            prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
        )
    }

    const waMsg = `SW-Hola quiero info sobre Japón a la Carta - ${season.name} Acompañado${selectedComps.length ? ` + Extras: ${selectedComps.join(', ')}` : ''}`
    const itinerario = season.key === 'momiji' ? ITINERARIO_ACOMPANADO_MOMIJI : ITINERARIO_ACOMPANADO
    const todoIncluido = season.key === 'momiji' ? ACOMPANADO_TODO_INCLUIDO_MOMIJI : ACOMPANADO_TODO_INCLUIDO

    // Prices: $126,790 (Verano), $119,490 (Momiji), or $129,790 (Sakura/default)
    let totalPrice = 129790
    if (season?.key === 'verano') totalPrice = 126790
    else if (season?.key === 'momiji') totalPrice = 119490

    return (
        <>
            {/* Hero */}
            <div className="step3-hero">
                <div className="step3-hero-bg">
                    <img src={season.heroImage} alt={`${season.name} Acompañado`} />
                </div>
                <div className="step3-hero-content container">
                    <div className="step3-hero-badge">
                        {season.emoji} {season.name} — Acompañado
                    </div>
                    <h2 className="step3-hero-headline">{hero.headline}</h2>
                    <p className="step3-hero-sub">{hero.subheadline}</p>
                    <p className="step3-hero-message">"{hero.message}"</p>
                </div>
            </div>

            {/* Todo Incluido Checklist Board */}
            <section className="step3-section" style={{ background: season.colors.bg }}>
                <div className="container">
                    <div className="step3-section-title">✅ Todo Incluido — Tu Pase de Abordar Todo en Uno</div>
                    <div className="acomp-todo-checklist-board">
                        {todoIncluido.map((item, i) => (
                            <div className="acomp-todo-checklist-item" key={i}>
                                <div className="acomp-todo-chk-box">
                                    <span className="acomp-todo-chk-check">✓</span>
                                </div>
                                <span className="acomp-todo-chk-icon">{item.icon}</span>
                                <span className="acomp-todo-chk-text">{item.item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Shinkansen Rail JR Line */}
            <section className="step3-section">
                <div className="container">
                    <div className="step3-section-title">🚄 Ruta JR Line — Itinerario Completo Día a Día</div>
                    <div className="acomp-shinkansen-timeline">
                        <div className="acomp-railway-track" style={{ '--rail-color': season.colors.primary }} />
                        {itinerario.map((item) => (
                            <div className="acomp-station-item" key={item.day}>
                                <div className="acomp-station-marker" style={{ backgroundColor: season.colors.primary }}>
                                    <span className="acomp-station-number">{item.day}</span>
                                </div>
                                <div className="acomp-station-card">
                                    <div className="acomp-station-header">
                                        <span className="acomp-station-icon">{item.icon}</span>
                                        <h4 className="acomp-station-title">Día {item.day}: {item.title}</h4>
                                    </div>
                                    <p className="acomp-station-desc">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="step3-section" style={{ background: '#faf9f6' }}>
                <div className="container">
                    <div className="step3-section-title">💡 ¿Por qué viajar en esta modalidad?</div>
                    <div className="acomp-why-magazine-grid">
                        <div className="acomp-why-card-large">
                            <span className="acomp-why-badge">Atención 24/7</span>
                            <div className="acomp-why-large-icon">😌</div>
                            <h4>Acompañamiento Constante</h4>
                            <p>Un coordinador experto de RutaXAsia estará a tu lado durante todo el recorrido en Japón. Olvídate de la barrera del idioma, de ubicar andenes de trenes bala o de perderte en las estaciones gigantescas. Estás en manos de profesionales.</p>
                        </div>
                        <div className="acomp-why-card-small">
                            <div className="acomp-why-small-icon">🎯</div>
                            <h4>Cero Planificación</h4>
                            <p>Tours, reservaciones, trenes bala, accesos especiales. Todo ha sido calendarizado meticulosamente.</p>
                        </div>
                        <div className="acomp-why-card-small">
                            <div className="acomp-why-small-icon">👥</div>
                            <h4>Grupos Pequeños</h4>
                            <p>Limitamos el cupo de participantes para asegurar traslados rápidos, ágiles y con trato personalizado.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial / Acompañantes Spotlights */}
            <section className="step3-section" style={{ background: '#fff' }}>
                <div className="container">
                    <div className="step3-section-title">👥 Tus Coordinadores de Viaje</div>
                    <div className="acomp-coordinators-spotlight">
                        <div className="acomp-coord-card">
                            <div className="acomp-coord-badge">🎌 Guía Experto</div>
                            <h3>Juan Santiago</h3>
                            <span className="acomp-coord-title">Especialista en Cultura y Logística</span>
                            <p>"Japón tiene una de las culturas más bellas del mundo, pero su logística puede ser abrumadora. Mi trabajo es hacer que cada traslado en tren bala y cada visita a un templo sagrado sea suave, mágico y lleno de anécdotas locales."</p>
                        </div>
                        <div className="acomp-coord-card">
                            <div className="acomp-coord-badge">✨ Experiencia Local</div>
                            <h3>Alejandra Torres</h3>
                            <span className="acomp-coord-title">Especialista en Gastronomía y Compras</span>
                            <p>"Japón a la Carta es para disfrutar sin prisas. Te acompañaré a descubrir los rincones de comida callejera más deliciosos de Osaka, los callejones escondidos de Tokio y las mejores tiendas tradicionales."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upsell */}
            <section className="step3-section" style={{ background: '#faf9f6' }}>
                <div className="container">
                    <div className="step3-section-title">✨ Experiencias opcionales premium (selecciona para agregar)</div>
                    <div className="jtb-extras-grid">
                        {ACOMPANADO_UPSELL.map((item, i) => {
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
                    <h3 className="step3-cta-headline">¿Listo para disfrutar Japón sin complicaciones?</h3>
                    <p className="step3-cta-sub">Escríbenos y reserva tu lugar o aparta hoy mismo.</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                        <a
                            href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                            className="step3-cta-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ margin: 0 }}
                        >
                            💬 Reserva tu Viaje Acompañado
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
                estilo="Acompañado"
                totalPrice={totalPrice}
                desglose={
                    `Viaje Acompañado (${season.name}). ` +
                    (selectedComps.length ? `Extras seleccionados (por cotizar): ${selectedComps.join(', ')}.` : 'Sin extras seleccionados.')
                }
            />
        </>
    )
}
