#!/usr/bin/env node

/**
 * 🛡️ UI & Layout Integrity Gatekeeper (全站核心布局、容器与 E-E-A-T 广告安全门禁)
 *
 * 核心目标：在构建阶段（postbuild）拦截任何因第三方清理脚本误删、
 * 语法丢失、样式重构或广告违规引起的事故：
 *
 * 校验规则：
 * 1. globals.css 必须存在且包含核心容器 `container-site`（必须有 max-width 与 margin 居中）；
 * 2. globals.css 必须包含 `overflow-x: clip`，杜绝移动端横向视口漂移；
 * 3. 若全站组件使用了 `grid-cols-5`，globals.css 必须包含 `@utility grid-cols-5`；
 * 4. 严禁出现组件依赖 `container-site` 但 CSS 毫无定义的情况；
 * 5. 广告安全区：AdWrapper 必须具备健壮的 Hero 过滤机制，严禁将广告直接挂载在 PageHeader / AuthorBanner 下方。
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CANDIDATE_CSS = [
  'src/lib/globals.css',
  'src/app/globals.css',
  'src/globals.css',
  'styles/globals.css',
  'app/globals.css',
];

console.log('\n==================== 🛡️  UI & LAYOUT INTEGRITY AUDIT ====================');

// 1. 定位 globals.css
let targetCssPath = null;
for (const rel of CANDIDATE_CSS) {
  const full = path.join(ROOT, rel);
  if (fs.existsSync(full)) {
    targetCssPath = full;
    break;
  }
}

if (!targetCssPath) {
  console.error('❌ [FATAL] No globals.css found in standard directories!');
  process.exit(1);
}

const cssContent = fs.readFileSync(targetCssPath, 'utf8');
const errors = [];

// 2. 检查核心容器 container-site
const hasContainerSite =
  cssContent.includes('container-site') &&
  cssContent.includes('max-width') &&
  (cssContent.includes('margin-inline') || cssContent.includes('margin'));

if (!hasContainerSite) {
  errors.push(
    `❌ [CRITICAL] Core layout container "container-site" is missing or corrupted in ${path.relative(ROOT, targetCssPath)}!\n` +
    `   → This will cause catastrophic full-width layout blowouts across all pages.\n` +
    `   → Fix: Add '@utility container-site { width: 100%; max-width: 64rem; margin-inline: auto; padding-inline: 1rem; }'`
  );
}

// 3. 检查根级横向滚动防抖 overflow-x: clip
const hasOverflowClip =
  cssContent.includes('overflow-x: clip') || cssContent.includes('overflow-x:clip') ||
  cssContent.includes('overflow-x: hidden') || cssContent.includes('overflow-x:hidden');

if (!hasOverflowClip) {
  errors.push(
    `⚠️ [WARNING] Root horizontal overflow guard ("overflow-x: clip") is missing in ${path.relative(ROOT, targetCssPath)}!\n` +
    `   → Fix: Ensure 'html, body { max-width: 100%; overflow-x: clip; }' is declared.`
  );
}

// 4. 递归检查全站源码
function scanFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === '.next' || item === '.git' || item === 'out') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...scanFiles(full, exts));
    } else if (exts.includes(path.extname(full))) {
      results.push(full);
    }
  }
  return results;
}

const srcDir = path.join(ROOT, 'src');
if (fs.existsSync(srcDir)) {
  const allSourceFiles = scanFiles(srcDir, ['.tsx', '.jsx', '.ts', '.js']);
  let usesGridCols5 = false;
  let usesContainerSite = false;

  for (const f of allSourceFiles) {
    const code = fs.readFileSync(f, 'utf8');
    if (code.includes('grid-cols-5')) usesGridCols5 = true;
    if (code.includes('container-site')) usesContainerSite = true;
  }

  // 若组件使用了 grid-cols-5，Tailwind v4 必须显式声明 @utility grid-cols-5
  if (usesGridCols5 && !cssContent.includes('grid-cols-5')) {
    errors.push(
      `❌ [CRITICAL] Component uses "grid-cols-5", but "@utility grid-cols-5" is not declared in globals.css!\n` +
      `   → In Tailwind v4, grid-cols-5 will silently fail and collapse to 2 columns on desktop.\n` +
      `   → Fix: Add '@utility grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }'`
    );
  }

  if (usesContainerSite && !hasContainerSite) {
    errors.push(
      `❌ [CRITICAL] Source files use "container-site", but it is completely missing from globals.css!`
    );
  }

  // 🛡️ 5. 广告与 Google E-E-A-T 安全区合规检查 (Content-First Mandate)
  const adWrapperFile = allSourceFiles.find((f) => path.basename(f) === 'AdWrapper.tsx');
  if (adWrapperFile) {
    const wrapperCode = fs.readFileSync(adWrapperFile, 'utf8');
    const hasBroadHeroFilter =
      wrapperCode.includes('data-hero') ||
      wrapperCode.includes('page-header') ||
      wrapperCode.includes('h1') ||
      wrapperCode.includes('data-ad-ignore');

    if (!hasBroadHeroFilter) {
      errors.push(
        `❌ [E-E-A-T VIOLATION] AdWrapper.tsx does not have robust PageHeader/Hero exclusion!\n` +
        `   → Relying solely on 'bg-noise' causes ads to inject directly below AuthorBanner and slice E-E-A-T.\n` +
        `   → Fix: Ensure 'data-hero', 'page-header', and 'h1' are explicitly excluded in candidate filter.`
      );
    }
  }

  // 检查是否有任何页面在 <PageHeader /> 之后立即紧邻插入广告
  for (const f of allSourceFiles) {
    const code = fs.readFileSync(f, 'utf8');
    if (code.includes('<PageHeader') && (code.includes('<NativeBannerAd') || code.includes('<AdBanner'))) {
      const immediateAdMatch = /<PageHeader[^>]*\/>\s*(?:<section[^>]*>\s*)?<(?:NativeBannerAd|AdBanner)/s.test(code);
      if (immediateAdMatch) {
        errors.push(
          `❌ [E-E-A-T VIOLATION] File ${path.relative(ROOT, f)} places an ad immediately beneath <PageHeader />!\n` +
          `   → This severs author credibility signals and triggers Google Page Layout penalties.\n` +
          `   → Fix: Move the ad AFTER the first substantive content section (Content-First rule).`
        );
      }
    }
  }

  // 🛡️ 6. 广告合规标识与 WCAG AA 对比度防守 (WCAG Contrast & Accessibility 100 Gate)
  for (const f of allSourceFiles) {
    const code = fs.readFileSync(f, 'utf8');
    const isAdComponent = /AdBanner|NativeBannerAd|AdSlot|SideAdSlots|BottomBannerAd/i.test(path.basename(f));
    const hasAdText = /SPONSORED|ADVERTISEMENT|FEATURED SPONSOR/i.test(code);

    if (isAdComponent || hasAdText) {
      // 1. 严禁在广告标签上使用透明度修饰符 (The Opacity Trap)
      const hasOpacityTrap = /<span[^>]*class(?:Name)?="[^"]*opacity-(?:30|40|50|60|70|80)[^"]*"[^>]*>\s*(?:SPONSORED|ADVERTISEMENT|FEATURED SPONSOR|ADSTERRA)/i.test(code) ||
                            /(?:SPONSORED|ADVERTISEMENT|FEATURED SPONSOR|ADSTERRA)[\s\S]{0,60}opacity-(?:30|40|50|60|70|80)/i.test(code);
      if (hasOpacityTrap) {
        errors.push(
          `❌ [WCAG AA VIOLATION] File ${path.relative(ROOT, f)} uses 'opacity-*' on ad disclaimer labels!\n` +
          `   → Opacity reduces contrast ratio below 4.5:1 and causes PageSpeed Accessibility score drops (e.g. 96).\n` +
          `   → Fix: Use solid high-contrast classes like 'text-zinc-400' without opacity.`
        );
      }

      // 2. 本站广告外框固定为深黑战术卡片 (bg-[#0c1016])，且 html 根标签不含 dark class。
      // 严禁在深黑卡片上使用过暗的文字 (text-zinc-500/600/700)，因对比度仅 2.5:1 ~ 4.39:1，低于 WCAG AA 4.5:1 并导致 PageSpeed 扣分
      const hasDarkCardLowContrast = /class(?:Name)?="[^"]*(?:\btext-(?:zinc|slate|gray|neutral)-(?:500|600|700|800)\b)[^"]*"[^>]*>[\s\S]{0,60}(?:SPONSORED|ADVERTISEMENT|FEATURED SPONSOR|ADSTERRA)/i.test(code) ||
                                     /(?:SPONSORED|ADVERTISEMENT|FEATURED SPONSOR|ADSTERRA)[\s\S]{0,60}class(?:Name)?="[^"]*(?:\btext-(?:zinc|slate|gray|neutral)-(?:500|600|700|800)\b)/i.test(code);
      if (hasDarkCardLowContrast) {
        errors.push(
          `❌ [WCAG AA VIOLATION] File ${path.relative(ROOT, f)} uses overly dark text (zinc/slate-500/600/700) on dark card ad labels!\n` +
          `   → On dark backgrounds (#0c1016), contrast is only 2.5:1 ~ 4.39:1, failing WCAG AA (>= 4.5:1) and dropping Lighthouse Accessibility.\n` +
          `   → Fix: Use 'text-zinc-400' (7.45:1) or 'text-zinc-300' (12.7:1) for verified WCAG AA compliance.`
        );
      }
    }
  }

  // 🛡️ 7. 全局微标无障碍与 WCAG AA 4.5:1 对比度门禁 (Zero-A11y-Drop Defense)
  for (const f of allSourceFiles) {
    const code = fs.readFileSync(f, 'utf8');
    const rel = path.relative(ROOT, f);

    // 7.1 检查未附加 aria-hidden 的修饰性 Unicode 小箭头 (&nearr;, &#8599;, ↗)
    const rawArrowRegex = /<span(?![^>]*\baria-hidden\b)[^>]*>(?:[^<]*?(?:&nearr;|&#8599;|↗)[^<]*?)<\/span>/gi;
    let arrowMatch;
    while ((arrowMatch = rawArrowRegex.exec(code)) !== null) {
      errors.push(
        `❌ [A11Y VIOLATION] File ${rel} renders decorative Unicode arrow without 'aria-hidden="true"':\n` +
        `   → Snippet: ${arrowMatch[0]}\n` +
        `   → Unicode entities are parsed as DOM text nodes. Without aria-hidden, screen readers announce them and Lighthouse enforces strict 4.5:1 color contrast, dropping Accessibility to 96.\n` +
        `   → Fix: Add 'aria-hidden="true"' and ensure >= 4.5:1 contrast (e.g. text-zinc-600 dark:text-zinc-300).`
      );
    }

    // 7.2 检查非暗黑固定背景组件裸用 400 级灰度作为亮色模式文字 (排除深黑卡片广告组件)
    const isDarkCardComponent = /AdSlot|NativeBannerAd|BottomBannerAd|SideAdSlots/i.test(path.basename(f));
    if (!isDarkCardComponent) {
      const bare400Regex = /class(?:Name)?="[^"]*(?<!dark:)\btext-(?:zinc|slate|gray|neutral)-400\b(?![^"]*dark:)[^"]*"/g;
      let bare400Match;
      while ((bare400Match = bare400Regex.exec(code)) !== null) {
        errors.push(
          `❌ [WCAG AA CONTRAST VIOLATION] File ${rel} uses bare 400-level gray without dark mode pairing:\n` +
          `   → Snippet: ${bare400Match[0]}\n` +
          `   → 400-level grays on light backgrounds have contrast only 2.3:1~2.8:1 (fails WCAG AA 4.5:1).\n` +
          `   → Fix: Use 'text-zinc-600 dark:text-zinc-400' (or dark:text-zinc-300).`
        );
      }
    }
  }

  // 🛡️ 8. 全站容器同源对齐检查 (Zero-Width-Drift Mandate)
  // 8.1 检查 Header.tsx, layout.tsx, Footer.tsx 三壳宽度是否锁死一致
  const headerFile = path.join(ROOT, 'src', 'components', 'Header.tsx');
  const layoutFile = path.join(ROOT, 'src', 'app', 'layout.tsx');
  const footerFile = path.join(ROOT, 'src', 'components', 'Footer.tsx');

  const getContainerToken = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    const code = fs.readFileSync(filePath, 'utf8');
    if (code.includes('container-site')) return 'container-site';
    const m = code.match(/\bmax-w-(?:4xl|5xl|6xl|7xl)\b/);
    return m ? m[0] : null;
  };

  const headerToken = getContainerToken(headerFile);
  const layoutToken = getContainerToken(layoutFile);
  const footerToken = getContainerToken(footerFile);

  if (headerToken && layoutToken && headerToken !== layoutToken) {
    errors.push(
      `❌ [TRIPLE-SHELL MISALIGNMENT] Header container (${headerToken}) diverges from layout container (${layoutToken})!\n` +
      `   → This creates an unaligned "mushroom umbrella" visual defect across the entire site.\n` +
      `   → Fix: Unify Header.tsx to use '${layoutToken}' or '@utility container-site'.`
    );
  }
  if (footerToken && layoutToken && footerToken !== layoutToken) {
    errors.push(
      `❌ [TRIPLE-SHELL MISALIGNMENT] Footer container (${footerToken}) diverges from layout container (${layoutToken})!\n` +
      `   → Fix: Unify Footer.tsx to use '${layoutToken}' or '@utility container-site'.`
    );
  }

  // 6.2 检查 src/app/**/page.tsx 中是否出现硬编码的 max-w-4xl, max-w-5xl, max-w-6xl 顶层容器
  const appDir = path.join(ROOT, 'src', 'app');
  if (fs.existsSync(appDir)) {
    const pageFiles = scanFiles(appDir, ['.tsx']).filter((f) => path.basename(f) === 'page.tsx');
    for (const pf of pageFiles) {
      const pageCode = fs.readFileSync(pf, 'utf8');
      const relPf = path.relative(ROOT, pf);
      const rogueMatch = pageCode.match(/<(?:div|main)\s+className="[^"]*mx-auto\s+max-w-(?:4xl|5xl|6xl)[^"]*"/);
      if (rogueMatch) {
        errors.push(
          `❌ [CONTAINER MISALIGNMENT] Page ${relPf} hardcodes ad-hoc container: ${rogueMatch[0]}!\n` +
          `   → This violates the Zero-Width-Drift mandate and causes header/content width mismatches.\n` +
          `   → Fix: Use the project's unified layout container (e.g. "container-site" or "page-container").`
        );
      }
    }
  }

  // 6.3 检查 public/images/ 中是否存在未压缩的大体积 PNG 图片 (>60KB)
  const imagesDir = path.join(ROOT, 'public', 'images');
  if (fs.existsSync(imagesDir)) {
    const imgFiles = scanFiles(imagesDir, ['.png']);
    for (const imgF of imgFiles) {
      const stat = fs.statSync(imgF);
      const sizeKb = Math.round(stat.size / 1024);
      if (sizeKb > 60) {
        errors.push(
          `❌ [UNCOMPRESSED PNG ASSET] Image ${path.relative(ROOT, imgF)} is ${sizeKb}KB (>60KB)!\n` +
          `   → Rendering raw uncompressed PNGs destroys mobile PageSpeed LCP and triggers 150KB+ penalties.\n` +
          `   → Fix: Convert to high-performance WebP using sharp (quality: 75, effort: 6) and reference the .webp path.`
        );
      }
    }
  }

  // 6.4 🛡️ 导航栏与页脚 Logo 延迟加载与 LCP 预加载防劫持门禁 (Header/Footer Logo LCP Preload Guard)
  const navComponentFiles = allSourceFiles.filter((f) => {
    const name = path.basename(f);
    return name === 'Header.tsx' || name === 'Footer.tsx';
  });

  for (const f of navComponentFiles) {
    const code = fs.readFileSync(f, 'utf8');
    const rel = path.relative(ROOT, f);
    const imgMatches = code.matchAll(/<img[^>]*src=["'][^"']*(?:logo|brand|icon|favicon)[^"']*["'][^>]*>/gi);
    for (const match of imgMatches) {
      const tag = match[0];
      const hasLowPriority = /fetchPriority=["']low["']/.test(tag);
      const hasLazy = /loading=["']lazy["']/.test(tag);
      if (!hasLowPriority || !hasLazy) {
        errors.push(
          `❌ [LCP PRELOAD HIJACKING HAZARD] File ${rel} renders a logo/brand image without low fetchPriority!\n` +
          `   → Offending tag: ${tag}\n` +
          `   → Next.js 15/16 + React 19 auto-hoists bare <img> in Header to <head> as high-priority <link rel="preload">, hijacking bandwidth from the true LCP Hero image (LCP drops to 2.9s)!\n` +
          `   → Fix: Add 'loading="lazy" fetchPriority="low" decoding="async"' to the <img> tag.`
        );
      }
    }
  }

  // 6.5 检查 out/ 静态导出产物（若存在）中是否出现 logo preload 劫持
  const outIndexPath = path.join(ROOT, 'out', 'index.html');
  if (fs.existsSync(outIndexPath)) {
    const html = fs.readFileSync(outIndexPath, 'utf8');
    const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
    if (headMatch) {
      const headHtml = headMatch[0];
      const logoPreloadMatch = headHtml.match(/<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*(?:logo|brand)[^"']*["'][^>]*>/i);
      if (logoPreloadMatch) {
        errors.push(
          `❌ [LCP PRELOAD HIJACKED IN OUT/INDEX.HTML] Logo preload link detected in <head>:\n` +
          `   → ${logoPreloadMatch[0]}\n` +
          `   → This hijacks the browser's first high-priority network channel away from the LCP Hero image.\n` +
          `   → Fix: Ensure Header.tsx logo image has 'loading="lazy" fetchPriority="low" decoding="async"'.`
        );
      }
    }
  }

  // 6.6 🛡️ 页面可见元素脱壳防灾门禁 (Naked Elements Outside Container-Site Guard)
  const appPages = allSourceFiles.filter(
    (f) => path.dirname(f).includes('src' + path.sep + 'app') && path.basename(f).startsWith('page.')
  );

  for (const pf of appPages) {
    const code = fs.readFileSync(pf, 'utf8');
    const relPf = path.relative(ROOT, pf);
    const lastSection = code.lastIndexOf('</section>');
    if (lastSection !== -1) {
      const tail = code.substring(lastSection + 10)
        .replace(/<VideoSpotlight[\s\S]*?\/>/g, '')
        .replace(/<JsonLd[\s\S]*?\/>/g, '')
        .replace(/<AdSlot[\s\S]*?\/>/g, '')
        .replace(/<Footer[\s\S]*?\/>/g, '')
        .replace(/<\/main>/g, '')
        .replace(/<\/>/g, '')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/export[\s\S]*/g, '')
        .trim();

      const hasNakedElements =
        /(?:<h[1-6]|<p\b|<table\b|<ul\b|<ol\b|<div(?![^>]*container-site))/i.test(tail) &&
        !tail.includes('container-site');

      if (hasNakedElements) {
        errors.push(
          `❌ [NAKED ELEMENTS OUTSIDE CONTAINER] Page ${relPf} has naked visible elements after </section>!\n` +
          `   → Snippet: ${tail.substring(0, 150).replace(/\s+/g, ' ')}\n` +
          `   → These elements render unconstrained at 100vw, clipping against the screen edge and creating a massive negative space black hole.\n` +
          `   → Fix: Move all content inside <section className="container-site ..."> before </section>.`
        );
      }
    }
  }
}

// 7. 结果评估
if (errors.length > 0) {
  console.error('\n' + errors.join('\n\n'));
  console.error('\n-----------------------------------------------------------------------------');
  console.error('❌ Build gate failed: UI layout, E-E-A-T ad or LCP integrity violated. Fix the errors above before shipping.');
  console.error('=============================================================================\n');
  process.exit(1);
} else {
  console.log(`✅ [CSS Integrity] Checked: ${path.relative(ROOT, targetCssPath)}`);
  console.log('✅ [Container Defense] Core container "container-site" verified intact.');
  console.log('✅ [Viewport Guard] "overflow-x: clip" verified intact.');
  console.log('✅ [E-E-A-T Ad Defense] Hero exclusion and Content-First ad placement verified safe.');
  console.log('✅ [LCP Preload Guard] Header/Footer brand logo priority and preload immunity verified.');
  console.log('✅ 0 layout & ad safety defects — Site integrity 100% passed.');
  console.log('=============================================================================\n');
}
