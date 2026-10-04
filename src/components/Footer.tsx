import Link from 'next/link';
import { getGameConfig } from '@/lib/data';
import { getFooterGroups, getLegalLinks } from '@/lib/nav';
import PartnersPanel from './PartnersPanel';

/**
 * Footer —— 与 Header 共用 `src/data/nav.config.json` 单一事实源。
 * 遵循 header-footer-architecture 规范：
 *  - 双层解耦架构：上层横通 Brand + Official 渠道，下层 4 列等高平衡链接矩阵；
 *  - 严格剔除历史残留的第三方平台错误字眼，对齐 Nintendo / Intelligent Systems 身份隔离；
 *  - 统一为皇家黑金与深盾蓝沉浸色彩，全部链接满足 Lighthouse 44px 触控靶心与 WCAG 对比度。
 */
const config = getGameConfig();
const footerColumns = getFooterGroups();
const legalLinks = getLegalLinks();
const year = new Date().getFullYear();

const socialEntries = [
  config.socials?.official
    ? { label: 'Official Nintendo Page', href: config.socials.official, external: true }
    : null,
  config.socials?.discord
    ? { label: 'Community Discord', href: config.socials.discord, external: true }
    : null,
].filter((v): v is { label: string; href: string; external: boolean } => v !== null);

export default function Footer() {
  return (
    <footer className="mt-20 w-full border-t border-white/[0.08] bg-[#070c18] pt-14 pb-12 text-sm text-slate-300">
      <div className="container-site">
        {/* Tier 1: 顶部横通功能栏 (Brand & Status Bar) —— 彻底消除横向挤压与折行 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-10 border-b border-white/[0.08]">
          {/* 品牌与简介 */}
          <div className="space-y-2 max-w-xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base font-bold text-[#f5f1eb] transition-colors hover:text-[#d3b475]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#d3b475] to-amber-700 text-zinc-950 font-black text-xs ring-1 ring-white/20">
                FE
              </span>
              <span>{config.seo.siteName}</span>
            </Link>
            <p className="text-xs leading-relaxed text-[#bbc1cf]">
              {config.seo.siteDescription}
            </p>
          </div>

          {/* 官方渠道卡片（44px 独立大靶心，严格合规） */}
          {socialEntries.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {socialEntries.map((entry) => (
                <a
                  key={entry.href}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[#f5f1eb] transition-all hover:border-[#d3b475]/50 hover:bg-[#d3b475]/10 hover:text-[#d3b475]"
                >
                  <span className="glow-dot-gold" />
                  <span>{entry.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Tier 2: 4 列平衡链接矩阵 —— 底部 100% 齐平，零断层留白 */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pt-10 pb-12 border-b border-white/[0.08]">
          {footerColumns.map((column) => (
            <div key={column.title} className="flex flex-col space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#d3b475]">
                {column.title}
              </h2>
              <ul className="flex flex-col space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {/* 铁律：必须 inline-flex gap-1.5，严禁 w-full justify-between 导致角标两极悬空 */}
                    <Link
                      href={link.href}
                      className="group/item inline-flex items-center gap-1.5 py-1.5 text-xs font-medium text-[#bbc1cf] transition-colors hover:text-[#d3b475]"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* PARTNERS PANEL: 仅限首页呈现，无条件包含在原始 HTML 中供爬虫索引。
            与 Tier 2 导航矩阵同属“目录与去向”语义组；法务与版权行在下方保持成组 */}
        <PartnersPanel />

        {/* Tier 3: 法务说明与免责声明（项目身份隔离：严格对齐 Nintendo / Intelligent Systems） */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-center text-xs text-[#bbc1cf] md:flex-row md:text-left">
          <p className="max-w-2xl leading-relaxed">
            {config.seo.siteName} is an independent, community-run fan resource and is not affiliated
            with, endorsed by, or sponsored by Nintendo or Intelligent Systems. All game trademarks,
            character names, and assets belong to Nintendo and Intelligent Systems.
          </p>
          <p className="shrink-0 font-mono text-xs text-[#bbc1cf]">
            &copy; {year} {config.seo.siteName}
          </p>
        </div>

        {/* Tier 4: 法务链接对齐行 (防触控碰撞规范 gap-x-5 gap-y-2.5, py-1.5 px-1) */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-1.5 px-1 text-xs text-[#bbc1cf] transition-colors hover:text-[#d3b475]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
