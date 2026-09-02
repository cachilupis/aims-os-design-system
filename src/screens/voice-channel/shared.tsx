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
