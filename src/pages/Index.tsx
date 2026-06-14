import { Link } from 'react-router-dom'
import IndexHeroDashboard from '../components/IndexHeroDashboard'
import PlatformBackground from '../components/PlatformBackground'
import SimulationsDeckSection from '../components/SimulationsDeckSection'

export default function Index() {
  return (
    <div
      data-scroll-root
      className="relative flex flex-col bg-[#050607]"
    >
      <div className="relative shrink-0 border-b border-white/[0.06]">
        <PlatformBackground />

        <section className="relative mx-auto grid max-w-7xl gap-8 px-6 pb-10 pt-8 lg:grid-cols-[42%_58%] lg:items-center lg:gap-10 lg:pb-12 lg:pt-10">
          <div className="z-10 flex flex-col justify-center">
            <div className="max-w-2xl">
              <div className="mb-5">
                <div className="mb-3 h-px w-8 bg-[#0080ff]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
                  Simulator Index
                </p>
              </div>

              <h1 className="text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white lg:text-[2.85rem]">
                Platform-built{' '}
                <span className="text-[#0080ff]">system simulators</span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/50">
                Six live and in-progress simulators — each a self-contained operational environment
                designed, built, and deployed on Overdrive IO. Use them as launch icons for demos,
                sales, and onboarding.
              </p>

              <div className="mt-8">
                <Link
                  to="/deployments"
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/60 transition-all duration-200 hover:bg-white hover:text-black"
                >
                  View deployments
                </Link>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center lg:justify-end">
            <IndexHeroDashboard />
          </div>
        </section>
      </div>

      <SimulationsDeckSection />
    </div>
  )
}
