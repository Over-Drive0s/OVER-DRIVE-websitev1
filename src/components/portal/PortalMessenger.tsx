import { Hash, Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  findAdminUserById,
  isExclusiveOwnerEmail,
  listAdminUsers,
} from '../../lib/adminUsers'
import {
  ensureGeneralChannelMembers,
  formatPortalChatTime,
  GENERAL_CHANNEL_ID,
  isGeneralChannel,
  listGeneralChannelMembers,
  listPortalChatMessages,
  PORTAL_CHAT_CHANNELS,
  PORTAL_CHAT_EVENT,
  sendPortalChatMessage,
  type PortalChatChannelId,
  type PortalChatMessage,
} from '../../lib/portalMessenger'
import ProfileRoleFilterSelect from '../auth/ProfileRoleFilterSelect'
import type { ProfileRoleFilter } from '../../lib/adminRoles'
import { isDataUrlImage } from '../../lib/storedFileData'

const MASTER_ADMIN_PROFILE_NAME = 'Admin'

function getProfileLabel(ownerId: string): string {
  const user = findAdminUserById(ownerId)
  if (!user) return 'Unknown profile'
  if (isExclusiveOwnerEmail(user.email)) return MASTER_ADMIN_PROFILE_NAME
  return user.name
}

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

const authorColors = [
  'text-[#8b9cff]',
  'text-emerald-400',
  'text-amber-300',
  'text-pink-300',
  'text-cyan-300',
]

function authorColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return authorColors[Math.abs(hash) % authorColors.length]
}

import { isStaffPortalVariant, type PortalVariant } from '../../lib/portalConfig'

export default function PortalMessenger({
  variant = 'client',
}: {
  variant?: PortalVariant
}) {
  const [activeChannel, setActiveChannel] =
    useState<PortalChatChannelId>(GENERAL_CHANNEL_ID)
  const [messages, setMessages] = useState<PortalChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')
  const [profileFilter, setProfileFilter] = useState<ProfileRoleFilter>('all')
  const [sendTarget, setSendTarget] = useState('')
  const [generalMembers, setGeneralMembers] = useState(() =>
    listGeneralChannelMembers(),
  )

  const isMaster = isStaffPortalVariant(variant)
  const isGeneral = isGeneralChannel(activeChannel)

  const profileOptions = useMemo(
    () =>
      listAdminUsers()
        .filter((user) => !isExclusiveOwnerEmail(user.email))
        .map((user) => ({ id: user.id, label: user.name })),
    [],
  )

  const syncGeneralMembers = useCallback(() => {
    ensureGeneralChannelMembers()
    setGeneralMembers(listGeneralChannelMembers())
  }, [])

  const refreshMessages = useCallback(() => {
    setMessages(
      listPortalChatMessages(
        activeChannel,
        isMaster && !isGeneral ? profileFilter : undefined,
      ),
    )
  }, [activeChannel, isGeneral, isMaster, profileFilter])

  useEffect(() => {
    syncGeneralMembers()
    refreshMessages()
    const onChat = () => {
      syncGeneralMembers()
      refreshMessages()
    }
    const onFocus = () => syncGeneralMembers()
    window.addEventListener(PORTAL_CHAT_EVENT, onChat)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener(PORTAL_CHAT_EVENT, onChat)
      window.removeEventListener('focus', onFocus)
    }
  }, [refreshMessages, syncGeneralMembers])

  useEffect(() => {
    if (!isMaster || isGeneral) return
    if (sendTarget && profileOptions.some((p) => p.id === sendTarget)) return
    setSendTarget(profileOptions[0]?.id ?? '')
  }, [isGeneral, isMaster, profileOptions, sendTarget])

  const handleSend = () => {
    setSendError('')
    const result = sendPortalChatMessage(
      activeChannel,
      draft,
      isMaster && !isGeneral ? sendTarget : undefined,
    )
    if (!result.ok) {
      setSendError(result.error)
      return
    }
    setDraft('')
    refreshMessages()
  }

  const activeChannelLabel =
    PORTAL_CHAT_CHANNELS.find((ch) => ch.id === activeChannel)?.label ??
    activeChannel

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="font-semibold">Team messenger</h2>
        <p className="text-sm text-slate-400">
          Discord-style channels for your project team
        </p>
      </div>

      <div className="flex h-[min(32rem,60vh)] min-h-[20rem]">
        <aside className="flex w-48 shrink-0 flex-col border-r border-white/10 bg-[#07101c]">
          <div className="px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Channels
            </p>
          </div>
          <nav className="space-y-0.5 overflow-y-auto px-2 pb-2">
            {PORTAL_CHAT_CHANNELS.map((channel) => {
              const active = activeChannel === channel.id
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Hash size={14} className="shrink-0 opacity-60" />
                  <span className="truncate">{channel.label}</span>
                </button>
              )
            })}
          </nav>

          {isGeneral && (
            <div className="min-h-0 flex-1 border-t border-white/10 p-2">
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Members — {generalMembers.length}
              </p>
              <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                {generalMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1"
                  >
                    {member.profileImageUrl &&
                    isDataUrlImage(member.profileImageUrl) ? (
                      <img
                        src={member.profileImageUrl}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5865F2]/30 text-[10px] font-bold text-white/90">
                        {memberInitials(member.name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-200">
                        {member.name}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isMaster && !isGeneral && (
            <div className="border-t border-white/10 p-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Filter
              </p>
              <ProfileRoleFilterSelect
                value={profileFilter}
                onChange={setProfileFilter}
                compact
              />
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#0a1628]">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3">
            <Hash size={16} className="text-slate-500" />
            <span className="font-semibold text-slate-200">{activeChannelLabel}</span>
            {isGeneral && (
              <span className="text-xs text-slate-500">
                {generalMembers.length} members
              </span>
            )}
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-slate-500">
                No messages in #{activeChannelLabel} yet. Start the conversation.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="group rounded-lg px-2 py-1 transition hover:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      className={`text-sm font-semibold ${authorColor(msg.authorName)}`}
                    >
                      {msg.authorName}
                    </span>
                    {isMaster && !isGeneral && profileFilter === 'all' && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {getProfileLabel(msg.ownerId)}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">
                      {formatPortalChatTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-300">
                    {msg.text}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 p-3">
            {isMaster && !isGeneral && profileOptions.length > 0 && (
              <div className="mb-2 flex items-center gap-2">
                <label
                  htmlFor="messenger-send-target"
                  className="text-[10px] font-medium uppercase tracking-wider text-slate-500"
                >
                  To workspace
                </label>
                <select
                  id="messenger-send-target"
                  value={sendTarget}
                  onChange={(e) => setSendTarget(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500/50"
                >
                  {profileOptions.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                rows={1}
                placeholder={`Message #${activeChannelLabel}…`}
                className="min-h-[2.5rem] flex-1 resize-none rounded-xl border border-white/10 bg-[#313338] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500/50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim()}
                className="flex shrink-0 items-center justify-center rounded-xl bg-blue-600 p-2.5 text-white transition hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
            {sendError && (
              <p className="mt-2 text-xs text-red-400">{sendError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
