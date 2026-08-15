import { useState, useMemo, useEffect } from 'react'
import {
    PRECIOS,
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
 * StepLibre — Step 3 for "Libre" experience.
 * Features:
 * 1. Pass Selection (Pase Express, Pase Clásico, Pase Explorador, Pase Grand Tour)
 * 2. Date Selector (after pass selection, auto-calculates nights from start date)
 * 3. Calculation Banner & Floating Ticket
 */
export default function StepLibre({ season, temporadaKey }) {
    const { tripSearch: selectorData, updateTripSearch: setSelectorData } = useTripSearch()
    const [selectedDuration, setSelectedDuration] = useState(0)
    const [addedExperiences, setAddedExperiences] = useState([])
    const [selectedComps, setSelectedComps] = useState([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [cmsPackages, setCmsPackages] = useState([])

    const passNames = ['Pase Express', 'Pase Clásico', 'Pase Explorador', 'Pase Gran Tour']
    const passBadges = ['', 'Más Popular 🌟', '', 'Recomendado 🔥']
    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    useEffect(() => {
        let isMounted = true
        async function loadCmsPrices() {
            const allPrices = await fetchPreciosCategoriasDias()
            const filtered = allPrices.filter(p =>
                p.categoria.toLowerCase().includes('libre') &&
                (p.temporada.toLowerCase() === (season?.name || '').toLowerCase() || p.temporada.toLowerCase() === temporadaKey.toLowerCase())
            )
            if (isMounted && filtered.length > 0) {
                setCmsPackages(filtered.map(p => ({
                    days: p.diasYNochesCompletos || `${p.dias} ${p.noches}`,
                    price: p.precioText,
                    priceNum: p.precioNum,
                    name: p.tituloComercial,
                    limiteDeTours: p.limiteDeTours || 6
                })))
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

    const hero = EXP_HEROES.libre
    const staticPricing = PRECIOS[temporadaKey]?.libre
    const packages = cmsPackages.length > 0 ? cmsPackages : (staticPricing?.packages || [])
    const pkgFromList = packages[selectedDuration] || packages[0] || { days: '8 días 6 noches', priceNum: 24790 }
    
    const currentTourLimit = pkgFromList.limiteDeTours || (selectedDuration === 0 ? 6 : selectedDuration === 1 ? 8 : selectedDuration === 2 ? 10 : 12)

    // Auto-trim experiences if switching to a pass with a lower limit
    useEffect(() => {
        if (addedExperiences.length > currentTourLimit) {
            setAddedExperiences(prev => prev.slice(0, currentTourLimit))
        }
    }, [currentTourLimit])

    const toggleExperience = (tourObj) => {
        const exists = addedExperiences.some(item => item.id === tourObj.id)
        if (exists) {
            setAddedExperiences(prev => prev.filter(item => item.id !== tourObj.id))
        } else {
            if (addedExperiences.length >= currentTourLimit) {
                setPendingTour({ id: tourObj.id, name: tourObj.title || tourObj.name, price: tourObj.priceNum || tourObj.price || 0 })
                setShowUpgradeModal(true)
                return
            }
            setAddedExperiences(prev => [...prev, { id: tourObj.id, name: tourObj.title || tourObj.name, price: tourObj.priceNum || tourObj.price || 0 }])
        }
    }

    // Helper to parse days and nights count from package string (e.g. "8 días 6 noches" -> 8 days, 6 nights)
    const getDaysCountFromPkg = (pkg, index) => {
        if (pkg && pkg.days) {
            const match = pkg.days.match(/(\d+)\s*días/i)
            if (match) return parseInt(match[1], 10)
        }
        const fallbackDays = [8, 10, 12, 14]
        return fallbackDays[index] || 8
    }

    const currentDays = getDaysCountFromPkg(pkgFromList, selectedDuration)
    const currentNights = currentDays - 2

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

    const selectedPkg = {
        name: passNames[selectedDuration] || 'Pase Elegido',
        days: pkgFromList.days,
        priceNum: pkgFromList.priceNum,
        price: pkgFromList.price || formatPrice(pkgFromList.priceNum)
    }
    const basePrice = selectedPkg.priceNum || 24790

    const addedItems = addedExperiences
    const extrasTotal = addedItems.reduce((sum, e) => sum + (e.price || 0), 0)

    const adults = selectorData.adults || 2
    const children = selectorData.children || 0
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

            {/* Main Content Layout */}
            <section className="step3-section">
                <div className="container">
                    <div className="libre-layout">
                        {/* Left column */}
                        <div>
                            {/* Paso 1: Elige tu Pase de Viaje */}
                            <div style={{ marginBottom: 32 }}>
                                <div className="step3-section-title">🎋 1. Elige tu Pase de Viaje</div>
                                <div className="libre-duration-grid">
                                    {packages.slice(0, 4).map((pkg, i) => (
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

                            {/* Paso 2: Selecciona Fecha de Inicio y Pasajeros */}
                            <div style={{ marginBottom: 24 }}>
                                <div className="step3-section-title">📅 2. Selecciona Fecha de Inicio y Pasajeros</div>
                                <TripSelectorBar selectorData={selectorData} onChange={setSelectorData} selectedDays={currentDays} selectedNights={currentNights} />
                            </div>

                            {/* Dynamic Calculated Summary Banner */}
                            <div style={{ marginBottom: 40 }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#fff',
                                    padding: '24px 28px',
                                    borderRadius: '20px',
                                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '16px'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>
                                            ✨ {passNames[selectedDuration]} ({pkgFromList.days})
                                        </span>
                                        <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: '#fff' }}>
                                            🗓️ Fechas: {selectorData.startDate || 'Sin seleccionar'} al {selectorData.endDate || '...'}
                                        </h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', opacity: 0.95 }}>
                                            Duración: <strong>{currentDays} días / {currentNights} noches</strong> (calculadas automáticamente desde la fecha de inicio)
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Tarifa base</span>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                                            {selectedPkg.price}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>MXN / persona</span>
                                    </div>
                                </div>
                            </div>

                            {/* Wix CMS Recommended Experiences */}
                            <RecommendedExperiencesCMS
                                addedExperiences={addedExperiences.map(e => e.id)}
                                onToggleExperience={(tourId, tourTitle, tourPriceNum) => {
                                    toggleExperience({ id: tourId, title: tourTitle, priceNum: tourPriceNum })
                                }}
                                seasonName={season.name}
                                tourLimit={currentTourLimit}
                            />

                            {/* Complementos */}
                            <div>
                                <div className="step3-section-title">✨ COMPLETA TU EXPERIENCIA (OPCIONALES)</div>
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
                                                <h4 className="jtb-extra-title">{item.title.toUpperCase()}</h4>
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
            
            {/* Upgrade Pass Modal when Tour Limit is Reached */}
            {showUpgradeModal && (
                <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 99999 }}>
                    <div className="jtb-modal-card" style={{ maxWidth: '620px', textAlign: 'center', padding: '36px 28px' }}>
                        <button className="jtb-modal-close" onClick={() => setShowUpgradeModal(false)}>&times;</button>
                        
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌸</div>
                        
                        <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)', marginBottom: '10px', lineHeight: 1.3 }}>
                            Has alcanzado el límite de {currentTourLimit} tours para tu {passNames[selectedDuration] || 'Pase'}
                        </h3>
                        
                        <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '24px', lineHeight: '1.5' }}>
                            ¿Deseas ampliar tus días en Japón para agregar más tours a tu viaje? Puedes seleccionar un paquete con mayor duración:
                        </p>

                        {selectedDuration < 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                {packages.map((pkg, i) => {
                                    if (i <= selectedDuration) return null // Only show higher packages
                                    const limitVal = pkg.limiteDeTours || (i === 1 ? 8 : i === 2 ? 10 : 12)
                                    return (
                                        <div
                                            key={i}
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
                                                flexWrap: 'wrap',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '800', color: 'var(--color-dark)', fontSize: '1.05rem' }}>
                                                    {passNames[i]} ({pkg.days})
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#2b8a3e', fontWeight: '700', marginTop: '3px' }}>
                                                    ✨ +{(i - selectedDuration) * 2} tours adicionales (Hasta {limitVal} tours) · {pkg.price} MXN
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: '800', borderRadius: '100px' }}
                                                onClick={() => {
                                                    setSelectedDuration(i)
                                                    setShowUpgradeModal(false)
                                                    if (pendingTour) {
                                                        setAddedExperiences(prev => [...prev, pendingTour])
                                                        setPendingTour(null)
                                                    }
                                                }}
                                            >
                                                Ampliar a este pase 🚀
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <button
                            type="button"
                            className="btn btn-outline"
                            style={{ width: '100%', borderRadius: '100px', fontSize: '0.9rem', color: '#666', borderColor: '#ccc', padding: '12px' }}
                            onClick={() => setShowUpgradeModal(false)}
                        >
                            Entendido, conservar {passNames[selectedDuration]}
                        </button>
                    </div>
                </div>
            )}

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
