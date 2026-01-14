/**
 * 图片对比主组件
 *
 * 核心功能：
 * 1. 左右并排显示两张图片进行对比
 * 2. 支持拖拽上传、点击上传、粘贴上传
 * 3. 同步/独立缩放和平移
 * 4. 多种交互方式：鼠标拖拽、滚轮缩放、触控板手势
 * 5. 深色模式支持
 * 6. 国际化支持
 */

'use client';

import type React from 'react';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ImageIcon, X, Loader2, Languages, CheckCircle, AlertCircle, HelpCircle, Lock, Unlock } from 'lucide-react';
import { useGesture } from '@use-gesture/react';
import { Button } from '@/components/ui/button';
import LiquidGlass from '@/components/ui/liquid-glass';
import { HelpModal } from '@/components/help-modal';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { Translations } from '@/lib/locales';

/**
 * 视图状态接口
 * 记录图片的缩放和平移状态
 */
interface ViewState {
  scale: number;    // 缩放比例
  offsetX: number;  // X 轴偏移量
  offsetY: number;  // Y 轴偏移量
}

/**
 * 图片信息接口
 */
interface ImageInfo {
  src: string;        // 图片 URL（Blob URL）
  width: number;      // 图片原始宽度
  height: number;     // 图片原始高度
  baseScale: number;  // 基础缩放比例（使图片适应容器）
}

/**
 * 图片面板属性接口
 */
interface ImagePanelProps {
  image: ImageInfo | null;                    // 图片信息
  onUpload: (file: File) => void;            // 上传回调
  onDelete: () => void;                      // 删除回调
  viewState: ViewState;                      // 视图状态
  onViewChange: (state: ViewState) => void;  // 视图变化回调
  label: string;                             // 面板标签（'A' 或 'B'）
  isLoading: boolean;                        // 是否正在加载
  t: Translations;                           // 翻译文本
}

/**
 * 图片面板组件
 *
 * 功能：
 * - 显示图片或上传提示
 * - 处理拖拽上传
 * - 处理手势交互（拖拽、缩放、滚轮）
 * - 显示图片尺寸信息
 * - 提供删除按钮
 */
function ImagePanel({ image, onUpload, onDelete, viewState, onViewChange, label, isLoading, t }: ImagePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 处理拖拽上传
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  /**
   * 处理文件选择上传
   */
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
      e.target.value = '';
    },
    [onUpload]
  );

  /**
   * 使用 @use-gesture/react 处理手势交互
   */
  useGesture(
    {
      // 拖拽处理：平移图片
      onDrag: ({ first, movement: [mx, my], memo = { x: 0, y: 0 } }) => {
        if (!image) { return; }
        if (first) {
          memo = { x: viewState.offsetX, y: viewState.offsetY };
        }
        onViewChange({
          ...viewState,
          offsetX: memo.x + mx,
          offsetY: memo.y + my
        });
        return memo;
      },
      // 捏合缩放处理：以捏合中心点为基准缩放
      onPinch: ({ first, origin: [ox, oy], movement: [ms], memo, event }) => {
        if (!image) { return; }
        event.preventDefault();

        if (first) {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) { return { initialScale: viewState.scale, initialOffset: { x: 0, y: 0 }, mouseX: 0, mouseY: 0 }; }

          const mouseX = ox - rect.left - rect.width / 2;
          const mouseY = oy - rect.top - rect.height / 2;

          return {
            initialScale: viewState.scale,
            initialOffset: { x: viewState.offsetX, y: viewState.offsetY },
            mouseX,
            mouseY
          };
        }

        const { initialScale, initialOffset, mouseX, mouseY } = memo;
        const newScale = Math.min(Math.max(initialScale * ms, 0.1), 10);
        const scaleDiff = newScale / initialScale;

        // 计算新的偏移量，使缩放以捏合中心为基准
        const newOffsetX = mouseX - (mouseX - initialOffset.x) * scaleDiff;
        const newOffsetY = mouseY - (mouseY - initialOffset.y) * scaleDiff;

        onViewChange({
          scale: newScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY
        });

        return memo;
      },
      // 滚轮处理：区分触控板平移和鼠标滚轮缩放
      onWheel: ({ event, delta: [dx, dy] }) => {
        if (!image) { return; }
        if (event.ctrlKey) { return; }

        // 水平滚动时阻止默认行为
        if (Math.abs(dx) > Math.abs(dy)) {
          event.preventDefault();
        }

        // 判断是触控板还是鼠标滚轮
        const isTrackpad = Math.abs(dy) < 40;

        if (isTrackpad) {
          // 触控板：平移图片
          event.preventDefault();
          onViewChange({
            ...viewState,
            offsetX: viewState.offsetX - dx,
            offsetY: viewState.offsetY - dy
          });
        } else {
          // 鼠标滚轮：以光标为中心缩放
          event.preventDefault();
          const delta = dy > 0 ? 0.9 : 1.1;
          const newScale = Math.min(Math.max(viewState.scale * delta, 0.1), 10);

          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const mouseX = event.clientX - rect.left - rect.width / 2;
            const mouseY = event.clientY - rect.top - rect.height / 2;

            const scaleDiff = newScale / viewState.scale;
            const newOffsetX = mouseX - (mouseX - viewState.offsetX) * scaleDiff;
            const newOffsetY = mouseY - (mouseY - viewState.offsetY) * scaleDiff;

            onViewChange({
              scale: newScale,
              offsetX: newOffsetX,
              offsetY: newOffsetY
            });
          }
        }
      }
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
      enabled: !!image
    }
  );

  // 计算实际显示的缩放比例（基础缩放 * 视图缩放）
  const displayScale = image ? viewState.scale * image.baseScale : viewState.scale;

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-full relative overflow-hidden',
        image ? 'cursor-grab active:cursor-grabbing' : '',
        isLoading && 'cursor-wait'
      )}
      style={{ touchAction: 'none' }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* 加载状态 */}
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none pointer-events-none">
          <Loader2 className="h-10 w-10 animate-spin text-neutral-600 dark:text-white/70" />
          <p className="text-sm text-neutral-600 dark:text-white/70">{t.processing}</p>
        </div>
      ) : image ? (
        <>
          {/* 图片显示区域 */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${viewState.offsetX}px, ${viewState.offsetY}px) scale(${displayScale})`,
              transformOrigin: 'center center',
              willChange: 'transform'
            }}
          >
            <img
              src={image.src}
              alt={label}
              className="max-w-none select-none pointer-events-none"
              draggable={false}
            />
          </div>
          {/* 图片尺寸信息 */}
          <LiquidGlass
            radius={12}
            frost={0.1}
            containerClassName="absolute bottom-3 left-3"
            className="px-3 py-1.5 text-xs font-mono text-neutral-800 dark:text-white"
          >
            {image.width} × {image.height}
          </LiquidGlass>
          {/* 删除按钮 */}
          <LiquidGlass
            radius={8}
            frost={0.1}
            containerClassName={cn(
              'absolute top-3 h-7 w-7',
              label === 'A' ? 'left-3' : 'right-3'
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-full w-full rounded-none bg-transparent border-none shadow-none text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
              onClick={onDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          </LiquidGlass>
        </>
      ) : (
        /* 上传提示 */
        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-40" />
            <div className="text-center">
              <p className="text-sm">{t.dropOrClick}</p>
            </div>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        </label>
      )}
    </div>
  );
}

/**
 * 图片对比主组件
 *
 * 功能：
 * - 管理左右两张图片的状态
 * - 控制同步/独立模式
 * - 处理上传、删除、清空等操作
 * - 提供缩放、重置等控制功能
 * - 支持粘贴上传
 * - 显示帮助模态框
 */
export function ImageCompare() {
  const { t, locale, setLocale } = useI18n();
  // 左右图片状态
  const [leftImage, setLeftImage] = useState<ImageInfo | null>(null);
  const [rightImage, setRightImage] = useState<ImageInfo | null>(null);

  // 加载状态
  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);

  // Toast 消息状态
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 帮助模态框显示状态
  const [showHelp, setShowHelp] = useState(false);

  // 同步模式状态
  const [isSynced, setIsSynced] = useState(true);

  // 左右视图状态
  const [leftViewState, setLeftViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });

  const [rightViewState, setRightViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });

  /**
   * 处理视图变化
   * 在同步模式下，一侧的变化会同步到另一侧
   */
  const handleViewChange = useCallback((side: 'left' | 'right', newState: ViewState) => {
    if (side === 'left') {
      const oldState = leftViewState;
      setLeftViewState(newState);

      if (isSynced) {
        // 计算缩放比例和偏移量变化，同步到右侧
        const scaleRatio = newState.scale / oldState.scale;
        const dx = newState.offsetX - oldState.offsetX;
        const dy = newState.offsetY - oldState.offsetY;

        setRightViewState(prev => ({
          scale: prev.scale * scaleRatio,
          offsetX: prev.offsetX + dx,
          offsetY: prev.offsetY + dy
        }));
      }
    } else {
      const oldState = rightViewState;
      setRightViewState(newState);

      if (isSynced) {
        // 计算缩放比例和偏移量变化，同步到左侧
        const scaleRatio = newState.scale / oldState.scale;
        const dx = newState.offsetX - oldState.offsetX;
        const dy = newState.offsetY - oldState.offsetY;

        setLeftViewState(prev => ({
          scale: prev.scale * scaleRatio,
          offsetX: prev.offsetX + dx,
          offsetY: prev.offsetY + dy
        }));
      }
    }
  }, [isSynced, leftViewState, rightViewState]);

  const containerRef = useRef<HTMLDivElement>(null);

  // 管理 Blob URL，防止内存泄漏
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // 使用 ref 存储图片信息，避免闭包问题
  const leftImageRef = useRef<ImageInfo | null>(null);
  const rightImageRef = useRef<ImageInfo | null>(null);

  useEffect(() => {
    leftImageRef.current = leftImage;
  }, [leftImage]);

  useEffect(() => {
    rightImageRef.current = rightImage;
  }, [rightImage]);

  // 监听系统深色模式变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * 计算基础缩放比例
   * 使图片适应容器大小
   */
  const calculateBaseScale = useCallback((imgWidth: number, imgHeight: number) => {
    const container = containerRef.current;
    if (!container) { return 1; }

    const containerWidth = container.clientWidth / 2 - 32;
    const containerHeight = container.clientHeight - 32;

    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;

    return Math.min(scaleX, scaleY, 1);
  }, []);

  /**
   * 处理图片上传
   */
  const handleUpload = useCallback(
    (file: File, side: 'left' | 'right') => {
      if (side === 'left') {
        setLeftLoading(true);
      } else {
        setRightLoading(true);
      }

      // 清理旧的 Blob URL
      const oldUrl = side === 'left' ? leftImageRef.current?.src : rightImageRef.current?.src;
      if (oldUrl && objectUrlsRef.current.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        objectUrlsRef.current.delete(oldUrl);
      }

      const objectUrl = URL.createObjectURL(file);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const baseScale = calculateBaseScale(img.naturalWidth, img.naturalHeight);

          objectUrlsRef.current.add(objectUrl);

          const imageInfo: ImageInfo = {
            src: objectUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            baseScale
          };

          if (side === 'left') {
            setLeftImage(imageInfo);
            setLeftLoading(false);
          } else {
            setRightImage(imageInfo);
            setRightLoading(false);
          }
          resolve(imageInfo);
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          if (side === 'left') {
            setLeftLoading(false);
          } else {
            setRightLoading(false);
          }
          setToast({ message: t.loadError, type: 'error' });
          setTimeout(() => setToast(null), 3000);
          reject(new Error('Image load failed'));
        };

        img.src = objectUrl;
      });
    },
    [calculateBaseScale, t]
  );

  /**
   * 重置视图状态
   */
  const handleReset = useCallback(() => {
    const initialState = { scale: 1, offsetX: 0, offsetY: 0 };
    setLeftViewState(initialState);
    setRightViewState(initialState);
    setIsSynced(true);
  }, []);

  /**
   * 放大图片
   */
  const handleZoomIn = useCallback(() => {
    const newStateFn = (prev: ViewState) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 10)
    });

    setLeftViewState(newStateFn);
    setRightViewState(newStateFn);
  }, []);

  /**
   * 缩小图片
   */
  const handleZoomOut = useCallback(() => {
    const newStateFn = (prev: ViewState) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.1)
    });

    setLeftViewState(newStateFn);
    setRightViewState(newStateFn);
  }, []);

  const hasImages = leftImage || rightImage;
  const isLoading = leftLoading || rightLoading;

  /**
   * 清理所有 Blob URL
   */
  const cleanupAllUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    objectUrlsRef.current.clear();
  }, []);

  // 组件卸载时清理 Blob URL
  useEffect(() => {
    return () => {
      cleanupAllUrls();
    };
  }, [cleanupAllUrls]);

  /**
   * 删除单张图片
   */
  const handleDeleteImage = useCallback(
    (side: 'left' | 'right') => {
      const imageRef = side === 'left' ? leftImageRef : rightImageRef;
      const oldUrl = imageRef.current?.src;
      if (oldUrl && objectUrlsRef.current.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        objectUrlsRef.current.delete(oldUrl);
      }

      if (side === 'left') {
        setLeftImage(null);
      } else {
        setRightImage(null);
      }
    },
    []
  );

  /**
   * 清空所有图片
   */
  const handleClearAll = useCallback(() => {
    cleanupAllUrls();
    setLeftImage(null);
    setRightImage(null);
    setLeftLoading(false);
    setRightLoading(false);
    handleReset();
  }, [cleanupAllUrls, handleReset]);

  /**
   * 显示 Toast 消息
   */
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /**
   * 打开帮助模态框
   */
  const handleOpenHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  /**
   * 关闭帮助模态框
   */
  const handleCloseHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  /**
   * 处理粘贴上传
   */
  const handlePaste = useCallback(
    async(e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) {return;}

      // 检查剪贴板中是否有图片
      let hasImage = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          hasImage = true;
          break;
        }
      }

      if (!hasImage) {
        return;
      }

      e.preventDefault();

      const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'));
      if (!imageItem) {
        showToast(t.pasteErrorNoImage, 'error');
        return;
      }

      const file = imageItem.getAsFile();
      if (!file) {
        showToast(t.pasteError, 'error');
        return;
      }

      // 确定上传到哪一侧
      let targetSide: 'left' | 'right';
      if (!leftImage) {
        targetSide = 'left';
      } else if (!rightImage) {
        targetSide = 'right';
      } else {
        targetSide = 'left';
      }

      try {
        await handleUpload(file, targetSide);
        const sideName = targetSide === 'left' ? 'A' : 'B';
        showToast(t.pasteSuccess.replace('{side}', sideName), 'success');
      } catch {
        showToast(t.pasteError, 'error');
      }
    },
    [handleUpload, leftImage, rightImage, showToast, t]
  );

  // 监听粘贴事件（仅在桌面端）
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) {return;}

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div className="flex flex-col h-screen bg-background md:flex">
      {/* 顶部控制栏 */}
      <LiquidGlass
        radius={16}
        frost={0.1}
        containerClassName="absolute top-3 left-1/2 -translate-x-1/2 z-10"
        className="flex items-center gap-1 px-3 py-1.5"
      >
        {/* 标题 */}
        <div className="flex items-center min-w-[120px] justify-center px-2">
          <div className="relative flex items-center justify-center">
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin absolute -left-5" />
            )}
            <span className="text-sm font-medium text-neutral-800 dark:text-white">
              {t.imageCompare}
            </span>
          </div>
        </div>
        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        {/* 缩放比例显示 */}
        <span className="text-xs text-neutral-600 dark:text-white/70 px-2 font-mono">
          {Math.round(leftViewState.scale * 100)}%
        </span>
        {/* 缩小按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleZoomOut}
          disabled={!hasImages || isLoading}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        {/* 放大按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleZoomIn}
          disabled={!hasImages || isLoading}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        {/* 重置按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleReset}
          disabled={!hasImages || isLoading}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        {/* 同步/独立切换按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 rounded-lg transition-colors',
            isSynced
              ? 'text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20'
              : 'text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50'
          )}
          onClick={() => setIsSynced(!isSynced)}
          disabled={!hasImages || isLoading}
          title={isSynced ? t.unlockView : t.lockView}
        >
          {isSynced ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </Button>

        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        {/* 清空按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg text-xs text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleClearAll}
          disabled={!hasImages || isLoading}
        >
          {t.clear}
        </Button>
        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        {/* 语言切换按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg text-xs text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20 flex items-center gap-1"
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
        >
          <Languages className="h-3.5 w-3.5" />
          {t.switchTo}
        </Button>
        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        {/* 帮助按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg text-xs text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20 flex items-center gap-1"
          onClick={handleOpenHelp}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {t.help}
        </Button>
      </LiquidGlass>

      {/* 图片显示区域 */}
      <div ref={containerRef} className="flex-1 flex min-h-0 relative">
        {/* 左侧图片面板 */}
        <div className="flex-1 bg-secondary">
          <ImagePanel
            image={leftImage}
            onUpload={(file) => handleUpload(file, 'left')}
            onDelete={() => handleDeleteImage('left')}
            viewState={leftViewState}
            onViewChange={(newState) => handleViewChange('left', newState)}
            label="A"
            isLoading={leftLoading}
            t={t}
          />
        </div>
        {/* 中间分隔线 */}
        <div className="w-px bg-white/20 dark:bg-white/10 backdrop-blur-sm" />
        {/* 右侧图片面板 */}
        <div className="flex-1 bg-secondary">
          <ImagePanel
            image={rightImage}
            onUpload={(file) => handleUpload(file, 'right')}
            onDelete={() => handleDeleteImage('right')}
            viewState={rightViewState}
            onViewChange={(newState) => handleViewChange('right', newState)}
            label="B"
            isLoading={rightLoading}
            t={t}
          />
        </div>
      </div>

      {/* Toast 消息提示 */}
      {toast && (
        <LiquidGlass
          radius={16}
          frost={0.15}
          containerClassName="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2"
          className={cn(
            'px-4 py-3 min-w-[280px] flex items-center gap-2 justify-center',
            toast.type === 'success'
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </LiquidGlass>
      )}

      {/* 帮助模态框 */}
      <HelpModal
        isOpen={showHelp}
        onClose={handleCloseHelp}
      />
    </div>
  );
}
