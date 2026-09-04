import { useMemo, useState } from "react"
import { Bot, Search, Hash, Phone as PhoneIcon } from "lucide-react"
import { Filters } from "@/components/ui/filters"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { CardContainer } from "@/components/ui/card-container"
import { EmptyState } from "@/components/ui/empty-state"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Tag, type TagVariant } from "@/components/ui/tag"
import type { VoiceAIAgent, AIAgentStatus } from "./voice-agents-data"

// ─────────────────────────────────────────────────────────────────────
// VoiceAgentsTab — landing view for the Agents section.
//
// Each agent renders as its own CardContainer with icon + title +
// meta + state tag + active-channel chips + Configure action, matching
// the pack-card pattern already used in KnowledgePanel, ToolsPanel,
// and ChannelsPanel.
// ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | AIAgentStatus

interface VoiceAgentsTabProps {
  agents:      VoiceAIAgent[]
  onOpenAgent: (id: string) => void
}

const STATE_FOR: Record<AIAgentStatus, { label: string; variant: TagVariant }> = {
  Published: { label: "Published", variant: "success" },
  Draft:     { label: "Draft",     variant: "neutral" },
  Paused:    { label: "Paused",    variant: "alert"   },
}

export function VoiceAgentsTab({ agents, onOpenAgent }: VoiceAgentsTabProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StatusFilter>("all")

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

// ─── AgentCard — one CardContainer per agent row ─────────────────

function AgentCard({ agent, onOpen }: { agent: VoiceAIAgent; onOpen: () => void }) {
  const state = STATE_FOR[agent.status]
  const activeKinds = agent.channels.filter(c => c.active).map(c => c.kind)
  return (
    <CardContainer variant="default" size="default">
      <div className="flex items-start gap-3">
        <HighlightIcon
          icon={<Bot size={16}/>}
          variant={agent.status === "Published" ? "informative" : "neutral"}
          size="md"
          iconColor="dark"
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)" }}>
              {agent.name} — {agent.purpose}
            </span>
            <Tag variant={state.variant} size="sm">{state.label}</Tag>
          </div>

          <div style={{ fontSize: 12, color: "var(--color-text-caption)", lineHeight: 1.5 }}>
            {agent.description}
          </div>

          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 8 }}>
            <Tag variant="lightBlue" size="sm" leadingIcon={<Hash size={10}/>}>
              {agent.numbersAssigned} number{agent.numbersAssigned === 1 ? "" : "s"}
            </Tag>
            <Tag variant="lightBlue" size="sm" leadingIcon={<PhoneIcon size={10}/>}>
              {agent.callsHandled30d.toLocaleString()} calls · 30d
            </Tag>
            {activeKinds.map(k => (
              <Tag key={k} variant="secondary" size="sm">
                {k === "webchat" ? "Web Chat" : k[0].toUpperCase() + k.slice(1)}
              </Tag>
            ))}
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          <Button variant="primary" size="sm" onClick={onOpen}>Configure</Button>
        </div>
      </div>
    </CardContainer>
  )
}
