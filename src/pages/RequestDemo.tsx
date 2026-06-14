import { ArrowUpRight, CheckCircle2, Clock, MessageSquare, Sparkles } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { saveAppendOnlyBinRecord } from '../lib/dataBins'

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10)

  if (digits.length === 0) return ''
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const budgetOptions = [
  'Under $25K',
  '$25K – $50K',
  '$50K – $100K',
  '$100K – $250K',
  '$250K+',
]

const timelineOptions = [
  'ASAP (within 30 days)',
  '1 – 3 months',
  '3 – 6 months',
  '6+ months',
  'Exploring / no timeline yet',
]

const nextSteps = [
  {
    step: '01',
    title: 'Submit your request',
    description: 'Tell us about your operations, tools, and goals.',
  },
  {
    step: '02',
    title: 'We review your requirements',
    description: 'Our team assesses fit and maps a tailored approach within 24–48 hours.',
  },
  {
    step: '03',
    title: 'Tailored demo & proposal',
    description: 'Walk through a custom demo built around your workflow and priorities.',
  },
]

const trustStats = [
  { value: '< 24h', label: 'Avg. response time' },
  { value: '40+', label: 'Projects delivered' },
  { value: '99.9%', label: 'Platform uptime' },
]

const inputClassName =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-[#0080ff]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#0080ff]/20'

const labelClassName =
  'mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40'

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#0080ff]/25 bg-[#0080ff]/10 text-[11px] font-semibold text-[#0080ff]">
          {number}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {description && <p className="mt-1 text-xs text-white/40">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

export default function RequestDemo() {
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await saveAppendOnlyBinRecord('demo-requests', {
      name: String(formData.get('name') ?? ''),
      company: String(formData.get('company') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      needs: String(formData.get('needs') ?? ''),
      budget: String(formData.get('budget') ?? ''),
      timeline: String(formData.get('timeline') ?? ''),
      submittedAt: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#050607]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050810] via-[#050607] to-[#030508]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_40%,rgba(0,128,255,0.12),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(204,255,0,0.05),transparent_60%)]" />
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#0080ff]/[0.06] blur-[120px]" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-[#ccff00]/[0.04] blur-[100px]" />
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-6 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:py-12">
        <div className="flex flex-col justify-center">
          <div className="mb-5">
            <div className="mb-3 h-px w-8 bg-[#0080ff]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
              Request Demo
            </p>
          </div>

          <h1 className="max-w-lg text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white lg:text-[2.65rem]">
            Tell us what you need{' '}
            <span className="text-[#0080ff]">built</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/50">
            Share your project details and our team will follow up with a tailored demo,
            scoped proposal, and clear next steps.
          </p>

          <div className="mt-10 space-y-5">
            {nextSteps.map((item) => (
              <div key={item.step} className="flex gap-4">
                <span className="text-[11px] font-semibold tracking-wider text-[#ccff00]/70">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/40">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {trustStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/[0.08] bg-[#080a0e]/60 px-3 py-3 backdrop-blur-sm"
              >
                <p className="text-base font-semibold text-[#ccff00] lg:text-lg">{stat.value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          {submitted ? (
            <div className="rounded-xl border border-[#ccff00]/20 bg-[#080a0e]/80 p-10 text-center shadow-[0_0_80px_rgba(204,255,0,0.08),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10">
                <CheckCircle2 size={28} className="text-[#ccff00]" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold text-white">Request received</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
                Thanks for reaching out. Our team will review your details and respond within
                24–48 hours with a tailored demo plan.
              </p>
              <div className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs text-white/45">
                <Clock size={14} className="text-[#0080ff]" />
                Expected response: 1–2 business days
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-white/[0.1] bg-[#080a0e]/75 p-7 shadow-[0_0_80px_rgba(0,128,255,0.08),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md lg:p-8"
            >
              <div className="mb-7 flex items-center gap-3 border-b border-white/[0.06] pb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#0080ff]/25 bg-[#0080ff]/10">
                  <MessageSquare size={18} className="text-[#0080ff]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Project intake form</p>
                  <p className="text-xs text-white/40">All fields marked required help us scope faster</p>
                </div>
              </div>

              <div className="space-y-8">
                <FormSection number="1" title="Contact details" description="Who should we follow up with?">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className={labelClassName}>
                        Name <span className="text-[#0080ff]">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Jane Smith"
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className={labelClassName}>
                        Company <span className="text-[#0080ff]">*</span>
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        required
                        placeholder="Acme Corp"
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelClassName}>
                        Email <span className="text-[#0080ff]">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="jane@acme.com"
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClassName}>
                        Phone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        placeholder="(555) 123-4567"
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  number="2"
                  title="Project scope"
                  description="What operational challenges are you trying to solve?"
                >
                  <div>
                    <label htmlFor="needs" className={labelClassName}>
                      What do you need built? <span className="text-[#0080ff]">*</span>
                    </label>
                    <textarea
                      id="needs"
                      name="needs"
                      required
                      rows={4}
                      placeholder="Describe your operational challenges, current tools, integrations, and what you want to achieve..."
                      className={`${inputClassName} resize-none`}
                    />
                    <p className="mt-2 text-[11px] text-white/30">
                      Include systems you use today (CRM, ERP, inventory, etc.) if relevant.
                    </p>
                  </div>
                </FormSection>

                <FormSection number="3" title="Budget & timeline" description="Helps us recommend the right scope.">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="budget" className={labelClassName}>
                        Budget range
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        className={`${inputClassName} appearance-none bg-[#080a0e]`}
                        defaultValue=""
                      >
                        <option value="" disabled className="bg-[#090b0e]">
                          Select budget range
                        </option>
                        {budgetOptions.map((option) => (
                          <option key={option} value={option} className="bg-[#090b0e]">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timeline" className={labelClassName}>
                        Timeline
                      </label>
                      <select
                        id="timeline"
                        name="timeline"
                        className={`${inputClassName} appearance-none bg-[#080a0e]`}
                        defaultValue=""
                      >
                        <option value="" disabled className="bg-[#090b0e]">
                          Select timeline
                        </option>
                        {timelineOptions.map((option) => (
                          <option key={option} value={option} className="bg-[#090b0e]">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </FormSection>
              </div>

              <div className="mt-8 space-y-4 border-t border-white/[0.06] pt-6">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#0080ff] py-4 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                >
                  Submit Request
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>

                <p className="flex items-center justify-center gap-2 text-center text-[11px] text-white/30">
                  <Sparkles size={12} className="text-[#ccff00]/60" />
                  No commitment required · Confidential review
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
