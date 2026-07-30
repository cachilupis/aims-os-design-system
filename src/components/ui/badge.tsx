import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge Status — AIMS OS Design System
 * Component: Figma v6rmYKA2zmyXWOahlxLOeI · node 13072:7066
 *
 * A compact 8×8px filled dot used as an inline status indicator. Contains no
 * text or icon — meaning is conveyed entirely by color. All fills reference
 * the Badge/* semantic tokens (index.css), purpose-built for status dots at
 * near-opaque values in dark mode for legibility — never reuse Surface
 * overlay tokens here, they read as near-invisible at 8px (see DS notes).
 *
 * Usage guidelines (per DS spec):
 *  - Status indicator in tables, list rows, avatar stacks.
 *  - Error/Notification for alerts needing immediate attention.
 *  - In Progress for async/loading row-level indicators.
 *  - Neutral when status is inactive or unknown.
 *  - Extended palette (Light Blue / Lime Green / Yellow / Purple) for
 *    taxonomy or category classification — not for error/success semantics.
 *  - Don't use as the sole indicator in critical contexts — always pair with
 *    a label or tooltip. Don't stack multiple badges on the same element.
 */

const badgeVariants = cva("inline-block shrink-0 rounded-full size-[8px]", {
  variants: {
    variant: {
      error:       "bg-[var(--badge-error)]",
      alert:       "bg-[var(--badge-alert)]",
      inProgress:  "bg-[var(--badge-in-progress)]",
      success:     "bg-[var(--badge-success)]",
      neutral:     "bg-[var(--badge-neutral)]",
      lightBlue:   "bg-[var(--badge-light-blue)]",
      limeGreen:   "bg-[var(--badge-lime-green)]",
      yellow:      "bg-[var(--badge-yellow)]",
      purple:      "bg-[var(--badge-purple)]",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
})

export type BadgeVariant =
  | "error"
  | "alert"
  | "inProgress"
  | "success"
  | "neutral"
  | "lightBlue"
  | "limeGreen"
  | "yellow"
  | "purple"

type BadgeProps = VariantProps<typeof badgeVariants> & {
  className?: string
  /** Accessible label — the dot conveys no meaning on its own to screen readers. */
  label?: string
}

function Badge({ variant = "neutral", className, label }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      role={label ? "status" : undefined}
      aria-label={label}
      className={cn(badgeVariants({ variant }), className)}
    />
  )
}

export { Badge, badgeVariants }
