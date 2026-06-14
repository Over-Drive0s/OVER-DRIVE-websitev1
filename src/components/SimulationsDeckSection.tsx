import SourceCodeBackground from './SourceCodeBackground'
import { SimulatorWidgetCard, simulatorWidgets } from './SimulatorIconWidgets'

export default function SimulationsDeckSection() {
  return (
    <section className="relative shrink-0 overflow-hidden border-t border-white/[0.06]">
      <SourceCodeBackground />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="pt-6 sm:pt-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ccff00]/70">
              Simulations
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white lg:text-2xl">
              System Simulators
            </h2>
          </div>
        </div>

        <div className="pt-10 pb-6 sm:pt-12 sm:pb-8 lg:pt-14 lg:pb-10">
          <div className="simulations-deck-tray glow-brand relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 sm:p-5 lg:p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0080ff]/35 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ccff00]/20 to-transparent" />

            <div className="simulations-deck-screw pointer-events-none absolute left-3 top-3 h-2 w-2 rounded-full sm:left-4 sm:top-4" />
            <div className="simulations-deck-screw pointer-events-none absolute right-3 top-3 h-2 w-2 rounded-full sm:right-4 sm:top-4" />
            <div className="simulations-deck-screw pointer-events-none absolute bottom-3 left-3 h-2 w-2 rounded-full sm:bottom-4 sm:left-4" />
            <div className="simulations-deck-screw pointer-events-none absolute bottom-3 right-3 h-2 w-2 rounded-full sm:bottom-4 sm:right-4" />

            <div className="relative mb-4 sm:mb-5">
              <div className="simulations-deck-bezel flex items-center gap-2.5 rounded-lg border border-white/[0.06] px-3 py-2">
                <span className="h-2 w-2 animate-pulse-brand rounded-full bg-[#ccff00]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Overdrive IO · Simulations Deck
                </span>
              </div>
            </div>

            <div className="relative grid w-full grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {simulatorWidgets.map((meta) => (
                <div key={meta.id} className="relative flex flex-col items-center">
                  <div className="simulations-deck-well pointer-events-none absolute top-0 left-1/2 aspect-square w-[88%] max-w-[136px] -translate-x-1/2 sm:max-w-[150px] lg:max-w-[168px]" />
                  <SimulatorWidgetCard meta={meta} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
