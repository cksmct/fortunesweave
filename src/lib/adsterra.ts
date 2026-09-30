/**
 * Adsterra 广告系统全局核心常量与自适应长页判定引擎 (2026 生产级标准)
 * 严格遵循 adsterra-setup 铁律：
 * 1. 零手动 iframe 封装
 * 2. 官方纯净 URL 规范（严禁追加 ?_t 时间戳）
 * 3. 强隔离单发（严禁 CSS display:none 隐藏 iframe 规避 MRC 反作弊）
 * 4. 三层确定性长页判定引擎
 */

// ==========================================
// 1. 广告 Keys 与官方 CDN 资源定义
// ==========================================

// 桌面端 728x90 Leaderboard Banner
export const DESKTOP_BANNER_KEY = 'e0a92a7b9e9f7a77cb4f5768363015cd';
export const DESKTOP_BANNER_SRC = `https://www.highrevenueformat.com/${DESKTOP_BANNER_KEY}/invoke.js`;
export const DESKTOP_BANNER_WIDTH = 728;
export const DESKTOP_BANNER_HEIGHT = 90;

// 移动端 300x250 Medium Rectangle Banner
export const MOBILE_BANNER_KEY = '0c1ec97ec1293b57ee39c774c764004b';
export const MOBILE_BANNER_SRC = `https://www.highrevenueformat.com/${MOBILE_BANNER_KEY}/invoke.js`;
export const MOBILE_BANNER_WIDTH = 300;
export const MOBILE_BANNER_HEIGHT = 250;


// 文中黄金位置 Native Banner (原生信息流卡片)
export const NATIVE_BANNER_KEY = '3e83c9fd7e6aaa8d0dc9a95949603ca2';
export const NATIVE_BANNER_SRC = `https://pl31580965.profitableratecpmnetwork.com/${NATIVE_BANNER_KEY}/invoke.js`;
export const NATIVE_CONTAINER_ID = `container-${NATIVE_BANNER_KEY}`;

// CLS 黄金标定高度
export const NATIVE_FRAME_DESKTOP_HEIGHT = 290;
export const NATIVE_FRAME_MOBILE_HEIGHT = 310;
export const NATIVE_INNER_DESKTOP_HEIGHT = 235;
export const NATIVE_INNER_MOBILE_HEIGHT = 255;

// ==========================================
// 2. 法律合规与绝对免除路径 (Strict Zero-Ad)
// ==========================================
export const COMPLIANCE_EXCLUDED_PATHS = [
  '/privacy',
  '/privacy-policy',
  '/terms',
  '/terms-of-service',
  '/contact',
  '/contact-us',
  '/about',
  '/links',
  '/disclaimer',
  '/_not-found',
  '/404',
];

/**
 * 判定当前路径是否属于法律合规豁免页面
 */
export function isComplianceExcludedPath(pathname?: string | null): boolean {
  if (!pathname) return false;
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return COMPLIANCE_EXCLUDED_PATHS.some((p) => normalized === p || normalized.startsWith(`${p}/`));
}

// ==========================================
// 3. 三层确定性长页判定引擎 (Three-Tier Rule Engine)
// ==========================================

/**
 * 第二层：单实体紧凑叶子详情页（仅保留次屏 Native Bar，自动免除文尾 Banner 防广告过载）
 * 匹配包含单一 slug 的叶子实体，例如 /characters/[slug], /classes/[slug]
 */
export function isSingleEntityDetailPage(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, '');
  return /^\/(characters|classes|battalions|boons|crests|deeds|deities|equipment|factions|gifts|locations|materials|meals|mounts|paralogues|sidequests|supports|systems|talents|weapons|updates)\/[^/]+$/.test(clean);
}

/**
 * 特例免除登记表（非叶子详情页但由于业务特殊性内容极短的特殊页面）
 */
export const EXPLICIT_SHORT_PAGES: string[] = [];

/**
 * 第三层：长页智能自适应判定函数
 * 长页文尾补充 1 个官方标准 Banner (桌面 728x90 / 移动 300x250)
 */
export function isLongContentPage(pathname?: string | null): boolean {
  if (!pathname) return false;
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  // 1. 第一层：法律合规页绝对豁免（严格 0 广告）
  if (isComplianceExcludedPath(normalized)) {
    return false;
  }

  // 2. 第二层：单实体叶子紧凑详情页（免除文尾横幅，防高广告密度惩罚）
  if (isSingleEntityDetailPage(normalized)) {
    return false;
  }

  // 3. 特例短页豁免
  if (EXPLICIT_SHORT_PAGES.includes(normalized)) {
    return false;
  }

  // 4. 默认自适应：首页、核心系统指南、工具库、深度攻略索引等，全部识别为合规长页
  return true;
}
