import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ItineraryMap from '../components/ItineraryMap'

const WHATSAPP_BASE = 'https://wa.me/525513610083?text='

import TOURS from '../data/tourData'

/* -- SVG icons -- */
function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.215l-.304-.182-2.87.852.852-2.87-.182-.304A8 8 0 1112 20z" />
        </svg>
    )
}

export default function TourDetail() {
    const { slug } = useParams()
    const tour = TOURS[slug]
    const [lightbox, setLightbox] = useState(null)
    const [openFaq, setOpenFaq] = useState(null)
    const [showBar, setShowBar] = useState(false)
    const [activeCity, setActiveCity] = useState(0)

    useEffect(() => { window.scrollTo(0, 0) }, [slug])

    useEffect(() => {
        const onScroll = () => setShowBar(window.scrollY > 500)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    if (!tour) {
        return (
            <div className="td-notfound">
                <h1>Tour no encontrado</h1>
                <p>El viaje que buscás no existe o ya no está disponible.</p>
                <Link to="/" className="btn btn-primary">Volver al inicio</Link>
            </div>
        )
    }

    const waMsg = `SW-Hola! Quiero info sobre el tour "${tour.title}" (${tour.date})`
    const waLink = `${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`
    const priceDisplay = tour.priceMXN ? `${tour.price} / ${tour.priceMXN}` : tour.price
    const isSoldOut = tour.soldOut || tour.spotsLeft === 0

    return (
        <>
            <Helmet>
                <title>{tour.seoTitle}</title>
                <meta name="description" content={tour.seoDescription} />
            </Helmet>

            {/* ===== 1. CINEMATIC HERO — Full screen ===== */}
            <section className="td-hero">
                <img src={tour.heroImage} alt={tour.title} className="td-hero-img" />
                <div className="td-hero-vignette" />
                <div className="td-hero-inner container">
                    <nav className="td-crumb">
                        <Link to="/">Inicio</Link><span>/</span><span>Tours</span><span>/</span><span>{tour.title}</span>
                    </nav>
                    {tour.badge && <span className="td-pill">{tour.badge}</span>}
                    <h1 className="td-hero-h1">{tour.title}</h1>
                    <p className="td-hero-sub">{tour.tagline}</p>
                    <div className="td-hero-chips">
                        {tour.flagIcons.map((f, i) => <img key={i} src={`https://flagcdn.com/w40/${f.code}.png`} alt={f.name} className="td-chip-flag" />)}
                        <span className="td-chip">📅 {tour.date}</span>
                        <span className="td-chip">⏱ {tour.duration}</span>
                        <span className="td-chip">🏙️ {tour.cities}</span>
                    </div>
                    <div className="td-hero-cta-row">
                        {!isSoldOut ? (
                            <a href={waLink} className="td-hero-btn" target="_blank" rel="noopener noreferrer">
                                <WhatsAppIcon /> Reservar — {tour.price}
                            </a>
                        ) : (
                            <span className="td-hero-btn td-hero-btn--sold">SOLD OUT</span>
                        )}
                        {tour.priceMXN && (
                            <span className="td-price-alt">{tour.priceMXN}</span>
                        )}
                        {!tour.groupLimit && tour.spotsLeft > 0 && tour.spotsLeft <= 6 && (
                            <span className="td-spots"><span className="td-spots-dot" />Solo {tour.spotsLeft} lugares</span>
                        )}
                    </div>
                    {(tour.priceSubtext || tour.anticipoText || tour.groupLimit) && !isSoldOut && (
                        <div className="td-hero-pricing-details">
                            {tour.priceSubtext && <span className="td-pricing-tag">{tour.priceSubtext}</span>}
                            {tour.anticipoText && <span className="td-pricing-tag">{tour.anticipoText}</span>}
                            {tour.groupLimit && <span className="td-pricing-tag td-pricing-tag--urgent">{tour.groupLimit}</span>}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== 2. BENTO GALLERY ===== */}
            <section className="td-gallery container">
                <div className="td-bento">
                    {tour.gallery.map((g, i) => (
                        <div key={i} className={`td-bento-cell ${i === 0 ? 'td-bento-big' : ''}`} onClick={() => setLightbox(i)}>
                            <img src={g.img} alt={g.caption} />
                            <span className="td-bento-cap">{g.caption}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== LIGHTBOX ===== */}
            {lightbox !== null && (
                <div className="td-lb" onClick={() => setLightbox(null)}>
                    <button className="td-lb-close" onClick={() => setLightbox(null)}>✕</button>
                    <button className="td-lb-nav td-lb-prev" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + tour.gallery.length) % tour.gallery.length) }}>‹</button>
                    <div className="td-lb-wrap" onClick={e => e.stopPropagation()}>
                        <img src={tour.gallery[lightbox].img} alt="" />
                        <p className="td-lb-cap">{tour.gallery[lightbox].caption}</p>
                    </div>
                    <button className="td-lb-nav td-lb-next" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % tour.gallery.length) }}>›</button>
                    <span className="td-lb-count">{lightbox + 1} / {tour.gallery.length}</span>
                </div>
            )}

            {/* ===== 3. OVERVIEW — Editorial text ===== */}
            <section className="td-editorial container">
                <h2 className="td-section-label">Sobre este viaje</h2>
                <p className="td-editorial-text">{tour.overviewText || tour.tagline} Un viaje con guía hispanohablante, hospedaje, vuelos y experiencias únicas incluidas. {tour.duration} que cambiarán tu perspectiva del mundo.</p>
                {tour.hospedaje && (
                    <div className="td-hospedaje">
                        <span className="td-hospedaje-icon">🏨</span>
                        <span className="td-hospedaje-text"><strong>Hospedaje:</strong> {tour.hospedaje}</span>
                    </div>
                )}
            </section>

            {/* ===== 4. ITINERARY — Map + Detail Split ===== */}
            <section className="td-tabs-section container">
                <h2 className="td-section-label">Itinerario día por día</h2>
                <p className="td-tabs-subtitle">Seleccioná una ciudad en el mapa para ver el detalle</p>

                <ItineraryMap
                    chapters={tour.chapters}
                    activeCity={activeCity}
                    onCityClick={setActiveCity}
                />
            </section>

            {/* ===== 5. SPLIT CARD — Incluye / No incluye ===== */}
            <section className="td-split-section container">
                <h2 className="td-section-label">¿Qué incluye?</h2>
                <div className="td-split-card">
                    <div className="td-split-yes">
                        <h3 className="td-split-title">Incluye</h3>
                        <ul className="td-split-list">
                            {tour.includes.map((item, i) => <li key={i}><span className="td-split-check">✓</span>{item}</li>)}
                        </ul>
                    </div>
                    <div className="td-split-no">
                        <h3 className="td-split-title">No incluye</h3>
                        <ul className="td-split-list">
                            {tour.notIncludes.map((item, i) => <li key={i}><span className="td-split-x">✕</span>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ===== 6. FAQ ===== */}
            <section className="td-faq-section container">
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

            {/* ===== 7. BOTTOM CTA ===== */}
            <section className="td-bottom-cta">
                <img src={tour.heroImage} alt="" className="td-bottom-bg" />
                <div className="td-bottom-overlay" />
                <div className="td-bottom-inner container">
                    <h2 className="td-bottom-h2">¿Listo para vivir {tour.title}?</h2>
                    <p className="td-bottom-p">Escríbenos y reserva tu lugar antes de que se agoten.</p>
                    <a href={waLink} className="td-bottom-btn" target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon /> Reservar — {tour.price}
                    </a>
                    {tour.priceMXN && <p className="td-bottom-price-alt">{tour.priceMXN}</p>}
                </div>
            </section>

            {/* ===== FLOATING BAR ===== */}
            <div className={`td-float ${showBar ? 'td-float--show' : ''}`}>
                <div className="td-float-inner container">
                    <div className="td-float-left">
                        <strong>{tour.title}</strong>
                        <span>{tour.date} · {tour.duration}</span>
                    </div>
                    <div className="td-float-right">
                        <span className="td-float-price">{tour.price}</span>
                        <a href={waLink} className="td-float-btn" target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon /> Reservar
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}
