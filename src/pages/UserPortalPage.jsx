import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import './UserPortalPage.css'

export default function UserPortalPage() {
    const [searchParams] = useSearchParams()
    const urlEmail = searchParams.get('email') || ''
    const urlReserva = searchParams.get('reserva') || ''

    // Session / Auth state
    const [sessionUser, setSessionUser] = useState(() => {
        const saved = localStorage.getItem('rutaxasia_user_session')
        return saved ? JSON.parse(saved) : null
    })

    const [authMode, setAuthMode] = useState('login') // 'login' | 'register'
    const [loginInput, setLoginInput] = useState(urlEmail || urlReserva || '')
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPhone, setRegPhone] = useState('')

    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState('')

    // Dashboard Data State
    const [portalData, setPortalData] = useState(null)
    const [activeTab, setActiveTab] = useState('viajes') // 'viajes' | 'pagos' | 'extras' | 'pasajeros'

    // Passenger Editor State
    const [selectedReservaId, setSelectedReservaId] = useState('')
    const [passengersList, setPassengersList] = useState([])
    const [travelNotes, setTravelNotes] = useState('')
    const [isSavingPassengers, setIsSavingPassengers] = useState(false)
    const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

    const formatPrice = (n) => `$${(Number(n) || 0).toLocaleString('es-MX')} MXN`

    const fetchPortalData = async (queryParam) => {
        setLoading(true)
        setAuthError('')
        try {
            const isEmail = queryParam.includes('@')
            const url = isEmail
                ? `/api/user-portal?email=${encodeURIComponent(queryParam)}`
                : `/api/user-portal?reserva=${encodeURIComponent(queryParam)}`

            const res = await fetch(url)
            const data = await res.json()

            if (!res.ok || data.error) {
                throw new Error(data.error || 'No pudimos encontrar reservas con los datos proporcionados.')
            }

            setPortalData(data)
            setSessionUser({
                email: data.user.email || queryParam,
                name: data.user.name,
                memberId: data.user.memberId,
            })
            localStorage.setItem('rutaxasia_user_session', JSON.stringify({
                email: data.user.email || queryParam,
                name: data.user.name,
                memberId: data.user.memberId,
            }))

            // Init passengers directly from data.pasajeros or fallback to reservation or user
            if (data.pasajeros && data.pasajeros.length > 0) {
                const mapped = data.pasajeros.map((p, idx) => ({
                    id: p._id || idx + 1,
                    fullName: p.nombreCompleto || p.nombre || '',
                    passport: p.numeroPasaporte || p.pasaporte || p.passport || '',
                    passportExpiry: p.fechaVigenciaPasaporte || p.vigenciaPasaporte || p.passportExpiry || '',
                    age: p.edad || '',
                    birthDate: p.fechaNacimiento || p.birthDate || '',
                    nationality: p.nacionalidad || 'Mexicana',
                    phone: p.telefono || p.phone || '',
                    dietary: p.preferencias || p.dietary || '',
                    type: idx === 0 ? 'Titular' : 'Acompañante'
                }))
                setPassengersList(mapped)
            } else if (data.reservas && data.reservas.length > 0) {
                initPassengersFromReserva(data.reservas[0], data.user)
            } else if (data.user) {
                setPassengersList([
                    {
                        id: 1,
                        fullName: data.user.name || '',
                        passport: '',
                        passportExpiry: '',
                        age: '25',
                        birthDate: '',
                        nationality: 'Mexicana',
                        phone: data.user.phone || '',
                        dietary: '',
                        type: 'Titular'
                    }
                ])
            }

            if (data.reservas && data.reservas.length > 0) {
                setSelectedReservaId(data.reservas[0]._id)
            }
        } catch (err) {
            setAuthError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const initPassengersFromReserva = (reserva, userFallback) => {
        if (!reserva) return
        const text = reserva.desgloseCompleto || ''

        // Parse existing passengers if present
        const travelersMatch = text.match(/--- DATOS DE PASAJEROS ACTUALIZADOS ---\n([\s\S]*)/)
        if (travelersMatch && travelersMatch[1]) {
            const lines = travelersMatch[1].split('\n').filter(l => l.startsWith('Pasajero'))
            const parsed = lines.map((line, idx) => {
                const nameMatch = line.match(/: (.*?) \| Pasaporte:/)
                const passMatch = line.match(/Pasaporte: (.*?) \| Vigencia Pasaporte:/) || line.match(/Pasaporte: (.*?) \| Edad:/)
                const expiryMatch = line.match(/Vigencia Pasaporte: (.*?) \| Edad:/)
                const ageMatch = line.match(/Edad: (.*?) \| Nacimiento:/)
                const birthMatch = line.match(/Nacimiento: (.*?) \| Nacionalidad:/)
                const natMatch = line.match(/Nacionalidad: (.*?) \| Teléfono:/)
                const phoneMatch = line.match(/Teléfono: ([^|]*)/)
                const dietMatch = line.match(/Preferencias\/Dieta: (.*)/)

                return {
                    id: idx + 1,
                    fullName: nameMatch ? nameMatch[1].trim() : '',
                    passport: passMatch ? passMatch[1].trim() : '',
                    passportExpiry: expiryMatch ? expiryMatch[1].trim() : '',
                    age: ageMatch ? ageMatch[1].trim() : '',
                    birthDate: birthMatch ? birthMatch[1].trim() : '',
                    nationality: natMatch ? natMatch[1].trim() : 'Mexicana',
                    phone: phoneMatch ? phoneMatch[1].trim() : '',
                    dietary: dietMatch ? dietMatch[1].trim() : '',
                    type: idx === 0 ? 'Titular' : 'Acompañante'
                }
            })
            if (parsed.length > 0) {
                setPassengersList(parsed)
                return
            }
        }

        // Fallback: create default 1 passenger with reserva buyer info
        setPassengersList([
            {
                id: 1,
                fullName: reserva.nombreCompleto || userFallback?.name || '',
                passport: '',
                passportExpiry: '',
                age: '25',
                birthDate: '',
                nationality: 'Mexicana',
                phone: reserva.telfono || userFallback?.phone || '',
                dietary: '',
                type: 'Titular'
            }
        ])
    }

    useEffect(() => {
        if (urlEmail || urlReserva) {
            fetchPortalData(urlEmail || urlReserva)
        } else if (sessionUser?.email) {
            fetchPortalData(sessionUser.email)
        }
    }, [])

    const handleLoginSubmit = (e) => {
        e.preventDefault()
        if (!loginInput.trim()) {
            setAuthError('Por favor ingresa tu correo electrónico o código de reserva.')
            return
        }
        fetchPortalData(loginInput.trim())
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        if (!regEmail.trim() || !regName.trim()) {
            setAuthError('Por favor completa tu nombre y correo electrónico.')
            return
        }
        setLoading(true)
        setAuthError('')
        try {
            const res = await fetch('/api/user-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: regName.trim(),
                    email: regEmail.trim(),
                    phone: regPhone.trim(),
                })
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                throw new Error(data.error || 'Error al registrar la cuenta')
            }

            // Immediately load their dashboard with their new account
            await fetchPortalData(regEmail.trim())
        } catch (err) {
            setAuthError(err.message)
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('rutaxasia_user_session')
        setSessionUser(null)
        setPortalData(null)
        setLoginInput('')
    }

    const handleReservaSelect = (reservaId) => {
        setSelectedReservaId(reservaId)
        const target = portalData?.reservas?.find(r => r._id === reservaId)
        if (target) {
            initPassengersFromReserva(target)
        }
    }

    const handlePassengerChange = (index, field, value) => {
        setPassengersList(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    const addPassenger = () => {
        setPassengersList(prev => [
            ...prev,
            {
                id: prev.length + 1,
                fullName: '',
                passport: '',
                age: '25',
                birthDate: '',
                nationality: 'Mexicana',
                phone: '',
                dietary: '',
                type: 'Acompañante'
            }
        ])
    }

    const removePassenger = (index) => {
        if (passengersList.length <= 1) return
        setPassengersList(prev => prev.filter((_, i) => i !== index))
    }

    const handleSavePassengers = async () => {
        if (!selectedReservaId && portalData?.reservas?.[0]?._id) {
            setSelectedReservaId(portalData.reservas[0]._id)
        }
        const targetId = selectedReservaId || portalData?.reservas?.[0]?._id
        if (!targetId) return

        setIsSavingPassengers(true)
        setSaveSuccessMsg('')
        try {
            const res = await fetch('/api/user-update-viajeros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservaId: targetId,
                    viajeros: passengersList,
                    notasAdicionales: travelNotes
                })
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                throw new Error(data.error || 'Error al guardar los datos')
            }
            setSaveSuccessMsg('✨ ¡Datos de pasajeros y pasaportes actualizados con éxito!')
            setTimeout(() => setSaveSuccessMsg(''), 6000)

            // Re-fetch portal data dynamically
            if (sessionUser?.email) {
                fetchPortalData(sessionUser.email)
            }
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setIsSavingPassengers(false)
        }
    }

    return (
        <div className="portal-container">
            <Helmet>
                <title>Portal del Viajero | Mi Cuenta — RutaXAsia</title>
                <meta name="description" content="Consulta tus reservas, calendario de cuotas, extras contratados y gestiona los datos de tus pasajeros en RutaXAsia." />
            </Helmet>

            <div className="portal-wrap">
                {/* 1. AUTH SCREEN (LOGIN OR REGISTER) */}
                {!portalData ? (
                    <div className="portal-auth-card">
                        <div className="portal-auth-icon">⛩️</div>
                        <h1 className="portal-auth-title">Portal del Viajero</h1>
                        <p className="portal-auth-desc">
                            Gestiona tus viajes a Japón, consulta tus cuotas mensuales y mantén actualizados los datos de tus acompañantes.
                        </p>

                        {/* Auth Mode Toggle Tabs (Ya tengo cuenta vs Crear mi cuenta) */}
                        <div className="portal-auth-tabs">
                            <button
                                type="button"
                                className={`portal-auth-tab-btn${authMode === 'login' ? ' portal-auth-tab-btn--active' : ''}`}
                                onClick={() => { setAuthMode('login'); setAuthError('') }}
                            >
                                🔑 Ya tengo Reserva o Cuenta
                            </button>
                            <button
                                type="button"
                                className={`portal-auth-tab-btn${authMode === 'register' ? ' portal-auth-tab-btn--active' : ''}`}
                                onClick={() => { setAuthMode('register'); setAuthError('') }}
                            >
                                ✨ Crear mi Cuenta
                            </button>
                        </div>

                        {/* MODE 1: LOGIN / LOOKUP BY EMAIL OR CODE */}
                        {authMode === 'login' && (
                            <form onSubmit={handleLoginSubmit} className="portal-auth-form">
                                <div className="portal-input-group">
                                    <label htmlFor="login-input">Correo Electrónico o Código de Reserva</label>
                                    <input
                                        id="login-input"
                                        type="text"
                                        className="portal-input"
                                        placeholder="ej. viajero@gmail.com o RUTA-1045"
                                        value={loginInput}
                                        onChange={(e) => setLoginInput(e.target.value)}
                                        required
                                    />
                                </div>

                                {authError && (
                                    <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.25)' }}>
                                        ⚠️ {authError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="portal-auth-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Accediendo a tu cuenta...' : 'Acceder a Mi Cuenta →'}
                                </button>
                            </form>
                        )}

                        {/* MODE 2: REGISTER NEW TRAVELER */}
                        {authMode === 'register' && (
                            <form onSubmit={handleRegisterSubmit} className="portal-auth-form">
                                <div className="portal-input-group">
                                    <label>Nombre Completo (Nombre y Apellidos)</label>
                                    <input
                                        type="text"
                                        className="portal-input"
                                        placeholder="ej. Carlos Santana"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="portal-input-group">
                                    <label>Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="portal-input"
                                        placeholder="ej. viajero@gmail.com"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="portal-input-group">
                                    <label>Teléfono (WhatsApp)</label>
                                    <input
                                        type="tel"
                                        className="portal-input"
                                        placeholder="ej. +52 55 1234 5678"
                                        value={regPhone}
                                        onChange={(e) => setRegPhone(e.target.value)}
                                    />
                                </div>

                                {authError && (
                                    <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.25)' }}>
                                        ⚠️ {authError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="portal-auth-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando tu cuenta de viajero...' : 'Registrarme y Acceder →'}
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    /* 2. DASHBOARD VIEW WHEN LOGGED IN */
                    <>
                        {/* Header Profile Card */}
                        <div className="portal-header-card">
                            <div className="portal-user-profile">
                                <div className="portal-user-avatar">
                                    {(portalData.user.name || 'V').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <h2 className="portal-user-name">{portalData.user.name}</h2>
                                        <span className="portal-badge-member">👑 Viajero RutaXAsia</span>
                                    </div>
                                    <div className="portal-user-meta">
                                        <span>📧 {portalData.user.email}</span>
                                        {portalData.user.memberId && (
                                            <span>🆔 ID de Viajero: <code>{portalData.user.memberId.substring(0, 8)}...</code></span>
                                        )}
                                        <span>🎒 {portalData.reservas.length} viaje{portalData.reservas.length !== 1 ? 's' : ''} registrado{portalData.reservas.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="portal-logout-btn"
                                onClick={handleLogout}
                            >
                                Cerrar Sesión
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="portal-tabs">
                            <button
                                type="button"
                                className={`portal-tab-btn${activeTab === 'viajes' ? ' portal-tab-btn--active' : ''}`}
                                onClick={() => setActiveTab('viajes')}
                            >
                                ⛩️ Mis Viajes ({portalData.reservas.length})
                            </button>
                            <button
                                type="button"
                                className={`portal-tab-btn${activeTab === 'pagos' ? ' portal-tab-btn--active' : ''}`}
                                onClick={() => setActiveTab('pagos')}
                            >
                                💳 Plan de Cuotas ({portalData.pagosProgramados.length})
                            </button>
                            <button
                                type="button"
                                className={`portal-tab-btn${activeTab === 'extras' ? ' portal-tab-btn--active' : ''}`}
                                onClick={() => setActiveTab('extras')}
                            >
                                🎡 Extras y Tours ({portalData.extras.length})
                            </button>
                            <button
                                type="button"
                                className={`portal-tab-btn${activeTab === 'pasajeros' ? ' portal-tab-btn--active' : ''}`}
                                onClick={() => setActiveTab('pasajeros')}
                            >
                                👥 Datos de Pasajeros ({passengersList.length > 0 ? passengersList.length : portalData.pasajeros.length})
                            </button>
                        </div>

                        {/* TAB 1: MIS VIAJES */}
                        {activeTab === 'viajes' && (
                            <div className="portal-grid">
                                {portalData.reservas.length === 0 ? (
                                    <div className="portal-empty-state" style={{ gridColumn: '1 / -1' }}>
                                        <div className="portal-empty-icon">⛩️</div>
                                        <h3>No encontramos viajes registrados</h3>
                                        <p>Cuando realices una reserva o compres tus tours aparecerán aquí con todo su itinerario.</p>
                                    </div>
                                ) : (
                                    portalData.reservas.map((res) => {
                                        const isPaid = (res.estadoReserva || '').toLowerCase() === 'pagado'
                                        return (
                                            <div key={res._id} className="portal-card">
                                                <div className="portal-card-header">
                                                    <div>
                                                        <h3 className="portal-card-title">{res.temporada || 'Japón'}</h3>
                                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                            Modalidad: <strong>{res.modalidad || 'Personalizado'}</strong>
                                                        </span>
                                                    </div>
                                                    <span className={`portal-status-badge ${isPaid ? 'portal-status-paid' : 'portal-status-unpaid'}`}>
                                                        {isPaid ? '✓ Pagado' : '⏳ No pagado'}
                                                    </span>
                                                </div>

                                                <div className="portal-data-row">
                                                    <span className="portal-data-label">Total del Viaje:</span>
                                                    <span className="portal-data-value">{formatPrice(res.totalEstimado)}</span>
                                                </div>
                                                <div className="portal-data-row">
                                                    <span className="portal-data-label">Anticipo Abonado:</span>
                                                    <span className="portal-data-value">{formatPrice(res.montoAnticipo)}</span>
                                                </div>
                                                <div className="portal-data-row">
                                                    <span className="portal-data-label">Fecha de Registro:</span>
                                                    <span className="portal-data-value">
                                                        {res.fechaRegistro ? new Date(res.fechaRegistro).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Reciente'}
                                                    </span>
                                                </div>

                                                {res.desgloseCompleto && (
                                                    <div style={{ marginTop: '16px', background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                                                        <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>📋 Desglose del Paquete:</strong>
                                                        {res.desgloseCompleto.split('\n--- DATOS DE PASAJEROS')[0]}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}

                        {/* TAB 2: PLAN DE CUOTAS */}
                        {activeTab === 'pagos' && (
                            <div className="portal-installments-list">
                                {portalData.pagosProgramados.length === 0 ? (
                                    <div className="portal-empty-state">
                                        <div className="portal-empty-icon">💳</div>
                                        <h3>No hay cuotas programadas pendientes</h3>
                                        <p>Tus mensualidades aparecerán aquí cuando reserves un paquete con plan de pagos.</p>
                                    </div>
                                ) : (
                                    portalData.pagosProgramados.map((pago) => {
                                        const isPaid = pago.estatus === 'Pagado'
                                        return (
                                            <div key={pago._id} className="portal-installment-item">
                                                <div className="portal-inst-left">
                                                    <div className="portal-inst-number">
                                                        #{pago.nmeorDePagoNmero || '1'}
                                                    </div>
                                                    <div>
                                                        <h4 className="portal-inst-title">{pago.concepto || `Cuota Mensual`}</h4>
                                                        <div className="portal-inst-date">
                                                            📅 Vence el: <strong>{pago.fechaDeVencimiento || pago.fechaDeFacturacin}</strong>
                                                            {pago.reserva && <span style={{ marginLeft: '10px', opacity: 0.7 }}>({pago.reserva})</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="portal-inst-right">
                                                    <div className="portal-inst-amount">
                                                        {formatPrice(pago.importeNmero)}
                                                    </div>
                                                    <span className={`portal-status-badge ${isPaid ? 'portal-status-paid' : 'portal-status-unpaid'}`}>
                                                        {isPaid ? '✓ Pagado' : '⏳ Pendiente'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}

                        {/* TAB 3: EXTRAS Y TOURS */}
                        {activeTab === 'extras' && (
                            <div className="portal-grid">
                                {portalData.extras.length === 0 ? (
                                    <div className="portal-empty-state" style={{ gridColumn: '1 / -1' }}>
                                        <div className="portal-empty-icon">🎡</div>
                                        <h3>No hay tours extras registrados</h3>
                                        <p>Todas tus experiencias incluidas y adicionales se enlistarán aquí.</p>
                                    </div>
                                ) : (
                                    portalData.extras.map((ex) => {
                                        const isFree = (ex.tipoDeTourExtra || '').includes('Gratis') || ex.precioUnitario === '$0 MXN'
                                        return (
                                            <div key={ex._id} className="portal-card">
                                                <div className="portal-card-header">
                                                    <div>
                                                        <h4 className="portal-card-title">{ex.nombre}</h4>
                                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                            📍 Ciudad: <strong>{ex.ciudad || 'Japón'}</strong>
                                                        </span>
                                                    </div>
                                                    <span className={`portal-status-badge ${isFree ? 'portal-status-paid' : 'portal-status-unpaid'}`}>
                                                        {isFree ? '✨ Gratis (Incluida)' : '💎 Extra'}
                                                    </span>
                                                </div>

                                                <div className="portal-data-row">
                                                    <span className="portal-data-label">Boletos / Pasajeros:</span>
                                                    <span className="portal-data-value">{ex.cantidad || 1}</span>
                                                </div>
                                                <div className="portal-data-row">
                                                    <span className="portal-data-label">Precio Unitario:</span>
                                                    <span className="portal-data-value">{ex.precioUnitario || '$0 MXN'}</span>
                                                </div>
                                                <div className="portal-data-row">
                                                    <span className="portal-data-label">Subtotal:</span>
                                                    <span className="portal-data-value">{ex.subtotal || '$0 MXN'}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}

                        {/* TAB 4: PASAJEROS & PASAPORTES (EDICION EN TIEMPO REAL) */}
                        {activeTab === 'pasajeros' && (
                            <div className="portal-passengers-container">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>
                                            👥 Gestión de Pasajeros & Documentación
                                        </h3>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                                            Mantén actualizados los nombres completos, pasaportes y preferencias de tu grupo. Los cambios se sincronizan de forma segura con tu reserva.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="portal-tab-btn"
                                        onClick={addPassenger}
                                        style={{ background: 'rgba(233, 30, 99, 0.2)', color: 'var(--color-primary, #e91e63)', borderColor: 'rgba(233, 30, 99, 0.4)' }}
                                    >
                                        + Agregar Acompañante
                                    </button>
                                </div>

                                {/* Multi-reserva selector if user has > 1 booking */}
                                {portalData.reservas.length > 1 && (
                                    <div style={{ marginBottom: '20px', background: 'rgba(15, 23, 42, 0.7)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 700 }}>Seleccionar Viaje:</span>
                                        <select
                                            className="portal-input"
                                            style={{ maxWidth: '320px', padding: '8px 12px' }}
                                            value={selectedReservaId}
                                            onChange={(e) => handleReservaSelect(e.target.value)}
                                        >
                                            {portalData.reservas.map((r, i) => (
                                                <option key={r._id} value={r._id}>
                                                    Viaje #{i + 1}: {r.temporada || 'Japón'} ({r.modalidad || 'Reserva'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {saveSuccessMsg && (
                                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '20px', fontWeight: 700 }}>
                                        {saveSuccessMsg}
                                    </div>
                                )}

                                {passengersList.map((passenger, idx) => (
                                    <div key={passenger.id || idx} className="portal-passenger-card">
                                        <div className="portal-passenger-header">
                                            <div className="portal-passenger-title">
                                                <span>{idx === 0 ? '👑 Pasajero Titular' : `👤 Pasajero #${idx + 1}`}</span>
                                            </div>
                                            {idx > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePassenger(idx)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                                                >
                                                    ✕ Eliminar
                                                </button>
                                            )}
                                        </div>

                                        <div className="portal-pass-form-grid">
                                            <div className="portal-input-group">
                                                <label>Nombre y Apellidos (como en pasaporte)</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={passenger.fullName}
                                                    onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                                                    placeholder="ej. Juan Carlos Pérez"
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Número de Pasaporte</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={passenger.passport}
                                                    onChange={(e) => handlePassengerChange(idx, 'passport', e.target.value)}
                                                    placeholder="ej. G12345678"
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                    <label style={{ margin: 0 }}>Vigencia de Pasaporte (Calendario)</label>
                                                    {passenger.passportExpiry && (() => {
                                                        const d = new Date(passenger.passportExpiry)
                                                        const now = new Date()
                                                        const diffMonths = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth())
                                                        if (d < now) return <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 800 }}>❌ Vencido</span>
                                                        if (diffMonths < 6) return <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>⚠️ Menor a 6 meses</span>
                                                        return <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>✓ Válido (+6 meses)</span>
                                                    })()}
                                                </div>
                                                <input
                                                    type="date"
                                                    className="portal-input"
                                                    value={passenger.passportExpiry}
                                                    onChange={(e) => handlePassengerChange(idx, 'passportExpiry', e.target.value)}
                                                />
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                                                    🛂 Mínimo 6 meses de vigencia requeridos posteriores a la fecha del viaje por autoridades migratorias.
                                                </span>
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Nacionalidad</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={passenger.nationality}
                                                    onChange={(e) => handlePassengerChange(idx, 'nationality', e.target.value)}
                                                    placeholder="ej. Mexicana"
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Edad / Fecha de Nacimiento</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={passenger.age}
                                                    onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                                                    placeholder="ej. 28 años o DD/MM/AAAA"
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Teléfono / WhatsApp</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={passenger.phone}
                                                    onChange={(e) => handlePassengerChange(idx, 'phone', e.target.value)}
                                                    placeholder="ej. +52 55 1234 5678"
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Preferencias Dietéticas / Notas Médicas</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={passenger.dietary}
                                                    onChange={(e) => handlePassengerChange(idx, 'dietary', e.target.value)}
                                                    placeholder="ej. Vegetariano, alergia a mariscos"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        className="portal-save-btn"
                                        onClick={handleSavePassengers}
                                        disabled={isSavingPassengers}
                                    >
                                        {isSavingPassengers ? 'Guardando datos...' : '💾 Guardar Datos de Pasajeros'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
