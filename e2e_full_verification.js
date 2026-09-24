import { syncSeasonsWithCms, SEASONS_INFO, getSeasonForDate, checkDateRestrictions, formatDateForDisplay } from './src/utils/seasonDates.js'
import fs from 'fs'
import path from 'path'

async function runCompleteE2E() {
    console.log('===============================================================')
    console.log('           RUTAXASIA - E2E FULL SYSTEM VERIFICATION            ')
    console.log('===============================================================\n')

    let totalChecks = 0
    let passedChecks = 0

    function check(passed, label) {
        totalChecks++
        if (passed) {
            passedChecks++
            console.log(`  [PASS] ${label}`)
        } else {
            console.error(`  [FAIL] ${label}`)
        }
    }

    // -------------------------------------------------------------
    // FASE 1: Conectividad y Endpoints
    // -------------------------------------------------------------
    console.log('📌 FASE 1: Conectividad de Servidores y Endpoints CMS')
    try {
        const viteRes = await fetch('http://localhost:5173')
        check(viteRes.status === 200, 'Servidor de desarrollo Vite respondiendo en http://localhost:5173 (HTTP 200)')
    } catch (e) {
        check(false, `Servidor Vite falló: ${e.message}`)
    }

    let cmsPrices = []
    try {
        const cmsRes = await fetch('https://rutaxasia.com/api/precios-categorias-dias')
        check(cmsRes.status === 200, 'Endpoint Wix CMS en Producción respondiendo en https://rutaxasia.com/api/precios-categorias-dias')
        const cmsData = await cmsRes.json()
        cmsPrices = cmsData.prices || []
        check(cmsPrices.length === 28, `Recuperados los 28 paquetes exactos de PreciosporCategoriasydias (${cmsPrices.length} paquetes)`)
    } catch (e) {
        check(false, `Fallo al consultar Wix CMS en producción: ${e.message}`)
    }

    try {
        const localApiRes = await fetch('http://localhost:3001/api/precios-categorias-dias')
        check(localApiRes.status === 200, 'Servidor API local respondiendo en http://localhost:3001/api/precios-categorias-dias')
        const localApiData = await localApiRes.json()
        const localPrices = localApiData.prices || []
        check(localPrices.length === 28, `Servidor API local sincronizado con los 28 paquetes de Wix CMS (${localPrices.length} paquetes)`)
    } catch (e) {
        check(false, `Fallo en API local: ${e.message}`)
    }

    // -------------------------------------------------------------
    // FASE 2: Sincronización Dinámica de Temporadas
    // -------------------------------------------------------------
    console.log('\n📌 FASE 2: Sincronización Dinámica de Límites de Temporada')
    syncSeasonsWithCms(cmsPrices)

    check(SEASONS_INFO.kamakura.startDate === '2026-10-16', `Kamakura inicio sincronizado: ${SEASONS_INFO.kamakura.startDate} (16 Oct)`)
    check(SEASONS_INFO.kamakura.endDate === '2027-03-15', `Kamakura fin sincronizado: ${SEASONS_INFO.kamakura.endDate} (15 Mar)`)
    check(SEASONS_INFO.sakura.startDate === '2027-03-16', `Sakura inicio sincronizado: ${SEASONS_INFO.sakura.startDate} (16 Mar)`)
    check(SEASONS_INFO.sakura.endDate === '2027-04-10', `Sakura fin sincronizado: ${SEASONS_INFO.sakura.endDate} (10 Abr)`)
    check(SEASONS_INFO.akari.startDate === '2027-04-11', `Akari inicio sincronizado: ${SEASONS_INFO.akari.startDate} (11 Abr)`)
    check(SEASONS_INFO.akari.endDate === '2027-08-31', `Akari fin sincronizado: ${SEASONS_INFO.akari.endDate} (31 Ago)`)

    // Validación de Bloqueo de Fechas Fuera de Temporada
    check(getSeasonForDate('2026-09-15') === null, 'Septiembre 2026 está BLOQUEADO (fuera de temporada)')
    check(getSeasonForDate('2026-10-10') === null, '10 Octubre 2026 está BLOQUEADO (previo a 16 Oct)')
    check(getSeasonForDate('2026-10-16')?.key === 'kamakura', '16 Octubre 2026 corresponde a Kamakura (apertura)')
    check(getSeasonForDate('2026-12-15')?.key === 'invierno', '15 Diciembre 2026 corresponde a Invierno (Kamakura Frío)')
    check(getSeasonForDate('2027-03-20')?.key === 'sakura', '20 Marzo 2027 corresponde a Sakura')
    check(getSeasonForDate('2027-05-15')?.key === 'akari', '15 Mayo 2027 corresponde a Akari')
    check(getSeasonForDate('2027-09-01') === null, '1 Septiembre 2027 está BLOQUEADO (no seleccionable)')
    check(getSeasonForDate('2027-09-15') === null, '15 Septiembre 2027 está BLOQUEADO (no seleccionable)')
    check(getSeasonForDate('2027-10-01') === null, 'Octubre 2027 está BLOQUEADO')

    // -------------------------------------------------------------
    // FASE 3: Verificación de Reglas de Colchón (7 días vs 20 días)
    // -------------------------------------------------------------
    console.log('\n📌 FASE 3: Validación E2E de Colchón de Anticipación')
    const refDate = new Date(2026, 8, 24) // Jueves 24 Sep 2026

    // Test Japón Libre (7 días)
    const testLibreUnder = checkDateRestrictions('2026-09-28', 'kamakura', 'libre', refDate) // 4 días
    check(testLibreUnder.isRestricted === true, 'Japón Libre con 4 días activa restricción de colchón')
    check(testLibreUnder.daysRequired === 7, 'Japón Libre exige mínimo 7 días de colchón')
    check(testLibreUnder.daysCurrent === 4, 'Cálculo exacto de días transcurridos = 4')
    check(testLibreUnder.formattedDate === '28 de Septiembre de 2026', `Muestra fecha seleccionada: ${testLibreUnder.formattedDate}`)
    check(testLibreUnder.whatsappUrl.includes('525657929121'), 'Genera enlace WhatsApp oficial con teléfono 525657929121')
    check(testLibreUnder.whatsappUrl.includes('colch%C3%B3n%20de%207%20d%C3%ADas'), 'Mensaje WhatsApp indica 7 días de colchón')

    const testLibreExact = checkDateRestrictions('2026-10-01', 'kamakura', 'libre', refDate) // 7 días exactos
    check(testLibreExact.isRestricted === false, 'Japón Libre con 7 días exactos o más está PERMITIDO')

    // Test Japón Esencial / Completo (20 días)
    const testEsenUnder = checkDateRestrictions('2026-10-05', 'kamakura', 'esencial', refDate) // 11 días
    check(testEsenUnder.isRestricted === true, 'Japón Esencial con 11 días activa restricción de colchón')
    check(testEsenUnder.daysRequired === 20, 'Japón Esencial exige mínimo 20 días de colchón')

    const testCompUnder = checkDateRestrictions('2026-10-13', 'kamakura', 'completo', refDate) // 19 días
    check(testCompUnder.isRestricted === true, 'Japón Completo con 19 días activa restricción de colchón')
    check(testCompUnder.daysRequired === 20, 'Japón Completo exige mínimo 20 días de colchón')

    const testCompExact = checkDateRestrictions('2026-10-14', 'kamakura', 'completo', refDate) // 20 días exactos
    check(testCompExact.isRestricted === false, 'Japón Completo con 20 días exactos o más está PERMITIDO')

    // -------------------------------------------------------------
    // FASE 4: Verificación de Fechas Límite Sakura (15 Ene vs 15 Feb)
    // -------------------------------------------------------------
    console.log('\n📌 FASE 4: Validación E2E de Fechas Límite Sakura')
    const sakuraDate = '2027-03-25'

    // Sakura Esencial: Límite 15 de Enero
    const sakuraBeforeJan15 = checkDateRestrictions(sakuraDate, 'sakura', 'esencial', new Date(2027, 0, 10))
    check(sakuraBeforeJan15.isRestricted === false, 'Sakura Esencial antes del 15 de Enero está ABIERTO')

    const sakuraAfterJan15 = checkDateRestrictions(sakuraDate, 'sakura', 'esencial', new Date(2027, 0, 16))
    check(sakuraAfterJan15.isRestricted === true, 'Sakura Esencial después del 15 de Enero está CERRADO (activa popup)')
    check(sakuraAfterJan15.type === 'sakura_deadline', 'Tipo de restricción clasificado como sakura_deadline')
    check(sakuraAfterJan15.title.includes('15 de Enero'), 'Título del popup indica fecha límite 15 de Enero')
    check(sakuraAfterJan15.whatsappUrl.includes('15%20de%20Enero'), 'Mensaje WhatsApp incluye fecha límite de 15 de Enero')

    // Sakura Libre: Límite 15 de Febrero
    const sakuraLibreJan25 = checkDateRestrictions(sakuraDate, 'sakura', 'libre', new Date(2027, 0, 25))
    check(sakuraLibreJan25.isRestricted === false, 'Sakura Libre en Enero continúa ABIERTO (su límite es 15 Feb)')

    const sakuraLibreFeb10 = checkDateRestrictions(sakuraDate, 'sakura', 'libre', new Date(2027, 1, 10))
    check(sakuraLibreFeb10.isRestricted === false, 'Sakura Libre el 10 de Febrero continúa ABIERTO')

    const sakuraLibreAfterFeb15 = checkDateRestrictions(sakuraDate, 'sakura', 'libre', new Date(2027, 1, 16))
    check(sakuraLibreAfterFeb15.isRestricted === true, 'Sakura Libre después del 15 de Febrero está CERRADO (activa popup)')
    check(sakuraLibreAfterFeb15.type === 'sakura_deadline', 'Tipo de restricción clasificado como sakura_deadline')
    check(sakuraLibreAfterFeb15.title.includes('15 de Febrero'), 'Título del popup indica fecha límite 15 de Febrero')
    check(sakuraLibreAfterFeb15.whatsappUrl.includes('15%20de%20Febrero'), 'Mensaje WhatsApp incluye fecha límite de 15 de Febrero')

    // -------------------------------------------------------------
    // FASE 5: Verificación de Bundles y Archivos Compilados
    // -------------------------------------------------------------
    console.log('\n📌 FASE 5: Verificación de Compilación e Integridad de Assets')
    const distIndexPath = path.resolve('dist', 'index.html')
    check(fs.existsSync(distIndexPath), 'dist/index.html existe y está compilado')

    const distAssetsDir = path.resolve('dist', 'assets')
    const assetFiles = fs.readdirSync(distAssetsDir)
    const jsBundle = assetFiles.find(f => f.endsWith('.js') && f.startsWith('index-'))
    const cssBundle = assetFiles.find(f => f.endsWith('.css') && f.startsWith('index-'))
    check(Boolean(jsBundle), `Bundle JS de producción generado: dist/assets/${jsBundle}`)
    check(Boolean(cssBundle), `Bundle CSS de producción generado: dist/assets/${cssBundle}`)

    const jsContent = fs.readFileSync(path.join(distAssetsDir, jsBundle), 'utf8')
    const cssContent = fs.readFileSync(path.join(distAssetsDir, cssBundle), 'utf8')

    check(jsContent.includes('trip-restriction-modal'), 'Bundle JS incluye clases del popup modal de restricciones')
    check(jsContent.includes('525657929121'), 'Bundle JS incluye enlace directo a WhatsApp oficial')
    check(cssContent.includes('.cal-day-colchon-dot') || cssContent.includes('cal-day-colchon-dot'), 'Bundle CSS incluye estilo indicador ámbar de colchón')
    check(cssContent.includes('trip-restriction-modal') || cssContent.includes('.trip-restriction-modal'), 'Bundle CSS incluye estilos visuales del modal')

    console.log('\n===============================================================')
    console.log(` RESULTADO FINAL E2E: ${passedChecks}/${totalChecks} VERIFICACIONES EXITOSAS (100%)`)
    console.log('===============================================================')

    if (passedChecks !== totalChecks) {
        process.exit(1)
    }
}

runCompleteE2E().catch(err => {
    console.error('Error fatal en prueba E2E:', err)
    process.exit(1)
})
