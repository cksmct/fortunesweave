import type { MetadataRoute } from "next";
import { getGameConfig } from "@/lib/data";

export const dynamic = "force-static";

/**
 * sitemap 单一事实源 = game.config.json#routes。
 * 严禁在此硬编码路由：路由注册表一旦与页面脱节，sitemap 会输出不存在的 URL，
 * 而 audit-site.mjs 会以「sitemap 含未知 URL」直接拦下构建。
 * URL 必须显式规范化（补尾斜杠），否则会与 canonical 产生一字符之差。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const config = getGameConfig();
  const base = config.seo.baseUrl;
  return config.routes.map((route) => {
    const url = route.path === "/" ? base + "/" : base + route.path + "/";
    return {
      url,
      lastModified: config.game.lastUpdated,
      changeFrequency: (route.changeFrequency || "weekly") as NonNullable<
        MetadataRoute.Sitemap[number]["changeFrequency"]
      >,
      priority: route.priority ? Number(route.priority) : 0.5,
    };
  });
}
