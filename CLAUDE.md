# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个极简的 Next.js 图片对比工具，专为桌面端优化，支持同步缩放/平移对比图片。

**核心特点**：
- 单文件架构（`components/image-compare.tsx` 包含所有核心逻辑）
- 纯客户端，静态导出（无服务端运行时）
- GPU 加速变换（CSS transform）
- 无状态管理库，直接使用 React state
- 支持深色模式（OKLCH 色彩空间）
- 双语国际化（简体中文/English）
- 零配置部署（GitHub Pages 就绪）

**关键技术栈**：
- Next.js 16.0.10（静态导出）
- React 19.2.0
- @use-gesture/react（手势库）
- Tailwind CSS 4
- i18n 系统（自研轻量级实现）

## 核心架构

### 单文件数据流
```
ImageCompare (状态管理者)
├── ViewState { scale, offsetX, offsetY } ← 核心共享状态
└── 传递给两个 ImagePanel (同步)
    └── 通过 CSS transform: translate() × scale() 显示
```

### 三段式管道
1. **上传**：`File → FileReader → dataURL → Image → baseScale 计算`
2. **手势**：`useGesture() → 更新 ViewState → 触发重渲染`
3. **显示**：`ViewState × baseScale = displayScale → CSS transform`

## 关键实现细节

### 缩放系统
```typescript
// 基础缩放（自适应容器，限制最大 1）
calculateBaseScale(imgWidth, imgHeight) {
  const scaleX = containerWidth / imgWidth
  const scaleY = containerHeight / imgHeight
  return Math.min(scaleX, scaleY, 1)  // ≤ 1
}

// 最终显示缩放
displayScale = viewState.scale * image.baseScale

// 缩放限制
0.1x - 10x  // Math.min(Math.max(value, 0.1), 10)
```

### 手势智能识别
```typescript
onWheel: ({ delta: [dx, dy] }) => {
  const isTrackpad = Math.abs(dy) < 40

  if (isTrackpad) {
    // 触控板：平移
    offsetX -= dx; offsetY -= dy
  } else {
    // 鼠标滚轮：缩放
    newScale = scale * (dy > 0 ? 0.9 : 1.1)
    // 同时调整 offset 保持中心点
  }
}
```

### 变换公式
```typescript
// 每个 ImagePanel 的实际变换
transform: `translate(${offsetX}px, ${offsetY}px) scale(${displayScale})`
transformOrigin: 'center center'
```

## 文件结构和职责

| 文件 | 行数 | 作用 | 修改频率 |
|------|------|------|----------|
| `components/image-compare.tsx` | 570 | **所有逻辑**：手势、状态、UI、i18n | 高 |
| `app/globals.css` | 150 | OKLCH 主题变量、字体栈 | 低 |
| `app/layout.tsx` | 65 | 深色模式初始化脚本 | 极低 |
| `components/ui/button.tsx` | 75 | cva 按钮组件 | 极低 |
| `components/mobile-not-supported.tsx` | 45 | 移动端检测提示 | 极低 |
| `components/i18n-provider.tsx` | 46 | i18n 状态管理 Provider | 极低 |
| `lib/i18n.ts` | 50 | i18n 核心逻辑 (Context, Hook) | 极低 |
| `lib/locales.ts` | 20+ | 翻译定义对象 | 低 |
| `lib/utils.ts` | 12 | cn() 类名合并 | 极低 |
| `app/page.tsx` | 15 | 渲染器 | 极低 |

## i18n 国际化系统

本项目使用自研轻量级 i18n 系统，无需外部依赖。

### 工作流程
1. **初始化**：`I18nProvider` 使用 `getInitialLocale()` 检测语言
   - 优先：localStorage 中的 `locale` 项
   - 其次：浏览器语言 (`navigator.language`)
   - 默认：`'en'`
2. **Context 提供**：通过 `I18nContext` 向下传递 `{ locale, t, setLocale }`
3. **组件使用**：`useI18n()` Hook 获取翻译对象
4. **切换语言**：`setLocale()` 更新状态、localStorage、DOM lang 属性

### 文件结构
```
lib/i18n.ts              # 核心逻辑 (Context, Hook, 类型)
├── I18nContext          # React Context
├── useI18n()            # 自定义 Hook
├── translations         # 翻译映射 { zh, en }
└── getInitialLocale()   # 检测初始语言

lib/locales.ts           # 翻译定义
├── zh                   # 中文翻译对象
└── en                   # 英文翻译对象

components/i18n-provider.tsx  # Provider 组件
└── 管理语言状态和上下文注入
```

### 修改翻译
在 `lib/locales.ts` 中同步更新两个语言对象：

```typescript
export const zh = {
  imageCompare: '图片对比',
  clear: '清空',
  // ...
} as const;

export const en = {
  imageCompare: 'Image Compare',
  clear: 'Clear',
  // ...
} as const;
```

**注意**：修改后需要重启开发服务器以应用类型变化。

### 添加新翻译键
1. 在 `lib/locales.ts` 的 `zh` 和 `en` 对象中添加新键
2. 在代码中使用 `t.yourKey` 访问
3. 无需额外配置 Context 会自动传播

## 常用命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 开发服务器 (localhost:3000) |
| `npm run build` | 静态导出到 out/ |
| `npm run lint` | ESLint 自动修复 |
| `npx tsc --noEmit` | 仅类型检查 |
| `npm start` | 预览生产构建 (out/) |
| `npm run clean` | 删除 node_modules 和构建缓存 |
| `npm run reset` | 完全重置：clean + 重新安装依赖 |

## 修改指南

### 添加新功能？ → 修改 `components/image-compare.tsx`
- **新按钮**：在 `ImageCompare` 组件的控制栏 JSX 中添加（搜索 `顶部中央控制栏`）
- **新手势**：修改 `useGesture()` 处理器（搜索 `onPinch` 或 `onWheel`）
- **新状态**：扩展 `ViewState` interface（文件开头）
- **上传逻辑**：`handleUpload()` 函数（搜索 `处理图片上传的核心逻辑`）

### 调整视觉？ → 修改 `app/globals.css`
- **颜色**：在 `:root`（亮色）和 `.dark`（暗色）中修改（使用 OKLCH）
- **字体**：在 `@theme inline` 中的 `--font-sans`
- **所有颜色使用 OKLCH 色彩空间**（感知均匀）

### 改缩放限制？ → 修改 `components/image-compare.tsx`
- **最小/最大**：搜索 `Math.min(Math.max(..., 0.1), 10)`（共3处）
- **基础计算**：搜索 `calculateBaseScale` 函数

### 调整手势行为？ → 修改 `components/image-compare.tsx`
- **手势库**：搜索 `useGesture` 查看所有处理器
- **拖拽**：`onDrag` 更新 offset
- **捏合**：`onPinch` 缩放，重新计算 offset 保持中心
- **滚轮**：区分触控板（|dy| < 40）和鼠标滚轮

## 深色模式实现

1. **SSR 阶段**：`layout.tsx` 的 inline script 检测系统偏好 → 设置 class
2. **运行时**：`ImageCompare` 的 `useEffect` 监听系统变化 → 动态更新
3. **样式**：CSS 变量在 `:root` 和 `.dark` 中定义（OKLCH）

## 移动端处理

- **检测**：`components/mobile-not-supported.tsx` 使用 `navigator.userAgent`
- **隐藏**：主组件使用 `hidden md:flex`，媒体查询级隐藏
- **显示**：移动设备看到全屏提示 "仅支持桌面端"

## 依赖说明

### 运行时 (10个)
- `next@16.0.10`, `react@19.2.0`, `react-dom@19.2.0` - 框架
- `@use-gesture/react@10.3.1` - 鼠标/触控手势库
- `lucide-react@0.454.0` - 图标库
- `@radix-ui/react-slot@1.1.1` - UI 组件插槽
- `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.3.1` - 样式工具

### 开发工具 (11个)
- `typescript@^5`, `eslint@^9.39.2` - 类型和代码检查
- `@typescript-eslint/eslint-plugin@^8.49.0`, `@typescript-eslint/parser@^8.49.0`, `eslint-plugin-jsx@^0.1.0` - ESLint 配置
- `tailwindcss@^4.1.9`, `@tailwindcss/postcss@^4.1.9`, `postcss@^8.5` - CSS 工具链
- `tw-animate-css@^1.3.3` - 动画库
- `@types/node@^22`, `@types/react@^19`, `@types/react-dom@^19` - 类型定义
- `serve@^14.2.5` - 预览工具

**总计**：21 个依赖（10 运行时 + 11 开发工具）

## GitHub Pages 部署

本项目已配置自动化部署到 GitHub Pages。

### 部署机制
- **触发条件**：推送到 `main` 分支或手动触发 workflow
- **构建命令**：`NEXT_PUBLIC_BASE_PATH="/image-comparison-tool" next build`
- **输出目录**：`out/` (静态导出)
- **部署位置**：`https://<username>.github.io/image-comparison-tool/`

### 关键配置
1. **Next.js 配置**：静态导出模式 (`output: 'export'`)
2. **basePath**：通过环境变量设置，确保资产路径正确
3. **无服务端**：纯静态，100% 客户端渲染

### 手动部署（本地）
```bash
# 1. 设置 basePath 并构建
NEXT_PUBLIC_BASE_PATH="/image-comparison-tool" npm run build

# 2. 预览构建结果
npm start

# 3. 如果需要自定义域名，添加 CNAME 文件到 public/
echo "your-domain.com" > public/CNAME
```

## 性能特点

- **内存**：图片存为 dataURL（大图消耗 RAM）
- **渲染**：CSS transform（GPU 加速，不触发重排）
- **包大小**：~150KB（纯静态）
- **无 SSR**：完全客户端，静态导出
- **无 hydration 问题**：所有客户端组件正确标记 `'use client'`

## 常见陷阱

| 问题 | 原因 | 解决 |
|------|------|------|
| 移动端显示正常 | 组件级隐藏生效 | 正常 |
| ESLint 未使用警告 | 内联样式变量 | 前缀 `_`（如 `_containerSize`） |
| 类型错误 | 泛型不匹配 | 优先用 `useGesture` 基础用法 |
| 捏合失效 | 未阻止默认 | 已在 onPinch/wheel 调用 `preventDefault()` |

## 快速参考

**手势行为**：
- 拖拽：平移图片
- 捏合：双指缩放，以光标为中心
- 大滚轮：缩放（鼠标）
- 小滚轮：平移（触控板）
- 横向滚轮：阻止浏览器后退

**UI 位置**：
- 控制栏：固定顶部居中
- 面板标签：A/B（左下角）
- 删除按钮：已加载图片右上角
- 尺寸显示：已加载图片左下角

**关键数值**：
- 缩放限制：0.1x - 10x
- 触控板阈值：|deltaY| < 40
- 默认缩放：baseScale ≤ 1