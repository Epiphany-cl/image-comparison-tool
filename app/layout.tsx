/**
 * 图片对比工具 - 根布局组件
 *
 * 这是应用的根布局文件，负责：
 * 1. 配置页面元数据（SEO、OpenGraph、图标等）
 * 2. 初始化深色模式和语言设置
 * 3. 提供国际化上下文
 * 4. 定义 HTML 结构
 */

import type React from 'react';
import type { Metadata } from 'next';
import { I18nProvider } from '@/components/i18n-provider';
import './globals.css';

// 页面元数据配置
export const metadata: Metadata = {
  // 标题配置
  title: {
    default: '多媒体对比工具 - 在线图片与视频同步对比',
    template: '%s - 多媒体对比工具'
  },
  // 页面描述
  description: '一款功能强大的在线多媒体对比工具，支持图片与视频的同步缩放、平移、播放同步。适用于设计师、摄影师、视频剪辑师等需要精确比较细节的用户。',
  // SEO 关键词
  keywords: ['图片对比', '视频对比', '多媒体比较', '同步缩放', '平移对比', '在线视频对比', '设计师工具', '视频剪辑工具'],
  // 作者信息
  authors: [{ name: 'Chen Long' }],
  creator: 'Chen Long',
  publisher: 'Chen Long',
  // OpenGraph 配置（社交媒体分享）
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://epiphany-cl.github.io/image-comparison-tool/',
    title: '多媒体对比工具 - 在线图片与视频同步对比',
    description: '一款功能强大的在线多媒体对比工具，支持图片与视频的同步缩放、平移及播放同步。',
    siteName: '多媒体对比工具'
  },
  // 搜索引擎爬虫配置
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
  // 元数据基础 URL
  metadataBase: new URL('https://epiphany-cl.github.io/image-comparison-tool/'),
  // 规范链接
  alternates: {
    canonical: '/'
  },
  // 网站图标配置
  icons: {
    icon: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon-32.png`,
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon-16.png`,
        sizes: '16x16',
        type: 'image/png'
      },
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.svg`,
        type: 'image/svg+xml'
      }
    ],
    apple: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon-180.png`,
        sizes: '180x180',
        type: 'image/png'
      }
    ]
  },
  // PWA manifest 文件
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/manifest.json`,
  // Apple Web App 配置
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '多媒体对比工具'
  },
  // 格式检测配置（禁用电话号码自动识别）
  formatDetection: {
    telephone: false
  }
};

/**
 * 根布局组件
 *
 * 功能：
 * - 渲染 HTML 结构
 * - 初始化深色模式和语言设置（防止闪烁）
 * - 提供 Schema.org 结构化数据
 * - 包裹 I18nProvider 提供国际化支持
 */
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 初始化脚本：在页面加载前执行，防止主题和语言闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 检测系统深色模式偏好并应用
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', prefersDark);

                // 检测用户语言偏好
                const savedLocale = localStorage.getItem('locale');
                const browserLang = navigator.language.toLowerCase();
                const defaultLocale = 'zh';
                const locale = savedLocale || (browserLang.startsWith('zh') ? 'zh' : 'en');
                
                // 设置 HTML 语言属性
                document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
                
                // 如果语言不是默认语言，添加准备类名以防止闪烁
                if (locale !== defaultLocale) {
                  document.documentElement.classList.add('i18n-preparing');
                }
              })();
            `
          }}
        />
        {/* Schema.org 结构化数据：帮助搜索引擎理解应用信息 */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              'name': '多媒体对比工具',
              'description': '一款功能强大的在线图片与视频对比工具，支持同步缩放、平移及播放同步。',
              'applicationCategory': 'DesignApplication',
              'operatingSystem': 'All',
              'url': 'https://epiphany-cl.github.io/image-comparison-tool/',
              'featureList': [
                '双面板实时对比',
                '图片与视频同步缩放和平移',
                '视频播放进度自动同步',
                '支持拖拽上传及剪贴板粘贴',
                '深色模式支持',
                '触控板支持（捏合缩放、双指滑动平移）'
              ]
            })
          }}
        />
      </head>
      <body className={'font-sans antialiased'}>
        {/* 国际化提供者：为整个应用提供语言切换功能 */}
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
