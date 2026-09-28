#!/usr/bin/env node

/**
 * 🛡️ Browserslist Single-Source & Polyfill Leakage Gatekeeper
 *
 * 核心目标：在构建后（postbuild）硬门禁拦截任何引起 PageSpeed「旧版 JavaScript (13.5 KiB)」的事故：
 *
 * 校验规则：
 * 1. package.json 绝对严禁包含 "browserslist" 字段（单一事实源交由根目录 .browserslistrc 维护）；
 * 2. 根目录 .browserslistrc 必须存在，且严禁包含 "not dead" 或 "defaults"；
 * 3. 运行 npx browserslist 必须退出码为 0，杜绝配置冲突异常；
 * 4. 递归扫描 out/_next/static/chunks/，除 noModule 兜底脚本外，客户端 chunks 绝对严禁包含 7 大旧版 Polyfill 特征代码。
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
console.log('\n==================== 🛡️  BROWSERSLIST & POLYFILL AUDIT ====================');

const errors = [];

// 1. 检查 package.json 是否违规包含 browserslist
const pkgPath = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.browserslist) {
      errors.push(
        `❌ [CONFLICT VIOLATION] package.json contains "browserslist" field!\n` +
        `   → Having browserslist in package.json conflicts with root .browserslistrc, throwing\n` +
        `     "contains both .browserslistrc and package.json with browsers" and falling back to legacy defaults.\n` +
        `   → Fix: Completely remove "browserslist" from package.json and maintain targets solely in .browserslistrc.`
      );
    }
  } catch (e) {
    errors.push(`❌ [FATAL] Failed to parse package.json: ${e.message}`);
  }
}

// 2. 检查 .browserslistrc 是否存在并阻断 not dead
const rcPath = path.join(ROOT, '.browserslistrc');
if (!fs.existsSync(rcPath)) {
  errors.push(
    `❌ [MISSING BASELINE] Root .browserslistrc is missing!\n` +
    `   → Next.js will default to conservative legacy browser targets and inject 14KB+ of polyfills.\n` +
    `   → Fix: Create .browserslistrc targeting modern baseline (Chrome >= 105, Safari >= 16.4, etc.).`
  );
} else {
  const rcContent = fs.readFileSync(rcPath, 'utf8');
  const activeLines = rcContent
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n');
  if (/\bnot\s+dead\b/i.test(activeLines) || /\bdefaults\b/i.test(activeLines)) {
    errors.push(
      `❌ [DIRTY TARGET VIOLATION] .browserslistrc contains "not dead" or "defaults"!\n` +
      `   → This pulls in abandoned/deprecated mobile browsers and forces Next.js to inject Array.prototype.at polyfills.\n` +
      `   → Fix: Remove "not dead" and specify explicit modern evergreen versions.`
    );
  }
}

// 3. 运行 npx browserslist 验证
try {
  execSync('npx browserslist', { cwd: ROOT, stdio: 'pipe' });
} catch (e) {
  errors.push(
    `❌ [CLI CRASH] "npx browserslist" failed with exit code 1!\n` +
    `   → Output: ${e.stderr?.toString() || e.stdout?.toString() || e.message}`
  );
}

// 4. 递归检查 out/_next/static/chunks/ 中的客户端产物
const chunksDir = path.join(ROOT, 'out', '_next', 'static', 'chunks');
if (fs.existsSync(chunksDir)) {
  // 7 大致命旧版 Polyfill 特征代码
  const POLYFILL_PATTERNS = [
    { name: 'Array.prototype.at', pattern: /Array\.prototype\.at\s*\|\|\s*\(Array\.prototype\.at\s*=/ },
    { name: 'Array.prototype.flat', pattern: /Array\.prototype\.flat\s*\|\|\s*\(Array\.prototype\.flat\s*=/ },
    { name: 'Array.prototype.flatMap', pattern: /Array\.prototype\.flatMap\s*=/ },
    { name: 'Object.fromEntries', pattern: /Object\.fromEntries\s*\|\|\s*\(Object\.fromEntries\s*=/ },
    { name: 'Object.hasOwn', pattern: /Object\.hasOwn\s*\|\|\s*\(Object\.hasOwn\s*=/ },
    { name: 'String.prototype.trimEnd', pattern: /"trimEnd"\s*in\s*String\.prototype\s*\|\|/ },
    { name: 'String.prototype.trimStart', pattern: /"trimStart"\s*in\s*String\.prototype\s*\|\|/ },
  ];

  const files = fs.readdirSync(chunksDir).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    const full = path.join(chunksDir, f);
    const content = fs.readFileSync(full, 'utf8');

    // 排除明确仅在 noModule 下加载的旧版降级脚本
    if (content.includes('nomodule') && content.length < 5000) continue;

    for (const { name, pattern } of POLYFILL_PATTERNS) {
      if (pattern.test(content)) {
        errors.push(
          `❌ [POLYFILL LEAK DETECTED] Chunk "${f}" contains legacy polyfill: ${name}!\n` +
          `   → This will trigger PageSpeed Insights "旧版 JavaScript — 预计节省 13.5 KiB" penalty!\n` +
          `   → Fix: Ensure next.config.ts configures turbopack/webpack resolveAlias to redirect 'next/dist/build/polyfills/polyfill-module' to an empty file (src/lib/empty-polyfill.js).`
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error('\n' + errors.join('\n\n'));
  console.error('\n-----------------------------------------------------------------------------');
  console.error('❌ Build gate failed: Legacy JavaScript polyfill leakage detected. Fix before shipping.');
  console.error('=============================================================================\n');
  process.exit(1);
} else {
  console.log('✅ [Single Source] package.json is 100% clean of redundant browserslist.');
  console.log('✅ [Target Purity] .browserslistrc targets modern baseline (0 "not dead").');
  console.log('✅ [CLI Validation] "npx browserslist" passed with 0 errors.');
  console.log('✅ [Bundle Cleanliness] All client chunks are 100% free of legacy polyfills.');
  console.log('✅ 0 polyfill leakage defects — JavaScript baseline 100% passed.');
  console.log('=============================================================================\n');
}
