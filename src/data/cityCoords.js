/* =========================================================
   City Coordinates Dictionary
   All major tourist cities in Japan and South Korea.
   Used by ItineraryMap to position dots on the map.
   
   When creating a TourStop in Wix CMS, pick a `cityKey`
   from this list so the map knows where to place the dot.
   ========================================================= */

const CITY_COORDINATES = {
    /* ======================== */
    /*       JAPAN (jp)         */
    /* ======================== */

    // --- Hokkaido ---
    'sapporo':        { lat: 43.0618, lng: 141.3545, label: 'Sapporo',         country: 'jp' },
    'otaru':          { lat: 43.1907, lng: 140.9947, label: 'Otaru',           country: 'jp' },
    'hakodate':       { lat: 41.7688, lng: 140.7290, label: 'Hakodate',        country: 'jp' },
    'furano':         { lat: 43.3447, lng: 142.3831, label: 'Furano',          country: 'jp' },
    'niseko':         { lat: 42.8684, lng: 140.6990, label: 'Niseko',          country: 'jp' },
    'noboribetsu':    { lat: 42.4579, lng: 141.1694, label: 'Noboribetsu',     country: 'jp' },

    // --- Tohoku ---
    'sendai':         { lat: 38.2682, lng: 140.8694, label: 'Sendai',          country: 'jp' },
    'aomori':         { lat: 40.8244, lng: 140.7400, label: 'Aomori',          country: 'jp' },
    'akita':          { lat: 39.7200, lng: 140.1025, label: 'Akita',           country: 'jp' },
    'yamagata':       { lat: 38.2404, lng: 140.3633, label: 'Yamagata',        country: 'jp' },
    'matsushima':     { lat: 38.3725, lng: 141.0625, label: 'Matsushima',      country: 'jp' },

    // --- Kanto (Tokyo area) ---
    'tokyo':          { lat: 35.6762, lng: 139.6503, label: 'Tokyo',           country: 'jp' },
    'yokohama':       { lat: 35.4437, lng: 139.6380, label: 'Yokohama',        country: 'jp' },
    'kamakura':       { lat: 35.3192, lng: 139.5467, label: 'Kamakura',        country: 'jp' },
    'nikko':          { lat: 36.7199, lng: 139.6982, label: 'Nikko',           country: 'jp' },
    'hakone':         { lat: 35.2326, lng: 139.1070, label: 'Hakone',          country: 'jp' },
    'kawaguchiko':    { lat: 35.5105, lng: 138.7576, label: 'Kawaguchiko',      country: 'jp' },
    'monte-fuji':     { lat: 35.3606, lng: 138.7274, label: 'Monte Fuji',     country: 'jp' },

    // --- Chubu ---
    'nagoya':         { lat: 35.1815, lng: 136.9066, label: 'Nagoya',          country: 'jp' },
    'takayama':       { lat: 36.1461, lng: 137.2522, label: 'Takayama',        country: 'jp' },
    'shirakawago':    { lat: 36.2600, lng: 136.9065, label: 'Shirakawa-go',    country: 'jp' },
    'kanazawa':       { lat: 36.5613, lng: 136.6562, label: 'Kanazawa',        country: 'jp' },
    'matsumoto':      { lat: 36.2381, lng: 137.9720, label: 'Matsumoto',       country: 'jp' },
    'nagano':         { lat: 36.6513, lng: 138.1810, label: 'Nagano',          country: 'jp' },

    // --- Kansai ---
    'kyoto':          { lat: 35.0116, lng: 135.7681, label: 'Kyoto',           country: 'jp' },
    'osaka':          { lat: 34.6937, lng: 135.5023, label: 'Osaka',           country: 'jp' },
    'shin-osaka':     { lat: 34.7334, lng: 135.5000, label: 'Shin-Osaka',      country: 'jp' },
    'nara':           { lat: 34.6851, lng: 135.8048, label: 'Nara',            country: 'jp' },
    'uji':            { lat: 34.8843, lng: 135.7998, label: 'Uji',             country: 'jp' },
    'kobe':           { lat: 34.6901, lng: 135.1956, label: 'Kobe',            country: 'jp' },
    'himeji':         { lat: 34.8394, lng: 134.6939, label: 'Himeji',          country: 'jp' },
    'wakayama':       { lat: 34.2260, lng: 135.1675, label: 'Wakayama',        country: 'jp' },
    'koyasan':        { lat: 34.2129, lng: 135.5863, label: 'Koya-san',        country: 'jp' },

    // --- Chugoku ---
    'hiroshima':      { lat: 34.3853, lng: 132.4553, label: 'Hiroshima',       country: 'jp' },
    'miyajima':       { lat: 34.2961, lng: 132.3196, label: 'Miyajima',        country: 'jp' },
    'okayama':        { lat: 34.6551, lng: 133.9195, label: 'Okayama',         country: 'jp' },
    'kurashiki':      { lat: 34.5849, lng: 133.7715, label: 'Kurashiki',       country: 'jp' },
    'tottori':        { lat: 35.5011, lng: 134.2351, label: 'Tottori',         country: 'jp' },

    // --- Shikoku ---
    'matsuyama':      { lat: 33.8416, lng: 132.7657, label: 'Matsuyama',       country: 'jp' },
    'takamatsu':      { lat: 34.3401, lng: 134.0434, label: 'Takamatsu',       country: 'jp' },
    'tokushima':      { lat: 34.0658, lng: 134.5593, label: 'Tokushima',       country: 'jp' },
    'naoshima':       { lat: 34.4607, lng: 134.0017, label: 'Naoshima',        country: 'jp' },

    // --- Kyushu ---
    'fukuoka':        { lat: 33.5904, lng: 130.4017, label: 'Fukuoka',         country: 'jp' },
    'nagasaki':       { lat: 32.7503, lng: 129.8777, label: 'Nagasaki',        country: 'jp' },
    'kumamoto':       { lat: 32.8032, lng: 130.7079, label: 'Kumamoto',        country: 'jp' },
    'beppu':          { lat: 33.2846, lng: 131.4914, label: 'Beppu',           country: 'jp' },
    'kagoshima':      { lat: 31.5966, lng: 130.5571, label: 'Kagoshima',       country: 'jp' },
    'yakushima':      { lat: 30.3486, lng: 130.5061, label: 'Yakushima',       country: 'jp' },

    // --- Okinawa ---
    'okinawa':        { lat: 26.3344, lng: 127.8010, label: 'Okinawa',         country: 'jp' },
    'naha':           { lat: 26.2124, lng: 127.6809, label: 'Naha',            country: 'jp' },

    /* ======================== */
    /*     SOUTH KOREA (kr)     */
    /* ======================== */

    // --- Capital & surroundings ---
    'seoul':          { lat: 37.5665, lng: 126.9780, label: 'Seúl',            country: 'kr' },
    'incheon':        { lat: 37.4563, lng: 126.7052, label: 'Incheon',         country: 'kr' },
    'suwon':          { lat: 37.2636, lng: 127.0286, label: 'Suwon',           country: 'kr' },

    // --- Central ---
    'daejeon':        { lat: 36.3504, lng: 127.3845, label: 'Daejeon',         country: 'kr' },
    'chungju':        { lat: 36.9910, lng: 127.9259, label: 'Chungju',         country: 'kr' },
    'andong':         { lat: 36.5684, lng: 128.7294, label: 'Andong',          country: 'kr' },

    // --- Southeast ---
    'busan':          { lat: 35.1796, lng: 129.0756, label: 'Busan',           country: 'kr' },
    'gyeongju':       { lat: 35.8562, lng: 129.2247, label: 'Gyeongju',        country: 'kr' },
    'ulsan':          { lat: 35.5384, lng: 129.3114, label: 'Ulsan',           country: 'kr' },

    // --- Southwest ---
    'gwangju':        { lat: 35.1595, lng: 126.8526, label: 'Gwangju',         country: 'kr' },
    'jeonju':         { lat: 35.8242, lng: 127.1480, label: 'Jeonju',          country: 'kr' },
    'mokpo':          { lat: 34.8118, lng: 126.3922, label: 'Mokpo',           country: 'kr' },

    // --- East coast ---
    'gangneung':      { lat: 37.7519, lng: 128.8761, label: 'Gangneung',       country: 'kr' },
    'sokcho':         { lat: 38.2070, lng: 128.5918, label: 'Sokcho',          country: 'kr' },

    // --- Islands ---
    'jeju':           { lat: 33.4996, lng: 126.5312, label: 'Jeju',            country: 'kr' },
    'seongsan':       { lat: 33.4585, lng: 126.9400, label: 'Seongsan',        country: 'kr' },

    // --- DMZ ---
    'dmz':            { lat: 37.9317, lng: 126.8336, label: 'DMZ',             country: 'kr' },

    // --- Daegu ---
    'daegu':          { lat: 35.8714, lng: 128.6014, label: 'Daegu',           country: 'kr' },
}

/* Chapter city name mappings — maps display names to cityKeys */
export const CITY_NAME_TO_KEY = {
    // Japan
    'Tokyo':                  'tokyo',
    'Shin Osaka':             'osaka',
    'Hakone & Monte Fuji':    'hakone',
    'Hakone':                 'hakone',
    'Kyoto':                  'kyoto',
    'Kioto':                  'kyoto',
    'Kyoto & Nara':           'kyoto',
    'Kioto & Uji':            'kyoto',
    'Nara':                   'nara',
    'Nara & Kioto':           'nara',
    'Osaka':                  'osaka',
    'Disneyland & DisneySea': 'tokyo',
    'Kamakura':               'kamakura',
    'Hiroshima':              'hiroshima',
    'Miyajima':               'miyajima',
    'Uji':                    'uji',
    // Korea
    'Seúl':                   'seoul',
    'Busan':                  'busan',
    'Jeju':                   'jeju',
    'Gyeongju & Regreso':     'gyeongju',
}

/**
 * Get coordinates for a city.
 * Accepts either a cityKey (e.g. 'tokyo') or a display name (e.g. 'Tokyo')
 */
export function getCityCoords(cityKeyOrName) {
    // Direct key match
    const key = cityKeyOrName.toLowerCase().replace(/\s+/g, '-')
    if (CITY_COORDINATES[key]) {
        return CITY_COORDINATES[key]
    }
    // Legacy name mapping
    const mappedKey = CITY_NAME_TO_KEY[cityKeyOrName]
    if (mappedKey && CITY_COORDINATES[mappedKey]) {
        return CITY_COORDINATES[mappedKey]
    }
    // Default fallback (Tokyo)
    return CITY_COORDINATES['tokyo']
}

/**
 * Get all available city keys with their labels (for CMS reference)
 */
export function getAllCityKeys() {
    return Object.entries(CITY_COORDINATES).map(([key, data]) => ({
        key,
        label: data.label,
        country: data.country,
    }))
}

export default CITY_COORDINATES
