'use client';

import { useEffect } from 'react';
import { isConsentGranted, onConsentChange } from '@/lib/consent';

/**
 * Analytics —— GA4 延迟加载器（同意门控版）。
 *
 * 为什么这样写：
 * 1. 性能：遵循 PageSpeed / Core Web Vitals「0-TBT 交互优先」法则 ——
 *    首屏交互（scroll/click/touchstart/keydown）或 20s 兜底后才注入 gtag.js。
 *    ⚠️ 20s 是实测最优值，不要改成 3s：短兜底会让 gtag.js 落进 Lighthouse 观测窗口，
 *    产生 long task 推高 TBT，直接压低 CWV 分数（而 CWV 是排名因素，GA 不是）。
 * 2. 合规：未获同意（EEA/UK/CH 尚未选择或明确拒绝）时绝不注入，也不写任何 cookie；
 *    访客稍后点 Accept 会经 onConsentChange 立即补载。
 */
export default function Analytics({ gaId }: { gaId?: string }) {
  useEffect(() => {
    if (!gaId) return;

    let cancelled = false;
    let loaded = false;
    let timer: number | undefined;

    const events = ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'] as const;

    const cleanupListeners = () => {
      events.forEach((e) => window.removeEventListener(e, load));
    };

    const ensureGtagScript = () => {
      if (document.getElementById('ga4-script')) return;
      const s = document.createElement('script');
      s.id = 'ga4-script';
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);
    };

    function load() {
      if (cancelled || loaded) return;
      if (!isConsentGranted()) return; // 同意门禁：未获同意绝不加载
      loaded = true;
      cleanupListeners();
      if (timer) window.clearTimeout(timer);

      ensureGtagScript();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(['js', new Date()]);
      window.dataLayer.push(['config', gaId]);
    }

    events.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    timer = window.setTimeout(load, 20000);

    // 访客在面板上点 Accept 后，立刻按同一策略补载（无需再等交互/超时）
    const unsubscribe = onConsentChange(load);

    return () => {
      cancelled = true;
      cleanupListeners();
      if (timer) window.clearTimeout(timer);
      unsubscribe();
    };
  }, [gaId]);

  return null;
}
