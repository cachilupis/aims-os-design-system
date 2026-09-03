import { useState } from "react"
import {
  ArrowLeft,
  Plus, MoreHorizontal,
  Phone as PhoneIcon, Mail, MessageSquare, MessageCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon, type HighlightIconVariant } from "@/components/ui/highlight-icon"
import { Tag } from "@/components/ui/tag"
import type { PhoneNumberRecord } from "./data"
import type {
  VoiceAIAgent, AIChannel, ChannelKind, VoiceConfig, SmsConfig, EmailConfig, AIAgentStatus,
} from "./voice-agents-data"
import { DEFAULT_SMS_CONFIG, DEFAULT_EMAIL_CONFIG, AGENT_STATUS_OPTIONS } from "./voice-agents-data"
import { NativeSelect } from "./configure-shared"
import { ConfigureVoiceSlideOut } from "./ConfigureVoiceSlideOut"
import { ConfigureSmsSlideOut }   from "./ConfigureSmsSlideOut"
import { ConfigureEmailSlideOut } from "./ConfigureEmailSlideOut"
import { KnowledgePanel } from "./KnowledgePanel"
import { ToolsPanel } from "./ToolsPanel"
import { CreatePanel } from "./CreatePanel"
import { ConfigurationPanel } from "./ConfigurationPanel"
import { InstructionsPanel } from "./InstructionsPanel"
import { AgentTestPanel } from "./AgentTestPanel"
import { useToast } from "./toast"

// ─────────────────────────────────────────────────────────────────────
// VoiceAgentDetailPage — 1:1 port of the Agent detail page in
// voice-channel-ux.html.
//
// All six sub-tabs are populated: Create, Configuration, Knowledge,
// Instructions, Tools, and Channels — each delegated to its own panel
// component. Every panel receives `agent` + `onChange` so edits flow
// back through the top-level VoiceAgents reducer.
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
  /** Click-through from a number chip → Voice → Numbers → number detail. */
  onOpenNumber?:   (numberId: string) => void
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
  agent, onBack, onChange, numbers, onOpenNumber,
}: VoiceAgentDetailPageProps) {
  const toast = useToast()
  const [subTab,    setSubTab]    = useState<AgentSubTab>("channels")
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [smsOpen,   setSmsOpen]   = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)

  const voiceChannel = agent.channels.find(c => c.kind === "voice")
  const smsChannel   = agent.channels.find(c => c.kind === "sms")
  const emailChannel = agent.channels.find(c => c.kind === "email")

  const handleSaveVoice = (next: VoiceConfig) => {
    onChange({
      ...agent,
      channels: agent.channels.map(c =>
        c.kind === "voice" ? { ...c, voice: next, active: true } : c
      ),
    })
  }
  const handleSaveSms = (next: SmsConfig) => {
    onChange({
      ...agent,
      channels: agent.channels.map(c =>
        c.kind === "sms" ? { ...c, sms: next, active: true } : c
      ),
    })
  }
  const handleSaveEmail = (next: EmailConfig) => {
    onChange({
      ...agent,
      channels: agent.channels.map(c =>
        c.kind === "email" ? { ...c, email: next, active: true } : c
      ),
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Agent toolbar ────────────────────────────────────────
          The DS Header (rendered by the outer ScreenLayout) already
          carries the agent name + status subtitle for this screen, so
          this row drops the duplicated title and only exposes the
          detail-scoped controls: back-to-list, publish state and the
          Actions menu. */}
      <div className="flex items-center gap-3 px-1 pb-3" style={{ borderBottom: "1px solid var(--color-border-neutral-default)" }}>
        <button
          onClick={onBack}
          aria-label="Back to Agents list"
          className="flex items-center gap-2"
          style={{
            padding: "4px 10px",
            height: 28, borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "1px solid var(--color-border-neutral-default)",
            cursor: "pointer",
            fontSize: 12, fontWeight: 500,
            color: "var(--color-text-caption)",
          }}
        >
          <ArrowLeft size={14}/>
          Agents
        </button>
        {/* Status picker — fixed compact width so it reads as a pill,
            not a full-width form field. Matches the source prototype's
            "Published ▾" chip next to the title. */}
        <div style={{ width: 140 }}>
          <NativeSelect
            value={agent.status}
            onChange={(v) => onChange({ ...agent, status: v as AIAgentStatus })}
            options={AGENT_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
            size="sm"
          />
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
            numbers={numbers}
            onOpenNumber={onOpenNumber}
            onAddChannel={() => toast.info("Pick a channel to add to this agent")}
            onConfigure={(kind) => {
              if (kind === "voice") setVoiceOpen(true)
              else if (kind === "sms")   setSmsOpen(true)
              else if (kind === "email") setEmailOpen(true)
              else toast.info("Set up Web Chat in the Chat Widget manager")
            }}
          />
        ) : subTab === "knowledge" ? (
          <KnowledgePanel
            agentName={agent.name}
            onOpenGovernance={() => toast.info("Open Governance Studio → Knowledge Library")}
            onEditPack={(id)     => toast.info(`Open pack editor for ${id}`)}
            onPreviewPack={(id)  => toast.info(`Preview pack ${id}`)}
            onUploadFile={()     => toast.info("Open file uploader")}
            onDownloadFile={(id) => toast.info(`Download file ${id}`)}
          />
        ) : subTab === "tools" ? (
          <ToolsPanel
            agent={agent}
            numbers={numbers}
            onOpenNumber={onOpenNumber}
            onConfigureVoice={() => setVoiceOpen(true)}
            onAddTool={() => toast.info("Browse the tool catalog to add capabilities to this agent")}
          />
        ) : subTab === "create" ? (
          <CreatePanel        agent={agent} onChange={(patch) => { onChange(patch); toast.success("Agent identity saved") }}/>
        ) : subTab === "configuration" ? (
          <ConfigurationPanel agent={agent} onChange={(patch) => { onChange(patch); toast.success("Runtime configuration saved") }}/>
        ) : (
          <InstructionsPanel  agent={agent} onChange={(patch) => { onChange(patch); toast.success("Instructions saved") }}/>
        )}
      </div>

      {/* ── Configure Voice slide-out ────────────────────────────── */}
      {voiceChannel?.voice && (
        <ConfigureVoiceSlideOut
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          agentName={`${agent.name} — ${agent.purpose}`}
          numbers={numbers}
          numberIds={voiceChannel.numberIds ?? []}
          config={voiceChannel.voice}
          onSave={handleSaveVoice}
          onAddNumbers={(ids) => onChange({
            ...agent,
            channels: agent.channels.map(c => c.kind === "voice"
              ? { ...c, numberIds: Array.from(new Set([...(c.numberIds ?? []), ...ids])) }
              : c),
          })}
        />
      )}

      {/* ── Configure SMS slide-out ──────────────────────────────── */}
      <ConfigureSmsSlideOut
        open={smsOpen}
        onClose={() => setSmsOpen(false)}
        agentName={`${agent.name} — ${agent.purpose}`}
        numbers={numbers}
        numberIds={smsChannel?.numberIds ?? []}
        config={smsChannel?.sms ?? DEFAULT_SMS_CONFIG}
        onSave={handleSaveSms}
        onAddNumbers={(ids) => onChange({
          ...agent,
          channels: agent.channels.map(c => c.kind === "sms"
            ? { ...c, numberIds: Array.from(new Set([...(c.numberIds ?? []), ...ids])) }
            : c),
        })}
      />

      {/* ── Configure Email slide-out ────────────────────────────── */}
      <ConfigureEmailSlideOut
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        agentName={`${agent.name} — ${agent.purpose}`}
        addressIds={emailChannel?.addressIds ?? []}
        config={emailChannel?.email ?? DEFAULT_EMAIL_CONFIG}
        onSave={handleSaveEmail}
        onAddAddresses={(ids) => onChange({
          ...agent,
          channels: agent.channels.map(c => c.kind === "email"
            ? { ...c, addressIds: Array.from(new Set([...(c.addressIds ?? []), ...ids])) }
            : c),
        })}
      />
    </div>
  )
}

// ─── Channels panel ─────────────────────────────────────────────────

// Per-channel visual signature: HighlightIcon variant + Lucide icon +
// human label. Matches the source prototype's channel accents.
const CHANNEL_META: Record<ChannelKind, {
  label:       string
  Icon:        LucideIcon
  iconVariant: HighlightIconVariant
}> = {
  voice:   { label: "Voice",    Icon: PhoneIcon,     iconVariant: "informative" },
  email:   { label: "Email",    Icon: Mail,          iconVariant: "success"     },
  sms:     { label: "SMS",      Icon: MessageSquare, iconVariant: "yellow"      },
  webchat: { label: "Web Chat", Icon: MessageCircle, iconVariant: "light-blue"  },
}

function ChannelsPanel({
  channels, onConfigure, numbers, onOpenNumber, onAddChannel,
}: {
  channels:      AIChannel[]
  onConfigure:   (kind: ChannelKind) => void
  numbers:       PhoneNumberRecord[]
  onOpenNumber?: (numberId: string) => void
  onAddChannel:  () => void
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
          <Button variant="secondary" size="sm" icon={<Plus size={12}/>} onClick={onAddChannel}>Add Channel</Button>
        </div>

        <div className="flex flex-col gap-3">
          {channels.map(ch => (
            <ChannelCard
              key={ch.kind}
              channel={ch}
              numbers={numbers}
              onOpenNumber={onOpenNumber}
              onConfigure={() => onConfigure(ch.kind)}
            />
          ))}
        </div>
      </div>

      {/* Right — Test your Agent (shared component) */}
      <AgentTestPanel
        description="Send a message to preview how the agent responds across its active channels."
        placeholder="Type your message…"
      />

    </div>
  )
}

// ─── ChannelCard — one CardContainer per channel row ───────────────

function ChannelCard({
  channel, numbers, onOpenNumber, onConfigure,
}: {
  channel:       AIChannel
  numbers:       PhoneNumberRecord[]
  onOpenNumber?: (numberId: string) => void
  onConfigure:   () => void
}) {
  const meta = CHANNEL_META[channel.kind]
  const Icon = meta.Icon
  const isConfigured = channel.active
  const numberRecords = (channel.numberIds ?? [])
    .map(id => numbers.find(n => n.id === id))
    .filter((n): n is NonNullable<typeof n> => !!n)
  const hasChips = numberRecords.length > 0 || channel.pills.length > 0

  return (
    <CardContainer variant="default" size="default">
      <div className="flex items-start gap-3">
        <HighlightIcon icon={<Icon size={16}/>} variant={meta.iconVariant} size="md" iconColor="dark"/>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)" }}>
              {meta.label}
            </span>
            <Tag variant={isConfigured ? "success" : "neutral"} size="sm">
              {isConfigured ? "Active" : "Inactive"}
            </Tag>
          </div>

          <div style={{ fontSize: 12, color: "var(--color-text-caption)", lineHeight: 1.5 }}>
            {channel.summary}
          </div>

          {hasChips && (
            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 8 }}>
              {numberRecords.map(n => (
                <Tag
                  key={n.id}
                  variant="lightBlue"
                  size="sm"
                  leadingIcon={<PhoneIcon size={10}/>}
                >
                  {n.number}
                </Tag>
              ))}
              {channel.pills.map((p, i) => (
                <Tag key={i} variant="lightBlue" size="sm">{p}</Tag>
              ))}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <Button
            variant={isConfigured ? "secondary" : "primary"}
            size="sm"
            onClick={onConfigure}
          >
            {isConfigured ? "Configure" : "Set up"}
          </Button>
        </div>
      </div>

      {/* Deep-link footer — opens the primary number's detail when the
          channel has one. Kept separate from Configure so the primary
          action stays unambiguous. */}
      {numberRecords[0] && onOpenNumber && (
        <div
          onClick={() => onOpenNumber(numberRecords[0].id)}
          style={{
            marginTop: 10, paddingTop: 8,
            borderTop: "1px solid var(--color-border-neutral-default)",
            fontSize: 11, fontWeight: 500,
            color: "var(--color-icon-primary-default)",
            cursor: "pointer",
          }}
        >
          Open {numberRecords[0].number} →
        </div>
      )}
    </CardContainer>
  )
}

