import { useState, useEffect } from 'react'
import {
    COMPLEMENTOS,
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
 * StepGuiado — Step 3 for "Esencial" (Guiado) experience.
 * Features:
 * - 4 Pass Options (Express 8d, Clásico 10d, Explorador 12d, Grand Tour 14d) loaded from Wix CMS
 * - Exact date calculation with dual calendar
 * - Free experience limit (6 or 8) + selectable extra tours up to pass limit
 * - Auto-trim selected tours when switching to a lower pass
 * - FloatingTicket & CheckoutModal
 */
export default function StepGuiado({ season, temporadaKey }) {
    const { tripSearch: selectorData, updateTripSearch: setSelectorData } = useTripSearch()
    const [selectedDuration, setSelectedDuration] = useState(0) // 0: Express, 1: Clásico, 2: Explorador, 3: Grand Tour
    const [selectedExps, setSelectedExps] = useState([])
    const [selectedComps, setSelectedComps] = useState([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [cmsPackages, setCmsPackages] = useState([])

    useEffect(() => {
        let isMounted = true
        async function loadCmsPrices() {
            const allPrices = await fetchPreciosCategoriasDias()
            const filtered = allPrices.filter(p =>
                p.categoria.toLowerCase().includes('esencial') &&
                (p.temporada.toLowerCase() === (season?.name || '').toLowerCase() || p.temporada.toLowerCase() === temporadaKey.toLowerCase())
            )
            if (isMounted && filtered.length > 0) {
                const mapped = filtered.map(p => {
                    const daysMatch = (p.dias || '').match(/\d+/)
                    const nightsMatch = (p.noches || '').match(/\d+/)
                    const daysNum = daysMatch ? parseInt(daysMatch[0], 10) : (p.tituloComercial.includes('EXPRESS') ? 8 : p.tituloComercial.includes('CLÁSICO') ? 10 : p.tituloComercial.includes('EXPLORADOR') ? 12 : 14)
                    const nightsNum = nightsMatch ? parseInt(nightsMatch[0], 10) : (daysNum - 2)

                    return {
                        id: p.id,
                        name: p.tituloComercial || `Pase ${daysNum} Días`,
                        days: p.diasYNochesCompletos || `${daysNum} días ${nightsNum} noches`,
                        daysNum: daysNum,
                        nightsNum: nightsNum,
                        price: p.precioText || `$${(p.precioNum || 0).toLocaleString('es-MX')} MXN`,
                        priceNum: p.precioNum,
                        freeTours: p.tourGratisQueIncluira || (daysNum === 14 ? 8 : 6),
                        limiteDeTours: p.limiteDeTours || (daysNum === 8 ? 6 : daysNum === 10 ? 8 : daysNum === 12 ? 10 : 12),
                    }
                })
                // Sort ascending by daysNum
                mapped.sort((a, b) => a.daysNum - b.daysNum)
                setCmsPackages(mapped)
            }
        }
        loadCmsPrices()
        return () => { isMounted = false }
    }, [season?.name, temporadaKey])

    const defaultPackages = [
        { name: 'PASE EXPRESS', days: '8 días 6 noches', daysNum: 8, nightsNum: 6, priceNum: 43490, price: '$43,490.00 MXN', freeTours: 6, limiteDeTours: 6 },
        { name: 'PASE CLÁSICO', days: '10 días 8 noches', daysNum: 10, nightsNum: 8, priceNum: 49490, price: '$49,490.00 MXN', freeTours: 6, limiteDeTours: 8 },
        { name: 'PASE EXPLORADOR', days: '12 días 10 noches', daysNum: 12, nightsNum: 10, priceNum: 58490, price: '$58,490.00 MXN', freeTours: 6, limiteDeTours: 10 },
        { name: 'PASE GRAND TOUR', days: '14 días 12 noches', daysNum: 14, nightsNum: 12, priceNum: 64790, price: '$64,790.00 MXN', freeTours: 8, limiteDeTours: 12 },
    ]

    const packages = cmsPackages.length > 0 ? cmsPackages : defaultPackages
    const activePkg = packages[selectedDuration] || packages[0]
    const freeExpLimit = activePkg.freeTours || (activePkg.daysNum === 14 ? 8 : 6)
    const currentTourLimit = activePkg.limiteDeTours || (activePkg.daysNum === 8 ? 6 : activePkg.daysNum === 10 ? 8 : activePkg.daysNum === 12 ? 10 : 12)
    const currentDays = activePkg.daysNum || 8
    const currentNights = activePkg.nightsNum || 6
    const basePrice = activePkg.priceNum || 43490

    const passBadges = [
        '✨ Más Popular',
        '⭐ Recomendado',
        '⛩️ Completo',
        '👑 Máxima Experiencia',
    ]

    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [pendingTour, setPendingTour] = useState(null)

    // Auto-trim experiences if switching to a pass with a lower limit
    useEffect(() => {
        if (selectedExps.length > currentTourLimit) {
            setSelectedExps(prev => prev.slice(0, currentTourLimit))
        }
    }, [currentTourLimit])

    // Auto-calculate end date from start date + (currentDays - 1) days (exact calendar coverage)
    useEffect(() => {
        if (selectorData.startDate) {
            const [y, m, d] = selectorData.startDate.split('-').map(Number)
            if (y && m && d) {
                const dt = new Date(y, m - 1, d)
                dt.setDate(dt.getDate() + (currentDays - 1))
                const endY = dt.getFullYear()
                const endM = String(dt.getMonth() + 1).padStart(2, '0')
                const endD = String(dt.getDate()).padStart(2, '0')
                const calcEndDate = `${endY}-${endM}-${endD}`

                if (selectorData.endDate !== calcEndDate) {
                    setSelectorData(prev => ({
                        ...prev,
                        endDate: calcEndDate
                    }))
                }
            }
        }
    }, [selectorData.startDate, currentDays, selectedDuration])

    const toggleComp = (title) => {
        setSelectedComps(prev =>
            prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
        )
    }

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

    const hero = EXP_HEROES.guiado
    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    const includedExpsList = selectedExps.slice(0, freeExpLimit).map(e => e.name)
    const extraItems = selectedExps.slice(freeExpLimit)
    const extraTotal = extraItems.reduce((sum, item) => sum + (item.price || 0), 0)

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
                            { icon: '🏨', title: 'Hospedaje y Desayuno Buffet', desc: 'Habitaciones dobles en hoteles APA de 3 y 4 estrellas con calidad premium y desayuno buffet incluido.' },
                            { icon: '🚄', title: 'Transporte y Tren Bala Shinkansen', desc: 'Boletos de tren bala Shinkansen, tarjeta IC recargable y traslado del hotel al aeropuerto.' },
                            { icon: '🎌', title: `${freeExpLimit} Actividades Incluidas con Guía`, desc: `Organiza tu itinerario con ${freeExpLimit} experiencias incluidas acompañadas por un guía experto.` },
                            { icon: '📶', title: 'Wi-Fi Ilimitado (eSIM HolaFly)', desc: 'Conexión a internet de alta velocidad ilimitada durante todo tu recorrido en Japón.' },
                            { icon: '👥', title: 'Bonus Extras y Asistencia Remota', desc: 'Asesoría experta y asistencia remota antes y durante tu viaje para organizar días libres y vuelos.' },
                            { icon: '💳', title: 'Plan de Pagos Flexible', desc: 'Reserva con anticipo y liquida el saldo en cómodas mensualidades.' },
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
                    <div className="libre-layout">
                        <div>
                            {/* Paso 1: Elige tu Pase de Viaje */}
                            <div style={{ marginBottom: 32 }}>
                                <div className="step3-section-title">🎋 1. Elige tu Pase de Viaje Esencial</div>
                                <div className="libre-duration-grid">
                                    {packages.slice(0, 4).map((pkg, i) => (
                                        <div
                                            key={i}
                                            className={`libre-duration-card${selectedDuration === i ? ' libre-duration-card--selected' : ''}`}
                                            onClick={() => setSelectedDuration(i)}
                                        >
                                            <span className="libre-duration-card-badge">
                                                {pkg.freeTours ? `🎁 ${pkg.freeTours} Tours Gratis` : (passBadges[i] || 'Disponible')}
                                            </span>
                                            <div className="libre-duration-check">✓</div>
                                            <span className="libre-duration-pass-name">{pkg.name}</span>
                                            <div className="libre-duration-days">{pkg.daysNum} días</div>
                                            <div className="libre-duration-nights">{pkg.nightsNum} noches</div>
                                            <div className="libre-duration-price">{pkg.price}</div>
                                            <span className="libre-duration-per">MXN / persona</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Paso 2: Selecciona Fecha de Inicio y Pasajeros */}
                            <div style={{ marginBottom: 24 }}>
                                <div className="step3-section-title">📅 2. Selecciona Fecha de Inicio y Pasajeros</div>
                                <TripSelectorBar selectorData={selectorData} onChange={setSelectorData} selectedDays={currentDays} selectedNights={currentNights} />
                            </div>

                            {/* Dynamic Calculated Summary Banner */}
                            <div style={{ marginBottom: 40 }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                                    color: '#fff',
                                    padding: '24px 28px',
                                    borderRadius: '20px',
                                    boxShadow: '0 10px 25px rgba(225, 29, 72, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '16px'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>
                                            ✨ {activePkg.name} ({activePkg.days})
                                        </span>
                                        <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: '#fff' }}>
                                            🗓️ Fechas: {selectorData.startDate || 'Sin seleccionar'} al {selectorData.endDate || '...'}
                                        </h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', opacity: 0.95 }}>
                                            Duración: <strong>{currentDays} días / {currentNights} noches</strong> · <strong>{freeExpLimit} tours gratis incluidos</strong> (hasta {currentTourLimit} tours seleccionables)
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Tarifa base</span>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                                            {activePkg.price}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>MXN / persona</span>
                                    </div>
                                </div>
                            </div>

                            {/* Wix CMS Recommended Experiences */}
                            <RecommendedExperiencesCMS
                                addedExperiences={selectedExps.map(e => e.id)}
                                onToggleExperience={(tourId, tourTitle, tourPriceNum) => {
                                    toggleExperience({ id: tourId, title: tourTitle, priceNum: tourPriceNum })
                                }}
                                seasonName={`${season.name} (${activePkg.name})`}
                                tourLimit={currentTourLimit}
                            />

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
                            selectedPkg={{ name: activePkg.name, days: activePkg.days, priceNum: basePrice }}
                            includedExps={includedExpsList}
                            addedItems={extraItems}
                            selectedComps={selectedComps}
                            freeExpLimit={freeExpLimit}
                            basePrice={basePrice}
                            extraTotal={extraTotal}
                            onOpenCheckout={() => setIsCheckoutOpen(true)}
                            onRemoveTour={(tourNameOrId) => {
                                setSelectedExps(prev => prev.filter(e => e.id !== tourNameOrId && e.name !== tourNameOrId))
                            }}
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
                            Has alcanzado el límite de {currentTourLimit} tours seleccionables
                        </h3>
                        
                        <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '24px', lineHeight: '1.5' }}>
                            Tu <strong>{activePkg.name}</strong> incluye {freeExpLimit} tours gratis y permite hasta {currentTourLimit} tours en total. ¿Deseas ampliar tus días en Japón para agregar más tours a tu viaje? Puedes seleccionar un paquete con mayor duración arriba.
                        </p>

                        <button
                            type="button"
                            className="btn btn-outline"
                            style={{ width: '100%', borderRadius: '100px', fontSize: '0.9rem', color: '#666', borderColor: '#ccc', padding: '12px' }}
                            onClick={() => setShowUpgradeModal(false)}
                        >
                            Entendido, conservar itinerario actual
                        </button>
                    </div>
                </div>
            )}

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={season}
                estilo="Esencial"
                totalPrice={totalPrice}
                desglose={
                    `Pase: ${activePkg.name} (${activePkg.days}). ` +
                    `Pasajeros: ${adults} Adultos, ${children} Menores. ` +
                    `Fechas: ${selectorData.dateMode === 'month' ? selectorData.selectedMonth : `${selectorData.startDate} a ${selectorData.endDate}`}. ` +
                    `Incluidas (${freeExpLimit} gratis): ${includedExpsList.join(', ') || 'Ninguna'}. ` +
                    (extraItems.length ? `Adicionales: ${extraItems.map(e => e.name).join(', ')} (+${formatPrice(extraTotal)} MXN). ` : '') +
                    `Extras: ${selectedComps.join(', ') || 'Ninguno'}.`
                }
            />
        </>
    )
}
