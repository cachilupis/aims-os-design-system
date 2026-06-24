import { useState, useRef, useEffect, type ReactNode } from "react"
import { ChevronDown, Search, Menu, Settings, LogOut, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Topbar — AIMS OS Design System
 * Source: Figma v6rmYKA2zmyXWOahlxLOeI · COMPONENT_SET 8603:52598 (2 variants)
 * Developer Reference: node 12706:849
 *
 * DS Structure:
 *   Default  1440×36px — VERTICAL outer; inner row HORIZONTAL SPACE_BETWEEN (1424×28px at y=4)
 *   Tablet   1440×34px — same zones, left zone 172px (adds hamburger button)
 *
 * Three horizontal zones:
 *   LEFT  (140×28px)  — workspace avatar (16px) + name (10px Semi Bold) + chevron
 *                        Border/Primary/Subtle · opens workspace switcher dropdown
 *   CENTER (250×24px) — search trigger (opens Global Search overlay on click)
 *   RIGHT (232×28px)  — Sub-A (80×24): isotipo 24×19 + 3×TopbarButton
 *                        Vertical divider (1px, Border/Neutral/Subtle)
 *                        Sub-B (136×28): company selector + profile avatar
 *                        Sub-B frame: same Border/Primary/Subtle border as LEFT
 *
 * Action buttons (Sub-A, left to right — DS COMPONENT_SET 8603:52851):
 *   1. IA-icon     → Sparkles  · Type=Main Action · radial gradient bg (rgba(33,115,255) → rgba(9,226,171))
 *   2. Notifications-icon → Bell    · Type=Tertiary · transparent bg
 *   3. Settings-icon      → Settings · Type=Tertiary · transparent bg
 *
 * All colors via CSS custom properties — see index.css --topbar-* vars.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type WorkspaceItem = {
  id:         string
  name:       string
  avatarSrc?: string
  tag?:       "Active" | "Member" | string
}

export type TopbarAction = {
  icon:      ReactNode
  label:     string
  badge?:    boolean
  variant?:  "default" | "primary"
  onClick?:  () => void
}

export type TopbarVariant = "default" | "tablet"

export type TopbarProps = {
  workspaceName?:       string
  workspaceAvatarSrc?:  string
  workspaces?:          WorkspaceItem[]
  selectedWorkspaceId?: string
  onWorkspaceSelect?:   (id: string) => void
  onWorkspaceClick?:    () => void
  searchPlaceholder?:   string
  onSearchFocus?:       () => void
  actions?:             TopbarAction[]
  companyName?:         string
  companyAvatarSrc?:    string
  onCompanyClick?:      () => void
  userName?:            string
  userEmail?:           string
  userAvatarSrc?:       string
  onProfileClick?:      () => void
  variant?:             TopbarVariant
  onMenuClick?:         () => void
  className?:           string
}

// ── Hook: close on outside click ───────────────────────────────────────────

function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [ref, onClose])
}

// ── Internal: avatar circle ────────────────────────────────────────────────

function TopbarAvatar({
  name = "",
  src,
  size = 16,
}: {
  name?: string
  src?:  string
  size?: number
}) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full overflow-hidden"
      style={{
        width: size, height: size,
        background:  src ? undefined : "var(--primary)",
        color:       "#ffffff",
        fontSize:    size * 0.44, fontWeight: 700, lineHeight: 1,
        boxShadow:   "0 0 0 1px var(--topbar-avatar-ring)",
      }}
    >
      {src
        ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials
      }
    </div>
  )
}

// ── Internal: Left Menu — workspace switcher dropdown ─────────────────────
// DS: Left Menu - Topbar COMPONENT_SET 15251:5363 · 320px wide

function LeftMenu({
  workspaces,
  selectedId,
  onSelect,
}: {
  workspaces:  WorkspaceItem[]
  selectedId?: string
  onSelect?:   (id: string) => void
}) {
  return (
    <div
      className="absolute left-0 top-[calc(100%+4px)] w-[320px] rounded-[10px] overflow-hidden z-50"
      style={{
        background: "var(--topbar-menu-bg)",
        border:     "1px solid var(--topbar-menu-border)",
        boxShadow:  "0 8px 24px rgba(0,0,0,0.28)",
      }}
    >
      {/* Section header */}
      <div className="px-[12px] pt-[12px] pb-[6px]">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "var(--topbar-menu-text-dim)" }}
        >
          Workspaces
        </span>
      </div>

      {/* Workspace list */}
      <div className="px-[6px] pb-[6px]">
        {workspaces.map(ws => {
          const isSelected = ws.id === selectedId
          return (
            <button
              key={ws.id}
              onClick={() => onSelect?.(ws.id)}
              className="w-full flex items-center gap-[8px] px-[8px] py-[6px] rounded-[6px] text-left transition-colors cursor-pointer"
              style={{ background: isSelected ? "var(--topbar-menu-item-sel)" : "transparent" }}
              onMouseEnter={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--topbar-menu-item-hover)"
              }}
              onMouseLeave={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <TopbarAvatar name={ws.name} src={ws.avatarSrc} size={24} />
              <span
                className="flex-1 text-[12px] font-medium truncate"
                style={{ color: "var(--topbar-menu-text)" }}
              >
                {ws.name}
              </span>
              {ws.tag && (
                <span
                  className="text-[10px] font-medium px-[6px] py-[2px] rounded-[4px] shrink-0"
                  style={{
                    background: ws.tag === "Active"
                      ? "var(--topbar-menu-tag-act-bg)"
                      : "var(--topbar-menu-tag-bg)",
                    color: ws.tag === "Active"
                      ? "var(--topbar-menu-tag-act-fg)"
                      : "var(--topbar-menu-tag-fg)",
                  }}
                >
                  {ws.tag}
                </span>
              )}
              {isSelected && (
                <span
                  className="w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ background: "var(--primary)" }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer: create workspace */}
      <div
        className="px-[12px] py-[10px] border-t"
        style={{ borderColor: "var(--topbar-menu-border)" }}
      >
        <button
          className="text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          + Create workspace
        </button>
      </div>
    </div>
  )
}

// ── Internal: Right Menu — profile dropdown ────────────────────────────────

function RightMenu({
  userName,
  userEmail,
  userAvatarSrc,
}: {
  userName?:     string
  userEmail?:    string
  userAvatarSrc?: string
}) {
  const menuItems = [
    { icon: <Settings size={14} strokeWidth={1.75} />,    label: "Settings"       },
    { icon: <HelpCircle size={14} strokeWidth={1.75} />,  label: "Help & Support" },
  ]

  return (
    <div
      className="absolute right-0 top-[calc(100%+4px)] w-[220px] rounded-[10px] overflow-hidden z-50"
      style={{
        background: "var(--topbar-menu-bg)",
        border:     "1px solid var(--topbar-menu-border)",
        boxShadow:  "0 8px 24px rgba(0,0,0,0.28)",
      }}
    >
      {/* User info */}
      <div className="flex items-center gap-[10px] px-[12px] py-[12px]">
        <TopbarAvatar name={userName || ""} src={userAvatarSrc} size={32} />
        <div className="flex-1 min-w-0">
          <div
            className="text-[12px] font-semibold truncate"
            style={{ color: "var(--topbar-menu-text)" }}
          >
            {userName || "User"}
          </div>
          {userEmail && (
            <div
              className="text-[11px] truncate mt-[1px]"
              style={{ color: "var(--topbar-menu-text-dim)" }}
            >
              {userEmail}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-[8px] h-[1px]" style={{ background: "var(--topbar-menu-border)" }} />

      {/* Menu items */}
      <div className="px-[6px] py-[6px]">
        {menuItems.map(item => (
          <button
            key={item.label}
            className="w-full flex items-center gap-[8px] px-[8px] py-[7px] rounded-[6px] text-left transition-colors cursor-pointer"
            style={{ color: "var(--topbar-menu-text)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--topbar-menu-item-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ color: "var(--topbar-menu-text-dim)" }}>{item.icon}</span>
            <span className="text-[12px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-[8px] h-[1px]" style={{ background: "var(--topbar-menu-border)" }} />

      {/* Sign out */}
      <div className="px-[6px] py-[6px]">
        <button
          className="w-full flex items-center gap-[8px] px-[8px] py-[7px] rounded-[6px] text-left transition-colors cursor-pointer"
          style={{ color: "var(--topbar-menu-text)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--topbar-menu-item-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ color: "var(--topbar-menu-text-dim)" }}>
            <LogOut size={14} strokeWidth={1.75} />
          </span>
          <span className="text-[12px] font-medium">Sign out</span>
        </button>
      </div>
    </div>
  )
}

// ── TopbarButton — exported for layout shells ─────────────────────────────
// DS COMPONENT_SET 8603:52851: 24×24 button, two visual variants:
//   "default"  → Type=Tertiary · transparent bg · DS hover/focus tokens
//   "primary"  → Type=Main Action · radial gradient (AIMS blue→teal) · DS exact colors

export function TopbarButton({
  icon,
  label,
  badge   = false,
  variant = "default",
  onClick,
}: {
  icon:      ReactNode
  label:     string
  badge?:    boolean
  variant?:  "default" | "primary"
  onClick?:  (e: React.MouseEvent) => void
}) {
  if (variant === "primary") {
    return (
      <button
        aria-label={label}
        onClick={onClick}
        className="relative w-[24px] h-[24px] flex items-center justify-center shrink-0 cursor-pointer transition-opacity hover:opacity-85 focus-visible:outline-none"
        style={{
          // DS: Type=Main Action · GRADIENT_RADIAL center≈(61%,68%) · stops @29%→@61%
          background:   "radial-gradient(circle at 61% 68%, rgba(33,115,255,1) 29%, rgba(9,226,171,1) 61%)",
          borderRadius: 8,
          // DS: DROP_SHADOW · teal glow · offset(4,8) blur:12 spread:8 · rgba(9,226,171,0.16)
          boxShadow:    "4px 8px 12px 8px rgba(9,226,171,0.16)",
        }}
      >
        <span style={{ color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </span>
        {badge && (
          <span
            className="absolute top-0 right-0 w-[8px] h-[8px] rounded-full"
            style={{ background: "var(--topbar-badge-bg)" }}
          />
        )}
      </button>
    )
  }

  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative w-[24px] h-[24px] flex items-center justify-center rounded-[4px] shrink-0",
        "text-[var(--topbar-icon)]",
        "hover:bg-[var(--topbar-btn-hover-bg)]",
        "focus-visible:bg-[var(--topbar-btn-focus-bg)] outline-none",
        "transition-colors cursor-pointer",
      )}
    >
      {icon}
      {badge && (
        <span
          className="absolute top-0 right-0 w-[8px] h-[8px] rounded-full"
          style={{ background: "var(--topbar-badge-bg)" }}
        />
      )}
    </button>
  )
}

// ── Topbar ────────────────────────────────────────────────────────────────

export function Topbar({
  workspaceName        = "Product Name",
  workspaceAvatarSrc,
  workspaces           = [],
  selectedWorkspaceId,
  onWorkspaceSelect,
  onWorkspaceClick,
  searchPlaceholder    = "Search…",
  onSearchFocus,
  actions              = [],
  companyName          = "Company",
  companyAvatarSrc,
  onCompanyClick,
  userName             = "User",
  userEmail,
  userAvatarSrc,
  onProfileClick,
  variant              = "default",
  onMenuClick,
  className,
}: TopbarProps) {
  const isTablet  = variant === "tablet"
  const height    = isTablet ? 34 : 36
  const leftWidth = isTablet ? 172 : 140

  const [leftMenuOpen,  setLeftMenuOpen]  = useState(false)
  const [rightMenuOpen, setRightMenuOpen] = useState(false)
  const leftRef  = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useClickOutside(leftRef,  () => setLeftMenuOpen(false))
  useClickOutside(rightRef, () => setRightMenuOpen(false))

  // Zone frame styles — shared by left zone and sub-group B
  const zoneBase = "flex items-center rounded-[8px] transition-all duration-150"
  const zoneBorderIdle   = "border border-[var(--topbar-workspace-border)]"
  const zoneBorderActive = "border border-[var(--topbar-zone-hover-bd)] bg-[var(--topbar-zone-hover-bg)]"
  const zoneHover        = "hover:border-[var(--topbar-zone-hover-bd)] hover:bg-[var(--topbar-zone-hover-bg)]"

  return (
    <header className={cn("w-full flex flex-col", className)} style={{ height }}>

      {/* ── Content row: 28px tall, 4px from top ──────────────── */}
      <div className="flex items-center justify-between h-[28px] mt-[4px] px-[8px]">

        {/* LEFT ZONE — workspace selector ──────────────────────── */}
        <div ref={leftRef} className="relative shrink-0">
          <div
            className={cn(
              zoneBase, zoneBorderIdle, zoneHover,
              leftMenuOpen && zoneBorderActive,
              "gap-[8px] cursor-pointer",
            )}
            style={{
              width:         leftWidth, height: 28,
              paddingLeft:   4, paddingRight: 4,
              paddingTop:    2, paddingBottom: 2,
            }}
          >
            {isTablet && (
              <button
                aria-label="Open navigation"
                onClick={onMenuClick}
                className={cn(
                  "w-[24px] h-[24px] flex items-center justify-center rounded-[4px] shrink-0",
                  "text-[var(--topbar-icon)] hover:bg-[var(--topbar-btn-hover-bg)]",
                  "focus-visible:bg-[var(--topbar-btn-focus-bg)] outline-none transition-colors cursor-pointer",
                )}
              >
                <Menu size={14} strokeWidth={1.75} />
              </button>
            )}
            <TopbarAvatar name={workspaceName} src={workspaceAvatarSrc} />
            <button
              className="flex items-center gap-[6px] flex-1 min-w-0 cursor-pointer"
              onClick={() => {
                if (workspaces.length > 0) {
                  setLeftMenuOpen(v => !v)
                  setRightMenuOpen(false)
                } else {
                  onWorkspaceClick?.()
                }
              }}
              aria-label="Switch workspace"
            >
              <span
                className="text-[10px] font-semibold truncate flex-1 text-left"
                style={{ color: "var(--topbar-text)" }}
              >
                {workspaceName}
              </span>
              <ChevronDown
                size={12} strokeWidth={2}
                className={cn("shrink-0 transition-transform duration-150", leftMenuOpen && "rotate-180")}
                style={{ color: "var(--topbar-icon)" }}
              />
            </button>
          </div>

          {leftMenuOpen && workspaces.length > 0 && (
            <LeftMenu
              workspaces={workspaces}
              selectedId={selectedWorkspaceId}
              onSelect={id => {
                onWorkspaceSelect?.(id)
                setLeftMenuOpen(false)
              }}
            />
          )}
        </div>

        {/* CENTER ZONE — search trigger ─────────────────────────── */}
        <div className="w-[250px] h-[24px] shrink-0">
          <div
            role="button"
            aria-label={searchPlaceholder}
            className="w-full h-full flex items-center gap-[6px] px-[8px] cursor-text transition-opacity hover:opacity-80"
            style={{
              background:   "var(--topbar-search-bg)",
              border:       "1px solid var(--topbar-search-border)",
              borderRadius: 6,
            }}
            onClick={onSearchFocus}
          >
            <Search
              size={12} strokeWidth={1.75} className="shrink-0"
              style={{ color: "var(--topbar-text-secondary)" }}
            />
            <span
              className="text-[11px] flex-1 truncate select-none"
              style={{ color: "var(--topbar-text-secondary)" }}
            >
              {searchPlaceholder}
            </span>
          </div>
        </div>

        {/* RIGHT ZONE ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-[8px] shrink-0" style={{ width: 232, height: 28 }}>

          {/* Sub-group A: 3 action buttons (DS: 80×24, gap:4)
               isotipo white GROUP is in the DS file but sits at x:0 behind the
               IA button's gradient bg — not rendered as a separate interactive element */}
          <div className="flex items-center gap-[4px]" style={{ width: 80, height: 24 }}>
            {actions.slice(0, 3).map((a, i) => (
              <TopbarButton
                key={i}
                icon={a.icon}
                label={a.label}
                badge={a.badge}
                variant={a.variant}
                onClick={a.onClick}
              />
            ))}
          </div>

          {/* Vertical divider — Border/Neutral/Subtle */}
          <div
            className="shrink-0"
            style={{ width: 1, height: 28, background: "var(--topbar-divider)" }}
          />

          {/* Sub-group B: company selector + profile avatar (136×28) */}
          <div ref={rightRef} className="relative shrink-0">
            <div
              className={cn(
                zoneBase, zoneBorderIdle, zoneHover,
                rightMenuOpen && zoneBorderActive,
                "gap-[8px] cursor-pointer",
              )}
              style={{
                width:       136, height: 28,
                paddingLeft: 4, paddingRight: 4,
                paddingTop:  2, paddingBottom: 2,
              }}
            >
              <button
                className="flex items-center gap-[4px] flex-1 min-w-0 cursor-pointer"
                onClick={onCompanyClick}
                aria-label="Switch company"
              >
                <TopbarAvatar name={companyName} src={companyAvatarSrc} />
                <span
                  className="text-[10px] truncate flex-1 text-left"
                  style={{ color: "var(--topbar-text-secondary)" }}
                >
                  {companyName}
                </span>
              </button>
              <button
                className="shrink-0 cursor-pointer rounded-full transition-all hover:ring-1 hover:ring-[var(--topbar-avatar-ring)]"
                onClick={() => {
                  setRightMenuOpen(v => !v)
                  setLeftMenuOpen(false)
                  onProfileClick?.()
                }}
                aria-label="Profile menu"
              >
                <TopbarAvatar name={userName} src={userAvatarSrc} />
              </button>
            </div>

            {rightMenuOpen && (
              <RightMenu
                userName={userName}
                userEmail={userEmail}
                userAvatarSrc={userAvatarSrc}
              />
            )}
          </div>

        </div>
      </div>

      {/* ── Bottom divider — Border/Neutral/Subtle ──────────────── */}
      <div className="flex-1 border-b" style={{ borderColor: "var(--topbar-divider)" }} />

    </header>
  )
}
