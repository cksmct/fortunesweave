import type { NextConfig } from 'next';

/**
 * 静态导出站点基线配置。
 *
 * ⚠️ 扩展名与 Next 主版本绑定：
 *  - Next >= 15（本模板 package.json 为 next@^16）→ 用 next.config.ts
 *  - Next 14.x → 改名为 next.config.mjs（14.2 不支持 .ts）
 *
 * ⚠️ 不要在这里写 async headers() —— output:"export" 下它是【空操作】：
 * 静态导出只产出纯文件，从不生成宿主机配置（out/_headers 不会被创建），
 * 且不报错、静默失效。缓存/安全头一律用 public/_headers（Cloudflare Pages）
 * 或 vercel.json 的 headers 字段（Vercel）。
 */
import path from 'path';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: {
    resolveAlias: {
      'next/dist/build/polyfills/polyfill-module': './src/lib/empty-polyfill.js',
      '../build/polyfills/polyfill-module': './src/lib/empty-polyfill.js',
      'next/dist/build/polyfills/polyfill-nomodule': './src/lib/empty-polyfill.js',
      '../build/polyfills/polyfill-nomodule': './src/lib/empty-polyfill.js',
    },
  },
  webpack: (config) => {
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['next/dist/build/polyfills/polyfill-module'] = path.resolve(
      __dirname,
      'src/lib/empty-polyfill.js'
    );
    config.resolve.alias['next/dist/build/polyfills/polyfill-nomodule'] = path.resolve(
      __dirname,
      'src/lib/empty-polyfill.js'
    );
    return config;
  },
};

export default nextConfig;

