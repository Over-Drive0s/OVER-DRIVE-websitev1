import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export const DESKTOP_FRAME_MIN_WIDTH = 1680

export type SiteLayoutMode = 'desktop' | 'responsive'

interface SiteLayoutContextValue {
  layout: SiteLayoutMode
  isDesktopFrame: boolean
  isResponsive: boolean
}

const SiteLayoutContext = createContext<SiteLayoutContextValue>({
  layout: 'desktop',
  isDesktopFrame: true,
  isResponsive: false,
})

const mediaQuery = `(min-width: ${DESKTOP_FRAME_MIN_WIDTH}px)`

export function getSiteLayoutMode(): SiteLayoutMode {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia(mediaQuery).matches ? 'desktop' : 'responsive'
}

export function applySiteLayoutMode(layout: SiteLayoutMode) {
  document.documentElement.dataset.siteLayout = layout
}

export function SiteLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<SiteLayoutMode>(() => getSiteLayoutMode())

  useEffect(() => {
    applySiteLayoutMode(layout)
  }, [layout])

  useEffect(() => {
    const query = window.matchMedia(mediaQuery)

    const handleChange = (event: MediaQueryListEvent) => {
      setLayout(event.matches ? 'desktop' : 'responsive')
    }

    setLayout(query.matches ? 'desktop' : 'responsive')
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const value: SiteLayoutContextValue = {
    layout,
    isDesktopFrame: layout === 'desktop',
    isResponsive: layout === 'responsive',
  }

  return (
    <SiteLayoutContext.Provider value={value}>{children}</SiteLayoutContext.Provider>
  )
}

export function useSiteLayout() {
  return useContext(SiteLayoutContext)
}
