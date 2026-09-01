import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuStar, LuMessageSquare, LuHeart, LuSend, LuCircleCheck, LuMapPin, LuCalendar, LuFilter, LuSparkles, LuCheck, LuClock } from 'react-icons/lu'
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
                        width = Math.round((height * maxHeight) / height)
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
        id: 'init-1',
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
        id: 'init-2',
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
        id: 'init-3',
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
        id: 'init-4',
        name: 'Diego Martínez & Andrea Ruiz',
        city: 'Puebla, Pue.',
        trip: 'Corea del Sur K-Drama Experience 2025',
        season: 'corea',
        rating: 5,
        date: 'Mayo 2025',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop&q=80',
        comment: 'Corea del Sur nos voló la cabeza. Desde el Palacio Gyeongbokgung vestidos con hanbok tradicional hasta las calles iluminadas de Hongdae y Busan. La comida callejera en Myeongdong fue una locura deliciosa.',
        likes: 28,
        verified: true,
    },
    {
        id: 'init-5',
        name: 'Lucía Fernández',
        city: 'Querétaro, Qro.',
        trip: 'Japón Clásico de Ensueño 2024',
        season: 'sakura',
        rating: 5,
        date: 'Abril 2024',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop&q=80',
        comment: 'Ver el Monte Fuji despejado al atardecer fue un momento que nunca voy a olvidar. Todo estuvo organizado al mínimo detalle, sin prisas y con tiempo para disfrutar cada cafetería y callejón mágico.',
        likes: 22,
        verified: true,
    },
    {
        id: 'init-6',
        name: 'Roberto Sánchez',
        city: 'Mérida, Yucatán',
        trip: 'Japón & Corea Gran Ruta 2024',
        season: 'corea',
        rating: 5,
        date: 'Octubre 2024',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80',
        tripPhoto: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&q=80',
        comment: 'La combinación de Japón y Corea fue perfecta. Pasar de la paz de los templos de Nara al bullicio futurista de Seúl fue algo impresionante. Juan y Ale conocen los mejores lugares que no salen en las guías turísticas normales.',
        likes: 35,
        verified: true,
    },
]

const TOURS_OPTIONS = [
    'Japón Sakura (Primavera)',
    'Verano en Japón & Festivales',
    'Otoño Momiji & Tradición',
    'Corea del Sur K-Drama',
    'Japón + Corea Combinado',
    'Tours Individuales / Experiencia a Medida',
]

const POPULAR_CITIES = [
    'Ciudad de México (CDMX)',
    'Guadalajara, Jalisco',
    'Monterrey, Nuevo León',
    'Puebla, Puebla',
    'Cancún, Quintana Roo',
    'Querétaro, Qro.',
    'Mérida, Yucatán',
    'León, Guanajuato',
    'Tijuana, Baja California',
    'Toluca, Estado de México',
    'San Luis Potosí, S.L.P.',
    'Aguascalientes, Ags.',
    'Hermosillo, Sonora',
    'Chihuahua, Chih.',
    'Veracruz, Ver.',
]

const STORAGE_KEY = 'rutaxasia_comunidad_reviews'

// Smart validation
function validateReviewContent(name, comment, email) {
    const cleanName = (name || '').trim()
    const cleanComment = (comment || '').trim()
    const cleanEmail = (email || '').trim()

    if (cleanName.length < 2) {
        return { isValid: false, error: 'Por favor ingresa tu nombre completo o apodo.' }
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { isValid: false, error: 'Por favor ingresa un correo electrónico válido para registrar tu reseña.' }
    }

    if (cleanComment.length < 15) {
        return { isValid: false, error: 'Tu comentario debe tener al menos 15 caracteres para contar tu experiencia.' }
    }

    const words = cleanComment.split(/\s+/).filter(Boolean)
    if (words.length < 3) {
        return { isValid: false, error: 'Por favor escribe al menos 3 o 4 palabras explicando tu vivencia de viaje.' }
    }

    // Check for keyboard smash patterns
    const keyboardSmashRegex = /(asdf|asd|dwd|qwer|zxcv|hjkl|jkl|lkj|1234|aaaa|bbbb|cccc|dddd|eeee|ffff|gggg|hhhh|iiii|jjjj|kkkk|llll|mmmm|nnnn|oooo|pppp|qqqq|rrrr|ssss|tttt|uuuu|vvvv|wwww|xxxx|yyyy|zzzz)/i
    if (keyboardSmashRegex.test(cleanComment.toLowerCase()) && cleanComment.length < 40) {
        return { isValid: false, error: 'El comentario parece contener texto de prueba. Por favor escribe una reseña real.' }
    }

    // Profanity and offensive words filter
    const bannedPatterns = [
        /\b(puto|puta|mierda|verga|pendejo|pendeja|estupido|estupida|imbecil|chingar|chingada|culero|cabron|cabrona|malparido|gonorrea|coño|maricon|zorra|estafa|scam|viagra|casino|porn|xxx)\b/i,
        /https?:\/\//i,
    ]

    for (const pattern of bannedPatterns) {
        if (pattern.test(cleanComment) || pattern.test(cleanName)) {
            return { isValid: false, error: 'El comentario contiene términos inapropiados, enlaces o lenguaje no permitido en la comunidad.' }
        }
    }

    return { isValid: true, error: null }
}

export default function ComunidadComentarios() {
    const [reviews, setReviews] = useState(INITIAL_REVIEWS)
    const [filter, setFilter] = useState('all')
    const [likedIds, setLikedIds] = useState([])
    const [formError, setFormError] = useState(null)
    const [pendingModalData, setPendingModalData] = useState(null)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [citySuggestions, setCitySuggestions] = useState([])
    const [showCityDropdown, setShowCityDropdown] = useState(false)

    // Photo Upload State
    const fileInputRef = useRef(null)
    const [uploadedPhoto, setUploadedPhoto] = useState(null)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        trip: TOURS_OPTIONS[0],
        rating: 5,
        comment: '',
    })
    const [submitting, setSubmitting] = useState(false)

    // Fetch approved reviews from Wix CMS API on mount
    useEffect(() => {
        let isMounted = true
        async function fetchApprovedReviews() {
            try {
                const res = await fetch('/api/resenas')
                if (!res.ok) return
                const data = await res.json()
                if (isMounted && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
                    // Combine approved CMS reviews with initial reviews, avoiding duplicates
                    const cmsIds = new Set(data.reviews.map(r => r.id))
                    const uniqueInitial = INITIAL_REVIEWS.filter(r => !cmsIds.has(r.id))
                    setReviews([...data.reviews, ...uniqueInitial])
                }
            } catch (err) {
                console.warn('Could not fetch reviews from API, using fallback:', err)
            }
        }
        fetchApprovedReviews()
        return () => { isMounted = false }
    }, [])

    useEffect(() => { window.scrollTo(0, 0) }, [])

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

    const handleCityInput = (val) => {
        setFormData(prev => ({ ...prev, city: val }))
        if (!val.trim()) {
            setCitySuggestions(POPULAR_CITIES.slice(0, 6))
            setShowCityDropdown(true)
        } else {
            const matches = POPULAR_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase()))
            setCitySuggestions(matches)
            setShowCityDropdown(matches.length > 0)
        }
    }

    const selectCity = (city) => {
        setFormData(prev => ({ ...prev, city }))
        setShowCityDropdown(false)
    }

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

        const validation = validateReviewContent(formData.name, formData.comment, formData.email)
        if (!validation.isValid) {
            setFormError(validation.error)
            return
        }

        setSubmitting(true)

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                city: formData.city.trim() || 'México',
                trip: formData.trip,
                rating: formData.rating,
                comment: formData.comment.trim(),
                photo: uploadedPhoto || '',
            }

            const res = await fetch('/api/resenas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'No se pudo guardar la reseña en el servidor.')
            }

            // Close form modal and open Pending Approval confirmation modal
            setIsReviewModalOpen(false)
            setPendingModalData({
                name: formData.name.trim(),
                photo: uploadedPhoto,
                trip: formData.trip,
                rating: formData.rating,
                comment: formData.comment.trim(),
            })

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                city: '',
                trip: TOURS_OPTIONS[0],
                rating: 5,
                comment: '',
            })
            setUploadedPhoto(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (error) {
            console.error('Error submitting review:', error)
            setFormError(error.message || 'Hubo un inconveniente al enviar la reseña. Inténtalo nuevamente.')
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

                    {/* Rating Overview Strip (2 Rows: Score on row 1, 3 stats on row 2) */}
                    <div className="com-rating-bar">
                        <div className="com-rating-score">
                            <span className="com-score-num">4.9</span>
                            <div className="com-score-stars">
                                {[...Array(5)].map((_, i) => (
                                    <LuStar key={i} size={20} className="com-star-filled" />
                                ))}
                            </div>
                            <span className="com-score-label">Calificación Promedio</span>
                        </div>

                        <div className="com-rating-divider" />

                        <div className="com-rating-stats-grid">
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

                {/* Filter Tabs & Header */}
                <div className="com-feed-header">
                    <h2>Experiencias de la Comunidad ({filteredReviews.length})</h2>
                    <div className="com-filter-pills">
                        {[
                            { key: 'all', label: 'Todos los Viajes' },
                            { key: 'sakura', label: '🌸 Primavera Sakura' },
                            { key: 'verano', label: '🎋 Verano & Festivales' },
                            { key: 'otono', label: '🍁 Otoño Momiji' },
                            { key: 'corea', label: '🇰🇷 Corea del Sur' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                className={`com-filter-pill ${filter === item.key ? 'active' : ''}`}
                                onClick={() => setFilter(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reviews Feed Grid */}
                <div className="com-reviews-grid">
                    {filteredReviews.map((r) => (
                        <div className="com-review-card" key={r.id} data-animate="fade-up">
                            <div className="com-user-header">
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
                                    {[...Array(r.rating || 5)].map((_, i) => (
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

                            {r.tripPhoto && r.tripPhoto !== r.photo && (
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

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Correo Electrónico (Tu cuenta de viajero) *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="sofia@gmail.com"
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormError(null)
                                                setFormData({ ...formData, email: e.target.value })
                                            }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>WhatsApp o Teléfono (Opcional)</label>
                                        <input
                                            type="tel"
                                            placeholder="55 1234 5678"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group com-city-group">
                                    <label>Ciudad / Estado (México) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Ciudad de México, Guadalajara, Monterrey..."
                                        value={formData.city}
                                        onChange={(e) => handleCityInput(e.target.value)}
                                        onFocus={() => {
                                            if (!formData.city) {
                                                setCitySuggestions(POPULAR_CITIES.slice(0, 6))
                                                setShowCityDropdown(true)
                                            }
                                        }}
                                    />
                                    {showCityDropdown && (
                                        <div className="com-city-dropdown">
                                            {citySuggestions.map((c, i) => (
                                                <div
                                                    key={i}
                                                    className="com-city-opt"
                                                    onClick={() => selectCity(c)}
                                                >
                                                    <LuMapPin size={13} />
                                                    <span>{c}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                                <p>Se guardará en tu reseña y se mostrará al ser aprobada.</p>
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

                                <button
                                    type="submit"
                                    className="btn btn-primary com-submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Enviando a revisión...' : 'Enviar mi Reseña al Equipo →'}
                                </button>
                            </form>

                            <div className="com-form-wa-card">
                                <p>¿Prefieres enviarnos tus fotos o un video testimonio directo?</p>
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

            {/* ===== CONFIRMATION MODAL: PENDING APPROVAL ===== */}
            {pendingModalData && (
                <div className="com-modal-backdrop" onClick={() => setPendingModalData(null)}>
                    <div className="com-modal-dialog com-pending-modal-dialog" onClick={e => e.stopPropagation()}>
                        <div className="com-pending-modal-content">
                            <div className="com-pending-icon-wrap">
                                <LuCheck size={36} />
                            </div>
                            <h3>¡Gracias por tu reseña, {pendingModalData.name}!</h3>
                            <p className="com-pending-sub">
                                Tu testimonio y fotografía han sido registrados con éxito en nuestro sistema de <strong>Reseñas</strong>.
                            </p>

                            <div className="com-pending-status-box">
                                <div className="com-pending-status-header">
                                    <LuClock size={16} />
                                    <span>Estado: Pendiente de Aprobación</span>
                                </div>
                                <p>
                                    Para proteger a la comunidad de spam, nuestro equipo revisará y activará tu reseña (columna <strong>Aprobado: Sí</strong>) en el CMS para que se muestre en el muro público y en la página principal.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary com-pending-close-btn"
                                onClick={() => setPendingModalData(null)}
                            >
                                Entendido, ¡muchas gracias!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
