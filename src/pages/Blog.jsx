import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuCalendar, LuClock, LuArrowRight, LuSearch, LuLoader, LuInfo } from 'react-icons/lu'
import { fetchBlogPosts } from '../lib/wixClient'
import './Blog.css'

export default function Blog() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [categories, setCategories] = useState(['Todos'])
    const [activeCategory, setActiveCategory] = useState('Todos')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => { window.scrollTo(0, 0) }, [])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(false)

        fetchBlogPosts().then(data => {
            if (cancelled) return
            if (data.posts?.length > 0) {
                setPosts(data.posts)
            } else {
                setPosts([])
            }
            if (data.categories?.length > 0) {
                setCategories(['Todos', ...data.categories.map(c => c.label)])
            }
            setLoading(false)
        }).catch(() => {
            if (cancelled) return
            setError(true)
            setLoading(false)
        })

        return () => { cancelled = true }
    }, [])

    const filtered = posts.filter(p => {
        const matchCat = activeCategory === 'Todos' ||
            p.categoryLabel === activeCategory ||
            p.categoryLabels?.includes(activeCategory)
        const matchSearch = !searchTerm ||
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchCat && matchSearch
    })

    const formatDate = (d) => {
        if (!d) return ''
        const date = typeof d === 'string' ? new Date(d) : new Date(d)
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
                {categories.length > 1 && (
                    <div className="blog-categories">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`blog-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* Posts Grid */}
            <section className="blog-posts container">
                {loading ? (
                    <div className="blog-loading">
                        <LuLoader size={32} className="blog-spinner" />
                        <p>Cargando artículos...</p>
                    </div>
                ) : error ? (
                    <div className="blog-empty">
                        <LuInfo size={32} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                        <p>No pudimos cargar los artículos. Intentá de nuevo más tarde.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="blog-empty">
                        <p>No se encontraron artículos. Prueba con otra categoría o búsqueda.</p>
                    </div>
                ) : (
                    <div className="blog-grid">
                        {filtered.map((post, i) => (
                            <Link to={`/blog/${post.slug}`} key={post.id || post.slug} className="blog-card-link" style={{'--delay': `${i * 0.08}s`}}>
                                <article className="blog-card">
                                    <div className="blog-card-img">
                                        <img src={post.coverImage} alt={post.title} loading="lazy" />
                                        <span className="blog-card-cat">{post.categoryLabel}</span>
                                    </div>
                                    <div className="blog-card-body">
                                        <div className="blog-card-meta">
                                            <span><LuCalendar size={13} /> {formatDate(post.date)}</span>
                                            <span><LuClock size={13} /> {post.readTime}</span>
                                        </div>
                                        <h2 className="blog-card-title">{post.title}</h2>
                                        <p className="blog-card-excerpt">{post.excerpt}</p>
                                        <span className="blog-card-cta">
                                            Leer más <LuArrowRight size={14} />
                                        </span>
                                    </div>
                                </article>
                            </Link>
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
                            <p className="blog-cta-sub">Deja de leer y empieza a vivirlo. Conoce nuestros viajes.</p>
                        </div>
                        <Link to="/#viajes" className="btn btn-primary">Ver Viajes <LuArrowRight size={16} style={{marginLeft:'0.3rem', verticalAlign:'middle'}} /></Link>
                    </div>
                </div>
            </section>
        </>
    )
}
