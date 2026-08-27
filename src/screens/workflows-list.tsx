import { useState, useMemo } from "react"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Input }        from "@/components/ui/input"
import { SwitchTab }    from "@/components/ui/switch-tab"
import type { SidebarItem } from "@/components/ui/sidebar"

const SIDEBAR: SidebarItem[] = [
  { id: "home",       label: "Home",       icon: "Home"     },
  { id: "workflows",  label: "Workflows",  icon: "Zap"      },
  { id: "agents",     label: "Agents",     icon: "Bot"      },
  { id: "data",       label: "Data",       icon: "Database" },
  { id: "governance", label: "Governance", icon: "Shield"   },
  { id: "settings",   label: "Settings",   icon: "Settings" },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkflowStatus    = "active" | "draft" | "paused"
type Classification    = "solo_lectura" | "lectura_escritura" | "lectura_escritura_pii"

interface WorkflowRecord {
  id:             string
  name:           string
  category:       string
  classification: Classification
  status:         WorkflowStatus
  systems:        string[]
  nodeCount:      number
  lastRun:        string | null
  createdAt:      string
  createdBy:      string
  missingDeps:    number
}

// ─── Fixture data ─────────────────────────────────────────────────────────────

const WORKFLOWS: WorkflowRecord[] = [
  {
    id: "wf-001",
    name: "Revenue sync — daily",
    category: "Revenue Operations",
    classification: "lectura_escritura",
    status: "active",
    systems: ["Salesforce", "NetSuite"],
    nodeCount: 10,
    lastRun: "2026-08-14T06:00:00Z",
    createdAt: "2026-08-10T09:30:00Z",
    createdBy: "Thomas Gonzalez",
    missingDeps: 0,
  },
  {
    id: "wf-002",
    name: "Closed won enrichment",
    category: "Sales",
    classification: "lectura_escritura",
    status: "active",
    systems: ["Salesforce", "HubSpot", "Slack"],
    nodeCount: 8,
    lastRun: "2026-08-14T08:30:00Z",
    createdAt: "2026-08-08T14:00:00Z",
    createdBy: "Maria Chen",
    missingDeps: 0,
  },
  {
    id: "wf-003",
    name: "Employee onboarding alerts",
    category: "HR & People",
    classification: "solo_lectura",
    status: "draft",
    systems: ["Workday", "Slack"],
    nodeCount: 6,
    lastRun: null,
    createdAt: "2026-08-12T11:00:00Z",
    createdBy: "Thomas Gonzalez",
    missingDeps: 0,
  },
  {
    id: "wf-004",
    name: "Invoice reconciliation",
    category: "Finance",
    classification: "lectura_escritura",
    status: "active",
    systems: ["Stripe", "NetSuite"],
    nodeCount: 12,
    lastRun: "2026-08-13T22:00:00Z",
    createdAt: "2026-07-30T09:00:00Z",
    createdBy: "Ana Torres",
    missingDeps: 0,
  },
  {
    id: "wf-005",
    name: "Support escalation triage",
    category: "Customer Success",
    classification: "lectura_escritura",
    status: "active",
    systems: ["Zendesk", "Slack"],
    nodeCount: 9,
    lastRun: "2026-08-14T10:15:00Z",
    createdAt: "2026-08-05T16:00:00Z",
    createdBy: "James Park",
    missingDeps: 0,
  },
  {
    id: "wf-006",
    name: "PII data audit — quarterly",
    category: "Compliance",
    classification: "lectura_escritura_pii",
    status: "paused",
    systems: ["Salesforce", "Workday"],
    nodeCount: 14,
    lastRun: "2026-08-01T00:00:00Z",
    createdAt: "2026-07-01T08:00:00Z",
    createdBy: "Ana Torres",
    missingDeps: 0,
  },
  {
    id: "wf-007",
    name: "Inventory reorder alert",
    category: "Operations",
    classification: "solo_lectura",
    status: "draft",
    systems: ["SAP", "Shopify"],
    nodeCount: 7,
    lastRun: null,
    createdAt: "2026-08-13T15:30:00Z",
    createdBy: "Thomas Gonzalez",
    missingDeps: 1,
  },
  {
    id: "wf-008",
    name: "Directory sync — Google Workspace",
    category: "IT & Security",
    classification: "lectura_escritura",
    status: "paused",
    systems: ["Workday", "Google Workspace"],
    nodeCount: 8,
    lastRun: "2026-08-07T01:00:00Z",
    createdAt: "2026-07-20T10:00:00Z",
    createdBy: "James Park",
    missingDeps: 0,
  },
]

// ─── Display helpers ──────────────────────────────────────────────────────────

const CLS_LABEL: Record<Classification, string> = {
  solo_lectura:          "Read-only",
  lectura_escritura:     "Read & write",
  lectura_escritura_pii: "R/W + PII",
}

const CLS_COLOR: Record<Classification, string> = {
  solo_lectura:          "var(--muted-foreground)",
  lectura_escritura:     "var(--badge-light-blue)",
  lectura_escritura_pii: "var(--badge-error)",
}

const STATUS_COLOR: Record<WorkflowStatus, string> = {
  active: "var(--badge-success)",
  draft:  "var(--muted-foreground)",
  paused: "var(--badge-alert)",
}

const STATUS_LABEL: Record<WorkflowStatus, string> = {
  active: "Active",
  draft:  "Draft",
  paused: "Paused",
}

const PROTO_NOW = new Date("2026-08-14T12:00:00Z")

function formatRelative(iso: string): string {
  const diffH = Math.floor((PROTO_NOW.getTime() - new Date(iso).getTime()) / 3_600_000)
  if (diffH < 1)  return "Just now"
  if (diffH < 24) return `${diffH}h ago`
  const d = Math.floor(diffH / 24)
  if (d === 1)    return "Yesterday"
  return `${d}d ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function WorkflowRow({ wf }: { wf: WorkflowRecord }) {
  const [hovered, setHovered] = useState(false)
  const statusColor = STATUS_COLOR[wf.status]
  const clsColor    = CLS_COLOR[wf.classification]

  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: hovered ? "var(--accent)" : "transparent",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Status dot */}
      <div style={{
        width: 8, height: 8, borderRadius: "50%", background: statusColor, flexShrink: 0,
        boxShadow: wf.status === "active" ? `0 0 0 3px ${statusColor}33` : "none",
      }} />

      {/* Name + metadata */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{wf.name}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
            background: `${clsColor}22`, color: clsColor, border: `1px solid ${clsColor}44`,
          }}>
            {CLS_LABEL[wf.classification]}
          </span>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 100,
            background: "var(--muted)", color: "var(--muted-foreground)",
          }}>
            {wf.category}
          </span>
          {wf.missingDeps > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
              background: "rgba(237,108,2,0.08)", color: "var(--badge-alert)",  // audit-ignore: prototype fixture data
              border: "1px solid var(--badge-alert)",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <Icons.AlertTriangle size={10} />
              {wf.missingDeps} dep unresolved
            </span>
          )}
        </div>
        <div style={{
          fontSize: 12, color: "var(--muted-foreground)",
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icons.GitBranch size={11} />{wf.nodeCount} nodes
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icons.Plug size={11} />{wf.systems.join(", ")}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icons.Calendar size={11} />Created {formatDate(wf.createdAt)} · {wf.createdBy.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Last run */}
      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>
          {wf.lastRun ? "Last run" : "Never run"}
        </div>
        {wf.lastRun && (
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>
            {formatRelative(wf.lastRun)}
          </div>
        )}
      </div>

      {/* Status badge */}
      <div style={{
        padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
        background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
        minWidth: 58, textAlign: "center", flexShrink: 0,
      }}>
        {STATUS_LABEL[wf.status]}
      </div>

      {/* Actions */}
      <button
        onClick={e => e.stopPropagation()}
        style={{
          background: "none", border: "none", padding: "6px", borderRadius: 6,
          cursor: "pointer", color: "var(--muted-foreground)", display: "flex", alignItems: "center",
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        <Icons.MoreHorizontal size={15} />
      </button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function WorkflowsListScreen() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [query, setQuery] = useState("")

  const counts = useMemo(() => ({
    all:    WORKFLOWS.length,
    active: WORKFLOWS.filter(w => w.status === "active").length,
    draft:  WORKFLOWS.filter(w => w.status === "draft").length,
    paused: WORKFLOWS.filter(w => w.status === "paused").length,
  }), [])

  const filtered = useMemo(() => {
    let result = WORKFLOWS
    if (statusFilter !== "all") result = result.filter(w => w.status === statusFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.systems.some(s => s.toLowerCase().includes(q))
      )
    }
    return result
  }, [statusFilter, query])

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="workflows"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Workflows"
          description="Governed automated workflows · Helix Agentic Studio"
          primaryAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => { window.location.href = "?proto=proto-chat-workflow-config" }}
            >
              <Icons.Plus size={14} style={{ marginRight: 4 }} />
              New workflow
            </Button>
          }
        />
      )}
    >
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <SwitchTab
          items={[
            { id: "all",    label: `All (${counts.all})`       },
            { id: "active", label: `Active (${counts.active})` },
            { id: "draft",  label: `Draft (${counts.draft})`   },
            { id: "paused", label: `Paused (${counts.paused})` },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          size="s"
        />
        <div style={{ marginLeft: "auto", width: 240 }}>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search workflows…"
          />
        </div>
      </div>

      {/* List container */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
        {/* Column header */}
        <div style={{
          padding: "10px 20px 10px 42px",
          display: "flex", alignItems: "center", gap: 14,
          background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
          fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)",
          textTransform: "uppercase", letterSpacing: "0.07em",
        }}>
          <span style={{ flex: 1 }}>Workflow</span>
          <span style={{ minWidth: 80, textAlign: "right" }}>Last run</span>
          <span style={{ minWidth: 58, textAlign: "center" }}>Status</span>
          <span style={{ width: 27 }} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
            <Icons.SearchX size={28} style={{ marginBottom: 10, opacity: 0.35 }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>No workflows match</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try a different status or search term</div>
          </div>
        ) : (
          filtered.map(wf => <WorkflowRow key={wf.id} wf={wf} />)
        )}
      </div>
    </ScreenLayout>
  )
}
