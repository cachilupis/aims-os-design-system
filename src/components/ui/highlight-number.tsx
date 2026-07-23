export type HighlightNumberVariant =
  | "success"
  | "error"
  | "alert"
  | "informative"
  | "purple"
  | "light-blue"
  | "lime-green"

type HighlightNumberProps = {
  value: number | string
  variant?: HighlightNumberVariant
  className?: string
}

const BG: Record<HighlightNumberVariant, string> = {
  success:     "var(--color-surface-success-more-subtle)",
  error:       "var(--color-surface-error-more-subtle)",
  alert:       "var(--color-surface-alert-more-subtle)",
  informative: "var(--color-surface-primary-more-subtle)",
  purple:      "var(--color-surface-purple-more-subtle)",
  "light-blue":"var(--color-surface-light-blue-subtle)",
  "lime-green":"var(--color-surface-lime-subtle)",
}

const FG: Record<HighlightNumberVariant, string> = {
  success:     "var(--color-text-success)",
  error:       "var(--color-text-error)",
  alert:       "var(--field-text-alert)",
  informative: "var(--tag-informative-fg)",
  purple:      "var(--color-text-purple)",
  "light-blue":"var(--color-surface-light-blue-darker)",
  "lime-green":"var(--tag-limegreen-fg)",
}

export function HighlightNumber({
  value,
  variant = "success",
  className,
}: HighlightNumberProps) {
  return (
    <div
      className={`w-[24px] h-[24px] rounded-[4px] flex items-center justify-center shrink-0 ${className ?? ""}`}
      style={{ background: BG[variant] }}
    >
      <span
        className="text-[12px] font-semibold leading-none tracking-[0.48px] uppercase"
        style={{ color: FG[variant] }}
      >
        {value}
      </span>
    </div>
  )
}
