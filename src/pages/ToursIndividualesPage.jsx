import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchTourIndividuales } from '../lib/wixClient'
import { useTripSearch } from '../context/TripContext'
import FloatingTicket from '../components/JaponTripBuilder/FloatingTicket'
import CheckoutModal from '../components/JaponTripBuilder/CheckoutModal'
import './ToursIndividualesPage.css'

export default function ToursIndividualesPage() {
    const { tripSearch: selectorData } = useTripSearch()
    const [tours, setTours] = useState([])
    const [loading, setLoading] = useState(true)

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Todas')
    const [sortBy, setSortBy] = useState('price-asc') // 'price-asc' | 'price-desc' | 'alpha-asc' | 'alpha-desc'

    // Selected Individual Tours Cart: [{ id, name, price, date, quantity, passengerNames, assistanceType }]
    const [selectedTours, setSelectedTours] = useState([])
    // Pending date pickers for tours: { [tourId]: '2026-10-18' }
    const [tourDates, setTourDates] = useState({})

    // Multi-Step Modal state for configuring tour
    const [configuringTour, setConfiguringTour] = useState(null)
    const [modalStep, setModalStep] = useState(1) // 1: Asistencia (Locataria vs Anfitrión), 2: Fecha, Cantidad y Nombres
    const [modalAssistance, setModalAssistance] = useState('locataria') // 'locataria' | 'anfitrion'
    const [modalDate, setModalDate] = useState('')
    const [modalQuantity, setModalQuantity] = useState(1)
    const [modalNames, setModalNames] = useState([''])

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        let isMounted = true
        async function loadData() {
            setLoading(true)
            const data = await fetchTourIndividuales()
            if (isMounted) {
                setTours(data)
                setLoading(false)
            }
        }
        loadData()
        return () => { isMounted = false }
    }, [])

    // Handle date change for a tour
    const handleDateChange = (tourId, dateStr) => {
        setTourDates(prev => ({ ...prev, [tourId]: dateStr }))
        // If already added, update date in selectedTours
        setSelectedTours(prev => prev.map(item =>
            item.id === tourId ? { ...item, date: dateStr } : item
        ))
    }

    // Open modal to configure tour or remove if added
    const openTourModal = (tour) => {
        const existing = selectedTours.find(t => t.id === tour.id)
        if (existing) {
            // Already added -> remove
            setSelectedTours(prev => prev.filter(t => t.id !== tour.id))
            return
        }

        const defaultDate = tourDates[tour.id] || new Date().toISOString().split('T')[0]
        const defaultQty = selectorData?.adults || 1
        setConfiguringTour(tour)
        setModalStep(1)
        setModalAssistance('locataria')
        setModalDate(defaultDate)
        setModalQuantity(defaultQty)
        setModalNames(Array(defaultQty).fill(''))
    }

    const saveConfiguredTour = () => {
        if (!configuringTour) return
        const formattedNames = modalNames.map(n => n.trim()).filter(Boolean)
        const assistanceLabel = modalAssistance === 'anfitrion' ? 'Anfitrión de Viaje' : 'Asistencia Locataria'

        setSelectedTours(prev => {
            const filtered = prev.filter(t => t.id !== configuringTour.id)
            return [...filtered, {
                id: configuringTour.id,
                name: `${configuringTour.title} (${assistanceLabel})`,
                rawTitle: configuringTour.title,
                price: configuringTour.priceNum || 0,
                date: modalDate,
                quantity: modalQuantity,
                assistanceType: assistanceLabel,
                passengerNames: formattedNames
            }]
        })

        setTourDates(prev => ({ ...prev, [configuringTour.id]: modalDate }))
        setConfiguringTour(null)
    }

    // Filter & Sort logic
    const filteredTours = useMemo(() => {
        let result = [...tours]

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            result = result.filter(t =>
                t.title.toLowerCase().includes(term) ||
                t.excerpt.toLowerCase().includes(term) ||
                t.category.toLowerCase().includes(term)
            )
        }

        if (selectedCategory !== 'Todas') {
            result = result.filter(t => t.category === selectedCategory)
        }

        if (sortBy === 'price-asc') {
            result.sort((a, b) => a.priceNum - b.priceNum)
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => b.priceNum - a.priceNum)
        } else if (sortBy === 'alpha-asc') {
            result.sort((a, b) => a.title.localeCompare(b.title))
        } else if (sortBy === 'alpha-desc') {
            result.sort((a, b) => b.title.localeCompare(a.title))
        }

        return result
    }, [tours, searchTerm, selectedCategory, sortBy])

    const adults = selectorData?.adults || 2
    const children = selectorData?.children || 0
    const extraTotal = selectedTours.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    const totalPrice = extraTotal

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    // Format date string to friendly readable format (e.g. 18 Oct 2026)
    const formatDateLabel = (dateStr) => {
        if (!dateStr) return 'Elegir fecha'
        const parts = dateStr.split('-')
        if (parts.length === 3) {
            const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
            return dateObj.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
        }
        return dateStr
    }

    return (
        <div className="tours-indiv-page">
            <Helmet>
                <title>Tours Individuales en Japón | RutaXAsia</title>
                <meta name="description" content="Reserva tours individuales y excursiones de un día en Japón sin paquete de vuelo ni hotel. Personaliza tu viaje día a día." />
            </Helmet>

            {/* Banner Header */}
            <div className="tours-indiv-hero">
                <div className="container">
                    <span className="tours-indiv-tag">⛩️ Viajeros Independientes</span>
                    <h1 className="tours-indiv-title">Tours en Japón</h1>
                    <p className="tours-indiv-excerpt">
                        Excursiones de 1 día y actividades sueltas para personas que ya se encuentran en Japón o cuentan con su propio hospedaje. Selecciona tus tours, elige el día y agrégalos a tu boleto de reserva.
                    </p>
                </div>
            </div>

            {/* Main Content Layout (Ticket Left, Grid Right) */}
            <div className="container tours-indiv-container">
                {/* Search & Filter Bar */}
                <div className="tours-indiv-filters-bar">
                    <div className="tours-indiv-search-box">
                        <span className="tours-indiv-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o ciudad (ej. Tokio, Disney, Kioto, Fuji)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="tours-indiv-clear-btn" onClick={() => setSearchTerm('')}>✕</button>
                        )}
                    </div>

                    <div className="tours-indiv-selects-group">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="tours-indiv-select"
                        >
                            <option value="Todas">Todas las categorías</option>
                            <option value="Rutas por Japón">Rutas por Japón</option>
                            <option value="Parques temáticos">Parques temáticos</option>
                            <option value="Experiencias Vip">Experiencias Vip</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="tours-indiv-select"
                        >
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="alpha-asc">Alfabético: A → Z</option>
                            <option value="alpha-desc">Alfabético: Z → A</option>
                        </select>
                    </div>
                </div>

                {/* 2-Column Split Layout */}
                <div className="tours-indiv-layout">
                    {/* Left Column: Floating Ticket Sidebar */}
                    <div className="tours-indiv-sidebar">
                        <FloatingTicket
                            season={{ name: 'Tours Individuales', colors: { primary: '#e91e63' } }}
                            temporadaKey="libre"
                            estilo="Tours Sueltos"
                            selectorData={selectorData}
                            selectedPkg={null}
                            includedExps={[]}
                            addedItems={selectedTours.map(t => ({
                                id: t.id,
                                name: `${t.name} (📅 ${formatDateLabel(t.date)})`,
                                price: t.price
                            }))}
                            selectedComps={[]}
                            basePrice={0}
                            extraTotal={extraTotal}
                            onOpenCheckout={() => setIsCheckoutOpen(true)}
                            onRemoveTour={(tourIdOrName) => setSelectedTours(prev => prev.filter(t => t.id !== tourIdOrName && t.name !== tourIdOrName && `${t.name} (📅 ${formatDateLabel(t.date)})` !== tourIdOrName))}
                        />
                    </div>

                    {/* Right Column: Grid of CMS Tour Cards */}
                    <div className="tours-indiv-grid-wrap">
                        {loading ? (
                            <div className="tours-indiv-loading">
                                <span className="tours-indiv-spinner">⛩️</span>
                                <p>Cargando catálogo oficial de Tours en Japón...</p>
                            </div>
                        ) : filteredTours.length === 0 ? (
                            <div className="tours-indiv-empty">
                                <p>No se encontraron tours con los filtros seleccionados.</p>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); setSortBy('price-asc') }}
                                >
                                    Restablecer filtros
                                </button>
                            </div>
                        ) : (
                            <div className="tours-indiv-cards-grid">
                                {filteredTours.map((tour) => {
                                    const isAdded = selectedTours.some(item => item.id === tour.id)
                                    const currentDate = tourDates[tour.id] || new Date().toISOString().split('T')[0]

                                    return (
                                        <div
                                            key={tour.id}
                                            className={`tours-indiv-card${isAdded ? ' tours-indiv-card--added' : ''}`}
                                        >
                                            <div className="tours-indiv-card-img-wrap">
                                                <img
                                                    src={tour.image}
                                                    alt={tour.title}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
                                                    }}
                                                />
                                                <span className="tours-indiv-badge">
                                                    ⏱️ {tour.days ? tour.days : '1 día'} {tour.hours ? `(${tour.hours})` : ''}
                                                </span>
                                            </div>

                                            <div className="tours-indiv-card-body">
                                                <h3 className="tours-indiv-card-title">{tour.title}</h3>
                                                {tour.excerpt && (
                                                    <p className="tours-indiv-card-excerpt">{tour.excerpt}</p>
                                                )}

                                                {/* Elegant Custom Date Selector Pill */}
                                                <div
                                                    className={`tours-indiv-date-chip${isAdded ? ' tours-indiv-date-chip--added' : ''}`}
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.querySelector('input[type="date"]')
                                                        if (input) {
                                                            try { input.showPicker() } catch (err) { input.focus() }
                                                        }
                                                    }}
                                                >
                                                    <span className="tours-indiv-date-chip-icon">📅</span>
                                                    <div className="tours-indiv-date-chip-info">
                                                        <span className="tours-indiv-date-chip-label">Fecha del Tour</span>
                                                        <span className="tours-indiv-date-chip-value">
                                                            {formatDateLabel(currentDate)}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="date"
                                                        className="tours-indiv-date-chip-native"
                                                        value={currentDate}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => handleDateChange(tour.id, e.target.value)}
                                                    />
                                                </div>

                                                <div className="tours-indiv-card-footer">
                                                    <div className="tours-indiv-card-price">
                                                        {tour.priceText || formatPrice(tour.priceNum)}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`tours-indiv-btn${isAdded ? ' tours-indiv-btn--added' : ''}`}
                                                        onClick={() => openTourModal(tour)}
                                                    >
                                                        {isAdded ? '✓ Agregado' : '+ Agregar'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Multi-Step Modal for Configuring Tour */}
            {configuringTour && (
                <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 99999 }}>
                    <div className="jtb-modal-card" style={{ maxWidth: '600px', padding: '32px 28px', textAlign: 'left' }}>
                        <button className="jtb-modal-close" onClick={() => setConfiguringTour(null)}>&times;</button>
                        
                        {/* Tour Header Summary */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                            <img
                                src={configuringTour.image}
                                alt={configuringTour.title}
                                style={{ width: '76px', height: '76px', borderRadius: '16px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop' }}
                            />
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                                    Personalizar Experiencia
                                </span>
                                <h3 style={{ margin: '4px 0 0', fontSize: '1.15rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}>
                                    {configuringTour.title}
                                </h3>
                                <div style={{ fontSize: '0.88rem', color: '#666', marginTop: '2px', fontWeight: '700' }}>
                                    {configuringTour.priceText || formatPrice(configuringTour.priceNum)} MXN / persona
                                </div>
                            </div>
                        </div>

                        {/* Step 1 vs Step 2 Navigation Pills */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '20px',
                            padding: '8px 12px',
                            background: '#f8fafc',
                            borderRadius: '100px',
                            border: '1px solid #e2e8f0',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: modalStep >= 1 ? 1 : 0.4 }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: modalStep >= 1 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: modalStep === 1 ? 800 : 600, color: modalStep === 1 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>Asistencia</span>
                            </div>
                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>→</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: modalStep >= 2 ? 1 : 0.4 }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: modalStep >= 2 ? 'var(--color-primary, #e11d48)' : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: modalStep === 2 ? 800 : 600, color: modalStep === 2 ? 'var(--color-primary, #e11d48)' : '#64748b' }}>Fecha y Pasajeros</span>
                            </div>
                        </div>

                        {/* ================= STEP 1: MODALIDAD DE ASISTENCIA ================= */}
                        {modalStep === 1 && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '800', color: 'var(--color-dark)', marginBottom: '12px' }}>
                                    1. Elige tu modalidad de acompañamiento para este tour:
                                </label>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                                    {/* Card 1: Asistencia Locataria */}
                                    <div
                                        onClick={() => setModalAssistance('locataria')}
                                        style={{
                                            border: modalAssistance === 'locataria' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                            background: modalAssistance === 'locataria' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                            borderRadius: '16px',
                                            padding: '18px 16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: modalAssistance === 'locataria' ? '0 8px 20px rgba(225,29,72,0.12)' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '1.8rem' }}>🏮</span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    background: modalAssistance === 'locataria' ? 'var(--color-primary, #e11d48)' : '#f1f5f9',
                                                    color: modalAssistance === 'locataria' ? '#fff' : '#64748b'
                                                }}>
                                                    {modalAssistance === 'locataria' ? '✓ Seleccionado' : 'Elegir'}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                Asistencia Locataria
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                                                Orientación y soporte local en destino. Disfruta tu recorrido con la asistencia y recomendaciones de coordinadores locales en español.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card 2: Anfitrión de Viaje */}
                                    <div
                                        onClick={() => setModalAssistance('anfitrion')}
                                        style={{
                                            border: modalAssistance === 'anfitrion' ? '2px solid var(--color-primary, #e11d48)' : '1px solid #e2e8f0',
                                            background: modalAssistance === 'anfitrion' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                            borderRadius: '16px',
                                            padding: '18px 16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: modalAssistance === 'anfitrion' ? '0 8px 20px rgba(225,29,72,0.12)' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '1.8rem' }}>👑</span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    background: modalAssistance === 'anfitrion' ? 'var(--color-primary, #e11d48)' : '#f1f5f9',
                                                    color: modalAssistance === 'anfitrion' ? '#fff' : '#64748b'
                                                }}>
                                                    {modalAssistance === 'anfitrion' ? '✓ Seleccionado' : 'Elegir'}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                                                Anfitrión de Viaje
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                                                Acompañamiento cercano y personalizado durante todo el tour. Atención dedicada para una inmersión completa sin preocuparte por traslados ni logística.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '14px', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 800 }}
                                    onClick={() => setModalStep(2)}
                                >
                                    Continuar a Fecha y Pasajeros →
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 2: FECHA, CANTIDAD Y ASISTENTES ================= */}
                        {modalStep === 2 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--color-dark)', margin: 0 }}>
                                        2. Configuración de Fecha y Pasajeros:
                                    </label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 750, color: 'var(--color-primary)', background: 'rgba(225, 29, 72, 0.08)', padding: '3px 10px', borderRadius: '100px' }}>
                                        {modalAssistance === 'anfitrion' ? '👑 Anfitrión de Viaje' : '🏮 Asistencia Locataria'}
                                    </span>
                                </div>

                                {/* Date and Quantity Selector */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#444', marginBottom: '6px' }}>
                                            📅 Fecha del Tour:
                                        </label>
                                        <input
                                            type="date"
                                            value={modalDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setModalDate(e.target.value)}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #ccc', fontSize: '0.9rem', fontWeight: '700' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#444', marginBottom: '6px' }}>
                                            👥 Cantidad de Pasajeros:
                                        </label>
                                        <select
                                            value={modalQuantity}
                                            onChange={(e) => {
                                                const newQty = parseInt(e.target.value, 10)
                                                setModalQuantity(newQty)
                                                setModalNames(prev => {
                                                    const copy = [...prev]
                                                    if (newQty > copy.length) {
                                                        while (copy.length < newQty) copy.push('')
                                                    } else {
                                                        copy.length = newQty
                                                    }
                                                    return copy
                                                })
                                            }}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #ccc', fontSize: '0.9rem', fontWeight: '700' }}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num} {num === 1 ? 'Persona' : 'Personas'}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Passenger Names Form */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--color-dark)', marginBottom: '8px' }}>
                                        📋 Nombre(s) de la(s) persona(s) que asistirán:
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {modalNames.map((nameVal, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#666', width: '80px', flexShrink: 0 }}>
                                                    Persona {i + 1}:
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder={`Nombre completo del asistente ${i + 1}`}
                                                    value={nameVal}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        setModalNames(prev => {
                                                            const copy = [...prev]
                                                            copy[i] = val
                                                            return copy
                                                        })
                                                    }}
                                                    style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.88rem' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Modal Footer Summary & CTA */}
                                <div style={{ background: '#f8f9fa', padding: '14px 18px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Total por {modalQuantity} persona(s):</span>
                                        <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                                            {formatPrice((configuringTour.priceNum || 0) * modalQuantity)} MXN
                                        </strong>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '0.85rem' }}
                                            onClick={() => setModalStep(1)}
                                        >
                                            ← Volver
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{ borderRadius: '100px', padding: '10px 22px', fontWeight: '800', fontSize: '0.88rem' }}
                                            onClick={saveConfiguredTour}
                                        >
                                            ✓ Confirmar y Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={{ name: 'Tours Individuales', colors: { primary: '#e91e63' } }}
                estilo="Tours Sueltos"
                totalPrice={totalPrice}
                desglose={
                    `Tours seleccionados: ${selectedTours.map(t => `${t.name} (📅 ${formatDateLabel(t.date)}) - ${t.quantity || 1} persona(s) [Asistentes: ${t.passengerNames?.join(', ') || 'Por definir'}]`).join('; ') || 'Ninguno'}. ` +
                    `Total acumulado: ${formatPrice(totalPrice)} MXN.`
                }
            />
        </div>
    )
}
