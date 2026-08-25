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
    const [selectedCity, setSelectedCity] = useState('Todas')
    const [sortBy, setSortBy] = useState('price-asc') // 'price-asc' | 'price-desc' | 'alpha-asc' | 'alpha-desc'

    // Selected Individual Tours Cart: [{ id, name, modality: 'locatario'|'anfitrion', price, date, quantity }]
    const [selectedTours, setSelectedTours] = useState([])
    // Chosen modality for each tour card: { [tourId]: 'locatario' | 'anfitrion' }
    const [tourModalities, setTourModalities] = useState({})
    // Chosen date for each tour card: { [tourId]: '2026-10-18' }
    const [tourDates, setTourDates] = useState({})
    // Chosen quantity for each tour card: { [tourId]: 1 }
    const [tourQuantities, setTourQuantities] = useState({})

    // Side Drawer Details state (holds tour object or null)
    const [detailDrawerTour, setDetailDrawerTour] = useState(null)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    // Tomorrow date as default minimum date
    const tomorrowStr = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        return d.toISOString().split('T')[0]
    }, [])

    // Close drawer on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setDetailDrawerTour(null)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
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

    // Extract dynamic unique cities from CMS data
    const availableCities = useMemo(() => {
        const citySet = new Set()
        tours.forEach(t => {
            if (t.city) {
                const parts = t.city.split(/,| y |\//).map(c => c.trim()).filter(Boolean)
                parts.forEach(p => {
                    const low = p.toLowerCase()
                    if (low.includes('tokio') || low.includes('tokyo')) citySet.add('Tokio')
                    else if (low.includes('kioto') || low.includes('kyoto')) citySet.add('Kioto')
                    else if (low.includes('osaka')) citySet.add('Osaka')
                    else if (low.includes('nara')) citySet.add('Nara')
                    else if (low.includes('hiroshima')) citySet.add('Hiroshima')
                    else if (low.includes('hakone') || low.includes('fuji')) citySet.add('Monte Fuji / Hakone')
                    else if (low.includes('kobe')) citySet.add('Kobe')
                    else if (low.includes('himeji')) citySet.add('Himeji')
                    else if (low.includes('kamakura')) citySet.add('Kamakura')
                    else if (low.includes('nikko')) citySet.add('Nikko')
                    else citySet.add(p)
                })
            }
        })
        return ['Todas', ...Array.from(citySet).sort()]
    }, [tours])

    // Handle modality change for a tour
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

    // Handle date change for a tour
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

    const [pendingTour, setPendingTour] = useState(null)

    // Open checkout modal staging this tour (does NOT commit to selectedTours until confirmed)
    const handleAddAndOpenCheckout = (tour) => {
        const chosenModality = tourModalities[tour.id] || 'anfitrion'
        const chosenDate = tourDates[tour.id] || tomorrowStr
        const chosenQty = tourQuantities[tour.id] || 1
        const priceAnfitrion = tour.priceAnfitrionNum || tour.priceNum || 800
        const priceLocatario = tour.priceLocatarioNum || Math.round(priceAnfitrion * 1.5)
        const unitPrice = chosenModality === 'anfitrion' ? priceAnfitrion : priceLocatario

        const staged = {
            id: tour.id,
            name: tour.title,
            modality: chosenModality,
            modalityLabel: chosenModality === 'anfitrion' ? '👑 Anfitrión de Viaje' : '🏮 Asistencia Locataria',
            price: unitPrice,
            priceAnfitrionNum: priceAnfitrion,
            priceLocatarioNum: priceLocatario,
            date: chosenDate,
            quantity: chosenQty,
        }

        setPendingTour(staged)
        setDetailDrawerTour(null)
        setIsCheckoutOpen(true)
    }

    const handleCloseCheckout = () => {
        setPendingTour(null)
        setIsCheckoutOpen(false)
    }

    const handleConfirmTour = (tourToCommit, chosenAssistance) => {
        if (!tourToCommit) return
        const isAnfitrion = chosenAssistance === 'anfitrion'
        const unitPrice = isAnfitrion
            ? (tourToCommit.priceAnfitrionNum || 800)
            : (tourToCommit.priceLocatarioNum || 1200)

        setSelectedTours(prev => {
            const exists = prev.some(t => t.id === tourToCommit.id)
            if (exists) {
                return prev.map(t => t.id === tourToCommit.id ? {
                    ...t,
                    ...tourToCommit,
                    price: unitPrice,
                    modality: chosenAssistance,
                    modalityLabel: isAnfitrion ? '👑 Anfitrión de Viaje' : '🏮 Asistencia Locataria',
                } : t)
            }
            return [...prev, {
                ...tourToCommit,
                price: unitPrice,
                modality: chosenAssistance,
                modalityLabel: isAnfitrion ? '👑 Anfitrión de Viaje' : '🏮 Asistencia Locataria',
            }]
        })
    }

    // Toggle tour freely directly from ticket or card
    const toggleTour = (tour) => {
        const existing = selectedTours.find(t => t.id === tour.id)
        if (existing) {
            setSelectedTours(prev => prev.filter(t => t.id !== tour.id))
        } else {
            handleAddAndOpenCheckout(tour)
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
                t.category.toLowerCase().includes(term) ||
                (t.city && t.city.toLowerCase().includes(term))
            )
        }

        if (selectedCategory !== 'Todas') {
            result = result.filter(t => t.category === selectedCategory)
        }

        if (selectedCity !== 'Todas') {
            result = result.filter(t => {
                if (!t.city) return false
                const cLow = t.city.toLowerCase()
                const selLow = selectedCity.toLowerCase()
                if (selLow.includes('tokio') || selLow.includes('tokyo')) return cLow.includes('tokio') || cLow.includes('tokyo')
                if (selLow.includes('kioto') || selLow.includes('kyoto')) return cLow.includes('kioto') || cLow.includes('kyoto')
                if (selLow.includes('fuji') || selLow.includes('hakone')) return cLow.includes('fuji') || cLow.includes('hakone')
                return cLow.includes(selLow)
            })
        }

        if (sortBy === 'price-asc') {
            result.sort((a, b) => (a.priceAnfitrionNum || a.priceNum) - (b.priceAnfitrionNum || b.priceNum))
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => (b.priceAnfitrionNum || b.priceNum) - (a.priceAnfitrionNum || a.priceNum))
        } else if (sortBy === 'alpha-asc') {
            result.sort((a, b) => a.title.localeCompare(b.title))
        } else if (sortBy === 'alpha-desc') {
            result.sort((a, b) => b.title.localeCompare(a.title))
        }

        return result
    }, [tours, searchTerm, selectedCategory, selectedCity, sortBy])

    // Total price of selected individual tours
    const totalPrice = useMemo(() => {
        return selectedTours.reduce((sum, t) => sum + (t.price * (t.quantity || 1)), 0)
    }, [selectedTours])

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')} MXN`

    const formatDateLabel = (dateStr) => {
        if (!dateStr) return 'Seleccionar'
        try {
            const d = new Date(dateStr + 'T00:00:00')
            return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
        } catch (e) {
            return dateStr
        }
    }

    // Active drawer tour calculations
    const drawerTourModality = detailDrawerTour ? (tourModalities[detailDrawerTour.id] || 'anfitrion') : 'anfitrion'
    const drawerTourDate = detailDrawerTour ? (tourDates[detailDrawerTour.id] || tomorrowStr) : tomorrowStr
    const drawerTourQty = detailDrawerTour ? (tourQuantities[detailDrawerTour.id] || 1) : 1
    const drawerPriceAnfitrion = detailDrawerTour ? (detailDrawerTour.priceAnfitrionNum || detailDrawerTour.priceNum || 800) : 800
    const drawerPriceLocatario = detailDrawerTour ? (detailDrawerTour.priceLocatarioNum || Math.round(drawerPriceAnfitrion * 1.5)) : 1200
    const drawerUnitPrice = drawerTourModality === 'anfitrion' ? drawerPriceAnfitrion : drawerPriceLocatario
    const drawerTotalPrice = drawerUnitPrice * drawerTourQty
    const isDrawerTourAdded = detailDrawerTour ? selectedTours.some(item => item.id === detailDrawerTour.id) : false

    return (
        <div className="tours-indiv-page">
            <Helmet>
                <title>Tours Individuales en Japón | RutaXAsia</title>
                <meta
                    name="description"
                    content="Explora y agrega tours individuales a tu medida en Tokio, Kioto, Osaka y más. Arma tu propio pase de abordar personalizado."
                />
            </Helmet>

            {/* Hero Section */}
            <div className="tours-indiv-hero">
                <div className="container">
                    <span className="tours-indiv-tag">⛩️ Catálogo Oficial de Experiencias</span>
                    <h1 className="tours-indiv-title">Tours Individuales en Japón</h1>
                    <p className="tours-indiv-excerpt">
                        Selecciona fecha y personas directamente en cada tour para armar tu pase de abordar. Haz clic en el <strong>+</strong> para conocer todos los detalles sin salir de la página.
                    </p>
                </div>
            </div>

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
                            <button
                                type="button"
                                className="tours-indiv-clear-btn"
                                onClick={() => setSearchTerm('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="tours-indiv-selects-group">
                        {/* City Filter */}
                        <select
                            className="tours-indiv-select"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            aria-label="Filtrar por ciudad"
                        >
                            <option value="Todas">📍 Todas las ciudades</option>
                            {availableCities.filter(c => c !== 'Todas').map(c => (
                                <option key={c} value={c}>📍 {c}</option>
                            ))}
                        </select>

                        {/* Category Filter */}
                        <select
                            className="tours-indiv-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            aria-label="Filtrar por categoría"
                        >
                            <option value="Todas">⛩️ Todas las categorías</option>
                            <option value="Rutas por Japón">Rutas por Japón</option>
                            <option value="Parques temáticos">Parques temáticos</option>
                            <option value="Experiencias Vip">Experiencias VIP</option>
                        </select>

                        {/* Sort Filter */}
                        <select
                            className="tours-indiv-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Ordenar tours"
                        >
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="alpha-asc">Nombre: A - Z</option>
                            <option value="alpha-desc">Nombre: Z - A</option>
                        </select>
                    </div>
                </div>

                {/* 2-Column Layout: Left Sidebar Sticky Ticket | Right Grid of CMS Cards */}
                <div className="tours-indiv-layout">
                    {/* Left Column: Floating Ticket */}
                    <div className="tours-indiv-sidebar">
                        <FloatingTicket
                            season={{ name: 'Tours Sueltos', colors: { primary: '#e91e63' } }}
                            temporadaKey="sakura"
                            estilo="Tours Sueltos"
                            selectorData={{
                                adults: selectedTours.reduce((max, t) => Math.max(max, t.quantity || 1), 1),
                                children: 0,
                                dateMode: 'specific',
                                selectedMonth: null,
                                startDate: selectedTours[0]?.date || tomorrowStr,
                                endDate: selectedTours[selectedTours.length - 1]?.date || tomorrowStr,
                            }}
                            selectedPkg={null}
                            includedExps={[]}
                            addedItems={selectedTours.map(t => ({
                                id: t.id,
                                name: `${t.name} [${t.modality === 'anfitrion' ? '👑 Anfitrión' : '🏮 Locataria'}] (📅 ${formatDateLabel(t.date)}${(t.quantity || 1) > 1 ? ` × ${t.quantity} pers.` : ''})`,
                                price: t.price * (t.quantity || 1)
                            }))}
                            selectedComps={[]}
                            basePrice={0}
                            extraTotal={totalPrice}
                            customReserveBtnText="💬 Reservar Tours por WhatsApp"
                            customWhatsAppBtnText="💬 Cotizar por WhatsApp"
                            onOpenCheckout={() => {
                                if (selectedTours.length === 0) {
                                    alert('Por favor selecciona al menos un tour antes de proceder.')
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
                                    onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); setSelectedCity('Todas'); setSortBy('price-asc') }}
                                >
                                    Restablecer filtros
                                </button>
                            </div>
                        ) : (
                            <div className="tours-indiv-cards-grid">
                                {filteredTours.map((tour) => {
                                    const isAdded = selectedTours.some(item => item.id === tour.id)
                                    const currentModality = tourModalities[tour.id] || 'anfitrion'
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
                                            {/* Card Image Header with Duration and Info '+' Button */}
                                            <div 
                                                className="tours-indiv-card-img-wrap" 
                                                onClick={() => setDetailDrawerTour(tour)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img
                                                    src={tour.image}
                                                    alt={tour.title}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
                                                    }}
                                                />
                                                {tour.city && (
                                                    <span className="tours-indiv-city-badge">
                                                        📍 {tour.city}
                                                    </span>
                                                )}
                                                <span className="tours-indiv-badge">
                                                    ⏱️ {tour.days ? tour.days : '1 día'} {tour.hours ? `(${tour.hours})` : ''}
                                                </span>
                                                
                                                {/* Top Right '+' Quick Info Button */}
                                                <button
                                                    type="button"
                                                    className="tours-card-plus-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDetailDrawerTour(tour)
                                                    }}
                                                    title="Haz clic para ver más información sin salir de la página"
                                                    aria-label="Más información"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="tours-indiv-card-body">
                                                <h3 
                                                    className="tours-indiv-card-title" 
                                                    onClick={() => setDetailDrawerTour(tour)}
                                                    title="Haz clic para ver más información"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {tour.title}
                                                </h3>

                                                {tour.excerpt && (
                                                    <p 
                                                        className="tours-indiv-card-excerpt"
                                                        onClick={() => setDetailDrawerTour(tour)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {tour.excerpt}
                                                    </p>
                                                )}

                                                {/* Compact Date and Quantity Controls Bar */}
                                                <div className="tours-indiv-compact-controls">
                                                    {/* Date Selector Chip */}
                                                    <div
                                                        className={`tours-indiv-date-chip${isAdded ? ' tours-indiv-date-chip--added' : ''}`}
                                                        style={{ flex: 1, margin: 0, cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.querySelector('input[type="date"]')
                                                            if (input) {
                                                                try {
                                                                    if (typeof input.showPicker === 'function') {
                                                                        input.showPicker()
                                                                    } else {
                                                                        input.focus()
                                                                    }
                                                                } catch (err) {
                                                                    input.focus()
                                                                }
                                                            }
                                                        }}
                                                        title="Haz clic para seleccionar fecha del tour"
                                                    >
                                                        <span className="tours-indiv-date-chip-icon">📅</span>
                                                        <div className="tours-indiv-date-chip-info">
                                                            <span className="tours-indiv-date-chip-label">Fecha</span>
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
                                                    </div>

                                                    {/* Quantity / Persons Chip */}
                                                    <div className="tours-indiv-qty-chip">
                                                        <button
                                                            type="button"
                                                            className="tours-indiv-qty-btn"
                                                            onClick={() => handleQuantityChange(tour.id, -1)}
                                                            disabled={currentQty <= 1}
                                                            aria-label="Restar persona"
                                                        >
                                                            -
                                                        </button>
                                                        <div className="tours-indiv-qty-display">
                                                            <span className="tours-indiv-qty-num">{currentQty}</span>
                                                            <span className="tours-indiv-qty-unit">{currentQty === 1 ? 'pers' : 'pers'}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="tours-indiv-qty-btn"
                                                            onClick={() => handleQuantityChange(tour.id, 1)}
                                                            aria-label="Sumar persona"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Card Footer: Price & Add Button */}
                                                <div className="tours-indiv-card-footer">
                                                    <div className="tours-indiv-price-col">
                                                        <span className="tours-indiv-price-label">
                                                            {currentQty > 1 ? `${formatPrice(unitPrice)} × ${currentQty}` : 'Desde'}
                                                        </span>
                                                        <strong className="tours-indiv-price-val">
                                                            {formatPrice(tourTotalForQty)}
                                                        </strong>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className={`tours-indiv-add-btn${isAdded ? ' tours-indiv-add-btn--added' : ''}`}
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

            {/* Right Slide-in Info Drawer Backdrop & Panel */}
            <div
                className={`tours-drawer-overlay${detailDrawerTour ? ' tours-drawer-overlay--open' : ''}`}
                onClick={() => setDetailDrawerTour(null)}
            />

            <div className={`tours-drawer-panel${detailDrawerTour ? ' tours-drawer-panel--open' : ''}`}>
                {detailDrawerTour && (
                    <>
                        {/* Drawer Header */}
                        <div className="tours-drawer-header">
                            <div>
                                <span className="tours-drawer-badge">
                                    {detailDrawerTour.category || 'Tour'} • 📍 {detailDrawerTour.city || 'Japón'}
                                </span>
                                <h2 className="tours-drawer-title">{detailDrawerTour.title}</h2>
                            </div>
                            <button
                                type="button"
                                className="tours-drawer-close"
                                onClick={() => setDetailDrawerTour(null)}
                                aria-label="Cerrar detalles"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Drawer Scrollable Body */}
                        <div className="tours-drawer-body">
                            {/* Hero Image */}
                            <div className="tours-drawer-img-wrap">
                                <img
                                    src={detailDrawerTour.image}
                                    alt={detailDrawerTour.title}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
                                    }}
                                />
                                <div className="tours-drawer-img-overlay">
                                    <span>⏱️ Duración: <strong>{detailDrawerTour.days || '1 día'} {detailDrawerTour.hours ? `(${detailDrawerTour.hours})` : ''}</strong></span>
                                </div>
                            </div>

                            {/* Key Highlights Grid */}
                            <div className="tours-drawer-highlights">
                                <div className="drawer-highlight-card">
                                    <span className="drawer-hl-icon">📍</span>
                                    <div>
                                        <span className="drawer-hl-label">Destino</span>
                                        <strong className="drawer-hl-val">{detailDrawerTour.city || 'Japón'}</strong>
                                    </div>
                                </div>
                                <div className="drawer-highlight-card">
                                    <span className="drawer-hl-icon">⏱️</span>
                                    <div>
                                        <span className="drawer-hl-label">Duración</span>
                                        <strong className="drawer-hl-val">{detailDrawerTour.days || '1 día'}</strong>
                                    </div>
                                </div>
                                <div className="drawer-highlight-card">
                                    <span className="drawer-hl-icon">🏷️</span>
                                    <div>
                                        <span className="drawer-hl-label">Categoría</span>
                                        <strong className="drawer-hl-val">{detailDrawerTour.category || 'Tour'}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Full Description / Itinerary */}
                            <div className="tours-drawer-section">
                                <h3>⛩️ Acerca de este Tour</h3>
                                {detailDrawerTour.description ? (
                                    <div className="tours-drawer-desc-content">
                                        {detailDrawerTour.description.split('\n').filter(p => p.trim()).map((para, pIdx) => (
                                            <p key={pIdx} style={{ marginBottom: '10px', lineHeight: 1.6, color: '#334155' }}>{para}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                                        {detailDrawerTour.excerpt || 'Disfruta de esta experiencia única por los rincones más emblemáticos de Japón con el acompañamiento de nuestro equipo.'}
                                    </p>
                                )}
                            </div>

                            {/* Observaciones / Notas si existen */}
                            {detailDrawerTour.observations && (
                                <div className="tours-drawer-section" style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '14px 16px', marginTop: '10px' }}>
                                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400e', margin: '0 0 6px' }}>📝 Observaciones y Recomendaciones</h4>
                                    <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0, lineHeight: 1.5 }}>{detailDrawerTour.observations}</p>
                                </div>
                            )}

                            {/* Quick Price Reference */}
                            <div className="tours-drawer-section" style={{ marginTop: '14px' }}>
                                <h3>🏮 Modalidades Disponibles en la Reserva</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block' }}>👑 Anfitrión de Viaje</span>
                                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Coordinador RutaXAsia</span>
                                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary, #e11d48)', display: 'block', marginTop: '4px' }}>
                                            {formatPrice(drawerPriceAnfitrion)}
                                        </strong>
                                    </div>
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block' }}>🏮 Asistencia Locataria</span>
                                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Guía local de la zona</span>
                                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary, #e11d48)', display: 'block', marginTop: '4px' }}>
                                            {formatPrice(drawerPriceLocatario)}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Sticky Footer */}
                        <div className="tours-drawer-footer">
                            <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Precio base por persona (Anfitrión):</span>
                                <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary, #e11d48)' }}>
                                    {formatPrice(drawerPriceAnfitrion)}
                                </strong>
                            </div>

                            <button
                                type="button"
                                className="tours-drawer-add-btn"
                                onClick={() => handleAddAndOpenCheckout(detailDrawerTour)}
                            >
                                🚀 Configurar y Agregar Tour
                            </button>
                        </div>
                    </>
                )}
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={handleCloseCheckout}
                season={{ name: 'Tours Individuales', colors: { primary: '#e91e63' } }}
                estilo="Tours Sueltos"
                totalPrice={totalPrice}
                selectedTours={selectedTours}
                pendingTour={pendingTour}
                onConfirmTour={handleConfirmTour}
                desglose={
                    `Tours seleccionados (${(pendingTour && !selectedTours.some(t => t.id === pendingTour.id) ? [...selectedTours, pendingTour] : selectedTours).length}): ` +
                    (pendingTour && !selectedTours.some(t => t.id === pendingTour.id) ? [...selectedTours, pendingTour] : selectedTours).map(t => `${t.name} [${t.modalityLabel || (t.modality === 'anfitrion' ? '👑 Anfitrión' : '🏮 Locataria')}] (📅 ${formatDateLabel(t.date)}) - ${t.quantity || 1} persona(s) [${formatPrice((t.price || 0) * (t.quantity || 1))} MXN]`).join('; ')
                }
            />
        </div>
    )
}
