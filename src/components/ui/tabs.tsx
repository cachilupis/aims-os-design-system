/**
 * Tabs — AIMS OS DS  · node 856:11281
 *
 * Horizontal tab bar with active indicator and optional leading icon.
 * Sizes: M (default, 14px / px-16 py-10) · S (12px / px-12 py-8)
 *
 * States:
 *   Active   → 2px indicator span (absolute, not clipped by rounded-[8px]) · --primary color
 *   Default  → no bg · --field-supporting color
 *   Hover    → --tabs-hover-bg (Surface/Neutral/Subtle) · rounded-[8px] · --foreground text
 *   Disabled → opacity-40 · no interaction
 *
 * Tokens: --primary · --field-supporting · --foreground · --field-border · --tabs-hover-bg
 */

import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────

export interface TabItem {
  id:        string
  label:     string
  icon?:     LucideIcon
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
              "relative flex items-center font-medium rounded-[8px]",
              "transition-colors duration-200 ease-in-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1",
              sm
                ? "gap-[4px] px-[12px] py-[8px] text-[12px]"
                : "gap-[6px] px-[16px] py-[10px] text-[14px]",
              isActive
                ? "text-[var(--primary)]"
                : "text-[var(--field-supporting)]",
              !isActive && !isDisabled && "hover:bg-[var(--tabs-hover-bg)] hover:text-[var(--foreground)] cursor-pointer",
              isDisabled && "opacity-40 cursor-not-allowed",
            )}
          >
            {/*
              Always rendered — opacity + translateY animate in/out so the indicator
              "rises" into place rather than snapping. Not clipped by rounded-[8px]
              because absolute children ignore parent border-radius without overflow:hidden.
            */}
            <span
              className={cn(
                "absolute left-0 right-0 bottom-[-1px] h-[2px]",
                "transition-[opacity,transform] duration-200 ease-out",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[2px]",
              )}
              style={{ background: "var(--primary)" }}
            />
            {Icon && (
              <Icon
                size={sm ? 14 : 16}
                strokeWidth={1.75}
                aria-hidden
              />
            )}
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
