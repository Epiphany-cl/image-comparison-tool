import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// 页面元数据配置
export const metadata: Metadata = {
  title: "图片对比工具",
  description: "一款支持同步缩放和平移的图片对比工具",
  icons: {
    icon: [
      {
        url: "/icon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    // 苹果触摸图标
    apple: [
      {
        url: "/icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
}

/**
 * 应用根布局组件
 * 设置全局样式、字体和主题初始化脚本
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', prefersDark);
              })();
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
