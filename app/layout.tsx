import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';

// 定义应用的元数据，用于SEO和浏览器标签显示
export const metadata: Metadata = {
  title: {
    default: '图片对比工具 - 在线同步缩放和平移对比',
    template: '%s - 图片对比工具'
  },
  description: '一款功能强大的在线图片对比工具，支持同步缩放、平移和多种上传方式。适用于设计师、摄影师等需要精确比较图片细节的用户。',
  keywords: ['图片对比', '图片比较', '同步缩放', '平移对比', '在线图片对比', '设计师工具', '摄影师工具'],
  authors: [{ name: 'Chen Long' }],
  creator: 'Chen Long',
  publisher: 'Chen Long',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://epiphany-cl.github.io/image-comparison-tool/',
    title: '图片对比工具 - 在线同步缩放和平移对比',
    description: '一款功能强大的在线图片对比工具，支持同步缩放、平移和多种上传方式。',
    siteName: '图片对比工具'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  metadataBase: new URL('https://epiphany-cl.github.io/image-comparison-tool/'),
  alternates: {
    canonical: '/'
  },
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
        {/* 结构化数据 - WebApplication */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              'name': '图片对比工具',
              'description': '一款功能强大的在线图片对比工具，支持同步缩放、平移和多种上传方式。',
              'applicationCategory': 'DesignApplication',
              'operatingSystem': 'All',
              'url': 'https://epiphany-cl.github.io/image-comparison-tool/',
              'featureList': [
                '双图并排实时对比',
                '同步缩放和平移操作',
                '支持拖拽上传文件',
                '深色模式支持',
                '触控板支持（捏合缩放、双指滑动平移）'
              ]
            })
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
