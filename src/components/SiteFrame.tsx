import type { ReactNode } from 'react'
import { SiteLayoutProvider } from '../context/SiteLayoutContext'

interface SiteFrameProps {
  children: ReactNode
}

export default function SiteFrame({ children }: SiteFrameProps) {
  return (
    <SiteLayoutProvider>
      <div className="site-shell">
        <div className="site-shell-bg" aria-hidden="true">
          <div className="site-shell-grid" />
          <div className="site-shell-glow site-shell-glow-blue" />
          <div className="site-shell-glow site-shell-glow-lime" />
        </div>

        <div className="site-card">
          <div className="site-card-inner">{children}</div>
        </div>
      </div>
    </SiteLayoutProvider>
  )
}
