// DS-GAP: MiniPreview — a miniature mockup of what a widget type looks like
// (a donut ring, a gauge arc, a stack of bars). Nothing in the DS draws one:
// Skeleton is a loading placeholder, HighlightIcon is a single glyph, and
// neither illustrates a chart shape. This is the one genuine gap in this file.
//
// WidgetGlyph and FreshnessBadge below are NOT gaps — they are thin wrappers
// over the real DS HighlightIcon and Tag. They live here anyway because the
// icon map they share has to have exactly one home.
//
// Why this file exists at all. Widget Library and Widget Marketplace each
// defined their own WidgetGlyph, FreshnessBadge and MiniPreview, and the copies
// had drifted:
//
//   WidgetGlyph    36×36 radius 9 on a 12%-primary tint, no border  (library)
//                  32×32 radius 8 on --surface, 1px border          (marketplace)
//   FreshnessBadge Tag variants success/informative/neutral         (library)
//                  raw colours --success/--primary/--alert          (marketplace)
//                  → "stale" was neutral grey in one, alert yellow in the other
//   SKELETON_ICON  disagreed on 6 of its 10 entries, so the same widget type
//                  showed a different icon depending on which screen you opened
//
// None of that is visible in a diff, because each screen looks internally
// consistent. It only shows up when you put the two screens side by side.
//
// Promotion: WidgetGlyph and FreshnessBadge should collapse into direct
// HighlightIcon / Tag calls once the widget catalog is settled (the wrappers
// only survive to keep the icon map single-source). MiniPreview is the piece
// that would graduate to src/components/ui/.

import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Tag } from "@/components/ui/tag"

/** The one icon map. A widget type gets the same glyph in every screen.
 *
 *  Where the two old maps disagreed, the entry below is the one that names the
 *  shape rather than a side effect of it — Kanban over LayoutGrid for a board,
 *  Filter over TrendingDown for a funnel (a funnel narrows; it does not
 *  decline), Hash over TrendingUp for a KPI (a KPI is one number, a trend is
 *  the Chart widget's job). These are design calls, not mechanical merges —
 *  change them here and every screen follows. */
export const WIDGET_SKELETON_ICON: Record<string, string> = {
  KPI:        "Hash",
  Chart:      "BarChart2",
  Feed:       "Rss",
  Gauge:      "Gauge",
  Donut:      "PieChart",
  Board:      "Kanban",
  Funnel:     "Filter",
  "Stat Row": "Rows3",
  Alerts:     "Bell",
  "Cost KPI": "DollarSign",
}

export type WidgetGlyphSize = "sm" | "md" | "lg"

/** The widget type's icon. A DS HighlightIcon, not a hand-rolled tile —
 *  sm is 24×24 radius 4. The first pass used md (32×32) because that is what
 *  the marketplace copy already measured, but against a card title at this
 *  density it read as the loudest thing on the card. Michael called it down to
 *  sm on 2026-09-03 — the glyph is a type marker, not the subject. */
export function WidgetGlyph({
  skeleton,
  size = "sm",
  className,
}: {
  skeleton: string
  size?: WidgetGlyphSize
  className?: string
}) {
  return (
    <HighlightIcon
      iconName={WIDGET_SKELETON_ICON[skeleton] ?? "Square"}
      variant="informative"
      size={size}
      className={className}
    />
  )
}

export type WidgetFreshness = "live" | "fresh" | "stale"

const FRESHNESS: Record<WidgetFreshness, { variant: "success" | "informative" | "neutral"; label: string }> = {
  live:  { variant: "success",     label: "Live"  },
  fresh: { variant: "informative", label: "Fresh" },
  // Neutral, not alert. Stale data is out of date, not wrong — reserving the
  // alert colour for real problems is what keeps it meaning anything.
  stale: { variant: "neutral",     label: "Stale" },
}

/** How current the widget's data is. A DS Tag — the colour carries the state,
 *  which is the Tag component's whole job. */
export function WidgetFreshnessBadge({ status }: { status: WidgetFreshness }) {
  const { variant, label } = FRESHNESS[status]
  return <Tag variant={variant} size="sm">{label}</Tag>
}

/** A miniature of the widget's shape, for catalog cards. Deliberately abstract:
 *  it says "this is a donut" without pretending to show real data. */
export function WidgetMiniPreview({ skeleton }: { skeleton: string }) {
  if (skeleton === "Donut") {
    return (
      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", border: "10px solid var(--primary)", opacity: 0.3 }} />
      </div>
    )
  }

  if (skeleton === "Gauge") {
    return (
      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 44, height: 22, borderRadius: "22px 22px 0 0",
            border: "9px solid var(--primary)", borderBottom: "none", opacity: 0.3,
          }}
        />
      </div>
    )
  }

  // Row-shaped types — a feed, an alert list, a board column
  if (skeleton === "Feed" || skeleton === "Alerts" || skeleton === "Board") {
    return (
      <div style={{ height: 52, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 5 }}>
        {[100, 78, 55].map((w, i) => (
          <div
            key={i}
            style={{ height: 8, borderRadius: 4, background: "var(--primary)", opacity: 0.18 + i * 0.1, width: `${w}%` }}
          />
        ))}
      </div>
    )
  }

  // Everything else reads as a bar chart
  return (
    <div style={{ height: 52, display: "flex", alignItems: "flex-end", gap: 3, padding: "6px 8px 0" }}>
      {[45, 65, 40, 85, 55, 70].map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0",
            background: "var(--primary)", opacity: 0.18 + i * 0.09,
          }}
        />
      ))}
    </div>
  )
}
