import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Topbar } from "@/components/ui/topbar"
import { Sidebar } from "@/components/ui/sidebar"
import type { SidebarItem } from "@/components/ui/sidebar"

// ── ScreenLayout ──────────────────────────────────────────────────────────────
//
// Canonical full-screen shell for PM prototypes.
//
// DS breakpoint values baked in — prototypes can't drift:
//   Horizontal margin: 32px (L Desktop 1440px — DS standard baseline)
//   Sidebar:           collapsed by default (56px)
//   Header zone:       outside scrollable area — stays visible on scroll
//   Scroll trigger:    isScrolled = scrollTop > 16px (matches Header compress threshold)
//
// Usage:
//   <ScreenLayout
//     workspaceName="Acme Corp" userName="Juan" userEmail="juan@acme.com"
//     sidebarItems={MY_ITEMS} activeSidebarId="ai-workers"
//     header={(isScrolled) => (
//       <Header size={isScrolled ? "compress" : "size-l"} title="AI Workers" ... />
//     )}
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
  /** Left sidebar navigation items */
  sidebarItems: SidebarItem[]
  /** ID of the active sidebar item */
  activeSidebarId?: string
  /**
   * Header render prop — receives isScrolled (true when content scrollTop > 16px).
   * Use it to switch between Header size="size-l" (default) and size="compress".
   *
   * The Header lives outside the scrollable area so it stays visible when the
   * list scrolls. This matches the canonical AIMS OS List View pattern.
   */
  header: (isScrolled: boolean) => ReactNode
  /**
   * Scrollable content: Filters, entity cards, Pagination.
   * Rendered with DS-spec L-desktop padding: 8px top · 32px sides · 64px bottom.
   * Do NOT add extra horizontal padding to children — it is already applied here.
   */
  children: ReactNode
}

export function ScreenLayout({
  workspaceName,
  userName,
  userEmail,
  sidebarItems,
  activeSidebarId,
  header,
  children,
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
      <Topbar
        workspaceName={workspaceName}
        userName={userName}
        userEmail={userEmail}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — collapsed by default to maximise content area */}
        <Sidebar
          items={sidebarItems}
          activeId={activeSidebarId}
          defaultCollapsed={true}
        />

        {/* Main column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header zone — NOT inside the scroll container.
              Stays visible when the list below scrolls. */}
          <div className="shrink-0">
            {header(isScrolled)}
          </div>

          {/* Scrollable content area
              DS spec L desktop (1440px): 8px top · 32px sides · 64px bottom
              Source: PatternListViewPage full-preview (App.tsx line ~9547) */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            style={{ padding: "8px 32px 64px" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
