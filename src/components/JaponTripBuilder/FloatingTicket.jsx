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
        <div className="libre-calculator sticky-ticket-container">
            <div className="libre-calc-ticket-top">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="libre-calc-title">🎫 Pase de Abordar</div>
                    <div className="libre-calc-ticket-status">
                        {estilo.toUpperCase()}
                    </div>
                </div>

                {/* Trip info badge strip */}
                <div style={{ marginTop: '12px', background: 'rgba(233, 30, 122, 0.05)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--color-dark)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '3px' }}>
                        <span>📅</span> <span>{datesText}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}>
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
                {/* Base Package */}
                {selectedPkg ? (
                    <div className="libre-calc-line">
                        <span className="libre-calc-line-name">{selectedPkg.days}</span>
                        <span className="libre-calc-line-price">{formatPrice(basePrice)} c/u</span>
                    </div>
                ) : (
                    <div className="libre-calc-line">
                        <span className="libre-calc-line-name" style={{ fontWeight: '700' }}>Plan {estilo}</span>
                        <span className="libre-calc-line-price">{basePrice > 0 ? formatPrice(basePrice) : 'Cotizar'}</span>
                    </div>
                )}

                {/* Included experiences note (for Esencial/Completo) */}
                {freeExpLimit && (
                    <div className="libre-calc-line" style={{ background: '#eefcf3', padding: '6px 10px', borderRadius: '8px', margin: '6px 0' }}>
                        <span className="libre-calc-line-name" style={{ color: '#1b5e20', fontWeight: '700', fontSize: '0.8rem' }}>
                            ✨ Incluye {freeExpLimit} experiencias gratis
                        </span>
                        <span className="libre-calc-line-price" style={{ color: '#1b5e20', fontWeight: '800' }}>GRATIS</span>
                    </div>
                )}

                {/* Included list items */}
                {includedExps.map((name, i) => (
                    <div className="libre-calc-line" key={i} style={{ fontSize: '0.8rem' }}>
                        <span className="libre-calc-line-name">🌸 {name}</span>
                        <span className="libre-calc-line-price" style={{ color: '#2e7d32', fontWeight: '700' }}>Incluida</span>
                    </div>
                ))}

                {/* Cotización Extra (No incluidos) */}
                {addedItems.length > 0 && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e5e7eb' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                            🏷️ Cotización Extra (No incluidos)
                        </div>
                        {addedItems.map(exp => (
                            <div className="libre-calc-line animate-slide-in" key={exp.id}>
                                <span className="libre-calc-line-name" style={{ fontSize: '0.82rem' }}>➕ {exp.name}</span>
                                <span className="libre-calc-line-price" style={{ fontWeight: '700' }}>{formatPrice(exp.price || exp.priceNum || 0)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Selected Comps */}
                {selectedComps.map((comp, i) => (
                    <div className="libre-calc-line animate-slide-in" key={i}>
                        <span className="libre-calc-line-name">✨ {comp}</span>
                        <span className="libre-calc-line-price" style={{ fontSize: '0.78rem', opacity: 0.7 }}>Extra</span>
                    </div>
                ))}

                {/* Passenger multiplier tag */}
                {passengersCount > 1 && (
                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#666', marginTop: '8px' }}>
                        Subtotal por pers: <strong>{formatPrice(pricePerPerson)} MXN</strong> &times; {passengersCount} personas
                    </div>
                )}

                {/* Total */}
                <div className="libre-calc-total">
                    <span className="libre-calc-total-label">Total estimado</span>
                    <div>
                        <span className="libre-calc-total-price">
                            {totalPrice > 0 ? formatPrice(totalPrice) : 'Cotizar'}
                        </span>
                        {totalPrice > 0 && <span className="libre-calc-total-currency">MXN</span>}
                    </div>
                </div>

                <p className="libre-calc-note">
                    Tarifas en base a {passengersText}. Todos los impuestos incluidos. Cotización estimada para {season?.name}.
                </p>

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
                    <a
                        href={`${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`}
                        className="libre-calc-cta"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💬 Cotizar por WhatsApp
                    </a>
                    {totalPrice > 0 && onOpenCheckout && (
                        <button
                            type="button"
                            className="libre-calc-checkout-btn"
                            onClick={onOpenCheckout}
                        >
                            💳 Apartar y Pagar Anticipo
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
