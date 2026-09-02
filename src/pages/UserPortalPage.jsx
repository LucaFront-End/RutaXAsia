import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { LuEye, LuEyeOff, LuStar, LuCheck, LuClock, LuPlus, LuUser, LuLock, LuMapPin, LuPhone, LuMail } from 'react-icons/lu'
import './UserPortalPage.css'

export default function UserPortalPage() {
    const [searchParams] = useSearchParams()
    const urlEmail = searchParams.get('email') || ''

    // Session / Auth state
    const [sessionUser, setSessionUser] = useState(() => {
        const saved = localStorage.getItem('rutaxasia_user_session')
        return saved ? JSON.parse(saved) : null
    })

    // Auth Form State
    const [authMode, setAuthMode] = useState('login') // 'login' | 'register' | 'forgot'
    const [loginEmail, setLoginEmail] = useState(urlEmail || sessionUser?.email || '')
    const [loginPassword, setLoginPassword] = useState('')
    const [showLoginPassword, setShowLoginPassword] = useState(false)

    // Register Form State
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPhone, setRegPhone] = useState('')
    const [regCity, setRegCity] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [showRegPassword, setShowRegPassword] = useState(false)

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotSuccessMsg, setForgotSuccessMsg] = useState('')

    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState('')

    // Dashboard Data State
    const [portalData, setPortalData] = useState(null)
    const [activeTab, setActiveTab] = useState('viajes') // 'viajes' | 'pagos' | 'pasajeros' | 'resenas' | 'perfil'

    // Passenger Editor State
    const [selectedReservaId, setSelectedReservaId] = useState('')
    const [passengersList, setPassengersList] = useState([])
    const [isSavingPassengers, setIsSavingPassengers] = useState(false)
    const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

    // Review Modal State (from Portal)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [revTrip, setRevTrip] = useState('')
    const [revRating, setRevRating] = useState(5)
    const [revComment, setRevComment] = useState('')
    const [revPhoto, setRevPhoto] = useState('')
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)
    const [reviewSuccessModal, setReviewSuccessModal] = useState(false)

    // Profile Edit State
    const [profileName, setProfileName] = useState('')
    const [profilePhone, setProfilePhone] = useState('')
    const [profileCity, setProfileCity] = useState('')
    const [profilePhoto, setProfilePhoto] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileSuccessMsg, setProfileSuccessMsg] = useState('')
    const [profileErrorMsg, setProfileErrorMsg] = useState('')

    const formatPrice = (n) => `$${(Number(n) || 0).toLocaleString('es-MX')} MXN`

    const fetchPortalData = async (emailParam, contactIdParam) => {
        setLoading(true)
        setAuthError('')
        try {
            let url = '/api/user-portal?'
            const params = new URLSearchParams()
            if (emailParam) params.append('email', emailParam.trim())
            if (contactIdParam) params.append('contactId', contactIdParam.trim())
            url += params.toString()

            const res = await fetch(url)
            const data = await res.json()

            if (!res.ok || data.error) {
                throw new Error(data.error || 'No pudimos encontrar datos para esta cuenta.')
            }

            setPortalData(data)
            const sessionObj = {
                email: data.user.email || emailParam,
                name: data.user.name,
                contactId: data.user.contactId,
                memberId: data.user.memberId,
                phone: data.user.phone,
                city: data.user.city,
                photo: data.user.photo,
            }
            setSessionUser(sessionObj)
            localStorage.setItem('rutaxasia_user_session', JSON.stringify(sessionObj))

            // Initialize profile form
            setProfileName(data.user.name || '')
            setProfilePhone(data.user.phone || '')
            setProfileCity(data.user.city || 'México')
            setProfilePhoto(data.user.photo || '')

            // Init passengers
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
                setRevTrip(data.reservas[0].temporada || '')
            } else {
                setRevTrip('')
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
        if (sessionUser?.email) {
            fetchPortalData(sessionUser.email, sessionUser.contactId)
        }
    }, [])

    // 1. Submit Login (Email + Password)
    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        if (!loginEmail.trim() || !loginPassword.trim()) {
            setAuthError('Por favor ingresa tu correo electrónico y tu contraseña.')
            return
        }

        setLoading(true)
        setAuthError('')

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    email: loginEmail.trim(),
                    password: loginPassword.trim()
                })
            })

            const data = await res.json()
            if (!res.ok || data.error) {
                throw new Error(data.error || 'Error al iniciar sesión.')
            }

            // Successfully authenticated, load portal data
            await fetchPortalData(data.user.email, data.user.contactId)
        } catch (err) {
            setAuthError(err.message)
            setLoading(false)
        }
    }

    // 2. Submit Register
    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        if (!regEmail.trim() || !regName.trim() || !regPassword.trim()) {
            setAuthError('Por favor completa tu nombre, correo electrónico y contraseña.')
            return
        }

        if (regPassword.length < 6) {
            setAuthError('La contraseña debe tener un mínimo de 6 caracteres.')
            return
        }

        setLoading(true)
        setAuthError('')

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register',
                    name: regName.trim(),
                    email: regEmail.trim(),
                    phone: regPhone.trim(),
                    city: regCity.trim(),
                    password: regPassword.trim(),
                })
            })

            const data = await res.json()
            if (!res.ok || data.error) {
                throw new Error(data.error || 'Error al registrar la cuenta')
            }

            // Immediately load their dashboard with their new account
            await fetchPortalData(data.user.email, data.user.contactId)
        } catch (err) {
            setAuthError(err.message)
            setLoading(false)
        }
    }

    // 3. Submit Forgot Password
    const handleForgotSubmit = async (e) => {
        e.preventDefault()
        if (!forgotEmail.trim()) {
            setAuthError('Por favor ingresa tu correo electrónico.')
            return
        }

        setLoading(true)
        setAuthError('')
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'forgot-password',
                    email: forgotEmail.trim()
                })
            })
            const data = await res.json()
            setForgotSuccessMsg(data.message || 'Instrucciones enviadas.')
        } catch (err) {
            setAuthError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('rutaxasia_user_session')
        setSessionUser(null)
        setPortalData(null)
        setLoginEmail('')
        setLoginPassword('')
    }

    const handleReservaSelect = (reservaId) => {
        setSelectedReservaId(reservaId)
        const target = portalData?.reservas?.find(r => r._id === reservaId)
        if (target) {
            initPassengersFromReserva(target)
            setRevTrip(target.temporada || 'Japón')
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
                passportExpiry: '',
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
        setIsSavingPassengers(true)
        setSaveSuccessMsg('')
        try {
            const res = await fetch('/api/user-update-viajeros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservaId: selectedReservaId || portalData?.reservas?.[0]?._id,
                    email: portalData.user.email,
                    passengers: passengersList,
                })
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Error al guardar los pasajeros')
            }
            setSaveSuccessMsg('✓ ¡Los datos de los pasajeros se guardaron con éxito!')
            setTimeout(() => setSaveSuccessMsg(''), 5000)
        } catch (err) {
            alert('Error al guardar: ' + err.message)
        } finally {
            setIsSavingPassengers(false)
        }
    }

    // Submit Review from Portal
    const handlePortalReviewSubmit = async (e) => {
        e.preventDefault()
        if (!revComment.trim()) {
            alert('Por favor escribe tu reseña o testimonio.')
            return
        }

        setIsSubmittingReview(true)
        try {
            const res = await fetch('/api/resenas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: portalData.user.name,
                    email: portalData.user.email,
                    phone: portalData.user.phone,
                    city: portalData.user.city || 'México',
                    trip: revTrip || 'Experiencia RutaXAsia',
                    rating: revRating,
                    comment: revComment.trim(),
                    photo: revPhoto.trim() || portalData.user.photo || '',
                })
            })

            const data = await res.json()
            if (!res.ok || data.error) throw new Error(data.error || 'Error al enviar reseña')

            setShowReviewModal(false)
            setReviewSuccessModal(true)
            setRevComment('')

            // Refresh portal reviews
            await fetchPortalData(portalData.user.email, portalData.user.contactId)
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setIsSubmittingReview(false)
        }
    }

    // Save Profile Changes & Password Change
    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setProfileErrorMsg('')
        setProfileSuccessMsg('')

        if (newPassword && newPassword !== confirmNewPassword) {
            setProfileErrorMsg('Las contraseñas nuevas no coinciden.')
            return
        }

        if (newPassword && newPassword.length < 6) {
            setProfileErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.')
            return
        }

        setIsSavingProfile(true)

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update-profile',
                    email: portalData.user.email,
                    name: profileName.trim(),
                    phone: profilePhone.trim(),
                    city: profileCity.trim(),
                    photo: profilePhoto.trim(),
                    currentPassword: currentPassword ? currentPassword.trim() : undefined,
                    newPassword: newPassword ? newPassword.trim() : undefined,
                })
            })

            const data = await res.json()
            if (!res.ok || data.error) throw new Error(data.error || 'Error al actualizar perfil')

            setProfileSuccessMsg('✓ ¡Perfil actualizado correctamente!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmNewPassword('')

            // Refresh user state
            await fetchPortalData(data.user.email, data.user.contactId)
            setTimeout(() => setProfileSuccessMsg(''), 5000)
        } catch (err) {
            setProfileErrorMsg(err.message)
        } finally {
            setIsSavingProfile(false)
        }
    }

    return (
        <div className="portal-container">
            <Helmet>
                <title>Mi Cuenta & Portal de Viajero | RutaXAsia</title>
                <meta name="description" content="Gestiona tus viajes, plan de cuotas, pasajeros, pasaportes y reseñas en RutaXAsia." />
            </Helmet>

            <div className="portal-wrap">
                {/* 1. AUTH SCREEN: LOGIN / REGISTER / FORGOT */}
                {!portalData ? (
                    <div className="portal-auth-card">
                        <div className="portal-auth-icon">⛩️</div>
                        <h1 className="portal-auth-title">Portal de Viajeros</h1>
                        <p className="portal-auth-desc">
                            Accede a tus reservas, planes de cuotas, documentación de pasajeros y gestiona tus reseñas en un solo lugar.
                        </p>

                        {/* Auth Mode Toggle Tabs */}
                        <div className="portal-auth-tabs">
                            <button
                                type="button"
                                className={`portal-auth-tab-btn${authMode === 'login' ? ' portal-auth-tab-btn--active' : ''}`}
                                onClick={() => { setAuthMode('login'); setAuthError(''); setForgotSuccessMsg('') }}
                            >
                                🔑 Iniciar Sesión
                            </button>
                            <button
                                type="button"
                                className={`portal-auth-tab-btn${authMode === 'register' ? ' portal-auth-tab-btn--active' : ''}`}
                                onClick={() => { setAuthMode('register'); setAuthError(''); setForgotSuccessMsg('') }}
                            >
                                ✨ Crear Cuenta
                            </button>
                        </div>

                        {/* MODE 1: LOGIN (EMAIL + PASSWORD) */}
                        {authMode === 'login' && (
                            <form onSubmit={handleLoginSubmit} className="portal-auth-form">
                                <div className="portal-input-group">
                                    <label htmlFor="login-email">Correo Electrónico</label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        className="portal-input"
                                        placeholder="ej. viajero@gmail.com"
                                        value={loginEmail}
                                        onChange={(e) => { setAuthError(''); setLoginEmail(e.target.value) }}
                                        required
                                    />
                                </div>

                                <div className="portal-input-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label htmlFor="login-password" style={{ margin: 0 }}>Contraseña</label>
                                        <button
                                            type="button"
                                            onClick={() => { setAuthMode('forgot'); setAuthError(''); setForgotEmail(loginEmail) }}
                                            style={{ background: 'transparent', border: 'none', color: '#ec4899', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                    <div className="portal-password-wrap">
                                        <input
                                            id="login-password"
                                            type={showLoginPassword ? 'text' : 'password'}
                                            className="portal-input"
                                            placeholder="Ingresa tu contraseña"
                                            value={loginPassword}
                                            onChange={(e) => { setAuthError(''); setLoginPassword(e.target.value) }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="portal-password-toggle"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            aria-label="Toggle password visibility"
                                        >
                                            {showLoginPassword ? <LuEyeOff /> : <LuEye />}
                                        </button>
                                    </div>
                                </div>

                                {authError && (
                                    <div className="portal-auth-error-box">
                                        ⚠️ {authError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="portal-auth-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Verificando credenciales...' : 'Acceder a Mi Cuenta →'}
                                </button>
                            </form>
                        )}

                        {/* MODE 2: REGISTER */}
                        {authMode === 'register' && (
                            <form onSubmit={handleRegisterSubmit} className="portal-auth-form">
                                <div className="portal-input-group">
                                    <label>Nombre y Apellidos *</label>
                                    <input
                                        type="text"
                                        className="portal-input"
                                        placeholder="ej. Mariana Silva"
                                        value={regName}
                                        onChange={(e) => { setAuthError(''); setRegName(e.target.value) }}
                                        required
                                    />
                                </div>

                                <div className="portal-input-group">
                                    <label>Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        className="portal-input"
                                        placeholder="ej. viajero@gmail.com"
                                        value={regEmail}
                                        onChange={(e) => { setAuthError(''); setRegEmail(e.target.value) }}
                                        required
                                    />
                                </div>

                                <div className="portal-input-group">
                                    <label>Teléfono / WhatsApp</label>
                                    <input
                                        type="tel"
                                        className="portal-input"
                                        placeholder="ej. +52 55 1234 5678"
                                        value={regPhone}
                                        onChange={(e) => setRegPhone(e.target.value)}
                                    />
                                </div>

                                <div className="portal-input-group">
                                    <label>Ciudad / Estado</label>
                                    <input
                                        type="text"
                                        className="portal-input"
                                        placeholder="ej. Monterrey, N.L."
                                        value={regCity}
                                        onChange={(e) => setRegCity(e.target.value)}
                                    />
                                </div>

                                <div className="portal-input-group">
                                    <label>Crea tu Contraseña *</label>
                                    <div className="portal-password-wrap">
                                        <input
                                            type={showRegPassword ? 'text' : 'password'}
                                            className="portal-input"
                                            placeholder="Mínimo 6 caracteres"
                                            value={regPassword}
                                            onChange={(e) => { setAuthError(''); setRegPassword(e.target.value) }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="portal-password-toggle"
                                            onClick={() => setShowRegPassword(!showRegPassword)}
                                            aria-label="Toggle password visibility"
                                        >
                                            {showRegPassword ? <LuEyeOff /> : <LuEye />}
                                        </button>
                                    </div>
                                </div>

                                {authError && (
                                    <div className="portal-auth-error-box">
                                        ⚠️ {authError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="portal-auth-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando tu cuenta...' : 'Crear mi Cuenta de Viajero →'}
                                </button>
                            </form>
                        )}

                        {/* MODE 3: FORGOT PASSWORD */}
                        {authMode === 'forgot' && (
                            <form onSubmit={handleForgotSubmit} className="portal-auth-form">
                                <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 4px 0' }}>Restablecer Contraseña</h3>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
                                    Ingresa tu correo y te enviaremos las instrucciones para recuperar tu acceso.
                                </p>

                                <div className="portal-input-group">
                                    <label>Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="portal-input"
                                        placeholder="ej. viajero@gmail.com"
                                        value={forgotEmail}
                                        onChange={(e) => { setAuthError(''); setForgotEmail(e.target.value) }}
                                        required
                                    />
                                </div>

                                {forgotSuccessMsg && (
                                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '12px 16px', borderRadius: '10px', fontSize: '0.86rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                        ✓ {forgotSuccessMsg}
                                    </div>
                                )}

                                {authError && (
                                    <div className="portal-auth-error-box">
                                        ⚠️ {authError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="portal-auth-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar Instrucciones →'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setAuthMode('login'); setAuthError('') }}
                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}
                                >
                                    ← Volver al Inicio de Sesión
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
                                <img
                                    src={portalData.user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80'}
                                    alt={portalData.user.name}
                                    className="portal-user-avatar"
                                    style={{ objectFit: 'cover' }}
                                />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <h2 className="portal-user-name">{portalData.user.name}</h2>
                                        <span className="portal-badge-member">👑 Viajero RutaXAsia</span>
                                    </div>
                                    <div className="portal-user-meta">
                                        <span>📧 {portalData.user.email}</span>
                                        {portalData.user.contactId && (
                                            <span>🆔 Contact ID: <code>{portalData.user.contactId.substring(0, 8)}...</code></span>
                                        )}
                                        <span>🎒 {portalData.reservas.length} viaje{portalData.reservas.length !== 1 ? 's' : ''}</span>
                                        <span>⭐ {portalData.misResenas?.length || 0} reseña{portalData.misResenas?.length !== 1 ? 's' : ''}</span>
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
                                className={`portal-tab-btn${activeTab === 'pasajeros' ? ' portal-tab-btn--active' : ''}`}
                                onClick={() => setActiveTab('pasajeros')}
                            >
                                👥 Pasajeros ({passengersList.length > 0 ? passengersList.length : portalData.pasajeros.length})
                            </button>
                            <button
                                type="button"
                                className={`portal-tab-btn${activeTab === 'resenas' ? ' portal-tab-btn--active' : ''}`}
                                onClick={() => setActiveTab('resenas')}
                            >
                                ⭐ Mis Reseñas ({portalData.misResenas?.length || 0})
                            </button>
                            <button
                                type="button"
                                className={`portal-tab-btn${activeTab === 'perfil' ? ' portal-tab-btn--active' : ''}`}
                                onClick={() => setActiveTab('perfil')}
                            >
                                👤 Mi Perfil
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
                                        const isPaid = (res.estadoReserva || '').toLowerCase() === 'pagado' || (res.estadoDelPago || '').toLowerCase() === 'liquidado'
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
                                                        {isPaid ? '✓ Pagado' : '⏳ En Cuotas'}
                                                    </span>
                                                </div>

                                                <div className="portal-data-row">
                                                    <span className="portal-data-label">Total del Viaje:</span>
                                                    <span className="portal-data-value">{formatPrice(res.totalEstimado || res.precioTotalMxn)}</span>
                                                </div>
                                                <div className="portal-data-row">
                                                    <span className="portal-data-label">Anticipo / Abonado:</span>
                                                    <span className="portal-data-value">{formatPrice(res.montoAnticipo || res.montoAbonadoMxn)}</span>
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
                                        const isPaid = (pago.estatus || pago.estadoDelPago || '').toLowerCase() === 'pagado'
                                        return (
                                            <div key={pago._id} className="portal-installment-item">
                                                <div className="portal-inst-left">
                                                    <div className="portal-inst-number">
                                                        #{pago.nmeorDePagoNmero || '1'}
                                                    </div>
                                                    <div>
                                                        <h4 className="portal-inst-title">{pago.concepto || `Cuota Mensual`}</h4>
                                                        <div className="portal-inst-date">
                                                            📅 Vence el: <strong>{pago.fechaDeVencimiento || pago.fechaDeFacturacin || 'Programado'}</strong>
                                                            {pago.reserva && <span style={{ marginLeft: '10px', opacity: 0.7 }}>({pago.reserva})</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="portal-inst-right">
                                                    <div className="portal-inst-amount">
                                                        {formatPrice(pago.importeNmero || pago.monto)}
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

                        {/* TAB 3: PASAJEROS & PASAPORTES */}
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
                                                <label>Vigencia de Pasaporte (Calendario)</label>
                                                <input
                                                    type="date"
                                                    className="portal-input"
                                                    value={passenger.passportExpiry}
                                                    onChange={(e) => handlePassengerChange(idx, 'passportExpiry', e.target.value)}
                                                />
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
                                                <label>Preferencias Dietéticas / Notas</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={passenger.dietary}
                                                    onChange={(e) => handlePassengerChange(idx, 'dietary', e.target.value)}
                                                    placeholder="ej. Vegetariano"
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

                        {/* TAB 4: MIS RESEÑAS */}
                        {activeTab === 'resenas' && (
                            <div className="portal-reviews-container">
                                <div className="portal-reviews-header">
                                    <div>
                                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>
                                            ⭐ Mis Reseñas & Experiencias
                                        </h3>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                                            Tus opiniones compartidas con la comunidad de viajeros de RutaXAsia.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="portal-write-review-btn"
                                        onClick={() => setShowReviewModal(true)}
                                    >
                                        <LuPlus size={18} /> Escribir Reseña de mi Viaje
                                    </button>
                                </div>

                                {(!portalData.misResenas || portalData.misResenas.length === 0) ? (
                                    <div className="portal-empty-state">
                                        <div className="portal-empty-icon">🌸</div>
                                        <h3>Aún no has compartido una reseña</h3>
                                        <p>¡Cuéntanos tu experiencia de viaje con Juan y Ale para inspirar a otros viajeros de la comunidad!</p>
                                        <button
                                            type="button"
                                            className="portal-write-review-btn"
                                            style={{ marginTop: '16px' }}
                                            onClick={() => setShowReviewModal(true)}
                                        >
                                            ✍️ Dejar mi Primera Reseña
                                        </button>
                                    </div>
                                ) : (
                                    <div className="portal-reviews-grid">
                                        {portalData.misResenas.map((rev) => (
                                            <div key={rev.id} className="portal-review-card">
                                                <div className="portal-review-top">
                                                    <div>
                                                        <h4 className="portal-review-trip-title">✈️ {rev.trip}</h4>
                                                        <div className="portal-review-stars">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} style={{ color: i < rev.rating ? '#f59e0b' : '#4b5563' }}>★</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className={`portal-review-badge ${rev.isApproved ? 'portal-review-badge--approved' : 'portal-review-badge--pending'}`}>
                                                        {rev.isApproved ? '✓ Publicada' : '⏳ En revisión'}
                                                    </span>
                                                </div>

                                                <p className="portal-review-comment">"{rev.comment}"</p>

                                                {rev.photo && (
                                                    <img src={rev.photo} alt="Foto de viaje" className="portal-review-photo" />
                                                )}

                                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <span>📅 {new Date(rev.date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
                                                    <span>{rev.statusLabel}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 5: MI PERFIL */}
                        {activeTab === 'perfil' && (
                            <div className="portal-profile-layout">
                                <div className="portal-profile-sidebar-card">
                                    <img
                                        src={profilePhoto || portalData.user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80'}
                                        alt={portalData.user.name}
                                        className="portal-profile-avatar-large"
                                    />
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 4px 0' }}>{portalData.user.name}</h3>
                                        <span style={{ fontSize: '0.85rem', color: '#ec4899', fontWeight: 700 }}>👑 Viajero Verificado</span>
                                    </div>
                                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', color: '#cbd5e1', width: '100%', textAlign: 'left', lineHeight: '1.6' }}>
                                        <div>📧 <strong>{portalData.user.email}</strong></div>
                                        {portalData.user.contactId && <div>🆔 Contacto: <code>{portalData.user.contactId.substring(0, 12)}...</code></div>}
                                        <div>📍 {portalData.user.city || 'México'}</div>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveProfile} className="portal-profile-form-card">
                                    <div>
                                        <h4 className="portal-profile-section-title">
                                            <LuUser /> Información Personal
                                        </h4>
                                        <div className="portal-pass-form-grid">
                                            <div className="portal-input-group">
                                                <label>Nombre y Apellidos</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Teléfono / WhatsApp</label>
                                                <input
                                                    type="tel"
                                                    className="portal-input"
                                                    value={profilePhone}
                                                    onChange={(e) => setProfilePhone(e.target.value)}
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Ciudad / Estado</label>
                                                <input
                                                    type="text"
                                                    className="portal-input"
                                                    value={profileCity}
                                                    onChange={(e) => setProfileCity(e.target.value)}
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>URL Foto de Perfil (Avatar)</label>
                                                <input
                                                    type="url"
                                                    className="portal-input"
                                                    placeholder="https://..."
                                                    value={profilePhoto}
                                                    onChange={(e) => setProfilePhoto(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="portal-profile-section-title">
                                            <LuLock /> Seguridad & Contraseña
                                        </h4>
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
                                            Si deseas cambiar tu contraseña, completa los siguientes campos:
                                        </p>
                                        <div className="portal-pass-form-grid">
                                            <div className="portal-input-group">
                                                <label>Contraseña Actual</label>
                                                <input
                                                    type="password"
                                                    className="portal-input"
                                                    placeholder="Tu contraseña actual"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Nueva Contraseña</label>
                                                <input
                                                    type="password"
                                                    className="portal-input"
                                                    placeholder="Mínimo 6 caracteres"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </div>

                                            <div className="portal-input-group">
                                                <label>Confirmar Nueva Contraseña</label>
                                                <input
                                                    type="password"
                                                    className="portal-input"
                                                    placeholder="Repite la nueva contraseña"
                                                    value={confirmNewPassword}
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {profileSuccessMsg && (
                                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700 }}>
                                            {profileSuccessMsg}
                                        </div>
                                    )}

                                    {profileErrorMsg && (
                                        <div className="portal-auth-error-box">
                                            ⚠️ {profileErrorMsg}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            type="submit"
                                            className="portal-save-btn"
                                            disabled={isSavingProfile}
                                        >
                                            {isSavingProfile ? 'Guardando...' : '💾 Guardar Cambios de Perfil'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* WRITE REVIEW MODAL (FROM PORTAL) */}
            {showReviewModal && (
                <div className="portal-modal-backdrop" onClick={() => setShowReviewModal(false)}>
                    <div className="portal-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="portal-modal-header">
                            <h3>✍️ Escribir Reseña de mi Viaje</h3>
                            <button
                                type="button"
                                className="portal-modal-close-btn"
                                onClick={() => setShowReviewModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handlePortalReviewSubmit} className="portal-auth-form">
                            <div className="portal-input-group">
                                <label>Viaje o Experiencia</label>
                                <input
                                    type="text"
                                    className="portal-input"
                                    placeholder="ej. Japón Sakura 2027 o Corea del Sur"
                                    value={revTrip}
                                    onChange={(e) => setRevTrip(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="portal-input-group">
                                <label>Calificación (Estrellas)</label>
                                <div className="portal-star-picker">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            className={`portal-star-btn ${star <= revRating ? 'portal-star-btn--active' : ''}`}
                                            onClick={() => setRevRating(star)}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="portal-input-group">
                                <label>Tu Experiencia y Testimonio *</label>
                                <textarea
                                    className="portal-input"
                                    rows="4"
                                    placeholder="Cuéntanos qué fue lo más mágico de tu viaje, cómo fue la atención de los guías y por qué recomiendas RutaXAsia..."
                                    value={revComment}
                                    onChange={(e) => setRevComment(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="portal-input-group">
                                <label>URL de Foto del Viaje (Opcional)</label>
                                <input
                                    type="url"
                                    className="portal-input"
                                    placeholder="https://..."
                                    value={revPhoto}
                                    onChange={(e) => setRevPhoto(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="portal-auth-btn"
                                disabled={isSubmittingReview}
                            >
                                {isSubmittingReview ? 'Enviando reseña...' : 'Enviar Reseña para Publicación →'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* REVIEW SENT CONFIRMATION MODAL */}
            {reviewSuccessModal && (
                <div className="portal-modal-backdrop" onClick={() => setReviewSuccessModal(false)}>
                    <div className="portal-modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>
                            ✓
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
                            ¡Gracias por compartir tu experiencia! 🙌
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                            Tu reseña ya fue recibida por nuestro equipo y vinculada a tu cuenta. Una vez revisada, aparecerá publicada en el muro público y en la página principal.
                        </p>
                        <button
                            type="button"
                            className="portal-save-btn"
                            onClick={() => setReviewSuccessModal(false)}
                            style={{ margin: '0 auto' }}
                        >
                            Entendido, ¡muchas gracias!
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
