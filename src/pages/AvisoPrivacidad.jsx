import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import './LegalPage.css'

export default function AvisoPrivacidad() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    return (
        <>
            <Helmet>
                <title>Aviso de Privacidad | RutaXAsia</title>
                <meta name="description" content="Aviso de privacidad de RutaXAsia. Conoce cómo protegemos y tratamos tus datos personales." />
            </Helmet>

            <section className="legal-page">
                <div className="legal-container container">
                    <span className="legal-label">Documento Legal</span>
                    <h1 className="legal-title">Aviso de Privacidad</h1>
                    <p className="legal-updated">Última actualización: Marzo 2026</p>

                    <div className="legal-content">
                        <h2>1. Responsable del Tratamiento de Datos Personales</h2>
                        <p>RutaXAsia, con domicilio en Río Lerma 232 Piso 23, Torre Diana, CP. 06500, Col. Cuauhtémoc, Ciudad de México, México (en adelante "RutaXAsia"), es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>

                        <h2>2. Datos Personales que Recabamos</h2>
                        <p>RutaXAsia podrá recabar los siguientes datos personales:</p>
                        <ul>
                            <li>Nombre completo</li>
                            <li>Correo electrónico</li>
                            <li>Número telefónico</li>
                            <li>Estado de la República de residencia</li>
                            <li>Datos de pasaporte (para gestión de viajes)</li>
                            <li>Información de pago (procesada por terceros autorizados)</li>
                        </ul>

                        <h2>3. Finalidades del Tratamiento</h2>
                        <p>Los datos personales recabados serán utilizados para:</p>
                        <ul>
                            <li>Gestionar y coordinar los servicios de viaje contratados</li>
                            <li>Enviar información sobre nuevos viajes, promociones y ofertas especiales</li>
                            <li>Atender solicitudes de cotización e información</li>
                            <li>Emitir facturas y comprobantes de pago</li>
                            <li>Dar seguimiento a la relación comercial</li>
                            <li>Cumplir con obligaciones legales y regulatorias</li>
                        </ul>

                        <h2>4. Transferencia de Datos</h2>
                        <p>RutaXAsia podrá transferir sus datos personales a terceros nacionales o internacionales, incluyendo aerolíneas, hoteles, operadores turísticos y agencias de seguros, únicamente con la finalidad de prestar los servicios de viaje contratados.</p>

                        <h2>5. Medios para Ejercer Derechos ARCO</h2>
                        <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (Derechos ARCO). Para ejercer estos derechos, puede enviar su solicitud al correo electrónico: <strong>reservas@rutaxasia.com</strong></p>

                        <h2>6. Uso de Cookies y Tecnologías de Rastreo</h2>
                        <p>Nuestro sitio web utiliza cookies y tecnologías similares para mejorar su experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido. Usted puede desactivar las cookies a través de la configuración de su navegador.</p>

                        <h2>7. Cambios al Aviso de Privacidad</h2>
                        <p>RutaXAsia se reserva el derecho de modificar el presente Aviso de Privacidad en cualquier momento. Cualquier cambio será publicado en esta página web.</p>

                        <h2>8. Contacto</h2>
                        <p>Para cualquier duda o aclaración sobre este Aviso de Privacidad, puede contactarnos en:</p>
                        <ul>
                            <li>Email: <a href="mailto:reservas@rutaxasia.com">reservas@rutaxasia.com</a></li>
                            <li>Teléfono: <a href="tel:+525513610083">55 13 61 00 83</a></li>
                            <li>Dirección: Río Lerma 232 Piso 23, Torre Diana, Col. Cuauhtémoc, CDMX</li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    )
}
