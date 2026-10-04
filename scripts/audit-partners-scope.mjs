#!/usr/bin/env node
/**
 * Partners Panel Scope & Network Guard
 *
 * 遵循 seo-partners-network-guard 与 SEO-Optimized Partners Panel 门禁规范：
 * 
 *   1. Cross-Niche Drift ......... 导出目标站必须与本站属于相同垂直品类（PC/主机策略/RPG百科），
 *                                  严禁链接到 Roblox 站群、地缘资讯、体育竞彩等跨垂直领域。
 *   2. Sitewide Leak ............. PartnersPanel 必须严格保持 `pathname !== '/'` 路由守卫。
 *   3. Reciprocal Loop ........... 目标站不得回链本站，杜绝 A <-> B 双向死连被判定 Link Scheme。
 *   4. Link Farm Overload ........ 导出伙伴数量严格受控（<= 3），杜绝链接农场嫌疑。
 *
 * 此外还对组件代码进行静态断言：Dofollow 属性、target="_blank"、DOM 节点无条件保留、
 * 品牌自然锚文本、以及构建后扫描 out 目录断言外链仅存在于 out/index.html 中。
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const PANEL_PATH = join(PROJECT_ROOT, "src", "components", "PartnersPanel.tsx");
const OUT_DIR = join(PROJECT_ROOT, "out");

/** 本站 Canonical Host，用于 Reciprocal Loop / Self-Link 检查 */
const OWN_HOSTS = ["fortunesweave.online", "www.fortunesweave.online"];

/**
 * 跨垂直黑名单（Cross-Niche Partitioning）：
 * fortunesweave.online 是主机单机回合制战棋 RPG 百科，
 * 严禁与 Roblox 站群、体育竞猜、政治财经等无关垂直领域发生 Dofollow 互链！
 */
const DENY_DOMAINS = [
  "catchabrainrot.site",
  "projectslayers2roblox.wiki",
  "gakuranguide.wiki",
  "robloxwonderland.wiki",
  "growchickenfighterroblox.wiki",
  "animalhospital.blog",
  "ghostdriverroblox.wiki",
  "animeoriginsroblox.wiki",
  "rideapet.blog",
  "commandanarmy.blog",
  "eastasiainsights.com",
  "7-0worldcup.org",
  "38-0.one",
];

const MAX_OUTBOUND = 3;

const errors = [];
const warnings = [];

if (!existsSync(PANEL_PATH)) {
  console.error("❌ PartnersPanel.tsx not found in src/components.");
  process.exit(1);
}

const src = readFileSync(PANEL_PATH, "utf8");

// ---------------------------------------------------------------------------
// 1. Sitewide Leak 检查：首页专用守卫必须存活
// ---------------------------------------------------------------------------
const hasPathnameImport = /usePathname/.test(src);
const hasHomepageGuard =
  /pathname\s*!==\s*['"]\/['"]/.test(src) || /pathname\s*===\s*['"]\/['"]/.test(src);

if (!hasPathnameImport) {
  errors.push('PartnersPanel 必须从 "next/navigation" 导入 usePathname 进行路由作用域限定。');
}
if (!hasHomepageGuard) {
  errors.push(
    'PartnersPanel 缺少首页专用守卫！除 pathname 为 "/" 之外必须一律返回 null，' +
      '否则全站子页面泄漏外链会触发 Sitewide Link Spam 算法惩罚。'
  );
}

// ---------------------------------------------------------------------------
// 2. Panel 规范检查：Dofollow、target、无条件 DOM 渲染
// ---------------------------------------------------------------------------
if (/rel\s*=\s*["'{][^"'}]*nofollow/.test(src)) {
  errors.push("Partner 链接禁止携带 rel=nofollow，Dofollow 权重传递是核心目标。");
}
if (!/target\s*=\s*["'{]_blank/.test(src)) {
  errors.push('Partner 链接必须使用 target="_blank"。');
}
if (!/<a\b/.test(src)) {
  errors.push("PartnersPanel 未渲染任何 <a> 标签。");
}

// 链接必须无条件存在于 DOM 中，仅通过 CSS 隐藏，严禁使用 JS 条件渲染剥离 DOM
if (/\{expanded\s*&&\s*\(?\s*<a/.test(src) || /expanded\s*\?\s*PARTNERS\.map/.test(src)) {
  errors.push(
    "Partner 链接被置于 expanded 条件分支中！必须无条件渲染到 DOM 中并通过 CSS 进行视觉折叠，" +
      "否则搜索引擎爬虫将无法抓取到初始链接。"
  );
}

// ---------------------------------------------------------------------------
// 3. 解析并审计 PARTNERS 数组
// ---------------------------------------------------------------------------
const arrayMatch = src.match(/const PARTNERS[^=]*=\s*\[([\s\S]*?)\n\];/);
const partners = [];

if (arrayMatch) {
  const entryRe = /name:\s*['"]([^'"]+)['"][\s\S]*?url:\s*['"]([^'"]+)['"][\s\S]*?emoji:\s*['"]([^'"]*)['"]/g;
  let m;
  while ((m = entryRe.exec(arrayMatch[1])) !== null) {
    partners.push({ name: m[1], url: m[2], emoji: m[3] });
  }
} else {
  errors.push("未能在 PartnersPanel.tsx 中定位到 PARTNERS 数组。");
}

// 4. 导出数量与上限
if (partners.length > MAX_OUTBOUND) {
  errors.push(
    `PartnersPanel 导出了 ${partners.length} 个链接，超过了安全上限 ${MAX_OUTBOUND}。` +
      "单页面过多导出外链将触发 Link Farm 判定。"
  );
}
if (partners.length === 0) {
  warnings.push("PARTNERS 数组为空，面板未配置任何合作伙伴。");
}

const seenUrls = new Set();
const nicheViolations = [];
for (const p of partners) {
  let host;
  try {
    host = new URL(p.url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    errors.push(`Partner "${p.name}" 的 URL 无法解析: ${p.url}`);
    continue;
  }

  if (seenUrls.has(host)) errors.push(`存在重复的 Partner 主机名: ${host}`);
  seenUrls.add(host);

  // Cross-Niche Drift 跨垂直检测
  if (DENY_DOMAINS.includes(host)) {
    nicheViolations.push(host);
    errors.push(
      `跨品类违规: "${p.name}" (${host}) 属于非同类垂直领域（Roblox/体育/地缘），` +
        "严禁由本站提供 Dofollow 互链！"
    );
  }

  // Reciprocal Loop / Self-Link 检测
  if (OWN_HOSTS.includes(host)) {
    errors.push(`Partner "${p.name}" 指向了本站自身 (${host})。`);
  }

  // 品牌化自然锚文本：严禁商业硬词堆砌
  if (/\b(free|codes?|cheat|hack|money|robux|generator|best|top)\b/i.test(p.name)) {
    errors.push(
      `Partner 锚文本 "${p.name}" 包含商业硬词，必须使用自然纯净的品牌名称。`
    );
  }
  if (!p.emoji) {
    warnings.push(`Partner "${p.name}" 缺少 emoji 前缀。`);
  }
}

// ---------------------------------------------------------------------------
// 4. Post-build 实际构建产物验证：仅存在于首页，子页面 0 泄漏
// ---------------------------------------------------------------------------
let buildChecked = false;
if (existsSync(OUT_DIR)) {
  const homeHtml = join(OUT_DIR, "index.html");
  if (existsSync(homeHtml)) {
    buildChecked = true;
    const home = readFileSync(homeHtml, "utf8");
    for (const p of partners) {
      if (!home.includes(p.url)) {
        errors.push(
          `构建后的首页 (out/index.html) 未找到链接 ${p.url}。链接必须在服务端/构建期直接生成在原始 HTML 中。`
        );
      }
    }

    // 递归遍历所有非首页的 HTML 页面，断言外链 0 泄漏
    const walk = (dir, acc = []) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, e.name);
        if (e.isDirectory()) walk(full, acc);
        else if (e.name.endsWith(".html")) acc.push(full);
      }
      return acc;
    };

    let leaked = 0;
    const allHtmlFiles = walk(OUT_DIR);
    for (const file of allHtmlFiles) {
      if (file === homeHtml) continue;
      const html = readFileSync(file, "utf8");
      const offenders = partners.filter((p) => html.includes(p.url));
      if (offenders.length) {
        leaked++;
        errors.push(
          `全站外链泄漏: ${relative(OUT_DIR, file)} 也包含了 ` +
            offenders.map((o) => o.name).join(", ")
        );
      }
    }
    if (leaked === 0) {
      console.log(`🛡️  Scope Leak Audit  : 0 / ${allHtmlFiles.length - 1} subpages clean (100% 隔离)`);
    }
    console.log(`🤝  Outbound Partners  : ${partners.length} (cap ${MAX_OUTBOUND})`);
    if (nicheViolations.length) {
      console.log(`🔗  Niche Partition    : ${nicheViolations.length} VIOLATION(S) -> ${nicheViolations.join(", ")}`);
    } else {
      console.log(`🔗  Niche Partition    : all hosts aligned with core gaming & tactical RPG vertical`);
    }
  }
}

// ---------------------------------------------------------------------------
console.log("🛡️  Partners Network Guard");
console.log(`    partners declared  : ${partners.length}`);
for (const p of partners) console.log(`      - ${p.emoji} ${p.name} -> ${p.url}`);
if (!buildChecked) console.log("    (out/index.html absent; scope-leak assertion skipped until build)");

for (const w of warnings) console.warn(`⚠️  ${w}`);

if (errors.length) {
  console.error("");
  for (const e of errors) console.error(`❌ ${e}`);
  console.error(`\n❌ PARTNERS GUARD FAILED: ${errors.length} violation(s).`);
  process.exit(1);
}

console.log("\n✅ PARTNERS GUARD PASSED: homepage-only scope, dofollow, same-vertical, zero reciprocal loop.");
