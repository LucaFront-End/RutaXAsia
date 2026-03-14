import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { LuMessageCircle, LuMail, LuPhone, LuMapPin, LuClock, LuInstagram, LuFacebook } from 'react-icons/lu'
import { FaTiktok } from 'react-icons/fa6'
import { submitFormToCMS } from '../lib/wixClient'

const WHATSAPP_URL = 'https://wa.me/525513610083?text=SW%20Hola%20quiero%20info%20sobre%20viajes'

const CONTACT_METHODS = [
    { icon: <LuMessageCircle size={28} />, title: 'WhatsApp', desc: 'Respuesta en menos de 2 horas', value: '55 13 61 00 83', href: WHATSAPP_URL, cta: 'Escribir por WhatsApp', external: true },
    { icon: <LuMail size={28} />, title: 'Email', desc: 'Para consultas detalladas', value: 'reservas@rutaxasia.com', href: 'mailto:reservas@rutaxasia.com', cta: 'Enviar email', external: false },
    { icon: <LuPhone size={28} />, title: 'Teléfono', desc: 'Lunes a Viernes 9am - 7pm', value: '55 13 61 00 83', href: 'tel:+525513610083', cta: 'Llamar ahora', external: false },
]

const SOCIAL_LINKS = [
    { name: 'Instagram', url: 'https://www.instagram.com/rutaxasia', icon: <LuInstagram size={16} /> },
    { name: 'Facebook', url: 'https://www.facebook.com/rutaxasia', icon: <LuFacebook size={16} /> },
    { name: 'TikTok', url: 'https://www.tiktok.com/@rutaxasia', icon: <FaTiktok size={14} /> },
]

export default function Contact() {
    const [formData, setFormData] = useState({ nombre: '', email: '', tel: '', viaje: '', mensaje: '' })
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => { window.scrollTo(0, 0) }, [])

    useEffect(() => {
        const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target) } })
        }, { threshold: 0.12 })
        els.forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await submitFormToCMS({ nombre: formData.nombre, email: formData.email, telefono: formData.tel, viaje: formData.viaje, mensaje: formData.mensaje })
            setSubmitted(true)
        } catch (err) {
            console.error('Form error:', err)
            setSubmitted(true)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Helmet>
                <title>Contacto | RutaXAsia Viajes a Japón desde México</title>
                <meta name="description" content="Contacta a RutaXAsia, la agencia #1 de viajes a Japón desde México. Asesoría para viaje a Japón México, viajes a Corea del Sur y los mejores precios a Japón." />
            </Helmet>

            {/* ===== HERO ===== */}
            <section className="contact-hero">
                <div className="contact-hero-bg">
                    <img src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1920&h=1080&fit=crop&q=80" alt="Sakura" />
                </div>
                <div className="contact-hero-overlay" />
                <div className="contact-hero-content container">
                    <span className="contact-hero-label">Hablemos</span>
                    <h1 className="contact-hero-h1">Contactanos</h1>
                    <p className="contact-hero-sub">Estamos para ayudarte a planear el viaje de tu vida</p>
                </div>
            </section>

            {/* ===== CONTACT METHODS ===== */}
            <section className="contact-methods container">
                <div className="contact-methods-grid">
                    {CONTACT_METHODS.map((m, i) => (
                        <a key={i} href={m.href} target={m.external ? '_blank' : undefined} rel={m.external ? 'noopener noreferrer' : undefined} className={`contact-method-card reveal`} style={{"--delay":`${i * 0.1}s`}}>
                            <span className="contact-method-icon">{m.icon}</span>
                            <h3 className="contact-method-title">{m.title}</h3>
                            <p className="contact-method-desc">{m.desc}</p>
                            <span className="contact-method-value">{m.value}</span>
                            <span className="contact-method-cta">{m.cta} →</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* ===== FORM + MAP ===== */}
            <section className="contact-form-section container">
                <div className="contact-form-grid">
                    <div className="contact-form-box reveal-left">
                        <h2 className="td-section-label">Envianos un mensaje</h2>
                        <p className="contact-form-subtitle">Completá el formulario y te respondemos a la brevedad</p>

                        {submitted ? (
                            <div className="contact-success">
                                <LuMessageCircle size={48} style={{color:'var(--color-primary)'}} />
                                <h3>¡Mensaje enviado!</h3>
                                <p>Te respondemos en menos de 24 horas. Revisá tu email.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="contact-form-row">
                                    <div className="contact-field">
                                        <label>Nombre completo *</label>
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre" required />
                                    </div>
                                    <div className="contact-field">
                                        <label>Email *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required />
                                    </div>
                                </div>
                                <div className="contact-form-row">
                                    <div className="contact-field">
                                        <label>Teléfono</label>
                                        <input type="tel" name="tel" value={formData.tel} onChange={handleChange} placeholder="+52 55 1234 5678" />
                                    </div>
                                    <div className="contact-field">
                                        <label>Viaje de interés</label>
                                        <select name="viaje" value={formData.viaje} onChange={handleChange}>
                                            <option value="">Seleccionar viaje</option>
                                            <option value="Sakura I 2026">Sakura I 2026 — Mayo</option>
                                            <option value="Verano Japón 2026">Verano Japón 2026 — Julio</option>
                                            <option value="Corea 2026">Corea 2026 — Octubre</option>
                                            <option value="Otoño Japón 2026">Otoño Japón 2026 — Noviembre</option>
                                            <option value="Otro">Otro / No sé todavía</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="contact-field">
                                    <label>Mensaje</label>
                                    <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} placeholder="Contanos qué querés saber..." rows="4" />
                                </div>
                                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                                    {submitting ? 'Enviando...' : 'Enviar mensaje'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="contact-info-box reveal-right" style={{"--delay":"0.15s"}}>
                        <div className="contact-office">
                            <h3 className="contact-office-title"><LuMapPin size={16} style={{verticalAlign:'middle', marginRight:'0.4rem'}} /> Nuestra oficina</h3>
                            <p className="contact-office-addr">
                                Río Lerma 232 Piso 23<br />
                                Torre Diana, CP. 06500<br />
                                Col. Cuauhtémoc, Ciudad de México
                            </p>
                            <div className="contact-map">
                                <iframe
                                    title="Ubicación RutaXAsia"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.661!2d-99.1677!3d19.4284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35f5bd1563%3A0x6c366f0e2de02ff7!2sTorre%20Diana!5e0!3m2!1ses!2smx!4v1"
                                    width="100%"
                                    height="200"
                                    style={{ border: 0, borderRadius: '12px' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>

                        <div className="contact-schedule">
                            <h3 className="contact-office-title"><LuClock size={16} style={{verticalAlign:'middle', marginRight:'0.4rem'}} /> Horario de atención</h3>
                            <ul className="contact-schedule-list">
                                <li><span>Lunes a Viernes</span><span>9:00 AM – 7:00 PM</span></li>
                                <li><span>Sábados</span><span>10:00 AM – 2:00 PM</span></li>
                                <li><span>Domingos</span><span>Cerrado</span></li>
                                <li className="contact-schedule-note">WhatsApp: Respondemos 24/7</li>
                            </ul>
                        </div>

                        <div className="contact-social">
                            <h3 className="contact-office-title">Seguinos en redes</h3>
                            <div className="contact-social-links">
                                {SOCIAL_LINKS.map((s, i) => (
                                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="contact-social-link">
                                        {s.icon} {s.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
