/**
 * UCP — Unified Contact Profile (detail view).
 *
 * Read-only by design: the record is assembled by ingestion and agents, not
 * typed in here, so there is no create CTA. The one always-present entry point
 * is Ask — RecordHeader's own agent trigger — which opens the record's
 * assigned concierge in a side panel.
 *
 * The identity card is the DS's own RecordHeader. An earlier build of this
 * screen used a purpose-built EntityHeader instead, on three arguments: that
 * RecordHeader branched on three closed record shapes, that it carried the Next
 * Best Action inside itself where the Figma spec wanted a separate card below,
 * and that it had no state coverage. All three stopped being true. RecordHeader's
 * agnosticism pass dropped the closed variants, its redesign reintroduced the
 * Next Best Action deliberately as a protagonist block, and it now carries
 * per-zone loading and per-field masking. So this screen was rebuilt around what
 * the design system has rather than beside it, and the second component is gone.
 *
 * Two things that used to be ours belong to the component now, and both are
 * better there: the Next Best Action, which no longer needs placing, and the
 * card-width reflow, which RecordHeader measures on its own box.
 *
 * What stays ours is the chrome around it. The identity card and the tabs pin in
 * ScreenLayout's header zone, outside the scroll container, so the record stays
 * identified while its content scrolls.
 *
 * One deviation from CLAUDE.md's generic detail-page rule, and it is deliberate:
 * the page Header does NOT repeat the entity name, status tag and breadcrumb.
 * The Entity Header spec makes its own title the page subject ("the title
 * carries the profile heading level"), and the Figma view for this surface
 * shows only the parent list above the card. Printing the name and state twice,
 * 40px apart, is the thing that spec is avoiding.
 *
 * The states are exercised here rather than described:
 *   Loading     → the first paint of a record fetch, re-armed per record id.
 *   Restricted  → a record whose values sit behind a scope the viewer does not
 *                 hold. Decided by the session against the record, never by a
 *                 flag on the record: `locked` on the header, `masked` on each
 *                 governed field, and a body that follows. Leaving the facts on
 *                 screen under a header that says the values are governed would
 *                 be the page contradicting the header.
 *
 * Tabs: Overview · Snapshot · Activity · Drives
 *   Overview  → WidgetCanvasView (DS rule: any tab named Overview is a canvas)
 *   Snapshot  → this record's facts by knowledge plane (Truth / Sandbox / Sources)
 *   Activity  → interaction timeline, paginated
 *   Drives    → the Source Drives attached to this record
 */

import { useEffect, useMemo, useState } from "react"
import { ScreenLayout }      from "@/components/layouts/screen-layout"
import { WidgetCanvasView }  from "@/components/layouts/widget-canvas-view"
import type { CanvasSlot }   from "@/components/layouts/widget-canvas-view"
import { useWidgetSize }     from "@/components/layouts/widget-canvas-view"
import type { SidebarItem }  from "@/components/ui/sidebar"
import { Header }            from "@/components/ui/header"
import { Tabs }              from "@/components/ui/tabs"
import { Filters }           from "@/components/ui/filters"
import { Tag }               from "@/components/ui/tag"
import { Chip }              from "@/components/ui/chip"
import { Button }            from "@/components/ui/button"
import { Input }             from "@/components/ui/input"
import { Table }             from "@/components/ui/table"
import type { TableColumn }  from "@/components/ui/table"
import { CardContainer }     from "@/components/ui/card-container"
import { EntityList }        from "@/components/ui/entity-list"
import type { EntityListItemData } from "@/components/ui/entity-list"
import { EmptyState }        from "@/components/ui/empty-state"
import { HighlightIcon }     from "@/components/ui/highlight-icon"
import type { HighlightIconVariant } from "@/components/ui/highlight-icon"
import { AdaptiveMetricGrid } from "@/components/ui/adaptive-metric-grid"
import { AiSummaryWidget } from "@/components/experimental/ai-summary-widget"
import { Pagination }        from "@/components/ui/pagination"
import { SlideOut }          from "@/components/ui/slide-out"
import { Skeleton }          from "@/components/ui/skeleton"
import { Tooltip }           from "@/components/ui/tooltip"
import { EntityHeader }      from "@/components/ui/entity-header"
import type { EntityHeaderTag, RecordField, SecondaryMetadataItem } from "@/components/ui/entity-header"
import * as LucideIcons from "lucide-react"
import { Sparkle, Send, ScanLine, Inbox, HardDrive, FileSearch, Lock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { specForContact, tabsForContact } from "./ucpTypeModel"
import type { ProfileWidgetRow } from "./ucpTypeModel"
import {
  PANEL_CONTENT_CLASS, toAiInsights,
  ACTIVITY_PERIODS, elapsedGroupLabel, parseActivityAt, withinPeriod,
  PLANE_META, PLANE_ORDER, CHANNEL_META, CONCIERGE_PROMPTS,
  CONTACTS,
  AVATAR_TYPES, TYPE_ICON, TYPE_LABEL, entityState, restrictionFor, getRecordFields,
  getActivity, getConciergeOpening, getConnections, getDrives,
  getFacts, getGovernance, getRisk,
} from "./ucpShared"
import type {
  MetricVariant, StudyRow,
  ActivityChannel, ConciergeTurn, KnowledgePlane, StudyState, UcpContact, UcpDrive, UcpFact,
} from "./ucpShared"

export const UCP_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home",       label: "Home",       icon: "Home"      },
  { id: "work",       label: "My Work",    icon: "Inbox"     },
  { id: "contacts",   label: "Contacts",   icon: "Contact"   },
  { id: "agents",     label: "Agents",     icon: "Bot"       },
  { id: "workflows",  label: "Workflows",  icon: "Zap"       },
  { id: "knowledge",  label: "Knowledge",  icon: "BookOpen"  },
  { id: "governance", label: "Governance", icon: "Shield"    },
  { id: "admin",      label: "Admin",      icon: "Settings"  },
]

const ACTIVITY_PAGE_SIZE = 8

// ── Study widget — hidden when the study returned nothing, retry when it failed ─

function StudyWidget({ title, state, children }: { title: string; state: StudyState; children: React.ReactNode }) {
  if (state === "empty") return null
  if (state === "error") {
    // EmptyState, not a hand-rolled div. This screen shipped the hand-rolled
    // version; the design system fixed the same mistake in the sibling profile
    // (#95) before this one was rebased onto it, so the correction is adopted
    // here rather than rediscovered. CLAUDE.md is explicit that any section with
    // no content to show uses EmptyState — a failed load is exactly that.
    return (
      <EmptyState
        compact
        icon={LucideIcons.AlertCircle}
        title="Failed to load"
        description={`${title} data couldn't be retrieved for this record.`}
        ctaLabel="Retry"
        onCta={() => {}} // DS-GAP: wire to a real retry handler
      />
    )
  }
  return <>{children}</>
}

/**
 * Profile Card (catalog type `profile-card` — "key fields of one entity
 * record"). The type's own fields: label, value, and an icon that says what
 * KIND of fact it is.
 *
 * Every row carries a Tooltip on hover AND on focus. A label plus a value says
 * what the field is; the tooltip says why it matters — "Headquarters · Tampa,
 * FL. Where the account is registered, which decides the data residency rules
 * that apply." The DS asks for this on secondary metadata for the same reason,
 * and a field row is the same problem: an icon and two words cannot carry it.
 */
function MetricRows({ rows }: { rows: ProfileWidgetRow[] }) {
  const { availableHeight } = useWidgetSize()
  // 37px pitch per row now that each carries its own divider, 70px for the
  // widget's title chrome + padding.
  const maxRows = availableHeight ? Math.max(2, Math.floor((availableHeight - 70) / 37)) : rows.length
  const visible = rows.slice(0, maxRows)
  return (
    <div style={{ paddingBottom: 16, display: "flex", flexDirection: "column" }}>
      {visible.map((row, i) => (
        // Icon, then label, then value — left to right, in the order the eye
        // scans. The icon used to sit beside the value on the right, which meant
        // reading across the whole row to find out what kind of thing the number
        // was. Same arrangement the sibling profile settled on.
        //
        // The divider is --color-border-neutral-subtle, the same token the
        // SlideOut and Side Panel use for their internal separators. The last
        // row drops it: a rule under the final item draws a line to nothing.
        <Tooltip key={row.label} content={row.tooltip} side="cursor" triggerClassName="block min-w-0 w-full">
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
              borderBottom: i === visible.length - 1 ? "none" : "1px solid var(--color-border-neutral-subtle)",
            }}
          >
            <HighlightIcon size="sm" variant={row.variant} iconName={row.icon} />
            {/* One line, always. A wrapped label turns a 37px row into 55px, and
                the widget's fixed height then swallows the rows below it. */}
            <span
              style={{
                fontSize: 12, color: "var(--field-supporting)", flex: 1, minWidth: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              {row.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", whiteSpace: "nowrap" }}>
              {row.value}
            </span>
          </div>
        </Tooltip>
      ))}
    </div>
  )
}

/**
 * Stat Row (catalog id `status-warning`, the DS's "Status Warning Widget").
 *
 * Governance and Risk publish counters and scores — a compliance score, open
 * reviews, a risk score, open flags. They used to render through the same
 * MetricRows helper as Account and Employment, which made a *score* look like
 * a *field*: the widget catalog separates those on purpose, and reusing one
 * renderer for both is how the distinction stopped being visible.
 *
 * Three counters, which is what the DS widget is for, in the arrangement its
 * own renderer uses: HighlightIcon, the label in the counter's semantic colour,
 * the value at 14px. The fourth item every study carries is a DATE — last
 * audit, last scan — and a date is not a counter, so it goes underneath as the
 * line that says when this was last checked rather than into a fourth box.
 *
 * The icon sits beside the value when there is room and above it when there is
 * not: three boxes in a narrow slot leave about 94px each, and at that width an
 * icon on the left takes the space the number needs.
 */
function StatRowContent({ counters, checked }: {
  counters: StudyRow[]
  checked?: StudyRow
}) {
  const { isNarrow } = useWidgetSize()
  const labelColor: Record<MetricVariant, string> = {
    success:     "var(--color-text-success)",
    alert:       "var(--color-text-alert)",
    error:       "var(--color-text-error)",
    informative: "var(--color-text-info)",
    neutral:     "var(--color-text-subtitle)",
  }
  return (
    <div style={{ paddingBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {counters.slice(0, 3).map(c => (
          // The tooltip is the point of the hover, not a fallback for
          // truncation: "0" is not information, "no flags have been raised
          // since the last scan" is. On focus too, so it is not mouse-only.
          <Tooltip key={c.label} content={c.tooltip} side="cursor" triggerClassName="block min-w-0 w-full">
            <div
              style={{
                display: "flex",
                flexDirection: isNarrow ? "column" : "row",
                alignItems: isNarrow ? "flex-start" : "center",
                gap: isNarrow ? 8 : 12,
                padding: "12px 14px", borderRadius: 8, minWidth: 0, height: "100%",
                border: "1px solid var(--field-border)",
                background: "var(--widget-bg)",
              }}
            >
              <HighlightIcon size="md" variant={c.variant} iconName={c.icon} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 10, fontWeight: 500, lineHeight: 1.2, color: labelColor[c.variant],
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {c.label}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1, color: "var(--color-text-title)", whiteSpace: "nowrap" }}>
                  {c.value}
                </span>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
      {checked && (
        <Tooltip content={checked.tooltip} side="cursor" triggerClassName="block min-w-0">
          <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>
            {checked.label} · {checked.value}
          </span>
        </Tooltip>
      )}
    </div>
  )
}

/**
 * Last Activity Widget (catalog id `activity`, class 3 — Heavy, 9 GU).
 *
 * THE SAME ANATOMY THE LIBRARY DRAWS, which is the point: this used to be a
 * list with bottom dividers, a status Tag per row and a tertiary "View full
 * timeline" button under it — recognisably not the DS widget, which is what
 * Michael caught (2026-09-09). The catalogued widget is a stack of BORDERED,
 * CLICKABLE rows: a tinted icon tile, the title, then the time and a chevron
 * on the right, the description on its own line indented past the tile, and a
 * metadata row that appears on hover. 4px between rows, and the whole thing
 * scrolls inside the slot.
 *
 * Two deliberate differences from the library's renderer, both because this
 * one has real data behind it:
 *   · the tile is HighlightIcon rather than a hand-drawn 26px square — the
 *     audit's own rule, and it keeps a channel the same colour everywhere
 *   · the row opens the Activity tab, where this record's full trace lives,
 *     instead of a SlideOut with sample tabs
 *
 * Communication channels only, which is the widget's own rule — *"Don't mix
 * non-communication activity types in this widget: use Timeline for lifecycle
 * events."* Agent and system events are lifecycle, so they stay on the
 * Activity tab. Empty is a real state: a record whose only events are the
 * robot's own has genuinely never been contacted, and saying so is more useful
 * than a feed padded to look busy.
 */
const COMMS: ActivityChannel[] = ["call", "email", "meeting"]

function LastActivityContent({ contact, onViewAll }: { contact: UcpContact; onViewAll: () => void }) {
  const { availableHeight } = useWidgetSize()
  const [hovered, setHovered] = useState<string | null>(null)
  const items = useMemo(
    () => getActivity(contact).filter(a => COMMS.includes(a.channel)),
    [contact],
  )

  if (items.length === 0) {
    return (
      <EmptyState
        compact
        icon={Inbox}
        title="No interactions yet"
        description="Calls, emails and meetings with this contact will appear here."
      />
    )
  }

  // 74px pitch per row (two lines plus its border and the 4px gap), 70px for
  // the widget's title chrome and padding. Anything past that scrolls inside
  // the slot rather than being cut — WidgetFather owns that now.
  const maxItems = availableHeight ? Math.max(1, Math.floor((availableHeight - 70) / 74)) : items.length

  return (
    <div style={{ paddingBottom: 16, display: "flex", flexDirection: "column", gap: 4 }}>
      {items.slice(0, maxItems).map(a => {
        const meta = CHANNEL_META[a.channel]
        const showMeta = hovered === a.id
        return (
          <div
            key={a.id}
            role="button"
            tabIndex={0}
            onClick={onViewAll}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onViewAll() } }}
            onMouseEnter={() => setHovered(a.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(a.id)}
            onBlur={() => setHovered(null)}
            className="cursor-pointer rounded-[8px] px-[12px] py-[8px] transition-colors duration-150 hover:bg-[var(--color-surface-neutral-subtle)]"
            style={{ border: "0.5px solid var(--field-border)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HighlightIcon size="sm" variant="neutral" iconName={meta.icon} />
              <span
                title={a.title}
                style={{
                  fontSize: 13, fontWeight: 500, color: "var(--color-text-title)",
                  flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                {a.title}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                {/* The alert only — a badge on every row says nothing. */}
                {a.state.variant === "alert" && <LucideIcons.AlertTriangle size={11} style={{ color: "var(--color-text-alert)" }} />}
                {a.state.variant === "error" && <LucideIcons.XCircle       size={11} style={{ color: "var(--color-text-error)" }} />}
                <span style={{ fontSize: 11, color: "var(--color-text-subtitle)", whiteSpace: "nowrap" }}>{a.timestamp}</span>
                <LucideIcons.ChevronRight size={11} style={{ color: "var(--color-text-subtitle)" }} />
              </div>
            </div>
            <p
              title={a.meta}
              style={{
                fontSize: 12, color: "var(--color-text-body)", lineHeight: 1.4, margin: 0,
                paddingLeft: 34, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {a.meta}
            </p>
            <div style={{
              paddingLeft: 34,
              maxHeight: showMeta ? 20 : 0,
              opacity: showMeta ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 200ms ease, opacity 180ms ease",
            }}>
              <span style={{ fontSize: 10, color: "var(--color-text-subtitle)" }}>
                {meta.label} · {a.state.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Connections (catalog type `connections` — related contacts).
 *
 * People only, each with the relationship named and a Tooltip saying why they
 * are here. The data layer resolves every row against the roster, so a name
 * on this card is always a record you can open.
 */
function ConnectionsContent({ contact }: { contact: UcpContact }) {
  const { availableHeight } = useWidgetSize()
  const connections  = getConnections(contact)
  // 44px pitch per icon + two-line row, 70px for the widget's title chrome +
  // padding. At the default 4-row slot height that lands on 3 without clipping.
  const maxRows      = availableHeight ? Math.max(2, Math.floor((availableHeight - 70) / 44)) : 3
  const visible      = connections.slice(0, maxRows)
  const hidden       = connections.length - visible.length

  if (connections.length === 0) {
    return (
      <EmptyState
        compact
        icon={LucideIcons.Users}
        title="No related contacts"
        description="People connected to this record — coworkers, family — appear here once AIMS holds a record for them."
      />
    )
  }

  return (
    <div style={{ paddingTop: 4, paddingBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      {visible.map(c => (
        <Tooltip key={c.id} content={c.tooltip} side="cursor" triggerClassName="block min-w-0 w-full">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <HighlightIcon size="sm" variant="neutral" iconName={c.icon} />
            <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
              <span style={{ fontSize: 11, color: "var(--field-supporting)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.relation}</span>
            </div>
          </div>
        </Tooltip>
      ))}
      {hidden > 0 && (
        <Button variant="tertiary" size="sm" className="self-start !px-0" onClick={() => {}}>
          {`View ${hidden} more`}
        </Button>
      )}
    </div>
  )
}

/** The assigned agent's read on this record. Purple = "AI produced this",
 *  the same treatment EntityList's own aiInsight block uses. */
function AiSummaryContent({ contact, onAsk, onGoTab }: {
  contact: UcpContact
  onAsk:   () => void
  onGoTab: (id: string) => void
}) {
  const { isNarrow } = useWidgetSize()
  const insights = useMemo(
    () => toAiInsights(contact, {
      // A destination is either one of this record's own tabs or a section of
      // the platform. The tabs we can actually go to; the rest is a prototype
      // stub rather than a dead button pretending to work.
      onOpenDestination: dest => {
        const tab = dest.toLowerCase()
        if (["snapshot", "activity", "drives", "people", "overview"].includes(tab)) onGoTab(tab)
      },
    }),
    [contact, onGoTab],
  )
  return <AiSummaryWidget items={insights} onAsk={onAsk} compact={isNarrow} />
}

// ── Snapshot (Truth Facts) ────────────────────────────────────────────────────

const FACT_COLUMNS: TableColumn<UcpFact>[] = [
  {
    key: "label", header: "Fact", width: "22%",
    render: r => <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{r.label}</span>,
  },
  {
    key: "value", header: "Value",
    render: r => <span style={{ fontSize: 12, color: "var(--foreground)" }}>{r.value}</span>,
  },
  {
    key: "plane", header: "Plane", width: "14%",
    render: r => <Tag variant={PLANE_META[r.plane].tag} size="sm">{PLANE_META[r.plane].label}</Tag>,
  },
  {
    key: "confidence", header: "Confidence", width: "11%", align: "right",
    render: r => <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{PLANE_META[r.plane].confidence}</span>,
  },
  {
    key: "source", header: "Source", width: "22%",
    render: r => <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{r.source}</span>,
  },
  {
    key: "verifiedAt", header: "Last verified", width: "14%",
    render: r => <span style={{ fontSize: 12, color: "var(--field-supporting)", whiteSpace: "nowrap" }}>{r.verifiedAt}</span>,
  },
]

/**
 * One icon AND one tint per knowledge plane, so a plane looks the same
 * wherever it is counted. Truth is verified, Sandbox is provisional, Sources
 * is material.
 *
 * The tint is the same colour the plane's own Tag carries in the facts table
 * below (`PLANE_META[p].tag`) — Truth green, Sandbox yellow, Sources blue.
 * Three cards counting three different KINDS of knowledge all read
 * informative blue before this, so the only thing separating them was the
 * word in the label. Michael, 2026-09-09.
 */
const PLANE_ICON: Record<KnowledgePlane, string> = {
  truth:   "ShieldCheck",
  sandbox: "FlaskConical",
  sources: "Files",
}
const PLANE_ICON_VARIANT: Record<KnowledgePlane, HighlightIconVariant> = {
  truth:   "success",
  sandbox: "yellow",
  sources: "informative",
}

/**
 * Every knowledge tab gets the `Filters` bar with its search — Michael,
 * 2026-09-10. NOT the view-mode variant: `showViewToggle` switches between a
 * card list and a grid, and none of these three has a second view to switch
 * to. A toggle with one destination is a control that does nothing.
 *
 * The search runs over the fields the reader can see. A fact's plane, a
 * drive's provider, an activity's channel are already the Chip row above the
 * list; the search is for the value you remember and cannot find by filtering.
 */
function SnapshotTab({ contact }: { contact: UcpContact }) {
  const [plane, setPlane]   = useState<KnowledgePlane | "all">("all")
  const [search, setSearch] = useState("")
  const facts   = useMemo(() => getFacts(contact), [contact])
  const q       = search.trim().toLowerCase()
  const visible = facts
    .filter(f => plane === "all" || f.plane === plane)
    .filter(f => q === "" || [f.label, f.value, f.source].some(v => v.toLowerCase().includes(q)))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/*
        Plane summary — what the system holds as true about this record, and how
        sure it is. These were three hand-built CardContainers with a Tag, a
        count and a blurb. That is a KPI card, and the DS has one: Michael's
        call (2026-09-09) is HighlightCard, laid out by AdaptiveMetricGrid,
        which is also the pair the panel-content page uses for Key Metrics.

        `label` is the plane, `value` the number of facts, `feedback` its
        confidence, and `feedbackType` carries the plane's own semantics — the
        Truth plane reads success at 100%, Sandbox alert at ~80%, Sources
        informative at ~60%. The blurb moves to the icon's tooltip: it explains
        the plane rather than this record, so it does not need to be on screen
        three times.
      */}
      <AdaptiveMetricGrid
        cards={PLANE_ORDER.map(p => {
          const meta = PLANE_META[p]
          return {
            label:        `${meta.label} plane`,
            value:        facts.filter(f => f.plane === p).length,
            feedback:     `Confidence ${meta.confidence}`,
            // HighlightCard's feedback is positive / negative / neutral. Only
            // the Truth plane is positive; Sandbox is NOT negative — a lower
            // confidence is how that plane is supposed to work, not a failure.
            feedbackType: (meta.tag === "success" ? "positive" : "neutral") as "positive" | "neutral",
            iconName:     PLANE_ICON[p],
            iconVariant:  PLANE_ICON_VARIANT[p],
          }
        })}
      />

      <Filters
        showSearch
        searchPlaceholder="Search facts by label, value or source…"
        searchValue={search}
        onSearchChange={setSearch}
        /* `Filters` turns ALL THREE of these on by default — the view toggle,
           the All-filters button and the sort control. Off here, every one:
           the view toggle switches to a second view none of these tabs has
           (Michael's "sin view mode variant"), All filters opens a
           FiltersSlideout that does not exist for them, and sort has nothing
           wired behind it. A control that cannot do anything is worse than a
           missing one — it reads as broken rather than as absent. */
        showViewToggle={false}
        showAllFilters={false}
        showSort={false}
      />

      {/* Plane filter — a selection toggle, so primary/secondary, not a semantic color */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Chip size="s" variant={plane === "all" ? "primary" : "secondary"} onClick={() => setPlane("all")}>
          All facts ({facts.length})
        </Chip>
        {PLANE_ORDER.map(p => (
          <Chip
            key={p}
            size="s"
            variant={plane === p ? "primary" : "secondary"}
            onClick={() => setPlane(p)}
          >
            {PLANE_META[p].label} ({facts.filter(f => f.plane === p).length})
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ScanLine}
          title={q ? `No facts for “${search}”` : "No facts on this plane"}
          description={q
            ? "Try a shorter term, or clear the search to see every fact on this plane."
            : "Nothing has been recorded on this plane for this contact yet."}
          ctaLabel={q ? "Clear search" : "Show all facts"}
          onCta={() => { if (q) setSearch(""); else setPlane("all") }}
        />
      ) : (
        <Table columns={FACT_COLUMNS} data={visible} size="sm" rowKey={r => r.id} />
      )}
    </div>
  )
}

// ── Activity ──────────────────────────────────────────────────────────────────

/**
 * The elapsed-time separator between activity cards — Michael, 2026-09-10.
 *
 * A divider with the subtle border and a left-aligned label in Caption S, so a
 * reader scrolling a long feed knows how far back they are without doing
 * arithmetic on timestamps.
 *
 * The label is the DS's own DATE-GROUP LABEL, taken off the Notification
 * Center's spec rather than invented here: 12px, 600, line-height 1,
 * `--color-text-caption`, ALL CAPS. Caption S Bold is documented as all-caps
 * only, which is also why the buckets read "A WEEK AGO" and not "Hace una
 * semana" — the copy is uppercase because the style is, and the screen is in
 * English.
 *
 * The rule takes the remaining width rather than sitting under the text: one
 * separator reads as one object, where a full-width line with a label above it
 * reads as two.
 */
function ElapsedSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[12px]" role="separator" aria-label={label}>
      <span
        className="text-xs font-semibold leading-none shrink-0"
        style={{ color: "var(--color-text-caption)" }}
      >
        {label}
      </span>
      <span className="flex-1 h-px" style={{ background: "var(--color-border-neutral-subtle)" }} />
    </div>
  )
}

/** The one place activity rows are filtered — read by the tab and by the
 *  Pagination total in the parent. */
function filterActivity(
  rows: ReturnType<typeof getActivity>,
  channel: ActivityChannel | "all",
  search: string,
  status: string | undefined,
  period: string | undefined,
  now: Date,
): ReturnType<typeof getActivity> {
  const q = search.trim().toLowerCase()
  return rows
    .filter(a => channel === "all" || a.channel === channel)
    .filter(a => q === "" || [a.title, a.meta, a.timestamp].some(v => v.toLowerCase().includes(q)))
    .filter(a => !status || a.state.label === status)
    .filter(a => withinPeriod(parseActivityAt(a.timestamp, now), period, now))
}

function ActivityTab({
  contact, channel, onChannelChange, search, onSearchChange,
  status, onStatusChange, period, onPeriodChange, now, page, pageSize,
}: {
  contact:  UcpContact
  channel:  ActivityChannel | "all"
  onChannelChange: (c: ActivityChannel | "all") => void
  /** Held by the parent, not here — all of them. The parent owns the
   *  Pagination and its total has to count the same rows this list renders;
   *  two sources for one number is how a paginator ends up offering a page
   *  that is empty. */
  search:   string
  onSearchChange: (value: string) => void
  status:   string | undefined
  onStatusChange: (value: string | undefined) => void
  period:   string | undefined
  onPeriodChange: (value: string | undefined) => void
  now:      Date
  page:     number
  pageSize: number
}) {
  const all      = useMemo(() => getActivity(contact), [contact])
  const filtered = useMemo(
    () => filterActivity(all, channel, search, status, period, now),
    [all, channel, search, status, period, now],
  )
  const paged    = filtered.slice((page - 1) * pageSize, page * pageSize)

  const items: EntityListItemData[] = paged.map(a => ({
    id:          a.id,
    title:       a.title,
    iconName:    CHANNEL_META[a.channel].icon,
    iconVariant: a.channel === "agent" ? "purple" : a.channel === "system" ? "neutral" : "info",
    primaryMeta: [{ iconName: "Clock", label: a.timestamp }],
    secondaryMeta: [{ iconName: "Info", label: a.meta }],
    state:       { label: a.state.label, variant: a.state.variant },
    aiInsight:   a.aiSummary
      ? { action: "summary", detail: a.aiSummary, viewMore: a.aiSummary.length > 160 }
      : undefined,
  }))

  const q = search.trim().toLowerCase()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Filters
        showSearch
        searchPlaceholder="Search activity by title, detail or date…"
        searchValue={search}
        onSearchChange={onSearchChange}
        /* `options` + `onSelect`, so Filters renders and positions the menu
           itself. CLAUDE.md is explicit that a screen never hand-rolls a Menu
           beside a Filters bar, and the two things these dropdowns filter on —
           what state a touchpoint is in, and how far back to look — are the
           two questions a feed this long actually gets asked.

           The options are derived from the rows, never a hardcoded list: a new
           state in the fixtures shows up here without anyone remembering to
           add it, and a state that no longer occurs stops being offered. */
        slots={[
          {
            placeholder: "Status",
            value:       status,
            options:     Array.from(new Set(all.map(a => a.state.label))).sort(),
            onSelect:    onStatusChange,
            onRemove:    () => onStatusChange(undefined),
          },
          {
            placeholder: "Period",
            value:       period,
            options:     ACTIVITY_PERIODS.map(p => p.label),
            onSelect:    onPeriodChange,
            onRemove:    () => onPeriodChange(undefined),
          },
        ]}
        showClearFilters={!!status || !!period || search !== ""}
        onClearFilters={() => { onStatusChange(undefined); onPeriodChange(undefined); onSearchChange("") }}
        /* `Filters` turns ALL THREE of these on by default — the view toggle,
           the All-filters button and the sort control. Off here, every one:
           the view toggle switches to a second view none of these tabs has
           (Michael's "sin view mode variant"), All filters opens a
           FiltersSlideout that does not exist for them, and sort has nothing
           wired behind it. A control that cannot do anything is worse than a
           missing one — it reads as broken rather than as absent. */
        showViewToggle={false}
        showAllFilters={false}
        showSort={false}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Chip size="s" variant={channel === "all" ? "primary" : "secondary"} onClick={() => onChannelChange("all")}>
          All ({all.length})
        </Chip>
        {(Object.keys(CHANNEL_META) as ActivityChannel[]).map(c => (
          <Chip
            key={c}
            size="s"
            variant={channel === c ? "primary" : "secondary"}
            onClick={() => onChannelChange(c)}
          >
            {CHANNEL_META[c].label} ({all.filter(a => a.channel === c).length})
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={q ? `No activity for “${search}”` : "No activity on this channel"}
          description={q
            ? "Try a shorter term, or clear the search to see the full timeline."
            : "Try another channel, or clear the filter to see the full timeline."}
          ctaLabel={q ? "Clear search" : "Clear filter"}
          onCta={() => { if (q) onSearchChange(""); else onChannelChange("all") }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item, i) => {
            // The separator appears when the row's age band changes — and on
            // the FIRST row of the page too, because a page that opens
            // mid-band would otherwise show rows with no idea how old they
            // are. The bands come from one function so the label a separator
            // shows and the order the rows sit in cannot disagree.
            const label = elapsedGroupLabel(parseActivityAt(paged[i].timestamp, now), now)
            const prev  = i === 0 ? null : elapsedGroupLabel(parseActivityAt(paged[i - 1].timestamp, now), now)
            return (
              <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {label !== prev && <ElapsedSeparator label={label} />}
                <CardContainer size="sm" className="!p-0 overflow-hidden">
                  <EntityList items={[item]} />
                </CardContainer>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Drives ────────────────────────────────────────────────────────────────────

/**
 * One drive → one glyph and one tint, read by BOTH the row and its preview.
 * They were two separate expressions before, which is how a Document opened a
 * preview headed by a hard drive.
 */
const DRIVE_ICON: Record<string, string> = {
  Document: "FileText",
  Drive:    "HardDrive",
  Folder:   "Folder",
}
const DRIVE_ICON_VARIANT: Record<string, "error" | "yellow" | "light-blue"> = {
  error: "error",
  alert: "yellow",
}

function DrivesTab({ contact, onPreview }: { contact: UcpContact; onPreview: (d: UcpDrive) => void }) {
  const [search,   setSearch]   = useState("")
  const [kind,     setKind]     = useState<string | undefined>(undefined)
  const [provider, setProvider] = useState<string | undefined>(undefined)
  const [status,   setStatus]   = useState<string | undefined>(undefined)
  const all = useMemo(() => getDrives(contact), [contact])
  const q   = search.trim().toLowerCase()
  const drives = all
    .filter(d => q === "" || [d.name, d.provider, d.owner, d.kind, d.scope].some(v => v.toLowerCase().includes(q)))
    .filter(d => !kind     || d.kind === kind)
    .filter(d => !provider || d.provider === provider)
    .filter(d => !status   || d.state.label === status)
  const hasFilters = !!kind || !!provider || !!status || q !== ""
  const clearAll = () => { setKind(undefined); setProvider(undefined); setStatus(undefined); setSearch("") }
  /** Every value the rows actually take, sorted — never a hardcoded list, so a
   *  provider that appears in the fixtures tomorrow is offered without anyone
   *  editing this, and one that disappears stops being offered. */
  const optionsFor = (pick: (d: UcpDrive) => string) =>
    Array.from(new Set(all.map(pick))).sort()

  // The record genuinely has none — no bar, because there is nothing to search
  // and a search over an empty list is a control that cannot succeed.
  if (all.length === 0) {
    return (
      <EmptyState
        icon={HardDrive}
        title="No drives attached"
        description="Source Drives connected to this contact will appear here."
      />
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Filters
        showSearch
        searchPlaceholder="Search drives by name, provider or owner…"
        searchValue={search}
        onSearchChange={setSearch}
        /* The three things a reader narrows a drive list by: what kind of thing
           it is, where it lives, and whether it is syncing. `options` +
           `onSelect`, so `Filters` renders and positions the menus itself —
           a screen never hand-rolls a Menu beside this bar. */
        slots={[
          {
            placeholder: "Type",
            value:       kind,
            options:     optionsFor(d => d.kind),
            onSelect:    setKind,
            onRemove:    () => setKind(undefined),
          },
          {
            placeholder: "Provider",
            value:       provider,
            options:     optionsFor(d => d.provider),
            onSelect:    setProvider,
            onRemove:    () => setProvider(undefined),
          },
          {
            placeholder: "Status",
            value:       status,
            options:     optionsFor(d => d.state.label),
            onSelect:    setStatus,
            onRemove:    () => setStatus(undefined),
          },
        ]}
        showClearFilters={hasFilters}
        onClearFilters={clearAll}
        /* `Filters` turns ALL THREE of these on by default — the view toggle,
           the All-filters button and the sort control. Off here, every one:
           the view toggle switches to a second view none of these tabs has
           (Michael's "sin view mode variant"), All filters opens a
           FiltersSlideout that does not exist for them, and sort has nothing
           wired behind it. A control that cannot do anything is worse than a
           missing one — it reads as broken rather than as absent. */
        showViewToggle={false}
        showAllFilters={false}
        showSort={false}
      />

      {drives.length === 0 ? (
        <EmptyState
          icon={HardDrive}
          title={q ? `No drives for “${search}”` : "No drives match these filters"}
          description={q
            ? "Try a shorter term, or clear the search to see every drive on this record."
            : "Try a different type, provider or status — or clear the filters to see every drive."}
          ctaLabel="Clear filters"
          onCta={clearAll}
        />
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {drives.map(d => (
        <CardContainer key={d.id} size="sm" className="!p-0 overflow-hidden">
          <EntityList
            items={[{
              id:          d.id,
              title:       d.name,
              iconName:    DRIVE_ICON[d.kind] ?? "Folder",
              iconVariant: DRIVE_ICON_VARIANT[d.state.variant] ?? "light-blue",
              primaryMeta: [
                { iconName: "Cloud",  label: d.provider },
                { iconName: "Files",  label: d.items    },
              ],
              secondaryMeta: [
                { iconName: "User",         label: `Owner · ${d.owner}` },
                { iconName: "RefreshCw",    label: `Last sync · ${d.lastSync}` },
                { iconName: "Share2",       label: d.scope },
              ],
              tags:    [{ label: d.kind }],
              state:   { label: d.state.label, variant: d.state.variant },
              actions: [{ label: "Preview", variant: "tertiary", icon: "Eye", onClick: () => onPreview(d) }],
            }]}
          />
        </CardContainer>
      ))}
      </div>
      )}
    </div>
  )
}

// ── Concierge chat ────────────────────────────────────────────────────────────
// DS-GAP: agent chat panel — there is no chat component in src/components/ui/.
// Composed here from SlideOut + CardContainer + Tag + Input + Button per the
// "compose before you build" rule; the message bubbles are the only bespoke
// arrangement, and they only rearrange existing tokens.

function ConciergeChat({
  contact, open, onClose,
}: {
  contact: UcpContact
  open:    boolean
  onClose: () => void
}) {
  const [turns, setTurns] = useState<ConciergeTurn[]>(() => getConciergeOpening(contact))
  const [draft, setDraft] = useState("")

  const ask = (question: string) => {
    if (!question.trim()) return
    setTurns(prev => [
      ...prev,
      { id: `u-${prev.length}`, from: "user", text: question },
      {
        id: `a-${prev.length + 1}`, from: "agent",
        text: `Here's what this record supports for that. Everything below is drawn from ${contact.name}'s own planes — nothing inferred from outside this profile.`,
        sources: [
          { label: "Interaction history", plane: "truth"   },
          { label: "Call notes — Aug 28", plane: "sandbox" },
        ],
      },
    ])
    setDraft("")
  }

  return (
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      title="Concierge"
      subtitle={`${contact.agent.name} · ${contact.name}`}
      showIcon
      iconContent={<Sparkle size={14} />}
      showStatus
      statusLabel="Online"
      showTopButton={false}
      showTabs={false}
      showSearchBar={false}
      showChips={false}
      showCta={false}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Vertical padding only, and the 16/-16 pair so the scroller does not
            clip the message cards' hover glow flat against its edge — the
            clip-boundary trick from the guardrails, which is net zero so the
            content still lands on the panel's own 24px. */}
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 20, paddingBottom: 8, paddingInline: 16, marginInline: -16, display: "flex", flexDirection: "column", gap: 12 }}>
          {turns.map(turn => (
            <div
              key={turn.id}
              style={{
                alignSelf: turn.from === "user" ? "flex-end" : "flex-start",
                maxWidth: "90%",
                display: "flex", flexDirection: "column", gap: 6,
              }}
            >
              <div
                style={{
                  background: turn.from === "user" ? "var(--field-bg)" : "var(--tag-purple-bg)",
                  border: `1px solid ${turn.from === "user" ? "var(--field-border)" : "var(--tag-purple-bd)"}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: turn.from === "user" ? "var(--foreground)" : "var(--color-text-purple)",
                }}
              >
                {turn.text}
              </div>
              {turn.sources && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {turn.sources.map(s => (
                    <Tag key={s.label} variant={PLANE_META[s.plane].tag} size="sm">
                      {PLANE_META[s.plane].label} · {s.label}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 8, paddingBottom: 20, display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--field-border)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 10 }}>
            {CONCIERGE_PROMPTS.map(p => (
              <Chip key={p} size="s" variant="secondary" onClick={() => ask(p)}>{p}</Chip>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Input
              placeholder={`Ask about ${contact.name}…`}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") ask(draft) }}
            />
            <Button
              variant="primary"
              size="default"
              icon={<Send size={14} />}
              iconPosition="alone"
              aria-label="Send"
              onClick={() => ask(draft)}
            />
          </div>
        </div>
      </div>
    </SlideOut>
  )
}

// ── Body states ───────────────────────────────────────────────────────────────

/**
 * The body while the record is in flight. It exists so the loading header is
 * not a skeleton sitting on top of finished content — a screen that says
 * "loading" in one place and shows real values in another is stating two
 * different things about the same record.
 *
 * Not an EmptyState: "nothing here" is untrue while data is on the wire.
 */
function LoadingBody() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }} aria-busy="true">
      <CardContainer size="lg" variant="default" className="w-full">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Skeleton shape="text" width={220} height={16} />
          <Skeleton shape="text" width="100%" height={12} />
          <Skeleton shape="text" width="82%"  height={12} />
        </div>
      </CardContainer>
      <div style={{ display: "flex", gap: 12 }}>
        {[0, 1, 2].map(i => (
          <CardContainer key={i} size="lg" variant="default" className="flex-1">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton shape="text" width={120} height={14} />
              {[0, 1, 2].map(r => (
                <div key={r} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <Skeleton shape="text" width={96} height={12} />
                  <Skeleton shape="text" width={48} height={12} />
                </div>
              ))}
            </div>
          </CardContainer>
        ))}
      </div>
    </div>
  )
}

/**
 * A company's people — the records that name it as their account.
 *
 * This is the tab the type publishes, and the reason it is worth having: it is
 * built from a relationship the fixtures already carry, not from a field
 * invented so that Company would have a third tab like the others. A Customer
 * has no equivalent list, so a Customer gets no equivalent tab.
 */
function PeopleTab({
  company, onOpen,
}: { company: UcpContact; onOpen?: (c: UcpContact) => void }) {
  const people = useMemo(
    () => CONTACTS.filter(c => c.type !== "company" && c.company === company.name),
    [company.name],
  )

  if (people.length === 0) {
    return (
      <EmptyState
        icon={LucideIcons.Users}
        title="No people on this account"
        description={`No contact or employee record names ${company.name} as its account yet. They appear here as soon as one does.`}
      />
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {people.map(person => {
        const state = entityState(person)
        return (
          <CardContainer key={person.id} size="sm" className="!p-0 overflow-hidden">
            <EntityList
              items={[{
                id: person.id,
                title: person.name,
                avatarName: person.name,
                primaryMeta: [
                  { iconName: "Hash", label: person.id },
                  { iconName: person.source.iconName, label: person.source.label },
                ],
                secondaryMeta: [
                  { iconName: "Info",      label: person.subtitle, tooltip: `Role and account · ${person.subtitle}` },
                  { iconName: "UserRound", label: person.owner,    tooltip: `Account owner · ${person.owner}` },
                ],
                state: { label: state.label, variant: state.variant },
                tags: [{ label: TYPE_LABEL[person.type] }],
                onClick: onOpen ? () => onOpen(person) : undefined,
              }]}
            />
          </CardContainer>
        )
      })}
    </div>
  )
}

/**
 * The body for a record the viewer cannot read. It replaces the tab content
 * rather than sitting beside it: leaving the facts, timeline and drives on
 * screen under a header that says the values are governed would be the header
 * telling the truth and the page contradicting it.
 *
 * The tabs stay mounted and switchable. They are part of the record's shape,
 * and hiding them would misrepresent what the tenant holds — the restriction is
 * on the values, not on the structure.
 */
function RestrictedBody({ name, scope }: { name: string; scope: string }) {
  return (
    <EmptyState
      icon={Lock}
      title={`Governed by ${scope}`}
      description={`${name}'s record is intact and indexed. Reading its values needs the ${scope} scope, which your role does not hold — nothing here is missing or broken.`}
      ctaLabel="Request access"
      onCta={() => {}}
    />
  )
}

// ── Profile view ──────────────────────────────────────────────────────────────

export function UcpProfileView({
  contact, onBack, onSidebarItemClick, onOpenRecord,
}: {
  contact: UcpContact
  onBack?: () => void
  onSidebarItemClick?: (id: string) => void
  /** Opening a person from a company's People tab. The roster owns navigation. */
  onOpenRecord?: (c: UcpContact) => void
}) {
  const [tab,        setTab]        = useState("overview")
  const [channel,    setChannel]    = useState<ActivityChannel | "all">("all")
  const [actSearch,  setActSearch]  = useState("")
  const [actStatus,  setActStatus]  = useState<string | undefined>(undefined)
  const [actPeriod,  setActPeriod]  = useState<string | undefined>(undefined)
  /**
   * "Now", captured once per mount rather than read inside the grouping.
   * A list that regroups itself because a minute ticked over while the reader
   * was looking at it is a bug, and every band and every period filter has to
   * be measured from the same instant or two rows can disagree about which
   * week they are in.
   */
  const now = useMemo(() => new Date(), [])
  const [actPage,    setActPage]    = useState(1)
  const [actSize,    setActSize]    = useState(ACTIVITY_PAGE_SIZE)
  const [chatOpen,   setChatOpen]   = useState(false)
  const [infoOpen,   setInfoOpen]   = useState(false)
  const [drivePeek,  setDrivePeek]  = useState<UcpDrive | null>(null)

  // Ask and Information both open on the side — opening one closes the other,
  // and the panel requested last wins.
  const openChat = () => { setInfoOpen(false); setDrivePeek(null); setChatOpen(true) }
  const openInfo = () => { setChatOpen(false); setDrivePeek(null); setInfoOpen(true) }

  const state = entityState(contact)

  // A record is fetched, so there is a first paint where it does not exist yet,
  // and the header's Loading state is what belongs there. Re-armed per record:
  // navigating from one contact to another is a new fetch, not a re-render of
  // the old one.
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(timer)
  }, [contact.id])

  // Restricted is decided by what the viewer holds against what the record
  // needs — never by a flag on the record itself. null when nothing is gated.
  const restriction = restrictionFor(contact)

  // The entity type is host-defined — EntityHeader enumerates nothing. With an
  // avatar as the visual, the type arrives as a classification tag, and it is
  // read from TYPE_LABEL rather than stored per record: the roster chip reads
  // the same map, so the two cannot drift. They had — the same person was a
  // "Customer" in the list and a "Person" in her own header, and one record
  // out of seven disagreed with the other six. One source of truth removes
  // the class of bug, not just the instances.
  //
  // The component sorts (signals first, then classification) and caps the
  // visible set itself, so the order here is only the order they arrive in. A
  // tone of "neutral" is the absence of a tone, not a third colour.
  const headerTags = useMemo<EntityHeaderTag[]>(
    () => [
      // Only when the visual is an avatar. A highlight icon already names the
      // type, so a tag repeating it is the same fact twice.
      ...(AVATAR_TYPES.includes(contact.type)
        ? [{ label: TYPE_LABEL[contact.type], role: "classification" as const }]
        : []),
      ...contact.tags.map(t => ({
        label: t.label,
        role:  t.role,
        tone:  t.tone === "error" || t.tone === "alert" ? t.tone : undefined,
      })),
    ],
    [contact],
  )

  // The attribute row under the title — display-only, always visible, and a
  // different thing from recordFields, which carry provenance and a masking
  // state and are reached through the ⓘ panel. The component caps this at six.
  const secondaryMetadata = useMemo<SecondaryMetadataItem[]>(
    () => contact.meta.map(m => ({
      icon:    (LucideIcons[m.iconName as keyof typeof LucideIcons] ?? LucideIcons.CircleDot) as LucideIcon,
      text:    m.label,
      tooltip: m.tooltip,
    })),
    [contact],
  )

  // Masking is a state of a field, not the absence of one: the viewer sees the
  // same labels and the same provenance badges either way, and only the values
  // are withheld. The component never resolves entitlements itself, so the
  // caller hands it the state each field is in.
  const recordFields = useMemo<RecordField[]>(
    () => getRecordFields(contact).map(f => ({
      label: f.label,
      icon: (LucideIcons[f.iconName as keyof typeof LucideIcons] ?? LucideIcons.CircleDot) as LucideIcon,
      provenance: {
        system:       f.system,
        systemAbbr:   f.systemAbbr,
        modelVersion: f.modelVersion,
        syncedAgo:    f.syncedAgo,
      },
      state:       f.masked ? "masked" : "hydrated",
      value:       f.value,
      maskedValue: f.masked ? "•••• (restricted)" : undefined,
    })),
    [contact],
  )

  // The `nba` memo lived here, shaping the record's recommendation for
  // NextBestActionCard. It went with the card — a memo whose only consumer is
  // gone is dead code, and `contact.nba` is still read by the roster row.

  // The same filter the tab runs, so the paginator counts the rows the reader
  // is actually looking at — including the search.
  const activityCount = useMemo(
    () => filterActivity(getActivity(contact), channel, actSearch, actStatus, actPeriod, now).length,
    [contact, channel, actSearch, actStatus, actPeriod, now],
  )

  const spec = useMemo(() => specForContact(contact), [contact])

  // Declared before the slots that close over it — the AI Summary widget's
  // destination button calls it, and a useMemo runs during render.
  const goTab = (id: string) => {
    setTab(id)
    setActPage(1)
  }

  const overviewSlots = useMemo<CanvasSlot[]>(() => {
    const slots: CanvasSlot[] = [
      {
        uid: "ai-summary", title: `${contact.agent.name} — read on this record`,
        // 4 rows, not 5. With the CTA in the chips row the content ends about
        // 60px above where the slot did, and an empty band at the bottom of a
        // widget is space the canvas charges every other widget for.
        colSpan: 3, widthClass: "full", rowSpan: 4,
        content: <AiSummaryContent contact={contact} onAsk={openChat} onGoTab={goTab} />,
      },
    ]
    // The type's own fields, ahead of the studies. It answers "what is this
    // thing", which is what you read before "how sure are we about it" — and
    // it is the one widget on this canvas whose CONTENT differs by type rather
    // than only its values. A Company shows Industry / Headcount / HQ where a
    // Customer shows Role / Account, because that is what each model published.
    slots.push({
      uid: spec.widget.uid, title: spec.widget.title, colSpan: 1, rowSpan: 4,
      content: <MetricRows rows={spec.widget.rows} />,
    })
    // Governance and Risk are Stat Rows — counters and scores, three across,
    // with the study's own date underneath. The type's field widget above is a
    // Profile Card. Two different widgets because they hold two different
    // kinds of thing; they shared one renderer until 2026-09-09.
    if (contact.governance !== "empty") {
      const gov = getGovernance(contact)
      slots.push({
        uid: "governance", title: "Governance", colSpan: 1, rowSpan: 4,
        content: (
          <StudyWidget title="Governance" state={contact.governance}>
            <StatRowContent counters={gov.slice(0, 3)} checked={gov[3]} />
          </StudyWidget>
        ),
      })
    }
    if (contact.risk !== "empty") {
      const risk = getRisk(contact)
      slots.push({
        uid: "risk", title: "Risk", colSpan: 1, rowSpan: 4,
        content: (
          <StudyWidget title="Risk" state={contact.risk}>
            {/* Score, flags and trend are the counters; the scan date is the
                date. getRisk returns them in that order. */}
            <StatRowContent counters={risk.slice(0, 3)} checked={risk[3]} />
          </StudyWidget>
        ),
      })
    }
    if (contact.connections !== "empty") {
      slots.push({
        uid: "connections", title: "Connections", colSpan: 1, rowSpan: 4,
        content: (
          <StudyWidget title="Connections" state={contact.connections}>
            <ConnectionsContent contact={contact} />
          </StudyWidget>
        ),
      })
    }
    slots.push({
      uid: "recent-activity", title: "Recent activity", colSpan: 3, widthClass: "full", rowSpan: 5,
      content: (
        <LastActivityContent
          contact={contact}
          onViewAll={() => { setTab("activity"); setActPage(1) }}
        />
      ),
    })
    return slots
  }, [contact, spec])


  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas González"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={UCP_SIDEBAR_ITEMS}
      activeSidebarId="contacts"
      onSidebarItemClick={onSidebarItemClick}
      header={isScrolled => (
        <>
          <Header
            size={isScrolled ? "compress" : "size-m"}
            title="Contacts"
            backButton
            showBackInCompress
            onBack={() => onBack?.()}
          />
          {/* Pinned: ScreenLayout's header zone is outside the scroll
              container. 32px sides so the edges line up with the content
              scrolling underneath — EntityHeader brings its own
              CardContainer, so this wrapper supplies nothing else.

              The Next Best Action is its own card, directly below the header
              and never inside it: two records, two containers. The header
              identifies the entity, this proposes what to do about it. It is
              pinned alongside the header because a proposal the reader
              scrolls past is a proposal they never see. */}
          <div style={{ padding: "0 32px 8px" }}>
            <EntityHeader
              compressOnScroll
              name={contact.name}
              visual={AVATAR_TYPES.includes(contact.type)
                ? { kind: "avatar" }
                : { kind: "icon", icon: (LucideIcons[TYPE_ICON[contact.type] as keyof typeof LucideIcons] ?? LucideIcons.CircleDot) as LucideIcon, variant: "informative" }}
              tags={headerTags}
              stateBadge={{ label: state.label, variant: state.variant }}
              source={contact.source.label}
              secondaryMetadata={secondaryMetadata}
              recordFields={recordFields}
              showInformation
              onInformationOpen={openInfo}
              assignedAgent={{
                id: contact.agent.id,
                name: contact.agent.name,
                onOpenChat: openChat,
              }}
              locked={restriction !== null}
              state={loading ? "loading" : "default"}
              secondaryAction={{
                label: "Export record",
                variant: "secondary",
                onClick: () => {},
                disabledTooltip: "This record's values are governed — request the scope to export it",
              }}
              menuActions={[{ label: "Archive", onClick: () => {} }]}
            />
            {nba && <NextBestActionCard item={nba} className="mt-[12px]" />}
          </div>

          <div style={{ padding: "0 32px 16px" }}>
            <Tabs
              activeId={tab}
              onChange={goTab}
              items={tabsForContact(contact)}
            />
          </div>
        </>
      )}
      pagination={
        tab === "activity" && !loading && !restriction && activityCount > actSize
          ? (
              <Pagination
                currentPage={actPage}
                totalItems={activityCount}
                itemsPerPage={actSize}
                onPageChange={setActPage}
                onItemsPerPageChange={n => { setActSize(n); setActPage(1) }}
                rowsPerPageOptions={[8, 25, 50]}
              />
            )
          : undefined
      }
    >
      {/* THE HEADER LIVES IN THE CONTENT, NOT IN THE PINNED ZONE
          (Michael, 2026-09-10). It used to sit in ScreenLayout's header
          zone together with the Next Best Action and the Tabs — four
          things holding the top of the screen, none of which gave any
          height back on the way down.

          Now only the page bar is pinned, exactly as the Universal
          Profile does it, and the EntityHeader sticks itself: it is
          inside the scroll container, so `compressOnScroll` gives it
          both halves — it stays at the top AND it compresses. The NBA
          and the Tabs scroll away with the content, which is what they
          should do: a proposal and a nav bar are not worth permanent
          screen height on a record you are reading. */}
      <EntityHeader
        /* Sticks itself to the top of the scroll container and compresses
           on the way down: the metadata row and the description drop, the
           visual goes L to M, and scrolling back up restores all three.
           One prop, because a card that compresses without sticking would
           just scroll out of view. */
        compressOnScroll
        name={contact.name}
        /*
          AVATAR OR ICON, decided by the type — not hardcoded.
          A face or a brand gets an avatar: customers, employees,
          companies. Everything else gets an icon, and a record titled
          with a code has no choice: "RO-48291" has no initials, so an
          avatar there renders nonsense. That is the Entity Header's own
          rule, and it only became visible once the roster had types that
          are not people in it (2026-09-09).

          The avatar types are also the ones that carry a classification
          tag, because an avatar cannot say what kind of thing this is
          and a highlight icon already does.
        */
        visual={AVATAR_TYPES.includes(contact.type)
          ? { kind: "avatar" }
          : { kind: "icon", icon: (LucideIcons[TYPE_ICON[contact.type] as keyof typeof LucideIcons] ?? LucideIcons.CircleDot) as LucideIcon, variant: "informative" }}
        tags={headerTags}
        stateBadge={{ label: state.label, variant: state.variant }}
        source={contact.source.label}
        secondaryMetadata={secondaryMetadata}
        recordFields={recordFields}
        showInformation
        onInformationOpen={openInfo}
        assignedAgent={{
          id: contact.agent.id,
          name: contact.agent.name,
          onOpenChat: openChat,
        }}
        locked={restriction !== null}
        /* The record is fetched, so there is a first paint where it does
           not exist yet, and the component's own skeleton is what belongs
           there — never an empty header, never withholding the card. */
        state={loading ? "loading" : "default"}
        /* NO secondaryAction. "Export record" was here and Michael took it out
           (2026-09-10): it does not apply to this record type. The slot is off
           by default for exactly this reason — most records have no second
           action, and the header is better with an empty slot than with a
           button nobody asked for. `Ask` remains the one CTA. */
        /* Destructive and secondary only — Archive is never one click away. */
        menuActions={[{ label: "Archive", onClick: () => {} }]}
      />
      {/* NO Next Best Action card. It sat here, below the header and in its own
          container, which is where the DS says a recommendation goes. Michael
          took it out on 2026-09-10 — it does not apply to this flow yet.

          The DATA stays: `contact.nba` still feeds the roster row's own AI
          insight block, so removing the card here does not remove the
          recommendation from the prototype, only from this surface. When it
          comes back it is `NextBestActionCard` again, in its own container,
          never inside the header. */}
      {/* 24px from the last nav layer to the content, per the DS. */}
      <div className="mt-[16px] mb-[24px]">
        <Tabs
          activeId={tab}
          onChange={goTab}
          // Published by the type, not by this screen. A Company brings a
          // People tab; a Customer and an Employee bring none, and render
          // perfectly well without one.
          items={tabsForContact(contact)}
        />
      </div>

      {/* The body follows the header's state. Three mutually exclusive cases,
          in the order the header resolves them: in flight, governed, readable. */}
      {loading ? (
        <LoadingBody />
      ) : restriction ? (
        <RestrictedBody name={contact.name} scope={restriction.scope} />
      ) : (
        <>
          {tab === "overview" && <WidgetCanvasView initialSlots={overviewSlots} />}
          {tab === "people"   && <PeopleTab company={contact} onOpen={onOpenRecord} />}
          {tab === "snapshot" && <SnapshotTab contact={contact} />}
          {tab === "activity" && (
            <ActivityTab
              contact={contact}
              channel={channel}
              onChannelChange={c => { setChannel(c); setActPage(1) }}
              search={actSearch}
              // Any filter change resets to page 1 — the DS rule, and a search
              // that leaves you on page 3 of 1 looks like an empty tab.
              onSearchChange={v => { setActSearch(v); setActPage(1) }}
              status={actStatus}
              onStatusChange={v => { setActStatus(v); setActPage(1) }}
              period={actPeriod}
              onPeriodChange={v => { setActPeriod(v); setActPage(1) }}
              now={now}
              page={actPage}
              pageSize={actSize}
            />
          )}
          {tab === "drives" && <DrivesTab contact={contact} onPreview={setDrivePeek} />}
        </>
      )}

      <ConciergeChat contact={contact} open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Information — where the fields in the header came from. Not the
          Overview and not the Knowledge tab: it explains what is on screen
          right now, nothing more. */}
      <SlideOut
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        type="with-variants"
        size="m"
        title="Field sources"
        subtitle={`Entity header · ${contact.name}`}
        showIcon
        iconContent={<FileSearch size={14} />}
        showStatus={false}
        showTopButton={false}
        showTabs={false}
        showSearchBar={false}
        showChips={false}
        showCta={false}
      >
        {/* Law 2 — every governed answer carries provenance reachable without
            leaving the record. This is what RecordHeader's onProvenanceOpen is
            for, and it now prints the real thing: the system each field came
            from, the model version it was shaped by, and when it last synced.
            A masked field keeps its whole row — label, system, version, sync —
            and withholds only the value. That is the point of masking: the
            viewer can see that the field exists and is governed, which is a
            different statement from the field not being there. */}
        <div className={PANEL_CONTENT_CLASS}>
          <span style={{ fontSize: 12, color: "var(--field-supporting)", lineHeight: 1.6 }}>
            {restriction
              ? `Every field on this record, and where it came from. ${restriction.note}`
              : "Every field on this record, and where it came from."}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>
            Fields
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {getRecordFields(contact).map((f, i) => (
              <div key={`${f.label}-${i}`} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--field-supporting)" }}>
                  {f.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: f.masked ? "var(--field-supporting)" : "var(--foreground)" }}>
                  {f.masked ? "•••• (restricted)" : f.value}
                </span>
                <span style={{ fontSize: 12, color: "var(--field-supporting)", lineHeight: 1.5 }}>
                  {f.system} · {f.modelVersion} · synced {f.syncedAgo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SlideOut>

      {/*
        Drives preview.

        Four things Michael caught on 2026-09-09, all of them the same mistake
        in different places — the panel was drawing its own vocabulary instead
        of the one the SlideOut/SidePanel — Content page defines:

        · THE ICON MATCHES THE ITEM. It was a hardcoded HardDrive for every
          preview, so opening a Document showed a drive. Same glyph and same
          tint as the row it came from, resolved from one map.
        · NO PADDING OF ITS OWN. SlideOut's panel is already `32px / 24px`; the
          20px this added landed the content at 44. The canonical page renders
          its slot with zero horizontal padding for exactly that reason.
        · THE STATE IS THE PANEL'S, not a Tag in the body. It has a slot —
          `showStatus` + `statusLabel` — and a Tag on its own line in a column
          also stretched to the panel width, which is the other half of the
          same bug (fixed in the component too: Tag is `w-fit` now).
        · THE DETAIL TABLE IS THE ONE FROM THAT PAGE: a bordered 8px container,
          rows at `py-8 px-12`, a 120px label column, 1px dividers.
      */}
      <SlideOut
        open={drivePeek !== null}
        onClose={() => setDrivePeek(null)}
        type="with-variants"
        size="m"
        title={drivePeek?.name ?? ""}
        subtitle={drivePeek ? `${drivePeek.kind} · ${drivePeek.provider}` : ""}
        showIcon
        iconContent={drivePeek ? <HighlightIcon size="sm" variant={DRIVE_ICON_VARIANT[drivePeek.state.variant]} iconName={DRIVE_ICON[drivePeek.kind]} /> : undefined}
        showStatus
        statusLabel={drivePeek?.state.label}
        showTopButton={false}
        showTabs={false}
        showSearchBar={false}
        showChips={false}
        showCta={false}
      >
        {drivePeek && (
          <div className={PANEL_CONTENT_CLASS}>
            <div className="flex flex-col gap-[8px]">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>
                Details
              </span>
              <div className="flex flex-col rounded-[8px]" style={{ border: "1px solid var(--field-border)" }}>
                {([
                  ["Provider",  drivePeek.provider],
                  ["Contents",  drivePeek.items],
                  ["Owner",     drivePeek.owner],
                  ["Last sync", drivePeek.lastSync],
                  ["Scope",     drivePeek.scope],
                ] as [string, string][]).map(([label, value], i, arr) => (
                  <div key={label}>
                    <div className="flex items-center gap-[19px] py-[8px] px-[12px]">
                      <span className="w-[120px] shrink-0 text-[12px] font-medium leading-[20px]" style={{ color: "var(--foreground)" }}>{label}</span>
                      <span className="flex-1 text-[12px] font-medium leading-[20px]" style={{ color: "var(--field-supporting)" }}>{value}</span>
                    </div>
                    {i < arr.length - 1 && <div className="w-full h-[1px]" style={{ background: "var(--color-border-neutral-lighter)" }} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>
                How this is used
              </span>
              <span className="text-[12px] leading-[1.6]" style={{ color: "var(--field-supporting)" }}>
                Drives feed the Sources plane. Anything here can be cited by {contact.agent.name}, but never
                promoted to Truth without a verification step.
              </span>
            </div>
          </div>
        )}
      </SlideOut>

    </ScreenLayout>
  )
}

// No default export on purpose: the profile is not its own prototype card. It
// is reached by opening a row in the Contacts roster, which is the real flow —
// one card, one entry point.
