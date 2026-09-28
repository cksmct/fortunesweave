import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

/** use client 页面的元数据必须由同目录 layout.tsx 导出。 */
export const metadata: Metadata = generateSEOMetadata({
  title: "Gift Finder",
  description:
    "Search Fire Emblem: Fortune\u0027s Weave gifts by name or by character interest, and see which category each item belongs to.",
  path: "/tools/gift-finder/",
});

export default function GiftFinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
