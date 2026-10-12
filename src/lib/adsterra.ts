/**
 * Adsterra 广告系统全局核心常量与合规配置 (2026 生产级标准)
 * 严格遵循 adsterra-setup 铁律：
 * 1. 零手动 iframe 封装
 * 2. 官方纯净 URL 规范（严禁追加 ?_t 时间戳）
 * 3. 法律合规绝对免除（Strict Zero-Ad）
 * 4. 保留次屏黄金 Native Banner，新增全站微交互 Social Bar
 */

// ==========================================
// 1. 广告 Keys 与官方 CDN 资源定义
// ==========================================

// 文中黄金位置 Native Banner (原生信息流卡片)
export const NATIVE_BANNER_KEY = '3e83c9fd7e6aaa8d0dc9a95949603ca2';
export const NATIVE_BANNER_SRC = `https://pl31580965.profitableratecpmnetwork.com/${NATIVE_BANNER_KEY}/invoke.js`;
export const NATIVE_CONTAINER_ID = `container-${NATIVE_BANNER_KEY}`;

// CLS 黄金标定高度
export const NATIVE_FRAME_DESKTOP_HEIGHT = 290;
export const NATIVE_FRAME_MOBILE_HEIGHT = 310;
export const NATIVE_INNER_DESKTOP_HEIGHT = 235;
export const NATIVE_INNER_MOBILE_HEIGHT = 255;

// Social Bar 高互动浮动通知广告 (用户指定官方脚本)
export const SOCIAL_BAR_SRC = 'https://bauval.org/14/4e5b2ab1a5a24ef00ca5c87b5db08fff';

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

