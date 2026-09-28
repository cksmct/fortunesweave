#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const OUT_DIR = join(PROJECT_ROOT, "out");
const SITEMAP_PATH = join(OUT_DIR, "sitemap.xml");

const SKIP_DIRS = new Set(["_next", "_not-found", "404", "favicon"]);
const STATIC_EXT = /\.(png|jpe?g|svg|webp|ico|gif|avif|pdf|txt|xml|css|json|js|map|woff2?|ttf|otf)$/i;

let SITE_ORIGIN = null;

function fatal(msg) {
  console.error("❌", msg);
  process.exit(1);
}

function normalizeTarget(raw) {
  let t = raw.trim();
  if (!t || t.startsWith("#") || t.startsWith("mailto:") || t.startsWith("tel:")) return null;
  if (t.startsWith("//")) return null;
  if (/^https?:\/\//i.test(t)) {
    if (SITE_ORIGIN && t.startsWith(SITE_ORIGIN)) {
      t = t.slice(SITE_ORIGIN.length);
    } else {
      return null;
    }
  }

  if (!t.startsWith("/")) return null;

  t = t.split("?")[0].split("#")[0];
  const seg = t.split("/").filter(Boolean);
  if (!seg.length) return "/";
  if (seg[0] === "_next" || SKIP_DIRS.has(seg[0])) return null;
  if (STATIC_EXT.test(seg[seg.length - 1])) return null;
  return "/" + seg.join("/");
}

function pageExists(path) {
  if (path === "/") return existsSync(join(OUT_DIR, "index.html"));
  return existsSync(join(OUT_DIR, path.replace(/^\//, ""), "index.html"));
}

function readPage(path) {
  if (path === "/") return readFileSync(join(OUT_DIR, "index.html"), "utf8");
  return readFileSync(join(OUT_DIR, path.replace(/^\//, ""), "index.html"), "utf8");
}

function extractHrefs(html) {
  const hrefs = [];
  const re = /<a[^>]*\shref="([^"]+)"[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) hrefs.push(m[1]);
  return hrefs;
}

function sitemapPaths() {
  if (!existsSync(SITEMAP_PATH)) fatal(`sitemap.xml not found: ${SITEMAP_PATH}. Please run "npm run build" first.`);
  const xml = readFileSync(SITEMAP_PATH, "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
  if (!locs.length) fatal("sitemap.xml contains no <loc> entries");
  try {
    SITE_ORIGIN = new URL(locs[0]).origin;
  } catch {
    fatal(`Invalid <loc> in sitemap: ${locs[0]}`);
  }
  const set = new Set();
  for (const loc of locs) {
    try {
      const u = new URL(loc);
      const p = u.pathname.endsWith("/") ? u.pathname.replace(/\/$/, "") : u.pathname;
      set.add(p || "/");
    } catch {
      fatal(`Invalid <loc> in sitemap: ${loc}`);
    }
  }
  return set;
}

function crawl() {
  const visited = new Set();
  const deadLinks = [];
  const queue = ["/"];

  while (queue.length) {
    const path = queue.shift();
    if (visited.has(path)) continue;
    visited.add(path);

    if (!pageExists(path)) {
      deadLinks.push({ from: null, to: path });
      continue;
    }

    let html;
    try {
      html = readPage(path);
    } catch (err) {
      deadLinks.push({ from: path, to: "(unreadable)" });
      continue;
    }

for (const raw of extractHrefs(html)) {
          const target = normalizeTarget(raw);
      if (!target) continue;
      if (visited.has(target)) continue;
      if (!pageExists(target)) {
        deadLinks.push({ from: path, to: target });
        continue;
      }
      queue.push(target);
    }
  }

  return { visited, deadLinks };
}

function main() {
  console.log("\n🔍 Audit internal links & sitemap...");

  const sitemap = sitemapPaths();
  const { visited, deadLinks } = crawl();

  const sitemapExcludes = [...sitemap].filter((p) => {
    const seg = p.replace(/^\//, "").split("/")[0];
    return !SKIP_DIRS.has(seg);
  });
  const orphans = sitemapExcludes.filter((p) => !visited.has(p));
  const extra = [...visited].filter((p) => !sitemap.has(p));

  let failed = false;

  console.log("\n📋 sitemap 登记:", sitemap.size, "个页面");
  console.log("🧭 首页可达（BFS）:", visited.size, "个页面");

  if (deadLinks.length) {
    failed = true;
    console.log("\n❌ 死链（href 目标页面不存在）:");
    for (const d of deadLinks) {
      console.log(`   ${d.to}   ← ${d.from || "首页"}`);
    }
  }

  if (orphans.length) {
    failed = true;
    console.log("\n❌ 孤儿页面（sitemap 有但首页不可达）:");
    for (const p of orphans) console.log("   ", p);
  }

  if (extra.length) {
    failed = true;
    console.log("\n❌ 多余页面（可达但未登记 sitemap）:");
    for (const p of extra) console.log("   ", p);
  }

  if (failed) {
    console.error("\n❌ 审计未通过：请修复上述内链/sitemap 问题。");
    process.exit(1);
  }

  console.log("✅ 审计通过：无死链、无孤儿页面、无多余页面，sitemap 与可达页面完全一致。");
}

main();