import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

/** use client 页面的元数据必须由同目录 layout.tsx 导出。 */
export const metadata: Metadata = generateSEOMetadata({
  title: "Recruitment Planner",
  description:
    "Pick your Flame Lord and see every recorded Fire Emblem: Fortune\u0027s Weave recruitment requirement, sorted by the Renown it costs.",
  path: "/tools/recruitment-planner/",
});

export default function RecruitmentPlannerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
