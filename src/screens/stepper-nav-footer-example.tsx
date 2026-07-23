import { useState, useEffect, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { Sparkles, Bell, Settings } from "lucide-react"
import { AppBackground }    from "@/components/ui/app-background"
import { Topbar }           from "@/components/ui/topbar"
import { Sidebar, DEFAULT_SIDEBAR_ITEMS } from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { Stepper }          from "@/components/ui/stepper"
import { Input }            from "@/components/ui/input"
import { Select }           from "@/components/ui/select"
import { Textarea }         from "@/components/ui/textarea"
import { StepperNavFooter } from "@/components/ui/stepper-nav-footer"
import type { StepItem, StepState } from "@/components/ui/stepper"
import type { TopbarAction } from "@/components/ui/topbar"

// ── Static data ────────────────────────────────────────────────────────────────

const TOPBAR_ACTIONS: TopbarAction[] = [
  { icon: <Sparkles size={16} />, label: "AI",            variant: "primary" },
  { icon: <Bell     size={16} />, label: "Notifications"                     },
  { icon: <Settings size={16} />, label: "Settings"                          },
]

const STEP_LABELS = ["General Info", "Trigger", "Actions", "Review"]

// ── SelectDropdown — Select trigger + menu + click-outside ────────────────────

function SelectDropdown({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

  function openMenu() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setOpen(true)
  }

  // Click-outside: only bind while open, check both trigger and portal menu
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  // Portaled menu — position: fixed + viewport coords; DS floating surface + blur(8px)
  const menu = open && pos ? (
    <div
      ref={menuRef}
      style={{
        position:          "fixed",
        top:               pos.top,
        left:              pos.left,
        width:             pos.width,
        zIndex:            99999,
        background:        "var(--menu-bg)",           // Surface/Floating/Default — rgba(16,22,40,.92) dark / rgba(255,255,255,.92) light
        backdropFilter:    "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius:      "var(--radius-m)",
        boxShadow:         "0 4px 24px rgba(0,0,0,0.18)",
        overflow:          "hidden",
        padding:           "4px 0",
      }}
    >
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          style={{
            display:    "block",
            width:      "100%",
            padding:    "8px 16px",
            fontSize:   14,
            fontWeight: 500,
            textAlign:  "left",
            cursor:     "pointer",
            background: value === opt ? "var(--color-surface-primary-subtle)" : "transparent",
            color:      value === opt ? "var(--primary)" : "var(--menu-item-text)",
            border:     "none",
            lineHeight: "20px",
            transition: "background 120ms",
          }}
          onMouseEnter={e => {
            if (value !== opt) (e.currentTarget as HTMLElement).style.background = "var(--menu-item-hover)"
          }}
          onMouseLeave={e => {
            if (value !== opt) (e.currentTarget as HTMLElement).style.background = "transparent"
          }}
          onClick={() => { onChange(opt); setOpen(false) }}
        >
          {opt}
        </button>
      ))}
    </div>
  ) : null

  return (
    <div ref={triggerRef} style={{ width: "100%" }}>
      <Select
        placeholder={placeholder}
        value={value || undefined}
        open={open}
        onClick={() => open ? setOpen(false) : openMenu()}
        onClear={() => { onChange(""); setOpen(false) }}
      />
      {createPortal(menu, document.body)}
    </div>
  )
}

// ── Shared field-row helpers ───────────────────────────────────────────────────

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {children}
    </div>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {children}{required && <span style={{ color: "var(--color-status-error-default)", marginLeft: 2 }}>*</span>}
      </span>
    </div>
  )
}

// ── Step content ──────────────────────────────────────────────────────────────

const CATEGORIES = ["Customer Success", "Sales", "Operations", "Analytics", "Marketing", "Engineering"]
const PRIORITIES = ["High", "Medium", "Low"]
const TRIGGER_TYPES = ["Event-based", "Time-based", "API-triggered", "Manual"]
const EVENT_SOURCES = ["CRM — Account", "CRM — Contact", "CRM — Deal", "HubSpot", "Salesforce", "Intercom"]
const FREQUENCIES = ["Once per account", "Daily", "Weekly", "Always"]
const ACTION_TYPES = ["Create Task", "Send Email", "Update Field", "Trigger Webhook", "Assign Owner"]
const QUEUES = ["CS Team Queue", "Sales Queue", "Unassigned", "Auto-assign by load"]

type FormState = {
  // Step 1
  name:        string
  category:    string
  priority:    string
  description: string
  owner:       string
  // Step 2
  triggerType:     string
  eventSource:     string
  event:           string
  filterCondition: string
  frequency:       string
  cooldown:        string
  // Step 3
  actionType:  string
  assignTo:    string
  taskPriority: string
  taskTitle:   string
  taskDesc:    string
}

const INITIAL_FORM: FormState = {
  name: "", category: "", priority: "", description: "", owner: "",
  triggerType: "", eventSource: "", event: "", filterCondition: "", frequency: "", cooldown: "",
  actionType: "", assignTo: "", taskPriority: "", taskTitle: "", taskDesc: "",
}

function Step1({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>General Info</p>
        <p style={{ fontSize: 13, color: "var(--field-supporting)" }}>Define the basic details for this automation.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <FieldLabel required>Automation name</FieldLabel>
          <Input
            placeholder="e.g. Churn Risk Intervention"
            value={form.name}
            onChange={e => set("name", e.target.value)}
          />
        </div>

        <FieldRow>
          <div>
            <FieldLabel required>Category</FieldLabel>
            <SelectDropdown
              placeholder="Select category"
              value={form.category}
              onChange={v => set("category", v)}
              options={CATEGORIES}
            />
          </div>
          <div>
            <FieldLabel>Priority</FieldLabel>
            <SelectDropdown
              placeholder="Select priority"
              value={form.priority}
              onChange={v => set("priority", v)}
              options={PRIORITIES}
            />
          </div>
        </FieldRow>

        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea
            placeholder="Describe what this automation does..."
            value={form.description}
            onChange={e => set("description", e.target.value)}
            expand
          />
        </div>

        <div>
          <FieldLabel>Owner</FieldLabel>
          <Input
            placeholder="Search team member"
            value={form.owner}
            onChange={e => set("owner", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function Step2({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Trigger</p>
        <p style={{ fontSize: 13, color: "var(--field-supporting)" }}>Define the event that starts this automation.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FieldRow>
          <div>
            <FieldLabel required>Trigger type</FieldLabel>
            <SelectDropdown
              placeholder="Select trigger type"
              value={form.triggerType}
              onChange={v => set("triggerType", v)}
              options={TRIGGER_TYPES}
            />
          </div>
          <div>
            <FieldLabel required>Event source</FieldLabel>
            <SelectDropdown
              placeholder="Select source"
              value={form.eventSource}
              onChange={v => set("eventSource", v)}
              options={EVENT_SOURCES}
            />
          </div>
        </FieldRow>

        <div>
          <FieldLabel>Event</FieldLabel>
          <SelectDropdown
            placeholder="Select event"
            value={form.event}
            onChange={v => set("event", v)}
            options={["Account health dropped", "Deal stage changed", "Contact created", "Tag added", "Score threshold crossed"]}
          />
        </div>

        <div>
          <FieldLabel>Filter condition</FieldLabel>
          <Input
            placeholder="e.g. health.score < 60"
            value={form.filterCondition}
            onChange={e => set("filterCondition", e.target.value)}
          />
        </div>

        <FieldRow>
          <div>
            <FieldLabel>Frequency</FieldLabel>
            <SelectDropdown
              placeholder="Select frequency"
              value={form.frequency}
              onChange={v => set("frequency", v)}
              options={FREQUENCIES}
            />
          </div>
          <div>
            <FieldLabel>Cooldown period</FieldLabel>
            <Input
              placeholder="e.g. 7 days"
              value={form.cooldown}
              onChange={e => set("cooldown", e.target.value)}
            />
          </div>
        </FieldRow>
      </div>
    </div>
  )
}

function Step3({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Actions</p>
        <p style={{ fontSize: 13, color: "var(--field-supporting)" }}>Configure what happens when this automation fires.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FieldRow>
          <div>
            <FieldLabel required>Action type</FieldLabel>
            <SelectDropdown
              placeholder="Select action"
              value={form.actionType}
              onChange={v => set("actionType", v)}
              options={ACTION_TYPES}
            />
          </div>
          <div>
            <FieldLabel>Assign to</FieldLabel>
            <SelectDropdown
              placeholder="Select queue"
              value={form.assignTo}
              onChange={v => set("assignTo", v)}
              options={QUEUES}
            />
          </div>
        </FieldRow>

        <FieldRow>
          <div>
            <FieldLabel>Priority</FieldLabel>
            <SelectDropdown
              placeholder="Select priority"
              value={form.taskPriority}
              onChange={v => set("taskPriority", v)}
              options={PRIORITIES}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }} />
        </FieldRow>

        <div>
          <FieldLabel required>Task title</FieldLabel>
          <Input
            placeholder="e.g. Follow up: {account.name} at risk"
            value={form.taskTitle}
            onChange={e => set("taskTitle", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel>Task description</FieldLabel>
          <Textarea
            placeholder="Add task instructions or context..."
            value={form.taskDesc}
            onChange={e => set("taskDesc", e.target.value)}
            expand
          />
        </div>
      </div>
    </div>
  )
}

function Step4({ form }: { form: FormState }) {
  const rows: [string, string][] = [
    ["Name",          form.name        || "—"],
    ["Category",      form.category    || "—"],
    ["Priority",      form.priority    || "—"],
    ["Description",   form.description || "—"],
    ["Owner",         form.owner       || "—"],
    ["Trigger",       [form.triggerType, form.eventSource].filter(Boolean).join(" · ") || "—"],
    ["Event",         form.event       || "—"],
    ["Filter",        form.filterCondition || "—"],
    ["Frequency",     form.frequency   || "—"],
    ["Action",        form.actionType  || "—"],
    ["Assign to",     form.assignTo    || "—"],
    ["Task priority", form.taskPriority || "—"],
    ["Task title",    form.taskTitle   || "—"],
  ].filter(([, v]) => v !== "—") as [string, string][]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Review</p>
        <p style={{ fontSize: 13, color: "var(--field-supporting)" }}>Confirm your configuration before creating the automation.</p>
      </div>
      <div style={{ borderRadius: "var(--radius-m)", overflow: "hidden", border: "0.5px solid var(--field-border)" }}>
        {rows.map(([label, value], i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              padding: "12px 16px",
              borderBottom: i < rows.length - 1 ? "0.5px solid var(--field-border)" : "none",
              background: "var(--surface)",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--field-supporting)", width: 120, flexShrink: 0, marginTop: 1 }}>{label}</span>
            <span style={{ fontSize: 13, color: "var(--foreground)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

function buildSteps(activeIdx: number): StepItem[] {
  return STEP_LABELS.map((label, i) => ({
    label,
    state: (
      i < activeIdx   ? "completed" :
      i === activeIdx ? "active"    :
      "default"
    ) as StepState,
  }))
}

export function StepperNavFooterExampleScreen({
  activeStep,
  onBack,
  onNext,
  onCancel,
  secondaryLabel,
  onSecondary,
}: {
  activeStep: number
  onBack: () => void
  onNext: () => void
  onCancel: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Validation — Next is only enabled when required fields for the current step are filled
  const isStepValid = useMemo(() => {
    switch (activeStep) {
      case 0: return form.name.trim() !== "" && form.category !== ""
      case 1: return form.triggerType !== "" && form.eventSource !== ""
      case 2: return form.actionType !== "" && form.taskTitle.trim() !== ""
      case 3: return true  // Review step — always enabled
      default: return false
    }
  }, [activeStep, form.name, form.category, form.triggerType, form.eventSource, form.actionType, form.taskTitle])

  const steps     = buildSteps(activeStep)
  const variant   = activeStep === 0 ? "cancel-next" : "back-next"
  const nextLabel = activeStep === STEP_LABELS.length - 1 ? "Submit" : "Next"

  return (
    <div style={{ width: "100%", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      <AppBackground variant="default" />

      <Topbar
        workspaceName="{Studio name}"
        companyName="{Company name}"
        actions={TOPBAR_ACTIONS}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar
          items={DEFAULT_SIDEBAR_ITEMS}
          activeId="automations"
          defaultCollapsed
        />

        {/* Main column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Fixed: Header */}
          <div style={{ flexShrink: 0 }}>
            <Header
              title="Create Automation"
              description="Set up a new automated workflow for your team"
              size="size-l"
              backButton
            />
          </div>

          {/* Fixed: Stepper */}
          <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
            <Stepper steps={steps} />
          </div>

          {/* Scrollable form + sticky footer */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 0" }}>
              {activeStep === 0 && <Step1 form={form} set={set} />}
              {activeStep === 1 && <Step2 form={form} set={set} />}
              {activeStep === 2 && <Step3 form={form} set={set} />}
              {activeStep === 3 && <Step4 form={form} />}
              <div style={{ height: 24 }} />
            </div>

            {/* StepperNavFooter — sticky to bottom of scroll area */}
            <StepperNavFooter
              variant={variant}
              onCancel={onCancel}
              onBack={onBack}
              nextLabel={nextLabel}
              nextDisabled={!isStepValid}
              onNext={onNext}
              secondaryLabel={secondaryLabel}
              onSecondary={onSecondary}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
