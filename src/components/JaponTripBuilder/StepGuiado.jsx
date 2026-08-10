import { useState, useEffect } from 'react'
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
 * StepGuiado — Step 3 for "Esencial" (Guiado) experience.
 * Features: TripSelectorBar (Dates & Passengers), selector for 6 or 9 included experiences, FloatingTicket, Wix CMS experiences.
 */
export default function StepGuiado({ season, temporadaKey }) {
    const { tripSearch: selectorData, updateTripSearch: setSelectorData } = useTripSearch()
    const [selectedExps, setSelectedExps] = useState([])
    const [selectedComps, setSelectedComps] = useState([])
    const [freeExpLimit, setFreeExpLimit] = useState(6) // 6 u 8 incluidas desde CMS
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
                const mapped = filtered.map(p => ({
                    days: p.diasYNochesCompletos || `${p.dias} ${p.noches}`,
                    price: p.precioText,
                    priceNum: p.precioNum,
                    name: p.tituloComercial,
                    freeTours: p.tourGratisQueIncluira || 6,
                    limiteDeTours: p.limiteDeTours || (p.tourGratisQueIncluira ? p.tourGratisQueIncluira + 2 : 8)
                }))
                setCmsPackages(mapped)
                if (mapped[0]?.freeTours) {
                    setFreeExpLimit(mapped[0].freeTours)
                }
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

    const currentTourLimit = selectedPkg?.limiteDeTours || (freeExpLimit + 2)

    const toggleExperience = (tourObj) => {
        setSelectedExps(prev => {
            const exists = prev.some(item => item.id === tourObj.id)
            if (exists) {
                return prev.filter(item => item.id !== tourObj.id)
            } else {
                if (prev.length >= currentTourLimit) {
                    alert(`Has alcanzado el límite de ${currentTourLimit} tours seleccionables.`)
                    return prev
                }
                return [...prev, { id: tourObj.id, name: tourObj.title || tourObj.name, price: tourObj.priceNum || tourObj.price || 0 }]
            }
        })
    }

    const hero = EXP_HEROES.guiado
    const staticPricing = PRECIOS[temporadaKey]?.libre
    const packages = cmsPackages.length > 0 ? cmsPackages : (staticPricing?.packages || [])
    const selectedPkg = packages[1] || packages[0] || { days: '10 días 8 noches', priceNum: 47890 }
    const basePrice = selectedPkg?.priceNum || 47890

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    const includedExpsList = selectedExps.slice(0, freeExpLimit).map(e => e.name)
    const extraItems = selectedExps.slice(freeExpLimit)
    const extraTotal = extraItems.reduce((sum, item) => sum + (item.price || 0), 0)

    const adults = selectorData.adults
    const children = selectorData.children
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

                            {/* Wix CMS Recommended Experiences */}
                            <RecommendedExperiencesCMS
                                addedExperiences={selectedExps.map(e => e.id)}
                                onToggleExperience={(tourId, tourTitle, tourPriceNum) => {
                                    toggleExperience({ id: tourId, title: tourTitle, priceNum: tourPriceNum })
                                }}
                                seasonName={season.name}
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
                            selectedPkg={selectedPkg}
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
                estilo="Esencial"
                totalPrice={totalPrice}
                desglose={
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
