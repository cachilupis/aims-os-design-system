// DS-GAP: NextBestActionCard — the proactive AI recommendation card that sits
// UNDER the Entity Header, in its own Card Container. Closest DS component:
// CardContainer (which it composes). Extracted out of record-header.tsx per
// section 11 of docs/patterns/entity-header-change-spec.md: "The card that
// appears under the header is a separate component in its own Card Container,
// not a second slot in the same one. Two records, two containers. Nothing
// about it belongs in record-header.tsx."
//
// The Figma Entity Header section states the same rule from the header's side:
// "NO INSIGHT SECTION — System interpretation reaches the header only as a tag
// with a tooltip. No descriptive sentences, no scores with drivers, no
// expandable analysis. Anything larger lives in the Overview, where the NBA
// widget carries recommendations and reasoning."
//
// Why experimental/ and not ui/: the change spec parks this card as "out of
// scope" and never assigns it to a PR, so it has no spec of its own yet — only
// the rendering it already had inside the header. It stays here until Michael
// promotes it. Everything below is the code that was in record-header.tsx,
// moved rather than rewritten, plus the CardContainer it now owns.

import { useState } from "react"
import { ChevronDown, ChevronUp, ChevronRight, Sparkle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"
import { HighlightIcon } from "@/components/ui/highlight-icon"

// ── Next Best Action ────────────────────────────────────────────────────────
// A proactive AI recommendation. N is supported; each renders its own block,
// stacked, with the extras behind a "Show N more" disclosure.
export interface NextBestAction {
  id: string
  title: string
  description: string
  onOpen: () => void
  /** Short category label ("Renewal", "Coverage", ...) — what area this
   *  action is about, at a glance. Neutral Tag, never a signal color: purple
   *  already means "agent" here. Omit when the host has no category. */
  contextTag?: string
}

export interface NextBestActionCardProps {
  /** Omit or pass an empty array for a record with genuinely nothing to
   *  recommend right now — the card disappears entirely rather than
   *  rendering a placeholder. Same "never fake a state" rule the header's
   *  own zones follow. */
  items?: NextBestAction[]
  variant?: "default"
  size?: "default" | "sm"
  className?: string
}

export function NextBestActionCard({
  items = [],
  size = "default",
  className,
}: NextBestActionCardProps) {
  if (items.length === 0) return null
  return (
    <CardContainer size={size === "sm" ? "sm" : undefined} className={cn(className)}>
      <NextBestActionZone items={items} />
    </CardContainer>
  )
}

// ── Zone — primary item always visible, extras behind a disclosure ─────────
// Capped at 3 revealed extras, never all of them at once. Button sits BELOW
// every item, not between the primary and the extras.
function NextBestActionZone({ items }: { items: NextBestAction[] }) {
  const [showMore, setShowMore] = useState(false)
  if (items.length === 0) return null
  const [primary, ...rest] = items
  const visibleRest = rest.slice(0, 3)
  return (
    <div className="flex flex-col gap-[8px]">
      <NextBestActionBlock nba={primary} />
      {showMore && visibleRest.map(nba => <NextBestActionBlock key={nba.id} nba={nba} />)}
      {visibleRest.length > 0 && (
        <Button variant="tertiary" size="sm" onClick={() => setShowMore(v => !v)} className="self-start">
          {showMore ? "Show less" : `Show ${visibleRest.length} more`}
          {showMore
            ? <ChevronUp size={14} strokeWidth={1.75} className="ml-[2px]" />
            : <ChevronDown size={14} strokeWidth={1.75} className="ml-[2px]" />}
        </Button>
      )}
    </div>
  )
}

function NextBestActionBlock({ nba }: { nba: NextBestAction }) {
  return (
    <button
      type="button"
      onClick={nba.onOpen}
      className="w-full flex items-center gap-[8px] rounded-[8px] p-[12px] text-left transition-opacity hover:opacity-90"
      style={{ background: "var(--card-purple-bg)", border: "0.5px solid var(--card-purple-border)" }}
    >
      <HighlightIcon size="sm" variant="purple" icon={<Sparkle size={16} strokeWidth={1.75} />} className="shrink-0" />
      <div className="flex-1 flex flex-col gap-[2px] min-w-0">
        <div className="flex items-center gap-[6px] min-w-0">
          <span className="flex-1 truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
            {nba.title}
          </span>
          {/* One context Tag per NBA — what area this action is about, at a
              glance ("Renewal", "Coverage", ...). Neutral, never a signal
              color — purple already means "agent" on this card. */}
          {nba.contextTag && (
            <Tag variant="neutral" size="sm" className="shrink-0">{nba.contextTag}</Tag>
          )}
        </div>
        <span className="text-[12px] leading-[1.4]" style={{ color: "var(--field-supporting)" }}>
          {nba.description}
        </span>
      </div>
      <ChevronRight size={16} strokeWidth={1.75} className="shrink-0" style={{ color: "var(--field-supporting)" }} />
    </button>
  )
}
