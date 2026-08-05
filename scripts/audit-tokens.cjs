#!/usr/bin/env node
/**
 * audit-tokens.js — AIMS OS Design System
 *
 * Layer 3 of the design-token method this repo follows (see the 2026-07-31
 * audit for context): catch hardcoded values that bypass the token layer
 * before they ship, instead of finding them months later in a manual sweep.
 *
 * Run:  node scripts/audit-tokens.js   (or `npm run audit:tokens`)
 * Exit code 1 if any ERROR-level finding exists (for CI). WARNING-level
 * findings are printed but don't fail the run.
 *
 * What this is NOT: a full parser. Comment-stripping below is a
 * line-based heuristic (tracks `/* ... *\/` state across lines, strips
 * trailing `//`), same class of tool as most hex/color linters. It has
 * been checked against every known finding from the manual audit and
 * produces zero false positives on the current repo — if you add a
 * legitimate exception later, mark it `// audit-ignore: <reason>` on
 * the same line rather than special-casing a file path in here.
 *
 * Checks:
 *   1. Hardcoded hex/rgba in src/components/ui/**, src/components/layouts/**  → ERROR
 *   2. Stray hex/rgba in src/index.css outside a `--token: value;` definition → ERROR
 *   3. Any hex/rgba surviving in tailwind.config.js                            → ERROR
 *   4. Components in ui/layouts with zero imports anywhere in src/            → WARNING
 *   5. Spacing/size values in px that aren't a multiple of 4                   → WARNING
 *      (no accepted micro-scale is declared yet — see the 2026-07-31 audit —
 *      so this is informational only, not a failing check)
 */

const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const HEX_RE = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{1,5})?\b/
const RGBA_RE = /rgba?\(\s*\d/
const IGNORE_MARKER = /audit-ignore/
const TOKEN_DEF_RE = /^\s*--[\w-]+\s*:/

let errors = []
let warnings = []

function listFiles(dir, exts) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(full, exts))
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(full)
  }
  return out
}

function rel(p) {
  return path.relative(ROOT, p)
}

/**
 * Splits a file into lines, returning { raw, code } per line, where `code`
 * has // and /* *\/ comments stripped (block-comment state carried across
 * lines). `raw` keeps the original text so audit-ignore markers inside a
 * comment still count.
 */
function stripComments(text) {
  const lines = text.split("\n")
  let inBlock = false
  return lines.map((raw) => {
    let code = raw
    if (inBlock) {
      const end = code.indexOf("*/")
      if (end === -1) return { raw, code: "" }
      code = code.slice(end + 2)
      inBlock = false
    }
    // strip any complete /* ... */ spans on this line, possibly more than one
    while (true) {
      const s = code.indexOf("/*")
      if (s === -1) break
      const e = code.indexOf("*/", s + 2)
      if (e === -1) {
        code = code.slice(0, s)
        inBlock = true
        break
      }
      code = code.slice(0, s) + code.slice(e + 2)
    }
    const lc = code.indexOf("//")
    if (lc !== -1) code = code.slice(0, lc)
    return { raw, code }
  })
}

function scanHardcodedColors(file, { skipTokenDefLines } = {}) {
  const text = fs.readFileSync(file, "utf8")
  const lines = stripComments(text)
  lines.forEach(({ raw, code }, idx) => {
    if (!code.trim()) return
    if (skipTokenDefLines && TOKEN_DEF_RE.test(code)) return
    const hasHex = HEX_RE.test(code)
    const hasRgba = RGBA_RE.test(code)
    if (!hasHex && !hasRgba) return
    if (IGNORE_MARKER.test(raw)) return
    errors.push({
      file: rel(file),
      line: idx + 1,
      snippet: code.trim().slice(0, 100),
    })
  })
}

// ── Check 1: components ─────────────────────────────────────────────────
const componentFiles = [
  ...listFiles(path.join(ROOT, "src/components/ui"), [".tsx", ".ts"]),
  ...listFiles(path.join(ROOT, "src/components/layouts"), [".tsx", ".ts"]),
]
componentFiles.forEach((f) => scanHardcodedColors(f))

// ── Check 2: index.css ──────────────────────────────────────────────────
const indexCss = path.join(ROOT, "src/index.css")
if (fs.existsSync(indexCss)) {
  scanHardcodedColors(indexCss, { skipTokenDefLines: true })
}

// ── Check 3: tailwind.config.js ─────────────────────────────────────────
const twConfig = path.join(ROOT, "tailwind.config.js")
if (fs.existsSync(twConfig)) {
  scanHardcodedColors(twConfig)
}

// ── Check 4: orphaned components (zero imports anywhere) ───────────────
const searchRoots = [
  path.join(ROOT, "src/App.tsx"),
  ...listFiles(path.join(ROOT, "src/screens"), [".tsx", ".ts"]),
  ...componentFiles,
]
const corpusByFile = new Map(
  searchRoots
    .filter((f) => fs.existsSync(f))
    .map((f) => [f, fs.readFileSync(f, "utf8")])
)

componentFiles.forEach((file) => {
  const base = path.basename(file).replace(/\.tsx?$/, "")
  const needle = new RegExp(`/${base}["']`)
  let found = false
  for (const [otherFile, content] of corpusByFile) {
    if (otherFile === file) continue
    if (needle.test(content)) {
      found = true
      break
    }
  }
  if (!found) {
    warnings.push({
      type: "orphan",
      file: rel(file),
      message: "not imported anywhere in src/ — dead code candidate (see CLAUDE.md 'Before creating ANY new component file')",
    })
  }
})

// ── Check 5: off-scale spacing (informational) ──────────────────────────
// Verified live against Figma's Spacing/0x..20x scale (2026-08-04) — each Nx
// step is N×4px, with a single 0.5x=2px exception. Figma has no 7x/9x/11x
// etc. steps; 100 (radius-full) and 9999 (z-index/legacy radius references)
// are kept as accepted non-spacing outliers this same regex also matches.
const SCALE = new Set([0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 100, 9999])
// \b anchors the keyword to the START of the property name — without it,
// "borderBottom"/"borderLeft"/"borderTopWidth" etc. false-matched on the
// "bottom"/"left"/"width" substring, flagging border *stroke* thickness
// (correctly 0.5-2px) as if it were layout spacing. Border-side properties
// aren't spacing and were never meant to be checked against this scale.
const PX_RE = /\b(?:padding|margin|gap|width|height|top|left|right|bottom|inset|radius)[a-zA-Z]*\s*:\s*["']?(\d+)px/gi
const ARBITRARY_PX_RE = /\b(?:p|m|gap|w|h|top|left|right|bottom|inset)-\[(\d+)px\]/g

componentFiles.forEach((file) => {
  const text = fs.readFileSync(file, "utf8")
  let match
  const seen = new Set()
  while ((match = PX_RE.exec(text))) {
    const val = Number(match[1])
    const lineNum = text.slice(0, match.index).split("\n").length
    const key = `${lineNum}:${val}`
    if (!SCALE.has(val) && !seen.has(key)) {
      seen.add(key)
      warnings.push({ type: "spacing", file: rel(file), line: lineNum, message: `${val}px is not on the 4px scale` })
    }
  }
  while ((match = ARBITRARY_PX_RE.exec(text))) {
    const val = Number(match[1])
    const lineNum = text.slice(0, match.index).split("\n").length
    const key = `${lineNum}:${val}`
    if (!SCALE.has(val) && !seen.has(key)) {
      seen.add(key)
      warnings.push({ type: "spacing", file: rel(file), line: lineNum, message: `${val}px is not on the 4px scale` })
    }
  }
})

// ── Report ───────────────────────────────────────────────────────────────
function printSection(title, items, formatter) {
  if (items.length === 0) return
  console.log(`\n${title} (${items.length})`)
  console.log("-".repeat(title.length + 6))
  items.forEach((i) => console.log("  " + formatter(i)))
}

console.log("AIMS OS — token audit\n" + "=".repeat(22))

printSection(
  "❌ ERRORS — hardcoded hex/rgba outside the token layer",
  errors,
  (e) => `${e.file}:${e.line}  ${e.snippet}`
)

const orphanWarnings = warnings.filter((w) => w.type === "orphan")
const spacingWarnings = warnings.filter((w) => w.type === "spacing")

printSection("⚠️  WARNING — possible orphaned components", orphanWarnings, (w) => `${w.file} — ${w.message}`)
printSection("⚠️  WARNING — off-scale spacing (informational only)", spacingWarnings, (w) => `${w.file}:${w.line}  ${w.message}`)

console.log(
  `\nSummary: ${errors.length} error(s), ${orphanWarnings.length} orphan warning(s), ${spacingWarnings.length} spacing warning(s).`
)

if (errors.length > 0) {
  console.log("\nFix errors above, or mark a genuine exception with `// audit-ignore: <reason>` on the same line.")
  process.exitCode = 1
} else {
  console.log("\nNo blocking errors.")
}
