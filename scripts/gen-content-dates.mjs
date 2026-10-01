#!/usr/bin/env node
/**
 * gen-content-dates.mjs — 页面内容日期的唯一生成器（防 Content Churn）
 * ─────────────────────────────────────────────────────────────────────
 * 用途：为每个路由推导「内容最后修改日」，生成 `src/data/pageDates.ts`。
 *       sitemap 的 lastModified 与页面 JSON-LD 的 dateModified 全部消费它。
 *
 * 核心规则（每条都对应一次真实事故，改脚本前务必读完）：
 *
 * 1) 「工作区改动优先」：已提交文件查 `git log -1 --format=%cs`，但只要有
 *    未提交改动，就用**本地时区 mtime**。否则"本地改了内容、Last updated 停滞"。
 *
 * 2) **严禁 mtime.toISOString()**：那是 UTC，跨日会错位一天。必须用本地
 *    getFullYear/getMonth/getDate 拼 YYYY-MM-DD。
 *
 * 3) **严禁对 `git status --porcelain` 的整段输出 `.trim()`**：
 *    未暂存改动行以空格开头（`" M src/app/about/page.tsx"`），整串 trim 会吃掉
 *    首行首字符，随后 `line.slice(3)` 把路径截成 `rc/app/...` → 该文件永远命中不了
 *    mtime 分支 → **每次构建都有且仅有一个页面（脏文件里字典序第一的那个）
 *    静默拿到过期日期**，并同步污染 sitemap 的 lastmod。
 *    正确写法：`const out = exec(...)`（不 trim）+ 逐行 `replace(/\r$/,'')`。
 *
 * 4) **禁止无条件 mtime fallback**：CI 浅克隆（Vercel/Cloudflare Pages 默认
 *    `--depth 1`）下 git log 只有一条克隆提交、mtime 等于 checkout 时刻，
 *    两者都会把所有未改动页面刷成"构建日"→ 全站内容churn。浅克隆或 git 不可用时
 *    进入保守模式：只有 porcelain 确认有改动的文件用 mtime，其余沿用历史日期表。
 *
 * 5) **数据抓取产物不得成为日期依赖**：每日自动抓取的 stats 文件写进
 *    routeDependencies 会让 lastmod 每天刷新；快照日期只应作为
 *    "Verified {date}" 展示在页面里。详见技能「防 Content Churn 铁律」。
 *
 * 可选配置：`scripts/content-deps.json`
 *   {
 *     "sitePublished": "2026-01-01",
 *     "evergreenRoutes": ["/about", "/privacy-policy", "/terms"],
 *     "routeDependencies": { "/codes": ["src/data/codes.json"] }
 *   }
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join('src', 'app');
const OUT_FILE = path.join('src', 'data', 'pageDates.ts');
const DEPS_FILE = path.join('scripts', 'content-deps.json');

const DEFAULT_SITE_PUBLISHED = '2026-01-01';

// ── 读取可选配置 ────────────────────────────────────────────────────────
let sitePublished = DEFAULT_SITE_PUBLISHED;
let evergreenRoutes = new Set();
let routeDependencies = {};
if (fs.existsSync(DEPS_FILE)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(DEPS_FILE, 'utf8'));
    if (cfg.sitePublished) sitePublished = String(cfg.sitePublished);
    if (Array.isArray(cfg.evergreenRoutes)) evergreenRoutes = new Set(cfg.evergreenRoutes.map(normalizeRoute));
    if (cfg.routeDependencies && typeof cfg.routeDependencies === 'object') {
      routeDependencies = cfg.routeDependencies;
    }
  } catch (e) {
    console.warn(`[gen-dates] 忽略无法解析的 ${DEPS_FILE}: ${e.message}`);
  }
}

// ── 工具函数 ───────────────────────────────────────────────────────────
function normalizeRoute(route) {
  const r = String(route || '/').trim();
  if (r === '/' || r === '') return '/';
  return r.replace(/\/+$/, '');
}

/** 本地时区 YYYY-MM-DD。⚠️ 禁止 toISOString()（UTC 跨日错位）。 */
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function tryExec(file, args) {
  try {
    return execFileSync(file, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

// ── 1. 扫描路由（src/app/**/page.tsx） ─────────────────────────────────
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'page.tsx' || entry.name === 'page.jsx') out.push(full);
  }
  return out;
}

const pageFiles = walk(APP_DIR);
if (pageFiles.length === 0) {
  console.warn('[gen-dates] 未在 src/app 下找到任何 page.tsx，跳过生成（保留既有 pageDates.ts）。');
  process.exit(0);
}

const routes = pageFiles.map((file) => {
  const rel = toPosix(path.relative(APP_DIR, path.dirname(file)));
  return {
    route: rel === '' || rel === '.' ? '/' : `/${rel}`,
    file: toPosix(file),
  };
});

// ── 2. git 环境探测（浅克隆 / git 不可用 → 保守模式） ───────────────────
const shallowRaw = tryExec('git', ['rev-parse', '--is-shallow-repository']);
const gitAvailable = shallowRaw !== null || tryExec('git', ['rev-parse', '--git-dir']) !== null;
const isShallow = shallowRaw === null ? true : shallowRaw.trim() === 'true';
const conservative = !gitAvailable || isShallow;
if (conservative) {
  console.log(
    `[gen-dates] 保守模式（${!gitAvailable ? 'git 不可用' : '浅克隆仓库'}）：仅对真实未提交改动的文件使用 mtime，其余沿用历史日期表。`,
  );
}

// ── 3. 工作区改动集合（PORCELAIN）—— ⚠️ 整段输出严禁 trim ───────────────
const dirtyFiles = new Set();
const porcelain = tryExec('git', ['status', '--porcelain', '--untracked-files=all']);
if (porcelain) {
  // ⚠️ 注意：这里故意不做 .trim()，见文件头规则 3。
  for (const rawLine of porcelain.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (!line) continue;
    let target = line.slice(3); // "XY path"
    const arrow = target.indexOf(' -> ');
    if (arrow !== -1) target = target.slice(arrow + 4); // rename: "old -> new"
    target = target.replace(/^"|"$/g, '').trim();
    if (target) dirtyFiles.add(toPosix(target));
  }
}

// ── 4. 历史日期表（保守模式下复用，避免把未改动页面刷成构建日） ─────────
let history = {};
if (fs.existsSync(OUT_FILE)) {
  try {
    const src = fs.readFileSync(OUT_FILE, 'utf8');
    const m = src.match(/PAGE_DATES\s*:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\n\};/);
    if (m) {
      for (const line of m[1].split('\n')) {
        const kv = line.match(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/);
        if (kv) history[kv[1]] = kv[2];
      }
    }
  } catch {
    /* 解析失败则视为无历史 */
  }
}

// ── 5. 单文件日期推导 ─────────────────────────────────────────────────
function dateForFile(relFile) {
  const abs = path.resolve(relFile);
  if (!fs.existsSync(abs)) return null;

  const isDirty = dirtyFiles.has(relFile);
  if (isDirty || conservative) {
    if (isDirty) return formatLocalDate(fs.statSync(abs).mtime);
    // 保守模式 + 未改动：只能沿历史，绝不 fallback mtime（规则 4）
    return history[relFile] ?? null;
  }

  const committed = tryExec('git', ['log', '-1', '--format=%cs', '--', relFile]);
  const iso = committed ? committed.trim() : '';
  return iso || null;
}

function laterOf(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

// ── 6. 汇总输出 ───────────────────────────────────────────────────────
const result = {};
const unresolved = [];

for (const { route, file } of routes) {
  const key = normalizeRoute(route);
  let date = dateForFile(file);

  // 数据依赖：路由绑定的数据文件改动时，路由日期随之更新
  const deps = routeDependencies[route] ?? routeDependencies[key] ?? [];
  for (const dep of deps) {
    date = laterOf(date, dateForFile(toPosix(dep)));
  }

  if (evergreenRoutes.has(key)) date = sitePublished; // 常青页不随构建漂移

  if (!date) date = history[file] ?? history[key] ?? sitePublished;
  if (date === sitePublished && !evergreenRoutes.has(key)) unresolved.push(key);

  result[key] = date;
}

// 保留历史里存在、但本轮未扫描到的键（动态路由实例等），避免日期倒退
for (const [k, v] of Object.entries(history)) {
  if (!(k in result)) result[k] = v;
}
result['/'] = result['/'] || sitePublished;

// Homepage freshness semantics: the date published for "/" is the latest REAL content
// update across the whole site (max of all non-evergreen route dates), not the git/mtime
// date of the homepage file itself. The homepage is the site index page, so its badge,
// JSON-LD dateModified and sitemap lastmod all express when site content last changed.
// Still derived purely from real content changes (git log / dirty-file mtime) - never new Date().
let siteLatest = result["/"] || sitePublished;
for (const k of Object.keys(result)) {
  if (k === "/" || evergreenRoutes.has(k)) continue;
  siteLatest = laterOf(siteLatest, result[k]);
}
result["/"] = siteLatest;

const sortedKeys = Object.keys(result).sort((a, b) => (a === '/' ? -1 : a.localeCompare(b)));
const entries = sortedKeys.map((k) => `  '${k}': '${result[k]}',`).join('\n');

const output = `/**
 * pageDates.ts — 页面内容日期的唯一消费点
 *
 * ⚠️ 本文件由 scripts/gen-content-dates.mjs 自动生成（dev/build 前运行），
 *    **不要手工编辑**。禁止用 new Date() 驱动任何展示/SEO 日期。
 *  生成时间不可作为内容日期 —— 无内容改动时不产生 churn。
 */

export const PAGE_DATES: Record<string, string> = {
${entries}
};

/** 返回 ISO 日期（YYYY-MM-DD）；未知路由回退到站点基线日期，绝不回退到“今天”。 */
export function pageDateIso(path: string): string {
  const normalized = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  return PAGE_DATES[path] ?? PAGE_DATES[normalized] ?? PAGE_DATES['/'];
}

/** 返回展示用日期；固定按 UTC 解析，避免时区跨日错位。 */
export function pageDateFormatted(path: string): string {
  const iso = pageDateIso(path);
  const d = new Date(\`\${iso}T00:00:00Z\`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, output, 'utf8');

console.log(
  `[gen-dates] 已写入 ${OUT_FILE}：${sortedKeys.length} 个路由${conservative ? '（保守模式）' : ''}${
    unresolved.length ? `；${unresolved.length} 个无历史日期 → 回退站点基线` : ''
  }`,
);
