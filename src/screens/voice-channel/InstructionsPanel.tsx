import { useState, useEffect } from "react"
import { Plus, X, ArrowRight, Check } from "lucide-react"
import { CardContainer } from "@/components/ui/card-container"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, Divider, SectionLabel, FormTextarea } from "./configure-shared"
import { type VoiceAIAgent, type AgentInstructions } from "./voice-agents-data"
import { AgentTestPanel } from "./AgentTestPanel"

// ─────────────────────────────────────────────────────────────────────
// InstructionsPanel — Agent "Instructions" sub-tab.
//
// Prompt engineering: system prompt + persona + do/don't lists +
// few-shot examples. Not in the source prototype (see CreatePanel.tsx
// note). Kept flat rather than tabbed inside — a scan reads
// top-to-bottom the way an author actually writes prompts.
// ─────────────────────────────────────────────────────────────────────

interface InstructionsPanelProps {
  agent:    VoiceAIAgent
  onChange: (patch: VoiceAIAgent) => void
}

export function InstructionsPanel({ agent, onChange }: InstructionsPanelProps) {
  const [draft, setDraft] = useState<AgentInstructions>(agent.instructions)

  useEffect(() => { setDraft(agent.instructions) }, [agent.id])

  const set = <K extends keyof AgentInstructions>(k: K, v: AgentInstructions[K]) =>
    setDraft(d => ({ ...d, [k]: v }))

  const dirty =
    draft.systemPrompt !== agent.instructions.systemPrompt ||
    draft.persona      !== agent.instructions.persona      ||
    JSON.stringify(draft.dos)      !== JSON.stringify(agent.instructions.dos)      ||
    JSON.stringify(draft.donts)    !== JSON.stringify(agent.instructions.donts)    ||
    JSON.stringify(draft.examples) !== JSON.stringify(agent.instructions.examples)

  const save   = () => onChange({ ...agent, instructions: draft })
  const revert = () => setDraft(agent.instructions)

  // Bulleted list mutators — keep everything immutable, no in-place edits.
  const setDo    = (i: number, v: string) => set("dos",   draft.dos.map((x, idx) => idx === i ? v : x))
  const addDo    = ()                     => set("dos",   [...draft.dos,   ""])
  const rmDo     = (i: number)            => set("dos",   draft.dos.filter((_, idx) => idx !== i))
  const setDont  = (i: number, v: string) => set("donts", draft.donts.map((x, idx) => idx === i ? v : x))
  const addDont  = ()                     => set("donts", [...draft.donts, ""])
  const rmDont   = (i: number)            => set("donts", draft.donts.filter((_, idx) => idx !== i))

  const addExample = () =>
    set("examples", [...draft.examples, { user: "", agent: "" }])
  const rmExample = (i: number) =>
    set("examples", draft.examples.filter((_, idx) => idx !== i))
  const setExampleUser = (i: number, v: string) =>
    set("examples", draft.examples.map((x, idx) => idx === i ? { ...x, user:  v } : x))
  const setExampleAgent = (i: number, v: string) =>
    set("examples", draft.examples.map((x, idx) => idx === i ? { ...x, agent: v } : x))

  return (
    <div className="flex flex-row h-full" style={{ overflow: "hidden" }}>

      <div
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ padding: 24, borderRight: "1px solid var(--color-border-neutral-default)" }}
      >

        {/* Header */}
        <div className="mb-4">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
            Instructions
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>
            System prompt, persona, behavioural rules and few-shot examples that shape every response.
          </div>
        </div>

        {/* System Prompt */}
        <Field
          label="System prompt"
          hint="The primary behavioural instruction. Kept in-context on every turn."
        >
          <FormTextarea
            value={draft.systemPrompt}
            onChange={(v) => set("systemPrompt", v)}
            ariaLabel="System prompt"
            minHeight={140}
            rows={6}
          />
        </Field>

        <div className="mt-4"><Divider/></div>

        {/* Persona */}
        <div className="mt-4">
          <Field
            label="Persona"
            hint="Voice, tone and manner — short, descriptive, opinionated."
          >
            <FormTextarea
              value={draft.persona}
              onChange={(v) => set("persona", v)}
              ariaLabel="Persona description"
              minHeight={80}
              rows={3}
            />
          </Field>
        </div>

        <div className="mt-4"><Divider/></div>

        {/* Do's + Don'ts */}
        <div className="mt-4">
          <SectionLabel>Behavioural rules</SectionLabel>
        </div>
        <div className="flex gap-4 mt-2">
          <div style={{ flex: 1 }}>
            <div
              className="flex items-center gap-1"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 6 }}
            >
              <Check size={12} strokeWidth={2.5}/> Do
            </div>
            <div className="flex flex-col gap-2">
              {draft.dos.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Input value={s} onChange={(e) => setDo(i, e.target.value)} size="sm"/>
                  </div>
                  <IconButton onClick={() => rmDo(i)} ariaLabel="Remove"><X size={12}/></IconButton>
                </div>
              ))}
              <Button variant="tertiary" size="sm" icon={<Plus size={12}/>} onClick={addDo}>
                Add rule
              </Button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              className="flex items-center gap-1"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-error)", marginBottom: 6 }}
            >
              <X size={12} strokeWidth={2.5}/> Don't
            </div>
            <div className="flex flex-col gap-2">
              {draft.donts.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Input value={s} onChange={(e) => setDont(i, e.target.value)} size="sm"/>
                  </div>
                  <IconButton onClick={() => rmDont(i)} ariaLabel="Remove"><X size={12}/></IconButton>
                </div>
              ))}
              <Button variant="tertiary" size="sm" icon={<Plus size={12}/>} onClick={addDont}>
                Add rule
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4"><Divider/></div>

        {/* Few-shot examples */}
        <div className="mt-4 flex items-center justify-between">
          <SectionLabel>Example interactions</SectionLabel>
          <Button variant="tertiary" size="sm" icon={<Plus size={12}/>} onClick={addExample}>
            Add example
          </Button>
        </div>

        <div className="flex flex-col gap-3 mt-3">
          {draft.examples.length === 0 && (
            <div style={{
              padding: 12,
              fontSize: 12,
              color: "var(--color-text-caption)",
              fontStyle: "italic",
              textAlign: "center",
              background: "var(--color-surface-neutral-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--color-border-neutral-default)",
            }}>
              No examples yet. Few-shot examples improve consistency for edge cases.
            </div>
          )}
          {draft.examples.map((ex, i) => (
            <CardContainer key={i} variant="default" size="sm">
              <div className="flex items-start gap-2">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-caption)", marginBottom: 4 }}>
                    User
                  </div>
                  <FormTextarea
                    value={ex.user}
                    onChange={(v) => setExampleUser(i, v)}
                    ariaLabel={`Example ${i + 1} user turn`}
                    minHeight={40}
                    rows={2}
                  />
                  <div className="flex items-center gap-1 mt-2" style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
                    <ArrowRight size={11}/>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Agent
                    </span>
                  </div>
                  <FormTextarea
                    value={ex.agent}
                    onChange={(v) => setExampleAgent(i, v)}
                    ariaLabel={`Example ${i + 1} agent turn`}
                    minHeight={40}
                    rows={2}
                  />
                </div>
                <IconButton onClick={() => rmExample(i)} ariaLabel={`Remove example ${i + 1}`}>
                  <X size={13}/>
                </IconButton>
              </div>
            </CardContainer>
          ))}
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
        description={`Send a message to see how ${agent.name} applies these instructions turn by turn.`}
        placeholder="Type your message…"
      />
    </div>
  )
}

// ─── Small helper ───────────────────────────────────────────────────

function IconButton({
  onClick, children, ariaLabel,
}: { onClick: () => void; children: React.ReactNode; ariaLabel: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: 24, height: 24,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "transparent",
        border: "1px solid var(--color-border-neutral-default)",
        borderRadius: "var(--radius-sm)",
        color: "var(--color-text-caption)",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}
