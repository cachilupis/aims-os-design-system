import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { OptionCard } from "@/components/experimental/widget-screen-parts"
import { SectionCard, FieldHeading, HelperText, SelectField, AssistButton } from "./shared"
import { DEPARTMENTS, OWNERS, PRIORITIES, type BasicsDraft } from "./types"

export interface BasicsSectionProps {
  value:    BasicsDraft
  onChange: (patch: Partial<BasicsDraft>) => void
}

export function BasicsSection({ value, onChange }: BasicsSectionProps) {
  return (
    <div className="flex flex-col gap-[16px]">
      <SectionCard title="Playbook Identity">
        <div>
          <FieldHeading required>Playbook Name</FieldHeading>
          <Input
            placeholder="e.g. Enterprise Onboarding Excellence"
            value={value.name}
            onChange={e => onChange({ name: e.target.value })}
          />
        </div>
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <FieldHeading>Short Description</FieldHeading>
            <AssistButton />
          </div>
          <Textarea
            placeholder="What does this playbook do, and who does it target?"
            value={value.shortDescription}
            onChange={e => onChange({ shortDescription: e.target.value })}
          />
          <HelperText>Brief summary of what this playbook does and who it targets</HelperText>
        </div>
      </SectionCard>

      <SectionCard title="Tenant Scope">
        <div className="grid grid-cols-2 gap-[12px]">
          <OptionCard
            icon="Globe"
            title="Global"
            description="All tenants"
            selected={value.tenantScope === "global"}
            onSelect={() => onChange({ tenantScope: "global" })}
          />
          <OptionCard
            icon="Users"
            title="Specific Tenants & Rooftops"
            description="Multi-select"
            selected={value.tenantScope === "specific"}
            onSelect={() => onChange({ tenantScope: "specific" })}
          />
        </div>
      </SectionCard>

      <SectionCard title="Organization">
        <div className="grid grid-cols-2 gap-[16px]">
          <div>
            <FieldHeading required>Department</FieldHeading>
            <SelectField
              placeholder="Select department"
              value={value.department}
              options={DEPARTMENTS}
              onChange={v => onChange({ department: (v || null) as BasicsDraft["department"] })}
            />
          </div>
          <div>
            <FieldHeading required>Owner</FieldHeading>
            <SelectField
              placeholder="Select owner"
              value={value.owner}
              options={OWNERS}
              onChange={v => onChange({ owner: (v || null) as BasicsDraft["owner"] })}
            />
          </div>
        </div>

        <div>
          <FieldHeading required>Priority / Arbitration Rank</FieldHeading>
          <div className="grid grid-cols-4 gap-[12px]">
            {PRIORITIES.map(p => (
              <OptionCard
                key={p.id}
                icon={p.icon}
                title={p.label}
                description={p.sub}
                selected={value.priority === p.id}
                onSelect={() => onChange({ priority: p.id })}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Execution Behavior">
        <Toggle
          checked={value.exclusiveExecution}
          onChange={checked => onChange({ exclusiveExecution: checked })}
          label="Exclusive execution"
          description="When on, this playbook runs alone. If another playbook is already active for the same customer, this one will wait rather than run alongside it."
        />
        <div>
          <FieldHeading>Tags</FieldHeading>
          <Input
            placeholder="e.g. enterprise, onboarding, revenue (optional)"
            value={value.tags}
            onChange={e => onChange({ tags: e.target.value })}
          />
        </div>
        <div>
          <FieldHeading>Internal Notes</FieldHeading>
          <Textarea
            placeholder="Notes for the team — not shown to customers (optional)"
            value={value.internalNotes}
            onChange={e => onChange({ internalNotes: e.target.value })}
          />
        </div>
      </SectionCard>
    </div>
  )
}
