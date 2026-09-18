import React, { useState } from 'react'

/* ===================================================================
   TokyoBarriosSvgMap — Clean, modern, minimalist vector SVG map.
   Matches the exact aesthetic of the other tours (Image 2):
     - Cream background (#faf5f0)
     - Single elegant geometric polygon outline (#dc2626, opacity 0.4, fill 0.03)
     - Clean red route line connecting numbered circular markers
     - Geographically accurate hotspots for the 10 days
     - Zero visual clutter, elegant & modern
   =================================================================== */

const TOKYO_HOTSPOTS = [
    { day: 1, x: 420, y: 150, title: 'Salida de México (Vuelo CDMX)' },
    { day: 2, x: 355, y: 205, title: 'Asakusa & Tokyo Skytree' },
    { day: 3, x: 235, y: 230, title: 'Harajuku & Shinjuku' },
    { day: 4, x: 260, y: 285, title: 'Ginza & Shibuya Crossing' },
    { day: 5, x: 95,  y: 310, title: 'Excursión Monte Fuji & Gotemba' },
    { day: 6, x: 235, y: 405, title: 'Excursión Kamakura & Yokohama' },
    { day: 7, x: 315, y: 185, title: 'Ueno, Ameyoko & Akihabara' },
    { day: 8, x: 340, y: 275, title: 'Tsukiji Market & Kappabashi' },
    { day: 9, x: 275, y: 340, title: 'Daikanyama, Nakameguro & Ebisu' },
    { day: 10, x: 440, y: 195, title: 'Regreso a Ciudad de México' },
]

export default function TokyoBarriosSvgMap({ chapters = [], activeCity = 0, onCityClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null)

    // Build the SVG path connecting the 10 hotspots in order
    const routeD = TOKYO_HOTSPOTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    return (
        <div
            className="tokyo-svg-map-wrapper"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '550px',
                background: '#faf5f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                overflow: 'hidden',
            }}
        >
            <svg
                viewBox="0 0 500 500"
                style={{ width: '100%', height: '100%', maxHeight: '600px', display: 'block' }}
                preserveAspectRatio="xMidYMid meet"
                aria-label="Mapa de ruta de Tokio y Excursiones"
            >
                {/* 1. Base Region Silhouette Outline (Stylized Geometric Vector) */}
                <path
                    d="M 130 130
                       L 270 110
                       L 380 100
                       L 440 115
                       L 465 150
                       L 475 210
                       L 460 260
                       L 420 330
                       L 380 360
                       L 355 310
                       L 320 280
                       L 285 320
                       L 270 360
                       L 255 430
                       L 215 430
                       L 170 390
                       L 120 360
                       L 70 325
                       L 60 250
                       Z"
                    fill="rgba(220, 38, 38, 0.03)"
                    stroke="#dc2626"
                    strokeWidth="1.8"
                    strokeOpacity="0.4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* 2. Route Connecting Lines (Dashed + Solid exactly like ItineraryMap) */}
                <path
                    d={routeD}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeOpacity="0.2"
                    strokeDasharray="8 5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <path
                    d={routeD}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                    strokeOpacity="0.55"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* 3. Numbered Hotspots (1 to 10) */}
                {TOKYO_HOTSPOTS.map((spot, i) => {
                    const isActive = i === activeCity
                    const isHovered = i === hoveredIndex
                    const chapter = chapters[i] || {}
                    const titleText = chapter.city || spot.title

                    return (
                        <g
                            key={`spot-${spot.day}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onCityClick && onCityClick(i)}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Pulsing ring for active stop */}
                            {isActive && (
                                <>
                                    <circle
                                        cx={spot.x}
                                        cy={spot.y}
                                        r="22"
                                        fill="none"
                                        stroke="#dc2626"
                                        strokeWidth="2"
                                        strokeOpacity="0.35"
                                    >
                                        <animate
                                            attributeName="r"
                                            values="18;26;18"
                                            dur="2.2s"
                                            repeatCount="indefinite"
                                        />
                                        <animate
                                            attributeName="stroke-opacity"
                                            values="0.45;0.08;0.45"
                                            dur="2.2s"
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

                            {/* Base Circular Pin */}
                            <circle
                                cx={spot.x}
                                cy={spot.y}
                                r={isActive ? 18 : isHovered ? 16 : 14}
                                fill={isActive ? '#dc2626' : isHovered ? '#dc2626' : '#ffffff'}
                                stroke={isActive ? '#ffffff' : '#dc2626'}
                                strokeWidth={isActive ? 2.5 : 2.5}
                                style={{
                                    transition: 'all 0.25s ease',
                                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.14))',
                                }}
                            />

                            {/* Number inside Circle */}
                            <text
                                x={spot.x}
                                y={spot.y + 0.5}
                                fill={isActive || isHovered ? '#ffffff' : '#dc2626'}
                                fontSize={isActive ? '12.5' : '11'}
                                fontWeight="800"
                                textAnchor="middle"
                                dominantBaseline="central"
                                style={{ pointerEvents: 'none', transition: 'all 0.25s ease' }}
                            >
                                {spot.day}
                            </text>

                            {/* Tooltip Pill (Active or Hovered) */}
                            {(isActive || isHovered) && (
                                <g
                                    transform={`translate(${spot.x}, ${spot.y - 24})`}
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <rect
                                        x="-70"
                                        y="-12"
                                        width="140"
                                        height="24"
                                        rx="12"
                                        fill={isActive ? '#dc2626' : '#ffffff'}
                                        stroke={isActive ? '#ffffff' : 'rgba(0,0,0,0.12)'}
                                        strokeWidth="1.2"
                                        style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.16))' }}
                                    />
                                    <text
                                        x="0"
                                        y="4"
                                        fill={isActive ? '#ffffff' : '#111827'}
                                        fontSize="9.5"
                                        fontWeight="750"
                                        textAnchor="middle"
                                    >
                                        {titleText.length > 22 ? `${titleText.slice(0, 20)}…` : titleText}
                                    </text>
                                </g>
                            )}
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
