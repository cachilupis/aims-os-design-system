#!/usr/bin/env node
/**
 * audit-ratchet.cjs — AIMS OS Design System
 *
 * Checks 6-8 of audit-tokens.cjs (DS-component shadows, variant="main"
 * overuse, hand-rolled cards) emit WARNINGS, so the audit prints them and
 * still exits 0. That is deliberate: none of the three can ever be required
 * to hit zero, because each has a real false-positive mode.
 *
 *   Check 6 matches component NAMES, not behaviour. A screen once defined a
 *           local `Stepper` that was a numeric +/- input while the DS
 *           `Stepper` is a wizard indicator — unrelated, same word.
 *   Check 7 counts variant="main" per FILE, but one file can hold several
 *           screens. pm-michael-test-v1.tsx trips it with two legitimate
 *           Header CTAs on two views that never render at once.
 *   Check 8 self-describes as a heuristic ("*possible* hand-rolled card").
 *
 * So instead of a threshold, this is a ratchet: whatever a branch inherits
 * it may keep, but it may not add more. The number can go down or stay,
 * never up.
 *
 * Run:
 *   node scripts/audit-ratchet.cjs                 # compare against origin/main
 *   node scripts/audit-ratchet.cjs origin/develop  # compare against another base
 *
 * Used by BOTH .husky/pre-push and .github/workflows/design-system-checks.yml
 * so the rule that stops a push locally is the same one that fails CI — a
 * contributor never discovers a new rule only after pushing.
 *
 * Exit codes: 0 = no category increased (or the check was skipped),
 *             1 = at least one category increased.
 */

const { execFileSync } = require("child_process")
const fs = require("fs")
const os = require("os")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const BASE = process.argv[2] || "origin/main"

const git = (args, opts = {}) =>
  (execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }) || "").trim()

const say = (msg) => console.log(`  ${msg}`)

// A skip is never a failure. The ratchet is a safety net, not a gate a
// contributor can get stuck behind because they are offline or on a fresh
// clone with no remote ref yet.
function skip(reason) {
  console.log(`\n⏭  Ratchet skipped — ${reason}`)
  process.exit(0)
}

let baseSha
try {
  baseSha = git(["rev-parse", "--verify", `${BASE}^{commit}`])
} catch {
  skip(`"${BASE}" is not available locally. Run \`git fetch origin\` to enable it.`)
}

console.log(`\nDS warning ratchet — comparing against ${BASE} (${baseSha.slice(0, 8)})`)

// Both sides must be measured with the SAME ruler: the base's copy of the
// audit script. Measuring a branch with its own copy is how a stale branch
// grades itself against rules that cannot see its own findings — the exact
// failure that let 4 shadow + 6 main-overuse findings through on PR #55.
// It also means a PR that legitimately edits the audit script is not judged
// by the rules it is introducing.
let ruler
try {
  ruler = git(["show", `${baseSha}:scripts/audit-tokens.cjs`])
} catch {
  skip("the base has no scripts/audit-tokens.cjs")
}

if (!ruler.includes("--counts")) {
  skip("the base's audit script predates the --counts flag; it will engage once this lands on main")
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aims-ratchet-"))
const worktree = path.join(tmp, "base")
const rulerPath = path.join(tmp, "ruler.cjs")

function cleanup() {
  try {
    git(["worktree", "remove", worktree, "--force"])
  } catch { /* never created, or already gone */ }
  try {
    fs.rmSync(tmp, { recursive: true, force: true })
  } catch { /* best effort */ }
}
process.on("exit", cleanup)

// `--counts` prints one AUDIT_COUNTS line; a non-zero exit only means the
// audit found hardcoded-colour ERRORS, which the audit step reports on its
// own. Here we want the counts either way.
function countsOf(scriptPath) {
  let out = ""
  try {
    out = execFileSync("node", [scriptPath, "--counts"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
  } catch (e) {
    out = (e.stdout || "").toString()
  }
  const line = /AUDIT_COUNTS (.*)/.exec(out)
  if (!line) return null
  return Object.fromEntries(
    line[1].trim().split(/\s+/).map((pair) => {
      const [k, v] = pair.split("=")
      return [k, Number(v)]
    })
  )
}

let base, head
try {
  git(["worktree", "add", "--detach", worktree, baseSha], { stdio: "ignore" })
  fs.writeFileSync(rulerPath, ruler)

  base = countsOf(path.join(worktree, "scripts", "audit-tokens.cjs"))

  // Measure the working tree with the base's ruler, not its own.
  const own = path.join(ROOT, "scripts", "audit-tokens.cjs")
  const backup = fs.readFileSync(own, "utf8")
  try {
    fs.writeFileSync(own, ruler)
    head = countsOf(own)
  } finally {
    fs.writeFileSync(own, backup)
  }
} catch (err) {
  skip(`could not measure the base (${err.message})`)
}

if (!base || !head) skip("the audit produced no AUDIT_COUNTS line")

const LABELS = {
  errors:       "hardcoded colours",
  orphan:       "orphaned components",
  shadow:       "hand-rolled DS component shadows",
  main_overuse: 'variant="main" overuse',
  card_reimpl:  "hand-rolled cards",
}

const worse = Object.keys(head).filter((k) => head[k] > (base[k] ?? 0))

for (const k of Object.keys(head)) {
  const b = base[k] ?? 0
  const h = head[k]
  const mark = h > b ? "✗" : h < b ? "✓" : " "
  say(`${mark} ${(LABELS[k] || k).padEnd(34)} base ${String(b).padStart(3)}  →  here ${String(h).padStart(3)}`)
}

if (!worse.length) {
  console.log("\n✅ No new DS warnings.\n")
  process.exit(0)
}

console.log("\n❌ This branch adds DS warnings that the base does not have:\n")
for (const k of worse) {
  console.log(`   ${LABELS[k] || k}: ${base[k] ?? 0} → ${head[k]}`)
}
console.log(
  "\n   Run `npm run audit:tokens` to see each finding with its file and line.\n" +
    "   Fix the new ones, or remove an equivalent existing one.\n" +
    "\n   If a finding is a false positive — the check matches names and counts,\n" +
    "   not intent — say so in the PR description rather than reshaping correct\n" +
    "   code to satisfy it, and ask for the ratchet to be overridden.\n"
)
process.exit(1)
