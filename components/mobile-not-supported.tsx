'use client';

import { Monitor } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * 在移动设备上显示的"暂不支持"组件
 * @constructor
 */
export function MobileNotSupported() {
  const { t } = useI18n();

  return (
    // 'md:hidden' 确保此组件仅在小于 md (medium) 的屏幕上可见
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:hidden">
      <div
        className="relative z-10 flex flex-col items-center gap-6 max-w-sm text-center p-8 rounded-2xl
        bg-white/20 dark:bg-white/10 backdrop-blur-xl
        border border-white/30 dark:border-white/20
        shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)]
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
      >
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl
          bg-white/30 dark:bg-white/10 backdrop-blur-sm
          border border-white/40 dark:border-white/20"
        >
          <Monitor className="h-8 w-8 text-neutral-600 dark:text-white/70" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-neutral-800 dark:text-white">{t.mobileNotSupported.title}</h2>
          <p className="text-sm text-neutral-600 dark:text-white/70 leading-relaxed">
            {t.mobileNotSupported.description}
          </p>
        </div>
      </div>
    </div>
  );
}
