/**
 * Tag Input — AIMS OS DS · node 16937:21999
 * Figma field logic: Enter/button commit · case-insensitive dedup · chips wrap ·
 * overflow collapses to "View more: +N" after maxVisibleTags · maxTags cap disables field.
 * All tokens are canonical DS tokens — no component-level aliases needed.
 */
import { useState, useRef, useCallback, useEffect } from "react"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

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
  className?: string
}

// ── Tag chip color palettes (cycle by insertion index) ───────────────────────
// Matches DS Tag Secondary S chips: Blue → Neutral → Lime → Light Blue → Yellow → Purple

const TAG_PALETTES = [
  { bg: "var(--color-surface-primary-subtle)",      border: "1px solid var(--color-border-primary-default)",    text: "var(--color-text-info)"        },
  { bg: "var(--color-surface-neutral-default)",     border: "1px solid var(--color-border-neutral-default)",    text: "var(--color-text-subtitle)"    },
  { bg: "var(--color-surface-lime-subtle)",         border: "1px solid var(--color-border-lime-green-default)", text: "var(--color-text-lime-green)"  },
  { bg: "var(--color-surface-light-blue-subtle)",   border: "1px solid var(--color-border-light-blue-default)", text: "var(--color-text-light-blue)"  },
  { bg: "var(--color-surface-yellow-more-subtle)",  border: "1px solid var(--color-border-yellow-default)",     text: "var(--color-text-yellow)"      },
  { bg: "var(--color-surface-purple-more-subtle)",  border: "1px solid var(--color-border-purple-default)",     text: "var(--color-text-purple)"      },
] as const

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
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [focused, setFocused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const maxReached = tags.length >= maxTags
  const isInputDisabled = disabled || maxReached

  const commit = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (!tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      onAddTag(trimmed)
    }
    setInputValue("")
  }, [inputValue, tags, onAddTag])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); commit() }
    if (e.key === "Escape") {
      setInputValue("")
      setExpanded(false)
      inputRef.current?.blur()
    }
  }, [commit])

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
    : error
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
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={isInputDisabled}
            placeholder={placeholder}
            className="w-full bg-transparent text-[14px] font-medium outline-none border-none"
            style={{
              color: "var(--foreground)",
              caretColor: "var(--field-border-focus)",
            }}
          />
        </div>

        {/* Add tag button */}
        <button
          onClick={commit}
          disabled={isInputDisabled}
          className="shrink-0 flex items-center justify-center rounded-[8px] px-[16px] text-[14px] font-medium whitespace-nowrap"
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
      </div>

      {/* ── Error / max-reached message ────────────────────────────────── */}
      {error && (
        <p className="text-[12px] font-medium pl-[2px]" style={{ color: "var(--color-text-error)" }}>
          {error}
        </p>
      )}
      {maxReached && !error && (
        <p className="text-[12px] font-medium pl-[2px]" style={{ color: "var(--field-placeholder)" }}>
          Maximum tags reached
        </p>
      )}

      {/* ── Chips ──────────────────────────────────────────────────────── */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-[8px]">
          {/* Chip wrap row */}
          <div className="flex flex-wrap gap-[8px] items-center">
            {visibleTags.map((tag) => {
              const palette = TAG_PALETTES[tags.indexOf(tag) % TAG_PALETTES.length]
              return (
                <div
                  key={tag}
                  className="flex gap-[4px] items-center rounded-[8px] px-[8px] shrink-0"
                  style={{ height: 24, background: palette.bg, border: palette.border }}
                >
                  <span
                    className="text-[14px] font-medium leading-none whitespace-nowrap"
                    style={{ color: palette.text }}
                  >
                    {tag}
                  </span>
                  {!disabled && (
                    <button
                      onClick={() => onRemoveTag(tag)}
                      className="flex items-center justify-center shrink-0 rounded-[2px]"
                      style={{
                        width: 16, height: 16,
                        color: "var(--field-supporting)",
                        background: "transparent", border: "none",
                        cursor: "pointer", padding: 0,
                      }}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )
            })}

            {/* "View more: +N" — shown inline in collapsed state (DS pattern) */}
            {hasOverflow && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="flex gap-[4px] items-center rounded-[4px] px-[6px] text-[12px] font-medium"
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
              className="flex gap-[4px] items-center rounded-[4px] px-[6px] text-[12px] font-medium self-start"
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
