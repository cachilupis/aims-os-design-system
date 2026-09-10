import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { OptionCard } from "@/components/experimental/widget-screen-parts"
import { SectionCard, FieldHeading, HelperText, SelectField, AssistButton } from "./shared"
import { EVENT_SOURCES, PRIMARY_EVENTS, CONDITION_OPERATORS, type MomentDraft, type QualifyingConditionDraft } from "./types"

const SUB = "var(--field-supporting)"

export interface MomentSectionProps {
  value:    MomentDraft
  onChange: (patch: Partial<MomentDraft>) => void
}

export function MomentSection({ value, onChange }: MomentSectionProps) {
  function toggleSource(id: string) {
    const has = value.eventSources.includes(id)
    onChange({ eventSources: has ? value.eventSources.filter(x => x !== id) : [...value.eventSources, id] })
  }

  function addCondition() {
    onChange({ qualifyingConditions: [...value.qualifyingConditions, { id: `qc-${Date.now()}`, field: "", operator: "=", value: "" }] })
  }

  function updateCondition(id: string, patch: Partial<QualifyingConditionDraft>) {
    onChange({ qualifyingConditions: value.qualifyingConditions.map(c => c.id === id ? { ...c, ...patch } : c) })
  }

  function removeCondition(id: string) {
    onChange({ qualifyingConditions: value.qualifyingConditions.filter(c => c.id !== id) })
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <SectionCard title="Primary Event / Moment">
        <div>
          <FieldHeading required>Primary Event / Moment</FieldHeading>
          <SelectField
            placeholder="Select the triggering event"
            value={value.primaryEvent}
            options={PRIMARY_EVENTS}
            onChange={v => onChange({ primaryEvent: v || null })}
          />
          <HelperText>The triggering event that signals playbook consideration</HelperText>
        </div>
      </SectionCard>

      <SectionCard title="Event Source / System">
        <div className="flex items-center justify-between">
          <FieldHeading required>Event Source / System</FieldHeading>
          <Button variant="tertiary" size="sm" onClick={() => onChange({ eventSources: [] })}>Clear all</Button>
        </div>

        <div className="flex items-center gap-[12px]">
          <div style={{ flex: 1, height: 1, background: "var(--field-border)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: SUB }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "var(--field-border)" }} />
        </div>

        <div className="grid grid-cols-2 gap-[12px]">
          {EVENT_SOURCES.map(src => (
            <OptionCard
              key={src.id}
              icon={src.icon}
              title={src.label}
              description={src.description}
              selected={value.eventSources.includes(src.id)}
              onSelect={() => toggleSource(src.id)}
            />
          ))}
        </div>

        <span style={{ fontSize: 12, fontWeight: 500, color: value.eventSources.length > 0 ? "var(--primary)" : SUB }}>
          {value.eventSources.length} sources selected as trigger
        </span>
      </SectionCard>

      <SectionCard title="Business Meaning">
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <FieldHeading>Business Meaning</FieldHeading>
          <AssistButton />
        </div>
        <Textarea
          placeholder="Why does this moment matter, and how should NBA prioritize it? (optional)"
          value={value.businessMeaning}
          onChange={e => onChange({ businessMeaning: e.target.value })}
        />
        <HelperText>
          Describe the business significance of this moment. NBA uses this to understand why the event matters and how to prioritize actions. Your explanation overrides generic event interpretation.
        </HelperText>
      </SectionCard>

      <SectionCard title="Qualifying Conditions">
        <div className="flex items-center justify-between">
          <FieldHeading>Qualifying Conditions</FieldHeading>
          <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={addCondition}>Add Condition</Button>
        </div>

        {value.qualifyingConditions.length === 0 ? (
          <p style={{ fontSize: 12, color: SUB, margin: 0 }}>
            No conditions yet — Add filters to refine when this playbook qualifies.
          </p>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {value.qualifyingConditions.map(c => (
              <div key={c.id} className="flex items-center gap-[8px]">
                <Input
                  className="flex-1 min-w-0"
                  placeholder="Field (e.g. Account type)"
                  value={c.field}
                  onChange={e => updateCondition(c.id, { field: e.target.value })}
                />
                <div style={{ width: 110, flexShrink: 0 }}>
                  <SelectField
                    placeholder="Operator"
                    value={c.operator}
                    options={CONDITION_OPERATORS}
                    onChange={v => updateCondition(c.id, { operator: (v || "=") as QualifyingConditionDraft["operator"] })}
                  />
                </div>
                <Input
                  className="flex-1 min-w-0"
                  placeholder="Value (e.g. Enterprise)"
                  value={c.value}
                  onChange={e => updateCondition(c.id, { value: e.target.value })}
                />
                <Button variant="tertiary" size="sm" iconPosition="alone" icon={<X size={14} />} onClick={() => removeCondition(c.id)} aria-label="Remove condition" />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
