import { Check } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────
// Marketplace-shared — tiny sidebar helpers shared between the
// Knowledge Pack Library and Source Drive Library marketplaces. Both
// modals reproduce the same rail shape (uppercase section labels +
// pill groups + check rows), so the visual atoms live here to keep
// the two modals in visual lockstep.
// ─────────────────────────────────────────────────────────────────────

export function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: "var(--color-text-caption)",
      padding: "0 4px",
    }}>
      {children}
    </div>
  )
}

export function PillGroup({
  options, value, onChange,
}: {
  options: { value: string; label: string }[]
  value:   string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-1" style={{ padding: 2 }}>
      {options.map(o => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              height: 28,
              padding: "0 8px",
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              color:      active ? "var(--primary)" : "var(--color-text-caption)",
              background: active ? "var(--color-surface-primary-more-subtle)" : "transparent",
              border: `1px solid ${active ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function CheckRow({
  label, count, dot, checked, onToggle,
}: {
  label:    string
  count?:   number
  dot?:     string
  checked:  boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 8px",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: checked ? "var(--color-text-title)" : "var(--color-text-caption)",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: checked ? 600 : 500,
        textAlign: "left",
        transition: "background 150ms ease",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 14, height: 14, borderRadius: 4,
          border: `1.5px solid ${checked ? "var(--primary)" : "var(--field-border)"}`,
          background: checked ? "var(--primary)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && <Check size={10} strokeWidth={3} color="var(--primary-foreground, #fff)"/>/* audit-ignore: #fff is the CSS var fallback for --primary-foreground */}
      </span>
      {dot && (
        <span
          aria-hidden
          style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }}
        />
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{count}</span>
      )}
    </button>
  )
}
