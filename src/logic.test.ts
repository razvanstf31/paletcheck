// Run: npm test (node runs the TypeScript directly)
import assert from 'node:assert'
import { evalueaza, ritmTestat, type Eroare, type Rezultat } from './logic.ts'

const baza = { kg: 13, galetiSchimb: 400, ritm: 6, schimburi: 2, maner: true }
const ok = (d: typeof baza) => evalueaza(d) as Rezultat
const err = (d: typeof baza) => evalueaza(d) as Eroare

// normal case: the PURATOS-like line fits
let r = ok(baza)
assert.strictEqual(r.nivel, 'da')
assert.strictEqual(r.toneSchimb, 5.2)
assert.strictEqual(r.toneAn, 2600)
assert.strictEqual(r.ridicariAn, 200000)
assert.ok(Math.abs(r.paletiSchimb! - 400 / 44) < 1e-9)

// tested rates at both ends and in between
assert.strictEqual(ritmTestat(5), 8.6)
assert.strictEqual(ritmTestat(13), 7.4)
assert.ok(Math.abs(ritmTestat(9) - 8.0) < 1e-9)

// needs evaluation: faster line, no handle, untested weight
assert.strictEqual(ok({ ...baza, ritm: 9, galetiSchimb: 400 }).nivel, 'evaluare')
assert.strictEqual(ok({ ...baza, maner: false }).nivel, 'evaluare')
assert.strictEqual(ok({ ...baza, kg: 20 }).nivel, 'evaluare')
assert.strictEqual(ok({ ...baza, kg: 20 }).paletiSchimb, null)

// does not fit: heavier than the payload
assert.strictEqual(ok({ ...baza, kg: 40 }).nivel, 'nu')

// missing or wrong data gives errors, never a verdict
assert.strictEqual(err({ kg: NaN, galetiSchimb: NaN, ritm: NaN, schimburi: NaN, maner: true }).erori.length, 4)
assert.strictEqual(err({ ...baza, kg: -5 }).erori.length, 1)
const e = err({ ...baza, ritm: 1, galetiSchimb: 5000 })
assert.ok(e.erori[0].includes('480') && !e.nivel)
// the inconsistency marks both fields it involves
assert.deepStrictEqual(Object.keys(e.campuri), ['galetiSchimb', 'ritm'])
// numbers in messages use the Romanian decimal comma
assert.ok(ok({ ...baza, ritm: 7.5 }).motive[0].includes('7,5'))
// only 5 and 13 kg are "tested"; a weight in between is labelled as our estimate
assert.ok(ok(baza).motive[0].includes('testat la PURATOS pentru această greutate'))
assert.ok(ok({ ...baza, kg: 9 }).motive[0].includes('estimat de noi'))
// a bucket at the payload limit does not fit, because the gripper counts too
assert.strictEqual(ok({ ...baza, kg: 25 }).nivel, 'nu')

console.log('OK')
