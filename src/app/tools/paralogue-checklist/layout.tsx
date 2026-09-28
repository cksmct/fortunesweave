import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

/**
 * use client 页面不能导出 metadata（Next 会静默忽略并回退到根布局，造成 canonical/OG 污染），
 * 因此交互式工具页的元数据一律由同目录的 layout.tsx 导出。
 */
export const metadata: Metadata = generateSEOMetadata({
  title: "Paralogue Checklist",
  description:
    "A spoiler-free Fire Emblem: Fortune\u0027s Weave paralogue checklist that filters by route and flags the windows that close permanently.",
  path: "/tools/paralogue-checklist/",
});

export default function ParalogueChecklistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
