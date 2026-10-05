#!/usr/bin/env node
/**
 * AdSense Site Auditor — 一键体检脚本（本地门禁 + 线上抓取）
 *
 * 定位：本脚本是 `adsense-site-auditor` 技能自带的「机器判定层」。
 *   它把所有可机器判断的结论一次算完，只把「通过 / 警告 / 失败」的紧凑列表交给 AI。
 *   这样排查 AdSense 问题不必重新爬站、不必逐页推理 —— 这是最大的 token 节省点。
 *
 * 用法：
 *   npm run audit-adsense                     # 本地门禁 + 线上抓取（推荐）
 *   node scripts/audit-adsense.mjs --offline  # 只跑本地门禁（不联网，最快）
 *   node scripts/audit-adsense.mjs --deep     # 额外做全站「空图库 / 承诺 vs 现实」扫描（慢，约 100+ 请求）
 *   node scripts/audit-adsense.mjs --json     # 机器可读
 *   node scripts/audit-adsense.mjs --url=https://example.com
 *
 * 项目约定（本脚本假定，与本技能配套的建站技能一致）：
 *   - 站点根地址读自 `src/data/game.config.json` 的 `seo.baseUrl`
 *   - 本地硬门禁脚本位于 `scripts/`：audit-thin-content / audit-content-integrity /
 *     audit-links / audit-orphans / audit-author-eeat
 *   不满足约定时对应项会标 warn 并跳过，不会误报为 fail。
 *
 * 配套 references/：
 *   - adsense-requirements.md   完整 ADS-* 清单（唯一事实源）
 *   - symptom-playbook.md       症状 → 原因 → 修复
 *   - account-checklist.md      只能在 AdSense 后台核验的人工项
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const AS_JSON = ARGS.includes("--json");
const OFFLINE = ARGS.includes("--offline");
const DEEP = ARGS.includes("--deep");
const urlArg = ARGS.find((a) => a.startsWith("--url="));
const CONFIG = path.join(ROOT, "src", "data", "game.config.json");

const rows = [];
const add = (area, id, status, detail) => rows.push({ area, id, status, detail });
const OK = "pass", WARN = "warn", FAIL = "fail";

function siteUrl() {
  if (urlArg) return urlArg.split("=")[1].replace(/\/$/, "");
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
    return String(cfg.seo?.baseUrl ?? "").replace(/\/$/, "");
  } catch {
    return "";
  }
}

/* ─────────────────── 本地门禁 ─────────────────── */
const LOCAL_GATES = [
  ["audit-thin-content.mjs", "ADS-CONTENT-03", /整改基线存量:\s*(\d+)[^\n]*?基线外违规:\s*(\d+)/],
  ["audit-content-integrity.mjs", "ADS-CONTENT-02", /发现:\s*(\d+)\s*error\s*\/\s*(\d+)\s*warning/],
  ["audit-links.mjs", "ADS-CRAWL-01", null],
  ["audit-orphans.mjs", "ADS-UX-02", null],
  ["audit-author-eeat.mjs", "ADS-PUB-05", null],
];

function runLocalGates() {
  for (const [script, id, summaryRe] of LOCAL_GATES) {
    const abs = path.join(ROOT, "scripts", script);
    if (!fs.existsSync(abs)) {
      add("local", id, WARN, `${script} 不存在（跳过）`);
      continue;
    }
    let out = "";
    let ok = true;
    try {
      out = execFileSync(process.execPath, [abs], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      ok = false;
      out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    }
    let detail = ok ? "通过" : "未通过";
    if (summaryRe) {
      const m = out.match(summaryRe);
      if (m) {
        detail =
          id === "ADS-CONTENT-03"
            ? `基线存量 ${m[1]} · 基线外违规 ${m[2]}`
            : `error ${m[1]} · warning ${m[2]}`;
      }
    }
    // 脚本以非零退出即视为失败（这些门禁都是硬门禁）
    add("local", id, ok ? OK : FAIL, detail);
  }
}

/* ─────────────────── 线上检查 ─────────────────── */
const BOT_UA =
  "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 (compatible; Mediapartners-Google/2.1; +http://www.google.com/bot.html)";

async function get(url, ua) {
  const started = Date.now();
  const res = await fetch(url, {
    redirect: "follow",
    headers: ua ? { "user-agent": ua } : undefined,
  });
  const body = await res.text();
  return { status: res.status, body, ms: Date.now() - started, headers: res.headers };
}

/** 从 HTML 中取出 <main>…</main>（正确闭合截断；用 split("<main") 会把页脚算进正文） */
function mainOf(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : "";
}

async function runLiveChecks(base) {
  // 首页可访问性 + 响应时间
  try {
    const home = await get(`${base}/`);
    const slow = home.ms > 3000;
    add("live", "ADS-CRAWL-01", home.status === 200 ? (slow ? WARN : OK) : FAIL,
      `HTTP ${home.status} · ${home.ms}ms`);

    // 关键 head 内容
    const head = home.body.slice(0, home.body.indexOf("</head>") + 7);
    add("live", "ADS-SITE-02", head.includes("google-adsense-account") ? OK : FAIL,
      head.includes("google-adsense-account") ? "adsense 验证 meta 存在" : "缺少 google-adsense-account meta");

    const hasAdScript = /pagead2\.googlesyndication\.com/.test(home.body);
    add("live", "ADS-PROG-05", hasAdScript ? OK : WARN,
      hasAdScript ? "已加载官方 AdSense 脚本" : "未加载 AdSense 广告脚本（未过审/未接入时属正常）");

    // Consent Mode v2
    const hasConsentMode = /gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/.test(home.body);
    add("live", "ADS-PRIV-04", hasConsentMode ? OK : FAIL,
      hasConsentMode ? "Consent Mode v2 默认值已设定" : "未检测到 Consent Mode v2");

    const hasPanel = /Cookie Settings|Your Privacy Choices/i.test(home.body);
    add("live", "ADS-PRIV-04b", hasPanel ? OK : WARN,
      hasPanel ? "存在同意面板/撤回入口" : "未检测到同意面板或 Cookie Settings 入口");

    const geoscoped = /CONSENT_TZ|requiresConsent/i.test(home.body);
    add("live", "ADS-PRIV-04c", geoscoped ? OK : WARN,
      geoscoped ? "consent 已按地区分级（非 EEA/UK 默认授予）" : "consent 未按地区分级，可能压掉非 EEA/UK 地区个性化广告收入");

    // 隐私政策
    const priv = await get(`${base}/privacy-policy/`);
    const privOk = priv.status === 200 && /cookie/i.test(priv.body) && /(Google|AdSense)/i.test(priv.body);
    add("live", "ADS-PRIV-01", privOk ? OK : FAIL,
      priv.status !== 200 ? `隐私政策 HTTP ${priv.status}` : privOk ? "存在且披露 cookie 与 Google 广告" : "隐私政策未披露 cookie/Google");
  } catch (e) {
    add("live", "ADS-CRAWL-01", FAIL, `首页请求失败：${String(e.message).slice(0, 80)}`);
    return;
  }

  // robots.txt
  try {
    const rb = await get(`${base}/robots.txt`);
    const blocked = /User-agent:\s*(Mediapartners-Google|AdsBot-Google)[\s\S]*?Disallow:\s*\/\s*$/im.test(rb.body);
    add("live", "ADS-CRAWL-02", rb.status === 200 && !blocked ? OK : FAIL,
      rb.status !== 200 ? `HTTP ${rb.status}` : blocked ? "robots.txt 屏蔽了广告爬虫" : "允许抓取，未屏蔽广告爬虫");
  } catch {
    add("live", "ADS-CRAWL-02", FAIL, "robots.txt 请求失败");
  }

  // sitemap
  try {
    const sm = await get(`${base}/sitemap.xml`);
    const n = (sm.body.match(/<loc>/g) ?? []).length;
    add("live", "ADS-CRAWL-07", n > 10 ? OK : FAIL, `sitemap 含 ${n} 条 URL`);
  } catch {
    add("live", "ADS-CRAWL-07", FAIL, "sitemap.xml 请求失败");
  }

  // ads.txt
  try {
    const at = await get(`${base}/ads.txt`);
    const hasGoogle = /google\.com\s*,\s*pub-\d+\s*,\s*DIRECT/i.test(at.body);
    add("live", "ADS-TXT-01", at.status === 200 && hasGoogle ? OK : FAIL,
      at.status !== 200 ? `HTTP ${at.status}` : hasGoogle ? "含 Google DIRECT 授权行" : "缺少 google.com 授权行");
  } catch {
    add("live", "ADS-TXT-01", FAIL, "ads.txt 请求失败");
  }

  // 广告爬虫可达性
  try {
    const bot = await get(`${base}/`, BOT_UA);
    add("live", "ADS-CRAWL-02b", bot.status === 200 ? OK : FAIL,
      `Mediapartners-Google UA → HTTP ${bot.status}`);
  } catch {
    add("live", "ADS-CRAWL-02b", FAIL, "Mediapartners-Google 抓取失败");
  }
}

/* ─────────────────── 深度扫描：空图库 / 承诺 vs 现实 ─────────────────── */
/**
 * ADS-CONTENT-03b —— 为什么必须有这一条：
 *   词数门禁能挡住「薄内容」，但挡不住「空内容」。真实事故：某页 554 词（词数达标），
 *   标题写着 "Wallpapers & Fanart Gallery (HD)"、FAQ 写着 "You can download HD wallpapers
 *   from this gallery"，而正文 <main> 内 <img> 数量为 0 —— 一张图都没有。
 *   ADS-CONTENT-03 原文明确点名 "empty galleries"，但只按词数判定必然漏掉。
 *
 * 判定口径（刻意从严，避免误报）：
 *   只取 **<title> / <h1>** 中的素材类承诺词（正文出现 "no downloadable pack" 这类
 *   否定句不应误报，所以不扫正文），若命中且正文 <main> 内 <img> 数为 0 → 报警。
 *   标题承诺了视觉素材，却一张都渲染不出来，就是空图库。
 */
const MEDIA_CLAIM =
  /\b(download|downloadable|wallpaper|wallpapers|4k|1080p|1920x1080|gallery|screenshot|screenshots|template|templates|printable|pdf|icons?\s+pack|asset\s+pack)s?\b/i;

function titleAndH1(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? "";
  const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1m ? h1m[1].replace(/<[^>]+>/g, " ") : "";
  return `${title} ${h1}`.replace(/\s+/g, " ").trim();
}

async function runDeepMediaScan(base) {
  let urls = [];
  try {
    const sm = await get(`${base}/sitemap.xml`);
    urls = [...sm.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  } catch {
    add("deep", "ADS-CONTENT-03b", WARN, "sitemap 不可用，跳过深度扫描");
    return;
  }
  if (urls.length === 0) {
    add("deep", "ADS-CONTENT-03b", WARN, "sitemap 无 URL，跳过深度扫描");
    return;
  }

  const hits = [];
  let checked = 0;
  for (const u of urls) {
    try {
      const r = await get(u);
      if (r.status !== 200) continue;
      checked += 1;
      const pageTitle = titleAndH1(r.body);
      if (!MEDIA_CLAIM.test(pageTitle)) continue; // 标题没承诺素材 → 不适用
      const imgs = (mainOf(r.body).match(/<img/gi) ?? []).length;
      if (imgs === 0) {
        hits.push(`${u.replace(base, "") || "/"}（标题含「${(pageTitle.match(MEDIA_CLAIM) ?? [""])[0]}」但正文 0 图）`);
      }
    } catch {
      /* 单页失败不影响整体 */
    }
  }

  if (hits.length === 0) {
    add("deep", "ADS-CONTENT-03b", OK, `${checked} 页深度扫描：无「标题承诺素材但正文零图」的空页`);
  } else {
    add("deep", "ADS-CONTENT-03b", FAIL, `发现 ${hits.length} 个空图库/虚假素材承诺页`);
    for (const h of hits) add("deep", "ADS-CONTENT-03b.hit", FAIL, h);
  }
}

/* ─────────────────── 输出 ─────────────────── */
const ICON = { pass: "✅", warn: "⚠️ ", fail: "❌" };

(async () => {
  const base = siteUrl();
  runLocalGates();
  if (!OFFLINE) {
    if (!base) add("live", "ADS-CRAWL-01", WARN, "无法确定站点 URL，已跳过线上检查");
    else {
      await runLiveChecks(base);
      if (DEEP) await runDeepMediaScan(base);
    }
  }

  const counts = {
    pass: rows.filter((r) => r.status === OK).length,
    warn: rows.filter((r) => r.status === WARN).length,
    fail: rows.filter((r) => r.status === FAIL).length,
  };

  if (AS_JSON) {
    console.log(JSON.stringify({ base, offline: OFFLINE, deep: DEEP, counts, rows }, null, 2));
    process.exit(counts.fail > 0 ? 1 : 0);
  }

  console.log("\n=========== 🩺 ADSENSE SITE AUDITOR · 快速判定 ===========");
  console.log(`站点: ${base || "(未确定)"}   模式: ${OFFLINE ? "仅本地" : "本地 + 线上"}${DEEP ? " + 深度扫描" : ""}`);
  console.log("");
  let area = "";
  for (const r of rows) {
    if (r.area !== area) {
      area = r.area;
      console.log(
        area === "local" ? "【本地门禁】" : area === "deep" ? "【深度扫描】" : "【线上检查】"
      );
    }
    console.log(`  ${ICON[r.status]} ${r.id.padEnd(20)} ${r.detail}`);
  }
  console.log(`\n合计: ${counts.pass} pass / ${counts.warn} warn / ${counts.fail} fail`);
  console.log(
    counts.fail === 0
      ? "结论: 未发现硬性问题。账号侧项目见 references/account-checklist.md，完整审计见 SKILL.md 的 73 项清单流程。"
      : "结论: 存在硬性问题，按 references/symptom-playbook.md 逐项修复后重跑。"
  );
  if (!DEEP) {
    console.log("提示: 加 --deep 可额外排查「标题承诺素材但正文零图」的空图库页（较慢）。");
  }
  console.log("");
  process.exit(counts.fail > 0 ? 1 : 0);
})();
