// DS-GAP: WidgetShapePreview — a miniature of what a widget type looks like
// (a donut ring, a gauge arc, a roster of people). Nothing in the DS draws one:
// Skeleton is a loading placeholder, HighlightIcon is a single glyph, and
// neither illustrates a widget's shape. This is the one genuine gap in this file.
//
// WidgetGlyph and FreshnessBadge below are NOT gaps — they are thin wrappers
// over the real DS HighlightIcon and Tag. They live here anyway because the
// icon map they share has to have exactly one home.
//
// ── Why this file was rewritten (2026-09-04) ────────────────────────────────
//
// The first version drew abstract grey bars, on the theory that a preview
// should not pretend to show real data. Put side by side with the version Thom
// had written independently in pm-thomas-composable-dashboards, it lost badly:
// it collapsed ten widget types into five drawings. A KPI and a Board came out
// identical — two grey bars — and both read as a loading state rather than as a
// type of widget.
//
// The abstract version's one advantage was that it used only tokens, while
// Thom's used hardcoded hex behind audit-ignore comments. That advantage did
// not survive checking: his #2B7FFF is --primary character for character, and
// his #F59E0B is --color-surface-yellow-default. He had not invented a palette,
// he had retyped the DS's, because nothing exposed it as one for charts.
//
// So this is his approach with the colours named. Six categorical hues, every
// one an existing token, no new token introduced.
//
// ── Covering the real catalog ───────────────────────────────────────────────
//
// Thom's ten skeleton names cover about half of what the DS catalog actually
// defines. WIDGET_DEFS has fourteen widgets — Table, Notes, Folder Navigation,
// My Work, My Team, Workflows, Pending Outputs, Agent Catalog and Timeline
// among them — and not one of those is a chart. Falling back to a generic block
// for nine of fourteen is how a catalog starts looking like filler, so each gets
// a shape that says what it is: a table has a header row, a roster has avatars,
// a task list has status pips, a tree is indented.
//
// Promotion: WidgetGlyph and FreshnessBadge should collapse into direct
// HighlightIcon / Tag calls once the widget catalog is settled (the wrappers
// only survive to keep the icon map single-source). WidgetShapePreview is the
// piece that would graduate to src/components/ui/.

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
  // Builder / library vocabulary
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
  // DS catalog (WIDGET_DEFS) — the nine that are not charts
  "Status Warning":    "ShieldAlert",
  Timeline:            "GitCommitHorizontal",
  Table:               "Table2",
  "Last Activity":     "Activity",
  Notes:               "StickyNote",
  "Folder Navigation": "FolderTree",
  "Act Now Summary":   "Zap",
  "My Work":           "ListChecks",
  "My Team":           "Users",
  Workflows:           "Workflow",
  "Pending Outputs":   "Inbox",
  "Agent Catalog":     "Bot",
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

/** A miniature of the widget's shape, addressed by catalog name rather than by
 *  shape — which is how every catalog card has the name to hand. */
export function WidgetMiniPreview({ skeleton, seed = 0, height = 52 }: {
  skeleton: string
  seed?: number
  height?: number
}) {
  return <WidgetShapePreview shape={SHAPE_FOR_SKELETON[skeleton] ?? "bars"} height={height} seed={seed} />
}

// ── The categorical palette ─────────────────────────────────────────────────
// Six hues that already exist as tokens. Used for series in a chart, statuses
// in a board, categories on a timeline — anywhere a preview needs colour to
// mean "these are different things" rather than to signal a state.
//
// The last two are borrowed from the semantic set: inside a preview showing
// several categories at once they carry no state meaning. A widget that IS in
// a state — an alert count, a failed run — should still reach for the semantic
// token directly, never for index 5 of this array.

const CAT = [
  "var(--color-surface-primary-default)",     // #2b7fff — Thom's #2B7FFF, exactly
  "var(--color-surface-purple-default)",      // #7b27ed
  "var(--color-surface-light-blue-default)",  // #00b5d9
  "var(--color-surface-success-default)",     // #00a07e
  "var(--color-surface-yellow-default)",      // #f59e0b — Thom's #F59E0B, exactly
  "var(--color-surface-error-default)",       // #e05252
] as const

// Semantic, for the shapes that genuinely show a state.
const OK   = "var(--color-surface-success-default)"
const WARN = "var(--color-surface-yellow-default)"
const BAD  = "var(--color-surface-error-default)"

const TXT    = "var(--color-text-title)"
const SUB    = "var(--color-text-subtitle)"
const LINE   = "var(--field-border)"
const SUNKEN = "var(--canvas)"

// ── Widget shapes ───────────────────────────────────────────────────────────
// One set of shapes, drawn at whatever height the caller needs: 52px for a
// catalog thumbnail, 120px for the builder's live preview.
//
// Two vocabularies map in, because there are still two. The builder names a
// widget by its render shape ("bar", "pie", "heatmap"); the catalog names it by
// identity ("Chart", "Donut", "Table"). Reconciling those is a product decision
// that has not been made — see the widget vocabulary audit. Until it is, both
// maps live here side by side, which at least keeps the drawing identical no
// matter which name you arrive with.

export type WidgetShape =
  | "kpi" | "cost-kpi" | "bars" | "funnel" | "pie" | "donut" | "gauge"
  | "feed" | "status" | "alerts" | "act-now" | "stat-row" | "timeline"
  | "line" | "heatmap" | "scatter" | "map"
  | "table" | "notes" | "tree" | "roster" | "agents" | "tasks" | "flow" | "queue"

/** Builder vocabulary — the shape you pick when authoring a widget. */
export const SHAPE_FOR_BUILDER_TYPE: Record<string, WidgetShape> = {
  kpi: "kpi", costkpi: "cost-kpi",
  summary: "notes",          // a summary is prose, not a chart
  bar: "bars", line: "line",
  table: "table", list: "tasks", "record-card": "roster",
  pie: "pie",
  gauge: "gauge",
  heatmap: "heatmap", scatter: "scatter", map: "map",
}

/** Catalog vocabulary — the identity a widget is filed under. Covers both the
 *  ten skeleton names the prototypes use and the fourteen in WIDGET_DEFS. */
export const SHAPE_FOR_SKELETON: Record<string, WidgetShape> = {
  KPI: "kpi", "Cost KPI": "cost-kpi",
  Chart: "bars", Funnel: "funnel",
  Donut: "donut", Gauge: "gauge",
  Feed: "feed", Alerts: "alerts", Board: "status",
  "Stat Row": "stat-row",
  // DS catalog
  "Status Warning":    "stat-row",
  Timeline:            "timeline",
  Table:               "table",
  "Last Activity":     "feed",
  Notes:               "notes",
  "Folder Navigation": "tree",
  "Act Now Summary":   "act-now",
  "My Work":           "tasks",
  "My Team":           "roster",
  Workflows:           "flow",
  "Pending Outputs":   "queue",
  "Agent Catalog":     "agents",
}

/** Catalog id (WIDGET_DEFS[].id) → shape, so the DS catalog page can draw its
 *  own widgets with the same renderer the prototypes use. */
export const SHAPE_FOR_CATALOG_ID: Record<string, WidgetShape> = {
  kpi:                "kpi",
  "status-warning":   "stat-row",
  timeline:           "timeline",
  charts:             "bars",
  table:              "table",
  activity:           "feed",
  notes:              "notes",
  "folder-nav":       "tree",
  "act-now-summary":  "act-now",
  "my-work":          "tasks",
  "my-team":          "roster",
  workflows:          "flow",
  "pending-outputs":  "queue",
  "agent-catalog":    "agents",
}

// Deterministic per-seed variation, so a grid of cards does not read as one
// value repeated fourteen times. The same seed always gives the same preview.
function pick<T>(arr: readonly T[], seed: number): T { return arr[Math.abs(seed) % arr.length] }

/** Turn a widget's name into a seed. Callers that have a name and no number
 *  should use this rather than something like `skeleton.length` — three KPI
 *  tiles on one dashboard all seeded by the word "KPI" show the same value
 *  three times, which is worse than showing nothing. */
export function seedFrom(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

const KPI_VALUES  = ["86.4K", "1,284", "94.2%", "540", "3.2K", "7.6", "12.8K", "48.2%"]
const COST_VALUES = ["$13K", "$920K", "$0.08", "$4.2K", "$78K", "$1.6M"]
const COST_LABELS = ["end of cycle", "projected spend", "per execution", "this month", "annualised", "run rate"]
const KPI_LABELS = ["vs last 30 days", "this month", "end of cycle", "success rate", "total", "in queue", "projected", "avg. hours"]
const BAR_SETS   = [[52, 78, 45, 90, 62], [70, 40, 85, 55, 75], [45, 60, 95, 50, 70], [80, 55, 65, 88, 42]]
const LINE_SETS  = [[22, 38, 30, 52, 46, 70, 84], [60, 44, 66, 52, 78, 68, 88], [30, 34, 55, 48, 62, 80, 74]]
const CELLS      = [0.8,0.2,0.5,0.9,0.3,0.6,0.1,0.7,0.4,0.8,0.6,0.2,0.9,0.5,0.3,0.7,0.1,0.8,0.4,0.6,0.2,0.9,0.5,0.3]
const DOTS: [number, number][] = [[12,78],[26,62],[34,70],[45,44],[52,55],[61,30],[70,38],[78,20],[86,28],[20,50],[40,82],[68,60]]

/**
 * Draws a widget's shape.
 *
 * Legible rather than abstract: a KPI shows a number, a roster shows people, a
 * table has a header row. The values are plausible sample data, not live —
 * enough that someone scanning a catalog can tell a Table from a Timeline
 * without reading the label.
 *
 * `accent` lets the builder preview follow the colour the user picked; every
 * other caller leaves it unset and gets the categorical palette.
 */
export function WidgetShapePreview({
  shape,
  height = 52,
  accent,
  seed = 0,
}: {
  shape: WidgetShape | null
  height?: number
  accent?: string
  seed?: number
}) {
  const big = height >= 100          // builder preview vs catalog thumbnail

  // A caller passing "transparent" or "none" means "no accent", not "paint it
  // invisible" — the builder's Default swatch did exactly that and every
  // accented shape vanished. Treat any non-paintable value as absent.
  const tint = accent && accent !== "transparent" && accent !== "none" ? accent : undefined
  const c    = tint || CAT[0]
  const cat  = (i: number) => (tint && i === 0 ? tint : CAT[i % CAT.length])

  // Decorative in every caller: the sample values illustrate the shape, they are
  // not data. Kept out of the accessible tree so a KPI tile is announced as
  // "KPI" and not as "3.2K KPI".
  const a11y = { "aria-hidden": true as const, role: "presentation" as const }

  const box: React.CSSProperties = {
    height, borderRadius: 8, background: SUNKEN, border: `1px solid ${LINE}`,
    overflow: "hidden", pointerEvents: "none", display: "flex", alignItems: "center",
  }
  const pad = big ? 16 : 10
  const fs  = (small: number, large: number) => (big ? large : small)

  if (!shape) {
    return <div {...a11y} style={{ ...box, background: LINE, opacity: 0.4, border: "none" }} />
  }

  // ── One prominent number ──────────────────────────────────────────────────
  // Cost KPI is the same layout with a currency value. Sharing the "kpi" shape
  // made a spend widget show "1,284", which reads as a count — the whole point
  // of a Cost KPI is that the number has a unit.
  if (shape === "kpi" || shape === "cost-kpi") {
    const money = shape === "cost-kpi"
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: big ? 6 : 2 }}>
        <span style={{ fontSize: fs(22, 38), fontWeight: 700, letterSpacing: "-0.5px", color: TXT, lineHeight: 1 }}>
          {pick(money ? COST_VALUES : KPI_VALUES, seed)}
        </span>
        {big && <span style={{ fontSize: 12, color: SUB }}>{pick(money ? COST_LABELS : KPI_LABELS, seed)}</span>}
      </div>
    )
  }

  // ── Series of bars ────────────────────────────────────────────────────────
  if (shape === "bars") {
    return (
      <div {...a11y} style={{ ...box, alignItems: "flex-end", justifyContent: "center", gap: big ? 8 : 4, padding: `${pad}px ${pad + 4}px` }}>
        {pick(BAR_SETS, seed).map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: cat(i) }} />
        ))}
      </div>
    )
  }

  // ── A trend over time ─────────────────────────────────────────────────────
  // Bar and Line were the same drawing. They answer different questions —
  // comparison versus momentum — and the shape is what carries that.
  if (shape === "line") {
    const pts = pick(LINE_SETS, seed)
    const w = 100, h = 100
    const d = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - v}`).join(" L ")
    return (
      <div {...a11y} style={{ ...box, padding: `${pad}px ${pad + 4}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
          <polyline points="" />
          <path d={`M ${d}`} fill="none" stroke={c} strokeWidth={big ? 4 : 5}
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    )
  }

  // ── Density across two dimensions ─────────────────────────────────────────
  if (shape === "heatmap") {
    const cells = big ? CELLS : CELLS.slice(0, 18)
    return (
      <div {...a11y} style={{ ...box, display: "grid", alignItems: "stretch", gridAutoRows: "1fr", gridTemplateColumns: "repeat(6, 1fr)", gap: big ? 4 : 3, padding: `${big ? 14 : 8}px ${pad}px` }}>
        {cells.map((o, i) => (
          <div key={i} style={{ borderRadius: 2, background: c, opacity: 0.15 + o * 0.85 }} />
        ))}
      </div>
    )
  }

  // ── Correlation, one dot per record ───────────────────────────────────────
  if (shape === "scatter") {
    const d = big ? 7 : 5
    return (
      <div {...a11y} style={{ ...box, position: "relative", padding: pad }}>
        <div style={{ position: "absolute", inset: pad }}>
          {DOTS.slice(0, big ? DOTS.length : 7).map(([x, y], i) => (
            <div key={i} style={{
              position: "absolute", left: `${x}%`, top: `${y}%`, width: d, height: d,
              borderRadius: "50%", background: cat(i % 3), opacity: 0.85, transform: "translate(-50%,-50%)",
            }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Geography ─────────────────────────────────────────────────────────────
  // Abstract regions, not a real map: enough to say "this is spatial" without
  // pretending to be a country nobody's data is in.
  if (shape === "map") {
    return (
      <div {...a11y} style={{ ...box, justifyContent: "center", padding: `${big ? 10 : 6}px ${pad}px` }}>
        <svg width="100%" height="100%" viewBox="0 0 120 64" preserveAspectRatio="xMidYMid meet">
          <path d="M8 40 L18 22 L34 14 L52 20 L58 34 L48 50 L26 54 Z" fill={c} opacity={0.75} />
          <path d="M64 16 L84 10 L100 20 L96 34 L78 38 L66 30 Z"       fill={c} opacity={0.4} />
          <path d="M72 44 L94 42 L108 52 L88 58 L70 54 Z"              fill={c} opacity={0.22} />
        </svg>
      </div>
    )
  }

  // ── Stages that narrow ────────────────────────────────────────────────────
  if (shape === "funnel") {
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", justifyContent: "center", alignItems: "center", gap: big ? 6 : 3, padding: `${pad}px ${pad + 4}px` }}>
        {[96, 74, 52, 32].map((w, i) => (
          <div key={i} style={{ width: `${w}%`, height: big ? 14 : 8, borderRadius: 3, background: cat(i) }} />
        ))}
      </div>
    )
  }

  // ── Parts of a whole ──────────────────────────────────────────────────────
  if (shape === "pie" || shape === "donut") {
    const d    = big ? 84 : 40
    const sw   = big ? 14 : 8
    const pct  = 0.55 + (seed % 4) * 0.1
    const r    = d / 2 - sw / 2
    const circ = 2 * Math.PI * r
    return (
      <div {...a11y} style={{ ...box, justifyContent: "center" }}>
        {shape === "pie" ? (
          <div style={{
            width: d, height: d, borderRadius: "50%",
            background: `conic-gradient(${c} 0deg 145deg, ${cat(1)} 145deg 250deg, ${cat(2)} 250deg 360deg)`,
          }} />
        ) : (
          <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`}>
            <circle cx={d / 2} cy={d / 2} r={r} fill="none" stroke={LINE} strokeWidth={sw} />
            <circle cx={d / 2} cy={d / 2} r={r} fill="none" stroke={c} strokeWidth={sw}
              strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
              transform={`rotate(-90 ${d / 2} ${d / 2})`} />
          </svg>
        )}
      </div>
    )
  }

  // ── A value against a range ───────────────────────────────────────────────
  if (shape === "gauge") {
    const w   = big ? 108 : 52
    const sw  = big ? 11 : 6
    const pct = 0.45 + (seed % 5) * 0.1
    const r   = (w - sw) / 2
    const arc = Math.PI * r
    const cy  = w / 2
    const d   = `M ${sw / 2} ${cy} A ${r} ${r} 0 0 1 ${w - sw / 2} ${cy}`
    return (
      <div {...a11y} style={{ ...box, justifyContent: "center", alignItems: "flex-end", paddingBottom: big ? 22 : 10 }}>
        <svg width={w} height={w / 2 + sw} viewBox={`0 0 ${w} ${w / 2 + sw}`}>
          <path d={d} fill="none" stroke={LINE} strokeWidth={sw} strokeLinecap="round" />
          <path d={d} fill="none" stroke={tint || OK} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${arc * pct} ${arc}`} />
        </svg>
      </div>
    )
  }

  // ── Things that happened, newest first ────────────────────────────────────
  if (shape === "feed") {
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: big ? 9 : 5, padding: `${pad}px ${pad + 2}px` }}>
        {(big ? [92, 78, 88, 64, 74] : [90, 72, 58]).map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: big ? 9 : 6 }}>
            <div style={{ width: big ? 7 : 5, height: big ? 7 : 5, borderRadius: "50%", background: cat(i), flexShrink: 0 }} />
            <div style={{ height: big ? 8 : 6, width: `${w}%`, borderRadius: 3, background: LINE }} />
          </div>
        ))}
      </div>
    )
  }

  // ── Named states with counts ──────────────────────────────────────────────
  if (shape === "status") {
    const rows: [string, string, number][] = [[OK, "Active", 3], [SUB, "Idle", 1], [WARN, "Paused", 1]]
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: big ? 8 : 4, padding: `${pad - 2}px ${pad + 2}px` }}>
        {rows.map(([col, label, n]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: big ? 8 : 5, minWidth: 0 }}>
              <div style={{ width: big ? 8 : 6, height: big ? 8 : 6, borderRadius: "50%", background: col, flexShrink: 0 }} />
              <span style={{ fontSize: fs(10, 13), color: SUB }}>{label}</span>
            </div>
            <span style={{ fontSize: fs(10, 13), fontWeight: 600, color: TXT }}>{n}</span>
          </div>
        ))}
      </div>
    )
  }

  // ── Severities, worst first ───────────────────────────────────────────────
  // Same row layout as `status`, deliberately different content: an Alerts
  // widget that says "Active / Idle / Paused" is describing a Board. Severity
  // is what makes it an alert, so the rows carry it and the colours are
  // semantic here rather than categorical.
  if (shape === "alerts") {
    const rows: [string, string, number][] = [[BAD, "Critical", 2], [WARN, "Warning", 5], [CAT[0], "Info", 11]]
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: big ? 8 : 4, padding: `${pad - 2}px ${pad + 2}px` }}>
        {rows.map(([col, label, n]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: big ? 8 : 5, minWidth: 0 }}>
              <div style={{ width: big ? 7 : 6, height: big ? 7 : 6, borderRadius: 2, background: col, flexShrink: 0 }} />
              <span style={{ fontSize: fs(10, 13), color: SUB }}>{label}</span>
            </div>
            <span style={{ fontSize: fs(10, 13), fontWeight: 600, color: TXT }}>{n}</span>
          </div>
        ))}
      </div>
    )
  }

  // ── Three counters side by side ───────────────────────────────────────────
  if (shape === "stat-row") {
    const cells: [string, string, string][] = [[OK, "412", "Normal"], [WARN, "17", "Warnings"], [BAD, "3", "Critical"]]
    return (
      <div {...a11y} style={{ ...box, justifyContent: "space-around", padding: `0 ${pad}px` }}>
        {cells.map(([col, v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: fs(14, 22), fontWeight: 700, color: col, lineHeight: 1.1 }}>{v}</div>
            <div style={{ fontSize: fs(9, 11), color: SUB, marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>
    )
  }

  // ── Colour-coded event cards in a strip ───────────────────────────────────
  if (shape === "timeline") {
    const cards: [string, string][] = [["12", "Calls"], ["8", "Emails"], ["3", "Visits"], ["5", "Notes"]]
    return (
      <div {...a11y} style={{ ...box, gap: big ? 8 : 5, padding: `${pad - 2}px ${pad}px`, alignItems: "stretch" }}>
        {(big ? cards : cards.slice(0, 3)).map(([v, l], i) => (
          <div key={l} style={{
            flex: 1, minWidth: 0, borderRadius: 6, background: LINE,
            borderLeft: `3px solid ${cat(i)}`, paddingLeft: big ? 8 : 5,
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <span style={{ fontSize: fs(11, 15), fontWeight: 700, color: TXT, lineHeight: 1.1 }}>{v}</span>
            {big && <span style={{ fontSize: 10, color: SUB }}>{l}</span>}
          </div>
        ))}
      </div>
    )
  }

  // ── Rows and columns, with a header ───────────────────────────────────────
  if (shape === "table") {
    const cols = [34, 26, 22, 18]
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start", padding: 0 }}>
        <div style={{ display: "flex", gap: big ? 8 : 5, padding: `${big ? 9 : 6}px ${pad}px`, borderBottom: `1px solid ${LINE}` }}>
          {cols.map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: big ? 7 : 5, borderRadius: 2, background: cat(0), opacity: 0.7 }} />
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: `${big ? 6 : 3}px ${pad}px` }}>
          {Array.from({ length: big ? 5 : 3 }).map((_, r) => (
            <div key={r} style={{ display: "flex", gap: big ? 8 : 5 }}>
              {cols.map((w, i) => (
                <div key={i} style={{ width: `${w}%`, height: big ? 6 : 4, borderRadius: 2, background: LINE }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Free text someone typed ───────────────────────────────────────────────
  if (shape === "notes") {
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: big ? 8 : 5, padding: `${pad}px ${pad + 2}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: big ? 4 : 3, height: big ? 12 : 8, borderRadius: 2, background: cat(4), flexShrink: 0 }} />
          <div style={{ height: big ? 8 : 6, width: "45%", borderRadius: 3, background: cat(0), opacity: 0.7 }} />
        </div>
        {(big ? [96, 88, 92, 70] : [94, 84, 58]).map((w, i) => (
          <div key={i} style={{ height: big ? 6 : 4, width: `${w}%`, borderRadius: 3, background: LINE }} />
        ))}
      </div>
    )
  }

  // ── A hierarchy you can drill into ────────────────────────────────────────
  if (shape === "tree") {
    const nodes: [number, number][] = big
      ? [[0, 52], [1, 44], [1, 38], [0, 46], [1, 34]]
      : [[0, 50], [1, 40], [1, 34]]
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: big ? 8 : 5, padding: `${pad}px ${pad + 2}px` }}>
        {nodes.map(([depth, w], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: big ? 8 : 5, paddingLeft: depth * (big ? 16 : 11) }}>
            <div style={{
              width: big ? 10 : 7, height: big ? 8 : 6, borderRadius: 2, flexShrink: 0,
              background: depth === 0 ? cat(4) : LINE,
            }} />
            <div style={{ height: big ? 6 : 5, width: `${w}%`, borderRadius: 3, background: LINE }} />
          </div>
        ))}
      </div>
    )
  }

  // ── People or agents, one per row ─────────────────────────────────────────
  if (shape === "roster" || shape === "agents") {
    // A person is a circle, an agent is a rounded square. Same row layout, and
    // the shape of the avatar is the whole distinction — which is exactly how
    // the product distinguishes them elsewhere.
    const bot = shape === "agents"
    const d = big ? 18 : 12
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: big ? 9 : 5, padding: `${pad - 2}px ${pad + 2}px` }}>
        {(big ? [0, 1, 2, 3] : [0, 1, 2]).map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: big ? 9 : 6 }}>
            <div style={{ width: d, height: d, borderRadius: bot ? 3 : "50%", background: cat(i), flexShrink: 0, opacity: 0.85 }} />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ height: big ? 6 : 5, width: `${68 - i * 8}%`, borderRadius: 3, background: LINE }} />
              {big && <div style={{ height: 5, width: `${44 - i * 6}%`, borderRadius: 3, background: LINE, opacity: 0.6 }} />}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── What needs doing right now ────────────────────────────────────────────
  // Not the same as `status`: Act Now leads with how many things are waiting on
  // you, then names the most urgent. A lifecycle breakdown answers a different
  // question.
  if (shape === "act-now") {
    const rows: [string, number][] = [[BAD, 2], [WARN, 3]]
    return (
      <div {...a11y} style={{ ...box, gap: big ? 14 : 9, padding: `0 ${pad + 2}px` }}>
        <span style={{ fontSize: fs(22, 34), fontWeight: 700, color: TXT, lineHeight: 1, flexShrink: 0 }}>5</span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: big ? 8 : 5 }}>
          {rows.map(([col, n], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: big ? 8 : 5 }}>
              <div style={{ width: big ? 7 : 5, height: big ? 7 : 5, borderRadius: "50%", background: col, flexShrink: 0 }} />
              <div style={{ height: big ? 7 : 5, width: `${72 - i * 14}%`, borderRadius: 3, background: LINE }} />
              <span style={{ fontSize: fs(9, 11), fontWeight: 600, color: SUB, marginLeft: "auto" }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Steps that run into each other ────────────────────────────────────────
  // A workflow is not a checklist: the order is the content, so the nodes are
  // connected left to right rather than stacked.
  if (shape === "flow") {
    const nodes = big ? 4 : 3
    const d = big ? 16 : 11
    return (
      <div {...a11y} style={{ ...box, justifyContent: "center", padding: `0 ${pad + 2}px` }}>
        {Array.from({ length: nodes }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i === nodes - 1 ? "0 0 auto" : 1 }}>
            <div style={{
              width: d, height: d, borderRadius: 4, flexShrink: 0,
              background: i === 0 ? cat(0) : i === nodes - 1 ? LINE : cat(3),
              opacity: i === nodes - 1 ? 1 : 0.9,
            }} />
            {i < nodes - 1 && <div style={{ flex: 1, height: 2, background: LINE }} />}
          </div>
        ))}
      </div>
    )
  }

  // ── Things waiting for you to act ─────────────────────────────────────────
  // Stacked cards rather than a list of lines — a queue has depth, and the
  // count is the point.
  if (shape === "queue") {
    return (
      <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: big ? 7 : 4, padding: `${pad - 2}px ${pad + 2}px` }}>
        {(big ? [0, 1, 2] : [0, 1]).map(i => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: big ? 8 : 5,
            padding: `${big ? 6 : 4}px ${big ? 8 : 6}px`, borderRadius: 5,
            background: LINE, opacity: 1 - i * 0.22,
          }}>
            <div style={{ width: big ? 6 : 4, height: big ? 12 : 8, borderRadius: 2, background: cat(4), flexShrink: 0 }} />
            <div style={{ height: big ? 6 : 4, width: `${64 - i * 10}%`, borderRadius: 3, background: SUNKEN }} />
          </div>
        ))}
      </div>
    )
  }

  // ── tasks — items with a status pip and a title ───────────────────────────
  const items: [string, number][] = big
    ? [[OK, 82], [WARN, 68], [CAT[0], 90], [SUB, 60]]
    : [[OK, 80], [WARN, 66], [CAT[0], 88]]
  return (
    <div {...a11y} style={{ ...box, flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: big ? 9 : 5, padding: `${pad}px ${pad + 2}px` }}>
      {items.map(([col, w], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: big ? 9 : 6 }}>
          <div style={{ width: big ? 9 : 7, height: big ? 9 : 7, borderRadius: 2, border: `1.5px solid ${col}`, flexShrink: 0 }} />
          <div style={{ height: big ? 7 : 5, width: `${w}%`, borderRadius: 3, background: LINE }} />
        </div>
      ))}
    </div>
  )
}
