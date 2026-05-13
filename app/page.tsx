/**
 * 图片对比工具 - 主页组件
 *
 * 这是应用的主页面，负责：
 * 1. 渲染图片对比主组件
 * 2. 使用动态视口高度适配移动端地址栏伸缩
 */

import { ImageCompare } from '@/components/image-compare';

/**
 * 主页组件
 *
 * 返回图片对比主容器，移动端和桌面端均可使用。
 */
export default function Home() {
  return (
    <main className="min-h-dvh bg-background">
      <ImageCompare />
    </main>
  );
}
