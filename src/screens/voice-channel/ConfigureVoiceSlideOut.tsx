import { useState, useEffect } from "react"
import { Phone, Play, Plus, Info, Minus, ChevronDown } from "lucide-react"
import { SlideOut } from "@/components/ui/slide-out"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import { CardContainer } from "@/components/ui/card-container"
import { AddPhoneNumberModal } from "./AddPhoneNumberModal"
import {
  VOICE_MODEL_OPTIONS,
  VOICE_NAME_OPTIONS,
  SCHEDULE_OPTIONS,
  CALLING_HOURS_OPTIONS,
  MAX_RETRY_CAP,
  type VoiceConfig,
  type VoiceModel,
  type VoiceName,
} from "./voice-agents-data"
import type { PhoneNumberRecord } from "./data"

// ─────────────────────────────────────────────────────────────────────
// ConfigureVoiceSlideOut — 1:1 port of the "Configure Voice" slide-out
// in voice-channel-ux.html.
//
// Layout: right-anchored SlideOut with 3 stacked sections in the body —
//   1. Number selector + Add Number button
//   2. Configuration Name input
//   3. Boxed sub-tabs (General / Inbound / Outbound)
//
// The sub-tabs live inside a bordered container that mimics the boxed
// tab pattern from the source prototype's slide-out (its .tabs inside
// a bordered wrapper). Each tab body is a scrollable form of DS Toggle
// + Input + Select fields — no custom form controls introduced here.
// ─────────────────────────────────────────────────────────────────────

interface ConfigureVoiceSlideOutProps {
  open:      boolean
  onClose:   () => void
  agentName: string                // "Sammy — Service Desk"
  numbers:   PhoneNumberRecord[]   // every workspace number
  numberIds: string[]              // numbers currently assigned to this channel
  config:    VoiceConfig           // current voice channel config
  onSave:    (next: VoiceConfig) => void
  /** Called when Add Phone Number returns picked ids. */
  onAddNumbers: (numberIds: string[]) => void
}

type SubTab = "general" | "inbound" | "outbound"

const SUB_TABS: TabItem[] = [
  { id: "general",  label: "General"  },
  { id: "inbound",  label: "Inbound"  },
  { id: "outbound", label: "Outbound" },
]

export function ConfigureVoiceSlideOut({
  open, onClose, agentName, numbers, numberIds, config, onSave, onAddNumbers,
}: ConfigureVoiceSlideOutProps) {
  const [draft, setDraft]   = useState<VoiceConfig>(config)
  const [subTab, setSubTab] = useState<SubTab>("general")
  const [addOpen, setAddOpen] = useState(false)

  // Re-hydrate when opening for a different channel
  useEffect(() => { if (open) setDraft(config) }, [open, config])

  // The number dropdown lists only numbers assigned to this channel —
  // Add Number is the way to grow that list. If the current draft
  // numberId isn't in the list (e.g. someone just added a number and
  // the config still points at the old one) we still surface the old
  // one so the picker doesn't look empty.
  const assignedNumbers = numbers.filter(n => numberIds.includes(n.id))
  const dropdownOptions = assignedNumbers.length > 0
    ? assignedNumbers.map(n => ({ value: n.id, label: `${n.number}${n.label ? ` — ${n.label}` : ""}` }))
    : [{ value: "", label: "No numbers assigned — use Add Number" }]

  // Setter helpers keep the update paths immutable (no in-place mutation).
  const set   = <K extends keyof VoiceConfig>(k: K, v: VoiceConfig[K]) => setDraft(d => ({ ...d, [k]: v }))
  const setIn = <K extends keyof VoiceConfig["inbound"]>(k: K, v: VoiceConfig["inbound"][K]) =>
    setDraft(d => ({ ...d, inbound: { ...d.inbound, [k]: v } }))
  const setOut = <K extends keyof VoiceConfig["outbound"]>(k: K, v: VoiceConfig["outbound"][K]) =>
    setDraft(d => ({ ...d, outbound: { ...d.outbound, [k]: v } }))

  const handleSave = () => { onSave(draft); onClose() }

  // When Add Phone Number returns picks: append them to the channel
  // and switch the active dropdown to the first new one so the user
  // immediately sees which number they just added.
  const handleAdd = (newIds: string[]) => {
    onAddNumbers(newIds)
    if (newIds[0]) set("numberId", newIds[0])
  }

  return (
    <>
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      title="Configure Voice"
      subtitle={agentName}
      showIcon={true}
      iconContent={<Phone size={18}/>}
      showStatus={false}
      showTopButton={false}
      showTabs={false}
      showChips={false}
      showSearchBar={false}
      showCta={true}
      ctaPrimaryLabel="Save Changes"
      ctaSecondaryLabel="Cancel"
      onCtaPrimary={handleSave}
      onCtaSecondary={onClose}
    >
      <div className="flex flex-col gap-4 px-6 py-4">

        {/* ── Number selector + Add Number ─────────────────────────── */}
        <div className="flex items-end gap-2">
          <div style={{ flex: 1 }}>
            <NativeSelect
              value={draft.numberId}
              onChange={(v) => set("numberId", v)}
              size="default"
              options={dropdownOptions}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)} icon={<Plus size={12}/>}>
            Add Number
          </Button>
        </div>

        {/* ── Configuration Name ───────────────────────────────────── */}
        <Field
          label="Configuration Name"
          hint="Identifies this voice setup within the agent."
        >
          <Input
            value={draft.configurationName}
            onChange={(e) => set("configurationName", e.target.value)}
            placeholder="e.g. Service Desk Voice"
            size="default"
          />
        </Field>

        {/* ── Sub-tabs (General / Inbound / Outbound) ──────────────── */}
        <div
          style={{
            border: "1px solid var(--color-border-neutral-default)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            background: "var(--color-surface-neutral-subtle)",
          }}
        >
          <div
            style={{
              padding: "0 14px",
              background: "var(--color-surface-neutral-default)",
              borderBottom: "1px solid var(--color-border-neutral-default)",
            }}
          >
            <Tabs items={SUB_TABS} activeId={subTab} onChange={(id) => setSubTab(id as SubTab)} size="s"/>
          </div>

          <div style={{ padding: 16 }}>
            {subTab === "general"  && <GeneralPanel  draft={draft} set={set}/>}
            {subTab === "inbound"  && <InboundPanel  draft={draft} setIn={setIn}/>}
            {subTab === "outbound" && <OutboundPanel draft={draft} setOut={setOut}/>}
          </div>
        </div>

        {/* ── Info banner ──────────────────────────────────────────── */}
        <div
          className="flex items-start gap-2"
          style={{
            padding: "10px 12px",
            background: "var(--color-surface-primary-more-subtle)",
            border: "1px solid var(--color-border-primary-subtle, var(--color-border-neutral-default))",
            borderRadius: "var(--radius-md)",
          }}
        >
          <Info size={14} style={{ color: "var(--color-icon-primary-default)", flexShrink: 0, marginTop: 2 }}/>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", lineHeight: 1.5 }}>
            Multi-agent routing, language detection, and step-by-step Voice flows are configured inside the{" "}
            <span style={{ color: "var(--color-icon-primary-default)", fontWeight: 500, cursor: "pointer" }}>
              Agentic Network editor
            </span>.
          </div>
        </div>
      </div>
    </SlideOut>

    {/* Add Phone Number modal — reads the workspace numbers, excludes
        anything already on this channel, and appends the user's picks
        to numberIds via onAddNumbers. */}
    <AddPhoneNumberModal
      open={addOpen}
      onClose={() => setAddOpen(false)}
      numbers={numbers}
      assignedIds={numberIds}
      onAdd={handleAdd}
    />
    </>
  )
}

// ─── Sub-panels ─────────────────────────────────────────────────────

function GeneralPanel({
  draft, set,
}: {
  draft: VoiceConfig
  set: <K extends keyof VoiceConfig>(k: K, v: VoiceConfig[K]) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Number Label" hint="Internal name shown in the numbers list for this configuration.">
        <Input
          value={draft.numberLabel}
          onChange={(e) => set("numberLabel", e.target.value)}
          placeholder="e.g. Main IVR line"
          size="sm"
        />
      </Field>

      <Divider/>

      <Field label="Voice Model">
        <div className="flex items-center gap-2">
          <div style={{ flex: 1 }}>
            <NativeSelect
              value={draft.voiceModel}
              onChange={(v) => set("voiceModel", v as VoiceModel)}
              options={VOICE_MODEL_OPTIONS.map(m => ({ value: m, label: m }))}
              size="sm"
            />
          </div>
          <Button variant="secondary" size="sm" icon={<Play size={12}/>}>Preview</Button>
        </div>
        <VoicePills
          voices={VOICE_NAME_OPTIONS}
          active={draft.voiceName}
          onChange={(v) => set("voiceName", v)}
        />
      </Field>

      <Field
        label="Recording Consent (GDPR)"
        hint="Played at the start of every call before recording begins."
      >
        <textarea
          value={draft.recordingConsentText}
          onChange={(e) => set("recordingConsentText", e.target.value)}
          rows={2}
          aria-label="Legal recording disclosure text"
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: 13,
            color: "var(--color-text-title)",
            background: "var(--field-bg)",
            border: "1px solid var(--field-border)",
            borderRadius: "var(--radius-md)",
            resize: "vertical",
            minHeight: 52,
            fontFamily: "inherit",
          }}
        />
      </Field>

      <Divider/>

      <SectionLabel>Security &amp; Compliance</SectionLabel>
      <ToggleRow
        label="Call recording"
        desc="Store audio and attach to contact timeline"
        checked={draft.callRecording}
        onChange={(v) => set("callRecording", v)}
      />
      <ToggleRow
        label="Voicemail transcription"
        desc="Attach transcript to contact activity feed"
        checked={draft.voicemailTranscription}
        onChange={(v) => set("voicemailTranscription", v)}
      />
    </div>
  )
}

function InboundPanel({
  draft, setIn,
}: {
  draft: VoiceConfig
  setIn: <K extends keyof VoiceConfig["inbound"]>(k: K, v: VoiceConfig["inbound"][K]) => void
}) {
  const { inbound } = draft
  return (
    <div className="flex flex-col gap-4">
      <ToggleRow
        label="Enable inbound"
        desc="Accept incoming calls on this number"
        checked={inbound.enabled}
        onChange={(v) => setIn("enabled", v)}
        border={false}
      />

      <Divider/>

      <Field
        label="Greeting Message"
        hint="Plays for every inbound caller. No conditional logic in v1."
      >
        <textarea
          value={inbound.greeting}
          onChange={(e) => setIn("greeting", e.target.value)}
          rows={3}
          aria-label="Voice agent greeting"
          disabled={!inbound.enabled}
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: 13,
            color: "var(--color-text-title)",
            background: "var(--field-bg)",
            border: "1px solid var(--field-border)",
            borderRadius: "var(--radius-md)",
            resize: "vertical",
            minHeight: 68,
            opacity: inbound.enabled ? 1 : 0.5,
            fontFamily: "inherit",
          }}
        />
      </Field>

      <div>
        <ToggleRow
          label="Business Hours"
          desc="Restrict inbound calls to scheduled hours only"
          checked={inbound.businessHours}
          onChange={(v) => setIn("businessHours", v)}
          border={false}
        />
        {inbound.businessHours && (
          <div style={{
            marginTop: 12, paddingTop: 12,
            borderTop: "1px solid var(--color-border-neutral-default)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <Field label="Schedule">
              <NativeSelect
                value={inbound.schedule}
                onChange={(v) => setIn("schedule", v)}
                options={SCHEDULE_OPTIONS.map(s => ({ value: s, label: s }))}
                size="sm"
              />
            </Field>
            <Field label="Out-of-hours message">
              <textarea
                value={inbound.outOfHoursMsg}
                onChange={(e) => setIn("outOfHoursMsg", e.target.value)}
                rows={2}
                aria-label="Out-of-hours voicemail message"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--color-text-title)",
                  background: "var(--field-bg)",
                  border: "1px solid var(--field-border)",
                  borderRadius: "var(--radius-md)",
                  resize: "vertical",
                  minHeight: 52,
                  fontFamily: "inherit",
                }}
              />
            </Field>
          </div>
        )}
      </div>

      <ToggleRow
        label="Drop VM message"
        desc="Read script when voicemail picks up"
        checked={inbound.dropVmMessage}
        onChange={(v) => setIn("dropVmMessage", v)}
      />
    </div>
  )
}

function OutboundPanel({
  draft, setOut,
}: {
  draft: VoiceConfig
  setOut: <K extends keyof VoiceConfig["outbound"]>(k: K, v: VoiceConfig["outbound"][K]) => void
}) {
  const { outbound } = draft
  return (
    <div className="flex flex-col gap-4">
      <ToggleRow
        label="Enable outbound"
        desc="Allow this agent to place outbound calls"
        checked={outbound.enabled}
        onChange={(v) => setOut("enabled", v)}
        border={false}
      />

      {outbound.enabled && (
        <>
          <Divider/>

          <Field
            label="Calling Hours"
            hint="Verify state-specific calling hour regulations."
          >
            <NativeSelect
              value={outbound.callingHours}
              onChange={(v) => setOut("callingHours", v)}
              options={CALLING_HOURS_OPTIONS.map(o => ({ value: o, label: o }))}
              size="sm"
            />
          </Field>

          <ToggleRow
            label="DNC enforcement"
            desc="Block calls to Do Not Call registry numbers"
            checked={outbound.dncEnforce}
            onChange={(v) => setOut("dncEnforce", v)}
          />
          <ToggleRow
            label="Voicemail drop"
            desc="Leave a pre-recorded message when VM answers"
            checked={outbound.voicemailDrop}
            onChange={(v) => setOut("voicemailDrop", v)}
          />

          {/* Max retry attempts — the source prototype pairs a toggle with an
              inline stepper; here the toggle enables retries (>0) and the
              stepper adjusts the count when enabled. */}
          <CardContainer variant="default" size="sm">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Max retry attempts
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 2 }}>
                  Retry unanswered calls automatically
                </div>
              </div>
              <Toggle
                checked={outbound.maxRetries > 0}
                onChange={(v) => setOut("maxRetries", v ? Math.max(1, outbound.maxRetries || 1) : 0)}
                size="sm"
              />
            </div>
            {outbound.maxRetries > 0 && (
              <div className="flex items-center gap-3 mt-3">
                <RetryStepper
                  value={outbound.maxRetries}
                  onChange={(n) => setOut("maxRetries", n)}
                  max={MAX_RETRY_CAP}
                />
                <span style={{ fontSize: 12, color: "var(--color-text-caption)" }}>
                  attempts · max {MAX_RETRY_CAP}
                </span>
              </div>
            )}
          </CardContainer>
        </>
      )}
    </div>
  )
}

// ─── Local helpers ──────────────────────────────────────────────────

function Field({
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

function Divider() {
  return <div style={{ height: 1, background: "var(--color-border-neutral-default)" }}/>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: "var(--color-text-caption)",
    }}>
      {children}
    </div>
  )
}

function ToggleRow({
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

function VoicePills({
  voices, active, onChange,
}: { voices: VoiceName[]; active: VoiceName; onChange: (v: VoiceName) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {voices.map(v => {
        const isActive = v === active
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
              color:      isActive ? "var(--primary)"                     : "var(--color-text-title)",
              background: isActive ? "var(--color-surface-primary-more-subtle)" : "var(--field-bg)",
              border: `1px solid ${isActive ? "var(--primary)" : "var(--field-border)"}`,
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            {v}
          </button>
        )
      })}
      <button
        type="button"
        style={{
          padding: "4px 10px",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--color-text-caption)",
          background: "transparent",
          border: "1px dashed var(--color-border-neutral-default)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
        }}
      >
        + More
      </button>
    </div>
  )
}

// NativeSelect — a real <select> styled with DS tokens. The DS Select
// primitive only renders a trigger; the actual dropdown/options is a
// caller concern. For a form-heavy slide-out with many enum choices,
// a native select is the simplest solid working control and matches
// the source prototype's <select class="input"> pattern.
function NativeSelect({
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

function RetryStepper({
  value, onChange, max,
}: { value: number; onChange: (n: number) => void; max: number }) {
  const stepBtn: React.CSSProperties = {
    width: 28, height: 28,
    borderRadius: "var(--radius-sm)",
    background: "var(--field-bg)",
    border: "1px solid var(--field-border)",
    color: "var(--color-text-title)",
    fontSize: 16, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    lineHeight: 1,
  }
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        style={stepBtn}
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease retries"
      >
        <Minus size={12}/>
      </button>
      <div style={{
        width: 36, textAlign: "center",
        fontSize: 16, fontWeight: 700,
        color: "var(--color-text-title)",
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>
      <button
        type="button"
        style={stepBtn}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase retries"
      >
        <Plus size={12}/>
      </button>
    </div>
  )
}
