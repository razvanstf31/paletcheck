import { useEffect, useRef } from 'react'

// The six steps as one line that bends back on itself (two rows on desktop, one column on phones).
// The line is drawn by the scroll: it advances as the section moves up the screen, each dot lights
// up when the line reaches it, and a short bright segment rides at the front of the line.

const PASI: [string, string, boolean][] = [
  ['Umplerea', 'Marfa iese ambalată din mașina de umplere.', false],
  ['Transportorul', 'O aduce la celulă, în ritmul liniei.', false],
  ['Camera', 'Citește orientarea mânerului înainte de preluare.', true],
  ['Prinderea', 'Dispozitivul de prindere ia ambalajul fără să atingă mânerul.', true],
  ['Așezarea', 'Robotul o pune pe una dintre cele două poziții de paletizare.', true],
  ['Paletul', 'Operatorul schimbă paletul plin și așază separatorul.', false],
]

// Geometry of the desktop drawing, in a 1200 × 600 box.
const W = 1200
const H = 600
const Y1 = 100
const Y2 = 380
const R = (Y2 - Y1) / 2
const XS = [180, 600, 1020]
const TURN = 1080
const LINE = `M20 ${Y1} H${TURN} A${R} ${R} 0 0 1 ${TURN} ${Y2} H${XS[0]}`
const ARC = Math.PI * R
const LEN = TURN - 20 + ARC + (TURN - XS[0])
// each node: position, and how far along the line it sits (0..1), so its dot lights up on time
const NOD = [
  { x: XS[0], y: Y1, s: XS[0] - 20 },
  { x: XS[1], y: Y1, s: XS[1] - 20 },
  { x: XS[2], y: Y1, s: XS[2] - 20 },
  { x: XS[2], y: Y2, s: TURN - 20 + ARC + (TURN - XS[2]) },
  { x: XS[1], y: Y2, s: TURN - 20 + ARC + (TURN - XS[1]) },
  { x: XS[0], y: Y2, s: LEN },
].map((n) => ({ ...n, s: n.s / LEN }))
// Side notes that branch off the line. `dir` follows the flow: the top row runs left to right,
// the bottom row right to left, so its branch leaves the other way.
const NOTE = [
  { x: 640, y: Y1, dir: 1, s: (640 - 20) / LEN, titlu: 'Sistemul de vedere', text: 'evită mânerul în zona de prindere.' },
  { x: 980, y: Y2, dir: -1, s: (TURN - 20 + ARC + (TURN - 980)) / LEN, titlu: 'Schimbarea paletului', text: 'rămâne o intervenție manuală.' },
]
const pct = (v: number, of: number) => `${(v / of) * 100}%`

const CSS = `
.sp{--sky:#6FB3E8;--band:#14171A}
.sp ol{list-style:none;margin:0;padding:0 0 0 44px;position:relative;display:grid;gap:28px}
.sp ol::before{content:"";position:absolute;left:9px;top:12px;bottom:12px;width:2px;background:var(--sky);transform-origin:top;transform:scaleY(var(--p,1))}
.sp li{position:relative}
.sp-dot{position:absolute;left:-44px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 0 0 6px var(--band)}
.sp-robot .sp-dot{background:var(--sky)}
.sp-last .sp-dot{outline:2px solid var(--sky);outline-offset:7px}
.sp-n{display:block;font:500 14px/1 Outfit,system-ui,sans-serif;color:rgba(255,255,255,.62);margin-bottom:6px}
.sp-t{font:600 18px/1.25 Inter,system-ui,sans-serif;color:#fff;margin:0}
.sp-d{font:400 15px/1.5 Inter,system-ui,sans-serif;color:rgba(255,255,255,.78);margin:6px 0 0}
.sp svg,.sp-note{display:none}
/* the line follows the scroll (--p goes 0..1); a step lights up when the line reaches it */
.sp-anim li{opacity:.28;transition:opacity .45s ease-out}
.sp-anim li.sp-lit{opacity:1}
@media (min-width:1024px){
  .sp-stage{position:relative;aspect-ratio:${W}/${H}}
  .sp svg{display:block;position:absolute;inset:0;width:100%;height:100%;overflow:visible}
  .sp ol{position:absolute;inset:0;display:block;padding:0}
  .sp ol::before{display:none}
  .sp li{position:absolute;left:var(--x);top:var(--y);width:250px;transform:translateX(-50%);text-align:center;padding-top:36px}
  .sp-dot{left:50%;top:0;transform:translate(-50%,-50%)}
  .sp-n{position:absolute;left:0;right:0;top:-50px;margin:0}
  .sp-t{font-size:19px}
  .sp-draw{stroke-dasharray:${LEN};stroke-dashoffset:calc(${LEN}px * (1 - var(--p,1)))}
  .sp-flow{stroke-dasharray:70 ${LEN};stroke-dashoffset:calc(70px - ${LEN}px * var(--p,1));opacity:0;transition:opacity .4s ease-out}
  .sp-anim .sp-flow{opacity:.95}
  .sp-anim.sp-start .sp-flow,.sp-anim.sp-done .sp-flow{opacity:0}
  .sp-branch{display:none}
  .sp-note{position:absolute;left:var(--x);top:var(--y);white-space:nowrap}
  .sp-note.sp-left{transform:translateX(-100%);text-align:right}
  .sp-note b{display:block;font:500 15px/1.4 Inter,system-ui,sans-serif;color:rgba(255,255,255,.92)}
  .sp-note span{font:400 14px/1.4 Inter,system-ui,sans-serif;color:rgba(255,255,255,.66)}
  .sp-anim .sp-note,.sp-anim .sp-branch{opacity:0;transition:opacity .5s ease-out}
  .sp-anim .sp-note.sp-lit,.sp-anim .sp-branch.sp-lit{opacity:1}
}
@media (min-width:1280px){.sp-note{display:block}.sp-branch{display:inline}}
`

export function StepsPath() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // with reduced motion (or no script) everything is simply drawn and lit
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('sp-anim')
    const items = [...el.querySelectorAll<HTMLElement | SVGElement>('[data-s]')]
    const wide = window.matchMedia('(min-width:1024px)')
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the top of the drawing reaches the lower part of the screen, 1 once it is all in view
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height * 0.85 + vh * 0.1)))
      el.style.setProperty('--p', p.toFixed(4))
      for (const it of items) {
        const at = Number(wide.matches ? it.dataset.s : (it.dataset.i ?? it.dataset.s))
        it.classList.toggle('sp-lit', p > 0 && p >= at - 0.002)
      }
      el.classList.toggle('sp-start', p <= 0)
      el.classList.toggle('sp-done', p >= 1)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="sp">
      <style>{CSS}</style>
      <div className="sp-stage">
        <svg viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true" focusable="false">
          <path d={LINE} stroke="rgba(255,255,255,.14)" strokeWidth="2" />
          <path className="sp-draw" d={LINE} stroke="#6FB3E8" strokeWidth="2" strokeLinecap="round" />
          <path className="sp-flow" d={LINE} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy={Y1} r="5" fill="#14171A" stroke="#6FB3E8" strokeWidth="2" />
          {NOTE.map((n) => (
            <g key={n.titlu} className="sp-branch" data-s={n.s}>
              <path
                d={`M${n.x} ${n.y} C${n.x + 50 * n.dir} ${n.y} ${n.x + 60 * n.dir} ${n.y - 56} ${n.x + 108 * n.dir} ${n.y - 58}`}
                stroke="rgba(255,255,255,.45)"
                strokeWidth="1.5"
              />
              <circle cx={n.x + 114 * n.dir} cy={n.y - 58} r="5" fill="#14171A" stroke="#9AA3AB" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
        {NOTE.map((n) => (
          <p
            key={n.titlu}
            className={`sp-note${n.dir < 0 ? ' sp-left' : ''}`}
            data-s={n.s}
            style={{ ['--x' as string]: pct(n.x + 132 * n.dir, W), ['--y' as string]: pct(n.y - 80, H), margin: 0 }}
          >
            <b>{n.titlu}</b>
            <span>{n.text}</span>
          </p>
        ))}
        <ol>
          {PASI.map(([titlu, text, robot], i) => (
            <li
              key={titlu}
              data-s={NOD[i].s}
              data-i={i / (PASI.length - 1)}
              className={`${robot ? 'sp-robot' : ''}${i === PASI.length - 1 ? ' sp-last' : ''}`}
              style={{ ['--x' as string]: pct(NOD[i].x, W), ['--y' as string]: pct(NOD[i].y, H) }}
            >
              <span className="sp-dot" aria-hidden="true" />
              <span className="sp-n" aria-hidden="true">{i + 1}</span>
              <h3 className="sp-t">{titlu}</h3>
              <p className="sp-d">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
