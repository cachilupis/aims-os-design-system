import { useState, useEffect } from "react"
import { Bot } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Button } from "@/components/ui/button"
import { Field, Divider, FormTextarea, NativeSelect, SectionLabel } from "./configure-shared"
import { AGENT_STATUS_OPTIONS, type VoiceAIAgent, type AIAgentStatus } from "./voice-agents-data"
import { AgentTestPanel } from "./AgentTestPanel"

// ─────────────────────────────────────────────────────────────────────
// CreatePanel — Agent "Create" sub-tab.
//
// NOTE: the source prototype (voice-channel-ux.html) declares Create /
// Configuration / Instructions as tab labels but doesn't ship panel
// content for them — its click handler falls back to the Tools panel.
// This panel is a sensible design based on standard AI-agent identity
// patterns, kept deliberately compact (5 fields) so it works whether
// this is the first thing an author sees or a later edit.
// ─────────────────────────────────────────────────────────────────────

interface CreatePanelProps {
  agent:    VoiceAIAgent
  onChange: (patch: VoiceAIAgent) => void
}

export function CreatePanel({ agent, onChange }: CreatePanelProps) {
  const [draft, setDraft] = useState<VoiceAIAgent>(agent)

  // Keep local draft in sync when the parent swaps agents (Alex → Sammy).
  useEffect(() => { setDraft(agent) }, [agent.id])

  const set = <K extends keyof VoiceAIAgent>(k: K, v: VoiceAIAgent[K]) =>
    setDraft(d => ({ ...d, [k]: v }))

  const dirty = draft !== agent && (
    draft.name !== agent.name
    || draft.purpose !== agent.purpose
    || draft.description !== agent.description
    || draft.status !== agent.status
  )

  const save   = () => onChange(draft)
  const revert = () => setDraft(agent)

  return (
    <div className="flex flex-row h-full" style={{ overflow: "hidden" }}>

      {/* Left — Identity form */}
      <div
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ padding: 24, borderRight: "1px solid var(--color-border-neutral-default)" }}
      >
        {/* Header */}
        <div className="mb-4">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
            Agent identity
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>
            The public name, purpose and lifecycle status shown wherever this agent appears.
          </div>
        </div>

        {/* Avatar preview card */}
        <CardContainer variant="default" size="default">
          <div className="flex items-center gap-4">
            <HighlightIcon
              icon={<Bot size={20}/>}
              variant={draft.status === "Published" ? "informative" : "neutral"}
              size="lg"
              iconColor="dark"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-title)" }}>
                {draft.name || "Untitled agent"}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-caption)", marginTop: 2 }}>
                {draft.purpose || "No purpose set"}
              </div>
            </div>
          </div>
        </CardContainer>

        {/* Fields */}
        <div className="flex flex-col gap-4 mt-4">
          <Field label="Name" hint="Short, human-readable name used across the workspace.">
            <Input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Sammy"
              size="default"
            />
          </Field>

          <Field label="Purpose" hint="One-line role — this shows next to the name everywhere.">
            <Input
              value={draft.purpose}
              onChange={(e) => set("purpose", e.target.value)}
              placeholder="e.g. Service Desk"
              size="default"
            />
          </Field>

          <Field label="Description" hint="Longer description for the agents list — 1–2 sentences.">
            <FormTextarea
              value={draft.description}
              onChange={(v) => set("description", v)}
              ariaLabel="Agent description"
              minHeight={80}
              rows={3}
            />
          </Field>

          <Divider/>

          <SectionLabel>Lifecycle</SectionLabel>
          <Field
            label="Status"
            hint="Published agents can take live traffic. Draft is authoring-only. Paused keeps it configured but off."
          >
            <NativeSelect
              value={draft.status}
              onChange={(v) => set("status", v as AIAgentStatus)}
              options={AGENT_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
            />
          </Field>
        </div>

        {/* Footer actions — only appear when there are unsaved changes */}
        {dirty && (
          <div className="flex items-center gap-2 mt-6 pt-4" style={{ borderTop: "1px solid var(--color-border-neutral-default)" }}>
            <Button variant="secondary" size="default" onClick={revert}>Revert</Button>
            <Button variant="primary"   size="default" onClick={save}>Save changes</Button>
          </div>
        )}
      </div>

      {/* Right — Test */}
      <AgentTestPanel
        description={`Send a message to preview how ${draft.name || "this agent"} introduces itself and handles first-turn intents.`}
        placeholder="Type your message…"
      />
    </div>
  )
}
