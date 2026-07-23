import { useState } from "react"
import { Sparkles, Bell, Settings } from "lucide-react"
import { AppBackground }    from "@/components/ui/app-background"
import { Topbar }           from "@/components/ui/topbar"
import { Sidebar, DEFAULT_SIDEBAR_ITEMS } from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { SlideOut }         from "@/components/ui/slide-out"
import { EntityList }       from "@/components/ui/entity-list"
import { CardContainer }    from "@/components/ui/card-container"
import { AdaptiveMetricGrid } from "@/components/ui/adaptive-metric-grid"
import { ProcessItem }      from "@/components/ui/process-item"
import { Button }           from "@/components/ui/button"
import type { TopbarAction }       from "@/components/ui/topbar"
import type { EntityListItemData } from "@/components/ui/entity-list"

const TOPBAR_ACTIONS: TopbarAction[] = [
  { icon: <Sparkles size={16} />, label: "AI",            variant: "primary" },
  { icon: <Bell     size={16} />, label: "Notifications"                     },
  { icon: <Settings size={16} />, label: "Settings"                          },
]

type AutomationStatus = "Active" | "Paused" | "Draft"

type Automation = {
  id:       string
  name:     string
  category: string
  status:   AutomationStatus
  lastRun:  string
  score:    string
  atRisk:   number
  runs:     number
  pipeline: string
  owner:    string
}

const AUTOMATIONS: Automation[] = [
  { id: "1", name: "Customer Churn Alert",   category: "Monitoring",  status: "Active", lastRun: "2h ago",  score: "42/100", atRisk: 3, runs: 847, pipeline: "ingest-v3",  owner: "ml-ops-team"    },
  { id: "2", name: "Upsell Opportunity",     category: "Sales",       status: "Active", lastRun: "4h ago",  score: "87/100", atRisk: 0, runs: 312, pipeline: "sales-v1",   owner: "revenue-team"   },
  { id: "3", name: "Support Escalation",     category: "Support",     status: "Paused", lastRun: "1d ago",  score: "61/100", atRisk: 1, runs: 204, pipeline: "support-v2", owner: "cs-team"        },
  { id: "4", name: "Renewal Risk Detection", category: "Monitoring",  status: "Active", lastRun: "6h ago",  score: "53/100", atRisk: 2, runs: 430, pipeline: "renewal-v1", owner: "csm-team"       },
  { id: "5", name: "Onboarding Completion",  category: "Onboarding",  status: "Draft",  lastRun: "—",       score: "—",      atRisk: 0, runs: 0,   pipeline: "—",          owner: "onboarding-team"},
]

const STATUS_VARIANT: Record<AutomationStatus, "success" | "alert" | "neutral"> = {
  Active: "success",
  Paused: "alert",
  Draft:  "neutral",
}

const ICON_VARIANT: Record<AutomationStatus, EntityListItemData["iconVariant"]> = {
  Active: "success",
  Paused: "info",
  Draft:  "neutral",
}

type RecentRun = { account: string; status: "Triggered" | "Monitoring" | "Skipped"; time: string }

const RECENT_RUNS: RecentRun[] = [
  { account: "Acme Corp",   status: "Triggered",  time: "2h ago" },
  { account: "Globex Inc",  status: "Monitoring", time: "4h ago" },
  { account: "Initech",     status: "Triggered",  time: "8h ago" },
]

const RUN_VARIANT: Record<RecentRun["status"], "error" | "success" | "neutral"> = {
  Triggered:  "error",
  Monitoring: "success",
  Skipped:    "neutral",
}

type Props = { onClose: () => void }

export function SlideOutDetailExampleScreen(_props: Props) {
  const [activeSidebar, setActiveSidebar] = useState("automations")
  const [previewId,     setPreviewId]     = useState<string | null>("1")
  const [detailTab,     setDetailTab]     = useState(0)

  const selected = AUTOMATIONS.find(a => a.id === previewId) ?? null

  const items: EntityListItemData[] = AUTOMATIONS.map(a => ({
    id:          a.id,
    title:       a.name,
    iconVariant: ICON_VARIANT[a.status],
    iconName:    "Zap",
    primaryMeta: [
      { iconName: "FolderOpen", label: a.category },
      { iconName: "Clock",      label: a.lastRun  },
    ],
    state:   { label: a.status, variant: STATUS_VARIANT[a.status] },
    actions: [
      { label: "Eye", variant: "tertiary", icon: "Eye", onClick: () => { setPreviewId(a.id); setDetailTab(0) } },
    ],
  }))

  const recentRunItems: EntityListItemData[] = RECENT_RUNS.map(r => ({
    id:          r.account,
    title:       r.account,
    iconName:    "Building2",
    iconVariant: r.status === "Triggered" ? "error" : r.status === "Monitoring" ? "success" : "neutral",
    state:       { label: r.status, variant: RUN_VARIANT[r.status] },
    timestamp:   r.time,
  }))

  const detailRows: [string, string][] = selected ? [
    ["Type",      "Automation"      ],
    ["Category",  selected.category ],
    ["Pipeline",  selected.pipeline ],
    ["Owner",     selected.owner    ],
    ["Status",    selected.status   ],
    ["Last run",  selected.lastRun  ],
  ] : []

  return (
    <div className="flex flex-col h-full">
      <AppBackground />

      <Topbar workspaceName="AI Workers" companyName="AIMS OS" actions={TOPBAR_ACTIONS} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={DEFAULT_SIDEBAR_ITEMS} activeId={activeSidebar} onItemClick={setActiveSidebar} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Automations"
            description="Monitoring and response automations for your customer accounts"
            size="size-l"
            primaryAction={<Button variant="main" size="sm">New Automation</Button>}
          />

          <div className="flex-1 overflow-y-auto px-[32px] py-[24px]">
            <CardContainer className="!p-0 overflow-hidden">
              <EntityList items={items} />
            </CardContainer>
          </div>
        </main>
      </div>

      <SlideOut
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        type="with-variants"
        title={selected?.name ?? ""}
        subtitle={selected ? `Automation · ${selected.category}` : ""}
        statusLabel={selected?.status}
        showIcon
        showStatus
        showTabs
        tabLabels={["Overview", "History", "Config"]}
        activeTab={detailTab}
        onTabChange={setDetailTab}
        showSearchBar={false}
        showChips={false}
        showCta={false}
      >
        {selected && (
          <div className="flex flex-col gap-[20px] pb-[12px]">

            {/* Section: AI Summary */}
            <div className="flex flex-col gap-[8px]">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>AI Summary</span>
              <div className="p-[14px] rounded-[8px] flex flex-col gap-[8px]"
                style={{ background: "var(--color-surface-purple-more-subtle)", border: "0.5px solid var(--card-purple-border)" }}>
                <div className="flex items-center gap-[6px]">
                  <Sparkles size={12} style={{ color: "var(--color-text-purple)" }} />
                  <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-purple)" }}>AI Summary</span>
                </div>
                <p className="text-[12px] leading-[1.5]" style={{ color: "var(--foreground)" }}>
                  {selected.atRisk > 0
                    ? `Health score ${selected.score} over the last 14 days. ${selected.atRisk} account${selected.atRisk > 1 ? "s" : ""} flagged at risk — intervention playbook triggered automatically.`
                    : `Health score ${selected.score}. No accounts currently at risk. Automation running normally across ${selected.runs} total runs.`
                  }
                </p>
              </div>
            </div>

            {/* Section: Key Metrics */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex flex-col gap-[2px]">
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>Key Metrics</span>
                <span className="text-[11px]" style={{ color: "var(--field-supporting)" }}>Last 14 days</span>
              </div>
              <AdaptiveMetricGrid cards={[
                { label: "Health score", value: selected.score,           iconName: "Activity"       },
                { label: "At risk",      value: String(selected.atRisk),  iconName: "AlertTriangle"  },
                { label: "Total runs",   value: String(selected.runs),    iconName: "Play"           },
              ]} />
            </div>

            {/* Section: Recent runs */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>Recent runs</span>
                <Button variant="tertiary" size="sm">View all</Button>
              </div>
              <EntityList items={recentRunItems} />
            </div>

            {/* Section: Last execution steps */}
            <div className="flex flex-col gap-[0px]">
              <span className="text-[11px] font-semibold uppercase tracking-wide mb-[8px]" style={{ color: "var(--field-label)" }}>Last execution</span>
              <ProcessItem title="Data enrichment"   status="done"    description="Clearbit — 4 fields added"          timestamp="5 min ago" showLine />
              <ProcessItem title="Risk scoring"       status="done"    description={`Score: ${selected.score}`}         timestamp="4 min ago" showLine />
              <ProcessItem
                title="Alert dispatched"
                status={selected.atRisk > 0 ? "done" : "pending"}
                description={selected.atRisk > 0 ? `Sent to CSM team · ${selected.atRisk} accounts` : "No alert — threshold not met"}
                showLine={false}
              />
            </div>

            {/* Section: Technical details (Detail Table) */}
            <div className="flex flex-col gap-[8px]">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>Technical details</span>
              <div className="flex flex-col rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--field-border)" }}>
                {detailRows.map(([label, value], i) => (
                  <div key={label}>
                    <div className="flex items-center gap-[19px] py-[8px] px-[12px]">
                      <span className="w-[120px] shrink-0 text-[12px] font-medium leading-[20px]" style={{ color: "var(--foreground)" }}>{label}</span>
                      <span className="flex-1 text-[12px] font-medium leading-[20px]" style={{ color: "var(--field-supporting)" }}>{value}</span>
                    </div>
                    {i < detailRows.length - 1 && <div className="w-full h-[1px]" style={{ background: "var(--color-border-neutral-lighter)" }} />}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </SlideOut>
    </div>
  )
}
