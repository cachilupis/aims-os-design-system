#!/usr/bin/env node
/**
 * generate-specs.cjs — AIMS OS Design System
 *
 * Layer 1 of the design-token method this repo follows: a standalone spec
 * file per component. The data already exists as *_SPEC objects in
 * src/App.tsx (used to render the in-app SpecModal) — this script extracts
 * each one and writes it out as specs/<kebab-name>.md, so the same source
 * of truth is readable outside the running app (grep-able, diffable, linkable).
 *
 * Run: node scripts/generate-specs.cjs
 *
 * Not a general-purpose JS-object parser: it locates `const X_SPEC = { ... }`
 * by brace-matching, then evaluates that slice as a JS expression (safe here
 * — it's our own source file, not external input). Array-shaped specs
 * (e.g. AVATAR_SIZE_SPECS) are skipped; they document per-instance sizing,
 * not a component on their own.
 */

const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const APP_TSX = path.join(ROOT, "src/App.tsx")
const OUT_DIR = path.join(ROOT, "specs")

const text = fs.readFileSync(APP_TSX, "utf8")

function findSpecs(src) {
  const re = /const ([A-Z_]+_SPEC) = /g
  const specs = []
  let m
  while ((m = re.exec(src))) {
    const start = src.indexOf("{", m.index)
    if (start === -1) continue
    let depth = 0
    let end = -1
    for (let i = start; i < src.length; i++) {
      if (src[i] === "{") depth++
      else if (src[i] === "}") {
        depth--
        if (depth === 0) { end = i; break }
      }
    }
    if (end === -1) continue
    specs.push({ name: m[1], source: src.slice(start, end + 1) })
  }
  return specs
}

function toKebab(specName) {
  return specName.replace(/_SPEC$/, "").toLowerCase().replace(/_/g, "-")
}

function table(rows, columns) {
  if (!rows || rows.length === 0) return ""
  const header = `| ${columns.map((c) => c.label).join(" | ")} |`
  const divider = `| ${columns.map(() => "---").join(" | ")} |`
  const body = rows
    .map((row) => `| ${columns.map((c) => String(row[c.key] ?? "—")).join(" | ")} |`)
    .join("\n")
  return [header, divider, body].join("\n")
}

function renderTokenGroup(group) {
  const parts = [`### ${group.name}`]
  if (group.description) parts.push(group.description)
  if (group.cssPrefix) parts.push(`CSS prefix: \`${group.cssPrefix}\``)
  if (group.borderWidth && group.borderWidth !== "—") parts.push(`Border width: \`${group.borderWidth}\``)
  if (group.tokens?.length) {
    parts.push(
      table(group.tokens, [
        { key: "role", label: "Role" },
        { key: "variable", label: "Token / Variable" },
        { key: "varId", label: "Figma variable" },
        { key: "light", label: "Light" },
        { key: "dark", label: "Dark" },
      ])
    )
  }
  return parts.join("\n\n")
}

function renderSpec(spec) {
  const lines = [`# ${spec.name ?? "Untitled"}`, ""]

  if (spec.figmaNodeId && spec.figmaNodeId !== "—") {
    lines.push(`**Figma node:** [\`${spec.figmaNodeId}\`](${spec.figmaUrl})`)
  } else if (spec.figmaUrl) {
    lines.push(`**Figma:** [Design System file](${spec.figmaUrl})`)
  }
  lines.push("")

  if (spec.description) {
    lines.push(spec.description, "")
  }

  if (spec.properties?.length) {
    lines.push(
      "## Properties",
      "",
      table(spec.properties, [
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
        { key: "values", label: "Values" },
        { key: "default", label: "Default" },
        { key: "note", label: "Note" },
      ]),
      ""
    )
  }

  if (spec.sizes?.length) {
    const keys = Object.keys(spec.sizes[0])
    lines.push(
      "## Sizes / scale",
      "",
      table(
        spec.sizes,
        keys.map((k) => ({ key: k, label: k.charAt(0).toUpperCase() + k.slice(1) }))
      ),
      ""
    )
  }

  if (spec.typography?.length) {
    lines.push(
      "## Typography",
      "",
      table(spec.typography, [
        { key: "element", label: "Element" },
        { key: "family", label: "Family" },
        { key: "size", label: "Size" },
        { key: "weight", label: "Weight" },
        { key: "lineHeight", label: "Line height" },
      ]),
      ""
    )
  }

  if (spec.variants?.length) {
    lines.push("## Variants / token groups", "")
    spec.variants.forEach((v) => lines.push(renderTokenGroup(v), ""))
  }

  if (spec.states?.length) {
    lines.push("## States / token groups", "")
    spec.states.forEach((s) => lines.push(renderTokenGroup(s), ""))
  }

  const knownKeys = new Set([
    "name", "figmaNodeId", "figmaUrl", "description", "properties",
    "sizes", "typography", "variants", "states",
  ])
  const extraKeys = Object.keys(spec).filter((k) => !knownKeys.has(k))
  if (extraKeys.length) {
    lines.push(
      "## Additional data",
      "",
      "Fields present in the source `_SPEC` object not covered by the sections above:",
      "",
      "```json",
      JSON.stringify(Object.fromEntries(extraKeys.map((k) => [k, spec[k]])), null, 2),
      "```",
      ""
    )
  }

  lines.push(
    "---",
    "",
    "_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data" +
      " the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file," +
      " then re-run the script._"
  )

  return lines.join("\n")
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR)

const found = findSpecs(text)
let written = 0
let skipped = 0

for (const { name, source } of found) {
  let spec
  try {
    // A couple of _SPEC objects carry an inline TS type assertion (e.g.
    // `[] as { element: string; ... }[]`) that plain JS eval can't parse.
    // Safe to strip: it only narrows an empty array's type, never affects the value.
    const jsSource = source.replace(/\]\s+as\s+\{[^{}]*\}\[\]/g, "]")
    // eslint-disable-next-line no-eval
    spec = new Function(`return (${jsSource})`)()
  } catch (e) {
    console.error(`  ✗ ${name} — failed to evaluate: ${e.message}`)
    skipped++
    continue
  }
  if (Array.isArray(spec)) {
    skipped++
    continue
  }
  const outPath = path.join(OUT_DIR, `${toKebab(name)}.md`)
  fs.writeFileSync(outPath, renderSpec(spec) + "\n")
  written++
}

console.log(`\nGenerated ${written} spec files in specs/ (${skipped} skipped — array-shaped or failed to parse).`)
