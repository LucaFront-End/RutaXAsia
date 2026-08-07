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
                    <div className="libre-calc-item-row" style={{ fontWeight: '800', color: 'var(--color-dark)', fontSize: '0.95rem' }}>
                        <span>Plan {selectedPkg.name || 'Seleccionado'}</span>
                        <span>{formatPrice(basePrice)}</span>
                    </div>
                )}

                {/* Included Tours Badge List */}
                {includedExps.length > 0 && (
                    <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                            ✨ Tours Incluidos ({freeExpLimit || includedExps.length} Gratis):
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            {includedExps.map((name, i) => (
                                <div key={i} style={{ fontSize: '0.8rem', color: '#333', background: '#fff7f9', padding: '4px 8px', borderRadius: '6px', borderLeft: '3px solid var(--color-primary)' }}>
                                    ✓ {name} <strong style={{ color: '#2e7d32', float: 'right' }}>GRATIS</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional / Optional Experiences Header */}
                {addedItems.length > 0 && (
                    <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>
                            {estilo === 'Tours Sueltos' ? '🏷️ Tours Seleccionados:' : '🏷️ Cotización Extra (No incluidos):'}
                        </span>
                    </div>
                )}

                {/* Added items */}
                {addedItems.length === 0 && includedExps.length === 0 && !selectedPkg && (
                    <p className="libre-calc-empty-text">Selecciona tus tours o itinerario para armar tu pase de abordar.</p>
                )}

                {addedItems.map((item, idx) => (
                    <div className="libre-calc-item-row" key={idx}>
                        <span>➕ {item.name}</span>
                        <span>{formatPrice(item.price)}</span>
                    </div>
                ))}

                {/* Selected Upsell Comps */}
                {selectedComps.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                        <span className="libre-calc-sublabel">Complementos (Por cotizar):</span>
                        {selectedComps.map((comp, idx) => (
                            <div className="libre-calc-item-row libre-calc-item-row--comp" key={idx}>
                                <span>⭐ {comp}</span>
                                <span className="libre-calc-comp-badge">Cotizar</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Subtotal per person */}
                {pricePerPerson > 0 && (
                    <div className="libre-calc-subtotal-row">
                        <span>Subtotal por pers:</span>
                        <strong>{formatPrice(pricePerPerson)} MXN</strong>
                        {passengersCount > 1 && <span> × {passengersCount} personas</span>}
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
