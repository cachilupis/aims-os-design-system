import { useMemo, useState } from "react"
import { Phone, Shield, Users, Plus, Trash2, Info } from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Tabs } from "@/components/ui/tabs"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { Table, TableCellAvatarGroup, type TableColumn } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { CardContainer } from "@/components/ui/card-container"
import { Toggle } from "@/components/ui/toggle"
import { Select } from "@/components/ui/select"
import { HighlightCard } from "@/components/ui/highlight-card"
import { InformativeCard } from "@/components/ui/informative-card"
import type { SidebarItem } from "@/components/ui/sidebar"
import { NUMBERS, computeNumbersKpis, type PhoneNumber, type NumberType } from "./voice/data"

// ── Sidebar for the Voice module ───────────────────────────────────────

const VOICE_SIDEBAR: SidebarItem[] = [
  { id: "home",         label: "Home",         icon: "Home" },
  { id: "agents",       label: "Agents",       icon: "Sparkle" },
  { id: "automations",  label: "Automations",  icon: "Zap" },
  { id: "voice",        label: "Voice",        icon: "Phone" },
  { id: "voice-agents", label: "Voice Agents", icon: "Bot" },
  { id: "knowledge",    label: "Knowledge",    icon: "LayoutGrid", hasChildren: true },
  { id: "contacts",     label: "Contacts",     icon: "User" },
]

// ── Helpers ────────────────────────────────────────────────────────────

const TYPE_TAG: Record<Exclude<NumberType, null>, { variant: "informative" | "purple" | "neutral"; label: string }> = {
  inbound:  { variant: "informative", label: "Inbound"  },
  outbound: { variant: "purple",      label: "Outbound" },
  both:     { variant: "neutral",     label: "In + Out" },
}

function filterMatches(row: PhoneNumber, filter: string, q: string): boolean {
  if (filter === "inbound"    && !(row.type === "inbound"  || row.type === "both")) return false
  if (filter === "outbound"   && !(row.type === "outbound" || row.type === "both")) return false
  if (filter === "unassigned" && row.status !== "unassigned")                        return false
  if (!q) return true
  const hay = `${row.number} ${row.label ?? ""} ${row.agent?.name ?? ""}`.toLowerCase()
  return hay.includes(q.toLowerCase())
}

// ── Numbers tab ────────────────────────────────────────────────────────

function NumbersTab() {
  const kpis = computeNumbersKpis()
  const [filter, setFilter]     = useState<"all" | "inbound" | "outbound" | "unassigned">("all")
  const [search, setSearch]     = useState("")
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const filtered = useMemo(
    () => NUMBERS.filter(r => filterMatches(r, filter, search)),
    [filter, search]
  )

  const counts = useMemo(() => ({
    all:        NUMBERS.length,
    inbound:    NUMBERS.filter(r => r.type === "inbound"  || r.type === "both").length,
    outbound:   NUMBERS.filter(r => r.type === "outbound" || r.type === "both").length,
    unassigned: NUMBERS.filter(r => r.status === "unassigned").length,
  }), [])

  const columns: TableColumn<PhoneNumber>[] = [
    {
      key: "number", header: "Number", width: "180px",
      render: (r) => (
        <span
          className="font-mono text-[13px]"
          style={{ opacity: r.status === "unassigned" ? 0.45 : 1, color: "var(--color-text-title)" }}
        >
          {r.number}
        </span>
      ),
    },
    {
      key: "label", header: "Label", width: "140px",
      render: (r) => r.label
        ? <span style={{ fontWeight: 500, color: "var(--color-text-title)" }}>{r.label}</span>
        : <span style={{ color: "var(--color-text-caption)", fontStyle: "italic" }}>No label</span>,
    },
    {
      key: "type", header: "Type", width: "110px",
      render: (r) => r.type
        ? <Tag variant={TYPE_TAG[r.type].variant} size="sm">{TYPE_TAG[r.type].label}</Tag>
        : <span style={{ color: "var(--color-text-caption)" }}>—</span>,
    },
    {
      key: "status", header: "Status", width: "110px",
      render: (r) => r.status === "active"
        ? <Tag variant="success"   size="sm">Active</Tag>
        : <Tag variant="secondary" size="sm">Unassigned</Tag>,
    },
    {
      key: "assigned", header: "Assigned to", width: "170px",
      render: (r) => {
        if (!r.agent) return <span style={{ color: "var(--color-text-caption)" }}>Not assigned</span>
        const names = [r.agent.name, ...(r.agent.extraNames ?? [])]
        return <TableCellAvatarGroup names={names} max={3} size="default" />
      },
    },
    {
      key: "caps", header: "Capabilities", width: "150px",
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.capabilities.map(c => (
            <Tag key={c} variant={c === "Voice" ? "informative" : "purple"} size="sm">{c}</Tag>
          ))}
        </div>
      ),
    },
    {
      key: "calls", header: "Calls 30d", width: "90px", align: "right",
      render: (r) => (
        <span style={{
          fontWeight: 600,
          color: r.calls >= 200 ? "var(--primary)" : "var(--color-text-body)",
        }}>{r.calls}</span>
      ),
    },
  ]

  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return (
    <div className="flex flex-col gap-6">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        <HighlightCard label="Total Numbers" value={kpis.total}       iconName="Phone"      feedback="+8 this month"           feedbackType="positive" />
        <HighlightCard label="Active"        value={kpis.active}      iconName="CheckCircle" feedback={`${kpis.unassigned} unassigned`} feedbackType="neutral" />
        <HighlightCard label="Calls Today"   value={kpis.callsToday}  iconName="PhoneCall"  feedback="+62 vs yesterday"        feedbackType="positive" />
        <HighlightCard label="Avg Duration"  value={kpis.avgDuration} iconName="Clock"      feedback="minutes"                 feedbackType="neutral" />
      </div>

      {/* Segmented filter + search + primary action */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {(["all", "inbound", "outbound", "unassigned"] as const).map(f => (
            <Chip
              key={f}
              variant={filter === f ? "primary" : "secondary"}
              size="s"
              onClick={() => { setFilter(f); setPage(1) }}
            >
              {f === "all"        ? `All ${counts.all}`
               : f === "inbound"  ? `Inbound ${counts.inbound}`
               : f === "outbound" ? `Outbound ${counts.outbound}`
               :                    `Unassigned ${counts.unassigned}`}
            </Chip>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Search numbers or labels…"
            size="sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ width: 240 }}
            aria-label="Search numbers or labels"
          />
          <Button variant="primary" size="sm" icon={<Plus size={14}/>} iconPosition="left">
            Buy Number
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <Table
          columns={columns}
          data={paged}
          size="default"
          emptyIcon={Phone}
          emptyTitle="No numbers match the current filter."
          emptyDescription="Try clearing the search or changing the filter chips above."
        />
        {filtered.length > 0 && (
          <div className="mt-3">
            <Pagination
              currentPage={page}
              totalItems={filtered.length}
              itemsPerPage={pageSize}
              onPageChange={setPage}
              onItemsPerPageChange={(n) => { setPageSize(n); setPage(1) }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Security tab ───────────────────────────────────────────────────────

function SecurityTab() {
  const [blocklist, setBlocklist] = useState<string[]>(["+1-800-*", "Unknown / No ID"])
  const [blockInput, setBlockInput] = useState("")
  const [geoEnabled, setGeoEnabled] = useState(false)
  const [rateEnabled, setRateEnabled] = useState(false)
  const [rateValue, setRateValue] = useState("100")

  function addBlock() {
    const v = blockInput.trim()
    if (!v || blocklist.includes(v)) return
    setBlocklist([...blocklist, v])
    setBlockInput("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>Security</p>
        <p style={{ fontSize: 14, color: "var(--color-text-caption)" }}>
          Channel-wide policies that apply to all phone numbers assigned to the Voice channel.
        </p>
      </div>

      {/* Tenant-wide info banner */}
      <InformativeCard
        state="informative"
        title="Bot & spam detection is configured tenant-wide"
        description="Applies to all channels. Manage it in Workspace Settings → Security."
      />

      {/* 3-card grid — Block List, Geo, Rate Limit */}
      <div className="grid grid-cols-2 gap-4">
        <CardContainer variant="default" size="default">
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>Block List</div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 16 }}>
            Numbers or patterns that are blocked for all inbound and outbound calls across this channel.
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            {blocklist.map(v => (
              <Tag key={v} variant="neutral" size="sm"
                   trailingIcon={
                     <button
                       aria-label={`Remove ${v} from block list`}
                       onClick={() => setBlocklist(blocklist.filter(x => x !== v))}
                       style={{ background: "none", border: "none", padding: 0, cursor: "pointer", opacity: 0.6, color: "inherit" }}
                     >
                       <Trash2 size={12}/>
                     </button>
                   }>
                {v}
              </Tag>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              size="sm"
              placeholder="e.g. +18005551234 or +1800*"
              value={blockInput}
              onChange={e => setBlockInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addBlock()}
              style={{ flex: 1 }}
              aria-label="Add number or pattern to block list"
            />
            <Button variant="secondary" size="sm" onClick={addBlock}>Add</Button>
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 8 }}>
            Accepts full numbers or prefix patterns using <span className="font-mono">*</span>.
          </p>
        </CardContainer>

        <CardContainer variant="default" size="default">
          <div className="flex items-center justify-between mb-1">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>Geo Restrictions</div>
            <Toggle checked={geoEnabled} onChange={setGeoEnabled} size="default" />
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 16 }}>
            Restrict calls to permitted countries only. All others are blocked.
          </div>
          {geoEnabled ? (
            <>
              <Select placeholder="Select permitted countries…" size="sm" leadingIcon={<Users size={14}/>} />
              <p style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 8 }}>
                Only calls from selected countries are permitted.
              </p>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>All countries permitted when disabled.</div>
          )}
        </CardContainer>

        <CardContainer variant="default" size="default">
          <div className="flex items-center justify-between mb-1">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>Rate Limiting</div>
            <Toggle checked={rateEnabled} onChange={setRateEnabled} size="default" />
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 16 }}>
            Reject calls that exceed a maximum volume threshold per time window.
          </div>
          {rateEnabled ? (
            <>
              <div className="flex gap-2 items-center">
                <Input size="sm" value={rateValue} onChange={e => setRateValue(e.target.value)} style={{ width: 90 }} aria-label="Rate limit value" />
                <span style={{ fontSize: 12, color: "var(--color-text-caption)" }}>calls per</span>
                <Select value="minute" size="sm" />
              </div>
              <p style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 8 }}>
                Calls exceeding the limit are silently rejected.
              </p>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>No rate limit applied when disabled.</div>
          )}
        </CardContainer>

        <CardContainer variant="default" size="default">
          <div className="flex items-center justify-between mb-1">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>Recording & Consent</div>
            <Toggle checked={true} onChange={() => {}} size="default" />
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 16 }}>
            Play a consent notice at the start of every recorded call. Required by law in most US states.
          </div>
          <Select value="English (US) · standard notice" size="sm" leadingIcon={<Info size={14}/>} />
        </CardContainer>
      </div>
    </div>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────

export default function VoiceNumbersScreen() {
  const [tab, setTab] = useState<"numbers" | "security">("numbers")

  return (
    <ScreenLayout
      sidebarItems={VOICE_SIDEBAR}
      activeSidebarId="voice"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Voice"
          description="Phone numbers, policies and activity for the Voice channel."
        />
      )}
    >
      <div className="flex flex-col gap-6">
        <Tabs
          items={[
            { id: "numbers",  label: "Numbers",  icon: Phone },
            { id: "security", label: "Security", icon: Shield },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as "numbers" | "security")}
        />
        {tab === "numbers"  ? <NumbersTab  /> : null}
        {tab === "security" ? <SecurityTab /> : null}
      </div>
    </ScreenLayout>
  )
}
