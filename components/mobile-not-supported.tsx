/**
 * 移动端不支持提示组件
 *
 * 功能：
 * - 在移动设备上显示不支持提示
 * - 建议用户使用桌面设备访问
 * - 使用响应式设计，仅在移动端显示（md:hidden）
 */

'use client';

import { Monitor } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import LiquidGlass from '@/components/ui/liquid-glass';

/**
 * 移动端不支持提示组件
 *
 * 仅在移动设备上显示（屏幕宽度 < 768px）
 * 在桌面设备上通过 CSS 类名 md:hidden 隐藏
 */
export function MobileNotSupported() {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:hidden bg-background/60 backdrop-blur-md">
      {/* 玻璃效果卡片 */}
      <LiquidGlass
        radius={24}
        frost={0.15}
        containerClassName="relative z-10 max-w-sm"
        className="flex flex-col items-center gap-6 text-center p-8"
      >
        {/* 图标容器 */}
        <LiquidGlass
          radius={16}
          frost={0.1}
          className="flex items-center justify-center w-16 h-16"
        >
          <Monitor className="h-8 w-8 text-neutral-600 dark:text-white/70" />
        </LiquidGlass>
        {/* 提示文本 */}
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
