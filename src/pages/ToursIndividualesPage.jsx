import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchTourIndividuales } from '../lib/wixClient'
import { useTripSearch } from '../context/TripContext'
import FloatingTicket from '../components/JaponTripBuilder/FloatingTicket'
import CheckoutModal from '../components/JaponTripBuilder/CheckoutModal'
import './ToursIndividualesPage.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

/**
 * Custom modern Dropdown selector for filters
 */
function CustomDropdown({ value, onChange, options, ariaLabel }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const currentOption = options.find(o => o.value === value) || options[0]

    return (
        <div className="custom-dropdown-wrap" ref={dropdownRef}>
            <button
                type="button"
                className={`custom-dropdown-btn${isOpen ? ' custom-dropdown-btn--open' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-label={ariaLabel}
                aria-expanded={isOpen}
            >
                <span className="custom-dropdown-btn-label">
                    {currentOption?.icon && <span className="custom-dropdown-icon">{currentOption.icon}</span>}
                    <span>{currentOption?.label || value}</span>
                </span>
                <span className={`custom-dropdown-arrow${isOpen ? ' custom-dropdown-arrow--up' : ''}`}>▾</span>
            </button>

            {isOpen && (
                <div className="custom-dropdown-menu">
                    {options.map((opt) => {
                        const isSelected = opt.value === value
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                className={`custom-dropdown-item${isSelected ? ' custom-dropdown-item--active' : ''}`}
                                onClick={() => {
                                    onChange(opt.value)
                                    setIsOpen(false)
                                }}
                            >
                                <span className="custom-dropdown-item-text">
                                    {opt.icon && <span className="custom-dropdown-item-icon">{opt.icon}</span>}
                                    <span>{opt.label}</span>
                                </span>
                                {isSelected && <span className="custom-dropdown-check">✓</span>}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function ToursIndividualesPage({ whatsappOnly = true }) {
    const location = useLocation()
    const isCheckoutExplicit = location.search.includes('mode=checkout') || location.search.includes('checkout=1')
    const isWhatsAppMode = isCheckoutExplicit ? false : (whatsappOnly !== false)

    const formatPrice = (num) => `$${Math.round(num || 0).toLocaleString('es-MX')} MXN`
    const formatPriceNumOnly = (num) => `$${Math.round(num || 0).toLocaleString('es-MX')}`

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

    // Extract dynamic unique cities from CMS data (only for tours appearing in list)
    const availableCities = useMemo(() => {
        const citySet = new Set()
        tours.filter(t => Boolean(t.apareceEnLista)).forEach(t => {
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

    // Dropdown options
    const cityOptions = useMemo(() => [
        { value: 'Todas', label: 'Todas las ciudades', icon: '📍' },
        ...availableCities.filter(c => c !== 'Todas').map(c => ({ value: c, label: c, icon: '📍' }))
    ], [availableCities])

    const categoryOptions = useMemo(() => [
        { value: 'Todas', label: 'Todas las categorías', icon: '⛩️' },
        { value: 'Rutas por Japón', label: 'Rutas por Japón', icon: '🗾' },
        { value: 'Parques temáticos', label: 'Parques temáticos', icon: '🎢' },
        { value: 'Experiencias Vip', label: 'Experiencias VIP', icon: '✨' },
    ], [])

    const sortOptions = useMemo(() => [
        { value: 'price-asc', label: 'Precio: Menor a Mayor', icon: '🏷️' },
        { value: 'price-desc', label: 'Precio: Mayor a Menor', icon: '💎' },
        { value: 'alpha-asc', label: 'Nombre: A - Z', icon: '🔤' },
        { value: 'alpha-desc', label: 'Nombre: Z - A', icon: '🔡' },
    ], [])

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

    // Helper: Build WhatsApp URL for single tour or custom booking
    const getTourWhatsAppUrl = (tour, qty = 1, modality = 'anfitrion', date = '') => {
        if (!tour) return WHATSAPP_BASE
        if (tour.whatsappUrl && !qty && !date) return tour.whatsappUrl
        const modalityLabel = modality === 'anfitrion' ? '👑 Anfitrión de Viaje' : '🏮 Asistencia Locataria'
        const unitPrice = modality === 'anfitrion'
            ? (tour.priceAnfitrionNum || tour.priceNum || 800)
            : (tour.priceLocatarioNum || Math.round((tour.priceAnfitrionNum || 800) * 1.5))
        const total = unitPrice * qty
        const msg = `Hola RutaXAsia ⛩️, me interesa cotizar/reservar el tour individual:
📌 *${tour.title}*
📍 Ciudad: ${tour.city || 'Japón'}
⏱️ Duración: ${tour.durationLabel || '1 día'}
🎋 Modalidad: ${modalityLabel}
📅 Fecha deseada: ${formatDateLabel(date) || 'Por definir'}
👥 Pasajeros: ${qty} persona${qty > 1 ? 's' : ''}
💰 Cotización estimada: $${total.toLocaleString('es-MX')} MXN

¿Tienen disponibilidad y más información?`
        return `${WHATSAPP_BASE}${encodeURIComponent(msg)}`
    }

    // State for quick Modality selection popup modal upon clicking "+ Agregar"
    const [modalityModalTour, setModalityModalTour] = useState(null)
    const [chosenModalityOption, setChosenModalityOption] = useState('anfitrion')

    // Toggle tour: If already added, removes it. If not added, opens quick modality choice modal!
    const toggleTour = (tour) => {
        if (!tour) return
        const existing = selectedTours.find(t => t.id === tour.id)
        if (existing) {
            setSelectedTours(prev => prev.filter(t => t.id !== tour.id))
        } else {
            setChosenModalityOption(tourModalities[tour.id] || 'anfitrion')
            setModalityModalTour(tour)
        }
    }

    const confirmAddTourWithModality = (tour, modality) => {
        if (!tour) return
        const chosenDate = tourDates[tour.id] || tomorrowStr
        const chosenQty = tourQuantities[tour.id] || 1
        const priceAnfitrion = tour.priceAnfitrionNum || tour.priceNum || 800
        const priceLocatario = tour.priceLocatarioNum || Math.round(priceAnfitrion * 1.5)
        const unitPrice = modality === 'anfitrion' ? priceAnfitrion : priceLocatario

        setTourModalities(prev => ({ ...prev, [tour.id]: modality }))

        setSelectedTours(prev => {
            const filtered = prev.filter(t => t.id !== tour.id)
            return [...filtered, {
                id: tour.id,
                name: tour.title,
                modality: modality,
                modalityLabel: modality === 'anfitrion' ? '👑 Anfitrión RutaXAsia' : '🏮 Asistencia Locataria',
                price: unitPrice,
                priceAnfitrionNum: priceAnfitrion,
                priceLocatarioNum: priceLocatario,
                date: chosenDate,
                quantity: chosenQty,
            }]
        })
    }

    // Filter & Sort logic (only tours strictly marked as apareceEnLista === true)
    const filteredTours = useMemo(() => {
        let result = tours.filter(t => Boolean(t.apareceEnLista))

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
                <title>{isWhatsAppMode ? 'Tours Individuales en Japón (Atención WhatsApp) | RutaXAsia' : 'Tours Individuales en Japón | RutaXAsia'}</title>
                <meta
                    name="description"
                    content="Explora y agrega tours individuales a tu medida en Tokio, Kioto, Osaka y más. Arma tu propio pase de abordar personalizado con atención vía WhatsApp."
                />
            </Helmet>

            {/* Hero Section */}
            <div className="tours-indiv-hero">
                <div className="container">
                    <span className="tours-indiv-tag">
                        {isWhatsAppMode ? '💬 ATENCIÓN DIRECTA POR WHATSAPP' : '⛩️ Catálogo Oficial de Experiencias'}
                    </span>
                    <h1 className="tours-indiv-title">Tours Individuales en Japón</h1>
                    <p className="tours-indiv-excerpt">
                        {isWhatsAppMode
                            ? 'Selecciona tus tours favoritos, fecha y pasajeros para armar tu cotización completa o contactar directamente a nuestros anfitriones por WhatsApp.'
                            : 'Selecciona fecha y personas directamente en cada tour para armar tu pase de abordar. Haz clic en el + para conocer todos los detalles sin salir de la página.'}
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
                        {/* Custom City Filter Dropdown */}
                        <CustomDropdown
                            value={selectedCity}
                            onChange={setSelectedCity}
                            options={cityOptions}
                            ariaLabel="Filtrar por ciudad"
                        />

                        {/* Custom Category Filter Dropdown */}
                        <CustomDropdown
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={categoryOptions}
                            ariaLabel="Filtrar por categoría"
                        />

                        {/* Custom Sort Filter Dropdown */}
                        <CustomDropdown
                            value={sortBy}
                            onChange={setSortBy}
                            options={sortOptions}
                            ariaLabel="Ordenar tours"
                        />
                    </div>
                </div>

                {/* 2-Column Layout: Left Sidebar Sticky Ticket | Right Grid of CMS Cards */}
                <div className="tours-indiv-layout">
                    {/* Left Column: Floating Ticket */}
                    <div className="tours-indiv-sidebar">
                        {(() => {
                            const totalToursPrice = selectedTours.reduce((sum, t) => sum + ((Number(t.price) || 0) * (Number(t.quantity) || 1)), 0)
                            return (
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
                                        price: (Number(t.price) || 0) * (Number(t.quantity) || 1)
                                    }))}
                                    selectedComps={[]}
                                    basePrice={0}
                                    extraTotal={totalToursPrice}
                                    hideQuantity={true}
                                    customReserveBtnText={totalToursPrice > 0 ? `💳 Reservar ($${totalToursPrice.toLocaleString('es-MX')} MXN)` : '💳 Reservar Tours'}
                                    customWhatsAppBtnText="💬 Consultar por WhatsApp"
                                    onOpenCheckout={() => {
                                        if (selectedTours.length === 0) {
                                            alert('Por favor selecciona al menos un tour antes de proceder.')
                                            return
                                        }
                                        setIsCheckoutOpen(true)
                                    }}
                                    onRemoveTour={(tourIdOrName) => setSelectedTours(prev => prev.filter(t => t.id !== tourIdOrName && t.name !== tourIdOrName && !t.name.includes(tourIdOrName)))}
                                />
                            )
                        })()}
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

                                                {/* Card Footer: Price (1 single row) & Add Button */}
                                                <div className="tours-indiv-card-footer">
                                                    <div className="tours-indiv-price-col">
                                                        <span className="tours-indiv-price-label">
                                                            {currentQty > 1 ? `${formatPriceNumOnly(unitPrice)} × ${currentQty}` : 'DESDE'}
                                                        </span>
                                                        <div className="tours-indiv-price-val-wrap">
                                                            <strong className="tours-indiv-price-val">
                                                                {formatPriceNumOnly(tourTotalForQty)}
                                                            </strong>
                                                            <span className="tours-indiv-price-currency">MXN</span>
                                                        </div>
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
                {detailDrawerTour && (() => {
                    const isDrawerTourAdded = selectedTours.some(t => t.id === detailDrawerTour.id)
                    const currentDrawerModality = tourModalities[detailDrawerTour.id] || 'anfitrion'
                    const currentDrawerDate = tourDates[detailDrawerTour.id] || tomorrowStr
                    const currentDrawerQty = tourQuantities[detailDrawerTour.id] || 1

                    const drawerPriceAnfitrion = detailDrawerTour.priceAnfitrionNum || detailDrawerTour.priceNum || 800
                    const drawerPriceLocatario = detailDrawerTour.priceLocatarioNum || Math.round(drawerPriceAnfitrion * 1.5)
                    const drawerActivePrice = currentDrawerModality === 'anfitrion' ? drawerPriceAnfitrion : drawerPriceLocatario
                    const drawerTotalPrice = drawerActivePrice * currentDrawerQty

                    return (
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

                                {/* Detailed Description */}
                                <div className="tours-drawer-section">
                                    <h3>⛩️ Descripción del Tour</h3>
                                    <div className="tours-drawer-desc-content">
                                        {(detailDrawerTour.descripcinAmplia || detailDrawerTour.shortDescription || detailDrawerTour.excerpt) ? (
                                            (detailDrawerTour.descripcinAmplia || detailDrawerTour.shortDescription || detailDrawerTour.excerpt)
                                                .split('\n')
                                                .filter(p => p.trim())
                                                .map((paragraph, idx) => (
                                                    <p key={idx}>{paragraph}</p>
                                                ))
                                        ) : (
                                            <p>Tour de alta calidad organizado por el equipo oficial de RutaXAsia en Japón.</p>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <a
                                            href={`/tours-individuales/${detailDrawerTour.slug || detailDrawerTour.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                fontSize: '0.84rem',
                                                fontWeight: 700,
                                                color: '#e11d48',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            🌐 Ver página completa del tour →
                                        </a>
                                    </div>
                                </div>

                                {/* Observaciones / Notas si existen */}
                                {(detailDrawerTour.observations || detailDrawerTour.observaciones) && (
                                    <div className="tours-drawer-section" style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '14px 16px' }}>
                                        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400e', margin: '0 0 6px' }}>📝 Observaciones y Recomendaciones</h4>
                                        <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0, lineHeight: 1.5 }}>
                                            {detailDrawerTour.observations || detailDrawerTour.observaciones}
                                        </p>
                                    </div>
                                )}

                                {/* Interactive Modality Selector */}
                                <div className="tours-drawer-section">
                                    <h3>🏮 Modalidad de Asistencia</h3>
                                    <div className="tours-drawer-modalities-grid">
                                        {/* 1. Anfitrión */}
                                        <div
                                            className={`tours-drawer-mod-card ${currentDrawerModality === 'anfitrion' ? 'tours-drawer-mod-card--active' : ''}`}
                                            onClick={() => handleModalityChange(detailDrawerTour.id, 'anfitrion')}
                                        >
                                            <div className="tours-drawer-mod-head">
                                                <span className="tours-drawer-mod-icon">👑</span>
                                                <div>
                                                    <strong>Anfitrión de Viaje</strong>
                                                    <span>Coordinador RutaXAsia</span>
                                                </div>
                                            </div>
                                            <div className="tours-drawer-mod-price">
                                                <strong>{formatPrice(drawerPriceAnfitrion)}</strong>
                                                <span className="tours-drawer-mod-badge">{currentDrawerModality === 'anfitrion' ? '✓ Elegido' : 'Elegir'}</span>
                                            </div>
                                        </div>

                                        {/* 2. Locataria */}
                                        <div
                                            className={`tours-drawer-mod-card ${currentDrawerModality === 'locataria' ? 'tours-drawer-mod-card--active' : ''}`}
                                            onClick={() => handleModalityChange(detailDrawerTour.id, 'locataria')}
                                        >
                                            <div className="tours-drawer-mod-head">
                                                <span className="tours-drawer-mod-icon">🏮</span>
                                                <div>
                                                    <strong>Asistencia Locataria</strong>
                                                    <span>Guía local de la zona</span>
                                                </div>
                                            </div>
                                            <div className="tours-drawer-mod-price">
                                                <strong>{formatPrice(drawerPriceLocatario)}</strong>
                                                <span className="tours-drawer-mod-badge">{currentDrawerModality === 'locataria' ? '✓ Elegido' : 'Elegir'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date and Quantity Config */}
                                <div className="tours-drawer-section">
                                    <div className="tours-drawer-config-row">
                                        <div className="tours-drawer-config-col">
                                            <label>📅 Fecha del Tour</label>
                                            <input
                                                type="date"
                                                className="tours-drawer-date-input"
                                                value={currentDrawerDate}
                                                min={tomorrowStr}
                                                onChange={(e) => handleDateChange(detailDrawerTour.id, e.target.value)}
                                            />
                                        </div>
                                        <div className="tours-drawer-config-col">
                                            <label>👥 Personas</label>
                                            <div className="tours-drawer-qty-wrap">
                                                <button
                                                    type="button"
                                                    className="tours-indiv-qty-btn"
                                                    onClick={() => handleQuantityChange(detailDrawerTour.id, -1)}
                                                    disabled={currentDrawerQty <= 1}
                                                >-</button>
                                                <span className="tours-drawer-qty-val">{currentDrawerQty} {currentDrawerQty === 1 ? 'persona' : 'personas'}</span>
                                                <button
                                                    type="button"
                                                    className="tours-indiv-qty-btn"
                                                    onClick={() => handleQuantityChange(detailDrawerTour.id, 1)}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Sticky Footer */}
                            <div className="tours-drawer-footer">
                                <div className="tours-drawer-footer-price">
                                    <span className="tours-drawer-footer-label">
                                        {currentDrawerModality === 'anfitrion' ? '👑 Anfitrión' : '🏮 Locataria'} ({currentDrawerQty} {currentDrawerQty === 1 ? 'pers' : 'pers'}):
                                    </span>
                                    <div className="tours-drawer-footer-val">
                                        <strong>{formatPriceNumOnly(drawerTotalPrice)}</strong>
                                        <span>MXN</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={`tours-drawer-add-btn${isDrawerTourAdded ? ' tours-drawer-add-btn--added' : ''}`}
                                    onClick={() => {
                                        toggleTour(detailDrawerTour)
                                    }}
                                >
                                    {isDrawerTourAdded ? '✓ Quitar del Pase' : '+ Agregar al Pase'}
                                </button>
                            </div>
                        </>
                    )
                })()}
            </div>

            {/* Modal: Elige la Modalidad de Acompañamiento para este Tour específico al hacer clic en "+ Agregar" */}
            {modalityModalTour && (
                <div className="jtb-modal-overlay" style={{ zIndex: 9999999 }} onClick={() => setModalityModalTour(null)}>
                    <div className="jtb-modal-card" style={{ maxWidth: '540px', padding: '28px 24px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
                        <button className="jtb-modal-close" onClick={() => setModalityModalTour(null)}>&times;</button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '6px' }}>🎟️</span>
                            <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', margin: '0 0 6px', color: 'var(--color-dark)' }}>
                                Elige la Modalidad de Asistencia
                            </h3>
                            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                                Para <strong>{modalityModalTour.title}</strong> (📍 {modalityModalTour.city || 'Japón'}):
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
                            {/* Option 1: Asistencia Locataria */}
                            <div
                                onClick={() => setChosenModalityOption('locataria')}
                                style={{
                                    border: chosenModalityOption === 'locataria' ? '2px solid var(--color-primary, #e11d48)' : '1.5px solid #e2e8f0',
                                    background: chosenModalityOption === 'locataria' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                    borderRadius: '14px',
                                    padding: '14px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: chosenModalityOption === 'locataria' ? '0 4px 12px rgba(225, 29, 72, 0.1)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🏮</span>
                                    <div>
                                        <strong style={{ fontSize: '0.94rem', color: '#1e293b', display: 'block', marginBottom: '3px' }}>
                                            Asistencia Locataria
                                        </strong>
                                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                                            Guía local experto de la zona. Te acompañamos con un locatario bilingüe especializado que conoce las mejores rutas, transportes y gastronomía del lugar.
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-primary, #e11d48)', display: 'block' }}>
                                        {formatPrice(modalityModalTour.priceLocatarioNum || Math.round((modalityModalTour.priceAnfitrionNum || modalityModalTour.priceNum || 800) * 1.5))}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>/ pers</span>
                                </div>
                            </div>

                            {/* Option 2: Anfitrión RutaXAsia */}
                            <div
                                onClick={() => setChosenModalityOption('anfitrion')}
                                style={{
                                    border: chosenModalityOption === 'anfitrion' ? '2px solid var(--color-primary, #e11d48)' : '1.5px solid #e2e8f0',
                                    background: chosenModalityOption === 'anfitrion' ? 'rgba(225, 29, 72, 0.04)' : '#fff',
                                    borderRadius: '14px',
                                    padding: '14px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: chosenModalityOption === 'anfitrion' ? '0 4px 12px rgba(225, 29, 72, 0.1)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>👑</span>
                                    <div>
                                        <strong style={{ fontSize: '0.94rem', color: '#1e293b', display: 'block', marginBottom: '3px' }}>
                                            Anfitrión RutaXAsia
                                        </strong>
                                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                                            Coordinador exclusivo de nuestro equipo. Un anfitrión de nuestro equipo te acompañará durante todo el recorrido brindando asistencia VIP personalizada.
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-primary, #e11d48)', display: 'block' }}>
                                        {formatPrice(modalityModalTour.priceAnfitrionNum || modalityModalTour.priceNum || 800)}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>/ pers</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="jtb-ticket-cta"
                            onClick={() => {
                                confirmAddTourWithModality(modalityModalTour, chosenModalityOption)
                                setModalityModalTour(null)
                            }}
                            style={{ width: '100%', padding: '13px', fontSize: '0.98rem', borderRadius: '12px' }}
                        >
                            ➕ Agregar Tour al Pase de Abordar
                        </button>
                    </div>
                </div>
            )}

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
