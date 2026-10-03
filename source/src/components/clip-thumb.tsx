import { cn } from "cn"

// Generated placeholder thumbnail (inline SVG, no network).
export function ClipThumb({
  jersey,
  hue,
  time,
  className,
  big = false,
}: {
  jersey: string
  hue: number
  time?: string
  className?: string
  big?: boolean
}) {
  const unsure = jersey.includes("?")
  const gid = `g-${hue}-${jersey.replace(/\W/g, "x")}-${big ? "b" : "s"}`
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
      <svg viewBox="0 0 160 90" className="block h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`hsl(${hue} 45% 52%)`} />
            <stop offset="1" stopColor={`hsl(${hue} 50% 34%)`} />
          </linearGradient>
        </defs>
        <rect width="160" height="90" fill={`url(#${gid})`} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 40} width="20" height="90" fill="white" opacity="0.05" />
        ))}
        <line x1="0" y1="62" x2="160" y2="62" stroke="white" strokeOpacity=".5" strokeWidth="1" />
        <circle cx="80" cy="62" r="16" fill="none" stroke="white" strokeOpacity=".4" />
        {/* player */}
        <circle cx="80" cy="22" r="7" fill="hsl(30 40% 70%)" />
        <path d="M66 34 Q80 28 94 34 L97 62 L63 62 Z" fill="hsl(220 70% 45%)" />
        <text
          x="80"
          y="53"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="white"
          fontFamily="Inter Variable, sans-serif"
          style={unsure ? { filter: "blur(0.6px)" } : undefined}
        >
          {jersey}
        </text>
        <circle cx="118" cy="74" r="4" fill="white" />
      </svg>
      {time && (
        <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[10px] text-white">
          {time}
        </span>
      )}
    </div>
  )
}
