import { useState } from "react"
import { MessageCircle, Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "./toast"

// ─────────────────────────────────────────────────────────────────────
// AgentTestPanel — the right-side "Test your Agent" chat area used by
// every 2-column agent-detail panel (Channels / Knowledge / Tools /
// Configuration / Instructions / Create).
//
// Description copy is per-tab (Channels talks about routing, Knowledge
// talks about sources, Instructions talks about persona, etc.).
// The composer holds local draft text, wires Cmd/Ctrl+Enter to send,
// and fires a toast — the real chat runtime is a follow-up but this
// gives the panel a lived-in feel instead of feeling frozen.
// ─────────────────────────────────────────────────────────────────────

interface AgentTestPanelProps {
  /** Copy shown under the "Test your Agent" title. */
  description: string
  /** Placeholder for the composer textarea. */
  placeholder: string
}

export function AgentTestPanel({ description, placeholder }: AgentTestPanelProps) {
  const toast = useToast()
  const [draft, setDraft] = useState("")

  const canSend = draft.trim().length > 0

  const send = () => {
    if (!canSend) return
    const preview = draft.trim().slice(0, 60)
    toast.info(`Test message sent — "${preview}${draft.length > 60 ? "…" : ""}"`)
    setDraft("")
  }

  return (
    <div
      className="flex-1 min-w-0 flex flex-col"
      style={{ borderLeft: "1px solid var(--color-border-neutral-default)", overflow: "hidden" }}
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
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Cmd/Ctrl+Enter sends. Plain Enter still adds a newline.
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={placeholder}
            rows={2}
            aria-label="Test message to agent"
            style={{
              width: "100%", padding: 4,
              fontSize: 13, color: "var(--color-text-title)",
              background: "transparent", border: "none", outline: "none",
              resize: "none", fontFamily: "inherit",
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="tertiary" size="sm"
              icon={<Paperclip size={13}/>} iconPosition="alone"
              aria-label="Attach file"
              onClick={() => toast.info("Attach a file to the test session")}
            />
            <div className="ml-auto">
              <Button
                variant="primary" size="sm"
                icon={<Send size={13}/>} iconPosition="alone"
                aria-label="Send test message"
                disabled={!canSend}
                onClick={send}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
