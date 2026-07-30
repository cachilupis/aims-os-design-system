import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"

export type StartHereUrgency = "act-now" | "heads-up" | "action"

export interface StartHereCardProps {
  urgency?: StartHereUrgency
  studio?: string[]
  eventId?: string
  title: string
  description: string
  studiesTouched?: string[]
  whatYoullDo?: string[]
  helpText?: string
  dueLabel?: string
  onStart?: () => void
  onSkip?: () => void
}

const URGENCY_CONFIG: Record<StartHereUrgency, {
  label: string
  tagVariant: "error" | "alert" | "informative"
  borderColor: string
}> = {
  "act-now":   { label: "Act Now",   tagVariant: "error",       borderColor: "var(--field-border-error)" },
  "heads-up":  { label: "Heads Up",  tagVariant: "alert",       borderColor: "var(--field-border-alert)" },
  "action":    { label: "Action",    tagVariant: "informative",  borderColor: "var(--primary)" },
}

const STUDIO_COLORS: Record<string, { bg: string; text: string }> = {
  GOV:    { bg: "var(--tag-purple-bg)",      text: "var(--tag-purple-fg)" },
  AGNT:   { bg: "var(--tag-lightblue-bg)",   text: "var(--tag-lightblue-fg)" },
  DATA:   { bg: "var(--tag-alert-bg)",       text: "var(--tag-alert-fg)" },
  TASK:   { bg: "var(--tag-neutral-bg)",     text: "var(--tag-neutral-fg)" },
  CLIENT: { bg: "var(--tag-success-bg)",     text: "var(--tag-success-fg)" },
}

function StudioPill({ label }: { label: string }) {
  const colors = STUDIO_COLORS[label] ?? { bg: "var(--tag-neutral-bg)", text: "var(--tag-neutral-fg)" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      height: 20, padding: "0 8px", borderRadius: 8,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
      background: colors.bg, color: colors.text,
    }}>
      {label}
    </span>
  )
}

export function StartHereCard({
  urgency = "act-now",
  studio = [],
  eventId,
  title,
  description,
  studiesTouched,
  whatYoullDo,
  helpText,
  dueLabel = "Due now",
  onStart,
  onSkip,
}: StartHereCardProps) {
  const cfg = URGENCY_CONFIG[urgency]

  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--field-border)",
      borderLeft: `3px solid ${cfg.borderColor}`,
      borderRadius: 10,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      gap: 0,
    }}>
      {/* Header zone */}
      <div style={{ padding: "14px 16px 0" }}>
        {/* Labels row */}
        <div className="flex items-center gap-[6px] flex-wrap mb-[10px]">
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "var(--field-supporting)",
          }}>
            Start Here
          </span>
          <Tag variant={cfg.tagVariant} size="sm">{cfg.label}</Tag>
          {studio.map(s => <StudioPill key={s} label={s} />)}
          {eventId && (
            <span style={{ fontSize: 11, color: "var(--color-text-subtitle)", fontFamily: "monospace" }}>
              {eventId}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          margin: "0 0 8px",
          fontSize: 15, fontWeight: 700, lineHeight: 1.35,
          color: "var(--color-text-title)",
        }}>
          {title}
        </h3>

        {/* Description */}
        <p style={{
          margin: "0 0 14px",
          fontSize: 13, lineHeight: 1.5,
          color: "var(--color-text-body, var(--foreground))",
        }}>
          {description}
        </p>

        {/* Contextual info sections */}
        {studiesTouched && studiesTouched.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--field-supporting)", display: "block", marginBottom: 6 }}>
              Studios you'll touch today
            </span>
            <div className="flex items-center gap-[4px] flex-wrap">
              {studiesTouched.map(s => <StudioPill key={s} label={s} />)}
            </div>
          </div>
        )}

        {whatYoullDo && whatYoullDo.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--field-supporting)", display: "block", marginBottom: 4 }}>
              What you'll actually do
            </span>
            <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
              {whatYoullDo.map((item, i) => (
                <li key={i} style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.5 }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {helpText && (
          <div style={{
            background: "var(--color-surface-neutral-subtle, var(--canvas))",
            border: "0.5px solid var(--field-border)",
            borderRadius: 6,
            padding: "8px 10px",
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--field-supporting)", display: "block", marginBottom: 2 }}>If you need help</span>
            <span style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.4 }}>{helpText}</span>
          </div>
        )}
      </div>

      {/* CTA footer */}
      <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        <Button variant="primary" size="default" className="w-full justify-center" onClick={onStart}>
          Start with this
        </Button>
        <Button variant="secondary" size="default" className="w-full justify-center" onClick={onSkip}>
          Skip for now
        </Button>
        <span style={{ fontSize: 11, textAlign: "center", color: "var(--field-supporting)" }}>{dueLabel}</span>
      </div>
    </div>
  )
}
