import { useMemo, useState } from "react"
import { Phone, Mail, Sparkles, MessageSquare, ClipboardCheck, PhoneCall } from "lucide-react"
import { Tabs } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Filters } from "@/components/ui/filters"
import { Tag, type TagVariant } from "@/components/ui/tag"
import { EmptyState } from "@/components/ui/empty-state"
import {
  UCP_ALEJANDRO,
  UCP_ACTIVITY_GROUPS,
  UCP_AGENTS,
  UCP_ACTIVITY_TOTAL,
  type ActivityItem,
  type ActivityKind,
  type ActivityAccent,
  type ActivityBadge,
  type Sentiment,
} from "./ucp-data"

// ─────────────────────────────────────────────────────────────────────
// UcpAlejandroPage — port of the "Contacts" screen (`#screen-ucp`) from
// voice-channel-ux.html.
//
// Composition:
//   – Contact header (avatar + email + phone + last interaction)
//   – 7 UCP tabs — Overview / Activity / Snapshot / Garage /
//     Appointments / Repair Orders / Tasks
//   – Activity tab body: DS Chip pills for kind + agent filters (matches
//     the CallHistoryTab pattern) and DS Filters showSort for order.
//
// Only the Activity tab has real content — the source prototype exposes
// the other 6 as labels only. Ports them as honest EmptyState stubs so
// the tab strip stays truthful and a follow-up PR can fill each one in.
// ─────────────────────────────────────────────────────────────────────

type UcpTab = "overview" | "activity" | "snapshot" | "garage" | "appointments" | "repair-orders" | "tasks"

const TABS: { id: UcpTab; label: string }[] = [
  { id: "overview",      label: "Overview"      },
  { id: "activity",      label: "Activity"      },
  { id: "snapshot",      label: "Snapshot"      },
  { id: "garage",        label: "Garage"        },
  { id: "appointments",  label: "Appointments"  },
  { id: "repair-orders", label: "Repair Orders" },
  { id: "tasks",         label: "Tasks"         },
]

type KindFilter = "all" | ActivityKind
type SortOrder  = "newest" | "oldest"

interface UcpAlejandroPageProps {
  /** Called when a call activity row is clicked — lets the parent
   *  jump into the Call Detail slide-out or page. */
  onOpenCallDetail?: (callDetailId: string) => void
  /** Called when the "Load older activity" CTA is clicked. Optional so
   *  the button gracefully no-ops when the parent hasn't wired it. */
  onLoadOlder?:     () => void
}

export function UcpAlejandroPage({ onOpenCallDetail, onLoadOlder }: UcpAlejandroPageProps) {
  const [tab,    setTab]    = useState<UcpTab>("activity")
  const [kind,   setKind]   = useState<KindFilter>("all")
  const [agent,  setAgent]  = useState<string>("all")
  const [sort,   setSort]   = useState<SortOrder>("newest")

  const filteredGroups = useMemo(() => {
    const source = sort === "oldest"
      ? UCP_ACTIVITY_GROUPS.slice().reverse()
      : UCP_ACTIVITY_GROUPS

    return source
      .map(g => ({
        ...g,
        items: g.items.filter(i => {
          if (kind  !== "all" && i.kind  !== kind)  return false
          if (agent !== "all" && i.agent !== agent) return false
          return true
        }),
      }))
      .filter(g => g.items.length > 0)
  }, [kind, agent, sort])

  const filteredCount = filteredGroups.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className="flex flex-col" style={{ minHeight: "70vh" }}>

      {/* ── Contact identity strip ──────────────────────────────
          The DS Header (outer ScreenLayout) already carries the email
          as title and "Contact · Last interaction Xd ago" as subtitle,
          so this row drops the duplicated text. It keeps the avatar as
          a visual identity anchor and exposes the actionable contact
          methods (phone + email) as clickable chips. */}
      <div
        className="flex items-center gap-4 flex-wrap"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--color-border-neutral-default)",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--color-surface-purple-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700,
            color: "var(--color-icon-purple-default, var(--color-text-title))",
            flexShrink: 0,
          }}
        >
          {UCP_ALEJANDRO.initials}
        </div>
        <div className="flex gap-5 flex-wrap">
          <ContactLink icon={<Phone size={14}/>} label={UCP_ALEJANDRO.phone} href={`tel:${UCP_ALEJANDRO.phone}`}/>
          <ContactLink icon={<Mail  size={14}/>} label={UCP_ALEJANDRO.email} href={`mailto:${UCP_ALEJANDRO.email}`}/>
        </div>
      </div>

      {/* ── Tab strip ─────────────────────────────────────────── */}
      <div style={{ padding: "0 12px", borderBottom: "1px solid var(--color-border-neutral-default)" }}>
        <Tabs
          items={TABS}
          activeId={tab}
          onChange={(id) => setTab(id as UcpTab)}
        />
      </div>

      {/* ── Tab body ──────────────────────────────────────────── */}
      <div style={{ padding: 24 }}>
        {tab === "activity" ? (
          <ActivityBody
            kind={kind}          onKind={setKind}
            agent={agent}        onAgent={setAgent}
            sort={sort}          onSort={setSort}
            filteredCount={filteredCount}
            filteredGroups={filteredGroups}
            onOpenCallDetail={onOpenCallDetail}
            onLoadOlder={onLoadOlder}
          />
        ) : (
          <TabStub tab={tab}/>
        )}
      </div>
    </div>
  )
}

// ─── Contact header link ──────────────────────────────────────────────

function ContactLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2"
      style={{
        fontSize: 14,
        color: "var(--color-icon-primary-default)",
        textDecoration: "underline",
      }}
    >
      <span style={{ color: "var(--color-text-caption)", display: "flex", alignItems: "center" }}>{icon}</span>
      {label}
    </a>
  )
}

// ─── Activity body ────────────────────────────────────────────────────

function ActivityBody({
  kind, onKind, agent, onAgent, sort, onSort,
  filteredCount, filteredGroups, onOpenCallDetail, onLoadOlder,
}: {
  kind:            KindFilter
  onKind:          (v: KindFilter) => void
  agent:           string
  onAgent:         (v: string) => void
  sort:            SortOrder
  onSort:          (v: SortOrder) => void
  filteredCount:   number
  filteredGroups:  { key: string; label: string; items: ActivityItem[] }[]
  onOpenCallDetail?: (callDetailId: string) => void
  onLoadOlder?:      () => void
}) {
  const KIND_OPTIONS: { id: KindFilter; label: string }[] = [
    { id: "all",   label: "All"   },
    { id: "call",  label: "Calls" },
    { id: "email", label: "Email" },
    { id: "sms",   label: "SMS"   },
    { id: "task",  label: "Tasks" },
  ]

  // Agent filter: current seed only has Sammy — render one chip per agent
  // + an "All" chip, matching the CallHistoryTab direction-filter pattern.
  const agentOptions = ["all", ...UCP_AGENTS]

  return (
    <div className="flex flex-col gap-4">
      {/* Header row: title + item count */}
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>
        Activity
        <span style={{ fontSize: 14, color: "var(--color-text-caption)", fontWeight: 400, marginLeft: 8 }}>
          {filteredCount === UCP_ACTIVITY_TOTAL
            ? `${UCP_ACTIVITY_TOTAL} items`
            : `${filteredCount} of ${UCP_ACTIVITY_TOTAL} items`}
        </span>
      </div>

      {/* Toolbar — DS Chip pills on the left (kind + agent), DS Filters
          on the right (showSort only). Mirrors CallHistoryTab's filter
          bar so the whole voice module uses one toolbar pattern. */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {KIND_OPTIONS.map(o => (
            <Chip
              key={o.id}
              variant={o.id === kind ? "primary" : "secondary"}
              size="s"
              onClick={() => onKind(o.id)}
            >
              {o.label}
            </Chip>
          ))}
          <span style={{
            width: 1, height: 16, background: "var(--color-border-neutral-default)", margin: "0 4px",
          }} aria-hidden/>
          {agentOptions.map(a => (
            <Chip
              key={a}
              variant={a === agent ? "primary" : "secondary"}
              size="s"
              onClick={() => onAgent(a)}
            >
              {a === "all" ? "All agents" : a}
            </Chip>
          ))}
        </div>
        <Filters
          showSearch={false}
          showAllFilters={false}
          showViewToggle={false}
          showSort={true}
          sortLabel={sort === "newest" ? "Newest first" : "Oldest first"}
          onSortClick={() => onSort(sort === "newest" ? "oldest" : "newest")}
        />
      </div>

      {/* Date groups */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No activity for this filter"
          description="Try a different type, agent, or clear the filter to see all interactions."
        />
      ) : filteredGroups.map(g => (
        <section key={g.key} className="flex flex-col gap-2">
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "var(--color-text-caption)",
            padding: "8px 0 4px",
          }}>
            {g.label}
          </div>
          <div className="flex flex-col gap-2">
            {g.items.map(item => (
              <ActivityRow
                key={item.id}
                item={item}
                onOpenCallDetail={onOpenCallDetail}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Older activity CTA — mirrors the source's "Load older activity".
          The button is hidden entirely when there is no older data to fetch
          (a parent that leaves onLoadOlder unwired == no older data). */}
      {onLoadOlder && (
        <div className="flex justify-center" style={{ padding: "16px 0 4px" }}>
          <Button variant="secondary" size="sm" onClick={onLoadOlder}>Load older activity</Button>
        </div>
      )}
    </div>
  )
}

// ─── Single activity row ──────────────────────────────────────────────

const ACCENT_BG: Record<ActivityAccent, string> = {
  primary: "var(--color-surface-primary-subtle)",
  success: "var(--color-surface-success-subtle)",
  alert:   "var(--color-surface-alert-subtle)",
  neutral: "var(--color-surface-neutral-default)",
}
const ACCENT_FG: Record<ActivityAccent, string> = {
  primary: "var(--color-icon-primary-default)",
  success: "var(--color-text-success)",
  alert:   "var(--color-icon-alert-default)",
  neutral: "var(--color-text-caption)",
}

const KIND_ICON: Record<ActivityKind, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  call:  PhoneCall,
  email: Mail,
  sms:   MessageSquare,
  task:  ClipboardCheck,
}

const BADGE_VARIANT: Record<ActivityBadge, TagVariant> = {
  "resolved":  "success",
  "replied":   "success",
  "escalated": "alert",
  "open":      "alert",
  "delivered": "neutral",
  "read":      "neutral",
  "no-answer": "neutral",
}

const SENTIMENT_VARIANT: Record<Sentiment, TagVariant> = {
  positive: "success",
  neutral:  "secondary",
  negative: "error",
}

const SENTIMENT_LABEL: Record<Sentiment, string> = {
  positive: "Positive",
  neutral:  "Neutral",
  negative: "Negative",
}

function ActivityRow({
  item, onOpenCallDetail,
}: {
  item: ActivityItem
  onOpenCallDetail?: (callDetailId: string) => void
}) {
  const Icon = KIND_ICON[item.kind]
  const clickable = item.callDetailId && onOpenCallDetail
  const bodyIndent = 43  // 32px icon + 8px gap + 3px optical alignment — matches source

  const onClick = clickable
    ? () => onOpenCallDetail!(item.callDetailId!)
    : undefined

  return (
    <article
      onClick={onClick}
      style={{
        padding: 14,
        background: "var(--color-surface-neutral-subtle)",
        border: "1px solid var(--color-border-neutral-default)",
        borderRadius: "var(--radius-md)",
        cursor: clickable ? "pointer" : "default",
        transition: "border-color 150ms ease",
      }}
    >
      {/* Header row: icon + title + meta + badge cluster */}
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          style={{
            width: 32, height: 32, borderRadius: "var(--radius-md)",
            background: ACCENT_BG[item.accent],
            color:      ACCENT_FG[item.accent],
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={15} strokeWidth={1.5}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>
            {item.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 2 }}>
            {item.meta}
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <Tag variant={BADGE_VARIANT[item.badge.variant]} size="sm">
            {item.badge.label}
          </Tag>
          {item.sentiment && (
            <Tag variant={SENTIMENT_VARIANT[item.sentiment]} size="sm">
              {SENTIMENT_LABEL[item.sentiment]}
            </Tag>
          )}
        </div>
      </div>

      {/* AI summary + text body (calls / emails) */}
      {item.summary && (
        <>
          <div style={{ paddingLeft: bodyIndent, marginTop: 10, marginBottom: 6 }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px",
                fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-icon-primary-default)",
                background: "var(--color-surface-primary-more-subtle)",
                border: "1px solid var(--color-surface-primary-subtle)",
                borderRadius: "999px",
              }}
            >
              <Sparkles size={10}/>
              AI Summary
            </span>
          </div>
          <div
            style={{
              fontSize: 14, color: "var(--color-text-body)",
              lineHeight: 1.6, paddingLeft: bodyIndent, marginBottom: 8,
            }}
          >
            {item.summary}
          </div>
        </>
      )}

      {/* SMS quote block */}
      {item.smsBody && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 16px",
            background: "var(--color-surface-neutral-default)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-neutral-default)",
            fontSize: 12,
            color: "var(--color-text-body)",
            lineHeight: 1.5,
          }}
        >
          &ldquo;{item.smsBody}&rdquo;
        </div>
      )}

      {/* Bottom meta chips + View details */}
      {item.metaChips && item.metaChips.length > 0 && (
        <div
          className="flex items-center flex-wrap"
          style={{
            paddingLeft: item.summary ? bodyIndent : 0,
            marginTop: item.summary ? 4 : 8,
            gap: 12,
            fontSize: 12,
            color: "var(--color-text-caption)",
          }}
        >
          {item.metaChips.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
          {clickable && (
            <span style={{
              marginLeft: "auto",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-icon-primary-default)",
            }}>
              View details →
            </span>
          )}
        </div>
      )}
    </article>
  )
}

// ─── Stub tabs (honest placeholders) ─────────────────────────────────

const STUB_COPY: Record<Exclude<UcpTab, "activity">, { title: string; description: string }> = {
  "overview": {
    title:       "Overview coming soon",
    description: "The Overview tab will roll up recent activity, vehicles in the garage, upcoming appointments and open tasks.",
  },
  "snapshot": {
    title:       "Snapshot coming soon",
    description: "A rich profile summary — preferences, loyalty status, communication opt-ins and account health signals.",
  },
  "garage": {
    title:       "Garage coming soon",
    description: "Every vehicle on file for this contact — make, model, VIN, service history and warranty status.",
  },
  "appointments": {
    title:       "Appointments coming soon",
    description: "Upcoming, past and cancelled appointments across service, sales and delivery.",
  },
  "repair-orders": {
    title:       "Repair Orders coming soon",
    description: "Every repair order this contact has been part of — labor, parts, billing status and technician notes.",
  },
  "tasks": {
    title:       "Tasks coming soon",
    description: "Open and completed tasks agents have created for this contact — assignments, SLAs and outcomes.",
  },
}

function TabStub({ tab }: { tab: Exclude<UcpTab, "activity"> }) {
  const copy = STUB_COPY[tab]
  return (
    <EmptyState
      icon={Sparkles}
      title={copy.title}
      description={copy.description}
    />
  )
}
