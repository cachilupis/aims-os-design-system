import { useMemo, useState } from "react"
import { Bot, Phone, Mail, MessageSquare, MessageCircle, Search } from "lucide-react"
import { Filters } from "@/components/ui/filters"
import { Chip } from "@/components/ui/chip"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { EmptyState } from "@/components/ui/empty-state"
import type { VoiceAIAgent, AIAgentStatus, ChannelKind } from "./voice-agents-data"

// ─────────────────────────────────────────────────────────────────────
// VoiceAgentsTab — landing view for the Agents tab.
// Simple search + status filter, then a stacked card list of AI voice
// agents. Click a card to open VoiceAgentDetailPage.
// ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | AIAgentStatus

interface VoiceAgentsTabProps {
  agents:      VoiceAIAgent[]
  onOpenAgent: (id: string) => void
}

export function VoiceAgentsTab({ agents, onOpenAgent }: VoiceAgentsTabProps) {
  const [search, setSearch]       = useState("")
  const [filter, setFilter]       = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    return agents.filter(a => {
      if (filter !== "all" && a.status !== filter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return a.name.toLowerCase().includes(q)
          || a.purpose.toLowerCase().includes(q)
          || a.description.toLowerCase().includes(q)
    })
  }, [agents, filter, search])

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Filters
            showSearch
            searchPlaceholder="Search agents by name or purpose…"
            searchValue={search}
            onSearchChange={setSearch}
            showAllFilters={false}
            showSort={false}
            showViewToggle={false}
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "Published", "Draft", "Paused"] as const).map(k => (
            <Chip
              key={k}
              variant={filter === k ? "primary" : "secondary"}
              size="s"
              onClick={() => setFilter(k)}
            >
              {k === "all" ? "All" : k}
            </Chip>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <CardContainer variant="default" size="default">
          <EmptyState
            icon={search ? Search : Bot}
            title={search ? `No agents match "${search}"` : "No agents in this filter"}
            description={search ? "Try clearing your search." : "Try a different status filter."}
            ctaLabel={search ? "Clear search" : "Show all"}
            onCta={search ? () => setSearch("") : () => setFilter("all")}
          />
        </CardContainer>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(a => (
            <AgentCard key={a.id} agent={a} onOpen={() => onOpenAgent(a.id)}/>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Agent card ─────────────────────────────────────────────────────

const CHANNEL_ICON: Record<ChannelKind, React.ReactNode> = {
  voice:   <Phone size={13}/>,
  email:   <Mail size={13}/>,
  sms:     <MessageSquare size={13}/>,
  webchat: <MessageCircle size={13}/>,
}

function AgentCard({ agent, onOpen }: { agent: VoiceAIAgent; onOpen: () => void }) {
  const active = agent.channels.filter(c => c.active)
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        textAlign: "left",
        padding: 0, border: "none", background: "none", cursor: "pointer",
        display: "block", width: "100%",
      }}
    >
      <CardContainer variant="default" size="default">
        <div className="flex items-start gap-4">
          <HighlightIcon
            icon={<Bot size={18}/>}
            variant={agent.status === "Published" ? "informative" : "neutral"}
            size="lg"
            iconColor="dark"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-title)" }}>
                {agent.name}
              </span>
              <span style={{ fontSize: 13, color: "var(--color-text-caption)" }}>
                — {agent.purpose}
              </span>
              <Tag
                variant={agent.status === "Published" ? "success" : agent.status === "Draft" ? "secondary" : "alert"}
                size="sm"
              >
                {agent.status}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 4, lineHeight: 1.5 }}>
              {agent.description}
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <Stat label="Numbers assigned" value={agent.numbersAssigned.toString()}/>
              <Stat label="Calls 30d"        value={agent.callsHandled30d.toLocaleString()}/>
              <div className="flex items-center gap-1">
                {active.length === 0 ? (
                  <span style={{ fontSize: 11, color: "var(--color-text-caption)", fontStyle: "italic" }}>
                    No active channels
                  </span>
                ) : active.map(c => (
                  <span
                    key={c.kind}
                    title={c.kind}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 8px", fontSize: 11,
                      background: "var(--color-surface-neutral-subtle)",
                      border: "1px solid var(--color-border-neutral-default)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--color-text-title)",
                    }}
                  >
                    {CHANNEL_ICON[c.kind]}
                    <span style={{ textTransform: "capitalize" }}>{c.kind}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", flexShrink: 0 }}>
            Configure →
          </div>
        </div>
      </CardContainer>
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-title)", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
      <span style={{ fontSize: 10, color: "var(--color-text-caption)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
    </div>
  )
}
