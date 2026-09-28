#!/usr/bin/env node
/**
 * audit-seo-meta.mjs - SEO 元数据终验门禁（postbuild 必跑，扫尽 out/ 全量 HTML）
 *
 * 检查项：
 *   A. <title> 长度必须落在 30-65 字符黄金区间（防 SERP 截断 / 防过短）
 *   B. <title> 不得把游戏品牌后缀重复拼接（Brand Page | Brand 双重嵌套）
 *   C. meta description 长度必须落在 110-158 字符
 *   D. og:url 必须存在且与该页 canonical 完全一致（防 Open Graph 浅继承回退到首页）
 *   E. og:image:width / og:image:height 必须是 1200 / 630
 *   F. twitter:card 必须是 summary_large_image
 *   G. 全站 title 唯一（重复即两个 URL 在 SERP 显示同一标题）
 *
 * 立项动机：IGSA 正文要求本脚本来自 zero-404-site-audit，但该技能实际未提供脚本文件。
 * 本文件为补齐实现。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");

const MIN_TITLE = 30;
const MAX_TITLE = 65;
const MIN_DESC = 110;
const MAX_DESC = 158;

const failures = [];
const warnings = [];

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function pick(html, regex) {
  const match = html.match(regex);
  return match ? match[1] : "";
}

function decode(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "\u0027")
    .replace(/&apos;/g, "\u0027")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .trim();
}

if (!fs.existsSync(OUT)) {
  console.error("audit-seo-meta: out/ 不存在，请先 npm run build");
  process.exit(1);
}

let config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "game.config.json"), "utf8"));
} catch (error) {
  console.error("audit-seo-meta: 读取 game.config.json 失败 - " + error.message);
  process.exit(1);
}
const brand = String((config.seo && (config.seo.titleSuffix || config.seo.siteName)) || "");
const baseUrl = String(config.seo.baseUrl).replace(/\/$/, "");

if (/\{[^}]*\}|TODO|PLACEHOLDER/.test(baseUrl)) {
  failures.push("baseUrl 仍是占位符，禁止上线（" + baseUrl + "）");
}

const titles = new Map();
const isFramework = (rel) => /^_next\//.test(rel) || /(^|\/)(_not-found|404)(\.html|\/|$)/.test(rel);
const files = walk(OUT).filter((f) => !isFramework(path.relative(OUT, f).replace(/\\/g, "/")));

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const route = "/" + path.relative(OUT, file).replace(/\\/g, "/").replace(/index\.html$/, "");
  const title = decode(pick(html, /<title[^>]*>([\s\S]*?)<\/title>/));
  const description = decode(pick(html, /<meta name="description" content="([^"]*)"/));
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const ogUrl = pick(html, /<meta property="og:url" content="([^"]*)"/);
  const ogWidth = pick(html, /<meta property="og:image:width" content="([^"]*)"/);
  const ogHeight = pick(html, /<meta property="og:image:height" content="([^"]*)"/);
  const twitterCard = pick(html, /<meta name="twitter:card" content="([^"]*)"/);

  if (title.length < MIN_TITLE || title.length > MAX_TITLE) {
    failures.push(route + ": title 长度 " + title.length + " 不在 " + MIN_TITLE + "-" + MAX_TITLE + " 区间: " + title);
  }
  const brandCount = brand ? title.split(brand).length - 1 : 0;
  if (brandCount > 1) {
    failures.push(route + ": title 品牌名重复 " + brandCount + " 次（双重嵌套）: " + title);
  }
  if (titles.has(title)) {
    failures.push(route + ": title 与 " + titles.get(title) + " 重复: " + title);
  } else {
    titles.set(title, route);
  }
  if (description.length < MIN_DESC || description.length > MAX_DESC) {
    failures.push(route + ": description 长度 " + description.length + " 不在 " + MIN_DESC + "-" + MAX_DESC + " 区间");
  }
  if (!ogUrl) failures.push(route + ": 缺少 og:url");
  else if (ogUrl !== canonical) failures.push(route + ": og:url 与 canonical 不一致（" + ogUrl + " vs " + canonical + "）");
  if (!canonical.startsWith(baseUrl)) failures.push(route + ": canonical 未使用 baseUrl（" + canonical + "）");
  if (ogWidth !== "1200" || ogHeight !== "630") {
    failures.push(route + ": og:image 尺寸不是 1200x630（" + ogWidth + "x" + ogHeight + "）");
  }
  if (twitterCard !== "summary_large_image") {
    failures.push(route + ": twitter:card 期望 summary_large_image，实际 " + (twitterCard || "缺失"));
  }
  if (title.length > MAX_TITLE - 5) warnings.push(route + ": title 接近上限（" + title.length + "）");
}

console.log("audit-seo-meta: 校验页面 " + files.length + " 个 / 唯一 title " + titles.size + " 条");
if (warnings.length > 0) for (const warning of warnings) console.log("  ! " + warning);
if (failures.length > 0) {
  console.error("SEO 元数据门禁失败 (" + failures.length + "):");
  for (const failure of failures) console.error("  - " + failure);
  process.exit(1);
}
console.log("OK title / description / og:url / og:image / twitter:card 全部达标");
