import { useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type GreetingTimeOfDay = "morning" | "afternoon" | "evening"

export interface HeroActionItem {
  urgencyLabel: string
  title: string
  subtitle: string
  actions: {
    label: string
    icon?: ReactNode
    variant?: "primary" | "secondary" | "tertiary"
    onClick?: () => void
  }[]
}

export interface GreetingHeroProps {
  userName: string
  timeOfDay?: GreetingTimeOfDay
  itemCount?: number
  actionItems?: HeroActionItem[]
  quickLinks?: { label: string; icon?: ReactNode; onClick?: () => void }[]
  onAskPA?: () => void
  className?: string
}

export function GreetingHero({
  userName,
  timeOfDay = "morning",
  itemCount,
  actionItems = [],
  quickLinks = [],
  onAskPA,
  className,
}: GreetingHeroProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const currentItem = actionItems[activeIdx]

  const greetings: Record<GreetingTimeOfDay, string> = {
    morning:   "Good morning",
    afternoon: "Good afternoon",
    evening:   "Good evening",
  }

  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(135deg, #2173FF 0%, #3B5BDB 50%, #7048E8 100%)",
        borderRadius: 16,
        padding: "28px 32px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ask PA button */}
      {onAskPA && (
        <button
          onClick={onAskPA}
          style={{
            position: "absolute", top: 20, right: 20,
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.15)", border: "0.5px solid rgba(255,255,255,0.3)",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer",
            color: "#fff", fontSize: 13, fontWeight: 600,
            backdropFilter: "blur(4px)",
          }}
        >
          ✦ Ask your PA
        </button>
      )}

      {/* Greeting */}
      <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 400, color: "rgba(255,255,255,0.9)" }}>
        {greetings[timeOfDay]},{" "}
        <strong style={{ fontWeight: 700, color: "#fff" }}>{userName}.</strong>
      </p>

      {/* Item count */}
      {itemCount !== undefined && itemCount > 0 && (
        <div className="flex items-center gap-[6px] mb-[20px]">
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#FFC107", flexShrink: 0,
            boxShadow: "0 0 6px rgba(255,193,7,0.7)",
          }} />
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
            {itemCount} items still need you today
          </span>
        </div>
      )}

      {/* Featured action carousel */}
      {actionItems.length > 0 && currentItem && (
        <div style={{
          background: "rgba(255,255,255,0.12)",
          border: "0.5px solid rgba(255,255,255,0.2)",
          borderRadius: 10,
          padding: "14px 16px",
          backdropFilter: "blur(4px)",
          marginBottom: 16,
          position: "relative",
        }}>
          {/* Carousel nav dots */}
          {actionItems.length > 1 && (
            <div style={{ position: "absolute", top: 14, right: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex" }}
              >
                <ChevronLeft size={14} />
              </button>
              {actionItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  style={{
                    width: i === activeIdx ? 16 : 6, height: 6, borderRadius: 3,
                    background: i === activeIdx ? "#fff" : "rgba(255,255,255,0.35)",
                    border: "none", padding: 0, cursor: "pointer",
                    transition: "width 200ms, background 200ms",
                  }}
                />
              ))}
              <button
                onClick={() => setActiveIdx(i => Math.min(actionItems.length - 1, i + 1))}
                style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Urgency label */}
          <div className="flex items-center gap-[6px] mb-[6px]">
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#FF4444", flexShrink: 0,
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF8888" }}>
              {currentItem.urgencyLabel}
            </span>
          </div>

          {/* Item title + subtitle */}
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: "#fff" }}>
            {currentItem.title}
          </p>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {currentItem.subtitle}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-[8px]">
            {currentItem.actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                  background: action.variant === "primary" ? "#fff" : "rgba(255,255,255,0.15)",
                  border: action.variant === "primary" ? "none" : "0.5px solid rgba(255,255,255,0.3)",
                  color: action.variant === "primary" ? "#1a1a2e" : "#fff",
                }}
              >
                {action.icon && <span style={{ display: "flex" }}>{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      {quickLinks.length > 0 && (
        <div className="flex items-center gap-[8px] flex-wrap">
          {quickLinks.map((link, i) => (
            <button
              key={i}
              onClick={link.onClick}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.12)",
                border: "0.5px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {link.icon && <span style={{ display: "flex", opacity: 0.8 }}>{link.icon}</span>}
              {link.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
