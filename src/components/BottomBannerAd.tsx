'use client';

import React, { useEffect, useRef, useState } from 'react';
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

/**
 * Adsterra BottomBannerAd — 长页文尾响应式横幅组件 (2026 生产级标准)
 *
 * 核心架构铁律：
 * 1. 强隔离按需单发（Single-Dispatch Isolation）：桌面端仅挂 728x90，移动端仅挂 300x250，
 *    严禁使用 CSS display:none 隐藏另一个 iframe，杜绝被 MRC 反作弊脚本判定为隐瞒流量 (Hidden Ad Fraud)
 * 2. 官方原生追加（零手动 iframe）：严格通过容器内部 appendChild 注入官方 atOptions 与 invoke.js
 * 3. 紧凑外框与零黑边：w-fit max-w-full mx-auto 紧贴物料，杜绝全宽拉伸突兀大黑边
 * 4. 混合视口懒加载：提前 600px 视口微感知 + 3500ms 超时兜底，保障出画与首屏性能双赢
 * 5. 三层确定性长页过滤：单实体紧凑叶子页与合规法律页严格 0 挂载
 */
export default function BottomBannerAd({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const hasInjectedRef = useRef(false);

  const isEligible = isLongContentPage(pathname);

  // 1. 媒体查询感知设备（桌面端 >= 768px，移动端 < 768px）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, []);

  // 2. 路由切换彻底复位
  useEffect(() => {
    setShouldLoad(false);
    hasInjectedRef.current = false;
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, [pathname]);

  // 3. 视口距离懒加载 (600px 提前量 + 3500ms 兜底)
  useEffect(() => {
    if (!isEligible || shouldLoad) return;
    const el = wrapperRef.current;
    if (!el) return;

    let timer: NodeJS.Timeout | null = null;
    const trigger = () => {
      setShouldLoad(true);
    };

    if (!('IntersectionObserver' in window)) {
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
      { rootMargin: '600px 0px' }
    );
    obs.observe(el);

    // 3500ms 超时安全兜底
    timer = setTimeout(() => {
      trigger();
      obs.disconnect();
    }, 3500);

    return () => {
      obs.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [isEligible, shouldLoad, pathname]);

  // 4. 强隔离单发注入（杜绝隐藏 iframe 作弊）
  useEffect(() => {
    if (!isEligible || !shouldLoad || hasInjectedRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    hasInjectedRef.current = true;
    container.innerHTML = '';

    const width = isDesktop ? DESKTOP_BANNER_WIDTH : MOBILE_BANNER_WIDTH;
    const height = isDesktop ? DESKTOP_BANNER_HEIGHT : MOBILE_BANNER_HEIGHT;
    const key = isDesktop ? DESKTOP_BANNER_KEY : MOBILE_BANNER_KEY;
    const src = isDesktop ? DESKTOP_BANNER_SRC : MOBILE_BANNER_SRC;

    const conf = document.createElement('script');
    conf.type = 'text/javascript';
    conf.textContent = `atOptions = { 'key':'${key}', 'format':'iframe', 'height':${height}, 'width':${width}, 'params':{} }; window.atOptions = atOptions;`;

    const invoke = document.createElement('script');
    invoke.type = 'text/javascript';
    invoke.async = true;
    invoke.setAttribute('data-cfasync', 'false');
    invoke.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    invoke.src = src;

    container.appendChild(conf);
    container.appendChild(invoke);
  }, [isEligible, shouldLoad, isDesktop]);

  if (!isEligible) return null;

  return (
    <div
      ref={wrapperRef}
      data-bottom-ad-slot="true"
      className={`container-site w-full my-8 sm:my-12 clear-both ${className}`}
    >
      <div
        className="w-fit max-w-full mx-auto rounded-2xl border border-white/[0.08] bg-[#0c1016] p-2 sm:p-2.5 shadow-2xl transition-all"
        style={{ minHeight: isDesktop ? 120 : 280 }}
      >
        <div className="flex items-center justify-between px-1.5 pb-1.5 mb-1 border-b border-white/[0.06] select-none">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d3b475]/60" aria-hidden="true" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
              Sponsored
            </span>
          </div>
          <span className="text-[9px] font-mono font-medium tracking-wide uppercase text-zinc-400">
            {isDesktop ? '728 × 90' : '300 × 250'}
          </span>
        </div>
        <div
          ref={containerRef}
          className="flex items-center justify-center overflow-hidden rounded-lg mx-auto"
          style={{
            width: isDesktop ? `${DESKTOP_BANNER_WIDTH}px` : `${MOBILE_BANNER_WIDTH}px`,
            maxWidth: '100%',
            minHeight: isDesktop ? `${DESKTOP_BANNER_HEIGHT}px` : `${MOBILE_BANNER_HEIGHT}px`,
          }}
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}
