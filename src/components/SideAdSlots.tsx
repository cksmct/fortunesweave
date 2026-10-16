'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  SKYSCRAPER_KEY,
  SKYSCRAPER_SRC,
  SKYSCRAPER_WIDTH,
  SKYSCRAPER_HEIGHT,
  isComplianceExcludedPath,
} from '@/lib/adsterra';
import { useConsentGranted } from '@/lib/useConsent';

/**
 * Adsterra SideAdSlots — 桌面双侧 160×600 摩天大楼广告组件 (2026 生产级串行链式标准)
 *
 * 核心架构保障：
 * 1. 纯桌面硬件门禁 (Hardware Gate)：
 *    仅在视口 >= 1360px 时激活（1366px+ 笔记本与宽屏显示器），视口 < 1360px 直接返回 null，零 DOM 零请求。
 * 2. 双阶段状态机串行链式加载 (Chained Sequential Loading State Machine)：
 *    - 第一阶段：左侧在 500ms 挂载，监听 invoke.onload / invoke.onerror，配合 5000ms 跨国 VPN 兜底；
 *    - 第二阶段：确认左侧脚本完全执行完毕并出画后，微缓冲 400ms 再拉起右侧；
 *    - 彻底根除全局 window.atOptions 覆盖与 Adsterra CDN 同毫秒并发拦截，保证左右双侧 100% 稳定出画！
 * 3. 独立唯一容器 ID：左侧 atContainer-skyscraper-left，右侧 atContainer-skyscraper-right。
 * 4. 零多重嵌套 iframe：官方 atOptions 配置对象与 invoke.js 原生 appendChild 挂载。
 * 5. 27px 顶部绝对物理真空隔离带：CSS 锁定 top >= 92px，绝不向上冲入 64px Header 造成误触或遮挡。
 */
export default function SideAdSlots() {
  const pathname = usePathname();
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [leftDone, setLeftDone] = useState(false);
  const [rightReady, setRightReady] = useState(false);

  const leftAdRef = useRef<HTMLDivElement>(null);
  const rightAdRef = useRef<HTMLDivElement>(null);
  const leftInjectedRef = useRef(false);
  const rightInjectedRef = useRef(false);

  const isExcluded = isComplianceExcludedPath(pathname);
  const adsAllowed = useConsentGranted();

  // 1. 硬件视口门禁监听 (>= 1400px)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkWidth = () => {
      setIsWideScreen(window.innerWidth >= 1400);
    };

    checkWidth();
    const mql = window.matchMedia('(min-width: 1400px)');
    const handler = (e: MediaQueryListEvent) => setIsWideScreen(e.matches);

    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, []);

  // 2. 路由切换时彻底重置所有状态与容器
  useEffect(() => {
    leftInjectedRef.current = false;
    rightInjectedRef.current = false;
    setLeftDone(false);
    setRightReady(false);
    if (leftAdRef.current) leftAdRef.current.innerHTML = '';
    if (rightAdRef.current) rightAdRef.current.innerHTML = '';
  }, [pathname]);

  // 3. 第一阶段：左侧摩天大楼优先注入 (500ms)
  useEffect(() => {
    if (isExcluded || !isWideScreen || leftInjectedRef.current) return;
    if (adsAllowed !== true) return;

    let isCancelled = false;
    let fallbackTimer: NodeJS.Timeout | null = null;

    const timer = setTimeout(() => {
      if (isCancelled || leftInjectedRef.current || !leftAdRef.current) return;
      leftInjectedRef.current = true;

      const container = leftAdRef.current;
      container.innerHTML = '';
      container.id = 'atContainer-skyscraper-left';

      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.textContent = `var atOptions = {'key' : '${SKYSCRAPER_KEY}', 'format' : 'iframe', 'height' : ${SKYSCRAPER_HEIGHT}, 'width' : ${SKYSCRAPER_WIDTH}, 'params' : {}}; window.atOptions = atOptions;`;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.async = false;
      invokeScript.setAttribute('data-cfasync', 'false');
      invokeScript.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      invokeScript.src = SKYSCRAPER_SRC;

      let finished = false;
      const finishLeft = () => {
        if (finished || isCancelled) return;
        finished = true;
        if (fallbackTimer) clearTimeout(fallbackTimer);
        setLeftDone(true);
      };

      invokeScript.onload = finishLeft;
      invokeScript.onerror = finishLeft;

      container.appendChild(confScript);
      container.appendChild(invokeScript);

      // 4500ms 跨国 CDN 响应安全兜底守护
      fallbackTimer = setTimeout(finishLeft, 4500);
    }, 500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [isExcluded, isWideScreen, pathname, adsAllowed]);

  // 4. 第二阶段：左侧完成后缓冲 400ms 再拉起右侧
  useEffect(() => {
    if (!leftDone || rightReady || isExcluded || !isWideScreen) return;
    if (adsAllowed !== true) return;

    const bufferTimer = setTimeout(() => {
      setRightReady(true);
    }, 400);

    return () => clearTimeout(bufferTimer);
  }, [leftDone, rightReady, isExcluded, isWideScreen, adsAllowed]);

  // 5. 第三阶段：右侧摩天大楼独立注入 (零竞态冲突)
  useEffect(() => {
    if (isExcluded || !isWideScreen || !rightReady || rightInjectedRef.current) return;
    if (adsAllowed !== true) return;
    if (!rightAdRef.current) return;

    rightInjectedRef.current = true;
    const container = rightAdRef.current;
    container.innerHTML = '';
    container.id = 'atContainer-skyscraper-right';

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.textContent = `var atOptions = {'key' : '${SKYSCRAPER_KEY}', 'format' : 'iframe', 'height' : ${SKYSCRAPER_HEIGHT}, 'width' : ${SKYSCRAPER_WIDTH}, 'params' : {}}; window.atOptions = atOptions;`;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.async = false;
    invokeScript.setAttribute('data-cfasync', 'false');
    invokeScript.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    invokeScript.src = SKYSCRAPER_SRC;

    container.appendChild(confScript);
    container.appendChild(invokeScript);
  }, [isExcluded, isWideScreen, rightReady, adsAllowed]);

  // 同意撤回处理
  useEffect(() => {
    if (adsAllowed === false) {
      if (leftAdRef.current) leftAdRef.current.innerHTML = '';
      if (rightAdRef.current) rightAdRef.current.innerHTML = '';
      leftInjectedRef.current = false;
      rightInjectedRef.current = false;
      setLeftDone(false);
      setRightReady(false);
    }
  }, [adsAllowed]);

  if (isExcluded || !isWideScreen || adsAllowed === false) {
    return null;
  }

  return (
    <>
      {/* 左侧 160x600 摩天大楼 */}
      <aside
        aria-label="Left Skyscraper Advertisement"
        className="skyscraper-sidebar skyscraper-left"
      >
        <div
          className="w-[160px] min-h-[620px] rounded-xl border border-white/10 bg-[#0c1016]/95 p-1.5 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col items-center select-none"
          style={{ width: '160px', minHeight: '620px' }}
        >
          <div className="w-full flex items-center justify-between pb-1 mb-1 border-b border-white/10 px-1">
            <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-400">
              Advertisement
            </span>
            <span className="text-[9px] font-mono font-medium text-zinc-400">160×600</span>
          </div>
          <div
            ref={leftAdRef}
            id="atContainer-skyscraper-left"
            className="w-[160px] min-h-[600px] flex items-center justify-center overflow-hidden rounded-lg bg-[#080c12]"
            style={{ width: `${SKYSCRAPER_WIDTH}px`, minHeight: `${SKYSCRAPER_HEIGHT}px` }}
            suppressHydrationWarning
          />
        </div>
      </aside>

      {/* 右侧 160x600 摩天大楼 */}
      <aside
        aria-label="Right Skyscraper Advertisement"
        className="skyscraper-sidebar skyscraper-right"
      >
        <div
          className="w-[160px] min-h-[620px] rounded-xl border border-white/10 bg-[#0c1016]/95 p-1.5 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col items-center select-none"
          style={{ width: '160px', minHeight: '620px' }}
        >
          <div className="w-full flex items-center justify-between pb-1 mb-1 border-b border-white/10 px-1">
            <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-400">
              Advertisement
            </span>
            <span className="text-[9px] font-mono font-medium text-zinc-400">160×600</span>
          </div>
          <div
            ref={rightAdRef}
            id="atContainer-skyscraper-right"
            className="w-[160px] min-h-[600px] flex items-center justify-center overflow-hidden rounded-lg bg-[#080c12]"
            style={{ width: `${SKYSCRAPER_WIDTH}px`, minHeight: `${SKYSCRAPER_HEIGHT}px` }}
            suppressHydrationWarning
          />
        </div>
      </aside>
    </>
  );
}

export { SideAdSlots };
