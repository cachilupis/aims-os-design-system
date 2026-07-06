/**
 * Tabs — AIMS OS DS  · node 856:11281
 *
 * Horizontal tab bar with active indicator and optional leading icon.
 * Sizes: M (default, 14px / px-16 py-10) · S (12px / px-12 py-8)
 *
 * Tokens: --primary · --field-supporting · --foreground · --field-border · --tabs-hover-bg
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
              "relative flex items-center border-b-2 mb-[-1px] transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1",
              sm
                ? "gap-[4px] px-[12px] py-[8px] text-[12px]"
                : "gap-[6px] px-[16px] py-[10px] text-[14px]",
              isActive  ? "border-[var(--primary)]"    : "border-transparent",
              !isActive && !isDisabled && "hover:bg-[var(--tabs-hover-bg)] cursor-pointer",
              isDisabled && "opacity-40 cursor-not-allowed",
            )}
            style={{
              color:      isActive ? "var(--primary)" : "var(--field-supporting)",
              fontWeight: 500,
            }}
          >
            {Icon && (
              <Icon
                size={sm ? 14 : 16}
                strokeWidth={1.75}
                style={{ color: isActive ? "var(--primary)" : "var(--field-supporting)", flexShrink: 0 }}
              />
            )}
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
