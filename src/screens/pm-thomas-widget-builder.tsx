import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { ModalDialog } from "@/components/ui/modal-dialog"
import type { SidebarItem } from "@/components/ui/sidebar"

// ── Types ─────────────────────────────────────────────────────────────────────

type OpType  = "aggregate" | "record_set"
type TabId   = "data" | "widget" | "appearance"

// ── Data ─────────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home",          label: "Home",          icon: "Home" },
  { id: "dashboards",    label: "My Dashboards", icon: "LayoutDashboard" },
  { id: "widget-library",label: "Widget Library",icon: "Library" },
  { id: "marketplace",   label: "Marketplace",   icon: "Store" },
]

const ENTITY_SOURCES = [
  { id: "contacts_hubspot",      label: "Contacts",       integration: "HubSpot",  governed: true,  hasPII: true },
  { id: "companies_hubspot",     label: "Companies",      integration: "HubSpot",  governed: true,  hasPII: false },
  { id: "deals_hubspot",         label: "Deals",          integration: "HubSpot",  governed: true,  hasPII: false },
  { id: "tickets_zendesk",       label: "Tickets",        integration: "Zendesk",  governed: true,  hasPII: false },
  { id: "conversations_zendesk", label: "Conversations",  integration: "Zendesk",  governed: false, hasPII: true },
  { id: "employees_bamboohr",    label: "Employees",      integration: "BambooHR", governed: true,  hasPII: true },
  { id: "workflows_aims",        label: "Workflows",      integration: "AIMS OS",  governed: true,  hasPII: false },
  { id: "ai_workers_aims",       label: "AI Workers",     integration: "AIMS OS",  governed: true,  hasPII: false },
]

const PRESET_DATASETS = [
  { id: "ds-total-mrr",         name: "Total MRR",              description: "Month-to-date closed revenue across all deals.", integration: "HubSpot",  governed: true },
  { id: "ds-active-contacts",   name: "Active Contacts",        description: "Contacts with at least one interaction in the last 30 days.", integration: "HubSpot",  governed: true },
  { id: "ds-open-deals",        name: "Open Deals",             description: "All deals currently in an open pipeline stage.", integration: "HubSpot",  governed: true },
  { id: "ds-ticket-volume",     name: "Ticket Volume",          description: "Total support tickets opened in the current period.", integration: "Zendesk", governed: true },
  { id: "ds-csat-score",        name: "CSAT Score",             description: "Average satisfaction rating across closed tickets.", integration: "Zendesk", governed: true },
  { id: "ds-headcount",         name: "Headcount",              description: "Active employee count by department.", integration: "BambooHR", governed: true },
  { id: "ds-workflow-success",  name: "Workflow Success Rate",   description: "Percentage of workflow runs completed without errors.", integration: "AIMS OS", governed: true },
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

const WIDGET_TYPES = [
  { id: "kpi",         label: "KPI",         icon: "TrendingUp",  bestFor: "At-a-glance status and headline numbers." },
  { id: "line",        label: "Line",         icon: "LineChart",   bestFor: "Spotting trends and momentum." },
  { id: "bar",         label: "Bar",          icon: "BarChart2",   bestFor: "Comparing groups or stages." },
  { id: "pie",         label: "Pie",          icon: "PieChart",    bestFor: "Showing composition at a glance." },
  { id: "table",       label: "Table",        icon: "Table",       bestFor: "Detailed row-by-row review." },
  { id: "gauge",       label: "Gauge",        icon: "Gauge",       bestFor: "Monitoring against a target in real time." },
  { id: "list",        label: "List",         icon: "List",        bestFor: "Tracking recent items and activity." },
  { id: "heatmap",     label: "Heatmap",      icon: "Grid3X3",     bestFor: "Finding hotspots across two dimensions." },
  { id: "scatter",     label: "Scatter",      icon: "Crosshair",   bestFor: "Correlation and outlier analysis." },
  { id: "summary",     label: "Summary",      icon: "FileText",    bestFor: "Executive summaries and quick context." },
  { id: "map",         label: "Map",          icon: "Map",         bestFor: "Comparing performance across regions." },
  { id: "record-card", label: "Record Card",  icon: "SquareUser",  bestFor: "Show key fields of one entity record." },
]

const FRESHNESS_OPTIONS = [
  { value: "realtime", label: "Real-time (live)" },
  { value: "15m",      label: "Every 15 minutes (fresh)" },
  { value: "1h",       label: "Every hour (fresh)" },
  { value: "24h",      label: "Every day (aging)" },
]

const WIDGET_SIZES = [
  { id: "sm", label: "S" },
  { id: "md", label: "M" },
  { id: "lg", label: "L" },
]

// DS-GAP: AccentColorPalette — widget accent swatches; hex values are product data (displayed to user), not CSS styling. Needs tokenization.
const ACCENT_COLORS = [
  { id: "",       label: "Default",  hex: "transparent" },
  { id: "blue",   label: "Blue",    hex: "#2B7FFF" },
  { id: "green",  label: "Green",   hex: "#22C55E" },
  { id: "amber",  label: "Amber",   hex: "#F59E0B" },
  { id: "red",    label: "Red",     hex: "#EF4444" },
  { id: "purple", label: "Purple",  hex: "#A78BFA" },
]

const STYLE_VARIANTS = [
  { id: "",          label: "Default" },
  { id: "compact",   label: "Compact" },
  { id: "outlined",  label: "Outlined" },
  { id: "minimal",   label: "Minimal" },
]

// ── DS-GAP Components ─────────────────────────────────────────────────────────

// DS-GAP: SectionChip — toggleable pill chip. Closest DS component: Chip.
function SectionChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      height: 30, padding: "0 12px", borderRadius: 15, border: `1px solid ${active ? "var(--primary)" : "var(--field-border)"}`,
      background: active ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
      color: active ? "var(--primary)" : "var(--color-text-subtitle)",
      fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const, display: "inline-flex", alignItems: "center",
    }}>{children}</button>
  )
}

// DS-GAP: SectionLabel — numbered section heading for builder form steps. Closest DS component: none.
function SectionLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--primary)", color: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{n}</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{children}</span>
    </div>
  )
}

// DS-GAP: BuilderTabNav — 3-step tab bar with completion dots and enable/disable gating. Closest DS component: Tabs.
function BuilderTabNav({ tab, setTab, dataComplete, widgetComplete }: { tab: TabId; setTab: (t: TabId) => void; dataComplete: boolean; widgetComplete: boolean }) {
  const tabs: { id: TabId; label: string; n: number; done: boolean; enabled: boolean }[] = [
    { id: "data",       label: "Data",       n: 1, done: dataComplete,   enabled: true },
    { id: "widget",     label: "Widget",     n: 2, done: widgetComplete, enabled: dataComplete },
    { id: "appearance", label: "Appearance", n: 3, done: false,          enabled: widgetComplete },
  ]
  const CheckIcon = LucideIcons.Check as React.FC<{ size?: number }>
  return (
    <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "var(--field-border)", opacity: 0.9 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => t.enabled && setTab(t.id)} disabled={!t.enabled} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 4px",
          borderRadius: 8, border: "none", cursor: t.enabled ? "pointer" : "not-allowed",
          background: tab === t.id ? "var(--surface)" : "transparent",
          opacity: t.enabled ? 1 : 0.35, transition: "all 0.15s",
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
            background: t.done ? "var(--success)" : tab === t.id ? "var(--primary)" : "var(--color-text-subtitle)",
            color: "var(--canvas)",
          }}>
            {t.done ? <CheckIcon size={10} /> : t.n}
          </div>
          <span style={{ fontSize: 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? "var(--color-text-title)" : "var(--color-text-subtitle)" }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// DS-GAP: EntitySourceCard — selectable source tile with integration tag + governance badge. Closest DS component: CardContainer.
function EntitySourceCard({ source, selected, onSelect }: { source: typeof ENTITY_SOURCES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{ cursor: "pointer" }}>
      <CardContainer selected={selected} className="h-full">
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{source.label}</div>
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

// DS-GAP: DatasetCard — selectable pre-built dataset tile with description + governance badge. Closest DS component: CardContainer.
function DatasetCard({ dataset, selected, onSelect }: { dataset: typeof PRESET_DATASETS[0]; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{ cursor: "pointer" }}>
      <CardContainer selected={selected} className="h-full">
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{dataset.name}</div>
          <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", margin: 0, lineHeight: 1.4 }}>{dataset.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Tag variant="informative">{dataset.integration}</Tag>
            <Tag variant="success">Governed</Tag>
          </div>
        </div>
      </CardContainer>
    </div>
  )
}

// DS-GAP: TypeTile — widget type selector tile with icon and label. Closest DS component: CardContainer.
function TypeTile({ type, selected, onSelect }: { type: typeof WIDGET_TYPES[0]; selected: boolean; onSelect: () => void }) {
  const Icon = (LucideIcons as Record<string, unknown>)[type.icon] as React.FC<{ size?: number; style?: React.CSSProperties }>
  return (
    <div onClick={onSelect} style={{ cursor: "pointer" }}>
      <CardContainer selected={selected} className="h-full">
        <div style={{ padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" as const }}>
          <Icon size={18} style={{ color: selected ? "var(--primary)" : "var(--color-text-subtitle)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: selected ? "var(--primary)" : "var(--color-text-title)" }}>{type.label}</span>
        </div>
      </CardContainer>
    </div>
  )
}

// DS-GAP: SkeletonShape — CSS-only skeleton preview shape keyed by widget type. Closest DS component: none.
function SkeletonShape({ typeId, color }: { typeId: string | null; color: string }) {
  const c = color || "var(--primary)"
  const bars = [55, 75, 45, 80, 60, 70, 50, 65]
  if (!typeId) return <div style={{ height: 120, background: "var(--field-border)", borderRadius: 8, opacity: 0.4 }} />
  if (typeId === "kpi" || typeId === "costkpi") return (
    <div style={{ height: 120, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, padding: "0 20px" }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: c, opacity: 0.7 }}>—</div>
      <div style={{ height: 8, width: "40%", background: c, borderRadius: 4, opacity: 0.25 }} />
      <div style={{ height: 24, width: "100%", background: c, borderRadius: 4, opacity: 0.08 }} />
    </div>
  )
  if (typeId === "bar" || typeId === "line") return (
    <div style={{ height: 120, display: "flex", alignItems: "flex-end", gap: 5, padding: "16px 16px 8px" }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? c : "var(--color-text-subtitle)", borderRadius: "2px 2px 0 0", opacity: i === 6 ? 0.75 : 0.18 }} />
      ))}
    </div>
  )
  if (typeId === "pie") return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: `conic-gradient(${c} 0deg 145deg, color-mix(in srgb,${c} 50%, transparent) 145deg 255deg, var(--field-border) 255deg)`, opacity: 0.65 }} />
    </div>
  )
  if (typeId === "gauge") return (
    <div style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6, paddingBottom: 24 }}>
      <div style={{ width: 100, height: 50, borderRadius: "100px 100px 0 0", background: `conic-gradient(from 180deg, ${c} 0deg 110deg, var(--field-border) 110deg 180deg)`, opacity: 0.7 }} />
    </div>
  )
  if (typeId === "heatmap" || typeId === "scatter" || typeId === "map") {
    const cells = [0.8,0.2,0.5,0.9,0.3,0.6,0.1,0.7,0.4,0.8,0.6,0.2,0.9,0.5,0.3,0.7,0.1,0.8,0.4,0.6,0.2,0.9,0.5,0.3]
    return (
      <div style={{ height: 120, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3, padding: "12px 16px" }}>
        {cells.map((o, i) => <div key={i} style={{ borderRadius: 2, background: o > 0.5 ? c : "var(--field-border)", opacity: o }} />)}
      </div>
    )
  }
  return (
    <div style={{ height: 120, display: "flex", flexDirection: "column", gap: 7, padding: "12px 16px" }}>
      {[100, 80, 65, 90, 55].map((w, i) => (
        <div key={i} style={{ height: 10, width: `${w}%`, background: i === 0 ? c : "var(--field-border)", borderRadius: 3, opacity: i === 0 ? 0.5 : 0.25 }} />
      ))}
    </div>
  )
}

// DS-GAP: WidgetPreviewPanel — sticky live preview panel with size switcher and widget info. Closest DS component: CardContainer.
function WidgetPreviewPanel({ typeId, name, sourceId, freshness, accentColor, previewSize, setPreviewSize, saveHint }: {
  typeId: string | null; name: string; sourceId: string | null; freshness: string; accentColor: string;
  previewSize: string; setPreviewSize: (s: string) => void; saveHint: string
}) {
  const entitySrc  = ENTITY_SOURCES.find(s => s.id === sourceId)
  const datasetSrc = PRESET_DATASETS.find(d => d.id === sourceId)
  const srcLabel   = entitySrc?.label ?? datasetSrc?.name ?? null
  const typeInfo = WIDGET_TYPES.find(t => t.id === typeId)
  const maxW = previewSize === "sm" ? 240 : previewSize === "md" ? 420 : undefined
  const freshnessLabel = freshness === "realtime" ? "Live" : freshness === "15m" ? "15m" : freshness === "1h" ? "1h" : "24h"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "var(--color-text-subtitle)" }}>Live preview</span>
        <div style={{ display: "flex", border: "1px solid var(--field-border)", borderRadius: 6, overflow: "hidden" }}>
          {WIDGET_SIZES.map(s => (
            <button key={s.id} onClick={() => setPreviewSize(s.id)} style={{
              padding: "4px 10px", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
              background: previewSize === s.id ? "var(--primary)" : "transparent",
              color: previewSize === s.id ? "var(--canvas)" : "var(--color-text-subtitle)",
            }}>{s.label}</button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: maxW, transition: "max-width 0.2s" }}>
        <CardContainer>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--field-border)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{name || "Untitled widget"}</span>
              <Tag variant={freshness === "realtime" ? "success" : "informative"}>{freshnessLabel}</Tag>
            </div>
            <SkeletonShape typeId={typeId} color={accentColor} />
            <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid var(--field-border)" }}>
              {srcLabel && <Tag variant="informative">{srcLabel}</Tag>}
              {typeInfo && <Tag variant="neutral">{typeInfo.label}</Tag>}
            </div>
          </div>
        </CardContainer>
      </div>
      {typeInfo && (
        <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--field-border)", background: "color-mix(in srgb, var(--primary) 5%, transparent)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>Best for</div>
          <p style={{ fontSize: 12, color: "var(--color-text-subtitle)", margin: 0 }}>{typeInfo.bestFor}</p>
        </div>
      )}
      {saveHint && <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", textAlign: "center" as const, margin: 0 }}>{saveHint}</p>}
    </div>
  )
}

// DS-GAP: SavedConfirmationView — post-save success state with action buttons. Closest DS component: none.
function SavedConfirmationView({ name, onReset }: { name: string; onReset: () => void }) {
  const CheckIcon = LucideIcons.Check as React.FC<{ size?: number; style?: React.CSSProperties }>
  return (
    <div style={{ maxWidth: 420, margin: "48px auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" as const }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckIcon size={28} style={{ color: "var(--canvas)" }} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-title)" }}>Widget saved</div>
        <div style={{ fontSize: 13, color: "var(--color-text-subtitle)", marginTop: 4 }}>Your widget is now in the library.</div>
      </div>
      <div style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--field-border)", background: "var(--canvas)", width: "100%" }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, color: "var(--color-text-subtitle)", marginBottom: 4 }}>Saved as</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>"{name || "Untitled widget"}"</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <Button variant="main">Add to a dashboard</Button>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" onClick={onReset}>New widget</Button>
          <Button variant="secondary">Back to library</Button>
        </div>
      </div>
    </div>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PMThomasWidgetBuilderScreen() {
  // Wizard tabs
  const [tab, setTab]         = useState<TabId>("data")

  // Data tab state
  const [sourceId, setSourceId]         = useState<string | null>(null)
  const [opType, setOpType]             = useState<OpType | null>(null)
  const [calcFn, setCalcFn]             = useState("count")
  const [calcColumn, setCalcColumn]     = useState("")
  const [recordColumns, setRecordColumns] = useState<string[]>([])

  // Widget tab state
  const [typeId, setTypeId]             = useState<string | null>(null)
  const [name, setName]                 = useState("")
  const [subtitle, setSubtitle]         = useState("")
  const [freshness, setFreshness]       = useState("15m")
  const [interactiveFilters, setInteractiveFilters] = useState(true)

  // Appearance tab state
  const [accentColor, setAccentColor]   = useState("")
  const [styleVariant, setStyleVariant] = useState("")

  // UI state
  const [dataMode, setDataMode]         = useState<"entity" | "dataset">("entity")
  const [previewSize, setPreviewSize]   = useState("lg")
  const [saved, setSaved]               = useState(false)
  const [showLeave, setShowLeave]       = useState(false)

  // ── Derived ──

  const dataComplete = dataMode === "dataset"
    ? !!sourceId
    : !!sourceId && !!opType && (opType === "aggregate" ? !!calcColumn.trim() : recordColumns.length > 0)
  const widgetComplete = dataComplete && !!typeId && name.trim().length > 0
  const canSave        = widgetComplete
  const hasUnsaved     = !!(sourceId || typeId || name.trim())

  const saveHint = !sourceId
    ? (dataMode === "dataset" ? "Select a governed dataset on the Data tab." : "Select an entity source on the Data tab.")
    : !dataComplete
    ? "Complete the dataset configuration on the Data tab."
    : !typeId
    ? "Pick a widget type on the Widget tab."
    : !name.trim()
    ? "Name your widget on the Widget tab."
    : ""

  const accentHex = ACCENT_COLORS.find(c => c.id === accentColor)?.hex ?? ""

  // ── Handlers ──

  function selectSource(id: string) {
    if (id === sourceId) return
    setSourceId(id)
    setOpType(null)
    setCalcColumn("")
    setCalcFn("count")
    setRecordColumns([])
  }

  function resetAll() {
    setTab("data"); setDataMode("entity"); setSourceId(null); setOpType(null); setCalcFn("count"); setCalcColumn(""); setRecordColumns([])
    setTypeId(null); setName(""); setSubtitle(""); setFreshness("15m"); setInteractiveFilters(true)
    setAccentColor(""); setStyleVariant(""); setSaved(false)
  }

  const CheckIcon        = LucideIcons.Check        as React.FC<{ size?: number; style?: React.CSSProperties }>
  const ChevronRightIcon = LucideIcons.ChevronRight as React.FC<{ size?: number }>

  const selectStyle = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--field-border)", background: "var(--surface)", color: "var(--color-text-title)", fontSize: 13 }

  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas G."
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="widget-library"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title={saved ? "Widget saved" : "Widget Playground"}
          description={saved ? "Your widget is now in the library." : "Map an entity and metric, pick a type, and preview it live."}
          primaryAction={!saved ? (
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => hasUnsaved ? setShowLeave(true) : undefined}>Cancel</Button>
              {tab === "data" && <Button variant="secondary" size="sm" disabled={!dataComplete} onClick={() => setTab("widget")}>Widget <ChevronRightIcon size={14} /></Button>}
              {tab === "widget" && <Button variant="secondary" size="sm" disabled={!widgetComplete} onClick={() => setTab("appearance")}>Appearance <ChevronRightIcon size={14} /></Button>}
              <Button variant="main" size="sm" disabled={!canSave} onClick={() => setSaved(true)}><CheckIcon size={14} style={{ color: "inherit" }} />Save to catalog</Button>
            </div>
          ) : undefined}
        />
      )}
    >
      {/* ── Success view ── */}
      {saved && <SavedConfirmationView name={name} onReset={resetAll} />}

      {/* ── Builder ── */}
      {!saved && (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Left: build panel */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* DS-GAP: DescribeComposer — natural-language widget setup generator. Using simplified Input bar. */}
            <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--field-border)", display: "flex", gap: 8 }}>
              <Input placeholder='Describe your widget… e.g. "Win Rate gauge by team"' />
              <Button variant="secondary" size="sm">Generate</Button>
            </div>

            <BuilderTabNav tab={tab} setTab={setTab} dataComplete={dataComplete} widgetComplete={widgetComplete} />

            {/* ── Tab 1: Data ── */}
            {tab === "data" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <SectionLabel n={1}>Data source type</SectionLabel>
                  <div style={{ display: "flex", gap: 8 }}>
                    <SectionChip active={dataMode === "entity"} onClick={() => { setDataMode("entity"); setSourceId(null); setOpType(null); setCalcColumn(""); setCalcFn("count"); setRecordColumns([]) }}>Entity source</SectionChip>
                    <SectionChip active={dataMode === "dataset"} onClick={() => { setDataMode("dataset"); setSourceId(null); setOpType(null); setCalcColumn(""); setCalcFn("count"); setRecordColumns([]) }}>Governed dataset</SectionChip>
                  </div>
                </div>

                {dataMode === "entity" && (
                  <div>
                    <SectionLabel n={2}>Entity source</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {ENTITY_SOURCES.map(src => (
                        <EntitySourceCard key={src.id} source={src} selected={sourceId === src.id} onSelect={() => selectSource(src.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {dataMode === "dataset" && (
                  <div>
                    <SectionLabel n={2}>Governed dataset</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {PRESET_DATASETS.map(ds => (
                        <DatasetCard key={ds.id} dataset={ds} selected={sourceId === ds.id} onSelect={() => setSourceId(ds.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {sourceId && dataMode === "entity" && (
                  <div>
                    <SectionLabel n={3}>Operation type</SectionLabel>
                    <div style={{ display: "flex", gap: 8 }}>
                      <SectionChip active={opType === "aggregate"} onClick={() => { setOpType("aggregate"); setRecordColumns([]) }}>Aggregate</SectionChip>
                      <SectionChip active={opType === "record_set"} onClick={() => { setOpType("record_set"); setCalcColumn(""); setCalcFn("count") }}>Record set</SectionChip>
                    </div>
                  </div>
                )}

                {sourceId && dataMode === "entity" && opType === "aggregate" && (
                  <div>
                    <SectionLabel n={4}>Calculation</SectionLabel>
                    <div style={{ display: "flex", gap: 8 }}>
                      <select value={calcFn} onChange={e => setCalcFn(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
                        {["count", "sum", "avg", "max", "min"].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                      </select>
                      <Input placeholder="Column, e.g. Amount" value={calcColumn} onChange={e => setCalcColumn(e.target.value)} />
                    </div>
                  </div>
                )}

                {sourceId && dataMode === "entity" && opType === "record_set" && (
                  <div>
                    <SectionLabel n={4}>Exposed columns</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(SOURCE_COLUMNS[sourceId] ?? []).map(col => (
                        <label key={col} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--color-text-title)" }}>
                          <input type="checkbox" checked={recordColumns.includes(col)} onChange={e => setRecordColumns(prev => e.target.checked ? [...prev, col] : prev.filter(c => c !== col))} />
                          {col}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {dataComplete && (
                  <Button variant="main" onClick={() => setTab("widget")}>Continue to Widget →</Button>
                )}
              </div>
            )}

            {/* ── Tab 2: Widget ── */}
            {tab === "widget" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <SectionLabel n={1}>Widget type</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {WIDGET_TYPES.map(t => (
                      <TypeTile key={t.id} type={t} selected={typeId === t.id} onSelect={() => setTypeId(t.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel n={2}>Configure</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Input placeholder="Widget name, e.g. Pipeline by Stage" value={name} onChange={e => setName(e.target.value)} />
                    <Input placeholder="Description (optional, ≤120 chars)" value={subtitle} onChange={e => setSubtitle(e.target.value.slice(0, 120))} />
                    <select value={freshness} onChange={e => setFreshness(e.target.value)} style={selectStyle}>
                      {FRESHNESS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--color-text-title)" }}>
                      <input type="checkbox" checked={interactiveFilters} onChange={e => setInteractiveFilters(e.target.checked)} />
                      Let end users filter this widget
                    </label>
                    <div style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--field-border)", background: "var(--canvas)" }}>
                      <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", margin: 0 }}>Need advanced transformations or custom SQL?{" "}
                        <a href="#" style={{ color: "var(--primary)", fontWeight: 600 }}>View in Metabase ↗</a>
                      </p>
                    </div>
                  </div>
                </div>

                {widgetComplete && (
                  <Button variant="secondary" onClick={() => setTab("appearance")}>Configure Appearance →</Button>
                )}
              </div>
            )}

            {/* ── Tab 3: Appearance ── */}
            {tab === "appearance" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <SectionLabel n={1}>Accent color</SectionLabel>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    {ACCENT_COLORS.map(c => (
                      <button key={c.id} onClick={() => setAccentColor(c.id)} title={c.label} style={{
                        width: 30, height: 30, borderRadius: "50%", border: `2px solid ${accentColor === c.id ? "var(--primary)" : "var(--field-border)"}`,
                        background: c.hex === "transparent" ? "var(--field-border)" : c.hex, cursor: "pointer",
                      }} />
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel n={2}>Style variant</SectionLabel>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    {STYLE_VARIANTS.map(v => (
                      <SectionChip key={v.id} active={styleVariant === v.id} onClick={() => setStyleVariant(v.id)}>{v.label}</SectionChip>
                    ))}
                  </div>
                </div>

                {canSave && (
                  <Button variant="main" onClick={() => setSaved(true)}><CheckIcon size={14} style={{ color: "inherit" }} />Save to catalog</Button>
                )}
              </div>
            )}
          </div>

          {/* Right: sticky preview */}
          <div style={{ width: "44%", flexShrink: 0, position: "sticky", top: 0 }}>
            <WidgetPreviewPanel
              typeId={typeId}
              name={name}
              sourceId={sourceId}
              freshness={freshness}
              accentColor={accentHex}
              previewSize={previewSize}
              setPreviewSize={setPreviewSize}
              saveHint={saveHint}
            />
          </div>
        </div>
      )}

      {/* ── Leave confirmation modal ── */}
      <ModalDialog
        isOpen={showLeave}
        onClose={() => setShowLeave(false)}
        tone="warning"
        title="Leave without saving?"
        description="Your widget isn't saved yet. If you leave now, your configuration will be lost."
        ctaPrimary={{ label: "Leave without saving", destructive: true, onClick: resetAll }}
        ctaSecondary={{ label: "Keep editing", onClick: () => setShowLeave(false) }}
      />
    </ScreenLayout>
  )
}
