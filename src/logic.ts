// Reference numbers. Tested rates and pallet patterns: the PURATOS sheet in the brief.
// Payload: Tech-Con's presentation (25 kg, gripper included in the total load).
export const REF = {
  sarcinaKg: 25,
  kgTestatMin: 5,
  kgTestatMax: 13,
  ritm5: 8.6,
  ritm13: 7.4,
  galetiPePalet: { 5: 100, 13: 44 } as Record<number, number>,
  minuteSchimb: 480,
  zileAn: 250, // assumption shown to the user
}

export type DateLinie = { kg: number; galetiSchimb: number; ritm: number; schimburi: number; maner: boolean }
export type Camp = keyof DateLinie
export type Nivel = 'da' | 'evaluare' | 'nu'

export type Rezultat = {
  nivel: Nivel
  motive: string[]
  ritmTestat: number
  toneSchimb: number
  toneAn: number
  ridicariAn: number
  paletiSchimb: number | null
  minutePalet: number | null
}

export type Eroare = { erori: string[]; campuri: Partial<Record<Camp, string>>; nivel?: undefined }

// Numbers inside messages use Romanian formatting (7,4 not 7.4).
export const ro = (n: number, zecimale = 1) => n.toLocaleString('ro-RO', { maximumFractionDigits: zecimale })

// Tested rate for a given bucket weight; between 5 and 13 kg it is a straight line, orientative only.
export function ritmTestat(kg: number) {
  if (kg <= REF.kgTestatMin) return REF.ritm5
  if (kg >= REF.kgTestatMax) return REF.ritm13
  const t = (kg - REF.kgTestatMin) / (REF.kgTestatMax - REF.kgTestatMin)
  return REF.ritm5 + t * (REF.ritm13 - REF.ritm5)
}

export function evalueaza({ kg, galetiSchimb, ritm, schimburi, maner }: DateLinie): Rezultat | Eroare {
  const erori: string[] = []
  const campuri: Partial<Record<Camp, string>> = {}
  const eroare = (text: string, ...c: Camp[]) => { erori.push(text); for (const k of c) campuri[k] = text }

  if (!(kg > 0)) eroare('Introduceți greutatea unui ambalaj plin, în kilograme (mai mare decât 0).', 'kg')
  if (!(galetiSchimb > 0)) eroare('Introduceți câte ambalaje produceți într-un schimb.', 'galetiSchimb')
  if (!(ritm > 0)) eroare('Introduceți ritmul maxim al liniei, în ambalaje pe minut.', 'ritm')
  if (![1, 2, 3].includes(schimburi)) eroare('Alegeți numărul de schimburi pe zi.', 'schimburi')
  if (!erori.length && galetiSchimb > ritm * REF.minuteSchimb) {
    const max = Math.floor(ritm * REF.minuteSchimb)
    eroare(`Cifrele nu se potrivesc: la un ritm de ${ro(ritm)} pe minut, linia poate produce cel mult ${ro(max, 0)} ${max % 100 === 0 || max % 100 >= 20 ? 'de ' : ''}ambalaje într-un schimb de 8 ore, dar ați introdus ${ro(galetiSchimb, 0)}. Verificați una dintre valori.`, 'galetiSchimb', 'ritm')
  }
  if (erori.length) return { erori, campuri }

  const testat = ritmTestat(kg)
  const motive: string[] = []
  let nivel: Nivel = 'da'
  const cere = (text: string) => { if (nivel === 'da') nivel = 'evaluare'; motive.push(text) }

  // Only 5 and 13 kg were tested at PURATOS; anything between is our estimate and must say so.
  const exact = kg === REF.kgTestatMin || kg === REF.kgTestatMax
  const reper = exact
    ? `${ro(testat)} ambalaje/minut, testat la PURATOS pentru această greutate`
    : `aproximativ ${ro(testat)} ambalaje/minut, estimat de noi între ${ro(REF.ritm5)} (5 kg) și ${ro(REF.ritm13)} (13 kg), valorile testate la PURATOS`

  // >= because the gripper also counts against the payload.
  if (kg >= REF.sarcinaKg) {
    nivel = 'nu'
    motive.push(`Ambalajul de ${ro(kg)} kg atinge sau depășește sarcina utilă de ${REF.sarcinaKg} kg a robotului (valoare indicată în prezentarea Tech-Con), în care intră și dispozitivul de prindere.`)
  } else {
    if (kg < REF.kgTestatMin || kg > REF.kgTestatMax)
      cere(`Greutatea de ${ro(kg)} kg este în afara intervalului testat (${REF.kgTestatMin}–${REF.kgTestatMax} kg). Trebuie verificate prinderea și sarcina totală.`)
    if (!maner)
      cere('Dispozitivul de prindere și camera au fost testate pe recipiente cu mâner. Pentru altă marfă (cutii, saci, bidoane) prinderea și ritmul se validează la evaluarea tehnică.')
    if (ritm > testat)
      cere(`Linia dvs. ajunge la ${ro(ritm)} ambalaje/minut, peste ritmul robotului: ${reper}. O singură celulă poate să nu țină ritmul.`)
    if (nivel === 'da')
      motive.push(`Ritmul robotului: ${reper}. Este peste ritmul liniei dvs.; se confirmă la evaluarea tehnică. Debitul fabricii rămâne dat de umplere, nu de paletizare.`)
  }

  const toneSchimb = (kg * galetiSchimb) / 1000
  const pePalet = REF.galetiPePalet[kg] || null
  return {
    nivel,
    motive,
    ritmTestat: testat,
    toneSchimb,
    toneAn: toneSchimb * schimburi * REF.zileAn,
    ridicariAn: galetiSchimb * schimburi * REF.zileAn,
    paletiSchimb: pePalet ? galetiSchimb / pePalet : null,
    minutePalet: pePalet ? pePalet / ritm : null,
  }
}
