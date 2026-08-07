import { useState, useEffect, useRef } from 'react'
import './TripSelectorBar.css'

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

export default function TripSelectorBar({ selectorData, onChange }) {
    const [openModal, setOpenModal] = useState(null) // 'dates' | 'passengers' | null
    const [dateTab, setDateTab] = useState('exact') // 'exact' | 'month'

    // Local temporary states before applying
    const [tempStartDate, setTempStartDate] = useState(selectorData.startDate || '2026-10-15')
    const [tempEndDate, setTempEndDate] = useState(selectorData.endDate || '2026-10-28')
    const [tempMonth, setTempMonth] = useState(selectorData.selectedMonth || 'Octubre 2026')
    const [tempAdults, setTempAdults] = useState(selectorData.adults || 2)
    const [tempChildren, setTempChildren] = useState(selectorData.children || 0)

    const modalRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setOpenModal(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleApplyDates = () => {
        onChange({
            ...selectorData,
            dateMode: dateTab,
            startDate: tempStartDate,
            endDate: tempEndDate,
            selectedMonth: tempMonth,
        })
        setOpenModal(null)
    }

    const handleApplyPassengers = () => {
        onChange({
            ...selectorData,
            adults: tempAdults,
            children: tempChildren,
        })
        setOpenModal(null)
    }

    const formattedDatesSummary = () => {
        if (selectorData.dateMode === 'month') {
            return selectorData.selectedMonth
        }
        if (selectorData.startDate && selectorData.endDate) {
            const start = new Date(selectorData.startDate + 'T00:00:00')
            const end = new Date(selectorData.endDate + 'T00:00:00')
            const options = { day: 'numeric', month: 'short' }
            return `${start.toLocaleDateString('es-MX', options)} — ${end.toLocaleDateString('es-MX', options)} ${end.getFullYear()}`
        }
        return 'Seleccionar fechas'
    }

    const formattedPassengersSummary = () => {
        const ad = selectorData.adults
        const ch = selectorData.children
        let text = `${ad} Adulto${ad > 1 ? 's' : ''}`
        if (ch > 0) {
            text += `, ${ch} Menor${ch > 1 ? 'es' : ''}`
        }
        return text
    }

    return (
        <div className="trip-selector-bar-wrapper">
            <div className="trip-selector-bar">
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
            </div>

            {/* Modal / Popover Content */}
            {openModal && (
                <div className="trip-selector-popover-overlay" onClick={() => setOpenModal(null)}>
                    <div
                        className={`trip-selector-popover ${openModal === 'dates' ? 'popover-dates' : 'popover-passengers'}`}
                        ref={modalRef}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ================= DATES POPOVER ================= */}
                        {openModal === 'dates' && (
                            <div className="dates-popover-content">
                                {/* Header Tabs */}
                                <div className="dates-tab-header">
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

                                {/* Tab Body: Fechas exactas */}
                                {dateTab === 'exact' && (
                                    <div className="dates-exact-view">
                                        <div className="dates-inputs-row">
                                            <div>
                                                <label>Fecha de Salida</label>
                                                <input
                                                    type="date"
                                                    value={tempStartDate}
                                                    onChange={e => setTempStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label>Fecha de Regreso</label>
                                                <input
                                                    type="date"
                                                    value={tempEndDate}
                                                    onChange={e => setTempEndDate(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Dual Calendar Visual Display */}
                                        <div className="dual-calendar-preview">
                                            <div className="month-cal">
                                                <div className="month-cal-header">Octubre 2026</div>
                                                <div className="month-cal-grid">
                                                    {['D','L','M','M','J','V','S'].map(d => <span key={d} className="cal-day-head">{d}</span>)}
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                        <span
                                                            key={day}
                                                            className={`cal-day-num${day >= 15 && day <= 28 ? ' cal-day-num--in-range' : ''}${day === 15 || day === 28 ? ' cal-day-num--selected' : ''}`}
                                                        >
                                                            {day}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="month-cal">
                                                <div className="month-cal-header">Noviembre 2026</div>
                                                <div className="month-cal-grid">
                                                    {['D','L','M','M','J','V','S'].map(d => <span key={d} className="cal-day-head">{d}</span>)}
                                                    {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                                                        <span key={day} className="cal-day-num">{day}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab Body: Selección por mes */}
                                {dateTab === 'month' && (
                                    <div className="dates-month-view">
                                        <p className="month-view-subtitle">Selecciona tu mes aproximado de viaje:</p>
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
                                <h4 className="passengers-popover-title">Pasajeros (Sin habitación)</h4>
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

                                <div className="popover-footer">
                                    <button className="popover-apply-btn" onClick={handleApplyPassengers} style={{ width: '100%' }}>
                                        Aplicar Pasajeros
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
