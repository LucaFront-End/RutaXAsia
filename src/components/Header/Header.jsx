import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const WHATSAPP_URL = 'https://wa.me/525513610083?text=SW-Hola%20quiero%20cotizar%20un%20viaje'

const TOUR_LINKS = [
    { slug: 'sakura-2026', title: 'Sakura I 2026', flag: 'jp', sub: 'Japón & Corea · Mayo 2026' },
    { slug: 'verano-japon-2026', title: 'Verano Japón 2026', flag: 'jp', sub: 'Japón · Julio 2026' },
    { slug: 'corea-2026', title: 'Corea 2026', flag: 'kr', sub: 'Corea del Sur · Octubre 2026' },
    { slug: 'otono-japon-2026', title: 'Otoño en Japón 2026', flag: 'jp', sub: 'Japón · Noviembre 2026' },
]

function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [toursOpen, setToursOpen] = useState(false)
    const location = useLocation()
    const isHome = location.pathname === '/'

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [menuOpen])

    const closeMenu = () => { setMenuOpen(false); setToursOpen(false) }

    /* If on home, anchor links scroll; otherwise navigate home */
    const homeLink = (hash) => isHome ? hash : `/${hash}`

    return (
        <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--open' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <img src="/logo.png" alt="RutaXAsia" className="navbar-logo" />
                </Link>

                <ul className={`navbar-menu${menuOpen ? ' navbar-menu--open' : ''}`}>
                    {/* Tours dropdown */}
                    <li className={`nav-dropdown${toursOpen ? ' nav-dropdown--open' : ''}`}
                        onMouseEnter={() => setToursOpen(true)}
                        onMouseLeave={() => setToursOpen(false)}
                    >
                        <button
                            className="nav-dropdown-trigger"
                            onClick={() => setToursOpen(!toursOpen)}
                        >
                            Próximos Viajes
                            <svg className="nav-dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="nav-dropdown-panel">
                            {TOUR_LINKS.map(t => (
                                <Link key={t.slug} to={`/tours/${t.slug}`} className="nav-dropdown-item" onClick={closeMenu}>
                                    <img src={`https://flagcdn.com/w40/${t.flag}.png`} alt="" className="nav-dropdown-flag" />
                                    <div>
                                        <span className="nav-dropdown-title">{t.title}</span>
                                        <span className="nav-dropdown-sub">{t.sub}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </li>
                    <li><Link to="/nosotros" onClick={closeMenu}>Nosotros</Link></li>
                    <li><Link to="/blog" onClick={closeMenu}>Blog</Link></li>
                    <li><Link to="/faq" onClick={closeMenu}>Preguntas Frecuentes</Link></li>
                    <li><Link to="/contacto" onClick={closeMenu}>Contacto</Link></li>
                </ul>

                <a href={WHATSAPP_URL} className="btn btn-primary navbar-cta" target="_blank" rel="noopener noreferrer">
                    Cotiza tu Viaje
                </a>

                <button
                    className={`navbar-toggle${menuOpen ? ' navbar-toggle--active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menú"
                >
                    <span /><span /><span />
                </button>
            </div>
        </nav>
    )
}

export default Header
