import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchCityLanding } from '../lib/wixClient'
import Home from './Home'

/**
 * CityLanding — Dynamic clone of the Home page that overrides SEO + WhatsApp
 * based on CMS data from "LandingsdeCiudad" collection.
 *
 * URL pattern: /viajes-japon-desde-guadalajara (slug from CMS)
 *
 * CMS fields used:
 * - tituloDePagina       → page heading
 * - excerptDePagina      → page excerpt/subtitle
 * - ciudad               → city name
 * - slug                 → URL slug
 * - whatsappPersonalizado → custom WhatsApp link
 * - tituloDeSeo          → SEO <title>
 * - metadescripcion      → SEO <meta description>
 */
export default function CityLanding() {
    const { citySlug } = useParams()
    const [landing, setLanding] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        let cancelled = false

        fetchCityLanding(citySlug).then(data => {
            if (cancelled) return
            if (!data) {
                setNotFound(true)
            } else {
                setLanding(data)
            }
            setLoading(false)
        })

        return () => { cancelled = true }
    }, [citySlug])

    // While loading, show the normal Home page (instant UX)
    if (loading) {
        return <Home />
    }

    // Slug doesn't match any CMS landing → redirect to home
    if (notFound) {
        return <Navigate to="/" replace />
    }

    // Render Home with SEO overrides
    return (
        <>
            <Helmet>
                <title>{landing.tituloDeSeo || landing.tituloDePagina || `Viajes a Japón desde ${landing.ciudad} | RutaXAsia`}</title>
                <meta name="description" content={landing.metadescripcion || landing.excerptDePagina || `RutaXAsia, la agencia #1 de viajes a Japón desde ${landing.ciudad}. Tours a Japón y Corea del Sur con los mejores precios.`} />
                <link rel="canonical" href={`https://rutaxasia.com/${landing.slug}`} />
            </Helmet>
            <Home
                cityOverride={{
                    city: landing.ciudad,
                    title: landing.tituloDePagina,
                    excerpt: landing.excerptDePagina,
                    whatsapp: landing.whatsappPersonalizado,
                }}
            />
        </>
    )
}
