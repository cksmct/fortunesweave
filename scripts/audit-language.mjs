/**
 * audit-language.mjs —— 站点内容语言门禁（Site Content Language Gate）
 *
 * ── 为什么存在（2026-09-21 事故，根因固化）─────────────────────────────
 * 症状：一个"英文单语"站的首页与 28 个兵种页渲染出中文。
 * 根因：数据文件（src/data 下的 json）的**内容字段**被 agent 用**工作语言（中文）**写成，
 *       而调用它们的页面文案是英文。两者都过了既有全部门禁 —— 因为：
 *         · audit-thin-content 的分词正则只认 [A-Za-z0-9]，中文贡献 0 个词，
 *           页面靠英文样板凑够 500 词就"通过"了；
 *         · audit-content-integrity 只比对事实来源与数值，不看语言；
 *         · 没有任何一道门禁检查语言。
 * 结论：**缺少语言门禁 ≠ 语言没问题**。本脚本即为永久防线。
 *
 * ── 权威值来源 ─────────────────────────────────────────────────────
 * 站点内容语言读 update-config.json#siteLanguage（缺省读 game.config.json#seo.lang，
 * 再缺省 = 'en'）。'en' 及任何拉丁字母语言下调为"CJK 字符出现即失败"。
 * 若站点本身是 zh/ja/ko，本门禁自动跳过（不做反向检查，避免误伤）。
 *
 * ── 两道扫描 ───────────────────────────────────────────────────────
 *   1) 源码层：src/data 下所有 json 的渲染字段（跳过 _ 开头的内部键，如 _comment）
 *   2) 产物层：out 目录下所有 html —— 爬虫真正看到的文本，最终真相
 * 命中任一即 exit 1，阻断构建。
 *
 * 用法：node scripts/audit-language.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CJK = /[\u3000-\u303f\u3040-\u30ff\u4e00-\u9fff\uff00-\uffef]/;
const CJK_LANGS = ['zh', 'ja', 'ko'];

function readJsonSafe(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

let siteLanguage = 'en';
const cfg = readJsonSafe(path.join(ROOT, 'update-config.json'));
if (cfg && typeof cfg.siteLanguage === 'string' && cfg.siteLanguage.trim()) {
  siteLanguage = cfg.siteLanguage.trim().toLowerCase();
} else {
  const game = readJsonSafe(path.join(ROOT, 'src', 'data', 'game.config.json'));
  const lang = game && game.seo && game.seo.lang;
  if (typeof lang === 'string' && lang.trim()) siteLanguage = lang.trim().toLowerCase();
}

const base = siteLanguage.split('-')[0];
if (CJK_LANGS.indexOf(base) >= 0) {
  console.log('\n================ 🌐 LANGUAGE GATE ================');
  console.log(`站点内容语言 = '${siteLanguage}'（CJK 语言）→ 本门禁跳过。`);
  console.log('==================================================\n');
  process.exit(0);
}

const problems = [];

// ── 1. 数据文件渲染字段 ────────────────────────────────────────────
function scanJson(file) {
  const data = readJsonSafe(file);
  if (!data) return;
  const visit = (node, trail) => {
    if (typeof node === 'string') {
      if (CJK.test(node)) problems.push({ where: path.relative(ROOT, file), loc: trail, text: node.slice(0, 60) });
      return;
    }
    if (Array.isArray(node)) { node.forEach((v, i) => visit(v, trail + '[' + i + ']')); return; }
    if (node && typeof node === 'object') {
      for (const k of Object.keys(node)) {
        if (k.startsWith('_')) continue; // _comment 等内部键不渲染，允许保留工作语言
        visit(node[k], trail ? trail + '.' + k : k);
      }
    }
  };
  visit(data, '');
}
const dataDir = path.join(ROOT, 'src', 'data');
if (existsSync(dataDir)) {
  for (const entry of readdirSync(dataDir)) {
    if (entry.endsWith('.json')) scanJson(path.join(dataDir, entry));
  }
}

// ── 2. 静态产物 HTML ──────────────────────────────────────────────
function walkHtml(dir, out) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry === '_next') continue;
      walkHtml(p, out);
    } else if (entry.endsWith('.html')) out.push(p);
  }
  return out;
}
const htmlFiles = walkHtml(path.join(ROOT, 'out'), []);
for (const file of htmlFiles) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (CJK.test(lines[i])) {
      problems.push({ where: path.relative(ROOT, file), loc: 'line ' + (i + 1), text: lines[i].trim().slice(0, 60) });
      break;
    }
  }
}

console.log('\n================ 🌐 LANGUAGE GATE ================');
console.log(`站点内容语言 = '${siteLanguage}'   数据字段扫描 + 产物 HTML 扫描（${htmlFiles.length} 页）`);
if (problems.length === 0) {
  console.log('✅ 0 issue — 全站渲染文本语言一致，无越界字符。');
  console.log('==================================================\n');
  process.exit(0);
}
console.error(`❌ 发现 ${problems.length} 处与站点语言不符的渲染文本：`);
for (const p of problems.slice(0, 40)) console.error(`   - ${p.where} [${p.loc}] ${p.text}`);
console.error('');
console.error('本站内容语言为 ' + siteLanguage + '，以上文本出现在渲染位置。');
console.error('修法（遵守单一源头原则）：**直接依据原始证据（官方 API / 字幕 / 竞品页面）用站点语言改写该字段**，');
console.error('不要先用自己的工作语言写一遍再翻译 —— 往返转述会叠加失真，且中文在分词门禁里等于 0 个词，不会被发现。');
console.error('==================================================\n');
process.exit(1);
