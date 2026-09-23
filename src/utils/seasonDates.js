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
            // Kamakura safeguard: cannot start before 2026-10-16
            if (tempKey === 'kamakura' && startParsed.iso < '2026-10-16') {
                effectiveStart = { year: 2026, month: 10, day: 16, iso: '2026-10-16' }
            }

            SEASONS_INFO[tempKey].startDate = effectiveStart.iso
            SEASONS_INFO[tempKey].endDate = endParsed.iso
            SEASONS_INFO[tempKey].startMonth = effectiveStart.month
            SEASONS_INFO[tempKey].startDay = effectiveStart.day
            SEASONS_INFO[tempKey].endMonth = endParsed.month
            SEASONS_INFO[tempKey].endDay = endParsed.day

            SEASONS_INFO[tempKey].label = `${effectiveStart.day} ${shortMonths[effectiveStart.month]} — ${endParsed.day} ${shortMonths[endParsed.month]}`
            SEASONS_INFO[tempKey].monthsText = `${effectiveStart.day} de ${longMonths[effectiveStart.month]} — ${endParsed.day} de ${longMonths[endParsed.month]}`
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
