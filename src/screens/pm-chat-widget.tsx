import { useState, useRef, useEffect } from "react"
import * as Icons from "lucide-react"
import { ScreenLayout }        from "@/components/layouts/screen-layout"
import { WidgetCanvasView }    from "@/components/layouts/widget-canvas-view"
import type { CanvasSlot }     from "@/components/layouts/widget-canvas-view"
import { Header }              from "@/components/ui/header"
import { Button }              from "@/components/ui/button"
import { Tag }                 from "@/components/ui/tag"
import { Tabs }                from "@/components/ui/tabs"
import type { TabItem }        from "@/components/ui/tabs"
import { Toggle }              from "@/components/ui/toggle"
import { ModalDialog }         from "@/components/ui/modal-dialog"
import { EmptyState }          from "@/components/ui/empty-state"
import type { SidebarItem }    from "@/components/ui/sidebar"

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const SIDEBAR: SidebarItem[] = [
  { id: "home",          label: "Control Tower",     icon: "Home"        },
  { id: "networks",      label: "Agentic Networks",  icon: "Sparkles"    },
  { id: "workflows",     label: "Workflows",         icon: "Zap"         },
  { id: "agents",        label: "Agents",            icon: "Bot"         },
  { id: "chat-widget",   label: "Chat Widget",       icon: "MessageCircle" },
  { id: "admin",         label: "Admin",             icon: "LayoutGrid"  },
]

// ─── Fixtures ─────────────────────────────────────────────────────────────────

type WidgetStatus = "active" | "draft" | "inactive"

interface WidgetCard {
  id: string
  name: string
  status: WidgetStatus
  description: string
  network: string
  executions: number
  successRate: string
  lastUpdated: string
}

const WIDGETS: WidgetCard[] = [
  {
    id: "main-website",
    name: "Main Website",
    status: "active",
    description: "Customer-facing support and lead qualification widget embedded on acme.com.",
    network: "Sales AI",
    executions: 1240,
    successRate: "94.2%",
    lastUpdated: "2m ago",
  },
  {
    id: "support-portal",
    name: "Support Portal",
    status: "active",
    description: "Internal support portal widget for ticket triage and escalation routing.",
    network: "Support Agent",
    executions: 880,
    successRate: "91.5%",
    lastUpdated: "14m ago",
  },
  {
    id: "blog",
    name: "Blog",
    status: "draft",
    description: "Content engagement widget — not yet published.",
    network: "—",
    executions: 0,
    successRate: "—",
    lastUpdated: "3d ago",
  },
]

interface NetworkOption {
  id: string
  name: string
  type: "agent" | "network"
  description: string
  status: "active" | "inactive"
  successRate: string
  executions: number
}

const NETWORKS: NetworkOption[] = [
  { id: "sales-ai",       name: "Sales AI",           type: "network", description: "Lead qualification & vehicle recommendations", status: "active",   successRate: "94.2%", executions: 12400 },
  { id: "support-agent",  name: "Support Agent",       type: "agent",   description: "Ticket triage & escalation routing",          status: "active",   successRate: "91.5%", executions: 8800  },
  { id: "onboarding-nw",  name: "Onboarding Network",  type: "network", description: "Customer onboarding & product tour assistant", status: "active",   successRate: "88.0%", executions: 3200  },
  { id: "finance-bot",    name: "Finance Bot",         type: "agent",   description: "Invoice lookup and payment status queries",    status: "inactive", successRate: "76.3%", executions: 520   },
  { id: "hr-assistant",   name: "HR Assistant",        type: "agent",   description: "Employee HR queries and policy lookup",        status: "active",   successRate: "89.1%", executions: 1100  },
]

// ─── Helper components ────────────────────────────────────────────────────────

function StatusDot({ status }: { status: WidgetStatus }) {
  const color = status === "active" ? "var(--color-text-success)"
              : status === "draft"  ? "var(--field-text-alert)"
              : "var(--color-text-disabled)"
  const bg    = status === "active" ? "var(--tag-success-bg)"
              : status === "draft"  ? "var(--tag-alert-bg)"
              : "var(--color-surface-neutral-default)"
  const label = status === "active" ? "Active" : status === "draft" ? "Draft" : "Inactive"

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: bg, color, fontSize: 11, fontWeight: 700,
      border: `1px solid ${status === "active" ? "var(--color-border-success-default)" : status === "draft" ? "var(--color-border-alert-default)" : "var(--color-border-neutral-default)"}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
      {label}
    </span>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PMChatWidgetScreen() {
  // View state
  const [view, setView]               = useState<"list" | "detail">("list")
  const [activeWidget, setActiveWidget] = useState<WidgetCard>(WIDGETS[0])

  // Detail tab state
  const [activeTab, setActiveTab]     = useState("overview")

  // Agentic Network tab
  const [agentType, setAgentType]     = useState<"agent" | "network">("network")
  const [selectedNet, setSelectedNet] = useState("sales-ai")
  const [pendingNet, setPendingNet]   = useState<string | null>(null)
  const [showReplaceBanner, setShowReplaceBanner] = useState(false)

  // Browse modal
  const [browseOpen, setBrowseOpen]   = useState(false)
  const [browseFilter, setBrowseFilter] = useState("All")
  const [browseSearch, setBrowseSearch] = useState("")
  const [browseSelected, setBrowseSelected] = useState<string | null>(null)

  // Deploy modal
  const [deployOpen, setDeployOpen]   = useState(false)
  const [deployQueued, setDeployQueued] = useState(false)

  // Notifications
  type Notif = { id: string; title: string; sub: string; time: string }
  const [notifs, setNotifs]           = useState<Notif[]>([])
  const [notifPanelOpen, setNotifPanelOpen] = useState(false)
  const notifRef                      = useRef<HTMLDivElement>(null)

  // Appearance toggles
  const [togBranding, setTogBranding] = useState(true)
  const [togAvatar, setTogAvatar]     = useState(true)
  const [togTyping, setTogTyping]     = useState(true)

  // Preferences toggles
  const [togFileUpload, setTogFileUpload]   = useState(false)
  const [togHistory, setTogHistory]         = useState(true)
  const [togProactive, setTogProactive]     = useState(false)
  const [togMobile, setTogMobile]           = useState(true)

  // Embed trusted domains
  const [domains, setDomains]         = useState(["acme.com", "acme.co", "staging.acme.com"])
  const [domainInput, setDomainInput] = useState("")

  // Resizable preview panel
  const [previewWidth, setPreviewWidth] = useState(300)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartW = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const delta = dragStartX.current - e.clientX
      const next = Math.min(520, Math.max(220, dragStartW.current + delta))
      setPreviewWidth(next)
    }
    const onUp = () => { isDragging.current = false; document.body.style.cursor = "" }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [])

  // Close notif panel on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifPanelOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── List view ──────────────────────────────────────────────────────────────

  function openWidget(w: WidgetCard) {
    setActiveWidget(w)
    setView("detail")
    setActiveTab("overview")
  }

  function handleDeploy() {
    setDeployQueued(false)
    setDeployOpen(true)
  }

  function confirmDeploy() {
    setDeployQueued(true)
    const notif: Notif = {
      id: Date.now().toString(),
      title: `"${activeWidget.name}" deploy queued`,
      sub: "Your widget will be live in ~2 minutes.",
      time: "Just now",
    }
    setNotifs(prev => [notif, ...prev])
  }

  function clearNotifs() { setNotifs([]) }

  // ── Browse modal handlers ──────────────────────────────────────────────────

  function handleBrowseSelect(id: string) {
    const current = NETWORKS.find(n => n.id === selectedNet)
    if (current) {
      setPendingNet(id)
      setShowReplaceBanner(true)
      setBrowseOpen(false)
    } else {
      setSelectedNet(id)
    }
  }

  function confirmReplace() {
    if (pendingNet) { setSelectedNet(pendingNet); setPendingNet(null) }
    setShowReplaceBanner(false)
  }

  function cancelReplace() { setPendingNet(null); setShowReplaceBanner(false) }

  const filteredNetworks = NETWORKS.filter(n => {
    const matchFilter = browseFilter === "All"
      ? true
      : browseFilter === "Agents"   ? n.type === "agent"
      : browseFilter === "Networks" ? n.type === "network"
      : true
    const matchSearch = browseSearch === ""
      || n.name.toLowerCase().includes(browseSearch.toLowerCase())
      || n.description.toLowerCase().includes(browseSearch.toLowerCase())
    return matchFilter && matchSearch
  })

  // ── Overview canvas slots ──────────────────────────────────────────────────

  const metricsSlot: CanvasSlot = {
    uid: "cw-metrics", title: "Metrics", colSpan: 2,
    content: (
      <div style={{ padding: "0 16px 16px" }}>
        {[
          { icon: "Activity",  label: "Success Rate",          value: "94.2%", meta: "+2.1%",         metaColor: "var(--color-text-success)" },
          { icon: "Shield",    label: "Autonomous Resolution",  value: "78.5%", meta: "+5.3%",         metaColor: "var(--color-text-success)" },
          { icon: "DollarSign",label: "Cost per Execution",    value: "$0.08", meta: "No change",     metaColor: "var(--color-text-disabled)" },
          { icon: "Clock",     label: "Executions",            value: "1,240", meta: "+142 this month", metaColor: "var(--color-text-success)" },
        ].map(row => {
          const Ic = (Icons as unknown as Record<string, React.FC<{ size?: number; color?: string }>>)[row.icon]
          return (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-border-neutral-default)" }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--color-surface-neutral-default)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic size={12} color="var(--color-text-subtitle)" />
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--color-text-title)" }}>{row.value}</span>
                <span style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>{row.label}</span>
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: row.metaColor }}>{row.meta}</span>
            </div>
          )
        })}
      </div>
    ),
  }

  const detailsSlot: CanvasSlot = {
    uid: "cw-details", title: "Details", colSpan: 1,
    content: (
      <div>
        {[
          { label: "Owner",           value: "Thomas González" },
          { label: "Version",         value: "v2.4.1"          },
          { label: "Created",         value: "Mar 14, 2025"    },
          { label: "Trusted Domains", value: "3 domains",      action: () => setActiveTab("embed") },
        ].map(row => (
          <div key={row.label}
            onClick={row.action}
            style={{
              padding: "12px 16px", borderBottom: "1px solid var(--color-border-neutral-default)",
              cursor: row.action ? "pointer" : "default",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-disabled)", marginBottom: 4 }}>{row.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", display: "flex", alignItems: "center", gap: 6 }}>
              {row.value}
              {row.action && <span style={{ fontSize: 11, color: "var(--primary)" }}>View →</span>}
            </div>
          </div>
        ))}
      </div>
    ),
  }

  const currentNet = NETWORKS.find(n => n.id === selectedNet)

  const assignedSlot: CanvasSlot = {
    uid: "cw-assigned", title: "Assigned Agentic Network", colSpan: 1, rowSpan: 8,
    content: (
      <div style={{ padding: "0 0 16px" }}>
        {currentNet ? (
          <>
            {[
              { icon: "Bot",      label: currentNet.name,         sub: currentNet.description, color: "var(--badge-purple)", bg: "var(--card-purple-bg)" },
              { icon: "Star",     label: currentNet.successRate,  sub: "Success Rate" },
              { icon: "Clock",    label: "<1s",                   sub: "Avg. Response" },
              { icon: "MessageCircle", label: "78.5%",            sub: "Autonomous Resolution" },
            ].map((row, i) => {
              const Ic = (Icons as unknown as Record<string, React.FC<{ size?: number; color?: string }>>)[row.icon]
              const isFirst = i === 0
              return (
                <div key={row.label + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--color-border-neutral-default)", cursor: "pointer" }}
                  onClick={() => setActiveTab("agent")}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: isFirst ? "var(--card-purple-bg)" : "var(--color-surface-neutral-default)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic size={12} color={isFirst ? "var(--badge-purple)" : "var(--color-text-subtitle)"} />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: isFirst ? 13 : 14, fontWeight: 700, color: "var(--color-text-title)" }}>{row.label}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>{row.sub}</span>
                  </span>
                </div>
              )
            })}
            <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <button onClick={() => setActiveTab("agent")}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                View in Agentic Studio <Icons.ChevronRight size={12} />
              </button>
            </div>
          </>
        ) : (
          <EmptyState icon={Icons.Bot} title="No network assigned" description="Assign an agentic network from the Agentic Network tab." />
        )}
      </div>
    ),
  }

  // ── Tab items ──────────────────────────────────────────────────────────────

  const DETAIL_TABS: TabItem[] = [
    { id: "overview",     label: "Overview"         },
    { id: "appearance",   label: "Appearance"       },
    { id: "agent",        label: "Agentic Network"  },
    { id: "preferences",  label: "Preferences"      },
    { id: "embed",        label: "Embed"            },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
      <ScreenLayout
        workspaceName="AIMS OS"
        userName="Thomas González"
        userEmail="thomas.gonzalez@aimsos.ai"
        companyName="AIMS OS"
        sidebarItems={SIDEBAR}
        activeSidebarId="chat-widget"
        onSidebarItemClick={id => { if (id === "chat-widget") setView("list") }}
        header={(isScrolled) => view === "list" ? (
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title="Chat Widgets"
            description="Embeddable AI chat widgets connected to your Agentic Workflows"
            primaryAction={<Button variant="main" size="sm" onClick={() => {}}>
              <Icons.Plus size={14} style={{ marginRight: 4 }} />New Widget
            </Button>}
          />
        ) : (
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={activeWidget.name}
            description="Customer-facing support and lead qualification widget embedded on acme.com."
            tag={<Tag variant="success" size="sm">Active</Tag>}
            backButton
            primaryAction={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Notifications bell — layered on top of ScreenLayout's own actions for prototype clarity */}
                <div ref={notifRef} style={{ position: "relative" }}>
                  <button onClick={() => setNotifPanelOpen(p => !p)}
                    style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "1px solid var(--color-border-neutral-default)", color: "var(--color-text-subtitle)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <Icons.Bell size={15} />
                    {notifs.length > 0 && (
                      <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: "var(--destructive)", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}> {/* audit-ignore: #fff on destructive badge — no token for white-on-red contrast */}
                        {notifs.length}
                      </span>
                    )}
                  </button>
                  {notifPanelOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, background: "var(--surface)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 12, boxShadow: "0 16px 40px rgba(0,0,0,0.6)", zIndex: 500, overflow: "hidden" }}> {/* audit-ignore: rgba shadow — no token */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px 10px", borderBottom: "1px solid var(--color-border-neutral-default)" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-title)" }}>Notifications</span>
                        <button onClick={clearNotifs} style={{ background: "none", border: "none", fontSize: 11, color: "var(--color-text-disabled)", cursor: "pointer", fontFamily: "inherit" }}>Clear all</button>
                      </div>
                      <div style={{ maxHeight: 300, overflowY: "auto" }}>
                        {notifs.length === 0 ? (
                          <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 12, color: "var(--color-text-disabled)" }}>No notifications yet</div>
                        ) : notifs.map(n => (
                          <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", borderBottom: "1px solid var(--color-border-neutral-default)", background: "var(--card-primary-bg)" }}>
                            <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--card-primary-bg)", border: "1px solid var(--color-border-neutral-default)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icons.Send size={12} color="var(--primary)" />
                            </span>
                            <span style={{ flex: 1 }}>
                              <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-title)", lineHeight: 1.35 }}>{n.title}</span>
                              <span style={{ display: "block", fontSize: 11, color: "var(--color-text-subtitle)", marginTop: 2 }}>{n.sub}</span>
                            </span>
                            <span style={{ fontSize: 10, color: "var(--color-text-disabled)", whiteSpace: "nowrap", marginTop: 2 }}>{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="primary" size="sm" onClick={handleDeploy}>
                  <Icons.Send size={13} style={{ marginRight: 4 }} />Deploy
                </Button>
              </div>
            }
          />
        )}
      >
        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WIDGETS.map(w => (
              <div key={w.id} onClick={() => openWidget(w)}
                style={{
                  background: w.status === "draft" ? "var(--tag-alert-bg)" : "var(--color-surface-neutral-default)",
                  border: `1px solid ${w.status === "draft" ? "var(--color-border-alert-default)" : "var(--color-border-neutral-default)"}`,
                  borderRadius: 12, padding: "16px 18px 14px", cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: w.status === "draft" ? "rgba(253,199,0,0.15)" : "var(--card-primary-bg)", color: w.status === "draft" ? "var(--field-text-alert)" : "var(--primary)" }}> {/* audit-ignore: rgba tint for draft status — no token */}
                    <Icons.MessageCircle size={14} />
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-title)", flex: 1 }}>{w.name}</span>
                  <StatusDot status={w.status} />
                  <span style={{ fontSize: 11, color: "var(--color-text-disabled)", whiteSpace: "nowrap" }}>{w.lastUpdated}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-subtitle)", marginBottom: 10, lineHeight: 1.5 }}>
                  {w.description}
                  {w.network !== "—" && <> Powered by <strong style={{ color: "var(--color-text-title)" }}>{w.network}</strong>.</>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-subtitle)" }}>
                    <Icons.Zap size={12} color="var(--color-text-disabled)" />{w.executions.toLocaleString()} executions
                  </span>
                  {w.successRate !== "—" && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-success)" }}>
                      <Icons.CheckCircle size={12} color="var(--color-text-success)" />{w.successRate} success
                    </span>
                  )}
                </div>
                {w.status === "draft" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: "rgba(253,199,0,0.07)", border: "1px solid var(--color-border-alert-default)", borderRadius: 8, marginTop: 10 }}> {/* audit-ignore: rgba alert tint — no ds token */}
                    <Icons.AlertTriangle size={14} color="var(--field-text-alert)" />
                    <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>
                      This widget is a draft. <span style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>Complete setup</span> to publish.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── DETAIL VIEW ── */}
        {view === "detail" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Tabs items={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />

            <div style={{ flex: 1, display: "flex", gap: 0, minHeight: 0, overflow: "hidden" }}>

            {/* LEFT: scrollable config panel */}
            <div style={{ flex: 1, overflowY: "auto", paddingTop: 24, paddingRight: 24, minWidth: 0 }}>

              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <WidgetCanvasView initialSlots={[metricsSlot, detailsSlot, assignedSlot]} />
              )}

              {/* ── APPEARANCE ── */}
              {activeTab === "appearance" && (
                <div style={{ maxWidth: 640 }}>
                  {/* Avatar presets */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 12 }}>Agent Avatar</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-subtitle)", marginBottom: 12 }}>Pick a preset or upload your own image</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      {[
                        { bg: "linear-gradient(135deg,#6366f1,#8b5cf6)", icon: "Zap"          }, // audit-ignore: decorative avatar preset gradient
                        { bg: "linear-gradient(135deg,#2b7fff,#09E2AB)", icon: "CheckCircle"  }, // audit-ignore: decorative avatar preset gradient
                        { bg: "linear-gradient(135deg,#09E2AB,#00A07E)", icon: "Activity"     }, // audit-ignore: decorative avatar preset gradient
                        { bg: "linear-gradient(135deg,#f59e0b,#f97316)", icon: "Network"      }, // audit-ignore: decorative avatar preset gradient
                        { bg: "linear-gradient(135deg,#ec4899,#a855f7)", icon: "Shield"       }, // audit-ignore: decorative avatar preset gradient
                      ].map((preset, i) => {
                        const Ic = (Icons as unknown as Record<string, React.FC<{ size?: number; color?: string }>>)[preset.icon]
                        return (
                          <div key={i} style={{ width: 44, height: 44, borderRadius: "50%", background: preset.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: i === 0 ? "2px solid var(--primary)" : "2px solid transparent", boxShadow: i === 0 ? "0 0 0 3px var(--card-primary-bg)" : "none" }}>
                            <Ic size={18} color="#fff" /> {/* audit-ignore: white on gradient avatar — no token */}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Brand color */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 12 }}>Brand Color</div>
                    <div style={{ background: "var(--color-surface-neutral-default)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 10, padding: "14px 18px" }}>
                      <div style={{ fontSize: 11, color: "var(--color-text-subtitle)", marginBottom: 10 }}>Primary Color — affects buttons, avatars, and widget accents</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {["var(--primary)", "var(--badge-purple)", "var(--color-text-success)", "var(--color-text-error)", "var(--field-text-alert)"].map(c => (
                          <div key={c} style={{ width: 26, height: 26, borderRadius: 7, background: c, cursor: "pointer", border: c === "var(--primary)" ? "2px solid var(--color-text-title)" : "2px solid transparent", flexShrink: 0 }} />
                        ))}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: "var(--color-text-disabled)" }}>Changes are reflected live in the preview panel</div>
                    </div>
                  </div>

                  {/* Layout */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 12 }}>Layout</div>
                    <div style={{ background: "var(--color-surface-neutral-default)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 10, overflow: "hidden" }}>
                      {[
                        { label: "Theme",        options: ["System (auto)", "Dark", "Light"] },
                        { label: "Widget Size",  options: ["Medium (default)", "Small", "Large", "Full screen"] },
                        { label: "Position",     options: ["Bottom right", "Bottom left", "Inline (custom)"] },
                      ].map((row, i) => (
                        <div key={row.label} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: i < 2 ? "1px solid var(--color-border-neutral-default)" : "none" }}>
                          <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--color-text-subtitle)" }}>{row.label}</span>
                          <select style={{ background: "var(--surface)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 7, padding: "6px 28px 6px 10px", color: "var(--color-text-title)", fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer", appearance: "none" }}>
                            {row.options.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Options toggles */}
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 12 }}>Options</div>
                  {[
                    { label: "Show AIMS-OS Branding", desc: 'Display "Powered by AIMS-OS" in the widget footer', val: togBranding, set: setTogBranding },
                    { label: "Show Agent Avatar",     desc: "Display the network avatar next to messages",         val: togAvatar,   set: setTogAvatar   },
                    { label: "Show Typing Indicator", desc: 'Animate a "..." indicator while processing',          val: togTyping,   set: setTogTyping   },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--color-border-neutral-default)" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)", marginBottom: 2 }}>{row.label}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>{row.desc}</div>
                      </div>
                      <Toggle checked={row.val} onChange={row.set} size="default" />
                    </div>
                  ))}
                </div>
              )}

              {/* ── AGENTIC NETWORK ── */}
              {activeTab === "agent" && (
                <div style={{ maxWidth: 640 }}>

                  {/* Replace banner */}
                  {showReplaceBanner && (
                    <div style={{ background: "var(--card-primary-bg)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>Replace current network?</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-disabled)", marginBottom: 12, lineHeight: 1.5 }}>
                        This will replace <strong style={{ color: "var(--color-text-title)" }}>{NETWORKS.find(n => n.id === selectedNet)?.name}</strong> with <strong style={{ color: "var(--color-text-title)" }}>{NETWORKS.find(n => n.id === pendingNet)?.name}</strong>. Your widget will continue to use the old network until you deploy.
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={cancelReplace} style={{ background: "transparent", border: "1px solid var(--color-border-neutral-default)", color: "var(--color-text-subtitle)", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                        <button onClick={confirmReplace} style={{ background: "var(--primary)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Continue</button> {/* audit-ignore: #fff on primary bg — standard button pattern */}
                      </div>
                    </div>
                  )}

                  {/* Type selector */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 10 }}>Assignment Type</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[
                        { id: "agent",   label: "Agent",           desc: "Single AI agent",          icon: "Bot"      },
                        { id: "network", label: "Agentic Network",  desc: "Multi-agent orchestration", icon: "Network"  },
                      ].map(tc => {
                        const Ic = (Icons as unknown as Record<string, React.FC<{ size?: number; color?: string }>>)[tc.icon]
                        const sel = agentType === tc.id
                        return (
                          <div key={tc.id} onClick={() => setAgentType(tc.id as "agent" | "network")}
                            style={{ flex: 1, padding: "12px 8px", border: `1px solid ${sel ? "var(--primary)" : "var(--color-border-neutral-default)"}`, borderRadius: 10, cursor: "pointer", textAlign: "center", background: sel ? "var(--card-primary-bg)" : "transparent", transition: "all 0.15s" }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, margin: "0 auto 7px", display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "var(--card-primary-bg)" : "var(--color-surface-neutral-default)" }}>
                              <Ic size={14} color={sel ? "var(--primary)" : "var(--color-text-subtitle)"} />
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: sel ? "var(--color-text-title)" : "var(--color-text-subtitle)", marginBottom: 2 }}>{tc.label}</div>
                            <div style={{ fontSize: 10, color: "var(--color-text-disabled)", lineHeight: 1.3 }}>{tc.desc}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Network list */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 10 }}>
                      Select {agentType === "agent" ? "Agent" : "Agentic Network"}
                    </div>
                    <div style={{ border: "1px solid var(--color-border-neutral-default)", borderRadius: 10, overflow: "hidden" }}>
                      {NETWORKS.filter(n => n.type === agentType).map(n => {
                        const sel = selectedNet === n.id
                        return (
                          <div key={n.id} onClick={() => {
                            if (sel) return
                            if (selectedNet) { setPendingNet(n.id); setShowReplaceBanner(true) }
                            else setSelectedNet(n.id)
                          }}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--color-border-neutral-default)", cursor: "pointer", background: sel ? "var(--card-primary-bg)" : "transparent", transition: "background 0.15s" }}>
                            <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: agentType === "network" ? "var(--card-purple-bg)" : "var(--card-primary-bg)" }}>
                              {agentType === "network" ? <Icons.Network size={14} color="var(--badge-purple)" /> : <Icons.Bot size={14} color="var(--primary)" />}
                            </span>
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)", marginBottom: 2, display: "flex", alignItems: "center", gap: 7 }}>
                                {n.name}
                                <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 6px", borderRadius: 4, background: agentType === "network" ? "var(--card-purple-bg)" : "var(--card-primary-bg)", color: agentType === "network" ? "var(--badge-purple)" : "var(--primary)" }}>{n.type}</span>
                              </span>
                              <span style={{ fontSize: 11, color: "var(--color-text-subtitle)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.description}</span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: n.status === "active" ? "var(--color-text-success)" : "var(--color-text-disabled)", flexShrink: 0 }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: n.status === "active" ? "var(--color-text-success)" : "var(--color-text-disabled)" }} />
                              {n.status === "active" ? "Active" : "Inactive"}
                            </span>
                            <span style={{ width: 16, height: 16, borderRadius: "50%", border: `1.5px solid ${sel ? "var(--primary)" : "var(--color-border-neutral-default)"}`, position: "relative", flexShrink: 0, background: sel ? "var(--primary)" : "transparent" }}>
                              {sel && <span style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#fff" }} />} {/* audit-ignore: white radio dot — no token */}
                            </span>
                          </div>
                        )
                      })}
                      <button onClick={() => { setBrowseOpen(true); setBrowseFilter("All"); setBrowseSearch("") }}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", color: "var(--primary)", fontSize: 13, fontWeight: 500, cursor: "pointer", textDecoration: "none", background: "transparent", border: "none", borderTop: "1px solid var(--color-border-neutral-default)", width: "100%", textAlign: "left", fontFamily: "inherit" }}>
                        <Icons.Search size={13} /> Browse all networks &amp; agents
                        <Icons.ArrowRight size={11} style={{ marginLeft: "auto", opacity: 0.5 }} />
                      </button>
                    </div>
                  </div>

                  {/* Network summary */}
                  {currentNet && (
                    <div style={{ border: "1px solid var(--color-border-neutral-default)", borderRadius: 10, background: "var(--card-primary-bg)", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--card-purple-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icons.Network size={14} color="var(--badge-purple)" />
                        </span>
                        <span>
                          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", flexWrap: "wrap" }}>
                            {currentNet.name}
                            <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: "var(--card-purple-bg)", color: "var(--badge-purple)" }}>{currentNet.type}</span>
                          </span>
                          <span style={{ fontSize: 11, color: "var(--color-text-subtitle)", marginTop: 3, display: "block", lineHeight: 1.4 }}>{currentNet.description}</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--color-border-neutral-default)", paddingTop: 12, marginTop: 4 }}>
                        <div><div style={{ fontSize: 10, color: "var(--color-text-disabled)", marginBottom: 3 }}>Success Rate</div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-title)" }}>{currentNet.successRate}</div></div>
                        <div><div style={{ fontSize: 10, color: "var(--color-text-disabled)", marginBottom: 3 }}>Executions</div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-title)" }}>{currentNet.executions.toLocaleString()}</div></div>
                      </div>
                      <button style={{ marginTop: 12, fontSize: 12, fontWeight: 500, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, fontFamily: "inherit" }}>
                        View in Agentic Studio <Icons.ExternalLink size={11} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── PREFERENCES ── */}
              {activeTab === "preferences" && (
                <div style={{ maxWidth: 640 }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 12 }}>Capabilities</div>
                    {[
                      { label: "File uploads",      desc: "Allow users to attach files to messages",                  val: togFileUpload, set: setTogFileUpload },
                      { label: "Conversation history", desc: "Persist chat history between sessions for returning users", val: togHistory,    set: setTogHistory    },
                      { label: "Proactive messages",  desc: "Allow the widget to initiate conversations with users",     val: togProactive,  set: setTogProactive  },
                      { label: "Mobile optimized",    desc: "Optimize layout and interactions for touch devices",        val: togMobile,     set: setTogMobile     },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--color-border-neutral-default)" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)", marginBottom: 2 }}>{row.label}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-subtitle)" }}>{row.desc}</div>
                        </div>
                        <Toggle checked={row.val} onChange={row.set} size="default" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── EMBED ── */}
              {activeTab === "embed" && (
                <div style={{ maxWidth: 640 }}>
                  {/* Embed snippet */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 12 }}>Embed Code</div>
                    <div style={{ position: "relative" }}>
                      <pre style={{ background: "#000", border: "1px solid var(--color-border-neutral-default)", borderRadius: 8, padding: "14px 40px 14px 14px", fontFamily: "'SF Mono', ui-monospace, monospace", fontSize: 11, color: "var(--color-text-success)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}> {/* audit-ignore: #000 code block bg — intentional dark canvas */}
{`<script
  src="https://widget.aimsos.ai/v2.js"
  data-widget-id="${activeWidget.id}"
  data-network="${selectedNet}"
  async>
</script>`}
                      </pre>
                      <button style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: "var(--color-surface-neutral-default)", border: "1px solid var(--color-border-neutral-default)", color: "var(--color-text-subtitle)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icons.Copy size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Trusted domains */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 12 }}>Trusted Domains</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-subtitle)", marginBottom: 12, lineHeight: 1.5 }}>
                      The widget will only load on these domains. Leave empty to allow all domains.
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <input value={domainInput} onChange={e => setDomainInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && domainInput.trim()) { setDomains(prev => [...prev, domainInput.trim()]); setDomainInput("") } }}
                        placeholder="e.g. yourdomain.com"
                        style={{ flex: 1, background: "var(--field-bg)", border: "1px solid var(--field-border)", borderRadius: 8, padding: "9px 12px", color: "var(--color-text-title)", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                      />
                      <button onClick={() => { if (domainInput.trim()) { setDomains(prev => [...prev, domainInput.trim()]); setDomainInput("") } }}
                        style={{ height: 38, padding: "0 14px", background: "var(--card-primary-bg)", border: "1px solid var(--primary)", borderRadius: 8, color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}>
                        <Icons.Plus size={11} /> Add
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {domains.map(d => (
                        <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 6px 0 10px", background: "var(--color-surface-neutral-default)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 20, fontSize: 12, color: "var(--color-text-title)", fontFamily: "'SF Mono', ui-monospace, monospace", letterSpacing: "-0.2px" }}>
                          {d}
                          <button onClick={() => setDomains(prev => prev.filter(x => x !== d))}
                            style={{ width: 18, height: 18, borderRadius: "50%", background: "transparent", border: "none", color: "var(--color-text-subtitle)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, lineHeight: 1, fontFamily: "inherit", padding: 0 }}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* DRAG HANDLE */}
            <div
              onMouseDown={e => {
                isDragging.current = true
                dragStartX.current = e.clientX
                dragStartW.current = previewWidth
                document.body.style.cursor = "col-resize"
                e.preventDefault()
              }}
              style={{
                width: 4, flexShrink: 0, cursor: "col-resize",
                background: "transparent",
                transition: "background 0.15s",
                position: "relative", zIndex: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--primary)")}
              onMouseLeave={e => { if (!isDragging.current) e.currentTarget.style.background = "transparent" }}
            />

            {/* RIGHT: widget live preview — always visible */}
            <div style={{
              width: previewWidth, flexShrink: 0,
              background: "var(--color-surface-neutral-default)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}>
              {/* Preview header */}
              <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--color-border-neutral-default)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-disabled)" }}>Live Preview</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--color-text-success)", fontWeight: 600 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-text-success)", display: "inline-block" }} />
                  Live
                </span>
              </div>

              {/* Chat window */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Chat header */}
                <div style={{ padding: "12px 14px 10px", background: "var(--primary)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}> {/* audit-ignore: rgba overlay on primary */}
                    <Icons.Bot size={15} color="#fff" /> {/* audit-ignore: #fff on colored bg */}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{activeWidget.name}</div> {/* audit-ignore: #fff on primary */}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.72)", marginTop: 1 }}>{activeWidget.network !== "—" ? activeWidget.network : "No agent assigned"}</div> {/* audit-ignore: rgba on primary */}
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#09E2AB", boxShadow: "0 0 0 2px rgba(9,226,171,0.25)" }} /> {/* audit-ignore: decorative status dot color */}
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Agent bubble */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--card-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>
                      <Icons.Bot size={11} color="var(--primary)" />
                    </div>
                    <div style={{ maxWidth: "80%", background: "var(--canvas)", border: "1px solid var(--color-border-neutral-default)", borderRadius: "var(--radius-l) var(--radius-l) var(--radius-l) var(--radius-xs)", padding: "9px 12px", fontSize: 12, color: "var(--color-text-title)", lineHeight: 1.5 }}>
                      Hi! I'm {activeWidget.network !== "—" ? activeWidget.network : "your AI assistant"}. How can I help you today?
                    </div>
                  </div>
                  {/* User bubble */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ maxWidth: "80%", background: "var(--primary)", borderRadius: "var(--radius-l) var(--radius-l) var(--radius-xs) var(--radius-l)", padding: "9px 12px", fontSize: 12, color: "#fff", lineHeight: 1.5 }}> {/* audit-ignore: #fff on primary */}
                      I'd like to know more about pricing.
                    </div>
                  </div>
                  {/* Agent typing */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--card-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>
                      <Icons.Bot size={11} color="var(--primary)" />
                    </div>
                    <div style={{ background: "var(--canvas)", border: "1px solid var(--color-border-neutral-default)", borderRadius: "var(--radius-l) var(--radius-l) var(--radius-l) var(--radius-xs)", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-text-disabled)", display: "inline-block", animation: `bounce 1.1s ${delay}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div style={{ padding: "10px 12px", borderTop: "1px solid var(--color-border-neutral-default)", display: "flex", gap: 7, alignItems: "center" }}>
                  <input
                    placeholder="Type a message…"
                    style={{ flex: 1, background: "var(--field-bg)", border: "1px solid var(--field-border)", borderRadius: "var(--radius-full)", padding: "8px 13px", fontSize: 12, color: "var(--color-text-title)", fontFamily: "inherit", outline: "none" }}
                  />
                  <button style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", background: "var(--primary)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icons.Send size={12} color="#fff" /> {/* audit-ignore: #fff on primary */}
                  </button>
                </div>
              </div>

              {/* Branding */}
              <div style={{ padding: "7px 12px", borderTop: "1px solid var(--color-border-neutral-default)", textAlign: "center", fontSize: 10, color: "var(--color-text-disabled)" }}>
                Powered by <strong style={{ color: "var(--primary)" }}>AIMS OS</strong>
              </div>
            </div>

            </div>
          </div>
        )}
      </ScreenLayout>

      {/* ── DEPLOY MODAL ── */}
      <ModalDialog
        isOpen={deployOpen}
        onClose={() => { setDeployOpen(false); setDeployQueued(false) }}
        variant="content"
        tone={deployQueued ? "success" : "default"}
        iconName={deployQueued ? "CheckCircle" : "Send"}
        title={deployQueued ? "Deploy queued" : "Deploy widget"}
        description={deployQueued
          ? "Your widget update has been queued and will be live in approximately 2 minutes."
          : undefined}
        slot={!deployQueued ? (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-disabled)", marginBottom: 10 }}>Deploying</div>
            {[
              { label: "Widget", value: activeWidget.name, icon: "MessageCircle" },
              { label: "Agentic Network", value: currentNet?.name ?? "—", icon: "Network" },
              { label: "Version bump", value: "v2.4.1 → v2.4.2", icon: "Tag" },
            ].map(row => {
              const Ic = (Icons as unknown as Record<string, React.FC<{ size?: number; color?: string }>>)[row.icon]
              return (
                <div key={row.label} style={{ background: "var(--color-surface-neutral-default)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 10, padding: "11px 13px", display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--card-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic size={14} color="var(--primary)" />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 10, color: "var(--color-text-disabled)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", marginTop: 2, display: "block" }}>{row.value}</span>
                  </span>
                </div>
              )
            })}
            <div style={{ fontSize: 11, color: "var(--color-text-disabled)", lineHeight: 1.5, marginTop: 12, padding: "10px 12px", background: "var(--card-primary-bg)", borderLeft: "2px solid var(--primary)", borderRadius: 6 }}>
              Deployment is non-destructive. Existing sessions will continue on the current version until they restart.
            </div>
          </div>
        ) : undefined}
        ctaPrimary={deployQueued
          ? { label: "Close", onClick: () => { setDeployOpen(false); setDeployQueued(false) } }
          : { label: "Queue Deploy", onClick: confirmDeploy }}
        ctaSecondary={!deployQueued
          ? { label: "Cancel", onClick: () => setDeployOpen(false) }
          : undefined}
      />

      {/* ── BROWSE MODAL ── */}
      {browseOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }} // audit-ignore: rgba modal backdrop — no token
          onClick={e => { if (e.target === e.currentTarget) setBrowseOpen(false) }}>
          <div style={{ background: "var(--canvas)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 20, width: 680, maxWidth: "calc(100vw - 32px)", maxHeight: "84vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 96px rgba(0,0,0,0.65)" }}> {/* audit-ignore: rgba shadow — no token */}
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px 15px", borderBottom: "1px solid var(--color-border-neutral-default)" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--card-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icons.Network size={16} color="var(--primary)" />
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-title)", flex: 1, letterSpacing: "-0.01em" }}>Networks &amp; Agents</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-disabled)", background: "var(--color-surface-neutral-default)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 6, padding: "3px 9px" }}>{filteredNetworks.length} available</span>
              <button onClick={() => setBrowseOpen(false)}
                style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--color-border-neutral-default)", background: "transparent", color: "var(--color-text-subtitle)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, lineHeight: 1, fontFamily: "inherit" }}>×</button>
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderBottom: "1px solid var(--color-border-neutral-default)" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Icons.Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-disabled)", pointerEvents: "none" }} />
                <input value={browseSearch} onChange={e => setBrowseSearch(e.target.value)}
                  placeholder="Search networks and agents…"
                  style={{ width: "100%", background: "var(--color-surface-neutral-default)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 9, padding: "8px 12px 8px 34px", fontSize: 12, color: "var(--color-text-title)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["All", "Agents", "Networks"].map(f => (
                  <button key={f} onClick={() => setBrowseFilter(f)}
                    style={{ padding: "5px 13px", borderRadius: 7, border: `1px solid ${browseFilter === f ? "rgba(43,127,255,0.35)" : "var(--color-border-neutral-default)"}`, background: browseFilter === f ? "var(--card-primary-bg)" : "transparent", color: browseFilter === f ? "var(--primary)" : "var(--color-text-subtitle)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}> {/* audit-ignore: rgba active border — no token */}
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
              {/* Warning banner if replacing */}
              {selectedNet && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(251,146,60,0.09)", border: "1px solid rgba(251,146,60,0.22)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}> {/* audit-ignore: rgba warning tint — no ds token */}
                  <span style={{ flexShrink: 0, marginTop: 1 }}><Icons.AlertTriangle size={16} color="var(--field-text-alert)" /></span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--field-text-alert)", marginBottom: 2 }}>This will replace your current network</div>
                    <div style={{ fontSize: 11, color: "rgba(251,146,60,0.75)", lineHeight: 1.5 }}> {/* audit-ignore: rgba muted warning text — no token */}
                      Selecting a new item will replace <strong>{currentNet?.name}</strong>. Changes take effect after your next deploy.
                    </div>
                  </div>
                </div>
              )}

              {filteredNetworks.length === 0 ? (
                <EmptyState icon={Icons.Search} title="No results found" description="Try adjusting your search or filter." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {filteredNetworks.map(n => {
                    const isCurrent  = n.id === selectedNet
                    const isBSel     = browseSelected === n.id
                    return (
                      <div key={n.id}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 11px", borderRadius: 10, border: `1px solid ${isCurrent ? "rgba(9,226,171,0.18)" : isBSel ? "rgba(43,127,255,0.28)" : "transparent"}`, background: isCurrent ? "rgba(9,226,171,0.05)" : isBSel ? "var(--card-primary-bg)" : "transparent", cursor: "default", transition: "background 0.14s, border-color 0.14s" }}> {/* audit-ignore: rgba state tints — no ds tokens */}
                        <span style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: n.type === "network" ? "var(--card-purple-bg)" : "var(--card-primary-bg)" }}>
                          {n.type === "network" ? <Icons.Network size={16} color="var(--badge-purple)" /> : <Icons.Bot size={16} color="var(--primary)" />}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-title)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.name}</span>
                          <span style={{ display: "block", fontSize: 11, color: "var(--color-text-subtitle)", lineHeight: 1.45, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.description}</span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-disabled)", background: "var(--color-surface-neutral-default)", border: "1px solid var(--color-border-neutral-default)", borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap" }}>{n.successRate}</span>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: n.status === "active" ? "var(--color-text-success)" : "var(--color-text-disabled)" }} />
                          {isCurrent
                            ? <span style={{ background: "rgba(9,226,171,0.1)", border: "1px solid rgba(9,226,171,0.22)", color: "var(--color-text-success)", padding: "5px 14px", borderRadius: 7, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>Current</span> // audit-ignore: rgba current badge tint — no token
                            : <button onClick={() => setBrowseSelected(isBSel ? null : n.id)}
                                style={{ background: isBSel ? "var(--card-primary-bg)" : "transparent", border: `1px solid ${isBSel ? "rgba(43,127,255,0.5)" : "rgba(43,127,255,0.38)"}`, color: "var(--primary)", padding: "5px 14px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}> {/* audit-ignore: rgba border — no token for primary alpha */}
                                {isBSel ? "Selected" : "Select"}
                              </button>
                          }
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderTop: "1px solid var(--color-border-neutral-default)", flexShrink: 0 }}>
              <span style={{ flex: 1, fontSize: 12, color: "var(--color-text-subtitle)" }}>
                {browseSelected ? <><strong style={{ color: "var(--color-text-title)" }}>{NETWORKS.find(n => n.id === browseSelected)?.name}</strong> selected</> : "Select a network or agent to assign"}
              </span>
              <button onClick={() => setBrowseOpen(false)}
                style={{ background: "transparent", border: "1px solid var(--color-border-neutral-default)", color: "var(--color-text-subtitle)", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button disabled={!browseSelected}
                onClick={() => { if (browseSelected) { handleBrowseSelect(browseSelected); setBrowseSelected(null) } }}
                style={{ background: browseSelected ? "var(--primary)" : "var(--color-surface-neutral-default)", border: "none", color: browseSelected ? "#fff" : "var(--color-text-disabled)", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: browseSelected ? "pointer" : "not-allowed", fontFamily: "inherit" }}> {/* audit-ignore: #fff on primary — standard button pattern */}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
