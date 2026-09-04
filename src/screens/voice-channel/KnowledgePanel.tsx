import { useMemo, useState } from "react"
import {
  FileText, Folder, Package, Eye, X, ChevronRight,
  Plus, Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContainer } from "@/components/ui/card-container"
import { Filters } from "@/components/ui/filters"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { EmptyState } from "@/components/ui/empty-state"
import { useFilterDropdown } from "./shared"
import { AgentTestPanel } from "./AgentTestPanel"
import { KpMarketplaceModal } from "./KpMarketplaceModal"
import { SourceDriveMarketplaceModal } from "./SourceDriveMarketplaceModal"
import {
  KNOWLEDGE_PACKS,
  SHARED_DRIVES,
  UPLOADED_FILES,
  DEFAULT_ATTACHED_PACK_IDS,
  DEFAULT_ATTACHED_DRIVE_IDS,
  PACK_PLANES,
  type KnowledgePack,
  type SharedDrive,
  type UploadedFile,
  type PackPlaneId,
} from "./knowledge-data"

// ─────────────────────────────────────────────────────────────────────
// KnowledgePanel — port of the "Knowledge" (Data Access) tab from
// voice-channel-ux.html.
//
// Two-column layout matching the Channels tab:
//   Left  — Data Access header + Add + search/tab toggle + list
//   Right — Test your Agent (mock)
//
// The left pane's list swaps per tab:
//   packs    — attached KnowledgePack cards (expandable → Active planes)
//   shared   — attached SharedDrive cards
//   uploaded — Own Documents file rows
//
// Marketplace ("Browse library") and the pack content editor slide-out
// are OUT OF SCOPE for this iteration — the Add / Browse / Edit buttons
// leave onToast stubs that a follow-up PR will wire into the marketplace.
// ─────────────────────────────────────────────────────────────────────

type DaTab = "packs" | "shared" | "uploaded"

interface KnowledgePanelProps {
  agentName: string
  onOpenGovernance: () => void   // "Governance Studio" pill
  onEditPack:       (packId: string) => void
  onPreviewPack:    (packId: string) => void
  onUploadFile:     () => void
  onDownloadFile:   (fileId: string) => void
}

export function KnowledgePanel({
  agentName,
  onOpenGovernance,
  onEditPack,
  onPreviewPack,
  onUploadFile,
  onDownloadFile,
}: KnowledgePanelProps) {
  const [tab,    setTab]    = useState<DaTab>("packs")
  const [search, setSearch] = useState("")

  const [attachedPackIds,  setAttachedPackIds]  = useState<string[]>(DEFAULT_ATTACHED_PACK_IDS)
  const [attachedDriveIds, setAttachedDriveIds] = useState<string[]>(DEFAULT_ATTACHED_DRIVE_IDS)
  const [files,            setFiles]            = useState<UploadedFile[]>(UPLOADED_FILES)

  // Both marketplaces are mounted here (not lifted to the parent)
  // because they read + write the attached* state directly.
  const [marketplaceOpen,       setMarketplaceOpen]       = useState(false)
  const [drivesMarketplaceOpen, setDrivesMarketplaceOpen] = useState(false)

  // Per-card expansion + planes state, keyed by pack id.
  const [packState, setPackState] = useState<Record<string, { expanded: boolean; planes: Set<PackPlaneId> }>>(() => {
    const seed: Record<string, { expanded: boolean; planes: Set<PackPlaneId> }> = {}
    for (const p of KNOWLEDGE_PACKS) seed[p.id] = { expanded: false, planes: new Set(p.planes) }
    return seed
  })

  const q = search.trim().toLowerCase()

  const attachedPacks = useMemo(
    () => attachedPackIds
      .map(id => KNOWLEDGE_PACKS.find(p => p.id === id))
      .filter((p): p is KnowledgePack => !!p)
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)),
    [attachedPackIds, q]
  )

  const attachedDrives = useMemo(
    () => attachedDriveIds
      .map(id => SHARED_DRIVES.find(d => d.id === id))
      .filter((d): d is SharedDrive => !!d)
      .filter(d => !q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)),
    [attachedDriveIds, q]
  )

  const filteredFiles = useMemo(
    () => files.filter(f => !q || f.name.toLowerCase().includes(q)),
    [files, q]
  )

  const detachPack  = (id: string) => setAttachedPackIds(prev => prev.filter(x => x !== id))
  const detachDrive = (id: string) => setAttachedDriveIds(prev => prev.filter(x => x !== id))
  const removeFile  = (id: string) => setFiles(prev => prev.filter(x => x.id !== id))

  const togglePackExpand = (packId: string) =>
    setPackState(prev => ({
      ...prev,
      [packId]: { ...prev[packId], expanded: !prev[packId].expanded },
    }))
  const togglePackPlane = (packId: string, plane: PackPlaneId) =>
    setPackState(prev => {
      const planes = new Set(prev[packId].planes)
      if (planes.has(plane)) planes.delete(plane); else planes.add(plane)
      return { ...prev, [packId]: { ...prev[packId], planes } }
    })

  const addBtnLabel = tab === "packs"    ? "Browse library"
                    : tab === "shared"   ? "Browse drives"
                    : "Upload file"

  // Source-type "filter" — a switcher, not a subset. We use the shared
  // dropdown primitive for visual + interaction consistency with the
  // rest of the voice-channel toolbars, but omit `defaultValue` so the
  // chip always shows the current source (and there's no clear X).
  const sourceCounts = useMemo(() => ({
    packs:    attachedPackIds.length,
    shared:   attachedDriveIds.length,
    uploaded: files.length,
  }), [attachedPackIds, attachedDriveIds, files])

  const sourceDropdown = useFilterDropdown<DaTab>({
    placeholder: "Data source",
    value:       tab,
    onChange:    setTab,
    options: [
      { id: "packs",    label: "Knowledge Packs", count: sourceCounts.packs    },
      { id: "shared",   label: "Shared Drives",   count: sourceCounts.shared   },
      { id: "uploaded", label: "Own Documents",   count: sourceCounts.uploaded },
    ],
  })

  const onAdd = () => {
    if (tab === "uploaded")     onUploadFile()
    else if (tab === "packs")   setMarketplaceOpen(true)
    else                        setDrivesMarketplaceOpen(true)
  }

  return (
    <div className="flex flex-row h-full" style={{ overflow: "hidden" }}>

      {/* ── Left pane: Data Access ─────────────────────────────── */}
      <div
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ padding: 24, borderRight: "1px solid var(--color-border-neutral-default)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
              Data Access
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-caption)", maxWidth: 560, lineHeight: 1.5 }}>
              Choose what information your agent can use to answer questions. Knowledge Packs and Shared Drives are
              governed in{" "}
              <button
                type="button"
                onClick={onOpenGovernance}
                style={{
                  color: "var(--color-icon-primary-default)",
                  fontWeight: 500,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  font: "inherit",
                  textDecoration: "underline",
                }}
              >
                Governance Studio
              </button>
              ; own documents live with this agent.
            </div>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={12}/>} onClick={onAdd}>
            {addBtnLabel}
          </Button>
        </div>

        {/* Toolbar — DS Filters with search + a Data-source slot backed
            by an anchored dropdown menu. Same primitive as the Numbers /
            Call History / Agents toolbars. */}
        <div ref={sourceDropdown.containerRef} className="flex items-center gap-2 flex-wrap mb-4 relative">
          <div style={{ flex: 1, minWidth: 200 }}>
            <Filters
              showSearch
              searchPlaceholder="Search drives and documents…"
              searchValue={search}
              onSearchChange={setSearch}
              slots={[sourceDropdown.slot]}
              showAllFilters={false}
              showSort={false}
              showViewToggle={false}
            />
          </div>
        </div>
        {sourceDropdown.menu}

        {/* Content */}
        {tab === "packs" && (
          attachedPacks.length === 0 ? (
            <CardContainer variant="default" size="default">
              <EmptyState
                icon={Package}
                title={attachedPackIds.length === 0 ? "No knowledge packs attached" : `No packs match "${search}"`}
                description={attachedPackIds.length === 0
                  ? "Browse the workspace library to give this agent curated knowledge."
                  : "Try a different keyword or clear the search."}
                ctaLabel={attachedPackIds.length === 0 ? "Browse library" : "Clear search"}
                onCta={attachedPackIds.length === 0 ? () => setMarketplaceOpen(true) : () => setSearch("")}
              />
            </CardContainer>
          ) : (
            <div className="flex flex-col gap-3">
              {attachedPacks.map(p => (
                <PackCard
                  key={p.id}
                  pack={p}
                  state={packState[p.id]}
                  onToggleExpand={() => togglePackExpand(p.id)}
                  onTogglePlane={(plane) => togglePackPlane(p.id, plane)}
                  onPreview={() => onPreviewPack(p.id)}
                  onEdit={() => onEditPack(p.id)}
                  onDetach={() => detachPack(p.id)}
                />
              ))}
            </div>
          )
        )}

        {tab === "shared" && (
          attachedDrives.length === 0 ? (
            <CardContainer variant="default" size="default">
              <EmptyState
                icon={Folder}
                title={attachedDriveIds.length === 0 ? "No drives connected" : `No drives match "${search}"`}
                description={attachedDriveIds.length === 0
                  ? "Connect shared drives so this agent can search files in your workspace."
                  : "Try a different keyword or clear the search."}
                ctaLabel={attachedDriveIds.length === 0 ? "Browse drives" : "Clear search"}
                onCta={attachedDriveIds.length === 0 ? () => setDrivesMarketplaceOpen(true) : () => setSearch("")}
              />
            </CardContainer>
          ) : (
            <div className="flex flex-col gap-3">
              {attachedDrives.map(d => (
                <DriveCard
                  key={d.id}
                  drive={d}
                  onDetach={() => detachDrive(d.id)}
                  onBrowse={onOpenGovernance}
                />
              ))}
            </div>
          )
        )}

        {tab === "uploaded" && (
          filteredFiles.length === 0 ? (
            <CardContainer variant="default" size="default">
              <EmptyState
                icon={FileText}
                title={files.length === 0 ? "No files uploaded yet" : `No files match "${search}"`}
                description={files.length === 0
                  ? "Upload files directly to give this agent quick reference material."
                  : "Try a different keyword or clear the search."}
                ctaLabel={files.length === 0 ? "Upload file" : "Clear search"}
                onCta={files.length === 0 ? onUploadFile : () => setSearch("")}
              />
            </CardContainer>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredFiles.map(f => (
                <FileRow
                  key={f.id}
                  file={f}
                  onDownload={() => onDownloadFile(f.id)}
                  onRemove={() => removeFile(f.id)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Right pane: Test your Agent ────────────────────────── */}
      <AgentTestPanel
        description={`Use this simulated chat to see how ${agentName} uses these knowledge sources to answer.`}
        placeholder="Ask the agent something…"
      />

      {/* ── Knowledge Pack Library marketplace ─────────────────── */}
      <KpMarketplaceModal
        open={marketplaceOpen}
        onClose={() => setMarketplaceOpen(false)}
        attachedIds={attachedPackIds}
        onCommit={setAttachedPackIds}
      />

      {/* ── Source Drive Library marketplace ───────────────────── */}
      <SourceDriveMarketplaceModal
        open={drivesMarketplaceOpen}
        onClose={() => setDrivesMarketplaceOpen(false)}
        attachedIds={attachedDriveIds}
        onCommit={setAttachedDriveIds}
      />
    </div>
  )
}

// ─── Pack card ──────────────────────────────────────────────────────

function PackCard({
  pack, state, onToggleExpand, onTogglePlane, onPreview, onEdit, onDetach,
}: {
  pack:           KnowledgePack
  state:          { expanded: boolean; planes: Set<PackPlaneId> }
  onToggleExpand: () => void
  onTogglePlane:  (plane: PackPlaneId) => void
  onPreview:      () => void
  onEdit:         () => void
  onDetach:       () => void
}) {
  return (
    <CardContainer variant="default" size="default">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleExpand}
          aria-label={state.expanded ? "Collapse pack details" : "Expand pack details"}
          style={{
            width: 24, height: 24, border: "none", background: "transparent",
            color: "var(--color-text-caption)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "var(--radius-sm)",
            transform: state.expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            flexShrink: 0, alignSelf: "center",
          }}
        >
          <ChevronRight size={13}/>
        </button>

        <HighlightIcon icon={<Package size={16}/>} variant="purple" size="md" iconColor="dark"/>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
            {pack.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 8, lineHeight: 1.5 }}>
            {pack.desc}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <MetaChip tone="version">{pack.version}</MetaChip>
            <MetaChip>{pack.docs} documents</MetaChip>
            <MetaChip>Updated {pack.updated}</MetaChip>
            <MetaChip tone="blast">Used by {pack.agents} agents · {pack.networks} networks</MetaChip>
          </div>
        </div>

        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <IconButton onClick={onPreview} aria-label="Preview pack content" title="Preview content">
            <Eye size={14}/>
          </IconButton>
          <Button variant="secondary" size="sm" onClick={onEdit}>Edit content</Button>
          <IconButton onClick={onDetach} aria-label="Detach pack" title="Detach pack">
            <X size={13}/>
          </IconButton>
        </div>
      </div>

      {state.expanded && (
        <div
          style={{
            marginTop: 12, paddingTop: 12, paddingLeft: 48,
            borderTop: "1px solid var(--color-border-neutral-default)",
          }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: "var(--color-text-caption)",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              Active planes
            </span>
            {PACK_PLANES.map(pl => {
              const on = state.planes.has(pl.id)
              return (
                <button
                  key={pl.id}
                  onClick={() => onTogglePlane(pl.id)}
                  aria-pressed={on}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 10px",
                    fontSize: 12, fontWeight: 500,
                    color:      on ? "var(--color-icon-primary-default)" : "var(--color-text-caption)",
                    background: on ? "var(--color-surface-primary-more-subtle)" : "transparent",
                    border: `1px solid ${on ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                    borderRadius: "999px",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: pl.color,
                      opacity: on ? 1 : 0.55,
                    }}
                  />
                  {pl.short}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </CardContainer>
  )
}

// ─── Drive card ─────────────────────────────────────────────────────

function DriveCard({
  drive, onDetach, onBrowse,
}: { drive: SharedDrive; onDetach: () => void; onBrowse: () => void }) {
  return (
    <CardContainer variant="default" size="default">
      <div className="flex items-start gap-3">
        <HighlightIcon icon={<Folder size={16}/>} variant="informative" size="md" iconColor="dark"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
            {drive.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 8, lineHeight: 1.5 }}>
            {drive.desc}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <MetaChip tone="version">{drive.cat}</MetaChip>
            <MetaChip>{drive.docs.toLocaleString()} documents</MetaChip>
            <MetaChip>Updated {drive.updated}</MetaChip>
            <MetaChip tone="blast">Used by {drive.agents} agents · {drive.networks} networks</MetaChip>
          </div>
        </div>
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <Button variant="secondary" size="sm" onClick={onBrowse}>Browse</Button>
          <IconButton onClick={onDetach} aria-label="Disconnect drive" title="Disconnect drive">
            <X size={13}/>
          </IconButton>
        </div>
      </div>
    </CardContainer>
  )
}

// ─── Uploaded file row ──────────────────────────────────────────────

function FileRow({
  file, onDownload, onRemove,
}: { file: UploadedFile; onDownload: () => void; onRemove: () => void }) {
  return (
    <CardContainer variant="default" size="sm">
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 28, height: 28, borderRadius: "var(--radius-md)",
            background: "var(--color-surface-neutral-default)",
            color: "var(--color-text-caption)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FileText size={14}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            {file.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 2 }}>
            {file.type} · {file.size} · Uploaded {file.uploaded}
          </div>
        </div>
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <IconButton onClick={onDownload} aria-label={`Download ${file.name}`} title="Download">
            <Download size={13}/>
          </IconButton>
          <IconButton onClick={onRemove} aria-label="Remove file" title="Remove file">
            <X size={13}/>
          </IconButton>
        </div>
      </div>
    </CardContainer>
  )
}

// ─── Small helpers ──────────────────────────────────────────────────

function MetaChip({
  children, tone = "default",
}: { children: React.ReactNode; tone?: "default" | "version" | "blast" }) {
  const base: React.CSSProperties = {
    fontSize: 10, fontWeight: 500,
    padding: "2px 8px",
    borderRadius: "999px",
    background: "var(--color-surface-neutral-default)",
    border: "1px solid var(--color-border-neutral-default)",
    color: "var(--color-text-caption)",
    display: "inline-flex",
    alignItems: "center",
  }
  const themed = tone === "version"
    ? { background: "var(--color-surface-primary-more-subtle)", borderColor: "var(--primary)", color: "var(--color-icon-primary-default)" }
    : tone === "blast"
      ? { background: "var(--color-surface-purple-subtle)", color: "var(--color-icon-purple-default, var(--color-text-title))" }
      : {}
  return <span style={{ ...base, ...themed }}>{children}</span>
}

function IconButton({
  onClick, children, ...rest
}: { onClick: () => void; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...rest}
      style={{
        width: 28, height: 28,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "transparent",
        border: "1px solid var(--color-border-neutral-default)",
        borderRadius: "var(--radius-sm)",
        color: "var(--color-text-caption)",
        cursor: "pointer",
        padding: 0,
        transition: "all 120ms ease",
      }}
    >
      {children}
    </button>
  )
}

