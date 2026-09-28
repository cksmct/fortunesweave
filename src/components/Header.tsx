'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getGameConfig } from '@/lib/data';
import {
  getHeaderGroups,
  getHeaderTopLinks,
  getAllNavLinks,
  type NavGroup,
} from '@/lib/nav';

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

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
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
        ? 'bg-zinc-900 text-white dark:bg-white/10 dark:text-white'
        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 h-16 min-h-[64px] border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#090d16]/95">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap"
            aria-label={`${config.seo.siteName} home`}
          >
            {/* 🛡️ Brand Mark: 首选内联 SVG。若替换为 <img>，必须强制携带 loading="lazy" fetchPriority="low" decoding="async"
                严禁裸写 <img>，否则 React 19 会将其自动在 <head> 提升生成 <link rel="preload"> 抢占首屏 LCP 第一网络通道导致性能严重扣分！ */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-sm ring-1 ring-inset ring-white/20">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h10M4 18h7" />
              </svg>
            </span>
            <span className="text-base font-black tracking-tight text-zinc-900 dark:text-zinc-50">
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
                  <div className="absolute left-0 top-full z-50 whitespace-normal pt-2.5">
                    <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xl ring-1 ring-black/5 dark:border-white/10 dark:bg-[#0c121e]">
                      <div className="grid grid-cols-2 gap-6">
                        {group.columns.map((column) => (
                          <div key={column.title}>
                            <div className="mb-2.5 border-b border-zinc-100 pb-1 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:border-white/5 dark:text-amber-400">
                              {column.title}
                            </div>
                            <div className="space-y-1">
                              {column.items.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`block rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                    isActive(item.href)
                                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                                      : 'text-zinc-700 hover:bg-sky-50 hover:text-sky-700 dark:text-zinc-300 dark:hover:bg-sky-950/50 dark:hover:text-sky-300'
                                  }`}
                                >
                                  {item.label}
                                </Link>
                              ))}
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

          {/* CTA + mobile toggle */}
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            {discordUrl && (
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-zinc-950 transition-colors hover:bg-amber-300 sm:inline-flex dark:bg-amber-500 dark:hover:bg-amber-400"
              >
                Discord
              </a>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-300"
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
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 top-16 max-h-[calc(100dvh-4rem)] w-full max-w-sm overflow-y-auto overscroll-contain border-l border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#090d16]">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Navigation
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300"
              >
                Close
              </button>
            </div>

            {discordUrl && (
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-5 block rounded-xl bg-amber-400 px-4 py-3 text-center text-xs font-black text-zinc-950 dark:bg-amber-500"
              >
                Join the community Discord
              </a>
            )}

            <div className="space-y-5">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.columns.flatMap((col) => col.items).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                          isActive(item.href)
                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t border-zinc-200 pt-3 dark:border-white/10">
                <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  All pages
                </div>
                <div className="flex flex-wrap gap-2">
                  {allLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
