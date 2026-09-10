import { useState, type ReactNode } from "react"
import { Copy, Eye, Archive as ArchiveIcon, Trash2, ChevronDown, Check, Sparkle } from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import type { SidebarItem } from "@/components/ui/sidebar"
import { Header } from "@/components/ui/header"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Tabs } from "@/components/ui/tabs"
import { SwitchTab } from "@/components/ui/switch-tab"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { AvatarCircle } from "@/components/ui/avatar"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { EmptyState } from "@/components/ui/empty-state"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { WidgetCanvasView, type CanvasSlot } from "@/components/layouts/widget-canvas-view"
import { MenuItem } from "@/components/ui/menu-item"

import type { Playbook, PlaybookStatus, TrustMode } from "./playbooks-data"
import { ActivityUsage } from "./ActivityUsage"
import { VersionsTab } from "./VersionsTab"
import { HistoryTab } from "./HistoryTab"
import { CONFIG_SECTIONS, type ConfigSectionId } from "./config-section-labels"
import { BasicsSection } from "@/components/config-sections/BasicsSection"
import { KnowledgeSection } from "@/components/config-sections/KnowledgeSection"
import { MomentSection } from "@/components/config-sections/MomentSection"
import { HardGatesSection } from "@/components/config-sections/hard-gates"
import { ObjectiveSuccessSection } from "@/components/config-sections/ObjectiveSuccessSection"
import { PhasesActionsSection } from "@/components/config-sections/PhasesActionsSection"
import { TrustControlsSection } from "@/components/config-sections/TrustControlsSection"
import {
  basicsDraftFromPlaybook, knowledgeDraftFromPlaybook, momentDraftFromPlaybook, hardGatesDraftFromPlaybook,
  objectiveSuccessDraftFromPlaybook, phasesActionsDraftFromPlaybook, trustControlsDraftFromPlaybook,
  type BasicsDraft, type KnowledgeDraft, type MomentDraft, type HardGatesDraft, type ObjectiveSuccessDraft,
  type PhasesActionsDraft, type TrustControlsDraft,
} from "@/components/config-sections/types"

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "playbooks", label: "Playbooks", icon: "BookOpen" },
]

export type DetailTab = "overview" | "configuration" | "versions" | "history"
export type OverviewSubtab = "what-it-does" | "activity"

const STATUS_TAG_VARIANT: Record<PlaybookStatus, "success" | "alert"> = {
  Published: "success",
  Draft:     "alert",
}

const TRUST_ICON: Record<TrustMode, string> = {
  "Auto-Execute":       "Zap",
  "Approval Required":  "UserCheck",
  "Draft":              "PencilLine",
}

export interface PlaybookDetailProps {
  playbook:        Playbook
  tab:             DetailTab
  onTabChange:     (t: DetailTab) => void
  subtab:          OverviewSubtab
  onSubtabChange:  (s: OverviewSubtab) => void
  onBack:          () => void
  onDuplicate:     (source: Playbook) => void
  onArchive:       (id: string) => void
  onDelete:        (id: string) => void
}

function Dot() {
  return <span style={{ fontSize: 14, lineHeight: 1, color: "var(--el-bullet)" }}>•</span>
}

function generateSummary(pb: Playbook): string {
  const sources = pb.moment.eventSources.length > 1
    ? `${pb.moment.eventSources.slice(0, -1).join(", ")} and ${pb.moment.eventSources[pb.moment.eventSources.length - 1]}`
    : pb.moment.eventSources[0]

  const trustClause = pb.trustMode === "Draft"
    ? "Trust controls have not been configured yet, so every plan currently requires manual review."
    : `It operates in ${pb.trustMode.toLowerCase()} mode with a ${pb.trustControls.confidenceThreshold}% confidence threshold — anything below that bar escalates to ${pb.trustControls.escalatesTo}.`

  return `This playbook orchestrates a comprehensive ${pb.categoryTag.toLowerCase()} journey, triggering automatically when "${pb.moment.primaryEvent}" is detected across ${sources}. It runs through ${pb.phaseCount} sequential phases toward the objective: ${pb.objective.text.charAt(0).toLowerCase()}${pb.objective.text.slice(1)}. ${trustClause}`
}

// ── "Playbook Flow" building blocks ─────────────────────────────────────────

function FlowCard({ icon, label, iconVariant = "informative", children }: {
  icon: string
  label: string
  iconVariant?: "informative" | "purple" | "success" | "alert"
  children: ReactNode
}) {
  return (
    <CardContainer size="sm" className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <HighlightIcon iconName={icon} variant={iconVariant} size="sm" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--foreground)" }}>
        {children}
      </div>
    </CardContainer>
  )
}

function FlowArrow() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <ChevronDown size={16} style={{ color: "var(--field-supporting)" }} />
    </div>
  )
}

function PlaybookFlow({ playbook }: { playbook: Playbook }) {
  const gates = [
    ...playbook.hardGates.operational,
    ...playbook.hardGates.legal,
    ...playbook.hardGates.custom.map(c => ({ text: c.text, action: c.action })),
  ]

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="grid gap-[16px]" style={{ gridTemplateColumns: "1.6fr 1fr", alignItems: "start" }}>
        {/* ── Left column — Objective → Enters Play When → Trust Controls ── */}
        <div className="flex flex-col gap-[8px]">
          <FlowCard icon="Target" label="Objective">
            {playbook.objective.text}
          </FlowCard>
          <FlowArrow />
          <FlowCard icon="Radio" label="Enters Play When">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{playbook.moment.primaryEvent}</div>
            <div className="flex flex-wrap gap-[6px]">
              {playbook.moment.eventSources.map(s => (
                <Tag key={s} variant="lightBlue" size="sm">{s}</Tag>
              ))}
            </div>
          </FlowCard>
          <FlowArrow />
          <FlowCard icon={TRUST_ICON[playbook.trustMode]} label="Applies Trust Controls" iconVariant="purple">
            {playbook.trustMode === "Draft"
              ? "Not yet configured"
              : `${playbook.trustMode} · ${playbook.trustControls.confidenceThreshold}% confidence · escalates to ${playbook.trustControls.escalatesTo}`}
          </FlowCard>
        </div>

        {/* ── Right column — Hard gates, floats top-right ── */}
        <FlowCard icon="ListChecks" label="Requires All Hard Gates To Pass" iconVariant="alert">
          {gates.length === 0 ? (
            <span style={{ color: "var(--field-supporting)" }}>No hard gates configured</span>
          ) : (
            <ul className="flex flex-col gap-[6px]" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {gates.map((g, i) => (
                <li key={i} className="flex items-start gap-[6px]">
                  <Check size={13} style={{ color: "var(--hi-success-icon)", flexShrink: 0, marginTop: 2 }} />
                  <span>{g.text}</span>
                </li>
              ))}
            </ul>
          )}
        </FlowCard>
      </div>

      {/* ── Phases row — spans both columns ── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--field-supporting)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
          Executes Through {playbook.phases.length} Sequential Phases
        </div>
        <div className="flex flex-wrap gap-[12px]">
          {playbook.phases.map((ph, i) => (
            <CardContainer key={ph.id} size="sm" className="flex flex-col gap-[4px] flex-1 basis-[180px] min-w-[180px]">
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)" }}>Phase {i + 1}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{ph.name}</div>
              <div style={{ fontSize: 11, color: "var(--field-supporting)" }}>
                {ph.durationLabel} · Max {ph.maxAttempts} attempts · {ph.channels.join(" + ")}
              </div>
            </CardContainer>
          ))}
        </div>
      </div>

      <FlowArrow />

      {/* ── Success condition — closes the flow ── */}
      <FlowCard icon="CheckCircle2" label="Success Condition" iconVariant="success">
        {playbook.objective.successConditionText}
      </FlowCard>
    </div>
  )
}

// ── "What this playbook does" — Overview default sub-tab ───────────────────

function WhatThisPlaybookDoes({ playbook }: { playbook: Playbook }) {
  return (
    <WidgetCanvasView
      initialSlots={[
        {
          uid: "ai-summary", title: "AI Intelligence Summary", colSpan: 3,
          content: (
            <div className="flex flex-col gap-[12px]" style={{ padding: "0 16px 16px" }}>
              <div
                className="inline-flex items-center gap-[6px] self-start"
                style={{ padding: "4px 10px", borderRadius: 8, background: "var(--tag-purple-bg)", border: "1px solid var(--tag-purple-bd)" }}
              >
                <Sparkle size={13} style={{ color: "var(--tag-purple-fg)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tag-purple-fg)" }}>Auto-generated</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--foreground)", margin: 0 }}>
                {generateSummary(playbook)}
              </p>
              <div className="flex flex-wrap gap-[8px]">
                <Tag variant="informative" size="sm">Stage: {playbook.categoryTag}</Tag>
                <Tag variant="informative" size="sm">Phases: {playbook.phaseCount}</Tag>
                <Tag variant="informative" size="sm">Gates: {playbook.gateCount}</Tag>
                <Tag variant="informative" size="sm">Trust: {playbook.trustMode}</Tag>
              </div>
            </div>
          ),
        },
        {
          uid: "playbook-flow", title: "Playbook Flow", colSpan: 3, autoExpand: false, rowSpan: 16, minRowSpan: 10,
          content: (
            <div style={{ padding: "0 16px 16px" }}>
              <PlaybookFlow playbook={playbook} />
            </div>
          ),
        },
      ] satisfies CanvasSlot[]}
    />
  )
}

// ── Configuration tab — Sections nav ────────────────────────────────────────

function SectionsNav({ active, onChange }: { active: ConfigSectionId; onChange: (id: ConfigSectionId) => void }) {
  return (
    <CardContainer size="sm" className="!p-1 flex flex-col gap-[2px]">
      {CONFIG_SECTIONS.map(s => (
        <MenuItem
          key={s.id}
          label={s.label}
          leadingIcon={<HighlightIcon iconName={s.icon} variant={active === s.id ? "informative" : "neutral"} size="sm" />}
          state={active === s.id ? "focus" : "default"}
          onClick={() => onChange(s.id)}
        />
      ))}
    </CardContainer>
  )
}

function ConfigFooterBar({ onDiscard, onSave }: { onDiscard: () => void; onSave: () => void }) {
  return (
    <div
      style={{
        height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", background: "var(--surface)", borderTop: "1px solid var(--field-border)",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>
        All changes create a new draft revision. Publish when ready to go live.
      </span>
      <div className="flex items-center gap-[8px]">
        <Button variant="secondary" onClick={onDiscard}>Discard Changes</Button>
        <Button variant="primary" onClick={onSave}>Save Changes</Button>
      </div>
    </div>
  )
}

function ComingSoon({ label }: { label: string }) {
  return (
    <CardContainer variant="dashed">
      <EmptyState
        icon={Copy}
        showIcon={false}
        title={`${label} — coming in a future prompt`}
        description="This tab isn't built yet."
      />
    </CardContainer>
  )
}

export default function PlaybookDetail({
  playbook, tab, onTabChange, subtab, onSubtabChange,
  onBack, onDuplicate, onArchive, onDelete,
}: PlaybookDetailProps) {
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen]   = useState(false)

  const [configSection, setConfigSection] = useState<ConfigSectionId>("basics")
  const [basicsDraft, setBasicsDraft]       = useState<BasicsDraft>(() => basicsDraftFromPlaybook(playbook))
  const [knowledgeDraft, setKnowledgeDraft] = useState<KnowledgeDraft>(() => knowledgeDraftFromPlaybook(playbook))
  const [momentDraft, setMomentDraft]       = useState<MomentDraft>(() => momentDraftFromPlaybook(playbook))
  const [hardGatesDraft, setHardGatesDraft] = useState<HardGatesDraft>(() => hardGatesDraftFromPlaybook(playbook))
  const [objectiveSuccessDraft, setObjectiveSuccessDraft] = useState<ObjectiveSuccessDraft>(() => objectiveSuccessDraftFromPlaybook(playbook))
  const [phasesActionsDraft, setPhasesActionsDraft] = useState<PhasesActionsDraft>(() => phasesActionsDraftFromPlaybook(playbook))
  const [trustControlsDraft, setTrustControlsDraft] = useState<TrustControlsDraft>(() => trustControlsDraftFromPlaybook(playbook))

  function handleDiscardChanges() {
    setBasicsDraft(basicsDraftFromPlaybook(playbook))
    setKnowledgeDraft(knowledgeDraftFromPlaybook(playbook))
    setMomentDraft(momentDraftFromPlaybook(playbook))
    setHardGatesDraft(hardGatesDraftFromPlaybook(playbook))
    setObjectiveSuccessDraft(objectiveSuccessDraftFromPlaybook(playbook))
    setPhasesActionsDraft(phasesActionsDraftFromPlaybook(playbook))
    setTrustControlsDraft(trustControlsDraftFromPlaybook(playbook))
  }

  // TODO(future prompt): persist the draft as a new revision. Stub for now —
  // the footer copy ("All changes create a new draft revision") describes
  // the intended behavior, not yet wired to real persistence.
  function handleSaveChanges() {}

  return (
    <ScreenLayout
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="playbooks"
      stickyFooter={tab === "configuration"}
      pagination={tab === "configuration" ? <ConfigFooterBar onDiscard={handleDiscardChanges} onSave={handleSaveChanges} /> : undefined}
      header={isScrolled => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title={playbook.name}
          breadcrumb={
            <Breadcrumb
              depth={3}
              items={[
                { label: "Orchestration" },
                { label: "Playbooks", href: "playbooks" },
                { label: playbook.name },
              ]}
              onNavigate={href => { if (href === "playbooks") onBack() }}
            />
          }
          tag={
            <div className="flex items-center gap-[6px]">
              <Tag variant={STATUS_TAG_VARIANT[playbook.status]} size="sm">{playbook.status}</Tag>
              <Tag variant="neutral" size="sm">{playbook.version}</Tag>
            </div>
          }
          aux={
            <div className="flex items-center gap-[4px]">
              <Tooltip content="Duplicate">
                <Button variant="tertiary" size="sm" iconPosition="alone" icon={<Copy size={15} />} onClick={() => onDuplicate(playbook)} aria-label="Duplicate" />
              </Tooltip>
              <Tooltip content="View published version">
                <Button variant="tertiary" size="sm" iconPosition="alone" icon={<Eye size={15} />} onClick={() => {}} aria-label="View published version" />
              </Tooltip>
              <Tooltip content="Archive">
                <Button variant="tertiary" size="sm" iconPosition="alone" icon={<ArchiveIcon size={15} />} onClick={() => setArchiveOpen(true)} aria-label="Archive" />
              </Tooltip>
              <Tooltip content="Delete">
                <Button variant="warning" size="sm" iconPosition="alone" icon={<Trash2 size={15} />} onClick={() => setDeleteOpen(true)} aria-label="Delete" />
              </Tooltip>
            </div>
          }
        />
      )}
    >
      {/* ── Meta row ── */}
      <div className="flex flex-wrap items-center gap-[8px]" style={{ marginBottom: 24, fontSize: 12, color: "var(--field-supporting)" }}>
        <AvatarCircle name={playbook.owner.name} sizeKey="sm" />
        <span>{playbook.owner.name}</span>
        <Dot />
        <span>Updated {playbook.updatedRelative}</span>
        <Dot />
        <Tag variant="lightBlue" size="sm">{playbook.categoryTag}</Tag>
        <Tag variant="purple" size="sm">{playbook.trustMode}</Tag>
        <Dot />
        <span>{playbook.phaseCount} phases</span>
        <Dot />
        <span>{playbook.gateCount} gates</span>
      </div>

      <Tabs
        className="mb-[24px]"
        items={[
          { id: "overview",      label: "Overview" },
          { id: "configuration", label: "Configuration" },
          { id: "versions",      label: "Versions" },
          { id: "history",       label: "History" },
        ]}
        activeId={tab}
        onChange={id => onTabChange(id as DetailTab)}
      />

      {tab === "overview" && (
        <>
          <SwitchTab
            className="mb-[24px]"
            items={[
              { id: "what-it-does", label: "What this playbook does" },
              { id: "activity",     label: "Activity / Usage" },
            ]}
            value={subtab}
            onChange={id => onSubtabChange(id as OverviewSubtab)}
          />
          {subtab === "what-it-does"
            ? <WhatThisPlaybookDoes playbook={playbook} />
            : <ActivityUsage playbook={playbook} />
          }
        </>
      )}
      {tab === "configuration" && (
        <div className="flex gap-[24px]">
          <div style={{ width: 220, flexShrink: 0 }}>
            <SectionsNav active={configSection} onChange={setConfigSection} />
          </div>
          <div className="flex-1 min-w-0">
            {configSection === "basics" && (
              <BasicsSection value={basicsDraft} onChange={patch => setBasicsDraft(d => ({ ...d, ...patch }))} />
            )}
            {configSection === "knowledge" && (
              <KnowledgeSection value={knowledgeDraft} onChange={patch => setKnowledgeDraft(d => ({ ...d, ...patch }))} />
            )}
            {configSection === "moment" && (
              <MomentSection value={momentDraft} onChange={patch => setMomentDraft(d => ({ ...d, ...patch }))} />
            )}
            {configSection === "hard-gates" && (
              <HardGatesSection value={hardGatesDraft} onChange={patch => setHardGatesDraft(d => ({ ...d, ...patch }))} />
            )}
            {configSection === "objective-success" && (
              <ObjectiveSuccessSection value={objectiveSuccessDraft} onChange={patch => setObjectiveSuccessDraft(d => ({ ...d, ...patch }))} />
            )}
            {configSection === "phases-actions" && (
              // isCreateContext is always false here — this is the edit-existing
              // Configuration tab. Prompt 12's create wizard passes true.
              <PhasesActionsSection
                value={phasesActionsDraft}
                onChange={patch => setPhasesActionsDraft(d => ({ ...d, ...patch }))}
                isCreateContext={false}
              />
            )}
            {configSection === "trust-controls" && (
              <TrustControlsSection value={trustControlsDraft} onChange={patch => setTrustControlsDraft(d => ({ ...d, ...patch }))} />
            )}
            {!["basics", "knowledge", "moment", "hard-gates", "objective-success", "phases-actions", "trust-controls"].includes(configSection) && (
              <ComingSoon label={CONFIG_SECTIONS.find(s => s.id === configSection)?.label ?? "This section"} />
            )}
          </div>
        </div>
      )}
      {tab === "versions"      && <VersionsTab playbook={playbook} />}
      {tab === "history"       && <HistoryTab playbook={playbook} />}

      <ModalDialog
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        variant="confirmation"
        tone="warning"
        iconName="Archive"
        title="Archive this playbook?"
        description="Archiving pauses this playbook — no new plans will be triggered until it's restored. Plans already in progress will continue to completion."
        ctaPrimary={{ label: "Archive playbook", destructive: false, onClick: () => { onArchive(playbook.id); setArchiveOpen(false) } }}
        ctaSecondary={{ label: "Cancel" }}
      />

      <ModalDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        variant="confirmation"
        tone="error"
        iconName="Trash2"
        title="Delete this playbook?"
        description="This permanently deletes the playbook, its configuration, and its version history. This action cannot be undone."
        ctaPrimary={{ label: "Delete playbook", destructive: true, onClick: () => { onDelete(playbook.id); setDeleteOpen(false) } }}
        ctaSecondary={{ label: "Cancel" }}
      />
    </ScreenLayout>
  )
}
