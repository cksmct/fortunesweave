import type { MetadataRoute } from "next";
import { getGameConfig } from "@/lib/data";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const config = getGameConfig();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cdn-cgi/"],
      },
    ],
    sitemap: config.seo.baseUrl + "/sitemap.xml",
    host: config.seo.baseUrl,
  };
}
