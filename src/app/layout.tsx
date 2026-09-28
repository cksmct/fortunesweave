import type { Metadata } from 'next';
import { getGameConfig } from '@/lib/data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

/**
 * 根布局（App Router 要求位于 src/app/layout.tsx）。
 * ⚠️ 本文件在模板里位于 resources/lib/，复制时必须落到 `src/app/layout.tsx`
 *    （globals.css 同理 → `src/app/globals.css`）。
 *
 * `<main>` 包裹 children 是刻意设计：薄内容审计（audit-thin-content.mjs）
 * 以 `<main>` 内词数为唯一口径，天然排除 header/nav/footer 的全站样板文字。
 */
const config = getGameConfig();

export const metadata: Metadata = {
  title: {
    default: config.seo.siteTitle,
    template: `%s | ${config.seo.titleSuffix}`,
  },
  description: config.seo.siteDescription,
  metadataBase: new URL(config.seo.baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: config.seo.siteTitle,
    description: config.seo.siteDescription,
    url: config.seo.baseUrl,
    siteName: config.seo.siteName,
    images: [{ url: config.seo.defaultOgImage, width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: config.seo.siteTitle,
    description: config.seo.siteDescription,
    images: [config.seo.defaultOgImage],
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <Header />
        <main className="min-h-[calc(100vh-180px)]">{children}</main>
        <Footer />
        {/* GA4 按需接入：不要在这里写 new Date() 或即时加载的第三方脚本，
            避免 long task 推高 TBT。可参考 google-analytics 相关技能做延迟挂载。 */}
      </body>
    </html>
  );
}
