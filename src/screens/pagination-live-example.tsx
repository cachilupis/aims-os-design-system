import { useState, useMemo } from "react"
import { ScreenLayout }    from "@/components/layouts/screen-layout"
import { ListViewSection } from "@/components/layouts/list-view-section"
import { Header }          from "@/components/ui/header"
import { Tabs }            from "@/components/ui/tabs"
import { Pagination }      from "@/components/ui/pagination"
import type { SidebarItem }         from "@/components/ui/sidebar"
import type { EntityListItemData }  from "@/components/ui/entity-list"

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "tenants",      label: "Tenants",       icon: "Building2"   },
  { id: "ai-workers",   label: "AI Workers",    icon: "Bot"         },
  { id: "automations",  label: "Automations",   icon: "Zap"         },
  { id: "knowledge",    label: "Knowledge",     icon: "BookOpen"    },
  { id: "analytics",    label: "Analytics",     icon: "BarChart2"   },
  { id: "settings",     label: "Settings",      icon: "Settings"    },
]

// ── Dataset ───────────────────────────────────────────────────────────────────

const ALL_TENANTS: EntityListItemData[] = [
  { id: "t01", title: "Acme Corp",             iconVariant: "success", iconName: "Building2",    state: { label: "Active",     variant: "success"     }, timestamp: "2m ago",    showMenu: true, description: "Enterprise · Healthcare · 240 seats",   secondaryMeta: [{ label: "Sarah Chen"  }, { iconName: "Users", label: "240" }, { iconName: "TrendingUp",   label: "98.2%" }] },
  { id: "t02", title: "TechNova Inc",          iconVariant: "info",    iconName: "Cpu",          state: { label: "Trial",      variant: "informative" }, timestamp: "15m ago",   showMenu: true, description: "Startup · SaaS · 12 seats",             secondaryMeta: [{ label: "Mike Torres" }, { iconName: "Users", label: "12"  }, { iconName: "TrendingUp",   label: "76.4%" }] },
  { id: "t03", title: "GlobalMed Partners",    iconVariant: "yellow",  iconName: "HeartPulse",   state: { label: "At Risk",    variant: "alert"       }, timestamp: "1h ago",    showMenu: true, description: "Enterprise · Healthcare · 450 seats",   secondaryMeta: [{ label: "Alice Kim"   }, { iconName: "Users", label: "450" }, { iconName: "TrendingDown", label: "61.0%" }] },
  { id: "t04", title: "Streamline Solutions",  iconVariant: "success", iconName: "Workflow",     state: { label: "Active",     variant: "success"     }, timestamp: "2h ago",    showMenu: true, description: "Mid-Market · Operations · 80 seats",    secondaryMeta: [{ label: "James Park"  }, { iconName: "Users", label: "80"  }, { iconName: "TrendingUp",   label: "91.7%" }] },
  { id: "t05", title: "Nexus Ventures",        iconVariant: "error",   iconName: "AlertCircle",  state: { label: "Churned",    variant: "error"       }, timestamp: "3h ago",    showMenu: true, description: "SMB · Finance · 28 seats",              secondaryMeta: [{ label: "Laura Vega"  }, { iconName: "Users", label: "28"  }, { iconName: "TrendingDown", label: "30.0%" }] },
  { id: "t06", title: "Brightfield Analytics", iconVariant: "success", iconName: "BarChart2",    state: { label: "Active",     variant: "success"     }, timestamp: "4h ago",    showMenu: true, description: "Enterprise · Analytics · 320 seats",    secondaryMeta: [{ label: "Owen Clark"  }, { iconName: "Users", label: "320" }, { iconName: "TrendingUp",   label: "95.3%" }] },
  { id: "t07", title: "Vertex Cloud",          iconVariant: "info",    iconName: "Cloud",        state: { label: "Onboarding", variant: "informative" }, timestamp: "5h ago",    showMenu: true, description: "Startup · Infrastructure · 35 seats",   secondaryMeta: [{ label: "Nora Singh"  }, { iconName: "Users", label: "35"  }, { iconName: "TrendingUp",   label: "55.0%" }] },
  { id: "t08", title: "Pinnacle Retail Group", iconVariant: "yellow",  iconName: "ShoppingBag",  state: { label: "At Risk",    variant: "alert"       }, timestamp: "6h ago",    showMenu: true, description: "Enterprise · Retail · 510 seats",       secondaryMeta: [{ label: "Ethan Moore" }, { iconName: "Users", label: "510" }, { iconName: "TrendingDown", label: "67.5%" }] },
  { id: "t09", title: "Clarity Legal",         iconVariant: "success", iconName: "Scale",        state: { label: "Active",     variant: "success"     }, timestamp: "Yesterday", showMenu: true, description: "Mid-Market · Legal · 95 seats",         secondaryMeta: [{ label: "Chloe Davis" }, { iconName: "Users", label: "95"  }, { iconName: "TrendingUp",   label: "88.9%" }] },
  { id: "t10", title: "Orion Manufacturing",   iconVariant: "success", iconName: "Factory",      state: { label: "Active",     variant: "success"     }, timestamp: "Yesterday", showMenu: true, description: "Enterprise · Manufacturing · 600 seats", secondaryMeta: [{ label: "Alex Ruiz"   }, { iconName: "Users", label: "600" }, { iconName: "TrendingUp",   label: "93.1%" }] },
  { id: "t11", title: "Crestwave Media",       iconVariant: "info",    iconName: "Radio",        state: { label: "Trial",      variant: "informative" }, timestamp: "2d ago",    showMenu: true, description: "Startup · Media · 8 seats",             secondaryMeta: [{ label: "Sophie Lee"  }, { iconName: "Users", label: "8"   }, { iconName: "TrendingUp",   label: "42.0%" }] },
  { id: "t12", title: "Apex Financial Group",  iconVariant: "success", iconName: "TrendingUp",   state: { label: "Active",     variant: "success"     }, timestamp: "2d ago",    showMenu: true, description: "Enterprise · Finance · 275 seats",       secondaryMeta: [{ label: "Marco Hill"  }, { iconName: "Users", label: "275" }, { iconName: "TrendingUp",   label: "97.0%" }] },
  { id: "t13", title: "BlueRidge Logistics",   iconVariant: "yellow",  iconName: "Truck",        state: { label: "At Risk",    variant: "alert"       }, timestamp: "3d ago",    showMenu: true, description: "Mid-Market · Logistics · 130 seats",    secondaryMeta: [{ label: "Tina Brooks" }, { iconName: "Users", label: "130" }, { iconName: "TrendingDown", label: "58.3%" }] },
  { id: "t14", title: "Solara Energy",         iconVariant: "success", iconName: "Zap",          state: { label: "Active",     variant: "success"     }, timestamp: "3d ago",    showMenu: true, description: "Enterprise · Energy · 380 seats",        secondaryMeta: [{ label: "Raj Patel"   }, { iconName: "Users", label: "380" }, { iconName: "TrendingUp",   label: "90.5%" }] },
  { id: "t15", title: "Harbor Digital",        iconVariant: "error",   iconName: "Server",       state: { label: "Churned",    variant: "error"       }, timestamp: "4d ago",    showMenu: true, description: "SMB · IT Services · 22 seats",          secondaryMeta: [{ label: "Fiona Gray"  }, { iconName: "Users", label: "22"  }, { iconName: "TrendingDown", label: "20.0%" }] },
  { id: "t16", title: "Meridian Healthcare",   iconVariant: "success", iconName: "Activity",     state: { label: "Active",     variant: "success"     }, timestamp: "5d ago",    showMenu: true, description: "Enterprise · Healthcare · 520 seats",   secondaryMeta: [{ label: "David Wu"    }, { iconName: "Users", label: "520" }, { iconName: "TrendingUp",   label: "94.6%" }] },
  { id: "t17", title: "Ironclad Security",     iconVariant: "info",    iconName: "Shield",       state: { label: "Onboarding", variant: "informative" }, timestamp: "5d ago",    showMenu: true, description: "Startup · Cybersecurity · 45 seats",    secondaryMeta: [{ label: "Priya Shah"  }, { iconName: "Users", label: "45"  }, { iconName: "TrendingUp",   label: "68.0%" }] },
  { id: "t18", title: "Summit Consulting",     iconVariant: "success", iconName: "Briefcase",    state: { label: "Active",     variant: "success"     }, timestamp: "1w ago",    showMenu: true, description: "Mid-Market · Consulting · 60 seats",    secondaryMeta: [{ label: "Leo Navarro" }, { iconName: "Users", label: "60"  }, { iconName: "TrendingUp",   label: "86.7%" }] },
  { id: "t19", title: "AquaFlow Technologies", iconVariant: "yellow",  iconName: "Droplets",     state: { label: "At Risk",    variant: "alert"       }, timestamp: "1w ago",    showMenu: true, description: "Enterprise · Utilities · 200 seats",     secondaryMeta: [{ label: "Hana Bloom"  }, { iconName: "Users", label: "200" }, { iconName: "TrendingDown", label: "63.5%" }] },
  { id: "t20", title: "Fusion Retail Co.",     iconVariant: "success", iconName: "Store",        state: { label: "Active",     variant: "success"     }, timestamp: "1w ago",    showMenu: true, description: "Enterprise · Retail · 410 seats",        secondaryMeta: [{ label: "Tom Chen"    }, { iconName: "Users", label: "410" }, { iconName: "TrendingUp",   label: "92.8%" }] },
  { id: "t21", title: "CloudBase Systems",     iconVariant: "info",    iconName: "Database",     state: { label: "Trial",      variant: "informative" }, timestamp: "2w ago",    showMenu: true, description: "Startup · DevOps · 18 seats",           secondaryMeta: [{ label: "Amy Reyes"   }, { iconName: "Users", label: "18"  }, { iconName: "TrendingUp",   label: "50.0%" }] },
  { id: "t22", title: "Verity Insurance",      iconVariant: "success", iconName: "FileCheck",    state: { label: "Active",     variant: "success"     }, timestamp: "2w ago",    showMenu: true, description: "Enterprise · Insurance · 480 seats",    secondaryMeta: [{ label: "Ian Foster"  }, { iconName: "Users", label: "480" }, { iconName: "TrendingUp",   label: "96.2%" }] },
  { id: "t23", title: "Momentum Sports",       iconVariant: "success", iconName: "Trophy",       state: { label: "Active",     variant: "success"     }, timestamp: "2w ago",    showMenu: true, description: "Mid-Market · Sports · 75 seats",        secondaryMeta: [{ label: "Kai Ortega"  }, { iconName: "Users", label: "75"  }, { iconName: "TrendingUp",   label: "84.0%" }] },
  { id: "t24", title: "Cascade Education",     iconVariant: "yellow",  iconName: "GraduationCap",state: { label: "At Risk",    variant: "alert"       }, timestamp: "3w ago",    showMenu: true, description: "Enterprise · EdTech · 300 seats",        secondaryMeta: [{ label: "Vera Mills"  }, { iconName: "Users", label: "300" }, { iconName: "TrendingDown", label: "59.1%" }] },
  { id: "t25", title: "Titan Pharmaceuticals", iconVariant: "success", iconName: "Pill",         state: { label: "Active",     variant: "success"     }, timestamp: "3w ago",    showMenu: true, description: "Enterprise · Pharma · 560 seats",        secondaryMeta: [{ label: "Felix Grant" }, { iconName: "Users", label: "560" }, { iconName: "TrendingUp",   label: "95.9%" }] },
  { id: "t26", title: "Keystone Realty",       iconVariant: "info",    iconName: "Home",         state: { label: "Onboarding", variant: "informative" }, timestamp: "1m ago",    showMenu: true, description: "Mid-Market · Real Estate · 50 seats",   secondaryMeta: [{ label: "Gina Cruz"   }, { iconName: "Users", label: "50"  }, { iconName: "TrendingUp",   label: "72.0%" }] },
  { id: "t27", title: "Northgate Publishing",  iconVariant: "error",   iconName: "BookOpen",     state: { label: "Churned",    variant: "error"       }, timestamp: "1m ago",    showMenu: true, description: "SMB · Publishing · 16 seats",           secondaryMeta: [{ label: "Ben Walsh"   }, { iconName: "Users", label: "16"  }, { iconName: "TrendingDown", label: "15.0%" }] },
  { id: "t28", title: "Polaris Aerospace",     iconVariant: "success", iconName: "Rocket",       state: { label: "Active",     variant: "success"     }, timestamp: "1m ago",    showMenu: true, description: "Enterprise · Aerospace · 420 seats",    secondaryMeta: [{ label: "Diane Ross"  }, { iconName: "Users", label: "420" }, { iconName: "TrendingUp",   label: "91.3%" }] },
  { id: "t29", title: "Stellar Fintech",       iconVariant: "success", iconName: "CreditCard",   state: { label: "Active",     variant: "success"     }, timestamp: "1m ago",    showMenu: true, description: "Startup · Fintech · 55 seats",          secondaryMeta: [{ label: "Ray Nguyen"  }, { iconName: "Users", label: "55"  }, { iconName: "TrendingUp",   label: "82.5%" }] },
  { id: "t30", title: "Bridgemark Capital",    iconVariant: "info",    iconName: "Landmark",     state: { label: "Trial",      variant: "informative" }, timestamp: "2m ago",    showMenu: true, description: "Enterprise · Capital · 190 seats",       secondaryMeta: [{ label: "Clara Diaz"  }, { iconName: "Users", label: "190" }, { iconName: "TrendingUp",   label: "47.0%" }] },
]

const STATUS_FILTER_OPTIONS = ["Active", "At Risk", "Trial", "Onboarding", "Churned"]

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PaginationLiveExample() {
  const [tab,       setTab]       = useState<"all" | "enterprise" | "startup">("all")
  const [page,      setPage]      = useState(1)
  const [perPage,   setPerPage]   = useState(10)
  const [status,    setStatus]    = useState<string | null>(null)
  const [openSlot,  setOpenSlot]  = useState<string | null>(null)

  const filtered = useMemo(() => {
    let items = ALL_TENANTS
    if (tab === "enterprise") items = items.filter(i => i.description?.includes("Enterprise"))
    if (tab === "startup")    items = items.filter(i => i.description?.includes("Startup"))
    if (status)               items = items.filter(i => i.state?.label === status)
    return items
  }, [tab, status])

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  return (
    <ScreenLayout
      workspaceName="AIMS OS"
      userName="Michael Orellana"
      userEmail="michael.orellana@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="tenants"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Tenants"
          description="All tenant accounts. Pagination live example."
        />
      )}
      pagination={
        filtered.length > perPage
          ? (
            <Pagination
              currentPage={page}
              totalItems={filtered.length}
              itemsPerPage={perPage}
              onPageChange={setPage}
              onItemsPerPageChange={n => { setPerPage(n); setPage(1) }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )
          : undefined
      }
    >
      <Tabs
        className="mb-[24px]"
        items={[
          { id: "all",        label: "All tenants"   },
          { id: "enterprise", label: "Enterprise"    },
          { id: "startup",    label: "Startup"       },
        ]}
        activeId={tab}
        onChange={id => { setTab(id as typeof tab); setPage(1) }}
      />

      <ListViewSection
        items={paged}
        filterSlots={[
          {
            placeholder: "Status",
            value: status ?? undefined,
            onOpen:   () => setOpenSlot(s => s === "Status" ? null : "Status"),
            onRemove: () => { setStatus(null); setPage(1) },
          },
        ]}
        filterOptions={{ Status: STATUS_FILTER_OPTIONS }}
        onFilterSelect={(slot, value) => {
          if (slot === "Status") { setStatus(value); setPage(1) }
          setOpenSlot(null)
        }}
        openSlot={openSlot}
        onOpenSlotChange={setOpenSlot}
        showClearFilters={!!status}
        onClearFilters={() => { setStatus(null); setPage(1) }}
        emptyLabel="No tenants match these filters."
      />
    </ScreenLayout>
  )
}
