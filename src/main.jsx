import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'
import Home from './pages/Home'
import TourDetail from './pages/TourDetail'
import TourDetailSakuraV2 from './pages/TourDetailSakuraV2'
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
import JaponALaCartaPage from './pages/JaponALaCartaPage'
import ViajesCorea from './pages/ViajesCorea'
import ViajesChina from './pages/ViajesChina'
import Zonas from './pages/Zonas'
import ToursIndividualesPage from './pages/ToursIndividualesPage'
import ToursIndividualesWhatsAppPage from './pages/ToursIndividualesWhatsAppPage'
import TourIndividualDetail from './pages/TourIndividualDetail'
import UserPortalPage from './pages/UserPortalPage'
import ComunidadComentarios from './pages/ComunidadComentarios'
import Portafolio from './pages/Portafolio'
import RegistroTurismo from './pages/RegistroTurismo'

import { TripProvider } from './context/TripContext'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HelmetProvider>
            <TripProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<App />}>
                        <Route index element={<Home />} />
                        <Route path="tours/sakura-2027-v2" element={<TourDetailSakuraV2 />} />
                        <Route path="tours/sakura-2027-preview" element={<TourDetailSakuraV2 />} />
                        <Route path="viajes/japon/sakura/completo-preview" element={<TourDetailSakuraV2 />} />
                        <Route path="tours/:slug" element={<TourDetail />} />
                        <Route path="tours-individuales" element={<ToursIndividualesPage />} />
                        <Route path="tour-individuales" element={<ToursIndividualesPage />} />
                        <Route path="tours-individuales-whatsapp" element={<ToursIndividualesWhatsAppPage />} />
                        <Route path="tours-individuales-wa" element={<ToursIndividualesWhatsAppPage />} />
                        <Route path="tours-whatsapp" element={<ToursIndividualesWhatsAppPage />} />
                        <Route path="tours-wa" element={<ToursIndividualesWhatsAppPage />} />
                        <Route path="tours-individuales/:slug" element={<TourIndividualDetail />} />
                        <Route path="tour-individuales/:slug" element={<TourIndividualDetail />} />
                        <Route path="tours-individual/:slug" element={<TourIndividualDetail />} />
                        <Route path="tour-individual/:slug" element={<TourIndividualDetail />} />
                        <Route path="tour-individual" element={<TourIndividualDetail />} />
                        <Route path="portal-viajero" element={<UserPortalPage />} />
                        <Route path="mi-cuenta" element={<UserPortalPage />} />
                        <Route path="nosotros" element={<AboutUs />} />
                        <Route path="nosotros/portafolio" element={<Portafolio />} />
                        <Route path="portafolio" element={<Portafolio />} />
                        <Route path="nosotros/registro-nacional-turismo" element={<RegistroTurismo />} />
                        <Route path="registro-nacional-turismo" element={<RegistroTurismo />} />
                        <Route path="legalidad" element={<RegistroTurismo />} />
                        <Route path="comunidad/comentarios" element={<ComunidadComentarios />} />
                        <Route path="testimonios" element={<ComunidadComentarios />} />
                        <Route path="reseñas" element={<ComunidadComentarios />} />
                        <Route path="faq" element={<FAQ />} />
                        <Route path="contacto" element={<Contact />} />
                        <Route path="blog" element={<Blog />} />
                        <Route path="blog/:slug" element={<BlogPost />} />
                        <Route path="aviso-de-privacidad" element={<AvisoPrivacidad />} />
                        <Route path="terminos-y-condiciones" element={<TerminosCondiciones />} />
                        <Route path="viajes" element={<Viajes />} />
                        <Route path="viajes/japon" element={<ViajesJapon />} />
                        <Route path="tours/japon" element={<ViajesJapon />} />

                        {/* Temporadas Landings (Formato Corea) */}
                        <Route path="temporadas/:temporada" element={<JaponTemporada />} />
                        <Route path="temporada/:temporada" element={<JaponTemporada />} />
                        <Route path="viajes/temporada/:temporada" element={<JaponTemporada />} />
                        <Route path="viajes/temporadas/:temporada" element={<JaponTemporada />} />
                        <Route path="viajes/japon/temporada/:temporada" element={<JaponTemporada />} />
                        <Route path="viajes/japon/:temporada" element={<JaponTemporada />} />
                        <Route path="viajes/primavera" element={<JaponTemporada />} />
                        <Route path="viajes/verano" element={<JaponTemporada />} />
                        <Route path="viajes/otono" element={<JaponTemporada />} />
                        <Route path="viajes/invierno" element={<JaponTemporada />} />

                        {/* Japón a la Carta (Interactive Builder & 4 Estilos) */}
                        <Route path="japon-a-la-carta" element={<JaponALaCartaPage />} />
                        <Route path="viajes/a-la-carta" element={<JaponALaCartaPage />} />
                        <Route path="viajes/japon/a-la-carta" element={<JaponALaCartaPage />} />
                        <Route path="a-la-carta" element={<JaponALaCartaPage />} />
                        <Route path="viajes/japon/:temporada/:experiencia" element={<JaponExperiencia />} />
                        <Route path="japon-a-la-carta/:temporada/:experiencia" element={<JaponExperiencia />} />
                        <Route path="viajes/corea" element={<ViajesCorea />} />
                        <Route path="viajes/china" element={<ViajesChina />} />
                        <Route path="zonas" element={<Zonas />} />
                        <Route path=":citySlug" element={<CityLanding />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </TripProvider>
    </HelmetProvider>
</StrictMode>,
)
