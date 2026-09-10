/**
 * Tag Input — AIMS OS DS · node 16937:21999
 * Figma field logic: Enter/button/blur commit · case-insensitive dedup · chips wrap ·
 * overflow collapses to "View more: +N" after maxVisibleTags · maxTags cap disables field.
 * All tokens are canonical DS tokens — no component-level aliases needed.
 */
import { useState, useRef, useCallback, useEffect } from "react"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tag, type TagVariant } from "@/components/ui/tag"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TagInputProps {
  tags: string[]
  onAddTag: (value: string) => void
  onRemoveTag: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Error message shown below the input field */
  error?: string
  /** Cap on total tags — disables field + shows inline message. Default: 30 */
  maxTags?: number
  /** Tags shown before collapsing to "+N". Default: 8 */
  maxVisibleTags?: number
  /**
   * Show the "Add tag" commit button beside the field. Default: true.
   *
   * Off for fields where the button reads as a second, competing action rather
   * than part of the field — an invite form's email row, where the dialog
   * already has its own primary CTA. Enter still commits, so nothing becomes
   * unreachable; say so in the field's helper text when you turn it off,
   * because the button was the only visible hint that a commit step exists.
   */
  showAddButton?: boolean
  /**
   * Fires with the uncommitted text as the user types, "" once it is committed
   * or cleared.
   *
   * A caller that gates a CTA on `tags.length` otherwise reads a field the user
   * has visibly filled in as empty: they type one address, click the button,
   * and nothing happens because the address is still a draft. Gate on
   * `tags.length > 0 || draft.trim()` instead — the blur commit below turns the
   * draft into a tag before the click lands.
   */
  onDraftChange?: (draft: string) => void
  /**
   * Reject a value before it becomes a chip. Return an error message to
   * refuse it, or null to accept.
   *
   * Without this the field takes anything, which is right for tags and wrong
   * for a list of email addresses: "josjosjdos" turned into a chip and read
   * as a label somebody had just invented. A field that accepts nonsense is
   * announcing that it is a tag builder.
   */
  validate?: (value: string) => string | null
  /**
   * Render every chip in one variant instead of cycling six colours.
   *
   * The cycle is what makes a set of chips read as CATEGORIES — six colours
   * say these things differ from each other. A list of recipients is one
   * kind of thing repeated, so it takes one variant, usually "neutral".
   */
  tagVariant?: TagVariant
  className?: string
}

// ── Tag chip color cycle (by insertion index) ────────────────────────────────
// Cycles through the Tag atom's own variants: Informative → Neutral → LimeGreen
// → LightBlue → Yellow → Purple.

const TAG_VARIANT_CYCLE: TagVariant[] = ["informative", "neutral", "limeGreen", "lightBlue", "yellow", "purple"]

// ── Component ─────────────────────────────────────────────────────────────────

export function TagInput({
  tags,
  onAddTag,
  onRemoveTag,
  placeholder = "Write the tag name",
  disabled = false,
  error,
  maxTags = 30,
  maxVisibleTags = 8,
  showAddButton = true,
  onDraftChange,
  validate,
  tagVariant,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [focused, setFocused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  /** Escape blurs on purpose after clearing — that blur must not re-commit. */
  const escaping = useRef(false)
  /** What `validate` said about the last attempted commit. */
  const [rejected, setRejected] = useState<string | null>(null)

  const shownError = error ?? rejected ?? undefined

  const maxReached = tags.length >= maxTags
  const isInputDisabled = disabled || maxReached

  const setDraft = useCallback((v: string) => {
    setInputValue(v)
    // Typing again is the user answering the complaint; keeping it on screen
    // while they fix the address is just nagging.
    setRejected(null)
    onDraftChange?.(v)
  }, [onDraftChange])

  const commit = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const problem = validate?.(trimmed) ?? null
    if (problem) {
      // Refused: the text stays in the field so it can be corrected rather
      // than retyped, and the reason sits under it.
      setRejected(problem)
      return
    }
    if (!tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      onAddTag(trimmed)
    }
    setDraft("")
  }, [inputValue, tags, onAddTag, setDraft, validate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); commit() }
    if (e.key === "Escape") {
      escaping.current = true
      setDraft("")
      setExpanded(false)
      inputRef.current?.blur()
    }
  }, [commit, setDraft])

  // Collapse expanded chip list when clicking outside — DS spec: "Collapse back by clicking away"
  useEffect(() => {
    if (!expanded) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [expanded])

  const visibleTags = expanded ? tags : tags.slice(0, maxVisibleTags)
  const hiddenCount = tags.length - maxVisibleTags
  const hasOverflow = tags.length > maxVisibleTags

  // ── Border style by state ─────────────────────────────────────────────────
  const borderStyle = isInputDisabled
    ? "1px solid var(--color-border-neutral-lighter)"
    : shownError
    ? "0.5px solid var(--field-border-error)"
    : focused
    ? "1px solid var(--field-border-focus)"
    : "0.5px solid var(--field-border)"

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-[8px]", disabled && "opacity-40 pointer-events-none", className)}>

      {/* ── Input row ──────────────────────────────────────────────────── */}
      <div className="flex gap-[12px] items-center" style={{ height: 40 }}>

        {/* Text field */}
        <div
          className="flex-1 flex items-center rounded-[8px] px-[16px]"
          style={{
            height: 40,
            background: "var(--surface)",
            border: borderStyle,
            cursor: isInputDisabled ? "not-allowed" : "text",
          }}
          onClick={() => !isInputDisabled && inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              // Leaving the field keeps what was typed. Throwing it away is the
              // behaviour every chip field has been talked out of: the user has
              // already seen their text sitting in the box, so silently
              // discarding it reads as the app losing their input.
              if (escaping.current) escaping.current = false
              else commit()
            }}
            disabled={isInputDisabled}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium outline-none border-none"
            style={{
              color: "var(--foreground)",
              caretColor: "var(--field-border-focus)",
            }}
          />
        </div>

        {/* Add tag button */}
        {showAddButton && (
          <button
            onClick={commit}
            disabled={isInputDisabled}
            className="shrink-0 flex items-center justify-center rounded-[8px] px-[16px] text-sm font-medium whitespace-nowrap"
            style={{
              height: 40,
              background: isInputDisabled ? "var(--color-surface-neutral-subtle)" : "var(--surface)",
              border: isInputDisabled
                ? "1px solid var(--color-border-neutral-lighter)"
                : "1px solid var(--field-border)",
              color: isInputDisabled ? "var(--field-placeholder)" : "var(--foreground)",
              cursor: isInputDisabled ? "not-allowed" : "pointer",
            }}
          >
            Add tag
          </button>
        )}
      </div>

      {/* ── Error / max-reached message ────────────────────────────────── */}
      {shownError && (
        <p className="text-xs font-medium pl-[2px]" style={{ color: "var(--color-text-error)" }}>
          {shownError}
        </p>
      )}
      {maxReached && !shownError && (
        <p className="text-xs font-medium pl-[2px]" style={{ color: "var(--field-placeholder)" }}>
          Maximum tags reached
        </p>
      )}

      {/* ── Chips ──────────────────────────────────────────────────────── */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-[8px]">
          {/* Chip wrap row */}
          <div className="flex flex-wrap gap-[8px] items-center">
            {visibleTags.map((tag) => {
              const variant = tagVariant ?? TAG_VARIANT_CYCLE[tags.indexOf(tag) % TAG_VARIANT_CYCLE.length]
              return (
                <Tag
                  key={tag}
                  variant={variant}
                  size="default"
                  trailingIcon={!disabled ? (
                    <button
                      onClick={() => onRemoveTag(tag)}
                      className="flex items-center justify-center shrink-0 rounded-[2px] hover:opacity-70 transition-opacity"
                      style={{ width: 16, height: 16, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X size={10} strokeWidth={1.75} />
                    </button>
                  ) : undefined}
                >
                  {tag}
                </Tag>
              )
            })}

            {/* "View more: +N" — shown inline in collapsed state (DS pattern) */}
            {hasOverflow && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="flex gap-[4px] items-center rounded-[4px] px-[6px] text-xs font-medium"
                style={{ height: 28, color: "var(--foreground)", background: "transparent", border: "none", cursor: "pointer" }}
              >
                View more: +{hiddenCount} <ChevronDown size={14} />
              </button>
            )}
          </div>

          {/* "View less" — own row below all chips in expanded state (DS pattern) */}
          {hasOverflow && expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="flex gap-[4px] items-center rounded-[4px] px-[6px] text-xs font-medium self-start"
              style={{ height: 28, color: "var(--foreground)", background: "transparent", border: "none", cursor: "pointer" }}
            >
              View less <ChevronUp size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
