'use client';

import type React from 'react';

import { useState, useRef, useCallback, useEffect } from 'react';
// icon图标
import { ZoomIn, ZoomOut, RotateCcw, ImageIcon, X, Loader2 } from 'lucide-react';
// 手势库
import { useGesture } from '@use-gesture/react';
// UI组件
import { Button } from '@/components/ui/button';
// 样式工具
import { cn } from '@/lib/utils';

// 视图状态接口，定义了缩放和平移的参数
interface ViewState {
  scale: number; // 缩放比例
  offsetX: number; // X轴偏移量
  offsetY: number; // Y轴偏移量
}

// 图片信息接口
interface ImageInfo {
  src: string; // 图片的URL
  width: number; // 图片原始宽度
  height: number; // 图片原始高度
  baseScale: number; // 图片加载后的初始缩放比例，用于适配容器
}

// 单个图片面板的属性接口
interface ImagePanelProps {
  image: ImageInfo | null; // 图片信息
  onUpload: (file: File) => void; // 上传回调
  onDelete: () => void; // 删除回调
  viewState: ViewState; // 视图状态
  onViewChange: (state: ViewState) => void; // 视图状态变更回调
  label: string; // 面板标签 (A/B)
  isLoading: boolean; // 是否正在加载
}

/**
 * 单个图片显示面板
 * 负责处理单张图片的拖拽上传、手势交互（平移、缩放）和显示
 * @param image
 * @param onUpload
 * @param onDelete
 * @param viewState
 * @param onViewChange
 * @param label
 * @param isLoading
 * @constructor
 */
function ImagePanel({ image, onUpload, onDelete, viewState, onViewChange, label, isLoading }: ImagePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理文件拖拽上传
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

  // 处理通过文件输入框选择的图片
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  // 使用 @use-gesture/react 库来处理拖拽、捏合缩放和滚轮事件
  useGesture(
    {
      // 拖拽事件：用于平移图片
      onDrag: ({ first, movement: [mx, my], memo = { x: 0, y: 0 } }) => {
        if (!image) {return;}
        // 在拖拽开始时记录初始偏移量
        if (first) {
          memo = { x: viewState.offsetX, y: viewState.offsetY };
        }
        // 更新视图状态，实现平移
        onViewChange({
          ...viewState,
          offsetX: memo.x + mx,
          offsetY: memo.y + my
        });
        return memo;
      },
      // 捏合事件：用于双指缩放
      onPinch: ({ first, origin: [ox, oy], movement: [ms], memo, event }) => {
        if (!image) {return;}
        event.preventDefault(); // 阻止浏览器默认的捏合行为

        // 在捏合开始时，计算鼠标相对于容器的位置和初始缩放信息
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

        // 根据捏合手势的移动距离计算新的缩放比例，并限制在0.1到10倍之间
        const { initialScale, initialOffset, mouseX, mouseY } = memo;
        const newScale = Math.min(Math.max(initialScale * ms, 0.1), 10);
        const scaleDiff = newScale / initialScale;

        // 以鼠标位置为中心进行缩放，调整偏移量
        const newOffsetX = mouseX - (mouseX - initialOffset.x) * scaleDiff;
        const newOffsetY = mouseY - (mouseY - initialOffset.y) * scaleDiff;

        onViewChange({
          scale: newScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY
        });

        return memo;
      },
      // 滚轮事件：用于鼠标滚轮缩放或触控板平移
      onWheel: ({ event, delta: [dx, dy] }) => {
        if (!image) {return;}
        // 按住Ctrl键时，不处理滚轮事件（通常用于浏览器缩放）
        if (event.ctrlKey) {return;}

        // 如果是水平滚动，则阻止默认行为（如页面左右滚动）
        if (Math.abs(dx) > Math.abs(dy)) {
          event.preventDefault();
        }

        // 判断是触控板滚动还是鼠标滚轮
        // 触控板的deltaY值通常较小
        const isTrackpad = Math.abs(dy) < 40;

        if (isTrackpad) {
          // 触控板滚动用于平移
          event.preventDefault();
          onViewChange({
            ...viewState,
            offsetX: viewState.offsetX - dx,
            offsetY: viewState.offsetY - dy
          });
        } else {
          // 鼠标滚轮用于缩放
          event.preventDefault();
          const delta = dy > 0 ? 0.9 : 1.1; // 根据滚动方向确定缩放因子
          const newScale = Math.min(Math.max(viewState.scale * delta, 0.1), 10);

          // 以鼠标指针位置为中心进行缩放
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
      target: containerRef, // 将手势绑定到容器元素
      eventOptions: { passive: false }, // passive: false 是为了能调用 e.preventDefault()
      enabled: !!image // 仅在有图片时启用手势
    }
  );

  // 计算最终应用到图片上的总缩放比例
  const displayScale = image ? viewState.scale * image.baseScale : viewState.scale;

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-full relative overflow-hidden',
        image ? 'cursor-grab active:cursor-grabbing' : '', // 根据是否有图片设置鼠标样式
        isLoading && 'cursor-wait' // 加载中设置等待鼠标样式
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()} // 必须阻止默认行为才能触发onDrop
    >
      {isLoading ? (
        // 加载中状态
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none pointer-events-none">
          <Loader2 className="h-10 w-10 animate-spin text-neutral-600 dark:text-white/70" />
          <p className="text-sm text-neutral-600 dark:text-white/70">正在处理图片...</p>
        </div>
      ) : image ? (
        // 已加载图片状态
        <>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${viewState.offsetX}px, ${viewState.offsetY}px) scale(${displayScale})`,
              transformOrigin: 'center center',
              willChange: 'transform' // 优化动画性能
            }}
          >
            <img
              src={image.src || '/placeholder.svg'}
              alt={label}
              className="max-w-none select-none pointer-events-none" // 防止图片被选中或拖拽
              draggable={false}
            />
          </div>
          {/* 显示图片尺寸信息 */}
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
          {/* 删除图片按钮 */}
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
        // 空状态，等待上传
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
 * 核心组件：图片比较器
 * 管理左右两个图片面板的状态，以及共享的视图状态（缩放、平移）和控制栏
 * @constructor
 */
export function ImageCompare() {
  const [leftImage, setLeftImage] = useState<ImageInfo | null>(null);
  const [rightImage, setRightImage] = useState<ImageInfo | null>(null);

  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);

  // 共享的视图状态，会被传递给左右两个ImagePanel
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 ref 存储由 URL.createObjectURL 创建的 URL，以便在组件卸载时进行清理
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // 使用 ref 来存储最新的图片信息，解决 useCallback 闭包问题
  const leftImageRef = useRef<ImageInfo | null>(null);
  const rightImageRef = useRef<ImageInfo | null>(null);

  useEffect(() => {
    leftImageRef.current = leftImage;
  }, [leftImage]);

  useEffect(() => {
    rightImageRef.current = rightImage;
  }, [rightImage]);

  // 监听系统颜色方案变化，并切换亮/暗主题
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 计算图片的初始缩放比例，使其能完整地显示在容器内
  const calculateBaseScale = useCallback((imgWidth: number, imgHeight: number) => {
    const container = containerRef.current;
    if (!container) {return 1;}

    // 容器的可用宽高（减去一些内边距）
    const containerWidth = container.clientWidth / 2 - 32;
    const containerHeight = container.clientHeight - 32;

    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;

    // 取较小的缩放比例，并确保不超过1（即图片不进行放大）
    return Math.min(scaleX, scaleY, 1);
  }, []);

  // 处理图片上传的核心逻辑
  const handleUpload = useCallback(
    (file: File, side: 'left' | 'right') => {
      // 设置加载状态
      if (side === 'left') {
        setLeftLoading(true);
      } else {
        setRightLoading(true);
      }

      // 释放旧的 Object URL，防止内存泄漏
      const oldUrl = side === 'left' ? leftImageRef.current?.src : rightImageRef.current?.src;
      if (oldUrl && objectUrlsRef.current.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        objectUrlsRef.current.delete(oldUrl);
      }

      const objectUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        // 图片加载成功后，计算初始缩放比例并更新状态
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
      };

      img.onerror = () => {
        // 图片加载失败处理
        URL.revokeObjectURL(objectUrl);
        if (side === 'left') {
          setLeftLoading(false);
        } else {
          setRightLoading(false);
        }
        alert('图片加载失败，请检查文件格式');
      };

      img.src = objectUrl;
    },
    [calculateBaseScale]
  );

  // 重置视图状态
  const handleReset = useCallback(() => {
    setViewState({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  // 放大
  const handleZoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 10) // 限制最大10倍
    }));
  }, []);

  // 缩小
  const handleZoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.1) // 限制最小0.1倍
    }));
  }, []);

  const hasImages = leftImage || rightImage;
  const isLoading = leftLoading || rightLoading;

  // 统一清理所有 Object URL 的函数
  const cleanupAllUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    objectUrlsRef.current.clear();
  }, []);

  // 在组件卸载时调用清理函数
  useEffect(() => {
    return () => {
      cleanupAllUrls();
    };
  }, [cleanupAllUrls]);

  // 删除单侧图片
  const handleDeleteImage = useCallback(
    (side: 'left' | 'right') => {
      const imageRef = side === 'left' ? leftImageRef : rightImageRef;
      const oldUrl = imageRef.current?.src;
      // 释放 Object URL
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

  // 清空所有图片和状态
  const handleClearAll = useCallback(() => {
    cleanupAllUrls();
    setLeftImage(null);
    setRightImage(null);
    setLeftLoading(false);
    setRightLoading(false);
    handleReset();
  }, [cleanupAllUrls, handleReset]);

  return (
    // 'hidden md:flex' 在移动端隐藏此组件，仅在桌面端显示
    <div className="flex flex-col h-screen bg-background hidden md:flex">
      {/* 顶部中央控制栏 */}
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

      {/* 图片面板容器 */}
      <div ref={containerRef} className="flex-1 flex min-h-0 relative">
        <div className="flex-1 bg-secondary">
          {/* 左侧图片面板 */}
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
          {/* 右侧图片面板 */}
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
