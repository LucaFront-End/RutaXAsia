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
 * Example: /viajes/japon/akari/esencial | /viajes/japon/sakura/completo
 */
export default function JaponExperiencia() {
    const { temporada, experiencia } = useParams()

    const rawTemp = (temporada || '').toLowerCase()
    const rawExp = (experiencia || '').toLowerCase()

    // Normalize Season Aliases (akari/verano, kamakura/momiji/koyo, sakura)
    const seasonKey = (rawTemp === 'verano' || rawTemp === 'akari')
        ? 'akari'
        : (rawTemp === 'momiji' || rawTemp === 'kamakura' || rawTemp === 'koyo' || rawTemp === 'otono')
            ? 'kamakura'
            : (rawTemp === 'sakura' ? 'sakura' : rawTemp)

    // Normalize Experience Aliases (esencial/guiado, completo/acompanado, libre, signature)
    const expKey = (rawExp === 'guiado' || rawExp === 'esencial')
        ? 'esencial'
        : (rawExp === 'acompanado' || rawExp === 'completo')
            ? 'completo'
            : (rawExp === 'libre' || rawExp === 'signature' ? rawExp : rawExp)

    const season = TEMPORADAS[seasonKey]
    const exp = EXPERIENCIAS[expKey]

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
                    <Link to={`/viajes/japon/${seasonKey}`} className="jac-path-step">
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
                {expKey === 'libre' && <StepLibre season={season} temporadaKey={seasonKey} />}
                {expKey === 'esencial' && <StepGuiado season={season} temporadaKey={seasonKey} />}
                {expKey === 'completo' && <StepAcompanado season={season} temporadaKey={seasonKey} />}
                {expKey === 'signature' && <StepSignature season={season} />}
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
