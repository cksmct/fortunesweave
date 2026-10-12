'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
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
 * AdWrapper — 全局正文内容调度外壳 (2026 生产级纯净架构)
 *
 * 架构职责：
 * 1. 静态硬预留优先：各页面在正文第 1 模块后显式挂载 <NativeBannerAd />，
 *    SSR 首屏直出 290px 实体卡片骨架，彻底消除客户端动态 Portal 漂移与 CLS 顿挫
 * 2. 纯净内容流：全部 Banner 横幅已彻底下线，全屏零摩天大楼压迫与文尾横幅
 * 3. 法律合规绝对免除：/privacy, /terms 等合规页面严格零广告侵扰
 */
export default function AdWrapper({ children, className = '' }: AdWrapperProps) {
  const pathname = usePathname();
  const isExcluded = isComplianceExcludedPath(pathname);

  if (isExcluded) {
    return <>{children}</>;
  }

  return <div className={className}>{children}</div>;
}

export { AdWrapper };

