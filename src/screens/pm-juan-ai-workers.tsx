import { useMemo, useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { ListViewSection } from "@/components/layouts/list-view-section"
import type { SidebarItem } from "@/components/ui/sidebar"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { Pagination } from "@/components/ui/pagination"
import { SlideOut } from "@/components/ui/slide-out"
import { Table, TableCellAvatar } from "@/components/ui/table"
import type { TableColumn } from "@/components/ui/table"
import type { EntityListItemData } from "@/components/ui/entity-list"

// ── PM prototype — Juan · AI Workers list (tenant admin) ──────────────────────

type WorkerStatus   = "Active" | "Draft" | "Running"
type WorkerCategory = "Analytics" | "CX" | "Operations"

type Worker = {
  id:       string
  name:     string
  status:   WorkerStatus
  category: WorkerCategory
  owner:    string
  lastRun:  string
}

const STATUS_TAG_VARIANT: Record<WorkerStatus, "success" | "informative" | "neutral"> = {
  Active:  "success",
  Running: "informative",
  Draft:   "neutral",
}

const CATEGORY_ICON: Record<WorkerCategory, string> = {
  Analytics:  "BarChart3",
  CX:         "Headset",
  Operations: "Cog",
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "ai-workers",  label: "AI Workers",  icon: "Bot" },
  { id: "automations", label: "Automations", icon: "Zap" },
  { id: "knowledge",   label: "Knowledge",   icon: "LayoutGrid", hasChildren: true },
  { id: "analytics",   label: "Analytics",   icon: "BarChart3" },
  { id: "settings",    label: "Settings",    icon: "Settings" },
]

const WORKERS: Worker[] = [
  { id: "w1", name: "Revenue Forecast Analyzer",   status: "Active",  category: "Analytics",  owner: "Ana Torres",    lastRun: "4m ago"  },
  { id: "w2", name: "Customer Sentiment Tracker",  status: "Running", category: "CX",         owner: "Marco Silva",   lastRun: "12m ago" },
  { id: "w3", name: "Inventory Reorder Assistant", status: "Draft",   category: "Operations", owner: "Elena Ruiz",    lastRun: "—"       },
  { id: "w4", name: "Churn Risk Predictor",        status: "Active",  category: "Analytics",  owner: "David Kim",     lastRun: "1h ago"  },
  { id: "w5", name: "Support Ticket Triage",       status: "Active",  category: "CX",         owner: "Priya Patel",   lastRun: "2h ago"  },
  { id: "w6", name: "Warehouse Capacity Planner",  status: "Running", category: "Operations", owner: "James Chen",    lastRun: "6m ago"  },
  { id: "w7", name: "Campaign ROI Estimator",      status: "Draft",   category: "Analytics",  owner: "Sofia Martins", lastRun: "—"       },
  { id: "w8", name: "VoC Insights Summarizer",     status: "Draft",   category: "CX",         owner: "Liam O'Connor", lastRun: "—"       },
  { id: "w9", name: "Shift Scheduling Optimizer",  status: "Active",  category: "Operations", owner: "Nina Fischer",  lastRun: "30m ago" },
]

const FILTER_OPTIONS: Record<string, string[]> = {
  Status:   ["Active", "Draft", "Running"],
  Category: ["Analytics", "CX", "Operations"],
}

// ── Worker detail — Overview + Users + Logs tabs ───────────────────────────────

type WorkerUserRole = "Owner" | "Editor" | "Viewer"
type WorkerUser = { name: string; email: string; role: WorkerUserRole; lastActive: string }

type LogStatus = "Success" | "Warning" | "Failed"
type WorkerLog = { id: string; status: LogStatus; startedAt: string; duration: string }

const TEAM_POOL = ["Ana Torres", "Marco Silva", "Elena Ruiz", "David Kim", "Priya Patel", "James Chen", "Sofia Martins", "Liam O'Connor", "Nina Fischer"]

function emailFor(name: string) {
  return name.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/).join(".") + "@acme.com"
}

const ROLE_TAG_VARIANT: Record<WorkerUserRole, "success" | "informative" | "neutral"> = {
  Owner:  "success",
  Editor: "informative",
  Viewer: "neutral",
}

function getWorkerUsers(w: Worker): WorkerUser[] {
  const idx    = WORKERS.findIndex(x => x.id === w.id)
  const editor = TEAM_POOL[(idx + 1) % TEAM_POOL.length]
  const viewer = TEAM_POOL[(idx + 4) % TEAM_POOL.length]
  return [
    { name: w.owner, email: emailFor(w.owner), role: "Owner",  lastActive: w.lastRun === "—" ? "3d ago" : w.lastRun },
    { name: editor,  email: emailFor(editor),  role: "Editor", lastActive: "1d ago" },
    { name: viewer,  email: emailFor(viewer),  role: "Viewer", lastActive: "5d ago" },
  ]
}

const LOG_TAG_VARIANT: Record<LogStatus, "success" | "alert" | "error"> = {
  Success: "success",
  Warning: "alert",
  Failed:  "error",
}

function getWorkerLogs(w: Worker): WorkerLog[] {
  const idx     = WORKERS.findIndex(x => x.id === w.id)
  const pattern: LogStatus[] =
    w.status === "Draft" ? ["Warning", "Success", "Success", "Failed"] :
    idx % 3 === 0         ? ["Success", "Success", "Failed", "Success"] :
    idx % 3 === 1         ? ["Success", "Warning", "Success", "Success"] :
                             ["Success", "Success", "Success", "Warning"]
  const startedAt = [w.lastRun === "—" ? "2d ago" : w.lastRun, "1d ago", "2d ago", "4d ago"]
  const duration  = ["3.2s", "2.8s", "0.4s", "3.1s"]
  return pattern.map((status, i) => ({
    id: `#RUN-${String(idx + 1).padStart(2, "0")}${i + 1}`,
    status,
    startedAt: startedAt[i],
    duration:  duration[i],
  }))
}

const USERS_COLUMNS: TableColumn<WorkerUser>[] = [
  { key: "name", header: "Name", render: u => (
    <div className="flex items-center gap-[8px]">
      <TableCellAvatar name={u.name} size="sm" />
      <span>{u.name}</span>
    </div>
  ) },
  { key: "role", header: "Role", render: u => <Tag variant={ROLE_TAG_VARIANT[u.role]} size="sm">{u.role}</Tag> },
  { key: "lastActive", header: "Last active", align: "right" },
]

const LOGS_COLUMNS: TableColumn<WorkerLog>[] = [
  { key: "id",        header: "Run" },
  { key: "status",    header: "Status",   render: l => <Tag variant={LOG_TAG_VARIANT[l.status]} size="sm">{l.status}</Tag> },
  { key: "startedAt", header: "Started" },
  { key: "duration",  header: "Duration", align: "right" },
]

// ── Overview detail rows ───────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px] py-[12px]" style={{ borderTop: "0.5px solid var(--field-border)" }}>
      <span className="text-[10px] font-bold uppercase tracking-[0.07em]" style={{ color: "var(--field-label)" }}>
        {label}
      </span>
      <div className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
        {children}
      </div>
    </div>
  )
}

function toEntityItem(w: Worker, onPreview: (id: string) => void): EntityListItemData {
  return {
    id: w.id,
    title: w.name,
    iconVariant: "info",
    iconName: "Bot",
    primaryMeta:   [{ iconName: CATEGORY_ICON[w.category], label: w.category }],
    secondaryMeta: [
      { iconName: "User",  label: `Owner: ${w.owner}` },
      { iconName: "Clock", label: `Last run: ${w.lastRun}` },
    ],
    state:   { label: w.status, variant: STATUS_TAG_VARIANT[w.status] },
    actions: [
      { label: "Publish", variant: "primary" },
      { label: "Edit",    variant: "secondary" },
      { label: "Preview", icon: "Eye", variant: "tertiary", onClick: () => onPreview(w.id) },
    ],
  }
}

export default function PMJuanAIWorkersScreen() {
  const [filterStatus,   setFilterStatus]   = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [openSlot,       setOpenSlot]       = useState<string | null>(null)
  const [page,           setPage]           = useState(1)
  const [pageSize,       setPageSize]       = useState(5)
  const [previewId,      setPreviewId]      = useState<string | null>(null)
  const [activeTab,      setActiveTab]      = useState(0)

  const openPreview = (id: string) => { setPreviewId(id); setActiveTab(0) }

  const filtered = useMemo(
    () => WORKERS.filter(w =>
      (!filterStatus   || w.status   === filterStatus) &&
      (!filterCategory || w.category === filterCategory)
    ),
    [filterStatus, filterCategory],
  )

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  )

  const previewWorker = WORKERS.find(w => w.id === previewId)
  const activeCount   = filtered.filter(w => w.status === "Active").length

  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Juan Pérez"
      userEmail="juan@acme.com"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="ai-workers"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="AI Workers"
          description="Manage and monitor AI workers for this tenant."
          tag={<Tag variant="success" size="sm">{activeCount} Active</Tag>}
          primaryAction={
            <Button variant="main" size="sm">
              <LucideIcons.Plus size={13} /> New Worker
            </Button>
          }
        />
      )}
      pagination={
        filtered.length > pageSize
          ? (
              <Pagination
                currentPage={page}
                totalItems={filtered.length}
                itemsPerPage={pageSize}
                onPageChange={setPage}
                onItemsPerPageChange={n => { setPageSize(n); setPage(1) }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            )
          : undefined
      }
    >
      <ListViewSection
        items={paged.map(w => toEntityItem(w, openPreview))}
        searchPlaceholder="Search workers..."
        filterSlots={[
          {
            placeholder: "Status",
            value: filterStatus ?? undefined,
            onOpen:   () => setOpenSlot(prev => prev === "Status"   ? null : "Status"),
            onRemove: () => { setFilterStatus(null); setPage(1) },
          },
          {
            placeholder: "Category",
            value: filterCategory ?? undefined,
            onOpen:   () => setOpenSlot(prev => prev === "Category" ? null : "Category"),
            onRemove: () => { setFilterCategory(null); setPage(1) },
          },
        ]}
        filterOptions={FILTER_OPTIONS}
        onFilterSelect={(slot, value) => {
          if (slot === "Status") setFilterStatus(value); else setFilterCategory(value)
          setPage(1)
          setOpenSlot(null)
        }}
        openSlot={openSlot}
        onOpenSlotChange={setOpenSlot}
        showPreview={false}
        emptyLabel="No workers match these filters."
      />

      {/* Worker detail SlideOut — size "s" (420px) for laptop. Eye action triggers it.
          Tabs: Overview (status + metadata), Users (team access), Logs (run history).
          CTA footer: Edit (secondary) + Publish (primary) — always visible. */}
      <SlideOut
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        title={previewWorker?.name ?? "Worker detail"}
        subtitle={previewWorker ? `${previewWorker.category} · ${previewWorker.status}` : ""}
        type="with-variants"
        size="s"
        showStatus={false}
        showSearchBar={false}
        showChips={false}
        showTabs
        showTab3
        tabLabels={["Overview", "Users", "Logs"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showCta
        ctaPrimaryLabel="Publish"
        ctaSecondaryLabel="Edit"
      >
        {previewWorker && (
          <div className="flex flex-col">

            {/* ── Overview ── */}
            {activeTab === 0 && (
              <div className="flex flex-col">
                <DetailRow label="Status">
                  <Tag variant={STATUS_TAG_VARIANT[previewWorker.status]} size="sm">
                    {previewWorker.status}
                  </Tag>
                </DetailRow>
                <DetailRow label="Category">{previewWorker.category}</DetailRow>
                <DetailRow label="Owner">{previewWorker.owner}</DetailRow>
                <DetailRow label="Last run">{previewWorker.lastRun === "—" ? "Never" : previewWorker.lastRun}</DetailRow>
              </div>
            )}

            {/* ── Users ── */}
            {activeTab === 1 && (
              <Table
                columns={USERS_COLUMNS}
                data={getWorkerUsers(previewWorker)}
                size="sm"
                emptyTitle="No users yet"
                emptyDescription="No one has access to this worker yet."
              />
            )}

            {/* ── Logs ── */}
            {activeTab === 2 && (
              <Table
                columns={LOGS_COLUMNS}
                data={getWorkerLogs(previewWorker)}
                size="sm"
                emptyTitle="No runs yet"
                emptyDescription="This worker hasn't run yet."
              />
            )}

          </div>
        )}
      </SlideOut>
    </ScreenLayout>
  )
}
