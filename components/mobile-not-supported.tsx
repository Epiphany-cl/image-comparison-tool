'use client';

import { Monitor } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import LiquidGlass from '@/components/ui/liquid-glass';

/**
 * 在移动设备上显示的"暂不支持"组件
 * @constructor
 */
export function MobileNotSupported() {
  const { t } = useI18n();

  return (
    // 'md:hidden' 确保此组件仅在小于 md (medium) 的屏幕上可见
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:hidden">
      <LiquidGlass
        radius={24}
        frost={0.15}
        containerClassName="relative z-10 max-w-sm"
        className="flex flex-col items-center gap-6 text-center p-8"
      >
        <LiquidGlass
          radius={16}
          frost={0.1}
          className="flex items-center justify-center w-16 h-16"
        >
          <Monitor className="h-8 w-8 text-neutral-600 dark:text-white/70" />
        </LiquidGlass>
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-neutral-800 dark:text-white">{t.mobileNotSupported.title}</h2>
          <p className="text-sm text-neutral-600 dark:text-white/70 leading-relaxed">
            {t.mobileNotSupported.description}
          </p>
        </div>
      </LiquidGlass>
    </div>
  );
}
