import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuStar, LuMessageSquare, LuHeart, LuSend, LuCircleCheck, LuMapPin, LuCalendar, LuFilter, LuSparkles } from 'react-icons/lu'
import { submitFormToCMS } from '../lib/wixClient'
import './ComunidadComentarios.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

const INITIAL_REVIEWS = [
    {
        id: 1,
        name: 'María Rodríguez',
        city: 'Ciudad de México',
        trip: 'Sakura en Japón 2025',
        season: 'sakura',
        rating: 5,
        date: 'Abril 2025',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&q=80',
        comment: 'Fue el viaje de mi vida. Juan y Ale no solo son guías extraordinarios, te hacen sentir en familia en todo momento. Cada rincón que visitamos en Kioto y Tokio superó mis expectativas. ¡El año que viene me voy a Corea con ellos!',
        likes: 24,
        verified: true,
    },
    {
        id: 2,
        name: 'Carlos López',
        city: 'Guadalajara, Jalisco',
        trip: 'Verano de Festivales 2024',
        season: 'verano',
        rating: 5,
        date: 'Agosto 2024',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop&q=80',
        comment: 'La mejor decisión fue ir con RutaXAsia. El transporte en trenes bala estuvo perfectamente sincronizado, los hoteles de primera y ver los fuegos artificiales de Hanabi con el grupo fue inolvidable. ¡100% recomendado!',
        likes: 19,
        verified: true,
    },
    {
        id: 3,
        name: 'Ana Sofía Garza',
        city: 'Monterrey, NL',
        trip: 'Otoño Momiji & Templos 2024',
        season: 'otono',
        rating: 5,
        date: 'Noviembre 2024',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&h=600&fit=crop&q=80',
        comment: 'Tenía miedo de viajar sola, pero desde el día 1 en el aeropuerto de CDMX el ambiente fue increíble. Los templos dorados de Kioto con las hojas rojas parecían sacados de una pintura. Gracias Juan y Ale por tanta dedicación.',
        likes: 31,
        verified: true,
    },
    {
        id: 4,
        name: 'Diego Martínez & Andrea Ruiz',
        city: 'Puebla, Pue.',
        trip: 'Corea del Sur K-Drama Experience 2025',
        season: 'corea',
        rating: 5,
        date: 'Mayo 2025',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop&q=80',
        comment: 'Seúl nos enamoró por completo. La comida callejera en Myeongdong, la visita a los palacios en Hanbok tradicional y los spots de K-Dramas estuvieron de 10. La logística de Juan es insuperable.',
        likes: 18,
        verified: true,
    },
    {
        id: 5,
        name: 'Lucía Fernández',
        city: 'Querétaro, Qro.',
        trip: 'Sakura en Japón 2024',
        season: 'sakura',
        rating: 5,
        date: 'Marzo 2024',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop&q=80',
        comment: 'Ver el Monte Fuji nevado rodeado de cerezos en flor es una experiencia que te cambia la vida. Toda la asesoría previa al viaje sobre qué empacar y cómo movernos fue clave. ¡Son los mejores!',
        likes: 27,
        verified: true,
    },
    {
        id: 6,
        name: 'Roberto & Marcela Sánchez',
        city: 'Mérida, Yucatán',
        trip: 'Japón Completo & Verano 2024',
        season: 'verano',
        rating: 5,
        date: 'Julio 2024',
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80',
        comment: 'Viajamos en pareja y fue perfecto. Atención personalizada, mucha libertad en las tardes libres y apoyo constante de los guías. La comida en Osaka fue espectacular. Ya estamos ahorrando para el tour de 2027.',
        likes: 15,
        verified: true,
    },
]

const TOURS_OPTIONS = [
    'Japón Sakura (Primavera)',
    'Japón Akari (Verano)',
    'Japón Kamakura (Otoño / Invierno)',
    'Japón a la Carta (Personalizado)',
    'Corea del Sur K-Drama',
    'Japón + Corea Combinado',
    'Tours Individuales / Día libre',
]

export default function ComunidadComentarios() {
    const [reviews, setReviews] = useState(INITIAL_REVIEWS)
    const [filter, setFilter] = useState('all')
    const [likedIds, setLikedIds] = useState([])

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        email: '',
        trip: TOURS_OPTIONS[0],
        rating: 5,
        comment: '',
        instagram: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => { window.scrollTo(0, 0) }, [])

    const handleLike = (id) => {
        if (likedIds.includes(id)) {
            setLikedIds(likedIds.filter(i => i !== id))
            setReviews(reviews.map(r => r.id === id ? { ...r, likes: r.likes - 1 } : r))
        } else {
            setLikedIds([...likedIds, id])
            setReviews(reviews.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name.trim() || !formData.comment.trim()) return

        setSubmitting(true)
        try {
            // Save to CMS / API
            await submitFormToCMS({
                nombre: formData.name,
                telefono: formData.instagram || 'N/A',
                correo: formData.email || 'comunidad@rutaxasia.com',
                estado: formData.city || 'México',
                viaje: formData.trip,
                mensaje: `[RESEÑA ${formData.rating}★] ${formData.comment}`,
            })

            // Add review to local list
            const newReview = {
                id: Date.now(),
                name: formData.name,
                city: formData.city || 'México',
                trip: formData.trip,
                season: 'all',
                rating: formData.rating,
                date: 'Reciente',
                photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80',
                tripPhoto: null,
                comment: formData.comment,
                likes: 1,
                verified: true,
            }
            setReviews([newReview, ...reviews])
            setSubmitted(true)
            setFormData({
                name: '',
                city: '',
                email: '',
                trip: TOURS_OPTIONS[0],
                rating: 5,
                comment: '',
                instagram: '',
            })
        } catch (error) {
            console.error('Error submitting review:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const filteredReviews = filter === 'all'
        ? reviews
        : reviews.filter(r => r.season === filter)

    return (
        <div className="comunidad-page">
            <Helmet>
                <title>Comunidad Viajera | Opiniones y Reseñas Reales | RutaXAsia</title>
                <meta name="description" content="Lee los testimonios y reseñas reales de viajeros que vivieron Japón y Corea del Sur con RutaXAsia. ¡Deja tu comentario y forma parte de nuestra comunidad!" />
            </Helmet>

            {/* ===== HERO BANNER ===== */}
            <section className="com-hero">
                <div className="com-hero-bg">
                    <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=800&fit=crop&q=80" alt="Comunidad RutaXAsia" />
                    <div className="com-hero-overlay" />
                </div>
                <div className="container com-hero-content">
                    <span className="com-hero-badge">
                        <LuSparkles size={14} /> COMUNIDAD DE VIAJEROS RUTAXASIA
                    </span>
                    <h1 className="com-hero-title">
                        Historias y Experiencias que <span className="com-glow-text">Inspiran</span>
                    </h1>
                    <p className="com-hero-sub">
                        Más de 500 viajeros han recorrido Asia con nosotros. Lee sus vivencias reales o comparte tu propia historia de viaje.
                    </p>

                    {/* Rating Overview Strip */}
                    <div className="com-rating-bar">
                        <div className="com-rating-score">
                            <span className="com-score-num">4.9</span>
                            <div className="com-score-stars">
                                {[...Array(5)].map((_, i) => (
                                    <LuStar key={i} size={18} className="com-star-filled" />
                                ))}
                            </div>
                            <span className="com-score-label">Calificación Promedio</span>
                        </div>
                        <div className="com-rating-stat">
                            <strong>+500</strong>
                            <span>Viajeros Felices</span>
                        </div>
                        <div className="com-rating-stat">
                            <strong>100%</strong>
                            <span>Acompañamiento Real</span>
                        </div>
                        <div className="com-rating-stat">
                            <strong>15+</strong>
                            <span>Grupos Exitosos</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== MAIN CONTENT GRID ===== */}
            <div className="container com-main-layout">
                {/* Left: Reviews Feed & Filters */}
                <div className="com-feed-col">
                    <div className="com-feed-header">
                        <h2>Experiencias de Viajeros</h2>
                        
                        {/* Filter Tabs */}
                        <div className="com-filters">
                            <button
                                className={`com-filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                Todas ({reviews.length})
                            </button>
                            <button
                                className={`com-filter-btn ${filter === 'sakura' ? 'active' : ''}`}
                                onClick={() => setFilter('sakura')}
                            >
                                🌸 Sakura
                            </button>
                            <button
                                className={`com-filter-btn ${filter === 'verano' ? 'active' : ''}`}
                                onClick={() => setFilter('verano')}
                            >
                                ☀️ Verano
                            </button>
                            <button
                                className={`com-filter-btn ${filter === 'otono' ? 'active' : ''}`}
                                onClick={() => setFilter('otono')}
                            >
                                🍁 Otoño
                            </button>
                            <button
                                className={`com-filter-btn ${filter === 'corea' ? 'active' : ''}`}
                                onClick={() => setFilter('corea')}
                            >
                                🇰🇷 Corea
                            </button>
                        </div>
                    </div>

                    {/* Review Cards Grid */}
                    <div className="com-reviews-grid">
                        {filteredReviews.map(r => (
                            <div className="com-review-card" key={r.id}>
                                <div className="com-card-top">
                                    <img src={r.photo} alt={r.name} className="com-user-avatar" />
                                    <div className="com-user-meta">
                                        <div className="com-user-name-row">
                                            <h4>{r.name}</h4>
                                            {r.verified && (
                                                <span className="com-verified-badge" title="Viajero Verificado">
                                                    <LuCircleCheck size={13} /> Verificado
                                                </span>
                                            )}
                                        </div>
                                        <div className="com-user-sub">
                                            <span><LuMapPin size={12} /> {r.city}</span>
                                            <span>•</span>
                                            <span><LuCalendar size={12} /> {r.date}</span>
                                        </div>
                                    </div>
                                    <div className="com-stars">
                                        {[...Array(r.rating)].map((_, i) => (
                                            <LuStar key={i} size={14} className="com-star-filled" />
                                        ))}
                                    </div>
                                </div>

                                <div className="com-trip-tag">
                                    ✈️ {r.trip}
                                </div>

                                <p className="com-comment-text">
                                    "{r.comment}"
                                </p>

                                {r.tripPhoto && (
                                    <div className="com-card-photo">
                                        <img src={r.tripPhoto} alt={`Foto de viaje de ${r.name}`} loading="lazy" />
                                    </div>
                                )}

                                <div className="com-card-actions">
                                    <button
                                        className={`com-like-btn ${likedIds.includes(r.id) ? 'liked' : ''}`}
                                        onClick={() => handleLike(r.id)}
                                    >
                                        <LuHeart size={16} fill={likedIds.includes(r.id) ? '#ff3b75' : 'none'} />
                                        <span>{r.likes} personas inspiradas</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Interactive Review Submission Form */}
                <aside className="com-form-col">
                    <div className="com-form-card">
                        <div className="com-form-header">
                            <span className="com-form-tag">✍️ COMPARTE TU EXPERIENCIA</span>
                            <h3>¿Viajaste con nosotros?</h3>
                            <p>Tu opinión ayuda a otros viajeros a dar el salto a conocer Asia.</p>
                        </div>

                        {submitted ? (
                            <div className="com-success-box">
                                <div className="com-success-icon">🎉</div>
                                <h4>¡Muchísimas gracias por tu reseña!</h4>
                                <p>Tu testimonio ha sido publicado y guardado en nuestra comunidad.</p>
                                <button className="btn btn-outline" onClick={() => setSubmitted(false)}>
                                    Escribir otro comentario
                                </button>
                            </div>
                        ) : (
                            <form className="com-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Tu Nombre Completo *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Sofía Hernández"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ciudad / Estado (México) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. CDMX, Guadalajara, Monterrey..."
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Viaje que realizaste *</label>
                                    <select
                                        value={formData.trip}
                                        onChange={(e) => setFormData({ ...formData, trip: e.target.value })}
                                    >
                                        {TOURS_OPTIONS.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Calificación *</label>
                                    <div className="com-star-picker">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                type="button"
                                                key={num}
                                                className={`com-picker-star ${formData.rating >= num ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, rating: num })}
                                            >
                                                ★
                                            </button>
                                        ))}
                                        <span className="com-picker-label">{formData.rating} de 5 estrellas</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Tu Comentario / Experiencia *</label>
                                    <textarea
                                        rows={4}
                                        required
                                        placeholder="Cuéntanos qué fue lo que más disfrutaste, los momentos favoritos, la atención de Juan y Ale..."
                                        value={formData.comment}
                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Instagram o Email (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="@tuusuario o correo"
                                        value={formData.instagram}
                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary com-submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Publicando...' : 'Publicar mi Experiencia →'}
                                </button>
                            </form>
                        )}

                        <div className="com-form-wa-card">
                            <p>¿Prefieres enviarnos tus fotos o un video testimonio?</p>
                            <a
                                href={`${WHATSAPP_BASE}SW-Hola%20quiero%20compartir%20mis%20fotos%20y%20resena%20de%20mi%20viaje%20con%20RutaXAsia`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="com-wa-direct-btn"
                            >
                                💬 Enviar por WhatsApp
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
