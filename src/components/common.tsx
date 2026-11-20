import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { BlurFade } from '@/components/ui/blur-fade'

export const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })

// section reveal: 16px up + fade in 0.4s; plain block under reduced motion
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <BlurFade inView direction="up" offset={16} duration={0.4} blur="4px" delay={delay} className={className}>
      {children}
    </BlurFade>
  )
}

// the mark: monogram "s" (three stacked strokes joined by curves) with the bucket dot coming in;
// geometry from Figma node 45:674 on its 32 px grid. Both uses sit on dark, so the dot is the light blue.
export function Mark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className}>
      <path d="M20 6H11a5 5 0 0 0 0 10h10a5 5 0 0 1 0 10H6" fill="none" stroke="currentColor" strokeWidth="4.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="27" cy="6" r="2.75" fill="#6FB3E8" />
    </svg>
  )
}
