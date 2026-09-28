#!/usr/bin/env node
/**
 * accept-delivery.mjs - 交付验收（部署前跑一次）
 *
 * 用法：
 *   node scripts/accept-delivery.mjs             # 产物与数据自检
 *   node scripts/accept-delivery.mjs --with-gates # 额外跑 11 道门禁的反向测试（较慢）
 *
 * 检查项：
 *   1. out/ 存在且每个注册路由都有 index.html
 *   2. 每个页面都有 canonical / og:url（且二者一致）/ twitter:card / 1200x630 图
 *   3. sitemap 条目数与产物页数一致，且无重复
 *   4. 数据行全部带 sources / grade / asOf（复用 audit-sources）
 *   5. 项目根目录无临时/凭据文件残留，src/data 无探针残留
 *   6. 趋势词覆盖门禁通过（复用 audit-trend-coverage --strict）
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const WITH_GATES = process.argv.includes("--with-gates");
const checks = [];
const run = (command) => {
  const parts = command.split(" ");
  const result = spawnSync(parts[0], parts.slice(1), { cwd: ROOT, encoding: "utf8" });
  return result.status === null ? 1 : result.status;
};
const add = (name, ok, detail) => checks.push({ name, ok, detail });

if (!fs.existsSync(OUT)) {
  console.error("out/ 不存在 —— 先跑 npm run build");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "game.config.json"), "utf8"));
const baseUrl = String(config.seo.baseUrl).replace(/\/$/, "");

const missing = [];
for (const route of config.routes) {
  const clean = String(route.path).replace(/^\//, "").replace(/\/$/, "");
  const file = path.join(OUT, clean, "index.html");
  if (!fs.existsSync(file)) missing.push(route.path);
}
add("every registered route has an index.html", missing.length === 0, missing.length ? "missing: " + missing.join(", ") : config.routes.length + " routes");

const htmlFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
};
walk(OUT);

let metaProblems = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || "";
  const ogUrl = (html.match(/<meta property="og:url" content="([^"]+)"/) || [])[1] || "";
  const card = (html.match(/<meta name="twitter:card" content="([^"]+)"/) || [])[1] || "";
  const w = (html.match(/<meta property="og:image:width" content="([^"]+)"/) || [])[1] || "";
  const h = (html.match(/<meta property="og:image:height" content="([^"]+)"/) || [])[1] || "";
  if (!canonical.startsWith(baseUrl) || canonical !== ogUrl || card !== "summary_large_image" || w !== "1200" || h !== "630") {
    metaProblems += 1;
  }
}
add("canonical / og:url / twitter card / og size on every page", metaProblems === 0, metaProblems + " page(s) with a problem");

const sitemap = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
const noDupes = new Set(locs).size === locs.length;
const realPages = htmlFiles.filter((f) => !/404|_not-found/.test(f)).length;
add("sitemap matches the built page count and has no duplicates", noDupes && locs.length === realPages, locs.length + " sitemap entries vs " + realPages + " pages");

add("data rows all carry sources, grade and asOf", run("node scripts/audit-sources.mjs") === 0, "audit-sources exit code");
add("trend keyword coverage", run("node scripts/audit-trend-coverage.mjs --strict") === 0, "audit-trend-coverage --strict exit code");

const stray = fs.readdirSync(ROOT).filter((f) => /^[0-9a-f-]{36}\.txt$/.test(f) || /^_.*probe/i.test(f));
const probes = fs.existsSync(path.join(ROOT, "src", "data")) ? fs.readdirSync(path.join(ROOT, "src", "data")).filter((f) => f.startsWith("_probe")) : [];
add("no credentials or probe files left behind", stray.length === 0 && probes.length === 0, "root strays " + stray.length + ", data probes " + probes.length);

if (WITH_GATES) {
  add("gate reverse-test sweep (11 gates)", run("node scripts/verify-gates.mjs") === 0, "clean 0 -> broken 1 -> restored 0");
}

console.log("--- Delivery acceptance ---");
for (const c of checks) console.log((c.ok ? "PASS  " : "FAIL  ") + c.name.padEnd(52) + c.detail);
const failed = checks.filter((c) => !c.ok).length;
if (failed > 0) {
  console.error("\n" + failed + " check(s) failed.");
  process.exit(1);
}
console.log("\nOK: " + checks.length + " checks passed. out/ is ready to upload.");
