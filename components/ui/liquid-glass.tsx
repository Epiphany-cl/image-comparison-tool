/**
 * 液态玻璃效果组件
 *
 * 使用 SVG 滤镜创建高级玻璃态效果，具有以下特性：
 * - 圆角边框
 * - 折射和扭曲效果
 * - 毛玻璃背景模糊
 * - 内阴影和外阴影
 * - 深色模式支持
 *
 * 技术实现：
 * - 使用 SVG feDisplacementMap 创建折射效果
 * - 使用 ResizeObserver 监听尺寸变化
 * - 动态生成 SVG 作为位移图
 * - 支持多种自定义参数
 */

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useId,
  CSSProperties
} from 'react';
import { cn } from '@/lib/utils';

/**
 * 液态玻璃组件属性接口
 */
interface LiquidGlassProps {
  radius?: number;           // 圆角半径（像素）
  border?: number;           // 边框宽度比例（相对于容器最小尺寸）
  lightness?: number;        // 亮度值（0-100）
  displace?: number;         // 位移强度（模糊程度）
  blend?: string;            // 混合模式
  xChannel?: 'R' | 'G' | 'B'; // X 轴位移通道
  yChannel?: 'R' | 'G' | 'B'; // Y 轴位移通道
  alpha?: number;            // 透明度（0-1）
  blur?: number;             // 模糊半径（像素）
  rOffset?: number;          // 红色通道位移偏移
  gOffset?: number;          // 绿色通道位移偏移
  bOffset?: number;          // 蓝色通道位移偏移
  scale?: number;            // 位移缩放比例
  frost?: number;            // 毛玻璃效果强度（0-1）
  className?: string;        // 内容区域类名
  containerClassName?: string; // 容器类名
  children?: React.ReactNode; // 子组件
}

/**
 * 液态玻璃组件
 *
 * 通过 SVG 滤镜创建真实的玻璃折射效果
 */
const LiquidGlass: React.FC<LiquidGlassProps> = ({
  radius = 16,              // 默认圆角 16px
  border = 0.07,            // 默认边框宽度 7%
  lightness = 50,           // 默认亮度 50%
  displace,                 // 位移强度（可选）
  blend = 'difference',     // 默认混合模式
  xChannel = 'R',           // 默认 X 轴使用红色通道
  yChannel = 'B',           // 默认 Y 轴使用蓝色通道
  alpha = 0.93,             // 默认透明度 0.93
  blur = 11,                // 默认模糊半径 11px
  rOffset = 0,              // 红色通道偏移
  gOffset = 10,             // 绿色通道偏移 10
  bOffset = 20,             // 蓝色通道偏移 20
  scale = -180,             // 默认位移缩放 -180
  frost = 0.05,             // 默认毛玻璃强度 0.05
  className = '',           // 内容区域类名
  containerClassName = '',  // 容器类名
  children                  // 子组件
}) => {
  // 生成唯一的滤镜 ID
  const filterId = useId().replace(/:/g, '');

  // 容器引用
  const liquidGlassRoot = useRef<HTMLDivElement | null>(null);

  // 容器尺寸状态
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 监听容器尺寸变化
  useEffect(() => {
    const el = liquidGlassRoot.current;
    if (!el) {return;}

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {return;}

      let width = 0;
      let height = 0;

      // 优先使用 borderBoxSize（包含边框和内边距）
      if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
        width = entry.borderBoxSize[0].inlineSize;
        height = entry.borderBoxSize[0].blockSize;
      } else {
        // 降级使用 contentRect（仅内容区域）
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }

      setDimensions({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /**
   * 生成位移图 SVG
   *
   * 创建一个包含渐变和模糊的 SVG，用于 feDisplacementMap
   */
  const displacementDataUri = useMemo(() => {
    // 如果尺寸为 0，不生成位移图
    if (dimensions.width === 0 || dimensions.height === 0) {
      return null;
    }

    // 计算边框宽度
    const b = Math.min(dimensions.width, dimensions.height) * (border * 0.5);
    const yB = Math.min(dimensions.width, dimensions.height) * (border * 0.5);

    // 构建 SVG 字符串
    const svgString = `
      <svg viewBox="0 0 ${dimensions.width} ${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- 红色水平渐变：用于 X 轴位移 -->
          <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <!-- 蓝色垂直渐变：用于 Y 轴位移 -->
          <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <!-- 黑色背景 -->
        <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" fill="black"></rect>
        <!-- 红色渐变层 -->
        <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="${radius}" fill="url(#red)" />
        <!-- 蓝色渐变层：使用混合模式 -->
        <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="${radius}" fill="url(#blue)" style="mix-blend-mode: ${blend}" />
        <!-- 内部填充：模糊的灰色层 -->
        <rect 
          x="${b}" 
          y="${yB}" 
          width="${dimensions.width - b * 2}" 
          height="${dimensions.height - yB * 2}" 
          rx="${radius}" 
          fill="hsl(0 0% ${lightness}% / ${alpha})" 
          style="filter:blur(${blur}px)" 
        />
      </svg>
    `.trim();

    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
  }, [dimensions, radius, border, lightness, alpha, blur, blend]);

  // 动态样式：设置 CSS 变量和滤镜
  const dynamicStyle: CSSProperties = {
    '--frost': frost,
    borderRadius: `${radius}px`,
    backdropFilter: `url(#${filterId})`,
    WebkitBackdropFilter: `url(#${filterId})`
  } as CSSProperties;

  return (
    <div
      ref={liquidGlassRoot}
      className={cn(
        'relative block opacity-100',
        // 毛玻璃背景色
        'bg-[hsl(0_0%_100%/var(--frost,0))] dark:bg-[hsl(0_0%_0%/var(--frost,0))]',
        // 阴影效果：内阴影和外阴影
        'shadow-[0_0_2px_1px_rgba(0,0,0,0.15)_inset,0_0_10px_4px_rgba(0,0,0,0.1)_inset,0px_4px_16px_rgba(17,17,26,0.05),0px_8px_24px_rgba(17,17,26,0.05),0px_16px_56px_rgba(17,17,26,0.05),0px_4px_16px_rgba(17,17,26,0.05)_inset,0px_8px_24px_rgba(17,17,26,0.05)_inset,0px_16px_56px_rgba(17,17,26,0.05)_inset]',
        'dark:shadow-[0_0_2px_1px_rgba(255,255,255,0.15)_inset,0_0_10px_4px_rgba(255,255,255,0.1)_inset,0px_4px_16px_rgba(0,0,0,0.2),0px_8px_24px_rgba(0,0,0,0.2),0px_16px_56px_rgba(0,0,0,0.2),0px_4px_16px_rgba(0,0,0,0.2)_inset,0px_8px_24px_rgba(0,0,0,0.2)_inset,0px_16px_56px_rgba(0,0,0,0.2)_inset]',
        containerClassName
      )}
      style={dynamicStyle}
    >
      {/* 内容区域 */}
      <div className={cn('w-full h-full overflow-hidden rounded-[inherit]', className)}>
        {children}
      </div>

      {/* SVG 滤镜定义 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            {/* 加载位移图 */}
            {displacementDataUri && displacementDataUri.length > 0 && (
              <feImage
                x="0"
                y="0"
                width="100%"
                height="100%"
                href={displacementDataUri}
                result="map"
              />
            )}
            {/* 红色通道位移 */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              scale={scale + rOffset}
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="red"
            />
            {/* 绿色通道位移 */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              scale={scale + gOffset}
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="green"
            />
            {/* 蓝色通道位移 */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              scale={scale + bOffset}
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
              result="blue"
            />
            {/* 混合三个颜色通道 */}
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            {/* 可选的额外模糊 */}
            <feGaussianBlur stdDeviation={displace} />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default LiquidGlass;
