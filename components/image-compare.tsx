"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { ZoomIn, ZoomOut, RotateCcw, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  viewState: ViewState         // 当前视图状态
  onViewChange: (state: ViewState) => void  // 视图状态改变的回调函数
  label: string                // 面板标签（A/B）
}

/**
 * 图片面板块组件
 * 提供图片显示、拖拽上传、缩放和平移功能
 */
function ImagePanel({ image, onUpload, viewState, onViewChange, label }: ImagePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  /**
   * 处理拖拽放置事件
   * 当用户将文件拖拽到面板上时触发，验证文件类型并调用上传回调
   * @param e 拖拽事件对象
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        onUpload(file)
      }
    },
    [onUpload],
  )

  /**
   * 处理文件输入变化事件
   * 当用户通过文件选择对话框选择文件时触发
   * @param e 文件输入变化事件对象
   */
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onUpload(file)
      }
    },
    [onUpload],
  )

  /**
   * 处理鼠标滚轮事件实现缩放功能
   * 根据滚轮方向调整缩放比例，并保持鼠标位置相对固定
   * @param e 鼠标滚轮事件对象
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.min(Math.max(viewState.scale * delta, 0.1), 10)

      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const mouseX = e.clientX - rect.left - rect.width / 2
        const mouseY = e.clientY - rect.top - rect.height / 2

        const scaleDiff = newScale / viewState.scale
        const newOffsetX = mouseX - (mouseX - viewState.offsetX) * scaleDiff
        const newOffsetY = mouseY - (mouseY - viewState.offsetY) * scaleDiff

        onViewChange({
          scale: newScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        })
      }
    },
    [viewState, onViewChange],
  )

  /**
   * 处理鼠标按下事件开始拖拽
   * 记录拖拽起始位置，仅响应左键点击
   * @param e 鼠标事件对象
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // 仅处理左键
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  /**
   * 处理鼠标移动事件实现平移功能
   * 当鼠标拖拽时更新视图偏移量
   * @param e 鼠标事件对象
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastPos.current.x
        const deltaY = e.clientY - lastPos.current.y
        lastPos.current = { x: e.clientX, y: e.clientY }

        onViewChange({
          ...viewState,
          offsetX: viewState.offsetX + deltaX,
          offsetY: viewState.offsetY + deltaY,
        })
      }
    },
    [viewState, onViewChange],
  )

  /**
   * 处理鼠标释放事件结束拖拽
   */
  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  /**
   * 处理鼠标离开事件结束拖拽
   */
  const handleMouseLeave = useCallback(() => {
    isDragging.current = false
  }, [])

  // 计算实际显示的缩放比例（基础缩放 × 用户缩放）
  const displayScale = image ? viewState.scale * image.baseScale : viewState.scale

  return (
    <div
      ref={containerRef}
      className={cn("h-full relative overflow-hidden", image ? "cursor-grab active:cursor-grabbing" : "")}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onWheel={image ? handleWheel : undefined}
      onMouseDown={image ? handleMouseDown : undefined}
      onMouseMove={image ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {image ? (
        <>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${viewState.offsetX}px, ${viewState.offsetY}px) scale(${displayScale})`,
              transformOrigin: "center center",
            }}
          >
            <img
              src={image.src || "/placeholder.svg"}
              alt={label}
              className="max-w-none select-none pointer-events-none"
              draggable={false}
            />
          </div>
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

        </>
      ) : (
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
  )
}

/**
 * 图片对比主组件
 * 提供双图片对比功能，支持同步缩放、平移和各种操作控件
 */
export function ImageCompare() {
  // 左右图片的状态
  const [leftImage, setLeftImage] = useState<ImageInfo | null>(null)
  const [rightImage, setRightImage] = useState<ImageInfo | null>(null)

  // 视图状态，包括缩放比例和偏移量
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })

  // 容器引用，用于计算图片基础缩放比例
  const containerRef = useRef<HTMLDivElement>(null)

  // 监听系统主题变化，同步更新应用主题
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  /**
   * 计算图片的基础缩放比例
   * 确保图片能够完整显示在容器内，且不会被不必要地放大
   * @param imgWidth 图片原始宽度
   * @param imgHeight 图片原始高度
   * @returns 基础缩放比例
   */
  const calculateBaseScale = useCallback((imgWidth: number, imgHeight: number) => {
    const container = containerRef.current
    if (!container) return 1

    const containerWidth = container.clientWidth / 2 - 32 // 单侧容器宽度，减去边距
    const containerHeight = container.clientHeight - 32

    const scaleX = containerWidth / imgWidth
    const scaleY = containerHeight / imgHeight

    // 取较小值确保图片完整显示，并限制最大为 1（不放大小图）
    return Math.min(scaleX, scaleY, 1)
  }, [])

  /**
   * 处理图片上传
   * 读取图片文件并设置图片信息状态
   * @param file 上传的图片文件
   * @param side 图片所在侧（左/右）
   */
  const handleUpload = useCallback(
    (file: File, side: "left" | "right") => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          const baseScale = calculateBaseScale(img.naturalWidth, img.naturalHeight)
          const imageInfo: ImageInfo = {
            src: result,
            width: img.naturalWidth,
            height: img.naturalHeight,
            baseScale,
          }
          if (side === "left") {
            setLeftImage(imageInfo)
          } else {
            setRightImage(imageInfo)
          }
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    },
    [calculateBaseScale],
  )

  /**
   * 重置视图状态到默认值
   */
  const handleReset = useCallback(() => {
    setViewState({ scale: 1, offsetX: 0, offsetY: 0 })
  }, [])

  /**
   * 放大视图
   */
  const handleZoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 10),
    }))
  }, [])

  /**
   * 缩小视图
   */
  const handleZoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.1),
    }))
  }, [])

  /**
   * 清空所有图片并重置视图
   */
  const handleClearAll = useCallback(() => {
    setLeftImage(null)
    setRightImage(null)
    handleReset()
  }, [handleReset])

  // 判断是否有图片已上传
  const hasImages = leftImage || rightImage

  return (
    <div className="flex flex-col h-screen bg-background">
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-1.5 rounded-2xl
        bg-white/20 dark:bg-white/10 backdrop-blur-xl
        border border-white/30 dark:border-white/20
        shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)]
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
      >
        <span className="text-sm font-medium text-neutral-800 dark:text-white px-2">图片对比</span>
        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        <span className="text-xs text-neutral-600 dark:text-white/70 px-2 font-mono">
          {Math.round(viewState.scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleZoomOut}
          disabled={!hasImages}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleZoomIn}
          disabled={!hasImages}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleReset}
          disabled={!hasImages}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-neutral-400/30 dark:bg-white/20 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg text-xs text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={handleClearAll}
          disabled={!hasImages}
        >
          清空
        </Button>
      </div>

      <div ref={containerRef} className="flex-1 flex min-h-0 relative">
        <div className="flex-1 bg-secondary">
          <ImagePanel
            image={leftImage}
            onUpload={(file) => handleUpload(file, "left")}
            viewState={viewState}
            onViewChange={setViewState}
            label="A"
          />
        </div>
        <div className="w-px bg-white/20 dark:bg-white/10 backdrop-blur-sm" />
        <div className="flex-1 bg-secondary">
          <ImagePanel
            image={rightImage}
            onUpload={(file) => handleUpload(file, "right")}
            viewState={viewState}
            onViewChange={setViewState}
            label="B"
          />
        </div>
      </div>
    </div>
  )
}
