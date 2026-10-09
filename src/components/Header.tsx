'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getGameConfig } from '@/lib/data';
import dynamic from 'next/dynamic';
import {
  getHeaderGroups,
  getHeaderTopLinks,
  getAllNavLinks,
  type NavGroup,
} from '@/lib/nav';

const SearchModal = dynamic(() => import('@/components/SearchModal'), { ssr: false });

/**
 * Header —— 导航单一事实源驱动。
 *
 * 🛑 禁止在本文件硬编码任何路由数组（历史版本的 Header 写死了另一个游戏的路由，
 *    导致复制模板后整站导航全是 404）。所有链接来自 `src/data/nav.config.json`
 *    （经 `@/lib/nav` 读取），Header 与 Footer 共用同一份配置，天然不会头尾分叉。
 *
 * 布局约束：根 header 固定 h-16 / min-h-[64px]，防客户端水合 CLS 抖动。
 * CTA：仅当 `config.socials.discord` 已配置真实邀请链接时才渲染。
 */
const config = getGameConfig();
const topLinks = getHeaderTopLinks();
const groups = getHeaderGroups();
const allLinks = getAllNavLinks();
const discordUrl = config.socials?.discord?.trim();
const officialUrl = config.game?.officialUrl || config.socials?.official;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenGroup(null);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const isActive = (href: string) => pathname === href;
  const groupActive = (group: NavGroup) =>
    group.columns.some((col) => col.items.some((item) => isActive(item.href)));

  const linkClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? 'bg-[#d3b475] text-zinc-950 font-bold shadow-sm'
        : 'text-[#bbc1cf] hover:bg-white/[0.08] hover:text-[#f5f1eb]'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 h-16 min-h-[64px] border-b border-white/[0.08] bg-[#000000]/95 backdrop-blur-md">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap"
            aria-label={`${config.seo.siteName} home`}
          >
            <img
              src="/images/logo.webp"
              alt={`${config.seo.siteName} Logo`}
              width={36}
              height={36}
              loading="lazy"
              fetchPriority="low"
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-full object-contain ring-1 ring-white/10 shadow-sm"
            />
            <span className="text-base font-black tracking-tight text-[#f5f1eb]">
              {config.seo.siteName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            ref={navRef}
            className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium lg:flex"
            aria-label="Main navigation"
          >
            {topLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(isActive(link.href))}>
                {link.label}
              </Link>
            ))}

            {groups.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                  aria-expanded={openGroup === group.label}
                  className={`group flex cursor-pointer items-center gap-1.5 ${linkClass(
                    groupActive(group) || openGroup === group.label,
                  )}`}
                >
                  <span>{group.label}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform duration-200 ${
                      openGroup === group.label ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {openGroup === group.label && (
                  <div className="absolute right-0 top-full z-50 pt-2">
                    {/* Hover Bridge: 填补按钮与浮层间隙，杜绝鼠标慢速滑动时菜单瞬关 */}
                    <div className="absolute -top-2 left-0 right-0 h-2" aria-hidden="true" />

                    <div
                      className={`${
                        group.label === 'More' ? 'w-[480px]' : 'w-[560px]'
                      } max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#0c121e] p-4.5 shadow-2xl shadow-black/90 ring-1 ring-white/10`}
                    >
                      <div className="grid grid-cols-2 gap-5">
                        {group.columns.map((column) => (
                          <div key={column.title} className="flex flex-col">
                            <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
                              <span className="text-[11px] font-black uppercase tracking-wider text-[#d3b475]">
                                {column.title}
                              </span>
                              <span className="font-mono text-xs text-[#bbc1cf]">
                                {column.items.length}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              {column.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpenGroup(null)}
                                    className={`group/item flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                      active
                                        ? 'bg-[#d3b475]/20 text-[#d3b475]'
                                        : 'text-[#bbc1cf] hover:bg-white/[0.08] hover:text-[#f5f1eb]'
                                    }`}
                                  >
                                    <span className="truncate">{item.label}</span>
                                    {active && (
                                      <span
                                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d3b475]"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA, Search + mobile toggle */}
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            {/* Desktop Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#bbc1cf] transition-all hover:border-[#d3b475]/40 hover:bg-white/[0.08] hover:text-[#f5f1eb] lg:flex"
              aria-label="Search the wiki (⌘K)"
              title="Search the wiki (⌘K)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#d3b475]"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search the wiki</span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-[#bbc1cf]">⌘K</kbd>
            </button>

            {/* Desktop Play on Nintendo CTA */}
            {officialUrl && (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1 rounded-full bg-[#d3b475] px-3.5 py-1.5 text-xs font-black text-zinc-950 shadow-sm transition-all hover:bg-[#e2c78f] hover:shadow-[#d3b475]/20 lg:inline-flex"
              >
                <span>Play on Nintendo</span>
                <span className="text-[10px]" aria-hidden="true">↗</span>
              </a>
            )}

            {discordUrl && (
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-[#bbc1cf] transition-colors hover:bg-white/10 hover:text-white xl:inline-flex"
              >
                Discord
              </a>
            )}

            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#f5f1eb] transition-colors hover:bg-white/[0.1] lg:hidden"
              aria-label="Search the wiki"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#f5f1eb] transition-colors hover:bg-white/[0.1] lg:hidden"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer（100% 不透明，避免与页面内容叠色） */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 top-16 max-h-[calc(100dvh-4rem)] w-full max-w-sm overflow-y-auto overscroll-contain border-l border-white/10 bg-[#090d16] p-5 pb-28">
            {/* 顶栏微标头（严禁重复放置 Close 按钮，已委托右上角汉堡 X 键） */}
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#d3b475]">
                Tactical Navigation
              </span>
              <span className="text-xs text-[#bbc1cf] font-mono">
                v{config.game.currentVersion}
              </span>
            </div>

            {/* 移动端内置全局搜索触发栏 */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left text-xs text-[#bbc1cf] transition-colors hover:border-[#d3b475]/40 hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#d3b475]">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Search guides, heroes, classes...</span>
              </div>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-[#bbc1cf]">⌘K</kbd>
            </button>

            {/* 黄金置顶直达胶囊（3 列，完整继承 topLinks，0 核心入口蒸发） */}
            <div className="mb-5">
              <div className="mb-2 text-xs font-black uppercase tracking-wider text-[#bbc1cf]">
                Quick Access
              </div>
              <div className="grid grid-cols-3 gap-2">
                {topLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-[44px] items-center justify-center rounded-xl px-2 py-2 text-center text-xs font-bold transition-all ${
                      isActive(item.href)
                        ? 'bg-[#d3b475] text-zinc-950 shadow-md'
                        : 'border border-white/10 bg-white/[0.04] text-[#f5f1eb] hover:border-[#d3b475]/40 hover:bg-[#d3b475]/10 hover:text-[#d3b475]'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {discordUrl && (
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-5 flex min-h-[44px] items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-center text-xs font-semibold text-[#f5f1eb] hover:bg-white/10 transition-colors"
              >
                Join Community Discord
              </a>
            )}

            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#d3b475]">
                    {group.label}
                  </div>
                  {/* 双列 Bento 紧凑卡片网格，min-h-[44px] 满足 A11y 靶心，高度缩减 50% */}
                  <div className="grid grid-cols-2 gap-2">
                    {group.columns
                      .flatMap((col) => col.items)
                      .map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex min-h-[44px] items-center rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                            isActive(item.href)
                              ? 'bg-[#d3b475]/20 text-[#d3b475] border border-[#d3b475]/40'
                              : 'border border-white/[0.06] bg-white/[0.02] text-[#bbc1cf] hover:border-white/10 hover:bg-white/[0.06] hover:text-[#f5f1eb]'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Drawer Bottom Play on Nintendo CTA */}
            {officialUrl && (
              <div className="mt-8 pt-4 border-t border-white/10">
                <a
                  href={officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[46px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#d3b475] px-4 py-2.5 text-center text-xs font-black text-zinc-950 shadow-lg hover:bg-[#e2c78f] transition-all"
                >
                  <span>Play on Nintendo</span>
                  <span className="text-[11px]" aria-hidden="true">↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Command Palette Modal */}
      {searchOpen && <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
