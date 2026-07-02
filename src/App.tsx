import { useState, useMemo, type CSSProperties } from "react"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CardContainer, type CardVariant } from "@/components/ui/card-container"
import { Tag, type TagVariant } from "@/components/ui/tag"
import { Menu, MenuItem, MenuDivider, MenuSection } from "@/components/ui/menu-item"
import { HighlightIcon, type HighlightIconVariant, type HighlightIconSize } from "@/components/ui/highlight-icon"
import { Select, type SelectState } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Toggle } from "@/components/ui/toggle"
import {
  Table,
  TableCellLink,
  TableCellAvatar,
  TableCellAvatarGroup,
  TableCellAvatarLink,
  TableCellIconText,
  TableCellMenu,
  type TableColumn,
} from "@/components/ui/table"
import { Topbar, TopbarButton, TopbarLeftMenu, TopbarRightMenu, GlobalSearch, type TopbarAction, type WorkspaceItem, type ThemeMode } from "@/components/ui/topbar"
import { Sidebar, DEFAULT_SIDEBAR_ITEMS } from "@/components/ui/sidebar"
import { EntityList, ELIconHighlight, ELAvatar, type EntityListItemData } from "@/components/ui/entity-list"
import { ModalDialog, type ModalVariant, type ModalTone } from "@/components/ui/modal-dialog"
import { InformativeCard, type InformativeCardState, type InformativeCardSize } from "@/components/ui/informative-card"
import { Filters, type FilterSlot } from "@/components/ui/filters"
import { FiltersSlideout } from "@/components/ui/filters-slideout"

// ── Types ─────────────────────────────────────────────────────────────────

type SectionId = "home" | "breakpoints" | "button" | "card-container" | "checkbox" | "colors" | "entity-list" | "filters" | "highlight-icon" | "icons" | "informative-card" | "input" | "menu-item" | "modal-dialog" | "select" | "sidebar" | "table" | "tag" | "textarea" | "toggle" | "topbar" | "typography"
type SpecModal = "button" | "card-container" | "checkbox" | "entity-list" | "filters" | "highlight-icon" | "informative-card" | "input" | "menu-item" | "modal-dialog" | "select" | "sidebar" | "table" | "tag" | "textarea" | "toggle" | "topbar" | null

// ── Icons ─────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M11.5 3.1l-1.4 1.4M4.5 11.5l-1.4 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 10.5A6 6 0 015.5 2.5a6 6 0 108 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)
const SpecIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4 4.5h6M4 7h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M7 1h4v4M11 1L6.5 5.5M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Nav data ──────────────────────────────────────────────────────────────

const NAV_SECTIONS: { id: SectionId; label: string; group: string; description: string }[] = [
  { id: "home",            label: "Why this approach", group: "Overview",    description: "Alignment doc: why a component repository is the foundation for consistent AI prototypes" },
  // Components — alphabetical by label
  { id: "button",          label: "Button",            group: "Components",  description: "6 variants: Primary, Secondary, Tertiary, Warning, Positive, Main Action" },
  { id: "card-container",  label: "Card Container",    group: "Components",  description: "11 color styles · 3 sizes · selected & disabled states · semantic grouping container" },
  { id: "checkbox",        label: "Checkbox",          group: "Components",  description: "Binary selection control · 2 sizes · 4 states · optional label and description" },
  { id: "entity-list",     label: "Entity List",       group: "Components",  description: "High-density list row for entities — conversations, tickets, tasks. Supports icon, avatar, primary/secondary meta, AI insight, tags." },
  { id: "filters",         label: "Filters",           group: "Components",  description: "Horizontal 40px filter bar. 8 state variants · up to 5 filter chips · All Filters · sort controls · grid/list toggle. Token family --fi-*." },
  { id: "highlight-icon",  label: "Highlight Icon",    group: "Components",  description: "Rounded semantic icon container · 3 sizes · 9 color variants · used as leading slot in Menu items" },
  { id: "informative-card",label: "Informative Card",  group: "Components",  description: "Horizontal notice surface. 5 semantic states · 3 sizes · optional description + CTA. Uses --ic-* token family." },
  { id: "input",           label: "Input",             group: "Components",  description: "Single-line text field · 2 sizes · 5 validation states · icon slots" },
  { id: "menu-item",       label: "Menu / Dropdown",   group: "Components",  description: "Dropdown list panel · 2 sizes · 4 states · leading icon, subtext, dividers, section headers" },
  { id: "modal-dialog",    label: "Modal Dialog",      group: "Components",  description: "2 variants: Confirmation (centered, max 900px) and Content (left-aligned, max 900px). Icon, title, description, slot, informative card, CTA pair." },
  { id: "select",          label: "Select",            group: "Components",  description: "Dropdown trigger field · 4 states · label, supporting text, leading icon · opens a Menu panel" },
  { id: "sidebar",         label: "Sidebar",           group: "Components",  description: "Vertical navigation rail · 2 states (Expanded 250px / Collapsed 56px) · icon-only or icon+label · active gradient" },
  { id: "table",           label: "Table",             group: "Components",  description: "Data table · 2 sizes · row selection · checkboxes · hover & selected states" },
  { id: "tag",             label: "Tag",               group: "Components",  description: "11 semantic variants · 2 sizes · status, category and label badges" },
  { id: "textarea",        label: "Text Description",  group: "Components",  description: "Multi-line field · Expand Content · ScrollBar · Feedback Characters" },
  { id: "toggle",          label: "Toggle",            group: "Components",  description: "On/Off switch · 3 sizes · sliding thumb animation · optional label and description" },
  { id: "topbar",          label: "Topbar",            group: "Components",  description: "Global navigation bar · 2 variants (Default/Tablet) · workspace, search, action buttons, profile" },
  // Foundations — alphabetical by label
  { id: "breakpoints", label: "Breakpoints", group: "Foundations", description: "5-tier responsive system · XL/L/M/S/XS · column grid, gutter and margin specs per breakpoint · sidebar behavior rules" },
  { id: "colors",      label: "Colors",      group: "Foundations", description: "Primitive palette + 162 semantic tokens · light & dark mode · Surface, Border, Text, Icon, Badge" },
  { id: "icons",       label: "Icons",       group: "Foundations", description: "141 icons mapped from Material Design DS to Lucide · 12 semantic categories" },
  { id: "typography",  label: "Typography",  group: "Foundations", description: "Type scale DS → Tailwind · Display, Title, Subtitle, Body, Label, Caption, Link" },
]

// ── DS Spec data (sourced directly from Figma — source of truth) ──────────

const BUTTON_SPEC = {
  name: "Button",
  figmaNodeId: "4504:5148",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4504-5148",
  description: "6 variants that communicate action hierarchy. Each one signals a different level of visual weight and semantic intent. Max 1–2 Primary or Main Action per screen.",
  properties: [
    { name: "Type",          type: "Variant",  values: ["Primary","Secondary","Tertiary","Warning","Positive","Main Action"],  default: "Primary" },
    { name: "Size",          type: "Variant",  values: ["S","M","L"],                   default: "M" },
    { name: "Icon",          type: "Variant",  values: ["None","Left","Right","Alone"],  default: "None",   note: "Alone → icon-only square button, no label" },
    { name: "Pill",          type: "Boolean",  values: ["true","false"],                default: "false",  note: "Overrides corner radius to 100px (rounded-full)" },
    { name: "State",         type: "Variant",  values: ["Default","Hover","Focus","Active","Disabled"], default: "Default" },
  ],
  sizes: [
    { size: "S", height: "27px", fontSize: "12px", cornerRadius: "8px", paddingX: "12px", gap: "4px",  iconAlone: "24×24px" },
    { size: "M", height: "40px", fontSize: "14px", cornerRadius: "8px", paddingX: "16px", gap: "8px",  iconAlone: "40×40px" },
    { size: "L", height: "52px", fontSize: "16px", cornerRadius: "16px",paddingX: "20px", gap: "12px", iconAlone: "56×56px" },
  ],
  typography: [
    { element: "Label S", family: "Inter", size: "12px", weight: "Semi Bold (600)", lineHeight: "1.5" },
    { element: "Label M", family: "Inter", size: "14px", weight: "Semi Bold (600)", lineHeight: "1.5" },
    { element: "Label L", family: "Inter", size: "16px", weight: "Semi Bold (600)", lineHeight: "1.5" },
  ],
  variants: [
    {
      name: "Primary",
      description: "Highest-weight CTA. Max 1–2 per view.",
      cssPrefix: "--btn-primary",
      tokens: [
        { role: "Background",       variable: "Border/Primary/Default", light: "#2173ff",              dark: "#2b7fff" },
        { role: "Text",             variable: "Text/White",             light: "#ffffff",              dark: "#ffffff" },
        { role: "Background hover", variable: "—",                     light: "#002f80",              dark: "#002f80" },
        { role: "Background active",variable: "—",                     light: "#001a5c",              dark: "#001a5c" },
        { role: "Focus ring",       variable: "Border/Primary/Default", light: "#2173ff",              dark: "#2b7fff" },
      ],
    },
    {
      name: "Secondary",
      description: "Alternative action, same section as Primary. Always pill shape.",
      cssPrefix: "--btn-secondary",
      tokens: [
        { role: "Background",          variable: "Surface/Neutral/White",    light: "#ffffff",              dark: "rgba(255,255,255,0.1)" },
        { role: "Border",              variable: "Border/Neutral/Default",   light: "#5c5c5c",              dark: "rgba(255,255,255,0.1)" },
        { role: "Text",                variable: "Text/Label",               light: "#2a2a2a",              dark: "rgba(255,255,255,0.6)" },
        { role: "Background hover",    variable: "Surface/Neutral/Default",  light: "#f2f2f2",              dark: "rgba(255,255,255,0.08)" },
        { role: "Border hover",        variable: "Surface/Neutral/Emphasis", light: "#d9d9d9",              dark: "rgba(255,255,255,0.2)" },
        { role: "Border focus",        variable: "Border/Neutral/Lighter",   light: "#bababa",              dark: "rgba(255,255,255,0.15)" },
        { role: "Background disabled", variable: "Surface/Neutral/Subtle",   light: "#fafafa",              dark: "rgba(255,255,255,0.05)" },
        { role: "Text disabled",       variable: "Text/Disabled",            light: "#bababa",              dark: "rgba(255,255,255,0.3)" },
      ],
    },
    {
      name: "Tertiary",
      description: "Cancel, go back, low-weight inline action. No background.",
      cssPrefix: "--btn-tertiary",
      tokens: [
        { role: "Background",          variable: "—",                        light: "transparent",          dark: "transparent" },
        { role: "Text",                variable: "Text/Label",               light: "#2a2a2a",              dark: "rgba(255,255,255,0.6)" },
        { role: "Background hover",    variable: "Surface/Neutral/Subtle",   light: "#fafafa",              dark: "rgba(255,255,255,0.05)" },
        { role: "Background focus",    variable: "Surface/Neutral/Default",  light: "#f2f2f2",              dark: "rgba(255,255,255,0.08)" },
      ],
    },
    {
      name: "Warning",
      description: "Destructive / irreversible actions only. Delete, revoke, purge.",
      cssPrefix: "--btn-warning",
      tokens: [
        { role: "Background",       variable: "Color/Destructive",      light: "#d32f2f",             dark: "#e05252" },
        { role: "Text",             variable: "Text/White",             light: "#ffffff",             dark: "#ffffff" },
        { role: "Background hover", variable: "—",                      light: "#b91c1c",             dark: "#ff6467" },
        { role: "Background active",variable: "—",                      light: "#991b1b",             dark: "#c03030" },
        { role: "Focus ring",       variable: "Color/Destructive",      light: "#d32f2f",             dark: "#e05252" },
      ],
    },
    {
      name: "Positive",
      description: "Save, approve, confirm, complete. Confirmative end of a flow.",
      cssPrefix: "--btn-positive",
      tokens: [
        { role: "Background",       variable: "Border/Success/Default", light: "#00a07e",             dark: "#00a07e" },
        { role: "Text",             variable: "Text/White",             light: "#ffffff",             dark: "#ffffff" },
        { role: "Background hover", variable: "—",                      light: "#003328",             dark: "#003328" },
        { role: "Background active",variable: "—",                      light: "#001f18",             dark: "#001f18" },
        { role: "Focus ring",       variable: "Border/Success/Default", light: "#00a07e",             dark: "#00a07e" },
      ],
    },
    {
      name: "Main Action",
      description: "High-conversion hero CTA. Used once per screen at the point of maximum attention.",
      cssPrefix: "gradient (hardcoded)",
      tokens: [
        { role: "Gradient start",   variable: "—",                      light: "#2173ff",             dark: "#2173ff" },
        { role: "Gradient end",     variable: "—",                      light: "#09e2ab",             dark: "#09e2ab" },
        { role: "Shadow default",   variable: "—",                      light: "#09e2ab29",           dark: "#09e2ab29" },
        { role: "Shadow hover",     variable: "—",                      light: "#00c94f59",           dark: "#00c94f59" },
        { role: "Focus ring",       variable: "—",                      light: "#cbfff4",             dark: "#cbfff4" },
        { role: "Hover grad start", variable: "—",                      light: "#002f80",             dark: "#002f80" },
      ],
    },
  ],
}

const INPUT_SPEC = {
  name: "Text field",
  figmaNodeId: "4833:2316",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4833-2316",
  description: "Single-line input for short values: names, emails, search queries, codes. Use Text Description for longer free text.",
  properties: [
    { name: "State",             type: "Variant",  values: ["Default", "Hover", "Focus", "Error", "Success", "Alert", "Disabled"], default: "Default" },
    { name: "Size",              type: "Variant",  values: ["M", "S"],           default: "M" },
    { name: "Label",             type: "Boolean",  values: ["true", "false"],    default: "true",  note: "Label text above the field" },
    { name: "Left icon",         type: "Boolean",  values: ["true", "false"],    default: "false", note: "Leading icon slot (16×16px)" },
    { name: "Right Icon",        type: "Boolean",  values: ["true", "false"],    default: "false", note: "Trailing icon slot — auto-shows state indicator" },
    { name: "Supporting text",   type: "Boolean",  values: ["true", "false"],    default: "false", note: "Helper / validation message below the field" },
    { name: "Placeholder",       type: "Boolean",  values: ["true", "false"],    default: "true",  note: "Placeholder text inside the field" },
    { name: "Placeholder visible", type: "Boolean", values: ["true", "false"],   default: "true" },
    { name: "Caret",             type: "Boolean",  values: ["true", "false"],    default: "false", note: "Cursor indicator (shown in Focus state)" },
  ],
  sizes: [
    { size: "S", height: "32px", inputFontSize: "14px", cornerRadius: "8px", paddingX: "12px", iconGap: "10px" },
    { size: "M", height: "40px", inputFontSize: "14px", cornerRadius: "8px", paddingX: "12px", iconGap: "10px" },
  ],
  typography: [
    { element: "Label",          family: "Inter", size: "12px", weight: "Semi Bold (600)", lineHeight: "1.5", variable: "Label/Bold/S" },
    { element: "Input text",     family: "Inter", size: "14px", weight: "Medium (500)",    lineHeight: "1.5", variable: "Body/Regular/M" },
    { element: "Placeholder",    family: "Inter", size: "14px", weight: "Medium (500)",    lineHeight: "1.5", variable: "Body/Regular/M" },
    { element: "Supporting text",family: "Inter", size: "12px", weight: "Medium (500)",    lineHeight: "1.5", variable: "Body/Regular/S" },
  ],
  states: [
    {
      name: "Default",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Neutral/Default",    varId: "4465:4448", light: "#5c5c5c",   dark: "#ffffff1a" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Input text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Placeholder",      variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Supporting text",  variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
      ],
    },
    {
      name: "Hover",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Neutral/Black",      varId: "4465:4583", light: "#000000",   dark: "#ffffff4d" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Placeholder",      variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Supporting text",  variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
      ],
    },
    {
      name: "Focus",
      borderWidth: "1px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Primary/Default",    varId: "4465:4452", light: "#2173ff",   dark: "#2b7fff" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Input text",       variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
        { role: "Supporting text",  variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
      ],
    },
    {
      name: "Error",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Error/Lighter",      varId: "4465:4457", light: "#d32f2f",   dark: "#fb2c36" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Placeholder",      variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
        { role: "Supporting text",  variable: "Text/Error",                varId: "4465:4473", light: "#5f2120",   dark: "#ff6467" },
      ],
    },
    {
      name: "Success",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Success/Default",    varId: "4465:4464", light: "#00a07e",   dark: "#00c9504d" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Placeholder",      variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
        { role: "Supporting text",  variable: "Text/Success",              varId: "4465:4505", light: "#003328",   dark: "#6ee7b7" },
      ],
    },
    {
      name: "Alert",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Alert/Default",      varId: "4465:4460", light: "#ed6c02",   dark: "#fbbf24" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Placeholder",      variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
        { role: "Supporting text",  variable: "Text/Alert",                varId: "4465:4504", light: "#663c00",   dark: "#fcd34d" },
      ],
    },
    {
      name: "Disabled",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Neutral/Lighter",    varId: "4465:4449", light: "#bababa",   dark: "#ffffff26" },
        { role: "Label text",       variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Input text",       variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Supporting text",  variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
      ],
    },
  ],
}

const TEXTAREA_SPEC = {
  name: "Text Description",
  figmaNodeId: "5084:2494",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=5084-2494",
  description: "Multi-line field for free text: paragraphs, descriptions, notes, prompts, JSON payloads. Use when the expected input is longer than one sentence.",
  properties: [
    { name: "State",               type: "Variant",  values: ["Default", "Hover", "Focus", "Error", "Success", "Alert", "Disabled"], default: "Default" },
    { name: "Label",               type: "Boolean",  values: ["true", "false"],   default: "true",  note: "Label text above the field" },
    { name: "Feedback Characters", type: "Boolean",  values: ["true", "false"],   default: "true",  note: "Character count shown as 'current/max'" },
    { name: "ScrollBar",           type: "Boolean",  values: ["true", "false"],   default: "true",  note: "Scrollbar shown when content overflows the fixed height" },
    { name: "Expand Content",      type: "Boolean",  values: ["true", "false"],   default: "false", note: "When true, the field auto-grows with content (no fixed height)" },
    { name: "Placeholder",         type: "Boolean",  values: ["true", "false"],   default: "true",  note: "Placeholder text (shown as 'Placeholder...')" },
    { name: "Caret",               type: "Boolean",  values: ["true", "false"],   default: "false", note: "Cursor indicator (shown in Focus state)" },
  ],
  sizes: [
    { size: "Default", height: "148px (textarea area)", inputFontSize: "14px", cornerRadius: "8px", paddingX: "16px", paddingY: "12px", gap: "10px (inner)", outerGap: "4px (between label/field/feedback)" },
  ],
  typography: [
    { element: "Label",            family: "Inter", size: "12px", weight: "Semi Bold (600)", lineHeight: "1.5", variable: "Label/Bold/S" },
    { element: "Input text",       family: "Inter", size: "14px", weight: "Medium (500)",    lineHeight: "1.5", variable: "Body/Regular/M" },
    { element: "Placeholder",      family: "Inter", size: "14px", weight: "Medium (500)",    lineHeight: "1.5", note: "Shown as 'Placeholder...'" },
    { element: "Char count",       family: "Inter", size: "12px", weight: "Medium (500)",    lineHeight: "1.5", note: "Format: '0/000'" },
    { element: "Supporting text",  family: "Inter", size: "12px", weight: "Medium (500)",    lineHeight: "1.5" },
  ],
  states: [
    {
      name: "Default",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Neutral/Default",    varId: "4465:4448", light: "#5c5c5c",   dark: "#ffffff1a" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Placeholder",      variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Char count",       variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
        { role: "Supporting text",  variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
      ],
    },
    {
      name: "Hover",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Neutral/Darker",     varId: "4465:4450", light: "#2a2a2a",   dark: "#ffffff33" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Placeholder",      variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
      ],
    },
    {
      name: "Focus",
      borderWidth: "1px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Primary/Default",    varId: "4465:4452", light: "#2173ff",   dark: "#2b7fff" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Char count",       variable: "Text/Body",                 varId: "4465:4469", light: "#5c5c5c",   dark: "#ffffff99" },
      ],
    },
    {
      name: "Error",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Error/Lighter",      varId: "4465:4457", light: "#d32f2f",   dark: "#fb2c36" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Placeholder",      variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Supporting text",  variable: "Text/Error",                varId: "4465:4473", light: "#5f2120",   dark: "#ff6467" },
        { role: "Char count",       variable: "Text/Error",                varId: "4465:4473", light: "#5f2120",   dark: "#ff6467" },
      ],
    },
    {
      name: "Success",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Success/Default",    varId: "4465:4464", light: "#00a07e",   dark: "#00c9504d" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Supporting text",  variable: "Text/Success",              varId: "4465:4505", light: "#003328",   dark: "#6ee7b7" },
        { role: "Char count",       variable: "Text/Success",              varId: "4465:4505", light: "#003328",   dark: "#6ee7b7" },
      ],
    },
    {
      name: "Alert",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Alert/Default",      varId: "4465:4460", light: "#ed6c02",   dark: "#fbbf24" },
        { role: "Label text",       variable: "Text/Subtitle",             varId: "4465:4468", light: "#2a2a2a",   dark: "#ffffff99" },
        { role: "Supporting text",  variable: "Text/Alert",                varId: "4465:4504", light: "#663c00",   dark: "#fcd34d" },
        { role: "Char count",       variable: "Text/Alert",                varId: "4465:4504", light: "#663c00",   dark: "#fcd34d" },
      ],
    },
    {
      name: "Disabled",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",       variable: "Surface/Neutral/White",     varId: "4465:4591", light: "#ffffff",   dark: "#ffffff1a" },
        { role: "Border",           variable: "Border/Neutral/Lighter",    varId: "4465:4449", light: "#bababa",   dark: "#ffffff26" },
        { role: "Label text",       variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Placeholder",      variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Char count",       variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
        { role: "Supporting text",  variable: "Text/Disabled",             varId: "4465:4472", light: "#bababa",   dark: "#ffffff4d" },
      ],
    },
  ],
}

const CARD_SPEC = {
  name: "Card Container",
  figmaNodeId: "5388:23473",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=5388-23473",
  description: "Semantic container for grouping related content. 11 color styles communicate intent at a glance — neutral, primary, status, or categorical. Use S for compact metadata, M for general content, L for featured sections.",
  properties: [
    { name: "Style",    type: "Variant",  values: ["Default","White Opacity","Primary","Green","Reed","Orange","Yellow","Purple","Light Blue","Lime Green","Dashed"], default: "Default" },
    { name: "Size",     type: "Variant",  values: ["S","M","L"], default: "M" },
    { name: "Selected", type: "Boolean",  values: ["true","false"], default: "false", note: "Border width increases to 1px and color shifts to selected token. Use for card-based selection UI (radio cards, choice sets)" },
    { name: "Disabled", type: "Boolean",  values: ["true","false"], default: "false", note: "Reduces opacity to 40% and blocks pointer events" },
  ],
  sizes: [
    { size: "S", padding: "12px all sides",   cornerRadius: "8px",  stroke: "0.5px inside" },
    { size: "M", padding: "16px H / 24px V",  cornerRadius: "8px",  stroke: "0.5px inside" },
    { size: "L", padding: "24px all sides",   cornerRadius: "16px", stroke: "0.5px inside" },
  ],
  typography: [] as { element: string; family: string; size: string; weight: string; lineHeight: string; variable?: string }[],
  states: [
    {
      name: "Default",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Neutral/White",       varId: "4465:4591", light: "#ffffff",              dark: "rgba(255,255,255,0.1)"  },
        { role: "Border",          variable: "Border/Neutral/Lighter",      varId: "4465:4449", light: "#bababa",              dark: "rgba(255,255,255,0.15)" },
        { role: "Border hover",    variable: "Border/Neutral/Default",      varId: "4465:4448", light: "#5c5c5c",              dark: "rgba(255,255,255,0.1)"  },
        { role: "Border selected", variable: "Border/Primary/Default",      varId: "4465:4452", light: "#2173ff",              dark: "#2b7fff"                },
      ],
    },
    {
      name: "Primary",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Primary/More Subtle", varId: "4465:4597", light: "#f6f9ff",              dark: "rgba(43,127,255,0.08)"  },
        { role: "Border",          variable: "Border/Primary/Lighter",      varId: "4465:4453", light: "#80afff",              dark: "rgba(43,127,255,0.1)"   },
        { role: "Border hover",    variable: "Border/Primary/Default",      varId: "4465:4452", light: "#2173ff",              dark: "#2b7fff"                },
        { role: "Border selected", variable: "Border/Primary/Default",      varId: "4465:4452", light: "#2173ff",              dark: "#2b7fff"                },
      ],
    },
    {
      name: "Green",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Success/More Subtle", varId: "4465:4598", light: "#e5fdf8",              dark: "#0a1f1a"                },
        { role: "Border",          variable: "Border/Success/Default",      varId: "4465:4464", light: "#00a07e",              dark: "rgba(0,201,80,0.3)"     },
        { role: "Border hover",    variable: "Border/Success/Lighter",      varId: "4465:4465", light: "#009978",              dark: "#34d399"                },
        { role: "Border selected", variable: "Border/Success/Default",      varId: "4465:4464", light: "#00a07e",              dark: "rgba(0,201,80,0.3)"     },
      ],
    },
    {
      name: "Reed",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Card/Reed BG/Stop0",  varId: "",          light: "#fdeded",              dark: "rgba(251,44,54,0.1)"    },
        { role: "Border",          variable: "Border/Error/Lighter",        varId: "4465:4457", light: "#d32f2f",              dark: "#fb2c36"                },
        { role: "Border hover",    variable: "Border/Error/Lighter",        varId: "4465:4457", light: "#d32f2f",              dark: "#fb2c36"                },
        { role: "Border selected", variable: "Border/Error/Lighter",        varId: "4465:4457", light: "#d32f2f",              dark: "#fb2c36"                },
      ],
    },
    {
      name: "Orange",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Alert/More Subtle",   varId: "4465:4599", light: "#fff4e5",              dark: "#281e00"                },
        { role: "Border",          variable: "Border/Alert/Subtle",         varId: "4465:4461", light: "#edc6a6",              dark: "#2d1a08"                },
        { role: "Border hover",    variable: "Border/Alert/Lighter",        varId: "4465:4462", light: "#b25102",              dark: "#f59e0b"                },
        { role: "Border selected", variable: "Border/Alert/Default",        varId: "4465:4460", light: "#ed6c02",              dark: "#fbbf24"                },
      ],
    },
    {
      name: "Yellow",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Yellow/More Subtle",  varId: "",          light: "#fffaf0",              dark: "#281e00"                },
        { role: "Border",          variable: "Border/Yellow/Lighter",       varId: "",          light: "#edc6a6",              dark: "#f59e0b"                },
        { role: "Border hover",    variable: "Border/Yellow/Default",       varId: "",          light: "#ed6c02",              dark: "#fbbf24"                },
        { role: "Border selected", variable: "Border/Yellow/Darker",        varId: "",          light: "#663c00",              dark: "#fcd34d"                },
      ],
    },
    {
      name: "Purple",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Purple/More Subtle",  varId: "",          light: "#f3e9fd",              dark: "#120520"                },
        { role: "Border",          variable: "Border/Purple/Lighter",       varId: "",          light: "#cfa7f9",              dark: "rgba(173,70,255,0.2)"   },
        { role: "Border hover",    variable: "Border/Purple/Default",       varId: "",          light: "#7b27ed",              dark: "#a855f7"                },
        { role: "Border selected", variable: "Border/Purple/Darker",        varId: "",          light: "#2c075c",              dark: "#d8b4fe"                },
      ],
    },
    {
      name: "Light Blue",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Light Blue/More Subtle", varId: "",       light: "#e5f8ff",              dark: "#071828"                },
        { role: "Border",          variable: "Border/Light Blue/Lighter",    varId: "",         light: "#99e5f9",              dark: "rgba(81,162,255,0.2)"   },
        { role: "Border hover",    variable: "Border/Light Blue/Default",    varId: "",         light: "#00b5d9",              dark: "#38bdf8"                },
        { role: "Border selected", variable: "Border/Light Blue/Darker",     varId: "",         light: "#02445a",              dark: "#7dd3fc"                },
      ],
    },
    {
      name: "Lime Green",
      borderWidth: "0.5px",
      tokens: [
        { role: "Background",      variable: "Surface/Lime Green/More Subtle", varId: "",       light: "#f9fee5",              dark: "#111a04"                },
        { role: "Border",          variable: "Border/LimeGreen/Lighter",     varId: "",         light: "#d4f381",              dark: "rgba(189,238,73,0.2)"   },
        { role: "Border hover",    variable: "Border/LimeGreen/Default",     varId: "",         light: "#a0da1d",              dark: "#84cc16"                },
        { role: "Border selected", variable: "Border/LimeGreen/Darker",      varId: "",         light: "#3e5c0a",              dark: "#bdee49"                },
      ],
    },
    {
      name: "Dashed",
      borderWidth: "0.5px dashed",
      tokens: [
        { role: "Background",      variable: "—",                            varId: "",         light: "transparent",          dark: "transparent"            },
        { role: "Border",          variable: "Border/Neutral/Lighter",       varId: "4465:4449",light: "#bababa",              dark: "rgba(255,255,255,0.15)" },
        { role: "Border hover",    variable: "Border/Neutral/Default",       varId: "4465:4448",light: "#5c5c5c",              dark: "rgba(255,255,255,0.1)"  },
        { role: "Border selected", variable: "Border/Primary/Default",       varId: "4465:4452",light: "#2173ff",              dark: "#2b7fff"                },
      ],
    },
  ],
}

// ── Usage guide data ──────────────────────────────────────────────────────

const BUTTON_USAGE = [
  {
    variant: "Primary",
    color: "#2173ff",
    use: [
      "Main CTA of the screen — create, submit, proceed.",
      "Highest-weight action in a modal or wizard flow.",
      "Maximum 1–2 per view.",
    ],
    avoid: [
      "Secondary or cancel actions.",
      "Destructive actions — use Warning instead.",
      "More than 2 in the same section.",
    ],
  },
  {
    variant: "Secondary",
    color: "#ffffff1a",
    use: [
      "Alternative action with similar weight to Primary.",
      "Active filters, clickable tags, selection toggles.",
      "Actions that must stay visible without competing with Primary.",
    ],
    avoid: [
      "Primary action of the view.",
      "Long text labels — the pill shape breaks visually.",
      "Destructive actions.",
    ],
  },
  {
    variant: "Tertiary",
    color: "transparent",
    use: [
      "Cancel, go back, close without saving.",
      "Low-impact inline edit actions.",
      "Navigation links with a button appearance.",
    ],
    avoid: [
      "When the action requires visual prominence — use Primary.",
      "Destructive actions — risk of going unnoticed.",
    ],
  },
  {
    variant: "Warning",
    color: "#e05252",
    use: [
      "Delete, revoke access, permanently archive.",
      "Any irreversible action or one that erases data.",
    ],
    avoid: [
      "Actions that can be undone — use Primary.",
      "Soft rejection or cancel actions — use Tertiary.",
    ],
  },
  {
    variant: "Positive Action",
    color: "#00a07e",
    use: [
      "Save, approve, confirm, complete a task.",
      "Successful close of a flow (\"Done\", \"Publish\", \"Approve\").",
    ],
    avoid: [
      "Neutral or navigation actions — use Primary.",
      "High-conversion flows where Main Action fits better.",
    ],
  },
  {
    variant: "Main Action",
    color: "linear-gradient(135deg,#2173ff,#09e2ab)",
    use: [
      "High-conversion hero CTA: upgrade, activate premium feature, start onboarding.",
      "Used once per screen at the point of maximum attention.",
    ],
    avoid: [
      "Common actions within a repetitive flow.",
      "More than 1 per screen — loses its value as the featured CTA.",
    ],
  },
]

const INPUT_USAGE = [
  {
    state: "Default",
    color: "var(--field-border)",
    use:   ["Initial state of any form field.", "Optional fields the user hasn't yet interacted with."],
    avoid: ["Showing validation prematurely before the user has finished typing."],
  },
  {
    state: "Error",
    color: "#d32f2f",
    use:   ["Validation failed on blur or form submit.", "Required field left empty when trying to proceed."],
    avoid: ["Showing during active typing — wait for blur.", "Generic error text — specify what failed."],
  },
  {
    state: "Success",
    color: "#00a07e",
    use:   ["Real-time validation passed (unique email, strong password, valid code).", "Immediate confirmation after correcting an error."],
    avoid: ["Fields that don't require async validation — no need to confirm every free-text input."],
  },
  {
    state: "Alert",
    color: "#ed6c02",
    use:   ["Data is valid but needs user attention (e.g. email already registered, value outside recommended range).", "Non-blocking warning."],
    avoid: ["Errors that prevent proceeding — use Error.", "Critical security warnings — those are Errors, not Alerts."],
  },
  {
    state: "Disabled",
    color: "var(--field-border)",
    use:   ["Field unavailable in the current context (insufficient permission, blocked flow).", "Read-only values visible in a form."],
    avoid: ["Hiding irrelevant fields — better not to render them.", "Using as a placeholder for a future field without explanation."],
  },
]

const TAG_USAGE = [
  {
    variant: "Success",
    color: "#009978",
    use:   ["Completed tasks, passed checks, healthy metrics.", "Confirmed or verified status."],
    avoid: ["General positive sentiment — reserve for actual success states."],
  },
  {
    variant: "Error",
    color: "#e05252",
    use:   ["Failed status, critical issues, blocked items.", "Hard validation errors in data tables."],
    avoid: ["Warnings or soft alerts — use Alert instead."],
  },
  {
    variant: "Alert",
    color: "#f59e0b",
    use:   ["Needs attention, expiring soon, non-blocking warning.", "In-review or pending approval."],
    avoid: ["Hard failures — use Error. Informational labels — use Informative."],
  },
  {
    variant: "Informative",
    color: "#2173ff",
    use:   ["Neutral labels with a blue-brand feel: categories, types, feature flags.", "Contextual info without a pass/fail implication."],
    avoid: ["Status that maps to success or error — use the semantic variants."],
  },
  {
    variant: "Primary",
    color: "#2173ff",
    use:   ["High-emphasis selected state, active filter, current plan badge.", "When the tag must stand out against a busy background."],
    avoid: ["Overuse — one or two per row maximum."],
  },
  {
    variant: "Secondary / Neutral",
    color: "#5c5c5c",
    use:   ["Neutral metadata: labels, categories, tags with no semantic weight.", "Default when no specific status is implied."],
    avoid: ["Status states — use the semantic variants."],
  },
]

const TAG_SPEC = {
  name: "Tag",
  figmaNodeId: "4607:619",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4607-619",
  description: "Inline badge for status, category, and metadata. 11 semantic variants communicate intent — success, error, alert, informative, and categorical colors. Size S for dense tables, M for general UI.",
  properties: [
    { name: "State",    type: "Variant",  values: ["Success","Secondary","Primary","Informative","Error","Alert","Lime Green","Yellow","Purple","Light Blue","Neutral"], default: "Secondary" },
    { name: "Size",     type: "Variant",  values: ["S","M"], default: "M", note: "S: 20px height / 12px font. M: 24px height / 14px font." },
    { name: "Feedback", type: "Variant",  values: ["Active","Disabled"], default: "Active" },
    { name: "Just icon",type: "Boolean",  values: ["Yes","No"], default: "No", note: "When Yes, hides text and shows only the leading icon. Useful for compact column headers." },
  ],
  sizes: [
    { size: "S", height: "20px", paddingH: "8px", paddingV: "4px", fontSize: "12px", gap: "4px", radius: "8px" },
    { size: "M", height: "24px", paddingH: "8px", paddingV: "4px", fontSize: "14px", gap: "4px", radius: "8px" },
  ],
  typography: [
    { element: "Label",  family: "Inter", size: "12px (S) / 14px (M)", weight: "500 — Medium", lineHeight: "1",    variable: "font-weight: 500" },
  ],
  variants: [
    {
      name: "success",
      description: "Completed, verified, healthy",
      cssPrefix: "tag-success",
      tokens: [
        { role: "Background", variable: "Surface/Success/More Subtle", varId: "4465:2672", light: "#e5fdf8", dark: "#0a1f1a"  },
        { role: "Border",     variable: "Border/Success/Lighter",      varId: "4465:4465", light: "#009978", dark: "#34d399"  },
        { role: "Text",       variable: "Text/Success",                varId: "4465:4505", light: "#003328", dark: "#6ee7b7"  },
      ],
    },
    {
      name: "error",
      description: "Failed, blocked, critical",
      cssPrefix: "tag-error",
      tokens: [
        { role: "Background", variable: "Surface/Error/More Subtle",   varId: "4465:2662", light: "#fdeded", dark: "#2d1515"  },
        { role: "Border",     variable: "Border/Error/Default",        varId: "4465:4456", light: "#992222", dark: "#e05252"  },
        { role: "Text",       variable: "Text/Error",                  varId: "4465:4473", light: "#5f2120", dark: "#ff6467"  },
      ],
    },
    {
      name: "alert",
      description: "Pending, needs attention, expiring",
      cssPrefix: "tag-alert",
      tokens: [
        { role: "Background", variable: "Surface/Alert/More Subtle",   varId: "4465:2666", light: "#ffeedb", dark: "#281e00"  },
        { role: "Border",     variable: "Border/Alert/Lighter",        varId: "4465:4461", light: "#b25102", dark: "#f59e0b"  },
        { role: "Text",       variable: "Text/Alert",                  varId: "4465:4504", light: "#663c00", dark: "#fcd34d"  },
      ],
    },
    {
      name: "informative",
      description: "Category, type, feature flags",
      cssPrefix: "tag-informative",
      tokens: [
        { role: "Background", variable: "Surface/Primary/Subtle",      varId: "4461:2592", light: "#e9f1ff", dark: "rgba(21,93,252,0.15)" },
        { role: "Border",     variable: "Border/Primary/Default",      varId: "4465:4452", light: "#2173ff", dark: "#2b7fff"  },
        { role: "Text",       variable: "Text/Info",                   varId: "4465:4506", light: "#001740", dark: "rgba(255,255,255,0.8)" },
      ],
    },
    {
      name: "primary",
      description: "Selected, active, high-emphasis",
      cssPrefix: "tag-primary",
      tokens: [
        { role: "Background", variable: "Primary/500",                 varId: "4461:2591", light: "#2173ff", dark: "#155dfc"  },
        { role: "Border",     variable: "transparent",                 varId: "",          light: "none",    dark: "none"     },
        { role: "Text",       variable: "Text/Negative",               varId: "4465:4471", light: "#ffffff", dark: "#ffffff"  },
      ],
    },
    {
      name: "secondary",
      description: "Default neutral label",
      cssPrefix: "tag-secondary",
      tokens: [
        { role: "Background", variable: "Gray/100 / White/10",         varId: "4465:4591", light: "#ffffff", dark: "rgba(255,255,255,0.10)" },
        { role: "Border",     variable: "Gray/600 / White/10",         varId: "4465:4448", light: "#5c5c5c", dark: "rgba(255,255,255,0.10)" },
        { role: "Text",       variable: "Text/Subtitle",               varId: "4465:4468", light: "#2a2a2a", dark: "rgba(255,255,255,0.60)" },
      ],
    },
    {
      name: "neutral",
      description: "Low-emphasis label on tinted surfaces",
      cssPrefix: "tag-neutral",
      tokens: [
        { role: "Background", variable: "Gray/300 / White/8",          varId: "4465:2687", light: "#f2f2f2", dark: "rgba(255,255,255,0.08)" },
        { role: "Border",     variable: "Gray/600 / White/10",         varId: "4465:4448", light: "#5c5c5c", dark: "rgba(255,255,255,0.10)" },
        { role: "Text",       variable: "Text/Subtitle",               varId: "4465:4468", light: "#2a2a2a", dark: "rgba(255,255,255,0.60)" },
      ],
    },
  ],
}

const MENU_SPEC = {
  name: "Menu / Dropdown",
  figmaNodeId: "4762:7152",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4762-7152",
  description: "Floating list of selectable options. Used inside dropdowns, context menus, command palettes, and select fields. Supports icons, subtext, dividers, and section headers.",
  properties: [
    { name: "State",          type: "Variant",  values: ["Default","Hover","Focus","Disabled","Skeleton"], default: "Default" },
    { name: "Size",           type: "Variant",  values: ["M","S"],                                         default: "M", note: "M/S: height auto (py-8px) · 40px single-line · 56px with subtext" },
    { name: "Leading icon",   type: "Boolean",  values: ["Yes","No"],                                      default: "No", note: "Leading slot — any icon · Avatar · Highlight icon · Checkbox goes separately before this slot" },
    { name: "Checkbox",       type: "Boolean",  values: ["Yes","No"],                                      default: "No", note: "Checkbox-NEW before leadingIcon slot · 32×32 (M) · 24×24 (S)" },
    { name: "Subtext",        type: "Boolean",  values: ["Yes","No"],                                      default: "No", note: "Secondary row below label · DS: Roboto Regular 14px · doc app: Inter" },
    { name: "Trailing",       type: "Variant",  values: ["None","Tag","Button"],                            default: "None", note: "Tag = Neutral/S · Button = Tertiary/Icon Alone/Close · 40×40 (M) · 28×28 (S)" },
  ],
  sizes: [
    { size: "M", height: "auto · 40px single-line · 56px with subtext", paddingV: "8px", paddingH: "16px", gap: "16px", fontSize: "14px — Text/Subtitle",  iconSize: "24×24px" },
    { size: "S", height: "auto · 40px single-line · 56px with subtext", paddingV: "8px", paddingH: "8px",  gap: "8px",  fontSize: "12px — Text/Body (lighter)", iconSize: "16×16px" },
  ],
  typography: [
    { element: "Label M",   family: "Inter", size: "14px", weight: "500 — Medium",  lineHeight: "20px", variable: "--menu-item-text",    note: "Text/Subtitle · VariableID:4465:4468" },
    { element: "Label S",   family: "Inter", size: "12px", weight: "500 — Medium",  lineHeight: "20px", variable: "--menu-item-subtext", note: "Text/Body (lighter) · VariableID:4465:4469 — different token than M" },
    { element: "Subtext",   family: "Inter", size: "14px", weight: "400 — Regular", lineHeight: "20px", variable: "--menu-item-subtext", note: "DS: Roboto Regular 14px · doc app uses Inter" },
    { element: "Section",   family: "Inter", size: "11px", weight: "600 — SemiBold",lineHeight: "1",   variable: "--menu-section-text" },
  ],
  variants: [
    {
      name: "default",
      description: "Unselected row. Hover applies Surface/Floating/Hover automatically via CSS.",
      cssPrefix: "menu-item",
      tokens: [
        { role: "Background",       variable: "Surface/Floating/Default", varId: "13469:2", light: "rgba(255,255,255,0.92)", dark: "rgba(20,27,42,0.85)"    },
        { role: "Hover background", variable: "Surface/Floating/Hover",   varId: "13469:3", light: "rgba(242,242,242,0.95)", dark: "rgba(32,42,62,0.90)"    },
        { role: "Label text",       variable: "Text/Subtitle",            varId: "4465:4468",light: "#2A2A2A",               dark: "rgba(255,255,255,0.60)" },
        { role: "Icon",             variable: "Icon/Neutral/Dark",        varId: "4465:4510",light: "#5C5C5C",               dark: "rgba(255,255,255,0.50)" },
      ],
    },
    {
      name: "focus",
      description: "Keyboard-focused or hover-locked row. Same bg as Hover — no color inversion.",
      cssPrefix: "menu-item-focus",
      tokens: [
        { role: "Background",       variable: "Surface/Floating/Hover",   varId: "13469:3", light: "rgba(242,242,242,0.95)", dark: "rgba(32,42,62,0.90)"    },
        { role: "Label text",       variable: "Text/Subtitle (unchanged)", varId: "4465:4468",light: "#2A2A2A",               dark: "rgba(255,255,255,0.60)" },
      ],
    },
    {
      name: "disabled",
      description: "Unavailable row. Background stays the same — only text/icon color changes to Text/Disabled.",
      cssPrefix: "menu-item-disabled",
      tokens: [
        { role: "Background",       variable: "Surface/Floating/Default (unchanged)", varId: "13469:2", light: "rgba(255,255,255,0.92)", dark: "rgba(20,27,42,0.85)" },
        { role: "Label + icon",     variable: "Text/Disabled",            varId: "4465:4472",light: "#BABABA",                dark: "rgba(255,255,255,0.30)" },
      ],
    },
  ],
}

const HIGHLIGHT_ICON_SPEC = {
  name: "Highlight Icon",
  figmaNodeId: "7919:10532",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=7919-10532",
  description: "Rounded semantic icon container with tinted background. Used as the leading slot in Menu/Dropdown items, list rows, and standalone context indicators.",
  properties: [
    { name: "Variant",    type: "Variant", values: ["informative","success","alert","error","neutral","yellow","lime","purple","light-blue"], default: "informative", note: "Controls both bg and icon color" },
    { name: "Size",       type: "Variant", values: ["L","M","S"], default: "M", note: "L=40×40 · M=32×32 · S=24×24" },
    { name: "Icon Color", type: "Variant", values: ["Dark","Default"], default: "Dark", note: "Dark = deep saturated DS icon token · Default = lighter/softer tone" },
  ],
  sizes: [
    { size: "L", dimensions: "40×40px", iconSize: "24×24px", padding: "8px all sides", radius: "8px" },
    { size: "M", dimensions: "32×32px", iconSize: "24×24px", padding: "4px all sides", radius: "8px" },
    { size: "S", dimensions: "24×24px", iconSize: "16×16px", padding: "4px all sides", radius: "4px" },
  ],
  typography: [],
  variants: [
    { name: "informative", description: "Primary blue — default for general highlights",     cssPrefix: "hi-informative", tokens: [{ role: "Background", variable: "Primary/100",  varId: "4461:2592",   light: "#E9F1FF", dark: "rgba(33,115,255,0.14)" }, { role: "Icon (dark)", variable: "Icon/Informative/Dark", varId: "4465:4514", light: "#001740", dark: "#A8C8FF" }] },
    { name: "success",     description: "Success / green states",                            cssPrefix: "hi-success",     tokens: [{ role: "Background", variable: "Success/50",   varId: "8541:11928",  light: "#CBFFF4", dark: "rgba(0,169,127,0.14)" }, { role: "Icon (dark)", variable: "Icon/Success/Dark",      varId: "4567:4619", light: "#003328", dark: "#70EDD8" }] },
    { name: "alert",       description: "Alert / warning states",                            cssPrefix: "hi-alert",       tokens: [{ role: "Background", variable: "Alert/50",    varId: "4465:2666",   light: "#FFEEDB", dark: "rgba(217,119,6,0.14)" },   { role: "Icon (dark)", variable: "Icon/Alert/Dark",        varId: "4567:4618", light: "#663C00", dark: "#FFC070" }] },
    { name: "error",       description: "Error / destructive states",                        cssPrefix: "hi-error",       tokens: [{ role: "Background", variable: "Error/50",    varId: "4465:2662",   light: "#FDEDED", dark: "rgba(220,38,38,0.14)" },   { role: "Icon (dark)", variable: "Icon/Error/Dark",        varId: "4567:4620", light: "#5F2120", dark: "#FF9898" }] },
    { name: "neutral",     description: "Neutral / gray for no-color contexts",              cssPrefix: "hi-neutral",     tokens: [{ role: "Background", variable: "Gray/100",     varId: "4465:4589",   light: "#F2F2F2", dark: "rgba(255,255,255,0.08)" }, { role: "Icon (dark)", variable: "Text/Primary/Dark",      varId: "4465:4589", light: "#2A2A2A", dark: "rgba(255,255,255,0.70)" }] },
    { name: "yellow",      description: "Yellow / golden highlights",                        cssPrefix: "hi-yellow",      tokens: [{ role: "Background", variable: "Yellow/50",   varId: "8539:40814",  light: "#FFEEDB", dark: "rgba(202,138,4,0.14)" },   { role: "Icon (dark)", variable: "Icon/Yellow/Dark",       varId: "8539:40814",light: "#5C3500", dark: "#FFE070" }] },
    { name: "lime",        description: "Lime green — growth, eco, positive activity",       cssPrefix: "hi-lime",        tokens: [{ role: "Background", variable: "Lime/50",     varId: "8539:40885",  light: "#E7F9B5", dark: "rgba(101,163,13,0.14)" },  { role: "Icon (dark)", variable: "Icon/Lime/Dark",         varId: "8539:40885",light: "#3E5C0A", dark: "#C4F060" }] },
    { name: "purple",      description: "Purple / creative / AI contexts",                   cssPrefix: "hi-purple",      tokens: [{ role: "Background", variable: "Purple/100",  varId: "8539:40955",  light: "#E4CEFC", dark: "rgba(124,58,237,0.14)" },  { role: "Icon (dark)", variable: "Icon/Purple/Dark",       varId: "8539:40955",light: "#2C075C", dark: "#D4A0FF" }] },
    { name: "light-blue",  description: "Light blue / sky — integrations, cloud, data",     cssPrefix: "hi-lightblue",   tokens: [{ role: "Background", variable: "LightBlue/100",varId: "8540:41021",  light: "#CCF1FF", dark: "rgba(2,132,199,0.14)" },   { role: "Icon (dark)", variable: "Icon/LightBlue/Dark",    varId: "8540:41021",light: "#02445A", dark: "#80DCFF" }] },
  ],
}

const SELECT_SPEC = {
  name: "Select",
  figmaNodeId: "14405:9600",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=14405-9600",
  description: "Non-editable trigger field that opens a Menu/Dropdown panel. Shares all visual tokens with Input (Text Field). Shows the selected value or placeholder text with a dynamic right icon.",
  properties: [
    { name: "state",         type: "Variant", values: ["default","error","disabled"],         default: "default" },
    { name: "size",          type: "Variant", values: ["default (M=40px)","sm (S=32px)"],      default: "default" },
    { name: "value",         type: "String",  values: ["any string"],                          default: "undefined",  note: "When truthy → blue border + clear (×) icon" },
    { name: "open",          type: "Boolean", values: ["true","false"],                        default: "false",      note: "When true → blue border + ChevronUp" },
    { name: "placeholder",   type: "String",  values: ["any string"],                          default: "Select an option" },
    { name: "label",         type: "String",  values: ["any string"],                          default: "undefined",  note: "Floats on the top border (same as Input)" },
    { name: "supportingText",type: "String",  values: ["any string"],                          default: "undefined" },
    { name: "leadingIcon",   type: "ReactNode",values: ["any icon"],                           default: "undefined" },
    { name: "onClick",       type: "Function",values: ["() => void"],                          default: "undefined" },
    { name: "onClear",       type: "Function",values: ["() => void"],                          default: "undefined" },
  ],
  sizes: [
    { size: "M (default)", height: "40px", fontSize: "14px", cornerRadius: "8px", paddingX: "12px", paddingY: "4px" },
    { size: "S (sm)",      height: "32px", fontSize: "14px", cornerRadius: "8px", paddingX: "12px", paddingY: "4px" },
  ],
  typography: [
    { element: "Label",          family: "Inter", size: "12px", weight: "Semi Bold (600)", lineHeight: "1.5", variable: "--field-label" },
    { element: "Value / Placeholder", family: "Inter", size: "14px", weight: "Medium (500)", lineHeight: "1.5", variable: "--field-text / --field-placeholder" },
    { element: "Supporting text", family: "Inter", size: "12px", weight: "Medium (500)",   lineHeight: "1.5", variable: "--field-supporting / --field-text-error" },
  ],
  states: [
    { name: "default",  borderWidth: "0.5px", tokens: [{ role: "Border", variable: "Border/Neutral/Default", varId: "", light: "#5c5c5c", dark: "rgba(255,255,255,0.10)" }, { role: "Background", variable: "Surface/Neutral/White", varId: "", light: "#ffffff", dark: "rgba(255,255,255,0.10)" }, { role: "Right icon", variable: "ChevronDown", varId: "", light: "–", dark: "–" }] },
    { name: "selected", borderWidth: "1px",   tokens: [{ role: "Border", variable: "Border/Primary/Default", varId: "", light: "#2173ff", dark: "#2b7fff" }, { role: "Right icon", variable: "X (clear)", varId: "", light: "–", dark: "–" }] },
    { name: "open",     borderWidth: "1px",   tokens: [{ role: "Border", variable: "Border/Primary/Default", varId: "", light: "#2173ff", dark: "#2b7fff" }, { role: "Right icon", variable: "ChevronUp", varId: "", light: "–", dark: "–" }] },
    { name: "error",    borderWidth: "0.5px", tokens: [{ role: "Border", variable: "Border/Error/Default",   varId: "", light: "#d32f2f", dark: "#fb2c36" }, { role: "Right icon", variable: "CircleAlert", varId: "", light: "–", dark: "–" }, { role: "Supporting", variable: "Text/Error", varId: "", light: "#5f2120", dark: "#ff6467" }] },
    { name: "disabled", borderWidth: "1px",   tokens: [{ role: "All text + icons", variable: "Text/Disabled",  varId: "", light: "#bababa", dark: "rgba(255,255,255,0.30)" }, { role: "Opacity", variable: "–", varId: "", light: "40%", dark: "40%" }] },
  ],
}

const CHECKBOX_SPEC = {
  name: "Checkbox",
  figmaNodeId: "4753:19229",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4753-19229",
  description: "Binary selection control. Supports standalone use (table rows, menu items) and labeled use (form fields). The outer area is a circular ripple zone that provides hover/focus visual feedback.",
  properties: [
    { name: "checked",     type: "Boolean",  values: ["true","false"],         default: "false" },
    { name: "size",        type: "Variant",  values: ["default (M)","sm (S)"], default: "default" },
    { name: "disabled",    type: "Boolean",  values: ["true","false"],         default: "false" },
    { name: "label",       type: "String",   values: ["any string"],           default: "undefined" },
    { name: "description", type: "String",   values: ["any string"],           default: "undefined" },
    { name: "onChange",    type: "Function", values: ["(checked: boolean) => void"], default: "undefined" },
  ],
  sizes: [
    { size: "M (default)", outer: "32×32px", icon: "24×24px", padding: "4px", ripple: "rounded-full" },
    { size: "S (sm)",      outer: "24×24px", icon: "16×16px", padding: "4px", ripple: "rounded-full" },
  ],
  typography: [
    { element: "Label",       family: "Inter", size: "14px", weight: "Medium (500)", lineHeight: "1.4", variable: "--field-text" },
    { element: "Description", family: "Inter", size: "12px", weight: "Regular (400)", lineHeight: "1.5", variable: "--field-supporting" },
  ],
  states: [
    { name: "unchecked default",  borderWidth: "1.5px", tokens: [{ role: "Icon color",  variable: "Border/Neutral/Default", varId: "", light: "#5c5c5c",  dark: "rgba(255,255,255,0.10)" }] },
    { name: "unchecked hover",    borderWidth: "1.5px", tokens: [{ role: "Ripple bg",   variable: "Surface/Neutral/Default", varId: "", light: "rgba(242,242,242,0.8)", dark: "rgba(255,255,255,0.06)" }, { role: "Icon color", variable: "Border/Neutral/Darker", varId: "", light: "#2a2a2a", dark: "rgba(255,255,255,0.20)" }] },
    { name: "checked default",    borderWidth: "–",     tokens: [{ role: "Fill color",  variable: "Border/Primary/Default", varId: "", light: "#2173ff",  dark: "#2b7fff" }, { role: "Check stroke", variable: "Text/White", varId: "", light: "#ffffff", dark: "#ffffff" }] },
    { name: "checked hover",      borderWidth: "–",     tokens: [{ role: "Ripple bg",   variable: "Primary/50",            varId: "", light: "#e9f1ff",  dark: "rgba(43,127,255,0.14)" }] },
    { name: "disabled",           borderWidth: "1.5px", tokens: [{ role: "Unchecked color", variable: "Text/Disabled",     varId: "", light: "#bababa",  dark: "rgba(255,255,255,0.20)" }, { role: "Checked fill", variable: "Primary/200", varId: "", light: "#80afff", dark: "rgba(43,127,255,0.50)" }] },
  ],
}

const TOGGLE_SPEC = {
  name: "Toggle",
  figmaNodeId: "6068:18167",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=6068-18167",
  description: "On/Off switch with sliding thumb animation. Used for binary settings where the change takes effect immediately — feature flags, notifications, dark mode, permissions.",
  properties: [
    { name: "checked",     type: "Boolean",  values: ["true","false"],                    default: "false" },
    { name: "size",        type: "Variant",  values: ["lg (L)","default (M)","sm (S)"],   default: "default" },
    { name: "disabled",    type: "Boolean",  values: ["true","false"],                    default: "false" },
    { name: "label",       type: "String",   values: ["any string"],                      default: "undefined" },
    { name: "description", type: "String",   values: ["any string"],                      default: "undefined" },
    { name: "onChange",    type: "Function", values: ["(checked: boolean) => void"],      default: "undefined" },
  ],
  sizes: [
    { size: "L (lg)",      track: "52×32px", thumb: "16×16px", travel: "28px", border: "2px (off only)" },
    { size: "M (default)", track: "39×24px", thumb: "16×16px", travel: "15px", border: "2px (off only)" },
    { size: "S (sm)",      track: "26×16px", thumb: "8×8px",   travel: "10px", border: "2px (off only)" },
  ],
  typography: [
    { element: "Label",       family: "Inter", size: "14px", weight: "Medium (500)",  lineHeight: "1.4", variable: "--field-text" },
    { element: "Description", family: "Inter", size: "12px", weight: "Regular (400)", lineHeight: "1.5", variable: "--field-supporting" },
  ],
  states: [
    { name: "Off · Enabled",   borderWidth: "2px", tokens: [{ role: "Track bg",   variable: "Surface/Neutral/Subtle",   varId: "", light: "rgba(242,242,242,1)", dark: "rgba(255,255,255,0.08)" }, { role: "Track border", variable: "Border/Neutral/Default", varId: "", light: "#5c5c5c", dark: "rgba(255,255,255,0.30)" }, { role: "Thumb", variable: "Text/Subtitle", varId: "", light: "#2a2a2a", dark: "rgba(255,255,255,0.60)" }] },
    { name: "On  · Enabled",   borderWidth: "0",   tokens: [{ role: "Track bg",   variable: "Border/Primary/Default",  varId: "", light: "#2173ff", dark: "#2b7fff" }, { role: "Thumb", variable: "Text/White", varId: "", light: "#ffffff", dark: "#ffffff" }] },
    { name: "Off · Disabled",  borderWidth: "2px", tokens: [{ role: "Track border", variable: "Border/Neutral/Lighter", varId: "", light: "#bababa", dark: "rgba(255,255,255,0.15)" }, { role: "Thumb", variable: "Text/Disabled", varId: "", light: "#bababa", dark: "rgba(255,255,255,0.20)" }] },
    { name: "On  · Disabled",  borderWidth: "0",   tokens: [{ role: "Track bg",   variable: "Primary/200",             varId: "", light: "#80afff", dark: "rgba(43,127,255,0.40)" }, { role: "Thumb", variable: "Text/White", varId: "", light: "#ffffff", dark: "#ffffff" }] },
  ],
}

const TABLE_SPEC = {
  name: "Table",
  figmaNodeId: "4687:5051",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4687-5051",
  description: "Data table for displaying structured information in rows and columns. Supports optional row selection with checkboxes, 2 sizes, hover and selected states.",
  properties: [
    { name: "columns",      type: "Array",    values: ["TableColumn<T>[]"],               default: "[]",      note: "key, header, width?, align?, render?(row,index)=>ReactNode" },
    { name: "data",         type: "Array",    values: ["T[]"],                            default: "[]" },
    { name: "size",         type: "Variant",  values: ["default (M)", "sm (S)"],          default: "default" },
    { name: "selectable",   type: "Boolean",  values: ["true", "false"],                  default: "false",   note: "Adds checkbox column + row click selection" },
    { name: "selectedRows", type: "Set",      values: ["Set<number>"],                    default: "new Set()", note: "Controlled — set of selected row indexes" },
    { name: "onRowSelect",  type: "Function", values: ["(index, checked) => void"],       default: "undefined" },
    { name: "onSelectAll",  type: "Function", values: ["(allChecked) => void"],           default: "undefined" },
  ],
  sizes: [
    { size: "M (default)", headerHeight: "48px", rowHeight: "60px", headerFont: "14px Semi Bold", cellFont: "14px Medium", paddingH: "8px", paddingV: "12px / 16px" },
    { size: "S (sm)",      headerHeight: "40px", rowHeight: "48px", headerFont: "12px Semi Bold", cellFont: "12px Medium", paddingH: "8px", paddingV: "8px / 12px" },
  ],
  typography: [
    { element: "Header text", family: "Inter", size: "14px (M) / 12px (S)", weight: "Semi Bold (600)", lineHeight: "1.4", variable: "--table-header-text" },
    { element: "Cell text",   family: "Inter", size: "14px (M) / 12px (S)", weight: "Medium (500)",    lineHeight: "1.4", variable: "--table-cell-text" },
  ],
  states: [
    { name: "Row default",   borderWidth: "1px", tokens: [{ role: "Row bg",    variable: "Surface/Neutral/White",        varId: "", light: "#ffffff",              dark: "rgba(255,255,255,0.10)" }] },
    { name: "Row hover",     borderWidth: "1px", tokens: [{ role: "Row bg",    variable: "Surface/Neutral/Default",     varId: "", light: "#f2f2f2",              dark: "rgba(255,255,255,0.08)" }] },
    { name: "Row selected",  borderWidth: "1px", tokens: [{ role: "Row bg",    variable: "Surface/Primary/More Subtle", varId: "", light: "rgba(246,249,255,1)",   dark: "rgba(43,127,255,0.08)"  }] },
    { name: "Header",        borderWidth: "1px", tokens: [{ role: "Header bg", variable: "Surface/Neutral/White",       varId: "", light: "#ffffff",              dark: "rgba(255,255,255,0.10)" }, { role: "Text", variable: "Text/Subtitle", varId: "", light: "#2a2a2a", dark: "rgba(255,255,255,0.6)" }] },
  ],
}

const TOPBAR_SPEC = {
  name: "Topbar",
  figmaNodeId: "8603:52598",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8603-52598",
  description: "Global navigation bar placed at the top of the app shell. 36px default, 34px tablet. Three fixed zones: left workspace selector, center search trigger, right actions + profile.",
  properties: [
    { name: "workspaceName",      type: "string",   values: ["any string"],              default: '"Product Name"',  note: "Displayed in left zone, truncates if too long" },
    { name: "workspaceAvatarSrc", type: "string",   values: ["image URL"],               default: "undefined",       note: "Falls back to initials + primary color" },
    { name: "onWorkspaceClick",   type: "Function", values: ["() => void"],              default: "undefined",       note: "Opens workspace/Left Menu dropdown" },
    { name: "searchPlaceholder",  type: "string",   values: ["any string"],              default: '"Search…"',       note: "Center zone trigger label" },
    { name: "onSearchFocus",      type: "Function", values: ["() => void"],              default: "undefined",       note: "Opens Global Search overlay (700×592px)" },
    { name: "actions",            type: "Array",    values: ["TopbarAction[]"],          default: "[]",              note: "Max 3 shown. { icon, label, badge?, onClick? }" },
    { name: "logo",               type: "ReactNode",values: ["any"],                     default: "4-dot placeholder",note: "Replace with actual isotipo/brand mark" },
    { name: "companyName",        type: "string",   values: ["any string"],              default: '"Company"',       note: "Shown in Sub-group B, truncates" },
    { name: "onCompanyClick",     type: "Function", values: ["() => void"],              default: "undefined",       note: "Opens company selector/Left Menu" },
    { name: "userName",           type: "string",   values: ["any string"],              default: '"User"',          note: "Profile avatar initials fallback" },
    { name: "onProfileClick",     type: "Function", values: ["() => void"],              default: "undefined",       note: "Opens user profile/Right Menu" },
    { name: "variant",            type: "Variant",  values: ["default", "tablet"],       default: '"default"',       note: "Tablet adds hamburger button; left zone → 172px" },
    { name: "onMenuClick",        type: "Function", values: ["() => void"],              default: "undefined",       note: "Tablet only — hamburger tap" },
  ],
  sizes: [
    { size: "Default", height: "36px", leftZone: "140×28px", centerZone: "250×24px", rightZone: "232×28px", padding: "t:4 r:8 b:0 l:8" },
    { size: "Tablet",  height: "34px", leftZone: "172×28px (+ hamburger)", centerZone: "250×24px", rightZone: "232×28px", padding: "t:4 r:8 b:2 l:8" },
  ],
  typography: [
    { element: "Workspace name", family: "Inter", size: "10px", weight: "Semi Bold (600)", lineHeight: "1", variable: "--topbar-text" },
    { element: "Company name",   family: "Inter", size: "10px", weight: "Regular (400)",   lineHeight: "1", variable: "--topbar-text-secondary" },
    { element: "Search label",   family: "Inter", size: "11px", weight: "Regular (400)",   lineHeight: "1", variable: "--topbar-text-secondary" },
  ],
  states: [
    {
      name: "TopbarButton — Default",
      borderWidth: "0",
      tokens: [
        { role: "Background",  variable: "—",                        varId: "", light: "transparent",         dark: "transparent" },
        { role: "Icon color",  variable: "Icon/Neutral/Dark",         varId: "", light: "rgba(92,92,92)",      dark: "rgba(255,255,255,0.70)" },
      ],
    },
    {
      name: "TopbarButton — Hover",
      borderWidth: "0",
      tokens: [
        { role: "Background", variable: "Surface/Neutral/Hover",     varId: "", light: "#fafafa",             dark: "rgba(255,255,255,0.08)" },
        { role: "Badge bg",   variable: "Error/Notification",         varId: "", light: "rgba(211,47,47)",     dark: "rgba(255,100,103)" },
      ],
    },
    {
      name: "Zone borders",
      borderWidth: "1px",
      tokens: [
        { role: "Workspace / Company border", variable: "Border/Primary/Subtle", varId: "", light: "rgba(233,241,255)", dark: "rgba(43,127,255,0.20)" },
        { role: "Vertical divider",           variable: "Border/Neutral/Subtle", varId: "", light: "rgba(242,242,242)", dark: "rgba(255,255,255,0.08)" },
        { role: "Bottom divider",             variable: "Border/Neutral/Subtle", varId: "", light: "rgba(242,242,242)", dark: "rgba(255,255,255,0.08)" },
      ],
    },
    {
      name: "Search field",
      borderWidth: "1px",
      tokens: [
        { role: "Background", variable: "Surface/Neutral/White",      varId: "", light: "#ffffff",             dark: "rgba(255,255,255,0.10)" },
        { role: "Border",     variable: "Border/Neutral/Lighter",      varId: "", light: "rgba(186,186,186)",   dark: "rgba(255,255,255,0.10)" },
        { role: "Placeholder",variable: "Text/Body",                   varId: "", light: "rgba(92,92,92)",      dark: "rgba(255,255,255,0.50)" },
      ],
    },
  ],
}

const INFORMATIVE_CARD_SPEC = {
  name: "Informational Card",
  figmaNodeId: "8057:1259",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8057-1259",
  description: "Horizontal notice surface combining icon + title + optional description + optional CTA pair. Uses --ic-* token family (separate from --hi-*). 5 semantic states × 3 sizes.",
  properties: [
    { name: "state",        type: "Variant", values: ["informative","alert","error","success","neutral"], default: '"informative"' },
    { name: "size",         type: "Variant", values: ["sm","md","lg"],                                   default: '"md"' },
    { name: "title",        type: "string",  values: ["any string"],  default: "required",  note: "Primary message text — 14px semibold" },
    { name: "description",  type: "string",  values: ["any string"],  default: "undefined", note: "Optional secondary line below title — 14px medium" },
    { name: "cta",          type: "object",  values: ["{ label, onClick? }"], default: "undefined", note: "Primary action button (Button primary sm), right-aligned" },
    { name: "ctaSecondary", type: "object",  values: ["{ label, onClick? }"], default: "undefined", note: "Secondary action button (Button secondary sm), left of primary" },
    { name: "icon",         type: "ReactNode", values: ["any"],        default: "undefined", note: "Overrides default state icon" },
    { name: "className",    type: "string",  values: ["any string"],   default: "undefined" },
  ],
  sizes: [
    { size: "S", padding: "8px",  height: "auto", notes: "Compact inline use" },
    { size: "M", padding: "16px", height: "auto", notes: "Default — modal dialog, forms" },
    { size: "L", padding: "24px", height: "auto", notes: "Expanded surface, standalone sections" },
  ],
  typography: [
    { element: "Title",       family: "Inter", size: "14px", weight: "Semi Bold (600)", lineHeight: "1.2", variable: "--ic-{state}-text" },
    { element: "Description", family: "Inter", size: "14px", weight: "Medium (500)",    lineHeight: "1.4", variable: "--ic-{state}-text" },
  ],
  states: [
    { name: "Informative", borderWidth: "0", tokens: [
      { role: "Background", variable: "Surface/Primary/Subtle",  varId: "", light: "#E9F1FF",              dark: "rgba(33,115,255,0.12)"  },
      { role: "Icon",       variable: "Icon/Primary/Default",    varId: "", light: "#2173FF",              dark: "#A8C8FF"                },
      { role: "Text",       variable: "Text/Info",               varId: "", light: "#001740",              dark: "#A8C8FF"                },
    ]},
    { name: "Alert", borderWidth: "0", tokens: [
      { role: "Background", variable: "Surface/Warning/Subtle",  varId: "", light: "#FFF4E5",              dark: "rgba(237,108,2,0.12)"   },
      { role: "Icon",       variable: "Icon/Alert/Default",      varId: "", light: "#ED6C02",              dark: "#FFC070"                },
      { role: "Text",       variable: "Text/Alert",              varId: "", light: "#663C00",              dark: "#fcd34d"                },
    ]},
    { name: "Error", borderWidth: "0", tokens: [
      { role: "Background", variable: "Surface/Error/Subtle",    varId: "", light: "#FDEDED",              dark: "rgba(220,38,38,0.12)"   },
      { role: "Icon",       variable: "Icon/Error/Default",      varId: "", light: "#992222",              dark: "#FF9898"                },
      { role: "Text",       variable: "Text/Error",              varId: "", light: "#5F2120",              dark: "#ff6467"                },
    ]},
    { name: "Success", borderWidth: "0", tokens: [
      { role: "Background", variable: "Surface/Success/Subtle",  varId: "", light: "#E5FDF8",              dark: "rgba(0,169,127,0.12)"   },
      { role: "Icon",       variable: "Icon/Success/Default",    varId: "", light: "#00A07E",              dark: "#70EDD8"                },
      { role: "Text",       variable: "Text/Success",            varId: "", light: "#003328",              dark: "#70EDD8"                },
    ]},
    { name: "Neutral", borderWidth: "0", tokens: [
      { role: "Background", variable: "Surface/Neutral/Default", varId: "", light: "#F2F2F2",              dark: "rgba(255,255,255,0.08)" },
      { role: "Icon",       variable: "Icon/Neutral/Dark",       varId: "", light: "#2A2A2A",              dark: "rgba(255,255,255,0.70)" },
      { role: "Text",       variable: "Text/Primary",            varId: "", light: "#2A2A2A",              dark: "rgba(255,255,255,0.70)" },
    ]},
  ],
}

const FILTERS_SPEC = {
  name: "Filters",
  figmaNodeId: "7996:4655",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=7996-4655",
  description: "Horizontal 40px filter bar for narrowing large datasets. 8 state variants, up to 5 filter chips, sorting control, grid/list view toggle. Chip label truncated at 14 characters with tooltip on hover. Token family --fi-*.",
  properties: [
    { name: "compact",          type: "Boolean",  values: ["true","false"],                              default: "false",      note: "S Variant — shows only Search + All Filters button" },
    { name: "compactCount",     type: "number",   values: ["0","1","2+"],                                default: "0",          note: "> 0 → S Variant Filters Apply: shows Filters badge with count" },
    { name: "showSearch",       type: "Boolean",  values: ["true","false"],                              default: "true",       note: "Renders the 140px search input on the left" },
    { name: "searchPlaceholder",type: "string",   values: ["any string"],                                default: '"Search"' },
    { name: "slots",            type: "FilterSlot[]", values: ["{ placeholder, value?, onRemove?, onOpen? }[]"], default: "[]", note: "Up to 5 filter chips. value set → active chip with × dismiss" },
    { name: "showClearFilters", type: "Boolean",  values: ["true","false"],                              default: "false",      note: "Shows 'Clear Filters' text link after the chips" },
    { name: "onClearFilters",   type: "function", values: ["() => void"],                                default: "undefined" },
    { name: "showAllFilters",   type: "Boolean",  values: ["true","false"],                              default: "true",       note: "Shows 'All filters' pill button in the right controls" },
    { name: "showSort",         type: "Boolean",  values: ["true","false"],                              default: "true",       note: "Sort direction arrow + sort label dropdown" },
    { name: "sortLabel",        type: "string",   values: ["any string"],                                default: '"Name"' },
    { name: "showViewToggle",   type: "Boolean",  values: ["true","false"],                              default: "true",       note: "Grid/List icon toggle buttons" },
    { name: "viewMode",         type: "Variant",  values: ["grid","list"],                               default: '"grid"' },
    { name: "onViewModeChange", type: "function", values: ["(mode: 'grid' | 'list') => void"],           default: "undefined" },
    { name: "className",        type: "string",   values: ["any string"],                                default: "undefined" },
  ],
  sizes: [
    { size: "Fixed", height: "40px", layout: "flex row, full-width", notes: "Height is always 40px; width fills the container" },
  ],
  typography: [
    { element: "Chip label",    family: "Inter", size: "13px", weight: "Medium (500)",    lineHeight: "1", variable: "--fi-chip-text / --fi-chip-active-text" },
    { element: "Clear Filters", family: "Inter", size: "13px", weight: "Medium (500)",    lineHeight: "1", variable: "--fi-clear-text" },
    { element: "Sort label",    family: "Inter", size: "13px", weight: "Medium (500)",    lineHeight: "1", variable: "--fi-sort-text" },
  ],
  states: [
    { name: "Default chip (inactive)", borderWidth: "1px", tokens: [
      { role: "Background", variable: "Surface/Neutral/Subtle",  varId: "", light: "rgba(250,250,250,1)",     dark: "rgba(255,255,255,0.05)" },
      { role: "Border",     variable: "Border/Neutral/Lighter",  varId: "", light: "rgba(186,186,186,1)",     dark: "rgba(255,255,255,0.15)" },
      { role: "Text",       variable: "Text/Subtitle",           varId: "", light: "#2a2a2a",                 dark: "rgba(255,255,255,0.70)" },
      { role: "Icon",       variable: "Icon/Neutral",            varId: "", light: "rgba(0,0,0,0.40)",        dark: "rgba(255,255,255,0.40)" },
    ]},
    { name: "Active chip (selected value)", borderWidth: "1px", tokens: [
      { role: "Background", variable: "Surface/Primary/Subtle",  varId: "", light: "rgba(33,115,255,0.06)",   dark: "rgba(43,127,255,0.08)" },
      { role: "Border",     variable: "Border/Primary/Default",  varId: "", light: "#2173ff",                 dark: "#2b7fff" },
      { role: "Text",       variable: "Text/Info",               varId: "", light: "#2173ff",                 dark: "#A8C8FF" },
      { role: "Icon (×)",   variable: "Icon/Primary/Darker",     varId: "", light: "#2173ff",                 dark: "rgba(168,200,255,0.80)" },
    ]},
  ],
}

const MODAL_DIALOG_SPEC = {
  name: "Modal Dialog",
  figmaNodeId: "13753:29038",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=13753-29038",
  description: "Focused overlay for confirmations and structured content. Fixed scrim + blur backdrop. Two layout variants × 5 semantic tones × independent icon and card state overrides.",
  properties: [
    { name: "variant",       type: "Variant", values: ["confirmation","content"],                           default: '"confirmation"', note: "Confirmation = centered column; Content = left-aligned row" },
    { name: "tone",          type: "Variant", values: ["default","warning","error","alert","success"],      default: '"default"',      note: "Sets iconVariant + infoCardState together; both can be overridden" },
    { name: "showIcon",      type: "Boolean", values: ["true","false"],                                     default: "true" },
    { name: "iconName",      type: "string",  values: ["Lucide icon name"],                                 default: '"Info"',        note: "Any Lucide icon name — e.g. Sparkles, Trash2, Shield" },
    { name: "iconVariant",   type: "Variant", values: ["informative","success","alert","error","neutral","yellow","lime","purple","light-blue"], default: "from tone", note: "Overrides tone for the HighlightIcon" },
    { name: "title",         type: "string",  values: ["any string"],                                       default: "undefined" },
    { name: "description",   type: "string",  values: ["any string"],                                       default: "undefined" },
    { name: "slot",          type: "ReactNode",values: ["any"],                                             default: "undefined",     note: "Custom content rendered in rounded slot container" },
    { name: "informativeCard",type: "string|boolean", values: ["string","true","false"],                   default: "undefined",     note: "true = default text; string = custom title for InformativeCard" },
    { name: "infoCardState", type: "Variant", values: ["informative","alert","error","success","neutral"], default: "from tone",     note: "Overrides tone for the InformativeCard" },
    { name: "ctaPrimary",    type: "object",  values: ["{ label, destructive?, onClick? }"],               default: "undefined" },
    { name: "ctaSecondary",  type: "object",  values: ["{ label, onClick? }"],                             default: "undefined" },
    { name: "showClose",     type: "Boolean", values: ["true","false"],                                     default: "true" },
    { name: "embedded",      type: "Boolean", values: ["true","false"],                                     default: "false",         note: "Renders inline without overlay — used in docs previews" },
  ],
  sizes: [
    { variant: "Confirmation", maxWidth: "900px", padding: "24px", layout: "flex-col centered",        notes: "Icon + title + desc centered; CTAs centered" },
    { variant: "Content",      maxWidth: "900px", padding: "32px", layout: "flex-col left-aligned",    notes: "Icon + title inline row; CTAs right-aligned" },
  ],
  typography: [
    { element: "Title",       family: "Inter", size: "20px", weight: "Semi Bold (600)", lineHeight: "1.2", variable: "--foreground"     },
    { element: "Description", family: "Inter", size: "14px", weight: "Regular (400)",   lineHeight: "1.6", variable: "--field-supporting" },
  ],
  variants: [
    { name: "Confirmation", description: "max-w-[900px] · p-[24px] · centered column layout", cssPrefix: "--modal", tokens: [
      { role: "Surface",     variable: "Surface/Modal",         varId: "", light: "rgba(255,255,255,0.96)", dark: "rgba(18,20,30,0.96)" },
      { role: "Border",      variable: "Border/Modal",          varId: "", light: "#BABABA",                dark: "rgba(255,255,255,0.15)" },
      { role: "Scrim",       variable: "Overlay/Scrim",         varId: "", light: "rgba(0,0,0,0.40)",       dark: "rgba(0,0,0,0.60)" },
      { role: "Slot bg",     variable: "Surface/Modal/Slot",    varId: "", light: "#F5F6FA",                dark: "rgba(255,255,255,0.05)" },
      { role: "Close icon",  variable: "Icon/Neutral/Default",  varId: "", light: "#5C5C5C",                dark: "rgba(255,255,255,0.50)" },
    ]},
    { name: "Content", description: "max-w-[900px] · p-[32px] · left-aligned row layout", cssPrefix: "--modal", tokens: [
      { role: "Surface",     variable: "Surface/Modal",         varId: "", light: "rgba(255,255,255,0.96)", dark: "rgba(18,20,30,0.96)" },
      { role: "Border",      variable: "Border/Modal",          varId: "", light: "#BABABA",                dark: "rgba(255,255,255,0.15)" },
    ]},
  ],
}

const SIDEBAR_SPEC = {
  name: "Sidebar",
  figmaNodeId: "8572:42410",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8572-42410",
  description: "Vertical navigation rail. Always renders on a dark background regardless of mode. Expanded (250px) shows icon + label; Collapsed (56px) shows icon-only with tooltips.",
  properties: [
    { name: "items",       type: "Array",   values: ["SidebarItem[]"],       default: "required",  note: "{ id, label, icon: Lucide name, badge? }" },
    { name: "activeId",    type: "string",  values: ["any item id"],         default: "undefined", note: "Highlights the active nav item with gradient + glow" },
    { name: "onSelect",    type: "Function",values: ["(id: string) => void"],default: "undefined" },
    { name: "collapsed",   type: "Boolean", values: ["true","false"],        default: "false",     note: "Collapsed = 56px icon-only rail" },
    { name: "onCollapse",  type: "Function",values: ["() => void"],          default: "undefined", note: "Toggle callback for the collapse chevron button" },
    { name: "className",   type: "string",  values: ["any string"],          default: "undefined" },
  ],
  sizes: [
    { state: "Expanded",  width: "250px", iconSize: "24×24px", labelSize: "13px", gap: "4px",  notes: "Icon + text label, always dark bg" },
    { state: "Collapsed", width: "56px",  iconSize: "24×24px", labelSize: "—",    gap: "—",    notes: "Icon only, tooltip on hover" },
  ],
  typography: [
    { element: "Nav label",    family: "Inter", size: "13px", weight: "Medium (500)",    lineHeight: "1",   variable: "--sb-text" },
    { element: "Section label",family: "Inter", size: "10px", weight: "Semi Bold (600)", lineHeight: "1",   variable: "--sb-section-text" },
    { element: "Badge count",  family: "Inter", size: "10px", weight: "Semi Bold (600)", lineHeight: "1",   variable: "white" },
  ],
  states: [
    { name: "Default", borderWidth: "0", tokens: [
      { role: "Background",  variable: "Surface/Neutral/Black", varId: "", light: "#1A1A1A",              dark: "#1A1A1A" },
      { role: "Icon",        variable: "Icon/Primary/Lighter",  varId: "", light: "rgba(128,175,255,1)",  dark: "rgba(128,175,255,1)" },
      { role: "Label",       variable: "Text/Primary",          varId: "", light: "rgba(255,255,255,0.70)",dark: "rgba(255,255,255,0.70)" },
    ]},
    { name: "Hover", borderWidth: "0", tokens: [
      { role: "Icon bg",     variable: "Surface/Neutral/Black", varId: "", light: "var(--sb-bg)",         dark: "var(--sb-bg)" },
      { role: "Icon",        variable: "Icon/Neutral/Light",    varId: "", light: "rgba(255,255,255,0.70)",dark: "rgba(255,255,255,0.70)" },
      { role: "Glow shadow", variable: "—",                     varId: "", light: "rgba(33,115,255,0.50) blur:20", dark: "rgba(33,115,255,0.50) blur:20" },
    ]},
    { name: "Active", borderWidth: "0", tokens: [
      { role: "Icon bg",     variable: "Gradient/Main Action",  varId: "", light: "radial-gradient(circle at 61% 68%, #2173FF 29%, #09E2AB 61%)", dark: "radial-gradient(circle at 61% 68%, #2173FF 29%, #09E2AB 61%)" },
      { role: "Icon",        variable: "Text/White",            varId: "", light: "#ffffff",              dark: "#ffffff" },
      { role: "Teal shadow", variable: "—",                     varId: "", light: "rgba(82,163,255,0.38) offset(8,8) blur:20", dark: "rgba(82,163,255,0.38) offset(8,8) blur:20" },
    ]},
  ],
}

const ENTITY_LIST_SPEC = {
  name: "Entity List",
  figmaNodeId: "—",
  figmaUrl: "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS",
  description: "High-density list row for entities — conversations, tickets, tasks. Composes icon highlight or avatar, primary meta, AI insight, description, secondary meta, tags, actions, and state tag.",
  properties: [
    { name: "items",           type: "Array",   values: ["EntityListItemData[]"],         default: "required" },
    { name: "title",           type: "string",  values: ["any string"],                   default: "required",  note: "Primary label — 16px semibold" },
    { name: "iconVariant",     type: "Variant", values: ["yellow","success","error","info","neutral","purple","light-blue"], default: "undefined", note: "HighlightIcon container color" },
    { name: "iconName",        type: "string",  values: ["Lucide icon name"],             default: "undefined" },
    { name: "avatarName",      type: "string",  values: ["any string"],                   default: "undefined", note: "Derives 2-letter initials; shown if no icon" },
    { name: "primaryMeta",     type: "Array",   values: ["ELMetaItem[]"],                 default: "undefined", note: "{ iconName?, label?, tooltip?, tag? }" },
    { name: "secondaryMeta",   type: "Array",   values: ["ELMetaItem[]"],                 default: "undefined", note: "Bottom-left row of icon+label pairs" },
    { name: "description",     type: "string",  values: ["any string"],                   default: "undefined", note: "Collapsible body text" },
    { name: "aiInsight",       type: "object",  values: ["{ action, detail, showLabel?, viewMore? }"], default: "undefined", note: "Purple AI callout with Sparkle icon" },
    { name: "tags",            type: "Array",   values: ["{ label }[]"],                  default: "undefined" },
    { name: "actions",         type: "Array",   values: ["ELAction[]"],                   default: "undefined", note: "{ label, variant: primary|secondary|tertiary }" },
    { name: "state",           type: "object",  values: ["{ label, variant }"],           default: "undefined", note: "Semantic Tag shown right-side" },
    { name: "timestamp",       type: "string",  values: ["any string"],                   default: "undefined" },
    { name: "pinned",          type: "Boolean", values: ["true","false"],                 default: "false",     note: "Red Pin tag next to primary meta" },
    { name: "showMenu",        type: "Boolean", values: ["true","false"],                 default: "false",     note: "3-dot kebab menu at far right" },
    { name: "showCheckbox",    type: "Boolean", values: ["true","false"],                 default: "false",     note: "Leading checkbox for multi-select" },
  ],
  sizes: [
    { density: "Default", minHeight: "72px",  padding: "t:12 r:16 b:12 l:16", notes: "With description expanded" },
    { density: "Compact", minHeight: "48px",  padding: "t:8 r:16 b:8 l:16",   notes: "Title + meta only, no description" },
  ],
  typography: [
    { element: "Title",       family: "Inter", size: "16px", weight: "Semi Bold (600)", lineHeight: "1.2" },
    { element: "Description", family: "Inter", size: "13px", weight: "Regular (400)",   lineHeight: "1.5" },
    { element: "Meta label",  family: "Inter", size: "12px", weight: "Regular (400)",   lineHeight: "1"   },
    { element: "AI insight",  family: "Inter", size: "12px", weight: "Medium (500)",    lineHeight: "1.4" },
  ],
  states: [
    { name: "Default",  borderWidth: "1px", tokens: [
      { role: "Background", variable: "Surface/Neutral/White",   varId: "", light: "#ffffff",              dark: "rgba(255,255,255,0.04)" },
      { role: "Border",     variable: "Border/Neutral/Lighter",  varId: "", light: "rgba(186,186,186,1)",  dark: "rgba(255,255,255,0.08)" },
    ]},
    { name: "Hover", borderWidth: "1px", tokens: [
      { role: "Background", variable: "Surface/Neutral/Default", varId: "", light: "#F8F8F8",              dark: "rgba(255,255,255,0.07)" },
    ]},
    { name: "AI callout", borderWidth: "1px", tokens: [
      { role: "Background", variable: "Surface/AI/Subtle",       varId: "", light: "rgba(103,76,186,0.06)",dark: "rgba(103,76,186,0.12)" },
      { role: "Icon",       variable: "Icon/AI/Default",         varId: "", light: "#674CBC",              dark: "#A78BFA" },
    ]},
  ],
}

// ── Spec types ─────────────────────────────────────────────────────────────

type SpecToken = { role: string; variable: string; varId?: string; light: string; dark: string }

type AnySpec = {
  name: string
  figmaNodeId: string
  figmaUrl: string
  description: string
  properties: { name: string; type: string; values: string[]; default: string; note?: string }[]
  sizes: Record<string, string>[]
  typography: { element: string; family: string; size: string; weight: string; lineHeight: string; variable?: string }[]
  states?: { name: string; borderWidth: string; tokens: SpecToken[] }[]
  variants?: { name: string; description: string; cssPrefix: string; tokens: SpecToken[] }[]
}

// Keep old alias for any remaining references
type SpecData = AnySpec

function ColorSwatch({ hex, mode }: { hex: string; mode?: "light" | "dark" }) {
  if (!hex || hex.startsWith("var(")) return <span className="text-[11px] text-[var(--field-supporting)] italic">dynamic</span>
  return (
    <span className="inline-flex items-center gap-[5px]">
      <span
        className={`inline-flex items-center justify-center w-[16px] h-[16px] rounded-[3px] shrink-0 ${mode === "dark" ? "bg-[#1a1a1a]" : "bg-white border border-black/10"}`}
      >
        <span className="inline-block w-[10px] h-[10px] rounded-[2px]" style={{ background: hex }} />
      </span>
      <span className="text-[11px] font-mono text-[var(--field-text)]">{hex}</span>
    </span>
  )
}

// ── Tab bar ────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex border-b border-[var(--field-border)]">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={[
            "px-[16px] pb-[10px] pt-[2px] text-[13px] font-medium transition-colors shrink-0 border-b-2 -mb-px",
            active === t.id
              ? "border-[#2173ff] text-[#2173ff]"
              : "border-transparent text-[var(--field-supporting)] hover:text-[var(--foreground)]",
          ].join(" ")}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Unified Spec Panel ─────────────────────────────────────────────────────

function getSpec(id: NonNullable<SpecModal>): AnySpec {
  if (id === "button")           return BUTTON_SPEC           as AnySpec
  if (id === "input")            return INPUT_SPEC            as AnySpec
  if (id === "textarea")         return TEXTAREA_SPEC         as AnySpec
  if (id === "tag")              return TAG_SPEC              as AnySpec
  if (id === "menu-item")        return MENU_SPEC             as AnySpec
  if (id === "highlight-icon")   return HIGHLIGHT_ICON_SPEC   as AnySpec
  if (id === "select")           return SELECT_SPEC           as AnySpec
  if (id === "checkbox")         return CHECKBOX_SPEC         as AnySpec
  if (id === "toggle")           return TOGGLE_SPEC           as AnySpec
  if (id === "table")            return TABLE_SPEC            as AnySpec
  if (id === "topbar")           return TOPBAR_SPEC           as AnySpec
  if (id === "sidebar")          return SIDEBAR_SPEC          as AnySpec
  if (id === "entity-list")      return ENTITY_LIST_SPEC      as AnySpec
  if (id === "modal-dialog")     return MODAL_DIALOG_SPEC     as AnySpec
  if (id === "informative-card") return INFORMATIVE_CARD_SPEC as AnySpec
  if (id === "filters")          return FILTERS_SPEC          as AnySpec
  return CARD_SPEC as AnySpec
}

function SpecPanel({ spec, onClose }: { spec: AnySpec; onClose: () => void }) {
  const hasTypography = spec.typography.length > 0
  const [tab, setTab] = useState<"props" | "tokens" | "sizes" | "typography">("props")

  const specTabs: { id: "props" | "tokens" | "sizes" | "typography"; label: string }[] = [
    { id: "props",  label: "Properties" },
    { id: "tokens", label: "Tokens" },
    { id: "sizes",  label: "Dimensions" },
    ...(hasTypography ? [{ id: "typography" as const, label: "Typography" }] : []),
  ]

  const tokenGroups = spec.states
    ? spec.states.map(s  => ({ name: s.name, meta: `border: ${s.borderWidth}`, tokens: s.tokens }))
    : (spec.variants ?? []).map(v => ({ name: v.name, meta: v.description,   tokens: v.tokens }))

  const glassStyle: React.CSSProperties = {
    background: "rgba(8,10,20,0.92)",
    backdropFilter: "blur(24px) saturate(160%)",
    WebkitBackdropFilter: "blur(24px) saturate(160%)",
    borderLeft: "1px solid rgba(255,255,255,0.07)",
  }

  const rowBg = (i: number): React.CSSProperties =>
    i % 2 === 1 ? { background: "rgba(255,255,255,0.025)" } : {}

  const dividerStyle: React.CSSProperties = { borderColor: "rgba(255,255,255,0.07)" }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-[700px] flex flex-col shadow-2xl" style={glassStyle}>

        {/* Header */}
        <div className="shrink-0 px-[24px] pt-[20px] pb-0 flex items-start justify-between gap-[12px]">
          <div>
            <div className="flex items-center gap-[8px] flex-wrap">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">{spec.name}</h2>
              <a href={spec.figmaUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-[4px] text-[11px] text-[#2173ff] hover:underline">
                Figma <ExternalIcon />
              </a>
            </div>
            <p className="text-[12px] text-[var(--field-supporting)] mt-[4px] max-w-[520px] leading-[1.6]">{spec.description}</p>
            <p className="text-[10px] font-mono mt-[3px] opacity-30 text-[var(--field-supporting)]">node: {spec.figmaNodeId}</p>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-md text-[var(--field-supporting)] hover:bg-white/[0.06] transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 flex mt-[16px] px-[24px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {specTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                "px-[14px] pb-[10px] pt-[2px] text-[12px] font-medium transition-colors border-b-2 -mb-px",
                tab === t.id
                  ? "border-[#2173ff] text-[#2173ff]"
                  : "border-transparent text-[var(--field-supporting)] hover:text-[var(--foreground)]",
              ].join(" ")}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">

          {/* Properties */}
          {tab === "props" && (
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.05)", ...dividerStyle, borderBottomWidth: 1, borderBottomStyle: "solid" }}>
                    <th className="text-left px-[12px] py-[8px] font-semibold text-[var(--field-label)] w-[130px]">Property</th>
                    <th className="text-left px-[12px] py-[8px] font-semibold text-[var(--field-label)] w-[72px]">Type</th>
                    <th className="text-left px-[12px] py-[8px] font-semibold text-[var(--field-label)]">Values</th>
                    <th className="text-left px-[12px] py-[8px] font-semibold text-[var(--field-label)] w-[68px]">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {spec.properties.map((p, i) => (
                    <tr key={p.name} style={rowBg(i)}>
                      <td className="px-[12px] py-[8px] font-medium text-[var(--foreground)]">{p.name}</td>
                      <td className="px-[12px] py-[8px]">
                        <span className={`text-[10px] font-semibold px-[5px] py-[2px] rounded ${p.type === "Variant" ? "bg-[#2173ff1a] text-[#2173ff]" : "bg-[#00a07e1a] text-[#00a07e]"}`}>{p.type}</span>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <div className="flex flex-wrap gap-[4px]">
                          {p.values.map(v => (
                            <span key={v} className={`text-[10px] px-[5px] py-[1px] rounded ${v === p.default ? "font-semibold text-[var(--foreground)]" : "text-[var(--field-supporting)]"}`}
                              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>{v}</span>
                          ))}
                        </div>
                        {p.note && <p className="text-[10px] text-[var(--field-supporting)] opacity-70 mt-[3px] italic">{p.note}</p>}
                      </td>
                      <td className="px-[12px] py-[8px] font-mono text-[10px] text-[var(--field-label)]">{p.default}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Dimensions */}
          {tab === "sizes" && (
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.05)", ...dividerStyle, borderBottomWidth: 1, borderBottomStyle: "solid" }}>
                    {Object.keys(spec.sizes[0]).map(k => (
                      <th key={k} className="text-left px-[12px] py-[8px] font-semibold text-[var(--field-label)] capitalize">{k.replace(/([A-Z])/g, " $1")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spec.sizes.map((s, i) => (
                    <tr key={i} style={rowBg(i)}>
                      {Object.values(s).map((v, j) => (
                        <td key={j} className="px-[12px] py-[8px] font-mono text-[11px] text-[var(--foreground)]">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Typography */}
          {tab === "typography" && spec.typography.length > 0 && (
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.05)", ...dividerStyle, borderBottomWidth: 1, borderBottomStyle: "solid" }}>
                    {["Element","Family","Size","Weight","Line-height"].map(h => (
                      <th key={h} className="text-left px-[12px] py-[8px] font-semibold text-[var(--field-label)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spec.typography.map((t, i) => (
                    <tr key={t.element} style={rowBg(i)}>
                      <td className="px-[12px] py-[8px] font-medium text-[var(--foreground)]">{t.element}</td>
                      <td className="px-[12px] py-[8px] font-mono text-[11px] text-[var(--field-supporting)]">{t.family}</td>
                      <td className="px-[12px] py-[8px] font-mono text-[11px] text-[var(--foreground)]">{t.size}</td>
                      <td className="px-[12px] py-[8px] text-[11px] text-[var(--field-supporting)]">{t.weight}</td>
                      <td className="px-[12px] py-[8px] font-mono text-[11px] text-[var(--field-supporting)]">{t.lineHeight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tokens */}
          {tab === "tokens" && (
            <div className="flex flex-col gap-[12px]">
              {tokenGroups.map(g => (
                <div key={g.name} className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="px-[12px] py-[7px] flex items-center gap-[8px] flex-wrap"
                    style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-[12px] font-semibold text-[var(--foreground)]">{g.name}</span>
                    <span className="text-[10px] font-mono text-[var(--field-supporting)] opacity-60">{g.meta}</span>
                  </div>
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <th className="text-left px-[12px] py-[6px] font-semibold text-[var(--field-label)] w-[120px]">Role</th>
                        <th className="text-left px-[12px] py-[6px] font-semibold text-[var(--field-label)]">Variable</th>
                        <th className="text-left px-[12px] py-[6px] font-semibold text-[var(--field-label)] w-[150px]">Light</th>
                        <th className="text-left px-[12px] py-[6px] font-semibold text-[var(--field-label)] w-[150px]">Dark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.tokens.map((t, i) => (
                        <tr key={t.role + i} style={rowBg(i)}>
                          <td className="px-[12px] py-[7px] text-[var(--foreground)]">{t.role}</td>
                          <td className="px-[12px] py-[7px]">
                            <span className="text-[10px] font-mono text-[var(--field-supporting)]">{t.variable}</span>
                            {t.varId && <span className="text-[9px] text-[var(--field-supporting)] opacity-40 ml-[4px]">#{t.varId}</span>}
                          </td>
                          <td className="px-[12px] py-[7px]"><ColorSwatch hex={t.light} mode="light" /></td>
                          <td className="px-[12px] py-[7px]"><ColorSwatch hex={t.dark}  mode="dark"  /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Spec Panel shortcuts (delegate to SpecPanel above) ────────────────────

// SpecModal kept as thin alias used by some component pages
function SpecModal({ spec, onClose }: { spec: SpecData; onClose: () => void }) {
  return <SpecPanel spec={spec} onClose={onClose} />
}

// ── Playground controls ────────────────────────────────────────────────────

function CtrlGroup<T extends string>({ label, options, value, onChange }: {
  label: string; options: { label: string; value: T }[]; value: T; onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-[12px] flex-wrap">
      <span className="text-[11px] font-semibold uppercase tracking-widest w-[110px] shrink-0 text-[var(--field-supporting)]">{label}</span>
      <div className="flex gap-[4px] flex-wrap">
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={["px-[10px] py-[5px] rounded text-[11px] font-medium transition-colors",
              value === o.value ? "bg-[#2173ff] text-white" : "bg-[var(--field-bg)] border border-[var(--field-border)] text-[var(--field-label)] hover:border-[var(--field-border-hover)]",
            ].join(" ")}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CtrlToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return <CtrlGroup label={label} options={[{ label: "On", value: "on" }, { label: "Off", value: "off" }] as { label: string; value: "on" | "off" }[]} value={value ? "on" : "off"} onChange={v => onChange(v === "on")} />
}

// ── Shared UI atoms ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--field-supporting)]">{children}</p>
}

function Divider() {
  return <div className="w-full h-px bg-[var(--field-border)] opacity-60" />
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-wrap items-start gap-[12px]">{children}</div>
    </div>
  )
}

function UsageCard({ name, color, use, avoid }: { name: string; color: string; use: string[]; avoid: string[] }) {
  return (
    <div className="rounded-md border border-[var(--field-border)] overflow-hidden">
      <div className="h-[4px]" style={{ background: color.startsWith("linear") ? color : color.startsWith("var") ? "var(--field-border)" : color }} />
      <div className="p-[16px] flex flex-col gap-[12px]">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">{name}</p>
        <div className="flex flex-col gap-[6px]">
          <p className="text-[10px] font-semibold text-[#00a07e] uppercase tracking-widest">Use when</p>
          <ul className="flex flex-col gap-[4px]">
            {use.map((t, i) => (
              <li key={i} className="text-[12px] text-[var(--field-supporting)] flex gap-[6px]">
                <span className="text-[#00a07e] shrink-0 mt-[1px]">✓</span>{t}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="text-[10px] font-semibold text-[#d32f2f] uppercase tracking-widest">Don't use when</p>
          <ul className="flex flex-col gap-[4px]">
            {avoid.map((t, i) => (
              <li key={i} className="text-[12px] text-[var(--field-supporting)] flex gap-[6px]">
                <span className="text-[#d32f2f] shrink-0 mt-[1px]">✗</span>{t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ── Spec trigger button ────────────────────────────────────────────────────

function SpecButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-[5px] text-[11px] font-medium whitespace-nowrap text-[var(--field-supporting)] border border-[var(--field-border)] px-[8px] py-[4px] rounded hover:border-[var(--field-border-hover)] hover:text-[var(--foreground)] transition-colors shrink-0"
    >
      <SpecIcon /> View DS spec
    </button>
  )
}

// ── Home Page ──────────────────────────────────────────────────────────────

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[3px] text-[#2173ff] hover:underline underline-offset-2 break-all"
    >
      {children}
      <ExternalIcon />
    </a>
  )
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[12px]">
      <h2 className="text-[18px] font-semibold text-[var(--foreground)]">{title}</h2>
      {children}
    </section>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] leading-[1.65] text-[var(--field-supporting)]">{children}</p>
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-[3px] border-[#2173ff] bg-[#2173ff0d] px-[16px] py-[12px] rounded-r-md">
      <p className="text-[14px] leading-[1.65] text-[var(--foreground)]">{children}</p>
    </div>
  )
}

function NumberedStep({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-[14px]">
      <div className="shrink-0 w-[28px] h-[28px] rounded-full bg-[#2173ff] flex items-center justify-center text-[12px] font-bold text-white mt-[1px]">
        {n}
      </div>
      <div className="flex flex-col gap-[4px] pt-[4px]">
        <p className="text-[14px] font-semibold text-[var(--foreground)]">{title}</p>
        <p className="text-[13px] leading-[1.6] text-[var(--field-supporting)]">{children}</p>
      </div>
    </div>
  )
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-[6px] pl-[4px]">
      {items.map((item, i) => (
        <li key={i} className="flex gap-[8px] text-[14px] leading-[1.6] text-[var(--field-supporting)]">
          <span className="text-[#2173ff] shrink-0 mt-[2px] font-bold">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ComparisonTable() {
  const rows = [
    {
      aspect: "What the AI receives",
      dsOnly:  "A visual description to reinterpret",
      repo:    "Real code components to reuse",
    },
    {
      aspect: "Typical result",
      dsOnly:  "Rebuilds every element → ~80% and drifts",
      repo:    "Inserts the exact component → faithful",
    },
    {
      aspect: "Consistency across prototypes",
      dsOnly:  "Low — each generation varies",
      repo:    "High — the same piece every time",
    },
    {
      aspect: "Tokens (color, spacing, radius)",
      dsOnly:  "May approximate values",
      repo:    "Uses official token values",
    },
    {
      aspect: "Maintenance",
      dsOnly:  "Every change gets reinterpreted",
      repo:    "One change propagates to all prototypes",
    },
    {
      aspect: "Designer role",
      dsOnly:  "Rebuilding screens (bottleneck)",
      repo:    "Curating the library and reviewing the minimum",
    },
  ]
  return (
    <div className="rounded-md border border-[var(--field-border)] overflow-hidden text-[13px]">
      <div className="grid grid-cols-[1fr_1fr_1fr] bg-[var(--field-bg)] border-b border-[var(--field-border)]">
        <div className="px-[14px] py-[9px] font-semibold text-[var(--field-label)]">Aspect</div>
        <div className="px-[14px] py-[9px] font-semibold text-[#d32f2f] border-l border-[var(--field-border)]">Design System only (Figma)</div>
        <div className="px-[14px] py-[9px] font-semibold text-[#00a07e] border-l border-[var(--field-border)]">Repository + component library</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className={`grid grid-cols-[1fr_1fr_1fr] border-b border-[var(--field-border)] last:border-b-0 ${i % 2 === 1 ? "bg-[var(--field-bg)]" : ""}`}>
          <div className="px-[14px] py-[10px] font-medium text-[var(--foreground)]">{r.aspect}</div>
          <div className="px-[14px] py-[10px] text-[var(--field-supporting)] border-l border-[var(--field-border)]">{r.dsOnly}</div>
          <div className="px-[14px] py-[10px] text-[var(--field-supporting)] border-l border-[var(--field-border)]">{r.repo}</div>
        </div>
      ))}
    </div>
  )
}

function EvidenceCard({ badge, badgeColor, title, what, says, why, links }: {
  badge: string
  badgeColor: string
  title: string
  what: string
  says: string
  why: string
  links: { label: string; href: string }[]
}) {
  return (
    <div className="rounded-md border border-[var(--field-border)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--field-bg)] border-b border-[var(--field-border)] px-[14px] py-[10px] flex items-center gap-[8px] flex-wrap">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-[7px] py-[2px] rounded-full"
          style={{ color: badgeColor, background: badgeColor + "18" }}
        >
          {badge}
        </span>
        <span className="text-[13px] font-semibold text-[var(--foreground)]">{title}</span>
      </div>
      {/* Body */}
      <div className="px-[14px] py-[12px] flex flex-col gap-[10px]">
        <div className="flex flex-col gap-[3px]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--field-supporting)]">What it is</p>
          <p className="text-[13px] text-[var(--field-supporting)] leading-[1.6]">{what}</p>
        </div>
        <div className="flex flex-col gap-[3px]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--field-supporting)]">What it says</p>
          <blockquote className="border-l-[2px] pl-[10px] text-[13px] text-[var(--foreground)] leading-[1.6] italic" style={{ borderColor: badgeColor }}>
            "{says}"
          </blockquote>
        </div>
        <div className="flex flex-col gap-[3px]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--field-supporting)]">Why it supports this strategy</p>
          <p className="text-[13px] text-[var(--field-supporting)] leading-[1.6]">{why}</p>
        </div>
        <div className="flex flex-wrap gap-[8px] pt-[2px]">
          {links.map(l => <ExtLink key={l.href} href={l.href}>{l.label}</ExtLink>)}
        </div>
      </div>
    </div>
  )
}

// ── Progress tab data ──────────────────────────────────────────────────────

const DONE_COMPONENTS = [
  { name: "Button",        complexity: "Complex", hours: 4,  note: "8 variants · 3 sizes · 5 states · icon positions" },
  { name: "Checkbox",      complexity: "Simple",  hours: 2,  note: "2 sizes · checked / indeterminate / disabled" },
  { name: "Input",         complexity: "Medium",  hours: 3,  note: "2 sizes · error · supporting text · leading icon" },
  { name: "Textarea",      complexity: "Simple",  hours: 2,  note: "resize handle · character count · error state" },
  { name: "Select",        complexity: "Medium",  hours: 3,  note: "dropdown list · placeholder · error · disabled" },
  { name: "Toggle",        complexity: "Simple",  hours: 2,  note: "2 sizes · on/off labels · disabled" },
  { name: "Tag",           complexity: "Simple",  hours: 2,  note: "10 semantic colors · 2 sizes · removable" },
  { name: "MenuItem",      complexity: "Medium",  hours: 3,  note: "leading icon · avatar · badge · shortcut · 2 sizes" },
  { name: "HighlightIcon", complexity: "Simple",  hours: 2,  note: "6 semantic colors · round / square shape" },
  { name: "CardContainer", complexity: "Simple",  hours: 2,  note: "3 elevation levels · dark/light surfaces" },
  { name: "Table",         complexity: "Complex", hours: 6,  note: "2 sizes · selectable rows · 5 cell helpers" },
  { name: "Topbar",        complexity: "Complex", hours: 7,  note: "2 variants · workspace dropdown · profile menu · IA button" },
] as const

const REMAINING_PHASES = [
  {
    phase: "Navigation & Layout",
    status: "in-progress" as const,
    items: [
      { name: "Sidebar",        complexity: "Complex", hours: 6 },
      { name: "Breadcrumb",     complexity: "Simple",  hours: 2 },
      { name: "Tabs",           complexity: "Medium",  hours: 3 },
      { name: "Pagination",     complexity: "Medium",  hours: 3 },
    ],
  },
  {
    phase: "Feedback & Overlays",
    status: "pending" as const,
    items: [
      { name: "Modal / Dialog",   complexity: "Complex", hours: 5 },
      { name: "Toast",            complexity: "Medium",  hours: 3 },
      { name: "Tooltip",          complexity: "Medium",  hours: 3 },
      { name: "Alert / Banner",   complexity: "Simple",  hours: 2 },
      { name: "Progress Bar",     complexity: "Simple",  hours: 2 },
      { name: "Skeleton Loader",  complexity: "Medium",  hours: 3 },
    ],
  },
  {
    phase: "Input & Selection",
    status: "pending" as const,
    items: [
      { name: "Radio Button",   complexity: "Simple",  hours: 2 },
      { name: "Slider",         complexity: "Medium",  hours: 3 },
      { name: "Date Picker",    complexity: "Complex", hours: 7 },
      { name: "File Upload",    complexity: "Complex", hours: 5 },
      { name: "Multi-select",   complexity: "Complex", hours: 5 },
      { name: "Search Field",   complexity: "Medium",  hours: 3 },
    ],
  },
  {
    phase: "Data & Display",
    status: "pending" as const,
    items: [
      { name: "Metric Card",  complexity: "Medium",  hours: 3 },
      { name: "Empty State",  complexity: "Medium",  hours: 3 },
      { name: "Avatar",       complexity: "Simple",  hours: 2 },
      { name: "Badge",        complexity: "Simple",  hours: 2 },
      { name: "Data Widget",  complexity: "Complex", hours: 5 },
    ],
  },
  {
    phase: "Workflow & Nodes",
    status: "pending" as const,
    items: [
      { name: "Node Config / Text Input",    complexity: "Medium",  hours: 3 },
      { name: "Node Config / Select",        complexity: "Medium",  hours: 3 },
      { name: "Node Config / Toggle",        complexity: "Simple",  hours: 2 },
      { name: "Node Config / Slider",        complexity: "Medium",  hours: 3 },
      { name: "Node Config / Code Block",    complexity: "Complex", hours: 5 },
      { name: "Node Config / File Input",    complexity: "Complex", hours: 5 },
      { name: "Node Config / Multi-Select",  complexity: "Complex", hours: 5 },
      { name: "Filters Slideout",            complexity: "Complex", hours: 6 },
      { name: "Workflow Builder UI",         complexity: "Complex", hours: 8 },
    ],
  },
  {
    phase: "Remaining DS Pages",
    status: "pending" as const,
    items: [
      { name: "Remaining ~18 components", complexity: "Mixed", hours: 65 },
    ],
  },
] as const

function ProgressTab() {
  const totalDone      = DONE_COMPONENTS.length                                  // 12
  const totalRemaining = REMAINING_PHASES.reduce((s, p) => s + p.items.length, 0)
  const totalAll       = totalDone + totalRemaining                              // ~53

  const hoursInvested  = DONE_COMPONENTS.reduce((s, c) => s + c.hours, 0)       // 38h
  const hoursRemaining = REMAINING_PHASES.reduce(
    (s, p) => s + p.items.reduce((ps, i) => ps + i.hours, 0), 0
  )
  const hoursTotal     = hoursInvested + hoursRemaining

  const pctDone        = Math.round((totalDone / totalAll) * 100)

  const complexityColor: Record<string, string> = {
    Simple:  "var(--tag-success-bg)",
    Medium:  "var(--tag-informative-bg)",
    Complex: "var(--tag-purple-bg)",
    Mixed:   "var(--tag-alert-bg)",
  }
  const complexityText: Record<string, string> = {
    Simple:  "var(--tag-success-fg)",
    Medium:  "var(--tag-informative-fg)",
    Complex: "var(--tag-purple-fg)",
    Mixed:   "var(--tag-alert-fg)",
  }

  const BUILD_STEPS = [
    { step: "1", label: "DS Inspection",      time: "30–45 min", desc: "Read all variants, states, spacing, tokens directly from Figma via MCP API. Verify dark mode values." },
    { step: "2", label: "Token Extraction",   time: "20–30 min", desc: "Map every DS variable to a CSS custom property. Verify light and dark values. Add to index.css." },
    { step: "3", label: "Implementation",     time: "60–90 min", desc: "TypeScript component with all variants, states, sub-components, and accessibility attributes." },
    { step: "4", label: "Documentation Page", time: "45–60 min", desc: "4-tab page: Overview · Variants · Playground (live controls) · Reference (token table + code snippet)." },
    { step: "5", label: "QA & Iteration",     time: "20–30 min", desc: "Visual comparison against DS, spacing corrections, edge cases, dark/light mode verification." },
  ]

  return (
    <div className="flex flex-col gap-[40px]">

      {/* ── Hero stats ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-[16px]">
        <div>
          <h2 className="text-[20px] font-semibold text-[var(--foreground)]">Build Progress</h2>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Real-time tracking of every component — time invested, complexity, and what remains.
            This section exists to set honest expectations: a faithful design system implementation is
            a significant engineering effort, not a one-time shortcut.
          </p>
        </div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-4 gap-[12px]">
          {[
            { label: "Components built",    value: `${totalDone}`,          sub: `of ~${totalAll} total`,         color: "var(--tag-success-bg)",      textColor: "var(--tag-success-fg)" },
            { label: "Overall progress",    value: `${pctDone}%`,           sub: "by component count",            color: "var(--tag-informative-bg)",  textColor: "var(--tag-informative-fg)" },
            { label: "Hours invested",      value: `~${hoursInvested}h`,    sub: "Figma inspection + dev + docs",  color: "var(--tag-purple-bg)",        textColor: "var(--tag-purple-fg)" },
            { label: "Hours remaining",     value: `~${hoursRemaining}h`,   sub: `~${hoursTotal}h total estimated`, color: "var(--tag-alert-bg)",         textColor: "var(--tag-alert-fg)" },
          ].map(s => (
            <div key={s.label} className="rounded-[10px] p-[16px] flex flex-col gap-[6px]"
              style={{ background: s.color }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: s.textColor }}>{s.label}</p>
              <p className="text-[28px] font-bold leading-none" style={{ color: s.textColor }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: s.textColor, opacity: 0.75 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[var(--foreground)]">
              {totalDone} of ~{totalAll} components complete
            </span>
            <span className="text-[12px] text-[var(--field-supporting)]">{pctDone}%</span>
          </div>
          <div className="w-full h-[8px] rounded-full overflow-hidden" style={{ background: "var(--field-border)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pctDone}%`,
                background: "linear-gradient(90deg, var(--primary) 0%, rgba(9,226,171,1) 100%)",
              }}
            />
          </div>
          <p className="text-[11px] text-[var(--field-supporting)]">
            Note: component count is an estimate. The DS has 57 documented pages; several pages contain
            multiple component sets, bringing the realistic total to ~{totalAll} buildable components.
          </p>
        </div>
      </div>

      {/* ── What each component actually requires ──────────────── */}
      <div className="flex flex-col gap-[16px]">
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--foreground)]">What building one component actually requires</h2>
          <p className="text-[13px] text-[var(--field-supporting)] mt-[4px]">
            Every component goes through these 5 steps — regardless of how "simple" it looks visually.
            This is why a component cannot be done in 10 minutes.
          </p>
        </div>
        <div className="flex flex-col gap-[2px]">
          {BUILD_STEPS.map((s, i) => (
            <div key={s.step}
              className="flex items-start gap-[16px] p-[14px] rounded-[8px]"
              style={{ background: i % 2 === 0 ? "var(--surface-raised)" : "transparent" }}
            >
              <div className="flex items-center justify-center shrink-0 w-[24px] h-[24px] rounded-full text-[11px] font-bold"
                style={{ background: "var(--primary)", color: "#fff" }}>
                {s.step}
              </div>
              <div className="flex-1 flex flex-col gap-[2px]">
                <div className="flex items-center gap-[10px]">
                  <span className="text-[13px] font-semibold text-[var(--foreground)]">{s.label}</span>
                  <span className="text-[11px] font-medium px-[8px] py-[2px] rounded-[4px]"
                    style={{ background: "var(--tag-neutral-bg)", color: "var(--tag-neutral-fg)" }}>
                    {s.time}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--field-supporting)] leading-[1.5]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[8px] p-[14px] flex items-start gap-[12px]"
          style={{ background: "var(--tag-informative-bg)", border: "1px solid var(--tag-informative-bg)" }}>
          <span className="text-[18px]" style={{ lineHeight: 1 }}>⏱</span>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
              Average per component: 3–7 hours
            </p>
            <p className="text-[12px] mt-[4px]" style={{ color: "var(--field-supporting)" }}>
              Simple components (Toggle, Checkbox) take ~2–3h. Medium components (Input, Select) take ~3–4h.
              Complex components with multiple sub-parts (Table, Topbar, Sidebar) take 5–8h each.
              This is design + engineering work happening simultaneously — not just copy-pasting styles.
            </p>
          </div>
        </div>
      </div>

      {/* ── How PMs will prototype ──────────────────────────────── */}
      <div className="flex flex-col gap-[20px]">
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--foreground)]">How PMs will prototype with this DS</h2>
          <p className="text-[13px] text-[var(--field-supporting)] mt-[4px]">
            No Figma skills, no coding knowledge, no design tools required.
            The entire workflow happens through a conversation with Claude — the component library
            is the bridge between what you describe and what gets generated.
          </p>
        </div>

        {/* One-time setup vs day-to-day */}
        <div className="grid grid-cols-2 gap-[12px]">
          <div className="rounded-[10px] p-[16px] flex flex-col gap-[10px]"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--table-border)" }}>
            <div className="flex items-center gap-[8px]">
              <span className="text-[11px] font-semibold px-[8px] py-[2px] rounded-[4px]"
                style={{ background: "var(--tag-neutral-bg)", color: "var(--tag-neutral-fg)" }}>
                One-time setup · 5 min
              </span>
            </div>
            {[
              { n: "1", text: "Get access to the GitHub repo (link shared with team)." },
              { n: "2", text: "Open Claude Code in terminal — one command to install." },
              { n: "3", text: "Point Claude at the repo. The CLAUDE.md file does this automatically." },
              { n: "4", text: "Done. Claude now knows every available component and how to use it." },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-[10px]">
                <span className="flex items-center justify-center shrink-0 w-[20px] h-[20px] rounded-full text-[10px] font-bold mt-[1px]"
                  style={{ background: "var(--tag-neutral-bg)", color: "var(--tag-neutral-fg)" }}>
                  {s.n}
                </span>
                <p className="text-[12px] text-[var(--field-supporting)] leading-[1.5]">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[10px] p-[16px] flex flex-col gap-[10px]"
            style={{ background: "var(--tag-informative-bg)", border: "1px solid var(--primary)" }}>
            <div className="flex items-center gap-[8px]">
              <span className="text-[11px] font-semibold px-[8px] py-[2px] rounded-[4px]"
                style={{ background: "var(--primary)", color: "#fff" }}>
                Every prototype session · ~10–30 min
              </span>
            </div>
            {[
              { n: "1", text: `Describe the screen in plain English: "I need a settings page with a sidebar, a user table with filters, and a modal to edit each row."` },
              { n: "2", text: "Claude reads the component library and generates the screen using real DS components — not approximations." },
              { n: "3", text: "Preview opens instantly in the browser. Interactive states, dark/light mode, all built in." },
              { n: "4", text: `Iterate with natural language: "Make the table selectable," "Add an empty state when no users," "Use the DS error toast."` },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-[10px]">
                <span className="flex items-center justify-center shrink-0 w-[20px] h-[20px] rounded-full text-[10px] font-bold mt-[1px]"
                  style={{ background: "var(--primary)", color: "#fff" }}>
                  {s.n}
                </span>
                <p className="text-[12px] leading-[1.5]" style={{ color: "var(--foreground)" }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Without vs With comparison */}
        <div className="rounded-[10px] overflow-hidden border border-[var(--table-border)]">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="p-[14px] flex flex-col gap-[8px]"
              style={{ borderRight: "1px solid var(--table-border)", background: "var(--table-bg)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: "var(--tag-error-fg, #d32f2f)" }}>
                Without this repository
              </p>
              {[
                "Claude invents its own components each session — different every time.",
                "Colors, spacing, and typography are approximated, not DS-accurate.",
                "Every prototype needs manual Figma cleanup before sharing.",
                "No single source of truth — each PM generates different-looking screens.",
                `Design debt accumulates: screens that "look right" but don't match the DS.`,
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-[8px]">
                  <span className="shrink-0 mt-[3px] text-[10px]" style={{ color: "var(--tag-error-fg, #d32f2f)" }}>✕</span>
                  <p className="text-[12px] text-[var(--field-supporting)] leading-[1.5]">{t}</p>
                </div>
              ))}
            </div>
            <div className="p-[14px] flex flex-col gap-[8px]" style={{ background: "var(--table-bg)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: "var(--tag-success-fg)" }}>
                With this repository
              </p>
              {[
                "Claude picks from the built component list — consistent across every session.",
                "Every value (color, spacing, radius) comes directly from Figma DS tokens.",
                "Prototypes are shareable immediately — no cleanup needed.",
                "All PMs generate screens from the same components — the same result every time.",
                "Screens are implementation-ready: a developer can open the code and use it.",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-[8px]">
                  <span className="shrink-0 mt-[3px] text-[10px]" style={{ color: "var(--tag-success-fg)" }}>✓</span>
                  <p className="text-[12px] text-[var(--field-supporting)] leading-[1.5]">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The only constraint */}
        <div className="rounded-[8px] p-[14px] flex items-start gap-[12px]"
          style={{ background: "var(--tag-alert-bg)", border: "1px solid var(--tag-alert-bg)" }}>
          <span className="text-[16px] shrink-0" style={{ lineHeight: 1.2 }}>⚠</span>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--tag-alert-fg)" }}>
              The only constraint: you can only use components that are already built
            </p>
            <p className="text-[12px] mt-[4px]" style={{ color: "var(--field-supporting)" }}>
              If you ask Claude to generate a screen with a Date Picker and it hasn't been built yet,
              Claude will either skip it or improvise — breaking the consistency guarantee.
              That is why the component list below matters: each addition directly expands
              what can be prototyped.
            </p>
          </div>
        </div>
      </div>

      {/* ── Completed components ────────────────────────────────── */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="text-[18px] font-semibold text-[var(--foreground)]">
          Completed — {totalDone} components · ~{hoursInvested}h invested
        </h2>
        <div className="rounded-[10px] overflow-hidden border border-[var(--table-border)]">
          {/* Header */}
          <div className="grid px-[16px] py-[10px] border-b border-[var(--table-border)]"
            style={{ gridTemplateColumns: "1fr 100px 60px", background: "var(--table-header-bg)" }}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--table-header-text)]">Component</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--table-header-text)]">Complexity</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--table-header-text)] text-right">Hours</span>
          </div>
          {DONE_COMPONENTS.map((c, i) => (
            <div key={c.name}
              className="grid px-[16px] py-[10px] items-center"
              style={{
                gridTemplateColumns: "1fr 100px 60px",
                borderBottom: i < DONE_COMPONENTS.length - 1 ? "1px solid var(--table-border)" : "none",
                background: "var(--table-bg)",
              }}>
              <div className="flex flex-col gap-[2px]">
                <div className="flex items-center gap-[8px]">
                  <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: "var(--tag-success-fg)" }} />
                  <span className="text-[13px] font-medium text-[var(--foreground)]">{c.name}</span>
                </div>
                <span className="text-[11px] text-[var(--field-supporting)] pl-[14px]">{c.note}</span>
              </div>
              <span className="text-[11px] font-medium px-[8px] py-[3px] rounded-[4px] w-fit"
                style={{ background: complexityColor[c.complexity], color: complexityText[c.complexity] }}>
                {c.complexity}
              </span>
              <span className="text-[13px] font-semibold text-right" style={{ color: "var(--foreground)" }}>
                {c.hours}h
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Remaining by phase ──────────────────────────────────── */}
      <div className="flex flex-col gap-[16px]">
        <h2 className="text-[18px] font-semibold text-[var(--foreground)]">
          Remaining — ~{totalRemaining} components · ~{hoursRemaining}h estimated
        </h2>
        <div className="flex flex-col gap-[12px]">
          {REMAINING_PHASES.map(phase => {
            const phaseHours = phase.items.reduce((s, i) => s + i.hours, 0)
            const isNext = phase.status === "in-progress"
            return (
              <div key={phase.phase} className="rounded-[10px] overflow-hidden border"
                style={{ borderColor: isNext ? "var(--primary)" : "var(--table-border)" }}>
                {/* Phase header */}
                <div className="flex items-center justify-between px-[16px] py-[10px]"
                  style={{ background: isNext ? "var(--tag-informative-bg)" : "var(--table-header-bg)" }}>
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[11px] font-semibold px-[8px] py-[2px] rounded-[4px]"
                      style={{
                        background: isNext ? "var(--primary)" : "var(--tag-neutral-bg)",
                        color: isNext ? "#fff" : "var(--tag-neutral-fg)",
                      }}>
                      {isNext ? "▶ Up Next" : "Pending"}
                    </span>
                    <span className="text-[13px] font-semibold text-[var(--foreground)]">{phase.phase}</span>
                  </div>
                  <span className="text-[12px] text-[var(--field-supporting)]">
                    {phase.items.length} components · ~{phaseHours}h
                  </span>
                </div>
                {/* Phase items */}
                <div className="divide-y divide-[var(--table-border)]">
                  {phase.items.map(item => (
                    <div key={item.name} className="flex items-center justify-between px-[16px] py-[8px]"
                      style={{ background: "var(--table-bg)" }}>
                      <div className="flex items-center gap-[8px]">
                        <span className="w-[6px] h-[6px] rounded-full shrink-0 opacity-30"
                          style={{ background: "var(--foreground)" }} />
                        <span className="text-[13px] text-[var(--table-cell-text)]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[11px] font-medium px-[6px] py-[2px] rounded-[4px]"
                          style={{ background: complexityColor[item.complexity], color: complexityText[item.complexity] }}>
                          {item.complexity}
                        </span>
                        <span className="text-[12px] font-semibold w-[32px] text-right"
                          style={{ color: "var(--field-supporting)" }}>
                          ~{item.hours}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Timeline reality ────────────────────────────────────── */}
      <div className="rounded-[10px] p-[20px] flex flex-col gap-[14px]"
        style={{ background: "var(--surface-raised)", border: "1px solid var(--table-border)" }}>
        <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Timeline — two milestones that matter</h2>

        {/* Milestone 1 — Prototype-ready */}
        <div className="rounded-[10px] overflow-hidden border-2" style={{ borderColor: "var(--primary)" }}>
          <div className="flex items-center justify-between px-[16px] py-[10px]"
            style={{ background: "var(--tag-informative-bg)" }}>
            <div className="flex items-center gap-[10px]">
              <span className="text-[11px] font-semibold px-[8px] py-[2px] rounded-[4px]"
                style={{ background: "var(--primary)", color: "#fff" }}>
                Milestone 1 — Priority
              </span>
              <span className="text-[14px] font-semibold text-[var(--foreground)]">
                Prototype-ready MVP
              </span>
            </div>
            <span className="text-[22px] font-bold" style={{ color: "var(--primary)" }}>2–4 weeks</span>
          </div>
          <div className="p-[16px] flex flex-col gap-[10px]" style={{ background: "var(--table-bg)" }}>
            <p className="text-[12px] text-[var(--field-supporting)] leading-[1.5]">
              With <strong className="text-[var(--foreground)]">~18–20 core components</strong>, PMs can
              prototype the majority of AIMS OS screens immediately. The 6–8 components remaining to reach
              this milestone (Sidebar, Modal, Tabs, Toast, Breadcrumb, Radio, Empty State) represent
              ~24h of work — achievable in 2–4 weeks at current pace.
            </p>
            <div className="flex flex-wrap gap-[6px]">
              {["Sidebar", "Modal / Dialog", "Tabs", "Toast", "Breadcrumb", "Radio Button", "Empty State"].map(c => (
                <span key={c} className="text-[11px] font-medium px-[8px] py-[2px] rounded-[4px]"
                  style={{ background: "var(--tag-informative-bg)", color: "var(--tag-informative-fg)" }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone 2 — Full DS */}
        <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: "var(--table-border)" }}>
          <div className="flex items-center justify-between px-[16px] py-[10px]"
            style={{ background: "var(--table-header-bg)" }}>
            <div className="flex items-center gap-[10px]">
              <span className="text-[11px] font-semibold px-[8px] py-[2px] rounded-[4px]"
                style={{ background: "var(--tag-neutral-bg)", color: "var(--tag-neutral-fg)" }}>
                Milestone 2
              </span>
              <span className="text-[14px] font-semibold text-[var(--foreground)]">
                Full DS — all ~{totalAll} components
              </span>
            </div>
            <span className="text-[22px] font-bold text-[var(--foreground)]">3–4 months</span>
          </div>
          <div className="p-[16px] grid grid-cols-3 gap-[12px]">
            {[
              { label: "Current pace",       value: "3–5 sessions/wk", note: "~8–12h / week" },
              { label: "Hours remaining",    value: `~${hoursRemaining}h`,      note: "across ~41 components" },
              { label: "Accelerator",        value: "Daily sessions",  note: "cuts timeline to ~2 months" },
            ].map(t => (
              <div key={t.label} className="flex flex-col gap-[4px] p-[12px] rounded-[8px]"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--table-border)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--field-supporting)]">{t.label}</p>
                <p className="text-[16px] font-bold text-[var(--foreground)]">{t.value}</p>
                <p className="text-[10px] text-[var(--field-supporting)]">{t.note}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-[var(--field-supporting)] leading-[1.6] pt-[2px]" style={{ borderTop: "1px solid var(--table-border)" }}>
          <strong className="text-[var(--foreground)]">The key distinction:</strong>{" "}
          Milestone 1 (prototype-ready) is the urgent priority — it unblocks the team's ability to generate
          consistent screens immediately. Milestone 2 (full DS) is the long-term foundation that ensures
          every corner of the product has a reusable, token-accurate component.
          Both milestones are built from the same process — each component added to Milestone 1
          is also a step toward Milestone 2.
        </p>
      </div>

    </div>
  )
}

function HomePage() {
  const [tab, setTab] = useState<"overview" | "problem" | "solution" | "evidence" | "progress">("overview")

  const homeTabs = [
    { id: "overview",  label: "Overview" },
    { id: "problem",   label: "The Problem" },
    { id: "solution",  label: "The Solution" },
    { id: "evidence",  label: "Evidence" },
    { id: "progress",  label: "Progress & Time" },
  ] as const

  return (
    <div className="flex flex-col gap-0">

      {/* Page header — always visible */}
      <div className="flex flex-col gap-[10px] mb-[28px]">

      {/* Header */}
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-[8px] flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--field-supporting)] bg-[var(--field-bg)] border border-[var(--field-border)] px-[8px] py-[3px] rounded-full">Audience: Product Management</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--field-supporting)] bg-[var(--field-bg)] border border-[var(--field-border)] px-[8px] py-[3px] rounded-full">Author: Product Design · AIMS OS</span>
        </div>
        <h1 className="text-[26px] font-bold text-[var(--foreground)] leading-[1.25] max-w-[700px]">
          Why a component repository is the foundation for generating consistent prototypes
        </h1>
        <p className="text-[14px] text-[var(--field-supporting)]">
          Alignment document — Strategy for AI-generated high-fidelity views
        </p>
      </div>

      <Divider />
      </div>

      {/* Tab navigation */}
      <TabBar
        tabs={homeTabs as unknown as { id: string; label: string }[]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {tab === "overview" && (
          <>
                  {/* TL;DR */}
                  <DocSection title="Executive summary (TL;DR)">
                    <Callout>
                      For the AI to generate prototypes that are <strong>faithful and consistent</strong> with our Design System, pointing it at the Figma file is not enough. We need a <strong>repository with our real components and tokens in code</strong>, which the AI <strong>reuses</strong> instead of rebuilding each time.
                    </Callout>
                    <Prose>
                      The difference in one sentence: <strong className="text-[var(--foreground)]">with only the Design System the AI <em>reinterprets</em> our components in every prototype (and drifts); with the repository it <em>reuses</em> them (and they stay identical).</strong>
                    </Prose>
                    <Prose>
                      This is not an opinion or an invention: it is the approach officially documented by Figma, Anthropic (creators of Claude), and the W3C Design Tokens standard. Sources are at the bottom.
                    </Prose>
                  </DocSection>
            

                  {/* Comparison table */}
                  <DocSection title="Direct comparison">
                    <ComparisonTable />
                  </DocSection>
            
                  <Divider />
            

                  {/* DS readiness */}
                  <DocSection title="Is our Design System ready for an AI to read?">
                    <div className="bg-[#00a07e0d] border border-[#00a07e30] rounded-md px-[16px] py-[12px]">
                      <p className="text-[13px] font-semibold text-[#00a07e]">Yes — it was reviewed and prepared for this flow.</p>
                    </div>
                    <BulletList items={[
                      <><strong className="text-[var(--foreground)]">Complete tokens as variables</strong> (not loose values): Semantic Colors (162), Primitives (189), Spacing &amp; Radii (21), Typography (54) and Breakpoints. This is the most important foundation — and we have it. Having them as <em>variables</em> is exactly what allows the AI to read them as data instead of guessing them.</>,
                      <><strong className="text-[var(--foreground)]">Components with clean names and no duplicates</strong> (ambiguous names and typos were corrected). The name is how the AI identifies each component, so this matters.</>,
                      <><strong className="text-[var(--foreground)]">Published library, up to date</strong> — the condition for AI tools to see the correct version.</>,
                    ]} />
                    <Callout>
                      In other words: the Design System is well built. What was missing was <strong>not fixing the Design System, but giving the AI a code version it can reuse.</strong> That is the repository.
                    </Callout>
                  </DocSection>
            
                  <Divider />
          </>
        )}

        {tab === "problem" && (
          <>
                  {/* Problem */}
                  <DocSection title="The problem we want to solve">
                    <Prose>
                      Today PMs generate prototypes based on the Design System, but visually <strong className="text-[var(--foreground)]">they are not 100% faithful</strong>. This forces Design to redo a Figma file specifying how views should look and which components to use. With only one designer focused on this, it creates a <strong className="text-[var(--foreground)]">bottleneck that slows the entire team down</strong>.
                    </Prose>
                    <Prose>
                      The underlying question is: <em>why, if we already have a Design System, do prototypes not come out faithful?</em>
                    </Prose>
                  </DocSection>
            
                  <Divider />
            <Divider />
                  {/* Why DS alone doesn't work */}
                  <DocSection title='Why "just giving the Design System" does not work'>
                    <Prose>
                      An AI does not "see" our Figma the way a person does. When we only point it at the design, this happens:
                    </Prose>
                    <div className="flex flex-col gap-[20px]">
                      <div className="flex gap-[14px]">
                        <div className="shrink-0 w-[22px] h-[22px] rounded-full bg-[#d32f2f1a] border border-[#d32f2f40] flex items-center justify-center text-[11px] font-bold text-[#d32f2f] mt-[2px]">1</div>
                        <div className="flex flex-col gap-[4px] pt-[2px]">
                          <p className="text-[14px] font-semibold text-[var(--foreground)]">It receives a description, not a reusable piece.</p>
                          <p className="text-[13px] leading-[1.6] text-[var(--field-supporting)]">The AI reads what a button <em>looks like</em> and then has to <strong className="text-[var(--foreground)]">reconstruct it in code from scratch</strong>. Reconstructing from a description is like asking someone to redraw a logo from memory every time: it comes out similar, but never identical, and each attempt varies slightly. That accumulated variation is the "drift" we see.</p>
                        </div>
                      </div>
                      <div className="flex gap-[14px]">
                        <div className="shrink-0 w-[22px] h-[22px] rounded-full bg-[#d32f2f1a] border border-[#d32f2f40] flex items-center justify-center text-[11px] font-bold text-[#d32f2f] mt-[2px]">2</div>
                        <div className="flex flex-col gap-[4px] pt-[2px]">
                          <p className="text-[14px] font-semibold text-[var(--foreground)]">Every prototype reinvents the same components.</p>
                          <p className="text-[13px] leading-[1.6] text-[var(--field-supporting)]">If the button only exists as a description, every screen fabricates it again. Five screens = five slightly different buttons. There is no single source of truth that everyone reuses.</p>
                        </div>
                      </div>
                      <div className="flex gap-[14px]">
                        <div className="shrink-0 w-[22px] h-[22px] rounded-full bg-[#d32f2f1a] border border-[#d32f2f40] flex items-center justify-center text-[11px] font-bold text-[#d32f2f] mt-[2px]">3</div>
                        <div className="flex flex-col gap-[4px] pt-[2px]">
                          <p className="text-[14px] font-semibold text-[var(--foreground)]">It guesses values that are not available as data.</p>
                          <p className="text-[13px] leading-[1.6] text-[var(--field-supporting)]">If a spacing or color is not available as structured data (a token), the AI approximates it by looking at the image. Approximating is not the same as matching.</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#d32f2f0a] border border-[#d32f2f26] rounded-md px-[16px] py-[12px]">
                      <p className="text-[13px] leading-[1.6] text-[var(--field-supporting)]">
                        <strong className="text-[var(--foreground)]">Conclusion:</strong> giving it only the Design System leaves it "guessing." And guessing produces results that change from one attempt to the next — exactly our current problem.
                      </p>
                    </div>
                  </DocSection>
            
                  <Divider />
          </>
        )}

        {tab === "solution" && (
          <>
                  {/* Solution */}
                  <DocSection title="The solution: the repository as a knowledge base">
                    <Prose>
                      The repository converts "descriptions that get reinterpreted" into "pieces that get reused." It is built on three layers, where each one only uses the one below:
                    </Prose>
                    <div className="rounded-md border border-[var(--field-border)] overflow-hidden">
                      {[
                        { layer: "Tokens", color: "#2173ff", desc: "The meaningful values of the Design System — a color, a spacing, a radius. The single source of truth for every visual decision." },
                        { layer: "Components", color: "#00a07e", desc: "Buttons, inputs, cards, etc., built in code using those tokens. The reusable pieces the AI picks from." },
                        { layer: "Views", color: "#9333ea", desc: "Screens assembled by combining those components. What PMs generate — no rebuilding from scratch." },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-start gap-[14px] px-[16px] py-[14px] border-b border-[var(--field-border)] last:border-b-0 ${i % 2 === 1 ? "bg-[var(--field-bg)]" : ""}`}>
                          <div className="shrink-0 w-[8px] h-[8px] rounded-full mt-[6px]" style={{ background: item.color }} />
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{item.layer}</p>
                            <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Prose>
                      When a PM requests a screen, the AI <strong className="text-[var(--foreground)]">picks the real button from the repository and places it</strong>, instead of inventing it. Fidelity is guaranteed by the system, not by the designer's manual review. An additional layer called <strong className="text-[var(--foreground)]">Code Connect</strong> ties each Figma component to its code counterpart, so the AI knows exactly which piece to use.
                    </Prose>
                  </DocSection>
            

                  {/* Process */}
                  <DocSection title="The process in simple steps">
                    <div className="flex flex-col gap-[18px]">
                      <NumberedStep n={1} title="Create the repository with the component library in code">
                        React + Tailwind, themed with our Design System tokens.
                      </NumberedStep>
                      <NumberedStep n={2} title="Sync tokens from Figma to code">
                        As the single source of truth. Any change in the DS propagates automatically.
                      </NumberedStep>
                      <NumberedStep n={3} title="Connect (Code Connect) each Figma component to its code version">
                        So the AI knows exactly which piece to use when it reads a design file.
                      </NumberedStep>
                      <NumberedStep n={4} title="PMs generate views with Claude Code">
                        They open the repo, describe the screen or paste a Figma link, and the AI assembles the prototype reusing real components.
                      </NumberedStep>
                      <NumberedStep n={5} title="Design curates and reviews">
                        Maintains the library and reviews the smaller percentage that needs adjustment.
                      </NumberedStep>
                    </div>
                    <div className="bg-[var(--field-bg)] border border-[var(--field-border)] rounded-md px-[14px] py-[11px]">
                      <p className="text-[12px] text-[var(--field-supporting)]">
                        We start with a core group of 8–10 components (not all 40 at once) and scale coverage from there.
                      </p>
                    </div>
                  </DocSection>
            

                  {/* Realistic expectation */}
                  <DocSection title="Realistic expectation (important)">
                    <Prose>
                      This is <strong className="text-[var(--foreground)]">not 100% magic</strong>. The industry standard is that ~85% comes out correctly and ~15% needs manual adjustment, especially for new and complex screens. The real value is the shift in Design's role: from <em>rebuilding every screen</em> to <em>reviewing and curating</em>. That is where the bottleneck is actually eliminated. Every component added to the library moves work from the hard side (inventing) to the easy side (reusing), so fidelity improves over time.
                    </Prose>
                    <div className="rounded-md border border-[var(--field-border)] overflow-hidden">
                      <div className="grid grid-cols-2 bg-[var(--field-bg)] border-b border-[var(--field-border)]">
                        <div className="px-[14px] py-[9px] text-center">
                          <p className="text-[28px] font-bold text-[#00a07e]">~85%</p>
                          <p className="text-[12px] text-[var(--field-supporting)] mt-[2px]">comes out correctly on first generation</p>
                        </div>
                        <div className="px-[14px] py-[9px] text-center border-l border-[var(--field-border)]">
                          <p className="text-[28px] font-bold text-[var(--field-supporting)]">~15%</p>
                          <p className="text-[12px] text-[var(--field-supporting)] mt-[2px]">needs manual adjustment (new, complex screens)</p>
                        </div>
                      </div>
                      <div className="px-[14px] py-[10px]">
                        <p className="text-[12px] text-[var(--field-supporting)] text-center">Industry standard — improves as library coverage grows</p>
                      </div>
                    </div>
                  </DocSection>
            
                  <Divider />
            
          </>
        )}

        {tab === "evidence" && (
          <>
                  {/* Sources */}
                  <DocSection title="Market evidence & sources">
                    <Prose>
                      Every claim in this document is backed by a published, verifiable source. Below you will find what each source is, what it specifically says, and why it supports this strategy. Nothing invented.
                    </Prose>
            
                    {/* Industry data callout */}
                    <div className="rounded-md border border-[var(--field-border)] overflow-hidden">
                      <div className="bg-[var(--field-bg)] border-b border-[var(--field-border)] px-[16px] py-[10px]">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--field-supporting)]">Industry data — Zeroheight Design Systems Report 2025</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--field-border)]">
                        {[
                          { stat: "84%", label: "of design system teams have adopted design tokens", color: "#00a07e" },
                          { stat: "#1", label: "challenge cited: consistency across teams and products", color: "#2173ff" },
                          { stat: "10%", label: "of teams currently using AI for design system tasks — the gap is the opportunity", color: "#ed6c02" },
                        ].map((d, i) => (
                          <div key={i} className="px-[20px] py-[16px] flex flex-col gap-[4px]">
                            <p className="text-[28px] font-bold" style={{ color: d.color }}>{d.stat}</p>
                            <p className="text-[12px] text-[var(--field-supporting)] leading-[1.5]">{d.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[var(--field-border)] px-[16px] py-[8px] flex items-center justify-between gap-[8px]">
                        <p className="text-[11px] text-[var(--field-supporting)] italic">~300 respondents · published 2025</p>
                        <ExtLink href="https://zeroheight.com/resource/design-system-report-2025/">Zeroheight Design Systems Report 2025</ExtLink>
                      </div>
                    </div>
            
                    {/* Category 1 */}
                    <div className="flex flex-col gap-[10px]">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2173ff]">1 — AI + consistency: the tools themselves confirm the problem</p>
            
                      <EvidenceCard
                        badge="Official documentation"
                        badgeColor="#2173ff"
                        title="Figma — Code Connect + MCP server"
                        what="Figma's official documentation for connecting your code components to Figma designs, and for the MCP server that delivers design context to AI tools."
                        says="When you have Code Connect set up for your design system components, the Figma MCP server enhances its output by including real implementation details from your codebase, which helps AI agents generate code that's consistent with your actual component library and design patterns."
                        why="Figma's own docs make the AI argument explicitly: without Code Connect, AI tools generate autogenerated placeholder code. With it, they generate real component calls. This is the most direct endorsement of our strategy — from the tool designers actually use."
                        links={[
                          { label: "Figma MCP server guide", href: "https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server" },
                          { label: "Code Connect overview", href: "https://developers.figma.com/docs/code-connect/" },
                          { label: "Code Connect + AI integration", href: "https://developers.figma.com/docs/figma-mcp-server/code-connect-integration" },
                        ]}
                      />
            
                      <EvidenceCard
                        badge="Official documentation"
                        badgeColor="#2173ff"
                        title="Anthropic — Claude Code best practices"
                        what="Anthropic's official guide for getting the most consistent and accurate output from Claude Code — the AI tool used in this workflow."
                        says="Reference existing patterns. Point Claude to patterns in your codebase. CLAUDE.md is a special file that Claude reads at the start of every conversation — it gives Claude persistent context it can't infer from code alone. Most performance issues stem from context running out: without persistent context, each session starts from scratch."
                        why="Anthropic explicitly states that AI needs structured, persistent context to produce consistent output. A CLAUDE.md pointing to a component library and token system is the mechanism that prevents per-session reinterpretation. Without it, Claude invents its own component patterns each session — exactly the drift we observe."
                        links={[
                          { label: "Claude Code best practices", href: "https://code.claude.com/docs/en/best-practices" },
                        ]}
                      />
                    </div>
            
                    {/* Category 2 */}
                    <div className="flex flex-col gap-[10px]">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00a07e]">2 — Tokens as single source of truth: the open standard and its tooling</p>
            
                      <EvidenceCard
                        badge="Open standard · W3C community group"
                        badgeColor="#00a07e"
                        title="W3C Design Tokens Community Group — stable specification (Oct 2025)"
                        what="The open, vendor-neutral file format for exchanging design tokens between tools. Reached its first stable version in October 2025 after years of community development."
                        says="The specification unlocks interoperability across design tools and code. Design systems teams can now maintain one source of truth that works everywhere — from design to production code across iOS, Android, and web. — Kaelig Deloumeau-Prigent, co-chair."
                        why="The W3C community group exists precisely because without a shared format, every tool invented its own — and drift was structurally guaranteed. The stable spec formalizes tokens as the universal single source of truth, consumable by any tool including AI agents."
                        links={[
                          { label: "W3C Design Tokens Community Group", href: "https://www.w3.org/community/design-tokens/" },
                          { label: "designtokens.org", href: "https://www.designtokens.org/" },
                          { label: "Stable specification format module", href: "https://www.designtokens.org/tr/drafts/format/" },
                          { label: "First stable version announcement", href: "https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/" },
                        ]}
                      />
            
                      <EvidenceCard
                        badge="Industry tool · open source"
                        badgeColor="#00a07e"
                        title="Style Dictionary — design token transformation (Amazon)"
                        what="The industry-standard open-source tool for transforming a single design token file into CSS variables, iOS Swift constants, Android XML, and any other output format. Created and maintained by Amazon."
                        says="Style Dictionary solves consistency challenges by automatically generating style definitions across all platforms from a single source — removing roadblocks, errors, and inefficiencies across your workflow."
                        why="Style Dictionary is the technical proof of concept: one JSON token file, many consistent outputs. AI tools pointing at that token file get the same values regardless of platform or session. It removes the possibility of 'approximating' a value."
                        links={[
                          { label: "Style Dictionary — design tokens", href: "https://styledictionary.com/info/tokens/" },
                          { label: "Version 4 statement", href: "https://styledictionary.com/versions/v4/statement/" },
                        ]}
                      />
            
                      <EvidenceCard
                        badge="Industry tool · Figma plugin"
                        badgeColor="#00a07e"
                        title="Token Studio for Figma — bidirectional sync"
                        what="The most widely used Figma plugin for creating, managing, and syncing design tokens directly to a Git repository. Bridges the gap between Figma variables and code tokens."
                        says="When digital products are built with Design Tokens, it creates the foundation for a CI/CD pipeline between design and development, dramatically reducing the engineering effort to implement design changes. Engineers can see your design decisions in code as platform-agnostic Tokens."
                        why="Token Studio closes the loop our strategy requires: design decisions made in Figma are written to a Git repo as JSON tokens, consumed by Style Dictionary, and referenced by the component library. AI tools pointed at that repo receive the same ground truth as the designers."
                        links={[
                          { label: "Intro to design tokens", href: "https://docs.tokens.studio/fundamentals/design-tokens/" },
                          { label: "Git sync provider", href: "https://docs.tokens.studio/token-storage/remote/sync-git-github" },
                        ]}
                      />
                    </div>
            
                    {/* Category 3 */}
                    <div className="flex flex-col gap-[10px]">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9333ea]">3 — Component methodology: why reuse beats rebuild</p>
            
                      <EvidenceCard
                        badge="Foundational methodology"
                        badgeColor="#9333ea"
                        title="Atomic Design — Brad Frost"
                        what="The foundational methodology (2016) for component-based design systems. Establishes the atoms → molecules → organisms → templates → pages hierarchy that underlies every modern design system, including ours."
                        says="Creating simple UI molecules makes testing easier, encourages reusability, and promotes consistency throughout the interface. Atomic design ensures coherent interfaces by requiring designers to simultaneously view our user interfaces as both a cohesive whole and a collection of parts."
                        why="Frost's hierarchy creates natural guardrails against drift: an AI building with pre-defined atoms cannot arbitrarily invent new patterns because the smallest units are already defined. The methodology is the theoretical foundation for why our repository architecture works."
                        links={[
                          { label: "Atomic Design — Chapter 2: Atomic Design Methodology", href: "https://atomicdesign.bradfrost.com/chapter-2/" },
                        ]}
                      />
            
                      <EvidenceCard
                        badge="Industry standard tool"
                        badgeColor="#9333ea"
                        title="Storybook — component-driven UI development"
                        what="The industry-standard tool for developing and documenting UI components in isolation. Used by Airbnb, GitHub, Shopify, and thousands of teams. Explicitly positions itself as 'the single source of truth for your UI.'"
                        says="Stories index all your components and their various states. Storybook provides an isolated iframe to render components without interference from app business logic and context, enabling teams to find and reuse existing UI patterns."
                        why="Storybook's architecture is premised on exactly the problem our strategy solves: without isolation and indexing, 'looks done' is the only signal. Stories give an AI (or any developer) a deterministic catalog of what each component looks like in every state — eliminating arbitrary reinterpretation."
                        links={[
                          { label: "Why Storybook?", href: "https://storybook.js.org/docs/get-started/why-storybook" },
                          { label: "Visual testing handbook — introduction", href: "https://storybook.js.org/tutorials/visual-testing-handbook/react/en/introduction/" },
                        ]}
                      />
                    </div>
            
                    {/* Category 4 */}
                    <div className="flex flex-col gap-[10px]">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--field-supporting)]">4 — Production systems at scale: companies already running this architecture</p>
            
                      <EvidenceCard
                        badge="Production design system"
                        badgeColor="#5c5c5c"
                        title="Shopify Polaris — tokens + components at scale"
                        what="One of the world's most mature and publicly auditable design systems. Powers every Shopify admin interface. The codebase is fully open source and its architecture mirrors exactly what this strategy proposes."
                        says="Components are the reusable building blocks for creating Shopify admin experiences. The Box component is the most primitive layout component and serves as a way to access Polaris design tokens. Experiences are consistently applied wherever they appear across Shopify."
                        why="Polaris is a real-world proof of concept at scale. Every component traces back to a token. Drift is structurally impossible — there is no 'reinterpret this button color' because the button component is bound to a token, which has exactly one value. The repository is publicly auditable: polaris-tokens → polaris-react, tokens-first."
                        links={[
                          { label: "Polaris components — get started", href: "https://polaris-react.shopify.com/components/get-started" },
                          { label: "GitHub — Shopify/polaris (open source)", href: "https://github.com/Shopify/polaris" },
                        ]}
                      />
            
                      <EvidenceCard
                        badge="Production design system"
                        badgeColor="#5c5c5c"
                        title="Google Material Design 3 — tokens as building blocks"
                        what="Google's design system, used across all Google products. M3 was rebuilt specifically around a token-first architecture — their own evolution from M2 to M3 is a case study in migrating to this exact approach."
                        says="Design tokens are the building blocks of all UI elements, and the same tokens are used in designs, tools, and code. A design token represents a small, reusable design decision that's part of a design system's visual style, and tokens replace static values with self-explanatory names."
                        why="If the world's most-used design system rebuilt itself around a token-first, component-reuse architecture, that is the strongest possible market signal that this is the correct approach — not a hypothesis."
                        links={[
                          { label: "Material Design 3 — design tokens", href: "https://m3.material.io/foundations/design-tokens" },
                        ]}
                      />
                    </div>
            
                    {/* Honest counterpoint */}
                    <div className="flex flex-col gap-[10px]">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#d32f2f]">Honest counterpoint — the problem is publicly recognized</p>
            
                      <div className="rounded-md border border-[#d32f2f26] overflow-hidden">
                        <div className="bg-[#d32f2f08] border-b border-[#d32f2f26] px-[14px] py-[10px] flex items-center gap-[8px]">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#d32f2f] bg-[#d32f2f15] px-[7px] py-[2px] rounded-full">Community forum</span>
                          <span className="text-[13px] font-semibold text-[var(--foreground)]">Figma official forum — "MCP server code generation is inconsistent"</span>
                        </div>
                        <div className="px-[14px] py-[12px] flex flex-col gap-[8px]">
                          <p className="text-[13px] text-[var(--field-supporting)] leading-[1.6]">
                            <strong className="text-[var(--foreground)]">What it is:</strong> A thread in Figma's own community forum where users report that the MCP server produces inconsistent component code across sessions — different implementations for the same component in different runs.
                          </p>
                          <p className="text-[13px] text-[var(--field-supporting)] leading-[1.6]">
                            <strong className="text-[var(--foreground)]">Why it's included:</strong> This is not a criticism of Figma — it is an honest acknowledgment that the problem our strategy solves is real and publicly recognized, not an internal perception. The inconsistency reported is exactly what happens without Code Connect and a component library: the AI reads the visual design and reinterprets it each time. The thread itself validates the need for this architecture.
                          </p>
                          <ExtLink href="https://forum.figma.com/share-your-feedback-26/figma-mcp-server-code-generation-is-inconsistent-52119">
                            Read the thread — Figma community forum
                          </ExtLink>
                        </div>
                      </div>
                    </div>
            
                    <div className="bg-[var(--field-bg)] border border-[var(--field-border)] rounded-md px-[16px] py-[12px]">
                      <p className="text-[12px] text-[var(--field-supporting)] leading-[1.6]">
                        Every source above is publicly accessible. The combination of an open W3C standard, official documentation from Figma and Anthropic, production systems from Google and Shopify, and 84% industry adoption data removes any ambiguity: this is not an experimental bet — it is the established approach that the industry has converged on.
                      </p>
                    </div>
            
                  </DocSection>
          </>
        )}

        {tab === "progress" && <ProgressTab />}

      </div>
    </div>
  )
}

// ── Button Page ────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "tertiary" | "warning" | "positive" | "main"
type BtnSize    = "sm" | "default" | "lg"
type BtnIcon    = "none" | "left" | "right" | "alone"

function ButtonPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,      setTab]      = useState<"overview" | "playground" | "reference">("overview")
  const [variant,  setVariant]  = useState<BtnVariant>("primary")
  const [size,     setSize]     = useState<BtnSize>("default")
  const [pill,     setPill]     = useState(false)
  const [iconPos,  setIconPos]  = useState<BtnIcon>("none")
  const [disabled, setDisabled] = useState(false)

  const icon = iconPos !== "none" ? <PlusIcon /> : undefined
  const iconPosition = iconPos === "none" ? undefined : iconPos as "left" | "right" | "alone"

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Button</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            6 variants to communicate action hierarchy. Each one signals a different level of visual weight and semantic intent.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("button")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",    label: "Overview"   },
          { id: "playground",  label: "Playground" },
          { id: "reference",   label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">
        {tab === "overview" && (
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-[16px] font-semibold text-[var(--foreground)]">When to use each variant</h2>
            <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 xl:grid-cols-3">
              {BUTTON_USAGE.map(u => <UsageCard key={u.variant} name={u.variant} color={u.color} use={u.use} avoid={u.avoid} />)}
            </div>
          </div>
        )}

        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup label="Variant" options={[{label:"Primary",value:"primary"},{label:"Secondary",value:"secondary"},{label:"Tertiary",value:"tertiary"},{label:"Warning",value:"warning"},{label:"Positive",value:"positive"},{label:"Main",value:"main"}]} value={variant} onChange={setVariant} />
              <CtrlGroup label="Size"    options={[{label:"S — 27px",value:"sm"},{label:"M — 40px",value:"default"},{label:"L — 52px",value:"lg"}]} value={size} onChange={setSize} />
              <CtrlGroup label="Icon"    options={[{label:"None",value:"none"},{label:"Left",value:"left"},{label:"Right",value:"right"},{label:"Alone",value:"alone"}]} value={iconPos} onChange={setIconPos} />
              <CtrlToggle label="Pill"     value={pill}     onChange={setPill} />
              <CtrlToggle label="Disabled" value={disabled} onChange={setDisabled} />
            </div>
            <div className="flex items-center justify-center min-h-[80px] rounded-md border border-[var(--field-border)] border-dashed">
              <Button variant={variant} size={size} pill={pill} icon={icon} iconPosition={iconPosition} disabled={disabled}>
                {iconPos !== "alone" ? "Label" : undefined}
              </Button>
            </div>
          </div>
        )}

        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">
            <Row label="All variants — M, no icon">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="positive">Positive action</Button>
              <Button variant="main">Main Action</Button>
            </Row>
            <Row label="Sizes — S / M / L">
              <Button variant="primary" size="sm">Label S</Button>
              <Button variant="primary" size="default">Label M</Button>
              <Button variant="primary" size="lg">Label L</Button>
              <Button variant="main" size="sm">Label S</Button>
              <Button variant="main" size="default">Label M</Button>
              <Button variant="main" size="lg">Label L</Button>
            </Row>
            <Row label="Pill=Yes">
              <Button variant="primary" pill>Primary</Button>
              <Button variant="secondary" pill>Secondary</Button>
              <Button variant="tertiary" pill>Tertiary</Button>
              <Button variant="warning" pill>Warning</Button>
              <Button variant="positive" pill>Positive</Button>
              <Button variant="main" pill>Main Action</Button>
            </Row>
            <Row label="Icon left / right">
              <Button variant="primary" icon={<PlusIcon />} iconPosition="left">Label</Button>
              <Button variant="secondary" icon={<PlusIcon />} iconPosition="left">Label</Button>
              <Button variant="main" icon={<PlusIcon />} iconPosition="left">Label</Button>
              <Button variant="primary" icon={<ArrowIcon />} iconPosition="right">Label</Button>
              <Button variant="main" icon={<ArrowIcon />} iconPosition="right">Label</Button>
            </Row>
            <Row label="Icon=Alone — S / M / L">
              <Button variant="primary" icon={<PlusIcon />} iconPosition="alone" size="sm" />
              <Button variant="primary" icon={<PlusIcon />} iconPosition="alone" size="default" />
              <Button variant="primary" icon={<PlusIcon />} iconPosition="alone" size="lg" />
              <Button variant="secondary" icon={<PlusIcon />} iconPosition="alone" size="default" />
              <Button variant="main" icon={<PlusIcon />} iconPosition="alone" size="default" />
            </Row>
            <Row label="Disabled — all variants">
              <Button variant="primary" disabled>Primary</Button>
              <Button variant="secondary" disabled>Secondary</Button>
              <Button variant="tertiary" disabled>Tertiary</Button>
              <Button variant="warning" disabled>Warning</Button>
              <Button variant="positive" disabled>Positive</Button>
              <Button variant="main" disabled>Main Action</Button>
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Input Page ─────────────────────────────────────────────────────────────

type InpState = "default" | "error" | "success" | "alert"

function getSupportingText(state: InpState | "default"): string {
  switch (state) {
    case "error":   return "This field is required"
    case "success": return "Verified successfully"
    case "alert":   return "Please review this value"
    default:        return "Supporting text"
  }
}

function InputPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,         setTab]         = useState<"overview" | "playground" | "reference">("overview")
  const [inpState,    setInpState]    = useState<InpState>("default")
  const [inpSize,     setInpSize]     = useState<"sm" | "default">("default")
  const [showLabel,   setShowLabel]   = useState(true)
  const [showSupport, setShowSupport] = useState(true)
  const [showLeft,    setShowLeft]    = useState(false)
  const [showRight,   setShowRight]   = useState(false)
  const [inpDisabled, setInpDisabled] = useState(false)

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Input · Text Field</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Single-line text field for short values: names, emails, codes, search queries. 2 sizes, 5 validation states, optional leading and trailing icon slots.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("input")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">
        {tab === "overview" && (
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-[16px] font-semibold text-[var(--foreground)]">When to use each state</h2>
            <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 xl:grid-cols-3">
              {INPUT_USAGE.map(u => <UsageCard key={u.state} name={u.state} color={u.color} use={u.use} avoid={u.avoid} />)}
            </div>
          </div>
        )}

        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup label="State"      options={[{label:"Default",value:"default"},{label:"Error",value:"error"},{label:"Success",value:"success"},{label:"Alert",value:"alert"}]} value={inpState} onChange={setInpState} />
              <CtrlGroup label="Size"       options={[{label:"S — 32px",value:"sm"},{label:"M — 40px",value:"default"}]} value={inpSize} onChange={setInpSize} />
              <CtrlToggle label="Label"      value={showLabel}   onChange={setShowLabel} />
              <CtrlToggle label="Supporting" value={showSupport} onChange={setShowSupport} />
              <CtrlToggle label="Left icon"  value={showLeft}    onChange={setShowLeft} />
              <CtrlToggle label="Right icon" value={showRight}   onChange={setShowRight} />
              <CtrlToggle label="Disabled"   value={inpDisabled} onChange={setInpDisabled} />
            </div>
            <div className="flex items-center justify-center min-h-[120px] rounded-md border border-[var(--field-border)] border-dashed px-[40px]">
              <div className="w-full max-w-[320px]">
                <Input
                  state={inpState} size={inpSize}
                  label={showLabel ? "Label" : undefined}
                  supportingText={showSupport ? getSupportingText(inpState) : undefined}
                  leftIcon={showLeft ? <SearchIcon /> : undefined}
                  rightIcon={showRight ? <CloseIcon /> : undefined}
                  disabled={inpDisabled}
                  placeholder="Placeholder"
                />
              </div>
            </div>
          </div>
        )}

        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">
            <Row label="All states — with label and supporting text">
              {(["default","error","success","alert"] as InpState[]).map(s => (
                <div key={s} className="w-[220px]">
                  <Input label="Label" placeholder="Placeholder" supportingText={getSupportingText(s)} state={s} />
                </div>
              ))}
              <div className="w-[220px]">
                <Input label="Label" placeholder="Placeholder" supportingText="Supporting text" disabled />
              </div>
            </Row>
            <Row label="Sizes — S / M">
              <div className="w-[220px]"><Input size="sm"      label="Label" placeholder="Placeholder" /></div>
              <div className="w-[220px]"><Input size="default" label="Label" placeholder="Placeholder" /></div>
            </Row>
            <Row label="With icons">
              <div className="w-[260px]">
                <Input label="Label" placeholder="Search…" leftIcon={<SearchIcon />} rightIcon={<CloseIcon />} supportingText="3 results found" state="success" />
              </div>
              <div className="w-[260px]">
                <Input label="Label" placeholder="user@example.com" leftIcon={<SearchIcon />} state="error" supportingText="Invalid email address" />
              </div>
            </Row>
            <Row label="Without label">
              <div className="w-[220px]"><Input placeholder="Placeholder" state="default" /></div>
              <div className="w-[220px]"><Input placeholder="Placeholder" state="error" supportingText="Required field" /></div>
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Text Description page ──────────────────────────────────────────────────

function TextareaPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,          setTab]          = useState<"playground" | "reference">("playground")
  const [taState,      setTaState]      = useState<InpState>("default")
  const [showLabel,    setShowLabel]    = useState(true)
  const [showSupport,  setShowSupport]  = useState(true)
  const [showCount,    setShowCount]    = useState(true)
  const [taExpand,     setTaExpand]     = useState(false)
  const [taScrollable, setTaScrollable] = useState(true)
  const [taValue,      setTaValue]      = useState("")
  const [taDisabled,   setTaDisabled]   = useState(false)

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Text Description</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Multi-line text field for paragraphs, descriptions, notes, prompts and any free text longer than one sentence. Shares the same 5 validation states as Input. Supports auto-grow (<strong className="text-[var(--foreground)]">Expand Content</strong>), fixed height with scroll (<strong className="text-[var(--foreground)]">ScrollBar</strong>), and character count (<strong className="text-[var(--foreground)]">Feedback Characters</strong>).
          </p>
        </div>
        <SpecButton onClick={() => openSpec("textarea")} />
      </div>

      <TabBar
        tabs={[
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">
        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup label="State"          options={[{label:"Default",value:"default"},{label:"Error",value:"error"},{label:"Success",value:"success"},{label:"Alert",value:"alert"}]} value={taState} onChange={setTaState} />
              <CtrlToggle label="Label"          value={showLabel}    onChange={setShowLabel} />
              <CtrlToggle label="Supporting"     value={showSupport}  onChange={setShowSupport} />
              <CtrlToggle label="Char count"     value={showCount}    onChange={setShowCount} />
              <CtrlToggle label="Expand Content" value={taExpand}     onChange={v => {
                setTaExpand(v)
                if (v) {
                  setTaScrollable(false)
                  setTaValue("This field grows with its content.\nAdd more lines and it will keep expanding — no scroll needed.\nThis is the Expand Content behavior from the DS.")
                }
              }} />
              <CtrlToggle label="Scrollable"     value={taScrollable} onChange={v => { setTaScrollable(v); if (v) setTaExpand(false) }} />
              <CtrlToggle label="Disabled"       value={taDisabled}   onChange={setTaDisabled} />
            </div>
            <div className="flex items-center justify-center min-h-[240px] rounded-md border border-[var(--field-border)] border-dashed px-[40px] py-[20px]">
              <div className="w-full max-w-[400px]">
                <Textarea
                  state={taState}
                  label={showLabel ? "Label" : undefined}
                  placeholder="Placeholder..."
                  supportingText={showSupport ? getSupportingText(taState) : undefined}
                  showCount={showCount}
                  expand={taExpand}
                  scrollable={taScrollable}
                  maxLength={300}
                  disabled={taDisabled}
                  value={taValue}
                  onChange={e => setTaValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">
            <Row label="All states — with label and supporting text">
              {(["default","error","success","alert"] as InpState[]).map(s => (
                <div key={s} className="w-[260px]">
                  <Textarea label="Label" placeholder="Placeholder..." supportingText={getSupportingText(s)} state={s} rows={4} />
                </div>
              ))}
              <div className="w-[260px]">
                <Textarea label="Label" placeholder="Placeholder..." supportingText="Supporting text" disabled rows={4} />
              </div>
            </Row>
            <Row label="Without label — no floating label">
              <div className="w-[260px]">
                <Textarea placeholder="Placeholder..." state="default" rows={4} />
              </div>
              <div className="w-[260px]">
                <Textarea placeholder="Placeholder..." state="error" supportingText="Required field" rows={4} />
              </div>
            </Row>
            <Row label="Feedback Characters — char count below the field (DS: Feedback Characters = true)">
              <div className="w-[300px]">
                <Textarea label="Label" placeholder="Placeholder..." showCount maxLength={150} rows={4} />
              </div>
              <div className="w-[300px]">
                <Textarea label="Label" placeholder="Placeholder..." showCount maxLength={150} rows={4} state="error" supportingText="Content exceeds the recommended length" />
              </div>
            </Row>
            <Row label="Expand Content — auto-grows with content (DS: Expand Content = true)">
              <div className="w-[400px]">
                <Textarea
                  label="Label"
                  placeholder="Start typing — the field grows automatically..."
                  expand
                  showCount
                  maxLength={500}
                />
              </div>
            </Row>
            <Row label="ScrollBar — fixed height, scrollable (DS: ScrollBar = true)">
              <div className="w-[400px]">
                <Textarea
                  label="Label"
                  placeholder="Placeholder..."
                  scrollable
                  showCount
                  maxLength={500}
                  supportingText="Content overflows → scrollbar appears"
                  defaultValue={`Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7 — content overflows here\nLine 8\nLine 9`}
                />
              </div>
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Card Container Page ────────────────────────────────────────────────────

const CARD_STYLES: { variant: CardVariant; label: string; color: string }[] = [
  { variant: "default",      label: "Default",     color: "#bababa"  },
  { variant: "whiteOpacity", label: "White Opacity",color: "#bababa"  },
  { variant: "primary",      label: "Primary",     color: "#2173ff"  },
  { variant: "green",        label: "Green",       color: "#00a07e"  },
  { variant: "reed",         label: "Reed",        color: "#d32f2f"  },
  { variant: "orange",       label: "Orange",      color: "#ed6c02"  },
  { variant: "yellow",       label: "Yellow",      color: "#663c00"  },
  { variant: "purple",       label: "Purple",      color: "#7b27ed"  },
  { variant: "lightBlue",    label: "Light Blue",  color: "#00b5d9"  },
  { variant: "limeGreen",    label: "Lime Green",  color: "#a0da1d"  },
  { variant: "dashed",       label: "Dashed",      color: "#bababa"  },
]

const CARD_USAGE = [
  {
    variant: "Default / White Opacity",
    color: "#bababa",
    use:   ["General-purpose grouping with no semantic meaning.", "Dashboard sections, settings panels, sidebar modules."],
    avoid: ["When the content carries a specific status — use a semantic color instead."],
  },
  {
    variant: "Primary",
    color: "#2173ff",
    use:   ["Highlight a selected item, active plan, or recommended option.", "Key metric cards that deserve extra visual weight."],
    avoid: ["Using as a general background — reserve for intentional emphasis."],
  },
  {
    variant: "Green",
    color: "#00a07e",
    use:   ["Success state cards: completed tasks, healthy metrics, passed checks.", "Positive trend or achievement summary."],
    avoid: ["Cards that have nothing to do with success or completion."],
  },
  {
    variant: "Reed (Red)",
    color: "#d32f2f",
    use:   ["Error or critical alert cards: failed operations, blocked items.", "Destructive-action confirmation areas."],
    avoid: ["Warning information — use Orange instead."],
  },
  {
    variant: "Orange / Yellow",
    color: "#ed6c02",
    use:   ["Warning cards: needs attention, expiring soon, non-critical issues.", "Informational callouts that aren't errors."],
    avoid: ["Critical errors — use Reed/Red."],
  },
  {
    variant: "Dashed",
    color: "var(--field-border)",
    use:   ["Empty states, placeholder slots, 'add new' drop zones.", "Areas waiting for user content."],
    avoid: ["Content that has already been filled — swap to a solid variant."],
  },
]

function CardContainerPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,      setTab]      = useState<"overview" | "playground" | "reference">("overview")
  const [variant,  setVariant]  = useState<CardVariant>("default")
  const [size,     setSize]     = useState<"sm" | "default" | "lg">("default")
  const [selected, setSelected] = useState(false)
  const [disabled, setDisabled] = useState(false)

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Card Container</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Semantic container for grouping related content. 11 color styles communicate intent — neutral, primary, status (success / error / warning), or categorical. Supports selected and disabled states for card-based selection UI.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("card-container")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">
        {tab === "overview" && (
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-[16px] font-semibold text-[var(--foreground)]">When to use each style</h2>
            <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 xl:grid-cols-3">
              {CARD_USAGE.map(u => (
                <UsageCard key={u.variant} name={u.variant} color={u.color} use={u.use} avoid={u.avoid} />
              ))}
            </div>
          </div>
        )}

        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="Style"
                options={CARD_STYLES.map(s => ({ label: s.label, value: s.variant }))}
                value={variant}
                onChange={setVariant}
              />
              <CtrlGroup
                label="Size"
                options={[
                  { label: "S — 12px pad", value: "sm" as const },
                  { label: "M — 16/24px pad", value: "default" as const },
                  { label: "L — 24px pad", value: "lg" as const },
                ]}
                value={size}
                onChange={setSize}
              />
              <CtrlToggle label="Selected" value={selected} onChange={setSelected} />
              <CtrlToggle label="Disabled" value={disabled} onChange={setDisabled} />
            </div>
            <div className="flex items-center justify-center min-h-[160px] rounded-md border border-[var(--field-border)] border-dashed px-[40px]">
              <div className="w-full max-w-[400px]">
                <CardContainer variant={variant} size={size} selected={selected} disabled={disabled}>
                  <p className="text-[14px] font-medium text-[var(--foreground)]">Card title</p>
                  <p className="text-[13px] text-[var(--field-supporting)] mt-[4px]">
                    Content inside the card container. Swap the style, size, and state controls to preview all combinations.
                  </p>
                </CardContainer>
              </div>
            </div>
          </div>
        )}

        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">
            <Row label="All styles — size M">
              {CARD_STYLES.map(s => (
                <div key={s.variant} className="w-[180px]">
                  <CardContainer variant={s.variant}>
                    <p className="text-[12px] font-semibold text-[var(--foreground)] mb-[2px]">{s.label}</p>
                    <p className="text-[11px] text-[var(--field-supporting)]">Default state</p>
                  </CardContainer>
                </div>
              ))}
            </Row>

            <Row label="Selected state — all styles">
              {CARD_STYLES.filter(s => s.variant !== "dashed").map(s => (
                <div key={s.variant} className="w-[180px]">
                  <CardContainer variant={s.variant} selected>
                    <p className="text-[12px] font-semibold text-[var(--foreground)] mb-[2px]">{s.label}</p>
                    <p className="text-[11px] text-[var(--field-supporting)]">Selected</p>
                  </CardContainer>
                </div>
              ))}
            </Row>

            <Row label="Sizes — Default variant">
              <div className="flex flex-col gap-[8px] w-full max-w-[360px]">
                <CardContainer size="sm">
                  <p className="text-[12px] font-semibold text-[var(--foreground)]">Size S · 12px padding · radius 8px</p>
                </CardContainer>
                <CardContainer size="default">
                  <p className="text-[12px] font-semibold text-[var(--foreground)]">Size M · 16px H / 24px V · radius 8px</p>
                  <p className="text-[11px] text-[var(--field-supporting)] mt-[4px]">Default size — use for most content groupings.</p>
                </CardContainer>
                <CardContainer size="lg">
                  <p className="text-[12px] font-semibold text-[var(--foreground)]">Size L · 24px padding · radius 16px</p>
                  <p className="text-[11px] text-[var(--field-supporting)] mt-[4px]">Use for featured or prominent sections.</p>
                </CardContainer>
              </div>
            </Row>

            <Row label="Disabled state">
              {(["default", "primary", "green", "reed"] as CardVariant[]).map(v => (
                <div key={v} className="w-[180px]">
                  <CardContainer variant={v} disabled>
                    <p className="text-[12px] font-semibold text-[var(--foreground)] mb-[2px] capitalize">{v}</p>
                    <p className="text-[11px] text-[var(--field-supporting)]">Disabled</p>
                  </CardContainer>
                </div>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tag Page ───────────────────────────────────────────────────────────────

const TAG_VARIANTS: { variant: TagVariant; label: string }[] = [
  { variant: "success",    label: "Success"    },
  { variant: "error",      label: "Error"      },
  { variant: "alert",      label: "Alert"      },
  { variant: "informative",label: "Informative"},
  { variant: "primary",    label: "Primary"    },
  { variant: "secondary",  label: "Secondary"  },
  { variant: "limeGreen",  label: "Lime Green" },
  { variant: "yellow",     label: "Yellow"     },
  { variant: "purple",     label: "Purple"     },
  { variant: "lightBlue",  label: "Light Blue" },
  { variant: "neutral",    label: "Neutral"    },
]

// ── Typography data ───────────────────────────────────────────────────────
// DS source: Figma text styles (v6rmYKA2zmyXWOahlxLOeI)
// Mapped to Tailwind custom scale defined in tailwind.config.js

type TypeStyleDef = {
  dsName:        string
  category:      string
  size:          string
  lineHeight:    string
  weight:        string
  letterSpacing?: string
  tailwind:      string
  isLink?:       boolean
}

const TYPOGRAPHY_STYLES: TypeStyleDef[] = [
  // Display
  { dsName:"Display NEW/XL/Black",    category:"Display",  size:"48px", lineHeight:"auto", weight:"Black (900)",      tailwind:"text-type-5xl font-black"                    },
  { dsName:"Display NEW/L/ExtraBold", category:"Display",  size:"40px", lineHeight:"auto", weight:"Extra Bold (800)", tailwind:"text-type-4xl font-extrabold"                },
  { dsName:"Display NEW/M/Bold",      category:"Display",  size:"32px", lineHeight:"auto", weight:"Bold (700)",       tailwind:"text-type-3xl font-bold"                     },
  // Title
  { dsName:"Title NEW/L", category:"Title", size:"24px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-2xl font-semibold" },
  { dsName:"Title NEW/M", category:"Title", size:"20px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-xl font-semibold"  },
  { dsName:"Title NEW/S", category:"Title", size:"18px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-lg font-semibold"  },
  // Subtitle
  { dsName:"Subtitle NEW/L", category:"Subtitle", size:"18px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-lg font-semibold"   },
  { dsName:"Subtitle NEW/M", category:"Subtitle", size:"16px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-md font-semibold"   },
  { dsName:"Subtitle NEW/S", category:"Subtitle", size:"14px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-base font-semibold" },
  // Body
  { dsName:"Body NEW/L", category:"Body", size:"16px", lineHeight:"24px", weight:"Medium (500)", tailwind:"text-type-md font-regular leading-[24px]"   },
  { dsName:"Body NEW/M", category:"Body", size:"14px", lineHeight:"20px", weight:"Medium (500)", tailwind:"text-type-base font-regular leading-[20px]" },
  { dsName:"Body NEW/S", category:"Body", size:"12px", lineHeight:"20px", weight:"Medium (500)", tailwind:"text-type-sm font-regular leading-[20px]"   },
  // Label
  { dsName:"Label NEW/L", category:"Label", size:"16px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-md font-semibold"   },
  { dsName:"Label NEW/M", category:"Label", size:"14px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-base font-semibold" },
  { dsName:"Label NEW/S", category:"Label", size:"12px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-sm font-semibold"   },
  // Caption
  { dsName:"Caption NEW/M/Bold",     category:"Caption", size:"14px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-base font-semibold"                          },
  { dsName:"Caption NEW/S/Bold",     category:"Caption", size:"12px", lineHeight:"auto", weight:"Semi Bold (600)", letterSpacing:"0.04em", tailwind:"text-type-sm font-semibold tracking-[0.04em]"  },
  { dsName:"Caption NEW/S/Regular",  category:"Caption", size:"12px", lineHeight:"auto", weight:"Medium (500)",    letterSpacing:"0.04em", tailwind:"text-type-sm font-regular tracking-[0.04em]"   },
  { dsName:"Caption NEW/XS/Bold",    category:"Caption", size:"10px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-xs font-semibold"                          },
  { dsName:"Caption NEW/XS/Regular", category:"Caption", size:"10px", lineHeight:"auto", weight:"Medium (500)",    tailwind:"text-type-xs font-regular"                           },
  // Link
  { dsName:"Link NEW/L/Regular", category:"Link", size:"16px", lineHeight:"auto", weight:"Medium (500)",    tailwind:"text-type-md font-regular underline",   isLink:true },
  { dsName:"Link NEW/L/Bold",    category:"Link", size:"16px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-md font-semibold underline",  isLink:true },
  { dsName:"Link NEW/M/Regular", category:"Link", size:"14px", lineHeight:"auto", weight:"Medium (500)",    tailwind:"text-type-base font-regular underline", isLink:true },
  { dsName:"Link NEW/M/Bold",    category:"Link", size:"14px", lineHeight:"auto", weight:"Semi Bold (600)", tailwind:"text-type-base font-semibold underline",isLink:true },
  { dsName:"Link NEW/S/Regular", category:"Link", size:"12px", lineHeight:"auto", weight:"Medium (500)",    tailwind:"text-type-sm font-regular underline",   isLink:true },
]

// ── Color data ────────────────────────────────────────────────────────────
// DS source: Figma variable collections (v6rmYKA2zmyXWOahlxLOeI)
//   Primitives Tokens (189 vars)  · Semantic Color Tokens (162 vars)

type PaletteSwatch  = { scale: string; hex: string; hexDark?: string }
type ColorPalette   = { id: string; label: string; swatches: PaletteSwatch[] }
type SemanticToken  = { name: string; light: string | null; dark: string | null }
type SemanticGroup  = { label: string; tokens: SemanticToken[] }

const PRIMITIVE_PALETTES: ColorPalette[] = [
  { id:"primary",  label:"Primary",
    swatches:[{scale:"100",hex:"#f6f9ff"},{scale:"200",hex:"#e9f1ff"},{scale:"400",hex:"#80afff"},{scale:"500",hex:"#2173ff"},{scale:"700",hex:"#002f80"},{scale:"900",hex:"#001740"}] },
  { id:"gray",     label:"Gray — Neutral",
    swatches:[
      {scale:"100",hex:"#ffffff",  hexDark:"#131c2e"},{scale:"200",hex:"#fafafa",hexDark:"#0f172b"},
      {scale:"300",hex:"#f2f2f2",  hexDark:"#19263d"},{scale:"400",hex:"#d9d9d9",hexDark:"#243551"},
      {scale:"500",hex:"#bababa",  hexDark:"#374e6e"},{scale:"600",hex:"#5c5c5c",hexDark:"#8899b0"},
      {scale:"700",hex:"#2a2a2a",  hexDark:"#b8cade"},{scale:"900",hex:"#000000",hexDark:"#e5eef8"},
    ]},
  { id:"red",      label:"Red — Error",
    swatches:[{scale:"100",hex:"#fdeded"},{scale:"200",hex:"#ea9191"},{scale:"300",hex:"#cc5252"},{scale:"400",hex:"#d32f2f"},{scale:"500",hex:"#992222"},{scale:"900",hex:"#5f2120"}] },
  { id:"green",    label:"Green — Success",
    swatches:[{scale:"100",hex:"#e5fdf8"},{scale:"200",hex:"#cbfff4"},{scale:"400",hex:"#00d9aa"},{scale:"500",hex:"#00a07e"},{scale:"700",hex:"#00765f"},{scale:"900",hex:"#003328"}] },
  { id:"orange",   label:"Orange",
    swatches:[{scale:"100",hex:"#fff4e5"},{scale:"300",hex:"#edc6a6"},{scale:"400",hex:"#ed9f5f"},{scale:"500",hex:"#ed6c02"},{scale:"700",hex:"#8f4201"},{scale:"900",hex:"#663c00"}] },
  { id:"yellow",   label:"Yellow",
    swatches:[{scale:"100",hex:"#fffaf0"},{scale:"200",hex:"#ffebcb"},{scale:"300",hex:"#ffd285"},{scale:"400",hex:"#ffb344"},{scale:"500",hex:"#ff9900"},{scale:"900",hex:"#5c3500"}] },
  { id:"lime",     label:"Lime Green",
    swatches:[{scale:"100",hex:"#f9fee5"},{scale:"200",hex:"#e7f9b5"},{scale:"300",hex:"#d4f381"},{scale:"400",hex:"#bdee49"},{scale:"500",hex:"#a0da1d"},{scale:"900",hex:"#3e5c0a"}] },
  { id:"purple",   label:"Purple",
    swatches:[{scale:"100",hex:"#f3e9fd"},{scale:"200",hex:"#e4cefc"},{scale:"300",hex:"#cfa7f9"},{scale:"400",hex:"#b070f5"},{scale:"500",hex:"#7b27ed"},{scale:"900",hex:"#2c075c"}] },
  { id:"lightblue",label:"Light Blue",
    swatches:[{scale:"100",hex:"#e5f8ff"},{scale:"200",hex:"#ccf1ff"},{scale:"300",hex:"#99e5f9"},{scale:"400",hex:"#66d8f5"},{scale:"500",hex:"#00b5d9"},{scale:"900",hex:"#02445a"}] },
]

const SEMANTIC_GROUPS: SemanticGroup[] = [
  { label:"Text", tokens:[
    {name:"Text/Title",              light:"#000000",   dark:"#ffffffcc"},
    {name:"Text/Subtitle",           light:"#2a2a2a",   dark:"#ffffff99"},
    {name:"Text/Body",               light:"#5c5c5c",   dark:"#ffffff99"},
    {name:"Text/Caption",            light:"#5c5c5c",   dark:"#ffffff80"},
    {name:"Text/Label",              light:"#2a2a2a",   dark:"#ffffff99"},
    {name:"Text/Negative",           light:"#ffffff",   dark:"#ffffff"},
    {name:"Text/Disabled",           light:"#bababa",   dark:"#ffffff4d"},
    {name:"Text/Link",               light:"#2173ff",   dark:"#2b7fff"},
    {name:"Text/Info",               light:"#001740",   dark:"#ffffffcc"},
    {name:"Text/Error",              light:"#5f2120",   dark:"#ff6467"},
    {name:"Text/Alert",              light:"#663c00",   dark:"#fcd34d"},
    {name:"Text/Success",            light:"#003328",   dark:"#6ee7b7"},
    {name:"Text/Yellow",             light:"#5c3500",   dark:"#fcd34d"},
    {name:"Text/LimeGreen",          light:"#3e5c0a",   dark:"#bdee49"},
    {name:"Text/Purple",             light:"#2c075c",   dark:"#d8b4fe"},
    {name:"Text/Light Blue",         light:"#02445a",   dark:"#7dd3fc"},
  ]},
  { label:"Surface — Neutral", tokens:[
    {name:"Surface/Neutral/White",   light:"#ffffff",   dark:"#ffffff1a"},
    {name:"Surface/Neutral/Subtle",  light:"#fafafa",   dark:"#ffffff0d"},
    {name:"Surface/Neutral/Default", light:"#f2f2f2",   dark:"#ffffff14"},
    {name:"Surface/Neutral/Emphasis",light:"#d9d9d9",   dark:"#ffffff33"},
    {name:"Surface/Neutral/Focus",   light:"#bababa",   dark:"#ffffff26"},
    {name:"Surface/Neutral/Darker",  light:"#2a2a2a",   dark:"#ffffff33"},
    {name:"Surface/Neutral/Black",   light:"#000000",   dark:"#0f172b"},
    {name:"Surface/Neutral/Inverse", light:"#ffffff",   dark:"#ffffff"},
    {name:"Surface/Floating/Default",light:"#ffffffeb", dark:"#141b2ad9"},
    {name:"Surface/Modal/Default",   light:"#ffffff",   dark:"#0c0e22d1"},
  ]},
  { label:"Surface — Primary", tokens:[
    {name:"Surface/Primary/More Subtle",light:"#f6f9ff",  dark:"#2b7fff14"},
    {name:"Surface/Primary/Subtle",     light:"#e9f1ff",  dark:"#155dfc26"},
    {name:"Surface/Primary/Lighter",    light:"#80afff",  dark:"#1d2f4f"},
    {name:"Surface/Primary/Default",    light:"#2173ff",  dark:"#155dfc"},
    {name:"Surface/Primary/Emphasis",   light:"#002f80",  dark:"#2b7fff"},
    {name:"Surface/Primary/Darker",     light:"#001740",  dark:"#1032a0"},
  ]},
  { label:"Surface — Semantic", tokens:[
    {name:"Surface/Error/More Subtle",  light:"#fdeded",  dark:"#2d1515"},
    {name:"Surface/Error/Default",      light:"#992222",  dark:"#e05252"},
    {name:"Surface/Alert/More Subtle",  light:"#fff4e5",  dark:"#281e00"},
    {name:"Surface/Alert/Default",      light:"#ed6c02",  dark:"#fcd34d"},
    {name:"Surface/Success/More Subtle",light:"#e5fdf8",  dark:"#0a1f1a"},
    {name:"Surface/Success/Default",    light:"#00a07e",  dark:"#34d399"},
    {name:"Surface/Yellow/More Subtle", light:"#fffaf0",  dark:"#281e00"},
    {name:"Surface/Yellow/Default",     light:"#ff9900",  dark:"#f59e0b"},
    {name:"Surface/Lime Green/More Subtle",light:"#f9fee5",dark:"#111a04"},
    {name:"Surface/Lime Green/Default", light:"#a0da1d",  dark:"#bdee4933"},
    {name:"Surface/Purple/More Subtle", light:"#f3e9fd",  dark:"#120520"},
    {name:"Surface/Purple/Default",     light:"#7b27ed",  dark:"#ad46ff33"},
    {name:"Surface/Light Blue/More Subtle",light:"#e5f8ff",dark:"#071828"},
    {name:"Surface/Light Blue/Default", light:"#00b5d9",  dark:"#51a2ff33"},
  ]},
  { label:"Border — Neutral", tokens:[
    {name:"Border/Neutral/Lighter",    light:"#bababa",   dark:"#ffffff26"},
    {name:"Border/Neutral/Subtle",     light:"#f2f2f2",   dark:"#ffffff1a"},
    {name:"Border/Neutral/Default",    light:"#5c5c5c",   dark:"#ffffff1a"},
    {name:"Border/Neutral/Darker",     light:"#2a2a2a",   dark:"#ffffff33"},
    {name:"Border/Neutral/Black",      light:"#000000",   dark:"#ffffff4d"},
  ]},
  { label:"Border — Semantic", tokens:[
    {name:"Border/Primary/Default",    light:"#2173ff",   dark:"#2b7fff"},
    {name:"Border/Primary/Subtle",     light:null,        dark:"#1d2f4f"},
    {name:"Border/Error/Default",      light:"#992222",   dark:"#e05252"},
    {name:"Border/Error/Lighter",      light:"#d32f2f",   dark:"#fb2c36"},
    {name:"Border/Alert/Default",      light:"#ed6c02",   dark:"#fbbf24"},
    {name:"Border/Success/Default",    light:"#00a07e",   dark:"#00c9504d"},
    {name:"Border/Success/Lighter",    light:"#009978",   dark:"#34d399"},
    {name:"Border/Yellow/Default",     light:"#ed6c02",   dark:"#fbbf24"},
    {name:"Border/LimeGreen/Default",  light:"#a0da1d",   dark:"#84cc16"},
    {name:"Border/Purple/Default",     light:"#7b27ed",   dark:"#a855f7"},
    {name:"Border/Light Blue/Default", light:"#00b5d9",   dark:"#38bdf8"},
  ]},
  { label:"Icon", tokens:[
    {name:"Icon/Neutral/Light",        light:"#ffffff",   dark:"#ffffffb2"},
    {name:"Icon/Neutral/Dark",         light:"#5c5c5c",   dark:"#ffffff80"},
    {name:"Icon/Neutral/Black",        light:"#2a2a2a",   dark:"#ffffffb2"},
    {name:"Icon/Neutral/Disable-Dark", light:"#bababa",   dark:"#ffffff40"},
    {name:"Icon/Primary/Default",      light:"#2173ff",   dark:"#2b7fff"},
    {name:"Icon/Primary/Lighter",      light:"#80afff",   dark:"#80afffe5"},
    {name:"Icon/Error/Default",        light:"#992222",   dark:"#ff6467"},
    {name:"Icon/Alert/Default",        light:"#ed6c02",   dark:"#fcd34d"},
    {name:"Icon/Success/Default",      light:"#00a07e",   dark:"#6ee7b7"},
    {name:"Icon/Yellow/Default",       light:"#ff9900",   dark:"#fcd34d"},
    {name:"Icon/Lime Green/Default",   light:"#8bc417",   dark:"#bdee49"},
    {name:"Icon/Purple/Default",       light:"#7b27ed",   dark:"#d8b4fe"},
    {name:"Icon/Light Blue/Default",   light:"#00b5d9",   dark:"#7dd3fc"},
  ]},
  { label:"Badge", tokens:[
    {name:"Badge/Error",      light:"#d32f2f",  dark:"#ff6467"},
    {name:"Badge/Alert",      light:"#ed6c02",  dark:"#fcd34d"},
    {name:"Badge/In Progress",light:"#2173ff",  dark:"#2b7fff"},
    {name:"Badge/Success",    light:"#00765f",  dark:"#6ee7b7"},
    {name:"Badge/Neutral",    light:"#bababa",  dark:"#ffffff80"},
    {name:"Badge/Light Blue", light:"#00b5d9",  dark:"#7dd3fc"},
    {name:"Badge/Lime Green", light:"#a0da1d",  dark:"#bdee49"},
    {name:"Badge/Yellow",     light:"#ff9900",  dark:"#fcd34d"},
    {name:"Badge/Purple",     light:"#7b27ed",  dark:"#d8b4fe"},
  ]},
]

// ── Icon catalogue ────────────────────────────────────────────────────────
// DS source: Figma page "Icons" (v6rmYKA2zmyXWOahlxLOeI · node 2002:466)
// Material Design icons mapped 1-to-1 to Lucide equivalents.
// dsName  = canonical name used in the Figma DS
// lucide  = PascalCase export name in lucide-react

type IconDef      = { dsName: string; lucide: string }
type IconCategory = { id: string; number: string; label: string; icons: IconDef[] }

const ICON_CATEGORIES: IconCategory[] = [
  {
    id: "01-navigation", number: "01", label: "Navigation & Arrows",
    icons: [
      { dsName: "Chevron down",              lucide: "ChevronDown"       },
      { dsName: "Chevron up",                lucide: "ChevronUp"         },
      { dsName: "Chevron left",              lucide: "ChevronLeft"       },
      { dsName: "Chevron right",             lucide: "ChevronRight"      },
      { dsName: "Arrow left",                lucide: "ArrowLeft"         },
      { dsName: "Arrow right",               lucide: "ArrowRight"        },
      { dsName: "Arrow upward",              lucide: "ArrowUp"           },
      { dsName: "Arrow down",                lucide: "ArrowDown"         },
      { dsName: "Arrow outward",             lucide: "ArrowUpRight"      },
      { dsName: "Up-down arrow",             lucide: "ArrowUpDown"       },
      { dsName: "Home",                      lucide: "Home"              },
      { dsName: "Enter",                     lucide: "CornerDownLeft"    },
      { dsName: "Subdirectory Arrow Right",  lucide: "CornerDownRight"   },
    ],
  },
  {
    id: "02-actions", number: "02", label: "Actions & Editing",
    icons: [
      { dsName: "Plus",        lucide: "Plus"           },
      { dsName: "Close",       lucide: "X"              },
      { dsName: "Delete",      lucide: "Trash2"         },
      { dsName: "Edit",        lucide: "Pencil"         },
      { dsName: "Copy",        lucide: "Copy"           },
      { dsName: "Check",       lucide: "Check"          },
      { dsName: "Undo",        lucide: "Undo2"          },
      { dsName: "Swap",        lucide: "ArrowLeftRight" },
      { dsName: "Duplicate",   lucide: "CopyPlus"       },
      { dsName: "Save",        lucide: "Save"           },
      { dsName: "Share",       lucide: "Share2"         },
      { dsName: "Link off",    lucide: "Unlink"         },
      { dsName: "Done all",    lucide: "CheckCheck"     },
      { dsName: "Block",       lucide: "Ban"            },
      { dsName: "Stop",        lucide: "Square"         },
      { dsName: "Zoom in",     lucide: "ZoomIn"         },
      { dsName: "Zoom out",    lucide: "ZoomOut"        },
      { dsName: "Edit Square", lucide: "SquarePen"      },
    ],
  },
  {
    id: "03-text", number: "03", label: "Text Formatting",
    icons: [
      { dsName: "Bold",          lucide: "Bold"         },
      { dsName: "Italic",        lucide: "Italic"       },
      { dsName: "Strikethrough", lucide: "Strikethrough"},
      { dsName: "Link",          lucide: "Link"         },
      { dsName: "Numbered list", lucide: "ListOrdered"  },
      { dsName: "Bullet list",   lucide: "List"         },
      { dsName: "Align Left",    lucide: "AlignLeft"    },
      { dsName: "Align Center",  lucide: "AlignCenter"  },
      { dsName: "Align Right",   lucide: "AlignRight"   },
      { dsName: "Short text",    lucide: "WrapText"     },
    ],
  },
  {
    id: "04-communication", number: "04", label: "Communication & Media",
    icons: [
      { dsName: "Email",           lucide: "Mail"           },
      { dsName: "Call",            lucide: "Phone"          },
      { dsName: "SMS",             lucide: "MessageSquare"  },
      { dsName: "Contact Support", lucide: "Headphones"     },
      { dsName: "Mic",             lucide: "Mic"            },
      { dsName: "Send",            lucide: "Send"           },
      { dsName: "Call made",       lucide: "PhoneOutgoing"  },
      { dsName: "Call Received",   lucide: "PhoneIncoming"  },
      { dsName: "Call end",        lucide: "PhoneOff"       },
      { dsName: "Chat Bubble",     lucide: "MessageCircle"  },
      { dsName: "Image",           lucide: "Image"          },
      { dsName: "Pause",           lucide: "Pause"          },
      { dsName: "Play",            lucide: "Play"           },
      { dsName: "Live",            lucide: "Radio"          },
      { dsName: "Sound recording", lucide: "AudioWaveform"  },
    ],
  },
  {
    id: "05-files", number: "05", label: "Files & Documents",
    icons: [
      { dsName: "Import",            lucide: "Import"         },
      { dsName: "Notes",             lucide: "NotebookPen"    },
      { dsName: "Description",       lucide: "FileText"       },
      { dsName: "Archive",           lucide: "Archive"        },
      { dsName: "Download",          lucide: "Download"       },
      { dsName: "Folder",            lucide: "Folder"         },
      { dsName: "Folder Open",       lucide: "FolderOpen"     },
      { dsName: "Unarchive",         lucide: "ArchiveRestore" },
      { dsName: "File present",      lucide: "File"           },
      { dsName: "Note add",          lucide: "FilePlus"       },
      { dsName: "Inventory",         lucide: "Package"        },
      { dsName: "Attach file",       lucide: "Paperclip"      },
      { dsName: "Drive file move",   lucide: "FolderInput"    },
      { dsName: "Create new folder", lucide: "FolderPlus"     },
      { dsName: "New File",          lucide: "FilePlus2"      },
      { dsName: "Hard Drive",        lucide: "HardDrive"      },
      { dsName: "Data",              lucide: "Database"       },
      { dsName: "Article",           lucide: "Newspaper"      },
      { dsName: "Sticky note",       lucide: "StickyNote"     },
      { dsName: "Bookmark",          lucide: "Bookmark"       },
      { dsName: "Knowledge",         lucide: "BookOpen"       },
    ],
  },
  {
    id: "06-status", number: "06", label: "Status & Feedback",
    icons: [
      { dsName: "Info",                   lucide: "Info"            },
      { dsName: "Check circle",           lucide: "CheckCircle2"    },
      { dsName: "Warning",                lucide: "TriangleAlert"   },
      { dsName: "Error outline",          lucide: "AlertCircle"     },
      { dsName: "Thumb Up",               lucide: "ThumbsUp"        },
      { dsName: "Thumb Down",             lucide: "ThumbsDown"      },
      { dsName: "Sentiment Satisfied",    lucide: "Smile"           },
      { dsName: "Sentiment Neutral",      lucide: "Meh"             },
      { dsName: "Sentiment Dissatisfied", lucide: "Frown"           },
      { dsName: "Star",                   lucide: "Star"            },
      { dsName: "Checkbox Empty",         lucide: "Square"          },
      { dsName: "Checkbox Fill",          lucide: "SquareCheck"     },
      { dsName: "Pin",                    lucide: "Pin"             },
      { dsName: "Unpin",                  lucide: "PinOff"          },
      { dsName: "Flag",                   lucide: "Flag"            },
      { dsName: "Empty Activity",         lucide: "Activity"        },
    ],
  },
  {
    id: "07-view", number: "07", label: "View & Layout",
    icons: [
      { dsName: "Drag indicator",     lucide: "GripVertical"    },
      { dsName: "Grid view",          lucide: "LayoutGrid"      },
      { dsName: "Table View",         lucide: "Table2"          },
      { dsName: "Open full screen",   lucide: "Maximize2"       },
      { dsName: "Close full screen",  lucide: "Minimize2"       },
      { dsName: "Filter",             lucide: "Filter"          },
      { dsName: "Layers",             lucide: "Layers"          },
      { dsName: "Preview",            lucide: "Eye"             },
      { dsName: "Menu",               lucide: "Menu"            },
      { dsName: "Widgets",            lucide: "LayoutDashboard" },
      { dsName: "Expand Content",     lucide: "Maximize"        },
      { dsName: "Chunks",             lucide: "LayoutPanelLeft" },
      { dsName: "Hide image",         lucide: "ImageOff"        },
      { dsName: "Float sidebar",      lucide: "PanelRightOpen"  },
      { dsName: "Dock to left",       lucide: "PanelLeft"       },
      { dsName: "Dock to right",      lucide: "PanelRight"      },
      { dsName: "Split screen right", lucide: "Columns2"        },
      { dsName: "Light",              lucide: "Sun"             },
      { dsName: "Dark",               lucide: "Moon"            },
      { dsName: "Theme",              lucide: "Palette"         },
    ],
  },
  {
    id: "08-people", number: "08", label: "People & Identity",
    icons: [
      { dsName: "Person",               lucide: "User"        },
      { dsName: "Group",                lucide: "Users"       },
      { dsName: "Person Add",           lucide: "UserPlus"    },
      { dsName: "Badge",                lucide: "BadgeCheck"  },
      { dsName: "Person off",           lucide: "UserX"       },
      { dsName: "Owner",                lucide: "UserCog"     },
      { dsName: "Group Remove",         lucide: "UserMinus"   },
      { dsName: "Group Add",            lucide: "UsersRound"  },
      { dsName: "Admin panel settings", lucide: "ShieldCog"   },
      { dsName: "Support",              lucide: "LifeBuoy"    },
      { dsName: "Workspace",            lucide: "Briefcase"   },
    ],
  },
  {
    id: "09-business", number: "09", label: "Business & Workspace",
    icons: [
      { dsName: "Request quote", lucide: "FileQuestion"       },
      { dsName: "Inbox",         lucide: "Inbox"              },
      { dsName: "Hub",           lucide: "Network"            },
      { dsName: "Work",          lucide: "Briefcase"          },
      { dsName: "Storefront",    lucide: "Store"              },
      { dsName: "Campaign",      lucide: "Megaphone"          },
      { dsName: "Car",           lucide: "Car"                },
      { dsName: "Task",          lucide: "SquareCheckBig"     },
      { dsName: "Money",         lucide: "Banknote"           },
      { dsName: "Number",        lucide: "Hash"               },
      { dsName: "Tag",           lucide: "Tag"                },
      { dsName: "Location",      lucide: "MapPin"             },
      { dsName: "Traits",        lucide: "SlidersHorizontal"  },
    ],
  },
  {
    id: "10-time", number: "10", label: "Time & Calendar",
    icons: [
      { dsName: "Last update", lucide: "History"      },
      { dsName: "Calendar",    lucide: "Calendar"     },
      { dsName: "Timer",       lucide: "Timer"        },
      { dsName: "Time",        lucide: "Clock"        },
      { dsName: "Event",       lucide: "CalendarDays" },
    ],
  },
  {
    id: "11-ai", number: "11", label: "AI & Automation",
    icons: [
      { dsName: "Autorenew",     lucide: "RefreshCw"      },
      { dsName: "Trending Up",   lucide: "TrendingUp"     },
      { dsName: "Trending Flat", lucide: "TrendingUpDown" },
      { dsName: "Trending Down", lucide: "TrendingDown"   },
      { dsName: "IA icon",       lucide: "BrainCircuit"   },
      { dsName: "Lightbulb",     lucide: "Lightbulb"      },
      { dsName: "Insights",      lucide: "BarChart2"      },
      { dsName: "Bolt",          lucide: "Zap"            },
      { dsName: "Web Search",    lucide: "Globe"          },
      { dsName: "Automation",    lucide: "Workflow"       },
      { dsName: "Network Ping",  lucide: "Wifi"           },
    ],
  },
  {
    id: "12-security", number: "12", label: "Security & System",
    icons: [
      { dsName: "Search",                lucide: "Search"         },
      { dsName: "Dots Menu",             lucide: "MoreHorizontal" },
      { dsName: "Lock",                  lucide: "Lock"           },
      { dsName: "Lock open",             lucide: "LockOpen"       },
      { dsName: "Build (Repair Orders)", lucide: "Wrench"         },
      { dsName: "Settings",              lucide: "Settings2"      },
      { dsName: "Cloud",                 lucide: "Cloud"          },
      { dsName: "Security",              lucide: "Shield"         },
      { dsName: "Search off",            lucide: "SearchX"        },
      { dsName: "Notification",          lucide: "Bell"           },
      { dsName: "Health",                lucide: "HeartPulse"     },
      { dsName: "Help",                  lucide: "CircleHelp"     },
      { dsName: "Code",                  lucide: "Code2"          },
      { dsName: "Log out",               lucide: "LogOut"         },
    ],
  },
]

// Small dot icon — most common Tag icon in the DS (status indicator)
const TagDotIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
)

// Checkmark icon — used in success/active tags
const TagCheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// X icon — used in error/removal tags
const TagXIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

type TagIconMode = "none" | "dot" | "check"

function resolveTagIcon(mode: TagIconMode) {
  if (mode === "dot")   return <TagDotIcon />
  if (mode === "check") return <TagCheckIcon />
  return undefined
}

function TagPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,      setTab]      = useState<"overview" | "playground" | "reference">("overview")
  const [variant,  setVariant]  = useState<TagVariant>("secondary")
  const [size,     setSize]     = useState<"sm" | "default">("default")
  const [iconMode,     setIconMode]     = useState<TagIconMode>("none")
  const [showTrailing, setShowTrailing] = useState(false)
  const [iconOnly,     setIconOnly]     = useState(false)
  const [disabled,     setDisabled]     = useState(false)

  const demoLeadingIcon  = resolveTagIcon(iconMode)
  const demoTrailingIcon = showTrailing ? <TagXIcon /> : undefined

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Tag</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Inline badge for status, category, and metadata. 11 semantic variants communicate intent at a glance — success, error, alert, and categorical colors. Size S for dense tables, M for general UI.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("tag")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">
        {tab === "overview" && (
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-[16px] font-semibold text-[var(--foreground)]">When to use each variant</h2>
            <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 xl:grid-cols-3">
              {TAG_USAGE.map(u => <UsageCard key={u.variant} name={u.variant} color={u.color} use={u.use} avoid={u.avoid} />)}
            </div>
          </div>
        )}

        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="Variant"
                options={TAG_VARIANTS.map(v => ({ label: v.label, value: v.variant }))}
                value={variant}
                onChange={setVariant}
              />
              <CtrlGroup label="Size"     options={[{label:"S — 20px",value:"sm"},{label:"M — 24px",value:"default"}]} value={size} onChange={setSize} />
              <CtrlGroup label="Left icon"  options={[{label:"None",value:"none"},{label:"Dot",value:"dot"},{label:"Check",value:"check"}]} value={iconMode} onChange={v => { setIconMode(v as TagIconMode); if (v === "none") setIconOnly(false) }} />
              <CtrlToggle label="Right icon (×)" value={showTrailing} onChange={v => { setShowTrailing(v); if (v) setIconOnly(false) }} />
              <CtrlToggle label="Icon only"      value={iconOnly}     onChange={v => { setIconOnly(v); if (v && iconMode === "none") setIconMode("dot"); if (v) setShowTrailing(false) }} />
              <CtrlToggle label="Disabled"       value={disabled}     onChange={setDisabled} />
            </div>
            <div className="flex items-center justify-center min-h-[80px] rounded-md border border-[var(--field-border)] border-dashed">
              <Tag variant={variant} size={size} disabled={disabled}
                leadingIcon={demoLeadingIcon}
                trailingIcon={demoTrailingIcon}
              >
                {!iconOnly && "Label"}
              </Tag>
            </div>
          </div>
        )}

        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">
            <Row label="All variants — Size M">
              {TAG_VARIANTS.map(v => (
                <Tag key={v.variant} variant={v.variant}>{v.label}</Tag>
              ))}
            </Row>
            <Row label="All variants — Size S">
              {TAG_VARIANTS.map(v => (
                <Tag key={v.variant} variant={v.variant} size="sm">{v.label}</Tag>
              ))}
            </Row>
            <Row label="With leading icon — Size M">
              <Tag variant="success"     leadingIcon={<TagCheckIcon />}>Completed</Tag>
              <Tag variant="error"       leadingIcon={<TagDotIcon />}>Failed</Tag>
              <Tag variant="alert"       leadingIcon={<TagDotIcon />}>Pending</Tag>
              <Tag variant="informative" leadingIcon={<TagDotIcon />}>Category</Tag>
              <Tag variant="primary"     leadingIcon={<TagDotIcon />}>Active</Tag>
              <Tag variant="secondary"   leadingIcon={<TagDotIcon />}>Label</Tag>
            </Row>
            <Row label="With trailing icon (×) — Size M">
              <Tag variant="success"     trailingIcon={<TagXIcon />}>Completed</Tag>
              <Tag variant="error"       trailingIcon={<TagXIcon />}>Failed</Tag>
              <Tag variant="alert"       trailingIcon={<TagXIcon />}>Pending</Tag>
              <Tag variant="informative" trailingIcon={<TagXIcon />}>Category</Tag>
              <Tag variant="primary"     trailingIcon={<TagXIcon />}>Active</Tag>
              <Tag variant="secondary"   trailingIcon={<TagXIcon />}>Label</Tag>
            </Row>
            <Row label="Both icons — Size M">
              <Tag variant="success"     leadingIcon={<TagCheckIcon />} trailingIcon={<TagXIcon />}>Completed</Tag>
              <Tag variant="error"       leadingIcon={<TagDotIcon />}   trailingIcon={<TagXIcon />}>Failed</Tag>
              <Tag variant="alert"       leadingIcon={<TagDotIcon />}   trailingIcon={<TagXIcon />}>Pending</Tag>
              <Tag variant="informative" leadingIcon={<TagDotIcon />}   trailingIcon={<TagXIcon />}>Category</Tag>
              <Tag variant="primary"     leadingIcon={<TagDotIcon />}   trailingIcon={<TagXIcon />}>Active</Tag>
              <Tag variant="secondary"   leadingIcon={<TagDotIcon />}   trailingIcon={<TagXIcon />}>Label</Tag>
            </Row>
            <Row label="Icon only (Just icon=Yes) — Size M">
              <Tag variant="success"     leadingIcon={<TagCheckIcon />} />
              <Tag variant="error"       leadingIcon={<TagDotIcon />} />
              <Tag variant="alert"       leadingIcon={<TagDotIcon />} />
              <Tag variant="informative" leadingIcon={<TagDotIcon />} />
              <Tag variant="primary"     leadingIcon={<TagDotIcon />} />
              <Tag variant="secondary"   leadingIcon={<TagDotIcon />} />
              <Tag variant="limeGreen"   leadingIcon={<TagDotIcon />} />
              <Tag variant="yellow"      leadingIcon={<TagDotIcon />} />
              <Tag variant="purple"      leadingIcon={<TagDotIcon />} />
              <Tag variant="lightBlue"   leadingIcon={<TagDotIcon />} />
              <Tag variant="neutral"     leadingIcon={<TagDotIcon />} />
            </Row>
            <Row label="Icon only — Size S">
              <Tag variant="success"     leadingIcon={<TagCheckIcon />} size="sm" />
              <Tag variant="error"       leadingIcon={<TagDotIcon />}   size="sm" />
              <Tag variant="alert"       leadingIcon={<TagDotIcon />}   size="sm" />
              <Tag variant="informative" leadingIcon={<TagDotIcon />}   size="sm" />
              <Tag variant="primary"     leadingIcon={<TagDotIcon />}   size="sm" />
              <Tag variant="secondary"   leadingIcon={<TagDotIcon />}   size="sm" />
            </Row>
            <Row label="Disabled — Size M">
              {TAG_VARIANTS.map(v => (
                <Tag key={v.variant} variant={v.variant} disabled leadingIcon={<TagDotIcon />}>{v.label}</Tag>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Menu / Dropdown Page ──────────────────────────────────────────────────

const MENU_PATTERNS = [
  {
    id: "just-text",
    label: "Just Text",
    description: "Simple list without icons. Use for short option sets where labels are self-explanatory.",
    use:   ["Action menus", "Sort/filter selectors", "5 items or fewer"],
    avoid: ["Contact pickers", "Items that need visual hierarchy"],
  },
  {
    id: "icon-text",
    label: "Icon + Text",
    description: "Leading icon provides visual scanning affordance. Best when each action has a distinct meaning.",
    use:   ["Action menus (Edit, Delete, Share)", "Navigation", "6+ items"],
    avoid: ["Decorative icons — only if they add clarity"],
  },
  {
    id: "icon-subtext",
    label: "Icon + Text + Subtext",
    description: "Two-line item for rich context — name + detail (email, role, path). Use sparingly.",
    use:   ["Contact / user pickers", "File selectors", "Items needing disambiguation"],
    avoid: ["Dense menus > 8 items — prefer just text"],
  },
  {
    id: "sectioned",
    label: "Sections + Dividers",
    description: "Group related items with section headers. Dividers separate distinct action clusters.",
    use:   ["Mixed action types", "Recents + All items", "Actions + Danger zone"],
    avoid: ["< 5 items — a flat list reads faster"],
  },
]

function MenuItemPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,           setTab]           = useState<"overview" | "playground" | "reference">("overview")
  const [pgState,       setPgState]       = useState<"default" | "focus" | "disabled">("default")
  const [pgSize,        setPgSize]        = useState<"default" | "sm">("default")
  const [pgLeading,     setPgLeading]     = useState<"none" | "icon" | "highlight">("none")
  const [pgHiVariant,   setPgHiVariant]   = useState<HighlightIconVariant>("informative")
  const [pgHiIcon,      setPgHiIcon]      = useState("Zap")
  const [pgHiSearch,    setPgHiSearch]    = useState("")
  const [pgSubtext,     setPgSubtext]     = useState(false)
  const [pgTrailing,    setPgTrailing]    = useState<"none" | "badge" | "button">("none")
  const [pgBtnIcon,     setPgBtnIcon]     = useState("X")
  const [pgBtnSearch,   setPgBtnSearch]   = useState("")
  const [row7Icon,      setRow7Icon]      = useState("Pencil")
  const [row7Search,    setRow7Search]    = useState("")

  const EditIcon  = (LucideIcons as unknown as Record<string, LucideIcon>)["Pencil"]
  const CopyIcon  = (LucideIcons as unknown as Record<string, LucideIcon>)["Copy"]
  const TrashIcon = (LucideIcons as unknown as Record<string, LucideIcon>)["Trash2"]
  const UserIcon  = (LucideIcons as unknown as Record<string, LucideIcon>)["User"]
  const FileIcon  = (LucideIcons as unknown as Record<string, LucideIcon>)["File"]
  const StarIcon  = (LucideIcons as unknown as Record<string, LucideIcon>)["Star"]
  const SettingsIcon = (LucideIcons as unknown as Record<string, LucideIcon>)["Settings"]
  const LogOutIcon   = (LucideIcons as unknown as Record<string, LucideIcon>)["LogOut"]
  const FolderIcon   = (LucideIcons as unknown as Record<string, LucideIcon>)["Folder"]
  const ChevronIcon  = (LucideIcons as unknown as Record<string, LucideIcon>)["ChevronRight"]
  const XIcon        = (LucideIcons as unknown as Record<string, LucideIcon>)["X"]

  const iconSize = pgSize === "default" ? 24 : 16

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Menu / Dropdown</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Floating list panel for selectable options. Used in context menus, dropdown selects, and command palettes.
            Supports leading icons, secondary subtext, dividers, and section labels. Size M for general UI, S for compact contexts.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("menu-item")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ─────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[24px]">
            <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Patterns</h2>
            <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2">
              {MENU_PATTERNS.map(p => (
                <div key={p.id} className="rounded-[8px] border border-[var(--field-border)] p-[16px] flex flex-col gap-[8px]">
                  <p className="text-[13px] font-semibold text-[var(--foreground)]">{p.label}</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">{p.description}</p>
                  <div className="flex flex-col gap-[4px] mt-[4px]">
                    <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Use for</p>
                    {p.use.map(u => <p key={u} className="text-[12px] text-[var(--field-supporting)]">· {u}</p>)}
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Avoid</p>
                    {p.avoid.map(a => <p key={a} className="text-[12px] text-[var(--field-supporting)]">· {a}</p>)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Anatomy</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] p-[20px] flex flex-wrap gap-[32px]">
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Container</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">w-260px · max-h-288px · rounded-8px</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">backdrop-blur + shadow</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Item M</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">py-8px · px-16px · gap-16px</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">auto-height: 40px / 56px · icon 24×24</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">label: Inter 14px · Text/Subtitle</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Item S</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">py-8px · px-8px · gap-8px</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">auto-height: 40px / 56px · icon 16×16</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">label: Inter 12px · Text/Body (lighter)</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Divider</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">h-1px · my-4px</p>
                  <p className="text-[12px] text-[var(--field-supporting)]">--menu-divider token</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Playground ───────────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="State"
                options={[
                  { label: "Default",  value: "default" },
                  { label: "Focus",    value: "focus"   },
                  { label: "Disabled", value: "disabled"},
                ]}
                value={pgState}
                onChange={setPgState}
              />
              <CtrlGroup
                label="Size"
                options={[
                  { label: "M (auto · 40-56px)", value: "default" },
                  { label: "S (auto · 40-56px)", value: "sm"      },
                ]}
                value={pgSize}
                onChange={setPgSize}
              />
              <CtrlGroup
                label="Leading element"
                options={[
                  { label: "None",           value: "none"      },
                  { label: "Icon",           value: "icon"      },
                  { label: "Highlight Icon", value: "highlight" },
                ]}
                value={pgLeading}
                onChange={setPgLeading}
              />
              {pgLeading === "highlight" && (
                <div className="flex flex-col gap-[8px] pl-[2px]">
                  <p className="text-[12px] font-medium text-[var(--field-supporting)]">Variant</p>
                  <div className="flex flex-wrap gap-[6px]">
                    {(["informative","success","alert","error","neutral","yellow","lime","purple","light-blue"] as HighlightIconVariant[]).map(v => {
                      const iconName = ({"informative":"Zap","success":"CheckCircle","alert":"AlertTriangle","error":"XCircle","neutral":"Settings","yellow":"Star","lime":"Leaf","purple":"Sparkles","light-blue":"Cloud"} as Record<string,string>)[v]
                      const Ic = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName]
                      return (
                        <button
                          key={v}
                          title={v}
                          onClick={() => setPgHiVariant(v)}
                          className={[
                            "rounded-[6px] transition-all",
                            pgHiVariant === v
                              ? "ring-2 ring-[#2173ff] ring-offset-2 ring-offset-[var(--canvas)]"
                              : "opacity-60 hover:opacity-100",
                          ].join(" ")}
                        >
                          <HighlightIcon variant={v} size="sm"
                            icon={Ic ? <Ic size={12} strokeWidth={1.75}/> : null}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-[var(--field-supporting)]">
                    Activo: <code className="font-mono text-[var(--foreground)]">{pgHiVariant}</code>
                  </p>
                  <p className="text-[12px] font-medium text-[var(--field-supporting)] mt-[2px]">Icon</p>
                  <input
                    type="text"
                    placeholder="Search icon..."
                    value={pgHiSearch}
                    onChange={e => setPgHiSearch(e.target.value)}
                    className="h-[32px] px-[8px] text-[12px] rounded-[6px] border border-[var(--field-border)] bg-[var(--field-bg)] text-[var(--field-text)] placeholder:text-[var(--field-supporting)] outline-none focus:border-[#2173ff] transition-colors"
                  />
                  <div className="h-[72px] overflow-y-auto rounded-[6px] border border-[var(--field-border)] p-[4px] grid grid-cols-8 gap-[2px] content-start">
                    {ICON_CATEGORIES
                      .flatMap(c => c.icons)
                      .filter(ic =>
                        !pgHiSearch ||
                        ic.dsName.toLowerCase().includes(pgHiSearch.toLowerCase()) ||
                        ic.lucide.toLowerCase().includes(pgHiSearch.toLowerCase())
                      )
                      .slice(0, 64)
                      .map(ic => {
                        const Ic = (LucideIcons as unknown as Record<string, LucideIcon>)[ic.lucide]
                        if (!Ic) return null
                        return (
                          <button
                            key={ic.lucide}
                            title={ic.dsName}
                            onClick={() => setPgHiIcon(ic.lucide)}
                            className={[
                              "w-[28px] h-[28px] flex items-center justify-center rounded-[4px] transition-colors",
                              pgHiIcon === ic.lucide
                                ? "bg-[#2173ff] text-white"
                                : "text-[var(--field-supporting)] hover:bg-[var(--field-border)] hover:text-[var(--foreground)]",
                            ].join(" ")}
                          >
                            <Ic size={14} strokeWidth={1.75}/>
                          </button>
                        )
                      })
                    }
                  </div>
                  <p className="text-[11px] text-[var(--field-supporting)]">
                    Icon: <code className="font-mono text-[var(--foreground)]">{pgHiIcon}</code>
                  </p>
                </div>
              )}
              <CtrlToggle label="Subtext" value={pgSubtext} onChange={setPgSubtext} />
              <CtrlGroup
                label="Trailing element"
                options={[
                  { label: "None",   value: "none"   },
                  { label: "Badge",  value: "badge"  },
                  { label: "Button", value: "button" },
                ]}
                value={pgTrailing}
                onChange={setPgTrailing}
              />
              {pgTrailing === "button" && (
                <div className="flex flex-col gap-[6px]">
                  <p className="text-[12px] font-medium text-[var(--field-supporting)]">Button icon</p>
                  <input
                    type="text"
                    placeholder="Search icon..."
                    value={pgBtnSearch}
                    onChange={e => setPgBtnSearch(e.target.value)}
                    className="h-[32px] px-[8px] text-[12px] rounded-[6px] border border-[var(--field-border)] bg-[var(--field-bg)] text-[var(--field-text)] placeholder:text-[var(--field-supporting)] outline-none focus:border-[#2173ff] transition-colors"
                  />
                  <div className="h-[80px] overflow-y-auto rounded-[6px] border border-[var(--field-border)] p-[4px] grid grid-cols-8 gap-[2px] content-start">
                    {ICON_CATEGORIES
                      .flatMap(c => c.icons)
                      .filter(ic =>
                        !pgBtnSearch ||
                        ic.dsName.toLowerCase().includes(pgBtnSearch.toLowerCase()) ||
                        ic.lucide.toLowerCase().includes(pgBtnSearch.toLowerCase())
                      )
                      .slice(0, 64)
                      .map(ic => {
                        const Ic = (LucideIcons as unknown as Record<string, LucideIcon>)[ic.lucide]
                        if (!Ic) return null
                        return (
                          <button
                            key={ic.lucide}
                            title={ic.dsName}
                            onClick={() => setPgBtnIcon(ic.lucide)}
                            className={[
                              "w-[28px] h-[28px] flex items-center justify-center rounded-[4px] transition-colors",
                              pgBtnIcon === ic.lucide
                                ? "bg-[#2173ff] text-white"
                                : "text-[var(--field-supporting)] hover:bg-[var(--field-border)] hover:text-[var(--foreground)]",
                            ].join(" ")}
                          >
                            <Ic size={14} strokeWidth={1.75}/>
                          </button>
                        )
                      })
                    }
                  </div>
                  <p className="text-[11px] text-[var(--field-supporting)]">
                    Activo: <code className="font-mono text-[var(--foreground)]">{pgBtnIcon}</code>
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center min-h-[120px] rounded-md border border-[var(--field-border)] border-dashed">
              <Menu>
                <MenuItem
                  label="Menu item label"
                  subtext={pgSubtext ? "Secondary detail text" : undefined}
                  leadingIcon={(() => {
                    if (pgLeading === "icon")
                      return EditIcon ? <EditIcon size={iconSize} strokeWidth={1.75}/> : undefined
                    if (pgLeading === "highlight") {
                      const HiIc = (LucideIcons as unknown as Record<string, LucideIcon>)[pgHiIcon]
                      return (
                        <HighlightIcon
                          variant={pgHiVariant}
                          size="sm"
                          icon={HiIc ? <HiIc size={16} strokeWidth={1.75}/> : null}
                        />
                      )
                    }
                    return undefined
                  })()}
                  trailingElement={(() => {
                    if (pgTrailing === "badge") return <Tag size="sm" variant="informative">New</Tag>
                    if (pgTrailing === "button") {
                      const TrailingIcon = (LucideIcons as unknown as Record<string, LucideIcon>)[pgBtnIcon]
                      if (!TrailingIcon) return undefined
                      return (
                        <Button
                          variant="tertiary"
                          size={pgSize === "sm" ? "sm" : "default"}
                          iconPosition="alone"
                          icon={<TrailingIcon size={iconSize} strokeWidth={1.75}/>}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )
                    }
                    return undefined
                  })()}
                  state={pgState}
                  size={pgSize}
                />
              </Menu>
            </div>
          </div>
        )}

        {/* ── Reference ────────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[32px]">

            <Row label="1 · Just Text — Size M">
              <Menu>
                <MenuItem label="Option A" />
                <MenuItem label="Option B (focus)" state="focus" />
                <MenuItem label="Option C" />
                <MenuItem label="Disabled option" state="disabled" />
              </Menu>
            </Row>

            <Row label="2 · Just Text — Size S">
              <Menu>
                <MenuItem label="Option A"    size="sm" />
                <MenuItem label="Option B"    size="sm" state="focus" />
                <MenuItem label="Option C"    size="sm" />
                <MenuItem label="Unavailable" size="sm" state="disabled" />
              </Menu>
            </Row>

            <Row label="3 · Icon + Text — Size M">
              <Menu>
                {EditIcon    && <MenuItem label="Edit"      leadingIcon={<EditIcon    size={24} strokeWidth={1.75}/>} />}
                {CopyIcon    && <MenuItem label="Duplicate" leadingIcon={<CopyIcon    size={24} strokeWidth={1.75}/>} />}
                {StarIcon    && <MenuItem label="Favorite"  leadingIcon={<StarIcon    size={24} strokeWidth={1.75}/>} state="focus" />}
                {TrashIcon   && <MenuItem label="Delete"    leadingIcon={<TrashIcon   size={24} strokeWidth={1.75}/>} state="disabled" />}
              </Menu>
            </Row>

            <Row label="4 · Icon + Text + Subtext — Size M">
              <Menu>
                {UserIcon  && <MenuItem label="Sarah Lawrence" subtext="sarah@company.com"  leadingIcon={<UserIcon  size={24} strokeWidth={1.75}/>} />}
                {UserIcon  && <MenuItem label="Marcus Reid"    subtext="marcus@company.com" leadingIcon={<UserIcon  size={24} strokeWidth={1.75}/>} state="focus" />}
                {UserIcon  && <MenuItem label="Ana García"     subtext="ana@company.com"    leadingIcon={<UserIcon  size={24} strokeWidth={1.75}/>} />}
                {UserIcon  && <MenuItem label="Chris Park"     subtext="Deactivated"        leadingIcon={<UserIcon  size={24} strokeWidth={1.75}/>} state="disabled" />}
              </Menu>
            </Row>

            <Row label="5 · With trailing badge — Size M">
              <Menu>
                <MenuItem label="Dashboard"   trailingElement={<Tag size="sm" variant="success">Live</Tag>} />
                <MenuItem label="Experiments" trailingElement={<Tag size="sm" variant="alert">Beta</Tag>} state="focus" />
                <MenuItem label="Reports"     trailingElement={<Tag size="sm" variant="informative">New</Tag>} />
                <MenuItem label="Archive"     state="disabled" />
              </Menu>
            </Row>

            <Row label="6 · Trailing dismiss — Button / Tertiary / Icon Alone">
              <div className="flex gap-[24px] flex-wrap">
                <div className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">Size M · Button size=default · 40×40px</p>
                  <Menu>
                    {UserIcon && XIcon && <MenuItem
                      label="Sarah Lawrence" subtext="sarah@company.com"
                      leadingIcon={<UserIcon size={24} strokeWidth={1.75}/>}
                      trailingElement={
                        <Button variant="tertiary" size="default" iconPosition="alone"
                          icon={<XIcon size={24} strokeWidth={1.75}/>}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />}
                    {UserIcon && XIcon && <MenuItem
                      label="Marcus Reid" subtext="marcus@company.com"
                      leadingIcon={<UserIcon size={24} strokeWidth={1.75}/>}
                      state="focus"
                      trailingElement={
                        <Button variant="tertiary" size="default" iconPosition="alone"
                          icon={<XIcon size={24} strokeWidth={1.75}/>}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />}
                  </Menu>
                </div>
                <div className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">Size S · Button size=sm · 24×24px</p>
                  <Menu>
                    {UserIcon && XIcon && <MenuItem
                      label="Sarah Lawrence" subtext="sarah@company.com"
                      size="sm"
                      leadingIcon={<UserIcon size={16} strokeWidth={1.75}/>}
                      trailingElement={
                        <Button variant="tertiary" size="sm" iconPosition="alone"
                          icon={<XIcon size={16} strokeWidth={1.75}/>}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />}
                    {UserIcon && XIcon && <MenuItem
                      label="Marcus Reid" subtext="marcus@company.com"
                      size="sm"
                      state="focus"
                      leadingIcon={<UserIcon size={16} strokeWidth={1.75}/>}
                      trailingElement={
                        <Button variant="tertiary" size="sm" iconPosition="alone"
                          icon={<XIcon size={16} strokeWidth={1.75}/>}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />}
                  </Menu>
                </div>
              </div>
            </Row>

            <Row label="7 · Custom action button — trailingElement accepts any icon">
              <div className="flex flex-col gap-[16px]">
                <p className="text-[12px] text-[var(--field-supporting)]">
                  Same pattern as dismiss but with an action-specific icon per item.
                  Pasa <code className="text-[11px] bg-[var(--field-border)] px-[4px] py-[1px] rounded">{"<Button variant=\"tertiary\" iconPosition=\"alone\" icon={<Icon/>}/>"}</code> a <code className="text-[11px] bg-[var(--field-border)] px-[4px] py-[1px] rounded">trailingElement</code>.
                </p>

                {/* ── 4 semantic examples ─── */}
                <Menu>
                  {FolderIcon && EditIcon && <MenuItem
                    label="Rename workspace"
                    subtext="Last edited 2 days ago"
                    leadingIcon={<FolderIcon size={24} strokeWidth={1.75}/>}
                    trailingElement={
                      <Button variant="tertiary" size="default" iconPosition="alone"
                        icon={<EditIcon size={24} strokeWidth={1.75}/>}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                  />}
                  {FileIcon && CopyIcon && <MenuItem
                    label="Duplicate template"
                    subtext="12 components"
                    leadingIcon={<FileIcon size={24} strokeWidth={1.75}/>}
                    trailingElement={
                      <Button variant="tertiary" size="default" iconPosition="alone"
                        icon={<CopyIcon size={24} strokeWidth={1.75}/>}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                  />}
                  {SettingsIcon && ChevronIcon && <MenuItem
                    label="Configure integration"
                    subtext="Webhook · Active"
                    leadingIcon={<SettingsIcon size={24} strokeWidth={1.75}/>}
                    state="focus"
                    trailingElement={
                      <Button variant="tertiary" size="default" iconPosition="alone"
                        icon={<ChevronIcon size={24} strokeWidth={1.75}/>}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                  />}
                  {UserIcon && TrashIcon && <MenuItem
                    label="Remove member"
                    subtext="ana@company.com"
                    leadingIcon={<UserIcon size={24} strokeWidth={1.75}/>}
                    trailingElement={
                      <Button variant="tertiary" size="default" iconPosition="alone"
                        icon={<TrashIcon size={24} strokeWidth={1.75}/>}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                  />}
                </Menu>

                {/* ── Dynamic picker ─── */}
                <div className="flex flex-col gap-[8px] pt-[4px] border-t border-[var(--field-border)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">
                    Try any icon from the library
                  </p>
                  <div className="flex gap-[16px] items-start flex-wrap">

                    {/* Picker column */}
                    <div className="flex flex-col gap-[6px]">
                      <input
                        type="text"
                        placeholder="Search icon..."
                        value={row7Search}
                        onChange={e => setRow7Search(e.target.value)}
                        className="h-[32px] w-[172px] px-[8px] text-[12px] rounded-[6px] border border-[var(--field-border)] bg-[var(--field-bg)] text-[var(--field-text)] placeholder:text-[var(--field-supporting)] outline-none focus:border-[#2173ff] transition-colors"
                      />
                      <div className="w-[172px] h-[128px] overflow-y-auto rounded-[6px] border border-[var(--field-border)] p-[4px] grid grid-cols-5 gap-[2px] content-start">
                        {ICON_CATEGORIES
                          .flatMap(c => c.icons)
                          .filter(ic =>
                            !row7Search ||
                            ic.dsName.toLowerCase().includes(row7Search.toLowerCase()) ||
                            ic.lucide.toLowerCase().includes(row7Search.toLowerCase())
                          )
                          .slice(0, 60)
                          .map(ic => {
                            const Ic = (LucideIcons as unknown as Record<string, LucideIcon>)[ic.lucide]
                            if (!Ic) return null
                            const isSelected = row7Icon === ic.lucide
                            return (
                              <button
                                key={ic.lucide}
                                title={ic.dsName}
                                onClick={() => setRow7Icon(ic.lucide)}
                                className={[
                                  "w-[28px] h-[28px] flex items-center justify-center rounded-[4px] transition-colors",
                                  isSelected
                                    ? "bg-[#2173ff] text-white"
                                    : "text-[var(--field-supporting)] hover:bg-[var(--field-border)] hover:text-[var(--foreground)]",
                                ].join(" ")}
                              >
                                <Ic size={14} strokeWidth={1.75}/>
                              </button>
                            )
                          })
                        }
                      </div>
                    </div>

                    {/* Live preview */}
                    <div className="flex flex-col gap-[6px]">
                      <p className="text-[12px] text-[var(--field-supporting)]">
                        Active icon: <code className="font-mono text-[11px] text-[var(--foreground)]">{row7Icon}</code>
                      </p>
                      <Menu>
                        {UserIcon && (() => {
                          const DynIcon = (LucideIcons as unknown as Record<string, LucideIcon>)[row7Icon]
                          return (
                            <MenuItem
                              label="Custom action item"
                              subtext="trailingElement — any icon"
                              leadingIcon={<UserIcon size={24} strokeWidth={1.75}/>}
                              trailingElement={
                                DynIcon
                                  ? <Button variant="tertiary" size="default" iconPosition="alone"
                                      icon={<DynIcon size={24} strokeWidth={1.75}/>}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  : undefined
                              }
                            />
                          )
                        })()}
                      </Menu>
                    </div>

                  </div>
                </div>

              </div>
            </Row>

            <Row label="8 · With checkbox — leading slot (32×32 M · 24×24 S)">
              <div className="flex gap-[24px] flex-wrap">
                <div className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">Size M · checkbox 32×32</p>
                  <Menu>
                    {EditIcon && <MenuItem
                      label="Edit document"
                      leadingIcon={<EditIcon size={24} strokeWidth={1.75}/>}
                      checkbox={
                        <div className="w-[18px] h-[18px] rounded-[3px] border-2 border-[#2173ff] bg-[#2173ff] flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 10 8" fill="none" width={11} height={11}><path d="M1 4l3 3 5-6" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      }
                    />}
                    {CopyIcon && <MenuItem
                      label="Duplicate"
                      leadingIcon={<CopyIcon size={24} strokeWidth={1.75}/>}
                      state="focus"
                      checkbox={
                        <div className="w-[18px] h-[18px] rounded-[3px] border-2 border-[var(--field-border)] bg-transparent shrink-0" />
                      }
                    />}
                    {StarIcon && <MenuItem
                      label="Add to favorites"
                      leadingIcon={<StarIcon size={24} strokeWidth={1.75}/>}
                      checkbox={
                        <div className="w-[18px] h-[18px] rounded-[3px] border-2 border-[var(--field-border)] bg-transparent shrink-0" />
                      }
                    />}
                  </Menu>
                </div>
                <div className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">Size S · checkbox 24×24</p>
                  <Menu>
                    {EditIcon && <MenuItem
                      label="Edit document"
                      size="sm"
                      leadingIcon={<EditIcon size={16} strokeWidth={1.75}/>}
                      checkbox={
                        <div className="w-[14px] h-[14px] rounded-[3px] border-2 border-[#2173ff] bg-[#2173ff] flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 10 8" fill="none" width={9} height={9}><path d="M1 4l3 3 5-6" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      }
                    />}
                    {CopyIcon && <MenuItem
                      label="Duplicate"
                      size="sm"
                      state="focus"
                      leadingIcon={<CopyIcon size={16} strokeWidth={1.75}/>}
                      checkbox={
                        <div className="w-[14px] h-[14px] rounded-[3px] border-2 border-[var(--field-border)] bg-transparent shrink-0" />
                      }
                    />}
                  </Menu>
                </div>
              </div>
            </Row>

            <Row label="8 · Avatar leading slot — initials circle (24×24 M · 16×16 S)">
              <div className="flex gap-[24px] flex-wrap">
                <div className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">Size M</p>
                  <Menu>
                    <MenuItem label="James Smith"    subtext="james@company.com"   leadingIcon={<span className="w-[24px] h-[24px] rounded-full bg-[#2173ff] flex items-center justify-center text-white font-semibold shrink-0" style={{fontSize:9}}>JS</span>} />
                    <MenuItem label="Ana García"     subtext="ana@company.com"     leadingIcon={<span className="w-[24px] h-[24px] rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-semibold shrink-0" style={{fontSize:9}}>AG</span>} state="focus" />
                    <MenuItem label="Marcus Reid"    subtext="Deactivated"         leadingIcon={<span className="w-[24px] h-[24px] rounded-full bg-[#6b7280] flex items-center justify-center text-white font-semibold shrink-0" style={{fontSize:9}}>MR</span>} state="disabled" />
                  </Menu>
                </div>
                <div className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">Size S</p>
                  <Menu>
                    <MenuItem label="James Smith"  size="sm" leadingIcon={<span className="w-[16px] h-[16px] rounded-full bg-[#2173ff] flex items-center justify-center text-white font-semibold shrink-0" style={{fontSize:6}}>JS</span>} />
                    <MenuItem label="Ana García"   size="sm" state="focus" leadingIcon={<span className="w-[16px] h-[16px] rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-semibold shrink-0" style={{fontSize:6}}>AG</span>} />
                    <MenuItem label="Marcus Reid"  size="sm" state="disabled" leadingIcon={<span className="w-[16px] h-[16px] rounded-full bg-[#6b7280] flex items-center justify-center text-white font-semibold shrink-0" style={{fontSize:6}}>MR</span>} />
                  </Menu>
                </div>
              </div>
            </Row>

            <Row label="10 · With Highlight Icon — leading slot (24×24 = size sm)">
              <div className="flex gap-[24px] flex-wrap">
                <div className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">9 variants · Size M menu item</p>
                  <Menu>
                    {(["informative","success","alert","error"] as HighlightIconVariant[]).map(v => {
                      const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[
                        v === "informative" ? "Zap" : v === "success" ? "CheckCircle" : v === "alert" ? "AlertTriangle" : "XCircle"
                      ]
                      return (
                        <MenuItem
                          key={v}
                          label={v.charAt(0).toUpperCase() + v.slice(1)}
                          subtext={`State = ${v}`}
                          leadingIcon={
                            <HighlightIcon
                              variant={v}
                              size="sm"
                              icon={Icon ? <Icon size={16} strokeWidth={1.75}/> : null}
                            />
                          }
                        />
                      )
                    })}
                  </Menu>
                </div>
                <div className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">Remaining 5 variants</p>
                  <Menu>
                    {(["neutral","yellow","lime","purple","light-blue"] as HighlightIconVariant[]).map(v => {
                      const iconName = v === "neutral" ? "Settings" : v === "yellow" ? "Star" : v === "lime" ? "Leaf" : v === "purple" ? "Sparkles" : "Cloud"
                      const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName]
                      return (
                        <MenuItem
                          key={v}
                          label={v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ")}
                          leadingIcon={
                            <HighlightIcon
                              variant={v}
                              size="sm"
                              icon={Icon ? <Icon size={16} strokeWidth={1.75}/> : null}
                            />
                          }
                        />
                      )
                    })}
                  </Menu>
                </div>
              </div>
            </Row>

            <Row label="11 · Sections + Dividers">
              <Menu>
                <MenuSection label="Recent" />
                {FileIcon   && <MenuItem label="Q4 Report.pdf"    leadingIcon={<FileIcon   size={24} strokeWidth={1.75}/>} />}
                {FolderIcon && <MenuItem label="Design Assets"    leadingIcon={<FolderIcon size={24} strokeWidth={1.75}/>} />}
                <MenuDivider />
                <MenuSection label="Actions" />
                {SettingsIcon && <MenuItem label="Settings"   leadingIcon={<SettingsIcon size={24} strokeWidth={1.75}/>} />}
                {ChevronIcon  && <MenuItem label="Share →"    leadingIcon={<ChevronIcon  size={24} strokeWidth={1.75}/>} />}
                <MenuDivider />
                {LogOutIcon   && <MenuItem label="Sign out"   leadingIcon={<LogOutIcon   size={24} strokeWidth={1.75}/>} />}
              </Menu>
            </Row>

            <Row label="11 · All states side by side — Size M">
              {(["default", "focus", "disabled"] as const).map(s => (
                <div key={s} className="flex flex-col gap-[4px] items-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)] mb-[4px]">{s}</p>
                  <Menu>
                    {EditIcon && <MenuItem label="Menu item"  leadingIcon={<EditIcon size={24} strokeWidth={1.75}/>} state={s} />}
                  </Menu>
                </div>
              ))}
            </Row>

          </div>
        )}
      </div>
    </div>
  )
}

// ── Icons Page ────────────────────────────────────────────────────────────

const ICON_TOTAL = ICON_CATEGORIES.reduce((n, c) => n + c.icons.length, 0)

// ── Highlight Icon Page ───────────────────────────────────────────────────

const HI_VARIANTS: HighlightIconVariant[] = [
  "informative","success","alert","error","neutral","yellow","lime","purple","light-blue"
]
const HI_VARIANT_ICONS: Record<HighlightIconVariant, string> = {
  informative:  "Zap",
  success:      "CheckCircle",
  alert:        "AlertTriangle",
  error:        "XCircle",
  neutral:      "Settings",
  yellow:       "Star",
  lime:         "Leaf",
  purple:       "Sparkles",
  "light-blue": "Cloud",
}

// ── Select page ────────────────────────────────────────────────────────────

const SELECT_OPTIONS = [
  "Claude Sonnet 4.5",
  "Claude Haiku 4.5",
  "Claude Opus 4",
  "GPT-4o",
  "Gemini 1.5 Pro",
]

function SelectPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,         setTab]         = useState<"overview" | "playground" | "reference">("overview")
  const [selState,    setSelState]    = useState<SelectState>("default")
  const [selSize,     setSelSize]     = useState<"default" | "sm">("default")
  const [showLabel,   setShowLabel]   = useState(true)
  const [showSupport, setShowSupport] = useState(true)
  const [showIcon,    setShowIcon]    = useState(false)

  // Playground interactive state
  const [pgOpen,  setPgOpen]  = useState(false)
  const [pgValue, setPgValue] = useState("")

  const pgSupportText =
    selState === "error"    ? "Please select a model to continue" :
    showSupport             ? "Choose the model for this node"    : undefined

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Select</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Non-editable trigger field that opens a Menu/Dropdown panel. Shares the same visual shell
            as Input — border, label, supporting text, icon slots — but the right icon is always
            dynamic: ChevronDown, ChevronUp (open), or × (has value).
          </p>
        </div>
        <SpecButton onClick={() => openSpec("select")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ───────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Anatomy</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] p-[24px] flex flex-col gap-[20px]">
                <div className="flex flex-wrap gap-[24px] items-end">
                  {/* Default — no value */}
                  <div className="flex flex-col gap-[8px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Default · no value</p>
                    <div className="w-[240px]">
                      <Select label="AI Model" placeholder="Select an option" supportingText="Choose the model for this node" />
                    </div>
                  </div>
                  {/* Has value */}
                  <div className="flex flex-col gap-[8px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Has value (selected)</p>
                    <div className="w-[240px]">
                      <Select label="AI Model" value="Claude Sonnet 4.5" supportingText="Choose the model for this node" />
                    </div>
                  </div>
                  {/* Open */}
                  <div className="flex flex-col gap-[8px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Open (dropdown visible)</p>
                    <div className="w-[240px]">
                      <Select label="AI Model" placeholder="Select an option" open supportingText="Choose the model for this node" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-[24px] items-end">
                  {/* Error */}
                  <div className="flex flex-col gap-[8px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Error</p>
                    <div className="w-[240px]">
                      <Select label="AI Model" placeholder="Select an option" state="error" supportingText="Please select a model to continue" />
                    </div>
                  </div>
                  {/* Disabled */}
                  <div className="flex flex-col gap-[8px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Disabled</p>
                    <div className="w-[240px]">
                      <Select label="AI Model" placeholder="Select an option" state="disabled" supportingText="Fixed by workflow configuration" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Right icon logic</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] p-[16px] flex flex-col gap-0 divide-y divide-[var(--field-border)]">
                {[
                  { condition: "open = true",                          icon: "ChevronUp",   note: "Regardless of value" },
                  { condition: "open = false · value exists",          icon: "X (clear)",   note: "Blue border — click to clear value" },
                  { condition: "open = false · no value · state=error",icon: "CircleAlert", note: "Red border" },
                  { condition: "open = false · no value · default",    icon: "ChevronDown", note: "Gray border" },
                ].map(r => (
                  <div key={r.condition} className="flex items-center justify-between py-[10px] gap-[12px]">
                    <code className="text-[12px] font-mono text-[var(--foreground)]">{r.condition}</code>
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[12px] font-semibold text-[var(--field-border-focus)] bg-[var(--field-bg)] border border-[var(--field-border)] rounded px-[6px] py-[2px]">
                        {r.icon}
                      </span>
                      <span className="text-[12px] text-[var(--field-supporting)]">{r.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Playground ─────────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="State"
                options={[{label:"Default",value:"default"},{label:"Error",value:"error"},{label:"Disabled",value:"disabled"}]}
                value={selState}
                onChange={v => setSelState(v as SelectState)}
              />
              <CtrlGroup
                label="Size"
                options={[{label:"S — 32px",value:"sm"},{label:"M — 40px",value:"default"}]}
                value={selSize}
                onChange={v => setSelSize(v as "default" | "sm")}
              />
              <CtrlToggle label="Label"      value={showLabel}   onChange={setShowLabel} />
              <CtrlToggle label="Supporting" value={showSupport} onChange={setShowSupport} />
              <CtrlToggle label="Left icon"  value={showIcon}    onChange={setShowIcon} />
            </div>

            {/* Interactive preview */}
            <div className="flex flex-col items-center gap-[12px] min-h-[260px] rounded-md border border-[var(--field-border)] border-dashed px-[40px] py-[24px]">
              <div className="w-full max-w-[320px] relative">
                <Select
                  state={selState}
                  size={selSize}
                  label={showLabel ? "AI Model" : undefined}
                  supportingText={pgSupportText}
                  leadingIcon={showIcon ? <SearchIcon /> : undefined}
                  placeholder="Select an option"
                  value={pgValue}
                  open={pgOpen}
                  onClick={() => selState !== "disabled" && setPgOpen(o => !o)}
                  onClear={() => { setPgValue(""); setPgOpen(false) }}
                />
                {pgOpen && selState !== "disabled" && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-[50]">
                    <Menu className="w-full">
                      {SELECT_OPTIONS.map(opt => (
                        <MenuItem
                          key={opt}
                          label={opt}
                          state={opt === pgValue ? "focus" : "default"}
                          onClick={() => { setPgValue(opt); setPgOpen(false) }}
                        />
                      ))}
                    </Menu>
                  </div>
                )}
              </div>
              {pgValue && (
                <p className="text-[12px] text-[var(--field-supporting)]">
                  Selected: <strong className="text-[var(--foreground)]">{pgValue}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Reference ──────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">

            <Row label="1 · All states — no value">
              {(["default","error","disabled"] as SelectState[]).map(s => (
                <div key={s} className="w-[220px]">
                  <Select
                    label="AI Model"
                    placeholder="Select an option"
                    state={s}
                    supportingText={s === "error" ? "Please select a model" : s === "disabled" ? "Fixed by configuration" : "Choose the model"}
                  />
                </div>
              ))}
            </Row>

            <Row label="2 · Has value selected (blue border · × clear)">
              <div className="w-[220px]">
                <Select label="AI Model" value="Claude Sonnet 4.5" supportingText="Model confirmed" />
              </div>
              <div className="w-[220px]">
                <Select label="Environment" value="Production" supportingText="Active environment" />
              </div>
              <div className="w-[220px]">
                <Select label="Region" value="us-east-1" supportingText="AWS region" />
              </div>
            </Row>

            <Row label="3 · Open state (ChevronUp · blue border)">
              <div className="w-[220px]">
                <Select label="AI Model" placeholder="Select an option" open supportingText="Choose the model" />
              </div>
              <div className="w-[220px]">
                <Select label="AI Model" value="Claude Haiku 4.5" open supportingText="Choose the model" />
              </div>
            </Row>

            <Row label="4 · Sizes — S (32px) / M (40px)">
              <div className="w-[220px]">
                <Select size="sm"      label="Model" placeholder="Select..." />
              </div>
              <div className="w-[220px]">
                <Select size="default" label="Model" placeholder="Select..." />
              </div>
            </Row>

            <Row label="5 · With leading icon">
              <div className="w-[240px]">
                <Select
                  label="AI Model"
                  placeholder="Select a model"
                  leadingIcon={<SearchIcon />}
                  supportingText="Search or select"
                />
              </div>
              <div className="w-[240px]">
                <Select
                  label="AI Model"
                  value="Claude Sonnet 4.5"
                  leadingIcon={<SearchIcon />}
                  supportingText="Model confirmed"
                />
              </div>
            </Row>

            <Row label="6 · Without label">
              <div className="w-[200px]"><Select placeholder="Select an option" /></div>
              <div className="w-[200px]"><Select placeholder="Select an option" state="error" supportingText="Required field" /></div>
              <div className="w-[200px]"><Select value="Claude Sonnet" /></div>
            </Row>

            <Row label="7 · Select + Menu (composed pattern)">
              <div className="w-[260px] relative" style={{ height: "auto" }}>
                <p className="text-[12px] text-[var(--field-supporting)] mb-[8px]">
                  Select is a trigger only — compose with&nbsp;
                  <code className="text-[var(--foreground)]">&lt;Menu&gt;</code> for the full dropdown.
                </p>
                <Select label="AI Model" value="Claude Haiku 4.5" open />
                <div className="mt-[4px]">
                  <Menu className="w-full">
                    <MenuSection label="Anthropic" />
                    {["Claude Sonnet 4.5","Claude Haiku 4.5","Claude Opus 4"].map(opt => (
                      <MenuItem key={opt} label={opt} state={opt === "Claude Haiku 4.5" ? "focus" : "default"} />
                    ))}
                    <MenuDivider />
                    <MenuSection label="Other" />
                    {["GPT-4o","Gemini 1.5 Pro"].map(opt => (
                      <MenuItem key={opt} label={opt} />
                    ))}
                  </Menu>
                </div>
              </div>
            </Row>

          </div>
        )}
      </div>
    </div>
  )
}

// ── Checkbox page ──────────────────────────────────────────────────────────

function CheckboxPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,        setTab]       = useState<"overview" | "playground" | "reference">("overview")
  const [cbSize,     setCbSize]    = useState<"default" | "sm">("default")
  const [cbChecked,  setCbChecked] = useState(false)
  const [cbDisabled, setCbDisabled]= useState(false)
  const [showLabel,  setShowLabel] = useState(false)
  const [showDesc,   setShowDesc]  = useState(false)

  // Reference — group states
  const [refChecks, setRefChecks]  = useState<boolean[]>([false, true, false, true, false])

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Checkbox</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Binary selection control for forms, tables, and lists. The outer circular area is a ripple
            zone — it provides hover/focus feedback without affecting layout. 2 sizes, 4 interaction states.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("checkbox")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ─────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Anatomy</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] p-[24px] flex flex-wrap gap-[32px] items-end">
                {(["default","sm"] as const).map(s => (
                  <div key={s} className="flex flex-col gap-[8px] items-start">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">
                      Size {s === "default" ? "M (32×32)" : "S (24×24)"}
                    </p>
                    <div className="flex gap-[16px] items-center">
                      <div className="flex flex-col gap-[4px] items-center">
                        <Checkbox size={s} checked={false} />
                        <p className="text-[11px] text-[var(--field-supporting)]">unchecked</p>
                      </div>
                      <div className="flex flex-col gap-[4px] items-center">
                        <Checkbox size={s} checked={true} />
                        <p className="text-[11px] text-[var(--field-supporting)]">checked</p>
                      </div>
                      <div className="flex flex-col gap-[4px] items-center">
                        <Checkbox size={s} checked={false} disabled />
                        <p className="text-[11px] text-[var(--field-supporting)]">disabled</p>
                      </div>
                      <div className="flex flex-col gap-[4px] items-center">
                        <Checkbox size={s} checked={true} disabled />
                        <p className="text-[11px] text-[var(--field-supporting)]">checked+dis</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">With label</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] p-[20px] flex flex-col gap-[12px]">
                <Checkbox label="Enable notifications" />
                <Checkbox label="Send weekly digest" description="Receive a summary of activity every Monday morning" />
                <Checkbox label="Allow data sharing" description="Share anonymized usage data to help improve the product" checked />
                <Checkbox label="This option is unavailable" description="Contact your admin to enable this feature" disabled />
              </div>
            </div>
          </div>
        )}

        {/* ── Playground ───────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="Size"
                options={[{label:"M — 32px",value:"default"},{label:"S — 24px",value:"sm"}]}
                value={cbSize}
                onChange={v => setCbSize(v as "default" | "sm")}
              />
              <CtrlToggle label="Checked"   value={cbChecked}  onChange={setCbChecked} />
              <CtrlToggle label="Disabled"  value={cbDisabled} onChange={setCbDisabled} />
              <CtrlToggle label="Label"     value={showLabel}  onChange={setShowLabel} />
              <CtrlToggle label="Desc"      value={showDesc}   onChange={v => { setShowDesc(v); if (v) setShowLabel(true) }} />
            </div>
            <div className="flex items-center justify-center min-h-[100px] rounded-md border border-[var(--field-border)] border-dashed px-[40px]">
              <Checkbox
                size={cbSize}
                checked={cbChecked}
                disabled={cbDisabled}
                onChange={setCbChecked}
                label={showLabel ? "Enable this option" : undefined}
                description={showDesc ? "Toggle to activate this setting for your workspace" : undefined}
              />
            </div>
          </div>
        )}

        {/* ── Reference ────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">
            <Row label="1 · All states — Size M">
              <div className="flex gap-[16px] items-center flex-wrap">
                {[
                  { checked: false, disabled: false, label: "Unchecked" },
                  { checked: true,  disabled: false, label: "Checked"   },
                  { checked: false, disabled: true,  label: "Disabled"  },
                  { checked: true,  disabled: true,  label: "Dis+checked"},
                ].map(c => (
                  <div key={c.label} className="flex flex-col gap-[8px] items-center">
                    <Checkbox checked={c.checked} disabled={c.disabled} />
                    <p className="text-[11px] text-[var(--field-supporting)]">{c.label}</p>
                  </div>
                ))}
              </div>
            </Row>

            <Row label="2 · Sizes — S / M">
              <div className="flex gap-[24px] items-center">
                <div className="flex flex-col gap-[4px] items-center">
                  <Checkbox size="sm"      checked={true} />
                  <p className="text-[11px] text-[var(--field-supporting)]">S — 24×24</p>
                </div>
                <div className="flex flex-col gap-[4px] items-center">
                  <Checkbox size="default" checked={true} />
                  <p className="text-[11px] text-[var(--field-supporting)]">M — 32×32</p>
                </div>
              </div>
            </Row>

            <Row label="3 · With label and description">
              <div className="flex flex-col gap-[10px]">
                <Checkbox label="Enable AI suggestions" description="Receive real-time suggestions powered by the selected model" />
                <Checkbox label="Auto-save drafts" description="Save workflow drafts every 30 seconds automatically" checked />
                <Checkbox label="Public visibility" description="Make this workflow visible to all workspace members" disabled />
              </div>
            </Row>

            <Row label="4 · Interactive list (click to toggle)">
              <div className="flex flex-col gap-[8px] w-[280px]">
                {["Claude Sonnet 4.5","Claude Haiku 4.5","GPT-4o","Gemini 1.5 Pro","Llama 3.1"].map((opt, i) => (
                  <Checkbox
                    key={opt}
                    checked={refChecks[i] ?? false}
                    onChange={v => setRefChecks(prev => { const n=[...prev]; n[i]=v; return n })}
                    label={opt}
                  />
                ))}
              </div>
            </Row>

            <Row label="5 · Used as Menu leading slot">
              <Menu>
                {["Include metadata","Compress output","Add timestamps","Verbose logging"].map((opt,i) => (
                  <MenuItem
                    key={opt}
                    label={opt}
                    checkbox={<Checkbox size="sm" checked={i===0||i===2} />}
                  />
                ))}
              </Menu>
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Toggle page ─────────────────────────────────────────────────────────────

function TogglePage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,        setTab]       = useState<"overview" | "playground" | "reference">("overview")
  const [tgSize,     setTgSize]    = useState<"default" | "sm" | "lg">("default")
  const [tgChecked,  setTgChecked] = useState(false)
  const [tgDisabled, setTgDisabled]= useState(false)
  const [showLabel,  setShowLabel] = useState(false)
  const [showDesc,   setShowDesc]  = useState(false)

  // Reference settings group
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: false,
    autoSave: true,
    analytics: false,
    betaFeatures: false,
  })
  const toggleSetting = (k: keyof typeof settings) =>
    setSettings(s => ({ ...s, [k]: !s[k] }))

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Toggle</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            On/Off switch for binary settings that take effect immediately — no "Save" button needed.
            The thumb slides with a CSS transition. 3 sizes, 4 states (Off/On × Enabled/Disabled).
          </p>
        </div>
        <SpecButton onClick={() => openSpec("toggle")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ─────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">All sizes and states</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] p-[24px] flex flex-col gap-[20px]">
                {(["lg","default","sm"] as const).map(s => {
                  const dims  = s==="lg"?"52×32px":s==="sm"?"26×16px":"39×24px"
                  return (
                    <div key={s} className="flex flex-col gap-[8px]">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">
                        Size {s.toUpperCase()} — {dims}
                      </p>
                      <div className="flex flex-wrap gap-[20px] items-center">
                        {[
                          { checked: false, disabled: false, lbl: "Off" },
                          { checked: true,  disabled: false, lbl: "On"  },
                          { checked: false, disabled: true,  lbl: "Off · Disabled" },
                          { checked: true,  disabled: true,  lbl: "On · Disabled"  },
                        ].map(c => (
                          <div key={c.lbl} className="flex flex-col gap-[6px] items-center">
                            <Toggle size={s} checked={c.checked} disabled={c.disabled} />
                            <p className="text-[11px] text-[var(--field-supporting)]">{c.lbl}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">With label</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
                <Toggle label="Dark mode" checked />
                <Toggle label="Email notifications" description="Receive alerts for mentions and assigned tasks" />
                <Toggle label="Beta features" description="Access experimental features before public release" disabled />
              </div>
            </div>
          </div>
        )}

        {/* ── Playground ───────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="Size"
                options={[{label:"S — 26×16",value:"sm"},{label:"M — 39×24",value:"default"},{label:"L — 52×32",value:"lg"}]}
                value={tgSize}
                onChange={v => setTgSize(v as "default" | "sm" | "lg")}
              />
              <CtrlToggle label="On"       value={tgChecked}  onChange={setTgChecked} />
              <CtrlToggle label="Disabled" value={tgDisabled} onChange={setTgDisabled} />
              <CtrlToggle label="Label"    value={showLabel}  onChange={setShowLabel} />
              <CtrlToggle label="Desc"     value={showDesc}   onChange={v => { setShowDesc(v); if (v) setShowLabel(true) }} />
            </div>
            <div className="flex items-center justify-center min-h-[100px] rounded-md border border-[var(--field-border)] border-dashed px-[40px]">
              <Toggle
                size={tgSize}
                checked={tgChecked}
                disabled={tgDisabled}
                onChange={setTgChecked}
                label={showLabel ? "Enable this setting" : undefined}
                description={showDesc ? "Changes take effect immediately without saving" : undefined}
              />
            </div>
          </div>
        )}

        {/* ── Reference ────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">
            <Row label="1 · Sizes — S / M / L">
              <div className="flex items-end gap-[24px]">
                {(["sm","default","lg"] as const).map(s => (
                  <div key={s} className="flex flex-col gap-[8px] items-center">
                    <Toggle size={s} checked />
                    <p className="text-[11px] text-[var(--field-supporting)]">
                      {s==="sm"?"S 26×16":s==="default"?"M 39×24":"L 52×32"}
                    </p>
                  </div>
                ))}
              </div>
            </Row>

            <Row label="2 · All 4 states — Off/On × Enabled/Disabled">
              <div className="flex flex-wrap gap-[24px] items-center">
                {[
                  { checked: false, disabled: false, lbl: "Off" },
                  { checked: true,  disabled: false, lbl: "On"  },
                  { checked: false, disabled: true,  lbl: "Off disabled" },
                  { checked: true,  disabled: true,  lbl: "On disabled"  },
                ].map(c => (
                  <div key={c.lbl} className="flex flex-col gap-[6px] items-center">
                    <Toggle checked={c.checked} disabled={c.disabled} />
                    <p className="text-[11px] text-[var(--field-supporting)]">{c.lbl}</p>
                  </div>
                ))}
              </div>
            </Row>

            <Row label="3 · Settings panel (interactive)">
              <div className="w-[320px] flex flex-col gap-0 divide-y divide-[var(--field-border)] rounded-[8px] border border-[var(--field-border)] overflow-hidden">
                {[
                  { key: "darkMode",      label: "Dark mode",           desc: "Use dark theme across the app" },
                  { key: "notifications", label: "Push notifications",  desc: "Get notified about activity" },
                  { key: "autoSave",      label: "Auto-save drafts",    desc: "Save every 30 seconds automatically" },
                  { key: "analytics",     label: "Usage analytics",     desc: "Share anonymized data to improve the product" },
                  { key: "betaFeatures",  label: "Beta features",       desc: "Early access to experimental features", disabled: true },
                ].map(row => (
                  <div key={row.key} className="flex items-center justify-between px-[16px] py-[12px]">
                    <div>
                      <p className="text-[14px] font-medium text-[var(--foreground)]">{row.label}</p>
                      <p className="text-[12px] text-[var(--field-supporting)]">{row.desc}</p>
                    </div>
                    <Toggle
                      checked={settings[row.key as keyof typeof settings]}
                      disabled={row.disabled}
                      onChange={() => !row.disabled && toggleSetting(row.key as keyof typeof settings)}
                    />
                  </div>
                ))}
              </div>
            </Row>

            <Row label="4 · Size S — compact rows">
              <div className="w-[260px] flex flex-col gap-[8px]">
                {["Verbose logging","Include timestamps","Pretty-print JSON","Stream responses"].map((opt,i) => (
                  <div key={opt} className="flex items-center justify-between">
                    <span className="text-[13px] text-[var(--field-text)]">{opt}</span>
                    <Toggle size="sm" checked={i===0||i===3} />
                  </div>
                ))}
              </div>
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Table page ─────────────────────────────────────────────────────────────

type Contact = { name: string; role: string; status: string; date: string }
type Order   = { id: string; product: string; qty: number; amount: string; status: string }

const TABLE_CONTACTS: Contact[] = [
  { name: "Sarah Chen",    role: "Product Designer",    status: "Active",   date: "2026-01-15" },
  { name: "Marco Rivera",  role: "Frontend Engineer",   status: "Active",   date: "2026-02-03" },
  { name: "Aisha Johnson", role: "Data Scientist",      status: "Inactive", date: "2025-11-28" },
  { name: "Tom Nakamura",  role: "UX Researcher",       status: "Active",   date: "2026-03-09" },
  { name: "Elena Vasquez", role: "Product Manager",     status: "Pending",  date: "2026-04-01" },
]

const TABLE_ORDERS: Order[] = [
  { id: "#4021", product: "Design System License",   qty: 1,  amount: "$2,400", status: "Paid"    },
  { id: "#4022", product: "Prototyping Kit",         qty: 3,  amount: "$720",   status: "Pending" },
  { id: "#4023", product: "Component Library Pro",   qty: 2,  amount: "$990",   status: "Paid"    },
  { id: "#4024", product: "Design Audit",            qty: 1,  amount: "$1,800", status: "Draft"   },
]

function StatusTag({ value }: { value: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active:   { bg: "var(--tag-success-bg)",     color: "var(--tag-success-fg)"     },
    Inactive: { bg: "var(--tag-neutral-bg)",     color: "var(--tag-neutral-fg)"     },
    Pending:  { bg: "var(--tag-alert-bg)",       color: "var(--tag-alert-fg)"       },
    Paid:     { bg: "var(--tag-success-bg)",     color: "var(--tag-success-fg)"     },
    Draft:    { bg: "var(--tag-secondary-bg)",   color: "var(--tag-secondary-fg)"   },
  }
  const style = map[value] ?? map["Inactive"]
  return (
    <span
      className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      {value}
    </span>
  )
}

const CONTACT_COLUMNS: TableColumn<Contact>[] = [
  { key: "name",   header: "Name",   width: "200px" },
  { key: "role",   header: "Role",   width: "220px" },
  { key: "status", header: "Status", width: "120px", render: r => <StatusTag value={r.status} /> },
  { key: "date",   header: "Joined", width: "140px" },
]

const ORDER_COLUMNS: TableColumn<Order>[] = [
  { key: "id",      header: "Order",   width: "80px"  },
  { key: "product", header: "Product", width: "240px" },
  { key: "qty",     header: "Qty",     width: "60px",  align: "center" },
  { key: "amount",  header: "Amount",  width: "120px", align: "right"  },
  { key: "status",  header: "Status",  width: "100px", render: r => <StatusTag value={r.status} /> },
]

// ── Team demo — Avatar + Link text + Avatar Group + Status + Menu ─────────────

type TeamMember = { name: string; team: string; collaborators: string[]; status: string }

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Sarah Chen",    team: "Product",     collaborators: ["Marco Rivera", "Aisha Johnson"],             status: "Active"   },
  { name: "Marco Rivera",  team: "Engineering", collaborators: ["Tom Nakamura", "Sarah Chen"],                status: "Active"   },
  { name: "Aisha Johnson", team: "Data",        collaborators: [],                                            status: "Inactive" },
  { name: "Tom Nakamura",  team: "Research",    collaborators: ["Sarah Chen", "Elena Vasquez", "Marco Rivera"], status: "Active" },
  { name: "Elena Vasquez", team: "Strategy",    collaborators: ["Sarah Chen"],                                status: "Pending"  },
]

const TEAM_COLUMNS: TableColumn<TeamMember>[] = [
  { key: "name",          header: "Member",        width: "220px", render: r => <TableCellAvatarLink name={r.name} /> },
  { key: "team",          header: "Team",          width: "140px" },
  { key: "collaborators", header: "Collaborators", width: "120px", render: r =>
      r.collaborators.length > 0
        ? <TableCellAvatarGroup names={r.collaborators} max={3} />
        : <span className="text-[var(--field-placeholder)] text-[12px]">—</span>
  },
  { key: "status",  header: "Status", width: "110px", render: r => <StatusTag value={r.status} /> },
  { key: "_menu",   header: "",       width: "48px",  align: "center", render: () => <TableCellMenu /> },
]

// ── Files demo — Icon + Link text + Link text + Menu ──────────────────────────

type FileRow = { name: string; type: string; size: string; modified: string }

const FILES: FileRow[] = [
  { name: "Design System Spec.pdf", type: "PDF", size: "2.4 MB", modified: "2026-06-01" },
  { name: "Component Library.fig",  type: "FIG", size: "18 MB",  modified: "2026-06-15" },
  { name: "Brand Guidelines.pdf",   type: "PDF", size: "8.1 MB", modified: "2026-04-10" },
  { name: "API Reference.md",       type: "DOC", size: "124 KB", modified: "2026-05-28" },
  { name: "Prototype v3.fig",       type: "FIG", size: "41 MB",  modified: "2026-06-20" },
]

const FILE_ICONS: Record<string, string> = { PDF: "FileText", FIG: "Layout", DOC: "FileText", default: "File" }

const FILE_COLUMNS: TableColumn<FileRow>[] = [
  { key: "name", header: "File", render: r => {
      const iconName = FILE_ICONS[r.type] ?? FILE_ICONS["default"]
      const I = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName]
      return <TableCellIconText icon={I ? <I size={14} strokeWidth={1.75} /> : null} isLink>{r.name}</TableCellIconText>
  }},
  { key: "type",     header: "Type",     width: "72px"  },
  { key: "size",     header: "Size",     width: "100px", align: "right" },
  { key: "modified", header: "Modified", width: "140px" },
  { key: "_menu",    header: "",         width: "48px",  align: "center", render: () => <TableCellMenu /> },
]

// ── AI Suggest demo — Icon + Link text + Action button ────────────────────────

type SuggestionRow = { item: string; model: string; confidence: string; status: string }

const SUGGESTIONS: SuggestionRow[] = [
  { item: "Refactor auth middleware",     model: "Claude 4",  confidence: "94%", status: "Pending" },
  { item: "Update API rate limit config", model: "Claude 4",  confidence: "88%", status: "Active"  },
  { item: "Add retry logic to job queue", model: "Claude 4",  confidence: "91%", status: "Pending" },
  { item: "Migrate legacy endpoints",     model: "Claude 4",  confidence: "79%", status: "Draft"   },
]

const SUGGEST_COLUMNS: TableColumn<SuggestionRow>[] = [
  { key: "item", header: "Suggestion", render: r => {
      const Sparkles = (LucideIcons as unknown as Record<string, LucideIcon>)["Sparkles"]
      return (
        <div className="flex items-center gap-[8px]">
          <TableCellIconText icon={Sparkles ? <Sparkles size={14} strokeWidth={1.75} /> : null} isLink>
            {r.item}
          </TableCellIconText>
          <button
            className="shrink-0 px-[8px] h-[24px] rounded-[6px] text-[11px] font-medium
              bg-[var(--tag-informative-bg)] text-[var(--tag-informative-fg)]
              hover:opacity-80 transition-opacity cursor-pointer"
            onClick={e => e.stopPropagation()}
          >
            Apply
          </button>
        </div>
      )
  }},
  { key: "model",      header: "Model",      width: "120px" },
  { key: "confidence", header: "Confidence", width: "110px", align: "right" },
  { key: "status",     header: "Status",     width: "110px", render: r => <StatusTag value={r.status} /> },
]

// ── Playground columns — one per DS cell-type variant ────────────────────────

// Just text — CONTACT_COLUMNS already covers this (no render props)

// Tag variant — contacts with Tag as the primary focus
const TAG_COLUMNS: TableColumn<Contact>[] = [
  { key: "name",   header: "Name",   width: "200px" },
  { key: "role",   header: "Role",   width: "200px" },
  { key: "status", header: "Status", width: "140px", render: r => <StatusTag value={r.status} /> },
  { key: "date",   header: "Joined", width: "160px" },
]

// Checkbox + Text — same columns; selectable toggled in the playground

// Link text — name column becomes a link
const LINK_TEXT_COLUMNS: TableColumn<Contact>[] = [
  { key: "name",   header: "Name",   width: "220px", render: r => <TableCellLink>{r.name}</TableCellLink> },
  { key: "role",   header: "Role",   width: "220px" },
  { key: "status", header: "Status", width: "120px", render: r => <StatusTag value={r.status} /> },
  { key: "date",   header: "Joined", width: "140px" },
]

// Avatar — single avatar cell (no name text in the avatar column)
const AVATAR_COLUMNS: TableColumn<TeamMember>[] = [
  { key: "_avatar", header: "User",  width: "56px",  render: r => <TableCellAvatar name={r.name} /> },
  { key: "name",    header: "Name",  width: "180px" },
  { key: "team",    header: "Team",  width: "160px" },
  { key: "status",  header: "Status", width: "110px", render: r => <StatusTag value={r.status} /> },
]

// Menu — orders table with actions column at the end
const MENU_COLUMNS: TableColumn<Order>[] = [
  { key: "id",      header: "Order",   width: "80px"  },
  { key: "product", header: "Product" },
  { key: "amount",  header: "Amount",  width: "110px", align: "right" },
  { key: "status",  header: "Status",  width: "100px", render: r => <StatusTag value={r.status} /> },
  { key: "_menu",   header: "",        width: "48px",  align: "center", render: () => <TableCellMenu /> },
]

function TablePage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  type CellTypeKey =
    | "just-text"
    | "tag"
    | "checkbox"
    | "link-text"
    | "icon-link"
    | "icon-link-action"
    | "avatar"
    | "avatar-link"
    | "menu"

  const CELL_TYPE_META: Record<CellTypeKey, {
    label:     string
    dsVariant: string
    cols:      TableColumn<Record<string,unknown>>[]
    data:      Record<string,unknown>[]
    selectable?: boolean
  }> = {
    "just-text":       { label: "Just text",            dsVariant: "Tag=No, Link-text=No, Icon=No, Button=No",               cols: CONTACT_COLUMNS    as TableColumn<Record<string,unknown>>[], data: TABLE_CONTACTS as Record<string,unknown>[] },
    "tag":             { label: "Tag",                  dsVariant: "Tag=Yes",                                                 cols: TAG_COLUMNS        as TableColumn<Record<string,unknown>>[], data: TABLE_CONTACTS as Record<string,unknown>[] },
    "checkbox":        { label: "Checkbox + Text",      dsVariant: "checkbox=Yes",                                            cols: CONTACT_COLUMNS    as TableColumn<Record<string,unknown>>[], data: TABLE_CONTACTS as Record<string,unknown>[], selectable: true },
    "link-text":       { label: "Link text",            dsVariant: "Link-text=Yes",                                           cols: LINK_TEXT_COLUMNS  as TableColumn<Record<string,unknown>>[], data: TABLE_CONTACTS as Record<string,unknown>[] },
    "icon-link":       { label: "Icon + Link text",     dsVariant: "Icon=Yes, Link-text=Yes",                                 cols: FILE_COLUMNS       as TableColumn<Record<string,unknown>>[], data: FILES          as Record<string,unknown>[] },
    "icon-link-action":{ label: "Icon + Link + Action", dsVariant: "Icon=Yes, Link-text=Yes, Button=Yes",                     cols: SUGGEST_COLUMNS    as TableColumn<Record<string,unknown>>[], data: SUGGESTIONS    as Record<string,unknown>[] },
    "avatar":          { label: "Avatar",               dsVariant: "Avatars=Yes (single)",                                    cols: AVATAR_COLUMNS     as TableColumn<Record<string,unknown>>[], data: TEAM_MEMBERS   as Record<string,unknown>[] },
    "avatar-link":     { label: "Avatar + Link text",   dsVariant: "Avatar and text=Yes, Link-text=Yes",                      cols: TEAM_COLUMNS       as TableColumn<Record<string,unknown>>[], data: TEAM_MEMBERS   as Record<string,unknown>[] },
    "menu":            { label: "Menu",                 dsVariant: "Button=Yes (kebab)",                                      cols: MENU_COLUMNS       as TableColumn<Record<string,unknown>>[], data: TABLE_ORDERS   as Record<string,unknown>[] },
  }

  const [tab,          setTab]         = useState<"overview" | "playground" | "reference">("overview")
  const [tblSize,      setTblSize]     = useState<"default" | "sm">("default")
  const [selectedRows, setSelectedRows]= useState<Set<number>>(new Set())
  const [cellType,     setCellType]    = useState<CellTypeKey>("just-text")

  const current    = CELL_TYPE_META[cellType]
  const isSelectable = current.selectable ?? false

  const handleRowSelect = (index: number, checked: boolean) => {
    setSelectedRows(prev => {
      const next = new Set(prev)
      checked ? next.add(index) : next.delete(index)
      return next
    })
  }
  const handleSelectAll = (allChecked: boolean) => {
    setSelectedRows(allChecked ? new Set(current.data.map((_, i) => i)) : new Set())
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Table</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Structured data layout for lists, records, and tabular content.
            2 sizes, optional row selection, custom cell renderers. Tokens adapt automatically to light/dark mode.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("table")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ─────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[32px]">

            {/* Usage guidelines — source: DS Documentation frame 12257:30315 */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Usage guidelines</h2>
              <div className="grid grid-cols-2 gap-[12px]">

                {/* Do */}
                <div
                  className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-success-bg)", border: "1px solid var(--tag-success-bd)" }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-success-fg)" }}>
                    ✅ When to use
                  </p>
                  {[
                    "Display large volumes of structured data where users need to scan, compare, or act on multiple rows at once.",
                    "Use checkboxes (selectable prop) when bulk actions are needed — bulk delete, bulk export.",
                    "Use the Tag cell variant to display status or category labels inline within rows.",
                    "Use Avatar / Avatar+text variants for tables listing people, users, or accounts.",
                    "Use the Icon + Link-text variant for navigable items — click to open a detail view.",
                    "Use Size S in compact dashboards or side-panels where vertical space is limited; Size M is the default.",
                    "Pair with a Data Footer for paginated datasets — always show current range and total count.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] leading-[1.5]" style={{ color: "var(--tag-success-fg)", opacity: 0.85 }}>
                      • {t}
                    </p>
                  ))}
                </div>

                {/* Don't */}
                <div
                  className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-error-bg)", border: "1px solid var(--tag-error-bd)" }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-error-fg)" }}>
                    ❌ When not to use
                  </p>
                  {[
                    "Don't use a Table for fewer than 3–4 rows of simple data — a list or card layout is more appropriate.",
                    "Don't mix Size M and Size S rows within the same table — maintain size consistency throughout.",
                    "Don't overload rows with more than 4–5 column types — prefer progressive disclosure via flyout or detail panels.",
                    "Don't use tables on mobile — the minimum supported viewport is 1024px (laptop). Use list views on smaller screens.",
                    "Don't use a Table as a form — cells are read-only display elements, not input containers.",
                    "Don't omit the Data Footer on paginated datasets — users need context on total records and current page.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] leading-[1.5]" style={{ color: "var(--tag-error-fg)", opacity: 0.85 }}>
                      • {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Basic table — M size</h2>
              <Table
                columns={CONTACT_COLUMNS}
                data={TABLE_CONTACTS}
                size="default"
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">With row selection</h2>
              <Table
                columns={CONTACT_COLUMNS}
                data={TABLE_CONTACTS}
                size="default"
                selectable
                selectedRows={new Set([1, 3])}
                onRowSelect={() => {}}
                onSelectAll={() => {}}
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">S size — compact</h2>
              <Table
                columns={ORDER_COLUMNS}
                data={TABLE_ORDERS}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Empty state</h2>
              <Table
                columns={CONTACT_COLUMNS}
                data={[]}
                size="default"
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">
                Avatar + Link text + Avatar group + Menu
              </h2>
              <p className="text-[13px] text-[var(--field-supporting)] -mt-[4px]">
                DS variants: <span className="font-mono">Avatar and text=Yes</span> · <span className="font-mono">Avatars=Yes</span> · <span className="font-mono">Button=Yes (kebab)</span>
              </p>
              <Table
                columns={TEAM_COLUMNS}
                data={TEAM_MEMBERS}
                size="default"
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">
                Icon + Link text + Menu
              </h2>
              <p className="text-[13px] text-[var(--field-supporting)] -mt-[4px]">
                DS variants: <span className="font-mono">Icon=Yes, Link-text=Yes</span> · <span className="font-mono">Button=Yes (kebab)</span>
              </p>
              <Table
                columns={FILE_COLUMNS}
                data={FILES}
                size="default"
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">
                Icon + Link text + Inline action button
              </h2>
              <p className="text-[13px] text-[var(--field-supporting)] -mt-[4px]">
                DS variant: <span className="font-mono">Icon=Yes, Link-text=Yes, Button=Yes</span> — AI-assisted rows with inline suggestion action
              </p>
              <Table
                columns={SUGGEST_COLUMNS}
                data={SUGGESTIONS}
                size="default"
              />
            </div>
          </div>
        )}

        {/* ── Playground ───────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[24px]">

            {/* Cell type selector */}
            <div className="flex flex-col gap-[8px]">
              <p className="text-[12px] font-semibold text-[var(--field-supporting)] uppercase tracking-wider">
                Cell type — DS variant
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {(Object.keys(CELL_TYPE_META) as CellTypeKey[]).map(k => {
                  const m = CELL_TYPE_META[k]
                  const active = cellType === k
                  return (
                    <button
                      key={k}
                      onClick={() => { setCellType(k); setSelectedRows(new Set()) }}
                      className={[
                        "flex flex-col items-start px-[12px] py-[8px] rounded-[8px] text-left transition-colors",
                        active
                          ? "bg-[var(--field-border-focus)] text-white"
                          : "bg-[var(--field-border)] text-[var(--field-text)] opacity-50 hover:opacity-80",
                      ].join(" ")}
                    >
                      <span className="text-[13px] font-semibold leading-[1.2]">{m.label}</span>
                      <span className={["text-[10px] font-normal mt-[3px] font-mono leading-[1.2]", active ? "opacity-80" : "opacity-60"].join(" ")}>
                        {m.dsVariant}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Size selector */}
            <div className="flex items-center gap-[24px]">
              <div className="flex flex-col gap-[8px]">
                <p className="text-[12px] font-semibold text-[var(--field-supporting)] uppercase tracking-wider">Size</p>
                <div className="flex gap-[8px]">
                  {(["default", "sm"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setTblSize(s)}
                      className={[
                        "px-[14px] py-[6px] rounded-[6px] text-[13px] font-medium transition-colors",
                        tblSize === s
                          ? "bg-[var(--field-border-focus)] text-white"
                          : "bg-[var(--field-border)] text-[var(--field-text)] opacity-40 hover:opacity-70",
                      ].join(" ")}
                    >
                      {s === "default" ? "M — 60px rows" : "S — 40px rows"}
                    </button>
                  ))}
                </div>
              </div>

              {isSelectable && (
                <p className="text-[12px] text-[var(--field-supporting)] mt-[20px]">
                  {selectedRows.size > 0 ? `${selectedRows.size} row(s) selected` : "No selection"}
                </p>
              )}
            </div>

            {/* Live table */}
            <Table
              columns={current.cols}
              data={current.data}
              size={tblSize}
              selectable={isSelectable}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
            />
          </div>
        )}

        {/* ── Reference ────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Token reference</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">Token</th>
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">DS Variable</th>
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">Light</th>
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">Dark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { token: "--table-bg",              ds: "Surface/Neutral/White",        light: "#ffffff",             dark: "rgba(255,255,255,0.10)" },
                      { token: "--table-header-bg",       ds: "Surface/Neutral/White",        light: "#ffffff",             dark: "rgba(255,255,255,0.10)" },
                      { token: "--table-border",          ds: "Border/Neutral/Lighter",       light: "rgba(0,0,0,0.08)",    dark: "rgba(255,255,255,0.08)" },
                      { token: "--table-header-text",     ds: "Text/Subtitle",                light: "#2a2a2a",             dark: "rgba(255,255,255,0.6)"  },
                      { token: "--table-cell-text",       ds: "Text/Body",                    light: "#5c5c5c",             dark: "rgba(255,255,255,0.6)"  },
                      { token: "--table-row-hover-bg",    ds: "Surface/Neutral/Default",      light: "#f2f2f2",             dark: "rgba(255,255,255,0.08)" },
                      { token: "--table-row-selected-bg", ds: "Surface/Primary/More Subtle",  light: "rgba(246,249,255,1)", dark: "rgba(43,127,255,0.08)"  },
                    ].map((r, i) => (
                      <tr key={r.token} className={i % 2 === 0 ? "bg-[var(--table-bg)]" : "bg-[var(--table-header-bg)]"}>
                        <td className="py-[10px] px-[12px] font-mono text-[11px] text-[var(--field-border-focus)]">{r.token}</td>
                        <td className="py-[10px] px-[12px] text-[var(--table-cell-text)]">{r.ds}</td>
                        <td className="py-[10px] px-[12px] font-mono text-[11px] text-[var(--table-cell-text)]">{r.light}</td>
                        <td className="py-[10px] px-[12px] font-mono text-[11px] text-[var(--table-cell-text)]">{r.dark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Cell type helpers</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">Component</th>
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">DS variant</th>
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">Key props</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { comp: "TableCellLink",        ds: "Link-text=Yes",                          props: "children, onClick?" },
                      { comp: "TableCellAvatar",       ds: "Avatars=Yes (single)",                   props: "name, src?, size?" },
                      { comp: "TableCellAvatarGroup",  ds: "Avatars=Yes (stacked)",                  props: "names[], max?, size?" },
                      { comp: "TableCellAvatarLink",   ds: "Avatar and text=Yes, Link-text=Yes",     props: "name, src?, size?, onClick?" },
                      { comp: "TableCellIconText",     ds: "Icon=Yes (+ optionally Link-text=Yes)",  props: "icon, children, isLink?, onClick?" },
                      { comp: "TableCellMenu",         ds: "Button=Yes (kebab)",                     props: "onClick?" },
                    ].map((r, i) => (
                      <tr key={r.comp} className={i % 2 === 0 ? "bg-[var(--table-bg)]" : "bg-[var(--table-header-bg)]"}>
                        <td className="py-[10px] px-[12px] font-mono text-[11px] text-[var(--field-border-focus)]">{r.comp}</td>
                        <td className="py-[10px] px-[12px] font-mono text-[11px] text-[var(--table-cell-text)]">{r.ds}</td>
                        <td className="py-[10px] px-[12px] text-[var(--table-cell-text)]">{r.props}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Column API</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">Property</th>
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">Type</th>
                      <th className="text-left py-[10px] px-[12px] font-semibold text-[var(--table-header-text)]">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { prop: "key",    type: "string",                   note: "Unique identifier; used to read row[key] when no render fn" },
                      { prop: "header", type: "string",                   note: "Column header label" },
                      { prop: "width",  type: "string?",                  note: "CSS width (e.g. '200px', '30%'). Omit for auto." },
                      { prop: "align",  type: '"left"|"center"|"right"?', note: "Text-align for header + cells. Default: left." },
                      { prop: "render", type: "(row, index) => ReactNode?", note: "Custom cell renderer. Falls back to String(row[key])." },
                    ].map((r, i) => (
                      <tr key={r.prop} className={i % 2 === 0 ? "bg-[var(--table-bg)]" : "bg-[var(--table-header-bg)]"}>
                        <td className="py-[10px] px-[12px] font-mono text-[11px] text-[var(--field-border-focus)]">{r.prop}</td>
                        <td className="py-[10px] px-[12px] font-mono text-[11px] text-[var(--table-cell-text)]">{r.type}</td>
                        <td className="py-[10px] px-[12px] text-[var(--table-cell-text)]">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Highlight Icon page ────────────────────────────────────────────────────

function HighlightIconPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,        setTab]       = useState<"overview" | "playground" | "reference">("overview")
  const [hiVariant,  setHiVariant] = useState<HighlightIconVariant>("informative")
  const [hiSize,     setHiSize]    = useState<HighlightIconSize>("md")
  const [hiColor,    setHiColor]   = useState<"dark" | "default">("dark")
  const [hiIcon,     setHiIcon]    = useState("Zap")
  const [hiSearch,   setHiSearch]  = useState("")

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Highlight Icon</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Rounded semantic icon container with tinted background. Used as leading slot in Menu/Dropdown items,
            list rows, and standalone context indicators. 3 sizes × 9 color variants × 2 icon color modes.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("highlight-icon")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ─────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Anatomy</h2>
              <div className="rounded-[8px] border border-[var(--field-border)] p-[20px] flex flex-wrap gap-[32px]">
                {(["lg","md","sm"] as HighlightIconSize[]).map(s => (
                  <div key={s} className="flex flex-col gap-[8px] items-start">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">
                      Size {s.toUpperCase()}
                    </p>
                    <HighlightIcon
                      variant="informative" size={s}
                      icon={(() => { const I=(LucideIcons as unknown as Record<string,LucideIcon>)["Zap"]; return I?<I size={s==="sm"?16:24} strokeWidth={1.75}/>:null })()}
                    />
                    <p className="text-[12px] text-[var(--field-supporting)]">
                      {s==="lg"?"40×40px":s==="md"?"32×32px":"24×24px"}
                    </p>
                    <p className="text-[12px] text-[var(--field-supporting)]">
                      icon {s==="sm"?"16×16":"24×24"} · pad {s==="lg"?"8":"4"}px · r-{s==="sm"?"4":"8"}
                    </p>
                  </div>
                ))}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Icon Color</p>
                  <div className="flex gap-[8px]">
                    <div className="flex flex-col gap-[4px] items-center">
                      <HighlightIcon variant="informative" size="md" iconColor="dark"
                        icon={(() => { const I=(LucideIcons as unknown as Record<string,LucideIcon>)["Zap"]; return I?<I size={24} strokeWidth={1.75}/>:null })()}
                      />
                      <p className="text-[11px] text-[var(--field-supporting)]">dark</p>
                    </div>
                    <div className="flex flex-col gap-[4px] items-center">
                      <HighlightIcon variant="informative" size="md" iconColor="default"
                        icon={(() => { const I=(LucideIcons as unknown as Record<string,LucideIcon>)["Zap"]; return I?<I size={24} strokeWidth={1.75}/>:null })()}
                      />
                      <p className="text-[11px] text-[var(--field-supporting)]">default</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">All 9 variants — Size L</h2>
              <div className="flex flex-wrap gap-[12px]">
                {HI_VARIANTS.map(v => {
                  const iconName = HI_VARIANT_ICONS[v]
                  const Icon = (LucideIcons as unknown as Record<string,LucideIcon>)[iconName]
                  return (
                    <div key={v} className="flex flex-col gap-[6px] items-center">
                      <HighlightIcon variant={v} size="lg"
                        icon={Icon ? <Icon size={24} strokeWidth={1.75}/> : null}
                      />
                      <p className="text-[11px] text-[var(--field-supporting)] capitalize">{v.replace("-"," ")}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Playground ───────────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="Variant"
                options={HI_VARIANTS.map(v => ({ label: v.replace("-"," "), value: v }))}
                value={hiVariant}
                onChange={v => setHiVariant(v as HighlightIconVariant)}
              />
              <CtrlGroup
                label="Size"
                options={[
                  { label: "L — 40×40px", value: "lg" },
                  { label: "M — 32×32px", value: "md" },
                  { label: "S — 24×24px", value: "sm" },
                ]}
                value={hiSize}
                onChange={v => setHiSize(v as HighlightIconSize)}
              />
              <CtrlGroup
                label="Icon Color"
                options={[
                  { label: "Dark (default)", value: "dark"    },
                  { label: "Default",        value: "default" },
                ]}
                value={hiColor}
                onChange={v => setHiColor(v as "dark" | "default")}
              />
              <div className="flex flex-col gap-[6px]">
                <p className="text-[12px] font-medium text-[var(--field-supporting)]">Icon</p>
                <input
                  type="text"
                  placeholder="Search icon..."
                  value={hiSearch}
                  onChange={e => setHiSearch(e.target.value)}
                  className="h-[32px] px-[8px] text-[12px] rounded-[6px] border border-[var(--field-border)] bg-[var(--field-bg)] text-[var(--field-text)] placeholder:text-[var(--field-supporting)] outline-none focus:border-[#2173ff] transition-colors"
                />
                <div className="h-[80px] overflow-y-auto rounded-[6px] border border-[var(--field-border)] p-[4px] grid grid-cols-8 gap-[2px] content-start">
                  {ICON_CATEGORIES
                    .flatMap(c => c.icons)
                    .filter(ic =>
                      !hiSearch ||
                      ic.dsName.toLowerCase().includes(hiSearch.toLowerCase()) ||
                      ic.lucide.toLowerCase().includes(hiSearch.toLowerCase())
                    )
                    .slice(0, 64)
                    .map(ic => {
                      const Ic = (LucideIcons as unknown as Record<string,LucideIcon>)[ic.lucide]
                      if (!Ic) return null
                      return (
                        <button
                          key={ic.lucide}
                          title={ic.dsName}
                          onClick={() => setHiIcon(ic.lucide)}
                          className={[
                            "w-[28px] h-[28px] flex items-center justify-center rounded-[4px] transition-colors",
                            hiIcon === ic.lucide
                              ? "bg-[#2173ff] text-white"
                              : "text-[var(--field-supporting)] hover:bg-[var(--field-border)] hover:text-[var(--foreground)]",
                          ].join(" ")}
                        >
                          <Ic size={14} strokeWidth={1.75}/>
                        </button>
                      )
                    })
                  }
                </div>
                <p className="text-[11px] text-[var(--field-supporting)]">
                  Activo: <code className="font-mono text-[var(--foreground)]">{hiIcon}</code>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center min-h-[120px] rounded-md border border-[var(--field-border)] border-dashed">
              {(() => {
                const Ic = (LucideIcons as unknown as Record<string,LucideIcon>)[hiIcon]
                const iconPx = hiSize === "sm" ? 16 : 24
                return (
                  <HighlightIcon
                    variant={hiVariant}
                    size={hiSize}
                    iconColor={hiColor}
                    icon={Ic ? <Ic size={iconPx} strokeWidth={1.75}/> : null}
                  />
                )
              })()}
            </div>
          </div>
        )}

        {/* ── Reference ────────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[32px]">

            <Row label="1 · All 9 variants — Icon Color Dark">
              <div className="flex flex-wrap gap-[12px] items-end">
                {HI_VARIANTS.map(v => {
                  const iconName = HI_VARIANT_ICONS[v]
                  const Icon = (LucideIcons as unknown as Record<string,LucideIcon>)[iconName]
                  return (
                    <div key={v} className="flex flex-col gap-[4px] items-center">
                      <HighlightIcon variant={v} size="lg" icon={Icon?<Icon size={24} strokeWidth={1.75}/>:null}/>
                      <p className="text-[10px] text-[var(--field-supporting)] capitalize">{v.replace("-"," ")}</p>
                    </div>
                  )
                })}
              </div>
            </Row>

            <Row label="2 · All 9 variants — Icon Color Default (soft)">
              <div className="flex flex-wrap gap-[12px] items-end">
                {HI_VARIANTS.map(v => {
                  const iconName = HI_VARIANT_ICONS[v]
                  const Icon = (LucideIcons as unknown as Record<string,LucideIcon>)[iconName]
                  return (
                    <div key={v} className="flex flex-col gap-[4px] items-center">
                      <HighlightIcon variant={v} size="lg" iconColor="default" icon={Icon?<Icon size={24} strokeWidth={1.75}/>:null}/>
                      <p className="text-[10px] text-[var(--field-supporting)] capitalize">{v.replace("-"," ")}</p>
                    </div>
                  )
                })}
              </div>
            </Row>

            <Row label="3 · All 3 sizes — informative">
              <div className="flex gap-[24px] items-end">
                {(["lg","md","sm"] as HighlightIconSize[]).map(s => {
                  const Icon = (LucideIcons as unknown as Record<string,LucideIcon>)["Zap"]
                  return (
                    <div key={s} className="flex flex-col gap-[6px] items-center">
                      <HighlightIcon variant="informative" size={s} icon={Icon?<Icon size={s==="sm"?16:24} strokeWidth={1.75}/>:null}/>
                      <p className="text-[11px] text-[var(--field-supporting)]">{s==="lg"?"L · 40×40":s==="md"?"M · 32×32":"S · 24×24"}</p>
                    </div>
                  )
                })}
              </div>
            </Row>

            <Row label="4 · In context — Menu item leading slot (size sm = 24×24)">
              <Menu>
                {HI_VARIANTS.slice(0,5).map(v => {
                  const iconName = HI_VARIANT_ICONS[v]
                  const Icon = (LucideIcons as unknown as Record<string,LucideIcon>)[iconName]
                  return (
                    <MenuItem
                      key={v}
                      label={v.charAt(0).toUpperCase()+v.slice(1).replace("-"," ")}
                      subtext={`variant="${v}"`}
                      leadingIcon={<HighlightIcon variant={v} size="sm" icon={Icon?<Icon size={16} strokeWidth={1.75}/>:null}/>}
                    />
                  )
                })}
              </Menu>
            </Row>

          </div>
        )}
      </div>
    </div>
  )
}

function LucidePreview({ name }: { name: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name]
  if (!Icon) return <span className="text-[10px] opacity-30">?</span>
  return <Icon size={18} strokeWidth={1.75} />
}

// ── TopbarPage ─────────────────────────────────────────────────────────────

function TopbarPage({ openSpec, onAppThemeChange }: { openSpec: (s: SpecModal) => void; onAppThemeChange?: (isDark: boolean) => void }) {
  const [tab, setTab] = useState<"overview" | "variants" | "sub-components" | "playground" | "reference">("overview")
  const [gsPreviewOpen, setGsPreviewOpen] = useState(false)
  const [demoThemeMode, setDemoThemeMode] = useState<ThemeMode>("dark")
  const [demoSelectedTenantId, setDemoSelectedTenantId] = useState("t-1")

  // Playground controls
  const [pgVariant,  setPgVariant]  = useState<"default" | "tablet">("default")
  const [wkName,     setWkName]     = useState("Product Design")
  const [coName,     setCoName]     = useState("AIMS OS")
  const [uName,      setUName]      = useState("Michael O.")
  const [searchPH,   setSearchPH]   = useState("Search…")
  const [showBadge,  setShowBadge]  = useState(false)

  // DS: IA-icon is a single 4-point diamond sparkle → Sparkle (singular), not Sparkles (multiple)
  const SparkleIcon  = (LucideIcons as unknown as Record<string,LucideIcon>)["Sparkle"]
  const BellIcon     = (LucideIcons as unknown as Record<string,LucideIcon>)["Bell"]
  const SettingsIcon = (LucideIcons as unknown as Record<string,LucideIcon>)["Settings"]

  // DS action buttons (Sub-A, left→right):
  //   1. IA-icon           → Sparkle  · variant="primary" (radial gradient + teal glow)
  //   2. Notifications-icon → Bell    · variant="default" (transparent)
  //   3. Settings-icon      → Settings · variant="default" (transparent)
  // All icons: 16×16 (Button pad:4,4,4,4 → 24-8=16px icon space)
  const defaultActions: TopbarAction[] = [
    { icon: SparkleIcon ? <SparkleIcon size={16} strokeWidth={2} /> : null, label: "AI Assistant", variant: "primary" },
    { icon: BellIcon     ? <BellIcon     size={16} strokeWidth={1.75} /> : null, label: "Notifications", badge: showBadge },
    { icon: SettingsIcon ? <SettingsIcon size={16} strokeWidth={1.75} /> : null, label: "Settings" },
  ]

  const demoWorkspaces: WorkspaceItem[] = [
    { id: "ws-1", name: "Product Design", description: "UI/UX & Design Systems", tag: "Active" },
    { id: "ws-2", name: "Engineering",    description: "Frontend & Backend",      tag: "Member" },
    { id: "ws-3", name: "Marketing",      description: "Growth & Brand",          tag: "Member" },
  ]

  const demoTenants: WorkspaceItem[] = [
    { id: "t-1", name: "AIMS OS",        description: "Main organization",       tag: "Active" },
    { id: "t-2", name: "Acme Corp",      description: "Client workspace",        tag: "Member" },
    { id: "t-3", name: "Sandbox",        description: "Testing environment",     tag: "Member" },
  ]

  const demoCompanyName = demoTenants.find(t => t.id === demoSelectedTenantId)?.name ?? "AIMS OS"

  function handleThemeChange(mode: ThemeMode) {
    setDemoThemeMode(mode)
    if (mode !== "auto") onAppThemeChange?.(mode === "dark")
  }

  const tokenRows = [
    { cssVar: "--topbar-text",             dsToken: "Text/Subtitle",           role: "Workspace name",           light: "rgba(42,42,42,1)",    dark: "rgba(255,255,255,0.60)" },
    { cssVar: "--topbar-text-secondary",   dsToken: "Text/Body",               role: "Company name, placeholder", light: "rgba(92,92,92,1)",    dark: "rgba(255,255,255,0.50)" },
    { cssVar: "--topbar-icon",             dsToken: "Icon/Neutral/Dark",        role: "Icons, chevron",           light: "rgba(92,92,92,1)",    dark: "rgba(255,255,255,0.70)" },
    { cssVar: "--topbar-workspace-border", dsToken: "Border/Primary/Subtle",    role: "Left zone + company frame", light: "rgba(233,241,255,1)", dark: "rgba(43,127,255,0.20)"  },
    { cssVar: "--topbar-divider",          dsToken: "Border/Neutral/Subtle",    role: "Vertical + bottom divider", light: "rgba(242,242,242,1)", dark: "rgba(255,255,255,0.08)" },
    { cssVar: "--topbar-btn-hover-bg",     dsToken: "Surface/Neutral/Hover",    role: "Button hover bg",          light: "rgba(250,250,250,1)", dark: "rgba(255,255,255,0.08)" },
    { cssVar: "--topbar-btn-focus-bg",     dsToken: "Surface/Neutral/Default",  role: "Button focus bg",          light: "rgba(242,242,242,1)", dark: "rgba(255,255,255,0.12)" },
    { cssVar: "--topbar-search-bg",        dsToken: "Surface/Neutral/White",    role: "Search field bg",          light: "#ffffff",             dark: "rgba(255,255,255,0.10)" },
    { cssVar: "--topbar-search-border",    dsToken: "Border/Neutral/Lighter",   role: "Search field border",      light: "rgba(186,186,186,1)", dark: "rgba(255,255,255,0.10)" },
    { cssVar: "--topbar-badge-bg",         dsToken: "Error/Notification",       role: "Badge dot",                light: "rgba(211,47,47,1)",   dark: "rgba(255,100,103,1)"    },
    { cssVar: "--topbar-avatar-ring",      dsToken: "Border/Primary/Lighter",   role: "Avatar ring",              light: "rgba(128,175,255,1)", dark: "rgba(43,127,255,0.30)"  },
  ]

  const PreviewWrap = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[var(--canvas)]">
      {children}
    </div>
  )

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Topbar</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Global navigation bar. 36px tall (34px tablet), three fixed zones: workspace selector,
            search trigger, and action buttons + profile. Background comes from the Layout Shell.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("topbar")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",        label: "Overview"        },
          { id: "variants",        label: "Variants"        },
          { id: "sub-components",  label: "Sub-components"  },
          { id: "playground",      label: "Playground"      },
          { id: "reference",       label: "Reference"       },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ──────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[32px]">

            {/* Live preview */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Preview</h2>
              <PreviewWrap>
                <Topbar
                  workspaceName="Product Design"
                  companyName={demoCompanyName}
                  userName="Michael O."
                  userEmail="michael@aimsos.ai"
                  workspaces={demoWorkspaces}
                  selectedWorkspaceId="ws-1"
                  tenants={demoTenants}
                  selectedTenantId={demoSelectedTenantId}
                  onTenantSelect={(id) => { setDemoSelectedTenantId(id); setCoName(demoTenants.find(t => t.id === id)?.name ?? coName) }}
                  themeMode={demoThemeMode}
                  onThemeChange={handleThemeChange}
                  actions={defaultActions}
                />
              </PreviewWrap>
            </div>

            {/* Anatomy */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Anatomy</h2>
              <div className="grid grid-cols-3 gap-[12px]">
                {[
                  { label: "Left zone — 140px", desc: "Workspace avatar (16px) + product name (10px Semi Bold) + chevron button. Bordered pill, opens workspace dropdown." },
                  { label: "Center zone — 250px", desc: "Search trigger field (not a real input). Click opens the Global Search overlay (700×592px panel)." },
                  { label: "Right zone — 232px", desc: "Sub-A: AIMS isotipo + 3 action buttons (24×24). Vertical divider. Sub-B: company selector + user profile avatar." },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-[8px] p-[14px] flex flex-col gap-[6px]"
                    style={{ background: "var(--tag-informative-bg)", border: "1px solid var(--tag-informative-bg)" }}
                  >
                    <p className="text-[12px] font-semibold" style={{ color: "var(--primary)" }}>{item.label}</p>
                    <p className="text-[12px]" style={{ color: "var(--field-supporting)" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage guidelines */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Usage guidelines</h2>
              <div className="grid grid-cols-2 gap-[12px]">
                <div
                  className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-success-bg)", border: "1px solid var(--tag-success-bd)" }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-success-fg)" }}>✅ When to use</p>
                  {[
                    "Place exactly once at the top of every app view — it's a singleton, not a reusable per-page component.",
                    "Pass `actions` to expose global utilities (notifications, settings, app switcher) — max 3 buttons.",
                    "Wire `onSearchFocus` to open the Global Search overlay; don't embed a real search within the topbar.",
                    "Wire `onWorkspaceClick` and `onCompanyClick` to open the DS Left Menu dropdown.",
                    "Use the `tablet` variant when the viewport is below 1024px — adds hamburger for sidebar toggle.",
                    "Set `badge={true}` on a notification action to show the 8px red indicator dot.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-success-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
                <div
                  className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-error-bg)", border: "1px solid var(--tag-error-bd)" }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-error-fg)" }}>❌ When not to use</p>
                  {[
                    "Don't nest a real search input inside the Topbar — search is a trigger only; the overlay lives outside.",
                    "Don't add more than 3 action buttons — the right sub-group A is 80px wide with 4px gaps.",
                    "Don't use the Topbar as a secondary or per-page navigation bar — it's a global shell component.",
                    "Don't set the background on the Topbar itself — it inherits from the Layout Shell (Surface/Neutral/Black).",
                    "Don't hide the workspace zone on mobile — switch to the `tablet` variant and use the hamburger instead.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-error-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Variants ──────────────────────────────────────────────── */}
        {tab === "variants" && (
          <div className="flex flex-col gap-[32px]">

            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Default</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">36px — standard 3-zone layout. Left zone 140px.</p>
              </div>
              <PreviewWrap>
                <Topbar
                  workspaceName="Product Design"
                  companyName={demoCompanyName}
                  userName="Michael O."
                  userEmail="michael@aimsos.ai"
                  workspaces={demoWorkspaces}
                  selectedWorkspaceId="ws-1"
                  tenants={demoTenants}
                  selectedTenantId={demoSelectedTenantId}
                  onTenantSelect={(id) => { setDemoSelectedTenantId(id); setCoName(demoTenants.find(t => t.id === id)?.name ?? coName) }}
                  themeMode={demoThemeMode}
                  onThemeChange={handleThemeChange}
                  actions={defaultActions}
                  variant="default"
                />
              </PreviewWrap>
            </div>

            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Tablet</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">34px — adds hamburger button to left zone (172px). Used at viewports below 1024px.</p>
              </div>
              <PreviewWrap>
                <Topbar
                  workspaceName="Product Design"
                  companyName={demoCompanyName}
                  userName="Michael O."
                  userEmail="michael@aimsos.ai"
                  workspaces={demoWorkspaces}
                  selectedWorkspaceId="ws-1"
                  tenants={demoTenants}
                  selectedTenantId={demoSelectedTenantId}
                  onTenantSelect={(id) => { setDemoSelectedTenantId(id); setCoName(demoTenants.find(t => t.id === id)?.name ?? coName) }}
                  themeMode={demoThemeMode}
                  onThemeChange={handleThemeChange}
                  actions={defaultActions}
                  variant="tablet"
                />
              </PreviewWrap>
            </div>

            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">With notification badge</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">8px red dot on first action button — controlled via <code className="text-[11px] bg-[var(--muted)] px-[4px] py-[1px] rounded-[3px]">badge: true</code> in the actions array.</p>
              </div>
              <PreviewWrap>
                <Topbar
                  workspaceName="Product Design"
                  companyName={demoCompanyName}
                  userName="Michael O."
                  userEmail="michael@aimsos.ai"
                  workspaces={demoWorkspaces}
                  selectedWorkspaceId="ws-1"
                  tenants={demoTenants}
                  selectedTenantId={demoSelectedTenantId}
                  onTenantSelect={(id) => { setDemoSelectedTenantId(id); setCoName(demoTenants.find(t => t.id === id)?.name ?? coName) }}
                  themeMode={demoThemeMode}
                  onThemeChange={handleThemeChange}
                  actions={[
                    { icon: SparkleIcon ? <SparkleIcon size={16} strokeWidth={2} /> : null, label: "AI Assistant", variant: "primary" as const },
                    { icon: BellIcon ? <BellIcon size={16} strokeWidth={1.75} /> : null, label: "Notifications", badge: true },
                    { icon: SettingsIcon ? <SettingsIcon size={16} strokeWidth={1.75} /> : null, label: "Settings" },
                  ]}
                />
              </PreviewWrap>
            </div>

          </div>
        )}

        {/* ── Sub-components ────────────────────────────────────────── */}
        {tab === "sub-components" && (
          <div className="flex flex-col gap-[48px]">

            {/* ── Global Search ───────────────────────────────────────── */}
            <div className="flex flex-col gap-[16px]">
              <div className="flex items-start justify-between gap-[12px]">
                <div>
                  <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Global Search</h2>
                  <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">
                    Full-screen frosted glass overlay. Opens on click of the center search trigger.
                    DS node 15394:15568 · 700×600px.
                  </p>
                </div>
                <button
                  onClick={() => setGsPreviewOpen(true)}
                  className="shrink-0 flex items-center gap-[6px] px-[14px] h-[32px] rounded-[6px] text-[12px] font-semibold transition-opacity hover:opacity-85 cursor-pointer"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  Open preview →
                </button>
              </div>

              {/* States grid */}
              <div className="grid grid-cols-3 gap-[10px]">
                {[
                  { state: "Default",        desc: "Suggested actions + recent searches. Shown when no query and no filters applied." },
                  { state: "Loading",        desc: "5 skeleton rows while results are being fetched. Set loading={true}." },
                  { state: "No results",     desc: "SearchX icon + message + optional 'Clear filters' link. Requires results=[] with a query." },
                  { state: "Search results", desc: "HighlightIcon rows per entity type. Shown when results array has items." },
                  { state: "Filters open",   desc: "FiltersCard floats at left:48 top:68 within the panel. 3 sections: Type · Owner · Status." },
                  { state: "Filters applied",desc: "Applied filters appear as DS Tag chips (informative · purple · success) inside the input row." },
                ].map(item => (
                  <div
                    key={item.state}
                    className="rounded-[8px] p-[12px] flex flex-col gap-[4px]"
                    style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                  >
                    <p className="text-[12px] font-semibold" style={{ color: "var(--foreground)" }}>{item.state}</p>
                    <p className="text-[11px] leading-[1.5]" style={{ color: "var(--field-supporting)" }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Anatomy */}
              <div className="rounded-[8px] p-[16px] flex flex-col gap-[8px]" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <p className="text-[12px] font-semibold" style={{ color: "var(--foreground)" }}>Anatomy — 700×600px panel</p>
                <div className="flex flex-col gap-[4px]">
                  {[
                    ["56px", "Input row", "Search icon · Filter tag chips · Text input · ESC shortcut pill"],
                    ["40px", "Filter chips row", "SlidersHorizontal toggle · Type filter chips (all · agents · channels…)"],
                    ["auto", "Content area", "Scrollable zone — default state / loading / results / no-results"],
                    ["36px", "Bottom bar", "Keyboard shortcuts: ↑↓ Navigate · ↵ Enter/Open"],
                    ["floating", "FiltersCard", "298px overlay · 3 sections (Type · Owner · Status) · Applies filter Tags"],
                  ].map(([height, name, detail]) => (
                    <div key={name} className="flex items-start gap-[10px]">
                      <span className="shrink-0 text-[11px] font-mono w-[56px] text-right" style={{ color: "var(--primary)" }}>{height}</span>
                      <span className="shrink-0 text-[11px] font-semibold w-[128px]" style={{ color: "var(--foreground)" }}>{name}</span>
                      <span className="text-[11px]" style={{ color: "var(--field-supporting)" }}>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)" }} />

            {/* ── Workspace Switcher (Left Menu) ───────────────────────── */}
            <div className="flex flex-col gap-[16px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Workspace Switcher</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">
                  Dropdown from the left zone. Lists all workspaces the user belongs to.
                  DS node 15251:5395 · 320px wide.
                </p>
              </div>
              <div className="flex gap-[24px] items-start">
                {/* Live demo */}
                <TopbarLeftMenu
                  isStatic
                  workspaces={demoWorkspaces}
                  selectedId="ws-1"
                />

                {/* Anatomy + props */}
                <div className="flex-1 flex flex-col gap-[12px]">
                  <div className="rounded-[8px] p-[14px] flex flex-col gap-[6px]" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                    <p className="text-[12px] font-semibold mb-[4px]" style={{ color: "var(--foreground)" }}>Anatomy</p>
                    {[
                      ["28px",  "Section header",   "\"Workspaces\" label · 10px Semi Bold · uppercased"],
                      ["56px",  "Workspace row",    "24px avatar + name (14px) + description (12px) + Tag neutral/active"],
                      ["40px",  "Footer CTA",       "'+ New workspace' · primary color · border-top"],
                    ].map(([h, name, detail]) => (
                      <div key={name} className="flex items-start gap-[8px]">
                        <span className="shrink-0 text-[11px] font-mono w-[36px] text-right" style={{ color: "var(--primary)" }}>{h}</span>
                        <span className="shrink-0 text-[11px] font-semibold w-[120px]" style={{ color: "var(--foreground)" }}>{name}</span>
                        <span className="text-[11px]" style={{ color: "var(--field-supporting)" }}>{detail}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[8px] p-[14px] flex flex-col gap-[4px]" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                    <p className="text-[12px] font-semibold mb-[4px]" style={{ color: "var(--foreground)" }}>Key props (on Topbar)</p>
                    {[
                      ["workspaces",          "WorkspaceItem[]",  "Required to enable the dropdown"],
                      ["selectedWorkspaceId", "string",           "Highlights the active workspace"],
                      ["onWorkspaceSelect",   "(id) => void",     "Fires on row click"],
                    ].map(([prop, type, note]) => (
                      <div key={prop} className="flex items-start gap-[8px]">
                        <code className="shrink-0 text-[11px] w-[148px]" style={{ color: "var(--primary)" }}>{prop}</code>
                        <span className="shrink-0 text-[11px] font-mono w-[100px]" style={{ color: "var(--field-supporting)" }}>{type}</span>
                        <span className="text-[11px]" style={{ color: "var(--field-supporting)" }}>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)" }} />

            {/* ── Profile Menu (Right Menu) ────────────────────────────── */}
            <div className="flex flex-col gap-[16px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Profile Menu</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">
                  Dropdown from the user avatar (rightmost element). Shows account info, tenant,
                  preferences, and sign-out. DS node 15349:23474 · 320px wide.
                </p>
              </div>
              <div className="flex gap-[24px] items-start">
                {/* Live demo */}
                <TopbarRightMenu
                  isStatic
                  userName="Michael O."
                  userEmail="michael@aimsos.ai"
                  companyName={demoCompanyName}
                  tenants={demoTenants}
                  selectedTenantId={demoSelectedTenantId}
                  onTenantSelect={setDemoSelectedTenantId}
                  themeMode={demoThemeMode}
                  onThemeChange={handleThemeChange}
                />

                {/* Anatomy + props */}
                <div className="flex-1 flex flex-col gap-[12px]">
                  <div className="rounded-[8px] p-[14px] flex flex-col gap-[6px]" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                    <p className="text-[12px] font-semibold mb-[4px]" style={{ color: "var(--foreground)" }}>Anatomy</p>
                    {[
                      ["50px",  "Account info",        "24px avatar + name (14px) + email (10px)"],
                      ["—",     "Divider",              "1px separator"],
                      ["78px",  "Workspace section",   "Label row (28px) + tenant row (50px: avatar + name + 'Owner')"],
                      ["—",     "Divider",              "1px separator"],
                      ["40px",  "Profile & prefs",      "User icon"],
                      ["40px",  "Notifications prefs",  "Bell icon"],
                      ["44px",  "Theme toggle",         "Moon/Sun + 'Theme' label + Light/Dark pill button"],
                      ["40px",  "Help & docs",          "HelpCircle icon"],
                      ["—",     "Divider",              "1px separator"],
                      ["40px",  "Sign out",             "LogOut icon · destructive red text"],
                    ].map(([h, name, detail]) => (
                      <div key={name} className="flex items-start gap-[8px]">
                        <span className="shrink-0 text-[11px] font-mono w-[36px] text-right" style={{ color: "var(--primary)" }}>{h}</span>
                        <span className="shrink-0 text-[11px] font-semibold w-[140px]" style={{ color: "var(--foreground)" }}>{name}</span>
                        <span className="text-[11px]" style={{ color: "var(--field-supporting)" }}>{detail}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[8px] p-[14px] flex flex-col gap-[4px]" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                    <p className="text-[12px] font-semibold mb-[4px]" style={{ color: "var(--foreground)" }}>Key props (on Topbar)</p>
                    {[
                      ["userName",       "string",      "Displayed in account row"],
                      ["userEmail",      "string",      "Secondary line in account row"],
                      ["companyName",    "string",      "Tenant name in workspace section"],
                      ["isDark",         "boolean",     "Controls Moon/Sun icon + pill label"],
                      ["onThemeToggle",  "() => void",  "Fires on clicking the Light/Dark pill"],
                      ["onProfileClick", "() => void",  "Fires additionally when avatar is clicked"],
                    ].map(([prop, type, note]) => (
                      <div key={prop} className="flex items-start gap-[8px]">
                        <code className="shrink-0 text-[11px] w-[120px]" style={{ color: "var(--primary)" }}>{prop}</code>
                        <span className="shrink-0 text-[11px] font-mono w-[80px]" style={{ color: "var(--field-supporting)" }}>{type}</span>
                        <span className="text-[11px]" style={{ color: "var(--field-supporting)" }}>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Playground ────────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[24px]">

            {/* Live topbar */}
            <PreviewWrap>
              <Topbar
                variant={pgVariant}
                workspaceName={wkName}
                companyName={coName}
                userName={uName}
                searchPlaceholder={searchPH}
                workspaces={demoWorkspaces}
                selectedWorkspaceId="ws-1"
                userEmail="michael@aimsos.ai"
                tenants={demoTenants}
                selectedTenantId={demoSelectedTenantId}
                onTenantSelect={(id) => { setDemoSelectedTenantId(id); setCoName(demoTenants.find(t => t.id === id)?.name ?? coName) }}
                themeMode={demoThemeMode}
                onThemeChange={handleThemeChange}
                actions={[
                  { icon: SparkleIcon ? <SparkleIcon size={16} strokeWidth={2} /> : null, label: "AI Assistant", variant: "primary" as const },
                  { icon: BellIcon ? <BellIcon size={16} strokeWidth={1.75} /> : null, label: "Notifications", badge: showBadge },
                  { icon: SettingsIcon ? <SettingsIcon size={16} strokeWidth={1.75} /> : null, label: "Settings" },
                ]}
              />
            </PreviewWrap>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-[16px]">
              {/* Variant */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold text-[var(--field-label)]">Variant</label>
                <div className="flex gap-[8px]">
                  {(["default", "tablet"] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setPgVariant(v)}
                      className="px-[12px] h-[28px] rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer"
                      style={{
                        background: pgVariant === v ? "var(--primary)" : "var(--field-bg)",
                        color:      pgVariant === v ? "#ffffff"        : "var(--field-text)",
                        border:     "1px solid " + (pgVariant === v ? "var(--primary)" : "var(--field-border)"),
                      }}
                    >
                      {v === "default" ? "Default (36px)" : "Tablet (34px)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge toggle */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold text-[var(--field-label)]">Notification badge</label>
                <button
                  onClick={() => setShowBadge(b => !b)}
                  className="w-fit px-[12px] h-[28px] rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer"
                  style={{
                    background: showBadge ? "var(--tag-error-bg)" : "var(--field-bg)",
                    color:      showBadge ? "var(--tag-error-fg)" : "var(--field-text)",
                    border:     "1px solid " + (showBadge ? "var(--tag-error-bd)" : "var(--field-border)"),
                  }}
                >
                  {showBadge ? "Badge ON" : "Badge OFF"}
                </button>
              </div>

              {/* Workspace name */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold text-[var(--field-label)]">Workspace name</label>
                <input
                  value={wkName}
                  onChange={e => setWkName(e.target.value)}
                  className="h-[32px] px-[10px] rounded-[6px] text-[12px]"
                  style={{ background: "var(--field-bg)", border: "1px solid var(--field-border)", color: "var(--field-text)" }}
                />
              </div>

              {/* Company name */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold text-[var(--field-label)]">Company name</label>
                <input
                  value={coName}
                  onChange={e => setCoName(e.target.value)}
                  className="h-[32px] px-[10px] rounded-[6px] text-[12px]"
                  style={{ background: "var(--field-bg)", border: "1px solid var(--field-border)", color: "var(--field-text)" }}
                />
              </div>

              {/* User name */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold text-[var(--field-label)]">User name</label>
                <input
                  value={uName}
                  onChange={e => setUName(e.target.value)}
                  className="h-[32px] px-[10px] rounded-[6px] text-[12px]"
                  style={{ background: "var(--field-bg)", border: "1px solid var(--field-border)", color: "var(--field-text)" }}
                />
              </div>

              {/* Search placeholder */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold text-[var(--field-label)]">Search placeholder</label>
                <input
                  value={searchPH}
                  onChange={e => setSearchPH(e.target.value)}
                  className="h-[32px] px-[10px] rounded-[6px] text-[12px]"
                  style={{ background: "var(--field-bg)", border: "1px solid var(--field-border)", color: "var(--field-text)" }}
                />
              </div>
            </div>

          </div>
        )}

        {/* ── Reference ─────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[32px]">

            {/* Token table */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Design tokens</h2>
              <div className="rounded-[8px] overflow-hidden border border-[var(--table-border)]">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-[var(--table-header-bg)]">
                      {["CSS variable", "DS token", "Role", "Light", "Dark"].map(h => (
                        <th key={h} className="text-left px-[10px] py-[10px] font-semibold text-[var(--table-header-text)] border-b border-[var(--table-border)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tokenRows.map((row, i) => (
                      <tr key={row.cssVar} className={`bg-[var(--table-bg)]${i < tokenRows.length - 1 ? " border-b border-[var(--table-border)]" : ""}`}>
                        <td className="px-[10px] py-[10px] font-mono text-[11px] text-[var(--primary)]">{row.cssVar}</td>
                        <td className="px-[10px] py-[10px] text-[var(--table-cell-text)]">{row.dsToken}</td>
                        <td className="px-[10px] py-[10px] text-[var(--table-cell-text)]">{row.role}</td>
                        <td className="px-[10px] py-[10px]"><ColorSwatch hex={row.light} mode="light" /></td>
                        <td className="px-[10px] py-[10px]"><ColorSwatch hex={row.dark}  mode="dark"  /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TopbarButton sub-component */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">TopbarButton sub-component</h2>
              <p className="text-[13px] text-[var(--field-supporting)]">
                Exported standalone for use in custom Layout Shells. DS COMPONENT_SET 8603:52851 — 24×24px with badge support.
              </p>
              <div className="flex items-center gap-[12px] p-[16px] rounded-[8px]" style={{ background: "var(--field-bg)", border: "1px solid var(--field-border)" }}>
                {[false, true].map(badge => (
                  ["Bell", "Grid3x3", "Settings"].map((name, i) => {
                    const Icon = (LucideIcons as unknown as Record<string,LucideIcon>)[name === "Grid3x3" ? "LayoutGrid" : name]
                    return (
                      <TopbarButton
                        key={`${badge}-${i}`}
                        icon={Icon ? <Icon size={14} strokeWidth={1.75} /> : null}
                        label={name}
                        badge={badge && i === 0}
                      />
                    )
                  })
                ))}
              </div>
            </div>

            {/* Code snippet */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Code</h2>
              <pre
                className="rounded-[8px] p-[16px] text-[11px] leading-[1.7] overflow-x-auto"
                style={{ background: "var(--surface-raised)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >{`import { Topbar, type TopbarAction } from "@/components/ui/topbar"
import { Sparkle, Bell, Settings } from "lucide-react"

// DS icons (Sub-A, left → right):
//   1. Sparkle variant="primary" → IA-icon · single 4-pt diamond · blue→teal gradient + glow
//   2. Bell                      → Notifications-icon
//   3. Settings                  → Settings-icon
const actions: TopbarAction[] = [
  { icon: <Sparkle size={16} strokeWidth={2} />,    label: "AI Assistant",  variant: "primary" },
  { icon: <Bell size={16} strokeWidth={1.75} />,     label: "Notifications", badge: true },
  { icon: <Settings size={16} strokeWidth={1.75} />, label: "Settings" },
]

<Topbar
  workspaceName="Product Design"
  companyName="AIMS OS"
  userName="Michael O."
  actions={actions}
  onWorkspaceClick={() => openWorkspaceMenu()}
  onSearchFocus={() => openGlobalSearch()}
  onCompanyClick={() => openLeftMenu()}
  onProfileClick={() => openRightMenu()}
/>

{/* Tablet variant */}
<Topbar variant="tablet" onMenuClick={() => toggleSidebar()} ... />`}</pre>
            </div>

          </div>
        )}

      </div>

      {/* Global Search preview overlay — controlled by sub-components tab */}
      <GlobalSearch open={gsPreviewOpen} onClose={() => setGsPreviewOpen(false)} />

    </div>
  )
}

// ── SidebarPage ────────────────────────────────────────────────────────────

function SidebarPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [activeId, setActiveId] = useState("agents")
  const [collapsed, setCollapsed] = useState(false)

  const STATES = [
    { label: "Default", desc: "Icon in Icon/Primary/Lighter (#80AFFF). No background. No shadow.", icon: "Home",    bg: "transparent",   shadow: "none",                                      iconColor: "rgba(128,175,255,1)" },
    { label: "Hover",   desc: "Icon button bg = Surface/Neutral/Black (container color). Blue glow shadow rgba(33,115,255,0.50) blur:20.", icon: "Home", bg: "var(--sb-bg)", shadow: "0px 0px 20px 0px rgba(33,115,255,0.50)", iconColor: "rgba(255,255,255,0.70)" },
    { label: "Active",  desc: "Gradient fill (Main Action) + teal shadow rgba(82,163,255,0.38) offset(8,8) blur:20.", icon: "Sparkle", bg: "radial-gradient(circle at 61% 68%, rgba(33,115,255,1) 29%, rgba(9,226,171,1) 61%)", shadow: "8px 8px 20px 0px rgba(82,163,255,0.38)", iconColor: "#ffffff" },
  ]

  return (
    <div className="flex flex-col gap-[40px] px-[32px] py-[24px]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-[16px]">
        <div className="flex flex-col gap-[6px]">
          <h1 className="text-[22px] font-bold text-[var(--foreground)]">Sidebar</h1>
          <p className="text-[14px] text-[var(--field-supporting)] leading-[1.6]">
            Vertical navigation rail for primary app sections. Always renders on a dark background regardless of light/dark mode.
            Two states: <strong className="text-[var(--foreground)]">Expanded (250px)</strong> shows icon + label,
            <strong className="text-[var(--foreground)]"> Collapsed (56px)</strong> shows icon only with tooltips on hover.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("sidebar")} />
      </div>

      {/* ── Live demo ── */}
      <section className="flex flex-col gap-[16px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--field-supporting)]">Live demo</h2>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-[12px] font-medium px-[12px] py-[6px] rounded-[6px] transition-colors"
            style={{ background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)", color: "var(--foreground)" }}
          >
            {collapsed ? "→ Expand" : "← Collapse"}
          </button>
        </div>

        <div className="flex overflow-hidden rounded-[12px]" style={{ height: 400, border: "1px solid var(--table-border)" }}>
          <Sidebar
            items={DEFAULT_SIDEBAR_ITEMS}
            activeId={activeId}
            onItemClick={setActiveId}
            defaultCollapsed={collapsed}
            onCollapseChange={setCollapsed}
          />
          <div className="flex flex-1 items-center justify-center flex-col gap-[6px]" style={{ background: "var(--canvas)" }}>
            <p className="text-[13px] font-semibold text-[var(--foreground)]">
              {DEFAULT_SIDEBAR_ITEMS.find(i => i.id === activeId)?.label} page
            </p>
            <p className="text-[12px] text-[var(--field-supporting)]">
              {collapsed ? "Hover icons to see tooltips" : "Click any nav item to switch section"}
            </p>
          </div>
        </div>
      </section>

      {/* ── Both variants side by side ── */}
      <section className="flex flex-col gap-[16px]">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--field-supporting)]">Variants</h2>
        <div className="flex gap-[32px] items-start">
          <div className="flex flex-col gap-[8px]">
            <p className="text-[11px] font-semibold text-[var(--field-supporting)] uppercase tracking-[0.06em]">Expanded — 250px</p>
            <div style={{ height: 220 }}><Sidebar activeId="agents" defaultCollapsed={false} /></div>
          </div>
          <div className="flex flex-col gap-[8px]">
            <p className="text-[11px] font-semibold text-[var(--field-supporting)] uppercase tracking-[0.06em]">Collapsed — 56px · hover for tooltip</p>
            <div style={{ height: 220 }}><Sidebar activeId="agents" defaultCollapsed={true} /></div>
          </div>
        </div>
      </section>

      {/* ── Button states ── */}
      <section className="flex flex-col gap-[16px]">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--field-supporting)]">Button states (Sidebar Buttons DS)</h2>
        <div className="grid grid-cols-3 gap-[12px]">
          {STATES.map(s => (
            <div key={s.label} className="flex flex-col gap-[12px] p-[16px] rounded-[10px]"
              style={{ background: "var(--table-bg)", border: "1px solid var(--table-border)" }}>
              {/* Preview on dark bg — sidebar is always dark */}
              <div className="flex items-center justify-center rounded-[8px] py-[20px]" style={{ background: "#000" }}>
                <div
                  className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px]"
                  style={{ background: s.bg, boxShadow: s.shadow, padding: 4 }}
                >
                  {(() => {
                    const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[s.icon]
                    return Icon ? <Icon size={16} strokeWidth={1.75} color={s.iconColor} /> : null
                  })()}
                </div>
              </div>
              <div className="flex flex-col gap-[4px]">
                <p className="text-[12px] font-semibold text-[var(--foreground)]">{s.label}</p>
                <p className="text-[11px] text-[var(--field-supporting)] leading-[1.5]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── When to use ── */}
      <section className="flex flex-col gap-[16px]">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--field-supporting)]">When to use each state</h2>
        <div className="flex flex-col gap-[8px]">
          {[
            { variant: "Expanded", when: "Default app state — enough horizontal space, first visit, or when labels aid orientation.", avoid: "Don't keep expanded when screen width is below 1280px. Don't put more than 7 items." },
            { variant: "Collapsed", when: "Maximum content area needed. User is familiar with the icons. Narrow viewports (1024–1280px).", avoid: "Always show tooltips on hover — never show icon-only without a tooltip fallback." },
            { variant: "Active state", when: "The section the user is currently viewing. Only one item active at a time.", avoid: "Don't use active on parent items when a sub-item is active — highlight the most specific level." },
          ].map(r => (
            <div key={r.variant} className="flex gap-[12px] p-[14px] rounded-[8px]"
              style={{ background: "var(--table-bg)", border: "1px solid var(--table-border)" }}>
              <div className="shrink-0 w-[80px]">
                <span className="text-[11px] font-semibold text-[var(--foreground)]">{r.variant}</span>
              </div>
              <div className="flex flex-col gap-[4px]">
                <p className="text-[12px] text-[var(--field-supporting)] leading-[1.5]">
                  <span className="text-[var(--tag-success-fg)] font-medium">Use: </span>{r.when}
                </p>
                <p className="text-[12px] text-[var(--field-supporting)] leading-[1.5]">
                  <span className="text-[var(--tag-error-fg)] font-medium">Avoid: </span>{r.avoid}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Specs table ── */}
      <section className="flex flex-col gap-[12px]">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--field-supporting)]">Specs</h2>
        <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: "var(--table-header-bg)", borderBottom: "1px solid var(--table-border)" }}>
                {["Property", "Expanded", "Collapsed"].map(h => (
                  <th key={h} className="text-left px-[14px] py-[10px] font-semibold text-[var(--field-supporting)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Width",               "250px",                        "56px"                  ],
                ["Container bg dark",   "rgba(15,23,43,1) #0F172B",     "rgba(15,23,43,1)"      ],
                ["Container bg light",  "rgba(0,0,0,1) #000000",        "rgba(0,0,0,1)"         ],
                ["Container radius",    "16px",                         "8px"                   ],
                ["Padding",             "8px",                          "8px"                   ],
                ["Nav items gap",       "16px",                         "16px"                  ],
                ["Icon button size",    "24×24px · padding 4px",        "24×24px · padding 4px" ],
                ["Icon button radius",  "8px",                          "8px"                   ],
                ["Icon default",        "Icon/Primary/Lighter #80AFFF", "#80AFFF"               ],
                ["Icon hover/active",   "Icon/Neutral/Light white",     "white"                 ],
                ["Row hover bg dark",   "Surface/Neutral/Darker White/20","—"                   ],
                ["Row hover bg light",  "Surface/Neutral/Darker #2A2A2A","—"                   ],
                ["Active gradient",     "Radial: blue→teal @29%→61%",   "Same"                  ],
                ["Active shadow",       "rgba(82,163,255,0.38) 8,8 blur:20","Same"              ],
                ["Hover shadow",        "rgba(33,115,255,0.50) 0,0 blur:20","Same"              ],
                ["Tooltip (collapsed)", "—",                            "Dark pill on hover"    ],
                ["Text",                "12px Semi Bold white",         "—"                     ],
              ].map(([prop, exp, col], i, arr) => (
                <tr key={prop} style={{ borderBottom: i < arr.length-1 ? "1px solid var(--table-border)" : "none" }}>
                  <td className="px-[14px] py-[9px] font-medium text-[var(--foreground)]">{prop}</td>
                  <td className="px-[14px] py-[9px] font-mono text-[var(--field-supporting)]">{exp}</td>
                  <td className="px-[14px] py-[9px] font-mono text-[var(--field-supporting)]">{col}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Usage code ── */}
      <section className="flex flex-col gap-[12px]">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--field-supporting)]">Usage</h2>
        <div className="rounded-[8px] p-[16px] font-mono text-[12px] leading-[1.8]"
          style={{ background: "var(--surface-raised)", border: "1px solid var(--table-border)", color: "var(--field-supporting)" }}>
          <span style={{ color: "#c792ea" }}>import</span>{" "}
          {"{ Sidebar, DEFAULT_SIDEBAR_ITEMS, type SidebarItem } "}<span style={{ color: "#c792ea" }}>from</span>{" "}
          <span style={{ color: "#c3e88d" }}>"@/components/ui/sidebar"</span><br /><br />

          <span style={{ color: "#697098" }}>{"// 1. Basic — uses default AIMS OS nav items"}</span><br />
          {"<"}<span style={{ color: "#82aaff" }}>Sidebar</span>
          {" activeId="}<span style={{ color: "#c3e88d" }}>"agents"</span>{" onItemClick="}{"{setActiveId}"}{" />"}<br /><br />

          <span style={{ color: "#697098" }}>{"// 2. Custom items"}</span><br />
          {"const items: SidebarItem[] = ["}<br />
          {"  { id: "}<span style={{ color: "#c3e88d" }}>"dashboard"</span>{", label: "}<span style={{ color: "#c3e88d" }}>"Dashboard"</span>{", icon: "}<span style={{ color: "#c3e88d" }}>"LayoutDashboard"</span>{" },"}<br />
          {"  { id: "}<span style={{ color: "#c3e88d" }}>"reports"</span>{", label: "}<span style={{ color: "#c3e88d" }}>"Reports"</span>{", icon: "}<span style={{ color: "#c3e88d" }}>"BarChart2"</span>{", hasChildren: true },"}<br />
          {"]"}<br /><br />

          <span style={{ color: "#697098" }}>{"// 3. Controlled collapse state"}</span><br />
          {"<"}<span style={{ color: "#82aaff" }}>Sidebar</span><br />
          {"  items="}{"{items}"}<br />
          {"  activeId="}{"{activeId}"}<br />
          {"  onItemClick="}{"{setActiveId}"}<br />
          {"  defaultCollapsed="}{"{isNarrow}"}<br />
          {"  onCollapseChange="}{"{setCollapsed}"}<br />
          {"/>"}
        </div>
      </section>

    </div>
  )
}

// ── EntityListPage ──────────────────────────────────────────────────────────

const DEMO_DESC_LONG  = "Discussed various financing options with the client including traditional loans, lease-to-own programs, and manufacturer financing. Client showed strong interest in the 0% APR promotion running through Q2."
const DEMO_DESC_SHORT = "Follow-up call scheduled. Client requested brochures."

const demoEntityItems: EntityListItemData[] = [
  {
    id: "1",
    title: "Sarah Thompson",
    iconVariant: "yellow", iconName: "Car",
    avatarName: "ST",
    primaryMeta: [
      { iconName: "ShieldCheck", label: "Employee",            tooltip: "Client type" },
      { iconName: "Briefcase",   label: "Green Solutions LLC", tooltip: "Company" },
    ],
    pinned: true,
    actions: [
      { label: "Reply",    variant: "primary" },
      { label: "Reassign", variant: "secondary" },
    ],
    state:     { label: "Published", variant: "success" },
    timestamp: "4h ago",
    showMenu:  true,
    description: DEMO_DESC_LONG,
    aiInsight: {
      action: "Escalated",
      detail: [
        "Billing issue sent to finance team — response expected within 24 hours.",
        "Customer contacted via email with reference #2847.",
        "Follow-up scheduled for tomorrow 10 AM with senior account manager.",
        "Case flagged as high-priority — SLA clock running since 09:32 AM.",
      ],
      showLabel: true,
    },
    secondaryMeta: [
      { iconName: "User",          label: "Agent: Mike R.", tooltip: "Assigned agent" },
      { iconName: "Smile",         label: "Positive",       tooltip: "Sentiment" },
      { iconName: "Paperclip",     label: "3 files",        tooltip: "Attachments" },
      { iconName: "CheckCheck",    label: "Read",           tooltip: "Read status" },
      { iconName: "Clock",         label: "4 mins",         tooltip: "Queue time" },
      { iconName: "Eye",           label: "12 views",       tooltip: "Views" },
      { iconName: "MessageSquare", label: "8 replies",      tooltip: "Messages" },
    ],
    tags: [{ label: "UCP" }, { label: "Sales" }, { label: "Risk" }, { label: "Service" }, { label: "Churn" }, { label: "Finance" }, { label: "Q2" }, { label: "Priority" }, { label: "VIP" }, { label: "Renewal" }],
  },
  {
    id: "2",
    title: "Ticket #4821 — Billing Dispute",
    iconVariant: "error", iconName: "AlertCircle",
    primaryMeta: [
      { iconName: "User",  label: "Jorge M." },
      { iconName: "Globe", label: "LATAM" },
    ],
    actions: [{ label: "Resolve", variant: "primary" }],
    state:     { label: "Open", variant: "alert" },
    timestamp: "2h ago",
    showMenu: true,
    secondaryMeta: [
      { iconName: "Clock", label: "12 mins" },
      { iconName: "MessageSquare" },
      { iconName: "Paperclip" },
    ],
    tags: [{ label: "Billing" }, { label: "Escalated" }],
  },
  {
    id: "3",
    title: "Onboarding — Acme Corp",
    iconVariant: "success", iconName: "CheckCircle",
    avatarName: "AC",
    primaryMeta: [
      { iconName: "Briefcase", label: "Enterprise" },
    ],
    state:     { label: "In Progress", variant: "informative" },
    timestamp: "Yesterday",
    showMenu: true,
    aiInsight: { action: "Suggested", detail: "Schedule follow-up call with IT admin before provisioning the SSO integration." },
    secondaryMeta: [
      { iconName: "Users" },
      { iconName: "Link" },
      { iconName: "Flag" },
    ],
    tags: [{ label: "Onboarding" }, { label: "Enterprise" }],
  },
]

function EntityListPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab, setTab] = useState<"overview" | "variants" | "playground" | "sub-components">("overview")

  // Playground toggles
  const [pgShowCheckbox,    setPgShowCheckbox]    = useState(false)
  const [pgShowDesc,        setPgShowDesc]        = useState(true)
  const [pgDescLong,        setPgDescLong]        = useState(true)
  const [pgShowAI,          setPgShowAI]          = useState(true)
  const [pgAiShowLabel,     setPgAiShowLabel]     = useState(true)
  const [pgAiViewMore,      setPgAiViewMore]      = useState(false)
  const [pgShowTags,      setPgShowTags]      = useState(true)
  const [pgCtaPrimary,    setPgCtaPrimary]    = useState(true)
  const [pgCtaSecondary,  setPgCtaSecondary]  = useState(true)
  const [pgCtaTertiary,   setPgCtaTertiary]   = useState(false)
  const [pgShowMenu,      setPgShowMenu]      = useState(true)
  const [pgMetaCount,     setPgMetaCount]     = useState(2)
  const [pgSecMetaMode,   setPgSecMetaMode]   = useState<"icon-text"|"icon">("icon-text")
  const [pgTagsCount,     setPgTagsCount]     = useState(6)
  const [pgSecMetaCount,  setPgSecMetaCount]  = useState(6)
  const [pgShowIcon,      setPgShowIcon]      = useState(true)
  const [pgIconVariant,   setPgIconVariant]   = useState<NonNullable<EntityListItemData["iconVariant"]>>("yellow")
  const [pgShowAvatar,    setPgShowAvatar]    = useState(true)
  const [pgStateVariant,  setPgStateVariant]  = useState<"success"|"error"|"alert"|"informative"|"neutral">("success")
  const [pgPinned,        setPgPinned]        = useState(true)

  const allMeta    = demoEntityItems[0].primaryMeta   ?? []
  const allTags    = demoEntityItems[0].tags           ?? []
  const allSecMeta = demoEntityItems[0].secondaryMeta ?? []

  const pgActions: EntityListItemData["actions"] = [
    ...(pgCtaPrimary   ? [{ label: "Reply",    variant: "primary"   as const }] : []),
    ...(pgCtaSecondary ? [{ label: "Reassign", variant: "secondary" as const }] : []),
    ...(pgCtaTertiary  ? [{ label: "Archive",  variant: "tertiary"  as const }] : []),
  ]

  const playgroundItem: EntityListItemData = {
    ...demoEntityItems[0],
    id:            "pg-1",
    showCheckbox:  pgShowCheckbox,
    description:         pgShowDesc ? (pgDescLong ? DEMO_DESC_LONG : DEMO_DESC_SHORT) : undefined,
    aiInsight:           pgShowAI   ? { ...demoEntityItems[0].aiInsight!, showLabel: pgAiShowLabel, viewMore: pgAiViewMore, defaultExpanded: false } : undefined,
    tags:                pgShowTags ? allTags.slice(0, pgTagsCount)  : undefined,
    actions:             pgActions.length > 0 ? pgActions : undefined,
    showMenu:            pgShowMenu,
    primaryMeta:         allMeta.slice(0, pgMetaCount),
    secondaryMeta:       allSecMeta.slice(0, pgSecMetaCount),
    secondaryMetaMode:   pgSecMetaMode,
    iconVariant:   pgShowIcon ? pgIconVariant : undefined,
    iconName:      pgShowIcon ? demoEntityItems[0].iconName : undefined,
    avatarName:    pgShowAvatar ? demoEntityItems[0].avatarName : undefined,
    pinned:        pgPinned,
    state:         { label: pgStateVariant.charAt(0).toUpperCase() + pgStateVariant.slice(1), variant: pgStateVariant },
  }

  const compactItems: EntityListItemData[] = [
    { id: "c1", title: "Invoice #7823", iconVariant: "info", iconName: "FileText",
      primaryMeta: [{ iconName: "User", label: "Maria G." }],
      state: { label: "Pending", variant: "alert" }, timestamp: "1h ago", showMenu: true,
      secondaryMeta: [{ iconName: "DollarSign", label: "$4,200" }, { iconName: "Clock", label: "3 days" }],
      tags: [{ label: "Finance" }] },
    { id: "c2", title: "Support #2241", iconVariant: "neutral", iconName: "MessageCircle",
      primaryMeta: [{ iconName: "Globe", label: "EMEA" }],
      state: { label: "Closed", variant: "neutral" }, timestamp: "3d ago", showMenu: true,
      secondaryMeta: [{ iconName: "Clock", label: "22 mins" }, { iconName: "CheckCheck" }],
      tags: [{ label: "Support" }, { label: "Closed" }] },
  ]

  const minimalItems: EntityListItemData[] = [
    { id: "m1", title: "Q2 Strategy Review",
      state: { label: "Draft", variant: "neutral" }, timestamp: "Today" },
    { id: "m2", title: "Legal compliance audit",
      state: { label: "Review", variant: "informative" }, timestamp: "Jun 10" },
    { id: "m3", title: "Product roadmap v3",
      state: { label: "Live", variant: "success" }, timestamp: "Jun 8" },
  ]

  const propRows = [
    { prop: "items",          type: "EntityListItemData[]", default: "—",          desc: "Array of row data objects. Each item maps to one row in the list." },
    { prop: "className",      type: "string",               default: "undefined",  desc: "Extra Tailwind / custom classes on the container div." },
    { prop: "title",          type: "string",               default: "required",   desc: "Primary label displayed in the top-left of the row (16px semibold)." },
    { prop: "iconVariant",    type: "yellow | success | error | info | neutral | purple | light-blue", default: "undefined", desc: "Color of the 24×24 icon highlight container." },
    { prop: "iconName",       type: "string (Lucide)",      default: "undefined",  desc: "Lucide icon name rendered inside the icon highlight." },
    { prop: "avatarName",     type: "string",               default: "undefined",  desc: "Name used to derive 2-letter initials for the circle avatar." },
    { prop: "primaryMeta",    type: "ELMetaItem[]",         default: "undefined",  desc: "Meta items shown inline with the title: icon + optional label." },
    { prop: "pinned",         type: "boolean",              default: "false",      desc: "Shows a red Pin tag next to the primary meta." },
    { prop: "actions",        type: "ELAction[]",           default: "undefined",  desc: "Action buttons: primary / secondary / tertiary. Max 2–3 recommended." },
    { prop: "state",          type: "{ label, variant }",  default: "undefined",  desc: "State Tag shown in the right zone. Variant maps to Tag semantic color." },
    { prop: "timestamp",      type: "string",               default: "undefined",  desc: "Relative or absolute time string shown at far right." },
    { prop: "description",    type: "string",               default: "undefined",  desc: "Collapsible body text. Expanded by defaultDescExpanded (default true)." },
    { prop: "aiInsight",      type: "{ action, detail }",  default: "undefined",  desc: "Purple AI callout row with Sparkle icon, action label and detail text." },
    { prop: "secondaryMeta",  type: "ELMetaItem[]",         default: "undefined",  desc: "Bottom-left row of icon+label pairs separated by bullet dots." },
    { prop: "tags",           type: "{ label }[]",          default: "undefined",  desc: "Light-blue tags shown at the bottom-right of the row." },
  ]

  const codeSnippet = `import { EntityList, type EntityListItemData } from "@/components/ui/entity-list"

const items: EntityListItemData[] = [
  {
    id: "1",
    title: "Sarah Thompson",
    iconVariant: "yellow",
    iconName: "Car",
    avatarName: "ST",
    primaryMeta: [
      { iconName: "ShieldCheck", label: "Employee" },
      { iconName: "Briefcase",   label: "Green Solutions LLC" },
    ],
    pinned: true,
    actions: [
      { label: "Reply",    variant: "primary" },
      { label: "Reassign", variant: "secondary" },
    ],
    state:     { label: "Published", variant: "success" },
    timestamp: "4h ago",
    showMenu:  true,
    description: "...",
    defaultDescExpanded: true,
    aiInsight: { action: "Escalated", detail: "Billing issue sent to finance team." },
    secondaryMeta: [
      { iconName: "Clock", label: "4 mins" },
      { iconName: "Eye" },
    ],
    tags: [{ label: "UCP" }, { label: "Sales" }],
  },
]

export function MyList() {
  return <EntityList items={items} />
}`

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Entity List</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            High-density list row for entities — conversations, tickets, tasks.
            Supports icon highlight, avatar, primary/secondary meta, AI insight, description, and tag clusters.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("entity-list")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",        label: "Overview"        },
          { id: "variants",        label: "Variants"        },
          { id: "sub-components",  label: "Sub-components"  },
          { id: "playground",      label: "Playground"      },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ─────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[32px]">

            {/* Live preview */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Preview</h2>
              <CardContainer size="sm">
                <EntityList items={[demoEntityItems[0]]} />
              </CardContainer>
            </div>

            {/* Anatomy */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Anatomy</h2>
              <div className="grid grid-cols-2 gap-[12px]">
                {[
                  { label: "Top row — title + primary meta", desc: "Checkbox (opt) → icon highlight → avatar → title (16px SemiBold) → meta bullets → pinned tag | right: actions → divider → state tag → timestamp → menu." },
                  { label: "Body — description", desc: "Collapsible multi-line text (14px Medium). ChevronDown/Up toggle at right. Hidden by default when defaultDescExpanded=false." },
                  { label: "AI insight row", desc: "Full-width purple pill: Sparkle icon + 'AI {action}' label + separator + detail text. Only renders when aiInsight prop is set." },
                  { label: "Bottom row — secondary meta + tags", desc: "Left: icon+label pairs with bullet separators (from 2nd onward). Right: light-blue Tag cluster." },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-[8px] p-[14px] flex flex-col gap-[6px]"
                    style={{ background: "var(--tag-informative-bg)", border: "1px solid var(--tag-informative-bd)" }}
                  >
                    <p className="text-[12px] font-semibold" style={{ color: "var(--primary)" }}>{item.label}</p>
                    <p className="text-[12px]" style={{ color: "var(--field-supporting)" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage guidelines */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Usage guidelines</h2>
              <div className="grid grid-cols-2 gap-[12px]">
                <div
                  className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-success-bg)", border: "1px solid var(--tag-success-bd)" }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-success-fg)" }}>✅ When to use</p>
                  {[
                    "Use for dense entity feeds: conversations, tickets, tasks, leads — any list where context per row matters.",
                    "Use primaryMeta to show the most-scanned key attributes (role, org, region) right next to the title.",
                    "Use aiInsight when the system has an automated diagnosis or recommendation — keeps AI context inline.",
                    "Use secondaryMeta for secondary counts (time, attachments, views) — icon-only is fine when widely understood.",
                    "Use pinned + error Tag to highlight rows requiring immediate attention.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-success-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
                <div
                  className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-error-bg)", border: "1px solid var(--tag-error-bd)" }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-error-fg)" }}>❌ When not to use</p>
                  {[
                    "Don't use for simple flat lists where a Table with sortable columns is a better fit.",
                    "Don't add more than 2–3 action buttons — the right zone has limited horizontal budget.",
                    "Don't combine both iconHighlight and avatar on the same row — pick one identity marker.",
                    "Don't add more than 6–8 tags per row — use a '+N more' label for overflow.",
                    "Don't disable the description collapse if rows are very tall — always allow the user to hide it.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-error-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Code</h2>
              <pre
                className="rounded-[8px] p-[16px] overflow-x-auto text-[12px] leading-[1.7] font-mono"
                style={{ background: "var(--surface)", border: "1px solid var(--table-border)", color: "var(--field-supporting)" }}
              >
                {codeSnippet}
              </pre>
            </div>

          </div>
        )}

        {/* ── Variants ──────────────────────────────────────────────────── */}
        {tab === "variants" && (
          <div className="flex flex-col gap-[40px]">

            {/* Full */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Full — all slots populated</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">Icon + avatar + meta + description + AI insight + tags</p>
              </div>
              <div className="flex flex-col gap-[8px]">
                {demoEntityItems.map(item => (
                  <CardContainer key={item.id} size="sm">
                    <EntityList items={[item]} />
                  </CardContainer>
                ))}
              </div>
            </div>

            {/* Compact */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Compact — no description, no AI insight</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">Top row + secondary meta + tags only</p>
              </div>
              <div className="flex flex-col gap-[8px]">
                {compactItems.map(item => (
                  <CardContainer key={item.id} size="sm">
                    <EntityList items={[item]} />
                  </CardContainer>
                ))}
              </div>
            </div>

            {/* Minimal */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Minimal — title + state + timestamp</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">No icon, no meta, no tags — simplest readable form</p>
              </div>
              <div className="flex flex-col gap-[8px]">
                {minimalItems.map(item => (
                  <CardContainer key={item.id} size="sm">
                    <EntityList items={[item]} />
                  </CardContainer>
                ))}
              </div>
            </div>

            {/* Card container states */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Card container states</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">Error and alert variants of the card container — used to surface critical or time-sensitive rows</p>
              </div>
              <div className="flex flex-col gap-[8px]">
                <CardContainer size="sm" variant="reed">
                  <EntityList items={[{
                    id: "state-error",
                    title: "Ticket #4821 — Billing Dispute",
                    iconVariant: "error", iconName: "AlertCircle",
                    primaryMeta: [
                      { iconName: "User", label: "Jorge M.", tooltip: "Assigned to" },
                      { iconName: "Globe", label: "LATAM", tooltip: "Region" },
                    ],
                    actions: [{ label: "Resolve", variant: "primary" }],
                    state: { label: "Critical", variant: "error" },
                    timestamp: "2h ago",
                    showMenu: true,
                    secondaryMeta: [
                      { iconName: "Clock", label: "12 mins", tooltip: "Queue time" },
                      { iconName: "MessageSquare", label: "8 replies", tooltip: "Messages" },
                    ],
                    tags: [{ label: "Billing" }, { label: "Escalated" }],
                  }]} />
                </CardContainer>
                <CardContainer size="sm" variant="orange">
                  <EntityList items={[{
                    id: "state-alert",
                    title: "Onboarding — Acme Corp",
                    iconVariant: "info", iconName: "FileText",
                    primaryMeta: [
                      { iconName: "Briefcase", label: "Enterprise", tooltip: "Plan" },
                      { iconName: "Calendar",  label: "Due Jun 20", tooltip: "Due date" },
                    ],
                    actions: [{ label: "Review", variant: "primary" }],
                    state: { label: "At risk", variant: "alert" },
                    timestamp: "Yesterday",
                    showMenu: true,
                    secondaryMeta: [
                      { iconName: "Users",     label: "4 pending",  tooltip: "Pending tasks" },
                      { iconName: "AlertTriangle", label: "Blocked", tooltip: "Status" },
                    ],
                    tags: [{ label: "Onboarding" }, { label: "Blocked" }],
                  }]} />
                </CardContainer>
              </div>
            </div>

          </div>
        )}

        {/* ── Sub-components ────────────────────────────────────────────── */}
        {tab === "sub-components" && (
          <div className="flex flex-col gap-[24px]">

            {(() => {
              const SubCard = ({
                label,
                definition,
                capitalization,
                children,
              }: {
                label:          string
                definition:     string
                capitalization: string
                children:       React.ReactNode
              }) => (
                <div
                  className="rounded-[10px] overflow-hidden"
                  style={{ border: "1px solid var(--table-border)" }}
                >
                  {/* Preview zone */}
                  <div
                    className="w-full flex items-center justify-center px-[24px] py-[20px]"
                    style={{ background: "var(--canvas)", minHeight: 72 }}
                  >
                    <div className="w-full">{children}</div>
                  </div>
                  {/* Divider */}
                  <div style={{ height: 1, background: "var(--table-border)" }} />
                  {/* Info zone */}
                  <div
                    className="px-[16px] py-[14px] flex flex-col gap-[6px]"
                    style={{ background: "var(--surface)" }}
                  >
                    <p className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</p>
                    <p className="text-[12px] leading-[1.6]" style={{ color: "var(--muted-foreground)" }}>{definition}</p>
                    <p className="text-[11px] mt-[2px]" style={{ color: "var(--field-supporting)" }}>
                      <span className="font-semibold">Capitalization:</span> {capitalization}
                    </p>
                  </div>
                </div>
              )

              return (
                <>
                  {/* 1 — Original Component */}
                  <SubCard
                    label="Full row"
                    definition="Complete entity list row with all slots active: icon, avatar, primary meta, description, AI insight, secondary meta, and tags. Reference point for evaluating density and visual hierarchy."
                    capitalization="Title 16px / SemiBold · Primary meta 12px / Medium · Timestamp 12px / Medium · Description 14px / Medium · Tags 11px / Medium"
                  >
                    <CardContainer size="sm">
                      <EntityList items={[demoEntityItems[0]]} />
                    </CardContainer>
                  </SubCard>

                  {/* 2 — Icono */}
                  <SubCard
                    label="Icono"
                    definition="24×24px square with 4px radius that visually identifies the entity type through semantic color and a Lucide icon. Available in 7 color variants — each maps to a --hi-*-bg / --hi-*-icon token pair."
                    capitalization="— (no text content)"
                  >
                    <div className="flex items-center gap-[12px] flex-wrap">
                      {(["yellow","success","error","info","neutral","purple","light-blue"] as const).map(v => (
                        <div key={v} className="flex flex-col items-center gap-[8px]">
                          <ELIconHighlight
                            variant={v}
                            iconName={v === "yellow" ? "Car" : v === "success" ? "CheckCircle" : v === "error" ? "AlertCircle" : v === "info" ? "FileText" : v === "neutral" ? "MessageCircle" : v === "purple" ? "Sparkles" : "Globe"}
                          />
                          <span className="text-[10px] font-medium" style={{ color: "var(--field-supporting)" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </SubCard>

                  {/* 3 — Checkbox */}
                  <SubCard
                    label="Checkbox"
                    definition="16×16px checkbox at the far left of the row. Enabled with showCheckbox=true — enables multi-select for bulk actions. Click does not propagate the row's onClick event."
                    capitalization="— (no text content)"
                  >
                    <div className="flex flex-col gap-[8px]">
                      <CardContainer size="sm">
                        <EntityList items={[{ ...demoEntityItems[0], id: "cb-1", showCheckbox: true, checked: false, description: undefined, aiInsight: undefined, secondaryMeta: undefined, tags: undefined }]} />
                      </CardContainer>
                      <CardContainer size="sm">
                        <EntityList items={[{ ...demoEntityItems[1], id: "cb-2", showCheckbox: true, checked: true, description: undefined, aiInsight: undefined }]} />
                      </CardContainer>
                    </div>
                  </SubCard>

                  {/* 4 — Empty state (Emp) */}
                  <SubCard
                    label="Empty state"
                    definition="Empty container state when there are no entities to display — either because there is no data, or no item passes the active filter. Communicates absence without visual noise."
                    capitalization="Message 14px / Medium / Sentence case · Hint 12px / Regular / Sentence case"
                  >
                    <div
                      className="w-full flex flex-col items-center justify-center gap-[8px] py-[32px] rounded-[8px]"
                      style={{ border: "1px solid var(--table-border)", background: "var(--table-bg)" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.25, color: "var(--muted-foreground)" }}>
                        <rect x="4" y="8" width="24" height="4" rx="2" fill="currentColor"/>
                        <rect x="4" y="15" width="16" height="4" rx="2" fill="currentColor"/>
                        <rect x="4" y="22" width="20" height="4" rx="2" fill="currentColor"/>
                      </svg>
                      <p className="text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>No entities found</p>
                      <p className="text-[12px]" style={{ color: "var(--field-supporting)" }}>Adjust your filters or create a new entity</p>
                    </div>
                  </SubCard>

                  {/* 5 — Avatar */}
                  <SubCard
                    label="Avatar"
                    definition="24×24px circle showing initials (max 2 letters, first letter of each word in the name) or a profile image. 1.5px semi-transparent blue ring. Appears alongside the icon when avatarName is defined."
                    capitalization="Initials 9px / Bold / UPPERCASE"
                  >
                    <div className="flex items-center gap-[16px] flex-wrap">
                      {[
                        { name: "Sarah Thompson" },
                        { name: "Jorge M." },
                        { name: "Acme Corp" },
                        { name: "Rafael Díaz" },
                        { name: "AI" },
                      ].map(a => (
                        <div key={a.name} className="flex flex-col items-center gap-[8px]">
                          <ELAvatar name={a.name} />
                          <span className="text-[10px] font-medium" style={{ color: "var(--field-supporting)" }}>{a.name.split(" ").slice(0,2).map((w:string)=>w[0]).join("").toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </SubCard>

                  {/* 6 — AI Insight */}
                  <SubCard
                    label="AI Insight"
                    definition="Purple horizontal bar that surfaces diagnostics and recommendations generated by the system. The Sparkle icon signals the AI origin. Only shown when aiInsight is defined on the item."
                    capitalization="Action 14px / Medium / Sentence case · Detail 12px / Medium / Sentence case"
                  >
                    <CardContainer size="sm">
                      <EntityList items={[{
                        id: "ai-1",
                        title: "Sarah Thompson",
                        iconVariant: "yellow", iconName: "Car",
                        timestamp: "4h ago",
                        aiInsight: {
                          action: "Escalated",
                          detail: [
                            "Billing issue sent to finance team — response expected within 24 hours.",
                            "Customer contacted via email with reference #2847.",
                            "Follow-up scheduled for tomorrow 10 AM.",
                          ],
                        },
                      }]} />
                    </CardContainer>
                  </SubCard>

                  {/* 7 — Description */}
                  <SubCard
                    label="Description"
                    definition="Collapsible text area. When text is shorter than 120 characters no chevron is shown. For long text, chevron-down collapses to a truncated single line; chevron-up expands the full text (max 1,200 characters)."
                    capitalization="14px / Medium / Sentence case"
                  >
                    <div className="flex flex-col gap-[8px]">
                      <div className="flex gap-[6px] items-center mb-[4px]">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--field-supporting)" }}>Short text — no chevron</span>
                      </div>
                      <CardContainer size="sm">
                        <EntityList items={[{
                          id: "desc-short",
                          title: "Support #2241",
                          iconVariant: "neutral", iconName: "MessageCircle",
                          timestamp: "3d ago",
                          description: DEMO_DESC_SHORT,
                        }]} />
                      </CardContainer>
                      <div className="flex gap-[6px] items-center mt-[8px] mb-[4px]">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--field-supporting)" }}>Long text — collapsed (chevron-down)</span>
                      </div>
                      <CardContainer size="sm">
                        <EntityList items={[{
                          id: "desc-collapsed",
                          title: "Sarah Thompson",
                          iconVariant: "yellow", iconName: "Car",
                          avatarName: "ST",
                          timestamp: "4h ago",
                          description: DEMO_DESC_LONG,
                          defaultDescExpanded: false,
                        }]} />
                      </CardContainer>
                      <div className="flex gap-[6px] items-center mt-[8px] mb-[4px]">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--field-supporting)" }}>Long text — expanded (chevron-up)</span>
                      </div>
                      <CardContainer size="sm">
                        <EntityList items={[{
                          id: "desc-expanded",
                          title: "Sarah Thompson",
                          iconVariant: "yellow", iconName: "Car",
                          avatarName: "ST",
                          timestamp: "4h ago",
                          description: DEMO_DESC_LONG,
                          defaultDescExpanded: true,
                        }]} />
                      </CardContainer>
                    </div>
                  </SubCard>
                </>
              )
            })()}

          </div>
        )}

        {/* ── Playground ────────────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[24px]">

            {/* Preview — shown first so it's immediately visible */}
            <div className="flex flex-col gap-[10px]">
              <h2 className="text-[14px] font-semibold text-[var(--foreground)]">Preview</h2>
              <CardContainer size="sm">
                <EntityList items={[playgroundItem]} />
              </CardContainer>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-[16px]">
              <h2 className="text-[14px] font-semibold text-[var(--foreground)]">Controls</h2>

              {/* ── Toggles ── */}
              {(() => {
                const Tog = ({ label, val, set }: { label: string; val: boolean; set: (v: boolean) => void }) => (
                  <button
                    onClick={() => set(!val)}
                    className="flex items-center gap-[6px] px-[9px] py-[6px] rounded-[7px] text-[11px] font-medium transition-colors"
                    style={{
                      background: val ? "var(--tag-informative-bg)" : "var(--table-bg)",
                      border:     `1px solid ${val ? "var(--tag-informative-bd)" : "var(--table-border)"}`,
                      color:      val ? "var(--primary)" : "var(--field-supporting)",
                    }}
                  >
                    <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: val ? "var(--primary)" : "var(--field-supporting)", opacity: val ? 1 : 0.3 }} />
                    {label}
                  </button>
                )
                const SectionLabel = ({ children }: { children: string }) => (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.07em] mb-[6px]" style={{ color: "var(--field-supporting)" }}>{children}</p>
                )
                return (
                  <div className="flex flex-col gap-[12px]">
                    {/* Slots */}
                    <div>
                      <SectionLabel>Slots</SectionLabel>
                      <div className="grid grid-cols-4 gap-[6px]">
                        <Tog label="Checkbox"      val={pgShowCheckbox}  set={setPgShowCheckbox}  />
                        <Tog label="Icon"          val={pgShowIcon}      set={setPgShowIcon}      />
                        <Tog label="Avatar"        val={pgShowAvatar}    set={setPgShowAvatar}    />
                        <Tog label="Pinned"        val={pgPinned}        set={setPgPinned}        />
                        <Tog label="CTA Primary"   val={pgCtaPrimary}    set={setPgCtaPrimary}    />
                        <Tog label="CTA Secondary" val={pgCtaSecondary}  set={setPgCtaSecondary}  />
                        <Tog label="CTA Tertiary"  val={pgCtaTertiary}   set={setPgCtaTertiary}   />
                        <Tog label="Menu"          val={pgShowMenu}      set={setPgShowMenu}      />
                        <Tog label="Tags (right)"  val={pgShowTags}      set={setPgShowTags}      />
                      </div>
                    </div>
                    {/* Description */}
                    <div>
                      <SectionLabel>Description</SectionLabel>
                      <div className="flex gap-[6px] flex-wrap">
                        <Tog label="Show"          val={pgShowDesc}  set={setPgShowDesc}  />
                        <Tog label="Long text (chevron)" val={pgDescLong} set={setPgDescLong} />
                      </div>
                    </div>
                    {/* AI Summary */}
                    <div>
                      <SectionLabel>AI Summary</SectionLabel>
                      <div className="flex gap-[6px] flex-wrap">
                        <Tog label="Show"             val={pgShowAI}       set={setPgShowAI}       />
                        <Tog label="«AI …» label"     val={pgAiShowLabel}  set={setPgAiShowLabel}  />
                        <Tog label="View more"        val={pgAiViewMore}   set={setPgAiViewMore}   />
                      </div>
                      <p className="text-[10px] mt-[5px]" style={{ color: "var(--field-supporting)" }}>
                        Bullet list con 4 items — collapsed por default, chevron para expandir
                      </p>
                    </div>
                    {/* Secondary meta mode */}
                    <div>
                      <SectionLabel>Secondary meta mode</SectionLabel>
                      <div className="flex gap-[6px]">
                        {(["icon-text","icon"] as const).map(m => (
                          <button
                            key={m}
                            onClick={() => setPgSecMetaMode(m)}
                            className="flex items-center gap-[6px] px-[9px] py-[6px] rounded-[7px] text-[11px] font-medium"
                            style={{
                              background: pgSecMetaMode === m ? "var(--tag-informative-bg)" : "var(--table-bg)",
                              border:     `1px solid ${pgSecMetaMode === m ? "var(--tag-informative-bd)" : "var(--table-border)"}`,
                              color:      pgSecMetaMode === m ? "var(--primary)" : "var(--field-supporting)",
                            }}
                          >
                            <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: pgSecMetaMode === m ? "var(--primary)" : "var(--field-supporting)", opacity: pgSecMetaMode === m ? 1 : 0.3 }} />
                            {m === "icon-text" ? "Icon + text" : "Icon only (tooltip on hover)"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* ── Counters ── */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.07em] mb-[6px]" style={{ color: "var(--field-supporting)" }}>Count</p>
                <div className="grid grid-cols-3 gap-[8px]">
                  {([
                    { label: "Primary meta",    val: pgMetaCount,    set: setPgMetaCount,    min: 0, max: 2                 },
                    { label: "Secondary meta",  val: pgSecMetaCount, set: setPgSecMetaCount, min: 0, max: allSecMeta.length },
                    { label: "Tags (right)",    val: pgTagsCount,    set: setPgTagsCount,    min: 0, max: allTags.length    },
                  ] as { label: string; val: number; set: React.Dispatch<React.SetStateAction<number>>; min: number; max: number }[]).map(ctrl => (
                    <div
                      key={ctrl.label}
                      className="flex items-center justify-between gap-[8px] px-[12px] py-[9px] rounded-[8px]"
                      style={{ background: "var(--table-bg)", border: "1px solid var(--table-border)" }}
                    >
                      <span className="text-[12px] font-medium truncate" style={{ color: "var(--field-supporting)" }}>{ctrl.label}</span>
                      <div className="flex items-center gap-[6px] shrink-0">
                        <button
                          onClick={() => ctrl.set(v => Math.max(ctrl.min, v - 1))}
                          className="w-[22px] h-[22px] flex items-center justify-center rounded-[4px] text-[14px] font-medium"
                          style={{ background: "var(--muted)", color: "var(--foreground)" }}
                        >−</button>
                        <span className="w-[18px] text-center text-[12px] font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>{ctrl.val}</span>
                        <button
                          onClick={() => ctrl.set(v => Math.min(ctrl.max, v + 1))}
                          className="w-[22px] h-[22px] flex items-center justify-center rounded-[4px] text-[14px] font-medium"
                          style={{ background: "var(--muted)", color: "var(--foreground)" }}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Icon variant ── */}
              {pgShowIcon && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-[8px]" style={{ color: "var(--field-supporting)" }}>Icon variant</p>
                  <div className="flex flex-wrap gap-[8px]">
                    {(["yellow","success","error","info","neutral","purple","light-blue"] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => setPgIconVariant(v)}
                        className="flex items-center gap-[7px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-medium transition-colors"
                        style={{
                          background: pgIconVariant === v ? "var(--tag-informative-bg)" : "var(--table-bg)",
                          border:     `1px solid ${pgIconVariant === v ? "var(--tag-informative-bd)" : "var(--table-border)"}`,
                          color:      pgIconVariant === v ? "var(--primary)" : "var(--field-supporting)",
                        }}
                      >
                        <ELIconHighlight
                          variant={v}
                          iconName={v === "yellow" ? "Car" : v === "success" ? "CheckCircle" : v === "error" ? "AlertCircle" : v === "info" ? "FileText" : v === "neutral" ? "MessageCircle" : v === "purple" ? "Sparkles" : "Globe"}
                        />
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── State tag variant ── */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-[8px]" style={{ color: "var(--field-supporting)" }}>Tag state</p>
                <div className="flex flex-wrap gap-[8px]">
                  {(["success","informative","alert","error","neutral"] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setPgStateVariant(v)}
                      className="flex items-center gap-[7px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-medium transition-colors"
                      style={{
                        background: pgStateVariant === v ? "var(--tag-informative-bg)" : "var(--table-bg)",
                        border:     `1px solid ${pgStateVariant === v ? "var(--tag-informative-bd)" : "var(--table-border)"}`,
                        color:      pgStateVariant === v ? "var(--primary)" : "var(--field-supporting)",
                      }}
                    >
                      <Tag variant={v === "neutral" ? "secondary" : v} size="sm">{v.charAt(0).toUpperCase() + v.slice(1)}</Tag>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Prop table */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Props</h2>
              <div
                className="rounded-[8px] overflow-hidden"
                style={{ border: "1px solid var(--table-border)" }}
              >
                {/* Header */}
                <div
                  className="grid text-[11px] font-semibold uppercase tracking-[0.05em] px-[16px] py-[10px]"
                  style={{
                    background: "var(--table-header-bg)",
                    color: "var(--table-header-text)",
                    gridTemplateColumns: "180px 260px 110px 1fr",
                    borderBottom: "1px solid var(--table-border)",
                  }}
                >
                  <span>Prop</span>
                  <span>Type</span>
                  <span>Default</span>
                  <span>Description</span>
                </div>
                {propRows.map((row, i) => (
                  <div
                    key={row.prop}
                    className="grid items-start px-[16px] py-[10px] text-[12px]"
                    style={{
                      gridTemplateColumns: "180px 260px 110px 1fr",
                      background: i % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderBottom: i < propRows.length - 1 ? "1px solid var(--table-border)" : "none",
                      color: "var(--field-supporting)",
                    }}
                  >
                    <span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{row.prop}</span>
                    <span className="font-mono" style={{ color: "var(--muted-foreground)", wordBreak: "break-all" }}>{row.type}</span>
                    <span className="font-mono opacity-60">{row.default}</span>
                    <span className="leading-[1.6]">{row.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

// ── ModalDialogPage ──────────────────────────────────────────────────────────

function ModalDialogPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab, setTab] = useState<"overview" | "variants" | "playground">("overview")

  // Playground state
  const [pgOpen,        setPgOpen]        = useState(false)
  const [pgVariant,     setPgVariant]     = useState<ModalVariant>("confirmation")
  const [pgShowIcon,    setPgShowIcon]    = useState(true)
  const [pgShowTitle,   setPgShowTitle]   = useState(true)
  const [pgShowDesc,    setPgShowDesc]    = useState(true)
  const [pgShowSlot,    setPgShowSlot]    = useState(false)
  const [pgShowInfo,    setPgShowInfo]    = useState(false)
  const [pgShowPrimary, setPgShowPrimary] = useState(true)
  const [pgShowSec,     setPgShowSec]     = useState(true)
  const [pgDestructive,    setPgDestructive]    = useState(false)
  const [pgTone,           setPgTone]           = useState<ModalTone>("default")
  const [pgIconVariant,    setPgIconVariant]    = useState<HighlightIconVariant>("informative")
  const [pgIconName,       setPgIconName]       = useState("Sparkles")
  const [pgInfoVariant,    setPgInfoVariant]    = useState<InformativeCardState>("informative")
  const [pgShowClose,      setPgShowClose]      = useState(true)

  // Overview "try it" modal
  const [overviewOpen, setOverviewOpen] = useState(false)

  const anatomyCards = [
    { label: "Close button",     desc: "Ghost × in the top-right corner. Absolute positioned at top-4 right-4. Always shown unless showClose=false. Closes on click." },
    { label: "Icon area",        desc: "Confirmation: 48px centered circle. Content: 40px inline with title. Background = modal-icon-bg token. Fallback icon: Info." },
    { label: "Header",           desc: "Confirmation: title + description center-aligned below icon. Content: icon + title + description left-aligned in a row." },
    { label: "Content zone",     desc: "slot: ReactNode — rendered in a rounded container with slot-bg. informativeCard: blue pill with ⓘ icon above the CTAs." },
    { label: "CTA row",          desc: "Confirmation: buttons centered. Content: buttons right-aligned. Secondary + Primary pair. Destructive=true → red Warning button." },
  ]

  return (
    <div className="flex flex-col gap-0">

      {/* Header */}
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Modal Dialog</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Focused overlay for confirmations and structured content. Two layout variants —
            Confirmation and Content. Scrim + blur backdrop. 5 semantic tones.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("modal-dialog")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "variants",   label: "Variants"   },
          { id: "playground", label: "Playground" },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[32px]">

            {/* Live preview trigger */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Preview</h2>
              <div
                className="rounded-[10px] p-[24px] flex flex-col items-center gap-[16px]"
                style={{ background: "var(--surface)", border: "1px solid var(--table-border)" }}
              >
                <p className="text-[13px] text-[var(--field-supporting)] text-center">
                  The modal opens over the content with scrim + blur. Click outside or × to close.
                </p>
                <Button variant="primary" onClick={() => setOverviewOpen(true)}>
                  Open Modal Dialog
                </Button>
                <div
                  className="w-full rounded-[10px] overflow-hidden"
                  style={{ border: "1px solid var(--table-border)" }}
                >
                  <ModalDialog embedded isOpen={true} onClose={() => {}}
                    variant="confirmation"
                    iconName="Sparkles"
                    title="Confirm your action"
                    description="This will affect all linked resources in your workspace. Once confirmed, this action cannot be undone."
                    informativeCard="Review all linked items before confirming — this action cannot be reversed."
                    ctaPrimary={{ label: "Confirm" }}
                    ctaSecondary={{ label: "Cancel" }}
                  />
                </div>
              </div>
              <ModalDialog
                isOpen={overviewOpen}
                onClose={() => setOverviewOpen(false)}
                variant="confirmation"
                iconName="Sparkles"
                title="Confirm your action"
                description="This will affect all linked resources in your workspace. Once confirmed, this action cannot be undone."
                informativeCard="Review all linked items before confirming — this action cannot be reversed."
                ctaPrimary={{ label: "Confirm", onClick: () => setOverviewOpen(false) }}
                ctaSecondary={{ label: "Cancel", onClick: () => setOverviewOpen(false) }}
              />
            </div>

            {/* Anatomy */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Anatomy</h2>
              <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-3">
                {anatomyCards.map(c => (
                  <div
                    key={c.label}
                    className="rounded-[8px] p-[14px] flex flex-col gap-[6px]"
                    style={{ background: "var(--tag-informative-bg)", border: "1px solid var(--tag-informative-bd)" }}
                  >
                    <p className="text-[12px] font-semibold" style={{ color: "var(--primary)" }}>{c.label}</p>
                    <p className="text-[12px] leading-[1.6]" style={{ color: "var(--field-supporting)" }}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage guidelines */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Usage guidelines</h2>
              <div className="grid grid-cols-2 gap-[12px]">
                <div className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-success-bg)", border: "1px solid var(--tag-success-bd)" }}>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-success-fg)" }}>✅ When to use</p>
                  {[
                    "To confirm destructive actions: delete, overwrite, revoke access.",
                    "When the user needs additional context before making a decision.",
                    "To display structured content that requires immediate attention (slot).",
                    "Use informativeCard when the action is irreversible — never omit it on destructive flows.",
                    "Confirmation for simple Yes/No questions; Content for flows with data or forms.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-success-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
                <div className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-error-bg)", border: "1px solid var(--tag-error-bd)" }}>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-error-fg)" }}>❌ When not to use</p>
                  {[
                    "Not for passive informational messages — use Toast or Banner instead.",
                    "Do not chain modals — one modal at a time, never modal over modal.",
                    "Not for long forms — if the slot needs scroll, use a page or drawer.",
                    "Do not omit the Secondary CTA (Cancel) when the action is destructive.",
                    "Do not use the Confirmation variant to display tables or long lists.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-error-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Props */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Props</h2>
              <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ background: "var(--table-header-bg)", borderBottom: "1px solid var(--table-border)" }}>
                      {["Prop", "Type", "Default", "Description"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] font-semibold" style={{ color: "var(--table-header-text)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { prop: "isOpen",          type: "boolean",                  def: "required", desc: "Controls visibility. Triggers enter/exit animation." },
                      { prop: "onClose",         type: "() => void",               def: "required", desc: "Called when scrim is clicked or close button pressed." },
                      { prop: "variant",         type: '"confirmation" | "content"', def: '"confirmation"', desc: "Layout: centered icon+title (confirmation) or left-aligned row (content)." },
                      { prop: "tone",            type: '"default" | "warning" | "error" | "alert" | "success"', def: '"default"', desc: "Icon circle color. Uses DS --hi-* variables. error/warning for destructive, alert for reversible risk, success for positive confirmation." },
                      { prop: "showIcon",        type: "boolean",                  def: "true",     desc: "Show the icon circle in the header. Falls back to Info icon if iconName is unset." },
                      { prop: "iconName",        type: "string (Lucide)",           def: "Info",     desc: "Lucide icon name rendered inside the icon circle." },
                      { prop: "title",           type: "string",                   def: "undefined", desc: "Bold heading text. Center-aligned in Confirmation; left-aligned in Content." },
                      { prop: "description",     type: "string",                   def: "undefined", desc: "Supporting paragraph below the title." },
                      { prop: "slot",            type: "ReactNode",                def: "undefined", desc: "Custom content area rendered in a rounded container above the informative card." },
                      { prop: "informativeCard", type: "string | boolean",         def: "undefined", desc: "Blue ⓘ pill. true = default text; string = custom text." },
                      { prop: "ctaPrimary",      type: "{ label, destructive?, onClick? }", def: "undefined", desc: "Primary action. destructive=true renders a red Warning button." },
                      { prop: "ctaSecondary",    type: "{ label, onClick? }",      def: "undefined", desc: "Secondary/cancel action. Outline button." },
                      { prop: "showClose",       type: "boolean",                  def: "true",     desc: "Show the × close button in the top-right corner." },
                      { prop: "embedded",        type: "boolean",                  def: "false",    desc: "Static inline render — no overlay, no animation. For documentation previews." },
                    ].map(row => (
                      <tr key={row.prop} style={{ borderBottom: "1px solid var(--table-border)", background: "var(--table-bg)" }}>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--primary)" }}>{row.prop}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--muted-foreground)" }}>{row.type}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--field-supporting)" }}>{row.def}</td>
                        <td className="px-[14px] py-[10px] leading-[1.5]" style={{ color: "var(--table-cell-text)" }}>{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── Variants ─────────────────────────────────────────────────────── */}
        {tab === "variants" && (
          <div className="flex flex-col gap-[40px]">

            {/* Confirmation Modal */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Confirmation Modal</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">
                  Centered layout — icon on top, title and description centered, CTAs centered. Max 900px.
                </p>
              </div>
              <div className="rounded-[10px] overflow-hidden p-[24px]" style={{ border: "1px solid var(--table-border)", background: "var(--surface)" }}>
                <ModalDialog embedded isOpen={true} onClose={() => {}}
                  variant="confirmation"
                  iconName="AlertCircle"
                  title="Confirm your action"
                  description="This will affect all linked resources in your workspace. Once confirmed, this action cannot be undone."
                  ctaPrimary={{ label: "Confirm" }}
                  ctaSecondary={{ label: "Cancel" }}
                />
              </div>
            </div>

            {/* Modal with Content */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Modal with Content</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">
                  Horizontal layout — icon + title left-aligned. Slot for custom content. CTAs right-aligned. Max 900px.
                </p>
              </div>
              <div className="rounded-[10px] overflow-hidden p-[24px]" style={{ border: "1px solid var(--table-border)", background: "var(--surface)" }}>
                <ModalDialog embedded isOpen={true} onClose={() => {}}
                  variant="content"
                  iconName="FileText"
                  title="Export Report"
                  description="Choose the format and date range for your export. The file will be sent to your email."
                  slot={
                    <div className="flex flex-col gap-[12px]">
                      <div className="flex flex-col gap-[4px]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--field-supporting)" }}>Format</p>
                        <div className="flex gap-[8px]">
                          {["CSV", "XLSX", "PDF"].map(f => (
                            <div key={f} className="px-[12px] py-[6px] rounded-[6px] text-[12px] font-medium" style={{ background: f === "CSV" ? "var(--tag-informative-bg)" : "var(--table-bg)", border: `1px solid ${f === "CSV" ? "var(--tag-informative-bd)" : "var(--table-border)"}`, color: f === "CSV" ? "var(--primary)" : "var(--field-supporting)" }}>{f}</div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-[4px]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--field-supporting)" }}>Date range</p>
                        <div className="rounded-[6px] px-[12px] py-[8px] text-[12px]" style={{ background: "var(--table-bg)", border: "1px solid var(--table-border)", color: "var(--field-supporting)" }}>Jan 1, 2026 — Jun 30, 2026</div>
                      </div>
                    </div>
                  }
                  ctaPrimary={{ label: "Export" }}
                  ctaSecondary={{ label: "Cancel" }}
                />
              </div>
            </div>

            {/* With Informative Card */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">With Informative Card</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">
                  La informative card aparece encima de los CTAs. Siempre recomendado en acciones irreversibles.
                </p>
              </div>
              <div className="rounded-[10px] overflow-hidden p-[24px]" style={{ border: "1px solid var(--table-border)", background: "var(--surface)" }}>
                <ModalDialog embedded isOpen={true} onClose={() => {}}
                  variant="confirmation"
                  tone="error"
                  iconName="Trash2"
                  title="Delete this workflow?"
                  description="Removing this workflow will disconnect all linked automations and cannot be undone."
                  informativeCard="All active runs will be cancelled immediately and cannot be recovered."
                  ctaPrimary={{ label: "Delete", destructive: true }}
                  ctaSecondary={{ label: "Cancel" }}
                />
              </div>
            </div>

            {/* Destructive */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Destructive action</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">
                  CTA Primary with destructive=true → red Warning button. Always paired with informativeCard. DS: never omit on destructive actions.
                </p>
              </div>
              <div className="rounded-[10px] overflow-hidden p-[24px]" style={{ border: "1px solid var(--table-border)", background: "var(--surface)" }}>
                <ModalDialog embedded isOpen={true} onClose={() => {}}
                  variant="confirmation"
                  tone="error"
                  iconName="AlertTriangle"
                  title="Discard this Workflow?"
                  description="You will lose all unsaved changes to this workflow. This action cannot be undone."
                  informativeCard="All active runs associated with this workflow will be stopped immediately."
                  ctaPrimary={{ label: "Discard", destructive: true }}
                  ctaSecondary={{ label: "Keep editing" }}
                />
              </div>
            </div>

            {/* No icon */}
            <div className="flex flex-col gap-[12px]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Without icon</h2>
                <p className="text-[13px] text-[var(--field-supporting)] mt-[2px]">showIcon=false — title and description without the icon area.</p>
              </div>
              <div className="rounded-[10px] overflow-hidden p-[24px]" style={{ border: "1px solid var(--table-border)", background: "var(--surface)" }}>
                <ModalDialog embedded isOpen={true} onClose={() => {}}
                  variant="confirmation"
                  showIcon={false}
                  title="Are you sure?"
                  description="This will remove the selected items from the list permanently."
                  ctaPrimary={{ label: "Yes, remove" }}
                  ctaSecondary={{ label: "Cancel" }}
                />
              </div>
            </div>

          </div>
        )}

        {/* ── Playground ───────────────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">

            {/* Controls */}
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="Variant"
                options={[
                  { label: "Confirmation", value: "confirmation" },
                  { label: "Content",      value: "content"      },
                ]}
                value={pgVariant}
                onChange={setPgVariant}
              />
              <CtrlGroup
                label="Tone"
                options={[
                  { label: "Default",  value: "default"  },
                  { label: "Warning",  value: "warning"  },
                  { label: "Error",    value: "error"    },
                  { label: "Alert",    value: "alert"    },
                  { label: "Success",  value: "success"  },
                ]}
                value={pgTone}
                onChange={setPgTone}
              />
              <CtrlToggle label="Show Icon"         value={pgShowIcon}    onChange={setPgShowIcon}    />
              {pgShowIcon && (<>
                <CtrlGroup
                  label="Icon variant"
                  options={[
                    { label: "Informative", value: "informative" },
                    { label: "Success",     value: "success"     },
                    { label: "Alert",       value: "alert"       },
                    { label: "Error",       value: "error"       },
                    { label: "Neutral",     value: "neutral"     },
                    { label: "Yellow",      value: "yellow"      },
                    { label: "Lime",        value: "lime"        },
                    { label: "Purple",      value: "purple"      },
                    { label: "Light Blue",  value: "light-blue"  },
                  ]}
                  value={pgIconVariant}
                  onChange={setPgIconVariant}
                />
                <CtrlGroup
                  label="Icon"
                  options={[
                    { label: "Sparkles",      value: "Sparkles"      },
                    { label: "Info",          value: "Info"          },
                    { label: "AlertCircle",   value: "AlertCircle"   },
                    { label: "AlertTriangle", value: "AlertTriangle" },
                    { label: "CheckCircle2",  value: "CheckCircle2"  },
                    { label: "Trash2",        value: "Trash2"        },
                    { label: "FileText",      value: "FileText"      },
                    { label: "Shield",        value: "Shield"        },
                    { label: "Bell",          value: "Bell"          },
                    { label: "Settings",      value: "Settings"      },
                  ]}
                  value={pgIconName}
                  onChange={setPgIconName}
                />
              </>)}
              <CtrlToggle label="Title"             value={pgShowTitle}   onChange={setPgShowTitle}   />
              <CtrlToggle label="Description"       value={pgShowDesc}    onChange={setPgShowDesc}    />
              {pgVariant === "content" && (
                <CtrlToggle label="Slot (content)"  value={pgShowSlot}    onChange={setPgShowSlot}    />
              )}
              <CtrlToggle label="Informative Card"  value={pgShowInfo}    onChange={setPgShowInfo}    />
              {pgShowInfo && (
                <CtrlGroup
                  label="Card state"
                  options={[
                    { label: "Informative", value: "informative" },
                    { label: "Alert",       value: "alert"       },
                    { label: "Error",       value: "error"       },
                    { label: "Success",     value: "success"     },
                    { label: "Neutral",     value: "neutral"     },
                  ]}
                  value={pgInfoVariant}
                  onChange={setPgInfoVariant}
                />
              )}
              <CtrlToggle label="CTA Primary"       value={pgShowPrimary} onChange={setPgShowPrimary} />
              <CtrlToggle label="CTA Secondary"     value={pgShowSec}     onChange={setPgShowSec}     />
              {pgShowPrimary && (
                <CtrlToggle label="Destructive"     value={pgDestructive} onChange={setPgDestructive} />
              )}
              <CtrlToggle label="Close button"      value={pgShowClose}   onChange={setPgShowClose}   />
            </div>

            {/* Trigger */}
            <div
              className="rounded-md border border-dashed border-[var(--field-border)] p-[20px] flex flex-col items-center gap-[12px] min-h-[100px] justify-center"
            >
              <p className="text-[12px] text-[var(--field-supporting)]">Click to open the modal with the current configuration</p>
              <Button variant="primary" onClick={() => setPgOpen(true)}>Launch Modal</Button>
            </div>

            {/* The live modal */}
            <ModalDialog
              isOpen={pgOpen}
              onClose={() => setPgOpen(false)}
              variant={pgVariant}
              tone={pgTone}
              iconVariant={pgShowIcon ? pgIconVariant : undefined}
              infoCardState={pgShowInfo ? pgInfoVariant : undefined}
              showIcon={pgShowIcon}
              iconName={pgShowIcon ? pgIconName : undefined}
              title={pgShowTitle ? (pgDestructive ? "Delete this item?" : pgVariant === "content" ? "Review and confirm" : "Confirm your action") : undefined}
              description={pgShowDesc ? (pgDestructive ? "This action is irreversible. All data associated with this item will be permanently removed." : "This will affect all linked resources in your workspace. Please review before continuing.") : undefined}
              slot={pgShowSlot && pgVariant === "content" ? (
                <div className="flex flex-col gap-[8px]">
                  <p className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>Custom content area</p>
                  <p className="text-[12px]" style={{ color: "var(--field-supporting)" }}>Forms, data tables, lists, or any structured content can be rendered here via the slot prop.</p>
                </div>
              ) : undefined}
              informativeCard={pgShowInfo ? (pgDestructive ? "All associated runs and automations will be stopped and cannot be recovered." : "Please review all details carefully. Some changes may take a few minutes to propagate.") : undefined}
              ctaPrimary={pgShowPrimary ? { label: pgDestructive ? "Delete" : "Confirm", destructive: pgDestructive, onClick: () => setPgOpen(false) } : undefined}
              ctaSecondary={pgShowSec ? { label: "Cancel", onClick: () => setPgOpen(false) } : undefined}
              showClose={pgShowClose}
            />

          </div>
        )}

      </div>
    </div>
  )
}

// ── InformativeCardPage ───────────────────────────────────────────────────────

function InformativeCardPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,           setTab]           = useState<"overview" | "playground" | "reference">("overview")
  const [pgState,       setPgState]       = useState<InformativeCardState>("informative")
  const [pgSize,        setPgSize]        = useState<InformativeCardSize>("md")
  const [pgShowDesc,    setPgShowDesc]    = useState(false)
  const [pgShowCta,     setPgShowCta]     = useState(false)
  const [pgShowCtaSec,  setPgShowCtaSec]  = useState(false)

  const IC_STATES: InformativeCardState[] = ["informative", "alert", "error", "success", "neutral"]
  const IC_SIZES:  InformativeCardSize[]  = ["sm", "md", "lg"]

  const STATE_TITLES: Record<InformativeCardState, string> = {
    informative: "Your workspace is being synced",
    alert:       "Action required before continuing",
    error:       "Something went wrong with this step",
    success:     "Changes saved successfully",
    neutral:     "No active configuration found",
  }
  const STATE_DESCS: Record<InformativeCardState, string> = {
    informative: "This may take a few minutes depending on the size of your workspace.",
    alert:       "Please review the pending items below before proceeding with this action.",
    error:       "Check your connection settings and try again. Contact support if the issue persists.",
    success:     "All linked resources have been updated and are now in sync.",
    neutral:     "Set up a configuration to start using this feature in your workflows.",
  }

  return (
    <div className="flex flex-col gap-0">

      {/* Header */}
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Informative Card</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Horizontal surface that combines icon + title + optional description + optional CTA pair.
            5 semantic states × 3 sizes. Token family <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">--ic-*</code> separate from HighlightIcon.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("informative-card")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ───────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[32px]">

            {/* States */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">5 estados — Size M</h2>
              <div className="flex flex-col gap-[8px]">
                {IC_STATES.map(s => (
                  <InformativeCard
                    key={s}
                    state={s}
                    size="md"
                    title={STATE_TITLES[s]}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">3 sizes — Estado Informative</h2>
              <div className="flex flex-col gap-[8px]">
                {IC_SIZES.map(sz => (
                  <div key={sz} className="flex items-center gap-[12px]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider w-[20px] text-[var(--field-supporting)]">{sz}</span>
                    <InformativeCard
                      state="informative"
                      size={sz}
                      title={sz === "sm" ? "Compact notice" : sz === "md" ? "Standard inline message" : "Expanded informative surface with more breathing room"}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* With description + CTA */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Con description y CTA</h2>
              <div className="flex flex-col gap-[8px]">
                <InformativeCard
                  state="alert"
                  size="md"
                  title="Action required before continuing"
                  description="Please review the pending items below before proceeding with this action."
                />
                <InformativeCard
                  state="error"
                  size="md"
                  title="Failed to connect to the service"
                  description="Check your connection settings and try again."
                  cta={{ label: "Retry" }}
                />
              </div>
            </div>

            {/* Usage */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Usage guidelines</h2>
              <div className="grid grid-cols-2 gap-[12px]">
                <div className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-success-bg)", border: "1px solid var(--tag-success-bd)" }}>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-success-fg)" }}>✅ When to use</p>
                  {[
                    "Inside a Modal Dialog to warn about irreversible actions.",
                    "As an inline notice in forms or configuration panels.",
                    "To display the status of a process (success, error, in progress).",
                    "When the message needs to remain visible while the user acts.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-success-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
                <div className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-error-bg)", border: "1px solid var(--tag-error-bd)" }}>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-error-fg)" }}>❌ When not to use</p>
                  {[
                    "Not as a substitute for a Toast — toasts are transient, this component persists.",
                    "Do not stack more than 2 in the same view.",
                    "Do not use the neutral state for error or alert messages — use the correct semantic state.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-error-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Playground ─────────────────────────────────────────────────────── */}
        {tab === "playground" && (
          <div className="flex flex-col gap-[20px]">

            {/* Controls */}
            <div className="rounded-md border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
              <CtrlGroup
                label="State"
                options={[
                  { label: "Informative", value: "informative" },
                  { label: "Alert",       value: "alert"       },
                  { label: "Error",       value: "error"       },
                  { label: "Success",     value: "success"     },
                  { label: "Neutral",     value: "neutral"     },
                ]}
                value={pgState}
                onChange={setPgState}
              />
              <CtrlGroup
                label="Size"
                options={[
                  { label: "SM", value: "sm" },
                  { label: "MD", value: "md" },
                  { label: "LG", value: "lg" },
                ]}
                value={pgSize}
                onChange={setPgSize}
              />
              <CtrlToggle label="Description"   value={pgShowDesc}   onChange={setPgShowDesc}   />
              <CtrlToggle label="CTA Primary"  value={pgShowCta}    onChange={setPgShowCta}    />
              <CtrlToggle label="CTA Secondary" value={pgShowCtaSec} onChange={setPgShowCtaSec} />
            </div>

            {/* Live preview */}
            <div
              className="rounded-md border border-[var(--field-border)] p-[24px] flex flex-col gap-[12px]"
              style={{ background: "var(--surface)" }}
            >
              <InformativeCard
                state={pgState}
                size={pgSize}
                title={STATE_TITLES[pgState]}
                description={pgShowDesc ? STATE_DESCS[pgState] : undefined}
                cta={pgShowCta ? { label: pgState === "error" ? "Retry" : "Confirm" } : undefined}
                ctaSecondary={pgShowCtaSec ? { label: "Dismiss" } : undefined}
              />
            </div>

          </div>
        )}

        {/* ── Reference ──────────────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">

            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Props</h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["Prop","Type","Default","Description"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { prop: "state",       type: "InformativeCardState", def: '"informative"', desc: "Color theme: informative · alert · error · success · neutral" },
                      { prop: "size",        type: "InformativeCardSize",  def: '"md"',          desc: "Padding size: sm (8px) · md (16px) · lg (24px)" },
                      { prop: "title",       type: "string",               def: "—",             desc: "Required. Primary message text (14px semibold)." },
                      { prop: "description", type: "string",               def: "undefined",     desc: "Optional secondary line below the title (14px medium)." },
                      { prop: "cta",          type: "{ label, onClick? }", def: "undefined",     desc: "Primary action button (Button primary sm), right-most." },
                      { prop: "ctaSecondary", type: "{ label, onClick? }", def: "undefined",     desc: "Secondary action button (Button secondary sm), left of primary — matches DS CTA pair." },
                      { prop: "icon",         type: "ReactNode",            def: "undefined",     desc: "Overrides the default state icon (AlertTriangle, Info, etc.)." },
                      { prop: "className",   type: "string",               def: "undefined",     desc: "Extra classes applied to the root element." },
                    ].map(row => (
                      <tr key={row.prop} style={{ borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] font-mono text-[12px]" style={{ color: "var(--primary)" }}>{row.prop}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[12px] text-[var(--field-supporting)]">{row.type}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[12px] text-[var(--field-supporting)]">{row.def}</td>
                        <td className="px-[14px] py-[10px] text-[var(--field-supporting)]">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Token family <code className="text-[14px] font-mono">--ic-*</code></h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["State","--ic-*-bg","--ic-*-icon","--ic-*-text"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { state: "informative", bg: "#E9F1FF",  icon: "#2173FF", text: "#001740"  },
                      { state: "alert",       bg: "#FFF4E5",  icon: "#ED6C02", text: "#663C00"  },
                      { state: "error",       bg: "#FDEDED",  icon: "#992222", text: "#5F2120"  },
                      { state: "success",     bg: "#E5FDF8",  icon: "#00A07E", text: "#003328"  },
                      { state: "neutral",     bg: "#F2F2F2",  icon: "#2A2A2A", text: "#2A2A2A"  },
                    ].map(row => (
                      <tr key={row.state} style={{ borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] capitalize font-medium" style={{ color: "var(--foreground)" }}>{row.state}</td>
                        <td className="px-[14px] py-[10px]">
                          <span className="flex items-center gap-[6px]">
                            <span className="w-[12px] h-[12px] rounded-[3px] border border-[var(--field-border)]" style={{ background: row.bg }} />
                            <code className="text-[11px] font-mono text-[var(--field-supporting)]">{row.bg}</code>
                          </span>
                        </td>
                        <td className="px-[14px] py-[10px]">
                          <span className="flex items-center gap-[6px]">
                            <span className="w-[12px] h-[12px] rounded-[3px] border border-[var(--field-border)]" style={{ background: row.icon }} />
                            <code className="text-[11px] font-mono text-[var(--field-supporting)]">{row.icon}</code>
                          </span>
                        </td>
                        <td className="px-[14px] py-[10px]">
                          <span className="flex items-center gap-[6px]">
                            <span className="w-[12px] h-[12px] rounded-[3px] border border-[var(--field-border)]" style={{ background: row.text }} />
                            <code className="text-[11px] font-mono text-[var(--field-supporting)]">{row.text}</code>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[12px] text-[var(--field-supporting)]">
                Dark mode values are defined separately in <code className="font-mono">index.css</code> under <code className="font-mono">:root</code> (dark) and <code className="font-mono">.light</code>.
                The token family <code className="font-mono">--ic-*</code> is independent from <code className="font-mono">--hi-*</code> (HighlightIcon).
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

// ── FiltersInteractivePlayground ──────────────────────────────────────────────

function FiltersInteractivePlayground() {
  const [openChip,        setOpenChip]        = useState<number | null>(null)
  const [sortOpen,        setSortOpen]        = useState(false)
  const [sortValue,       setSortValue]       = useState("Name")
  const [singleVals,      setSingleVals]      = useState<Record<number, string>>({})
  const [multiSets,       setMultiSets]       = useState<Record<number, Set<string>>>({})
  const [slideout,        setSlideout]        = useState(false)
  const [numChips,        setNumChips]        = useState(3)
  const [showSort,        setShowSort]        = useState(true)
  const [showView,        setShowView]        = useState(true)
  const [viewMode,        setViewMode]        = useState<"grid" | "list">("grid")
  const [datePreset,      setDatePreset]      = useState("")
  const [calDate,         setCalDate]         = useState<Date | null>(null)
  const [calMonth,        setCalMonth]        = useState(new Date().getMonth())
  const [calYear,         setCalYear]         = useState(new Date().getFullYear())
  // Filters applied from the All Filters slideout — shown as tags below the bar
  const [slideoutApplied, setSlideoutApplied] = useState<{ label: string; value: string }[]>([])
  const [hovered,    setHovered]    = useState<string | null>(null)
  const [searchVal,  setSearchVal]  = useState("")

  const CHIP_DEFS: { placeholder: string; kind: "single" | "multi" | "priority" | "date"; options: string[] }[] = [
    { placeholder: "Type",     kind: "single",   options: ["Product", "Engineering", "Design", "Operations"] },
    { placeholder: "Owner",    kind: "multi",    options: ["Alice B.", "Bob C.", "Carol D.", "David E.", "Eve F."] },
    { placeholder: "Modified", kind: "date",     options: [] },
    { placeholder: "Status",   kind: "multi",    options: ["Active", "Draft", "Archived", "Pending", "Review"] },
    { placeholder: "Priority", kind: "priority", options: [] },
  ]

  const PRIORITY_OPTS = [
    { label: "Critical", color: "#ef4444" },
    { label: "High",     color: "#f97316" },
    { label: "Medium",   color: "#f59e0b" },
    { label: "Low",      color: "#22c55e" },
  ]

  const SORT_OPTS  = ["Name", "Date modified", "Date created", "Priority", "Owner"]
  const DATE_PRE   = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month", "Custom range"]
  const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"]

  function getChipVals(i: number): string[] {
    const def = CHIP_DEFS[i]
    if (def.kind === "single") return singleVals[i] ? [singleVals[i]] : []
    if (def.kind === "date") {
      if (datePreset === "Custom range" && calDate) {
        return [calDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })]
      }
      return datePreset ? [datePreset] : []
    }
    const set = multiSets[i]
    return set ? [...set] : []
  }

  function removeVal(i: number, val: string) {
    const def = CHIP_DEFS[i]
    if (def.kind === "single") {
      setSingleVals(v => { const n = {...v}; delete n[i]; return n })
    } else if (def.kind === "date") {
      if (val === (calDate ? calDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : datePreset)) {
        setDatePreset(""); setCalDate(null)
      } else { setDatePreset(""); setCalDate(null) }
    } else {
      setMultiSets(v => { const s = new Set(v[i] || []); s.delete(val); return {...v, [i]: s} })
    }
  }

  function clearChip(i: number) {
    const def = CHIP_DEFS[i]
    if (def.kind === "single") { setSingleVals(v => { const n = {...v}; delete n[i]; return n }) }
    else if (def.kind === "date") { setDatePreset(""); setCalDate(null) }
    else { setMultiSets(v => { const n = {...v}; delete n[i]; return n }) }
    if (openChip === i) setOpenChip(null)
  }

  function clearAll() {
    setSingleVals({}); setMultiSets({}); setDatePreset(""); setCalDate(null); setOpenChip(null)
    setSlideoutApplied([])
  }

  const hasActive = CHIP_DEFS.slice(0, numChips).some((_, i) => getChipVals(i).length > 0)

  const slideoutActiveFilters = slideoutApplied.map(f => ({
    ...f,
    onRemove: () => setSlideoutApplied(prev => prev.filter(x => !(x.label === f.label && x.value === f.value))),
  }))

  // Calendar helpers
  const calDays = () => {
    const first = new Date(calYear, calMonth, 1).getDay()
    const last  = new Date(calYear, calMonth + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < first; i++) days.push(null)
    for (let d = 1; d <= last; d++) days.push(d)
    return days
  }
  const prevMo = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1) } else setCalMonth(m => m-1) }
  const nextMo = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1) } else setCalMonth(m => m+1) }

  // Render content inside an active chip
  function renderChipFace(i: number) {
    const vals = getChipVals(i)
    const def  = CHIP_DEFS[i]
    if (vals.length === 0) return (
      <>
        <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: "var(--field-text)" }}>
          {def.placeholder}
        </span>
        <LucideIcons.ChevronDown className="w-[13px] h-[13px] shrink-0" style={{ color: "var(--field-icon)" }} />
      </>
    )
    const visible  = vals.slice(0, 2)
    const overflow = vals.length - 2
    return (
      <>
        {visible.map(v => (
          <Tag key={v} variant="informative" size="sm"
            trailingIcon={
              <button className="flex items-center justify-center hover:opacity-70 transition-opacity ml-[1px]"
                onClick={e => { e.stopPropagation(); removeVal(i, v) }} aria-label={`Remove ${v}`}>
                <LucideIcons.X className="w-[9px] h-[9px]" />
              </button>
            }
          >
            {v.length > 11 ? `${v.slice(0, 11)}…` : v}
          </Tag>
        ))}
        {overflow > 0 && (
          <Tag variant="informative" size="sm">+{overflow}</Tag>
        )}
        <LucideIcons.ChevronDown className="w-[13px] h-[13px] shrink-0" style={{ color: "var(--fi-chip-active-icon)" }} />
      </>
    )
  }

  // Menu item row helper
  function menuRow(key: string, content: React.ReactNode, onClick: () => void) {
    return (
      <div key={key}
        className="flex items-center gap-[10px] h-[36px] px-[12px] cursor-pointer rounded-[6px] mx-[4px] transition-colors"
        style={{ background: hovered === key ? "var(--menu-item-hover)" : "transparent" }}
        onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)}
        onClick={onClick}
      >
        {content}
      </div>
    )
  }

  function radio(active: boolean) {
    return (
      <span className="w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: active ? "var(--primary)" : "var(--field-border)" }}>
        {active && <span className="w-[6px] h-[6px] rounded-full" style={{ background: "var(--primary)" }} />}
      </span>
    )
  }

  // Render floating dropdown content for each chip kind
  function renderDropdown(i: number) {
    const def = CHIP_DEFS[i]
    const today = new Date()

    if (def.kind === "single") {
      const cur = singleVals[i]
      return (
        <div className="py-[4px]">
          {def.options.map(opt => menuRow(`s-${i}-${opt}`,
            <>{radio(cur === opt)}<span className="text-[13px]" style={{ color: "var(--menu-item-text)" }}>{opt}</span></>,
            () => { setSingleVals(v => ({...v, [i]: opt})); setOpenChip(null) }
          ))}
        </div>
      )
    }

    if (def.kind === "multi") {
      const set = multiSets[i] || new Set<string>()
      return (
        <div className="py-[4px]">
          {def.options.map(opt => menuRow(`m-${i}-${opt}`,
            <>
              <Checkbox size="sm" checked={set.has(opt)} onChange={() => {}} />
              <span className="text-[13px]" style={{ color: "var(--menu-item-text)" }}>{opt}</span>
            </>,
            () => setMultiSets(v => { const s = new Set(v[i] || []); s.has(opt) ? s.delete(opt) : s.add(opt); return {...v, [i]: s} })
          ))}
        </div>
      )
    }

    if (def.kind === "priority") {
      const set = multiSets[i] || new Set<string>()
      return (
        <div className="py-[4px]">
          {PRIORITY_OPTS.map(p => menuRow(`p-${i}-${p.label}`,
            <>
              <Checkbox size="sm" checked={set.has(p.label)} onChange={() => {}} />
              <span className="w-[8px] h-[8px] rounded-full shrink-0" style={{ background: p.color }} />
              <span className="text-[13px]" style={{ color: "var(--menu-item-text)" }}>{p.label}</span>
            </>,
            () => setMultiSets(v => { const s = new Set(v[i] || []); s.has(p.label) ? s.delete(p.label) : s.add(p.label); return {...v, [i]: s} })
          ))}
        </div>
      )
    }

    if (def.kind === "date") {
      const days = calDays()
      return (
        <div>
          <div className="py-[4px]">
            {DATE_PRE.map(pre => menuRow(`d-${pre}`,
              <>{radio(datePreset === pre)}<span className="text-[13px]" style={{ color: "var(--menu-item-text)" }}>{pre}</span></>,
              () => { setDatePreset(pre); if (pre !== "Custom range") setOpenChip(null) }
            ))}
          </div>
          {/* Mini dark-mode calendar */}
          {datePreset === "Custom range" && (
            <div className="px-[10px] pb-[12px] pt-[4px]">
              <div className="rounded-[8px] overflow-hidden"
                style={{ border: "1px solid var(--menu-divider)", background: "var(--surface)" }}>
                {/* Month nav */}
                <div className="flex items-center justify-between px-[10px] h-[38px]"
                  style={{ borderBottom: "1px solid var(--menu-divider)" }}>
                  <button className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] transition-colors"
                    style={{ color: "var(--menu-item-text)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--menu-item-hover)" }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                    onClick={prevMo}>
                    <LucideIcons.ChevronLeft className="w-[13px] h-[13px]" />
                  </button>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--foreground)" }}>
                    {MONTHS[calMonth].slice(0, 3)} {calYear}
                  </span>
                  <button className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] transition-colors"
                    style={{ color: "var(--menu-item-text)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--menu-item-hover)" }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                    onClick={nextMo}>
                    <LucideIcons.ChevronRight className="w-[13px] h-[13px]" />
                  </button>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 px-[6px] pt-[6px] pb-[2px]">
                  {DAYS_SHORT.map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold py-[2px]"
                      style={{ color: "var(--field-supporting)" }}>{d}</div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 px-[6px] pb-[8px] gap-y-[1px]">
                  {days.map((d, idx) => {
                    const isSel = d && calDate &&
                      d === calDate.getDate() && calMonth === calDate.getMonth() && calYear === calDate.getFullYear()
                    const isToday = d && d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
                    const hk = `cal-${idx}`
                    return (
                      <button key={idx}
                        className="w-[28px] h-[26px] mx-auto flex items-center justify-center rounded-[4px] text-[11px] transition-colors"
                        style={{
                          background: isSel ? "var(--primary)" : hovered === hk && d ? "var(--menu-item-hover)" : "transparent",
                          color: isSel ? "#fff" : isToday ? "var(--primary)" : d ? "var(--foreground)" : "transparent",
                          fontWeight: isToday && !isSel ? "700" : undefined,
                          cursor: d ? "pointer" : "default",
                        }}
                        onMouseEnter={() => d && setHovered(hk)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => { if (d) { setCalDate(new Date(calYear, calMonth, d)); setOpenChip(null) } }}
                        disabled={!d}>
                        {d ?? ""}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Shared floating card style
  const floatStyle: CSSProperties = {
    background:            "var(--menu-bg)",
    backdropFilter:        "blur(10px)",
    WebkitBackdropFilter:  "blur(10px)",
    boxShadow:             "0 8px 32px rgba(0,0,0,0.32), 0 1px 4px rgba(0,0,0,0.16)",
    border:                "1px solid var(--menu-divider)",
    borderRadius:          "8px",
    overflow:              "hidden",
  }

  // Dropdown header
  function dropHeader(title: string, hasVals: boolean, onClear: () => void) {
    return (
      <div className="flex items-center justify-between px-[12px] h-[40px] shrink-0"
        style={{ borderBottom: "1px solid var(--menu-divider)" }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--menu-section-text)" }}>{title}</span>
        <div className="flex items-center gap-[8px]">
          {hasVals && (
            <button className="text-[11px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--fi-clear-text)" }}
              onClick={e => { e.stopPropagation(); onClear() }}>
              Clear
            </button>
          )}
          <button className="w-[22px] h-[22px] flex items-center justify-center rounded-[4px] transition-colors"
            style={{ color: "var(--menu-item-icon)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--menu-item-hover)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
            onClick={() => setOpenChip(null)}>
            <LucideIcons.X className="w-[12px] h-[12px]" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Click-outside overlay — closes any open dropdown */}
      {(openChip !== null || sortOpen) && (
        <div className="fixed inset-0 z-40"
          onClick={() => { setOpenChip(null); setSortOpen(false) }} />
      )}

      {/* Controls */}
      <div className="rounded-[8px] border border-[var(--field-border)] p-[20px] flex flex-col gap-[16px]">
        <CtrlGroup
          label="Quick filter chips"
          options={[
            { label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" },
            { label: "4", value: "4" }, { label: "5", value: "5" },
          ]}
          value={String(numChips)}
          onChange={v => { setNumChips(Number(v)); setOpenChip(null) }}
        />
        <CtrlToggle label="Show sort" value={showSort} onChange={setShowSort} />
        <CtrlToggle label="Show view toggle" value={showView} onChange={setShowView} />
      </div>

      {/* ── Filter bar container ─────────────────────────────────────────── */}
      <div className="rounded-[8px]" style={{ border: "1px solid var(--field-border)", background: "var(--surface)" }}>

        {/* Bar row */}
        <div className="flex items-center gap-[8px] px-[16px] h-[56px]" style={{ flexWrap: "nowrap", minWidth: 0 }}>

          {/* Search field — DS TextField (interactive) */}
          <div className="w-[200px] shrink-0">
            <Input
              leftIcon={<LucideIcons.Search className="w-[14px] h-[14px]" />}
              rightIcon={
                searchVal ? (
                  <button
                    className="flex items-center justify-center hover:opacity-70 transition-opacity"
                    onClick={() => setSearchVal("")}
                    aria-label="Clear search"
                    tabIndex={-1}
                  >
                    <LucideIcons.X className="w-[14px] h-[14px]" />
                  </button>
                ) : undefined
              }
              placeholder="Search"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>

          {/* Filter chips with floating dropdowns */}
          {CHIP_DEFS.slice(0, numChips).map((def, i) => {
            const vals     = getChipVals(i)
            const isActive = vals.length > 0
            const isOpen   = openChip === i
            return (
              <div key={i} className="relative shrink-0">
                <button
                  className="inline-flex items-center gap-[5px] h-[40px] px-[8px] rounded-[8px] border-[0.5px] text-[13px] font-medium select-none transition-colors"
                  style={{
                    background:  isActive ? "var(--fi-chip-active-bg)" : "var(--field-bg)",
                    borderColor: isActive || isOpen ? "var(--fi-chip-active-border)" : "var(--field-border)",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = "var(--field-border-hover)" }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = "var(--field-border)" }}
                  onClick={() => { setSortOpen(false); setOpenChip(prev => prev === i ? null : i) }}
                >
                  {renderChipFace(i)}
                </button>

                {/* Floating dropdown */}
                {isOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-[260px]"
                    style={{ ...floatStyle, maxHeight: "360px", overflowY: "auto" }}>
                    {dropHeader(def.placeholder, isActive, () => clearChip(i))}
                    {renderDropdown(i)}
                  </div>
                )}
              </div>
            )
          })}

          {/* Clear filters */}
          {hasActive && (
            <button className="text-[13px] font-medium transition-colors shrink-0"
              style={{ color: "var(--fi-clear-text)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--fi-clear-hover)" }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--fi-clear-text)" }}
              onClick={clearAll}>
              Clear Filters
            </button>
          )}

          <div className="flex-1 min-w-0" />

          {/* All filters — DS exact: --field-* tokens, pill, px-16px */}
          <button
            className="inline-flex items-center gap-[6px] h-[40px] px-[16px] rounded-full border text-[14px] font-medium transition-colors shrink-0"
            style={{ background: "var(--field-bg)", borderColor: "var(--field-border)", color: "var(--field-text)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--field-border-hover)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--field-border)" }}
            onClick={() => { setSlideout(true); setOpenChip(null); setSortOpen(false) }}>
            All filters
            <LucideIcons.SlidersHorizontal className="w-[14px] h-[14px] shrink-0" style={{ color: "var(--field-icon)" }} />
          </button>

          {/* Sort — DS node 7996:5555: ArrowDown 28×28 · 24px gap · label · ChevronDown */}
          {showSort && (
            <div className="relative flex items-center gap-[24px] shrink-0">
              <button
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[4px] transition-colors"
                style={{ color: "var(--fi-sort-icon)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--fi-chip-bg)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                onClick={() => { setSortOpen(v => !v); setOpenChip(null) }}
                aria-label="Toggle sort direction">
                <LucideIcons.ArrowDown className="w-[16px] h-[16px]" />
              </button>
              <button
                className="inline-flex items-center gap-[8px] text-[14px] font-medium transition-opacity hover:opacity-80"
                style={{ color: "var(--fi-sort-text)" }}
                onClick={() => { setSortOpen(v => !v); setOpenChip(null) }}>
                {sortValue}
                <LucideIcons.ChevronDown className="w-[13px] h-[13px] shrink-0" style={{ color: "var(--fi-sort-icon)" }} />
              </button>
              {sortOpen && (
                <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-[200px]"
                  style={{ ...floatStyle }}>
                  {dropHeader("Sort by", false, () => {})}
                  <div className="py-[4px]">
                    {SORT_OPTS.map(opt => menuRow(`srt-${opt}`,
                      <>{radio(sortValue === opt)}<span className="text-[13px]" style={{ color: "var(--menu-item-text)" }}>{opt}</span></>,
                      () => { setSortValue(opt); setSortOpen(false) }
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View toggle — inactive: --field-bg + --field-border 1px (DS exact) */}
          {showView && (
            <div className="flex items-center gap-[4px] shrink-0">
              {(["grid", "list"] as const).map(m => (
                <button key={m}
                  className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] border transition-colors"
                  style={{
                    background:  viewMode === m ? "var(--fi-view-active-bg)"   : "var(--field-bg)",
                    borderColor: viewMode === m ? "transparent"                : "var(--field-border)",
                    color:       viewMode === m ? "var(--fi-view-active-icon)" : "var(--fi-view-icon)",
                  }}
                  onClick={() => setViewMode(m)}
                  aria-label={`${m} view`}>
                  {m === "grid"
                    ? <LucideIcons.LayoutGrid className="w-[16px] h-[16px]" />
                    : <LucideIcons.LayoutList className="w-[16px] h-[16px]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Applied filters from All Filters slideout — quick chip values show inside the chip itself */}
        {slideoutApplied.length > 0 && (
          <div className="flex flex-wrap items-center gap-[6px] px-[16px] py-[10px]"
            style={{ borderTop: "1px solid var(--field-border)" }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0"
              style={{ color: "var(--field-supporting)" }}>Applied:</span>
            {slideoutActiveFilters.map((f, idx) => {
              const palette = ["informative", "purple", "success", "alert", "lightBlue", "limeGreen"] as const
              const variant = palette[idx % palette.length]
              return (
                <Tag key={`sf-${idx}`} variant={variant} size="sm"
                  trailingIcon={
                    <button className="flex items-center justify-center hover:opacity-70 transition-opacity ml-[1px]"
                      onClick={f.onRemove} aria-label={`Remove ${f.value}`}>
                      <LucideIcons.X className="w-[9px] h-[9px]" />
                    </button>
                  }>
                  {f.label}: {f.value.length > 13 ? `${f.value.slice(0, 13)}…` : f.value}
                </Tag>
              )
            })}
            <button className="text-[12px] font-medium transition-colors ml-[2px]"
              style={{ color: "var(--fi-clear-text)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--fi-clear-hover)" }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--fi-clear-text)" }}
              onClick={() => setSlideoutApplied([])}>
              Clear all
            </button>
          </div>
        )}
      </div>

      <FiltersSlideout
        isOpen={slideout}
        onClose={() => setSlideout(false)}
        onClearAll={clearAll}
        onApply={() => {
          // Simulate applying filters from the slideout
          setSlideoutApplied([
            { label: "Department", value: "Engineering" },
            { label: "Date range", value: "Last 30 days" },
            { label: "Priority",   value: "High" },
          ])
          setSlideout(false)
        }}
        activeFilters={slideoutActiveFilters}
      />
    </div>
  )
}

// ── FiltersPage ───────────────────────────────────────────────────────────────

function FiltersPage({ openSpec }: { openSpec: (s: SpecModal) => void }) {
  const [tab,              setTab]              = useState<"overview" | "playground" | "slideout" | "reference">("overview")
  const [pgSlideoutOpen,   setPgSlideoutOpen]   = useState(false)

  const DEFAULT_SLOTS: FilterSlot[] = [
    { placeholder: "Type"     },
    { placeholder: "Owner"    },
    { placeholder: "Modified" },
    { placeholder: "Filter 4" },
  ]

  const ACTIVE_SLOTS: FilterSlot[] = [
    { placeholder: "Type"     },
    { placeholder: "Owner",   value: "John Smith" },
    { placeholder: "Modified" },
    { placeholder: "Filter 4" },
  ]


  return (
    <div className="flex flex-col gap-0">

      {/* Header */}
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Filters</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            Horizontal 40px filter bar for narrowing large datasets. 8 state variants · up to 5 filter chips ·
            selected value shown as <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">Tag informative sm</code> ·
            label truncated at 14 chars. "All filters" opens a 380px slideout with 12 section types.
            Token family{" "}
            <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">--fi-*</code>.
          </p>
        </div>
        <SpecButton onClick={() => openSpec("filters")} />
      </div>

      <TabBar
        tabs={[
          { id: "overview",   label: "Overview"   },
          { id: "playground", label: "Playground" },
          { id: "slideout",   label: "Slideout"   },
          { id: "reference",  label: "Reference"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[40px]">

            {/* State variants */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">State variants</h2>
              <p className="text-[13px] text-[var(--field-supporting)] -mt-[4px]">8 variants from the DS — all 40px tall, full-width.</p>

              <div className="flex flex-col gap-[16px]">

                {/* S Variant */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">S Variant</span>
                  <Filters compact showSearch showSort showViewToggle showAllFilters />
                </div>

                {/* S Variant Filters Apply */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">S Variant — Filters Apply</span>
                  <Filters compact compactCount={1} showSort showViewToggle />
                </div>

                {/* Default */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Default</span>
                  <Filters showSearch slots={DEFAULT_SLOTS} showSort showViewToggle showAllFilters />
                </div>

                {/* Owner 1 — active filter chip */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Owner 1 — active chip</span>
                  <Filters
                    showSearch
                    slots={ACTIVE_SLOTS}
                    showClearFilters
                    showSort showViewToggle showAllFilters
                  />
                </div>

                {/* Modified Active */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--field-supporting)]">Modified Active</span>
                  <Filters
                    showSearch={false}
                    slots={[
                      { placeholder: "Type"     },
                      { placeholder: "Owner"    },
                      { placeholder: "Modified", value: "Last 7 Days" },
                      { placeholder: "Filter 4" },
                    ]}
                    showClearFilters
                    showSort showViewToggle showAllFilters
                  />
                </div>

              </div>
            </div>

            {/* Anatomy */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Anatomy</h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["#","Element","Description"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: "1", el: "Filter Row Container",   desc: "Horizontal flex container, 40px tall, fills available width." },
                      { n: "2", el: "Search Input",           desc: "140px inline search field with magnifier icon." },
                      { n: "3", el: "Filter Chip (inactive)", desc: "Pill-shaped dropdown button. Label + chevron. Neutral border." },
                      { n: "4", el: "Filter Chip (active)",   desc: "Active chip with selected value + × dismiss + chevron. Blue border." },
                      { n: "5", el: "Filter Label",           desc: "Truncated at 14 characters. Full value shown in tooltip on hover/focus." },
                      { n: "6", el: "× Remove Icon",          desc: "Removes the active filter from the set." },
                      { n: "7", el: "Clear Filters",          desc: "Text link that appears when any filter is active." },
                      { n: "8", el: "All filters button",     desc: "Pill with SlidersHorizontal icon. Opens full filter panel." },
                      { n: "9", el: "Sort controls",          desc: "Arrow direction toggle + sort field label dropdown." },
                      { n: "10", el: "View toggle",           desc: "Grid / List icon buttons. Active state uses primary blue fill." },
                    ].map((row, i) => (
                      <tr key={row.n} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : undefined, borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] text-[12px] font-mono text-[var(--field-supporting)]">{row.n}</td>
                        <td className="px-[14px] py-[10px] font-medium text-[13px]" style={{ color: "var(--foreground)" }}>{row.el}</td>
                        <td className="px-[14px] py-[10px] text-[13px]" style={{ color: "var(--field-supporting)" }}>{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Usage guidelines */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Usage guidelines</h2>
              <div className="grid grid-cols-2 gap-[12px]">
                <div className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-success-bg)", border: "1px solid var(--tag-success-bd)" }}>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-success-fg)" }}>✅ When to use</p>
                  {[
                    "Use when users need to narrow large datasets (tables, grids, lists) by one or more criteria.",
                    "Apply when filter options are finite and known — categories, owners, statuses, types.",
                    "Use the chip-based filter row when screen space allows multiple active filters to be visible simultaneously.",
                    "Enable the Sorting control when column-level sorting complements filter-based refinement.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-success-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
                <div className="flex flex-col gap-[10px] rounded-[8px] p-[16px]"
                  style={{ background: "var(--tag-error-bg)", border: "1px solid var(--tag-error-bd)" }}>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--tag-error-fg)" }}>❌ When not to use</p>
                  {[
                    "Don't use filters when the dataset has fewer than ~10 items — sorting is usually sufficient.",
                    "Avoid if filter criteria are dynamic and unknown at design time; use free-text search instead.",
                    "Don't show filters without a visible reset/clear-all mechanism when multiple filters can be applied.",
                    "Don't combine with in-row inline editing without a clear visual separation between editable and filter state.",
                  ].map((t, i) => (
                    <p key={i} className="text-[12px] flex gap-[6px]" style={{ color: "var(--tag-error-fg)" }}>
                      <span className="shrink-0">·</span>{t}
                    </p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Playground ───────────────────────────────────────────────────── */}
        {tab === "playground" && <FiltersInteractivePlayground />}

        {/* ── Slideout ─────────────────────────────────────────────────────── */}
        {tab === "slideout" && (
          <div className="flex flex-col gap-[40px]">

            {/* Overview */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">All filters panel</h2>
              <p className="text-[13px]" style={{ color: "var(--field-supporting)" }}>
                Triggered by the "All filters" button in the Filters bar. 380px right-side slideout with
                sticky header, scrollable body, and sticky footer. Contains 12 section types — each
                with 4 state variants (expanded/collapsed × active/inactive).
              </p>
              <div className="flex flex-col gap-[8px]">
                <button
                  className="inline-flex items-center gap-[8px] h-[40px] px-[16px] rounded-[8px] border text-[13px] font-medium self-start transition-colors"
                  style={{
                    background:  "var(--fi-chip-bg)",
                    borderColor: "var(--fi-chip-border)",
                    color:       "var(--fi-chip-text)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--fi-chip-hover-bg)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--fi-chip-bg)" }}
                  onClick={() => setPgSlideoutOpen(true)}
                >
                  Open "All filters" panel →
                </button>
                <p className="text-[12px]" style={{ color: "var(--field-supporting)" }}>
                  Click to open the live 380px slideout panel with all 12 filter section types.
                </p>
              </div>
              <FiltersSlideout
                isOpen={pgSlideoutOpen}
                onClose={() => setPgSlideoutOpen(false)}
                onClearAll={() => {}}
                onApply={() => setPgSlideoutOpen(false)}
              />
            </div>

            {/* Active indicator rules */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Active indicator rules</h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["Section type","Figma node","Active indicator","Pattern"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: "Sort",          node: "11971:775", indicator: "None",      pattern: "Always has a value — no clear needed" },
                      { type: "Toggle List",   node: "13848:405", indicator: "{x} badge", pattern: "Shows count of toggled-on items. 'Show N more ▼' expander." },
                      { type: "Multi Select",  node: "13848:477", indicator: "{x} badge", pattern: "Shows count of checked items. 'Show N more ▼' expander." },
                      { type: "Priority",      node: "13851:366", indicator: "{x} badge", pattern: "Shows count of checked priorities (Critical · High · Medium · Low)." },
                      { type: "Date Presets",  node: "13851:482", indicator: "{x} badge", pattern: "Shows 1 when any preset is selected. Radio — single selection only." },
                      { type: "Numeric Range", node: "13852:471", indicator: '"Clear"',   pattern: "Appears when min or max field has a value." },
                      { type: "Search Select", node: "13996:2054", indicator: "{x} badge", pattern: "Shows count of checked items. Filters list via search input." },
                      { type: "Single Select", node: "14056:459", indicator: '"Clear"',   pattern: "Appears when a non-default option is selected." },
                      { type: "Chip Select",   node: "11971:786", indicator: '"Clear"',   pattern: "Appears when ≥1 chip selected. '+N more' hides overflow chips." },
                      { type: "Assignment",    node: "14091:418", indicator: '"Clear"',   pattern: "Appears when ≥1 assignee selected. '+N' shows overflow count." },
                      { type: "Date & Time",   node: "14094:432", indicator: '"Clear"',   pattern: "Appears when From or To field has a value." },
                      { type: "AI Insights",   node: "14095:506", indicator: '"Clear"',   pattern: "Appears when any status chip or Alert Level is non-default." },
                    ].map((row, i) => (
                      <tr key={row.type} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : undefined, borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] font-medium text-[13px]" style={{ color: "var(--foreground)" }}>{row.type}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--field-supporting)" }}>{row.node}</td>
                        <td className="px-[14px] py-[10px]">
                          {row.indicator === "None" ? (
                            <span className="text-[12px]" style={{ color: "var(--field-supporting)" }}>—</span>
                          ) : row.indicator === '"Clear"' ? (
                            <span className="text-[13px] font-medium" style={{ color: "var(--primary)" }}>Clear</span>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-[5px] rounded-full text-[11px] font-semibold"
                              style={{ background: "var(--tag-informative-bg)", border: "1px solid var(--tag-informative-bd)", color: "var(--tag-informative-fg)" }}
                            >
                              {"{2}"}
                            </span>
                          )}
                        </td>
                        <td className="px-[14px] py-[10px] text-[12px]" style={{ color: "var(--field-supporting)" }}>{row.pattern}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edge cases */}
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Edge cases — Filter bar chips</h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["Case","Behavior","Visual"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        case: "14-char truncation",
                        behavior: 'Values longer than 14 chars are sliced at index 14 and appended with "..." inside the Tag.',
                        example: <span className="inline-flex gap-[4px] items-center"><span className="inline-flex items-center h-[20px] px-[8px] rounded-[8px] border text-[12px] font-medium" style={{ background: "var(--tag-informative-bg)", borderColor: "var(--tag-informative-bd)", color: "var(--tag-informative-fg)" }}>Last 7 days -- a...</span></span>,
                      },
                      {
                        case: "Tag as value",
                        behavior: 'The active chip always renders its value as Tag informative sm inside the chip shell. The chip provides the 40px container; the Tag provides the informative pill.',
                        example: <span className="inline-flex gap-[4px] items-center"><span className="inline-flex items-center h-[20px] px-[8px] rounded-[8px] border text-[12px] font-medium" style={{ background: "var(--tag-informative-bg)", borderColor: "var(--tag-informative-bd)", color: "var(--tag-informative-fg)" }}>John Smith</span></span>,
                      },
                      {
                        case: "x dismiss",
                        behavior: "The x button calls onRemove() on the FilterSlot. The consumer manages state -- the chip reverts to inactive after removal.",
                        example: null,
                      },
                      {
                        case: "Clear Filters link",
                        behavior: "Appears when showClearFilters=true. Should be set by the consumer when any slot has an active value. Calls onClearFilters() to reset all.",
                        example: null,
                      },
                      {
                        case: "Compact S variant",
                        behavior: "compact=true hides all chips and shows only Search + All filters. When compactCount>0, shows badge count instead of search.",
                        example: null,
                      },
                    ].map((row, i) => (
                      <tr key={row.case} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : undefined, borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] font-medium text-[13px]" style={{ color: "var(--foreground)" }}>{row.case}</td>
                        <td className="px-[14px] py-[10px] text-[12px]" style={{ color: "var(--field-supporting)" }}>{row.behavior}</td>
                        <td className="px-[14px] py-[10px]">{row.example ?? <span className="text-[12px]" style={{ color: "var(--field-supporting)" }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Slideout props */}
            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">FiltersSlideout props</h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["Prop","Type","Description"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { prop: "isOpen",     type: "boolean",      desc: "Controls whether the panel is visible. Animates in/out on change." },
                      { prop: "onClose",    type: "() => void",   desc: "Called when X button, Cancel, or the overlay is clicked." },
                      { prop: "onApply",    type: "() => void?",  desc: "Called when 'Apply filters' is clicked (before onClose)." },
                      { prop: "onClearAll", type: "() => void?",  desc: "Called when 'Clear all' in the header is clicked." },
                      { prop: "className",  type: "string?",      desc: "Extra classes on the panel element (not the overlay)." },
                    ].map((row, i) => (
                      <tr key={row.prop} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : undefined, borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] font-mono text-[12px]" style={{ color: "var(--primary)" }}>{row.prop}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--field-supporting)" }}>{row.type}</td>
                        <td className="px-[14px] py-[10px] text-[12px]" style={{ color: "var(--foreground)" }}>{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── Reference ────────────────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[24px]">

            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Props</h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["Prop","Type","Default","Description"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { prop: "compact",           type: "boolean",            def: "false",       desc: "S Variant — shows only Search + All Filters." },
                      { prop: "compactCount",      type: "number",             def: "0",           desc: "> 0 → S Variant Filters Apply: Filters badge with count instead of search." },
                      { prop: "showSearch",        type: "boolean",            def: "true",        desc: "Renders the 140px search input on the left side." },
                      { prop: "searchPlaceholder", type: "string",             def: '"Search"',    desc: "Placeholder text inside the search input." },
                      { prop: "slots",             type: "FilterSlot[]",       def: "[]",          desc: "Up to 5 filter chips. If value is set, chip is active with × dismiss." },
                      { prop: "showClearFilters",  type: "boolean",            def: "false",       desc: "Shows 'Clear Filters' text link after the chips." },
                      { prop: "onClearFilters",    type: "() => void",         def: "undefined",   desc: "Called when 'Clear Filters' is clicked." },
                      { prop: "showAllFilters",    type: "boolean",            def: "true",        desc: "Shows 'All filters ☰' pill button in right controls." },
                      { prop: "onAllFiltersClick", type: "() => void",         def: "undefined",   desc: "Called when All Filters button is clicked." },
                      { prop: "showSort",          type: "boolean",            def: "true",        desc: "Shows sort direction arrow + sort label dropdown." },
                      { prop: "sortLabel",         type: "string",             def: '"Name"',      desc: "Label shown in the sort dropdown button." },
                      { prop: "showViewToggle",    type: "boolean",            def: "true",        desc: "Shows Grid/List icon toggle buttons." },
                      { prop: "viewMode",          type: '"grid" | "list"',    def: '"grid"',      desc: "Active view mode. Grid icon is highlighted in primary blue." },
                      { prop: "onViewModeChange",  type: "(mode) => void",     def: "undefined",   desc: "Called when a view toggle button is clicked." },
                      { prop: "className",         type: "string",             def: "undefined",   desc: "Extra classes applied to the root element." },
                    ].map((row, i) => (
                      <tr key={row.prop} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : undefined, borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] font-mono text-[12px]" style={{ color: "var(--primary)" }}>{row.prop}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--field-supporting)" }}>{row.type}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--field-supporting)" }}>{row.def}</td>
                        <td className="px-[14px] py-[10px] text-[12px]"          style={{ color: "var(--foreground)" }}>{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FilterSlot type */}
            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">FilterSlot type</h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["Field","Type","Description"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: "placeholder", type: "string",      desc: 'Label shown when no value is selected (e.g. "Type", "Owner").' },
                      { field: "value",       type: "string?",     desc: "If set, chip renders as active with this value + × dismiss icon." },
                      { field: "onRemove",    type: "() => void?", desc: "Called when the × dismiss icon is clicked." },
                      { field: "onOpen",      type: "() => void?", desc: "Called when the chip or its chevron is clicked." },
                    ].map((row, i) => (
                      <tr key={row.field} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : undefined, borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] font-mono text-[12px]" style={{ color: "var(--primary)" }}>{row.field}</td>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--field-supporting)" }}>{row.type}</td>
                        <td className="px-[14px] py-[10px] text-[12px]"          style={{ color: "var(--foreground)" }}>{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Token table */}
            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">CSS tokens — <code className="text-[14px] font-mono">--fi-*</code></h2>
              <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid var(--table-border)" }}>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--table-border)" }}>
                      {["Token","DS source","Light","Dark"].map(h => (
                        <th key={h} className="text-left px-[14px] py-[10px] text-[12px] font-semibold text-[var(--field-supporting)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { token: "--fi-chip-bg",            ds: "Surface/Neutral/Subtle",  light: "rgba(250,250,250,1)",     dark: "rgba(255,255,255,0.05)" },
                      { token: "--fi-chip-border",        ds: "Border/Neutral/Lighter",  light: "rgba(186,186,186,1)",     dark: "rgba(255,255,255,0.15)" },
                      { token: "--fi-chip-text",          ds: "Text/Subtitle",           light: "#2a2a2a",                 dark: "rgba(255,255,255,0.70)" },
                      { token: "--fi-chip-icon",          ds: "Icon/Neutral",            light: "rgba(0,0,0,0.40)",        dark: "rgba(255,255,255,0.40)" },
                      { token: "--fi-chip-active-bg",     ds: "Surface/Primary/Subtle",  light: "rgba(33,115,255,0.06)",   dark: "rgba(43,127,255,0.08)"  },
                      { token: "--fi-chip-active-border", ds: "Border/Primary/Default",  light: "#2173ff",                 dark: "#2b7fff"                },
                      { token: "--fi-chip-active-text",   ds: "Text/Info",               light: "#2173ff",                 dark: "#A8C8FF"                },
                      { token: "--fi-chip-active-icon",   ds: "Icon/Primary/Darker",     light: "#2173ff",                 dark: "rgba(168,200,255,0.80)" },
                      { token: "--fi-badge-bg",           ds: "Border/Primary/Default",  light: "#2173ff",                 dark: "#2b7fff"                },
                      { token: "--fi-view-active-bg",     ds: "Border/Primary/Default",  light: "#2173ff",                 dark: "#2b7fff"                },
                      { token: "--fi-sort-text",          ds: "Text/Subtitle",           light: "rgba(0,0,0,0.65)",        dark: "rgba(255,255,255,0.65)" },
                    ].map((row, i) => (
                      <tr key={row.token} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : undefined, borderBottom: "1px solid var(--table-border)" }}>
                        <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: "var(--primary)" }}>{row.token}</td>
                        <td className="px-[14px] py-[10px] text-[12px]"          style={{ color: "var(--field-supporting)" }}>{row.ds}</td>
                        <td className="px-[14px] py-[10px]">
                          <span className="flex items-center gap-[6px]">
                            <span className="w-[12px] h-[12px] rounded-[3px] border border-[var(--field-border)]" style={{ background: row.light }} />
                            <code className="text-[11px] font-mono text-[var(--field-supporting)]">{row.light}</code>
                          </span>
                        </td>
                        <td className="px-[14px] py-[10px]">
                          <span className="flex items-center gap-[6px]">
                            <span className="w-[12px] h-[12px] rounded-[3px] border border-[var(--field-border)]" style={{ background: row.dark }} />
                            <code className="text-[11px] font-mono text-[var(--field-supporting)]">{row.dark}</code>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

function IconsPage() {
  const [tab,    setTab]    = useState<"reference" | "overview">("reference")
  const [search, setSearch] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const query = search.toLowerCase().trim()
  const filtered = query
    ? ICON_CATEGORIES
        .map(cat => ({ ...cat, icons: cat.icons.filter(ic =>
          ic.dsName.toLowerCase().includes(query) || ic.lucide.toLowerCase().includes(query)
        )}))
        .filter(cat => cat.icons.length > 0)
    : ICON_CATEGORIES

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-[16px] mb-[28px]">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Icons</h1>
          <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
            {ICON_TOTAL} icons mapped from Material Design (Figma DS) to Lucide. Same semantics, different family.{" "}
            Import from{" "}
            <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">
              lucide-react
            </code>.
          </p>
        </div>
      </div>

      <TabBar
        tabs={[
          { id: "reference", label: "Reference" },
          { id: "overview",  label: "Overview"  },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Reference tab ──────────────────────────────────────────── */}
        {tab === "reference" && (
          <div className="flex flex-col gap-[32px]">

            {/* Search */}
            <div className="relative">
              <span className="absolute left-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[var(--field-supporting)]">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by DS name or Lucide name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={[
                  "w-full h-[40px] pl-[36px] pr-[12px] rounded-[8px]",
                  "border border-[var(--field-border)] bg-[var(--field-bg)]",
                  "text-[14px] text-[var(--foreground)] placeholder:text-[var(--field-supporting)]",
                  "outline-none focus:border-[var(--field-focus-border)] transition-colors",
                ].join(" ")}
              />
            </div>

            {filtered.length === 0 && (
              <p className="text-[14px] text-[var(--field-supporting)] text-center py-[40px]">
                Sin resultados para "{search}"
              </p>
            )}

            {/* Category sections */}
            {filtered.map(cat => (
              <div key={cat.id} className="flex flex-col gap-[14px]">
                {/* Category header */}
                <div className="flex items-center gap-[10px]">
                  <span className="text-[11px] font-mono text-[var(--field-supporting)] bg-[var(--field-border)] px-[6px] py-[2px] rounded-[4px] shrink-0">
                    {cat.number}
                  </span>
                  <h2 className="text-[15px] font-semibold text-[var(--foreground)]">{cat.label}</h2>
                  <span className="text-[12px] text-[var(--field-supporting)]">{cat.icons.length}</span>
                </div>

                {/* Icon grid — click to copy Lucide name */}
                <div className="grid gap-[6px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))" }}>
                  {cat.icons.map(ic => {
                    const isCopied = copied === ic.lucide
                    return (
                      <button
                        key={ic.lucide}
                        onClick={() => copy(ic.lucide)}
                        title={`Copiar: ${ic.lucide}`}
                        className={[
                          "flex flex-col items-center gap-[8px] p-[10px] rounded-[8px] border text-left",
                          "transition-colors cursor-pointer",
                          isCopied
                            ? "border-[var(--tag-success-bd)] bg-[var(--tag-success-bg)]"
                            : "border-[var(--field-border)] bg-transparent hover:border-[var(--field-focus-border)] hover:bg-[var(--field-bg)]",
                        ].join(" ")}
                      >
                        {/* Icon preview */}
                        <span className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] bg-[var(--field-border)] text-[var(--foreground)] shrink-0">
                          <LucidePreview name={ic.lucide} />
                        </span>
                        {/* Labels */}
                        <span className="flex flex-col gap-[2px] w-full min-w-0">
                          <span
                            className={[
                              "text-[11px] font-mono truncate w-full",
                              isCopied ? "text-[var(--tag-success-fg)]" : "text-[var(--foreground)]",
                            ].join(" ")}
                            title={ic.lucide}
                          >
                            {isCopied ? "Copiado ✓" : ic.lucide}
                          </span>
                          <span className="text-[10px] text-[var(--field-supporting)] truncate w-full" title={ic.dsName}>
                            {ic.dsName}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Overview tab ───────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-[32px]">

            {/* Sizes */}
            <div className="flex flex-col gap-[16px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Sizes</h2>
              <div className="flex gap-[12px] flex-wrap">
                {([
                  { label: "S — 16px", size: 16, desc: "Inside tags, compact tables, dense UI"          },
                  { label: "M — 20px", size: 20, desc: "Default — buttons, inputs, navigation"           },
                  { label: "L — 24px", size: 24, desc: "Headings, empty states, highlight icons"         },
                ] as const).map(s => (
                  <div key={s.size} className="flex flex-col gap-[12px] p-[16px] rounded-[8px] border border-[var(--field-border)] bg-[var(--field-bg)] min-w-[152px]">
                    <div className="flex items-center justify-center h-[40px] text-[var(--foreground)]">
                      <LucideIcons.Zap size={s.size} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--foreground)]">{s.label}</p>
                      <p className="text-[11px] text-[var(--field-supporting)] mt-[2px]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage snippets */}
            <div className="flex flex-col gap-[16px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">How to use</h2>
              <div className="flex flex-col gap-[10px]">
                {[
                  { label: "Import by name",           code: `import { ChevronDown } from "lucide-react"` },
                  { label: "Standard usage",           code: `<ChevronDown size={20} strokeWidth={1.75} />` },
                  { label: "As a component prop",      code: `<Button icon={<Plus size={16} />}>Add</Button>` },
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[var(--field-supporting)]">{item.label}</span>
                    <code className="block text-[12px] font-mono bg-[var(--field-border)] px-[12px] py-[8px] rounded-[6px] text-[var(--foreground)]">
                      {item.code}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Category index */}
            <div className="flex flex-col gap-[16px]">
              <h2 className="text-[16px] font-semibold text-[var(--foreground)]">Categories</h2>
              <div className="grid grid-cols-1 gap-[6px] md:grid-cols-2">
                {ICON_CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] border border-[var(--field-border)]">
                    <span className="text-[11px] font-mono text-[var(--field-supporting)] shrink-0 w-[20px]">{cat.number}</span>
                    <span className="text-[13px] text-[var(--foreground)] flex-1">{cat.label}</span>
                    <span className="text-[12px] text-[var(--field-supporting)] shrink-0">{cat.icons.length}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

// ── Typography Page ───────────────────────────────────────────────────────

const TYPE_CATEGORIES = ["Display","Title","Subtitle","Body","Label","Caption","Link"]

function TypographyPage() {
  const [copied, setCopied] = useState<string|null>(null)

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-[28px]">
        <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Typography</h1>
        <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
          DS typographic scale mapped to Tailwind classes. Font:{" "}
          <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">Inter</code>.
          All sizes defined in <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">tailwind.config.js</code> as{" "}
          <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">text-type-*</code>.
        </p>
      </div>

      <div className="flex flex-col gap-[40px]">
        {TYPE_CATEGORIES.map(cat => {
          const styles = TYPOGRAPHY_STYLES.filter(s => s.category === cat)
          return (
            <div key={cat} className="flex flex-col gap-[2px]">
              {/* Category label */}
              <div className="flex items-center gap-[10px] pb-[12px] border-b border-[var(--field-border)] mb-[4px]">
                <h2 className="text-[13px] font-semibold text-[var(--field-supporting)] uppercase tracking-[0.08em]">{cat}</h2>
                <span className="text-[12px] text-[var(--field-supporting)]">{styles.length}</span>
              </div>

              {/* Style rows */}
              {styles.map(s => (
                <div key={s.dsName}
                  className="grid items-start gap-x-[16px] py-[14px] border-b border-[var(--field-border)] last:border-0"
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  {/* Left: live preview */}
                  <div className="flex items-start min-h-[32px] pt-[2px]">
                    <span
                      className={[s.tailwind, s.isLink ? "text-[#2173ff] dark:text-[#2b7fff]" : "text-[var(--foreground)]"].join(" ")}
                    >
                      {cat === "Display" ? "Heading" : cat === "Link" ? "Link text" : cat === "Caption" ? "Caption text" : `${cat} sample`}
                    </span>
                  </div>

                  {/* Right: metadata + Tailwind class */}
                  <div className="flex flex-col gap-[6px]">
                    <span className="text-[12px] text-[var(--field-supporting)]">{s.dsName}</span>
                    <div className="flex flex-wrap gap-[6px] items-center">
                      <span className="text-[11px] font-mono bg-[var(--field-border)] text-[var(--foreground)] px-[6px] py-[2px] rounded-[4px]">{s.size}</span>
                      <span className="text-[11px] font-mono bg-[var(--field-border)] text-[var(--foreground)] px-[6px] py-[2px] rounded-[4px]">lh {s.lineHeight}</span>
                      {s.letterSpacing && (
                        <span className="text-[11px] font-mono bg-[var(--field-border)] text-[var(--foreground)] px-[6px] py-[2px] rounded-[4px]">ls {s.letterSpacing}</span>
                      )}
                    </div>
                    {/* Tailwind class — click to copy */}
                    <button
                      onClick={() => copy(s.tailwind)}
                      title="Copiar clases Tailwind"
                      className={[
                        "text-left text-[11px] font-mono px-[8px] py-[5px] rounded-[6px] border transition-colors cursor-pointer w-fit",
                        copied === s.tailwind
                          ? "border-[var(--tag-success-bd)] bg-[var(--tag-success-bg)] text-[var(--tag-success-fg)]"
                          : "border-[var(--field-border)] bg-transparent text-[var(--foreground)] hover:border-[var(--field-focus-border)]",
                      ].join(" ")}
                    >
                      {copied === s.tailwind ? "Copiado ✓" : s.tailwind}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {/* Weight reference */}
        <div className="flex flex-col gap-[16px]">
          <h2 className="text-[13px] font-semibold text-[var(--field-supporting)] uppercase tracking-[0.08em] pb-[12px] border-b border-[var(--field-border)]">
            Font Weights
          </h2>
          <div className="grid grid-cols-2 gap-[8px] md:grid-cols-3 lg:grid-cols-5">
            {[
              {label:"Regular",   cls:"font-regular",   value:"500", desc:"Body, Caption, Link"},
              {label:"Semi Bold", cls:"font-semibold",  value:"600", desc:"Title, Label, Subtitle"},
              {label:"Bold",      cls:"font-bold",      value:"700", desc:"Display/Bold"},
              {label:"Extra Bold",cls:"font-extrabold", value:"800", desc:"Display/ExtraBold"},
              {label:"Black",     cls:"font-black",     value:"900", desc:"Display/Black"},
            ].map(w => (
              <div key={w.label} className="flex flex-col gap-[8px] p-[14px] rounded-[8px] border border-[var(--field-border)]">
                <span className={`text-type-xl ${w.cls} text-[var(--foreground)]`}>Ag</span>
                <div>
                  <p className="text-[12px] font-semibold text-[var(--foreground)]">{w.label}</p>
                  <p className="text-[11px] font-mono text-[var(--field-supporting)]">{w.cls} · {w.value}</p>
                  <p className="text-[11px] text-[var(--field-supporting)] mt-[2px]">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Colors Page ────────────────────────────────────────────────────────────

function ColorDot({ hex, size = 32 }: { hex: string | null; size?: number }) {
  if (!hex) return <span className="rounded-[4px] border border-dashed border-[var(--field-border)]" style={{width:size,height:size,display:"inline-block"}} />
  const isTransparent = hex.length === 9 || hex.length === 7 && hex === "#ffffff"
  return (
    <span
      className="rounded-[4px] border border-[var(--field-border)] shrink-0 inline-block"
      style={{ width:size, height:size, background: hex,
        backgroundImage: isTransparent && hex.length > 7 ? "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)" : undefined,
        backgroundSize: "8px 8px",
        backgroundPosition: "0 0, 4px 4px",
      }}
    />
  )
}

// ── Breakpoints data ─────────────────────────────────────────────────────────

const BP_TIERS = [
  {
    id: "xl", label: "XL", name: "XL Desktop",
    min: 1920, max: null, canvasW: 1920, canvasH: 1080,
    cols: 12, gutter: 24, margin: 80, sidebar: 80,
    color: "#2b7fff", bg: "rgba(43,127,255,0.12)", border: "rgba(43,127,255,0.3)",
    note: "Information-dense views (UCP, dashboards). Design here first.",
  },
  {
    id: "l", label: "L", name: "L Desktop",
    min: 1440, max: 1919, canvasW: 1440, canvasH: 900,
    cols: 12, gutter: 24, margin: 32, sidebar: 80,
    color: "#6ee7b7", bg: "rgba(110,231,183,0.10)", border: "rgba(110,231,183,0.25)",
    note: "Standard baseline for most business workflows.",
  },
  {
    id: "m", label: "M", name: "M Laptop",
    min: 1280, max: 1439, canvasW: 1280, canvasH: 832,
    cols: 12, gutter: 16, margin: 24, sidebar: 80,
    color: "#fcd34d", bg: "rgba(252,211,77,0.10)", border: "rgba(252,211,77,0.25)",
    note: "MacBook Pro / Air target. Test all views here.",
  },
  {
    id: "s", label: "S", name: "S Tablet",
    min: 600, max: 1279, canvasW: 744, canvasH: 1113,
    cols: 8, gutter: 16, margin: 24, sidebar: 80,
    color: "#d8b4fe", bg: "rgba(216,180,254,0.10)", border: "rgba(216,180,254,0.25)",
    note: "Tablet portrait. Sidebar toggleable (overlay or push).",
  },
  {
    id: "xs", label: "XS", name: "Mobile",
    min: null, max: 599, canvasW: 375, canvasH: 812,
    cols: 4, gutter: 12, margin: 16, sidebar: 0,
    color: "#fb923c", bg: "rgba(251,146,60,0.10)", border: "rgba(251,146,60,0.25)",
    note: "Mobile. No sidebar — provide alternate navigation.",
  },
]

const BP_CONTEXT = [
  { view: "UCP / Unified Consumer Profile", primary: "XL",  also: "L, M",  note: "Dense multi-panel — sidebar always fixed." },
  { view: "Dashboard / Table view",         primary: "L",   also: "XL, M", note: "Most users on business laptops." },
  { view: "Grid view (Cards)",              primary: "L",   also: "XL, M, S", note: "Card grid reflows — test column wrapping." },
  { view: "List view",                      primary: "L",   also: "M, S",  note: "Simpler layout but sidebar toggles at S." },
  { view: "Settings / Admin",               primary: "L",   also: "M",     note: "Power-user views — tablet rare." },
]

const BP_RULES = [
  "Design at XL (1920px) first for information-dense views like UCP and dashboards.",
  "Use L (1440px) as the standard baseline for most business workflows.",
  "Test all views at M (1280px) to ensure compatibility with MacBook Pro and Air users.",
  "Design S (600–1279px) layouts for tablet — use toggle sidebar and reduce columns from 12 to 8.",
  "Don't apply XL padding (80px) at smaller breakpoints — use the specified margin per tier.",
  "Don't create new breakpoint values outside the defined system — all layouts must conform to XL/L/M/S/XS.",
]

function BreakpointsPage() {
  const [activeBp, setActiveBp] = useState<string | null>(null)
  const focused = activeBp ? BP_TIERS.find(b => b.id === activeBp) : null

  return (
    <div className="flex flex-col gap-[40px]">

      {/* Header */}
      <div>
        <h1 className="text-[24px] font-semibold" style={{ color: "var(--foreground)" }}>Breakpoints</h1>
        <p className="text-[14px] mt-[4px]" style={{ color: "var(--field-supporting)" }}>
          5-tier responsive system sourced from Figma DS node{" "}
          <code className="text-[12px] font-mono px-[5px] py-[1px] rounded-[4px]" style={{ background: "var(--field-border)" }}>6729:35011</code>.
          All layouts must conform to these tiers — no custom breakpoint values.
        </p>
      </div>

      {/* Visual scale */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--field-supporting)" }}>Viewport scale</h2>
        <div className="relative h-[48px] rounded-[8px] overflow-hidden" style={{ background: "var(--field-bg)", border: "0.5px solid var(--field-border)" }}>
          {BP_TIERS.map((bp, i) => {
            const totalSpan = 1920
            const spanPx = bp.max != null ? bp.max - (bp.min ?? 0) + 1 : (bp.min != null ? totalSpan - bp.min : totalSpan)
            const pct = (spanPx / totalSpan) * 100
            return (
              <button
                key={bp.id}
                className="absolute top-0 h-full flex items-center justify-center text-[11px] font-semibold transition-opacity"
                style={{
                  left:   `${(((bp.min ?? 0) / totalSpan) * 100).toFixed(2)}%`,
                  width:  `${pct.toFixed(2)}%`,
                  background:  activeBp === bp.id ? bp.color : bp.bg,
                  color:       activeBp === bp.id ? "#fff" : bp.color,
                  borderRight: i < BP_TIERS.length - 1 ? `1px solid var(--field-border)` : "none",
                  opacity:     activeBp && activeBp !== bp.id ? 0.4 : 1,
                }}
                onClick={() => setActiveBp(prev => prev === bp.id ? null : bp.id)}
              >
                {bp.label}
              </button>
            )
          })}
        </div>
        <div className="flex justify-between text-[11px]" style={{ color: "var(--field-supporting)" }}>
          <span>0px</span>
          <span>600px</span>
          <span>1280px</span>
          <span>1440px</span>
          <span>1920px</span>
        </div>
      </div>

      {/* Detail card when a BP is selected */}
      {focused && (
        <div className="rounded-[10px] p-[20px] flex flex-col gap-[16px]" style={{ background: focused.bg, border: `1px solid ${focused.border}` }}>
          <div className="flex items-start justify-between gap-[16px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[16px] font-semibold" style={{ color: focused.color }}>{focused.label} — {focused.name}</span>
              <span className="text-[13px]" style={{ color: "var(--field-supporting)" }}>{focused.note}</span>
            </div>
            <div className="text-[12px] font-mono shrink-0" style={{ color: focused.color }}>
              {focused.min != null ? `≥ ${focused.min}px` : ""}{focused.max != null ? ` → ${focused.max}px` : ""}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-[8px]">
            {[
              { label: "Canvas",  value: `${focused.canvasW} × ${focused.canvasH}px` },
              { label: "Columns", value: `${focused.cols}` },
              { label: "Gutter",  value: `${focused.gutter}px` },
              { label: "Margin",  value: `${focused.margin}px` },
              { label: "Sidebar", value: focused.sidebar > 0 ? `${focused.sidebar}px` : "Hidden" },
            ].map(s => (
              <div key={s.label} className="flex flex-col gap-[4px] rounded-[8px] px-[12px] py-[10px]" style={{ background: "var(--field-bg)", border: "0.5px solid var(--field-border)" }}>
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--field-supporting)" }}>{s.label}</span>
                <span className="text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid spec table */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--field-supporting)" }}>Grid specification</h2>
        <div className="rounded-[8px] overflow-hidden" style={{ border: "0.5px solid var(--field-border)" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "var(--field-bg)", borderBottom: "0.5px solid var(--field-border)" }}>
                {["Tier", "Viewport", "Canvas", "Columns", "Gutter", "Margin", "Sidebar"].map(h => (
                  <th key={h} className="text-left px-[14px] py-[10px] font-semibold text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--field-supporting)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BP_TIERS.map((bp, i) => (
                <tr
                  key={bp.id}
                  className="cursor-pointer transition-colors"
                  style={{
                    background:  activeBp === bp.id ? bp.bg : i % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                    borderBottom: i < BP_TIERS.length - 1 ? "0.5px solid var(--field-border)" : "none",
                  }}
                  onClick={() => setActiveBp(prev => prev === bp.id ? null : bp.id)}
                >
                  <td className="px-[14px] py-[12px]">
                    <span className="inline-flex items-center justify-center w-[28px] h-[22px] rounded-[4px] text-[11px] font-bold"
                      style={{ background: bp.bg, color: bp.color, border: `0.5px solid ${bp.border}` }}>
                      {bp.label}
                    </span>
                  </td>
                  <td className="px-[14px] py-[12px] font-mono text-[12px]" style={{ color: "var(--foreground)" }}>
                    {bp.min != null ? `≥ ${bp.min}px` : ""}{bp.max != null ? `${bp.min != null ? " → " : "< "}${bp.max}px` : ""}
                  </td>
                  <td className="px-[14px] py-[12px] font-mono text-[12px]" style={{ color: "var(--field-supporting)" }}>{bp.canvasW} × {bp.canvasH}</td>
                  <td className="px-[14px] py-[12px] font-semibold" style={{ color: "var(--foreground)" }}>{bp.cols}</td>
                  <td className="px-[14px] py-[12px]" style={{ color: "var(--foreground)" }}>{bp.gutter}px</td>
                  <td className="px-[14px] py-[12px]" style={{ color: "var(--foreground)" }}>{bp.margin}px</td>
                  <td className="px-[14px] py-[12px]" style={{ color: "var(--field-supporting)" }}>
                    {bp.sidebar > 0 ? `${bp.sidebar}px${bp.id === "s" ? " (toggle)" : ""}` : "Hidden"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layout grid visualizer */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--field-supporting)" }}>Column grid preview</h2>
        <div className="flex gap-[8px] flex-wrap">
          {BP_TIERS.map(bp => {
            const cols = bp.cols
            return (
              <div key={bp.id} className="flex flex-col gap-[8px] flex-1 min-w-[140px]">
                <span className="text-[11px] font-semibold" style={{ color: bp.color }}>{bp.label} — {cols} cols</span>
                <div className="flex gap-[2px] h-[40px]">
                  {Array.from({ length: cols }).map((_, ci) => (
                    <div key={ci} className="flex-1 rounded-[2px]" style={{ background: bp.bg, border: `0.5px solid ${bp.border}` }} />
                  ))}
                </div>
                <span className="text-[11px]" style={{ color: "var(--field-supporting)" }}>
                  {bp.gutter}px gutter · {bp.margin}px margin
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Context map */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--field-supporting)" }}>Primary breakpoint by view type</h2>
        <div className="rounded-[8px] overflow-hidden" style={{ border: "0.5px solid var(--field-border)" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "var(--field-bg)", borderBottom: "0.5px solid var(--field-border)" }}>
                {["View type", "Primary", "Also test", "Note"].map(h => (
                  <th key={h} className="text-left px-[14px] py-[10px] font-semibold text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--field-supporting)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BP_CONTEXT.map((row, i) => {
                const tier = BP_TIERS.find(b => b.label === row.primary)
                return (
                  <tr key={i} style={{
                    borderBottom: i < BP_CONTEXT.length - 1 ? "0.5px solid var(--field-border)" : "none",
                    background: i % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                  }}>
                    <td className="px-[14px] py-[12px] font-medium" style={{ color: "var(--foreground)" }}>{row.view}</td>
                    <td className="px-[14px] py-[12px]">
                      <span className="inline-flex items-center justify-center w-[28px] h-[22px] rounded-[4px] text-[11px] font-bold"
                        style={{ background: tier?.bg, color: tier?.color, border: `0.5px solid ${tier?.border}` }}>
                        {row.primary}
                      </span>
                    </td>
                    <td className="px-[14px] py-[12px] text-[12px]" style={{ color: "var(--field-supporting)" }}>{row.also}</td>
                    <td className="px-[14px] py-[12px] text-[12px]" style={{ color: "var(--field-supporting)" }}>{row.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key rules */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--field-supporting)" }}>Key rules</h2>
        <div className="flex flex-col gap-[6px]">
          {BP_RULES.map((rule, i) => (
            <div key={i} className="flex items-start gap-[10px] rounded-[8px] px-[14px] py-[11px]"
              style={{ background: "var(--field-bg)", border: "0.5px solid var(--field-border)" }}>
              <span className="text-[12px] font-bold shrink-0 mt-[1px]" style={{ color: "var(--fi-view-active-bg)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px]" style={{ color: "var(--foreground)" }}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function ColorsPage() {
  const [tab,    setTab]    = useState<"primitives"|"semantic">("primitives")
  const [copied, setCopied] = useState<string|null>(null)

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-[28px]">
        <h1 className="text-[24px] font-semibold text-[var(--foreground)]">Colors</h1>
        <p className="text-[14px] text-[var(--field-supporting)] mt-[4px]">
          Primitive palette + {SEMANTIC_GROUPS.reduce((n,g) => n + g.tokens.length, 0)} semantic tokens from the DS.
          Applied in code as <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">var(--token-name)</code>{" "}
          in <code className="text-[12px] font-mono bg-[var(--field-border)] px-[5px] py-[1px] rounded-[4px]">index.css</code>.
        </p>
      </div>

      <TabBar
        tabs={[
          { id:"primitives", label:"Primitives" },
          { id:"semantic",   label:"Semantic"    },
        ]}
        active={tab}
        onChange={id => setTab(id as typeof tab)}
      />

      <div className="flex flex-col gap-[40px] pt-[32px]">

        {/* ── Primitives ─────────────────────────────────────────── */}
        {tab === "primitives" && (
          <div className="flex flex-col gap-[32px]">
            {PRIMITIVE_PALETTES.map(palette => (
              <div key={palette.id} className="flex flex-col gap-[12px]">
                <h2 className="text-[13px] font-semibold text-[var(--field-supporting)] uppercase tracking-[0.08em]">
                  {palette.label}
                </h2>
                <div className="flex flex-wrap gap-[8px]">
                  {palette.swatches.map(sw => (
                    <button
                      key={sw.scale}
                      onClick={() => copy(sw.hex)}
                      title={`${sw.hex}${sw.hexDark ? ` · dark: ${sw.hexDark}` : ""}`}
                      className={[
                        "flex flex-col gap-[6px] p-[10px] rounded-[8px] border transition-colors cursor-pointer items-center",
                        copied === sw.hex
                          ? "border-[var(--tag-success-bd)] bg-[var(--tag-success-bg)]"
                          : "border-[var(--field-border)] hover:border-[var(--field-focus-border)]",
                      ].join(" ")}
                    >
                      <ColorDot hex={sw.hex} size={40} />
                      {sw.hexDark && sw.hexDark !== sw.hex && (
                        <ColorDot hex={sw.hexDark} size={40} />
                      )}
                      <div className="flex flex-col items-center gap-[2px]">
                        <span className="text-[11px] font-semibold text-[var(--foreground)]">{sw.scale}</span>
                        <span className="text-[10px] font-mono text-[var(--field-supporting)]">
                          {copied === sw.hex ? "Copiado" : sw.hex.toUpperCase()}
                        </span>
                        {sw.hexDark && sw.hexDark !== sw.hex && (
                          <span className="text-[10px] font-mono text-[var(--field-supporting)]">{sw.hexDark.toUpperCase()}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {palette.id === "gray" && (
                  <p className="text-[11px] text-[var(--field-supporting)]">
                    * Gray es modo-dependiente — swatch superior = Light, inferior = Dark.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Semantic ───────────────────────────────────────────── */}
        {tab === "semantic" && (
          <div className="flex flex-col gap-[32px]">
            {SEMANTIC_GROUPS.map(group => (
              <div key={group.label} className="flex flex-col gap-[2px]">
                <h2 className="text-[13px] font-semibold text-[var(--field-supporting)] uppercase tracking-[0.08em] pb-[10px] border-b border-[var(--field-border)] mb-[4px]">
                  {group.label}
                </h2>
                <div className="flex flex-col gap-[0px]">
                  {group.tokens.map(tok => (
                    <div
                      key={tok.name}
                      className="grid items-center gap-x-[12px] py-[8px] border-b border-[var(--field-border)] last:border-0 hover:bg-[var(--field-bg)] px-[4px] rounded-[4px] transition-colors"
                      style={{ gridTemplateColumns: "1fr auto auto" }}
                    >
                      {/* Token name */}
                      <span className="text-[12px] font-mono text-[var(--foreground)]">{tok.name}</span>

                      {/* Light */}
                      <button
                        onClick={() => tok.light && copy(tok.light)}
                        title={tok.light ?? "none"}
                        className="flex items-center gap-[6px] cursor-pointer group"
                        disabled={!tok.light}
                      >
                        <ColorDot hex={tok.light} size={20} />
                        <span className="text-[11px] font-mono text-[var(--field-supporting)] group-hover:text-[var(--foreground)] w-[72px] text-right">
                          {tok.light ? (copied === tok.light ? "Copiado" : tok.light.toUpperCase()) : "—"}
                        </span>
                        <span className="text-[10px] text-[var(--field-supporting)] w-[32px]">Light</span>
                      </button>

                      {/* Dark */}
                      <button
                        onClick={() => tok.dark && copy(tok.dark)}
                        title={tok.dark ?? "none"}
                        className="flex items-center gap-[6px] cursor-pointer group"
                        disabled={!tok.dark}
                      >
                        <ColorDot hex={tok.dark} size={20} />
                        <span className="text-[11px] font-mono text-[var(--field-supporting)] group-hover:text-[var(--foreground)] w-[72px] text-right">
                          {tok.dark ? (copied === tok.dark ? "Copiado" : tok.dark.toUpperCase()) : "—"}
                        </span>
                        <span className="text-[10px] text-[var(--field-supporting)] w-[32px]">Dark</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Theme Toggle ──────────────────────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-label="Toggle theme"
      className={["relative flex items-center w-[44px] h-[24px] rounded-full transition-colors duration-200 shrink-0",
        isDark ? "bg-[#2173ff]" : "bg-[#2173ff30] hover:bg-[#2173ff50]",
      ].join(" ")}>
      <span className={["absolute flex items-center justify-center w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200",
        isDark ? "translate-x-[3px]" : "translate-x-[23px]"].join(" ")}>
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
      <span className={["absolute text-[9px] font-semibold select-none",
        isDark ? "right-[5px] text-[#ffffff80]" : "left-[5px] text-[#2173ff]"].join(" ")}>
        {isDark ? "D" : "L"}
      </span>
    </button>
  )
}

// ── AppNav ─────────────────────────────────────────────────────────────────

function AppNav({ active, onSelect, search, onSearch, isDark, onToggle }: {
  active: SectionId; onSelect: (id: SectionId) => void
  search: string; onSearch: (v: string) => void
  isDark: boolean; onToggle: () => void
}) {
  const filtered = useMemo(
    () => NAV_SECTIONS.filter(s => s.label.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())),
    [search]
  )
  const groups = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const s of filtered) { if (!map[s.group]) map[s.group] = []; map[s.group].push(s) }
    return map
  }, [filtered])

  const glassBg     = isDark ? "rgba(8,10,20,0.88)"     : "rgba(248,249,251,0.94)"
  const glassBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"

  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col border-r"
      style={{
        background: glassBg,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderColor: glassBorder,
      }}
    >
      <div
        className="flex items-center gap-[10px] px-[16px] py-[18px] border-b"
        style={{ borderColor: glassBorder }}
      >
        <div
          className="w-[28px] h-[28px] rounded-[7px] shrink-0 flex items-center justify-center"
          style={{ background: "radial-gradient(ellipse 140% 160% at 25% 25%, #2173ff, #09e2ab)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.9" />
            <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
            <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
            <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.3" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--foreground)] leading-none">AIMS OS</p>
          <p className="text-[10px] text-[var(--field-supporting)] leading-none mt-[2px]">Design System</p>
        </div>
      </div>
      <div className="px-[12px] py-[12px] border-b" style={{ borderColor: glassBorder }}>
        <Input placeholder="Search component…" leftIcon={<SearchIcon />} value={search} onChange={e => onSearch(e.target.value)} size="sm" />
      </div>
      <nav className="flex-1 overflow-y-auto py-[12px] px-[8px] flex flex-col gap-[4px]">
        {Object.keys(groups).length === 0 && (
          <p className="text-[12px] text-[var(--field-supporting)] px-[8px] py-[4px]">No results found</p>
        )}
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="flex flex-col gap-[2px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--field-supporting)] px-[8px] py-[4px]">{group}</p>
            {items.map(item => (
              <button key={item.id} onClick={() => onSelect(item.id)}
                className={["w-full text-left px-[10px] py-[7px] rounded-md text-[13px] transition-colors",
                  item.id === active ? "bg-[#2173ff1a] text-[#2173ff] font-semibold" : "text-[var(--foreground)] hover:bg-[var(--field-bg)] font-medium",
                ].join(" ")}>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-[16px] py-[14px] border-t flex items-center justify-between" style={{ borderColor: glassBorder }}>
        <span className="text-[12px] text-[var(--field-supporting)]">{isDark ? "Dark mode" : "Light mode"}</span>
        <ThemeToggle isDark={isDark} onToggle={onToggle} />
      </div>
    </aside>
  )
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [active,  setActive]  = useState<SectionId>("home")
  const [search,  setSearch]  = useState("")
  const [isDark,  setIsDark]  = useState(true)
  const [specModal, setSpecModal] = useState<SpecModal>(null)

  const theme = isDark ? "dark" : "light"

  function handleSearch(v: string) {
    setSearch(v)
    const filtered = NAV_SECTIONS.filter(s =>
      s.label.toLowerCase().includes(v.toLowerCase()) ||
      s.description.toLowerCase().includes(v.toLowerCase())
    )
    if (filtered.length === 1) setActive(filtered[0].id)
  }

  const canvasBg = isDark
    ? "radial-gradient(ellipse 900px 700px at -5% -5%, rgba(33,115,255,0.13), transparent), radial-gradient(ellipse 800px 600px at 105% 105%, rgba(9,226,171,0.09), transparent), var(--canvas)"
    : "radial-gradient(ellipse 900px 700px at -5% -5%, rgba(33,115,255,0.06), transparent), radial-gradient(ellipse 800px 600px at 105% 105%, rgba(9,226,171,0.04), transparent), var(--canvas)"

  return (
    <div className={`${theme} flex h-screen overflow-hidden text-[var(--foreground)]`} style={{ background: canvasBg }}>
      <AppNav
        active={active}
        onSelect={id => { setActive(id); setSearch("") }}
        search={search} onSearch={handleSearch}
        isDark={isDark} onToggle={() => setIsDark(d => !d)}
      />
      <main className="flex-1 overflow-y-auto">
        <div className={`px-[48px] py-[40px] mx-auto ${active === "entity-list" || active === "filters" ? "max-w-[1100px]" : "max-w-[900px]"}`}>
          {active === "home"            && <HomePage />}
          {active === "button"          && <ButtonPage        openSpec={setSpecModal} />}
          {active === "input"           && <InputPage         openSpec={setSpecModal} />}
          {active === "textarea"        && <TextareaPage      openSpec={setSpecModal} />}
          {active === "card-container"  && <CardContainerPage openSpec={setSpecModal} />}
          {active === "tag"             && <TagPage           openSpec={setSpecModal} />}
          {active === "menu-item"       && <MenuItemPage       openSpec={setSpecModal} />}
          {active === "highlight-icon"  && <HighlightIconPage openSpec={setSpecModal} />}
          {active === "select"          && <SelectPage        openSpec={setSpecModal} />}
          {active === "checkbox"        && <CheckboxPage      openSpec={setSpecModal} />}
          {active === "toggle"          && <TogglePage        openSpec={setSpecModal} />}
          {active === "table"           && <TablePage         openSpec={setSpecModal} />}
          {active === "topbar"          && <TopbarPage        openSpec={setSpecModal} onAppThemeChange={(dark) => setIsDark(dark)} />}
          {active === "sidebar"         && <SidebarPage       openSpec={setSpecModal} />}
          {active === "entity-list"     && <EntityListPage    openSpec={setSpecModal} />}
          {active === "modal-dialog"    && <ModalDialogPage       openSpec={setSpecModal} />}
          {active === "informative-card" && <InformativeCardPage openSpec={setSpecModal} />}
          {active === "filters"         && <FiltersPage         openSpec={setSpecModal} />}
          {active === "breakpoints"     && <BreakpointsPage />}
          {active === "icons"           && <IconsPage />}
          {active === "typography"      && <TypographyPage />}
          {active === "colors"          && <ColorsPage />}
        </div>
      </main>

      {specModal && (
        <SpecPanel spec={getSpec(specModal)} onClose={() => setSpecModal(null)} />
      )}
    </div>
  )
}
