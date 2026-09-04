#!/usr/bin/env node
/**
 * generate-ds-index.cjs — AIMS OS Design System
 *
 * Writes ds-index.json: every component in src/components/, with the
 * description from its catalog spec and how many screens use it today.
 *
 * Why this exists. The screen-generation skill carried a hand-written table
 * mapping intent to components. It covered 12 of 50 — so for the other 38 the
 * agent had no idea they existed and improvised. Stepper, Breadcrumb and
 * SwitchTab were all in that blind spot, and all three were rebuilt by hand in
 * prototypes while the real components sat unused.
 *
 * The fix is not to finish the table by hand. That copy would drift the same
 * way specs/ drifted (35 files, one month) and CLAUDE.md drifted (it claimed
 * Breadcrumb did not exist for a month after it shipped). The descriptions
 * already live in the catalog. This generates from them, so the inventory
 * cannot be incomplete or stale.
 *
 * The id → SPEC mapping is read from getSpec() in App.tsx, never guessed from
 * the filename. CARD_SPEC and MENU_SPEC do not follow the file-name pattern,
 * and guessing produced a wrong audit once already.
 *
 * `usedIn: 0` is worth reading twice. It does not mean "not needed" — Avatar,
 * ProgressBar and Badge are all at zero and all three are hand-rolled in half
 * a dozen screens. Zero usage plus real demand means invisible, not useless.
 *
 * Run: npm run generate:ds-index
 */

const fs = require("fs")
const path = require("path")
const { execFileSync } = require("child_process")

const ROOT = path.resolve(__dirname, "..")
const APP = path.join(ROOT, "src/App.tsx")
const OUT = path.join(ROOT, "ds-index.json")

const app = fs.readFileSync(APP, "utf8")

// id → SPEC constant, straight from the router. The authority on which spec
// belongs to which component.
const specById = new Map()
for (const m of app.matchAll(/if \(id === "([a-z0-9-]+)"\)\s+return ([A-Z_0-9]+)\s+as (?:unknown as )?AnySpec/g)) {
  specById.set(m[1], m[2])
}

// label + group, straight from the catalog's own nav.
const navById = new Map()
for (const m of app.matchAll(/\{ id: "([a-z0-9-]+)",\s*label: "([^"]+)",\s*group: "([^"]+)"/g)) {
  navById.set(m[1], { label: m[2], group: m[3] })
}

function describe(specName) {
  if (!specName) return null
  const i = app.indexOf(`const ${specName} = `)
  if (i < 0) return null
  const m = /description: "((?:[^"\\]|\\.)*)"/.exec(app.slice(i, i + 4000))
  return m ? m[1].replace(/\\"/g, '"') : null
}

/** A candidate has no spec, so its description is the DS-GAP comment it was
 *  required to carry — the one artefact the author had to write by hand. */
function dsGapLine(dir, file) {
  try {
    const src = fs.readFileSync(path.join(ROOT, "src/components", dir, file), "utf8")
    const m = src.match(/\/\/\s*DS-GAP:\s*(.+)/)
    return m ? m[1].trim() : ""
  } catch { return "" }
}

function usedIn(file, dir) {
  const out = execFileSync("bash", ["-c",
    `grep -rl 'components/${dir}/${file}"' ${ROOT}/src/screens/ 2>/dev/null | wc -l`,
  ], { encoding: "utf8" })
  return Number(out.trim())
}

const components = []
// experimental/ is in here deliberately. It used to be skipped, which meant a
// component built for one prototype was invisible to the agent working on the
// next one — so the next one built its own. Three separate WidgetGlyphs came
// from exactly that. A candidate you cannot find is a candidate you rewrite.
for (const dir of ["ui", "layouts", "experimental"]) {
  const d = path.join(ROOT, "src/components", dir)
  if (!fs.existsSync(d)) continue
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".tsx")).sort()) {
    const id = f.replace(".tsx", "")
    const specName = specById.get(id)
    const nav = navById.get(id)
    const candidate = dir === "experimental"
    components.push({
      id,
      name: nav?.label ?? id,
      import: `@/components/${dir}/${id}`,
      group: nav?.group ?? (candidate ? "Candidates" : dir === "layouts" ? "Layouts" : "Components"),
      // "catalog" is supported and specified. "candidate" works and uses DS
      // parts but has no spec yet — reuse it rather than build a second one,
      // and say so if it does not fit.
      tier: candidate ? "candidate" : "catalog",
      description: candidate ? dsGapLine(dir, f) : describe(specName),
      usedInScreens: usedIn(id, dir),
      hasSpec: Boolean(specName),
      hasCatalogPage: Boolean(nav),
    })
  }
}

const noDescription = components.filter((c) => !c.description)
const unused = components.filter((c) => c.usedInScreens === 0)

// The promotion queue. A candidate used once is one screen's decision; used
// twice it is a pattern, and a pattern belongs in the catalog with a spec.
//
// It counts USES, not copies. The duplicate-component check in audit-tokens
// finds the same component written twice — which is the failure this whole
// mechanism exists to prevent. Once reuse works that check goes quiet, and a
// candidate imported by five screens would never surface. Imports are the
// signal that survives success.
const PROMOTE_AT = 2
const promotionQueue = components
  .filter((c) => c.tier === "candidate" && c.usedInScreens >= PROMOTE_AT)
  .map((c) => ({ id: c.id, usedInScreens: c.usedInScreens, import: c.import }))
  .sort((a, b) => b.usedInScreens - a.usedInScreens)

const out = {
  note:
    "Generated by scripts/generate-ds-index.cjs from the catalog specs in src/App.tsx. " +
    "Do not edit. This is the COMPLETE inventory — search it before building any component by hand. " +
      "tier=catalog is supported and specified. tier=candidate works and uses DS parts but has no spec " +
      "yet: reuse it rather than building a second one, and say in the PR if it genuinely does not fit.",
  generatedFrom: "src/App.tsx (getSpec + NAV_SECTIONS) + src/screens usage",
  totals: {
    components: components.length,
    withDescription: components.length - noDescription.length,
    withoutDescription: noDescription.length,
    unusedInScreens: unused.length,
    candidates: components.filter((c) => c.tier === "candidate").length,
    readyToPromote: promotionQueue.length,
  },
  promotionQueue,
  // Surfaced deliberately: a component with no description is one the skill
  // cannot reason about, and one with no page cannot be found by searching.
  needsAttention: {
    noDescription: noDescription.map((c) => c.id),
    noCatalogPage: components.filter((c) => !c.hasCatalogPage).map((c) => c.id),
  },
  components,
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n")

console.log(`DS index — ${components.length} components`)
console.log(`  with a description: ${out.totals.withDescription}`)
console.log(`  without one:        ${out.totals.withoutDescription}${noDescription.length ? "  → " + noDescription.map((c) => c.id).join(", ") : ""}`)
console.log(`  unused in screens:  ${out.totals.unusedInScreens}`)
console.log(`\nWrote ${path.relative(ROOT, OUT)}`)
