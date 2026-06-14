interface PreloaderProps {
  exiting?: boolean
}

export default function Preloader({ exiting = false }: PreloaderProps) {
  return (
    <div
      className={`preloader-overlay ${exiting ? 'preloader-overlay-exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="preloader-bg-grid" aria-hidden="true" />
      <div className="preloader-glow preloader-glow-blue" aria-hidden="true" />
      <div className="preloader-glow preloader-glow-lime" aria-hidden="true" />

      <div className="preloader-content">
        <div className="preloader-logo-wrap">
          <img src="/logo.png" alt="" className="preloader-logo" />
          <div className="preloader-logo-ring" aria-hidden="true" />
        </div>

        <div className="preloader-bar-track" aria-hidden="true">
          <div className="preloader-bar-fill" />
        </div>

        <p className="preloader-label">Loading</p>
      </div>
    </div>
  )
}
