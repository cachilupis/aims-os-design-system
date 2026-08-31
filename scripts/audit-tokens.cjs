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
 *   1. Hardcoded hex/rgba in src/components/ui/**, src/components/layouts/**,
 *      src/screens/**, and App.tsx's widget content functions               → ERROR
 *   2. Stray hex/rgba in src/index.css outside a `--token: value;` definition → ERROR
 *   3. Any hex/rgba surviving in tailwind.config.js                            → ERROR
 *   4. Components in ui/layouts with zero imports anywhere in src/            → WARNING
 *   5. Spacing/size values in px that aren't a multiple of 4                   → WARNING
 *      (see SCALE below for the accepted non-grid exceptions — this is
 *      informational, not a failing check)
 *   6. Screen files that locally define a function/const with the same name
 *      as a real exported DS component (e.g. a hand-rolled `function Toggle`
 *      shadowing `src/components/ui/toggle.tsx`'s `Toggle`)                  → WARNING
 *      (2026-08-27: found 3 separate hand-rolled `Toggle` reimplementations
 *      across Admin* screens, each with a slightly different prop shape,
 *      shipped clean because this check didn't exist yet — hardcoded-color
 *      and build checks have no way to catch "looks like the DS component
 *      but isn't")
 *   7. More than one `variant="main"` in a single screen file               → WARNING
 *      (CLAUDE.md: max 1 per screen, header CTA only — RecordHeader's one
 *      named exception lives inside record-header.tsx itself, so a screen
 *      that only ever renders `<RecordHeader .../>` never trips this)
 *
 * Checks 6 and 7 are WARNING, not ERROR, on purpose for now: the first run
 * against the existing repo found 9 pre-existing hits, 2 of them already on
 * main (pm-michael-test-v1.tsx, pm-thomas-universal-profile.tsx) — making
 * these blocking immediately would fail CI on any unrelated PR until all 9
 * are cleaned up. Promote both (swap their `warnings.push` for `errors.push`,
 * same shape as Check 1) once that cleanup pass lands, so this stops being
 * optional.
 *
 * App.tsx coverage (2026-08 audit): only the widget content functions are
 * scanned, sliced out by marker rather than the whole 30K-line file. The
 * rest of App.tsx is documentation (Colors/Typography/Spacing spec tables,
 * the DS Strategy page) that legitimately displays hex codes as reference
 * text — scanning it produced ~875 hits, ~99% of them exactly that. The
 * widgets are real, reusable UI PM screens are built from; that's where 5
 * real hardcoded-color/composition bugs shipped undetected before this
 * check existed. See scanHardcodedColors' lineRange option below.
 */

const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
// Exact CSS hex-color lengths only (#RGB #RGBA #RRGGBB #RRGGBBAA = 3/4/6/8
// digits) — an earlier, looser version (`{3}(?:...{1,5})?`) matched any
// "#" followed by 3-8 hex-valid characters, which false-matched things
// like a ticket reference "#12045" (5 digits, not a valid color length,
// but every digit happens to be hex-valid 0-9). \b after each alternative
// still correctly rejects it as a substring of a longer digit run.
const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/
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

/**
 * `lineRange: [startLine, endLine]` (1-indexed, inclusive) restricts the
 * scan to a slice of the file — used for App.tsx, where the widget content
 * functions are real, reusable UI (should be checked) surrounded by
 * thousands of lines of documentation/spec-table content that legitimately
 * displays hex codes as reference text (should not be).
 */
function scanHardcodedColors(file, { skipTokenDefLines, lineRange } = {}) {
  const text = fs.readFileSync(file, "utf8")
  const lines = stripComments(text)
  lines.forEach(({ raw, code }, idx) => {
    const lineNum = idx + 1
    if (lineRange && (lineNum < lineRange[0] || lineNum > lineRange[1])) return
    if (!code.trim()) return
    if (skipTokenDefLines && TOKEN_DEF_RE.test(code)) return
    const hasHex = HEX_RE.test(code)
    const hasRgba = RGBA_RE.test(code)
    if (!hasHex && !hasRgba) return
    if (IGNORE_MARKER.test(raw)) return
    errors.push({
      file: rel(file),
      line: lineNum,
      snippet: code.trim().slice(0, 100),
    })
  })
}

/** 1-indexed line number of the first line containing `marker`, or null. */
function findMarkerLine(text, marker) {
  const idx = text.indexOf(marker)
  if (idx === -1) return null
  return text.slice(0, idx).split("\n").length
}

// ── Check 1: components ─────────────────────────────────────────────────
const componentFiles = [
  ...listFiles(path.join(ROOT, "src/components/ui"), [".tsx", ".ts"]),
  ...listFiles(path.join(ROOT, "src/components/layouts"), [".tsx", ".ts"]),
]
componentFiles.forEach((f) => scanHardcodedColors(f))

// src/screens/** are real, shipped PM screens — exactly the artifacts this
// whole token method exists to keep consistent. Unlike App.tsx (below),
// they're small and don't mix in a design-token reference library, so the
// full file is scanned (2026-08 audit: found and fixed a false positive
// here too — the same over-loose HEX_RE matched a ticket number "#12045").
const screenFiles = listFiles(path.join(ROOT, "src/screens"), [".tsx", ".ts"])
screenFiles.forEach((f) => scanHardcodedColors(f))

// App.tsx mixes two very different things: (1) the 13 widget content
// functions — real, reusable UI that PM screens are built from, and (2)
// thousands of lines of documentation (Colors/Typography/Spacing spec
// tables, the DS Strategy pitch page) that legitimately display hex codes
// as reference text, e.g. `{ role: "...", light: "#2173ff", dark: "..." }`.
// Scanning all of App.tsx produced ~875 hits, ~99% of them exactly that —
// real signal would drown in that noise. Widget content is scanned by
// slicing between two stable markers rather than hardcoded line numbers,
// so it keeps working as the file grows. This is the same gap that let 5
// real hardcoded-color/composition bugs ship undetected in the widgets
// during the 2026-08 audit — everything else in App.tsx is a known,
// deliberate exclusion, not an oversight (see the audit's follow-up note:
// moving widget content out of App.tsx into its own directory would let
// this scan the normal way instead of by marker-slice).
const appTsxPath = path.join(ROOT, "src/App.tsx")
if (fs.existsSync(appTsxPath)) {
  const appText = fs.readFileSync(appTsxPath, "utf8")
  const widgetStart = findMarkerLine(appText, "function KpiWidgetContent(")
  const widgetEnd = findMarkerLine(appText, "// ── Widget definitions")
  if (widgetStart && widgetEnd) {
    scanHardcodedColors(appTsxPath, { lineRange: [widgetStart, widgetEnd - 1] })
  } else {
    // Markers moved or got renamed — fail loudly rather than silently
    // scanning 0 lines and looking clean by accident.
    errors.push({
      file: rel(appTsxPath),
      line: 1,
      snippet: "audit-tokens.cjs: widget content markers not found in App.tsx — update findMarkerLine() calls, this check is currently scanning nothing",
    })
  }
}

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
// 3/5/6/10/15 are also accepted, each a deliberate micro-value confirmed
// used consistently for one specific purpose rather than drifting randomly
// (2026-08 audit, after the width/height exclusion below left only true
// gap/padding/positioning warnings to triage):
//   6  — icon-to-label gap, ~20 components (chips, tabs, filters, topbar);
//        confirmed against Figma's Space and Radios Tokens collection to
//        have no corresponding variable, i.e. it's hand-set in Figma too
//   3  — tooltip padding ("3px 8px", topbar) and tight grip-dot/label-stack
//        gaps (entity-list, side-panel, slide-out)
//   5  — same class of micro-gap (topbar) and grip-dot offset (slide-out)
//   10 — label-row gaps (filters-slideout) and modal-dialog's section gap
//   15 — exact icon position from a specific Figma node (textarea.tsx,
//        node 6326:21225), not a spacing value at all
// 1/7/14/19 accepted for the same reason, found once App.tsx/screens
// coverage was added (2026-08 audit part 2):
//   7  — "7px 8px" compact table/list-row padding, identical across 4
//        independent files (pm-home-canvas, pm-lex-htl-work-queue,
//        TableWidgetContent) — an asymmetric typo wouldn't repeat exactly
//   14 — card/panel body padding, identical across 3 independent files
//        (pm-lex-htl-work-queue, slideout-detail-example, NotesWidgetContent)
//   19 — "gap-[19px] py-[8px] px-[12px]" detail-row layout, byte-identical
//        in slideout-detail-example.tsx and PendingOutputsWidgetContent
//   1  — "padding: 1px 4px" tight monospace ID-badge, identical in both
//        places it appears (Activity/NotesWidgetContent)
const SCALE = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 16, 19, 20, 24, 32, 40, 48, 64, 80, 100, 9999])
// \b anchors the keyword to the START of the property name — without it,
// "borderBottom"/"borderLeft"/"borderTopWidth" etc. false-matched on the
// "bottom"/"left"/"width" substring, flagging border *stroke* thickness
// (correctly 0.5-2px) as if it were layout spacing. Border-side properties
// aren't spacing and were never meant to be checked against this scale.
//
// Deliberately excludes width/height/radius: a 2026-08 audit of every
// warning they produced found real Figma-exact component/icon dimensions
// (Button's 27/40/52/56px heights, Toggle's 26/39/52px track widths, Chip's
// 28px height, icon sizes like 9/13/14/18px, modal/panel/tooltip/menu
// max-widths) — none of which were ever meant to sit on a 4px spacing
// grid. Corner radius has its own separately-audited scale. gap/padding/
// margin/top/left/right/bottom/inset are real layout spacing and stay
// checked against SCALE.
const PX_RE = /\b(?:padding|margin|gap|top|left|right|bottom|inset)[a-zA-Z]*\s*:\s*["']?(\d+)px/gi
const ARBITRARY_PX_RE = /\b(?:p|m|gap|top|left|right|bottom|inset)-\[(\d+)px\]/g

/**
 * `lineRange: [startLine, endLine]` (1-indexed, inclusive), same purpose
 * and reasoning as scanHardcodedColors' — restricts the scan to a slice of
 * a mixed file like App.tsx.
 */
function scanSpacing(file, { lineRange } = {}) {
  const raw = fs.readFileSync(file, "utf8")
  // Comment-stripped, same as Check 1 — a JSDoc measurement note like
  // "Height: 72px (fixed)" isn't code and shouldn't be flagged as a
  // spacing violation just because the number happens to appear there.
  const strippedLines = stripComments(raw)
  const text = strippedLines.map((l) => l.code).join("\n")
  let match
  const seen = new Set()
  function record(val, lineNum) {
    if (lineRange && (lineNum < lineRange[0] || lineNum > lineRange[1])) return
    const key = `${lineNum}:${val}`
    if (!SCALE.has(val) && !seen.has(key)) {
      seen.add(key)
      warnings.push({ type: "spacing", file: rel(file), line: lineNum, message: `${val}px is not on the 4px scale` })
    }
  }
  while ((match = PX_RE.exec(text))) {
    record(Number(match[1]), text.slice(0, match.index).split("\n").length)
  }
  while ((match = ARBITRARY_PX_RE.exec(text))) {
    record(Number(match[1]), text.slice(0, match.index).split("\n").length)
  }
}

componentFiles.forEach((file) => scanSpacing(file))
// Same rationale as Check 1 above: real spacing in real screens/widgets,
// not the reference tables and pitch content elsewhere in App.tsx.
screenFiles.forEach((file) => scanSpacing(file))
if (fs.existsSync(appTsxPath)) {
  const appText = fs.readFileSync(appTsxPath, "utf8")
  const widgetStart = findMarkerLine(appText, "function KpiWidgetContent(")
  const widgetEnd = findMarkerLine(appText, "// ── Widget definitions")
  if (widgetStart && widgetEnd) {
    scanSpacing(appTsxPath, { lineRange: [widgetStart, widgetEnd - 1] })
  }
  // (Check 1's marker-not-found branch above already surfaces a loud error
  // if these markers ever go missing — no need to duplicate that here.)
}

// ── Check 6: hand-rolled reimplementations of real DS components ───────────
// Builds the set of real exported component names from src/components/ui
// and src/components/layouts (handles both `export function Name(` and
// `export { Name, ... }`), then flags any src/screens/** file that locally
// defines a same-named function or arrow-function component.
//
// This matches NAMES ONLY, never behaviour, so the finding is "the name is
// taken", not "you reimplemented this component". Usually those are the same
// thing; sometimes they are not. Real case (PR #55, 2026-08-31): a screen
// defined a local `Stepper` that was a numeric +/- input, while the DS
// `Stepper` is a wizard step indicator — unrelated components, same word.
// Substituting one for the other would have been wrong; renaming the local
// one was right. That is why the message offers both fixes instead of
// assuming duplication — a collision is always worth removing, but which
// way you remove it depends on what the two components actually do.
function extractExportedNames(file) {
  const text = fs.readFileSync(file, "utf8")
  const names = new Set()
  for (const m of text.matchAll(/export\s+function\s+([A-Z]\w*)\s*\(/g)) names.add(m[1])
  for (const m of text.matchAll(/export\s*\{([^}]+)\}/g)) {
    m[1].split(",").forEach((part) => {
      const name = part.trim().split(/\s+as\s+/)[0].trim()
      if (/^type\s/.test(part.trim())) return // type-only export, not a component
      if (/^[A-Z]\w*$/.test(name)) names.add(name)
    })
  }
  return names
}

const dsComponentNames = new Set()
componentFiles.forEach((f) => extractExportedNames(f).forEach((n) => dsComponentNames.add(n)))

const LOCAL_DEF_RE = /^\s*(?:function\s+([A-Z]\w*)\s*\(|const\s+([A-Z]\w*)\s*(?::[^=]*)?=\s*(?:\(|function\b))/

screenFiles.forEach((file) => {
  const text = fs.readFileSync(file, "utf8")
  const lines = stripComments(text)
  lines.forEach(({ code }, idx) => {
    const m = LOCAL_DEF_RE.exec(code)
    if (!m) return
    const name = m[1] || m[2]
    if (dsComponentNames.has(name)) {
      warnings.push({
        type: "shadow-component",
        file: rel(file),
        line: idx + 1,
        message: `local "${name}" shadows a real src/components/ui or layouts export of the same name. This check matches NAMES, not behaviour — pick the fix that applies: if it does the same job, delete it and import the DS one; if it is a genuinely different component that happens to share the name, rename the local one to something specific to what it does. Either way the collision has to go.`,
      })
    }
  })
})

// ── Check 7: variant="main" used more than once in one screen file ────────
// CLAUDE.md: max 1 per screen, header CTA only. RecordHeader's one named
// exception lives inside record-header.tsx itself, so a screen that renders
// <RecordHeader/> never writes the literal string and never trips this.
const MAIN_VARIANT_RE = /variant=["']main["']/

screenFiles.forEach((file) => {
  const text = fs.readFileSync(file, "utf8")
  const lines = stripComments(text)
  const hits = []
  lines.forEach(({ code }, idx) => {
    if (MAIN_VARIANT_RE.test(code)) hits.push(idx + 1)
  })
  if (hits.length > 1) {
    warnings.push({
      type: "main-overuse",
      file: rel(file),
      line: hits[hits.length - 1],
      message: `variant="main" used ${hits.length} times in this file (lines ${hits.join(", ")}) — max 1 per screen, header CTA only`,
    })
  }
})

// ── Check 8: possible hand-rolled card component (heuristic, WARNING) ─────
// Check 6 only catches a local def whose NAME collides with a real DS
// export (e.g. `function Toggle`). It can't catch a local component that
// does the same JOB under a different name — e.g. AdminSecurity.tsx defines
// `function SectionCard({ children })` that renders a div styled with
// border + background using the exact tokens CardContainer itself uses,
// instead of importing CardContainer. Different name, same reimplementation
// problem — undetectable by name-matching, so this check looks at what the
// component actually renders instead: does it accept `children`, and does
// its body contain a card-shaped div (border + background using DS
// surface/border tokens)? WARNING only — this is a semantic guess, not a
// certainty. Composing a bespoke wrapper is sometimes legitimate; a human
// (or a DS-GAP comment) makes that call, not this script.
const CARD_LIKE_BORDER_RE = /\bborder\s*:\s*["'][^"']*var\(--(?:border|field-border)/
const CARD_LIKE_BG_RE = /\bbackground\s*:\s*["']?var\(--(?:surface|surface-raised)\b/
const TOP_LEVEL_DEF_RE = /^(?:function\s+([A-Z]\w*)\s*\(|const\s+([A-Z]\w*)\s*(?::[^=]*)?=\s*\()/

screenFiles.forEach((file) => {
  const text = fs.readFileSync(file, "utf8")
  const lines = stripComments(text)

  const defs = []
  lines.forEach(({ code }, idx) => {
    const m = TOP_LEVEL_DEF_RE.exec(code)
    if (m) defs.push({ name: m[1] || m[2], line: idx })
  })

  defs.forEach((def, i) => {
    const end = i + 1 < defs.length ? defs[i + 1].line : lines.length
    const bodyLines = lines.slice(def.line, end)
    const acceptsChildren = bodyLines.slice(0, 5).some((l) => /\bchildren\b/.test(l.code))
    if (!acceptsChildren) return
    const bodyText = bodyLines.map((l) => l.code).join("\n")
    if (CARD_LIKE_BORDER_RE.test(bodyText) && CARD_LIKE_BG_RE.test(bodyText)) {
      warnings.push({
        type: "possible-card-reimpl",
        file: rel(file),
        line: def.line + 1,
        message: `local "${def.name}" takes children and renders a bordered/background div with card-like tokens — check whether this should be CardContainer instead`,
      })
    }
  })
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
const shadowWarnings = warnings.filter((w) => w.type === "shadow-component")
const mainOveruseWarnings = warnings.filter((w) => w.type === "main-overuse")
const cardReimplWarnings = warnings.filter((w) => w.type === "possible-card-reimpl")

printSection("⚠️  WARNING — possible orphaned components", orphanWarnings, (w) => `${w.file} — ${w.message}`)
printSection("⚠️  WARNING — off-scale spacing (informational only)", spacingWarnings, (w) => `${w.file}:${w.line}  ${w.message}`)
printSection("⚠️  WARNING — hand-rolled component shadows a real DS export", shadowWarnings, (w) => `${w.file}:${w.line}  ${w.message}`)
printSection("⚠️  WARNING — variant=\"main\" overused (CLAUDE.md: max 1/screen)", mainOveruseWarnings, (w) => `${w.file}:${w.line}  ${w.message}`)
printSection("⚠️  WARNING — possible hand-rolled CardContainer reimplementation", cardReimplWarnings, (w) => `${w.file}:${w.line}  ${w.message}`)

// `--counts` prints one machine-readable line so CI can ratchet: run the audit
// on main, run it on the PR, and fail if any category went UP. Warnings stay
// non-blocking on their own (main is not at zero on several of them), but a PR
// is never allowed to add more. Without this, checks 6-8 print their findings
// into the CI log and the job still goes green — which is what let PR #55's
// 4 shadow + 6 main-overuse warnings sit unnoticed for three days.
if (process.argv.includes("--counts")) {
  console.log(
    `AUDIT_COUNTS errors=${errors.length} orphan=${orphanWarnings.length} shadow=${shadowWarnings.length} main_overuse=${mainOveruseWarnings.length} card_reimpl=${cardReimplWarnings.length}`
  )
}

console.log(
  `\nSummary: ${errors.length} error(s), ${orphanWarnings.length} orphan warning(s), ${spacingWarnings.length} spacing warning(s), ${shadowWarnings.length} shadow-component warning(s), ${mainOveruseWarnings.length} main-overuse warning(s), ${cardReimplWarnings.length} possible-card-reimpl warning(s).`
)

if (errors.length > 0) {
  console.log("\nFix errors above, or mark a genuine exception with `// audit-ignore: <reason>` on the same line.")
  process.exitCode = 1
} else {
  console.log("\nNo blocking errors.")
}
