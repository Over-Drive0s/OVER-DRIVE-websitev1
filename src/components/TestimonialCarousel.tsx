const testimonials = [
  {
    date: 'Nov 2018',
    quote:
      'Overdrive IO rebuilt our dispatch workflow from the ground up. We cut manual handoffs by half in the first quarter.',
    name: 'Marcus Chen',
    role: 'VP Operations',
    company: 'Northpoint Logistics',
  },
  {
    date: 'Mar 2019',
    quote:
      'Their team understood our floor operations better than any vendor we had worked with. Dashboards our supervisors actually use.',
    name: 'Sarah Whitfield',
    role: 'COO',
    company: 'Summit Manufacturing',
  },
  {
    date: 'Aug 2020',
    quote:
      'Integrations across ERP, inventory, and field apps finally talk to each other. Reporting went from days to minutes.',
    name: 'James Okonkwo',
    role: 'Director of IT',
    company: 'Covalent Systems',
  },
  {
    date: 'Feb 2021',
    quote:
      'We needed operational software that could scale with rapid growth. Overdrive IO delivered infrastructure, not just features.',
    name: 'Elena Vasquez',
    role: 'Head of Operations',
    company: 'Meridian Fleet',
  },
  {
    date: 'Jun 2022',
    quote:
      'Automations they built eliminated repetitive approval chains. Our team focuses on exceptions instead of data entry.',
    name: 'David Park',
    role: 'CTO',
    company: 'Apex Distribution',
  },
  {
    date: 'Jan 2023',
    quote:
      'Clean execution, clear documentation, and systems that hold up under real operational pressure. Rare in this space.',
    name: 'Rachel Morgan',
    role: 'Operations Lead',
    company: 'Clearline Health',
  },
  {
    date: 'Oct 2024',
    quote:
      'From showroom to service bay, Overdrive IO unified how we track jobs, inventory, and customer follow-ups.',
    name: 'Tom Bradley',
    role: 'General Manager',
    company: 'Harbor Automotive Group',
  },
  {
    date: 'Apr 2025',
    quote:
      'They treated our ops stack like product engineering — measurable outcomes, tight feedback loops, no fluff.',
    name: 'Nina Kapoor',
    role: 'VP Engineering',
    company: 'Fieldline Services',
  },
  {
    date: 'Feb 2026',
    quote:
      'Years in and they still iterate with us. The platform evolves as our workflows do.',
    name: 'Greg Holloway',
    role: 'Director of Systems',
    company: 'Ironbridge Industrial',
  },
]

function TestimonialCard({
  date,
  quote,
  name,
  role,
  company,
}: (typeof testimonials)[number]) {
  return (
    <article className="w-[340px] shrink-0 rounded-xl border border-white/[0.08] bg-[#080a0e]/80 px-6 py-5 backdrop-blur-sm sm:w-[380px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0080ff]">
          Client
        </span>
        <span className="rounded border border-white/10 px-2 py-0.5 text-[11px] text-white/40">
          {date}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-white/60">&ldquo;{quote}&rdquo;</p>
      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="mt-0.5 text-xs text-white/40">
          {role} · {company}
        </p>
      </div>
    </article>
  )
}

export default function TestimonialCarousel({ compact = false }: { compact?: boolean }) {
  const track = [...testimonials, ...testimonials]

  return (
    <section
      className={`relative z-10 shrink-0 border-t border-white/[0.06] bg-[#050607]/80 backdrop-blur-sm ${
        compact ? 'py-6' : 'py-16'
      }`}
    >
      <div className={`mx-auto max-w-7xl px-6 ${compact ? 'mb-5' : 'mb-10'}`}>
        <div className="mb-3 h-px w-8 bg-[#0080ff]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
          Testimonials
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050607] to-transparent sm:w-24"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050607] to-transparent sm:w-24"
          aria-hidden="true"
        />

        <div className="flex w-max animate-marquee-left gap-5 px-6">
          {track.map((item, index) => (
            <TestimonialCard key={`${item.date}-${item.name}-${index}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
