import {
    ITINERARIO_ACOMPANADO,
    ACOMPANADO_TODO_INCLUIDO,
    ACOMPANADO_UPSELL,
    EXP_HEROES,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../../data/japonData'
import './StepStyles.css'

/**
 * StepAcompanado — Step 3 for "Acompañado" (Sin Complicaciones) experience.
 * Features: all-inclusive list, day-by-day timeline, why choose this, upsell.
 */
export default function StepAcompanado({ season }) {
    const hero = EXP_HEROES.acompanado
    const waMsg = `SW-Hola quiero info sobre Japón a la Carta - ${season.name} Acompañado`

    return (
        <>
            {/* Hero */}
            <div className="step3-hero">
                <div className="step3-hero-bg">
                    <img src={hero.heroImg} alt={`${season.name} Acompañado`} />
                </div>
                <div className="step3-hero-content container">
                    <div className="step3-hero-badge">
                        {season.emoji} {season.name} — Acompañado
                    </div>
                    <h2 className="step3-hero-headline">{hero.headline}</h2>
                    <p className="step3-hero-sub">{hero.subheadline}</p>
                    <p className="step3-hero-message">"{hero.message}"</p>
                </div>
            </div>

            {/* Todo Incluido */}
            <section className="step3-section" style={{ background: season.colors.bg }}>
                <div className="container">
                    <div className="step3-section-title">✅ Todo Incluido</div>
                    <div className="acomp-todo-grid">
                        {ACOMPANADO_TODO_INCLUIDO.map((item, i) => (
                            <div className="acomp-todo-item" key={i}>
                                <span className="acomp-todo-icon">{item.icon}</span>
                                <span>{item.item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="step3-section">
                <div className="container">
                    <div className="step3-section-title">📅 Itinerario Día por Día</div>
                    <div className="acomp-timeline">
                        {ITINERARIO_ACOMPANADO.map((item) => (
                            <div className="acomp-timeline-item" key={item.day}>
                                <div className="acomp-timeline-dot">{item.day}</div>
                                <div className="acomp-timeline-content">
                                    <div className="acomp-timeline-title">
                                        <span className="acomp-timeline-icon">{item.icon}</span>
                                        Día {item.day}: {item.title}
                                    </div>
                                    <div className="acomp-timeline-desc">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why */}
            <section className="step3-section" style={{ background: '#faf9f7' }}>
                <div className="container">
                    <div className="step3-section-title">💡 ¿Por qué elegir esta experiencia?</div>
                    <div className="acomp-why-grid">
                        <div className="acomp-why-card">
                            <div className="acomp-why-icon">🎯</div>
                            <h4 className="acomp-why-title">Sin planeación</h4>
                            <p className="acomp-why-desc">Todo está organizado para ti. Solo disfruta.</p>
                        </div>
                        <div className="acomp-why-card">
                            <div className="acomp-why-icon">😌</div>
                            <h4 className="acomp-why-title">Sin estrés</h4>
                            <p className="acomp-why-desc">Un coordinador te acompaña 24/7 durante todo el viaje.</p>
                        </div>
                        <div className="acomp-why-card">
                            <div className="acomp-why-icon">🤝</div>
                            <h4 className="acomp-why-title">Grupo reducido</h4>
                            <p className="acomp-why-desc">Viaja en un grupo pequeño con atención personalizada.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upsell */}
            <section className="step3-section">
                <div className="container">
                    <div className="step3-section-title">✨ Experiencias opcionales premium</div>
                    <div className="jtb-extras-grid">
                        {ACOMPANADO_UPSELL.map((item, i) => (
                            <div className="jtb-extra-card" key={i}>
                                <div className="jtb-extra-icon">{item.icon}</div>
                                <h4 className="jtb-extra-title">{item.title}</h4>
                                <p className="jtb-extra-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="step3-cta-section">
                <div className="container">
                    <h3 className="step3-cta-headline">¿Listo para disfrutar Japón sin complicaciones?</h3>
                    <p className="step3-cta-sub">Escríbenos y reserva tu lugar.</p>
                    <a
                        href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                        className="step3-cta-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💬 Reserva tu Viaje Acompañado
                    </a>
                    <div className="step3-cta-phone">
                        o llámanos al <a href={`tel:+52${WHATSAPP_PHONE.replace(/\s/g, '')}`}>{WHATSAPP_PHONE}</a>
                    </div>
                </div>
            </section>
        </>
    )
}
