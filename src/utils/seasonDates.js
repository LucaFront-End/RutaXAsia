/**
 * seasonDates.js — Centralized date rules and helpers for Japan travel seasons.
 * 
 * Seasons:
 * 🌸 Sakura: 16 de Marzo — 15 de Abril (2027)
 * ☀️ Akari: 16 de Abril — 31 de Agosto (2027)
 * 🍁 Kamakura: 16 de Octubre — 15 de Marzo (2026-2027)
 *    - Otoño (Momiji): 16 de Octubre — 30 de Noviembre (2026)
 *    - Invierno (Fuyu): 1 de Diciembre — 15 de Marzo (2026-2027)
 */

export const SEASONS_INFO = {
    sakura: {
        key: 'sakura',
        name: 'Sakura',
        fullName: 'Sakura (Primavera)',
        emoji: '🌸',
        label: '16 Mar — 15 Abr',
        monthsText: '16 de Marzo — 15 de Abril',
        color: '#d6336c',
        heroBg: 'linear-gradient(135deg, #8e2458 0%, #c2185b 50%, #e91e7a 100%)',
        startDate: '2027-03-16',
        endDate: '2027-04-15',
        startMonth: 3,
        startDay: 16,
        endMonth: 4,
        endDay: 15,
        defaultMonth: 3,
        defaultDay: 25,
        defaultYear: 2027,
    },
    akari: {
        key: 'akari',
        name: 'Akari',
        fullName: 'Akari (Verano)',
        emoji: '☀️',
        label: '16 Abr — 31 Ago',
        monthsText: '16 de Abril — 31 de Agosto',
        color: '#2d6a4f',
        heroBg: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
        startDate: '2027-04-16',
        endDate: '2027-08-31',
        startMonth: 4,
        startDay: 16,
        endMonth: 8,
        endDay: 31,
        defaultMonth: 5,
        defaultDay: 15,
        defaultYear: 2027,
    },
    kamakura: {
        key: 'kamakura',
        name: 'Kamakura',
        fullName: 'Kamakura (Otoño e Invierno)',
        emoji: '🍁❄️',
        label: '16 Oct — 15 Mar',
        monthsText: '16 de Octubre — 15 de Marzo',
        color: '#c44900',
        heroBg: 'linear-gradient(135deg, #7f2b0a 0%, #c44900 50%, #e65100 100%)',
        startDate: '2026-10-16',
        endDate: '2027-03-15',
        startMonth: 10,
        startDay: 16,
        endMonth: 3,
        endDay: 15,
        defaultMonth: 10,
        defaultDay: 20,
        defaultYear: 2026,
    },
    invierno: {
        key: 'invierno',
        name: 'Invierno',
        fullName: 'Invierno (Nieve & Onsen)',
        emoji: '❄️',
        label: '1 Dic — 15 Mar',
        monthsText: '1 de Diciembre — 15 de Marzo',
        color: '#0284c7',
        heroBg: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
        startDate: '2026-12-01',
        endDate: '2027-03-15',
        startMonth: 12,
        startDay: 1,
        endMonth: 3,
        endDay: 15,
        defaultMonth: 12,
        defaultDay: 15,
        defaultYear: 2026,
    }
}

/**
 * Normalizes any season string/alias to 'sakura', 'akari', 'kamakura' (otono), or 'invierno'.
 */
export function normalizeSeasonKey(str) {
    if (!str || typeof str !== 'string') return null
    const clean = str.trim().toLowerCase()
    if (clean === 'sakura' || clean === 'primavera' || clean.includes('sakura') || clean.includes('primavera')) {
        return 'sakura'
    }
    if (clean === 'akari' || clean === 'verano' || clean.includes('akari') || clean.includes('verano')) {
        return 'akari'
    }
    if (clean === 'invierno' || clean === 'fuyu' || clean === 'nieve' || clean.includes('invierno') || clean.includes('fuyu')) {
        return 'invierno'
    }
    if (
        clean === 'kamakura' || clean === 'otono' || clean === 'otoño' || 
        clean === 'momiji' || clean === 'koyo' || clean.includes('otono') || clean.includes('otoño') || 
        clean.includes('momiji') || clean.includes('kamakura')
    ) {
        return 'kamakura'
    }
    return null
}

/**
 * Gets the season object for a normalized or raw key.
 */
export function getSeasonDetails(seasonKey) {
    const key = normalizeSeasonKey(seasonKey)
    return key ? SEASONS_INFO[key] : null
}

/**
 * Parse CMS date strings formatted as DD/MM/YYYY or YYYY-MM-DD
 */
export function parseCmsDate(str) {
    if (!str || typeof str !== 'string') return null
    const s = str.trim()
    // DD/MM/YYYY
    const ddmmyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (ddmmyyyy) {
        const d = parseInt(ddmmyyyy[1], 10)
        const m = parseInt(ddmmyyyy[2], 10)
        const y = parseInt(ddmmyyyy[3], 10)
        return {
            year: y,
            month: m,
            day: d,
            iso: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        }
    }
    // YYYY-MM-DD
    const yyyymmdd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (yyyymmdd) {
        const y = parseInt(yyyymmdd[1], 10)
        const m = parseInt(yyyymmdd[2], 10)
        const d = parseInt(yyyymmdd[3], 10)
        return {
            year: y,
            month: m,
            day: d,
            iso: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        }
    }
    return null
}

/**
 * Synchronize SEASONS_INFO boundaries dynamically from Wix CMS PreciosporCategoriasydias records.
 */
export function syncSeasonsWithCms(pricesList) {
    if (!Array.isArray(pricesList) || pricesList.length === 0) return SEASONS_INFO

    const shortMonths = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const longMonths = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    for (const item of pricesList) {
        const tempKey = normalizeSeasonKey(item.temporada)
        if (!tempKey || !SEASONS_INFO[tempKey]) continue

        const startParsed = parseCmsDate(item.fechasDeInicio)
        const endParsed = parseCmsDate(item.fechaEntre)

        if (startParsed && endParsed) {
            let effectiveStart = startParsed
            let effectiveEnd = endParsed

            // Kamakura safeguard: cannot start before 2026-10-16
            if (tempKey === 'kamakura' && startParsed.iso < '2026-10-16') {
                effectiveStart = { year: 2026, month: 10, day: 16, iso: '2026-10-16' }
            }

            // Akari: Summer season in Japan runs through August 31
            if (tempKey === 'akari' && endParsed.iso < '2027-08-31') {
                effectiveEnd = { year: 2027, month: 8, day: 31, iso: '2027-08-31' }
            }

            SEASONS_INFO[tempKey].startDate = effectiveStart.iso
            SEASONS_INFO[tempKey].endDate = effectiveEnd.iso
            SEASONS_INFO[tempKey].startMonth = effectiveStart.month
            SEASONS_INFO[tempKey].startDay = effectiveStart.day
            SEASONS_INFO[tempKey].endMonth = effectiveEnd.month
            SEASONS_INFO[tempKey].endDay = effectiveEnd.day

            SEASONS_INFO[tempKey].label = `${effectiveStart.day} ${shortMonths[effectiveStart.month]} — ${effectiveEnd.day} ${shortMonths[effectiveEnd.month]}`
            SEASONS_INFO[tempKey].monthsText = `${effectiveStart.day} de ${longMonths[effectiveStart.month]} — ${effectiveEnd.day} de ${longMonths[effectiveEnd.month]}`
        }
    }

    if (SEASONS_INFO.kamakura.endDate) {
        SEASONS_INFO.invierno.endDate = SEASONS_INFO.kamakura.endDate
        SEASONS_INFO.invierno.endMonth = SEASONS_INFO.kamakura.endMonth
        SEASONS_INFO.invierno.endDay = SEASONS_INFO.kamakura.endDay
    }

    return SEASONS_INFO
}

/**
 * Returns which season a specific date string (YYYY-MM-DD) belongs to.
 * Explicitly year-aware to prevent selecting out-of-season dates (such as September 2027).
 */
export function getSeasonForDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null

    // Kamakura (Otoño & Invierno): 16 de Octubre 2026 al 15 de Marzo 2027
    const kamakuraStart = SEASONS_INFO.kamakura.startDate || '2026-10-16'
    const kamakuraEnd = SEASONS_INFO.kamakura.endDate || '2027-03-15'
    if (dateStr >= kamakuraStart && dateStr <= kamakuraEnd) {
        if (dateStr >= '2026-12-01') {
            return SEASONS_INFO.invierno
        }
        return SEASONS_INFO.kamakura
    }

    // Sakura: 16 de Marzo 2027 al 15 de Abril 2027
    const sakuraStart = SEASONS_INFO.sakura.startDate || '2027-03-16'
    const sakuraEnd = SEASONS_INFO.sakura.endDate || '2027-04-15'
    if (dateStr >= sakuraStart && dateStr <= sakuraEnd) {
        return SEASONS_INFO.sakura
    }

    // Akari: 16 de Abril 2027 al 31 de Agosto 2027
    const akariStart = SEASONS_INFO.akari.startDate || '2027-04-16'
    const akariEnd = SEASONS_INFO.akari.endDate || '2027-08-31'
    if (dateStr >= akariStart && dateStr <= akariEnd) {
        return SEASONS_INFO.akari
    }

    // Any date outside active Japan travel seasons (such as September 2027 or pre-Oct 16 2026) is null
    return null
}

/**
 * Checks whether a given date belongs to the specified season.
 */
export function isDateInSeason(dateStr, seasonKey) {
    if (!dateStr || typeof dateStr !== 'string') return false
    const activeSeason = getSeasonDetails(seasonKey)
    if (!activeSeason) return true // no restriction if season isn't locked

    if (activeSeason.key === 'kamakura') {
        const start = activeSeason.startDate || '2026-10-16'
        const end = activeSeason.endDate || '2027-03-15'
        return dateStr >= start && dateStr <= end
    }
    if (activeSeason.key === 'invierno') {
        const start = activeSeason.startDate || '2026-12-01'
        const end = activeSeason.endDate || '2027-03-15'
        return dateStr >= start && dateStr <= end
    }
    if (activeSeason.key === 'sakura') {
        const start = activeSeason.startDate || '2027-03-16'
        const end = activeSeason.endDate || '2027-04-15'
        return dateStr >= start && dateStr <= end
    }
    if (activeSeason.key === 'akari') {
        const start = activeSeason.startDate || '2027-04-16'
        const end = activeSeason.endDate || '2027-08-31'
        return dateStr >= start && dateStr <= end
    }

    return false
}

/**
 * Returns a sensible default starting date for a season.
 */
export function getDefaultDateForSeason(seasonKey) {
    const s = getSeasonDetails(seasonKey)
    if (!s) return '2026-10-20'
    const y = s.defaultYear
    const m = String(s.defaultMonth).padStart(2, '0')
    const d = String(s.defaultDay).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Formats YYYY-MM-DD into Spanish display string: e.g. "20 de Octubre de 2026".
 */
export function formatDateForDisplay(dateStr) {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length < 3) return dateStr
    const y = parts[0]
    const m = parseInt(parts[1], 10)
    const d = parseInt(parts[2], 10)
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    const monthName = months[m - 1] || ''
    return `${d} de ${monthName} de ${y}`
}

/**
 * checkDateRestrictions — Validates booking lead-time (colchón) and cutoff dates.
 *
 * Rules:
 * 1. Colchón de anticipación (Kamakura y Akari):
 *    - Japón Libre: mínimo 7 días de colchón desde hoy.
 *    - Japón Esencial / Completo / Signature: mínimo 20 días de colchón desde hoy.
 * 2. Fechas límite para temporada Sakura:
 *    - Sakura Esencial / Completo / Signature: cierre el 15 de Enero del año del viaje.
 *    - Sakura Libre: cierre el 15 de Febrero del año del viaje.
 *
 * Returns an object with restriction details and pre-formatted WhatsApp link for options.
 */
export function checkDateRestrictions(dateStr, seasonKey, experienceKey, referenceDate = new Date()) {
    if (!dateStr || typeof dateStr !== 'string') {
        return { isRestricted: false }
    }

    const parts = dateStr.split('-').map(Number)
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        return { isRestricted: false }
    }

    const targetYear = parts[0]
    const targetMonth = parts[1] // 1-12
    const targetDay = parts[2]
    const targetDate = new Date(targetYear, targetMonth - 1, targetDay, 0, 0, 0)

    const today = new Date(referenceDate)
    today.setHours(0, 0, 0, 0)

    const diffMs = targetDate.getTime() - today.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    const sKey = normalizeSeasonKey(seasonKey) || 'kamakura'
    const sDetails = getSeasonDetails(sKey) || SEASONS_INFO.kamakura

    // Normalize experience
    const rawExp = String(experienceKey || '').toLowerCase()
    let expKey = 'esencial'
    let expName = 'Japón Esencial'
    if (rawExp.includes('libre')) {
        expKey = 'libre'
        expName = 'Japón Libre'
    } else if (rawExp.includes('completo')) {
        expKey = 'completo'
        expName = 'Japón Completo'
    } else if (rawExp.includes('signature')) {
        expKey = 'signature'
        expName = 'Japón Signature'
    }

    const formattedDate = formatDateForDisplay(dateStr)

    // Rule 1: Sakura Cutoff Deadlines
    if (sKey === 'sakura') {
        // Sakura Esencial / Completo / Signature: cutoff 15 de Enero
        if (expKey !== 'libre') {
            const sakuraEsencialCutoff = new Date(targetYear, 0, 15, 23, 59, 59) // 15 Ene
            if (today > sakuraEsencialCutoff) {
                const waText = encodeURIComponent(
                    `Hola RutaXAsia, me gustaría consultar opciones para viajar a Japón en temporada Sakura (${expName}) para la fecha ${formattedDate}. Veo que la fecha límite regular fue el 15 de Enero, ¿podrían apoyarme a revisar disponibilidad de último momento?`
                )
                return {
                    isRestricted: true,
                    type: 'sakura_deadline',
                    title: 'Cierre de Reservas Sakura (15 de Enero)',
                    subtitle: 'Fecha límite de reservación regular alcanzada',
                    message: `Para viajar en temporada Sakura en modalidad ${expName}, las reservas regulares cerraron el 15 de Enero debido a la alta demanda de la floración de cerezos y disponibilidad limitada en Japón.`,
                    ctaMessage: 'Envíanos un mensaje a WhatsApp para que nuestro equipo revise directamente con nuestros corresponsales en Tokio y Kioto si es posible abrir una plaza para ti.',
                    selectedDate: dateStr,
                    formattedDate,
                    seasonName: sDetails.name,
                    seasonEmoji: sDetails.emoji,
                    experienceName: expName,
                    whatsappUrl: `https://wa.me/525657929121?text=${waText}`,
                }
            }
        } else {
            // Sakura Libre: cutoff 15 de Febrero
            const sakuraLibreCutoff = new Date(targetYear, 1, 15, 23, 59, 59) // 15 Feb
            if (today > sakuraLibreCutoff) {
                const waText = encodeURIComponent(
                    `Hola RutaXAsia, me gustaría consultar opciones para viajar a Japón en temporada Sakura (${expName}) para la fecha ${formattedDate}. Veo que la fecha límite regular fue el 15 de Febrero, ¿podrían apoyarme a revisar disponibilidad de último momento?`
                )
                return {
                    isRestricted: true,
                    type: 'sakura_deadline',
                    title: 'Cierre de Reservas Sakura Libre (15 de Febrero)',
                    subtitle: 'Fecha límite de reservación regular alcanzada',
                    message: `Para viajar en temporada Sakura en modalidad ${expName}, las reservas regulares cerraron el 15 de Febrero debido a la alta ocupación en temporada alta de cerezos.`,
                    ctaMessage: 'Envíanos un mensaje a WhatsApp para verificar opciones de itinerarios y trenes disponibles.',
                    selectedDate: dateStr,
                    formattedDate,
                    seasonName: sDetails.name,
                    seasonEmoji: sDetails.emoji,
                    experienceName: expName,
                    whatsappUrl: `https://wa.me/525657929121?text=${waText}`,
                }
            }
        }
    }

    // Rule 2: Colchón de anticipación (Lead time) para Kamakura, Akari y general
    // Libre: 7 días de colchón
    // Esencial / Completo / Signature: 20 días de colchón
    const requiredColchonDays = expKey === 'libre' ? 7 : 20

    if (diffDays < requiredColchonDays) {
        const waText = encodeURIComponent(
            `Hola RutaXAsia, me interesa viajar a Japón en fecha ${formattedDate} (${sDetails.name} · ${expName}). Requiere un colchón de ${requiredColchonDays} días de anticipación, ¿podrían apoyarme para ver opciones disponibles para viajar en esta fecha?`
        )
        return {
            isRestricted: true,
            type: 'lead_time',
            daysRequired: requiredColchonDays,
            daysCurrent: diffDays,
            title: `Se requieren ${requiredColchonDays} días de colchón de anticipación`,
            subtitle: `Salida con menos de ${requiredColchonDays} días de anticipación`,
            message: expKey === 'libre'
                ? `Para viajar en modalidad Japón Libre solicitamos al menos 7 días de colchón de anticipación para garantizar tus reservas de alojamiento, traslados y documentación.`
                : `Para viajar en modalidad ${expName} solicitamos al menos 20 días de colchón de anticipación para coordinar guías en español, reservaciones exclusivas y logística completa en destino.`,
            ctaMessage: `Para viajar el ${formattedDate}, por favor escríbenos directamente por WhatsApp y nuestro equipo te apoyará con opciones viables de confirmación exprés.`,
            selectedDate: dateStr,
            formattedDate,
            seasonName: sDetails.name,
            seasonEmoji: sDetails.emoji,
            experienceName: expName,
            whatsappUrl: `https://wa.me/525657929121?text=${waText}`,
        }
    }

    return { isRestricted: false }
}
