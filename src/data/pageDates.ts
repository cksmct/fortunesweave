/**
 * pageDates.ts — 页面内容日期的唯一消费点
 *
 * ⚠️ 本文件由 scripts/gen-content-dates.mjs 自动生成（dev/build 前运行），
 *    **不要手工编辑**。禁止用 new Date() 驱动任何展示/SEO 日期。
 *  生成时间不可作为内容日期 —— 无内容改动时不产生 churn。
 */

export const PAGE_DATES: Record<string, string> = {
  '/': '1970-01-01',
  '/about': '2026-09-28',
  '/contact': '2026-09-28',
  '/privacy': '2026-09-28',
  '/terms': '2026-09-28',
  '/updates': '2026-09-28',
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
