import { useRef, useState, useEffect } from "react"
import { HighlightCard, type HighlightCardStyle } from "@/components/ui/highlight-card"

export interface MetricCardDef {
  label:     string
  value:     string | number
  iconName?: string
  style?:    HighlightCardStyle
}

interface AdaptiveMetricGridProps {
  cards:      MetricCardDef[]
  /** Container width (px) below which layout switches from 3-col to 2+1. Default: 310 */
  threshold?: number
  className?: string
}

/**
 * 3-col HighlightCard grid that degrades to 2+1 when the container is extremely narrow.
 * Truncation is handled by HighlightCard internally (truncate + Tooltip on the label).
 * Uses ResizeObserver so it responds to panel drag-resize in real time.
 */
export function AdaptiveMetricGrid({ cards, threshold = 310, className }: AdaptiveMetricGridProps) {
  const containerRef               = useRef<HTMLDivElement>(null)
  const [containerWidth, setWidth] = useState(9999)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isNarrow = containerWidth < threshold

  return (
    <div ref={containerRef} className={className}>
      {!isNarrow ? (
        <div className="grid gap-[8px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))" }}>
          {cards.map((c, i) => (
            <HighlightCard key={i} label={c.label} value={c.value} iconName={c.iconName} style={c.style} className="!w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {/* Row 1: first two cards side by side */}
          <div className="grid grid-cols-2 gap-[8px]">
            {cards.slice(0, 2).map((c, i) => (
              <HighlightCard key={i} label={c.label} value={c.value} iconName={c.iconName} style={c.style} className="!w-full" />
            ))}
          </div>
          {/* Row 2: third card full-width */}
          {cards.length > 2 && (
            <HighlightCard label={cards[2].label} value={cards[2].value} iconName={cards[2].iconName} style={cards[2].style} className="!w-full" />
          )}
        </div>
      )}
    </div>
  )
}
