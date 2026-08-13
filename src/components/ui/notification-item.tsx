import { useState, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { HighlightIcon, type HighlightIconVariant } from "@/components/ui/highlight-icon"
import { AvatarCircle } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tag, type TagVariant } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"

/**
 * Notification Item — AIMS OS Design System
 * Component set: Figma v6rmYKA2zmyXWOahlxLOeI · node 18687:577
 * Taxonomy source: Figma node 18749:7093 ("Notification Architecture & Taxonomy")
 *
 * Single-row notification: leading visual + title/timestamp + description + tags/actions.
 * States (DS exact): Default · Hover · Pressed · Focus · Disabled, each × Read Status (Unread/Read).
 * Read Status does not change any color — it only controls whether the unread dot renders.
 * ("Do not communicate read status only through semantic color" — per taxonomy rules.)
 *
 * Composition — reuses existing DS atoms, no custom re-implementations:
 *   Leading visual → AvatarCircle (when avatarName is set) or HighlightIcon size="sm" (fallback)
 *   Unread dot     → Badge (variant="lightBlue")
 *   Tags           → Tag (size="sm") — semantic per taxonomy §04, verbatim from the "FOR CLAUDE
 *                    CODE" note in node 18749:7093: "Category tags (tag 1) default to Secondary
 *                    (neutral). Severity tags (tag 2) always use their semantic color — Success,
 *                    Alert, or Error — never Secondary." Maximum 2 visible tags per that same
 *                    note; the component technically has a 3rd-tag slot (Figma property "Third
 *                    tag", default false) but a 3rd tag is a discouraged edge case, not the norm.
 *                    Tag variant defaults to "secondary" when omitted — pass variant explicitly
 *                    for a severity tag ("success" | "alert" | "error").
 *   Actions        → Button (size="sm") — DS mock defines BOTH action slots as variant="tertiary"
 *                    only (text-only, no fill) to keep a notification feed visually quiet. Only
 *                    override to "primary" for a true single-CTA moment — never for routine reads.
 *
 * Leading visual priority (per taxonomy §04 "Metadata → UI Mapping" — do not reorder):
 *   1. Identifiable human actor          → avatarName (Avatar)
 *   2. Product area / module             → iconVariant + iconName (module's default icon+color)
 *   3. Explicit Event Type override      → iconVariant + iconName (specific event icon)
 *   4. No actor or product-area context  → iconName="Bell" fallback
 *   Rule: never replace an existing human Avatar with a product-area icon.
 *   Severity overrides the icon color regardless of tier 2-4: Critical/Warning force
 *   iconVariant to "error"/"alert" even if the module's own color would differ.
 *
 * UX rule (per taxonomy click-interaction notes, "FOR CLAUDE CODE"):
 *   The row's onClick and primaryAction's onClick must resolve to the SAME destination.
 *   Never wire them to two different outcomes — that's the #1 cause of a list feeling broken.
 *
 * All colors via CSS custom properties — light/dark auto-handled.
 */

export type NotificationActionVariant = "primary" | "secondary" | "tertiary"

export type NotificationAction = {
  label:    string
  variant?: NotificationActionVariant  // default: "tertiary" — the DS mock defines both action slots this way
  onClick?: () => void
}

export interface NotificationItemProps {
  /** Identifiable human actor's name — renders an Avatar instead of the icon (leading-visual priority 1). Omit for system/product-area events. */
  avatarName?: string
  avatarSrc?:  string
  /** Lead icon container color — reuses HighlightIcon's semantic variants. Default: "informative". Severity Critical/Warning should map to "error"/"alert" per taxonomy. */
  iconVariant?: HighlightIconVariant
  /** Lucide icon name shown inside the lead icon. Default: "Bell" (generic fallback per taxonomy tier 4) */
  iconName?:    string
  title:        string
  timestamp:    string
  /** Figma "Show Timestamp" boolean (default true) — hide when the row doesn't need a relative time. */
  showTimestamp?: boolean
  description?: string
  /** Shows the lightBlue unread dot next to the timestamp. Default: false */
  unread?:      boolean
  /** Max 2 per DS guidance. Tag 1 = category (variant defaults to "secondary"). Tag 2 = severity — pass variant="success"|"alert"|"error" explicitly; never "secondary". */
  tags?:            readonly { label: string; variant?: TagVariant }[]
  primaryAction?:   NotificationAction
  secondaryAction?: NotificationAction
  disabled?:  boolean
  onClick?:   () => void
  /**
   * Controls the row's own hover/press background (the neutral gray fill).
   * Default true — correct for Notification Center's dropdown list, where the
   * row itself is the only interactive surface. Set false when nesting inside
   * a container that already owns the hover treatment (e.g. a List View card)
   * so the two don't visually compete — the container's hover should read as
   * the interaction, not the row's internal background.
   */
  hoverable?: boolean
  className?: string
}

function NotificationItem({
  avatarName,
  avatarSrc,
  iconVariant = "informative",
  iconName    = "Bell",
  title,
  timestamp,
  showTimestamp = true,
  description,
  unread      = false,
  tags,
  primaryAction,
  secondaryAction,
  disabled    = false,
  onClick,
  hoverable   = true,
  className,
}: NotificationItemProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.()
    }
  }

  // Press feedback only — target-checked because mousedown/mouseup always bubble,
  // so clicking a nested primaryAction/secondaryAction Button (e.g. "Retry") would
  // otherwise paint the whole row's pressed background too. Focus feedback is NOT
  // handled here (see className below): it used to be JS state driven by onFocus/
  // onBlur, but React's synthetic focus/blur bubbles from the nested action button
  // up to this row, and stopPropagation() on the button's onClick does nothing to
  // stop that — so the row still lit up blue whenever a CTA was clicked. Native
  // `:focus-visible` doesn't have this problem: it only ever matches the element
  // that is *actually* focused, never an ancestor of it.
  const bg = disabled || !hoverable
    ? "transparent"
    : pressed
      ? "var(--color-surface-neutral-subtle)"
      : hovered
        ? "var(--menu-item-hover)"
        : undefined

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={e => { if (e.target === e.currentTarget) setPressed(true) }}
      onMouseUp={e => { if (e.target === e.currentTarget) setPressed(false) }}
      className={cn(
        "flex items-start gap-[12px] p-[12px] transition-colors duration-150 border border-transparent outline-none",
        onClick && !disabled && "cursor-pointer",
        disabled && "opacity-40 pointer-events-none",
        onClick && !disabled && "focus-visible:border-[var(--field-border-focus)]",
        onClick && !disabled && hoverable && "focus-visible:bg-[var(--color-surface-neutral-subtle)]",
        className,
      )}
      style={{ background: bg }}
    >
      {avatarName
        ? <AvatarCircle name={avatarName} src={avatarSrc} avatarStyle={avatarSrc ? "photo" : "text"} sizeKey="md" />
        : <HighlightIcon size="sm" variant={iconVariant} iconColor="default" iconName={iconName} />
      }

      <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
        <div className="flex items-center justify-between gap-[8px]">
          <span
            className="text-sm font-semibold leading-none truncate"
            style={{ color: "var(--color-text-title)" }}
          >
            {title}
          </span>
          <div className="flex items-center gap-[8px] shrink-0">
            {unread && <Badge variant="lightBlue" />}
            {showTimestamp && (
              <span
                className="text-xs font-medium leading-[20px] whitespace-nowrap"
                style={{ color: "var(--color-text-caption)" }}
              >
                {timestamp}
              </span>
            )}
          </div>
        </div>

        {description && (
          <p
            className="text-xs font-medium leading-[20px]"
            style={{ color: "var(--color-text-body)" }}
          >
            {description}
          </p>
        )}

        {(tags?.length || primaryAction || secondaryAction) && (
          <div className="flex items-center justify-between gap-[4px] pt-0">
            <div className="flex items-center gap-[8px] min-w-0 flex-1 overflow-hidden">
              {tags?.map((tag, i) => (
                <Tag key={i} variant={tag.variant ?? "secondary"} size="sm">{tag.label}</Tag>
              ))}
            </div>
            {(primaryAction || secondaryAction) && (
              <div className="flex items-center gap-[4px] shrink-0">
                {secondaryAction && (
                  <Button
                    variant={secondaryAction.variant ?? "tertiary"}
                    size="sm"
                    onClick={e => { e.stopPropagation(); secondaryAction.onClick?.() }}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button
                    variant={primaryAction.variant ?? "tertiary"}
                    size="sm"
                    onClick={e => { e.stopPropagation(); primaryAction.onClick?.() }}
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export { NotificationItem }
