export interface DailyMessageCardProps {
  time: string
  title: string
  body: string
  senderInitials: string
  senderName: string
  senderRole: string
  onOpenMessages?: () => void
}

export function DailyMessageCard({
  time,
  title,
  body,
  senderInitials,
  senderName,
  senderRole,
  onOpenMessages,
}: DailyMessageCardProps) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--field-border)",
      borderRadius: 10,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      height: "100%",
      boxSizing: "border-box",
    }}>
      {/* Label */}
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", color: "var(--field-supporting)",
      }}>
        Daily Message · {time}
      </span>

      {/* Title */}
      <h3 style={{
        margin: 0, fontSize: 14, fontWeight: 700,
        lineHeight: 1.35, color: "var(--color-text-title)",
      }}>
        {title}
      </h3>

      {/* Body */}
      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.55,
        color: "var(--foreground)", flexGrow: 1,
      }}>
        {body}
      </p>

      {/* Sender */}
      <div className="flex items-center gap-[8px]">
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "var(--color-surface-primary-default)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>
            {senderInitials}
          </span>
        </div>
        <div className="flex flex-col" style={{ gap: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{senderName}</span>
          <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{senderRole}</span>
        </div>
      </div>

      {/* Link */}
      <button
        onClick={onOpenMessages}
        style={{
          background: "none", border: "none", padding: 0,
          fontSize: 12, fontWeight: 600, color: "var(--primary)",
          cursor: "pointer", textAlign: "left",
          textDecoration: "none",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = "underline" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = "none" }}
      >
        Open messages →
      </button>
    </div>
  )
}
