import { Plus, Phone as PhoneIcon, Mail, Bell, Search as SearchIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon, type HighlightIconVariant } from "@/components/ui/highlight-icon"
import { Tag, type TagVariant } from "@/components/ui/tag"
import type { VoiceAIAgent } from "./voice-agents-data"
import type { PhoneNumberRecord } from "./data"
import { AgentTestPanel } from "./AgentTestPanel"
import { useToast } from "./toast"

// ─────────────────────────────────────────────────────────────────────
// ToolsPanel — Agent detail's "Tools" sub-tab.
//
// Each tool renders as its own CardContainer with icon + title + state
// Tag + description + tags row + Configure action, matching the pack
// card pattern used in KnowledgePanel. Voice pulls its live config
// from the agent so the row's meta reflects the active number, voice
// model and recording flag.
// ─────────────────────────────────────────────────────────────────────

interface ToolsPanelProps {
  agent:            VoiceAIAgent
  numbers:          PhoneNumberRecord[]
  onOpenNumber?:    (numberId: string) => void
  onConfigureVoice: () => void
  onAddTool:        () => void
}

interface ToolCardData {
  id:            string
  icon:          LucideIcon
  iconVariant:   HighlightIconVariant
  title:         string
  description:   string
  stateLabel:    string
  stateVariant:  TagVariant
  numberChip?:   { label: string; onClick?: () => void }
  tags?:         string[]
  actionLabel:   string
  actionVariant: "primary" | "secondary"
  onAction:      () => void
}

export function ToolsPanel({
  agent, numbers, onOpenNumber, onConfigureVoice, onAddTool,
}: ToolsPanelProps) {
  const toast = useToast()
  const stubConfigure = (toolName: string) =>
    toast.info(`${toolName} configuration opens in Governance Studio.`)
  const voiceChannel = agent.channels.find(c => c.kind === "voice")
  const isVoiceConfigured = !!voiceChannel?.active && !!voiceChannel?.voice
  const cfg = voiceChannel?.voice

  const primaryNumberRecord =
    (cfg?.numberId ? numbers.find(n => n.id === cfg.numberId) : undefined)
    ?? (voiceChannel?.numberIds?.[0]
        ? numbers.find(n => n.id === voiceChannel.numberIds![0])
        : undefined)

  const voiceCapabilities: string[] = isVoiceConfigured && cfg
    ? [
        cfg.inbound.enabled  ? "Inbound"   : null,
        cfg.outbound.enabled ? "Outbound"  : null,
        cfg.callRecording    ? "Recording" : null,
        "Script attached",
      ].filter((s): s is string => !!s)
    : []

  const voiceDescription = isVoiceConfigured && cfg
    ? `${voiceCapabilities.slice(0, 2).join(" + ") || "No direction"} · ${cfg.voiceName} (${cfg.voiceModel}) · ${cfg.callRecording ? "Recording on" : "Recording off"} · Service Intake script attached`
    : "Voice channel is not active. Configure it in the Channels tab to enable this tool."

  const tools: ToolCardData[] = [
    {
      id:            "voice",
      icon:          PhoneIcon,
      iconVariant:   "informative",
      title:         "Voice",
      description:   voiceDescription,
      stateLabel:    isVoiceConfigured ? "Configured" : "Inactive",
      stateVariant:  isVoiceConfigured ? "success"    : "neutral",
      numberChip:    primaryNumberRecord
        ? {
            label:   primaryNumberRecord.number,
            onClick: onOpenNumber ? () => onOpenNumber(primaryNumberRecord.id) : undefined,
          }
        : undefined,
      tags:          voiceCapabilities,
      actionLabel:   isVoiceConfigured ? "Configure" : "Set up",
      actionVariant: isVoiceConfigured ? "secondary" : "primary",
      onAction:      onConfigureVoice,
    },
    {
      id:            "send-email",
      icon:          Mail,
      iconVariant:   "success",
      title:         "Send Email",
      description:   "Send emails to communicate information or interact with other people.",
      stateLabel:    "Ready to use",
      stateVariant:  "success",
      actionLabel:   "Configure",
      actionVariant: "secondary",
      onAction:      () => stubConfigure("Send Email"),
    },
    {
      id:            "hil-alert",
      icon:          Bell,
      iconVariant:   "yellow",
      title:         "Human in the Loop Alert",
      description:   "Sends notifications or alerts to involve a human operator when manual intervention is required.",
      stateLabel:    "Ready to use",
      stateVariant:  "alert",
      actionLabel:   "Configure",
      actionVariant: "secondary",
      onAction:      () => stubConfigure("Human in the Loop Alert"),
    },
    {
      id:            "web-search",
      icon:          SearchIcon,
      iconVariant:   "light-blue",
      title:         "Web Search",
      description:   "Search the internet for up-to-date information to answer questions or assist with research tasks.",
      stateLabel:    "Ready to use",
      stateVariant:  "informative",
      actionLabel:   "Configure",
      actionVariant: "secondary",
      onAction:      () => stubConfigure("Web Search"),
    },
  ]

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
          {tools.map(t => <ToolCard key={t.id} tool={t}/>)}
        </div>
      </div>

      {/* ── Right pane: Test your Agent ────────────────────────── */}
      <AgentTestPanel
        description={`Use this simulated chat to see how ${agent.name} responds when it calls its tools.`}
        placeholder="Type your message…"
      />
    </div>
  )
}

// ─── ToolCard — one CardContainer per row ─────────────────────────

function ToolCard({ tool }: { tool: ToolCardData }) {
  const Icon = tool.icon
  const hasChips = !!tool.numberChip || (tool.tags && tool.tags.length > 0)
  return (
    <CardContainer variant="default" size="default">
      <div className="flex items-start gap-3">
        <HighlightIcon icon={<Icon size={16}/>} variant={tool.iconVariant} size="md" iconColor="dark"/>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)" }}>
              {tool.title}
            </span>
            <Tag variant={tool.stateVariant} size="sm">{tool.stateLabel}</Tag>
          </div>

          <div style={{ fontSize: 12, color: "var(--color-text-caption)", lineHeight: 1.5 }}>
            {tool.description}
          </div>

          {hasChips && (
            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 8 }}>
              {tool.numberChip && (
                <Tag
                  variant="lightBlue"
                  size="sm"
                  leadingIcon={<PhoneIcon size={10}/>}
                >
                  {tool.numberChip.label}
                </Tag>
              )}
              {tool.tags?.map((t, i) => (
                <Tag key={i} variant="lightBlue" size="sm">{t}</Tag>
              ))}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <Button variant={tool.actionVariant} size="sm" onClick={tool.onAction}>
            {tool.actionLabel}
          </Button>
        </div>
      </div>
    </CardContainer>
  )
}
