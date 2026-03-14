import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'
import Home from './pages/Home'
import TourDetail from './pages/TourDetail'
import AboutUs from './pages/AboutUs'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<Home />} />
                        <Route path="tours/:slug" element={<TourDetail />} />
                        <Route path="nosotros" element={<AboutUs />} />
                        <Route path="faq" element={<FAQ />} />
                        <Route path="contacto" element={<Contact />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    </StrictMode>,
)

