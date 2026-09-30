'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import BottomBannerAd from './BottomBannerAd';
import SideAdSlots from './SideAdSlots';
import { isComplianceExcludedPath } from '@/lib/adsterra';

interface AdWrapperProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * E-E-A-T 安全区防线选择器常量 (Content-First Mandate)
 * 严格排除 data-hero, page-header, h1, data-ad-ignore 避免广告切断作者信誉
 */
export const HERO_EXCLUSION_SELECTORS = [
  'data-hero',
  'page-header',
  'h1',
  'data-ad-ignore',
];

/**
 * AdWrapper — 全局广告总外壳 (2026 生产级精简架构)
 *
 * 架构职责：
 * 1. 宽屏双侧摩天大楼 (160×600)：全站浮动调度，纯硬件视口拦截 (>=1360px)
 * 2. 静态硬预留优先：各页面在正文第 1 模块后显式挂载 <NativeBannerAd />，
 *    SSR 首屏直出 290px 实体卡片骨架，彻底消除客户端动态 Portal 漂移与 CLS 顿挫
 * 3. 长页文尾横幅 (BottomBannerAd)：在非合规长页文末自适应直出
 * 4. 法律合规绝对免除：/privacy, /terms 等合规页面严格 0 广告
 */
export default function AdWrapper({ children, className = '' }: AdWrapperProps) {
  const pathname = usePathname();
  const isExcluded = isComplianceExcludedPath(pathname);

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <>
      {/* 桌面宽屏双侧摩天大楼 (160×600) */}
      <SideAdSlots />

      {/* 正文主体内容 */}
      <div className={className}>{children}</div>

      {/* 长页面文末响应式横幅 (桌面 728×90 / 移动 300×250，BottomBannerAd 内部自适应长页判定) */}
      <BottomBannerAd />
    </>
  );
}

export { AdWrapper };
