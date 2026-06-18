import { useState, useEffect } from 'react'
import { fetchAllLandings } from '../lib/wixClient'

/**
 * useLandings — Hook to fetch all published landings from Wix CMS.
 * 
 * Returns { landings, loading, error }
 * Used by: Zonas page, Footer, and any component needing the landing list.
 * 
 * Data is 100% dynamic — if a landing is created/deleted in Wix CMS,
 * it will appear/disappear on next page load.
 */
export default function useLandings() {
    const [landings, setLandings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false

        fetchAllLandings()
            .then(data => {
                if (!cancelled) {
                    setLandings(data)
                    setLoading(false)
                }
            })
            .catch(err => {
                if (!cancelled) {
                    setError(err.message)
                    setLoading(false)
                }
            })

        return () => { cancelled = true }
    }, [])

    return { landings, loading, error }
}
