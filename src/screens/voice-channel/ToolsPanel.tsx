import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntityList, type EntityListItemData } from "@/components/ui/entity-list"
import type { VoiceAIAgent } from "./voice-agents-data"
import type { PhoneNumberRecord } from "./data"
import { AgentTestPanel } from "./AgentTestPanel"
import { useToast } from "./toast"

// ─────────────────────────────────────────────────────────────────────
// ToolsPanel — Agent detail's "Tools" sub-tab.
//
// Uses the DS EntityList for every tool row so icon variant, title,
// description, capability tags and Configure action are consistent
// with the Agents list on the parent tab. Voice pulls its live config
// from the agent so its row's meta reflects the active number, voice
// model and recording flag.
// ─────────────────────────────────────────────────────────────────────

interface ToolsPanelProps {
  agent:            VoiceAIAgent
  numbers:          PhoneNumberRecord[]
  onOpenNumber?:    (numberId: string) => void
  onConfigureVoice: () => void
  onAddTool:        () => void
}

export function ToolsPanel({
  agent, numbers, onOpenNumber, onConfigureVoice, onAddTool,
}: ToolsPanelProps) {
  const toast = useToast()
  const stubConfigure = (toolName: string) =>
    toast.info(`${toolName} configuration lives in Governance Studio — jumping there in a future release.`)
  const voiceChannel = agent.channels.find(c => c.kind === "voice")
  const isVoiceConfigured = !!voiceChannel?.active && !!voiceChannel?.voice
  const cfg = voiceChannel?.voice

  // Resolve the currently-focused number for the Voice tool row.
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

  // Every tool is an EntityListItemData row so the same DS component
  // renders all four in one pass — no bespoke card wrappers.
  const items: EntityListItemData[] = [
    {
      id:          "voice",
      iconVariant: "info",
      iconName:    "Phone",
      title:       "Voice",
      description: voiceDescription,
      primaryMeta: primaryNumberRecord
        ? [{ iconName: "Phone", label: primaryNumberRecord.number, tooltip: primaryNumberRecord.label || undefined }]
        : undefined,
      state: isVoiceConfigured
        ? { label: "Configured", variant: "success" }
        : { label: "Inactive",   variant: "neutral" },
      tags: voiceCapabilities.map(c => ({ label: c })),
      // Omit `icon` so EntityList renders the label ("Configure" /
      // "Set up") instead of collapsing to an icon-only button.
      actions: isVoiceConfigured
        ? [{ label: "Configure", variant: "secondary", onClick: onConfigureVoice }]
        : [{ label: "Set up",    variant: "primary",   onClick: onConfigureVoice }],
      onClick: primaryNumberRecord && onOpenNumber
        ? () => onOpenNumber(primaryNumberRecord.id)
        : undefined,
    },
    {
      id:          "send-email",
      iconVariant: "success",
      iconName:    "Mail",
      title:       "Send Email",
      description: "Send emails to communicate information or interact with other people.",
      state:       { label: "Ready to use", variant: "success" },
      actions:     [{ label: "Configure", variant: "secondary", onClick: () => stubConfigure("Send Email") }],
    },
    {
      // EntityList's iconVariant vocabulary uses "yellow" for the
      // amber/warning slot; matches the source prototype's alert-dark.
      id:          "hil-alert",
      iconVariant: "yellow",
      iconName:    "Bell",
      title:       "Human in the Loop Alert",
      description: "Sends notifications or alerts to involve a human operator when manual intervention is required.",
      state:       { label: "Ready to use", variant: "alert" },
      actions:     [{ label: "Configure", variant: "secondary", onClick: () => stubConfigure("Human in the Loop Alert") }],
    },
    {
      id:          "web-search",
      iconVariant: "light-blue",
      iconName:    "Search",
      title:       "Web Search",
      description: "Search the internet for up-to-date information to answer questions or assist with research tasks.",
      state:       { label: "Ready to use", variant: "informative" },
      actions:     [{ label: "Configure", variant: "secondary", onClick: () => stubConfigure("Web Search") }],
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

        <EntityList items={items}/>
      </div>

      {/* ── Right pane: Test your Agent ────────────────────────── */}
      <AgentTestPanel
        description={`Use this simulated chat to see how ${agent.name} responds when it calls its tools.`}
        placeholder="Type your instructions here..."
      />
    </div>
  )
}
