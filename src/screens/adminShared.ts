import type { SidebarItem } from "@/components/ui/sidebar"

export const ADMIN_SIDEBAR: SidebarItem[] = [
  { id: "overview",         label: "Overview",          icon: "LayoutDashboard" },
  { id: "people",           label: "People & Access",   icon: "Users"           },
  { id: "studios",          label: "Studios",           icon: "Box"             },
  { id: "integrations",     label: "Integrations",      icon: "Plug"            },
  { id: "security",         label: "Security",          icon: "Shield"          },
  { id: "audit",            label: "Audit Log",         icon: "ClipboardList"   },
  { id: "billing",          label: "Billing",           icon: "CreditCard"      },
  { id: "my-settings",      label: "My Settings",       icon: "UserCog"         },
  { id: "my-integrations",  label: "My Integrations",   icon: "Cable"           },
]
