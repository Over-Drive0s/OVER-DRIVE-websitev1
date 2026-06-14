import {
  BookOpen,
  Bot,
  MessageSquare,
  Trophy,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import TradeStrykeScoreboardPreview from './TradeStrykeScoreboardPreview'
import TradeZellaJournalPreview from './TradeZellaJournalPreview'
import BotTradingChartPreview from './BotTradingChartPreview'
import CourseKitPreview from './CourseKitPreview'

interface TradingPanel {
  id: string
  title: string
  subtitle: string
  tag: string
  icon: LucideIcon
  accent: 'blue' | 'lime' | 'violet' | 'cyan'
}

const panels: TradingPanel[] = [
  {
    id: 'scoreboard',
    title: 'Trading Scoreboard',
    subtitle: 'Weighted confluence scoring with factor weights and A+ to C- trade grades.',
    tag: 'Trade Stryke',
    icon: Trophy,
    accent: 'blue',
  },
  {
    id: 'journal',
    title: 'Trading Journal',
    subtitle: 'Session P&L, performance heatmap calendar, OD discipline score, and strategy-tagged trade history.',
    tag: 'Journal & analytics',
    icon: BookOpen,
    accent: 'violet',
  },
  {
    id: 'bot',
    title: 'Auto Trading Bot',
    subtitle: 'Runs your strategy automatically — monitors positions, risk limits, and execution.',
    tag: 'Automated execution',
    icon: Bot,
    accent: 'cyan',
  },
  {
    id: 'course-kit',
    title: 'Course Infrastructure Kit',
    subtitle: 'Whop storefront + Discord community — sell courses, sync members, and engage in one kit.',
    tag: 'Creator monetization',
    icon: MessageSquare,
    accent: 'violet',
  },
]

const accentMap = {
  blue: {
    border: 'border-[#0080ff]/25 hover:border-[#0080ff]/45',
    glow: 'hover:shadow-[0_0_40px_rgba(0,128,255,0.12)]',
    icon: 'text-[#0080ff] bg-[#0080ff]/10 border-[#0080ff]/25',
    tag: 'bg-[#0080ff]/10 text-[#0080ff] border-[#0080ff]/20',
    preview: 'from-[#0080ff]/10 to-transparent',
  },
  lime: {
    border: 'border-[#ccff00]/25 hover:border-[#ccff00]/45',
    glow: 'hover:shadow-[0_0_40px_rgba(204,255,0,0.1)]',
    icon: 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/25',
    tag: 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20',
    preview: 'from-[#ccff00]/10 to-transparent',
  },
  cyan: {
    border: 'border-cyan-500/25 hover:border-cyan-500/45',
    glow: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.12)]',
    icon: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
    tag: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    preview: 'from-cyan-500/10 to-transparent',
  },
  violet: {
    border: 'border-violet-500/25 hover:border-violet-500/45',
    glow: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]',
    icon: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
    tag: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    preview: 'from-violet-500/10 to-transparent',
  },
}

function JournalPreview() {
  return <TradeZellaJournalPreview />
}

function BotPreview() {
  return <BotTradingChartPreview />
}

const previewMap = {
  scoreboard: TradeStrykeScoreboardPreview,
  journal: JournalPreview,
  bot: BotPreview,
  'course-kit': CourseKitPreview,
}

function TradingPanelCard({ panel }: { panel: TradingPanel }) {
  const styles = accentMap[panel.accent]
  const Preview = previewMap[panel.id as keyof typeof previewMap]
  const Icon = panel.icon

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-[#080a0e]/80 transition-all duration-300 ${styles.border} ${styles.glow}`}
    >
      <div className={`relative h-[240px] overflow-hidden bg-gradient-to-b p-3 sm:h-[260px] sm:p-4 ${styles.preview}`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
        <div className="relative h-full min-h-0 overflow-hidden">
          <Preview />
        </div>
      </div>

      <div className="border-t border-white/[0.06] p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className={`rounded-lg border p-2 ${styles.icon}`}>
            <Icon size={18} />
          </div>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles.tag}`}>
            {panel.tag}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white sm:text-xl">{panel.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/50">{panel.subtitle}</p>
      </div>
    </div>
  )
}

export default function TradingPanelCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
      {panels.map((panel) => (
        <TradingPanelCard key={panel.id} panel={panel} />
      ))}
    </div>
  )
}
