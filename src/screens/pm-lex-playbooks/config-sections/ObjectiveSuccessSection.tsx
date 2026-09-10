import { Plus, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Tag } from "@/components/ui/tag"
import { Chip } from "@/components/ui/chip"
import { SectionCard, FieldHeading, HelperText, SelectField, AssistButton } from "./shared"
import {
  GOAL_TYPES, KPI_OPTIONS, PRIMARY_EVENTS, PREDEFINED_EXIT_CONDITIONS, EXIT_OUTCOMES, EXIT_CONDITION_KINDS,
  type ObjectiveSuccessDraft, type CustomExitConditionDraft,
} from "./types"

const SUB = "var(--field-supporting)"

export interface ObjectiveSuccessSectionProps {
  value:    ObjectiveSuccessDraft
  onChange: (patch: Partial<ObjectiveSuccessDraft>) => void
}

export function ObjectiveSuccessSection({ value, onChange }: ObjectiveSuccessSectionProps) {
  function toggleSuccessEvent(event: string) {
    const has = value.successEvents.includes(event)
    onChange({ successEvents: has ? value.successEvents.filter(e => e !== event) : [...value.successEvents, event] })
  }

  function toggleExitCondition(id: string) {
    const has = value.enabledExitConditionIds.includes(id)
    if (has) {
      onChange({ enabledExitConditionIds: value.enabledExitConditionIds.filter(x => x !== id) })
    } else {
      onChange({
        enabledExitConditionIds: [...value.enabledExitConditionIds, id],
        exitConditionOutcomes: { ...value.exitConditionOutcomes, [id]: value.exitConditionOutcomes[id] ?? EXIT_OUTCOMES[0] },
      })
    }
  }

  function setExitOutcome(id: string, outcome: string) {
    onChange({ exitConditionOutcomes: { ...value.exitConditionOutcomes, [id]: outcome } })
  }

  function addCustomExitCondition() {
    onChange({ customExitConditions: [...value.customExitConditions, { id: `exit-${Date.now()}`, text: "", kind: EXIT_CONDITION_KINDS[0], outcome: EXIT_OUTCOMES[0] }] })
  }

  function updateCustomExitCondition(id: string, patch: Partial<CustomExitConditionDraft>) {
    onChange({ customExitConditions: value.customExitConditions.map(c => c.id === id ? { ...c, ...patch } : c) })
  }

  function removeCustomExitCondition(id: string) {
    onChange({ customExitConditions: value.customExitConditions.filter(c => c.id !== id) })
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <SectionCard title="Goal Type">
        <div>
          <FieldHeading required>Goal Type</FieldHeading>
          <SelectField
            placeholder="Select the primary intent of this strategy"
            value={value.goalType}
            options={GOAL_TYPES}
            onChange={v => onChange({ goalType: v || null })}
          />
          <HelperText>Defines the primary intent of this strategy. Tells the agent how to prioritize actions and approach content.</HelperText>
        </div>
      </SectionCard>

      <SectionCard title="Primary Success Events">
        <div>
          <FieldHeading required>Primary Success Events</FieldHeading>
          <div className="flex flex-wrap gap-[8px]">
            {PRIMARY_EVENTS.map(event => (
              <Chip
                key={event}
                variant={value.successEvents.includes(event) ? "primary" : "secondary"}
                size="m"
                onClick={() => toggleSuccessEvent(event)}
              >
                {event}
              </Chip>
            ))}
          </div>
          <HelperText>The specific events that mark this playbook as successful. When any of these occur, the playbook exits and the objective is considered met.</HelperText>
        </div>
      </SectionCard>

      <SectionCard title="Exit Conditions">
        <p style={{ fontSize: 12, color: SUB, margin: 0 }}>
          Select each condition that can stop this plan early, then define what happens for each one.
        </p>

        <div className="flex flex-col gap-[10px]">
          {PREDEFINED_EXIT_CONDITIONS.map(cond => {
            const enabled = value.enabledExitConditionIds.includes(cond.id)
            return (
              <div key={cond.id} className="flex items-center justify-between gap-[12px]">
                <div className="flex items-center gap-[10px]">
                  <Toggle checked={enabled} onChange={() => toggleExitCondition(cond.id)} size="sm" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{cond.label}</div>
                    <Tag variant="neutral" size="sm">{cond.kind}</Tag>
                  </div>
                </div>
                {enabled && (
                  <div style={{ width: 200, flexShrink: 0 }}>
                    <SelectField
                      placeholder="Outcome"
                      value={value.exitConditionOutcomes[cond.id] ?? null}
                      options={EXIT_OUTCOMES}
                      onChange={v => setExitOutcome(cond.id, v)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {value.customExitConditions.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            {value.customExitConditions.map((c, i) => (
              <div key={c.id} className="flex items-start gap-[8px]" style={{ padding: 10, borderRadius: 8, border: "1px solid var(--field-border)" }}>
                <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
                  <Input
                    placeholder={`Custom exit condition ${i + 1} label`}
                    value={c.text}
                    onChange={e => updateCustomExitCondition(c.id, { text: e.target.value })}
                  />
                  <div className="flex items-center gap-[8px]">
                    <div className="flex-1 min-w-0">
                      <SelectField
                        placeholder="Kind"
                        value={c.kind}
                        options={EXIT_CONDITION_KINDS}
                        onChange={v => updateCustomExitCondition(c.id, { kind: (v || EXIT_CONDITION_KINDS[0]) as CustomExitConditionDraft["kind"] })}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <SelectField
                        placeholder="Outcome"
                        value={c.outcome || null}
                        options={EXIT_OUTCOMES}
                        onChange={v => updateCustomExitCondition(c.id, { outcome: v })}
                      />
                    </div>
                  </div>
                </div>
                <Button variant="tertiary" size="sm" iconPosition="alone" icon={<X size={14} />} onClick={() => removeCustomExitCondition(c.id)} aria-label={`Remove custom exit condition ${i + 1}`} />
              </div>
            ))}
          </div>
        )}

        <div>
          <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={addCustomExitCondition}>Add Custom Exit Condition</Button>
        </div>

        <HelperText>Each condition can trigger a different outcome — archive, escalate, retry, or hand off to another playbook.</HelperText>
      </SectionCard>

      <SectionCard title="Business KPI Association">
        <div>
          <FieldHeading>Business KPI Association</FieldHeading>
          <SelectField
            placeholder="No KPI association"
            value={value.kpiAssociation}
            options={KPI_OPTIONS}
            onChange={v => onChange({ kpiAssociation: v || KPI_OPTIONS[0] })}
          />
          <HelperText>Link this objective to a business metric for reporting</HelperText>
        </div>
      </SectionCard>

      <SectionCard title="Strategy Intent Notes">
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <FieldHeading>Strategy Intent Notes</FieldHeading>
          <AssistButton />
        </div>
        <Textarea
          placeholder="Why does this objective matter, strategically? (optional)"
          value={value.strategyNotes}
          onChange={e => onChange({ strategyNotes: e.target.value })}
        />
        <HelperText>
          Describe the strategic reasoning behind this objective. NBA uses this guidance to align decisions with business intent. Your instructions take priority over default optimization logic.
        </HelperText>
      </SectionCard>
    </div>
  )
}
