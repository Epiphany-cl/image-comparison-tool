'use client';

import type React from 'react';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ImageIcon, X, Loader2 } from 'lucide-react';
import { useGesture } from '@use-gesture/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 视图状态接口，用于管理图片的缩放和平移
interface ViewState {
  scale: number      // 缩放比例
  offsetX: number    // X轴偏移量
  offsetY: number    // Y轴偏移量
}

// 图片信息接口，存储图片的基本信息
interface ImageInfo {
  src: string        // 图片数据URL
  width: number      // 图片原始宽度
  height: number     // 图片原始高度
  baseScale: number  // 基础缩放比例（使图片适应容器）
}

// 图片面板属性接口
interface ImagePanelProps {
  image: ImageInfo | null      // 图片信息对象
  onUpload: (file: File) => void  // 上传图片的回调函数
  onDelete: () => void         // 删除图片的回调函数
  viewState: ViewState         // 当前视图状态
  onViewChange: (state: ViewState) => void  // 视图状态改变的回调函数
  label: string                // 面板标签（A/B）
  isLoading: boolean           // 是否正在加载
}

/**
 * 图片面板块组件
 * 提供图片显示、拖拽上传、缩放和平移功能
 */
function ImagePanel({ image, onUpload, onDelete, viewState, onViewChange, label, isLoading }: ImagePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 处理拖拽放置事件
   * 当用户将文件拖拽到面板上时触发，验证文件类型并调用上传回调
   * @param e 拖拽事件对象
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
   * 处理文件输入变化事件
   * 当用户通过文件选择对话框选择文件时触发
   * @param e 文件输入变化事件对象
   */
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  useGesture(
    {
      // 拖拽处理：实现图片平移
      onDrag: ({ first, movement: [mx, my], memo = { x: 0, y: 0 } }) => {
        if (!image) {return;}
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
      // 捏合缩放处理：实现触摸屏缩放
      onPinch: ({ first, origin: [ox, oy], movement: [ms], memo, event }) => {
        if (!image) {return;}
        event.preventDefault();

        if (first) {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) {return { initialScale: viewState.scale, initialOffset: { x: 0, y: 0 }, mouseX: 0, mouseY: 0 };}

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

        const newOffsetX = mouseX - (mouseX - initialOffset.x) * scaleDiff;
        const newOffsetY = mouseY - (mouseY - initialOffset.y) * scaleDiff;

        onViewChange({
          scale: newScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY
        });

        return memo;
      },
      // 滚轮处理：实现鼠标滚轮缩放和触控板平移
      onWheel: ({ event, delta: [dx, dy] }) => {
        if (!image) {return;}
        if (event.ctrlKey) {return;} // Pinch handled by onPinch

        // Prevent browser back navigation on trackpad (horizontal swipe)
        if (Math.abs(dx) > Math.abs(dy)) {
          event.preventDefault();
        }

        // 经验法则：deltaY 较小（< 40）通常是触控板（平移），较大则是鼠标滚轮（缩放）
        const isTrackpad = Math.abs(dy) < 40;

        if (isTrackpad) {
          // Pan
          event.preventDefault();
          onViewChange({
            ...viewState,
            offsetX: viewState.offsetX - dx,
            offsetY: viewState.offsetY - dy
          });
        } else {
          // Zoom (Keep existing logic)
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

  // 计算实际显示的缩放比例（基础缩放 × 用户缩放）
  const displayScale = image ? viewState.scale * image.baseScale : viewState.scale;

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-full relative overflow-hidden',
        image ? 'cursor-grab active:cursor-grabbing' : '',
        isLoading && 'cursor-wait'
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none pointer-events-none">
          <Loader2 className="h-10 w-10 animate-spin text-neutral-600 dark:text-white/70" />
          <p className="text-sm text-neutral-600 dark:text-white/70">正在处理图片...</p>
        </div>
      ) : image ? (
        <>
          {/* 图片显示区域 */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${viewState.offsetX}px, ${viewState.offsetY}px) scale(${displayScale})`,
              transformOrigin: 'center center',
              willChange: 'transform' // 优化性能
            }}
          >
            <img
              src={image.src || '/placeholder.svg'}
              alt={label}
              className="max-w-none select-none pointer-events-none"
              draggable={false}
            />
          </div>
          {/* 图片尺寸信息显示 */}
          <div
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl text-xs font-mono
            bg-white/20 dark:bg-white/10 backdrop-blur-xl
            border border-white/30 dark:border-white/20
            text-neutral-800 dark:text-white
            shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)]
            dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            {image.width} × {image.height}
          </div>

          {/* 删除按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 h-7 w-7 rounded-lg
            bg-white/20 dark:bg-white/10 backdrop-blur-xl
            border border-white/30 dark:border-white/20
            text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white
            hover:bg-white/30 dark:hover:bg-white/20
            shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)]
            dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
            ${label === 'A' ? 'left-3' : 'right-3'}`}
            onClick={onDelete}
          >
            <X className="h-4 w-4" />
          </Button>

        </>
      ) : (
        /* 文件上传区域 */
        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-40" />
            <div className="text-center">
              <p className="text-sm">拖放或点击上传</p>
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
 * 提供双图片对比功能，支持同步缩放、平移和各种操作控件
 */
export function ImageCompare() {
  // 左右图片的状态管理
  const [leftImage, setLeftImage] = useState<ImageInfo | null>(null);  // 左侧图片信息
  const [rightImage, setRightImage] = useState<ImageInfo | null>(null);  // 右侧图片信息

  // 加载状态管理
  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);

  // 视图状态管理（缩放和平移）
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,      // 缩放比例
    offsetX: 0,    // X轴偏移
    offsetY: 0    // Y轴偏移
  });

  // 容器DOM引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 存储 ObjectURL，用于组件卸载时清理
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // 使用 ref 跟踪最新的 image 状态，避免闭包问题
  const leftImageRef = useRef<ImageInfo | null>(null);
  const rightImageRef = useRef<ImageInfo | null>(null);

  // 同步 ref 和 state
  useEffect(() => {
    leftImageRef.current = leftImage;
  }, [leftImage]);

  useEffect(() => {
    rightImageRef.current = rightImage;
  }, [rightImage]);

  // 系统主题监听与同步
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * 计算图片的基础缩放比例
   * 确保图片能够完整显示在容器内，且不会被不必要地放大
   * @param imgWidth 图片原始宽度
   * @param imgHeight 图片原始高度
   * @returns 基础缩放比例
   */
  const calculateBaseScale = useCallback((imgWidth: number, imgHeight: number) => {
    const container = containerRef.current;
    if (!container) {return 1;}

    const containerWidth = container.clientWidth / 2 - 32; // 单侧容器宽度，减去边距
    const containerHeight = container.clientHeight - 32;

    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;

    // 取较小值确保图片完整显示，并限制最大为 1（不放大小图）
    return Math.min(scaleX, scaleY, 1);
  }, []);

  /**
   * 处理图片上传
   * 使用 URL.createObjectURL 替代 dataURL 以显著减少内存占用
   * @param file 上传的图片文件
   * @param side 图片所在侧（左/右）
   */
  const handleUpload = useCallback(
    (file: File, side: 'left' | 'right') => {
      // 设置加载状态
      if (side === 'left') {
        setLeftLoading(true);
      } else {
        setRightLoading(true);
      }

      // 在设置新图片前清理旧的 URL（如果存在）- 使用 ref 避免闭包问题
      const oldUrl = side === 'left' ? leftImageRef.current?.src : rightImageRef.current?.src;
      if (oldUrl && objectUrlsRef.current.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        objectUrlsRef.current.delete(oldUrl);
      }

      // 直接使用 ObjectURL，无需 FileReader
      // 这样只需要存储一次 URL，避免大文件的 base64 转换
      const objectUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        const baseScale = calculateBaseScale(img.naturalWidth, img.naturalHeight);

        // 记录 URL 以待清理
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
      };

      img.onerror = () => {
        // 图片加载失败，清理 ObjectURL
        URL.revokeObjectURL(objectUrl);
        if (side === 'left') {
          setLeftLoading(false);
        } else {
          setRightLoading(false);
        }
        alert('图片加载失败，请检查文件格式');
      };

      // 设置 src 触发加载（ObjectURL 可以直接在 Image 对象中使用）
      img.src = objectUrl;
    },
    [calculateBaseScale]
  );

  /**
   * 重置视图状态到默认值
   */
  const handleReset = useCallback(() => {
    setViewState({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  /**
   * 放大视图
   */
  const handleZoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 10)
    }));
  }, []);

  /**
   * 缩小视图
   */
  const handleZoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.1)
    }));
  }, []);

  // 判断是否有图片已上传
  const hasImages = leftImage || rightImage;
  // 判断是否正在加载
  const isLoading = leftLoading || rightLoading;

  /**
   * 清理所有 ObjectURL - 用于组件卸载或清空操作
   */
  const cleanupAllUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    objectUrlsRef.current.clear();
  }, []);

  // 组件卸载时清理所有 URL，防止内存泄漏
  useEffect(() => {
    return () => {
      cleanupAllUrls();
    };
  }, [cleanupAllUrls]);

  /**
   * 删除单张图片并清理对应的 ObjectURL
   */
  const handleDeleteImage = useCallback((side: 'left' | 'right') => {
    // 清理该侧的 URL - 使用 ref 最新状态
    const imageRef = side === 'left' ? leftImageRef : rightImageRef;
    const oldUrl = imageRef.current?.src;
    if (oldUrl && objectUrlsRef.current.has(oldUrl)) {
      URL.revokeObjectURL(oldUrl);
      objectUrlsRef.current.delete(oldUrl);
    }

    // 更新状态
    if (side === 'left') {
      setLeftImage(null);
    } else {
      setRightImage(null);
    }
  }, []);

  /**
   * 清空所有图片并重置视图
   * 同时清理所有 ObjectURL 防止内存泄漏
   */
  const handleClearAll = useCallback(() => {
    cleanupAllUrls();
    setLeftImage(null);
    setRightImage(null);
    setLeftLoading(false);
    setRightLoading(false);
    handleReset();
  }, [cleanupAllUrls, handleReset]);

  return (
    <div className="flex flex-col h-screen bg-background hidden md:flex">
      {/* 顶部控制栏：缩放控制和操作按钮 */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-1.5 rounded-2xl
        bg-white/20 dark:bg-white/10 backdrop-blur-xl
        border border-white/30 dark:border-white/20
        shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)]
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
      >
        <span className="text-sm font-medium text-neutral-800 dark:text-white px-2">
          {isLoading && <Loader2 className="h-3 w-3 inline animate-spin mr-1.5" />}
          图片对比
        </span>
        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        <span className="text-xs text-neutral-600 dark:text-white/70 px-2 font-mono">
          {Math.round(viewState.scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleZoomOut}
          disabled={!hasImages || isLoading}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleZoomIn}
          disabled={!hasImages || isLoading}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
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
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg text-xs text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleClearAll}
          disabled={!hasImages || isLoading}
        >
          清空
        </Button>
      </div>

      {/* 图片对比区域：左右两个图片面板 */}
      <div ref={containerRef} className="flex-1 flex min-h-0 relative">
        <div className="flex-1 bg-secondary">
          <ImagePanel
            image={leftImage}
            onUpload={(file) => handleUpload(file, 'left')}
            onDelete={() => handleDeleteImage('left')}
            viewState={viewState}
            onViewChange={setViewState}
            label="A"
            isLoading={leftLoading}
          />
        </div>
        <div className="w-px bg-white/20 dark:bg-white/10 backdrop-blur-sm" />
        <div className="flex-1 bg-secondary">
          <ImagePanel
            image={rightImage}
            onUpload={(file) => handleUpload(file, 'right')}
            onDelete={() => handleDeleteImage('right')}
            viewState={viewState}
            onViewChange={setViewState}
            label="B"
            isLoading={rightLoading}
          />
        </div>
      </div>
    </div>
  );
}
