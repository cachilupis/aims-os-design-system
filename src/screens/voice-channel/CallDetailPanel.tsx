import { useState } from "react"
import { X, Download, FileText, Sparkles, BarChart3 } from "lucide-react"
import { Tabs } from "@/components/ui/tabs"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { CardContainer } from "@/components/ui/card-container"
import { AGENTS, TRANSCRIPT, type Call, type PhoneNumberRecord } from "./data"
import { SentimentTag } from "./shared"

type DetailTab = "transcript" | "summary" | "metrics"

interface CallDetailPanelProps {
  call:    Call
  number:  PhoneNumberRecord | null
  onClose: () => void
}

export function CallDetailPanel({ call, number, onClose }: CallDetailPanelProps) {
  const [tab, setTab] = useState<DetailTab>("transcript")
  const agent = AGENTS.find(a => a.id === call.agent)

  return (
    <CardContainer variant="default" size="default" className="!p-0 overflow-hidden">
      <div className="flex flex-col" style={{ maxHeight: 600 }}>
        {/* Header */}
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-border-neutral-default)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ minWidth: 0 }}>
            <div className="font-mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>{call.caller}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
              {number?.number} · {call.ts} · {call.duration}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Button variant="tertiary" size="sm" icon={<Download size={12}/>} iconPosition="left">Export</Button>
            <Button
              variant="tertiary" size="sm" icon={<X size={13}/>} iconPosition="alone"
              onClick={onClose}
              aria-label="Close call detail"
            />
          </div>
        </div>

        {/* Chip row */}
        <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--color-border-neutral-default)", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {call.direction === "inbound"
            ? <Tag variant="success" size="sm">↙ Inbound</Tag>
            : <Tag variant="informative" size="sm">↗ Outbound</Tag>}
          <Tag variant="neutral" size="sm">Ended</Tag>
          {call.hil && <Tag variant="purple" size="sm">HiL Handoff</Tag>}
          <SentimentTag s={call.sentiment}/>
          <Tag variant="secondary" size="sm">${call.cost.toFixed(2)}</Tag>
        </div>

        {/* Sub-tabs */}
        <div style={{ padding: "8px 16px 0" }}>
          <Tabs
            items={[
              { id: "transcript", label: "Transcript", icon: FileText  },
              { id: "summary",    label: "AI Summary", icon: Sparkles  },
              { id: "metrics",    label: "Metrics",    icon: BarChart3 },
            ]}
            activeId={tab}
            onChange={(id) => setTab(id as DetailTab)}
            size="s"
          />
        </div>

        {/* Body */}
        <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
          {tab === "transcript" && <Transcript/>}
          {tab === "summary"    && <Summary/>}
          {tab === "metrics"    && <Metrics call={call} agent={agent}/>}
        </div>
      </div>
    </CardContainer>
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
              padding: "8px 12px",
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
        <SectionLabel>Summary</SectionLabel>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-title)" }}>
          Customer Maria Garcia called regarding an account lockout due to repeated failed login attempts. The AI agent diagnosed the issue and initiated an account unlock, but the customer requested human assistance. Agent Jordan Kim resolved the issue and sent a password reset link.
        </p>
      </div>

      <div>
        <SectionLabel>Key Topics</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {["Account lockout", "Login issue", "Password reset"].map(t => (
            <Chip key={t} variant="primary" size="s">{t}</Chip>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Action Items</SectionLabel>
        <ul style={{ fontSize: 13, color: "var(--color-text-body)", lineHeight: 1.6, paddingLeft: 16 }}>
          <li>Verify Maria's account security settings</li>
          <li>Follow up if login issue persists within 24h</li>
        </ul>
      </div>
    </div>
  )
}

// ── Metrics view ───────────────────────────────────────────────────────

function Metrics({ call, agent }: { call: Call; agent?: { name: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
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

// ── Small helpers ──────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
      color: "var(--color-text-caption)", marginBottom: 6,
    }}>{children}</div>
  )
}

function MetricTile({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <CardContainer variant="default" size="sm">
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? "var(--color-text-title)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{label}</div>
    </CardContainer>
  )
}

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px",
      borderBottom: "1px solid var(--color-border-neutral-default)",
    }}>
      <span style={{ fontSize: 12, color: "var(--color-text-caption)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--color-text-title)" }}>{value}</span>
    </div>
  )
}
