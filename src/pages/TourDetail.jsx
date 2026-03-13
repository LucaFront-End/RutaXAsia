import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const WHATSAPP_BASE = 'https://wa.me/525513610083?text='

/* ===== MOCK CMS DATA (replace with Wix Headless SDK) ===== */
const TOURS = {
    'sakura-2026': {
        title: 'Sakura I 2026',
        subtitle: 'Japón & Corea del Sur',
        tagline: '14 días entre cerezos en flor, templos milenarios y la vibrante energía de Seúl.',
        date: '17 – 30 Mayo 2026',
        duration: '14 días',
        cities: '5 ciudades',
        groupSize: '15 personas máx.',
        spotsLeft: 4,
        price: '$3,490 USD',
        priceNote: 'por persona · base doble',
        badge: '⭐ Más Popular',
        flagIcons: [{ code: 'jp', name: 'Japón' }, { code: 'kr', name: 'Corea' }],
        heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=1080&fit=crop&q=80',
        gallery: [
            { img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&h=600&fit=crop', caption: 'Calles de Kyoto al atardecer' },
            { img: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600&h=400&fit=crop', caption: 'Fushimi Inari, Kyoto' },
            { img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop', caption: 'Shibuya Crossing, Tokyo' },
            { img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop', caption: 'Sakura en plena floración' },
            { img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=400&fit=crop', caption: 'Monte Fuji al amanecer' },
        ],
        chapters: [
            {
                city: 'Tokyo',
                days: 'Día 1 – 4',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=700&fit=crop',
                intro: 'La capital del futuro.',
                description: 'Cuatro días inmersos en la energía infinita de Tokyo. Desde los templos ancestrales de Asakusa hasta las luces de neón de Shibuya, cada esquina es una sorpresa. Tren bala al Monte Fuji, ramen a medianoche y la ceremonia del caos organizado japonés.',
                highlights: ['Palacio Imperial & Senso-ji', 'TeamLab Borderless', 'Shibuya Crossing & Harajuku', 'Excursión Monte Fuji & Hakone'],
            },
            {
                city: 'Kyoto',
                days: 'Día 5 – 7',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200&h=700&fit=crop',
                intro: 'Donde el tiempo se detuvo.',
                description: 'Tres días en la capital espiritual de Japón. Mil torii bermellones en Fushimi Inari, el brillo dorado de Kinkaku-ji, bambú infinito en Arashiyama. Ceremonia del té y una cena kaiseki que es arte comestible. Y un día en Nara, donde los ciervos caminan libres entre budas gigantes.',
                highlights: ['Fushimi Inari al amanecer', 'Bosque de bambú Arashiyama', 'Kinkaku-ji (Pabellón dorado)', 'Nara: ciervos & Gran Buda'],
            },
            {
                city: 'Osaka',
                days: 'Día 8 – 9',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=1200&h=700&fit=crop',
                intro: 'La capital del sabor.',
                description: 'Dos días devorando la mejor street food del planeta. Dotonbori al anochecer, takoyaki ardiente, okonomiyaki perfecto. El Castillo de Osaka de día, Shinsekai de noche. Opcional: Universal Studios Japan.',
                highlights: ['Dotonbori street food', 'Castillo de Osaka', 'Barrio Shinsekai', 'Universal Studios (opcional)'],
            },
            {
                city: 'Seúl',
                days: 'Día 10 – 14',
                country: 'kr',
                image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=700&fit=crop',
                intro: 'Tradición meets K-pop.',
                description: 'Cuatro días en la capital coreana. Palacios con hanbok, el DMZ más tenso del planeta, Korean BBQ hasta la madrugada y los barrios de Hongdae y Gangnam que le dieron la vuelta al mundo. Cena de despedida con el grupo y recuerdos que duran toda la vida.',
                highlights: ['Gyeongbokgung con hanbok', 'DMZ: frontera norte', 'Hongdae & Gangnam', 'Korean BBQ de despedida'],
            },
        ],
        includes: [
            '✈️ Vuelos internacionales desde CDMX',
            '✈️ Vuelo interno Osaka → Seúl',
            '🏨 13 noches de hospedaje (3-4★)',
            '🚄 JR Pass 7 días',
            '🚆 KTX en Corea',
            '🎌 Guía hispanohablante',
            '🍜 3 comidas especiales',
            '📋 Seguro de viaje',
            '📱 Pocket WiFi / eSIM',
        ],
        notIncludes: [
            'Comidas no mencionadas',
            'Propinas (opcional)',
            'Gastos personales',
            'Actividades opcionales',
        ],
        faqs: [
            { q: '¿Necesito visa?', a: 'No. México no requiere visa para Japón ni Corea del Sur para estancias turísticas.' },
            { q: '¿Puedo pagar en cuotas?', a: 'Sí. Apartá tu lugar con un anticipo y pagá el resto en cuotas sin interés.' },
            { q: '¿Es seguro?', a: 'Japón y Corea son de los países más seguros del mundo.' },
            { q: '¿Qué pasa si no hablo el idioma?', a: 'Nuestro guía hispanohablante te acompaña todo el viaje. Todo resuelto.' },
        ],
        seoTitle: 'Sakura I 2026 — Viaje Japón y Corea | RutaXAsia',
        seoDescription: 'Viaje grupal Japón y Corea mayo 2026. Cerezos en flor, Tokyo, Kyoto, Osaka, Seúl. Incluye vuelos, hospedaje y guía. RutaXAsia México.',
    },

    'verano-japon-2026': {
        title: 'Verano Japón 2026',
        subtitle: 'Japón',
        tagline: '12 días de festivales, fuegos artificiales y la cultura japonesa en su máximo esplendor.',
        date: 'Julio 2026',
        duration: '12 días',
        cities: '4 ciudades',
        groupSize: '15 personas máx.',
        spotsLeft: 8,
        price: '$2,990 USD',
        priceNote: 'por persona · base doble',
        badge: null,
        flagIcons: [{ code: 'jp', name: 'Japón' }],
        heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&h=1080&fit=crop&q=80',
        gallery: [
            { img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&h=600&fit=crop', caption: 'Shibuya de noche' },
            { img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop', caption: 'Senso-ji, Asakusa' },
            { img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=400&fit=crop', caption: 'Monte Fuji en verano' },
            { img: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=600&h=400&fit=crop', caption: 'Castillo de Osaka' },
            { img: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&h=400&fit=crop', caption: 'Kinkaku-ji dorado' },
        ],
        chapters: [
            {
                city: 'Tokyo',
                days: 'Día 1 – 4',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=700&fit=crop',
                intro: 'La metrópoli que nunca duerme.',
                description: 'Festivales de verano, matsuri, y hanabi (fuegos artificiales) iluminan las noches de Tokyo. Robot Restaurant, Akihabara, Harajuku y cenas en izakayas bajo las luces de neón.',
                highlights: ['Festival de fuegos artificiales', 'Akihabara & Harajuku', 'TeamLab Borderless', 'Ramen Tour nocturno'],
            },
            {
                city: 'Hakone',
                days: 'Día 5 – 6',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&h=700&fit=crop',
                intro: 'Onsen con vista al Fuji.',
                description: 'Dos días de relax en los baños termales de Hakone con el majestuoso Monte Fuji de fondo. Crucero por el lago Ashi, museo al aire libre y ryokan tradicional.',
                highlights: ['Onsen con vista al Fuji', 'Lago Ashi en barco pirata', 'Museo al Aire Libre', 'Noche en ryokan'],
            },
            {
                city: 'Kyoto',
                days: 'Día 7 – 9',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200&h=700&fit=crop',
                intro: 'La esencia eterna de Japón.',
                description: 'Templos, geishas en Gion y bambú en Arashiyama. En verano, los festivales de Gion Matsuri llenan las calles de colores, tambores y tradición.',
                highlights: ['Gion Matsuri (si aplica)', 'Fushimi Inari', 'Bosque de bambú', 'Ceremonia del Té'],
            },
            {
                city: 'Osaka',
                days: 'Día 10 – 12',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=1200&h=700&fit=crop',
                intro: 'Street food capital.',
                description: 'Osaka en verano es una fiesta. Dotonbori, takoyaki, okonomiyaki y Castillo de Osaka. Universal Studios Japan opcional. Cena de despedida en un rooftop.',
                highlights: ['Dotonbori de noche', 'Castillo de Osaka', 'Street food tour', 'Universal Studios (opcional)'],
            },
        ],
        includes: [
            '✈️ Vuelos internacionales desde CDMX',
            '🏨 11 noches de hospedaje (3-4★)',
            '🚄 JR Pass 7 días',
            '🎌 Guía hispanohablante',
            '🍜 3 comidas especiales',
            '📋 Seguro de viaje',
            '📱 Pocket WiFi / eSIM',
            '♨️ Noche en ryokan con onsen',
        ],
        notIncludes: [
            'Comidas no mencionadas',
            'Propinas (opcional)',
            'Gastos personales',
            'Universal Studios (opcional)',
        ],
        faqs: [
            { q: '¿Hace mucho calor en julio?', a: 'Sí, el verano japonés es caluroso y húmedo (30-35°C). Recomendamos ropa ligera y mucha agua.' },
            { q: '¿Necesito visa?', a: 'No. México no requiere visa para Japón para estancias turísticas de hasta 90 días.' },
            { q: '¿Puedo pagar en cuotas?', a: 'Sí. Apartá tu lugar con un anticipo y pagá el resto en cuotas sin interés.' },
            { q: '¿Qué pasa si no hablo japonés?', a: 'Nuestro guía hispanohablante te acompaña todo el viaje.' },
        ],
        seoTitle: 'Verano Japón 2026 — Tour Japón Julio | RutaXAsia',
        seoDescription: 'Tour de verano por Japón julio 2026. Tokyo, Hakone, Kyoto, Osaka. Festivales y fuegos artificiales. RutaXAsia México.',
    },

    'corea-2026': {
        title: 'Corea 2026',
        subtitle: 'Corea del Sur',
        tagline: 'K-pop, palacios, street food y tecnología. 10 días descubriendo Seúl, Busan y Jeju.',
        date: 'Octubre 2026',
        duration: '10 días',
        cities: '3 ciudades',
        groupSize: '15 personas máx.',
        spotsLeft: 10,
        price: '$2,690 USD',
        priceNote: 'por persona · base doble',
        badge: null,
        flagIcons: [{ code: 'kr', name: 'Corea' }],
        heroImage: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1920&h=1080&fit=crop&q=80',
        gallery: [
            { img: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=900&h=600&fit=crop', caption: 'Gyeongbokgung de noche' },
            { img: 'https://cdn.sanity.io/images/nxpteyfv/goguides/84fccb3ef64ca065111d09bd75591078ccbd38ea-1600x1066.jpg', caption: 'Playas de Busan' },
            { img: 'https://images.unsplash.com/photo-1596276020587-8044fe049813?w=600&h=400&fit=crop', caption: 'Nami Island en otoño' },
            { img: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&h=400&fit=crop', caption: 'Hongdae de noche' },
            { img: 'https://images.unsplash.com/photo-1583400225288-2805e23c0633?w=600&h=400&fit=crop', caption: 'Korean BBQ' },
        ],
        chapters: [
            {
                city: 'Seúl',
                days: 'Día 1 – 5',
                country: 'kr',
                image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=700&fit=crop',
                intro: 'Tradición meets K-culture.',
                description: 'Cinco días explorando la capital coreana. Palacios con hanbok, el DMZ, Korean BBQ, cafés temáticos en Hongdae y las luces de Gangnam. Tour de K-pop incluido.',
                highlights: ['Gyeongbokgung con hanbok', 'DMZ: frontera norte', 'Hongdae & Gangnam', 'Tour K-pop & compras'],
            },
            {
                city: 'Busan',
                days: 'Día 6 – 8',
                country: 'kr',
                image: 'https://cdn.sanity.io/images/nxpteyfv/goguides/84fccb3ef64ca065111d09bd75591078ccbd38ea-1600x1066.jpg',
                intro: 'La ciudad costera más cool.',
                description: 'Tres días en Busan: templo Haedong Yonggungsa sobre el mar, mercado Jagalchi, playas de Haeundae y el colorido pueblo de Gamcheon. Atardeceres que no olvidarás.',
                highlights: ['Templo Haedong Yonggungsa', 'Mercado Jagalchi', 'Haeundae Beach', 'Pueblo Gamcheon'],
            },
            {
                city: 'Jeju',
                days: 'Día 9 – 10',
                country: 'kr',
                image: 'https://images.unsplash.com/photo-1596276020587-8044fe049813?w=1200&h=700&fit=crop',
                intro: 'La isla paradisíaca.',
                description: 'Dos días en la isla volcánica de Jeju: cuevas de lava, cascadas, Hallasan y la costa sur con sus acantilados dramáticos. Cena de despedida frente al mar.',
                highlights: ['Hallasan (volcán)', 'Cuevas Manjanggul', 'Cascada Jeongbang', 'Cena de despedida'],
            },
        ],
        includes: [
            '✈️ Vuelos internacionales desde CDMX',
            '✈️ Vuelo interno Busan → Jeju',
            '🏨 9 noches de hospedaje (3-4★)',
            '🚆 KTX Seúl → Busan',
            '🇰🇷 Guía hispanohablante',
            '🍜 3 comidas especiales',
            '📋 Seguro de viaje',
            '📱 eSIM con datos ilimitados',
        ],
        notIncludes: [
            'Comidas no mencionadas',
            'Propinas (opcional)',
            'Gastos personales',
            'Actividades opcionales',
        ],
        faqs: [
            { q: '¿Necesito visa para Corea?', a: 'No. México tiene acuerdo de exención de visa con Corea del Sur para estancias de hasta 90 días.' },
            { q: '¿Es seguro?', a: 'Corea del Sur es uno de los países más seguros del mundo, con índices de criminalidad muy bajos.' },
            { q: '¿Puedo pagar en cuotas?', a: 'Sí. Apartá tu lugar con un anticipo y pagá el resto en cuotas sin interés.' },
            { q: '¿Qué idioma se habla?', a: 'Coreano, pero en zonas turísticas el inglés es común. Nuestro guía hispanohablante te acompaña siempre.' },
        ],
        seoTitle: 'Corea 2026 — Viaje Seúl Busan Jeju | RutaXAsia',
        seoDescription: 'Viaje grupal a Corea del Sur octubre 2026. Seúl, Busan, Jeju. Todo incluido. RutaXAsia México.',
    },

    'otono-japon-2026': {
        title: 'Otoño en Japón 2026',
        subtitle: 'Japón',
        tagline: 'Los colores del momiji tiñen Japón de rojo y dorado. Ryokan, onsen y 12 días inolvidables.',
        date: 'Noviembre 2026',
        duration: '12 días',
        cities: '4 ciudades',
        groupSize: '12 personas máx.',
        spotsLeft: 6,
        price: '$3,290 USD',
        priceNote: 'por persona · base doble',
        badge: '🍁 Nuevo',
        flagIcons: [{ code: 'jp', name: 'Japón' }],
        heroImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&h=1080&fit=crop&q=80',
        gallery: [
            { img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&h=600&fit=crop', caption: 'Arashiyama en otoño' },
            { img: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&h=400&fit=crop', caption: 'Kinkaku-ji dorado' },
            { img: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop', caption: 'Momiji rojo' },
            { img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop', caption: 'Kyoto sunset' },
            { img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop', caption: 'Templo Senso-ji' },
        ],
        chapters: [
            {
                city: 'Tokyo',
                days: 'Día 1 – 3',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=700&fit=crop',
                intro: 'La puerta de entrada.',
                description: 'Tres días descubriendo Tokyo en otoño. Los jardines imperiales se tiñen de rojo y dorado. Meiji Jingu, Rikugien iluminado de noche, y Shinjuku Gyoen en su máximo esplendor.',
                highlights: ['Rikugien iluminado', 'Shinjuku Gyoen momiji', 'Meiji Jingu & Harajuku', 'Akihabara & Shibuya'],
            },
            {
                city: 'Hakone',
                days: 'Día 4 – 5',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&h=700&fit=crop',
                intro: 'Fuji, onsen y colores.',
                description: 'El Monte Fuji enmarcado por hojas rojas y doradas. Baños termales al aire libre con vista al volcán. Un ryokan tradicional con cena kaiseki incluida.',
                highlights: ['Onsen con vista al Fuji', 'Lago Ashi en otoño', 'Noche en ryokan', 'Cena kaiseki'],
            },
            {
                city: 'Kyoto',
                days: 'Día 6 – 9',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&h=700&fit=crop',
                intro: 'El corazón del momiji.',
                description: 'Cuatro días en la capital del otoño japonés. Tofuku-ji con su mar de hojas rojas, Arashiyama con bambú y colores, Kiyomizu-dera iluminado. Nara con ciervos entre momiji. El momento más fotogénico del año.',
                highlights: ['Tofuku-ji (momiji icónico)', 'Arashiyama en otoño', 'Kiyomizu-dera iluminado', 'Nara: ciervos & momiji'],
            },
            {
                city: 'Osaka',
                days: 'Día 10 – 12',
                country: 'jp',
                image: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=1200&h=700&fit=crop',
                intro: 'Despedida con sabor.',
                description: 'Tres días finales en la capital gastronómica. Dotonbori, Castillo de Osaka entre hojas doradas, y una cena de despedida en un restaurante tradicional. El broche de oro perfecto.',
                highlights: ['Dotonbori street food', 'Castillo de Osaka otoñal', 'Minoh Park (cascada momiji)', 'Cena de despedida'],
            },
        ],
        includes: [
            '✈️ Vuelos internacionales desde CDMX',
            '🏨 11 noches de hospedaje (3-4★)',
            '🚄 JR Pass 7 días',
            '♨️ Noche en ryokan con onsen',
            '🎌 Guía hispanohablante',
            '🍜 Cena kaiseki + 2 comidas especiales',
            '📋 Seguro de viaje',
            '📱 Pocket WiFi / eSIM',
        ],
        notIncludes: [
            'Comidas no mencionadas',
            'Propinas (opcional)',
            'Gastos personales',
            'Actividades opcionales',
        ],
        faqs: [
            { q: '¿Cuándo es la mejor época para ver momiji?', a: 'Noviembre es el pico del momiji (hojas rojas) en Kyoto y Osaka. Planificamos el viaje para coincidir.' },
            { q: '¿Necesito visa?', a: 'No. México no requiere visa para Japón para estancias turísticas de hasta 90 días.' },
            { q: '¿Puedo pagar en cuotas?', a: 'Sí. Apartá tu lugar con un anticipo y pagá en cuotas sin interés.' },
            { q: '¿Hace frío en noviembre?', a: 'Temperaturas agradables (8-18°C). Llevá una chaqueta ligera y capas.' },
        ],
        seoTitle: 'Otoño en Japón 2026 — Momiji Tour | RutaXAsia',
        seoDescription: 'Tour otoño Japón noviembre 2026. Momiji en Kyoto, onsen en Hakone, Tokyo y Osaka. RutaXAsia México.',
    },
}
/* -- SVG icons -- */
function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.215l-.304-.182-2.87.852.852-2.87-.182-.304A8 8 0 1112 20z" />
        </svg>
    )
}

export default function TourDetail() {
    const { slug } = useParams()
    const tour = TOURS[slug]
    const [lightbox, setLightbox] = useState(null)
    const [openFaq, setOpenFaq] = useState(null)
    const [showBar, setShowBar] = useState(false)
    const [activeCity, setActiveCity] = useState(0)

    useEffect(() => { window.scrollTo(0, 0) }, [slug])

    useEffect(() => {
        const onScroll = () => setShowBar(window.scrollY > 500)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    if (!tour) {
        return (
            <div className="td-notfound">
                <h1>Tour no encontrado</h1>
                <p>El viaje que buscás no existe o ya no está disponible.</p>
                <Link to="/" className="btn btn-primary">Volver al inicio</Link>
            </div>
        )
    }

    const waMsg = `SW Hola! Quiero info sobre el tour "${tour.title}" (${tour.date})`
    const waLink = `${WHATSAPP_BASE}${encodeURIComponent(waMsg)}`

    return (
        <>
            <Helmet>
                <title>{tour.seoTitle}</title>
                <meta name="description" content={tour.seoDescription} />
            </Helmet>

            {/* ===== 1. CINEMATIC HERO — Full screen ===== */}
            <section className="td-hero">
                <img src={tour.heroImage} alt={tour.title} className="td-hero-img" />
                <div className="td-hero-vignette" />
                <div className="td-hero-inner container">
                    <nav className="td-crumb">
                        <Link to="/">Inicio</Link><span>/</span><span>Tours</span><span>/</span><span>{tour.title}</span>
                    </nav>
                    {tour.badge && <span className="td-pill">{tour.badge}</span>}
                    <h1 className="td-hero-h1">{tour.title}</h1>
                    <p className="td-hero-sub">{tour.tagline}</p>
                    <div className="td-hero-chips">
                        {tour.flagIcons.map((f, i) => <img key={i} src={`https://flagcdn.com/w40/${f.code}.png`} alt={f.name} className="td-chip-flag" />)}
                        <span className="td-chip">📅 {tour.date}</span>
                        <span className="td-chip">⏱ {tour.duration}</span>
                        <span className="td-chip">🏙️ {tour.cities}</span>
                    </div>
                    <div className="td-hero-cta-row">
                        <a href={waLink} className="td-hero-btn" target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon /> Reservar — {tour.price}
                        </a>
                        {tour.spotsLeft <= 6 && (
                            <span className="td-spots"><span className="td-spots-dot" />Solo {tour.spotsLeft} lugares</span>
                        )}
                    </div>
                </div>
            </section>

            {/* ===== 2. BENTO GALLERY ===== */}
            <section className="td-gallery container">
                <div className="td-bento">
                    {tour.gallery.map((g, i) => (
                        <div key={i} className={`td-bento-cell ${i === 0 ? 'td-bento-big' : ''}`} onClick={() => setLightbox(i)}>
                            <img src={g.img} alt={g.caption} />
                            <span className="td-bento-cap">{g.caption}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== LIGHTBOX ===== */}
            {lightbox !== null && (
                <div className="td-lb" onClick={() => setLightbox(null)}>
                    <button className="td-lb-close" onClick={() => setLightbox(null)}>✕</button>
                    <button className="td-lb-nav td-lb-prev" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + tour.gallery.length) % tour.gallery.length) }}>‹</button>
                    <div className="td-lb-wrap" onClick={e => e.stopPropagation()}>
                        <img src={tour.gallery[lightbox].img} alt="" />
                        <p className="td-lb-cap">{tour.gallery[lightbox].caption}</p>
                    </div>
                    <button className="td-lb-nav td-lb-next" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % tour.gallery.length) }}>›</button>
                    <span className="td-lb-count">{lightbox + 1} / {tour.gallery.length}</span>
                </div>
            )}

            {/* ===== 3. OVERVIEW — Editorial text ===== */}
            <section className="td-editorial container">
                <h2 className="td-section-label">Sobre este viaje</h2>
                <p className="td-editorial-text">{tour.chapters[0] && `Descubrí Japón en la temporada más mágica del año: cuando los cerezos florecen y pintan de rosa las calles de Tokyo, Kyoto y Osaka. Luego cruzamos a Corea del Sur para vivir Seúl y su vibrante cultura. Un viaje de 14 días que cambiará tu perspectiva del mundo.`}</p>
            </section>

            {/* ===== 4. CITY TABS — Itinerario ===== */}
            <section className="td-tabs-section container">
                <h2 className="td-section-label">Itinerario día por día</h2>
                <p className="td-tabs-subtitle">Seleccioná una ciudad para ver el detalle</p>

                <div className="td-tabs-bar">
                    {tour.chapters.map((ch, i) => (
                        <button
                            key={i}
                            className={`td-tab ${activeCity === i ? 'td-tab--active' : ''}`}
                            onClick={() => setActiveCity(i)}
                        >
                            <img src={`https://flagcdn.com/w40/${ch.country}.png`} alt="" className="td-tab-flag" />
                            <div className="td-tab-text">
                                <span className="td-tab-city">{ch.city}</span>
                                <span className="td-tab-days">{ch.days}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="td-tab-panel" key={activeCity}>
                    <div className="td-tab-panel-img">
                        <img src={tour.chapters[activeCity].image} alt={tour.chapters[activeCity].city} />
                    </div>
                    <div className="td-tab-panel-body">
                        <span className="td-tab-panel-label">
                            <img src={`https://flagcdn.com/w20/${tour.chapters[activeCity].country}.png`} alt="" />
                            {tour.chapters[activeCity].days}
                        </span>
                        <h3 className="td-tab-panel-city">{tour.chapters[activeCity].city}</h3>
                        <p className="td-tab-panel-intro">{tour.chapters[activeCity].intro}</p>
                        <p className="td-tab-panel-desc">{tour.chapters[activeCity].description}</p>
                        <ul className="td-tab-panel-hl">
                            {tour.chapters[activeCity].highlights.map((h, j) => <li key={j}>{h}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ===== 5. SPLIT CARD — Incluye / No incluye ===== */}
            <section className="td-split-section container">
                <h2 className="td-section-label">¿Qué incluye?</h2>
                <div className="td-split-card">
                    <div className="td-split-yes">
                        <h3 className="td-split-title">Incluye</h3>
                        <ul className="td-split-list">
                            {tour.includes.map((item, i) => <li key={i}><span className="td-split-check">✓</span>{item}</li>)}
                        </ul>
                    </div>
                    <div className="td-split-no">
                        <h3 className="td-split-title">No incluye</h3>
                        <ul className="td-split-list">
                            {tour.notIncludes.map((item, i) => <li key={i}><span className="td-split-x">✕</span>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ===== 6. FAQ ===== */}
            <section className="td-faq-section container">
                <h2 className="td-section-label">Preguntas frecuentes</h2>
                <div className="td-faqs">
                    {tour.faqs.map((faq, i) => (
                        <div key={i} className={`td-faq ${openFaq === i ? 'td-faq--open' : ''}`}>
                            <button className="td-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <span>{faq.q}</span>
                                <span className="td-faq-icon">{openFaq === i ? '−' : '+'}</span>
                            </button>
                            {openFaq === i && <div className="td-faq-a"><p>{faq.a}</p></div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== 7. BOTTOM CTA ===== */}
            <section className="td-bottom-cta">
                <img src={tour.heroImage} alt="" className="td-bottom-bg" />
                <div className="td-bottom-overlay" />
                <div className="td-bottom-inner container">
                    <h2 className="td-bottom-h2">¿Listo para vivir {tour.title}?</h2>
                    <p className="td-bottom-p">Escribinos y reservá tu lugar antes de que se agoten.</p>
                    <a href={waLink} className="td-bottom-btn" target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon /> Reservar — {tour.price}
                    </a>
                </div>
            </section>

            {/* ===== FLOATING BAR ===== */}
            <div className={`td-float ${showBar ? 'td-float--show' : ''}`}>
                <div className="td-float-inner container">
                    <div className="td-float-left">
                        <strong>{tour.title}</strong>
                        <span>{tour.date} · {tour.duration}</span>
                    </div>
                    <div className="td-float-right">
                        <span className="td-float-price">{tour.price}</span>
                        <a href={waLink} className="td-float-btn" target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon /> Reservar
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}
