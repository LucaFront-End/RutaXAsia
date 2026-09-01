/**
 * japonData.js — Centralized data for Japan "À la Carte" pages.
 * Used by ViajesJapon, JaponTemporada, and JaponExperiencia.
 */

export const WHATSAPP_BASE = 'https://wa.me/525657929121?text='
export const WHATSAPP_PHONE = '56 5792 9121'

/* ==========================================
   TEMPORADAS (Seasons)
   ========================================== */
export const TEMPORADAS = {
    sakura: {
        key: 'sakura',
        name: 'Sakura',
        fullName: 'Sakura',
        emoji: '🌸',
        months: '16 de Marzo — 15 de Abril',
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
    akari: {
        key: 'akari',
        name: 'Akari',
        fullName: 'Akari',
        emoji: '☀️',
        months: '16 de Abril — 31 de Agosto',
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
    kamakura: {
        key: 'kamakura',
        name: 'Otoño',
        fullName: 'Kamakura (Otoño)',
        emoji: '🍁',
        months: '1 de Septiembre — 30 de Noviembre',
        description: 'Los colores del otoño y templos serenos transforman Japón. Paisajes mágicos de Momiji, gastronomía de temporada y experiencias inolvidables.',
        heroImage: '/otono-japan.jpg',
        cardImage: '/otono-japan.jpg',
        colors: {
            primary: '#c44900',
            secondary: '#e8a87c',
            bg: '#fdf6f0',
            gradient: 'linear-gradient(135deg, #fde8d0 0%, #e8a87c 100%)',
            heroBg: 'linear-gradient(135deg, #7f2b0a 0%, #c44900 50%, #e65100 100%)',
        },
        highlights: ['Momiji (Hojas rojas)', 'Templos en tonos dorados', 'Gastronomía otoñal', 'Clima fresco y templado'],
    },
    invierno: {
        key: 'invierno',
        name: 'Invierno',
        fullName: 'Fuyu (Invierno)',
        emoji: '❄️',
        months: '1 de Diciembre — 28 de Febrero',
        description: 'Paisajes nevados, aguas termales Onsen humeantes con vista al Monte Fuji y las iluminaciones invernales más espectaculares del planeta.',
        heroImage: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1920&h=900&fit=crop&q=85',
        cardImage: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=1000&fit=crop&q=85',
        colors: {
            primary: '#0284c7',
            secondary: '#7dd3fc',
            bg: '#f0f9ff',
            gradient: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 100%)',
            heroBg: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
        },
        highlights: ['Onsen tradicional en la nieve', 'Monte Fuji nevado', 'Iluminaciones navideñas & Año Nuevo', 'Monos de nieve en Jigokudani'],
    },
}

// Aliases for seasons
TEMPORADAS.primavera = TEMPORADAS.sakura
TEMPORADAS.verano = TEMPORADAS.akari
TEMPORADAS.otono = TEMPORADAS.kamakura
TEMPORADAS.otoño = TEMPORADAS.kamakura
TEMPORADAS.momiji = TEMPORADAS.kamakura
TEMPORADAS.koyo = TEMPORADAS.kamakura
TEMPORADAS.fuyu = TEMPORADAS.invierno
TEMPORADAS.nieve = TEMPORADAS.invierno

export const TEMPORADA_ORDER = ['sakura', 'akari', 'kamakura', 'invierno']

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
    esencial: {
        key: 'esencial',
        name: 'Esencial',
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
    completo: {
        key: 'completo',
        name: 'Completo',
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
                title: 'Todo lo del plan Esencial',
                icon: '✅',
                desc: 'Incluye todo lo que ofrece el plan Esencial.',
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

// Backward-compat aliases
EXPERIENCIAS.guiado = EXPERIENCIAS.esencial
EXPERIENCIAS.acompanado = EXPERIENCIAS.completo

export const EXPERIENCIA_ORDER = ['libre', 'esencial', 'completo', 'signature']

/* ==========================================
   PRECIOS (por temporada y experiencia)
   ========================================== */
export const PRECIOS = {
    akari: {
        libre: {
            packages: [
                { days: '8 días 6 noches', price: '$21,790', priceNum: 21790 },
                { days: '10 días 8 noches', price: '$28,490', priceNum: 28490 },
                { days: '12 días 10 noches', price: '$34,790', priceNum: 34790 },
                { days: '14 días 12 noches', price: '$38,490', priceNum: 38490 },
            ],
            note: 'Precios por persona en base a ocupación doble. Todos los impuestos incluidos.',
            startingPrice: '$21,790',
        },
        esencial: {
            packages: [
                { days: '8 días 6 noches', price: '$42,890', priceNum: 42890, freeTours: 6 },
                { days: '10 días 8 noches', price: '$47,890', priceNum: 47890, freeTours: 6 },
                { days: '12 días 10 noches', price: '$56,490', priceNum: 56490, freeTours: 6 },
                { days: '14 días 12 noches', price: '$62,490', priceNum: 62490, freeTours: 6 },
            ],
            note: 'Precios por persona en base a ocupación doble. Todos los impuestos incluidos.',
            startingPrice: '$42,890',
        },
        completo: { startingPrice: 'Cotizar', packages: [] },
        signature: { startingPrice: 'Cotizar', packages: [] },
    },
    sakura: {
        libre: {
            packages: [
                { days: '8 días 6 noches', price: '$24,790', priceNum: 24790 },
                { days: '10 días 8 noches', price: '$31,490', priceNum: 31490 },
                { days: '12 días 10 noches', price: '$37,790', priceNum: 37790 },
                { days: '14 días 12 noches', price: '$41,490', priceNum: 41490 },
            ],
            note: 'Precios por persona en base a ocupación doble durante temporada alta de Sakura. Todos los impuestos incluidos.',
            startingPrice: '$24,790',
        },
        esencial: {
            packages: [
                { days: '8 días 6 noches', price: '$43,490', priceNum: 43490, freeTours: 6 },
                { days: '10 días 8 noches', price: '$49,490', priceNum: 49490, freeTours: 6 },
                { days: '12 días 10 noches', price: '$58,490', priceNum: 58490, freeTours: 6 },
                { days: '14 días 12 noches', price: '$64,790', priceNum: 64790, freeTours: 6 },
            ],
            note: 'Precios por persona en base a ocupación doble durante temporada Sakura 2027. Todos los impuestos incluidos.',
            startingPrice: '$43,490',
        },
        completo: { startingPrice: '$67,490', packages: [
            { days: '12 días 10 noches', price: '$67,490', priceNum: 67490 },
            { days: '14 días 12 noches', price: '$72,290', priceNum: 72290 },
        ] },
        signature: { startingPrice: 'Cotizar', packages: [] },
    },
    kamakura: {
        libre: {
            packages: [
                { days: '8 días 6 noches', price: '$22,490', priceNum: 22490 },
                { days: '10 días 8 noches', price: '$29,190', priceNum: 29190 },
                { days: '12 días 10 noches', price: '$35,490', priceNum: 35490 },
                { days: '14 días 12 noches', price: '$39,190', priceNum: 39190 },
            ],
            note: 'Precios por persona en base a ocupación doble durante temporada Kamakura. Todos los impuestos incluidos.',
            startingPrice: '$22,490',
        },
        esencial: {
            packages: [
                { days: '8 días 6 noches', price: '$43,490', priceNum: 43490, freeTours: 6 },
                { days: '10 días 8 noches', price: '$49,490', priceNum: 49490, freeTours: 6 },
                { days: '12 días 10 noches', price: '$58,490', priceNum: 58490, freeTours: 6 },
                { days: '14 días 12 noches', price: '$64,790', priceNum: 64790, freeTours: 6 },
            ],
            note: 'Precios por persona en base a ocupación doble durante temporada Kamakura. Todos los impuestos incluidos.',
            startingPrice: '$43,490',
        },
        completo: { startingPrice: 'Cotizar', packages: [] },
        signature: { startingPrice: 'Cotizar', packages: [] },
    },
}

// Aliases for PRECIOS
PRECIOS.verano = PRECIOS.akari
PRECIOS.momiji = PRECIOS.kamakura
PRECIOS.akari.guiado = PRECIOS.akari.esencial
PRECIOS.akari.acompanado = PRECIOS.akari.completo
PRECIOS.sakura.guiado = PRECIOS.sakura.esencial
PRECIOS.sakura.acompanado = PRECIOS.sakura.completo
PRECIOS.kamakura.guiado = PRECIOS.kamakura.esencial
PRECIOS.kamakura.acompanado = PRECIOS.kamakura.completo

/* ==========================================
   DESTINOS / EXPERIENCIAS DISPONIBLES
   ========================================== */
export const EXPERIENCIAS_DISPONIBLES = [
    { id: 'fuji', name: 'Monte Fuji & Hakone', img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=400&fit=crop', price: 3500, desc: 'Excursión al icónico Monte Fuji con parada en Hakone.' },
    { id: 'kamakura', name: 'Kamakura', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=400&fit=crop', price: 2800, desc: 'Templos y el Gran Buda de Kamakura.' },
    { id: 'kioto', name: 'Kioto Tradicional', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop', price: 4000, desc: 'Templos dorados, geishas y jardines zen.' },
    { id: 'nara', name: 'Nara', img: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=400&fit=crop', price: 2500, desc: 'Parque de ciervos y templos milenarios.' },
    { id: 'osaka', name: 'Osaka', img: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=400&fit=crop', price: 3200, desc: 'Street food, Dotonbori y castillo de Osaka.' },
    { id: 'universal', name: 'Universal Studios', img: 'https://images.unsplash.com/photo-1565402170291-8491f14678db?w=400&h=400&fit=crop', price: 4500, desc: 'Universal Studios Japan con Nintendo World.' },
    { id: 'disney', name: 'Disneyland & Disney Sea', img: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=400&h=400&fit=crop', price: 4800, desc: 'Tokyo Disneyland y DisneySea en un día mágico.' },
    { id: 'hiroshima', name: 'Hiroshima & Miyajima', img: 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=400&h=400&fit=crop', price: 5200, desc: 'Memorial de la Paz y el Torii flotante de Miyajima.' },
    { id: 'akihabara', name: 'Anime & Akihabara', img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=400&fit=crop', price: 1800, desc: 'El paraíso otaku: tiendas, arcades y cafés temáticos.' },
    { id: 'tokio', name: 'Tokio Imprescindible', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop', price: 3000, desc: 'Shibuya, Shinjuku, Asakusa y más.' },
    { id: 'takayama', name: 'Takayama', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop', price: 4200, desc: 'Los Alpes japoneses y pueblos tradicionales.' },
    { id: 'inari', name: 'Fushimi Inari', img: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=400&fit=crop', price: 2000, desc: 'Miles de torii rojos en el famoso santuario.' },
]

export const DESTINOS_DISPONIBLES = EXPERIENCIAS_DISPONIBLES.map(e => ({ name: e.name, img: e.img }))

/* ==========================================
   EXTRAS / COMPLEMENTOS
   ========================================== */
export const COMPLEMENTOS = [
    { title: 'Día Asistido en Tokio / Kioto / Osaka', icon: '🗼', desc: 'Un guía local te acompañará en tu recorrido en el día seleccionado.' },
    { title: 'Vuelos Internacionales', icon: '✈️', desc: 'Con la ayuda de nuestros expertos, elige la mejor opción para tu vuelo internacional.' },
    { title: 'Concierge / Servicios Especiales', icon: '🎩', desc: 'Transporte privado, reservaciones a eventos y actividades especiales.' },
    { title: 'Upgrade de Hospedaje', icon: '🏯', desc: 'Complementa tu viaje con una estancia en un ryokan tradicional o un hospedaje más exclusivo.' },
    { title: 'Accesos VIP', icon: '⭐', desc: 'Acceso prioritario a atracciones, eventos y lugares exclusivos.' },
]

/* ==========================================
   FLEXIBILIDAD
   ========================================== */
export const FLEXIBILIDAD = [
    { title: 'Tú eliges las fechas', desc: 'Salidas disponibles durante toda la temporada. Adaptamos el viaje a tu calendario.', icon: '📅' },
    { title: 'Modifica tu itinerario', desc: 'Agrega días, cambia ciudades o suma experiencias. El viaje es 100% tuyo.', icon: '✏️' },
    { title: 'Paga a tu ritmo', desc: 'Aparta con anticipo y liquida en cómodas cuotas sin intereses antes de viajar.', icon: '💳' },
    { title: 'Cancelación flexible', desc: 'Políticas claras y flexibles para que reserves con total tranquilidad.', icon: '🛡️' },
]

/* ==========================================
   EXTENSIONES
   ========================================== */
export const EXTENSIONES = [
    { name: 'Corea del Sur', days: '+4 a 6 días', desc: 'Seúl, Busan, K-Culture, gastronomía callejera y palacios históricos.', img: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&h=400&fit=crop', highlight: 'K-Drama & K-Pop' },
    { name: 'Playas de Okinawa', days: '+3 a 5 días', desc: 'Aguas cristalinas, arrecifes de coral, buceo y la cultura Ryukyu.', img: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&h=400&fit=crop', highlight: 'Paraíso tropical' },
    { name: 'Alpes Japoneses', days: '+3 a 4 días', desc: 'Takayama, Shirakawa-go, aguas termales onsen y aldeas tradicionales.', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop', highlight: 'Aldeas UNESCO' },
]

/* ==========================================
   HIGHLIGHTS STRIP (Bottom banner)
   ========================================== */
export const HIGHLIGHTS_STRIP = [
    { icon: '🌸', text: 'Temporadas únicas' },
    { icon: '⛩️', text: '4 formas de viajar' },
    { icon: '👥', text: 'Grupos reducidos' },
    { icon: '🛡️', text: 'Asistencia 24/7' },
    { icon: '💳', text: 'Plan de pagos' },
]

/* ==========================================
   EXP_HEROES (Hero content for Step 3)
   ========================================== */
export const EXP_HEROES = {
    libre: {
        headline: 'Diseña tu propia aventura en Japón',
        subheadline: 'Elige la duración de tu viaje y agrega únicamente las experiencias que realmente quieres vivir.',
        message: 'Tú decides cómo vivir Japón.',
    },
    esencial: {
        headline: 'Japón organizado, a tu ritmo',
        subheadline: 'Un itinerario estructurado con las mejores experiencias incluidas para que aproveches cada momento.',
        message: 'Lo mejor de Japón, sin complicaciones.',
    },
    guiado: {
        headline: 'Japón organizado, a tu ritmo',
        subheadline: 'Un itinerario estructurado con las mejores experiencias incluidas para que aproveches cada momento.',
        message: 'Lo mejor de Japón, sin complicaciones.',
    },
    completo: {
        headline: 'Japón con acompañamiento total',
        subheadline: 'Viaja con un coordinador que cuida cada detalle de tu viaje desde que aterrizas.',
        message: 'La tranquilidad de viajar acompañado.',
    },
    acompanado: {
        headline: 'Japón con acompañamiento total',
        subheadline: 'Viaja con un coordinador que cuida cada detalle de tu viaje desde que aterrizas.',
        message: 'La tranquilidad de viajar acompañado.',
    },
    signature: {
        headline: 'La experiencia definitiva en Japón',
        subheadline: 'Viaja con Juan y Ale en un grupo ultra-reducido con acceso a experiencias que no encontrarás en ningún otro lugar.',
        message: 'Japón como nunca nadie te lo contó.',
    },
}

/* ==========================================
   ACOMPAÑADO — Itinerarios
   ========================================== */
export const ITINERARIO_ACOMPANADO = [
    { day: 1, title: 'Salida y Vuelo a Japón', desc: 'Vuelo internacional desde CDMX hacia Japón.', icon: '✈️' },
    { day: 2, title: 'Llegada a Shin Osaka', desc: 'Recepción en el aeropuerto y traslado a Shin Osaka.', icon: '🛬' },
    { day: 3, title: 'Osaka: Castillo y Dotonbori', desc: 'Visita al Parque y Castillo de Osaka. Por la tarde, Dotonbori.', icon: '🏯' },
    { day: 4, title: 'Nara', desc: 'Parque Nacional de Nara y Gran Buda en Templo Todaiji.', icon: '🦌' },
    { day: 5, title: 'Kioto Clásico', desc: 'Mercado Nishiki, Templo Kiyomizudera y barrio Higashiyama.', icon: '⛩️' },
    { day: 6, title: 'Hiroshima y Miyajima', desc: 'Parque de la Paz y Torii Flotante de Miyajima.', icon: '🕊️' },
    { day: 7, title: 'Uji — Capital del Té Verde', desc: 'Cata de té y templos tradicionales en Uji.', icon: '🍵' },
    { day: 8, title: 'Traslado a Tokio — Shibuya y Shinjuku', desc: 'Tren bala Shinkansen a Tokio y noche en Shinjuku.', icon: '🚄' },
    { day: 9, title: 'Tokio Clásico: Asakusa, Sky Tree y Akihabara', desc: 'Templo Senso-ji, Tokyo Sky Tree y barrio otaku Akihabara.', icon: '🗼' },
    { day: 10, title: 'Hakone, Monte Fuji y Lago Ashi', desc: 'Ruta por Hakone, teleférico, vistas al Fuji y barco pirata.', icon: '🗻' },
    { day: 11, title: 'Día Libre en Tokio', desc: 'Día libre para actividades especiales, parques Disney o compras.', icon: '🗺️' },
    { day: 12, title: 'Regreso a México', desc: 'Check out y traslado al aeropuerto para vuelo de retorno.', icon: '🛫' },
]

export const ITINERARIO_ACOMPANADO_MOMIJI = ITINERARIO_ACOMPANADO
export const ITINERARIO_ACOMPANADO_SAKURA = ITINERARIO_ACOMPANADO

export const ACOMPANADO_TODO_INCLUIDO = [
    { item: 'Vuelo redondo desde CDMX', icon: '✈️' },
    { item: 'Hospedaje de alta valoración con desayuno', icon: '🏨' },
    { item: 'Todos los tours con entradas y transportación', icon: '🗺️' },
    { item: 'JR Pass / Tren bala Shinkansen', icon: '🚄' },
    { item: 'Coordinador en español 24/7', icon: '🗣️' },
    { item: 'Seguro de viajero internacional', icon: '🛡️' },
    { item: 'Traslados aeropuerto — hotel', icon: '🚌' },
    { item: 'Todos los impuestos incluidos', icon: '📋' },
]

export const ACOMPANADO_TODO_INCLUIDO_MOMIJI = ACOMPANADO_TODO_INCLUIDO

/* ==========================================
   SIGNATURE — Experiences & Hospedaje
   ========================================== */
export const SIGNATURE_EXPERIENCIAS = [
    { title: 'Ryokan Tradicional', icon: '🏯', desc: 'Hospédate en un ryokan auténtico con tatami, onsen y cena kaiseki.' },
    { title: 'Cena Kaiseki', icon: '🍣', desc: 'Gastronomía japonesa de alta cocina con múltiples tiempos y presentación artística.' },
    { title: 'Onsen Privado', icon: '♨️', desc: 'Baños termales privados en entornos naturales espectaculares.' },
    { title: 'Helicóptero', icon: '🚁', desc: 'Sobrevuela el Monte Fuji o la bahía de Tokio en helicóptero privado.' },
    { title: 'Chef Privado', icon: '👨‍🍳', desc: 'Un chef preparará una experiencia gastronómica exclusiva para ti.' },
    { title: 'Transporte Ejecutivo', icon: '🚗', desc: 'Traslados en vehículos premium con chofer privado.' },
    { title: 'Guía Privado', icon: '🎌', desc: 'Un guía exclusivo dedicado a tu grupo durante todo el viaje.' },
    { title: 'Reservas Exclusivas', icon: '⭐', desc: 'Acceso a restaurantes, eventos y lugares que no están abiertos al público general.' },
]

export const SIGNATURE_HOSPEDAJE = [
    { category: '4 Estrellas Superior', stars: 4, icon: '🏨', desc: 'Hoteles de categoría superior con servicios premium.' },
    { category: '5 Estrellas', stars: 5, icon: '🌟', desc: 'Los mejores hoteles de Japón con servicio excepcional.' },
    { category: 'Boutique Hotels', stars: 5, icon: '💎', desc: 'Hoteles boutique con diseño único y atención personalizada.' },
    { category: 'Ryokan Premium', stars: 5, icon: '🏯', desc: 'La experiencia tradicional japonesa al más alto nivel.' },
]

export const SIGNATURE_JUAN = {
    name: 'Juan Santiago',
    title: 'Fundador de RutaXAsia',
    experience: '+20 años creando experiencias únicas en Japón',
    desc: 'Con más de dos décadas de experiencia viajando y organizando viajes a Japón, Juan Santiago diseña personalmente cada experiencia Signature, combinando su profundo conocimiento del país con un servicio excepcional.',
    highlights: [
        'Más de 20 años de experiencia en Japón',
        'Cientos de viajes realizados',
        'Conexiones locales exclusivas',
        'Diseño personalizado de cada experiencia',
    ],
}

/* ==========================================
   GUIADO — Asistencia Features
   ========================================== */
export const GUIADO_ASISTENCIA = [
    { title: 'Soporte durante el viaje', icon: '🛡️', desc: 'Nuestro equipo estará disponible para ayudarte en cualquier momento.' },
    { title: 'Recomendaciones locales', icon: '🗺️', desc: 'Te compartimos nuestras mejores recomendaciones de restaurantes, tiendas y lugares secretos.' },
    { title: 'Ayuda logística', icon: '🗂️', desc: 'Coordinamos tus traslados, reservaciones y tiempos para que todo fluya perfecto.' },
]
