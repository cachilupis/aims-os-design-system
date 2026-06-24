import { useState } from "react"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

// ── DS tokens (Sidebar is always dark regardless of app theme)
const SIDEBAR_BG         = "#000000"
const SIDEBAR_RADIUS_SM  = 8
const SIDEBAR_RADIUS_LG  = 16
const ICON_DEFAULT       = "rgba(128,175,255,1)"   // #80AFFF — DS sidebar icon default
const ICON_ACTIVE        = "#ffffff"
const HOVER_BG           = "rgba(42,42,42,1)"
const ACTIVE_GRADIENT    = "radial-gradient(circle at 61% 68%, rgba(33,115,255,1) 29%, rgba(9,226,171,1) 61%)"
const ACTIVE_SHADOW      = "4px 8px 12px 8px rgba(9,226,171,0.16)"

export type SidebarItem = {
  id: string
  label: string
  icon: string          // Lucide icon name
  hasChildren?: boolean // shows chevron in expanded mode
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

export function Sidebar({
  items = DEFAULT_SIDEBAR_ITEMS,
  activeId,
  onItemClick,
  defaultCollapsed = false,
  onCollapseChange,
  className = "",
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapseChange?.(next)
  }

  // ── Collapsed sidebar ────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div
        className={`flex flex-col shrink-0 h-full ${className}`}
        style={{ width: 56, padding: 8, background: "transparent" }}
      >
        <div
          className="flex flex-col gap-[16px] h-full"
          style={{ background: SIDEBAR_BG, borderRadius: SIDEBAR_RADIUS_SM, padding: 8 }}
        >
          {/* Expand button */}
          <IconButton
            iconName="PanelLeftOpen"
            label="Expand sidebar"
            onClick={toggle}
          />

          {/* Nav icons */}
          {items.map(item => {
            const isActive  = item.id === activeId
            const isHovered = hoveredId === item.id
            return (
              <IconButton
                key={item.id}
                iconName={item.icon}
                label={item.label}
                isActive={isActive}
                onClick={() => onItemClick?.(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                forceIconColor={isActive || isHovered ? ICON_ACTIVE : ICON_DEFAULT}
                style={{
                  background: isActive ? ACTIVE_GRADIENT : "transparent",
                  boxShadow: isActive ? ACTIVE_SHADOW : "none",
                }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // ── Expanded sidebar ─────────────────────────────────────────────────────
  return (
    <div
      className={`flex flex-col shrink-0 h-full ${className}`}
      style={{ width: 250, padding: 8, background: "transparent" }}
    >
      <div
        className="flex flex-col gap-[16px] h-full"
        style={{ background: SIDEBAR_BG, borderRadius: SIDEBAR_RADIUS_LG, padding: 8 }}
      >
        {items.map((item, index) => {
          const isActive  = item.id === activeId
          const isHovered = hoveredId === item.id
          const iconColor = isActive || isHovered ? ICON_ACTIVE : ICON_DEFAULT
          const isFirstItem = index === 0

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={item.label}
              className="flex items-center w-full h-[24px] rounded-[8px] transition-all duration-150 focus-visible:outline-none"
              style={{
                background: isActive ? ACTIVE_GRADIENT : isHovered ? HOVER_BG : "transparent",
                boxShadow: isActive ? ACTIVE_SHADOW : "none",
                paddingRight: 4,
                paddingLeft: 0,
                gap: 8,
                justifyContent: "space-between",
              }}
            >
              {/* Left: icon + label */}
              <div className="flex items-center gap-[8px]">
                <div
                  className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] shrink-0"
                  style={{ padding: 4 }}
                >
                  <NavIcon name={item.icon} size={16} color={iconColor} />
                </div>
                <span
                  className="text-[12px] font-semibold leading-none whitespace-nowrap"
                  style={{ color: "#ffffff" }}
                >
                  {item.label}
                </span>
              </div>

              {/* Right: collapse toggle on first item, chevron on items with children */}
              {isFirstItem ? (
                <button
                  onClick={e => { e.stopPropagation(); toggle() }}
                  className="w-[16px] h-[16px] flex items-center justify-center shrink-0 transition-opacity hover:opacity-70"
                  style={{ color: ICON_DEFAULT }}
                  aria-label="Collapse sidebar"
                >
                  <NavIcon name="PanelLeftClose" size={16} color={ICON_DEFAULT} />
                </button>
              ) : item.hasChildren ? (
                <div className="w-[16px] h-[16px] flex items-center justify-center shrink-0"
                  style={{ color: isActive || isHovered ? "rgba(233,241,255,1)" : ICON_DEFAULT }}>
                  <NavIcon name="ChevronRight" size={16} color={isActive || isHovered ? "rgba(233,241,255,1)" : ICON_DEFAULT} />
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Internal icon-only button (collapsed mode + expand button)
type IconButtonProps = {
  iconName: string
  label: string
  isActive?: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  forceIconColor?: string
  style?: React.CSSProperties
}

function IconButton({
  iconName,
  label,
  onClick,
  onMouseEnter,
  onMouseLeave,
  forceIconColor,
  style = {},
}: IconButtonProps) {
  const [hovered, setHovered] = useState(false)
  const iconColor = forceIconColor ?? (hovered ? ICON_ACTIVE : ICON_DEFAULT)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); onMouseEnter?.() }}
      onMouseLeave={() => { setHovered(false); onMouseLeave?.() }}
      aria-label={label}
      title={label}
      className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] shrink-0 transition-all duration-150 focus-visible:outline-none"
      style={{
        background: hovered && !style.background ? HOVER_BG : "transparent",
        ...style,
      }}
    >
      <NavIcon name={iconName} size={16} color={iconColor} />
    </button>
  )
}
