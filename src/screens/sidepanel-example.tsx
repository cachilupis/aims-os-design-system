import { useState } from "react"
import { Sparkles, Bell, Settings, Activity, GitBranch, Zap, Send, CheckCircle2 } from "lucide-react"
import { AppBackground }    from "@/components/ui/app-background"
import { Topbar }           from "@/components/ui/topbar"
import { Sidebar, DEFAULT_SIDEBAR_ITEMS } from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { SidePanel }        from "@/components/ui/side-panel"
import { Button }           from "@/components/ui/button"
import { Input }            from "@/components/ui/input"
import { Select }           from "@/components/ui/select"
import { Tag }              from "@/components/ui/tag"
import { ProcessItem }      from "@/components/ui/process-item"
import type { TopbarAction } from "@/components/ui/topbar"

const TOPBAR_ACTIONS: TopbarAction[] = [
  { icon: <Sparkles size={16} />, label: "AI",            variant: "primary" },
  { icon: <Bell     size={16} />, label: "Notifications"                     },
  { icon: <Settings size={16} />, label: "Settings"                          },
]

type NodeStatus = "active" | "warning" | "idle"

type WorkflowNode = {
  id:          string
  label:       string
  sublabel:    string
  status:      NodeStatus
  icon:        React.ReactNode
  description: string
}

const NODES: WorkflowNode[] = [
  { id: "trigger",   label: "Health Score Drop", sublabel: "Trigger",   status: "active",  icon: <Zap       size={14} />, description: "Fires when health score drops below threshold" },
  { id: "threshold", label: "Score Threshold",   sublabel: "Condition", status: "warning", icon: <Activity  size={14} />, description: "Filter accounts by score value"                },
  { id: "branch",    label: "Risk Severity",     sublabel: "Branch",    status: "idle",    icon: <GitBranch size={14} />, description: "Route by severity level (low / medium / high)" },
  { id: "send",      label: "Send Alert",         sublabel: "Action",    status: "idle",    icon: <Send      size={14} />, description: "Dispatch notification to CSM team"              },
]

const NODE_COLORS: Record<NodeStatus, { bg: string; border: string; icon: string }> = {
  active:  { bg: "var(--color-surface-primary-subtle)",  border: "var(--primary)",                   icon: "var(--primary)"                   },
  warning: { bg: "var(--color-surface-alert-subtle)",    border: "var(--color-border-alert-default)", icon: "var(--color-border-alert-default)" },
  idle:    { bg: "var(--surface)",                       border: "var(--field-border)",               icon: "var(--field-supporting)"           },
}

type NodeConfig = {
  field:    string
  operator: string
  value:    string
  range:    string
  freq:     string
  next:     string
  channel:  string
}

const DEFAULT_CONFIG: NodeConfig = {
  field:    "Customer health score",
  operator: "Is less than",
  value:    "60",
  range:    "Last 30 days",
  freq:     "Once per account",
  next:     "→ Risk Severity",
  channel:  "Slack #cs-alerts",
}

type Props = { onClose: () => void }

export function SidePanelExampleScreen(_props: Props) {
  const [activeSidebar, setActiveSidebar] = useState("automations")
  const [panelOpen,     setPanelOpen]     = useState(true)
  const [selectedId,    setSelectedId]    = useState("threshold")
  const [config,        setConfig]        = useState<NodeConfig>(DEFAULT_CONFIG)

  const selectedNode = NODES.find(n => n.id === selectedId)
  const hasChanges   = config.value !== DEFAULT_CONFIG.value || config.channel !== DEFAULT_CONFIG.channel

  return (
    <div className="flex flex-col h-full">
      <AppBackground />

      <Topbar workspaceName="AI Workers" companyName="AIMS OS" actions={TOPBAR_ACTIONS} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={DEFAULT_SIDEBAR_ITEMS} activeId={activeSidebar} onItemClick={setActiveSidebar} />

        <main className="flex flex-1 flex-col overflow-hidden">
          <Header
            title="Customer Churn Alert"
            tag={<Tag variant="success" size="sm">Active</Tag>}
            description="Workflow builder — click a node to configure it"
            backButton
            size="size-l"
            primaryAction={<Button variant="main" size="sm">Save workflow</Button>}
            secondaryAction={<Button variant="secondary" size="sm">Discard</Button>}
          />

          <div className="flex flex-1 overflow-hidden">

            {/* Workflow canvas */}
            <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "var(--canvas)" }}>

              {/* Dot grid */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle, var(--field-border) 1px, transparent 1px)",
                backgroundSize:  "28px 28px",
                opacity:         0.5,
              }} />

              <span className="absolute top-[16px] left-[20px] text-[10px] font-semibold uppercase tracking-wide pointer-events-none select-none" style={{ color: "var(--field-supporting)" }}>
                Workflow canvas
              </span>

              {/* Node chain */}
              <div className="flex-1 flex items-center justify-center relative z-[1]">
                <div className="flex items-center">
                  {NODES.map((node, i) => {
                    const colors     = NODE_COLORS[node.status]
                    const isSelected = node.id === selectedId
                    return (
                      <div key={node.id} className="flex items-center">
                        {i > 0 && (
                          <div className="flex items-center justify-center w-[36px]">
                            <div className="h-[1.5px] w-full" style={{ background: "var(--field-border)" }} />
                          </div>
                        )}
                        <button
                          onClick={() => { setSelectedId(node.id); setPanelOpen(true) }}
                          className="flex flex-col items-start gap-[6px] px-[14px] py-[12px] rounded-[10px] transition-all text-left"
                          style={{
                            background: colors.bg,
                            border:     `1.5px solid ${isSelected ? "var(--primary)" : colors.border}`,
                            minWidth:   120,
                            boxShadow:  isSelected ? "0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent)" : "none",
                          }}
                        >
                          <div className="flex items-center gap-[6px]">
                            <span style={{ color: isSelected ? "var(--primary)" : colors.icon }}>{node.icon}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-supporting)" }}>{node.sublabel}</span>
                          </div>
                          <span className="text-[12px] font-semibold" style={{ color: "var(--foreground)" }}>{node.label}</span>
                          {node.status === "warning" && (
                            <div className="flex items-center gap-[4px]">
                              <CheckCircle2 size={10} style={{ color: "var(--color-border-alert-default)" }} />
                              <span className="text-[10px]" style={{ color: "var(--color-border-alert-default)" }}>Needs config</span>
                            </div>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Execution log strip at bottom */}
              <div className="px-[20px] py-[16px]" style={{ borderTop: "1px solid var(--field-border)", background: "var(--surface)" }}>
                <span className="text-[10px] font-semibold uppercase tracking-wide block mb-[8px]" style={{ color: "var(--field-label)" }}>Last execution</span>
                <div className="flex gap-[32px]">
                  <ProcessItem title="Data enrichment" status="done"    description="Clearbit — 4 fields added" timestamp="5 min ago" showLine={false} className="flex-1" />
                  <ProcessItem title="Risk scoring"     status="done"    description="Score: 42/100"             timestamp="4 min ago" showLine={false} className="flex-1" />
                  <ProcessItem title="Alert dispatched" status="loading" description="Sending to #cs-alerts…"                         showLine={false} className="flex-1" />
                </div>
              </div>
            </div>

            {/* SidePanel — node configuration (default 350px, expands to 450px → half-screen) */}
            <SidePanel
              open={panelOpen}
              onClose={() => setPanelOpen(o => !o)}
              title={selectedNode?.label ?? "Node Configuration"}
              description={selectedNode?.description}
              titleTag={selectedNode?.status === "active" ? "Active" : selectedNode?.status === "warning" ? "Review" : "Idle"}
              titleTagVariant={selectedNode?.status === "active" ? "success" : selectedNode?.status === "warning" ? "alert" : "neutral"}
              titleIcon={selectedNode?.icon}
              showCollapsedStrip
              showMenu={false}
              showSearch={false}
              footer={
                <div className="flex justify-end gap-[8px] p-[12px]" style={{ borderTop: "0.5px solid var(--field-border)" }}>
                  <Button variant="secondary" size="sm" onClick={() => setConfig(DEFAULT_CONFIG)}>Reset</Button>
                  <Button variant="primary"   size="sm" onClick={() => setPanelOpen(false)}>Save node</Button>
                </div>
              }
            >
              <div className="flex flex-col gap-[20px] px-[16px] pb-[12px]">

                {/* Section: Condition */}
                <div className="flex flex-col gap-[12px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>Condition</span>
                  <Select placeholder="Field to evaluate" value={config.field} />
                  <Select placeholder="Operator"          value={config.operator} />
                  <Input
                    placeholder="Threshold value"
                    value={config.value}
                    onChange={e => setConfig(c => ({ ...c, value: e.target.value }))}
                    state={config.value.trim() ? "success" : "error"}
                  />
                  {!config.value.trim() && (
                    <span className="text-[11px]" style={{ color: "var(--color-status-error-default)" }}>Threshold value is required</span>
                  )}
                </div>

                {/* Section: Evaluation window */}
                <div className="flex flex-col gap-[12px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>Evaluation window</span>
                  <Select placeholder="Time range"         value={config.range} />
                  <Select placeholder="Trigger frequency"  value={config.freq}  />
                </div>

                {/* Section: On match */}
                <div className="flex flex-col gap-[12px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--field-label)" }}>On match</span>
                  <Select placeholder="Next node" value={config.next} />
                  <Input
                    placeholder="Alert channel"
                    value={config.channel}
                    onChange={e => setConfig(c => ({ ...c, channel: e.target.value }))}
                  />
                </div>

                {/* Unsaved changes indicator */}
                {hasChanges && (
                  <div className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[6px]" style={{ background: "var(--color-surface-alert-subtle)", border: "0.5px solid var(--color-border-alert-default)" }}>
                    <span className="text-[11px] font-medium" style={{ color: "var(--color-border-alert-default)" }}>Unsaved changes — click Save node to apply</span>
                  </div>
                )}

              </div>
            </SidePanel>

          </div>
        </main>
      </div>
    </div>
  )
}
