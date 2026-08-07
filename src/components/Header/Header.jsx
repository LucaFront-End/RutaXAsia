import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NavbarTripWizard from './NavbarTripWizard'
import './Header.css'

const WHATSAPP_URL = 'https://wa.me/525513610083?text=SW-Hola%20quiero%20cotizar%20un%20viaje'

const TOUR_LINKS = [
    { slug: 'octubre-japon-2026', title: 'Japón Octubre', flag: 'jp', sub: 'Japón · Octubre 2026 · Trilogía Otoño' },
    { slug: 'japon-corea-2026', title: 'Japón y Corea', flag: 'jp', sub: 'Japón & Corea · Octubre 2026' },
]

function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [toursOpen, setToursOpen] = useState(false)
    const [japonOpen, setJaponOpen] = useState(false)
    const [comunidadOpen, setComunidadOpen] = useState(false)
    const [wizardTrip, setWizardTrip] = useState(null)

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

    const closeMenu = () => { setMenuOpen(false); setToursOpen(false); setJaponOpen(false); setComunidadOpen(false) }

    const handleTripClick = (e, title, url) => {
        e.preventDefault()
        closeMenu()
        setWizardTrip({ title, url })
    }

    return (
        <>
            <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--open' : ''}${hidden ? ' navbar--hidden' : ''}`}>
                <div className="navbar-container">
                    <Link to="/" className="navbar-brand" onClick={closeMenu}>
                        <img src="/logo.png" alt="RutaXAsia" className="navbar-logo" />
                    </Link>

                    <ul className={`navbar-menu${menuOpen ? ' navbar-menu--open' : ''}`}>
                        {/* Próximos Viajes dropdown */}
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
                                {TOUR_LINKS.map((t) => (
                                    <Link
                                        key={t.slug}
                                        to={`/tours/${t.slug}`}
                                        className="nav-dropdown-item"
                                        onClick={(e) => handleTripClick(e, t.title, `/tours/${t.slug}`)}
                                    >
                                        <img src={`https://flagcdn.com/w40/${t.flag}.png`} alt="" className="nav-dropdown-flag" />
                                        <div>
                                            <span className="nav-dropdown-title">{t.title}</span>
                                            <span className="nav-dropdown-sub">{t.sub}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </li>

                        {/* Japón a la Carta dropdown */}
                        <li className={`nav-dropdown${japonOpen ? ' nav-dropdown--open' : ''}`}
                            onMouseEnter={() => setJaponOpen(true)}
                            onMouseLeave={() => setJaponOpen(false)}
                        >
                            <button
                                className="nav-dropdown-trigger"
                                onClick={() => setJaponOpen(!japonOpen)}
                            >
                                Japón a la Carta ⛩️
                                <svg className="nav-dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div className="nav-dropdown-panel nav-jac-panel">
                                <Link
                                    to="/viajes/japon"
                                    className="nav-dropdown-item nav-jac-main"
                                    onClick={(e) => handleTripClick(e, 'Diseña tu viaje (Fechas Personalizadas)', '/viajes/japon')}
                                >
                                    <span className="nav-jac-main-icon">⛩️</span>
                                    <div>
                                        <span className="nav-dropdown-title">Diseña tu viaje (Fechas Personalizadas)</span>
                                        <span className="nav-dropdown-sub">Paso a paso con el Trip Builder</span>
                                    </div>
                                </Link>

                                <div className="nav-jac-divider" />

                                {/* Sakura */}
                                <div className="nav-jac-season-group">
                                    <Link to="/viajes/japon/sakura" className="nav-jac-season-header" onClick={closeMenu}>
                                        <span className="nav-jac-season-emoji">🌸</span>
                                        <span className="nav-jac-season-name">Sakura</span>
                                        <span className="nav-jac-season-dates">Mar — Abr</span>
                                    </Link>
                                    <div className="nav-jac-exp-row">
                                        <Link to="/viajes/japon/sakura/libre" onClick={(e) => handleTripClick(e, 'Sakura — Libre', '/viajes/japon/sakura/libre')}>🌿 Libre</Link>
                                        <Link to="/viajes/japon/sakura/guiado" onClick={(e) => handleTripClick(e, 'Sakura — Esencial', '/viajes/japon/sakura/guiado')}>⛩️ Esencial</Link>
                                        <Link to="/viajes/japon/sakura/acompanado" onClick={(e) => handleTripClick(e, 'Sakura — Completo', '/viajes/japon/sakura/acompanado')}>🏯 Completo</Link>
                                        <Link to="/viajes/japon/sakura/signature" onClick={(e) => handleTripClick(e, 'Sakura — Signature', '/viajes/japon/sakura/signature')}>👑 Signature</Link>
                                    </div>
                                </div>

                                {/* Verano */}
                                <div className="nav-jac-season-group">
                                    <Link to="/viajes/japon/verano" className="nav-jac-season-header" onClick={closeMenu}>
                                        <span className="nav-jac-season-emoji">☀️</span>
                                        <span className="nav-jac-season-name">Verano</span>
                                        <span className="nav-jac-season-dates">Jun — Ago</span>
                                    </Link>
                                    <div className="nav-jac-exp-row">
                                        <Link to="/viajes/japon/verano/libre" onClick={(e) => handleTripClick(e, 'Verano — Libre', '/viajes/japon/verano/libre')}>🌿 Libre</Link>
                                        <Link to="/viajes/japon/verano/guiado" onClick={(e) => handleTripClick(e, 'Verano — Esencial', '/viajes/japon/verano/guiado')}>⛩️ Esencial</Link>
                                        <Link to="/viajes/japon/verano/acompanado" onClick={(e) => handleTripClick(e, 'Verano — Completo', '/viajes/japon/verano/acompanado')}>🏯 Completo</Link>
                                        <Link to="/viajes/japon/verano/signature" onClick={(e) => handleTripClick(e, 'Verano — Signature', '/viajes/japon/verano/signature')}>👑 Signature</Link>
                                    </div>
                                </div>

                                {/* Momiji */}
                                <div className="nav-jac-season-group">
                                    <Link to="/viajes/japon/momiji" className="nav-jac-season-header" onClick={closeMenu}>
                                        <span className="nav-jac-season-emoji">🍁</span>
                                        <span className="nav-jac-season-name">Momiji</span>
                                        <span className="nav-jac-season-dates">Oct — Nov</span>
                                    </Link>
                                    <div className="nav-jac-exp-row">
                                        <Link to="/viajes/japon/momiji/libre" onClick={(e) => handleTripClick(e, 'Momiji — Libre', '/viajes/japon/momiji/libre')}>🌿 Libre</Link>
                                        <Link to="/viajes/japon/momiji/guiado" onClick={(e) => handleTripClick(e, 'Momiji — Esencial', '/viajes/japon/momiji/guiado')}>⛩️ Esencial</Link>
                                        <Link to="/viajes/japon/momiji/acompanado" onClick={(e) => handleTripClick(e, 'Momiji — Completo', '/viajes/japon/momiji/acompanado')}>🏯 Completo</Link>
                                        <Link to="/viajes/japon/momiji/signature" onClick={(e) => handleTripClick(e, 'Momiji — Signature', '/viajes/japon/momiji/signature')}>👑 Signature</Link>
                                    </div>
                                </div>
                            </div>
                        </li>

                        {/* Tours Individuales link */}
                        <li><Link to="/viajes/japon" onClick={(e) => handleTripClick(e, 'Tours Individuales', '/viajes/japon')}>Tours individuales</Link></li>

                        <li><Link to="/nosotros" onClick={closeMenu}>Nosotros</Link></li>

                        {/* Comunidad dropdown (Blog + Preguntas Frecuentes) */}
                        <li className={`nav-dropdown${comunidadOpen ? ' nav-dropdown--open' : ''}`}
                            onMouseEnter={() => setComunidadOpen(true)}
                            onMouseLeave={() => setComunidadOpen(false)}
                        >
                            <button
                                className="nav-dropdown-trigger"
                                onClick={() => setComunidadOpen(!comunidadOpen)}
                            >
                                Comunidad
                                <svg className="nav-dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div className="nav-dropdown-panel nav-comunidad-panel">
                                <Link to="/blog" className="nav-dropdown-item" onClick={closeMenu}>
                                    <span className="nav-dropdown-item-icon">📝</span>
                                    <div>
                                        <span className="nav-dropdown-title">Blog</span>
                                        <span className="nav-dropdown-sub">Consejos, guías e historias de viaje</span>
                                    </div>
                                </Link>
                                <Link to="/faq" className="nav-dropdown-item" onClick={closeMenu}>
                                    <span className="nav-dropdown-item-icon">❓</span>
                                    <div>
                                        <span className="nav-dropdown-title">Preguntas Frecuentes</span>
                                        <span className="nav-dropdown-sub">Resuelve tus dudas antes de viajar</span>
                                    </div>
                                </Link>
                            </div>
                        </li>

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

            {/* Navbar Multi-Step Trip Wizard */}
            <NavbarTripWizard
                isOpen={Boolean(wizardTrip)}
                onClose={() => setWizardTrip(null)}
                targetTrip={wizardTrip}
            />
        </>
    )
}

export default Header
