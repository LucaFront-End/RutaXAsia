// Unit & Integration test for Date Restrictions & Colchón
import { checkDateRestrictions, formatDateForDisplay } from './src/utils/seasonDates.js'

let totalTests = 0
let passedTests = 0

function assert(condition, message) {
    totalTests++
    if (condition) {
        passedTests++
        console.log(`  ✅ PASS: ${message}`)
    } else {
        console.error(`  ❌ FAIL: ${message}`)
    }
}

console.log('=== TEST SUITE: CHECK DATE RESTRICTIONS ===\n')

// 1. Colchón 7 días para Japón Libre
console.log('1. Test: Japón Libre colchón (7 días)')
const today1 = new Date(2026, 8, 24) // 24 Septiembre 2026

// 4 días después (28 Sep 2026) -> RESTRICTED
const rLibre4d = checkDateRestrictions('2026-09-28', 'kamakura', 'libre', today1)
assert(rLibre4d.isRestricted === true, 'Libre con 4 días de anticipación está restringido')
assert(rLibre4d.type === 'lead_time', 'Tipo de restricción es lead_time')
assert(rLibre4d.daysRequired === 7, 'Requiere 7 días')
assert(rLibre4d.daysCurrent === 4, 'Días actuales calculados son 4')
assert(rLibre4d.whatsappUrl.includes('525657929121'), 'Enlace a WhatsApp incluye teléfono')
assert(rLibre4d.whatsappUrl.includes('28%20de%20Septiembre'), 'Enlace incluye la fecha elegida')

// 6 días después (30 Sep 2026) -> RESTRICTED
const rLibre6d = checkDateRestrictions('2026-09-30', 'kamakura', 'libre', today1)
assert(rLibre6d.isRestricted === true, 'Libre con 6 días de anticipación está restringido')

// 7 días después (1 Oct 2026) -> ALLOWED (cumple colchón)
const rLibre7d = checkDateRestrictions('2026-10-01', 'kamakura', 'libre', today1)
assert(rLibre7d.isRestricted === false, 'Libre con exactamente 7 días NO está restringido')

// 2. Colchón 20 días para Esencial y Completo
console.log('\n2. Test: Esencial y Completo colchón (20 días)')
// 10 días después (4 Oct 2026) para Esencial -> RESTRICTED
const rEsen10d = checkDateRestrictions('2026-10-04', 'kamakura', 'esencial', today1)
assert(rEsen10d.isRestricted === true, 'Esencial con 10 días está restringido')
assert(rEsen10d.daysRequired === 20, 'Requiere 20 días para Esencial')

// 19 días después (13 Oct 2026) para Completo -> RESTRICTED
const rComp19d = checkDateRestrictions('2026-10-13', 'kamakura', 'completo', today1)
assert(rComp19d.isRestricted === true, 'Completo con 19 días está restringido')
assert(rComp19d.daysRequired === 20, 'Requiere 20 días para Completo')

// 20 días después (14 Oct 2026) para Completo -> ALLOWED
const rComp20d = checkDateRestrictions('2026-10-14', 'kamakura', 'completo', today1)
assert(rComp20d.isRestricted === false, 'Completo con 20 días NO está restringido')

// Akari también respeta colchón (20 días para Esencial)
const todayAkari = new Date(2027, 3, 20) // 20 Abril 2027
const rAkari5d = checkDateRestrictions('2027-04-25', 'akari', 'esencial', todayAkari)
assert(rAkari5d.isRestricted === true, 'Akari con 5 días está restringido')

// 3. Sakura Cutoff: Esencial / Completo límite 15 de Enero
console.log('\n3. Test: Sakura Esencial / Completo fecha límite 15 de Enero')
const sakuraTarget = '2027-03-25'

// Antes del 15 Ene (ej. 10 Ene 2027) -> NO es sakura_deadline
const todayBeforeJan15 = new Date(2027, 0, 10)
const rSakuraBeforeJan15 = checkDateRestrictions(sakuraTarget, 'sakura', 'esencial', todayBeforeJan15)
assert(rSakuraBeforeJan15.isRestricted === false, 'Sakura Esencial antes del 15 Ene está permitido')

// Después del 15 Ene (ej. 16 Ene 2027) -> RESTRICTED por sakura_deadline
const todayAfterJan15 = new Date(2027, 0, 16)
const rSakuraAfterJan15 = checkDateRestrictions(sakuraTarget, 'sakura', 'esencial', todayAfterJan15)
assert(rSakuraAfterJan15.isRestricted === true, 'Sakura Esencial después del 15 Ene está restringido')
assert(rSakuraAfterJan15.type === 'sakura_deadline', 'Tipo es sakura_deadline')
assert(rSakuraAfterJan15.title.includes('15 de Enero'), 'Título menciona 15 de Enero')
assert(rSakuraAfterJan15.whatsappUrl.includes('15%20de%20Enero'), 'WhatsApp menciona fecha límite 15 de Enero')

// 4. Sakura Cutoff: Libre límite 15 de Febrero
console.log('\n4. Test: Sakura Libre fecha límite 15 de Febrero')
// El 20 Ene 2027 -> Sakura Libre sigue ABIERTO (límite es 15 Feb)
const rSakuraLibreJan20 = checkDateRestrictions(sakuraTarget, 'sakura', 'libre', todayAfterJan15)
assert(rSakuraLibreJan20.isRestricted === false, 'Sakura Libre el 16 Ene sigue abierto')

// El 14 Feb 2027 -> Sakura Libre sigue ABIERTO
const todayFeb14 = new Date(2027, 1, 14)
const rSakuraLibreFeb14 = checkDateRestrictions(sakuraTarget, 'sakura', 'libre', todayFeb14)
assert(rSakuraLibreFeb14.isRestricted === false, 'Sakura Libre el 14 Feb sigue abierto')

// El 16 Feb 2027 -> Sakura Libre RESTRICTED por sakura_deadline
const todayFeb16 = new Date(2027, 1, 16)
const rSakuraLibreFeb16 = checkDateRestrictions(sakuraTarget, 'sakura', 'libre', todayFeb16)
assert(rSakuraLibreFeb16.isRestricted === true, 'Sakura Libre el 16 Feb está restringido')
assert(rSakuraLibreFeb16.type === 'sakura_deadline', 'Tipo es sakura_deadline')
assert(rSakuraLibreFeb16.title.includes('15 de Febrero'), 'Título menciona 15 de Febrero')
assert(rSakuraLibreFeb16.whatsappUrl.includes('15%20de%20Febrero'), 'WhatsApp menciona fecha límite 15 de Febrero')

console.log(`\n========================================`)
console.log(`RESULTADO FINAL: ${passedTests}/${totalTests} pruebas pasadas con éxito.`)
console.log(`========================================`)

if (passedTests !== totalTests) {
    process.exit(1)
}
