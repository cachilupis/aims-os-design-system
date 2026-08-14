import { Bell, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem, type NotificationItemProps } from "@/components/ui/notification-item"

/**
 * Notification Center — AIMS OS Design System
 * Component set: Figma v6rmYKA2zmyXWOahlxLOeI · node 18695:1059 ("Feed State=…")
 *
 * 420px-wide floating panel — the bell icon trigger's dropdown. Header (title +
 * count + Mark all read) → filter chips (All / Unread / Assigned to me — the
 * exact 3 chips from the DS mock) → date-grouped Notification Item list
 * (scrollable) → footer "View all". Five states: Default, Empty, Loading,
 * Error, Offline.
 *
 * Header actions — the Button component set (4504:5148) has a combined
 * "Icon=Right" variant (label + trailing icon in ONE instance) built for
 * exactly this case. The single "Mark all read" control is ONE Button:
 * variant=tertiary, size=sm, pill=false, icon=Check, iconPosition="right".
 * (An earlier pass here read two adjacent instances in the Header > Actions
 * frame as two separate controls and built a fake overflow dropdown on top —
 * both mistakes. There is no overflow/settings/mute menu anywhere in this
 * component.)
 *
 * Panel sizing: h-[560px], a FIXED height — matches every one of Figma's
 * "Feed State=…" symbols (Default/Empty/Loading/Error/Offline), which are
 * all exactly 420×560 with no auto-height. The panel does not shrink for a
 * short list or grow past 560 for a long one; the list region alone
 * (flex-1, wrapped in the real ScrollArea component) absorbs the difference —
 * empty space below a short list, or the DS 4px branded scrollbar for a long one.
 *
 * Row dividers: every Divider layer inside Figma's "Notification List" /
 * "Loading Content" frames (both Default and Loading states) is hidden=true —
 * verified directly on the node tree, not assumed. Rows sit flush against each
 * other with no separator; only the Header/List and List/Footer boundary
 * dividers (outside the scrollable region) are visible. Do not reintroduce
 * per-row dividers.
 *
 * Composition — reuses existing DS atoms, no custom re-implementations:
 *   Mark all read / View all → Button (variant="tertiary", size="sm")
 *   Filter chips              → Chip (variant="primary" active / "secondary" inactive, size="s")
 *   Rows                      → NotificationItem (hoverable=true here — this is the one context
 *                               where the row's own hover background is the intended feedback)
 *   Scrollable list           → ScrollArea (DS 4px branded scrollbar, hidden until hover)
 *   Loading rows              → Skeleton
 *   Empty / Error content     → EmptyState
 *
 * Panel surface reuses --surface-floating-default (same token as Menu/SidePanel/
 * SlideOut) — not a dedicated --notification-* alias, since it's the exact same
 * DS concept (a floating glass surface) with no unique tinting of its own.
 */

export type NotificationCenterState = "default" | "empty" | "loading" | "error" | "offline"

export type NotificationItemData = NotificationItemProps & { id: string }

export type NotificationGroup = {
  /** Date-group label, e.g. "TODAY", "YESTERDAY", "EARLIER" */
  label: string
  items: NotificationItemData[]
}

export interface NotificationCenterProps {
  /** Default: "default" */
  state?:  NotificationCenterState
  /** Shown as "(N)" next to the title. Default: 0 */
  count?:  number
  groups?: NotificationGroup[]
  /** Filter chip labels. Default: the DS mock's 3 chips — ["All", "Unread", "Assigned to me"] */
  filters?:      string[]
  activeFilter?: string
  onFilterChange?:  (filter: string) => void
  /** Fires the "Mark all read" button. Omitting it hides the button. Only shown in the default state. */
  onMarkAllRead?:   () => void
  onViewAll?:       () => void
  emptyTitle?:       string
  emptyDescription?: string
  emptyCtaLabel?:    string
  onEmptyCta?:       () => void
  errorTitle?:       string
  errorDescription?: string
  retryLabel?:       string
  onRetry?:          () => void
  /** Shown as the offline banner message. */
  offlineMessage?: string
  className?: string
}

function Header({
  count, onMarkAllRead,
}: { count: number; onMarkAllRead?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-[8px] p-[16px] shrink-0">
      <div className="flex items-center gap-[8px] min-w-0">
        <Bell size={16} style={{ color: "var(--foreground)" }} />
        <span className="text-sm font-semibold leading-none whitespace-nowrap" style={{ color: "var(--color-text-title)" }}>
          Notifications
        </span>
        {count > 0 && (
          <span className="text-xs font-medium leading-none" style={{ color: "var(--color-text-caption)" }}>
            ({count})
          </span>
        )}
      </div>
      {onMarkAllRead && (
        <Button
          variant="tertiary"
          size="sm"
          icon={<Check size={14} />}
          iconPosition="right"
          onClick={onMarkAllRead}
          className="shrink-0"
        >
          Mark all read
        </Button>
      )}
    </div>
  )
}

function Divider() {
  return <div className="h-px w-full shrink-0" style={{ background: "var(--color-border-neutral-lighter)" }} />
}

function FilterBar({
  filters, activeFilter, onFilterChange,
}: { filters: string[]; activeFilter: string; onFilterChange?: (f: string) => void }) {
  return (
    <div className="flex items-center gap-[4px] px-[16px] py-[8px] shrink-0">
      {filters.map(f => (
        <Chip
          key={f}
          variant={f === activeFilter ? "primary" : "secondary"}
          size="s"
          onClick={() => onFilterChange?.(f)}
        >
          {f}
        </Chip>
      ))}
    </div>
  )
}

function NotificationList({ groups }: { groups: NotificationGroup[] }) {
  return (
    <ScrollArea className="flex-1 min-h-0">
      {groups.map((group, gi) => (
        <div key={group.label}>
          <div className="px-[16px] py-[8px]" style={{ paddingTop: gi === 0 ? 8 : 12 }}>
            <span className="text-xs font-semibold leading-none" style={{ color: "var(--color-text-caption)" }}>
              {group.label}
            </span>
          </div>
          {/* No dividers between rows — every Divider inside Figma's "Notification List"
              frame (both after the date label and between items) is hidden=true. Only the
              Header/List and List/Footer boundary dividers (outside this component) render. */}
          {group.items.map(item => (
            <NotificationItem key={item.id} {...item} />
          ))}
        </div>
      ))}
    </ScrollArea>
  )
}

function LoadingContent() {
  return (
    // flex-1 (not auto-height) — Figma's "Loading Content" frame (node 18693:1195) is a
    // fixed 450px even though the 4 skeleton rows only fill 264px of it; the remaining
    // 186px is dead space ABOVE the footer, not collapsed. Without flex-1 here, the
    // Divider + Footer below would ride up right under the last skeleton row instead of
    // sitting at the panel's fixed 508px boundary like every other state.
    <div className="flex-1 overflow-hidden min-h-0">
      {/* No dividers between skeleton rows — same hidden=true pattern as the real list (node 18693:1181). */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="flex items-start gap-[12px] p-[12px]">
          <Skeleton shape="circle" width={24} height={24} />
          <div className="flex-1 flex flex-col gap-[8px]">
            <Skeleton shape="text" width="70%" height={14} />
            <Skeleton shape="text" width="90%" height={14} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Footer({ onViewAll, loading }: { onViewAll?: () => void; loading?: boolean }) {
  return (
    <div className="p-[16px] pt-[12px] shrink-0">
      {loading
        // Figma's Loading state (node 18693:1220) swaps the real "View All" instance for a
        // Skeleton bar in the exact same slot (388×28) — you can't offer a real, clickable
        // "View all" while the list underneath hasn't loaded yet.
        ? <Skeleton shape="text" width="100%" height={28} />
        : (
          <Button variant="tertiary" size="sm" className="w-full justify-center" onClick={onViewAll}>
            View all
          </Button>
        )
      }
    </div>
  )
}

function NotificationCenter({
  state    = "default",
  count    = 0,
  groups   = [],
  filters       = ["All", "Unread", "Assigned to me"],
  activeFilter  = "All",
  onFilterChange,
  onMarkAllRead,
  onViewAll,
  emptyTitle       = "You're all caught up",
  emptyDescription = "No new notifications to show. We'll let you know when something needs your attention.",
  emptyCtaLabel,
  onEmptyCta,
  errorTitle       = "Something went wrong",
  errorDescription = "We couldn't load your notifications. Please check your connection and try again.",
  retryLabel       = "Retry",
  onRetry,
  offlineMessage   = "You're offline. Showing cached notifications.",
  className,
}: NotificationCenterProps) {
  return (
    <div
      className={cn("flex flex-col w-[420px] h-[560px] rounded-[8px] overflow-hidden", className)}
      style={{
        background: "var(--surface-floating-default)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)", // audit-ignore: reused from Menu's shadow treatment, pending Figma effect-name mapping
      }}
    >
      <Header count={count} onMarkAllRead={state === "default" ? onMarkAllRead : undefined} />
      <Divider />

      {state === "default" && (
        <>
          <FilterBar filters={filters} activeFilter={activeFilter} onFilterChange={onFilterChange} />
          <NotificationList groups={groups} />
        </>
      )}

      {state === "empty" && (
        <div className="flex-1 flex items-center justify-center px-[16px] min-h-0">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            ctaLabel={emptyCtaLabel}
            onCta={onEmptyCta}
            className="py-[24px] rounded-[16px]"
          />
        </div>
      )}

      {state === "loading" && <LoadingContent />}

      {state === "error" && (
        <div className="flex-1 flex items-center justify-center px-[16px] min-h-0">
          <EmptyState
            title={errorTitle}
            description={errorDescription}
            ctaLabel={retryLabel}
            onCta={onRetry}
            className="py-[24px] rounded-[16px]"
          />
        </div>
      )}

      {state === "offline" && (
        <>
          <div
            className="flex items-center px-[16px] py-[8px] shrink-0"
            style={{ background: "var(--color-surface-alert-more-subtle)" }}
          >
            <span className="text-xs font-medium leading-[20px]" style={{ color: "var(--color-text-alert)" }}>
              {offlineMessage}
            </span>
          </div>
          <NotificationList groups={groups} />
        </>
      )}

      <Divider />
      <Footer onViewAll={onViewAll} loading={state === "loading"} />
    </div>
  )
}

export { NotificationCenter }
