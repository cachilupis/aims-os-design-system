import { useMemo, useRef, useState } from "react"
import * as LucideIcons from "lucide-react"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { Filters } from "@/components/ui/filters"
import { CardContainer } from "@/components/ui/card-container"
import { EntityList } from "@/components/ui/entity-list"
import type { EntityListItemData } from "@/components/ui/entity-list"
import { Pagination } from "@/components/ui/pagination"
import { SlideOut } from "@/components/ui/slide-out"

// ── PM prototype — Juan · AI Workers list (tenant admin) ──────────────────────
// Requisitos: filtros Status/Category, fila con nombre + status badge + categoría
// + owner + acciones Publish/Edit, Eye abre detalle en SlideOut, paginación al fondo.

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
  Analytics: "BarChart3",
  CX:        "Headset",
  Operations: "Cog",
}

const WORKERS: Worker[] = [
  { id: "w1", name: "Revenue Forecast Analyzer",  status: "Active",  category: "Analytics",  owner: "Ana Torres",     lastRun: "4m ago"  },
  { id: "w2", name: "Customer Sentiment Tracker", status: "Running", category: "CX",         owner: "Marco Silva",    lastRun: "12m ago" },
  { id: "w3", name: "Inventory Reorder Assistant",status: "Draft",   category: "Operations", owner: "Elena Ruiz",     lastRun: "—"        },
  { id: "w4", name: "Churn Risk Predictor",       status: "Active",  category: "Analytics",  owner: "David Kim",      lastRun: "1h ago"  },
  { id: "w5", name: "Support Ticket Triage",      status: "Active",  category: "CX",         owner: "Priya Patel",    lastRun: "2h ago"  },
  { id: "w6", name: "Warehouse Capacity Planner", status: "Running", category: "Operations", owner: "James Chen",     lastRun: "6m ago"  },
  { id: "w7", name: "Campaign ROI Estimator",     status: "Draft",   category: "Analytics",  owner: "Sofia Martins",  lastRun: "—"        },
  { id: "w8", name: "VoC Insights Summarizer",    status: "Draft",   category: "CX",         owner: "Liam O'Connor",  lastRun: "—"        },
  { id: "w9", name: "Shift Scheduling Optimizer", status: "Active",  category: "Operations", owner: "Nina Fischer",   lastRun: "30m ago" },
]

function toEntityListItem(w: Worker, onPreview: (id: string) => void): EntityListItemData {
  return {
    id: w.id,
    title: w.name,
    iconVariant: "info",
    iconName: "Bot",
    primaryMeta: [
      { iconName: CATEGORY_ICON[w.category], label: w.category },
    ],
    secondaryMeta: [
      { iconName: "User", label: `Owner: ${w.owner}` },
      { iconName: "Clock", label: `Last run: ${w.lastRun}` },
    ],
    state: { label: w.status, variant: STATUS_TAG_VARIANT[w.status] },
    actions: [
      { label: "Publish", variant: "primary" },
      { label: "Edit",    variant: "secondary" },
      { label: "Preview",  icon: "Eye", variant: "tertiary", onClick: () => onPreview(w.id) },
    ],
  }
}

export default function PMJuanAIWorkersScreen() {
  const [filterStatus, setFilterStatus]     = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [openSlot, setOpenSlot]             = useState<string | null>(null)
  const [dropdownAnchor, setDropdownAnchor] = useState<{ left: number; top: number } | null>(null)

  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [previewId, setPreviewId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () => WORKERS.filter(w =>
      (!filterStatus   || w.status   === filterStatus) &&
      (!filterCategory || w.category === filterCategory)
    ),
    [filterStatus, filterCategory]
  )

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
    [filtered, page, pageSize]
  )

  const previewWorker = WORKERS.find(w => w.id === previewId)

  const FILTER_OPTIONS: Record<string, string[]> = {
    Status:   ["Active", "Draft", "Running"],
    Category: ["Analytics", "CX", "Operations"],
  }

  return (
    <div className="flex flex-col" style={{ border: "0.5px solid var(--field-border)", borderRadius: 12, overflow: "hidden", background: "var(--canvas)" }}>

      <Header
        title="AI Workers"
        description="Manage and monitor AI workers for this tenant."
        tag={<Tag variant="success" size="sm">{filtered.filter(w => w.status === "Active").length} Active</Tag>}
        primaryAction={<Button variant="main" size="sm"><LucideIcons.Plus size={13} /> New Worker</Button>}
      />

      {/* ── Filters ── */}
      <div
        className="shrink-0"
        style={{ padding: "12px 24px 0" }}
        ref={containerRef as React.RefObject<HTMLDivElement>}
        onClickCapture={(e: React.MouseEvent) => {
          const btn = (e.target as HTMLElement).closest("button")
          const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          const left = btn
            ? btn.getBoundingClientRect().left + btn.getBoundingClientRect().width / 2
            : e.clientX
          setDropdownAnchor({ left, top: containerRect.bottom })
        }}
      >
        <Filters
          showSearch
          searchPlaceholder="Search workers..."
          slots={[
            {
              placeholder: "Status",
              value: filterStatus ?? undefined,
              onOpen:   () => setOpenSlot(prev => prev === "Status" ? null : "Status"),
              onRemove: () => { setFilterStatus(null); setPage(1) },
            },
            {
              placeholder: "Category",
              value: filterCategory ?? undefined,
              onOpen:   () => setOpenSlot(prev => prev === "Category" ? null : "Category"),
              onRemove: () => { setFilterCategory(null); setPage(1) },
            },
          ]}
          showAllFilters={false}
          showSort={false}
          showViewToggle={false}
        />
      </div>

      {/* ── Filter dropdown — fixed, centered below the clicked slot ── */}
      {openSlot !== null && dropdownAnchor !== null && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 10000 }} onClick={() => setOpenSlot(null)} />
          <div
            className="flex flex-col overflow-hidden"
            style={{
              position: "fixed",
              left: dropdownAnchor.left,
              top: dropdownAnchor.top + 4,
              transform: "translateX(-50%)",
              zIndex: 10001,
              background: "var(--surface)",
              border: "0.5px solid var(--field-border)",
              borderRadius: 8,
              minWidth: 200,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.16), 0 1px 4px 0 rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ padding: "8px 12px 6px", borderBottom: "0.5px solid var(--field-border)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)" }}>
                {openSlot}
              </span>
            </div>
            {(FILTER_OPTIONS[openSlot] ?? []).map(opt => {
              const curVal = openSlot === "Status" ? filterStatus : filterCategory
              const isSel  = curVal === opt
              return (
                <button
                  key={opt}
                  className="flex items-center gap-[8px] px-[12px] py-[10px] text-left w-full"
                  style={{
                    background: isSel ? "var(--color-surface-primary-subtle)" : "transparent",
                    color:      isSel ? "var(--primary)" : "var(--foreground)",
                    fontWeight: isSel ? 600 : 400,
                    fontSize:   13,
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--color-surface-neutral-default)" }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent" }}
                  onClick={() => {
                    if (openSlot === "Status") setFilterStatus(opt); else setFilterCategory(opt)
                    setPage(1)
                    setOpenSlot(null)
                  }}
                >
                  <span className="flex-1">{opt}</span>
                  {isSel && <LucideIcons.Check size={13} style={{ flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ── Entity list — 12px gap between cards ── */}
      <div style={{ padding: "16px 24px 0" }}>
        <div className="flex flex-col gap-[12px]">
          {paged.length > 0 ? paged.map(w => (
            <CardContainer key={w.id} size="sm" className="!p-0 overflow-hidden">
              <EntityList items={[toEntityListItem(w, setPreviewId)]} />
            </CardContainer>
          )) : (
            <div className="flex items-center justify-center" style={{ padding: "40px 0", color: "var(--field-supporting)", fontSize: 13 }}>
              No workers match these filters.
            </div>
          )}
        </div>
      </div>

      {/* ── Pagination ── */}
      <div style={{ padding: "16px 0 0" }}>
        <Pagination
          currentPage={page}
          totalItems={filtered.length}
          itemsPerPage={pageSize}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPageSize(n); setPage(1) }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </div>

      {/* ── Worker detail — SlideOut triggered by the Eye action ── */}
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
            <Tag variant={STATUS_TAG_VARIANT[previewWorker.status]} size="sm">{previewWorker.status}</Tag>
            {[
              ["Category", previewWorker.category],
              ["Owner",    previewWorker.owner],
              ["Last run", previewWorker.lastRun],
            ].map(([label, val]) => (
              <div key={label} style={{ borderTop: "0.5px solid var(--field-border)", paddingTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--field-label)", marginBottom: 4 }}>{label}</div>
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
    </div>
  )
}
