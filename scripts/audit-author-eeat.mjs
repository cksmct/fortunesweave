#!/usr/bin/env node
/**
 * audit-author-eeat.mjs — 署名身份 & E-E-A-T 完整性审计（可一键修复）
 *
 * 背景：脚手架技能（eeat-author-timestamp / roblox-site-architect / indie-game-site-architect）
 * 长期默认输出 `author = "${game.name} Team"` + 只发 Organization(且 name = 游戏名) 的结构化数据，
 * 导致粉丝站既没有可追责的作者实体，又把"游戏本体"标成了自己的出版方。
 * 本脚本在建站/构建期把这类缺陷拦在上线前。
 *
 * 用法：
 *   node scripts/audit-author-eeat.mjs                # 审计（error → exit 1）
 *   node scripts/audit-author-eeat.mjs --strict       # warning 也阻断
 *   node scripts/audit-author-eeat.mjs --fix --author "CT" --role "Founder & Lead Editor"
 *                                                     # 自动修复确定性缺陷（会写 .bak 备份）
 *   node scripts/audit-author-eeat.mjs --json         # 机器可读输出
 *
 * 自动修复范围（确定性、可回滚）：
 *   1. GEN_DATES_TRIM_BUG：gen-content-dates.mjs 的 porcelain `.trim()` 首行截断缺陷
 *   2. AUTHOR_GENERIC / AUTHOR_SCHEMA_ORG_ONLY / NO_DISAMBIGUATION：
 *      仅在显式传入 --author 时改写站点常量与页面级 JSON-LD author
 * 其余项只报告（改动需人工判断，避免误伤文案）。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
};

const FIX = has("--fix");
const JSON_OUT = has("--json");
const STRICT = has("--strict");
const SET_AUTHOR = val("--author");
const SET_ROLE = val("--role") || "Founder & Lead Editor";
const SET_ORG = val("--org");

const SKIP_DIRS = new Set([
  "node_modules", ".next", "out", "dist", "build", ".git", ".codebuddy",
  "coverage", ".turbo", "public", ".vercel", "update-inbox", "archive",
]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"]);
const SEARCH_ROOTS = ["src", "scripts", "app", "components", "data", "lib", "config"];

/* ------------------------------------------------------------------ utils */

function walk(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name) || e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (EXTS.has(path.extname(e.name))) acc.push(full);
  }
  return acc;
}

function collectFiles() {
  const roots = SEARCH_ROOTS.map((r) => path.join(ROOT, r)).filter((p) => fs.existsSync(p));
  if (!roots.length) return [];
  const out = [];
  for (const r of roots) {
    if (fs.statSync(r).isDirectory()) out.push(...walk(r));
    else if (EXTS.has(path.extname(r))) out.push(r);
  }
  // 去重并转相对路径；排除审计器自身与备份文件（否则规则字符串会被自己命中）
  return [...new Set(out)]
    .filter((f) => !/audit-author-eeat/i.test(path.basename(f)) && !f.endsWith(".bak"))
    .map((f) => ({ abs: f, rel: path.relative(ROOT, f).replace(/\\/g, "/"), text: safeRead(f) }));
}

function safeRead(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function lineOf(text, idx) {
  return text.slice(0, Math.max(0, idx)).split("\n").length;
}

/** 从 startIdx 起做花括号配对，返回 {start, end, block} */
function balanced(text, startIdx) {
  const open = text.indexOf("{", startIdx);
  if (open < 0) return null;
  let depth = 0;
  let inStr = null;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") inStr = c;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return { start: open, end: i, block: text.slice(open, i + 1) };
    }
  }
  return null;
}

/**
 * Read a string-valued field out of a code block, tolerating BOTH key styles:
 * JSON (
"name"
 with a quoted key) and JSON5 / TS (name). The previous version only matched an
 * unquoted key, so every object written in JSON style looked like it had no name at all -
 * which is why a perfectly attributed site was reported as AUTHOR_MISSING.
 * A field whose value is an expression (name: config.game.developer) returns null on purpose:
 * that is not a string literal.
 */
function firstStringField(block, field) {
  const Q = String.fromCharCode(34) + String.fromCharCode(39);
  const BT = String.fromCharCode(96);
  const re = new RegExp(field + "[" + Q + "]?" + "\\s*:\\s*([" + Q + BT + "])");
  const m = block.match(re);
  if (!m) return null;
  const quote = m[1];
  const from = m.index + m[0].length;
  const to = block.indexOf(quote, from);
  if (to < 0) return null;
  return block.slice(from, to);
}

/**
 * Quote-agnostic @type matching (2026-09-23 repair).
 * The AuthorBanner template shipped with this skill is written in prettier single-quote style
 * (@type Person), while the old audit only accepted JSON-style double quotes. Result: compliant
 * projects were reported as NO_AUTHOR_ENTITY (false positive), and genuinely anonymous
 * Organization blocks written in single-quote style were invisible (false negative).
 */
const QT = String.fromCharCode(34) + String.fromCharCode(39);
const QMARK = "[" + QT + "]";
const OPTQ = QMARK + "?";
const TYPE_RE_CACHE = new Map();
function typeRegex(type, flags = "g") {
  const key = type + flags;
  if (!TYPE_RE_CACHE.has(key)) {
    TYPE_RE_CACHE.set(key, new RegExp(QMARK + "@type" + QMARK + "\\s*:\\s*" + QMARK + type + QMARK, flags));
  }
  return TYPE_RE_CACHE.get(key);
}
function hasType(text, type) {
  return typeRegex(type, "").test(text);
}
function countType(text, type) {
  return (text.match(typeRegex(type, "g")) || []).length;
}
/** Key match for an author block, tolerating quoted JSON keys. */
const AUTHOR_KV_RE = new RegExp(OPTQ + "author" + OPTQ + "\\s*[:=]\\s*\\{");
/**
 * Strip comments before text-matching for anti-patterns (2026-09-23 repair).
 * Rule 4.5 scans raw source, and a comment documenting the anti-pattern contains the very
 * token it looks for, so the template explaining the defect was flagged as guilty.
 * Only block comments and full-line comments are removed, so URLs survive.
 */
function stripComments(text) {
  const SLASH = String.fromCharCode(47);
  const STAR = String.fromCharCode(42);
  const CR = String.fromCharCode(13);
  const LF = String.fromCharCode(10);
  const out = [];
  let inBlock = false;
  for (const rawLine of text.split(LF)) {
    const line = rawLine.endsWith(CR) ? rawLine.slice(0, -1) : rawLine;
    if (inBlock) {
      if (line.indexOf(STAR + SLASH) >= 0) inBlock = false;
      out.push("");
      continue;
    }
    if (line.trimStart().startsWith(SLASH + SLASH)) { out.push(""); continue; }
    if (line.trimStart().startsWith(SLASH + STAR)) { inBlock = true; out.push(""); continue; }
    out.push(line);
  }
  return out.join(LF);
}
function norm(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/* --------------------------------------------------------------- findings */

const findings = [];
function add(id, severity, msg, file, idx, hint) {
  findings.push({
    id,
    severity,
    msg,
    file: file || null,
    line: file && typeof idx === "number" ? lineOf(safeRead(file), idx) : null,
    hint: hint || null,
  });
}

const files = collectFiles();
if (!files.length && !JSON_OUT) {
  console.error("❌ 未找到可审计的源码目录（src/ / app/ / scripts/）。请在项目根目录运行。");
  process.exit(1);
}

/* ------------------------------------------------- 0. 定位站点配置与实体名 */

const CONFIG_HINT = /(site|config|seo|meta|constant|brand)/i;
const configCandidates = files
  .filter((f) => AUTHOR_KV_RE.test(f.text))
  .sort((a, b) => {
    const sa = CONFIG_HINT.test(path.basename(a.rel)) ? 0 : 1;
    const sb = CONFIG_HINT.test(path.basename(b.rel)) ? 0 : 1;
    return sa - sb;
  });

let authorBlock = null; // {file, start, end, block}
let authorName = null;
let authorOrg = null;
let siteDomain = null;

for (const f of configCandidates) {
  const m = f.text.match(AUTHOR_KV_RE);
  if (!m) continue;
  const b = balanced(f.text, m.index);
  if (!b) continue;
  const nm = firstStringField(b.block, "name");
  const og = firstStringField(b.block, "org") || firstStringField(b.block, "organization");
  // Prefer the candidate whose name is a real string literal. The VideoGame author block in
  // seo.ts uses name: config.game.developer (an expression), which the old scan mistook for the
  // site constant and then reported AUTHOR_MISSING.
  if (nm) {
    authorBlock = { file: f.abs, rel: f.rel, ...b };
    authorName = nm;
    authorOrg = og;
    break;
  }
  if (!authorBlock) {
    authorBlock = { file: f.abs, rel: f.rel, ...b };
    authorName = nm;
    authorOrg = og;
  }
}

// 站点域名（用于判定 sameAs 是否外站）
for (const f of files) {
  const m = f.text.match(/baseUrl\s*[:=]\s*[`"']https?:\/\/([^`"'/]+)/);
  if (m) {
    siteDomain = m[1].toLowerCase();
    break;
  }
}

// 游戏名 / 开发商（用于判定"粉丝站把自己标成游戏本体"）
const gameEntities = new Set();
const GAME_FILE_MARKER = /robloxId|placeId|universeId|steamAppId|appId/i;
for (const f of files) {
  for (const m of f.text.matchAll(/(?:developer|developerName|studio|gameName|game\.name)\s*[:=]\s*[`"']([^`"']+)[`"']/g)) {
    if (m[1] && m[1].length > 2) gameEntities.add(m[1]);
  }
  // game.config.json 之类：文件里有平台 ID 时，其顶层 "name" 视为游戏实体名
  if (GAME_FILE_MARKER.test(f.text) && /game|config/i.test(path.basename(f.rel))) {
    for (const m of f.text.matchAll(/"name"\s*:\s*"([^"]{3,})"/g)) gameEntities.add(m[1]);
  }
}

// The site own brand / author name must never be treated as the game entity: a game-config file
// contains many name keys (including the author block), and harvesting every one of them made a
// correctly attributed fan site look like it was naming itself after the game.
for (const g of [...gameEntities]) {
  if (authorName && norm(g) === norm(authorName)) gameEntities.delete(g);
  if (authorOrg && norm(g) === norm(authorOrg)) gameEntities.delete(g);
}
/** 可追责性：署名是否由一个"说清楚谁负责、怎么核实、怎么联系"的 /about/ 页支撑 */
const aboutFile = files.find((f) => /^src\/app\/about\/page\.(tsx?|jsx?|mdx?)$/i.test(f.rel));
const aboutText = aboutFile ? aboutFile.text : "";
const hasWhoSection = /(who\s+(maintains|writes|runs|is)|maintainer|edited\s+by|about\s+the\s+author)/i.test(aboutText);
const hasMethodology = /(verif|method|how\s+we|process|sources?|unconfirmed)/i.test(aboutText);
const hasContact = /mailto:|SITE\.email|contact@|email:/i.test(aboutText);
const hasAccountability = Boolean(aboutFile) && hasWhoSection && hasMethodology && hasContact;

/* ---------------------------------------------------- 1. 署名实体与可追责性 */

const GENERIC_AUTHOR = /\b(team|staff|admins?|editors?|community|contributors?|writers?|wiki)\b/i;
const authorEntity = authorBlock ? (firstStringField(authorBlock.block, "entity") || "person") : null;

if (!authorBlock) {
  add("AUTHOR_MISSING", "error", "未在任何源码里找到 author 常量，全站无署名来源", null, null,
    "在站点常量文件（如 src/data/site.ts）增加 author: { entity, name, org, description, disambiguatingDescription }");
} else {
  if (!authorName || !authorName.trim()) {
    add("AUTHOR_MISSING", "error", "站点常量里没有 author.name，全站署名处于匿名状态", authorBlock.file, authorBlock.start,
      '在站点常量补 author: { entity: "organization", name: "<站点品牌>", maintainer: "<维护者>", ... }');
  } else if (authorName.length <= 1) {
    add("AUTHOR_GENERIC", "error", `作者名 "${authorName}" 过短，疑似占位符`, authorBlock.file, authorBlock.start);
  } else if (GENERIC_AUTHOR.test(authorName) && !hasAccountability) {
    // 组织署名本身合法（WebMD / Mayo Clinic / 主流 wiki 都是组织作者），
    // 前提是它可追责：/about/ 必须写明谁维护、怎么核实、怎么联系。
    add("AUTHOR_GENERIC", "error",
      `署名 "${authorName}" 命中泛化词，且 /about/ 页缺少可追责支撑（谁维护 / 如何核实 / 联系方式）`,
      authorBlock.file, authorBlock.start,
      "组织署名可以保留，但必须在 /about/ 补「Who Maintains This Site」章节 + 核实方法 + 联系邮箱");
  }
  for (const g of gameEntities) {
    if (norm(authorName) === norm(g)) {
      add("AUTHOR_IS_GAME", "error", `署名与游戏/开发商实体 "${g}" 同名，会被判为官方发声`, authorBlock.file, authorBlock.start);
    }
  }
}

if (!hasAccountability) {
  add("AUTHOR_NO_ACCOUNTABILITY", "error",
    "/about/ 页没有同时具备「谁维护 + 如何核实 + 联系方式」三段 —— 无论用哪种署名，这都让 E-E-A-T 落空",
    aboutFile ? aboutFile.abs : null, 0,
    "补三段式：Who Maintains This Site（署名+角色）/ How We Verify（核实方法）/ Contact（邮箱）");
}

/* ------------------------------------------- 2. 页面级 author 必须是 Person */

let orgAuthorCount = 0;
let personSchemaCount = 0;
const orgAuthorSites = [];

for (const f of files) {
  const text = f.text;
  for (const m of text.matchAll(/author\s*:\s*\{/g)) {
    const b = balanced(text, m.index);
    if (!b) continue;
    if (hasType(b.block, "Organization")) {
      orgAuthorCount++;
      orgAuthorSites.push({ file: f.abs, rel: f.rel, ...b });
    }
  }
  personSchemaCount += countType(text, "Person");
}

// 页面级 author 可以是 Person，也可以是"被妥善定义的 Organization"（引用 @id 或带实体名）。
// 只有"匿名/悬空"的 Organization 才是缺陷。
const anonOrgAuthors = [];
const danglingRefs = [];
const thinPersons = [];

for (const site of orgAuthorSites) {
  const hasId = /"@id"\s*:/.test(site.block);
  const nm = firstStringField(site.block, "name");
  // Anonymous means neither @id nor any name key at all. A name expression (for example
  // name: config.game.developer) is not anonymous; treating it as empty made the semantically
  // correct VideoGame.author block look like an unnamed Organization.
  if (!hasId && !/\bname\s*:/.test(site.block)) {
    anonOrgAuthors.push(site);
    continue;
  }
  if (hasId) {
    const idm = site.block.match(/"@id"\s*:\s*[`"']([^`"']+)[`"']/);
    if (idm) {
      const idValue = idm[1];
      const defined = files.some((x) => x.text.includes(idValue) && new RegExp(`"@id"\\s*:\\s*[\\s\\S]{0,4}${idValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(x.text));
      if (!defined) danglingRefs.push({ ...site, idValue });
    }
  }
}

for (const f of files) {
  const text = f.text;
  for (const m of text.matchAll(/author\s*:\s*\{/g)) {
    const b = balanced(text, m.index);
    if (!b) continue;
    if (!hasType(b.block, "Person")) continue;
    const nm = firstStringField(b.block, "name");
    const jt = firstStringField(b.block, "jobTitle") || "";
    if (!nm || GENERIC_AUTHOR.test(nm)) {
      add("AUTHOR_SCHEMA_GENERIC", "error",
        `页面级 JSON-LD 的 author 是泛化/空的 Person（"${nm ?? ""}"）`, f.abs, m.index,
        "换成具体署名的人，或改用带 @id 的 Organization 实体引用");
      continue;
    }
    // 薄身份：短名/无 sameAs，却顶着"主编/专家"头衔 → 身份装饰
    const thin = nm.length <= 2 || !/sameAs/i.test(b.block);
    if (thin && /\b(founder|editor|expert|lead|chief|specialist|authority)\b/i.test(jt)) {
      thinPersons.push({ file: f.abs, rel: f.rel, name: nm, jobTitle: jt, idx: m.index });
    }
  }
}

if (anonOrgAuthors.length) {
  add("AUTHOR_ANON_ORG", "error",
    `${anonOrgAuthors.length} 处页面级 author 是无名 Organization（既无 @id 也无 name）—— 等同于匿名`,
    anonOrgAuthors[0].file, anonOrgAuthors[0].start,
    "用 @id 引用 AuthorBanner 里定义的组织实体（如 `${SITE.baseUrl}/#organization`）");
}
for (const d of danglingRefs.slice(0, 3)) {
  add("AUTHOR_REF_DANGLING", "warning",
    `页面级 author 引用的 @id "${d.idValue}" 在全站没有定义处 —— 实体悬空，结构化数据无效`,
    d.file, d.start, "确保 AuthorBanner / 站点组件里用同样的字面量定义了该 @id");
}
for (const p of thinPersons.slice(0, 3)) {
  add("PERSON_THIN", "warning",
    `Person 作者 "${p.name}" 顶着 "${p.jobTitle}" 头衔，却没有可验证身份锚点（名字过短 / 无 sameAs）—— 属身份装饰，声明无法兑现`,
    p.file, p.idx,
    "要么补可验证锚点（真实公开主页），要么改回组织署名并把角色写成写实的 Site Maintainer");
}


/* ------------------------------------- 3. Organization 名称 = 游戏名/开发商 */

const orgBlocks = [];
for (const f of files) {
  const text = f.text;
  for (const m of text.matchAll(typeRegex("Organization"))) {
    // 向上找包含它的对象块
    const objStart = text.lastIndexOf("{", m.index);
    const b = balanced(text, objStart);
    if (b) orgBlocks.push({ file: f.abs, rel: f.rel, ...b });
  }
}
for (const ob of orgBlocks) {
  const name = firstStringField(ob.block, "name");
  if (!name) continue;
  for (const g of gameEntities) {
    if (norm(name) === norm(g)) {
      add("ORG_IS_GAME", "error",
        `Organization 名称 "${name}" 等于游戏/开发商实体 "${g}" —— 粉丝站被标成了游戏本体（affiliation 误判）`,
        ob.file, ob.start, "Organization 必须用站点品牌名（如 \"X Wiki\"），并配 disambiguatingDescription");
    }
  }
  // 组织署名的可追责三件套：非官方声明 + 编辑方法论 + 联系方式
  const accountable =
    /(email|contactPoint)/i.test(ob.block) &&
    /(disambiguatingDescription|publishingPrinciples)/i.test(ob.block);
  if (!accountable) {
    add("ORG_NO_CONTACT", "warning",
      `Organization "${name}" 缺少可追责字段（email/contactPoint + disambiguatingDescription/publishingPrinciples）`,
      ob.file, ob.start,
      '补 email + publishingPrinciples(→/about/) + disambiguatingDescription（粉丝站的非官方声明）');
  }
}

if (personSchemaCount === 0 && orgBlocks.length === 0) {
  add("NO_AUTHOR_ENTITY", "error", "全站既没有 Person 也没有 Organization 作者实体，署名无法被搜索引擎归因",
    null, null, "在 AuthorBanner 注入 Person + Organization 的 @graph");
}

/* ------------------------------------------------- 4. sameAs 引用官方渠道 */

const OFFICIAL_HOST = /(roblox\.com|robloxlabs|discord\.(gg|com)|trello\.com|(^|\.)t\.co$|twitter\.com|x\.com|youtube\.com|youtu\.be|facebook\.com|instagram\.com|tiktok\.com|reddit\.com)/i;
for (const f of files) {
  const text = f.text;
  for (const m of text.matchAll(/sameAs\s*:\s*\[([\s\S]{0,800}?)\]/g)) {
    const urls = m[1].match(/[`"'](https?:\/\/[^`"']+)[`"']/g) || [];
    for (const raw of urls) {
      const url = raw.replace(/[`"']/g, "");
      let host = "";
      try {
        host = new URL(url).host.toLowerCase();
      } catch {
        continue;
      }
      if (siteDomain && (host === siteDomain || host.endsWith("." + siteDomain))) continue;
      if (OFFICIAL_HOST.test(host)) {
        add("SAMEO_AS_OFFICIAL", "error",
          `sameAs 引用了非本站域名 "${url}" —— 会把粉丝站的实体与官方渠道/游戏本体合并`,
          f.abs, m.index, "粉丝站 sameAs 只放自己的社媒；官方链接应放 page 正文的链接区，不要进实体标识");
      }
    }
  }
}

/* ------------------------------- 4.5 日期覆盖必须作用于显示文本（2026-09-23 新增） */
// 实测缺陷：署名组件接受 date 覆盖，但显示文本仍由 pageDateFormatted(route) 派生 ——
// 覆盖值只进 <time dateTime> 与 JSON-LD dateModified，屏幕上印的却是路由日期。
// 这两种渲染各自都合法，构建门禁与渲染快照都看不见，只能在这里静态拦。
for (const f of files) {
  if (/\.json$/i.test(f.rel)) continue;
  const text = f.text;
  const routeFormatted = [...stripComments(text).matchAll(/pageDateFormatted\s*\(\s*route\s*\)/g)];
  if (routeFormatted.length === 0) continue;
  const hasDateOverride = /date\s*\?\s*:\s*string|props\.date|\bdate\s*=|\bdate\s*:/i.test(text);
  if (!hasDateOverride) continue;
  add(
    "AUTHOR_DATE_OVERRIDE_IGNORED",
    "error",
    "显示文本由 pageDateFormatted(route) 派生，而同一组件接受 date 覆盖 —— 覆盖会半失效：<time dateTime>/JSON-LD 用覆盖值，屏幕上仍印路由日期（人眼看到 9/22、机器读到 9/23）",
    f.abs,
    routeFormatted[0].index,
    "改为 const iso = date || pageDateIso(route); const formatted = formatDisplayDate(iso); —— pageDates.ts 由 gen-content-dates.mjs 自动生成，格式化 helper 需在组件内定义，并复用其 UTC 固定解析规则"
  );
}

/* ------------------------------------------------------ 5. 夸大/假承诺文案 */

const OVERCLAIM = [
  { id: "OVERCLAIM_SLA", sev: "error", re: /\bwithin\s+(a\s+few\s+|24\s+)?(hours|minutes)\b/i, why: "承诺了无法保证的更新 SLA" },
  { id: "OVERCLAIM_SLA", sev: "error", re: /\bupdated\s+(daily|hourly|instantly|immediately)\b/i, why: "承诺了无法保证的更新频率" },
  // 全覆盖实测声明（两种语序都要命中：all codes verified in-game / manually verify all code drops in-game）
  { id: "OVERCLAIM_VERIFY", sev: "error", re: /\b(all|every)\s+(?:the\s+)?(codes?|code\s+drops?|entries|prices?|stats?|values?)\b[^.]{0,40}?\b(verify|verified|test|tested|check|checked)\b[^.]{0,30}?\bin-?game\b/i, why: "声称全部逐条游戏内实测，通常不可核实" },
  { id: "OVERCLAIM_VERIFY", sev: "error", re: /\b(verify|verified|test|tested|check|checked)\b[^.]{0,30}?\b(all|every)\s+(?:the\s+)?(codes?|code\s+drops?|entries|prices?|stats?|values?)\b/i, why: "声称全部逐条游戏内实测，通常不可核实" },
  { id: "OVERCLAIM_ACCURACY", sev: "error", re: /\b(100\s*%\s*(accurate|correct|verified)|always\s+up\s+to\s+date|never\s+expire[sd]?)\b/i, why: "绝对化准确性承诺" },
  { id: "OFFICIAL_WASHING", sev: "error", re: /\b(the\s+)?official\s+fan-?run\b/i, why: '"official fan-run" 自相矛盾，暗示官方身份' },
  { id: "OFFICIAL_WASHING", sev: "warning", re: /\b(we\s+are\s+the\s+official|officially\s+(endorsed|affiliated))\b/i, why: "暗示官方背书" },
];

for (const f of files) {
  if (/\.json$/i.test(f.rel)) continue;
  for (const rule of OVERCLAIM) {
    const m = f.text.match(rule.re);
    if (m) {
      add(rule.id, rule.sev, `文案命中夸大/误导模式 /${m[0]}/（${rule.why}）`, f.abs, m.index,
        "改为与实际能力一致的表述（如：checked against the official listing and in-game where possible）");
    }
  }
}

/* -------------------------------------- 6. datePublished 与 dateModified 同值 */

for (const f of files) {
  const re = /datePublished\s*:\s*([^,\n]+),?\s*\n?\s*dateModified\s*:\s*([^,\n]+)/g;
  for (const m of f.text.matchAll(re)) {
    const a = m[1].trim().replace(/,$/, "");
    const b = m[2].trim().replace(/,$/, "");
    if (a === b) {
      add("PUBLISHED_EQ_MODIFIED", "warning",
        `datePublished 与 dateModified 同为 ${a} —— 首次发布日被内容更新日覆盖，历史可信度受损`,
        f.abs, m.index, "datePublished 用页面首次上线日（常量），dateModified 用 pageDateIso(path)");
    }
  }
}

/* --------------------------------- 7. gen-content-dates 的 porcelain trim 缺陷 */

const genDates = path.join(ROOT, "scripts", "gen-content-dates.mjs");
if (fs.existsSync(genDates)) {
  const text = fs.readFileSync(genDates, "utf8");
  const statusIdx = text.indexOf("git status --porcelain");
  if (statusIdx >= 0) {
    const scope = text.slice(statusIdx, text.indexOf("return files;", statusIdx) + 20);
    // 缺陷特征：对整段输出 .trim() 后再 split —— 第一行（未暂存改动，以空格开头）被截掉首字符
    const trimBug = /\}\s*\)\s*\.trim\(\)\s*;/.test(scope) || /\}\)\.trim\(\);/.test(scope);
    const perLineSafe = /rawLine|\.replace\(\/\\r\$?\/,\s*""\)/.test(scope);
    if (trimBug && !perLineSafe) {
      add("GEN_DATES_TRIM_BUG", "error",
        "gen-content-dates.mjs 对 git status 整段输出调用 .trim() 后再按 \\n 切分：" +
        "首行（未暂存改动，porcelain 状态位以空格开头）被吃掉首字符 → 该文件路径永远匹配不上 → " +
        "每次构建都会有且仅有一个页面（脏文件里字典序第一的那个）静默拿到过期 lastmod",
        genDates, statusIdx, FIX ? "本轮将自动修复" : "用 --fix 自动修复");
    }
  }
}

/* ------------------------------------------- 8. 头像使用游戏图标（暗示官方） */

for (const f of files) {
  const m = f.text.match(/<img[^>]*(?:game-?icon|game-?logo|apple-?touch-?icon|favicon)[^>]*>/i);
  if (m && /author|byline|avatar/i.test(f.text.slice(0, 4000))) {
    add("AVATAR_GAME_ICON", "warning",
      "作者头像直接使用游戏图标/站点 favicon —— 视觉上暗示内容由官方发布",
      f.abs, m.index, "改用首字母 monogram（内联 SVG）或真实作者头像");
  }
}

/* --------------------------------------------- 9. About 页缺少署名/方法论段 */

const aboutPage = files.find((f) => /^src\/app\/about\/page\.(tsx?|jsx?|mdx?)$/i.test(f.rel));
if (aboutPage) {
  const hasAuthorSection = /\b(who\s+writes|author|editor|about\s+the\s+author|by\s+)/i.test(aboutPage.text);
  if (!hasAuthorSection) {
    add("ABOUT_NO_AUTHOR", "warning", "About 页没有署名/编辑方法论章节，作者实体缺少可着陆的自我介绍页",
      aboutPage.abs, 0, '增加 "Who Writes This Site" 章节，署名 + 核实方法 + 联系方式');
  }
} else {
  add("ABOUT_PAGE_MISSING", "warning", "未找到 src/app/about/page.tsx —— Person 实体的 url 无处落地", null, null,
    "建站时必须有 /about/ 页承载作者署名与方法论");
}

/* --------------------------------- 10. 可见 byline 合规性（署名铁律 8） */

// 承载可见 byline 的组件：同时含字面 "By " 与 "Last updated"
const bylineFiles = files.filter((f) => /By\s+</.test(f.text) && /Last updated/i.test(f.text));

for (const f of bylineFiles) {
  const text = f.text;
  const bylineStart = text.indexOf("By ");
  // 仅在 "By " 到 "Last updated" 之间的 byline 区段内判定装饰性标签
  const segEnd = text.indexOf("Last updated");
  const seg = segEnd > bylineStart ? text.slice(bylineStart, segEnd) : text;

  // 10a. 装饰性栏目 / topic 标签（BYLINE_TOPIC_BLOAT）
  // 第 8 条铁律：byline 只应是 "By <站点品牌> · <角色>: <维护者>" + 时间戳，
  // 严禁 category / topic / topicForPath / TOPIC_BY_PATH / bylineTopic 之类第三段装饰标签。
  const topicBloat =
    /\{\s*(category|topic|bylineTopic)\s*\}/.test(seg) ||
    /\b(TOPIC_BY_PATH|topicForPath|bylineTopic)\b/.test(seg) ||
    (/\b(category|topic)\b/.test(seg) && /·|&middot;|\*/.test(seg));
  if (topicBloat) {
    add("BYLINE_TOPIC_BLOAT", "error",
      "可见 byline 携带装饰性栏目/topic 标签（category / topicForPath / 第三段 `· <主题>`）—— 对 E-E-A-T 无贡献且让署名臃肿",
      f.abs, bylineStart,
      '删除 byline 里的 category/topic 第三段；byline 只保留 "By <站点品牌> · <角色>: <维护者>" + "Last updated"');
  }

  // 10b. 退化成单一 "By <name>"（BYLINE_SINGLE_LABEL）
  // 合规 byline 必须同时呈现：站点品牌（SITE.author.name）+ 维护者（SITE.author.maintainer / maintainerRole）
  const hasBrand = /SITE\.author\.name/.test(text);
  const hasMaintainer =
    /SITE\.author\.maintainer\b/.test(text) || /SITE\.author\.maintainerRole\b/.test(text);
  if (!hasBrand) {
    add("BYLINE_SINGLE_LABEL", "error",
      "可见 byline 没有呈现站点品牌（只显示了某个名字 / 单一 \"By <name>\"），署名退化成无法归因的个人标签",
      f.abs, bylineStart,
      'byline 必须始终渲染 SITE.author.name（Organization 名）作为品牌，再叠加维护者');
  } else if (!hasMaintainer) {
    add("BYLINE_SINGLE_LABEL", "error",
      "可见 byline 只有站点品牌、缺少维护者身份 —— 仍是不可追责的匿名组织署名",
      f.abs, bylineStart,
      'byline 应叠加 `· <角色>: <维护者>`，并在 /about/ 写明谁维护 + 如何核实 + 联系方式');
  }

  // 10c. 冗余说明/免责副文本（BYLINE_SUBTITLE_BLOAT）
  // 铁律：AuthorBanner 必须是轻巧的胶囊（Pill），只允许双行紧凑呈现（品牌维护者 + 更新时间戳）。
  // 绝对禁止在 Byline 内添加任何伪免责说明（如 "Content checked against..." / "in-game patch notes"）。
  const subtitleBloat = /(checked\s+against|official\s+listing|patch\s+notes|manually\s+verified|accuracy\s+guaranteed)/i.test(seg);
  if (subtitleBloat) {
    add("BYLINE_SUBTITLE_BLOAT", "error",
      "可见 byline 携带冗余说明/免责副文本（如 checked against / patch notes 等）—— 导致胶囊严重臃肿变形。核实流程请写在 /about/ 页正文，组件内禁止附加此类长句说明",
      f.abs, bylineStart,
      '删除 AuthorBanner 内的说明副段落，保持 Byline 仅呈现「品牌维护者」与「更新时间戳」两行纯粹胶囊形态');
  }
}

/* --------------------------------- 11. Byline 挂载位置门禁（Anti-Buried Footer Trap） */
// 铁律：AuthorBanner 绝不可沉入文末页面底部，必须作为 Byline 紧随 H1 与副标题正下方呈现。
const pageFiles = files.filter((f) => /^src\/app\/(?:[^/]+\/)*page\.(tsx?|jsx?)$/i.test(f.rel));
for (const pf of pageFiles) {
  const text = pf.text;
  if (!text.includes("<AuthorBanner")) continue;

  const bannerMatches = [...text.matchAll(/<AuthorBanner\b/g)];
  for (const m of bannerMatches) {
    const bannerIdx = m.index;
    const bannerLine = lineOf(text, bannerIdx);
    const totalLines = text.split("\n").length;

    // 查找页面中的首个 <h1> 或首个 h1 标签
    const h1Match = text.match(/<h1\b[^>]*>/);
    if (h1Match) {
      const h1Idx = h1Match.index;
      const h1Line = lineOf(text, h1Idx);
      if (bannerIdx < h1Idx) {
        add("BYLINE_PLACEMENT_BURIED", "error",
          `AuthorBanner 出现在 <h1> 之前（第 ${bannerLine} 行，H1 在第 ${h1Line} 行）—— 署名必须紧随 H1 与副标题正下方`,
          pf.abs, bannerIdx,
          "将 AuthorBanner 移动到 <h1> 及副标题段落正下方呈现");
      } else if (bannerLine - h1Line > 40 || (bannerLine > totalLines * 0.7 && bannerLine - h1Line > 25)) {
        add("BYLINE_PLACEMENT_BURIED", "error",
          `AuthorBanner 挂载位置沉底（第 ${bannerLine} 行，H1 在第 ${h1Line} 行，总行数 ${totalLines}）—— 违反 Anti-Buried Footer Trap 铁律`,
          pf.abs, bannerIdx,
          "严禁将 AuthorBanner 孤立放在页面文末。必须提升至首屏 H1 与副标题段落正下方呈现");
      }
    } else {
      if (bannerLine > totalLines * 0.7) {
        add("BYLINE_PLACEMENT_BURIED", "error",
          `AuthorBanner 挂载在文件后半部（第 ${bannerLine}/${totalLines} 行）且未发现 <h1> 标题锚点`,
          pf.abs, bannerIdx,
          "提升至首屏副标题下方挂载");
      }
    }
  }
}

/* ------------------------------------------------------------- 自动修复 */

const patched = [];
function backupThenWrite(abs, next) {
  if (!fs.existsSync(abs + ".bak")) fs.copyFileSync(abs, abs + ".bak");
  fs.writeFileSync(abs, next, "utf8");
  patched.push(path.relative(ROOT, abs).replace(/\\/g, "/"));
}

if (FIX) {
  // 7. porcelain trim 缺陷（确定性修复，幂等）
  if (findings.some((x) => x.id === "GEN_DATES_TRIM_BUG") && fs.existsSync(genDates)) {
    let text = fs.readFileSync(genDates, "utf8");
    const statusIdx = text.indexOf("git status --porcelain");
    // 注意：函数内有多处 `return files;`（如 `if (!out) return files;`），
    // 必须从 for 循环之后开始找，否则作用域被截断、for 循环替换不生效。
    const forIdx = text.indexOf("for (const", statusIdx);
    const endIdx = text.indexOf("return files;", forIdx > statusIdx ? forIdx : statusIdx);
    let scope = text.slice(statusIdx, endIdx);
    const before = scope;
    scope = scope.replace(/\}\s*\)\s*\.trim\(\)\s*;/, "});");
    scope = scope.replace(
      /for\s*\(\s*const\s+line\s+of\s+out\.split\("\\n"\)\s*\)\s*\{/,
      'for (const rawLine of out.split("\\n")) {\n      const line = rawLine.replace(/\\r$/, "");'
    );
    if (scope !== before) {
      text = text.slice(0, statusIdx) + scope + text.slice(endIdx);
      backupThenWrite(genDates, text);
      findings.find((x) => x.id === "GEN_DATES_TRIM_BUG").fixed = true;
    }
  }

  // 1/2/5. 署名相关（需 --author，避免凭空编造人名）
  if (SET_AUTHOR && authorBlock) {
    let block = authorBlock.block;
    const setName = (b, field, value) =>
      new RegExp(`(${field}\\s*:\\s*)(?:"[^"]*"|'[^']*'|\`[^\`]*\`)`).test(b)
        ? b.replace(new RegExp(`(${field}\\s*:\\s*)(?:"[^"]*"|'[^']*'|\`[^\`]*\`)`), `$1"${value}"`)
        : b;

    /** 在对象块结尾插入字段，正确处理尾逗号（否则会生成 `,\n  ,` 的非法 TS） */
    const appendField = (b, field, value) => {
      const m = b.match(/,?\s*\}\s*$/);
      if (!m) return b;
      const head = b.slice(0, m.index);
      const trimmed = head.replace(/\s+$/, "");
      const needsComma = !/[,{]\s*$/.test(trimmed);
      return `${trimmed}${needsComma ? "," : ""}\n    ${field}: "${value}"\n  }`;
    };

    block = setName(block, "name", SET_AUTHOR);
    if (SET_ROLE) {
      block = /\brole\s*:/.test(block) ? setName(block, "role", SET_ROLE) : appendField(block, "role", SET_ROLE);
    }
    if (SET_ORG) {
      block = /\borg\s*:/.test(block) ? setName(block, "org", SET_ORG) : appendField(block, "org", SET_ORG);
    }

    const fileText = fs.readFileSync(authorBlock.file, "utf8");
    const next = fileText.slice(0, authorBlock.start) + block + fileText.slice(authorBlock.end + 1);
    if (next !== fileText) {
      backupThenWrite(authorBlock.file, next);
      for (const id of ["AUTHOR_GENERIC", "AUTHOR_IS_GAME", "AUTHOR_MISSING"]) {
        const f = findings.find((x) => x.id === id);
        if (f) f.fixed = true;
      }
    }
  }

  // 页面级 author: Organization → Person
  if (SET_AUTHOR) {
    for (const site of orgAuthorSites) {
      const text = fs.readFileSync(site.file, "utf8");
      const block = site.block;
      const urlMatch = block.match(/url\s*:\s*([^,\n}]+)/);
      let url = urlMatch ? urlMatch[1].trim() : null;
      // 原 Organization 用的是裸 baseUrl → 改为指向作者页（Person 应着陆在 /about/）
      if (url && /^(SITE\.baseUrl|config\.seo\.baseUrl|siteConfig\.baseUrl)$/.test(url)) {
        url = `\`${url}/about/\``;
      }
      const person =
        `{\n      "@type": "Person",\n      name: "${SET_AUTHOR}",\n      jobTitle: "${SET_ROLE}",` +
        (url ? `\n      url: ${url},` : "") +
        `\n    }`;
      const next = text.slice(0, site.start) + person + text.slice(site.end + 1);
      if (next !== text) backupThenWrite(site.file, next);
    }
    const f = findings.find((x) => x.id === "AUTHOR_SCHEMA_ORG_ONLY");
    if (f) f.fixed = true;
  }
}

/* ---------------------------------------------------------------- 输出 */

const errors = findings.filter((f) => f.severity === "error");
const warns = findings.filter((f) => f.severity === "warning");

if (JSON_OUT) {
  console.log(JSON.stringify({ total: findings.length, errors, warnings: warns, patched }, null, 2));
} else {
  console.log("\n==================== 🖋️  AUTHOR / E-E-A-T INTEGRITY AUDIT ====================");
  console.log(`Project: ${ROOT}`);
  if (authorName) console.log(`Detected author: "${authorName}"${authorOrg ? ` | org: "${authorOrg}"` : ""}`);
  console.log("-----------------------------------------------------------------------------");
  if (!findings.length) {
    console.log("✅ 0 issue — 署名身份与 E-E-A-T 结构全部通过。");
  } else {
    for (const f of findings) {
      const tag = f.severity === "error" ? "❌ ERROR  " : "⚠️  WARNING";
      const loc = f.file ? `${path.relative(ROOT, f.file).replace(/\\/g, "/")}${f.line ? `:${f.line}` : ""}` : "-";
      const done = f.fixed ? "  [已自动修复]" : "";
      console.log(`${tag} [${f.id}] ${loc}${done}\n           ${f.msg}`);
      if (f.hint && !f.fixed) console.log(`           → ${f.hint}`);
    }
  }
  if (patched.length) {
    console.log("-----------------------------------------------------------------------------");
    console.log("🛠️  已修改文件（原文件备份为 .bak）：");
    for (const p of patched) console.log(`   - ${p}`);
  }
  console.log("-----------------------------------------------------------------------------");
  console.log(`❌ Errors: ${errors.filter((e) => !e.fixed).length} | ⚠️  Warnings: ${warns.filter((w) => !w.fixed).length}`);
  if (!FIX && errors.length) {
    console.log("   提示：可确定性修复项用 `node scripts/audit-author-eeat.mjs --fix --author \"<署名>\"` 自动处理。");
  }
  console.log("=============================================================================\n");
}

const blocking = (STRICT ? findings : errors).filter((f) => !f.fixed);
process.exit(blocking.length ? 1 : 0);
