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

    // Selected Individual Tours Cart: [{ id, name, modality: 'locatario'|'anfitrion', price, date, quantity }]
    const [selectedTours, setSelectedTours] = useState([])
    // Chosen modality for each tour card: { [tourId]: 'locatario' | 'anfitrion' }
    const [tourModalities, setTourModalities] = useState({})
    // Chosen date for each tour card: { [tourId]: '2026-10-18' }
    const [tourDates, setTourDates] = useState({})
    // Chosen quantity for each tour card: { [tourId]: 1 }
    const [tourQuantities, setTourQuantities] = useState({})

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    // Tomorrow date as default minimum date
    const tomorrowStr = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        return d.toISOString().split('T')[0]
    }, [])

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

    // Handle modality change for a tour card
    const handleModalityChange = (tour, newModality) => {
        setTourModalities(prev => ({ ...prev, [tour.id]: newModality }))

        const unitPrice = newModality === 'anfitrion'
            ? (tour.priceAnfitrionNum || tour.priceNum || 800)
            : (tour.priceLocatarioNum || Math.round((tour.priceAnfitrionNum || tour.priceNum || 800) * 1.5))

        // If already added in ticket, update modality and price in selectedTours
        setSelectedTours(prev => prev.map(item =>
            item.id === tour.id
                ? {
                    ...item,
                    modality: newModality,
                    modalityLabel: newModality === 'anfitrion' ? '👑 Anfitrión de Viaje' : '🏮 Asistencia Locataria',
                    price: unitPrice
                }
                : item
        ))
    }

    // Handle date change for a tour card
    const handleDateChange = (tourId, dateStr) => {
        setTourDates(prev => ({ ...prev, [tourId]: dateStr }))
        // If already added, update date in selectedTours
        setSelectedTours(prev => prev.map(item =>
            item.id === tourId ? { ...item, date: dateStr } : item
        ))
    }

    // Handle quantity change for a tour
    const handleQuantityChange = (tourId, delta) => {
        const currentQty = tourQuantities[tourId] || 1
        const newQty = Math.max(1, currentQty + delta)
        setTourQuantities(prev => ({ ...prev, [tourId]: newQty }))

        // If already added in ticket, update quantity in selectedTours
        setSelectedTours(prev => prev.map(item =>
            item.id === tourId ? { ...item, quantity: newQty } : item
        ))
    }

    // Toggle tour freely directly from card
    const toggleTour = (tour) => {
        const existing = selectedTours.find(t => t.id === tour.id)
        if (existing) {
            // Already added -> remove directly
            setSelectedTours(prev => prev.filter(t => t.id !== tour.id))
        } else {
            // Add tour directly with the modality, date and quantity selected on the card
            const chosenModality = tourModalities[tour.id] || 'locatario'
            const chosenDate = tourDates[tour.id] || tomorrowStr
            const chosenQty = tourQuantities[tour.id] || 1

            const unitPrice = chosenModality === 'anfitrion'
                ? (tour.priceAnfitrionNum || tour.priceNum || 800)
                : (tour.priceLocatarioNum || Math.round((tour.priceAnfitrionNum || tour.priceNum || 800) * 1.5))

            setSelectedTours(prev => [...prev, {
                id: tour.id,
                name: tour.title,
                modality: chosenModality,
                modalityLabel: chosenModality === 'anfitrion' ? '👑 Anfitrión de Viaje' : '🏮 Asistencia Locataria',
                price: unitPrice,
                date: chosenDate,
                quantity: chosenQty,
            }])
        }
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
            result.sort((a, b) => (a.priceLocatarioNum || a.priceNum) - (b.priceLocatarioNum || b.priceNum))
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => (b.priceLocatarioNum || b.priceNum) - (a.priceLocatarioNum || a.priceNum))
        } else if (sortBy === 'alpha-asc') {
            result.sort((a, b) => a.title.localeCompare(b.title))
        } else if (sortBy === 'alpha-desc') {
            result.sort((a, b) => b.title.localeCompare(a.title))
        }

        return result
    }, [tours, searchTerm, selectedCategory, sortBy])

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
                        Excursiones de 1 día y actividades sueltas. Elige tu modalidad de acompañamiento (<strong>Asistencia Locataria</strong> o <strong>Anfitrión de Viaje</strong>), selecciona la fecha y agrégalos a tu boleto de reserva.
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
                                name: `${t.name} [${t.modality === 'anfitrion' ? '👑 Anfitrión' : '🏮 Locataria'}] (📅 ${formatDateLabel(t.date)}${(t.quantity || 1) > 1 ? ` × ${t.quantity} pers.` : ''})`,
                                price: t.price * (t.quantity || 1)
                            }))}
                            selectedComps={[]}
                            basePrice={0}
                            extraTotal={extraTotal}
                            customReserveBtnText="💳 Pagar Tours en Línea"
                            customWhatsAppBtnText="💬 Cotizar por WhatsApp"
                            onOpenCheckout={() => {
                                if (selectedTours.length === 0) {
                                    alert('Por favor selecciona al menos un tour antes de proceder al pago.')
                                    return
                                }
                                setIsCheckoutOpen(true)
                            }}
                            onRemoveTour={(tourIdOrName) => setSelectedTours(prev => prev.filter(t => t.id !== tourIdOrName && t.name !== tourIdOrName && !t.name.includes(tourIdOrName)))}
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
                                    const currentModality = tourModalities[tour.id] || 'locatario'
                                    const currentDate = tourDates[tour.id] || tomorrowStr
                                    const currentQty = tourQuantities[tour.id] || 1

                                    const priceAnfitrion = tour.priceAnfitrionNum || tour.priceNum || 800
                                    const priceLocatario = tour.priceLocatarioNum || Math.round(priceAnfitrion * 1.5)

                                    const unitPrice = currentModality === 'anfitrion' ? priceAnfitrion : priceLocatario
                                    const tourTotalForQty = unitPrice * currentQty

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

                                                {/* Modality Selector Bar (Locataria vs Anfitrión) */}
                                                <div className="tours-indiv-modality-selector">
                                                    <button
                                                        type="button"
                                                        className={`tours-modality-pill${currentModality === 'locatario' ? ' tours-modality-pill--active' : ''}`}
                                                        onClick={() => handleModalityChange(tour, 'locatario')}
                                                    >
                                                        <span className="modality-pill-icon">🏮</span>
                                                        <div className="modality-pill-text">
                                                            <span className="modality-pill-title">Locataria</span>
                                                            <span className="modality-pill-price">{formatPrice(priceLocatario)}</span>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`tours-modality-pill${currentModality === 'anfitrion' ? ' tours-modality-pill--active' : ''}`}
                                                        onClick={() => handleModalityChange(tour, 'anfitrion')}
                                                    >
                                                        <span className="modality-pill-icon">👑</span>
                                                        <div className="modality-pill-text">
                                                            <span className="modality-pill-title">Anfitrión</span>
                                                            <span className="modality-pill-price">{formatPrice(priceAnfitrion)}</span>
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Date and Quantity Controls Bar */}
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                                                    {/* Custom Interactive Date Selector Pill */}
                                                    <label
                                                        className={`tours-indiv-date-chip${isAdded ? ' tours-indiv-date-chip--added' : ''}`}
                                                        style={{ flex: 1, margin: 0, cursor: 'pointer' }}
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
                                                            min={tomorrowStr}
                                                            onChange={(e) => handleDateChange(tour.id, e.target.value)}
                                                        />
                                                    </label>

                                                    {/* Quantity / Person Selector Pill */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        background: isAdded ? 'rgba(233, 30, 122, 0.08)' : '#fff',
                                                        border: isAdded ? '1px solid var(--color-primary, #e11d48)' : '1px solid #e0e0e0',
                                                        borderRadius: '12px',
                                                        padding: '4px 6px',
                                                        gap: '4px',
                                                        height: '46px',
                                                    }}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleQuantityChange(tour.id, -1) }}
                                                            style={{ border: 'none', background: '#f1f5f9', borderRadius: '6px', width: '22px', height: '26px', cursor: 'pointer', fontWeight: 900, color: '#333' }}
                                                        >-</button>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '32px' }}>
                                                            <span style={{ fontSize: '0.62rem', color: '#888', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>Pers.</span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.2 }}>{currentQty}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleQuantityChange(tour.id, 1) }}
                                                            style={{ border: 'none', background: '#f1f5f9', borderRadius: '6px', width: '22px', height: '26px', cursor: 'pointer', fontWeight: 900, color: '#333' }}
                                                        >+</button>
                                                    </div>
                                                </div>

                                                <div className="tours-indiv-card-footer">
                                                    <div className="tours-indiv-card-price">
                                                        {formatPrice(tourTotalForQty)}
                                                        <span style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600, display: 'block' }}>
                                                            {formatPrice(unitPrice)} × {currentQty} pers.
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`tours-indiv-btn${isAdded ? ' tours-indiv-btn--added' : ''}`}
                                                        onClick={() => toggleTour(tour)}
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

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={{ name: 'Tours Individuales', colors: { primary: '#e91e63' } }}
                estilo="Tours Sueltos"
                totalPrice={totalPrice}
                desglose={
                    `Tours seleccionados (${selectedTours.length}): ` +
                    selectedTours.map(t => `${t.name} [${t.modalityLabel || (t.modality === 'anfitrion' ? '👑 Anfitrión' : '🏮 Locataria')}] (📅 ${formatDateLabel(t.date)}) - ${t.quantity || 1} persona(s) [${formatPrice((t.price || 0) * (t.quantity || 1))} MXN]`).join('; ')
                }
            />
        </div>
    )
}
