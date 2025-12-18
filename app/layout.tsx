import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';

// 定义应用的元数据，用于SEO和浏览器标签显示
export const metadata: Metadata = {
  title: '图片对比工具',
  description: '一款支持同步缩放和平移的图片对比工具',
  icons: {
    icon: [
      {
        url: '/icon-32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: '/icon-16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml'
      }
    ],
    apple: [
      {
        url: '/icon-180.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ]
  }
};

// 根布局组件，定义了HTML文档的基本结构
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/*
          此内联脚本用于在页面加载前根据系统偏好设置暗黑或亮色主题，
          防止页面加载后出现主题闪烁。
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', prefersDark);
              })();
            `
          }}
        />
      </head>
      {/*
        应用主题样式和抗锯齿效果
        'font-sans' 设置无衬线字体
        'antialiased' 开启抗锯齿以获得更平滑的文本渲染
      */}
      <body className={'font-sans antialiased'}>
        {children}
      </body>
    </html>
  );
}
