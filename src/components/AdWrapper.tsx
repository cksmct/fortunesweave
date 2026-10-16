'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { isComplianceExcludedPath } from '@/lib/adsterra';
import SideAdSlots from './SideAdSlots';
import BottomBannerAd from './BottomBannerAd';

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
 * AdWrapper — 全局广告与变现总调度外壳 (2026 生产级标准)
 *
 * 架构职责：
 * 1. 桌面双侧摩天大楼 (160×600)：通过 <SideAdSlots /> 在 >=1360px 硬件视口下渲染，串行链式加载确保双侧 100% 填充；
 * 2. 黄金主力 Native Banner：各页面模板静态硬预留在正文第 1 模块后，SSR 直出 290px/310px 骨架；
 * 3. 长页文末响应式横幅 (728×90 / 300×250)：通过 <BottomBannerAd /> 在正文文末自适应渲染，短页自动免除；
 * 4. 彻底退役 Social Bar：浮动通知层全面下线；
 * 5. 法律合规绝对免除：/privacy, /terms 等合规页面严格零广告侵扰。
 */
export default function AdWrapper({ children, className = '' }: AdWrapperProps) {
  const pathname = usePathname();
  const isExcluded = isComplianceExcludedPath(pathname);

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className={`ad-wrapper-hull relative w-full ${className}`}>
      {/* 1. 桌面宽屏双侧 160x600 摩天大楼 */}
      <SideAdSlots />

      {/* 2. 主体页面内容 */}
      <div className="w-full">{children}</div>

      {/* 3. 长页文末响应式横幅 (内部自适应长页判定：短页自动返回 null) */}
      <BottomBannerAd />
    </div>
  );
}

export { AdWrapper };
