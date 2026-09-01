import { useState, useMemo, useRef, useEffect } from "react"
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
import { Menu, MenuItem }   from "@/components/ui/menu-item"
import { RecordHeader }     from "@/components/ui/record-header"
import type { CustomerRecord, EmployeeRecord, NextBestAction } from "@/components/ui/record-header"
import { SlideOut }         from "@/components/ui/slide-out"
import { Input }            from "@/components/ui/input"
import type { LucideIcon }  from "lucide-react"

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
  governance:  StudyStatus
  risk:        StudyStatus
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
  { id: "a1",  timestamp: "Today, 10:42 AM",      actor: "Lisa Park",        action: "updated role",         target: "Senior Operations Lead"      },
  { id: "a2",  timestamp: "Today, 09:15 AM",       actor: "Governance Agent", action: "completed review",     target: "Q3 Compliance Check"          },
  { id: "a3",  timestamp: "Yesterday, 4:30 PM",    actor: "James Ortega",     action: "exported profile",     target: "PDF · Full export"            },
  { id: "a4",  timestamp: "Yesterday, 2:11 PM",    actor: "Risk Engine",      action: "flagged item",         target: "Missing document — Contract B" },
  { id: "a5",  timestamp: "Aug 12, 11:00 AM",      actor: "Lisa Park",        action: "added connection",     target: "Meridian Corp"                },
  { id: "a6",  timestamp: "Aug 11, 3:45 PM",       actor: "Admin",            action: "changed status",       target: "Active → Inactive → Active"   },
  { id: "a7",  timestamp: "Aug 10, 10:00 AM",      actor: "Governance Agent", action: "opened review",        target: "Annual Compliance Review"      },
  { id: "a8",  timestamp: "Aug 9, 9:20 AM",        actor: "Sarah Chen",       action: "linked profile",       target: "James Ortega"                 },
  { id: "a9",  timestamp: "Aug 8, 2:00 PM",        actor: "Risk Engine",      action: "cleared flag",         target: "Document uploaded successfully" },
  { id: "a10", timestamp: "Aug 7, 11:55 AM",       actor: "Admin",            action: "created profile",      target: "EMP-00412 · Operations"       },
  { id: "a11", timestamp: "Aug 6, 3:30 PM",        actor: "Governance Agent", action: "assigned policy",      target: "Data Handling Policy v2.1"    },
  { id: "a12", timestamp: "Aug 5, 9:00 AM",        actor: "Lisa Park",        action: "added note",           target: "Strong candidate for L8"      },
  { id: "a13", timestamp: "Aug 4, 4:15 PM",        actor: "Risk Engine",      action: "recalculated score",   target: "Risk score: 24 → 18"          },
  { id: "a14", timestamp: "Aug 3, 1:40 PM",        actor: "James Ortega",     action: "updated contact info", target: "Phone + emergency contact"    },
  { id: "a15", timestamp: "Aug 2, 10:30 AM",       actor: "Admin",            action: "merged duplicate",     target: "PER-0088 → EMP-00412"         },
  { id: "a16", timestamp: "Aug 1, 8:00 AM",        actor: "Governance Agent", action: "completed audit",      target: "Onboarding Audit 2026"        },
  { id: "a17", timestamp: "Jul 31, 5:00 PM",       actor: "Sarah Chen",       action: "approved request",     target: "Data access · Analytics team" },
  { id: "a18", timestamp: "Jul 30, 3:20 PM",       actor: "Risk Engine",      action: "created alert",        target: "Unusual login location"       },
  { id: "a19", timestamp: "Jul 29, 11:10 AM",      actor: "Admin",            action: "reset credentials",    target: "SSO + API key"                },
  { id: "a20", timestamp: "Jul 28, 2:45 PM",       actor: "Lisa Park",        action: "submitted review",     target: "Mid-year performance review"  },
]

const LOG_ENTRIES: LogEntry[] = [
  { id: "L001", timestamp: "2026-08-14 10:42", module: "Governance",  event: "Role updated",               status: "Success", details: "Senior Operations Lead"       },
  { id: "L002", timestamp: "2026-08-14 09:15", module: "Governance",  event: "Compliance review passed",   status: "Success", details: "Q3 Compliance Check"          },
  { id: "L003", timestamp: "2026-08-13 16:30", module: "System",      event: "Profile exported",           status: "Info",    details: "PDF · Full export"            },
  { id: "L004", timestamp: "2026-08-13 14:11", module: "Risk",        event: "Document flag raised",       status: "Warning", details: "Contract B missing"           },
  { id: "L005", timestamp: "2026-08-12 11:00", module: "Connections", event: "Entity linked",              status: "Success", details: "Linked to Meridian Corp"      },
  { id: "L006", timestamp: "2026-08-11 15:45", module: "System",      event: "Status changed",             status: "Info",    details: "Active → Inactive → Active"   },
  { id: "L007", timestamp: "2026-08-10 10:00", module: "Governance",  event: "Annual review opened",       status: "Info",    details: "Assigned to Governance Agent" },
  { id: "L008", timestamp: "2026-08-09 09:20", module: "Connections", event: "Profile linked",             status: "Success", details: "Linked to Sarah Chen"         },
  { id: "L009", timestamp: "2026-08-08 14:00", module: "Risk",        event: "Flag cleared",               status: "Success", details: "Document uploaded"            },
  { id: "L010", timestamp: "2026-08-07 11:55", module: "System",      event: "Profile created",            status: "Info",    details: "EMP-00412 · Operations"       },
  { id: "L011", timestamp: "2026-08-06 15:30", module: "Governance",  event: "Policy assigned",            status: "Success", details: "Data Handling Policy v2.1"    },
  { id: "L012", timestamp: "2026-08-05 09:00", module: "System",      event: "Note added",                 status: "Info",    details: "Strong candidate for L8"      },
  { id: "L013", timestamp: "2026-08-04 16:15", module: "Risk",        event: "Risk score recalculated",    status: "Info",    details: "24 → 18"                      },
  { id: "L014", timestamp: "2026-08-03 13:40", module: "System",      event: "Contact info updated",       status: "Info",    details: "Phone + emergency contact"    },
  { id: "L015", timestamp: "2026-08-02 10:30", module: "System",      event: "Duplicate merged",           status: "Success", details: "PER-0088 → EMP-00412"         },
  { id: "L016", timestamp: "2026-08-01 08:00", module: "Governance",  event: "Onboarding audit completed", status: "Success", details: "All checks passed"            },
  { id: "L017", timestamp: "2026-07-31 17:00", module: "System",      event: "Access request approved",    status: "Success", details: "Analytics team · Data access"  },
  { id: "L018", timestamp: "2026-07-30 15:20", module: "Risk",        event: "Alert created",              status: "Warning", details: "Unusual login location"        },
  { id: "L019", timestamp: "2026-07-29 11:10", module: "System",      event: "Credentials reset",          status: "Info",    details: "SSO + API key"                },
  { id: "L020", timestamp: "2026-07-28 14:45", module: "Governance",  event: "Performance review submitted", status: "Info", details: "Mid-year review"              },
  { id: "L021", timestamp: "2026-07-27 10:00", module: "Risk",        event: "Periodic scan completed",    status: "Success", details: "No new flags"                 },
  { id: "L022", timestamp: "2026-07-26 09:30", module: "Governance",  event: "Training completed",         status: "Success", details: "Data Privacy 2026"            },
  { id: "L023", timestamp: "2026-07-25 14:00", module: "Connections", event: "Organization linked",        status: "Success", details: "Linked to Acme Corp HQ"       },
  { id: "L024", timestamp: "2026-07-24 11:20", module: "Risk",        event: "Document uploaded",          status: "Info",    details: "Contract A · signed"          },
  { id: "L025", timestamp: "2026-07-23 16:45", module: "System",      event: "Profile viewed",             status: "Info",    details: "Viewed by Lisa Park"          },
  { id: "L026", timestamp: "2026-07-22 13:30", module: "Governance",  event: "Policy acknowledged",        status: "Success", details: "Acceptable Use Policy"        },
  { id: "L027", timestamp: "2026-07-21 10:15", module: "Risk",        event: "Score threshold met",        status: "Success", details: "Risk score below 25"          },
  { id: "L028", timestamp: "2026-07-20 09:00", module: "System",      event: "Access granted",             status: "Info",    details: "Operations dashboard"         },
  { id: "L029", timestamp: "2026-07-19 15:00", module: "Governance",  event: "Review reminder sent",       status: "Info",    details: "Annual review due Aug 10"     },
  { id: "L030", timestamp: "2026-07-18 11:40", module: "Connections", event: "Connection request accepted", status: "Success", details: "From: Sarah Chen"            },
]

// ── Secondary entity types ────────────────────────────────────────────────────

interface SecondaryEntity {
  id: string
  name: string
  meta: string
  statusLabel: string
  statusVariant: "success" | "alert" | "error" | "informative" | "neutral"
}

const SECONDARY_ENTITIES: Record<string, SecondaryEntity[]> = {
  Locations: [
    { id: "loc-1", name: "Phoenix Medical Center",     meta: "Phoenix, AZ · 127 staff",    statusLabel: "Network sync interrupted",   statusVariant: "error"       },
    { id: "loc-2", name: "Tempe Outpatient Clinic",    meta: "Tempe, AZ · 62 staff",       statusLabel: "Network connection pending", statusVariant: "alert"       },
    { id: "loc-3", name: "Scottsdale North Clinic",    meta: "Scottsdale, AZ · 94 staff",  statusLabel: "Fully synced",              statusVariant: "success"     },
    { id: "loc-4", name: "Mesa Rehabilitation Center", meta: "Mesa, AZ · 211 staff",       statusLabel: "Fully synced",              statusVariant: "success"     },
    { id: "loc-5", name: "Chandler Specialty Clinic",  meta: "Chandler, AZ · 45 staff",    statusLabel: "Fully synced",              statusVariant: "success"     },
  ],
  Contacts: [
    { id: "con-1", name: "Sandra Torres", meta: "VP of Operations · sandra.torres@meridian.com", statusLabel: "Active",   statusVariant: "success" },
    { id: "con-2", name: "David Park",    meta: "IT Director · david.park@meridian.com",         statusLabel: "Active",   statusVariant: "success" },
    { id: "con-3", name: "Amy Chen",      meta: "CFO · amy.chen@meridian.com",                   statusLabel: "Inactive", statusVariant: "neutral" },
  ],
  Deals: [
    { id: "deal-1", name: "Meridian Enterprise Renewal 2026",  meta: "$480K · Renewal · Closes Sep 2026",      statusLabel: "In negotiation", statusVariant: "alert"       },
    { id: "deal-2", name: "Platform Expansion — West Coast",   meta: "$220K · New business · Closes Nov 2026", statusLabel: "Proposal sent",  statusVariant: "informative" },
  ],
  AI:        [],
  Documents: [],
}

const ENTITY_TYPE_OPTIONS: Record<EntityType, { label: string; iconName: string; description: string }[]> = {
  company: [
    { label: "Locations",  iconName: "MapPin",    description: "Physical sites and facilities"        },
    { label: "Contacts",   iconName: "UserRound", description: "People at this account"              },
    { label: "Deals",      iconName: "Briefcase", description: "Active and past deals"               },
    { label: "AI",         iconName: "Brain",     description: "Sessions, insights, and summaries"   },
    { label: "Documents",  iconName: "FileText",  description: "Uploaded files and attachments"      },
  ],
  person: [
    { label: "Deals",      iconName: "Briefcase", description: "Deals this contact is part of"       },
    { label: "AI",         iconName: "Brain",     description: "Sessions, insights, and summaries"   },
    { label: "Documents",  iconName: "FileText",  description: "Uploaded files and attachments"      },
  ],
  employee: [
    { label: "AI",         iconName: "Brain",     description: "Sessions, insights, and summaries"   },
    { label: "Documents",  iconName: "FileText",  description: "Uploaded files and attachments"      },
  ],
}

const PROFILE_SIGNALS: Record<string, NextBestAction> = {
  "EMP-00412": { severity: "alert",       label: "1 performance review pending approval",     dueContext: "Due in 3 days" },
  "PER-0091":  { severity: "informative", label: "Compliance certification expiring soon",    dueContext: "Expires Sep 15" },
  "ORG-0023":  { severity: "alert",       label: "Renewal in 12 days — health dropped to 61", dueContext: "Closes Sep 5"  },
}

function buildRecordHeaderData(profile: UniversalProfile): {
  variant: "employee" | "customer" | "client"
  data: CustomerRecord | EmployeeRecord
} {
  if (profile.type === "company") {
    const data: CustomerRecord = {
      accountName:    profile.name,
      segment:        profile.subtitle.split(" · ")[0] ?? "—",
      owner:          "Priya Nair",
      tier:           "Enterprise",
      renewalDate:    "Sep 5, 2026",
      mrr:            "$480K",
      lastContact:    "Aug 22, 2026",
      openTickets:    3,
      adoptionLevel:  "High",
      industry:       "Financial Services",
      primaryContact: "Sandra Torres",
    }
    return { variant: "customer", data }
  }
  // employee or person
  const data: EmployeeRecord = {
    name:       profile.name,
    role:       profile.subtitle.split(" · ")[0] ?? "—",
    department: profile.subtitle.split(" · ")[1] ?? "—",
    manager:    "Lisa Park",
    location:   "Remote",
    email:      profile.name.toLowerCase().replace(" ", ".") + "@acme.com",
    phone:      "+1 (602) 555-0100",
    startDate:  "Jan 12, 2022",
    team:       "Operations",
    accessRole: "Standard",
  }
  return { variant: "employee", data }
}

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
    { label: "Compliance Score",  value: "94 / 100",     icon: "ShieldCheck",   variant: "success"     as const },
    { label: "Open Reviews",      value: "1",            icon: "ClipboardList", variant: "alert"       as const },
    { label: "Policies Signed",   value: "12 of 12",     icon: "FileCheck2",    variant: "success"     as const },
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
    { name: "Meridian Corp",   type: "Organization", icon: "Building2" },
    { name: "Sarah Chen",      type: "Person",       icon: "User"      },
    { name: "Operations Team", type: "Team",         icon: "Users"     },
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
  { key: "details", header: "Details", render: r => <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{r.details}</span> },
]

// ── Profile detail view ───────────────────────────────────────────────────────

function ProfileDetailView({ profile, onBack }: { profile: UniversalProfile; onBack: () => void }) {
  const [tab,          setTab]          = useState<string>("overview")
  const [logsPage,     setLogsPage]     = useState(1)
  const [logsPageSize, setLogsPageSize] = useState(10)
  const [showArchive,  setShowArchive]  = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userTabs,     setUserTabs]     = useState<string[]>([])
  const [tabPickerOpen, setTabPickerOpen] = useState(false)
  const [entityPreview, setEntityPreview] = useState<SecondaryEntity | null>(null)
  const [entitySearch,  setEntitySearch]  = useState("")

  const tabPickerRef = useRef<HTMLDivElement>(null)

  // Close tab picker on outside click
  useEffect(() => {
    if (!tabPickerOpen) return
    const handler = (e: MouseEvent) => {
      if (tabPickerRef.current && !tabPickerRef.current.contains(e.target as Node)) {
        setTabPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [tabPickerOpen])

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

  // RecordHeader data
  const { variant: rhVariant, data: rhData } = buildRecordHeaderData(profile)
  const signal = PROFILE_SIGNALS[profile.id] ?? { severity: "neutral" as const, label: "No active recommendations" }

  // Available entity type options for the "+" picker (filter already-added tabs)
  const availableOptions = (ENTITY_TYPE_OPTIONS[profile.type] ?? []).filter(
    opt => !userTabs.includes(opt.label),
  )

  // Full tab list: base + user-added
  const allTabItems = [
    { id: "overview",  label: "Overview"  },
    { id: "activity",  label: "Activity"  },
    { id: "logs",      label: "Logs"      },
    ...userTabs.map(t => ({ id: t, label: t })),
  ]

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
      {/* ── RecordHeader — lean identity card with NBA signal ── */}
      <RecordHeader
        variant={rhVariant}
        data={rhData}
        signal={signal}
        actions={[
          { label: "Export",  variant: "secondary", onClick: () => {} },
          { label: profile.type === "company" ? "Contact account" : "Message", variant: "primary", onClick: () => {} },
        ]}
        assignedAgent={{ id: "agent-1", name: "AIMS Assistant", onOpenChat: () => {} }}
        className="mb-[16px]"
      />

      {/* ── Tabs row + "+" entity-type picker ── */}
      <div className="flex items-center gap-[8px] mb-[24px]">
        <Tabs
          items={allTabItems}
          activeId={tab}
          onChange={(id) => { setTab(id); setLogsPage(1); setEntitySearch("") }}
        />
        {availableOptions.length > 0 && (
          <div ref={tabPickerRef} style={{ position: "relative" }}>
            <Button
              variant="tertiary"
              size="sm"
              iconPosition="alone"
              icon={<LucideIcons.Plus size={14} />}
              onClick={() => setTabPickerOpen(o => !o)}
              aria-label="Add tab"
            />
            {tabPickerOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 200,
                  minWidth: 240,
                  background: "var(--surface)",
                  border: "0.5px solid var(--field-border)",
                  borderRadius: 10,
                  boxShadow: "var(--shadow-elevation-3)",
                  padding: "6px 0",
                  marginTop: 4,
                }}
              >
                <div style={{ padding: "6px 12px 4px", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--field-supporting)" }}>
                  Add tab
                </div>
                {availableOptions.map(opt => {
                  const Icon = (LucideIcons as Record<string, unknown>)[opt.iconName] as LucideIcon | undefined
                  return (
                    <button
                      key={opt.label}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "8px 12px",
                        background: "none", border: "none", cursor: "pointer",
                        textAlign: "left",
                      }}
                      onClick={() => {
                        setUserTabs(t => [...t, opt.label])
                        setTab(opt.label)
                        setTabPickerOpen(false)
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--hover)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      {Icon && <Icon size={14} strokeWidth={1.75} style={{ color: "var(--field-supporting)" }} />}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: "var(--field-supporting)" }}>{opt.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Overview — Widget Canvas with study widgets (or context cards when no study data) ── */}
      {tab === "overview" && (
        overviewSlots.length > 1
          ? <WidgetCanvasView initialSlots={overviewSlots} />
          : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--field-supporting)", marginBottom: 4 }}>
                  Context — What needs attention
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Next Best Action",  value: "Schedule renewal call",   meta: "Renewal in 12 days",        iconName: "Zap",       variant: "alert"       as const },
                    { label: "Active Workflow",   value: "Q3 Compliance Review",    meta: "Step 3 of 5 · In progress", iconName: "GitBranch", variant: "informative" as const },
                    { label: "Last Agent Run",    value: "Risk Score Agent",        meta: "Completed · Aug 24, 2026",  iconName: "Bot",       variant: "success"     as const },
                    { label: "Pending Review",    value: "Data Access Request",     meta: "Waiting for approval",      iconName: "Clock",     variant: "neutral"     as const },
                  ].map(card => (
                    <CardContainer key={card.label} variant="default">
                      <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</span>
                          <HighlightIcon size="sm" variant={card.variant} iconName={card.iconName} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.3 }}>{card.value}</div>
                        <div style={{ fontSize: 11, color: "var(--field-supporting)" }}>{card.meta}</div>
                      </div>
                    </CardContainer>
                  ))}
                </div>
                <EmptyState
                  icon={LucideIcons.LayoutDashboard}
                  title="No study data yet"
                  description="Data from Governance, Risk, and Connections will appear here once available."
                />
              </div>
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

      {/* ── Secondary entity tabs ── */}
      {userTabs.includes(tab) && (() => {
        const entities = (SECONDARY_ENTITIES[tab] ?? []).filter(e =>
          entitySearch === "" ||
          e.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
          e.meta.toLowerCase().includes(entitySearch.toLowerCase()),
        )
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input
              placeholder={`Search ${tab.toLowerCase()}...`}
              value={entitySearch}
              onChange={e => setEntitySearch(e.target.value)}
            />
            {entities.length === 0 ? (
              <EmptyState
                icon={LucideIcons.Search}
                title={entitySearch ? "No results" : `No ${tab.toLowerCase()} yet`}
                description={entitySearch
                  ? `No ${tab.toLowerCase()} match "${entitySearch}".`
                  : `${tab} associated with this profile will appear here.`
                }
              />
            ) : (
              entities.map(entity => (
                <CardContainer
                  key={entity.id}
                  variant="default"
                  className="cursor-pointer hover:border-[var(--card-primary-hover-bd)] transition-colors"
                  onClick={() => setEntityPreview(entity)}
                >
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{entity.name}</div>
                      <div style={{ fontSize: 12, color: "var(--field-supporting)", marginTop: 2 }}>{entity.meta}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Tag variant={entity.statusVariant} size="sm">{entity.statusLabel}</Tag>
                      <LucideIcons.Eye size={14} style={{ color: "var(--field-supporting)" }} />
                    </div>
                  </div>
                </CardContainer>
              ))
            )}
          </div>
        )
      })()}

      {/* ── Secondary entity slide-out ── */}
      <SlideOut
        open={entityPreview !== null}
        onClose={() => setEntityPreview(null)}
        type="full-slot"
        title={entityPreview?.name ?? ""}
        subtitle={entityPreview?.meta}
        showTopButton={true}
        topButtonIcon={<LucideIcons.ExternalLink size={14} />}
        onTopButtonClick={() => setEntityPreview(null)}
      >
        {entityPreview && (
          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HighlightIcon size="lg" variant="informative" iconName="Building2" />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>{entityPreview.name}</div>
                <div style={{ fontSize: 12, color: "var(--field-supporting)", marginTop: 2 }}>{entityPreview.meta}</div>
              </div>
            </div>
            <Tag variant={entityPreview.statusVariant} size="sm">{entityPreview.statusLabel}</Tag>
            <div style={{ marginTop: 8 }}>
              <Button variant="primary" size="sm" onClick={() => setEntityPreview(null)}>
                View full profile
              </Button>
            </div>
          </div>
        )}
      </SlideOut>

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
