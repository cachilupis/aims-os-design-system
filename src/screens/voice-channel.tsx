import { useMemo, useState } from "react"
import { Phone, PhoneCall, Settings as SettingsIcon, Plus, Search, Bot } from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Tabs } from "@/components/ui/tabs"
import { Chip } from "@/components/ui/chip"
import { Filters } from "@/components/ui/filters"
import { Button } from "@/components/ui/button"
import { Table, type TableColumn } from "@/components/ui/table"
import { CardContainer } from "@/components/ui/card-container"
import { EmptyState } from "@/components/ui/empty-state"
import type { SidebarEntry } from "@/components/ui/sidebar"
import { AvatarCircle } from "@/components/ui/avatar"
import {
  AGENTS,
  NUMBERS as NUMBERS_SEED,
  CALLS as CALLS_SEED,
  type PhoneNumberRecord,
  type Call,
} from "./voice-channel/data"
import {
  NumberStatusTag,
  HilBadge,
  AgentAvatarStack,
} from "./voice-channel/shared"
import { NumberSheet as NumberPreview } from "./voice-channel/NumberSheet"
import { NumberDetailPage } from "./voice-channel/NumberDetailPage"
import { AcquireNumberModal } from "./voice-channel/AcquireNumberModal"
import { ReleaseNumberModal } from "./voice-channel/ReleaseNumberModal"
import { AddAgentModal } from "./voice-channel/AddAgentModal"
import { CallHistoryTab } from "./voice-channel/CallHistoryTab"
import { SettingsTab } from "./voice-channel/SettingsTab"
import { VoiceAgentsTab } from "./voice-channel/VoiceAgentsTab"
import { VoiceAgentDetailPage } from "./voice-channel/VoiceAgentDetailPage"
import { VOICE_AI_AGENTS, type VoiceAIAgent } from "./voice-channel/voice-agents-data"
import { ToastProvider, useToast } from "./voice-channel/toast"

// Restored to the source prototype's three sections (Workspace · Channels ·
// Studio) now that Sidebar supports SidebarSection entries.

const VOICE_SIDEBAR: SidebarEntry[] = [
  { kind: "section",   label: "Workspace" },
  { id: "dashboard",     label: "Dashboard",       icon: "LayoutDashboard" },
  { id: "contacts",      label: "Contacts",        icon: "Users"           },
  { id: "conversations", label: "Conversations",   icon: "MessagesSquare"  },
  { kind: "section",   label: "Channels" },
  { id: "voice",         label: "Voice",           icon: "Phone"           },
  { id: "email",         label: "Email",           icon: "Mail"            },
  { id: "sms",           label: "SMS",             icon: "MessageSquare"   },
  { id: "chat-widget",   label: "Chat Widget",     icon: "Bot"             },
  { kind: "section",   label: "Studio" },
  { id: "networks",      label: "Agentic Networks", icon: "GitBranch"      },
  { id: "automations",   label: "Automations",     icon: "Zap"             },
  { id: "analytics",     label: "Analytics",       icon: "BarChart3"       },
]

// Sidebar footer — identity row matching the source prototype's
// "AK · Alex Kim · Admin" bottom pin. Render-function form so we can
// switch to icon-only when the sidebar is collapsed (56px width).
function renderSidebarFooter(collapsed: boolean) {
  if (collapsed) {
    return (
      <div style={{ padding: 4, display: "flex", justifyContent: "center" }}>
        <AvatarCircle name="Alex Kim" sizeKey="sm" />
      </div>
    )
  }
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 4px",
        borderTop: "1px solid var(--sb-divider, var(--color-border-neutral-default))",
      }}
    >
      <AvatarCircle name="Alex Kim" sizeKey="sm" />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sb-text)", lineHeight: 1.2 }}>Alex Kim</div>
        <div style={{ fontSize: 10, color: "var(--sb-text)", opacity: 0.6, lineHeight: 1.2 }}>Admin</div>
      </div>
    </div>
  )
}

type TopTab       = "numbers" | "history" | "agents" | "settings"
type NumberFilter = "all" | "active" | "suspended"

// ─────────────────────────────────────────────────────────────────────
// Main screen — 3 top tabs (Numbers · Call History · Settings)
// ─────────────────────────────────────────────────────────────────────

export default function VoiceChannelScreen() {
  return (
    <ToastProvider>
      <VoiceChannelScreenInner/>
    </ToastProvider>
  )
}

function VoiceChannelScreenInner() {
  const toast = useToast()

  const [tab,           setTab]           = useState<TopTab>("numbers")
  const [numbers,       setNumbers]       = useState<PhoneNumberRecord[]>(NUMBERS_SEED)
  const [calls]                            = useState<Call[]>(CALLS_SEED)
  const [voiceAgents,   setVoiceAgents]   = useState<VoiceAIAgent[]>(VOICE_AI_AGENTS)
  const [agentDetailId, setAgentDetailId] = useState<string | null>(null)

  // Modals + sheet + full-view state
  const [previewId,     setPreviewId]     = useState<string | null>(null)  // Right-side lightweight slide-out
  const [detailId,      setDetailId]      = useState<string | null>(null)  // Full page (replaces the numbers table)
  const [acquireOpen,   setAcquireOpen]   = useState(false)
  const [releaseOpen,   setReleaseOpen]   = useState(false)
  const [addAgentOpen,  setAddAgentOpen]  = useState(false)

  // Numbers-tab controls
  const [numFilter,     setNumFilter]     = useState<NumberFilter>("all")
  const [numSearch,     setNumSearch]     = useState("")

  // The number that's currently "focused" — for release/add-agent modals we
  // prefer the full-view target when it exists, else the preview target.
  const focusedId       = detailId ?? previewId
  const focusedNumber   = numbers.find(n => n.id === focusedId) ?? null
  const previewNumber   = numbers.find(n => n.id === previewId) ?? null
  const detailNumber    = numbers.find(n => n.id === detailId)  ?? null
  const agentDetailAgent = voiceAgents.find(a => a.id === agentDetailId) ?? null

  const filteredNumbers = useMemo(() => {
    return numbers.filter(n => {
      if (numFilter === "active"    && n.status !== "active")    return false
      if (numFilter === "suspended" && n.status !== "suspended") return false
      if (!numSearch) return true
      const q = numSearch.toLowerCase()
      const agentNames = n.agents.map(id => AGENTS.find(a => a.id === id)?.name ?? "").join(" ").toLowerCase()
      return n.number.includes(numSearch) || n.label.toLowerCase().includes(q) || agentNames.includes(q)
    })
  }, [numbers, numFilter, numSearch])

  const counts = useMemo(() => ({
    all:       numbers.length,
    active:    numbers.filter(n => n.status === "active").length,
    suspended: numbers.filter(n => n.status === "suspended").length,
  }), [numbers])

  // ── Mutation handlers ──────────────────────────────────────────────

  function updateNumber(patch: PhoneNumberRecord) {
    setNumbers(prev => prev.map(n => n.id === patch.id ? patch : n))
  }
  function removeNumber(id: string) {
    setNumbers(prev => prev.filter(n => n.id !== id))
  }
  function addNumber(n: PhoneNumberRecord) {
    setNumbers(prev => [...prev, n])
  }

  // ── Numbers table columns ──────────────────────────────────────────

  const columns: TableColumn<PhoneNumberRecord>[] = [
    {
      key: "number", header: "Number", width: "170px",
      render: (n) => (
        <span className="font-mono text-[13px]" style={{ color: "var(--color-text-title)", fontWeight: 500 }}>
          {n.number}
        </span>
      ),
    },
    {
      key: "label", header: "Label", width: "160px",
      render: (n) => n.label
        ? <span style={{ color: "var(--color-text-title)" }}>{n.label}</span>
        : <span style={{ color: "var(--color-text-caption)" }}>—</span>,
    },
    {
      key: "status", header: "Status", width: "110px",
      render: (n) => <NumberStatusTag status={n.status}/>,
    },
    {
      key: "agents", header: "Agents", width: "170px",
      render: (n) => {
        if (n.agents.length === 0) {
          return <span style={{ fontSize: 11, color: "var(--color-text-caption)", fontStyle: "italic" }}>Unassigned</span>
        }
        const found = n.agents.map(id => AGENTS.find(a => a.id === id)!).filter(Boolean)
        return <AgentAvatarStack colors={found.map(a => a.color)} initials={found.map(a => a.initials)} max={3}/>
      },
    },
    {
      key: "dist", header: "Distribution", width: "130px",
      render: (n) => <span style={{ fontSize: 12, color: "var(--color-text-caption)" }}>{n.dist}</span>,
    },
    {
      key: "hil", header: "HiL", width: "80px",
      render: (n) => <HilBadge hil={n.hil}/>,
    },
    {
      key: "calls", header: "Calls 30d", width: "100px", align: "right",
      render: (n) => (
        <span style={{ color: "var(--color-text-caption)", fontVariantNumeric: "tabular-nums" }}>
          {n.calls.toLocaleString()}
        </span>
      ),
    },
    {
      key: "cost", header: "Cost MTD", width: "100px", align: "right",
      render: (n) => (
        <span style={{ color: "var(--color-text-caption)", fontVariantNumeric: "tabular-nums" }}>
          ${n.cost.toFixed(2)}
        </span>
      ),
    },
    {
      key: "view", header: "", width: "70px", align: "right",
      render: () => (
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>View →</span>
      ),
    },
  ]

  return (
    <>
      <ScreenLayout
        sidebarItems={VOICE_SIDEBAR}
        activeSidebarId="voice"
        sidebarFooter={renderSidebarFooter}
        header={(isScrolled) => (
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={
              agentDetailAgent    ? `${agentDetailAgent.name} — ${agentDetailAgent.purpose}` :
              detailNumber        ? detailNumber.number :
                                    "Voice Channel"
            }
            description={
              agentDetailAgent    ? `AI voice agent · ${agentDetailAgent.status}` :
              detailNumber        ? `${detailNumber.label || "No label"} · ${detailNumber.type} · Full configuration` :
                                    "Phone numbers, call history, and workspace defaults for the Voice channel."
            }
          />
        )}
      >
        <div className="flex flex-col gap-4" style={{ minHeight: agentDetailAgent ? "70vh" : undefined }}>
          {/* When a number OR an agent is opened in the full-page view,
              the top-level Tabs and all list content are hidden — the
              detail page owns the screen. */}
          {agentDetailAgent ? (
            <VoiceAgentDetailPage
              agent={agentDetailAgent}
              onBack={() => setAgentDetailId(null)}
              onChange={(patch) => setVoiceAgents(prev => prev.map(a => a.id === patch.id ? patch : a))}
              numbers={numbers}
              onOpenAddNumber={() => setAcquireOpen(true)}
            />
          ) : detailNumber ? (
            <NumberDetailPage
              number={detailNumber}
              onBack={() => setDetailId(null)}
              onChange={updateNumber}
              onRelease={() => setReleaseOpen(true)}
              onAddAgent={() => setAddAgentOpen(true)}
              allCalls={calls}
            />
          ) : (<>
          {/* Top-level tabs with counts */}
          <Tabs
            items={[
              { id: "numbers",  label: `Numbers (${numbers.length})`,      icon: Phone         },
              { id: "history",  label: `Call History (${calls.length})`,   icon: PhoneCall     },
              { id: "agents",   label: `Agents (${voiceAgents.length})`,   icon: Bot           },
              { id: "settings", label: "Settings",                          icon: SettingsIcon },
            ]}
            activeId={tab}
            onChange={(id) => setTab(id as TopTab)}
          />

          {tab === "numbers" && (
            <div className="flex flex-col gap-4">
              {/* Toolbar: search + filter chips + Acquire */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Filters
                    showSearch
                    searchPlaceholder="Search by number, label, or agent…"
                    searchValue={numSearch}
                    onSearchChange={setNumSearch}
                    showAllFilters={false}
                    showSort={false}
                    showViewToggle={false}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(["all", "active", "suspended"] as const).map(f => (
                    <Chip
                      key={f}
                      variant={numFilter === f ? "primary" : "secondary"}
                      size="s"
                      onClick={() => setNumFilter(f)}
                    >
                      {f === "all"    ? `All ${counts.all}`
                       : f === "active" ? `Active ${counts.active}`
                       :                  `Suspended ${counts.suspended}`}
                    </Chip>
                  ))}
                </div>
                <Button variant="primary" size="default" icon={<Plus size={14}/>} iconPosition="left" onClick={() => setAcquireOpen(true)}>
                  Acquire Number
                </Button>
              </div>

              {/* Table or full empty state */}
              {numbers.length === 0 ? (
                <EmptyState
                  icon={Phone}
                  title="No phone numbers yet"
                  description="Acquire a number to start routing calls to your agents."
                  ctaLabel="Acquire your first number"
                  onCta={() => setAcquireOpen(true)}
                />
              ) : filteredNumbers.length === 0 ? (
                <CardContainer variant="default" size="default">
                  <EmptyState
                    icon={numSearch ? Search : Phone}
                    title={numSearch ? `No numbers match "${numSearch}"` : "No matching numbers"}
                    description={numSearch ? "Try a different search or clear it." : "Try switching to a different filter chip."}
                    ctaLabel={numSearch ? "Clear search" : "Show all"}
                    onCta={numSearch ? () => setNumSearch("") : () => setNumFilter("all")}
                  />
                </CardContainer>
              ) : (
                <Table
                  columns={columns}
                  data={filteredNumbers}
                  size="default"
                  rowKey={n => n.id}
                  selectedRowKey={previewId ?? detailId}
                  onRowClick={(row) => setPreviewId(row.id)}
                />
              )}
            </div>
          )}

          {tab === "history"  && <CallHistoryTab calls={calls} numbers={numbers}/>}
          {tab === "agents"   && (
            <VoiceAgentsTab
              agents={voiceAgents}
              onOpenAgent={(id) => setAgentDetailId(id)}
            />
          )}
          {tab === "settings" && <SettingsTab/>}
          </>)}
        </div>
      </ScreenLayout>

      {/* Lightweight preview slide-out — only opens over the Numbers list.
          "View full details →" hands off to the full page (setDetailId). */}
      <NumberPreview
        number={previewNumber}
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        onOpenFull={() => {
          if (previewId) setDetailId(previewId)
          setPreviewId(null)
        }}
        onRelease={() => setReleaseOpen(true)}
        allCalls={calls}
      />

      {/* Acquire Number wizard */}
      <AcquireNumberModal
        open={acquireOpen}
        onClose={() => setAcquireOpen(false)}
        onAcquire={(newNum) => {
          addNumber(newNum)
          setAcquireOpen(false)
          toast.info("Go to the number to add agents")
        }}
      />

      {/* Release confirmation — acts on whichever number is currently focused
          (full page view has priority over the preview). */}
      <ReleaseNumberModal
        number={focusedNumber}
        open={releaseOpen}
        onClose={() => setReleaseOpen(false)}
        onConfirm={() => {
          if (focusedNumber) removeNumber(focusedNumber.id)
          setReleaseOpen(false)
          setPreviewId(null)
          setDetailId(null)
          toast.success("Number released. Billing will stop next cycle.")
        }}
      />

      {/* Add Agent to the focused number */}
      <AddAgentModal
        number={focusedNumber}
        open={addAgentOpen}
        onClose={() => setAddAgentOpen(false)}
        onConfirm={(agentIds) => {
          if (!focusedNumber) return
          const added = agentIds.filter(id => !focusedNumber.agents.includes(id))
          updateNumber({ ...focusedNumber, agents: [...focusedNumber.agents, ...added] })
          setAddAgentOpen(false)
          if (added.length > 0) {
            toast.success(`${added.length} agent${added.length > 1 ? "s" : ""} added`)
          }
        }}
      />
    </>
  )
}
