import { useCallback, useRef, useState, type ReactElement } from "react"
import { CheckCircle2, PauseCircle, Shield } from "lucide-react"
import { Tag } from "@/components/ui/tag"
import type { NumberStatus, CallSentiment, AgentStatus } from "./data"

// ── Status pills ───────────────────────────────────────────────────────

export function NumberStatusTag({ status }: { status: NumberStatus }) {
  return status === "active"
    ? <Tag variant="success"   size="sm" leadingIcon={<CheckCircle2 size={11}/>}>Active</Tag>
    : <Tag variant="alert"     size="sm" leadingIcon={<PauseCircle  size={11}/>}>Suspended</Tag>
}

export function SentimentTag({ s }: { s: CallSentiment | null }) {
  if (s === null) return <span style={{ color: "var(--color-text-caption)" }}>—</span>
  if (s === "positive") return <Tag variant="success"   size="sm">positive</Tag>
  if (s === "negative") return <Tag variant="error"     size="sm">negative</Tag>
  return                       <Tag variant="secondary" size="sm">neutral</Tag>
}

export function HilBadge({ hil }: { hil: boolean }) {
  return hil
    ? <Tag variant="purple" size="sm" leadingIcon={<Shield size={11}/>}>HiL</Tag>
    : <span style={{ color: "var(--color-text-caption)" }}>—</span>
}

export function AgentStatusDot({ status }: { status: AgentStatus }) {
  const color =
    status === "online" ? "var(--color-text-success)" :
    status === "busy"   ? "var(--color-text-warning)" :
                          "var(--color-icon-neutral-default)"
  const label = status[0].toUpperCase() + status.slice(1)
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }}/>
      {label}
    </span>
  )
}

// ── Agent avatar (colored circle, initials) ────────────────────────────

export function AgentAvatar({ color, initials, size = 24 }: { color: string; initials: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: "50%",
        background: color,
        color: "var(--primary-foreground)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.floor(size * 0.4), fontWeight: 700, flexShrink: 0,
        boxShadow: "0 0 0 2px var(--color-surface-neutral-white)",
      }}
    >
      {initials}
    </span>
  )
}

export function AgentAvatarStack({ colors, initials, max = 3 }: { colors: string[]; initials: string[]; max?: number }) {
  const visible = Math.min(colors.length, max)
  const overflow = colors.length - visible
  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      {colors.slice(0, visible).map((c, i) => (
        <span
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -6,
            display: "inline-flex",
          }}
        >
          <AgentAvatar color={c} initials={initials[i]} size={26} />
        </span>
      ))}
      {overflow > 0 && (
        <span style={{
          marginLeft: -6,
          width: 26, height: 26, borderRadius: "50%",
          background: "var(--color-surface-neutral-more-subtle)",
          color: "var(--color-text-body)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700,
          boxShadow: "0 0 0 2px var(--color-surface-neutral-white)",
        }}>
          +{overflow}
        </span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// useFilterDropdown — reusable dropdown-menu popover for a DS Filters
// slot. Encapsulates the "click chip → open menu → pick option" pattern
// so every voice-channel toolbar shares the exact same behavior and
// visual treatment.
//
// Usage:
//   const { containerRef, slot, menu } = useFilterDropdown({...})
//   return (
//     <div ref={containerRef} className="relative">
//       <Filters slots={[slot]} … />
//       {menu}
//     </div>
//   )
//
// The hook anchors the menu using getBoundingClientRect() on the chip
// button inside `containerRef` — scoped, so multiple dropdowns can
// coexist on one screen without label collisions.
// ─────────────────────────────────────────────────────────────────────

export interface FilterOption<T extends string = string> {
  id:     T
  label:  string
  count?: number
}

export function useFilterDropdown<T extends string>(opts: {
  placeholder:  string
  value:        T
  /** Optional "empty" value. When set, the chip shows the placeholder
   *  while value === defaultValue and exposes a clear (X) affordance
   *  in every other state. When omitted, the chip always displays the
   *  current selection's label and never renders a clear affordance —
   *  use this shape for source-type switchers where "all" isn't a
   *  meaningful state. */
  defaultValue?: T
  options:      FilterOption<T>[]
  onChange:     (id: T) => void
}) {
  const { placeholder, value, defaultValue, options, onChange } = opts
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  const selected = options.find(o => o.id === value)
  const chipLabel = selected
    ? (selected.count != null ? `${selected.label} · ${selected.count}` : selected.label)
    : undefined

  const openMenu = useCallback(() => {
    // Prefer the container scope when provided (multiple dropdowns
    // sharing one placeholder need it); fall back to document scope
    // so a caller doesn't have to plumb a ref for the common single-
    // dropdown case.
    const root: ParentNode = containerRef.current ?? document
    const btn = Array.from(root.querySelectorAll("button")).find(b => {
      const t = b.textContent?.trim() ?? ""
      return t === placeholder || (chipLabel != null && t === chipLabel)
    })
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, left: rect.left })
  }, [placeholder, chipLabel])

  const close = useCallback(() => setPos(null), [])

  const isCleared = defaultValue !== undefined && value === defaultValue
  const slot = {
    placeholder,
    value:    isCleared ? undefined : chipLabel,
    onOpen:   openMenu,
    onRemove: defaultValue !== undefined && value !== defaultValue
      ? () => onChange(defaultValue)
      : undefined,
  }

  const menu: ReactElement | null = pos ? (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 10000 }}
        onClick={close}
      />
      <div
        role="menu"
        style={{
          position:     "fixed",
          top:          pos.top,
          left:         pos.left,
          zIndex:       10001,
          background:   "var(--surface-floating-default, var(--popover, var(--surface)))",
          border:       "1px solid var(--color-border-neutral-default)",
          borderRadius: "var(--radius-md)",
          padding:      "4px 0",
          boxShadow:    "var(--shadow-elevation-3, 0 8px 24px rgba(0,0,0,.18))", // audit-ignore: rgba is CSS var fallback
          minWidth:     200,
        }}
      >
        {options.map(opt => (
          <button
            key={opt.id}
            role="menuitemradio"
            aria-checked={value === opt.id}
            onClick={() => { onChange(opt.id); close() }}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              width:          "100%",
              padding:        "8px 14px",
              border:         "none",
              background:     "none",
              cursor:         "pointer",
              fontSize:       13,
              textAlign:      "left",
              fontFamily:     "inherit",
              fontWeight:     value === opt.id ? 600 : 400,
              color:          value === opt.id ? "var(--primary)" : "var(--color-text-title)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-neutral-subtle)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
          >
            <span>{opt.label}</span>
            {opt.count != null && (
              <span style={{ fontSize: 11, color: "var(--color-text-caption)", marginLeft: 12 }}>
                {opt.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  ) : null

  return { containerRef, slot, menu }
}

// ── Sentiment bar (0..1 → colored bar) ─────────────────────────────────

export function SentimentBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color =
    value > 0.7 ? "var(--color-text-success)"
    : value > 0.45 ? "var(--color-text-warning)"
    : "var(--color-text-error)"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: 4, background: "var(--color-surface-neutral-more-subtle)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }}/>
      </div>
      <span style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{pct}%</span>
    </div>
  )
}
