import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * StepperNavFooter — AIMS OS Design System
 * Source: Figma v6rmYKA2zmyXWOahlxLOeI · node 8210:21937
 *
 * Sticky bottom bar for multi-step flows (wizards, onboarding, guided forms).
 * Provides consistent navigation controls: Cancel/Back on the left, an optional
 * secondary CTA and the primary Next/Finish button on the right.
 *
 * Anatomy:
 *   [Cancel | Back ←]  ──────────────────  [Secondary?] [Next →]
 *
 * Tokens:
 *   --step-nav-footer-bg         Surface/Neutral/White — always #FFFFFF
 *   --step-nav-footer-separator  Border/Neutral/Lighter on white — #E0E0E8
 *
 * DS measurements (Figma exact):
 *   Height:            72px
 *   Horizontal padding: 24px
 *   Vertical padding:   16px (centering 40px Size=M buttons)
 *   Button gap (right group): 12px
 *   Separator:         1px top border
 */

export type StepperNavFooterVariant = "cancel-next" | "back-next"

export type StepperNavFooterProps = {
  /** "cancel-next" for the first step · "back-next" for all subsequent steps */
  variant?: StepperNavFooterVariant
  /** Label for the Cancel button (cancel-next variant). Default: "Cancel" */
  cancelLabel?: string
  /** Label for the Back button (back-next variant). Default: "Back" */
  backLabel?: string
  onCancel?: () => void
  onBack?: () => void
  /** Label for the primary Next/Finish button. Default: "Next" */
  nextLabel?: string
  /** Disable the Next button when the current step is incomplete or invalid */
  nextDisabled?: boolean
  onNext?: () => void
  /** Optional secondary CTA in the right group (e.g. "Save as draft").
   *  Only rendered when both secondaryLabel and onSecondary are provided. */
  secondaryLabel?: string
  onSecondary?: () => void
  className?: string
}

export function StepperNavFooter({
  variant = "cancel-next",
  cancelLabel = "Cancel",
  backLabel = "Back",
  onCancel,
  onBack,
  nextLabel = "Next",
  nextDisabled = false,
  onNext,
  secondaryLabel,
  onSecondary,
  className,
}: StepperNavFooterProps) {
  return (
    <div
      className={className}
      role="navigation"
      aria-label="Step navigation"
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "var(--step-nav-footer-bg)",
        borderTop: "1px solid var(--step-nav-footer-separator)",
        borderRadius: "var(--radius-m)",
      }}
    >
      {/* Left: Cancel (first step) or Back with arrow (subsequent steps) */}
      {variant === "cancel-next" ? (
        <Button
          variant="secondary"
          size="default"
          onClick={onCancel}
          aria-label="Cancel and exit this flow"
        >
          {cancelLabel}
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="default"
          onClick={onBack}
          aria-label="Go back to the previous step"
        >
          <ArrowLeft size={20} aria-hidden />
          {backLabel}
        </Button>
      )}

      {/* Right group: optional secondary CTA + primary Next */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {secondaryLabel && onSecondary && (
          <Button
            variant="secondary"
            size="default"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </Button>
        )}
        <Button
          variant="primary"
          size="default"
          disabled={nextDisabled}
          onClick={onNext}
          aria-label={nextDisabled ? `${nextLabel} (complete this step first)` : nextLabel}
        >
          {nextLabel}
          <ArrowRight size={20} aria-hidden />
        </Button>
      </div>
    </div>
  )
}
