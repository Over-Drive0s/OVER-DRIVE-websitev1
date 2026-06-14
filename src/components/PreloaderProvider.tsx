import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Preloader from './Preloader'

const MIN_LOAD_MS = 550
const EXIT_MS = 380

interface PreloaderProviderProps {
  children: ReactNode
}

export default function PreloaderProvider({ children }: PreloaderProviderProps) {
  const location = useLocation()
  const [phase, setPhase] = useState<'loading' | 'exiting' | 'idle'>('loading')
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    setPhase('loading')

    const exitTimer = window.setTimeout(() => {
      setPhase('exiting')
    }, MIN_LOAD_MS)

    const idleTimer = window.setTimeout(() => {
      setPhase('idle')
    }, MIN_LOAD_MS + EXIT_MS)

    timersRef.current.push(exitTimer, idleTimer)

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [location.pathname, location.key])

  const isVisible = phase === 'loading' || phase === 'exiting'

  return (
    <div className="relative h-full">
      {isVisible && <Preloader exiting={phase === 'exiting'} />}
      <div
        className={`h-full transition-opacity duration-300 ${
          phase === 'loading' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
