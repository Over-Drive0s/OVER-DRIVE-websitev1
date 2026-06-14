import { useEffect, useState } from 'react'
import Preloader from '../components/Preloader'

/** Dev preview — loops preloader loading → exit animation. Visit /preloader-preview */
export default function PreloaderPreview() {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setExiting(false)
      window.setTimeout(() => setExiting(true), 1400)
    }, 2800)

    window.setTimeout(() => setExiting(true), 1400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-full bg-[#050607]">
      <Preloader exiting={exiting} />
      <p className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-white/30">
        Preview loop — loading 1.4s → fade out 0.38s → repeat
      </p>
    </div>
  )
}
