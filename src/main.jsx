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
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import AvisoPrivacidad from './pages/AvisoPrivacidad'
import TerminosCondiciones from './pages/TerminosCondiciones'
import CityLanding from './pages/CityLanding'
import Viajes from './pages/Viajes'
import ViajesJapon from './pages/ViajesJapon'
import JaponTemporada from './pages/JaponTemporada'
import JaponExperiencia from './pages/JaponExperiencia'
import ViajesCorea from './pages/ViajesCorea'
import ViajesChina from './pages/ViajesChina'
import Zonas from './pages/Zonas'

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
                        <Route path="blog" element={<Blog />} />
                        <Route path="blog/:slug" element={<BlogPost />} />
                        <Route path="aviso-de-privacidad" element={<AvisoPrivacidad />} />
                        <Route path="terminos-y-condiciones" element={<TerminosCondiciones />} />
                        <Route path="viajes" element={<Viajes />} />
                        <Route path="viajes/japon" element={<ViajesJapon />} />
                        <Route path="viajes/japon/:temporada" element={<JaponTemporada />} />
                        <Route path="viajes/japon/:temporada/:experiencia" element={<JaponExperiencia />} />
                        <Route path="viajes/corea" element={<ViajesCorea />} />
                        <Route path="viajes/china" element={<ViajesChina />} />
                        <Route path="zonas" element={<Zonas />} />
                        <Route path=":citySlug" element={<CityLanding />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    </StrictMode>,
)
