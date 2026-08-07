import { useState } from 'react'
import {
    ITINERARIO_ACOMPANADO,
    ITINERARIO_ACOMPANADO_MOMIJI,
    ACOMPANADO_TODO_INCLUIDO,
    ACOMPANADO_TODO_INCLUIDO_MOMIJI,
    ACOMPANADO_UPSELL,
    EXP_HEROES,
} from '../../data/japonData'
import './StepStyles.css'
import CheckoutModal from './CheckoutModal'
import TripSelectorBar from './TripSelectorBar'
import FloatingTicket from './FloatingTicket'

/**
 * StepAcompanado — Step 3 for "Completo" (Acompañado) experience.
 * Features: TripSelectorBar (Dates & Passengers), FloatingTicket, all-inclusive list, day-by-day timeline, why choose this, upsell.
 */
export default function StepAcompanado({ season, temporadaKey }) {
    const hero = EXP_HEROES.acompanado
    const [selectedComps, setSelectedComps] = useState([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [selectorData, setSelectorData] = useState({
        dateMode: 'exact',
        startDate: '2026-10-15',
        endDate: '2026-10-28',
        selectedMonth: 'Octubre 2026',
        adults: 2,
        children: 0,
    })

    const toggleComp = (title) => {
        setSelectedComps(prev =>
            prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
        )
    }

    const itinerario = season?.key === 'momiji' ? ITINERARIO_ACOMPANADO_MOMIJI : ITINERARIO_ACOMPANADO
    const todoIncluido = season?.key === 'momiji' ? ACOMPANADO_TODO_INCLUIDO_MOMIJI : ACOMPANADO_TODO_INCLUIDO

    // Prices per person: $126,790 (Verano), $119,490 (Momiji), or $129,790 (Sakura/default)
    let basePrice = 129790
    if (season?.key === 'verano') basePrice = 126790
    else if (season?.key === 'momiji') basePrice = 119490

    const adults = selectorData.adults
    const children = selectorData.children
    const passengersCount = adults + children
    const totalPrice = basePrice * passengersCount

    return (
        <>
            {/* Hero */}
            <div className="step3-hero">
                <div className="step3-hero-bg">
                    <img src={season.heroImage} alt={`${season.name} Completo`} />
                </div>
                <div className="step3-hero-content container">
                    <div className="step3-hero-badge">
                        {season.emoji} {season.name} — Completo
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

            {/* Main Content + Floating Ticket Sidebar */}
            <section className="step3-section">
                <div className="container">
                    {/* Top Date & Passenger Selector */}
                    <TripSelectorBar selectorData={selectorData} onChange={setSelectorData} />

                    <div className="libre-layout">
                        <div>
                            {/* Timeline Shinkansen Rail JR Line */}
                            <div style={{ marginBottom: '60px' }}>
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

                            {/* Why Choose Us */}
                            <div style={{ marginBottom: '60px', background: '#faf9f6', padding: '30px', borderRadius: '24px' }}>
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

                            {/* Upsell */}
                            <div>
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
                        </div>

                        {/* Right column: Floating Ticket Sidebar */}
                        <FloatingTicket
                            season={season}
                            temporadaKey={temporadaKey}
                            estilo="Completo"
                            selectorData={selectorData}
                            selectedComps={selectedComps}
                            basePrice={basePrice}
                            onOpenCheckout={() => setIsCheckoutOpen(true)}
                        />
                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={season}
                estilo="Completo"
                totalPrice={totalPrice}
                desglose={
                    `Pasajeros: ${adults} Adultos, ${children} Menores. ` +
                    `Fechas: ${selectorData.dateMode === 'month' ? selectorData.selectedMonth : `${selectorData.startDate} a ${selectorData.endDate}`}. ` +
                    `Viaje Completo (${season.name}). ` +
                    (selectedComps.length ? `Extras seleccionados (por cotizar): ${selectedComps.join(', ')}.` : 'Sin extras seleccionados.')
                }
            />
        </>
    )
}
