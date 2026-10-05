'use client';

import { openConsentPanel } from '@/lib/consent';

/**
 * CookieSettingsButton —— 页脚常开的同意撤回入口。
 *
 * 铁律：撤回权只需要「入口常在」，不需要人人被弹窗拦住。
 * 文案固定为 "Cookie Settings"（合规审计机器判据，勿改）。
 */
export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openConsentPanel}
      className="py-1.5 px-1 text-xs text-[#bbc1cf] transition-colors hover:text-[#d3b475]"
    >
      Cookie Settings
    </button>
  );
}
