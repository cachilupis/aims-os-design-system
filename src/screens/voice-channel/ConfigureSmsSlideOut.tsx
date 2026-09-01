import { useState, useEffect } from "react"
import { MessageSquare, Plus } from "lucide-react"
import { SlideOut } from "@/components/ui/slide-out"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import {
  Field, Divider, ToggleRow, NativeSelect, FormTextarea,
} from "./configure-shared"
import {
  CALLING_HOURS_OPTIONS,
  type SmsConfig,
} from "./voice-agents-data"
import type { PhoneNumberRecord } from "./data"
import { AddPhoneNumberModal } from "./AddPhoneNumberModal"

// ─────────────────────────────────────────────────────────────────────
// ConfigureSmsSlideOut — port of the "Configure SMS" slide-out from
// voice-channel-ux.html.
//
// Shares the same shell as Configure Voice: right-anchored SlideOut,
// number selector + Add Number, Configuration Name, boxed sub-tabs
// (General / Inbound / Outbound). Field content differs per source.
// ─────────────────────────────────────────────────────────────────────

interface ConfigureSmsSlideOutProps {
  open:         boolean
  onClose:      () => void
  agentName:    string
  numbers:      PhoneNumberRecord[]     // every workspace number
  numberIds:    string[]                 // assigned to this SMS channel
  config:       SmsConfig
  onSave:       (next: SmsConfig) => void
  onAddNumbers: (numberIds: string[]) => void
}

type SubTab = "general" | "inbound" | "outbound"

const SUB_TABS: TabItem[] = [
  { id: "general",  label: "General"  },
  { id: "inbound",  label: "Inbound"  },
  { id: "outbound", label: "Outbound" },
]

export function ConfigureSmsSlideOut({
  open, onClose, agentName, numbers, numberIds, config, onSave, onAddNumbers,
}: ConfigureSmsSlideOutProps) {
  const [draft,   setDraft]   = useState<SmsConfig>(config)
  const [subTab,  setSubTab]  = useState<SubTab>("general")
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => { if (open) setDraft(config) }, [open, config])

  const set   = <K extends keyof SmsConfig>(k: K, v: SmsConfig[K]) => setDraft(d => ({ ...d, [k]: v }))
  const setIn = <K extends keyof SmsConfig["inbound"]>(k: K, v: SmsConfig["inbound"][K]) =>
    setDraft(d => ({ ...d, inbound: { ...d.inbound, [k]: v } }))
  const setOut = <K extends keyof SmsConfig["outbound"]>(k: K, v: SmsConfig["outbound"][K]) =>
    setDraft(d => ({ ...d, outbound: { ...d.outbound, [k]: v } }))

  const handleSave = () => { onSave(draft); onClose() }

  // Dropdown lists only numbers already assigned to this channel.
  // Empty state surfaces a hint so Add Number is the obvious next step.
  const assignedNumbers = numbers.filter(n => numberIds.includes(n.id))
  const dropdownOptions = assignedNumbers.length > 0
    ? assignedNumbers.map(n => ({ value: n.id, label: `${n.number}${n.label ? ` — ${n.label}` : ""}` }))
    : [{ value: "", label: "No numbers assigned — use Add Number" }]

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
      title="Configure SMS"
      subtitle={agentName}
      showIcon={true}
      iconContent={<MessageSquare size={18}/>}
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

        {/* Number selector + Add Number */}
        <div className="flex items-end gap-2">
          <div style={{ flex: 1 }}>
            <NativeSelect
              value={draft.numberId}
              onChange={(v) => set("numberId", v)}
              options={dropdownOptions}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)} icon={<Plus size={12}/>}>
            Add Number
          </Button>
        </div>

        {/* Configuration Name */}
        <Field label="Configuration Name" hint="Identifies this SMS setup within the agent.">
          <Input
            value={draft.configurationName}
            onChange={(e) => set("configurationName", e.target.value)}
            placeholder="e.g. Service Desk SMS"
            size="default"
          />
        </Field>

        {/* Sub-tabs */}
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
            {subTab === "general" && (
              <div className="flex flex-col gap-4">
                <Field label="Number Label">
                  <Input
                    value={draft.numberLabel}
                    onChange={(e) => set("numberLabel", e.target.value)}
                    size="sm"
                  />
                </Field>
                <Divider/>
                <ToggleRow
                  label="TCPA opt-out enforcement"
                  desc="Automatically honor STOP / UNSUBSCRIBE replies"
                  checked={draft.tcpaOptOut}
                  onChange={(v) => set("tcpaOptOut", v)}
                />
                <ToggleRow
                  label="Message logging"
                  desc="Store SMS content and attach to contact timeline"
                  checked={draft.messageLogging}
                  onChange={(v) => set("messageLogging", v)}
                />
              </div>
            )}

            {subTab === "inbound" && (
              <div className="flex flex-col gap-4">
                <ToggleRow
                  label="Enable inbound SMS"
                  desc="Accept incoming text messages on this number"
                  checked={draft.inbound.enabled}
                  onChange={(v) => setIn("enabled", v)}
                  border={false}
                />
                <Divider/>
                <Field label="Auto-reply message">
                  <FormTextarea
                    value={draft.inbound.autoReply}
                    onChange={(v) => setIn("autoReply", v)}
                    ariaLabel="SMS auto-reply message"
                    minHeight={60}
                    rows={3}
                    disabled={!draft.inbound.enabled}
                  />
                </Field>
                <ToggleRow
                  label="Business hours only"
                  desc="Only reply during configured business hours"
                  checked={draft.inbound.businessHoursOnly}
                  onChange={(v) => setIn("businessHoursOnly", v)}
                />
              </div>
            )}

            {subTab === "outbound" && (
              <div className="flex flex-col gap-4">
                <ToggleRow
                  label="Enable outbound SMS"
                  desc="Allow this agent to send outbound text messages"
                  checked={draft.outbound.enabled}
                  onChange={(v) => setOut("enabled", v)}
                  border={false}
                />
                {draft.outbound.enabled && (
                  <>
                    <Divider/>
                    <Field label="Sending hours">
                      <NativeSelect
                        value={draft.outbound.sendingHours}
                        onChange={(v) => setOut("sendingHours", v)}
                        options={CALLING_HOURS_OPTIONS.map(o => ({ value: o, label: o }))}
                        size="sm"
                      />
                    </Field>
                    <ToggleRow
                      label="DNC enforcement"
                      desc="Block messages to Do Not Contact numbers"
                      checked={draft.outbound.dncEnforce}
                      onChange={(v) => setOut("dncEnforce", v)}
                    />
                    <ToggleRow
                      label="Max retry attempts"
                      desc="Retry failed message delivery"
                      checked={draft.outbound.maxRetries > 0}
                      onChange={(v) => setOut("maxRetries", v ? Math.max(1, draft.outbound.maxRetries || 1) : 0)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SlideOut>

    {/* Add Phone Number modal — reuses the same picker as Configure
        Voice; filters by numbers not already on this SMS channel. */}
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
