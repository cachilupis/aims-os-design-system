/**
 * Tabs — AIMS OS DS  · node 856:11281
 *
 * Horizontal tab bar with active indicator, optional icon, and optional info badge.
 * Sizes: M (default, 14px / px-16 py-10) · S (12px / px-12 py-8)
 *
 * Tokens: --primary · --field-supporting · --foreground · --field-border
 *         --tabs-hover-bg · --tag-informative-bg · --tag-informative-fg
 *
 * Usage:
 *   <Tabs items={tabs} activeId={active} onChange={setActive} />
 *   Wrap in <CardContainer size="sm"> for the standard DS shell.
 */

import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────

export interface TabItem {
  id:        string
  label:     string
  icon?:     LucideIcon
  badge?:    number | string
  disabled?: boolean
}

export interface TabsProps {
  items:      TabItem[]
  activeId:   string
  onChange:   (id: string) => void
  /** M = default (14 px, py-10 px-16) · S = compact (12 px, py-8 px-12) */
  size?:      "m" | "s"
  className?: string
}

// ── Component ────────────────────────────────────────────────────────────────

export function Tabs({ items, activeId, onChange, size = "m", className }: TabsProps) {
  const sm = size === "s"

  return (
    <div
      role="tablist"
      className={cn("flex items-end border-b", className)}
      style={{ borderColor: "var(--field-border)" }}
    >
      {items.map(tab => {
        const isActive   = tab.id === activeId
        const isDisabled = !!tab.disabled
        const Icon       = tab.icon

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              // layout
              "relative flex items-center border-b-2 mb-[-1px] transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1",
              // size
              sm
                ? "gap-[4px] px-[12px] py-[8px] text-[12px]"
                : "gap-[6px] px-[16px] py-[10px] text-[14px]",
              // active indicator
              isActive
                ? "border-[var(--primary)]"
                : "border-transparent",
              // hover (inactive only)
              !isActive && !isDisabled && "hover:bg-[var(--tabs-hover-bg)] cursor-pointer",
              // disabled
              isDisabled && "opacity-40 cursor-not-allowed",
            )}
            style={{
              color:      isActive ? "var(--primary)" : "var(--field-supporting)",
              fontWeight: 500,
            }}
          >
            {/* Leading icon */}
            {Icon && (
              <Icon
                size={sm ? 14 : 16}
                strokeWidth={1.75}
                style={{ color: isActive ? "var(--primary)" : "var(--field-supporting)", flexShrink: 0 }}
              />
            )}

            {/* Label */}
            <span className="whitespace-nowrap">{tab.label}</span>

            {/* Info badge */}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full font-semibold leading-none",
                  sm ? "text-[9px] px-[4px] min-w-[14px] h-[14px]"
                     : "text-[10px] px-[5px] min-w-[16px] h-[16px]",
                )}
                style={{
                  background: "var(--tag-informative-bg)",
                  color:      "var(--tag-informative-fg)",
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
