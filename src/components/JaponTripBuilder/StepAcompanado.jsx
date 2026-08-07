import { useState, useEffect, useMemo } from 'react'
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
import RecommendedExperiencesCMS from './RecommendedExperiencesCMS'
import { fetchPreciosCategoriasDias } from '../../lib/wixClient'

import { useTripSearch } from '../../context/TripContext'

/**
 * StepAcompanado — Step 3 for "Completo" (Acompañado) experience.
 * Features:
 * - 2 Pass Options: PASE EXPLORADOR (12 días / 1 extra tour) & PASE GRAND TOUR (14 días / 2 extra tours)
 * - Dynamic Day-by-Day itinerary timeline filtered by pass duration
 * - Extra Tours section (RecommendedExperiencesCMS) with free tour limit based on pass
 * - FloatingTicket & CheckoutModal integration
 */
export default function StepAcompanado({ season, temporadaKey }) {
    const { tripSearch: selectorData, updateTripSearch: setSelectorData } = useTripSearch()
    const hero = EXP_HEROES.acompanado

    const [selectedPassIndex, setSelectedPassIndex] = useState(0) // 0: Explorador, 1: Grand Tour
    const [selectedExps, setSelectedExps] = useState([])
    const [selectedComps, setSelectedComps] = useState([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [cmsPackages, setCmsPackages] = useState([])

    useEffect(() => {
        let isMounted = true
        async function loadCmsPrices() {
            const allPrices = await fetchPreciosCategoriasDias()
            const filtered = allPrices.filter(p =>
                p.categoria.toLowerCase().includes('completo') &&
                (p.temporada.toLowerCase() === (season?.name || '').toLowerCase() || p.temporada.toLowerCase() === temporadaKey.toLowerCase())
            )
            if (isMounted && filtered.length > 0) {
                // Map packages for Completo (e.g. Explorador vs Grand Tour)
                const mapped = filtered.map(p => {
                    const isGrandTour = p.tituloComercial.toUpperCase().includes('GRAND') || p.dias.includes('14')
                    return {
                        id: p.id,
                        name: p.tituloComercial || (isGrandTour ? 'PASE GRAND TOUR' : 'PASE EXPLORADOR'),
                        days: p.diasYNochesCompletos || (isGrandTour ? '14 días 12 noches' : '12 días 10 noches'),
                        daysNum: isGrandTour ? 14 : 12,
                        priceNum: p.precioNum || (isGrandTour ? 72290 : 67490),
                        priceText: p.precioText,
                        freeTours: isGrandTour ? 2 : 1, // 1 for Explorador, 2 for Grand Tour
                    }
                })
                // Sort so Explorador comes first, then Grand Tour
                mapped.sort((a, b) => a.daysNum - b.daysNum)
                setCmsPackages(mapped)
            }
        }
        loadCmsPrices()
        return () => { isMounted = false }
    }, [season?.name, temporadaKey])

    const toggleComp = (title) => {
        setSelectedComps(prev =>
            prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
        )
    }

    const toggleExperience = (tourObj) => {
        setSelectedExps(prev => {
            const exists = prev.some(item => item.id === tourObj.id)
            if (exists) {
                return prev.filter(item => item.id !== tourObj.id)
            } else {
                return [...prev, { id: tourObj.id, name: tourObj.title || tourObj.name, price: tourObj.priceNum || tourObj.price || 0 }]
            }
        })
    }

    // Default package fallback if CMS is loading
    const defaultPackages = [
        { name: 'PASE EXPLORADOR', days: '12 días 10 noches', daysNum: 12, priceNum: 67490, priceText: '$67,490.00 MXN', freeTours: 1 },
        { name: 'PASE GRAND TOUR', days: '14 días 12 noches', daysNum: 14, priceNum: 72290, priceText: '$72,290.00 MXN', freeTours: 2 },
    ]

    const packages = cmsPackages.length > 0 ? cmsPackages : defaultPackages
    const activePass = packages[selectedPassIndex] || packages[0]

    const basePrice = activePass.priceNum
    const freeExpLimit = activePass.freeTours || 1

    const includedExpsList = selectedExps.slice(0, freeExpLimit).map(e => e.name)
    const extraItems = selectedExps.slice(freeExpLimit)
    const extraTotal = extraItems.reduce((sum, item) => sum + (item.price || 0), 0)

    const fullItinerario = season?.key === 'momiji' ? ITINERARIO_ACOMPANADO_MOMIJI : ITINERARIO_ACOMPANADO
    // Filter itinerary timeline according to chosen pass (12 days vs 14 days)
    const filteredItinerario = useMemo(() => {
        return fullItinerario.filter(item => item.day <= activePass.daysNum)
    }, [fullItinerario, activePass.daysNum])

    const todoIncluido = season?.key === 'momiji' ? ACOMPANADO_TODO_INCLUIDO_MOMIJI : ACOMPANADO_TODO_INCLUIDO

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    const adults = selectorData.adults || 2
    const children = selectorData.children || 0
    const passengersCount = adults + children
    const pricePerPerson = basePrice + extraTotal
    const totalPrice = pricePerPerson * passengersCount

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
                            {/* Pass Selector Cards (Pase Explorador vs Pase Grand Tour) */}
                            <div style={{ marginBottom: 50 }}>
                                <div className="step3-section-title">🎋 Elige la modalidad de tu Viaje Completo</div>
                                <div className="libre-duration-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                                    {packages.map((pkg, i) => {
                                        const isSelected = selectedPassIndex === i
                                        return (
                                            <div
                                                key={i}
                                                className={`libre-duration-card${isSelected ? ' libre-duration-card--selected' : ''}`}
                                                onClick={() => setSelectedPassIndex(i)}
                                                style={{ padding: '24px 20px', cursor: 'pointer' }}
                                            >
                                                <span className="libre-duration-card-badge">
                                                    {pkg.freeTours === 1 ? '🎁 Incluye 1 Tour Extra Gratis' : '🎁 Incluye 2 Tours Extras Gratis'}
                                                </span>
                                                <div className="libre-duration-check">{isSelected ? '✓' : ''}</div>
                                                <span className="libre-duration-pass-name" style={{ fontSize: '1.25rem' }}>{pkg.name}</span>
                                                <div className="libre-duration-days">{pkg.days.split(' ')[0]} días</div>
                                                <div className="libre-duration-nights">{pkg.days.split(' ').slice(1).join(' ')}</div>
                                                <div className="libre-duration-price">{pkg.priceText || formatPrice(pkg.priceNum)}</div>
                                                <span className="libre-duration-per">MXN / persona</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Extra Tours Section (RecommendedExperiencesCMS) */}
                            <RecommendedExperiencesCMS
                                addedExperiences={selectedExps.map(e => e.id)}
                                onToggleExperience={(tourId, tourTitle, tourPriceNum) => {
                                    toggleExperience({ id: tourId, title: tourTitle, priceNum: tourPriceNum })
                                }}
                                seasonName={`${season.name} (${activePass.name})`}
                            />

                            {/* Timeline Shinkansen Rail JR Line (Filtered by pass duration) */}
                            <div style={{ marginBottom: '60px' }}>
                                <div className="step3-section-title">
                                    🚄 Ruta JR Line — Itinerario Completo ({activePass.name}: {activePass.days})
                                </div>
                                <div className="acomp-shinkansen-timeline">
                                    <div className="acomp-railway-track" style={{ '--rail-color': season.colors.primary }} />
                                    {filteredItinerario.map((item) => (
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

                            {/* Upsell */}
                            <div>
                                <div className="step3-section-title">✨ Complementos opcionales (selecciona para agregar)</div>
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
                            selectedPkg={{ days: activePass.days, priceNum: activePass.priceNum, name: activePass.name }}
                            includedExps={includedExpsList}
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
                estilo="Completo"
                totalPrice={totalPrice}
                desglose={
                    `Modalidad: ${activePass.name} (${activePass.days}). ` +
                    `Pasajeros: ${adults} Adultos, ${children} Menores. ` +
                    `Incluidas (${freeExpLimit} gratis): ${includedExpsList.join(', ') || 'Ninguna'}. ` +
                    (extraItems.length ? `Adicionales: ${extraItems.map(e => e.name).join(', ')} (+${formatPrice(extraTotal)} MXN). ` : '') +
                    `Extras: ${selectedComps.join(', ') || 'Ninguno'}.`
                }
            />
        </>
    )
}
