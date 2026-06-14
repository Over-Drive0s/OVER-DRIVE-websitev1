import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { SimulatorWidgetCard, simulatorWidgets } from './SimulatorIconWidgets'

const VISIBLE_CARDS = 6

function SimulatorsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(simulatorWidgets.length / VISIBLE_CARDS))
  const canPrev = page > 0
  const canNext = page < pageCount - 1
  const showCarouselNav = pageCount > 1

  const getCarouselGap = () => (window.innerWidth >= 1024 ? 16 : 8)

  const getCardStep = () => {
    const track = trackRef.current
    if (!track) return 0
    const card = track.querySelector<HTMLElement>('[data-carousel-card]')
    if (!card) return 0
    return card.offsetWidth + getCarouselGap()
  }

  const getPageStartIndex = (pageIndex: number) =>
    Math.min(pageIndex * VISIBLE_CARDS, Math.max(0, simulatorWidgets.length - VISIBLE_CARDS))

  const scrollLeftToPage = (scrollLeft: number) => {
    const step = getCardStep()
    if (!step) return 0
    const startIndex = Math.round(scrollLeft / step)
    for (let pageIndex = pageCount - 1; pageIndex >= 0; pageIndex -= 1) {
      if (startIndex >= getPageStartIndex(pageIndex)) return pageIndex
    }
    return 0
  }

  const goToPage = (nextPage: number) => {
    const clamped = Math.max(0, Math.min(pageCount - 1, nextPage))
    const track = trackRef.current
    const step = getCardStep()
    if (!track || !step) {
      setPage(clamped)
      return
    }

    setPage(clamped)
    track.scrollTo({ left: getPageStartIndex(clamped) * step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {showCarouselNav && (
        <>
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={!canPrev}
            aria-label="Previous simulators"
            className="absolute -left-3 top-[calc(50%-28px)] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#080a0e]/95 text-white/60 shadow-lg transition hover:border-[#0080ff]/40 hover:text-[#0080ff] disabled:pointer-events-none disabled:opacity-25 lg:-left-4"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={!canNext}
            aria-label="Next simulators"
            className="absolute -right-3 top-[calc(50%-28px)] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#080a0e]/95 text-white/60 shadow-lg transition hover:border-[#0080ff]/40 hover:text-[#0080ff] disabled:pointer-events-none disabled:opacity-25 lg:-right-4"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-0.5 py-4 lg:gap-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowY: 'visible' }}
        onScroll={() => {
          const track = trackRef.current
          if (!track) return
          setPage(scrollLeftToPage(track.scrollLeft))
        }}
      >
        {simulatorWidgets.map((meta) => (
          <div
            key={meta.id}
            data-carousel-card
            className="w-[calc((100%-2.5rem)/6)] shrink-0 snap-start lg:w-[calc((100%-5rem)/6)]"
          >
            <SimulatorWidgetCard
              meta={meta}
              compact
              linkState={meta.id === 'dealer-dms' ? { fromSystems: true } : undefined}
            />
          </div>
        ))}
      </div>

      {showCarouselNav && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToPage(index)}
              aria-label={`Go to page ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                page === index
                  ? 'w-6 bg-[#0080ff] shadow-[0_0_8px_rgba(0,128,255,0.5)]'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SystemsSimulationsDeckSection() {
  return (
    <section className="relative flex-1 border-b border-white/[0.06]">
      <div className="pointer-events-none absolute inset-0 bg-cross-pattern opacity-15" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[#0080ff]/[0.04] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-8 lg:py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ccff00]/70">
              Simulations
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-white lg:text-2xl">
              System Simulators
            </h2>
          </div>
          <span className="hidden text-[11px] text-white/30 sm:block">
            Swipe or use arrows to browse
          </span>
        </div>

        <div className="stream-deck-tray glow-brand relative rounded-2xl border border-white/[0.08] p-4 lg:p-5">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0080ff]/30 to-transparent" />
          </div>

          <div className="relative mb-4 flex items-center gap-2 px-1">
            <span className="h-2 w-2 animate-pulse-brand rounded-full bg-[#ccff00]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Overdrive IO · Simulations Deck
            </span>
          </div>

          <div className="relative px-0.5 pt-1">
            <SimulatorsCarousel />
          </div>
        </div>
      </div>
    </section>
  )
}
