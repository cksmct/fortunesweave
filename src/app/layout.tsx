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
  verification: {
    yandex: config.seo.yandexVerification || 'ecb353ffcdbc64e0',
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
        <Header />
        <main className="min-h-[calc(100vh-180px)]">{children}</main>
        <Footer />
        {/* GA4 接入：遵循 PageSpeed & Core Web Vitals 0-TBT 交互优先延迟加载法则，
            首屏交互（scroll/click/touchstart）或 20s 超时后挂载，杜绝移动端主线程阻塞与性能扣分 */}
        {config.seo.googleAnalyticsId && (
          <script
            id="google-analytics"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.seo.googleAnalyticsId}');

                (function() {
                  var loaded = false;
                  function loadGtag() {
                    if (loaded) return;
                    loaded = true;
                    var s = document.createElement('script');
                    s.async = true;
                    s.src = 'https://www.googletagmanager.com/gtag/js?id=${config.seo.googleAnalyticsId}';
                    document.head.appendChild(s);
                    ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(function(e) {
                      window.removeEventListener(e, loadGtag, { passive: true });
                    });
                  }
                  ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(function(e) {
                    window.addEventListener(e, loadGtag, { once: true, passive: true });
                  });
                  setTimeout(loadGtag, 20000);
                })();
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
