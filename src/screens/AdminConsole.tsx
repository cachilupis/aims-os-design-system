import { useState } from "react"
import { AdminOverviewScreen }      from "./AdminOverview"
import { PeopleAccessMembersScreen } from "./PeopleAccessMembers"
import { AdminStudiosScreen }        from "./AdminStudios"
import { AdminIntegrationsScreen }   from "./AdminIntegrations"
import { AdminSecurityScreen }       from "./AdminSecurity"
import { AdminAuditLogScreen }       from "./AdminAuditLog"
import { AdminBillingScreen }        from "./AdminBilling"

type PageId = "overview" | "people" | "studios" | "integrations" | "security" | "audit" | "billing"

export function AdminConsoleScreen() {
  const [activePage, setActivePage] = useState<PageId>("overview")

  function navigate(id: string) {
    const valid: PageId[] = ["overview", "people", "studios", "integrations", "security", "audit", "billing"]
    if (valid.includes(id as PageId)) setActivePage(id as PageId)
  }

  const nav = { onNavigate: navigate }

  switch (activePage) {
    case "overview":      return <AdminOverviewScreen      {...nav} />
    case "people":        return <PeopleAccessMembersScreen {...nav} />
    case "studios":       return <AdminStudiosScreen        {...nav} />
    case "integrations":  return <AdminIntegrationsScreen   {...nav} />
    case "security":      return <AdminSecurityScreen       {...nav} />
    case "audit":         return <AdminAuditLogScreen       {...nav} />
    case "billing":       return <AdminBillingScreen        {...nav} />
  }
}
