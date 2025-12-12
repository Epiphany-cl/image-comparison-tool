import { ImageCompare } from "@/components/image-compare"

/**
 * 首页组件
 * 渲染图片对比工具的主界面
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ImageCompare />
    </main>
  )
}
