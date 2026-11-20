import { useEffect, useRef, useState } from 'react'

// The large "stackato" at the bottom of the page, with a small robot arm hanging from the rail
// above it. When the footer scrolls into view, the arm carries the blue dot of the monogram (the
// bucket coming in) over the word, lowers it above the final "o" as a staccato dot, lets go and
// folds back. It happens once. The arm is kept dark, in half shadow, so it reads as part of the
// footer and the blue dot is the only bright thing. Every size is in em, so the arm and the dot
// scale with the wordmark.
//
// Poses (shoulder, elbow, wrist angles in degrees) come from solving the two-link arm for four
// wrist positions: carrying, above the slot, placed, at rest. The wrist angle is always minus the
// sum of the other two, which keeps the gripper upright the whole way. The "o" is the last letter,
// so the arm is mirrored (scaleX(-1)) to work from the left and stay inside the footer.
const POSE = {
  carry: [36, 126.9, -162.9],
  above: [128.1, 73.9, -202],
  placed: [123.3, 62.5, -185.8],
  rest: [87.7, 124.2, -211.9],
}
const DUR = '5.6s'
const kf = (i: number) => `
@keyframes fm-j${i + 1}{
  0%,9%{transform:rotate(${POSE.carry[i]}deg)}
  46%{transform:rotate(${POSE.above[i]}deg)}
  63%,73%{transform:rotate(${POSE.placed[i]}deg)}
  100%{transform:rotate(${POSE.rest[i]}deg)}
}`

const CSS = `
.fm{position:relative}
.fm-slot{position:relative;display:inline-block}
.fm-arm{position:absolute;left:calc(50% - 1.05em);top:-.5em;width:0;height:0;transform:scaleX(-1);filter:drop-shadow(0 .035em .05em rgb(0 0 0 / .6))}
.fm-arm span{position:absolute;display:block}
.fm-plate{left:-.19em;top:-.12em;width:.38em;height:.035em;border-radius:.008em;background:linear-gradient(180deg,#3a4148,#22272c)}
.fm-post{left:-.085em;top:-.088em;width:.17em;height:.1em;border-radius:.02em;background:linear-gradient(90deg,#2a3035 0%,#4f575e 38%,#3a4147 70%,#23282d 100%)}
.fm-j{left:0;top:0;width:0;height:0;transform-origin:0 0;animation-timing-function:cubic-bezier(.5,0,.2,1)}
.fm-j2,.fm-j3{left:.68em}
.fm-tube{left:0;top:-.056em;width:.68em;height:.112em;border-radius:.056em;background:linear-gradient(180deg,#5d656c 0%,#454c53 32%,#30363b 74%,#23282c 100%);box-shadow:inset 0 0 0 .004em rgb(0 0 0 / .35)}
/* the forearm points back towards the slot, so its light side is flipped to stay on top */
.fm-j2>.fm-tube{background:linear-gradient(0deg,#5d656c 0%,#454c53 32%,#30363b 74%,#23282c 100%);height:.098em;top:-.049em;border-radius:.049em}
.fm-tube::before,.fm-tube::after{content:"";position:absolute;top:0;bottom:0;width:.02em;background:rgb(0 0 0 / .32)}
.fm-tube::before{left:.11em}.fm-tube::after{right:.11em}
.fm-knuckle{left:-.1em;top:-.1em;width:.2em;height:.2em;border-radius:50%;background:radial-gradient(circle,#555d64 0%,#3d444a 58%,#282d32 100%);box-shadow:inset 0 0 0 .006em rgb(0 0 0 / .4)}
.fm-knuckle.s{left:-.078em;top:-.078em;width:.156em;height:.156em}
.fm-cap{left:-.062em;top:-.062em;width:.124em;height:.124em;border-radius:50%;background:radial-gradient(circle,#5c8fb8 0%,#3f7099 58%,#2b5273 100%);box-shadow:inset 0 0 0 .005em rgb(0 0 0 / .35)}
.fm-flange{left:-.05em;top:-.012em;width:.1em;height:.05em;background:linear-gradient(90deg,#2a3035,#4c545b 45%,#30363b)}
.fm-grip{left:-.105em;top:.03em;width:.21em;height:.06em;border-radius:.012em;background:linear-gradient(180deg,#343a40,#1e2327)}
.fm-f{top:.082em;width:.03em;height:.15em;border-radius:0 0 .01em .01em;background:linear-gradient(90deg,#30363b,#1d2226)}
.fm-fl{left:-.094em}.fm-fr{left:.064em}
/* the dot sits between the closed fingers; placed, its centre is .157em under the slot top, above the o */
.fm-d{position:absolute;display:block;width:.128em;height:.128em;border-radius:50%;background:#6FB3E8}
.fm-arm .fm-d{left:-.064em;top:.093em;opacity:0}
.fm-ghost{left:calc(50% - .064em);top:.093em}
.fm-j1{transform:rotate(${POSE.rest[0]}deg)}
.fm-j2{transform:rotate(${POSE.rest[1]}deg)}
.fm-j3{transform:rotate(${POSE.rest[2]}deg)}
.fm-fl{transform:translateX(-.03em)}.fm-fr{transform:translateX(.03em)}
/* script on and motion allowed: start in the carrying pose, with the slot empty */
.fm-anim .fm-j1{transform:rotate(${POSE.carry[0]}deg)}
.fm-anim .fm-j2{transform:rotate(${POSE.carry[1]}deg)}
.fm-anim .fm-j3{transform:rotate(${POSE.carry[2]}deg)}
.fm-anim .fm-fl,.fm-anim .fm-fr{transform:none}
.fm-anim .fm-arm .fm-d{opacity:1}
.fm-anim .fm-arm,.fm-anim .fm-ghost{opacity:0}
.fm-on .fm-j1{animation:fm-j1 ${DUR} forwards}
.fm-on .fm-j2{animation:fm-j2 ${DUR} forwards}
.fm-on .fm-j3{animation:fm-j3 ${DUR} forwards}
.fm-on .fm-arm{animation:fm-in ${DUR} linear forwards}
.fm-on .fm-arm .fm-d{animation:fm-d ${DUR} linear forwards}
.fm-on .fm-ghost{animation:fm-ghost ${DUR} linear forwards}
.fm-on .fm-fl{animation:fm-fl ${DUR} ease-out forwards}
.fm-on .fm-fr{animation:fm-fr ${DUR} ease-out forwards}
${kf(0)}${kf(1)}${kf(2)}
@keyframes fm-in{0%{opacity:0}7%,100%{opacity:1}}
@keyframes fm-d{0%,67%{opacity:1}67.5%,100%{opacity:0}}
@keyframes fm-ghost{0%,67%{opacity:0}67.5%,100%{opacity:1}}
@keyframes fm-fl{0%,66%{transform:none}72%,100%{transform:translateX(-.03em)}}
@keyframes fm-fr{0%,66%{transform:none}72%,100%{transform:translateX(.03em)}}
`

export function FooterMark({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  // without script, or with reduced motion, the name is simply whole and the arm is at rest
  const [anim, setAnim] = useState(false)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setAnim(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.55 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <p ref={ref} aria-hidden="true" className={`fm ${anim ? 'fm-anim ' : ''}${on ? 'fm-on ' : ''}${className}`}>
      <style>{CSS}</style>
      stackat
      <span className="fm-slot">
        o
        <span className="fm-d fm-ghost" />
        <span className="fm-arm">
          <span className="fm-plate" />
          <span className="fm-post" />
          <span className="fm-j fm-j1">
            <span className="fm-tube" />
            <span className="fm-j fm-j2">
              <span className="fm-tube" />
              <span className="fm-j fm-j3">
                <span className="fm-d" />
                <span className="fm-flange" />
                <span className="fm-grip" />
                <span className="fm-f fm-fl" />
                <span className="fm-f fm-fr" />
                <span className="fm-knuckle s" />
              </span>
              <span className="fm-knuckle" />
              <span className="fm-cap" />
            </span>
            <span className="fm-knuckle" />
            <span className="fm-cap" />
          </span>
        </span>
      </span>
    </p>
  )
}
