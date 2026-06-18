/**
 * japonData.js — Centralized data for Japan "À la Carte" pages.
 * Used by ViajesJapon, JaponTemporada, and JaponExperiencia.
 */

export const WHATSAPP_BASE = 'https://wa.me/525513610083?text='
export const WHATSAPP_PHONE = '55 13 61 00 83'

/* ==========================================
   TEMPORADAS (Seasons)
   ========================================== */
export const TEMPORADAS = {
    sakura: {
        key: 'sakura',
        name: 'Sakura',
        fullName: 'Sakura',
        emoji: '🌸',
        months: 'Marzo — Abril',
        description: 'Vive la magia de los cerezos en flor. Japón se viste de rosa y cada rincón se convierte en un espectáculo natural único.',
        heroImage: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&h=900&fit=crop&q=85',
        cardImage: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=1000&fit=crop&q=85',
        colors: {
            primary: '#d6336c',
            secondary: '#f8b4c8',
            bg: '#fff5f8',
            gradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
            heroBg: 'linear-gradient(135deg, #8e2458 0%, #c2185b 50%, #e91e7a 100%)',
        },
        highlights: ['Cerezos en flor (Hanami)', 'Festivales de primavera', 'Clima perfecto para caminar'],
    },
    verano: {
        key: 'verano',
        name: 'Verano',
        fullName: 'Verano',
        emoji: '☀️',
        months: 'Junio — Agosto',
        description: 'Festivales vibrantes, fuegos artificiales Hanabi y la energía del verano japonés. Vive Japón en su máximo esplendor.',
        heroImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&h=900&fit=crop&q=85',
        cardImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=1000&fit=crop&q=85',
        colors: {
            primary: '#2d6a4f',
            secondary: '#95d5b2',
            bg: '#f0faf4',
            gradient: 'linear-gradient(135deg, #d8f3dc 0%, #95d5b2 100%)',
            heroBg: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
        },
        highlights: ['Matsuri (Festivales)', 'Fuegos artificiales Hanabi', 'Universal Studios & Disney'],
    },
    momiji: {
        key: 'momiji',
        name: 'Momiji',
        fullName: 'Momiji',
        emoji: '🍁',
        months: 'Octubre — Noviembre',
        description: 'Los colores del otoño transforman Japón. Templos dorados, gastronomía de temporada y paisajes que te dejan sin aliento.',
        heroImage: '/otono-japan.jpg',
        cardImage: '/otono-japan.jpg',
        colors: {
            primary: '#c44900',
            secondary: '#e8a87c',
            bg: '#fdf6f0',
            gradient: 'linear-gradient(135deg, #fde8d0 0%, #e8a87c 100%)',
            heroBg: 'linear-gradient(135deg, #7f2b0a 0%, #c44900 50%, #e65100 100%)',
        },
        highlights: ['Momiji (Hojas rojas)', 'Templos en tonos dorados', 'Gastronomía otoñal'],
    },
}

export const TEMPORADA_ORDER = ['sakura', 'verano', 'momiji']

/* ==========================================
   EXPERIENCIAS (Travel Styles)
   ========================================== */
export const EXPERIENCIAS = {
    libre: {
        key: 'libre',
        name: 'Libre',
        icon: '🌿',
        tagline: 'Viaja a tu ritmo, con estructura y respaldo en Japón.',
        shortDesc: 'Tú eliges, nosotros te damos la base para construir tu viaje.',
        ctaText: 'Crea tu Combo →',
        tier: 1,
        includes: [
            'Hospedaje',
            'Transportación base (traslados y trenes principales)',
            'Asesoría personalizada para tu itinerario',
            'Selección de experiencias disponibles',
            'Asistencia remota con equipo en Japón',
        ],
        detailedIncludes: [
            {
                title: 'Hospedaje y Desayuno Incluido',
                icon: '🏨',
                desc: 'Habitaciones dobles, dos camas en APA hoteles de 3 y 4 estrellas con calidad premium y gran desayuno buffet.',
            },
            {
                title: 'Tu Transporte También Está Incluido',
                icon: '🚄',
                desc: 'La transportación incluye tren bala e IC card para el itinerario elegido, y traslado hotel al aeropuerto.',
            },
            {
                title: 'Vive Japón a Tu Manera',
                icon: '🗺️',
                desc: 'Con ayuda de nuestros expertos, organiza tu itinerario según tu paquete elegido y recibe una guía digital completa con recomendaciones, rutas e indicaciones para tu viaje.',
            },
            {
                title: 'Wi-Fi Ilimitado',
                icon: '📶',
                desc: 'Mantente conectado durante todo tu viaje, por ello te incluimos en el paquete una e-sim de Hola Fly.',
            },
            {
                title: 'Bonus Extras',
                icon: '🎁',
                desc: 'Nuestro equipo te brindará toda la asesoría y asistencia remota antes y durante tu viaje, ayudándote a elegir experiencias y actividades, así como a seleccionar la mejor opción de vuelo para ti.',
            },
        ],
    },
    guiado: {
        key: 'guiado',
        name: 'Guiado',
        icon: '⛩️',
        tagline: 'Itinerario organizado para que vivas Japón sin perderte nada.',
        shortDesc: 'Descubre Japón con un itinerario cuidadosamente organizado.',
        ctaText: 'Elegir esta experiencia →',
        tier: 2,
        includes: [
            'Hospedaje',
            'Transportación base (traslados y trenes principales)',
            'Itinerario organizado con asesoría personalizada',
            'Experiencias elegidas con guía y en grupo',
            'Asesoría para actividades en días libres',
        ],
        detailedIncludes: [
            {
                title: 'Todo lo del plan Libre',
                icon: '✅',
                desc: 'Incluye todo lo que ofrece el plan Libre como base.',
            },
            {
                title: 'Más experiencias incluidas',
                icon: '🎌',
                desc: 'Experiencias seleccionadas con guía y en grupo para los momentos más icónicos.',
            },
            {
                title: 'Menos días libres',
                icon: '📋',
                desc: 'Un itinerario más completo con menos tiempo libre, para que no te pierdas nada.',
            },
            {
                title: 'Logística estructurada',
                icon: '🗂️',
                desc: 'Todo el transporte y tiempos planificados para tu comodidad.',
            },
        ],
    },
    acompanado: {
        key: 'acompanado',
        name: 'Acompañado',
        icon: '🏯',
        tagline: 'Viaja con tranquilidad y acompañamiento constante.',
        shortDesc: 'Viaja con acompañamiento cercano durante toda tu experiencia.',
        ctaText: 'Elegir esta experiencia →',
        tier: 3,
        includes: [
            'Hospedaje',
            'Transportación base + traslado aeropuerto – hotel',
            'Itinerario organizado con experiencias incluidas',
            'Coordinador de viaje acompañando al grupo 24/7',
            'Viaje en grupo reducido',
        ],
        detailedIncludes: [
            {
                title: 'Todo lo del plan Guiado',
                icon: '✅',
                desc: 'Incluye todo lo que ofrece el plan Guiado.',
            },
            {
                title: 'Coordinador durante el viaje',
                icon: '👤',
                desc: 'Un coordinador de viaje acompaña al grupo durante toda la experiencia.',
            },
            {
                title: 'Grupo reducido',
                icon: '👥',
                desc: 'Viaja en un grupo reducido para una experiencia más personalizada.',
            },
            {
                title: 'Atención constante',
                icon: '🛡️',
                desc: 'Soporte y acompañamiento 24/7 durante todo tu viaje.',
            },
        ],
    },
    signature: {
        key: 'signature',
        name: 'Signature',
        icon: '👑',
        tagline: 'La experiencia original de Juan y Ale.',
        shortDesc: 'Acompañamiento personal durante todo el viaje.',
        ctaText: 'Descubrir esta experiencia →',
        tier: 4,
        isSignature: true,
        includes: [
            'Hospedaje',
            'Transportación completa',
            'Itinerario exclusivo con experiencias únicas',
            'Acompañamiento personal',
            'Grupo reducido',
            'Atención personalizada 24/7',
            'Todos los servicios incluidos',
        ],
        detailedIncludes: [
            {
                title: 'Experiencia completa sin preocupaciones',
                icon: '💎',
                desc: 'Todo está cubierto. Hospedaje, transporte, experiencias y servicios premium.',
            },
            {
                title: 'Acompañamiento personal',
                icon: '👑',
                desc: 'Juan y Ale te acompañan personalmente durante todo el viaje.',
            },
            {
                title: 'Atención personalizada 24/7',
                icon: '🌟',
                desc: 'Atención exclusiva y personalizada las 24 horas del día, los 7 días de la semana.',
            },
            {
                title: 'Todos los servicios incluidos',
                icon: '🎯',
                desc: 'Vuelos, actividades premium, restaurantes seleccionados y más.',
            },
        ],
    },
}

export const EXPERIENCIA_ORDER = ['libre', 'guiado', 'acompanado', 'signature']

/* ==========================================
   PRECIOS (por temporada y experiencia)
   ========================================== */
export const PRECIOS = {
    verano: {
        libre: {
            packages: [
                { days: '8 días 6 noches', price: '$21,790', priceNum: 21790 },
                { days: '10 días 8 noches', price: '$28,490', priceNum: 28490 },
                { days: '12 días 10 noches', price: '$34,790', priceNum: 34790 },
                { days: '14 días 12 noches', price: '$38,490', priceNum: 38490 },
            ],
            note: 'Precios por persona en base a ocupación doble. Todos los impuestos incluidos. Los precios pueden variar según fechas y disponibilidad.',
            startingPrice: '$21,790',
        },
        guiado: { startingPrice: 'Cotizar', packages: [] },
        acompanado: { startingPrice: 'Cotizar', packages: [] },
        signature: { startingPrice: 'Cotizar', packages: [] },
    },
    sakura: {
        libre: { startingPrice: 'Cotizar', packages: [] },
        guiado: { startingPrice: 'Cotizar', packages: [] },
        acompanado: { startingPrice: 'Cotizar', packages: [] },
        signature: { startingPrice: 'Cotizar', packages: [] },
    },
    momiji: {
        libre: { startingPrice: 'Cotizar', packages: [] },
        guiado: { startingPrice: 'Cotizar', packages: [] },
        acompanado: { startingPrice: 'Cotizar', packages: [] },
        signature: { startingPrice: 'Cotizar', packages: [] },
    },
}

/* ==========================================
   DESTINOS / EXPERIENCIAS DISPONIBLES
   ========================================== */
export const DESTINOS_DISPONIBLES = [
    { name: 'Monte Fuji & Hakone', img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=200&h=200&fit=crop' },
    { name: 'Kamakura', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200&h=200&fit=crop' },
    { name: 'Kioto Tradicional', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=200&fit=crop' },
    { name: 'Nara', img: 'https://images.unsplash.com/photo-1624601573012-1f65b1b9504f?w=200&h=200&fit=crop' },
    { name: 'Anime & Akihabara', img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=200&h=200&fit=crop' },
    { name: 'Parques (Disney / USJ)', img: 'https://images.unsplash.com/photo-1624601573012-1f65b1b9504f?w=200&h=200&fit=crop' },
    { name: 'Compras en Tokio', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=200&fit=crop' },
    { name: 'Osaka', img: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=200&h=200&fit=crop' },
]

/* ==========================================
   EXTRAS / COMPLEMENTOS
   ========================================== */
export const COMPLEMENTOS = [
    { title: 'Día Asistido en Tokio / Kioto / Osaka', icon: '🗼', desc: 'Un guía local te acompañará en tu recorrido en el día seleccionado.' },
    { title: 'Vuelos Internacionales', icon: '✈️', desc: 'Con la ayuda de nuestros expertos, elige la mejor opción para tu vuelo internacional.' },
    { title: 'Concierge / Servicios Especiales', icon: '🎩', desc: 'Transporte privado, reservaciones a eventos y actividades especiales.' },
    { title: 'Upgrade de Hospedaje', icon: '🏯', desc: 'Complementa tu viaje con una estancia en un ryokan tradicional o un hospedaje más exclusivo.' },
]

export const ACTIVIDADES_EXTRAS = [
    { name: 'Renta Kimono', icon: '👘' },
    { name: 'Ceremonia de Té', icon: '🍵' },
    { name: 'Show de Geisha', icon: '🎭' },
    { name: 'Miradores', icon: '🏙️' },
    { name: 'Accesos VIP', icon: '⭐' },
    { name: 'Actividades Especiales', icon: '🎎' },
    { name: 'Vuelos', icon: '✈️' },
    { name: 'Restaurantes', icon: '🍣' },
]

export const EXTENSIONES = [
    { name: 'Tokio Extra', duration: '2 noches', icon: '🗼' },
    { name: 'Osaka / Kioto Extra', duration: '2 noches', icon: '⛩️' },
    { name: 'Universal Studios Japan', duration: '', icon: '🎢' },
    { name: 'Corea del Sur (Seúl)', duration: '3 a 4 noches', icon: '🇰🇷' },
]

export const FLEXIBILIDAD = [
    { title: 'Día Libre Asistido en Tokio', desc: 'Rutas recomendadas y apoyo de nuestro equipo.' },
    { title: 'Día Libre en Kioto / Osaka', desc: 'Explora a tu ritmo con nuestras recomendaciones.' },
]

/* ==========================================
   HIGHLIGHTS STRIP (Bottom bar)
   ========================================== */
export const HIGHLIGHTS_STRIP = [
    { icon: '✈️', text: 'Vuelos Internacionales' },
    { icon: '🏨', text: 'Hoteles Seleccionados' },
    { icon: '🚄', text: 'Transporte en Japón' },
    { icon: '🛡️', text: 'Soporte 24/7 en destino' },
    { icon: '💖', text: 'Seguridad y Respaldo' },
    { icon: '✨', text: 'Experiencias que Enamoran' },
]
