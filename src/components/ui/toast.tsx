import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, Info, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Toast — AIMS OS Design System
 *
 * Elevated transient notice for confirmation feedback (save/undo,
 * destructive action success, background progress, etc.). Portals to
 * `<body>`, stacks bottom-right, auto-dismisses after 3500ms by default.
 *
 * Public API:
 *   <ToastProvider>  wraps a subtree so descendants can call useToast()
 *   useToast()       → { success, info, error, dismiss }
 *
 * Visual states:
 *   success — CheckCircle2 icon + Text/Success accent stripe
 *   info    — Info icon         + Primary accent stripe
 *   error   — XCircle icon      + Text/Error accent stripe
 *
 * Layout: 12px vertical / 14px horizontal padding, 4px accent left border,
 * 10px radius, gap:12px between icon/message/dismiss. Elevation: 3
 * (dropdown/menu equivalent).
 *
 * Animation: 280ms transform + opacity slide-in from the right on mount;
 * fade+shift-out on dismiss.
 *
 * Portal + stacking:
 *   - z-index 10050 (above SlideOut/ModalDialog which sit at 10010/10020)
 *   - Stack grows upward from the bottom-right corner
 *   - pointer-events on the container are 'none' so the empty region under
 *     the toasts stays interactive; tiles opt back in with 'auto'
 *
 * Fallback: useToast() returns no-op handlers when the caller isn't
 * wrapped in ToastProvider (useful for tree-shakeable previews and SSR).
 */

// ── Public types ──────────────────────────────────────────────────────

export type ToastVariant = "success" | "info" | "error"

export interface ToastPushOptions {
  /** Auto-dismiss delay in ms. Default: 3500. Pass 0 to disable auto-dismiss. */
  duration?: number
}

interface ToastItem {
  id:       number
  variant:  ToastVariant
  message:  string
  duration: number
}

interface ToastContextValue {
  push:    (variant: ToastVariant, message: string, options?: ToastPushOptions) => void
  dismiss: (id: number) => void
}

const ToastCtx = createContext<ToastContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((variant: ToastVariant, message: string, options?: ToastPushOptions) => {
    const id       = Date.now() + Math.floor(Math.random() * 1000)
    const duration = options?.duration ?? 3500
    setItems(prev => [...prev, { id, variant, message, duration }])
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
  success: (message: string, options?: ToastPushOptions) => void
  info:    (message: string, options?: ToastPushOptions) => void
  error:   (message: string, options?: ToastPushOptions) => void
  dismiss: (id: number) => void
}

export function useToast(): UseToastReturn {
  const ctx = useContext(ToastCtx)
  if (!ctx) {
    // No-op fallback so components can render outside of the provider
    // (docs preview, tree-shaken paths, SSR).
    const noop = () => {}
    return { success: noop, info: noop, error: noop, dismiss: noop }
  }
  return {
    success: (m, o) => ctx.push("success", m, o),
    info:    (m, o) => ctx.push("info",    m, o),
    error:   (m, o) => ctx.push("error",   m, o),
    dismiss: ctx.dismiss,
  }
}

// ── Variant configuration ─────────────────────────────────────────────

const STATE_CONFIG = {
  success: { Icon: CheckCircle2, accent: "var(--color-text-success)" },
  info:    { Icon: Info,         accent: "var(--primary)"            },
  error:   { Icon: XCircle,      accent: "var(--color-text-error)"   },
} as const

// ── Stack ─────────────────────────────────────────────────────────────

function ToastStack({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed right-[24px] bottom-[24px] flex flex-col gap-[8px] z-[10050]"
      style={{ pointerEvents: "none" }}
    >
      {items.map(item => (
        <ToastTile key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </div>
  )
}

// ── Tile ──────────────────────────────────────────────────────────────

function ToastTile({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  // Trigger slide-in animation on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const cfg = STATE_CONFIG[item.variant]
  const { Icon } = cfg

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-[12px]",
        "min-w-[280px] max-w-[380px]",
        "py-[12px] pl-[14px] pr-[14px]",
        "rounded-[10px]",
      )}
      style={{
        pointerEvents: "auto",
        background: "var(--color-surface-neutral-white)",
        color:      "var(--color-text-title)",
        border:     "1px solid var(--color-border-neutral-default)",
        borderLeft: `4px solid ${cfg.accent}`,
        boxShadow:  "var(--shadow-elevation-3)",
        transform:  visible ? "translateX(0)" : "translateX(20px)",
        opacity:    visible ? 1 : 0,
        transition: "transform 280ms ease, opacity 280ms ease",
      }}
    >
      <Icon size={18} strokeWidth={1.75} style={{ color: cfg.accent, flexShrink: 0 }} />
      <span className="text-sm leading-[1.43] flex-1 min-w-0">{item.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="inline-flex p-0 border-0 bg-transparent cursor-pointer transition-opacity hover:opacity-70"
        style={{ color: "var(--color-text-caption)" }}
      >
        <X size={14} strokeWidth={1.75} />
      </button>
    </div>
  )
}
