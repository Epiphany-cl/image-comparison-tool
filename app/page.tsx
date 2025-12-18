import { ImageCompare } from '@/components/image-compare';
import { MobileNotSupported } from '@/components/mobile-not-supported';

/**
 * 应用首页
 * @constructor
 */
export default function Home() {
  return (
    // 主容器，设置最小高度为全屏并应用背景色
    <main className="min-h-screen bg-background">
      {/* 在移动设备上显示“暂不支持”的提示 */}
      <MobileNotSupported />
      {/* 渲染核心的图片比较组件 */}
      <ImageCompare />
    </main>
  );
}
