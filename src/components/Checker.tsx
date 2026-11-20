import { useState, type FormEvent, type ReactNode } from 'react'
import { evalueaza, ro, type Camp, type DateLinie, type Eroare, type Nivel, type Rezultat } from '@/logic'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Reveal, scrollToId } from '@/components/common'
import { cn } from '@/lib/utils'

type Campuri = { kg: string; galeti: string; ritm: string; schimburi: string; maner: boolean }
type Rulare = { date: DateLinie; rez: Rezultat | Eroare }

const EX_BUN: Campuri = { kg: '13', galeti: '400', ritm: '6', schimburi: '2', maner: true }
const EX_GRESIT: Campuri = { kg: '13', galeti: '5000', ritm: '1', schimburi: '2', maner: true }

// "12,5" and "12.5" both mean 12.5; for whole counts "5.000" means 5000
const dec = (s: string) => (s.trim() === '' ? NaN : Number(s.trim().replace(',', '.')))
const int = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(/[\s.]/g, '').replace(',', '.')))
const toDate = (c: Campuri): DateLinie => ({
  kg: dec(c.kg), galetiSchimb: int(c.galeti), ritm: dec(c.ritm), schimburi: Number(c.schimburi) || NaN, maner: c.maner,
})
// Romanian: "400 de ambalaje", "13 ambalaje"
const de = (n: number) => (Number.isInteger(n) && (n % 100 === 0 ? n !== 0 : n % 100 >= 20) ? 'de ' : '')

export const VERDICT: Record<Nivel, { text: string; lead: string; cls: string }> = {
  da: { text: 'Se potrivește', lead: 'După cifrele de test, o celulă UR20 ar trebui să țină ritmul liniei dvs. Se confirmă la evaluarea tehnică.', cls: 'bg-ok-bg text-ok' },
  evaluare: { text: 'Necesită evaluare tehnică', lead: 'Pare posibil, dar unele date ies din ce s-a testat la PURATOS.', cls: 'bg-warn-bg text-warn' },
  nu: { text: 'Nu se potrivește', lead: 'O celulă UR20 nu este potrivită pentru această marfă.', cls: 'bg-bad-bg text-bad' },
}

export const DE_VERIFICAT = [
  'Forma, materialul și stabilitatea ambalajului; sarcina totală include dispozitivul de prindere.',
  'Spațiul și accesul la celulă.',
  'Schimbarea paleților și amplasarea separatoarelor rămân manuale.',
  'Evaluarea riscurilor, cerințele de igienă și procedurile de operare.',
  'Integrarea transportorului de alimentare.',
]

const btnBlue = 'pill bg-blue text-white hover:bg-blue-hover h-14 px-7'
const btnOutline = 'pill border border-line bg-white/0 px-5 text-sm font-medium text-ink hover:border-ink'

// a ledger value: the input is sized to its content so the unit sits right after the number
function Field(props: {
  id: string; label: string; unit?: string; value: string; onChange: (v: string) => void
  inputMode: 'decimal' | 'numeric'; error?: string; errId?: string; className?: string
}) {
  const { id, label, unit, value, onChange, inputMode, error, errId, className } = props
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="block text-[13px] leading-snug text-muted">
        {label}{unit && <span className="sr-only"> ({unit})</span>}
      </label>
      {/* the whole value row focuses the input, so the touch target is the full row, not just the digits */}
      <div onClick={() => document.getElementById(id)?.focus()} className={cn('mt-1.5 flex min-h-12 cursor-text items-baseline gap-1.5 border-b-2', error ? 'border-bad text-bad' : 'border-transparent')}>
        <input
          id={id} value={value} onChange={(e) => onChange(e.target.value)} inputMode={inputMode} autoComplete="off" enterKeyHint="done"
          aria-invalid={!!error} aria-describedby={error ? errId : undefined}
          style={{ width: `calc(${Math.max(value.length, 1)} * 0.6em + 4px)` }}
          className="value h-12 max-w-full bg-transparent text-current"
        />
        {unit && <span aria-hidden className={cn('text-sm', error ? 'text-bad' : 'text-muted')}>{unit}</span>}
      </div>
    </div>
  )
}

const ORDINE: Camp[] = ['kg', 'galetiSchimb', 'ritm', 'schimburi']

export function Checker({ children }: { children: ReactNode }) {
  const [c, setC] = useState<Campuri>(EX_BUN)
  const set = (k: keyof Campuri) => (v: string) => setC((x) => ({ ...x, [k]: v }))
  // live: the result follows every keystroke
  const date = toDate(c)
  const rez = evalueaza(date)
  const err = 'erori' in rez ? rez : null
  const campuri = err?.campuri ?? {}
  // one message can belong to two fields (the inconsistency); both point at the same message
  const errId = (k: Camp) => (err && campuri[k] ? `err-${err.erori.indexOf(campuri[k]!)}` : undefined)
  const ep = (k: Camp) => ({ error: campuri[k], errId: errId(k) })
  const anunt = err
    ? `Nu putem calcula încă. ${err.erori.join(' ')}`
    : `Verdict: ${VERDICT[(rez as Rezultat).nivel].text}. ${ro((rez as Rezultat).toneSchimb)} tone ridicate de mână pe schimb.`

  function verifica(e: FormEvent) {
    e.preventDefault()
    const prima = ORDINE.find((k) => campuri[k])
    if (prima) { document.getElementById(prima)?.focus(); return }
    scrollToId('rezultat')
    document.getElementById('rezultat')?.focus({ preventScroll: true })
  }
  function exemplu(x: Campuri) {
    setC(x)
    // on a phone the result sits under the bar: bring it into view
    requestAnimationFrame(() => {
      const el = document.getElementById('rezultat')
      if (el && el.getBoundingClientRect().top > innerHeight * 0.75) scrollToId('rezultat')
    })
  }

  return (
    <>
      <section id="verificare" aria-label="Verificați linia" className="relative z-10 -mt-10 lg:-mt-[72px]">
        <div className="wrap">
          <form noValidate onSubmit={verifica}
            className="grid grid-cols-2 gap-x-5 gap-y-5 rounded-[22px] bg-white p-5 shadow-[0_26px_60px_rgb(20_23_26/0.22)] md:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-center lg:gap-0 lg:px-9 lg:py-8">
            <Field id="kg" label="Greutatea unui ambalaj plin" unit="kg" inputMode="decimal" value={c.kg} onChange={set('kg')} {...ep('kg')} />
            <Field id="galetiSchimb" label="Ambalaje pe schimb" inputMode="numeric" value={c.galeti} onChange={set('galeti')} {...ep('galetiSchimb')} className="lg:border-l lg:border-line lg:pl-6" />
            <Field id="ritm" label="Ritmul maxim al liniei" unit="pe minut" inputMode="decimal" value={c.ritm} onChange={set('ritm')} {...ep('ritm')} className="lg:border-l lg:border-line lg:pl-6" />
            <div className="min-w-0 lg:border-l lg:border-line lg:pl-6">
              <label htmlFor="schimburi" className="block text-[13px] leading-snug text-muted">Schimburi pe zi</label>
              <div className={cn('relative mt-1.5 inline-flex items-baseline border-b-2', campuri.schimburi ? 'border-bad text-bad' : 'border-transparent')}>
                <select id="schimburi" value={c.schimburi} onChange={(e) => set('schimburi')(e.target.value)}
                  aria-invalid={!!campuri.schimburi} aria-describedby={errId('schimburi')}
                  className="value h-12 min-w-11 cursor-pointer appearance-none bg-transparent pr-7 text-current">
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </select>
                <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-1 size-3 -translate-y-1/2 text-muted">
                  <path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <button type="submit" className={cn(btnBlue, 'col-span-2 w-full md:col-span-4 lg:col-span-1 lg:ml-6 lg:w-auto')}>Verificați linia</button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" aria-pressed={c.maner} onClick={() => setC((x) => ({ ...x, maner: !x.maner }))}
              className={cn('pill border px-5 text-sm font-medium', c.maner ? 'border-ink bg-ink text-white' : 'border-line text-ink hover:border-ink')}>
              Marfă în găleți cu mâner
            </button>
            <button type="button" className={btnOutline} onClick={() => exemplu(EX_BUN)}>Exemplu: găleți de 13 kg</button>
            <button type="button" className={btnOutline} onClick={() => exemplu(EX_GRESIT)}>Exemplu cu date greșite</button>
          </div>
        </div>
      </section>

      <section aria-label="Rezultat" className="pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div id="rezultat" tabIndex={-1} className="wrap outline-none">
          <div aria-live="polite" className="sr-only">{anunt}</div>
          {err ? <Erori err={err} /> : <Result rez={rez as Rezultat} />}
        </div>
      </section>

      {children}
      <Request run={{ date, rez }} />
    </>
  )
}

function Erori({ err }: { err: Eroare }) {
  return (
    <div className="max-w-[44rem] rounded-[20px] bg-bad-bg p-6 text-bad lg:p-8">
      <h2 className="display text-[28px] font-semibold lg:text-[36px]">Verificați cifrele</h2>
      <ul className="mt-4 space-y-3">
        {err.erori.map((e, i) => <li key={e} id={`err-${i}`} className="border-t border-bad/25 pt-3">{e}</li>)}
      </ul>
    </div>
  )
}

const dp = (n: number) => (Number.isInteger(Math.round(n * 10) / 10) ? 0 : 1)

function Result({ rez }: { rez: Rezultat }) {
  const v = VERDICT[rez.nivel]
  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="display flex flex-wrap items-baseline gap-x-[0.22em] text-[72px] leading-[0.95] font-semibold sm:text-[104px] lg:text-[132px]">
            <NumberTicker value={rez.toneSchimb} decimalPlaces={dp(rez.toneSchimb)} />
            <span>tone</span>
          </p>
          <p className="mt-4 text-lg lg:text-xl">
            ridicate de mână în fiecare schimb. {ro(rez.toneAn)} {de(rez.toneAn)}tone pe an.
          </p>
          <p className="mt-2 text-sm text-muted">
            {ro(rez.ridicariAn, 0)} {de(rez.ridicariAn)}ridicări pe an, fiecare făcută azi de un om.{' '}
            {rez.paletiSchimb === null
              ? 'Modelul de paletizare se stabilește la evaluare.'
              : `${ro(rez.paletiSchimb)} ${de(Math.round(rez.paletiSchimb * 10) / 10)}paleți pe schimb.`}
          </p>
        </div>
        <div>
          <p className={cn('inline-flex rounded-full px-4 py-1.5 text-sm font-medium', v.cls)}>{v.text}</p>
          <p className="display mt-5 text-[22px] leading-[1.25] font-medium lg:text-[26px]">{v.lead}</p>
          <ul className="mt-4 space-y-2 text-muted">{rez.motive.map((m) => <li key={m}>{m}</li>)}</ul>
          <button type="button" onClick={() => scrollToId('cerere')} className="pill mt-7 h-14 bg-ink px-7 text-white hover:bg-ink/85">
            Solicitați evaluarea tehnică
          </button>
        </div>
      </div>

      <div className="mt-16 lg:mt-20">
        <h3 className="display text-[22px] font-medium">De verificat la evaluarea tehnică</h3>
        <ul className="mt-4 grid border-b border-line md:grid-cols-2 md:gap-x-12">
          {DE_VERIFICAT.map((t) => <li key={t} className="border-t border-line py-3.5 text-muted">{t}</li>)}
        </ul>
      </div>
    </>
  )
}

function Request({ run }: { run: Rulare }) {
  const [c, setC] = useState({ firma: '', rol: '', email: '' })
  const [err, setErr] = useState<Partial<Record<keyof typeof c, string>>>({})
  const [fisa, setFisa] = useState<null | { c: typeof c; run: Rulare; zi: string }>(null)
  const [anunt, setAnunt] = useState('')

  // shortcut: nothing is sent and nothing is stored, the sheet only appears on screen; add a backend endpoint (with consent and a retention rule) when Tech-Con wants to receive real requests
  function trimite(e: FormEvent) {
    e.preventDefault()
    const er: typeof err = {}
    if (!c.firma.trim()) er.firma = 'Scrieți numele firmei.'
    if (!c.rol.trim()) er.rol = 'Scrieți rolul dvs. în firmă.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) er.email = 'Scrieți o adresă de e-mail validă, de exemplu nume@firma.ro.'
    setErr(er)
    const prima = Object.keys(er)[0]
    if (prima) { setAnunt(`Cererea are ${Object.keys(er).length === 1 ? 'o problemă' : 'probleme'}: ${Object.values(er).join(' ')}`); document.getElementById(`cerere-${prima}`)?.focus(); return }
    setFisa({ c: { ...c }, run, zi: new Date().toLocaleDateString('ro-RO') })
    setAnunt('Fișa a fost pregătită. Nimic nu a fost trimis.')
    requestAnimationFrame(() => document.getElementById('fisa')?.focus())
  }

  const camp = (k: keyof typeof c, label: string, extra: object) => (
    <div>
      <label htmlFor={`cerere-${k}`} className="block text-[13px] text-muted">{label}</label>
      <input id={`cerere-${k}`} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} aria-invalid={!!err[k]}
        aria-describedby={err[k] ? `cerere-${k}-err` : undefined}
        className={cn('mt-1 h-12 w-full border-b bg-transparent font-display text-xl tracking-[-0.02em] placeholder:text-muted/70',
          err[k] ? 'border-b-2 border-bad text-bad' : 'border-line')} {...extra} />
      {err[k] && <p id={`cerere-${k}-err`} className="mt-2 rounded-lg bg-bad-bg px-3 py-2 text-sm text-bad">{err[k]}</p>}
    </div>
  )

  return (
    <section id="cerere" className="section">
      <div className="wrap grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <h2 className="h2">Trimite fișa de producție către Tech-Con.</h2>
            <p className="mt-4 max-w-[34rem] text-muted">Cifrele din verificator pleacă odată cu cererea. Vă răspunde echipa cea mai apropiată: Dragomirești-Deal, Iași sau Timișoara.</p>
          </Reveal>
          <div aria-live="polite" className="sr-only">{anunt}</div>
          {!fisa ? (
            <form onSubmit={trimite} noValidate className="mt-8 max-w-[34rem] space-y-6">
              {camp('firma', 'Firmă', { autoComplete: 'organization', placeholder: 'de exemplu, Patiseria Exemplu SRL' })}
              {camp('rol', 'Rol', { autoComplete: 'organization-title', placeholder: 'de exemplu, director de producție' })}
              {camp('email', 'E-mail', { type: 'email', inputMode: 'email', autoComplete: 'email', placeholder: 'nume@firma.ro' })}
              <button type="submit" className={cn(btnBlue, 'w-full sm:w-auto')}>Trimiteți cererea</button>
              <p className="text-sm text-muted">Prototip: folosiți date fictive. Nimic nu se trimite.</p>
            </form>
          ) : (
            <Fisa {...fisa} onEdit={() => { setFisa(null); setAnunt('') }} />
          )}
        </div>
        <Reveal className="space-y-4">
          <figure>
            <img src="./img/demonstratie.jpg" width={1000} height={667} loading="lazy" decoding="async"
              alt="Un specialist Tech-Con arată funcționarea unui robot colaborativ" className="w-full rounded-[20px] object-cover" />
            <figcaption className="mt-2 text-sm text-muted">Demonstrație cu un robot colaborativ. Imagine: Tech-Con.</figcaption>
          </figure>
          <img src="./img/instruire.jpg" width={1200} height={900} loading="lazy" decoding="async"
            alt="Sesiune de instruire Tech-Con pentru operatori" className="aspect-[3/1] w-full rounded-[20px] object-cover" />
        </Reveal>
      </div>
    </section>
  )
}

function Rand({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-line py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  )
}

function Fisa({ c, run, zi, onEdit }: { c: { firma: string; rol: string; email: string }; run: Rulare; zi: string; onEdit: () => void }) {
  const rez = 'erori' in run.rez ? null : run.rez
  const d = run.date
  const grup = 'display mt-7 text-lg font-medium'
  return (
    <div id="fisa" tabIndex={-1} className="mt-8 rounded-[22px] bg-white p-6 shadow-[0_26px_60px_rgb(20_23_26/0.12)] outline-none lg:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="display text-[24px] font-semibold">Fișă pentru evaluarea tehnică</h3>
        <span className="text-sm text-muted tabular-nums">{zi}</span>
      </div>
      <p className="mt-3 inline-flex rounded-full bg-ok-bg px-4 py-1.5 text-sm text-ok">Prototip: nimic nu a fost trimis. Așa ar arăta fișa primită de Tech-Con.</p>

      <h4 className={grup}>Contact</h4>
      <dl className="mt-2"><Rand k="Firmă" v={c.firma} /><Rand k="Rol" v={c.rol} /><Rand k="E-mail" v={c.email} /></dl>

      <h4 className={grup}>Linia</h4>
      {rez ? (
        <dl className="mt-2">
          <Rand k="Ambalaj plin" v={`${ro(d.kg)} kg, ${d.maner ? 'găleată cu mâner' : 'alt ambalaj'}`} />
          <Rand k="Ambalaje pe schimb" v={ro(d.galetiSchimb, 0)} />
          <Rand k="Ritm maxim" v={`${ro(d.ritm)} ambalaje/min`} />
          <Rand k="Schimburi pe zi" v={d.schimburi} />
        </dl>
      ) : (
        <p className="mt-2 text-muted">Verificarea liniei nu a fost făcută. Tech-Con ar cere datele la primul contact.</p>
      )}

      {rez && (
        <>
          <h4 className={grup}>Rezultat</h4>
          <dl className="mt-2">
            <Rand k="Verdict" v={VERDICT[rez.nivel].text} />
            <Rand k="Tone pe schimb" v={`${ro(rez.toneSchimb)} tone`} />
            <Rand k="Tone pe an" v={`${ro(rez.toneAn, 0)} tone`} />
            <Rand k="Ridicări pe an" v={ro(rez.ridicariAn, 0)} />
            <Rand k="Paleți pe schimb" v={rez.paletiSchimb === null ? 'se stabilește la evaluare' : ro(rez.paletiSchimb)} />
            <Rand k="Motive" v={<ul className="space-y-1">{rez.motive.map((m) => <li key={m}>{m}</li>)}</ul>} />
          </dl>
        </>
      )}

      <h4 className={grup}>De verificat</h4>
      <ul className="mt-2">{DE_VERIFICAT.map((t) => <li key={t} className="border-t border-line py-2.5">{t}</li>)}</ul>

      <button type="button" onClick={onEdit} className={cn(btnOutline, 'mt-6')}>Modificați cererea</button>
    </div>
  )
}
