import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { LuCalendar, LuClock, LuArrowLeft, LuArrowRight, LuLoader } from 'react-icons/lu'
import { fetchBlogPostBySlug } from '../lib/wixClient'
import './Blog.css'

const WHATSAPP_BASE = 'https://wa.me/525657929121?text='

export default function BlogPost() {
    const { slug } = useParams()
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => { window.scrollTo(0, 0) }, [slug])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setNotFound(false)

        fetchBlogPostBySlug(slug).then(result => {
            if (cancelled) return
            if (!result) {
                setNotFound(true)
            } else {
                setPost(result)
            }
            setLoading(false)
        })

        return () => { cancelled = true }
    }, [slug])

    const formatDate = (d) => {
        if (!d) return ''
        const date = typeof d === 'string' ? new Date(d) : new Date(d)
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    if (loading) {
        return (
            <div className="blogpost-loading">
                <LuLoader size={36} className="blog-spinner" />
                <p>Cargando artículo...</p>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="blogpost-notfound">
                <h1>Artículo no encontrado</h1>
                <p>El artículo que buscas no existe o fue removido.</p>
                <Link to="/blog" className="btn btn-primary">← Volver al Blog</Link>
            </div>
        )
    }

    return (
        <>
            <Helmet>
                <title>{post.title} | Blog RutaXAsia</title>
                <meta name="description" content={post.excerpt} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                {post.coverImage && <meta property="og:image" content={post.coverImage} />}
            </Helmet>

            {/* Hero */}
            <section className="blogpost-hero">
                <div className="blogpost-hero-bg">
                    {post.coverImage && <img src={post.coverImage} alt={post.title} />}
                </div>
                <div className="blogpost-hero-overlay" />
                <div className="blogpost-hero-content container">
                    <div className="blogpost-hero-top-row">
                        <Link to="/blog" className="blogpost-back">
                            <LuArrowLeft size={16} /> Blog
                        </Link>
                        <span className="blogpost-cat">{post.categoryLabel}</span>
                    </div>
                    <h1 className="blogpost-h1">{post.title}</h1>
                    <div className="blogpost-meta">
                        <span><LuCalendar size={14} /> {formatDate(post.date)}</span>
                        <span><LuClock size={14} /> {post.readTime}</span>
                    </div>
                </div>
            </section>

            {/* Content & Sticky Sidebar */}
            <div className="blogpost-body-wrap container">
                <article className="blogpost-article">
                    <div
                        className="blogpost-content"
                        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
                    />
                </article>

                {/* Right Sticky Sidebar CTA — Japón a la Carta */}
                <aside className="blogpost-sidebar">
                    <div className="bp-jac-widget">
                        <div className="bp-jac-badge">
                            <span>🇯🇵 JAPÓN A LA CARTA</span>
                        </div>
                        <h3 className="bp-jac-title">Diseña tu Aventura a Japón</h3>
                        <p className="bp-jac-desc">
                            Elige tu temporada favorita, el nivel de acompañamiento que prefieras y cotiza tu viaje en minutos.
                        </p>

                        <div className="bp-jac-seasons">
                            <Link to="/viajes/japon/sakura" className="bp-jac-season-item bp-jac-season--sakura">
                                <span className="bp-jac-season-emoji">🌸</span>
                                <div className="bp-jac-season-info">
                                    <strong>Sakura</strong>
                                    <small>16 Mar — 15 Abr</small>
                                </div>
                                <span className="bp-jac-arrow">→</span>
                            </Link>

                            <Link to="/viajes/japon/akari" className="bp-jac-season-item bp-jac-season--akari">
                                <span className="bp-jac-season-emoji">☀️</span>
                                <div className="bp-jac-season-info">
                                    <strong>Akari</strong>
                                    <small>16 Abr — 31 Ago</small>
                                </div>
                                <span className="bp-jac-arrow">→</span>
                            </Link>

                            <Link to="/viajes/japon/kamakura" className="bp-jac-season-item bp-jac-season--kamakura">
                                <span className="bp-jac-season-emoji">🍁</span>
                                <div className="bp-jac-season-info">
                                    <strong>Kamakura</strong>
                                    <small>1 Sep — 15 Mar</small>
                                </div>
                                <span className="bp-jac-arrow">→</span>
                            </Link>
                        </div>

                        <Link to="/viajes/japon" className="btn btn-primary bp-jac-cta-btn">
                            ¡Crear Japón a la Carta! <span>→</span>
                        </Link>

                        <div className="bp-jac-wa">
                            <a
                                href={`${WHATSAPP_BASE}SW-Hola%20leí%20el%20artículo%20${encodeURIComponent(post.title)}%20y%20quiero%20información%20sobre%20Japón%20a%20la%20Carta`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bp-jac-wa-link"
                            >
                                💬 Asesoría gratuita por WhatsApp
                            </a>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom CTA */}
            <section className="blogpost-cta">
                <div className="container">
                    <div className="blogpost-cta-inner">
                        <h2>¿Listo para vivir tu propia aventura en Asia?</h2>
                        <p>Platícanos tu viaje soñado y te armamos el plan perfecto.</p>
                        <div className="blogpost-cta-buttons">
                            <a
                                href={`${WHATSAPP_BASE}SW-Hola%20quiero%20cotizar%20un%20viaje%20a%20Asia`}
                                className="btn btn-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Cotizar mi Viaje →
                            </a>
                            <Link to="/blog" className="btn btn-outline">
                                <LuArrowRight size={14} style={{transform:'rotate(180deg)', marginRight:'0.3rem'}} /> Más artículos
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
