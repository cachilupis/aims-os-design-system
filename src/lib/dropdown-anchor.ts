import { useLayoutEffect, useRef, useState } from "react"

/**
 * Dropdown anchoring — AIMS OS Design System
 *
 * One rule, one implementation. Confirmed by Michael (2026-09-02):
 *
 *   A dropdown's LEFT edge aligns with its trigger's LEFT edge, 4px below —
 *   never centred on the trigger, never at the mouse position. If the panel
 *   would run off the right of the viewport, it flips: RIGHT edges align
 *   instead. The flip is automatic, not a per-screen decision.
 *
 * The previous rule centred the panel (`translateX(-50%)`), which reads fine
 * on a narrow trigger and badly on a wide one, and pushes a long panel off
 * screen near the right edge. Tooltips and the Slider thumb still centre on
 * their anchor — that is correct for them, and this helper does not apply.
 *
 * Panels here are `w-auto`, so the width is not known until the panel is in
 * the DOM. The hook measures it before paint (useLayoutEffect) and flips in
 * the same frame, so the user never sees it jump.
 *
 * Usage:
 *
 *   const [anchor, setAnchor] = useState<DropdownAnchor | null>(null)
 *   const { ref, style } = useDropdownPosition(anchor)
 *
 *   onClickCapture={(e) => setAnchor(anchorFromEvent(e))}
 *
 *   {anchor && <div ref={ref} style={{ position: "fixed", zIndex: 10001, ...style }}>…</div>}
 */

export interface DropdownAnchor {
  /** Trigger's left edge, viewport coordinates. */
  left:  number
  /** Distance from the viewport's right edge to the trigger's right edge. */
  right: number
  /** Trigger's bottom edge — the panel sits 4px below this. */
  top:   number
}

/** Gap between trigger and panel. Spacing/1x. */
const GAP = 4

/** Breathing room kept between the panel and the viewport edge. */
const EDGE_MARGIN = 16

/**
 * Reads the anchor from a click on (or inside) the trigger button. Falls back
 * to the pointer position only when no button is found, which should not
 * happen in normal use.
 */
export function anchorFromEvent(e: { target: EventTarget | null; clientX: number; clientY: number }): DropdownAnchor {
  const btn = (e.target as HTMLElement | null)?.closest("button")
  if (!btn) {
    return { left: e.clientX, right: window.innerWidth - e.clientX, top: e.clientY }
  }
  const r = btn.getBoundingClientRect()
  return { left: r.left, right: window.innerWidth - r.right, top: r.bottom }
}

/**
 * Returns the ref to attach to the panel and the positioning style to spread
 * onto it. Left-aligned by default; flips to right-aligned when the measured
 * panel would cross the viewport's right edge.
 */
export function useDropdownPosition(anchor: DropdownAnchor | null) {
  const ref = useRef<HTMLDivElement>(null)
  const [flip, setFlip] = useState(false)

  useLayoutEffect(() => {
    if (!anchor || !ref.current) return
    const width = ref.current.offsetWidth
    setFlip(anchor.left + width > window.innerWidth - EDGE_MARGIN)
  }, [anchor])

  const style: React.CSSProperties = anchor
    ? flip
      ? { top: anchor.top + GAP, right: anchor.right }  // flipped: right edges align
      : { top: anchor.top + GAP, left: anchor.left }    // default: left edges align
    : {}

  return { ref, style }
}
