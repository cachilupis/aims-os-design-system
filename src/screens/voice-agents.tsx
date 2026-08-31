import { useMemo, useState } from "react"
import { Bot, Plus, Mic, Volume2, FileText, Globe, Phone } from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  Table,
  TableCellAvatar,
  TableCellMenu,
  type TableColumn,
} from "@/components/ui/table"
import { SlideOut } from "@/components/ui/slide-out"
import { Toggle } from "@/components/ui/toggle"
import { Select } from "@/components/ui/select"
import { InformativeCard } from "@/components/ui/informative-card"
import { HighlightCard } from "@/components/ui/highlight-card"
import type { SidebarItem } from "@/components/ui/sidebar"
import { VOICE_AGENTS, type VoiceAgent } from "./voice/data"

// ── Sidebar (same as VoiceNumbers) ─────────────────────────────────────

const VOICE_SIDEBAR: SidebarItem[] = [
  { id: "home",         label: "Home",         icon: "Home" },
  { id: "agents",       label: "Agents",       icon: "Sparkle" },
  { id: "automations",  label: "Automations",  icon: "Zap" },
  { id: "voice",        label: "Voice",        icon: "Phone" },
  { id: "voice-agents", label: "Voice Agents", icon: "Bot" },
  { id: "knowledge",    label: "Knowledge",    icon: "LayoutGrid", hasChildren: true },
  { id: "contacts",     label: "Contacts",     icon: "User" },
]

// ── Status renderer ────────────────────────────────────────────────────

const STATUS_TAG: Record<VoiceAgent["status"], { variant: "success" | "secondary" | "alert"; label: string }> = {
  active: { variant: "success",   label: "Active" },
  draft:  { variant: "secondary", label: "Draft"  },
  paused: { variant: "alert",     label: "Paused" },
}

// ── Voice-only slide-out ───────────────────────────────────────────────

interface AgentSlideOutProps {
  agent: VoiceAgent | null
  open: boolean
  onClose: () => void
  onSave: (agent: VoiceAgent) => void
}

function AgentSlideOut({ agent, open, onClose, onSave }: AgentSlideOutProps) {
  const [draft, setDraft] = useState<VoiceAgent | null>(agent)

  // Sync when a different agent is opened
  useMemo(() => setDraft(agent), [agent])

  if (!draft) {
    return (
      <SlideOut
        open={open}
        onClose={onClose}
        type="with-variants"
        size="m"
        title="Voice configuration"
        showChips={false}
        showTabs={false}
        showSearchBar={false}
        showCta={false}
      >
        <div className="p-6 text-center" style={{ color: "var(--color-text-caption)" }}>
          Select an agent to view its Voice configuration.
        </div>
      </SlideOut>
    )
  }

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
      statusLabel={STATUS_TAG[draft.status].label}
      showTabs={false}
      showChips={false}
      showCta={true}
      ctaPrimaryLabel="Save changes"
      ctaSecondaryLabel="Cancel"
      onCtaPrimary={() => { onSave(draft); onClose() }}
      onCtaSecondary={onClose}
      showSearchBar={false}
    >
      <div className="flex flex-col gap-5 px-6 py-4">

        <InformativeCard
          state="informative"
          size="sm"
          title="This panel edits Voice-only settings"
          description="For prompt, knowledge, and tools, open the agent in Agentic Studio."
        />

        {/* Assigned numbers */}
        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Assigned numbers
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {draft.numbers.length === 0
              ? <span style={{ fontSize: 12, color: "var(--color-text-caption)", fontStyle: "italic" }}>No numbers assigned yet.</span>
              : draft.numbers.map(n => (
                  <Tag key={n} variant="informative" size="sm" leadingIcon={<Phone size={11}/>}>
                    <span className="font-mono">{n}</span>
                  </Tag>
                ))
            }
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={13}/>}
            iconPosition="left"
            onClick={() => alert("Assign number picker — pending V1.5")}
          >
            Assign number
          </Button>
        </section>

        {/* Voice model */}
        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Voice model
          </label>
          <Select
            value={draft.voiceModel}
            size="default"
            leadingIcon={<Volume2 size={14}/>}
          />
          <p style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 6 }}>
            The voice used when the agent answers or places calls.
          </p>
        </section>

        {/* Language */}
        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Language
          </label>
          <Select
            value={draft.language}
            size="default"
            leadingIcon={<Globe size={14}/>}
          />
        </section>

        {/* Recording */}
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
            <Toggle
              checked={draft.recording}
              onChange={(checked) => setDraft({ ...draft, recording: checked })}
              size="default"
            />
          </div>
        </section>

        {/* Script attached */}
        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Attached script
          </label>
          <Input
            value={draft.scriptName ?? ""}
            placeholder="No script attached"
            leftIcon={<FileText size={14}/>}
            size="default"
            readOnly
          />
          <div className="flex gap-2 mt-2">
            <Button variant="tertiary" size="sm" onClick={() => alert("Open script — pending V1.5")}>
              Open script
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => alert("Replace script — pending V1.5")}>
              Replace…
            </Button>
          </div>
        </section>

      </div>
    </SlideOut>
  )
}

// ── Main screen ────────────────────────────────────────────────────────

export default function VoiceAgentsScreen() {
  const [search, setSearch]         = useState("")
  const [statusFilter, setStatus]   = useState<"all" | VoiceAgent["status"]>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [agents, setAgents]         = useState<VoiceAgent[]>(VOICE_AGENTS)

  const filtered = useMemo(() => {
    return agents.filter(a => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false
      if (!search) return true
      const hay = `${a.name} ${a.role} ${a.numbers.join(" ")}`.toLowerCase()
      return hay.includes(search.toLowerCase())
    })
  }, [agents, search, statusFilter])

  const counts = useMemo(() => ({
    all:    agents.length,
    active: agents.filter(a => a.status === "active").length,
    draft:  agents.filter(a => a.status === "draft").length,
    paused: agents.filter(a => a.status === "paused").length,
  }), [agents])

  const totalCallsToday = agents.reduce((sum, a) => sum + a.callsToday, 0)
  const totalNumbers    = agents.reduce((sum, a) => sum + a.numbers.length, 0)
  const activeAgents    = agents.filter(a => a.status === "active").length

  const selected = agents.find(a => a.id === selectedId) ?? null

  const columns: TableColumn<VoiceAgent>[] = [
    {
      key: "name", header: "Agent", width: "220px",
      render: (a) => (
        <div className="flex items-center gap-3">
          <TableCellAvatar name={a.name} />
          <div className="flex flex-col">
            <span style={{ fontWeight: 600, color: "var(--color-text-title)" }}>{a.name}</span>
            <span style={{ fontSize: 12, color: "var(--color-text-caption)" }}>{a.role}</span>
          </div>
        </div>
      ),
    },
    {
      key: "numbers", header: "Numbers", width: "180px",
      render: (a) => a.numbers.length === 0
        ? <span style={{ color: "var(--color-text-caption)", fontStyle: "italic" }}>None</span>
        : (
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[13px]" style={{ color: "var(--color-text-title)" }}>
                {a.numbers[0]}
              </span>
              {a.numbers.length > 1 && (
                <span style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
                  +{a.numbers.length - 1} more
                </span>
              )}
            </div>
          ),
    },
    {
      key: "voiceModel", header: "Voice", width: "180px",
      render: (a) => (
        <div className="flex items-center gap-2">
          <Volume2 size={13} style={{ color: "var(--color-icon-primary-default)" }}/>
          <span style={{ fontSize: 13, color: "var(--color-text-body)" }}>{a.voiceModel}</span>
        </div>
      ),
    },
    {
      key: "callsToday", header: "Calls today", width: "110px", align: "right",
      render: (a) => (
        <span style={{
          fontWeight: 600,
          color: a.callsToday >= 100 ? "var(--primary)" : "var(--color-text-body)",
        }}>{a.callsToday}</span>
      ),
    },
    {
      key: "recording", header: "Recording", width: "110px",
      render: (a) => a.recording
        ? <Tag variant="informative" size="sm" leadingIcon={<Mic size={11}/>}>On</Tag>
        : <Tag variant="secondary"   size="sm">Off</Tag>,
    },
    {
      key: "status", header: "Status", width: "110px",
      render: (a) => <Tag variant={STATUS_TAG[a.status].variant} size="sm">{STATUS_TAG[a.status].label}</Tag>,
    },
    {
      key: "actions", header: "", width: "48px",
      render: (a) => <TableCellMenu onClick={() => setSelectedId(a.id)} />,
    },
  ]

  return (
    <>
      <ScreenLayout
        sidebarItems={VOICE_SIDEBAR}
        activeSidebarId="voice-agents"
        header={(isScrolled) => (
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title="Voice Agents"
            description="Agents that answer or place calls on the Voice channel."
          />
        )}
      >
        <div className="flex flex-col gap-6">

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3">
            <HighlightCard label="Voice Agents"     value={agents.length}   iconName="Bot"       feedback={`${activeAgents} active`}   feedbackType="positive" />
            <HighlightCard label="Numbers Assigned" value={totalNumbers}    iconName="Phone"     feedback="across all agents"          feedbackType="neutral" />
            <HighlightCard label="Calls Today"      value={totalCallsToday} iconName="PhoneCall" feedback="+18% vs yesterday"          feedbackType="positive" />
            <HighlightCard label="Recording On"     value={agents.filter(a => a.recording).length} iconName="Mic" feedback={`${agents.length - agents.filter(a => a.recording).length} off`} feedbackType="neutral" />
          </div>

          {/* Filters + primary action */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {(["all", "active", "draft", "paused"] as const).map(s => (
                <Chip
                  key={s}
                  variant={statusFilter === s ? "primary" : "secondary"}
                  size="s"
                  onClick={() => setStatus(s)}
                >
                  {s === "all"    ? `All ${counts.all}`
                   : s === "active" ? `Active ${counts.active}`
                   : s === "draft"  ? `Draft ${counts.draft}`
                   :                  `Paused ${counts.paused}`}
                </Chip>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Input
                placeholder="Search agents…"
                size="sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 240 }}
                aria-label="Search voice agents"
              />
              <Button variant="primary" size="sm" icon={<Plus size={14}/>} iconPosition="left">
                New Voice Agent
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            data={filtered}
            size="default"
            emptyIcon={Bot}
            emptyTitle="No voice agents match the current filter."
            emptyDescription="Try clearing the search or changing the status filter."
          />
        </div>
      </ScreenLayout>

      <AgentSlideOut
        agent={selected}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        onSave={(updated) => setAgents(prev => prev.map(a => a.id === updated.id ? updated : a))}
      />
    </>
  )
}
