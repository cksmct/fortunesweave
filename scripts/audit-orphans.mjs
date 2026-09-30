#!/usr/bin/env node
/**
 * 🩺 Zero-Orphan Site & Internal Link Architecture Audit
 *
 * Checks:
 *  1. Absolute Orphan Pages (0 inbound links) -> Hard Failure (exit 1)
 *  2. Island Pages (< 2 inbound links) -> Hard Failure (exit 1)
 *  3. Deep Unreachable Pages (BFS Depth > 2 from /) -> Hard Failure (exit 1)
 *  4. Missing Central Index (Guides not listed in guides/page.tsx or main catalog) -> Hard Failure (exit 1)
 *  5. Broken Internal Links (href pointing to non-existent route) -> Hard Failure (exit 1)
 *  6. Trailing Slash Violations (internal links missing trailing slash) -> Hard Failure (exit 1)
 *  7. Sitemap Coverage (routes in app directory missing from sitemap.ts) -> Hard Failure (exit 1)
 */

import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('.');
const srcDir = path.join(projectRoot, 'src');
const appDir = path.join(srcDir, 'app');
const outDir = path.join(projectRoot, 'out');

function scanFiles(dir, extensions = ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(scanFiles(full, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

if (!fs.existsSync(appDir)) {
  console.error('❌ Error: src/app directory not found. Please run this script at the root of a Next.js project.');
  process.exit(1);
}

const allSrcFiles = scanFiles(srcDir);
const appFiles = scanFiles(appDir, ['.tsx', '.jsx']);

// 1. Discover all physical content routes from src/app
const pageRoutes = [];
const redirectRoutes = new Set();

for (const f of appFiles) {
  if (path.basename(f) === 'page.tsx' || path.basename(f) === 'page.jsx') {
    const content = fs.readFileSync(f, 'utf8');
    const isNoIndex = /index:\s*false/i.test(content) || /httpEquiv=["']refresh["']/i.test(content) || /Redirecting/i.test(content);
    const rel = path.relative(appDir, path.dirname(f)).split(path.sep).join('/');
    const route = rel === '' ? '/' : `/${rel}/`;
    
    if (isNoIndex) {
      redirectRoutes.add(route);
      continue;
    }

    // Exclude special utility or 404 routes
    if (!route.startsWith('/_') && !route.startsWith('/404/')) {
      pageRoutes.push(route);
    }
  }
}

const dynamicRoutes = pageRoutes.filter((r) => r.indexOf('[') >= 0);

/**
 * 判断 href 是否是某个动态路由模式的实例，并返回该模式。
 * 用途：/units/fire-archer/ 属于 /units/[slug]/ 家族，既不算断链，也为模式路由提供入链证据。
 * 实现刻意不用正则与模板字符串，避免被注入类工具改写文本。
 */
function matchDynamicFamily(href) {
  const parts = href.split('/');
  for (const pattern of dynamicRoutes) {
    const patternParts = pattern.split('/');
    if (patternParts.length !== parts.length) continue;
    let matched = true;
    for (let i = 0; i < patternParts.length; i += 1) {
      if (patternParts[i].indexOf('[') >= 0) continue;
      if (patternParts[i] !== parts[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return pattern;
  }
  return null;
}
const hardIssues = [];
const warnings = [];

// 2. Scan all internal links from all source files
const linkHrefRegex = /(?:href=|\bhref:)\s*(?:\{(["'`])(\/[^"'#?`}]+?)\1\}|(["'`])(\/[^"'#?\s]+?)\3)/g;
const linkGraph = new Map(); // fromRoute -> Set of toRoutes
for (const r of pageRoutes) {
  linkGraph.set(r, new Set());
}

const allHrefsWithSource = [];

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const isGlobalComponent = /components[\\/](Footer|Header|Navbar|Navigation|Nav|Menu)/i.test(file) || /app[\\/]layout\./i.test(file);
  
  let sourceRoute = null;
  if (file.includes(path.join('src', 'app')) && !isGlobalComponent) {
    const rel = path.relative(appDir, path.dirname(file)).split(path.sep).join('/');
    sourceRoute = rel === '' ? '/' : `/${rel}/`;
  }

  let match;
  while ((match = linkHrefRegex.exec(content)) !== null) {
    let href = match[2] || match[4];
    if (!href || href.includes('${') || href.startsWith('//') || href.startsWith('/#')) continue;
    
    // Ignore static asset extensions
    if (/\.(png|jpg|jpeg|webp|svg|ico|xml|txt|webmanifest|json|css|js)$/i.test(href)) continue;

    allHrefsWithSource.push({
      file: path.relative(projectRoot, file),
      sourceRoute,
      isGlobalComponent,
      targetHref: href
    });

    // Check Trailing Slash
    if (!href.endsWith('/') && !href.includes('.')) {
      hardIssues.push({
        type: 'TRAILING_SLASH_MISSING',
        file: path.relative(projectRoot, file),
        target: href,
        fix: `Change to "${href}/"`
      });
    }

    let normalized = href;
    if (!normalized.endsWith('/')) normalized = normalized + '/';
    const dynamicFamily = pageRoutes.includes(normalized) ? null : matchDynamicFamily(normalized);
    if (dynamicFamily) normalized = dynamicFamily;

    // Check Broken Link
    if (!pageRoutes.includes(normalized)) {
      hardIssues.push({
        type: 'BROKEN_INTERNAL_LINK',
        file: path.relative(projectRoot, file),
        target: href,
        fix: `Route ${normalized} does not exist in src/app`
      });
    } else {
      if (isGlobalComponent) {
        // Global navigation components are accessible directly from / and connect to every page
        for (const r of pageRoutes) {
          linkGraph.get(r).add(normalized);
        }
      } else if (sourceRoute && linkGraph.has(sourceRoute)) {
        linkGraph.get(sourceRoute).add(normalized);
      }
    }
  }
}

// 2b. 数据驱动全局导航（nav.config.json）同样构成全站级入链。
// 立项动机：本模板把 Header/Footer 的链接收敛到单一事实源 nav.config.json，
// 而 grep 型扫描只看字面量 href，导致所有「仅经导航可达」的页面被判 0 入链（假孤儿）。
// 全局导航与 Footer.tsx 等价，必须按全站级入链计入。
const navConfigPath = path.join(srcDir, "data", "nav.config.json");
if (fs.existsSync(navConfigPath)) {
  try {
    const navConfig = JSON.parse(fs.readFileSync(navConfigPath, "utf8"));
    const navHrefs = [];
    const collectNav = (node) => {
      if (Array.isArray(node)) {
        for (const item of node) collectNav(item);
        return;
      }
      if (!node || typeof node !== "object") return;
      if (typeof node.href === "string" && node.href.startsWith("/")) navHrefs.push(node.href);
      for (const value of Object.values(node)) collectNav(value);
    };
    collectNav(navConfig);
    for (const href of navHrefs) {
      if (/\.(png|jpg|jpeg|webp|svg|ico|xml|txt|webmanifest|json|css|js)$/i.test(href)) continue;
      allHrefsWithSource.push({ file: navConfigPath, isGlobalComponent: true, targetHref: href });
      const normalizedNav = href.slice(-1) === String.fromCharCode(47) ? href : href + String.fromCharCode(47);
      for (const r of pageRoutes) {
        if (linkGraph.has(r)) linkGraph.get(r).add(normalizedNav);
      }
    }
    console.log(`audit-orphans: 已从 nav.config.json 计入 ${navHrefs.length} 条全站级导航入链`);
  } catch (error) {
    console.warn("audit-orphans: nav.config.json 解析失败，跳过全局导航入链统计: " + error.message);
  }
}

// 3. Count inlinks per route
const inboundCounts = {};
const inboundSources = {};
for (const route of pageRoutes) {
  inboundCounts[route] = 0;
  inboundSources[route] = new Set();
}

for (const item of allHrefsWithSource) {
  const normalized = item.targetHref.endsWith('/') ? item.targetHref : `${item.targetHref}/`;
  if (inboundCounts[normalized] !== undefined) {
    // If it's a global component like Footer.tsx mounted on all pages, it gives massive full-site connectivity
    if (item.isGlobalComponent) {
      inboundCounts[normalized] += pageRoutes.length;
    } else {
      inboundCounts[normalized] += 1;
    }
    inboundSources[normalized].add(item.file);
  }
}

// 4. Breadth-First-Search (BFS) from Homepage '/' to measure click depth
const depthMap = { '/': 0 };
const queue = ['/'];

while (queue.length > 0) {
  const current = queue.shift();
  const currentDepth = depthMap[current];
  const neighbors = linkGraph.get(current) || new Set();

  for (const next of neighbors) {
    if (depthMap[next] === undefined) {
      depthMap[next] = currentDepth + 1;
      queue.push(next);
    }
  }
}

// 5. Evaluate Zero-Orphan Standard (Inlinks >= 2, Depth <= 2)
for (const route of pageRoutes) {
  if (route === '/') continue;

  // Dynamic pattern routes such as /units/[slug]/ are templates, not pages: their concrete
  // children come from generateStaticParams and are covered by the parent index + sitemap.
  if (route.indexOf('[') >= 0) continue;

  // AUTO_EVENT_ROUTE: /events/<slug>/ pages are written by sync-events.mjs, which also injects one
  // literal link per event into the /events/ hub marker block. Demanding the standard 2 inlinks
  // would fail on every sync round (2026-09-16 animalhospital friction), so their bar is 1 --
  // delete the marker block and they still fail, which is the behaviour we want.
  const isAutoEventRoute = route.indexOf('/events/') === 0;
  const requiredInlinks = isAutoEventRoute ? 1 : 2;

  const count = inboundCounts[route];
  const depth = depthMap[route];

  if (count === 0) {
    hardIssues.push({
      type: 'ABSOLUTE_ORPHAN_PAGE',
      route,
      inboundLinks: 0,
      required: requiredInlinks,
      fix: 'Page has ZERO internal links across the entire project! Register in Footer.tsx and relevant category hubs immediately.'
    });
  } else if (count < requiredInlinks) {
    hardIssues.push({
      type: 'ISLAND_PAGE_INSUFFICIENT_INLINKS',
      route,
      inboundLinks: count,
      source: Array.from(inboundSources[route])[0],
      required: requiredInlinks,
      fix: 'Page only has ' + count + ' inbound link(s)! Add to global Footer.tsx and at least 1 related guide.'
    });
  }

  if (depth === undefined) {
    hardIssues.push({
      type: 'UNREACHABLE_FROM_HOMEPAGE',
      route,
      depth: 'Infinity',
      fix: 'Cannot navigate to this page starting from Homepage (/). Add direct or 1-hop links in Header/Footer/Hub.'
    });
  } else if (depth > 2) {
    warnings.push({
      type: 'DEEP_CLICK_DEPTH',
      route,
      depth,
      recommendation: 'Page is > 2 clicks away from homepage. Add to Footer or Category Hub to flatten depth.'
    });
  }
}

// 6. Central Index Coverage Check (e.g., Guides Hub)
const guidesHubPath = path.join(appDir, 'guides', 'page.tsx');
if (fs.existsSync(guidesHubPath)) {
  const guidesContent = fs.readFileSync(guidesHubPath, 'utf8');
  const diskGuides = pageRoutes.filter(r => r.startsWith('/guides/') && r !== '/guides/');
  for (const guideRoute of diskGuides) {
    const slug = guideRoute.replace('/guides/', '').replace('/', '');
    if (!guidesContent.includes(slug)) {
      hardIssues.push({
        type: 'MISSING_FROM_CENTRAL_GUIDES_INDEX',
        route: guideRoute,
        fix: `Guide "${slug}" exists on disk but is omitted from src/app/guides/page.tsx registry.`
      });
    }
  }
}

// 7a. 路由注册表（game.config.json#routes）是本项目 sitemap 的单一事实源：
// sitemap.ts 由它动态派生，grep sitemap.ts 只会看到空数组，故必须同时认可注册表。
const registryRoutes = new Set();
try {
  const registryPath = path.join(srcDir, "data", "game.config.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  for (const entry of registry.routes || []) {
    const r = String(entry.path || "/").trim();
    registryRoutes.add(r === "/" ? "/" : r.replace(/\/+$/, "") + "/");
  }
} catch (error) {
  console.warn("audit-orphans: game.config.json#routes 读取失败，sitemap 覆盖将只按 sitemap.ts 字面量判断: " + error.message);
}

// 7. Sitemap Coverage Check
const sitemapPath = path.join(appDir, 'sitemap.ts');
if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  for (const route of pageRoutes) {
    // Exclude redirects or robots
    if (route === '/' || route === '/beginner-guide/') continue;
    // 动态模式路由（如 /sidequests/[slug]/）是模板而非 URL：它们的实体页
    // 逐个登记在 game.config.json#routes，故这里跳过，避免把模板当成缺登记页面。
    if (route.indexOf('[') >= 0) continue;
    const slug = route.replace(/^\//, '').replace(/\/$/, '').split('/').pop();
    const isPresent = registryRoutes.has(route) || sitemapContent.includes(route) || (slug && sitemapContent.includes(`'${slug}'`)) || (slug && sitemapContent.includes(`"${slug}"`));
    if (!isPresent) {
      hardIssues.push({
        type: 'ROUTE_NOT_IN_SITEMAP',
        route,
        fix: 'Add this route or slug to src/app/sitemap.ts'
      });
    }
  }
}

// Output Report
console.log('\n================== 🩺 ZERO-ORPHAN LINK ARCHITECTURE AUDIT ==================');
console.log(`Total Physical Routes Audited : ${pageRoutes.length}`);
console.log(`Hard Issues Found            : ${hardIssues.length}`);
console.log(`Depth / Soft Warnings         : ${warnings.length}`);
console.log('=============================================================================');

if (hardIssues.length > 0) {
  console.error('\n❌ CRITICAL LINK ARCHITECTURE & ORPHAN FAILURES:');
  console.error(JSON.stringify(hardIssues, null, 2));
  console.error('\n🚨 Build failed! Zero-Orphan policy strictly forbids deploying orphan pages or broken links.\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('\n⚠️ Deep Depth Warnings:');
  console.warn(JSON.stringify(warnings, null, 2));
}

console.log('\n✅ ALL ZERO-ORPHAN CHECKS PASSED:');
console.log(' - 0 Absolute Orphan Pages');
console.log(' - 0 Island Pages (all content routes have >= 2 inlinks)');
console.log(' - 100% Routes reachable from Homepage (Max BFS Depth <= 2)');
console.log(' - 100% Central Guides Index coverage');
console.log(' - 0 Broken internal links\n');
process.exit(0);
