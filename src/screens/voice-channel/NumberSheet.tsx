import { Settings, ArrowRight, Users, Shield, PhoneCall, Zap } from "lucide-react"
import { SlideOut } from "@/components/ui/slide-out"
import { Tag } from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import {
  AGENTS,
  type PhoneNumberRecord,
  type Call,
} from "./data"
import {
  AgentAvatar,
  AgentAvatarStack,
  NumberStatusTag,
  HilBadge,
  SentimentTag,
} from "./shared"

interface NumberPreviewProps {
  number:      PhoneNumberRecord | null
  open:        boolean
  onClose:     () => void
  onOpenFull:  () => void
  onRelease:   () => void
  allCalls:    Call[]
}

// ─────────────────────────────────────────────────────────────────────
// NumberSheet is a LIGHTWEIGHT preview using the DS SlideOut
// (right-anchored). It surfaces the essentials (identity + stats +
// agents summary + HiL + recent call snapshot) and hands off to the
// full detail page for deep configuration (Overview / Agents & Routing
// / Business Hours / Call History sub-tabs).
//
// Note: the source prototype uses a bottom sheet for this preview, and
// SlideOut supports anchor="bottom", but at desktop width the
// bottom-sheet layout stretches the narrow-column preview content
// across the whole viewport with a lot of wasted horizontal space.
// The right-anchor keeps the preview a tight 350px column beside the
// list. anchor="bottom" is still available for callers whose content
// genuinely spans full width.
// ─────────────────────────────────────────────────────────────────────

export function NumberSheet({ number, open, onClose, onOpenFull, onRelease, allCalls }: NumberPreviewProps) {
  if (!number) return null

  const assigned = number.agents
    .map(id => AGENTS.find(a => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a)

  const recentCall = allCalls.filter(c => c.numberId === number.id)[0] ?? null

  return (
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      // Title stays extremely short — the DS SlideOut header column is
      // narrow enough that anything longer than ~10 chars truncates.
      // The full number + label live prominently in the body's first
      // block instead.
      title="Preview"
      subtitle={number.label || "No label"}
      iconContent={<Settings size={18}/>}
      showStatus={true}
      statusLabel={number.status === "active" ? "Active" : "Suspended"}
      showTabs={false}
      showChips={false}
      showSearchBar={false}
      showCta={true}
      ctaPrimaryLabel="View full details →"
      ctaSecondaryLabel="Release Number"
      onCtaPrimary={onOpenFull}
      onCtaSecondary={onRelease}
    >
      <div className="flex flex-col gap-4 px-6 py-4">

        {/* Full phone number — lives in the body so it never truncates
            in the SlideOut header. Uses tabular-nums + white-space:nowrap
            so it never wraps mid-hyphen either. */}
        <div
          className="font-mono"
          style={{
            fontSize: 18, fontWeight: 700,
            color: "var(--color-text-title)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {number.number}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: -8 }}>
          {number.type}
        </div>

        {/* Identity badges */}
        <div className="flex flex-wrap gap-2">
          <NumberStatusTag status={number.status}/>
          {number.type !== "Toll-Free" && <Tag variant="purple" size="sm">10DLC: Approved</Tag>}
          {number.hil && <HilBadge hil={true}/>}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          <StatTile value={number.calls.toLocaleString()} label="Total Calls"/>
          <StatTile value="3:42"                          label="Avg Duration"/>
          <StatTile value={`$${number.cost.toFixed(2)}`}  label="Cost MTD"/>
        </div>

        {/* Agents summary */}
        <CardContainer variant="default" size="sm">
          <SectionLabel icon={<Users size={12}/>}>Assigned operators ({assigned.length})</SectionLabel>
          {assigned.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--color-text-caption)", fontStyle: "italic" }}>
              None — calls will go unanswered.
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <AgentAvatarStack colors={assigned.map(a => a.color)} initials={assigned.map(a => a.initials)} max={4}/>
              <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
                {assigned.slice(0, 3).map(a => a.name).join(", ")}{assigned.length > 3 ? ` +${assigned.length - 3}` : ""}
              </div>
            </div>
          )}
        </CardContainer>

        {/* Distribution */}
        <CardContainer variant="default" size="sm">
          <SectionLabel icon={<Zap size={12}/>}>Distribution</SectionLabel>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", marginTop: 4 }}>
            {number.dist}
          </div>
        </CardContainer>

        {/* HiL */}
        <CardContainer variant={number.hil ? "purple" : "default"} size="sm">
          <div className="flex items-center justify-between">
            <SectionLabel icon={<Shield size={12}/>}>Human in the Loop</SectionLabel>
            {number.hil
              ? <Tag variant="purple"    size="sm">Active</Tag>
              : <Tag variant="secondary" size="sm">Disabled</Tag>}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 4 }}>
            {number.hil
              ? "Handoff routing active — configure conditions and target in the full view."
              : "Enable HiL to configure human handoff routing."}
          </div>
        </CardContainer>

        {/* Most recent call snapshot */}
        {recentCall && (() => {
          const agent = AGENTS.find(a => a.id === recentCall.agent)
          return (
            <CardContainer variant="default" size="sm">
              <SectionLabel icon={<PhoneCall size={12}/>}>Most Recent Call</SectionLabel>
              <div className="flex items-center gap-3 mt-2">
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: recentCall.direction === "inbound" ? "var(--color-surface-primary-more-subtle)" : "var(--color-surface-neutral-more-subtle)",
                  color: recentCall.direction === "inbound" ? "var(--primary)" : "var(--color-text-caption)",
                  fontSize: 13, fontWeight: 700,
                }}>
                  {recentCall.direction === "inbound" ? "↙" : "↗"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-mono" style={{ fontSize: 12, color: "var(--color-text-title)", whiteSpace: "nowrap" }}>{recentCall.caller}</div>
                  <div className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
                    {agent && <AgentAvatar color={agent.color} initials={agent.initials} size={14}/>}
                    <span>{agent?.name}</span>
                    <span>·</span>
                    <span>{recentCall.time}</span>
                    <span>·</span>
                    <span className="font-mono">{recentCall.duration}</span>
                  </div>
                </div>
                <SentimentTag s={recentCall.sentiment}/>
                {recentCall.hil && <HilBadge hil={true}/>}
              </div>
            </CardContainer>
          )
        })()}

        {/* Explicit hint that CTA opens the full view */}
        <div
          className="flex items-center gap-2 mt-1"
          style={{ fontSize: 11, color: "var(--color-text-caption)" }}
        >
          <ArrowRight size={12}/>
          <span>Overview, Operators & Routing, Business Hours and Call History live in the full view.</span>
        </div>
      </div>
    </SlideOut>
  )
}

// ── Local helpers ──────────────────────────────────────────────────────

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <CardContainer variant="default" size="sm">
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-title)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{label}</div>
    </CardContainer>
  )
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
      color: "var(--color-text-caption)",
    }}>
      {icon} <span>{children}</span>
    </div>
  )
}
