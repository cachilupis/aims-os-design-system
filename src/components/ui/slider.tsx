/**
 * Slider / Range — AIMS OS DS · node 16997:20603
 * Figma layout: {currentValue/lo} [track] {max/hi}  — values inline at track sides.
 * Range uses pointer-event capture for reliable dual-thumb drag (no overlapping inputs).
 */
import { useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

// ── Helpers ───────────────────────────────────────────────────────────────────

function snap(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min
  return Math.max(min, Math.min(max, snapped))
}

function toPct(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SliderSingleProps {
  type?: "single"
  value: number
  onChange: (value: number) => void
}

export interface SliderRangeProps {
  type: "range"
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export type SliderProps = (SliderSingleProps | SliderRangeProps) & {
  min?: number
  max?: number
  step?: number
  /** Optional label shown above the track row */
  label?: string
  disabled?: boolean
  className?: string
}

// ── Thumb style (shared) ──────────────────────────────────────────────────────

const THUMB: React.CSSProperties = {
  position: "absolute",
  width: 16,
  height: 16,
  borderRadius: "50%",
  background: "var(--slider-thumb-bg)",
  border: "2px solid var(--slider-thumb-border)",
  boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
  transform: "translateX(-50%)",
  pointerEvents: "none",
  top: "50%",
  marginTop: -8,
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Slider(props: SliderProps) {
  const { min = 0, max = 100, step = 1, label, disabled = false, className } = props
  const isRange = props.type === "range"

  const lo = isRange ? (props as SliderRangeProps).value[0] : min
  const hi = isRange ? (props as SliderRangeProps).value[1] : (props as SliderSingleProps).value

  const loPct = toPct(lo, min, max)
  const hiPct = toPct(hi, min, max)

  // ── Range drag state ──────────────────────────────────────────────────────
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<"lo" | "hi" | null>(null)

  const valFromPointer = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return min
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return snap(min + pct * (max - min), min, max, step)
  }, [min, max, step])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isRange || disabled) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const val = valFromPointer(e.clientX)
    const distLo = Math.abs(val - lo)
    const distHi = Math.abs(val - hi)
    // When tied, prefer hi if val ≥ midpoint so lo is still reachable
    const which = distLo <= distHi && !(distLo === distHi && val >= (lo + hi) / 2) ? "lo" : "hi"
    setDragging(which)
    const onChange = (props as SliderRangeProps).onChange
    if (which === "lo") onChange([Math.min(val, hi), hi])
    else onChange([lo, Math.max(val, lo)])
  }, [isRange, disabled, lo, hi, valFromPointer, props])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    e.preventDefault()
    const val = valFromPointer(e.clientX)
    const onChange = (props as SliderRangeProps).onChange
    if (dragging === "lo") onChange([Math.min(val, hi), hi])
    else onChange([lo, Math.max(val, lo)])
  }, [dragging, lo, hi, valFromPointer, props])

  const handlePointerUp = useCallback(() => setDragging(null), [])

  // ── Left / right inline labels ────────────────────────────────────────────
  // Single: left = current value, right = max  (matches Figma)
  // Range:  left = selected min,  right = selected max
  const leftLabel  = isRange ? lo  : hi
  const rightLabel = isRange ? hi  : max

  return (
    <div
      className={cn("flex flex-col gap-[6px]", disabled && "opacity-40 pointer-events-none", className)}
    >
      {/* Optional field label */}
      {label && (
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--slider-label-color)" }}
        >
          {label}
        </span>
      )}

      {/* Track row: leftLabel [track] rightLabel */}
      <div className="flex items-center gap-[8px]">
        {/* Left value */}
        <span
          className="text-[11px] font-medium shrink-0 tabular-nums w-[24px] text-right"
          style={{ color: "var(--slider-value-color)" }}
        >
          {leftLabel}
        </span>

        {/* Track area */}
        {isRange ? (
          // Range: fully pointer-event driven
          <div
            ref={trackRef}
            className="relative flex-1 h-[20px] flex items-center"
            style={{ cursor: dragging ? "grabbing" : "pointer", touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Empty track */}
            <div
              className="absolute inset-x-0 h-[4px] rounded-full"
              style={{ background: "var(--slider-track-bg)" }}
            />
            {/* Range fill */}
            <div
              className="absolute h-[4px] rounded-full"
              style={{
                left: `${loPct}%`,
                width: `${hiPct - loPct}%`,
                background: "var(--slider-fill-bg)",
              }}
            />
            {/* Lo thumb */}
            <div style={{ ...THUMB, left: `${loPct}%`, cursor: "grab" }} />
            {/* Hi thumb */}
            <div style={{ ...THUMB, left: `${hiPct}%`, cursor: "grab" }} />
          </div>
        ) : (
          // Single: native input keeps native a11y + keyboard support
          <div className="relative flex-1 h-[20px] flex items-center">
            {/* Empty track */}
            <div
              className="absolute inset-x-0 h-[4px] rounded-full"
              style={{ background: "var(--slider-track-bg)" }}
            />
            {/* Fill */}
            <div
              className="absolute h-[4px] rounded-full"
              style={{ width: `${hiPct}%`, background: "var(--slider-fill-bg)" }}
            />
            {/* Hidden native input for a11y + keyboard */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={hi}
              onChange={e => (props as SliderSingleProps).onChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              style={{ zIndex: 2 }}
            />
            {/* Visual thumb */}
            <div style={{ ...THUMB, left: `${hiPct}%`, zIndex: 1 }} />
          </div>
        )}

        {/* Right value */}
        <span
          className="text-[11px] font-medium shrink-0 tabular-nums w-[24px]"
          style={{ color: "var(--slider-value-color)" }}
        >
          {rightLabel}
        </span>
      </div>
    </div>
  )
}
