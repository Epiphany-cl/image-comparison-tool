'use client';

import { useState, useEffect } from 'react';
import { X, HelpCircle, Upload, MousePointer, Hand, RotateCcw, CheckCircle, AlertCircle, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'getting-started' | 'gestures' | 'faq';

/**
 * 使用说明模态框组件
 * 提供产品功能概述、操作步骤指引、常见问题解答和交互式引导
 */
export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>('getting-started');

  // 阻止背景滚动
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

  // ESC键关闭
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

  if (!isOpen) {return null;}

  const tabs = [
    { id: 'getting-started', label: t.gettingStarted, icon: Upload },
    { id: 'gestures', label: t.gestures, icon: MousePointer },
    { id: 'faq', label: t.faq, icon: AlertCircle }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t.uploadImages}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.uploadImagesDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
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
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-shrink-0 w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                  <MousePointer className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.dragToPan}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.dragToPanDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-shrink-0 w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                  <Hand className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.pinchToZoom}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.pinchToZoomDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-shrink-0 w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.scrollToZoom}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.scrollToZoomDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-shrink-0 w-6 h-6 rounded bg-pink-500/20 flex items-center justify-center">
                  <MousePointer className="w-3.5 h-3.5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{t.trackpadPan}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.trackpadPanDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-amber-500/10">
                <div className="flex-shrink-0 w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
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
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl
        bg-background border border-border shadow-2xl animate-in slide-in-from-bottom-4 fade-in"
      >
        {/* 头部 */}
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

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <TabContent />
        </div>

        {/* 底部操作栏 */}
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
