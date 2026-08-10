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
                    name: p.tituloComercial
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

    const hero = EXP_HEROES.libre
    const staticPricing = PRECIOS[temporadaKey]?.libre
    const packages = cmsPackages.length > 0 ? cmsPackages : (staticPricing?.packages || [])

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

    // Helper to parse nights count from package string (e.g. "8 días 6 noches" -> 6)
    const getNightsFromPkg = (pkg, index) => {
        if (pkg && pkg.days) {
            const match = pkg.days.match(/(\d+)\s*noches/i)
            if (match) return parseInt(match[1], 10)
        }
        const fallbackNights = [6, 8, 10, 12]
        return fallbackNights[index] || 6
    }

    const pkgFromList = packages[selectedDuration] || packages[0] || { days: '8 días 6 noches', priceNum: 24790 }
    const currentNights = getNightsFromPkg(pkgFromList, selectedDuration)

    // Auto-calculate end date from start date + selected pass nights
    useEffect(() => {
        if (selectorData.startDate) {
            const [y, m, d] = selectorData.startDate.split('-').map(Number)
            if (y && m && d) {
                const dt = new Date(y, m - 1, d)
                dt.setDate(dt.getDate() + currentNights)
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
    }, [selectorData.startDate, currentNights, selectedDuration])

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
                                <TripSelectorBar selectorData={selectorData} onChange={setSelectorData} selectedNights={currentNights} />
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
                                            Duración: <strong>{currentNights} noches</strong> (calculadas automáticamente desde la fecha de inicio)
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
