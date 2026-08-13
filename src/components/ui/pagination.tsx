import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (items: number) => void
  rowsPerPageOptions?: number[]
  className?: string
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  rowsPerPageOptions = [5, 25, 50, 100, 200],
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const [dropOpen, setDropOpen]   = useState(false)
  const [dropPos,  setDropPos]    = useState<{ left: number; bottom: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectorRef  = useRef<HTMLButtonElement>(null)
  const dropdownRef  = useRef<HTMLDivElement>(null)

  // Close on outside click — must also exclude the dropdown's own content (a
  // fixed-position portal-like element outside selectorRef): checking only
  // selectorRef here meant clicking an option fired this handler on mousedown
  // (closing + unmounting the dropdown) before the option's own onClick could
  // fire on the subsequent click event, making every option silently a no-op.
  useEffect(() => {
    if (!dropOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        selectorRef.current && !selectorRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setDropOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [dropOpen])

  // Visibility is driven by total item count against the smallest page-size
  // option, NOT by whether the CURRENT page size happens to fit everything on
  // one page. Hiding whenever totalPages<=1 meant switching "rows per page" to
  // a bigger number made the whole control (including the page-size picker
  // itself) disappear — locking the user out of ever changing it back. As long
  // as there's more content than the smallest page size, pagination access
  // must stay available, consistently, everywhere this component is used.
  const minPageSize = Math.min(...rowsPerPageOptions)
  if (totalItems <= minPageSize) return null

  const start   = (currentPage - 1) * itemsPerPage + 1
  const end     = Math.min(currentPage * itemsPerPage, totalItems)
  const isFirst = currentPage === 1
  const isLast  = currentPage === totalPages

  function openDrop() {
    if (!onItemsPerPageChange) return
    if (dropOpen) { setDropOpen(false); return }
    if (!selectorRef.current || !containerRef.current) return
    const sel  = selectorRef.current.getBoundingClientRect()
    const cont = containerRef.current.getBoundingClientRect()
    setDropPos({
      left:   sel.left,
      bottom: window.innerHeight - cont.top + 4,
    })
    setDropOpen(true)
  }

  function selectOption(val: number) {
    setDropOpen(false)
    onItemsPerPageChange?.(val)
  }

  // Nav buttons — the real Button atom (variant="secondary", icon-alone, size="sm"
  // is exactly 24×24 in Button's own spec). Icon color kept as the pre-existing
  // --color-icon-neutral-dark via explicit style so swapping to the atom doesn't
  // shift it to Button's own --btn-secondary-fg (a different, slightly darker token).
  const navBtn = (disabled: boolean, onClick: () => void, label: string, Icon: React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>) => (
    <Button
      variant="secondary"
      size="sm"
      iconPosition="alone"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      icon={<Icon size={14} strokeWidth={1.75} style={{ color: "var(--color-icon-neutral-dark)" }} />}
      style={{ flexShrink: 0 }}
    />
  )

  return (
    /* Outer wrapper — provides the 8px 12px padding around the floating card */
    <div
      ref={containerRef}
      className={cn("flex items-center w-full", className)}
      style={{ padding: "8px 12px" }}
    >
      {/* Inner floating card — blur lives HERE, on the semi-transparent surface fill */}
      <div
        className="flex items-center justify-between w-full"
        style={{
          padding: "4px 8px",
          gap: 40,
          background: "var(--surface-floating-default)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "0.5px solid var(--color-border-neutral-subtle)",
          borderRadius: 8,
          height: 32,
          boxShadow: "var(--shadow-elevation-5)",
        }}
      >
        {/* Left zone: Rows per page */}
        <div className="flex items-center shrink-0" style={{ gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-subtitle)", whiteSpace: "nowrap" }}>
            Rows per page:
          </span>
          <div className="flex items-center shrink-0" style={{ gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-label)" }}>
              {itemsPerPage}
            </span>
            {/* Rows-per-page selector — 24×24, Secondary DS style */}
            <button
              ref={selectorRef}
              type="button"
              onClick={openDrop}
              disabled={!onItemsPerPageChange}
              aria-haspopup="listbox"
              aria-expanded={dropOpen}
              className="flex items-center justify-center rounded-[8px] transition-colors"
              style={{
                width: 24, height: 24,
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                cursor: onItemsPerPageChange ? "pointer" : "default",
                padding: 0,
                outline: "none",
                color: "var(--color-icon-neutral-dark)",
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (onItemsPerPageChange) (e.currentTarget as HTMLElement).style.background = "var(--btn-secondary-hover-bg)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--btn-secondary-bg)" }}
            >
              <ChevronDown
                size={14}
                strokeWidth={1.75}
                style={{
                  transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms",
                }}
              />
            </button>
          </div>
        </div>

        {/* Right zone: range text + nav */}
        <div className="flex items-center shrink-0" style={{ gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-label)", whiteSpace: "nowrap" }}>
            {start}–{end} of {totalItems} items
          </span>
          <div className="flex items-center" style={{ gap: 12 }}>
            {navBtn(isFirst, () => onPageChange(currentPage - 1), "Previous page", ChevronLeft)}
            {navBtn(isLast,  () => onPageChange(currentPage + 1), "Next page",     ChevronRight)}
          </div>
        </div>
      </div>

      {/* Dropdown — fixed, above component, left-aligned to selector button */}
      {dropOpen && dropPos && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Rows per page"
          style={{
            position: "fixed",
            left: dropPos.left,
            bottom: dropPos.bottom,
            zIndex: 10002,
            background: "var(--surface-floating-default)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "0.5px solid var(--color-border-neutral-subtle)",
            borderRadius: 8,
            overflow: "hidden",
            minWidth: 64,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)", // audit-ignore: Rows-per-page dropdown shadow, pending Figma effect-name mapping (2026-08 audit)
          }}
        >
          {rowsPerPageOptions.map(opt => (
            <button
              key={opt}
              role="option"
              aria-selected={opt === itemsPerPage}
              type="button"
              onClick={() => selectOption(opt)}
              className="w-full flex items-center px-[12px] transition-colors"
              style={{
                height: 32,
                fontSize: 12,
                fontWeight: opt === itemsPerPage ? 600 : 400,
                color: opt === itemsPerPage ? "var(--primary)" : "var(--color-text-label)",
                background: opt === itemsPerPage ? "var(--color-surface-neutral-default)" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (opt !== itemsPerPage) (e.currentTarget as HTMLElement).style.background = "var(--color-surface-neutral-default)" }}
              onMouseLeave={e => { if (opt !== itemsPerPage) (e.currentTarget as HTMLElement).style.background = "none" }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
