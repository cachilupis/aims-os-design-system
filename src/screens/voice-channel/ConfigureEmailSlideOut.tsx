import { useState, useEffect } from "react"
import { Mail, Plus } from "lucide-react"
import { SlideOut } from "@/components/ui/slide-out"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import {
  Field, Divider, ToggleRow, NativeSelect, FormTextarea,
} from "./configure-shared"
import {
  AVAILABLE_EMAIL_ADDRESSES,
  EMAIL_SENDING_HOURS_OPTIONS,
  type EmailConfig,
} from "./voice-agents-data"
import { AddEmailAddressModal } from "./AddEmailAddressModal"

// ─────────────────────────────────────────────────────────────────────
// ConfigureEmailSlideOut — port of the "Configure Email" slide-out
// from voice-channel-ux.html. Same shell as Voice/SMS variants but
// with email-specific fields (Display name, Reply-to, Spam filtering,
// Templates).
// ─────────────────────────────────────────────────────────────────────

interface ConfigureEmailSlideOutProps {
  open:          boolean
  onClose:       () => void
  agentName:     string
  addressIds:    string[]              // assigned to this Email channel
  config:        EmailConfig
  onSave:        (next: EmailConfig) => void
  onAddAddresses: (addressIds: string[]) => void
}

type SubTab = "general" | "inbound" | "outbound"

const SUB_TABS: TabItem[] = [
  { id: "general",  label: "General"  },
  { id: "inbound",  label: "Inbound"  },
  { id: "outbound", label: "Outbound" },
]

export function ConfigureEmailSlideOut({
  open, onClose, agentName, addressIds, config, onSave, onAddAddresses,
}: ConfigureEmailSlideOutProps) {
  const [draft,   setDraft]   = useState<EmailConfig>(config)
  const [subTab,  setSubTab]  = useState<SubTab>("general")
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => { if (open) setDraft(config) }, [open, config])

  const set   = <K extends keyof EmailConfig>(k: K, v: EmailConfig[K]) => setDraft(d => ({ ...d, [k]: v }))
  const setIn = <K extends keyof EmailConfig["inbound"]>(k: K, v: EmailConfig["inbound"][K]) =>
    setDraft(d => ({ ...d, inbound: { ...d.inbound, [k]: v } }))
  const setOut = <K extends keyof EmailConfig["outbound"]>(k: K, v: EmailConfig["outbound"][K]) =>
    setDraft(d => ({ ...d, outbound: { ...d.outbound, [k]: v } }))

  const handleSave = () => { onSave(draft); onClose() }

  // Dropdown lists only addresses assigned to this channel; unassigned
  // ones live in Add Address. Empty channel gets a hint row.
  const assignedAddresses = AVAILABLE_EMAIL_ADDRESSES.filter(a => addressIds.includes(a.id))
  const dropdownOptions = assignedAddresses.length > 0
    ? assignedAddresses.map(a => ({ value: a.id, label: `${a.email} — ${a.label}` }))
    : [{ value: "", label: "No addresses assigned — use Add Address" }]

  const handleAdd = (newIds: string[]) => {
    onAddAddresses(newIds)
    if (newIds[0]) set("addressId", newIds[0])
  }

  return (
    <>
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      title="Configure Email"
      subtitle={agentName}
      showIcon={true}
      iconContent={<Mail size={18}/>}
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

        {/* Address selector + Add Address */}
        <div className="flex items-end gap-2">
          <div style={{ flex: 1 }}>
            <NativeSelect
              value={draft.addressId}
              onChange={(v) => set("addressId", v)}
              options={dropdownOptions}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)} icon={<Plus size={12}/>}>
            Add Address
          </Button>
        </div>

        {/* Configuration Name */}
        <Field label="Configuration Name">
          <Input
            value={draft.configurationName}
            onChange={(e) => set("configurationName", e.target.value)}
            placeholder="e.g. Service Desk Email"
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
                <Field label="Address Label">
                  <Input
                    value={draft.addressLabel}
                    onChange={(e) => set("addressLabel", e.target.value)}
                    size="sm"
                  />
                </Field>
                <Divider/>
                <Field label="Display name">
                  <Input
                    value={draft.displayName}
                    onChange={(e) => set("displayName", e.target.value)}
                    size="sm"
                  />
                </Field>
                <Divider/>
                <ToggleRow
                  label="Email logging"
                  desc="Store email content and attach to contact timeline"
                  checked={draft.emailLogging}
                  onChange={(v) => set("emailLogging", v)}
                />
                <ToggleRow
                  label="Unsubscribe enforcement"
                  desc="Auto-honor unsubscribe links and reply requests"
                  checked={draft.unsubscribeEnforce}
                  onChange={(v) => set("unsubscribeEnforce", v)}
                />
              </div>
            )}

            {subTab === "inbound" && (
              <div className="flex flex-col gap-4">
                <ToggleRow
                  label="Enable inbound email"
                  desc="Accept incoming messages to this address"
                  checked={draft.inbound.enabled}
                  onChange={(v) => setIn("enabled", v)}
                  border={false}
                />
                <Divider/>
                <Field label="Auto-reply message">
                  <FormTextarea
                    value={draft.inbound.autoReply}
                    onChange={(v) => setIn("autoReply", v)}
                    ariaLabel="Email auto-reply"
                    minHeight={60}
                    rows={3}
                    disabled={!draft.inbound.enabled}
                  />
                </Field>
                <ToggleRow
                  label="Business hours only"
                  desc="Only auto-reply during configured business hours"
                  checked={draft.inbound.businessHoursOnly}
                  onChange={(v) => setIn("businessHoursOnly", v)}
                />
                <ToggleRow
                  label="Spam filtering"
                  desc="Skip agent processing for spam-flagged emails"
                  checked={draft.inbound.spamFilter}
                  onChange={(v) => setIn("spamFilter", v)}
                />
              </div>
            )}

            {subTab === "outbound" && (
              <div className="flex flex-col gap-4">
                <ToggleRow
                  label="Enable outbound email"
                  desc="Allow this agent to send emails from this address"
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
                        options={EMAIL_SENDING_HOURS_OPTIONS.map(o => ({ value: o, label: o }))}
                        size="sm"
                      />
                    </Field>
                    <Field label="Reply-to address (optional)">
                      <Input
                        value={draft.outbound.replyTo}
                        onChange={(e) => setOut("replyTo", e.target.value)}
                        placeholder="e.g. support@company.com"
                        size="sm"
                      />
                    </Field>
                    <ToggleRow
                      label="Email templates"
                      desc="Use branded templates for outbound messages"
                      checked={draft.outbound.templates}
                      onChange={(v) => setOut("templates", v)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SlideOut>

    {/* Add Email Address modal — picks from AVAILABLE_EMAIL_ADDRESSES,
        excludes anything already on this channel. */}
    <AddEmailAddressModal
      open={addOpen}
      onClose={() => setAddOpen(false)}
      assignedIds={addressIds}
      onAdd={handleAdd}
    />
    </>
  )
}
