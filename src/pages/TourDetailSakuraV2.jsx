import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ItineraryMap from '../components/ItineraryMap'
import TripSelectorBar from '../components/JaponTripBuilder/TripSelectorBar'
import FloatingTicket from '../components/JaponTripBuilder/FloatingTicket'
import CheckoutModal from '../components/JaponTripBuilder/CheckoutModal'
import DownloadItineraryModal from '../components/DownloadItineraryModal/DownloadItineraryModal'
import {
    TEMPORADAS,
    ITINERARIO_ACOMPANADO_SAKURA,
    ACOMPANADO_TODO_INCLUIDO,
    COMPLEMENTOS,
} from '../data/japonData'
import TOURS from '../data/tourData'
import { fetchPreciosCategoriasDias, fetchTourIndividuales, fetchItinerariosCompletos } from '../lib/wixClient'
import { useTripSearch } from '../context/TripContext'

import '../components/JaponTripBuilder/StepStyles.css'
import '../components/JaponTripBuilder/JaponTripBuilder.css'
import './pages.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.215l-.304-.182-2.87.852.852-2.87-.182-.304A8 8 0 1112 20z" />
        </svg>
    )
}

export default function TourDetailSakuraV2() {
    const tour = TOURS['sakura-2027']
    const season = TEMPORADAS.sakura
    const { tripSearch: selectorData, updateTripSearch: setSelectorData } = useTripSearch()

    // Page interaction states
    const [lightbox, setLightbox] = useState(null)
    const [openFaq, setOpenFaq] = useState(null)
    const [showBar, setShowBar] = useState(false)
    const [activeCity, setActiveCity] = useState(0)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

    // Functional Itinerary & Pass states
    const [selectedPassIndex, setSelectedPassIndex] = useState(0) // 0: Explorador, 1: Grand Tour
    const [selectedExps, setSelectedExps] = useState([])
    const [selectedComps, setSelectedComps] = useState([])
    const [cmsPackages, setCmsPackages] = useState([])
    const [cmsDatesText, setCmsDatesText] = useState('22 Marzo — 2 Abril 2027 (Salida Grupal)')
    const [cmsItinerarios, setCmsItinerarios] = useState([])
    const [isTokyoModalOpen, setIsTokyoModalOpen] = useState(false)
    const [allTours, setAllTours] = useState([])
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [pendingTour, setPendingTour] = useState(null)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        const onScroll = () => setShowBar(window.scrollY > 500)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Load CMS prices and dynamic dates
    useEffect(() => {
        let isMounted = true
        async function loadCmsPrices() {
            try {
                const allPrices = await fetchPreciosCategoriasDias()
                const filtered = (allPrices || []).filter(p => {
                    const cat = String(p.categoria || '').toLowerCase()
                    const isCat = cat.includes('completo') || cat.includes('acompañado') || cat.includes('acompanado')
                    const temp = String(p.temporada || '').toLowerCase()
                    return isCat && (temp.includes('sakura') || temp.includes('primavera'))
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
                    mapped.sort((a, b) => a.daysNum - b.daysNum)
                    setCmsPackages(mapped)

                    if (mapped[0]?.fechasDeInicio && mapped[0]?.fechaEntre) {
                        setCmsDatesText(`${mapped[0].fechasDeInicio} al ${mapped[0].fechaEntre} (Salida Grupal)`)
                    }
                }
            } catch (err) {
                console.error('[TourDetailSakuraV2] Error loading prices:', err)
            }
        }
        loadCmsPrices()
        return () => { isMounted = false }
    }, [])

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
                const freeTours = (data || []).filter(t => Boolean(t.completo))
                if (freeTours.length > 0) {
                    setSelectedExps(prev => {
                        if (prev.length === 0) {
                            return freeTours.map(t => ({
                                id: t.id,
                                name: t.title || t.name,
                                price: 0
                            }))
                        }
                        return prev
                    })
                }
            }
        }
        loadTours()
        return () => { isMounted = false }
    }, [])

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

    const toggleComp = (title) => {
        setSelectedComps(prev =>
            prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
        )
    }

    const basePrice = activePass.priceNum
    const freeExpLimit = activePass.freeTours || 1
    const includedExpsList = selectedExps.slice(0, freeExpLimit).map(e => e.name)
    const extraItems = selectedExps.slice(freeExpLimit)
    const extraTotal = extraItems.reduce((sum, item) => sum + (item.price || 0), 0)
    const passengersCount = (selectorData.adults || 1) + (selectorData.children || 0)
    const totalPrice = (basePrice * passengersCount) + (extraTotal * passengersCount)

    // Dynamic itinerary filtered by pass
    const filteredItinerario = useMemo(() => {
        const isGrandTour = selectedPassIndex === 1 || (activePass.name || '').toUpperCase().includes('GRAND') || activePass.daysNum === 14
        const targetPass = isGrandTour ? 'PASE GRAND TOUR' : 'PASE EXPLORADOR'

        if (cmsItinerarios && cmsItinerarios.length > 0) {
            const matched = cmsItinerarios.filter(it => {
                const itSeason = (it.temporada || '').toLowerCase()
                const itPass = (it.tipoDePase || '').toUpperCase().trim()
                const seasonMatch = !itSeason || itSeason.includes('sakura') || itSeason.includes('primavera')
                const passMatch = itPass === targetPass || (isGrandTour ? itPass.includes('GRAND') : itPass.includes('EXPLORADOR'))
                return seasonMatch && passMatch
            })

            if (matched.length > 0) {
                return [...matched].sort((a, b) => a.day - b.day)
            }
        }
        return ITINERARIO_ACOMPANADO_SAKURA.filter(item => item.day <= (isGrandTour ? 14 : 12))
    }, [cmsItinerarios, selectedPassIndex, activePass.name, activePass.daysNum])

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    // Tokyo tours for Tokyo Day modal
    const tokyoTours = useMemo(() => {
        return allTours.filter(t => {
            const raw = `${t.city || ''} ${t.title || ''}`.toLowerCase()
            if (raw.includes('osaka') || raw.includes('universal studios') || raw.includes('usj') ||
                raw.includes('kyoto') || raw.includes('kioto') || raw.includes('hiroshima') ||
                raw.includes('nara') || raw.includes('kobe')) {
                return false
            }
            return raw.includes('tokio') || raw.includes('tokyo') || raw.includes('disney') ||
                   raw.includes('harry potter') || raw.includes('sanrio') || raw.includes('fuji') ||
                   raw.includes('nikko') || raw.includes('kamakura') || raw.includes('akihabara') ||
                   raw.includes('asakusa') || raw.includes('sky tree')
        })
    }, [allTours])

    const galleryItems = Array.isArray(tour.gallery) && tour.gallery.length > 0
        ? [...tour.gallery]
        : [{ img: tour.heroImage, caption: tour.title }]

    // WhatsApp reservation link
    const waText = `¡Hola! Me gustaría reservar o pedir información sobre Sakura 2027 (${activePass.name} - ${activePass.days}). Fechas: ${cmsDatesText.replace(' (Salida Grupal)', '')}. Pasajeros: ${passengersCount} (${selectorData.adults || 1} adultos, ${selectorData.children || 0} niños).`
    const waLink = `${WHATSAPP_BASE}${encodeURIComponent(waText)}`

    return (
        <div className="td-v2-container" style={{ '--jtb-primary': '#e91e63' }}>
            <Helmet>
                <title>{tour.seoTitle} | RutaXAsia</title>
                <meta name="description" content={tour.seoDescription} />
            </Helmet>

            {/* ===== 1. CINEMATIC HERO ===== */}
            <section className="td-hero">
                <img src={tour.heroImage} alt={tour.title} className="td-hero-img" />
                <div className="td-hero-vignette" />
                <div className="td-hero-inner container">
                    <nav className="td-crumb">
                        <Link to="/">Inicio</Link><span>/</span>
                        <Link to="/viajes/japon">Viajes Japón</Link><span>/</span>
                        <span>{tour.title}</span>
                    </nav>
                    {tour.badge && <span className="td-pill">{tour.badge}</span>}
                    <h1 className="td-hero-h1">{tour.title}</h1>
                    <p className="td-hero-sub">{tour.tagline}</p>
                    <div className="td-hero-chips">
                        {tour.flagIcons.map((f, i) => (
                            <img key={i} src={`https://flagcdn.com/w40/${f.code}.png`} alt={f.name} className="td-chip-flag" />
                        ))}
                        <span className="td-chip">📅 {tour.date}</span>
                        <span className="td-chip">⏱ {activePass.days}</span>
                        <span className="td-chip">🏙️ {tour.cities}</span>
                    </div>
                    <div className="td-hero-cta-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                        <button
                            type="button"
                            className="td-hero-btn"
                            onClick={() => setIsTicketModalOpen(true)}
                            style={{ border: 'none', cursor: 'pointer' }}
                        >
                            Reservar mi Lugar
                        </button>
                        <button
                            type="button"
                            className="td-hero-btn td-hero-btn--pdf"
                            style={{ background: 'rgba(255, 255, 255, 0.95)', color: '#111', border: '1px solid rgba(0,0,0,0.15)', fontWeight: '750', cursor: 'pointer' }}
                            onClick={() => setIsPdfModalOpen(true)}
                        >
                            📄 Descargar Itinerario PDF
                        </button>
                        <span className="td-price-alt">{formatPrice(basePrice)} MXN</span>
                    </div>
                    {tour.priceSubtext && (
                        <div className="td-hero-pricing-details">
                            <span className="td-pricing-tag">{tour.priceSubtext}</span>
                            <span className="td-pricing-tag">Anticipo $5,000 MXN + Plan de Cuotas</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ===== 2. BENTO GALLERY ===== */}
            <section className="td-gallery container">
                <div className="td-bento">
                    {galleryItems.slice(0, 5).map((g, i) => (
                        <div key={i} className={`td-bento-cell ${i === 0 ? 'td-bento-big' : ''}`} onClick={() => setLightbox(i)}>
                            <img src={g.img} alt={g.caption} />
                            <span className="td-bento-cap">{g.caption}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* LIGHTBOX */}
            {lightbox !== null && (
                <div className="td-lb" onClick={() => setLightbox(null)}>
                    <button className="td-lb-close" onClick={() => setLightbox(null)}>✕</button>
                    <button className="td-lb-nav td-lb-prev" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + galleryItems.length) % galleryItems.length) }}>‹</button>
                    <div className="td-lb-wrap" onClick={e => e.stopPropagation()}>
                        <img src={galleryItems[lightbox]?.img || tour.heroImage} alt="" />
                        <p className="td-lb-cap">{galleryItems[lightbox]?.caption}</p>
                    </div>
                    <button className="td-lb-nav td-lb-next" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % galleryItems.length) }}>›</button>
                    <span className="td-lb-count">{lightbox + 1} / {galleryItems.length}</span>
                </div>
            )}

            {/* ===== 3. EDITORIAL & MAPA ===== */}
            <div className="container td-centered-content" style={{ maxWidth: '960px', margin: '40px auto 30px' }}>
                <section className="td-editorial" style={{ paddingTop: 0, paddingBottom: '30px' }}>
                    <h2 className="td-section-label">Sobre este viaje</h2>
                    <p className="td-editorial-text">{tour.tagline} Un viaje con guía hispanohablante todo el recorrido, tren bala Shinkansen, hospedaje de primera, traslados y experiencias tradicionales incluidas.</p>
                    {tour.hospedaje && (
                        <div className="td-hospedaje">
                            <span className="td-hospedaje-icon">🏨</span>
                            <span className="td-hospedaje-text"><strong>Hospedaje:</strong> {tour.hospedaje}</span>
                        </div>
                    )}
                </section>

                <section className="td-tabs-section" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <h2 className="td-section-label">Ruta & Mapa de Ciudades</h2>
                    <p className="td-tabs-subtitle">Haz clic en cada ciudad del mapa para explorar el recorrido</p>
                    <ItineraryMap
                        chapters={tour.chapters}
                        activeCity={activeCity}
                        onCityClick={setActiveCity}
                    />
                </section>
            </div>

            {/* ===== 4. ITINERARIO FUNCIONAL DE SAKURA COMPLETO (ANCHO COMPLETO Y NORMAL) ===== */}
            <section className="step3-section" style={{ background: '#fdfbf7', padding: '60px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
                    {/* Checklist Todo Incluido Banner */}
                    <div style={{ marginBottom: '40px' }}>
                        <div className="step3-section-title">✅ Todo Incluido — Tu Pase de Viaje Grupal Sakura 2027</div>
                        <div className="acomp-todo-checklist-board">
                            {ACOMPANADO_TODO_INCLUIDO.map((item, i) => (
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

                    {/* Selector de Fechas Bloqueadas (Salida Grupal) y Pasajeros */}
                    <TripSelectorBar
                        selectorData={selectorData}
                        onChange={setSelectorData}
                        selectedDays={activePass.daysNum || 12}
                        selectedNights={(activePass.daysNum || 12) - 2}
                        isFixedDates={true}
                        fixedDatesText={cmsDatesText}
                    />

                    {/* Selector de Pases (Explorador 12d vs Grand Tour 14d) */}
                    <div style={{ margin: '40px 0 30px' }}>
                        <div className="step3-section-title">🎋 Elige la modalidad de tu Viaje Sakura Completo</div>
                        <div className="libre-duration-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {packages.map((pkg, i) => {
                                const isSelected = selectedPassIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`libre-duration-card${isSelected ? ' libre-duration-card--selected' : ''}`}
                                        onClick={() => setSelectedPassIndex(i)}
                                        style={{ padding: '30px 20px 24px', cursor: 'pointer' }}
                                    >
                                        <span
                                            className="libre-duration-card-badge"
                                            style={{
                                                backgroundColor: '#e91e63',
                                                color: '#ffffff',
                                                boxShadow: '0 4px 14px rgba(233, 30, 99, 0.4)',
                                                border: 'none',
                                            }}
                                        >
                                            {pkg.freeTours === 1 ? '🎁 Incluye 1 Experiencia Extra Gratis' : '🎁 Incluye 2 Experiencias Extras Gratis'}
                                        </span>
                                        <div className="libre-duration-check">{isSelected ? '✓' : ''}</div>
                                        <span className="libre-duration-pass-name" style={{ fontSize: '1.25rem', color: '#e91e63' }}>{pkg.name}</span>
                                        <div className="libre-duration-days">{pkg.days.split(' ')[0]} días</div>
                                        <div className="libre-duration-nights">{pkg.days.split(' ').slice(1).join(' ')}</div>
                                        <div className="libre-duration-price">{pkg.priceText || formatPrice(pkg.priceNum)}</div>
                                        <span className="libre-duration-per">MXN / persona</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Itinerario Shinkansen Día por Día */}
                    <div style={{ marginBottom: '50px' }}>
                        <div className="step3-section-title">
                            🚄 Ruta JR Line — Itinerario Completo ({activePass.name}: {activePass.days})
                        </div>
                        <div className="acomp-shinkansen-timeline">
                            <div className="acomp-railway-track" style={{ '--rail-color': '#e91e63' }} />
                            {filteredItinerario.map((item) => {
                                const titleLower = (item.title || '').toLowerCase()
                                const descLower = (item.desc || '').toLowerCase()
                                const isReturnDay = titleLower.includes('regreso') || titleLower.includes('vuelta') || descLower.includes('regreso')
                                const isTokyoFreeDay = !isReturnDay && (titleLower.includes('libre') || descLower.includes('libre'))

                                return (
                                    <div className="acomp-station-item" key={item.day}>
                                        <div className="acomp-station-marker" style={{ backgroundColor: '#e91e63' }}>
                                            <span className="acomp-station-number">{item.day}</span>
                                        </div>
                                        <div className="acomp-station-card" style={isTokyoFreeDay ? { border: '2px solid #e91e63', background: 'rgba(233,30,99,0.03)' } : {}}>
                                            <div className="acomp-station-header">
                                                <span className="acomp-station-icon">{item.icon}</span>
                                                <h4 className="acomp-station-title">
                                                    {item.title.startsWith('Día') ? item.title : `Día ${item.day}: ${item.title}`}
                                                </h4>
                                            </div>
                                            <p className="acomp-station-desc">{item.desc}</p>
                                            
                                            {isTokyoFreeDay && (
                                                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed rgba(233,30,99,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: '750', color: '#e91e63' }}>
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

                    {/* Complementos Adicionales (Opcionales) */}
                    <div style={{ marginTop: '40px', marginBottom: '40px' }}>
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

                    {/* Action Card at bottom of itinerary */}
                    <div style={{ textAlign: 'center', background: '#ffffff', borderRadius: '24px', padding: '32px 24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginTop: '40px' }}>
                        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)', margin: '0 0 8px' }}>
                            {activePass.name} ({activePass.days}) · {cmsDatesText.replace(' (Salida Grupal)', '')}
                        </h3>
                        <p style={{ fontSize: '0.92rem', color: '#666', margin: '0 0 20px' }}>
                            Aparta hoy mismo con $5,000 MXN de anticipo por pasajero y asegura tu lugar en grupo con guía hispanohablante.
                        </p>
                        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '100px', fontWeight: '800', cursor: 'pointer' }}
                                onClick={() => setIsTicketModalOpen(true)}
                            >
                                🎟️ Ver Desglose y Reservar ({formatPrice(totalPrice)} MXN)
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: '100px', fontWeight: '750', cursor: 'pointer' }}
                                onClick={() => setIsPdfModalOpen(true)}
                            >
                                📄 Descargar Itinerario PDF
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 5. PREGUNTAS FRECUENTES ===== */}
            <div className="container td-centered-content" style={{ maxWidth: '960px', margin: '50px auto 60px' }}>
                <section className="td-faq-section" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <h2 className="td-section-label">Preguntas frecuentes</h2>
                    <div className="td-faqs">
                        {tour.faqs.map((faq, i) => (
                            <div key={i} className={`td-faq ${openFaq === i ? 'td-faq--open' : ''}`}>
                                <button className="td-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <span>{faq.q}</span>
                                    <span className="td-faq-icon">{openFaq === i ? '−' : '+'}</span>
                                </button>
                                {openFaq === i && <div className="td-faq-a"><p>{faq.a}</p></div>}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ===== 6. BOTTOM CTA ===== */}
            <section className="td-bottom-cta">
                <img src={tour.heroImage} alt="" className="td-bottom-bg" />
                <div className="td-bottom-overlay" />
                <div className="td-bottom-inner container">
                    <h2 className="td-bottom-h2">¿Listo para vivir Sakura 2027?</h2>
                    <p className="td-bottom-p">Aparta tu lugar con anticipo de $5,000 MXN y asegura tu lugar en la temporada más hermosa de Japón.</p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                        <button
                            type="button"
                            className="td-bottom-btn td-bottom-btn--reserve"
                            style={{ border: 'none', cursor: 'pointer' }}
                            onClick={() => setIsTicketModalOpen(true)}
                        >
                            Reservar mi Lugar
                        </button>
                        <button
                            type="button"
                            className="td-bottom-btn"
                            style={{ background: '#ffffff', color: '#111111', cursor: 'pointer' }}
                            onClick={() => setIsPdfModalOpen(true)}
                        >
                            📄 Descargar Itinerario en PDF
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== FLOATING BAR ===== */}
            <div className={`td-float ${showBar ? 'td-float--show' : ''}`}>
                <div className="td-float-inner container">
                    <div className="td-float-left">
                        <strong>Sakura 2027 — Viaje Completo</strong>
                        <span>{tour.date} · {activePass.days}</span>
                    </div>
                    <div className="td-float-right" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button
                            type="button"
                            className="btn btn-outline td-float-pdf-btn"
                            style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: '100px', background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                            onClick={() => setIsPdfModalOpen(true)}
                        >
                            📄 Itinerario PDF
                        </button>
                        <span className="td-float-price">{formatPrice(basePrice + extraTotal)} MXN</span>
                        <button
                            type="button"
                            className="td-float-btn"
                            style={{ border: 'none', cursor: 'pointer' }}
                            onClick={() => setIsTicketModalOpen(true)}
                        >
                            Reservar
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== TICKET POPUP MODAL (DESGLOSE COMPLETO AL TOCAR RESERVAR) ===== */}
            {isTicketModalOpen && (
                <div className="td-ticket-modal-backdrop" onClick={() => setIsTicketModalOpen(false)}>
                    <div className="td-ticket-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="td-ticket-modal-close"
                            onClick={() => setIsTicketModalOpen(false)}
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                        <div className="td-ticket-modal-header">
                            <span className="td-ticket-modal-tag">🎟️ Desglose de Reserva</span>
                            <h3 className="td-ticket-modal-title">Sakura 2027 — {activePass.name}</h3>
                            <p className="td-ticket-modal-sub">{cmsDatesText.replace(' (Salida Grupal)', '')} · {activePass.days}</p>
                        </div>
                        <div className="td-ticket-modal-body">
                            <FloatingTicket
                                season={{ name: 'Sakura 2027', colors: { primary: '#e91e63', bg: '#fdf2f8' } }}
                                temporadaKey="sakura"
                                estilo="Completo"
                                selectorData={selectorData}
                                tourDate={cmsDatesText.replace(' (Salida Grupal)', '')}
                                selectedPkg={{ name: activePass.name, days: activePass.days, priceNum: basePrice }}
                                includedExps={includedExpsList}
                                addedItems={extraItems}
                                selectedComps={selectedComps}
                                freeExpLimit={freeExpLimit}
                                basePath="/viajes/japon/sakura"
                                basePrice={basePrice}
                                extraTotal={extraTotal}
                                anticipoDisplay="$5,000 MXN"
                                anticipoText="Anticipo $5,000 MXN + Plan de Cuotas"
                                customReserveBtnText="Apartar Online ($5,000 MXN)"
                                onOpenCheckout={() => {
                                    setIsTicketModalOpen(false)
                                    setIsCheckoutOpen(true)
                                }}
                                onOpenDownloadPdf={() => {
                                    setIsTicketModalOpen(false)
                                    setIsPdfModalOpen(true)
                                }}
                                onRemoveTour={(tourNameOrId) => {
                                    setSelectedExps(prev => prev.filter(e => e.id !== tourNameOrId && e.name !== tourNameOrId))
                                }}
                            />
                            <div className="td-ticket-modal-wa-wrap">
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="td-ticket-wa-cta"
                                >
                                    <WhatsAppIcon /> Reservar o Consultar por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Experiencias en Tokio */}
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
                                                <h5 className="jtb-tokyo-card-title">{t.title}</h5>
                                                {t.excerpt && <p className="jtb-tokyo-card-desc">{t.excerpt}</p>}
                                            </div>
                                        </div>

                                        <div className="jtb-tokyo-card-footer">
                                            <div className="jtb-tokyo-card-price-wrap">
                                                <span className="jtb-tokyo-card-price">
                                                    {t.priceText || (t.priceNum ? `$${t.priceNum.toLocaleString('es-MX')}` : 'Incluido')}
                                                </span>
                                                {t.priceNum ? <span className="jtb-tokyo-card-currency">MXN</span> : null}
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

            {/* CHECKOUT MODAL */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={{ name: 'Sakura 2027', colors: { primary: '#e91e63' } }}
                temporadaKey="sakura"
                estilo="Completo"
                selectorData={selectorData}
                tourDate={cmsDatesText.replace(' (Salida Grupal)', '')}
                selectedPkg={{ name: activePass.name, days: activePass.days, priceNum: basePrice }}
                includedExps={includedExpsList}
                addedItems={extraItems}
                selectedComps={selectedComps}
                basePrice={basePrice}
                extraTotal={extraTotal}
            />

            {/* PDF MODAL */}
            <DownloadItineraryModal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                tourTitle={tour.title}
                tourDates={tour.date}
                tourPrice={formatPrice(basePrice) + ' MXN'}
                pdfUrl={tour.pdfUrl}
            />
        </div>
    )
}
