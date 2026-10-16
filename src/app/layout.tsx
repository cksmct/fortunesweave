import type { Metadata } from 'next';
import { getGameConfig } from '@/lib/data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdWrapper from '@/components/AdWrapper';
import Analytics from '@/components/Analytics';
import ConsentBanner from '@/components/ConsentBanner';
import { buildConsentDefaultScript } from '@/lib/consent';
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
  verification: {
    yandex: config.seo.yandexVerification || 'ecb353ffcdbc64e0',
    other: {
      'google-adsense-account': 'ca-pub-5616611657030412',
    },
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
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-black font-sans text-[#f5f1eb] antialiased">
        {/*
          Consent Mode v2 默认值 —— 必须是 body 的第一个节点：
          它在任何 Google 标签 / 广告脚本之前同步执行，保证默认同意状态先于数据收集生效。
          区域分级：全球 granted，仅 EEA/UK/CH（按 IANA 时区判定）在未选择时覆盖为 denied。
          ⚠️ 机器判据：脚本内保留 CONSENT_TZ / requiresConsent 字面量，勿改名。
        */}
        <script
          id="consent-default"
          dangerouslySetInnerHTML={{ __html: buildConsentDefaultScript() }}
        />
        <Header />
        <main className="min-h-[calc(100vh-180px)]">
          <AdWrapper>{children}</AdWrapper>
        </main>
        <Footer />
        {/* GA4：同意门控 + 交互优先/20s 兜底延迟加载（见 components/Analytics.tsx 的性能与合规说明） */}
        <Analytics gaId={config.seo.googleAnalyticsId} />
        {/* 同意面板：仅 EEA/UK/CH 且未选择时自动出现；其他地区静默授予、零遮挡 */}
        <ConsentBanner />
      </body>
    </html>
  );
}
