import { Search, X, ChevronDown, SlidersHorizontal, ArrowDown, LayoutGrid, LayoutList } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tag } from "@/components/ui/tag"

/**
 * Filters Bar — AIMS OS Design System
 * Figma: v6rmYKA2zmyXWOahlxLOeI · node 7996:4655
 *
 * Horizontal 40px bar combining a search input, up to 5 filter chips,
 * an "All filters" control, sort direction, sort label, and grid/list toggle.
 *
 * Two compact modes driven by `compact` + `compactCount`:
 *   compact=true, compactCount=0  → S Variant: Search + "All filters" only
 *   compact=true, compactCount>0  → S Variant Filters Apply: "Filters N" badge + "Clear Filters"
 *
 * Token family: --fi-*
 *   inactive chip:  --fi-chip-bg / --fi-chip-border / --fi-chip-text / --fi-chip-icon
 *   active chip:    --fi-chip-active-bg / --fi-chip-active-border / --fi-chip-active-text / --fi-chip-active-icon
 *   clear text:     --fi-clear-text / --fi-clear-hover
 *   badge:          --fi-badge-bg / --fi-badge-text
 *   view toggle:    --fi-view-active-bg / --fi-view-active-icon / --fi-view-icon
 *   sort controls:  --fi-sort-icon / --fi-sort-text
 */

export type FilterSlot = {
  placeholder: string    // label shown when no value is selected (e.g. "Type", "Owner")
  value?: string         // if set, chip renders as active with this value + × dismiss
  onRemove?: () => void
  onOpen?: () => void
}

export type FiltersProps = {
  compact?: boolean        // S Variant — shows only Search + "All filters" button
  compactCount?: number    // > 0 → S Variant Filters Apply: badge instead of search
  showSearch?: boolean     // default: true
  searchPlaceholder?: string
  slots?: FilterSlot[]     // up to 5 filter chips
  showClearFilters?: boolean
  onClearFilters?: () => void
  showAllFilters?: boolean // default: true — "All filters ☰" pill button
  onAllFiltersClick?: () => void
  showSort?: boolean       // default: true — sort arrow + sort label
  sortLabel?: string       // default: "Name"
  onSortClick?: () => void
  showViewToggle?: boolean // default: true — grid/list icon buttons
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
  className?: string
}

const CHIP_BASE =
  "inline-flex items-center gap-[6px] h-[40px] px-[8px] rounded-[8px] border-[0.5px] text-[13px] font-medium transition-colors select-none"

function AllFiltersButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="inline-flex items-center gap-[6px] h-[40px] px-[12px] rounded-full border text-[13px] font-medium transition-colors shrink-0"
      style={{
        background:   "var(--fi-chip-bg)",
        borderColor:  "var(--fi-chip-border)",
        color:        "var(--fi-chip-text)",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--fi-chip-hover-bg)" }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--fi-chip-bg)" }}
      onClick={onClick}
    >
      All filters
      <SlidersHorizontal className="w-[14px] h-[14px] shrink-0" style={{ color: "var(--fi-chip-icon)" }} />
    </button>
  )
}

export function Filters({
  compact           = false,
  compactCount      = 0,
  showSearch        = true,
  searchPlaceholder = "Search",
  slots             = [],
  showClearFilters  = false,
  onClearFilters,
  showAllFilters    = true,
  onAllFiltersClick,
  showSort          = true,
  sortLabel         = "Name",
  onSortClick,
  showViewToggle    = true,
  viewMode          = "grid",
  onViewModeChange,
  className,
}: FiltersProps) {
  const isCompactActive = compact && compactCount > 0
  const isCompactEmpty  = compact && !compactCount

  return (
    <div
      data-slot="filters"
      className={cn("flex items-center gap-[8px] w-full h-[40px]", className)}
    >
      {/* ── Left area (grows) ────────────────────────────────────────────── */}
      <div className="flex items-center gap-[8px] flex-1 min-w-0">

        {/* S Variant Filters Apply: "Filters N" badge chip + Clear Filters */}
        {isCompactActive ? (
          <>
            <button
              className={cn(CHIP_BASE, "shrink-0 gap-[6px]")}
              style={{
                background:  "var(--fi-chip-bg)",
                borderColor: "var(--fi-chip-border)",
                color:       "var(--fi-chip-text)",
              }}
            >
              Filters
              <span
                className="flex items-center justify-center min-w-[18px] h-[18px] px-[4px] rounded-full text-[11px] font-semibold leading-none"
                style={{ background: "var(--fi-badge-bg)", color: "var(--fi-badge-text)" }}
              >
                {compactCount}
              </span>
            </button>

            <button
              className="text-[13px] font-medium transition-colors shrink-0"
              style={{ color: "var(--fi-clear-text)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--fi-clear-hover)" }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--fi-clear-text)" }}
              onClick={onClearFilters}
            >
              Clear Filters
            </button>
          </>
        ) : (
          <>
            {/* Search input */}
            {showSearch && (
              <div
                className="inline-flex items-center gap-[6px] h-[40px] px-[10px] rounded-[8px] border-[0.5px] w-[140px] shrink-0"
                style={{
                  background:  "var(--field-bg)",
                  borderColor: "var(--field-border)",
                }}
              >
                <Search className="w-[14px] h-[14px] shrink-0" style={{ color: "var(--field-icon)" }} />
                <span
                  className="text-[13px] font-medium truncate"
                  style={{ color: "var(--field-placeholder)" }}
                >
                  {searchPlaceholder}
                </span>
              </div>
            )}

            {/* S Variant compact: just "All filters" alongside Search */}
            {isCompactEmpty && showAllFilters && (
              <AllFiltersButton onClick={onAllFiltersClick} />
            )}

            {/* Normal mode: filter chips */}
            {!compact && slots.map((slot, i) =>
              slot.value ? (
                /* Active chip — value as Tag informative sm; X lives inside Tag trailingIcon */
                <div
                  key={i}
                  className={cn(CHIP_BASE, "pr-[6px] shrink-0")}
                  style={{
                    background:  "var(--fi-chip-active-bg)",
                    borderColor: "var(--fi-chip-active-border)",
                    cursor:      "default",
                  }}
                  aria-label={`Filter: ${slot.value}`}
                >
                  <Tag
                    variant="informative"
                    size="sm"
                    trailingIcon={
                      <button
                        className="flex items-center justify-center hover:opacity-70 transition-opacity ml-[1px]"
                        onClick={e => { e.stopPropagation(); slot.onRemove?.() }}
                        aria-label={`Remove ${slot.value} filter`}
                      >
                        <X className="w-[9px] h-[9px]" />
                      </button>
                    }
                  >
                    {slot.value.length > 14 ? `${slot.value.slice(0, 14)}…` : slot.value}
                  </Tag>
                  <button
                    className="flex items-center justify-center w-[16px] h-[16px] shrink-0 transition-opacity hover:opacity-70"
                    style={{ color: "var(--fi-chip-active-icon)" }}
                    onClick={slot.onOpen}
                    aria-label="Expand filter"
                  >
                    <ChevronDown className="w-[12px] h-[12px]" />
                  </button>
                </div>
              ) : (
                /* Inactive dropdown chip — matches Select/Input tokens */
                <button
                  key={i}
                  className={cn(CHIP_BASE, "shrink-0")}
                  style={{
                    background:  "var(--field-bg)",
                    borderColor: "var(--field-border)",
                    color:       "var(--field-text)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--field-border-hover)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--field-border)" }}
                  onClick={slot.onOpen}
                >
                  {slot.placeholder}
                  <ChevronDown className="w-[14px] h-[14px] shrink-0" style={{ color: "var(--field-icon)" }} />
                </button>
              )
            )}

            {/* Clear Filters — normal mode */}
            {!compact && showClearFilters && (
              <button
                className="text-[13px] font-medium transition-colors shrink-0"
                style={{ color: "var(--fi-clear-text)" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--fi-clear-hover)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--fi-clear-text)" }}
                onClick={onClearFilters}
              >
                Clear Filters
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Right controls (shrinks) ──────────────────────────────────────── */}
      <div className="flex items-center gap-[4px] shrink-0">
        {/* "All filters" pill — normal mode only */}
        {!compact && showAllFilters && (
          <div className="mr-[4px]">
            <AllFiltersButton onClick={onAllFiltersClick} />
          </div>
        )}

        {/* Sort direction arrow */}
        {showSort && (
          <button
            className="flex items-center justify-center w-[32px] h-[40px] transition-opacity hover:opacity-80"
            style={{ color: "var(--fi-sort-icon)" }}
            onClick={onSortClick}
            aria-label="Sort direction"
          >
            <ArrowDown className="w-[16px] h-[16px]" />
          </button>
        )}

        {/* Sort label dropdown */}
        {showSort && (
          <button
            className="inline-flex items-center gap-[4px] h-[40px] px-[4px] text-[13px] font-medium transition-opacity hover:opacity-80"
            style={{ color: "var(--fi-sort-text)" }}
            onClick={onSortClick}
          >
            {sortLabel}
            <ChevronDown className="w-[13px] h-[13px] shrink-0" style={{ color: "var(--fi-sort-icon)" }} />
          </button>
        )}

        {/* Grid / List view toggle */}
        {showViewToggle && (
          <div className="flex items-center ml-[4px]">
            <button
              className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] transition-colors"
              style={{
                background: viewMode === "grid" ? "var(--fi-view-active-bg)"   : "transparent",
                color:      viewMode === "grid" ? "var(--fi-view-active-icon)" : "var(--fi-view-icon)",
              }}
              onClick={() => onViewModeChange?.("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid className="w-[16px] h-[16px]" />
            </button>
            <button
              className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] transition-colors"
              style={{
                background: viewMode === "list" ? "var(--fi-view-active-bg)"   : "transparent",
                color:      viewMode === "list" ? "var(--fi-view-active-icon)" : "var(--fi-view-icon)",
              }}
              onClick={() => onViewModeChange?.("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <LayoutList className="w-[16px] h-[16px]" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
