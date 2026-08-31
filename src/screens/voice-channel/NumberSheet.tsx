import { useEffect, useMemo, useState } from "react"
import { Settings, Users, Clock, PhoneCall, Plus, Shield, Trash2 } from "lucide-react"
import { SlideOut } from "@/components/ui/slide-out"
import { Tabs } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"
import {
  AGENTS,
  DISTRIBUTION_MODES,
  HIL_TRIGGERS,
  LANGUAGES,
  TIMEZONES,
  AFTER_HOURS_OPTIONS,
  type PhoneNumberRecord,
  type Distribution,
  type Call,
} from "./data"
import {
  AgentAvatar,
  AgentStatusDot,
  SentimentBar,
  NumberStatusTag,
  HilBadge,
  SentimentTag,
} from "./shared"

type SubTab = "overview" | "agents" | "hours" | "calls"

interface NumberSheetProps {
  number:      PhoneNumberRecord | null
  open:        boolean
  onClose:     () => void
  onChange:    (n: PhoneNumberRecord) => void
  onRelease:   () => void
  onAddAgent:  () => void
  allCalls:    Call[]
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DEFAULT_OPEN = [false, true, true, true, true, true, false]

export function NumberSheet({ number, open, onClose, onChange, onRelease, onAddAgent, allCalls }: NumberSheetProps) {
  const [tab,   setTab]   = useState<SubTab>("overview")
  const [draft, setDraft] = useState<PhoneNumberRecord | null>(number)

  // Weekly schedule state (local, since prototype has it stateful in UI)
  const [openDays, setOpenDays] = useState<boolean[]>(DEFAULT_OPEN)

  // HiL trigger chips (locally toggleable)
  const [triggers, setTriggers] = useState<Record<string, boolean>>(
    Object.fromEntries(HIL_TRIGGERS.map(t => [t.key, t.default]))
  )

  useEffect(() => {
    setDraft(number)
    setTab("overview")
  }, [number?.id])

  if (!draft) return null

  const persist = (patch: Partial<PhoneNumberRecord>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    onChange(next)
  }

  const removeAgent = (agentId: string) => {
    persist({ agents: draft.agents.filter(id => id !== agentId) })
  }

  return (
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      title={draft.number}
      subtitle={`${draft.label || "No label"} · ${draft.type}`}
      iconContent={<Settings size={18}/>}
      showStatus={true}
      statusLabel={draft.status === "active" ? "Active" : "Suspended"}
      showTabs={false}
      showChips={false}
      showSearchBar={false}
      showCta={true}
      ctaPrimaryLabel="Save Configuration"
      ctaSecondaryLabel="Release Number"
      onCtaPrimary={onClose}
      onCtaSecondary={onRelease}
    >
      <div className="flex flex-col gap-4 px-6 py-4">

        {/* Identity badges */}
        <div className="flex flex-wrap gap-2">
          <NumberStatusTag status={draft.status}/>
          {draft.type !== "Toll-Free" && (
            <Tag variant="purple" size="sm">10DLC: Approved</Tag>
          )}
          {draft.hil && <HilBadge hil={true}/>}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          <CardContainer variant="default" size="sm">
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-title)" }}>{draft.calls.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>Total Calls</div>
          </CardContainer>
          <CardContainer variant="default" size="sm">
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-title)" }}>3:42</div>
            <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>Avg Duration</div>
          </CardContainer>
          <CardContainer variant="default" size="sm">
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-title)" }}>${draft.cost.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>Cost MTD</div>
          </CardContainer>
        </div>

        {/* Sub-tabs */}
        <Tabs
          items={[
            { id: "overview", label: "Overview",         icon: Settings   },
            { id: "agents",   label: "Agents & Routing", icon: Users      },
            { id: "hours",    label: "Business Hours",   icon: Clock      },
            { id: "calls",    label: "Call History",     icon: PhoneCall  },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as SubTab)}
          size="s"
        />

        {tab === "overview" && (
          <OverviewSubTab draft={draft} persist={persist}/>
        )}

        {tab === "agents" && (
          <AgentsSubTab
            draft={draft}
            persist={persist}
            removeAgent={removeAgent}
            triggers={triggers}
            setTriggers={setTriggers}
            onAddAgent={onAddAgent}
          />
        )}

        {tab === "hours" && (
          <HoursSubTab openDays={openDays} setOpenDays={setOpenDays}/>
        )}

        {tab === "calls" && (
          <CallsSubTab numberId={draft.id} allCalls={allCalls}/>
        )}

      </div>
    </SlideOut>
  )
}

// ── Sub-tabs ───────────────────────────────────────────────────────────

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-title)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--color-border-neutral-subtle, var(--color-border-neutral-default))" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function OverviewSubTab({ draft, persist }: { draft: PhoneNumberRecord; persist: (p: Partial<PhoneNumberRecord>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Identity & Status">
        <Row label="Phone Number">
          <span className="font-mono text-[13px]" style={{ color: "var(--color-text-title)" }}>{draft.number}</span>
        </Row>
        <Row label="Label">
          <Input
            value={draft.label}
            onChange={e => persist({ label: e.target.value })}
            size="sm"
            style={{ width: 200 }}
            placeholder="Add a label"
          />
        </Row>
        <Row label="Type">
          <Tag variant="neutral" size="sm">{draft.type}</Tag>
        </Row>
        <Row label="Status">
          <NumberStatusTag status={draft.status}/>
        </Row>
      </Section>

      <Section title="Inbound Settings">
        <Row label="Accept Inbound Calls" sub="Allow this number to receive calls">
          <Toggle checked={true} onChange={() => {}} size="default"/>
        </Row>
        <Row label="Voicemail Enabled" sub="Send unanswered calls to voicemail">
          <Toggle checked={true} onChange={() => {}} size="default"/>
        </Row>
        <Row label="Transcribe Voicemail">
          <Toggle checked={false} onChange={() => {}} size="default"/>
        </Row>
        <Row label="Forward To">
          <Input placeholder="(none)" size="sm" style={{ width: 160 }}/>
        </Row>
      </Section>

      <Section title="Language">
        <Row label="Primary Language">
          <Select value={LANGUAGES[0]} size="sm" />
        </Row>
        <Row label="Auto-detect Caller Language" sub="Switch language mid-call based on caller">
          <Toggle checked={true} onChange={() => {}} size="default"/>
        </Row>
      </Section>

      <Section title="Greeting & Recording">
        <Row label="Greeting">
          <Input defaultValue="Hello! How can I help you today?" size="sm" style={{ width: 240 }}/>
        </Row>
        <Row label="Recording Notice">
          <Input defaultValue="This call may be recorded." size="sm" style={{ width: 240 }}/>
        </Row>
      </Section>
    </div>
  )
}

function AgentsSubTab({
  draft, persist, removeAgent, triggers, setTriggers, onAddAgent,
}: {
  draft: PhoneNumberRecord
  persist: (p: Partial<PhoneNumberRecord>) => void
  removeAgent: (id: string) => void
  triggers: Record<string, boolean>
  setTriggers: (t: Record<string, boolean>) => void
  onAddAgent: () => void
}) {
  const assigned = useMemo(
    () => draft.agents.map(id => AGENTS.find(a => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a),
    [draft.agents]
  )

  return (
    <div className="flex flex-col gap-5">
      <Section
        title={`Assigned Agents (${draft.agents.length})`}
        action={<Button variant="primary" size="sm" icon={<Plus size={12}/>} iconPosition="left" onClick={onAddAgent}>Add Agent</Button>}
      >
        {assigned.length === 0 ? (
          <CardContainer variant="dashed" size="default">
            <EmptyState
              icon={Users}
              title="No agents assigned"
              description="Calls will go unanswered until agents are added."
              ctaLabel="Add first agent"
              onCta={onAddAgent}
            />
          </CardContainer>
        ) : (
          <CardContainer variant="default" size="sm" className="!p-0 overflow-hidden">
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--color-surface-neutral-more-subtle)" }}>
                  <th style={thStyle}>Agent</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Calls 30d</th>
                  <th style={thStyle}>Sentiment</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {assigned.map(a => (
                  <tr key={a.id} style={{ borderTop: "1px solid var(--color-border-neutral-default)" }}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <AgentAvatar color={a.color} initials={a.initials} size={24}/>
                        <div>
                          <div style={{ fontWeight: 500, color: "var(--color-text-title)" }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><Tag variant="secondary" size="sm">{a.role}</Tag></td>
                    <td style={tdStyle}><AgentStatusDot status={a.status}/></td>
                    <td style={tdStyle}><span style={{ color: "var(--color-text-caption)" }}>{a.calls}</span></td>
                    <td style={tdStyle}><SentimentBar value={a.sentiment}/></td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={() => removeAgent(a.id)}
                        aria-label={`Remove ${a.name}`}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--color-text-caption)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4,
                        }}
                      >
                        <Trash2 size={12}/> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContainer>
        )}
      </Section>

      <Section title="Distribution Mode">
        <div className="flex flex-col gap-2">
          {DISTRIBUTION_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => persist({ dist: m.id as Distribution })}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                border: `1px solid ${draft.dist === m.id ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                borderRadius: 8,
                background: draft.dist === m.id ? "var(--color-surface-primary-more-subtle)" : "transparent",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <span style={{
                width: 14, height: 14, borderRadius: "50%",
                border: `2px solid ${draft.dist === m.id ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                {draft.dist === m.id && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }}/>}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{m.id}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Human in the Loop (HiL)">
        <CardContainer variant={draft.hil ? "purple" : "default"} size="default">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: "var(--primary)" }}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-title)" }}>HiL Handoff</span>
              {draft.hil && <Tag variant="purple" size="sm">ACTIVE</Tag>}
            </div>
            <Toggle checked={draft.hil} onChange={(c) => persist({ hil: c })} size="default"/>
          </div>

          {draft.hil ? (
            <div className="flex flex-col gap-4 mt-3">
              <div>
                <div style={sectionMicroLabel}>Trigger Conditions</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {HIL_TRIGGERS.map(t => (
                    <Chip
                      variant={triggers[t.key] ? "primary" : "secondary"}
                      size="s"
                      key={t.key}
                      onClick={() => setTriggers({ ...triggers, [t.key]: !triggers[t.key] })}
                    >
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <div style={sectionMicroLabel}>Routing Target</div>
                <Select value="Specific Users" size="sm" />
              </div>

              <div>
                <div style={sectionMicroLabel}>Notifications (simultaneous)</div>
                <div className="flex flex-col gap-2 mt-2">
                  <Row label="✉️  Email"><Toggle checked={true}  onChange={() => {}} size="default"/></Row>
                  <Row label="🔔  In-app"><Toggle checked={true}  onChange={() => {}} size="default"/></Row>
                  <Row label="📞  Phone call to agent"><Toggle checked={false} onChange={() => {}} size="default"/></Row>
                </div>
              </div>

              <div>
                <div style={sectionMicroLabel}>Fallback if No Agent Available</div>
                <Select value="Voicemail" size="sm" />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--color-text-caption)", padding: "6px 0" }}>
              Enable HiL to configure human handoff routing.
            </div>
          )}
        </CardContainer>
      </Section>
    </div>
  )
}

function HoursSubTab({ openDays, setOpenDays }: { openDays: boolean[]; setOpenDays: (v: boolean[]) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Timezone">
        <Select value={TIMEZONES[0]} size="sm" />
      </Section>

      <Section title="Weekly Schedule">
        <div className="flex flex-col gap-2">
          {DAYS.map((day, i) => (
            <div
              key={day}
              className="flex items-center gap-3"
              style={{ padding: "8px 12px", border: "1px solid var(--color-border-neutral-default)", borderRadius: 8 }}
            >
              <div style={{ width: 40, fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>{day}</div>
              <Toggle
                checked={openDays[i]}
                onChange={(c) => {
                  const next = [...openDays]; next[i] = c; setOpenDays(next)
                }}
                size="default"
              />
              <div className="flex items-center gap-2 ml-auto" style={{ opacity: openDays[i] ? 1 : 0.35 }}>
                <Input
                  size="sm"
                  type="time"
                  defaultValue={openDays[i] ? "09:00" : ""}
                  disabled={!openDays[i]}
                  style={{ width: 100 }}
                />
                <span style={{ color: "var(--color-text-caption)" }}>–</span>
                <Input
                  size="sm"
                  type="time"
                  defaultValue={openDays[i] ? "18:00" : ""}
                  disabled={!openDays[i]}
                  style={{ width: 100 }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="After-Hours Behavior">
        <Select value={AFTER_HOURS_OPTIONS[0]} size="sm" />
      </Section>
    </div>
  )
}

function CallsSubTab({ numberId, allCalls }: { numberId: string; allCalls: Call[] }) {
  const calls = allCalls.filter(c => c.numberId === numberId)

  if (calls.length === 0) {
    return (
      <CardContainer variant="dashed" size="default">
        <EmptyState
          icon={PhoneCall}
          title="No calls yet"
          description="Calls to this number will appear here."
        />
      </CardContainer>
    )
  }

  return (
    <Section title="Recent Calls">
      <CardContainer variant="default" size="sm" className="!p-0 overflow-hidden">
        {calls.map((c, i) => {
          const agent = AGENTS.find(a => a.id === c.agent)
          return (
            <div
              key={c.id}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px",
                borderTop: i > 0 ? "1px solid var(--color-border-neutral-default)" : "none",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: c.direction === "inbound" ? "var(--color-surface-primary-more-subtle)" : "var(--color-surface-neutral-more-subtle)",
                color: c.direction === "inbound" ? "var(--primary)" : "var(--color-text-caption)",
                fontSize: 14, fontWeight: 700,
              }}>
                {c.direction === "inbound" ? "↙" : "↗"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-mono" style={{ fontSize: 13, color: "var(--color-text-title)" }}>{c.caller}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
                  {agent?.name} · {c.time}
                </div>
              </div>
              {c.hil && <HilBadge hil={true}/>}
              <SentimentTag s={c.sentiment}/>
              <span className="font-mono" style={{ fontSize: 12, color: "var(--color-text-caption)" }}>{c.duration}</span>
            </div>
          )
        })}
      </CardContainer>
    </Section>
  )
}

// ── Inline styles used above ───────────────────────────────────────────

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.06em",
  color: "var(--color-text-caption)",
}

const tdStyle: React.CSSProperties = { padding: "10px", verticalAlign: "middle" }

const sectionMicroLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
  color: "var(--color-text-caption)",
}
