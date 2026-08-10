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
                        freeTours: p.tourGratisQueIncluira || (isGrandTour ? 2 : 1),
                        limiteDeTours: p.limiteDeTours || (isGrandTour ? 12 : 10)
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

    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [pendingTour, setPendingTour] = useState(null)

    const defaultPackages = [
        { name: 'PASE EXPLORADOR', days: '12 días 10 noches', daysNum: 12, priceNum: 67490, priceText: '$67,490.00 MXN', freeTours: 1, limiteDeTours: 10 },
        { name: 'PASE GRAND TOUR', days: '14 días 12 noches', daysNum: 14, priceNum: 72290, priceText: '$72,290.00 MXN', freeTours: 2, limiteDeTours: 12 },
    ]

    const packages = cmsPackages.length > 0 ? cmsPackages : defaultPackages
    const activePass = packages[selectedPassIndex] || packages[0]
    const currentTourLimit = activePass?.limiteDeTours || (activePass?.daysNum === 14 ? 12 : 10)

    const toggleExperience = (tourObj) => {
        const exists = selectedExps.some(item => item.id === tourObj.id)
        if (exists) {
            setSelectedExps(prev => prev.filter(item => item.id !== tourObj.id))
        } else {
            if (selectedExps.length >= currentTourLimit) {
                setPendingTour({ id: tourObj.id, name: tourObj.title || tourObj.name, price: tourObj.priceNum || tourObj.price || 0 })
                setShowUpgradeModal(true)
                return
            }
            setSelectedExps(prev => [...prev, { id: tourObj.id, name: tourObj.title || tourObj.name, price: tourObj.priceNum || tourObj.price || 0 }])
        }
    }

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
                                tourLimit={currentTourLimit}
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

            {/* Upgrade Pass Modal when Tour Limit is Reached */}
            {showUpgradeModal && (
                <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 99999 }}>
                    <div className="jtb-modal-card" style={{ maxWidth: '620px', textAlign: 'center', padding: '36px 28px' }}>
                        <button className="jtb-modal-close" onClick={() => setShowUpgradeModal(false)}>&times;</button>
                        
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌸</div>
                        
                        <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)', marginBottom: '10px', lineHeight: 1.3 }}>
                            Has alcanzado el límite de {currentTourLimit} tours para tu {activePass.name || 'Pase'}
                        </h3>
                        
                        <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '24px', lineHeight: '1.5' }}>
                            ¿Deseas ampliar tus días en Japón para agregar más tours a tu viaje? Puedes seleccionar un paquete con mayor duración:
                        </p>

                        {selectedPassIndex === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: '#f8f9fa',
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        border: '1.5px solid #e9ecef',
                                        textAlign: 'left',
                                        gap: '12px',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '800', color: 'var(--color-dark)', fontSize: '1.05rem' }}>
                                            PASE GRAND TOUR ({packages[1]?.days || '14 días 12 noches'})
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#2b8a3e', fontWeight: '700', marginTop: '3px' }}>
                                            ✨ Hasta 12 tours disponibles · {packages[1]?.priceText || '$72,290.00 MXN'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: '800', borderRadius: '100px' }}
                                        onClick={() => {
                                            setSelectedPassIndex(1)
                                            setShowUpgradeModal(false)
                                            if (pendingTour) {
                                                setSelectedExps(prev => [...prev, pendingTour])
                                                setPendingTour(null)
                                            }
                                        }}
                                    >
                                        Ampliar a Grand Tour 🚀
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            className="btn btn-outline"
                            style={{ width: '100%', borderRadius: '100px', fontSize: '0.9rem', color: '#666', borderColor: '#ccc', padding: '12px' }}
                            onClick={() => setShowUpgradeModal(false)}
                        >
                            Entendido, conservar {activePass.name}
                        </button>
                    </div>
                </div>
            )}

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
