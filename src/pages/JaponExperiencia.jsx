import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    TEMPORADAS,
    EXPERIENCIAS,
    HIGHLIGHTS_STRIP,
} from '../data/japonData'
import StepLibre from '../components/JaponTripBuilder/StepLibre'
import StepGuiado from '../components/JaponTripBuilder/StepGuiado'
import StepAcompanado from '../components/JaponTripBuilder/StepAcompanado'
import StepSignature from '../components/JaponTripBuilder/StepSignature'
import '../components/JaponTripBuilder/JaponTripBuilder.css'
import './pages.css'

/**
 * JaponExperiencia — Individual experience landing page.
 * Route: /viajes/japon/:temporada/:experiencia
 * Example: /viajes/japon/verano/libre
 *
 * Integrates the high-fidelity, interactive step builders to offer
 * a cohesive, premium visual experience for direct landing visitors.
 */
export default function JaponExperiencia() {
    const { temporada, experiencia } = useParams()
    const season = TEMPORADAS[temporada]
    const exp = EXPERIENCIAS[experiencia]

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [temporada, experiencia])

    if (!season || !exp) return <Navigate to="/viajes/japon" replace />

    return (
        <>
            <Helmet>
                <title>{`${season.name} ${exp.name} — Japón a la Carta | RutaXAsia`}</title>
                <meta name="description" content={`${season.name} ${exp.name}: ${exp.tagline} Descubre esta experiencia única y diseña tu viaje a Japón a tu medida con RutaXAsia.`} />
            </Helmet>

            {/* ===== STICKY SELECTION PATH ===== */}
            <div className="jac-selection-path">
                <div className="container jac-path-container">
                    <Link to="/viajes/japon" className="jac-path-step">
                        🇯🇵 Japón a la Carta
                    </Link>
                    <span className="jac-path-divider">/</span>
                    <Link to={`/viajes/japon/${temporada}`} className="jac-path-step">
                        {season.emoji} {season.name}
                    </Link>
                    <span className="jac-path-divider">/</span>
                    <span className="jac-path-step jac-path-step--active">
                        {exp.icon} {exp.name}
                    </span>
                </div>
            </div>

            {/* ===== INTERACTIVE EXPERIENCES WRAPPER ===== */}
            <div className="jtb-wrapper" style={{
                '--jtb-primary': season.colors.primary,
                '--jtb-bg': season.colors.bg
            }}>
                {experiencia === 'libre' && <StepLibre season={season} temporadaKey={temporada} />}
                {experiencia === 'guiado' && <StepGuiado season={season} temporadaKey={temporada} />}
                {experiencia === 'acompanado' && <StepAcompanado season={season} />}
                {experiencia === 'signature' && <StepSignature season={season} />}
            </div>

            {/* ===== HIGHLIGHTS STRIP ===== */}
            <section className="jac-highlights-strip" style={{ background: season.colors.primary }}>
                <div className="container">
                    <div className="jac-highlights-row">
                        {HIGHLIGHTS_STRIP.map((h, i) => (
                            <div className="jac-highlight-item" key={i}>
                                <span className="jac-highlight-icon">{h.icon}</span>
                                <span className="jac-highlight-text">{h.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
