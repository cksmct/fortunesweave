import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

/** use client 页面的元数据必须由同目录 layout.tsx 导出。 */
export const metadata: Metadata = generateSEOMetadata({
  title: "Schematic Map",
  description:
    "A schematic index of every Fire Emblem: Fortune\u0027s Weave dungeon by region and Renown gate, with clickable pins you can tick off as you clear them.",
  path: "/map/",
});

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
