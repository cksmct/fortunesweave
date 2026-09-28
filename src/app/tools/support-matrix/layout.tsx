import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

/** use client 页面的元数据必须由同目录 layout.tsx 导出。 */
export const metadata: Metadata = generateSEOMetadata({
  title: "Support Matrix",
  description:
    "Pick a character and see every recorded Fire Emblem: Fortune\u0027s Weave support partner, the rank each bond can reach, and any unlock lock in the way.",
  path: "/tools/support-matrix/",
});

export default function SupportMatrixLayout({ children }: { children: React.ReactNode }) {
  return children;
}
