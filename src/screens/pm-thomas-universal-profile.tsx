import { useState, useMemo } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout }     from "@/components/layouts/screen-layout"
import { WidgetCanvasView } from "@/components/layouts/widget-canvas-view"
import type { CanvasSlot }  from "@/components/layouts/widget-canvas-view"
import type { SidebarItem } from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { Button }           from "@/components/ui/button"
import { Tag }              from "@/components/ui/tag"
import { Tabs }             from "@/components/ui/tabs"
import { Table }            from "@/components/ui/table"
import type { TableColumn } from "@/components/ui/table"
import { Pagination }       from "@/components/ui/pagination"
import { EmptyState }       from "@/components/ui/empty-state"
import { HighlightIcon }    from "@/components/ui/highlight-icon"
import { CardContainer }    from "@/components/ui/card-container"
import { ModalDialog }      from "@/components/ui/modal-dialog"
import { Menu, MenuItem } from "@/components/ui/menu-item"

// ── Sidebar ───────────────────────────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

type EntityType = "person" | "employee" | "company"

type StudyStatus = "loaded" | "empty" | "error"

type UniversalProfile = {
  id:         string
  type:       EntityType
  name:       string
  subtitle:   string
  status:     "Active" | "Inactive" | "Archived"
  avatarIcon: string
  // Study data — null means no data (widget hidden), "error" means failed load
  governance: StudyStatus
  risk:       StudyStatus
  connections: StudyStatus
}

type ActivityEvent = {
  id:        string
  timestamp: string
  actor:     string
  action:    string
  target:    string
}

type LogEntry = {
  id:        string
  timestamp: string
  module:    string
  event:     string
  status:    "Success" | "Warning" | "Error" | "Info"
  details:   string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const PROFILES: UniversalProfile[] = [
  {
    id: "EMP-00412",
    type: "employee",
    name: "James Ortega",
    subtitle: "Operations · Manager: Lisa Park · EMP-00412",
    status: "Active",
    avatarIcon: "User",
    governance: "loaded",
    risk: "loaded",
    connections: "error",
  },
  {
    id: "PER-0091",
    type: "person",
    name: "Sarah Chen",
    subtitle: "Head of Compliance · Legal · sarah.chen@acme.com",
    status: "Active",
    avatarIcon: "User",
    governance: "loaded",
    risk: "empty",
    connections: "loaded",
  },
  {
    id: "ORG-0023",
    type: "company",
    name: "Meridian Corp",
    subtitle: "Financial Services · 2,400 employees · New York",
    status: "Active",
    avatarIcon: "Building2",
    governance: "loaded",
    risk: "loaded",
    connections: "empty",
  },
]

const ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: "a1",  timestamp: "Today, 10:42 AM",      actor: "Lisa Park",       action: "updated role",        target: "Senior Operations Lead"      },
  { id: "a2",  timestamp: "Today, 09:15 AM",       actor: "Governance Agent", action: "completed review",  target: "Q3 Compliance Check"          },
  { id: "a3",  timestamp: "Yesterday, 4:30 PM",    actor: "James Ortega",    action: "exported profile",    target: "PDF · Full export"            },
  { id: "a4",  timestamp: "Yesterday, 2:11 PM",    actor: "Risk Engine",     action: "flagged item",        target: "Missing document — Contract B" },
  { id: "a5",  timestamp: "Aug 12, 11:00 AM",      actor: "Lisa Park",       action: "added connection",    target: "Meridian Corp"                },
  { id: "a6",  timestamp: "Aug 11, 3:45 PM",       actor: "Admin",           action: "changed status",      target: "Active → Inactive → Active"   },
  { id: "a7",  timestamp: "Aug 10, 10:00 AM",      actor: "Governance Agent", action: "opened review",     target: "Annual Compliance Review"      },
  { id: "a8",  timestamp: "Aug 9, 9:20 AM",        actor: "Sarah Chen",      action: "linked profile",      target: "James Ortega"                 },
  { id: "a9",  timestamp: "Aug 8, 2:00 PM",        actor: "Risk Engine",     action: "cleared flag",        target: "Document uploaded successfully" },
  { id: "a10", timestamp: "Aug 7, 11:55 AM",       actor: "Admin",           action: "created profile",     target: "EMP-00412 · Operations"       },
  { id: "a11", timestamp: "Aug 6, 3:30 PM",        actor: "Governance Agent", action: "assigned policy",   target: "Data Handling Policy v2.1"    },
  { id: "a12", timestamp: "Aug 5, 9:00 AM",        actor: "Lisa Park",       action: "added note",          target: "Strong candidate for L8"      },
  { id: "a13", timestamp: "Aug 4, 4:15 PM",        actor: "Risk Engine",     action: "recalculated score",  target: "Risk score: 24 → 18"          },
  { id: "a14", timestamp: "Aug 3, 1:40 PM",        actor: "James Ortega",    action: "updated contact info", target: "Phone + emergency contact"  },
  { id: "a15", timestamp: "Aug 2, 10:30 AM",       actor: "Admin",           action: "merged duplicate",    target: "PER-0088 → EMP-00412"         },
  { id: "a16", timestamp: "Aug 1, 8:00 AM",        actor: "Governance Agent", action: "completed audit",    target: "Onboarding Audit 2026"        },
  { id: "a17", timestamp: "Jul 31, 5:00 PM",       actor: "Sarah Chen",      action: "approved request",    target: "Data access · Analytics team" },
  { id: "a18", timestamp: "Jul 30, 3:20 PM",       actor: "Risk Engine",     action: "created alert",       target: "Unusual login location"       },
  { id: "a19", timestamp: "Jul 29, 11:10 AM",      actor: "Admin",           action: "reset credentials",   target: "SSO + API key"                },
  { id: "a20", timestamp: "Jul 28, 2:45 PM",       actor: "Lisa Park",       action: "submitted review",    target: "Mid-year performance review"  },
]

const LOG_ENTRIES: LogEntry[] = [
  { id: "L001", timestamp: "2026-08-14 10:42", module: "Governance", event: "Role updated",              status: "Success", details: "Senior Operations Lead" },
  { id: "L002", timestamp: "2026-08-14 09:15", module: "Governance", event: "Compliance review passed",  status: "Success", details: "Q3 Compliance Check"  },
  { id: "L003", timestamp: "2026-08-13 16:30", module: "System",     event: "Profile exported",          status: "Info",    details: "PDF · Full export"     },
  { id: "L004", timestamp: "2026-08-13 14:11", module: "Risk",       event: "Document flag raised",      status: "Warning", details: "Contract B missing"    },
  { id: "L005", timestamp: "2026-08-12 11:00", module: "Connections", event: "Entity linked",            status: "Success", details: "Linked to Meridian Corp" },
  { id: "L006", timestamp: "2026-08-11 15:45", module: "System",     event: "Status changed",            status: "Info",    details: "Active → Inactive → Active" },
  { id: "L007", timestamp: "2026-08-10 10:00", module: "Governance", event: "Annual review opened",      status: "Info",    details: "Assigned to Governance Agent" },
  { id: "L008", timestamp: "2026-08-09 09:20", module: "Connections", event: "Profile linked",           status: "Success", details: "Linked to Sarah Chen"  },
  { id: "L009", timestamp: "2026-08-08 14:00", module: "Risk",       event: "Flag cleared",              status: "Success", details: "Document uploaded"     },
  { id: "L010", timestamp: "2026-08-07 11:55", module: "System",     event: "Profile created",           status: "Info",    details: "EMP-00412 · Operations" },
  { id: "L011", timestamp: "2026-08-06 15:30", module: "Governance", event: "Policy assigned",           status: "Success", details: "Data Handling Policy v2.1" },
  { id: "L012", timestamp: "2026-08-05 09:00", module: "System",     event: "Note added",                status: "Info",    details: "Strong candidate for L8" },
  { id: "L013", timestamp: "2026-08-04 16:15", module: "Risk",       event: "Risk score recalculated",   status: "Info",    details: "24 → 18"               },
  { id: "L014", timestamp: "2026-08-03 13:40", module: "System",     event: "Contact info updated",      status: "Info",    details: "Phone + emergency contact" },
  { id: "L015", timestamp: "2026-08-02 10:30", module: "System",     event: "Duplicate merged",          status: "Success", details: "PER-0088 → EMP-00412"  },
  { id: "L016", timestamp: "2026-08-01 08:00", module: "Governance", event: "Onboarding audit completed", status: "Success", details: "All checks passed"    },
  { id: "L017", timestamp: "2026-07-31 17:00", module: "System",     event: "Access request approved",   status: "Success", details: "Analytics team · Data access" },
  { id: "L018", timestamp: "2026-07-30 15:20", module: "Risk",       event: "Alert created",             status: "Warning", details: "Unusual login location" },
  { id: "L019", timestamp: "2026-07-29 11:10", module: "System",     event: "Credentials reset",         status: "Info",    details: "SSO + API key"         },
  { id: "L020", timestamp: "2026-07-28 14:45", module: "Governance", event: "Performance review submitted", status: "Info", details: "Mid-year review"      },
  { id: "L021", timestamp: "2026-07-27 10:00", module: "Risk",       event: "Periodic scan completed",   status: "Success", details: "No new flags"          },
  { id: "L022", timestamp: "2026-07-26 09:30", module: "Governance", event: "Training completed",        status: "Success", details: "Data Privacy 2026"     },
  { id: "L023", timestamp: "2026-07-25 14:00", module: "Connections", event: "Organization linked",      status: "Success", details: "Linked to Acme Corp HQ" },
  { id: "L024", timestamp: "2026-07-24 11:20", module: "Risk",       event: "Document uploaded",         status: "Info",    details: "Contract A · signed"   },
  { id: "L025", timestamp: "2026-07-23 16:45", module: "System",     event: "Profile viewed",            status: "Info",    details: "Viewed by Lisa Park"   },
  { id: "L026", timestamp: "2026-07-22 13:30", module: "Governance", event: "Policy acknowledged",       status: "Success", details: "Acceptable Use Policy" },
  { id: "L027", timestamp: "2026-07-21 10:15", module: "Risk",       event: "Score threshold met",       status: "Success", details: "Risk score below 25"   },
  { id: "L028", timestamp: "2026-07-20 09:00", module: "System",     event: "Access granted",            status: "Info",    details: "Operations dashboard"  },
  { id: "L029", timestamp: "2026-07-19 15:00", module: "Governance", event: "Review reminder sent",      status: "Info",    details: "Annual review due Aug 10" },
  { id: "L030", timestamp: "2026-07-18 11:40", module: "Connections", event: "Connection request accepted", status: "Success", details: "From: Sarah Chen" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_TAG: Record<UniversalProfile["status"], "success" | "neutral" | "error"> = {
  Active:   "success",
  Inactive: "neutral",
  Archived: "error",
}

const TYPE_LABEL: Record<EntityType, string> = {
  person:   "Person",
  employee: "Employee",
  company:  "Company",
}

const TYPE_TAG_VARIANT: Record<EntityType, "informative" | "purple" | "neutral"> = {
  person:   "informative",
  employee: "purple",
  company:  "neutral",
}

// Study widget wrapper — shows error state, hidden when no data (empty)
function StudyWidget({ title, status, children }: { title: string; status: StudyStatus; children: React.ReactNode }) {
  if (status === "empty") return null

  if (status === "error") {
    return (
      <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-error-default)" }}>
          <LucideIcons.AlertCircle size={14} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>Failed to load</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{title} data couldn't be retrieved.</span>
        <button
          style={{
            alignSelf: "flex-start", fontSize: 12, fontWeight: 500,
            color: "var(--primary)", border: "none", background: "none",
            cursor: "pointer", padding: 0,
          }}
          onClick={() => {}} // DS-GAP: wire to retry handler
        >
          Retry
        </button>
      </div>
    )
  }

  return <>{children}</>
}

// ── Governance study widget content ──────────────────────────────────────────

function GovernanceContent() {
  const items = [
    { label: "Compliance Score",  value: "94 / 100",    icon: "ShieldCheck",  variant: "success"     as const },
    { label: "Open Reviews",      value: "1",           icon: "ClipboardList", variant: "alert"      as const },
    { label: "Policies Signed",   value: "12 of 12",    icon: "FileCheck2",   variant: "success"     as const },
    { label: "Last Audit",        value: "Aug 10, 2026", icon: "CalendarCheck", variant: "informative" as const },
  ]
  return (
    <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map(item => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{item.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <HighlightIcon size="sm" variant={item.variant} iconName={item.icon} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Risk study widget content ─────────────────────────────────────────────────

function RiskContent() {
  return (
    <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>Risk Score</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <HighlightIcon size="sm" variant="success" iconName="TrendingDown" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>18 / 100</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>Open Flags</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <HighlightIcon size="sm" variant="neutral" iconName="Flag" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>0</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>Last Scan</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <HighlightIcon size="sm" variant="informative" iconName="ScanLine" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Jul 27, 2026</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>Trend</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <HighlightIcon size="sm" variant="success" iconName="ArrowDownRight" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>↓ 24 → 18</span>
        </div>
      </div>
    </div>
  )
}

// ── Connections study widget content ──────────────────────────────────────────

function ConnectionsContent() {
  const connections = [
    { name: "Meridian Corp",    type: "Organization", icon: "Building2" },
    { name: "Sarah Chen",       type: "Person",       icon: "User"      },
    { name: "Operations Team",  type: "Team",         icon: "Users"     },
  ]
  return (
    <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      {connections.map(c => (
        <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HighlightIcon size="sm" variant="neutral" iconName={c.icon} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{c.name}</span>
            <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>{c.type}</span>
          </div>
        </div>
      ))}
      <button style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 500, color: "var(--primary)", border: "none", background: "none", cursor: "pointer", padding: 0, marginTop: 2 }}>
        View all connections
      </button>
    </div>
  )
}

// ── Table columns ─────────────────────────────────────────────────────────────

const ACTIVITY_COLS: TableColumn<ActivityEvent>[] = [
  { key: "timestamp", header: "When",   render: r => <span style={{ fontSize: 12, color: "var(--field-supporting)", whiteSpace: "nowrap" }}>{r.timestamp}</span> },
  { key: "actor",     header: "By",     render: r => <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{r.actor}</span> },
  { key: "action",    header: "Action", render: r => <span style={{ fontSize: 12, color: "var(--foreground)" }}>{r.action}</span> },
  { key: "target",    header: "Target", render: r => <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{r.target}</span> },
]

const LOGS_COLS: TableColumn<LogEntry>[] = [
  { key: "timestamp", header: "Timestamp", render: r => <span style={{ fontSize: 12, color: "var(--field-supporting)", whiteSpace: "nowrap" }}>{r.timestamp}</span> },
  { key: "module",    header: "Module",    render: r => <Tag variant="neutral" size="sm">{r.module}</Tag> },
  { key: "event",     header: "Event",     render: r => <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{r.event}</span> },
  {
    key: "status", header: "Status",
    render: r => {
      const map: Record<LogEntry["status"], "success" | "alert" | "error" | "informative"> = {
        Success: "success", Warning: "alert", Error: "error", Info: "informative",
      }
      return <Tag variant={map[r.status]} size="sm">{r.status}</Tag>
    },
  },
  { key: "details",   header: "Details",  render: r => <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{r.details}</span> },
]

// ── Profile detail view ───────────────────────────────────────────────────────

function ProfileDetailView({ profile, onBack }: { profile: UniversalProfile; onBack: () => void }) {
  const [tab,          setTab]          = useState<"overview" | "activity" | "logs">("overview")
  const [logsPage,     setLogsPage]     = useState(1)
  const [logsPageSize, setLogsPageSize] = useState(10)
  const [showArchive,  setShowArchive]  = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)

  const pagedLogs = useMemo(
    () => LOG_ENTRIES.slice((logsPage - 1) * logsPageSize, logsPage * logsPageSize),
    [logsPage, logsPageSize],
  )

  // Build Overview canvas slots — only include studies with data (hide empty)
  const overviewSlots = useMemo<CanvasSlot[]>(() => {
    const slots: CanvasSlot[] = [
      // Summary KPI — always shown
      {
        uid: "entity-summary", title: "Profile Summary", colSpan: 1,
        content: (
          <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HighlightIcon size="lg" variant="informative" iconName={profile.avatarIcon} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{profile.name}</div>
                <div style={{ fontSize: 11, color: "var(--field-supporting)", marginTop: 2 }}>{profile.subtitle}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <Tag variant={STATUS_TAG[profile.status]} size="sm">{profile.status}</Tag>
              <Tag variant={TYPE_TAG_VARIANT[profile.type]} size="sm">{TYPE_LABEL[profile.type]}</Tag>
            </div>
          </div>
        ),
      },
    ]

    // Governance — hide if empty, show error if failed
    if (profile.governance !== "empty") {
      slots.push({
        uid: "governance", title: "Governance", colSpan: 1,
        content: (
          <StudyWidget title="Governance" status={profile.governance}>
            <GovernanceContent />
          </StudyWidget>
        ),
      })
    }

    // Risk — hide if empty, show error if failed
    if (profile.risk !== "empty") {
      slots.push({
        uid: "risk", title: "Risk", colSpan: 1,
        content: (
          <StudyWidget title="Risk" status={profile.risk}>
            <RiskContent />
          </StudyWidget>
        ),
      })
    }

    // Connections — hide if empty, show error if failed
    if (profile.connections !== "empty") {
      slots.push({
        uid: "connections", title: "Connections", colSpan: 1,
        content: (
          <StudyWidget title="Connections" status={profile.connections}>
            <ConnectionsContent />
          </StudyWidget>
        ),
      })
    }

    return slots
  }, [profile])

  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas González"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="data"
      header={(isScrolled) => (
        <div>
          {!isScrolled && (
            <button
              onClick={onBack}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                border: "none", background: "none", cursor: "pointer",
                padding: "0 0 6px 0", color: "var(--primary)",
              }}
            >
              <LucideIcons.ChevronLeft size={13} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>Profiles</span>
            </button>
          )}
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title={profile.name}
            description={profile.subtitle}
            tag={<Tag variant={STATUS_TAG[profile.status]} size="sm">{profile.status}</Tag>}
            primaryAction={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => {}}>
                  <LucideIcons.Download size={13} /> Export
                </Button>
                <Button variant="main" size="sm" onClick={() => {}}>
                  <LucideIcons.Pencil size={13} /> Edit Profile
                </Button>
                {/* Kebab — Archive only for person + employee, not company */}
                {/* DS-GAP: RBAC — archive visibility should depend on user role */}
                {profile.type !== "company" && (
                  <div style={{ position: "relative" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setMenuOpen(o => !o)}
                    >
                      <LucideIcons.MoreHorizontal size={14} />
                    </Button>
                    {menuOpen && (
                      <div
                        style={{
                          position: "fixed",
                          zIndex: 10001,
                          minWidth: 180,
                          background: "var(--surface)",
                          border: "0.5px solid var(--field-border)",
                          boxShadow: "var(--shadow-elevation-3)",
                          borderRadius: 8,
                          padding: "4px 0",
                        }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Menu>
                          <MenuItem
                            leadingIcon={<LucideIcons.Archive size={14} />}
                            label="Archive"
                            size="sm"
                            onClick={() => { setMenuOpen(false); setShowArchive(true) }}
                          />
                        </Menu>
                      </div>
                    )}
                  </div>
                )}
              </div>
            }
          />
        </div>
      )}
      pagination={
        tab === "logs" && LOG_ENTRIES.length > logsPageSize
          ? (
              <Pagination
                currentPage={logsPage}
                totalItems={LOG_ENTRIES.length}
                itemsPerPage={logsPageSize}
                onPageChange={setLogsPage}
                onItemsPerPageChange={n => { setLogsPageSize(n); setLogsPage(1) }}
                rowsPerPageOptions={[10, 25, 50]}
              />
            )
          : undefined
      }
    >
      <Tabs
        items={[
          { id: "overview",  label: "Overview"  },
          { id: "activity",  label: "Activity"  },
          { id: "logs",      label: "Logs"      },
        ]}
        activeId={tab}
        onChange={(id) => { setTab(id as typeof tab); setLogsPage(1) }}
        className="mb-[24px]"
      />

      {/* ── Overview — Widget Canvas with study widgets ── */}
      {tab === "overview" && (
        overviewSlots.length > 1
          ? <WidgetCanvasView initialSlots={overviewSlots} />
          : (
              <EmptyState
                icon={LucideIcons.LayoutDashboard}
                title="No study data yet"
                description="Data from Governance, Risk, and Connections will appear here once available."
              />
            )
      )}

      {/* ── Activity — last 20 events, no pagination per spec ── */}
      {tab === "activity" && (
        ACTIVITY_EVENTS.length > 0
          ? (
              <Table
                columns={ACTIVITY_COLS}
                data={ACTIVITY_EVENTS}
                size="sm"
                emptyTitle="No activity yet"
                emptyDescription="Events from Governance, Risk, and Connections will appear here."
              />
            )
          : (
              <EmptyState
                icon={LucideIcons.Activity}
                title="No activity yet"
                description="Events from Governance, Risk, and Connections will appear here once the profile has data."
              />
            )
      )}

      {/* ── Logs — paginated, page size 10 ── */}
      {tab === "logs" && (
        LOG_ENTRIES.length > 0
          ? (
              <Table
                columns={LOGS_COLS}
                data={pagedLogs}
                size="sm"
                emptyTitle="No logs yet"
                emptyDescription="System and module events will appear here."
              />
            )
          : (
              <EmptyState
                icon={LucideIcons.ScrollText}
                title="No logs yet"
                description="System events and module changes will be logged here."
              />
            )
      )}

      {/* ── Archive confirmation modal — person + employee only ── */}
      <ModalDialog
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        tone="warning"
        iconName="Archive"
        title={`Archive ${profile.name}?`}
        description="This profile will be archived and removed from active views. You can restore it later from the archived profiles list."
        ctaPrimary={{ label: "Archive", onClick: () => setShowArchive(false) }}
        ctaSecondary={{ label: "Cancel", onClick: () => setShowArchive(false) }}
      />
    </ScreenLayout>
  )
}

// ── Main screen — profile selector ───────────────────────────────────────────

export default function PMThomasUniversalProfileScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = PROFILES.find(p => p.id === selectedId)

  if (selected) {
    return <ProfileDetailView profile={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas González"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="data"
      header={() => (
        <Header
          size="size-l"
          title="Universal Profiles"
          description="Unified view of people, employees, and companies across AIMS OS studies."
        />
      )}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PROFILES.map(profile => (
          <CardContainer
            key={profile.id}
            variant="default"
            className="cursor-pointer hover:border-[var(--card-primary-hover-bd)] transition-colors"
            onClick={() => setSelectedId(profile.id)}
          >
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <HighlightIcon size="lg" variant="informative" iconName={profile.avatarIcon} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{profile.name}</div>
                  <div style={{ fontSize: 12, color: "var(--field-supporting)", marginTop: 2 }}>{profile.subtitle}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tag variant={TYPE_TAG_VARIANT[profile.type]} size="sm">{TYPE_LABEL[profile.type]}</Tag>
                <Tag variant={STATUS_TAG[profile.status]} size="sm">{profile.status}</Tag>
                <LucideIcons.ChevronRight size={14} style={{ color: "var(--field-supporting)" }} />
              </div>
            </div>
          </CardContainer>
        ))}
      </div>
    </ScreenLayout>
  )
}
