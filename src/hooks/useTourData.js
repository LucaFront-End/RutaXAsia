import { useState, useEffect } from 'react'
import wixClient from '../lib/wixClient'

/* =========================================================
   useTourData — Fetch tour + stops from Wix CMS
   
   Collections expected in Wix:
     • "tours"      → one row per tour
     • "tourstops"  → one row per city/stop, linked to tour
   
   Falls back to static tourData.js if CMS is unavailable.
   ========================================================= */

const CMS_TOURS_COLLECTION = 'tours'
const CMS_STOPS_COLLECTION = 'tourstops'

/**
 * Parse a JSON string field safely (for arrays stored as text in CMS)
 */
function parseJsonField(value) {
    if (!value) return []
    if (Array.isArray(value)) return value
    try { return JSON.parse(value) } catch { return [] }
}

/**
 * Transform raw CMS tour data into the format our components expect
 */
function transformTour(raw, stops) {
    return {
        slug: raw.slug || '',
        title: raw.title || '',
        tagline: raw.tagline || '',
        heroImage: raw.heroImage || '',
        priceUSD: raw.priceUsd || raw.priceUSD || 0,
        priceMXN: raw.priceMxn || raw.priceMXN || 0,
        duration: raw.duration || '',
        cities: raw.cities || stops.length,
        groupSize: raw.groupSize || '',
        dates: raw.dates || '',
        available: raw.available !== false,
        includes: parseJsonField(raw.includes),
        notIncludes: parseJsonField(raw.notIncludes),
        faqs: parseJsonField(raw.faqs),
        seo: {
            title: raw.seoTitle || raw.title || '',
            description: raw.seoDescription || raw.tagline || '',
        },
        chapters: stops
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(stop => ({
                cityKey: stop.cityKey || '',
                city: stop.cityLabel || stop.cityKey || '',
                country: stop.country || 'jp',
                days: stop.days || '',
                image: stop.image || '',
                intro: stop.intro || '',
                description: stop.description || '',
                highlights: parseJsonField(stop.highlights),
            })),
    }
}

/**
 * Fetch a single tour by slug from Wix CMS
 */
export async function fetchTourBySlug(slug) {
    try {
        // Fetch tour
        const tourResult = await wixClient.items.queryDataItems({
            dataCollectionId: CMS_TOURS_COLLECTION,
        }).eq('slug', slug).find()

        if (!tourResult.items || tourResult.items.length === 0) {
            return null
        }

        const tourItem = tourResult.items[0].data
        const tourId = tourResult.items[0]._id

        // Fetch stops for this tour
        const stopsResult = await wixClient.items.queryDataItems({
            dataCollectionId: CMS_STOPS_COLLECTION,
        }).eq('tour', tourId).find()

        const stops = stopsResult.items?.map(item => item.data) || []

        return transformTour(tourItem, stops)
    } catch (error) {
        console.error('Error fetching tour from CMS:', error)
        return null
    }
}

/**
 * Fetch all available tours from Wix CMS (for listings/navigation)
 */
export async function fetchAllTours() {
    try {
        const result = await wixClient.items.queryDataItems({
            dataCollectionId: CMS_TOURS_COLLECTION,
        }).eq('available', true).find()

        return result.items?.map(item => ({
            slug: item.data.slug,
            title: item.data.title,
            heroImage: item.data.heroImage,
            priceUSD: item.data.priceUsd || item.data.priceUSD || 0,
            priceMXN: item.data.priceMxn || item.data.priceMXN || 0,
            duration: item.data.duration,
            dates: item.data.dates,
        })) || []
    } catch (error) {
        console.error('Error fetching tours from CMS:', error)
        return []
    }
}

/**
 * Hook: useTourData
 * Fetches tour from CMS, falls back to static data.
 * 
 * @param {string} slug - Tour slug (e.g., 'sakura-2026')
 * @param {object} staticData - Fallback from tourData.js
 */
export default function useTourData(slug, staticFallback) {
    const [tour, setTour] = useState(staticFallback || null)
    const [loading, setLoading] = useState(!staticFallback)
    const [source, setSource] = useState(staticFallback ? 'static' : 'loading')

    useEffect(() => {
        let cancelled = false

        async function load() {
            const cmsData = await fetchTourBySlug(slug)
            if (cancelled) return

            if (cmsData && cmsData.chapters.length > 0) {
                setTour(cmsData)
                setSource('cms')
            } else if (staticFallback) {
                setTour(staticFallback)
                setSource('static')
            }
            setLoading(false)
        }

        load()
        return () => { cancelled = true }
    }, [slug])

    return { tour, loading, source }
}
