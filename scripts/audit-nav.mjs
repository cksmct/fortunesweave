#!/usr/bin/env node
/**
 * audit-nav.mjs — 导航单一事实源门禁
 *
 * 拦截三类问题（每一类都对应过一次真实事故）：
 *  1. Header / Footer 各自硬编码导航数组 → 站点增长后头尾分叉；
 *  2. 导航里的内部 href 没有对应的 src/app/<path>/page.tsx → 全站 404；
 *  3. 重复 href / 空 label / 空分组。
 *
 * 单一事实源 = `src/data/nav.config.json`。
 * 若项目未使用该文件（例如导航来自 src/data/site.ts 的 navLinks），
 * 本脚本降级为「路由存在性检查」：扫描 src/ 下所有内部 href，逐个核对 page.tsx，
 * 不因缺少 nav.config.json 而硬失败（打印 NOTICE，exit 0 当且仅当无坏链）。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'src', 'app');
const NAV_FILE = path.join(ROOT, 'src', 'data', 'nav.config.json');

const errors = [];
const notices = [];

if (!fs.existsSync(APP_DIR)) {
  console.error('❌ audit-nav: 未找到 src/app，请在本项目根目录运行。');
  process.exit(1);
}

function isInternal(href) {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
}

function routeExists(href) {
  const clean = href.split('?')[0].split('#')[0];
  if (clean === '/' || clean === '') return fs.existsSync(path.join(APP_DIR, 'page.tsx'));
  const dir = path.join(APP_DIR, clean.replace(/^\/|\/$/g, ''));
  return (
    fs.existsSync(path.join(dir, 'page.tsx')) ||
    fs.existsSync(path.join(dir, 'route.ts')) ||
    fs.existsSync(path.join(dir, 'route.tsx'))
  );
}

function checkLink(link, where) {
  if (!link || typeof link !== 'object') {
    errors.push(`${where}: 链接项不是对象`);
    return;
  }
  if (!link.label || !String(link.label).trim()) errors.push(`${where}: 缺少 label（href=${link.href}）`);
  if (!link.href || !String(link.href).trim()) {
    errors.push(`${where}: 缺少 href（label=${link.label}）`);
    return;
  }
  if (isInternal(link.href)) {
    if (!routeExists(link.href)) {
      errors.push(`${where}: 内部链接无对应页面 → ${link.href}（缺 src/app/${link.href.replace(/^\/|\/$/g, '')}/page.tsx）`);
    }
  } else if (!/^https?:\/\//i.test(link.href)) {
    errors.push(`${where}: 外部链接必须显式带 http(s):// → ${link.href}`);
  }
}

const seen = new Map();
function checkDuplicate(link, where) {
  if (!isInternal(link?.href)) return;
  const prev = seen.get(link.href);
  if (prev) errors.push(`${where}: 重复 href ${link.href}（已在 ${prev} 出现）`);
  else seen.set(link.href, where);
}

// ── 公测：Header / Footer 是否偷偷硬编码导航数组 ──────────────────────────
const navComponents = [
  path.join(ROOT, 'src', 'components', 'Header.tsx'),
  path.join(ROOT, 'src', 'components', 'Footer.tsx'),
];
const HARDCODED_NAV_RE = /(?:NAV_LINKS|navLinks|FOOTER_LINKS|pageLinks|guideLinks)\s*(?::[^=]+)?=\s*\[/;
for (const file of navComponents) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  if (HARDCODED_NAV_RE.test(src)) {
    errors.push(
      `${path.relative(ROOT, file)}: 检测到硬编码导航数组 → 必须改为从 @/lib/nav 读取（导航单一事实源 src/data/nav.config.json），否则 Header/Footer 会分叉。`,
    );
  }
}

// ── 主检查：nav.config.json ─────────────────────────────────────────────
if (!fs.existsSync(NAV_FILE)) {
  notices.push(
    'NOTICE: 未找到 src/data/nav.config.json → 降级为「全站内部链接路由存在性检查」。建议尽快迁移到 nav.config.json 单源。',
  );

  const hrefRe = /href\s*=\s*(?:\{)?["'`](\/[^"'`#?]*)/g;
  const srcDir = path.join(ROOT, 'src');
  const files = [];
  (function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(full);
    }
  })(srcDir);

  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = hrefRe.exec(src)) !== null) {
      const href = m[1];
      if (href.includes('${')) continue;
      if (/\.(png|jpe?g|webp|svg|ico|xml|txt|webmanifest|json|css|js|pdf)$/i.test(href)) continue;
      if (!routeExists(href)) {
        errors.push(`${path.relative(ROOT, file)}: 内部链接无对应页面 → ${href}`);
      }
    }
  }
} else {
  let nav;
  try {
    nav = JSON.parse(fs.readFileSync(NAV_FILE, 'utf8'));
  } catch (e) {
    console.error(`❌ audit-nav: ${path.relative(ROOT, NAV_FILE)} 解析失败: ${e.message}`);
    process.exit(1);
  }

  const top = nav?.header?.top ?? [];
  const groups = nav?.header?.groups ?? [];
  const footerColumns = nav?.footer?.columns ?? [];
  const legal = nav?.footer?.legal ?? [];

  if (top.length === 0) errors.push('nav.config.json: header.top 为空');
  if (groups.length === 0) errors.push('nav.config.json: header.groups 为空');
  if (footerColumns.length === 0) errors.push('nav.config.json: footer.columns 为空');

  const headerSeen = new Map();
  const footerSeen = new Map();

  function checkHeaderDuplicate(link, where) {
    if (!isInternal(link?.href)) return;
    const prev = headerSeen.get(link.href);
    if (prev) errors.push(`${where}: Header 重复 href ${link.href}（已在 ${prev} 出现）`);
    else headerSeen.set(link.href, where);
  }

  function checkFooterDuplicate(link, where) {
    if (!isInternal(link?.href)) return;
    const prev = footerSeen.get(link.href);
    if (prev) errors.push(`${where}: Footer 重复 href ${link.href}（已在 ${prev} 出现）`);
    else footerSeen.set(link.href, where);
  }

  top.forEach((l, i) => {
    checkLink(l, `header.top[${i}]`);
    checkHeaderDuplicate(l, `header.top[${i}]`);
  });

  groups.forEach((g, gi) => {
    if (!g?.label) errors.push(`header.groups[${gi}]: 缺少 label`);
    if (!Array.isArray(g?.columns) || g.columns.length === 0) {
      errors.push(`header.groups[${gi}](${g?.label ?? '?'}): columns 为空`);
      return;
    }
    g.columns.forEach((c, ci) => {
      if (!c?.title) errors.push(`header.groups[${gi}].columns[${ci}]: 缺少 title`);
      if (!Array.isArray(c?.items) || c.items.length === 0) {
        errors.push(`header.groups[${gi}].columns[${ci}](${c?.title ?? '?'}): items 为空`);
        return;
      }
      c.items.forEach((l, li) => {
        const where = `header.groups[${gi}].columns[${ci}].items[${li}]`;
        checkLink(l, where);
        checkHeaderDuplicate(l, where);
      });
    });
  });

  footerColumns.forEach((col, ci) => {
    if (!col?.title) errors.push(`footer.columns[${ci}]: 缺少 title`);
    if (!Array.isArray(col?.links) || col.links.length === 0) {
      errors.push(`footer.columns[${ci}](${col?.title ?? '?'}): links 为空`);
      return;
    }
    col.links.forEach((l, li) => {
      const where = `footer.columns[${ci}].links[${li}]`;
      checkLink(l, where);
      checkFooterDuplicate(l, where);
    });
  });

  legal.forEach((l, i) => {
    checkLink(l, `footer.legal[${i}]`);
    checkFooterDuplicate(l, `footer.legal[${i}]`);
  });

  // ── 全域覆盖检查（Nav Coverage Gate）：确保业务路由至少在 Header 或 Footer 中出现 ──
  const allNavHrefs = new Set([...headerSeen.keys(), ...footerSeen.keys()]);
  const normalizeHref = (h) => h.replace(/^\/|\/$/g, '');
  const navHrefsNormalized = new Set([...allNavHrefs].map(normalizeHref));

  const appRoutes = [];
  (function findAppRoutes(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        findAppRoutes(path.join(dir, e.name), prefix ? `${prefix}/${e.name}` : e.name);
      } else if (e.name === 'page.tsx' || e.name === 'page.jsx') {
        const route = prefix || '';
        if (route && !route.startsWith('_') && !route.startsWith('api')) {
          appRoutes.push(route);
        }
      }
    }
  })(APP_DIR);

  const missingFromNav = appRoutes.filter((r) => !navHrefsNormalized.has(r));
  if (missingFromNav.length > 0) {
    notices.push(
      `检测到 ${missingFromNav.length} 个业务路由未在 Header 或 Footer 中配置入口（可能成为信息孤岛）：\n      ` +
        missingFromNav.slice(0, 10).map((r) => `/${r}`).join(', ') +
        (missingFromNav.length > 10 ? ` ...等共 ${missingFromNav.length} 个` : '') +
        '\n      请及时扩充 Header 下拉分类或 Footer 全景站点地图以消除孤儿路由。',
    );
  }
}

for (const n of notices) console.warn(`⚠️  ${n}`);

if (errors.length) {
  console.error('\n❌ audit-nav: 导航门禁未通过');
  for (const e of errors) console.error('   - ' + e);
  console.error('\n修复提示：所有导航链接统一改到 src/data/nav.config.json（经 @/lib/nav 读取），并确保每个 href 都有对应 page.tsx。\n');
  process.exit(1);
}

console.log('✅ audit-nav: 导航单一事实源检查通过（无坏链、无重复、无硬编码导航数组）');
process.exit(0);
