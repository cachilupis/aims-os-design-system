import { useState } from "react"
import { MessageCircle, Paperclip, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContainer } from "@/components/ui/card-container"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "./toast"

// ─────────────────────────────────────────────────────────────────────
// AgentTestPanel — the right-side "Test your Agent" chat area used by
// every 2-column agent-detail panel (Channels / Knowledge / Tools /
// Configuration / Instructions / Create).
//
// Composer uses the DS Textarea inside a CardContainer so the input
// surface reads as one DS-native "chat box" component rather than a
// bespoke bordered div wrapping a raw <textarea>. Primary action is a
// labelled "Try me" button (Sparkles icon) — Cmd/Ctrl+Enter still
// submits from anywhere in the textarea.
// ─────────────────────────────────────────────────────────────────────

interface AgentTestPanelProps {
  /** Copy shown under the "Test your Agent" title. */
  description: string
  /** Placeholder for the composer textarea. */
  placeholder: string
  /** Label of the primary CTA — defaults to "Try me". */
  ctaLabel?: string
}

export function AgentTestPanel({ description, placeholder, ctaLabel = "Try me" }: AgentTestPanelProps) {
  const toast = useToast()
  const [draft, setDraft] = useState("")

  const canSend = draft.trim().length > 0

  const send = () => {
    if (!canSend) {
      toast.info(`Type a message and hit ${ctaLabel} to preview the agent's response.`)
      return
    }
    const preview = draft.trim().slice(0, 60)
    toast.info(`Test message sent — "${preview}${draft.length > 60 ? "…" : ""}"`)
    setDraft("")
  }

  return (
    <div
      className="w-[380px] shrink-0 flex flex-col"
      style={{
        // Distinct surface — subtle contrast against the main content
        // so the panel reads as its own workspace, not a strip glued to
        // the right edge.
        background: "var(--color-surface-neutral-subtle)",
        borderLeft: "1px solid var(--color-border-neutral-default)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{ padding: "12px 20px", borderBottom: "1px solid var(--color-border-neutral-default)" }}
      >
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "var(--color-text-caption)",
        }}>
          Test your Agent
        </span>
        <span
          role="status"
          aria-label="Simulator ready"
          title="Simulator ready"
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-text-success)" }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ textAlign: "center" }}>
        <MessageCircle size={40} style={{ color: "var(--color-icon-primary-default)", marginBottom: 12 }}/>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>
          Test your Agent
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-caption)", maxWidth: 320 }}>
          {description}
        </div>
      </div>

      {/* Composer — DS CardContainer + DS Textarea + Try me CTA.
          Cmd/Ctrl+Enter sends from anywhere in the textarea. */}
      <div style={{ padding: 12 }}>
        <CardContainer variant="default" size="sm">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={placeholder}
            aria-label="Test message to agent"
            expand
            className="!border-none !bg-transparent !p-0 min-h-[44px]"
          />
          <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
            <Button
              variant="tertiary" size="sm"
              icon={<Paperclip size={13}/>} iconPosition="alone"
              aria-label="Attach file"
              onClick={() => toast.info("Attach a file to the test session")}
            />
            <div className="ml-auto">
              <Button
                variant="primary" size="sm"
                icon={<Sparkles size={13}/>} iconPosition="left"
                disabled={!canSend}
                onClick={send}
              >
                {ctaLabel}
              </Button>
            </div>
          </div>
        </CardContainer>
      </div>
    </div>
  )
}
