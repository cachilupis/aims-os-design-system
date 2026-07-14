/**
 * ListViewSection — AIMS OS DS Layout Component
 *
 * The Filters + EntityList + Pagination block for list view screens.
 * Always use inside ScreenLayout — horizontal padding (32px) is provided by
 * the parent, so children here carry no extra padding.
 *
 * Usage:
 *   <ListViewSection
 *     items={pagedItems}
 *     filterSlots={[
 *       { placeholder: "Status",   value: status ?? undefined, onOpen: () => setOpen("Status"),   onRemove: () => setStatus(null) },
 *       { placeholder: "Category", value: cat    ?? undefined, onOpen: () => setOpen("Category"), onRemove: () => setCat(null)    },
 *     ]}
 *     filterOptions={{ Status: ["Active", "Running", "Draft"], Category: ["CX", "Analytics"] }}
 *     onFilterSelect={(slot, value) => { if (slot === "Status") setStatus(value); else setCat(value) }}
 *     openSlot={openSlot}
 *     onOpenSlotChange={setOpenSlot}
 *     currentPage={page}
 *     totalItems={filtered.length}
 *     itemsPerPage={pageSize}
 *     onPageChange={setPage}
 *     onItemsPerPageChange={n => { setPageSize(n); setPage(1) }}
 *   />
 */

import { useRef, useState } from "react"
import * as LucideIcons from "lucide-react"
import { Filters } from "@/components/ui/filters"
import { Pagination } from "@/components/ui/pagination"
import { SlideOut } from "@/components/ui/slide-out"
import { EntityList } from "@/components/ui/entity-list"
import { CardContainer } from "@/components/ui/card-container"
import { Chip } from "@/components/ui/chip"
import type { EntityListItemData } from "@/components/ui/entity-list"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterSlot {
  placeholder: string
  value?: string
  onOpen: () => void
  onRemove: () => void
}

export interface NavChip {
  label: string
}

export interface ListViewSectionProps {
  // Entity items to render
  items: EntityListItemData[]

  // ── Filters bar ──────────────────────────────────────────────────────────
  searchPlaceholder?: string
  filterSlots?: FilterSlot[]
  filterOptions?: Record<string, string[]>
  onFilterSelect?: (slot: string, value: string) => void
  /** Controlled open-slot name (or null). Must pair with onOpenSlotChange. */
  openSlot?: string | null
  onOpenSlotChange?: (slot: string | null) => void
  showAllFilters?: boolean
  onAllFiltersClick?: () => void
  showViewToggle?: boolean

  // ── Nav chips (optional — 24px below Filters per DS spec) ────────────────
  chips?: NavChip[]
  selectedChip?: string
  onChipSelect?: (chip: string) => void

  // ── Pagination (DS Pagination component) ─────────────────────────────────
  currentPage?: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  onItemsPerPageChange?: (n: number) => void
  rowsPerPageOptions?: number[]

  // ── Built-in item preview SlideOut (optional) ────────────────────────────
  /** When true, appends an Eye button to each item and opens a default SlideOut.
   *  Set to false (default) when the screen provides its own custom SlideOut. */
  showPreview?: boolean

  /** Empty state label when items array is empty */
  emptyLabel?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ListViewSection({
  items,
  searchPlaceholder = "Search...",
  filterSlots = [],
  filterOptions = {},
  onFilterSelect,
  openSlot: controlledOpenSlot,
  onOpenSlotChange,
  showAllFilters = false,
  onAllFiltersClick,
  showViewToggle = false,
  chips = [],
  selectedChip,
  onChipSelect,
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  rowsPerPageOptions,
  showPreview = false,
  emptyLabel = "No items match these filters.",
}: ListViewSectionProps) {

  // Uncontrolled open-slot when no external controller is provided
  const [internalOpenSlot, setInternalOpenSlot] = useState<string | null>(null)
  const openSlot = controlledOpenSlot !== undefined ? controlledOpenSlot : internalOpenSlot
  const setSlot  = (s: string | null) => { setInternalOpenSlot(s); onOpenSlotChange?.(s) }

  // Dropdown anchor — centered below the clicked filter button
  const [dropdownAnchor, setDropdownAnchor] = useState<{ left: number; top: number } | null>(null)

  // Built-in item preview SlideOut
  const [slideoutItemId, setSlideoutItemId] = useState<string | null>(null)
  const previewItem = items.find(i => i.id === slideoutItemId)

  const containerRef = useRef<HTMLDivElement>(null)

  // Append Eye button to each item when showPreview is enabled
  const visibleItems: EntityListItemData[] = showPreview
    ? items.map(item => ({
        ...item,
        actions: [
          ...(item.actions ?? []),
          {
            label:   "Preview",
            icon:    "Eye",
            variant: "tertiary" as const,
            onClick: () => setSlideoutItemId(item.id),
          },
        ],
      }))
    : items

  const showPagination =
    currentPage !== undefined &&
    totalItems  !== undefined &&
    onPageChange !== undefined &&
    totalItems > itemsPerPage

  return (
    <>
      {/* ── Filters bar ── */}
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        onClickCapture={(e: React.MouseEvent) => {
          const btn  = (e.target as HTMLElement).closest("button")
          const left = btn
            ? btn.getBoundingClientRect().left + btn.getBoundingClientRect().width / 2
            : e.clientX
          setDropdownAnchor({
            left,
            top: (e.currentTarget as HTMLElement).getBoundingClientRect().bottom,
          })
        }}
      >
        <Filters
          showSearch
          searchPlaceholder={searchPlaceholder}
          slots={filterSlots}
          showAllFilters={showAllFilters}
          onAllFiltersClick={onAllFiltersClick}
          showViewToggle={showViewToggle}
          showSort={false}
        />
      </div>

      {/* ── Filter dropdown — fixed, centered below the clicked slot ── */}
      {openSlot !== null && dropdownAnchor !== null && (() => {
        const opts   = filterOptions[openSlot] ?? []
        const curVal = filterSlots.find(s => s.placeholder === openSlot)?.value
        return (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: 10000 }}
              onClick={() => setSlot(null)}
            />
            <div
              className="flex flex-col overflow-hidden"
              style={{
                position:     "fixed",
                left:         dropdownAnchor.left,
                top:          dropdownAnchor.top + 4,
                transform:    "translateX(-50%)",
                zIndex:       10001,
                background:   "var(--surface)",
                border:       "0.5px solid var(--field-border)",
                borderRadius: 8,
                minWidth:     200,
                boxShadow:    "var(--shadow-elevation-3)",
              }}
            >
              <div style={{ padding: "8px 12px 6px", borderBottom: "0.5px solid var(--field-border)" }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)" }}>
                  {openSlot}
                </span>
              </div>
              {opts.map(opt => {
                const isSel = curVal === opt
                return (
                  <button
                    key={opt}
                    className="flex items-center gap-[8px] px-[12px] py-[10px] text-left w-full transition-colors"
                    style={{
                      background: isSel ? "var(--color-surface-primary-subtle)" : "transparent",
                      color:      isSel ? "var(--primary)" : "var(--foreground)",
                      fontWeight: isSel ? 600 : 400,
                      fontSize:   13,
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--color-surface-neutral-default)" }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent" }}
                    onClick={() => { onFilterSelect?.(openSlot, opt); setSlot(null) }}
                  >
                    <span className="flex-1">{opt}</span>
                    {isSel && <LucideIcons.Check size={13} style={{ flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          </>
        )
      })()}

      {/* ── Nav chips — 24px below Filters per DS spec ── */}
      {chips.length > 0 && (
        <div className="flex items-center gap-[6px] flex-wrap mt-[24px]">
          {chips.map(chip => (
            <Chip
              key={chip.label}
              variant={selectedChip === chip.label ? "primary" : "secondary"}
              size="s"
              onClick={() => onChipSelect?.(chip.label)}
            >
              {chip.label}
            </Chip>
          ))}
        </div>
      )}

      {/* ── Entity list — 24px below Filters, 12px gap between cards ── */}
      <div className="flex flex-col gap-[12px] mt-[24px]">
        {visibleItems.length > 0
          ? visibleItems.map(item => (
              <CardContainer key={item.id} size="sm" className="!p-0 overflow-hidden">
                <EntityList items={[item]} />
              </CardContainer>
            ))
          : (
              <div
                className="flex items-center justify-center"
                style={{ padding: "40px 0", color: "var(--field-supporting)", fontSize: 13 }}
              >
                {emptyLabel}
              </div>
            )
        }
      </div>

      {/* ── Pagination — 16px below list, only when totalItems > itemsPerPage ── */}
      {showPagination && (
        <div className="mt-[16px]">
          <Pagination
            currentPage={currentPage!}
            totalItems={totalItems!}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange!}
            onItemsPerPageChange={onItemsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
          />
        </div>
      )}

      {/* ── Built-in item preview SlideOut ── */}
      {showPreview && (
        <SlideOut
          open={slideoutItemId !== null}
          onClose={() => setSlideoutItemId(null)}
          title={previewItem?.title ?? "Item Preview"}
          subtitle={previewItem?.description ?? ""}
          type="with-variants"
          size="m"
          showTabs={false}
          showSearchBar={false}
          showChips={false}
          showCta={false}
        >
          {previewItem && (
            <div className="flex flex-col gap-[8px] p-[24px]">
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)" }}>
                Status
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
                {previewItem.state?.label ?? "—"}
              </span>
              {previewItem.secondaryMeta && previewItem.secondaryMeta.map((m, i) => (
                <div key={i} style={{ borderTop: "0.5px solid var(--field-border)", paddingTop: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--field-label)", marginBottom: 4 }}>
                    {m.label?.split(":")[0] ?? ""}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--foreground)" }}>
                    {m.label?.split(":")[1]?.trim() ?? m.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SlideOut>
      )}
    </>
  )
}
