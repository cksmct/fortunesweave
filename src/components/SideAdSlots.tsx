'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  SKYSCRAPER_KEY,
  SKYSCRAPER_SRC,
  SKYSCRAPER_WIDTH,
  SKYSCRAPER_HEIGHT,
  isComplianceExcludedPath,
} from '@/lib/adsterra';

/**
 * Adsterra SideAdSlots — 桌面宽屏双侧摩天大楼组件 (2026 串行链式生产级标准)
 *
 * 核心架构特性与单 Key 双侧竞态防御：
 * 1. 严格串行链式加载（Chained Sequential Loading）：
 *    左侧优先在 500ms 挂载，利用 invoke.onload 监听左侧官方脚本完全执行完毕并落地 iframe 后，
 *    缓冲 300ms 再触发右侧注入（附带 3000ms 超时强制兜底）。
 *    彻底杜绝跨国 VPN 网络下由于 300ms 盲猜延时造成的全局 atOptions 变量覆盖与并发请求丢失。
 * 2. 移除 async = true 异步撕裂：
 *    显式设置 invoke.async = false，保证浏览器严格按序执行脚本，修复 document.currentScript 为 null
 *    导致第二个实例无法定位目标容器的根本缺陷。
 * 3. 独立唯一容器 ID 隔离：
 *    为左右侧分别分配 atContainer-skyscraper-left 与 atContainer-skyscraper-right，彻底杜绝 DOM 查询冲突。
 * 4. 科学下探至 1360px 硬件门禁：
 *    主容器 max-w 为 1024px，在 1360px 视口下两侧余量 168px 完美容纳 160px 摩天大楼，
 *    视口 < 1360px 物理返回 null，零 DOM 挂载、零定时器与零带宽浪费。
 * 5. 零多重 iframe 封装：100% 保持官方原生注入标准与零黑边规范。
 */
export function SideAdSlots() {
  const pathname = usePathname();
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [leftDone, setLeftDone] = useState(false);

  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const leftInjectedRef = useRef(false);
  const rightInjectedRef = useRef(false);

  const isExcluded = isComplianceExcludedPath(pathname);

  // 1. 视口宽度监听 (1360px 硬件门禁)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkWidth = () => {
      setIsWideScreen(window.innerWidth >= 1360);
    };

    checkWidth();
    const mql = window.matchMedia('(min-width: 1360px)');
    const handler = (e: MediaQueryListEvent) => setIsWideScreen(e.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, []);

  // 2. 路由切换时彻底重置所有加载锁与容器状态
  useEffect(() => {
    leftInjectedRef.current = false;
    rightInjectedRef.current = false;
    setLeftDone(false);

    if (leftContainerRef.current) {
      leftContainerRef.current.innerHTML = '';
    }
    if (rightContainerRef.current) {
      rightContainerRef.current.innerHTML = '';
    }
  }, [pathname]);

  // 3. 第一阶段：左侧摩天大楼优先注入 (500ms)
  useEffect(() => {
    if (isExcluded || !isWideScreen || leftInjectedRef.current) return;

    let fallbackTimer: NodeJS.Timeout | null = null;

    const initialTimer = setTimeout(() => {
      if (leftInjectedRef.current || !leftContainerRef.current) return;
      leftInjectedRef.current = true;

      const container = leftContainerRef.current;
      container.innerHTML = '';
      container.id = 'atContainer-skyscraper-left';

      // 注入配置脚本
      const conf = document.createElement('script');
      conf.type = 'text/javascript';
      conf.textContent = `atOptions = { 'key':'${SKYSCRAPER_KEY}', 'format':'iframe', 'height':${SKYSCRAPER_HEIGHT}, 'width':${SKYSCRAPER_WIDTH}, 'params':{} }; window.atOptions = atOptions;`;

      // 注入 invoke.js
      const invoke = document.createElement('script');
      invoke.type = 'text/javascript';
      invoke.async = false; // 严禁乱序异步执行，保证 DOM 执行上下文稳定
      invoke.setAttribute('data-cfasync', 'false');
      invoke.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      invoke.src = SKYSCRAPER_SRC;

      // 监听加载成功或失败回调，驱动串行链式推进
      const handleLeftFinish = () => {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        setLeftDone(true);
      };

      invoke.onload = handleLeftFinish;
      invoke.onerror = handleLeftFinish;

      container.appendChild(conf);
      container.appendChild(invoke);

      // 3000ms 强制超时兜底，防止极慢网络下左侧事件被挂起导致右侧永久不加载
      fallbackTimer = setTimeout(() => {
        setLeftDone(true);
      }, 3000);
    }, 500);

    return () => {
      clearTimeout(initialTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [isExcluded, isWideScreen, pathname]);

  // 4. 第二阶段：左侧就绪后微延迟 300ms 链式触发右侧注入 (零竞态冲突)
  useEffect(() => {
    if (isExcluded || !isWideScreen || !leftDone || rightInjectedRef.current) return;

    const rightTimer = setTimeout(() => {
      if (rightInjectedRef.current || !rightContainerRef.current) return;
      rightInjectedRef.current = true;

      const container = rightContainerRef.current;
      container.innerHTML = '';
      container.id = 'atContainer-skyscraper-right';

      // 再次显式声明属于右侧实例的配置
      const conf = document.createElement('script');
      conf.type = 'text/javascript';
      conf.textContent = `atOptions = { 'key':'${SKYSCRAPER_KEY}', 'format':'iframe', 'height':${SKYSCRAPER_HEIGHT}, 'width':${SKYSCRAPER_WIDTH}, 'params':{} }; window.atOptions = atOptions;`;

      // 注入右侧独立的 invoke 节点
      const invoke = document.createElement('script');
      invoke.type = 'text/javascript';
      invoke.async = false;
      invoke.setAttribute('data-cfasync', 'false');
      invoke.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      invoke.src = SKYSCRAPER_SRC;

      container.appendChild(conf);
      container.appendChild(invoke);
    }, 300);

    return () => {
      clearTimeout(rightTimer);
    };
  }, [isExcluded, isWideScreen, leftDone, pathname]);

  // 纯宽屏硬件门禁：视口 < 1360px 时直接返回 null，0 挂载、0 定时器、0 外部请求
  if (isExcluded || !isWideScreen) {
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
          className="w-[160px] min-h-[620px] rounded-xl border border-white/[0.08] bg-[#0c1016] p-1.5 shadow-2xl transition-all"
          style={{ minHeight: '620px', width: '160px' }}
        >
          <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-white/[0.06] select-none">
            <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-400">
              Sponsored
            </span>
            <span className="text-[9px] font-mono text-zinc-400">L</span>
          </div>
          <div
            ref={leftContainerRef}
            id="atContainer-skyscraper-left"
            className="w-[160px] min-h-[600px] flex items-center justify-center overflow-hidden rounded-lg"
            style={{ width: `${SKYSCRAPER_WIDTH}px`, minHeight: `${SKYSCRAPER_HEIGHT}px` }}
            suppressHydrationWarning
          />
        </div>
      </aside>

      {/* 右侧 160x600 摩天大楼 (严格串行链式加载，100% 杜绝竞态丢画) */}
      <aside
        aria-label="Right Skyscraper Advertisement"
        className="skyscraper-sidebar skyscraper-right"
      >
        <div
          className="w-[160px] min-h-[620px] rounded-xl border border-white/[0.08] bg-[#0c1016] p-1.5 shadow-2xl transition-all"
          style={{ minHeight: '620px', width: '160px' }}
        >
          <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-white/[0.06] select-none">
            <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-400">
              Sponsored
            </span>
            <span className="text-[9px] font-mono text-zinc-400">R</span>
          </div>
          <div
            ref={rightContainerRef}
            id="atContainer-skyscraper-right"
            className="w-[160px] min-h-[600px] flex items-center justify-center overflow-hidden rounded-lg"
            style={{ width: `${SKYSCRAPER_WIDTH}px`, minHeight: `${SKYSCRAPER_HEIGHT}px` }}
            suppressHydrationWarning
          />
        </div>
      </aside>
    </>
  );
}

export default SideAdSlots;
