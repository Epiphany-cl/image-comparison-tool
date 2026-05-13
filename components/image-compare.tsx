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

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ImageIcon, X, Loader2, Languages, CheckCircle, AlertCircle, HelpCircle, Lock, Unlock, Play, Pause, Volume2, VolumeX } from 'lucide-react';
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
 * 媒体信息接口
 */
interface MediaInfo {
  src: string;        // 媒体 URL（Blob URL）
  fileName: string;   // 原始文件名
  width: number;      // 原始宽度
  height: number;     // 原始高度
  baseScale: number;  // 基础缩放比例（使媒体适应容器）
  type: 'image' | 'video'; // 媒体类型
}

/**
 * 视频控制接口
 */
interface VideoControls {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
}

type KeyboardMediaMode = 'none' | 'image' | 'video' | 'mixed';

interface DragMemo {
  x: number;
  y: number;
  blocked: boolean;
}

const IMAGE_KEYBOARD_PAN_STEP = 32;
const VIDEO_FRAME_STEP = 0.5;
const FILE_NAME_HEAD_LEN = 14;
const FILE_NAME_TAIL_LEN = 10;
const FILE_NAME_FONT = '12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const FILE_NAME_BUDGET_PADDING = 96;

const textMeasureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

function measureTextWidth(text: string, font: string) {
  const context = textMeasureCanvas?.getContext('2d');
  if (!context) {
    return text.length * 8;
  }

  context.font = font;
  return context.measureText(text).width;
}

function fitFileNameToWidth(fileName: string, maxWidth: number, font: string) {
  if (!fileName) {
    return '';
  }

  if (maxWidth <= 0) {
    return fileName;
  }

  if (measureTextWidth(fileName, font) <= maxWidth) {
    return fileName;
  }

  const lastDotIndex = fileName.lastIndexOf('.');
  const hasExtension = lastDotIndex > 0 && lastDotIndex < fileName.length - 1;
  const baseName = hasExtension ? fileName.slice(0, lastDotIndex) : fileName;
  const extension = hasExtension ? fileName.slice(lastDotIndex) : '';
  const ellipsis = '…';

  if (measureTextWidth(ellipsis + extension, font) >= maxWidth) {
    let tailLength = Math.max(1, fileName.length - 1);

    while (tailLength > 1) {
      const candidate = `${ellipsis}${fileName.slice(-tailLength)}`;
      if (measureTextWidth(candidate, font) <= maxWidth) {
        return candidate;
      }
      tailLength -= 1;
    }

    return ellipsis;
  }

  let headLength = Math.min(FILE_NAME_HEAD_LEN, baseName.length);
  let tailLength = Math.min(FILE_NAME_TAIL_LEN, baseName.length - headLength);

  if (tailLength <= 0) {
    tailLength = Math.min(FILE_NAME_TAIL_LEN, Math.max(baseName.length - 1, 1));
    headLength = Math.max(baseName.length - tailLength, 1);
  }

  const minHeadLength = Math.min(3, Math.max(baseName.length - 1, 1));
  const minTailLength = Math.min(3, Math.max(baseName.length - 1, 1));

  while (headLength >= minHeadLength && tailLength >= minTailLength) {
    const candidate = `${baseName.slice(0, headLength)}${ellipsis}${baseName.slice(-tailLength)}${extension}`;
    if (measureTextWidth(candidate, font) <= maxWidth) {
      return candidate;
    }

    if (headLength > minHeadLength) {
      headLength -= 1;
    } else if (tailLength > minTailLength) {
      tailLength -= 1;
    } else {
      break;
    }
  }

  return `${ellipsis}${extension || fileName.slice(-Math.min(fileName.length, FILE_NAME_TAIL_LEN))}`;
}

function isTouchInput(event: Event) {
  if (typeof PointerEvent !== 'undefined' && event instanceof PointerEvent) {
    return event.pointerType === 'touch';
  }

  return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
}

function isGestureBlockedTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest('[data-gesture-blocker="true"]') !== null;
}

function isVideoProgressTarget(target: EventTarget | null) {
  return target instanceof HTMLInputElement && target.dataset.videoProgress === 'true';
}

/**
 * 媒体面板属性接口
 */
interface MediaPanelProps {
  media: MediaInfo | null;                    // 媒体信息
  onUpload: (file: File) => void;            // 上传回调
  onDelete: () => void;                      // 删除回调
  viewState: ViewState;                      // 视图状态
  onViewChange: (state: ViewState) => void;  // 视图变化回调
  label: string;                             // 面板标签（'A' 或 'B'）
  isLoading: boolean;                        // 是否正在加载
  t: Translations;                           // 翻译文本
  activeTouchCountRef: { current: number };  // 当前页面触摸点数量
  videoControls?: VideoControls;             // 视频控制状态
  onVideoControlChange?: (controls: Partial<VideoControls>) => void; // 视频控制变化回调
}

/**
 * 媒体面板组件
 *
 * 功能：
 * - 显示图片/视频或上传提示
 * - 处理拖拽上传
 * - 处理手势交互（拖拽、缩放、滚轮）
 * - 显示媒体尺寸信息
 * - 提供删除按钮
 * - 提供视频播放控制
 */
function MediaPanel({ media, onUpload, onDelete, viewState, onViewChange, label, isLoading, t, activeTouchCountRef, videoControls, onVideoControlChange }: MediaPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [panelWidth, setPanelWidth] = useState(0);

  /**
   * 处理拖拽上传
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
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
   * 同步视频状态到 DOM
   */
  useEffect(() => {
    if (media?.type === 'video' && videoRef.current && videoControls) {
      if (videoControls.isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else if (!videoControls.isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }

      if (Math.abs(videoRef.current.currentTime - videoControls.currentTime) > 0.1) {
        videoRef.current.currentTime = videoControls.currentTime;
      }

      videoRef.current.muted = videoControls.isMuted;
    }
  }, [media?.type, videoControls]);

  /**
   * 监听面板宽度变化，用于计算文件名可用宽度
   */
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateWidth = () => {
      setPanelWidth(element.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const fileName = useMemo(() => {
    if (!media) {
      return '';
    }

    return fitFileNameToWidth(media.fileName, Math.max(0, panelWidth - FILE_NAME_BUDGET_PADDING), FILE_NAME_FONT);
  }, [media, panelWidth]);

  /**
   * 使用 @use-gesture/react 处理手势交互
   */
  useGesture(
    {
      // 拖拽处理：平移媒体
      onDrag: ({ first, movement: [mx, my], memo, event }) => {
        if (!media) { return memo; }
        if (isGestureBlockedTarget(event.target)) {
          return first || !memo ? { x: viewState.offsetX, y: viewState.offsetY, blocked: true } : memo;
        }

        const isMultiTouchDrag = isTouchInput(event) && activeTouchCountRef.current > 1;
        const currentMemo: DragMemo = first || !memo
          ? { x: viewState.offsetX, y: viewState.offsetY, blocked: isMultiTouchDrag }
          : memo;

        if (isMultiTouchDrag) {
          currentMemo.blocked = true;
        }

        if (currentMemo.blocked) {
          return currentMemo;
        }

        if (first) {
          currentMemo.x = viewState.offsetX;
          currentMemo.y = viewState.offsetY;
        }

        onViewChange({
          ...viewState,
          offsetX: currentMemo.x + mx,
          offsetY: currentMemo.y + my
        });
        return currentMemo;
      },
      // 捏合缩放处理：以捏合中心点为基准缩放
      onPinch: ({ first, origin: [ox, oy], movement: [ms], memo, event }) => {
        if (!media) { return; }
        if (isGestureBlockedTarget(event.target)) { return memo; }
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
        if (!media) { return; }
        if (isGestureBlockedTarget(event.target)) { return; }
        if (event.ctrlKey) { return; }

        // 水平滚动时阻止默认行为
        if (Math.abs(dx) > Math.abs(dy)) {
          event.preventDefault();
        }

        // 判断是触控板还是鼠标滚轮
        const isTrackpad = Math.abs(dy) < 40;

        if (isTrackpad) {
          // 触控板：平移内容
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
      enabled: !!media
    }
  );

  // 计算实际显示的缩放比例（基础缩放 * 视图缩放）
  const displayScale = media ? viewState.scale * media.baseScale : viewState.scale;

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-full relative overflow-hidden',
        media ? 'cursor-grab active:cursor-grabbing' : '',
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
      ) : media ? (
        <>
          {/* 媒体显示区域 */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${viewState.offsetX}px, ${viewState.offsetY}px) scale(${displayScale})`,
              transformOrigin: 'center center',
              willChange: 'transform'
            }}
          >
            {media.type === 'image' ? (
              <img
                src={media.src}
                alt={label}
                className="max-w-none select-none pointer-events-none"
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                src={media.src}
                className="max-w-none select-none pointer-events-none"
                loop
                muted={videoControls?.isMuted}
                playsInline
                onLoadedMetadata={(e) => {
                  if (onVideoControlChange) {
                    onVideoControlChange({ duration: e.currentTarget.duration });
                  }
                }}
                onTimeUpdate={() => {
                  if (onVideoControlChange && !videoControls?.isPlaying) {
                     // 仅在非播放状态下（如手动拖动进度条同步）更新时间，避免循环触发
                  }
                }}
              />
            )}
          </div>

          {/* 视频控制栏 */}
          {media.type === 'video' && videoControls && onVideoControlChange && (
            <div
              data-gesture-blocker="true"
              className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
            >
              <LiquidGlass
                radius={12}
                frost={0.1}
                className="flex items-center gap-2 px-3 py-1.5"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-neutral-800 dark:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVideoControlChange({ isPlaying: !videoControls.isPlaying });
                  }}
                >
                  {videoControls.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <div className="flex flex-col w-32 gap-1">
                  <input
                    data-video-progress="true"
                    type="range"
                    min={0}
                    max={videoControls.duration || 100}
                    step={0.01}
                    value={videoControls.currentTime}
                    onChange={(e) => {
                      onVideoControlChange({ currentTime: parseFloat(e.target.value) });
                    }}
                    onPointerUp={(e) => {
                      // 拖动后释放焦点，避免空格键继续操作进度条。
                      e.currentTarget.blur();
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.blur();
                    }}
                    className="w-full h-2 md:h-1 bg-neutral-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-neutral-800 dark:accent-white"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-neutral-800 dark:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVideoControlChange({ isMuted: !videoControls.isMuted });
                  }}
                >
                  {videoControls.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </LiquidGlass>
            </div>
          )}

          {/* 底部信息栏：同一容器内排布，避免长文件名覆盖分辨率。 */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            {/* 媒体尺寸信息 */}
            <LiquidGlass
              radius={12}
              frost={0.1}
              containerClassName="shrink-0"
              className="px-3 py-1.5 text-xs font-mono text-neutral-800 dark:text-white"
            >
              {media.width} × {media.height} {media.type === 'video' && `(${Math.floor(videoControls?.currentTime || 0)}s / ${Math.floor(videoControls?.duration || 0)}s)`}
            </LiquidGlass>
            {/* 文件名信息 */}
            <LiquidGlass
              radius={12}
              frost={0.1}
              containerClassName="min-w-0 max-w-full shrink"
              className="px-3 py-1.5 text-xs text-neutral-800 dark:text-white"
            >
              <span
                className="block max-w-full truncate"
                title={media.fileName}
              >
                {fileName}
              </span>
            </LiquidGlass>
          </div>
          {/* 删除按钮 */}
          <LiquidGlass
            radius={8}
            frost={0.1}
            containerClassName={cn(
              'absolute z-20 h-7 w-7',
              // 移动端顶部工具栏会覆盖上方面板，A 面板删除按钮需要避开。
              label === 'A' ? 'left-3 top-16 md:top-3' : 'right-3 top-3'
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
          <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileInput} />
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
  // 左右媒体状态
  const [leftMedia, setLeftMedia] = useState<MediaInfo | null>(null);
  const [rightMedia, setRightMedia] = useState<MediaInfo | null>(null);

  // 视频控制状态
  const [videoControls, setVideoControls] = useState<VideoControls>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isMuted: true
  });

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
  const leftViewStateRef = useRef(leftViewState);
  const rightViewStateRef = useRef(rightViewState);

  useEffect(() => {
    leftViewStateRef.current = leftViewState;
  }, [leftViewState]);

  useEffect(() => {
    rightViewStateRef.current = rightViewState;
  }, [rightViewState]);

  /**
   * 判断当前键盘操作应控制的媒体类型
   */
  const getKeyboardMediaMode = useCallback((left: MediaInfo | null, right: MediaInfo | null): KeyboardMediaMode => {
    const leftType = left?.type;
    const rightType = right?.type;

    if (!leftType && !rightType) {
      return 'none';
    }

    if (leftType && rightType && leftType !== rightType) {
      return 'mixed';
    }

    return leftType ?? rightType ?? 'none';
  }, []);

  /**
   * 限制视频进度范围，避免超出边界
   */
  const clampTime = useCallback((time: number, duration: number) => {
    if (!Number.isFinite(duration) || duration <= 0) {
      return Math.max(time, 0);
    }
    return Math.min(Math.max(time, 0), duration);
  }, []);

  /**
   * 处理视频控制变化
   */
  const handleVideoControlChange = useCallback((newControls: Partial<VideoControls>) => {
    setVideoControls(prev => ({ ...prev, ...newControls }));
  }, []);

  /**
   * 视频播放同步
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (videoControls.isPlaying) {
      interval = setInterval(() => {
        setVideoControls(prev => ({
          ...prev,
          currentTime: prev.currentTime + 0.05 // 估算时间，实际由各自 video 标签的 useEffect 同步
        }));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [videoControls.isPlaying]);

  /**
   * 处理视图变化
   * 在同步模式下，一侧的新状态会直接同步到另一侧，避免变化量累计误差。
   */
  const handleViewChange = useCallback((side: 'left' | 'right', newState: ViewState) => {
    if (side === 'left') {
      leftViewStateRef.current = newState;
      setLeftViewState(newState);

      if (isSynced) {
        rightViewStateRef.current = newState;
        setRightViewState(newState);
      }
    } else {
      rightViewStateRef.current = newState;
      setRightViewState(newState);

      if (isSynced) {
        leftViewStateRef.current = newState;
        setLeftViewState(newState);
      }
    }
  }, [isSynced]);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeTouchIdsRef = useRef<Set<number>>(new Set());
  const activeTouchCountRef = useRef(0);

  // 管理 Blob URL，防止内存泄漏
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // 使用 ref 存储媒体信息，避免闭包问题
  const leftMediaRef = useRef<MediaInfo | null>(null);
  const rightMediaRef = useRef<MediaInfo | null>(null);

  useEffect(() => {
    leftMediaRef.current = leftMedia;
  }, [leftMedia]);

  useEffect(() => {
    rightMediaRef.current = rightMedia;
  }, [rightMedia]);

  /**
   * 全局跟踪触摸点数量，避免两个面板同时触发单指拖拽造成同步冲突。
   */
  useEffect(() => {
    if (typeof PointerEvent === 'undefined') {
      const handleTouchChange = (event: TouchEvent) => {
        activeTouchCountRef.current = event.touches.length;
      };

      window.addEventListener('touchstart', handleTouchChange, { passive: true });
      window.addEventListener('touchmove', handleTouchChange, { passive: true });
      window.addEventListener('touchend', handleTouchChange, { passive: true });
      window.addEventListener('touchcancel', handleTouchChange, { passive: true });

      return () => {
        window.removeEventListener('touchstart', handleTouchChange);
        window.removeEventListener('touchmove', handleTouchChange);
        window.removeEventListener('touchend', handleTouchChange);
        window.removeEventListener('touchcancel', handleTouchChange);
      };
    }

    const updateTouchCount = () => {
      activeTouchCountRef.current = activeTouchIdsRef.current.size;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      activeTouchIdsRef.current.add(event.pointerId);
      updateTouchCount();
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      activeTouchIdsRef.current.delete(event.pointerId);
      updateTouchCount();
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
      activeTouchIdsRef.current.clear();
      activeTouchCountRef.current = 0;
    };
  }, []);

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
   * 使媒体适应容器大小
   */
  const calculateBaseScale = useCallback((mediaWidth: number, mediaHeight: number) => {
    const container = containerRef.current;
    if (!container) { return 1; }

    const isDesktop = container.clientWidth >= 768;
    // 移动端上下堆叠，每个面板约占媒体区域一半高度。
    const containerWidth = (isDesktop ? container.clientWidth / 2 : container.clientWidth) - 32;
    const containerHeight = (isDesktop ? container.clientHeight : container.clientHeight / 2) - 32;

    const scaleX = containerWidth / mediaWidth;
    const scaleY = containerHeight / mediaHeight;

    return Math.min(scaleX, scaleY, 1);
  }, []);

  /**
   * 处理媒体上传
   */
  const handleUpload = useCallback(
    (file: File, side: 'left' | 'right') => {
      if (side === 'left') {
        setLeftLoading(true);
      } else {
        setRightLoading(true);
      }

      // 清理旧的 Blob URL
      const oldUrl = side === 'left' ? leftMediaRef.current?.src : rightMediaRef.current?.src;
      if (oldUrl && objectUrlsRef.current.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        objectUrlsRef.current.delete(oldUrl);
      }

      const objectUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');

      return new Promise((resolve, reject) => {
        if (isVideo) {
          const video = document.createElement('video');
          video.onloadedmetadata = () => {
            const baseScale = calculateBaseScale(video.videoWidth, video.videoHeight);
            objectUrlsRef.current.add(objectUrl);

            const mediaInfo: MediaInfo = {
              src: objectUrl,
              fileName: file.name,
              width: video.videoWidth,
              height: video.videoHeight,
              baseScale,
              type: 'video'
            };

            if (side === 'left') {
              setLeftMedia(mediaInfo);
              setLeftLoading(false);
            } else {
              setRightMedia(mediaInfo);
              setRightLoading(false);
            }
            resolve(mediaInfo);
          };
          video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            if (side === 'left') {
              setLeftLoading(false);
            } else {
              setRightLoading(false);
            }
            setToast({ message: t.loadError, type: 'error' });
            setTimeout(() => setToast(null), 3000);
            reject(new Error('Video load failed'));
          };
          video.src = objectUrl;
        } else {
          const img = new Image();
          img.onload = () => {
            const baseScale = calculateBaseScale(img.naturalWidth, img.naturalHeight);

            objectUrlsRef.current.add(objectUrl);

            const mediaInfo: MediaInfo = {
              src: objectUrl,
              fileName: file.name,
              width: img.naturalWidth,
              height: img.naturalHeight,
              baseScale,
              type: 'image'
            };

            if (side === 'left') {
              setLeftMedia(mediaInfo);
              setLeftLoading(false);
            } else {
              setRightMedia(mediaInfo);
              setRightLoading(false);
            }
            resolve(mediaInfo);
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
        }
      });
    },
    [calculateBaseScale, t]
  );

  /**
   * 重置视图状态
   */
  const handleReset = useCallback(() => {
    const initialState = { scale: 1, offsetX: 0, offsetY: 0 };
    leftViewStateRef.current = initialState;
    rightViewStateRef.current = initialState;
    setLeftViewState(initialState);
    setRightViewState(initialState);
    setIsSynced(true);
  }, []);

  /**
   * 放大媒体
   */
  const handleZoomIn = useCallback(() => {
    const newStateFn = (prev: ViewState) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 10)
    });

    setLeftViewState((prev) => {
      const nextState = newStateFn(prev);
      leftViewStateRef.current = nextState;
      return nextState;
    });
    setRightViewState((prev) => {
      const nextState = newStateFn(prev);
      rightViewStateRef.current = nextState;
      return nextState;
    });
  }, []);

  /**
   * 缩小媒体
   */
  const handleZoomOut = useCallback(() => {
    const newStateFn = (prev: ViewState) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.1)
    });

    setLeftViewState((prev) => {
      const nextState = newStateFn(prev);
      leftViewStateRef.current = nextState;
      return nextState;
    });
    setRightViewState((prev) => {
      const nextState = newStateFn(prev);
      rightViewStateRef.current = nextState;
      return nextState;
    });
  }, []);

  const hasMedia = leftMedia || rightMedia;
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
   * 删除单侧媒体
   */
  const handleDeleteMedia = useCallback(
    (side: 'left' | 'right') => {
      const mediaRef = side === 'left' ? leftMediaRef : rightMediaRef;
      const oldUrl = mediaRef.current?.src;
      if (oldUrl && objectUrlsRef.current.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        objectUrlsRef.current.delete(oldUrl);
      }

      if (side === 'left') {
        setLeftMedia(null);
      } else {
        setRightMedia(null);
      }
    },
    []
  );

  /**
   * 清空所有媒体
   */
  const handleClearAll = useCallback(() => {
    cleanupAllUrls();
    setLeftMedia(null);
    setRightMedia(null);
    setLeftLoading(false);
    setRightLoading(false);
    handleReset();
    setVideoControls({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isMuted: true
    });
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

      // 检查剪贴板中是否有图片或视频
      let hasTarget = false;
      let targetItem: DataTransferItem | undefined;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/') || items[i].type.startsWith('video/')) {
          hasTarget = true;
          targetItem = items[i];
          break;
        }
      }

      if (!hasTarget || !targetItem) {
        return;
      }

      e.preventDefault();

      const file = targetItem.getAsFile();
      if (!file) {
        showToast(t.pasteError, 'error');
        return;
      }

      // 确定上传到哪一侧
      let targetSide: 'left' | 'right';
      if (!leftMedia) {
        targetSide = 'left';
      } else if (!rightMedia) {
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
    [handleUpload, leftMedia, rightMedia, showToast, t]
  );

  // 监听粘贴事件，支持移动端外接键盘或浏览器剪贴板事件。
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // 监听键盘快捷键（仅在桌面端）
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) {return;}

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (showHelp) {
        return;
      }

      if (e.key === ' ' && isVideoProgressTarget(target)) {
        e.preventDefault();
        e.stopPropagation();
        setVideoControls((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
        return;
      }

      if (
        target instanceof HTMLElement &&
        (
          target.closest('input, textarea, select, [contenteditable="true"]') ||
          target.isContentEditable
        )
      ) {
        return;
      }

      const mediaMode = getKeyboardMediaMode(leftMedia, rightMedia);

      if (e.key === ' ') {
        const hasVideo = leftMedia?.type === 'video' || rightMedia?.type === 'video';
        if (!hasVideo) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        setVideoControls((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
        return;
      }

      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }

      if (mediaMode === 'mixed' || mediaMode === 'none') {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (mediaMode === 'image') {
        let deltaX = 0;
        let deltaY = 0;

        if (e.key === 'ArrowLeft') { deltaX = -IMAGE_KEYBOARD_PAN_STEP; }
        if (e.key === 'ArrowRight') { deltaX = IMAGE_KEYBOARD_PAN_STEP; }
        if (e.key === 'ArrowUp') { deltaY = -IMAGE_KEYBOARD_PAN_STEP; }
        if (e.key === 'ArrowDown') { deltaY = IMAGE_KEYBOARD_PAN_STEP; }

        if (leftMedia?.type === 'image') {
          setLeftViewState((prev) => {
            const nextState = {
              ...prev,
              offsetX: prev.offsetX + deltaX,
              offsetY: prev.offsetY + deltaY
            };
            leftViewStateRef.current = nextState;
            return nextState;
          });
        }

        if (rightMedia?.type === 'image') {
          setRightViewState((prev) => {
            const nextState = {
              ...prev,
              offsetX: prev.offsetX + deltaX,
              offsetY: prev.offsetY + deltaY
            };
            rightViewStateRef.current = nextState;
            return nextState;
          });
        }

        return;
      }

      if (mediaMode === 'video' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const delta = e.key === 'ArrowLeft' ? -VIDEO_FRAME_STEP : VIDEO_FRAME_STEP;
        setVideoControls((prev) => ({
          ...prev,
          currentTime: clampTime(prev.currentTime + delta, prev.duration)
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clampTime, getKeyboardMediaMode, leftMedia, rightMedia, showHelp]);

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* 顶部控制栏 */}
      <LiquidGlass
        radius={16}
        frost={0.1}
        containerClassName="absolute left-1/2 top-3 z-10 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2"
        className="flex w-max max-w-[calc(100vw-1.5rem)] items-center gap-1 overflow-x-auto px-2 py-1.5 md:max-w-none md:px-3"
      >
        {/* 标题 */}
        <div className="hidden items-center min-w-[120px] justify-center px-2 md:flex">
          <div className="relative flex items-center justify-center">
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin absolute -left-5" />
            )}
            <span className="text-sm font-medium text-neutral-800 dark:text-white">
              {t.imageCompare}
            </span>
          </div>
        </div>
        <div className="hidden w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1 md:block" />
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
          disabled={!hasMedia || isLoading}
          title={t.zoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        {/* 放大按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleZoomIn}
          disabled={!hasMedia || isLoading}
          title={t.zoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        {/* 重置按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleReset}
          disabled={!hasMedia || isLoading}
          title={t.reset}
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
          disabled={!hasMedia || isLoading}
          title={isSynced ? t.unlockView : t.lockView}
        >
          {isSynced ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </Button>

        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        {/* 清空按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-lg px-0 text-xs text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20 md:w-auto md:px-3"
          onClick={handleClearAll}
          disabled={!hasMedia || isLoading}
          title={t.clear}
        >
          <X className="h-3.5 w-3.5 md:hidden" />
          <span className="hidden md:inline">{t.clear}</span>
        </Button>
        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        {/* 语言切换按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-lg px-0 text-xs text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20 flex items-center gap-1 md:w-auto md:px-3"
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          title={t.switchTo}
        >
          <Languages className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{t.switchTo}</span>
        </Button>
        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        {/* 帮助按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-lg px-0 text-xs text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20 flex items-center gap-1 md:w-auto md:px-3"
          onClick={handleOpenHelp}
          title={t.help}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{t.help}</span>
        </Button>
      </LiquidGlass>

      {/* 媒体显示区域 */}
      <div ref={containerRef} className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {/* 左侧媒体面板 */}
        <div className="min-h-0 flex-1 bg-secondary">
          <MediaPanel
            media={leftMedia}
            onUpload={(file: File) => handleUpload(file, 'left')}
            onDelete={() => handleDeleteMedia('left')}
            viewState={leftViewState}
            onViewChange={(newState: ViewState) => handleViewChange('left', newState)}
            label="A"
            isLoading={leftLoading}
            t={t}
            activeTouchCountRef={activeTouchCountRef}
            videoControls={leftMedia?.type === 'video' ? videoControls : undefined}
            onVideoControlChange={handleVideoControlChange}
          />
        </div>
        {/* 中间分隔线 */}
        <div className="h-px w-full bg-white/20 backdrop-blur-sm dark:bg-white/10 md:h-auto md:w-px" />
        {/* 右侧媒体面板 */}
        <div className="min-h-0 flex-1 bg-secondary">
          <MediaPanel
            media={rightMedia}
            onUpload={(file: File) => handleUpload(file, 'right')}
            onDelete={() => handleDeleteMedia('right')}
            viewState={rightViewState}
            onViewChange={(newState: ViewState) => handleViewChange('right', newState)}
            label="B"
            isLoading={rightLoading}
            t={t}
            activeTouchCountRef={activeTouchCountRef}
            videoControls={rightMedia?.type === 'video' ? videoControls : undefined}
            onVideoControlChange={handleVideoControlChange}
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
