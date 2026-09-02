import { PhoneCall, ArrowRight, User, MessageSquare } from "lucide-react"
import { SlideOut } from "@/components/ui/slide-out"
import { Tag } from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { AGENTS, type Call, type PhoneNumberRecord } from "./data"
import { AgentAvatar, HilBadge, SentimentTag } from "./shared"

interface CallPreviewProps {
  call:       Call | null
  number:     PhoneNumberRecord | null
  open:       boolean
  onClose:    () => void
  onOpenFull: () => void
}

// ─────────────────────────────────────────────────────────────────────
// Lightweight preview slide-out for a single call in Call History.
// Surfaces the essentials (caller, direction, agent, sentiment, HiL,
// duration, cost) plus a two-line transcript teaser, and hands off to
// the full detail page (Transcript / AI Summary / Metrics) via
// "View full details →".
// ─────────────────────────────────────────────────────────────────────

export function CallPreview({ call, number, open, onClose, onOpenFull }: CallPreviewProps) {
  if (!call) return null

  const agent = AGENTS.find(a => a.id === call.agent) ?? null
  // First real exchange from the transcript — used as the teaser.
  // Prefer the call's own transcript so the teaser matches the call
  // the user is previewing; when no per-call intel exists we hide the
  // teaser entirely rather than showing the generic mock (which used
  // to make every preview look identical).
  const transcript = call.intel?.transcript ?? null
  const firstCallerLine = transcript?.find(t => t.role === "caller" && !t.divider)
  const firstAgentLine  = transcript?.find(t => t.role === "agent"  && !t.divider)
  const hasTeaser       = !!(firstCallerLine || firstAgentLine)

  return (
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      // Title stays short; caller number is displayed prominently in
      // the body's first line so it never truncates in the SlideOut
      // header column (same treatment as NumberSheet).
      title="Call preview"
      subtitle={`${call.ts} · ${call.duration}`}
      iconContent={<PhoneCall size={18}/>}
      showStatus={false}
      showTabs={false}
      showChips={false}
      showSearchBar={false}
      showCta={true}
      ctaPrimaryLabel="View full details →"
      ctaSecondaryLabel="Close"
      onCtaPrimary={onOpenFull}
      onCtaSecondary={onClose}
    >
      <div className="flex flex-col gap-4 px-6 py-4">

        {/* Full caller number — mono, tabular, no-wrap, in the body so
            it never truncates in the SlideOut header column. */}
        <div
          className="font-mono"
          style={{
            fontSize: 18, fontWeight: 700,
            color: "var(--color-text-title)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {call.caller}
        </div>
        {number && (
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: -8 }}>
            via {number.number} — {number.label || "No label"}
          </div>
        )}

        {/* Meta chips row */}
        <div className="flex flex-wrap gap-2">
          {call.direction === "inbound"
            ? <Tag variant="success"     size="sm">↙ Inbound</Tag>
            : <Tag variant="informative" size="sm">↗ Outbound</Tag>}
          <Tag variant="neutral" size="sm">Ended</Tag>
          {call.hil && <HilBadge hil={true}/>}
          <SentimentTag s={call.sentiment}/>
          <Tag variant="secondary" size="sm">${call.cost.toFixed(2)}</Tag>
        </div>

        {/* Assigned agent */}
        {agent && (
          <CardContainer variant="default" size="sm">
            <SectionLabel icon={<User size={12}/>}>Handled By</SectionLabel>
            <div className="flex items-center gap-3 mt-2">
              <AgentAvatar color={agent.color} initials={agent.initials} size={32}/>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{agent.name}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{agent.email}</div>
              </div>
              <Tag variant="secondary" size="sm">{agent.role}</Tag>
            </div>
          </CardContainer>
        )}

        {/* Attached number context */}
        {number && (
          <CardContainer variant="default" size="sm">
            <SectionLabel icon={<PhoneCall size={12}/>}>Number</SectionLabel>
            <div className="mt-2">
              <div className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{number.number}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{number.label || "No label"} · {number.type}</div>
            </div>
          </CardContainer>
        )}

        {/* Transcript teaser (first two lines). Only rendered when
            the call ships its own transcript — no generic mock. */}
        {hasTeaser && (
          <CardContainer variant="default" size="sm">
            <SectionLabel icon={<MessageSquare size={12}/>}>Transcript Preview</SectionLabel>
            <div className="flex flex-col gap-2 mt-2">
              {firstAgentLine && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-caption)" }}>AI AGENT · {firstAgentLine.t}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-title)", lineHeight: 1.4 }}>{firstAgentLine.text}</div>
                </div>
              )}
              {firstCallerLine && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-caption)" }}>CALLER · {firstCallerLine.t}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-title)", lineHeight: 1.4 }}>{firstCallerLine.text}</div>
                </div>
              )}
            </div>
          </CardContainer>
        )}

        {/* Hint */}
        <div className="flex items-center gap-2" style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
          <ArrowRight size={12}/>
          <span>Full transcript, AI Summary and Metrics live in the full view.</span>
        </div>

      </div>
    </SlideOut>
  )
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
      color: "var(--color-text-caption)",
    }}>
      {icon}<span>{children}</span>
    </div>
  )
}
