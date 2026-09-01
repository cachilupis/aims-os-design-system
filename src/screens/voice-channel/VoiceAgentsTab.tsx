import { useMemo, useState } from "react"
import { Bot, Search } from "lucide-react"
import { Filters } from "@/components/ui/filters"
import { Chip } from "@/components/ui/chip"
import { CardContainer } from "@/components/ui/card-container"
import { EmptyState } from "@/components/ui/empty-state"
import { EntityList, type EntityListItemData } from "@/components/ui/entity-list"
import type { VoiceAIAgent, AIAgentStatus } from "./voice-agents-data"

// ─────────────────────────────────────────────────────────────────────
// VoiceAgentsTab — landing view for the Agents section.
//
// Uses the DS EntityList primitive for the list rows so the icon +
// title + meta + state tag + Configure action layout is a canonical
// DS pattern rather than a bespoke CardContainer + inline flexbox.
// Every visual (icon variant, tag color, meta chips) maps to
// EntityList's typed props.
// ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | AIAgentStatus

interface VoiceAgentsTabProps {
  agents:      VoiceAIAgent[]
  onOpenAgent: (id: string) => void
}

// Map lifecycle status → the EntityList state tag variant so a demo
// reads Published/Draft/Paused as green/neutral/amber immediately.
const STATE_FOR: Record<AIAgentStatus, { label: string; variant: "success" | "neutral" | "alert" }> = {
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

  // Every filtered agent → one EntityListItemData row. Everything
  // beyond that (icon, title, meta, state tag, tags for channels,
  // Configure action) is a typed field EntityList already renders.
  const items: EntityListItemData[] = filtered.map(a => {
    const activeKinds = a.channels.filter(c => c.active).map(c => c.kind)
    return {
      id:          a.id,
      iconVariant: a.status === "Published" ? "info" : "neutral",
      iconName:    "Bot",
      title:       `${a.name} — ${a.purpose}`,
      description: a.description,
      primaryMeta: [
        { iconName: "Hash",  label: `${a.numbersAssigned} number${a.numbersAssigned === 1 ? "" : "s"}` },
        { iconName: "Phone", label: `${a.callsHandled30d.toLocaleString()} calls · 30d` },
      ],
      state: STATE_FOR[a.status],
      // Active channels render as chips in the body row. Web Chat is
      // capitalised in labels because "webchat" looks like a typo.
      tags: activeKinds.map(k => ({ label: k === "webchat" ? "Web Chat" : k[0].toUpperCase() + k.slice(1) })),
      actions: [{ label: "Configure", variant: "primary", onClick: () => onOpenAgent(a.id) }],
      onClick: () => onOpenAgent(a.id),
    }
  })

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
      {items.length === 0 ? (
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
        <EntityList items={items}/>
      )}
    </div>
  )
}
