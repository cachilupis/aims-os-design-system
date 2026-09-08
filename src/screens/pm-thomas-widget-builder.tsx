import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContainer } from "@/components/ui/card-container"
import { WidgetFather } from "@/components/ui/widget-father"
import { SwitchTab } from "@/components/ui/switch-tab"
import { StepperNavFooter } from "@/components/ui/stepper-nav-footer"
import { WidgetPreview } from "@/components/experimental/widget-preview"
import { AUTHORABLE_WIDGETS, AUTHORABLE_BY_CATEGORY, type WidgetCategory } from "@/lib/widget-catalog"
import { Tag } from "@/components/ui/tag"
import { Chip } from "@/components/ui/chip"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import { Menu, MenuItem, MenuDivider } from "@/components/ui/menu-item"
import { anchorFromEvent, useDropdownPosition, type DropdownAnchor } from "@/lib/dropdown-anchor"
import { EmptyState } from "@/components/ui/empty-state"
import { ModalDialog } from "@/components/ui/modal-dialog"
import type { SidebarItem } from "@/components/ui/sidebar"
import { OptionCard } from "@/components/experimental/widget-screen-parts"

// ── Types ─────────────────────────────────────────────────────────────────────

type OpType  = "aggregate" | "record_set"
type TabId   = "data" | "configure"

// ── Data ─────────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home",          label: "Home",          icon: "Home" },
  { id: "dashboards",    label: "My Dashboards", icon: "LayoutDashboard" },
  { id: "widget-library",label: "Widget Library",icon: "Library" },
  { id: "marketplace",   label: "Marketplace",   icon: "Store" },
]

// The three entities Thom's prototype offers, with his column counts. Ours
// listed eight across four integrations, which reads as a fuller product than
// the one being demoed — a prototype that promises more than it has is the
// same defect as a button that does nothing.
const ENTITY_SOURCES = [
  { id: "contacts_salesforce", label: "Contacts", icon: "Users",      desc: "CRM contact profiles and relationship history",   integration: "Salesforce", columns: 9, governed: true,  hasPII: true  },
  { id: "accounts_salesforce", label: "Accounts", icon: "Building2",  desc: "Organization records, domains, and account data", integration: "Salesforce", columns: 7, governed: true,  hasPII: false },
  { id: "deals_salesforce",    label: "Deals",    icon: "TrendingUp", desc: "Pipeline opportunities and deal stages",          integration: "Salesforce", columns: 7, governed: true,  hasPII: false },
]

// Thom's four datasets. The `shape` is the part that matters: a dataset arrives
// already aggregated, and its shape is what says whether it is one number, a
// grouping, or raw rows — which is also why the dataset path never asks for a
// calculation. That question was answered when the dataset was built.
const PRESET_DATASETS = [
  { id: "ds-contacts-by-tier", name: "Contacts by Tier", description: "Count of contacts grouped by tier (Gold, Silver, Bronze)", shape: "Grouped",      integration: "Salesforce", governed: true },
  { id: "ds-deals-pipeline",   name: "Deals Pipeline",   description: "Sum of deal value grouped by stage",                       shape: "Grouped",      integration: "Salesforce", governed: true },
  { id: "ds-total-mrr",        name: "Total MRR",        description: "Sum of MRR across all active accounts",                    shape: "Single value", integration: "Salesforce", governed: true },
  { id: "ds-all-contacts",     name: "All Contacts",     description: "Full contact record set — name, email, city, tier",        shape: "Record set",   integration: "Salesforce", governed: true },
]

/** Every integration the entity list draws from, derived rather than typed out
 *  so adding an entity cannot leave the filter row behind. */
const INTEGRATIONS: string[] = [...new Set(ENTITY_SOURCES.map(s => s.integration))]

const FILTER_OPS = ["is", "is not", "contains", "is empty", "is not empty", "greater than", "less than"]

/**
 * A column is not just a name.
 *
 * The picker used to be a list of nine checkboxes reading "Name, Email, Phone,
 * City…" — enough to recognise a field you already knew and useless for one you
 * did not. `Tier` means nothing until something says it is Gold/Silver/Bronze,
 * and `state` and `State / Region` are the same field under two names, which is
 * the kind of thing that sends someone to ask an engineer.
 *
 * So every column carries four facts: the label a person reads, its `type`
 * (which is also what the type filter sorts on), a sentence saying what it
 * holds, and the `key` the data actually uses — the one you would search for.
 * Every label, type, sentence and key here is read off Thom's prototype rather
 * than written fresh — the copy is already validated, and two descriptions for
 * the same field is exactly the drift this table exists to prevent.
 */
type ColumnType = "Text" | "Number" | "Date"
type ColumnDef  = { label: string; type: ColumnType; desc: string; key: string }

const COLUMN_TYPES: ColumnType[] = ["Text", "Number", "Date"]

const SOURCE_COLUMN_DEFS: Record<string, ColumnDef[]> = {
  contacts_salesforce: [
    { label: "Name",           type: "Text",   desc: "Full name of the record",                        key: "name" },
    { label: "Email",          type: "Text",   desc: "Primary email address",                          key: "email" },
    { label: "Phone",          type: "Text",   desc: "Primary phone number",                           key: "phone" },
    { label: "City",           type: "Text",   desc: "City from the billing or main address",          key: "city" },
    { label: "State / Region", type: "Text",   desc: "State or region",                                key: "state" },
    { label: "Tier",           type: "Text",   desc: "Account or contact tier (Gold, Silver, Bronze)", key: "tier" },
    { label: "Score",          type: "Number", desc: "Lead or engagement score (0–100)",               key: "score" },
    { label: "Lead Source",    type: "Text",   desc: "Channel where the lead originated",              key: "lead_source" },
    { label: "Created At",     type: "Date",   desc: "Date and time the record was created",           key: "created_at" },
  ],
  accounts_salesforce: [
    { label: "Name",       type: "Text",   desc: "Full name of the record",                        key: "name" },
    { label: "Industry",   type: "Text",   desc: "Industry vertical of the account",               key: "industry" },
    { label: "Employees",  type: "Number", desc: "Headcount of the company",                       key: "employees" },
    { label: "MRR",        type: "Number", desc: "Monthly Recurring Revenue in USD",               key: "mrr" },
    { label: "Tier",       type: "Text",   desc: "Account or contact tier (Gold, Silver, Bronze)", key: "tier" },
    { label: "Owner",      type: "Text",   desc: "Team member responsible for this record",        key: "owner" },
    { label: "Created At", type: "Date",   desc: "Date and time the record was created",           key: "created_at" },
  ],
  deals_salesforce: [
    { label: "Name",       type: "Text",   desc: "Full name of the record",                 key: "name" },
    { label: "Stage",      type: "Text",   desc: "Current pipeline stage",                  key: "stage" },
    { label: "Amount",     type: "Number", desc: "Deal value in USD",                       key: "amount" },
    { label: "Close Date", type: "Date",   desc: "Expected or actual deal close date",      key: "close_date" },
    { label: "Owner",      type: "Text",   desc: "Team member responsible for this record", key: "owner" },
    { label: "Account",    type: "Text",   desc: "Reference to the associated account",     key: "account_id" },
    { label: "Created At", type: "Date",   desc: "Date and time the record was created",    key: "created_at" },
  ],
}

/** Labels only — what the filter pickers and the calc column list read. */
const SOURCE_COLUMNS: Record<string, string[]> = Object.fromEntries(
  Object.entries(SOURCE_COLUMN_DEFS).map(([id, cols]) => [id, cols.map(c => c.label)]),
)


const FRESHNESS_OPTIONS = [
  { value: "realtime", label: "Real-time" },
  { value: "15m",      label: "Every 15 minutes" },
  { value: "1h",       label: "Every hour" },
  { value: "24h",      label: "Every 24 hours" },
]

const WIDGET_SIZES = [
  { id: "sm", label: "S" },
  { id: "md", label: "M" },
  { id: "lg", label: "L" },
]



// ── DS-GAP Components ─────────────────────────────────────────────────────────


// DS-GAP: StepLabel — numbered section heading for builder form steps. Closest DS component: none.
// A numbered step heading inside a stage. Deliberately NOT the SectionLabel the
// other screens define — theirs is an uppercase caption with no number. Renamed
// so the duplicate check stops pairing two unrelated components.
function StepLabel({ children }: { n?: number; children: React.ReactNode }) {
  // Caption S Bold from the DS type scale: 12px / 600 / uppercase with tracking.
  // The numbered blue circle went with the redesign — the Stepper above already
  // says which stage you are in, so numbering every section inside it was a
  // second counter competing with the first.
  return (
    <div style={{
      fontSize: 12, fontWeight: 600, textTransform: "uppercase" as const,
      letterSpacing: "0.06em", color: "var(--color-text-label)", marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

// DS-GAP: EntitySourceCard — selectable source tile with integration tag + governance badge. Closest DS component: CardContainer.
function EntitySourceCard({ source, selected, onSelect }: { source: typeof ENTITY_SOURCES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{ cursor: "pointer" }}>
      <CardContainer selected={selected} size="sm" className="!p-0 h-full overflow-hidden">
        <div style={{ padding: 12, display: "flex", gap: 10 }}>
          {/* The entity's own icon, so the grid is scannable by shape before you
              read a word. Same slot the dataset cards use, so the two modes read
              as one family rather than two designs. */}
          <HighlightIcon iconName={source.icon} variant={selected ? "informative" : "neutral"} size="sm" />
          <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: selected ? "var(--primary)" : "var(--color-text-title)" }}>{source.label}</span>
              <span style={{ fontSize: 11, color: "var(--color-text-subtitle)", whiteSpace: "nowrap" as const }}>
                · {(SOURCE_COLUMNS[source.id] ?? []).length} columns
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", margin: 0, lineHeight: 1.4 }}>{source.desc}</p>
            {/* Neutral, all of them. These are attributes of the source, not
                states of it — colouring the integration blue and PII amber made
                a grid of eight cards read as a warning board. Governance still
                shows, it just stops shouting. */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
              <Tag variant="neutral" size="sm">{source.integration}</Tag>
              {!source.governed && <Tag variant="neutral" size="sm">Ungoverned</Tag>}
              {source.hasPII && <Tag variant="neutral" size="sm">PII</Tag>}
            </div>
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
      <CardContainer selected={selected} size="sm" className="!p-0 h-full overflow-hidden">
        {/* Deliberately the same skeleton as EntitySourceCard — icon, title,
            description, tags — so switching data source mode changes what you
            are choosing between, not how the choosing looks. A dataset is a
            saved query, so it gets one data glyph rather than a per-entity one. */}
        <div style={{ padding: 12, display: "flex", gap: 10 }}>
          <HighlightIcon iconName="Database" variant={selected ? "informative" : "neutral"} size="sm" />
          <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: selected ? "var(--primary)" : "var(--color-text-title)" }}>{dataset.name}</span>
            <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", margin: 0, lineHeight: 1.4 }}>{dataset.description}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
              {/* The shape leads: it is what decides which widget types can
                  draw this dataset, so it is the fact worth reading first. */}
              <Tag variant="neutral" size="sm">{dataset.shape}</Tag>
              <Tag variant="neutral" size="sm">{dataset.integration}</Tag>
            </div>
          </div>
        </div>
      </CardContainer>
    </div>
  )
}


/**
 * A searchable option picker: the DS Select as the trigger, the DS Menu as the
 * list, positioned with the repo's own dropdown-anchor helper.
 *
 * CLAUDE.md tells screens to compose Select with a base-ui Popover. That was
 * tried first and does not work here: Select renders a div, and base-ui's
 * Trigger could neither attach to it nor stop reading the click as a dismiss.
 * The pattern the repo actually runs on — anchorFromEvent + useDropdownPosition
 * + a full-screen click-catcher — is what Filters uses, so this matches the
 * codebase instead of introducing a second dropdown mechanism.
 *
 * The screen needs this three times (filters, calculations, group by), which is
 * why it is one local helper rather than three inline copies.
 */
function OptionPicker({ options, value, placeholder, onChange, searchable = true }: {
  options: string[]
  value: string
  placeholder: string
  onChange: (col: string) => void
  /** A five-item function list does not need a search box; a column list does. */
  searchable?: boolean
}) {
  const [anchor, setAnchor] = useState<DropdownAnchor | null>(null)
  const [query, setQuery]   = useState("")
  const dropdown = useDropdownPosition(anchor)
  const shown = options.filter(c => c.toLowerCase().includes(query.trim().toLowerCase()))
  const close = () => { setAnchor(null); setQuery("") }

  return (
    <>
      <div onClickCapture={(e: React.MouseEvent) => setAnchor(a => a ? null : anchorFromEvent(e))}>
        <Select value={value || undefined} placeholder={placeholder} size="sm" open={!!anchor} />
      </div>

      {anchor && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 10000 }} onClick={close} />
          <div ref={dropdown.ref} style={{ position: "fixed", zIndex: 10001, ...dropdown.style }}>
            <Menu className="w-auto min-w-[220px]">
              {searchable && (
                <>
                  <div style={{ padding: 6 }}>
                    <Input
                      size="sm"
                      autoFocus
                      placeholder="Search columns…"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                    />
                  </div>
                  <MenuDivider />
                </>
              )}
              {shown.length === 0 ? (
                <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--color-text-subtitle)" }}>
                  No column matches “{query}”.
                </div>
              ) : shown.map(c => (
                <MenuItem
                  key={c}
                  label={c}
                  state={c === value ? "focus" : "default"}
                  trailingElement={c === value ? <LucideIcons.Check size={13} style={{ flexShrink: 0, color: "var(--primary)" }} /> : undefined}
                  onClick={() => { onChange(c); close() }}
                />
              ))}
            </Menu>
          </div>
        </>
      )}
    </>
  )
}

// DS-GAP: TypeTile — widget type selector tile with icon and label. Closest DS component: CardContainer.
function TypeTile({ type, selected, onSelect }: { type: typeof AUTHORABLE_WIDGETS[0]; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{ cursor: "pointer" }}>
      <CardContainer selected={selected} size="sm" className="!p-0 h-full overflow-hidden">
        <div style={{ padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {/* An icon, not a miniature. Twenty-two 54px previews side by side
              compete with each other and none of them reads — the grid became
              noise. The icon names the type; the live preview on the right
              shows the actual widget, which is where seeing it matters. */}
          <HighlightIcon
            iconName={type.icon}
            variant={selected ? "informative" : "neutral"}
            size="md"
          />
          <span style={{
            fontSize: 12, fontWeight: 500, textAlign: "center" as const, lineHeight: 1.3,
            color: selected ? "var(--primary)" : "var(--color-text-title)",
          }}>{type.label}</span>
        </div>
      </CardContainer>
    </div>
  )
}

// DS-GAP: SkeletonShape — CSS-only skeleton preview shape keyed by widget type. Closest DS component: none.
// DS-GAP: WidgetPreviewPanel — sticky live preview panel with size switcher and widget info. Closest DS component: CardContainer.
function WidgetPreviewPanel({ typeId, name, sourceId, freshness, interactiveFilters, previewSize, setPreviewSize, saveHint }: {
  typeId: string | null; name: string; sourceId: string | null; freshness: string
  interactiveFilters: boolean; previewSize: string; setPreviewSize: (s: string) => void; saveHint: string
}) {
  const entitySrc  = ENTITY_SOURCES.find(s => s.id === sourceId)
  const datasetSrc = PRESET_DATASETS.find(d => d.id === sourceId)
  const srcLabel   = entitySrc?.label ?? datasetSrc?.name ?? null
  const typeInfo   = AUTHORABLE_WIDGETS.find(t => t.id === typeId)
  const maxW = previewSize === "sm" ? 240 : previewSize === "md" ? 420 : undefined
  const freshnessLabel = freshness === "realtime" ? "Live" : freshness === "15m" ? "15m" : freshness === "1h" ? "1h" : "24h"

  // "KPI · Deals · HubSpot" — what this widget is, reading left to right.
  const lineage = [typeInfo?.label, srcLabel, entitySrc?.integration].filter(Boolean).join(" · ")

  // The body only. WidgetFather draws every piece of chrome around it.
  // WidgetPreview owns the resolution chain — the same one the Widget Library,
  // the Marketplace and the Universal Profile now call, so a Donut is the same
  // Donut in all four.
  const body = !typeInfo
    ? <EmptyState compact icon={LucideIcons.Shapes} title="Nothing to preview yet" description={saveHint} />
    : <WidgetPreview typeId={typeInfo.id} />

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

      {/* The preview IS a widget, not a card imitating one.
       *
       *  It used to hand-roll its own header: a bare <input> for the title, its
       *  own border, its own tag row. That got the typography wrong, had no
       *  refresh or overflow control, and drifted from WidgetFather every time
       *  either side changed. This is a create flow for widgets — what you are
       *  looking at should be built the same way the thing you are about to save
       *  will be. CardContainer + WidgetFather noCard is the same composition the
       *  DS catalog and the Live Canvas both use.
       *
       *  The name is no longer editable here; it is the "Widget name" field in
       *  Configure, which is one place instead of two. */}
      <div style={{ maxWidth: maxW, transition: "max-width 0.2s" }}>
        <CardContainer size="lg" className="flex flex-col">
          <WidgetFather
            noCard
            fillWidth
            title={name || "Untitled widget"}
            description={lineage || undefined}
            showRefresh
            showMenu
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* The filter row an end user would get. Only when "Let end users
                  filter this widget" is on — the checkbox and this row are the
                  same decision, and showing the consequence beside the control is
                  what a live preview is for. Inert here on purpose. */}
              {interactiveFilters && typeInfo && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {["Last 30 days", "Status", "Team"].map(f => (
                    <Chip key={f} size="s" variant="secondary">{f}</Chip>
                  ))}
                </div>
              )}
              {body}
            </div>
          </WidgetFather>
        </CardContainer>
      </div>

      {/* Configuration facts about the widget, not chrome it will render.
       *  They sit outside the card because WidgetFather has no slot for them and
       *  inventing one would put a tag in the header that the real widget will
       *  never show. */}
      {typeInfo && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
          <Tag variant={freshness === "realtime" ? "success" : "informative"} size="sm">{freshnessLabel}</Tag>
          {entitySrc && !entitySrc.governed && <Tag variant="alert" size="sm">Ungoverned</Tag>}
          {srcLabel && <Tag variant="neutral" size="sm">{srcLabel}</Tag>}
        </div>
      )}

      {typeInfo && (
        <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--field-border)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>Best for</div>
          <p style={{ fontSize: 12, color: "var(--color-text-subtitle)", margin: 0 }}>{typeInfo.bestFor}</p>
        </div>
      )}
      {typeId && saveHint && <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", textAlign: "center" as const, margin: 0 }}>{saveHint}</p>}
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
  const [recordColumns, setRecordColumns] = useState<string[]>([])
  // Thom's prototype builds a query, not a single metric: several calculations,
  // several groupers, several filters. The old single calcFn/calcColumn pair
  // could express exactly one aggregate with no grouping.
  const [groupers, setGroupers]     = useState<{ id: string; column: string }[]>([])
  const [dataFilters, setDataFilters] = useState<{ id: string; column: string; op: string; value: string }[]>([])
  const [srcFilter, setSrcFilter]   = useState("all")

  // Configure tab state
  const [typeId, setTypeId]             = useState<string | null>(null)
  const [name, setName]                 = useState("")
  const [subtitle, setSubtitle]         = useState("")
  const [freshness, setFreshness]       = useState("15m")
  const [interactiveFilters, setInteractiveFilters] = useState(true)

  // Appearance tab state

  // UI state
  const [dataMode, setDataMode]         = useState<"entity" | "dataset">("entity")
  const [previewSize, setPreviewSize]   = useState("lg")
  const [showLeave, setShowLeave]       = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [typeCat, setTypeCat] = useState<WidgetCategory | "all">("all")
  // The columns modal edits a DRAFT, so Cancel means cancel. Committing on each
  // checkbox would leave a half-made selection behind when someone backs out.
  const [showColumns, setShowColumns] = useState(false)
  const [colDraft, setColDraft]       = useState<string[]>([])
  const [colQuery, setColQuery]       = useState("")
  const [colType, setColType]         = useState<ColumnType | "All">("All")

  // Search matches the label, the description AND the key — the key is there
  // because someone who knows the data will type `lead_source`, not "Channel
  // where the lead originated".
  const visibleColumns = (SOURCE_COLUMN_DEFS[sourceId ?? ""] ?? []).filter(c => {
    if (colType !== "All" && c.type !== colType) return false
    const q = colQuery.trim().toLowerCase()
    return !q || c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.key.includes(q)
  })

  // ── Derived ──

  // Count needs no column; every other function does. That is why the check is
  // per-row rather than "has a column".
  // Count needs no column; every other function does. Compared against the same
  // constant the picker offers, so the two cannot drift out of case again.
  // Summarize no longer asks WHICH calculation — it counts. Count is the one
  // aggregation that needs no column, so the step is complete the moment an
  // entity is chosen, and Group by is what shapes the result from there.
  const dataComplete = dataMode === "dataset"
    ? !!sourceId
    : !!sourceId && !!opType && (opType === "aggregate" ? true : recordColumns.length > 0)
  // A widget IS its data and its type. The name is not part of that — the
  // preview has been calling an unnamed one "Untitled widget" all along, so the
  // screen already tolerates it, and requiring it only meant Save sat grey
  // while everything that matters was decided.
  const widgetComplete = dataComplete && !!typeId
  const canSave        = widgetComplete
  const hasUnsaved     = !!(sourceId || typeId || name.trim() || subtitle.trim())

  // ── Wizard stages ─────────────────────────────────────────────────────────
  // These were a hand-rolled tab strip: numbered dots, a check when complete,
  // disabled until the previous stage was done. Tabs are non-linear by
  // definition — the moment one can be locked behind another it is a stage, and
  // stages are what Stepper is for. Its StepState covers every case the local
  // version drew by hand.
  const STEP_ORDER: TabId[] = ["data", "configure"]
  const NEXT_LABEL: Record<TabId, string> = {
    data:      "Continue to Configure",
    configure: "Save to catalog",
  }

  // The footer's shape follows the stage: Cancel on the first, Back after that,
  // and the primary button becomes Save on the last one.
  const isLast     = tab === "configure"
  const stepIndex  = STEP_ORDER.indexOf(tab)
  const nextEnabled = tab === "data" ? dataComplete : tab === "configure" ? widgetComplete : canSave

  const saveHint = !sourceId
    ? (dataMode === "dataset" ? "Choose a governed dataset on the Data tab to get started." : "Choose an entity source on the Data tab to get started.")
    : !dataComplete
    ? "Finish configuring your data source on the Data tab."
    : !typeId
    ? "Choose a widget type on the Configure tab."
    : ""

  // ── Handlers ──

  function selectSource(id: string) {
    if (id === sourceId) return
    setSourceId(id)
    setOpType(null); setGroupers([]); setDataFilters([])
    setRecordColumns([])
  }

  function resetAll() {
    setTab("data"); setDataMode("entity"); setSourceId(null); setOpType(null); setRecordColumns([]); setGroupers([]); setDataFilters([]); setSrcFilter("all")
    setTypeId(null); setName(""); setSubtitle(""); setFreshness("15m"); setInteractiveFilters(true)
  }



  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas G."
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="widget-library"
      // This screen ends in a StepperNavFooter, not a floating Pagination.
      stickyFooter
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Widget Builder"
          description="Connect a data source, pick a chart type, and preview your widget live."
          primaryAction={{
            label: "Save to catalog",
            icon: LucideIcons.Check,
            disabled: !canSave,
            onClick: () => setShowSaveModal(true),
          }}
        />
      )}
    >
      {/* ── Builder ── */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 160px)" }}>
          {/* Two stages read as a wizard when the top carries a Stepper AND
              the bottom carries StepperNavFooter — two progress bars for one
              two-step flow. The footer is the one that moves you forward, so
              the top is navigation: a SwitchTab.

              A SwitchTab has no locked state, and that is the trade: you can
              look at Configure before the data is finished. Nothing can be
              saved early — the footer's Next and Save are still gated on
              dataComplete and canSave — so the cost is a peek, and the gain is
              that the two halves stop competing. */}
          <SwitchTab
            items={[
              { id: "data",      label: "Data"      },
              { id: "configure", label: "Configure" },
            ]}
            value={tab}
            onChange={id => setTab(id as TabId)}
            size="s"
            aria-label="Builder stage"
            className="mb-5 self-start"
          />

          {/* The preview is the point of this screen, so it sits beside the
              form rather than under it. The split fires at 1100 — an arbitrary
              value on purpose: the repo's breakpoint table comes straight from
              Figma (600 · 1280 · 1440 · 1920) and has no rung between 600 and
              1280, so at md the preview dropped below the fold on any laptop
              narrower than 1280, which is most of them. */}
          <div className="flex flex-col min-[1100px]:flex-row gap-[24px] items-stretch min-[1100px]:items-start">
          {/* Left: build panel */}
          <div className="flex-1 min-w-0 flex flex-col gap-[20px]">
            {/* ── Tab 1: Data ── */}
            {tab === "data" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Each section appears once the one above it is answered. The
                    prototype reveals them progressively; the old version showed
                    every section at once, which is why step 1 read as a wall. */}
                <div>
                  <StepLabel n={1}>Data source</StepLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
                    <OptionCard
                      icon="Database" title="Existing dataset"
                      description="Use a pre-built, governed query as your starting point."
                      selected={dataMode === "dataset"}
                      onSelect={() => { setDataMode("dataset"); setSourceId(null); setOpType(null); setGroupers([]); setDataFilters([]); setRecordColumns([]) }}
                    />
                    <OptionCard
                      icon="Boxes" title="Entity"
                      description="Start from a raw entity and configure it from scratch."
                      selected={dataMode === "entity"}
                      onSelect={() => { setDataMode("entity"); setSourceId(null); setOpType(null); setGroupers([]); setDataFilters([]); setRecordColumns([]) }}
                    />
                  </div>
                </div>

                {dataMode === "entity" && (
                  <div>
                    <StepLabel n={2}>Choose entity</StepLabel>
                    {/* Filter by the system the entity comes from — with eight
                        sources and more arriving per install, the integration is
                        the axis people scan by. */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>
                      <Chip size="s" variant={srcFilter === "all" ? "primary" : "secondary"} onClick={() => setSrcFilter("all")}>Browse all</Chip>
                      {INTEGRATIONS.map(i => (
                        <Chip key={i} size="s" variant={srcFilter === i ? "primary" : "secondary"} onClick={() => setSrcFilter(i)}>{i}</Chip>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
                      {ENTITY_SOURCES.filter(src => srcFilter === "all" || src.integration === srcFilter).map(src => (
                        <EntitySourceCard key={src.id} source={src} selected={sourceId === src.id} onSelect={() => selectSource(src.id)} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", margin: "10px 0 0" }}>
                      More entities available — install a model from the Models page to unlock them.
                    </p>
                  </div>
                )}

                {dataMode === "dataset" && (
                  <div>
                    <StepLabel>Governed dataset</StepLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
                      {PRESET_DATASETS.map(ds => (
                        <DatasetCard key={ds.id} dataset={ds} selected={sourceId === ds.id} onSelect={() => setSourceId(ds.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {sourceId && dataMode === "entity" && (
                  <div>
                    <StepLabel n={3}>Filters</StepLabel>
                    {dataFilters.length === 0 ? (
                      <EmptyState
                        compact icon={LucideIcons.Filter}
                        title="No filters"
                        description="The widget will read every record in this entity."
                        ctaLabel="Add filter"
                        onCta={() => setDataFilters([{ id: `f-${Date.now()}`, column: "", op: "is", value: "" }])}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {dataFilters.map(f => (
                          <div key={f.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <OptionPicker
                                options={SOURCE_COLUMNS[sourceId] ?? []}
                                value={f.column}
                                placeholder="Column…"
                                onChange={col => setDataFilters(prev => prev.map(x => x.id === f.id ? { ...x, column: col } : x))}
                              />
                            </div>
                            <div style={{ width: 120, flexShrink: 0 }}>
                              <OptionPicker
                                options={FILTER_OPS}
                                value={f.op}
                                searchable={false}
                                placeholder="is…"
                                onChange={op => setDataFilters(prev => prev.map(x => x.id === f.id ? { ...x, op } : x))}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Input size="sm" placeholder="Value" value={f.value} onChange={e => setDataFilters(prev => prev.map(x => x.id === f.id ? { ...x, value: e.target.value } : x))} />
                            </div>
                            <Button variant="tertiary" size="sm" aria-label="Remove filter" onClick={() => setDataFilters(prev => prev.filter(x => x.id !== f.id))}>
                              <LucideIcons.X size={14} />
                            </Button>
                          </div>
                        ))}
                        <div>
                          <Button variant="secondary" size="sm" onClick={() => setDataFilters(prev => [...prev, { id: `f-${Date.now()}`, column: "", op: "is", value: "" }])}>
                            <LucideIcons.Plus size={14} />Add filter
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {sourceId && dataMode === "entity" && (
                  <div>
                    <StepLabel n={4}>What do you want to show?</StepLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
                      <OptionCard
                        icon="Sigma" title="Summarize"
                        description="Count the records, and optionally group them."
                        selected={opType === "aggregate"}
                        onSelect={() => { setOpType("aggregate"); setRecordColumns([]) }}
                      />
                      <OptionCard
                        icon="Rows3" title="Record set"
                        description="Show raw records — choose which columns to expose."
                        selected={opType === "record_set"}
                        onSelect={() => { setOpType("record_set"); setGroupers([]) }}
                      />
                    </div>
                  </div>
                )}

                {sourceId && dataMode === "entity" && opType === "aggregate" && (
                  <div>
                    <StepLabel n={5}>Group by</StepLabel>
                    {groupers.length === 0 ? (
                      <EmptyState
                        compact icon={LucideIcons.Group}
                        title="No groupers"
                        description="The result will be a single aggregated value."
                        ctaLabel="Add grouper"
                        onCta={() => setGroupers([{ id: `g-${Date.now()}`, column: "" }])}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {groupers.map(g => (
                          <div key={g.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <OptionPicker
                                options={SOURCE_COLUMNS[sourceId] ?? []}
                                value={g.column}
                                placeholder="Group by column…"
                                onChange={col => setGroupers(prev => prev.map(x => x.id === g.id ? { ...x, column: col } : x))}
                              />
                            </div>
                            <Button variant="tertiary" size="sm" aria-label="Remove grouper" onClick={() => setGroupers(prev => prev.filter(x => x.id !== g.id))}>
                              <LucideIcons.X size={14} />
                            </Button>
                          </div>
                        ))}
                        <div>
                          <Button variant="secondary" size="sm" onClick={() => setGroupers(prev => [...prev, { id: `g-${Date.now()}`, column: "" }])}>
                            <LucideIcons.Plus size={14} />Add grouper
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {sourceId && dataMode === "entity" && opType === "record_set" && (
                  <div>
                    <StepLabel n={5}>Columns to expose</StepLabel>
                    {/* A summary, not the picker. Nine checkboxes inline made
                        the step scroll and still said nothing about what each
                        field holds — the explaining happens in the modal. */}
                    {recordColumns.length === 0 ? (
                      <EmptyState
                        compact icon={LucideIcons.Columns3}
                        title="No columns selected"
                        description="Pick the fields this widget will show."
                        ctaLabel="Choose columns"
                        onCta={() => { setColDraft(recordColumns); setShowColumns(true) }}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                        {recordColumns.slice(0, 4).map(c => (
                          <Tag key={c} variant="neutral" size="sm">{c}</Tag>
                        ))}
                        {recordColumns.length > 4 && (
                          <Tag variant="neutral" size="sm">+{recordColumns.length - 4} more</Tag>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => { setColDraft(recordColumns); setShowColumns(true) }}>
                          Edit columns
                        </Button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* ── Tab 2: Widget ── */}
            {tab === "configure" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <StepLabel n={1}>Name your widget</StepLabel>
                  <p style={{ fontSize: 12, color: "var(--color-text-subtitle)", margin: "0 0 10px" }}>
                    What it is called on the dashboard, and the line under it.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Input placeholder="Widget name, e.g. Pipeline by Stage" value={name} onChange={e => setName(e.target.value)} />
                    <Input placeholder="Short description (optional, up to 120 characters)" value={subtitle} onChange={e => setSubtitle(e.target.value.slice(0, 120))} />
                  </div>
                </div>

                <div>
                  <StepLabel n={2}>Widget type</StepLabel>
                  <p style={{ fontSize: 12, color: "var(--color-text-subtitle)", margin: "0 0 10px" }}>
                    How to visualize the data.
                  </p>

                  {/* Twenty-two tiles in one flat grid is a wall. Thom's
                      prototype groups them and offers a filter row; both are
                      his, and the category copy is his too. */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 12 }}>
                    <Chip size="s" variant={typeCat === "all" ? "primary" : "secondary"} onClick={() => setTypeCat("all")}>All</Chip>
                    {AUTHORABLE_BY_CATEGORY.map(c => (
                      <Chip key={c.id} size="s" variant={typeCat === c.id ? "primary" : "secondary"} onClick={() => setTypeCat(c.id)}>
                        {c.label}
                      </Chip>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {AUTHORABLE_BY_CATEGORY
                      .filter(c => typeCat === "all" || typeCat === c.id)
                      .map(c => (
                        <div key={c.id}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                            {/* Subtitle S — 14px / 600. A category is a heading
                                over a group of tiles, not a field label. */}
                            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1, color: "var(--color-text-title)" }}>
                              {c.label}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-subtitle)" }}>{c.blurb}</span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))", gap: 8 }}>
                            {c.types.map(t => (
                              <TypeTile key={t.id} type={t} selected={typeId === t.id} onSelect={() => setTypeId(t.id)} />
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <StepLabel n={3}>Settings</StepLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <OptionPicker
                      options={FRESHNESS_OPTIONS.map(o => o.label)}
                      value={FRESHNESS_OPTIONS.find(o => o.value === freshness)?.label ?? ""}
                      searchable={false}
                      placeholder="Refresh rate…"
                      onChange={label => setFreshness(FRESHNESS_OPTIONS.find(o => o.label === label)?.value ?? freshness)}
                    />
                    <Checkbox
                      label="Let end users filter this widget"
                      checked={interactiveFilters}
                      onChange={setInteractiveFilters}
                    />

                    <div style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--field-border)", background: "var(--canvas)" }}>
                      <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", margin: 0 }}>Need advanced transformations or custom SQL?{" "}
                        <a href="#" style={{ color: "var(--primary)", fontWeight: 600 }}>View in Metabase ↗</a>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right: sticky preview */}
          <div className="w-full min-[1100px]:w-[44%] shrink-0 min-[1100px]:sticky min-[1100px]:top-0">
            <WidgetPreviewPanel
              typeId={typeId}
              name={name}
              sourceId={sourceId}
              freshness={freshness}
              interactiveFilters={interactiveFilters}
              previewSize={previewSize}
              setPreviewSize={setPreviewSize}
              saveHint={saveHint}
            />
          </div>
        </div>

        </div>

      {/* Clearance so the last row of a stage is not left under the sticky
          footer at the end of a scroll. */}
      <div style={{ height: 24 }} />

      {/* ── Wizard navigation ──────────────────────────────────────────────
          Sticky at the foot of the page. Thom also keeps Cancel / Save to
          catalog in the Header, so Save has two entry points — his call, left
          as he built it. Flagged for Michael rather than removed a second
          time. */}
      <StepperNavFooter
          variant={tab === "data" ? "cancel-next" : "back-next"}
          onCancel={() => (hasUnsaved ? setShowLeave(true) : resetAll())}
          onBack={() => setTab(STEP_ORDER[Math.max(0, stepIndex - 1)])}
          // Thom named each step's destination — "Continue to Widget", not
          // "Next". Resolving the Stepper merge in main's favour flattened all
          // three to "Next", which is a worse label: it drops the one piece of
          // information the button had. His wording, restored.
          nextLabel={NEXT_LABEL[tab]}
          nextDisabled={!nextEnabled}
          onNext={() => {
            if (isLast) { setShowSaveModal(true); return }
            setTab(STEP_ORDER[stepIndex + 1])
          }}
        />

      {/* ── Columns modal ── */}
      {/* A picker, not a confirmation: variant="content" with slotUnstyled, so
          the list sits directly on the modal instead of inside a grey card.
          Each row explains its field, which is the whole reason this stopped
          being an inline checkbox list. */}
      <ModalDialog
        isOpen={showColumns}
        onClose={() => setShowColumns(false)}
        variant="content"
        showIcon={false}
        title="Columns to expose"
        description="Choose which fields are available in this dataset."
        slotUnstyled
        slot={
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input
              size="sm"
              placeholder="Search by name, description, or field key…"
              value={colQuery}
              onChange={e => setColQuery(e.target.value)}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
              <Chip size="s" variant={colType === "All" ? "primary" : "secondary"} onClick={() => setColType("All")}>All</Chip>
              {COLUMN_TYPES.map(t => (
                <Chip key={t} size="s" variant={colType === t ? "primary" : "secondary"} onClick={() => setColType(t)}>{t}</Chip>
              ))}
              <div style={{ marginLeft: "auto" }}>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => setColDraft(colDraft.length === 0 ? (SOURCE_COLUMNS[sourceId ?? ""] ?? []) : [])}
                >
                  {colDraft.length === 0 ? "Select all" : "Deselect all"}
                </Button>
              </div>
            </div>

            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {visibleColumns.length === 0 ? (
                <EmptyState
                  compact icon={LucideIcons.SearchX}
                  title="No columns found"
                  description="Try a different search term or type."
                />
              ) : visibleColumns.map((c, i) => (
                <div
                  key={c.key}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 4px",
                    borderBottom: i < visibleColumns.length - 1 ? "1px solid var(--field-border)" : "none",
                  }}
                >
                  <div style={{ paddingTop: 2 }}>
                    <Checkbox
                      checked={colDraft.includes(c.label)}
                      onChange={on => setColDraft(prev => on ? [...prev, c.label] : prev.filter(x => x !== c.label))}
                    />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{c.label}</span>
                      <Tag variant="neutral" size="sm">{c.type}</Tag>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--color-text-subtitle)", margin: "2px 0 0", lineHeight: 1.4 }}>{c.desc}</p>
                    {/* The key is what someone would search for, and what an
                        engineer would ask them to name. Monospace so it reads
                        as a value rather than more prose. */}
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-subtitle)" }}>{c.key}</span>
                  </div>
                </div>
              ))}
            </div>

            <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>
              {colDraft.length} of {(SOURCE_COLUMNS[sourceId ?? ""] ?? []).length} selected
            </span>
          </div>
        }
        ctaPrimary={{
          label: "Done",
          disabled: colDraft.length === 0,
          onClick: () => { setRecordColumns(colDraft); setShowColumns(false) },
        }}
        ctaSecondary={{ label: "Cancel", onClick: () => setShowColumns(false) }}
      />

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

      {/* ── Save confirmation modal ── */}
      <ModalDialog
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        tone="success"
        iconName="BookMarked"
        title="Save to catalog?"
        description={`"${name || "Untitled widget"}" will be added to the widget library and available across all dashboards.`}
        /* Three genuinely different outcomes, which is the only reason a third
           CTA earns its place: save and stay with the widget, save and start a
           fresh one, or go back without saving. */
        ctaPrimary={{ label: "Save to catalog", onClick: () => setShowSaveModal(false) }}
        ctaSecondary={{ label: "Keep editing", onClick: () => setShowSaveModal(false) }}
        ctaTertiary={{ label: "Create new widget", onClick: () => { resetAll(); setShowSaveModal(false) } }}
      />
    </ScreenLayout>
  )
}
