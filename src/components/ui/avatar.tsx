/**
 * Avatar — AIMS OS Design System
 *
 * Circular identity marker: initials, an "empty" placeholder glyph, or a
 * photo. Colors reference CSS custom properties (index.css) — no hardcoded
 * hex, no dark: prefix.
 *
 * Sizes: xs=8 · sm=16 · md=24 · lg=32 · xxl=60 (see AVATAR_SIZE_SPECS for
 * font size, initials length, and intended use per size).
 *
 * Color: pass `colorKey` to pin a specific color, or omit it and the same
 * name always resolves to the same color (nameToAvatarColor hashes the
 * name so a given person's avatar color stays stable across the app).
 */

const AVATAR_COLOR_KEYS = ["blue", "green", "red", "orange", "purple", "limegreen", "lightblue", "pink", "teal", "amber"] as const
type AvatarColorKey = typeof AVATAR_COLOR_KEYS[number]

function nameToAvatarColor(name: string): AvatarColorKey {
  const h = name.split("").reduce((a, c) => ((a * 31) + c.charCodeAt(0)) >>> 0, 0)
  return AVATAR_COLOR_KEYS[h % AVATAR_COLOR_KEYS.length]
}

const AVATAR_SIZE_SPECS = [
  { key: "xs",  label: "XS",  px: 8,  fs: 4,  chars: 1, desc: "Inline badges, compact indicators" },
  { key: "sm",  label: "S",   px: 16, fs: 8,  chars: 1, desc: "Table cells, tight lists"           },
  { key: "md",  label: "M",   px: 24, fs: 10, chars: 2, desc: "Default UI, nav, dropdowns"         },
  { key: "lg",  label: "L",   px: 32, fs: 12, chars: 2, desc: "Entity headers, cards"              },
  { key: "xxl", label: "XXL", px: 60, fs: 20, chars: 2, desc: "Profile views, hero sections"       },
] as const

type AvatarSizeKey = typeof AVATAR_SIZE_SPECS[number]["key"]

function AvatarCircle({
  name,
  sizeKey,
  avatarStyle = "text",
  colorKey,
  src,
  selected,
  initials: initialsOverride,
}: {
  name: string
  sizeKey?: AvatarSizeKey
  avatarStyle?: "text" | "empty" | "photo"
  colorKey?: AvatarColorKey
  src?: string
  selected?: boolean
  /** Skip name-splitting and show this exact string (e.g. a pre-computed 2-letter code). `name` is still used for color hashing when colorKey is omitted. */
  initials?: string
}) {
  const sizeSpec = AVATAR_SIZE_SPECS.find(s => s.key === sizeKey) ?? AVATAR_SIZE_SPECS[2]
  const initials = initialsOverride ?? name.split(" ").map(w => w[0]).slice(0, sizeSpec.chars).join("").toUpperCase()
  const resolvedColor = colorKey ?? nameToAvatarColor(name)

  const bg = avatarStyle === "photo" ? undefined
           : avatarStyle === "empty" ? "var(--tag-neutral-bg)"
           : `var(--av-col-${resolvedColor}-bg)`

  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full overflow-hidden"
      style={{
        width: sizeSpec.px, height: sizeSpec.px,
        background: bg,
        color: "var(--color-text-negative)",
        fontSize: sizeSpec.fs, fontWeight: 600, lineHeight: 1,
        border: selected ? "1.5px solid var(--color-text-negative)" : "1px solid var(--topbar-avatar-ring)",
        boxShadow: selected ? "0 0 10px rgba(33,115,255,0.5)" : "none", // audit-ignore: Avatar selected-state glow, pending Figma effect-name mapping (2026-08 audit)
      }}
    >
      {avatarStyle === "photo" && src
        ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : avatarStyle === "empty"
        ? <svg width={Math.max(8, Math.round(sizeSpec.px * 0.48))} height={Math.max(8, Math.round(sizeSpec.px * 0.48))} viewBox="0 0 16 16" fill="none" opacity={0.45}>
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M1 11l4-4 3 3 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="11" cy="5.5" r="1.5" fill="currentColor"/>
          </svg>
        : initials
      }
    </div>
  )
}

export { AvatarCircle, AVATAR_SIZE_SPECS, AVATAR_COLOR_KEYS, nameToAvatarColor }
export type { AvatarSizeKey, AvatarColorKey }
