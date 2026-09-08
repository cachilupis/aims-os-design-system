import { ChevronDown } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"

// ─────────────────────────────────────────────────────────────────────
// Shared helpers used by all three ConfigureX slide-outs (Voice / SMS /
// Email). Kept in one file so the visual layer stays consistent — a
// change to Field padding or Toggle row border-radius propagates to
// every configure slide-out automatically.
// ─────────────────────────────────────────────────────────────────────

// ─── Field (label + control + optional hint) ────────────────────────

export function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-label)" }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 2 }}>{hint}</p>
      )}
    </div>
  )
}

// ─── Divider ────────────────────────────────────────────────────────

export function Divider() {
  return <div style={{ height: 1, background: "var(--color-border-neutral-default)" }}/>
}

// ─── Uppercase section label (Security & Compliance etc.) ───────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: "var(--color-text-caption)",
    }}>
      {children}
    </div>
  )
}

// ─── Toggle row (label + description + right-aligned toggle) ────────

export function ToggleRow({
  label, desc, checked, onChange, border = true,
}: {
  label:    string
  desc:     string
  checked:  boolean
  onChange: (v: boolean) => void
  border?:  boolean
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        paddingTop: 6, paddingBottom: 6,
        borderBottom: border ? "1px solid var(--color-border-neutral-default)" : "none",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 2 }}>{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} size="sm"/>
    </div>
  )
}

// ─── NativeSelect — real <select> styled with DS field tokens ───────
// The DS Select primitive renders a trigger only (no built-in options),
// so form-heavy slide-outs with many enum choices need a native
// <select>. Matches the source prototype's <select class="input"> use.

export function NativeSelect({
  value, onChange, options, size = "default",
}: {
  value:    string
  onChange: (v: string) => void
  options:  { value: string; label: string }[]
  size?:    "default" | "sm"
}) {
  const height = size === "sm" ? 32 : 40
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          width: "100%",
          height,
          padding: "0 32px 0 12px",
          fontSize: 13,
          color: "var(--color-text-title)",
          background: "var(--field-bg)",
          border: "0.5px solid var(--field-border)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        style={{
          position: "absolute",
          right: 10, top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "var(--color-text-caption)",
        }}
      />
    </div>
  )
}

// ─── FormTextarea — shared textarea styled with DS field tokens ─────

export function FormTextarea({
  value, onChange, ariaLabel, minHeight = 52, rows = 2, disabled = false,
}: {
  value:     string
  onChange:  (v: string) => void
  ariaLabel: string
  minHeight?: number
  rows?:      number
  disabled?:  boolean
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      aria-label={ariaLabel}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "8px 12px",
        fontSize: 13,
        color: "var(--color-text-title)",
        background: "var(--field-bg)",
        border: "1px solid var(--field-border)",
        borderRadius: "var(--radius-md)",
        resize: "vertical",
        minHeight,
        opacity: disabled ? 0.5 : 1,
        fontFamily: "inherit",
      }}
    />
  )
}

// ─── Info banner (matches the "Multi-agent routing…" bottom banner) ─

export function InfoBanner({
  icon, children,
}: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-2"
      style={{
        padding: "10px 12px",
        background: "var(--color-surface-primary-more-subtle)",
        border: "1px solid var(--color-border-primary-subtle, var(--color-border-neutral-default))",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div style={{ color: "var(--color-icon-primary-default)", flexShrink: 0, marginTop: 2 }}>
        {icon}
      </div>
      <div style={{ fontSize: 12, color: "var(--color-text-caption)", lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  )
}
