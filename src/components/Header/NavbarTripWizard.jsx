import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTripSearch } from '../../context/TripContext'
import './NavbarTripWizard.css'

const MONTHS_OPTIONS = [
    { label: 'Marzo 2026', key: '2026-03' },
    { label: 'Abril 2026', key: '2026-04' },
    { label: 'Mayo 2026', key: '2026-05' },
    { label: 'Junio 2026', key: '2026-06' },
    { label: 'Julio 2026', key: '2026-07' },
    { label: 'Agosto 2026', key: '2026-08' },
    { label: 'Septiembre 2026', key: '2026-09' },
    { label: 'Octubre 2026', key: '2026-10' },
    { label: 'Noviembre 2026', key: '2026-11' },
]

export default function NavbarTripWizard({ isOpen, onClose, targetTrip }) {
    const { tripSearch, updateTripSearch } = useTripSearch()
    const navigate = useNavigate()

    const [step, setStep] = useState(1) // 1: Fechas, 2: Personas
    const [dateTab, setDateTab] = useState(tripSearch.dateMode || 'exact') // 'exact' | 'month'

    const [tempStartDate, setTempStartDate] = useState(tripSearch.startDate || '2026-10-15')
    const [tempEndDate, setTempEndDate] = useState(tripSearch.endDate || '2026-10-28')
    const [tempMonth, setTempMonth] = useState(tripSearch.selectedMonth || 'Octubre 2026')
    const [tempAdults, setTempAdults] = useState(tripSearch.adults || 2)
    const [tempChildren, setTempChildren] = useState(tripSearch.children || 0)

    const modalRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setStep(1)
        }
    }, [isOpen])

    if (!isOpen || !targetTrip) return null

    const handleNextStep = () => {
        setStep(2)
    }

    const handleFinish = () => {
        updateTripSearch({
            dateMode: dateTab,
            startDate: tempStartDate,
            endDate: tempEndDate,
            selectedMonth: tempMonth,
            adults: tempAdults,
            children: tempChildren,
            destino: targetTrip.url || '/viajes/japon',
        })

        onClose()
        navigate(targetTrip.url)
    }

    return (
        <div className="nav-wizard-overlay" onClick={onClose}>
            <div className="nav-wizard-modal" ref={modalRef} onClick={e => e.stopPropagation()}>
                <button className="nav-wizard-close" onClick={onClose} aria-label="Cerrar">&times;</button>

                {/* Header title */}
                <div className="nav-wizard-header">
                    <span className="nav-wizard-tag">🎌 Configurando tu viaje</span>
                    <h3 className="nav-wizard-title">{targetTrip.title}</h3>
                    <div className="nav-wizard-stepper">
                        <div className={`nav-wizard-step-dot ${step >= 1 ? 'active' : ''}`}>1. Fechas</div>
                        <div className="nav-wizard-step-line" />
                        <div className={`nav-wizard-step-dot ${step >= 2 ? 'active' : ''}`}>2. Personas</div>
                    </div>
                </div>

                {/* Step 1: Fechas */}
                {step === 1 && (
                    <div className="nav-wizard-body">
                        <h4 className="nav-wizard-body-title">📅 Paso 1: Elige las fechas de tu viaje</h4>

                        <div className="dates-tab-header" style={{ marginBottom: '16px' }}>
                            <button
                                className={`dates-tab-btn${dateTab === 'exact' ? ' dates-tab-btn--active' : ''}`}
                                onClick={() => setDateTab('exact')}
                            >
                                Fechas exactas
                            </button>
                            <button
                                className={`dates-tab-btn${dateTab === 'month' ? ' dates-tab-btn--active' : ''}`}
                                onClick={() => setDateTab('month')}
                            >
                                Selección por mes
                            </button>
                        </div>

                        {dateTab === 'exact' ? (
                            <div>
                                <div className="dates-inputs-row">
                                    <div>
                                        <label>Salida</label>
                                        <input
                                            type="date"
                                            value={tempStartDate}
                                            onChange={e => setTempStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>Regreso</label>
                                        <input
                                            type="date"
                                            value={tempEndDate}
                                            onChange={e => setTempEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="dual-calendar-preview" style={{ margin: '14px 0' }}>
                                    <div className="month-cal">
                                        <div className="month-cal-header">Octubre 2026</div>
                                        <div className="month-cal-grid">
                                            {['D','L','M','M','J','V','S'].map(d => <span key={d} className="cal-day-head">{d}</span>)}
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                                                const dateStr = `2026-10-${String(day).padStart(2, '0')}`
                                                const isStart = tempStartDate === dateStr
                                                const isEnd = tempEndDate === dateStr
                                                const inRange = tempStartDate && tempEndDate && dateStr >= tempStartDate && dateStr <= tempEndDate

                                                return (
                                                    <span
                                                        key={day}
                                                        onClick={() => {
                                                            if (!tempStartDate || (tempStartDate && tempEndDate)) {
                                                                setTempStartDate(dateStr)
                                                                setTempEndDate('')
                                                            } else if (dateStr >= tempStartDate) {
                                                                setTempEndDate(dateStr)
                                                            } else {
                                                                setTempStartDate(dateStr)
                                                                setTempEndDate('')
                                                            }
                                                        }}
                                                        className={`cal-day-num${inRange ? ' cal-day-num--in-range' : ''}${isStart || isEnd ? ' cal-day-num--selected' : ''}`}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {day}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="month-cal">
                                        <div className="month-cal-header">Noviembre 2026</div>
                                        <div className="month-cal-grid">
                                            {['D','L','M','M','J','V','S'].map(d => <span key={d} className="cal-day-head">{d}</span>)}
                                            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                                                const dateStr = `2026-11-${String(day).padStart(2, '0')}`
                                                const isStart = tempStartDate === dateStr
                                                const isEnd = tempEndDate === dateStr
                                                const inRange = tempStartDate && tempEndDate && dateStr >= tempStartDate && dateStr <= tempEndDate

                                                return (
                                                    <span
                                                        key={day}
                                                        onClick={() => {
                                                            if (!tempStartDate || (tempStartDate && tempEndDate)) {
                                                                setTempStartDate(dateStr)
                                                                setTempEndDate('')
                                                            } else if (dateStr >= tempStartDate) {
                                                                setTempEndDate(dateStr)
                                                            } else {
                                                                setTempStartDate(dateStr)
                                                                setTempEndDate('')
                                                            }
                                                        }}
                                                        className={`cal-day-num${inRange ? ' cal-day-num--in-range' : ''}${isStart || isEnd ? ' cal-day-num--selected' : ''}`}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {day}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="dates-month-view">
                                <p className="month-view-subtitle">Mes preferido de viaje:</p>
                                <div className="months-grid">
                                    {MONTHS_OPTIONS.map(m => (
                                        <button
                                            key={m.key}
                                            className={`month-chip${tempMonth === m.label ? ' month-chip--selected' : ''}`}
                                            onClick={() => setTempMonth(m.label)}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="nav-wizard-footer">
                            <button type="button" className="btn btn-primary btn-full" onClick={handleNextStep}>
                                Siguiente: Pasajeros →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Personas */}
                {step === 2 && (
                    <div className="nav-wizard-body">
                        <h4 className="nav-wizard-body-title">👥 Paso 2: ¿Cuántas personas viajan?</h4>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>Sin selección de habitación. Ajusta Adultos y Menores:</p>

                        <div className="passenger-row" style={{ padding: '16px 0' }}>
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

                        <div className="passenger-row" style={{ padding: '16px 0', borderBottom: 'none' }}>
                            <div>
                                <span className="passenger-type-title">Menores</span>
                                <span className="passenger-type-sub">0 - 11 años</span>
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

                        <div className="nav-wizard-footer" style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" className="popover-clear-btn" onClick={() => setStep(1)}>
                                ← Volver a Fechas
                            </button>
                            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleFinish}>
                                🚀 Ir a {targetTrip.shortTitle || targetTrip.title}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
