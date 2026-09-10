// ────────────────────────────────────────────────────────────────────────
// Shared primitives for the Configuration form's sections.
// ────────────────────────────────────────────────────────────────────────

import { useRef, useState, type ReactNode } from "react"
import { Popover } from "@base-ui/react/popover"
import { Sparkle, Loader2 } from "lucide-react"
import { CardContainer } from "@/components/ui/card-container"
import { Select } from "@/components/ui/select"
import { MenuItem } from "@/components/ui/menu-item"
import { Button } from "@/components/ui/button"

const SUB = "var(--field-supporting)"
const TXT = "var(--foreground)"

// ── Layout ──────────────────────────────────────────────────────────────

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <CardContainer className="flex flex-col gap-[16px]">
      <span style={{ fontSize: 14, fontWeight: 600, color: TXT }}>{title}</span>
      {children}
    </CardContainer>
  )
}

/** Heading above a field, replacing Input/Textarea's `label` prop — that's a
 *  mobile-only floating label per DS Guardrails; on desktop the label is a
 *  plain heading above the field instead. */
export function FieldHeading({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 500, color: TXT, marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: "var(--tag-error-fg)" }}> *</span>}
    </div>
  )
}

export function HelperText({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 12, color: SUB, margin: "6px 0 0" }}>{children}</p>
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

// ── SelectField — Select is a trigger only (DS Guardrails); compose a
// working dropdown with @base-ui/react's Popover anchored to the trigger,
// never hand-computed coordinates. Mirrors PgInteractiveSelect in App.tsx
// (Patterns → Forms doc page), the DS's own reference composition. ──────

export function SelectField({ value, onChange, options, placeholder }: {
  value: string | null
  onChange: (v: string) => void
  options: readonly string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={triggerRef}>
      <Select
        placeholder={placeholder}
        value={value ?? undefined}
        open={open}
        onClick={() => setOpen(o => !o)}
        onClear={() => onChange("")}
      />
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Portal>
          <Popover.Positioner anchor={triggerRef} side="bottom" align="start" sideOffset={4} style={{ zIndex: 10030 }}>
            <Popover.Popup
              className="flex flex-col rounded-[8px] overflow-hidden"
              style={{
                minWidth: 220,
                maxHeight: 280,
                overflowY: "auto",
                background: "var(--surface-floating-default)",
                border: "0.5px solid var(--color-border-neutral-subtle)",
                boxShadow: "var(--shadow-elevation-5)",
              }}
            >
              {options.map(opt => (
                <MenuItem key={opt} label={opt} size="sm" onClick={() => { onChange(opt); setOpen(false) }} />
              ))}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

// ── AssistButton — AI-assist trigger. Stub: shows a loading state, then
// no-ops. Real generation lands in a later prompt. ──────────────────────

export function AssistButton({ onClick }: { onClick?: () => void }) {
  const [loading, setLoading] = useState(false)

  function handleClick() {
    if (loading) return
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1200)
    onClick?.()
  }

  return (
    <Button variant="tertiary" size="sm" onClick={handleClick} disabled={loading}
      icon={loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkle size={13} />}>
      {loading ? "Generating…" : "Assist"}
    </Button>
  )
}
