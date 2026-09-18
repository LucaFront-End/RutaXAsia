/**
 * seasonDates.js — Centralized date rules and helpers for Japan travel seasons.
 * 
 * Seasons:
 * 🌸 Sakura: 16 de Marzo — 15 de Abril
 * ☀️ Akari: 16 de Abril — 31 de Agosto
 * 🍁 Kamakura: 1 de Septiembre — 15 de Marzo
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
        name: 'Otoño',
        fullName: 'Otoño (Momiji / Kamakura)',
        emoji: '🍁',
        label: '1 Sep — 30 Nov',
        monthsText: '1 de Septiembre — 30 de Noviembre',
        color: '#c44900',
        heroBg: 'linear-gradient(135deg, #7f2b0a 0%, #c44900 50%, #e65100 100%)',
        startMonth: 9,
        startDay: 1,
        endMonth: 11,
        endDay: 30,
        defaultMonth: 10,
        defaultDay: 15,
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
 * Returns which season a specific date string (YYYY-MM-DD) belongs to.
 */
export function getSeasonForDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null
    const parts = dateStr.split('-')
    if (parts.length < 3) return null
    const m = parseInt(parts[1], 10)
    const d = parseInt(parts[2], 10)
    if (isNaN(m) || isNaN(d)) return null

    // Sakura: 16 de Marzo (03-16) al 15 de Abril (04-15)
    if ((m === 3 && d >= 16) || (m === 4 && d <= 15)) {
        return SEASONS_INFO.sakura
    }

    // Akari: 16 de Abril (04-16) al 31 de Agosto (08-31)
    if ((m === 4 && d >= 16) || (m >= 5 && m <= 8)) {
        return SEASONS_INFO.akari
    }

    // Otoño (Momiji): 1 de Septiembre (09-01) al 30 de Noviembre (11-30)
    if (m >= 9 && m <= 11) {
        return SEASONS_INFO.kamakura
    }

    // Invierno: 1 de Diciembre (12-01) al 15 de Marzo (03-15)
    return SEASONS_INFO.invierno
}

/**
 * Checks whether a given date belongs to the specified season.
 */
export function isDateInSeason(dateStr, seasonKey) {
    const activeSeason = getSeasonDetails(seasonKey)
    if (!activeSeason) return true // no restriction if season isn't locked
    const dateSeason = getSeasonForDate(dateStr)
    return dateSeason?.key === activeSeason.key
}

/**
 * Returns a sensible default starting date for a season.
 */
export function getDefaultDateForSeason(seasonKey) {
    const s = getSeasonDetails(seasonKey)
    if (!s) return '2026-10-15'
    const y = s.defaultYear
    const m = String(s.defaultMonth).padStart(2, '0')
    const d = String(s.defaultDay).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Formats YYYY-MM-DD into Spanish display string: e.g. "15 de Octubre de 2026".
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
