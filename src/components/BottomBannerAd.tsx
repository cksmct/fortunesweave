'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  DESKTOP_BANNER_KEY,
  DESKTOP_BANNER_SRC,
  DESKTOP_BANNER_WIDTH,
  DESKTOP_BANNER_HEIGHT,
  MOBILE_BANNER_KEY,
  MOBILE_BANNER_SRC,
  MOBILE_BANNER_WIDTH,
  MOBILE_BANNER_HEIGHT,
  isLongContentPage,
} from '@/lib/adsterra';
import { useConsentGranted } from '@/lib/useConsent';

/**
 * Adsterra BottomBannerAd — 全站长页文末响应式横幅广告组件 (2026 生产级标准)
 *
 * 核心架构保障：
 * 1. 强隔离按需单发 (Single-Dispatch Isolation)：
 *    客户端 matchMedia 判定设备，桌面端仅创建 728×90，移动端仅创建 300×250，
 *    严禁在 DOM 中同时渲染两个 iframe 再通过 CSS display:none 隐藏（防 MRC 作弊刷量判定）。
 * 2. 官方原生直接挂载：零多重嵌套 iframe，原生 atOptions 脚本与 invoke.js 追加到容器 div。
 * 3. 混合式视口懒加载：500px 距离提前预载 + 3.5s 兜底，首屏 LCP 零带宽争抢。
 * 4. 紧凑外框与 CLS 锁死：w-fit max-w-full mx-auto，桌面 106px / 移动 266px 锁定，零黑边与位移。
 * 5. WCAG AA 对比度合规：text-zinc-400 实测 7.45:1，零透明度修饰符。
 */
export default function BottomBannerAd({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceIdRef = useRef(0);
  const hasInjectedRef = useRef(false);

  const [isDesktop, setIsDesktop] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  const isEligible = isLongContentPage(pathname);
  const adsAllowed = useConsentGranted();

  // 1. 媒体查询探测设备单发（桌面端 >= 768px，移动端 < 768px）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 2. 路由切换彻底复位
  useEffect(() => {
    setShouldLoad(false);
    setIsInViewport(false);
    hasInjectedRef.current = false;
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, [pathname]);

  // 3. 视口距离感知 (500px 阈值) + 安全兜底定时器
  useEffect(() => {
    if (!isEligible || shouldLoad) return;
    const el = wrapperRef.current;
    if (!el) return;

    let fallbackTimer: NodeJS.Timeout | null = null;
    const trigger = () => setShouldLoad(true);

    if (typeof IntersectionObserver === 'undefined') {
      trigger();
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          trigger();
          obs.disconnect();
        }
      },
      { rootMargin: '500px 0px' }
    );
    obs.observe(el);

    // 3500ms 安全兜底出画，避开首屏前 3 秒测速窗口，同时保证全平台稳定渲染
    fallbackTimer = setTimeout(trigger, 3500);

    return () => {
      obs.disconnect();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [isEligible, shouldLoad, pathname]);

  // 4. 官方 atOptions 容器原生直接追加
  const injectAd = useCallback(() => {
    if (!containerRef.current || hasInjectedRef.current) return;
    if (adsAllowed !== true) return;

    hasInjectedRef.current = true;
    const container = containerRef.current;
    container.innerHTML = '';

    instanceIdRef.current += 1;
    container.id = `atContainer-bottom-${instanceIdRef.current}`;

    const width = isDesktop ? DESKTOP_BANNER_WIDTH : MOBILE_BANNER_WIDTH;
    const height = isDesktop ? DESKTOP_BANNER_HEIGHT : MOBILE_BANNER_HEIGHT;
    const key = isDesktop ? DESKTOP_BANNER_KEY : MOBILE_BANNER_KEY;
    const src = isDesktop ? DESKTOP_BANNER_SRC : MOBILE_BANNER_SRC;

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.textContent = `var atOptions = { 'key' : '${key}', 'format' : 'iframe', 'height' : ${height}, 'width' : ${width}, 'params' : {} }; window.atOptions = atOptions;`;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.async = true;
    invokeScript.setAttribute('data-cfasync', 'false');
    invokeScript.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    invokeScript.src = src;

    container.appendChild(confScript);
    container.appendChild(invokeScript);
  }, [isDesktop, adsAllowed]);

  useEffect(() => {
    if (isEligible && shouldLoad && adsAllowed === true && !hasInjectedRef.current) {
      injectAd();
    }
  }, [isEligible, shouldLoad, adsAllowed, injectAd]);

  // 同意撤回处理
  useEffect(() => {
    if (adsAllowed === false) {
      hasInjectedRef.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  }, [adsAllowed]);

  if (!isEligible || adsAllowed === false) return null;

  const minHeight = isDesktop ? '106px' : '266px';
  const width = isDesktop ? DESKTOP_BANNER_WIDTH : MOBILE_BANNER_WIDTH;
  const height = isDesktop ? DESKTOP_BANNER_HEIGHT : MOBILE_BANNER_HEIGHT;

  return (
    <div
      ref={wrapperRef}
      data-ad-slot="bottom-banner"
      className={`container-site w-full my-8 sm:my-12 clear-both ${className}`}
    >
      <div
        className="w-fit max-w-full mx-auto rounded-2xl border border-white/[0.08] bg-[#0c1016] p-2 sm:p-2.5 shadow-2xl transition-all"
        style={{ minHeight }}
      >
        <div className="flex items-center justify-between px-1.5 pb-1.5 mb-1 border-b border-white/[0.04] select-none">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d3b475]/60" aria-hidden="true" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
              Sponsored / Advertisement
            </span>
          </div>
          <span className="text-[9px] font-mono font-medium uppercase text-zinc-400">
            {isDesktop ? '728 × 90' : '300 × 250'}
          </span>
        </div>
        <div
          ref={containerRef}
          className="flex items-center justify-center overflow-hidden rounded-lg mx-auto bg-[#080c12]"
          style={{
            width: `${width}px`,
            maxWidth: '100%',
            height: `${height}px`,
          }}
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}

export { BottomBannerAd };
