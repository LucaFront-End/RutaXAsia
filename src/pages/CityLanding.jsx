import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchAllLandings } from '../lib/wixClient'
import LandingHome from './LandingHome'

/**
 * CityLanding — 100% dynamic landing page powered by Wix CMS.
 *
 * URL pattern: /:citySlug (e.g., /viajes-japon-desde-guadalajara)
 * Uses the server-side /api/landings endpoint to fetch data.
 *
 * Shows a loading skeleton while fetching — NO flash of default content.
 * All SEO tags (title, meta description, canonical) come from CMS.
 */
export default function CityLanding() {
    const { citySlug } = useParams()
    const [landing, setLanding] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        let cancelled = false

        fetchAllLandings().then(landings => {
            if (cancelled) return
            const found = landings.find(l => l.slug === citySlug)
            if (!found) {
                setNotFound(true)
            } else {
                setLanding(found)
            }
            setLoading(false)
        })

        return () => { cancelled = true }
    }, [citySlug])

    // Loading state — show a dark skeleton matching the hero aesthetic
    if (loading) {
        return (
            <div className="landing-loading">
                <div className="landing-loading-spinner" />
            </div>
        )
    }

    // Slug doesn't match any CMS landing → redirect to home
    if (notFound) {
        return <Navigate to="/" replace />
    }

    // 100% dynamic SEO from CMS
    const seoTitle = landing.seoTitle || landing.title || `Viajes a Japón desde ${landing.city} | RutaXAsia`
    const seoDesc = landing.seoDescription || landing.excerpt || `RutaXAsia, la agencia #1 de viajes a Japón desde ${landing.city}. Tours a Japón y Corea del Sur con los mejores precios.`

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <link rel="canonical" href={`https://rutaxasia.com/${landing.slug}`} />
                {/* Open Graph */}
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:url" content={`https://rutaxasia.com/${landing.slug}`} />
                <meta property="og:type" content="website" />
                {/* Twitter Card */}
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDesc} />
            </Helmet>
            <LandingHome
                landingData={{
                    title: landing.title,
                    excerpt: landing.excerpt,
                    city: landing.city,
                    whatsapp: landing.whatsapp,
                }}
            />
        </>
    )
}
