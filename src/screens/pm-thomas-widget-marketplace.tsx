import { useState, useMemo } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tag } from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { SlideOut } from "@/components/ui/slide-out"
import { Pagination } from "@/components/ui/pagination"
import type { SidebarItem } from "@/components/ui/sidebar"

// ── Types ─────────────────────────────────────────────────────────────────────

type BizCat = "all" | "aims-os" | "sales" | "finance" | "customer-service" | "hr" | "marketing" | "operations"
type Skeleton = "KPI" | "Chart" | "Feed" | "Gauge" | "Donut" | "Board" | "Funnel" | "Stat Row" | "Alerts" | "Cost KPI"
type Freshness = "live" | "fresh" | "stale"
type Complexity = "Simple" | "Intermediate" | "Advanced"
type SortKey = "usage" | "name" | "type"

interface MarketplaceWidget {
  id: string
  name: string
  source: string
  skeleton: Skeleton
  freshness: Freshness
  description: string
  businessCategory: Exclude<BizCat, "all">
  complexity: Complexity
  entityCount: number
  tenantUsage: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

// DS-GAP: CategoryColors — business-function palette; no DS tokens for these. Needs tokenization.
const CAT_COLOR: Record<string, string> = {
  "aims-os":          "#2B7FFF", // audit-ignore: prototype category colours
  "sales":            "#22C55E", // audit-ignore: prototype category colours
  "finance":          "#0EA5E9", // audit-ignore: prototype category colours
  "customer-service": "#F97316", // audit-ignore: prototype category colours
  "hr":               "#A78BFA", // audit-ignore: prototype category colours
  "marketing":        "#EC4899", // audit-ignore: prototype category colours
  "operations":       "#64748B", // audit-ignore: prototype category colours
}

const CATEGORIES: { id: BizCat; label: string }[] = [
  { id: "all",              label: "All categories" },
  { id: "aims-os",          label: "AIMS OS" },
  { id: "sales",            label: "Sales" },
  { id: "finance",          label: "Finance" },
  { id: "customer-service", label: "Customer Service" },
  { id: "hr",               label: "HR" },
  { id: "marketing",        label: "Marketing" },
  { id: "operations",       label: "Operations" },
]

const SKELETON_ICON: Record<string, string> = {
  KPI: "TrendingUp", Chart: "BarChart2", Feed: "Rss", Gauge: "Gauge",
  Donut: "PieChart", Board: "Kanban", Funnel: "Filter", "Stat Row": "AlignLeft",
  Alerts: "Bell", "Cost KPI": "DollarSign",
}

const WIDGETS: MarketplaceWidget[] = [
  // AIMS OS
  { id: "mw-01", name: "AI Worker Activity", source: "AIMS OS — Core", skeleton: "Chart", freshness: "live", description: "Real-time chart of AI worker tasks, completions, and errors across your automation fleet.", businessCategory: "aims-os", complexity: "Intermediate", entityCount: 6, tenantUsage: 1420 },
  { id: "mw-02", name: "Human-in-the-Loop Queue", source: "AIMS OS — HTL", skeleton: "Board", freshness: "live", description: "Kanban-style board showing all pending human handoffs sorted by urgency and assignment.", businessCategory: "aims-os", complexity: "Advanced", entityCount: 9, tenantUsage: 890 },
  { id: "mw-03", name: "Automation Health Score", source: "AIMS OS — Core", skeleton: "KPI", freshness: "live", description: "Single KPI reflecting the aggregate health of all active automations, updated in real time.", businessCategory: "aims-os", complexity: "Simple", entityCount: 3, tenantUsage: 2100 },
  { id: "mw-04", name: "Next Best Actions", source: "AIMS OS — Core", skeleton: "Feed", freshness: "live", description: "Prioritized feed of AI-recommended actions across records, surfaced by the recommendation engine.", businessCategory: "aims-os", complexity: "Intermediate", entityCount: 5, tenantUsage: 760 },
  // Sales
  { id: "mw-05", name: "Pipeline by Stage", source: "Salesforce", skeleton: "Funnel", freshness: "fresh", description: "Funnel chart showing deal count and value at each pipeline stage — from prospect to closed won.", businessCategory: "sales", complexity: "Intermediate", entityCount: 7, tenantUsage: 3400 },
  { id: "mw-06", name: "Revenue Closed MTD", source: "HubSpot", skeleton: "KPI", freshness: "fresh", description: "Month-to-date closed revenue with trend vs. last 30 days and target attainment percentage.", businessCategory: "sales", complexity: "Simple", entityCount: 4, tenantUsage: 4200 },
  { id: "mw-07", name: "Deal Velocity Trend", source: "Salesforce", skeleton: "Chart", freshness: "fresh", description: "Weekly trend of average days-to-close across deal stages, segmented by rep and region.", businessCategory: "sales", complexity: "Advanced", entityCount: 8, tenantUsage: 1100 },
  // Finance
  { id: "mw-08", name: "Cash Flow Summary", source: "QuickBooks", skeleton: "Chart", freshness: "fresh", description: "Rolling 13-week cash flow chart showing inflows, outflows, and projected balance by category.", businessCategory: "finance", complexity: "Intermediate", entityCount: 6, tenantUsage: 980 },
  { id: "mw-09", name: "Budget vs. Actuals", source: "Finance Data View", skeleton: "Stat Row", freshness: "fresh", description: "Row of KPIs comparing budget vs. actuals for each department, with variance percentage.", businessCategory: "finance", complexity: "Simple", entityCount: 5, tenantUsage: 1650 },
  { id: "mw-10", name: "Expense Breakdown", source: "Stripe", skeleton: "Donut", freshness: "live", description: "Donut chart of operational expenses split by category — SaaS, headcount, COGS, travel, and other.", businessCategory: "finance", complexity: "Intermediate", entityCount: 4, tenantUsage: 1200 },
  // Customer Service
  { id: "mw-11", name: "Ticket Volume Trend", source: "Zendesk", skeleton: "Chart", freshness: "live", description: "Daily ticket volume over 30 days, broken down by channel (email, chat, phone) and priority.", businessCategory: "customer-service", complexity: "Intermediate", entityCount: 5, tenantUsage: 2800 },
  { id: "mw-12", name: "CSAT Score", source: "Intercom", skeleton: "Gauge", freshness: "fresh", description: "Current customer satisfaction score as a gauge, with 30-day trend and benchmark comparison.", businessCategory: "customer-service", complexity: "Simple", entityCount: 3, tenantUsage: 3100 },
  { id: "mw-13", name: "Open SLA Breaches", source: "Zendesk", skeleton: "Alerts", freshness: "live", description: "Live feed of tickets breaching SLA, grouped by tier, with assignee and time since breach.", businessCategory: "customer-service", complexity: "Advanced", entityCount: 7, tenantUsage: 1500 },
  // HR
  { id: "mw-14", name: "Headcount by Department", source: "Workday HCM", skeleton: "Donut", freshness: "fresh", description: "Department headcount split showing allocation across Engineering, Sales, CS, and G&A.", businessCategory: "hr", complexity: "Simple", entityCount: 3, tenantUsage: 1800 },
  { id: "mw-15", name: "Hiring Pipeline", source: "Greenhouse", skeleton: "Funnel", freshness: "fresh", description: "Recruiting funnel from applied to offer-accepted, with conversion rates at each stage.", businessCategory: "hr", complexity: "Intermediate", entityCount: 6, tenantUsage: 740 },
  { id: "mw-16", name: "eNPS Trend", source: "Workday HCM", skeleton: "Chart", freshness: "stale", description: "Employee Net Promoter Score trend over the past 4 quarters, segmented by department.", businessCategory: "hr", complexity: "Intermediate", entityCount: 4, tenantUsage: 560 },
  // Marketing
  { id: "mw-17", name: "Campaign Performance", source: "Google Ads", skeleton: "Stat Row", freshness: "live", description: "Row KPI view of active campaigns showing impressions, clicks, CTR, CPC, and spend.", businessCategory: "marketing", complexity: "Simple", entityCount: 6, tenantUsage: 2200 },
  { id: "mw-18", name: "NPS Survey Responses", source: "Survey Data View", skeleton: "Chart", freshness: "fresh", description: "Response volume and score distribution for the latest NPS cohort, with comment feed.", businessCategory: "marketing", complexity: "Advanced", entityCount: 5, tenantUsage: 670 },
  // Operations
  { id: "mw-19", name: "Data Pipeline Status", source: "Snowflake", skeleton: "Alerts", freshness: "live", description: "Real-time status feed of ETL jobs and data pipeline runs, with failure alerts and run times.", businessCategory: "operations", complexity: "Advanced", entityCount: 8, tenantUsage: 1350 },
  { id: "mw-20", name: "Infrastructure Cost", source: "Snowflake", skeleton: "Cost KPI", freshness: "fresh", description: "Monthly cloud spend tracker with cost-per-query trend and top consumers by table.", businessCategory: "operations", complexity: "Intermediate", entityCount: 5, tenantUsage: 890 },
]

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home",          label: "Home",          icon: "Home" },
  { id: "dashboards",    label: "My Dashboards", icon: "LayoutDashboard" },
  { id: "widget-library",label: "Widget Library",icon: "Library" },
  { id: "marketplace",   label: "Marketplace",   icon: "Store" },
]

const PAGE_SIZE = 12

// ── DS-GAP Components ─────────────────────────────────────────────────────────

// DS-GAP: WidgetGlyph — icon representation for widget skeleton types. Closest DS component: HighlightIcon.
function WidgetGlyph({ skeleton, size = 32 }: { skeleton: string; size?: number }) {
  const iconKey = SKELETON_ICON[skeleton] ?? "Square"
  const Icon = (LucideIcons as Record<string, unknown>)[iconKey] as React.FC<{ size?: number; style?: React.CSSProperties }>
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: "var(--surface)", border: "1px solid var(--field-border)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={Math.round(size * 0.5)} style={{ color: "var(--primary)" }} />
    </div>
  )
}

// DS-GAP: FreshnessBadge — pill showing data freshness state. Closest DS component: Tag.
const FRESHNESS_META: Record<string, { label: string; color: string }> = {
  live:  { label: "Live",  color: "var(--success)" },
  fresh: { label: "Fresh", color: "var(--primary)" },
  stale: { label: "Stale", color: "var(--alert)" },
}
function FreshnessBadge({ freshness }: { freshness: string }) {
  const meta = FRESHNESS_META[freshness] ?? FRESHNESS_META.fresh
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: meta.color, flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
      {meta.label}
    </span>
  )
}

// DS-GAP: MiniPreview — skeleton-appropriate miniature chart placeholder. Closest DS component: none.
function MiniPreview({ skeleton }: { skeleton: string }) {
  if (skeleton === "Donut") {
    return (
      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", border: "10px solid var(--primary)", opacity: 0.3 }} />
      </div>
    )
  }
  if (skeleton === "Gauge") {
    return (
      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 44, height: 22, borderRadius: "22px 22px 0 0", border: "9px solid var(--primary)", borderBottom: "none", opacity: 0.3 }} />
      </div>
    )
  }
  if (skeleton === "Feed" || skeleton === "Alerts" || skeleton === "Board") {
    return (
      <div style={{ height: 52, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 5 }}>
        {[100, 78, 55].map((w, i) => (
          <div key={i} style={{ height: 8, borderRadius: 4, background: "var(--primary)", opacity: 0.18 + i * 0.1, width: `${w}%` }} />
        ))}
      </div>
    )
  }
  return (
    <div style={{ height: 52, display: "flex", alignItems: "flex-end", gap: 3, padding: "6px 8px 0" }}>
      {[45, 65, 40, 85, 55, 70].map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: "var(--primary)", opacity: 0.18 + i * 0.09 }} />
      ))}
    </div>
  )
}

// DS-GAP: MarketplaceCard — widget listing card with category stripe, preview, and action buttons. Closest DS component: CardContainer.
function MarketplaceCard({ widget, catColor, onView, onUse }: {
  widget: MarketplaceWidget
  catColor: string
  onView: () => void
  onUse: () => void
}) {
  const complexityColor = widget.complexity === "Simple" ? "var(--success)" : widget.complexity === "Advanced" ? "var(--alert)" : "var(--color-text-subtitle)"
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 3, background: catColor, flexShrink: 0 }} />
      <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <WidgetGlyph skeleton={widget.skeleton} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-title)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {widget.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-subtitle)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {widget.source}
            </div>
          </div>
          <FreshnessBadge freshness={widget.freshness} />
        </div>
        <div style={{ borderRadius: 6, background: "var(--canvas)", border: "1px solid var(--field-border)", overflow: "hidden" }}>
          <MiniPreview skeleton={widget.skeleton} />
        </div>
        <p style={{
          fontSize: 12, color: "var(--color-text-subtitle)", lineHeight: 1.5, margin: 0,
          display: "-webkit-box" as const, WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
        }}>
          {widget.description}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          <Tag variant="neutral" size="sm">{widget.skeleton}</Tag>
          <span style={{ fontSize: 11, fontWeight: 500, padding: "1px 6px", borderRadius: 4, border: "1px solid var(--field-border)", color: complexityColor }}>
            {widget.complexity}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
          <span style={{ fontSize: 11, color: "var(--color-text-subtitle)", flex: 1 }}>
            {widget.entityCount} fields · {widget.tenantUsage.toLocaleString()} uses
          </span>
          <Button variant="secondary" size="sm" onClick={onView}>View</Button>
          <Button variant="primary" size="sm" onClick={onUse}>Use</Button>
        </div>
      </div>
    </div>
  )
}

// DS-GAP: CategoryRail — left sidebar category filter with color-dot indicators and active filter chips. Closest DS component: none.
function CategoryRail({ categories, counts, selected, onSelect, activeFilters, onClearFilter }: {
  categories: typeof CATEGORIES
  counts: Record<string, number>
  selected: BizCat
  onSelect: (id: BizCat) => void
  activeFilters: { key: string; label: string }[]
  onClearFilter: (key: string) => void
}) {
  const XIcon = LucideIcons.X as React.FC<{ size?: number; style?: React.CSSProperties }>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6,
            border: "none", background: selected === cat.id ? "var(--field-border)" : "transparent",
            cursor: "pointer", textAlign: "left" as const, width: "100%",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLOR[cat.id] ?? "transparent", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: selected === cat.id ? "var(--color-text-title)" : "var(--color-text-subtitle)", fontWeight: selected === cat.id ? 500 : 400 }}>
            {cat.label}
          </span>
          <span style={{ fontSize: 11, color: "var(--color-text-subtitle)", background: "var(--canvas)", borderRadius: 10, padding: "1px 6px", minWidth: 20, textAlign: "center" as const }}>
            {counts[cat.id] ?? 0}
          </span>
        </button>
      ))}
      {activeFilters.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--field-border)" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-subtitle)", marginBottom: 6, paddingLeft: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
            Active filters
          </div>
          {activeFilters.map(f => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px" }}>
              <span style={{ fontSize: 12, color: "var(--color-text-title)", flex: 1 }}>{f.label}</span>
              <button onClick={() => onClearFilter(f.key)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "var(--color-text-subtitle)" }}>
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PMThomasWidgetMarketplaceScreen() {
  const [selectedCat, setSelectedCat] = useState<BizCat>("all")
  const [search, setSearch]           = useState("")
  const [typeFilter, setTypeFilter]   = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [complexityFilter, setComplexityFilter] = useState("all")
  const [sortBy, setSortBy]           = useState<SortKey>("usage")
  const [page, setPage]               = useState(1)
  const [viewWidget, setViewWidget]   = useState<MarketplaceWidget | null>(null)
  const [useWidget, setUseWidget]     = useState<MarketplaceWidget | null>(null)

  const skeletonOptions = useMemo(() => Array.from(new Set(WIDGETS.map(w => w.skeleton))).sort(), [])
  const sourceOptions   = useMemo(() => Array.from(new Set(WIDGETS.map(w => w.source))).sort(), [])

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: WIDGETS.length }
    CATEGORIES.forEach(cat => { if (cat.id !== "all") c[cat.id] = WIDGETS.filter(w => w.businessCategory === cat.id).length })
    return c
  }, [])

  const filtered = useMemo(() => {
    let out = WIDGETS.slice()
    if (selectedCat !== "all") out = out.filter(w => w.businessCategory === selectedCat)
    if (search) { const q = search.toLowerCase(); out = out.filter(w => w.name.toLowerCase().includes(q) || w.source.toLowerCase().includes(q)) }
    if (typeFilter !== "all") out = out.filter(w => w.skeleton === typeFilter)
    if (sourceFilter !== "all") out = out.filter(w => w.source === sourceFilter)
    if (complexityFilter !== "all") out = out.filter(w => w.complexity === complexityFilter)
    out.sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name) :
      sortBy === "type" ? a.skeleton.localeCompare(b.skeleton) :
      b.tenantUsage - a.tenantUsage
    )
    return out
  }, [selectedCat, search, typeFilter, sourceFilter, complexityFilter, sortBy])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeFilters = [
    typeFilter !== "all"       && { key: "type",       label: `Type: ${typeFilter}` },
    sourceFilter !== "all"     && { key: "source",     label: `Source: ${sourceFilter}` },
    complexityFilter !== "all" && { key: "complexity", label: `Complexity: ${complexityFilter}` },
  ].filter(Boolean) as { key: string; label: string }[]

  const handleClearFilter = (key: string) => {
    if (key === "type")       setTypeFilter("all")
    if (key === "source")     setSourceFilter("all")
    if (key === "complexity") setComplexityFilter("all")
    setPage(1)
  }

  const selectStyle: React.CSSProperties = {
    padding: "6px 10px", borderRadius: 6, border: "1px solid var(--field-border)",
    background: "var(--surface)", color: "var(--color-text-title)", fontSize: 13, cursor: "pointer",
  }

  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas G."
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="marketplace"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Widget Marketplace"
          description="Browse and add pre-built widgets to your dashboards."
          secondaryAction={{ label: "Start from scratch" }}
          primaryAction={{ label: "Create with AI assist" }}
        />
      )}
      pagination={
        filtered.length > PAGE_SIZE
          ? <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />
          : undefined
      }
    >
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* Left panel — Category rail */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <CategoryRail
            categories={CATEGORIES}
            counts={catCounts}
            selected={selectedCat}
            onSelect={(id) => { setSelectedCat(id); setPage(1) }}
            activeFilters={activeFilters}
            onClearFilter={handleClearFilter}
          />
        </div>

        {/* Right panel — Filter toolbar + card grid */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* DS-GAP: FilterToolbar — search + dropdown filters for marketplace. Closest DS component: Filters. */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Input placeholder="Search widgets…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} style={selectStyle}>
              <option value="all">All types</option>
              {skeletonOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }} style={selectStyle}>
              <option value="all">All sources</option>
              {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={complexityFilter} onChange={(e) => { setComplexityFilter(e.target.value); setPage(1) }} style={selectStyle}>
              <option value="all">All complexity</option>
              <option value="Simple">Simple</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} style={selectStyle}>
              <option value="usage">Most used</option>
              <option value="name">Name A–Z</option>
              <option value="type">By type</option>
            </select>
          </div>

          <div style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>
            {filtered.length} widget{filtered.length !== 1 ? "s" : ""}
          </div>

          {paged.length === 0 ? (
            <div style={{ textAlign: "center" as const, padding: "48px 0", fontSize: 14, color: "var(--color-text-subtitle)" }}>
              No widgets match your current filters.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(256px, 1fr))", gap: 12 }}>
              {paged.map(w => (
                <div key={w.id} style={{ minHeight: 288 }}>
                  <CardContainer className="h-full overflow-hidden">
                    <MarketplaceCard
                      widget={w}
                      catColor={CAT_COLOR[w.businessCategory] ?? "#64748B"} // audit-ignore: prototype category colours
                      onView={() => setViewWidget(w)}
                      onUse={() => setUseWidget(w)}
                    />
                  </CardContainer>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Widget detail SlideOut */}
      {viewWidget && (
        <SlideOut
          open={!!viewWidget}
          onClose={() => setViewWidget(null)}
          title={viewWidget.name}
          showTabs={false}
          showChips={false}
          showSearchBar={false}
          showCta={false}
        >
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <WidgetGlyph skeleton={viewWidget.skeleton} size={48} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-title)" }}>{viewWidget.name}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-subtitle)", marginTop: 2 }}>{viewWidget.source}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" }}>
              <FreshnessBadge freshness={viewWidget.freshness} />
              <Tag variant="neutral" size="sm">{viewWidget.skeleton}</Tag>
              <Tag variant="neutral" size="sm">{viewWidget.complexity}</Tag>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-title)", lineHeight: 1.6, margin: 0 }}>
              {viewWidget.description}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 8, background: "var(--canvas)", border: "1px solid var(--field-border)" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-title)" }}>{viewWidget.entityCount}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-subtitle)", marginTop: 4 }}>Data fields</div>
              </div>
              <div style={{ padding: 14, borderRadius: 8, background: "var(--canvas)", border: "1px solid var(--field-border)" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-title)" }}>{viewWidget.tenantUsage.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-subtitle)", marginTop: 4 }}>Uses in org</div>
              </div>
            </div>
            <div style={{ height: 1, background: "var(--field-border)" }} />
            <Button variant="primary" onClick={() => { setUseWidget(viewWidget); setViewWidget(null) }}>
              Use this widget
            </Button>
          </div>
        </SlideOut>
      )}

      {/* Add to dashboard modal */}
      {useWidget && (
        <ModalDialog
          isOpen={!!useWidget}
          onClose={() => setUseWidget(null)}
          title={`Add "${useWidget.name}"`}
          description="This widget will be added to your widget library and available on any dashboard you manage."
          ctaPrimary={{ label: "Add to dashboard", onClick: () => setUseWidget(null) }}
          ctaSecondary={{ label: "Cancel", onClick: () => setUseWidget(null) }}
        />
      )}
    </ScreenLayout>
  )
}
