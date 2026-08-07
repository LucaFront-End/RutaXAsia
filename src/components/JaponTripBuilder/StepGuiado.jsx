import { useState } from 'react'
import {
    PRECIOS,
    EXPERIENCIAS_DISPONIBLES,
    COMPLEMENTOS,
    EXP_HEROES,
} from '../../data/japonData'
import './StepStyles.css'
import CheckoutModal from './CheckoutModal'
import TripSelectorBar from './TripSelectorBar'
import FloatingTicket from './FloatingTicket'

import { useTripSearch } from '../../context/TripContext'

/**
 * StepGuiado — Step 3 for "Esencial" (Guiado) experience.
 * Features: TripSelectorBar (Dates & Passengers), selector for 6 or 9 included experiences, FloatingTicket.
 */
export default function StepGuiado({ season, temporadaKey }) {
    const { tripSearch: selectorData, updateTripSearch: setSelectorData } = useTripSearch()
    const [selectedExps, setSelectedExps] = useState([])
    const [selectedComps, setSelectedComps] = useState([])
    const [freeExpLimit, setFreeExpLimit] = useState(6) // 6 u 9 incluidas
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    const toggleComp = (title) => {
        setSelectedComps(prev =>
            prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
        )
    }

    const hero = EXP_HEROES.guiado
    const pricing = PRECIOS[temporadaKey]?.libre
    const packages = pricing?.packages || []
    const selectedPkg = packages[1] || packages[0] || { days: '10 días 8 noches', priceNum: 28490 }
    const basePrice = selectedPkg?.priceNum || 28490

    const toggleExp = (id) => {
        setSelectedExps(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id)
            return [...prev, id]
        })
    }

    const formatPrice = (n) => `$${n.toLocaleString('es-MX')}`

    const includedNames = selectedExps.slice(0, freeExpLimit).map(id => EXPERIENCIAS_DISPONIBLES.find(e => e.id === id)?.name).filter(Boolean)
    const extraItems = selectedExps.slice(freeExpLimit).map(id => EXPERIENCIAS_DISPONIBLES.find(e => e.id === id)).filter(Boolean)
    const extraTotal = extraItems.reduce((sum, item) => sum + item.price, 0)

    const adults = selectorData.adults
    const children = selectorData.children
    const passengersCount = adults + children
    const pricePerPerson = basePrice + extraTotal
    const totalPrice = pricePerPerson * passengersCount

    // Badges
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
                            { icon: '🎌', title: `${freeExpLimit} Experiencias Incluidas`, desc: `Elige libremente ${freeExpLimit} experiencias de nuestro catálogo sin costo adicional.` },
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

            {/* Experience Selector + Floating Ticket */}
            <section className="step3-section">
                <div className="container">
                    {/* Top Date & Passenger Selector */}
                    <TripSelectorBar selectorData={selectorData} onChange={setSelectorData} />

                    <div className="libre-layout">
                        <div>
                            {/* Option to select 6 or 9 included experiences */}
                            <div style={{ background: '#f8f9fa', padding: '20px 24px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Modalidad de Experiencias Incluidas</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>Elige cuántas experiencias gratuitas quieres incluir en tu paquete Esencial:</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className={`btn ${freeExpLimit === 6 ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setFreeExpLimit(6)}
                                        style={{ padding: '8px 18px', borderRadius: '100px', fontSize: '0.88rem', fontWeight: 700 }}
                                    >
                                        6 Incluidas gratis
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${freeExpLimit === 9 ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setFreeExpLimit(9)}
                                        style={{ padding: '8px 18px', borderRadius: '100px', fontSize: '0.88rem', fontWeight: 700 }}
                                    >
                                        9 Incluidas gratis
                                    </button>
                                </div>
                            </div>

                            <div className="step3-section-title">🌸 Selecciona tus experiencias (hasta {freeExpLimit} incluidas sin costo)</div>

                            <div className="guiado-exp-grid" style={{ marginBottom: '50px' }}>
                                {EXPERIENCIAS_DISPONIBLES.map(exp => {
                                    const isSelected = selectedExps.includes(exp.id)
                                    const selIndex = selectedExps.indexOf(exp.id)
                                    const isIncluded = isSelected && selIndex < freeExpLimit
                                    const isAdditional = isSelected && selIndex >= freeExpLimit
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
                                                        <span className="guiado-price-included">✨ Incluida gratis ({selIndex + 1}/{freeExpLimit})</span>
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

                            {/* Complementos */}
                            <div>
                                <div className="step3-section-title">✨ Complementos adicionales (opcionales)</div>
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
                        </div>

                        {/* Right column: Floating Ticket Sidebar */}
                        <FloatingTicket
                            season={season}
                            temporadaKey={temporadaKey}
                            estilo="Esencial"
                            selectorData={selectorData}
                            selectedPkg={selectedPkg}
                            includedExps={includedNames}
                            addedItems={extraItems}
                            selectedComps={selectedComps}
                            freeExpLimit={freeExpLimit}
                            basePrice={basePrice}
                            extraTotal={extraTotal}
                            onOpenCheckout={() => setIsCheckoutOpen(true)}
                        />
                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={season}
                estilo="Esencial"
                totalPrice={totalPrice}
                desglose={
                    `Pasajeros: ${adults} Adultos, ${children} Menores. ` +
                    `Fechas: ${selectorData.dateMode === 'month' ? selectorData.selectedMonth : `${selectorData.startDate} a ${selectorData.endDate}`}. ` +
                    `Incluidas (${freeExpLimit} gratis): ${includedNames.join(', ')}. ` +
                    `Adicionales: ${extraItems.map(e => e.name).join(', ')} (+${formatPrice(extraTotal)} MXN). ` +
                    `Extras: ${selectedComps.join(', ')}.`
                }
            />
        </>
    )
}
