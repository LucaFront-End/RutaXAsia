import { createContext, useContext, useState, useEffect } from 'react'

const TripContext = createContext()

const DEFAULT_TRIP_SEARCH = {
    destino: 'japon',
    dateMode: 'exact',
    startDate: '2026-10-15',
    endDate: '2026-10-28',
    selectedMonth: 'Octubre 2026',
    adults: 2,
    children: 0,
}

export function TripProvider({ children }) {
    const [tripSearch, setTripSearch] = useState(() => {
        try {
            const saved = sessionStorage.getItem('rutaxasia_trip_search')
            return saved ? JSON.parse(saved) : DEFAULT_TRIP_SEARCH
        } catch {
            return DEFAULT_TRIP_SEARCH
        }
    })

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
        <TripContext.Provider value={{ tripSearch, updateTripSearch }}>
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
