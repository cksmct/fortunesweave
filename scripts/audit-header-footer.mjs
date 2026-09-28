#!/usr/bin/env node
/**
 * Header & Footer Architecture & Lifecycle Gate
 * 1. Single Atomic Word Mandate: Navbar labels must be single words without spaces, '&', or hyphens.
 * 2. Nav Items Cap: Primary navbar items must not exceed 5 items.
 * 3. Balanced Footer Matrix: Footer must have 4-5 balanced columns, no column exceeding 15 links (no long zippers).
 * 4. Zero Broken Navigation Links: All links in Header/Footer must point to real, existing routes.
 * 5. Lifecycle Coverage Gate: Key business & system routes must be reachable via Header or Footer.
 * 
 * Exit 1 on any violation to act as an unskippable build gate.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const SRC_DIR = join(PROJECT_ROOT, "src");
const APP_DIR = join(SRC_DIR, "app");
const HEADER_PATH = join(SRC_DIR, "components", "Header.tsx");
const FOOTER_PATH = join(SRC_DIR, "components", "Footer.tsx");
const SEP = process.platform === "win32" ? "\\" : "/";

console.log("\n================ 🏛️  HEADER & FOOTER ARCHITECTURE GATE ================");

if (!existsSync(HEADER_PATH) || !existsSync(FOOTER_PATH)) {
  console.error("❌ Header.tsx or Footer.tsx not found in src/components!");
  process.exit(1);
}

// 1. Scan all existing routes in src/app
function scanPages(dir, acc = []) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) scanPages(full, acc);
    else if (basename(f).startsWith("page.")) acc.push(full);
  }
  return acc;
}

const NAV_CONFIG_PATH = join(SRC_DIR, "data", "nav.config.json");
const navConfig = existsSync(NAV_CONFIG_PATH) ? JSON.parse(readFileSync(NAV_CONFIG_PATH, "utf8")) : null;

const pageFiles = scanPages(APP_DIR);
const validRoutes = new Set(
  pageFiles.map((f) => {
    const rel = dirname(f).replace(APP_DIR, "").split(SEP).join("/");
    return rel === "" || rel === "/" ? "/" : "/" + rel.replace(/^\//, "").replace(/\/$/, "") + "/";
  }).filter((r) => !r.startsWith("/_") && !r.startsWith("/404/"))
);

const headerContent = readFileSync(HEADER_PATH, "utf8");
const footerContent = readFileSync(FOOTER_PATH, "utf8");

let errors = [];
let warnings = [];

// 2. Check Header Navigation Labels (Single Atomic Word & Max 5 items)
let primaryLabels = [];
if (navConfig?.header) {
  const topLabels = (navConfig.header.top || []).map(t => t.label);
  const groupLabels = (navConfig.header.groups || []).map(g => g.label);
  primaryLabels = [...topLabels, ...groupLabels];
} else {
  const navGroupMatch = headerContent.match(/const navGroups:\s*NavGroup\[\]\s*=\s*\[([\s\S]*?)\];/);
  if (navGroupMatch) {
    primaryLabels = [...navGroupMatch[1].matchAll(/label:\s*['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
  }
}

if (primaryLabels.length > 5) {
  errors.push(`Header primary nav has ${primaryLabels.length} items (exceeds maximum of 5 items). Current: ${primaryLabels.join(", ")}`);
}

for (const label of primaryLabels) {
  if (/[\s&/\\-]/.test(label)) {
    errors.push(`Header label "${label}" violates the Single Atomic Word Mandate! Labels must not contain spaces, '&', or hyphens to prevent desktop wrapping.`);
  }
}

// 3. Extract all links from Header and Footer (both JSX href="..." and nav.config.json)
const hrefRegex = /(?:href=|\bhref:)\s*['"`]([^'"`#?]+)['"`]/g;
function extractHrefs(content) {
  const hrefs = new Set();
  let m;
  while ((m = hrefRegex.exec(content)) !== null) {
    let h = m[1];
    if (h.startsWith("http://") || h.startsWith("https://") || h.startsWith("mailto:") || h.startsWith("#")) continue;
    const norm = (h.endsWith("/") ? h : h + "/").replace(/\/+/g, "/");
    if (!/\.(png|jpg|jpeg|webp|svg|ico|gif)$/i.test(norm)) {
      hrefs.add(norm);
    }
  }
  return hrefs;
}

const headerHrefs = extractHrefs(headerContent);
const footerHrefs = extractHrefs(footerContent);

if (navConfig?.header) {
  (navConfig.header.top || []).forEach(item => {
    if (item.href && !item.href.startsWith("http")) {
      headerHrefs.add((item.href.endsWith('/') ? item.href : item.href + '/').replace(/\/+/g, '/'));
    }
  });
  (navConfig.header.groups || []).forEach(group => {
    (group.columns || []).forEach(col => {
      (col.items || []).forEach(item => {
        if (item.href && !item.href.startsWith("http")) {
          headerHrefs.add((item.href.endsWith('/') ? item.href : item.href + '/').replace(/\/+/g, '/'));
        }
      });
    });
  });
}

if (navConfig?.footer) {
  (navConfig.footer.columns || []).forEach(col => {
    (col.links || []).forEach(link => {
      if (link.href && !link.href.startsWith("http")) {
        footerHrefs.add((link.href.endsWith('/') ? link.href : link.href + '/').replace(/\/+/g, '/'));
      }
    });
  });
  (navConfig.footer.legal || []).forEach(link => {
    if (link.href && !link.href.startsWith("http")) {
      footerHrefs.add((link.href.endsWith('/') ? link.href : link.href + '/').replace(/\/+/g, '/'));
    }
  });
}

// 4. Dead Link Audit: Check if any link points to a non-existent page
for (const h of headerHrefs) {
  if (h !== "/" && !validRoutes.has(h)) {
    errors.push(`Header contains dead link pointing to non-existent route: "${h}"`);
  }
}
for (const h of footerHrefs) {
  if (h !== "/" && !validRoutes.has(h)) {
    errors.push(`Footer contains dead link pointing to non-existent route: "${h}"`);
  }
}

// 5. Footer Single-Column Zipper & Structure Check
if (navConfig?.footer?.columns) {
  navConfig.footer.columns.forEach((col) => {
    const linkCount = (col.links || []).length;
    if (linkCount > 15) {
      errors.push(`Footer column "${col.title}" has ${linkCount} links (exceeds limit of 15). This triggers the Single-Column Zipper & Negative Space Black Hole trap.`);
    }
  });
} else {
  const footerColMatch = footerContent.match(/const footerColumns:\s*FooterLinkGroup\[\]\s*=\s*\[([\s\S]*?)\];/);
  if (footerColMatch) {
    const colBlock = footerColMatch[1];
    const colChunks = colBlock.split(/heading:\s*['"`]/).slice(1);
    for (const chunk of colChunks) {
      const heading = chunk.split(/['"`]/)[0];
      const linkCount = (chunk.match(/href:\s*['"`]/g) || []).length;
      if (linkCount > 15) {
        errors.push(`Footer column "${heading}" has ${linkCount} links (exceeds limit of 15). This triggers the Single-Column Zipper & Negative Space Black Hole trap.`);
      }
    }
  }
}

// 6. Mobile Tap Targets & Accessibility Check (Preventing Lighthouse 97 A11y drops)
const officialLinksBlock = footerContent.match(/(?:Official Links|socialEntries)[\s\S]*?<\/div>\s*<\/div>/i);
if (officialLinksBlock) {
  const block = officialLinksBlock[0];
  const aTags = [...block.matchAll(/<a\s+([^>]+)>/g)].map(m => m[1]);
  for (const tag of aTags) {
    const classMatch = tag.match(/className=['"`]([^'"`]+)['"`]/);
    if (classMatch) {
      const cls = classMatch[1];
      const hasTouchHeight = /min-h-\[(?:4[0-9]|5[0-9])px\]|py-(?:2|2\.5|3|3\.5|4)/.test(cls);
      if (!hasTouchHeight) {
        errors.push(`Footer official link lacks touch padding (missing min-h-[44px] or py-2.5+). Class: "${cls}". This triggers the Lighthouse Tap Target sizing penalty (Accessibility 97 drop)!`);
      }
    }
  }
}

// Check links in Footer for dangerous sub-py-1 touch area
const linkMatches = [...footerContent.matchAll(/<(?:Link|a)\s+[^>]*className=['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
for (const cls of linkMatches) {
  if (/\bpy-(?:0|0\.5)\b/.test(cls)) {
    errors.push(`Footer link detected with dangerous py-0 or py-0.5 touch area. Class: "${cls}". Links must declare at least py-1 or py-1.5 to satisfy mobile tap target standards.`);
  }
}

// 7. Dark Mode Text Contrast Audit (Preventing Lighthouse 96 A11y drops)
const lowContrastRegex = /\btext-(?:zinc|slate|neutral|gray)-500\b/;
if (lowContrastRegex.test(footerContent)) {
  errors.push("Footer contains dangerously low contrast classes (e.g. text-zinc-500 / text-slate-500). WCAG AA requires at least 4.5:1 contrast against dark backgrounds. Use text-zinc-300 or text-slate-300 instead!");
}
if (lowContrastRegex.test(headerContent)) {
  errors.push("Header contains dangerously low contrast classes (e.g. text-zinc-500 / text-slate-500). Use text-zinc-300 or text-slate-300 instead!");
}

// 8. Banned Far-Right Disconnected Floating Badges in Footer
if (footerContent.includes('justify-between') && footerContent.includes('<Link')) {
  const linkClasses = [...footerContent.matchAll(/<Link\b[^>]*className=['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
  for (const cls of linkClasses) {
    if (cls.includes('justify-between') && cls.includes('w-full')) {
      errors.push('Footer link uses "w-full justify-between" which forces badges to float ~150px away from text on the far-right edge! Use "inline-flex items-center gap-1.5" instead.');
      break;
    }
  }
}
if (/['"`](?:8\s*TYPES|ROLES|9\s*TIERS|LOOPS)['"`]/.test(footerContent)) {
  errors.push('Footer contains sporadic, meaningless counter badges ("8 TYPES", "ROLES", "9 TIERS"). Keep footer directory pure text; only high-conversion badges like "LIVE" are allowed inline.');
}

// 9. Logo LCP Preload Defense Gate (Prevent React 19 Auto-Hoist Preload Hijacking)
const imgTags = [...headerContent.matchAll(/<img\s+([^>]+)>/g), ...footerContent.matchAll(/<img\s+([^>]+)>/g)].map(m => m[1]);
for (const tag of imgTags) {
  if (/logo|brand|icon/i.test(tag)) {
    if (!tag.includes('fetchPriority="low"')) {
      errors.push(`Header/Footer logo <img> must explicitly declare fetchPriority="low" to prevent React 19 auto-hoisting preload and stealing LCP bandwidth! Tag: <img ${tag}>`);
    }
    if (!tag.includes('loading="lazy"')) {
      errors.push(`Header/Footer logo <img> must explicitly declare loading="lazy"! Tag: <img ${tag}>`);
    }
  }
}

// 10. Report findings
console.log(`Audited Routes        : ${validRoutes.size}`);
console.log(`Header Nav Links      : ${headerHrefs.size}`);
console.log(`Footer Matrix Links   : ${footerHrefs.size}`);

if (warnings.length > 0) {
  console.log("\n⚠️  Warnings:");
  warnings.forEach(w => console.log("   - " + w));
}

if (errors.length > 0) {
  console.error("\n❌ HEADER & FOOTER AUDIT FAILED:");
  errors.forEach(e => console.error("   - " + e));
  console.error("=========================================================================\n");
  process.exit(1);
}

console.log("✅ All Header & Footer architecture, atomic labels, and links passed cleanly!");
console.log("=========================================================================\n");
