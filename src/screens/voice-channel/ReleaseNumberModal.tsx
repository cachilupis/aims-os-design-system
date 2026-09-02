import { useEffect, useState } from "react"
import { Users, PhoneCall, Shield, DollarSign, AlertTriangle } from "lucide-react"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Input } from "@/components/ui/input"
import { AlertBanner } from "@/components/ui/alert-banner"
import type { PhoneNumberRecord } from "./data"

interface ReleaseNumberModalProps {
  number:    PhoneNumberRecord | null
  open:      boolean
  onClose:   () => void
  onConfirm: () => void
}

export function ReleaseNumberModal({ number, open, onClose, onConfirm }: ReleaseNumberModalProps) {
  const [confirm, setConfirm] = useState("")

  useEffect(() => { if (open) setConfirm("") }, [open])

  if (!number) return null

  const last4 = number.number.slice(-4)
  const canRelease = confirm === last4

  return (
    <ModalDialog
      isOpen={open}
      onClose={onClose}
      variant="content"
      tone="error"
      iconName="AlertTriangle"
      title="Release Number"
      description="This action is irreversible"
      slot={
        <div className="flex flex-col gap-4">
          <div style={{ textAlign: "center" }}>
            <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-title)" }}>{number.number}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>{number.label || "No label"}</div>
          </div>

          <div className="flex flex-col gap-2">
            <ImpactRow icon={<Users      size={14}/>} text={`${number.agents.length} agents will be unassigned`}/>
            <ImpactRow icon={<PhoneCall  size={14}/>} text={`${number.calls.toLocaleString()} calls handled in the last 30 days`}/>
            <ImpactRow icon={<Shield     size={14}/>} text="HiL configuration will be permanently deleted"/>
            <ImpactRow icon={<DollarSign size={14}/>} text={`Monthly savings: $${number.cost.toFixed(2)}/mo`}/>
          </div>

          <AlertBanner
            state="error"
            title="This action is irreversible"
            description="The number will return to the public pool immediately."
          />

          <div>
            <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 6 }}>
              Type the last 4 digits of the number to confirm:
            </div>
            <Input
              placeholder="_ _ _ _"
              value={confirm}
              onChange={e => setConfirm(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
              size="default"
              state={confirm.length === 4 ? (canRelease ? "success" : "error") : "default"}
              style={{ fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.3em", textAlign: "center" }}
              maxLength={4}
            />
          </div>
        </div>
      }
      ctaSecondary={{ label: "Cancel", onClick: onClose }}
      ctaPrimary={{
        label:       "Release Number",
        destructive: true,
        // DS-GAP: ModalDialog.ctaPrimary has no `disabled?: boolean`. The
        // last-4-digit confirmation gate has to be enforced in the onClick
        // handler; the destructive CTA visually stays enabled while the
        // user types the wrong digits, which weakens the guard.
        onClick:     () => { if (canRelease) onConfirm() },
      }}
    />
  )
}

function ImpactRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px",
      background: "var(--color-surface-neutral-more-subtle)",
      borderRadius: 6,
      fontSize: 13,
      color: "var(--color-text-body)",
    }}>
      <span style={{ color: "var(--color-icon-neutral-default)", flexShrink: 0 }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

// keep AlertTriangle referenced so tsc doesn't complain about unused import in some builds
void AlertTriangle
