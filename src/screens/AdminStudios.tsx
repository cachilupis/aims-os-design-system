import { useState } from "react"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Tabs }         from "@/components/ui/tabs"

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupAccess { id: string; name: string; members: number; access: boolean }
interface RoleAccess  { id: string; name: string; access: "full" | "limited" | "none" }

type SettingItem =
  | { type: "toggle"; id: string; label: string; description: string; value: boolean }
  | { type: "stepper"; id: string; label: string; description: string; value: number; min?: number; max?: number }
  | { type: "select"; id: string; label: string; description: string; value: string; options: string[] }

interface StudioConfig {
  general: SettingItem[]
  policies: SettingItem[]
  compliance: { items: SettingItem[]; exportLabel?: string }
}

interface Studio {
  id: string; name: string; icon: string; accentColor: string
  description: string; status: "active" | "disabled"
  membersWithAccess: number; totalMembers: number
  stats: { label: string; value: string }[]
  groups: GroupAccess[]
  roles: RoleAccess[]
  config: StudioConfig
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STUDIOS: Studio[] = [
  {
    id: "governance",
    name: "Governance Studio",
    icon: "Layers",
    accentColor: "#10b981",  // audit-ignore: prototype fixture data
    description: "Manages AI content authoring, domain governance, and promotion workflows.",
    status: "active",
    membersWithAccess: 28,
    totalMembers: 50,
    stats: [
      { label: "Active sandboxes",     value: "3"  },
      { label: "Content bundles",      value: "15" },
      { label: "Promotion packets",    value: "8"  },
      { label: "Resolution requests",  value: "2"  },
    ],
    groups: [
      { id: "g1", name: "Risk & Compliance", members: 8,  access: true  },
      { id: "g2", name: "Engineering",       members: 12, access: true  },
      { id: "g3", name: "Data",              members: 6,  access: true  },
      { id: "g4", name: "Finance",           members: 5,  access: false },
      { id: "g5", name: "Executives",        members: 4,  access: false },
      { id: "g6", name: "Operations",        members: 7,  access: false },
    ],
    roles: [
      { id: "r1", name: "Super Admin",    access: "full"    },
      { id: "r2", name: "Tenant Admin",   access: "full"    },
      { id: "r3", name: "Member",         access: "limited" },
      { id: "r4", name: "Viewer",         access: "limited" },
      { id: "r5", name: "Billing Admin",  access: "none"    },
    ],
    config: {
      general: [
        { type: "toggle",  id: "sandbox-env",     label: "Sandbox environment",          description: "Allow authors to test policies in an isolated sandbox before publishing to production.",      value: true  },
        { type: "toggle",  id: "sandbox-sep",     label: "Sandbox / production separation", description: "Prevent sandbox data from leaking into production decisions.",                             value: true  },
        { type: "toggle",  id: "ai-authoring",    label: "AI-assisted authoring",         description: "Enable Copilot suggestions when drafting policies and model definitions.",                   value: true  },
      ],
      policies: [
        { type: "stepper", id: "min-approvers",   label: "Minimum approvers for promotion", description: "Number of approvers required to promote a model change from Sandbox to Production.",      value: 2, min: 1, max: 10 },
        { type: "stepper", id: "auto-approve",    label: "Auto-approve after (days)",       description: "Automatically approve a pending promotion request if no reviewer acts within this period. Set to 0 to disable auto-approve.", value: 7, min: 0, max: 90 },
        { type: "toggle",  id: "change-justif",   label: "Require change justification",    description: "Authors must include a written justification when submitting a promotion request.",       value: true  },
        { type: "toggle",  id: "lock-approved",   label: "Lock approved models from editing", description: "Once a model reaches Published state, prevent edits without opening a new promotion request.", value: false },
        { type: "stepper", id: "req-expiry",      label: "Promotion request expiry (days)", description: "Open promotion requests that receive no action are automatically closed after this period.", value: 30, min: 1, max: 365 },
      ],
      compliance: {
        items: [
          { type: "toggle",  id: "soc2",           label: "SOC 2 evidence export",           description: "Generate automated audit evidence packages for SOC 2 Type II reviews.",                 value: true  },
          { type: "toggle",  id: "gdpr",           label: "GDPR data processing records",     description: "Maintain an automated record of processing activities (ROPA) derived from model definitions.", value: true },
          { type: "select",  id: "retention",      label: "Data retention period",            description: "How long Governance Studio retains promotion history, audit trails, and change logs.",  value: "1 year", options: ["30 days", "90 days", "6 months", "1 year", "3 years", "Indefinite"] },
          { type: "toggle",  id: "pii-audit",      label: "Include PII fields in audit log",  description: "Log which users accessed or modified fields tagged as personally identifiable.",        value: false },
        ],
        exportLabel: "Export compliance report",
      },
    },
  },
  {
    id: "datastudio",
    name: "Data Studio",
    icon: "FlaskConical",
    accentColor: "#8b5cf6",  // audit-ignore: prototype fixture data
    description: "Data modeling, lineage tracking, entity management, and governed schema publication.",
    status: "active",
    membersWithAccess: 35,
    totalMembers: 50,
    stats: [
      { label: "Published models", value: "14" },
      { label: "Draft models",     value: "22" },
      { label: "Deprecated",       value: "6"  },
      { label: "Domains",          value: "5"  },
    ],
    groups: [
      { id: "g1", name: "Engineering",       members: 12, access: true  },
      { id: "g2", name: "Data",              members: 6,  access: true  },
      { id: "g3", name: "Risk & Compliance", members: 8,  access: true  },
      { id: "g4", name: "Finance",           members: 5,  access: true  },
      { id: "g5", name: "Executives",        members: 4,  access: false },
      { id: "g6", name: "Operations",        members: 7,  access: false },
    ],
    roles: [
      { id: "r1", name: "Super Admin",   access: "full"    },
      { id: "r2", name: "Tenant Admin",  access: "full"    },
      { id: "r3", name: "Member",        access: "full"    },
      { id: "r4", name: "Viewer",        access: "limited" },
      { id: "r5", name: "Billing Admin", access: "none"    },
    ],
    config: {
      general: [
        { type: "toggle",  id: "model-versioning", label: "Model versioning",              description: "Automatically version models on each publish (v1, v2, …).",                                value: true  },
        { type: "toggle",  id: "lineage-viewers",  label: "Lineage visible to Viewers",    description: "Allow Viewer-role members to browse the data lineage graph.",                              value: true  },
        { type: "toggle",  id: "schema-validation",label: "Schema validation on publish",  description: "Enforce schema compatibility checks before a model can be published.",                     value: true  },
        { type: "toggle",  id: "ai-suggestions",   label: "AI-assisted field mapping",     description: "Suggest field mappings and domain bindings using AI when authoring new models.",          value: false },
      ],
      policies: [
        { type: "toggle",  id: "peer-review",      label: "Require peer review to publish", description: "A second author must approve a model before it transitions to Published.",               value: false },
        { type: "stepper", id: "min-reviewers",    label: "Minimum reviewers",              description: "Number of distinct reviewers required before a model can be published.",                 value: 1, min: 1, max: 5 },
        { type: "toggle",  id: "auto-deprecate",   label: "Auto-deprecate on replace",      description: "Automatically mark the previous version as Deprecated when a new one publishes.",        value: false },
        { type: "stepper", id: "draft-expiry",     label: "Draft expiry (days)",            description: "Drafts with no changes are automatically archived after this many days.",                value: 14, min: 1, max: 180 },
      ],
      compliance: {
        items: [
          { type: "toggle",  id: "gdpr-lineage",   label: "GDPR data lineage records",      description: "Record the full lineage of fields tagged as personal data for GDPR article 30 compliance.", value: true },
          { type: "toggle",  id: "data-class",     label: "Data classification tagging",    description: "Require authors to tag fields with a sensitivity classification before publishing.",    value: true  },
          { type: "select",  id: "retention",      label: "Audit log retention",            description: "How long Data Studio retains model audit events, field access logs, and publish history.", value: "1 year", options: ["30 days", "90 days", "6 months", "1 year", "3 years", "Indefinite"] },
          { type: "toggle",  id: "pii-masking",    label: "Mask PII in audit preview",      description: "Redact values tagged as PII when displaying audit log previews to non-admin roles.",   value: false },
        ],
        exportLabel: "Export audit trail",
      },
    },
  },
  {
    id: "agentic",
    name: "Agentic Studio",
    icon: "Bot",
    accentColor: "#06b6d4",  // audit-ignore: prototype fixture data
    description: "Manages AI workers, multi-agent workflows, human review handoffs, and run history.",
    status: "active",
    membersWithAccess: 22,
    totalMembers: 50,
    stats: [
      { label: "Active workers",    value: "7"  },
      { label: "Networks",          value: "3"  },
      { label: "HITL queue",        value: "4"  },
      { label: "Runs today",        value: "19" },
    ],
    groups: [
      { id: "g1", name: "Engineering",       members: 12, access: true  },
      { id: "g2", name: "Data",              members: 6,  access: true  },
      { id: "g3", name: "Risk & Compliance", members: 8,  access: false },
      { id: "g4", name: "Finance",           members: 5,  access: false },
      { id: "g5", name: "Executives",        members: 4,  access: false },
      { id: "g6", name: "Operations",        members: 7,  access: false },
    ],
    roles: [
      { id: "r1", name: "Super Admin",   access: "full"    },
      { id: "r2", name: "Tenant Admin",  access: "full"    },
      { id: "r3", name: "Member",        access: "limited" },
      { id: "r4", name: "Viewer",        access: "none"    },
      { id: "r5", name: "Billing Admin", access: "none"    },
    ],
    config: {
      general: [
        { type: "toggle",  id: "hitl-highrisk",    label: "HITL required for high-risk decisions", description: "Workers flagged as high-risk must pause and request a human decision before continuing.", value: true  },
        { type: "toggle",  id: "auto-shutdown",    label: "Auto-shutdown idle workers",             description: "Suspend workers with no runs in the last 7 days to reduce resource usage.",              value: false },
        { type: "toggle",  id: "scheduled-runs",   label: "Allow scheduled runs",                   description: "Enable cron-triggered worker runs in addition to on-demand invocations.",               value: true  },
        { type: "toggle",  id: "governance-bind",  label: "Require governance binding",             description: "Workers must be bound to a Governance Studio domain before they can be deployed.",      value: false },
      ],
      policies: [
        { type: "stepper", id: "run-timeout",      label: "Max run timeout (minutes)",     description: "Workers that exceed this time are automatically terminated and logged as failed.",           value: 30, min: 1, max: 240 },
        { type: "stepper", id: "max-concurrent",   label: "Max concurrent runs per worker", description: "Limit the number of simultaneous invocations for a single worker.",                         value: 5, min: 1, max: 50 },
        { type: "toggle",  id: "retry-on-fail",    label: "Auto-retry on failure",          description: "Automatically retry a failed run once before marking it as a hard failure.",                value: true  },
        { type: "stepper", id: "hitl-timeout",     label: "HITL decision timeout (hours)",  description: "If a human review request is not resolved within this period, the run is escalated.",       value: 24, min: 1, max: 168 },
      ],
      compliance: {
        items: [
          { type: "toggle",  id: "audit-runs",     label: "Audit all worker runs",           description: "Log inputs, outputs, and token usage for every worker invocation.",                       value: true  },
          { type: "toggle",  id: "pii-masking",    label: "PII input masking",               description: "Automatically detect and redact PII from worker inputs before logging.",                  value: false },
          { type: "select",  id: "data-residency", label: "Data residency enforcement",      description: "Restrict worker run data to the selected region for compliance purposes.",                 value: "US East", options: ["US East", "US West", "EU (Frankfurt)", "AP (Singapore)", "No restriction"] },
          { type: "toggle",  id: "pii-output",     label: "Scan outputs for PII",            description: "Flag and quarantine worker outputs containing detected PII before delivery.",              value: false },
        ],
        exportLabel: "Export compliance report",
      },
    },
  },
]

// ─── Shared controls ──────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
      background: checked ? "var(--primary)" : "var(--border)",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16,
        borderRadius: "50%", background: "#fff", transition: "left 0.2s",  // audit-ignore: prototype fixture data
      }} />
    </button>
  )
}

function Stepper({ value, onChange, min = 0, max = 999 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: 32, height: 32, border: "none", cursor: value <= min ? "not-allowed" : "pointer",
          background: "var(--surface-raised)", color: value <= min ? "var(--muted-foreground)" : "var(--foreground)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 500,
          borderRight: "1px solid var(--border)",
        }}
      >−</button>
      <span style={{ minWidth: 36, textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--foreground)", padding: "0 4px" }}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: 32, height: 32, border: "none", cursor: value >= max ? "not-allowed" : "pointer",
          background: "var(--surface-raised)", color: value >= max ? "var(--muted-foreground)" : "var(--foreground)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 500,
          borderLeft: "1px solid var(--border)",
        }}
      >+</button>
    </div>
  )
}

function SelectControl({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        fontSize: 13, fontWeight: 500, padding: "5px 28px 5px 10px",
        border: "1px solid var(--border)", borderRadius: 8,
        background: "var(--surface-raised)", color: "var(--foreground)",
        cursor: "pointer", outline: "none", flexShrink: 0,
        appearance: "auto",
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

// ─── Setting row renderer ─────────────────────────────────────────────────────

function SettingRow({ item, onToggle, onStepper, onSelect, isLast }: {
  item: SettingItem
  onToggle: (id: string) => void
  onStepper: (id: string, v: number) => void
  onSelect: (id: string, v: string) => void
  isLast: boolean
}) {
  return (
    <div style={{ padding: "14px 16px", borderBottom: isLast ? "none" : "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 3 }}>{item.label}</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.4 }}>{item.description}</div>
      </div>
      <div style={{ paddingTop: 2, flexShrink: 0 }}>
        {item.type === "toggle"  && <Toggle checked={item.value} onChange={() => onToggle(item.id)} />}
        {item.type === "stepper" && <Stepper value={item.value} onChange={v => onStepper(item.id, v)} min={item.min} max={item.max} />}
        {item.type === "select"  && <SelectControl value={item.value} options={item.options} onChange={v => onSelect(item.id, v)} />}
      </div>
    </div>
  )
}

// ─── Detail page ──────────────────────────────────────────────────────────────

function StudioDetailPage({ studio }: { studio: Studio }) {
  const [tab, setTab]       = useState("access")
  const [settingsTab, setSettingsTab] = useState("general")
  const [groups, setGroups] = useState<GroupAccess[]>(studio.groups)
  const [config, setConfig] = useState<StudioConfig>(studio.config)

  function flipGroup(id: string) {
    setGroups(g => g.map(x => x.id === id ? { ...x, access: !x.access } : x))
  }

  function updateSetting(section: "general" | "policies" | "compliance", id: string, value: boolean | number | string) {
    setConfig(prev => {
      const items = section === "compliance" ? prev.compliance.items : prev[section]
      const updated = items.map((item): SettingItem => {
        if (item.id !== id) return item
        if (item.type === "toggle"  && typeof value === "boolean") return { ...item, value }
        if (item.type === "stepper" && typeof value === "number")  return { ...item, value }
        if (item.type === "select"  && typeof value === "string")  return { ...item, value }
        return item
      })
      if (section === "compliance") return { ...prev, compliance: { ...prev.compliance, items: updated } }
      return { ...prev, [section]: updated }
    })
  }

  const ACCESS_COLOR: Record<RoleAccess["access"], string> = {
    full:    "var(--badge-success)",
    limited: "var(--badge-alert)",
    none:    "var(--muted-foreground)",
  }

  const IC = Icons[studio.icon as keyof typeof Icons] as React.ElementType

  const settingsSections: Record<string, SettingItem[]> = {
    general:    config.general,
    policies:   config.policies,
    compliance: config.compliance.items,
  }
  const activeItems = settingsSections[settingsTab] ?? []

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Identity row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11, flexShrink: 0,
          background: `${studio.accentColor}18`, border: `1px solid ${studio.accentColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center", color: studio.accentColor,
        }}>
          {IC ? <IC size={22} /> : null}
        </div>
        <div style={{ flex: 1, fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          {studio.description}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {studio.stats.map(s => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
            padding: "12px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: studio.accentColor }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main tabs */}
      <div style={{ marginBottom: 20 }}>
        <Tabs
          items={[
            { id: "access",   label: "Access"   },
            { id: "settings", label: "Settings" },
          ]}
          activeId={tab}
          onChange={setTab}
          size="s"
        />
      </div>

      {/* ── Access tab ── */}
      {tab === "access" && (
        <>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "8px 16px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>Groups</span>
            </div>
            {groups.map((g, i) => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < groups.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: g.access ? `${studio.accentColor}18` : "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: g.access ? studio.accentColor : "var(--muted-foreground)",
                }}>
                  <Icons.Users size={13} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{g.members} members</div>
                </div>
                <Toggle checked={g.access} onChange={() => flipGroup(g.id)} />
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "8px 16px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>Roles</span>
            </div>
            {studio.roles.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < studio.roles.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ flex: 1, fontSize: 13, color: "var(--foreground)" }}>{r.name}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                  background: `${ACCESS_COLOR[r.access]}18`, color: ACCESS_COLOR[r.access],
                  border: `1px solid ${ACCESS_COLOR[r.access]}30`,
                }}>
                  {r.access === "full" ? "Full access" : r.access === "limited" ? "Limited" : "No access"}
                </span>
              </div>
            ))}
          </div>

          <div><Button variant="secondary" size="sm">Save access changes</Button></div>
        </>
      )}

      {/* ── Settings tab ── */}
      {tab === "settings" && (
        <>
          {/* Settings sub-tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
            {(["general", "policies", "compliance"] as const).map((s, i, arr) => (
              <button
                key={s}
                onClick={() => setSettingsTab(s)}
                style={{
                  padding: "6px 16px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                  borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  background: settingsTab === s ? "var(--primary)" : "var(--surface-raised)",
                  color: settingsTab === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Settings items */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "8px 16px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>
                {settingsTab}
              </span>
            </div>
            {activeItems.map((item, i) => (
              <SettingRow
                key={item.id}
                item={item}
                isLast={i === activeItems.length - 1}
                onToggle={id => updateSetting(settingsTab as "general" | "policies" | "compliance", id, !(item as { value: boolean }).value)}
                onStepper={(id, v) => updateSetting(settingsTab as "general" | "policies" | "compliance", id, v)}
                onSelect={(id, v) => updateSetting(settingsTab as "general" | "policies" | "compliance", id, v)}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button variant="main" size="sm">Save settings</Button>
            {settingsTab === "compliance" && config.compliance.exportLabel && (
              <Button variant="secondary" size="sm">
                <Icons.Download size={13} style={{ marginRight: 4 }} />
                {config.compliance.exportLabel}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Studio card ──────────────────────────────────────────────────────────────

function StudioCard({ studio, onClick }: { studio: Studio; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const accessPct = Math.round((studio.membersWithAccess / studio.totalMembers) * 100)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "16px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer",
        background: hov ? "var(--accent)" : "transparent",
        borderLeft: "3px solid transparent",
        transition: "background 0.1s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11, flexShrink: 0,
          background: `${studio.accentColor}18`, border: `1px solid ${studio.accentColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center", color: studio.accentColor,
        }}>
          {(() => { const IC = Icons[studio.icon as keyof typeof Icons] as React.ElementType; return IC ? <IC size={22} /> : null })()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{studio.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 100,
              background: "var(--badge-success)15", color: "var(--badge-success)",
            }}>Active</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 10, lineHeight: 1.4 }}>
            {studio.description}
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            {studio.stats.map(s => (
              <div key={s.label}>
                <span style={{ fontSize: 15, fontWeight: 800, color: studio.accentColor }}>{s.value}</span>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 4 }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--border)" }}>
              <div style={{ height: "100%", width: `${accessPct}%`, borderRadius: 2, background: studio.accentColor }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>
              {studio.membersWithAccess} / {studio.totalMembers} members have access
            </span>
          </div>
        </div>

        <Icons.ChevronRight size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: 14 }} />
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function AdminStudiosScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [detailView, setDetailView] = useState<Studio | null>(null)

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="studios"
      onSidebarItemClick={onNavigate}
      header={(isScrolled) => detailView ? (
        <Header
          size={isScrolled ? "compress" : "size-m"}
          title={detailView.name}
          description="Studios"
          onBack={() => setDetailView(null)}
          primaryAction={
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm">
                <Icons.Settings size={14} style={{ marginRight: 4 }} />
                Configure
              </Button>
              <Button variant={detailView.status === "active" ? "secondary" : "main"} size="sm">
                {detailView.status === "active" ? "Disable studio" : "Enable studio"}
              </Button>
            </div>
          }
        />
      ) : (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Studios"
          description="Manage studio access, settings, and usage across the workspace"
        />
      )}
    >
      {detailView && (
        <StudioDetailPage key={detailView.id} studio={detailView} />
      )}

      {!detailView && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            padding: "12px 20px", borderBottom: "1px solid var(--border)",
            background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Studios
            </span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{STUDIOS.filter(s => s.status === "active").length} of {STUDIOS.length} active</span>
          </div>
          {STUDIOS.map(studio => (
            <StudioCard key={studio.id} studio={studio} onClick={() => setDetailView(studio)} />
          ))}
        </div>
      )}
    </ScreenLayout>
  )
}
