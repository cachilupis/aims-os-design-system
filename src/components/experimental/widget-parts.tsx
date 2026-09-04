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

/** A miniature of the widget's shape, for catalog cards. Thin wrapper — the
 *  shapes themselves are shared with the builder's live preview below. */
export function WidgetMiniPreview({ skeleton }: { skeleton: string }) {
  return <WidgetShapePreview shape={SHAPE_FOR_SKELETON[skeleton] ?? "bars"} height={52} />
}

// ── Widget shapes ───────────────────────────────────────────────────────────
// One set of shapes, drawn at whatever height the caller needs: 52px for a
// catalog thumbnail, 120px for the builder's live preview.
//
// Three screens used to draw these independently. The builder's set was the
// richest — a real conic-gradient pie, a gauge arc, a heatmap grid — so it is
// the one that survived; the catalog's thinner set now renders from here too.
//
// Two vocabularies map in, because there are still two. The builder names a
// widget by its render shape ("bar", "pie", "heatmap"); the catalog names it
// by identity ("Chart", "Donut", "Cost KPI"). Reconciling those is a product
// decision that has not been made — see the widget vocabulary audit. Until it
// is, both maps live here side by side, which at least keeps the *drawing*
// identical no matter which name you arrive with.

export type WidgetShape = "kpi" | "bars" | "pie" | "donut" | "gauge" | "grid" | "rows"

/** Builder vocabulary — the shape you pick when authoring a widget. */
export const SHAPE_FOR_BUILDER_TYPE: Record<string, WidgetShape> = {
  kpi: "kpi", costkpi: "kpi", summary: "kpi",
  bar: "bars", line: "bars", table: "rows", list: "rows", "record-card": "rows",
  pie: "pie",
  gauge: "gauge",
  heatmap: "grid", scatter: "grid", map: "grid",
}

/** Catalog vocabulary — the identity a widget is filed under. */
export const SHAPE_FOR_SKELETON: Record<string, WidgetShape> = {
  KPI: "kpi", "Cost KPI": "kpi", "Stat Row": "kpi",
  Chart: "bars", Funnel: "bars",
  Donut: "donut",
  Gauge: "gauge",
  Feed: "rows", Alerts: "rows", Board: "rows",
}

const BARS  = [55, 75, 45, 80, 60, 70, 50, 65]
const CELLS = [0.8,0.2,0.5,0.9,0.3,0.6,0.1,0.7,0.4,0.8,0.6,0.2,0.9,0.5,0.3,0.7,0.1,0.8,0.4,0.6,0.2,0.9,0.5,0.3]

/** Draws a widget's shape. Abstract on purpose — it says "this is a donut"
 *  without pretending to show real data.
 *
 *  `accent` lets the builder preview follow the colour the user picked; the
 *  catalog leaves it unset and gets --primary. */
export function WidgetShapePreview({
  shape,
  height = 52,
  accent,
}: {
  shape: WidgetShape | null
  height?: number
  accent?: string
}) {
  const c = accent || "var(--primary)"
  const big = height >= 100          // builder preview vs catalog thumbnail
  const pad = big ? 16 : 8

  if (!shape) {
    return <div style={{ height, background: "var(--field-border)", borderRadius: 8, opacity: 0.4 }} />
  }

  if (shape === "kpi") {
    // At 120px there is room for the real anatomy — a big value, a label, a
    // bar. At 52px there is not: a "big number" shrinks to a dash and the tile
    // reads as empty. The thumbnail instead says "one prominent value" with a
    // single solid block, which is the thing a KPI actually is.
    if (!big) {
      return (
        <div style={{ height, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, padding: "0 10px" }}>
          <div style={{ height: 14, width: "52%", background: c, borderRadius: 4, opacity: 0.55 }} />
          <div style={{ height: 6,  width: "30%", background: c, borderRadius: 3, opacity: 0.22 }} />
        </div>
      )
    }
    return (
      <div style={{ height, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, padding: "0 20px" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: c, opacity: 0.7, lineHeight: 1 }}>—</div>
        <div style={{ height: 8,  width: "40%",  background: c, borderRadius: 4, opacity: 0.25 }} />
        <div style={{ height: 24, width: "100%", background: c, borderRadius: 4, opacity: 0.08 }} />
      </div>
    )
  }

  if (shape === "bars") {
    return (
      <div style={{ height, display: "flex", alignItems: "flex-end", gap: big ? 5 : 3, padding: `${pad}px ${pad}px ${big ? 8 : 0}px` }}>
        {(big ? BARS : BARS.slice(0, 6)).map((h, i, arr) => (
          <div
            key={i}
            style={{
              flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0",
              background: i === arr.length - 2 ? c : "var(--color-text-subtitle)",
              opacity: i === arr.length - 2 ? 0.9 : 0.28,
            }}
          />
        ))}
      </div>
    )
  }

  if (shape === "pie") {
    const d = big ? 80 : 38
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: d, height: d, borderRadius: "50%",
            background: `conic-gradient(${c} 0deg 145deg, color-mix(in srgb,${c} 50%, transparent) 145deg 250deg, var(--field-border) 250deg 360deg)`,
          }}
        />
      </div>
    )
  }

  if (shape === "donut") {
    const d = big ? 80 : 38
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: d, height: d, borderRadius: "50%", border: `${big ? 20 : 10}px solid ${c}`, opacity: 0.3 }} />
      </div>
    )
  }

  if (shape === "gauge") {
    const w = big ? 100 : 44
    return (
      <div style={{ height, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: big ? 24 : 12 }}>
        <div
          style={{
            width: w, height: w / 2, borderRadius: `${w}px ${w}px 0 0`,
            background: `conic-gradient(from 180deg, ${c} 0deg 110deg, var(--field-border) 110deg 180deg)`,
          }}
        />
      </div>
    )
  }

  if (shape === "grid") {
    return (
      <div style={{ height, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3, padding: `${big ? 12 : 6}px ${pad}px` }}>
        {(big ? CELLS : CELLS.slice(0, 12)).map((o, i) => (
          <div key={i} style={{ borderRadius: 2, background: o > 0.5 ? c : "var(--field-border)", opacity: o }} />
        ))}
      </div>
    )
  }

  // rows — a feed, an alert list, a table, a board column
  return (
    <div style={{ height, display: "flex", flexDirection: "column", gap: big ? 7 : 5, padding: `${big ? 12 : 6}px ${pad}px` }}>
      {(big ? [100, 80, 65, 90, 55] : [100, 78, 55]).map((w, i) => (
        <div
          key={i}
          style={{
            height: big ? 10 : 8, width: `${w}%`, borderRadius: 4,
            background: i === 0 ? c : "var(--field-border)",
            opacity: i === 0 ? 0.5 : 0.25,
          }}
        />
      ))}
    </div>
  )
}
