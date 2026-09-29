#!/usr/bin/env node
/**
 * scripts/gen-search-index.mjs
 * 
 * 自动提取站内页面、角色、职业、外传、章节流程与核心装备数据，
 * 输出精简的 public/search-index.json，供前端 Command Palette 搜索使用。
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'data');
const OUT_FILE = join(ROOT, 'public', 'search-index.json');

function loadJson(filename, fallback = null) {
  const p = join(DATA_DIR, filename);
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (err) {
    console.warn(`[gen-search-index] Warning: failed to parse ${filename}:`, err.message);
    return fallback;
  }
}

console.log('[gen-search-index] Generating search index...');

const searchItems = [];
const seenHrefs = new Set();

// 1. Pages (from nav.config.json)
const navConfig = loadJson('nav.config.json', {});
if (navConfig?.header) {
  const processItem = (label, href, section) => {
    if (!href || href.startsWith('http')) return;
    const cleanHref = (href.endsWith('/') ? href : href + '/').replace(/\/+/g, '/');
    if (seenHrefs.has(cleanHref)) return;
    seenHrefs.add(cleanHref);

    searchItems.push({
      id: `page-${cleanHref.replace(/[^a-z0-9]/gi, '_')}`,
      title: label,
      category: 'Pages',
      href: cleanHref,
      description: `${section} · Complete guide & database`,
      keywords: `${label} guide overview wiki ${section}`.toLowerCase(),
    });
  };

  (navConfig.header.top || []).forEach(t => processItem(t.label, t.href, 'Navigation'));
  (navConfig.header.groups || []).forEach(group => {
    (group.columns || []).forEach(col => {
      (col.items || []).forEach(item => processItem(item.label, item.href, `${group.label} > ${col.title}`));
    });
  });
  if (navConfig.footer?.columns) {
    navConfig.footer.columns.forEach(col => {
      (col.links || []).forEach(link => processItem(link.label, link.href, col.title));
    });
  }
}

// 2. Characters (from characters.json)
const charactersData = loadJson('characters.json', {});
if (Array.isArray(charactersData?.characters)) {
  charactersData.characters.forEach(char => {
    if (!char.name) return;
    const descParts = [];
    if (char.army) descParts.push(char.army);
    if (char.kind === 'route-army') descParts.push('Route Army');
    else if (char.playable) descParts.push('Playable Recruit');
    else descParts.push('NPC / Faction');

    searchItems.push({
      id: `char-${char.id || char.slug || char.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: char.name,
      category: 'Characters',
      href: '/characters/',
      description: descParts.join(' · '),
      keywords: `${char.name} ${char.army || ''} ${char.note || ''} hero recruit unit`.toLowerCase(),
    });
  });
}

// 3. Classes (from classes.json)
const classesData = loadJson('classes.json', {});
if (Array.isArray(classesData?.classes)) {
  classesData.classes.forEach(cls => {
    if (!cls.name) return;
    const descParts = [];
    if (cls.tier) descParts.push(`${cls.tier} Tier`);
    if (cls.movement) descParts.push(cls.movement);
    if (cls.weapons) descParts.push(cls.weapons);

    searchItems.push({
      id: `class-${cls.id || cls.slug || cls.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: cls.name,
      category: 'Classes',
      href: '/classes/',
      description: descParts.join(' · '),
      keywords: `${cls.name} ${cls.tier || ''} ${cls.weapons || ''} ${cls.movement || ''} promotion class mastery`.toLowerCase(),
    });
  });
}

// 4. Paralogues (from paralogues.json)
const paraloguesData = loadJson('paralogues.json', {});
if (Array.isArray(paraloguesData?.paralogues)) {
  paraloguesData.paralogues.forEach(para => {
    if (!para.name) return;
    const descParts = [];
    if (para.ownerCharacter) descParts.push(`Focus: ${para.ownerCharacter}`);
    if (para.routeLocks?.length) descParts.push(`Routes: ${para.routeLocks.join(', ')}`);
    if (para.unlock?.chapterWindow) descParts.push(para.unlock.chapterWindow);

    searchItems.push({
      id: `para-${para.id || para.slug}`,
      title: `${para.name} (Paralogue)`,
      category: 'Paralogues',
      href: '/paralogues/',
      description: descParts.join(' · '),
      keywords: `${para.name} ${para.ownerCharacter || ''} paralogue optional battle side mission`.toLowerCase(),
    });
  });
}

// 5. Chapters (from chapters.json)
const chaptersData = loadJson('chapters.json', {});
if (Array.isArray(chaptersData?.chapters)) {
  chaptersData.chapters.forEach(chap => {
    if (!chap.name) return;
    searchItems.push({
      id: `chap-${chap.id || chap.slug}`,
      title: `${chap.part}: Ch.${chap.number} - ${chap.name}`,
      category: 'Walkthrough',
      href: '/walkthrough/',
      description: `${chap.part} · Chapter ${chap.number}`,
      keywords: `chapter ${chap.number} ${chap.name} ${chap.part} walkthrough mission battle`.toLowerCase(),
    });
  });
}

// 6. Weapons & Combat Arts (from weapons.json)
const weaponsData = loadJson('weapons.json', {});
if (Array.isArray(weaponsData?.weapons)) {
  weaponsData.weapons.forEach(w => {
    if (!w.name) return;
    const descParts = [];
    if (w.weaponType) descParts.push(w.weaponType);
    if (w.level) descParts.push(`Rank ${w.level}`);
    if (w.might) descParts.push(`Mt ${w.might}`);
    if (w.hit) descParts.push(`Hit ${w.hit}%`);

    searchItems.push({
      id: `wpn-${w.id || w.slug}`,
      title: w.name,
      category: 'Equipment',
      href: '/weapons/',
      description: descParts.join(' · '),
      keywords: `${w.name} ${w.weaponType || ''} ${w.level || ''} weapon gear combat equipment`.toLowerCase(),
    });
  });
}

// 7. Gifts & Preferences (from gift-preferences.json)
const giftsData = loadJson('gift-preferences.json', {});
if (Array.isArray(giftsData?.preferences)) {
  giftsData.preferences.forEach(g => {
    if (!g.character) return;
    searchItems.push({
      id: `gift-${g.id || g.character.toLowerCase()}`,
      title: `${g.character} - Gifts & Likes`,
      category: 'Gifts',
      href: '/gifts/',
      description: `Likes: ${g.likes ? g.likes.slice(0, 60) + '...' : 'Favorite items'}`,
      keywords: `${g.character} gifts likes dislikes bond support meals`.toLowerCase(),
    });
  });
}

writeFileSync(OUT_FILE, JSON.stringify(searchItems), 'utf8');

console.log(`[gen-search-index] Successfully indexed ${searchItems.length} items to ${OUT_FILE}`);
