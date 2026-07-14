import { useMemo, useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { ListViewSection } from "@/components/layouts/list-view-section"
import type { SidebarItem } from "@/components/ui/sidebar"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { SlideOut } from "@/components/ui/slide-out"
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
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [previewId, setPreviewId] = useState<string | null>(null)

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
    >
      <ListViewSection
        items={paged.map(w => toEntityItem(w, setPreviewId))}
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
        currentPage={page}
        totalItems={filtered.length}
        itemsPerPage={pageSize}
        onPageChange={setPage}
        onItemsPerPageChange={n => { setPageSize(n); setPage(1) }}
        rowsPerPageOptions={[5, 10, 25]}
        emptyLabel="No workers match these filters."
      />

      {/* Custom worker detail SlideOut — triggered by the Eye action */}
      <SlideOut
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        title={previewWorker?.name ?? "Worker detail"}
        subtitle={previewWorker ? `${previewWorker.category} · ${previewWorker.status}` : ""}
        type="with-variants"
        size="m"
        showTabs={false}
        showSearchBar={false}
        showChips={false}
        showCta={false}
      >
        {previewWorker && (
          <div className="flex flex-col gap-[20px] p-[24px]">
            <Tag variant={STATUS_TAG_VARIANT[previewWorker.status]} size="sm">
              {previewWorker.status}
            </Tag>
            {[
              ["Category", previewWorker.category],
              ["Owner",    previewWorker.owner],
              ["Last run", previewWorker.lastRun],
            ].map(([label, val]) => (
              <div key={label} style={{ borderTop: "0.5px solid var(--field-border)", paddingTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--field-label)", marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, color: "var(--foreground)" }}>{val}</div>
              </div>
            ))}
            <div className="flex gap-[8px] mt-[8px]">
              <Button size="sm" variant="secondary" className="flex-1">Edit</Button>
              <Button size="sm" className="flex-1">Publish</Button>
            </div>
          </div>
        )}
      </SlideOut>
    </ScreenLayout>
  )
}
