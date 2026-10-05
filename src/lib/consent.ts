/**
 * consent.ts — 同意状态唯一事实源（Consent Mode v2 配套）
 *
 * 铁律（改本文件前务必读完）：
 * 1. 区域分级：只有 EEA / UK / CH 需要事先同意；其他地区静默授予，
 *    广告与统计零遮挡直出（不牺牲收入，也不用弹窗骚扰非监管区访客）。
 *    判定依据是访客时区（IANA），不依赖 IP 服务 —— 静态导出站点无法在运行时读 CF-IPCountry。
 * 2. 更新同意状态必须 `window.dataLayer.push(['consent','update', ...])`，
 *    不要用 `gtag('consent','update')`：前者在 gtag.js 尚未加载时也能生效。
 * 3. 撤回必须是真撤回：denied 时不仅停止后续写入，还要删除已写入的标识 cookie
 *    （_ga / _gid / _ga_<容器 ID>），否则面板只是「空控制」。
 * 4. 默认值必须在任何 Google 标签/广告脚本之前设定 —— 由 layout.tsx 的
 *    首个内联脚本调用 buildConsentDefaultScript() 完成，本文件只提供源码。
 */

export const CONSENT_STORAGE_KEY = 'fw:consent';
export const CONSENT_CHANGE_EVENT = 'fw:consent-change';
export const CONSENT_OPEN_EVENT = 'fw:open-consent';

export type ConsentState = 'granted' | 'denied' | 'pending';

/**
 * 需要事先取得同意的 IANA 时区（EEA 30 国 + UK + CH + 其适用 GDPR 的属地）。
 * 单一事实源：内联脚本由 buildConsentDefaultScript() 从本数组生成，避免两处漂移。
 */
export const CONSENT_TZ: readonly string[] = [
  // 欧盟成员国
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Berlin',
  'Europe/Bratislava',
  'Europe/Brussels',
  'Europe/Bucharest',
  'Europe/Budapest',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Helsinki',
  'Europe/Lisbon',
  'Europe/Ljubljana',
  'Europe/Luxembourg',
  'Europe/Madrid',
  'Europe/Malta',
  'Europe/Paris',
  'Europe/Prague',
  'Europe/Riga',
  'Europe/Rome',
  'Europe/Sofia',
  'Europe/Stockholm',
  'Europe/Tallinn',
  'Europe/Vaduz',
  'Europe/Vienna',
  'Europe/Vilnius',
  'Europe/Warsaw',
  'Europe/Zagreb',
  'Asia/Nicosia',
  'Asia/Famagusta',
  // 欧盟外围属地（GDPR 同样适用）
  'Atlantic/Azores',
  'Atlantic/Canary',
  'Atlantic/Madeira',
  'America/Guadeloupe',
  'America/Martinique',
  'America/Cayenne',
  'America/Kralendijk',
  'Indian/Reunion',
  'Indian/Mayotte',
  // 非欧盟但适用 GDPR / UK GDPR / 瑞士 FADP
  'Europe/London',
  'Europe/Guernsey',
  'Europe/Isle_of_Man',
  'Europe/Jersey',
  'Europe/Gibraltar',
  'Atlantic/Reykjavik',
  'Europe/Oslo',
  'Europe/Zurich',
];

/** 时区是否属于「必须先取得同意」的地区。时区未知时按不要求处理（保住非监管区零遮挡体验）。 */
export function computeRequiresConsent(tz: string | null | undefined): boolean {
  if (!tz) return false;
  return CONSENT_TZ.indexOf(tz) !== -1;
}

export interface ConsentRuntime {
  /** 访客时区（IANA），无法解析时为空串。 */
  tz: string;
  /** 是否属于需要事先同意的地区。 */
  requiresConsent: boolean;
  /** 已存储的选择；未选择为 'pending'。 */
  state: ConsentState;
}

declare global {
  interface Window {
    __fwConsent?: ConsentRuntime;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** 读取由内联脚本写入的运行时事实（缺失时现场重算，保证 SSR / 异常下仍有确定结论）。 */
export function getConsentRuntime(): ConsentRuntime {
  if (typeof window === 'undefined') {
    return { tz: '', requiresConsent: false, state: 'pending' };
  }
  const rt = window.__fwConsent;
  if (rt && typeof rt.requiresConsent === 'boolean') return rt;

  let tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    tz = '';
  }
  return { tz, requiresConsent: computeRequiresConsent(tz), state: readStoredConsent() };
}

/** 已存储的显式选择（未选择为 'pending'）。 */
export function readStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return 'pending';
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw === 'granted' || raw === 'denied' ? raw : 'pending';
  } catch {
    return 'pending';
  }
}

export function getConsentState(): ConsentState {
  const rt = getConsentRuntime();
  return rt.state === 'granted' || rt.state === 'denied' ? rt.state : readStoredConsent();
}

/** 是否需要向访客事先征求同意（EEA / UK / CH）。 */
export function requiresConsent(): boolean {
  return getConsentRuntime().requiresConsent;
}

/** 是否允许加载广告与分析：显式授予，或非需同意地区且尚未明确拒绝。 */
export function isConsentGranted(): boolean {
  const state = getConsentState();
  if (state === 'granted') return true;
  if (state === 'denied') return false;
  return !requiresConsent();
}

/** 删除 Google 分析标识 cookie（撤回时真删除，而非只停止后续写入）。 */
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;
  const cookieNames = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name === '_ga' || name === '_gid' || name === '_gat' || name.startsWith('_ga_'));

  const host = window.location.hostname;
  const domains = [host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  for (const name of cookieNames) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

/** 向 Consent Mode 推送更新（必须走 dataLayer，见文件头铁律 2）。 */
export function applyGoogleConsent(state: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const value = state === 'granted' ? 'granted' : 'denied';
  window.dataLayer.push([
    'consent',
    'update',
    {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    },
  ]);
}

/** 写入访客选择并即时生效（授予 / 撤回）。 */
export function setConsent(state: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    /* 隐私模式下写入失败：仍然即时生效，只是下次访问需重新选择 */
  }
  const rt = getConsentRuntime();
  window.__fwConsent = { tz: rt.tz, requiresConsent: rt.requiresConsent, state };
  applyGoogleConsent(state);
  if (state === 'denied') clearAnalyticsCookies();
  notifyConsentChange();
}

/** 订阅同意状态变化；返回取消订阅函数。 */
export function onConsentChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb();
  window.addEventListener(CONSENT_CHANGE_EVENT, handler);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
}

export function notifyConsentChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

/** 打开同意面板（页脚 "Cookie Settings" 撤回入口调用）。 */
export function openConsentPanel(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

/**
 * 生成必须在任何 Google 标签之前执行的内联脚本源码。
 * ⚠️ 变量名 CONSENT_TZ / requiresConsent 是审计脚本识别「已按地区分级」的机器判据，勿改名。
 */
export function buildConsentDefaultScript(): string {
  return [
    '(function(){try{',
    `var CONSENT_TZ=${JSON.stringify(CONSENT_TZ)};`,
    "var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}",
    'var requiresConsent=CONSENT_TZ.indexOf(tz)!==-1;',
    'var stored=null;try{stored=window.localStorage.getItem(' + JSON.stringify(CONSENT_STORAGE_KEY) + ');}catch(e){}',
    "var state=(stored==='granted'||stored==='denied')?stored:'pending';",
    'window.__fwConsent={tz:tz,requiresConsent:requiresConsent,state:state};',
    'window.dataLayer=window.dataLayer||[];',
    'window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};',
    "gtag('js',new Date());",
    "gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});",
    "if(requiresConsent&&state!=='granted'){gtag('consent','update',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});}",
    '}catch(e){}})();',
  ].join('');
}
