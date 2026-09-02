import { useState, useRef, useCallback } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Input } from "@/components/ui/input"
import type { SidebarItem } from "@/components/ui/sidebar"

// ── Types ─────────────────────────────────────────────────────────────────────

type DashStatus = "published" | "draft" | "pending"
type EntityKind = "Company" | "Contact" | "Employee" | "Deal" | "Standalone"

export type CanvasDash = {
  id: string; name: string; status: DashStatus; entity: EntityKind
  placement: string; owner: string; widgetCount: number
  audience: string; updated: string; description: string
}

type ColSpan = 1 | 2 | 3

type PlacedWidget = {
  uid: string
  name: string
  source: string
  skeleton: string
  colSpan: ColSpan
  locked: boolean
  freshness: "live" | "fresh" | "stale"
}

// ── Sample seed widgets per entity type ───────────────────────────────────────

const SEED_WIDGETS: Record<string, Omit<PlacedWidget, "uid" | "locked">[]> = {
  Company: [
    { name: "Total Deals",        source: "HubSpot — Deals",     skeleton: "KPI",   colSpan: 1, freshness: "live" },
    { name: "Pipeline Value",     source: "HubSpot — Deals",     skeleton: "KPI",   colSpan: 1, freshness: "fresh" },
    { name: "Open Tickets",       source: "Zendesk — Tickets",   skeleton: "KPI",   colSpan: 1, freshness: "live" },
    { name: "Deal Stage Funnel",  source: "HubSpot — Deals",     skeleton: "Chart", colSpan: 2, freshness: "fresh" },
    { name: "Recent Activity",    source: "HubSpot — Contacts",  skeleton: "Feed",  colSpan: 1, freshness: "live" },
  ],
  Contact: [
    { name: "Engagement Score",   source: "HubSpot — Contacts",  skeleton: "KPI",   colSpan: 1, freshness: "live" },
    { name: "Open Tickets",       source: "Zendesk — Tickets",   skeleton: "KPI",   colSpan: 1, freshness: "live" },
    { name: "Activity Timeline",  source: "HubSpot — Contacts",  skeleton: "Feed",  colSpan: 3, freshness: "fresh" },
  ],
  Employee: [
    { name: "Goal Progress",      source: "BambooHR — Goals",    skeleton: "Gauge", colSpan: 1, freshness: "fresh" },
    { name: "Tasks Completed",    source: "AIMS OS — Tasks",     skeleton: "KPI",   colSpan: 1, freshness: "live" },
    { name: "Headcount by Dept",  source: "BambooHR — Employees",skeleton: "Chart", colSpan: 3, freshness: "fresh" },
  ],
  Deal: [
    { name: "Deal Value",         source: "HubSpot — Deals",     skeleton: "KPI",   colSpan: 1, freshness: "live" },
    { name: "Days in Stage",      source: "HubSpot — Deals",     skeleton: "KPI",   colSpan: 1, freshness: "fresh" },
    { name: "Stage Velocity",     source: "HubSpot — Deals",     skeleton: "Chart", colSpan: 2, freshness: "fresh" },
    { name: "Related Contacts",   source: "HubSpot — Contacts",  skeleton: "Feed",  colSpan: 1, freshness: "live" },
  ],
  Standalone: [
    { name: "AI Workers Active",  source: "AIMS OS — Workers",   skeleton: "KPI",   colSpan: 1, freshness: "live" },
    { name: "Credits Consumed",   source: "AIMS OS — Credits",   skeleton: "KPI",   colSpan: 1, freshness: "live" },
    { name: "Worker Summary",     source: "AIMS OS — Workers",   skeleton: "Chart", colSpan: 3, freshness: "live" },
  ],
}

// ── Library widgets available to pick ─────────────────────────────────────────

const LIBRARY_PICKS = [
  { id: "lp-1", name: "Contacts by Tier",    source: "HubSpot",    skeleton: "Chart",   freshness: "fresh" as const },
  { id: "lp-2", name: "CSAT Score",          source: "Zendesk",    skeleton: "Gauge",   freshness: "live"  as const },
  { id: "lp-3", name: "Total MRR",           source: "HubSpot",    skeleton: "KPI",     freshness: "live"  as const },
  { id: "lp-4", name: "Headcount",           source: "BambooHR",   skeleton: "Chart",   freshness: "fresh" as const },
  { id: "lp-5", name: "Ticket Volume",       source: "Zendesk",    skeleton: "KPI",     freshness: "live"  as const },
  { id: "lp-6", name: "Deals Pipeline",      source: "HubSpot",    skeleton: "Chart",   freshness: "fresh" as const },
  { id: "lp-7", name: "AI Worker Errors",    source: "AIMS OS",    skeleton: "Alerts",  freshness: "live"  as const },
  { id: "lp-8", name: "All Contacts",        source: "HubSpot",    skeleton: "Feed",    freshness: "fresh" as const },
]

// ── Sidebar items ──────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "dashboards", label: "Dashboards",    icon: "LayoutDashboard" },
  { id: "widgets",    label: "Widgets",       icon: "PieChart" },
]

// ── Micro-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DashStatus }) {
  const map = { published: ["success", "Published"], draft: ["informative", "Draft"], pending: ["alert", "Pending"] } as const
  return <Tag variant={map[status][0] as "success" | "informative" | "alert"} size="sm">{map[status][1]}</Tag>
}

function FreshnessBadge({ f }: { f: PlacedWidget["freshness"] }) {
  if (f === "live")  return <Tag variant="success" size="sm">Live</Tag>
  if (f === "fresh") return null
  return <Tag variant="neutral" size="sm">Stale</Tag>
}

// Maps skeleton → a visual sketch using simple SVG shapes inside the tile
function WidgetSketch({ skeleton, colSpan }: { skeleton: string; colSpan: ColSpan }) {
  const h = colSpan === 1 ? 80 : 60
  const color = "var(--field-border)"
  switch (skeleton) {
    case "KPI": return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 }}>
        <div style={{ height: 28, width: "55%", borderRadius: 4, background: color, opacity: 0.6 }} />
        <div style={{ height: 12, width: "35%", borderRadius: 3, background: color, opacity: 0.35 }} />
      </div>
    )
    case "Gauge": return (
      <svg width={h} height={h / 1.5} viewBox="0 0 80 50">
        <path d="M10 45 A35 35 0 0 1 70 45" fill="none" stroke="var(--field-border)" strokeWidth="6" strokeLinecap="round" />
        <path d="M10 45 A35 35 0 0 1 48 14" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
        <circle cx="40" cy="45" r="4" fill="var(--primary)" opacity="0.6" />
      </svg>
    )
    case "Chart": return (
      <svg width="100%" height={h} viewBox="0 0 200 60" preserveAspectRatio="none">
        {[20,40,30,55,25,50,35,48,42,38].map((v, i) => (
          <rect key={i} x={i*20+2} y={60-v} width={16} height={v} rx={2} fill="var(--primary)" opacity="0.35" />
        ))}
      </svg>
    )
    case "Feed": return (
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[90, 75, 60].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", opacity: 0.5 }} />
            <div style={{ height: 8, width: `${w}%`, borderRadius: 3, background: color, opacity: 0.4 }} />
          </div>
        ))}
      </div>
    )
    case "Donut": return (
      <svg width={h} height={h} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="22" fill="none" stroke="var(--field-border)" strokeWidth="10" />
        <circle cx="30" cy="30" r="22" fill="none" stroke="var(--primary)" strokeWidth="10" opacity="0.5"
          strokeDasharray="80 58" strokeLinecap="round" transform="rotate(-90 30 30)" />
      </svg>
    )
    default: return (
      <div style={{ height: h, display: "flex", flexDirection: "column", gap: 4 }}>
        {[100, 80, 90, 70].slice(0, colSpan === 3 ? 4 : 2).map((w, i) => (
          <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 3, background: color, opacity: 0.35 }} />
        ))}
      </div>
    )
  }
}

// ── Add Widget Picker modal ────────────────────────────────────────────────────

function AddWidgetModal({ onAdd, onClose }: {
  onAdd: (w: typeof LIBRARY_PICKS[0]) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState("")
  const filtered = LIBRARY_PICKS.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <ModalDialog isOpen onClose={onClose} title="Add widget" variant="content"
      slot={
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <LucideIcons.Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--field-supporting)" }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search widgets…"
              style={{ paddingLeft: 30, height: 32, fontSize: 13, width: "100%" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 320, overflowY: "auto" }}>
            {filtered.map(w => (
              <button key={w.id} onClick={() => { onAdd(w); onClose() }} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 8, border: "1px solid var(--field-border)", background: "var(--surface)",
                cursor: "pointer", textAlign: "left",
              }}>
                <LucideIcons.BarChart2 size={14} style={{ color: "var(--field-supporting)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: "var(--field-supporting)" }}>{w.source} · {w.skeleton}</div>
                </div>
                <FreshnessBadge f={w.freshness} />
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--field-supporting)", fontSize: 13 }}>No widgets match</div>
            )}
          </div>
        </div>
      }
    />
  )
}

// ── Publish modal ──────────────────────────────────────────────────────────────

function PublishModal({ dashName, audience, onPublish, onClose }: {
  dashName: string; audience: string
  onPublish: () => void; onClose: () => void
}) {
  const checks = [
    { label: "All widgets have a valid data source", ok: true },
    { label: "Audience is configured",               ok: audience !== "" },
    { label: "Dashboard name is set",                ok: dashName.trim() !== "" },
    { label: "Placed in a valid section",             ok: true },
  ]
  const allOk = checks.every(c => c.ok)
  return (
    <ModalDialog isOpen onClose={onClose} title="Publish dashboard" variant="content"
      ctaPrimary={{ label: "Publish", onClick: onPublish }}
      ctaSecondary={{ label: "Cancel", onClick: onClose }}
      slot={
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: "var(--field-supporting)" }}>
            Publishing makes this dashboard visible to: <strong style={{ color: "var(--foreground)" }}>{audience}</strong>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {checks.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                {c.ok
                  ? <LucideIcons.CheckCircle2 size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                  : <LucideIcons.XCircle      size={14} style={{ color: "var(--error)",   flexShrink: 0 }} />}
                <span style={{ color: c.ok ? "var(--foreground)" : "var(--error)" }}>{c.label}</span>
              </div>
            ))}
          </div>
          {!allOk && (
            <div style={{ fontSize: 12, color: "var(--error)", padding: "8px 10px", borderRadius: 6, background: "color-mix(in srgb, var(--error) 8%, var(--surface))", border: "1px solid var(--error)" }}> {/* audit-ignore: color-mix */}
              Fix the issues above before publishing.
            </div>
          )}
        </div>
      }
    />
  )
}

// ── Per-widget settings panel ──────────────────────────────────────────────────

function WidgetSettingsPanel({ widget, onClose, onRemove, onColSpanChange, onLockToggle }: {
  widget: PlacedWidget
  onClose: () => void
  onRemove: () => void
  onColSpanChange: (cs: ColSpan) => void
  onLockToggle: () => void
}) {
  return (
    <div style={{
      position: "fixed", top: 0, right: 0, width: 280, height: "100vh",
      background: "var(--surface)", borderLeft: "1px solid var(--field-border)",
      zIndex: 500, display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid var(--field-border)" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Widget settings</div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", display: "flex" }}>
          <LucideIcons.X size={16} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--field-supporting)", marginBottom: 6 }}>Name</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{widget.name}</div>
          <div style={{ fontSize: 12, color: "var(--field-supporting)", marginTop: 2 }}>{widget.source}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--field-supporting)", marginBottom: 8 }}>Width</div>
          <div style={{ display: "flex", gap: 4 }}>
            {([1, 2, 3] as ColSpan[]).map(n => (
              <button key={n} onClick={() => onColSpanChange(n)} style={{
                flex: 1, padding: "6px 0", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${widget.colSpan === n ? "var(--primary)" : "var(--field-border)"}`,
                background: widget.colSpan === n ? "var(--primary)" : "var(--surface)",
                color: widget.colSpan === n ? "var(--on-primary, white)" : "var(--foreground)", // audit-ignore: white keyword fallback
              }}>{n === 1 ? "⅓" : n === 2 ? "⅔" : "Full"}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--field-supporting)", marginBottom: 8 }}>Type</div>
          <Tag variant="neutral" size="sm">{widget.skeleton}</Tag>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--field-supporting)", marginBottom: 8 }}>Freshness</div>
          <FreshnessBadge f={widget.freshness} />
          {widget.freshness === "fresh" && <Tag variant="informative" size="sm">Fresh</Tag>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={onLockToggle} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8,
            border: "1px solid var(--field-border)", background: "var(--surface)", cursor: "pointer", fontSize: 13, color: "var(--foreground)",
          }}>
            {widget.locked
              ? <LucideIcons.Lock   size={13} style={{ color: "var(--alert)" }} />
              : <LucideIcons.Unlock size={13} style={{ color: "var(--field-supporting)" }} />}
            {widget.locked ? "Locked — click to unlock" : "Unlocked — click to lock"}
          </button>
        </div>
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--field-border)" }}>
        <button onClick={onRemove} style={{
          width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid var(--error)",
          background: "none", color: "var(--error)", fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <LucideIcons.Trash2 size={13} />
          Remove from dashboard
        </button>
      </div>
    </div>
  )
}

// ── Placed widget tile ─────────────────────────────────────────────────────────

function WidgetTile({
  widget, onSettings, onDragStart, onDragOver, onDrop, isDragging, isDragOver,
}: {
  widget: PlacedWidget
  onSettings: () => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  isDragging: boolean
  isDragOver: boolean
}) {
  const colClass = widget.colSpan === 1 ? "col-span-1" : widget.colSpan === 2 ? "col-span-2" : "col-span-3"
  return (
    <div
      className={colClass}
      draggable={!widget.locked}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        opacity: isDragging ? 0.4 : 1,
        outline: isDragOver ? "2px dashed var(--primary)" : "none",
        outlineOffset: 4,
        borderRadius: 12,
        transition: "opacity 0.15s, outline 0.1s",
      }}
    >
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContainer size="sm" className="flex flex-col gap-2 h-full">
          {/* Tile header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              {!widget.locked && (
                <LucideIcons.GripVertical size={12} style={{ color: "var(--field-supporting)", cursor: "grab", flexShrink: 0 }} />
              )}
              {widget.locked && (
                <LucideIcons.Lock size={11} style={{ color: "var(--alert)", flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {widget.name}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <FreshnessBadge f={widget.freshness} />
              <button onClick={onSettings} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", padding: "1px 2px", borderRadius: 6, display: "flex" }}>
                <LucideIcons.Settings2 size={13} />
              </button>
            </div>
          </div>
          {/* Sketch */}
          <WidgetSketch skeleton={widget.skeleton} colSpan={widget.colSpan} />
          {/* Source */}
          <div style={{ fontSize: 11, color: "var(--field-supporting)", marginTop: "auto" }}>{widget.source}</div>
        </CardContainer>
      </div>
    </div>
  )
}

// ── Main canvas screen ─────────────────────────────────────────────────────────

export default function DashboardCanvasScreen({ dash, onBack }: {
  dash: CanvasDash
  onBack: () => void
}) {
  const seedKey = dash.entity as keyof typeof SEED_WIDGETS
  const seedData = SEED_WIDGETS[seedKey] ?? SEED_WIDGETS.Standalone

  const [widgets, setWidgets] = useState<PlacedWidget[]>(
    () => seedData.map((w, i) => ({ ...w, uid: `w-${i}`, locked: false }))
  )
  const [dashName, setDashName]     = useState(dash.name)
  const [status, setStatus]         = useState<DashStatus>(dash.status)
  const [saveState, setSaveState]   = useState<"idle" | "saving" | "saved">("idle")
  const [dirty, setDirty]           = useState(false)
  const [settingsW, setSettingsW]   = useState<PlacedWidget | null>(null)
  const [addOpen, setAddOpen]       = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [tipDismissed, setTipDismissed] = useState(false)
  const [editNameMode, setEditNameMode] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  // drag-and-drop state
  const dragIdx = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  function markDirty() { setDirty(true); setSaveState("idle") }

  function simulateSave() {
    setSaveState("saving")
    setTimeout(() => { setSaveState("saved"); setDirty(false) }, 800)
  }

  function handlePublish() {
    setStatus("published")
    setPublishOpen(false)
    simulateSave()
  }

  function handleAddWidget(w: typeof LIBRARY_PICKS[0]) {
    setWidgets(ws => [...ws, {
      uid: `w-added-${Date.now()}`, name: w.name, source: w.source,
      skeleton: w.skeleton, colSpan: 1, locked: false, freshness: w.freshness,
    }])
    markDirty()
  }

  function updateWidget(uid: string, changes: Partial<PlacedWidget>) {
    setWidgets(ws => ws.map(w => w.uid === uid ? { ...w, ...changes } : w))
    markDirty()
  }

  function removeWidget(uid: string) {
    setWidgets(ws => ws.filter(w => w.uid !== uid))
    if (settingsW?.uid === uid) setSettingsW(null)
    markDirty()
  }

  const handleDragStart = useCallback((i: number) => { dragIdx.current = i }, [])
  const handleDragOver  = useCallback((e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIdx(i) }, [])
  const handleDrop      = useCallback((toIdx: number) => {
    if (dragIdx.current === null || dragIdx.current === toIdx) { setDragOverIdx(null); return }
    setWidgets(ws => {
      const arr = [...ws]
      const [moved] = arr.splice(dragIdx.current!, 1)
      arr.splice(toIdx, 0, moved)
      return arr
    })
    dragIdx.current = null
    setDragOverIdx(null)
    markDirty()
  }, [])

  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "saved" ? "All changes saved" : dirty ? "Unsaved changes" : "All changes saved"
  const saveLabelColor = dirty ? "var(--alert)" : "var(--field-supporting)"

  return (
    <ScreenLayout
      workspaceName="Meridian Corp"
      userName="Thomas G."
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="dashboards"
      onSidebarItemClick={onBack}
      header={(_isScrolled) => (
        <Header
          size="compress"
          title={editNameMode ? "" : dashName}
          tag={<StatusBadge status={status} />}
          secondaryAction={
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {editNameMode && (
                <input
                  ref={nameRef}
                  value={dashName}
                  onChange={e => { setDashName(e.target.value); markDirty() }}
                  onBlur={() => setEditNameMode(false)}
                  onKeyDown={e => { if (e.key === "Enter") setEditNameMode(false) }}
                  autoFocus
                  style={{
                    fontSize: 14, fontWeight: 600, color: "var(--foreground)", background: "transparent",
                    border: "none", borderBottom: "1px solid var(--primary)", outline: "none", minWidth: 180,
                  }}
                />
              )}
              {!editNameMode && (
                <button onClick={() => setEditNameMode(true)} style={{ background: "none", border: "none", cursor: "text", color: "var(--field-supporting)", display: "flex", padding: "2px 4px" }}>
                  <LucideIcons.Pencil size={12} />
                </button>
              )}
              <span style={{ fontSize: 11, color: saveLabelColor }}>{saveLabel}</span>
            </div>
          }
          primaryAction={
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 8px" }}>
                <LucideIcons.ArrowLeft size={13} />
                Dashboards
              </button>
              <div style={{ width: 1, height: 14, background: "var(--field-border)" }} />
              <Button variant="secondary" size="sm" onClick={simulateSave}>Save</Button>
              {status === "published"
                ? <Button variant="secondary" size="sm" onClick={() => setPublishOpen(true)}>Re-publish</Button>
                : <Button variant="main"      size="sm" onClick={() => setPublishOpen(true)}>Publish</Button>
              }
            </div>
          }
        />
      )}
    >
      {/* Tip bar */}
      {!tipDismissed && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8,
          background: "color-mix(in srgb, var(--primary) 6%, var(--surface))", border: "1px solid var(--field-border)", marginBottom: 16 }}> {/* audit-ignore: color-mix */}
          <LucideIcons.Info size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--field-supporting)", flex: 1 }}>
            Drag tiles to reorder them. Click <strong>⚙</strong> on any widget to change its width or remove it.
          </span>
          <button onClick={() => setTipDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--field-supporting)", display: "flex" }}>
            <LucideIcons.X size={13} />
          </button>
        </div>
      )}

      {/* Entity context chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        <LucideIcons.MapPin size={12} style={{ color: "var(--field-supporting)" }} />
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{dash.entity} — {dash.placement}</span>
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>·</span>
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{dash.audience}</span>
      </div>

      {/* Widget grid — 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}
        onDragEnd={() => { dragIdx.current = null; setDragOverIdx(null) }}>
        {widgets.map((w, i) => (
          <WidgetTile
            key={w.uid}
            widget={w}
            onSettings={() => setSettingsW(w)}
            onDragStart={() => handleDragStart(i)}
            onDragOver={e => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            isDragging={dragIdx.current === i}
            isDragOver={dragOverIdx === i}
          />
        ))}

        {/* Add widget card */}
        <div>
          <button onClick={() => setAddOpen(true)} style={{
            width: "100%", minHeight: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "20px 16px", borderRadius: 12, border: "2px dashed var(--field-border)",
            background: "transparent", cursor: "pointer", color: "var(--field-supporting)",
          }}>
            <LucideIcons.Plus size={20} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Add widget</span>
          </button>
        </div>
      </div>

      {/* Unpublished banner when published but dirty */}
      {status === "published" && dirty && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 200,
          display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10,
          background: "var(--surface)", border: "1px solid var(--alert)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}> {/* audit-ignore: standard elevation shadow */}
          <LucideIcons.AlertCircle size={14} style={{ color: "var(--alert)" }} />
          <span style={{ fontSize: 13, color: "var(--foreground)" }}>You have unpublished changes.</span>
          <Button variant="main" size="sm" onClick={() => setPublishOpen(true)}>Re-publish</Button>
        </div>
      )}

      {/* Modals */}
      {addOpen     && <AddWidgetModal onAdd={handleAddWidget} onClose={() => setAddOpen(false)} />}
      {publishOpen && <PublishModal dashName={dashName} audience={dash.audience} onPublish={handlePublish} onClose={() => setPublishOpen(false)} />}

      {/* Settings panel */}
      {settingsW && (
        <WidgetSettingsPanel
          widget={settingsW}
          onClose={() => setSettingsW(null)}
          onRemove={() => removeWidget(settingsW.uid)}
          onColSpanChange={cs => { updateWidget(settingsW.uid, { colSpan: cs }); setSettingsW(w => w ? { ...w, colSpan: cs } : null) }}
          onLockToggle={() => { updateWidget(settingsW.uid, { locked: !settingsW.locked }); setSettingsW(w => w ? { ...w, locked: !w.locked } : null) }}
        />
      )}
    </ScreenLayout>
  )
}
