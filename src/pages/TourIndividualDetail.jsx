import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchTourIndividuales } from '../lib/wixClient'
import CheckoutModal from '../components/JaponTripBuilder/CheckoutModal'
import './TourIndividualDetail.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

// Default fallback tour for showcase purposes
const FALLBACK_SHOWCASE_TOUR = {
    id: 'showcase-harry-potter',
    slug: 'the-wizarding-world-of-harry-potter-tokyo',
    title: 'The Wizarding World of Harry Potter (Tokyo)',
    tituloDePgina: 'The Wizarding World of Harry Potter (Tokyo)',
    category: 'Parques temáticos',
    city: 'Tokio',
    days: '1 día',
    hours: '8 horas',
    durationLabel: '1 día (8 horas)',
    priceAnfitrion: '$800 MXN',
    priceAnfitrionNum: 800,
    priceLocatario: '$1,200 MXN',
    priceLocatarioNum: 1200,
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&fit=crop&q=85',
    excerpt: 'Pase normal de acceso al parque temático y recorrido interactivo por los sets de filmación originales.',
    shortDescription: 'Pase normal de acceso al parque temático y recorrido interactivo por los sets de filmación originales.',
    fullDescription: `Sumérgete en el universo mágico de Warner Bros Studio Tour Tokyo - The Making of Harry Potter. 

Este increíble recorrido te permitirá caminar por el Gran Comedor de Hogwarts, abordar el Expreso de Hogwarts en el Andén 9 ¾, recorrer el Callejón Diagon y descubrir los secretos mejor guardados de los efectos especiales y vestuario de la saga.

La experiencia incluye la coordinación de tus accesos con horarios garantizados, recomendaciones exclusivas de transporte en el metro de Tokio y el respaldo permanente del equipo de RutaXAsia durante tu visita.`,
    observaciones: 'Te recomendamos llegar 20 minutos antes de tu horario asignado. El parque cuenta con lockers y restaurantes temáticos para disfrutar de la famosa cerveza de mantequilla.',
}

function generateSlug(title, id) {
    if (!title) return id || 'tour'
    return String(title)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}

export default function TourIndividualDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [tours, setTours] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentTour, setCurrentTour] = useState(null)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    // Interactive booking state
    const [modality, setModality] = useState('anfitrion') // 'anfitrion' | 'locatario'
    const [travelers, setTravelers] = useState(2)
    const [openFaq, setOpenFaq] = useState(null)

    // Minimum date is tomorrow
    const tomorrowStr = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        return d.toISOString().split('T')[0]
    }, [])
    const [selectedDate, setSelectedDate] = useState(tomorrowStr)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [slug])

    useEffect(() => {
        let isMounted = true
        async function loadTours() {
            setLoading(true)
            const data = await fetchTourIndividuales()
            if (isMounted) {
                setTours(data || [])
                
                // Find tour by slug, ID, CMS link or title
                let match = null
                if (data && data.length > 0) {
                    const rawCleanSlug = (slug || '').toLowerCase().trim()
                    const cleanSlug = decodeURIComponent(rawCleanSlug)
                    match = data.find(t => {
                        const tSlug = (t.slug || '').toLowerCase()
                        const tId = (t.id || '').toLowerCase()
                        const genSlug = generateSlug(t.title || t.tituloDePgina).toLowerCase()
                        const cmsLink = (t.cmsLink || '').toLowerCase()

                        return tSlug === cleanSlug ||
                               tSlug === rawCleanSlug ||
                               tId === cleanSlug ||
                               genSlug === cleanSlug ||
                               cmsLink.includes(cleanSlug) ||
                               (cleanSlug && cmsLink.endsWith(cleanSlug)) ||
                               (t.title && t.title.toLowerCase() === cleanSlug.replace(/-/g, ' ')) ||
                               (t.title && t.title.toLowerCase().includes(cleanSlug.replace(/-/g, ' '))) ||
                               (t.tituloDePgina && t.tituloDePgina.toLowerCase().includes(cleanSlug.replace(/-/g, ' ')))
                    })
                }

                // If not found in CMS, use the showcase tour so the page ALWAYS displays cleanly
                setCurrentTour(match || (slug ? { ...FALLBACK_SHOWCASE_TOUR, slug, title: slug.replace(/-/g, ' ') } : FALLBACK_SHOWCASE_TOUR))
                setLoading(false)
            }
        }
        loadTours()
        return () => { isMounted = false }
    }, [slug])

    const tour = currentTour || FALLBACK_SHOWCASE_TOUR
    const displayTitle = tour.tituloDePgina || tour.title || 'Tour Individual'
    const displaySubtitle = tour.shortDescription || tour.descripcinAmplia || tour.excerpt || 'Pase y experiencia oficial en Japón con la coordinación de RutaXAsia.'
    const fullDescriptionText = tour.fullDescription || tour.descripcinAmplia1 || tour.descripcinAmplia || tour.description || tour.shortDescription || tour.excerpt || 'Disfruta de esta experiencia oficial en Japón con la coordinación y respaldo del equipo de RutaXAsia.'
    const displayDuration = tour.durationLabel || ((tour.days && tour.hours) ? `${tour.days} (${tour.hours})` : (tour.days || tour.hours || '1 día'))
    const displayCity = tour.city || 'Japón'

    const priceAnfitrion = tour.priceAnfitrionNum || tour.priceNum || 800
    const priceLocatario = tour.priceLocatarioNum || Math.round(priceAnfitrion * 1.5)
    const unitPrice = modality === 'anfitrion' ? priceAnfitrion : priceLocatario
    const totalPrice = unitPrice * travelers

    const formatPrice = (n) => `$${(n || 0).toLocaleString('es-MX')}`

    const formatDateLabel = (dStr) => {
        if (!dStr) return 'Fecha a coordinar'
        const parts = dStr.split('-')
        if (parts.length === 3) {
            const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
            const mIdx = parseInt(parts[1], 10) - 1
            return `${parseInt(parts[2], 10)} ${months[mIdx]} ${parts[0]}`
        }
        return dStr
    }

    const modalityLabel = modality === 'anfitrion' 
        ? '👑 Anfitrión de Viaje (Coordinador RutaXAsia)' 
        : '🏮 Asistencia Locataria (Guía local experto)'

    // Construct WhatsApp reservation URL (using CMS whatsapp column if provided)
    const waMessage = `SW-Hola RutaXAsia! Quiero reservar la siguiente experiencia individual en Japón:

🎟️ TOUR: ${displayTitle}
📍 Destino: ${displayCity}
🎎 Modalidad: ${modalityLabel}
📅 Fecha deseada: ${formatDateLabel(selectedDate)}
⏱️ Duración: ${displayDuration}
👥 Pasajeros: ${travelers} persona${travelers > 1 ? 's' : ''}
💰 Total Estimado: ${formatPrice(totalPrice)} MXN (${formatPrice(unitPrice)} MXN c/u)

¿Me podrían confirmar disponibilidad y los pasos para asegurar los lugares?`

    const baseWa = tour.whatsappUrl 
        ? (tour.whatsappUrl.startsWith('http') ? tour.whatsappUrl : `https://wa.me/${String(tour.whatsappUrl).replace(/\D/g, '')}`) 
        : WHATSAPP_BASE

    const waLink = baseWa.includes('text=') 
        ? baseWa 
        : (baseWa.includes('?') ? `${baseWa}&text=${encodeURIComponent(waMessage)}` : `${baseWa}?text=${encodeURIComponent(waMessage)}`)

    // Related tours (same category or random other tours)
    const relatedTours = useMemo(() => {
        if (!tours || tours.length === 0) return []
        return tours
            .filter(t => t.id !== tour.id && t.title !== tour.title)
            .slice(0, 3)
    }, [tours, tour.id, tour.title])

    const faqs = [
        {
            q: '¿Cómo funciona la reserva por WhatsApp?',
            a: 'Al hacer clic en "Reservar y Coordinar por WhatsApp", te comunicarás directamente con un asesor de RutaXAsia con todos los detalles de tu tour ya completados. Coordinaremos fechas exactas, disponibilidad y te brindaremos asistencia personalizada.'
        },
        {
            q: '¿Cuál es la diferencia entre Anfitrión y Asistencia Locataria?',
            a: 'El Anfitrión de Viaje es un coordinador del equipo oficial de RutaXAsia que te acompaña y orienta en traslados. La Asistencia Locataria es un guía local experto de la zona en Japón para explicaciones históricas y culturales más profundas.'
        },
        {
            q: '¿Puedo cambiar la fecha de mi tour después de reservar?',
            a: 'Sí, sujeto a disponibilidad y con previo aviso coordinado directamente a través de nuestro canal de WhatsApp.'
        }
    ]

    const pageSeoTitle = tour.seoTitle
        ? (tour.seoTitle.toLowerCase().includes('rutaxasia') ? tour.seoTitle : `${tour.seoTitle} | RutaXAsia`)
        : `${displayTitle} — Tour Individual en Japón | RutaXAsia`

    const pageSeoDescription = tour.seoDescription || displaySubtitle || (tour.excerpt ? `${tour.excerpt}` : `${displayTitle}. Reserva tu tour individual en Japón con RutaXAsia.`)

    return (
        <div className="tour-detail-page">
            <Helmet>
                <title>{pageSeoTitle}</title>
                <meta name="description" content={pageSeoDescription} />
                <meta name="robots" content="index, follow" />
            </Helmet>

            {/* Sticky Breadcrumb Bar */}
            <div className="tour-detail-breadcrumb-bar">
                <div className="container tour-detail-bc-container">
                    <Link to="/" className="tour-bc-link">Inicio</Link>
                    <span className="tour-bc-sep">›</span>
                    <Link to="/tours-individuales" className="tour-bc-link">Tours Individuales</Link>
                    <span className="tour-bc-sep">›</span>
                    <span className="tour-bc-current">{displayTitle}</span>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="container tour-detail-container">
                <div className="tour-detail-layout">
                    {/* LEFT COLUMN: Main Tour Showcase */}
                    <div className="tour-detail-main-col">
                        {/* Title and Badges Section */}
                        <div className="tour-detail-header-block">
                            <div className="tour-detail-tags-row">
                                {displayCity && (
                                    <span className="tour-tag-pill tour-tag-city">
                                        📍 {displayCity}
                                    </span>
                                )}
                                {tour.category && (
                                    <span className="tour-tag-pill tour-tag-cat">
                                        ⛩️ {tour.category}
                                    </span>
                                )}
                                {displayDuration && (
                                    <span className="tour-tag-pill tour-tag-dur">
                                        ⏱️ {displayDuration}
                                    </span>
                                )}
                            </div>

                            <h1 className="tour-detail-h1">{displayTitle}</h1>
                            {displaySubtitle && (
                                <p className="tour-detail-excerpt">{displaySubtitle}</p>
                            )}
                        </div>

                        {/* High-Resolution Hero Banner */}
                        <div className="tour-detail-hero-banner">
                            <img
                                src={tour.image}
                                alt={displayTitle}
                                className="tour-detail-hero-img"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&fit=crop'
                                }}
                            />
                            <div className="tour-detail-hero-badge-overlay">
                                <span>🇯🇵 Experiencia Oficial en Japón</span>
                            </div>
                        </div>

                        {/* Highlights Grid */}
                        <div className="tour-detail-highlights-grid">
                            <div className="tour-hl-card">
                                <span className="tour-hl-icon">📍</span>
                                <div>
                                    <span className="tour-hl-label">Destino</span>
                                    <strong className="tour-hl-val">{displayCity}</strong>
                                </div>
                            </div>
                            <div className="tour-hl-card">
                                <span className="tour-hl-icon">⏱️</span>
                                <div>
                                    <span className="tour-hl-label">Duración</span>
                                    <strong className="tour-hl-val">{displayDuration}</strong>
                                </div>
                            </div>
                            <div className="tour-hl-card">
                                <span className="tour-hl-icon">💬</span>
                                <div>
                                    <span className="tour-hl-label">Atención</span>
                                    <strong className="tour-hl-val">Español 24/7</strong>
                                </div>
                            </div>
                            <div className="tour-hl-card">
                                <span className="tour-hl-icon">🎟️</span>
                                <div>
                                    <span className="tour-hl-label">Modalidad</span>
                                    <strong className="tour-hl-val">Personalizada</strong>
                                </div>
                            </div>
                        </div>

                        {/* Section: Full Description (Descripción Amplia del CMS) */}
                        <div className="tour-detail-card-section">
                            <h2 className="tour-sec-title">⛩️ Acerca de esta Experiencia</h2>
                            <div className="tour-sec-desc">
                                {fullDescriptionText
                                    .split('\n')
                                    .filter(p => p.trim())
                                    .map((paragraph, idx) => (
                                        <p key={idx}>{paragraph}</p>
                                    ))}
                            </div>
                        </div>

                        {/* Section: Modality Explanation */}
                        <div className="tour-detail-card-section">
                            <h2 className="tour-sec-title">🎎 Modalidades de Acompañamiento Disponibles</h2>
                            <div className="tour-modalities-showcase">
                                <div 
                                    className={`tour-mod-box${modality === 'anfitrion' ? ' tour-mod-box--selected' : ''}`}
                                    onClick={() => setModality('anfitrion')}
                                >
                                    <div className="tour-mod-box-header">
                                        <div className="tour-mod-icon-title">
                                            <span className="tour-mod-icon">👑</span>
                                            <div>
                                                <h4>Anfitrión de Viaje RutaXAsia</h4>
                                                <span className="tour-mod-badge">Opción Más Recomendada</span>
                                            </div>
                                        </div>
                                        <span className="tour-mod-box-price">{formatPrice(priceAnfitrion)} MXN</span>
                                    </div>
                                    <p className="tour-mod-box-desc">
                                        Coordinador oficial de RutaXAsia que te acompaña, orienta en transporte y asiste en cada momento para que disfrutes sin preocupaciones.
                                    </p>
                                </div>

                                <div 
                                    className={`tour-mod-box${modality === 'locatario' ? ' tour-mod-box--selected' : ''}`}
                                    onClick={() => setModality('locatario')}
                                >
                                    <div className="tour-mod-box-header">
                                        <div className="tour-mod-icon-title">
                                            <span className="tour-mod-icon">🏮</span>
                                            <div>
                                                <h4>Asistencia Locataria</h4>
                                                <span className="tour-mod-badge tour-mod-badge--local">Guía Local de la Zona</span>
                                            </div>
                                        </div>
                                        <span className="tour-mod-box-price">{formatPrice(priceLocatario)} MXN</span>
                                    </div>
                                    <p className="tour-mod-box-desc">
                                        Guía especializado de la zona que te sumerge en la historia, tradiciones y rincones auténticos del destino.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Observations from CMS */}
                        {(tour.observaciones || tour.observations) && (
                            <div className="tour-detail-card-section tour-sec-obs-card">
                                <h3 className="tour-obs-title">📝 Observaciones y Recomendaciones</h3>
                                <p className="tour-obs-text">{tour.observaciones || tour.observations}</p>
                            </div>
                        )}

                        {/* Section: FAQs */}
                        <div className="tour-detail-card-section">
                            <h2 className="tour-sec-title">❓ Preguntas Frecuentes</h2>
                            <div className="tour-faqs-list">
                                {faqs.map((faq, i) => (
                                    <div key={i} className={`tour-faq-item${openFaq === i ? ' tour-faq-item--open' : ''}`}>
                                        <button 
                                            type="button" 
                                            className="tour-faq-question"
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        >
                                            <span>{faq.q}</span>
                                            <span className="tour-faq-toggle">{openFaq === i ? '−' : '+'}</span>
                                        </button>
                                        {openFaq === i && (
                                            <div className="tour-faq-answer">
                                                <p>{faq.a}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Booking & Pricing Sticky Widget */}
                    <div className="tour-detail-sidebar-col">
                        <div className="tour-booking-sticky-card">
                            <div className="tour-booking-header">
                                <span className="tour-booking-label">Precio por persona</span>
                                <div className="tour-booking-price-row">
                                    <strong className="tour-booking-main-price">{formatPrice(unitPrice)}</strong>
                                    <span className="tour-booking-currency">MXN</span>
                                </div>
                                <span className="tour-booking-subtext">Impuestos y coordinación incluidos</span>
                            </div>

                            <div className="tour-booking-form">
                                {/* Modality Selector */}
                                <div className="tour-booking-field">
                                    <label className="tour-field-label">1. Modalidad de Acompañamiento</label>
                                    <div className="tour-booking-mod-switch">
                                        <button
                                            type="button"
                                            className={`tour-booking-mod-btn${modality === 'anfitrion' ? ' tour-booking-mod-btn--active' : ''}`}
                                            onClick={() => setModality('anfitrion')}
                                        >
                                            <span>👑 Anfitrión</span>
                                            <strong>{formatPrice(priceAnfitrion)}</strong>
                                        </button>
                                        <button
                                            type="button"
                                            className={`tour-booking-mod-btn${modality === 'locatario' ? ' tour-booking-mod-btn--active' : ''}`}
                                            onClick={() => setModality('locatario')}
                                        >
                                            <span>🏮 Locataria</span>
                                            <strong>{formatPrice(priceLocatario)}</strong>
                                        </button>
                                    </div>
                                </div>

                                {/* Date Selector */}
                                <div className="tour-booking-field">
                                    <label className="tour-field-label">2. Fecha del Tour</label>
                                    <div className="tour-booking-date-wrap">
                                        <input
                                            type="date"
                                            min={tomorrowStr}
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="tour-booking-date-input"
                                        />
                                        <span className="tour-booking-date-display">
                                            📅 {formatDateLabel(selectedDate)}
                                        </span>
                                    </div>
                                </div>

                                {/* Travelers Counter */}
                                <div className="tour-booking-field">
                                    <label className="tour-field-label">3. Número de Personas</label>
                                    <div className="tour-booking-qty-control">
                                        <button
                                            type="button"
                                            className="tour-qty-btn"
                                            disabled={travelers <= 1}
                                            onClick={() => setTravelers(prev => Math.max(1, prev - 1))}
                                        >
                                            −
                                        </button>
                                        <span className="tour-qty-val">
                                            {travelers} persona{travelers > 1 ? 's' : ''}
                                        </span>
                                        <button
                                            type="button"
                                            className="tour-qty-btn"
                                            disabled={travelers >= 12}
                                            onClick={() => setTravelers(prev => Math.min(12, prev + 1))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Summary & Calculation */}
                                <div className="tour-booking-calc-summary">
                                    <div className="tour-calc-row">
                                        <span>{formatPrice(unitPrice)} MXN × {travelers} pers.</span>
                                        <strong>{formatPrice(totalPrice)} MXN</strong>
                                    </div>
                                    <div className="tour-calc-total-row">
                                        <span>Total Estimado:</span>
                                        <strong className="tour-calc-total-val">{formatPrice(totalPrice)} MXN</strong>
                                    </div>
                                </div>

                                {/* Main Online Buy / Checkout Action Button */}
                                <button
                                    type="button"
                                    className="tour-booking-buy-btn"
                                    onClick={() => setIsCheckoutOpen(true)}
                                >
                                    💳 Comprar / Reservar en Línea
                                </button>

                                {/* Secondary WhatsApp Action Button */}
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tour-booking-wa-btn"
                                >
                                    💬 Cotizar / Coordinar por WhatsApp
                                </a>

                                <div className="tour-booking-guarantee-strip">
                                    <span>🔒 Pago 100% seguro y confirmación inmediata</span>
                                </div>

                                {/* Back Link */}
                                <Link to="/tours-individuales" className="tour-booking-back-btn">
                                    ← Ver todos los Tours en Japón
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Experiences Section */}
                {relatedTours.length > 0 && (
                    <div className="tour-related-section">
                        <div className="tour-related-header">
                            <h2>🌸 Otras Experiencias Recomendadas en Japón</h2>
                            <Link to="/tours-individuales" className="tour-related-see-all">
                                Explorar catálogo completo →
                            </Link>
                        </div>
                        <div className="tour-related-grid">
                            {relatedTours.map((relTour) => (
                                <div 
                                    key={relTour.id} 
                                    className="tour-related-card"
                                    onClick={() => navigate(`/tours-individuales/${relTour.slug || relTour.id}`)}
                                >
                                    <div className="tour-related-img-box">
                                        <img src={relTour.image} alt={relTour.title} />
                                        {relTour.city && (
                                            <span className="tour-related-city-badge">📍 {relTour.city}</span>
                                        )}
                                    </div>
                                    <div className="tour-related-body">
                                        <h4>{relTour.title}</h4>
                                        <div className="tour-related-footer">
                                            <span className="tour-related-price">
                                                Desde <strong>{relTour.priceAnfitrion || relTour.priceText || '$800 MXN'}</strong>
                                            </span>
                                            <span className="tour-related-btn">Ver Tour →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Wix Online Checkout & Pasarela Modal */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={{ name: displayTitle, colors: { primary: '#e11d48', bg: '#fff' } }}
                estilo="Tour Individual"
                totalPrice={totalPrice}
                isWhatsAppMode={false}
                desglose={
                    `Tour: ${displayTitle} (${displayCity}). ` +
                    `Modalidad: ${modalityLabel}. ` +
                    `Fecha de tour: ${formatDateLabel(selectedDate)}. ` +
                    `Duración: ${displayDuration}. ` +
                    `Viajeros: ${travelers} persona${travelers > 1 ? 's' : ''} (${formatPrice(unitPrice)} MXN c/u). ` +
                    `Total: ${formatPrice(totalPrice)} MXN.`
                }
            />
        </div>
    )
}
