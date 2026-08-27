import { useState } from "react"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { SwitchTab }    from "@/components/ui/switch-tab"
import { Tabs }         from "@/components/ui/tabs"
import { SlideOut }    from "@/components/ui/slide-out"

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationStatus = "active" | "error" | "paused" | "pending"
type ActionType = "reauth" | "pause" | "resume" | "disconnect"
type AuthType = "OAuth 2.0" | "API Key" | "Service Account" | "SAML" | "Basic Auth"

interface SyncRun { ts: string; duration: string; records: string; status: "success" | "failure" | "warning" }

interface Integration {
  id: string; name: string; category: string; icon: string
  status: IntegrationStatus; authType: AuthType
  connectedBy: string; connectedAt: string
  lastSync: string; nextSync: string
  syncFrequency: string; records: string
  description: string; website: string
  errorMsg?: string
  history: SyncRun[]
}

interface CatalogItem {
  id: string; name: string; category: string; icon: string; description: string
  authType: string; popular?: boolean
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STATUS_META: Record<IntegrationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active:  { label: "Active",   color: "var(--badge-success)", icon: <Icons.CheckCircle size={11} /> },
  error:   { label: "Error",    color: "var(--badge-error)",   icon: <Icons.AlertCircle size={11} /> },
  paused:  { label: "Paused",   color: "var(--muted-foreground)", icon: <Icons.PauseCircle size={11} /> },
  pending: { label: "Pending",  color: "var(--badge-alert)",   icon: <Icons.Clock size={11} /> },
}

const INITIAL_CONNECTED: Integration[] = [
  {
    id: "salesforce", name: "Salesforce CRM", category: "CRM", icon: "Building2",
    status: "error", authType: "OAuth 2.0",
    connectedBy: "Thomas Gonzalez", connectedAt: "Aug 25, 2026",
    lastSync: "Aug 20, 08:00", nextSync: "—", syncFrequency: "Every 4 hours",
    records: "0 (sync paused)", description: "Customer relationship management — contacts, opportunities, accounts, and activities.",
    website: "salesforce.com",
    errorMsg: "OAuth token expired. Re-authentication required to resume syncing.",
    history: [
      { ts: "Aug 20 · 08:00", duration: "—",    records: "0",     status: "failure" },
      { ts: "Aug 20 · 04:00", duration: "2m 14s", records: "1,240", status: "success" },
      { ts: "Aug 20 · 00:00", duration: "2m 08s", records: "1,218", status: "success" },
    ],
  },
  {
    id: "databricks", name: "Databricks", category: "Data Platform", icon: "Layers",
    status: "active", authType: "Service Account",
    connectedBy: "Thomas Gonzalez", connectedAt: "Aug 25, 2026",
    lastSync: "Aug 26 · 09:30", nextSync: "Aug 26 · 13:30", syncFrequency: "Every 4 hours",
    records: "2,341 records", description: "Unified analytics platform — Delta Lake, notebooks, and ML workflows.",
    website: "databricks.com",
    history: [
      { ts: "Aug 26 · 09:30", duration: "18s",   records: "2,341", status: "success" },
      { ts: "Aug 26 · 05:30", duration: "21s",   records: "2,289", status: "success" },
      { ts: "Aug 26 · 01:30", duration: "19s",   records: "2,310", status: "success" },
    ],
  },
  {
    id: "snowflake", name: "Snowflake", category: "Data Warehouse", icon: "Database",
    status: "active", authType: "Service Account",
    connectedBy: "Maria García", connectedAt: "Jul 15, 2026",
    lastSync: "Aug 26 · 08:00", nextSync: "Aug 26 · 12:00", syncFrequency: "Every 4 hours",
    records: "14,820 records", description: "Cloud data warehouse for structured and semi-structured data.",
    website: "snowflake.com",
    history: [
      { ts: "Aug 26 · 08:00", duration: "1m 32s", records: "14,820", status: "success" },
      { ts: "Aug 26 · 04:00", duration: "1m 28s", records: "14,711", status: "success" },
      { ts: "Aug 26 · 00:00", duration: "1m 35s", records: "14,690", status: "warning" },
    ],
  },
  {
    id: "sap", name: "SAP S/4HANA", category: "ERP", icon: "Factory",
    status: "active", authType: "Basic Auth",
    connectedBy: "Eduardo Suárez", connectedAt: "Jun 01, 2026",
    lastSync: "Aug 26 · 06:00", nextSync: "Aug 27 · 06:00", syncFrequency: "Daily",
    records: "38,410 records", description: "Enterprise resource planning — GL, AR/AP, procurement, and inventory.",
    website: "sap.com",
    history: [
      { ts: "Aug 26 · 06:00", duration: "4m 11s", records: "38,410", status: "success" },
      { ts: "Aug 25 · 06:00", duration: "4m 05s", records: "38,201", status: "success" },
      { ts: "Aug 24 · 06:00", duration: "3m 58s", records: "38,100", status: "success" },
    ],
  },
  {
    id: "bigquery", name: "Google BigQuery", category: "Data Warehouse", icon: "BarChart2",
    status: "paused", authType: "Service Account",
    connectedBy: "Maria García", connectedAt: "May 10, 2026",
    lastSync: "Aug 15 · 12:00", nextSync: "—", syncFrequency: "Every 6 hours (paused)",
    records: "—", description: "Serverless, multicloud data warehouse for analytics at scale.",
    website: "cloud.google.com/bigquery",
    history: [
      { ts: "Aug 15 · 12:00", duration: "3m 02s", records: "22,140", status: "success" },
      { ts: "Aug 15 · 06:00", duration: "3m 10s", records: "22,090", status: "success" },
    ],
  },
  {
    id: "teams", name: "Microsoft Teams", category: "Collaboration", icon: "MessageSquare",
    status: "active", authType: "OAuth 2.0",
    connectedBy: "Thomas Gonzalez", connectedAt: "Aug 10, 2026",
    lastSync: "Aug 26 · 09:00", nextSync: "Aug 26 · 10:00", syncFrequency: "Hourly",
    records: "Webhook only", description: "Team chat and collaboration — AIMS-OS sends alerts and HITL notifications.",
    website: "teams.microsoft.com",
    history: [
      { ts: "Aug 26 · 09:00", duration: "< 1s", records: "3 webhooks", status: "success" },
      { ts: "Aug 26 · 08:00", duration: "< 1s", records: "1 webhook",  status: "success" },
    ],
  },
]

const CATALOG: CatalogItem[] = [
  { id: "hubspot",    name: "HubSpot",        category: "CRM",              icon: "Megaphone",     authType: "OAuth 2.0",       description: "Inbound marketing, sales CRM, and pipeline management.", popular: true },
  { id: "jira",       name: "Jira",           category: "Project Mgmt",     icon: "Kanban",        authType: "OAuth 2.0",       description: "Issue and project tracking for engineering and product teams." },
  { id: "slack",      name: "Slack",          category: "Collaboration",    icon: "MessageCircle", authType: "OAuth 2.0",       description: "Team messaging and workflow automation via webhooks.", popular: true },
  { id: "notion",     name: "Notion",         category: "Knowledge Base",   icon: "BookOpen",      authType: "API Key",         description: "Docs, wikis, and databases unified in one workspace." },
  { id: "postgres",   name: "PostgreSQL",     category: "Database",         icon: "Database",      authType: "Service Account", description: "Open-source relational database for structured data.", popular: true },
  { id: "mysql",      name: "MySQL",          category: "Database",         icon: "Database",      authType: "Service Account", description: "World's most widely deployed open-source database." },
  { id: "mongo",      name: "MongoDB",        category: "Database",         icon: "Database",      authType: "Service Account", description: "Document database designed for modern application data." },
  { id: "s3",         name: "AWS S3",         category: "Storage",          icon: "HardDrive",     authType: "Service Account", description: "Scalable object storage for any volume of unstructured data.", popular: true },
  { id: "azure",      name: "Azure Blob",     category: "Storage",          icon: "Cloud",         authType: "Service Account", description: "Massively scalable cloud object storage from Microsoft." },
  { id: "tableau",    name: "Tableau",        category: "Analytics",        icon: "BarChart",      authType: "API Key",         description: "Visual analytics and interactive business intelligence dashboards." },
  { id: "powerbi",    name: "Power BI",       category: "Analytics",        icon: "PieChart",      authType: "OAuth 2.0",       description: "Microsoft business analytics and reporting service." },
  { id: "dbt",        name: "dbt",            category: "Data Transform",   icon: "GitBranch",     authType: "API Key",         description: "SQL-based data transformation for analytics engineering." },
  { id: "github",     name: "GitHub",         category: "Developer Tools",  icon: "GitBranch",     authType: "OAuth 2.0",       description: "Code hosting, CI/CD pipelines, and team collaboration." },
  { id: "zendesk",    name: "Zendesk",        category: "Support",          icon: "Headphones",    authType: "OAuth 2.0",       description: "Customer support ticketing, macros, and SLA management." },
  { id: "stripe",     name: "Stripe",         category: "Payments",         icon: "CreditCard",    authType: "API Key",         description: "Payment processing, subscriptions, and financial reporting." },
  { id: "sendgrid",   name: "SendGrid",       category: "Email",            icon: "Mail",          authType: "API Key",         description: "Transactional email delivery and marketing campaigns." },
]

const CATALOG_CATEGORIES = ["All", "CRM", "Data Warehouse", "Database", "Storage", "Analytics", "Collaboration", "Project Mgmt", "Knowledge Base", "Developer Tools", "Data Transform", "Support", "Payments", "Email"]

// ─── Operate panel ────────────────────────────────────────────────────────────

function OperatePanel({ integration, onAction }: {
  integration: Integration
  onAction: (id: string, action: ActionType) => void
}) {
  const [activeTab, setActiveTab] = useState("overview")
  const [rotatingCreds, setRotatingCreds] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  return (
    <>
      {integration.errorMsg && (
        <div style={{
          margin: "12px 20px 0", padding: "8px 12px", borderRadius: 8,
          background: "var(--badge-error)10", border: "1px solid var(--badge-error)30",
          fontSize: 12, color: "var(--badge-error)", lineHeight: 1.4,
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <Icons.AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          {integration.errorMsg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
        {integration.status === "error" ? (
          <Button variant="main" size="sm" style={{ flex: 1 }} onClick={() => onAction(integration.id, "reauth")}>
            Re-authenticate
          </Button>
        ) : integration.status === "paused" ? (
          <Button variant="main" size="sm" style={{ flex: 1 }} onClick={() => onAction(integration.id, "resume")}>
            Resume sync
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" style={{ flex: 1 }}>Sync now</Button>
            <Button variant="secondary" size="sm" onClick={() => onAction(integration.id, "pause")}>
              <Icons.Pause size={13} style={{ marginRight: 4 }} />
              Pause
            </Button>
          </>
        )}
        <Button variant="secondary" size="sm">Settings</Button>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px", borderBottom: "1px solid var(--border)" }}>
        <Tabs
          items={[
            { id: "overview", label: "Overview"    },
            { id: "history",  label: "Sync history" },
            { id: "creds",    label: "Credentials"  },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
          size="s"
        />
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {activeTab === "overview" && (
          <>
            {[
              ["Authentication",    integration.authType],
              ["Connected by",     integration.connectedBy],
              ["Connected on",     integration.connectedAt],
              ["Sync frequency",   integration.syncFrequency],
              ["Last sync",        integration.lastSync],
              ["Next sync",        integration.nextSync],
              ["Records synced",   integration.records],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ width: 130, flexShrink: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", paddingTop: 1 }}>{k}</span>
                <span style={{ fontSize: 13, color: "var(--foreground)" }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop: 20 }}>
              {confirmDisconnect ? (
                <div style={{ padding: "14px", borderRadius: 8, background: "var(--badge-error)08", border: "1px solid var(--badge-error)30" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>
                    Disconnect {integration.name}?
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12, lineHeight: 1.5 }}>
                    This stops all syncs and removes the connection. You can reconnect from the catalog.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      variant="main"
                      size="sm"
                      style={{ background: "var(--badge-error)", border: "none" }}
                      onClick={() => onAction(integration.id, "disconnect")}
                    >
                      Disconnect
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setConfirmDisconnect(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ color: "var(--badge-error)", borderColor: "var(--badge-error)40" }}
                  onClick={() => setConfirmDisconnect(true)}
                >
                  <Icons.Unplug size={13} style={{ marginRight: 4 }} />
                  Disconnect
                </Button>
              )}
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>Sync runs</div>
            {integration.history.map((run, i) => {
              const c = run.status === "success" ? "var(--badge-success)" : run.status === "failure" ? "var(--badge-error)" : "var(--badge-alert)"
              return (
                <div key={i} style={{
                  padding: "10px 0", borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{ color: c }}>{run.status === "success" ? <Icons.CheckCircle size={14} /> : run.status === "failure" ? <Icons.XCircle size={14} /> : <Icons.AlertTriangle size={14} />}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{run.ts}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{run.records} · {run.duration}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c }}>
                    {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === "creds" && (
          <div>
            <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--surface-raised)", border: "1px solid var(--border)", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 6 }}>Authentication</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>{integration.authType}</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {integration.status === "error" ? "Token expired — rotation required" : "Credentials valid · Last rotated Aug 25, 2026"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant={integration.status === "error" ? "main" : "secondary"}
                size="sm"
                onClick={() => {
                  setRotatingCreds(true)
                  if (integration.status === "error") onAction(integration.id, "reauth")
                }}
              >
                {rotatingCreds ? "Rotating…" : integration.status === "error" ? "Re-authenticate" : "Rotate credentials"}
              </Button>
              <Button variant="secondary" size="sm">View scopes</Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Integration row ──────────────────────────────────────────────────────────

function IntegrationRow({ integration, selected, onClick }: {
  integration: Integration; selected: boolean; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  const statusMeta = STATUS_META[integration.status]

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
        borderBottom: "1px solid var(--border)", cursor: "pointer",
        background: selected ? "color-mix(in srgb, var(--primary) 8%, transparent)"
          : hov ? "var(--accent)" : "transparent",
        borderLeft: selected ? "2px solid var(--primary)" : "2px solid transparent",
        transition: "background 0.1s",
      }}
    >
      <div style={{ width: 34, height: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
        {(() => { const IC = Icons[integration.icon as keyof typeof Icons] as React.ElementType; return IC ? <IC size={18} /> : null })()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 2 }}>
          {integration.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          {integration.category} · {integration.authType}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
          background: `${statusMeta.color}18`, color: statusMeta.color,
          border: `1px solid ${statusMeta.color}30`,
        }}>
          {statusMeta.icon} {statusMeta.label}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 3 }}>
          {integration.lastSync}
        </div>
      </div>
    </div>
  )
}

// ─── Request integration panel ────────────────────────────────────────────────

function RequestPanel({ onClose }: { onClose: () => void }) {
  const [name,     setName]     = useState("")
  const [category, setCategory] = useState("")
  const [useCase,  setUseCase]  = useState("")
  const [priority, setPriority] = useState("medium")
  const [submitted, setSubmitted] = useState(false)

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", fontSize: 13, borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--surface)",
    color: "var(--foreground)", outline: "none", boxSizing: "border-box",
  }

  if (submitted) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--badge-success)18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Icons.CheckCircle size={24} style={{ color: "var(--badge-success)" }} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>Request submitted</div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: 24 }}>
          Your request for <strong>{name}</strong> has been sent to your AIMS-OS account team. You'll hear back within 2 business days.
        </div>
        <Button variant="secondary" size="sm" onClick={onClose}>Done</Button>
      </div>
    )
  }

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
        Don't see what you need? Tell us and we'll evaluate it for a future release.
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>Integration name <span style={{ color: "var(--badge-error)" }}>*</span></div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Workday, Coupa, Greenhouse" style={inputStyle} />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>Category</div>
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. HRIS, Procurement, Recruiting" style={inputStyle} />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>How would you use this integration? <span style={{ color: "var(--badge-error)" }}>*</span></div>
        <textarea
          value={useCase}
          onChange={e => setUseCase(e.target.value)}
          placeholder="Describe the data you need and how it would support your workflows…"
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>Priority</div>
        <select value={priority} onChange={e => setPriority(e.target.value)} style={inputStyle}>
          <option value="low">Low — nice to have</option>
          <option value="medium">Medium — would improve workflows</option>
          <option value="high">High — blocking a key use case</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
        <Button
          variant="main"
          size="sm"
          onClick={() => { if (name.trim() && useCase.trim()) setSubmitted(true) }}
        >
          Submit request
        </Button>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}

// ─── Catalog detail panel ─────────────────────────────────────────────────────

function CatalogDetailPanel({ item, connected, onConnect }: {
  item: CatalogItem; connected: boolean; onConnect: () => void
}) {
  const [step, setStep] = useState<"info" | "config" | "done">("info")
  const [apiKey, setApiKey] = useState("")

  const IC = Icons[item.icon as keyof typeof Icons] as React.ElementType

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", fontSize: 13, borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--surface)",
    color: "var(--foreground)", outline: "none",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Header identity */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 44, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
          {IC ? <IC size={22} /> : null}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>{item.name}</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
            {item.category} · {item.authType}
          </div>
        </div>
        {connected && (
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: "var(--badge-success)18", color: "var(--badge-success)", border: "1px solid var(--badge-success)30" }}>
            Connected
          </span>
        )}
      </div>

      <div style={{ flex: 1, padding: "16px 20px" }}>
        {step === "info" && (
          <>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: 20 }}>{item.description}</div>

            {[
              ["Category",         item.category],
              ["Authentication",   item.authType],
              ["Sync direction",   "Read + Write"],
              ["Setup time",       "~5 minutes"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ width: 130, flexShrink: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", paddingTop: 1 }}>{k}</span>
                <span style={{ fontSize: 13, color: "var(--foreground)" }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop: 20 }}>
              {connected
                ? <Button variant="secondary" size="sm" style={{ color: "var(--badge-error)", borderColor: "var(--badge-error)40" }}>
                    <Icons.Unplug size={13} style={{ marginRight: 4 }} />
                    Disconnect
                  </Button>
                : <Button variant="main" size="sm" onClick={() => setStep("config")}>
                    Connect {item.name}
                  </Button>
              }
            </div>
          </>
        )}

        {step === "config" && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>Connect {item.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 20, lineHeight: 1.5 }}>
              {item.authType === "OAuth 2.0"
                ? "You'll be redirected to authorize AIMS-OS to access your account."
                : `Provide your ${item.authType} credentials to establish the connection.`}
            </div>

            {item.authType !== "OAuth 2.0" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  {item.authType === "API Key" ? "API key" : "Service account JSON"}
                </div>
                <input
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={item.authType === "API Key" ? "sk-…" : "Paste service account credentials"}
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>Sync frequency</div>
              <select style={{ ...inputStyle }}>
                <option>Every hour</option>
                <option>Every 4 hours</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="main" size="sm" onClick={() => { onConnect(); setStep("done") }}>
                {item.authType === "OAuth 2.0" ? "Authorize with " + item.name : "Connect"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setStep("info")}>Cancel</Button>
            </div>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--badge-success)18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icons.CheckCircle size={24} style={{ color: "var(--badge-success)" }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{item.name} connected</div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>First sync will run within the next few minutes.</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Catalog / Marketplace ────────────────────────────────────────────────────

function CatalogView({ connectedIds }: { connectedIds: Set<string> }) {
  const [catFilter, setCatFilter] = useState("All")
  const [catQuery, setCatQuery]   = useState("")
  const [selected, setSelected]   = useState<CatalogItem | null>(null)
  const [connected, setConnected] = useState<Set<string>>(connectedIds)
  const [showRequest, setShowRequest] = useState(false)

  const filtered = CATALOG.filter(c =>
    (catFilter === "All" || c.category === catFilter) &&
    (c.name.toLowerCase().includes(catQuery.toLowerCase()) ||
     c.category.toLowerCase().includes(catQuery.toLowerCase()))
  )

  const popular = CATALOG.filter(c => c.popular && (catFilter === "All" || c.category === catFilter) && c.name.toLowerCase().includes(catQuery.toLowerCase()))

  const IntIcon = ({ icon }: { icon: string }) => {
    const IC = Icons[icon as keyof typeof Icons] as React.ElementType
    return IC ? <IC size={18} /> : null
  }

  return (
    <div style={{ display: "flex", minHeight: 0, flex: 1 }}>
      {/* Category sidebar */}
      <div style={{ width: 160, flexShrink: 0, borderRight: "1px solid var(--border)", padding: "16px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          {CATALOG_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "6px 16px", fontSize: 12, fontWeight: catFilter === cat ? 700 : 500,
                color: catFilter === cat ? "var(--primary)" : "var(--muted-foreground)",
                background: catFilter === cat ? "var(--primary)10" : "none",
                border: "none", cursor: "pointer", borderRadius: 0,
                borderLeft: catFilter === cat ? "2px solid var(--primary)" : "2px solid transparent",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Request at bottom of sidebar */}
        <div style={{ padding: "12px 12px 0", borderTop: "1px solid var(--border)", marginTop: 8 }}>
          <button
            onClick={() => setShowRequest(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, width: "100%",
              padding: "7px 8px", fontSize: 11, fontWeight: 600,
              color: "var(--muted-foreground)", background: "none", border: "none",
              cursor: "pointer", borderRadius: 6, textAlign: "left",
            }}
          >
            <Icons.PlusCircle size={13} />
            Request integration
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, padding: "16px 20px", overflowY: "auto" }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Icons.Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
          <input
            value={catQuery}
            onChange={e => setCatQuery(e.target.value)}
            placeholder="Search integrations…"
            style={{
              width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              fontSize: 13, border: "1px solid var(--border)", borderRadius: 8,
              background: "var(--surface)", color: "var(--foreground)", outline: "none",
            }}
          />
        </div>

        {/* Popular row */}
        {popular.length > 0 && catQuery === "" && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>Popular</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {popular.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                    border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer",
                    background: "var(--surface-raised)", color: "var(--foreground)",
                  }}
                >
                  <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)" }}>
                    <IntIcon icon={item.icon} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</span>
                  {connected.has(item.id) && <Icons.CheckCircle size={12} style={{ color: "var(--badge-success)" }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid or empty state */}
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <Icons.SearchX size={24} style={{ marginBottom: 10, opacity: 0.3, color: "var(--muted-foreground)" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>No integrations match "{catQuery}"</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 20 }}>
              Don't see what you're looking for?
            </div>
            <Button variant="secondary" size="sm" onClick={() => { setCatQuery(""); setShowRequest(true) }}>
              <Icons.PlusCircle size={13} style={{ marginRight: 4 }} />
              Request integration
            </Button>
          </div>
        ) : (
          <>
            {catQuery === "" && popular.length > 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>All</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{
                    padding: "14px", border: "1px solid var(--border)", borderRadius: 10,
                    background: "var(--surface-raised)", cursor: "pointer", textAlign: "left",
                    display: "flex", flexDirection: "column", gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                      <IntIcon icon={item.icon} />
                    </div>
                    {connected.has(item.id) && (
                      <Icons.CheckCircle size={13} style={{ color: "var(--badge-success)" }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{item.name}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{item.category}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.4 }}>{item.description}</div>
                  <div style={{
                    marginTop: 4, fontSize: 11, fontWeight: 600, padding: "4px 0",
                    color: connected.has(item.id) ? "var(--badge-success)" : "var(--primary)",
                  }}>
                    {connected.has(item.id) ? "Connected" : "Connect →"}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Catalog detail SlideOut */}
      <SlideOut
        type="full-slot"
        open={selected !== null && !showRequest}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected?.category ?? ""}
      >
        {selected && (
          <CatalogDetailPanel
            item={selected}
            connected={connected.has(selected.id)}
            onConnect={() => setConnected(prev => new Set([...prev, selected.id]))}
          />
        )}
      </SlideOut>

      {/* Request integration SlideOut */}
      <SlideOut
        type="full-slot"
        open={showRequest}
        onClose={() => setShowRequest(false)}
        title="Request integration"
        subtitle="Tell us what you need"
      >
        <RequestPanel onClose={() => setShowRequest(false)} />
      </SlideOut>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function AdminIntegrationsScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [tab, setTab]         = useState("connected")
  const [connectedList, setConnectedList] = useState<Integration[]>(INITIAL_CONNECTED)
  const [selected, setSelected] = useState<Integration | null>(INITIAL_CONNECTED[0])
  const [query, setQuery]     = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | IntegrationStatus>("all")

  function handleAction(id: string, action: ActionType) {
    if (action === "disconnect") {
      setSelected(null)
      setConnectedList(prev => prev.filter(i => i.id !== id))
      return
    }
    setConnectedList(prev => prev.map(i => {
      if (i.id !== id) return i
      if (action === "reauth") return { ...i, status: "active" as IntegrationStatus, errorMsg: undefined }
      if (action === "pause")  return { ...i, status: "paused" as IntegrationStatus }
      if (action === "resume") return { ...i, status: "active" as IntegrationStatus }
      return i
    }))
    // Sync selected with updated state
    setSelected(prev => {
      if (!prev || prev.id !== id) return prev
      if (action === "reauth") return { ...prev, status: "active" as IntegrationStatus, errorMsg: undefined }
      if (action === "pause")  return { ...prev, status: "paused" as IntegrationStatus }
      if (action === "resume") return { ...prev, status: "active" as IntegrationStatus }
      return prev
    })
  }

  const filteredByStatus = connectedList.filter(c => statusFilter === "all" || c.status === statusFilter)
  const filtered = filteredByStatus.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  )

  const errorCount = connectedList.filter(c => c.status === "error").length
  const connectedIds = new Set(connectedList.map(c => c.id))

  const STATUS_FILTERS: Array<{ id: "all" | IntegrationStatus; label: string }> = [
    { id: "all",    label: `All (${connectedList.length})` },
    { id: "active", label: `Active (${connectedList.filter(c => c.status === "active").length})` },
    { id: "error",  label: `Error (${connectedList.filter(c => c.status === "error").length})` },
    { id: "paused", label: `Paused (${connectedList.filter(c => c.status === "paused").length})` },
  ]

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="integrations"
      onSidebarItemClick={onNavigate}
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Integrations"
          description={`${connectedList.length} connected · ${CATALOG.length} available in catalog`}
          primaryAction={
            <div style={{ display: "flex", gap: 8 }}>
              {errorCount > 0 && (
                <button
                  onClick={() => { setTab("connected"); setStatusFilter("error") }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
                    padding: "5px 10px", borderRadius: 7,
                    background: "var(--badge-error)15", color: "var(--badge-error)",
                    border: "1px solid var(--badge-error)30", cursor: "pointer",
                  }}
                >
                  <Icons.AlertCircle size={12} />
                  {errorCount} {errorCount === 1 ? "error" : "errors"}
                </button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setTab("catalog")}>
                <Icons.LayoutGrid size={14} style={{ marginRight: 4 }} />
                Browse catalog
              </Button>
            </div>
          }
        />
      )}
    >
      {/* Tabs */}
      <div style={{ marginBottom: 16 }}>
        <SwitchTab
          items={[
            { id: "connected", label: "Connected" },
            { id: "catalog",   label: "Catalog"   },
          ]}
          value={tab}
          onChange={v => { setTab(v); if (v === "catalog") setSelected(null) }}
          size="s"
        />
      </div>

      {tab === "connected" && (
        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Left list */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {/* Toolbar: search + status filter */}
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
              <div style={{ position: "relative", marginBottom: 10 }}>
                <Icons.Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search connected integrations…"
                  style={{
                    width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                    fontSize: 13, border: "1px solid var(--border)", borderRadius: 7,
                    background: "var(--surface)", color: "var(--foreground)", outline: "none",
                  }}
                />
              </div>
              {/* Status filter chips */}
              <div style={{ display: "flex", gap: 6 }}>
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      cursor: "pointer", border: "1px solid",
                      background: statusFilter === f.id ? "var(--primary)" : "transparent",
                      color: statusFilter === f.id ? "#fff" : "var(--muted-foreground)",
                      borderColor: statusFilter === f.id ? "var(--primary)" : "var(--border)",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted-foreground)" }}>
                <Icons.Plug size={22} style={{ marginBottom: 8, opacity: 0.3 }} />
                <div style={{ fontSize: 13 }}>
                  {statusFilter !== "all" ? `No ${statusFilter} integrations` : "No integrations found"}
                </div>
              </div>
            ) : (
              filtered.map(int => (
                <IntegrationRow
                  key={int.id}
                  integration={int}
                  selected={selected?.id === int.id}
                  onClick={() => setSelected(prev => prev?.id === int.id ? null : int)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <SlideOut
        type="full-slot"
        open={selected !== null && tab === "connected"}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.category} · ${STATUS_META[selected.status].label}` : ""}
      >
        {selected && <OperatePanel integration={selected} onAction={handleAction} />}
      </SlideOut>

      {tab === "catalog" && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Integration catalog</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Browse and connect {CATALOG.length} available integrations.</div>
          </div>
          <CatalogView connectedIds={connectedIds} />
        </div>
      )}
    </ScreenLayout>
  )
}
