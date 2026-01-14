import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useId,
  CSSProperties
} from 'react';
import { cn } from '@/lib/utils';

// 定义组件 Props 接口
interface LiquidGlassProps {
  radius?: number;
  border?: number;
  lightness?: number;
  displace?: number;
  blend?: string;
  xChannel?: 'R' | 'G' | 'B';
  yChannel?: 'R' | 'G' | 'B';
  alpha?: number;
  blur?: number;
  rOffset?: number;
  gOffset?: number;
  bOffset?: number;
  scale?: number;
  frost?: number;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  radius = 16,
  border = 0.07,
  lightness = 50,
  displace,
  blend = 'difference',
  xChannel = 'R',
  yChannel = 'B',
  alpha = 0.93,
  blur = 11,
  rOffset = 0,
  gOffset = 10,
  bOffset = 20,
  scale = -180,
  frost = 0.05,
  className = '',
  containerClassName = '',
  children
}) => {
  // 生成唯一的 SVG filter ID
  const filterId = useId().replace(/:/g, '');

  // DOM 引用
  const liquidGlassRoot = useRef<HTMLDivElement | null>(null);

  // 响应式尺寸状态
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 监听尺寸变化
  useEffect(() => {
    const el = liquidGlassRoot.current;
    if (!el) {return;}

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {return;}

      let width = 0;
      let height = 0;

      if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
        width = entry.borderBoxSize[0].inlineSize;
        height = entry.borderBoxSize[0].blockSize;
      } else {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }

      setDimensions({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /**
   * 计算位移图像 SVG 并生成 Data URI
   */
  const displacementDataUri = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return null;
    }

    const b = Math.min(dimensions.width, dimensions.height) * (border * 0.5);
    const yB = Math.min(dimensions.width, dimensions.height) * (border * 0.5);

    const svgString = `
      <svg viewBox="0 0 ${dimensions.width} ${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" fill="black"></rect>
        <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="${radius}" fill="url(#red)" />
        <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="${radius}" fill="url(#blue)" style="mix-blend-mode: ${blend}" />
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

  // 动态样式
  const dynamicStyle: CSSProperties = {
    '--frost': frost,
    borderRadius: `${radius}px`,
    backdropFilter: `url(#${filterId})`,
    WebkitBackdropFilter: `url(#${filterId})` // 兼容 Safari
  } as CSSProperties;

  return (
    <div
      ref={liquidGlassRoot}
      className={cn(
        'relative block opacity-100',
        // 背景色：浅色模式白色带透明度，深色模式黑色带透明度
        'bg-[hsl(0_0%_100%/var(--frost,0))] dark:bg-[hsl(0_0%_0%/var(--frost,0))]',
        // 阴影效果：复杂的内阴影和外阴影，适配深色模式
        'shadow-[0_0_2px_1px_rgba(0,0,0,0.15)_inset,0_0_10px_4px_rgba(0,0,0,0.1)_inset,0px_4px_16px_rgba(17,17,26,0.05),0px_8px_24px_rgba(17,17,26,0.05),0px_16px_56px_rgba(17,17,26,0.05),0px_4px_16px_rgba(17,17,26,0.05)_inset,0px_8px_24px_rgba(17,17,26,0.05)_inset,0px_16px_56px_rgba(17,17,26,0.05)_inset]',
        'dark:shadow-[0_0_2px_1px_rgba(255,255,255,0.15)_inset,0_0_10px_4px_rgba(255,255,255,0.1)_inset,0px_4px_16px_rgba(0,0,0,0.2),0px_8px_24px_rgba(0,0,0,0.2),0px_16px_56px_rgba(0,0,0,0.2),0px_4px_16px_rgba(0,0,0,0.2)_inset,0px_8px_24px_rgba(0,0,0,0.2)_inset,0px_16px_56px_rgba(0,0,0,0.2)_inset]',
        containerClassName
      )}
      style={dynamicStyle}
    >
      <div className={cn('w-full h-full overflow-hidden [border-radius:inherit]', className)}>
        {children}
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
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
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur stdDeviation={displace} />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default LiquidGlass;

// 使用方法
/**
import LiquidGlass from "./LiquidGlass";

function App() {
  return (
    <div className="p-20 bg-gradient-to-br from-purple-500 to-pink-500 min-h-screen">
      <LiquidGlass radius={24} frost={0.1} className="p-10">
        <h1 className="text-4xl font-bold text-white">流体玻璃效果</h1>
        <p className="text-white opacity-80 mt-4">这段文字下方的背景具有复杂的位移滤镜效果。</p>
      </LiquidGlass>
    </div>
  );
}
 */
