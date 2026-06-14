import { useEffect, useState } from 'react'

const STORAGE_KEY = 'inv-dashboard-theme'

export function useInventoryTheme() {
  const [lightMode, setLightMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'light'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lightMode ? 'light' : 'dark')
    } catch {
      /* ignore */
    }
  }, [lightMode])

  return { lightMode, setLightMode }
}
