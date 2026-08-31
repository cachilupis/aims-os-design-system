import { useMemo, useState } from "react"
import { Bot, Plus, Volume2, FileText, Globe, Phone, ExternalLink } from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Tabs } from "@/components/ui/tabs"
import { Filters } from "@/components/ui/filters"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { SlideOut } from "@/components/ui/slide-out"
import { Toggle } from "@/components/ui/toggle"
import { Select } from "@/components/ui/select"
import { InformativeCard } from "@/components/ui/informative-card"
import { HighlightCard } from "@/components/ui/highlight-card"
import { CardContainer } from "@/components/ui/card-container"
import { EntityList, type EntityListItemData } from "@/components/ui/entity-list"
import type { SidebarItem } from "@/components/ui/sidebar"
import { NUMBERS, VOICE_AGENTS, type VoiceAgent, type PhoneNumber } from "./voice/data"
import { BuyNumberModal, AssignNumberSlideOut } from "./voice/flows"

// ── Sidebar ────────────────────────────────────────────────────────────

const VOICE_SIDEBAR: SidebarItem[] = [
  { id: "home",         label: "Home",         icon: "Home" },
  { id: "agents",       label: "Agents",       icon: "Sparkle" },
  { id: "automations",  label: "Automations",  icon: "Zap" },
  { id: "voice",        label: "Voice",        icon: "Phone" },
  { id: "voice-agents", label: "Voice Agents", icon: "Bot" },
  { id: "knowledge",    label: "Knowledge",    icon: "LayoutGrid", hasChildren: true },
  { id: "contacts",     label: "Contacts",     icon: "User" },
]

// ── Status meta ────────────────────────────────────────────────────────

const STATUS_META: Record<VoiceAgent["status"], { label: string; variant: "success" | "neutral" | "alert" }> = {
  active: { label: "Active", variant: "success" },
  draft:  { label: "Draft",  variant: "neutral" },
  paused: { label: "Paused", variant: "alert"   },
}

// ── Voice-only slide-out ───────────────────────────────────────────────

interface AgentSlideOutProps {
  agent:          VoiceAgent | null
  open:           boolean
  onClose:        () => void
  onSave:         (agent: VoiceAgent) => void
  onAssignClick:  () => void
  onUnassign:     (agentId: string, phoneNumber: string) => void
}

function AgentSlideOut({ agent, open, onClose, onSave, onAssignClick, onUnassign }: AgentSlideOutProps) {
  const [draft, setDraft] = useState<VoiceAgent | null>(agent)
  useMemo(() => setDraft(agent), [agent])

  if (!draft) return null

  return (
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      title={draft.name}
      subtitle={`Voice channel · ${draft.role}`}
      iconContent={<Bot size={18} />}
      showStatus={true}
      statusLabel={STATUS_META[draft.status].label}
      showTabs={false}
      showChips={false}
      showSearchBar={false}
      showCta={true}
      ctaPrimaryLabel="Save changes"
      ctaSecondaryLabel="Cancel"
      onCtaPrimary={() => { onSave(draft); onClose() }}
      onCtaSecondary={onClose}
    >
      <div className="flex flex-col gap-5 px-6 py-4">
        <InformativeCard
          state="informative"
          size="sm"
          title="This panel edits Voice-only settings"
          description="For prompt, knowledge, and tools, open the agent in Agentic Studio."
        />

        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Assigned numbers
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {draft.numbers.length === 0
              ? <span style={{ fontSize: 12, color: "var(--color-text-caption)", fontStyle: "italic" }}>No numbers assigned yet.</span>
              : draft.numbers.map(n => (
                  <Tag
                    key={n}
                    variant="informative"
                    size="sm"
                    leadingIcon={<Phone size={11}/>}
                    trailingIcon={
                      <button
                        aria-label={`Unassign ${n}`}
                        onClick={() => {
                          onUnassign(draft.id, n)
                          setDraft({ ...draft, numbers: draft.numbers.filter(x => x !== n) })
                        }}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", opacity: 0.6, color: "inherit", display: "inline-flex" }}
                      >
                        ×
                      </button>
                    }
                  >
                    <span className="font-mono">{n}</span>
                  </Tag>
                ))
            }
          </div>
          <Button variant="secondary" size="sm" icon={<Plus size={13}/>} iconPosition="left" onClick={onAssignClick}>
            Assign number
          </Button>
        </section>

        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Voice model
          </label>
          <Select value={draft.voiceModel} size="default" leadingIcon={<Volume2 size={14}/>} />
          <p style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 6 }}>
            The voice used when the agent answers or places calls.
          </p>
        </section>

        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Language
          </label>
          <Select value={draft.language} size="default" leadingIcon={<Globe size={14}/>} />
        </section>

        <section>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 2 }}>
                Call recording
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>
                Record every call this agent handles for QA and coaching.
              </div>
            </div>
            <Toggle checked={draft.recording} onChange={(c) => setDraft({ ...draft, recording: c })} size="default" />
          </div>
        </section>

        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Attached script
          </label>
          <Input value={draft.scriptName ?? ""} placeholder="No script attached" leftIcon={<FileText size={14}/>} size="default" readOnly />
          <div className="flex gap-2 mt-2">
            <Button variant="tertiary" size="sm">Open script</Button>
            <Button variant="tertiary" size="sm">Replace…</Button>
          </div>
        </section>
      </div>
    </SlideOut>
  )
}

// ── EntityList item mapper ─────────────────────────────────────────────

function agentToItem(agent: VoiceAgent, onOpen: (id: string) => void): EntityListItemData {
  const primaryMeta = [
    { iconName: "Briefcase", label: agent.role },
    {
      iconName: "Phone",
      label: agent.numbers.length === 0
        ? "No numbers"
        : `${agent.numbers.length} number${agent.numbers.length > 1 ? "s" : ""}`,
    },
    { iconName: "Volume2", label: agent.voiceModel },
    { iconName: "PhoneCall", label: `${agent.callsToday} calls today` },
    { iconName: agent.recording ? "Mic" : "MicOff", label: agent.recording ? "Recording on" : "Recording off" },
  ]

  const description = agent.numbers.length > 0
    ? `Assigned: ${agent.numbers.join(" · ")}${agent.scriptName ? ` — Script: ${agent.scriptName}` : ""}`
    : undefined

  return {
    id:            agent.id,
    title:         agent.name,
    avatarName:    agent.name,
    primaryMeta,
    description,
    state:         STATUS_META[agent.status],
    showMenu:      true,
    onMenuClick:   () => onOpen(agent.id),
  }
}

// ── Main screen ────────────────────────────────────────────────────────

export default function VoiceAgentsScreen() {
  const [search,       setSearch]     = useState("")
  const [statusFilter, setStatus]     = useState<"all" | VoiceAgent["status"]>("all")
  const [selectedId,   setSelectedId] = useState<string | null>(null)
  const [agents,       setAgents]     = useState<VoiceAgent[]>(VOICE_AGENTS)
  const [numbers,      setNumbers]    = useState<PhoneNumber[]>(NUMBERS)
  const [buyOpen,      setBuyOpen]    = useState(false)
  const [assignOpen,   setAssignOpen] = useState(false)

  const nextNumberId = useMemo(() => Math.max(...numbers.map(n => n.id), 0) + 1, [numbers])

  // Assign selected free-pool numbers to an agent
  function assignNumbers(agentId: string, numberIds: number[]) {
    const targetNums = numbers.filter(n => numberIds.includes(n.id))
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    // Mark those numbers as active + attached to this agent
    setNumbers(prev => prev.map(n => numberIds.includes(n.id)
      ? { ...n, status: "active", agent: { name: agent.name, kind: "agent" } }
      : n
    ))
    // Append their phone strings to agent.numbers
    setAgents(prev => prev.map(a => a.id === agentId
      ? { ...a, numbers: [...a.numbers, ...targetNums.map(n => n.number)] }
      : a
    ))
  }

  // Free a number when unassigned from an agent
  function unassignNumber(agentId: string, phoneNumber: string) {
    setAgents(prev => prev.map(a => a.id === agentId
      ? { ...a, numbers: a.numbers.filter(n => n !== phoneNumber) }
      : a
    ))
    setNumbers(prev => prev.map(n => n.number === phoneNumber
      ? { ...n, status: "unassigned", agent: null }
      : n
    ))
  }

  const filtered = useMemo(() => agents.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false
    if (!search) return true
    const hay = `${a.name} ${a.role} ${a.numbers.join(" ")}`.toLowerCase()
    return hay.includes(search.toLowerCase())
  }), [agents, search, statusFilter])

  const counts = useMemo(() => ({
    all:    agents.length,
    active: agents.filter(a => a.status === "active").length,
    draft:  agents.filter(a => a.status === "draft").length,
    paused: agents.filter(a => a.status === "paused").length,
  }), [agents])

  const totalCallsToday = agents.reduce((s, a) => s + a.callsToday, 0)
  const totalNumbers    = agents.reduce((s, a) => s + a.numbers.length, 0)
  const activeAgents    = agents.filter(a => a.status === "active").length
  const recordingOn     = agents.filter(a => a.recording).length

  const selected = agents.find(a => a.id === selectedId) ?? null
  const items    = filtered.map(a => agentToItem(a, setSelectedId))

  return (
    <>
      <ScreenLayout
        sidebarItems={VOICE_SIDEBAR}
        activeSidebarId="voice-agents"
        header={(isScrolled) => (
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title="Voice Agents"
            description="Agents that answer or place calls on the Voice channel. Manage the agent itself in Agentic Studio."
          />
        )}
      >
        <div className="flex flex-col gap-4">

          {/* KPIs — compact */}
          <div className="grid grid-cols-4 gap-3">
            <HighlightCard label="Voice Agents"     value={agents.length}   iconName="Bot"       feedback={`${activeAgents} active`}   feedbackType="positive" />
            <HighlightCard label="Numbers Assigned" value={totalNumbers}    iconName="Phone"     feedback="across all agents"          feedbackType="neutral"  />
            <HighlightCard label="Calls Today"      value={totalCallsToday} iconName="PhoneCall" feedback="+18% vs yesterday"          feedbackType="positive" />
            <HighlightCard label="Recording On"     value={recordingOn}     iconName="Mic"       feedback={`${agents.length - recordingOn} off`} feedbackType="neutral" />
          </div>

          {/* Status tabs (mutually-exclusive filter — DS pattern) */}
          <Tabs
            items={[
              { id: "all",    label: `All (${counts.all})` },
              { id: "active", label: `Active (${counts.active})` },
              { id: "draft",  label: `Draft (${counts.draft})` },
              { id: "paused", label: `Paused (${counts.paused})` },
            ]}
            activeId={statusFilter}
            onChange={(id) => setStatus(id as typeof statusFilter)}
            size="s"
          />

          {/* DS Filters — search only — + primary CTA outside */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Filters
                showSearch
                searchPlaceholder="Search agents by name, role, or number…"
                searchValue={search}
                onSearchChange={setSearch}
                showAllFilters={false}
                showSort={false}
                showViewToggle={false}
              />
            </div>
            <Button variant="secondary" size="default" icon={<ExternalLink size={14}/>} iconPosition="left">
              Open in Agentic Studio
            </Button>
            <Button variant="primary" size="default" icon={<Plus size={14}/>} iconPosition="left" onClick={() => setBuyOpen(true)}>
              Buy Number
            </Button>
          </div>

          {/* EntityList wrapped in a single CardContainer */}
          {items.length === 0
            ? <CardContainer variant="default" size="default">
                <div className="py-16 text-center flex flex-col items-center gap-2">
                  <Bot size={32} style={{ color: "var(--color-icon-primary-default)" }}/>
                  <div style={{ fontWeight: 600, color: "var(--color-text-title)" }}>No voice agents match the current filter.</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>Try clearing the search or changing the status tab.</div>
                </div>
              </CardContainer>
            : <CardContainer variant="default" size="sm" className="!p-0 overflow-hidden">
                <EntityList items={items} />
              </CardContainer>
          }

        </div>
      </ScreenLayout>

      <AgentSlideOut
        agent={selected}
        open={selectedId !== null && !assignOpen}
        onClose={() => setSelectedId(null)}
        onSave={(updated) => setAgents(prev => prev.map(a => a.id === updated.id ? updated : a))}
        onAssignClick={() => setAssignOpen(true)}
        onUnassign={unassignNumber}
      />

      <AssignNumberSlideOut
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        agentName={selected?.name ?? ""}
        numbers={numbers}
        onAssign={(numberIds) => {
          if (selectedId) assignNumbers(selectedId, numberIds)
        }}
      />

      <BuyNumberModal
        isOpen={buyOpen}
        onClose={() => setBuyOpen(false)}
        agents={agents}
        nextId={nextNumberId}
        onBuy={(num, assignToId) => {
          setNumbers(prev => [num, ...prev])
          if (assignToId) {
            setAgents(prev => prev.map(a => a.id === assignToId
              ? { ...a, numbers: [...a.numbers, num.number] }
              : a
            ))
          }
        }}
      />
    </>
  )
}
