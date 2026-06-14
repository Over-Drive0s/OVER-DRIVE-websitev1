import { useEffect } from 'react'
import { scrollToTop } from '../utils/scrollToTop'

export function useScrollToTopOnMount() {
  useEffect(() => {
    scrollToTop()
  }, [])
}
