'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchItem {
  id: string;
  title: string;
  category: 'Pages' | 'Characters' | 'Classes' | 'Walkthrough' | 'Paralogues' | 'Equipment' | 'Gifts' | string;
  href: string;
  description: string;
  keywords: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Pages: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Characters: { bg: 'bg-[#d3b475]/15', text: 'text-[#d3b475]', border: 'border-[#d3b475]/30' },
  Classes: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Walkthrough: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Paralogues: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Equipment: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Gifts: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [indexData, setIndexData] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 1. Interaction-First 懒加载索引（仅在打开时拉取一次）
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      return;
    }

    if (indexData.length === 0) {
      setIsLoading(true);
      fetch('/search-index.json')
        .then((res) => res.json())
        .then((data: SearchItem[]) => {
          setIndexData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('[SearchModal] Failed to load search index:', err);
          setIsLoading(false);
        });
    }

    // 自动聚焦
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    // 禁用外部页面滚动
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, indexData.length]);

  // 2. 内存模糊检索
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // 空查询时，默认推荐常用的核心功能页面
      return indexData
        .filter((item) => item.category === 'Pages')
        .slice(0, 8);
    }

    const tokens = q.split(/\s+/).filter(Boolean);

    // 计算相关度得分
    const scored = [];
    for (const item of indexData) {
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      const kwLower = item.keywords.toLowerCase();

      let score = 0;
      let matchedAllTokens = true;

      for (const t of tokens) {
        if (titleLower === t) {
          score += 100;
        } else if (titleLower.startsWith(t)) {
          score += 50;
        } else if (titleLower.includes(t)) {
          score += 25;
        } else if (kwLower.includes(t)) {
          score += 10;
        } else if (descLower.includes(t)) {
          score += 5;
        } else {
          matchedAllTokens = false;
          break;
        }
      }

      if (matchedAllTokens && score > 0) {
        // 角色和页面在同等匹配度下提权
        if (item.category === 'Pages') score += 5;
        if (item.category === 'Characters') score += 4;
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 20).map((s) => s.item);
  }, [query, indexData]);

  // 3. 结果变化时重置选中光标
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 4. 选择跳转
  const handleSelect = (item: SearchItem) => {
    onClose();
    router.push(item.href);
  };

  // 5. 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // 保证光标在滚动视口内
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-0 sm:p-6 sm:pt-16 md:pt-24 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search Wiki & Guides"
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-[#0c121e] text-[#f5f1eb] shadow-2xl sm:h-auto sm:max-h-[82vh] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-white/10 sm:ring-1 sm:ring-[#d3b475]/30"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="relative flex shrink-0 items-center border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
          <svg
            className="h-5 w-5 shrink-0 text-[#d3b475]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, characters, classes, weapons, chapters..."
            className="ml-3 w-full bg-transparent text-sm sm:text-base font-medium text-[#f5f1eb] placeholder:text-zinc-500 focus:outline-none"
            aria-label="Search input"
          />

          <div className="flex shrink-0 items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded p-1 text-[#bbc1cf] hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Clear query"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono font-medium text-[#bbc1cf] hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close search"
            >
              ESC
            </button>
          </div>
        </div>

        {/* Search Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3 scrollbar-thin scrollbar-thumb-white/10"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#bbc1cf]">
              <svg className="h-6 w-6 animate-spin text-[#d3b475]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="mt-2 text-xs">Loading database index...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-600 dark:text-zinc-400">
              <p className="text-sm font-medium text-[#f5f1eb]">No matching entries found</p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Try searching for hero names (e.g. Cai, Dietrich), classes, gifts, or chapters
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const catStyle = CATEGORY_COLORS[item.category] || {
                bg: 'bg-white/10',
                text: 'text-zinc-300',
                border: 'border-white/20',
              };

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-3 transition-colors ${
                    isSelected
                      ? 'bg-[#d3b475]/15 border-l-2 border-[#d3b475] pl-3'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      {item.category.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[#f5f1eb] group-hover:text-white">
                          {item.title}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p className="truncate text-xs text-[#bbc1cf] mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3 shrink-0 flex items-center gap-1.5">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-[#d3b475]">
                        Open <span className="ml-1 text-xs">↵</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="hidden sm:flex shrink-0 items-center justify-between border-t border-white/10 bg-black/40 px-4 py-2.5 text-[11px] text-[#bbc1cf]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">↑</kbd>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">↓</kbd>
              <span className="text-zinc-600 dark:text-zinc-400">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">↵</kbd>
              <span className="text-zinc-600 dark:text-zinc-400">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">ESC</kbd>
              <span className="text-zinc-600 dark:text-zinc-400">Close</span>
            </span>
          </div>
          <div className="font-mono text-zinc-600 dark:text-zinc-400 text-[10px]">
            {indexData.length > 0 ? `${indexData.length} records searchable` : 'Instant search ready'}
          </div>
        </div>
      </div>
    </div>
  );
}
