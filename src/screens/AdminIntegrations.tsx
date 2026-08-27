import { useState } from "react"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { SwitchTab }    from "@/components/ui/switch-tab"

// ─── Sidebar ──────────────────────────────────────────────────────────────────


// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationStatus = "active" | "error" | "paused" | "pending"
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
  id: string; name: string; category: string; icon: string; description: string; popular?: boolean
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STATUS_META: Record<IntegrationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active:  { label: "Active",   color: "var(--badge-success)", icon: <Icons.CheckCircle size={11} /> },
  error:   { label: "Error",    color: "var(--badge-error)",   icon: <Icons.AlertCircle size={11} /> },
  paused:  { label: "Paused",   color: "var(--muted-foreground)", icon: <Icons.PauseCircle size={11} /> },
  pending: { label: "Pending",  color: "var(--badge-alert)",   icon: <Icons.Clock size={11} /> },
}

const CONNECTED: Integration[] = [
  {
    id: "salesforce", name: "Salesforce CRM", category: "CRM", icon: "☁️",
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
    id: "databricks", name: "Databricks", category: "Data Platform", icon: "🧱",
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
    id: "snowflake", name: "Snowflake", category: "Data Warehouse", icon: "❄️",
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
    id: "sap", name: "SAP S/4HANA", category: "ERP", icon: "🏭",
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
    id: "bigquery", name: "Google BigQuery", category: "Data Warehouse", icon: "📊",
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
    id: "teams", name: "Microsoft Teams", category: "Collaboration", icon: "💬",
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
  { id: "hubspot",    name: "HubSpot",        category: "CRM",              icon: "🟠", description: "Inbound marketing and sales CRM.", popular: true },
  { id: "jira",       name: "Jira",           category: "Project Mgmt",     icon: "🔵", description: "Issue and project tracking for dev teams." },
  { id: "slack",      name: "Slack",          category: "Collaboration",    icon: "💬", description: "Team messaging and workflow automation.", popular: true },
  { id: "notion",     name: "Notion",         category: "Knowledge Base",   icon: "⬛", description: "Docs, wikis, and databases in one tool." },
  { id: "postgres",   name: "PostgreSQL",     category: "Database",         icon: "🐘", description: "Open-source relational database.", popular: true },
  { id: "mysql",      name: "MySQL",          category: "Database",         icon: "🐬", description: "World's most popular open-source database." },
  { id: "mongo",      name: "MongoDB",        category: "Database",         icon: "🍃", description: "Document database for modern apps." },
  { id: "s3",         name: "AWS S3",         category: "Storage",          icon: "🪣", description: "Object storage for any type of data.", popular: true },
  { id: "azure",      name: "Azure Blob",     category: "Storage",          icon: "☁️", description: "Massively scalable cloud object storage." },
  { id: "tableau",    name: "Tableau",        category: "Analytics",        icon: "📈", description: "Visual analytics and business intelligence." },
  { id: "powerbi",    name: "Power BI",       category: "Analytics",        icon: "📊", description: "Microsoft business analytics service." },
  { id: "dbt",        name: "dbt",            category: "Data Transform",   icon: "🔄", description: "Data transformation for analytics engineering." },
  { id: "github",     name: "GitHub",         category: "Developer Tools",  icon: "🐙", description: "Code hosting, CI/CD, and collaboration." },
  { id: "zendesk",    name: "Zendesk",        category: "Support",          icon: "🎫", description: "Customer support ticketing platform." },
  { id: "stripe",     name: "Stripe",         category: "Payments",         icon: "💳", description: "Payment processing and financial infrastructure." },
  { id: "sendgrid",   name: "SendGrid",       category: "Email",            icon: "📧", description: "Email delivery and marketing platform." },
]

// ─── Operate panel ────────────────────────────────────────────────────────────

function OperatePanel({ integration, onClose }: { integration: Integration; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("overview")
  const statusMeta = STATUS_META[integration.status]
  const [rotatingCreds, setRotatingCreds] = useState(false)

  return (
    <div style={{
      width: 380, flexShrink: 0, borderLeft: "1px solid var(--border)",
      background: "var(--surface)", display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
    }}>
      {/* Panel header */}
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{integration.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>{integration.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {integration.category}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 100,
                background: `${statusMeta.color}18`, color: statusMeta.color,
                border: `1px solid ${statusMeta.color}30`,
              }}>
                {statusMeta.icon} {statusMeta.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
          >
            <Icons.X size={16} />
          </button>
        </div>

        {integration.errorMsg && (
          <div style={{
            marginTop: 12, padding: "8px 12px", borderRadius: 8,
            background: "var(--badge-error)10", border: "1px solid var(--badge-error)30",
            fontSize: 12, color: "var(--badge-error)", lineHeight: 1.4,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <Icons.AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            {integration.errorMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {integration.status === "error"
            ? <Button variant="main" size="sm" style={{ flex: 1 }}>Re-authenticate</Button>
            : integration.status === "paused"
              ? <Button variant="main" size="sm" style={{ flex: 1 }}>Resume sync</Button>
              : <Button variant="secondary" size="sm" style={{ flex: 1 }}>Sync now</Button>
          }
          <Button variant="secondary" size="sm">Settings</Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "10px 20px 0", borderBottom: "1px solid var(--border)" }}>
        <SwitchTab
          items={[
            { id: "overview", label: "Overview"    },
            { id: "history",  label: "Sync history" },
            { id: "creds",    label: "Credentials"  },
          ]}
          value={activeTab}
          onChange={setActiveTab}
          size="s"
        />
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {activeTab === "overview" && (
          <>
            {[
              ["Auth type",        integration.authType],
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
              <Button variant="secondary" size="sm" style={{ color: "var(--badge-error)", borderColor: "var(--badge-error)40" }}>
                <Icons.Unplug size={13} style={{ marginRight: 4 }} />
                Disconnect integration
              </Button>
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>Recent sync runs</div>
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
                onClick={() => setRotatingCreds(true)}
              >
                {rotatingCreds ? "Rotating…" : integration.status === "error" ? "Re-authenticate" : "Rotate credentials"}
              </Button>
              <Button variant="secondary" size="sm">View scopes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
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
      <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{integration.icon}</div>
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

// ─── Catalog grid ─────────────────────────────────────────────────────────────

const CAT_FILTERS = ["All", "CRM", "Data Warehouse", "Database", "Storage", "Analytics", "Collaboration", "Developer Tools"]

function CatalogView({ onConnect }: { onConnect?: (id: string) => void }) {
  const [catFilter, setCatFilter] = useState("All")
  const [catQuery, setCatQuery] = useState("")
  const [connected, setConnected] = useState<Set<string>>(new Set(CONNECTED.map(c => c.id)))

  const filtered = CATALOG.filter(c =>
    (catFilter === "All" || c.category === catFilter) &&
    (c.name.toLowerCase().includes(catQuery.toLowerCase()) || c.category.toLowerCase().includes(catQuery.toLowerCase()))
  )

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {/* Search + category filter */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, paddingTop: 20 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Icons.Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
          <input
            value={catQuery}
            onChange={e => setCatQuery(e.target.value)}
            placeholder="Search integrations…"
            style={{
              width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              fontSize: 13, border: "1px solid var(--border)", borderRadius: 8,
              background: "var(--surface)", color: "var(--foreground)", outline: "none",
            }}
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{
            padding: "7px 10px", fontSize: 12, borderRadius: 7, cursor: "pointer",
            border: "1px solid var(--border)", background: "var(--surface)",
            color: "var(--foreground)", outline: "none",
          }}
        >
          {CAT_FILTERS.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {filtered.map(item => {
          return (
            <div key={item.id} style={{
              padding: "16px", border: "1px solid var(--border)", borderRadius: 10,
              background: "var(--surface-raised)",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ fontSize: 26, lineHeight: 1 }}>{item.icon}</div>
                {item.popular && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                    background: "var(--primary)18", color: "var(--primary)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    Popular
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{item.name}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{item.category}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.4, flex: 1 }}>{item.description}</div>
              <Button
                variant="secondary"
                size="sm"
                style={{ marginTop: 4, width: "100%", opacity: connected.has(item.id) ? 0.45 : 1, cursor: connected.has(item.id) ? "default" : "pointer" }}
                onClick={() => {
                  if (!connected.has(item.id)) {
                    setConnected(prev => new Set([...prev, item.id]))
                    onConnect?.(item.id)
                  }
                }}
              >
                {connected.has(item.id) ? "✓ Connected" : "Connect"}
              </Button>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "40px 0", textAlign: "center", color: "var(--muted-foreground)" }}>
            <Icons.SearchX size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
            <div style={{ fontSize: 13 }}>No integrations match "{catQuery}"</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function AdminIntegrationsScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [tab, setTab]         = useState("connected")
  const [selected, setSelected] = useState<Integration | null>(CONNECTED[0])
  const [query, setQuery]     = useState("")

  const filtered = CONNECTED.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  )

  const errorCount = CONNECTED.filter(c => c.status === "error").length

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
          description={`${CONNECTED.length} connected · ${CATALOG.length} available in catalog`}
          primaryAction={
            <div style={{ display: "flex", gap: 8 }}>
              {errorCount > 0 && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
                  padding: "5px 10px", borderRadius: 7,
                  background: "var(--badge-error)15", color: "var(--badge-error)",
                  border: "1px solid var(--badge-error)30",
                }}>
                  <Icons.AlertCircle size={12} />
                  {errorCount} error
                </span>
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
            { id: "connected", label: `Connected (${CONNECTED.length})` },
            { id: "catalog",   label: `Catalog (${CATALOG.length}+)`    },
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
            {/* Search */}
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
              <div style={{ position: "relative" }}>
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
            </div>
            {/* Rows */}
            {filtered.map(int => (
              <IntegrationRow
                key={int.id}
                integration={int}
                selected={selected?.id === int.id}
                onClick={() => setSelected(prev => prev?.id === int.id ? null : int)}
              />
            ))}
          </div>

          {/* Operate panel */}
          {selected && (
            <OperatePanel integration={selected} onClose={() => setSelected(null)} />
          )}
        </div>
      )}

      {tab === "catalog" && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Integration catalog</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Connect data sources, tools, and services to your workspace.</div>
          </div>
          <CatalogView />
        </div>
      )}
    </ScreenLayout>
  )
}
