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
    acompanado: {
        key: 'acompanado',
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
        guiado: { startingPrice: 'Cotizar', packages: [] },
        acompanado: { startingPrice: 'Cotizar', packages: [] },
        signature: { startingPrice: 'Cotizar', packages: [] },
    },
    momiji: {
        libre: {
            packages: [
                { days: '8 días 6 noches', price: '$22,490', priceNum: 22490 },
                { days: '10 días 8 noches', price: '$29,190', priceNum: 29190 },
                { days: '12 días 10 noches', price: '$35,490', priceNum: 35490 },
                { days: '14 días 12 noches', price: '$39,190', priceNum: 39190 },
            ],
            note: 'Precios por persona en base a ocupación doble durante temporada de otoño Momiji. Todos los impuestos incluidos.',
            startingPrice: '$22,490',
        },
        guiado: { startingPrice: 'Cotizar', packages: [] },
        acompanado: { startingPrice: 'Cotizar', packages: [] },
        signature: { startingPrice: 'Cotizar', packages: [] },
    },
}

/* ==========================================
   DESTINOS / EXPERIENCIAS DISPONIBLES
   (with prices for Libre calculator)
   ========================================== */
export const EXPERIENCIAS_DISPONIBLES = [
    { id: 'fuji', name: 'Monte Fuji & Hakone', img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=400&fit=crop', price: 3500, desc: 'Excursión al icónico Monte Fuji con parada en Hakone.' },
    { id: 'kamakura', name: 'Kamakura', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=400&fit=crop', price: 2800, desc: 'Templos y el Gran Buda de Kamakura.' },
    { id: 'kioto', name: 'Kioto Tradicional', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop', price: 4000, desc: 'Templos dorados, geishas y jardines zen.' },
    { id: 'nara', name: 'Nara', img: 'https://images.unsplash.com/photo-1624601573012-1f65b1b9504f?w=400&h=400&fit=crop', price: 2500, desc: 'Parque de ciervos y templos milenarios.' },
    { id: 'osaka', name: 'Osaka', img: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=400&fit=crop', price: 3200, desc: 'Street food, Dotonbori y castillo de Osaka.' },
    { id: 'universal', name: 'Universal Studios', img: 'https://images.unsplash.com/photo-1565402170291-8491f14678db?w=400&h=400&fit=crop', price: 4500, desc: 'Universal Studios Japan con Nintendo World.' },
    { id: 'disney', name: 'Disneyland & Disney Sea', img: 'https://images.unsplash.com/photo-1613823839451-1d5a7a6a1b31?w=400&h=400&fit=crop', price: 4800, desc: 'Tokyo Disneyland y DisneySea en un día mágico.' },
    { id: 'hiroshima', name: 'Hiroshima & Miyajima', img: 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=400&h=400&fit=crop', price: 5200, desc: 'Memorial de la Paz y el Torii flotante de Miyajima.' },
    { id: 'akihabara', name: 'Anime & Akihabara', img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=400&fit=crop', price: 1800, desc: 'El paraíso otaku: tiendas, arcades y cafés temáticos.' },
    { id: 'tokio', name: 'Tokio Imprescindible', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop', price: 3000, desc: 'Shibuya, Shinjuku, Asakusa y más.' },
    { id: 'takayama', name: 'Takayama', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop', price: 4200, desc: 'Los Alpes japoneses y pueblos tradicionales.' },
    { id: 'inari', name: 'Fushimi Inari', img: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=400&fit=crop', price: 2000, desc: 'Miles de torii rojos en el famoso santuario.' },
]

// Backward-compat alias for components that still use this
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

export const ACTIVIDADES_EXTRAS = [
    { name: 'Renta Kimono', icon: '👘' },
    { name: 'Ceremonia de Té', icon: '🍵', price: 2500 },
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
   SIGNATURE — Experiencias Premium
   ========================================== */
export const SIGNATURE_EXPERIENCIAS = [
    { title: 'Ryokan Tradicional', icon: '🏯', desc: 'Hospédate en un ryokan auténtico con tatami, onsen y cena kaiseki.' },
    { title: 'Cena Kaiseki', icon: '🍱', desc: 'Gastronomía japonesa de alta cocina con múltiples tiempos y presentación artística.' },
    { title: 'Onsen Privado', icon: '♨️', desc: 'Baños termales privados en entornos naturales espectaculares.' },
    { title: 'Helicóptero', icon: '🚁', desc: 'Sobrevuela el Monte Fuji o la bahía de Tokio en helicóptero privado.' },
    { title: 'Chef Privado', icon: '👨‍🍳', desc: 'Un chef preparará una experiencia gastronómica exclusiva para ti.' },
    { title: 'Transporte Ejecutivo', icon: '🚗', desc: 'Traslados en vehículos premium con chofer privado.' },
    { title: 'Guía Privado', icon: '🎌', desc: 'Un guía exclusivo dedicado a tu grupo durante todo el viaje.' },
    { title: 'Reservas Exclusivas', icon: '🎫', desc: 'Acceso a restaurantes, eventos y lugares que no están abiertos al público general.' },
]

export const SIGNATURE_HOSPEDAJE = [
    { category: '4 Estrellas Superior', stars: 4, icon: '🏨', desc: 'Hoteles de categoría superior con servicios premium.' },
    { category: '5 Estrellas', stars: 5, icon: '🌟', desc: 'Los mejores hoteles de Japón con servicio excepcional.' },
    { category: 'Boutique Hotels', stars: 5, icon: '🎨', desc: 'Hoteles boutique con diseño único y atención personalizada.' },
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
    { title: 'Recomendaciones locales', icon: '📍', desc: 'Te compartimos nuestras mejores recomendaciones de restaurantes, tiendas y lugares secretos.' },
    { title: 'Ayuda logística', icon: '🗂️', desc: 'Coordinamos tus traslados, reservaciones y tiempos para que todo fluya perfecto.' },
]

/* ==========================================
   ACOMPAÑADO — Itinerario Día por Día
   Verano: Based on "VERANO JAPÓN 2026" PDF
   ========================================== */
export const ITINERARIO_ACOMPANADO = [
    { day: 1, title: 'Salida y vuelo a Japón', desc: 'Vuelo internacional desde CDMX hacia Japón.', icon: '✈️' },
    { day: 2, title: 'Llegada a Shin Osaka', desc: 'Llegada al aeropuerto de Narita, trámites y tren bala hacia Shin Osaka. Resto de la tarde libre.', icon: '🛬' },
    { day: 3, title: 'Parque y Castillo de Osaka', desc: 'Visita al Castillo de Osaka, una de las joyas de Japón. Por la tarde, el fabuloso barrio de Dotonbori con sus luminosas calles y restaurantes.', icon: '🏯' },
    { day: 4, title: 'Universal Studios Japan', desc: 'Día completo de diversión en Universal Studios Japan, Nintendo World, Mario Bros y Harry Potter.', icon: '🎢' },
    { day: 5, title: 'Parque Nacional de Nara', desc: 'Recorrido al Parque Nacional de Nara, visitando el majestuoso Templo Todaiji. Convivir con los ciervos al aire libre será parte de la experiencia.', icon: '🦌' },
    { day: 6, title: 'Fushimi Inari y Kioto', desc: 'Exploramos Kioto visitando el Santuario de Inari, recorremos el barrio de Higashiyama hasta llegar al majestuoso templo de Kiyomizudera al atardecer.', icon: '⛩️' },
    { day: 7, title: 'Traslado a Tokio — Shinjuku', desc: 'Tren bala a Tokio. Al llegar, visitamos Shinjuku, uno de los barrios más icónicos de la ciudad.', icon: '🚄' },
    { day: 8, title: 'Kamakura', desc: 'Viajamos a la costa de Kamakura para visitar el templo con un Buda sentado al aire libre de más de 13 metros. Tiempo para explorar sus calles, tiendas y restaurantes.', icon: '🙏' },
    { day: 9, title: 'Tokio: Palacio Imperial, Ginza y Shibuya', desc: 'Recorrido a la zona contemporánea de Tokio: Estación Central, Jardines del Palacio Imperial, barrio de la moda Ginza, estatua de Hachiko y el gran cruce de Shibuya.', icon: '🏙️' },
    { day: 10, title: 'Asakusa, Sky Tree y Akihabara', desc: 'Caminamos junto al Río Sumida hasta el antiguo barrio de Asakusa y el templo Senso-ji. Después al Sky Tree y Akihabara, ideal para las compras.', icon: '🗼' },
    { day: 11, title: 'Disneyland Tokio', desc: 'Día completo en Tokyo Disneyland, uno de los parques más famosos del mundo.', icon: '🏰' },
    { day: 12, title: 'Disney Sea Tokio', desc: 'Disney Sea Tokio, fabuloso por su estilo único a la orilla del mar. Un parque único en el mundo.', icon: '🎡' },
    { day: 13, title: 'Día libre', desc: 'Diseña el día a tu gusto: compras, visitas opcionales o simplemente disfrutar Tokio a tu ritmo.', icon: '🗺️' },
    { day: 14, title: 'Regreso a México', desc: 'Check out del hotel y traslado al aeropuerto de Narita. Vuelo de regreso a la Ciudad de México.', icon: '🛫' },
]

/* ==========================================
   ACOMPAÑADO — Itinerario Sakura Completo 2027
   Based on "Sakura Completo 2027.pdf"
   12 días, 10 noches (22 de marzo al 2 de abril)
   ========================================== */
export const ITINERARIO_ACOMPANADO_SAKURA = [
    { day: 1, title: 'Vuelo Internacional a Japón', desc: 'Vuelo internacional desde la CDMX hacia Japón. ¡Comienza la gran aventura!', icon: '✈️' },
    { day: 2, title: 'Llegada a Narita / Traslado a Osaka', desc: 'Llegada al aeropuerto de Narita, recepción y trámites varios para el viaje. Traslado al hotel en Shin Osaka, check in y tarde libre en Osaka. Noche en Shin Osaka.', icon: '🛬' },
    { day: 3, title: 'Castillo de Osaka y Dotonbori', desc: 'Iniciamos el día visitando la estación, el fabuloso museo y castillo de Osaka, así como el parque que lo rodea. Posteriormente nos vamos a Dotonbori, el barrio clásico de gastronomía y restaurantes más famoso de Japón. Noche en Shin Osaka.', icon: '🏯' },
    { day: 4, title: 'Parque Nacional de Nara', desc: 'Tour a la primera capital y cuna del budismo en Japón, la ciudad de Nara, donde visitaremos el majestuoso templo Todaiji con uno de los Budas más grandes del país, rodeado de miles de ciervos sagrados. Noche en Shin Osaka.', icon: '🦌' },
    { day: 5, title: 'City Tour Kioto (Inari & Kiyomizudera)', desc: 'La capital cultural de Japón. Visitaremos Fushimi Inari, el tradicional barrio de Gion e Higashiyama, el parque Maruyama (famoso por el festejo Hanami de floración de cerezos) y el Templo Kiyomizudera. Noche en Shin Osaka.', icon: '⛩️' },
    { day: 6, title: 'Castillo de Himeji y Kobe', desc: 'Visitamos el Castillo de Himeji, tesoro nacional famoso por su estructura blanca y los árboles de cerezos. Después viajamos a la ciudad de Kobe a probar su exquisita y mundialmente famosa carne. Noche en Shin Osaka.', icon: '🏰' },
    { day: 7, title: 'Tren Bala a Tokio & Akihabara', desc: 'Check out. Tomamos el tren bala Shinkansen con destino a Tokio. Resguardo de equipaje en el hotel y visita al famoso barrio tecnológico y de electrónica, Akihabara. Noche en Tokio.', icon: '🚄' },
    { day: 8, title: 'City Tour Tokio I: Palacio Imperial, Ginza & Shibuya', desc: 'Iniciamos en la Gran Estación de Tokio, Jardines Este del Palacio Imperial, caminata por Marunouchi hasta Ginza para compras. Por la tarde-noche, nos vamos al cruce más famoso del mundo en Shibuya y foto con la estatua de Hachiko. Noche en Tokio.', icon: '🏙️' },
    { day: 9, title: 'City Tour Tokio II: Harajuku, Omotesando & Shinjuku', desc: 'Visitamos Takeshita Street en Harajuku, el exclusivo barrio de Omotesando y sus tiendas. Por la tarde-noche exploramos Shinjuku, uno de los barrios con mejor vida nocturna e iluminación espectaculares. Noche en Tokio.', icon: '✨' },
    { day: 10, title: 'Asakusa, Sensoji & Sky Tree', desc: 'Caminata junto al río Sumida hasta el templo más antiguo de Tokio, Sensoji en Asakusa (ideal para fotos con kimono). Después visitamos el centro comercial y miradores del Tokio Sky Tree. Noche en Tokio.', icon: '🗼' },
    { day: 11, title: 'Día Libre o Tour Adicional', desc: 'Día libre en Tokio para programar actividades a tu gusto con nuestro apoyo: compras, visitas libres, tours adicionales opcionales o parques de atracciones. Noche en Tokio.', icon: '🗺️' },
    { day: 12, title: 'Regreso a México', desc: 'Desayuno y check out del hotel. Traslado al aeropuerto de Narita, check in y vuelo de regreso a la CDMX.', icon: '🛫' },
]

/* ==========================================
   ACOMPAÑADO — Itinerario Momiji (Ruta Dorada)
   Based on "OTOÑO EN JAPÓN 2026" PDF
   12 días, 10 noches
   ========================================== */
export const ITINERARIO_ACOMPANADO_MOMIJI = [
    { day: 1, title: 'Salida y vuelo a Japón', desc: 'Vuelo internacional desde CDMX hacia Japón.', icon: '✈️' },
    { day: 2, title: 'Llegada a Shin Osaka', desc: 'Recepción en el aeropuerto, trámites necesarios y primer tren bala a Shin Osaka.', icon: '🛬' },
    { day: 3, title: 'Osaka: Castillo y Dotonbori', desc: 'Visita al Parque y Castillo de Osaka, uno de los más representativos en la unificación de Japón. Por la tarde, el tradicional barrio de Dotonbori.', icon: '🏯' },
    { day: 4, title: 'Nara', desc: 'Recorrido al Parque Nacional de Nara, visitando el majestuoso Templo Todaiji y su complejo. Convivir con los ciervos al aire libre será parte de la experiencia.', icon: '🦌' },
    { day: 5, title: 'Kioto Clásico', desc: 'Recorrido por la capital cultural de Japón: mercado Nishiki, templo Kiyomizudera, barrio de Higashiyama y todos sus atractivos.', icon: '⛩️' },
    { day: 6, title: 'Hiroshima y Miyajima', desc: 'Parque y Museo de la Paz de Hiroshima. Visita al Santuario de Miyajima con su Torii Flotante y el Monte Misen.', icon: '🕊️' },
    { day: 7, title: 'Uji — Capital del Té Verde', desc: 'Visita a Uji, la capital del té verde japonés. Check out y resguardo de equipaje. Preparación para el traslado.', icon: '🍵' },
    { day: 8, title: 'Traslado a Tokio — Shibuya y Shinjuku', desc: 'Tren bala a Tokio. Visitamos Shibuya y Shinjuku, barrios modernos llenos de actividades.', icon: '🚄' },
    { day: 9, title: 'Tokio Clásico: Asakusa, Sky Tree y Akihabara', desc: 'Caminamos junto al río Sumida hacia Asakusa, Templo Senso-ji, Sky Tree y el barrio de la electrónica Akihabara.', icon: '🗼' },
    { day: 10, title: 'Hakone, Monte Fuji y Lago Ashi', desc: 'Ruta por Hakone con el Free Pass: teleférico, Monte Fuji, Lago Ashi y los paisajes otoñales más espectaculares.', icon: '🗻' },
    { day: 11, title: 'Día libre en Tokio', desc: 'Elige entre Disney, algún tour adicional, Monte Fuji extra o ir de últimas compras.', icon: '🗺️' },
    { day: 12, title: 'Regreso a México', desc: 'Check out del hotel y traslado al aeropuerto. Vuelo de regreso a la Ciudad de México.', icon: '🛫' },
]

export const ACOMPANADO_TODO_INCLUIDO = [
    { item: 'Vuelo redondo desde CDMX', icon: '✈️' },
    { item: '12 noches de hospedaje con desayuno buffet', icon: '🏨' },
    { item: 'Todos los tours con entradas y transportación', icon: '🗺️' },
    { item: 'Universal Studios Japan', icon: '🎢' },
    { item: 'Disneyland Tokio', icon: '🏰' },
    { item: 'Disney Sea Tokio', icon: '🎡' },
    { item: 'JR Pass 7 días — Tren bala', icon: '🚄' },
    { item: 'Guía y atención personalizada en español', icon: '🗣️' },
    { item: 'Envío de equipaje (aplican condiciones)', icon: '🧳' },
    { item: 'Seguro de viajero', icon: '🛡️' },
    { item: 'Traslados aeropuerto — hotel — aeropuerto', icon: '🚌' },
    { item: 'Todos los impuestos incluidos', icon: '📋' },
]

export const ACOMPANADO_TODO_INCLUIDO_MOMIJI = [
    { item: 'Vuelo internacional redondo', icon: '✈️' },
    { item: '10 noches de hospedaje con desayuno', icon: '🏨' },
    { item: 'Todos los tours con entradas y transportación', icon: '🗺️' },
    { item: 'Un parque Disney de tu elección (Disneyland o Disney Sea)', icon: '🏰' },
    { item: 'JR Pass 7 días — Tren bala', icon: '🚄' },
    { item: 'Free Pass Hakone', icon: '🗻' },
    { item: 'Guía y atención personalizada en español', icon: '🗣️' },
    { item: 'Envío de equipaje (aplican condiciones)', icon: '🧳' },
    { item: 'Seguro de viajero', icon: '🛡️' },
    { item: 'Traslados aeropuerto — hotel — aeropuerto', icon: '🚌' },
    { item: 'Todos los impuestos incluidos', icon: '📋' },
]

export const ACOMPANADO_UPSELL = [
    { title: 'Ceremonia del Té', icon: '🍵', desc: 'Participa en una auténtica ceremonia del té japonesa.' },
    { title: 'Renta de Kimono', icon: '👘', desc: 'Viste un kimono tradicional y pasea por Kioto.' },
    { title: 'Concierge Premium', icon: '🎩', desc: 'Servicios especiales, restaurantes y reservaciones exclusivas.' },
    { title: 'Restaurantes Seleccionados', icon: '🍣', desc: 'Cenas en restaurantes de alta cocina japonesa.' },
]

/* ==========================================
   EXPERIENCE HERO — Content per style
   ========================================== */
export const EXP_HEROES = {
    libre: {
        headline: 'Diseña tu propia aventura en Japón',
        subheadline: 'Elige la duración de tu viaje y agrega únicamente las experiencias que realmente quieres vivir.',
        cta: 'Arma tu viaje',
        message: 'Tú decides cómo vivir Japón.',
        heroImg: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&h=900&fit=crop&q=85',
    },
    guiado: {
        headline: 'Japón con libertad y acompañamiento',
        subheadline: 'Disfruta Japón con una experiencia flexible que incluye acompañamiento y dos experiencias seleccionadas por ti.',
        cta: 'Elige tus experiencias',
        message: 'Viaja con libertad, pero nunca solo.',
        heroImg: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=900&fit=crop&q=85',
    },
    acompanado: {
        headline: 'Todo resuelto. Llegas y disfrutas.',
        subheadline: 'Nuestro itinerario más completo para quienes desean descubrir Japón sin preocuparse por la planeación.',
        cta: 'Ver itinerario completo',
        message: 'Solo preocúpate por disfrutar Japón.',
        heroImg: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1920&h=900&fit=crop&q=85',
    },
    signature: {
        headline: 'Un viaje diseñado personalmente para ti',
        subheadline: 'Combinando más de 20 años de experiencia creando experiencias únicas en Japón. No se vende un paquete, se vende una experiencia.',
        cta: 'Solicitar diseño personalizado',
        message: 'La experiencia original de Juan Santiago.',
        heroImg: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&h=900&fit=crop&q=85',
    },
}

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

