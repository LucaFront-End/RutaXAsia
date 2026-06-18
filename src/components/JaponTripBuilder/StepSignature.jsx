import {
    SIGNATURE_EXPERIENCIAS,
    SIGNATURE_HOSPEDAJE,
    SIGNATURE_JUAN,
    EXP_HEROES,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../../data/japonData'
import './StepStyles.css'

/**
 * StepSignature — Step 3 for "Signature" premium experience.
 * Dark theme with gold accents. Fully bespoke content.
 */
export default function StepSignature({ season }) {
    const hero = EXP_HEROES.signature
    const waMsg = `SW-Hola quiero info sobre Japón Signature - ${season.name}`

    return (
        <>
            {/* Hero — Dark Premium */}
            <div className="step3-hero" style={{ minHeight: 280 }}>
                <div className="step3-hero-bg">
                    <img src={hero.heroImg} alt={`${season.name} Signature`} />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.6) 100%)',
                        zIndex: 1,
                    }} />
                </div>
                <div className="step3-hero-content container" style={{ zIndex: 3 }}>
                    <div className="step3-hero-badge" style={{ borderColor: '#d4af37', color: '#d4af37' }}>
                        👑 {season.name} — Signature
                    </div>
                    <h2 className="step3-hero-headline" style={{ color: '#f0e6c8' }}>{hero.headline}</h2>
                    <p className="step3-hero-sub">{hero.subheadline}</p>
                    <p className="step3-hero-message" style={{ color: '#d4af37' }}>"{hero.message}"</p>
                </div>
            </div>

            {/* Diseñado para ti */}
            <section className="sig-section">
                <div className="container">
                    <div className="sig-title">💎 Diseñado exclusivamente para ti</div>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 700, marginBottom: 30 }}>
                        No existen itinerarios predefinidos. Cada viaje Signature se crea considerando tus intereses, presupuesto, fechas y estilo de viaje. Es una experiencia completamente a tu medida.
                    </p>
                    <div className="jtb-pass-includes-grid">
                        {[
                            { icon: '🎯', title: 'Tus Intereses', desc: 'Diseñamos cada actividad según lo que te apasiona.' },
                            { icon: '💰', title: 'Tu Presupuesto', desc: 'Adaptamos la experiencia a tu nivel de inversión.' },
                            { icon: '📅', title: 'Tus Fechas', desc: 'Viaja cuando tú quieras, sin fechas fijas.' },
                            { icon: '✨', title: 'Tu Estilo', desc: 'Cada detalle refleja tu forma de viajar.' },
                        ].map((item, i) => (
                            <div className="jtb-pass-include-item" key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
                                <span className="jtb-pass-include-icon">{item.icon}</span>
                                <div className="jtb-pass-include-text">
                                    <h4 style={{ color: '#f0e6c8' }}>{item.title}</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Experiencias Signature */}
            <section className="sig-section sig-section--alt">
                <div className="container">
                    <div className="sig-title">👑 Experiencias Signature</div>
                    <div className="sig-exp-grid">
                        {SIGNATURE_EXPERIENCIAS.map((exp, i) => (
                            <div className="sig-exp-card" key={i}>
                                <div className="sig-exp-icon">{exp.icon}</div>
                                <h4 className="sig-exp-title">{exp.title}</h4>
                                <p className="sig-exp-desc">{exp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hospedaje Signature */}
            <section className="sig-section">
                <div className="container">
                    <div className="sig-title">🏨 Hospedaje Signature</div>
                    <div className="sig-hosp-grid">
                        {SIGNATURE_HOSPEDAJE.map((hosp, i) => (
                            <div className="sig-hosp-card" key={i}>
                                <div className="sig-hosp-icon">{hosp.icon}</div>
                                <div className="sig-hosp-cat">{hosp.category}</div>
                                <div className="sig-hosp-stars">
                                    {'★'.repeat(hosp.stars)}{'☆'.repeat(5 - hosp.stars)}
                                </div>
                                <p className="sig-hosp-desc">{hosp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Juan Santiago */}
            <section className="sig-juan-section">
                <div className="container">
                    <div className="sig-title">🎌 Con la experiencia de Juan Santiago</div>
                    <div className="sig-juan-content">
                        <div className="sig-juan-text">
                            <h3>{SIGNATURE_JUAN.name}</h3>
                            <div className="sig-juan-title">{SIGNATURE_JUAN.title} — {SIGNATURE_JUAN.experience}</div>
                            <p className="sig-juan-desc">{SIGNATURE_JUAN.desc}</p>
                            <ul className="sig-juan-highlights">
                                {SIGNATURE_JUAN.highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="sig-juan-visual">
                            <div className="sig-juan-badge">⛩️</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="sig-cta">
                <div className="container">
                    <h3 className="sig-cta-headline">Solicita tu diseño personalizado</h3>
                    <p className="sig-cta-sub">Cuéntanos cómo quieres vivir Japón y diseñamos tu experiencia Signature.</p>
                    <a
                        href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                        className="sig-cta-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        👑 Solicitar Diseño Personalizado
                    </a>
                    <div className="step3-cta-phone" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        o llámanos al <a href={`tel:+52${WHATSAPP_PHONE.replace(/\s/g, '')}`} style={{ color: '#d4af37' }}>{WHATSAPP_PHONE}</a>
                    </div>
                </div>
            </section>
        </>
    )
}
