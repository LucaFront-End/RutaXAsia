import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton'
import DiscountPopup from './components/DiscountPopup/DiscountPopup'
import './pages/pages.css'

function App() {
    const location = useLocation()

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = parseInt(entry.target.dataset.delay || '0', 10)
                        setTimeout(() => entry.target.classList.add('animated'), delay)
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.15 }
        )

        // Wait a split second to make sure the route transitions and DOM changes are rendered
        const timer = setTimeout(() => {
            document.querySelectorAll('[data-animate]').forEach((el) => {
                // If already animated, don't observe again
                if (!el.classList.contains('animated')) {
                    observer.observe(el)
                }
            })
        }, 100)

        return () => {
            clearTimeout(timer)
            observer.disconnect()
        }
    }, [location.pathname])

    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
            <WhatsAppButton />
            <DiscountPopup />
        </>
    )
}

export default App
