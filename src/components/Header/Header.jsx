import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const WHATSAPP_URL = 'https://wa.me/525513610083?text=SW-Hola%20quiero%20cotizar%20un%20viaje'

const TOUR_LINKS = [
    { slug: 'sakura-2026', title: 'Sakura 2026', flag: 'jp', sub: 'Japón · Marzo 2026', soldOut: true },
    { slug: 'japon-corea-mayo-2026', title: 'Japón y Corea', flag: 'jp', sub: 'Japón & Corea · Mayo 2026', soldOut: true },
    {
        title: 'Corea del Sur', flag: 'kr', sub: '2 fechas disponibles',
        children: [
            { slug: 'corea-junio-2026', label: 'Junio 2026', sub: '1 – 12 de junio' },
            { slug: 'corea-septiembre-2026', label: 'Septiembre 2026', sub: '18 – 29 de septiembre' },
        ],
    },
    {
        title: 'Verano en Japón', flag: 'jp', sub: '2 fechas disponibles',
        children: [
            { slug: 'verano-japon-2026', label: 'Julio 2026 — Fecha 1', sub: '3 – 16 de julio' },
            { slug: 'verano-japon-2026', label: 'Julio 2026 — Fecha 2', sub: '19 de julio – 1 de agosto' },
        ],
    },
    { slug: 'octubre-japon-2026', title: 'Japón Octubre', flag: 'jp', sub: 'Japón · Octubre 2026 · Trilogía Otoño' },
    { slug: 'japon-corea-2026', title: 'Japón y Corea', flag: 'jp', sub: 'Japón & Corea · Octubre 2026' },
]

function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [toursOpen, setToursOpen] = useState(false)
    const location = useLocation()
    const isHome = location.pathname === '/'
    const lastScrollY = { current: 0 }

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY
            setScrolled(y > 60)
            if (!menuOpen) {
                setHidden(y > 100 && y > lastScrollY.current)
            }
            lastScrollY.current = y
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [menuOpen])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [menuOpen])

    const closeMenu = () => { setMenuOpen(false); setToursOpen(false) }

    /* If on home, anchor links scroll; otherwise navigate home */
    const homeLink = (hash) => isHome ? hash : `/${hash}`

    return (
        <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--open' : ''}${hidden ? ' navbar--hidden' : ''}`}>
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
                            {TOUR_LINKS.map((t, i) => t.children ? (
                                <div key={i} className="nav-dropdown-group">
                                    <div className="nav-dropdown-group-header">
                                        <img src={`https://flagcdn.com/w40/${t.flag}.png`} alt="" className="nav-dropdown-flag" />
                                        <div>
                                            <span className="nav-dropdown-title">{t.title}</span>
                                            <span className="nav-dropdown-sub">{t.sub}</span>
                                        </div>
                                    </div>
                                    <div className="nav-dropdown-group-dates">
                                        {t.children.map(c => (
                                            <Link key={c.slug} to={`/tours/${c.slug}`} className="nav-dropdown-date" onClick={closeMenu}>
                                                <span className="nav-dropdown-date-label">📅 {c.label}</span>
                                                <span className="nav-dropdown-date-range">{c.sub}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link key={t.slug} to={`/tours/${t.slug}`} className={`nav-dropdown-item${t.soldOut ? ' nav-dropdown-item--sold' : ''}`} onClick={closeMenu}>
                                    <img src={`https://flagcdn.com/w40/${t.flag}.png`} alt="" className="nav-dropdown-flag" />
                                    <div>
                                        <span className="nav-dropdown-title">{t.title}{t.soldOut && <span className="nav-sold-badge">SOLD OUT</span>}</span>
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
