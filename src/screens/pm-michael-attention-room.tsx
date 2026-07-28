import { useState, useMemo, useEffect, useRef } from "react"
import { MousePointerClick, SearchX, ChevronDown, ChevronRight, ListChecks, Workflow } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScreenLayout }     from "@/components/layouts/screen-layout"
import type { SidebarItem } from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { CardContainer }    from "@/components/ui/card-container"
import { Input }            from "@/components/ui/input"
import { Chip }              from "@/components/ui/chip"
import { Tag }               from "@/components/ui/tag"
import type { TagVariant }   from "@/components/ui/tag"
import { Button }            from "@/components/ui/button"
import { EmptyState }        from "@/components/ui/empty-state"
import { InformativeCard }   from "@/components/ui/informative-card"
import { HighlightIcon, type HighlightIconVariant } from "@/components/ui/highlight-icon"
import { AdaptiveMetricGrid } from "@/components/ui/adaptive-metric-grid"
import { EntityList }        from "@/components/ui/entity-list"

// ── Sidebar ──────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home",       label: "Home",       icon: "Home"      },
  { id: "work",       label: "My Work",    icon: "Inbox"     },
  { id: "agents",     label: "Agents",     icon: "Bot"       },
  { id: "workflows",  label: "Workflows",  icon: "Zap"       },
  { id: "data",       label: "Data",       icon: "Database"  },
  { id: "governance", label: "Governance", icon: "Shield"    },
  { id: "reports",    label: "Reports",    icon: "BarChart2" },
  { id: "settings",   label: "Settings",   icon: "Settings"  },
]

// ── Data model ────────────────────────────────────────────────────────────────
// Card anatomy + item data adapted 1:1 from the AIMS OS DS Figma reference
// (Notifications pattern, file v6rmYKA2zmyXWOahlxLOeI, node 18766:7413) and
// Thom's widget-canvas prototype (thomzilla33.github.io/widget-canvas/home/attention
// — pages/AttentionRoom.jsx + components/attention/AttentionDetail.jsx).
// Optional detail fields (trigger/stakes/history) are populated per item to
// exercise the different cases AttentionDetail.jsx renders conditionally.

type AttnKind  = "approval" | "work" | "task" | "message"
type AttnGroup = "today" | "yesterday"

type AttentionItem = {
  id:          string
  kind:        AttnKind
  group:       AttnGroup
  title:       string
  description: string
  timestamp:   string
  unread?:     boolean
  iconName:    string
  iconVariant: HighlightIconVariant
  tags:        { label: string; variant: TagVariant }[]
  actions:     string[]   // 1–2 action labels, rendered left→right (primary→secondary)
  // "Why this came to you"
  trigger?:    { label: string; name: string; reason?: string }
  // "At stake"
  stakes?:     { workflows?: number; agents?: number }
  // "Similar decisions"
  history?:    { label: string; decision: "Approved" | "Declined" | "Completed"; by: string }[]
}

const ATTENTION_ITEMS: AttentionItem[] = [
  // ── Today ────────────────────────────────────────────────────────────────
  {
    id: "ATT-001", kind: "approval", group: "today",
    title: "Lead Qualification Agent needs approval",
    description: "AIMS AI recommends changing the priority of 18 leads before the next outbound run.",
    timestamp: "2 min ago", unread: true,
    iconName: "Bell", iconVariant: "purple",
    tags: [{ label: "AI Agent", variant: "purple" }, { label: "Action required", variant: "alert" }],
    actions: ["Review recommendation"],
    trigger: { label: "AI Agent", name: "Lead Qualification Agent", reason: "Recommends re-ranking 18 leads before the next outbound run." },
  },
  {
    id: "ATT-002", kind: "approval", group: "today",
    title: "Human review required for contract classification",
    description: "AI confidence dropped to 62% for Contract #CTR-2048. Human validation is required.",
    timestamp: "8 min ago", unread: true,
    iconName: "Bell", iconVariant: "alert",
    tags: [{ label: "HTL", variant: "neutral" }, { label: "Action required", variant: "alert" }],
    actions: ["Review"],
    trigger: { label: "HTL", name: "Confidence dropped to 62%", reason: "Contract #CTR-2048 requires human validation before continuing." },
    history: [{ label: "Similar contract review · 3 days ago", decision: "Approved", by: "You" }],
  },
  {
    id: "ATT-003", kind: "work", group: "today",
    title: "Customer Sync workflow failed",
    description: "Salesforce → HubSpot stopped at record 8,432 after 3 retries.",
    timestamp: "15 min ago", unread: true,
    iconName: "Bell", iconVariant: "error",
    tags: [{ label: "Workflow", variant: "neutral" }, { label: "Critical", variant: "error" }],
    actions: ["Retry", "View run"],
    trigger: { label: "Workflow", name: "Salesforce → HubSpot sync", reason: "Stopped at record 8,432 after 3 retries." },
    stakes: { workflows: 1 },
  },
  {
    id: "ATT-004", kind: "work", group: "today",
    title: "Unusual API access pattern detected",
    description: "A spike in requests from a new IP triggered automatic rate limiting.",
    timestamp: "32 min ago",
    iconName: "Shield", iconVariant: "error",
    tags: [{ label: "Security", variant: "error" }, { label: "Critical", variant: "error" }],
    actions: ["Investigate"],
    trigger: { label: "Security", name: "Rate limiting triggered", reason: "Spike in requests from a new, unrecognized IP address." },
  },
  {
    id: "ATT-005", kind: "work", group: "today",
    title: "Monthly performance report completed",
    description: "The workflow generated 47 pages and 12 charts with no errors.",
    timestamp: "1 hour ago",
    iconName: "CheckCircle2", iconVariant: "success",
    tags: [{ label: "Workflow", variant: "neutral" }, { label: "Success", variant: "success" }],
    actions: ["View report"],
  },
  {
    id: "ATT-006", kind: "task", group: "today",
    title: "Google Drive connection requires re-authentication",
    description: "Credentials expire in 24 hours and may pause dependent workflows.",
    timestamp: "2 hours ago",
    iconName: "Link2", iconVariant: "alert",
    tags: [{ label: "Integration", variant: "alert" }, { label: "Warning", variant: "alert" }],
    actions: ["Reconnect"],
    trigger: { label: "Integration", name: "Google Drive credentials expiring", reason: "Access token expires in 24 hours." },
    stakes: { workflows: 3 },
  },
  // ── Yesterday ────────────────────────────────────────────────────────────
  {
    id: "ATT-007", kind: "task", group: "yesterday",
    title: "You were assigned to Churn Risk Intervention",
    description: "You are now the owner of the Customer Success workflow.",
    timestamp: "Yesterday",
    iconName: "User", iconVariant: "informative",
    tags: [{ label: "Assignment", variant: "informative" }, { label: "Workflow", variant: "neutral" }],
    actions: ["Open workflow"],
    trigger: { label: "Assignment", name: "Ownership transferred to you", reason: "You are now responsible for the Customer Success workflow." },
  },
  {
    id: "ATT-008", kind: "work", group: "yesterday",
    title: "Runtime v3.2.1 deployed successfully",
    description: "All services are healthy. No errors were detected during the first 5 minutes.",
    timestamp: "Yesterday",
    iconName: "Zap", iconVariant: "success",
    tags: [{ label: "Deployment", variant: "success" }, { label: "Success", variant: "success" }],
    actions: ["View deployment"],
  },
  {
    id: "ATT-009", kind: "approval", group: "yesterday",
    title: "Support Triage Agent needs input",
    description: "The agent could not determine the priority for ticket #12045.",
    timestamp: "Yesterday",
    iconName: "Headphones", iconVariant: "alert",
    tags: [{ label: "AI Agent", variant: "purple" }, { label: "Action required", variant: "alert" }],
    actions: ["Classify"],
    trigger: { label: "AI Agent", name: "Support Triage Agent", reason: "Could not determine the priority for ticket #12045." },
    history: [{ label: "Similar ticket triage · 1 week ago", decision: "Approved", by: "You" }],
  },
]

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTER_TABS: { id: "all" | AttnKind; label: string }[] = [
  { id: "all",      label: "All"       },
  { id: "approval", label: "Approvals" },
  { id: "work",     label: "Work"      },
  { id: "task",     label: "Tasks"     },
  { id: "message",  label: "Messages"  },
]

// ── Group header meta — no background fill; a semantic Tag carries the count ──

const GROUP_META: Record<AttnGroup, { label: string; dot: string; tagVariant: TagVariant }> = {
  today:     { label: "Today",     dot: "var(--primary)",                     tagVariant: "informative" },
  yesterday: { label: "Yesterday", dot: "var(--color-icon-neutral-default)",  tagVariant: "neutral"     },
}

const GROUP_ORDER: AttnGroup[] = ["today", "yesterday"]

// ── Queue item card — mirrors the Figma "Card Component" anatomy exactly ──────

function AttentionQueueItemCard({
  item,
  selected,
  onSelect,
}: {
  item:      AttentionItem
  selected:  boolean
  onSelect:  () => void
}) {
  return (
    <CardContainer size="sm" selected={selected} onClick={onSelect}>
      <div className="flex items-start gap-[12px] w-full">
        <HighlightIcon size="sm" variant={item.iconVariant} iconName={item.iconName} />

        <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
          {/* Header: title + unread dot + timestamp */}
          <div className="flex items-center justify-between gap-[8px] w-full">
            <p className="flex-1 min-w-0 truncate" style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
              {item.title}
            </p>
            <div className="flex items-center gap-[8px] shrink-0">
              {item.unread && (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--tag-informative-fg)", display: "inline-block" }} />
              )}
              <span style={{ fontSize: 12, color: "var(--field-supporting)", whiteSpace: "nowrap" }}>{item.timestamp}</span>
            </div>
          </div>

          {/* Description */}
          <p style={{ margin: 0, fontSize: 12, color: "var(--field-supporting)", lineHeight: "20px" }}>
            {item.description}
          </p>

          {/* Footer: Tags (left) + tertiary Actions (right) */}
          <div className="flex items-center justify-between gap-[8px] w-full" style={{ minHeight: 28 }}>
            <div className="flex-1 flex flex-wrap gap-[8px] items-start min-w-0">
              {item.tags.map((tag, i) => (
                <Tag key={i} variant={tag.variant} size="sm">{tag.label}</Tag>
              ))}
            </div>
            <div className="flex items-start justify-end gap-[8px] shrink-0">
              {item.actions.map((action, i) => (
                <Button key={i} variant="tertiary" size="sm" onClick={e => { e.stopPropagation(); onSelect() }}>
                  {action}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardContainer>
  )
}

// ── Group header — plain title (no background) + count Tag + accordion chevron ─

function QueueGroupHeader({
  group,
  count,
  collapsed,
  onToggle,
}: {
  group:     AttnGroup
  count:     number
  collapsed: boolean
  onToggle:  () => void
}) {
  const meta = GROUP_META[group]
  return (
    <div
      className="flex items-center justify-between gap-[8px]"
      style={{ padding: "10px 16px 8px", borderBottom: "0.5px solid var(--field-border)" }}
    >
      <div className="flex items-center gap-[6px]">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--foreground)" }}>
          {meta.label}
        </span>
      </div>
      <div className="flex items-center gap-[6px]">
        <Tag variant={meta.tagVariant} size="sm">{count}</Tag>
        <Button
          variant="tertiary"
          size="sm"
          iconPosition="alone"
          icon={collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          onClick={onToggle}
          aria-label={collapsed ? `Expand ${meta.label}` : `Collapse ${meta.label}`}
        />
      </div>
    </div>
  )
}

// ── Section label — small uppercase caption used throughout the detail pane ───

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--field-label)", display: "block", marginBottom: 10 }}>
      {children}
    </span>
  )
}

// ── Detail pane — right section ────────────────────────────────────────────────
// Content composition follows the DS "SlideOut content" conventions (see the
// SlideOut/SidePanel — Content pattern page): key-value detail table, a
// Key Metrics grid (AdaptiveMetricGrid + HighlightCard), and a primary list
// (EntityList) for related history — instead of hand-rolled equivalents.

function AttentionDetailPane({
  item,
  onAction,
}: {
  item:     AttentionItem
  onAction: (item: AttentionItem, action: string) => void
}) {
  const [note, setNote] = useState("")
  const [posted, setPosted] = useState(false)

  useEffect(() => { setNote(""); setPosted(false) }, [item.id])

  const hasStakes = !!item.stakes && ((item.stakes.workflows ?? 0) > 0 || (item.stakes.agents ?? 0) > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header — title first, tags to the right. No divider below (per feedback). */}
      <div className="shrink-0 flex flex-col gap-[8px]" style={{ padding: "20px 24px 12px" }}>
        <div className="flex items-start justify-between gap-[12px]">
          <p style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 16, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.4 }}>
            {item.title}
          </p>
          <div className="flex items-center gap-[6px] flex-wrap justify-end shrink-0" style={{ maxWidth: "55%" }}>
            {item.tags.map((tag, i) => (
              <Tag key={i} variant={tag.variant} size="sm">{tag.label}</Tag>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{item.timestamp}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: "4px 24px 16px", gap: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--foreground)", lineHeight: 1.6 }}>
          {item.description}
        </p>

        {/* Why this came to you — only when the item has a trigger */}
        {item.trigger && (
          <div style={{ borderTop: "0.5px solid var(--field-border)", paddingTop: 16 }}>
            <SectionLabel>Why this came to you</SectionLabel>
            <div className="flex items-start gap-[10px]">
              <HighlightIcon size="sm" variant="informative" icon={<Workflow size={16} strokeWidth={1.75} />} />
              <div className="flex-1 min-w-0">
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{item.trigger.name}</p>
                {item.trigger.reason && (
                  <p style={{ margin: "2px 0 8px", fontSize: 12, color: "var(--field-supporting)", lineHeight: 1.5 }}>{item.trigger.reason}</p>
                )}
                <Tag variant="neutral" size="sm">{item.trigger.label}</Tag>
              </div>
            </div>
          </div>
        )}

        {/* At stake — Key Metrics, only when the item has impact numbers */}
        {hasStakes && (
          <div style={{ borderTop: "0.5px solid var(--field-border)", paddingTop: 16 }}>
            <SectionLabel>At stake</SectionLabel>
            <AdaptiveMetricGrid
              cards={[
                ...(item.stakes!.workflows ? [{ label: "Workflows blocked", value: item.stakes!.workflows, iconName: "Workflow" }] : []),
                ...(item.stakes!.agents    ? [{ label: "Agents waiting",   value: item.stakes!.agents,    iconName: "Bot"      }] : []),
              ]}
            />
          </div>
        )}

        {/* Similar decisions — primary list, only when history exists */}
        {item.history && item.history.length > 0 && (
          <div style={{ borderTop: "0.5px solid var(--field-border)", paddingTop: 16 }}>
            <SectionLabel>Similar decisions</SectionLabel>
            <CardContainer size="sm" className="!p-0 overflow-hidden">
              <EntityList
                items={item.history.map((h, i) => ({
                  id: `${item.id}-hist-${i}`,
                  title: h.label,
                  primaryMeta: [{ iconName: "User", label: `by ${h.by}` }],
                  state: { label: h.decision, variant: h.decision === "Approved" ? "success" : h.decision === "Declined" ? "error" : "informative" },
                }))}
              />
            </CardContainer>
          </div>
        )}

        {/* Detail table — always present */}
        <div style={{ borderTop: "0.5px solid var(--field-border)", paddingTop: 16 }}>
          {[
            { label: "Notification ID", value: item.id },
            { label: "Received",        value: item.timestamp },
          ].map((row, i, arr) => (
            <div key={row.label} className="flex items-center justify-between" style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "0.5px solid var(--field-border)" : "none" }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--field-label)" }}>
                {row.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Comment composer */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          <SectionLabel>Comment</SectionLabel>
          {posted ? (
            <div style={{ padding: "10px 12px", borderRadius: 8, fontSize: 12, background: "var(--color-surface-success-subtle)", color: "var(--tag-success-fg)" }}>
              ✓ Comment posted
            </div>
          ) : (
            <div className="flex" style={{ gap: 8 }}>
              <div className="flex-1">
                <Input placeholder="Add a comment…" value={note} onChange={e => setNote(e.target.value)} size="sm" />
              </div>
              <Button variant="secondary" size="sm" onClick={() => { if (note.trim()) setPosted(true) }}>Post</Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 flex items-center gap-[8px]" style={{ padding: "14px 24px", borderTop: "0.5px solid var(--field-border)" }}>
        {item.actions.map((action, i) => (
          <Button key={i} variant={i === 0 ? "primary" : "secondary"} size="sm" onClick={() => onAction(item, action)}>
            {action}
          </Button>
        ))}
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function PMMichaelAttentionRoomScreen() {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
  const [selectedId,  setSelectedId]  = useState<string | null>(ATTENTION_ITEMS[0]?.id ?? null)
  const [search,      setSearch]      = useState("")
  const [filterKind,  setFilterKind]  = useState<"all" | AttnKind>("all")
  const [toast,       setToast]       = useState<{ message: string; undo: () => void } | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<AttnGroup>>(new Set())

  // ── Drag-to-resize between the Queue and Detail sections ──────────────────
  const [queueWidth,  setQueueWidth]  = useState(420)
  const [isDragging,  setIsDragging]  = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: 0 })
  const MIN_QUEUE_WIDTH = 320
  const MAX_QUEUE_WIDTH = 640

  function handleResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startWidth: queueWidth }
    setIsDragging(true)

    const onMouseMove = (ev: MouseEvent) => {
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
      const delta = ev.clientX - dragRef.current.startX
      setQueueWidth(Math.max(MIN_QUEUE_WIDTH, Math.min(MAX_QUEUE_WIDTH, dragRef.current.startWidth + delta)))
    }
    const onMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  function toggleGroup(id: AttnGroup) {
    setCollapsedGroups(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const allItems = useMemo(
    () => ATTENTION_ITEMS.filter(i => !resolvedIds.has(i.id)),
    [resolvedIds],
  )

  const filteredItems = useMemo(() => {
    let items = allItems
    if (filterKind !== "all") items = items.filter(i => i.kind === filterKind)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.label.toLowerCase().includes(q)),
      )
    }
    return items
  }, [allItems, search, filterKind])

  const groups = useMemo(
    () => GROUP_ORDER
      .map(id => ({ id, items: filteredItems.filter(i => i.group === id) }))
      .filter(g => g.items.length > 0),
    [filteredItems],
  )

  const flatIds = useMemo(() => groups.flatMap(g => g.items.map(i => i.id)), [groups])

  useEffect(() => {
    if (!selectedId || !allItems.some(i => i.id === selectedId)) {
      setSelectedId(flatIds[0] ?? allItems[0]?.id ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allItems, flatIds])

  const selectedItem = allItems.find(i => i.id === selectedId) ?? null
  const isFiltered = search.trim() !== "" || filterKind !== "all"

  function showToast(message: string, undo: () => void) {
    setToast({ message, undo })
    setTimeout(() => setToast(null), 4000)
  }

  function handleAction(item: AttentionItem, action: string) {
    setResolvedIds(prev => new Set([...prev, item.id]))
    const idx = flatIds.indexOf(item.id)
    setSelectedId(flatIds[idx + 1] ?? flatIds[idx - 1] ?? null)
    showToast(
      `"${action}" — ${item.title.length > 40 ? item.title.slice(0, 40) + "…" : item.title}`,
      () => setResolvedIds(prev => { const n = new Set(prev); n.delete(item.id); return n }),
    )
  }

  return (
    <ScreenLayout
      workspaceName="AIMS OS"
      userName="Michael O."
      userEmail="michael.orellana@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="home"
      header={() => (
        <Header
          size="size-m"
          backButton
          icon={ListChecks}
          iconVariant="informative"
          title="Work Queue"
          description={
            allItems.length > 0
              ? `${allItems.length} item${allItems.length !== 1 ? "s" : ""} in queue`
              : "All clear — nothing needs your attention right now."
          }
        />
      )}
    >
      {/* Reclaim ScreenLayout's reserved 8px top / 64px bottom (pagination) padding — this
          view has no Pagination, so the two sections should use the full content height. */}
      <div className="flex" style={{ height: "calc(100% + 72px)", margin: "-8px 0 -64px" }}>

        {/* ── Section: Queue ── */}
        <div
          className="shrink-0 h-full flex flex-col overflow-hidden"
          style={{ width: queueWidth, borderRight: "0.5px solid var(--field-border)" }}
        >
          <div className="shrink-0 flex flex-col" style={{ padding: "16px 16px 12px", gap: 12, borderBottom: "0.5px solid var(--field-border)" }}>
            <div className="flex items-center gap-[8px]">
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Queue</span>
              <Tag variant="informative" size="sm">{allItems.length}</Tag>
              {isFiltered && filteredItems.length !== allItems.length && (
                <Tag variant="neutral" size="sm">{filteredItems.length} shown</Tag>
              )}
            </div>
            <Input placeholder="Search queue…" value={search} onChange={e => setSearch(e.target.value)} size="sm" />
            <div className="flex items-center gap-[4px] flex-wrap">
              {FILTER_TABS.map(tab => (
                <Chip
                  key={tab.id}
                  variant={filterKind === tab.id ? "primary" : "secondary"}
                  size="s"
                  onClick={() => setFilterKind(tab.id)}
                >
                  {tab.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {groups.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={isFiltered ? "No results" : "All clear"}
                description={isFiltered ? "Try a different search or filter." : "Nothing needs your attention right now."}
                ctaLabel={isFiltered ? "Clear filters" : undefined}
                onCta={isFiltered ? () => { setSearch(""); setFilterKind("all") } : undefined}
              />
            ) : (
              groups.map(group => {
                const collapsed = collapsedGroups.has(group.id)
                return (
                  <div key={group.id}>
                    <QueueGroupHeader
                      group={group.id}
                      count={group.items.length}
                      collapsed={collapsed}
                      onToggle={() => toggleGroup(group.id)}
                    />
                    {!collapsed && (
                      <div className="flex flex-col" style={{ gap: 12, padding: "12px 16px" }}>
                        {group.items.map(item => (
                          <AttentionQueueItemCard
                            key={item.id}
                            item={item}
                            selected={item.id === selectedId}
                            onSelect={() => setSelectedId(item.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Drag-to-resize handle ── */}
        <div
          className="relative shrink-0 h-full group/rz flex items-center"
          style={{ width: 12, marginLeft: -6, marginRight: -6, cursor: "col-resize", zIndex: 5 }}
          onMouseDown={handleResizeMouseDown}
        >
          <div
            className={cn("absolute inset-y-0 transition-opacity duration-150", isDragging ? "opacity-100" : "opacity-0 group-hover/rz:opacity-100")}
            style={{ left: 5, width: 1, background: "var(--primary)" }}
          />
          <div
            className={cn("absolute flex flex-col gap-[3px] transition-opacity duration-150", isDragging ? "opacity-100" : "opacity-0 group-hover/rz:opacity-100")}
            style={{ left: 3, top: "50%", transform: "translateY(-50%)" }}
          >
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-full" style={{ width: 3, height: 3, background: "var(--primary)" }} />
            ))}
          </div>
        </div>

        {/* ── Section: Detail ── */}
        <div className="flex-1 h-full min-w-0 overflow-hidden">
          {selectedItem ? (
            <AttentionDetailPane item={selectedItem} onAction={handleAction} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                icon={MousePointerClick}
                title="Select an item"
                description="Pick an item from the queue to see full context and decision options."
              />
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100, width: 340 }}>
          <InformativeCard
            state="success"
            size="sm"
            title={toast.message}
            cta={{ label: "Undo", onClick: () => { toast.undo(); setToast(null) } }}
          />
        </div>
      )}
    </ScreenLayout>
  )
}
