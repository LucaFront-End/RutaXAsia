import { useMemo } from 'react'
import { WHATSAPP_BASE } from '../../data/japonData'
import './StepStyles.css'

export default function FloatingTicket({
    season,
    temporadaKey,
    estilo,
    selectorData,
    selectedPkg,
    includedExps = [],
    addedItems = [],
    selectedComps = [],
    freeExpLimit = null,
    basePrice = 0,
    extraTotal = 0,
    onOpenCheckout,
}) {
    const adults = selectorData?.adults || 1
    const children = selectorData?.children || 0
    const passengersCount = adults + children

    const pricePerPerson = basePrice + extraTotal
    const totalPrice = pricePerPerson * passengersCount

    const formatPrice = (n) => `$${n.toLocaleString('es-MX')}`

    const datesText = useMemo(() => {
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
    }, [selectorData])

    const passengersText = `${adults} Adulto${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Menor${children > 1 ? 'es' : ''}` : ''}`

    // WhatsApp message
    const waMsg = `SW-Hola quiero cotizar Japón a la Carta - ${season?.name} ${estilo}` +
        ` | Fechas: ${datesText}` +
        ` | Pasajeros: ${passengersText}` +
        (selectedPkg ? ` | Pase: ${selectedPkg.days}` : '') +
        (includedExps.length ? ` | Incluidas (${freeExpLimit ? `${freeExpLimit} gratis` : 'todas'}): ${includedExps.join(', ')}` : '') +
        (addedItems.length ? ` | Experiencias agregadas: ${addedItems.map(e => e.name).join(', ')}` : '') +
        (selectedComps.length ? ` | Extras: ${selectedComps.join(', ')}` : '') +
        ` | Total estimado: ${formatPrice(totalPrice)} MXN`

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontWeight: estilo === 'Tours Sueltos' ? '700' : 'normal' }}>
                        <span>👥</span> <span>{passengersText}</span>
                    </div>
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
                            {selectedPkg.name ? (selectedPkg.name.startsWith('Pase') ? selectedPkg.name : `Plan ${selectedPkg.name}`) : 'Pase Seleccionado'}
                        </span>
                        <span className="libre-calc-item-price">{formatPrice(basePrice)} MXN</span>
                    </div>
                )}

                {/* Included Tours Badge List */}
                {includedExps.length > 0 && (
                    <div style={{ marginTop: '10px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                            ✨ Tours Incluidos ({freeExpLimit || includedExps.length} Gratis):
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                            {includedExps.map((name, i) => (
                                <div key={i} style={{ fontSize: '0.8rem', color: '#333', background: '#fff7f9', padding: '6px 10px', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>✓ {name}</span>
                                    <strong style={{ color: '#2e7d32', fontSize: '0.75rem' }}>GRATIS</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional / Optional Experiences Header */}
                {addedItems.length > 0 && (
                    <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>
                            {estilo === 'Tours Sueltos' ? '🏷️ TOURS SELECCIONADOS:' : '🏷️ TOURS ADICIONALES:'}
                        </span>
                    </div>
                )}

                {/* Added items */}
                {addedItems.length === 0 && includedExps.length === 0 && !selectedPkg && (
                    <p className="libre-calc-empty-text">Selecciona tus tours o itinerario para armar tu pase de abordar.</p>
                )}

                {addedItems.map((item, idx) => {
                    const itemQty = item.quantity || 1
                    const itemTotalPrice = (item.price || 0) * itemQty
                    return (
                        <div className="libre-calc-item-row" key={idx} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '3px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span className="libre-calc-item-title">➕ {item.name}</span>
                                <span className="libre-calc-item-price">{formatPrice(itemTotalPrice)} MXN</span>
                            </div>
                            {(item.date || itemQty > 1) && (
                                <div style={{ fontSize: '0.74rem', color: '#666', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {item.date && <span>📅 {item.date}</span>}
                                    {itemQty > 1 && <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>👥 {itemQty} personas</span>}
                                </div>
                            )}
                            {item.passengerNames && item.passengerNames.length > 0 && (
                                <div style={{ fontSize: '0.72rem', color: '#777', fontStyle: 'italic' }}>
                                    👤 {item.passengerNames.join(', ')}
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Selected Upsell Comps */}
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
                {pricePerPerson > 0 && (
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
                    <span className="libre-calc-total-label">TOTAL ESTIMADO</span>
                    <div className="libre-calc-total-amount">
                        <span className="libre-calc-total-num">
                            {totalPrice > 0 ? formatPrice(totalPrice) : 'Cotizar'}
                        </span>
                        {totalPrice > 0 && <span className="libre-calc-total-currency">MXN</span>}
                    </div>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    {onOpenCheckout && (
                        <button
                            type="button"
                            className="libre-calc-checkout-btn"
                            onClick={onOpenCheckout}
                        >
                            💳 Apartar / Reservar en Línea
                        </button>
                    )}
                    <a
                        href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                        className="libre-calc-cta"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💬 Cotizar por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    )
}
