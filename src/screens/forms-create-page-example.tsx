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

export function FormsCreatePageExampleScreen({ onClose }: Props) {
  const [activeSidebar, setActiveSidebar] = useState("automations")
  const [name,       setName]       = useState("")
  const [nameTouched, setNameTouched] = useState(false)
  const [desc,       setDesc]       = useState("")
  const [notes,      setNotes]      = useState("")
  const [successOpen, setSuccessOpen] = useState(false)

  const nameError = nameTouched && !name.trim() ? "This field is required" : undefined
  const canCreate = name.trim() !== ""

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
            title="New Automation"
            description="Configure a new automation for your team"
            backButton
            size="size-l"
            primaryAction={
              <Button variant="primary" size="sm" disabled={!canCreate} onClick={() => setSuccessOpen(true)}>
                Create automation
              </Button>
            }
            secondaryAction={
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
            }
          />

          <div className="flex-1 overflow-y-auto px-[32px] py-[28px]">
            <div className="max-w-[680px] flex flex-col gap-[24px]">

              {/* Section: Basic information */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide mb-[4px]"
                  style={{ color: "var(--field-label)" }}>Basic information</div>
                <div className="flex flex-col gap-[16px]">
                  <Input
                    placeholder="Automation name *"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={() => setNameTouched(true)}
                    state={nameError ? "error" : name.trim() ? "success" : "default"}
                    supportingText={nameError}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Section: Configuration */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide mb-[4px]"
                  style={{ color: "var(--field-label)" }}>Configuration</div>
                <div className="flex flex-col gap-[16px]">
                  <div className="grid grid-cols-2 gap-[16px]">
                    <Select placeholder="Category *" />
                    <Select placeholder="Priority (optional)" />
                  </div>
                  <Select placeholder="Assigned team *" />
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
        title="Automation created"
        description={`"${name || "Your automation"}" has been created and is ready to run.`}
        ctaPrimary={{ label: "View automation", onClick: () => { setSuccessOpen(false); onClose() } }}
        ctaSecondary={{ label: "Create another", onClick: () => {
          setSuccessOpen(false)
          setName("")
          setDesc("")
          setNotes("")
          setNameTouched(false)
        }}}
      />
    </div>
  )
}
