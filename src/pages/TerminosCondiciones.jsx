import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import './LegalPage.css'

export default function TerminosCondiciones() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    return (
        <>
            <Helmet>
                <title>Términos y Condiciones | RutaXAsia</title>
                <meta name="description" content="Términos y condiciones de RutaXAsia. Conoce las condiciones de nuestros servicios de viajes a Japón y Corea." />
            </Helmet>

            <section className="legal-page">
                <div className="legal-container container">
                    <span className="legal-label">Documento Legal</span>
                    <h1 className="legal-title">Términos y Condiciones</h1>
                    <p className="legal-updated">Última actualización: Marzo 2026</p>

                    <div className="legal-content">
                        <h2>1. Generalidades</h2>
                        <p>Los presentes Términos y Condiciones regulan el uso del sitio web <strong>rutaxasia.com</strong> y los servicios de viajes ofrecidos por RutaXAsia. Al utilizar nuestro sitio web o contratar nuestros servicios, usted acepta estos términos en su totalidad.</p>

                        <h2>2. Servicios Ofrecidos</h2>
                        <p>RutaXAsia ofrece servicios de viajes grupales a Japón, Corea del Sur y destinos asiáticos, incluyendo pero no limitándose a:</p>
                        <ul>
                            <li>Paquetes de viaje todo incluido</li>
                            <li>Reservación de vuelos, hospedaje y transporte terrestre</li>
                            <li>Guías en español durante el viaje</li>
                            <li>Gestión de entradas a atracciones turísticas</li>
                            <li>Seguro de viajero internacional</li>
                        </ul>

                        <h2>3. Reservaciones y Pagos</h2>
                        <p>Para confirmar una reservación, el viajero deberá:</p>
                        <ul>
                            <li>Realizar el pago del anticipo indicado en la cotización del viaje</li>
                            <li>Completar el formulario de registro con sus datos personales y de pasaporte</li>
                            <li>Liquidar el saldo total antes de la fecha límite establecida</li>
                        </ul>
                        <p>Los precios publicados están sujetos a disponibilidad y pueden variar sin previo aviso. Los precios en MXN están sujetos al tipo de cambio vigente al momento del pago.</p>

                        <h2>4. Política de Cancelación</h2>
                        <ul>
                            <li><strong>Más de 90 días antes:</strong> Reembolso del 80% del anticipo</li>
                            <li><strong>60 a 90 días antes:</strong> Reembolso del 50% del anticipo</li>
                            <li><strong>Menos de 60 días:</strong> No se realizan reembolsos</li>
                        </ul>
                        <p>En caso de cancelación por fuerza mayor o situaciones extraordinarias, RutaXAsia evaluará cada caso de manera individual para ofrecer alternativas como cambio de fecha o crédito para futuros viajes.</p>

                        <h2>5. Responsabilidades del Viajero</h2>
                        <ul>
                            <li>Contar con pasaporte vigente con al menos 6 meses de validez</li>
                            <li>Obtener las visas necesarias según su nacionalidad</li>
                            <li>Cumplir con los requisitos sanitarios del destino</li>
                            <li>Respetar las normas culturales y legales del país visitado</li>
                            <li>Asistir puntualmente a las actividades programadas</li>
                        </ul>

                        <h2>6. Limitación de Responsabilidad</h2>
                        <p>RutaXAsia actúa como intermediario entre el viajero y los prestadores de servicios turísticos. No nos hacemos responsables por:</p>
                        <ul>
                            <li>Cancelaciones, retrasos o cambios por parte de aerolíneas o proveedores</li>
                            <li>Situaciones de fuerza mayor (desastres naturales, pandemias, conflictos)</li>
                            <li>Pérdida o daño de equipaje u objetos personales</li>
                            <li>Gastos médicos no cubiertos por el seguro de viaje</li>
                        </ul>

                        <h2>7. Propiedad Intelectual</h2>
                        <p>Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos, diseños y material audiovisual, es propiedad de RutaXAsia y está protegido por las leyes de propiedad intelectual aplicables.</p>

                        <h2>8. Modificaciones</h2>
                        <p>RutaXAsia se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán efectivos desde su publicación en este sitio web.</p>

                        <h2>9. Ley Aplicable y Jurisdicción</h2>
                        <p>Estos Términos y Condiciones se rigen por las leyes de México. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad de México.</p>

                        <h2>10. Contacto</h2>
                        <p>Para cualquier consulta sobre estos Términos y Condiciones:</p>
                        <ul>
                            <li>Email: <a href="mailto:reservas@rutaxasia.com">reservas@rutaxasia.com</a></li>
                            <li>Teléfono: <a href="tel:+525513610083">55 13 61 00 83</a></li>
                            <li>WhatsApp: <a href="https://wa.me/525513610083?text=SW-Hola%20quiero%20info%20sobre%20terminos%20y%20condiciones" target="_blank" rel="noopener noreferrer">55 13 61 00 83</a></li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    )
}
