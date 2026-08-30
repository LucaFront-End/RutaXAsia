import { useState, useMemo } from 'react'
import { WHATSAPP_BASE } from '../../data/japonData'
import './StepStyles.css'

export default function FloatingTicket({
    season,
    temporadaKey,
    estilo,
    selectorData,
    tourDate = null,
    selectedPkg,
    includedExps = [],
    addedItems = [],
    selectedComps = [],
    freeExpLimit = null,
    basePrice = 0,
    extraTotal = 0,
    anticipoText = null,
    anticipoDisplay = null,
    hideQuantity = false,
    customReserveBtnText = null,
    customWhatsAppBtnText = null,
    onOpenCheckout,
    onOpenDownloadPdf,
    onRemoveTour,
}) {
    const [isIncludesCollapsed, setIsIncludesCollapsed] = useState(false)

    const adults = selectorData?.adults || 1
    const children = selectorData?.children || 0
    const passengersCount = hideQuantity ? 1 : (adults + children)

    const computedAddedItemsTotal = useMemo(() => {
        if (!Array.isArray(addedItems) || addedItems.length === 0) return 0
        return addedItems.reduce((acc, it) => {
            const itemPrice = Number(it?.price) || Number(it?.priceNum) || 0
            const qty = Number(it?.quantity) || 1
            return acc + (itemPrice * qty)
        }, 0)
    }, [addedItems])

    const isToursSueltos = estilo === 'Tours Sueltos' || estilo?.toLowerCase()?.includes('sueltos') || estilo?.toLowerCase()?.includes('individuales')
    const effectiveExtraTotal = extraTotal > 0 ? extraTotal : computedAddedItemsTotal

    const pricePerPerson = basePrice + (isToursSueltos ? 0 : effectiveExtraTotal)
    const totalPrice = isToursSueltos
        ? ((basePrice * passengersCount) + effectiveExtraTotal)
        : (pricePerPerson * passengersCount)

    const formatPrice = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

    const datesText = useMemo(() => {
        if (tourDate) return tourDate
        if (selectorData?.dateMode === 'month') {
            return selectorData.selectedMonth || 'Por definir'
        }
        if (selectorData?.startDate && selectorData?.endDate) {
            const start = new Date(selectorData.startDate + 'T00:00:00')
            const end = new Date(selectorData.endDate + 'T00:00:00')
            const options = { day: 'numeric', month: 'short' }
            return `${start.toLocaleDateString('es-MX', options)} — ${end.toLocaleDateString('es-MX', options)}`
        }
        return 'Fechas seleccionadas'
    }, [selectorData, tourDate])

    const passengersText = `${adults} Adulto${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Menor${children > 1 ? 'es' : ''}` : ''}`

    // WhatsApp message
    const waMsg = `SW-Hola quiero cotizar Japón a la Carta - ${season?.name} ${estilo}` +
        ` | Fechas: ${datesText}` +
        (hideQuantity ? '' : ` | Pasajeros: ${passengersText}`) +
        (selectedPkg ? ` | Pase: ${selectedPkg.days}` : '') +
        (includedExps.length ? ` | Incluidas (${freeExpLimit ? `${freeExpLimit} gratis` : 'todas'}): ${includedExps.join(', ')}` : '') +
        (addedItems.length ? ` | Experiencias agregadas: ${addedItems.map(e => e.name).join(', ')}` : '') +
        (selectedComps.length ? ` | Extras: ${selectedComps.join(', ')}` : '') +
        (anticipoText ? ` | ${anticipoText}` : '') +
        ` | Total: ${formatPrice(totalPrice)} MXN`

    return (
        <div className="libre-calculator sticky-ticket-container" style={{ '--jtb-primary': season?.colors?.primary || '#e91e63' }}>
            <div className="libre-calc-ticket-top">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="libre-calc-title">🎫 Pase de Abordar</div>
                    <div className="libre-calc-ticket-status">
                        {estilo.toUpperCase()}
                    </div>
                </div>

                {/* Trip info badge strip */}
                <div style={{ marginTop: '12px', background: 'rgba(233, 30, 122, 0.05)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--color-dark)' }}>
                    {estilo !== 'Tours Sueltos' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '3px' }}>
                            <span>📅</span> <span>{datesText}</span>
                        </div>
                    )}
                    {!hideQuantity && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontWeight: estilo === 'Tours Sueltos' ? '700' : 'normal' }}>
                            <span>👥</span> <span>{passengersText}</span>
                        </div>
                    )}
                    {anticipoText && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary, #e11d48)', fontWeight: '750', marginTop: '4px' }}>
                            <span>💳</span> <span>{anticipoText}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="libre-calc-ticket-divider">
                <div className="libre-calc-notch libre-calc-notch--left" />
                <div className="libre-calc-dashed-line" />
                <div className="libre-calc-notch libre-calc-notch--right" />
            </div>

            <div className="libre-calc-ticket-body">
                {/* Selected Package Name */}
                {selectedPkg && (
                    <div className="libre-calc-item-row libre-calc-item-row--main">
                        <span className="libre-calc-item-title">
                            {selectedPkg.name ? (selectedPkg.name.startsWith('Pase') || estilo === 'Reserva' ? selectedPkg.name : `Plan ${selectedPkg.name}`) : 'Pase Seleccionado'}
                        </span>
                        <span className="libre-calc-item-price">{formatPrice(basePrice)} MXN</span>
                    </div>
                )}

                {/* Included Tours Badge List */}
                {includedExps.length > 0 && (
                    <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                        <div
                            onClick={() => setIsIncludesCollapsed(prev => !prev)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                userSelect: 'none',
                                marginBottom: isIncludesCollapsed ? '0' : '6px',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                background: 'rgba(225, 29, 72, 0.06)',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.12)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.06)'}
                        >
                            <span style={{ fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary, #e11d48)' }}>
                                ✨ {estilo === 'Reserva' ? 'Incluido en tu viaje:' : `Tours Incluidos (${freeExpLimit || includedExps.length} Gratis):`}
                            </span>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: '900',
                                color: 'var(--color-primary, #e11d48)',
                                transition: 'transform 0.2s ease',
                                transform: isIncludesCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                display: 'inline-block',
                                lineHeight: 1,
                            }}>
                                ▾
                            </span>
                        </div>
                        {!isIncludesCollapsed && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                                {includedExps.map((name, i) => (
                                    <div className={estilo === 'Reserva' ? 'libre-calc-inc-clean' : 'libre-calc-included-pill'} key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                            <span className="libre-calc-inc-check">✓</span>
                                            <span className="libre-calc-inc-text">{name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                            {estilo !== 'Reserva' && <span className="libre-calc-free-tag">GRATIS</span>}
                                            {onRemoveTour && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onRemoveTour(name) }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#9ca3af',
                                                        cursor: 'pointer',
                                                        padding: '2px 5px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold',
                                                        lineHeight: 1,
                                                        borderRadius: '4px',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                                    onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                                                    title="Eliminar tour"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {(!selectedPkg && includedExps.length === 0 && addedItems.length === 0) && (
                    <p className="libre-calc-empty-text">Selecciona tus tours o itinerario para armar tu pase de abordar.</p>
                )}

                {/* Added Items (e.g. Tours Individuales) */}
                {addedItems.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                        {addedItems.map((item, idx) => {
                            const itemQty = item.quantity || 1
                            const itemPrice = item.price || 0
                            const itemTotalPrice = itemPrice * itemQty
                            return (
                                <div className="libre-calc-item-row" key={idx} style={{ alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                    <span className="libre-calc-item-title" style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-dark, #1e293b)' }}>
                                        {item.name}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                        <span className="libre-calc-item-price" style={{ fontSize: '0.88rem', fontWeight: 800 }}>{formatPrice(itemTotalPrice)} MXN</span>
                                        {onRemoveTour && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onRemoveTour(item.id || item.name) }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#9ca3af',
                                                    cursor: 'pointer',
                                                    padding: '2px 5px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    lineHeight: 1,
                                                    borderRadius: '4px',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                                                title="Eliminar tour"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Selected Complements */}
                {selectedComps.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                        <span className="libre-calc-sublabel">COMPLEMENTOS (POR COTIZAR):</span>
                        {selectedComps.map((comp, idx) => (
                            <div className="libre-calc-item-row libre-calc-item-row--comp" key={idx}>
                                <span className="libre-calc-item-title" style={{ fontSize: '0.82rem' }}>⭐ {comp}</span>
                                <span className="libre-calc-comp-badge">COTIZAR</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Subtotal per person */}
                {pricePerPerson > 0 && !hideQuantity && (
                    <div className="libre-calc-subtotal-row">
                        <div className="libre-calc-subtotal-info">
                            <span style={{ color: '#666' }}>Subtotal por persona: </span>
                            <strong>{formatPrice(pricePerPerson)} MXN</strong>
                        </div>
                        {passengersCount > 1 && (
                            <div className="libre-calc-passengers-badge">
                                × {passengersCount} personas
                            </div>
                        )}
                    </div>
                )}

                {/* Total */}
                <div className="libre-calc-total-box">
                    <span className="libre-calc-total-label">{anticipoText ? 'PRECIO TOTAL' : 'TOTAL ESTIMADO'}</span>
                    <div className="libre-calc-total-amount">
                        <span className="libre-calc-total-num">
                            {totalPrice > 0 ? formatPrice(totalPrice) : 'Cotizar'}
                        </span>
                        {totalPrice > 0 && <span className="libre-calc-total-currency">MXN</span>}
                    </div>
                    {anticipoText && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-primary, #e11d48)', fontWeight: '750', marginTop: '4px', textAlign: 'right' }}>
                            {anticipoText}
                        </div>
                    )}
                </div>

                {/* Barcode visual */}
                <div className="libre-calc-barcode-wrapper">
                    <div className="libre-calc-barcode">
                        <div className="bar-line bar-line--w3" />
                        <div className="bar-line bar-line--w1" />
                        <div className="bar-line bar-line--w2" />
                        <div className="bar-line bar-line--w1" />
                        <div className="bar-line bar-line--w4" />
                        <div className="bar-line bar-line--w1" />
                        <div className="bar-line bar-line--w2" />
                        <div className="bar-line bar-line--w3" />
                        <div className="bar-line bar-line--w1" />
                    </div>
                    <span className="libre-calc-barcode-num">JAC-{temporadaKey?.toUpperCase() || 'JP'}-{estilo.toUpperCase()}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                    {onOpenCheckout && (
                        <button
                            type="button"
                            className="libre-calc-checkout-btn"
                            onClick={onOpenCheckout}
                        >
                            {customReserveBtnText || (anticipoDisplay ? `💳 Apartar con Anticipo: ${anticipoDisplay}` : '💳 Apartar / Reservar en Línea')}
                        </button>
                    )}
                    <a
                        href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                        className="libre-calc-cta"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {customWhatsAppBtnText || (anticipoDisplay ? `💬 Reservar con Anticipo: ${anticipoDisplay}` : '💬 Cotizar por WhatsApp')}
                    </a>
                    {onOpenDownloadPdf && (
                        <button
                            type="button"
                            className="btn btn-outline"
                            style={{ width: '100%', fontSize: '0.85rem', padding: '10px 14px', borderRadius: '12px', border: '1.5px dashed var(--color-primary, #e11d48)', color: 'var(--color-primary, #e11d48)', fontWeight: '750', background: '#fff' }}
                            onClick={onOpenDownloadPdf}
                        >
                            📄 Descargar Itinerario en PDF
                        </button>
                    )}
                </div>
            </div>

            {/* ===== MOBILE BOTTOM FLOATING CTA BAR (Franja Roja Abajo) ===== */}
            <div className="jtb-mobile-floating-bar">
                <div className="jtb-mobile-bar-left">
                    <span className="jtb-mobile-bar-title">
                        {selectedPkg?.name || estilo}
                        {datesText && datesText !== 'Fechas seleccionadas' ? ` · ${datesText}` : ''}
                    </span>
                    <div className="jtb-mobile-bar-price-row">
                        <span className="jtb-mobile-bar-price">
                            {totalPrice > 0 ? `${formatPrice(totalPrice)} MXN` : 'Cotizar'}
                        </span>
                        {anticipoDisplay && (
                            <span className="jtb-mobile-bar-anticipo">
                                (Aparta con {anticipoDisplay})
                            </span>
                        )}
                    </div>
                </div>
                <div className="jtb-mobile-bar-right">
                    {onOpenCheckout ? (
                        <button
                            type="button"
                            className="jtb-mobile-bar-btn"
                            onClick={onOpenCheckout}
                        >
                            {customReserveBtnText ? '💳 Pagar' : (anticipoDisplay ? `💳 Apartar` : '💳 Reservar')}
                        </button>
                    ) : (
                        <a
                            href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                            className="jtb-mobile-bar-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            💬 Cotizar
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
