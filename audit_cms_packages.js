async function auditPackages() {
    const res = await fetch('https://rutaxasia.com/api/precios-categorias-dias')
    const { prices } = await res.json()

    console.log('=== AUDITORÍA COMPLETA DE PAQUETES CMS WIX ===\n')

    const seasons = ['Kamakura', 'Sakura', 'Akari']
    const categories = ['Japón Libre', 'Japón Esencial', 'Japón Completo']

    for (const season of seasons) {
        console.log(`\n================== ${season.toUpperCase()} ==================`)
        for (const cat of categories) {
            const matches = prices.filter(p => p.temporada === season && p.categoria === cat)
            console.log(`\n--- ${cat} (${matches.length} paquetes) ---`)
            for (const p of matches) {
                console.log(`  • ${p.tituloComercial || 'PASE'}: ${p.diasYNochesCompletos || p.dias} | Precio: ${p.precioText} ($${p.precioNum?.toLocaleString('es-MX')}) | Límite tours: ${p.limiteDeTours} | Fechas CMS: [${p.fechasDeInicio} al ${p.fechaEntre}]`)
            }
        }
    }
}

auditPackages().catch(console.error)
