import { useState, useMemo } from 'react'
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
import RecommendedExperiencesCMS from './RecommendedExperiencesCMS'

import { useTripSearch } from '../../context/TripContext'

/**
 * StepLibre — Step 3 for "Libre" experience.
 * Features: TripSelectorBar (Dates & Passengers), duration selector, experience toggle grid, floating ticket calculator.
 */
export default function StepLibre({ season, temporadaKey }) {
    const { tripSearch: selectorData, updateTripSearch: setSelectorData } = useTripSearch()
    const [selectedDuration, setSelectedDuration] = useState(0)
    const [addedExperiences, setAddedExperiences] = useState([])
    const [selectedComps, setSelectedComps] = useState([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    const toggleComp = (title) => {
        setSelectedComps(prev =>
            prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
        )
    }

    const hero = EXP_HEROES.libre
    const pricing = PRECIOS[temporadaKey]?.libre
    const packages = pricing?.packages || []
    const toggleExperience = (tourObj) => {
        setAddedExperiences(prev => {
            const exists = prev.some(item => item.id === tourObj.id)
            if (exists) {
                return prev.filter(item => item.id !== tourObj.id)
            } else {
                return [...prev, { id: tourObj.id, name: tourObj.title || tourObj.name, price: tourObj.priceNum || tourObj.price || 0 }]
            }
        })
    }

    const selectedPkg = packages[selectedDuration] || packages[0]
    const basePrice = selectedPkg?.priceNum || 24790

    const addedItems = addedExperiences
    const extrasTotal = addedItems.reduce((sum, e) => sum + (e.price || 0), 0)

    const formatPrice = (n) => `$${n.toLocaleString('es-MX')}`

    const passNames = ['Pase Express', 'Pase Clásico', 'Pase Explorador', 'Pase Gran Tour']
    const passBadges = ['', 'Más Popular 🌟', '', 'Recomendado 🔥']

    const adults = selectorData.adults
    const children = selectorData.children
    const passengersCount = adults + children
    const pricePerPerson = basePrice + extrasTotal
    const totalPrice = pricePerPerson * passengersCount

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
                    <div className="step3-section-title">✅ Tu viaje ya incluye</div>
                    <div className="jtb-pass-includes-grid">
                        {[
                            { icon: '🏨', title: 'Hospedaje Seleccionado', desc: 'Estancia en hoteles de alta valoración en Tokio, Kioto y Osaka.' },
                            { icon: '🚄', title: 'Movilidad en Japón', desc: 'Tarjetas IC recargables y pases de transporte seleccionados.' },
                            { icon: '📋', title: 'Guía Digital & Asesoría', desc: 'Rutas recomendadas y asistencia remota para personalizar tus días.' },
                            { icon: '📶', title: 'Conectividad eSIM', desc: 'Internet ilimitado en tu smartphone durante toda tu estancia.' },
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

            {/* Duration Selector + Experiences Grid + Floating Ticket */}
            <section className="step3-section">
                <div className="container">
                    {/* Top Date & Passenger Selector */}
                    <TripSelectorBar selectorData={selectorData} onChange={setSelectorData} />

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

                            {/* Wix CMS Recommended Experiences (3 Collapsible Accordion Sections) */}
                            <RecommendedExperiencesCMS
                                addedExperiences={addedExperiences.map(e => e.id)}
                                onToggleExperience={(tourId, tourTitle, tourPriceNum) => {
                                    toggleExperience({ id: tourId, title: tourTitle, priceNum: tourPriceNum })
                                }}
                                seasonName={season.name}
                            />

                            {/* Complementos */}
                            <div>
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
                        </div>

                        {/* Right column: Floating Ticket Sidebar */}
                        <FloatingTicket
                            season={season}
                            temporadaKey={temporadaKey}
                            estilo="Libre"
                            selectorData={selectorData}
                            selectedPkg={selectedPkg}
                            addedItems={addedItems}
                            selectedComps={selectedComps}
                            basePrice={basePrice}
                            extraTotal={extrasTotal}
                            onOpenCheckout={() => setIsCheckoutOpen(true)}
                        />
                    </div>
                </div>
            </section>
            
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={season}
                estilo="Libre"
                totalPrice={totalPrice}
                desglose={
                    `Pasajeros: ${adults} Adultos, ${children} Menores. ` +
                    `Fechas: ${selectorData.dateMode === 'month' ? selectorData.selectedMonth : `${selectorData.startDate} a ${selectorData.endDate}`}. ` +
                    `Pase: ${selectedPkg ? selectedPkg.days : ''}. ` +
                    `Experiencias: ${addedItems.map(e => e.name).join(', ')}. ` +
                    `Extras: ${selectedComps.join(', ')}.`
                }
            />
        </>
    )
}
