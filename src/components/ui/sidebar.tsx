import { useState, useRef, useEffect } from "react"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

// ── DS tokens — sourced from Figma variable bindings (Sidebar page)
// Active gradient: GRADIENT_RADIAL stops @0.29 → @0.61
const ACTIVE_GRADIENT = "radial-gradient(circle at 61% 68%, rgba(33,115,255,1) 29%, rgba(9,226,171,1) 61%)"
// Active shadow: DROP_SHADOW rgba(82,163,255,0.38) offset(8,8) blur:20
const ACTIVE_SHADOW   = "8px 8px 20px 0px rgba(82,163,255,0.38)"
// Hover shadow: DROP_SHADOW rgba(33,115,255,0.50) offset(0,0) blur:20
const HOVER_SHADOW    = "0px 0px 20px 0px rgba(33,115,255,0.50)"
// Container shadow: DROP_SHADOW rgba(0,0,0,0.08) offset(8,8) blur:16
const CONTAINER_SHADOW = "8px 8px 16px 0px rgba(0,0,0,0.08)"

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
  className?: string
}

function NavIcon({ name, size = 16, color }: { name: string; size?: number; color: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={1.75} color={color} />
}

// ── Tooltip — shown to the right of icon buttons in collapsed mode
function SidebarTooltip({ label, visible }: { label: string; visible: boolean }) {
  if (!visible) return null
  return (
    <div
      role="tooltip"
      className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none"
      style={{
        background: "rgba(22,22,22,1)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 6,
        padding: "4px 10px",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.90)" }}>
        {label}
      </span>
    </div>
  )
}

// ── Icon button — the 24×24 button used for collapsed nav items and toggle
// Exact spec: padding 4px → 16×16 icon centered · cornerRadius 8
// States: Default (no bg) · Hover (sb-bg + blue glow) · Active (gradient + teal glow)
function IconBtn({
  iconName,
  label,
  isActive = false,
  showTooltip = false,
  onClick,
}: {
  iconName: string
  label: string
  isActive?: boolean
  showTooltip?: boolean
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const iconColor = isActive || hovered ? "var(--sb-icon-active)" : "var(--sb-icon-default)"

  let bg     = "transparent"
  let shadow = "none"
  if (isActive) { bg = ACTIVE_GRADIENT; shadow = ACTIVE_SHADOW }
  else if (hovered) { bg = "var(--sb-icon-hover-bg)"; shadow = HOVER_SHADOW }

  return (
    <div className="relative" style={{ width: 24, height: 24 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={label}
        title={undefined}           // we use our own tooltip
        className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] transition-all duration-150 focus-visible:outline-none"
        style={{ background: bg, boxShadow: shadow, padding: 4 }}
      >
        <NavIcon name={iconName} size={16} color={iconColor} />
      </button>
      {showTooltip && <SidebarTooltip label={label} visible={hovered} />}
    </div>
  )
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

  // keep internal state in sync if prop changes (controlled use)
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

  // ── Collapsed ─────────────────────────────────────────────────────────────
  // Width 56px · inner container 40×full · radius 8 · padding 8
  if (collapsed) {
    return (
      <div
        className={`flex flex-col shrink-0 h-full ${className}`}
        style={{ width: 56, padding: 8 }}
      >
        <div
          className="flex flex-col items-center gap-[16px]"
          style={{
            background: "var(--sb-bg)",
            borderRadius: 8,
            padding: 8,
            boxShadow: CONTAINER_SHADOW,
            height: "100%",
          }}
        >
          {/* Expand / panel toggle */}
          <IconBtn
            iconName="PanelLeftOpen"
            label="Expand sidebar"
            showTooltip
            onClick={toggle}
          />

          {/* Nav items — icon only, with tooltip */}
          {items.map(item => (
            <IconBtn
              key={item.id}
              iconName={item.icon}
              label={item.label}
              isActive={item.id === activeId}
              showTooltip
              onClick={() => onItemClick?.(item.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Expanded ──────────────────────────────────────────────────────────────
  // Width 250px · inner container 234×full · radius 16 · padding 8
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
        {items.map((item, index) => (
          <ExpandedNavItem
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            isFirst={index === 0}
            onItemClick={onItemClick}
            onToggleCollapse={toggle}
          />
        ))}
      </div>
    </div>
  )
}

// ── Expanded nav item row
// Height 24px · gap 8 · padding-right 4
// Icon button (24×24, p:4, r:8) + label (12px SemiBold white) + optional right element
function ExpandedNavItem({
  item,
  isActive,
  isFirst,
  onItemClick,
  onToggleCollapse,
}: {
  item: SidebarItem
  isActive: boolean
  isFirst: boolean
  onItemClick?: (id: string) => void
  onToggleCollapse: () => void
}) {
  const [rowHovered, setRowHovered] = useState(false)

  // Icon button states
  const iconBg     = isActive ? ACTIVE_GRADIENT : rowHovered ? "var(--sb-icon-hover-bg)" : "transparent"
  const iconShadow = isActive ? ACTIVE_SHADOW    : rowHovered ? HOVER_SHADOW              : "none"
  const iconColor  = isActive || rowHovered ? "var(--sb-icon-active)" : "var(--sb-icon-default)"

  // Row bg: only hover state has a fill (not active — active is icon-only gradient)
  const rowBg = !isActive && rowHovered ? "var(--sb-row-hover)" : "transparent"

  return (
    <button
      onClick={() => onItemClick?.(item.id)}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
      aria-label={item.label}
      className="flex items-center w-full h-[24px] rounded-[8px] transition-all duration-150 focus-visible:outline-none"
      style={{
        background: rowBg,
        paddingRight: 4,
        paddingLeft: 0,
        gap: 8,
        justifyContent: "space-between",
      }}
    >
      {/* Left: icon button + label */}
      <div className="flex items-center gap-[8px]">
        {/* Icon button — 24×24, padding 4, radius 8 */}
        <div
          className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] shrink-0 transition-all duration-150"
          style={{ background: iconBg, boxShadow: iconShadow, padding: 4 }}
        >
          <NavIcon name={item.icon} size={16} color={iconColor} />
        </div>

        {/* Label — 12px Semi Bold, always white (sidebar is always dark) */}
        <span
          className="text-[12px] font-semibold leading-none whitespace-nowrap"
          style={{ color: "var(--sb-text)" }}
        >
          {item.label}
        </span>
      </div>

      {/* Right element */}
      {isFirst ? (
        // First item carries the collapse toggle (□) — stop propagation so row click doesn't fire
        <button
          onClick={e => { e.stopPropagation(); onToggleCollapse() }}
          aria-label="Collapse sidebar"
          onMouseEnter={e => e.stopPropagation()}
          className="w-[16px] h-[16px] flex items-center justify-center shrink-0 transition-opacity hover:opacity-70 focus-visible:outline-none"
        >
          <NavIcon name="PanelLeftClose" size={16} color="var(--sb-icon-default)" />
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
}
