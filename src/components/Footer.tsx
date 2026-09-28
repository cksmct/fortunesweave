import Link from 'next/link';
import { getGameConfig } from '@/lib/data';
import { getFooterGroups, getLegalLinks } from '@/lib/nav';

/**
 * Footer —— 与 Header 共用 `src/data/nav.config.json` 单一事实源。
 *
 * 🛑 禁止在本文件硬编码导航数组、第三方"合作伙伴"外链或 emoji 图标
 *    （历史模板曾写死三个无关站点链接 + 🌊 图标，被复制到所有新站）。
 * 🛑 官方渠道只渲染"已配置且已核实"的项：占位 URL（空邀请码/空 gid）一律不渲染。
 */
const config = getGameConfig();
const footerColumns = getFooterGroups();
const legalLinks = getLegalLinks();

// 版权年份：这是"当前年份"这一事实，不是内容新鲜度信号。
// 允许动态；但严禁用它（或任何 new Date()）驱动 lastmod / dateModified。
const year = new Date().getFullYear();

const socialEntries = [
  config.socials?.official
    ? { label: 'Official game page', href: config.socials.official, external: true }
    : null,
  config.socials?.discord
    ? { label: 'Community Discord', href: config.socials.discord, external: true }
    : null,
].filter((v): v is { label: string; href: string; external: boolean } => v !== null);

export default function Footer() {
  return (
    <footer className="mt-20 w-full border-t border-slate-800 bg-slate-950/90 pt-14 pb-10 text-sm text-slate-300 backdrop-blur-md">
      <div className="container-site">
        <div className="mb-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + 独立站声明 */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base font-bold text-slate-100 transition-colors hover:text-cyan-400"
            >
              {config.seo.siteName}
            </Link>
            <p className="text-xs leading-relaxed text-slate-300">
              {config.seo.siteDescription}
            </p>
          </div>

          {/* 数据驱动导航列（与 Header 同源） */}
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-1 text-xs">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center py-1.5 transition-colors hover:text-cyan-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 官方渠道（卡片化大热区，严格满足 Lighthouse 44px 触控标准） */}
          {socialEntries.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Official Links
              </h2>
              <div className="flex flex-col gap-2.5">
                {socialEntries.map((entry) => (
                  <a
                    key={entry.href}
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-[44px] items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-slate-800/80 hover:text-white"
                  >
                    <span>{entry.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 法务链接 + 免责声明 */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-center text-xs text-slate-300 md:flex-row md:text-left">
          <p className="max-w-2xl leading-relaxed">
            {config.seo.siteName} is an independent fan resource and is not affiliated with,
            endorsed by, or sponsored by Roblox Corporation or {config.game.developer}. All game
            trademarks, assets, and copyrights belong to their respective owners.
          </p>
          <p className="shrink-0 font-mono text-slate-300">
            &copy; {year} {config.seo.siteName}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center py-1.5 transition-colors hover:text-cyan-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
