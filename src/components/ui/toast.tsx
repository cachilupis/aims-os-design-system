import { createContext, useCallback, useContext, useState } from "react"
import { createPortal } from "react-dom"
import { AlertBanner, type AlertBannerState } from "@/components/ui/alert-banner"

/**
 * Floating AlertBanner ("toast") — AIMS OS Design System
 *
 * This is NOT a second visual component. It is a placement layer: the tile it
 * renders is a real `<AlertBanner>`, so the DS has one feedback language with
 * two placements —
 *
 *   in flow    <AlertBanner … />       persistent, occupies layout, user closes it
 *   floating   useToast().success(…)   transient, top-right, auto-dismisses
 *
 * Confirmed by Michael (2026-09-01): AlertBanner was designed for exactly this
 * job — contextual confirmation of an action, gone after a couple of seconds,
 * with an optional CTA. A separate Toast tile duplicated its visual language
 * and, in doing so, reintroduced a contrast bug AlertBanner's own tokens
 * already solve: the first version hardcoded Surface/Neutral/White, which is
 * #FFFFFF in BOTH themes, under near-white dark-mode text.
 *
 * Placement: top-right, 24px inset. Stack grows downward, newest at the bottom.
 * z-index 10050, above SlideOut (10010) and ModalDialog (10020). The container
 * is pointer-events:none so the empty region stays interactive; each banner
 * opts back in.
 *
 * Entrance is a CSS animation (`alert-banner-toast-in`), not a state flip
 * inside requestAnimationFrame — that version was cancelled by its own effect
 * cleanup under StrictMode, so every toast lived and died at opacity 0.
 *
 * useToast() returns no-ops outside a provider, so components still render in
 * docs previews and SSR.
 */

// ── Public types ──────────────────────────────────────────────────────

/** Maps 1:1 onto AlertBanner's own states — no separate visual vocabulary. */
export type ToastVariant = Extract<AlertBannerState, "success" | "error" | "info">

export interface ToastPushOptions {
  /** Secondary line under the title. */
  description?: string
  /** Optional inline action, e.g. "Undo" / "Retry". Rendered by AlertBanner. */
  cta?:         string
  onCta?:       () => void
  /** Auto-dismiss delay in ms. Default 3500. Pass 0 to keep it until dismissed. */
  duration?:    number
}

interface ToastItem extends ToastPushOptions {
  id:       number
  variant:  ToastVariant
  title:    string
  duration: number
}

interface ToastContextValue {
  push:    (variant: ToastVariant, title: string, options?: ToastPushOptions) => void
  dismiss: (id: number) => void
}

const ToastCtx = createContext<ToastContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((variant: ToastVariant, title: string, options?: ToastPushOptions) => {
    const id       = Date.now() + Math.floor(Math.random() * 1000)
    const duration = options?.duration ?? 3500
    setItems(prev => [...prev, { ...options, id, variant, title, duration }])
    if (duration > 0) {
      window.setTimeout(() => {
        setItems(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      {typeof document !== "undefined" && createPortal(
        <ToastStack items={items} onDismiss={dismiss} />,
        document.body,
      )}
    </ToastCtx.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────

interface UseToastReturn {
  success: (title: string, options?: ToastPushOptions) => void
  info:    (title: string, options?: ToastPushOptions) => void
  error:   (title: string, options?: ToastPushOptions) => void
  dismiss: (id: number) => void
}

export function useToast(): UseToastReturn {
  const ctx = useContext(ToastCtx)
  if (!ctx) {
    const noop = () => {}
    return { success: noop, info: noop, error: noop, dismiss: noop }
  }
  return {
    success: (t, o) => ctx.push("success", t, o),
    info:    (t, o) => ctx.push("info",    t, o),
    error:   (t, o) => ctx.push("error",   t, o),
    dismiss: ctx.dismiss,
  }
}

// ── Stack ─────────────────────────────────────────────────────────────

function ToastStack({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  if (items.length === 0) return null
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed right-[24px] top-[24px] flex flex-col gap-[8px] z-[10050] w-[360px] max-w-[calc(100vw-48px)]"
      style={{ pointerEvents: "none" }}
    >
      {items.map(item => (
        <div
          key={item.id}
          role="status"
          aria-live="polite"
          style={{
            pointerEvents: "auto",
            animation:     "alert-banner-toast-in 280ms ease-out both",
            boxShadow:     "var(--shadow-elevation-3)",
            borderRadius:  8,
          }}
        >
          <AlertBanner
            state={item.variant}
            title={item.title}
            description={item.description}
            cta={item.cta}
            onCta={item.onCta}
            onClose={() => onDismiss(item.id)}
          />
        </div>
      ))}
    </div>
  )
}
