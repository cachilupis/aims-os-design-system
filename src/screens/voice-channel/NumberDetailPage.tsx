import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Settings, Users, Clock, PhoneCall, Plus, Shield, Trash2 } from "lucide-react"
import { Tabs } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { Chip } from "@/components/ui/chip"
import { CardContainer } from "@/components/ui/card-container"
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
import { NativeSelect } from "./configure-shared"
import { useToast } from "./toast"

type SubTab = "overview" | "agents" | "hours" | "calls"

interface NumberDetailPageProps {
  number:     PhoneNumberRecord
  onBack:     () => void
  onChange:   (n: PhoneNumberRecord) => void
  onRelease:  () => void
  onAddAgent: () => void
  allCalls:   Call[]
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DEFAULT_OPEN = [false, true, true, true, true, true, false]

// HiL routing option pools. Kept inline (not in data.ts) because they
// are pure prototype fixture — the real routing target list will come
// from the users/roles service once wired.
const ROUTING_TARGETS = ["Specific Users", "Any Available Agent", "First Available", "On-call Rotation"]
const FALLBACK_OPTS   = ["Voicemail", "Call Queue", "Hangup", "Forward to Backup"]

export function NumberDetailPage({ number, onBack, onChange, onRelease, onAddAgent, allCalls }: NumberDetailPageProps) {
  const toast = useToast()

  const [tab,      setTab]      = useState<SubTab>("overview")
  const [draft,    setDraft]    = useState<PhoneNumberRecord>(number)
  const [openDays, setOpenDays] = useState<boolean[]>(DEFAULT_OPEN)
  const [triggers, setTriggers] = useState<Record<string, boolean>>(
    Object.fromEntries(HIL_TRIGGERS.map(t => [t.key, t.default]))
  )

  useEffect(() => { setDraft(number); setTab("overview") }, [number.id])

  const persist = (patch: Partial<PhoneNumberRecord>) => {
    const next = { ...draft, ...patch }
    setDraft(next); onChange(next)
  }

  const setDistribution = (dist: Distribution) => {
    persist({ dist })
    toast.success(`Distribution set to ${dist}`)
  }

  const setHil = (hil: boolean) => {
    persist({ hil })
    toast.info(`HiL ${hil ? "enabled" : "disabled"} for ${draft.number}`)
  }

  const removeAgent = (agentId: string) => {
    const agent = AGENTS.find(a => a.id === agentId)
    persist({ agents: draft.agents.filter(id => id !== agentId) })
    if (agent) toast.success(`${agent.name} removed`)
  }

  // Edits persist to the parent immediately (see `persist` above) — the
  // Number Detail page is an auto-save surface, so there is no "Save"
  // CTA and no dirty flag. Every field toasts on change instead.

  // Average call duration across this number's history, in "M:SS".
  const numberCalls = allCalls.filter(c => c.numberId === draft.id)
  const avgDuration = numberCalls.length === 0
    ? "—"
    : (() => {
        const totalSecs = numberCalls.reduce((sum, c) => {
          const [m, s] = c.duration.split(":").map(Number)
          return sum + (m || 0) * 60 + (s || 0)
        }, 0) / numberCalls.length
        const m = Math.floor(totalSecs / 60)
        const s = Math.round(totalSecs - m * 60)
        return `${m}:${s.toString().padStart(2, "0")}`
      })()

  return (
    <div className="flex flex-col gap-4">
      {/* Back-arrow + status tags + primary actions. The phone number
          itself lives in the ScreenLayout Header above this row (via
          voice-channel.tsx), so we don't repeat it here — only its
          state chips (Active / 10DLC / HiL) and the actions. Matches
          the AgentDetailPage header pattern. */}
      <div className="flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border-neutral-default)", paddingBottom: 12 }}>
        <button
          onClick={onBack}
          aria-label="Back to Numbers"
          style={{
            width: 28, height: 28, borderRadius: "var(--radius-md)",
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--color-text-caption)",
          }}
        >
          <ArrowLeft size={18}/>
        </button>
        <div className="flex items-center gap-2 flex-wrap" style={{ flex: 1, minWidth: 0 }}>
          <NumberStatusTag status={draft.status}/>
          {draft.type !== "Toll-Free" && <Tag variant="purple" size="sm">10DLC: Approved</Tag>}
          {draft.hil && <HilBadge hil={true}/>}
          <span style={{ fontSize: 12, color: "var(--color-text-caption)", marginLeft: 4 }}>
            Distribution: {draft.dist}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-auto">
          <Button variant="secondary" size="default" onClick={onRelease}>Release Number</Button>
        </div>
      </div>

      {/* Stats strip — Total Calls / Avg Duration / Cost MTD.
          Avg Duration is derived per-number, so n4 with 0 calls
          honestly shows "—" instead of a fake "3:42". */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={draft.calls.toLocaleString()} label="Total Calls" />
        <StatCard value={avgDuration}                  label="Avg Duration" />
        <StatCard value={`$${draft.cost.toFixed(2)}`}   label="Cost MTD" />
      </div>

      {/* Sub-tabs */}
      <Tabs
        items={[
          { id: "overview", label: "Overview",         icon: Settings   },
          { id: "agents",   label: "Operators & Routing", icon: Users   },
          { id: "hours",    label: "Business Hours",   icon: Clock      },
          { id: "calls",    label: `Call History (${allCalls.filter(c => c.numberId === draft.id).length})`, icon: PhoneCall  },
        ]}
        activeId={tab}
        onChange={(id) => setTab(id as SubTab)}
      />

      {tab === "overview" && <OverviewSubTab draft={draft} persist={persist}/>}
      {tab === "agents"   && (
        <AgentsSubTab
          draft={draft}
          onSetDist={setDistribution}
          onSetHil={setHil}
          removeAgent={removeAgent}
          triggers={triggers} setTriggers={setTriggers}
          onAddAgent={onAddAgent}
        />
      )}
      {tab === "hours"    && <HoursSubTab openDays={openDays} setOpenDays={setOpenDays}/>}
      {tab === "calls"    && <CallsSubTab numberId={draft.id} allCalls={allCalls}/>}
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <CardContainer variant="default" size="sm">
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-title)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{label}</div>
    </CardContainer>
  )
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-title)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
    <div className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--color-border-neutral-default)" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

// ── Sub-tabs ───────────────────────────────────────────────────────────

function OverviewSubTab({ draft, persist }: { draft: PhoneNumberRecord; persist: (p: Partial<PhoneNumberRecord>) => void }) {
  const [inbound, setInbound] = useState({
    acceptInbound: true,
    voicemail:     true,
    transcribe:    false,
  })
  const [language,        setLanguage]        = useState<string>(LANGUAGES[0])
  const [autoDetectLang,  setAutoDetectLang]  = useState(true)
  const [forwardTo,       setForwardTo]       = useState("")
  const [greeting,        setGreeting]        = useState("Hello! How can I help you today?")
  const [recordingNotice, setRecordingNotice] = useState("This call may be recorded.")
  return (
    <div className="grid grid-cols-2 gap-4">
      <CardContainer variant="default" size="default">
        <Section title="Identity & Status">
          <Row label="Phone Number"><span className="font-mono text-[13px]">{draft.number}</span></Row>
          <Row label="Label">
            <Input value={draft.label} onChange={e => persist({ label: e.target.value })} size="sm" style={{ width: 220 }} placeholder="Add a label"/>
          </Row>
          <Row label="Type"><Tag variant="neutral" size="sm">{draft.type}</Tag></Row>
          <Row label="Status"><NumberStatusTag status={draft.status}/></Row>
        </Section>
      </CardContainer>

      <CardContainer variant="default" size="default">
        <Section title="Inbound Settings">
          <Row label="Accept Inbound Calls" sub="Allow this number to receive calls">
            <Toggle checked={inbound.acceptInbound} onChange={c => setInbound({ ...inbound, acceptInbound: c })} size="default"/>
          </Row>
          <Row label="Voicemail Enabled" sub="Send unanswered calls to voicemail">
            <Toggle checked={inbound.voicemail} onChange={c => setInbound({ ...inbound, voicemail: c })} size="default"/>
          </Row>
          <Row label="Transcribe Voicemail">
            <Toggle checked={inbound.transcribe} onChange={c => setInbound({ ...inbound, transcribe: c })} size="default"/>
          </Row>
          <Row label="Forward To">
            <Input
              value={forwardTo}
              onChange={e => setForwardTo(e.target.value)}
              placeholder="(none)"
              size="sm"
              style={{ width: 160 }}
            />
          </Row>
        </Section>
      </CardContainer>

      <CardContainer variant="default" size="default">
        <Section title="Language">
          <Row label="Primary Language">
            <NativeSelect
              value={language}
              onChange={setLanguage}
              options={LANGUAGES.map(l => ({ value: l, label: l }))}
              size="sm"
            />
          </Row>
          <Row label="Auto-detect Caller Language" sub="Switch language mid-call based on caller">
            <Toggle checked={autoDetectLang} onChange={setAutoDetectLang} size="default"/>
          </Row>
        </Section>
      </CardContainer>

      <CardContainer variant="default" size="default">
        <Section title="Greeting & Recording">
          <Row label="Greeting">
            <Input value={greeting} onChange={e => setGreeting(e.target.value)} size="sm" style={{ width: 240 }}/>
          </Row>
          <Row label="Recording Notice">
            <Input value={recordingNotice} onChange={e => setRecordingNotice(e.target.value)} size="sm" style={{ width: 240 }}/>
          </Row>
        </Section>
      </CardContainer>
    </div>
  )
}

function AgentsSubTab({
  draft, onSetDist, onSetHil, removeAgent, triggers, setTriggers, onAddAgent,
}: {
  draft: PhoneNumberRecord
  onSetDist: (d: Distribution) => void
  onSetHil: (h: boolean) => void
  removeAgent: (id: string) => void
  triggers: Record<string, boolean>
  setTriggers: (t: Record<string, boolean>) => void
  onAddAgent: () => void
}) {
  const assigned = useMemo(
    () => draft.agents.map(id => AGENTS.find(a => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a),
    [draft.agents]
  )
  const [routingTarget, setRoutingTarget] = useState<string>(ROUTING_TARGETS[0])
  const [fallback,      setFallback]      = useState<string>(FALLBACK_OPTS[0])
  const [notify,        setNotify]        = useState({ email: true, inapp: true, phone: false })
  return (
    <div className="flex flex-col gap-4">
      <CardContainer variant="default" size="default">
        <Section
          title={`Assigned operators (${draft.agents.length})`}
          action={<Button variant="primary" size="sm" icon={<Plus size={12}/>} iconPosition="left" onClick={onAddAgent}>Add operator</Button>}
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
                    <th style={thStyle}>Operator</th>
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
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-caption)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
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
      </CardContainer>

      <div className="grid grid-cols-2 gap-4">
        <CardContainer variant="default" size="default">
          <Section title="Distribution Mode">
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Distribution mode">
              {DISTRIBUTION_MODES.map(m => (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={draft.dist === m.id}
                  onClick={() => onSetDist(m.id as Distribution)}
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
        </CardContainer>

        <CardContainer variant={draft.hil ? "purple" : "default"} size="default">
          <Section title="Human in the Loop (HiL)" action={
            <Toggle checked={draft.hil} onChange={onSetHil} size="default"/>
          }>
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: "var(--primary)" }}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-title)" }}>HiL Handoff</span>
              {draft.hil && <Tag variant="purple" size="sm">ACTIVE</Tag>}
            </div>
            {draft.hil ? (
              <div className="flex flex-col gap-3 mt-3">
                <div>
                  <div style={sectionMicroLabel}>Trigger Conditions</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {HIL_TRIGGERS.map(t => (
                      <Chip
                        variant={triggers[t.key] ? "primary" : "secondary"} size="s" key={t.key}
                        onClick={() => setTriggers({ ...triggers, [t.key]: !triggers[t.key] })}
                      >{t.label}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={sectionMicroLabel}>Routing Target</div>
                  <NativeSelect
                    value={routingTarget}
                    onChange={setRoutingTarget}
                    options={ROUTING_TARGETS.map(t => ({ value: t, label: t }))}
                    size="sm"
                  />
                </div>
                <div>
                  <div style={sectionMicroLabel}>Notifications</div>
                  <div className="flex flex-col gap-2 mt-2">
                    <Row label="✉️ Email">      <Toggle checked={notify.email}  onChange={c => setNotify({ ...notify, email:  c })} size="default"/></Row>
                    <Row label="🔔 In-app">     <Toggle checked={notify.inapp}  onChange={c => setNotify({ ...notify, inapp:  c })} size="default"/></Row>
                    <Row label="📞 Phone call"> <Toggle checked={notify.phone}  onChange={c => setNotify({ ...notify, phone:  c })} size="default"/></Row>
                  </div>
                </div>
                <div>
                  <div style={sectionMicroLabel}>Fallback if No Agent Available</div>
                  <NativeSelect
                    value={fallback}
                    onChange={setFallback}
                    options={FALLBACK_OPTS.map(f => ({ value: f, label: f }))}
                    size="sm"
                  />
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--color-text-caption)", padding: "6px 0" }}>
                Enable HiL to configure human handoff routing.
              </div>
            )}
          </Section>
        </CardContainer>
      </div>
    </div>
  )
}

function HoursSubTab({ openDays, setOpenDays }: { openDays: boolean[]; setOpenDays: (v: boolean[]) => void }) {
  const [timezone,   setTimezone]   = useState<string>(TIMEZONES[0])
  const [afterHours, setAfterHours] = useState<string>(AFTER_HOURS_OPTIONS[0])
  return (
    <div className="grid grid-cols-2 gap-4">
      <CardContainer variant="default" size="default">
        <Section title="Timezone">
          <NativeSelect
            value={timezone}
            onChange={setTimezone}
            options={TIMEZONES.map(t => ({ value: t, label: t }))}
            size="sm"
          />
        </Section>
      </CardContainer>

      <CardContainer variant="default" size="default">
        <Section title="After-Hours Behavior">
          <NativeSelect
            value={afterHours}
            onChange={setAfterHours}
            options={AFTER_HOURS_OPTIONS.map(o => ({ value: o, label: o }))}
            size="sm"
          />
        </Section>
      </CardContainer>

      <CardContainer variant="default" size="default" className="col-span-2">
        <Section title="Weekly Schedule">
          <div className="flex flex-col gap-2">
            {DAYS.map((day, i) => (
              <div key={day} className="flex items-center gap-3" style={{ padding: "8px 12px", border: "1px solid var(--color-border-neutral-default)", borderRadius: 8 }}>
                <div style={{ width: 50, fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>{day}</div>
                <Toggle
                  checked={openDays[i]}
                  onChange={(c) => { const next = [...openDays]; next[i] = c; setOpenDays(next) }}
                  size="default"
                />
                <div className="flex items-center gap-2 ml-auto" style={{ opacity: openDays[i] ? 1 : 0.35 }}>
                  <Input size="sm" type="time" defaultValue={openDays[i] ? "09:00" : ""} disabled={!openDays[i]} style={{ width: 110 }}/>
                  <span style={{ color: "var(--color-text-caption)" }}>–</span>
                  <Input size="sm" type="time" defaultValue={openDays[i] ? "18:00" : ""} disabled={!openDays[i]} style={{ width: 110 }}/>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </CardContainer>
    </div>
  )
}

function CallsSubTab({ numberId, allCalls }: { numberId: string; allCalls: Call[] }) {
  const calls = allCalls.filter(c => c.numberId === numberId)
  if (calls.length === 0) {
    return (
      <CardContainer variant="dashed" size="default">
        <EmptyState icon={PhoneCall} title="No calls yet" description="Calls to this number will appear here."/>
      </CardContainer>
    )
  }
  return (
    <CardContainer variant="default" size="default">
      <Section title="Recent Calls">
        <CardContainer variant="default" size="sm" className="!p-0 overflow-hidden">
          {calls.map((c, i) => {
            const agent = AGENTS.find(a => a.id === c.agent)
            return (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px",
                borderTop: i > 0 ? "1px solid var(--color-border-neutral-default)" : "none",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: c.direction === "inbound" ? "var(--color-surface-primary-more-subtle)" : "var(--color-surface-neutral-more-subtle)",
                  color: c.direction === "inbound" ? "var(--primary)" : "var(--color-text-caption)",
                  fontSize: 14, fontWeight: 700,
                }}>{c.direction === "inbound" ? "↙" : "↗"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-mono" style={{ fontSize: 13, color: "var(--color-text-title)" }}>{c.caller}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{agent?.name} · {c.time}</div>
                </div>
                {c.hil && <HilBadge hil={true}/>}
                <SentimentTag s={c.sentiment}/>
                <span className="font-mono" style={{ fontSize: 12, color: "var(--color-text-caption)" }}>{c.duration}</span>
              </div>
            )
          })}
        </CardContainer>
      </Section>
    </CardContainer>
  )
}

// ── Inline styles ──────────────────────────────────────────────────────

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
