import { useMemo, useState } from "react"
import { Bot, Plus, Volume2, FileText, Globe, Phone, ExternalLink, ArrowLeft, Search, Settings, Mic, MicOff } from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Tabs } from "@/components/ui/tabs"
import { Filters } from "@/components/ui/filters"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { Toggle } from "@/components/ui/toggle"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { InformativeCard } from "@/components/ui/informative-card"
import { HighlightCard } from "@/components/ui/highlight-card"
import { CardContainer } from "@/components/ui/card-container"
import { EntityList, type EntityListItemData } from "@/components/ui/entity-list"
import { EmptyState } from "@/components/ui/empty-state"
import { AvatarCircle } from "@/components/ui/avatar"
import type { SidebarItem } from "@/components/ui/sidebar"
import { NUMBERS, VOICE_AGENTS, type VoiceAgent, type PhoneNumber } from "./voice/data"
import { BuyNumberModal, AssignNumberSlideOut } from "./voice/flows"

// ── Sidebar ────────────────────────────────────────────────────────────

const VOICE_SIDEBAR: SidebarItem[] = [
  { id: "home",         label: "Home",         icon: "Home" },
  { id: "agents",       label: "Agents",       icon: "Sparkle" },
  { id: "automations",  label: "Automations",  icon: "Zap" },
  { id: "voice",        label: "Phone Numbers", icon: "Phone" },
  { id: "voice-agents", label: "Voice Agents", icon: "Bot" },
  { id: "knowledge",    label: "Knowledge",    icon: "LayoutGrid", hasChildren: true },
  { id: "contacts",     label: "Contacts",     icon: "User" },
]

const STATUS_META: Record<VoiceAgent["status"], { label: string; variant: "success" | "neutral" | "alert" }> = {
  active: { label: "Active", variant: "success" },
  draft:  { label: "Draft",  variant: "neutral" },
  paused: { label: "Paused", variant: "alert"   },
}

// ─────────────────────────────────────────────────────────────────────
// Agent Detail Page — full flow for one agent
// ─────────────────────────────────────────────────────────────────────

interface AgentDetailPageProps {
  agent:            VoiceAgent
  allNumbers:       PhoneNumber[]
  onBack:           () => void
  onAgentChange:    (agent: VoiceAgent) => void
  onOpenAssign:     () => void
  onUnassign:       (phoneNumber: string) => void
  onBuyNumber:      () => void
}

function AgentDetailPage({ agent, allNumbers, onBack, onAgentChange, onOpenAssign, onUnassign, onBuyNumber }: AgentDetailPageProps) {
  const [detailTab, setDetailTab] = useState<"numbers" | "voice">("numbers")

  // For each assigned number string, look up the full record if it exists;
  // otherwise synthesize a display record with just the number so the row still shows.
  const assignedRecords: PhoneNumber[] = useMemo(() => {
    return agent.numbers.map(pn => {
      const found = allNumbers.find(n => n.number === pn)
      if (found) return found
      return {
        id:           -Math.abs(pn.split("").reduce((s, c) => s + c.charCodeAt(0), 0)),
        number:       pn,
        label:        null,
        type:         "both" as const,
        status:       "active" as const,
        agent:        { name: agent.name, kind: "agent" as const },
        capabilities: ["Voice"] as const as unknown as ("Voice" | "SMS")[],
        calls:        0,
      }
    })
  }, [agent.numbers, allNumbers, agent.name])

  const status = STATUS_META[agent.status]

  return (
    <div className="flex flex-col gap-4">
      {/* Back nav */}
      <Button variant="tertiary" size="sm" icon={<ArrowLeft size={13}/>} iconPosition="left" onClick={onBack}>
        Back to Voice Agents
      </Button>

      {/* Agent header block */}
      <CardContainer variant="default" size="default">
        <div className="flex items-start gap-4">
          <AvatarCircle name={agent.name} sizeKey="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-title)" }}>{agent.name}</h2>
              <Tag variant={status.variant} size="sm">{status.label}</Tag>
              <span style={{ fontSize: 13, color: "var(--color-text-caption)" }}>· {agent.role}</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-body)", marginTop: 6, marginBottom: 8 }}>
              {agent.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Tag variant="informative" size="sm" leadingIcon={<Volume2 size={11}/>}>{agent.voiceModel}</Tag>
              <Tag variant="neutral" size="sm" leadingIcon={<Globe size={11}/>}>{agent.language}</Tag>
              {agent.recording && <Tag variant="purple" size="sm" leadingIcon={<Mic size={11}/>}>Recording on</Tag>}
              {agent.scriptName && <Tag variant="secondary" size="sm" leadingIcon={<FileText size={11}/>}>{agent.scriptName}</Tag>}
            </div>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <Button variant="secondary" size="sm" icon={<ExternalLink size={13}/>} iconPosition="left">
              Open in Agentic Studio
            </Button>
          </div>
        </div>
      </CardContainer>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <HighlightCard label="Calls Today"    value={agent.callsToday} iconName="PhoneCall"   feedback={agent.status === "active" ? "Live" : "Idle"} feedbackType={agent.status === "active" ? "positive" : "neutral"} />
        <HighlightCard label="Calls 30d"      value={agent.calls30d}   iconName="TrendingUp"  feedback={`avg ${agent.avgDuration}`}                  feedbackType="neutral" />
        <HighlightCard label="Success rate"   value={`${Math.round(agent.successRate * 100)}%`} iconName="CheckCircle" feedback={agent.successRate >= 0.85 ? "Excellent" : agent.successRate >= 0.7 ? "Good" : "Needs review"} feedbackType={agent.successRate >= 0.85 ? "positive" : agent.successRate >= 0.7 ? "neutral" : "negative"} />
        <HighlightCard label="Numbers"        value={agent.numbers.length} iconName="Phone"   feedback={agent.numbers.length === 0 ? "None assigned" : agent.numbers.length === 1 ? "1 line" : `${agent.numbers.length} lines`} feedbackType={agent.numbers.length === 0 ? "negative" : "neutral"} />
      </div>

      {/* Detail tabs */}
      <Tabs
        items={[
          { id: "numbers", label: `Assigned Numbers (${agent.numbers.length})`, icon: Phone   },
          { id: "voice",   label: "Voice Configuration",                        icon: Settings },
        ]}
        activeId={detailTab}
        onChange={(id) => setDetailTab(id as typeof detailTab)}
        size="s"
      />

      {detailTab === "numbers" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>Phone numbers routed to {agent.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>
                Calls to these numbers will be answered or placed by this agent.
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={<Plus size={13}/>} iconPosition="left" onClick={onBuyNumber}>
                Buy Number
              </Button>
              <Button variant="primary" size="sm" icon={<Plus size={13}/>} iconPosition="left" onClick={onOpenAssign}>
                Assign existing
              </Button>
            </div>
          </div>

          {assignedRecords.length === 0 ? (
            <CardContainer variant="dashed" size="default">
              <EmptyState
                icon={Phone}
                title="No numbers assigned yet"
                description="Assign an existing number from the free pool, or buy a new number to route to this agent."
                ctaLabel="Assign existing number"
                onCta={onOpenAssign}
                cta2Label="Buy new number"
                onCta2={onBuyNumber}
              />
            </CardContainer>
          ) : (
            <CardContainer variant="default" size="sm" className="!p-0 overflow-hidden">
              <EntityList items={assignedRecords.map(num => ({
                id:          `n-${num.id}`,
                title:       num.number,
                iconName:    "Phone",
                iconVariant: "info",
                primaryMeta: [
                  ...(num.label ? [{ iconName: "Tag", label: num.label }] : []),
                  { iconName: "PhoneCall", label: `${num.calls} calls · 30d` },
                  ...num.capabilities.map(c => ({ tag: c })),
                ],
                state: { label: num.type === "both" ? "In + Out" : num.type === "inbound" ? "Inbound" : num.type === "outbound" ? "Outbound" : "—", variant: "informative" as const },
                actions: [{
                  label:   "Unassign",
                  variant: "tertiary" as const,
                  icon:    "X",
                  onClick: () => onUnassign(num.number),
                }],
              } satisfies EntityListItemData))} />
            </CardContainer>
          )}
        </div>
      )}

      {detailTab === "voice" && (
        <div className="grid grid-cols-2 gap-4">
          <CardContainer variant="default" size="default">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>Voice model</div>
            <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 12 }}>
              The voice used when the agent answers or places calls.
            </div>
            <Select value={agent.voiceModel} size="default" leadingIcon={<Volume2 size={14}/>} />
          </CardContainer>

          <CardContainer variant="default" size="default">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>Language</div>
            <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 12 }}>
              Determines available voices, transcription and NLU.
            </div>
            <Select value={agent.language} size="default" leadingIcon={<Globe size={14}/>} />
          </CardContainer>

          <CardContainer variant="default" size="default">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>Call recording</div>
                <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>
                  Record every call this agent handles for QA and coaching.
                </div>
              </div>
              <Toggle
                checked={agent.recording}
                onChange={(c) => onAgentChange({ ...agent, recording: c })}
                size="default"
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {agent.recording ? <><Mic size={12} style={{color:"var(--color-icon-primary-default)"}}/> Recording is on — files stored 90 days.</> : <><MicOff size={12}/> Recording is off.</>}
            </div>
          </CardContainer>

          <CardContainer variant="default" size="default">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>Attached script</div>
            <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 12 }}>
              A conversation script the agent follows on this channel.
            </div>
            {agent.scriptName ? (
              <>
                <Input value={agent.scriptName} placeholder="No script attached" leftIcon={<FileText size={14}/>} size="default" readOnly />
                <div className="flex gap-2 mt-2">
                  <Button variant="tertiary" size="sm">Open script</Button>
                  <Button variant="tertiary" size="sm">Replace…</Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between p-3" style={{ border: "1px dashed var(--color-border-neutral-default)", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-caption)", fontStyle: "italic" }}>No script attached</div>
                <Button variant="secondary" size="sm" icon={<Plus size={13}/>} iconPosition="left">Attach script</Button>
              </div>
            )}
          </CardContainer>
        </div>
      )}

      <InformativeCard
        state="informative"
        size="sm"
        title="This is the Voice channel view of the agent"
        description="For prompt, knowledge base, tools, and cross-channel configuration, open the agent in Agentic Studio."
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Main screen — list ↔ detail navigation
// ─────────────────────────────────────────────────────────────────────

export default function VoiceAgentsScreen() {
  const [view,         setView]        = useState<"list" | "detail">("list")
  const [detailId,     setDetailId]    = useState<string | null>(null)
  const [search,       setSearch]      = useState("")
  const [statusFilter, setStatus]      = useState<"all" | VoiceAgent["status"]>("all")
  const [agents,       setAgents]      = useState<VoiceAgent[]>(VOICE_AGENTS)
  const [numbers,      setNumbers]     = useState<PhoneNumber[]>(NUMBERS)
  const [buyOpen,      setBuyOpen]     = useState(false)
  const [assignOpen,   setAssignOpen]  = useState(false)

  const nextNumberId = useMemo(() => Math.max(...numbers.map(n => n.id), 0) + 1, [numbers])

  function openDetail(id: string) {
    setDetailId(id)
    setView("detail")
  }

  function backToList() {
    setView("list")
    setDetailId(null)
  }

  function assignNumbers(agentId: string, numberIds: number[]) {
    const targetNums = numbers.filter(n => numberIds.includes(n.id))
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    setNumbers(prev => prev.map(n => numberIds.includes(n.id)
      ? { ...n, status: "active", agent: { name: agent.name, kind: "agent" } }
      : n
    ))
    setAgents(prev => prev.map(a => a.id === agentId
      ? { ...a, numbers: [...a.numbers, ...targetNums.map(n => n.number)] }
      : a
    ))
  }

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

  const detailAgent = agents.find(a => a.id === detailId) ?? null

  // Filter for the list view
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

  const items = filtered.map<EntityListItemData>(a => ({
    id:          a.id,
    title:       a.name,
    avatarName:  a.name,
    primaryMeta: [
      { iconName: "Briefcase", label: a.role },
      {
        iconName: "Phone",
        label:    a.numbers.length === 0
          ? "No numbers"
          : `${a.numbers.length} number${a.numbers.length > 1 ? "s" : ""}`,
      },
      { iconName: "Volume2",   label: a.voiceModel },
      { iconName: "PhoneCall", label: `${a.callsToday} calls today` },
      { iconName: a.recording ? "Mic" : "MicOff", label: a.recording ? "Recording on" : "Recording off" },
    ],
    description:
      a.numbers.length > 0
        ? `Assigned: ${a.numbers.join(" · ")}${a.scriptName ? ` — Script: ${a.scriptName}` : ""}`
        : a.description,
    state:       STATUS_META[a.status],
    showMenu:    true,
    onMenuClick: () => openDetail(a.id),
  }))

  return (
    <>
      <ScreenLayout
        sidebarItems={VOICE_SIDEBAR}
        activeSidebarId="voice-agents"
        header={(isScrolled) => (
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={view === "detail" && detailAgent ? detailAgent.name : "Voice Agents"}
            description={view === "detail" && detailAgent
              ? `${detailAgent.role} · Voice channel configuration and phone number assignment`
              : "Agents that answer or place calls on the Voice channel. Manage the agent itself in Agentic Studio."}
          />
        )}
      >
        {view === "detail" && detailAgent ? (
          <AgentDetailPage
            agent={detailAgent}
            allNumbers={numbers}
            onBack={backToList}
            onAgentChange={(u) => setAgents(prev => prev.map(a => a.id === u.id ? u : a))}
            onOpenAssign={() => setAssignOpen(true)}
            onUnassign={(pn) => unassignNumber(detailAgent.id, pn)}
            onBuyNumber={() => setBuyOpen(true)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Whole-screen empty state — no agents at all */}
            {agents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No Voice Agents yet"
                description="Voice Agents are created in Agentic Studio and appear here when they're connected to the Voice channel. You can also buy a phone number first and route it later."
                ctaLabel="Buy a phone number"
                onCta={() => setBuyOpen(true)}
                cta2Label="Open Agentic Studio"
                onCta2={() => {}}
              />
            ) : (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-4 gap-3">
                  <HighlightCard label="Voice Agents"     value={agents.length}   iconName="Bot"       feedback={`${activeAgents} active`}   feedbackType="positive" />
                  <HighlightCard label="Numbers Assigned" value={totalNumbers}    iconName="Phone"     feedback="across all agents"          feedbackType="neutral"  />
                  <HighlightCard label="Calls Today"      value={totalCallsToday} iconName="PhoneCall" feedback="+18% vs yesterday"          feedbackType="positive" />
                  <HighlightCard label="Recording On"     value={recordingOn}     iconName="Mic"       feedback={`${agents.length - recordingOn} off`} feedbackType="neutral" />
                </div>

                {/* Status Tabs */}
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

                {/* Filters + primary CTAs */}
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

                {/* List / empty-filter state */}
                {items.length === 0 ? (
                  <CardContainer variant="default" size="default">
                    <EmptyState
                      icon={search ? Search : Bot}
                      title={search ? `No agents match "${search}"` : `No ${statusFilter} agents`}
                      description={search ? "Try a different search term or clear the search." : "Try switching to a different status filter above."}
                      ctaLabel={search ? "Clear search" : statusFilter !== "all" ? "Show all agents" : undefined}
                      onCta={search ? () => setSearch("") : () => setStatus("all")}
                    />
                  </CardContainer>
                ) : (
                  <CardContainer variant="default" size="sm" className="!p-0 overflow-hidden">
                    <div onClick={(e) => {
                      const row = (e.target as HTMLElement).closest("[data-id]") as HTMLElement | null
                      if (!row) return
                      const id = row.dataset.id
                      if (id) openDetail(id)
                    }} style={{ cursor: "pointer" }}>
                      <EntityList items={items.map(i => ({ ...i }))} />
                    </div>
                  </CardContainer>
                )}
              </>
            )}
          </div>
        )}
      </ScreenLayout>

      <AssignNumberSlideOut
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        agentName={detailAgent?.name ?? ""}
        numbers={numbers}
        onAssign={(numberIds) => {
          if (detailId) assignNumbers(detailId, numberIds)
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
