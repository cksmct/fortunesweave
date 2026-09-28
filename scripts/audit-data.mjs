/**
 * audit-data.mjs — 数据新鲜度自动审核（通用跨项目模板）
 * ──────────────────────────────────────────────────────────────
 * 由 `npm run build` / `npm run dev` 自动前置执行，非阻塞（只警告不中断）。
 * 建站第一天复制到项目 `scripts/audit-data.mjs` 并挂载 package.json。
 *
 * 解决了这类历史事故的 root cause：游戏更新后 codes/units 数据没有自动复核信号。
 * 适用项目形态：Next.js 静态站 + `src/data/gameStats.ts`（Roblox 数据核实产物）
 *   + `src/data/pageDates.ts` / `generatedContentDates.ts`（Git 驱动日期系统）。
 *
 * 检查项：
 *  1. gameStats.ts 的 verifiedDate：statsRefresh=local 项目必须 == 今天（否则 ❌ 硬阻断，
 *     防止陈旧数据随构建上线）；ci/auto 项目仅相距 > 14 天 → ⚠️ 需要重新抓取核实
 *  2. 游戏 updated 时间戳晚于 /codes/ 页 lastModified → ⚠️ 游戏已更新，codes 可能过时
 *     （"Origins 被错误标记 expired 6 天" 事故的直接护栏）
 *  3. 未来日期检测：pageDates.ts 中出现晚于今天的日期 → ❌ 错误（时区/伪造污染）
 *  4. siteLastModified 距今 > 90 天 → ⚠️ 全站内容长期未更新
 *  5. codes.ts 活跃代码过少 → ⚠️ 数据完整性格栅
 *
 * 用法：
 *    node scripts/audit-data.mjs            # 普通模式（警告不中断）
 *    node scripts/audit-data.mjs --strict   # 严格模式（有警告即 exit 1，CI 用）
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const warnings = [];
const errors = [];

/** 从 TS 文件用正则提取字符串字面量（gameStats.verifiedDate 等） */
function readTsString(file, key) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return null;
  const content = fs.readFileSync(p, 'utf8');
  const re = new RegExp(`${key}\\s*[:=]\\s*['"]([^'"]+)['"]`);
  const m = content.match(re);
  return m ? m[1] : null;
}

/** 从 pageDates.ts 解析 pageDates 对象（ISO 日期字符串） */
function readPageDates() {
  const p = path.join(ROOT, 'src', 'data', 'pageDates.ts');
  if (!fs.existsSync(p)) return null;
  const content = fs.readFileSync(p, 'utf8');
  const m = content.match(/export const pageDates:\s*Record<string, string>\s*=\s*(\{[\s\S]*?\});/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/** 距今天数 */
function daysSince(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ── 0. 数据刷新责任模式（local / ci / auto）─────────────────────────
// local：one-click 是唯一刷新路径，今天没刷新即缺陷（硬阻断，见下方检查项 1）。
// ci / auto(探测为 ci)：由远程 CI 负责，本地不强制当天，仅保留 14 天宽松警告。
let STATS_REFRESH = 'auto';
try {
  const uc = JSON.parse(readFileSync(path.join(ROOT, 'update-config.json'), 'utf8'));
  if (uc.statsRefresh) STATS_REFRESH = String(uc.statsRefresh);
} catch { /* 缺配置按 auto */ }

function todayStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

// ── 1. gameStats 数据新鲜度（模式感知，2026-09-27 事故修复）─────────
const verifiedDate = readTsString('src/data/gameStats.ts', 'verifiedDate');
if (verifiedDate) {
  const days = daysSince(verifiedDate);
  if (days === null) {
    warnings.push(`gameStats.verifiedDate "${verifiedDate}" 无法解析为日期`);
  } else if (STATS_REFRESH === 'local') {
    // local 项目：今天没刷新 = 缺陷，硬阻断（不再只是 >14 天警告）。
    // 直接构建就会把昨天甚至更旧的数据烤进 out/ 上线，必须由审计拦下。
    if (verifiedDate !== todayStr()) {
      errors.push(
        `statsRefresh=local 项目：verifiedDate (${verifiedDate}) 不等于今天 (${todayStr()}) —— ` +
        `本地 scrape-stats 未运行/未写回，陈旧数据将随构建上线（应先运行 "npm run scrape-stats" 再 build）`
      );
    }
  } else if (days > 14) {
    warnings.push(`gameStats.verifiedDate (${verifiedDate}) 距今 ${days} 天 > 14 天 —— 需运行 "npm run scrape-stats" 重新核实游戏数据`);
  }
} else {
  warnings.push('src/data/gameStats.ts 缺少 verifiedDate —— 数据核实流程未落地');
}

// ── 2. 游戏更新信号 → codes 复核提示（核心护栏）────────────────────
const updated = readTsString('src/data/gameStats.ts', 'updated');
const pageDates = readPageDates();
const codesLastMod = pageDates && pageDates['/codes/'];
if (updated && codesLastMod) {
  const updatedDate = updated.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(updatedDate) && updatedDate > codesLastMod) {
    warnings.push(
      `游戏已更新 (gameStats.updated=${updatedDate})，晚于 /codes/ 页 lastModified (${codesLastMod})` +
      ` —— codes 可能已过时，请交叉验证 activeCodes/expiredCodes 后再发布`
    );
  }
} else if (updated && !codesLastMod) {
  warnings.push('src/data/pageDates.ts 缺少 /codes/ 日期，无法做游戏更新→codes 复核联动');
}

// ── 3. 未来日期检测（时区/伪造污染护栏）────────────────────────────
if (pageDates) {
  const today = todayIso();
  for (const [route, d] of Object.entries(pageDates)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d > today) {
      errors.push(`pageDates[${route}] = ${d} 是未来日期（今天 ${today}）—— 可能被伪造或 UTC 污染`);
    }
  }
}

// ── 4. 全站最后更新日期健康度 ─────────────────────────────────────
const siteLastModified = readTsString('src/data/generatedContentDates.ts', 'siteLastModified') ||
                        readTsString('src/data/pageDates.ts', 'siteLastModified');
if (siteLastModified) {
  const days = daysSince(siteLastModified);
  if (days !== null && days > 90) {
    warnings.push(`siteLastModified (${siteLastModified}) 距今 ${days} 天 > 90 天 —— 全站内容长期未更新`);
  }
}

// ── 5. codes 数据完整性格栅 ────────────────────────────────────────
const codesPath = path.join(ROOT, 'src', 'data', 'codes.ts');
if (fs.existsSync(codesPath)) {
  const codesContent = fs.readFileSync(codesPath, 'utf8');
  const activeCount = (codesContent.match(/code:\s*['"]/g) || []).length;
  if (activeCount < 3) {
    warnings.push(`codes.ts 活跃代码仅 ${activeCount} 个，请核实数据完整性`);
  }
}

// ── 汇总输出 ───────────────────────────────────────────────────────
console.log('\n--- 📊 Data Freshness Audit ---');
console.log(`verifiedDate:  ${verifiedDate ?? 'N/A'}`);
console.log(`game updated:  ${updated ?? 'N/A'}`);
console.log(`codes lastMod: ${codesLastMod ?? 'N/A'}`);

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} ERROR(S) (future dates / corruption):`);
  for (const e of errors) console.error(`   - ${e}`);
}

if (warnings.length > 0) {
  console.warn(`\n⚠️ ${warnings.length} WARNING(S):`);
  for (const w of warnings) console.warn(`   - ${w}`);
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ DATA FRESHNESS OK: no stale or contradictory signals detected.');
}

// 错误（未来日期/损坏）永远阻断；警告在 --strict 下阻断，否则仅提示
if (errors.length > 0 || (STRICT && warnings.length > 0)) {
  process.exit(1);
}
