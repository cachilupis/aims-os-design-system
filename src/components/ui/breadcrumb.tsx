import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  /** Current navigation depth (L1=1, L2=2, L3=3…). depth<2 renders nothing. */
  depth: number
  /** Ordered path from root to current page. items[0]="Home", items[last]=selected (no href). */
  items: BreadcrumbItem[]
  /** Called when a non-selected breadcrumb item is clicked. */
  onNavigate?: (href: string) => void
  className?: string
}

function BreadcrumbSeparator() {
  return (
    <ChevronRight
      size={16}
      strokeWidth={1.75}
      style={{ color: "var(--color-icon-neutral-light)", flexShrink: 0 }}
    />
  )
}

export function Breadcrumb({ depth, items, onNavigate, className }: BreadcrumbProps) {
  if (depth < 2 || items.length === 0) return null

  // At depth > 4, collapse the middle — show Home … [second-to-last] [last]
  let visible: BreadcrumbItem[]
  if (depth > 4 && items.length > 4) {
    const ellipsis: BreadcrumbItem = { label: "…" }
    visible = [items[0], ellipsis, items[items.length - 2], items[items.length - 1]]
  } else {
    visible = items.slice(0, depth)
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-[4px]", className)}
    >
      {visible.map((item, i) => {
        const isLast = i === visible.length - 1
        const isEllipsis = item.label === "…"

        return (
          <div key={i} className="flex items-center gap-[4px]">
            {i > 0 && <BreadcrumbSeparator />}
            {isLast || isEllipsis ? (
              <span
                className="text-[14px] font-medium leading-[20px] select-none"
                style={{ color: isLast ? "var(--color-text-subtitle)" : "var(--color-text-body)" }}
              >
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                className="text-[14px] font-medium leading-[20px] cursor-pointer transition-colors"
                style={{ color: "var(--color-text-body)", background: "none", border: "none", padding: 0 }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--color-text-subtitle)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-body)" }}
                onClick={() => item.href && onNavigate?.(item.href)}
              >
                {item.label}
              </button>
            )}
          </div>
        )
      })}
    </nav>
  )
}
