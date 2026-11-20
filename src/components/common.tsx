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

// the mark: a dot above two short bars
export function Mark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={className} fill="currentColor">
      <circle cx="10" cy="4.5" r="3.2" />
      <rect x="3" y="10" width="14" height="3" rx="1.5" />
      <rect x="3" y="15" width="14" height="3" rx="1.5" />
    </svg>
  )
}
