import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

/** use client 页面的元数据必须由同目录 layout.tsx 导出。 */
export const metadata: Metadata = generateSEOMetadata({
  title: "Class Certification Planner",
  description:
    "Plan Fire Emblem: Fortune\u0027s Weave certification exams: Renown gates, route-specific classes, and which classes are worth mastering.",
  path: "/tools/class-planner/",
});

export default function ClassPlannerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
