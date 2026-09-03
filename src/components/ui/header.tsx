import { ArrowLeft } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HighlightIcon, type HighlightIconVariant } from "@/components/ui/highlight-icon"

export type HeaderSize = "size-l" | "size-m" | "compress"
export type { HighlightIconVariant }

/**
 * Rank of a Header action. The DS maps it to a Button variant — screens never
 * name the variant themselves.
 *
 *   primary   → variant="main"       the one action the screen is for
 *   secondary → variant="secondary"  a supporting action
 *   tertiary  → variant="tertiary"   low-emphasis, e.g. a debug toggle
 */
export type HeaderActionPriority = "primary" | "secondary" | "tertiary"

export interface HeaderAction {
  label: string
  /** Lucide icon rendered before the label. */
  icon?: LucideIcon
  onClick?: () => void
  disabled?: boolean
  /** Defaults to "primary" on primaryAction and "secondary" on secondaryAction. */
  priority?: HeaderActionPriority
}

export interface HeaderProps {
  /** Page title — always required, always visible */
  title: string
  /** Subtitle below the title. Hidden in compress. */
  description?: string
  /** Size variant. "size-l" = 24px title + full padding. "size-m" = 18px. "compress" = 18px, description/tag/icon hidden; back button hidden unless showBackInCompress is true. */
  size?: HeaderSize
  /** Tag node rendered inline after the title. Hidden in compress. */
  tag?: React.ReactNode
  /**
   * Breadcrumb trail, rendered above the title. From L2 onwards this is how a
   * page states where it sits — `Workers › Meridian`, parent plus current page,
   * not the whole path. It survives compress on purpose: losing the way back
   * the moment someone scrolls is the failure this replaces.
   *
   * A page with a breadcrumb does not also take a `backButton`: at L2 the first
   * crumb IS the way back, so an arrow beside it is two affordances pointing at
   * the same place.
   */
  breadcrumb?: React.ReactNode
  /** Shows an ArrowLeft back-navigation button. This is the ONLY thing that controls visibility. Hidden in compress unless showBackInCompress is also true. Do not combine with `breadcrumb`. */
  backButton?: boolean
  /** Click handler for the back button. Never affects visibility — use backButton for that. */
  onBack?: () => void
  /** Keep the back button visible in compress mode (requires backButton={true}). */
  showBackInCompress?: boolean
  /** Optional Lucide icon shown in a HighlightIcon (size sm). Hidden in compress. */
  icon?: LucideIcon
  /** HighlightIcon color variant for the icon slot. Defaults to "informative". */
  iconVariant?: HighlightIconVariant
  /**
   * The screen's one prioritised action. Declare WHAT the action is; the DS
   * decides how it looks.
   *
   * This used to take a ReactNode, which meant every screen wrote
   * `<Button variant="main">` itself — and nothing stopped it writing that
   * variant anywhere else. "One main per screen, only in the Header" lived in
   * CLAUDE.md and was broken 6 times in one PR and 7 in another. Screens no
   * longer choose the variant, so the rule cannot be broken.
   *
   * `priority` is about rank, not appearance: "primary" is the one action this
   * screen is for, and the DS renders it as main. Measured before this change,
   * 60% of Headers were NOT passing main — plenty of screens have a lower-rank
   * action or none at all — so the prop has to express that rather than force
   * the top variant on everyone.
   */
  primaryAction?: HeaderAction
  /** A second, lower-rank action beside the primary one. Defaults to "secondary" priority. */
  secondaryAction?: HeaderAction
  /**
   * Sticky filters row — shown only in compress mode, directly below the title row.
   * No border between the title row and this row. Renders after the gradient fade.
   * Use to keep Filters always visible when the header is compressed on scroll.
   */
  filters?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const TITLE_PX: Record<HeaderSize, number> = {
  "size-l": 24,
  "size-m": 18,
  "compress": 18,
}

const PADDING: Record<HeaderSize, string> = {
  "size-l": "12px 24px",
  "size-m": "10px 24px",
  "compress": "8px 24px",
}

/** priority → Button variant. The one place this mapping lives. */
const VARIANT_BY_PRIORITY: Record<HeaderActionPriority, "main" | "secondary" | "tertiary"> = {
  primary:   "main",
  secondary: "secondary",
  tertiary:  "tertiary",
}

function renderAction(action: HeaderAction, fallback: HeaderActionPriority) {
  const { label, icon: Icon, onClick, disabled, priority = fallback } = action
  return (
    <Button
      variant={VARIANT_BY_PRIORITY[priority]}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={Icon ? <Icon size={13} strokeWidth={1.75} /> : undefined}
      iconPosition={Icon ? "left" : undefined}
    >
      {label}
    </Button>
  )
}

export function Header({
  title,
  description,
  size = "size-l",
  tag,
  breadcrumb,
  backButton = false,
  onBack,
  showBackInCompress = false,
  icon: Icon,
  iconVariant = "informative",
  primaryAction,
  secondaryAction,
  filters,
  className,
  style,
}: HeaderProps) {
  const isCompress = size === "compress"
  const hasFilters = isCompress && !!filters

  return (
    <div className={cn("flex flex-col w-full", className)} style={style}>
      {/* Title row */}
      <div
        className="flex items-center justify-between gap-[16px]"
        style={{ padding: hasFilters ? "8px 24px 8px" : PADDING[size] }}
      >
        {/* Left zone: back button + icon + title + tag + description */}
        <div className="flex items-start gap-[8px] min-w-0 flex-1">
          {backButton && (!isCompress || showBackInCompress) && (
            <Button
              variant="tertiary"
              size="sm"
              iconPosition="alone"
              aria-label="Back"
              className="mt-[3px]"
              onClick={onBack}
              icon={<ArrowLeft size={16} strokeWidth={1.75} style={{ color: "var(--header-back-icon)" }} />}
            />
          )}
          {!isCompress && Icon && (
            <HighlightIcon
              size="sm"
              variant={iconVariant}
              iconColor="dark"
              icon={<Icon size={14} strokeWidth={1.75} />}
              className="shrink-0 mt-[1px]"
            />
          )}
          <div className="flex flex-col gap-[4px] min-w-0">
            {/* Breadcrumb row — above the title, visible in every size including
                compress. 4px of separation is what keeps the two rows reading as
                path + page rather than as one wrapped title. */}
            {breadcrumb && <div className="min-w-0">{breadcrumb}</div>}
            <div className="flex items-center gap-[8px]">
              <h1
                className="font-semibold leading-tight m-0"
                style={{ fontSize: TITLE_PX[size], color: "var(--header-title)" }}
              >
                {title}
              </h1>
              {tag}
            </div>
            {!isCompress && description && (
              <p className="text-sm leading-[20px] m-0" style={{ color: "var(--header-desc)" }}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right zone: secondary + primary CTAs. The Header builds the buttons,
            so no screen has to name a variant — see HeaderAction. */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-[8px] shrink-0">
            {secondaryAction && renderAction(secondaryAction, "secondary")}
            {primaryAction && renderAction(primaryAction, "primary")}
          </div>
        )}
      </div>

      {/* Sticky filters row — only in compress when filters prop is provided. No border. */}
      {hasFilters && (
        <div style={{ padding: "0 24px 10px" }}>
          {filters}
        </div>
      )}
    </div>
  )
}
