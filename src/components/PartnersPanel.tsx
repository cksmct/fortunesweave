'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface Partner {
  name: string;
  url: string;
  emoji: string;
  blurb: string;
}

/**
 * 合作伙伴矩阵（Strict Niche Partitioning & Tiered Flow Shield）
 * 遵循 seo-partners-network-guard 与 SEO-Optimized Partners Panel 规范：
 * 1. 严格品类对齐：均为 PC/主机/单机端大型深度游戏/RPG/战棋百科攻略（Zero Company + AION 2）；
 * 2. 严格单向流动：目标站均未回链 fortunesweave.online，零 Reciprocal Loop 死连风险；
 * 3. 严格限制导出：导出数量严格限制在 2 个（<= 3），杜绝 Link Farm 惩罚；
 * 4. 品牌化自然锚文本：使用真实品牌名与简明功能介绍，杜绝商业硬词堆砌。
 */
const PARTNERS: Partner[] = [
  {
    name: 'Zero Company Guide',
    url: 'https://starwarszerocompany.blog/',
    emoji: '🚀',
    blurb: 'Turn-based tactics, operators & builds',
  },
  {
    name: 'AION 2 Field Guide',
    url: 'https://aion2.blog/',
    emoji: '🪽',
    blurb: 'Classes, leveling & interactive map',
  },
];

export default function PartnersPanel() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  // 🚨 核心防线：严格仅在首页 ('/') 渲染，子页面一律返回 null，彻底杜绝 Sitewide Link Spam 算法惩罚
  if (pathname !== '/') return null;

  return (
    <div className="w-full pt-8 pb-6 border-b border-white/[0.08] text-center">
      {/* 折叠开关：满足 Lighthouse 44px 触控靶心与无障碍规范 */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="partners-panel-links"
        className="inline-flex min-h-[44px] items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#bbc1cf] transition-colors hover:text-[#d3b475]"
      >
        <span>Tactical &amp; RPG Partners</span>
        <span aria-hidden="true" className="text-xs transition-transform duration-200">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* 链接容器：恒在 raw DOM 中供爬虫索引，仅通过 CSS 视觉收展 */}
      <div
        id="partners-panel-links"
        className={`flex flex-wrap items-start justify-center gap-3 px-4 transition-all duration-300 ease-in-out ${
          expanded
            ? 'mt-2 mb-4 max-h-96 opacity-100'
            : 'mt-0 mb-0 max-h-0 overflow-hidden opacity-0'
        }`}
      >
        {PARTNERS.map((p) => (
          <a
            key={p.url}
            href={p.url}
            target="_blank"
            rel="noopener"
            className="group flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-center no-underline transition-all hover:border-[#d3b475]/50 hover:bg-[#d3b475]/10"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f5f1eb] transition-colors group-hover:text-[#d3b475]">
              <span aria-hidden="true">{p.emoji}</span>
              <span>{p.name}</span>
            </span>
            <span className="text-[10px] font-medium text-[#bbc1cf]/80 transition-colors group-hover:text-[#bbc1cf]">
              {p.blurb}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
