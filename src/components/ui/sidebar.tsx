import { useState } from "react"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

// ── DS active state (gradient + shadows — same in both modes)
// Source: Figma Sidebar · "Property 1=Focus" · iconFocus component
const ACTIVE_GRADIENT = "radial-gradient(circle at 61% 68%, rgba(33,115,255,1) 29%, rgba(9,226,171,1) 61%)"
const ACTIVE_SHADOW   = "8px 8px 20px 0px rgba(82,163,255,0.38)"
// Source: "Property 1=Hover" · DROP_SHADOW offset(0,0) blur:20 rgba(33,115,255,0.50)
const HOVER_SHADOW    = "0px 0px 20px 0px rgba(33,115,255,0.50)"
// Container DROP_SHADOW: offset(8,8) blur:16 rgba(0,0,0,0.08)
const CONTAINER_SHADOW = "8px 8px 16px 0px rgba(0,0,0,0.08)"

export type SidebarItem = {
  id: string
  label: string
  icon: string          // Lucide icon name
  hasChildren?: boolean // shows chevron right in expanded mode
  badge?: number
}

export type SidebarProps = {
  items?: SidebarItem[]
  activeId?: string
  onItemClick?: (id: string) => void
  defaultCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
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
]

// ── Icon-only button (used in both collapsed nav items and expand toggle)
function IconBtn({
  iconName,
  label,
  isActive = false,
  isHovered: externalHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  iconName: string
  label: string
  isActive?: boolean
  isHovered?: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const [localHovered, setLocalHovered] = useState(false)
  const hovered = externalHovered ?? localHovered

  const iconColor = isActive || hovered
    ? "var(--sb-icon-active)"
    : "var(--sb-icon-default)"

  let bg = "transparent"
  let shadow = "none"

  if (isActive) {
    bg = ACTIVE_GRADIENT
    shadow = ACTIVE_SHADOW
  } else if (hovered) {
    bg = "var(--sb-icon-hover-bg)"
    shadow = HOVER_SHADOW
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setLocalHovered(true); onMouseEnter?.() }}
      onMouseLeave={() => { setLocalHovered(false); onMouseLeave?.() }}
      aria-label={label}
      title={label}
      className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] shrink-0 transition-all duration-150 focus-visible:outline-none"
      style={{ background: bg, boxShadow: shadow }}
    >
      <NavIcon name={iconName} size={16} color={iconColor} />
    </button>
  )
}

export function Sidebar({
  items = DEFAULT_SIDEBAR_ITEMS,
  activeId,
  onItemClick,
  defaultCollapsed = false,
  onCollapseChange,
  className = "",
}: SidebarProps) {
  const [collapsed, setCollapsed]   = useState(defaultCollapsed)
  const [hoveredId, setHoveredId]   = useState<string | null>(null)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapseChange?.(next)
  }

  // ── Collapsed ────────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div
        className={`flex flex-col shrink-0 h-full ${className}`}
        style={{ width: 56, padding: 8 }}
      >
        <div
          className="flex flex-col gap-[16px]"
          style={{
            background: "var(--sb-bg)",
            borderRadius: 8,
            padding: 8,
            boxShadow: CONTAINER_SHADOW,
            height: "100%",
          }}
        >
          {/* Expand toggle */}
          <IconBtn iconName="PanelLeftOpen" label="Expand sidebar" onClick={toggle} />

          {/* Nav items — icon only */}
          {items.map(item => (
            <IconBtn
              key={item.id}
              iconName={item.icon}
              label={item.label}
              isActive={item.id === activeId}
              isHovered={hoveredId === item.id}
              onClick={() => onItemClick?.(item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Expanded ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex flex-col shrink-0 h-full ${className}`}
      style={{ width: 250, padding: 8 }}
    >
      <div
        className="flex flex-col gap-[16px]"
        style={{
          background: "var(--sb-bg)",
          borderRadius: 16,
          padding: 8,
          boxShadow: CONTAINER_SHADOW,
          height: "100%",
        }}
      >
        {items.map((item, index) => {
          const isActive  = item.id === activeId
          const isHovered = hoveredId === item.id
          const iconColor = isActive || isHovered
            ? "var(--sb-icon-active)"
            : "var(--sb-icon-default)"

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={item.label}
              className="flex items-center w-full h-[24px] rounded-[8px] transition-all duration-150 focus-visible:outline-none"
              style={{
                // Row bg: only hover state has a fill (active is handled on the icon btn)
                background: !isActive && isHovered ? "var(--sb-row-hover)" : "transparent",
                paddingRight: 4,
                gap: 8,
                justifyContent: "space-between",
              }}
            >
              {/* Left: icon button + label */}
              <div className="flex items-center gap-[8px]">
                {/* Icon button — gets gradient + shadow when active */}
                <div
                  className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] shrink-0 transition-all duration-150"
                  style={{
                    background: isActive
                      ? ACTIVE_GRADIENT
                      : isHovered
                        ? "var(--sb-icon-hover-bg)"
                        : "transparent",
                    boxShadow: isActive
                      ? ACTIVE_SHADOW
                      : isHovered
                        ? HOVER_SHADOW
                        : "none",
                  }}
                >
                  <NavIcon name={item.icon} size={16} color={iconColor} />
                </div>

                <span
                  className="text-[12px] font-semibold leading-none whitespace-nowrap"
                  style={{ color: "var(--sb-text)" }}
                >
                  {item.label}
                </span>
              </div>

              {/* Right side: collapse toggle on first item; chevron on items with sub-nav */}
              {index === 0 ? (
                <button
                  onClick={e => { e.stopPropagation(); toggle() }}
                  aria-label="Collapse sidebar"
                  className="w-[16px] h-[16px] flex items-center justify-center shrink-0 transition-opacity hover:opacity-70 focus-visible:outline-none"
                >
                  <NavIcon
                    name="PanelLeftClose"
                    size={16}
                    color="var(--sb-icon-default)"
                  />
                </button>
              ) : item.hasChildren ? (
                <div className="w-[16px] h-[16px] flex items-center justify-center shrink-0">
                  <NavIcon
                    name="ChevronRight"
                    size={16}
                    color={isActive ? "var(--sb-chevron-active)" : "var(--sb-icon-default)"}
                  />
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
