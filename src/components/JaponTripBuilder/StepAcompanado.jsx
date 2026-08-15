import { useState, useEffect, useMemo } from 'react'
import {
    ITINERARIO_ACOMPANADO,
    ITINERARIO_ACOMPANADO_MOMIJI,
    ITINERARIO_ACOMPANADO_SAKURA,
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
import { fetchPreciosCategoriasDias, fetchTourIndividuales } from '../../lib/wixClient'

import { useTripSearch } from '../../context/TripContext'

/**
 * StepAcompanado — Step 3 for "Completo" (Acompañado) experience.
 * Features:
 * - 2 Pass Options: PASE EXPLORADOR (12 días / 1 extra tour) & PASE GRAND TOUR (14 días / 2 extra tours)
 * - Dynamic Day-by-Day itinerary timeline filtered by pass duration (DISPLAYED FIRST)
 * - Free Day in Tokyo Pop-up / Experience selector (SOLO EN TOKIO)
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
    const [cmsDatesText, setCmsDatesText] = useState('')
    const [isTokyoModalOpen, setIsTokyoModalOpen] = useState(false)
    const [allTours, setAllTours] = useState([])

    // Load CMS prices and dynamic dates
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
                    const isGrandTour = p.tituloComercial.toUpperCase().includes('GRAND') || (p.dias || '').includes('14')
                    return {
                        id: p.id,
                        name: p.tituloComercial || (isGrandTour ? 'PASE GRAND TOUR' : 'PASE EXPLORADOR'),
                        days: p.diasYNochesCompletos || (isGrandTour ? '14 días 12 noches' : '12 días 10 noches'),
                        daysNum: isGrandTour ? 14 : 12,
                        priceNum: p.precioNum || (isGrandTour ? 72290 : 67490),
                        priceText: p.precioText,
                        freeTours: p.tourGratisQueIncluira || (isGrandTour ? 2 : 1),
                        limiteDeTours: p.limiteDeTours || (isGrandTour ? 12 : 10),
                        fechasDeInicio: p.fechasDeInicio,
                        fechaEntre: p.fechaEntre,
                    }
                })
                // Sort so Explorador comes first, then Grand Tour
                mapped.sort((a, b) => a.daysNum - b.daysNum)
                setCmsPackages(mapped)

                if (mapped[0]?.fechasDeInicio && mapped[0]?.fechaEntre) {
                    setCmsDatesText(`${mapped[0].fechasDeInicio} al ${mapped[0].fechaEntre} (Salida Grupal)`)
                }
            }
        }
        loadCmsPrices()
        return () => { isMounted = false }
    }, [season?.name, temporadaKey])

    // Load individual tours for Tokyo modal
    useEffect(() => {
        let isMounted = true
        async function loadTours() {
            const data = await fetchTourIndividuales()
            if (isMounted) {
                setAllTours(data || [])
            }
        }
        loadTours()
        return () => { isMounted = false }
    }, [])

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

    // Auto-trim experiences if switching to a pass with a lower limit
    useEffect(() => {
        if (selectedExps.length > currentTourLimit) {
            setSelectedExps(prev => prev.slice(0, currentTourLimit))
        }
    }, [currentTourLimit])

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

    const fullItinerario = season?.key === 'momiji' ? ITINERARIO_ACOMPANADO_MOMIJI : season?.key === 'sakura' ? ITINERARIO_ACOMPANADO_SAKURA : ITINERARIO_ACOMPANADO
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

    // Filter Tokyo-only experiences for the Free Day in Tokyo Modal
    const tokyoTours = useMemo(() => {
        return allTours.filter(t => {
            const title = (t.title || '').toLowerCase()
            const cat = (t.category || '').toLowerCase()
            return (
                title.includes('tokyo') ||
                title.includes('tokio') ||
                title.includes('disney') ||
                title.includes('harry potter') ||
                title.includes('fuji') ||
                title.includes('nikko') ||
                title.includes('kamakura') ||
                title.includes('akihabara') ||
                title.includes('kimono') ||
                title.includes('samurai') ||
                title.includes('yakatabune') ||
                title.includes('sanrio') ||
                title.includes('sensoji') ||
                title.includes('sky tree') ||
                cat.includes('parques') ||
                cat.includes('vip')
            )
        })
    }, [allTours])

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
                    <TripSelectorBar
                        selectorData={selectorData}
                        onChange={setSelectorData}
                        selectedDays={activePass.daysNum || 12}
                        selectedNights={(activePass.daysNum || 12) - 2}
                        isFixedDates={true}
                        fixedDatesText={cmsDatesText || (season?.key === 'momiji' ? '15 Oct — 28 Oct 2026 (Salida Grupal)' : '22 Marzo — 2 Abril 2027 (Salida Grupal)')}
                    />

                    <div className="libre-layout">
                        <div>
                            {/* Pass Selector Cards (Pase Explorador vs Pase Grand Tour) */}
                            <div style={{ marginBottom: 40 }}>
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

                            {/* 1. ITINERARIO DÍA POR DÍA PRIMERO (Filtered by pass duration) */}
                            <div style={{ marginBottom: '50px' }}>
                                <div className="step3-section-title">
                                    🚄 Ruta JR Line — Itinerario Completo ({activePass.name}: {activePass.days})
                                </div>
                                <div className="acomp-shinkansen-timeline">
                                    <div className="acomp-railway-track" style={{ '--rail-color': season.colors.primary }} />
                                    {filteredItinerario.map((item) => {
                                        const isTokyoFreeDay = (
                                            item.day === 11 ||
                                            (item.title && item.title.toLowerCase().includes('libre')) ||
                                            (item.desc && item.desc.toLowerCase().includes('libre en tokio')) ||
                                            (item.desc && item.desc.toLowerCase().includes('libre'))
                                        ) && (
                                            item.desc.toLowerCase().includes('tokio') ||
                                            item.title.toLowerCase().includes('tokio') ||
                                            item.day === 11 ||
                                            item.day === 13
                                        )

                                        return (
                                            <div className="acomp-station-item" key={item.day}>
                                                <div className="acomp-station-marker" style={{ backgroundColor: season.colors.primary }}>
                                                    <span className="acomp-station-number">{item.day}</span>
                                                </div>
                                                <div className="acomp-station-card" style={isTokyoFreeDay ? { border: `2px solid ${season.colors.primary}`, background: 'rgba(233,30,99,0.03)' } : {}}>
                                                    <div className="acomp-station-header">
                                                        <span className="acomp-station-icon">{item.icon}</span>
                                                        <h4 className="acomp-station-title">Día {item.day}: {item.title}</h4>
                                                    </div>
                                                    <p className="acomp-station-desc">{item.desc}</p>
                                                    
                                                    {/* Pop-up trigger for Free Day in Tokyo ONLY */}
                                                    {isTokyoFreeDay && (
                                                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed rgba(233,30,99,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                                            <span style={{ fontSize: '0.82rem', fontWeight: '750', color: 'var(--color-primary, #d6336c)' }}>
                                                                🎯 Día libre en Tokio — Personaliza tu día:
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary"
                                                                style={{ fontSize: '0.8rem', padding: '6px 16px', borderRadius: '100px', fontWeight: '750' }}
                                                                onClick={() => setIsTokyoModalOpen(true)}
                                                            >
                                                                ✨ Elegir Tour o Experiencia en Tokio
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 2. EXTRA TOURS SECTION (RecommendedExperiencesCMS) */}
                            <div style={{ marginBottom: '40px' }}>
                                <RecommendedExperiencesCMS
                                    addedExperiences={selectedExps.map(e => e.id)}
                                    onToggleExperience={(tourId, tourTitle, tourPriceNum) => {
                                        toggleExperience({ id: tourId, title: tourTitle, priceNum: tourPriceNum })
                                    }}
                                    seasonName={`${season.name} (${activePass.name})`}
                                    tourLimit={currentTourLimit}
                                />
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
                            tourDate={cmsDatesText ? cmsDatesText.replace(' (Salida Grupal)', '') : (season?.key === 'momiji' ? '15 Oct — 28 Oct 2026' : '22 Marzo — 2 Abril 2027')}
                            selectedPkg={{ name: activePass.name, days: activePass.days, priceNum: basePrice }}
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

            {/* Modal: Elegir Tour / Experiencia para Día Libre en Tokio */}
            {isTokyoModalOpen && (
                <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 999999 }} onClick={() => setIsTokyoModalOpen(false)}>
                    <div className="jtb-modal-card" style={{ maxWidth: '800px', maxHeight: '88vh', overflowY: 'auto', padding: '32px 28px' }} onClick={e => e.stopPropagation()}>
                        <button className="jtb-modal-close" onClick={() => setIsTokyoModalOpen(false)}>&times;</button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '2.5rem' }}>🗼</span>
                            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', margin: '8px 0 4px', color: 'var(--color-dark)' }}>
                                Tours y Experiencias en Tokio para tu Día Libre
                            </h3>
                            <p style={{ fontSize: '0.88rem', color: '#666', margin: 0 }}>
                                Selecciona la experiencia que te gustaría vivir en tu día libre en Tokio. Se agregará directamente a tu Pase de Abordar:
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                            {tokyoTours.map(t => {
                                const isSelected = selectedExps.some(e => e.id === t.id)
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => toggleExperience({ id: t.id, name: t.title, price: t.priceNum || 0 })}
                                        style={{
                                            border: isSelected ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e5e7eb',
                                            background: isSelected ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                            borderRadius: '14px',
                                            padding: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                    >
                                        <div>
                                            <div style={{ height: '110px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', background: '#f3f4f6' }}>
                                                <img src={t.image} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <h5 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.25 }}>
                                                {t.title}
                                            </h5>
                                            {t.excerpt && (
                                                <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#666', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {t.excerpt}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                {t.priceText || (t.priceNum ? `$${t.priceNum.toLocaleString('es-MX')} MXN` : 'Incluido')}
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                background: isSelected ? 'var(--color-primary, #e11d48)' : '#f3f4f6',
                                                color: isSelected ? '#fff' : '#4b5563'
                                            }}>
                                                {isSelected ? '✓ Agregado' : '+ Agregar'}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ padding: '10px 32px', borderRadius: '100px', fontWeight: 750, fontSize: '0.9rem' }}
                                onClick={() => setIsTokyoModalOpen(false)}
                            >
                                Listo, ver mi Pase de Abordar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Pass Modal when Tour Limit is Reached */}
            {showUpgradeModal && (
                <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 999999 }}>
                    <div className="jtb-modal-card" style={{ maxWidth: '620px', textAlign: 'center', padding: '36px 28px' }}>
                        <button className="jtb-modal-close" onClick={() => setShowUpgradeModal(false)}>&times;</button>
                        
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌸</div>
                        
                        <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)', marginBottom: '10px', lineHeight: 1.3 }}>
                            Has alcanzado el límite de {currentTourLimit} tours para tu {activePass.name}
                        </h3>
                        
                        <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '24px', lineHeight: '1.5' }}>
                            Tu <strong>{activePass.name}</strong> incluye {freeExpLimit} tours extra gratis y permite hasta {currentTourLimit} tours en total. ¿Deseas ampliar a <strong>PASE GRAND TOUR (14 días)</strong> para obtener 2 tours gratis y mayor límite?
                        </p>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {selectedPassIndex === 0 && packages[1] && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ padding: '12px 24px', borderRadius: '100px', fontSize: '0.9rem' }}
                                    onClick={() => {
                                        setSelectedPassIndex(1)
                                        setShowUpgradeModal(false)
                                        if (pendingTour) {
                                            setSelectedExps(prev => [...prev, pendingTour])
                                            setPendingTour(null)
                                        }
                                    }}
                                >
                                    ⭐ Cambiar a Pase Grand Tour (14 días)
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{ padding: '12px 24px', borderRadius: '100px', fontSize: '0.9rem', color: '#666', borderColor: '#ccc' }}
                                onClick={() => setShowUpgradeModal(false)}
                            >
                                Conservar {activePass.name}
                            </button>
                        </div>
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
                    `Pase: ${activePass.name} (${activePass.days}). ` +
                    `Pasajeros: ${adults} Adultos, ${children} Menores. ` +
                    `Fechas: ${cmsDatesText || (season?.key === 'momiji' ? '15 Oct — 28 Oct 2026' : '22 Marzo — 2 Abril 2027')}. ` +
                    `Incluidas (${freeExpLimit} gratis): ${includedExpsList.join(', ') || 'Ninguna'}. ` +
                    (extraItems.length ? `Adicionales: ${extraItems.map(e => e.name).join(', ')} (+${formatPrice(extraTotal)} MXN). ` : '') +
                    `Extras: ${selectedComps.join(', ') || 'Ninguno'}.`
                }
            />
        </>
    )
}
