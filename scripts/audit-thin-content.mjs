#!/usr/bin/env node
/**
 * Thin Content Gate (audit-thin-content.mjs)
 *
 * 为什么存在：
 *   AdSense 拒收的直接原因是「低价值内容」。审计发现本站存在大量 `<main>` 正文不足
 *   500 词的页面——其中不少整页词数看着有 700+，但其中约 510 词是 header/nav/footer
 *   样板文字，真实正文只有 170~290 词。用「整页词数」判断会完全漏掉这些页面。
 *
 *   本脚本直接量 `<main>` 区域（layout.tsx 用 <main className="flex-1"> 包裹 children，
 *   因此天然排除全站样板文字），是唯一可信的口径。
 *
 * 行为：
 *   - 默认强门禁：任何未豁免页面低于阈值 → 以非零码退出，构建失败、禁止上线。
 *   - 豁免名单只应放「结构性非社论页」（表单页 / 404 / 纯工具页），绝不用于掩盖薄内容。
 *
 * 用法：
 *   node scripts/audit-thin-content.mjs                 # 强门禁（默认 500 词）
 *   THIN_MIN_WORDS=600 node scripts/audit-thin-content.mjs
 *   THIN_STRICT=0 node scripts/audit-thin-content.mjs   # 仅报告，不失败（用于阶段性盘点）
 */

import fs from "node:fs";
import path from "node:path";

const OUT_DIR = "out";
const CONFIG_PATH = "src/data/game.config.json";
const MIN_WORDS = Number(process.env.THIN_MIN_WORDS ?? 500);
const STRICT = process.env.THIN_STRICT !== "0";

/**
 * 功能性豁免：这些页面天生短，且不属于 Google 评判的「社论内容价值」范畴。
 * 任何新增豁免都必须写明理由，禁止把指南/图鉴/角色/道具页塞进来——
 * 那正是本站上次被 AdSense 判定「低价值内容」的重灾区。
 *
 * 注意：交互式工具页（/sanity-calculator、/anomaly-finder、/equipment-counter）刻意
 * 不豁免。工具本身的价值不等于页面价值，仍需围绕工具补足机制说明与用法，
 * 否则工具页会退化成「只有一个组件、零可读正文」的低价值容器。
 */
const EXEMPT = new Set([
  "/contact/", // 纯联系表单页，无正文可言
]);

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

/** 抽取 <main> 正文；无 <main> 时回退到 <body>，并在报告中标注 */
function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (m) return { text: m[1], scope: "main" };
  const b = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return { text: b ? b[1] : html, scope: "body-fallback" };
}

function countWords(html) {
  const { text, scope } = extractMain(html);
  const plain = decodeEntities(stripTags(text));
  const words = plain.match(/[A-Za-z0-9][A-Za-z0-9'’\-]*/g) ?? [];
  // 与词数分开统计 CJK 字符：中文不产生「词」，只靠词数永远发现不了语言越界
  const cjk = (plain.match(/[\u3000-\u303f\u3040-\u30ff\u4e00-\u9fff\uff00-\uffef]/g) ?? []).length;
  return { count: words.length, cjk, scope };
}

/**
 * 只审计 game.config.json 中「已登记的发布路由」，而不是遍历 out/ 下所有 html。
 * 这样既能自动排除搜索引擎验证文件（naver*.html 等）与 Next 内部路由（/_not-found），
 * 也让「新增页面未登记 routes」的问题交由 audit-site/audit-links 去管，各司其职。
 */
function normalizeRoute(p) {
  return p === "/" ? "/" : p.endsWith("/") ? p : `${p}/`;
}

function resolveHtml(routePath) {
  if (routePath === "/") return path.join(OUT_DIR, "index.html");
  return path.join(OUT_DIR, routePath.slice(1), "index.html");
}

if (!fs.existsSync(OUT_DIR)) {
  console.error(`\n❌ 未找到构建产物目录 "${OUT_DIR}/"。请先执行 npm run build 再运行本门禁。\n`);
  process.exit(1);
}
if (!fs.existsSync(CONFIG_PATH)) {
  console.error(`\n❌ 未找到路由事实源 "${CONFIG_PATH}"，无法判定哪些页面需要审计。\n`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const declaredRoutes = (config.routes ?? []).map((r) => normalizeRoute(r.path));

/**
 * 整改基线：存量薄页的「待办清单」。
 *
 * 存在的意义：让硬门禁立刻生效（任何新增/回归的薄页直接构建失败），
 * 同时不把几十页的存量整改一次性塞进一次提交。基线必须只减不增——
 * 每修复完一批就从文件中移除对应路由，直到清空并彻底关闭豁免。
 *
 * 严禁把新写的薄页加进基线来绕过门禁：那等于把防护网直接拆掉。
 */
const BASELINE_PATH = "scripts/thin-content-baseline.json";
function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return new Set();
  return new Set(JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")).map(normalizeRoute));
}

if (declaredRoutes.length === 0) {
  console.error(`\n❌ "${CONFIG_PATH}" 的 routes 为空，无法完成内容审计。\n`);
  process.exit(1);
}

const missing = [];
const results = [];
for (const route of declaredRoutes) {
  const file = resolveHtml(route);
  if (!fs.existsSync(file)) {
    missing.push(route);
    continue;
  }
  const { count, cjk, scope } = countWords(fs.readFileSync(file, "utf8"));
  results.push({ route, count, cjk, scope });
}

const baseline = loadBaseline();
const measurable = results.filter((r) => !EXEMPT.has(r.route));
const exemptRows = results.filter((r) => EXEMPT.has(r.route));

const belowThreshold = measurable.filter((r) => r.count < MIN_WORDS);

// 基线内 = 已知存量，整改中不阻塞构建；基线外 = 新增或回归的薄页，硬失败。
const pendingRows = belowThreshold.filter((r) => baseline.has(r.route));
const violations = belowThreshold.filter((r) => !baseline.has(r.route));

// 已达标、或页面已被移除却仍留在基线里的条目 —— 应从基线文件删除，防止基线失去意义。
const staleBaseline = [...baseline].filter((route) => {
  const hit = results.find((r) => r.route === route);
  return !hit || hit.count >= MIN_WORDS;
});

const counts = measurable.map((r) => r.count).sort((a, b) => a - b);
const median = counts.length ? counts[Math.floor(counts.length / 2)] : 0;
const min = counts.length ? counts[0] : 0;

console.log("\n================ 📏 THIN CONTENT GATE ================");
console.log(`登记路由: ${declaredRoutes.length}   已审计: ${results.length}   阈值: <main> 正文 ≥ ${MIN_WORDS} 词   模式: ${STRICT ? "强门禁" : "仅报告"}`);
console.log(`正文统计: 最低 ${min} 词 · 中位 ${median} 词`);
console.log(`功能性豁免: ${exemptRows.length} 个${exemptRows.length ? ` (${exemptRows.map((r) => `${r.route}=${r.count}`).join(", ")})` : ""}`);
console.log(`整改基线存量: ${pendingRows.length} 个（不阻塞）   基线外违规: ${violations.length} 个（阻塞）`);

if (missing.length) {
  console.log(`\n❌ ${missing.length} 个已登记路由在 ${OUT_DIR}/ 中找不到产物（路由登记与页面目录不同步）：`);
  missing.forEach((r) => console.log(`   - ${r}`));
  console.log(`\n🚫 构建失败：补齐页面或将其从 ${CONFIG_PATH} 的 routes 移除。\n`);
  process.exit(1);
}

if (staleBaseline.length) {
  console.log(`\n⚠️  基线中 ${staleBaseline.length} 条已达标或页面已不存在，应从 ${BASELINE_PATH} 移除（基线必须只减不增）：`);
  staleBaseline.forEach((r) => console.log(`   - ${r}`));
}

const bodyFallback = results.filter((r) => r.scope === "body-fallback");
if (bodyFallback.length) {
  console.log(`\n⚠️  ${bodyFallback.length} 个页面没有 <main> 包裹，已回退 body 口径（含样板文字，数值偏乐观）：`);
  bodyFallback.forEach((r) => console.log(`   - ${r.route}`));
}

if (pendingRows.length) {
  console.log(`\n📋 基线内存量薄页（待整改，按严重度排序；修复后请从基线移除）：\n`);
  console.log("   路由".padEnd(40) + "正文字数   缺口");
  console.log("   " + "-".repeat(58));
  [...pendingRows].sort((a, b) => a.count - b.count).forEach((v) => {
    console.log(`   ${v.route}`.padEnd(40) + `${String(v.count).padStart(6)}   ${"-" + (MIN_WORDS - v.count)}`);
  });
}

// ── 语言门禁（站点内容语言一致性；2026-09-21 事故根治）──────────────────
// root cause：数据文件内容按 agent 的工作语言（中文）写成，页面文案是英文。
// 而本脚本的分词正则只认 [A-Za-z0-9]，中文贡献 0 个词 —— 页面靠英文样板凑够
// MIN_WORDS 就"通过"了。也就是说：本门禁原本最接近拦住它，却因为只做阈值判断而放行。
// 因此这里补一条与词数无关的硬规则：<main> 出现与站点语言不符的字符 → 直接失败。
const siteLanguage = (() => {
  try {
    const uc = JSON.parse(readFileSync("update-config.json", "utf8"));
    if (uc && typeof uc.siteLanguage === "string" && uc.siteLanguage.trim()) return uc.siteLanguage.trim().toLowerCase();
  } catch { /* 无 update-config.json 时回退 */ }
  try {
    const g = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
    if (g && g.seo && typeof g.seo.lang === "string" && g.seo.lang.trim()) return g.seo.lang.trim().toLowerCase();
  } catch { /* 回退默认 */ }
  return "en";
})();

if (["zh", "ja", "ko"].indexOf(siteLanguage.split("-")[0]) < 0) {
  const langViolations = measurable.filter((r) => r.cjk > 0);
  if (langViolations.length) {
    console.log(`\n❌ 发现 ${langViolations.length} 个页面正文含与站点语言（${siteLanguage}）不符的字符：\n`);
    console.log("   路由".padEnd(40) + "CJK 字符数");
    console.log("   " + "-".repeat(58));
    [...langViolations].sort((a, b) => b.cjk - a.cjk).forEach((v) => {
      console.log(`   ${v.route}`.padEnd(40) + String(v.cjk).padStart(6));
    });
    console.log("\n   修法：直接依据原始证据（官方 API / 字幕 / 竞品页面）用站点语言改写该字段。");
    console.log("   ⛔ 不要先用自己的工作语言写一遍再翻译：往返会叠加失真，中文在分词统计里等于 0 个词，");
    console.log("      这正是「薄内容门禁全绿、线上却全是中文」的成因（2026-09-21 实际事故）。");
    console.log("\n🚫 构建失败：语言一致性与内容量是两条独立门禁，词数达标不代表语言正确。\n");
    process.exit(STRICT ? 1 : 0);
  }
}
if (violations.length === 0) {
  if (pendingRows.length) {
    console.log(`\n✅ 基线外无违规 —— 新增/回归防护生效。剩余 ${pendingRows.length} 页为存量整改项。\n`);
  } else {
    console.log("\n✅ 0 issue — 所有非豁免页面正文均达标，且整改基线已清空。\n");
  }
  process.exit(0);
}

violations.sort((a, b) => a.count - b.count);
console.log(`\n❌ 发现 ${violations.length} 个「基线之外」的薄内容页（新增或回归），这些是硬失败项：\n`);
console.log("   路由".padEnd(40) + "正文字数   缺口");
console.log("   " + "-".repeat(58));
for (const v of violations) {
  console.log(`   ${v.route}`.padEnd(40) + `${String(v.count).padStart(6)}   ${"-" + (MIN_WORDS - v.count)}`);
}

if (!STRICT) {
  console.log(`\n⚠️  THIN_STRICT=0，仅报告未阻塞构建。\n`);
  process.exit(0);
}

console.log(`\n🚫 构建失败：修复上述页面正文到 ≥ ${MIN_WORDS} 词后重新构建。`);
console.log(`   修复方式：补充真实的机制说明 / 对比表 / FAQ / 打法取舍，严禁注水或无意义重复。`);
console.log(`   ⛔ 禁止把新写的薄页加进 ${BASELINE_PATH} 绕过门禁 —— 那等于拆掉防护网。`);
console.log(`   若某页确实无法独立成篇：合并进父页并配置 301，同时从 ${CONFIG_PATH} 的 routes 移除。\n`);
process.exit(1);
