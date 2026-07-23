import { Sparkles, Bell, Settings, ChevronDown, User } from "lucide-react"
import { AppBackground }    from "@/components/ui/app-background"
import { Topbar }           from "@/components/ui/topbar"
import { Sidebar }          from "@/components/ui/sidebar"
import { Header }           from "@/components/ui/header"
import { Tabs }             from "@/components/ui/tabs"
import { Pagination }       from "@/components/ui/pagination"
import { Tag }              from "@/components/ui/tag"
import { Button }           from "@/components/ui/button"
import { Breadcrumb }       from "@/components/ui/breadcrumb"
import { ListViewSection }  from "@/components/layouts/list-view-section"
import type { EntityListItemData } from "@/components/ui/entity-list"
import type { SidebarItem }   from "@/components/ui/sidebar"
import type { TopbarAction }  from "@/components/ui/topbar"

// ── Static data ───────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "ai-workers",  label: "AI Workers",  icon: "Bot"      },
  { id: "automations", label: "Automations", icon: "Zap"      },
  { id: "knowledge",   label: "Knowledge",   icon: "BookOpen" },
  { id: "analytics",   label: "Analytics",   icon: "BarChart3"},
  { id: "people",      label: "People",      icon: "Users"    },
]

const TOPBAR_ACTIONS: TopbarAction[] = [
  { icon: <Sparkles size={16} />, label: "AI",            variant: "primary" },
  { icon: <Bell     size={16} />, label: "Notifications"                     },
  { icon: <Settings size={16} />, label: "Settings"                          },
]

// AI detail < 80 chars → EntityList applies self-start (auto-width, not full-width)
const AI_DETAIL = "Running efficiently · 97.5% success rate · 12 active users"

const ENTITY_ITEMS: EntityListItemData[] = [
  {
    id: "e1",
    title: "Churn Risk Intervention",
    iconVariant: "success", iconName: "GitFork",
    state:     { label: "Active",  variant: "success"     },
    timestamp: "4m ago", showMenu: true,
    description: "Detects at-risk accounts from health signals, triggers CS playbook and assigns follow-up tasks.",
    aiInsight: { action: "Summary", detail: AI_DETAIL },
    secondaryMeta: [
      { iconName: "User",       label: "{Owner-Name}"            },
      { iconName: "Zap",        label: "health.score.dropped +1" },
      { iconName: "Play",       label: "48"                      },
      { iconName: "TrendingUp", label: "97.5%"                   },
      { iconName: "Users",      label: "12"                      },
    ],
    tags: [{ label: "Customer success" }],
  },
  {
    id: "e2",
    title: "Churn Risk Intervention",
    iconVariant: "info", iconName: "GitFork",
    state:     { label: "Running", variant: "informative"  },
    timestamp: "4m ago", showMenu: true,
    description: "Detects at-risk accounts from health signals, triggers CS playbook and assigns follow-up tasks.",
    aiInsight: { action: "Summary", detail: AI_DETAIL },
    secondaryMeta: [
      { iconName: "User",       label: "{Owner-Name}"            },
      { iconName: "Zap",        label: "health.score.dropped +1" },
      { iconName: "Play",       label: "48"                      },
      { iconName: "TrendingUp", label: "97.5%"                   },
      { iconName: "Users",      label: "12"                      },
    ],
    tags: [{ label: "Customer success" }],
  },
  {
    id: "e3",
    title: "Churn Risk Intervention",
    iconVariant: "neutral", iconName: "GitFork",
    state:     { label: "Draft",   variant: "neutral"      },
    timestamp: "4m ago", showMenu: true,
    description: "Detects at-risk accounts from health signals, triggers CS playbook and assigns follow-up tasks.",
    aiInsight: { action: "Summary", detail: AI_DETAIL },
    secondaryMeta: [
      { iconName: "User",       label: "{Owner-Name}"            },
      { iconName: "Zap",        label: "health.score.dropped +1" },
      { iconName: "Play",       label: "48"                      },
      { iconName: "TrendingUp", label: "97.5%"                   },
      { iconName: "Users",      label: "12"                      },
    ],
    tags: [{ label: "Customer success" }],
  },
  {
    id: "e4",
    title: "Churn Risk Intervention",
    iconVariant: "success", iconName: "GitFork",
    state:     { label: "Active",  variant: "success"      },
    timestamp: "4m ago", showMenu: true,
    description: "Detects at-risk accounts from health signals, triggers CS playbook and assigns follow-up tasks.",
    aiInsight: { action: "Summary", detail: AI_DETAIL },
    secondaryMeta: [
      { iconName: "User",       label: "{Owner-Name}"            },
      { iconName: "Zap",        label: "health.score.dropped +1" },
      { iconName: "Play",       label: "48"                      },
      { iconName: "TrendingUp", label: "97.5%"                   },
      { iconName: "Users",      label: "12"                      },
    ],
    tags: [{ label: "Customer success" }],
  },
]

const FILTER_OPTIONS = {
  "Status":   ["Active", "Running", "Draft", "Paused"],
  "Category": ["Customer success", "Sales", "Analytics", "Operations"],
}

// ── Main screen component ─────────────────────────────────────────────────────

export function BreadcrumbExampleScreen({ showBreadcrumb }: { showBreadcrumb: boolean }) {
  return (
    <div style={{ width: "100%", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      <AppBackground variant="default" />

      <Topbar
        workspaceName="{Studio name}"
        companyName="{Company name}"
        actions={TOPBAR_ACTIONS}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar items={SIDEBAR_ITEMS} activeId="ai-workers" defaultCollapsed />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Fixed zone: breadcrumb (L3+) + Header */}
          <div style={{ flexShrink: 0 }}>
            {showBreadcrumb && (
              <div style={{ padding: "6px 24px" }}>
                <Breadcrumb
                  depth={3}
                  items={[
                    { label: "Home",                    href: "/"           },
                    { label: "AI Workers",              href: "/ai-workers" },
                    { label: "Churn Risk Intervention"                      },
                  ]}
                  onNavigate={() => {}}
                />
              </div>
            )}
            <Header
              title="Title section"
              description="Securely store, manage, and organize your documents and folders"
              size="size-l"
              backButton
              tag={<Tag variant="informative" size="sm">Status</Tag>}
              primaryAction={
                <Button variant="main" size="sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  CTA <ChevronDown size={12} />
                </Button>
              }
            />
          </div>

          {/* Scrollable content zone */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div style={{ height: "100%", overflowY: "auto", padding: "8px 32px 64px" }}>

              {/*
                Tabs — no borderBottom wrapper. The Tabs DS component manages its own
                active indicator (2px span, active tab only). mb-[24px] = DS-spec gap.
              */}
              <Tabs
                items={[
                  { id: "tab1", label: "Tab1", icon: User },
                  { id: "tab2", label: "Tab2", icon: User },
                ]}
                activeId="tab1"
                onChange={() => {}}
                className="mb-[24px]"
              />

              {/*
                ListViewSection wires Filters + dropdown + EntityList in one component.
                Filters alone is a pure presentation component — slot.onOpen() must be
                handled by the parent. ListViewSection does this internally via
                internalOpenSlot state, so filter dropdowns work out of the box.
              */}
              <ListViewSection
                items={ENTITY_ITEMS}
                searchPlaceholder="Search"
                filterSlots={[
                  { placeholder: "Status",   onOpen: () => {}, onRemove: () => {} },
                  { placeholder: "Category", onOpen: () => {}, onRemove: () => {} },
                ]}
                filterOptions={FILTER_OPTIONS}
                showAllFilters
                showViewToggle={false}
              />
            </div>

            {/* Pagination — floats at bottom */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 }}>
              <Pagination
                currentPage={1}
                totalItems={120}
                itemsPerPage={5}
                onPageChange={() => {}}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
