/**
 * ListViewSection — AIMS OS DS Layout Component
 *
 * Encapsulates the canonical Filters + Chips + EntityList + Pagination pattern.
 * Drop this into any list view page to get consistent behavior:
 *   - Dropdown aligned to center of clicked filter slot
 *   - Optional nav chips below filters (24px spacing per DS spec)
 *   - 12px gap between entity cards
 *   - Eye (preview) button on every item opens a SlideOut
 *   - Pagination strip with row count
 *
 * Usage:
 *   <ListViewSection
 *     items={MY_ITEMS}
 *     filterSlots={[
 *       { placeholder: "Status",   value: status ?? undefined, onOpen: () => setOpenSlot("Status"),   onRemove: () => setStatus(null) },
 *       { placeholder: "Category", value: cat    ?? undefined, onOpen: () => setOpenSlot("Category"), onRemove: () => setCat(null)    },
 *     ]}
 *     filterOptions={{ Status: ["Active", "Running", "Draft"], Category: ["CX", "Analytics"] }}
 *     onFilterSelect={(slot, value) => { if (slot === "Status") setStatus(value); else setCat(value) }}
 *   />
 */

import { useState, useRef } from "react"
import { Filters } from "@/components/ui/filters"
import { SlideOut } from "@/components/ui/slide-out"
import { EntityList } from "@/components/ui/entity-list"
import { CardContainer } from "@/components/ui/card-container"
import { Chip } from "@/components/ui/chip"
import * as LucideIcons from "lucide-react"
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
  // Items to render in the entity list
  items: EntityListItemData[]

  // Filters bar
  searchPlaceholder?: string
  filterSlots?: FilterSlot[]
  filterOptions?: Record<string, string[]>
  onFilterSelect?: (slot: string, value: string) => void
  openSlot?: string | null
  onOpenSlotChange?: (slot: string | null) => void
  showAllFilters?: boolean
  onAllFiltersClick?: () => void
  showViewToggle?: boolean

  // Navigation chips (rendered below filters, 24px gap per DS spec)
  chips?: NavChip[]
  selectedChip?: string
  onChipSelect?: (chip: string) => void

  // Pagination
  showPagination?: boolean
  totalCount?: number
  pageSize?: number

  // Item preview SlideOut — enabled by default
  showPreview?: boolean

  // Padding around the section (default 0 32px)
  paddingH?: number
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
  showPagination = false,
  totalCount,
  pageSize = 10,
  showPreview = true,
  paddingH = 32,
}: ListViewSectionProps) {
  const px = paddingH

  // Uncontrolled mode: manage openSlot internally when no external handler
  const [internalOpenSlot, setInternalOpenSlot] = useState<string | null>(null)
  const openSlot  = controlledOpenSlot !== undefined ? controlledOpenSlot : internalOpenSlot
  const setSlot   = (s: string | null) => { setInternalOpenSlot(s); onOpenSlotChange?.(s) }

  // Dropdown anchor — center of the clicked filter button
  const [dropdownAnchor, setDropdownAnchor] = useState<{ left: number; top: number } | null>(null)

  // Item preview SlideOut
  const [slideoutItemId, setSlideoutItemId] = useState<string | null>(null)
  const previewItem = items.find(i => i.id === slideoutItemId)

  const containerRef = useRef<HTMLDivElement>(null)

  // Items with Eye button appended
  const itemsWithPreview: EntityListItemData[] = showPreview
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

  return (
    <>
      {/* ── Filters bar ── */}
      <div
        className="shrink-0"
        style={{ padding: `12px ${px}px 0` }}
        onClickCapture={(e: React.MouseEvent) => {
          const btn = (e.target as HTMLElement).closest("button")
          const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          const left = btn
            ? btn.getBoundingClientRect().left + btn.getBoundingClientRect().width / 2
            : e.clientX
          setDropdownAnchor({ left, top: containerRect.bottom })
        }}
        ref={containerRef as React.RefObject<HTMLDivElement>}
      >
        <Filters
          showSearch
          searchPlaceholder={searchPlaceholder}
          slots={filterSlots}
          showAllFilters={showAllFilters}
          onAllFiltersClick={onAllFiltersClick}
          showViewToggle={showViewToggle}
        />
      </div>

      {/* ── Filter dropdown — fixed, centered below slot ── */}
      {openSlot !== null && dropdownAnchor !== null && (() => {
        const opts    = filterOptions[openSlot] ?? []
        const curSlot = filterSlots.find(s => s.placeholder === openSlot)
        const curVal  = curSlot?.value
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
                position:  "fixed",
                left:      dropdownAnchor.left,
                top:       dropdownAnchor.top + 4,
                transform: "translateX(-50%)",
                zIndex:    10001,
                background: "var(--surface)",
                border:     "0.5px solid var(--field-border)",
                borderRadius: 8,
                minWidth:   200,
                boxShadow:  "0 4px 24px 0 rgba(0,0,0,0.16), 0 1px 4px 0 rgba(0,0,0,0.08)",
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
                    className="flex items-center gap-[8px] px-[12px] py-[10px] text-left w-full"
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

      {/* ── Navigation chips — 24px below filters per DS spec ── */}
      {chips.length > 0 && (
        <div
          className="shrink-0 flex items-center gap-[6px] flex-wrap"
          style={{ padding: `24px ${px}px 0` }}
        >
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

      {/* ── Entity list — 12px gap between cards per DS spec ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: `12px ${px}px 0` }}>
        <div className="flex flex-col gap-[12px]">
          {itemsWithPreview.map(item => (
            <CardContainer key={item.id} size="sm" className="!p-0 overflow-hidden">
              <EntityList items={[item]} />
            </CardContainer>
          ))}
        </div>
      </div>

      {/* ── Pagination strip ── */}
      {showPagination && (
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: "10px 32px", borderTop: "0.5px solid var(--field-border)", background: "var(--canvas)" }}
        >
          <div className="flex items-center gap-[8px]">
            <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>Rows per page:</span>
            <div
              className="flex items-center gap-[4px]"
              style={{ padding: "5px 10px", borderRadius: 6, border: "0.5px solid var(--field-border)", background: "var(--canvas)", fontSize: 12, color: "var(--foreground)" }}
            >
              {pageSize} <LucideIcons.ChevronDown size={11} />
            </div>
          </div>
          <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>
            1–{Math.min(pageSize, totalCount ?? items.length)} of {totalCount ?? items.length} items
          </span>
          <div className="flex gap-[6px]">
            <button
              className="h-[28px] px-[10px] rounded-[6px] text-[12px] font-medium"
              style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
            >
              ‹ Previous
            </button>
            <button
              className="h-[28px] px-[10px] rounded-[6px] text-[12px] font-medium"
              style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {/* ── Item preview SlideOut ── */}
      {showPreview && (
        <SlideOut
          open={slideoutItemId !== null}
          onClose={() => setSlideoutItemId(null)}
          title={previewItem?.title ?? "Item Preview"}
          subtitle={previewItem?.description ?? ""}
          type="with-variants"
          size="m"
        >
          {previewItem && (
            <div className="flex flex-col gap-[20px] p-[24px]">
              <div className="flex flex-col gap-[8px]">
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)" }}>Status</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{previewItem.state?.label ?? "—"}</span>
              </div>
              {previewItem.aiInsight && (
                <div className="flex flex-col gap-[8px]">
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)" }}>AI Summary</span>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                    {Array.isArray(previewItem.aiInsight.detail)
                      ? previewItem.aiInsight.detail.join(" ")
                      : previewItem.aiInsight.detail}
                  </p>
                </div>
              )}
              {previewItem.secondaryMeta && previewItem.secondaryMeta.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)" }}>Meta</span>
                  <div className="flex flex-col gap-[4px]">
                    {previewItem.secondaryMeta.map((m, i) => (
                      <span key={i} style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{m.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SlideOut>
      )}
    </>
  )
}
