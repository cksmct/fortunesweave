#!/usr/bin/env node
/**
 * audit-updates.mjs — 首页「Latest Update」过时护栏
 *
 * ── 为什么需要这个脚本（2026-09-07 animalhospital 事故根治）────────────
 * 症状：Roblox Virtual Events API 已经抓到 9/5 开始的 "Second Floor" 事件，
 *       sync-events 也生成了 /events/second-floor/ 页面，但首页 Hero 卡片与
 *       「LATEST UPDATE · NOW LIVE」区块仍硬编码显示 8/22 的 "Even More Lore!"。
 *
 * 根因链：
 *   1) 首页把「最新更新」写死在 page.tsx 的 const 数组里，与 events.json /
 *      game.config.json 完全断开 —— 事件同步再准也改不动首页；
 *   2) sync-events 只写 events.json + 生成事件页，从不回写「首页最新更新」；
 *   3) 没有任何门禁能发现「首页最新更新 < 最新已开始事件」。
 *
 * 根治三件套（本脚本是第 3 件，缺一不可）：
 *   ① 单源真相 src/data/updates.json —— 首页 + /updates/ + FAQ 全部读它；
 *   ② sync-events 每次同步后自动回写 updates.json + game.config.json；
 *   ③ 本脚本挂在 build/dev/audit 链上，出现「事件已开始但首页没跟上」→ exit 1。
 * ──────────────────────────────────────────────────────────────────────
 *
 * 设计原则：与 audit-events.mjs 一致 —— 结构性/一致性问题硬失败（可自动判定），
 * 内容缺失类降级为警告，绝不因「文案还没写」让整站构建崩溃。
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const UPDATES_JSON = join(ROOT, "src/data/updates.json");
const EVENTS_JSON = join(ROOT, "src/data/events.json");
const GAME_CONFIG = join(ROOT, "src/data/game.config.json");

function readJson(p) {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    return null;
  }
}

if (!existsSync(UPDATES_JSON)) {
  console.log("AUDIT UPDATES SKIPPED: no src/data/updates.json");
  process.exit(0);
}

const updatesFile = readJson(UPDATES_JSON);
if (!updatesFile) {
  console.error("AUDIT UPDATES FAILED: src/data/updates.json 解析失败");
  process.exit(1);
}

const updates = Array.isArray(updatesFile.updates) ? updatesFile.updates : [];
const errors = [];
const warnings = [];
const today = new Date().toISOString().slice(0, 10);

// ── 1. 结构性字段 ────────────────────────────────────────────────
if (updates.length === 0) {
  errors.push("updates.json 的 updates 为空 —— 首页「Latest Update」无内容可渲染");
} else {
  const top = updates[0];
  if (!top.title) errors.push("updates.json 首条缺少 title");
  if (!top.date) errors.push("updates.json 首条缺少 date（展示用日期标签）");
  if (!top.isoDate) warnings.push("updates.json 首条缺少 isoDate —— 无法与 events.json 做日期比对，过时护栏失效");
}

// ── 2. 过时护栏：已开始的事件必须在 updates.json 中且排首位 ──────────
if (existsSync(EVENTS_JSON) && updates.length > 0) {
  const eventsFile = readJson(EVENTS_JSON);
  const events = Array.isArray(eventsFile?.events) ? eventsFile.events : [];
  const top = updates[0];
  const topIso = top.isoDate || "";

  for (const ev of events) {
    if (!ev.startDate || !ev.slug) continue;
    // 只关心「已经开始」的事件（未开始的属预告，不要求占据首页 C 位）
    if (ev.startDate > today) continue;
    const topHasStarted = !topIso || topIso <= today;
    // 首页 C 位必须是「已经开始」的最新事件。若首位是尚未开始的预告条目，
    // 已开始的事件就必须顶到首位，否则首页会把未上线版本当成 Latest Update 展示。
    if (topHasStarted && ev.startDate <= topIso) continue;

    const idx = updates.findIndex((u) => u.eventSlug === ev.slug);
    if (idx === -1) {
      errors.push(
        `首页「Latest Update」已过时：事件 "${ev.name}"（${ev.startDate} 开始）在 events.json 中，但 updates.json 没有 eventSlug="${ev.slug}" 的条目 → 运行 \`node scripts/sync-events.mjs\` 自动回写`
      );
    } else if (idx > 0) {
      errors.push(
        `首页「Latest Update」已过时：事件 "${ev.name}"（${ev.startDate}）在 updates.json 中位于第 ${idx + 1} 位，不是首位 → 首页仍显示 "${updates[0].title}"`
      );
    }
  }
}

// ── 3. 与 game.config.json 对齐（警告级，避免双源漂移）────────────
if (existsSync(GAME_CONFIG)) {
  const cfg = readJson(GAME_CONFIG);
  const curVersion = cfg?.game?.currentVersion || "";
  const lastUpdated = cfg?.game?.lastUpdated || "";
  if (updatesFile.currentVersion && curVersion && updatesFile.currentVersion !== curVersion) {
    warnings.push(
      `game.config.json 的 game.currentVersion ("${curVersion}") 与 updates.json 的 currentVersion ("${updatesFile.currentVersion}") 不一致 → 以 updates.json 为准同步`
    );
  }
  if (updatesFile.lastUpdated && lastUpdated && updatesFile.lastUpdated !== lastUpdated) {
    warnings.push(
      `game.config.json 的 game.lastUpdated ("${lastUpdated}") 与 updates.json 的 lastUpdated ("${updatesFile.lastUpdated}") 不一致 → 以 updates.json 为准同步`
    );
  }
  if (updatesFile.lastUpdated && updatesFile.lastUpdated > today) {
    warnings.push(`updates.json 的 lastUpdated (${updatesFile.lastUpdated}) 是未来日期`);
  }
}

// ── 输出 ─────────────────────────────────────────────────────────
if (warnings.length) {
  console.log(`AUDIT UPDATES: ${warnings.length} warning(s)`);
  for (const w of warnings) console.log(`  ⚠️  ${w}`);
}

if (errors.length) {
  console.error(`AUDIT UPDATES FAILED: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  ❌ ${e}`);
  process.exit(1);
}

console.log(`AUDIT UPDATES OK: ${updates.length} update(s), ${warnings.length} warning(s)`);
process.exit(0);
