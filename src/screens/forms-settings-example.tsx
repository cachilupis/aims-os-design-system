import { useState } from "react"
import { Sparkles, Bell, Settings } from "lucide-react"
import { AppBackground }    from "@/components/ui/app-background"
import { Topbar }           from "@/components/ui/topbar"
import { Sidebar, DEFAULT_SIDEBAR_ITEMS } from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { Input }            from "@/components/ui/input"
import { Select }           from "@/components/ui/select"
import { Textarea }         from "@/components/ui/textarea"
import { Button }           from "@/components/ui/button"
import { ModalDialog }      from "@/components/ui/modal-dialog"
import type { TopbarAction } from "@/components/ui/topbar"

const TOPBAR_ACTIONS: TopbarAction[] = [
  { icon: <Sparkles size={16} />, label: "AI",            variant: "primary" },
  { icon: <Bell     size={16} />, label: "Notifications"                     },
  { icon: <Settings size={16} />, label: "Settings"                          },
]

type Props = { onClose: () => void }

export function FormsSettingsExampleScreen({ onClose }: Props) {
  const [activeSidebar, setActiveSidebar] = useState("automations")
  const [name,      setName]      = useState("Customer Churn Alert")
  const [desc,      setDesc]      = useState("Monitors customer health scores and triggers intervention when a score drops below the defined threshold.")
  const [threshold, setThreshold] = useState("< 60")
  const [notes,     setNotes]     = useState("")
  const [successOpen, setSuccessOpen] = useState(false)

  const canSave = name.trim() !== "" && threshold.trim() !== ""

  return (
    <div className="flex flex-col h-full">
      <AppBackground />

      <Topbar
        workspaceName="AI Workers"
        companyName="AIMS OS"
        actions={TOPBAR_ACTIONS}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          items={DEFAULT_SIDEBAR_ITEMS}
          activeId={activeSidebar}
          onItemClick={setActiveSidebar}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Automation Settings"
            description="Configure behavior, thresholds, and notification preferences"
            backButton
            size="size-l"
            primaryAction={
              <Button variant="primary" size="sm" disabled={!canSave} onClick={() => setSuccessOpen(true)}>
                Save changes
              </Button>
            }
            secondaryAction={
              <Button variant="secondary" size="sm" onClick={onClose}>
                Discard
              </Button>
            }
          />

          <div className="flex-1 overflow-y-auto px-[32px] py-[28px]">
            <div className="max-w-[680px] flex flex-col gap-[24px]">

              {/* Section: General */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide mb-[4px]"
                  style={{ color: "var(--field-label)" }}>General</div>
                <div className="flex flex-col gap-[16px]">
                  <Input
                    placeholder="Automation name *"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    state={name.trim() ? "success" : "default"}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Section: Behavior */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide mb-[4px]"
                  style={{ color: "var(--field-label)" }}>Behavior</div>
                <div className="flex flex-col gap-[16px]">
                  <div className="grid grid-cols-2 gap-[16px]">
                    <Select value="Monitoring" />
                    <Select placeholder="Priority (optional)" />
                  </div>
                  <Select value="Last 30 days" />
                </div>
              </div>

              {/* Section: Notifications */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide mb-[4px]"
                  style={{ color: "var(--field-label)" }}>Notifications</div>
                <div className="flex flex-col gap-[16px]">
                  <div className="grid grid-cols-2 gap-[16px]">
                    <Select placeholder="Notification channel *" />
                    <Input
                      placeholder="Alert threshold *"
                      value={threshold}
                      onChange={e => setThreshold(e.target.value)}
                      state={threshold.trim() ? "success" : "default"}
                    />
                  </div>
                  <Textarea
                    placeholder="Internal notes (optional)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      <ModalDialog
        isOpen={successOpen}
        onClose={() => { setSuccessOpen(false); onClose() }}
        tone="success"
        iconName="CheckCircle"
        title="Changes saved"
        description="Your automation settings have been updated successfully."
        ctaPrimary={{ label: "Done", onClick: () => { setSuccessOpen(false); onClose() } }}
      />
    </div>
  )
}
