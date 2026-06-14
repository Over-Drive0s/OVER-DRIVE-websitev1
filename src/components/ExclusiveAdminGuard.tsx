import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminSession, isOwnerSession } from '../lib/adminUsers'

export default function ExclusiveAdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const session = getAdminSession()
  const allowed = isOwnerSession(session)

  useEffect(() => {
    if (!allowed) {
      navigate(session ? '/clientportal' : '/adminlogin', { replace: true })
    }
  }, [allowed, navigate, session])

  if (!allowed) return null

  return children
}
