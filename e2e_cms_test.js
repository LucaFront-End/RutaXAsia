import { parseCmsDate, syncSeasonsWithCms, SEASONS_INFO, getSeasonForDate, isDateInSeason } from './src/utils/seasonDates.js'

async function runE2ETest() {
    console.log('=== E2E TEST: WIX CMS -> WEB SYNC VERIFICATION ===\n')

    console.log('1. Fetching live data from Wix CMS endpoint (/api/precios-categorias-dias)...')
    const res = await fetch('https://rutaxasia.com/api/precios-categorias-dias')
    if (!res.ok) {
        throw new Error(`Failed to fetch API: ${res.status} ${res.statusText}`)
    }
    const data = await res.json()
    const prices = data.prices || []
    console.log(`✓ Fetched ${prices.length} items from PreciosporCategoriasydias in Wix CMS.`)

    // Analyze seasons in CMS
    const seasonsFound = {}
    const categoriesFound = new Set()

    for (const p of prices) {
        const s = p.temporada
        const cat = p.categoria
        if (!seasonsFound[s]) {
            seasonsFound[s] = {
                count: 0,
                fechasDeInicio: p.fechasDeInicio,
                fechaEntre: p.fechaEntre,
                packages: []
            }
        }
        seasonsFound[s].count++
        categoriesFound.add(cat)
        seasonsFound[s].packages.push({
            titulo: p.tituloComercial,
            cat: p.categoria,
            duracion: p.diasYNochesCompletos,
            precio: p.precioText,
            precioNum: p.precioNum,
            inicio: p.fechasDeInicio,
            fin: p.fechaEntre,
        })
    }

    console.log('\n2. Seasons discovered in Wix CMS PreciosporCategoriasydias:')
    for (const [seasonName, info] of Object.entries(seasonsFound)) {
        console.log(`   • Temporada "${seasonName}": ${info.count} paquetes`)
        console.log(`     - fechasDeInicio CMS: "${info.fechasDeInicio}"`)
        console.log(`     - fechaEntre CMS: "${info.fechaEntre}"`)
    }

    console.log('\n3. Categories discovered in Wix CMS:')
    for (const cat of categoriesFound) {
        console.log(`   • Categoría: "${cat}"`)
    }

    console.log('\n4. Running syncSeasonsWithCms(prices)...')
    syncSeasonsWithCms(prices)

    console.log('   ✓ Kamakura synced:');
    console.log(`     - label: ${SEASONS_INFO.kamakura.label}`)
    console.log(`     - monthsText: ${SEASONS_INFO.kamakura.monthsText}`)
    console.log(`     - startDate: ${SEASONS_INFO.kamakura.startDate}`)
    console.log(`     - endDate: ${SEASONS_INFO.kamakura.endDate}`)

    console.log('   ✓ Sakura synced:');
    console.log(`     - label: ${SEASONS_INFO.sakura.label}`)
    console.log(`     - monthsText: ${SEASONS_INFO.sakura.monthsText}`)
    console.log(`     - startDate: ${SEASONS_INFO.sakura.startDate}`)
    console.log(`     - endDate: ${SEASONS_INFO.sakura.endDate}`)

    console.log('   ✓ Akari synced:');
    console.log(`     - label: ${SEASONS_INFO.akari.label}`)
    console.log(`     - monthsText: ${SEASONS_INFO.akari.monthsText}`)
    console.log(`     - startDate: ${SEASONS_INFO.akari.startDate}`)
    console.log(`     - endDate: ${SEASONS_INFO.akari.endDate}`)

    console.log('\n5. Testing Date Validation & Restrictions:')
    const testCases = [
        { date: '2026-09-15', expectedSeason: null, desc: 'Septiembre 2026 (antes de temporada)' },
        { date: '2026-10-10', expectedSeason: null, desc: '10 Octubre 2026 (antes de Kamakura)' },
        { date: '2026-10-16', expectedSeason: 'kamakura', desc: '16 Octubre 2026 (Primer día Kamakura)' },
        { date: '2026-11-20', expectedSeason: 'kamakura', desc: '20 Noviembre 2026 (Kamakura Otoño)' },
        { date: '2026-12-15', expectedSeason: 'invierno', desc: '15 Diciembre 2026 (Kamakura Invierno)' },
        { date: '2027-01-20', expectedSeason: 'invierno', desc: '20 Enero 2027 (Kamakura Invierno)' },
        { date: '2027-03-15', expectedSeason: 'invierno', desc: '15 Marzo 2027 (Último día Kamakura)' },
        { date: '2027-03-20', expectedSeason: 'sakura', desc: '20 Marzo 2027 (Sakura)' },
        { date: '2027-05-15', expectedSeason: 'akari', desc: '15 Mayo 2027 (Akari)' },
        { date: '2027-08-31', expectedSeason: 'akari', desc: '31 Agosto 2027 (Último día Akari)' },
        { date: '2027-09-01', expectedSeason: null, desc: '1 Septiembre 2027 (BLOQUEADO - Fuera de temporada)' },
        { date: '2027-09-15', expectedSeason: null, desc: '15 Septiembre 2027 (BLOQUEADO - Fuera de temporada)' },
        { date: '2027-10-01', expectedSeason: null, desc: '1 Octubre 2027 (BLOQUEADO - Fuera de temporada)' },
    ]

    let allPassed = true
    for (const tc of testCases) {
        const detected = getSeasonForDate(tc.date)
        const detectedKey = detected ? detected.key : null
        const pass = detectedKey === tc.expectedSeason
        if (!pass) allPassed = false
        console.log(`   [${pass ? 'PASS' : 'FAIL'}] ${tc.desc}: got ${detectedKey}, expected ${tc.expectedSeason}`)
    }

    if (allPassed) {
        console.log('\n>>> RESULT: 100% OF E2E DATA SYNC & RESTRICTION TESTS PASSED! <<<')
    } else {
        console.error('\n>>> ERROR: SOME TESTS FAILED <<<')
        process.exit(1)
    }
}

runE2ETest().catch(e => {
    console.error(e)
    process.exit(1)
})
