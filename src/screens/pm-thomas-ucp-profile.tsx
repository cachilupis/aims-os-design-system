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
import { SwitchTab }         from "@/components/ui/switch-tab"
import { Button }            from "@/components/ui/button"
import { Input }             from "@/components/ui/input"
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
  DRIVE_MODIFIED_OPTIONS, TRUTH_STATUSES, RISK_LEVELS, ATTENTION_FLAGS, SANDBOX_STATES, SANDBOX_SCOPES,
  PLANE_META, CHANNEL_META, CHANNEL_GROUP, ACTIVITY_GROUPS, COMMUNICATION_CHANNELS, CONCIERGE_PROMPTS,
  CONTACTS,
  AVATAR_TYPES, TYPE_ICON, TYPE_LABEL, entityState, restrictionFor, getRecordFields,
  getActivity, getConciergeOpening, getConnections, getDrives,
  getFacts, getGovernance, getRisk,
} from "./ucpShared"
import type {
  MetricVariant, StudyRow,
  ActivityChannel, ActivityGroup, ConciergeTurn, KnowledgePlane, StudyState, UcpContact, UcpDrive, UcpFact,
  UcpNote, TagVariantLite,
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
// The Last Activity widget shows communications only — its own rule, "don't
// mix non-communication activity types in this widget". That set is now
// published by the data layer rather than restated here, so adding SMS did
// not need this line changed and adding the next kind will not either.
const COMMS: ActivityChannel[] = COMMUNICATION_CHANNELS

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
        // The four spine tabs plus the type's own module. A destination the
        // strip does not have goes nowhere rather than switching to nothing —
        // "Snapshot" and "Drives" were both live destinations until the tabs
        // were restructured on 2026-09-10, which is exactly the kind of
        // dangling pointer a whitelist catches.
        if (["overview", "activity", "intelligence", "knowledge", "people"].includes(tab)) onGoTab(tab)
      },
    }),
    [contact, onGoTab],
  )
  return <AiSummaryWidget items={insights} onAsk={onAsk} compact={isNarrow} />
}

// ── Snapshot (Truth Facts) ────────────────────────────────────────────────────

/**
 * ── One fact, as a list row ────────────────────────────────────────────────
 *
 * This replaces FACT_COLUMNS, the six-column Table the two fact shelves used
 * to render. The columns are not gone, they are RE-RANKED — a table gives
 * every column the same weight because a reader scans down one at a time, and
 * a list has to decide what matters first.
 *
 * The order is Governance's own, read off its views:
 *
 *   title          the fact, and its value beside it — "Renewal date ·
 *                  Sep 22, 2026". A label with no value is a column header,
 *                  not a row.
 *   state badge    Verified / Pending review / Due to expire. Governance's
 *                  three, and the same three the Status filter offers.
 *   primaryMeta    risk level, and the attention flag when there is one. The
 *                  flag is the reason somebody opens the row, so it outranks
 *                  the provenance below it.
 *   secondaryMeta  where it came from, when it was last verified, and how far
 *                  it reaches.
 *
 * THE CONFIDENCE PERCENTAGE IS GONE. It was a column reading "~80%" for every
 * Sandbox claim and "100%" for every Truth fact — a number derived from the
 * plane, restating the plane, next to the plane's own Tag. A figure that
 * cannot vary between two rows is not data about either of them.
 */
const FACT_STATUS_TAG: Record<string, TagVariantLite> = {
  "Verified":       "success",
  "Pending review": "alert",
  "Due to expire":  "error",
}

const RISK_ICON: Record<string, string> = {
  Low:    "ShieldCheck",
  Medium: "ShieldAlert",
  High:   "ShieldX",
}

/* EntityList publishes a narrower tint set than HighlightIcon — it has no
   `informative`, it calls that one `info`. Mapped here rather than widening
   the component: the plane's identity colour is the same either way, and this
   is the only place in the file that needs the list's spelling. */
const PLANE_ROW_VARIANT: Record<KnowledgePlane, NonNullable<EntityListItemData["iconVariant"]>> = {
  truth:   "success",
  sandbox: "yellow",
  sources: "info",
}

function factRow(f: UcpFact, onPreview: (f: UcpFact) => void): EntityListItemData {
  return {
    id:          f.id,
    title:       `${f.label} · ${f.value}`,
    iconName:    PLANE_ICON[f.plane],
    iconVariant: PLANE_ROW_VARIANT[f.plane],
    primaryMeta: [
      { iconName: RISK_ICON[f.risk] ?? "Shield", label: `${f.risk} risk` },
      /* Only when there is one. An empty attention slot rendered as "None"
         is a row asserting the absence of a flag, which reads as a fourth
         flag called None. */
      ...(f.attention.length > 0
        ? [{ iconName: "Flag", label: f.attention.join(" · ") }]
        : []),
    ],
    secondaryMeta: [
      { iconName: "FileText",  label: f.source                     },
      { iconName: "CheckCheck", label: `Verified ${f.verifiedAt}`   },
      { iconName: "Share2",    label: f.scope                      },
    ],
    tags:    [{ label: PLANE_META[f.plane].label }],
    state:   { label: f.status, variant: FACT_STATUS_TAG[f.status] ?? "neutral" },
    actions: [{ label: "Preview", variant: "tertiary", icon: "Eye", onClick: () => onPreview(f) }],
  }
}

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
 * ── Intelligence ───────────────────────────────────────────────────────────
 *
 * One AI tab for what the system THINKS about this record (Michael,
 * 2026-09-10). The content is modelled on where the industry landed, checked
 * rather than remembered:
 *
 * · SALESFORCE EINSTEIN shows a score as a TIER with a DIRECTION — "High",
 *   "Medium", "Low" plus an arrow when it moves a tier — never a bare number,
 *   and it publishes how the score was computed. It also has KEY MOMENTS:
 *   notifications for the handful of things that actually changed the picture,
 *   like a competitor being mentioned or a sponsor leaving.
 * · GAINSIGHT's Customer 360 leads with a health scorecard and then names
 *   RISKS AND OPPORTUNITIES as separate lists, so the two are found rather
 *   than inferred, and hangs CTAs off them.
 *
 * Both put the same three things first: where does this stand, what should I
 * do, what changed. So the order here is score → recommended action → key
 * moments → the reasoning → the drivers behind the score. "Why" comes after
 * "what to do", because a reader who agrees with the recommendation never
 * needs the reasoning and a reader who disagrees needs all of it.
 *
 * WHAT AIMS OS ADDS, and what makes this more than a scorecard: every read
 * carries the AREA it is about, a CONFIDENCE, and a destination — and the
 * knowledge behind it is auditable one tab over, on Knowledge. Einstein tells
 * you the score; this tells you which plane the claim came from.
 *
 * Every number is computed from THIS record. Nothing here is a placeholder,
 * and each card says what it was derived from — a score whose derivation is
 * invisible is a score nobody can argue with, which is the same as one nobody
 * trusts.
 */

/** The areas that mean growth rather than maintenance. The agent already
 *  classifies every read by area, so an opportunity is a read in one of these
 *  — not a separate thing somebody has to tag. */
const OPPORTUNITY_AREAS = ["Renewal", "Expansion", "Deal"]

/** Einstein's tiering, applied to the risk score this record already carries.
 *  A tier is what a person acts on; the number is the audit trail. */
function riskTier(score: number): { label: string; variant: MetricVariant } {
  if (score >= 70) return { label: "High",     variant: "error"   }
  if (score >= 40) return { label: "Elevated", variant: "alert"   }
  return { label: "Low", variant: "success" }
}

function IntelligenceTab({ contact, onGoTab, onAsk }: {
  contact: UcpContact
  onGoTab: (id: string) => void
  onAsk:   () => void
}) {
  const [search, setSearch] = useState("")
  const [area,   setArea]   = useState<string | undefined>(undefined)

  const reads   = contact.insights
  const signals = contact.tags.filter(t => t.role === "signal")
  const risk    = useMemo(() => getRisk(contact), [contact])
  const score     = Number((risk.find(r => r.label === "Risk score")?.value ?? "0").split("/")[0].trim())
  const trendRow  = risk.find(r => r.label === "Trend")
  const rising    = trendRow?.variant === "error" || trendRow?.variant === "alert"
  const tier      = riskTier(score)

  const opportunities = reads.filter(r => OPPORTUNITY_AREAS.includes(r.category))

  /**
   * KEY MOMENTS, Einstein's device: the few things that changed the picture,
   * not a second copy of the activity feed. Two sources, both already on the
   * record — the signals it is carrying, and the activity rows whose state is
   * not "fine". A moment with nothing to say about it is not a moment, so
   * anything without a tooltip or a summary is left out.
   */
  const moments = useMemo(() => {
    const fromSignals = signals.map(t => ({
      id: `sig-${t.label}`, label: t.label, tone: t.tone,
      detail: t.tooltip ?? "", when: "",
    }))
    const fromActivity = getActivity(contact)
      .filter(a => a.state.variant === "error" || a.state.variant === "alert")
      .map(a => ({
        id: a.id, label: a.title, tone: a.state.variant === "error" ? "error" as const : "alert" as const,
        detail: a.aiSummary ?? a.meta, when: a.timestamp,
      }))
    return [...fromSignals, ...fromActivity].filter(m => m.detail)
  }, [contact, signals])

  const q = search.trim().toLowerCase()
  const visibleReads = reads
    .filter(r => !area || r.category === area)
    .filter(r => q === "" || [r.headline, r.detail, r.category].some(v => v.toLowerCase().includes(q)))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Where this record stands. The risk card leads with the TIER and the
          direction rather than the raw score, which is Einstein's own reading
          of the same problem: 54 means nothing to somebody who does not know
          the scale, "Elevated, and rising" means something immediately. */}
      <AdaptiveMetricGrid
        cards={[
          {
            label: "Risk", value: tier.label,
            feedback: `${score} / 100 · ${rising ? "rising" : "improving"} since the last scan`,
            feedbackType: tier.variant === "success" ? "positive" : "neutral",
            iconName: rising ? "TrendingUp" : "TrendingDown",
            iconVariant: tier.variant === "error" ? "error" : tier.variant === "alert" ? "alert" : "success",
          },
          {
            label: "Opportunities", value: opportunities.length,
            feedback: opportunities.length > 0
              ? `In ${Array.from(new Set(opportunities.map(o => o.category))).join(", ").toLowerCase()}`
              : "Nothing open on this record",
            feedbackType: opportunities.length > 0 ? "positive" : "neutral",
            iconName: "Target", iconVariant: "success",
          },
          {
            label: "Recommendations", value: contact.nba ? 1 : 0,
            feedback: contact.nba ? "One action proposed" : "Nothing proposed yet",
            feedbackType: "neutral",
            iconName: "Sparkle", iconVariant: "purple",
          },
        ]}
      />

      {/* WHAT TO DO, before why. Gainsight hangs a CTA off the scorecard for
          the same reason: a reader who agrees with the recommendation never
          needs the reasoning underneath it. */}
      {contact.nba && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>Recommended next</SectionLabel>
          <CardContainer size="sm">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                  {contact.nba.title}
                </span>
                <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{contact.nba.timestamp}</span>
              </div>
              {contact.nba.rationale && (
                <span style={{ fontSize: 12, color: "var(--field-supporting)", lineHeight: 1.55 }}>
                  {contact.nba.rationale}
                </span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button
                  variant="secondary" size="sm"
                  icon={<Sparkle size={13} strokeWidth={1.75} />}
                  onClick={onAsk}
                >
                  Ask the concierge
                </Button>
                <Button variant="tertiary" size="sm" onClick={() => onGoTab("activity")}>
                  See it as a task
                </Button>
              </div>
            </div>
          </CardContainer>
        </div>
      )}

      {/* WHAT CHANGED. Not the activity feed — the rows that are not fine,
          plus the signals the record carries, each with the one line that
          says why it matters. */}
      {moments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>Key moments</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {moments.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                <HighlightIcon
                  size="sm"
                  variant={m.tone === "error" ? "error" : "alert"}
                  iconName={m.tone === "error" ? "AlertCircle" : "AlertTriangle"}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{m.label}</span>
                    {m.when && (
                      <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{m.when}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--field-supporting)", lineHeight: 1.55 }}>
                    {m.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WHY — the agent's reads, each with its area, its confidence and the
          place to act on it. This is the part no scorecard has: Einstein gives
          you a score, this gives you the sentence behind it and the plane the
          claim came from, one tab over. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SectionLabel>Agent reads</SectionLabel>
        <Filters
          showSearch
          searchPlaceholder="Search reads by headline, detail or area…"
          searchValue={search}
          onSearchChange={setSearch}
          slots={[{
            placeholder: "Area",
            value:       area,
            options:     Array.from(new Set(reads.map(r => r.category))).sort(),
            onSelect:    setArea,
            onRemove:    () => setArea(undefined),
          }]}
          showClearFilters={!!area || q !== ""}
          onClearFilters={() => { setArea(undefined); setSearch("") }}
          showViewToggle={false}
          showAllFilters={false}
          showSort={false}
        />
        {visibleReads.length === 0 ? (
          <EmptyState
            compact
            icon={LucideIcons.Sparkle}
            title={q || area ? "No reads match" : "No reads yet"}
            description={q || area
              ? "Try another area, or clear the filters to see every read."
              : `${contact.agent.name} has not published a read on this record yet.`}
            ctaLabel={q || area ? "Clear filters" : undefined}
            onCta={q || area ? () => { setArea(undefined); setSearch("") } : undefined}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visibleReads.map(r => (
              <CardContainer key={r.id} size="sm">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <Sparkle size={13} strokeWidth={1.75} style={{ color: "var(--color-text-purple)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-purple)" }}>
                      {contact.agent.name}
                    </span>
                    <Tag variant="secondary" size="sm">{r.category}</Tag>
                    <span style={{ fontSize: 11, marginLeft: "auto", color: "var(--field-supporting)", whiteSpace: "nowrap" }}>
                      {r.confidence}% confidence
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.4 }}>
                    {r.headline}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--field-supporting)", lineHeight: 1.55 }}>
                    {r.detail}
                  </span>
                  {r.destination && (
                    <Button
                      variant="tertiary" size="sm" className="self-start !px-0"
                      icon={<LucideIcons.ArrowUpRight size={13} strokeWidth={1.75} />}
                      iconPosition="right"
                      onClick={() => onGoTab(r.destination!.toLowerCase())}
                    >
                      {`Open in ${r.destination}`}
                    </Button>
                  )}
                </div>
              </CardContainer>
            ))}
          </div>
        )}
      </div>

      {/* THE DRIVERS behind the score. Einstein publishes how it scored an
          opportunity for a reason: a score you cannot take apart is a score
          you cannot act on, and the first question anybody asks a number is
          "made of what". These are the study's own rows, tooltips included. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SectionLabel>What the risk score is made of</SectionLabel>
        <StatRowContent counters={risk.slice(0, 3)} checked={risk[3]} />
      </div>
    </div>
  )
}

/** The section label the panel-content page defines — 11px, semibold, upper,
 *  `--field-label`. Used here so Intelligence and Knowledge stack sections the
 *  same way a SlideOut body does. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>
      {children}
    </span>
  )
}

/**
 * The two-column key-value table from the SlideOut/SidePanel — Content page,
 * zone 7 — as ONE function rather than a shape each panel redraws.
 *
 * The drive preview already had it inline; the note preview needed the same
 * thing, and a second copy is how the 120px label column and the 1px divider
 * drift apart. The page's own anatomy: bordered 8px container, rows at
 * `py-8 px-12`, a fixed 120px label, dividers between rows and never after
 * the last one.
 *
 * `null` values are DROPPED, not rendered blank — that page is explicit that
 * a cell is never left empty, and a row for a fact the record does not have
 * ("Edited: never") is a row that says nothing. A value the record *should*
 * have and is missing is a different case and reads as italic Unknown.
 */
function DetailTable({ rows }: { rows: [string, React.ReactNode | null][] }) {
  const shown = rows.filter(([, value]) => value !== null && value !== undefined)
  return (
    <div className="flex flex-col rounded-[8px]" style={{ border: "1px solid var(--field-border)" }}>
      {shown.map(([label, value], i) => (
        <div key={label}>
          <div className="flex items-center gap-[19px] py-[8px] px-[12px]">
            <span className="w-[120px] shrink-0 text-[12px] font-medium leading-[20px]" style={{ color: "var(--foreground)" }}>{label}</span>
            <span className="flex-1 text-[12px] font-medium leading-[20px]" style={{ color: "var(--field-supporting)" }}>{value}</span>
          </div>
          {i < shown.length - 1 && <div className="w-full h-[1px]" style={{ background: "var(--color-border-neutral-lighter)" }} />}
        </div>
      ))}
    </div>
  )
}

/**
 * ── The note preview ───────────────────────────────────────────────────────
 *
 * Michael, 2026-09-10: a note opened from the Activity feed gets Overview and
 * Details tabs, built from the SlideOut/SidePanel — Content page's vocabulary.
 *
 * WHY A NOTE IS THE ONE ACTIVITY ROW WITH A PREVIEW. Every other row in that
 * feed is already whole: a call row carries its duration, its outcome and the
 * agent's read of it, and opening it would show the same four facts again. A
 * note row carries a FIRST LINE. The note is somewhere else, and so is the
 * thing that makes it matter on this record — the claims it pushed into the
 * Sandbox plane, each now waiting on a source. That is content the row has
 * nowhere to put, which is what earns the Eye.
 *
 * THE SPLIT BETWEEN THE TABS is what was written versus what the system did
 * with it. Overview is the note: the agent's read of it, the body as typed,
 * the claims it produced and the records it names. Details is the note's
 * metadata: who wrote it, where, when, who can see it. Somebody who opened
 * this to read the note should not have to walk past a provenance table to
 * reach the first sentence, and somebody auditing the scope should not have
 * to scroll three paragraphs to find it.
 *
 * ORDER INSIDE OVERVIEW follows that page's fixed content order — AI Summary
 * first, then list sections — with one deliberate departure: the BODY sits
 * second, between the summary and the lists. The body is not a zone in that
 * vocabulary at all; it is the record itself, and a panel that puts a
 * three-card metric grid above the thing the reader opened it to read has the
 * order backwards. The claims are the list section, and they come after.
 *
 * CONSISTENCY WITH GOVERNANCE. `scope` is one of SANDBOX_SCOPES and each
 * claim's status is one of TRUTH_STATUSES — the same words, with the same
 * meanings, as the Sandbox and Truth Plane shelves in the Knowledge tab, and
 * as the live Governance views those came from. A note is a Sandbox artefact,
 * so it is described in Sandbox's language rather than in a vocabulary this
 * panel invented for itself.
 */
const CLAIM_STATUS_TAG: Record<string, "success" | "alert" | "error"> = {
  "Verified":       "success",
  "Pending review": "alert",
  "Due to expire":  "error",
}

function NotePreview({
  note, title, agentName, open, onClose,
}: {
  note:      UcpNote | null
  title:     string
  agentName: string
  open:      boolean
  onClose:   () => void
}) {
  const [tab, setTab] = useState(0)

  return (
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      title={title}
      subtitle={note ? `Note · ${note.author}` : ""}
      showIcon
      /* Purple, and the same StickyNote glyph the row carries — the Activity
         list already colours a note purple because a note is somebody
         writing. A preview that opened under a different mark than the row it
         came from is the drive-preview bug over again. */
      iconContent={<HighlightIcon size="sm" variant="purple" iconName="StickyNote" />}
      showStatus
      statusLabel={note?.scope}
      showTopButton={false}
      showTabs
      showTab3={false}
      tabLabels={["Overview", "Details", ""]}
      activeTab={tab}
      onTabChange={setTab}
      showSearchBar={false}
      showChips={false}
      showCta={false}
    >
      {note && (
        <div className={PANEL_CONTENT_CLASS}>
          {tab === 0 ? (
            <>
              {/* Zone 1 — AI Summary. Always first when present. */}
              <div
                className="flex flex-col gap-[6px] rounded-[8px] p-[12px]"
                style={{ background: "var(--color-surface-purple-more-subtle)", border: "0.5px solid var(--card-purple-border)" }}
              >
                <div className="flex items-center gap-[6px]">
                  <Sparkle size={11} style={{ color: "var(--color-text-purple)" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "var(--color-text-purple)" }}>
                    {agentName}&rsquo;s read
                  </span>
                </div>
                <p className="text-[12px] leading-[1.6]" style={{ color: "var(--foreground)" }}>
                  {note.claims.length === 0
                    ? "Nothing in this note produced a claim — it is context, not evidence."
                    : `${note.claims.length} claim${note.claims.length === 1 ? "" : "s"} came out of this note. ` +
                      `${note.claims.filter(c => c.status === "Verified").length} of them found a corroborating source; ` +
                      "the rest are still in the Sandbox plane."}
                </p>
              </div>

              {/* The note itself, as written. */}
              <div className="flex flex-col gap-[8px]">
                <SectionLabel>Note</SectionLabel>
                <div className="flex flex-col gap-[10px]">
                  {note.body.map((para, i) => (
                    <p key={i} className="text-[12px] leading-[1.7]" style={{ color: "var(--field-supporting)" }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Zone 3 — a list section, with the Title–Description variant:
                  the count alone does not say what a claim IS on this record,
                  and this is the one thing in the panel that has consequences
                  outside it. */}
              {note.claims.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <div className="flex flex-col gap-[2px]">
                    <SectionLabel>Claims from this note</SectionLabel>
                    <span className="text-[11px]" style={{ color: "var(--field-supporting)" }}>
                      Written into the Sandbox plane. Each needs a source before it can reach Truth.
                    </span>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    {note.claims.map(c => (
                      <CardContainer key={c.label} size="sm" className="!p-0 overflow-hidden">
                        <EntityList items={[{
                          id:          c.label,
                          title:       c.label,
                          iconName:    "FileCheck",
                          iconVariant: c.status === "Verified" ? "success" : c.status === "Due to expire" ? "error" : "yellow",
                          state:       { label: c.status, variant: CLAIM_STATUS_TAG[c.status] ?? "neutral" },
                        }]} />
                      </CardContainer>
                    ))}
                  </div>
                </div>
              )}

              {note.linked.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <SectionLabel>Linked records</SectionLabel>
                  <div className="flex flex-col gap-[8px]">
                    {note.linked.map(l => (
                      <CardContainer key={l.title} size="sm" className="!p-0 overflow-hidden">
                        <EntityList items={[{
                          id:            l.title,
                          title:         l.title,
                          iconName:      l.icon,
                          iconVariant:   "info",
                          secondaryMeta: [{ iconName: "Info", label: l.kind }],
                        }]} />
                      </CardContainer>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col gap-[8px]">
                <SectionLabel>Details</SectionLabel>
                <DetailTable rows={[
                  ["Author",     note.author],
                  ["Role",       note.authorRole],
                  ["Written in", note.writtenIn],
                  ["Created",    note.createdAt],
                  ["Edited",     note.editedAt ?? null],
                  ["Scope",      <Tag variant="neutral" size="sm">{note.scope}</Tag>],
                  ["Claims",     `${note.claims.length} in the Sandbox plane`],
                ]} />
              </div>

              {note.attachments.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <SectionLabel>Attachments</SectionLabel>
                  <div className="flex flex-col gap-[8px]">
                    {note.attachments.map(a => (
                      <CardContainer key={a.name} size="sm" className="!p-0 overflow-hidden">
                        <EntityList items={[{
                          id:            a.name,
                          title:         a.name,
                          iconName:      "Paperclip",
                          iconVariant:   "neutral",
                          secondaryMeta: [{ iconName: "Info", label: a.meta }],
                        }]} />
                      </CardContainer>
                    ))}
                  </div>
                </div>
              )}

              {/* The same closing section the drive preview carries, saying
                  the equivalent thing for a note. Both previews answer "what
                  does this do to the record" in the same place, in the same
                  words as the Knowledge tab's own shelves. */}
              <div className="flex flex-col gap-[8px]">
                <SectionLabel>How this is used</SectionLabel>
                <span className="text-[12px] leading-[1.6]" style={{ color: "var(--field-supporting)" }}>
                  A note is a Sandbox artefact. {agentName} can cite it and can act on what it says,
                  but nothing in it counts as verified until a claim it produced finds a source.
                  Scope decides who sees the note; it does not change what the claims are worth.
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </SlideOut>
  )
}

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
  group: ActivityGroup | "all",
  kind: string | undefined,
  search: string,
  status: string | undefined,
  period: string | undefined,
  now: Date,
): ReturnType<typeof getActivity> {
  const q = search.trim().toLowerCase()
  return rows
    .filter(a => group === "all" || CHANNEL_GROUP[a.channel] === group)
    .filter(a => !kind || CHANNEL_META[a.channel].label === kind)
    .filter(a => q === "" || [a.title, a.meta, a.timestamp].some(v => v.toLowerCase().includes(q)))
    .filter(a => !status || a.state.label === status)
    .filter(a => withinPeriod(parseActivityAt(a.timestamp, now), period, now))
}

function ActivityTab({
  contact, group, onGroupChange, kind, onKindChange, search, onSearchChange,
  status, onStatusChange, period, onPeriodChange, now, page, pageSize, onPreview,
}: {
  contact:  UcpContact
  /** The four kinds of thing an activity row can be. */
  group:    ActivityGroup | "all"
  onGroupChange: (g: ActivityGroup | "all") => void
  /** Which communication kind, when Communications is the selected group.
   *  Undefined means all of them. */
  kind:     string | undefined
  onKindChange: (value: string | undefined) => void
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
  /** Opens the note preview. Only note rows carry one. */
  onPreview: (n: UcpNote, title: string) => void
}) {
  const all      = useMemo(() => getActivity(contact), [contact])
  const filtered = useMemo(
    () => filterActivity(all, group, kind, search, status, period, now),
    [all, group, kind, search, status, period, now],
  )
  const paged    = filtered.slice((page - 1) * pageSize, page * pageSize)

  const items: EntityListItemData[] = paged.map(a => ({
    id:          a.id,
    title:       a.title,
    iconName:    CHANNEL_META[a.channel].icon,
    // The GROUP carries the colour, so every communication looks like a
    // communication whichever kind it is: a task is what needs doing (alert),
    // an event is the system acting on its own (neutral), a note is somebody
    // writing (purple, the same mark interpretation carries elsewhere).
    iconVariant: (CHANNEL_GROUP[a.channel] === "task" ? "alert"
      : CHANNEL_GROUP[a.channel] === "event" ? "neutral"
      : CHANNEL_GROUP[a.channel] === "note"  ? "purple"
      : "info") as EntityListItemData["iconVariant"],
    primaryMeta: [{ iconName: "Clock", label: a.timestamp }],
    secondaryMeta: [{ iconName: "Info", label: a.meta }],
    state:       { label: a.state.label, variant: a.state.variant },
    aiInsight:   a.aiSummary
      ? { action: "summary", detail: a.aiSummary, viewMore: a.aiSummary.length > 160 }
      : undefined,
    /* The Eye is conditional on the NOTE, not on the channel. Every other row
       in this feed is already showing everything it has — a call row's whole
       content is its title, its duration and the agent's read of it, all three
       visible without opening anything. A note row is the one case where the
       row is a first line and the thing itself is somewhere else, so it is the
       one row that earns a preview. CLAUDE.md: omit the button entirely rather
       than render a disabled one. */
    actions: a.note
      ? [{ label: "Preview", variant: "tertiary" as const, icon: "Eye", onClick: () => onPreview(a.note!, a.title) }]
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
          // Only while Communications is selected: email, SMS, call, meeting.
          ...(group === "communication" ? [{
            placeholder: "Channel",
            value:       kind,
            options:     COMMUNICATION_CHANNELS.map(ch => CHANNEL_META[ch].label),
            onSelect:    onKindChange,
            onRemove:    () => onKindChange(undefined),
          }] : []),
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
        showClearFilters={!!status || !!period || !!kind || search !== ""}
        onClearFilters={() => { onStatusChange(undefined); onPeriodChange(undefined); onKindChange(undefined); onSearchChange("") }}
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

      {/* Four chips, not seven — Communications · Notes · Events · Tasks. The
          communication KINDS refine that one group from the Filters bar above,
          which is where a second level belongs: a flat row of every leaf is a
          filter nobody reads, and three of the seven would sit at zero on most
          records. */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Chip size="s" variant={group === "all" ? "primary" : "secondary"} onClick={() => { onGroupChange("all"); onKindChange(undefined) }}>
          All ({all.length})
        </Chip>
        {ACTIVITY_GROUPS.map(g => (
          <Chip
            key={g.id}
            size="s"
            variant={group === g.id ? "primary" : "secondary"}
            // Leaving Communications drops the kind with it — a kind that
            // cannot apply to the selected group is a filter still narrowing
            // something the reader can no longer see.
            onClick={() => { onGroupChange(g.id); if (g.id !== "communication") onKindChange(undefined) }}
          >
            {g.label} ({all.filter(a => CHANNEL_GROUP[a.channel] === g.id).length})
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={q ? `No activity for “${search}”` : "Nothing of this kind yet"}
          description={q
            ? "Try a shorter term, or clear the search to see the full timeline."
            : "Try another kind, or clear the filter to see the full timeline."}
          ctaLabel={q ? "Clear search" : "Clear filter"}
          onCta={() => { if (q) onSearchChange(""); else { onGroupChange("all"); onKindChange(undefined) } }}
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

/**
 * ── Knowledge (was Drives) ─────────────────────────────────────────────────
 *
 * The entity's own mini-governance — what the system HOLDS about it, on three
 * shelves of the same cupboard (Michael, 2026-09-10):
 *
 *   Documents  folders and files, and what has been cited out of them
 *   Sandbox    claims pending or in processing — not yet verified
 *   Truth      verified facts
 *
 * The facts table used to live in Snapshot and the documents had a tab of
 * their own, which put a verified fact and the document it came from two tabs
 * apart. They are the same question — "what do we actually know, and can we
 * prove it" — so they are one tab with a shelf selector.
 *
 * The plane counts lead here, and this is the one place they should: on
 * Intelligence they were plumbing, and on a governance tab counting the
 * shelves IS the summary.
 */
type Shelf = "documents" | "sandbox" | "truth"

/** Governance's "Modificar" buckets, resolved from a drive's last sync. The
 *  fixtures write it as "Today, 06:00" or "Aug 4, 2026", so both shapes are
 *  read — the same parser the Activity separators use would be overkill for
 *  six rows, but the buckets are the ones Governance offers, in its order. */
function modifiedBucket(lastSync: string): string {
  if (/^Today/i.test(lastSync))     return "Today"
  if (/^Yesterday/i.test(lastSync)) return "Yesterday"
  const d = new Date(lastSync.split("·")[0].trim())
  if (Number.isNaN(d.getTime())) return "Older"
  const days = Math.round((new Date("2026-09-10").getTime() - d.getTime()) / 86_400_000)
  if (days <= 7)  return "Last 7 days"
  if (days <= 30) return "Last 30 days"
  return "Older"
}

function KnowledgeTab({ contact, onPreview, onPreviewFact }: {
  contact: UcpContact
  onPreview: (d: UcpDrive) => void
  onPreviewFact: (f: UcpFact) => void
}) {
  const [shelf,    setShelf]    = useState<Shelf>("sandbox")
  const [search,   setSearch]   = useState("")
  /** Drives — Governance's two: Modificar and Todos los departamentos. */
  const [modified,   setModified]   = useState<string | undefined>(undefined)
  const [department, setDepartment] = useState<string | undefined>(undefined)
  /** Truth Plane — Estado · Nivel de riesgo · Atención requerida. */
  const [status,     setStatus]     = useState<string | undefined>(undefined)
  const [risk,       setRisk]       = useState<string | undefined>(undefined)
  const [attention,  setAttention]  = useState<string | undefined>(undefined)
  /** Sandbox — Todos los estados · Todos los ámbitos. */
  const [claimState, setClaimState] = useState<string | undefined>(undefined)
  const [scope,      setScope]      = useState<string | undefined>(undefined)

  const allDrives = useMemo(() => getDrives(contact), [contact])
  const facts     = useMemo(() => getFacts(contact), [contact])
  const q         = search.trim().toLowerCase()

  const drives = allDrives
    .filter(d => q === "" || [d.name, d.provider, d.owner, d.kind, d.scope, d.department].some(v => v.toLowerCase().includes(q)))
    .filter(d => !department || d.department === department)
    // "Modificar" reads the drive's own last sync, which is the only date it
    // has — the same field the row shows, so the filter and the row agree.
    .filter(d => !modified || modifiedBucket(d.lastSync) === modified)

  const factsOn = (plane: KnowledgePlane) => facts
    .filter(f => f.plane === plane)
    .filter(f => q === "" || [f.label, f.value, f.source].some(v => v.toLowerCase().includes(q)))

  const truthFacts = factsOn("truth")
    .filter(f => !status    || f.status === status)
    .filter(f => !risk      || f.risk === risk)
    .filter(f => !attention || f.attention.includes(attention))

  const sandboxFacts = factsOn("sandbox")
    .filter(f => !claimState || f.state === claimState)
    .filter(f => !scope      || f.scope === scope)

  const sourceFacts  = factsOn("sources")
  const shelfFacts   = shelf === "sandbox" ? sandboxFacts : truthFacts
  const hasFilters   = q !== "" || !!modified || !!department || !!status || !!risk || !!attention || !!claimState || !!scope
  const clearAll = () => {
    setSearch(""); setModified(undefined); setDepartment(undefined)
    setStatus(undefined); setRisk(undefined); setAttention(undefined)
    setClaimState(undefined); setScope(undefined)
  }

  /** Michael's three chips, in his order and with his labels (2026-09-10):
   *  Sandbox · Truth Plane · Drives. "Drives" rather than "Documents" because
   *  that is what the platform calls the thing — a Source Drive — and the
   *  chip should say what the reader will click into. */
  const SHELVES: { id: Shelf; label: string; count: number }[] = [
    { id: "sandbox",   label: "Sandbox",     count: facts.filter(f => f.plane === "sandbox").length },
    { id: "truth",     label: "Truth Plane", count: facts.filter(f => f.plane === "truth").length },
    { id: "documents", label: "Drives",      count: allDrives.length },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/*
        THE THREE HIGHLIGHT CARDS ARE GONE — Michael, 2026-09-10: "usan mucho
        espacio en comparación al valor informativo que aportan".

        He is right, and the reason is structural rather than a matter of
        taste: the SwitchTab immediately below already carried every number
        those cards did — Sandbox (3) · Truth Plane (5) · Drives (6) — so the
        grid was a third of the tab's height spent restating its labels. A
        card that counts to three, beside a control that counts to three, is
        not a summary of the section; it is the section's own navigation drawn
        twice, once in a form you cannot click.

        What the cards did carry and the tabs do not is the confidence line
        ("agents treat as absolute"). That is a property of the PLANE, not of
        this record, and it belongs where a reader meets a plane for the first
        time — it is on each shelf's own empty state and in the preview
        panels. Nothing was lost by deleting the grid.
      */}
      {/*
        THE SHELF SELECTOR IS A SwitchTab, TO THE LEFT OF THE FILTERS
        (Michael, 2026-09-10) — because each shelf brings a DIFFERENT filter
        set, and a chip row that changes the controls beside it reads as the
        page rearranging itself. A segmented control reads as "I am in this
        one", which is what makes the filters next to it obviously its own.

        The filter sets are Governance's, read off the real views rather than
        invented: Drives filters by Modificar and department, Truth Plane by
        Estado / Nivel de riesgo / Atención requerida, Sandbox by state and
        ámbito. Their UI is not copied — these are DS `Filters` slots.
      */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <SwitchTab
          size="s"
          value={shelf}
          onChange={id => { setShelf(id as Shelf); clearAll() }}
          aria-label="Knowledge shelf"
          items={SHELVES.map(sh => ({ id: sh.id, label: `${sh.label} (${sh.count})` }))}
        />
        <div style={{ flex: 1, minWidth: 320 }}>
          <Filters
            showSearch
            searchPlaceholder={
              shelf === "documents" ? "Search drives by name, provider or owner…"
              : shelf === "sandbox" ? "Search claims by label, value or source…"
              : "Search facts by label, value or source…"}
            searchValue={search}
            onSearchChange={setSearch}
            slots={
              shelf === "documents" ? [
                { placeholder: "Modified",   value: modified,   options: DRIVE_MODIFIED_OPTIONS,                        onSelect: setModified,   onRemove: () => setModified(undefined) },
                { placeholder: "Department", value: department, options: Array.from(new Set(allDrives.map(d => d.department))).sort(), onSelect: setDepartment, onRemove: () => setDepartment(undefined) },
              ] : shelf === "sandbox" ? [
                { placeholder: "State", value: claimState, options: SANDBOX_STATES, onSelect: setClaimState, onRemove: () => setClaimState(undefined) },
                { placeholder: "Scope", value: scope,      options: SANDBOX_SCOPES, onSelect: setScope,      onRemove: () => setScope(undefined) },
              ] : [
                { placeholder: "Status",    value: status,    options: TRUTH_STATUSES, onSelect: setStatus,    onRemove: () => setStatus(undefined) },
                { placeholder: "Risk",      value: risk,      options: RISK_LEVELS,    onSelect: setRisk,      onRemove: () => setRisk(undefined) },
                { placeholder: "Attention", value: attention, options: ATTENTION_FLAGS, onSelect: setAttention, onRemove: () => setAttention(undefined) },
              ]
            }
            showClearFilters={hasFilters}
            onClearFilters={clearAll}
            showViewToggle={false}
            showAllFilters={false}
            showSort={false}
          />
        </div>
      </div>

      {shelf === "documents" ? (
        allDrives.length === 0 ? (
          <EmptyState
            icon={HardDrive}
            title="No drives attached"
            description="Source Drives connected to this record will appear here."
          />
        ) : drives.length === 0 ? (
          <EmptyState
            icon={HardDrive}
            title={q ? `No drives for “${search}”` : "No drives match these filters"}
            description={q
              ? "Try a shorter term, or clear the search to see every drive on this record."
              : "Try a different type, provider or status — or clear the filters."}
            ctaLabel="Clear filters"
            onCta={clearAll}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
                        { iconName: "User",      label: `Owner · ${d.owner}` },
                        { iconName: "RefreshCw", label: `Last sync · ${d.lastSync}` },
                        { iconName: "Share2",    label: d.scope },
                      ],
                      tags:    [{ label: d.kind }],
                      state:   { label: d.state.label, variant: d.state.variant },
                      actions: [{ label: "Preview", variant: "tertiary", icon: "Eye", onClick: () => onPreview(d) }],
                    }]}
                  />
                </CardContainer>
              ))}
            </div>

            {/* What has been cited OUT of these documents. The Sources plane is
                fed by the drives — the preview panel says so — so its facts
                belong on this shelf rather than in a fourth chip nobody would
                connect to the documents above them. */}
            {sourceFacts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <SectionLabel>Cited from these drives</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {sourceFacts.map(f => (
                    <CardContainer key={f.id} size="sm" className="!p-0 overflow-hidden">
                      <EntityList items={[factRow(f, onPreviewFact)]} />
                    </CardContainer>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : shelfFacts.length === 0 ? (
        <EmptyState
          icon={ScanLine}
          title={q ? `No claims for “${search}”` : `Nothing on the ${shelf} plane`}
          description={q
            ? "Try a shorter term, or clear the search to see this whole plane."
            : shelf === "sandbox"
              ? "No claim is waiting on verification for this record."
              : "Nothing has been verified onto the Truth plane for this record yet."}
          ctaLabel={q ? "Clear search" : undefined}
          onCta={q ? () => setSearch("") : undefined}
        />
      ) : (
        /* ALL THREE SHELVES ARE LISTS NOW — Michael, 2026-09-10: "muestra los
           3 casos del Switch tab como lista".

           The facts were a Table and the drives were an EntityList, which made
           one segmented control switch between two different kinds of object:
           a table is columns you compare down, a list is items you act on one
           at a time. On this shelf you act — a claim gets previewed, chased,
           and eventually attested — so the list is the right shape and the
           table was the odd one out.

           What the columns carried is not lost, it is re-ranked. A row leads
           with the fact and its value, then Governance's own axes: status,
           risk and, when there is one, the attention flag that is the reason
           somebody would open it. */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shelfFacts.map(f => (
            <CardContainer key={f.id} size="sm" className="!p-0 overflow-hidden">
              <EntityList items={[factRow(f, onPreviewFact)]} />
            </CardContainer>
          ))}
        </div>
      )}
    </div>
  )
}

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
  const [actGroup,   setActGroup]   = useState<ActivityGroup | "all">("all")
  const [actKind,    setActKind]    = useState<string | undefined>(undefined)
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
  const [notePeek,   setNotePeek]   = useState<{ note: UcpNote; title: string } | null>(null)
  const [factPeek,   setFactPeek]   = useState<UcpFact | null>(null)

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
    () => filterActivity(getActivity(contact), actGroup, actKind, actSearch, actStatus, actPeriod, now).length,
    [contact, actGroup, actKind, actSearch, actStatus, actPeriod, now],
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
          {/* THE PINNED ZONE CARRIES THE PAGE BAR AND NOTHING ELSE.

              A duplicate EntityHeader — with the Export action and the Next
              Best Action card still on it — survived here through a rebase:
              main had moved the card into the scroll container the same day
              this branch was editing it in place, and the replay kept both
              copies. Two identity cards rendered, and the stale one crashed
              on a `nba` binding that no longer exists.

              The live one is below, in the content, where Michael put it —
              it sticks itself with `compressOnScroll`, so pinning it here
              would spend header height on something that already knows how
              to hold its own position. */}
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
          {tab === "intelligence" && <IntelligenceTab contact={contact} onGoTab={goTab} onAsk={openChat} />}
          {tab === "activity" && (
            <ActivityTab
              contact={contact}
              group={actGroup}
              onGroupChange={g => { setActGroup(g); setActPage(1) }}
              kind={actKind}
              onKindChange={k => { setActKind(k); setActPage(1) }}
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
              onPreview={(note, title) => setNotePeek({ note, title })}
            />
          )}
          {tab === "knowledge" && <KnowledgeTab contact={contact} onPreview={setDrivePeek} onPreviewFact={setFactPeek} />}
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
              <DetailTable rows={[
                ["Provider",   drivePeek.provider],
                ["Contents",   drivePeek.items],
                ["Owner",      drivePeek.owner],
                ["Department", drivePeek.department],
                ["Last sync",  drivePeek.lastSync],
                ["Scope",      drivePeek.scope],
              ]} />
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

      {/*
        ── A fact or a claim, previewed in Governance's own words ───────────
        Michael, 2026-09-10: make the preview of each item consistent with
        what Governance shows.

        Governance's own row for a plane reads "Hechos · Propuestas · Riesgo
        bajo" and, for a Sandbox entry, "Fuentes · Reclamaciones · Promociones
        · Bundles". Applied one level down — to a single fact rather than to a
        whole plane — the fields that survive are the ones on a row here:
        status, risk level, attention flags, scope, where it came from and
        when it was last verified. Those are the five filters the shelves
        offer, which is the test: a panel that cannot answer the question a
        filter asks is not the same data seen closer up.

        // NOTE: written from the Governance filter vocabulary captured on
        // 2026-09-10, not from the truth-plane item view itself — that view
        // is behind a sign-in this session cannot pass. Fields may need one
        // more pass once it can be read.
      */}
      <SlideOut
        open={factPeek !== null}
        onClose={() => setFactPeek(null)}
        type="with-variants"
        size="m"
        title={factPeek?.label ?? ""}
        subtitle={factPeek ? `${PLANE_META[factPeek.plane].label} Plane · ${factPeek.scope}` : ""}
        showIcon
        iconContent={factPeek ? <HighlightIcon size="sm" variant={PLANE_ICON_VARIANT[factPeek.plane]} iconName={PLANE_ICON[factPeek.plane]} /> : undefined}
        showStatus
        statusLabel={factPeek?.status}
        showTopButton={false}
        showTabs={false}
        showSearchBar={false}
        showChips={false}
        showCta={false}
      >
        {factPeek && (
          <div className={PANEL_CONTENT_CLASS}>
            {/* The value first, and large. Everything else on this panel is
                about how much to trust it. */}
            <div className="flex flex-col gap-[4px]">
              <SectionLabel>Value</SectionLabel>
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-title)", lineHeight: 1.4 }}>
                {factPeek.value}
              </span>
            </div>

            {factPeek.attention.length > 0 && (
              <div className="flex flex-col gap-[8px]">
                <SectionLabel>Needs attention</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {factPeek.attention.map(a => (
                    <Tag key={a} variant={a === "Due to expire" ? "error" : "alert"} size="sm">{a}</Tag>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-[8px]">
              <SectionLabel>Governance</SectionLabel>
              <DetailTable rows={[
                ["Plane",         <Tag variant={PLANE_META[factPeek.plane].tag} size="sm">{PLANE_META[factPeek.plane].label}</Tag>],
                ["Status",        <Tag variant={FACT_STATUS_TAG[factPeek.status] ?? "neutral"} size="sm">{factPeek.status}</Tag>],
                ["Risk level",    factPeek.risk],
                ["State",         factPeek.state],
                ["Scope",         factPeek.scope],
                ["Source",        factPeek.source],
                ["Last verified", factPeek.verifiedAt],
              ]} />
            </div>

            <div className="flex flex-col gap-[8px]">
              <SectionLabel>What an agent may do with it</SectionLabel>
              <span className="text-[12px] leading-[1.6]" style={{ color: "var(--field-supporting)" }}>
                {factPeek.plane === "truth"
                  ? `${contact.agent.name} treats this as true and will commit to it in a reply without asking. That is what attestation buys, and it is why a fact due to expire is a problem rather than a note.`
                  : factPeek.plane === "sandbox"
                    ? `${contact.agent.name} can cite this and cannot commit to it. A draft that depends on it is held by The Council until a domain owner attests it or a source corroborates it.`
                    : `Material, not a claim. ${contact.agent.name} can quote it with its citation; nothing here is asserted as true on its own.`}
              </span>
            </div>
          </div>
        )}
      </SlideOut>

      <NotePreview
        note={notePeek?.note ?? null}
        title={notePeek?.title ?? ""}
        agentName={contact.agent.name}
        open={notePeek !== null}
        onClose={() => setNotePeek(null)}
      />

    </ScreenLayout>
  )
}

// No default export on purpose: the profile is not its own prototype card. It
// is reached by opening a row in the Contacts roster, which is the real flow —
// one card, one entry point.
