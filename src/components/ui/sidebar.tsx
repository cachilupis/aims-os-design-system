import { useState, useRef, useEffect } from "react"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"

// ── DS tokens — sourced from Figma variable bindings (Sidebar page)
// Active gradient: GRADIENT_RADIAL stops @0.29 → @0.61
const ACTIVE_GRADIENT = "radial-gradient(circle at 61% 68%, rgba(33,115,255,1) 29%, rgba(9,226,171,1) 61%)" // audit-ignore: gradient stops, CSS vars can't interpolate here
// Active shadow: DROP_SHADOW rgba(82,163,255,0.38) offset(8,8) blur:20
const ACTIVE_SHADOW   = "8px 8px 20px 0px rgba(82,163,255,0.38)" // audit-ignore: pending Figma effect-name mapping (2026-08 audit) — possibly Figma's "Elevation/Dark/Hover-Blue" style
// Hover shadow: DROP_SHADOW rgba(33,115,255,0.50) offset(0,0) blur:20
const HOVER_SHADOW    = "0px 0px 20px 0px rgba(33,115,255,0.50)" // audit-ignore: pending Figma effect-name mapping (2026-08 audit) — possibly Figma's "Elevation/Dark/Hover-Blue" style
// Container shadow: Figma Elevation-5 — DROP_SHADOW rgba(0,0,0,0.08) offset(8,8) blur:16
const CONTAINER_SHADOW = "var(--shadow-elevation-5)"

export type SidebarItem = {
  id: string
  label: string
  icon: string          // Lucide icon name
  hasChildren?: boolean // shows chevron right in expanded mode
}

export type SidebarProps = {
  items?: SidebarItem[]
  activeId?: string
  onItemClick?: (id: string) => void
  defaultCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
  /**
   * Optional pinned footer slot — rendered at the bottom of the sidebar
   * container, below the nav items. Common uses: user identity row
   * (avatar + name + role), workspace switcher, help/status links.
   *
   * Accepts either a static ReactNode or a render function that receives
   * the current `collapsed` state so callers can render icon-only in the
   * collapsed width (56px) and full content when expanded (250px).
   */
  footer?: React.ReactNode | ((collapsed: boolean) => React.ReactNode)
  className?: string
}

function NavIcon({ name, size = 16, color }: { name: string; size?: number; color: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={1.75} color={color} />
}

export const DEFAULT_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home",        label: "Home",        icon: "Home" },
  { id: "agents",      label: "Agents",      icon: "Sparkle" },
  { id: "automations", label: "Automations", icon: "Zap" },
  { id: "knowledge",   label: "Knowledge",   icon: "LayoutGrid", hasChildren: true },
  { id: "contacts",    label: "Contacts",    icon: "User" },
  { id: "settings",    label: "Settings",    icon: "Settings" },
]

// ── Unified nav item — handles both collapsed (icon-only) and expanded (icon+label) states
function SidebarNavItem({
  item,
  isActive,
  collapsed,
  onItemClick,
}: {
  item: SidebarItem
  isActive: boolean
  collapsed: boolean
  onItemClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const iconColor = isActive || hovered ? "var(--sb-icon-active)" : "var(--sb-icon-default)"
  let iconBg = "transparent", iconShadow = "none"
  if (isActive) { iconBg = ACTIVE_GRADIENT; iconShadow = ACTIVE_SHADOW }
  else if (hovered) { iconBg = "var(--sb-icon-hover-bg)"; iconShadow = HOVER_SHADOW }

  return (
    <button
      onClick={onItemClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={item.label}
      className="flex items-center rounded-[8px] transition-colors duration-150 focus-visible:outline-none shrink-0"
      style={{
        width: "100%",
        height: 24,
        background: !isActive && hovered && !collapsed ? "var(--sb-row-hover)" : "transparent",
        justifyContent: collapsed ? "center" : "space-between",
        paddingLeft: 0,
        paddingRight: collapsed ? 0 : 4,
      }}
    >
      {/* Left: icon button + label */}
      <div className="flex items-center" style={{ gap: collapsed ? 0 : 8 }}>
        {/* Icon button */}
        {collapsed ? (
          <Tooltip content={item.label} side="cursor" triggerClassName="shrink-0">
            <div
              className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] transition-all duration-150"
              style={{ background: iconBg, boxShadow: iconShadow, padding: 4 }}
            >
              <NavIcon name={item.icon} size={16} color={iconColor} />
            </div>
          </Tooltip>
        ) : (
          <div
            className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] transition-all duration-150 shrink-0"
            style={{ background: iconBg, boxShadow: iconShadow, padding: 4 }}
          >
            <NavIcon name={item.icon} size={16} color={iconColor} />
          </div>
        )}

        {/* Label — fades in after expand, fades out before collapse */}
        <span
          className="text-xs font-semibold leading-none whitespace-nowrap"
          style={{
            color: "var(--sb-text)",
            overflow: "hidden",
            display: "block",
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 170,
            transition: collapsed
              ? "opacity 100ms ease, max-width 100ms ease"
              : "opacity 150ms ease 160ms, max-width 160ms ease 80ms",
          }}
        >
          {item.label}
        </span>
      </div>

      {/* Chevron for items with children */}
      {!collapsed && item.hasChildren && (
        <div
          className="w-[16px] h-[16px] flex items-center justify-center shrink-0"
          style={{
            opacity: collapsed ? 0 : 1,
            transition: collapsed ? "opacity 80ms ease" : "opacity 140ms ease 180ms",
          }}
        >
          <NavIcon
            name="ChevronRight"
            size={16}
            color={isActive ? "var(--sb-chevron-active)" : "var(--sb-icon-default)"}
          />
        </div>
      )}
    </button>
  )
}

// ── Toggle button row — always at the top, changes icon based on collapsed state
function SidebarToggleRow({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const iconColor = hovered ? "var(--sb-icon-active)" : "var(--sb-icon-default)"
  const iconBg    = hovered ? "var(--sb-icon-hover-bg)" : "transparent"
  const iconShadow = hovered ? HOVER_SHADOW : "none"

  return (
    <div
      className="flex items-center shrink-0"
      style={{
        height: 24,
        justifyContent: collapsed ? "center" : "flex-end",
        width: "100%",
      }}
    >
      {collapsed ? (
        <Tooltip content="Expand sidebar" side="cursor" triggerClassName="shrink-0">
          <button
            onClick={onToggle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label="Expand sidebar"
            className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] transition-all duration-150 focus-visible:outline-none"
            style={{ background: iconBg, boxShadow: iconShadow, padding: 4 }}
          >
            <NavIcon name="PanelLeftOpen" size={16} color={iconColor} />
          </button>
        </Tooltip>
      ) : (
        <button
          onClick={onToggle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Collapse sidebar"
          className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] transition-all duration-150 focus-visible:outline-none"
          style={{ background: iconBg, boxShadow: iconShadow, padding: 4 }}
        >
          <NavIcon name="PanelLeftClose" size={16} color={iconColor} />
        </button>
      )}
    </div>
  )
}

export function Sidebar({
  items = DEFAULT_SIDEBAR_ITEMS,
  activeId,
  onItemClick,
  defaultCollapsed = false,
  onCollapseChange,
  footer,
  className = "",
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const prevDefault = useRef(defaultCollapsed)
  useEffect(() => {
    if (prevDefault.current !== defaultCollapsed) {
      setCollapsed(defaultCollapsed)
      prevDefault.current = defaultCollapsed
    }
  }, [defaultCollapsed])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapseChange?.(next)
  }

  return (
    <div
      className={`flex flex-col shrink-0 h-full ${className}`}
      style={{
        width: collapsed ? 56 : 250,
        padding: 8,
        overflow: "hidden",
        transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className="flex flex-col gap-[16px]"
        style={{
          background: "var(--sb-bg)",
          borderRadius: collapsed ? 8 : 16,
          padding: 8,
          boxShadow: CONTAINER_SHADOW,
          height: "100%",
          alignItems: collapsed ? "center" : "stretch",
          transition: "border-radius 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Toggle row — always at top, always visible */}
        <SidebarToggleRow collapsed={collapsed} onToggle={toggle} />

        {items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            collapsed={collapsed}
            onItemClick={() => onItemClick?.(item.id)}
          />
        ))}

        {/* Pinned footer slot — pushed to the bottom of the sidebar column.
            mt-auto claims the remaining vertical space so nav items stay
            grouped at the top and the footer hugs the bottom edge. */}
        {footer && (
          <div className="mt-auto shrink-0 w-full">
            {typeof footer === "function" ? footer(collapsed) : footer}
          </div>
        )}
      </div>
    </div>
  )
}
