/**
 * Tooltip — AIMS OS DS · node 4614:5319
 *
 * Tokens: --tooltip-bg → --color-surface-neutral-darker (#111827)
 *         --tooltip-text → --color-text-negative (#ffffff)
 */

import { useState, useId } from "react"
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

export type TooltipSide = "top" | "right" | "bottom" | "left"

export interface TooltipProps {
  /** The element that triggers the tooltip on hover/focus */
  children: ReactNode
  /** Tooltip text content (max ~300px width, 2 lines recommended) */
  content: string
  /** Show directional arrow pointer. Default: false */
  arrow?: boolean
  /** Which side the tooltip appears on. Default: "top" */
  side?: TooltipSide
  className?: string
}

// ── Arrow styles (CSS border trick) ─────────────────────────────────────────

function getArrowStyle(side: TooltipSide): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    border: "4px solid transparent",
    pointerEvents: "none",
  }
  switch (side) {
    case "top":
      return { ...base, top: "100%", left: "50%", transform: "translateX(-50%)", borderTopColor: "var(--tooltip-bg)", borderBottomWidth: 0 }
    case "bottom":
      return { ...base, bottom: "100%", left: "50%", transform: "translateX(-50%)", borderBottomColor: "var(--tooltip-bg)", borderTopWidth: 0 }
    case "left":
      return { ...base, left: "100%", top: "50%", transform: "translateY(-50%)", borderLeftColor: "var(--tooltip-bg)", borderRightWidth: 0 }
    case "right":
      return { ...base, right: "100%", top: "50%", transform: "translateY(-50%)", borderRightColor: "var(--tooltip-bg)", borderLeftWidth: 0 }
  }
}

// ── Positioning class per side ───────────────────────────────────────────────

const POSITION: Record<TooltipSide, string> = {
  top:    "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2",
  bottom: "top-[calc(100%+8px)] left-1/2 -translate-x-1/2",
  left:   "right-[calc(100%+8px)] top-1/2 -translate-y-1/2",
  right:  "left-[calc(100%+8px)] top-1/2 -translate-y-1/2",
}

// ── Component ────────────────────────────────────────────────────────────────

export function Tooltip({ children, content, arrow = false, side = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? id : undefined}
    >
      {children}

      {visible && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-[300px]",
            "rounded-[4px] px-[12px] py-[8px]",
            "text-[14px] leading-[20px] font-medium",
            "bg-[var(--tooltip-bg)] text-[var(--tooltip-text)]",
            POSITION[side],
            className,
          )}
          style={{ animation: "tooltip-in 120ms ease-out both" }}
        >
          {content}
          {arrow && <span style={getArrowStyle(side)} />}
        </span>
      )}
    </span>
  )
}
