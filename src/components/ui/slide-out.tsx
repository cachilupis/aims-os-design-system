/**
 * Slide Out — AIMS OS DS · node 5045:61434
 * Overlay panel that slides in from the right.
 * 2 sizes: M (635px) · S (420px)
 * Tokens: --slide-out-* family aliases canonical DS tokens.
 * Radius: Radius-XL = 24px on top-left and bottom-left corners only.
 */
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

export type SlideOutSize = "m" | "s"

export interface SlideOutProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: SlideOutSize
  /** Close panel when backdrop is clicked. Default: true */
  closeOnBackdrop?: boolean
  children?: React.ReactNode
  /** Optional footer content rendered below a divider */
  footer?: React.ReactNode
  className?: string
}

// ── Width map ─────────────────────────────────────────────────────────────────

const SIZE_WIDTH: Record<SlideOutSize, string> = {
  m: "635px",
  s: "420px",
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SlideOut({
  open,
  onClose,
  title,
  subtitle,
  size = "m",
  closeOnBackdrop = true,
  children,
  footer,
  className,
}: SlideOutProps) {
  // Escape key dismissal
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  const panel = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-end",
        "pointer-events-none",
        open && "pointer-events-auto",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        style={{ background: "var(--slide-out-overlay)" }}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          "relative flex flex-col h-full shrink-0",
          "transition-transform duration-300 ease-out",
          "overflow-hidden",
          open ? "translate-x-0" : "translate-x-full",
          className,
        )}
        style={{
          width: SIZE_WIDTH[size],
          background: "var(--slide-out-bg)",
          borderLeft: "0.5px solid var(--slide-out-border)",
          borderRadius: "24px 0 0 24px",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.18)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-out-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-[16px] py-[16px] gap-[8px]">
          <div className="flex flex-col gap-[4px] min-w-0">
            <h2
              id="slide-out-title"
              className="text-[20px] font-semibold leading-none truncate"
              style={{ color: "var(--slide-out-title)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="text-[14px] font-medium leading-[20px]"
                style={{ color: "var(--slide-out-body)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            className="flex items-center justify-center w-[32px] h-[32px] rounded-full shrink-0 hover:opacity-70 transition-opacity"
            style={{ color: "var(--slide-out-icon)" }}
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Header divider */}
        <div
          className="shrink-0"
          style={{ height: "0.5px", background: "var(--slide-out-border)" }}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[24px]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <>
            <div
              className="shrink-0"
              style={{ height: "0.5px", background: "var(--slide-out-border)" }}
            />
            <div className="flex items-center justify-end gap-[8px] shrink-0 px-[16px] py-[16px]">
              {footer}
            </div>
          </>
        )}
      </aside>
    </div>
  )

  return createPortal(panel, document.body)
}
