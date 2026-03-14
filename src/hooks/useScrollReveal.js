import { useEffect, useRef } from 'react'

/**
 * Scroll-triggered reveal animation hook.
 * Adds 'revealed' class when element enters viewport.
 * Usage: const ref = useScrollReveal(); <div ref={ref} className="reveal">
 */
export function useScrollReveal(threshold = 0.15) {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('revealed')
                    observer.unobserve(el)
                }
            },
            { threshold }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [threshold])

    return ref
}

/**
 * Hook for multiple elements — returns a callback ref.
 * Usage: <div ref={addRevealRef} className="reveal">
 */
export function useScrollRevealMulti(threshold = 0.12) {
    const refs = useRef([])
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed')
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold }
        )

        refs.current.forEach(el => { if (el) observer.observe(el) })
        return () => observer.disconnect()
    }, [threshold])

    const addRef = (el) => {
        if (el && !refs.current.includes(el)) {
            refs.current.push(el)
        }
    }

    return addRef
}
