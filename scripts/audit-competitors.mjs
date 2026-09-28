#!/usr/bin/env node
// audit-competitors.mjs — one-click-site-update 竞品「有效性自检」门禁
//
// 根因：Phase 3 旧流程只靠 web_search 的 SERP 标题判断竞品，新候选与已存档都从不被
// 真正 fetch 验证 → 出现「SERP 标题像竞品、实际是死链/域名停放/薄页/他实体」的假竞品，
// 长期累积污染 competitorKbPath（2026-09 实测：quick-scan 建档的站点含未核实断言）。
//
// 本脚本对 competitorKbPath 下每个已存 profile 做自动化复检：
//   1) 站点可达性（HTTP 状态，非 parked/404）
//   2) 内容覆盖度（静态 HTML 是否含目标实体关键词，关键词来自配置/平台兜底，默认 roblox，非仅 SERP 标题）
//   3) 误标/他实体（死链、域名停放、正文主体不是目标游戏）
// 输出每站 verdict，供 agent 决定「保留 / 标 stale / 归档」。
//
// 退出码：始终 0（诊断型，非阻断）——归档动作由 agent 按 SKILL.md Phase 3 自检 SOP 执行。
//   （若想把它当硬门禁跑 --strict，则发现 dead/parked/no-url 时 exit 1。）

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const repo = process.cwd();

// 解析 competitorKbPath（默认 competitor-profiles）
let kb = 'competitor-profiles';
try {
  const cfg = JSON.parse(readFileSync(join(repo, 'update-config.json'), 'utf8'));
  if (cfg && cfg.competitorKbPath) kb = cfg.competitorKbPath;
} catch {
  /* 用默认 */
}
const kbDir = join(repo, kb);

// 实体内容有效性关键词（跨项目可移植）：优先 update-config.competitorAudit.keywords，
// 回退 gameName(+platform)，再回退 gamePlatform（真实平台非 'auto'），最终兜底 roblox。
// 不再硬编码 ghost driver——某项目专属词会误杀他实体项目（如 gakuran 用 roblox 兜底即正确）。
function loadKeywords() {
  try {
    const cfg = JSON.parse(readFileSync(join(repo, 'update-config.json'), 'utf8'));
    if (Array.isArray(cfg.competitorAudit?.keywords) && cfg.competitorAudit.keywords.length)
      return cfg.competitorAudit.keywords.map((k) => String(k).toLowerCase());
    const fromName = [];
    if (cfg.gameName) fromName.push(cfg.gameName);
    if (cfg.platform) fromName.push(cfg.platform);
    if (fromName.length) return fromName.map((k) => String(k).toLowerCase());
    // 平台兜底：仅当 gamePlatform 是真实平台（非 'auto'/空）才采用，避免无效词
    if (cfg.gamePlatform && cfg.gamePlatform !== 'auto')
      return [String(cfg.gamePlatform).toLowerCase()];
  } catch {
    /* 用兜底 */
  }
  // 最终兜底：平台无关，仅 roblox（最常见实体词）；不再硬编码 ghost driver
  return ['roblox'];
}
const KEYWORDS = loadKeywords();

if (!existsSync(kbDir)) {
  console.error(`[audit-competitors] competitorKbPath 不存在: ${kbDir}`);
  process.exit(0);
}

// 收集顶层 .md（排除 _ 开头汇总/机会文件；archive/raw 子目录不扫——只验活跃档）
const files = readdirSync(kbDir).filter(
  (f) => f.endsWith('.md') && !f.startsWith('_')
);

function cleanUrl(raw) {
  return (raw || "").replace(/[`"\u0027<>()[\],;]/g, "").trim();
}

function extractUrl(md) {
  // Every branch now requires a real http(s) URL, so a backtick-wrapped or quoted value can
  // no longer be captured with its wrapper still attached. Before this fix the wrapper went
  // straight into fetch(), which produced bogus unreachable verdicts for live sites.
  const fm = md.match(/^(?:---\s*\n)?[\s\S]*?url:\s*[`"]?(https?:\/\/[^\s`"'>)\]]+)/i);
  if (fm) return cleanUrl(fm[1]);
  const bold = md.match(/\*\*URL\*\*:\s*[`"]?(https?:\/\/[^\s`"'>)\]]+)/i);
  if (bold) return cleanUrl(bold[1]);
  const link = md.match(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/i);
  if (link) return cleanUrl(link[1]);
  // Fallback for profiles whose URL is not inside a labelled field.
  const any = md.match(/https?:\/\/[^\s`"'>)\]]+/i);
  return any ? cleanUrl(any[0]) : null;
}

function stripHtml(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();
}

async function check(url) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    // 2026-09-21：原 UA 自带 compatible; competitor-audit/1.0 字样，会被部分 WAF 直接 403
    // （实测 ride-a-pet.fandom.com），而同一 URL 用系统 curl.exe 带完整浏览器 UA 返回 200。
    // 这里对齐 curl 的浏览器 UA，减少「脚本判 blocked、人工复核却可达」的假阴性。
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timer);
    const buf = await res.text();
    const plain = stripHtml(buf.slice(0, 250000));
    const status = res.status;

    // 401/403/429 = 服务端反爬/WAF/鉴权/限流拦截，站点通常仍存活（如 Cloudflare 对 bot 返回 403），
    // 不应误判 dead（否则合法竞品站被误归档）。404/410/5xx 才是真死链/宕机。
    if (status === 401 || status === 403 || status === 429)
      return { status, verdict: 'blocked', reason: `HTTP ${status}（疑似 WAF/反爬拦截，站点通常仍存活）：请优先用系统 curl.exe 带完整浏览器 UA 复核 —— 实测同一 URL 下 node fetch 被 403、curl.exe 返回 200（ride-a-pet.fandom.com 2026-09-21）。复核可达 → 保留该 profile 并把 validatedAt 更新为复核日；确不可达 → 归档。` };
    if (status >= 400) return { status, verdict: 'dead', reason: `HTTP ${status}` };

    // 域名停放 / 待售页
    if (
      /domain (for sale|is for sale)|buy this domain|sedoparking|parkingcrew|this domain (is|was) (available|registered)|域名|is available for purchase|aftermarket/i.test(
        plain
      )
    ) {
      return { status, verdict: 'parked', reason: 'parked / for-sale page' };
    }

    // 实体覆盖校验：静态 HTML 是否含任一目标实体关键词（否则交付 agent 手动 web_fetch 复核）
    const covered = KEYWORDS.filter((k) => plain.includes(k));
    if (covered.length === 0) {
      // 静态 HTML 无目标实体词：可能是 SPA（内容靠 JS 渲染）→ 交 agent 手动 web_fetch 复核
      return {
        status,
        verdict: 'no-gd-static',
        reason: `HTTP 200 但静态 HTML 无目标实体关键词 (${KEYWORDS.join(' / ')})（可能 SPA，需 web_fetch 手动复核）`,
      };
    }
    if (/cheat|hack|exploit|script (for|to get)/i.test(plain) && covered.length === 0) {
      return { status, verdict: 'flagged-cheat', reason: '疑似外挂/作弊站（诚信红线）' };
    }
    return {
      status,
      verdict: 'valid',
      reason: `覆盖目标实体 (${covered.join(' / ')})`,
    };
  } catch (e) {
    return {
      status: 0,
      verdict: 'unreachable',
      reason: e.name === 'AbortError' ? 'timeout (>9s)' : e.message,
    };
  }
}

const rows = [];
for (const f of files) {
  const md = readFileSync(join(kbDir, f), 'utf8');
  const url = extractUrl(md);
  if (!url) {
    // 无 url 的顶层 md：多为「聚合研究笔记」（多站、无单 url frontmatter），
    // 不是单站 profile，不应判 no-url invalid 被误归档。
    // 单站 profile 由 Phase 3 建档强制字段保证含 url；漏 url 的 profile 本不该存在。
    // 此处温和判为 note 跳过，提示补 url 或移入 notes/ 子目录，避免污染 archive。
    // （2026-09-04 animalhospital 实测：聚合笔记被误判 no-url invalid → 误归档）
    rows.push({
      file: f,
      url: '(none)',
      status: 0,
      verdict: 'note',
      reason: '无 url，疑似聚合研究笔记而非单站 profile，跳过审计（若确为竞品 profile 请补 url: frontmatter，或移入 notes/ 子目录）',
    });
    continue;
  }
  const r = await check(url);
  rows.push({ file: f, url, ...r });
}

// 输出表
console.log('\n=== 竞品有效性自检 (audit-competitors) ===');
console.log('KB:', kb, '| 活跃 profile 数:', files.length, '| 实体关键词:', KEYWORDS.join(' / '));
console.log('---------------------------------------------------------------');
for (const r of rows) {
  console.log(
    `${r.verdict.padEnd(16)} | ${r.file.padEnd(34)} | ${r.url.padEnd(40)} | ${r.reason}`
  );
}

const tally = {};
for (const r of rows) tally[r.verdict] = (tally[r.verdict] || 0) + 1;
const invalid = rows.filter((r) =>
  ['dead', 'parked', 'no-url', 'flagged-cheat'].includes(r.verdict)
);
const needsReview = rows.filter((r) => r.verdict === 'no-gd-static' || r.verdict === 'unreachable' || r.verdict === 'blocked');

console.log('---------------------------------------------------------------');
console.log(
  'SELFCHECK: valid=' + (tally.valid || 0) +
    ' needs-review=' + needsReview.length +
    ' invalid=' + invalid.length +
    ' (' + Object.entries(tally).map(([k, v]) => `${k}=${v}`).join(' ') + ')'
);
if (invalid.length) {
  console.log('\n❌ INVALID（agent 必须归档进 competitorKbPath/archive/ 并附 reason）：');
  for (const r of invalid) console.log('   - ' + r.file + ' :: ' + r.url + ' :: ' + r.reason);
}
if (needsReview.length) {
  console.log('\n⚠️  NEEDS-MANUAL-REVIEW（agent 须复核内容是否真覆盖本游戏实体；blocked 项优先用 curl.exe 复核）：');
  for (const r of needsReview) console.log('   - ' + r.file + ' :: ' + r.url + ' :: ' + r.reason);
}
console.log('');

// --strict：发现明确 invalid 即非零退出（可选硬门禁）
if (process.argv.includes('--strict') && invalid.length) process.exit(1);
process.exit(0);
