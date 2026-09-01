import { useState, useEffect, useMemo } from 'react'
import {
    ITINERARIO_ACOMPANADO,
    ITINERARIO_ACOMPANADO_MOMIJI,
    ITINERARIO_ACOMPANADO_SAKURA,
    ACOMPANADO_TODO_INCLUIDO,
    ACOMPANADO_TODO_INCLUIDO_MOMIJI,
    COMPLEMENTOS,
    EXP_HEROES,
} from '../../data/japonData'
import './StepStyles.css'
import CheckoutModal from './CheckoutModal'
import TripSelectorBar from './TripSelectorBar'
import FloatingTicket from './FloatingTicket'
import { fetchPreciosCategoriasDias, fetchTourIndividuales, fetchItinerariosCompletos } from '../../lib/wixClient'

import { useTripSearch } from '../../context/TripContext'

/**
 * StepAcompanado — Step 3 for "Completo" (Acompañado) experience.
 * Features:
 * - 2 Pass Options: PASE EXPLORADOR (12 días / 1 extra tour) & PASE GRAND TOUR (14 días / 2 extra tours)
 * - Dynamic Day-by-Day itinerary loaded from Wix CMS "Itinerariosdecompletos"
 * - Free Day in Tokyo Pop-up / Experience selector ONLY on the free day in Tokyo
 * - Matching Optional Add-ons (Complementos) with Esencial
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
    const [cmsItinerarios, setCmsItinerarios] = useState([])
    const [isTokyoModalOpen, setIsTokyoModalOpen] = useState(false)
    const [allTours, setAllTours] = useState([])

    // Load CMS prices and dynamic dates
    useEffect(() => {
        let isMounted = true
        async function loadCmsPrices() {
            try {
                const allPrices = await fetchPreciosCategoriasDias()
                const sName = (season?.name || '').toLowerCase()
                const tKey = (temporadaKey || '').toLowerCase()

                const isMatchingSeason = (t) => {
                    const temp = String(t || '').toLowerCase()
                    return temp === sName || temp === tKey ||
                        (tKey === 'akari' && (temp === 'verano' || temp === 'akari')) ||
                        (tKey === 'verano' && (temp === 'verano' || temp === 'akari')) ||
                        (tKey === 'kamakura' && (temp === 'momiji' || temp === 'kamakura' || temp === 'koyo' || temp === 'otono')) ||
                        (tKey === 'momiji' && (temp === 'momiji' || temp === 'kamakura' || temp === 'koyo' || temp === 'otono'))
                }

                const filtered = (allPrices || []).filter(p => {
                    const cat = String(p.categoria || '').toLowerCase()
                    const isCat = cat.includes('completo') || cat.includes('acompañado') || cat.includes('acompanado')
                    return isCat && isMatchingSeason(p.temporada)
                })

                if (isMounted && filtered.length > 0) {
                    const mapped = filtered.map(p => {
                        const titleCom = String(p.tituloComercial || '')
                        const isGrandTour = titleCom.toUpperCase().includes('GRAND') || String(p.dias || '').includes('14')
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
                    // Sort so Explorador (12d) comes first, then Grand Tour (14d)
                    mapped.sort((a, b) => a.daysNum - b.daysNum)
                    setCmsPackages(mapped)

                    if (mapped[0]?.fechasDeInicio && mapped[0]?.fechaEntre) {
                        setCmsDatesText(`${mapped[0].fechasDeInicio} al ${mapped[0].fechaEntre} (Salida Grupal)`)
                    }
                }
            } catch (err) {
                console.error('[StepAcompanado] Error loading prices:', err)
            }
        }
        loadCmsPrices()
        return () => { isMounted = false }
    }, [season?.name, temporadaKey])

    // Load CMS Day-by-Day Itineraries
    useEffect(() => {
        let isMounted = true
        async function loadItineraries() {
            const data = await fetchItinerariosCompletos()
            if (isMounted && data.length > 0) {
                setCmsItinerarios(data)
            }
        }
        loadItineraries()
        return () => { isMounted = false }
    }, [])

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
    const freeExpLimit = 0

    const includedExpsList = []
    const extraItems = selectedExps
    const extraTotal = extraItems.reduce((sum, item) => sum + (item.price || 0), 0)

    // Select dynamic itinerary from CMS or fallback to local data
    const filteredItinerario = useMemo(() => {
        const seasonNameLower = (season?.name || temporadaKey || 'sakura').toLowerCase()
        const isGrandTour = selectedPassIndex === 1 || (activePass.name || '').toUpperCase().includes('GRAND') || activePass.daysNum === 14
        const targetPass = isGrandTour ? 'PASE GRAND TOUR' : 'PASE EXPLORADOR'

        if (cmsItinerarios && cmsItinerarios.length > 0) {
            const matched = cmsItinerarios.filter(it => {
                const itSeason = (it.temporada || '').toLowerCase()
                const itPass = (it.tipoDePase || '').toUpperCase().trim()

                const seasonMatch = !itSeason || itSeason.includes('sakura') || itSeason.includes(seasonNameLower) || seasonNameLower.includes(itSeason)
                const passMatch = itPass === targetPass || (isGrandTour ? itPass.includes('GRAND') : itPass.includes('EXPLORADOR'))
                return seasonMatch && passMatch
            })

            if (matched.length > 0) {
                return [...matched].sort((a, b) => a.day - b.day)
            }
        }

        // Fallback to local files
        const fullItinerario = season?.key === 'momiji' ? ITINERARIO_ACOMPANADO_MOMIJI : season?.key === 'sakura' ? ITINERARIO_ACOMPANADO_SAKURA : ITINERARIO_ACOMPANADO
        return fullItinerario.filter(item => item.day <= (isGrandTour ? 14 : 12))
    }, [cmsItinerarios, season?.name, season?.key, temporadaKey, selectedPassIndex, activePass.name, activePass.daysNum])

    const todoIncluido = season?.key === 'momiji' ? ACOMPANADO_TODO_INCLUIDO_MOMIJI : ACOMPANADO_TODO_INCLUIDO

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    const adults = selectorData.adults || 2
    const children = selectorData.children || 0
    const passengersCount = adults + children
    const pricePerPerson = basePrice + extraTotal
    const totalPrice = pricePerPerson * passengersCount

    // Filter Tokyo-only experiences for the Free Day in Tokyo Modal (strictly Tokyo, no Osaka/Universal Studios/Kyoto)
    const tokyoTours = useMemo(() => {
        return allTours.filter(t => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            // Exclude anything from other cities
            if (raw.includes('osaka') || raw.includes('universal studios') || raw.includes('usj') ||
                raw.includes('kyoto') || raw.includes('kioto') || raw.includes('hiroshima') ||
                raw.includes('takayama') || raw.includes('kanazawa') || raw.includes('nara') ||
                raw.includes('fukuoka') || raw.includes('shirakawa') || raw.includes('kobe') ||
                raw.includes('himeji') || raw.includes('naoshima') || raw.includes('uji')) {
                return false
            }
            // Must be Tokyo experiences
            return raw.includes('tokio') || raw.includes('tokyo') || raw.includes('disney') ||
                   raw.includes('harry potter') || raw.includes('sanrio') || raw.includes('fuji') ||
                   raw.includes('nikko') || raw.includes('kamakura') || raw.includes('akihabara') ||
                   raw.includes('asakusa') || raw.includes('sky tree') || raw.includes('yakatabune') ||
                   raw.includes('samurai') || raw.includes('kimono') || raw.includes('té') || raw.includes('te')
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
                                                    {pkg.daysNum === 14 ? '✨ Modalidad Extendida (14 Días)' : '🌸 Modalidad Clásica (12 Días)'}
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

                            {/* ITINERARIO DÍA POR DÍA (From CMS Itinerariosdecompletos) */}
                            <div style={{ marginBottom: '50px' }}>
                                <div className="step3-section-title">
                                    🚄 Ruta JR Line — Itinerario Completo ({activePass.name}: {activePass.days})
                                </div>
                                <div className="acomp-shinkansen-timeline">
                                    <div className="acomp-railway-track" style={{ '--rail-color': season.colors.primary }} />
                                    {filteredItinerario.map((item) => {
                                        const titleLower = (item.title || '').toLowerCase()
                                        const descLower = (item.desc || '').toLowerCase()
                                        const isReturnDay = titleLower.includes('regreso') || titleLower.includes('vuelta') || titleLower.includes('vuelo internacional') || descLower.includes('regreso a méxico') || descLower.includes('vuelo de regreso')

                                        const isTokyoFreeDay = !isReturnDay && (
                                            titleLower.includes('libre') || descLower.includes('libre') || titleLower.includes('ruta por japón')
                                        )

                                        return (
                                            <div className="acomp-station-item" key={item.day}>
                                                <div className="acomp-station-marker" style={{ backgroundColor: season.colors.primary }}>
                                                    <span className="acomp-station-number">{item.day}</span>
                                                </div>
                                                <div className="acomp-station-card" style={isTokyoFreeDay ? { border: `2px solid ${season.colors.primary}`, background: 'rgba(233,30,99,0.03)' } : {}}>
                                                    <div className="acomp-station-header">
                                                        <span className="acomp-station-icon">{item.icon}</span>
                                                        <h4 className="acomp-station-title">
                                                            {item.title.startsWith('Día') ? item.title : `Día ${item.day}: ${item.title}`}
                                                        </h4>
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
                                                                ✨ Elegir Experiencias en Tokio
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Complementos Adicionales (Opcionales) — Same as Esencial */}
                            <div style={{ marginTop: '30px' }}>
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
                            onRemoveTour={(tourNameOrId) => {
                                setSelectedExps(prev => prev.filter(e => e.id !== tourNameOrId && e.name !== tourNameOrId))
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Modal: Elegir Experiencias para Día Libre en Tokio */}
            {isTokyoModalOpen && (
                <div className="jtb-modal-overlay" style={{ zIndex: 9999999 }} onClick={() => setIsTokyoModalOpen(false)}>
                    <div className="jtb-modal-card" style={{ maxWidth: '820px', maxHeight: 'min(86vh, calc(100vh - 120px))', overflowY: 'auto', padding: '32px 28px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
                        <button className="jtb-modal-close" onClick={() => setIsTokyoModalOpen(false)}>&times;</button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '2.5rem' }}>🗼</span>
                            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', margin: '8px 0 4px', color: 'var(--color-dark)' }}>
                                Experiencias en Tokio para tu Día Libre
                            </h3>
                            <p style={{ fontSize: '0.88rem', color: '#666', margin: 0 }}>
                                Selecciona la experiencia que deseas vivir en tu día libre en Tokio. Se agregará directamente a tu Pase de Abordar:
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                            {tokyoTours.map(t => {
                                const isSelected = selectedExps.some(e => e.id === t.id)
                                return (
                                    <div
                                        key={t.id}
                                        className={`jtb-tokyo-card${isSelected ? ' jtb-tokyo-card--selected' : ''}`}
                                        onClick={() => toggleExperience({ id: t.id, name: t.title, price: t.priceNum || 0 })}
                                    >
                                        <div>
                                            <div className="jtb-tokyo-card-img-wrap">
                                                <img src={t.image} alt={t.title} loading="lazy" />
                                                <span className="jtb-tokyo-card-city">📍 Tokio</span>
                                            </div>
                                            <div className="jtb-tokyo-card-content">
                                                <h5 className="jtb-tokyo-card-title">
                                                    {t.title}
                                                </h5>
                                                {t.excerpt && (
                                                    <p className="jtb-tokyo-card-desc">
                                                        {t.excerpt}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="jtb-tokyo-card-footer">
                                            <div className="jtb-tokyo-card-price-wrap">
                                                <span className="jtb-tokyo-card-price">
                                                    {t.priceText || (t.priceNum ? `$${t.priceNum.toLocaleString('es-MX')}` : '$1,850')}
                                                </span>
                                                <span className="jtb-tokyo-card-currency">MXN</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={`jtb-tokyo-add-btn${isSelected ? ' jtb-tokyo-add-btn--selected' : ''}`}
                                            >
                                                {isSelected ? '✓ Agregado' : '+ Agregar'}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                type="button"
                                className="jtb-ticket-cta"
                                onClick={() => setIsTokyoModalOpen(false)}
                            >
                                <span>✓ Listo, Continuar con mi Itinerario →</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Pass Modal when Tour Limit is Reached */}
            {showUpgradeModal && (
                <div className="jtb-modal-overlay" style={{ zIndex: 9999999 }} onClick={() => setShowUpgradeModal(false)}>
                    <div className="jtb-modal-card" style={{ maxWidth: '620px', textAlign: 'center', padding: '36px 28px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
                        <button className="jtb-modal-close" onClick={() => setShowUpgradeModal(false)}>&times;</button>
                        
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌸</div>
                        
                        <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)', marginBottom: '10px', lineHeight: 1.3 }}>
                            Has alcanzado el límite de {currentTourLimit} experiencias para tu {activePass.name}
                        </h3>
                        
                        <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '24px', lineHeight: '1.5' }}>
                            Tu <strong>{activePass.name}</strong> te permite viajar {activePass.days} y seleccionar hasta {currentTourLimit} experiencias en total. ¿Deseas ampliar a <strong>PASE GRAND TOUR (14 días)</strong> para disfrutar de más días y opciones en Japón?
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
                    (extraItems.length ? `Experiencias extras en días libres: ${extraItems.map(e => e.name).join(', ')} (+${formatPrice(extraTotal)} MXN). ` : '') +
                    `Extras: ${selectedComps.join(', ') || 'Ninguno'}.`
                }
            />
        </>
    )
}
