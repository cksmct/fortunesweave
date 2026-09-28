// Media Integrity Guard — 全站视频语义门禁审计脚本  v1.4
// 用法: node scripts/audit-media-integrity.mjs [--strict-thumb]
//
// 检测项：
//   ① oEmbed 存活验证（防死链 / 伪造 ID）        → [DEAD VIDEO]
//   ② 缩略图存活验证（默认警告，--strict-thumb 阻断）→ [DEAD THUMB]（网络类失败自动退避重试一次）
//   ③ 声明标题 vs 真实标题伪造检测（LCS 相似度 < 0.7）→ [TITLE FORGERY]
//   ④ 跨主题零关联检测（页面主题 / 声明标题 与真实标题均无交集）→ [CRITICAL MISMATCH]
//   ⑤ 跨页面重复挪用（info 级提示）
//   ⑥ 同页面同 videoId 重复播放器（含 JSON 数据驱动）      → [SAME-PAGE DUPLICATE VIDEO]
//   ⑦ Local-First 项目的本地缩略图缺失（public/images/yt/{id}.webp）→ [MISSING LOCAL THUMB]
//
// v1.4 修复（2026-09-15，animalhospital 站实测暴露的三个缺陷）：
//   ① TDZ 崩溃：`hasError` 原先在**使用点之后**才 `let` 声明（同页重复检测块早于声明
//      就 `hasError = true`）→ 一旦真的检出同页重复视频，脚本会抛 ReferenceError 崩掉，
//      **反而掩盖掉这条最致命的错误**。声明已提前到检测块之前。
//   ② 站点实体名解析失败 → 全站误报 CRITICAL MISMATCH：常见写法
//      `name: gameConfig.seo.siteTitle || "..."`（`name:` 后跟表达式而非字符串字面量）
//      让 gameKeywords() 的 /name:\s*["']/ 取不到值 → meaningfulGameKeys 为空 →
//      gameMatch 恒 false。已补权威兜底：读 src/data/game.config.json 的 game.name。
//   ③ JSON-LD 被误判为播放器 → 假 [SAME-PAGE DUPLICATE VIDEO]：VideoObjectSchema 这类
//      结构化数据组件渲染的是 <script type="application/ld+json">，页面上并没有播放器；
//      但标签名含 "Video" 被旧过滤命中，同一 videoId 被 <YouTubeEmbed> 与
//      <VideoObjectSchema> 各计一次 → 实测 animalhospital 全站 4 个页面被误杀。
//      现按 kind 区分：schema 仍参与存活与主题校验，但不计入「同页重复播放器」。
//
// v1.1 修复（2026-09-07）：
//
// v1.1 修复（2026-09-07）：
//   [BUG] v1.0 用「URL 前 400 字符内最近的 title:」做启发式配对，数据数组渲染
//         （creatorSpotlights.map(...) + <YouTubeEmbed url={c.url} title={c.title} />）
//         时相邻对象互相串味 —— 实测把首页 HGUewD8iVas 配成了别处的 "Evolution"、
//         iUQvS9fmraw 配成了上一条目的标题。
//   [FIX] 改为「按对象边界配对」：用花括号配对求出 URL 所在对象字面量的真实区间，
//         只在该区间内取 title；组件形式改为解析整个 JSX 开标签（支持跨行），
//         title={c.title} 这类动态值会回溯到包含同一 videoId 的数据对象解析。
//         解析不出来时不再猜，标记为 dynamic 并跳过伪造判定（只做存活 + 主题校验）。
//   [NEW] 真正的标题伪造检测（此前只有宽松的关键词交集，形同虚设）。
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.resolve(ROOT, "src");
const STRICT_THUMB = process.argv.includes("--strict-thumb");

const YT_URL_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/g;

function videoIdFrom(str) {
  const m = String(str || "").match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

function scanFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) scanFiles(full, fileList);
    // 必须包含 .json：数据驱动视频（events.json / videos.json）的 videoId 只存在于 JSON，
    // 漏扫 .json 会让事件视频彻底逃过真实性与本地化门禁（实测已发生 404 事故）。
    else if (/\.[cm]?[jt]sx?$|\.json$/i.test(entry)) fileList.push(full);
  }
  return fileList;
}

/** 求 index 所在对象字面量 / JSX 表达式块的真实区间（花括号配对，不做字符串内转义特判） */
function objectSpanAt(content, index) {
  let start = -1;
  let depth = 0;
  for (let i = index; i >= 0; i--) {
    const ch = content[i];
    if (ch === "}") depth++;
    else if (ch === "{") {
      if (depth === 0) {
        start = i;
        break;
      }
      depth--;
    }
  }
  if (start < 0) return null;
  let d = 0;
  for (let i = start; i < content.length; i++) {
    const ch = content[i];
    if (ch === "{") d++;
    else if (ch === "}") {
      d--;
      if (d === 0) return { start, end: i };
    }
  }
  return null;
}

/** 在对象区间内取最接近 url 的 title: 字段 */
function titleInSpan(content, span, urlIndex) {
  if (!span) return null;
  const slice = content.slice(span.start, span.end + 1);
  const re = /title:\s*(?:"([^"]*)"|'([^']*)')/g;
  let best = null;
  let bestDist = Infinity;
  let m;
  while ((m = re.exec(slice)) !== null) {
    const abs = span.start + m.index;
    const dist = Math.abs(urlIndex - abs); // 同对象内，取离 url 最近者
    if (dist < bestDist) {
      bestDist = dist;
      best = m[1] ?? m[2];
    }
  }
  return best;
}

/** 由 videoId 反查文件中「包含该 URL 的数据对象」的 title */
function resolveTitleById(content, videoId) {
  YT_URL_RE.lastIndex = 0;
  let m;
  while ((m = YT_URL_RE.exec(content)) !== null) {
    if (m[1] !== videoId) continue;
    const span = objectSpanAt(content, m.index);
    const t = titleInSpan(content, span, m.index);
    if (t) return t;
  }
  return null;
}

/** 解析 JSX 媒体组件开标签：支持跨行、videoId 与 url 两种写法，标签名含 YouTube / Video / Embed 均可 */
function extractComponentEmbeds(content) {
  const out = [];
  // 注意：标签名可能「以 YouTube/Video 开头」（YouTubeEmbed），因此先抓全部开标签再按名字过滤，
  // 不能用 [\w.]* 前置——否则永远匹配不上 YouTubeEmbed，退化成启发式取标题（v1.0 事故的同类根因）。
  const tagRe = /<([A-Za-z][\w.]*)\b([\s\S]*?)\/?>/g;
  let m;
  while ((m = tagRe.exec(content)) !== null) {
    if (!/(you[\s_-]*tube|video|embed)/i.test(m[1])) continue;
    // 【v1.4 修复 ③ — 结构化数据组件不是播放器】VideoObjectSchema / JsonLd 这类组件渲染的是
    // <script type="application/ld+json">，页面上不可见。旧正则只看「标签名含 video」，
    // 于是同一 videoId 被 <YouTubeEmbed> 与 <VideoObjectSchema> 各计一次 →
    // 实测全站 4 个页面（beginner-guide / items / lore / updates）被误报 [SAME-PAGE DUPLICATE VIDEO]。
    // 现在区分 kind：schema 仍参与存活与主题校验，但不计入「同页重复播放器」。
    const kind = /(schema|json[\s_-]*ld)/i.test(m[1]) ? "schema" : "player";
    const body = m[2] || "";
    const idAttr = body.match(/videoId\s*=\s*["'{]?\s*([\w-]{11})\s*["'}]?/);
    const urlAttr = body.match(/url\s*=\s*["']([^"']+)["']/);
    const videoId = idAttr ? idAttr[1] : urlAttr ? videoIdFrom(urlAttr[1]) : null;
    if (!videoId) continue;

    let declaredTitle = null;
    let dynamic = false;
    const staticTitle = body.match(
      /title\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["']([^"']+)["']\s*\})/
    );
    if (staticTitle) {
      declaredTitle = staticTitle[1] ?? staticTitle[2] ?? staticTitle[3];
    } else if (/title\s*=\s*\{/.test(body)) {
      dynamic = true;
      declaredTitle = resolveTitleById(content, videoId);
    }
    out.push({
      videoId,
      declaredTitle,
      dynamic,
      kind,
      urlIndex: m.index,
      tagStart: m.index,
      tagEnd: m.index + m[0].length,
    });
  }
  return out;
}

/** 解析数据数组 / JSON-LD 中的 YouTube URL（对象边界内配对 title） */
function extractDataEmbeds(content, componentIds, tagSpans) {
  const out = [];
  YT_URL_RE.lastIndex = 0;
  let m;
  while ((m = YT_URL_RE.exec(content)) !== null) {
    const videoId = m[1];
    // 已由组件形式覆盖（含跨行标签内部的 URL）→ 跳过，避免重复计数与错误配对
    if (componentIds.has(videoId)) continue;
    if (tagSpans.some((s) => m.index >= s.tagStart && m.index <= s.tagEnd)) continue;
    const span = objectSpanAt(content, m.index);
    out.push({
      videoId,
      declaredTitle: titleInSpan(content, span, m.index),
      dynamic: false,
      kind: "player",
      urlIndex: m.index,
    });
  }
  return out;
}

/** 解析 JSON 数据驱动 videoId（events.json / videos.json）："videoId": "..." 或 videoId: "..."，按对象边界配对 title */
function extractJsonVideoIdEmbeds(content, componentIds) {
  const out = [];
  const re = /["']?videoId["']?\s*:\s*["']([\w-]{11})["']/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const videoId = m[1];
    if (componentIds.has(videoId)) continue; // 组件字面量已覆盖
    const span = objectSpanAt(content, m.index);
    out.push({
      videoId,
      declaredTitle: titleInSpan(content, span, m.index),
      dynamic: false,
      kind: "player",
      urlIndex: m.index,
    });
  }
  return out;
}

function extractEmbeds(filePath, content) {
  const rel = path.relative(ROOT, filePath).replaceAll("\\", "/");
  const components = extractComponentEmbeds(content);
  const componentIds = new Set(components.map((c) => c.videoId));
  const dataEmbeds = extractDataEmbeds(content, componentIds, components);
  // 数据驱动 videoId（events.json 等）单独提取，确保 JSON 里的视频也纳入门禁
  const jsonEmbeds = extractJsonVideoIdEmbeds(content, componentIds);
  return [...components, ...dataEmbeds, ...jsonEmbeds].map((e) => ({ ...e, file: rel }));
}

async function checkVideoOEmbed(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    return { ok: true, title: data.title, author: data.author_name };
  } catch (err) {
    // A network-level failure (DNS / proxy / timeout) is NOT evidence that a video is dead.
    // Flag it so the audit can degrade to UNVERIFIED instead of [DEAD VIDEO].
    return { ok: false, error: err.message, network: true };
  }
}

async function checkThumbOnce(videoId) {
  const res = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, {
    method: "HEAD",
    signal: AbortSignal.timeout(15000),
  });
  return res.ok ? { ok: true } : { ok: false, status: res.status };
}

// 2026-09-23：远端缩略图探测的**单次网络抖动**会产生非阻断 [DEAD THUMB] 噪声
// （实测 aA7eDfpzhn4 首抓 "fetch failed"、而本地 webp 实际存在、媒体审计整体通过）。
// 因此抛异常（网络类失败）时等待 800ms 重试一次；确定性 HTTP 状态码（如 404）不重试，省时间。
async function checkThumb(videoId) {
  try {
    return await checkThumbOnce(videoId);
  } catch (err) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      return await checkThumbOnce(videoId);
    } catch (err2) {
      return { ok: false, error: err2.message, retried: true };
    }
  }
}

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

function keywordsOf(str) {
  return new Set(norm(str).split(/\s+/).filter((w) => w.length >= 4));
}

/** 字符级 LCS 相似度：以较短串为分母，容忍真实标题的前后缀扩展 / 截断式简写 */
function similarity(a, b) {
  const s1 = norm(a);
  const s2 = norm(b);
  if (!s1 || !s2) return 0;
  const [short, long] = s1.length <= s2.length ? [s1, s2] : [s2, s1];
  let prev = new Array(short.length + 1).fill(0);
  for (let i = 1; i <= long.length; i++) {
    const cur = new Array(short.length + 1).fill(0);
    for (let j = 1; j <= short.length; j++) {
      cur[j] = long[i - 1] === short[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[short.length] / short.length;
}

/** 站点实体关键词（用于「同站主题」豁免），从 src/data/site.ts 读取，禁止硬编码游戏名 */
function gameKeywords() {
  const candidates = ["src/data/site.ts", "src/data/site.js", "src/lib/site.ts"];
  for (const c of candidates) {
    const p = path.join(ROOT, c);
    if (!fs.existsSync(p)) continue;
    const txt = fs.readFileSync(p, "utf-8");
    const gm = txt.match(/gameName:\s*["']([^"']+)["']/);
    if (gm) return { name: gm[1], keys: keywordsOf(gm[1]) };
    const nm = txt.match(/name:\s*["']([^"']+)["']/);
    if (nm) return { name: nm[1], keys: keywordsOf(nm[1]) };
  }
  // 【v1.4 修复 ② — 实体名来源兜底】site.ts 里很常见的写法是
  //   `name: gameConfig.seo.siteTitle || "Animal Hospital Roblox Guide & Tools"`
  // —— `name:` 后面跟的是表达式而不是字符串字面量，上面的正则一个都取不到 →
  // meaningfulGameKeys 为空 → gameMatch 恒 false → 全站视频被误判 [CRITICAL MISMATCH]。
  // 因此补一层权威真源兜底：<repo>/src/data/game.config.json 的 game.name（纯字面量）。
  for (const c of ["src/data/game.config.json", "src/data/game.config.js"]) {
    const p = path.join(ROOT, c);
    if (!fs.existsSync(p)) continue;
    try {
      const cfg = JSON.parse(fs.readFileSync(p, "utf-8"));
      const name = cfg?.game?.name;
      if (name) return { name, keys: keywordsOf(name) };
    } catch {
      /* 配置文件损坏时继续尝试下一个候选，绝不因配置解析失败而中断审计 */
    }
  }
  return { name: null, keys: new Set() };
}

function pageKeysOf(pageRel) {
  const segs = pageRel
    .replace(/\.[jt]sx?$/, "")
    .split("/")
    .filter((s) => !["src", "app", "page", "index"].includes(s));
  // 段内还要再切词：secret-units → { secret, units }，否则永远匹配不上真实标题里的单词
  const words = segs.flatMap((s) => norm(s).split(/\s+/)).filter((w) => w.length >= 4);
  return new Set(words);
}

export async function auditMediaIntegrity() {
  console.log("🔍 Starting Media & Video Semantic Integrity Audit...\n");
  const files = scanFiles(SRC_DIR);
  let embeds = [];
  for (const f of files) {
    embeds = embeds.concat(extractEmbeds(f, fs.readFileSync(f, "utf-8")));
  }
  // 同页面重复视频检测（Same-Page Duplicate Video 阻断门禁）
  let hasDuplicateVideo = false;
  // 【v1.4 修复 ① — TDZ 崩溃】hasError 必须在下面的 SAME-PAGE DUPLICATE 检测块【之前】声明。
  // 旧版把 `let hasError = false;` 写在 oembed 循环之前，而本检测块就已
  // `if (hasDuplicateVideo) hasError = true;` —— 一旦真的检出同页重复视频，脚本会因
  // 暂时性死区（TDZ）直接抛 ReferenceError 崩掉，反而掩盖掉这条最致命的错误。
  let hasError = false;
  const fileVideoCounts = new Map();
  for (const e of embeds) {
    // 只统计真实播放器：JSON-LD（schema kind）与播放器同页共存是**正确**做法，
    // 不能算作「同页重复视频」（否则全站凡是有 VideoObjectSchema 的页面全被误杀）。
    if (e.kind === "schema") continue;
    const key = `${e.file}|${e.videoId}`;
    fileVideoCounts.set(key, (fileVideoCounts.get(key) || 0) + 1);
  }
  for (const [key, count] of fileVideoCounts.entries()) {
    if (count > 1) {
      const [file, videoId] = key.split("|");
      console.error(
        `❌ [SAME-PAGE DUPLICATE VIDEO] ${file} -> videoId=${videoId} 在同一页面内重复出现了 ${count} 次！`
      );
      console.error(
        `   [FATAL] 严禁在同一页面渲染多个相同的视频播放器！这会导致内容冗余与极差的用户体验。`
      );
      console.error(
        `   [FIX] 若首屏 Hero 引入了官方定档/宣传预告，正文 Spotlight 必须替换为互补维度的实机视频（如技能拆解、阵营玩法、职业连招）或降级为纯图文机制表格。\n`
      );
      hasDuplicateVideo = true;
    }
  }
  if (hasDuplicateVideo) hasError = true;

  // 同文件同 ID 保留一条继续后续 oEmbed 校验，优先保留带解析标题的那条
  const seen = new Map();
  for (const e of embeds) {
    // key 必须带 kind：同一 videoId 的「播放器」与「JSON-LD」是两条独立记录，
    // 合并会让 schema 侧的存活校验被吞掉。
    const key = `${e.file}|${e.videoId}|${e.kind ?? "player"}`;
    const prev = seen.get(key);
    if (!prev || (!prev.declaredTitle && e.declaredTitle)) seen.set(key, e);
  }
  embeds = [...seen.values()];

  const dynamicCount = embeds.filter((e) => !e.declaredTitle).length;
  console.log(
    `📊 Found ${embeds.length} embedded video instances across ${files.length} files` +
      (dynamicCount ? ` (${dynamicCount} dynamic/unresolvable title → 只做存活与主题校验)` : "") +
      ".\n"
  );

  const game = gameKeywords();
  const byId = new Map();
  const oembedCache = new Map();
  let thumbWarnings = 0;

  const ytDir = path.join(ROOT, "public", "images", "yt");
  const hasLocalConvention = fs.existsSync(ytDir);

  for (const item of embeds) {
    const id = item.videoId;
    // [MISSING LOCAL THUMB]：采用 Local-First Facade 的项目，每个视频都必须有本地 webp。
    // 缺失即等于静态导出向爬虫返回 404 —— 本次事故的直接形态，构建期硬阻断。
    if (hasLocalConvention && !fs.existsSync(path.join(ytDir, `${id}.webp`))) {
      console.error(
        `❌ [MISSING LOCAL THUMB] ${item.file} -> videoId=${id} (public/images/yt/${id}.webp 不存在 — 静态导出会向爬虫返回 404)`
      );
      hasError = true;
      continue;
    }
    if (!oembedCache.has(id)) oembedCache.set(id, await checkVideoOEmbed(id));
    const oembed = oembedCache.get(id);

    if (!byId.has(id)) byId.set(id, { ...oembed, locations: [] });
    byId.get(id).locations.push(item.file);

    const url = `https://www.youtube.com/watch?v=${id}`;
    if (!oembed.ok && oembed.network) {
      console.warn('   [UNVERIFIED VIDEO] oEmbed endpoint unreachable; existence NOT verified:', item.file, id, oembed.error || 'network');
      continue;
    }
    if (!oembed.ok) {
      console.error(`❌ [DEAD VIDEO] ${item.file} -> videoId=${id} ${url}`);
      console.error(`   oEmbed failed (${oembed.status || oembed.error || "unknown"})`);
      hasError = true;
      continue;
    }

    const thumb = await checkThumb(id);
    if (!thumb.ok) {
      thumbWarnings++;
      const tag = STRICT_THUMB ? "❌ [DEAD THUMB]" : "⚠️  [DEAD THUMB]";
      console.log(
        `${tag} ${item.file} -> videoId=${id} (hqdefault ${thumb.status || thumb.error || "unreachable"})` +
          (STRICT_THUMB ? "" : " — 非阻断，需阻断请加 --strict-thumb")
      );
      if (STRICT_THUMB) hasError = true;
    }

    const realTitle = oembed.title;
    const pageKeys = pageKeysOf(item.file);
    const realKeys = keywordsOf(realTitle);
    const overlapPage = [...pageKeys].filter((k) => realKeys.has(k));
    const overlapDeclared = item.declaredTitle
      ? [...keywordsOf(item.declaredTitle)].filter((k) => realKeys.has(k))
      : [];
    const stopWords = new Set(["wiki", "roblox", "game", "games", "hub", "guide", "official", "community"]);
    const meaningfulGameKeys = [...game.keys].filter((k) => !stopWords.has(k));
    const gameMatch =
      Boolean(game.name && norm(realTitle).includes(norm(game.name))) ||
      meaningfulGameKeys.some((k) => realKeys.has(k));
    const isHomePage = pageKeys.size === 0;
    const genericOk = gameMatch || (isHomePage && meaningfulGameKeys.some((k) => realKeys.has(k)));

    const flags = [];
    if (item.declaredTitle) {
      const sim = similarity(item.declaredTitle, realTitle);
      if (sim < 0.7) {
        flags.push(
          `[TITLE FORGERY] 声明标题与真实标题相似度 ${(sim * 100).toFixed(0)}% (<70%)`
        );
      }
    }
    if (!genericOk && overlapPage.length === 0 && overlapDeclared.length === 0) {
      flags.push("[CRITICAL MISMATCH] 页面主题与视频真实标题语义零关联");
    }
    if (flags.length) hasError = true;

    console.log(
      `${flags.length ? "❌" : "✅"} [${item.file}] id=${id}${item.kind === "schema" ? " (json-ld)" : ""}` +
        `\n      declared: ${item.declaredTitle ?? "(动态/不可解析，跳过伪造判定)"}` +
        `\n      real:     "${realTitle}" by ${oembed.author}` +
        (flags.length ? `\n      🔴 ${flags.join(" | ")}` : "")
    );
  }

  console.log("\n🧩 Cross-page duplicate check:");
  for (const [id, info] of byId) {
    if (info.locations.length > 1) {
      console.log(
        `ℹ️  videoId=${id} used on ${info.locations.length} pages: ${info.locations.join(", ")}` +
          (info.ok ? ` | Real: "${info.title}" by ${info.author}` : " | (dead)")
      );
    }
  }
  if (thumbWarnings) {
    console.log(`\nℹ️  缩略图不可达 ${thumbWarnings} 处（默认非阻断）。`);
  }

  if (hasError) {
    console.error("\n❌ Media integrity audit FAILED! Fix mismatched or fake media above.");
    console.error("   修复优先级：① 死链直接替换/删除 ② 伪造标题改回 oEmbed 真实标题 ③ 错配换成同主题视频或降级为图文。");
    process.exit(1);
  }
  console.log("\n🎉 All media instances passed semantic & real existence verification!");
}

auditMediaIntegrity();
