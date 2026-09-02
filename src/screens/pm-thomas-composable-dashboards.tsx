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
type Skeleton    = "KPI" | "Chart" | "Feed" | "Gauge" | "Donut" | "Board" | "Funnel" | "Stat Row"
type TabId       = "data" | "widget" | "appearance"
type BuilderStep = "Placement" | "Start point"

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
  KPI: "Hash", Chart: "BarChart2", Feed: "List", Gauge: "Gauge",
  Donut: "PieChart", Board: "LayoutGrid", Funnel: "TrendingDown", "Stat Row": "Rows3",
}

const LIB_WIDGETS = [
  { id: "w1",  name: "Total MRR",          source: "HubSpot",  skeleton: "KPI"      as Skeleton, freshness: "live"  as Freshness, governed: true,  usedIn: 6,  description: "Month-to-date closed revenue across all HubSpot deals." },
  { id: "w2",  name: "Pipeline by Stage",  source: "HubSpot",  skeleton: "Chart"    as Skeleton, freshness: "live"  as Freshness, governed: true,  usedIn: 4,  description: "Deal count and value grouped by pipeline stage." },
  { id: "w3",  name: "Ticket Volume",      source: "Zendesk",  skeleton: "Chart"    as Skeleton, freshness: "fresh" as Freshness, governed: true,  usedIn: 3,  description: "Support tickets opened per day with SLA status breakdown." },
  { id: "w4",  name: "CSAT Score",         source: "Zendesk",  skeleton: "Gauge"    as Skeleton, freshness: "fresh" as Freshness, governed: true,  usedIn: 5,  description: "Rolling 30-day average satisfaction score from closed tickets." },
  { id: "w5",  name: "Headcount by Dept",  source: "BambooHR", skeleton: "Donut"    as Skeleton, freshness: "fresh" as Freshness, governed: true,  usedIn: 2,  description: "Active employee count segmented by department." },
  { id: "w6",  name: "Worker Success Rate",source: "AIMS OS",  skeleton: "KPI"      as Skeleton, freshness: "live"  as Freshness, governed: true,  usedIn: 7,  description: "Percentage of AI Worker runs completed without errors." },
  { id: "w7",  name: "Recent Activity Feed",source:"HubSpot",  skeleton: "Feed"     as Skeleton, freshness: "live"  as Freshness, governed: false, usedIn: 8,  description: "Live stream of contact and deal activity from HubSpot CRM." },
  { id: "w8",  name: "Deal Funnel",        source: "HubSpot",  skeleton: "Funnel"   as Skeleton, freshness: "fresh" as Freshness, governed: true,  usedIn: 2,  description: "Conversion rates at each stage of the primary sales funnel." },
  { id: "w9",  name: "Open Deals Board",   source: "HubSpot",  skeleton: "Board"    as Skeleton, freshness: "live"  as Freshness, governed: true,  usedIn: 3,  description: "Kanban-style view of all open deals by owner and stage." },
  { id: "w10", name: "HR Metrics Row",     source: "BambooHR", skeleton: "Stat Row" as Skeleton, freshness: "fresh" as Freshness, governed: true,  usedIn: 1,  description: "Key workforce KPIs: headcount, tenure, time-to-hire, turnover." },
]

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
  { id: "contacts_hubspot",   label: "Contacts",  integration: "HubSpot",  governed: true },
  { id: "companies_hubspot",  label: "Companies", integration: "HubSpot",  governed: true },
  { id: "deals_hubspot",      label: "Deals",     integration: "HubSpot",  governed: true },
  { id: "tickets_zendesk",    label: "Tickets",   integration: "Zendesk",  governed: true },
  { id: "employees_bamboohr", label: "Employees", integration: "BambooHR", governed: true },
  { id: "workflows_aims",     label: "Workflows", integration: "AIMS OS",  governed: true },
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

function FreshnessBadge({ f }: { f: Freshness }) {
  const map: Record<Freshness, { label: string; variant: "success" | "informative" | "alert" }> = {
    live:   { label: "Live",   variant: "success" },
    fresh:  { label: "Fresh",  variant: "informative" },
    stale:  { label: "Stale", variant: "alert" },
  }
  return <Tag variant={map[f].variant} size="sm">{map[f].label}</Tag>
}

function WidgetGlyph({ skeleton }: { skeleton: Skeleton }) {
  const iconKey = SKELETON_ICON[skeleton] ?? "BarChart2"
  const Icon = LucideIcons[iconKey] as React.FC<{ size?: number; style?: React.CSSProperties }>
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface-raised, var(--surface))",
      border: "1px solid var(--field-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {Icon && <Icon size={16} style={{ color: "var(--primary)" }} />}
    </div>
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
  const [search, setSearch]       = useState("")
  const [srcFilter, setSrc]       = useState("All")
  const [freshFilter, setFresh]   = useState("All")
  const [page, setPage]           = useState(1)
  const [detail, setDetail]       = useState<typeof LIB_WIDGETS[0] | null>(null)
  const PAGE_SIZE = 6

  const filtered = LIB_WIDGETS.filter(w => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    if (srcFilter !== "All" && w.source !== srcFilter) return false
    if (freshFilter !== "All" && w.freshness !== freshFilter.toLowerCase()) return false
    return true
  })
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <FilterBar
        search={search} onSearch={v => { setSearch(v); setPage(1) }}
        pills={[
          { label: "Source", value: srcFilter, options: ["All", "HubSpot", "Zendesk", "BambooHR", "AIMS OS"], onSelect: v => { setSrc(v); setPage(1) } },
          { label: "Freshness", value: freshFilter, options: ["All", "Live", "Fresh", "Stale"], onSelect: v => { setFresh(v); setPage(1) } },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
        {paged.map(w => (
          <CardContainer key={w.id} size="sm" className="flex flex-col gap-2 cursor-pointer" onClick={() => setDetail(w)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <WidgetGlyph skeleton={w.skeleton} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-title)" }}>{w.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-subtitle)" }}>{w.source} · {w.skeleton}</div>
              </div>
              <FreshnessBadge f={w.freshness} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted, var(--text-subtitle))" }}>{w.description}</div>
            <div style={{ fontSize: 11, color: "var(--text-subtitle)", marginTop: 2 }}>Used in {w.usedIn} dashboards{w.governed ? " · Governed" : ""}</div>
          </CardContainer>
        ))}
      </div>

      {filtered.length > PAGE_SIZE && (
        <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />
      )}

      {detail && (
        <SlideOut open title={detail.name} onClose={() => setDetail(null)}
          ctaPrimaryLabel="Add to dashboard"
          ctaSecondaryLabel="Edit widget"
          onCtaPrimary={() => setDetail(null)}
          onCtaSecondary={() => { setDetail(null); onCreateWidget() }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <WidgetGlyph skeleton={detail.skeleton} />
              <FreshnessBadge f={detail.freshness} />
              {detail.governed && <Tag variant="success" size="sm">Governed</Tag>}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-body)" }}>{detail.description}</div>
            {[["Source", detail.source], ["Type", detail.skeleton], ["Used in", `${detail.usedIn} dashboards`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--field-border)", paddingBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-subtitle)" }}>{k}</span>
                <span style={{ fontSize: 12, color: "var(--text-body)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </SlideOut>
      )}
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

function WidgetBuilderOverlay({ onClose }: { onClose: () => void }) {
  const [tab, setTab]             = useState<TabId>("data")
  const [dataMode, setDataMode]   = useState<"source" | "preset">("source")
  const [sourceId, setSourceId]   = useState("")
  const [widgetType, setWType]    = useState("")
  const [widgetName, setWName]    = useState("")
  const [accentColor, setAccent]  = useState("")

  const TABS: { id: TabId; label: string }[] = [
    { id: "data",       label: "1 · Data" },
    { id: "widget",     label: "2 · Widget" },
    { id: "appearance", label: "3 · Appearance" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Overlay header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 0 16px 0", borderBottom: "1px solid var(--field-border)", marginBottom: 20 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtitle)", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <LucideIcons.ArrowLeft size={14} /> Widgets
        </button>
        <span style={{ fontSize: 13, color: "var(--field-border)" }}>/</span>
        <span style={{ fontSize: 13, color: "var(--text-body)", fontWeight: 500 }}>Widget Builder</span>
        {/* Tab pills */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 2, background: "var(--surface)", border: "1px solid var(--field-border)", borderRadius: 8, padding: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                background: tab === t.id ? "var(--primary)" : "transparent",
                color: tab === t.id ? "var(--on-primary)" : "var(--text-subtitle)" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Data */}
      {tab === "data" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CardContainer className="flex flex-col gap-4">
            <div style={{ display: "flex", gap: 4, background: "var(--surface)", border: "1px solid var(--field-border)", borderRadius: 8, padding: 2, alignSelf: "flex-start" }}>
              {(["source", "preset"] as const).map(m => (
                <button key={m} onClick={() => setDataMode(m)}
                  style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                    background: dataMode === m ? "var(--primary)" : "transparent",
                    color: dataMode === m ? "var(--on-primary)" : "var(--text-subtitle)" }}>
                  {m === "source" ? "Raw source" : "Governed dataset"}
                </button>
              ))}
            </div>
            {dataMode === "source" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-title)" }}>Select a data source</div>
                {ENTITY_SOURCES.map(s => (
                  <button key={s.id} onClick={() => setSourceId(s.id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8,
                      border: `1px solid ${sourceId === s.id ? "var(--primary)" : "var(--field-border)"}`,
                      background: sourceId === s.id ? "var(--primary-muted, var(--surface))" : "var(--surface)", cursor: "pointer" }}>
                    <div style={{ fontSize: 13, color: "var(--text-body)", fontWeight: sourceId === s.id ? 600 : 400 }}>
                      {s.label} <span style={{ fontSize: 11, color: "var(--text-subtitle)", fontWeight: 400 }}>({s.integration})</span>
                    </div>
                    {s.governed && <Tag variant="success" size="sm">Governed</Tag>}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--text-subtitle)", padding: "8px 0" }}>
                Governed datasets coming soon in this prototype view.
              </div>
            )}
          </CardContainer>
        </div>
      )}

      {/* Tab: Widget */}
      {tab === "widget" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CardContainer className="flex flex-col gap-4">
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)" }}>Widget name</div>
            <Input value={widgetName} onChange={e => setWName(e.target.value)} placeholder="e.g. Open Deals by Stage" style={{ fontSize: 13 }} />
          </CardContainer>
          <CardContainer className="flex flex-col gap-4">
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)" }}>Visualization type</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {WIDGET_TYPES.map(wt => {
                const Icon = LucideIcons[wt.icon as keyof typeof LucideIcons] as React.FC<{ size?: number }>
                const selected = widgetType === wt.id
                return (
                  <button key={wt.id} onClick={() => setWType(wt.id)}
                    style={{ padding: "10px 8px", borderRadius: 8, border: `2px solid ${selected ? "var(--primary)" : "var(--field-border)"}`,
                      background: selected ? "var(--primary-muted, var(--surface))" : "var(--surface)", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    {Icon && <Icon size={18} />}
                    <span style={{ fontSize: 12, fontWeight: 600, color: selected ? "var(--primary)" : "var(--text-body)" }}>{wt.label}</span>
                    <span style={{ fontSize: 10, color: "var(--text-subtitle)", textAlign: "center", lineHeight: 1.3 }}>{wt.bestFor}</span>
                  </button>
                )
              })}
            </div>
          </CardContainer>
        </div>
      )}

      {/* Tab: Appearance */}
      {tab === "appearance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CardContainer className="flex flex-col gap-4">
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-title)" }}>Accent color</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ACCENT_COLORS.map(ac => (
                <button key={ac.id} onClick={() => setAccent(ac.id)}
                  title={ac.label}
                  style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${accentColor === ac.id ? "var(--text-body)" : "var(--field-border)"}`,
                    background: ac.hex === "transparent" ? "var(--surface)" : ac.hex, cursor: "pointer",
                    outline: accentColor === ac.id ? "2px solid var(--primary)" : "none", outlineOffset: 2 }}>
                  {ac.hex === "transparent" && (
                    <span style={{ fontSize: 9, color: "var(--text-subtitle)", lineHeight: 1 }}>Def</span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-subtitle)" }}>
              Selected: <strong>{ACCENT_COLORS.find(a => a.id === accentColor)?.label ?? "Default"}</strong>
            </div>
          </CardContainer>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="main" size="sm" onClick={onClose}>Save to catalog</Button>
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
    headerTitle = "Widget Builder"
    headerDesc  = "Define data, visualization type, and appearance."
    headerPrimary = <Button variant="main" size="sm" onClick={() => setOverlay(null)}>Save to catalog</Button>
  } else if (mainView === "dashboards") {
    headerPrimary = <Button variant="main" size="sm" onClick={() => setOverlay("new-dashboard")}>Create dashboard</Button>
  } else if (subView === "library") {
    headerTitle = "Widget Library"
    headerDesc  = "Governed and custom widgets available for your dashboards."
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
