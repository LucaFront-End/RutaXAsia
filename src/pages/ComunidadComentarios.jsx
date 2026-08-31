import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuStar, LuMessageSquare, LuHeart, LuSend, LuCircleCheck, LuMapPin, LuCalendar, LuFilter, LuSparkles } from 'react-icons/lu'
import { submitFormToCMS } from '../lib/wixClient'
import './ComunidadComentarios.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

// Helper to compress user uploaded photo to compact web-safe JPEG data URL
function compressImage(file, maxWidth = 850, maxHeight = 850, quality = 0.84) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target.result
            img.onload = () => {
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width)
                        width = maxWidth
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height)
                        height = maxHeight
                    }
                }

                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)
                const dataUrl = canvas.toDataURL('image/jpeg', quality)
                resolve(dataUrl)
            }
            img.onerror = (err) => reject(err)
        }
        reader.onerror = (err) => reject(err)
    })
}

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

const STORAGE_KEY = 'rutaxasia_comunidad_reviews'

// Smart gibberish and profanity filter
function validateReviewContent(name, comment) {
    const cleanName = (name || '').trim()
    const cleanComment = (comment || '').trim()

    if (cleanName.length < 2) {
        return { isValid: false, error: 'Por favor ingresa tu nombre completo o apodo.' }
    }

    if (cleanComment.length < 15) {
        return { isValid: false, error: 'Tu comentario debe tener al menos 15 caracteres para contar tu experiencia.' }
    }

    const words = cleanComment.split(/\s+/).filter(Boolean)
    if (words.length < 3) {
        return { isValid: false, error: 'Por favor escribe al menos 3 o 4 palabras explicando tu vivencia de viaje.' }
    }

    // 1. Check for keyboard smash patterns & repetitive junk (e.g., asdasd, dwdada, qwerty, zzzzz)
    const keyboardSmashRegex = /(asdf|asd|dwd|qwer|zxcv|hjkl|jkl|lkj|1234|aaaa|bbbb|cccc|dddd|eeee|ffff|gggg|hhhh|iiii|jjjj|kkkk|llll|mmmm|nnnn|oooo|pppp|qqqq|rrrr|ssss|tttt|uuuu|vvvv|wwww|xxxx|yyyy|zzzz)/i
    if (keyboardSmashRegex.test(cleanComment.toLowerCase()) && cleanComment.length < 40) {
        return { isValid: false, error: 'El comentario parece contener texto de prueba o caracteres repetidos. Por favor escribe una reseña real.' }
    }

    // 2. Check for extremely long single words (> 26 characters without space)
    for (const word of words) {
        if (word.length > 26) {
            return { isValid: false, error: 'Detectamos palabras demasiado largas o sin sentido. Por favor escribe frases coherentes.' }
        }
        // Words with 5+ letters and no vowels
        if (word.length >= 5 && !/[aeiouáéíóúü]/i.test(word) && !word.startsWith('@') && !word.startsWith('#')) {
            return { isValid: false, error: 'Por favor escribe palabras comprensibles en español.' }
        }
    }

    // 3. Profanity and offensive words filter
    const bannedPatterns = [
        /\b(puto|puta|mierda|verga|pendejo|pendeja|estupido|estupida|imbecil|chingar|chingada|culero|cabron|cabrona|malparido|gonorrea|coño|maricon|zorra|estafa|scam|viagra|casino|porn|xxx)\b/i,
        /https?:\/\//i, // links
    ]

    for (const pattern of bannedPatterns) {
        if (pattern.test(cleanComment) || pattern.test(cleanName)) {
            return { isValid: false, error: 'El comentario contiene términos inapropiados, enlaces o lenguaje no permitido en la comunidad.' }
        }
    }

    return { isValid: true, error: null }
}

export default function ComunidadComentarios() {
    const [reviews, setReviews] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Merge local user-added reviews with INITIAL_REVIEWS if not present
                    const initialIds = new Set(INITIAL_REVIEWS.map(r => r.id))
                    const customUserReviews = parsed.filter(r => !initialIds.has(r.id))
                    return [...customUserReviews, ...INITIAL_REVIEWS]
                }
            }
        } catch (e) {
            console.error('Error loading saved reviews:', e)
        }
        return INITIAL_REVIEWS
    })

    const [filter, setFilter] = useState('all')
    const [likedIds, setLikedIds] = useState([])
    const [formError, setFormError] = useState(null)
    const [justPublishedToast, setJustPublishedToast] = useState(false)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

    // Photo Upload State
    const fileInputRef = useRef(null)
    const [uploadedPhoto, setUploadedPhoto] = useState(null)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)

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

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setFormError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).')
            return
        }
        if (file.size > 15 * 1024 * 1024) {
            setFormError('La foto no debe superar los 15MB.')
            return
        }
        try {
            setUploadingPhoto(true)
            const compressed = await compressImage(file, 850, 850, 0.84)
            setUploadedPhoto(compressed)
            setFormError(null)
        } catch (err) {
            console.error('Error processing photo:', err)
            setFormError('No pudimos procesar la foto. Intenta con otra imagen.')
        } finally {
            setUploadingPhoto(false)
        }
    }

    // Load persisted reviews
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setReviews(parsed)
                }
            }
        } catch (err) {
            console.warn('LocalStorage load error:', err)
        }
    }, [])

    useEffect(() => { window.scrollTo(0, 0) }, [])

    const handleLike = (id) => {
        if (likedIds.includes(id)) {
            setLikedIds(likedIds.filter(item => item !== id))
            setReviews(reviews.map(r => r.id === id ? { ...r, likes: r.likes - 1 } : r))
        } else {
            setLikedIds([...likedIds, id])
            setReviews(reviews.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError(null)

        // Run smart content validation
        const validation = validateReviewContent(formData.name, formData.comment)
        if (!validation.isValid) {
            setFormError(validation.error)
            return
        }

        setSubmitting(true)

        try {
            // Determine season tag
            let sTag = 'all'
            const tripLower = formData.trip.toLowerCase()
            if (tripLower.includes('sakura') || tripLower.includes('primavera')) sTag = 'sakura'
            else if (tripLower.includes('akari') || tripLower.includes('verano')) sTag = 'verano'
            else if (tripLower.includes('kamakura') || tripLower.includes('otoño')) sTag = 'otono'
            else if (tripLower.includes('corea')) sTag = 'corea'

            // Save to CMS / API
            submitFormToCMS({
                nombre: formData.name,
                telefono: formData.instagram || 'N/A',
                correo: formData.email || 'comunidad@rutaxasia.com',
                estado: formData.city || 'México',
                viaje: formData.trip,
                mensaje: `[RESEÑA ${formData.rating}★${uploadedPhoto ? ' Con Foto' : ''}] ${formData.comment}`,
            }).catch(err => console.warn('CMS submission warning:', err))

            // Add review to local list instantly
            const newReview = {
                id: Date.now(),
                name: formData.name.trim(),
                city: formData.city.trim() || 'México',
                trip: formData.trip,
                season: sTag,
                rating: formData.rating,
                date: 'Recién publicado',
                photo: uploadedPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80',
                tripPhoto: uploadedPhoto || null,
                comment: formData.comment.trim(),
                likes: 1,
                verified: true,
                isNew: true,
            }

            const updatedList = [newReview, ...reviews]
            setReviews(updatedList)
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
            } catch (err) {
                console.warn('LocalStorage save error:', err)
            }

            // Reset form, close modal and show success toast
            setFormData({
                name: '',
                city: '',
                email: '',
                trip: TOURS_OPTIONS[0],
                rating: 5,
                comment: '',
                instagram: '',
            })
            setUploadedPhoto(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            setIsReviewModalOpen(false)
            setJustPublishedToast(true)
            setTimeout(() => setJustPublishedToast(false), 6000)
        } catch (error) {
            console.error('Error submitting review:', error)
            setFormError('Hubo un inconveniente al publicar. Inténtalo nuevamente.')
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

            {/* ===== MAIN CONTENT ===== */}
            <div className="container com-main-container">
                {/* Top Action Banner to Open Review Modal */}
                <div className="com-cta-banner" data-animate="fade-up">
                    <div className="com-cta-banner-text">
                        <h3>¿Viajaste con nosotros? Comparte tu experiencia</h3>
                        <p>Tu reseña ayuda a futuros viajeros a dar el paso de descubrir Japón y Asia con total confianza.</p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary com-open-modal-btn"
                        onClick={() => setIsReviewModalOpen(true)}
                    >
                        <LuSend size={16} /> Escribir mi Reseña
                    </button>
                </div>

                {justPublishedToast && (
                    <div className="com-toast-success" style={{ margin: '1.5rem 0' }}>
                        <span>🎉 ¡Tu reseña fue publicada con éxito y ya aparece en el muro de la comunidad!</span>
                    </div>
                )}

                {/* Filter Tabs & Header */}
                <div className="com-feed-header">
                    <h2>Experiencias de la Comunidad ({filteredReviews.length})</h2>
                    
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

                {/* Review Cards Responsive Grid */}
                <div className="com-reviews-grid">
                    {filteredReviews.map(r => (
                        <div className="com-review-card" key={r.id}>
                            <div className="com-card-top">
                                <img
                                    src={r.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80'}
                                    alt={r.name}
                                    className="com-user-avatar"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80'
                                    }}
                                />
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
                                    <img
                                        src={r.tripPhoto}
                                        alt={`Foto de viaje de ${r.name}`}
                                        loading="lazy"
                                        onError={(e) => {
                                            if (e.target.parentElement) e.target.parentElement.style.display = 'none'
                                        }}
                                    />
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

            {/* ===== POPUP MODAL: SUBMISSION FORM ===== */}
            {isReviewModalOpen && (
                <div className="com-modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
                    <div className="com-modal-dialog" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className="com-modal-close"
                            onClick={() => setIsReviewModalOpen(false)}
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>

                        <div className="com-modal-header">
                            <span className="com-form-tag">✍️ COMPARTE TU EXPERIENCIA</span>
                            <h3>Publicar Reseña de Viaje</h3>
                            <p>Cuéntanos qué fue lo que más disfrutaste de tu experiencia con nosotros.</p>
                        </div>

                        <div className="com-modal-body">
                            {formError && (
                                <div className="com-form-error-box">
                                    ⚠️ {formError}
                                </div>
                            )}

                            <form className="com-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Tu Nombre Completo *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Sofía Hernández"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormError(null)
                                            setFormData({ ...formData, name: e.target.value })
                                        }}
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
                                        placeholder="Cuéntanos qué fue lo que más disfrutaste, la atención de Juan y Ale, los templos, la comida, los trenes..."
                                        value={formData.comment}
                                        onChange={(e) => {
                                            setFormError(null)
                                            setFormData({ ...formData, comment: e.target.value })
                                        }}
                                    />
                                </div>

                                <div className="form-group com-photo-upload-group">
                                    <label>📸 Sube tu foto (Perfil o en tu Viaje)</label>
                                    {uploadedPhoto ? (
                                        <div className="com-photo-preview-box">
                                            <img src={uploadedPhoto} alt="Foto cargada" className="com-photo-preview-img" />
                                            <div className="com-photo-preview-info">
                                                <span className="com-photo-preview-success">✓ Foto lista para tu reseña</span>
                                                <p>Se publicará junto a tu nombre y testimonio.</p>
                                                <button
                                                    type="button"
                                                    className="com-photo-remove-btn"
                                                    onClick={() => {
                                                        setUploadedPhoto(null)
                                                        if (fileInputRef.current) fileInputRef.current.value = ''
                                                    }}
                                                >
                                                    ✕ Cambiar o quitar foto
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            className={`com-photo-dropzone${uploadingPhoto ? ' com-photo-dropzone--loading' : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                style={{ display: 'none' }}
                                            />
                                            <div className="com-photo-dropzone-inner">
                                                <span className="com-photo-icon">📷</span>
                                                <div>
                                                    <strong>{uploadingPhoto ? 'Procesando imagen...' : 'Agregar foto a mi reseña'}</strong>
                                                    <span>Selecciona una foto desde tu celular o computadora</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                    </div>
                </div>
            )}
        </div>
    )
}
