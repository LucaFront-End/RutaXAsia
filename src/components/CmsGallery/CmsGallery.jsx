import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './CmsGallery.css'

const DEFAULT_FALLBACK_GALLERY = [
    { src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=1000&fit=crop&q=80', caption: 'Templo Fushimi Inari, Kyoto', span: 'tall' },
    { src: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80', caption: 'Tokyo Skyline & Torre de Tokio', span: '' },
    { src: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop&q=80', caption: 'Monte Fuji desde Chureito', span: '' },
    { src: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&q=80', caption: 'Bosque de Bambú, Arashiyama', span: '' },
    { src: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=1000&fit=crop&q=80', caption: 'Calles tradicionales de Seúl', span: 'tall' },
    { src: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&h=600&fit=crop&q=80', caption: 'Temporada Sakura en Japón', span: '' },
]

export default function CmsGallery({ 
    title = 'Así se vive un viaje con RutaXAsia', 
    subtitle = 'Momentos reales de nuestros viajeros en Asia',
    tag = 'Momentos reales',
    initialCategory = 'General',
    maxInitial = 9,
    theme = 'light' // 'light' | 'dark'
}) {
    const [galleryImages, setGalleryImages] = useState(DEFAULT_FALLBACK_GALLERY)
    const [categories, setCategories] = useState([])
    const [activeCategory, setActiveCategory] = useState(initialCategory)
    const [showAllPhotos, setShowAllPhotos] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch dynamic gallery from CMS
    useEffect(() => {
        let isMounted = true
        setIsLoading(true)

        fetch(`/api/galeria-nosotros?title=${encodeURIComponent(activeCategory)}`)
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return
                if (data.images && data.images.length > 0) {
                    setGalleryImages(data.images)
                }
                if (data.categories && data.categories.length > 0) {
                    setCategories(data.categories)
                }
                setIsLoading(false)
            })
            .catch(err => {
                console.warn('[CmsGallery] Error fetching gallery:', err)
                if (isMounted) setIsLoading(false)
            })

        return () => { isMounted = false }
    }, [activeCategory])

    // Keyboard navigation for Lightbox
    useEffect(() => {
        if (lightboxIndex === null) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setLightboxIndex(null)
            if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev + 1) % galleryImages.length)
            if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [lightboxIndex, galleryImages.length])

    const visibleItems = showAllPhotos ? galleryImages : galleryImages.slice(0, maxInitial)

    return (
        <section className={`cms-gallery-section cms-gallery--${theme}`} id="galeria-fotos">
            <div className="container">
                <div className="cms-gallery-header">
                    {tag && <span className="cms-gallery-tag">{tag}</span>}
                    {title && <h2 className="cms-gallery-title">{title}</h2>}
                    {subtitle && <p className="cms-gallery-subtitle">{subtitle}</p>}
                </div>

                {/* Category Tabs */}
                {categories.length > 1 && (
                    <div className="cms-gallery-tabs">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`cms-gallery-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveCategory(cat)
                                    setShowAllPhotos(false)
                                }}
                            >
                                {cat === 'General' ? '✨ General' : cat === 'Corea 2024' ? '🇰🇷 Corea 2024' : `🌸 ${cat}`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                <div className="cms-gallery-grid">
                    {visibleItems.map((img, i) => (
                        <div
                            key={img.id || i}
                            className={`cms-gallery-item ${img.span ? `cms-gallery-item--${img.span}` : ''}`}
                            onClick={() => setLightboxIndex(i)}
                        >
                            <img
                                src={img.src}
                                alt={img.caption || img.alt || 'Foto de viaje RutaXAsia'}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'
                                }}
                            />
                            <div className="cms-gallery-caption">
                                <span>{img.caption}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Expand / Collapse Action */}
                {galleryImages.length > maxInitial && (
                    <div className="cms-gallery-actions">
                        <button
                            type="button"
                            className="cms-gallery-more-btn"
                            onClick={() => setShowAllPhotos(!showAllPhotos)}
                        >
                            {showAllPhotos ? '▲ Ver menos fotos' : `📸 Ver todas las fotos (${galleryImages.length})`}
                        </button>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && galleryImages[lightboxIndex] && createPortal(
                <div className="cms-lightbox-overlay" onClick={() => setLightboxIndex(null)}>
                    <div className="cms-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="cms-lightbox-close"
                            onClick={() => setLightboxIndex(null)}
                            aria-label="Cerrar visor de foto"
                        >
                            ✕
                        </button>
                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="cms-lightbox-arrow cms-lightbox-arrow--prev"
                                    onClick={() => setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length)}
                                    aria-label="Foto anterior"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    className="cms-lightbox-arrow cms-lightbox-arrow--next"
                                    onClick={() => setLightboxIndex((lightboxIndex + 1) % galleryImages.length)}
                                    aria-label="Siguiente foto"
                                >
                                    ›
                                </button>
                            </>
                        )}
                        <img
                            src={galleryImages[lightboxIndex].src}
                            alt={galleryImages[lightboxIndex].caption || 'Foto ampliada'}
                            className="cms-lightbox-img"
                        />
                        <div className="cms-lightbox-caption">
                            {galleryImages[lightboxIndex].caption} ({lightboxIndex + 1} de {galleryImages.length})
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    )
}
