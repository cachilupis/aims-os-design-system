import { useState } from "react"
import { Save } from "lucide-react"
import { CardContainer } from "@/components/ui/card-container"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import {
  DISTRIBUTION_MODES,
  TIMEZONES,
} from "./data"
import { NativeSelect } from "./configure-shared"
import { useToast } from "./toast"

const BUSINESS_HOURS_PRESETS = [
  "Monday–Friday 9AM–6PM",
  "24/7",
  "Custom",
]

export function SettingsTab() {
  const toast = useToast()
  const [recordAll, setRecordAll] = useState(true)
  const [autoTrans, setAutoTrans] = useState(true)
  const [sentiment, setSentiment] = useState(true)
  const [dist,      setDist]      = useState<string>(DISTRIBUTION_MODES[0].id)
  const [tz,        setTz]        = useState<string>(TIMEZONES[0])
  const [hours,     setHours]     = useState<string>(BUSINESS_HOURS_PRESETS[0])

  function save() {
    toast.success("Settings saved")
  }

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 640 }}>
      <CardContainer variant="default" size="default">
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
          Workspace Voice Defaults
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 20 }}>
          Applied to new numbers unless overridden per-number.
        </div>

        <div className="flex flex-col gap-4">
          <SelectField
            label="Default Distribution Mode"
            value={dist}
            onChange={setDist}
            options={DISTRIBUTION_MODES.map(d => ({ value: d.id, label: d.id }))}
          />
          <SelectField
            label="Default Timezone"
            value={tz}
            onChange={setTz}
            options={TIMEZONES.map(t => ({ value: t, label: t }))}
          />
          <SelectField
            label="Default Business Hours"
            value={hours}
            onChange={setHours}
            options={BUSINESS_HOURS_PRESETS.map(h => ({ value: h, label: h }))}
          />

          <ToggleRow
            label="Record all calls"
            sub="Recordings kept for 30 days and searchable in Call History"
            checked={recordAll}
            onChange={setRecordAll}
          />
          <ToggleRow
            label="Auto-transcribe"
            sub="Automatic transcription in 30+ languages"
            checked={autoTrans}
            onChange={setAutoTrans}
          />
          <ToggleRow
            label="AI sentiment analysis"
            checked={sentiment}
            onChange={setSentiment}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <Button variant="primary" size="default" icon={<Save size={14}/>} iconPosition="left" onClick={save}>
            Save Defaults
          </Button>
        </div>
      </CardContainer>
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────

function SelectField({
  label, value, onChange, options,
}: {
  label:    string
  value:    string
  onChange: (v: string) => void
  options:  { value: string; label: string }[]
}) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 6 }}>{label}</div>
      <NativeSelect value={value} onChange={onChange} options={options} size="default"/>
    </div>
  )
}

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "12px 0", borderTop: "1px solid var(--color-border-neutral-default)" }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{sub}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} size="default"/>
    </div>
  )
}
