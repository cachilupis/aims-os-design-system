import { useState, useEffect } from "react"
import { Cpu, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Button } from "@/components/ui/button"
import { Field, Divider, SectionLabel, ToggleRow, NativeSelect } from "./configure-shared"
import {
  MODEL_OPTIONS,
  TEMPERATURE_OPTIONS,
  FALLBACK_OPTIONS,
  type VoiceAIAgent,
  type AgentRuntimeConfig,
} from "./voice-agents-data"
import { AgentTestPanel } from "./AgentTestPanel"

// ─────────────────────────────────────────────────────────────────────
// ConfigurationPanel — Agent "Configuration" sub-tab.
//
// Runtime settings: model + creativity preset + response caps +
// guardrails + fallback behaviour. Not in the source prototype (see
// note in CreatePanel.tsx). Designed to be the smallest useful set —
// authors can dial in behaviour without a config sprawl.
// ─────────────────────────────────────────────────────────────────────

interface ConfigurationPanelProps {
  agent:    VoiceAIAgent
  onChange: (patch: VoiceAIAgent) => void
}

export function ConfigurationPanel({ agent, onChange }: ConfigurationPanelProps) {
  const [draft, setDraft] = useState<AgentRuntimeConfig>(agent.runtime)

  useEffect(() => { setDraft(agent.runtime) }, [agent.id])

  const set = <K extends keyof AgentRuntimeConfig>(k: K, v: AgentRuntimeConfig[K]) =>
    setDraft(d => ({ ...d, [k]: v }))

  const dirty =
    draft.model       !== agent.runtime.model      ||
    draft.temperature !== agent.runtime.temperature ||
    draft.maxTokens   !== agent.runtime.maxTokens  ||
    draft.timeoutSec  !== agent.runtime.timeoutSec ||
    draft.guardrails  !== agent.runtime.guardrails ||
    draft.piiBlocking !== agent.runtime.piiBlocking ||
    draft.fallback    !== agent.runtime.fallback

  const save   = () => onChange({ ...agent, runtime: draft })
  const revert = () => setDraft(agent.runtime)

  const tempPreset = TEMPERATURE_OPTIONS.find(t => t.id === draft.temperature)!
  const fallbackPreset = FALLBACK_OPTIONS.find(f => f.id === draft.fallback)!

  return (
    <div className="flex flex-row h-full" style={{ overflow: "hidden" }}>

      {/* Left — Runtime form */}
      <div
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ padding: 24, borderRight: "1px solid var(--color-border-neutral-default)" }}
      >
        {/* Header */}
        <div className="mb-4">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
            Runtime configuration
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>
            Which model powers this agent, how it behaves under load, and what it does when it can't answer.
          </div>
        </div>

        {/* Model card */}
        <CardContainer variant="default" size="default">
          <div className="flex items-start gap-3">
            <HighlightIcon icon={<Cpu size={18}/>} variant="informative" size="md" iconColor="dark"/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
                Model
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 12 }}>
                Currently: <strong style={{ color: "var(--color-text-title)" }}>{draft.model}</strong>
              </div>
              <NativeSelect
                value={draft.model}
                onChange={(v) => set("model", v)}
                options={MODEL_OPTIONS.map(m => ({ value: m, label: m }))}
              />
            </div>
          </div>
        </CardContainer>

        {/* Creativity preset */}
        <div className="mt-4">
          <Field
            label="Creativity"
            hint={tempPreset.desc}
          >
            <div
              role="tablist"
              aria-label="Creativity preset"
              style={{
                display: "inline-flex",
                padding: 2,
                background: "var(--color-surface-neutral-subtle)",
                border: "1px solid var(--color-border-neutral-default)",
                borderRadius: "var(--radius-md)",
              }}
            >
              {TEMPERATURE_OPTIONS.map(t => {
                const active = t.id === draft.temperature
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => set("temperature", t.id)}
                    style={{
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: active ? 600 : 500,
                      color:      active ? "var(--primary)" : "var(--color-text-caption)",
                      background: active ? "var(--color-surface-primary-more-subtle)" : "transparent",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </Field>
        </div>

        {/* Response caps — inline row */}
        <div className="flex gap-3 mt-4">
          <div style={{ flex: 1 }}>
            <Field label="Max response tokens" hint="Hard cap per turn.">
              <Input
                type="number"
                value={String(draft.maxTokens)}
                onChange={(e) => set("maxTokens", parseInt(e.target.value || "0", 10))}
                min={64}
                max={4096}
                step={64}
                size="default"
              />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Timeout (seconds)" hint="Give up after this many seconds.">
              <Input
                type="number"
                value={String(draft.timeoutSec)}
                onChange={(e) => set("timeoutSec", parseInt(e.target.value || "0", 10))}
                min={5}
                max={120}
                step={5}
                size="default"
              />
            </Field>
          </div>
        </div>

        <div className="mt-4"><Divider/></div>

        {/* Guardrails */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={13} style={{ color: "var(--color-text-caption)" }}/>
            <SectionLabel>Guardrails</SectionLabel>
          </div>
          <ToggleRow
            label="Content filter"
            desc="Block unsafe content and enforce safe-topic policies."
            checked={draft.guardrails}
            onChange={(v) => set("guardrails", v)}
          />
          <ToggleRow
            label="PII blocking"
            desc="Scrub personal identifiers from tool inputs and logs."
            checked={draft.piiBlocking}
            onChange={(v) => set("piiBlocking", v)}
            border={false}
          />
        </div>

        <div className="mt-4"><Divider/></div>

        {/* Fallback behaviour */}
        <div className="mt-4">
          <Field
            label="Fallback behaviour"
            hint={fallbackPreset.desc}
          >
            <NativeSelect
              value={draft.fallback}
              onChange={(v) => set("fallback", v as AgentRuntimeConfig["fallback"])}
              options={FALLBACK_OPTIONS.map(f => ({ value: f.id, label: f.label }))}
            />
          </Field>
        </div>

        {/* Footer actions */}
        {dirty && (
          <div className="flex items-center gap-2 mt-6 pt-4" style={{ borderTop: "1px solid var(--color-border-neutral-default)" }}>
            <Button variant="secondary" size="default" onClick={revert}>Revert</Button>
            <Button variant="primary"   size="default" onClick={save}>Save changes</Button>
          </div>
        )}
      </div>

      {/* Right — Test */}
      <AgentTestPanel
        description={`Send a message to see how ${agent.name} behaves with the current model and guardrails.`}
        placeholder="Type your message…"
      />
    </div>
  )
}
