import { Outlet } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton'
import DiscountPopup from './components/DiscountPopup/DiscountPopup'
import './pages/pages.css'

function App() {
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
