import { Mark, Reveal } from '@/components/common'
import { Checker } from '@/components/Checker'
import { StepsPath } from '@/components/StepsPath'
import { FooterMark } from '@/components/FooterMark'

const PURATOS = [
  { k: 'Înainte', v: 'Doi operatori pe schimb, în două până la trei schimburi pe zi.' },
  { k: 'Paletul', v: '100 de ambalaje de 5 kg sau 44 de 13 kg.' },
  { k: 'Ținta', v: 'Minimum 6 ambalaje pe minut.' },
  {
    k: 'Testat',
    v: <><b className="font-semibold text-blue">7,4</b> pe minut la 13 kg și <b className="font-semibold text-blue">8,6</b> pe minut la 5 kg.</>,
  },
  { k: 'Livrare', v: 'Aproximativ patru luni.' },
]

const LINIE = [
  { t: 'Mai puțină ridicare manuală.', d: 'Marfa nu mai trece prin mâinile unui om la fiecare câteva secunde.' },
  { t: 'Marfă așezată la fel, de fiecare dată.', d: 'Robotul urmează un model de paletizare programat, cu rezultate repetabile.' },
  { t: 'Un ritm pe care îl puteți măsura.', d: 'Ritmul de paletizare se verifică față de alimentarea liniei.' },
]

const LA_OAMENI = ['Schimbarea paleților', 'Amplasarea separatoarelor', 'Umplerea, ca până acum']
const VERIFICAM = [
  'Greutatea, forma și materialul ambalajului (și mânerul, dacă are)',
  'Debitul liniei și modelul de paletizare',
  'Spațiul, accesul, igiena și riscurile',
  'Integrarea transportorului de alimentare',
]

function Ruled({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="display text-[22px] font-medium">{title}</h3>
      <ul className="mt-4 border-b border-line">{items.map((t) => <li key={t} className="border-t border-line py-3.5">{t}</li>)}</ul>
    </div>
  )
}

// the line draws once and the dots light in order when the list scrolls into view (CSS in index.css)

export default function App() {
  return (
    <>
      <header className="on-dark relative isolate overflow-hidden bg-ink text-white">
        <img src="./img/transportor.jpg" width={1600} height={1200} decoding="async" fetchPriority="high"
          alt="Transportor cu role Tech-Con într-o hală de producție"
          className="absolute inset-0 -z-10 size-full object-cover" />
        <div aria-hidden className="shade absolute inset-0 -z-10" />
        <nav aria-label="Principal" className="wrap flex h-20 items-center justify-between gap-4 lg:h-24">
          <a href="#" className="flex items-center gap-1 font-display text-[22px] font-semibold tracking-[-0.03em] no-underline">
            <Mark className="size-6" /> stackato
          </a>
          <div className="flex items-center gap-8">
            <ul className="hidden items-center gap-8 text-[15px] lg:flex">
              <li><a className="hover:underline" href="#puratos">Cazul PURATOS</a></li>
              <li><a className="hover:underline" href="#cum-lucreaza">Cum lucrează</a></li>
              <li><a className="hover:underline" href="#ce-nu-promitem">Ce nu promitem</a></li>
            </ul>
            <a href="#cerere" className="pill bg-white px-5 text-sm text-ink hover:bg-white/85">Solicitați evaluarea</a>
          </div>
        </nav>
        <div className="wrap relative pt-10 pb-28 lg:pt-24 lg:pb-[200px]">
          <h1 className="display text-[44px] leading-[1.02] font-semibold sm:text-[64px] lg:text-[80px]">
            <span className="lg:whitespace-nowrap">Robotul ridică marfa.</span><br /><span className="lg:whitespace-nowrap">Totul pe mâini sigure.</span>
          </h1>
          <p className="mt-6 max-w-[36rem] text-white/88 lg:mt-10 lg:text-[19px]">
            O celulă de paletizare cu UR20, ca aceea instalată de Tech-Con la PURATOS, pentru fabrici care paletizează
            marfă de mână. Aflați în 60 de secunde dacă ține ritmul liniei dumneavoastră.
          </p>
          <p className="absolute bottom-[52px] text-xs text-white/80 lg:bottom-[92px]">Imagine: Tech-Con.</p>
        </div>
      </header>

      <main>
        <Checker>
          <section id="puratos" className="section border-t border-line">
            <div className="wrap grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <figure className="max-w-[640px]">
                  <img src="./img/puratos.jpg" width={604} height={340} loading="lazy" decoding="async"
                    alt="Două celule de paletizare UR20 așază marfa pe paleți la PURATOS" className="w-full max-w-[604px] rounded-[20px]" />
                  <figcaption className="mt-3 text-sm text-muted">Celulele UR20 de la PURATOS. Sursa imaginii: prezentarea Tech-Con.</figcaption>
                </figure>
              </Reveal>
              <Reveal>
                <h2 className="h2">La PURATOS, marfă de 5 și 13 kg, așezată până atunci de mână.</h2>
                <dl className="mt-8 border-b border-line">
                  {PURATOS.map((r) => (
                    <div key={r.k} className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-line py-4">
                      <dt className="text-sm text-muted">{r.k}</dt>
                      <dd className="tabular-nums">{r.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-sm text-muted">Rezultate de test ale acestei aplicații. Nu sunt o garanție pentru altă fabrică.</p>
              </Reveal>
            </div>
          </section>

          <section id="cum-lucreaza" className="on-dark section bg-ink text-white">
            <div className="wrap">
              <Reveal>
                <h2 className="h2">De la umplere la palet finalizat.</h2>
                <p className="mt-3 text-white/72">Șase pași. Ultimul rămâne al oamenilor.</p>
              </Reveal>
              <div className="mt-14 lg:mt-20"><StepsPath /></div>
              <p className="mt-14 text-sm text-white/72">Punctele albastre sunt pașii făcuți de celulă.</p>
            </div>
          </section>

          <section className="section">
            <div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <h2 className="h2">Ce se schimbă pe linie</h2>
                <ul className="mt-8 border-b border-line">
                  {LINIE.map((l) => (
                    <li key={l.t} className="border-t border-line py-5">
                      <h3 className="display text-[22px] font-medium">{l.t}</h3>
                      <p className="mt-1 text-muted">{l.d}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal>
                <figure>
                  <img src="./img/paletizare.jpg" width={731} height={550} loading="lazy" decoding="async"
                    alt="Celulă de paletizare cu robot colaborativ care așază cutii pe un palet" className="w-full rounded-[20px]" />
                  <figcaption className="mt-3 text-sm text-muted">Celulă de paletizare cu robot colaborativ. Imagine: Tech-Con.</figcaption>
                </figure>
              </Reveal>
            </div>
          </section>

          <section id="ce-nu-promitem" className="section bg-white">
            <div className="wrap">
              <Reveal>
                <h2 className="h2">Ce nu promitem.</h2>
                <p className="mt-4 max-w-[44rem] text-muted lg:text-lg">
                  Un robot mai rapid nu crește automat debitul întregii fabrici: ritmul îl dă umplerea. Cifrele de la PURATOS
                  sunt rezultate de test ale acelei aplicații, nu garanții pentru alta.
                </p>
              </Reveal>
              <Reveal className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
                <Ruled title="Rămâne la oameni" items={LA_OAMENI} />
                <Ruled title="Verificăm înainte de ofertă" items={VERIFICAM} />
              </Reveal>
            </div>
          </section>
        </Checker>
      </main>

      <footer className="on-dark overflow-hidden bg-ink text-white">
        <div className="wrap">
          <div className="grid gap-10 pt-16 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:pt-20">
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="#" className="flex items-center gap-1 font-display text-[22px] font-semibold tracking-[-0.03em] no-underline">
                <Mark className="size-6" /> stackato
              </a>
              <p className="mt-4 max-w-[42ch] text-white/72">
                Un verificator de 60 de secunde pentru fabrici care paletizează marfă de mână: câte tone se ridică de mână și dacă o
                celulă de paletizare UR20 ține ritmul liniei.
              </p>
              <p className="mt-4 text-sm">
                O soluție Tech-Con <span className="text-white/50" lang="en">· Steady stacking.</span>
              </p>
            </div>
            <nav aria-label="Secțiunile paginii">
              <h2 className="text-sm font-semibold">Pe pagină</h2>
              <ul className="mt-4 grid gap-3 text-white/72">
                <li><a className="hover:text-white hover:underline" href="#verificare">Verificați producția</a></li>
                <li><a className="hover:text-white hover:underline" href="#puratos">Cazul PURATOS</a></li>
                <li><a className="hover:text-white hover:underline" href="#cum-lucreaza">Cum lucrează celula</a></li>
                <li><a className="hover:text-white hover:underline" href="#ce-nu-promitem">Ce nu promitem</a></li>
                <li><a className="hover:text-white hover:underline" href="#cerere">Solicitați evaluarea tehnică</a></li>
              </ul>
            </nav>
            <div>
              <h2 className="text-sm font-semibold">Tech-Con în România</h2>
              <ul className="mt-4 grid gap-3 text-white/72">
                <li>Dragomirești-Deal</li>
                <li>Iași</li>
                <li>Timișoara</li>
              </ul>
              <p className="mt-4 max-w-[32ch] text-sm text-white/72">Evaluarea tehnică o face echipa cea mai apropiată de fabrica dumneavoastră.</p>
            </div>
          </div>
          <p className="max-w-[92ch] pb-8 text-sm text-white/72">
            Prototip pentru AI-Powered Business Challenge 2026, cu date fictive. Cifrele PURATOS sunt rezultate de test din
            studiul de caz, nu garanții pentru altă fabrică. Fotografii: Tech-Con.
          </p>
          <div className="border-t border-white/14">
            <FooterMark className="display -mb-[0.12em] pt-[0.62em] text-center text-[17vw] leading-[0.9] font-semibold whitespace-nowrap text-white/8 xl:text-[220px]" />
          </div>
        </div>
      </footer>
    </>
  )
}
