import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
    HIGHLIGHTS_STRIP,
    WHATSAPP_BASE,
} from '../data/japonData'
import JaponTripBuilder from '../components/JaponTripBuilder/JaponTripBuilder'
import './pages.css'

/**
 * ViajesJapon — Japan "À la Carte" country page.
 * Features an interactive multi-step trip builder.
 * Route: /viajes/japon
 */

export default function ViajesJapon() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    return (
        <>
            <Helmet>
                <title>Japón a la Carta — Viajes a Japón desde México | RutaXAsia</title>
                <meta name="description" content="Japón a la Carta: elige tu temporada, tu estilo de viaje y vive Japón a tu manera. Sakura, Verano o Momiji. Libre, Guiado, Acompañado o Signature. RutaXAsia." />
            </Helmet>

            {/* ===== HERO ===== */}
            <section className="jac-hero">
                <div className="jac-hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=900&fit=crop&q=85"
                        alt="Japón"
                    />
                    <div className="jac-hero-overlay" />
                </div>
                <div className="jac-hero-content container">
                    <span className="jac-hero-tag" data-animate="fade-up" data-delay="100">🇯🇵 Japón</span>
                    <div className="jac-hero-torii" data-animate="fade-up" data-delay="250">⛩️</div>
                    <h1 className="jac-hero-title" data-animate="fade-up" data-delay="400">
                        JAPÓN <span className="jac-hero-title-accent">A LA CARTA</span>
                    </h1>
                    <p className="jac-hero-subtitle" data-animate="fade-up" data-delay="550">
                        Diseña tu viaje ideal a Japón en 3 pasos. Tú eliges la temporada, el estilo y nosotros hacemos que suceda.
                    </p>
                    <a href="#jtb-step-1" className="jac-hero-scroll-btn" data-animate="fade-up" data-delay="700">
                        Empieza a diseñar tu viaje <span className="jac-hero-scroll-arrow">↓</span>
                    </a>
                </div>
            </section>

            {/* ===== INTERACTIVE TRIP BUILDER ===== */}
            <JaponTripBuilder />

            {/* ===== FINAL CTA ===== */}
            <section className="jac-cta">
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="jac-cta-torii">⛩️</div>
                    <h2 className="jac-cta-title">
                        Cuéntanos cómo quieres vivir Japón
                    </h2>
                    <p className="jac-cta-subtitle">
                        Y diseñamos tu experiencia contigo.
                    </p>
                    <a
                        href={`${WHATSAPP_BASE}SW-Hola%20quiero%20info%20sobre%20Japón%20a%20la%20Carta`}
                        className="btn btn-primary jac-cta-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💬 Cotiza tu Viaje a Japón
                    </a>
                </div>
            </section>
        </>
    )
}
