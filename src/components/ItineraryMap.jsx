import { useEffect, useMemo } from 'react'
import { MapContainer, GeoJSON, Polyline, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCityCoords } from '../data/cityCoords'

/* =========================================================
   ItineraryMap — Split layout: Map (left) + Detail (right)
   Cream bg, red outlines, DivIcon markers for easy clicking,
   hover effects, detail panel with full itinerary info.
   Uses centralized cityCoords.js for 70+ city positions.
   ========================================================= */

const JAPAN_GEO = {"type":"FeatureCollection","features":[{"type":"Feature","id":"JPN","properties":{"name":"Japan"},"geometry":{"type":"MultiPolygon","coordinates":[[[[134.638428,34.149234],[134.766379,33.806335],[134.203416,33.201178],[133.79295,33.521985],[133.280268,33.28957],[133.014858,32.704567],[132.363115,32.989382],[132.371176,33.463642],[132.924373,34.060299],[133.492968,33.944621],[133.904106,34.364931],[134.638428,34.149234]]],[[[140.976388,37.142074],[140.59977,36.343983],[140.774074,35.842877],[140.253279,35.138114],[138.975528,34.6676],[137.217599,34.606286],[135.792983,33.464805],[135.120983,33.849071],[135.079435,34.596545],[133.340316,34.375938],[132.156771,33.904933],[130.986145,33.885761],[132.000036,33.149992],[131.33279,31.450355],[130.686318,31.029579],[130.20242,31.418238],[130.447676,32.319475],[129.814692,32.61031],[129.408463,33.296056],[130.353935,33.604151],[130.878451,34.232743],[131.884229,34.749714],[132.617673,35.433393],[134.608301,35.731618],[135.677538,35.527134],[136.723831,37.304984],[137.390612,36.827391],[138.857602,37.827485],[139.426405,38.215962],[140.05479,39.438807],[139.883379,40.563312],[140.305783,41.195005],[141.368973,41.37856],[141.914263,39.991616],[141.884601,39.180865],[140.959489,38.174001],[140.976388,37.142074]]],[[[143.910162,44.1741],[144.613427,43.960883],[145.320825,44.384733],[145.543137,43.262088],[144.059662,42.988358],[143.18385,41.995215],[141.611491,42.678791],[141.067286,41.584594],[139.955106,41.569556],[139.817544,42.563759],[140.312087,43.333273],[141.380549,43.388825],[141.671952,44.772125],[141.967645,45.551483],[143.14287,44.510358],[143.910162,44.1741]]]]}},]}

const KOREA_GEO = {"type":"FeatureCollection","features":[{"type":"Feature","id":"KOR","properties":{"name":"South Korea"},"geometry":{"type":"Polygon","coordinates":[[[128.349716,38.612243],[129.21292,37.432392],[129.46045,36.784189],[129.468304,35.632141],[129.091377,35.082484],[128.18585,34.890377],[127.386519,34.475674],[126.485748,34.390046],[126.37392,34.93456],[126.559231,35.684541],[126.117398,36.725485],[126.860143,36.893924],[126.174759,37.749686],[126.237339,37.840378],[126.68372,37.804773],[127.073309,38.256115],[127.780035,38.304536],[128.205746,38.370397],[128.349716,38.612243]]]}}]}

const geoStyle = {
    color: '#dc2626',
    weight: 1.8,
    opacity: 0.4,
    fillColor: 'rgba(220, 38, 38, 0.03)',
    fillOpacity: 1,
}

function makeDotIcon(num, isActive) {
    const size = isActive ? 36 : 28
    return L.divIcon({
        className: 'td-dot-icon',
        html: `<div class="td-dot ${isActive ? 'td-dot--active' : ''}"><span>${num}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    })
}

function FitAndLock({ hasJapan, hasKorea }) {
    const map = useMap()
    useEffect(() => {
        // Force Leaflet to recalculate container size (fixes blank map on mobile)
        setTimeout(() => {
            map.invalidateSize()
        }, 200)

        let bounds
        if (hasJapan && hasKorea) {
            bounds = L.latLngBounds([[30, 125], [44, 146]])
        } else if (hasJapan) {
            bounds = L.latLngBounds([[33, 131], [37, 141]])
        } else {
            /* Korea — extend south to 32.5 to include Jeju Island */
            bounds = L.latLngBounds([[32.5, 125.5], [39, 130.5]])
        }
        map.fitBounds(bounds, { padding: [30, 30] })
        map.dragging.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
        if (map.tap) map.tap.disable()

        // Re-fit bounds after invalidateSize settles
        setTimeout(() => {
            map.invalidateSize()
            map.fitBounds(bounds, { padding: [30, 30] })
        }, 400)
    }, [map, hasJapan, hasKorea])
    return null
}

export default function ItineraryMap({ chapters, activeCity, onCityClick }) {
    const hasJapan = chapters.some(ch => ch.country === 'jp')
    const hasKorea = chapters.some(ch => ch.country === 'kr')

    const points = useMemo(() =>
        chapters.map((ch, i) => {
            const lookup = ch.cityKey || ch.city
            const coordData = getCityCoords(lookup)
            return {
                coords: [coordData.lat, coordData.lng],
                ...ch,
                index: i,
            }
        }),
        [chapters]
    )

    const routePositions = points.map(p => p.coords)
    const active = chapters[activeCity]

    return (
        <div className="td-itinerary-split">
            {/* LEFT: Map */}
            <div className="td-itinerary-map">
                <span className="td-map-route-label">Ruta del viaje</span>
                <MapContainer
                    center={[36, 136]}
                    zoom={5}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    attributionControl={false}
                    doubleClickZoom={false}
                    style={{ height: '100%', width: '100%', background: '#faf5f0' }}
                >
                    <FitAndLock hasJapan={hasJapan} hasKorea={hasKorea} />
                    {hasJapan && <GeoJSON data={JAPAN_GEO} style={geoStyle} />}
                    {hasKorea && <GeoJSON data={KOREA_GEO} style={geoStyle} />}

                    <Polyline
                        positions={routePositions}
                        pathOptions={{ color: '#dc2626', weight: 2, opacity: 0.12, dashArray: '8 5' }}
                    />
                    <Polyline
                        positions={routePositions}
                        pathOptions={{ color: '#dc2626', weight: 2.5, opacity: 0.45, lineCap: 'round', lineJoin: 'round' }}
                    />

                    {points.map((p, i) => {
                        const isActive = i === activeCity
                        return (
                            <Marker
                                key={`marker-${i}-${activeCity}`}
                                position={p.coords}
                                icon={makeDotIcon(i + 1, isActive)}
                                eventHandlers={{ click: () => onCityClick(i) }}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, isActive ? -20 : -16]}
                                    className={`td-city-tooltip ${isActive ? 'td-city-tooltip--active' : ''}`}
                                    permanent={isActive}
                                >
                                    {p.city}
                                </Tooltip>
                            </Marker>
                        )
                    })}
                </MapContainer>
            </div>

            {/* RIGHT: Detail panel */}
            <div className="td-itinerary-detail" key={activeCity}>
                <div className="td-detail-img">
                    <img src={active.image} alt={active.city} />
                    <div className="td-detail-img-overlay">
                        <span className="td-detail-step">
                            Parada {activeCity + 1} de {chapters.length}
                        </span>
                    </div>
                </div>

                <div className="td-detail-body">
                    <div className="td-detail-header">
                        <img
                            src={`https://flagcdn.com/w40/${active.country}.png`}
                            alt=""
                            className="td-detail-flag"
                        />
                        <div>
                            <span className="td-detail-days">{active.days}</span>
                            <h3 className="td-detail-city">{active.city}</h3>
                        </div>
                    </div>

                    <p className="td-detail-intro">{active.intro}</p>
                    <p className="td-detail-desc">{active.description}</p>

                    {active.highlights && active.highlights.length > 0 && (
                        <div className="td-detail-highlights">
                            <span className="td-detail-hl-label">Highlights</span>
                            <ul className="td-detail-hl-list">
                                {active.highlights.map((h, j) => (
                                    <li key={j}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="td-detail-nav">
                        <button
                            className="td-detail-nav-btn"
                            disabled={activeCity === 0}
                            onClick={() => onCityClick(activeCity - 1)}
                        >
                            ← Anterior
                        </button>
                        <button
                            className="td-detail-nav-btn td-detail-nav-btn--next"
                            disabled={activeCity === chapters.length - 1}
                            onClick={() => onCityClick(activeCity + 1)}
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
