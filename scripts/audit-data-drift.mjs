#!/usr/bin/env node
/**
 * audit-data-drift.mjs — 数据漂移（Data Drift）一键检测器
 * ──────────────────────────────────────────────────────────────
 * 根因：页面把“自动生成 / 抓取的数据值”（badges.ts、gameStats.ts、
 * gamepasses.json、similarGames.ts、codes.json …）写成 prose / FAQ / JSX 文案里
 * 的字面常量。当 scraper 重算数据模块时，手写文案不会跟着变，于是文案与
 * 实时数据表自相矛盾（例如 badges.ts 已是 0.33%，页面 prose 还写着 0.29%）。
 *
 * 本脚本从 src/data 下所有数据文件抽取“有意义的”数值字面量，再去页面/组件
 * 源码里 grep 同一字面量。任何出现在数据层之外的命中 = 潜在的漂移 bug。
 *
 * 用法：
 *   node audit-data-drift.mjs                # 报告；发现漂移则 exit 1
 *   node audit-data-drift.mjs --no-fail      # 只报告，永远 exit 0
 *   node audit-data-drift.mjs --json         # 机器可读
 *   node audit-data-drift.mjs --fix          # 额外生成 DATA_DRIFT_FIXES.md 修复清单
 *
 * 接入 prebuild（见 roblox-site-architect / indie-game-site-architect）：
 *   "prebuild": "node scripts/audit-data-drift.mjs && ..."
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARGS = new Set(process.argv.slice(2));
const NO_FAIL = ARGS.has('--no-fail');
const AS_JSON = ARGS.has('--json');
const DO_FIX = ARGS.has('--fix');

// 默认排除的“配置/非数据”文件（游戏名、路由、SEO、日期系统等不是抓取产物）
const EXCLUDE_DATA_FILE = /(pageDates|site|config|seo|nav|routes|menu|footer|header|layout)/i;
// 扫描命中时跳过这些“已经是动态绑定”的标记，避免误报已修好的页面
const ALREADY_DYNAMIC = /\{?\s*(pctOf|holdersOf|gameStats|badges|similarGames|gamepasses|codes|badgeByName|driftMultiple)\b/;
// 噪声值：过于常见，几乎一定是巧合而非真实漂移
const NOISE_VALUES = new Set(['100', '0', '1', '1000']);

const MIN_INT = 100; // 整数阈值，过滤小常量

// ── 1. 收集数据文件 ──────────────────────────────────────────────
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?|mjs|json)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const dataFiles = walk(path.join(ROOT, 'src', 'data')).filter(
  (f) => !EXCLUDE_DATA_FILE.test(path.basename(f)) && /\.(ts|json)$/.test(f)
);

// ── 2. 从数据文件抽取数值字面量 + 字段名 + 友好名 ─────────────────
const NUM_RE = /(["']?)(\w+)\1\s*:\s*(-?\d+(?:\.\d+)?)/g;
const NAME_RE = /name["']?\s*:\s*["']([^"']+)["']/;

function interesting(valueStr) {
  const v = Number(valueStr);
  if (!Number.isFinite(v)) return false;
  if (NOISE_VALUES.has(valueStr)) return false;
  if (Number.isInteger(v)) {
    if (v >= 1900 && v <= 2100) return false; // 疑似年份
    return Math.abs(v) >= MIN_INT;
  }
  // 小数：至少 2 位有效数字
  const sig = valueStr.replace(/^0\./, '').replace(/0+$/, '').replace('.', '');
  return sig.length >= 2;
}

// index: literal -> [{ file, field, name, raw }]
const index = new Map();
function addLiteral(literal, info) {
  if (!index.has(literal)) index.set(literal, []);
  index.get(literal).push(info);
}

for (const file of dataFiles) {
  const content = fs.readFileSync(file, 'utf8');
  NUM_RE.lastIndex = 0;
  let m;
  while ((m = NUM_RE.exec(content)) !== null) {
    const field = m[2];
    const valueStr = m[3];
    if (!interesting(valueStr)) continue;
    // 稳定标识符（universeId / placeId / slug 等）不会"漂移"，不算数据漂移
    if (/(id|universe|place|slug)$/i.test(field)) continue;
    // width/height（如 events.json 的 coverWidth/coverHeight）是**布局常量**，不是抓取产物：
    // 它们只在图片被重新生成时才变，且 420/304/236 这类数字在 Tailwind/JSS 常量里大量出现。
    // 一旦纳入索引，源码中任何同数字的写法都会被误报成漂移 —— 2026-09-17 实测：
    // 单是 events.json 新增一个 coverWidth: 420，就让 prebuild 直接 exit 1 阻断构建，
    // 而命中点是 lib/text.ts 里一个毫不相干的 `DEFAULT_MAX_CHARS = 420`。
    if (/(id|universe|place|slug|width|height|order|chapter)$/i.test(field)) continue;
    // 向前找友好名（name 字段）
    const before = content.slice(Math.max(0, m.index - 400), m.index);
    const nm = before.match(NAME_RE);
    const name = nm ? nm[1] : undefined;
    addLiteral(valueStr, {
      file: path.relative(ROOT, file),
      field,
      name,
      raw: valueStr,
    });
    // 同时登记逗号格式化形态（文案里常写成 247,931）
    const comma = valueStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (comma !== valueStr) {
      addLiteral(comma, { file: path.relative(ROOT, file), field, name, raw: valueStr, commaForm: true });
    }
  }
}

// ── 3. 扫描页面/组件源码 ────────────────────────────────────────
const SCAN_DIRS = ['src/app', 'src/components', 'src/lib'].map((d) => path.join(ROOT, d));
// 广告 / UI 配置组件：其内部常量（zone ID、兜底毫秒数、广告尺寸等）本就不是游戏数据，
// 不参与漂移检查。新增广告组件时，若文件名不含下列关键词，务必把文件名追加进本正则，
// 否则构建期会被误报为漂移并 exit 1（详见 SKILL.md「非内容代码的豁免」）。
const EXCLUDE_SCAN_FILE = /(AdBanner|BottomBannerAd|adsterra|AdWrapper|SideAdSlots|NativeBannerAd|Monetag|Vignette|InPagePush|Popunder|Skyscraper|Propeller|Galaksion|AdSense|HeroMediaFacade|Header|Footer|consent)/i;
const hits = [];

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 预先编译正则，避免每行重复构造上千次 RegExp
const compiledLiterals = Array.from(index.entries()).map(([literal, infos]) => ({
  literal,
  infos,
  re: new RegExp(`\\b${esc(literal)}\\b`, 'g'),
}));

for (const dir of SCAN_DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = walk(dir).filter(
    (f) =>
      !f.includes(path.join('src', 'data')) &&
      !EXCLUDE_SCAN_FILE.test(path.basename(f)) &&
      /\.(tsx?|jsx?|mjs)$/.test(f)
  );
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      // 快速短路：不包含数字的行绝不可能匹配数据字面量
      if (!/\d/.test(line)) return;
      if (ALREADY_DYNAMIC.test(line)) return;
      for (const { literal, infos, re } of compiledLiterals) {
        re.lastIndex = 0;
        let mm;
        while ((mm = re.exec(line))) {
          // Tailwind 类名（px-2.5 / py-1.5 / gap-2.5）里的数字不是数据，跳过
          const before = line[mm.index - 1];
          const after = line[mm.index + mm[0].length];
          if (before === '-' || after === '-') {
            continue;
          }
          hits.push({
            file: path.relative(ROOT, file),
            line: i + 1,
            text: line.trim(),
            literal,
            sources: [...new Set(infos.map((x) => `${x.file} → ${x.field}${x.name ? ` (${x.name})` : ''}`))],
          });
          return; // 一行只报一次
        }
      }
    });
  }
}

// ── 4. 输出 ────────────────────────────────────────────────────
if (AS_JSON) {
  console.log(JSON.stringify({ driftCount: hits.length, hits }, null, 2));
} else {
  console.log('\n--- 🔍 Data Drift Audit ---');
  console.log(`数据文件: ${dataFiles.length} 个，被追踪数值: ${index.size} 个`);
  if (hits.length === 0) {
    console.log('✅ 未发现数据漂移：页面文案未硬编码任何自动生成的数据值。');
  } else {
    console.warn(`\n⚠️ 发现 ${hits.length} 处疑似数据漂移（文案硬编码了数据值）：`);
    for (const h of hits) {
      console.warn(`\n  📄 ${h.file}:${h.line}`);
      console.warn(`     文案: ${h.text.slice(0, 140)}`);
      console.warn(`     命中值: ${h.literal}  ←  数据源: ${h.sources.join(' | ')}`);
    }
    console.warn('\n💡 修复：把这些字面量改为从数据模块动态取值（见 data-drift-checker 技能的“动态绑定”重构法）。');
  }
}

// 可选：生成修复清单
if (DO_FIX && hits.length > 0) {
  const md = ['# Data Drift 修复清单', '', '由 `audit-data-drift.mjs --fix` 生成。逐条把文案里的字面量改为从数据模块动态取值。', ''];
  for (const h of hits) {
    md.push(`## ${h.file}:${h.line}`);
    md.push(`- 命中值: \`${h.literal}\``);
    md.push(`- 数据源: ${h.sources.join(' | ')}`);
    md.push(`- 当前文案: \`${h.text}\``);
    md.push(`- 改法：用数据访问器替换字面量（如 \`badgeByName['${h.sources[0].match(/\(([^)]+)\)/)?.[1] ?? 'NAME'}'].${h.sources[0].split('→')[1]?.trim().split(' ')[0]}\`），不要在文案里写死数字。`);
    md.push('');
  }
  fs.writeFileSync(path.join(ROOT, 'DATA_DRIFT_FIXES.md'), md.join('\n'), 'utf8');
  console.warn(`\n📝 已生成 DATA_DRIFT_FIXES.md（${hits.length} 条）`);
}

process.exit(hits.length > 0 && !NO_FAIL ? 1 : 0);
