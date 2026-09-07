// DS-GAP: NextBestActionCard — the proactive AI recommendation card that sits
// UNDER the Entity Header. Closest DS component: CardContainer (which it
// composes). Its own container per section 11 of
// docs/patterns/entity-header-change-spec.md: "The card that appears under the
// header is a separate component in its own Card Container, not a second slot
// in the same one. Two records, two containers. Nothing about it belongs in
// record-header.tsx."
//
// Built from the Figma component set "Next Best Action Card Content"
// (v6rmYKA2zmyXWOahlxLOeI, node 20206:316306) — structure, spacing, type
// sizes/weights and every token read from the file, Light and Dark
// independently. Two variants on one axis: Actions = "View details" |
// "Accept / View details".
//
// This is NOT the block that used to live inside the header. That one was a
// filled purple surface with a HighlightIcon box, a context Tag and a trailing
// chevron. Figma has none of those: the card is a plain surface, the only
// colour is the purple label and the bullet, and the actions are real buttons.
//
// Tokens (Figma → repo, all pre-existing, none invented):
//   Text/Purple              → --color-text-purple      #2c075c / #d8b4fe
//   Text/Subtitle            → --color-text-subtitle    #2a2a2a / rgba(255,255,255,0.6)
//   Text/Body                → --color-text-body        #5c5c5c / rgba(255,255,255,0.6)
//   Surface/Primary/Default  → the DS Button primary variant, not hand-styled
//
// Why experimental/ and not ui/: the change spec parks section 11 as "out of
// scope" and never assigns it to a PR, so this card has no written spec of its
// own — only the Figma node above. It stays a candidate until Michael promotes
// it.

import { X, Sparkle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardContainer } from "@/components/ui/card-container"
import { Button } from "@/components/ui/button"

// ── One recommendation ──────────────────────────────────────────────────────
export interface NextBestAction {
  id: string
  /** What the agent recommends doing. One line, 14px Semi Bold. */
  title: string
  /** When the recommendation was produced — "2h ago". Renders after the title,
   *  behind a purple bullet. Omit when the host has no timestamp. */
  timeAgo?: string
  /** WHY — the reasoning behind the recommendation. A full sentence that
   *  wraps; this is the one place in the pattern where prose is correct, which
   *  is exactly why the Entity Header itself forbids it ("NO INSIGHT
   *  SECTION"). */
  description: string
  /** "View details" — always rendered. */
  onViewDetails: () => void
  /** "Accept" — the primary action. Omit for the View-details-only variant. */
  onAccept?: () => void
  /** The dismiss control in the top-right corner. Omit to hide it. */
  onDismiss?: () => void
}

export interface NextBestActionCardProps {
  /**
   * ONE recommendation, or none.
   *
   * This is deliberately singular. It used to be `items: NextBestAction[]`
   * and the card stacked every one of them, which put two Next Best Actions
   * in a single container — the record's most important recommendation
   * competing with its second most important, in the same purple box. There
   * is one next best action by definition; if there were two, neither is
   * next.
   *
   * A host with several candidates picks the most prioritized one and passes
   * that. Making the prop singular means no caller can get this wrong, which
   * is the whole reason it is not an array.
   *
   * Omit it, or pass `undefined`, for a record with genuinely nothing to
   * recommend — the card disappears entirely rather than rendering a
   * placeholder.
   */
  item?: NextBestAction
  /**
   * `purple` (the default) is the DS CardContainer purple variant. Purple
   * means "an agent produced this" across the whole system, and this card is
   * the agent's recommendation — so the surface carries it. The colour comes
   * from CardContainer's own variant, never from a background painted in
   * here: painting it by hand was exactly the mistake in the version of this
   * block that used to live inside the header.
   *
   * `default` exists for a host that already sits this card on a purple
   * surface and would otherwise stack two purples.
   */
  variant?: "purple" | "default"
  size?: "default" | "sm"
  className?: string
}

export function NextBestActionCard({
  item,
  variant = "purple",
  size = "default",
  className,
}: NextBestActionCardProps) {
  if (!item) return null
  return (
    <CardContainer variant={variant} size={size === "sm" ? "sm" : undefined} className={cn(className)}>
      <Suggestion nba={item} />
    </CardContainer>
  )
}

// ── Suggestion — label + dismiss, then title · timeAgo, then why, then actions
function Suggestion({ nba }: { nba: NextBestAction }) {
  return (
    <div className="flex flex-col gap-[8px]">
      {/* Label row — the purple "Next Best Action" marker with the platform's
          own Sparkle glyph (the single 4-point one, same as the Topbar and the
          header's agent trigger), and the dismiss control pushed to the far
          right. */}
      <div className="flex items-start justify-between gap-[8px]">
        <div className="flex items-center gap-[4px] min-w-0">
          <Sparkle size={14} strokeWidth={1.75} className="shrink-0" style={{ color: "var(--color-text-purple)" }} />
          <span className="text-[14px] font-semibold leading-[1.3]" style={{ color: "var(--color-text-purple)" }}>
            Next Best Action
          </span>
        </div>
        {nba.onDismiss && (
          <Button
            variant="tertiary"
            size="sm"
            iconPosition="alone"
            icon={<X size={14} strokeWidth={1.75} />}
            aria-label="Dismiss this recommendation"
            onClick={nba.onDismiss}
            className="shrink-0"
          />
        )}
      </div>

      {/* Title · timeAgo, then the reasoning. 4px between both pairs. */}
      <div className="flex flex-col gap-[4px]">
        <div className="flex items-baseline gap-[4px] flex-wrap">
          <span className="text-[14px] font-semibold leading-[1.3]" style={{ color: "var(--color-text-subtitle)" }}>
            {nba.title}
          </span>
          {nba.timeAgo && (
            <>
              <span aria-hidden="true" className="text-[14px] font-medium leading-[1.3]" style={{ color: "var(--color-text-purple)" }}>
                ·
              </span>
              <span className="text-[12px] font-medium leading-[1.3]" style={{ color: "var(--color-text-body)" }}>
                {nba.timeAgo}
              </span>
            </>
          )}
        </div>
        {/* Wraps on purpose — this is the reasoning, not a subtitle. */}
        <p className="text-[14px] font-medium leading-[1.5]" style={{ color: "var(--color-text-body)" }}>
          {nba.description}
        </p>
      </div>

      {/* Actions — DS Buttons, never hand-styled: Accept carries
          Surface/Primary/Default through the primary variant. */}
      <div className="flex items-center gap-[4px]">
        {nba.onAccept && (
          <Button variant="primary" size="sm" onClick={nba.onAccept}>Accept</Button>
        )}
        <Button variant="tertiary" size="sm" onClick={nba.onViewDetails}>View details</Button>
      </div>
    </div>
  )
}
