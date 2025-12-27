# 图片对比工具 (Image Comparison Tool)

## 项目概述

**图片对比工具** 是一款极简的 Web 应用，专为精确的并排图片对比而设计。该项目基于 **Next.js**、**TypeScript** 和 **Tailwind CSS** 构建，支持同步缩放和平移，并新增了**解锁同步**功能，允许用户独立对齐图片。

### 主要功能特性
*   **双面板对比**：同时查看两张图片（A 面 / B 面）。
*   **同步导航**：默认情况下，缩放和平移操作会在两个面板之间实时同步。
*   **独立对齐**：**新功能！** 点击“解锁视图”按钮，可独立移动每一侧的图片。这允许用户在重新锁定以进行同步对比之前，精确对齐有细微位移的图片。
*   **手势支持**：通过 `@use-gesture/react` 全面支持鼠标拖拽/滚轮以及触控板捏合/平移。
*   **多种上传方式**：拖拽上传、点击选择或粘贴 (`Ctrl+V`)。
*   **渐进式 Web 应用 (PWA)**：配置支持离线使用和安装到桌面。
*   **国际化**：内置简体中文和英语支持。
*   **深色模式**：自动跟随系统偏好设置。

## 技术栈

*   **框架**：Next.js 15 (App Router)
*   **语言**：TypeScript
*   **样式**：Tailwind CSS v4 (via PostCSS)
*   **图标**：Lucide React
*   **状态与手势**：React Hooks, `@use-gesture/react`
*   **部署**：静态导出 (`output: 'export'`)

## 构建与运行

### 环境要求
*   Node.js 18.x+
*   npm 9.x+

### 常用命令

| 命令 | 描述 |
| :--- | :--- |
| `npm install` | 安装项目依赖。 |
| `npm run dev` | 启动开发服务器，访问地址 `http://localhost:3000`。 |
| `npm run build` | 构建生产版本。输出到 `out/` 目录（静态导出）。 |
| `npm start` | 使用 `serve` 本地预览生产构建。 |
| `npm run lint` | 运行 ESLint 检查代码质量问题。 |

## 项目结构

```text
/
├── app/
│   ├── page.tsx            # 应用主入口
│   ├── layout.tsx          # 根布局
│   └── globals.css         # 全局样式和 Tailwind 引入
├── components/
│   ├── image-compare.tsx   # 核心组件。负责：
│   │                       # - 双图片渲染
│   │                       # - 同步/独立视图状态逻辑管理
│   │                       # - 手势处理 (@use-gesture)
│   ├── help-modal.tsx      # 帮助/使用说明模态框
│   ├── i18n-provider.tsx   # 用于国际化的 React Context Provider
│   └── ui/                 # 可复用的 UI 组件（如按钮等）
├── lib/
│   ├── i18n.ts             # 国际化逻辑和 Hooks
│   ├── utils.ts            # 工具函数（如类名合并）
│   └── locales/            # 翻译文件 (en.ts, zh.ts)
├── public/                 # 静态资源（图标、manifest）
├── next.config.js          # Next.js 配置（PWA、静态导出）
└── package.json            # 项目依赖和脚本
```

## 开发规范

*   **组件架构**：应用的核心逻辑位于 `image-compare.tsx` 中。它现在管理着两个独立的视图状态（`leftViewState` 和 `rightViewState`）以及一个 `isSynced` 标志，用于控制一侧的操作是否应用到另一侧。
*   **样式**：所有样式均使用 Tailwind CSS。使用 `clsx` 和 `tailwind-merge` 处理动态类名。
*   **国际化**：在 `lib/i18n.ts` 中使用 React Context 实现了一个轻量级的 i18n 方案。如需添加语言，请更新 `lib/locales/` 目录。
*   **静态导出**：项目配置为静态导出模式（`next.config.js` 中的 `output: 'export'`），这意味着生产环境部署不依赖 Node.js 运行时。