import { useEffect, useState } from 'react'

type Tab = 'whop' | 'discord'

const whopProducts = [
  { name: 'Foundations Course', price: '$97/mo', enrolled: 412, active: true },
  { name: 'Pro Trader Mastermind', price: '$297/mo', enrolled: 186, active: false },
  { name: 'Live Session Pass', price: '$49/mo', enrolled: 244, active: false },
]

const discordChannels = [
  { id: 'welcome', label: 'welcome', unread: false },
  { id: 'course-hub', label: 'course-hub', unread: true },
  { id: 'live-trades', label: 'live-trades', unread: true },
  { id: 'wins', label: 'wins', unread: false },
]

const channelMessages: Record<string, { user: string; text: string; time: string }[]> = {
  welcome: [
    { user: 'Alex', text: 'Just joined — excited to learn!', time: '2m' },
    { user: 'Mod', text: 'Welcome! Start in #course-hub', time: '1m' },
  ],
  'course-hub': [
    { user: 'Jordan', text: 'Module 3 dropped — check Whop', time: '4m' },
    { user: 'Sam', text: 'Risk mgmt worksheet is 🔥', time: '2m' },
  ],
  'live-trades': [
    { user: 'Coach', text: 'ES long setup forming — A grade', time: 'Live' },
    { user: 'Riley', text: 'In at 5245, stop 5240', time: 'now' },
  ],
  wins: [
    { user: 'Casey', text: '+3.2R on NQ breakout 🎯', time: '8m' },
    { user: 'Morgan', text: 'First green week!', time: '5m' },
  ],
}

const onlineMembers = ['JK', 'AL', 'SR', 'TM', '+842']

function WhopLogo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-label="Whop">
      <rect width="24" height="24" rx="6" fill="#FA4621" />
      <path
        d="M6.5 16V8.2L9.8 13.4L13.1 8.2V16H15V7H12.6L9.8 11.6L7 7H4.5V16H6.5ZM17.2 16L19.5 7H17.3L15.8 13.1L14.3 7H12.1L14.4 16H17.2Z"
        fill="white"
      />
    </svg>
  )
}

function DiscordLogo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#5865F2" aria-label="Discord">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export default function CourseKitPreview() {
  const [tab, setTab] = useState<Tab>('whop')
  const [activeChannel, setActiveChannel] = useState('course-hub')
  const [activeProduct, setActiveProduct] = useState(0)
  const [mrr, setMrr] = useState(48200)

  useEffect(() => {
    const id = window.setInterval(() => {
      setMrr((v) => v + (Math.random() > 0.55 ? 97 : 0))
    }, 2800)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-violet-500/20 bg-[#0a0812]">
      {/* Platform tabs */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0e0c14] px-2 py-1.5">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab('whop')}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
              tab === 'whop'
                ? 'bg-[#FA4621]/15 text-[#ff7a55] ring-1 ring-[#FA4621]/30'
                : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
            }`}
          >
            <WhopLogo className="h-3.5 w-3.5" />
            Whop
          </button>
          <button
            type="button"
            onClick={() => setTab('discord')}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
              tab === 'discord'
                ? 'bg-[#5865F2]/15 text-[#8b9cff] ring-1 ring-[#5865F2]/30'
                : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
            }`}
          >
            <DiscordLogo className="h-3.5 w-3.5" />
            Discord
          </button>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Synced
        </span>
      </div>

      {tab === 'whop' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="grid shrink-0 grid-cols-3 gap-1.5 border-b border-white/[0.06] p-2">
            {[
              { label: 'MRR', value: `$${mrr.toLocaleString()}`, accent: true },
              { label: 'Members', value: '842' },
              { label: 'Products', value: '3 live' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-md border px-2 py-1.5 ${
                  kpi.accent
                    ? 'border-[#FA4621]/25 bg-[#FA4621]/[0.08]'
                    : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                <p className="text-[8px] uppercase tracking-wider text-white/35">{kpi.label}</p>
                <p className={`mt-0.5 text-xs font-semibold ${kpi.accent ? 'text-[#ff7a55]' : 'text-white/85'}`}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-2 py-2">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/35">
              Storefront products
            </p>
            <div className="space-y-1.5 overflow-y-auto">
              {whopProducts.map((product, i) => (
                <button
                  key={product.name}
                  type="button"
                  onClick={() => setActiveProduct(i)}
                  className={`w-full rounded-md border px-2.5 py-2 text-left transition-all ${
                    activeProduct === i
                      ? 'border-[#FA4621]/35 bg-[#FA4621]/[0.1] shadow-[0_0_12px_rgba(250,70,33,0.12)]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-[#FA4621]/20 hover:bg-[#FA4621]/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[11px] font-medium text-white/90">{product.name}</p>
                    {product.active && (
                      <span className="shrink-0 rounded bg-emerald-500/15 px-1 py-0.5 text-[8px] font-semibold text-emerald-400">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#ff7a55]">{product.price}</span>
                    <span className="text-[9px] text-white/35">{product.enrolled} enrolled</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="shrink-0 border-t border-white/[0.06] px-2 py-1.5">
            <div className="flex items-center justify-between rounded-md bg-[#FA4621]/10 px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <WhopLogo className="h-4 w-4" />
                <span className="text-[10px] text-white/70">Embedded checkout active</span>
              </div>
              <span className="text-[9px] font-medium text-[#ff7a55]">whop.com →</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Discord sidebar */}
          <div className="flex w-[38%] shrink-0 flex-col border-r border-white/[0.06] bg-[#1e1f22]">
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-2 py-2">
              <DiscordLogo className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-white/90">Trade Academy</p>
                <p className="text-[8px] text-emerald-400">● 128 online</p>
              </div>
            </div>
            <div className="flex-1 space-y-0.5 overflow-y-auto p-1.5">
              {discordChannels.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannel(ch.id)}
                  className={`flex w-full items-center gap-1 rounded px-1.5 py-1 text-left text-[10px] transition-colors ${
                    activeChannel === ch.id
                      ? 'bg-[#5865F2]/20 text-white'
                      : 'text-white/45 hover:bg-white/[0.06] hover:text-white/75'
                  }`}
                >
                  <span className="text-white/30">#</span>
                  <span className="truncate">{ch.label}</span>
                  {ch.unread && activeChannel !== ch.id && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-white/[0.06] p-2">
              <p className="mb-1 text-[8px] uppercase tracking-wider text-white/30">Online</p>
              <div className="flex -space-x-1">
                {onlineMembers.map((m) => (
                  <span
                    key={m}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-[#1e1f22] bg-[#5865F2]/30 text-[7px] font-bold text-white/80"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Discord chat */}
          <div className="flex min-w-0 flex-1 flex-col bg-[#313338]">
            <div className="flex shrink-0 items-center gap-1 border-b border-white/[0.06] px-2 py-1.5">
              <span className="text-white/30">#</span>
              <span className="text-[10px] font-semibold text-white/85">{activeChannel}</span>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
              {(channelMessages[activeChannel] ?? []).map((msg) => (
                <div key={`${msg.user}-${msg.text}`} className="group rounded px-1 py-0.5 hover:bg-white/[0.04]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-semibold text-[#8b9cff]">{msg.user}</span>
                    <span className="text-[8px] text-white/25">{msg.time}</span>
                  </div>
                  <p className="text-[10px] leading-snug text-white/70">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-white/[0.06] p-2">
              <div className="rounded-md bg-[#383a40] px-2 py-1.5 text-[9px] text-white/30">
                Message #{activeChannel}…
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
