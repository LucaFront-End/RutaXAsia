import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useTripSearch } from '../../context/TripContext'
import {
    SEASONS_INFO,
    normalizeSeasonKey,
    getSeasonDetails,
    getSeasonForDate,
    isDateInSeason,
    getDefaultDateForSeason,
    formatDateForDisplay,
} from '../../utils/seasonDates'
import './TripSelectorBar.css'

const DESTINOS_OPTIONS = [
    { label: 'Japón a la Carta', slug: '/viajes/japon', icon: '⛩️' },
    { label: 'Japón Octubre 2026', slug: '/tours/octubre-japon-2026', icon: '🍁' },
    { label: 'Japón y Corea Octubre 2026', slug: '/tours/japon-corea-2026', icon: '🌸' },
    { label: 'Corea del Sur', slug: '/viajes/corea', icon: '🇰🇷' },
]

const MONTHS_OPTIONS = [
    { label: 'Septiembre 2026', key: '2026-09', seasonKey: 'kamakura', emoji: '🍁' },
    { label: 'Octubre 2026', key: '2026-10', seasonKey: 'kamakura', emoji: '🍁' },
    { label: 'Noviembre 2026', key: '2026-11', seasonKey: 'kamakura', emoji: '🍁' },
    { label: 'Diciembre 2026', key: '2026-12', seasonKey: 'kamakura', emoji: '🍁' },
    { label: 'Enero 2027', key: '2027-01', seasonKey: 'kamakura', emoji: '🍁' },
    { label: 'Febrero 2027', key: '2027-02', seasonKey: 'kamakura', emoji: '🍁' },
    { label: 'Marzo 2027', key: '2027-03', seasonKey: 'sakura', emoji: '🌸' },
    { label: 'Abril 2027', key: '2027-04', seasonKey: 'sakura', emoji: '🌸' },
    { label: 'Mayo 2027', key: '2027-05', seasonKey: 'akari', emoji: '☀️' },
    { label: 'Junio 2027', key: '2027-06', seasonKey: 'akari', emoji: '☀️' },
    { label: 'Julio 2027', key: '2027-07', seasonKey: 'akari', emoji: '☀️' },
    { label: 'Agosto 2027', key: '2027-08', seasonKey: 'akari', emoji: '☀️' },
]

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export default function TripSelectorBar({
    selectorData,
    onChange,
    variant = 'bar',
    selectedDays = null,
    selectedNights = null,
    isFixedDates = false,
    fixedDatesText = '',
    season = null,
    temporadaKey = null,
    onSeasonChange = null,
}) {
    const { tripSearch, updateTripSearch } = useTripSearch()
    const navigate = useNavigate()
    const location = useLocation()
    const routeParams = useParams()

    const currentData = selectorData || tripSearch
    const handleUpdate = onChange || updateTripSearch

    // Resolve active season (from props, route params, path, or stored search)
    const effectiveSeasonKey = normalizeSeasonKey(
        temporadaKey ||
        season?.key ||
        season?.id ||
        routeParams.temporada ||
        (location.pathname.includes('/sakura') ? 'sakura' :
         location.pathname.includes('/akari') || location.pathname.includes('/verano') ? 'akari' :
         location.pathname.includes('/kamakura') || location.pathname.includes('/momiji') || location.pathname.includes('/otono') ? 'kamakura' : null) ||
        currentData?.temporada ||
        tripSearch?.temporada
    )
    const activeSeason = getSeasonDetails(effectiveSeasonKey)

    // Determine exact trip duration in days and nights
    const daysCount = selectedDays || (selectedNights ? selectedNights + 2 : 8)
    const nightsCount = selectedNights || (daysCount - 2)

    // Calculate end date based on start date and exact daysCount
    const getCalculatedEndDate = useCallback((startDateStr, days = daysCount) => {
        if (!startDateStr) return ''
        const [y, m, d] = startDateStr.split('-').map(Number)
        if (!y || !m || !d) return ''
        const date = new Date(y, m - 1, d)
        date.setDate(date.getDate() + (days - 1))
        const yyyy = date.getFullYear()
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const dd = String(date.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }, [daysCount])

    // Get a valid start date for the active season
    const getSafeInitialStartDate = useCallback(() => {
        if (currentData.startDate && (!effectiveSeasonKey || isDateInSeason(currentData.startDate, effectiveSeasonKey))) {
            return currentData.startDate
        }
        if (effectiveSeasonKey) {
            return getDefaultDateForSeason(effectiveSeasonKey)
        }
        return '2026-10-15'
    }, [currentData.startDate, effectiveSeasonKey])

    const [openModal, setOpenModal] = useState(null) // 'destino' | 'dates' | 'passengers' | null
    const [dateTab, setDateTab] = useState(currentData.dateMode || 'exact') // 'exact' | 'month'

    // Local temporary states before applying
    const [tempDestino, setTempDestino] = useState(currentData.destino || 'japon')
    const [tempStartDate, setTempStartDate] = useState(getSafeInitialStartDate)
    const [tempEndDate, setTempEndDate] = useState(() => getCalculatedEndDate(getSafeInitialStartDate(), daysCount))
    const [tempMonth, setTempMonth] = useState(currentData.selectedMonth || (activeSeason ? `${activeSeason.name}` : 'Octubre 2026'))
    const [tempAdults, setTempAdults] = useState(currentData.adults || 2)
    const [tempChildren, setTempChildren] = useState(currentData.children || 0)

    // Calendar month navigation state
    const [calYear, setCalYear] = useState(() => {
        const d = getSafeInitialStartDate()
        return parseInt(d.split('-')[0], 10) || 2026
    })
    const [calMonth, setCalMonth] = useState(() => {
        const d = getSafeInitialStartDate()
        const m = parseInt(d.split('-')[1], 10)
        return !isNaN(m) ? m - 1 : 9
    })

    // Season Conflict Dialog State
    const [showConflictModal, setShowConflictModal] = useState(false)
    const [conflictedDate, setConflictedDate] = useState(null)
    const [targetSeason, setTargetSeason] = useState(null)

    const modalRef = useRef(null)

    // Sync when effective season changes
    useEffect(() => {
        if (effectiveSeasonKey) {
            if (!isDateInSeason(tempStartDate, effectiveSeasonKey)) {
                const defDate = getDefaultDateForSeason(effectiveSeasonKey)
                setTempStartDate(defDate)
                setTempEndDate(getCalculatedEndDate(defDate, daysCount))
                const parts = defDate.split('-').map(Number)
                setCalYear(parts[0])
                setCalMonth(parts[1] - 1)
            }
        }
    }, [effectiveSeasonKey, daysCount, getCalculatedEndDate, tempStartDate])

    // When modal opens, sync states
    useEffect(() => {
        if (openModal === 'dates') {
            let start = currentData.startDate
            if (!start || (effectiveSeasonKey && !isDateInSeason(start, effectiveSeasonKey))) {
                start = effectiveSeasonKey ? getDefaultDateForSeason(effectiveSeasonKey) : '2026-10-15'
            }
            setTempStartDate(start)
            setTempEndDate(getCalculatedEndDate(start, daysCount))
            setTempMonth(currentData.selectedMonth || (activeSeason ? activeSeason.name : 'Octubre 2026'))
            setTempAdults(currentData.adults || 2)
            setTempChildren(currentData.children || 0)
            setDateTab(currentData.dateMode || 'exact')

            const parts = start.split('-').map(Number)
            if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                setCalYear(parts[0])
                setCalMonth(parts[1] - 1)
            }
        } else if (openModal) {
            setTempAdults(currentData.adults || 2)
            setTempChildren(currentData.children || 0)
        }
    }, [openModal, daysCount, currentData, effectiveSeasonKey, activeSeason, getCalculatedEndDate])

    // Close on outside click (unless conflict modal is active)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showConflictModal) return // Don't close calendar while conflict modal is up
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setOpenModal(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showConflictModal])

    // Direct in-season selection
    const handleSelectStartDate = (startDateStr) => {
        setTempStartDate(startDateStr)
        const computedEnd = getCalculatedEndDate(startDateStr, daysCount)
        setTempEndDate(computedEnd)
    }

    // Intercept date selection with season check
    const handleAttemptDateSelect = (selectedDateStr) => {
        if (!selectedDateStr) return

        // If there is an active season, check if the date belongs to it
        if (effectiveSeasonKey && !isDateInSeason(selectedDateStr, effectiveSeasonKey)) {
            const detectedSeason = getSeasonForDate(selectedDateStr)
            setConflictedDate(selectedDateStr)
            setTargetSeason(detectedSeason)
            setShowConflictModal(true)
            return
        }

        // Inside season: proceed
        handleSelectStartDate(selectedDateStr)
    }

    // Action 1: User chooses to switch to the target season
    const handleSwitchToTargetSeason = () => {
        if (!targetSeason || !conflictedDate) return

        const newStart = conflictedDate
        const newEnd = getCalculatedEndDate(newStart, daysCount)
        setTempStartDate(newStart)
        setTempEndDate(newEnd)

        // Move calendar view to chosen date
        const parts = newStart.split('-').map(Number)
        if (parts.length === 3) {
            setCalYear(parts[0])
            setCalMonth(parts[1] - 1)
        }

        // Apply changes to context / store
        handleUpdate({
            temporada: targetSeason.key,
            startDate: newStart,
            endDate: newEnd,
        })

        if (onSeasonChange) {
            onSeasonChange(targetSeason.key)
        }

        // Seamless route redirect if on season-specific route
        if (routeParams.temporada && routeParams.experiencia) {
            navigate(`/viajes/japon/${targetSeason.key}/${routeParams.experiencia}`)
        } else if (routeParams.temporada) {
            navigate(`/viajes/japon/${targetSeason.key}`)
        }

        setShowConflictModal(false)
        setConflictedDate(null)
        setTargetSeason(null)
    }

    // Action 2: User chooses to stay in the current season
    const handleKeepCurrentSeason = () => {
        // Discard conflicted date and keep valid season date
        if (effectiveSeasonKey && !isDateInSeason(tempStartDate, effectiveSeasonKey)) {
            const defDate = getDefaultDateForSeason(effectiveSeasonKey)
            setTempStartDate(defDate)
            setTempEndDate(getCalculatedEndDate(defDate, daysCount))
        }
        setShowConflictModal(false)
        setConflictedDate(null)
        setTargetSeason(null)
    }

    // Month chip selection
    const handleSelectMonthChip = (m) => {
        if (effectiveSeasonKey && m.seasonKey && m.seasonKey !== effectiveSeasonKey) {
            const detectedSeason = SEASONS_INFO[m.seasonKey]
            const repDate = m.key ? `${m.key}-15` : getDefaultDateForSeason(m.seasonKey)
            setConflictedDate(repDate)
            setTargetSeason(detectedSeason)
            setShowConflictModal(true)
            return
        }
        setTempMonth(m.label)
    }

    // Month navigation handlers
    const handlePrevMonth = () => {
        setCalMonth(prev => {
            if (prev === 0) {
                setCalYear(y => y - 1)
                return 11
            }
            return prev - 1
        })
    }

    const handleNextMonth = () => {
        setCalMonth(prev => {
            if (prev === 11) {
                setCalYear(y => y + 1)
                return 0
            }
            return prev + 1
        })
    }

    // Dual calendar computation
    const m1Year = calYear
    const m1Month = calMonth
    const m2Year = calMonth === 11 ? calYear + 1 : calYear
    const m2Month = calMonth === 11 ? 0 : calMonth + 1

    const renderMonthCalendar = (year, monthIdx) => {
        const totalDays = new Date(year, monthIdx + 1, 0).getDate()
        const firstDayOfWeek = new Date(year, monthIdx, 1).getDay() // 0 = Sun
        const monthName = MONTH_NAMES[monthIdx]

        return (
            <div className="month-cal" key={`${year}-${monthIdx}`}>
                <div className="month-cal-header">{monthName} {year}</div>
                <div className="month-cal-grid">
                    {DAY_LABELS.map((d, i) => <span key={i} className="cal-day-head">{d}</span>)}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <span key={`empty-${i}`} className="cal-day-empty" />
                    ))}
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                        const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const isStart = tempStartDate === dateStr
                        const isEnd = tempEndDate === dateStr
                        const inRange = tempStartDate && tempEndDate && dateStr >= tempStartDate && dateStr <= tempEndDate
                        const daySeason = getSeasonForDate(dateStr)
                        const isMatchSeason = !effectiveSeasonKey || daySeason?.key === effectiveSeasonKey

                        let className = 'cal-day-num'
                        if (inRange) className += ' cal-day-num--in-range'
                        if (isStart || isEnd) className += ' cal-day-num--selected'
                        if (!isMatchSeason) className += ' cal-day-num--other-season'

                        return (
                            <span
                                key={day}
                                onClick={() => handleAttemptDateSelect(dateStr)}
                                className={className}
                                title={!isMatchSeason ? `Corresponde a ${daySeason?.name || 'otra temporada'}` : ''}
                                style={{ cursor: 'pointer' }}
                            >
                                {day}
                            </span>
                        )
                    })}
                </div>
            </div>
        )
    }

    const handleApplyDates = () => {
        const finalEnd = getCalculatedEndDate(tempStartDate, daysCount)
        handleUpdate({
            dateMode: dateTab,
            startDate: tempStartDate,
            endDate: finalEnd,
            selectedMonth: tempMonth,
        })
        setOpenModal(null)
    }

    const handleApplyPassengers = () => {
        handleUpdate({
            adults: tempAdults,
            children: tempChildren,
        })
        setOpenModal(null)
    }

    const handleSelectDestino = (dest) => {
        setTempDestino(dest.slug)
        handleUpdate({ destino: dest.slug })
        setOpenModal(null)
    }

    const handleSearchClick = () => {
        const targetSlug = currentData.destino || '/viajes/japon'
        navigate(targetSlug.startsWith('/') ? targetSlug : `/viajes/${targetSlug}`)
    }

    const formattedDatesSummary = () => {
        if (isFixedDates) {
            return fixedDatesText || '📌 Fechas fijas del grupo'
        }
        if (currentData.dateMode === 'month') {
            return currentData.selectedMonth || (activeSeason ? activeSeason.name : 'Octubre 2026')
        }
        if (currentData.startDate && currentData.endDate) {
            const start = new Date(currentData.startDate + 'T00:00:00')
            const end = new Date(currentData.endDate + 'T00:00:00')
            const options = { day: 'numeric', month: 'short' }
            return `${start.toLocaleDateString('es-MX', options)} — ${end.toLocaleDateString('es-MX', options)} ${end.getFullYear()}`
        }
        return 'Seleccionar fechas'
    }

    const formattedPassengersSummary = () => {
        const ad = currentData.adults || 2
        const ch = currentData.children || 0
        let text = `${ad} Adulto${ad > 1 ? 's' : ''}`
        if (ch > 0) {
            text += `, ${ch} Menor${ch > 1 ? 'es' : ''}`
        }
        return text
    }

    const selectedDestinoObj = DESTINOS_OPTIONS.find(d => d.slug === currentData.destino) || DESTINOS_OPTIONS[0]

    return (
        <div className={`trip-selector-bar-wrapper trip-selector-bar-wrapper--${variant}`}>
            <div className={`trip-selector-bar trip-selector-bar--${variant}`}>
                {/* Destino (Hero variant) */}
                {variant === 'hero' && (
                    <>
                        <div
                            className={`trip-selector-btn${openModal === 'destino' ? ' trip-selector-btn--active' : ''}`}
                            onClick={() => setOpenModal(openModal === 'destino' ? null : 'destino')}
                        >
                            <span className="trip-selector-icon">{selectedDestinoObj.icon}</span>
                            <div className="trip-selector-text">
                                <span className="trip-selector-label">DESTINO</span>
                                <span className="trip-selector-value">{selectedDestinoObj.label}</span>
                            </div>
                            <span className="trip-selector-arrow">▾</span>
                        </div>
                        <div className="trip-selector-divider" />
                    </>
                )}

                {/* Fechas / Calendario Trigger */}
                <div
                    className={`trip-selector-btn${openModal === 'dates' ? ' trip-selector-btn--active' : ''}`}
                    onClick={() => setOpenModal(openModal === 'dates' ? null : 'dates')}
                >
                    <span className="trip-selector-icon">📅</span>
                    <div className="trip-selector-text">
                        <span className="trip-selector-label">FECHAS DE VIAJE</span>
                        <span className="trip-selector-value">{formattedDatesSummary()}</span>
                    </div>
                    <span className="trip-selector-arrow">▾</span>
                </div>

                <div className="trip-selector-divider" />

                {/* Personas / Pasajeros Trigger */}
                <div
                    className={`trip-selector-btn${openModal === 'passengers' ? ' trip-selector-btn--active' : ''}`}
                    onClick={() => setOpenModal(openModal === 'passengers' ? null : 'passengers')}
                >
                    <span className="trip-selector-icon">👥</span>
                    <div className="trip-selector-text">
                        <span className="trip-selector-label">PERSONAS</span>
                        <span className="trip-selector-value">{formattedPassengersSummary()}</span>
                    </div>
                    <span className="trip-selector-arrow">▾</span>
                </div>

                {/* Buscar Button (Hero variant) */}
                {variant === 'hero' && (
                    <button type="button" className="trip-selector-search-btn" onClick={handleSearchClick}>
                        🔍 Buscar
                    </button>
                )}
            </div>

            {/* Modal / Popover Content via Portal */}
            {openModal && createPortal(
                <div className="trip-selector-popover-overlay" onClick={() => !showConflictModal && setOpenModal(null)}>
                    <div
                        className={`trip-selector-popover ${openModal === 'dates' ? 'popover-dates' : openModal === 'destino' ? 'popover-destino' : 'popover-passengers'}`}
                        ref={modalRef}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="popover-close-btn"
                            onClick={() => setOpenModal(null)}
                            aria-label="Cerrar modal"
                        >
                            ✕
                        </button>

                        {/* ================= DESTINO POPOVER ================= */}
                        {openModal === 'destino' && (
                            <div className="passengers-popover-content">
                                <h4 className="passengers-popover-title">Elige tu Destino</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {DESTINOS_OPTIONS.map((d, i) => (
                                        <button
                                            key={i}
                                            className={`month-chip${currentData.destino === d.slug ? ' month-chip--selected' : ''}`}
                                            onClick={() => handleSelectDestino(d)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'none', justifyContent: 'flex-start' }}
                                        >
                                            <span style={{ fontSize: '1.2rem' }}>{d.icon}</span>
                                            <span>{d.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ================= DATES POPOVER (FIXED DATES MODE) ================= */}
                        {openModal === 'dates' && isFixedDates && (
                            <div className="dates-popover-content" style={{ textAlign: 'center', padding: '20px 14px' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📌</div>
                                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-dark)', marginBottom: '8px' }}>
                                    Fechas Grupales Establecidas
                                </h4>
                                <p style={{ fontSize: '0.88rem', color: '#555', lineHeight: '1.5', marginBottom: '18px' }}>
                                    {fixedDatesText ? `Las fechas fijas para este viaje en grupo son: ${fixedDatesText}.` : 'Este paquete cuenta con fechas de salida fijas para el grupo.'} Si deseas personalizar tus fechas de salida libremente, puedes armar tu viaje en la modalidad <strong>Japón Libre</strong>.
                                </p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.85rem', padding: '8px 18px', borderRadius: '100px' }}
                                        onClick={() => {
                                            setOpenModal(null)
                                            navigate('/viajes/japon')
                                        }}
                                    >
                                        🌿 Ir a Japón Libre
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.85rem', padding: '8px 18px', borderRadius: '100px' }}
                                        onClick={() => setOpenModal(null)}
                                    >
                                        Entendido
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= DATES POPOVER (CUSTOM DATES MODE) ================= */}
                        {openModal === 'dates' && !isFixedDates && (
                            <div className="dates-popover-content">
                                {/* Header Tabs */}
                                <div className="dates-tab-header">
                                    <button
                                        className={`dates-tab-btn${dateTab === 'exact' ? ' dates-tab-btn--active' : ''}`}
                                        onClick={() => setDateTab('exact')}
                                    >
                                        Fecha de Inicio
                                    </button>
                                    <button
                                        className={`dates-tab-btn${dateTab === 'month' ? ' dates-tab-btn--active' : ''}`}
                                        onClick={() => setDateTab('month')}
                                    >
                                        Selección por mes
                                    </button>
                                </div>

                                {/* Tab Body: Fechas exactas */}
                                {dateTab === 'exact' && (
                                    <div className="dates-exact-view">
                                        <div className="dates-inputs-row">
                                            <div style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <label style={{ margin: 0 }}>Selecciona tu Fecha de Inicio de Viaje</label>
                                                    {activeSeason && (
                                                        <span className="cal-active-season-badge">
                                                            {activeSeason.emoji} {activeSeason.name} ({activeSeason.label})
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="date"
                                                    value={tempStartDate}
                                                    onChange={e => handleAttemptDateSelect(e.target.value)}
                                                />
                                                <p style={{ fontSize: '0.78rem', color: '#059669', margin: '6px 0 0', fontWeight: 600 }}>
                                                    ✨ Fecha de regreso calculada ({daysCount} días / {nightsCount} noches): <strong>{tempEndDate}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dual Calendar Navigation Header */}
                                        <div className="dual-calendar-nav">
                                            <button
                                                type="button"
                                                className="cal-nav-btn"
                                                onClick={handlePrevMonth}
                                                aria-label="Mes anterior"
                                            >
                                                ‹
                                            </button>
                                            <div className="cal-nav-label">
                                                <span>{MONTH_NAMES[m1Month]} {m1Year} — {MONTH_NAMES[m2Month]} {m2Year}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="cal-nav-btn"
                                                onClick={handleNextMonth}
                                                aria-label="Mes siguiente"
                                            >
                                                ›
                                            </button>
                                        </div>

                                        {/* Dynamic Dual Calendar Display */}
                                        <div className="dual-calendar-preview">
                                            {renderMonthCalendar(m1Year, m1Month)}
                                            {renderMonthCalendar(m2Year, m2Month)}
                                        </div>
                                    </div>
                                )}

                                {/* Tab Body: Selección por mes */}
                                {dateTab === 'month' && (
                                    <div className="dates-month-view">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <p className="month-view-subtitle" style={{ margin: 0 }}>Selecciona tu mes aproximado de viaje:</p>
                                            {activeSeason && (
                                                <span className="cal-active-season-badge">
                                                    {activeSeason.emoji} {activeSeason.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="months-grid">
                                            {MONTHS_OPTIONS.map(m => (
                                                <button
                                                    key={m.key}
                                                    type="button"
                                                    className={`month-chip${tempMonth === m.label ? ' month-chip--selected' : ''}`}
                                                    onClick={() => handleSelectMonthChip(m)}
                                                >
                                                    <span style={{ marginRight: '6px' }}>{m.emoji}</span>
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="popover-footer">
                                    <button className="popover-clear-btn" onClick={() => setOpenModal(null)}>
                                        Cancelar
                                    </button>
                                    <button className="popover-apply-btn" onClick={handleApplyDates}>
                                        Aplicar Fechas
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= PASSENGERS POPOVER ================= */}
                        {openModal === 'passengers' && (
                            <div className="passengers-popover-content">
                                <h4 className="passengers-popover-title">Pasajeros</h4>
                                <div className="passenger-row">
                                    <div>
                                        <span className="passenger-type-title">Adultos</span>
                                        <span className="passenger-type-sub">12+ años</span>
                                    </div>
                                    <div className="passenger-counter">
                                        <button
                                            disabled={tempAdults <= 1}
                                            onClick={() => setTempAdults(tempAdults - 1)}
                                        >
                                            -
                                        </button>
                                        <span>{tempAdults}</span>
                                        <button onClick={() => setTempAdults(tempAdults + 1)}>
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="passenger-row">
                                    <div>
                                        <span className="passenger-type-title">Menores</span>
                                        <span className="passenger-type-sub">2 - 11 años</span>
                                    </div>
                                    <div className="passenger-counter">
                                        <button
                                            disabled={tempChildren <= 0}
                                            onClick={() => setTempChildren(tempChildren - 1)}
                                        >
                                            -
                                        </button>
                                        <span>{tempChildren}</span>
                                        <button onClick={() => setTempChildren(tempChildren + 1)}>
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="popover-footer">
                                    <button className="popover-apply-btn" onClick={handleApplyPassengers} style={{ width: '100%' }}>
                                        Aplicar Pasajeros
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* ================= SEASON CONFLICT MODAL VIA PORTAL ================= */}
            {showConflictModal && createPortal(
                <div className="season-conflict-overlay" onClick={handleKeepCurrentSeason}>
                    <div className="season-conflict-modal" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className="sc-close-btn"
                            onClick={handleKeepCurrentSeason}
                            aria-label="Cerrar modal"
                        >
                            ✕
                        </button>

                        <div className="sc-badge">
                            <span>⚠️ Fecha fuera de temporada</span>
                        </div>

                        <h3 className="sc-title">
                            Esta fecha corresponde a otra temporada
                        </h3>

                        <div className="sc-cards-grid">
                            {/* Temporada actual */}
                            <div className="sc-card sc-card--current">
                                <span className="sc-card-tag">Temporada actual</span>
                                <div className="sc-card-emoji">{activeSeason ? activeSeason.emoji : '🎌'}</div>
                                <h4 className="sc-card-name">{activeSeason ? activeSeason.name : 'Actual'}</h4>
                                <p className="sc-card-range">{activeSeason ? activeSeason.monthsText : ''}</p>
                            </div>

                            <div className="sc-vs-divider">
                                <span>vs</span>
                            </div>

                            {/* Temporada de la fecha elegida */}
                            <div className="sc-card sc-card--target">
                                <span className="sc-card-tag sc-card-tag--highlight">Temporada de tu fecha</span>
                                <div className="sc-card-emoji">{targetSeason ? targetSeason.emoji : '🗓️'}</div>
                                <h4 className="sc-card-name">{targetSeason ? targetSeason.name : 'Destino'}</h4>
                                <p className="sc-card-range">{targetSeason ? targetSeason.monthsText : ''}</p>
                                <div className="sc-date-pill">
                                    📅 {formatDateForDisplay(conflictedDate)}
                                </div>
                            </div>
                        </div>

                        <p className="sc-description">
                            Has seleccionado el <strong>{formatDateForDisplay(conflictedDate)}</strong>, una fecha asignada a la temporada <strong>{targetSeason?.fullName || targetSeason?.name}</strong>. Actualmente estás configurando tu viaje en <strong>{activeSeason?.name}</strong>.
                        </p>
                        <p className="sc-question">
                            ¿Deseas cambiar a la temporada <strong>{targetSeason?.name}</strong> para continuar con esta fecha o prefieres mantenerte en <strong>{activeSeason?.name}</strong>?
                        </p>

                        <div className="sc-actions">
                            <button
                                type="button"
                                className="sc-btn sc-btn--switch"
                                onClick={handleSwitchToTargetSeason}
                            >
                                {targetSeason?.emoji} Cambiar a temporada {targetSeason?.name}
                            </button>
                            <button
                                type="button"
                                className="sc-btn sc-btn--stay"
                                onClick={handleKeepCurrentSeason}
                            >
                                Mantenerse en temporada {activeSeason?.name}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
