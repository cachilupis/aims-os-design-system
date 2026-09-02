import { useState, useRef, useEffect } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { SlideOut } from "@/components/ui/slide-out"
import { Pagination } from "@/components/ui/pagination"
import { EmptyState } from "@/components/ui/empty-state"
import type { SidebarItem } from "@/components/ui/sidebar"

// ── Routing state ─────────────────────────────────────────────────────────────

type MainView      = "dashboards" | "widgets"
type WidgetSubView = "library" | "marketplace"
type OverlayView   = null | "new-dashboard" | "builder"

// ── Shared types ──────────────────────────────────────────────────────────────

type DashStatus  = "published" | "draft" | "pending"
type EntityKind  = "Company" | "Contact" | "Employee" | "Deal" | "Standalone"
type Freshness   = "live" | "fresh" | "stale"
type BizCat      = "all" | "aims-os" | "sales" | "finance" | "customer-service" | "hr" | "marketing"
type Skeleton    = "KPI" | "Chart" | "Feed" | "Gauge" | "Donut" | "Board" | "Funnel" | "Stat Row" | "Alerts" | "Cost KPI"
type TabId       = "data" | "widget" | "appearance"
type OpType      = "aggregate" | "record_set"
type BuilderStep = "Placement" | "Start point"
// Widget library types
type LibHealth   = "active" | "inactive" | "unused" | "review"
type LibCategory = "AIMS OS" | "Operational" | "Engagement" | "Intelligence"
type LibProfile  = "All" | "Company" | "Contact" | "Employee" | "Deal" | "Standalone"
type LibWidget   = {
  id: string; name: string; source: string; skeleton: Skeleton
  category: LibCategory; health: LibHealth; freshness: Freshness
  governed: boolean; system: boolean; usedIn: number
  placement: LibProfile; description: string
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "dashboards", label: "Dashboards", icon: "LayoutDashboard" },
  { id: "widgets",    label: "Widgets",    icon: "PieChart" },
]

// ── Dashboard data ────────────────────────────────────────────────────────────

const DASHBOARDS = [
  { id: "d1",  name: "Company Overview",       status: "published" as DashStatus, entity: "Company"    as EntityKind, placement: "Profile — Overview tab", owner: "Maria Chen",     widgetCount: 8,  audience: "Everyone",    updated: "2h ago",    description: "Executive overview of key company metrics across CRM, support, and workforce." },
  { id: "d2",  name: "Deal Pipeline Tracker",  status: "published" as DashStatus, entity: "Deal"       as EntityKind, placement: "Profile — Overview tab", owner: "James Park",     widgetCount: 6,  audience: "Sales team",  updated: "Yesterday", description: "Real-time pipeline health and stage velocity for active deals." },
  { id: "d3",  name: "Contact Engagement",     status: "draft"     as DashStatus, entity: "Contact"    as EntityKind, placement: "Profile — Activity tab",  owner: "Sofia Reyes",    widgetCount: 4,  audience: "By role",     updated: "3d ago",    description: "Contact-level touchpoint history across email, chat, and support." },
  { id: "d4",  name: "Employee Performance",   status: "published" as DashStatus, entity: "Employee"   as EntityKind, placement: "Profile — Overview tab", owner: "David Lim",      widgetCount: 7,  audience: "By team",     updated: "1h ago",    description: "KPIs and goal tracking per employee linked to BambooHR data." },
  { id: "d5",  name: "Support Ticket Volume",  status: "published" as DashStatus, entity: "Standalone" as EntityKind, placement: "Report collection",      owner: "Ana Kovacs",     widgetCount: 5,  audience: "Everyone",    updated: "4h ago",    description: "Inbound ticket trends, SLA adherence, and CSAT scores from Zendesk." },
  { id: "d6",  name: "AI Worker Summary",      status: "pending"   as DashStatus, entity: "Standalone" as EntityKind, placement: "Home — Workspace",       owner: "Thomas G.",      widgetCount: 9,  audience: "Everyone",    updated: "Just now",  description: "Live AIMS OS worker status, task throughput, and error rates." },
  { id: "d7",  name: "Deals Won This Month",   status: "published" as DashStatus, entity: "Deal"       as EntityKind, placement: "Report collection",      owner: "James Park",     widgetCount: 3,  audience: "Sales team",  updated: "2d ago",    description: "Closed-won breakdown by rep, industry, and deal size for the current month." },
  { id: "d8",  name: "New Hire Onboarding",    status: "draft"     as DashStatus, entity: "Employee"   as EntityKind, placement: "Profile — Overview tab", owner: "David Lim",      widgetCount: 4,  audience: "HR team",     updated: "5d ago",    description: "Onboarding progress tracker with milestone completion and manager notes." },
]

// ── Widget library data ───────────────────────────────────────────────────────

const SKELETON_ICON: Record<string, keyof typeof LucideIcons> = {
  KPI:        "Hash",
  Chart:      "BarChart2",
  Feed:       "List",
  Gauge:      "Gauge",
  Donut:      "PieChart",
  Board:      "LayoutGrid",
  Funnel:     "TrendingDown",
  "Stat Row": "Rows3",
  Alerts:     "Bell",
  "Cost KPI": "DollarSign",
}

const LIB_WIDGETS: LibWidget[] = [
  { id:"w-001", name:"Human-in-the-Loop Queue",      source:"AIMS OS — Agentic Studio",   skeleton:"Feed",     category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:true,  usedIn:5,  placement:"Standalone", description:"Live queue of all conversations waiting for a human agent to pick up or review." },
  { id:"w-002", name:"Workflow Runs",                source:"AIMS OS — Agentic Studio",   skeleton:"Chart",    category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:4,  placement:"Standalone", description:"Daily run volume trend for all active workflows, broken down by status." },
  { id:"w-003", name:"Credits Consumed",             source:"AIMS OS — Credits",          skeleton:"KPI",      category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:5,  placement:"Standalone", description:"Total AI credits consumed this billing cycle vs. your plan limit." },
  { id:"w-004", name:"SLA Compliance Rate",          source:"AIMS OS — HTL",              skeleton:"Gauge",    category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:3,  placement:"Standalone", description:"Percentage of human-touch interactions resolved within the defined SLA window." },
  { id:"w-005", name:"Council Outcomes",             source:"AIMS OS — Governance",       skeleton:"Donut",    category:"AIMS OS",        health:"active", freshness:"fresh", governed:true,  system:false, usedIn:2,  placement:"Standalone", description:"Breakdown of governance council decisions: Approved, Escalated, Rejected." },
  { id:"w-006", name:"Agent Status Board",           source:"AIMS OS — Agents",           skeleton:"Board",    category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:1,  placement:"Standalone", description:"Real-time status grid for all deployed agents: Running, Idle, Error, Paused." },
  { id:"w-007", name:"Conversion Funnel",            source:"AIMS OS — Data Studio",      skeleton:"Funnel",   category:"AIMS OS",        health:"active", freshness:"fresh", governed:true,  system:false, usedIn:1,  placement:"Company",    description:"Stage-by-stage funnel from lead to closed-won for the selected entity scope." },
  { id:"w-008", name:"Platform Snapshot",            source:"AIMS OS — Platform",         skeleton:"Stat Row", category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:2,  placement:"Standalone", description:"At-a-glance row of key platform metrics: DAU, agents active, workflows running." },
  { id:"w-009", name:"Governance Alerts",            source:"AIMS OS — Governance",       skeleton:"Alerts",   category:"AIMS OS",        health:"review", freshness:"stale", governed:true,  system:false, usedIn:2,  placement:"Standalone", description:"Active policy violations and blocked actions requiring admin review." },
  { id:"w-010", name:"Account Revenue Health",       source:"Salesforce",                 skeleton:"KPI",      category:"Operational",    health:"active", freshness:"fresh", governed:true,  system:false, usedIn:8,  placement:"Company",    description:"ARR, churn risk score, and renewal date for the selected account." },
  { id:"w-011", name:"Open Tickets",                 source:"Zendesk",                    skeleton:"KPI",      category:"Operational",    health:"active", freshness:"live",  governed:true,  system:false, usedIn:6,  placement:"Company",    description:"Count of open support tickets by priority for this account." },
  { id:"w-012", name:"Pipeline Stage Funnel",        source:"Salesforce",                 skeleton:"Funnel",   category:"Operational",    health:"active", freshness:"fresh", governed:true,  system:false, usedIn:5,  placement:"Deal",       description:"Opportunity stage progression with time-in-stage and velocity metrics." },
  { id:"w-013", name:"Onboarding Checklist",         source:"AIMS OS — Platform",         skeleton:"Feed",     category:"Operational",    health:"active", freshness:"live",  governed:true,  system:false, usedIn:4,  placement:"Employee",   description:"Checklist of onboarding tasks with completion status per new hire." },
  { id:"w-014", name:"Email Engagement Rate",        source:"HubSpot",                    skeleton:"Chart",    category:"Engagement",     health:"active", freshness:"fresh", governed:false, system:false, usedIn:7,  placement:"Contact",    description:"Open rate, click rate, and reply rate for outbound sequences targeting this contact." },
  { id:"w-015", name:"Deal Velocity",                source:"Salesforce",                 skeleton:"Gauge",    category:"Operational",    health:"active", freshness:"fresh", governed:true,  system:false, usedIn:5,  placement:"Deal",       description:"Speed from stage entry to close compared to team median, per deal." },
  { id:"w-016", name:"NPS Trend",                    source:"Qualtrics",                  skeleton:"Chart",    category:"Engagement",     health:"inactive", freshness:"stale", governed:false, system:false, usedIn:3,  placement:"Company",    description:"Net Promoter Score trend over the past 12 months for this account." },
  { id:"w-017", name:"Contact Interaction Timeline", source:"HubSpot",                    skeleton:"Feed",     category:"Engagement",     health:"active", freshness:"live",  governed:false, system:false, usedIn:4,  placement:"Contact",    description:"Chronological feed of emails, calls, meetings, and notes for this contact." },
  { id:"w-018", name:"Risk Score Breakdown",         source:"AIMS OS — Intelligence",     skeleton:"Gauge",    category:"Intelligence",   health:"active", freshness:"fresh", governed:true,  system:false, usedIn:4,  placement:"Company",    description:"Composite churn/risk score with contributing signals and recommended actions." },
  { id:"w-019", name:"Next Best Action",             source:"AIMS OS — Intelligence",     skeleton:"KPI",      category:"Intelligence",   health:"active", freshness:"live",  governed:true,  system:false, usedIn:6,  placement:"Company",    description:"AI-recommended next action for this account with confidence score and reasoning." },
  { id:"w-020", name:"Revenue Attribution",          source:"Salesforce",                 skeleton:"Chart",    category:"Intelligence",   health:"review", freshness:"stale", governed:false, system:false, usedIn:2,  placement:"Deal",       description:"First-touch and multi-touch attribution by channel for this deal." },
  { id:"w-021", name:"Certification Tracker",        source:"Workday",                    skeleton:"Feed",     category:"Operational",    health:"unused", freshness:"fresh", governed:true,  system:false, usedIn:0,  placement:"Employee",   description:"Required certifications, completion status, and expiry dates per employee." },
  { id:"w-022", name:"Credit Spend Trend",           source:"AIMS OS — Credits",          skeleton:"Cost KPI", category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:1,  placement:"Standalone", description:"Daily and monthly AI credit spend with projected end-of-cycle balance." },
]

const LIB_CATEGORIES: LibCategory[] = ["AIMS OS", "Operational", "Engagement", "Intelligence"]
const LIB_SKELETONS: Skeleton[]     = ["KPI", "Chart", "Feed", "Gauge", "Donut", "Board", "Funnel", "Stat Row", "Alerts", "Cost KPI"]
const LIB_FRESHNESS: Freshness[]    = ["live", "fresh", "stale"]
const LIB_PROFILES: LibProfile[]    = ["All", "Company", "Contact", "Employee", "Deal", "Standalone"]
const LIB_PAGE_SIZE                 = 18
const LIB_GOVERNED_COUNT            = LIB_WIDGETS.filter(w => w.governed).length

// ── Marketplace data ──────────────────────────────────────────────────────────

// DS-GAP: CategoryColors — business-function palette; no DS tokens for these. Needs tokenization.
const CAT_COLOR: Record<string, string> = {
  "aims-os":          "#2B7FFF", // audit-ignore: prototype category colours
  "sales":            "#22C55E", // audit-ignore: prototype category colours
  "finance":          "#0EA5E9", // audit-ignore: prototype category colours
  "customer-service": "#F97316", // audit-ignore: prototype category colours
  "hr":               "#A78BFA", // audit-ignore: prototype category colours
  "marketing":        "#EC4899", // audit-ignore: prototype category colours
}
const CATEGORIES: { id: BizCat; label: string }[] = [
  { id: "all",              label: "All" },
  { id: "aims-os",          label: "AIMS OS" },
  { id: "sales",            label: "Sales" },
  { id: "finance",          label: "Finance" },
  { id: "customer-service", label: "Customer Service" },
  { id: "hr",               label: "HR" },
  { id: "marketing",        label: "Marketing" },
]
const MKT_WIDGETS = [
  { id: "m1",  name: "Revenue KPI",          source: "HubSpot",  cat: "sales",            complexity: "simple",   tenantUsage: 412, description: "Single headline MRR figure with period-over-period delta." },
  { id: "m2",  name: "Deal Velocity Chart",  source: "HubSpot",  cat: "sales",            complexity: "moderate", tenantUsage: 218, description: "Average days to close plotted weekly over a rolling quarter." },
  { id: "m3",  name: "CSAT Trend",           source: "Zendesk",  cat: "customer-service", complexity: "simple",   tenantUsage: 334, description: "90-day satisfaction score trend with goal-line overlay." },
  { id: "m4",  name: "Ticket Backlog Gauge", source: "Zendesk",  cat: "customer-service", complexity: "moderate", tenantUsage: 177, description: "Open ticket count vs. SLA threshold displayed as a gauge." },
  { id: "m5",  name: "Headcount Summary",    source: "BambooHR", cat: "hr",               complexity: "simple",   tenantUsage: 289, description: "Total active employees with department breakdown donut." },
  { id: "m6",  name: "Worker Overview",      source: "AIMS OS",  cat: "aims-os",          complexity: "advanced", tenantUsage: 156, description: "Unified status board for all AI Workers with run counts and error rates." },
  { id: "m7",  name: "Pipeline Heatmap",     source: "HubSpot",  cat: "sales",            complexity: "advanced", tenantUsage: 98,  description: "Deal count and value by stage and rep in a two-axis heatmap." },
  { id: "m8",  name: "Budget vs Actuals",    source: "NetSuite", cat: "finance",          complexity: "moderate", tenantUsage: 203, description: "Current spend vs. approved budget by cost center, bar-over-target style." },
  { id: "m9",  name: "Lead Source Mix",      source: "HubSpot",  cat: "marketing",        complexity: "simple",   tenantUsage: 145, description: "Breakdown of inbound leads by channel as a donut chart." },
  { id: "m10", name: "Time-to-Hire Trend",   source: "BambooHR", cat: "hr",               complexity: "moderate", tenantUsage: 112, description: "Average days from job post to offer acceptance, rolling 6 months." },
]

// ── New Dashboard wizard data ─────────────────────────────────────────────────

type ProfileTypeId = "Company" | "Contact" | "Employee" | "Deal"
type AudType       = "global" | "role" | "team" | "individual"
type Surface       = "profile" | "report" | "home"

const PROFILE_TYPES: { id: ProfileTypeId; label: string; tabs: string[] }[] = [
  { id: "Company",  label: "Company",  tabs: ["Overview", "Activity", "Contacts", "Deals", "Documents"] },
  { id: "Contact",  label: "Contact",  tabs: ["Overview", "Activity", "Deals", "Documents"] },
  { id: "Employee", label: "Employee", tabs: ["Overview", "Activity", "Performance", "Documents"] },
  { id: "Deal",     label: "Deal",     tabs: ["Overview", "Activity", "Timeline", "Documents"] },
]
const AUDIENCE_TYPES: { id: AudType; label: string }[] = [
  { id: "global", label: "Everyone" }, { id: "role", label: "By role" },
  { id: "team",   label: "By team" }, { id: "individual", label: "Specific user" },
]
const WIZARD_STEPS: BuilderStep[] = ["Placement", "Start point"]

// ── Widget builder data ───────────────────────────────────────────────────────

const ENTITY_SOURCES = [
  { id: "contacts_hubspot",      label: "Contacts",      integration: "HubSpot",  governed: true,  hasPII: true },
  { id: "companies_hubspot",     label: "Companies",     integration: "HubSpot",  governed: true,  hasPII: false },
  { id: "deals_hubspot",         label: "Deals",         integration: "HubSpot",  governed: true,  hasPII: false },
  { id: "tickets_zendesk",       label: "Tickets",       integration: "Zendesk",  governed: true,  hasPII: false },
  { id: "conversations_zendesk", label: "Conversations", integration: "Zendesk",  governed: false, hasPII: true },
  { id: "employees_bamboohr",    label: "Employees",     integration: "BambooHR", governed: true,  hasPII: true },
  { id: "workflows_aims",        label: "Workflows",     integration: "AIMS OS",  governed: true,  hasPII: false },
  { id: "ai_workers_aims",       label: "AI Workers",    integration: "AIMS OS",  governed: true,  hasPII: false },
]
const PRESET_DATASETS = [
  { id: "ds-total-mrr",        name: "Total MRR",          description: "Month-to-date closed revenue across all deals.", integration: "HubSpot",  governed: true },
  { id: "ds-active-contacts",  name: "Active Contacts",    description: "Contacts with at least one interaction in the last 30 days.", integration: "HubSpot",  governed: true },
  { id: "ds-open-deals",       name: "Open Deals",         description: "All deals currently in an open pipeline stage.", integration: "HubSpot",  governed: true },
  { id: "ds-ticket-volume",    name: "Ticket Volume",      description: "Total support tickets opened in the current period.", integration: "Zendesk",  governed: true },
  { id: "ds-csat-score",       name: "CSAT Score",         description: "Average satisfaction rating across closed tickets.", integration: "Zendesk",  governed: true },
  { id: "ds-headcount",        name: "Headcount",          description: "Active employee count by department.", integration: "BambooHR", governed: true },
  { id: "ds-workflow-success", name: "Workflow Success Rate", description: "Percentage of workflow runs completed without errors.", integration: "AIMS OS",  governed: true },
]
const SOURCE_COLUMNS: Record<string, string[]> = {
  contacts_hubspot:      ["Name", "Email", "Company", "Lifecycle Stage", "Owner", "Created At"],
  companies_hubspot:     ["Name", "Domain", "Industry", "Annual Revenue", "Employees", "Owner"],
  deals_hubspot:         ["Name", "Stage", "Amount", "Close Date", "Pipeline", "Owner"],
  tickets_zendesk:       ["Title", "Status", "Priority", "Assignee", "Created At", "Updated At"],
  conversations_zendesk: ["Subject", "Status", "Channel", "Agent", "CSAT Score", "Created At"],
  employees_bamboohr:    ["Name", "Department", "Title", "Manager", "Start Date", "Status"],
  workflows_aims:        ["Name", "Status", "Run Count", "Success Rate", "Last Run", "Owner"],
  ai_workers_aims:       ["Name", "Category", "Status", "Tasks Today", "Accuracy", "Created At"],
}
const FRESHNESS_OPTIONS = [
  { value: "realtime", label: "Real-time (live)" },
  { value: "15m",      label: "Every 15 minutes (fresh)" },
  { value: "1h",       label: "Every hour (fresh)" },
  { value: "24h",      label: "Every day (aging)" },
]
const WIDGET_SIZES = [{ id: "sm", label: "S" }, { id: "md", label: "M" }, { id: "lg", label: "L" }]
const STYLE_VARIANTS = [
  { id: "",         label: "Default" },
  { id: "compact",  label: "Compact" },
  { id: "outlined", label: "Outlined" },
  { id: "minimal",  label: "Minimal" },
]
const DESCRIBE_EXAMPLES = [
  "Win Rate gauge",
  "Workflow Runs over time",
  "Human-in-the-Loops by team",
  "Contacts by status as a donut",
]
const WIDGET_TYPES = [
  { id: "kpi",    label: "KPI",    icon: "TrendingUp", bestFor: "At-a-glance status and headline numbers." },
  { id: "line",   label: "Line",   icon: "LineChart",  bestFor: "Spotting trends and momentum." },
  { id: "bar",    label: "Bar",    icon: "BarChart2",  bestFor: "Comparing groups or stages." },
  { id: "table",  label: "Table",  icon: "Table",      bestFor: "Detailed row-by-row review." },
  { id: "gauge",  label: "Gauge",  icon: "Gauge",      bestFor: "Monitoring against a target." },
  { id: "list",   label: "List",   icon: "List",       bestFor: "Tracking recent items and activity." },
]
// DS-GAP: AccentColorPalette — widget accent swatches; hex values displayed to user. Needs tokenization.
const ACCENT_COLORS = [
  { id: "",       label: "Default", hex: "transparent" },
  { id: "blue",   label: "Blue",   hex: "#2B7FFF" }, // audit-ignore: widget accent colour picker swatches
  { id: "green",  label: "Green",  hex: "#22C55E" }, // audit-ignore: widget accent colour picker swatches
  { id: "amber",  label: "Amber",  hex: "#F59E0B" }, // audit-ignore: widget accent colour picker swatches
  { id: "red",    label: "Red",    hex: "#EF4444" }, // audit-ignore: widget accent colour picker swatches
  { id: "purple", label: "Purple", hex: "#A78BFA" }, // audit-ignore: widget accent colour picker swatches
]

// ── Shared micro-components ───────────────────────────────────────────────────

function Pill({ label, value, options, onSelect }: { label: string; value: string; options: string[]; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])
  const active = value !== "All" && value !== ""
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6,
          fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
          background: active ? "var(--primary)" : "var(--surface)",
          color: active ? "var(--on-primary)" : "var(--text-subtitle)",
          border: `1px solid ${active ? "var(--primary)" : "var(--field-border)"}` }}
      >
        {active ? value : label}
        <LucideIcons.ChevronDown size={12} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 199,
          boxShadow: "var(--shadow-elevation-3)", minWidth: 160 }}>
          <CardContainer size="sm" className="!p-1">
            {options.map(opt => (
              <button key={opt} onClick={() => { onSelect(opt); setOpen(false) }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px",
                  fontSize: 12, cursor: "pointer", borderRadius: 4,
                  background: value === opt ? "var(--primary-muted, var(--surface-raised))" : "transparent",
                  color: "var(--text-body)" }}>
                {opt}
              </button>
            ))}
          </CardContainer>
        </div>
      )}
    </div>
  )
}

function FilterBar({ search, onSearch, pills }: {
  search: string; onSearch: (v: string) => void
  pills: { label: string; value: string; options: string[]; onSelect: (v: string) => void }[]
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
        <LucideIcons.Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted, var(--text-subtitle))" }} />
        <Input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search…"
          style={{ paddingLeft: 32, height: 32, fontSize: 13 }} />
      </div>
      {pills.map((p, i) => <Pill key={i} {...p} />)}
    </div>
  )
}

function StatusBadge({ status }: { status: DashStatus }) {
  const map: Record<DashStatus, { label: string; variant: "success" | "informative" | "alert" }> = {
    published: { label: "Published", variant: "success" },
    draft:     { label: "Draft",     variant: "informative" },
    pending:   { label: "Pending",   variant: "alert" },
  }
  return <Tag variant={map[status].variant} size="sm">{map[status].label}</Tag>
}

function FreshnessBadge({ status }: { status: Freshness }) {
  if (status === "fresh") return null
  if (status === "live")  return <Tag variant="success" size="sm">Live</Tag>
  return <Tag variant="neutral" size="sm">Stale</Tag>
}

// DS-GAP: SourceAvatar — brand-colour circle with source initials. Closest DS: Avatar (not in repo).
const SOURCE_COLORS: Record<string, [string, string]> = { // [bg, fg]
  "salesforce": ["#00A1E0","#fff"], "hubspot":   ["#FF7A59","#fff"], "zendesk":  ["#03363D","#fff"], // audit-ignore: third-party brand colours
  "workday":    ["#F68B1F","#fff"], "bamboohr":  ["#73C41D","#fff"], "qualtrics":["#002A5C","#fff"], // audit-ignore: third-party brand colours
  "netsuite":   ["#009DDC","#fff"], "stripe":    ["#635BFF","#fff"], "intercom": ["#286EFA","#fff"], // audit-ignore: third-party brand colours
  "google":     ["#4285F4","#fff"], "snowflake": ["#29B5E8","#fff"], "greenhouse":["#24A47F","#fff"], // audit-ignore: third-party brand colours
}
const SKELETON_COLORS: Record<string, string> = {
  KPI:"#2B7FFF", Chart:"#8B5CF6", Feed:"#0EA5E9", Gauge:"#22C55E", Donut:"#F59E0B", // audit-ignore: skeleton palette has no DS token
  Board:"#EC4899", Funnel:"#F97316", "Stat Row":"#14B8A6", Alerts:"#EF4444", "Cost KPI":"#10B981", // audit-ignore: skeleton palette has no DS token
}

function WidgetGlyph({ skeleton, source }: { skeleton: Skeleton; source: string }) {
  const lsrc = source.toLowerCase()
  const SZ = 28
  const circle: React.CSSProperties = { width: SZ, height: SZ, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }

  if (lsrc.includes("aims")) {
    return (
      <div style={{ ...circle, background: "#0B1120", border: "1px solid rgba(43,127,255,.3)" }}> {/* audit-ignore: AIMS OS brand glyph */}
        <span style={{ fontSize: 9, fontWeight: 800, color: "#2B7FFF", letterSpacing: "-0.3px", lineHeight: 1 }}>A</span> {/* audit-ignore: AIMS OS brand glyph */}
      </div>
    )
  }

  const key = Object.keys(SOURCE_COLORS).find(k => lsrc.includes(k))
  if (key) {
    const [bg, fg] = SOURCE_COLORS[key]
    return (
      <div style={{ ...circle, background: bg }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: fg, lineHeight: 1 }}>{key.slice(0,2).toUpperCase()}</span>
      </div>
    )
  }

  // Skeleton-type fallback: 2-char abbrev on skeleton colour
  const abbr = skeleton.replace(/\s+/g,"").slice(0,2).toUpperCase()
  const bg = SKELETON_COLORS[skeleton] ?? "#6B7280" // audit-ignore: skeleton fallback grey
  return (
    <div style={{ ...circle, background: `${bg}33` }}>
      <span style={{ fontSize: 8, fontWeight: 700, color: bg, lineHeight: 1 }}>{abbr}</span>
    </div>
  )
}

// DS-GAP: HealthBadge — 4-state indicator. Closest DS: Tag.
function HealthBadge({ health }: { health: LibHealth }) {
  if (health === "active")   return <Tag variant="success" size="sm">Active</Tag>
  if (health === "inactive") return <Tag variant="alert" size="sm">Inactive</Tag>
  if (health === "unused")   return <Tag variant="neutral" size="sm">Not in use</Tag>
  return <Tag variant="alert" size="sm">Needs remap</Tag>
}

// DS-GAP: WidgetMiniPreview — visual mini render per skeleton. Closest DS: CardContainer (variant=sunken).
function WidgetMiniPreview({ skeleton, seed, height = 64 }: { skeleton: Skeleton; seed: number; height?: number }) {
  const wrap: React.CSSProperties = { height, borderRadius: 8, background: "var(--canvas)", border: "1px solid var(--field-border)", overflow: "hidden", pointerEvents: "none", display: "flex", alignItems: "center" }

  if (skeleton === "KPI" || skeleton === "Cost KPI") {
    const vals = [86.4, 12.8, 540, 1284, 3.2, 48.2, 920, 7.6]
    const n   = vals[seed % vals.length]
    const lbl = skeleton === "Cost KPI" ? `$${n < 10 ? n + "K" : Math.round(n) + "K"}` : n >= 100 ? String(Math.round(n)) : `${n}K`
    return <div style={{ ...wrap, justifyContent: "center" }}><span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)" }}>{lbl}</span></div>
  }

  if (skeleton === "Chart") {
    const BARS = ["#2B7FFF","#8B5CF6","#0EA5E9","#22C55E","#F59E0B"] // audit-ignore: chart demo palette
    const hs   = [65,40,80,55,35,70,50].map((h,i) => (h + seed * 11 + i * 7) % 70 + 20)
    return (
      <div style={{ ...wrap, justifyContent: "center", alignItems: "flex-end", padding: "0 14px", gap: 4 }}>
        {hs.slice(0,5).map((h,i) => <div key={i} style={{ flex:1, height:`${h}%`, borderRadius:"3px 3px 0 0", background: BARS[i % BARS.length] }} />)}
      </div>
    )
  }

  if (skeleton === "Feed") {
    return (
      <div style={{ ...wrap, flexDirection:"column", justifyContent:"center", gap:5, padding:"10px 12px" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"var(--primary)", flexShrink:0 }} />
            <div style={{ height:6, borderRadius:4, background:"var(--field-border)", flex:1, opacity: 1 - i * 0.25 }} />
          </div>
        ))}
      </div>
    )
  }

  if (skeleton === "Donut") {
    const pct = 0.55 + (seed % 4) * 0.1
    const r = 21, circ = 2 * Math.PI * r
    return (
      <div style={{ ...wrap, justifyContent:"center", padding:0 }}>
        <svg width={64} height={64} viewBox="0 0 64 64">
          <circle cx={32} cy={32} r={r} fill="none" stroke="var(--field-border)" strokeWidth={7} />
          <circle cx={32} cy={32} r={r} fill="none" stroke="#F59E0B" strokeWidth={7} // audit-ignore: donut demo colour
            strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round" transform="rotate(-90 32 32)" />
        </svg>
      </div>
    )
  }

  if (skeleton === "Gauge") {
    const pct = 0.45 + (seed % 5) * 0.1
    return (
      <div style={{ ...wrap, justifyContent:"center", padding:0 }}>
        <svg width={84} height={46} viewBox="0 0 84 46">
          <path d="M 10 42 A 32 32 0 0 1 74 42" fill="none" stroke="var(--field-border)" strokeWidth={7} strokeLinecap="round" />
          <path d="M 10 42 A 32 32 0 0 1 74 42" fill="none" stroke="#22C55E" strokeWidth={7} strokeLinecap="round" // audit-ignore: gauge demo colour
            strokeDasharray={`${100*pct} 100`} />
        </svg>
      </div>
    )
  }

  if (skeleton === "Board") {
    const rows: [string,string,number][] = [["#22C55E","Active",3],["#94A3B8","Idle",1],["#F59E0B","Paused",1]] // audit-ignore: board status colours
    return (
      <div style={{ ...wrap, flexDirection:"column", justifyContent:"center", gap:4, padding:"8px 12px" }}>
        {rows.map(([c,l,n]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:c, flexShrink:0 }} />
              <span style={{ fontSize:10, color:"var(--field-supporting)" }}>{l}</span>
            </div>
            <span style={{ fontSize:10, fontWeight:600, color:"var(--foreground)" }}>{n}</span>
          </div>
        ))}
      </div>
    )
  }

  if (skeleton === "Funnel") {
    const widths = [95,70,50,32]
    const COLS = ["#2B7FFF","#8B5CF6","#0EA5E9","#22C55E"] // audit-ignore: funnel demo palette
    return (
      <div style={{ ...wrap, flexDirection:"column", justifyContent:"center", alignItems:"center", gap:3, padding:"8px 14px" }}>
        {widths.map((w,i) => <div key={i} style={{ width:`${w}%`, height:9, borderRadius:3, background:COLS[i] }} />)}
      </div>
    )
  }

  if (skeleton === "Stat Row") {
    const vals = [["1.2K","Conv."],["87%","Rate"],["4.3","Avg"]]
    return (
      <div style={{ ...wrap, justifyContent:"space-around", padding:"0 8px" }}>
        {vals.map(([v,l]) => (
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--foreground)" }}>{v}</div>
            <div style={{ fontSize:9, color:"var(--field-supporting)", marginTop:1 }}>{l}</div>
          </div>
        ))}
      </div>
    )
  }

  if (skeleton === "Alerts") {
    const items: [string,string][] = [["#EF4444","Critical · 2"],["#F59E0B","Warning · 5"]] // audit-ignore: alert demo colours
    return (
      <div style={{ ...wrap, flexDirection:"column", justifyContent:"center", gap:6, padding:"10px 12px" }}>
        {items.map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:6, height:6, borderRadius:2, background:c, flexShrink:0 }} />
            <span style={{ fontSize:10, color:"var(--field-supporting)" }}>{l}</span>
          </div>
        ))}
      </div>
    )
  }

  const iconKey = SKELETON_ICON[skeleton] ?? "BarChart2"
  const Icon = LucideIcons[iconKey] as React.FC<{ size?: number; style?: React.CSSProperties }>
  return <div style={{ ...wrap, justifyContent:"center" }}>{Icon && <Icon size={20} style={{ color:"var(--field-supporting)" }} />}</div>
}

// DS-GAP: LibStudioWelcome — contextual library banner. Closest DS: CardContainer.
function LibStudioWelcome({ count, onCta }: { count: number; onCta: () => void }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <CardContainer variant="default">
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "color-mix(in srgb,var(--primary) 12%,transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LucideIcons.PieChart size={16} style={{ color: "var(--primary)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
              {count} widgets in your library
            </p>
            <p style={{ fontSize: 12, color: "var(--field-supporting)", margin: "2px 0 0" }}>
              Widgets connect to your data sources and live inside dashboards on entity profiles or standalone reports.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onCta}>Create widget</Button>
          <button onClick={() => setDismissed(true)} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", padding: 4, flexShrink: 0, display: "flex" }}>
            <LucideIcons.X size={14} />
          </button>
        </div>
      </CardContainer>
    </div>
  )
}

// DS-GAP: LibOverflowMenu — per-card ⋯ actions. Closest DS: Menu + MenuItem.
type LibOItem = { label: string; icon: keyof typeof LucideIcons; danger?: boolean; onClick: () => void }
function LibOverflowMenu({ items, onClose }: { items: LibOItem[]; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
      <div style={{ position: "absolute", top: "calc(100% + 2px)", right: 0, zIndex: 100, background: "var(--surface)", border: "1px solid var(--field-border)", borderRadius: 10, boxShadow: "var(--shadow-elevation-3)", minWidth: 160, padding: 4 }}>
        {items.map(({ label, icon, danger, onClick }) => {
          const Icon = LucideIcons[icon] as React.FC<{ size?: number; style?: React.CSSProperties }>
          return (
            <button key={label} onClick={e => { e.stopPropagation(); onClick(); onClose() }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, color: danger ? "var(--error)" : "var(--foreground)", textAlign: "left" }}>
              <Icon size={13} />{label}
            </button>
          )
        })}
      </div>
    </>
  )
}

// DS-GAP: LibFilterToolbar — search + Category + Profile + All Filters slideout + sort. Closest DS: Filters.
type LibFTProps = {
  search: string; onSearch: (v: string) => void
  cat: string; onCat: (v: string) => void
  profile: string; onProfile: (v: string) => void
  skeleton: string; onSkeleton: (v: string) => void
  freshness: string; onFreshness: (v: string) => void
  sortBy: string; onSortBy: (v: string) => void
  sortDir: "asc" | "desc"; onToggleDir: () => void
}
function LibFilterToolbar({ search, onSearch, cat, onCat, profile, onProfile, skeleton, onSkeleton, freshness, onFreshness, sortBy, onSortBy, sortDir, onToggleDir }: LibFTProps) {
  const [ddOpen, setDd]         = useState<"cat" | "profile" | "sort" | null>(null)
  const [filtersOpen, setFOpen] = useState(false)

  const activeCount = [cat !== "All", skeleton !== "All", freshness !== "All"].filter(Boolean).length

  function LDrop({ id, label, active, children }: { id: "cat" | "profile" | "sort"; label: string; active: boolean; children: React.ReactNode }) {
    return (
      <div style={{ position: "relative" }}>
        <button onClick={() => setDd(ddOpen === id ? null : id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: `1px solid ${active ? "var(--primary)" : "var(--field-border)"}`, background: active ? "color-mix(in srgb,var(--primary) 12%,transparent)" : "var(--surface)", color: active ? "var(--primary)" : "var(--foreground)", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
          {label}<LucideIcons.ChevronDown size={11} />
        </button>
        {ddOpen === id && (
          <>
            <div onClick={() => setDd(null)} style={{ position: "fixed", inset: 0, zIndex: 198 }} />
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 199, boxShadow: "var(--shadow-elevation-3)", minWidth: 168 }}>
              <CardContainer size="sm" className="!p-1">
                {children}
              </CardContainer>
            </div>
          </>
        )}
      </div>
    )
  }

  function LOpt({ val, cur, onSet, display }: { val: string; cur: string; onSet: (v: string) => void; display?: string }) {
    const active = cur === val
    return (
      <button onClick={() => { onSet(val); setDd(null) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, color: active ? "var(--primary)" : "var(--foreground)", fontWeight: active ? 600 : 400, textAlign: "left" }}>
        {active ? <LucideIcons.Check size={12} style={{ flexShrink: 0 }} /> : <span style={{ width: 12, flexShrink: 0 }} />}
        {display ?? val}
      </button>
    )
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160, maxWidth: 280 }}>
          <LucideIcons.Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--field-supporting)", pointerEvents: "none" }} />
          <Input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search widgets…" style={{ paddingLeft: 30, fontSize: 12 }} />
        </div>

        {/* Category */}
        <LDrop id="cat" label={cat === "All" ? "Category" : cat} active={cat !== "All"}>
          <LOpt val="All" cur={cat} onSet={onCat} display="All categories" />
          {LIB_CATEGORIES.map(c => <LOpt key={c} val={c} cur={cat} onSet={onCat} />)}
        </LDrop>

        {/* Profile */}
        <LDrop id="profile" label={profile === "All" ? "Profile" : profile} active={profile !== "All"}>
          <LOpt val="All" cur={profile} onSet={onProfile} display="All profiles" />
          {LIB_PROFILES.filter(p => p !== "All").map(p => <LOpt key={p} val={p} cur={profile} onSet={onProfile} />)}
        </LDrop>

        {/* All filters button */}
        <button onClick={() => setFOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, border: `1px solid ${activeCount > 0 ? "var(--primary)" : "var(--field-border)"}`, background: activeCount > 0 ? "color-mix(in srgb,var(--primary) 12%,transparent)" : "var(--surface)", color: activeCount > 0 ? "var(--primary)" : "var(--foreground)", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
          <LucideIcons.SlidersHorizontal size={13} />
          All filters
          {activeCount > 0 && (
            <span style={{ minWidth: 16, height: 16, borderRadius: 99, background: "var(--primary)", color: "var(--on-primary)", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{activeCount}</span>
          )}
        </button>

        {/* Sort + direction */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
          <button onClick={onToggleDir} style={{ background: "none", border: "1px solid var(--field-border)", borderRadius: 8, padding: "5px 7px", cursor: "pointer", color: "var(--field-supporting)", display: "flex" }}>
            {sortDir === "desc" ? <LucideIcons.ArrowDown size={13} /> : <LucideIcons.ArrowUp size={13} />}
          </button>
          <LDrop id="sort" label={sortBy === "usage" ? "Most used" : "Name"} active={false}>
            <LOpt val="name"  cur={sortBy} onSet={onSortBy} display="Name"      />
            <LOpt val="usage" cur={sortBy} onSet={onSortBy} display="Most used" />
          </LDrop>
        </div>
      </div>

      {/* All filters SlideOut */}
      <SlideOut title="All filters" open={filtersOpen} onClose={() => setFOpen(false)}
        ctaPrimaryLabel="Apply"
        ctaSecondaryLabel="Clear all"
        onCtaPrimary={() => setFOpen(false)}
        onCtaSecondary={() => { onCat("All"); onProfile("All"); onSkeleton("All"); onFreshness("All"); setFOpen(false) }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Type */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Widget type</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <LOpt val="All" cur={skeleton} onSet={onSkeleton} display="All types" />
              {LIB_SKELETONS.map(s => <LOpt key={s} val={s} cur={skeleton} onSet={onSkeleton} />)}
            </div>
          </div>
          {/* Freshness */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Freshness</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <LOpt val="All" cur={freshness} onSet={onFreshness} display="All" />
              {LIB_FRESHNESS.map(f => <LOpt key={f} val={f} cur={freshness} onSet={onFreshness} display={f.charAt(0).toUpperCase() + f.slice(1)} />)}
            </div>
          </div>
        </div>
      </SlideOut>
    </>
  )
}

// ── Dashboard List view ───────────────────────────────────────────────────────

function DashboardsView() {
  const [search, setSearch]         = useState("")
  const [statusFilter, setStatus]   = useState("All")
  const [entityFilter, setEntity]   = useState("All")
  const [page, setPage]             = useState(1)
  const [detail, setDetail]         = useState<typeof DASHBOARDS[0] | null>(null)
  const [deleteTarget, setDelete]   = useState<typeof DASHBOARDS[0] | null>(null)
  const [bannerDismissed, dismiss]  = useState(false)
  const PAGE_SIZE = 6

  const filtered = DASHBOARDS.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== "All" && d.status !== statusFilter.toLowerCase()) return false
    if (entityFilter !== "All" && d.entity !== entityFilter) return false
    return true
  })
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      {!bannerDismissed && (
        <CardContainer className="flex items-start gap-3 mb-4">
          <LucideIcons.LayoutDashboard size={18} style={{ color: "var(--primary)", marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)", marginBottom: 2 }}>Dashboard Studio</div>
            <div style={{ fontSize: 13, color: "var(--text-subtitle)" }}>
              Build and manage contextual dashboards that appear inside CRM profiles, reports, and the home screen.
              Widgets pull from governed datasets — no custom SQL needed.
            </div>
          </div>
          <button onClick={() => dismiss(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted, var(--text-subtitle))", padding: 2 }}>
            <LucideIcons.X size={14} />
          </button>
        </CardContainer>
      )}

      <FilterBar
        search={search} onSearch={v => { setSearch(v); setPage(1) }}
        pills={[
          { label: "Status", value: statusFilter, options: ["All", "Published", "Draft", "Pending"], onSelect: v => { setStatus(v); setPage(1) } },
          { label: "Entity", value: entityFilter, options: ["All", "Company", "Contact", "Employee", "Deal", "Standalone"], onSelect: v => { setEntity(v); setPage(1) } },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginBottom: 16 }}>
        {paged.map(d => (
          <CardContainer key={d.id} size="sm" className="flex flex-col gap-2 cursor-pointer" onClick={() => setDetail(d)}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)", lineHeight: 1.3 }}>{d.name}</div>
              <StatusBadge status={d.status} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-subtitle)" }}>{d.placement}</div>
            <div style={{ fontSize: 12, color: "var(--text-subtitle)" }}>{d.widgetCount} widgets · {d.audience} · {d.updated}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted, var(--text-subtitle))", marginTop: 2 }}>{d.description}</div>
          </CardContainer>
        ))}
      </div>

      {filtered.length > PAGE_SIZE && (
        <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />
      )}

      {detail && (
        <SlideOut open title={detail.name} onClose={() => setDetail(null)}
          ctaPrimaryLabel="Open dashboard"
          ctaSecondaryLabel="Delete"
          onCtaPrimary={() => setDetail(null)}
          onCtaSecondary={() => { setDelete(detail); setDetail(null) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
            <StatusBadge status={detail.status} />
            <div style={{ fontSize: 13, color: "var(--text-body)" }}>{detail.description}</div>
            {[["Entity", detail.entity], ["Placement", detail.placement], ["Audience", detail.audience], ["Owner", detail.owner], ["Widgets", `${detail.widgetCount} widgets`], ["Updated", detail.updated]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--field-border)", paddingBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-subtitle)" }}>{k}</span>
                <span style={{ fontSize: 12, color: "var(--text-body)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </SlideOut>
      )}

      {deleteTarget && (
        <ModalDialog isOpen onClose={() => setDelete(null)}
          variant="confirmation" tone="error"
          title="Delete dashboard?"
          description={`"${deleteTarget.name}" will be permanently removed. Widgets inside will not be deleted.`}
          ctaPrimary={{ label: "Delete", destructive: true, onClick: () => setDelete(null) }}
          ctaSecondary={{ label: "Cancel", onClick: () => setDelete(null) }}
        />
      )}
    </>
  )
}

// ── Widget Library view ───────────────────────────────────────────────────────

function WidgetLibraryView({ onCreateWidget }: { onCreateWidget: () => void }) {
  const [search,    setSearch]    = useState("")
  const [cat,       setCat]       = useState("All")
  const [profile,   setProfile]   = useState<LibProfile>("All")
  const [skeleton,  setSkeleton]  = useState("All")
  const [freshness, setFreshness] = useState("All")
  const [sortBy,    setSortBy]    = useState("name")
  const [sortDir,   setSortDir]   = useState<"asc" | "desc">("asc")
  const [shown,     setShown]     = useState(LIB_PAGE_SIZE)
  const [menuId,           setMenuId]           = useState<string | null>(null)
  const [detailW,          setDetailW]          = useState<LibWidget | null>(null)
  const [deleteW,          setDeleteW]          = useState<LibWidget | null>(null)
  const [deleteStage,      setDeleteStage]      = useState<1 | 2 | 3>(1)
  const [deleteConfirm,    setDeleteConfirm]    = useState("")
  const [widgets,          setWidgets]          = useState<LibWidget[]>(LIB_WIDGETS)

  const governedCount = widgets.filter(w => w.governed).length

  const filtered = widgets.filter(w => {
    if (cat      !== "All" && w.category  !== cat)      return false
    if (profile  !== "All" && w.placement !== profile)  return false
    if (skeleton !== "All" && w.skeleton  !== skeleton) return false
    if (freshness !== "All" && w.freshness !== freshness) return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const d = sortBy === "usage" ? a.usedIn - b.usedIn : a.name.localeCompare(b.name)
    return sortDir === "asc" ? d : -d
  })

  const page    = sorted.slice(0, shown)
  const hasMore = shown < sorted.length

  function handleDelete(id: string) {
    setWidgets(prev => prev.filter(w => w.id !== id))
    setDeleteW(null)
  }

  return (
    <>
      <LibStudioWelcome count={widgets.length} onCta={onCreateWidget} />

      <LibFilterToolbar
        search={search}     onSearch={v => { setSearch(v); setShown(LIB_PAGE_SIZE) }}
        cat={cat}           onCat={v => { setCat(v); setShown(LIB_PAGE_SIZE) }}
        profile={profile}   onProfile={v => { setProfile(v as LibProfile); setShown(LIB_PAGE_SIZE) }}
        skeleton={skeleton} onSkeleton={v => { setSkeleton(v); setShown(LIB_PAGE_SIZE) }}
        freshness={freshness} onFreshness={v => { setFreshness(v); setShown(LIB_PAGE_SIZE) }}
        sortBy={sortBy}     onSortBy={setSortBy}
        sortDir={sortDir}   onToggleDir={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
      />

      {sorted.length === 0 ? (
        <EmptyState icon={LucideIcons.Search} title="No widgets found" description="Try a different search or filter." />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px,100%), 1fr))", gap: 12 }}>
            {page.map(w => {
              const seed = parseInt(w.id.replace(/\D/g,"")) || 0
              return (
              <div key={w.id} style={{ position: "relative" }}>
                <CardContainer
                  onClick={e => { if (!(e.target as HTMLElement).closest("button")) setDetailW(w) }}
                  className="flex flex-col gap-[8px] cursor-pointer h-full"
                >
                  {/* Header row: glyph + name/source + health + ⋯ */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <WidgetGlyph skeleton={w.skeleton} source={w.source} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</p>
                      <p style={{ fontSize: 10, color: "var(--field-supporting)", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.source}</p>
                    </div>
                    <HealthBadge health={w.health} />
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <button
                        onClick={e => { e.stopPropagation(); setMenuId(menuId === w.id ? null : w.id) }}
                        aria-label={`Actions for ${w.name}`}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", padding: "1px 2px", borderRadius: 6, display: "flex" }}
                      >
                        <LucideIcons.MoreHorizontal size={14} />
                      </button>
                      {menuId === w.id && (
                        <LibOverflowMenu onClose={() => setMenuId(null)} items={[
                          { label: "Open",             icon: "Eye",       onClick: () => setDetailW(w) },
                          { label: "Add to dashboard", icon: "Plus",      onClick: () => {} },
                          ...(!w.system ? [{ label: "Edit",  icon: "Pencil" as keyof typeof LucideIcons, onClick: () => {} }] : []),
                          ...(!w.system ? [{ label: "Delete", icon: "Trash2" as keyof typeof LucideIcons, danger: true, onClick: () => setDeleteW(w) }] : []),
                        ]} />
                      )}
                    </div>
                  </div>

                  {/* Tags: skeleton type + Truth (governed) */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    <Tag variant="neutral" size="sm">{w.skeleton}</Tag>
                    {w.governed && <Tag variant="informative" size="sm">Truth</Tag>}
                    {w.system   && <Tag variant="neutral"      size="sm">System</Tag>}
                  </div>

                  {/* Mini preview — real visual */}
                  <WidgetMiniPreview skeleton={w.skeleton} seed={seed} />

                  {/* Footer */}
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--field-border)", paddingTop: 8 }}>
                    <span style={{ fontSize: 11, color: w.health === "review" ? "var(--alert)" : "var(--field-supporting)", fontWeight: w.health === "review" ? 600 : 400 }}>
                      {w.health === "review" ? "Remap needed →" : `Used on ${w.usedIn} dashboard${w.usedIn === 1 ? "" : "s"}`}
                    </span>
                    <FreshnessBadge status={w.freshness} />
                  </div>
                </CardContainer>
              </div>
            )})}

          </div>

          {hasMore && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
              <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>Showing {page.length} of {sorted.length}</span>
              <Button variant="secondary" size="sm" onClick={() => setShown(n => n + LIB_PAGE_SIZE)}>
                Load {Math.min(sorted.length - shown, LIB_PAGE_SIZE)} more
              </Button>
            </div>
          )}
        </>
      )}

      {/* Widget Detail SlideOut */}
      {detailW && (
        <SlideOut
          title={detailW.name}
          subtitle={detailW.source}
          showIcon={false}
          showStatus={false}
          showTopButton={false}
          showTabs={false}
          showSearchBar={false}
          showChips={false}
          open={true}
          onClose={() => setDetailW(null)}
          ctaPrimaryLabel={detailW.health === "review" ? "Remap widget" : "Add to dashboard"}
          ctaSecondaryLabel={!detailW.system ? "Edit widget" : "Close"}
          onCtaPrimary={() => setDetailW(null)}
          onCtaSecondary={() => setDetailW(null)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px 0" }}>
            {/* Identity row: glyph + health */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WidgetGlyph skeleton={detailW.skeleton} source={detailW.source} />
              <HealthBadge health={detailW.health} />
            </div>

            {/* Type chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Tag variant="neutral" size="sm">{detailW.skeleton}</Tag>
              {detailW.governed  && <Tag variant="informative" size="sm">Truth</Tag>}
              {!detailW.governed && <Tag variant="alert"       size="sm">Ungoverned</Tag>}
              <FreshnessBadge status={detailW.freshness} />
              {detailW.system    && <Tag variant="neutral"     size="sm">System</Tag>}
            </div>

            {/* Medium preview */}
            <WidgetMiniPreview
              skeleton={detailW.skeleton}
              seed={parseInt(detailW.id.replace(/\D/g, "")) || 0}
              height={120}
            />

            {/* About */}
            {detailW.description && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>About</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--foreground)", margin: 0 }}>{detailW.description}</p>
              </div>
            )}

            {/* Metadata fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([["Category", detailW.category], ["Placement", detailW.placement]] as [string, string][]).map(([l, v]) => (
                <div key={l} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ width: 88, flexShrink: 0, color: "var(--field-supporting)", fontWeight: 500 }}>{l}</span>
                  <span style={{ color: "var(--foreground)" }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Used on */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                Used on {detailW.usedIn} dashboard{detailW.usedIn !== 1 ? "s" : ""}
              </p>
              {detailW.usedIn === 0 && (
                <p style={{ fontSize: 12, color: "var(--field-supporting)", fontStyle: "italic", margin: 0 }}>Not placed on any dashboard yet</p>
              )}
            </div>

            {/* Delete danger zone */}
            {!detailW.system && (
              <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--field-border)" }}>
                <Button variant="warning" size="sm" onClick={() => {
                  setDetailW(null)
                  setDeleteW(detailW)
                  setDeleteStage(1)
                  setDeleteConfirm("")
                }}>
                  Delete widget
                </Button>
              </div>
            )}
          </div>
        </SlideOut>
      )}

      {/* 3-stage delete dialog */}
      {deleteW && deleteStage === 1 && (
        <ModalDialog
          isOpen={true}
          onClose={() => setDeleteW(null)}
          tone="error"
          title={`Delete "${deleteW.name}"?`}
          description="You're about to permanently remove this widget from the library. Let's make sure you know the impact before continuing."
          ctaPrimary={{ label: "Yes, I want to delete it", destructive: true, onClick: () => setDeleteStage(2) }}
          ctaSecondary={{ label: "Cancel", onClick: () => setDeleteW(null) }}
        />
      )}
      {deleteW && deleteStage === 2 && (
        <ModalDialog
          isOpen={true}
          onClose={() => setDeleteW(null)}
          variant="content"
          tone="warning"
          title="Review the impact"
          description={
            deleteW.usedIn > 0
              ? `This widget is currently placed on ${deleteW.usedIn} dashboard${deleteW.usedIn !== 1 ? "s" : ""}. Deleting it will remove it from all of them — anyone relying on it will lose visibility.`
              : "This widget is not placed on any dashboard yet, so no dashboards will be affected."
          }
          informativeCard={deleteW.usedIn > 0 ? "Affected dashboards will lose this widget immediately upon deletion." : undefined}
          ctaPrimary={{ label: "I understand, continue", onClick: () => { setDeleteStage(3); setDeleteConfirm("") } }}
          ctaSecondary={{ label: "Go back", onClick: () => setDeleteStage(1) }}
        />
      )}
      {deleteW && deleteStage === 3 && (
        <ModalDialog
          isOpen={true}
          onClose={() => setDeleteW(null)}
          variant="content"
          tone="error"
          showIcon={false}
          title="Confirm deletion"
          description={`Type the widget name to confirm: "${deleteW.name}"`}
          slot={
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                autoFocus
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder={deleteW.name}
                style={{
                  width: "100%", padding: "8px 12px", fontSize: 13, borderRadius: 8,
                  border: "1px solid var(--field-border)", background: "var(--canvas)",
                  color: "var(--foreground)", outline: "none", boxSizing: "border-box",
                }}
              />
              {deleteConfirm.length > 0 && deleteConfirm !== deleteW.name && (
                <p style={{ fontSize: 12, color: "var(--error)", margin: 0 }}>Name doesn't match — check spelling</p>
              )}
            </div>
          }
          ctaPrimary={{ label: "Delete widget", destructive: true, onClick: () => {
            if (deleteConfirm === deleteW.name) handleDelete(deleteW.id)
          }}}
          ctaSecondary={{ label: "Cancel", onClick: () => setDeleteW(null) }}
        />
      )}

      {/* Track governed count in header description (passed via parent) */}
      <span data-governed={governedCount} style={{ display: "none" }} />
    </>
  )
}

// ── Widget Marketplace view ───────────────────────────────────────────────────

function MarketplaceView({ onUseWidget }: { onUseWidget: () => void }) {
  const [activeCat, setCat]   = useState<BizCat>("all")
  const [search, setSearch]   = useState("")
  const [detail, setDetail]   = useState<typeof MKT_WIDGETS[0] | null>(null)

  const filtered = MKT_WIDGETS.filter(w => {
    if (activeCat !== "all" && w.cat !== activeCat) return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ display: "flex", gap: 16, minHeight: 0 }}>
      {/* Category rail */}
      <div style={{ width: 180, flexShrink: 0 }}>
        <CardContainer size="sm" className="!p-1">
          {CATEGORIES.map(cat => {
            const active = activeCat === cat.id
            const color = cat.id !== "all" ? CAT_COLOR[cat.id] : undefined
            return (
              <button key={cat.id} onClick={() => setCat(cat.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                  padding: "7px 10px", borderRadius: 6, cursor: "pointer",
                  background: active ? "var(--primary-muted, var(--surface-raised))" : "transparent",
                  border: "none", fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? "var(--primary)" : "var(--text-body)" }}>
                {color && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />}
                {cat.label}
              </button>
            )
          })}
        </CardContainer>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ position: "relative", maxWidth: 280 }}>
            <LucideIcons.Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtitle)" }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search marketplace…"
              style={{ paddingLeft: 32, height: 32, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {filtered.map(w => {
            const color = CAT_COLOR[w.cat]
            return (
              <CardContainer key={w.id} size="sm" className="flex flex-col gap-2 cursor-pointer" onClick={() => setDetail(w)}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-title)" }}>{w.name}</div>
                  {color && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 4 }} />}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-subtitle)" }}>{w.source} · {w.complexity}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted, var(--text-subtitle))" }}>{w.description}</div>
                <div style={{ fontSize: 11, color: "var(--text-subtitle)", marginTop: 2 }}>{w.tenantUsage} tenants using this</div>
              </CardContainer>
            )
          })}
        </div>
      </div>

      {detail && (
        <SlideOut open title={detail.name} onClose={() => setDetail(null)}
          ctaPrimaryLabel="Use this widget"
          ctaSecondaryLabel="Close"
          onCtaPrimary={() => { setDetail(null); onUseWidget() }}
          onCtaSecondary={() => setDetail(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
            <div style={{ fontSize: 13, color: "var(--text-body)" }}>{detail.description}</div>
            {[["Source", detail.source], ["Complexity", detail.complexity], ["Tenants using", `${detail.tenantUsage}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--field-border)", paddingBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-subtitle)" }}>{k}</span>
                <span style={{ fontSize: 12, color: "var(--text-body)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </SlideOut>
      )}
    </div>
  )
}

// ── New Dashboard overlay ─────────────────────────────────────────────────────

function NewDashboardOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep]           = useState(0)
  const [surface, setSurface]     = useState<Surface>("profile")
  const [profileType, setPT]      = useState<ProfileTypeId>("Company")
  const [selectedTab, setTab]     = useState("Overview")
  const [audience, setAudience]   = useState<AudType>("global")
  const [startMode, setStart]     = useState<"blank" | "template">("blank")
  const [name, setName]           = useState("")

  const pt = PROFILE_TYPES.find(p => p.id === profileType)!

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "100%" }}>
      {/* Overlay header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 0 16px 0", borderBottom: "1px solid var(--field-border)", marginBottom: 20 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtitle)", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <LucideIcons.ArrowLeft size={14} /> Dashboards
        </button>
        <span style={{ fontSize: 13, color: "var(--field-border)" }}>/</span>
        <span style={{ fontSize: 13, color: "var(--text-body)", fontWeight: 500 }}>New dashboard</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {WIZARD_STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                background: i === step ? "var(--primary)" : i < step ? "var(--success)" : "var(--field-border)",
                color: i <= step ? "var(--on-primary)" : "var(--text-subtitle)" }}>
                {i < step ? <LucideIcons.Check size={10} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, color: i === step ? "var(--text-body)" : "var(--text-subtitle)" }}>{s}</span>
              {i < WIZARD_STEPS.length - 1 && <LucideIcons.ChevronRight size={12} style={{ color: "var(--field-border)" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Placement */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CardContainer className="flex flex-col gap-4">
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)" }}>Where will this dashboard appear?</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["profile", "report", "home"] as Surface[]).map(s => (
                <button key={s} onClick={() => setSurface(s)}
                  style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `2px solid ${surface === s ? "var(--primary)" : "var(--field-border)"}`,
                    background: surface === s ? "var(--primary-muted, var(--surface))" : "var(--surface)", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, color: surface === s ? "var(--primary)" : "var(--text-body)" }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </CardContainer>
          {surface === "profile" && (
            <CardContainer className="flex flex-col gap-4">
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)" }}>Which entity type?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PROFILE_TYPES.map(p => (
                  <button key={p.id} onClick={() => { setPT(p.id); setTab(p.tabs[0]) }}
                    style={{ padding: "6px 14px", borderRadius: 6, border: `2px solid ${profileType === p.id ? "var(--primary)" : "var(--field-border)"}`,
                      background: profileType === p.id ? "var(--primary-muted, var(--surface))" : "var(--surface)", cursor: "pointer",
                      fontSize: 13, fontWeight: 500, color: profileType === p.id ? "var(--primary)" : "var(--text-body)" }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-title)", marginTop: 4 }}>Which tab?</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {pt.tabs.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${selectedTab === t ? "var(--primary)" : "var(--field-border)"}`,
                      background: selectedTab === t ? "var(--primary)" : "transparent", cursor: "pointer",
                      fontSize: 12, fontWeight: 500, color: selectedTab === t ? "var(--on-primary)" : "var(--text-body)" }}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-title)", marginTop: 4 }}>Audience</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AUDIENCE_TYPES.map(a => (
                  <button key={a.id} onClick={() => setAudience(a.id)}
                    style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${audience === a.id ? "var(--primary)" : "var(--field-border)"}`,
                      background: audience === a.id ? "var(--primary)" : "transparent", cursor: "pointer",
                      fontSize: 12, fontWeight: 500, color: audience === a.id ? "var(--on-primary)" : "var(--text-body)" }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </CardContainer>
          )}
        </div>
      )}

      {/* Step 1: Start point */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CardContainer className="flex flex-col gap-4">
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)" }}>Dashboard name</div>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Company Overview" style={{ fontSize: 13 }} />
          </CardContainer>
          <CardContainer className="flex flex-col gap-4">
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)" }}>How do you want to start?</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["blank", "template"] as const).map(m => (
                <button key={m} onClick={() => setStart(m)}
                  style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `2px solid ${startMode === m ? "var(--primary)" : "var(--field-border)"}`,
                    background: startMode === m ? "var(--primary-muted, var(--surface))" : "var(--surface)", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, color: startMode === m ? "var(--primary)" : "var(--text-body)" }}>
                  {m === "blank" ? "Blank canvas" : "Start from template"}
                </button>
              ))}
            </div>
          </CardContainer>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="secondary" size="sm" onClick={step === 0 ? onClose : () => setStep(0)}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <Button variant="primary" size="sm" onClick={step === 0 ? () => setStep(1) : onClose}>
          {step === 0 ? "Continue" : "Create dashboard"}
        </Button>
      </div>
    </div>
  )
}

// ── Widget Builder overlay ────────────────────────────────────────────────────

// ── Widget Playground sub-components ─────────────────────────────────────────

function WBSectionChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      height: 30, padding: "0 12px", borderRadius: 15, border: `1px solid ${active ? "var(--primary)" : "var(--field-border)"}`,
      background: active ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
      color: active ? "var(--primary)" : "var(--text-subtitle)",
      fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const, display: "inline-flex", alignItems: "center",
    }}>{children}</button>
  )
}

function WBSectionLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--primary)", color: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{n}</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{children}</span>
    </div>
  )
}

function WBBuilderTabNav({ tab, setTab, dataComplete, widgetComplete }: { tab: TabId; setTab: (t: TabId) => void; dataComplete: boolean; widgetComplete: boolean }) {
  const CheckIcon = LucideIcons.Check as React.FC<{ size?: number }>
  const tabs: { id: TabId; label: string; n: number; done: boolean; enabled: boolean }[] = [
    { id: "data",       label: "Data",       n: 1, done: dataComplete,   enabled: true },
    { id: "widget",     label: "Widget",     n: 2, done: widgetComplete, enabled: dataComplete },
    { id: "appearance", label: "Appearance", n: 3, done: false,          enabled: widgetComplete },
  ]
  return (
    <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "var(--field-border)", opacity: 0.9 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => t.enabled && setTab(t.id)} disabled={!t.enabled} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 4px",
          borderRadius: 8, border: "none", cursor: t.enabled ? "pointer" : "not-allowed",
          background: tab === t.id ? "var(--surface)" : "transparent",
          opacity: t.enabled ? 1 : 0.35, transition: "all 0.15s",
        }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
            background: t.done ? "var(--success)" : tab === t.id ? "var(--primary)" : "var(--field-supporting)", color: "var(--canvas)" }}>
            {t.done ? <CheckIcon size={10} /> : t.n}
          </div>
          <span style={{ fontSize: 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? "var(--foreground)" : "var(--field-supporting)" }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

function WBEntitySourceCard({ source, selected, onSelect }: { source: typeof ENTITY_SOURCES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{ cursor: "pointer" }}>
      <CardContainer selected={selected} className="h-full">
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{source.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Tag variant="informative">{source.integration}</Tag>
            {!source.governed && <Tag variant="alert">Ungoverned</Tag>}
            {source.hasPII && <Tag variant="alert">PII</Tag>}
          </div>
        </div>
      </CardContainer>
    </div>
  )
}

function WBDatasetCard({ dataset, selected, onSelect }: { dataset: typeof PRESET_DATASETS[0]; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{ cursor: "pointer" }}>
      <CardContainer selected={selected} className="h-full">
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{dataset.name}</div>
          <p style={{ fontSize: 11, color: "var(--field-supporting)", margin: 0, lineHeight: 1.4 }}>{dataset.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Tag variant="informative">{dataset.integration}</Tag>
            <Tag variant="success">Governed</Tag>
          </div>
        </div>
      </CardContainer>
    </div>
  )
}

function WBTypeTile({ type, selected, onSelect }: { type: typeof WIDGET_TYPES[0]; selected: boolean; onSelect: () => void }) {
  const Icon = (LucideIcons as Record<string, unknown>)[type.icon] as React.FC<{ size?: number; style?: React.CSSProperties }>
  return (
    <div onClick={onSelect} style={{ cursor: "pointer" }}>
      <CardContainer selected={selected} className="h-full">
        <div style={{ padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" as const }}>
          <Icon size={18} style={{ color: selected ? "var(--primary)" : "var(--field-supporting)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: selected ? "var(--primary)" : "var(--foreground)" }}>{type.label}</span>
        </div>
      </CardContainer>
    </div>
  )
}

function WBSkeletonShape({ typeId, color }: { typeId: string | null; color: string }) {
  const c = color || "var(--primary)"
  const bars = [55, 75, 45, 80, 60, 70, 50, 65]
  if (!typeId) return <div style={{ height: 120, background: "var(--field-border)", borderRadius: 8, opacity: 0.4 }} />
  if (typeId === "kpi") return (
    <div style={{ height: 120, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, padding: "0 20px" }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: c, opacity: 0.7 }}>—</div>
      <div style={{ height: 8, width: "40%", background: c, borderRadius: 4, opacity: 0.25 }} />
      <div style={{ height: 24, width: "100%", background: c, borderRadius: 4, opacity: 0.08 }} />
    </div>
  )
  if (typeId === "bar" || typeId === "line") return (
    <div style={{ height: 120, display: "flex", alignItems: "flex-end", gap: 5, padding: "16px 16px 8px" }}>
      {bars.map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? c : "var(--field-supporting)", borderRadius: "2px 2px 0 0", opacity: i === 6 ? 0.75 : 0.18 }} />)}
    </div>
  )
  if (typeId === "gauge") return (
    <div style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6, paddingBottom: 24 }}>
      <div style={{ width: 100, height: 50, borderRadius: "100px 100px 0 0", background: `conic-gradient(from 180deg, ${c} 0deg 110deg, var(--field-border) 110deg 180deg)`, opacity: 0.7 }} />
    </div>
  )
  return (
    <div style={{ height: 120, display: "flex", flexDirection: "column", gap: 7, padding: "12px 16px" }}>
      {[100, 80, 65, 90, 55].map((w, i) => <div key={i} style={{ height: 10, width: `${w}%`, background: i === 0 ? c : "var(--field-border)", borderRadius: 3, opacity: i === 0 ? 0.5 : 0.25 }} />)}
    </div>
  )
}

function WBPreviewPanel({ typeId, name, sourceId, freshness, accentColor, previewSize, setPreviewSize, saveHint }: {
  typeId: string | null; name: string; sourceId: string | null; freshness: string; accentColor: string;
  previewSize: string; setPreviewSize: (s: string) => void; saveHint: string
}) {
  const entitySrc  = ENTITY_SOURCES.find(s => s.id === sourceId)
  const datasetSrc = PRESET_DATASETS.find(d => d.id === sourceId)
  const srcLabel   = entitySrc?.label ?? datasetSrc?.name ?? null
  const typeInfo   = WIDGET_TYPES.find(t => t.id === typeId)
  const maxW       = previewSize === "sm" ? 240 : previewSize === "md" ? 420 : undefined
  const freshnessLabel = freshness === "realtime" ? "Live" : freshness === "15m" ? "15m" : freshness === "1h" ? "1h" : "24h"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "var(--field-supporting)" }}>Live preview</span>
        <div style={{ display: "flex", border: "1px solid var(--field-border)", borderRadius: 6, overflow: "hidden" }}>
          {WIDGET_SIZES.map(s => (
            <button key={s.id} onClick={() => setPreviewSize(s.id)} style={{
              padding: "4px 10px", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
              background: previewSize === s.id ? "var(--primary)" : "transparent",
              color: previewSize === s.id ? "var(--canvas)" : "var(--field-supporting)",
            }}>{s.label}</button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: maxW, transition: "max-width 0.2s" }}>
        <CardContainer>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--field-border)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{name || "Untitled widget"}</span>
              <Tag variant={freshness === "realtime" ? "success" : "informative"}>{freshnessLabel}</Tag>
            </div>
            <WBSkeletonShape typeId={typeId} color={accentColor} />
            <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid var(--field-border)" }}>
              {srcLabel && <Tag variant="informative">{srcLabel}</Tag>}
              {typeInfo  && <Tag variant="neutral">{typeInfo.label}</Tag>}
            </div>
          </div>
        </CardContainer>
      </div>
      {typeInfo && (
        <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--field-border)", background: "color-mix(in srgb, var(--primary) 5%, transparent)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Best for</div>
          <p style={{ fontSize: 12, color: "var(--field-supporting)", margin: 0 }}>{typeInfo.bestFor}</p>
        </div>
      )}
      {!typeInfo && !srcLabel && (
        <p style={{ fontSize: 12, color: "var(--field-supporting)", textAlign: "center" as const, margin: 0 }}>
          Pick a source, metric, and widget type to preview it live.
        </p>
      )}
      {saveHint && <p style={{ fontSize: 11, color: "var(--field-supporting)", textAlign: "center" as const, margin: 0 }}>{saveHint}</p>}
    </div>
  )
}

// ── Widget Playground overlay ─────────────────────────────────────────────────

function WidgetBuilderOverlay({ onClose }: { onClose: () => void }) {
  const [tab, setTab]               = useState<TabId>("data")
  const [dataMode, setDataMode]     = useState<"source" | "preset">("source")
  const [opType, setOpType]         = useState<OpType>("aggregate")
  const [sourceId, setSourceId]     = useState<string | null>(null)
  const [metric, setMetric]         = useState("")
  const [freshness, setFreshness]   = useState("1h")
  const [typeId, setTypeId]         = useState<string | null>(null)
  const [widgetName, setWName]      = useState("")
  const [accentColor, setAccent]    = useState("")
  const [styleVariant, setStyle]    = useState("")
  const [previewSize, setPrvSize]   = useState("md")
  const [describePrompt, setDescPr] = useState("")
  const [saved, setSaved]           = useState(false)

  const accentHex  = ACCENT_COLORS.find(a => a.id === accentColor)?.hex ?? "var(--primary)"
  const dataComplete   = !!(sourceId && metric)
  const widgetComplete = !!(typeId && widgetName)

  const srcLabel = dataMode === "source"
    ? ENTITY_SOURCES.find(s => s.id === sourceId)?.label
    : PRESET_DATASETS.find(d => d.id === sourceId)?.name

  const saveHint = !dataComplete   ? "Complete the Data tab to see a live preview."
    : !widgetComplete ? "Pick a type and name to finalize the preview."
    : ""

  function handleSave() {
    if (!widgetName) return
    setSaved(true)
  }

  if (saved) {
    const CheckCircle = LucideIcons.CheckCircle2 as React.FC<{ size?: number; style?: React.CSSProperties }>
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, height: "100%", padding: 40, textAlign: "center" as const }}>
        <CheckCircle size={48} style={{ color: "var(--success)" }} />
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>"{widgetName}" saved to catalog</div>
        <p style={{ fontSize: 14, color: "var(--field-supporting)", maxWidth: 360, margin: 0 }}>
          Your widget is now available in the Widget Library and can be added to any dashboard.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Back to Library</Button>
          <Button variant="main" size="sm" onClick={() => { setSaved(false); setSourceId(null); setMetric(""); setTypeId(null); setWName(""); setAccent(""); setStyle(""); setTab("data") }}>Build another</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

      {/* ── Left: build panel ───────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Describe it */}
        <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--field-border)", background: "var(--surface)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--field-border)", background: "var(--canvas)" }}>
              {(() => { const Sparkle = LucideIcons.Sparkles as React.FC<{ size?: number; style?: React.CSSProperties }>; return <Sparkle size={14} style={{ color: "var(--primary)", flexShrink: 0 }} /> })()}
              <input
                value={describePrompt} onChange={e => setDescPr(e.target.value)}
                placeholder="Describe your widget…"
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--foreground)" }}
              />
            </div>
            <Button variant="secondary" size="sm">Generate</Button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            {DESCRIBE_EXAMPLES.map(ex => (
              <WBSectionChip key={ex} active={describePrompt === ex} onClick={() => setDescPr(ex)}>{ex}</WBSectionChip>
            ))}
          </div>
        </div>

        {/* Tab nav */}
        <WBBuilderTabNav tab={tab} setTab={setTab} dataComplete={dataComplete} widgetComplete={widgetComplete} />

        {/* ── Tab: Data ─────────────────────────────────────── */}
        {tab === "data" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Source selector */}
            <div>
              <WBSectionLabel n={1}>Data source</WBSectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div
                  onClick={() => setDataMode("source")}
                  style={{ cursor: "pointer", padding: "14px 16px", borderRadius: 10, border: `2px solid ${dataMode === "source" ? "var(--primary)" : "var(--field-border)"}`,
                    background: dataMode === "source" ? "color-mix(in srgb, var(--primary) 8%, var(--surface))" : "var(--surface)", display: "flex", flexDirection: "column", gap: 6 }}>
                  {(() => { const Db = LucideIcons.Database as React.FC<{ size?: number; style?: React.CSSProperties }>; return <Db size={18} style={{ color: dataMode === "source" ? "var(--primary)" : "var(--field-supporting)" }} /> })()}
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>Entity</span>
                  <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>Choose any governed or raw entity from your integrations.</span>
                </div>
                <div
                  onClick={() => setDataMode("preset")}
                  style={{ cursor: "pointer", padding: "14px 16px", borderRadius: 10, border: `2px solid ${dataMode === "preset" ? "var(--primary)" : "var(--field-border)"}`,
                    background: dataMode === "preset" ? "color-mix(in srgb, var(--primary) 8%, var(--surface))" : "var(--surface)", display: "flex", flexDirection: "column", gap: 6 }}>
                  {(() => { const Lay = LucideIcons.Layers as React.FC<{ size?: number; style?: React.CSSProperties }>; return <Lay size={18} style={{ color: dataMode === "preset" ? "var(--primary)" : "var(--field-supporting)" }} /> })()}
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>Existing Dataset</span>
                  <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>Pick a governed, pre-joined dataset curated by your data team.</span>
                </div>
              </div>
            </div>

            {/* Entity picker */}
            {dataMode === "source" && (
              <div>
                <WBSectionLabel n={2}>Choose an entity</WBSectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {ENTITY_SOURCES.map(s => (
                    <WBEntitySourceCard key={s.id} source={s} selected={sourceId === s.id} onSelect={() => { setSourceId(s.id); setMetric("") }} />
                  ))}
                </div>
              </div>
            )}

            {/* Dataset picker */}
            {dataMode === "preset" && (
              <div>
                <WBSectionLabel n={2}>Choose a dataset</WBSectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PRESET_DATASETS.map(d => (
                    <WBDatasetCard key={d.id} dataset={d} selected={sourceId === d.id} onSelect={() => { setSourceId(d.id); setMetric("") }} />
                  ))}
                </div>
              </div>
            )}

            {/* Operation + metric */}
            {sourceId && (
              <div>
                <WBSectionLabel n={3}>Operation & metric</WBSectionLabel>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {(["aggregate", "record_set"] as OpType[]).map(op => (
                    <button key={op} onClick={() => setOpType(op)} style={{
                      flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${opType === op ? "var(--primary)" : "var(--field-border)"}`,
                      background: opType === op ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                      color: opType === op ? "var(--primary)" : "var(--field-supporting)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {op === "aggregate" ? "Aggregation" : "Record set"}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(SOURCE_COLUMNS[sourceId] ?? []).map(col => (
                    <button key={col} onClick={() => setMetric(col)} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px",
                      borderRadius: 8, border: `1px solid ${metric === col ? "var(--primary)" : "var(--field-border)"}`,
                      background: metric === col ? "color-mix(in srgb, var(--primary) 8%, var(--surface))" : "var(--surface)", cursor: "pointer" }}>
                      <span style={{ fontSize: 13, color: "var(--foreground)", fontWeight: metric === col ? 600 : 400 }}>{col}</span>
                      {metric === col && (() => { const Chk = LucideIcons.Check as React.FC<{ size?: number; style?: React.CSSProperties }>; return <Chk size={14} style={{ color: "var(--primary)" }} /> })()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Freshness */}
            {metric && (
              <div>
                <WBSectionLabel n={4}>Refresh cadence</WBSectionLabel>
                <div style={{ display: "flex", gap: 8 }}>
                  {FRESHNESS_OPTIONS.map(f => (
                    <button key={f.value} onClick={() => setFreshness(f.value)} style={{
                      flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${freshness === f.value ? "var(--primary)" : "var(--field-border)"}`,
                      background: freshness === f.value ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                      color: freshness === f.value ? "var(--primary)" : "var(--field-supporting)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dataComplete && (
              <Button variant="main" size="sm" onClick={() => setTab("widget")}>
                Continue to Widget →
              </Button>
            )}
          </div>
        )}

        {/* ── Tab: Widget ───────────────────────────────────── */}
        {tab === "widget" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <WBSectionLabel n={1}>Widget name</WBSectionLabel>
              <Input value={widgetName} onChange={e => setWName(e.target.value)} placeholder={srcLabel ? `e.g. ${srcLabel} count` : "e.g. Open Deals by Stage"} />
            </div>
            <div>
              <WBSectionLabel n={2}>Visualization type</WBSectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {WIDGET_TYPES.map(wt => (
                  <WBTypeTile key={wt.id} type={wt} selected={typeId === wt.id} onSelect={() => setTypeId(wt.id)} />
                ))}
              </div>
            </div>
            {widgetComplete && (
              <Button variant="main" size="sm" onClick={() => setTab("appearance")}>
                Continue to Appearance →
              </Button>
            )}
          </div>
        )}

        {/* ── Tab: Appearance ───────────────────────────────── */}
        {tab === "appearance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <WBSectionLabel n={1}>Accent color</WBSectionLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                {ACCENT_COLORS.map(ac => (
                  <button key={ac.id} onClick={() => setAccent(ac.id)} title={ac.label} style={{
                    width: 32, height: 32, borderRadius: "50%", border: `2px solid ${accentColor === ac.id ? "var(--foreground)" : "var(--field-border)"}`,
                    // audit-ignore: ac.hex is a runtime value from ACCENT_COLORS constant, not a hardcoded hex
                    background: ac.hex === "transparent" ? "var(--surface)" : ac.hex, cursor: "pointer",
                    outline: accentColor === ac.id ? "2px solid var(--primary)" : "none", outlineOffset: 2 }}>
                    {ac.hex === "transparent" && <span style={{ fontSize: 9, color: "var(--field-supporting)" }}>Def</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <WBSectionLabel n={2}>Style variant</WBSectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {STYLE_VARIANTS.map(sv => (
                  <button key={sv.id} onClick={() => setStyle(sv.id)} style={{
                    padding: "8px 12px", borderRadius: 8, border: `1px solid ${styleVariant === sv.id ? "var(--primary)" : "var(--field-border)"}`,
                    background: styleVariant === sv.id ? "color-mix(in srgb, var(--primary) 8%, var(--surface))" : "var(--surface)",
                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                    color: styleVariant === sv.id ? "var(--primary)" : "var(--foreground)" }}>
                    {sv.label}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="main" size="sm" disabled={!widgetComplete} onClick={handleSave}>
              Save to catalog
            </Button>
          </div>
        )}
      </div>

      {/* ── Right: sticky preview ───────────────────────────────────────── */}
      <div style={{ width: "42%", flexShrink: 0, position: "sticky" as const, top: 0 }}>
        <WBPreviewPanel
          typeId={typeId} name={widgetName} sourceId={sourceId} freshness={freshness}
          accentColor={accentHex} previewSize={previewSize} setPreviewSize={setPrvSize} saveHint={saveHint}
        />
      </div>
    </div>
  )
}

// ── Main unified screen ───────────────────────────────────────────────────────

export default function PMThomasComposableDashboardsScreen() {
  const [mainView, setMainView]       = useState<MainView>("dashboards")
  const [subView, setSubView]         = useState<WidgetSubView>("library")
  const [overlayView, setOverlay]     = useState<OverlayView>(null)

  function switchMain(v: MainView) { setMainView(v); setOverlay(null) }

  const sidebarActive = mainView === "dashboards" ? "dashboards" : "widgets"

  function handleSidebarClick(id: string) {
    if (id === "dashboards") switchMain("dashboards")
    if (id === "widgets")    switchMain("widgets")
  }

  // Dynamic header per view
  let headerTitle = "Dashboard Studio"
  let headerDesc  = "Build and manage contextual dashboards."
  let headerPrimary: React.ReactNode = null

  if (overlayView === "new-dashboard") {
    headerTitle = "New dashboard"
    headerDesc  = "Configure placement, audience, and starting point."
  } else if (overlayView === "builder") {
    headerTitle = "Widget Playground"
    headerDesc  = "Map an entity and metric, pick a widget type, and preview it live."
    headerPrimary = <Button variant="secondary" size="sm" onClick={() => setOverlay(null)}>Cancel</Button>
  } else if (mainView === "dashboards") {
    headerPrimary = <Button variant="main" size="sm" onClick={() => setOverlay("new-dashboard")}>Create dashboard</Button>
  } else if (subView === "library") {
    headerTitle = "Widget Library"
    headerDesc  = `${LIB_WIDGETS.length} widgets · ${LIB_GOVERNED_COUNT} governed`
    headerPrimary = <Button variant="main" size="sm" onClick={() => setOverlay("builder")}>Create widget</Button>
  } else {
    headerTitle = "Widget Marketplace"
    headerDesc  = "Browse community and integration widgets by category."
    headerPrimary = <Button variant="main" size="sm" onClick={() => setOverlay("builder")}>Create with AI assist</Button>
  }

  return (
    <ScreenLayout
      workspaceName="Meridian Corp"
      userName="Thomas G."
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId={sidebarActive}
      onSidebarItemClick={handleSidebarClick}
      header={(isScrolled) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={headerTitle}
            description={overlayView ? undefined : headerDesc}
            primaryAction={overlayView === "builder" ? undefined : headerPrimary}
          />
          {/* Sub-tabs for Widgets view */}
          {mainView === "widgets" && !overlayView && (
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--field-border)", padding: "0 0 0 0", marginBottom: -1 }}>
              {(["library", "marketplace"] as const).map(sv => (
                <button key={sv} onClick={() => setSubView(sv)}
                  style={{ padding: "8px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    color: subView === sv ? "var(--primary)" : "var(--text-subtitle)",
                    borderBottom: `2px solid ${subView === sv ? "var(--primary)" : "transparent"}`, marginBottom: -1 }}>
                  {sv === "library" ? "Widget Library" : "Marketplace"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    >
      {overlayView === "new-dashboard" && (
        <NewDashboardOverlay onClose={() => setOverlay(null)} />
      )}
      {overlayView === "builder" && (
        <WidgetBuilderOverlay onClose={() => setOverlay(null)} />
      )}
      {!overlayView && mainView === "dashboards" && (
        <DashboardsView />
      )}
      {!overlayView && mainView === "widgets" && subView === "library" && (
        <WidgetLibraryView onCreateWidget={() => setOverlay("builder")} />
      )}
      {!overlayView && mainView === "widgets" && subView === "marketplace" && (
        <MarketplaceView onUseWidget={() => setOverlay("builder")} />
      )}
    </ScreenLayout>
  )
}
