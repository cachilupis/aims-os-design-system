import {
  Phone, Mail, Bell, Search, Settings, Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Tag } from "@/components/ui/tag"
import { AgentTestPanel } from "./AgentTestPanel"
import type { VoiceAIAgent, AIChannel } from "./voice-agents-data"
import type { PhoneNumberRecord } from "./data"

// ─────────────────────────────────────────────────────────────────────
// ToolsPanel — port of the Agent detail's "Tools" sub-tab from
// voice-channel-ux.html.
//
// Layout mirrors Channels + Knowledge tabs:
//   left  — Tool Library header + Add + card list
//   right — Test your Agent (mock)
//
// The 4 tools mirror the source prototype exactly:
//   1. Voice          — configured, opens ConfigureVoiceSlideOut
//   2. Send Email     — Ready to use
//   3. Human in the Loop Alert — Ready to use
//   4. Web Search     — Ready to use
//
// Voice's "configured" state pulls its meta from the agent's Voice
// channel (number, voice, capabilities) so the Tools card stays in
// sync with what Channels shows.
// ─────────────────────────────────────────────────────────────────────

interface ToolsPanelProps {
  agent:            VoiceAIAgent
  numbers:          PhoneNumberRecord[]
  onOpenNumber?:    (numberId: string) => void
  onConfigureVoice: () => void
  onAddTool:        () => void
}

export function ToolsPanel({ agent, numbers, onOpenNumber, onConfigureVoice, onAddTool }: ToolsPanelProps) {
  const voiceChannel = agent.channels.find(c => c.kind === "voice")

  return (
    <div className="flex flex-row h-full" style={{ overflow: "hidden" }}>

      {/* ── Left pane: Tool Library ────────────────────────────── */}
      <div
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ padding: 24, borderRight: "1px solid var(--color-border-neutral-default)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
              Tool Library
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>
              Give the agent extra abilities to act, respond, or automate.
            </div>
          </div>
          <Button variant="secondary" size="sm" icon={<Plus size={12}/>} onClick={onAddTool}>Add</Button>
        </div>

        <div className="flex flex-col gap-3">
          <VoiceToolCard
            channel={voiceChannel ?? null}
            numbers={numbers}
            onOpenNumber={onOpenNumber}
            onConfigure={onConfigureVoice}
          />
          <ReadyToolCard
            icon={<Mail size={16}/>}
            tone="success"
            name="Send Email"
            desc="Send emails to communicate information or interact with other people."
          />
          <ReadyToolCard
            icon={<Bell size={16}/>}
            tone="alert"
            name="Human in the Loop Alert"
            desc="Sends notifications or alerts to involve a human operator when manual intervention is required."
          />
          <ReadyToolCard
            icon={<Search size={16}/>}
            tone="light-blue"
            name="Web Search"
            desc="Search the internet for up-to-date information to answer questions or assist with research tasks."
          />
        </div>
      </div>

      {/* ── Right pane: Test your Agent ────────────────────────── */}
      <AgentTestPanel
        description={`Use this simulated chat to see how ${agent.name} responds when it calls its tools.`}
        placeholder="Type your instructions here..."
      />
    </div>
  )
}

// ─── Voice tool card (configured — mirrors Voice channel state) ─────

function VoiceToolCard({
  channel, numbers, onOpenNumber, onConfigure,
}: {
  channel:       AIChannel | null
  numbers:       PhoneNumberRecord[]
  onOpenNumber?: (numberId: string) => void
  onConfigure:   () => void
}) {
  const isConfigured = !!channel?.active && !!channel?.voice
  const cfg = channel?.voice

  // Primary phone number surfaced next to the "Voice" name. Prefer the
  // config's numberId (source of truth) — falls back to the first channel
  // pill so the card still renders when config is missing.
  const primaryNumberRecord = cfg?.numberId ? numbers.find(n => n.id === cfg.numberId) : undefined
  const primaryNumberText   = primaryNumberRecord?.number
    ?? channel?.pills.find(p => p.startsWith("+"))
    ?? "Not assigned"

  const capabilities: string[] = isConfigured && cfg
    ? [
        cfg.inbound.enabled  ? "Inbound"  : null,
        cfg.outbound.enabled ? "Outbound" : null,
        cfg.callRecording    ? "Recording" : null,
        "Script attached",
      ].filter((s): s is string => !!s)
    : []

  const desc = isConfigured && cfg
    ? `${capabilities.slice(0, 2).join(" + ") || "No direction"} · ${cfg.voiceName} (${cfg.voiceModel}) · ${cfg.callRecording ? "Recording on" : "Recording off"} · Service Intake script attached`
    : "Voice channel is not active. Configure it in the Channels tab to enable this tool."

  return (
    // Voice tool stays on the default card variant. The "configured"
    // state is signalled by the informative HighlightIcon + primary
    // click-through on the number chip (fix #10 from the design
    // critique) instead of a saturated purple fill — that treatment
    // was too loud in the Tools grid where 4 cards sit side by side.
    <CardContainer variant="default" size="default">
      <div className="flex items-start gap-3">
        <HighlightIcon icon={<Phone size={16}/>} variant="informative" size="md" iconColor="dark"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>
              Voice
            </span>
            {isConfigured ? (
              primaryNumberRecord && onOpenNumber ? (
                <button
                  type="button"
                  onClick={() => onOpenNumber(primaryNumberRecord.id)}
                  aria-label={`Open ${primaryNumberText} in Numbers`}
                  className="font-mono"
                  style={{
                    background: "transparent", border: "none", padding: 0,
                    fontSize: 12, fontWeight: 500,
                    color: "var(--primary)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                  }}
                >
                  {primaryNumberText}
                </button>
              ) : (
                <span
                  className="font-mono"
                  style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-caption)" }}
                >
                  {primaryNumberText}
                </span>
              )
            ) : (
              <Tag variant="secondary" size="sm">Inactive</Tag>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 4, lineHeight: 1.5 }}>
            {desc}
          </div>
          {capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {capabilities.map(c => <CapPill key={c}>{c}</CapPill>)}
            </div>
          )}
        </div>
        {isConfigured && (
          <div style={{ flexShrink: 0 }}>
            <Button variant="secondary" size="sm" icon={<Settings size={12}/>} onClick={onConfigure}>
              Configure
            </Button>
          </div>
        )}
      </div>
    </CardContainer>
  )
}

// ─── Ready-to-use tool card (Send Email / HiL / Web Search) ─────────

// Map each tool's tone to a Tag variant so the "Ready to use" badge
// reads as a signature per tool rather than as three identical stamps.
const TONE_TO_TAG: Record<"success" | "alert" | "light-blue", "success" | "alert" | "lightBlue"> = {
  "success":    "success",
  "alert":      "alert",
  "light-blue": "lightBlue",
}

function ReadyToolCard({
  icon, tone, name, desc,
}: {
  icon: React.ReactNode
  tone: "success" | "alert" | "light-blue"
  name: string
  desc: string
}) {
  return (
    <CardContainer variant="default" size="default">
      <div className="flex items-start gap-3">
        <HighlightIcon icon={<>{icon}</>} variant={tone} size="md" iconColor="dark"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 4, lineHeight: 1.5 }}>
            {desc}
          </div>
          <div className="mt-2">
            <Tag variant={TONE_TO_TAG[tone]} size="sm">Ready to use</Tag>
          </div>
        </div>
      </div>
    </CardContainer>
  )
}

function CapPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        fontSize: 11,
        color: "var(--color-text-caption)",
        background: "var(--color-surface-neutral-subtle)",
        border: "1px solid var(--color-border-neutral-default)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {children}
    </span>
  )
}

// ─── Test your Agent (matches Channels / Knowledge pattern) ─────────

