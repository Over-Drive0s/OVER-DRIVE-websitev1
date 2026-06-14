import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AdminRole } from '../lib/adminUsers'
import {
  getAdminSession,
  getPostLoginPath,
  isOwnerSession,
} from '../lib/adminUsers'

export default function RolePortalGuard({
  children,
  allowedRoles,
}: {
  children: ReactNode
  allowedRoles: AdminRole[]
}) {
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

    if (!allowedRoles.includes(current.role)) {
      navigate(getPostLoginPath(current.email, current.role), { replace: true })
    }
  }, [allowedRoles, navigate])

  if (!session || isOwnerSession(session) || !allowedRoles.includes(session.role)) {
    return null
  }

  return children
}
