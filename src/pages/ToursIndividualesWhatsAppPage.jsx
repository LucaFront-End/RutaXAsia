import ToursIndividualesPage from './ToursIndividualesPage'

/**
 * ToursIndividualesWhatsAppPage
 * Duplicated / dedicated page for Tours Individuales en Japón with WhatsApp-only booking flow.
 * No online checkout modal — all actions send dynamic quotation & custom tour links to WhatsApp.
 */
export default function ToursIndividualesWhatsAppPage() {
    return <ToursIndividualesPage whatsappOnly={true} />
}
