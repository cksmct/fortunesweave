/**
 * audit-trend-coverage.mjs — 趋势词覆盖自动审核（通用跨项目模板）
 * ──────────────────────────────────────────────────────────────
 * 由 `npm run build` / `npm run dev` 自动前置执行，非阻塞（只警告不中断）。
 * 建站第一天复制到项目 `scripts/audit-trend-coverage.mjs` 并挂载 package.json。
 *
 * 解决了这类历史事故的 root cause：趋势词判定是一次性人工动作，
 * 页面缺少关键词（如 Secret Units 页缺 "madara anime origins"）无人发现。
 *
 * 数据源：项目内 `scripts/trend-keywords.json`（由趋势词判定流程维护）：
 * {
 *   "version": "2026-08-25",
 *   "keywords": [
 *     { "query": "madara anime origins", "target": "src/app/secret-units/page.tsx", "min": 1 },
 *     { "query": "anime origins wiki",    "target": "src/app/page.tsx",              "min": 1 }
 *   ]
 * }
 *
 * 检查逻辑：query 字符串在 target 文件内容中出现的次数 ≥ min。
 *   - target 路径支持 glob（如 "src/app/任意子目录/page.tsx"，写法见 glob 示例，勿在注释内使用星号+斜杠序列）
 *   - query 支持正则（以 "/" 开头和结尾，如 "/how to get madara/i"）
 *
 * 用法：
 *    node scripts/audit-trend-coverage.mjs            # 普通模式（警告不中断）
 *    node scripts/audit-trend-coverage.mjs --strict   # 严格模式（有缺失即 exit 1，CI 用）
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const CONFIG = path.join(ROOT, 'scripts', 'trend-keywords.json');

if (!fs.existsSync(CONFIG)) {
  console.log('\n--- 🔍 Trend Coverage Audit ---');
  console.log(`ℹ️  scripts/trend-keywords.json 不存在，跳过趋势词覆盖检查。`);
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const warnings = [];
const errors = [];

/** glob 展开（支持 * 与 **，简单实现） */
function expandGlob(pattern) {
  const absolute = path.join(ROOT, pattern);
  if (!absolute.includes('*')) {
    return fs.existsSync(absolute) ? [absolute] : [];
  }
  const results = [];
  const base = pattern.split('*')[0];
  const walk = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = path.posix.join(prefix, entry.name);
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel);
      } else if (entry.isFile()) {
        // 简单 glob 匹配：把 pattern 转成正则
        const re = new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '__DOUBLE__').replace(/\*/g, '[^/]*').replace(/__DOUBLE__/g, '.*') + '$');
        if (re.test(rel)) results.push(full);
      }
    }
  };
  walk(path.join(ROOT, base.split('/').slice(0, -1).join('/') || '.'), base.split('/').slice(0, -1).join('/'));
  return results;
}

function toRegExp(query) {
  const match = /^\/([\s\S]*)\/([a-z]*)$/.exec(query);
  if (match) return new RegExp(match[1], match[2]);
  return new RegExp(query.replace(/[.*+?^${}()|[\]\\\\]/g, "\\\\$&"), "i");
}
for (const kw of config.keywords || []) {
  const { query, target, min = 1 } = kw;
  const files = expandGlob(target);
  if (files.length === 0) {
    warnings.push(`[${query}] 目标文件不存在或未匹配: ${target}`);
    continue;
  }
  const re = /^\/([\s\S]*)\/[a-z]*$/.test(query)
    ? toRegExp(query)
    : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  let hitCount = 0;
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    hitCount += (content.match(re) || []).length;
  }
  if (hitCount < min) {
    errors.push(`[${query}] 在 ${target} 中出现 ${hitCount} 次，低于要求 ${min} —— 趋势词未被页面覆盖，请写入 H1/正文/FAQ（严禁只写废弃的 meta keywords）`);
  }
}

console.log('\n--- 🔍 Trend Coverage Audit ---');
console.log(`趋势词清单版本: ${config.version ?? 'N/A'}，共 ${(config.keywords || []).length} 个词`);

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} MISSING KEYWORD(S):`);
  for (const e of errors) console.error(`   - ${e}`);
}

if (warnings.length > 0) {
  console.warn(`\n⚠️ ${warnings.length} WARNING(S):`);
  for (const w of warnings) console.warn(`   - ${w}`);
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ TREND COVERAGE OK: all trend keywords present in target pages.');
}

if (errors.length > 0 || (STRICT && warnings.length > 0)) {
  process.exit(1);
}
