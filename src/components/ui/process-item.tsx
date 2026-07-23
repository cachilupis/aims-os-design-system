import { type ReactNode } from "react"
import { CheckCircle2, XCircle, Circle, AlertTriangle, ChevronDown, ChevronRight, SearchX } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tag } from "@/components/ui/tag"
import { Spinner } from "@/components/ui/spinner"
import { HighlightNumber, type HighlightNumberVariant } from "@/components/ui/highlight-number"

/**
 * ProcessItem — AIMS OS Design System
 * Source: Figma v6rmYKA2zmyXWOahlxLOeI · node 13501-28579 (ProcessItem) + 14559-9523 (NodeConfigProcess)
 *
 * Shows the step-by-step status of a process or workflow. Used inside SidePanel / SlideOut
 * content areas to provide transparency on what is happening.
 *
 * Statuses: done · loading · error · pending · warning
 * States:   default · selected
 *
 * Sub-components:
 *   ProcessItem       — individual item (icon/badge + title + tag + description + timestamp + expand)
 *   ProcessList       — container with section header, empty/loading/populated states
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProcessStatus = "done" | "loading" | "error" | "pending" | "warning"
export type ProcessItemState = "default" | "selected"

export type ProcessItemProps = {
  title:        string
  description?: string
  timestamp?:   string
  tag?:         string            // when provided, shows an informative tag
  status?:      ProcessStatus
  state?:       ProcessItemState
  /** When provided, renders a HighlightNumber badge instead of the status icon */
  number?:      number | string
  showLine?:    boolean           // vertical connector to next item
  showExpand?:  boolean
  expanded?:    boolean
  onExpand?:    () => void
  onClick?:     () => void
  children?:    ReactNode         // slot content shown when expanded
  className?:   string
}

// ── Status icon colors ────────────────────────────────────────────────────────

const STATUS_ICON_CLASS: Record<ProcessStatus, string> = {
  done:    "text-[var(--color-surface-success-default)]",
  error:   "text-[var(--color-surface-error-default)]",
  warning: "text-[var(--color-surface-alert-default)]",
  pending: "text-[var(--color-icon-neutral-default)]",
  loading: "",
}

const NUMBER_VARIANT: Record<ProcessStatus, HighlightNumberVariant> = {
  done:    "success",
  loading: "informative",
  error:   "error",
  pending: "success",
  warning: "success",
}

// ── ProcessItem ───────────────────────────────────────────────────────────────

export function ProcessItem({
  title,
  description,
  timestamp,
  tag,
  status       = "done",
  state        = "default",
  number,
  showLine     = true,
  showExpand   = false,
  expanded     = false,
  onExpand,
  onClick,
  children,
  className,
}: ProcessItemProps) {
  const isSelected = state === "selected"

  const iconNode = number !== undefined ? (
    <HighlightNumber value={number} variant={NUMBER_VARIANT[status]} />
  ) : status === "loading" ? (
    <Spinner style="primary" size="s" />
  ) : (
    <span className={cn("flex items-center justify-center w-[16px] h-[16px] shrink-0", STATUS_ICON_CLASS[status])}>
      {status === "done"    && <CheckCircle2  size={16} strokeWidth={2} />}
      {status === "error"   && <XCircle       size={16} strokeWidth={2} />}
      {status === "warning" && <AlertTriangle size={16} strokeWidth={2} />}
      {status === "pending" && <Circle        size={16} strokeWidth={1.5} />}
    </span>
  )

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-[16px] items-start p-[4px] w-full",
        isSelected && "bg-[var(--color-surface-neutral-default)] border border-[var(--color-border-primary-default)] rounded-[8px]",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {/* Left: icon/badge + vertical line */}
      <div className="flex flex-col items-center self-stretch shrink-0 gap-0">
        <div className="flex items-center justify-center w-[16px] h-[16px] shrink-0">
          {iconNode}
        </div>
        {showLine && (
          <div className="flex-1 min-h-[4px] flex justify-center w-full mt-[2px]">
            <div className="w-px bg-[var(--color-border-neutral-lighter)]" />
          </div>
        )}
      </div>

      {/* Right: content */}
      <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
        {/* Title + tag */}
        <div className="flex items-start justify-between w-full gap-[8px]">
          <p className="text-[14px] font-semibold leading-[20px] text-[var(--color-text-title)] min-w-0">
            {title}
          </p>
          {tag && (
            <Tag variant="informative" size="sm" className="shrink-0">
              {tag}
            </Tag>
          )}
        </div>

        {/* Description + timestamp + expand */}
        <div className={cn(
          "flex w-full gap-[2px]",
          (description || timestamp) && showExpand ? "justify-between items-start" : "items-start",
        )}>
          {(description || timestamp) && (
            <div className="flex flex-col gap-[2px] flex-1 min-w-0">
              {description && (
                <p className="text-[14px] font-medium leading-[20px] text-[var(--color-text-body)]">
                  {description}
                </p>
              )}
              {timestamp && (
                <p className="text-[10px] font-medium leading-none text-[var(--color-text-body)] opacity-70">
                  {timestamp}
                </p>
              )}
            </div>
          )}
          {showExpand && (
            <button
              aria-label={expanded ? "Collapse" : "Expand"}
              onClick={e => { e.stopPropagation(); onExpand?.() }}
              className="flex items-center justify-center w-[28px] h-[28px] rounded-[4px] shrink-0 transition-colors hover:bg-[var(--color-surface-neutral-default)] text-[var(--color-text-body)]"
            >
              <ChevronDown
                size={16}
                className={cn("transition-transform duration-200", expanded && "rotate-180")}
              />
            </button>
          )}
        </div>

        {/* Slot (expanded content) */}
        {children && (
          <div className="w-full mt-[4px]">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ProcessList ───────────────────────────────────────────────────────────────

export type ProcessListState = "empty" | "loading" | "populated"

export type ProcessListItem = {
  id:           string
  title:        string
  description?: string
  timestamp?:   string
  tag?:         string
  status?:      ProcessStatus
  number?:      number | string
  showExpand?:  boolean
  children?:    ReactNode
}

export type ProcessListProps = {
  title?:           string
  state?:           ProcessListState
  items?:           ProcessListItem[]
  onViewAll?:       () => void
  emptyTitle?:      string
  emptyDescription?: string
  className?:       string
}

export function ProcessList({
  title            = "Process",
  state            = "populated",
  items            = [],
  onViewAll,
  emptyTitle       = "No process activity yet",
  emptyDescription = "Process steps will appear here when the workflow runs.",
  className,
}: ProcessListProps) {
  return (
    <div className={cn("flex flex-col gap-[8px]", className)}>
      {/* Section header */}
      <div className="flex items-center justify-between h-[32px]">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--field-label)]">
          {title}
        </span>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-[2px] text-[11px] font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            View all <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Empty */}
      {state === "empty" && (
        <div className="flex flex-col gap-[12px] items-center justify-center py-[24px] px-[16px]">
          <div className="w-[32px] h-[32px] rounded-[6px] flex items-center justify-center shrink-0 bg-[var(--color-surface-primary-subtle)]">
            <SearchX size={16} className="text-[var(--primary)]" />
          </div>
          <div className="flex flex-col gap-[4px] items-center text-center">
            <p className="text-[13px] font-semibold text-[var(--color-text-title)]">{emptyTitle}</p>
            <p className="text-[12px] text-[var(--color-text-body)]">{emptyDescription}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {state === "loading" && (
        <div className="flex flex-col gap-0">
          {[1, 2].map((_, i) => (
            <ProcessItem
              key={i}
              title="Loading…"
              description="Fetching process data"
              status="loading"
              showLine={i < 1}
            />
          ))}
        </div>
      )}

      {/* Populated */}
      {state === "populated" && items.length > 0 && (
        <div className="flex flex-col gap-0">
          {items.map((item, i) => (
            <ProcessItem
              key={item.id}
              title={item.title}
              description={item.description}
              timestamp={item.timestamp}
              tag={item.tag}
              status={item.status ?? "done"}
              number={item.number}
              showLine={i < items.length - 1}
              showExpand={item.showExpand}
            >
              {item.children}
            </ProcessItem>
          ))}
        </div>
      )}
    </div>
  )
}
