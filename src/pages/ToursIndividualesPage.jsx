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

    // Selected Individual Tours Cart: [{ id, name, price, date }]
    const [selectedTours, setSelectedTours] = useState([])
    // Pending date pickers for tours: { [tourId]: '2026-10-18' }
    const [tourDates, setTourDates] = useState({})

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

    // Toggle tour selection
    const toggleTour = (tour) => {
        const dateForTour = tourDates[tour.id] || new Date().toISOString().split('T')[0]
        setSelectedTours(prev => {
            const exists = prev.some(item => item.id === tour.id)
            if (exists) {
                return prev.filter(item => item.id !== tour.id)
            } else {
                return [...prev, {
                    id: tour.id,
                    name: tour.title,
                    price: tour.priceNum || 0,
                    date: dateForTour
                }]
            }
        })
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
    const passengersCount = adults + children
    const extraTotal = selectedTours.reduce((sum, item) => sum + item.price, 0)
    const totalPrice = extraTotal * passengersCount

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

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
                                name: `${t.name} (📅 ${t.date})`,
                                price: t.price
                            }))}
                            selectedComps={[]}
                            basePrice={0}
                            extraTotal={extraTotal}
                            onOpenCheckout={() => setIsCheckoutOpen(true)}
                        />
                    </div>

                    {/* Right Column: Grid of CMS Tour Cards */}
                    <div className="tours-indiv-grid-wrap">
                        {loading ? (
                            <div className="tours-indiv-loading">
                                <span className="tours-indiv-spinner">⛩️</span>
                                <p>Cargando catálogo oficial de Tours en Japón desde Wix CMS...</p>
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

                                                {/* Date Picker Input per Tour */}
                                                <div className="tours-indiv-date-picker-row">
                                                    <label>📅 Fecha del tour:</label>
                                                    <input
                                                        type="date"
                                                        value={currentDate}
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
                    `Pasajeros: ${adults} Adultos, ${children} Menores. ` +
                    `Tours seleccionados: ${selectedTours.map(t => `${t.name} (📅 ${t.date})`).join('; ') || 'Ninguno'}. ` +
                    `Total estimado: ${formatPrice(totalPrice)} MXN.`
                }
            />
        </div>
    )
}
