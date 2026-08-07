import { useState } from 'react'
import {
    SIGNATURE_EXPERIENCIAS,
    SIGNATURE_HOSPEDAJE,
    SIGNATURE_JUAN,
    EXP_HEROES,
    WHATSAPP_BASE,
    WHATSAPP_PHONE,
} from '../../data/japonData'
import './StepStyles.css'
import CheckoutModal from './CheckoutModal'
import TripSelectorBar from './TripSelectorBar'

/**
 * StepSignature — Step 3 for "Signature" premium experience.
 * Dark theme with gold accents. Fully bespoke content.
 */
export default function StepSignature({ season }) {
    const hero = EXP_HEROES.signature
    const [interests, setInterests] = useState([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [selectorData, setSelectorData] = useState({
        dateMode: 'exact',
        startDate: '2026-10-15',
        endDate: '2026-10-28',
        selectedMonth: 'Octubre 2026',
        adults: 2,
        children: 0,
    })

    const toggleInterest = (name) => {
        setInterests(prev =>
            prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
        )
    }

    const interestList = [
        { name: 'Gastronomía Kaiseki & Sushi 🍣', label: 'Gastronomía' },
        { name: 'Templos y Espiritualidad Ancestral ⛩️', label: 'Espiritualidad' },
        { name: 'Naturaleza y Baños Termales Onsen ♨️', label: 'Naturaleza & Onsen' },
        { name: 'Arte Contemporáneo, Museos y Diseño 🎨', label: 'Arte & Diseño' },
        { name: 'Distritos de Tecnología, Anime y Tendencias 🤖', label: 'Tecnología & Anime' },
        { name: 'Hospedajes en Templos (Shukubo) y Ryokans Históricos 🏯', label: 'Hospedajes Singulares' }
    ]

    const waMsg = `SW-Hola quiero info sobre Japón Signature - ${season.name}.${interests.length ? ` Tengo especial interés en: ${interests.map(name => interestList.find(x => x.name === name)?.label || name).join(', ')}.` : ''}`

    return (
        <div className="sig-wrapper">
            {/* Hero — Dark Premium */}
            <div className="sig-hero-wrapper">
                <div className="sig-hero-bg">
                    <img src={season.heroImage} alt={`${season.name} Signature`} />
                </div>
                <div className="sig-hero-overlay" />
                <div className="sig-hero-content container">
                    <div className="sig-hero-badge">
                        <span>👑 {season.name} Signature</span>
                    </div>
                    <h2 className="sig-hero-title">
                        {hero.headline.split(' ').slice(0, 3).join(' ')}{' '}
                        <span>{hero.headline.split(' ').slice(3).join(' ')}</span>
                    </h2>
                    <p className="sig-hero-desc">{hero.subheadline}</p>
                    <p className="sig-hero-quote">{hero.message}</p>
                </div>
            </div>

            {/* Diseñado para ti */}
            <section className="sig-section">
                <div className="container">
                    <TripSelectorBar selectorData={selectorData} onChange={setSelectorData} />
                    <div className="sig-intro-grid">
                        <h3 className="sig-intro-lead">
                            Tu Viaje a Japón, <span>Diseñado Desde Cero</span>
                        </h3>
                        <p className="sig-intro-paragraph">
                            En RutaXAsia Signature no creemos en itinerarios de catálogo. Cada viaje es un lienzo en blanco diseñado personalmente para reflejar tus pasiones, tu ritmo y tu nivel de inversión. Disfruta la máxima exclusividad y la asesoría personalizada de nuestro equipo especializado.
                        </p>
                    </div>

                    <div className="sig-pass-includes-grid">
                        {[
                            { icon: '🎯', title: 'Tus Intereses', desc: 'Diseñamos cada actividad en torno a tus pasiones.' },
                            { icon: '💰', title: 'Tu Inversión', desc: 'Adaptamos el nivel de lujo y experiencias a tu presupuesto.' },
                            { icon: '📅', title: 'Tus Fechas', desc: 'Viaja con total flexibilidad en el momento exacto que desees.' },
                            { icon: '✨', title: 'Tu Ritmo', desc: 'Equilibramos días de exploración intensa con descanso.' },
                        ].map((item, i) => (
                            <div className="sig-include-item" key={i}>
                                <div className="sig-include-icon-wrap">{item.icon}</div>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bespoke Interactive Selector */}
            <section className="sig-section sig-section--alt">
                <div className="container">
                    <div className="sig-configurator-header">
                        <div className="sig-title">Configurador de Intereses Signature</div>
                        <p className="sig-interest-sub">
                            Selecciona los elementos que te gustaría incorporar en tu viaje. Tu perfil de selección se enviará directamente a nuestro equipo de diseño de experiencias.
                        </p>
                    </div>

                    <div className="sig-interest-grid">
                        {interestList.map((item, i) => {
                            const active = interests.includes(item.name)
                            return (
                                <div
                                    key={i}
                                    className={`sig-interest-card${active ? ' sig-interest-card--active' : ''}`}
                                    onClick={() => toggleInterest(item.name)}
                                >
                                    <div className="sig-interest-chk">
                                        {active && <span className="sig-interest-chk-mark">✓</span>}
                                    </div>
                                    <span className="sig-interest-text">{item.name}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Summary visual feedback */}
                    {interests.length > 0 && (
                        <div className="sig-summary-panel">
                            <h4 className="sig-summary-title">✨ Perfil de Viaje Seleccionado ({interests.length})</h4>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(240, 230, 200, 0.6)', margin: '0 0 15px' }}>
                                Tu itinerario personalizado incluirá un enfoque especial en:
                            </p>
                            <div className="sig-summary-tags">
                                {interests.map((interest, idx) => {
                                    const item = interestList.find(x => x.name === interest)
                                    return (
                                        <span key={idx} className="sig-summary-tag">
                                            🌟 {item ? item.label : interest}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Experiencias Signature */}
            <section className="sig-section">
                <div className="container">
                    <div className="sig-title">Experiencias Exclusivas Signature</div>
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
            <section className="sig-section sig-section--alt">
                <div className="container">
                    <div className="sig-title">Hospedaje Signature — Lujo Tradicional y Contemporáneo</div>
                    <div className="sig-hosp-grid">
                        {SIGNATURE_HOSPEDAJE.map((hosp, i) => (
                            <div className="sig-hosp-card" key={i}>
                                <div className="sig-hosp-icon">{hosp.icon}</div>
                                <h4 className="sig-hosp-cat">{hosp.category}</h4>
                                <div className="sig-hosp-stars">
                                    {'★'.repeat(hosp.stars)}{'☆'.repeat(5 - hosp.stars)}
                                </div>
                                <p className="sig-hosp-desc">{hosp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Juan y Ale Profile Spotlight & Gallery */}
            <section className="sig-hosts-section">
                <div className="container">
                    <div className="sig-title">Tus Anfitriones Signature</div>
                    
                    <div className="sig-hosts-content">
                        {/* Left: Beautiful Photo frame with Juan & Ale */}
                        <div className="sig-hosts-visual">
                            <div className="sig-hosts-photo-frame">
                                <img src="/images/juan_and_ale.png" alt="Juan y Ale en Japón" className="sig-hosts-main-img" />
                                <div className="sig-hosts-photo-caption">
                                    <span>📸 Juan y Ale — Diseñadores de RutaXAsia</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Narrative / Bios */}
                        <div className="sig-hosts-text">
                            <span className="sig-hosts-subtitle">Tus Diseñadores y Acompañantes de Viaje</span>
                            <h3>Juan & Ale</h3>
                            <p className="sig-hosts-lead-quote">
                                "No diseñamos viajes de catálogo; abrimos las puertas a nuestro Japón personal, el que hemos descubierto y vivido juntos durante años."
                            </p>
                            
                            <div className="sig-hosts-bios">
                                <div className="sig-host-bio-card">
                                    <h4>⛩️ Juan Santiago</h4>
                                    <p>
                                        Con más de 20 años recorriendo Japón, Juan domina la logística impecable del tren bala y los rincones históricos más resguardados. Su misión es guiarte a través del Japón espiritual y auténtico.
                                    </p>
                                </div>
                                <div className="sig-host-bio-card">
                                    <h4>🌸 Alejandra Torres</h4>
                                    <p>
                                        Curadora y amante de la gastronomía contemporánea, el arte y el bienestar. Ale selecciona personalmente cada ryokan boutique, onsen privado y restaurante exclusivo de tu itinerario.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Travel Log Gallery */}
                    <div className="sig-gallery-container">
                        <h4 className="sig-gallery-title">📸 Bitácora de Viaje — Momentos de Juan y Ale en Japón</h4>
                        <div className="sig-gallery-grid">
                            {[
                                { img: '/images/journey/kimono-asakusa.jpg', caption: 'Tradición en Asakusa' },
                                { img: '/images/journey/shibuya-noche.jpg', caption: 'Tokio de Noche' },
                                { img: '/images/journey/ramen.jpg', caption: 'Gastronomía Local' },
                                { img: '/images/journey/sensoji.jpeg', caption: 'Templos Históricos' },
                            ].map((item, idx) => (
                                <div className="sig-gallery-item" key={idx}>
                                    <img src={item.img} alt={item.caption} loading="lazy" />
                                    <div className="sig-gallery-item-overlay">
                                        <span>{item.caption}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="sig-cta">
                <div className="container">
                    <div className="sig-cta-invitation">
                        <h3 className="sig-cta-headline">Solicita Tu Diseño Personalizado</h3>
                        <p className="sig-cta-sub">
                            Cuéntanos cómo quieres vivir Japón y diseñamos tu itinerario exclusivo Signature sin compromiso, o aparta hoy mismo.
                        </p>
                        
                        <div className="sig-cta-actions">
                            <a
                                href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                                className="sig-cta-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                👑 Solicitar Invitación & Diseño
                            </a>
                            
                            <button
                                type="button"
                                className="sig-cta-checkout-btn"
                                onClick={() => setIsCheckoutOpen(true)}
                            >
                                💳 Apartar y Pagar Anticipo
                            </button>
                        </div>
                        
                        <div className="sig-cta-phone">
                            o llámanos directamente al <a href={`tel:+52${WHATSAPP_PHONE.replace(/\s/g, '')}`}>{WHATSAPP_PHONE}</a>
                        </div>
                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                season={season}
                estilo="Signature"
                totalPrice={150000}
                desglose={
                    `Viaje Signature (${season.name}). ` +
                    (interests.length ? `Intereses especiales: ${interests.join(', ')}.` : 'Sin intereses seleccionados.')
                }
            />
        </div>
    )
}
