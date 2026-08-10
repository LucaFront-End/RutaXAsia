import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import './pages.css'

/**
 * ViajesChina — Placeholder page for China trips (Próximamente).
 * Route: /viajes/china
 */
export default function ViajesChina() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    return (
        <>
            <Helmet>
                <title>Viajes a China — Próximamente | RutaXAsia</title>
                <meta name="description" content="Próximamente: viajes grupales a China con RutaXAsia. La Gran Muralla, Beijing, Shanghai y más. Regístrate para ser el primero en enterarte." />
            </Helmet>

            {/* Hero */}
            <section className="viajes-hero">
                <div className="viajes-hero-bg">
                    <img src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=800&fit=crop&q=85" alt="China" />
                    <div className="viajes-hero-overlay" />
                </div>
                <div className="viajes-hero-content container">
                    <span className="viajes-hero-tag">🇨🇳 China</span>
                    <h1 className="viajes-hero-title">Viajes a <span>China</span></h1>
                    <p className="viajes-hero-subtitle">Una civilización milenaria te espera. Pronto abrimos rutas a China.</p>
                </div>
            </section>

            {/* Coming Soon */}
            <section className="viajes-coming-soon">
                <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
                    <div className="viajes-coming-icon">🏗️</div>
                    <h2 className="viajes-coming-title">Próximamente</h2>
                    <p className="viajes-coming-text">
                        Estamos preparando rutas increíbles a China: la Gran Muralla, Beijing, Shanghai, Xi'an y mucho más.
                        Dejanos tu contacto y serás el primero en enterarte cuando abramos fechas.
                    </p>
                    <a
                        href="https://wa.me/525657929121?text=SW-Hola%20me%20interesa%20info%20sobre%20viajes%20a%20China%20cuando%20estén%20disponibles"
                        className="btn btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '1.1rem', padding: '16px 40px', marginTop: '1.5rem' }}
                    >
                        💬 Quiero info cuando abran
                    </a>
                </div>
            </section>
        </>
    )
}
