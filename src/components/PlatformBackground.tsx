export default function PlatformBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#050810] via-[#050607] to-[#030508]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="scanlines absolute inset-0 opacity-60" />

      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#0080ff]/[0.06] blur-[120px]" />
      <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-[#ccff00]/[0.04] blur-[100px]" />

      <svg
        className="absolute right-0 top-0 h-full w-2/3 opacity-70"
        viewBox="0 0 800 600"
        fill="none"
        preserveAspectRatio="xMaxYMid slice"
      >
        <path d="M820 -20 C620 180, 680 380, 420 580" stroke="url(#arcBlue)" strokeWidth="1.5" />
        <path d="M900 60 C700 220, 750 420, 480 620" stroke="url(#arcLime)" strokeWidth="1" />
        <path d="M750 20 C580 160, 620 340, 380 520" stroke="url(#arcMix)" strokeWidth="0.8" />
        <defs>
          <linearGradient id="arcBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,128,255,0)" />
            <stop offset="50%" stopColor="rgba(0,128,255,0.35)" />
            <stop offset="100%" stopColor="rgba(0,128,255,0)" />
          </linearGradient>
          <linearGradient id="arcLime" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(204,255,0,0)" />
            <stop offset="50%" stopColor="rgba(204,255,0,0.2)" />
            <stop offset="100%" stopColor="rgba(204,255,0,0)" />
          </linearGradient>
          <linearGradient id="arcMix" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,128,255,0.15)" />
            <stop offset="100%" stopColor="rgba(204,255,0,0.1)" />
          </linearGradient>
        </defs>
      </svg>

      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${i % 2 === 0 ? 'bg-[#0080ff]/40' : 'bg-[#ccff00]/30'}`}
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            top: `${8 + ((i * 17) % 75)}%`,
            left: `${55 + ((i * 11) % 40)}%`,
            opacity: 0.15 + (i % 5) * 0.08,
            animation: `pulse-glow ${2 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
