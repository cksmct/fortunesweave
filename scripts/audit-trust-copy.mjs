#!/usr/bin/env node
/**
 * audit-trust-copy.mjs — reader-trust copy gate
 *
 * Finds user-facing copy that centers the publisher's limitations instead of
 * leading with the answer, evidence, date, and next action.
 *
 * Usage:
 *   node audit-trust-copy.mjs [--root <project>] [--strict] [--json]
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const ROOT = path.resolve(argValue("--root") || process.cwd());
const STRICT = args.includes("--strict");
const JSON_MODE = args.includes("--json");
const SOURCE_DIRS = ["src/app", "src/components", "src/data", "app", "pages", "content"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".mdx", ".md"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "out", "dist", "build", ".git"]);
const POLICY_FILE_RE = /(?:^|\/)(?:privacy(?:-policy)?|terms|cookies?|legal|contact)(?:\/|\.|$)/i;

const RULES = [
  {
    id: "TRUST_SELF_DISQUALIFY",
    severity: "error",
    re: /\bwe\s+(?:deliberately\s+)?(?:have not|haven't|do not|don't|cannot|can't|could not|couldn't|will not|won't)\b/i,
    advice: "Lead with the current answer and dated evidence; move any remaining uncertainty to one short claim-level note.",
  },
  {
    id: "TRUST_NEGATIVE_HEADING",
    severity: "error",
    re: /\b(?:why there is no|what we do not|what we cannot|what we have not)\b/i,
    advice: "Rename the section around available value, such as Current evidence, Verified routes, or Publishing standard.",
  },
  {
    id: "TRUST_PROCESS_EXPOSURE",
    severity: "error",
    re: /\b(?:not verified by us|not confirmed by us|we do not hold (?:an|the) account|closest thing to (?:an )?in-client (?:check|verification))\b/i,
    advice: "Do not expose internal access limitations. State the source tier, check date, and practical next step instead.",
  },
  {
    id: "TRUST_SELF_STALE",
    severity: "error",
    re: /\b(?:this page is out of date|our (?:page|guide|list|data) (?:is|may be) (?:wrong|out of date|incomplete))\b/i,
    advice: "State that the live client takes precedence and show the last checked date without declaring the page unreliable.",
  },
  {
    id: "TRUST_RAW_STATUS",
    severity: "warning",
    re: /\b(?:unverified by definition|to verify in-game|treat (?:it|this|them) as unknown)\b/i,
    advice: "Use a neutral evidence status: source-reported, awaiting developer details, or reports differ as of DATE.",
  },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase()) && !/audit-trust-copy/i.test(entry.name)) out.push(full);
  }
  return out;
}

function isNonRenderedLine(line) {
  const t = line.trim();
  return !t || t.startsWith("//") || t.startsWith("/*") || t.startsWith("*") || t.startsWith("*/") ||
    t.startsWith("{/*") || t.endsWith("*/}") ||
    /^(?:import|export\s+(?:type|interface)|type\s|interface\s)/.test(t);
}

const files = [...new Set(SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir))))];
if (!files.length) {
  console.error("TRUST COPY AUDIT: no source directories found. Run from a site root or pass --root <path>.");
  process.exit(2);
}

const findings = [];
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (POLICY_FILE_RE.test(rel)) continue;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (isNonRenderedLine(line)) return;
    for (const rule of RULES) {
      if (!rule.re.test(line)) continue;
      findings.push({
        ...rule,
        file: rel,
        line: index + 1,
        excerpt: line.trim().replace(/\s+/g, " ").slice(0, 240),
      });
    }
  });
}

const errors = findings.filter((x) => x.severity === "error");
const warnings = findings.filter((x) => x.severity === "warning");

if (JSON_MODE) {
  console.log(JSON.stringify({ root: ROOT, scannedFiles: files.length, errors: errors.length, warnings: warnings.length, findings }, null, 2));
} else {
  console.log("\n================ READER TRUST COPY AUDIT ================");
  console.log(`Root: ${ROOT}`);
  console.log(`Scanned: ${files.length} source files`);
  for (const item of findings) {
    const mark = item.severity === "error" ? "ERROR" : "WARN";
    console.log(`\n[${mark}] ${item.id} ${item.file}:${item.line}`);
    console.log(`  ${item.excerpt}`);
    console.log(`  Fix: ${item.advice}`);
  }
  if (!findings.length) console.log("PASS: no reader-trust copy risks found.");
  console.log(`\nSummary: ${errors.length} error(s), ${warnings.length} warning(s).`);
  console.log("Principle: evidence first, uncertainty second, next action last.");
  console.log("=========================================================\n");
}

process.exit(errors.length || (STRICT && warnings.length) ? 1 : 0);
