import { Metadata } from "next";
import { getGameConfig } from "./data";

const config = getGameConfig();
const baseUrl = config.seo.baseUrl;

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  ogImage?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 全站 SEO 元数据单一入口。
 *
 * 双轨制标题法则：
 *  - 子页面 title 严禁带品牌后缀，由 src/app/layout.tsx 的 template 统一追加；
 *    本函数只负责把误传进来的品牌前缀/后缀剥掉，防止 "Brand Page | Brand" 双重嵌套。
 *  - 首页（path === "/"）不经过 template，因此必须自带完整标题。
 *
 * 严禁在本文件引入 new Date()：任何由构建时刻驱动的展示日期都是虚假新鲜度信号。
 */
export function generateSEOMetadata(props: SEOProps): Metadata {
  const {
    title,
    description,
    keywords,
    path,
    ogImage = config.seo.defaultOgImage,
    type = "website",
    publishedTime,
    modifiedTime,
  } = props;

  const cleanDesc = description
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/→/g, "to")
    .replace(/[“”]/g, "\"")
    .replace(/[’]/g, "\u0027");

  const suffix = escapeRegExp(config.seo.titleSuffix);
  const shortName = escapeRegExp(config.game.name);
  const cleanTitle = title
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/→/g, "to")
    .replace(new RegExp("^" + suffix + "\\\\s*[:-]?\\\\s*", "i"), "")
    .replace(new RegExp("\\\\s*\\\\|\\\\s*" + suffix + "\\\\s*$", "gi"), "")
    .replace(new RegExp("\\\\s*\\\\|\\\\s*" + shortName + "\\\\s*$", "gi"), "")
    .trim();

  const isHome = path === "/" || path === "";
  const finalTitle = isHome ? title : cleanTitle;
  const siteBrand = config.seo.titleSuffix;

  const normalizedPath = path.startsWith("/") ? path : "/" + path;
  const canonicalUrl = normalizedPath.endsWith("/")
    ? baseUrl + normalizedPath
    : baseUrl + normalizedPath + "/";
  const imagePath = ogImage.startsWith("/") ? ogImage : "/" + ogImage;
  const imageUrl = ogImage.startsWith("http") ? ogImage : baseUrl + imagePath;

  return {
    title: finalTitle,
    description: cleanDesc,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: isHome ? finalTitle : finalTitle + " | " + siteBrand,
      description: cleanDesc,
      url: canonicalUrl,
      siteName: config.seo.siteName,
      locale: "en_US",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: finalTitle }],
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: isHome ? finalTitle : finalTitle + " | " + siteBrand,
      description: cleanDesc,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url?: string; item?: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const raw = item.item || item.url || "/";
      const cleanUrl = raw.startsWith("http")
        ? raw
        : baseUrl + (raw.startsWith("/") ? raw : "/" + raw);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: cleanUrl,
      };
    }),
  };
}

export const buildBreadcrumbSchema = generateBreadcrumbSchema;

export function generateFAQSchema(questions: { question: string; answer: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

/**
 * VideoGame 实体描述的是「游戏本身」，不是本站。
 * - author/publisher 在这里指游戏的开发与发行方，这是 VideoGame 类型的正确语义。
 * - 绝不能把这个 author 复用到页面级 JSON-LD：页面的 author 必须是本站（见 AuthorBanner）。
 * - 也绝不能把 developer 用作本站 Organization 的 name（粉丝站冒充官方）。
 */
export function generateVideoGameSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: config.game.fullName,
    description: config.seo.siteDescription,
    genre: config.game.genre,
    url: config.game.officialUrl,
    operatingSystem: config.game.platforms.join(", "),
    gamePlatform: config.game.platforms.join(", "),
    datePublished: config.game.releaseDate,
    author: { "@type": "Organization", name: config.game.developer },
    publisher: { "@type": "Organization", name: config.game.publisher },
    ...(config.author?.name
      ? {
          maintainer: {
            "@type": "Organization",
            name: config.author.org || config.seo.siteName,
            url: config.seo.baseUrl,
          },
        }
      : {}),
  };
}
