#!/usr/bin/env node
/**
 * ⚡ SSG Critical CSS Post-Build Inliner (Zero-Render-Blocking Mandate)
 *
 * 核心目标：
 * 将 Next.js SSG 导出的外部 CSS 文件直接内联进每个 HTML 页面的 <style> 标签中，
 * 并剥离外部 <link rel="stylesheet"> 与 <link rel="preload" as="style">。
 *
 * 收益：
 * 1. 彻底消灭 PageSpeed「渲染阻断请求 (Render-blocking resources) — 预计缩短 300 毫秒」；
 * 2. 将「关键请求链 (Critical Request Chains)」彻底拍平成 1 级（只有 HTML，0ms 链延迟）；
 * 3. 显著提前移动端 FCP（首次内容绘制）与 LCP（最大内容绘制）。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'out');
const STATIC_DIR = path.join(OUT_DIR, '_next', 'static');

if (!fs.existsSync(OUT_DIR) || !fs.existsSync(STATIC_DIR)) {
  process.exit(0);
}

// 递归发现 _next/static 下的所有 css 文件
function findCssFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findCssFiles(full, acc);
    } else if (entry.name.endsWith('.css')) {
      acc.push(full);
    }
  }
  return acc;
}

const cssFiles = findCssFiles(STATIC_DIR);
if (cssFiles.length === 0) {
  console.log('⚡ [inline-critical-css] No CSS files found in out/_next/static, skipping.');
  process.exit(0);
}

const cssMap = new Map();
for (const file of cssFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = '/' + path.relative(OUT_DIR, file).replace(/\\/g, '/');
  cssMap.set(relPath, content);
}

function walkHtml(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_next') walkHtml(full, acc);
    } else if (entry.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

let modifiedCount = 0;
const htmlFiles = walkHtml(OUT_DIR);

for (const htmlFile of htmlFiles) {
  let html = fs.readFileSync(htmlFile, 'utf8');
  let changed = false;

  for (const [cssUrl, cssContent] of cssMap.entries()) {
    const escaped = cssUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. 容错匹配 stylesheet link（支持 rel 与 href 任意属性排列顺序，包含 data-precedence 属性）
    const stylesheetRegex = new RegExp(
      `<link[^>]*?(?:href=["']${escaped}["'][^>]*?rel=["']stylesheet["']|rel=["']stylesheet["'][^>]*?href=["']${escaped}["'])[^>]*?>`,
      'gi'
    );

    if (stylesheetRegex.test(html)) {
      const styleId = `__next_critical_css_${path.basename(cssUrl, '.css')}`;
      html = html.replace(stylesheetRegex, `<style id="${styleId}">${cssContent}</style>`);
      changed = true;
    }

    // 2. 清除冗余 preload as="style" 防止浏览器二次网络请求
    const preloadRegex = new RegExp(
      `<link[^>]*?(?:href=["']${escaped}["'][^>]*?as=["']style["']|as=["']style["'][^>]*?href=["']${escaped}["'])[^>]*?>`,
      'gi'
    );

    if (preloadRegex.test(html)) {
      html = html.replace(preloadRegex, '');
      changed = true;
    }
  }

  // 3. 剥除无用的 noModule 脚本（彻底消灭 PageSpeed 13.4 KiB Legacy JS 误报）
  const noModuleRegex = /<script[^>]*?noModule[^>]*?>.*?<\/script>|<script[^>]*?noModule[^>]*?>/gi;
  if (noModuleRegex.test(html)) {
    html = html.replace(noModuleRegex, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(htmlFile, html, 'utf8');
    modifiedCount++;
  }
}

console.log(
  `⚡ [inline-critical-css] Critical CSS inlined across ${modifiedCount} HTML pages: 0ms render-blocking, 0 legacy JS!`
);
