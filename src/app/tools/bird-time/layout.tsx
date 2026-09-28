import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

/** use client 页面的元数据必须由同目录 layout.tsx 导出。 */
export const metadata: Metadata = generateSEOMetadata({
  title: "Bird Time Lookup",
  description:
    "Paste the line the Pale Raven just said and get the correct reaction for Fire Emblem: Fortune\u0027s Weave Bird Time in one search.",
  path: "/tools/bird-time/",
});

export default function BirdTimeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
