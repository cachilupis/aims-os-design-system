// DS-GAP: the twelve chart modes drawn as real charts. Closest DS component:
// ChartsWidgetContent in widget-content.tsx, whose visual language these follow
// — dashed gridlines at 0.5 on --field-border, a baseline axis, a legend above
// the plot, and values on the scale.
//
// ── Why these exist ─────────────────────────────────────────────────────────
//
// WIDGET_DEFS documents one "Charts Widget", and ChartsWidgetContent draws
// exactly one chart: a multi-series line. But the builder offers twelve chart
// modes, and every one of them resolved to that same catalogId — so the live
// preview either showed a line chart when you picked Pie, or fell back to an
// abstract shape with no numbers in it. Neither is a preview.
//
// A shape is fine at 52px on a catalog card. At preview size, beside a KPI
// showing 2,401 and a table showing real rows, it reads as broken.
//
// These are one documented component's render modes, not twelve components, so
// they are NOT candidates and do not belong on DS Health's spec queue. When the
// Charts Widget spec grows to describe its modes, this file is what it
// describes.
//
// Sample data is plausible, never live — same contract as widget-content.

import { ProgressBar } from "@/components/ui/progress-bar"
import { Tooltip } from "@/components/ui/tooltip"

const TXT  = "var(--color-text-title)"
const SUB  = "var(--color-text-subtitle)"
const LINE = "var(--field-border)"

// The six categorical hues, all existing tokens. Same set the shape previews
// use, so a Bar Chart's first series is the blue a Pie's first slice is.
const CAT = [
  "var(--color-surface-primary-default)",
  "var(--color-surface-purple-default)",
  "var(--color-surface-light-blue-default)",
  "var(--color-surface-success-default)",
  "var(--color-surface-yellow-default)",
  "var(--color-surface-error-default)",
]

// ── Entrance and explanation ────────────────────────────────────────────────
//
// Two things every chart here needed and none of them had.
//
// GROWING IN. Switching widget type used to swap one finished picture for
// another — correct, and flat. A chart that draws itself says "this is your
// data arriving"; a chart that is simply there says nothing. Bars rise from
// the baseline, slices sweep in, cells fade in reading order. Utilities from
// tw-animate-css, already a dependency, so there are no new keyframes to keep.
//
// The stagger is 35ms and the whole thing finishes inside half a second. Longer
// and you are waiting to read a number, which is the opposite of the point.
const STAGGER_MS = 35

/** One place for the draw keyframe, rather than a <style> per chart. */
function ChartKeyframes() {
  return <style>{`@keyframes line-draw { from { stroke-dashoffset: 400 } to { stroke-dashoffset: 0 } }`}</style>
}

const SERIES_NAMES = ["Performance", "Engagement"]

/** Entrance props for the i-th element of a series. */
function grow(i: number, from: "bottom" | "left" | "scale" = "bottom") {
  const dir = from === "bottom" ? "slide-in-from-bottom-2"
            : from === "left"   ? "slide-in-from-left-2"
            : "zoom-in-95"
  return {
    className: `animate-in fade-in ${dir} duration-300 ease-out fill-mode-backwards`,
    style: { animationDelay: `${i * STAGGER_MS}ms` },
  }
}

/**
 * A data point that explains itself on hover.
 *
 * A heat map cell is a coloured square and nothing else — the reader can see
 * that Wednesday at 1pm is darker without learning what darker MEANS. Same for
 * a slice, a bar, a funnel stage. Every mark that encodes a value now says the
 * value and its label on hover, through the DS Tooltip so it matches every
 * other tooltip in the product.
 */
function DataPoint({ label, fill, children }: { label: string; fill?: string; children: React.ReactNode }) {
  return <Tooltip content={label} side="cursor" triggerClassName={fill}>{children}</Tooltip>
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 8 }}>
      {items.map(([label, colour]) => (
        <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: SUB }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: colour }} />
          {label}
        </span>
      ))}
    </div>
  )
}

function AxisLabels({ labels }: { labels: string[] }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
      {labels.map(l => <span key={l} style={{ fontSize: 10, color: SUB }}>{l}</span>)}
    </div>
  )
}

/** Dashed horizontal gridlines behind a plot — the DS chart's own treatment. */
function Grid({ rows = 4 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <line key={i} x1="0" x2="100" y1={(i * 100) / rows} y2={(i * 100) / rows}
          stroke={LINE} strokeWidth="0.5" strokeDasharray="2,4" vectorEffect="non-scaling-stroke" />
      ))}
      <line x1="0" x2="100" y1="100" y2="100" stroke={LINE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </>
  )
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

function BarChart({ stacked = false }: { stacked?: boolean }) {
  const data = [62, 78, 45, 90, 71, 84]
  const split = [0.55, 0.3, 0.15]
  return (
    <div>
      <Legend items={stacked ? [["Closed", CAT[0]], ["Open", CAT[1]], ["Lost", CAT[2]]] : [["Deals", CAT[0]]]} />
      <div style={{ position: "relative", height: 96 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          <Grid />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 2px" }}>
          {data.map((v, i) => {
            const g = grow(i)
            return (
              <div key={i} style={{ flex: 1, height: `${v}%`, display: "flex", alignItems: "stretch" }}>
                <DataPoint
                  fill="w-full h-full"
                  label={stacked
                    ? `${MONTHS[i]} · ${v} deals — ${Math.round(v * split[0])} closed, ${Math.round(v * split[1])} open, ${Math.round(v * split[2])} lost`
                    : `${MONTHS[i]} · ${v} deals`}
                >
                  <div
                    className={g.className}
                    style={{
                      ...g.style, width: "100%", height: "100%", display: "flex", flexDirection: "column",
                      borderRadius: "3px 3px 0 0", overflow: "hidden", transformOrigin: "bottom",
                    }}
                  >
                    {stacked
                      ? split.map((f, j) => <div key={j} style={{ flex: f, background: CAT[j] }} />)
                      : <div style={{ flex: 1, background: CAT[0] }} />}
                  </div>
                </DataPoint>
              </div>
            )
          })}
        </div>
      </div>
      <AxisLabels labels={MONTHS} />
    </div>
  )
}

function LineChart({ filled = false, bare = false }: { filled?: boolean; bare?: boolean }) {
  const series = [[28, 42, 36, 58, 51, 74], [55, 48, 62, 54, 70, 66]]
  const toPath = (pts: number[]) => pts.map((v, i) => `${(i / (pts.length - 1)) * 100},${100 - v}`).join(" L ")
  if (bare) {
    // Sparkline: no axis, no legend, no grid — it is meant to sit beside a
    // number, and everything else would compete with that number.
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: TXT, lineHeight: 1 }}>74%</span>
        <svg width="100%" height="34" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ flex: 1 }}>
          <path
            d={`M ${toPath(series[0])}`} fill="none" stroke={CAT[0]} strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
            style={{ strokeDasharray: 400, animation: "line-draw 700ms cubic-bezier(0.16, 1, 0.3, 1) backwards" }}
          />
        </svg>
      </div>
    )
  }
  return (
    <div>
      <Legend items={filled ? [["Volume", CAT[0]]] : [["Performance", CAT[0]], ["Engagement", CAT[1]]]} />
      <div style={{ height: 96, position: "relative" }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          <Grid />
          {(filled ? [series[0]] : series).map((pts, i) => (
            <g key={i}>
              {filled && (
                <path
                  d={`M ${toPath(pts)} L 100,100 L 0,100 Z`} fill={CAT[0]} opacity={0.18}
                  className="animate-in fade-in duration-500 ease-out"
                />
              )}
              <path
                d={`M ${toPath(pts)}`} fill="none" stroke={CAT[i]} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                style={{
                  strokeDasharray: 400,
                  animation: `line-draw 700ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms backwards`,
                }}
              />
            </g>
          ))}
        </svg>
        {/* One hover target per point. Invisible until hovered, so the chart
            stays clean and still answers "what is that peak in April". */}
        <div style={{ position: "absolute", inset: 0 }}>
          {(filled ? [series[0]] : series).map((pts, si) =>
            pts.map((v, i) => (
              <span
                key={`${si}-${i}`}
                style={{
                  position: "absolute", left: `${(i / (pts.length - 1)) * 100}%`, top: `${100 - v}%`,
                  transform: "translate(-50%,-50%)",
                }}
              >
                <DataPoint label={`${MONTHS[i]} · ${SERIES_NAMES[filled ? 0 : si]} ${v}${filled ? "" : "%"}`}>
                  <span
                    style={{
                      display: "block", width: 14, height: 14, borderRadius: "50%",
                      background: CAT[si], opacity: 0, transition: "opacity 120ms",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.opacity = "1" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.opacity = "0" }}
                  />
                </DataPoint>
              </span>
            )),
          )}
        </div>
      </div>
      <AxisLabels labels={MONTHS} />
    </div>
  )
}

function PieChart({ donut = false }: { donut?: boolean }) {
  const parts: [string, number][] = [["Enterprise", 46], ["Mid-market", 31], ["SMB", 15], ["Other", 8]]
  let acc = 0
  const stops = parts.map(([, pct], i) => {
    const from = acc * 3.6, to = (acc + pct) * 3.6
    acc += pct
    return `${CAT[i]} ${from}deg ${to}deg`
  }).join(", ")
  return (
    // 24px between the ring and the legend, not 16: at 16 the first swatch sits
    // inside the ring's optical edge and the two read as one object. The legend
    // also gets its own right inset so the percentages stop touching whatever
    // bounds the widget.
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 92, height: 92, flexShrink: 0 }}>
        <div
          className="animate-in fade-in zoom-in-90 duration-500 ease-out"
          style={{ width: "100%", height: "100%", borderRadius: "50%", background: `conic-gradient(${stops})` }}
        />
        {donut && (
          // inset 26 on 92 leaves a 40px hole. At inset 22 on 84 the "842" was
          // 2px from the ring on every side and the word under it was clipped
          // by the curve.
          <div style={{
            position: "absolute", inset: 26, borderRadius: "50%", background: "var(--surface)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: TXT, lineHeight: 1 }}>842</span>
            <span style={{ fontSize: 9, color: SUB, lineHeight: 1 }}>total</span>
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
        {parts.map(([label, pct], i) => {
          const g = grow(i, "left")
          return (
            <DataPoint key={label} fill="w-full" label={`${label} · ${pct}% — ${Math.round(842 * pct / 100)} of 842 accounts`}>
              <div className={g.className} style={{ ...g.style, display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT[i], flexShrink: 0 }} />
                <span style={{
                  fontSize: 11, color: SUB, flex: 1, minWidth: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: TXT, flexShrink: 0 }}>{pct}%</span>
              </div>
            </DataPoint>
          )
        })}
      </div>
    </div>
  )
}

// The funnel bars are the DS ProgressBar, not a hand-rolled track and fill.
// One style per stage, drawn from the non-semantic four — success and error
// are left out on purpose: a funnel stage is not a pass or a failure, and
// those two hues would read as one.
const FUNNEL_STYLES = ["primary", "purple", "light-blue", "yellow"] as const

function FunnelChart() {
  const stages: [string, number, number][] = [
    ["Prospect", 1240, 100], ["Qualified", 780, 63], ["Proposal", 410, 33], ["Closed", 186, 15],
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {stages.map(([label, n, pct], i) => {
        const g = grow(i, "left")
        // The number a funnel is actually read for is the drop, and it was the
        // one number the chart never showed.
        const prev = i > 0 ? stages[i - 1][1] : null
        const drop = prev ? ` — ${Math.round((1 - n / prev) * 100)}% lost from ${stages[i - 1][0]}` : " — entry stage"
        return (
          <DataPoint key={label} fill="w-full" label={`${label} · ${n} of 1,240 (${pct}%)${drop}`}>
            <div className={g.className} style={{ ...g.style, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: SUB, width: 62, flexShrink: 0 }}>{label}</span>
              <ProgressBar
                className="flex-1 min-w-0"
                value={pct}
                style={FUNNEL_STYLES[i % FUNNEL_STYLES.length]}
                size="m"
                label={`${label} — ${n}`}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: TXT, width: 38, textAlign: "right" as const }}>{n}</span>
            </div>
          </DataPoint>
        )
      })}
    </div>
  )
}

function GaugeChart() {
  const pct = 0.72, w = 132, sw = 12
  const r = (w - sw) / 2, arc = Math.PI * r, cy = w / 2
  const d = `M ${sw / 2} ${cy} A ${r} ${r} 0 0 1 ${w - sw / 2} ${cy}`
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <DataPoint label={`72% of target — 8 points under the 80% goal, trending up`}>
      <div style={{ position: "relative", width: w, height: w / 2 + sw }}>
        <svg width={w} height={w / 2 + sw} viewBox={`0 0 ${w} ${w / 2 + sw}`}>
          <path d={d} fill="none" stroke={LINE} strokeWidth={sw} strokeLinecap="round" />
          {/* dashoffset from the full arc to zero is what makes it sweep
              rather than appear — the value literally fills up. */}
          <path
            d={d} fill="none" stroke={CAT[3]} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${arc * pct} ${arc}`}
            style={{ animation: "gauge-sweep 700ms cubic-bezier(0.16, 1, 0.3, 1) backwards" }}
          />
          <style>{`@keyframes gauge-sweep { from { stroke-dashoffset: ${arc * pct}px } to { stroke-dashoffset: 0 } }`}</style>
        </svg>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: TXT, lineHeight: 1 }}>72%</div>
        </div>
      </div>
      </DataPoint>
      <span style={{ fontSize: 11, color: SUB }}>Target 80% · on track</span>
    </div>
  )
}

function HeatMapChart() {
  const hours = ["9a", "11a", "1p", "3p", "5p"]
  const days  = ["Mon", "Tue", "Wed", "Thu", "Fri"]
  const cells = [
    0.2,0.4,0.9,0.6,0.3,  0.3,0.7,1.0,0.8,0.4,  0.1,0.5,0.8,0.9,0.5,
    0.4,0.6,0.7,0.5,0.2,  0.2,0.3,0.5,0.4,0.1,
  ]
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", paddingBottom: 16 }}>
        {days.map(d => <span key={d} style={{ fontSize: 9, color: SUB, lineHeight: 1 }}>{d}</span>)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
          {cells.map((o, i) => {
            const g = grow(i, "scale")
            // The whole point of the tooltip: the square is darker, and only
            // this says darker means busier — and by how much.
            const band = o >= 0.8 ? "Peak" : o >= 0.5 ? "Busy" : o >= 0.3 ? "Steady" : "Quiet"
            return (
              <DataPoint
                key={i}
                fill="block w-full"
                label={`${days[Math.floor(i / 5)]} ${hours[i % 5]} · ${band} — ${Math.round(o * 100)}% of peak load`}
              >
                <div
                  className={g.className}
                  style={{ ...g.style, width: "100%", aspectRatio: "1.6", borderRadius: 3, background: CAT[0], opacity: 0.12 + o * 0.8 }}
                />
              </DataPoint>
            )
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3, marginTop: 5 }}>
          {hours.map(h => <span key={h} style={{ fontSize: 9, color: SUB, textAlign: "center" as const }}>{h}</span>)}
        </div>
      </div>
    </div>
  )
}

function CorrelationChart() {
  const dots: [number, number, number][] = [
    [12,78,0],[26,62,0],[34,70,0],[45,44,1],[52,55,1],[61,30,1],
    [70,38,2],[78,20,2],[86,28,2],[20,50,0],[40,82,1],[68,60,2],
  ]
  return (
    <div>
      <Legend items={[["Enterprise", CAT[0]], ["Mid-market", CAT[1]], ["SMB", CAT[2]]]} />
      <div style={{ position: "relative", height: 96 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          <Grid />
        </svg>
        <div style={{ position: "absolute", inset: 0 }}>
          {dots.map(([x, y, c], i) => {
            const g = grow(i, "scale")
            const seg = ["Enterprise", "Mid-market", "SMB"][c]
            // A dot's position IS the datum; without a tooltip the reader can
            // see the cloud slopes down and cannot read a single point off it.
            return (
              <span
                key={i}
                style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              >
                <DataPoint label={`${seg} · $${Math.round(x * 1.2)}K deal · ${100 - y}% win rate`}>
                  <span
                    className={g.className}
                    style={{ ...g.style, width: 7, height: 7, borderRadius: "50%", background: CAT[c], display: "block" }}
                  />
                </DataPoint>
              </span>
            )
          })}
        </div>
      </div>
      <AxisLabels labels={["0", "Deal size", "$120K"]} />
    </div>
  )
}

function MapChart() {
  const regions: [string, string, number][] = [
    ["North America", "$412K", 0.9], ["EMEA", "$268K", 0.62], ["APAC", "$154K", 0.36], ["LATAM", "$61K", 0.18],
  ]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width="96" height="62" viewBox="0 0 120 78" style={{ flexShrink: 0 }}>
        <path d="M6 46 L18 22 L38 12 L58 20 L64 38 L52 58 L26 62 Z" fill={CAT[0]} opacity={0.9} />
        <path d="M68 18 L90 10 L108 22 L102 38 L82 42 L70 32 Z"     fill={CAT[0]} opacity={0.55} />
        <path d="M74 48 L98 46 L114 58 L92 66 L74 60 Z"             fill={CAT[0]} opacity={0.28} />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        {regions.map(([label, value, o], i) => {
          const g = grow(i, "left")
          return (
            <DataPoint key={label} fill="w-full" label={`${label} · ${value} — ${Math.round(o * 100)}% of the strongest region`}>
              <div className={g.className} style={{ ...g.style, display: "flex", alignItems: "center", gap: 7, padding: "3px 0" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT[0], opacity: 0.2 + o * 0.8, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: SUB, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: TXT }}>{value}</span>
              </div>
            </DataPoint>
          )
        })}
      </div>
    </div>
  )
}

const BY_ID: Record<string, () => React.ReactElement> = {
  "bar":         () => <BarChart />,
  "stacked-bar": () => <BarChart stacked />,
  "line":        () => <LineChart />,
  "area":        () => <LineChart filled />,
  "sparkline":   () => <LineChart bare />,
  "pie":         () => <PieChart />,
  "donut":       () => <PieChart donut />,
  "funnel":      FunnelChart,
  "gauge":       GaugeChart,
  "heatmap":     HeatMapChart,
  "correlation": CorrelationChart,
  "map":         MapChart,
}

/** A chart mode drawn as a real chart, or null when the id is not one. */
export function ChartModeContent({ id }: { id: string }) {
  const C = BY_ID[id]
  if (!C) return null
  return (
    <>
      <ChartKeyframes />
      <C />
    </>
  )
}

export const hasChartMode = (id: string) => id in BY_ID
