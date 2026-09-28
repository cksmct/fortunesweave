import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

/** use client 页面的元数据必须由同目录 layout.tsx 导出（见 /tools/paralogue-checklist/layout.tsx 注释）。 */
export const metadata: Metadata = generateSEOMetadata({
  title: "Drink Recipe Solver",
  description:
    "Pick a Fire Emblem: Fortune\u0027s Weave drink recipe or leaf and get the best Search point, the alternates, and what the quest pays out.",
  path: "/tools/recipe-solver/",
});

export default function RecipeSolverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
