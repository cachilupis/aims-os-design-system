import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout }  from "@/components/layouts/screen-layout"
import type { SidebarItem } from "@/components/ui/sidebar"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Header }        from "@/components/ui/header"
import { Button }        from "@/components/ui/button"
import { Tag }           from "@/components/ui/tag"
import { WidgetGlyph, WidgetFreshnessBadge, WidgetMiniPreview } from "@/components/experimental/widget-parts"
import { EmptyState }    from "@/components/ui/empty-state"
import { CardContainer } from "@/components/ui/card-container"
import { Filters } from "@/components/ui/filters"
import { ModalDialog }   from "@/components/ui/modal-dialog"
import { SlideOut }      from "@/components/ui/slide-out"

// ── Types ──────────────────────────────────────────────────────────────────────

type Skeleton   = "KPI" | "Chart" | "Feed" | "Gauge" | "Donut" | "Board" | "Funnel" | "Stat Row" | "Alerts" | "Cost KPI"
type Health     = "active" | "review"
type Freshness  = "live" | "fresh" | "stale"
type Category   = "AIMS OS" | "Operational" | "Engagement" | "Intelligence"
type Profile    = "All" | "Company" | "Contact" | "Employee" | "Deal" | "Standalone"

type Widget = {
  id: string; name: string; source: string; skeleton: Skeleton
  category: Category; health: Health; freshness: Freshness
  governed: boolean; system: boolean; usedIn: number
  placement: Profile; description: string
}

// ── Dataset ────────────────────────────────────────────────────────────────────

const WIDGETS: Widget[] = [
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
  { id:"w-016", name:"NPS Trend",                    source:"Qualtrics",                  skeleton:"Chart",    category:"Engagement",     health:"active", freshness:"stale", governed:false, system:false, usedIn:3,  placement:"Company",    description:"Net Promoter Score trend over the past 12 months for this account." },
  { id:"w-017", name:"Contact Interaction Timeline", source:"HubSpot",                    skeleton:"Feed",     category:"Engagement",     health:"active", freshness:"live",  governed:false, system:false, usedIn:4,  placement:"Contact",    description:"Chronological feed of emails, calls, meetings, and notes for this contact." },
  { id:"w-018", name:"Risk Score Breakdown",         source:"AIMS OS — Intelligence",     skeleton:"Gauge",    category:"Intelligence",   health:"active", freshness:"fresh", governed:true,  system:false, usedIn:4,  placement:"Company",    description:"Composite churn/risk score with contributing signals and recommended actions." },
  { id:"w-019", name:"Next Best Action",             source:"AIMS OS — Intelligence",     skeleton:"KPI",      category:"Intelligence",   health:"active", freshness:"live",  governed:true,  system:false, usedIn:6,  placement:"Company",    description:"AI-recommended next action for this account with confidence score and reasoning." },
  { id:"w-020", name:"Revenue Attribution",          source:"Salesforce",                 skeleton:"Chart",    category:"Intelligence",   health:"review", freshness:"stale", governed:false, system:false, usedIn:2,  placement:"Deal",       description:"First-touch and multi-touch attribution by channel for this deal." },
  { id:"w-021", name:"Certification Tracker",        source:"Workday",                    skeleton:"Feed",     category:"Operational",    health:"active", freshness:"fresh", governed:true,  system:false, usedIn:3,  placement:"Employee",   description:"Required certifications, completion status, and expiry dates per employee." },
  { id:"w-022", name:"Credit Spend Trend",           source:"AIMS OS — Credits",          skeleton:"Cost KPI", category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:1,  placement:"Standalone", description:"Daily and monthly AI credit spend with projected end-of-cycle balance." },
]

const CATEGORIES: Category[] = ["AIMS OS", "Operational", "Engagement", "Intelligence"]
const SKELETONS: Skeleton[]   = ["KPI", "Chart", "Feed", "Gauge", "Donut", "Board", "Funnel", "Stat Row", "Alerts", "Cost KPI"]
const FRESHNESS_OPTIONS: Freshness[] = ["live", "fresh", "stale"]
const PAGE_SIZE = 18

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "dashboards", label: "Dashboards", icon: "LayoutDashboard" },
  { id: "widgets",    label: "Widgets",    icon: "PieChart"         },
  { id: "reports",    label: "Reports",    icon: "FileBarChart"     },
]

// ── DS-GAP: WidgetGlyph — skeleton-type icon badge. Closest DS: HighlightIcon.
// ── DS-GAP: HealthBadge — active/review indicator. Closest DS: Tag.
function HealthBadge({ health }: { health: Health }) {
  if (health === "active") return null
  return <Tag variant="alert" size="sm">Needs remap</Tag>
}

// ── DS-GAP: MiniPreview — sunken widget preview surface. Closest DS: CardContainer (variant=sunken).
// ── DS-GAP: StudioWelcome — contextual banner. Closest DS: CardContainer.
function StudioWelcome({ count, onCta }: { count: number; onCta: () => void }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div style={{ marginBottom: 16 }}>
    <CardContainer variant="default">
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
        <HighlightIcon iconName="PieChart" variant="informative" size="lg" />
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

// ── DS-GAP: FilterToolbar — 4-filter toolbar. Closest DS: Filters.
// ── DS-GAP: OverflowMenu — per-card ⋯ actions. Closest DS: Menu + MenuItem.
type OItem = { label: string; icon: keyof typeof LucideIcons; danger?: boolean; onClick: () => void }
function OverflowMenu({ items, onClose }: { items: OItem[]; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
      <div style={{ position: "absolute", top: "calc(100% + 2px)", right: 0, zIndex: 100, background: "var(--surface)", border: "1px solid var(--field-border)", borderRadius: 10, boxShadow: "var(--shadow-elevation-3)", minWidth: 160, padding: 4 }}>
        {items.map(({ label, icon, danger, onClick }) => {
          const Icon = LucideIcons[icon] as React.FC<{ size?: number; style?: React.CSSProperties; className?: string }>
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

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function PMThomasWidgetLibrary() {
  const [search,    setSearch]    = useState("")
  const [cat,      setCat]       = useState("All")
  const [profile,  setProfile]   = useState<Profile>("All")
  const [skeleton, setSkeleton]  = useState("All")
  const [freshness,setFreshness] = useState("All")
  const [sortBy] = useState("name")
  const [sortDir,  setSortDir]   = useState<"asc" | "desc">("asc")
  const [shown,    setShown]     = useState(PAGE_SIZE)
  const [menuId,   setMenuId]    = useState<string | null>(null)
  const [detailW,  setDetailW]   = useState<Widget | null>(null)
  const [deleteW,  setDeleteW]   = useState<Widget | null>(null)
  const [widgets,  setWidgets]   = useState(WIDGETS)

  const governedCount = widgets.filter(w => w.governed).length

  const filtered = widgets.filter(w => {
    if (cat      !== "All" && w.category  !== cat)      return false
    if (profile  !== "All" && w.placement !== profile)  return false
    if (skeleton !== "All" && w.skeleton  !== skeleton) return false
    if (freshness!== "All" && w.freshness !== freshness)return false
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
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas G."
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="widgets"
      header={isScrolled => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Widget Library"
          description={`${widgets.length} widgets · ${governedCount} governed`}
          primaryAction={{ label: "Create widget", icon: LucideIcons.Sparkles }}
        />
      )}
    >
      <StudioWelcome count={widgets.length} onCta={() => {}} />

      <Filters
        showSearch
        searchPlaceholder="Search widgets…"
        searchValue={search}
        onSearchChange={setSearch}
        showAllFilters={false}
        showViewToggle={false}
        showClearFilters={cat !== "All" || profile !== "All" || skeleton !== "All" || freshness !== "All"}
        onClearFilters={() => {
          setCat("All"); setProfile("All"); setSkeleton("All"); setFreshness("All"); setShown(PAGE_SIZE)
        }}
        sortLabel={sortBy}
        onSortClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
        slots={[
          {
            placeholder: "Category",
            value: cat === "All" ? undefined : cat,
            options: [...CATEGORIES],
            onSelect: v => { setCat(v as Category); setShown(PAGE_SIZE) },
            onRemove: () => { setCat("All"); setShown(PAGE_SIZE) },
          },
          {
            placeholder: "Profile",
            value: profile === "All" ? undefined : profile,
            options: ["Company", "Contact", "Employee", "Deal", "Standalone"],
            onSelect: v => { setProfile(v as Profile); setShown(PAGE_SIZE) },
            onRemove: () => { setProfile("All"); setShown(PAGE_SIZE) },
          },
          {
            placeholder: "Type",
            value: skeleton === "All" ? undefined : skeleton,
            options: [...SKELETONS],
            onSelect: v => { setSkeleton(v as Skeleton); setShown(PAGE_SIZE) },
            onRemove: () => { setSkeleton("All"); setShown(PAGE_SIZE) },
          },
          {
            placeholder: "Freshness",
            value: freshness === "All" ? undefined : freshness,
            options: [...FRESHNESS_OPTIONS],
            onSelect: v => { setFreshness(v as Freshness); setShown(PAGE_SIZE) },
            onRemove: () => { setFreshness("All"); setShown(PAGE_SIZE) },
          },
        ]}
      />

      {sorted.length === 0 ? (
        <EmptyState icon={LucideIcons.Search} title="No widgets found" description="Try a different search or filter." />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(264px,100%), 1fr))", gap: 12 }}>
            {page.map(w => (
              <div key={w.id} style={{ position: "relative" }}>
              <CardContainer
                onClick={e => { if (!(e.target as HTMLElement).closest("button")) setDetailW(w) }}
                className="flex flex-col gap-[10px] cursor-pointer h-full"
              >
                {/* Top-right: health badge + ⋯ menu */}
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 6, zIndex: 1 }}>
                  <HealthBadge health={w.health} />
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuId(menuId === w.id ? null : w.id) }}
                      aria-label={`Actions for ${w.name}`}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", padding: "2px 4px", borderRadius: 6, display: "flex" }}
                    >
                      <LucideIcons.MoreHorizontal size={15} />
                    </button>
                    {menuId === w.id && (
                      <OverflowMenu onClose={() => setMenuId(null)} items={[
                        { label: "Open",             icon: "Eye",       onClick: () => setDetailW(w) },
                        { label: "Add to dashboard", icon: "Plus",      onClick: () => {} },
                        ...(!w.system ? [{ label: "Edit",  icon: "Pencil" as keyof typeof LucideIcons, onClick: () => {} }] : []),
                        ...(!w.system ? [{ label: "Delete", icon: "Trash2" as keyof typeof LucideIcons, danger: true, onClick: () => setDeleteW(w) }] : []),
                      ]} />
                    )}
                  </div>
                </div>

                {/* Name + source */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: w.health === "review" ? 110 : 68 }}>
                  <WidgetGlyph skeleton={w.skeleton} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</p>
                    <p style={{ fontSize: 11, color: "var(--field-supporting)", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.source}</p>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <Tag variant="neutral" size="sm">{w.skeleton}</Tag>
                  {!w.governed && <Tag variant="alert" size="sm">Ungoverned</Tag>}
                  {w.system  && <Tag variant="informative" size="sm">System</Tag>}
                </div>

                {/* Mini preview */}
                <WidgetMiniPreview skeleton={w.skeleton} />

                {/* Footer */}
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--field-border)", paddingTop: 10 }}>
                  <span style={{ fontSize: 11, color: w.health === "review" ? "var(--alert)" : "var(--field-supporting)", fontWeight: w.health === "review" ? 600 : 400 }}>
                    {w.health === "review" ? "Remap needed →" : `Used on ${w.usedIn} dashboard${w.usedIn === 1 ? "" : "s"}`}
                  </span>
                  <WidgetFreshnessBadge status={w.freshness} />
                </div>
              </CardContainer>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
              <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>Showing {page.length} of {sorted.length}</span>
              <Button variant="secondary" size="sm" onClick={() => setShown(n => n + PAGE_SIZE)}>
                Load {Math.min(sorted.length - shown, PAGE_SIZE)} more
              </Button>
            </div>
          )}
        </>
      )}

      {/* Widget Detail SlideOut */}
      {detailW && (
        <SlideOut title={detailW.name} open={true} onClose={() => setDetailW(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px 0" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <WidgetFreshnessBadge status={detailW.freshness} />
              <Tag variant="neutral" size="sm">{detailW.skeleton}</Tag>
              <Tag variant={detailW.category === "AIMS OS" ? "informative" : "neutral"} size="sm">{detailW.category}</Tag>
              {!detailW.governed && <Tag variant="alert" size="sm">Ungoverned</Tag>}
              {detailW.system   && <Tag variant="informative" size="sm">System</Tag>}
            </div>
            {[["Source", detailW.source], ["Placement", detailW.placement], ["Used on", `${detailW.usedIn} dashboard${detailW.usedIn === 1 ? "" : "s"}`]].map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                <span style={{ width: 88, flexShrink: 0, color: "var(--field-supporting)", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "var(--foreground)" }}>{value}</span>
              </div>
            ))}
            {detailW.description && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Description</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--foreground)", margin: 0 }}>{detailW.description}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <Button variant="primary" size="sm">Add to dashboard</Button>
              {!detailW.system && <Button variant="secondary" size="sm">Edit widget</Button>}
            </div>
          </div>
        </SlideOut>
      )}

      {/* Delete confirmation */}
      {deleteW && (
        <ModalDialog
          isOpen={true}
          onClose={() => setDeleteW(null)}
          tone="error"
          title={`Delete "${deleteW.name}"?`}
          description={`This widget will be removed from your library${deleteW.usedIn > 0 ? ` and from ${deleteW.usedIn} dashboard${deleteW.usedIn === 1 ? "" : "s"} where it is currently placed` : ""}. This action cannot be undone.`}
          ctaPrimary={{ label: "Delete widget", destructive: true, onClick: () => handleDelete(deleteW.id) }}
          ctaSecondary={{ label: "Cancel", onClick: () => setDeleteW(null) }}
        />
      )}
    </ScreenLayout>
  )
}
