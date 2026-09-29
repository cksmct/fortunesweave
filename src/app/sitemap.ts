import type { MetadataRoute } from "next";
import { getGameConfig } from "@/lib/data";
import { pageDateIso } from "@/data/pageDates";

export const dynamic = "force-static";

/**
 * sitemap 单一事实源 = game.config.json#routes。
 * 严禁在此硬编码路由：路由注册表一旦与页面脱节，sitemap 会输出不存在的 URL，
 * 而 audit-site.mjs 会以「sitemap 含未知 URL」直接拦下构建。
 * URL 必须显式规范化（补尾斜杠），否则会与 canonical 产生一字符之差。
 * lastModified 的单一事实源 = pageDates.ts 的页级日期。
 * 严禁改用 game.lastUpdated 一类全局值：那会让每次内容轮次把全部 URL 的 lastmod 一起刷新，
 * 就是 content churn 事故（搜索引擎判定全站频繁大改）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const config = getGameConfig();
  const base = config.seo.baseUrl;
  return config.routes.map((route) => {
    const url = route.path === "/" ? base + "/" : base + route.path + "/";
    return {
      url,
      lastModified: pageDateIso(route.path),
      changeFrequency: (route.changeFrequency || "weekly") as NonNullable<
        MetadataRoute.Sitemap[number]["changeFrequency"]
      >,
      priority: route.priority ? Number(route.priority) : 0.5,
    };
  });
}
