/**
 * Add Fields — AIMS OS DS · node 16924:17092
 * Dynamic field list for Node Configuration panels.
 * Each row uses the DS Input component (size="sm", 32px) with inline validation.
 * Inline validation: empty on blur → error; duplicate labels → error on both rows.
 * Max fields cap: + button replaced by "Maximum fields reached" message.
 */
import { useState, useRef, useCallback, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FieldItem {
  id: string
  label: string
}

export interface AddFieldsProps {
  fields: FieldItem[]
  onAddField: () => void
  onRemoveField: (id: string) => void
  onChange: (id: string, label: string) => void
  /** Hard cap on total rows. + button replaced by max-reached message. Default: 20 */
  maxFields?: number
  placeholder?: string
  disabled?: boolean
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AddFields({
  fields,
  onAddField,
  onRemoveField,
  onChange,
  maxFields = 20,
  placeholder = "Placeholder",
  disabled = false,
  className,
}: AddFieldsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  const prevLengthRef = useRef(fields.length)

  const maxReached = fields.length >= maxFields

  // Auto-focus the last input when a new row is appended
  useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      const last = fields[fields.length - 1]
      if (last) inputRefs.current.get(last.id)?.focus()
    }
    prevLengthRef.current = fields.length
  }, [fields.length, fields])

  const setRef = (id: string) => (el: HTMLInputElement | null) => {
    if (el) inputRefs.current.set(id, el)
    else inputRefs.current.delete(id)
  }

  const validate = useCallback((id: string, label: string) => {
    setErrors(prev => {
      const next = { ...prev }
      if (!label.trim()) {
        next[id] = "Field label is required"
        return next
      }
      delete next[id]
      const dups = fields.filter(f => f.id !== id && f.label.toLowerCase() === label.toLowerCase())
      if (dups.length > 0) {
        next[id] = "Duplicate field name"
        dups.forEach(d => { next[d.id] = "Duplicate field name" })
      } else {
        fields.forEach(f => {
          if (f.id !== id && prev[f.id] === "Duplicate field name") {
            const stillDup = fields.some(o => o.id !== f.id && o.label.toLowerCase() === f.label.toLowerCase())
            if (!stillDup) delete next[f.id]
          }
        })
      }
      return next
    })
  }, [fields])

  const clearError = useCallback((id: string) => {
    setErrors(prev => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  return (
    <div className={cn("flex flex-col", className)} style={{ gap: 12 }}>

      {/* Field rows — each uses DS Input component (size="sm" = 32px) */}
      {fields.map(field => (
        <FieldRow
          key={field.id}
          field={field}
          inputRef={setRef(field.id)}
          error={errors[field.id]}
          placeholder={placeholder}
          disabled={disabled}
          onChange={val => { onChange(field.id, val); clearError(field.id) }}
          onBlur={() => validate(field.id, field.label)}
          onRemove={() => onRemoveField(field.id)}
        />
      ))}

      {/* + Add field trigger / max-reached message */}
      {maxReached ? (
        <div
          className="flex items-center justify-center w-full rounded-[8px] text-[12px] font-medium"
          style={{
            height: 32,
            border: "0.5px solid var(--color-border-neutral-lighter)",
            background: "var(--color-surface-neutral-subtle)",
            color: "var(--field-placeholder)",
          }}
        >
          Maximum fields reached
        </div>
      ) : (
        <button
          onClick={() => { if (!disabled) onAddField() }}
          disabled={disabled}
          className="flex items-center justify-center w-full rounded-[8px]"
          style={{
            height: 32,
            border: "0.5px solid var(--field-border)",
            background: "var(--surface)",
            color: "var(--field-supporting)",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.4 : 1,
          }}
          aria-label="Add field"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

// ── Field Row — wraps DS Input with hover-reveal × button ─────────────────────

interface FieldRowProps {
  field: FieldItem
  inputRef: (el: HTMLInputElement | null) => void
  error?: string
  placeholder: string
  disabled: boolean
  onChange: (value: string) => void
  onBlur: () => void
  onRemove: () => void
}

function FieldRow({
  field,
  inputRef,
  error,
  placeholder,
  disabled,
  onChange,
  onBlur,
  onRemove,
}: FieldRowProps) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  // DS spec: × is always visible when row has content; hover/focus-revealed when empty
  const showRemove = !disabled && (!!field.label || hovered || focused)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Input
        ref={inputRef}
        size="sm"
        state={error ? "error" : "default"}
        value={field.label}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur() }}
        disabled={disabled}
        placeholder={placeholder}
        supportingText={error}
        rightIcon={showRemove ? (
          <button
            onMouseDown={e => { e.preventDefault(); onRemove() }}
            tabIndex={-1}
            className="flex items-center justify-center"
            style={{
              background: "transparent", border: "none",
              cursor: "pointer", padding: 0,
              color: "var(--field-supporting)",
            }}
            aria-label="Remove field"
          >
            <X size={12} strokeWidth={2} />
          </button>
        ) : null}
      />
    </div>
  )
}
