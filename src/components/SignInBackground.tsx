export default function SignInBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#050607] to-[#030508]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-35" />
      <div className="scanlines absolute inset-0 opacity-40" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,rgba(0,128,255,0.14),transparent_68%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_48%,rgba(204,255,0,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_50%,transparent_35%,rgba(5,6,7,0.85)_100%)]" />

      <div className="absolute left-1/2 top-[38%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0080ff]/[0.08] blur-[100px]" />
      <div className="absolute -left-24 bottom-16 h-72 w-72 rounded-full bg-[#0080ff]/[0.05] blur-[90px]" />
      <div className="absolute -right-24 bottom-20 h-64 w-64 rounded-full bg-[#ccff00]/[0.04] blur-[80px]" />

      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${i % 2 === 0 ? 'bg-[#0080ff]/50' : 'bg-[#ccff00]/40'}`}
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            top: `${12 + ((i * 13) % 70)}%`,
            left: `${18 + ((i * 17) % 64)}%`,
            opacity: 0.12 + (i % 4) * 0.06,
            animation: `pulse-glow ${2.5 + (i % 3)}s ease-in-out ${i * 0.25}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
