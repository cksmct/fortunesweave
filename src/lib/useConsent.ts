'use client';

import { useEffect, useState } from 'react';
import { isConsentGranted, onConsentChange } from './consent';

/**
 * useConsentGranted — 订阅「是否允许加载广告/分析」的客户端结论。
 *
 * 返回 null 表示尚未挂载（SSR 首帧），调用方应按「先按可渲染骨架、挂载后再收敛」处理，
 * 避免服务端与客户端首帧不一致导致 hydration mismatch。
 */
export function useConsentGranted(): boolean | null {
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    setGranted(isConsentGranted());
    return onConsentChange(() => setGranted(isConsentGranted()));
  }, []);

  return granted;
}

export default useConsentGranted;
