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

    // Selected Individual Tours Cart: [{ id, name, price, date, quantity, passengerNames }]
    const [selectedTours, setSelectedTours] = useState([])
    // Pending date pickers for tours: { [tourId]: '2026-10-18' }
    const [tourDates, setTourDates] = useState({})

    // Modal state for configuring tour before adding
    const [configuringTour, setConfiguringTour] = useState(null)
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
            // Already added -> remove or allow re-configuring
            setSelectedTours(prev => prev.filter(t => t.id !== tour.id))
            return
        }

        const defaultDate = tourDates[tour.id] || new Date().toISOString().split('T')[0]
        const defaultQty = selectorData?.adults || 1
        setConfiguringTour(tour)
        setModalDate(defaultDate)
        setModalQuantity(defaultQty)
        setModalNames(Array(defaultQty).fill(''))
    }

    const saveConfiguredTour = () => {
        if (!configuringTour) return
        const formattedNames = modalNames.map(n => n.trim()).filter(Boolean)

        setSelectedTours(prev => {
            const filtered = prev.filter(t => t.id !== configuringTour.id)
            return [...filtered, {
                id: configuringTour.id,
                name: configuringTour.title,
                price: configuringTour.priceNum || 0,
                date: modalDate,
                quantity: modalQuantity,
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
                                                        <span className="tours-indiv-date-chip-value">{formatDateLabel(currentDate)} ▾</span>
                                                    </div>
                                                    <input
                                                        type="date"
                                                        className="tours-indiv-date-chip-native"
                                                        value={currentDate}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        onChange={(e) => {
                                                            e.stopPropagation()
                                                            handleDateChange(tour.id, e.target.value)
                                                        }}
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

            {/* Modal for configuring Tour date, quantity & passenger names */}
            {configuringTour && (
                <div className="jtb-modal-overlay animate-slide-in" style={{ zIndex: 99999 }}>
                    <div className="jtb-modal-card" style={{ maxWidth: '580px', padding: '32px 28px', textAlign: 'left' }}>
                        <button className="jtb-modal-close" onClick={() => setConfiguringTour(null)}>&times;</button>
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                            <img
                                src={configuringTour.image}
                                alt={configuringTour.title}
                                style={{ width: '76px', height: '76px', borderRadius: '16px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop' }}
                            />
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                                    Configurar Reserva de Tour
                                </span>
                                <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}>
                                    {configuringTour.title}
                                </h3>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '2px', fontWeight: '700' }}>
                                    {configuringTour.priceText || formatPrice(configuringTour.priceNum)} MXN / persona
                                </div>
                            </div>
                        </div>

                        {/* Date and Quantity Selector */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-dark)', marginBottom: '10px' }}>
                                📋 Nombre(s) de la(s) persona(s) que asistirán:
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                                {modalNames.map((nameVal, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#666', width: '85px', flexShrink: 0 }}>
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
                                            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.88rem' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer Summary & CTA */}
                        <div style={{ background: '#f8f9fa', padding: '16px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <span style={{ fontSize: '0.78rem', color: '#666', display: 'block' }}>Total por {modalQuantity} persona(s):</span>
                                <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                                    {formatPrice((configuringTour.priceNum || 0) * modalQuantity)} MXN
                                </strong>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ borderRadius: '100px', padding: '10px 24px', fontWeight: '800', fontSize: '0.9rem' }}
                                onClick={saveConfiguredTour}
                            >
                                ✓ Confirmar y Agregar
                            </button>
                        </div>
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
