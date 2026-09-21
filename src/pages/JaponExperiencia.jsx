import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    TEMPORADAS,
    EXPERIENCIAS,
    HIGHLIGHTS_STRIP,
} from '../data/japonData'
import { useTripSearch } from '../context/TripContext'
import StepLibre from '../components/JaponTripBuilder/StepLibre'
import StepGuiado from '../components/JaponTripBuilder/StepGuiado'
import StepAcompanado from '../components/JaponTripBuilder/StepAcompanado'
import StepSignature from '../components/JaponTripBuilder/StepSignature'
import '../components/JaponTripBuilder/JaponTripBuilder.css'
import './pages.css'

/**
 * JaponExperiencia — Individual experience landing page.
 * Route: /viajes/japon/:temporada/:experiencia
 * Example: /viajes/japon/akari/esencial | /viajes/japon/sakura/completo | /viajes/japon/kamakura/esencial
 */
export default function JaponExperiencia() {
    const { temporada, experiencia } = useParams()
    const { tripSearch, updateTripSearch } = useTripSearch()

    const rawTemp = (temporada || '').toLowerCase()
    const rawExp = (experiencia || '').toLowerCase()

    // Normalize Season Aliases (akari/verano, kamakura/momiji/koyo/otono/invierno, sakura)
    const seasonKey = (rawTemp === 'verano' || rawTemp === 'akari')
        ? 'akari'
        : (rawTemp === 'invierno' || rawTemp === 'fuyu' || rawTemp === 'nieve' || rawTemp === 'momiji' || rawTemp === 'kamakura' || rawTemp === 'koyo' || rawTemp === 'otono' || rawTemp === 'otoño')
            ? 'kamakura'
            : (rawTemp === 'sakura' || rawTemp === 'primavera' ? 'sakura' : rawTemp)

    // Normalize Experience Aliases (esencial/guiado, completo/acompanado, libre, signature)
    const expKey = (rawExp === 'guiado' || rawExp === 'esencial')
        ? 'esencial'
        : (rawExp === 'acompanado' || rawExp === 'completo')
            ? 'completo'
            : (rawExp === 'libre' || rawExp === 'signature' ? rawExp : rawExp)

    const isDualHero = seasonKey === 'kamakura'

    // Track which sub-season is selected for Kamakura (Otoño vs Invierno)
    const [selectedSubSeason, setSelectedSubSeason] = useState(() => {
        if (rawTemp === 'invierno' || rawTemp === 'fuyu' || rawTemp === 'nieve') return 'invierno'
        if (tripSearch?.subSeason === 'invierno' || tripSearch?.temporada === 'invierno') return 'invierno'
        return 'otono'
    })

    const handleSelectSubSeason = (sub) => {
        setSelectedSubSeason(sub)
        if (sub === 'otono') {
            updateTripSearch({
                startDate: '2026-10-15',
                endDate: '2026-10-24',
                selectedMonth: 'Octubre 2026',
                temporada: 'kamakura',
                subSeason: 'otono',
            })
        } else if (sub === 'invierno') {
            updateTripSearch({
                startDate: '2026-12-15',
                endDate: '2026-12-24',
                selectedMonth: 'Diciembre 2026',
                temporada: 'invierno',
                subSeason: 'invierno',
            })
        }
    }

    const baseSeason = TEMPORADAS[seasonKey]
    const activeSeason = isDualHero
        ? (selectedSubSeason === 'invierno' ? TEMPORADAS.invierno : TEMPORADAS.kamakura)
        : baseSeason

    const exp = EXPERIENCIAS[expKey]

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [temporada, experiencia])

    if (!baseSeason || !exp) return <Navigate to="/viajes/japon" replace />

    return (
        <>
            <Helmet>
                <title>{`${activeSeason.name} ${exp.name} — Japón a la Carta | RutaXAsia`}</title>
                <meta name="description" content={`${activeSeason.name} ${exp.name}: ${exp.tagline} Descubre esta experiencia única y diseña tu viaje a Japón a tu medida con RutaXAsia.`} />
            </Helmet>

            {/* ===== STICKY SELECTION PATH ===== */}
            <div className="jac-selection-path">
                <div className="container jac-path-container">
                    <Link to="/viajes/japon" className="jac-path-step">
                        🇯🇵 Japón a la Carta
                    </Link>
                    <span className="jac-path-divider">/</span>
                    <Link to={`/viajes/japon/${seasonKey}`} className="jac-path-step">
                        {activeSeason.emoji} {activeSeason.name}
                    </Link>
                    <span className="jac-path-divider">/</span>
                    <span className="jac-path-step jac-path-step--active">
                        {exp.icon} {exp.name}
                    </span>
                </div>
            </div>

            {/* ===== INTERACTIVE EXPERIENCES WRAPPER ===== */}
            <div className="jtb-wrapper" style={{
                '--jtb-primary': activeSeason.colors.primary,
                '--jtb-bg': activeSeason.colors.bg
            }}>
                {expKey === 'libre' && (
                    <StepLibre
                        season={activeSeason}
                        temporadaKey={seasonKey}
                        isDualHero={isDualHero}
                        activeSubSeason={selectedSubSeason}
                        onSelectSubSeason={handleSelectSubSeason}
                    />
                )}
                {expKey === 'esencial' && (
                    <StepGuiado
                        season={activeSeason}
                        temporadaKey={seasonKey}
                        isDualHero={isDualHero}
                        activeSubSeason={selectedSubSeason}
                        onSelectSubSeason={handleSelectSubSeason}
                    />
                )}
                {expKey === 'completo' && (
                    <StepAcompanado
                        season={activeSeason}
                        temporadaKey={seasonKey}
                        isDualHero={isDualHero}
                        activeSubSeason={selectedSubSeason}
                        onSelectSubSeason={handleSelectSubSeason}
                    />
                )}
                {expKey === 'signature' && (
                    <StepSignature
                        season={activeSeason}
                        temporadaKey={seasonKey}
                        isDualHero={isDualHero}
                        activeSubSeason={selectedSubSeason}
                        onSelectSubSeason={handleSelectSubSeason}
                    />
                )}
            </div>

            {/* ===== HIGHLIGHTS STRIP ===== */}
            <section className="jac-highlights-strip" style={{ background: activeSeason.colors.primary }}>
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
