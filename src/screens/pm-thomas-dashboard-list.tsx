import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout }  from "@/components/layouts/screen-layout"
import type { SidebarItem } from "@/components/ui/sidebar"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Header }        from "@/components/ui/header"
import { Button }        from "@/components/ui/button"
import { Tag }           from "@/components/ui/tag"
import { Input }         from "@/components/ui/input"
import { EmptyState }    from "@/components/ui/empty-state"
import { CardContainer } from "@/components/ui/card-container"
import { ModalDialog }   from "@/components/ui/modal-dialog"
import { SlideOut }      from "@/components/ui/slide-out"

type DashStatus = "published" | "draft" | "pending"
type EntityKind = "Company" | "Contact" | "Employee" | "Deal" | "Standalone"

type Dashboard = {
  id: string; name: string; status: DashStatus; entity: EntityKind
  placement: string; owner: string; description: string
  widgetCount: number; audience: string; updated: string
}

const DASHBOARDS: Dashboard[] = [
  { id:"d-001", name:"Account Health Overview",          status:"published", entity:"Company",    placement:"Company profile · Summary tab",        owner:"Sarah Chen",   description:"Tracks revenue health, open tickets, NPS trend, and renewal risk for every company account.",       widgetCount:8,  audience:"Account Managers", updated:"2 hours ago"  },
  { id:"d-002", name:"Sales Pipeline Monitor",           status:"published", entity:"Standalone", placement:"Standalone · Sales collection",         owner:"James Ortega", description:"Pipeline stage funnel, stage velocity by rep, and deal age distribution for the current quarter.",  widgetCount:12, audience:"Sales Team",        updated:"1 day ago"    },
  { id:"d-003", name:"Employee Onboarding Tracker",      status:"published", entity:"Employee",   placement:"Employee profile · Onboarding tab",     owner:"Lisa Park",    description:"Checklist completion rate, task overdue count, and buddy assignment status per new hire.",           widgetCount:6,  audience:"HR Admins",         updated:"3 days ago"   },
  { id:"d-004", name:"Q3 Compliance Audit",              status:"draft",     entity:"Standalone", placement:"Standalone · Governance collection",     owner:"Sarah Chen",   description:"Open policy exceptions, attestation completion by department, and due-date countdown.",             widgetCount:4,  audience:"Compliance Team",   updated:"5 days ago"   },
  { id:"d-005", name:"Contact Engagement Summary",       status:"published", entity:"Contact",    placement:"Contact profile · Engagement tab",       owner:"James Ortega", description:"Email open rate, last interaction date, and conversion stage for individual contacts.",             widgetCount:9,  audience:"Marketing Leads",   updated:"1 week ago"   },
  { id:"d-006", name:"Deal Velocity Monitor",            status:"published", entity:"Deal",       placement:"Deal profile · Analytics tab",           owner:"Lisa Park",    description:"Time-in-stage breakdown, blockers count, and probability trend for in-progress deals.",            widgetCount:7,  audience:"Sales VPs",         updated:"2 weeks ago"  },
  { id:"d-007", name:"Risk Score Dashboard",             status:"draft",     entity:"Company",    placement:"Company profile · Risk tab",             owner:"Sarah Chen",   description:"Composite risk score by dimension with signal drilldown and recommended mitigations.",              widgetCount:5,  audience:"Risk Officers",     updated:"3 weeks ago"  },
  { id:"d-008", name:"West Region Activity Feed",        status:"published", entity:"Standalone", placement:"Standalone · Operations collection",     owner:"James Ortega", description:"Chronological feed of calls, notes, and status changes scoped to the West region accounts.",     widgetCount:3,  audience:"Region Managers",   updated:"1 month ago"  },
  { id:"d-009", name:"New Hire Checklist",               status:"pending",   entity:"Employee",   placement:"Employee profile · Compliance tab",      owner:"Lisa Park",    description:"Policy acknowledgements, system access requests, and training modules for the first 90 days.",    widgetCount:8,  audience:"HR Admins",         updated:"1 month ago"  },
  { id:"d-010", name:"Revenue Attribution Report",       status:"draft",     entity:"Deal",       placement:"Deal profile · Revenue tab",             owner:"Sarah Chen",   description:"First-touch and multi-touch attribution breakdown with channel contribution and CAC vs LTV.",      widgetCount:11, audience:"Finance Team",      updated:"2 months ago" },
  { id:"d-011", name:"Governance Audit Log",             status:"published", entity:"Standalone", placement:"Standalone · Governance collection",     owner:"James Ortega", description:"Immutable action log for policy changes, permission grants, and data access events.",              widgetCount:6,  audience:"Auditors",          updated:"2 months ago" },
  { id:"d-012", name:"Contact Lifecycle View",           status:"published", entity:"Contact",    placement:"Contact profile · Overview tab",         owner:"Lisa Park",    description:"Stage progression timeline, touchpoint history, and score trend for the full contact lifecycle.",  widgetCount:7,  audience:"Account Managers",  updated:"3 months ago" },
  { id:"d-013", name:"Support Tickets Summary",          status:"draft",     entity:"Standalone", placement:"Standalone · Support collection",        owner:"Sarah Chen",   description:"Open ticket volume by priority, SLA breach rate, and CSAT trend across all accounts.",             widgetCount:4,  audience:"Support Leads",     updated:"3 months ago" },
  { id:"d-014", name:"Partner Account Overview",         status:"published", entity:"Company",    placement:"Company profile · Partnership tab",      owner:"James Ortega", description:"Joint pipeline contribution, co-sell stage funnel, and partner health score per account.",         widgetCount:9,  audience:"Partner Managers",  updated:"4 months ago" },
  { id:"d-015", name:"Regulatory Compliance Checklist",  status:"pending",   entity:"Employee",   placement:"Employee profile · Legal tab",           owner:"Lisa Park",    description:"Required certifications, legal training completions, and open waivers with expiry warnings.",      widgetCount:5,  audience:"Legal Team",        updated:"4 months ago" },
]

const STATUS_VARIANT: Record<DashStatus, "success" | "neutral" | "informative"> = {
  published: "success", draft: "neutral", pending: "informative",
}
const STATUS_LABEL: Record<DashStatus, string> = {
  published: "Published", draft: "Draft", pending: "Pending",
}

const OWNERS: string[] = Array.from(new Set(DASHBOARDS.map(d => d.owner))).sort()
const ENTITY_KINDS: EntityKind[] = ["Company", "Contact", "Employee", "Deal", "Standalone"]
const PAGE_SIZE = 12

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "dashboards", label: "Dashboards", icon: "LayoutDashboard" },
  { id: "widgets",    label: "Widgets",    icon: "PieChart"         },
  { id: "reports",    label: "Reports",    icon: "FileBarChart"     },
]

// DS-GAP: StudioWelcome — contextual banner with count, tip, CTA. Closest DS: CardContainer.
function StudioWelcome({ count, onCta }: { count: number; onCta: () => void }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div style={{ marginBottom: 16 }}>
    <CardContainer variant="default">
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
        <HighlightIcon iconName="LayoutDashboard" variant="informative" size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
            {count} dashboard{count !== 1 ? "s" : ""} in your workspace
          </p>
          <p style={{ fontSize: 12, color: "var(--field-supporting)", margin: "2px 0 0" }}>
            Dashboards live on entity profiles or as standalone reports. Create one and choose where it appears.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onCta}>Create dashboard</Button>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", padding: 4, flexShrink: 0, display: "flex" }}>
          <LucideIcons.X size={14} />
        </button>
      </div>
    </CardContainer>
    </div>
  )
}

// DS-GAP: FilterToolbar — search + dropdown + entity chips + owner + sort. Closest DS: Filters.
type FTProps = {
  search: string; onSearch: (v: string) => void
  status: string; onStatus: (v: string) => void
  entity: string; onEntity: (v: string) => void
  owner: string;  onOwner:  (v: string) => void
  sortBy: string; onSortBy: (v: string) => void
  sortDir: "asc" | "desc"; onToggleDir: () => void
}
function FilterToolbar({ search, onSearch, status, onStatus, entity, onEntity, owner, onOwner, sortBy, onSortBy, sortDir, onToggleDir }: FTProps) {
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
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 199, boxShadow: "var(--shadow-elevation-3)", minWidth: 160 }}>
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

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160, maxWidth: 280 }}>
        <LucideIcons.Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--field-supporting)", pointerEvents: "none" }} />
        <Input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search dashboards…" style={{ paddingLeft: 30, fontSize: 12 }} />
      </div>
      <Pill id="status" label={status === "All" ? "Status" : STATUS_LABEL[status as DashStatus] ?? status} active={status !== "All"}>
        <Opt val="All"       cur={status} onSet={onStatus} display="All statuses" />
        <Opt val="published" cur={status} onSet={onStatus} display="Published"    />
        <Opt val="draft"     cur={status} onSet={onStatus} display="Draft"         />
        <Opt val="pending"   cur={status} onSet={onStatus} display="Pending"       />
      </Pill>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {(["All", ...ENTITY_KINDS] as string[]).map(k => (
          <button key={k} onClick={() => onEntity(entity === k ? "All" : k)} style={{ padding: "5px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${entity === k ? "var(--primary)" : "var(--field-border)"}`, background: entity === k ? "color-mix(in srgb,var(--primary) 12%,transparent)" : "transparent", color: entity === k ? "var(--primary)" : "var(--field-supporting)" }}>
            {k}
          </button>
        ))}
      </div>
      <Pill id="owner" label={owner === "All" ? "Owner" : owner} active={owner !== "All"}>
        <Opt val="All" cur={owner} onSet={onOwner} display="All owners" />
        {OWNERS.map(o => <Opt key={o} val={o} cur={owner} onSet={onOwner} />)}
      </Pill>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
        <Pill id="sort" label={sortBy === "recent" ? "Recently updated" : "Name"} active={false}>
          <Opt val="recent" cur={sortBy} onSet={onSortBy} display="Recently updated" />
          <Opt val="name"   cur={sortBy} onSet={onSortBy} display="Name"             />
        </Pill>
        <button onClick={onToggleDir} style={{ background: "none", border: "1px solid var(--field-border)", borderRadius: 8, padding: "5px 7px", cursor: "pointer", color: "var(--field-supporting)", display: "flex" }}>
          {sortDir === "desc" ? <LucideIcons.ArrowDown size={13} /> : <LucideIcons.ArrowUp size={13} />}
        </button>
      </div>
    </div>
  )
}

// DS-GAP: OverflowMenu — anchored per-card ⋯ menu. Closest DS: Menu + MenuItem.
type OItem = { label: string; icon: keyof typeof LucideIcons; danger?: boolean; onClick: () => void }
function OverflowMenu({ items, onClose }: { items: OItem[]; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
      <div style={{ position: "absolute", top: "calc(100% + 2px)", right: 0, zIndex: 100, background: "var(--surface)", border: "1px solid var(--field-border)", borderRadius: 10, boxShadow: "var(--shadow-elevation-3)", minWidth: 148, padding: 4 }}>
        {items.map(({ label, icon, danger, onClick }) => {
          const Icon = LucideIcons[icon] as React.FC<{ size?: number }>
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

export default function PMThomasDashboardList() {
  const [search,   setSearch]   = useState("")
  const [status,   setStatus]   = useState("All")
  const [entity,   setEntity]   = useState("All")
  const [owner,    setOwner]    = useState("All")
  const [sortBy,   setSortBy]   = useState("recent")
  const [sortDir,  setSortDir]  = useState<"asc" | "desc">("desc")
  const [shown,    setShown]    = useState(PAGE_SIZE)
  const [menuId,   setMenuId]   = useState<string | null>(null)
  const [detailDb, setDetailDb] = useState<Dashboard | null>(null)
  const [deleteDb, setDeleteDb] = useState<Dashboard | null>(null)
  const [dupeDb,   setDupeDb]   = useState<Dashboard | null>(null)
  const [dupeName, setDupeName] = useState("")
  const [dbs,      setDbs]      = useState(DASHBOARDS)

  const publishedCount = dbs.filter(d => d.status === "published").length

  const filtered = dbs.filter(d => {
    if (status !== "All" && d.status !== status)                              return false
    if (entity !== "All" && d.entity !== entity)                              return false
    if (owner  !== "All" && d.owner  !== owner)                               return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()))       return false
    return true
  })

  const sorted = (() => {
    const arr = sortBy === "name" ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : [...filtered]
    return sortDir === "asc" ? arr.reverse() : arr
  })()

  const page    = sorted.slice(0, shown)
  const hasMore = shown < sorted.length

  function handleDelete(id: string) { setDbs(prev => prev.filter(d => d.id !== id)); setDeleteDb(null) }
  function handleDuplicate(source: Dashboard) {
    const newDb: Dashboard = { ...source, id: `d-dup-${Date.now()}`, name: dupeName || `${source.name} (copy)`, status: "draft", updated: "just now" }
    setDbs(prev => [newDb, ...prev]); setDupeDb(null); setDupeName("")
  }

  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas G."
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="dashboards"
      header={isScrolled => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Dashboards"
          description={`${dbs.length} dashboards · ${publishedCount} published`}
          primaryAction={{ label: "Create dashboard", icon: LucideIcons.Sparkles }}
        />
      )}
    >
      <StudioWelcome count={dbs.length} onCta={() => {}} />

      <FilterToolbar
        search={search}   onSearch={setSearch}
        status={status}   onStatus={v => { setStatus(v); setShown(PAGE_SIZE) }}
        entity={entity}   onEntity={v => { setEntity(v); setShown(PAGE_SIZE) }}
        owner={owner}     onOwner={v  => { setOwner(v);  setShown(PAGE_SIZE) }}
        sortBy={sortBy}   onSortBy={setSortBy}
        sortDir={sortDir} onToggleDir={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
      />

      {entity === "Standalone" && (
        <button style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>
          <LucideIcons.FileBarChart size={13} />
          Standalone dashboards are also grouped by collection in Reports
          <LucideIcons.ArrowRight size={12} />
        </button>
      )}

      {sorted.length === 0 ? (
        dbs.length === 0
          ? <EmptyState icon={LucideIcons.LayoutDashboard} title="No dashboards yet"  description="Create your first dashboard and choose where it appears." />
          : <EmptyState icon={LucideIcons.Search}          title="No dashboards found" description="Try a different search or filter." />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px,100%), 1fr))", gap: 12 }}>
            {page.map(d => (
              <div key={d.id} style={{ minHeight: 152, position: "relative", cursor: "pointer" }}>
              <CardContainer
                onClick={e => { if (!(e.target as HTMLElement).closest("button")) setDetailDb(d) }}
                className="h-full flex flex-col gap-[10px]"
              >
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Tag variant={STATUS_VARIANT[d.status]} size="sm">{STATUS_LABEL[d.status]}</Tag>
                  <div style={{ position: "relative" }}>
                    <button onClick={e => { e.stopPropagation(); setMenuId(menuId === d.id ? null : d.id) }} aria-label={`Actions for ${d.name}`} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", padding: "2px 4px", borderRadius: 6, display: "flex" }}>
                      <LucideIcons.MoreHorizontal size={15} />
                    </button>
                    {menuId === d.id && (
                      <OverflowMenu onClose={() => setMenuId(null)} items={[
                        { label: "Open",      icon: "Eye",    onClick: () => setDetailDb(d) },
                        { label: "Edit",      icon: "Pencil", onClick: () => setDetailDb(d) },
                        { label: "Duplicate", icon: "Copy",   onClick: () => { setDupeDb(d); setDupeName(`${d.name} (copy)`) } },
                        { label: "Delete",    icon: "Trash2", danger: true, onClick: () => setDeleteDb(d) },
                      ]} />
                    )}
                  </div>
                </div>
                <div style={{ minWidth: 0, paddingRight: 100 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <Tag variant={d.entity === "Standalone" ? "neutral" : "informative"} size="sm">{d.entity}</Tag>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--field-supporting)", minWidth: 0, overflow: "hidden" }}>
                      <LucideIcons.MapPin size={10} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.placement}</span>
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--field-supporting)", margin: "3px 0 0" }}>Owner · {d.owner}</p>
                </div>
                {d.description && (
                  <p style={{ fontSize: 11, lineHeight: 1.5, color: "var(--field-supporting)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {d.description}
                  </p>
                )}
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--field-border)", paddingTop: 10 }}>
                  <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{d.widgetCount} widgets · {d.audience}</span>
                  <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{d.updated}</span>
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

      {detailDb && (
        <SlideOut title={detailDb.name} open={true} onClose={() => setDetailDb(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px 0" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Tag variant={STATUS_VARIANT[detailDb.status]}>{STATUS_LABEL[detailDb.status]}</Tag>
              <Tag variant={detailDb.entity === "Standalone" ? "neutral" : "informative"}>{detailDb.entity}</Tag>
            </div>
            {[["Placement", detailDb.placement], ["Owner", detailDb.owner], ["Audience", detailDb.audience], ["Widgets", String(detailDb.widgetCount)], ["Updated", detailDb.updated]].map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                <span style={{ width: 90, flexShrink: 0, color: "var(--field-supporting)", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "var(--foreground)" }}>{value}</span>
              </div>
            ))}
            {detailDb.description && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Description</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--foreground)", margin: 0 }}>{detailDb.description}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <Button variant="primary" size="sm">Open dashboard</Button>
              <Button variant="secondary" size="sm">Edit</Button>
            </div>
          </div>
        </SlideOut>
      )}

      {deleteDb && (
        <ModalDialog isOpen={true} onClose={() => setDeleteDb(null)}
          tone="error"
          title={`Delete "${deleteDb.name}"?`}
          description="This dashboard and all its widget placements will be permanently removed. This action cannot be undone."
          ctaPrimary={{ label: "Delete dashboard", destructive: true, onClick: () => handleDelete(deleteDb.id) }}
          ctaSecondary={{ label: "Cancel", onClick: () => setDeleteDb(null) }}
        />
      )}

      {dupeDb && (
        <ModalDialog isOpen={true} onClose={() => { setDupeDb(null); setDupeName("") }}
          title={`Duplicate "${dupeDb.name}"`}
          description="The copy will be saved as a draft. Rename it, then choose its placement."
          ctaPrimary={{ label: "Duplicate", onClick: () => handleDuplicate(dupeDb) }}
          ctaSecondary={{ label: "Cancel", onClick: () => { setDupeDb(null); setDupeName("") } }}
          slot={
            <div style={{ marginTop: 8 }}>
              <Input value={dupeName} onChange={e => setDupeName(e.target.value)} placeholder="Dashboard name" autoFocus />
            </div>
          }
        />
      )}
    </ScreenLayout>
  )
}
