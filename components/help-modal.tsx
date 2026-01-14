/**
 * 帮助模态框组件
 *
 * 提供用户使用指南，包含三个标签页：
 * 1. 开始使用：介绍如何上传和对比图片
 * 2. 交互手势：介绍各种操作方式（拖拽、缩放、平移等）
 * 3. 常见问题：解答用户常见疑问
 *
 * 功能特性：
 * - 支持键盘 ESC 键关闭
 * - 打开时禁止背景滚动
 * - 响应式设计
 * - 流畅的进入/退出动画
 */

'use client';

import { useState, useEffect } from 'react';
import { X, HelpCircle, Upload, MousePointer, Hand, RotateCcw, CheckCircle, AlertCircle, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * 帮助模态框属性接口
 */
interface HelpModalProps {
  isOpen: boolean;      // 是否打开模态框
  onClose: () => void;  // 关闭回调函数
}

/**
 * 标签页 ID 类型
 */
type TabId = 'getting-started' | 'gestures' | 'faq';

/**
 * 帮助模态框主组件
 */
export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { t } = useI18n();
  // 当前激活的标签页
  const [activeTab, setActiveTab] = useState<TabId>('getting-started');

  // 控制背景滚动：打开时禁止滚动，关闭时恢复
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 监听 ESC 键关闭模态框
  useEffect(() => {
    if (!isOpen) {return;}

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // 如果模态框未打开，不渲染任何内容
  if (!isOpen) {return null;}

  // 标签页配置
  const tabs = [
    { id: 'getting-started', label: t.gettingStarted, icon: Upload },
    { id: 'gestures', label: t.gestures, icon: MousePointer },
    { id: 'faq', label: t.faq, icon: AlertCircle }
  ];

  /**
   * 标签页内容渲染组件
   * 根据当前激活的标签页显示不同的内容
   */
  const TabContent = () => {
    switch (activeTab) {
      case 'getting-started':
        // 开始使用标签页内容
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t.uploadImages}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.uploadImagesDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t.compareImages}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.compareImagesDesc}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'gestures':
        // 交互手势标签页内容
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="shrink-0 w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                  <MousePointer className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.dragToPan}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.dragToPanDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="shrink-0 w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                  <Hand className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.pinchToZoom}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.pinchToZoomDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="shrink-0 w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.scrollToZoom}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.scrollToZoomDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="shrink-0 w-6 h-6 rounded bg-pink-500/20 flex items-center justify-center">
                  <MousePointer className="w-3.5 h-3.5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.trackpadPan}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.trackpadPanDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-amber-500/10">
                <div className="shrink-0 w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
                  <Unlock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.unlockView}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.alignImagesDesc}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        // 常见问题标签页内容
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">{t.faq1Question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.faq1Answer}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">{t.faq2Question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.faq2Answer}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">{t.faq3Question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.faq3Answer}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">{t.faq4Question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.faq4Answer}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩：点击可关闭模态框 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* 模态框主体 */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl
        bg-background border border-border shadow-2xl animate-in slide-in-from-bottom-4 fade-in"
      >
        {/* 头部：标题和关闭按钮 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">{t.helpTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.helpDescription}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-accent"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-border/50 bg-secondary/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all',
                  'hover:bg-secondary/50',
                  isActive
                    ? 'text-blue-500 border-b-2 border-blue-500 bg-secondary/40'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-blue-500' : 'text-muted-foreground')} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 标签页内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <TabContent />
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/50 bg-secondary/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            {t.close}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={onClose}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {t.gotIt}
          </Button>
        </div>
      </div>
    </div>
  );
}
