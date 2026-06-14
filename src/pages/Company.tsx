import { Eye, Rocket, Scale, Target, Zap } from 'lucide-react'
import CTASection from '../components/CTASection'
import PageHeader from '../components/PageHeader'

const process = [
  {
    step: '01',
    title: 'Audit',
    description:
      'We map your current systems, workflows, pain points, and data flows to understand where you are today.',
  },
  {
    step: '02',
    title: 'Plan',
    description:
      'We design the architecture, define priorities, and build a phased roadmap aligned with your business goals.',
  },
  {
    step: '03',
    title: 'Build',
    description:
      'Our engineering team builds dashboards, automations, integrations, and infrastructure to spec.',
  },
  {
    step: '04',
    title: 'Optimize',
    description:
      'We monitor performance, iterate on workflows, and scale the system as your operations grow.',
  },
]

const values = [
  {
    icon: <Eye size={20} strokeWidth={1.5} />,
    title: 'Clarity',
    description: 'Every system we build gives teams a clear view of what is happening and what needs attention.',
  },
  {
    icon: <Target size={20} strokeWidth={1.5} />,
    title: 'Control',
    description: 'Operational software should put decision-makers in command — not at the mercy of fragmented tools.',
  },
  {
    icon: <Scale size={20} strokeWidth={1.5} />,
    title: 'Scale',
    description: 'We design infrastructure that grows with your business, not systems that break under volume.',
  },
  {
    icon: <Rocket size={20} strokeWidth={1.5} />,
    title: 'Execution',
    description: 'We ship working software. Strategy without delivery is just documentation.',
  },
]

export default function Company() {
  return (
    <>
      <PageHeader
        label="Company"
        title="Consulting and engineering for operational software"
        description="Overdrive IO is a consulting and engineering company that builds business systems, apps, dashboards, automations, integrations, and operational software infrastructure."
      />

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">About Overdrive IO</h2>
              <p className="text-base leading-8 text-white/55">
                We work with operations-driven businesses that have outgrown spreadsheets,
                manual processes, and disconnected tools. Our team combines consulting
                discipline with engineering execution to deliver systems that actually
                run the business.
              </p>
              <p className="mt-4 text-base leading-8 text-white/55">
                We are not a creative agency and we do not sell templates. We build
                operational infrastructure — the dashboards, automations, and integrations
                that keep your team aligned and your data accurate.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">Mission</h2>
              <p className="text-base leading-8 text-white/55">
                To give operations teams the software infrastructure they deserve —
                unified, reliable, and built for how they actually work. We believe
                operational excellence starts with operational clarity.
              </p>
              <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-3 flex items-center gap-2 text-blue-400">
                  <Zap size={18} />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    Our Approach
                  </span>
                </div>
                <p className="text-sm leading-7 text-white/50">
                  Consulting + engineering under one roof. We audit your operations,
                  design the system architecture, and build it — no handoffs, no
                  miscommunication between strategy and code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <h2 className="mb-12 text-2xl font-semibold text-white md:text-3xl">
            Our process
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  {item.step}
                </span>
                <h3 className="mt-3 mb-2 text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-7 text-white/50">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <h2 className="mb-12 text-2xl font-semibold text-white md:text-3xl">Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="mb-4 text-white/70">{value.icon}</div>
                <h3 className="mb-2 text-base font-semibold text-white">{value.title}</h3>
                <p className="text-sm leading-7 text-white/50">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Work with Overdrive IO"
        description="Whether you need a single dashboard or a full operational platform, we are ready to build."
        primaryLabel="Request Demo"
      />
    </>
  )
}
