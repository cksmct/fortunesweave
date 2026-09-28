#!/usr/bin/env node
/**
 * audit-site.mjs - 产物级站点完整性门禁（postbuild 必跑）
 *
 * 检查项：
 *   A. sitemap.xml 的 <loc> 集合 与 全站 canonical 集合 必须逐字相等（含尾斜杠）
 *   B. 每个页面的 canonical 必须是绝对 URL、且以站点 baseUrl 开头
 *   C. 页面内所有站内 href 必须能在 out/ 找到对应产物（HTML 或 public 静态资源）
 *   D. robots.txt 必须存在且含 Disallow: /cdn-cgi/ 与 Sitemap 声明
 *
 * 排除项：Next 自带产物 404.html / 404/ / _not-found/ / _next/ 不参与 canonical 与
 * sitemap 比对（它们不是站点路由，其 canonical 继承根布局会造成假重复），
 * 但它们的文件仍计入「资源存在性」集合，供链接检查使用。
 *
 * 立项动机：IGSA 正文要求本脚本来自 zero-404-site-audit，而该技能实际未提供脚本文件
 * （描述有、代码无）。本文件为补齐实现。
 *
 * 必须挂 postbuild：挂 prebuild 时校验的是上一次构建的旧产物，
 * 本次把 sitemap 改坏了也不会报错，要等下一次构建才暴露。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const failures = [];

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function relOf(file) {
  return path.relative(OUT, file).replace(/\\/g, "/");
}

function isFrameworkFile(rel) {
  if (rel.startsWith("_next/") || rel.includes("/_next/")) return true;
  if (/(^|\/)_not-found(\.html|\/|$)/.test(rel)) return true;
  if (/(^|\/)404(\.html|\/|$)/.test(rel)) return true;
  return false;
}

if (!fs.existsSync(OUT)) {
  console.error("audit-site: out/ 不存在，请先 npm run build");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "game.config.json"), "utf8"));
const baseUrl = String(config.seo.baseUrl).replace(/\/$/, "");

const allFiles = walk(OUT);
const fileSet = new Set(allFiles.map(relOf));
const htmlFiles = allFiles.filter((f) => f.endsWith(".html") && !isFrameworkFile(relOf(f)));
const skipped = allFiles.filter((f) => isFrameworkFile(relOf(f))).length;

function routeOfHtml(file) {
  const rel = relOf(file);
  if (rel === "index.html") return "/";
  return "/" + rel.replace(/index\.html$/, "");
}

function targetExists(href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean.startsWith("/")) return true;
  const bare = clean.replace(/^\/+/, "").replace(/\/+$/, "");
  if (bare === "") return fileSet.has("index.html");
  if (fileSet.has(bare + "/index.html")) return true;
  if (fileSet.has(bare + ".html")) return true;
  if (fileSet.has(bare)) return true;
  return false;
}

const canonicals = new Map();
let linkCount = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeOfHtml(file);
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canonicalMatch) {
    failures.push(route + ": 缺少 canonical 链接");
  } else {
    const canonical = canonicalMatch[1];
    if (!/^https?:\/\//.test(canonical)) failures.push(route + ": canonical 不是绝对 URL（" + canonical + "）");
    if (!canonical.startsWith(baseUrl)) failures.push(route + ": canonical 域名与 baseUrl 不一致（" + canonical + "）");
    if (canonicals.has(canonical)) failures.push(route + ": canonical 与其他页面重复（" + canonical + "）");
    canonicals.set(canonical, route);
  }
  const hrefs = html.match(/href="(\/[^"]*)"/g) || [];
  const seen = new Set();
  for (const raw of hrefs) {
    const href = raw.slice(6, -1);
    if (href.startsWith("//") || seen.has(href)) continue;
    seen.add(href);
    linkCount += 1;
    if (!targetExists(href)) failures.push(route + ": 站内链接指向不存在的产物 " + href);
  }
}

const sitemapPath = path.join(OUT, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  failures.push("out/sitemap.xml 缺失");
} else {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  const locSet = new Set(locs);
  if (locs.length !== locSet.size) failures.push("sitemap.xml 存在重复 loc");
  for (const canonical of canonicals.keys()) {
    if (!locSet.has(canonical)) failures.push("sitemap 缺少页面: " + canonical);
  }
  for (const loc of locSet) {
    if (!canonicals.has(loc)) failures.push("sitemap 含未知 URL（无对应 canonical）: " + loc);
  }
}

const robotsPath = path.join(OUT, "robots.txt");
if (!fs.existsSync(robotsPath)) {
  failures.push("out/robots.txt 缺失");
} else {
  const robots = fs.readFileSync(robotsPath, "utf8");
  if (!robots.includes("Disallow: /cdn-cgi/")) failures.push("robots.txt 缺少 Disallow: /cdn-cgi/");
  if (!/Sitemap:/i.test(robots)) failures.push("robots.txt 缺少 Sitemap 声明");
}

console.log(
  "audit-site: 页面 " + htmlFiles.length + " 个 / canonical " + canonicals.size + " 条 / 站内链接 " + linkCount + " 条 / 跳过框架产物 " + skipped + " 个"
);
if (failures.length > 0) {
  console.error("站点完整性门禁失败 (" + failures.length + "):");
  for (const failure of failures) console.error("  - " + failure);
  process.exit(1);
}
console.log("OK sitemap 与 canonical 逐字一致，无断链，robots 合规");
