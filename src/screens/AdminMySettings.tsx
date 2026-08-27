import { useState } from "react"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }        from "@/components/ui/header"
import { Button }        from "@/components/ui/button"
import { Tabs }          from "@/components/ui/tabs"

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      aria-pressed={value}
      style={{
        width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
        background: value ? "var(--primary)" : "var(--border)",
        position: "relative", transition: "background 200ms",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: value ? 18 : 2,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",  // audit-ignore: prototype fixture data
        transition: "left 200ms",
      }} />
    </button>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{title}</div>
        {description && <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface-raised)", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, description, children, last }: { label: string; description?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px",
      borderBottom: last ? "none" : "1px solid var(--border)",
      gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

// ─── Token card ───────────────────────────────────────────────────────────────

interface Token { id: string; name: string; created: string; lastUsed: string; scopes: string }

const TOKENS: Token[] = [
  { id: "t1", name: "Local dev (MacBook Pro)",    created: "Aug 10, 2026", lastUsed: "Today",          scopes: "read:models, write:governance" },
  { id: "t2", name: "CI pipeline — GitHub Actions", created: "Jul 22, 2026", lastUsed: "Yesterday",      scopes: "read:models" },
  { id: "t3", name: "Postman workspace",            created: "Jun 01, 2026", lastUsed: "Aug 18, 2026",   scopes: "read:all, write:all" },
]

function TokenCard({ token, onRevoke }: { token: Token; onRevoke: (id: string) => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "14px 16px", gap: 16,
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{token.name}</div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 3, display: "flex", gap: 10 }}>
          <span>Created {token.created}</span>
          <span>·</span>
          <span>Last used {token.lastUsed}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2, fontFamily: "monospace" }}>{token.scopes}</div>
      </div>
      <button
        onClick={() => onRevoke(token.id)}
        style={{ fontSize: 11, fontWeight: 600, color: "var(--badge-error)", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
      >
        Revoke
      </button>
    </div>
  )
}

// ─── Active session card ──────────────────────────────────────────────────────

interface Session { id: string; device: string; location: string; ip: string; lastActive: string; current: boolean }

const SESSIONS: Session[] = [
  { id: "s1", device: "Chrome 125 · macOS 14 · MacBook Pro", location: "San Francisco, CA",   ip: "104.28.91.14",  lastActive: "Now",           current: true  },
  { id: "s2", device: "Safari 17 · iOS 18 · iPhone 15 Pro",   location: "San Francisco, CA",   ip: "104.28.91.14",  lastActive: "2 hours ago",   current: false },
  { id: "s3", device: "Edge 124 · Windows 11 · Surface Laptop", location: "Mexico City, MX",  ip: "200.18.32.55",  lastActive: "Yesterday",     current: false },
]

function SessionCard({ session, onRevoke }: { session: Session; onRevoke: (id: string) => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "14px 16px", gap: 16,
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 0 }}>
        <Icons.Monitor size={14} style={{ marginTop: 2, color: "var(--muted-foreground)", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{session.device}</span>
            {session.current && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "var(--primary)20", color: "var(--primary)" }}>This session</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
            {session.location} · {session.ip} · Active {session.lastActive}
          </div>
        </div>
      </div>
      {!session.current && (
        <button
          onClick={() => onRevoke(session.id)}
          style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
        >
          Sign out
        </button>
      )}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function AdminMySettingsScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [tab, setTab] = useState("profile")

  // Profile
  const [displayName, setDisplayName] = useState("Thomas Gonzalez")
  const [jobTitle, setJobTitle]       = useState("Super Admin")
  const [timezone, setTimezone]       = useState("America/Los_Angeles")

  // Notifications
  const [notifs, setNotifs] = useState({
    securityAlerts:   true,
    memberActivity:   true,
    integrationErrors: true,
    auditDigest:      false,
    billingAlerts:    true,
    aiWorkerFailures: false,
  })

  // Tokens
  const [tokens, setTokens] = useState<Token[]>(TOKENS)
  const [showNewToken, setShowNewToken] = useState(false)
  const [newTokenName, setNewTokenName] = useState("")

  // Sessions
  const [sessions, setSessions] = useState<Session[]>(SESSIONS)

  function revokeToken(id: string) { setTokens(ts => ts.filter(t => t.id !== id)) }
  function revokeSession(id: string) { setSessions(ss => ss.filter(s => s.id !== id)) }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "7px 10px", fontSize: 13,
    border: "1px solid var(--border)", borderRadius: 7,
    background: "var(--surface)", color: "var(--foreground)", outline: "none",
  }

  const NOTIF_LABELS: Record<string, [string, string]> = {
    securityAlerts:    ["Security alerts",          "Failed logins, new IPs, policy violations"],
    memberActivity:    ["Member activity",           "Invites accepted, role changes, removals"],
    integrationErrors: ["Integration errors",        "Sync failures and authentication issues"],
    auditDigest:       ["Daily audit digest",        "Email summary of workspace activity at 08:00"],
    billingAlerts:     ["Billing alerts",            "Usage thresholds, upcoming renewals, invoices"],
    aiWorkerFailures:  ["AI worker failures",        "Worker run errors and human review queue overflow"],
  }

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="my-settings"
      onSidebarItemClick={onNavigate}
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="My Settings"
          description="Manage your personal profile, notifications, API tokens, and active sessions."
          primaryAction={
            <Button variant="main" size="sm">Save changes</Button>
          }
        />
      )}
    >
      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        <Tabs
          items={[
            { id: "profile",       label: "Profile"        },
            { id: "notifications", label: "Notifications"  },
            { id: "tokens",        label: "API Tokens"     },
            { id: "sessions",      label: "Sessions"       },
          ]}
          activeId={tab}
          onChange={setTab}
          size="s"
        />
      </div>

      {/* ── Profile ── */}
      {tab === "profile" && (
        <>
          <Section title="Identity">
            <Row label="Display name">
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ ...inputStyle, width: 220 }} />
            </Row>
            <Row label="Email" description="Managed by your identity provider — contact your admin to change.">
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>thomas.gonzalez@aimsos.ai</span>
            </Row>
            <Row label="Job title">
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={{ ...inputStyle, width: 220 }} />
            </Row>
            <Row label="Workspace role" description="Assigned by your admin." last>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                background: "var(--primary)20", color: "var(--primary)"
              }}>Super Admin</span>
            </Row>
          </Section>

          <Section title="Preferences">
            <Row label="Timezone">
              <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ ...inputStyle, width: 220 }}>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Mexico_City">Mexico City</option>
                <option value="Europe/Madrid">Madrid</option>
                <option value="UTC">UTC</option>
              </select>
            </Row>
            <Row label="Language" last>
              <select style={{ ...inputStyle, width: 220 }}>
                <option>English (US)</option>
                <option>Español</option>
              </select>
            </Row>
          </Section>

          <Section title="Avatar" description="Your initials are used as your avatar across the workspace.">
            <Row label="Initials" description="Auto-generated from your display name." last>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: "var(--primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff",  // audit-ignore: prototype fixture data
              }}>TG</div>
            </Row>
          </Section>
        </>
      )}

      {/* ── Notifications ── */}
      {tab === "notifications" && (
        <Section title="Email notifications" description="Choose which events send you an email. In-app alerts are always on.">
          {Object.entries(notifs).map(([key, val], i, arr) => {
            const [label, desc] = NOTIF_LABELS[key] ?? [key, ""]
            return (
              <Row key={key} label={label} description={desc} last={i === arr.length - 1}>
                <Toggle value={val} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
              </Row>
            )
          })}
        </Section>
      )}

      {/* ── API Tokens ── */}
      {tab === "tokens" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button variant="main" size="sm" onClick={() => setShowNewToken(true)}>
              <Icons.Plus size={14} style={{ marginRight: 4 }} />
              New token
            </Button>
          </div>

          {showNewToken && (
            <div style={{ border: "1px solid var(--primary)50", borderRadius: 10, padding: 16, marginBottom: 16, background: "var(--primary)08" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 10 }}>New API token</div>
              <input
                value={newTokenName}
                onChange={e => setNewTokenName(e.target.value)}
                placeholder="Token name (e.g. Local dev)"
                style={{ ...inputStyle, marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="secondary" size="sm" onClick={() => { setShowNewToken(false); setNewTokenName("") }}>Cancel</Button>
                <Button variant="main" size="sm" onClick={() => {
                  if (!newTokenName.trim()) return
                  setTokens(ts => [{ id: `t${Date.now()}`, name: newTokenName.trim(), created: "Today", lastUsed: "Never", scopes: "read:all" }, ...ts])
                  setShowNewToken(false); setNewTokenName("")
                }}>Generate</Button>
              </div>
            </div>
          )}

          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface-raised)" }}>
            {tokens.map(t => <TokenCard key={t.id} token={t} onRevoke={revokeToken} />)}
            {tokens.length === 0 && (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>No active tokens.</div>
            )}
          </div>
        </>
      )}

      {/* ── Sessions ── */}
      {tab === "sessions" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button variant="secondary" size="sm" onClick={() => setSessions(ss => ss.filter(s => s.current))}>
              Sign out all other sessions
            </Button>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface-raised)" }}>
            {sessions.map(s => <SessionCard key={s.id} session={s} onRevoke={revokeSession} />)}
          </div>
        </>
      )}
    </ScreenLayout>
  )
}
