import React, { useState } from 'react'

/* ===================================================================
   TokyoBarriosSvgMap — Elegant vector SVG map of Greater Tokyo & Kanto.
   Matches the cream (#faf5f0) and red (#dc2626) aesthetic of RutaXAsia.
   Geographically accurate placement for:
     1. CDMX -> Tokio (Narita)
     2. Asakusa & Tokyo Skytree
     3. Harajuku, Omotesando & Shinjuku
     4. Ginza & Shibuya
     5. Excursión Monte Fuji & Gotemba Outlets
     6. Excursión Kamakura & Yokohama
     7. Ueno, Ameyoko & Akihabara
     8. Tsukiji Outer Market & Kappabashi
     9. Daikanyama, Nakameguro & Ebisu
    10. Regreso a CDMX (Narita)
   =================================================================== */

// Coordinates in viewBox 0 0 920 620
const TOKYO_HOTSPOTS = [
    {
        day: 1,
        x: 775,
        y: 135,
        title: 'Salida de México',
        shortName: 'Vuelo CDMX',
        barrio: 'Vuelo Internacional',
        labelPos: 'bottom',
    },
    {
        day: 2,
        x: 640,
        y: 205,
        title: 'Asakusa & Skytree',
        shortName: 'Asakusa & Skytree',
        barrio: 'Asakusa & Sumida',
        labelPos: 'right',
    },
    {
        day: 3,
        x: 430,
        y: 255,
        title: 'Harajuku & Shinjuku',
        shortName: 'Harajuku & Shinjuku',
        barrio: 'Shinjuku',
        labelPos: 'left',
    },
    {
        day: 4,
        x: 460,
        y: 320,
        title: 'Ginza & Shibuya Crossing',
        shortName: 'Shibuya & Ginza',
        barrio: 'Shibuya',
        labelPos: 'left',
    },
    {
        day: 5,
        x: 155,
        y: 395,
        title: 'Monte Fuji & Gotemba Outlets',
        shortName: 'Monte Fuji & Gotemba',
        barrio: 'Excursión Fuji',
        labelPos: 'bottom',
    },
    {
        day: 6,
        x: 375,
        y: 520,
        title: 'Kamakura & Yokohama',
        shortName: 'Kamakura & Yokohama',
        barrio: 'Excursión Bahía',
        labelPos: 'bottom',
    },
    {
        day: 7,
        x: 565,
        y: 235,
        title: 'Ueno & Akihabara',
        shortName: 'Ueno & Akihabara',
        barrio: 'Akihabara',
        labelPos: 'top',
    },
    {
        day: 8,
        x: 555,
        y: 330,
        title: 'Tsukiji Market & Kappabashi',
        shortName: 'Tsukiji & Kappabashi',
        barrio: 'Tsukiji',
        labelPos: 'right',
    },
    {
        day: 9,
        x: 475,
        y: 385,
        title: 'Daikanyama, Nakameguro & Ebisu',
        shortName: 'Daikanyama & Ebisu',
        barrio: 'Daikanyama / Ebisu',
        labelPos: 'bottom-left',
    },
    {
        day: 10,
        x: 825,
        y: 175,
        title: 'Regreso a Ciudad de México',
        shortName: 'Regreso a CDMX',
        barrio: 'Vuelo de Regreso',
        labelPos: 'bottom',
    },
]

export default function TokyoBarriosSvgMap({ chapters = [], activeCity = 0, onCityClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null)

    // Build the SVG path connecting all 10 hotspots in itinerary sequence
    const routePathD = TOKYO_HOTSPOTS.map((p, idx) => {
        return `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    }).join(' ')

    return (
        <div
            className="tokyo-svg-map-container"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '550px',
                background: '#faf5f0',
                userSelect: 'none',
                overflow: 'hidden',
            }}
        >
            <svg
                viewBox="0 0 920 620"
                style={{ width: '100%', height: '100%', display: 'block' }}
                preserveAspectRatio="xMidYMid meet"
                aria-label="Mapa Ilustrado de Barrios de Tokio y Excursiones"
            >
                <defs>
                    {/* Shadow filter for pins and badges */}
                    <filter id="map-pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.18" />
                    </filter>
                    <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    {/* Pattern for subtle grid */}
                    <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.025)" strokeWidth="1" />
                    </pattern>
                </defs>

                {/* 1. Base Map Background */}
                <rect width="920" height="620" fill="#faf5f0" />
                <rect width="920" height="620" fill="url(#map-grid)" />

                {/* 2. Water Bodies (Tokyo Bay & Sagami Bay) */}
                {/* Tokyo Bay (Bahía de Tokio) */}
                <path
                    d="M 520 370 
                       C 540 370, 580 365, 625 365
                       C 670 370, 710 395, 715 425
                       C 720 460, 680 490, 645 520
                       C 605 550, 560 575, 520 620
                       L 480 620
                       C 455 580, 445 545, 455 500
                       C 465 460, 480 420, 500 390
                       Z"
                    fill="#eef4f8"
                    stroke="#dc2626"
                    strokeWidth="1.2"
                    strokeOpacity="0.25"
                />

                {/* Sagami Bay / Pacific (South of Kamakura & Odawara) */}
                <path
                    d="M 160 520 
                       C 220 540, 300 550, 370 560
                       C 410 565, 435 590, 450 620
                       L 0 620
                       L 0 520
                       Z"
                    fill="#edf3f7"
                    stroke="#dc2626"
                    strokeWidth="1.2"
                    strokeOpacity="0.2"
                />

                {/* Subtle wave ripples in Tokyo Bay */}
                <path
                    d="M 540 450 Q 555 445 570 450 T 600 450 M 520 480 Q 535 475 550 480 T 580 480 M 560 515 Q 575 510 590 515 T 620 515"
                    fill="none"
                    stroke="rgba(14, 165, 233, 0.25)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />

                {/* Water body labels */}
                <text
                    x="565"
                    y="470"
                    fill="rgba(0, 0, 0, 0.22)"
                    fontSize="11"
                    fontStyle="italic"
                    fontWeight="700"
                    letterSpacing="3.5"
                    textAnchor="middle"
                >
                    BAHÍA DE TOKIO
                </text>
                <text
                    x="250"
                    y="590"
                    fill="rgba(0, 0, 0, 0.18)"
                    fontSize="10"
                    fontStyle="italic"
                    fontWeight="700"
                    letterSpacing="2.5"
                    textAnchor="middle"
                >
                    BAHÍA DE SAGAMI
                </text>

                {/* 3. Rivers */}
                {/* Sumida River (flowing through Asakusa & Ryogoku into Tokyo Bay) */}
                <path
                    d="M 615 120 
                       C 610 160, 630 190, 625 215 
                       C 620 240, 605 265, 595 295 
                       C 585 320, 570 345, 550 365"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />
                {/* Tama River (Tokyo - Kanagawa border) */}
                <path
                    d="M 370 320 
                       C 410 340, 440 370, 480 395 
                       C 495 405, 505 410, 515 415"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.22)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* 4. Geography & Province Labels */}
                <text
                    x="480"
                    y="185"
                    fill="rgba(220, 38, 38, 0.35)"
                    fontSize="10.5"
                    fontWeight="800"
                    letterSpacing="3"
                    textAnchor="middle"
                >
                    TOKIO (ÁREA METROPOLITANA)
                </text>
                <text
                    x="345"
                    y="460"
                    fill="rgba(0, 0, 0, 0.22)"
                    fontSize="9.5"
                    fontWeight="750"
                    letterSpacing="2"
                    textAnchor="middle"
                >
                    KANAGAWA
                </text>
                <text
                    x="755"
                    y="275"
                    fill="rgba(0, 0, 0, 0.18)"
                    fontSize="9.5"
                    fontWeight="750"
                    letterSpacing="2.5"
                    textAnchor="middle"
                >
                    CHIBA
                </text>
                <text
                    x="210"
                    y="310"
                    fill="rgba(0, 0, 0, 0.18)"
                    fontSize="9"
                    fontWeight="750"
                    letterSpacing="2"
                    textAnchor="middle"
                >
                    YAMANASHI / FUJI
                </text>

                {/* 5. Landmarks & Natural Features */}
                {/* Mount Fuji (stylized snowcap volcano) */}
                <g transform="translate(100, 310)">
                    {/* Mountain body */}
                    <path
                        d="M 10 75 L 55 10 L 100 75 Z"
                        fill="#f7efe4"
                        stroke="#dc2626"
                        strokeWidth="1.6"
                        strokeOpacity="0.45"
                    />
                    {/* Snowcap */}
                    <path
                        d="M 38 33 Q 48 42 55 36 Q 63 43 72 33 L 55 10 Z"
                        fill="#ffffff"
                        stroke="#dc2626"
                        strokeWidth="1.2"
                        strokeOpacity="0.4"
                    />
                    <text
                        x="55"
                        y="95"
                        fill="#dc2626"
                        fontSize="9.5"
                        fontWeight="800"
                        letterSpacing="0.8"
                        textAnchor="middle"
                    >
                        MONTE FUJI (3,776 m)
                    </text>
                    <text
                        x="55"
                        y="108"
                        fill="#666"
                        fontSize="8"
                        fontWeight="600"
                        textAnchor="middle"
                    >
                        Gotemba Premium Outlets
                    </text>
                </g>

                {/* Kamakura Daibutsu & Bay Landmark */}
                <g transform="translate(375, 545)">
                    <text
                        x="0"
                        y="0"
                        fill="#7c2d12"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                    >
                        ⛩️ Kamakura (Gran Buda) & Yokohama
                    </text>
                </g>

                {/* Hotel Base Banner: APA Hotel Ryogoku Ekimae Tower */}
                <g transform="translate(605, 275)" filter="url(#map-pin-shadow)">
                    <rect
                        x="-85"
                        y="-12"
                        width="170"
                        height="24"
                        rx="12"
                        fill="#ffffff"
                        stroke="#b45309"
                        strokeWidth="1.4"
                    />
                    <text
                        x="0"
                        y="4"
                        fill="#b45309"
                        fontSize="8.5"
                        fontWeight="800"
                        letterSpacing="0.3"
                        textAnchor="middle"
                    >
                        🏨 Hotel Base: APA Tower Ryogoku
                    </text>
                </g>

                {/* International Flight Arc (CDMX to Narita) */}
                <path
                    d="M 910 80 Q 840 100 780 135"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                    strokeOpacity="0.45"
                />
                <text x="880" y="78" fill="#dc2626" fontSize="12" textAnchor="middle">
                    ✈️
                </text>
                <text
                    x="845"
                    y="68"
                    fill="#dc2626"
                    fontSize="8.5"
                    fontWeight="800"
                    letterSpacing="0.5"
                    textAnchor="middle"
                >
                    VUELO DESDE CDMX
                </text>

                {/* 6. Itinerary Route Polyline */}
                {/* Glow underlay */}
                <path
                    d={routePathD}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="4"
                    strokeOpacity="0.18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Crisp dashed route */}
                <path
                    d={routePathD}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.2"
                    strokeDasharray="7 5"
                    strokeOpacity="0.65"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* 7. Hotspots (1 to 10) */}
                {TOKYO_HOTSPOTS.map((spot, i) => {
                    const isActive = i === activeCity
                    const isHovered = i === hoveredIndex
                    const chapter = chapters[i] || {}

                    return (
                        <g
                            key={`hotspot-${spot.day}`}
                            className={`map-hotspot-group ${isActive ? 'is-active' : ''}`}
                            onClick={() => onCityClick && onCityClick(i)}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Pulsing ripple for active dot */}
                            {isActive && (
                                <>
                                    <circle
                                        cx={spot.x}
                                        cy={spot.y}
                                        r="24"
                                        fill="none"
                                        stroke="#dc2626"
                                        strokeWidth="2"
                                        strokeOpacity="0.3"
                                    >
                                        <animate
                                            attributeName="r"
                                            values="18;28;18"
                                            dur="2s"
                                            repeatCount="indefinite"
                                        />
                                        <animate
                                            attributeName="stroke-opacity"
                                            values="0.5;0.1;0.5"
                                            dur="2s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                    <circle
                                        cx={spot.x}
                                        cy={spot.y}
                                        r="18"
                                        fill="#dc2626"
                                        fillOpacity="0.15"
                                    />
                                </>
                            )}

                            {/* Base Circle Marker */}
                            <circle
                                cx={spot.x}
                                cy={spot.y}
                                r={isActive ? 17 : isHovered ? 15 : 13}
                                fill={isActive ? '#dc2626' : isHovered ? '#dc2626' : '#ffffff'}
                                stroke={isActive ? '#ffffff' : '#dc2626'}
                                strokeWidth={isActive ? 2.5 : 2.2}
                                filter="url(#map-pin-shadow)"
                                style={{ transition: 'all 0.25s ease' }}
                            />

                            {/* Day Number inside Marker */}
                            <text
                                x={spot.x}
                                y={spot.y + 0.5}
                                fill={isActive || isHovered ? '#ffffff' : '#dc2626'}
                                fontSize={isActive ? '11.5' : '10'}
                                fontWeight="850"
                                textAnchor="middle"
                                dominantBaseline="central"
                                style={{ pointerEvents: 'none', transition: 'all 0.25s ease' }}
                            >
                                {spot.day}
                            </text>

                            {/* Label Pill (Always visible for active, visible on hover for others) */}
                            {(isActive || isHovered) && (
                                <g
                                    transform={`translate(${
                                        spot.labelPos === 'left'
                                            ? spot.x - 12
                                            : spot.labelPos === 'right'
                                            ? spot.x + 12
                                            : spot.x
                                    }, ${
                                        spot.labelPos === 'bottom' || spot.labelPos === 'bottom-left'
                                            ? spot.y + 24
                                            : spot.labelPos === 'top'
                                            ? spot.y - 24
                                            : spot.y - 12
                                    })`}
                                    filter="url(#map-pin-shadow)"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <rect
                                        x={
                                            spot.labelPos === 'left'
                                                ? -150
                                                : spot.labelPos === 'right'
                                                ? 0
                                                : -75
                                        }
                                        y="-13"
                                        width="150"
                                        height="26"
                                        rx="13"
                                        fill={isActive ? '#dc2626' : '#ffffff'}
                                        stroke={isActive ? '#ffffff' : 'rgba(0,0,0,0.12)'}
                                        strokeWidth="1.2"
                                    />
                                    <text
                                        x={
                                            spot.labelPos === 'left'
                                                ? -75
                                                : spot.labelPos === 'right'
                                                ? 75
                                                : 0
                                        }
                                        y="4"
                                        fill={isActive ? '#ffffff' : '#111827'}
                                        fontSize="9.5"
                                        fontWeight="750"
                                        textAnchor="middle"
                                    >
                                        {`Día ${spot.day} · ${chapter.city || spot.shortName}`}
                                    </text>
                                </g>
                            )}

                            {/* Permanent Mini-Label for Non-Active stops so map is easy to read at a glance */}
                            {!isActive && !isHovered && (
                                <text
                                    x={spot.x}
                                    y={spot.labelPos === 'top' ? spot.y - 16 : spot.y + 20}
                                    fill="#4b5563"
                                    fontSize="8"
                                    fontWeight="700"
                                    textAnchor="middle"
                                    style={{
                                        pointerEvents: 'none',
                                        textShadow: '0 1px 3px rgba(255,255,255,0.95)',
                                    }}
                                >
                                    {spot.shortName}
                                </text>
                            )}
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
