#!/usr/bin/env node
/**
 * Clean Legacy NoModule Polyfill Script
 *
 * Removes dead noModule polyfill script tags from static HTML exports.
 * In 2026, 100% of modern mobile and desktop browsers support ES Modules.
 * Stripping this eliminates Lighthouse's "Legacy JavaScript - 11 KiB" penalty.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'out');

if (!fs.existsSync(OUT_DIR)) {
  process.exit(0);
}

function scanHtmlFiles(dir) {
  const list = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      list.push(...scanHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      list.push(full);
    }
  }
  return list;
}

const htmlFiles = scanHtmlFiles(OUT_DIR);
let purgedScripts = new Set();

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const nomoduleRegex = /<script[^>]*src="([^"]*)"[^>]*noModule[^>]*>(?:<\/script>)?/gi;
  let match;
  while ((match = nomoduleRegex.exec(content)) !== null) {
    purgedScripts.add(match[1]);
  }
  if (nomoduleRegex.test(content)) {
    content = content.replace(/<script[^>]*src="[^"]*"[^>]*noModule[^>]*>(?:<\/script>)?/gi, '');
    fs.writeFileSync(file, content, 'utf8');
  }
}

// Purge the physical dead chunks from out/
for (const scriptSrc of purgedScripts) {
  const chunkRel = scriptSrc.replace(/^\//, '');
  const chunkPath = path.join(OUT_DIR, chunkRel);
  if (fs.existsSync(chunkPath)) {
    // Empty the file content so any accidental reference is 0 bytes
    fs.writeFileSync(chunkPath, '', 'utf8');
  }
}

if (purgedScripts.size > 0) {
  console.log(`✅ [PageSpeed Optimization] Purged ${purgedScripts.size} legacy noModule polyfill script(s) across ${htmlFiles.length} HTML pages.`);
}
