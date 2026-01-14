/**
 * 图片对比工具 - 主页组件
 *
 * 这是应用的主页面，负责：
 * 1. 渲染移动端不支持提示组件
 * 2. 渲染图片对比主组件
 *
 * 注意：ImageCompare 组件在移动端会自动隐藏（通过 CSS 类名控制），
 * 只在桌面端显示（md:flex）
 */

import { ImageCompare } from '@/components/image-compare';
import { MobileNotSupported } from '@/components/mobile-not-supported';

/**
 * 主页组件
 *
 * 返回包含两个子组件的主容器：
 * - MobileNotSupported: 在移动端显示不支持提示
 * - ImageCompare: 在桌面端显示图片对比功能
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* 移动端不支持提示：在小屏幕设备上显示 */}
      <MobileNotSupported />
      {/* 图片对比主组件：在桌面端显示（通过 CSS 类名控制） */}
      <ImageCompare />
    </main>
  );
}
