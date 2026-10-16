/**
 * Adsterra 广告系统全局核心常量与合规配置 (2026 生产级标准)
 * 严格遵循 adsterra-setup 铁律：
 * 1. 零手动 iframe 封装（严禁任何形式的 manual iframe 沙盒）
 * 2. 官方纯净 URL 规范（严禁追加 ?_t 等自定义参数）
 * 3. 法律合规绝对免除（Strict Zero-Ad）
 * 4. 黄金次屏 Native Banner（主力高曝光位）
 * 5. 文末响应式 Banner（728x90 桌面 / 300x250 移动单发隔离）
 * 6. 桌面双侧 160x600 摩天大楼（串行链式加载状态机）
 */

// ==========================================
// 1. 广告 Keys 与官方 CDN 资源定义
// ==========================================

export const ADSTERRA_CONFIG = {
  // 1. 黄金位置 Native Banner (主力原生信息流卡片)
  native: {
    key: '3e83c9fd7e6aaa8d0dc9a95949603ca2',
    containerId: 'container-3e83c9fd7e6aaa8d0dc9a95949603ca2',
    scriptUrl: 'https://pl31580965.profitableratecpmnetwork.com/3e83c9fd7e6aaa8d0dc9a95949603ca2/invoke.js',
    frameDesktopHeight: 290,
    frameMobileHeight: 310,
    innerDesktopHeight: 235,
    innerMobileHeight: 255,
  },

  // 2. 桌面端横幅 (728x90 Leaderboard)
  desktopBanner: {
    key: 'e0a92a7b9e9f7a77cb4f5768363015cd',
    scriptUrl: 'https://bauval.org/22/e0a92a7b9e9f7a77cb4f5768363015cd',
    width: 728,
    height: 90,
  },

  // 3. 移动端横幅 (300x250 Medium Rectangle)
  mobileBanner: {
    key: '0c1ec97ec1293b57ee39c774c764004b',
    scriptUrl: 'https://bauval.org/22/0c1ec97ec1293b57ee39c774c764004b',
    width: 300,
    height: 250,
  },

  // 4. 桌面端双侧摩天大楼 (160x600 Skyscraper)
  skyscraper: {
    key: '42051cfdb5921b62601ff4b0733d4633',
    scriptUrl: 'https://bauval.org/22/42051cfdb5921b62601ff4b0733d4633',
    width: 160,
    height: 600,
  },
};

// 兼容别名导出
export const NATIVE_BANNER_KEY = ADSTERRA_CONFIG.native.key;
export const NATIVE_BANNER_SRC = ADSTERRA_CONFIG.native.scriptUrl;
export const NATIVE_CONTAINER_ID = ADSTERRA_CONFIG.native.containerId;
export const NATIVE_FRAME_DESKTOP_HEIGHT = ADSTERRA_CONFIG.native.frameDesktopHeight;
export const NATIVE_FRAME_MOBILE_HEIGHT = ADSTERRA_CONFIG.native.frameMobileHeight;
export const NATIVE_INNER_DESKTOP_HEIGHT = ADSTERRA_CONFIG.native.innerDesktopHeight;
export const NATIVE_INNER_MOBILE_HEIGHT = ADSTERRA_CONFIG.native.innerMobileHeight;

export const DESKTOP_BANNER_KEY = ADSTERRA_CONFIG.desktopBanner.key;
export const DESKTOP_BANNER_SRC = ADSTERRA_CONFIG.desktopBanner.scriptUrl;
export const DESKTOP_BANNER_WIDTH = ADSTERRA_CONFIG.desktopBanner.width;
export const DESKTOP_BANNER_HEIGHT = ADSTERRA_CONFIG.desktopBanner.height;

export const MOBILE_BANNER_KEY = ADSTERRA_CONFIG.mobileBanner.key;
export const MOBILE_BANNER_SRC = ADSTERRA_CONFIG.mobileBanner.scriptUrl;
export const MOBILE_BANNER_WIDTH = ADSTERRA_CONFIG.mobileBanner.width;
export const MOBILE_BANNER_HEIGHT = ADSTERRA_CONFIG.mobileBanner.height;

export const SKYSCRAPER_KEY = ADSTERRA_CONFIG.skyscraper.key;
export const SKYSCRAPER_SRC = ADSTERRA_CONFIG.skyscraper.scriptUrl;
export const SKYSCRAPER_WIDTH = ADSTERRA_CONFIG.skyscraper.width;
export const SKYSCRAPER_HEIGHT = ADSTERRA_CONFIG.skyscraper.height;

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
 * 判定当前路径是否属于法律合规豁免页面（严格 0 广告）
 */
export function isComplianceExcludedPath(pathname?: string | null): boolean {
  if (!pathname) return false;
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return COMPLIANCE_EXCLUDED_PATHS.some((p) => normalized === p || normalized.startsWith(`${p}/`));
}

export const isAdExcludedPath = isComplianceExcludedPath;

// ==========================================
// 3. 长页 vs 短页 判定引擎 (Three-Tier Engine)
// ==========================================

/**
 * 纯交互工具页与单任务叶子页判定（短页：仅保留黄金位 Native Banner，免除文末 Banner）
 */
export function isShortContentPage(pathname?: string | null): boolean {
  if (!pathname) return false;
  const clean = (pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname).toLowerCase();

  // 1. 7 个纯交互工具页
  if (clean.startsWith('/tools/')) {
    return true;
  }

  // 2. 单任务叶子详情页 (/sidequests/[slug])
  if (/^\/sidequests\/[^/]+$/.test(clean)) {
    return true;
  }

  return false;
}

/**
 * 长页智能判定函数（长页：文中黄金 Native Banner + 文末响应式 Banner 双广告）
 */
export function isLongContentPage(pathname?: string | null): boolean {
  if (!pathname) return false;

  // 1. 合规免除页严格 0 广告
  if (isComplianceExcludedPath(pathname)) {
    return false;
  }

  // 2. 短页免除文末 Banner
  if (isShortContentPage(pathname)) {
    return false;
  }

  // 3. 首页及其他维基攻略页面均为长页
  return true;
}
