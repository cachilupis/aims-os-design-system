import { cn } from "@/lib/utils"

/**
 * Radio — AIMS OS Design System
 * Source: Figma v6rmYKA2zmyXWOahlxLOeI · node 5045:52590 (Radio Button Component)
 *
 * A radio selects exactly one option from a set of two or more mutually
 * exclusive choices. Selecting one deselects the rest. Per the DS, a radio is
 * never used alone — always inside a `RadioGroup`.
 *
 * Sizes (DS: S / M / L, padding Spacing/1x = 4px on all sides):
 *   sm → ring 16×16 · dot 6px
 *   md → ring 20×20 · dot 8px   (default)
 *   lg → ring 24×24 · dot 10px
 *
 * Colours — every one an existing token, none introduced for this component:
 *   unselected ring → --color-icon-neutral-dark    (Figma Icon/Neutral/Dark)
 *   selected        → --primary                    (Figma Icon/Primary/Default)
 *   disabled        → --color-text-disabled        (Figma Icon/Neutral/Disable-Dark)
 *   label           → --color-text-body            (Figma Text/Body)
 *
 * Why --primary and not --color-icon-primary-default, which is the name that
 * matches the Figma variable: that token's light value is #001740, a near-black
 * navy, where its own Figma variable is #2173ff. A selected radio would read as
 * black in light mode. --primary carries the correct value in both themes, and
 * nothing else in the repo consumes the mismatched token — which is why nobody
 * had noticed. Flagged for Michael rather than corrected here, since changing a
 * token's value is a decision, not a fix.
 *
 * Accessibility, all four rules from the DS documentation frame:
 *   · the group is a <fieldset> with a <legend> — that is RadioGroup's job
 *   · every radio has a real <label>, never placeholder text
 *   · aria-checked reflects selection
 *   · disabled sets aria-disabled and leaves the tab order
 *   · arrow keys move between options, Tab leaves the group entirely — which is
 *     why only the selected radio is tabbable (roving tabindex)
 */

export type RadioSize = "sm" | "md" | "lg"

const SIZE: Record<RadioSize, { ring: number; dot: number; text: number }> = {
  sm: { ring: 16, dot: 6,  text: 13 },
  md: { ring: 20, dot: 8,  text: 14 },
  lg: { ring: 24, dot: 10, text: 15 },
}

export type RadioProps = {
  /** Value this option carries. Compared against the group's value. */
  value:      string
  checked?:   boolean
  onChange?:  (value: string) => void
  size?:      RadioSize
  disabled?:  boolean
  /** Required by the DS: a radio without a label is not a radio. */
  label:      string
  /** Renders the control alone, for rows that already draw their own label —
   *  a filter panel row with its own text and count, for instance. `label` is
   *  still required and becomes the accessible name, so the radio never ends up
   *  nameless. This is the only sanctioned way to omit the visible text. */
  hideLabel?: boolean
  description?: string
  /** Set by RadioGroup — roving tabindex, so Tab skips past the whole group. */
  tabbable?:  boolean
  name?:      string
  className?: string
  id?:        string
}

export function Radio({
  value,
  checked = false,
  onChange,
  size = "md",
  disabled = false,
  label,
  description,
  tabbable = true,
  hideLabel = false,
  className,
  id,
}: RadioProps) {
  const { ring, dot, text } = SIZE[size]

  // Unselected and selected share the ring colour when disabled — the DS uses
  // one disabled token for both, so a disabled selected radio still reads as
  // selected, just muted.
  const ringColor = disabled
    ? "var(--color-text-disabled)"
    : checked
      ? "var(--primary)"
      : "var(--color-icon-neutral-dark)"

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-start gap-[8px] select-none",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <button
        id={id}
        type="button"
        role="radio"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        tabIndex={tabbable && !disabled ? 0 : -1}
        onClick={() => !disabled && onChange?.(value)}
        // Spacing/1x on all sides. The container's background only appears on
        // hover and focus — the DS anatomy is explicit that it is otherwise
        // invisible.
        className={cn(
          "shrink-0 flex items-center justify-center rounded-full p-[4px]",
          "transition-colors outline-none",
          !disabled && "hover:bg-[var(--color-surface-primary-subtle)]",
          !disabled && "focus-visible:bg-[var(--color-surface-primary-subtle)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-0"
        )}
      >
        <span
          className="flex items-center justify-center rounded-full transition-colors"
          style={{
            width: ring,
            height: ring,
            border: `2px solid ${ringColor}`,
          }}
        >
          {checked && (
            <span
              className="rounded-full transition-colors"
              style={{ width: dot, height: dot, background: ringColor }}
            />
          )}
        </span>
      </button>

      {!hideLabel && (
      <span className="flex flex-col gap-[2px] min-w-0">
        <span
          style={{
            fontSize: text,
            fontWeight: 500,
            lineHeight: `${ring + 8}px`,
            color: disabled ? "var(--color-text-disabled)" : "var(--color-text-body)",
          }}
        >
          {label}
        </span>
        {description && (
          <span
            style={{
              fontSize: text - 2,
              lineHeight: 1.4,
              color: disabled ? "var(--color-text-disabled)" : "var(--color-text-caption)",
            }}
          >
            {description}
          </span>
        )}
      </span>
      )}
    </label>
  )
}

export type RadioGroupProps = {
  /** The <legend>. Required — the DS asks for it so a screen reader announces
   *  what the set of options is actually choosing between. */
  legend:    string
  /** Hide the legend visually while keeping it for assistive tech. */
  hideLegend?: boolean
  value?:    string
  onChange?: (value: string) => void
  options:   { value: string; label: string; description?: string; disabled?: boolean }[]
  size?:     RadioSize
  disabled?: boolean
  /** Horizontal only suits two or three short options. */
  orientation?: "vertical" | "horizontal"
  name?:     string
  className?: string
}

/**
 * The DS is explicit that radios always appear in a group, so the group is the
 * component you reach for and `Radio` is what it renders. That also puts the
 * three accessibility requirements that are group-level — the fieldset, the
 * legend, and arrow-key navigation — in the one place that can honour them.
 */
export function RadioGroup({
  legend,
  hideLegend = false,
  value,
  onChange,
  options,
  size = "md",
  disabled = false,
  orientation = "vertical",
  name,
  className,
}: RadioGroupProps) {
  const enabled = options.filter(o => !o.disabled && !disabled)

  // Arrow keys move within the group and wrap; Tab leaves it. Skips disabled
  // options rather than landing on them.
  const move = (dir: 1 | -1) => {
    if (!enabled.length) return
    const at = enabled.findIndex(o => o.value === value)
    const next = enabled[(at + dir + enabled.length) % enabled.length]
    onChange?.(next.value)
  }

  // Nothing selected yet: the first enabled option holds the tab stop, so the
  // group is reachable at all.
  const tabStop = value ?? enabled[0]?.value

  return (
    <fieldset
      className={cn("border-0 p-0 m-0 min-w-0", className)}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); move(1) }
        if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  { e.preventDefault(); move(-1) }
      }}
    >
      <legend
        className={cn(
          hideLegend && "sr-only",
          !hideLegend && "mb-[8px] p-0"
        )}
        style={hideLegend ? undefined : {
          fontSize: 12, fontWeight: 600,
          color: "var(--color-text-label)",
        }}
      >
        {legend}
      </legend>

      <div
        role="radiogroup"
        aria-label={hideLegend ? legend : undefined}
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col gap-[8px]" : "flex-row flex-wrap gap-[16px]"
        )}
      >
        {options.map(opt => (
          <Radio
            key={opt.value}
            value={opt.value}
            label={opt.label}
            description={opt.description}
            checked={value === opt.value}
            onChange={onChange}
            size={size}
            disabled={disabled || opt.disabled}
            tabbable={opt.value === tabStop}
            name={name}
          />
        ))}
      </div>
    </fieldset>
  )
}
