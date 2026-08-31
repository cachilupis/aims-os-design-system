import { createContext, useCallback, useContext, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, Info, XCircle, X } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────
// Lightweight local toast system for the Voice Channel prototype.
//
// The prototype fires 9 confirmation toasts on user actions (save,
// HiL toggle, agent add/remove, distribution change, release, etc.).
// DS has no Toast primitive, so this file provides a minimal one
// scoped to this screen only. Portals to <body>, positions bottom-
// right, auto-dismisses after 3500ms.
// ─────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "info" | "error"

interface ToastItem {
  id:      number
  variant: ToastVariant
  message: string
}

interface ToastContextValue {
  push: (variant: ToastVariant, message: string) => void
}

const ToastCtx = createContext<ToastContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback((variant: ToastVariant, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts(prev => [...prev, { id, variant, message }])
    // auto-dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {typeof document !== "undefined" && createPortal(
        <ToastStack items={toasts} onDismiss={dismiss}/>,
        document.body
      )}
    </ToastCtx.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) {
    // Safe fallback so components can be rendered outside the provider
    // (e.g. tree-shaking previews). No-op push.
    return {
      success: (_m: string) => {},
      info:    (_m: string) => {},
      error:   (_m: string) => {},
    }
  }
  return {
    success: (m: string) => ctx.push("success", m),
    info:    (m: string) => ctx.push("info",    m),
    error:   (m: string) => ctx.push("error",   m),
  }
}

// ── Stack + tiles ─────────────────────────────────────────────────────

function ToastStack({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        display: "flex", flexDirection: "column", gap: 8,
        zIndex: 10050,
        pointerEvents: "none",
      }}
    >
      {items.map(t => (
        <ToastTile key={t.id} item={t} onDismiss={() => onDismiss(t.id)}/>
      ))}
    </div>
  )
}

function ToastTile({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    // Trigger slide-in on mount
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const Icon =
    item.variant === "success" ? CheckCircle2 :
    item.variant === "error"   ? XCircle      :
    Info

  const iconColor =
    item.variant === "success" ? "var(--color-text-success)" :
    item.variant === "error"   ? "var(--color-text-error)"   :
    "var(--primary)"

  const borderColor =
    item.variant === "success" ? "var(--color-text-success)" :
    item.variant === "error"   ? "var(--color-text-error)"   :
    "var(--primary)"

  return (
    <div
      role="status"
      style={{
        pointerEvents: "auto",
        display: "flex", alignItems: "center", gap: 12,
        minWidth: 280, maxWidth: 380,
        padding: "12px 14px",
        background: "var(--color-surface-neutral-white)",
        color: "var(--color-text-title)",
        border: `1px solid ${borderColor}`,
        borderLeftWidth: 4,
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.16)",  // audit-ignore: transient toast elevation, no matching DS shadow token
        transform: visible ? "translateX(0)" : "translateX(20px)",
        opacity: visible ? 1 : 0,
        transition: "transform .28s ease, opacity .28s ease",
      }}
    >
      <Icon size={18} style={{ color: iconColor, flexShrink: 0 }}/>
      <span style={{ fontSize: 13, flex: 1, minWidth: 0 }}>{item.message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          color: "var(--color-text-caption)",
          display: "inline-flex",
        }}
      >
        <X size={14}/>
      </button>
    </div>
  )
}
