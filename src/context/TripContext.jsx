import { createContext, useContext, useState, useEffect } from 'react'
import { fetchPreciosCategoriasDias } from '../lib/wixClient'
import { syncSeasonsWithCms, SEASONS_INFO } from '../utils/seasonDates'

const TripContext = createContext()

const DEFAULT_TRIP_SEARCH = {
    destino: 'japon',
    dateMode: 'exact',
    startDate: '2026-10-20',
    endDate: '2026-10-29',
    selectedMonth: 'Octubre 2026',
    adults: 2,
    children: 0,
}

export function TripProvider({ children }) {
    const [tripSearch, setTripSearch] = useState(() => {
        try {
            const saved = sessionStorage.getItem('rutaxasia_trip_search')
            if (saved) {
                const parsed = JSON.parse(saved)
                // If saved date is prior to Oct 16 2026 or in Sep 2027, clamp to 2026-10-20
                if (parsed.startDate && (parsed.startDate < '2026-10-16' || parsed.startDate > '2027-08-31')) {
                    parsed.startDate = '2026-10-20'
                    parsed.endDate = '2026-10-29'
                }
                return parsed
            }
            return DEFAULT_TRIP_SEARCH
        } catch {
            return DEFAULT_TRIP_SEARCH
        }
    })

    const [cmsPrices, setCmsPrices] = useState([])
    const [seasonsInfo, setSeasonsInfo] = useState(SEASONS_INFO)

    // Synchronize seasons and pricing dynamically with Wix CMS PreciosporCategoriasydias
    useEffect(() => {
        let isMounted = true
        fetchPreciosCategoriasDias()
            .then(prices => {
                if (isMounted && Array.isArray(prices) && prices.length > 0) {
                    setCmsPrices(prices)
                    const updated = syncSeasonsWithCms(prices)
                    setSeasonsInfo({ ...updated })
                }
            })
            .catch(() => {})

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        try {
            sessionStorage.setItem('rutaxasia_trip_search', JSON.stringify(tripSearch))
        } catch (e) {
            console.error('Failed to save trip search to sessionStorage', e)
        }
    }, [tripSearch])

    const updateTripSearch = (fields) => {
        setTripSearch(prev => ({ ...prev, ...fields }))
    }

    return (
        <TripContext.Provider value={{ tripSearch, updateTripSearch, cmsPrices, seasonsInfo }}>
            {children}
        </TripContext.Provider>
    )
}

export function useTripSearch() {
    const context = useContext(TripContext)
    if (!context) {
        throw new Error('useTripSearch must be used within a TripProvider')
    }
    return context
}
