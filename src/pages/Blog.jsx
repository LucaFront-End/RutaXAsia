import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuCalendar, LuClock, LuArrowRight, LuSearch } from 'react-icons/lu'
import './Blog.css'

// Placeholder posts — will be replaced by CMS (blogcms) data
const PLACEHOLDER_POSTS = [
    {
        id: 'preparar-viaje-japon',
        title: 'Guía completa: Cómo preparar tu primer viaje a Japón',
        excerpt: 'Todo lo que necesitas saber antes de tu primer viaje al país del sol naciente. Desde el pasaporte hasta los mejores tips de viaje.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80',
        category: 'Guías',
        date: '2026-03-10',
        readTime: '8 min',
    },
    {
        id: 'mejor-epoca-japon',
        title: '¿Cuál es la mejor época para viajar a Japón?',
        excerpt: 'Sakura en primavera, festivales en verano, hojas rojas en otoño... Cada temporada tiene su magia. Te ayudamos a elegir.',
        image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=500&fit=crop&q=80',
        category: 'Tips',
        date: '2026-03-05',
        readTime: '5 min',
    },
    {
        id: 'experiencia-tren-bala',
        title: 'Viajar en el Shinkansen: La experiencia del tren bala',
        excerpt: 'El tren bala de Japón no es solo transporte, es una experiencia. Te contamos todo sobre el JR Pass y cómo aprovechar al máximo.',
        image: 'https://images.unsplash.com/photo-1565618754154-c8986b5e81a8?w=800&h=500&fit=crop&q=80',
        category: 'Experiencias',
        date: '2026-02-28',
        readTime: '6 min',
    },
    {
        id: 'comida-japon-imperdible',
        title: '10 comidas que no puedes perderte en Japón',
        excerpt: 'Ramen, sushi, takoyaki, matcha y mucho más. Una guía gastronómica para el viajero hambriento.',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=500&fit=crop&q=80',
        category: 'Gastronomía',
        date: '2026-02-20',
        readTime: '7 min',
    },
    {
        id: 'corea-del-sur-guia',
        title: 'Corea del Sur: Más allá del K-pop',
        excerpt: 'Descubre templos milenarios, mercados callejeros, y la increíble hospitalidad coreana en esta guía completa.',
        image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=500&fit=crop&q=80',
        category: 'Guías',
        date: '2026-02-15',
        readTime: '9 min',
    },
    {
        id: 'que-llevar-viaje-asia',
        title: 'Qué llevar en tu maleta para un viaje a Asia',
        excerpt: 'La lista definitiva de empaque para tu viaje. Qué SÍ llevar, qué NO llevar, y los mejores tips de equipaje.',
        image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&h=500&fit=crop&q=80',
        category: 'Tips',
        date: '2026-02-10',
        readTime: '5 min',
    },
]

const CATEGORIES = ['Todos', 'Guías', 'Tips', 'Experiencias', 'Gastronomía']

export default function Blog() {
    const [activeCategory, setActiveCategory] = useState('Todos')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => { window.scrollTo(0, 0) }, [])

    const filtered = PLACEHOLDER_POSTS.filter(p => {
        const matchCat = activeCategory === 'Todos' || p.category === activeCategory
        const matchSearch = !searchTerm ||
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
        return matchCat && matchSearch
    })

    const formatDate = (d) => {
        const date = new Date(d + 'T00:00:00')
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    return (
        <>
            <Helmet>
                <title>Blog | RutaXAsia — Viajes a Japón y Corea</title>
                <meta name="description" content="Lee las mejores guías, tips y experiencias de viaje a Japón y Corea del Sur. Consejos de viajeros, gastronomía asiática y cultura japonesa." />
            </Helmet>

            {/* Hero */}
            <section className="blog-hero">
                <div className="blog-hero-bg">
                    <img src="https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1920&h=800&fit=crop&q=80" alt="Blog RutaXAsia" />
                </div>
                <div className="blog-hero-overlay" />
                <div className="blog-hero-content container">
                    <span className="blog-hero-label">Blog</span>
                    <h1 className="blog-hero-h1">Historias de Asia</h1>
                    <p className="blog-hero-sub">Guías, tips y experiencias de viaje para tu próxima aventura</p>
                </div>
            </section>

            {/* Filters */}
            <section className="blog-filters container">
                <div className="blog-search">
                    <LuSearch size={18} />
                    <input
                        type="text"
                        placeholder="Buscar artículos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="blog-categories">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`blog-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Posts Grid */}
            <section className="blog-posts container">
                {filtered.length === 0 ? (
                    <div className="blog-empty">
                        <p>No se encontraron artículos. Probá con otra categoría o búsqueda.</p>
                    </div>
                ) : (
                    <div className="blog-grid">
                        {filtered.map((post, i) => (
                            <article key={post.id} className="blog-card" style={{'--delay': `${i * 0.08}s`}}>
                                <div className="blog-card-img">
                                    <img src={post.image} alt={post.title} loading="lazy" />
                                    <span className="blog-card-cat">{post.category}</span>
                                </div>
                                <div className="blog-card-body">
                                    <div className="blog-card-meta">
                                        <span><LuCalendar size={13} /> {formatDate(post.date)}</span>
                                        <span><LuClock size={13} /> {post.readTime}</span>
                                    </div>
                                    <h2 className="blog-card-title">{post.title}</h2>
                                    <p className="blog-card-excerpt">{post.excerpt}</p>
                                    <span className="blog-card-link">
                                        Leer más <LuArrowRight size={14} />
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section className="blog-cta">
                <div className="container">
                    <div className="blog-cta-inner">
                        <div>
                            <h2 className="blog-cta-title">¿Listo para vivir tu propia aventura?</h2>
                            <p className="blog-cta-sub">Dejá de leer y empezá a vivirlo. Conocé nuestros viajes.</p>
                        </div>
                        <Link to="/#viajes" className="btn btn-primary">Ver Viajes <LuArrowRight size={16} style={{marginLeft:'0.3rem', verticalAlign:'middle'}} /></Link>
                    </div>
                </div>
            </section>
        </>
    )
}
