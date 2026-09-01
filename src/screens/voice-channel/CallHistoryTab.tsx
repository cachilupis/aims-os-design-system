import { useMemo, useState } from "react"
import { PhoneCall, Search } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { Filters } from "@/components/ui/filters"
import { Select } from "@/components/ui/select"
import { CardContainer } from "@/components/ui/card-container"
import { EmptyState } from "@/components/ui/empty-state"
import { Table, type TableColumn } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { Call, PhoneNumberRecord, CallDirection } from "./data"
import { AGENTS } from "./data"
import { AgentAvatar, HilBadge, SentimentTag } from "./shared"
import { CallPreview } from "./CallPreview"
import { CallDetailPage } from "./CallDetailPage"

type DirFilter = "all" | CallDirection | "hil"

interface CallHistoryTabProps {
  calls:   Call[]
  numbers: PhoneNumberRecord[]
}

export function CallHistoryTab({ calls, numbers }: CallHistoryTabProps) {
  const [dirFilter, setDirFilter]     = useState<DirFilter>("all")
  const [search,    setSearch]        = useState("")
  const [dateRange, setDateRange]     = useState("Last 7 days")
  const [previewId, setPreviewId]     = useState<string | null>(null)  // Slide-out preview
  const [detailId,  setDetailId]      = useState<string | null>(null)  // Full-page detail

  const filtered = useMemo(() => {
    return calls.filter(c => {
      if (dirFilter === "inbound"  && c.direction !== "inbound")  return false
      if (dirFilter === "outbound" && c.direction !== "outbound") return false
      if (dirFilter === "hil"      && !c.hil)                     return false
      if (!search) return true
      const q = search.toLowerCase()
      return c.caller.includes(search) || (AGENTS.find(a => a.id === c.agent)?.name ?? "").toLowerCase().includes(q)
    })
  }, [calls, dirFilter, search])

  const previewCall = calls.find(c => c.id === previewId) ?? null
  const detailCall  = calls.find(c => c.id === detailId)  ?? null

  // Full page view takes over the tab body when a call is opened
  if (detailCall) {
    return (
      <CallDetailPage
        call={detailCall}
        number={numbers.find(n => n.id === detailCall.numberId) ?? null}
        onBack={() => setDetailId(null)}
      />
    )
  }

  const columns: TableColumn<Call>[] = [
    {
      key: "time", header: "Time", width: "110px",
      render: (c) => <span style={{ fontSize: 12, color: "var(--color-text-caption)", whiteSpace: "nowrap" }}>{c.time}</span>,
    },
    {
      key: "number", header: "Number", width: "160px",
      render: (c) => {
        const n = numbers.find(x => x.id === c.numberId)
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="font-mono text-[12px]" style={{ color: "var(--color-text-title)" }}>{n?.number}</span>
            {n?.label && <span style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{n.label}</span>}
          </div>
        )
      },
    },
    {
      key: "direction", header: "Dir", width: "110px",
      render: (c) => c.direction === "inbound"
        ? <Tag variant="success"     size="sm">↙ Inbound</Tag>
        : <Tag variant="informative" size="sm">↗ Outbound</Tag>,
    },
    {
      key: "caller", header: "Caller", width: "160px",
      render: (c) => <span className="font-mono text-[12px]" style={{ color: "var(--color-text-title)" }}>{c.caller}</span>,
    },
    {
      key: "agent", header: "Agent", width: "160px",
      render: (c) => {
        const a = AGENTS.find(x => x.id === c.agent)
        if (!a) return null
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AgentAvatar color={a.color} initials={a.initials} size={22}/>
            <span style={{ fontSize: 12, color: "var(--color-text-title)" }}>{a.name}</span>
          </div>
        )
      },
    },
    {
      key: "duration", header: "Duration", width: "90px",
      render: (c) => <span className="font-mono text-[12px]" style={{ color: "var(--color-text-caption)" }}>{c.duration}</span>,
    },
    {
      key: "sentiment", header: "Sentiment", width: "110px",
      render: (c) => <SentimentTag s={c.sentiment}/>,
    },
    {
      key: "hil", header: "HiL", width: "80px",
      render: (c) => <HilBadge hil={c.hil}/>,
    },
    {
      key: "cost", header: "Cost", width: "80px", align: "right",
      render: (c) => (
        <span style={{ color: "var(--color-text-caption)", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
          ${c.cost.toFixed(2)}
        </span>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Filters
              showSearch
              searchPlaceholder="Search transcripts…"
              searchValue={search}
              onSearchChange={setSearch}
              showAllFilters={false}
              showSort={false}
              showViewToggle={false}
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "inbound", "outbound", "hil"] as const).map(k => (
              <Chip
                key={k}
                variant={dirFilter === k ? "primary" : "secondary"}
                size="s"
                onClick={() => setDirFilter(k)}
              >
                {k === "all" ? "All" : k === "inbound" ? "Inbound" : k === "outbound" ? "Outbound" : "HiL only"}
              </Chip>
            ))}
            <Select
              value={dateRange}
              onClear={() => setDateRange("Last 7 days")}
              size="sm"
            />
          </div>
        </div>

        {/* Full-width table (no more split view — preview lives in a slide-out) */}
        {filtered.length === 0 ? (
          <CardContainer variant="default" size="default">
            <EmptyState
              icon={search ? Search : PhoneCall}
              title={search ? `No calls match "${search}"` : "No calls this filter"}
              description={search ? "Try clearing your search." : "Try a different direction filter."}
              ctaLabel={search ? "Clear search" : "Show all"}
              onCta={search ? () => setSearch("") : () => setDirFilter("all")}
            />
          </CardContainer>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            size="default"
            rowKey={c => c.id}
            selectedRowKey={previewId}
            onRowClick={(row) => setPreviewId(row.id)}
          />
        )}
      </div>

      {/* Preview slide-out */}
      <CallPreview
        call={previewCall}
        number={previewCall ? numbers.find(n => n.id === previewCall.numberId) ?? null : null}
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        onOpenFull={() => {
          if (previewId) setDetailId(previewId)
          setPreviewId(null)
        }}
      />
    </>
  )
}
