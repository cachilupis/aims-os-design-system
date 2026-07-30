import { useState, useRef, useEffect } from "react"
import * as Icons            from "lucide-react"
import { ScreenLayout }      from "@/components/layouts/screen-layout"
import { WidgetCanvasView }  from "@/components/layouts/widget-canvas-view"
import type { CanvasSlot }   from "@/components/layouts/widget-canvas-view"
import type { SidebarItem }  from "@/components/ui/sidebar"
import { CardContainer }     from "@/components/ui/card-container"
import { Button }            from "@/components/ui/button"
import { Tag }               from "@/components/ui/tag"
import { Chip }              from "@/components/ui/chip"
import { Tooltip }           from "@/components/ui/tooltip"
import { SlideOut }          from "@/components/ui/slide-out"
import { InformativeCard }  from "@/components/ui/informative-card"

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SIDEBAR: SidebarItem[] = [
  { id: "home",       label: "Home",       icon: "Home"        },
  { id: "work",       label: "My Work",    icon: "Inbox"       },
  { id: "agents",     label: "Agents",     icon: "Bot"         },
  { id: "workflows",  label: "Workflows",  icon: "Zap"         },
  { id: "data",       label: "Data",       icon: "Database"    },
  { id: "governance", label: "Governance", icon: "Shield"      },
  { id: "reports",    label: "Reports",    icon: "BarChart2"   },
  { id: "settings",   label: "Settings",   icon: "Settings"    },
]

// ── Shared micro-styles ───────────────────────────────────────────────────────

const DOT_TIPS = ["Act Now · blocking", "Critical · within 7 days", "Action · this week", "Heads-up"]

// ── Home Banner ───────────────────────────────────────────────────────────────

const BANNER_ITEMS = [
  {
    urgency: "act-now" as const, tagVariant: "error" as const, dot: "var(--color-surface-error-default)",
    label: "Act Now",
    title: "Financial Policy PDF requires approval",
    subtitle: "Blocking 14 workflows · 3 agents · 12m ago",
    primary: "Approve", secondary: "Escalate",
  },
  {
    urgency: "critical" as const, tagVariant: "alert" as const, dot: "var(--color-surface-alert-default)",
    label: "Critical",
    title: "SalesForecastPA about to send external email",
    subtitle: "Paused · awaiting review · 5m ago",
    primary: "Review", secondary: "Defer",
  },
  {
    urgency: "action" as const, tagVariant: "informative" as const, dot: "var(--primary)",
    label: "Action",
    title: "Q3 Pipeline Forecast ready for advance",
    subtitle: "Monthly Forecast Roll-up · 1h ago",
    primary: "Advance", secondary: "View",
  },
]

function HomeBanner() {
  const [idx, setIdx] = useState(0)
  const cur = BANNER_ITEMS[idx]

  return (
    <CardContainer
      variant="primary" size="lg"
      className="!border !border-[var(--card-primary-hover-bd)] [box-shadow:var(--card-primary-hover-shadow)] relative mb-[24px]"
    >
      {/* Ask PA */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <Button variant="secondary" size="sm">✦ Ask your PA</Button>
      </div>

      {/* Greeting */}
      <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 400, color: "var(--foreground)", paddingRight: 168 }}>
        Good afternoon, <strong style={{ fontWeight: 700 }}>Thomas.</strong>
      </p>
      <div className="flex items-center gap-[6px] mb-[18px]">
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: "var(--field-supporting)" }}>
          5 resolved today ·{" "}
          <strong style={{ fontWeight: 600, color: "var(--foreground)" }}>7 remaining</strong>
        </span>
      </div>

      {/* Featured action card */}
      <CardContainer
        variant="purple" size="sm"
        className="!border !border-[var(--card-purple-hover-bd)] [box-shadow:var(--card-purple-hover-shadow)] mb-[16px] relative"
      >
        {/* Carousel controls */}
        <div className="flex items-center gap-[4px]" style={{ position: "absolute", top: 12, right: 12 }}>
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "var(--field-supporting)", display: "flex" }}
          >
            <Icons.ChevronLeft size={13} />
          </button>
          {BANNER_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 16 : 6, height: 6, borderRadius: 3,
                background: i === idx ? "var(--primary)" : "var(--field-border)",
                border: "none", padding: 0, cursor: "pointer", transition: "width 200ms",
              }}
            />
          ))}
          <button
            onClick={() => setIdx(i => Math.min(BANNER_ITEMS.length - 1, i + 1))}
            style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "var(--field-supporting)", display: "flex" }}
          >
            <Icons.ChevronRight size={13} />
          </button>
        </div>

        <div className="flex items-center gap-[5px] mb-[6px]">
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: cur.dot, display: "inline-block", flexShrink: 0 }} />
          <Tag variant={cur.tagVariant} size="sm">{cur.label}</Tag>
        </div>
        <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "var(--foreground)", paddingRight: 108 }}>{cur.title}</p>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--field-supporting)" }}>{cur.subtitle}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <Button variant="primary" size="sm">{cur.primary}</Button>
            <Button variant="secondary" size="sm">{cur.secondary}</Button>
          </div>
          <Button variant="tertiary" size="sm">
            See all <Icons.ChevronRight size={11} />
          </Button>
        </div>
      </CardContainer>

      {/* Quick links */}
      <div className="flex items-center gap-[6px] flex-wrap">
        {([
          { icon: <Icons.Zap size={12} />,       label: "Trigger workflow" },
          { icon: <Icons.BarChart2 size={12} />,  label: "View reports"    },
          { icon: <Icons.ListChecks size={12} />, label: "Review HTL"      },
          { icon: <Icons.Bot size={12} />,        label: "Agents"          },
          { icon: <Icons.BookOpen size={12} />,   label: "Knowledge base"  },
        ] as const).map((link, i) => (
          <Button key={i} variant="secondary" size="sm">
            <span style={{ display: "flex", marginRight: 4 }}>{link.icon}</span>
            {link.label}
          </Button>
        ))}
      </div>
    </CardContainer>
  )
}

// ── My Work ───────────────────────────────────────────────────────────────────

const MY_WORK_GROUPS = [
  {
    id: "act-now",
    label: "ACT NOW", sublabel: "blocking",
    headerBg: "var(--color-surface-error-subtle)",
    dot: "var(--color-surface-error-default)",
    text: "var(--color-surface-error-default)",
    countBg: "var(--color-surface-error-default)",
    count: 2,
    items: [
      { studio: "GOV",  type: "Approval", crit: true,  title: "Financial Policy PDF — DIAN approval required",       status: "Blocking · 14 workflows", time: "~10m" },
      { studio: "AGNT", type: "Review",   crit: false, title: "SalesForecastPA about to send external email",         status: "Paused · awaiting review", time: "~5m"  },
    ],
  },
  {
    id: "critical",
    label: "Critical", sublabel: "within 7 days",
    headerBg: "var(--color-surface-alert-subtle)",
    dot: "var(--color-surface-alert-default)",
    text: "var(--color-surface-alert-default)",
    countBg: "var(--color-surface-alert-default)",
    count: 1,
    items: [
      { studio: "DATA", type: "Remap", crit: false, title: "Q3 Forecast Schema needs field remap", status: "Action needed · schema mismatch", time: "~15m" },
    ],
  },
  {
    id: "action",
    label: "Action", sublabel: "this week",
    headerBg: "var(--color-surface-primary-subtle)",
    dot: "var(--primary)",
    text: "var(--primary)",
    countBg: "var(--primary)",
    count: 3,
    items: [
      { studio: "TASK", type: "Respond",   crit: false, title: "Renewal contract draft v2 awaiting your sign-off",     status: "Ready for review", time: "~8m"  },
      { studio: "GOV",  type: "Acknowledge",crit: false, title: "DIAN intake package #48 compliance check",             status: "Pending acknowledgement", time: "~5m" },
      { studio: "AGNT", type: "Train",     crit: false, title: "Market Intel PA — feedback on last 3 outputs needed",   status: "Feedback requested", time: "~20m" },
    ],
  },
]

function MyWorkContent() {
  const [studioFilter, setStudioFilter] = useState<string | null>(null)
  const [hoveredKey, setHoveredKey]     = useState<string | null>(null)

  return (
    <div className="flex flex-col" style={{ gap: 10, overflowY: "auto", maxHeight: 380 }}>
      {/* Studio filters */}
      <div className="flex items-center gap-[4px] flex-wrap">
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)", marginRight: 2 }}>
          Studio
        </span>
        {["GOV", "AGNT", "DATA", "TASK"].map(s => (
          <Chip
            key={s}
            variant={studioFilter === s ? "primary" : "secondary"}
            size="s"
            onClick={() => setStudioFilter(prev => prev === s ? null : s)}
          >
            {s}
          </Chip>
        ))}
      </div>

      {/* Groups */}
      {MY_WORK_GROUPS.map(group => {
        const visible = group.items.filter(it => !studioFilter || it.studio === studioFilter)
        if (visible.length === 0) return null
        return (
          <div key={group.id}>
            {/* Group header */}
            <div
              className="flex items-center justify-between"
              style={{ background: group.headerBg, borderRadius: 4, padding: "4px 8px", marginBottom: 4 }}
            >
              <div className="flex items-center gap-[5px]">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: group.dot, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: group.text }}>{group.label}</span>
                <span style={{ fontSize: 10, color: "var(--field-supporting)" }}>· {group.sublabel}</span>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: group.countBg, color: "var(--tag-primary-fg)", padding: "0 4px",
              }}>
                {visible.length}
              </span>
            </div>

            {/* Items */}
            {visible.map((item, idx) => {
              const key = `${group.id}-${idx}`
              const hovered = hoveredKey === key
              return (
                <div
                  key={key}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    padding: "7px 8px", borderRadius: 6, marginBottom: 2, cursor: "pointer",
                    background: hovered ? "var(--color-surface-neutral-default)" : "none",
                    transition: "background 120ms",
                  }}
                >
                  <div className="flex items-center gap-[4px] flex-wrap mb-[2px]">
                    <Tag variant="neutral" size="sm">{item.studio}</Tag>
                    <Tag variant="neutral" size="sm">{item.type}</Tag>
                    {item.crit && <Tag variant="error" size="sm">⚡ Critical</Tag>}
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--field-supporting)", whiteSpace: "nowrap" }}>{item.time}</span>
                  </div>
                  <p style={{ margin: "2px 0", fontSize: 12, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.35 }}>{item.title}</p>
                  <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{item.status}</span>
                  {hovered && (
                    <div className="flex items-center gap-[6px]" style={{ marginTop: 8 }}>
                      <Button variant="primary"   size="sm">Take</Button>
                      <Button variant="secondary" size="sm">Escalate</Button>
                      <Button variant="tertiary"  size="sm">Defer</Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      <button
        style={{ background: "none", border: "none", padding: "2px 0 0", cursor: "pointer", fontSize: 11, color: "var(--primary)", textAlign: "left" }}
      >
        See all in Attention Room →
      </button>
    </div>
  )
}

// ── My Team ───────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  {
    initials: "AR", name: "Ana Restrepo",  role: "Revenue Ops",  ooo: null,
    dots: [{ count: 2 }, { count: 3 }, { count: 5 }, { count: 1 }],
  },
  {
    initials: "CM", name: "Carlos Mejía",  role: "Governance",   ooo: null,
    dots: [{ count: 1 }, { count: 3 }, { count: 4 }, { count: 0 }],
  },
  {
    initials: "DT", name: "Diana Torres",  role: "Agent Ops",    ooo: "Aug 1",
    dots: [{ count: 1 }, { count: 2 }, { count: 1 }, { count: 2 }],
  },
  {
    initials: "FK", name: "Felipe Kim",    role: "Data Studio",  ooo: null,
    dots: [{ count: 0 }, { count: 1 }, { count: 3 }, { count: 0 }],
  },
]

const DOT_COLORS = [
  "var(--color-surface-error-default)",
  "var(--color-surface-alert-default)",
  "var(--primary)",
  "var(--color-icon-neutral-default)",
]

function MyTeamContent() {
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [hoveredMember, setHoveredMember]     = useState<number | null>(null)
  const teamContainerRef = useRef<HTMLDivElement>(null)
  const [isNarrowTeam, setIsNarrowTeam] = useState(false)

  useEffect(() => {
    const el = teamContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setIsNarrowTeam(entry.contentRect.width < 340)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const trunc = (s: string, n: number) => s.length > n ? s.slice(0, n) + "…" : s
  const fullAlert  = "5 blocking events across your team require immediate attention."
  const alertTitle = "5 blocking events need attention"

  return (
    <div ref={teamContainerRef} className="flex flex-col" style={{ gap: 0 }}>
      {!bannerDismissed && (
        <div style={{ marginBottom: 8 }}>
          {isNarrowTeam ? (
            <Tooltip content={fullAlert} side="top">
              <div>
                <InformativeCard state="error" size="sm"
                  title={trunc(alertTitle, 22)}
                  cta={{ label: "Dismiss", onClick: () => setBannerDismissed(true) }}
                />
              </div>
            </Tooltip>
          ) : (
            <InformativeCard state="error" size="sm"
              title={alertTitle}
              cta={{ label: "Dismiss", onClick: () => setBannerDismissed(true) }}
            />
          )}
        </div>
      )}

      <div style={{ overflowY: "auto", maxHeight: 320 }}>
        {TEAM_MEMBERS.map((member, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredMember(i)}
            onMouseLeave={() => setHoveredMember(null)}
            style={{ padding: "8px 4px", borderBottom: i < TEAM_MEMBERS.length - 1 ? "0.5px solid var(--field-border)" : "none" }}
          >
            <div className="flex items-start gap-[8px]">
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--color-surface-primary-default)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "var(--tag-primary-fg)" }}>{member.initials}</span>
              </div>

              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 1 }}>
                <div className="flex items-center gap-[6px] w-full">
                  <Tooltip content={member.name} side="top">
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                      {member.name}
                    </span>
                  </Tooltip>
                  {member.ooo && (
                    <span style={{ flexShrink: 0 }}>
                      <Tag variant="alert" size="sm">{`OOO · returns ${member.ooo}`}</Tag>
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: "var(--field-supporting)" }}>{member.role}</span>

                <div className="flex items-center gap-[8px]" style={{ marginTop: 4 }}>
                  {member.dots.map((dot, j) => {
                    if (dot.count === 0) return null
                    return (
                      <Tooltip key={j} content={DOT_TIPS[j] ?? "Status"} side="top">
                        <div className="flex items-center gap-[4px]" style={{ cursor: "default" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: DOT_COLORS[j], display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)" }}>{dot.count}</span>
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            </div>

            {hoveredMember === i && (
              <div className="flex items-center gap-[4px]" style={{ marginTop: 6, marginLeft: 36 }}>
                <Button variant="secondary" size="sm">Take</Button>
                <Button variant="secondary" size="sm">Nudge</Button>
                <Button variant="secondary" size="sm">Reassign</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Workflows ─────────────────────────────────────────────────────────────────

type WorkflowStatus = "running" | "done" | "failed" | "paused"

const WORKFLOWS = [
  { name: "Lead Enrichment — Inbound",    status: "running" as WorkflowStatus, trigger: "New form submission",          timeAgo: "4 min ago",   runsToday: 24, progress: 68 },
  { name: "Nightly ETL — Salesforce",     status: "done"    as WorkflowStatus, trigger: "Scheduled · 02:00",            timeAgo: "6 hours ago", runsToday: 1                },
  { name: "Churn Risk Scoring",           status: "failed"  as WorkflowStatus, trigger: "NPS field missing",            timeAgo: "1 hour ago",  runsToday: 0                },
  { name: "CS Escalation Router",         status: "paused"  as WorkflowStatus, trigger: "HTL queue threshold reached",  timeAgo: "2 days ago",  runsToday: 0                },
  { name: "Deal Stage Notifications",     status: "running" as WorkflowStatus, trigger: "CRM stage change",             timeAgo: "Just now",    runsToday: 17, progress: 90 },
]

const WF_TAG: Record<WorkflowStatus, "success" | "error" | "neutral" | "informative"> = {
  running: "success", done: "informative", failed: "error", paused: "neutral",
}
const WF_LABEL: Record<WorkflowStatus, string> = {
  running: "Running", done: "Done", failed: "Failed", paused: "Paused",
}

function WorkflowsContent() {
  return (
    <div className="flex flex-col" style={{ gap: 0 }}>
      {WORKFLOWS.map((wf, i) => (
        <div
          key={i}
          style={{ padding: "8px 4px", borderBottom: i < WORKFLOWS.length - 1 ? "0.5px solid var(--field-border)" : "none" }}
        >
          <div className="flex items-start gap-[8px]">
            <div className="flex flex-col flex-1 min-w-0" style={{ gap: 3 }}>
              <div className="flex items-center gap-[6px]">
                {wf.status === "running" && (
                  <span
                    className="animate-pulse"
                    style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: "var(--color-surface-success-default)", display: "inline-block" }}
                  />
                )}
                <Tag variant={WF_TAG[wf.status]} size="sm">{WF_LABEL[wf.status]}</Tag>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {wf.name}
                </span>
              </div>
              <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{wf.trigger}</span>
              {"progress" in wf && wf.progress !== undefined && (
                <div style={{ height: 4, background: "var(--color-surface-neutral-default)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${wf.progress}%`, background: "var(--primary)", borderRadius: 2, transition: "width 500ms ease" }} />
                </div>
              )}
              <span style={{ fontSize: 10, color: "var(--field-supporting)" }}>
                {wf.timeAgo}{wf.runsToday > 0 ? ` · ${wf.runsToday} runs today` : ""}
              </span>
            </div>
            {wf.status === "failed" && (
              <div className="flex items-center gap-[4px]" style={{ flexShrink: 0 }}>
                <Button variant="secondary" size="sm">Retry</Button>
                <Button variant="tertiary"  size="sm">Logs</Button>
              </div>
            )}
            {wf.status === "paused" && <Button variant="secondary" size="sm" style={{ flexShrink: 0 }}>Resume</Button>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Pending Outputs ───────────────────────────────────────────────────────────

const PENDING_OUTPUTS = [
  { name: "Q3 Pipeline Forecast — July Revision",  source: "Monthly Forecast Roll-up", timeAgo: "12m ago",   tagVariant: "success"     as const, statusLabel: "Ready for review"     },
  { name: "Acme Corp Renewal Contract Draft v2",   source: "Renewals Outreach",        timeAgo: "1h ago",    tagVariant: "alert"       as const, statusLabel: "Adjusted — pending"   },
  { name: "DIAN Intake Package #48",               source: "DIAN Compliance Intake",   timeAgo: "2h ago",    tagVariant: "error"       as const, statusLabel: "Requires approval"   },
  { name: "Support Queue Summary — Jul 22",        source: "Support Summary PA",       timeAgo: "Yesterday", tagVariant: "informative" as const, statusLabel: "Advanced"            },
]

function PendingOutputsContent() {
  const [selected, setSelected] = useState<typeof PENDING_OUTPUTS[0] | null>(null)

  return (
    <>
      <div className="flex flex-col" style={{ gap: 0 }}>
        {PENDING_OUTPUTS.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelected(item)}
            style={{
              padding: "8px 4px",
              borderBottom: i < PENDING_OUTPUTS.length - 1 ? "0.5px solid var(--field-border)" : "none",
              cursor: "pointer",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-neutral-default)"; (e.currentTarget as HTMLElement).style.borderRadius = "6px" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.borderRadius = "0" }}
          >
            <div className="flex items-start gap-[8px]">
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.name}
                </span>
                <span style={{ fontSize: 11, color: "var(--field-supporting)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.source} · {item.timeAgo}
                </span>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Tag variant={item.tagVariant} size="sm">{item.statusLabel}</Tag>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <SlideOut
          open
          onClose={() => setSelected(null)}
          title={selected.name}
          subtitle={selected.source}
          showTabs={false}
          showChips={false}
          showSearchBar={false}
          showCta
          ctaPrimaryLabel="Advance"
          ctaSecondaryLabel="Close"
          onCtaSecondary={() => setSelected(null)}
        >
          <div className="flex flex-col" style={{ gap: 16, padding: "4px 0" }}>
            <Tag variant={selected.tagVariant} size="sm">{selected.statusLabel}</Tag>
            <p style={{ margin: 0, fontSize: 13, color: "var(--foreground)", lineHeight: 1.5 }}>
              This output was generated by your PA and is ready for your review. Verify the authority data below before advancing it to the next stage.
            </p>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)", display: "block", marginBottom: 8 }}>
                Authority Data
              </span>
              {[
                { label: "Source",    value: selected.source             },
                { label: "Generated", value: selected.timeAgo            },
                { label: "Status",    value: selected.statusLabel        },
                { label: "Verified",  value: "AIMS Knowledge Graph · v2" },
              ].map((row, j) => (
                <div
                  key={j}
                  style={{
                    padding: "8px 10px", borderRadius: 6, marginBottom: 6,
                    background: "var(--color-surface-neutral-default)",
                    border: "0.5px solid var(--field-border)",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--field-supporting)", marginBottom: 2 }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--foreground)" }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </SlideOut>
      )}
    </>
  )
}

// ── Agent Catalog ─────────────────────────────────────────────────────────────

const AGENTS = [
  { name: "Revenue Insight PA",       desc: "Pipeline health, quota attainment, deal forecasting.",    available: true,  isWorkflow: false, prompts: ["Summarize Q3 pipeline", "Show quota gaps", "Flag at-risk deals"]                                 },
  { name: "People Ops PA",            desc: "HR policies, compliance, people communications.",          available: true,  isWorkflow: false, prompts: ["Summarize open headcount", "Draft PIP letter", "Check compliance status"]                        },
  { name: "Support Summary PA",       desc: "Ticket queue summary, escalation risk, triage notes.",     available: true,  isWorkflow: false, prompts: ["Show open P1 tickets", "Summarize yesterday's queue", "Flag escalation risk"]                    },
  { name: "Lead Enrichment Workflow", desc: "Enriches inbound leads before routing to CRM.",            available: true,  isWorkflow: true,  prompts: ["Enrich new form submission", "Preview enrichment for Acme Corp", "Show enrichment error log"]    },
  { name: "Market Intel PA",          desc: "Competitive intelligence from public sources.",             available: false, isWorkflow: false, prompts: ["Benchmark vs competitor", "Summarize recent coverage", "Flag new product launches"]              },
  { name: "Churn Risk Workflow",      desc: "Scores accounts for churn risk on a daily schedule.",       available: true,  isWorkflow: true,  prompts: ["Run churn score now", "Show accounts at risk", "Export risk report"]                            },
]

const AGENT_FILTERS = [
  { label: "All",      fn: () => true                        },
  { label: "Single",   fn: (a: typeof AGENTS[0]) => !a.isWorkflow  },
  { label: "Workflow", fn: (a: typeof AGENTS[0]) => a.isWorkflow   },
]

function AgentCatalogContent() {
  const [typeIdx,       setTypeIdx]       = useState(0)
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null)

  const visible = AGENTS.filter(AGENT_FILTERS[typeIdx].fn)

  return (
    <>
      <div className="flex flex-col" style={{ gap: 0 }}>
        {/* Type filter */}
        <div className="flex items-center gap-[4px] flex-wrap mb-[10px]">
          {AGENT_FILTERS.map((f, i) => (
            <Chip
              key={f.label}
              variant={typeIdx === i ? "primary" : "secondary"}
              size="s"
              onClick={() => setTypeIdx(i)}
            >
              {f.label} · {AGENTS.filter(f.fn).length}
            </Chip>
          ))}
        </div>

        {/* Agent cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, overflowY: "auto", maxHeight: 260 }}>
          {visible.map((agent, i) => (
            <button
              key={i}
              onClick={() => setSelectedAgent(agent)}
              style={{
                display: "flex", flexDirection: "column", gap: 6,
                padding: "10px 12px", borderRadius: 8, textAlign: "left",
                border: "0.5px solid var(--field-border)", background: "var(--surface)",
                cursor: "pointer", opacity: agent.available ? 1 : 0.6,
                transition: "border-color 120ms, box-shadow 120ms",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--field-border-hover)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--field-border)" }}
            >
              <div className="flex items-start justify-between gap-[6px]">
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3 }}>{agent.name}</span>
                {agent.isWorkflow && <span style={{ flexShrink: 0 }}><Tag variant="informative" size="sm">Workflow</Tag></span>}
              </div>
              <span style={{ fontSize: 11, color: "var(--field-supporting)", lineHeight: 1.4 }}>{agent.desc}</span>
              <div style={{ display: "flex" }}>
                <Tag variant={agent.available ? "success" : "neutral"} size="sm">
                  {agent.available ? "Grounded" : "Unavailable"}
                </Tag>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedAgent && (
        <SlideOut
          open
          onClose={() => setSelectedAgent(null)}
          title={selectedAgent.name}
          subtitle={selectedAgent.isWorkflow ? "Workflow Agent" : "Single Agent"}
          showTabs={false}
          showChips={false}
          showSearchBar={false}
          showCta={selectedAgent.available}
          ctaPrimaryLabel="Run"
          ctaSecondaryLabel="Close"
          onCtaSecondary={() => setSelectedAgent(null)}
        >
          <div className="flex flex-col" style={{ gap: 16, padding: "4px 0" }}>
            <div className="flex items-center gap-[6px]">
              <Tag variant={selectedAgent.available ? "success" : "neutral"} size="sm">
                {selectedAgent.available ? "Grounded" : "Unavailable"}
              </Tag>
              {selectedAgent.isWorkflow && <Tag variant="informative" size="sm">Workflow</Tag>}
            </div>

            <p style={{ margin: 0, fontSize: 13, color: "var(--foreground)", lineHeight: 1.6 }}>
              {selectedAgent.desc}
            </p>

            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)", display: "block", marginBottom: 8 }}>
                Example Prompts
              </span>
              {selectedAgent.prompts.map((prompt, j) => (
                <div
                  key={j}
                  style={{
                    padding: "8px 10px", borderRadius: 6, marginBottom: 6,
                    background: "var(--color-surface-neutral-default)",
                    border: "0.5px solid var(--field-border)",
                    fontSize: 12, color: "var(--foreground)", cursor: "pointer",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--field-border)" }}
                >
                  "{prompt}"
                </div>
              ))}
            </div>
          </div>
        </SlideOut>
      )}
    </>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PMHomeCanvasScreen() {
  const slots: CanvasSlot[] = [
    { uid: "my-work",       title: "My Work",        colSpan: 2, content: <MyWorkContent /> },
    { uid: "my-team",       title: "My Team",        colSpan: 1, content: <MyTeamContent /> },
    { uid: "workflows",     title: "Workflows",      colSpan: 2, content: <WorkflowsContent /> },
    { uid: "pending",       title: "Pending Outputs",colSpan: 1, content: <PendingOutputsContent /> },
    { uid: "agent-catalog", title: "Agent Catalog",  colSpan: 3, content: <AgentCatalogContent /> },
  ]

  return (
    <ScreenLayout
      workspaceName="Contoso Ltd"
      userName="Thomas G."
      userEmail="thomas@contoso.com"
      sidebarItems={SIDEBAR}
      activeSidebarId="home"
      header={() => null}
    >
      <HomeBanner />
      <WidgetCanvasView initialSlots={slots} />
    </ScreenLayout>
  )
}
