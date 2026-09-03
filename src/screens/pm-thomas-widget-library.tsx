import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout }  from "@/components/layouts/screen-layout"
import type { SidebarItem } from "@/components/ui/sidebar"
import { Header }        from "@/components/ui/header"
import { Button }        from "@/components/ui/button"
import { Tag }           from "@/components/ui/tag"
import { Input }         from "@/components/ui/input"
import { EmptyState }    from "@/components/ui/empty-state"
import { CardContainer } from "@/components/ui/card-container"
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
function WidgetGlyph({ skeleton }: { skeleton: string }) {
  const iconKey = SKELETON_ICON[skeleton] ?? "Square"
  const Icon = LucideIcons[iconKey] as React.FC<{ size?: number; style?: React.CSSProperties; className?: string }>
  return (
    <div style={{ width: 36, height: 36, borderRadius: 9, background: "color-mix(in srgb,var(--primary) 12%,transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={16} style={{ color: "var(--primary)" }} />
    </div>
  )
}

// ── DS-GAP: FreshnessBadge — live/fresh/stale indicator. Closest DS: Tag.
const FRESH_CONFIG: Record<Freshness, { variant: "success" | "informative" | "neutral"; label: string }> = {
  live:  { variant: "success",     label: "Live"  },
  fresh: { variant: "informative", label: "Fresh" },
  stale: { variant: "neutral",     label: "Stale" },
}
function FreshnessBadge({ status }: { status: Freshness }) {
  const cfg = FRESH_CONFIG[status]
  return <Tag variant={cfg.variant} size="sm">{cfg.label}</Tag>
}

// ── DS-GAP: HealthBadge — active/review indicator. Closest DS: Tag.
function HealthBadge({ health }: { health: Health }) {
  if (health === "active") return null
  return <Tag variant="alert" size="sm">Needs remap</Tag>
}

// ── DS-GAP: MiniPreview — sunken widget preview surface. Closest DS: CardContainer (variant=sunken).
function MiniPreview({ skeleton }: { skeleton: string }) {
  const iconKey = SKELETON_ICON[skeleton] ?? "Square"
  const Icon = LucideIcons[iconKey] as React.FC<{ size?: number; style?: React.CSSProperties; className?: string }>
  return (
    <div style={{ height: 56, borderRadius: 8, background: "var(--canvas)", border: "1px solid var(--field-border)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <Icon size={13} style={{ color: "var(--field-supporting)" }} />
      <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{skeleton} preview</span>
    </div>
  )
}

// ── DS-GAP: StudioWelcome — contextual banner. Closest DS: CardContainer.
function StudioWelcome({ count, onCta }: { count: number; onCta: () => void }) {
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

// ── DS-GAP: FilterToolbar — 4-filter toolbar. Closest DS: Filters.
type FTProps = {
  search: string; onSearch: (v: string) => void
  cat: string; onCat: (v: string) => void
  profile: string; onProfile: (v: string) => void
  skeleton: string; onSkeleton: (v: string) => void
  freshness: string; onFreshness: (v: string) => void
  sortBy: string; onSortBy: (v: string) => void
  sortDir: "asc" | "desc"; onToggleDir: () => void
}
function FilterToolbar({ search, onSearch, cat, onCat, profile, onProfile, skeleton, onSkeleton, freshness, onFreshness, sortBy, onSortBy, sortDir, onToggleDir }: FTProps) {
  const [open, setOpen] = useState<string | null>(null)

  function Pill({ id, label, active, children }: { id: string; label: string; active: boolean; children: React.ReactNode }) {
    return (
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpen(open === id ? null : id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: `1px solid ${active ? "var(--primary)" : "var(--field-border)"}`, background: active ? "color-mix(in srgb,var(--primary) 12%,transparent)" : "var(--surface)", color: active ? "var(--primary)" : "var(--foreground)", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
          {label}<LucideIcons.ChevronDown size={11} />
        </button>
        {open === id && (
          <>
            <div onClick={() => setOpen(null)} style={{ position: "fixed", inset: 0, zIndex: 198 }} />
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

  function Opt({ val, cur, onSet, display }: { val: string; cur: string; onSet: (v: string) => void; display?: string }) {
    const active = cur === val
    return (
      <button onClick={() => { onSet(val); setOpen(null) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, color: active ? "var(--primary)" : "var(--foreground)", fontWeight: active ? 600 : 400, textAlign: "left" }}>
        {active ? <LucideIcons.Check size={12} style={{ flexShrink: 0 }} /> : <span style={{ width: 12, flexShrink: 0 }} />}
        {display ?? val}
      </button>
    )
  }

  const PROFILES = ["All", "Company", "Contact", "Employee", "Deal", "Standalone"] as const

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160, maxWidth: 260 }}>
        <LucideIcons.Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--field-supporting)", pointerEvents: "none" }} />
        <Input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search widgets…" style={{ paddingLeft: 30, fontSize: 12 }} />
      </div>
      <Pill id="cat" label={cat === "All" ? "Category" : cat} active={cat !== "All"}>
        <Opt val="All" cur={cat} onSet={onCat} display="All categories" />
        {CATEGORIES.map(c => <Opt key={c} val={c} cur={cat} onSet={onCat} />)}
      </Pill>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {PROFILES.map(p => (
          <button key={p} onClick={() => onProfile(profile === p ? "All" : p)} style={{ padding: "5px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${profile === p ? "var(--primary)" : "var(--field-border)"}`, background: profile === p ? "color-mix(in srgb,var(--primary) 12%,transparent)" : "transparent", color: profile === p ? "var(--primary)" : "var(--field-supporting)" }}>
            {p}
          </button>
        ))}
      </div>
      <Pill id="type" label={skeleton === "All" ? "Type" : skeleton} active={skeleton !== "All"}>
        <Opt val="All" cur={skeleton} onSet={onSkeleton} display="All types" />
        {SKELETONS.map(s => <Opt key={s} val={s} cur={skeleton} onSet={onSkeleton} />)}
      </Pill>
      <Pill id="fresh" label={freshness === "All" ? "Freshness" : freshness.charAt(0).toUpperCase() + freshness.slice(1)} active={freshness !== "All"}>
        <Opt val="All" cur={freshness} onSet={onFreshness} display="All freshness" />
        {FRESHNESS_OPTIONS.map(f => <Opt key={f} val={f} cur={freshness} onSet={onFreshness} display={f.charAt(0).toUpperCase() + f.slice(1)} />)}
      </Pill>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
        <Pill id="sort" label={sortBy === "usage" ? "Most used" : "Name"} active={false}>
          <Opt val="name"  cur={sortBy} onSet={onSortBy} display="Name"      />
          <Opt val="usage" cur={sortBy} onSet={onSortBy} display="Most used" />
        </Pill>
        <button onClick={onToggleDir} style={{ background: "none", border: "1px solid var(--field-border)", borderRadius: 8, padding: "5px 7px", cursor: "pointer", color: "var(--field-supporting)", display: "flex" }}>
          {sortDir === "desc" ? <LucideIcons.ArrowDown size={13} /> : <LucideIcons.ArrowUp size={13} />}
        </button>
      </div>
    </div>
  )
}

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
  const [sortBy,   setSortBy]    = useState("name")
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

      <FilterToolbar
        search={search}     onSearch={setSearch}
        cat={cat}           onCat={v => { setCat(v); setShown(PAGE_SIZE) }}
        profile={profile}   onProfile={v => { setProfile(v as Profile); setShown(PAGE_SIZE) }}
        skeleton={skeleton} onSkeleton={v => { setSkeleton(v); setShown(PAGE_SIZE) }}
        freshness={freshness} onFreshness={v => { setFreshness(v); setShown(PAGE_SIZE) }}
        sortBy={sortBy}     onSortBy={setSortBy}
        sortDir={sortDir}   onToggleDir={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
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
                <MiniPreview skeleton={w.skeleton} />

                {/* Footer */}
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--field-border)", paddingTop: 10 }}>
                  <span style={{ fontSize: 11, color: w.health === "review" ? "var(--alert)" : "var(--field-supporting)", fontWeight: w.health === "review" ? 600 : 400 }}>
                    {w.health === "review" ? "Remap needed →" : `Used on ${w.usedIn} dashboard${w.usedIn === 1 ? "" : "s"}`}
                  </span>
                  <FreshnessBadge status={w.freshness} />
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
              <FreshnessBadge status={detailW.freshness} />
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
