interface PageHeaderProps {
  label?: string
  title: string
  description: string
}

export default function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-28">
      {label && (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          {label}
        </p>
      )}
      <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-white md:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/55">{description}</p>
    </div>
  )
}
