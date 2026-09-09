import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout }  from "@/components/layouts/screen-layout"
import type { SidebarItem } from "@/components/ui/sidebar"
import { Header }        from "@/components/ui/header"
import { Button }        from "@/components/ui/button"
import { Tag }           from "@/components/ui/tag"
import { WidgetFreshnessBadge } from "@/components/experimental/widget-parts"
import { WidgetFather } from "@/components/ui/widget-father"
import { WidgetPreview } from "@/components/experimental/widget-preview"
import { LIBRARY_SKELETONS, typeIdForSkeleton, type LibrarySkeleton } from "@/lib/widget-catalog"
import { EmptyState }    from "@/components/ui/empty-state"
import { CardContainer } from "@/components/ui/card-container"
import { Filters } from "@/components/ui/filters"
import { ModalDialog }   from "@/components/ui/modal-dialog"
import { SlideOut }      from "@/components/ui/slide-out"
import { OverflowMenu, StudioWelcome } from "@/components/experimental/widget-screen-parts"

// ── Types ──────────────────────────────────────────────────────────────────────

type Health     = "active" | "review"
type Freshness  = "live" | "fresh" | "stale"
type Category   = "AIMS OS" | "Operational" | "Engagement" | "Intelligence"
type Profile    = "All" | "Company" | "Contact" | "Employee" | "Deal" | "Standalone"

type Status = "published" | "draft"

type Widget = {
  id: string; name: string; source: string
  /**
   * Null on a draft that has not picked its widget type yet — the one thing a
   * card cannot draw a preview without. Every other draft keeps its type and
   * previews normally.
   */
  skeleton: LibrarySkeleton | null
  category: Category; health: Health; freshness: Freshness
  governed: boolean; system: boolean; usedIn: number
  placement: Profile; description: string
  status: Status
  /** What a draft is still missing, phrased to finish "still needs …". */
  missing?: string
}

/** Same word, same colour and same filter as the Dashboard List's own drafts —
 *  two sibling libraries calling the same state two things is how a vocabulary
 *  starts drifting. */
const STATUS_LABEL: Record<Status, string> = { published: "Published", draft: "Draft" }

// ── Dataset ────────────────────────────────────────────────────────────────────

const WIDGETS: Widget[] = [
  { id:"w-001", name:"Human-in-the-Loop Queue",      source:"AIMS OS — Agentic Studio",   skeleton:"Feed",     category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:true,  usedIn:5,  placement:"Standalone", description:"Live queue of all conversations waiting for a human agent to pick up or review.", status:"published" },
  { id:"w-002", name:"Workflow Runs",                source:"AIMS OS — Agentic Studio",   skeleton:"Chart",    category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:4,  placement:"Standalone", description:"Daily run volume trend for all active workflows, broken down by status.", status:"published" },
  { id:"w-003", name:"Credits Consumed",             source:"AIMS OS — Credits",          skeleton:"KPI",      category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:5,  placement:"Standalone", description:"Total AI credits consumed this billing cycle vs. your plan limit.", status:"published" },
  { id:"w-004", name:"SLA Compliance Rate",          source:"AIMS OS — HTL",              skeleton:"Gauge",    category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:3,  placement:"Standalone", description:"Percentage of human-touch interactions resolved within the defined SLA window.", status:"published" },
  { id:"w-005", name:"Council Outcomes",             source:"AIMS OS — Governance",       skeleton:"Donut",    category:"AIMS OS",        health:"active", freshness:"fresh", governed:true,  system:false, usedIn:2,  placement:"Standalone", description:"Breakdown of governance council decisions: Approved, Escalated, Rejected.", status:"published" },
  { id:"w-006", name:"Agent Status Board",           source:"AIMS OS — Agents",           skeleton:"Board",    category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:1,  placement:"Standalone", description:"Real-time status grid for all deployed agents: Running, Idle, Error, Paused.", status:"published" },
  { id:"w-007", name:"Conversion Funnel",            source:"AIMS OS — Data Studio",      skeleton:"Funnel",   category:"AIMS OS",        health:"active", freshness:"fresh", governed:true,  system:false, usedIn:1,  placement:"Company",    description:"Stage-by-stage funnel from lead to closed-won for the selected entity scope.", status:"published" },
  { id:"w-008", name:"Platform Snapshot",            source:"AIMS OS — Platform",         skeleton:"Stat Row", category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:2,  placement:"Standalone", description:"At-a-glance row of key platform metrics: DAU, agents active, workflows running.", status:"published" },
  { id:"w-009", name:"Governance Alerts",            source:"AIMS OS — Governance",       skeleton:"Alerts",   category:"AIMS OS",        health:"review", freshness:"stale", governed:true,  system:false, usedIn:2,  placement:"Standalone", description:"Active policy violations and blocked actions requiring admin review.", status:"published" },
  { id:"w-010", name:"Account Revenue Health",       source:"Salesforce",                 skeleton:"KPI",      category:"Operational",    health:"active", freshness:"fresh", governed:true,  system:false, usedIn:8,  placement:"Company",    description:"ARR, churn risk score, and renewal date for the selected account.", status:"published" },
  { id:"w-011", name:"Open Tickets",                 source:"Zendesk",                    skeleton:"KPI",      category:"Operational",    health:"active", freshness:"live",  governed:true,  system:false, usedIn:6,  placement:"Company",    description:"Count of open support tickets by priority for this account.", status:"published" },
  { id:"w-012", name:"Pipeline Stage Funnel",        source:"Salesforce",                 skeleton:"Funnel",   category:"Operational",    health:"active", freshness:"fresh", governed:true,  system:false, usedIn:5,  placement:"Deal",       description:"Opportunity stage progression with time-in-stage and velocity metrics.", status:"published" },
  { id:"w-013", name:"Onboarding Checklist",         source:"AIMS OS — Platform",         skeleton:"Feed",     category:"Operational",    health:"active", freshness:"live",  governed:true,  system:false, usedIn:4,  placement:"Employee",   description:"Checklist of onboarding tasks with completion status per new hire.", status:"published" },
  { id:"w-014", name:"Email Engagement Rate",        source:"HubSpot",                    skeleton:"Chart",    category:"Engagement",     health:"active", freshness:"fresh", governed:false, system:false, usedIn:7,  placement:"Contact",    description:"Open rate, click rate, and reply rate for outbound sequences targeting this contact.", status:"published" },
  { id:"w-015", name:"Deal Velocity",                source:"Salesforce",                 skeleton:"Gauge",    category:"Operational",    health:"active", freshness:"fresh", governed:true,  system:false, usedIn:5,  placement:"Deal",       description:"Speed from stage entry to close compared to team median, per deal.", status:"published" },
  { id:"w-016", name:"NPS Trend",                    source:"Qualtrics",                  skeleton:"Chart",    category:"Engagement",     health:"active", freshness:"stale", governed:false, system:false, usedIn:3,  placement:"Company",    description:"Net Promoter Score trend over the past 12 months for this account.", status:"published" },
  { id:"w-017", name:"Contact Interaction Timeline", source:"HubSpot",                    skeleton:"Feed",     category:"Engagement",     health:"active", freshness:"live",  governed:false, system:false, usedIn:4,  placement:"Contact",    description:"Chronological feed of emails, calls, meetings, and notes for this contact.", status:"published" },
  { id:"w-018", name:"Risk Score Breakdown",         source:"AIMS OS — Intelligence",     skeleton:"Gauge",    category:"Intelligence",   health:"active", freshness:"fresh", governed:true,  system:false, usedIn:4,  placement:"Company",    description:"Composite churn/risk score with contributing signals and recommended actions.", status:"published" },
  { id:"w-019", name:"Next Best Action",             source:"AIMS OS — Intelligence",     skeleton:"KPI",      category:"Intelligence",   health:"active", freshness:"live",  governed:true,  system:false, usedIn:6,  placement:"Company",    description:"AI-recommended next action for this account with confidence score and reasoning.", status:"published" },
  { id:"w-020", name:"Revenue Attribution",          source:"Salesforce",                 skeleton:"Chart",    category:"Intelligence",   health:"review", freshness:"stale", governed:false, system:false, usedIn:2,  placement:"Deal",       description:"First-touch and multi-touch attribution by channel for this deal.", status:"published" },
  { id:"w-021", name:"Certification Tracker",        source:"Workday",                    skeleton:"Feed",     category:"Operational",    health:"active", freshness:"fresh", governed:true,  system:false, usedIn:3,  placement:"Employee",   description:"Required certifications, completion status, and expiry dates per employee.", status:"published" },
  { id:"w-022", name:"Credit Spend Trend",           source:"AIMS OS — Credits",          skeleton:"Cost KPI", category:"AIMS OS",        health:"active", freshness:"live",  governed:true,  system:false, usedIn:1,  placement:"Standalone", description:"Daily and monthly AI credit spend with projected end-of-cycle balance.", status:"published" },

  // ── Drafts ────────────────────────────────────────────────────────────────
  // Saved from the Widget Builder before they were finished. Each is missing a
  // different piece, because those three are what the builder can actually
  // leave unanswered — a draft with nothing missing would not be a draft.
  // `usedIn: 0` is not a fixture choice: a draft cannot be added to a
  // dashboard, so any other number would be a lie.
  { id:"w-023", name:"Renewal Risk by Segment",      source:"Salesforce",                 skeleton:null,       category:"Intelligence",   health:"active", freshness:"stale", governed:true,  system:false, usedIn:0,  placement:"Company",    description:"Churn risk scored by customer segment, to sit beside the renewal date on an account.", status:"draft", missing:"a widget type" },
  { id:"w-024", name:"Support Load by Team",         source:"Zendesk",                    skeleton:"Chart",    category:"Operational",    health:"active", freshness:"stale", governed:true,  system:false, usedIn:0,  placement:"Standalone", description:"Ticket volume per support team over time, to spot where the queue is piling up.", status:"draft", missing:"an entity" },
  { id:"w-025", name:"Partner Sourced Pipeline",     source:"Salesforce",                 skeleton:"Funnel",   category:"Operational",    health:"active", freshness:"stale", governed:true,  system:false, usedIn:0,  placement:"Deal",       description:"Deals originated by partners, stage by stage, against the direct pipeline.", status:"draft", missing:"the rest of its data setup" },
]

const CATEGORIES: Category[] = ["AIMS OS", "Operational", "Engagement", "Intelligence"]
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


// ── DS-GAP: FilterToolbar — 4-filter toolbar. Closest DS: Filters.
// ── DS-GAP: OverflowMenu — per-card ⋯ actions. Closest DS: Menu + MenuItem.

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function PMThomasWidgetLibrary() {
  const [search,    setSearch]    = useState("")
  const [cat,      setCat]       = useState("All")
  const [profile,  setProfile]   = useState<Profile>("All")
  const [status,   setStatus]    = useState("All")
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
  const draftCount    = widgets.filter(w => w.status === "draft").length

  const filtered = widgets.filter(w => {
    if (status   !== "All" && w.status    !== status)   return false
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
          description={`${widgets.length} widgets · ${governedCount} governed · ${draftCount} drafts`}
          primaryAction={{ label: "Create widget", icon: LucideIcons.Sparkles }}
        />
      )}
    >
      <StudioWelcome
        iconName="PieChart"
        title={`${widgets.length} widgets in your library`}
        description={draftCount > 0
          ? `Widgets connect to your data sources and live inside dashboards. ${draftCount} of these are drafts — saved but not finished, so they cannot be added to a dashboard yet.`
          : "Widgets connect to your data sources and live inside dashboards on entity profiles or standalone reports."}
        ctaLabel="Create widget"
        onCta={() => {}}
      />

      <Filters
        showSearch
        searchPlaceholder="Search widgets…"
        searchValue={search}
        onSearchChange={setSearch}
        showAllFilters={false}
        showViewToggle={false}
        showClearFilters={status !== "All" || cat !== "All" || profile !== "All" || skeleton !== "All" || freshness !== "All"}
        onClearFilters={() => {
          setStatus("All"); setCat("All"); setProfile("All"); setSkeleton("All"); setFreshness("All"); setShown(PAGE_SIZE)
        }}
        sortLabel={sortBy}
        onSortClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
        slots={[
          {
            /* First slot on purpose: "can I put this on a dashboard yet" comes
               before any question about what the widget contains. */
            placeholder: "Status",
            value: status === "All" ? undefined : STATUS_LABEL[status as Status],
            options: ["Published", "Draft"],
            onSelect: v => { setStatus(v === "Published" ? "published" : "draft"); setShown(PAGE_SIZE) },
            onRemove: () => { setStatus("All"); setShown(PAGE_SIZE) },
          },
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
            options: [...LIBRARY_SKELETONS],
            onSelect: v => { setSkeleton(v as LibrarySkeleton); setShown(PAGE_SIZE) },
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

      {/* 24px from the last nav layer to the first card, per the DS. Filters
          carries no bottom margin of its own, so without this the filter row
          sits flush against the first row of cards and reads as part of the
          grid. The cards keep their own 12px between them. */}
      {sorted.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <EmptyState icon={LucideIcons.Search} title="No widgets found" description="Try a different search or filter." />
        </div>
      ) : (
        <>
          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(264px,100%), 1fr))", gap: 12 }}>
            {page.map(w => (
              <div key={w.id} style={{ position: "relative" }}>
              <CardContainer
                onClick={e => { if (!(e.target as HTMLElement).closest("button")) setDetailW(w) }}
                className="flex flex-col gap-[10px] cursor-pointer h-full"
              >
                {/* The card IS a widget. WidgetFather draws the header — its own
                    title type, its own subtitle, its own ⋯ on the right — so a
                    widget in the library reads exactly as it will on a
                    dashboard. Refresh is off: nothing here is live. */}
                <WidgetFather
                  noCard
                  fillWidth
                  title={w.name}
                  description={w.source}
                  showRefresh={false}
                  onMenuClick={() => setMenuId(menuId === w.id ? null : w.id)}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Tags — health lives here now that the widget's own menu
                        owns the top-right corner. */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {/* Draft leads. It is the one tag that changes what you
                          can DO with the card, so it is read first. Neutral,
                          not alert: unfinished is not a problem, and the
                          Dashboard List already spells it exactly this way. */}
                      {w.status === "draft" && <Tag variant="neutral" size="sm">Draft</Tag>}
                      {w.skeleton && <Tag variant="neutral" size="sm">{w.skeleton}</Tag>}
                      {!w.governed && <Tag variant="alert" size="sm">Ungoverned</Tag>}
                      {w.system  && <Tag variant="informative" size="sm">System</Tag>}
                      <HealthBadge health={w.health} />
                    </div>

                    {/* A draft with no widget type has nothing to draw — every
                        other draft still previews, because it picked one. */}
                    {w.skeleton
                      ? <WidgetPreview typeId={typeIdForSkeleton(w.skeleton)} fallbackHeight={72} clipTo={88} />
                      : (
                        <div style={{ height: 88, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <EmptyState compact icon={LucideIcons.Shapes} title="No widget type yet" />
                        </div>
                      )}
                  </div>
                </WidgetFather>

                {menuId === w.id && (
                  <div style={{ position: "absolute", top: 34, right: 12, zIndex: 2 }}>
                    <OverflowMenu onClose={() => setMenuId(null)} items={[
                      { label: "Open", icon: "Eye", onClick: () => setDetailW(w) },
                      /* Not offered on a draft — it is the one thing a draft
                         cannot do, and a menu item that does nothing teaches
                         that the menu is decorative. */
                      ...(w.status === "published"
                        ? [{ label: "Add to dashboard", icon: "Plus" as keyof typeof LucideIcons, onClick: () => {} }]
                        : [{ label: "Finish setup", icon: "Pencil" as keyof typeof LucideIcons, onClick: () => { window.location.href = "?proto=proto-thomas-widget-builder" } }]),
                      ...(!w.system ? [{ label: "Edit",  icon: "Pencil" as keyof typeof LucideIcons, onClick: () => {} }] : []),
                      ...(!w.system ? [{ label: "Delete", icon: "Trash2" as keyof typeof LucideIcons, danger: true, onClick: () => setDeleteW(w) }] : []),
                    ]} />
                  </div>
                )}

                {/* Footer */}
                {/* A draft is on zero dashboards and has no data flowing, so
                    "Used on 0 dashboards" beside a freshness badge would be two
                    true statements that together read as broken. It says what
                    it needs instead — the same sentence the builder showed when
                    it was saved. */}
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--field-border)", paddingTop: 10 }}>
                  <span style={{ fontSize: 11, color: w.health === "review" ? "var(--alert)" : "var(--field-supporting)", fontWeight: w.health === "review" ? 600 : 400 }}>
                    {w.status === "draft"
                      ? `Still needs ${w.missing} →`
                      : w.health === "review" ? "Remap needed →" : `Used on ${w.usedIn} dashboard${w.usedIn === 1 ? "" : "s"}`}
                  </span>
                  {w.status === "published" && <WidgetFreshnessBadge status={w.freshness} />}
                </div>
              </CardContainer>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
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
              {detailW.status === "draft"
                ? <Tag variant="neutral" size="sm">Draft</Tag>
                : <WidgetFreshnessBadge status={detailW.freshness} />}
              {detailW.skeleton && <Tag variant="neutral" size="sm">{detailW.skeleton}</Tag>}
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
              {/* A draft's one useful action is finishing it — offering "Add
                  to dashboard" on something that cannot be added is the same
                  mistake as a disabled Eye on a row with nothing to preview. */}
              {detailW.status === "draft"
                ? <Button variant="primary" size="sm" onClick={() => { window.location.href = "?proto=proto-thomas-widget-builder" }}>Finish setup</Button>
                : <Button variant="primary" size="sm">Add to dashboard</Button>}
              {!detailW.system && detailW.status === "published" && <Button variant="secondary" size="sm">Edit widget</Button>}
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
