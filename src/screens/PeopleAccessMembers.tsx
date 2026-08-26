import { useState, useMemo } from "react"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Input }        from "@/components/ui/input"
import { SwitchTab }    from "@/components/ui/switch-tab"
import { SlideOut }     from "@/components/ui/slide-out"
import type { SidebarItem } from "@/components/ui/sidebar"

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const SIDEBAR: SidebarItem[] = [
  { id: "overview",      label: "Overview",        icon: "LayoutDashboard" },
  { id: "people",        label: "People & Access", icon: "Users"           },
  { id: "studios",       label: "Studios",         icon: "Box"             },
  { id: "integrations",  label: "Integrations",    icon: "Plug"            },
  { id: "security",      label: "Security",        icon: "Shield"          },
  { id: "audit",         label: "Audit Log",       icon: "ClipboardList"   },
  { id: "billing",       label: "Billing",         icon: "CreditCard"      },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberStatus = "active" | "invited" | "suspended"
type MemberRole   = "Super Admin" | "Tenant Admin" | "Member" | "Viewer" | "Billing Admin"
type PermState    = "g-direct" | "g-inh" | "g-denied" | ""

interface PermNode {
  id: string; label: string; desc: string; code: string
  state: PermState; scope?: string; locked?: boolean; role?: string
  children?: PermNode[]
}

interface Member {
  id: string; name: string; email: string; role: MemberRole
  status: MemberStatus; lastActive: string | null; joinedAt: string
  initials: string; avatarColor: string; department?: string; title?: string
}

// ─── Members fixture ──────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: "tg",  name: "Thomas Gonzalez",  email: "thomas.gonzalez@aimsos.ai",   role: "Super Admin",   status: "active",    lastActive: "2026-08-26T09:10:00Z", joinedAt: "2025-01-15T00:00:00Z", initials: "TG", avatarColor: "var(--badge-info)",       title: "Platform Owner",       department: "AIMS OS"           },
  { id: "mg",  name: "Maria García",     email: "maria.garcia@avance.com",     role: "Tenant Admin",  status: "active",    lastActive: "2026-08-26T08:45:00Z", joinedAt: "2025-03-02T00:00:00Z", initials: "MG", avatarColor: "var(--badge-success)",    title: "IT Director",           department: "IT"                },
  { id: "es",  name: "Eduardo Suárez",   email: "eduardo.suarez@avance.com",   role: "Member",        status: "active",    lastActive: "2026-08-25T17:30:00Z", joinedAt: "2025-04-10T00:00:00Z", initials: "ES", avatarColor: "var(--badge-alert)",      title: "Data Analyst",          department: "Analytics"         },
  { id: "sb",  name: "Sarah Brown",      email: "sarah.brown@avance.com",      role: "Member",        status: "active",    lastActive: "2026-08-25T14:00:00Z", joinedAt: "2025-05-18T00:00:00Z", initials: "SB", avatarColor: "var(--badge-error)",      title: "Risk Manager",          department: "Risk & Compliance" },
  { id: "dp",  name: "Diana Pérez",      email: "diana.perez@avance.com",      role: "Member",        status: "active",    lastActive: "2026-08-24T11:20:00Z", joinedAt: "2025-06-01T00:00:00Z", initials: "DP", avatarColor: "var(--badge-info)",       title: "Operations Lead",       department: "Operations"        },
  { id: "jp",  name: "James Park",       email: "james.park@avance.com",       role: "Billing Admin", status: "active",    lastActive: "2026-08-23T09:00:00Z", joinedAt: "2025-07-07T00:00:00Z", initials: "JP", avatarColor: "var(--badge-success)",    title: "Finance Manager",       department: "Finance"           },
  { id: "at",  name: "Ana Torres",       email: "ana.torres@avance.com",       role: "Viewer",        status: "active",    lastActive: "2026-08-22T16:45:00Z", joinedAt: "2025-08-01T00:00:00Z", initials: "AT", avatarColor: "var(--badge-alert)",      title: "Business Analyst",      department: "Analytics"         },
  { id: "lr",  name: "Leo Ramírez",      email: "leo.ramirez@avance.com",      role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-20T00:00:00Z", initials: "LR", avatarColor: "var(--muted-foreground)", title: "Data Engineer",         department: "Engineering"       },
  { id: "cn",  name: "Clara Nakamura",   email: "clara.nakamura@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-21T00:00:00Z", initials: "CN", avatarColor: "var(--muted-foreground)", title: "Product Manager",       department: "Product"           },
  { id: "rv",  name: "Roberto Vargas",   email: "roberto.vargas@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-22T00:00:00Z", initials: "RV", avatarColor: "var(--muted-foreground)", title: "Solutions Architect",   department: "Engineering"       },
  { id: "fw",  name: "Fiona Walsh",      email: "fiona.walsh@avance.com",      role: "Viewer",        status: "suspended", lastActive: "2026-07-14T10:00:00Z", joinedAt: "2025-09-10T00:00:00Z", initials: "FW", avatarColor: "var(--muted-foreground)", title: "Analyst",               department: "Risk & Compliance" },
  { id: "ms",  name: "Marcus Silva",     email: "marcus.silva@avance.com",     role: "Member",        status: "suspended", lastActive: "2026-06-30T08:00:00Z", joinedAt: "2025-10-01T00:00:00Z", initials: "MS", avatarColor: "var(--muted-foreground)", title: "Data Scientist",        department: "Analytics"         },
]

// ─── Permission tree fixture ──────────────────────────────────────────────────

const PERM_TREE: Record<string, PermNode[]> = {
  governance: [
    { id:"gov-drives", label:"Drives", code:"governance.drive", desc:"Manage files and folders within governance drives", state:"g-inh", role:"Manager", scope:"Tenant", locked:true, children:[
      { id:"gov-drives-view",   label:"View Drives",    desc:"Browse and read files within authorized drives",          code:"governance.drive.view",          state:"g-inh",  scope:"Tenant", locked:true },
      { id:"gov-drives-up",     label:"Upload files",   desc:"Add new files and documents to governance drives",        code:"governance.drive.upload",        state:"g-inh",  scope:"Tenant", locked:true },
      { id:"gov-drives-folder", label:"Create folders", desc:"Organize content by creating folder structures",          code:"governance.drive.folder.create", state:"g-inh",  scope:"Tenant", locked:true },
    ]},
    { id:"gov-sandbox", label:"Sandboxes", code:"governance.sandbox", desc:"Work within isolated environments before promoting", state:"g-inh", role:"Manager", scope:"Own", locked:true, children:[
      { id:"gov-sb-view",    label:"View Sandboxes",    desc:"List and browse available sandbox environments",          code:"governance.sandbox.view",    state:"g-inh",    scope:"Own", locked:true },
      { id:"gov-sb-det",     label:"Sandbox details",   desc:"Access configuration and metadata for a sandbox",        code:"governance.sandbox.details", state:"g-inh",    scope:"Own", locked:true },
      { id:"gov-sb-claims",  label:"View claims",       desc:"See the knowledge claims stored in a sandbox",           code:"governance.sandbox.claims",  state:"g-inh",    scope:"Own", locked:true },
      { id:"gov-sb-bundles", label:"Manage bundles",    desc:"Create and edit content bundles within a sandbox",       code:"governance.sandbox.bundles", state:"g-direct", scope:"Own" },
      { id:"gov-sb-sources", label:"Connect sources",   desc:"Link external data sources to a sandbox",                code:"governance.sandbox.sources", state:"",         scope:"Own" },
      { id:"gov-sb-promo",   label:"Promote sandboxes", desc:"Move validated content from sandbox to truth plane",     code:"governance.sandbox.promote", state:"",         scope:"Own" },
    ]},
    { id:"gov-truth", label:"Truth Plane", code:"governance.truthplane", desc:"Access the authoritative knowledge base", state:"", children:[
      { id:"gov-truth-view",  label:"View truth plane", desc:"Read facts and claims in the production truth plane", code:"governance.truthplane.view",  state:"" },
      { id:"gov-truth-facts", label:"Manage facts",     desc:"Edit, approve, or retire facts in the truth plane",  code:"governance.truthplane.facts", state:"" },
    ]},
    { id:"gov-packs", label:"Promotion Packs", code:"governance.packs", desc:"Bundle content changes for review and approval", state:"", children:[
      { id:"gov-packs-view",   label:"View packs",   desc:"Browse promotion packets and their review status", code:"governance.packs.view",   state:"g-direct" },
      { id:"gov-packs-create", label:"Create packs", desc:"Assemble new promotion packets for approval",      code:"governance.packs.create", state:"" },
    ]},
  ],
  datastudio: [
    { id:"ds-models", label:"Data Models", code:"datastudio.models", desc:"Browse and manage entity schemas and data model definitions", state:"g-inh", role:"Data Steward", scope:"Tenant", locked:true, children:[
      { id:"ds-models-view",      label:"View models",      desc:"Read data model definitions, entities, and attributes",                            code:"datastudio.models.view",      state:"g-inh", scope:"Tenant", locked:true },
      { id:"ds-models-author",    label:"Author models",    desc:"Create and edit data model drafts",                                               code:"datastudio.models.author",    state:"g-inh", scope:"Tenant", locked:true },
      { id:"ds-models-publish",   label:"Publish models",   desc:"Promote a model from Draft to Published state",                                   code:"datastudio.models.publish",   state:"" },
      { id:"ds-models-deprecate", label:"Deprecate models", desc:"Mark a published model as deprecated so consumers can migrate",                   code:"datastudio.models.deprecate", state:"" },
    ]},
    { id:"ds-lineage", label:"Lineage", code:"datastudio.lineage", desc:"Explore how data flows between entities and sources", state:"g-direct", scope:"Tenant", children:[
      { id:"ds-lineage-view",  label:"View lineage graph",  desc:"See the full dependency graph for data models and pipelines", code:"datastudio.lineage.view",  state:"g-direct", scope:"Tenant" },
      { id:"ds-lineage-trace", label:"Trace relationships", desc:"Follow data lineage from a specific field back to its origin", code:"datastudio.lineage.trace", state:"" },
    ]},
    { id:"ds-connectors", label:"Connectors", code:"datastudio.connectors", desc:"Configure connections to external data sources", state:"", children:[
      { id:"ds-conn-view",   label:"View connectors",   desc:"List configured source connections and their status",       code:"datastudio.connectors.view",   state:"" },
      { id:"ds-conn-manage", label:"Manage connectors", desc:"Add, edit, or remove data source connections",             code:"datastudio.connectors.manage", state:"" },
      { id:"ds-conn-test",   label:"Test connections",  desc:"Run a connectivity test against a configured data source", code:"datastudio.connectors.test",   state:"" },
    ]},
  ],
  agentic: [
    { id:"ag-workers", label:"AI Workers", code:"agentic.workers", desc:"Control access to AI worker agents and their execution", state:"g-inh", role:"Data Steward", scope:"Tenant", locked:true, children:[
      { id:"ag-workers-view",   label:"View workers",   desc:"Browse AI workers and read their configurations and run history", code:"agentic.workers.view",   state:"g-inh", scope:"Tenant", locked:true },
      { id:"ag-workers-run",    label:"Run workers",    desc:"Trigger AI worker executions manually or on a schedule",          code:"agentic.workers.run",    state:"g-inh", scope:"Tenant", locked:true },
      { id:"ag-workers-manage", label:"Manage workers", desc:"Edit worker configurations, prompts, and tool bindings",          code:"agentic.workers.manage", state:"" },
      { id:"ag-workers-deploy", label:"Deploy workers", desc:"Publish a worker to production so it can be invoked",             code:"agentic.workers.deploy", state:"" },
    ]},
    { id:"ag-hitl", label:"Human in the Loop", code:"agentic.hitl", desc:"Handle human review checkpoints within agentic workflows", state:"g-direct", scope:"Own", children:[
      { id:"ag-hitl-view",    label:"View handoffs",    desc:"See pending human-review tasks generated by AI workers",        code:"agentic.hitl.view",    state:"g-direct", scope:"Own" },
      { id:"ag-hitl-approve", label:"Approve handoffs", desc:"Accept or reject AI decisions that require human sign-off",    code:"agentic.hitl.approve", state:"g-direct", scope:"Own" },
      { id:"ag-hitl-config",  label:"Configure HITL",   desc:"Set the conditions under which a worker pauses for human review", code:"agentic.hitl.config",  state:"" },
    ]},
    { id:"ag-networks", label:"Agentic Networks", code:"agentic.networks", desc:"Manage multi-agent topologies and orchestration graphs", state:"", children:[
      { id:"ag-net-view",   label:"View networks",   desc:"Browse agentic network definitions and their connected workers", code:"agentic.networks.view",   state:"" },
      { id:"ag-net-manage", label:"Manage networks", desc:"Create and edit agentic network topologies",                   code:"agentic.networks.manage", state:"" },
    ]},
    { id:"ag-workflows", label:"Workflows", code:"agentic.workflows", desc:"Define and run multi-step automated task sequences", state:"", children:[
      { id:"ag-wf-view",   label:"View workflows",   desc:"Browse workflow definitions and their execution logs",    code:"agentic.workflows.view",   state:"" },
      { id:"ag-wf-manage", label:"Manage workflows", desc:"Create, edit, and delete workflow step configurations",   code:"agentic.workflows.manage", state:"" },
    ]},
  ],
  admin: [
    { id:"adm-members", label:"Members", code:"admin.members", desc:"Manage who can access the workspace and their account status", state:"g-inh", role:"Workspace Admin", scope:"Tenant", locked:true, children:[
      { id:"adm-members-view",    label:"View members",    desc:"List all workspace members and their profile details",      code:"admin.members.view",    state:"g-inh", scope:"Tenant", locked:true },
      { id:"adm-members-invite",  label:"Invite members",  desc:"Send invitations to bring new users into the workspace",   code:"admin.members.invite",  state:"g-inh", scope:"Tenant", locked:true },
      { id:"adm-members-remove",  label:"Remove members",  desc:"Permanently remove a member from the workspace",           code:"admin.members.remove",  state:"g-inh", scope:"Tenant", locked:true },
      { id:"adm-members-suspend", label:"Suspend members", desc:"Temporarily disable a member account without removing it", code:"admin.members.suspend", state:"" },
    ]},
    { id:"adm-roles", label:"Roles & Permissions", code:"admin.roles", desc:"Define and assign permission bundles across the platform", state:"g-direct", scope:"Tenant", children:[
      { id:"adm-roles-view",   label:"View roles",   desc:"Browse role definitions and see which permissions each role grants", code:"admin.roles.view",   state:"g-direct", scope:"Tenant" },
      { id:"adm-roles-manage", label:"Manage roles", desc:"Create custom roles and modify the permissions they grant",         code:"admin.roles.manage", state:"" },
    ]},
    { id:"adm-integrations", label:"Integrations", code:"admin.integrations", desc:"Connect external services and manage third-party credentials", state:"", children:[
      { id:"adm-int-view",   label:"View integrations",       desc:"List configured third-party integrations and their status", code:"admin.integrations.view",   state:"" },
      { id:"adm-int-manage", label:"Manage integrations",     desc:"Add, configure, or remove integration connections",         code:"admin.integrations.manage", state:"" },
    ]},
    { id:"adm-audit", label:"Audit & Compliance", code:"admin.audit", desc:"Review and export a tamper-evident log of platform activity", state:"", children:[
      { id:"adm-audit-view",   label:"View audit log",    desc:"Read the chronological log of admin and user actions",   code:"admin.audit.view",   state:"" },
      { id:"adm-audit-export", label:"Export audit log",  desc:"Download a copy of the audit trail as CSV or JSON",       code:"admin.audit.export", state:"" },
    ]},
  ],
}

// ─── Display helpers ──────────────────────────────────────────────────────────

const STATUS_COLOR: Record<MemberStatus, string> = {
  active:    "var(--badge-success)",
  invited:   "var(--badge-light-blue)",
  suspended: "var(--muted-foreground)",
}
const STATUS_LABEL: Record<MemberStatus, string> = {
  active:    "Active",
  invited:   "Invited",
  suspended: "Suspended",
}
const ROLE_COLOR: Record<MemberRole, string> = {
  "Super Admin":   "var(--badge-error)",
  "Tenant Admin":  "var(--badge-alert)",
  "Billing Admin": "var(--badge-info)",
  "Member":        "var(--muted-foreground)",
  "Viewer":        "var(--muted-foreground)",
}
const PROTO_NOW = new Date("2026-08-26T10:00:00Z")

function formatRelative(iso: string): string {
  const diffH = Math.floor((PROTO_NOW.getTime() - new Date(iso).getTime()) / 3_600_000)
  if (diffH < 1)  return "Just now"
  if (diffH < 24) return `${diffH}h ago`
  const d = Math.floor(diffH / 24)
  if (d === 1)    return "Yesterday"
  if (d < 7)      return `${d}d ago`
  if (d < 30)     return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Permission state icon ────────────────────────────────────────────────────

function PermIcon({ state }: { state: PermState }) {
  if (state === "g-direct") {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--primary)",
        background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icons.Check size={10} color="#fff" strokeWidth={2.5} />
      </div>
    )
  }
  if (state === "g-inh") {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--primary)",
        background: "color-mix(in srgb, var(--primary) 15%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--primary)", opacity: 0.8 }} />
      </div>
    )
  }
  if (state === "g-denied") {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--badge-error)",
        background: "color-mix(in srgb, var(--badge-error) 12%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icons.X size={10} color="var(--badge-error)" strokeWidth={2.5} />
      </div>
    )
  }
  return (
    <div style={{
      width: 16, height: 16, borderRadius: 4,
      border: "1.5px solid var(--border)", flexShrink: 0,
    }} />
  )
}

// ─── Permission tree node ─────────────────────────────────────────────────────

function PermTreeNode({ node, depth = 0 }: { node: PermNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth === 0 && (node.state === "g-inh" || node.state === "g-direct"))
  const hasChildren = (node.children?.length ?? 0) > 0
  const grantedChildren = node.children?.filter(c => c.state !== "").length ?? 0

  return (
    <div>
      <div
        onClick={() => hasChildren && setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: `7px 14px 7px ${14 + depth * 20}px`,
          borderBottom: "1px solid var(--border)",
          cursor: hasChildren ? "pointer" : "default",
          background: "transparent",
        }}
        onMouseEnter={e => { if (hasChildren) (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
      >
        {/* Expand toggle */}
        <div style={{ width: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hasChildren
            ? expanded
              ? <Icons.ChevronDown size={12} color="var(--muted-foreground)" />
              : <Icons.ChevronRight size={12} color="var(--muted-foreground)" />
            : null}
        </div>

        <PermIcon state={node.state} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
              {node.label}
            </span>
            {node.role && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
              }}>
                via {node.role}
              </span>
            )}
            {node.scope && (
              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>· {node.scope}</span>
            )}
          </div>
          {depth === 0 && hasChildren && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>
              {grantedChildren} of {node.children?.length} permissions granted
            </div>
          )}
        </div>

        {node.locked && (
          <Icons.Lock size={11} color="var(--muted-foreground)" style={{ flexShrink: 0, opacity: 0.5 }} />
        )}
      </div>

      {expanded && hasChildren && node.children!.map(child => (
        <PermTreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

// ─── Permissions tab ──────────────────────────────────────────────────────────

const STUDIO_TABS = [
  { id: "governance", label: "Governance" },
  { id: "datastudio",  label: "Data Studio" },
  { id: "agentic",    label: "Agentic" },
  { id: "admin",      label: "Admin" },
]

function PermissionsTab() {
  const [studio, setStudio] = useState("governance")
  const [filter, setFilter] = useState("")
  const nodes = PERM_TREE[studio] ?? []

  const grantedCount = nodes.reduce((n, nd) => {
    let c = nd.state !== "" ? 1 : 0
    nd.children?.forEach(ch => { if (ch.state !== "") c++ })
    return n + c
  }, 0)
  const totalCount = nodes.reduce((n, nd) => n + 1 + (nd.children?.length ?? 0), 0)

  const filteredNodes = filter.trim()
    ? nodes.map(nd => ({
        ...nd,
        children: nd.children?.filter(ch =>
          ch.label.toLowerCase().includes(filter.toLowerCase()) ||
          ch.code.toLowerCase().includes(filter.toLowerCase())
        ),
      })).filter(nd =>
        nd.label.toLowerCase().includes(filter.toLowerCase()) ||
        (nd.children?.length ?? 0) > 0
      )
    : nodes

  return (
    <div>
      {/* Studio tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
        {STUDIO_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setStudio(t.id)}
            style={{
              flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: 600,
              border: "none", background: "none", cursor: "pointer",
              color: studio === t.id ? "var(--primary)" : "var(--muted-foreground)",
              borderBottom: studio === t.id ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1, transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary + search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)",
      }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Icons.Search size={12} style={{
            position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
            color: "var(--muted-foreground)", pointerEvents: "none",
          }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter permissions…"
            style={{
              width: "100%", paddingLeft: 28, paddingRight: 8, paddingTop: 5, paddingBottom: 5,
              fontSize: 12, border: "1px solid var(--border)", borderRadius: 6,
              background: "var(--surface)", color: "var(--foreground)", outline: "none",
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{grantedCount}</span>
          <span> / {totalCount} granted</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 12, padding: "8px 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)",
      }}>
        {[
          { state: "g-direct" as PermState, label: "Direct" },
          { state: "g-inh"    as PermState, label: "Via role" },
          { state: "g-denied" as PermState, label: "Denied" },
          { state: ""         as PermState, label: "None" },
        ].map(l => (
          <div key={l.state} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <PermIcon state={l.state} />
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div>
        {filteredNodes.length === 0 ? (
          <div style={{ padding: "32px 14px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 12 }}>
            No permissions match "{filter}"
          </div>
        ) : (
          filteredNodes.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)
        )}
      </div>
    </div>
  )
}

// ─── Activity tab ─────────────────────────────────────────────────────────────

const ACTIVITY_LOG = [
  { msg: "Signed in from Chrome on macOS",          time: "2 hours ago",          type: "auth"  },
  { msg: "Updated Data Studio model configuration", time: "Yesterday at 2:34 PM", type: "edit"  },
  { msg: "Added to Engineering group by Admin",     time: "Aug 20 at 9:15 AM",    type: "group" },
  { msg: "Role updated: Viewer → Member",           time: "Aug 18 at 4:10 PM",    type: "role"  },
  { msg: "Approved promotion packet GV-2200",       time: "Aug 15 at 11:30 AM",   type: "check" },
  { msg: "Signed in from Safari on macOS",          time: "Aug 12 at 8:05 AM",    type: "auth"  },
  { msg: "Uploaded 3 files to Governance Drives",   time: "Aug 10 at 3:20 PM",    type: "edit"  },
  { msg: "Created sandbox SB-2026-08",              time: "Aug 8 at 10:05 AM",    type: "edit"  },
]

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  auth:  <Icons.LogIn size={13} />,
  edit:  <Icons.FileEdit size={13} />,
  group: <Icons.Users size={13} />,
  role:  <Icons.ShieldCheck size={13} />,
  check: <Icons.CheckCircle size={13} />,
}

function ActivityTab() {
  return (
    <div style={{ padding: "4px 0" }}>
      {ACTIVITY_LOG.map((ev, i) => (
        <div
          key={i}
          style={{
            display: "flex", gap: 12, padding: "10px 16px",
            borderBottom: "1px solid var(--border)", alignItems: "flex-start",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "var(--surface-raised)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted-foreground)",
          }}>
            {ACTIVITY_ICON[ev.type]}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.4 }}>{ev.msg}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{ev.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Member SlideOut ──────────────────────────────────────────────────────────

const ROLE_OPTIONS: MemberRole[] = ["Super Admin", "Tenant Admin", "Billing Admin", "Member", "Viewer"]

function MemberDetail({
  member, onClose, onRoleChange, onToggleSuspend, onRemove,
}: {
  member: Member
  onClose: () => void
  onRoleChange: (id: string, role: MemberRole) => void
  onToggleSuspend: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const statusColor = STATUS_COLOR[member.status]
  const isActive  = member.status === "active"
  const isInvited = member.status === "invited"

  return (
    <SlideOut
      open
      onClose={onClose}
      size="m"
      title={member.name}
      subtitle=""
      showIcon={false}
      showStatus={false}
      showTopButton={false}
      showChips={false}
      showCta={false}
      showTabs
      tabLabels={["Profile", "Permissions", "Activity"]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ── TAB 0: Profile ── */}
      {activeTab === 0 && (
        <>
          {/* Identity block */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "20px 24px 16px", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: isActive ? member.avatarColor : "var(--muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700,
              color: isActive ? "#fff" : "var(--muted-foreground)",
              opacity: member.status === "suspended" ? 0.6 : 1,
            }}>
              {member.initials}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 3 }}>
                {member.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 8 }}>
                {member.title && <span>{member.title} · </span>}{member.department}
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
                {STATUS_LABEL[member.status]}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <InfoRow icon={<Icons.Mail size={14} />}     label="Email"       value={member.email} />
            <InfoRow icon={<Icons.Calendar size={14} />} label="Joined"      value={formatDate(member.joinedAt)} />
            {member.lastActive && (
              <InfoRow icon={<Icons.Clock size={14} />}  label="Last active" value={formatRelative(member.lastActive)} />
            )}
            {isInvited && (
              <InfoRow icon={<Icons.Send size={14} />}   label="Invite sent" value={formatRelative(member.joinedAt)} />
            )}

            {/* Role picker */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted-foreground)" }}>
                <Icons.ShieldCheck size={14} />
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Role</span>
              </div>
              <select
                value={member.role}
                onChange={e => onRoleChange(member.id, e.target.value as MemberRole)}
                style={{
                  width: "100%", padding: "8px 12px", fontSize: 13, borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--surface)",
                  color: "var(--foreground)", cursor: "pointer", outline: "none",
                }}
              >
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ margin: "0 24px 24px", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{
              padding: "8px 14px",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
              color: "var(--muted-foreground)", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
            }}>
              Actions
            </div>
            {!isInvited && (
              <DangerRow
                icon={isActive ? <Icons.UserX size={14} /> : <Icons.UserCheck size={14} />}
                label={isActive ? "Suspend access" : "Reactivate account"}
                desc={isActive ? "Block login and API access immediately" : "Restore login access for this member"}
                onClick={() => { onToggleSuspend(member.id); onClose() }}
              />
            )}
            {isInvited && (
              <DangerRow
                icon={<Icons.RefreshCw size={14} />}
                label="Resend invite"
                desc="Send a new invitation email to this address"
                onClick={() => alert(`Invite resent to ${member.email}`)}
              />
            )}
            {!confirmRemove ? (
              <DangerRow
                icon={<Icons.Trash2 size={14} />}
                label="Remove from workspace"
                desc="Permanently removes access. Cannot be undone."
                destructive
                onClick={() => setConfirmRemove(true)}
              />
            ) : (
              <div style={{ padding: "12px 14px", background: "color-mix(in srgb, var(--badge-error) 8%, transparent)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--badge-error)", marginBottom: 6 }}>
                  Remove {member.name}?
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 10 }}>
                  They will lose all access immediately. This cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { onRemove(member.id); onClose() }}
                    style={{ flex: 1, padding: "7px 0", border: "1px solid var(--badge-error)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "var(--badge-error)", background: "none", cursor: "pointer" }}
                  >
                    Yes, remove
                  </button>
                  <button
                    onClick={() => setConfirmRemove(false)}
                    style={{ flex: 1, padding: "7px 0", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "var(--foreground)", background: "var(--surface)", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB 1: Permissions ── */}
      {activeTab === 1 && <PermissionsTab />}

      {/* ── TAB 2: Activity ── */}
      {activeTab === 2 && <ActivityTab />}
    </SlideOut>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ color: "var(--muted-foreground)", marginTop: 1, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--foreground)" }}>{value}</div>
      </div>
    </div>
  )
}

function DangerRow({ icon, label, desc, destructive, onClick }: {
  icon: React.ReactNode; label: string; desc: string; destructive?: boolean; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left", padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 10,
        background: hov ? (destructive ? "color-mix(in srgb, var(--badge-error) 8%, transparent)" : "var(--accent)") : "transparent",
        border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.1s",
      }}
    >
      <div style={{ color: destructive ? "var(--badge-error)" : "var(--muted-foreground)", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: destructive ? "var(--badge-error)" : "var(--foreground)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{desc}</div>
      </div>
    </button>
  )
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({ member, onSelect }: { member: Member; onSelect: (m: Member) => void }) {
  const [hovered, setHovered] = useState(false)
  const statusColor = STATUS_COLOR[member.status]

  return (
    <div
      onClick={() => onSelect(member)}
      style={{
        padding: "12px 20px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 14,
        background: hovered ? "var(--accent)" : "transparent",
        cursor: "pointer", transition: "background 0.1s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: member.status === "active" ? member.avatarColor : "var(--muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700,
        color: member.status === "active" ? "#fff" : "var(--muted-foreground)",
        opacity: member.status === "suspended" ? 0.5 : 1,
      }}>{member.initials}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", opacity: member.status === "suspended" ? 0.5 : 1 }}>
            {member.name}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 100, background: `${ROLE_COLOR[member.role]}22`, color: ROLE_COLOR[member.role], border: `1px solid ${ROLE_COLOR[member.role]}44` }}>
            {member.role}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {member.email}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 88 }}>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>
          {member.status === "invited" ? "Invite sent" : member.status === "suspended" ? "Suspended" : "Last active"}
        </div>
        {member.lastActive ? (
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{formatRelative(member.lastActive)}</div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>
            {member.status === "invited" ? formatRelative(member.joinedAt) : "—"}
          </div>
        )}
      </div>

      <div style={{
        padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
        background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
        minWidth: 76, textAlign: "center", flexShrink: 0,
      }}>
        {STATUS_LABEL[member.status]}
      </div>

      <div style={{ color: "var(--muted-foreground)", flexShrink: 0, opacity: hovered ? 0.5 : 0, transition: "opacity 0.1s" }}>
        <Icons.ChevronRight size={15} />
      </div>
    </div>
  )
}

// ─── Groups data ──────────────────────────────────────────────────────────────

interface Group {
  id: string; name: string; color: string; desc: string; memberIds: string[]
  studios: string[]
}

const GROUPS: Group[] = [
  { id: "engineering",  name: "Engineering",          color: "#10b981", desc: "Platform and product engineers building integrations and workflows.",    memberIds: ["es", "dp"],         studios: ["agentic", "datastudio", "governance"] },
  { id: "ai-ops",       name: "AI Ops",               color: "#06b6d4", desc: "Responsible for deploying and monitoring AI workers in production.",      memberIds: ["sb", "dp"],         studios: ["agentic"] },
  { id: "data-team",    name: "Data Team",             color: "#8b5cf6", desc: "Data engineers and stewards managing model governance and lineage.",     memberIds: ["mg"],               studios: ["datastudio", "governance"] },
  { id: "leadership",   name: "Leadership",            color: "#f97316", desc: "Executives and directors with read access across all studios.",           memberIds: ["tg", "mg", "es"],   studios: ["agentic", "governance", "datastudio"] },
  { id: "compliance",   name: "Compliance & Audit",   color: "#0ea5e9", desc: "Read-only access to audit logs and governance events.",                   memberIds: [],                   studios: ["governance"] },
  { id: "external",     name: "External Consultants", color: "#84cc16", desc: "Limited scoped access for contracted third-party consultants.",            memberIds: [],                   studios: [] },
]

const STUDIO_META: Record<string, { label: string; color: string }> = {
  governance: { label: "Governance",  color: "#10b981" },
  datastudio:  { label: "Data Studio", color: "#8b5cf6" },
  agentic:    { label: "Agentic",     color: "#06b6d4" },
  admin:      { label: "Admin",       color: "#6366f1" },
}

const GROUP_ACTIVITY: Record<string, Array<{ type: string; msg: string; time: string }>> = {
  engineering: [
    { type: "role",   msg: "Eduardo Suárez added to this group",         time: "Aug 9, 2026"  },
    { type: "edit",   msg: "Studio access updated — removed \"admin\"",  time: "Aug 3, 2026"  },
    { type: "create", msg: "Group created by Thomas Gonzalez",           time: "Mar 1, 2025"  },
  ],
  "ai-ops": [
    { type: "role",   msg: "Diana Pérez added to this group",            time: "Aug 10, 2026" },
    { type: "edit",   msg: "Studio access updated — added \"helix\"",    time: "Aug 5, 2026"  },
    { type: "create", msg: "Group created by Maria García",              time: "Jun 15, 2025" },
  ],
  "data-team": [
    { type: "role",   msg: "Maria García added to this group",           time: "Aug 5, 2026"  },
    { type: "create", msg: "Group created by Thomas Gonzalez",           time: "Apr 2, 2025"  },
  ],
  leadership: [
    { type: "edit",   msg: "Eduardo Suárez added to this group",         time: "Aug 1, 2026"  },
    { type: "create", msg: "Group created by Thomas Gonzalez",           time: "Jan 15, 2025" },
  ],
  compliance: [
    { type: "create", msg: "Group created by Maria García",              time: "May 10, 2025" },
  ],
  external: [
    { type: "create", msg: "Group created by Thomas Gonzalez",           time: "Jul 22, 2025" },
  ],
}

const ACTIVITY_TYPE_ICON_GROUP: Record<string, React.ReactNode> = {
  role:   <Icons.UserPlus size={13} />,
  edit:   <Icons.Settings size={13} />,
  create: <Icons.PlusCircle size={13} />,
  remove: <Icons.UserMinus size={13} />,
}

// ─── Group detail slide-out ───────────────────────────────────────────────────

function GroupDetail({ group: initialGroup, onClose }: { group: Group; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0)
  const [group, setGroup]         = useState(initialGroup)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const groupMembers = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const log = GROUP_ACTIVITY[group.id] ?? []

  const allStudios = ["governance", "datastudio", "agentic", "admin"]

  function toggleStudio(s: string) {
    setGroup(g => ({
      ...g,
      studios: g.studios.includes(s)
        ? g.studios.filter(x => x !== s)
        : [...g.studios, s],
    }))
  }

  function removeMember(id: string) {
    setGroup(g => ({ ...g, memberIds: g.memberIds.filter(x => x !== id) }))
  }

  return (
    <SlideOut
      open
      onClose={onClose}
      size="m"
      title={group.name}
      subtitle=""
      showIcon={false}
      showStatus={false}
      showTopButton={false}
      showChips={false}
      showCta={false}
      showTabs
      tabLabels={["Members", "Settings", "Activity"]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Color accent */}
      <div style={{ height: 5, background: group.color }} />

      {/* Description */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>{group.desc}</p>
      </div>

      {/* ── TAB 0: Members ── */}
      {activeTab === 0 && (
        <div>
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--surface-raised)",
          }}>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              <b style={{ color: "var(--foreground)" }}>{groupMembers.length}</b> member{groupMembers.length !== 1 ? "s" : ""}
            </span>
            <button style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", border: "none", background: "none", cursor: "pointer" }}>
              + Add member
            </button>
          </div>
          {groupMembers.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--muted-foreground)" }}>
              <Icons.Users size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 500 }}>No members yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Add members to this group to grant them shared access</div>
            </div>
          ) : groupMembers.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: m.status === "active" ? m.avatarColor : "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: m.status === "active" ? "#fff" : "var(--muted-foreground)",
              }}>{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.title} · {m.department}
                </div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                background: `${STATUS_COLOR[m.status]}22`, color: STATUS_COLOR[m.status], flexShrink: 0,
              }}>
                {STATUS_LABEL[m.status]}
              </div>
              <button
                onClick={() => removeMember(m.id)}
                title="Remove from group"
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, flexShrink: 0, borderRadius: 4 }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--badge-error)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
              >
                <Icons.X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 1: Settings ── */}
      {activeTab === 1 && (
        <div style={{ padding: "16px" }}>
          {/* Studio access */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>
              Studio access
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {allStudios.map(s => {
                const meta = STUDIO_META[s]
                const active = group.studios.includes(s)
                return (
                  <button
                    key={s}
                    onClick={() => toggleStudio(s)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${active ? meta.color : "var(--border)"}`,
                      background: active ? `${meta.color}1a` : "transparent",
                      color: active ? meta.color : "var(--muted-foreground)",
                      display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                    }}
                  >
                    {active
                      ? <Icons.Check size={10} strokeWidth={2.5} />
                      : <div style={{ width: 8, height: 8, borderRadius: "50%", background: `${meta.color}66` }} />}
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Danger zone */}
          <div style={{ border: "1px solid color-mix(in srgb, var(--badge-error) 30%, transparent)", borderRadius: 10, padding: 14, background: "color-mix(in srgb, var(--badge-error) 5%, transparent)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--badge-error)", marginBottom: 8 }}>
              Danger zone
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>
              Deleting this group removes it permanently. Members are not removed from the workspace.
            </div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, border: "1px solid var(--badge-error)", color: "var(--badge-error)", background: "transparent", cursor: "pointer" }}
              >
                Delete group
              </button>
            ) : (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--badge-error)", marginBottom: 8 }}>Are you sure? This cannot be undone.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={onClose} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, border: "1px solid var(--badge-error)", color: "#fff", background: "var(--badge-error)", cursor: "pointer" }}>
                    Delete
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, border: "1px solid var(--border)", color: "var(--foreground)", background: "var(--surface)", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Activity ── */}
      {activeTab === 2 && (
        <div style={{ padding: "4px 0" }}>
          {log.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 12 }}>No activity yet</div>
          ) : log.map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "var(--surface-raised)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--muted-foreground)",
              }}>
                {ACTIVITY_TYPE_ICON_GROUP[ev.type] ?? <Icons.Circle size={13} />}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.4 }}>{ev.msg}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{ev.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SlideOut>
  )
}

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({ group, onSelect }: { group: Group; onSelect: (g: Group) => void }) {
  const [hovered, setHovered] = useState(false)
  const members = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const visible = members.slice(0, 5)
  const overflow = members.length - visible.length

  return (
    <div
      onClick={() => onSelect(group)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
        background: hovered ? "var(--accent)" : "var(--surface)",
        cursor: "pointer", transition: "background 0.1s, box-shadow 0.1s",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div style={{ height: 5, background: group.color }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{group.name}</div>
        <p style={{
          fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.45, margin: "0 0 12px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {group.desc}
        </p>

        {/* Studio chips */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12, minHeight: 22 }}>
          {group.studios.length === 0 ? (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.5 }}>No studios</span>
          ) : group.studios.map(s => {
            const meta = STUDIO_META[s]
            return (
              <span key={s} style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                background: `${meta.color}1a`, color: meta.color,
                border: `1px solid ${meta.color}44`,
              }}>
                {meta.label}
              </span>
            )
          })}
        </div>

        {/* Footer: avatars + member count */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {visible.map((m, i) => (
              <div
                key={m.id}
                title={m.name}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: m.status === "active" ? m.avatarColor : "var(--muted)",
                  border: "2px solid var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                  marginLeft: i > 0 ? -6 : 0, flexShrink: 0,
                  position: "relative", zIndex: visible.length - i,
                }}
              >
                {m.initials}
              </div>
            ))}
            {overflow > 0 && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "var(--surface-raised)", border: "2px solid var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "var(--muted-foreground)",
                marginLeft: -6, flexShrink: 0,
              }}>
                +{overflow}
              </div>
            )}
          </div>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
          <div style={{ marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onSelect(group)}
              style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", cursor: "pointer" }}
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Groups view ──────────────────────────────────────────────────────────────

function GroupsView() {
  const [selected, setSelected] = useState<Group | null>(null)

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {GROUPS.map(g => <GroupCard key={g.id} group={g} onSelect={setSelected} />)}
      </div>
      {selected && <GroupDetail group={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

// ─── Roles data ───────────────────────────────────────────────────────────────

interface Role {
  id: string; label: string; system: boolean; color: string; desc: string; memberIds: string[]
}

const ROLES: Role[] = [
  { id: "workspace-admin",    label: "Workspace Admin",    system: true,  color: "#6366f1", desc: "Full control over workspace settings, members, studios, and billing",                     memberIds: ["tg", "mg", "es"] },
  { id: "developer",          label: "Developer",          system: true,  color: "#10b981", desc: "Build and deploy integrations, agents, and custom workflows",                            memberIds: ["es", "sb", "dp"] },
  { id: "viewer",             label: "Viewer",             system: true,  color: "#64748b", desc: "Read-only access across all non-sensitive studio content",                               memberIds: ["at", "fw"] },
  { id: "agent-builder",      label: "Agent Builder",      system: false, color: "#f97316", desc: "Create and manage AI workers, agentic networks, and workflow definitions",              memberIds: ["sb", "dp"] },
  { id: "data-steward",       label: "Data Steward",       system: false, color: "#8b5cf6", desc: "Manage model definitions, governance policies, and data lineage graphs",                memberIds: ["mg"] },
  { id: "compliance-auditor", label: "Compliance Auditor", system: false, color: "#0ea5e9", desc: "Read-only access to audit logs, governance events, data lineage, and access settings", memberIds: [] },
]

const ROLE_PERM_COUNTS: Record<string, { governance: number; datastudio: number; agentic: number; admin: number; total: number }> = {
  "workspace-admin":    { governance: 6, datastudio: 5, agentic: 7, admin: 10, total: 28 },
  "developer":          { governance: 0, datastudio: 4, agentic: 6, admin: 2,  total: 11 },
  "viewer":             { governance: 2, datastudio: 2, agentic: 1, admin: 2,  total: 8  },
  "agent-builder":      { governance: 0, datastudio: 0, agentic: 7, admin: 0,  total: 7  },
  "data-steward":       { governance: 3, datastudio: 3, agentic: 0, admin: 1,  total: 7  },
  "compliance-auditor": { governance: 2, datastudio: 2, agentic: 1, admin: 3,  total: 8  },
}

// ─── Role detail slide-out ────────────────────────────────────────────────────

function RoleDetail({ role, onClose }: { role: Role; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0)
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const perms = ROLE_PERM_COUNTS[role.id] ?? { governance: 0, datastudio: 0, agentic: 0, admin: 0, total: 0 }

  return (
    <SlideOut
      open
      onClose={onClose}
      size="m"
      title={role.label}
      subtitle=""
      showIcon={false}
      showStatus={false}
      showTopButton={false}
      showChips={false}
      showCta={false}
      showTabs
      tabLabels={["Overview", "Members", "Permissions"]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ── TAB 0: Overview ── */}
      {activeTab === 0 && (
        <>
          {/* Color accent + identity */}
          <div style={{ height: 6, background: role.color }} />
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>{role.label}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                background: role.system ? "var(--surface-raised)" : `${role.color}22`,
                color: role.system ? "var(--muted-foreground)" : role.color,
                border: `1px solid ${role.system ? "var(--border)" : role.color + "55"}`,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                {role.system ? "System" : "Custom"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>{role.desc}</p>
          </div>

          {/* Perm summary cards */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>
              Permission coverage
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {([
                { label: "Governance",   value: perms.governance,  color: "#8b5cf6" },
                { label: "Data Studio",  value: perms.datastudio,  color: "#10b981" },
                { label: "Agentic",      value: perms.agentic,     color: "#f97316" },
                { label: "Admin",        value: perms.admin,       color: "#6366f1" },
              ] as const).map(s => (
                <div key={s.label} style={{
                  padding: "10px 12px", borderRadius: 8,
                  background: "var(--surface-raised)", border: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.value > 0 ? "var(--foreground)" : "var(--muted-foreground)", opacity: s.value > 0 ? 1 : 0.4 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>permission{s.value !== 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Total permissions</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{perms.total}</span>
            </div>
          </div>

          {/* Actions */}
          {!role.system && (
            <div style={{ padding: "16px 24px", display: "flex", gap: 8 }}>
              <button style={{
                flex: 1, padding: "8px 0", border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 12, fontWeight: 600, color: "var(--foreground)", background: "var(--surface)",
                cursor: "pointer",
              }}>
                Edit role
              </button>
              <button style={{
                flex: 1, padding: "8px 0", border: "1px solid var(--badge-error)", borderRadius: 8,
                fontSize: 12, fontWeight: 600, color: "var(--badge-error)", background: "transparent",
                cursor: "pointer",
              }}>
                Delete role
              </button>
            </div>
          )}
        </>
      )}

      {/* ── TAB 1: Members ── */}
      {activeTab === 1 && (
        <div>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              <b style={{ color: "var(--foreground)" }}>{members.length}</b> member{members.length !== 1 ? "s" : ""} assigned this role
            </span>
            {!role.system && (
              <button style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", border: "none", background: "none", cursor: "pointer" }}>
                + Assign members
              </button>
            )}
          </div>
          {members.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--muted-foreground)" }}>
              <Icons.Users size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 500 }}>No members assigned</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Assign members to grant them this role's permissions</div>
            </div>
          ) : members.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: m.status === "active" ? m.avatarColor : "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: m.status === "active" ? "#fff" : "var(--muted-foreground)",
              }}>{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                background: `${STATUS_COLOR[m.status]}22`, color: STATUS_COLOR[m.status],
              }}>
                {STATUS_LABEL[m.status]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: Permissions ── */}
      {activeTab === 2 && <PermissionsTab />}
    </SlideOut>
  )
}

// ─── Role card ────────────────────────────────────────────────────────────────

function RoleCard({ role, onSelect }: { role: Role; onSelect: (r: Role) => void }) {
  const [hovered, setHovered] = useState(false)
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const visible = members.slice(0, 5)
  const overflow = members.length - visible.length

  return (
    <div
      onClick={() => onSelect(role)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
        background: hovered ? "var(--accent)" : "var(--surface)",
        cursor: "pointer", transition: "background 0.1s, box-shadow 0.1s",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {/* Color accent bar */}
      <div style={{ height: 5, background: role.color }} />

      <div style={{ padding: "14px 16px" }}>
        {/* Name + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{role.label}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
            background: role.system ? "var(--surface-raised)" : `${role.color}22`,
            color: role.system ? "var(--muted-foreground)" : role.color,
            border: `1px solid ${role.system ? "var(--border)" : role.color + "44"}`,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {role.system ? "System" : "Custom"}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.45, margin: "0 0 14px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {role.desc}
        </p>

        {/* Footer: avatars + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Overlapping avatars */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {visible.map((m, i) => (
              <div
                key={m.id}
                title={m.name}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: m.status === "active" ? m.avatarColor : "var(--muted)",
                  border: "2px solid var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                  marginLeft: i > 0 ? -6 : 0, flexShrink: 0, position: "relative",
                  zIndex: visible.length - i,
                }}
              >
                {m.initials}
              </div>
            ))}
            {overflow > 0 && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "var(--surface-raised)", border: "2px solid var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "var(--muted-foreground)",
                marginLeft: -6, flexShrink: 0,
              }}>
                +{overflow}
              </div>
            )}
          </div>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
            {role.system ? (
              <button
                onClick={() => onSelect(role)}
                style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", cursor: "pointer" }}
              >
                View
              </button>
            ) : (
              <>
                <button style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", cursor: "pointer" }}>
                  Edit
                </button>
                <button style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--badge-error)", background: "transparent", color: "var(--badge-error)", cursor: "pointer" }}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Roles view ───────────────────────────────────────────────────────────────

function RolesView() {
  const [selected, setSelected] = useState<Role | null>(null)
  const systemRoles = ROLES.filter(r => r.system)
  const customRoles = ROLES.filter(r => !r.system)

  return (
    <>
      {/* System roles */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
          color: "var(--muted-foreground)", marginBottom: 10,
        }}>
          System roles <span style={{ fontWeight: 400, opacity: 0.6 }}>· {systemRoles.length}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {systemRoles.map(r => <RoleCard key={r.id} role={r} onSelect={setSelected} />)}
        </div>
      </div>

      {/* Custom roles */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
          color: "var(--muted-foreground)", marginBottom: 10,
        }}>
          Custom roles <span style={{ fontWeight: 400, opacity: 0.6 }}>· {customRoles.length}</span>
        </div>
        {customRoles.length === 0 ? (
          <div style={{
            border: "1.5px dashed var(--border)", borderRadius: 12, padding: "36px 24px",
            textAlign: "center", color: "var(--muted-foreground)",
          }}>
            <Icons.ShieldPlus size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>No custom roles yet</div>
            <div style={{ fontSize: 12 }}>Create a role to bundle specific permissions and assign them to members</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {customRoles.map(r => <RoleCard key={r.id} role={r} onSelect={setSelected} />)}
          </div>
        )}
      </div>

      {selected && (
        <RoleDetail role={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function PeopleAccessMembersScreen() {
  const [mainTab, setMainTab]           = useState<"members" | "roles" | "groups">("members")
  const [statusFilter, setStatusFilter] = useState("all")
  const [query, setQuery]               = useState("")
  const [members, setMembers]           = useState<Member[]>(MEMBERS)
  const [selected, setSelected]         = useState<Member | null>(null)

  const counts = useMemo(() => ({
    all:       members.length,
    active:    members.filter(m => m.status === "active").length,
    invited:   members.filter(m => m.status === "invited").length,
    suspended: members.filter(m => m.status === "suspended").length,
  }), [members])

  const filtered = useMemo(() => {
    let result = members
    if (statusFilter !== "all") result = result.filter(m => m.status === statusFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)
      )
    }
    return result
  }, [members, statusFilter, query])

  function handleRoleChange(id: string, role: MemberRole) {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, role } : m))
    setSelected(s => s?.id === id ? { ...s, role } : s)
  }
  function handleToggleSuspend(id: string) {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, status: m.status === "suspended" ? "active" : "suspended" } : m))
  }
  function handleRemove(id: string) {
    setMembers(ms => ms.filter(m => m.id !== id))
  }

  return (
    <>
      <ScreenLayout
        workspaceName="Avance Financial"
        userName="Thomas Gonzalez"
        userEmail="thomas.gonzalez@aimsos.ai"
        sidebarItems={SIDEBAR}
        activeSidebarId="people"
        header={(isScrolled) => (
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title="People & Access"
            description={
              mainTab === "members" ? `${counts.all} members · Avance Financial workspace`
              : mainTab === "roles"  ? `${ROLES.length} roles · ${ROLES.filter(r => !r.system).length} custom`
              : `${GROUPS.length} groups · manage shared access across the workspace`
            }
            primaryAction={
              mainTab === "members" ? (
                <Button variant="primary" size="sm">
                  <Icons.UserPlus size={14} style={{ marginRight: 4 }} />
                  Invite member
                </Button>
              ) : mainTab === "roles" ? (
                <Button variant="primary" size="sm">
                  <Icons.ShieldPlus size={14} style={{ marginRight: 4 }} />
                  New role
                </Button>
              ) : (
                <Button variant="primary" size="sm">
                  <Icons.FolderPlus size={14} style={{ marginRight: 4 }} />
                  New group
                </Button>
              )
            }
          />
        )}
      >
        {/* Main tab switcher: Members | Roles */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <SwitchTab
            items={[
              { id: "members", label: `Members (${counts.all})` },
              { id: "roles",   label: `Roles (${ROLES.length})`  },
              { id: "groups",  label: `Groups (${GROUPS.length})` },
            ]}
            value={mainTab}
            onChange={v => setMainTab(v as "members" | "roles" | "groups")}
            size="s"
          />

          {/* Member sub-filters — only on Members tab */}
          {mainTab === "members" && (
            <>
              <SwitchTab
                items={[
                  { id: "all",       label: `All (${counts.all})`             },
                  { id: "active",    label: `Active (${counts.active})`       },
                  { id: "invited",   label: `Invited (${counts.invited})`     },
                  { id: "suspended", label: `Suspended (${counts.suspended})` },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                size="s"
              />
              <div style={{ marginLeft: "auto", width: 240 }}>
                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search members…" />
              </div>
            </>
          )}
        </div>

        {/* Members view */}
        {mainTab === "members" && (
          <>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
              <div style={{
                padding: "10px 20px 10px 68px", display: "flex", alignItems: "center", gap: 14,
                background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
                fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)",
                textTransform: "uppercase", letterSpacing: "0.07em",
              }}>
                <span style={{ flex: 1 }}>Member</span>
                <span style={{ minWidth: 88, textAlign: "right" }}>Last active</span>
                <span style={{ minWidth: 76, textAlign: "center" }}>Status</span>
                <span style={{ width: 15 }} />
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                  <Icons.SearchX size={28} style={{ marginBottom: 10, opacity: 0.35 }} />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>No members match</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Try a different filter or search term</div>
                </div>
              ) : (
                filtered.map(m => <MemberRow key={m.id} member={m} onSelect={setSelected} />)
              )}
            </div>

            {filtered.length > 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)", textAlign: "right" }}>
                Showing {filtered.length} of {members.length} members
              </div>
            )}
          </>
        )}

        {/* Roles view */}
        {mainTab === "roles" && <RolesView />}

        {/* Groups view */}
        {mainTab === "groups" && <GroupsView />}
      </ScreenLayout>

      {selected && mainTab === "members" && (
        <MemberDetail
          member={selected}
          onClose={() => setSelected(null)}
          onRoleChange={handleRoleChange}
          onToggleSuspend={handleToggleSuspend}
          onRemove={handleRemove}
        />
      )}
    </>
  )
}
