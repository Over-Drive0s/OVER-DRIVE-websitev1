import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminSession,
  getPostLoginPath,
  isOwnerSession,
} from '../lib/adminUsers'

export default function ClientPortalGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const session = getAdminSession()

  useEffect(() => {
    const current = getAdminSession()
    if (!current) {
      navigate('/adminlogin', { replace: true })
      return
    }

    if (isOwnerSession(current)) {
      navigate('/masteradmin', { replace: true })
      return
    }

    if (current.role !== 'Customer') {
      navigate(getPostLoginPath(current.email, current.role), { replace: true })
    }
  }, [navigate])

  if (!session || isOwnerSession(session) || session.role !== 'Customer') return null

  return children
}
