import { useState } from "react"
import { ArrowLeft, Download, FileText, Sparkles, BarChart3, PhoneCall, User } from "lucide-react"
import { Tabs } from "@/components/ui/tabs"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { CardContainer } from "@/components/ui/card-container"
import { AGENTS, TRANSCRIPT, type Call, type PhoneNumberRecord } from "./data"
import { AgentAvatar, SentimentTag } from "./shared"

type DetailTab = "transcript" | "summary" | "metrics"

interface CallDetailPageProps {
  call:    Call
  number:  PhoneNumberRecord | null
  onBack:  () => void
}

// ─────────────────────────────────────────────────────────────────────
// Full-page Call detail view. Rendered in place of the Call History
// table when a call is opened via the preview slide-out's
// "View full details →" CTA. Header shows caller identity + meta,
// followed by a chip row and 3 sub-tabs (Transcript / AI Summary /
// Metrics).
// ─────────────────────────────────────────────────────────────────────

export function CallDetailPage({ call, number, onBack }: CallDetailPageProps) {
  const [tab, setTab] = useState<DetailTab>("transcript")
  const agent = AGENTS.find(a => a.id === call.agent) ?? null

  return (
    <div className="flex flex-col gap-4">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Button variant="tertiary" size="sm" icon={<ArrowLeft size={13}/>} iconPosition="left" onClick={onBack}>
          Back to Call History
        </Button>
      </div>

      {/* Identity + meta card */}
      <CardContainer variant="default" size="default">
        <div className="flex items-start gap-4">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-title)" }}>
                {call.caller}
              </h2>
              {call.direction === "inbound"
                ? <Tag variant="success"     size="sm">↙ Inbound</Tag>
                : <Tag variant="informative" size="sm">↗ Outbound</Tag>}
              <Tag variant="neutral" size="sm">Ended</Tag>
              {call.hil && <Tag variant="purple" size="sm">HiL Handoff</Tag>}
              <SentimentTag s={call.sentiment}/>
              <Tag variant="secondary" size="sm">${call.cost.toFixed(2)}</Tag>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-caption)", marginTop: 6 }}>
              {number?.number ? `${number.number} · ` : ""}{call.ts} · {call.duration}
              {agent ? ` · ${agent.name}` : ""}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="secondary" size="default" icon={<Download size={13}/>} iconPosition="left">
              Export
            </Button>
          </div>
        </div>
      </CardContainer>

      {/* Context cards */}
      <div className="grid grid-cols-2 gap-3">
        {number && (
          <CardContainer variant="default" size="sm">
            <div className="flex items-center gap-2 mb-2">
              <PhoneCall size={12} style={{ color: "var(--color-icon-neutral-default)" }}/>
              <span style={microLabel}>Number</span>
            </div>
            <div className="font-mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>{number.number}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{number.label || "No label"} · {number.type}</div>
          </CardContainer>
        )}
        {agent && (
          <CardContainer variant="default" size="sm">
            <div className="flex items-center gap-2 mb-2">
              <User size={12} style={{ color: "var(--color-icon-neutral-default)" }}/>
              <span style={microLabel}>Handled By</span>
            </div>
            <div className="flex items-center gap-3">
              <AgentAvatar color={agent.color} initials={agent.initials} size={28}/>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{agent.name}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{agent.email}</div>
              </div>
              <Tag variant="secondary" size="sm">{agent.role}</Tag>
            </div>
          </CardContainer>
        )}
      </div>

      {/* Sub-tabs */}
      <Tabs
        items={[
          { id: "transcript", label: "Transcript", icon: FileText  },
          { id: "summary",    label: "AI Summary", icon: Sparkles  },
          { id: "metrics",    label: "Metrics",    icon: BarChart3 },
        ]}
        activeId={tab}
        onChange={(id) => setTab(id as DetailTab)}
      />

      {/* Body */}
      <CardContainer variant="default" size="default">
        {tab === "transcript" && <Transcript/>}
        {tab === "summary"    && <Summary/>}
        {tab === "metrics"    && <Metrics call={call} agent={agent}/>}
      </CardContainer>
    </div>
  )
}

// ── Transcript view (chat bubbles + HiL divider) ───────────────────────

function Transcript() {
  return (
    <div className="flex flex-col gap-3">
      {TRANSCRIPT.map((line, i) => {
        if (line.divider) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--primary)", opacity: 0.4 }}/>
              <span style={{
                fontSize: 11, fontWeight: 700, color: "var(--primary)",
                padding: "4px 10px", border: "1px solid var(--primary)",
                borderRadius: 9999,
                background: "var(--color-surface-primary-more-subtle)",
              }}>
                🛡 {line.text}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--primary)", opacity: 0.4 }}/>
            </div>
          )
        }
        const roleLabel =
          line.role === "caller" ? "CALLER" :
          line.role === "agent"  ? "AI AGENT" :
          "AGENT (Jordan Kim)"
        const isCaller = line.role === "caller"
        const alignRight = !isCaller
        const bg =
          line.role === "caller" ? "var(--color-surface-neutral-more-subtle)" :
          line.role === "agent"  ? "var(--color-surface-primary-more-subtle)" :
          "var(--color-surface-neutral-white)"
        const border =
          line.role === "hil" ? "1px solid var(--primary)" : "1px solid var(--color-border-neutral-default)"
        return (
          <div key={i} style={{ display: "flex", justifyContent: alignRight ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%",
              padding: "10px 14px",
              borderRadius: 10,
              background: bg,
              border,
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-caption)" }}>{roleLabel}</div>
              <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--color-text-title)" }}>{line.text}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-caption)", textAlign: alignRight ? "right" : "left" }}>{line.t}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── AI Summary view ────────────────────────────────────────────────────

function Summary() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div style={microLabel}>Summary</div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-title)", marginTop: 6 }}>
          Customer Maria Garcia called regarding an account lockout due to repeated failed login attempts. The AI agent diagnosed the issue and initiated an account unlock, but the customer requested human assistance. Agent Jordan Kim resolved the issue and sent a password reset link.
        </p>
      </div>

      <div>
        <div style={microLabel}>Key Topics</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {["Account lockout", "Login issue", "Password reset"].map(t => (
            <Chip key={t} variant="primary" size="s">{t}</Chip>
          ))}
        </div>
      </div>

      <div>
        <div style={microLabel}>Action Items</div>
        <ul style={{ fontSize: 13, color: "var(--color-text-body)", lineHeight: 1.6, paddingLeft: 16, marginTop: 6 }}>
          <li>Verify Maria's account security settings</li>
          <li>Follow up if login issue persists within 24h</li>
        </ul>
      </div>
    </div>
  )
}

// ── Metrics view ───────────────────────────────────────────────────────

function Metrics({ call, agent }: { call: Call; agent: { name: string } | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <MetricTile value={call.duration}                                                                            label="Duration"  />
        <MetricTile value={call.sentiment === "negative" ? "0.31" : call.sentiment === "positive" ? "0.82" : "0.55"} label="Sentiment"
                    color={call.sentiment === "negative" ? "var(--color-text-error)" : call.sentiment === "positive" ? "var(--color-text-success)" : undefined}/>
        <MetricTile value={`$${call.cost.toFixed(2)}`}                                                               label="Cost"     />
      </div>

      <div className="flex flex-col gap-2">
        <MetricRow label="HiL Triggered"      value={call.hil ? <Tag variant="purple" size="sm">Yes — 0:51</Tag> : <span style={{ color: "var(--color-text-caption)" }}>No</span>}/>
        <MetricRow label="HiL Trigger Reason" value={call.hil ? "Negative sentiment + customer request" : "—"}/>
        <MetricRow label="Assigned Agent"     value={agent?.name ?? "—"}/>
        <MetricRow label="Time to Handoff"    value={call.hil ? "12 seconds" : "—"}/>
        <MetricRow label="AI Turns"           value="8"/>
        <MetricRow label="Human Turns"        value={call.hil ? "4" : "0"}/>
        <MetricRow label="Resolution"         value={<Tag variant="success" size="sm">Resolved</Tag>}/>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────

const microLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
  color: "var(--color-text-caption)",
}

function MetricTile({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <CardContainer variant="default" size="sm">
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? "var(--color-text-title)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{label}</div>
    </CardContainer>
  )
}

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 12px",
      borderBottom: "1px solid var(--color-border-neutral-default)",
    }}>
      <span style={{ fontSize: 12, color: "var(--color-text-caption)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--color-text-title)" }}>{value}</span>
    </div>
  )
}
