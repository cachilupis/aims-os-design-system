import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Sparkles, Bell, Settings } from "lucide-react"
import { Topbar } from "@/components/ui/topbar"
import type { TopbarAction } from "@/components/ui/topbar"
import { Sidebar } from "@/components/ui/sidebar"
import type { SidebarEntry } from "@/components/ui/sidebar"
import { AppBackground } from "@/components/ui/app-background"
import type { AppBgVariant } from "@/components/ui/app-background"
import { NotificationCenter, type NotificationGroup, type NotificationItemData } from "@/components/ui/notification-center"

const DEFAULT_TOPBAR_ACTIONS: TopbarAction[] = [
  { icon: <Sparkles size={16} />, label: "AI",            variant: "primary" },
  { icon: <Bell     size={16} />, label: "Notifications", id: "notifications" },
  { icon: <Settings size={16} />, label: "Settings"      },
]

// ── Default Notifications dropdown ──────────────────────────────────────────
// Self-contained so the bell icon opens something real out of the box with
// zero setup — pass `notificationsContent` to ScreenLayout to override with
// real data. Kept intentionally small (3 items); the full taxonomy-grounded
// demo set lives in the Notification Center doc page, not duplicated here.

const DEFAULT_NOTIF_ITEMS: NotificationItemData[] = [
  { id: "1", avatarName: "Sarah Chen", title: "New comment on your ticket", timestamp: "2 min ago", description: "Sarah left a comment on 'Login page redesign'.", unread: true },
  { id: "2", iconVariant: "error", iconName: "Workflow", title: "Customer Sync workflow failed", timestamp: "25 min ago", description: "3 consecutive sync attempts failed. Manual retry required.", unread: true, primaryAction: { label: "Retry" } },
  { id: "3", iconVariant: "success", iconName: "Rocket", title: "Runtime v3.2.1 deployed successfully", timestamp: "3 hours ago", description: "All health checks passed." },
]

function DefaultNotificationsDropdown() {
  const [items, setItems] = useState(DEFAULT_NOTIF_ITEMS)
  const [filter, setFilter] = useState("All")

  const visible = filter === "Unread" ? items.filter(i => i.unread) : items
  const groups: NotificationGroup[] = visible.length > 0 ? [{ label: "TODAY", items: visible }] : []

  return (
    <NotificationCenter
      state={groups.length > 0 ? "default" : "empty"}
      count={items.filter(i => i.unread).length}
      groups={groups}
      filters={["All", "Unread"]}
      activeFilter={filter}
      onFilterChange={setFilter}
      onMarkAllRead={() => setItems(prev => prev.map(i => ({ ...i, unread: false })))}
    />
  )
}

// ── ScreenLayout ──────────────────────────────────────────────────────────────
//
// Canonical full-screen shell for PM prototypes.
//
// DS breakpoint values baked in — prototypes can't drift:
//   Horizontal margin: 32px (L Desktop 1440px — DS standard baseline)
//   Sidebar:           collapsed by default (56px)
//   Header zone:       outside scrollable area — stays visible on scroll
//   Scroll trigger:    isScrolled = scrollTop > 16px (matches Header compress threshold)
//   Pagination:        position: absolute; bottom: 0 — floats over the list
//                      Source: PatternListViewPage full-preview (App.tsx line ~9570)
//
// Usage:
//   <ScreenLayout
//     workspaceName="Acme Corp" userName="Juan" userEmail="juan@acme.com"
//     sidebarItems={MY_ITEMS} activeSidebarId="ai-workers"
//     header={(isScrolled) => (
//       <Header size={isScrolled ? "compress" : "size-l"} title="AI Workers" ... />
//     )}
//     pagination={
//       filtered.length > pageSize
//         ? <Pagination currentPage={page} totalItems={filtered.length} ... />
//         : undefined
//     }
//   >
//     <ListViewSection items={...} filterSlots={...} ... />
//   </ScreenLayout>

export interface ScreenLayoutProps {
  /** Topbar workspace label */
  workspaceName?: string
  /** Topbar user display name */
  userName?: string
  /** Topbar user email */
  userEmail?: string
  /** Topbar company name (right side) */
  companyName?: string
  /** Topbar action buttons — defaults to AI + Notifications + Settings */
  topbarActions?: TopbarAction[]
  /**
   * Content rendered in the floating panel below the Notifications bell icon
   * (the action with id="notifications" in topbarActions). Defaults to a
   * self-contained demo NotificationCenter so the bell works out of the box —
   * pass a real, data-connected <NotificationCenter> to override.
   */
  notificationsContent?: ReactNode
  /** AppBackground color variant — defaults to "default" */
  bgVariant?: AppBgVariant
  /** Left sidebar navigation items — accepts nav items and section headers */
  sidebarItems: SidebarEntry[]
  /** ID of the active sidebar item */
  activeSidebarId?: string
  /** Called when a sidebar item is clicked — use to implement inter-screen navigation */
  onSidebarItemClick?: (id: string) => void
  /**
   * Optional pinned footer slot for the Sidebar (bottom edge). Passes
   * straight through to `<Sidebar footer={...} />` — accepts a ReactNode
   * or a render function that receives the current `collapsed` state so
   * callers can render icon-only when collapsed. Common use: user
   * identity row (avatar + name + role).
   */
  sidebarFooter?: React.ReactNode | ((collapsed: boolean) => React.ReactNode)
  /**
   * Header render prop — receives isScrolled (true when content scrollTop > 16px).
   * Use it to switch between Header size="size-l" (default) and size="compress".
   *
   * The Header lives outside the scrollable area so it stays visible when the
   * list scrolls. This matches the canonical AIMS OS List View pattern.
   */
  header: (isScrolled: boolean) => ReactNode
  /**
   * Scrollable content: Filters + entity cards. No Pagination here.
   * Rendered with DS-spec L-desktop padding: 8px top · 32px sides · 64px bottom.
   * The 64px bottom leaves space for the floating Pagination bar.
   * Do NOT add extra horizontal padding to children — it is already applied here.
   */
  children: ReactNode
  /**
   * Optional Pagination — rendered with position: absolute; bottom: 0 so it
   * floats over the list (content scrolls behind the glass bar).
   * Pass <Pagination ... /> directly; ScreenLayout handles the positioning.
   * Omit when there is only one page of results.
   *
   * @example
   * pagination={
   *   filtered.length > pageSize
   *     ? <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={pageSize} onPageChange={setPage} />
   *     : undefined
   * }
   */
  pagination?: ReactNode
}

export function ScreenLayout({
  workspaceName,
  userName,
  userEmail,
  companyName = "AIMS OS",
  topbarActions = DEFAULT_TOPBAR_ACTIONS,
  notificationsContent = <DefaultNotificationsDropdown />,
  bgVariant = "default",
  sidebarItems,
  activeSidebarId,
  onSidebarItemClick,
  sidebarFooter,
  header,
  children,
  pagination,
}: ScreenLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => setIsScrolled(el.scrollTop > 16)
    el.addEventListener("scroll", handler)
    return () => el.removeEventListener("scroll", handler)
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <AppBackground variant={bgVariant} />
      <Topbar
        workspaceName={workspaceName}
        userName={userName}
        userEmail={userEmail}
        companyName={companyName}
        actions={topbarActions}
        notificationsContent={notificationsContent}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — collapsed by default to maximise content area */}
        <Sidebar
          items={sidebarItems}
          activeId={activeSidebarId}
          defaultCollapsed={true}
          onItemClick={onSidebarItemClick}
          footer={sidebarFooter}
        />

        {/* Main column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header zone — outside the scroll container, stays visible on scroll */}
          <div className="shrink-0 relative">
            {header(isScrolled)}
            {/* Gradient fade below compressed header — appears on scroll to signal content scrolling behind */}
            {isScrolled && (
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  left: 0,
                  right: 0,
                  height: 20,
                  background: "linear-gradient(to bottom, var(--canvas), transparent)",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
            )}
          </div>

          {/* Content area — relative so Pagination can float at the bottom */}
          <div className="flex-1 relative overflow-hidden">

            {/* Scrollable list — 64px bottom padding leaves room for floating Pagination */}
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto"
              style={{ padding: "8px 32px 64px" }}
            >
              {children}
            </div>

            {/* Pagination floats over the list — content scrolls behind it */}
            {pagination && (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 }}>
                {pagination}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
