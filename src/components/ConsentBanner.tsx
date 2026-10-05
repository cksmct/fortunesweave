'use client';

import { useEffect, useState } from 'react';
import {
  CONSENT_OPEN_EVENT,
  getConsentState,
  requiresConsent,
  setConsent,
} from '@/lib/consent';

/**
 * ConsentBanner —— Consent Mode v2 的访客选择面板。
 *
 * 铁律：
 * 1. 只有 EEA / UK / CH（requiresConsent）且尚未选择时才自动出现；
 *    其他地区静默授予、广告零遮挡 —— 撤回入口由页脚 Cookie Settings 常开提供。
 * 2. 首帧必须是「不渲染」：服务端无法知道访客时区，若首帧就渲染必然与客户端不一致。
 *    因此在 useEffect 内决定是否打开（避免 hydration mismatch）。
 * 3. 拒绝时必须调用 setConsent('denied')，由它负责推送 consent update 并删除已写入的标识 cookie。
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const decide = () => {
      if (requiresConsent() && getConsentState() === 'pending') setOpen(true);
    };
    decide();

    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (state: 'granted' | 'denied') => {
    setConsent(state);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie and advertising consent"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/12 bg-[#0c1016]/97 p-4 shadow-2xl backdrop-blur sm:p-5">
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-[#f5f1eb]">
            Cookies and personalised advertising
          </p>
          <p className="text-xs leading-relaxed text-[#bbc1cf]">
            This site uses Google Analytics to count visits and third-party advertising partners to
            keep it free. In your region we need your choice first. Accepting allows measurement and
            advertising cookies; declining keeps them off and deletes any already set. You can change
            this at any time from <span className="text-[#d3b475]">Cookie Settings</span> in the
            footer. Full details are in the{' '}
            <a href="/privacy/" className="underline hover:text-[#d3b475]">
              Privacy Policy
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => choose('granted')}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#d3b475] px-5 py-2 text-xs font-bold text-zinc-950 transition-opacity hover:opacity-90"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => choose('denied')}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-[#f5f1eb] transition-colors hover:border-[#d3b475]/50 hover:text-[#d3b475]"
          >
            Reject non-essential
          </button>
        </div>
      </div>
    </div>
  );
}
