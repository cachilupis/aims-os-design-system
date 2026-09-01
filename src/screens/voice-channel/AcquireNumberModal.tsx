import { useEffect, useState } from "react"
import { CheckCircle2, MapPin } from "lucide-react"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tag } from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { AlertBanner } from "@/components/ui/alert-banner"
import {
  AVAILABLE_NUMBERS,
  COUNTRIES,
  DISTRIBUTION_MODES,
  TIMEZONES,
  type PhoneNumberRecord,
  type NumberType,
  type Distribution,
} from "./data"

type Step = 1 | 2 | 3 | 4

interface AcquireNumberModalProps {
  open:      boolean
  onClose:   () => void
  onAcquire: (n: PhoneNumberRecord) => void
}

export function AcquireNumberModal({ open, onClose, onAcquire }: AcquireNumberModalProps) {
  const [step,        setStep]        = useState<Step>(1)
  const [country,     setCountry]     = useState(COUNTRIES[0].label)
  const [numberType,  setNumberType]  = useState<NumberType>("Local")
  const [areaCode,    setAreaCode]    = useState("")
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [label,       setLabel]       = useState("")
  const [dist,        setDist]        = useState<Distribution>("Round Robin")
  const [timezone,    setTimezone]    = useState(TIMEZONES[0])

  useEffect(() => {
    if (open) {
      setStep(1); setCountry(COUNTRIES[0].label); setNumberType("Local"); setAreaCode("")
      setSelectedIdx(null); setLabel(""); setDist("Round Robin"); setTimezone(TIMEZONES[0])
    }
  }, [open])

  const sel = selectedIdx !== null ? AVAILABLE_NUMBERS[selectedIdx] : null

  function complete() {
    if (!sel) return
    const newNum: PhoneNumberRecord = {
      id:        `n${Date.now()}`,
      number:    sel.number,
      label:     label || "New Line",
      type:      numberType,
      status:    "active",
      agents:    [],
      dist,
      hil:       false,
      calls:     0,
      cost:      0,
      country:   "🇺🇸",
      sentiment: null,
    }
    // On step 4 the prototype already added the number; here we push it via the parent
    // and let step 4 render the success state before user closes.
    onAcquire(newNum)
  }

  const canAdvance =
    step === 1 ? true :
    step === 2 ? selectedIdx !== null :
    step === 3 ? label.trim().length > 0 :
    /* step === 4 */ true

  const primaryLabel =
    step === 1 ? "Search Numbers →" :
    step === 2 ? "Continue →" :
    step === 3 ? "Acquire Number" :
    /* step === 4 */ "View Number →"

  const secondaryLabel =
    step === 1 ? "Cancel" :
    step === 4 ? "Done"   :
                 "← Back"

  const description =
    step === 1 ? "Step 1 of 4 · Country & Type"    :
    step === 2 ? "Step 2 of 4 · Choose Number"      :
    step === 3 ? "Step 3 of 4 · Configure"          :
                 "Step 4 of 4 · Confirm"

  return (
    <ModalDialog
      isOpen={open}
      onClose={onClose}
      variant="content"
      tone="default"
      iconName="Phone"
      title="Acquire Phone Number"
      description={description}
      slot={
        <div className="flex flex-col gap-4 min-h-[360px]">
          <StepperBar step={step}/>

          {step === 1 && (
            <>
              <FieldLabel>Country</FieldLabel>
              <Select value={country} onClear={() => setCountry(COUNTRIES[0].label)} size="default" />

              <FieldLabel>Number Type</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {(["Local", "Toll-Free", "Mobile"] as NumberType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setNumberType(t)}
                    style={typeCardStyle(numberType === t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <FieldLabel>Area Code (optional)</FieldLabel>
              <Input
                placeholder="e.g. 415"
                value={areaCode}
                onChange={e => setAreaCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                size="default"
              />
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 4 }}>
                {AVAILABLE_NUMBERS.length} numbers available — select one to continue
              </div>
              <div className="flex flex-col gap-1">
                {AVAILABLE_NUMBERS.map((n, i) => (
                  <button
                    key={n.number}
                    onClick={() => setSelectedIdx(i)}
                    style={numRowStyle(selectedIdx === i)}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="font-mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>{n.number}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-caption)", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={10}/> {n.region}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {n.caps.map(c => <Tag key={c} variant={selectedIdx === i ? "informative" : "secondary"} size="sm">{c}</Tag>)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: selectedIdx === i ? "var(--primary)" : "var(--color-text-caption)", minWidth: 70, textAlign: "right" }}>
                      {n.price}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && sel && (
            <>
              <CardContainer variant="primary" size="default">
                <div className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-title)", textAlign: "center" }}>{sel.number}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-caption)", textAlign: "center", marginTop: 4 }}>{sel.region}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", textAlign: "center", marginTop: 8 }}>{sel.price}</div>
              </CardContainer>

              <FieldLabel>Label (required)</FieldLabel>
              <Input
                placeholder="e.g. Sales Line, Support West"
                value={label}
                onChange={e => setLabel(e.target.value)}
                size="default"
              />

              <FieldLabel>Distribution Mode</FieldLabel>
              <div className="flex flex-col gap-1">
                {DISTRIBUTION_MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setDist(m.id)}
                    style={numRowStyle(dist === m.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{m.id}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <FieldLabel>Timezone</FieldLabel>
              <Select value={timezone} size="default" />
            </>
          )}

          {step === 4 && sel && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <CheckCircle2 size={44} style={{ color: "var(--color-text-success)", margin: "0 auto 12px", display: "block" }}/>
              <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>{sel.number}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-caption)", marginBottom: 16 }}>
                {label || "New Line"} · {numberType} · {sel.region}
              </div>
              <AlertBanner
                state="success"
                title="Your number is now active"
                description="Add agents to start handling calls."
              />
            </div>
          )}
        </div>
      }
      ctaSecondary={{
        label:   secondaryLabel,
        onClick: step === 1 ? onClose : step === 4 ? onClose : () => setStep((step - 1) as Step),
      }}
      ctaPrimary={{
        label:    primaryLabel,
        disabled: !canAdvance,
        onClick:  () => {
          if (step === 3) { complete(); setStep(4) }
          else if (step === 4) onClose()
          else setStep((step + 1) as Step)
        },
      }}
    />
  )
}

// ── Stepper bar (4 steps) ──────────────────────────────────────────────

function StepperBar({ step }: { step: Step }) {
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "Country & Type" },
    { n: 2, label: "Choose Number"  },
    { n: 3, label: "Configure"      },
    { n: 4, label: "Confirm"        },
  ]
  return (
    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
      {steps.map((s, i) => {
        const active = step >= s.n
        const done   = step > s.n
        return (
          <div key={s.n} className="flex items-center gap-2" style={{ flex: i < steps.length - 1 ? 1 : "0 0 auto" }}>
            <div className="flex items-center gap-2">
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: active ? "var(--primary)" : "var(--color-surface-neutral-more-subtle)",
                color: active ? "var(--primary-foreground)" : "var(--color-text-caption)",
                fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                {done ? "✓" : s.n}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? "var(--color-text-title)" : "var(--color-text-caption)" }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? "var(--primary)" : "var(--color-border-neutral-default)" }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)", marginTop: 6 }}>{children}</div>
  )
}

const typeCardStyle = (selected: boolean): React.CSSProperties => ({
  padding: "10px 12px",
  border: `1px solid ${selected ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
  borderRadius: 8,
  background: selected ? "var(--color-surface-primary-more-subtle)" : "transparent",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  color: selected ? "var(--primary)" : "var(--color-text-title)",
})

const numRowStyle = (selected: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  border: `1px solid ${selected ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
  borderRadius: 8,
  background: selected ? "var(--color-surface-primary-more-subtle)" : "transparent",
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
})
