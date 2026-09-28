/**
 * pageDates.ts — 页面内容日期的唯一消费点
 *
 * ⚠️ 本文件由 scripts/gen-content-dates.mjs 自动生成（dev/build 前运行），
 *    **不要手工编辑**。禁止用 new Date() 驱动任何展示/SEO 日期。
 *  生成时间不可作为内容日期 —— 无内容改动时不产生 churn。
 */

export const PAGE_DATES: Record<string, string> = {
  '/': '2026-09-28',
  '/about': '2026-09-28',
  '/activities': '2026-09-28',
  '/battalions': '2026-09-28',
  '/boons': '2026-09-28',
  '/characters': '2026-09-28',
  '/classes': '2026-09-28',
  '/contact': '2026-09-28',
  '/crests': '2026-09-28',
  '/deeds': '2026-09-28',
  '/deities': '2026-09-28',
  '/equipment': '2026-09-28',
  '/factions': '2026-09-28',
  '/farming': '2026-09-28',
  '/gifts': '2026-09-28',
  '/locations': '2026-09-28',
  '/map': '2026-09-28',
  '/materials': '2026-09-28',
  '/meals': '2026-09-28',
  '/mounts': '2026-09-28',
  '/paralogues': '2026-09-28',
  '/postgame': '2026-09-28',
  '/privacy': '2026-09-28',
  '/sidequests': '2026-09-28',
  '/supports': '2026-09-28',
  '/systems': '2026-09-28',
  '/talents': '2026-09-28',
  '/terms': '2026-09-28',
  '/tools/bird-time': '2026-09-28',
  '/tools/class-planner': '2026-09-28',
  '/tools/gift-finder': '2026-09-28',
  '/tools/paralogue-checklist': '2026-09-28',
  '/tools/recipe-solver': '2026-09-28',
  '/tools/recruitment-planner': '2026-09-28',
  '/tools/support-matrix': '2026-09-28',
  '/updates': '2026-09-28',
  '/walkthrough': '2026-09-28',
  '/weapons': '2026-09-28',
};

/** 返回 ISO 日期（YYYY-MM-DD）；未知路由回退到站点基线日期，绝不回退到“今天”。 */
export function pageDateIso(path: string): string {
  const normalized = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  return PAGE_DATES[path] ?? PAGE_DATES[normalized] ?? PAGE_DATES['/'];
}

/** 返回展示用日期；固定按 UTC 解析，避免时区跨日错位。 */
export function pageDateFormatted(path: string): string {
  const iso = pageDateIso(path);
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
