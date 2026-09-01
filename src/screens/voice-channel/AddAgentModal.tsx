import { useEffect, useMemo, useState } from "react"
import { Search, Check } from "lucide-react"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Input } from "@/components/ui/input"
import { AGENTS, type PhoneNumberRecord } from "./data"
import { AgentAvatar, AgentStatusDot } from "./shared"

interface AddAgentModalProps {
  number:    PhoneNumberRecord | null
  open:      boolean
  onClose:   () => void
  onConfirm: (agentIds: string[]) => void
}

export function AddAgentModal({ number, open, onClose, onConfirm }: AddAgentModalProps) {
  const [query,    setQuery]    = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) { setQuery(""); setSelected(new Set()) }
  }, [open])

  const list = useMemo(() => {
    return AGENTS.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
  }, [query])

  const alreadyAssigned = new Set(number?.agents ?? [])

  function toggle(id: string) {
    if (alreadyAssigned.has(id)) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <ModalDialog
      isOpen={open}
      onClose={onClose}
      variant="content"
      tone="default"
      iconName="Users"
      title="Add Agents"
      description={number ? `To ${number.number}` : undefined}
      slot={
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search agents…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            leftIcon={<Search size={14}/>}
            size="default"
          />

          <div className="flex flex-col gap-1" style={{ maxHeight: 360, overflowY: "auto" }}>
            {list.map(a => {
              const isAssigned = alreadyAssigned.has(a.id)
              const isSel      = selected.has(a.id)
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  disabled={isAssigned}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    border: `1px solid ${isSel ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                    borderRadius: 8,
                    background: isSel ? "var(--color-surface-primary-more-subtle)" : "transparent",
                    cursor: isAssigned ? "not-allowed" : "pointer",
                    opacity: isAssigned ? 0.55 : 1,
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `1.5px solid ${isSel ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                    background: isSel ? "var(--primary)" : "transparent",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: "var(--primary-foreground)", flexShrink: 0,
                  }}>
                    {isSel && <Check size={12}/>}
                  </span>
                  <AgentAvatar color={a.color} initials={a.initials} size={26}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
                      {isAssigned ? "Already assigned" : a.email}
                    </div>
                  </div>
                  <AgentStatusDot status={a.status}/>
                </button>
              )
            })}
            {list.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "var(--color-text-caption)" }}>
                No agents match your search.
              </div>
            )}
          </div>
        </div>
      }
      ctaSecondary={{ label: "Cancel", onClick: onClose }}
      ctaPrimary={{
        label:    selected.size === 0 ? "Add Selected (0)" : `Add Selected (${selected.size})`,
        disabled: selected.size === 0,
        onClick:  () => onConfirm(Array.from(selected)),
      }}
    />
  )
}
