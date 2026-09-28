/**
 * nav.ts — 导航读取层（Header / Footer 共用的单一事实源）
 *
 * 设计动机：Header 与 Footer 若各自维护硬编码链接数组，站点增长后必然出现
 * "顶部菜单很薄、底部菜单很全"的分叉。所有导航链接统一放在
 * `src/data/nav.config.json`，本文件只负责读取与类型收敛。
 *
 * 约束：
 * - 禁止在 Header.tsx / Footer.tsx 里出现硬编码的导航 href 数组。
 * - 新增页面必须同时登记进 nav.config.json 的 header 与 footer（零孤儿门禁要求 ≥2 入链）。
 */
import navConfig from '@/data/nav.config.json';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavColumn {
  title: string;
  items: NavLink[];
}

export interface NavGroup {
  label: string;
  columns: NavColumn[];
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

interface NavConfig {
  header: { top: NavLink[]; groups: NavGroup[] };
  footer: { columns: FooterColumn[]; legal: NavLink[] };
}

const config = navConfig as unknown as NavConfig;

export function getHeaderTopLinks(): NavLink[] {
  return config.header?.top ?? [];
}

export function getHeaderGroups(): NavGroup[] {
  return config.header?.groups ?? [];
}

export function getFooterGroups(): FooterColumn[] {
  return config.footer?.columns ?? [];
}

export function getLegalLinks(): NavLink[] {
  return config.footer?.legal ?? [];
}

/** 全站导航链接全集（去重，用于审计 / 内链检查）。 */
export function getAllNavLinks(): NavLink[] {
  const all: NavLink[] = [
    ...getHeaderTopLinks(),
    ...getHeaderGroups().flatMap((g) => g.columns.flatMap((c) => c.items)),
    ...getFooterGroups().flatMap((c) => c.links),
    ...getLegalLinks(),
  ];
  const seen = new Set<string>();
  return all.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}
