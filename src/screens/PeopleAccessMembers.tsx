import { useState, useMemo } from "react"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Input }        from "@/components/ui/input"
import { SwitchTab }    from "@/components/ui/switch-tab"
import { SlideOut }     from "@/components/ui/slide-out"
import { Select }       from "@/components/ui/select"
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

interface Member {
  id:         string
  name:       string
  email:      string
  role:       MemberRole
  status:     MemberStatus
  lastActive: string | null
  joinedAt:   string
  initials:   string
  avatarColor: string
  department?: string
  title?:      string
}

// ─── Fixture data ─────────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: "tg",  name: "Thomas Gonzalez",  email: "thomas.gonzalez@aimsos.ai",   role: "Super Admin",   status: "active",    lastActive: "2026-08-26T09:10:00Z", joinedAt: "2025-01-15T00:00:00Z", initials: "TG", avatarColor: "var(--badge-info)",    title: "Platform Owner",       department: "AIMS OS"           },
  { id: "mg",  name: "Maria García",     email: "maria.garcia@avance.com",     role: "Tenant Admin",  status: "active",    lastActive: "2026-08-26T08:45:00Z", joinedAt: "2025-03-02T00:00:00Z", initials: "MG", avatarColor: "var(--badge-success)", title: "IT Director",           department: "IT"                },
  { id: "es",  name: "Eduardo Suárez",   email: "eduardo.suarez@avance.com",   role: "Member",        status: "active",    lastActive: "2026-08-25T17:30:00Z", joinedAt: "2025-04-10T00:00:00Z", initials: "ES", avatarColor: "var(--badge-alert)",   title: "Data Analyst",          department: "Analytics"         },
  { id: "sb",  name: "Sarah Brown",      email: "sarah.brown@avance.com",      role: "Member",        status: "active",    lastActive: "2026-08-25T14:00:00Z", joinedAt: "2025-05-18T00:00:00Z", initials: "SB", avatarColor: "var(--badge-error)",   title: "Risk Manager",          department: "Risk & Compliance" },
  { id: "dp",  name: "Diana Pérez",      email: "diana.perez@avance.com",      role: "Member",        status: "active",    lastActive: "2026-08-24T11:20:00Z", joinedAt: "2025-06-01T00:00:00Z", initials: "DP", avatarColor: "var(--badge-info)",    title: "Operations Lead",       department: "Operations"        },
  { id: "jp",  name: "James Park",       email: "james.park@avance.com",       role: "Billing Admin", status: "active",    lastActive: "2026-08-23T09:00:00Z", joinedAt: "2025-07-07T00:00:00Z", initials: "JP", avatarColor: "var(--badge-success)", title: "Finance Manager",       department: "Finance"           },
  { id: "at",  name: "Ana Torres",       email: "ana.torres@avance.com",       role: "Viewer",        status: "active",    lastActive: "2026-08-22T16:45:00Z", joinedAt: "2025-08-01T00:00:00Z", initials: "AT", avatarColor: "var(--badge-alert)",   title: "Business Analyst",      department: "Analytics"         },
  { id: "lr",  name: "Leo Ramírez",      email: "leo.ramirez@avance.com",      role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-20T00:00:00Z", initials: "LR", avatarColor: "var(--muted-foreground)", title: "Data Engineer",       department: "Engineering"       },
  { id: "cn",  name: "Clara Nakamura",   email: "clara.nakamura@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-21T00:00:00Z", initials: "CN", avatarColor: "var(--muted-foreground)", title: "Product Manager",     department: "Product"           },
  { id: "rv",  name: "Roberto Vargas",   email: "roberto.vargas@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-22T00:00:00Z", initials: "RV", avatarColor: "var(--muted-foreground)", title: "Solutions Architect", department: "Engineering"       },
  { id: "fw",  name: "Fiona Walsh",      email: "fiona.walsh@avance.com",      role: "Viewer",        status: "suspended", lastActive: "2026-07-14T10:00:00Z", joinedAt: "2025-09-10T00:00:00Z", initials: "FW", avatarColor: "var(--muted-foreground)", title: "Analyst",             department: "Risk & Compliance" },
  { id: "ms",  name: "Marcus Silva",     email: "marcus.silva@avance.com",     role: "Member",        status: "suspended", lastActive: "2026-06-30T08:00:00Z", joinedAt: "2025-10-01T00:00:00Z", initials: "MS", avatarColor: "var(--muted-foreground)", title: "Data Scientist",      department: "Analytics"         },
]

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

// ─── Member SlideOut ──────────────────────────────────────────────────────────

const ROLE_OPTIONS: MemberRole[] = ["Super Admin", "Tenant Admin", "Billing Admin", "Member", "Viewer"]

function MemberDetail({
  member,
  onClose,
  onRoleChange,
  onToggleSuspend,
  onRemove,
}: {
  member: Member
  onClose: () => void
  onRoleChange: (id: string, role: MemberRole) => void
  onToggleSuspend: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const statusColor = STATUS_COLOR[member.status]
  const isActive = member.status === "active"
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
      showTabs={false}
      showSearchBar={false}
      showChips={false}
      showCta={false}
    >
      {/* ── Avatar + identity ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        padding: "24px 24px 20px", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: isActive ? member.avatarColor : "var(--muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700,
          color: isActive ? "#fff" : "var(--muted-foreground)",
          opacity: member.status === "suspended" ? 0.6 : 1,
        }}>
          {member.initials}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 3 }}>
            {member.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 8 }}>
            {member.title && <span>{member.title} · </span>}
            {member.department}
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
            {STATUS_LABEL[member.status]}
          </div>
        </div>
      </div>

      {/* ── Details ── */}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Email */}
        <InfoRow icon={<Icons.Mail size={14} />} label="Email" value={member.email} />

        {/* Joined */}
        <InfoRow icon={<Icons.Calendar size={14} />} label="Joined" value={formatDate(member.joinedAt)} />

        {/* Last active */}
        {member.lastActive && (
          <InfoRow
            icon={<Icons.Clock size={14} />}
            label="Last active"
            value={formatRelative(member.lastActive)}
          />
        )}

        {isInvited && (
          <InfoRow
            icon={<Icons.Send size={14} />}
            label="Invite sent"
            value={formatRelative(member.joinedAt)}
          />
        )}

        {/* Role */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted-foreground)", fontSize: 12 }}>
            <Icons.ShieldCheck size={14} />
            <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}>Role</span>
          </div>
          <Select
            value={member.role}
            options={ROLE_OPTIONS.map(r => ({ value: r, label: r }))}
            onChange={v => onRoleChange(member.id, v as MemberRole)}
            state="default"
          />
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div style={{
        margin: "0 24px 24px",
        border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 14px",
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.07em", color: "var(--muted-foreground)",
          background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
        }}>
          Actions
        </div>

        {/* Suspend / Reactivate */}
        {!isInvited && (
          <DangerRow
            icon={isActive ? <Icons.UserX size={14} /> : <Icons.UserCheck size={14} />}
            label={isActive ? "Suspend access" : "Reactivate account"}
            desc={isActive
              ? "Block login and API access immediately"
              : "Restore login access for this member"}
            onClick={() => { onToggleSuspend(member.id); onClose() }}
          />
        )}

        {/* Resend invite */}
        {isInvited && (
          <DangerRow
            icon={<Icons.RefreshCw size={14} />}
            label="Resend invite"
            desc="Send a new invitation email to this address"
            onClick={() => alert(`Invite resent to ${member.email}`)}
          />
        )}

        {/* Remove */}
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
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--badge-error)", marginBottom: 8 }}>
              Remove {member.name}?
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>
              They will lose all access immediately. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  flex: 1, padding: "7px 0", border: "1px solid var(--badge-error)",
                  borderRadius: 7, fontSize: 12, fontWeight: 600, color: "var(--badge-error)",
                  background: "none", cursor: "pointer",
                }}
                onClick={() => { onRemove(member.id); onClose() }}
              >
                Yes, remove
              </button>
              <button
                style={{
                  flex: 1, padding: "7px 0", border: "1px solid var(--border)",
                  borderRadius: 7, fontSize: 12, fontWeight: 600, color: "var(--foreground)",
                  background: "var(--surface)", cursor: "pointer",
                }}
                onClick={() => setConfirmRemove(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </SlideOut>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ color: "var(--muted-foreground)", marginTop: 1, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: "var(--foreground)" }}>{value}</div>
      </div>
    </div>
  )
}

function DangerRow({
  icon, label, desc, destructive, onClick,
}: {
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
        border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer",
        transition: "background 0.1s",
      }}
    >
      <div style={{ color: destructive ? "var(--badge-error)" : "var(--muted-foreground)", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: destructive ? "var(--badge-error)" : "var(--foreground)" }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{desc}</div>
      </div>
    </button>
  )
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({ member, onSelect }: { member: Member; onSelect: (m: Member) => void }) {
  const [hovered, setHovered] = useState(false)
  const statusColor = STATUS_COLOR[member.status]
  const roleColor   = ROLE_COLOR[member.role]

  return (
    <div
      onClick={() => onSelect(member)}
      style={{
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 14,
        background: hovered ? "var(--accent)" : "transparent",
        cursor: "pointer", transition: "background 0.1s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: member.status === "active" ? member.avatarColor : "var(--muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700,
        color: member.status === "active" ? "#fff" : "var(--muted-foreground)",
        opacity: member.status === "suspended" ? 0.5 : 1,
      }}>
        {member.initials}
      </div>

      {/* Name + email */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: "var(--foreground)",
            opacity: member.status === "suspended" ? 0.5 : 1,
          }}>
            {member.name}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 100,
            background: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}44`,
          }}>
            {member.role}
          </span>
        </div>
        <div style={{
          fontSize: 12, color: "var(--muted-foreground)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {member.email}
        </div>
      </div>

      {/* Last active */}
      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 88 }}>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>
          {member.status === "invited" ? "Invite sent" : member.status === "suspended" ? "Suspended" : "Last active"}
        </div>
        {member.lastActive ? (
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>
            {formatRelative(member.lastActive)}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>
            {member.status === "invited" ? formatRelative(member.joinedAt) : "—"}
          </div>
        )}
      </div>

      {/* Status badge */}
      <div style={{
        padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
        background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
        minWidth: 76, textAlign: "center", flexShrink: 0,
      }}>
        {STATUS_LABEL[member.status]}
      </div>

      {/* Chevron hint */}
      <div style={{
        color: "var(--muted-foreground)", flexShrink: 0,
        opacity: hovered ? 0.5 : 0, transition: "opacity 0.1s",
      }}>
        <Icons.ChevronRight size={15} />
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function PeopleAccessMembersScreen() {
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
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
      )
    }
    return result
  }, [members, statusFilter, query])

  function handleRoleChange(id: string, role: MemberRole) {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, role } : m))
    setSelected(s => s?.id === id ? { ...s, role } : s)
  }

  function handleToggleSuspend(id: string) {
    setMembers(ms => ms.map(m =>
      m.id === id
        ? { ...m, status: m.status === "suspended" ? "active" : "suspended" }
        : m
    ))
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
            description={`${counts.all} members · Avance Financial workspace`}
            primaryAction={
              <Button variant="primary" size="sm">
                <Icons.UserPlus size={14} style={{ marginRight: 4 }} />
                Invite member
              </Button>
            }
          />
        )}
      >
        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
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
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search members…"
            />
          </div>
        </div>

        {/* List */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
          {/* Column header */}
          <div style={{
            padding: "10px 20px 10px 68px",
            display: "flex", alignItems: "center", gap: 14,
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
            filtered.map(m => (
              <MemberRow
                key={m.id}
                member={m}
                onSelect={setSelected}
              />
            ))
          )}
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)", textAlign: "right" }}>
            Showing {filtered.length} of {members.length} members
          </div>
        )}
      </ScreenLayout>

      {/* Member detail slide-out */}
      {selected && (
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
