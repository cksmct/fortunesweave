/**
 * pageDates.ts — 页面内容日期的唯一消费点
 *
 * ⚠️ 本文件由 scripts/gen-content-dates.mjs 自动生成（dev/build 前运行），
 *    **不要手工编辑**。禁止用 new Date() 驱动任何展示/SEO 日期。
 *  生成时间不可作为内容日期 —— 无内容改动时不产生 churn。
 */

export const PAGE_DATES: Record<string, string> = {
  '/': '2026-10-06',
  '/about': '2026-09-28',
  '/activities': '2026-10-03',
  '/battalions': '2026-09-30',
  '/boons': '2026-09-30',
  '/characters': '2026-10-01',
  '/classes': '2026-10-06',
  '/contact': '2026-09-28',
  '/crests': '2026-09-30',
  '/deeds': '2026-09-30',
  '/deities': '2026-09-30',
  '/equipment': '2026-09-30',
  '/factions': '2026-09-30',
  '/farming': '2026-10-03',
  '/gameplay': '2026-10-03',
  '/gifts': '2026-09-30',
  '/locations': '2026-09-30',
  '/map': '2026-09-30',
  '/materials': '2026-09-30',
  '/meals': '2026-09-30',
  '/mounts': '2026-10-05',
  '/paralogues': '2026-10-06',
  '/postgame': '2026-10-06',
  '/privacy': '2026-10-05',
  '/review': '2026-10-05',
  '/sidequests': '2026-09-30',
  '/sidequests/[slug]': '2026-09-30',
  '/supports': '2026-10-05',
  '/systems': '2026-10-05',
  '/talents': '2026-09-30',
  '/terms': '2026-09-28',
  '/tools/bird-time': '2026-09-30',
  '/tools/class-planner': '2026-09-30',
  '/tools/gift-finder': '2026-09-30',
  '/tools/paralogue-checklist': '2026-09-30',
  '/tools/recipe-solver': '2026-09-30',
  '/tools/recruitment-planner': '2026-09-30',
  '/tools/support-matrix': '2026-09-30',
  '/updates': '2026-09-30',
  '/walkthrough': '2026-10-01',
  '/weapons': '2026-10-01',
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
