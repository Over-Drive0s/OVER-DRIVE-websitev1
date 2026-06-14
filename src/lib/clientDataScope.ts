import {
  findAdminUserByEmail,
  getAdminSession,
  isOwnerSession,
} from './adminUsers'

export type ClientDataScope = {
  viewAll: boolean
  ownerId: string | null
  actorName?: string
}

export function getClientDataScope(): ClientDataScope {
  const session = getAdminSession()
  if (!session) {
    return { viewAll: false, ownerId: null }
  }

  const ownerId = session.id ?? findAdminUserByEmail(session.email)?.id ?? null
  const viewAll = isOwnerSession(session)

  return {
    viewAll,
    ownerId,
    actorName: session.name,
  }
}
