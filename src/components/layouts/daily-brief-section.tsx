import type { ReactNode } from "react"

export interface DailyBriefSectionProps {
  estimatedMinutes?: number
  startHere: ReactNode
  dailyMessage: ReactNode
  className?: string
}

export function DailyBriefSection({
  estimatedMinutes,
  startHere,
  dailyMessage,
  className,
}: DailyBriefSectionProps) {
  return (
    <div className={className}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-[14px]">
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: "var(--field-supporting)",
        }}>
          Your Day — Assembled For You
        </span>
        {estimatedMinutes !== undefined && (
          <span style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>
            Est. focus time · ~{estimatedMinutes} min
          </span>
        )}
      </div>

      {/* Two-column grid: Start Here (60%) + Daily Message (40%) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr",
        gap: 12,
        alignItems: "stretch",
      }}>
        <div>{startHere}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>{dailyMessage}</div>
      </div>
    </div>
  )
}
