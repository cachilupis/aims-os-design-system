import { useMemo, useState, useEffect, createContext, useContext } from "react"
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react"
import * as LucideIcons from "lucide-react"
import { SlideOut }        from "@/components/ui/slide-out"
import { ScreenLayout }     from "@/components/layouts/screen-layout"
import { ListViewSection }  from "@/components/layouts/list-view-section"
import type { SidebarItem } from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { Button }           from "@/components/ui/button"
import { Tag }              from "@/components/ui/tag"
import { Tabs }             from "@/components/ui/tabs"
import { Pagination }       from "@/components/ui/pagination"
import { HighlightIcon }    from "@/components/ui/highlight-icon"
import { WidgetCanvasView } from "@/components/layouts/widget-canvas-view"
import type { CanvasSlot }  from "@/components/layouts/widget-canvas-view"
import { Table }            from "@/components/ui/table"
import type { TableColumn } from "@/components/ui/table"
import { Toggle }           from "@/components/ui/toggle"
import { SwitchTab }        from "@/components/ui/switch-tab"
import { ModalDialog }      from "@/components/ui/modal-dialog"
import { Select }           from "@/components/ui/select"
import { Input }            from "@/components/ui/input"
import { Menu, MenuItem, MenuDivider } from "@/components/ui/menu-item"
import type { EntityListItemData } from "@/components/ui/entity-list"

/* ═══════════════════════════════════════════════════════════════════════════
   DATA STUDIO — MODELS  ·  DS React rebuild of data-studio-models.html
   Slab A: shell + four lists (Models · Entities · Tables · Reference Data)
   + Entity full-detail (Overview · Tables · Relationships · Privileges · API · History)
   All chrome is composed from src/components/ui — no hand-rolled primitives.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────────────────────────
type Status = "Published" | "Draft" | "Deprecated"
type Area   = "models" | "entities" | "tables" | "reference"

type EntityRow = {
  id: string; name: string; model: string; domain: string; status: Status
  updated: string; owner: string; records: string; tables: TableRef[]; rels: RelRef[]
  privileges: number; tags: string[]; desc: string
}
type TableRef = { alias: string; role: "Primary" | "Secondary"; cols: number; rows: string }
type RelRef   = { target: string; kind: string; incoming?: boolean }
type TableRow = { id: string; alias: string; entity: string; role: "Primary" | "Secondary"; cols: number; rows: string; status: Status; updated: string }
type RefRow   = { id: string; name: string; items: number; origin: "Manual" | "External sync"; referencedBy: number; updated: string; status: Status }
type ModelRow = { id: string; name: string; domain: string; entities: number; tables: number; status: Status; updated: string; owner: string; desc: string }

// ── Status → DS variants ─────────────────────────────────────────────────────
const STATUS_TAG: Record<Status, "success" | "neutral" | "alert"> = {
  "Published": "success", "Draft": "neutral", "Deprecated": "alert",
}
const STATUS_ICON: Record<Status, NonNullable<EntityListItemData["iconVariant"]>> = {
  "Published": "success", "Draft": "neutral", "Deprecated": "info",
}
const STATUS_KPI: Record<Status, "success" | "neutral" | "alert"> = {
  "Published": "success", "Draft": "neutral", "Deprecated": "alert",
}
const NEW_LABEL: Record<Area, string> = { models: "model", entities: "entity", tables: "table", reference: "list" }

// ── Scope versioning (V1 / V1.5 / Full vision) ────────────────────────────────
const SCOPE_TIERS = ["v1", "v1.5", "v2"] as const
type Scope = typeof SCOPE_TIERS[number]
const ScopeCtx = createContext<Scope>("v1")
const useScope = () => useContext(ScopeCtx)
const atLeast = (scope: Scope, tier: Scope) => SCOPE_TIERS.indexOf(scope) >= SCOPE_TIERS.indexOf(tier)

type ChangeBlock = { tier: string; scope: Scope; target: string; sub: string; nw: string[]; up?: string[]; rm?: string[] }
const SCOPE_CHANGELOG: ChangeBlock[] = [
  { tier: "V1 · Foundation", scope: "v1", target: "This sprint", sub: "Browse & author the model",
    nw: ["Four lists — Models · Entities · Tables · Reference Data (search · filters · pagination)", "Create from scratch — New model · entity · table · reference · column (no \"Stewards\")", "Card click → full editable detail (Overview = basic info block)", "Entity → Tables · Relationships · Table/Reference → Columns · Relationships · Data · Model → Entities · Tables", "Column editor (Schema · Rules · Sensitivity · Display) · data-row add/edit/delete · relationship authoring (list mode)"],
    rm: ["Publish / versioning banner · SlideOut preview (nice-to-have) · Marketplace catalog · Create-with-AI · ER diagrams · Referenced-by · Indexes / Settings / History — later"] },
  { tier: "V1.2 · Expansion", scope: "v1.5", target: "Next sprint", sub: "Govern",
    nw: ["Publish / save-to-version (edit → draft is V1; the publish banner lands here)", "Privileges tab — view-only standard privileges", "API contracts — the 5 default endpoints: enable / disable + description only"],
    up: ["Entity detail gains Privileges + API tabs"],
    rm: ["Custom endpoints · custom privileges · API request/response customization — Full vision"] },
  { tier: "Full vision", scope: "v2", target: "Later", sub: "The complete experience",
    nw: ["API contract two-pane builder — custom endpoints · request/response customization · OpenAPI", "Marketplace — catalog Profile · Implement vs Clone install", "AI-assisted (ORI) modeling · diagrams · rich previews", "Custom privileges · reference-usage · Indexes · Settings · History (generic screen)"],
    up: ["Every tab & action unlocked"] },
]

function ScopeSwitcher({ scope, setScope, onChangelog }: { scope: Scope; setScope: (s: Scope) => void; onChangelog: () => void }) {
  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9990, display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "0.5px solid var(--field-border)", borderRadius: 12, padding: "6px 8px 6px 12px", boxShadow: "var(--shadow-elevation-4)" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtitle)", textTransform: "uppercase", letterSpacing: ".04em" }}>Scope</span>
      <SwitchTab size="s" items={[{ id: "v1", label: "V1" }, { id: "v1.5", label: "V1.2" }, { id: "v2", label: "Full vision" }]} value={scope} onChange={s => setScope(s as Scope)} />
      <Button variant="tertiary" size="sm" onClick={onChangelog}><LucideIcons.ListChecks size={15} /></Button>
    </div>
  )
}

function ChangelogPanel({ open, onClose, scope }: { open: boolean; onClose: () => void; scope: Scope }) {
  const sec = (label: string, items: string[] | undefined, color: string) => (!items || !items.length) ? null : (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color, marginBottom: 5 }}>{label}</div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>{items.map((x, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.5, color: "var(--color-text-subtitle)", marginBottom: 2 }}>{x}</li>)}</ul>
    </div>
  )
  return (
    <SlideOut open={open} onClose={onClose} type="with-variants" size="s" title="Scope changelog" subtitle="What each scope ships — the toggle previews it live"
      showTabs={false} showSearchBar={false} showChips={false} showCta={false} showStatus={false} showTopButton={false}
      iconContent={<LucideIcons.ListChecks size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SCOPE_CHANGELOG.map(b => {
          const on = b.scope === scope
          return (
            <div key={b.scope} style={{ border: `1px solid ${on ? "var(--primary)" : "var(--field-border)"}`, background: on ? "var(--tag-informative-bg)" : "transparent", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div><div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-title)" }}>{b.tier}</div><div style={{ fontSize: 11, color: "var(--color-text-subtitle)", marginTop: 1 }}>{b.sub} · Target: {b.target}</div></div>
                {on && <Tag variant="informative" size="sm">Current</Tag>}
              </div>
              {sec("New", b.nw, "var(--tag-success-bd)")}
              {sec("Updated", b.up, "var(--primary)")}
              {sec("Removed / deferred", b.rm, "var(--color-text-subtitle)")}
            </div>
          )
        })}
      </div>
    </SlideOut>
  )
}

// ── Sidebar (Data Studio shell) ──────────────────────────────────────────────
const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home",     label: "Home",     icon: "House" },
  { id: "inbox",    label: "Inbox",    icon: "Inbox" },
  { id: "models",   label: "Models",   icon: "Boxes" },
  { id: "sources",  label: "Sources",  icon: "Cable" },
  { id: "datasets", label: "Datasets", icon: "Table2" },
  { id: "catalog",  label: "Catalog",  icon: "BookOpen" },
  { id: "identity", label: "Identity", icon: "Fingerprint" },
  { id: "control",  label: "Control",  icon: "SlidersHorizontal" },
]

// ── Data ─────────────────────────────────────────────────────────────────────
const MODELS: ModelRow[] = [
  { id: "crm_core",  name: "CRM Core",          domain: "Customer-facing", entities: 6, tables: 11, status: "Published",       updated: "2h ago",  owner: "Sarah Chen",    desc: "Accounts, contacts, opportunities and the customer-360 rollups the rest of the platform joins against." },
  { id: "finance",   name: "Finance",           domain: "Back office",     entities: 4, tables: 8,  status: "Published",       updated: "1d ago",  owner: "Marcus Reed",   desc: "Invoices, payments and the general-ledger records used by reconciliation workflows." },
  { id: "product",   name: "Product Analytics", domain: "Data",            entities: 3, tables: 6,  status: "Deprecated", updated: "4h ago",  owner: "Julia Cruz",    desc: "Product events, sessions and the retention signals feeding executive dashboards." },
  { id: "people",    name: "People Ops",        domain: "Back office",     entities: 2, tables: 4,  status: "Published",       updated: "3d ago",  owner: "Sarah Chen",    desc: "Employee roster and org hierarchy used to auto-provision agent access by department." },
  { id: "support",   name: "Support",           domain: "Customer-facing", entities: 3, tables: 5,  status: "Draft",           updated: "6h ago",  owner: "Marcus Reed",   desc: "Cases, tickets and SLA tracking for the customer-support network." },
]

const ENTITIES: EntityRow[] = [
  { id: "account",      name: "Account",      model: "CRM Core",          domain: "Customer-facing", status: "Published",       updated: "2h ago",  owner: "Sarah Chen",  records: "442K", privileges: 7, desc: "Companies, their hierarchy and the customer-360 rollups everything else joins against.",
    tables: [{ alias: "Account", role: "Primary", cols: 15, rows: "620K" }, { alias: "Account address", role: "Secondary", cols: 8, rows: "512K" }],
    rels: [{ target: "Contact", kind: "one-to-many" }, { target: "Opportunity", kind: "one-to-many" }, { target: "Case", kind: "one-to-many", incoming: true }], tags: ["core", "customer-360", "gold"] },
  { id: "contact",      name: "Contact",      model: "CRM Core",          domain: "Customer-facing", status: "Published",       updated: "6h ago",  owner: "Sarah Chen",  records: "1.2M", privileges: 5, desc: "People associated with accounts — the primary audience for the outreach network.",
    tables: [{ alias: "Contact", role: "Primary", cols: 18, rows: "1.2M" }], rels: [{ target: "Account", kind: "many-to-one", incoming: true }, { target: "Activity", kind: "one-to-many" }], tags: ["core", "customer-360"] },
  { id: "opportunity",  name: "Opportunity",  model: "CRM Core",          domain: "Customer-facing", status: "Deprecated", updated: "1h ago",  owner: "Julia Cruz",  records: "88K",  privileges: 6, desc: "Sales deals with stages, amounts and the forecast rollups the revenue network reads.",
    tables: [{ alias: "Opportunity", role: "Primary", cols: 22, rows: "88K" }, { alias: "Opportunity line", role: "Secondary", cols: 9, rows: "310K" }], rels: [{ target: "Account", kind: "many-to-one", incoming: true }, { target: "Product", kind: "many-to-many" }], tags: ["core", "revenue"] },
  { id: "case",         name: "Case",         model: "Support",           domain: "Customer-facing", status: "Published",       updated: "1d ago",  owner: "Marcus Reed", records: "204K", privileges: 4, desc: "Support cases with priority, SLA state and resolution history.",
    tables: [{ alias: "Case", role: "Primary", cols: 16, rows: "204K" }], rels: [{ target: "Account", kind: "many-to-one", incoming: true }, { target: "Ticket", kind: "one-to-many" }], tags: ["support"] },
  { id: "lead",         name: "Lead",         model: "CRM Core",          domain: "Customer-facing", status: "Draft",           updated: "3h ago",  owner: "Julia Cruz",  records: "512K", privileges: 3, desc: "Unqualified prospects fed into the lead-scoring agent before conversion.",
    tables: [{ alias: "Lead", role: "Primary", cols: 14, rows: "512K" }], rels: [{ target: "Campaign", kind: "many-to-one", incoming: true }], tags: ["marketing"] },
  { id: "campaign",     name: "Campaign",     model: "CRM Core",          domain: "Customer-facing", status: "Published",       updated: "2d ago",  owner: "Julia Cruz",  records: "1.4K", privileges: 3, desc: "Marketing campaigns and the attribution windows the analytics network reports on.",
    tables: [{ alias: "Campaign", role: "Primary", cols: 12, rows: "1.4K" }], rels: [{ target: "Lead", kind: "one-to-many" }], tags: ["marketing"] },
  { id: "product",      name: "Product",      model: "CRM Core",          domain: "Customer-facing", status: "Published",       updated: "5d ago",  owner: "Sarah Chen",  records: "3.2K", privileges: 4, desc: "Sellable products and the price-book entries opportunities line up against.",
    tables: [{ alias: "Product", role: "Primary", cols: 20, rows: "3.2K" }, { alias: "Price book entry", role: "Secondary", cols: 7, rows: "9.8K" }], rels: [{ target: "Opportunity", kind: "many-to-many", incoming: true }], tags: ["catalog"] },
  { id: "invoice",      name: "Invoice",      model: "Finance",           domain: "Back office",     status: "Published",       updated: "8h ago",  owner: "Marcus Reed", records: "156K", privileges: 6, desc: "Issued invoices with line items and the payment state reconciliation reads.",
    tables: [{ alias: "Invoice", role: "Primary", cols: 19, rows: "156K" }, { alias: "Invoice line", role: "Secondary", cols: 8, rows: "540K" }], rels: [{ target: "Account", kind: "many-to-one", incoming: true }, { target: "Payment", kind: "one-to-many" }], tags: ["finance", "gold"] },
  { id: "payment",      name: "Payment",      model: "Finance",           domain: "Back office",     status: "Deprecated", updated: "30m ago", owner: "Marcus Reed", records: "142K", privileges: 5, desc: "Received payments matched against invoices for month-end close.",
    tables: [{ alias: "Payment", role: "Primary", cols: 13, rows: "142K" }], rels: [{ target: "Invoice", kind: "many-to-one", incoming: true }], tags: ["finance"] },
  { id: "employee",     name: "Employee",     model: "People Ops",        domain: "Back office",     status: "Published",       updated: "1w ago",  owner: "Sarah Chen",  records: "4.8K", privileges: 5, desc: "Employee roster and department mapping used to provision agent access.",
    tables: [{ alias: "Employee", role: "Primary", cols: 24, rows: "4.8K" }], rels: [{ target: "Case", kind: "one-to-many" }], tags: ["people", "pii"] },
  { id: "ticket",       name: "Ticket",       model: "Support",           domain: "Customer-facing", status: "Published",       updated: "4h ago",  owner: "Marcus Reed", records: "612K", privileges: 3, desc: "Individual support interactions rolled up under a case.",
    tables: [{ alias: "Ticket", role: "Primary", cols: 15, rows: "612K" }], rels: [{ target: "Case", kind: "many-to-one", incoming: true }], tags: ["support"] },
  { id: "subscription", name: "Subscription", model: "Finance",           domain: "Back office",     status: "Draft",           updated: "2h ago",  owner: "Marcus Reed", records: "24K",  privileges: 4, desc: "Recurring subscriptions and the renewal schedule the billing network drives.",
    tables: [{ alias: "Subscription", role: "Primary", cols: 17, rows: "24K" }], rels: [{ target: "Account", kind: "many-to-one", incoming: true }], tags: ["finance", "revenue"] },
  { id: "activity",     name: "Activity",     model: "Product Analytics", domain: "Data",            status: "Published",       updated: "12m ago", owner: "Julia Cruz",  records: "9.1M", privileges: 2, desc: "Product events and interactions streamed into the retention-signals dashboard.",
    tables: [{ alias: "Activity", role: "Primary", cols: 11, rows: "9.1M" }], rels: [{ target: "Contact", kind: "many-to-one", incoming: true }], tags: ["events"] },
  { id: "session",      name: "Session",      model: "Product Analytics", domain: "Data",            status: "Deprecated", updated: "1h ago",  owner: "Julia Cruz",  records: "22M",  privileges: 2, desc: "Product sessions used to compute engagement and churn signals.",
    tables: [{ alias: "Session", role: "Primary", cols: 10, rows: "22M" }], rels: [{ target: "Activity", kind: "one-to-many" }], tags: ["events"] },
]

const TABLES: TableRow[] = ENTITIES.flatMap(e =>
  e.tables.map((t, i) => ({
    id: `${e.id}_${i}`, alias: t.alias, entity: e.name, role: t.role, cols: t.cols, rows: t.rows,
    status: e.status, updated: e.updated,
  })),
)

const REFERENCE: RefRow[] = [
  { id: "country",   name: "Country",           items: 249, origin: "External sync", referencedBy: 8, updated: "1mo ago", status: "Published" },
  { id: "currency",  name: "Currency",          items: 168, origin: "External sync", referencedBy: 6, updated: "1mo ago", status: "Published" },
  { id: "industry",  name: "Industry",          items: 24,  origin: "Manual",        referencedBy: 3, updated: "2w ago",  status: "Published" },
  { id: "leadsrc",   name: "Lead source",       items: 12,  origin: "Manual",        referencedBy: 2, updated: "3d ago",  status: "Published" },
  { id: "casepri",   name: "Case priority",     items: 4,   origin: "Manual",        referencedBy: 2, updated: "1w ago",  status: "Published" },
  { id: "oppstage",  name: "Opportunity stage", items: 7,   origin: "Manual",        referencedBy: 4, updated: "5d ago",  status: "Deprecated" },
  { id: "paymethod", name: "Payment method",    items: 9,   origin: "Manual",        referencedBy: 3, updated: "2w ago",  status: "Published" },
  { id: "region",    name: "Region",            items: 6,   origin: "Manual",        referencedBy: 5, updated: "1mo ago", status: "Published" },
  { id: "language",  name: "Language",          items: 38,  origin: "External sync", referencedBy: 2, updated: "1mo ago", status: "Published" },
  { id: "timezone",  name: "Time zone",         items: 40,  origin: "External sync", referencedBy: 1, updated: "1mo ago", status: "Draft" },
]

// ── Synthesized detail data (columns · rows · reference items) ────────────────
type Sensitivity = "None" | "PII" | "Financial" | "Confidential"
type ColumnDef = { name: string; type: string; nullable: boolean; def: string; sensitivity: Sensitivity }
const SENS_TAG: Record<Sensitivity, "neutral" | "alert" | "error"> = { None: "neutral", PII: "alert", Financial: "alert", Confidential: "error" }

function columnsFor(t: TableRow): ColumnDef[] {
  const base = t.entity.toLowerCase().replace(/[^a-z]+/g, "_")
  const pii = t.entity === "Employee" || t.entity === "Contact"
  const fin = t.entity === "Invoice" || t.entity === "Payment" || t.entity === "Subscription"
  return [
    { name: "id",           type: "uuid",           nullable: false, def: "gen_random_uuid()", sensitivity: "None" },
    { name: `${base}_name`, type: "varchar(255)",   nullable: false, def: "—",                 sensitivity: pii ? "PII" : "None" },
    { name: "status",       type: "enum",           nullable: false, def: "'active'",          sensitivity: "None" },
    { name: "owner_id",     type: "uuid · fk",      nullable: true,  def: "—",                 sensitivity: "None" },
    { name: "amount",       type: "numeric(14,2)",  nullable: true,  def: "0.00",              sensitivity: fin ? "Financial" : "None" },
    { name: "email",        type: "varchar(320)",   nullable: true,  def: "—",                 sensitivity: pii ? "PII" : "None" },
    { name: "is_active",    type: "boolean",        nullable: false, def: "true",              sensitivity: "None" },
    { name: "created_at",   type: "timestamptz",    nullable: false, def: "now()",             sensitivity: "None" },
    { name: "updated_at",   type: "timestamptz",    nullable: false, def: "now()",             sensitivity: "None" },
  ]
}

function sampleValue(c: ColumnDef, i: number): string {
  if (c.name === "id")          return `…${(1000 + i * 37).toString(16)}`
  if (c.type.startsWith("uuid"))return i % 2 ? "—" : `…${(200 + i).toString(16)}`
  if (c.name === "status")      return ["active", "active", "pending", "closed", "active"][i % 5]
  if (c.type.startsWith("numeric")) return (1250.5 * (i + 1)).toFixed(2)
  if (c.type === "boolean")     return i % 3 ? "true" : "false"
  if (c.name === "email")       return c.sensitivity === "PII" ? "•••@•••" : `user${i + 1}@acme.com`
  if (c.type.startsWith("timestamp")) return `2026-08-0${(i % 5) + 1} 09:${10 + i}`
  return `${c.name.replace(/_/g, " ")} ${i + 1}`
}
function sampleRows(cols: ColumnDef[], n = 6): Record<string, string>[] {
  return Array.from({ length: n }, (_, i) => Object.fromEntries(cols.map(c => [c.name, sampleValue(c, i)])))
}

type RefItem = { key: string; label: string; code: string; active: boolean }
const REF_ITEMS: Record<string, RefItem[]> = {
  country:  [{ key: "US", label: "United States", code: "840", active: true }, { key: "GB", label: "United Kingdom", code: "826", active: true }, { key: "DE", label: "Germany", code: "276", active: true }, { key: "MX", label: "Mexico", code: "484", active: true }, { key: "JP", label: "Japan", code: "392", active: true }],
  currency: [{ key: "USD", label: "US Dollar", code: "$", active: true }, { key: "EUR", label: "Euro", code: "€", active: true }, { key: "GBP", label: "Pound Sterling", code: "£", active: true }, { key: "JPY", label: "Japanese Yen", code: "¥", active: true }],
  oppstage: [{ key: "prospect", label: "Prospecting", code: "10", active: true }, { key: "qualify", label: "Qualification", code: "20", active: true }, { key: "propose", label: "Proposal", code: "60", active: true }, { key: "won", label: "Closed Won", code: "100", active: true }, { key: "lost", label: "Closed Lost", code: "0", active: true }],
  casepri:  [{ key: "urgent", label: "Urgent", code: "P1", active: true }, { key: "high", label: "High", code: "P2", active: true }, { key: "medium", label: "Medium", code: "P3", active: true }, { key: "low", label: "Low", code: "P4", active: true }],
}
function itemsFor(r: RefRow): RefItem[] {
  return REF_ITEMS[r.id] ?? Array.from({ length: Math.min(6, r.items) }, (_, i) => ({ key: `${r.id.slice(0, 3).toUpperCase()}${i + 1}`, label: `${r.name} value ${i + 1}`, code: String(i + 1), active: i < r.items - 1 }))
}

// ── DS Table wrappers (Columns · Data · Items) ────────────────────────────────
function ColumnsTable({ cols }: { cols: ColumnDef[] }) {
  const columns: TableColumn<ColumnDef>[] = [
    { key: "name", header: "Column", render: r => <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "var(--color-text-title)" }}>{r.name}</span> },
    { key: "type", header: "Type",   render: r => <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.type}</span> },
    { key: "nullable", header: "Nullable", render: r => <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.nullable ? "Yes" : "No"}</span> },
    { key: "def", header: "Default", render: r => <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.def}</span> },
    { key: "sensitivity", header: "Sensitivity", render: r => <Tag variant={SENS_TAG[r.sensitivity]} size="sm">{r.sensitivity}</Tag> },
  ]
  return <div style={{ overflowX: "auto" }}><Table columns={columns} data={cols} size="sm" /></div>
}
function DataTable({ cols }: { cols: ColumnDef[] }) {
  const shown = cols.slice(0, 6)
  const columns: TableColumn<Record<string, string>>[] = shown.map(c => ({
    key: c.name,
    header: c.name,
    render: (row: Record<string, string>) => (
      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "var(--color-text-body)" }}>{row[c.name]}</span>
    ),
  }))
  return <div style={{ overflowX: "auto" }}><Table columns={columns} data={sampleRows(shown)} size="sm" /></div>
}
function ItemsTable({ items }: { items: RefItem[] }) {
  const columns: TableColumn<RefItem>[] = [
    { key: "key",   header: "Key",   render: r => <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "var(--color-text-title)" }}>{r.key}</span> },
    { key: "label", header: "Label", render: r => <span style={{ fontSize: 13, color: "var(--color-text-title)" }}>{r.label}</span> },
    { key: "code",  header: "Code",  render: r => <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.code}</span> },
    { key: "active", header: "Status", render: r => <Tag variant={r.active ? "success" : "neutral"} size="sm">{r.active ? "Active" : "Retired"}</Tag> },
  ]
  return <div style={{ overflowX: "auto" }}><Table columns={columns} data={items} size="sm" /></div>
}

// ── Privileges + History depth (DS Table) ────────────────────────────────────
type PrivRow = { name: string; type: "Standard" | "Custom"; grantedTo: string }
function privilegesFor(entity: EntityRow): PrivRow[] {
  const std: PrivRow[] = [
    { name: "Read", type: "Standard", grantedTo: "All roles" },
    { name: "List", type: "Standard", grantedTo: "All roles" },
    { name: "Create", type: "Standard", grantedTo: "Data Steward · Admin" },
    { name: "Update", type: "Standard", grantedTo: "Data Steward · Admin" },
    { name: "Delete", type: "Standard", grantedTo: "Admin" },
  ]
  const names = ["Read revenue", "Merge records", "Export", "Manage access", "Read PII"]
  const grants = ["Finance · Admin", "Data Steward", "Admin", "Admin", "Compliance"]
  const custom: PrivRow[] = Array.from({ length: Math.max(0, entity.privileges - 5) }, (_, i) => ({ name: names[i % names.length], type: "Custom", grantedTo: grants[i % grants.length] }))
  return [...std, ...custom]
}
function PrivilegesTable({ entity }: { entity: EntityRow }) {
  const cols: TableColumn<PrivRow>[] = [
    { key: "name", header: "Privilege", render: r => <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{r.name}</span> },
    { key: "type", header: "Type", render: r => <Tag variant={r.type === "Custom" ? "purple" : "neutral"} size="sm">{r.type}</Tag> },
    { key: "grantedTo", header: "Granted to (roles)", render: r => <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.grantedTo}</span> },
  ]
  return <div style={{ overflowX: "auto" }}><Table columns={cols} data={privilegesFor(entity)} size="sm" /></div>
}

type HistRow = { version: string; change: string; kind: "Additive" | "Breaking" | "Migrating" | "Created"; author: string; when: string }
function historyFor(status: Status, updated: string): HistRow[] {
  return [
    { version: "v4", change: status === "Published" ? "Current published version" : "Deprecated staged for publish", kind: "Additive", author: "Sarah Chen", when: updated },
    { version: "v3", change: "Added is_active column", kind: "Additive", author: "Marcus Reed", when: "2w ago" },
    { version: "v2", change: "New relationship to Contact", kind: "Migrating", author: "Julia Cruz", when: "1mo ago" },
    { version: "v1", change: "Object created", kind: "Created", author: "Sarah Chen", when: "3mo ago" },
  ]
}
const KIND_TAG: Record<HistRow["kind"], "success" | "error" | "alert" | "neutral"> = { Additive: "success", Breaking: "error", Migrating: "alert", Created: "neutral" }
function HistoryTable({ status, updated }: { status: Status; updated: string }) {
  const cols: TableColumn<HistRow>[] = [
    { key: "version", header: "Version", render: r => <Tag variant="neutral" size="sm">{r.version}</Tag> },
    { key: "change", header: "Change", render: r => <span style={{ fontSize: 13, color: "var(--color-text-title)" }}>{r.change}</span> },
    { key: "kind", header: "Type", render: r => <Tag variant={KIND_TAG[r.kind]} size="sm">{r.kind}</Tag> },
    { key: "author", header: "Author", render: r => <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.author}</span> },
    { key: "when", header: "When", render: r => <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.when}</span> },
  ]
  return <div style={{ overflowX: "auto" }}><Table columns={cols} data={historyFor(status, updated)} size="sm" /></div>
}

// ── Detail widgets ────────────────────────────────────────────────────────────
function KpiContent({ value, feedback, iconName, iconVariant }: {
  value: string; feedback: string; iconName: string
  iconVariant: "informative" | "success" | "neutral" | "alert" | "error"
}) {
  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: "var(--color-text-title)" }}>{value}</span>
        <HighlightIcon size="lg" variant={iconVariant} iconName={iconName} />
      </div>
      <span style={{ fontSize: 12, color: "var(--color-text-subtitle)", marginTop: 6, display: "block" }}>{feedback}</span>
    </div>
  )
}

function DescriptionContent({ text }: { text: string }) {
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <p style={{ fontSize: 14, lineHeight: "22px", color: "var(--color-text-body)", margin: 0 }}>{text}</p>
    </div>
  )
}

function KVContent({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div style={{ padding: "0 16px 16px" }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "8px 0", borderBottom: "0.5px solid var(--field-border)" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.label}</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-title)", textAlign: "right" }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function TablesContent({ tables }: { tables: TableRef[] }) {
  return (
    <div className="flex flex-col gap-[8px]" style={{ padding: "0 16px 16px" }}>
      {tables.map(t => (
        <div key={t.alias} className="flex items-center gap-[10px]" style={{ padding: "8px 0", borderBottom: "0.5px solid var(--field-border)" }}>
          <HighlightIcon size="sm" variant={t.role === "Primary" ? "informative" : "neutral"} iconName="Table" />
          <div className="flex flex-col" style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{t.alias}</span>
            <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>{t.role} · {t.cols} columns · {t.rows} rows</span>
          </div>
          <Tag variant={t.role === "Primary" ? "informative" : "neutral"} size="sm">{t.role}</Tag>
        </div>
      ))}
    </div>
  )
}

function RelsContent({ rels }: { rels: RelRef[] }) {
  // A7: group into Outgoing + Incoming (read-only, edit at source) sections
  const outgoing = rels.filter(r => !r.incoming)
  const incoming = rels.filter(r => r.incoming)
  const row = (r: RelRef, i: number) => (
    <div key={i} className="flex items-center gap-[10px]" style={{ padding: "8px 0", borderBottom: "0.5px solid var(--field-border)" }}>
      <HighlightIcon size="sm" variant={r.incoming ? "neutral" : "purple"} iconName={r.incoming ? "ArrowDownLeft" : "ArrowUpRight"} />
      <div className="flex flex-col" style={{ flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{r.target}</span>
        <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.incoming ? "Incoming" : "Outgoing"} · {r.kind}</span>
      </div>
    </div>
  )
  const secHeader = (label: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--color-text-subtitle)", padding: "6px 0" }}>{label}</div>
  )
  return (
    <div className="flex flex-col gap-[8px]" style={{ padding: "0 16px 16px" }}>
      {outgoing.length > 0 && incoming.length > 0 && secHeader("Outgoing")}
      {outgoing.map((r, i) => row(r, i))}
      {incoming.length > 0 && (outgoing.length > 0 ? secHeader("Incoming · edit at source") : null)}
      {incoming.map((r, i) => row(r, outgoing.length + i))}
    </div>
  )
}

// ═══ API contract two-pane builder (§12/§17.8) — composed from DS primitives ═══
type ApiOp = "create" | "read" | "update" | "delete" | "list"
type ApiEndpoint = { key: string; op: ApiOp; method: string; name: string; path: string; custom: boolean; dname?: string }
type DefMode = "none" | "default" | "hardcoded"
type ReqField = { include: boolean; mode: DefMode; val: string }
type ApiFilter = { field: string; op: string; val: string; join: "AND" | "OR" }
type ApiCfg = { enabled: boolean; privs: string[]; req: Record<string, ReqField>; resp: Record<string, boolean>; filters: ApiFilter[]; rels: Record<string, string> }

const API_OPS: { op: ApiOp; label: string; method: string }[] = [
  { op: "create", label: "Create", method: "POST" },
  { op: "read", label: "Read by ID", method: "GET" },
  { op: "update", label: "Update", method: "PATCH" },
  { op: "delete", label: "Delete", method: "DELETE" },
  { op: "list", label: "List", method: "GET" },
]
const METHOD_TAG: Record<string, "success" | "informative" | "alert" | "error"> = { GET: "success", POST: "informative", PATCH: "alert", DELETE: "error" }
const PRIV_CATALOG = ["Read", "Create", "Update", "Delete", "List", "Manage", "Export", "Read PII"]
const FILTER_OPS = ["eq", "neq", "gt", "gte", "lt", "lte", "contains", "in"]
const REL_MODES = ["none", "reference", "embed", "expandable"]

// ── API — V1.2 simple view (Edgardo canonical V1.2): 5 default endpoints, enable/disable + description only. Full two-pane builder is Full vision. ──
const API_DESC: Record<ApiOp, string> = {
  create: "Insert a new record",
  read: "Fetch one record by id",
  update: "Modify fields on a record",
  delete: "Remove a record",
  list: "Query the collection with paging",
}
function ApiSimpleView({ entity }: { entity: EntityRow }) {
  const s = `/${entity.id.replace(/_/g, "-")}s`
  const defs = useMemo<ApiEndpoint[]>(() => API_OPS.map(o => {
    const byId = o.op === "read" || o.op === "update" || o.op === "delete"
    return { key: `d_${o.op}`, op: o.op, method: o.method, name: `${o.op}_${entity.id}`, path: s + (byId ? "/{id}" : ""), custom: false }
  }), [entity, s])
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(defs.map(d => [d.key, true])))
  const enabledCount = defs.filter(d => on[d.key]).length
  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--surface)", border: "0.5px solid var(--field-border)", borderRadius: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--color-text-subtitle)" }}>Base URL</span>
        <code style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, color: "var(--color-text-title)" }}>/api/v1{s}</code>
        <Tag variant="informative" size="sm">v1</Tag>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--color-text-subtitle)" }}>{enabledCount} of {defs.length} endpoints enabled</span>
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-subtitle)", margin: "0 0 10px" }}>
        Auto-generated endpoints for {entity.name}. Toggle each on or off and set its description — the request/response builder and custom endpoints are Full vision.
      </p>
      <div style={{ border: "0.5px solid var(--field-border)", borderRadius: 10, overflow: "hidden" }}>
        {defs.map((d, i) => (
          <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", borderTop: i ? "0.5px solid var(--field-border)" : "none", opacity: on[d.key] ? 1 : 0.55 }}>
            <Tag variant={METHOD_TAG[d.method]} size="sm">{d.method}</Tag>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{d.name}</span>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: "var(--color-text-subtitle)", border: "1px solid var(--field-border)", borderRadius: 5, padding: "1px 6px", textTransform: "uppercase", letterSpacing: ".03em" }}>Default</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--color-text-subtitle)", marginTop: 2 }}>
                <code style={{ fontFamily: "var(--font-mono, monospace)" }}>{d.path}</code> · {API_DESC[d.op]}
              </div>
            </div>
            <Toggle size="sm" checked={on[d.key]} onChange={v => setOn(p => ({ ...p, [d.key]: v }))} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ApiBuilder({ entity }: { entity: EntityRow }) {
  const fields = useMemo(() => {
    const p = entity.tables.find(t => t.role === "Primary") ?? entity.tables[0]
    return columnsFor({ id: `${entity.id}_0`, alias: p.alias, entity: entity.name, role: "Primary", cols: p.cols, rows: p.rows, status: entity.status, updated: entity.updated })
  }, [entity])
  const s = `/${entity.id.replace(/_/g, "-")}s`
  const baseUrl = `/api/v1${s}`
  const defaults = useMemo<ApiEndpoint[]>(() => API_OPS.map(o => {
    const byId = o.op === "read" || o.op === "update" || o.op === "delete"
    return { key: `d_${o.op}`, op: o.op, method: o.method, name: `${o.op}_${entity.id}`, path: s + (byId ? "/{id}" : ""), custom: false }
  }), [entity, s])

  const initCfg = useMemo(() => (ep: ApiEndpoint): ApiCfg => {
    const req: Record<string, ReqField> = {}, resp: Record<string, boolean> = {}
    fields.forEach(f => { req[f.name] = { include: f.name !== "id" && !f.name.endsWith("_at"), mode: "none", val: "" }; resp[f.name] = true })
    const rels: Record<string, string> = {}; entity.rels.forEach(r => { rels[r.target] = "reference" })
    const lbl = API_OPS.find(o => o.op === ep.op)!.label.replace(" by ID", "")
    return { enabled: true, privs: ep.custom ? [] : [lbl], req, resp, filters: [], rels }
  }, [fields, entity])

  const [customs, setCustoms] = useState<ApiEndpoint[]>([])
  const [cfg, setCfg] = useState<Record<string, ApiCfg>>(() => Object.fromEntries(defaults.map(ep => [ep.key, initCfg(ep)])))
  const [sel, setSel] = useState("d_create")
  const [menu, setMenu] = useState<{ id: string; left: number; top: number } | null>(null)
  const [dv, setDv] = useState<{ key: string; field: string; mode: DefMode; val: string } | null>(null)

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    window.addEventListener("pointerdown", close)
    return () => window.removeEventListener("pointerdown", close)
  }, [menu])

  const endpoints = [...defaults, ...customs]
  const current = endpoints.find(e => e.key === sel) ?? defaults[0]
  const c = cfg[current.key] ?? cfg[defaults[0].key]
  const patch = (key: string, fn: (p: ApiCfg) => ApiCfg) => setCfg(prev => ({ ...prev, [key]: fn(prev[key]) }))
  const anchor = (e: ReactMouseEvent<HTMLElement>, id: string) => {
    const r = e.currentTarget.getBoundingClientRect()
    setMenu({ id, left: Math.min(r.left, window.innerWidth - 272), top: r.bottom + 4 })
  }
  const enabledCount = endpoints.filter(e => cfg[e.key]?.enabled).length

  const createCustom = (op: ApiOp) => {
    const o = API_OPS.find(x => x.op === op)!
    const byId = op === "read" || op === "update" || op === "delete"
    const n = customs.filter(x => x.op === op).length + 1
    const label = `${o.label.replace(" by ID", "")} variant ${n}`
    const key = `c_${op}_${customs.length}_${n}`
    const ep: ApiEndpoint = { key, op, method: o.method, name: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"), path: `${s}${byId ? "/{id}" : ""}/${o.op}${n}`, custom: true, dname: label }
    setCustoms(prev => [...prev, ep]); setCfg(prev => ({ ...prev, [key]: initCfg(ep) })); setSel(key); setMenu(null)
  }
  const deleteCustom = (key: string) => {
    setCustoms(prev => prev.filter(e => e.key !== key))
    setCfg(prev => { const n = { ...prev }; delete n[key]; return n })
    setSel("d_create"); setMenu(null)
  }
  const patchFilter = (i: number, k: keyof ApiFilter, v: string) => patch(current.key, p => ({ ...p, filters: p.filters.map((f, idx) => idx === i ? { ...f, [k]: v } : f) }))

  const reqFields = fields.filter(f => f.name !== "id" && !f.name.endsWith("_at"))
  const showReq = current.op === "create" || current.op === "update"
  const showResp = current.op !== "delete"
  const showQuery = current.op === "list" || current.op === "read"

  // ── section: access control ──
  const accessSection = (
    <div style={{ padding: "14px 0", borderBottom: "0.5px solid var(--field-border)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-title)" }}>Access control</span>
        <span style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>Caller needs <b>any one</b> of these (OR)</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
        {c.privs.length === 0 && <span style={{ fontSize: 11.5, color: "var(--color-text-subtitle)", fontStyle: "italic" }}>No privilege required — any authenticated caller</span>}
        {c.privs.map(p => (
          <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Tag variant="informative" size="sm">{p}</Tag>
            <button onClick={() => patch(current.key, x => ({ ...x, privs: x.privs.filter(y => y !== p) }))} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-text-subtitle)", fontSize: 13, lineHeight: 1 }} aria-label={`Remove ${p}`}>×</button>
          </span>
        ))}
        <span onClick={e => anchor(e, "priv")} style={{ display: "inline-flex" }}>
          <Button variant="secondary" size="sm"><LucideIcons.Plus size={13} /> Add privilege</Button>
        </span>
      </div>
    </div>
  )

  // ── request/response tables ──
  const defCell = (f: ColumnDef) => {
    const rf = c.req[f.name]
    if (!rf.include) return <span style={{ color: "var(--color-text-subtitle)", fontSize: 12 }}>—</span>
    const label = rf.mode === "hardcoded" ? `⚑ ${rf.val || "value"}` : rf.mode === "default" ? `⇢ ${rf.val || "value"}` : "Set…"
    return <Button variant="tertiary" size="sm" onClick={() => setDv({ key: current.key, field: f.name, mode: rf.mode, val: rf.val })}>{label}</Button>
  }
  const reqCols: TableColumn<ColumnDef>[] = [
    { key: "name", header: "Field", render: f => <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "var(--color-text-title)" }}>{f.name}{!f.nullable && <span style={{ color: "var(--field-text-error)" }}> *</span>}</span> },
    { key: "type", header: "Type", render: f => <span style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>{f.type}</span> },
    { key: "include", header: "Include", render: f => <Toggle size="sm" checked={c.req[f.name].include} onChange={v => patch(current.key, p => ({ ...p, req: { ...p.req, [f.name]: { ...p.req[f.name], include: v, ...(v ? {} : { mode: "none" as DefMode, val: "" }) } } }))} /> },
    { key: "def", header: "Default value", render: defCell },
  ]
  const respCols: TableColumn<ColumnDef>[] = [
    { key: "name", header: "Field", render: f => <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "var(--color-text-title)" }}>{f.name}</span> },
    { key: "type", header: "Type", render: f => <span style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>{f.type}</span> },
    { key: "include", header: "Include", render: f => <Toggle size="sm" checked={c.resp[f.name]} onChange={v => patch(current.key, p => ({ ...p, resp: { ...p.resp, [f.name]: v } }))} /> },
  ]
  const sectionHead = (title: string, note: string) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-title)" }}>{title}</span>
      <span style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>{note}</span>
    </div>
  )

  // ── OpenAPI preview ──
  const spec = (() => {
    const op: Record<string, unknown> = { operationId: current.name, summary: current.custom ? current.dname : `${API_OPS.find(o => o.op === current.op)!.label} ${entity.name}` }
    if (c.privs.length) op.security = [{ privileges: c.privs }]
    if (showReq) op.requestBody = { required: true, content: { "application/json": { schema: { type: "object", properties: Object.fromEntries(reqFields.filter(f => c.req[f.name].include).map(f => [f.name, { type: f.type }])) } } } }
    if (showResp) { const props = Object.fromEntries(fields.filter(f => c.resp[f.name]).map(f => [f.name, { type: f.type }])); op.responses = { "200": { description: "OK", content: { "application/json": { schema: current.op === "list" ? { type: "array", items: { type: "object", properties: props } } : { type: "object", properties: props } } } } } }
    else op.responses = { "204": { description: "No Content" } }
    if (showQuery && c.filters.length) op["x-predefined-filters"] = c.filters.map(f => `${f.field} ${f.op} ${f.val}`)
    return { [current.path]: { [current.method.toLowerCase()]: op } }
  })()

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* base URL banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--surface)", border: "0.5px solid var(--field-border)", borderRadius: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--color-text-subtitle)" }}>Base URL</span>
        <code style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, color: "var(--color-text-title)" }}>{baseUrl}</code>
        <Tag variant="informative" size="sm">v1</Tag>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--color-text-subtitle)" }}>{enabledCount} of {endpoints.length} endpoints enabled</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14, alignItems: "start" }}>
        {/* LEFT — grouped endpoint list */}
        <div style={{ border: "0.5px solid var(--field-border)", borderRadius: 10, overflow: "hidden" }}>
          {API_OPS.map(o => {
            const rows = endpoints.filter(e => e.op === o.op)
            return (
              <div key={o.op} style={{ borderBottom: "0.5px solid var(--field-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface)", fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--color-text-subtitle)" }}>
                  <span>{o.label}</span><span style={{ marginLeft: "auto", fontSize: 10, background: "var(--field-border)", color: "var(--color-text-subtitle)", borderRadius: 9, padding: "0 6px" }}>{rows.length}</span>
                </div>
                {rows.map(ep => {
                  const ec = cfg[ep.key]
                  const on = ep.key === sel
                  return (
                    <div key={ep.key} onClick={() => setSel(ep.key)} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "9px 12px", borderTop: "0.5px solid var(--field-border)", cursor: "pointer", background: on ? "var(--tag-informative-bg)" : "transparent", boxShadow: on ? "inset 2px 0 0 var(--primary)" : "none", opacity: ec?.enabled ? 1 : 0.5 }}>
                      <Tag variant={METHOD_TAG[ep.method]} size="sm">{ep.method}</Tag>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-title)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.custom ? ep.dname : ep.name}</span>
                          {ep.custom && <Tag variant="lightBlue" size="sm">Custom</Tag>}
                        </div>
                        <code style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "var(--color-text-subtitle)" }}>{ep.path}</code>
                      </div>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: ec?.enabled ? "var(--tag-success-bd)" : "var(--field-border)" }} />
                    </div>
                  )
                })}
              </div>
            )
          })}
          <span onClick={e => anchor(e, "newcustom")} style={{ display: "block" }}>
            <button style={{ width: "100%", padding: 10, border: "none", borderTop: "1px dashed var(--field-border)", background: "transparent", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ New custom endpoint</button>
          </span>
        </div>

        {/* RIGHT — config for the selected endpoint */}
        <div style={{ border: "0.5px solid var(--field-border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 16px", borderBottom: "0.5px solid var(--field-border)" }}>
            <Tag variant={METHOD_TAG[current.method]} size="sm">{current.method}</Tag>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)" }}>{current.custom ? current.dname : current.name}</span>
                <Tag variant={current.custom ? "lightBlue" : "neutral"} size="sm">{current.custom ? "Custom" : "Default"}</Tag>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--color-text-subtitle)", marginTop: 3 }}>
                <code style={{ fontFamily: "var(--font-mono, monospace)" }}>{current.path}</code>{current.custom ? ` · derived from ${API_OPS.find(o => o.op === current.op)!.label}` : ""}
              </div>
            </div>
            <Toggle size="sm" checked={c.enabled} onChange={v => patch(current.key, p => ({ ...p, enabled: v }))} label={c.enabled ? "Enabled" : "Disabled"} />
            {current.custom && (
              <span onClick={e => anchor(e, `kebab:${current.key}`)} style={{ display: "inline-flex" }}>
                <Button variant="tertiary" size="sm"><LucideIcons.EllipsisVertical size={15} /></Button>
              </span>
            )}
          </div>

          <div style={{ padding: "6px 16px 18px", opacity: c.enabled ? 1 : 0.5, pointerEvents: c.enabled ? "auto" : "none" }}>
            {accessSection}

            {showReq && (
              <div style={{ padding: "14px 0", borderBottom: "0.5px solid var(--field-border)" }}>
                {sectionHead("Request body", "Fields the caller may send. Excluded fields fall back to a default.")}
                <div style={{ overflowX: "auto" }}><Table columns={reqCols} data={reqFields} size="sm" /></div>
              </div>
            )}
            {showResp && (
              <div style={{ padding: "14px 0", borderBottom: "0.5px solid var(--field-border)" }}>
                {sectionHead("Response fields", "Fields returned in the payload.")}
                <div style={{ overflowX: "auto" }}><Table columns={respCols} data={fields} size="sm" /></div>
              </div>
            )}
            {showQuery && (
              <div style={{ padding: "14px 0", borderBottom: "0.5px solid var(--field-border)" }}>
                {sectionHead("Predefined filters", "Baked into the query; callers can add more at call time.")}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 9 }}>
                  {c.filters.length === 0 && <span style={{ fontSize: 11.5, color: "var(--color-text-subtitle)", fontStyle: "italic" }}>No predefined filters — returns every record the caller can access.</span>}
                  {c.filters.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      {i > 0
                        ? <Button variant="secondary" size="sm" onClick={() => patchFilter(i, "join", f.join === "AND" ? "OR" : "AND")}>{f.join}</Button>
                        : <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-subtitle)", minWidth: 44 }}>WHERE</span>}
                      <span onClick={e => anchor(e, `filter:${i}:field`)} style={{ display: "inline-flex", minWidth: 150 }}><Select value={f.field} placeholder="field" size="sm" /></span>
                      <span onClick={e => anchor(e, `filter:${i}:op`)} style={{ display: "inline-flex", minWidth: 110 }}><Select value={f.op} placeholder="operator" size="sm" /></span>
                      <div style={{ flex: 1, minWidth: 80 }}><Input size="sm" placeholder="value" value={f.val} onChange={ev => patchFilter(i, "val", (ev.target as HTMLInputElement).value)} /></div>
                      <Button variant="tertiary" size="sm" onClick={() => patch(current.key, p => ({ ...p, filters: p.filters.filter((_, idx) => idx !== i) }))}><LucideIcons.X size={14} /></Button>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="sm" onClick={() => patch(current.key, p => ({ ...p, filters: [...p.filters, { field: (fields[1] ?? fields[0]).name, op: "eq", val: "", join: "AND" }] }))}><LucideIcons.Plus size={13} /> Add filter</Button>
              </div>
            )}
            {showQuery && entity.rels.length > 0 && (
              <div style={{ padding: "14px 0", borderBottom: "0.5px solid var(--field-border)" }}>
                {sectionHead("Related entities", "Embed inline, reference by ID, or expose as expandable.")}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {entity.rels.map(r => (
                    <div key={r.target} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12.5, color: "var(--color-text-title)", flex: 1 }}>{r.target}<span style={{ fontSize: 11, color: "var(--color-text-subtitle)", marginLeft: 8 }}>{r.kind}</span></span>
                      <SwitchTab size="s" items={REL_MODES.map(m => ({ id: m, label: m }))} value={c.rels[r.target] ?? "reference"} onChange={m => patch(current.key, p => ({ ...p, rels: { ...p.rels, [r.target]: m } }))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: "14px 0" }}>
              {sectionHead("OpenAPI", "Generated from this contract")}
              <pre style={{ margin: 0, padding: "12px 14px", background: "var(--canvas)", border: "0.5px solid var(--field-border)", borderRadius: 8, fontFamily: "var(--font-mono, monospace)", fontSize: 11, lineHeight: 1.55, color: "var(--color-text-subtitle)", overflow: "auto", maxHeight: 300, whiteSpace: "pre" }}>{JSON.stringify(spec, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* anchored menus */}
      {menu && (
        <div style={{ position: "fixed", left: menu.left, top: menu.top, zIndex: 10002 }} onPointerDown={e => e.stopPropagation()}>
          <Menu>
            {menu.id === "newcustom" && API_OPS.map(o => (
              <MenuItem key={o.op} label={`Based on ${o.label}`} leadingIcon={<Tag variant={METHOD_TAG[o.method]} size="sm">{o.method}</Tag>} onClick={() => createCustom(o.op)} />
            ))}
            {menu.id.startsWith("kebab:") && (
              <>
                <MenuItem label="Duplicate" leadingIcon={<LucideIcons.Copy size={14} />} onClick={() => { const src = endpoints.find(e => e.key === menu.id.slice(6)); if (src) createCustom(src.op); }} />
                <MenuDivider />
                <MenuItem label="Delete endpoint" leadingIcon={<LucideIcons.Trash2 size={14} />} onClick={() => deleteCustom(menu.id.slice(6))} />
              </>
            )}
            {menu.id === "priv" && PRIV_CATALOG.map(p => (
              <MenuItem key={p} label={p} trailingElement={c.privs.includes(p) ? <LucideIcons.Check size={14} /> : undefined} onClick={() => patch(current.key, x => ({ ...x, privs: x.privs.includes(p) ? x.privs.filter(y => y !== p) : [...x.privs, p] }))} />
            ))}
            {menu.id.startsWith("filter:") && menu.id.endsWith(":field") && fields.map(f => (
              <MenuItem key={f.name} label={f.name} onClick={() => { patchFilter(Number(menu.id.split(":")[1]), "field", f.name); setMenu(null) }} />
            ))}
            {menu.id.startsWith("filter:") && menu.id.endsWith(":op") && FILTER_OPS.map(op => (
              <MenuItem key={op} label={op} onClick={() => { patchFilter(Number(menu.id.split(":")[1]), "op", op); setMenu(null) }} />
            ))}
          </Menu>
        </div>
      )}

      {/* default-value editor */}
      <ModalDialog
        isOpen={!!dv}
        onClose={() => setDv(null)}
        variant="content"
        iconName="SlidersHorizontal"
        title={dv ? `Default value · ${dv.field}` : "Default value"}
        description="When the caller omits this field, the API supplies this value."
        slot={dv && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SwitchTab size="s" items={[{ id: "none", label: "System default" }, { id: "default", label: "Fallback ⇢" }, { id: "hardcoded", label: "Hardcoded ⚑" }]} value={dv.mode} onChange={m => setDv({ ...dv, mode: m as DefMode })} />
            <Input size="sm" placeholder={dv.mode === "none" ? "Uses the column default" : "value"} value={dv.val} disabled={dv.mode === "none"} onChange={ev => setDv({ ...dv, val: (ev.target as HTMLInputElement).value })} />
          </div>
        )}
        ctaSecondary={{ label: "Cancel", onClick: () => setDv(null) }}
        ctaPrimary={{ label: "Save", onClick: () => { if (dv) patch(dv.key, p => ({ ...p, req: { ...p.req, [dv.field]: { include: true, mode: dv.mode, val: dv.mode === "none" ? "" : dv.val } } })); setDv(null) } }}
      />
    </div>
  )
}

// ── Entity detail (full page) ──────────────────────────────────────────────────
function EntityDetailView({ entity, onBack }: { entity: EntityRow; onBack: () => void }) {
  const [tab, setTab] = useState("overview")
  const pending = entity.status !== "Published"
  const scope = useScope()
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "tables", label: `Tables · ${entity.tables.length}` },
    { id: "relationships", label: `Relationships · ${entity.rels.length}` },
    ...(atLeast(scope, "v1.5") ? [{ id: "privileges", label: `Privileges · ${entity.privileges}` }, { id: "api", label: "API contracts" }] : []),
    ...(atLeast(scope, "v2") ? [{ id: "history", label: "History" }] : []),
  ]
  const shown = tabs.some(t => t.id === tab) ? tab : "overview"

  return (
    <ScreenLayout
      workspaceName="Acme Corp" userName="Thomas González" userEmail="thomas@acme.com"
      sidebarItems={SIDEBAR_ITEMS} activeSidebarId="models"
      header={(isScrolled) => (
        <div>
          {!isScrolled && (
            <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: "0 0 6px 0", color: "var(--primary)" }}>
              <LucideIcons.ChevronLeft size={13} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{entity.model} · Entities</span>
            </button>
          )}
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={entity.name}
            description={`${entity.id} · ${entity.domain} · Owned by ${entity.owner} · Updated ${entity.updated}`}
            icon={LucideIcons.Box}
            tag={<Tag variant={STATUS_TAG[entity.status]} size="sm">{entity.status}</Tag>}
            secondaryAction={<Button variant="secondary" size="sm"><LucideIcons.Pencil size={13} /> Edit</Button>}
            primaryAction={atLeast(scope, "v1.5")
              ? (pending
                ? <Button variant="main" size="sm"><LucideIcons.UploadCloud size={13} /> Publish</Button>
                : <Button variant="secondary" size="sm"><LucideIcons.Check size={13} /> Published</Button>)
              : undefined}
          />
        </div>
      )}
    >
      <Tabs items={tabs} activeId={shown} onChange={setTab} className="mb-[16px]" />

      {shown === "overview" && (
        <WidgetCanvasView
          initialSlots={[
            // R3: Overview = basic info (Description + Details) at V1; KPI tiles + Tables preview are Full vision
            ...(atLeast(scope, "v2") ? [
            { uid: "tables",   title: "Tables",        colSpan: 1, content: <KpiContent value={String(entity.tables.length)} feedback={`${entity.tables.filter(t => t.role === "Primary").length} primary`} iconName="Table" iconVariant="informative" /> },
            { uid: "records",  title: "Records",       colSpan: 1, content: <KpiContent value={entity.records} feedback={`Updated ${entity.updated}`} iconName="Database" iconVariant="neutral" /> },
            { uid: "rels",     title: "Relationships", colSpan: 1, content: <KpiContent value={String(entity.rels.length)} feedback={`${entity.rels.filter(r => !r.incoming).length} outgoing`} iconName="Share2" iconVariant="neutral" /> },
            { uid: "status",   title: "Status",        colSpan: 1, content: <KpiContent value={entity.status} feedback={pending ? "Unpublished changes" : "Live"} iconName={pending ? "GitPullRequestArrow" : "CircleCheck"} iconVariant={STATUS_KPI[entity.status]} /> },
            ] as CanvasSlot[] : []),
            { uid: "desc",     title: "Description",   colSpan: 2, widthClass: "wide", content: <DescriptionContent text={entity.desc} /> },
            { uid: "details",  title: "Details",       colSpan: 1, content: <KVContent rows={[
              { label: "Model",     value: entity.model },
              { label: "Domain",    value: entity.domain },
              { label: "Owner",     value: entity.owner },
              { label: "Records",   value: entity.records },
              { label: "Privileges",value: String(entity.privileges) },
            ]} /> },
            ...(atLeast(scope, "v2") ? [{ uid: "tbl",      title: "Tables",        colSpan: 3, widthClass: "full", content: <TablesContent tables={entity.tables} /> }] as CanvasSlot[] : []),
          ] satisfies CanvasSlot[]}
        />
      )}
      {shown === "tables"        && <TablesContent tables={entity.tables} />}
      {shown === "relationships" && <RelsContent rels={entity.rels} />}
      {shown === "privileges"    && <PrivilegesTable entity={entity} />}
      {shown === "api"           && (atLeast(scope, "v2") ? <ApiBuilder entity={entity} /> : <ApiSimpleView entity={entity} />)}
      {shown === "history"       && <HistoryTable status={entity.status} updated={entity.updated} />}
    </ScreenLayout>
  )
}

// ── Reusable list-rows content (model→entities/tables · referenced-by) ────────
type RowVariant = "informative" | "success" | "neutral" | "alert" | "error" | "purple"
function ListRows({ rows }: { rows: { icon: string; variant: RowVariant; title: string; sub: string; tag?: { label: string; variant: "success" | "neutral" | "alert" | "informative" } }[] }) {
  return (
    <div className="flex flex-col gap-[8px]" style={{ padding: "0 16px 16px" }}>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-[10px]" style={{ padding: "8px 0", borderBottom: "0.5px solid var(--field-border)" }}>
          <HighlightIcon size="sm" variant={r.variant} iconName={r.icon} />
          <div className="flex flex-col" style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{r.title}</span>
            <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>{r.sub}</span>
          </div>
          {r.tag && <Tag variant={r.tag.variant} size="sm">{r.tag.label}</Tag>}
        </div>
      ))}
    </div>
  )
}

// ── Table detail (full page) ────────────────────────────────────────────────────
function TableDetailView({ table, onBack }: { table: TableRow; onBack: () => void }) {
  const [tab, setTab] = useState("overview")
  const cols = columnsFor(table)
  const parent = ENTITIES.find(e => e.name === table.entity)
  const pending = table.status !== "Published"
  const scope = useScope()
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "columns", label: `Columns · ${table.cols}` },
    { id: "data", label: "Data" },
    { id: "relationships", label: `Relationships · ${parent?.rels.length ?? 0}` },
    ...(atLeast(scope, "v2") ? [{ id: "indexes", label: "Indexes" }, { id: "history", label: "History" }] : []),
  ]
  const shown = tabs.some(t => t.id === tab) ? tab : "overview"
  return (
    <ScreenLayout
      workspaceName="Acme Corp" userName="Thomas González" userEmail="thomas@acme.com"
      sidebarItems={SIDEBAR_ITEMS} activeSidebarId="models"
      header={(isScrolled) => (
        <div>
          {!isScrolled && (
            <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: "0 0 6px 0", color: "var(--primary)" }}>
              <LucideIcons.ChevronLeft size={13} /><span style={{ fontSize: 12, fontWeight: 500 }}>{table.entity} · Tables</span>
            </button>
          )}
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={table.alias}
            description={`${table.entity} · ${table.role} table · ${table.cols} columns · ${table.rows} rows`}
            icon={LucideIcons.Table}
            tag={<Tag variant={STATUS_TAG[table.status]} size="sm">{table.status}</Tag>}
            secondaryAction={<Button variant="secondary" size="sm"><LucideIcons.Pencil size={13} /> Edit</Button>}
            primaryAction={atLeast(scope, "v1.5")
              ? (pending
                ? <Button variant="main" size="sm"><LucideIcons.UploadCloud size={13} /> Publish</Button>
                : <Button variant="secondary" size="sm"><LucideIcons.Check size={13} /> Published</Button>)
              : undefined}
          />
        </div>
      )}
    >
      <Tabs items={tabs} activeId={shown} onChange={setTab} className="mb-[16px]" />
      {shown === "overview" && (
        <WidgetCanvasView initialSlots={[
          // R3: Overview = basic Details at V1; KPI tiles + schema preview are Full vision
          ...(atLeast(scope, "v2") ? [
          { uid: "cols", title: "Columns", colSpan: 1, content: <KpiContent value={String(table.cols)} feedback="incl. system fields" iconName="Columns3" iconVariant="informative" /> },
          { uid: "rows", title: "Rows", colSpan: 1, content: <KpiContent value={table.rows} feedback={`Updated ${table.updated}`} iconName="Rows3" iconVariant="neutral" /> },
          { uid: "role", title: "Role", colSpan: 1, content: <KpiContent value={table.role} feedback={table.role === "Primary" ? "Anchor table" : "Joined table"} iconName={table.role === "Primary" ? "KeyRound" : "Link"} iconVariant="neutral" /> },
          { uid: "status", title: "Status", colSpan: 1, content: <KpiContent value={table.status} feedback={pending ? "Unpublished changes" : "Live"} iconName={pending ? "GitPullRequestArrow" : "CircleCheck"} iconVariant={STATUS_KPI[table.status]} /> },
          ] as CanvasSlot[] : []),
          { uid: "details", title: "Details", colSpan: 1, content: <KVContent rows={[{ label: "Entity", value: table.entity }, { label: "Role", value: table.role }, { label: "Columns", value: String(table.cols) }, { label: "Rows", value: table.rows }, { label: "Updated", value: table.updated }]} /> },
          ...(atLeast(scope, "v2") ? [{ uid: "schema", title: "Schema preview", colSpan: 2, widthClass: "wide", content: <ListRows rows={cols.slice(0, 6).map(c => ({ icon: "Columns3", variant: "neutral" as const, title: c.name, sub: `${c.type}${c.nullable ? " · nullable" : ""}`, tag: c.sensitivity !== "None" ? { label: c.sensitivity, variant: "alert" as const } : undefined }))} /> }] as CanvasSlot[] : []),
        ] satisfies CanvasSlot[]} />
      )}
      {shown === "columns" && <ColumnsTable cols={cols} />}
      {shown === "data" && <DataTable cols={cols} />}
      {shown === "relationships" && <RelsContent rels={parent?.rels ?? []} />}
      {shown === "indexes" && <ListRows rows={[
        { icon: "KeyRound", variant: "informative", title: `pk_${table.id}`, sub: "PRIMARY KEY · (id) · unique · btree" },
        { icon: "Search", variant: "neutral", title: `idx_${table.id}_owner`, sub: "INDEX · (owner_id) · btree" },
        { icon: "Search", variant: "neutral", title: `idx_${table.id}_status`, sub: "INDEX · (status) · btree" },
        { icon: "Search", variant: "neutral", title: `idx_${table.id}_created`, sub: "INDEX · (created_at) · brin" },
      ]} />}
      {shown === "history" && <HistoryTable status={table.status} updated={table.updated} />}
    </ScreenLayout>
  )
}

// ── Reference list detail (full page) ────────────────────────────────────────────
function RefDetailView({ list, onBack }: { list: RefRow; onBack: () => void }) {
  const [tab, setTab] = useState("overview")
  const scope = useScope()
  const items = itemsFor(list)
  const pending = list.status !== "Published"
  const refCols: ColumnDef[] = [
    { name: "key", type: "varchar(32)", nullable: false, def: "—", sensitivity: "None" },
    { name: "label", type: "varchar(255)", nullable: false, def: "—", sensitivity: "None" },
    { name: "code", type: "varchar(32)", nullable: true, def: "—", sensitivity: "None" },
    { name: "is_active", type: "boolean", nullable: false, def: "true", sensitivity: "None" },
  ]
  const usedBy = Array.from({ length: list.referencedBy }, (_, i) => ({
    icon: "Box" as const, variant: "informative" as const,
    title: [...ENTITIES].map(e => e.name)[i % ENTITIES.length],
    sub: `references ${list.name.toLowerCase()} on a column`,
    tag: { label: "Entity", variant: "informative" as const },
  }))
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "data", label: `Data · ${list.items}` },
    { id: "columns", label: "Columns" },
    // R7: "Referenced by" (dictionary usage) is Full vision, not V1
    ...(atLeast(scope, "v2") ? [{ id: "referencedby", label: `Referenced by · ${list.referencedBy}` }, { id: "settings", label: "Settings" }, { id: "history", label: "History" }] : []),
  ]
  const shown = tabs.some(t => t.id === tab) ? tab : "overview"
  return (
    <ScreenLayout
      workspaceName="Acme Corp" userName="Thomas González" userEmail="thomas@acme.com"
      sidebarItems={SIDEBAR_ITEMS} activeSidebarId="models"
      header={(isScrolled) => (
        <div>
          {!isScrolled && (
            <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: "0 0 6px 0", color: "var(--primary)" }}>
              <LucideIcons.ChevronLeft size={13} /><span style={{ fontSize: 12, fontWeight: 500 }}>Reference Data</span>
            </button>
          )}
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={list.name}
            description={`${list.items} items · ${list.origin} · Referenced by ${list.referencedBy} · Updated ${list.updated}`}
            icon={LucideIcons.ListChecks}
            tag={<Tag variant={STATUS_TAG[list.status]} size="sm">{list.status}</Tag>}
            secondaryAction={<Button variant="secondary" size="sm"><LucideIcons.Download size={13} /> Export</Button>}
            primaryAction={atLeast(scope, "v1.5") ? <Button variant="main" size="sm"><LucideIcons.Plus size={13} /> Add item</Button> : undefined}
          />
        </div>
      )}
    >
      <Tabs items={tabs} activeId={shown} onChange={setTab} className="mb-[16px]" />
      {shown === "overview" && (
        <WidgetCanvasView initialSlots={[
          // R3: Overview = basic Details at V1; KPI tiles + items preview are Full vision
          ...(atLeast(scope, "v2") ? [
          { uid: "items", title: "Items", colSpan: 1, content: <KpiContent value={String(list.items)} feedback={`${items.filter(i => i.active).length} active`} iconName="List" iconVariant="informative" /> },
          { uid: "origin", title: "Origin", colSpan: 1, content: <KpiContent value={list.origin} feedback={list.origin === "External sync" ? "Auto-synced" : "Maintained here"} iconName={list.origin === "External sync" ? "RefreshCw" : "Pencil"} iconVariant="neutral" /> },
          { uid: "refby", title: "Referenced by", colSpan: 1, content: <KpiContent value={String(list.referencedBy)} feedback="models & entities" iconName="Link" iconVariant="neutral" /> },
          { uid: "status", title: "Status", colSpan: 1, content: <KpiContent value={list.status} feedback={pending ? "Unpublished changes" : "Live"} iconName={pending ? "GitPullRequestArrow" : "CircleCheck"} iconVariant={STATUS_KPI[list.status]} /> },
          ] as CanvasSlot[] : []),
          { uid: "details", title: "Details", colSpan: 1, content: <KVContent rows={[{ label: "Origin", value: list.origin }, { label: "Referenced by", value: String(list.referencedBy) }, { label: "Items", value: String(list.items) }, { label: "Status", value: list.status }, { label: "Updated", value: list.updated }]} /> },
          ...(atLeast(scope, "v2") ? [{ uid: "preview", title: "Items preview", colSpan: 3, widthClass: "full", content: <ItemsTable items={items} /> }] as CanvasSlot[] : []),
        ] satisfies CanvasSlot[]} />
      )}
      {shown === "data" && <ItemsTable items={items} />}
      {shown === "referencedby" && <ListRows rows={usedBy} />}
      {shown === "columns" && <ColumnsTable cols={refCols} />}
      {shown === "settings" && <KVContent rows={[
        { label: "Origin", value: list.origin },
        { label: "Sync source", value: list.origin === "External sync" ? "ISO registry API" : "—" },
        { label: "Manual override", value: list.origin === "External sync" ? "Allowed per item" : "n/a" },
        { label: "Key field", value: "key" },
        { label: "Last updated", value: list.updated },
      ]} />}
      {shown === "history" && <HistoryTable status={list.status} updated={list.updated} />}
    </ScreenLayout>
  )
}

// ── Model detail (full page) ─────────────────────────────────────────────────────
function ModelDetailView({ model, onBack }: { model: ModelRow; onBack: () => void }) {
  const [tab, setTab] = useState("overview")
  const ents = ENTITIES.filter(e => e.model === model.name)
  const entNames = ents.map(e => e.name)
  const tbls = TABLES.filter(t => entNames.includes(t.entity))
  const pending = model.status !== "Published"
  const scope = useScope()
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "entities", label: `Entities · ${ents.length}` },
    { id: "tables", label: `Tables · ${tbls.length}` },
    ...(atLeast(scope, "v2") ? [{ id: "history", label: "History" }] : []),
  ]
  const shown = tabs.some(t => t.id === tab) ? tab : "overview"
  return (
    <ScreenLayout
      workspaceName="Acme Corp" userName="Thomas González" userEmail="thomas@acme.com"
      sidebarItems={SIDEBAR_ITEMS} activeSidebarId="models"
      header={(isScrolled) => (
        <div>
          {!isScrolled && (
            <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: "0 0 6px 0", color: "var(--primary)" }}>
              <LucideIcons.ChevronLeft size={13} /><span style={{ fontSize: 12, fontWeight: 500 }}>Models</span>
            </button>
          )}
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={model.name}
            description={`${model.domain} · ${ents.length} entities · ${tbls.length} tables · Owned by ${model.owner}`}
            icon={LucideIcons.Boxes}
            tag={<Tag variant={STATUS_TAG[model.status]} size="sm">{model.status}</Tag>}
            secondaryAction={<Button variant="secondary" size="sm"><LucideIcons.Pencil size={13} /> Edit</Button>}
            primaryAction={atLeast(scope, "v1.5")
              ? (pending
                ? <Button variant="main" size="sm"><LucideIcons.UploadCloud size={13} /> Publish</Button>
                : <Button variant="secondary" size="sm"><LucideIcons.Check size={13} /> Published</Button>)
              : undefined}
          />
        </div>
      )}
    >
      <Tabs items={tabs} activeId={shown} onChange={setTab} className="mb-[16px]" />
      {shown === "overview" && (
        <WidgetCanvasView initialSlots={[
          // R3: Overview = basic info (Description + Details) at V1; KPI tiles are Full vision
          ...(atLeast(scope, "v2") ? [
          { uid: "ents", title: "Entities", colSpan: 1, content: <KpiContent value={String(ents.length)} feedback="business objects" iconName="Box" iconVariant="informative" /> },
          { uid: "tbls", title: "Tables", colSpan: 1, content: <KpiContent value={String(tbls.length)} feedback="physical tables" iconName="Table" iconVariant="neutral" /> },
          { uid: "domain", title: "Domain", colSpan: 1, content: <KpiContent value={model.domain} feedback="area" iconName="Layers" iconVariant="neutral" /> },
          { uid: "status", title: "Status", colSpan: 1, content: <KpiContent value={model.status} feedback={pending ? "Unpublished changes" : "Live"} iconName={pending ? "GitPullRequestArrow" : "CircleCheck"} iconVariant={STATUS_KPI[model.status]} /> },
          ] as CanvasSlot[] : []),
          { uid: "desc", title: "Description", colSpan: 2, widthClass: "wide", content: <DescriptionContent text={model.desc} /> },
          { uid: "details", title: "Details", colSpan: 1, content: <KVContent rows={[{ label: "Domain", value: model.domain }, { label: "Owner", value: model.owner }, { label: "Entities", value: String(ents.length) }, { label: "Tables", value: String(tbls.length) }, { label: "Updated", value: model.updated }]} /> },
        ] satisfies CanvasSlot[]} />
      )}
      {shown === "entities" && <ListRows rows={ents.map(e => ({ icon: "Box", variant: "informative" as const, title: e.name, sub: `${e.domain} · ${e.records} records · ${e.tables.length} tables`, tag: { label: e.status, variant: STATUS_TAG[e.status] } }))} />}
      {shown === "tables" && <ListRows rows={tbls.map(t => ({ icon: "Table", variant: "neutral" as const, title: t.alias, sub: `${t.entity} · ${t.role} · ${t.cols} columns · ${t.rows} rows`, tag: { label: t.role, variant: t.role === "Primary" ? "informative" as const : "neutral" as const } }))} />}
      {shown === "history" && <HistoryTable status={model.status} updated={model.updated} />}
    </ScreenLayout>
  )
}

// ── Row → EntityListItemData mappers ─────────────────────────────────────────
function modelToItem(m: ModelRow, onClick: () => void): EntityListItemData {
  return {
    id: m.id, iconName: "Boxes", iconVariant: STATUS_ICON[m.status], title: m.name,
    primaryMeta: [{ iconName: "User", label: m.owner }],
    description: m.desc,
    state: { label: m.status, variant: STATUS_TAG[m.status] },
    timestamp: m.updated,
    secondaryMeta: [
      { iconName: "Box", label: `${m.entities} entities` },
      { iconName: "Table", label: `${m.tables} tables` },
    ],
    tags: [{ label: m.domain }],
    onClick,
  }
}
function entityToItem(e: EntityRow, onClick: () => void): EntityListItemData {
  return {
    id: e.id, iconName: "Box", iconVariant: STATUS_ICON[e.status], title: e.name,
    primaryMeta: [{ iconName: "User", label: e.owner }, { tag: e.model }],
    description: e.desc,
    state: { label: e.status, variant: STATUS_TAG[e.status] },
    timestamp: e.updated,
    secondaryMeta: [
      { iconName: "Table", label: `${e.tables.length} tables` },
      { iconName: "Database", label: `${e.records} records` },
      { iconName: "Share2", label: `${e.rels.length} relationships` },
    ],
    tags: e.tags.map(t => ({ label: t })),
    onClick,
  }
}
function tableToItem(t: TableRow, onClick: () => void): EntityListItemData {
  return {
    id: t.id, iconName: "Table", iconVariant: STATUS_ICON[t.status], title: t.alias,
    primaryMeta: [{ iconName: "Box", label: t.entity }, { tag: t.role }],
    state: { label: t.status, variant: STATUS_TAG[t.status] },
    timestamp: t.updated,
    secondaryMeta: [
      { iconName: "Columns3", label: `${t.cols} columns` },
      { iconName: "Rows3", label: `${t.rows} rows` },
    ],
    onClick,
  }
}
function refToItem(r: RefRow, onClick: () => void): EntityListItemData {
  return {
    id: r.id, iconName: "ListChecks", iconVariant: STATUS_ICON[r.status], title: r.name,
    primaryMeta: [{ iconName: r.origin === "External sync" ? "RefreshCw" : "Pencil", label: r.origin }],
    state: { label: r.status, variant: STATUS_TAG[r.status] },
    timestamp: r.updated,
    secondaryMeta: [
      { iconName: "List", label: `${r.items} items` },
      { iconName: "Link", label: `Referenced by ${r.referencedBy}` },
    ],
    onClick,
  }
}

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function PMThomasDataStudioModelsScreen() {
  const [area,     setArea]     = useState<Area>("entities")
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [openSlot, setOpenSlot] = useState<string | null>(null)
  const [domain,   setDomain]   = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [scope,    setScope]    = useState<Scope>("v1")
  const [clOpen,   setClOpen]   = useState(false)

  const resetPaging = () => { setPage(1) }

  const AREA_TABS = [
    { id: "models",    label: `Models · ${MODELS.length}` },
    { id: "entities",  label: `Entities · ${ENTITIES.length}` },
    { id: "tables",    label: `Tables · ${TABLES.length}` },
    { id: "reference", label: `Reference Data · ${REFERENCE.length}` },
  ]

  // Build the active list
  const { items, total, title, description, filterSlots, filterOptions, searchPlaceholder } = useMemo(() => {
    if (area === "models") {
      const rows = MODELS
      return {
        items: rows.map(m => modelToItem(m, () => setDetailId(m.id))),
        total: rows.length, title: "Models", description: "Logical groupings of entities, tables and reference data.",
        searchPlaceholder: "Search models…", filterSlots: [], filterOptions: {} as Record<string, string[]>,
      }
    }
    if (area === "tables") {
      const rows = TABLES
      return {
        items: rows.map(t => tableToItem(t, () => setDetailId(t.id))),
        total: rows.length, title: "Tables", description: "Physical tables backing the entities in this workspace.",
        searchPlaceholder: "Search tables…", filterSlots: [], filterOptions: {} as Record<string, string[]>,
      }
    }
    if (area === "reference") {
      const rows = REFERENCE
      return {
        items: rows.map(r => refToItem(r, () => setDetailId(r.id))),
        total: rows.length, title: "Reference Data", description: "Shared lookup lists referenced across models and agents.",
        searchPlaceholder: "Search reference lists…", filterSlots: [], filterOptions: {} as Record<string, string[]>,
      }
    }
    // entities (with a Domain filter)
    const rows = ENTITIES.filter(e => !domain || e.domain === domain)
    return {
      items: rows.map(e => entityToItem(e, () => setDetailId(e.id))),
      total: rows.length, title: "Entities", description: "Business objects and the customer-360 rollups the platform joins against.",
      searchPlaceholder: "Search entities…",
      filterSlots: [{
        placeholder: "Domain", value: domain ?? undefined,
        onOpen: () => setOpenSlot(p => (p === "Domain" ? null : "Domain")),
        onRemove: () => { setDomain(null); resetPaging() },
      }],
      filterOptions: { Domain: ["Customer-facing", "Back office", "Data"] } as Record<string, string[]>,
    }
  }, [area, domain])

  const paged = items.slice((page - 1) * pageSize, page * pageSize)

  // Full-detail routing — computed as a node (all hooks already ran above)
  let detail: ReactNode = null
  if (detailId) {
    const back = () => setDetailId(null)
    if (area === "entities")       { const e = ENTITIES.find(x => x.id === detailId);  if (e) detail = <EntityDetailView entity={e} onBack={back} /> }
    else if (area === "models")    { const m = MODELS.find(x => x.id === detailId);    if (m) detail = <ModelDetailView model={m} onBack={back} /> }
    else if (area === "tables")    { const t = TABLES.find(x => x.id === detailId);    if (t) detail = <TableDetailView table={t} onBack={back} /> }
    else if (area === "reference") { const r = REFERENCE.find(x => x.id === detailId);  if (r) detail = <RefDetailView list={r} onBack={back} /> }
  }

  const listView = (
    <ScreenLayout
      workspaceName="Acme Corp" userName="Thomas González" userEmail="thomas@acme.com"
      sidebarItems={SIDEBAR_ITEMS} activeSidebarId="models"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title={title}
          description={description}
          primaryAction={<Button variant="main" size="sm"><LucideIcons.Plus size={13} /> New {NEW_LABEL[area]}</Button>}
        />
      )}
      pagination={
        total > pageSize
          ? <Pagination currentPage={page} totalItems={total} itemsPerPage={pageSize} onPageChange={setPage}
              onItemsPerPageChange={n => { setPageSize(n); setPage(1) }} rowsPerPageOptions={[8, 15, 25]} />
          : undefined
      }
    >
      <Tabs
        items={AREA_TABS}
        activeId={area}
        onChange={(id) => { setArea(id as Area); setPage(1); setDetailId(null); setDomain(null) }}
        className="mb-[16px]"
      />

      <ListViewSection
        items={paged}
        searchPlaceholder={searchPlaceholder}
        filterSlots={filterSlots}
        filterOptions={filterOptions}
        onFilterSelect={(_slot, value) => { setDomain(value); setPage(1); setOpenSlot(null) }}
        openSlot={openSlot}
        onOpenSlotChange={setOpenSlot}
        showPreview={atLeast(scope, "v1.5")}
        emptyLabel="Nothing matches these filters."
      />
    </ScreenLayout>
  )

  return (
    <ScopeCtx.Provider value={scope}>
      {detail ?? listView}
      <ScopeSwitcher scope={scope} setScope={setScope} onChangelog={() => setClOpen(true)} />
      <ChangelogPanel open={clOpen} onClose={() => setClOpen(false)} scope={scope} />
    </ScopeCtx.Provider>
  )
}
