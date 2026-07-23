import { useState } from "react"
import { Sparkles, Bell, Settings } from "lucide-react"
import { AppBackground }    from "@/components/ui/app-background"
import { Topbar }           from "@/components/ui/topbar"
import { Sidebar, DEFAULT_SIDEBAR_ITEMS } from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { SlideOut }         from "@/components/ui/slide-out"
import { EntityList }       from "@/components/ui/entity-list"
import { CardContainer }    from "@/components/ui/card-container"
import { Button }           from "@/components/ui/button"
import { Input }            from "@/components/ui/input"
import { Select }           from "@/components/ui/select"
import { Textarea }         from "@/components/ui/textarea"
import { ModalDialog }      from "@/components/ui/modal-dialog"
import type { TopbarAction }       from "@/components/ui/topbar"
import type { EntityListItemData } from "@/components/ui/entity-list"

const TOPBAR_ACTIONS: TopbarAction[] = [
  { icon: <Sparkles size={16} />, label: "AI",            variant: "primary" },
  { icon: <Bell     size={16} />, label: "Notifications"                     },
  { icon: <Settings size={16} />, label: "Settings"                          },
]

const LIST_ITEMS: EntityListItemData[] = [
  { id: "1", title: "Customer Churn Alert",   iconVariant: "error",  iconName: "Zap", state: { label: "Active", variant: "success" }, primaryMeta: [{ iconName: "FolderOpen", label: "Monitoring" }], actions: [{ label: "Eye", variant: "tertiary", icon: "Eye" }] },
  { id: "2", title: "Upsell Opportunity",     iconVariant: "success", iconName: "Zap", state: { label: "Active", variant: "success" }, primaryMeta: [{ iconName: "FolderOpen", label: "Sales"      }], actions: [{ label: "Eye", variant: "tertiary", icon: "Eye" }] },
  { id: "3", title: "Support Escalation",     iconVariant: "info",   iconName: "Zap", state: { label: "Paused", variant: "alert"   }, primaryMeta: [{ iconName: "FolderOpen", label: "Support"    }], actions: [{ label: "Eye", variant: "tertiary", icon: "Eye" }] },
  { id: "4", title: "Renewal Risk Detection", iconVariant: "error",  iconName: "Zap", state: { label: "Active", variant: "success" }, primaryMeta: [{ iconName: "FolderOpen", label: "Monitoring" }], actions: [{ label: "Eye", variant: "tertiary", icon: "Eye" }] },
]

type Props = { onClose: () => void }

export function SlideOutFormExampleScreen({ onClose: closePreview }: Props) {
  const [activeSidebar, setActiveSidebar] = useState("automations")
  const [slideOutOpen,  setSlideOutOpen]  = useState(false)
  const [name,          setName]          = useState("")
  const [nameTouched,   setNameTouched]   = useState(false)
  const [desc,          setDesc]          = useState("")
  const [successOpen,   setSuccessOpen]   = useState(false)

  const nameError = nameTouched && !name.trim() ? "This field is required" : undefined
  const canCreate = name.trim() !== ""

  const handleClose = () => {
    setSlideOutOpen(false)
    setName("")
    setDesc("")
    setNameTouched(false)
  }

  return (
    <div className="flex flex-col h-full">
      <AppBackground />

      <Topbar workspaceName="AI Workers" companyName="AIMS OS" actions={TOPBAR_ACTIONS} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={DEFAULT_SIDEBAR_ITEMS} activeId={activeSidebar} onItemClick={setActiveSidebar} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Automations"
            description="Monitoring and response automations for your customer accounts"
            size="size-l"
            primaryAction={
              <Button variant="main" size="sm" onClick={() => setSlideOutOpen(true)}>New Automation</Button>
            }
          />

          <div className="flex-1 overflow-y-auto px-[32px] py-[24px]">
            <CardContainer className="!p-0 overflow-hidden">
              <EntityList items={LIST_ITEMS} />
            </CardContainer>
          </div>
        </main>
      </div>

      {/* SlideOut — create form opened from Header "New Automation" button */}
      <SlideOut
        open={slideOutOpen}
        onClose={handleClose}
        size="m"
        type="with-variants"
        title="New Automation"
        subtitle="Configure your new automation"
        showIcon={false}
        showStatus={false}
        showTabs={false}
        showSearchBar={false}
        showChips={false}
        showCta
        ctaPrimaryLabel="Create automation"
        ctaSecondaryLabel="Cancel"
        onCtaSecondary={handleClose}
        onCtaPrimary={() => { if (canCreate) setSuccessOpen(true) }}
      >
        <div className="flex flex-col gap-[24px] p-[24px]">

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide mb-[8px]" style={{ color: "var(--field-label)" }}>Basic information</div>
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

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide mb-[8px]" style={{ color: "var(--field-label)" }}>Configuration</div>
            <div className="flex flex-col gap-[16px]">
              <Select placeholder="Category *" />
              <Select placeholder="Trigger type *" />
              <Select placeholder="Assigned team" />
            </div>
          </div>

        </div>
      </SlideOut>

      <ModalDialog
        isOpen={successOpen}
        onClose={() => { setSuccessOpen(false); handleClose() }}
        tone="success"
        iconName="CheckCircle"
        title="Automation created"
        description={`"${name}" has been created and is ready to run.`}
        ctaPrimary={{ label: "View automation", onClick: () => { setSuccessOpen(false); handleClose(); closePreview() } }}
        ctaSecondary={{ label: "Create another", onClick: () => {
          setSuccessOpen(false)
          setName("")
          setDesc("")
          setNameTouched(false)
        }}}
      />
    </div>
  )
}
