import { useState } from "react"
import {
  ArrowLeft, ChevronDown, Phone, Mail, MessageSquare, MessageCircle,
  Plus, Paperclip, Send, Settings, MoreHorizontal,
} from "lucide-react"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { EmptyState } from "@/components/ui/empty-state"
import type { PhoneNumberRecord } from "./data"
import type { VoiceAIAgent, AIChannel, ChannelKind, VoiceConfig } from "./voice-agents-data"
import { ConfigureVoiceSlideOut } from "./ConfigureVoiceSlideOut"

// ─────────────────────────────────────────────────────────────────────
// VoiceAgentDetailPage — 1:1 port of the Agent detail page in
// voice-channel-ux.html.
//
// Six sub-tabs (Create · Configuration · Knowledge · Instructions ·
// Tools · Channels). Only Channels is populated in this iteration —
// the other five render an EmptyState with "Coming soon" copy, in
// preparation for follow-up ports.
//
// The Channels body is a two-column layout: left has the list of
// Communication Channels (Voice / Email / SMS / Web Chat), each with
// a Configure button that opens the corresponding slide-out. Right
// has a "Test your Agent" panel (mock, disabled input) matching the
// source prototype's simulated-chat area.
// ─────────────────────────────────────────────────────────────────────

interface VoiceAgentDetailPageProps {
  agent:   VoiceAIAgent
  onBack:  () => void
  onChange: (patch: VoiceAIAgent) => void
  numbers: PhoneNumberRecord[]
  onOpenAddNumber: () => void
}

type AgentSubTab = "create" | "configuration" | "knowledge" | "instructions" | "tools" | "channels"

const SUB_TABS: TabItem[] = [
  { id: "create",        label: "Create"        },
  { id: "configuration", label: "Configuration" },
  { id: "knowledge",     label: "Knowledge"     },
  { id: "instructions",  label: "Instructions"  },
  { id: "tools",         label: "Tools"         },
  { id: "channels",      label: "Channels"      },
]

export function VoiceAgentDetailPage({
  agent, onBack, onChange, numbers, onOpenAddNumber,
}: VoiceAgentDetailPageProps) {
  const [subTab,    setSubTab]    = useState<AgentSubTab>("channels")
  const [voiceOpen, setVoiceOpen] = useState(false)

  const voiceChannel = agent.channels.find(c => c.kind === "voice")

  const handleSaveVoice = (next: VoiceConfig) => {
    onChange({
      ...agent,
      channels: agent.channels.map(c =>
        c.kind === "voice" ? { ...c, voice: next, active: true } : c
      ),
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Agent header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-1 pb-3" style={{ borderBottom: "1px solid var(--color-border-neutral-default)" }}>
        <button
          onClick={onBack}
          aria-label="Back to Agents list"
          style={{
            width: 28, height: 28, borderRadius: "var(--radius-md)",
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--color-text-caption)",
          }}
        >
          <ArrowLeft size={18}/>
        </button>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-title)" }}>
          {agent.name} — {agent.purpose}
        </div>
        <div
          className="flex items-center gap-1"
          style={{
            padding: "4px 12px",
            border: "1px solid var(--color-border-neutral-default)",
            borderRadius: "var(--radius-md)",
            fontSize: 13, fontWeight: 500,
            color: "var(--color-text-label)",
            cursor: "pointer",
          }}
        >
          {agent.status}
          <ChevronDown size={13}/>
        </div>
        <div className="ml-auto">
          <Button variant="secondary" size="sm" icon={<MoreHorizontal size={14}/>} iconPosition="right">
            Actions
          </Button>
        </div>
      </div>

      {/* ── Sub-tabs ─────────────────────────────────────────────── */}
      <div className="px-1 pt-2" style={{ borderBottom: "1px solid var(--color-border-neutral-default)" }}>
        <Tabs items={SUB_TABS} activeId={subTab} onChange={(id) => setSubTab(id as AgentSubTab)}/>
      </div>

      {/* ── Panels ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {subTab === "channels" ? (
          <ChannelsPanel
            channels={agent.channels}
            onConfigureVoice={() => setVoiceOpen(true)}
            onSetup={(kind) => {
              // For inactive channels, activate first — the actual config
              // slide-out is stubbed in this iteration for non-voice kinds.
              onChange({
                ...agent,
                channels: agent.channels.map(c => c.kind === kind ? { ...c, active: true } : c),
              })
            }}
          />
        ) : (
          <PlaceholderPanel subTab={subTab} agentName={agent.name}/>
        )}
      </div>

      {/* ── Configure Voice slide-out ────────────────────────────── */}
      {voiceChannel?.voice && (
        <ConfigureVoiceSlideOut
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          agentName={`${agent.name} — ${agent.purpose}`}
          numbers={numbers}
          config={voiceChannel.voice}
          onSave={handleSaveVoice}
          onAddNumber={onOpenAddNumber}
        />
      )}
    </div>
  )
}

// ─── Channels panel ─────────────────────────────────────────────────

function ChannelsPanel({
  channels, onConfigureVoice, onSetup,
}: {
  channels: AIChannel[]
  onConfigureVoice: () => void
  onSetup: (kind: ChannelKind) => void
}) {
  return (
    <div className="flex flex-row h-full" style={{ overflow: "hidden" }}>

      {/* Left — Communication Channels list */}
      <div
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ padding: 24, borderRight: "1px solid var(--color-border-neutral-default)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
              Communication Channels
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>
              Configure the channels this agent uses to interact with contacts.
            </div>
          </div>
          <Button variant="secondary" size="sm" icon={<Plus size={12}/>}>Add Channel</Button>
        </div>

        <div className="flex flex-col gap-3">
          {channels.map(ch => (
            <ChannelCard
              key={ch.kind}
              channel={ch}
              onConfigure={ch.kind === "voice" ? onConfigureVoice : () => onSetup(ch.kind)}
            />
          ))}
        </div>
      </div>

      {/* Right — Test your Agent */}
      <div
        className="flex-1 min-w-0 flex flex-col"
        style={{ borderLeft: "1px solid var(--color-border-neutral-default)", overflow: "hidden" }}
      >
        <div
          className="flex items-center gap-2"
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid var(--color-border-neutral-default)",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-caption)" }}>
            Test your Agent
          </span>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--color-text-success)",
          }}/>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ textAlign: "center" }}>
          <MessageCircle size={40} style={{ color: "var(--color-icon-primary-default)", marginBottom: 12 }}/>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>
            Test your Agent
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-caption)", maxWidth: 320 }}>
            Send a message to preview how the agent responds across its active channels.
          </div>
        </div>

        <div style={{ padding: 12, borderTop: "1px solid var(--color-border-neutral-default)" }}>
          <div
            style={{
              padding: 8,
              background: "var(--field-bg)",
              border: "1px solid var(--field-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <textarea
              placeholder="Type your message…"
              rows={2}
              aria-label="Test message to channel"
              style={{
                width: "100%",
                padding: "4px 4px",
                fontSize: 13,
                color: "var(--color-text-title)",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
              }}
            />
            <div className="flex items-center gap-2">
              <Button variant="tertiary" size="sm" icon={<Paperclip size={13}/>} iconPosition="alone" aria-label="Attach file"/>
              <div className="ml-auto">
                <Button variant="primary" size="sm" icon={<Send size={13}/>} iconPosition="alone" aria-label="Send test message"/>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Channel card ───────────────────────────────────────────────────

const CHANNEL_META: Record<ChannelKind, {
  label: string
  icon:  React.ReactNode
  tone:  "informative" | "success" | "alert" | "light-blue"
}> = {
  voice:   { label: "Voice",    icon: <Phone size={16}/>,          tone: "informative" },
  email:   { label: "Email",    icon: <Mail size={16}/>,           tone: "success"     },
  sms:     { label: "SMS",      icon: <MessageSquare size={16}/>,  tone: "alert"       },
  webchat: { label: "Web Chat", icon: <MessageCircle size={16}/>,  tone: "light-blue"  },
}

function ChannelCard({ channel, onConfigure }: { channel: AIChannel; onConfigure: () => void }) {
  const meta = CHANNEL_META[channel.kind]
  const isConfigured = channel.active

  return (
    <CardContainer
      variant={isConfigured ? "purple" : "default"}
      size="default"
    >
      <div className="flex items-start gap-3">
        <HighlightIcon icon={<>{meta.icon}</>} variant={meta.tone} size="md" iconColor="dark"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>
              {meta.label}
            </span>
            <Tag variant={isConfigured ? "success" : "secondary"} size="sm">
              {isConfigured ? "Active" : "Inactive"}
            </Tag>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 4, lineHeight: 1.4 }}>
            {channel.summary}
          </div>
          {channel.pills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {channel.pills.map(p => (
                <span
                  key={p}
                  style={{
                    padding: "2px 8px",
                    fontSize: 11,
                    color: "var(--color-text-caption)",
                    background: "var(--color-surface-neutral-subtle)",
                    border: "1px solid var(--color-border-neutral-default)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          {isConfigured
            ? <Button variant="secondary" size="sm" icon={<Settings size={12}/>} onClick={onConfigure}>Configure</Button>
            : <Button variant="primary"   size="sm" icon={<Plus size={12}/>}     onClick={onConfigure}>Set up</Button>}
        </div>
      </div>
    </CardContainer>
  )
}

// ─── Placeholder for the other 5 sub-tabs ───────────────────────────

function PlaceholderPanel({ subTab, agentName }: { subTab: AgentSubTab; agentName: string }) {
  const map: Record<AgentSubTab, { title: string; desc: string }> = {
    create:        { title: "Create",        desc: "Basic identity, purpose and lifecycle of the agent." },
    configuration: { title: "Configuration", desc: "Model, temperature, guardrails and other runtime settings." },
    knowledge:     { title: "Knowledge",     desc: "Knowledge Packs, Shared Drives and Own Documents the agent can read." },
    instructions:  { title: "Instructions",  desc: "System prompt, persona and behavioural rules." },
    tools:         { title: "Tools",         desc: "Callable tools this agent can use — Voice, Send Email, HiL Alert, Web Search." },
    channels:      { title: "Channels",      desc: "Communication channels this agent uses." },
  }
  const info = map[subTab]
  return (
    <div className="flex items-center justify-center h-full" style={{ padding: 24 }}>
      <div style={{ maxWidth: 480 }}>
        <EmptyState
          icon={Settings}
          title={`${info.title} — coming soon`}
          description={`${info.desc} This tab will be ported for ${agentName} in the next iteration.`}
        />
      </div>
    </div>
  )
}
