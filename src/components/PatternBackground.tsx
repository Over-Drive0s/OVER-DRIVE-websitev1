import type { ReactNode } from 'react'

interface PatternBackgroundProps {
  variant?: 'grid' | 'dot' | 'cross'
  className?: string
  children?: ReactNode
  glow?: boolean
}

export default function PatternBackground({
  variant = 'grid',
  className = '',
  children,
  glow = false,
}: PatternBackgroundProps) {
  const patternClass =
    variant === 'dot' ? 'bg-dot-pattern' : variant === 'cross' ? 'bg-cross-pattern' : 'bg-grid-pattern'

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className={`pointer-events-none absolute inset-0 ${patternClass}`} />
      {glow && (
        <>
          <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/[0.07] blur-[100px]" />
          <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-blue-600/[0.05] blur-[100px]" />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050607]" />
      {children}
    </div>
  )
}
