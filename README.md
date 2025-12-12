# 图片对比工具 📸

一款功能强大的在线图片对比工具，支持同步缩放、平移和多种图片上传方式，基于 Next.js 和 TypeScript 构建，提供流畅的用户体验和响应式设计。

该工具特别适合设计师、摄影师和需要精确比较图片细节的用户，可以轻松对比两张图片的差异，支持实时同步操作，让图片对比更加高效便捷。

## ✨ 功能特性

### 核心功能
- **双图实时对比**：并排显示两张图片，支持精确对比
- **同步操作**：两张图片同步缩放和平移，确保对比位置一致
- **多种上传方式**：支持拖拽上传和点击选择文件，操作便捷

### 设计与适配
- **响应式设计**：完美适配桌面、平板和移动设备
- **深色模式**：自动跟随系统主题切换，提供舒适的视觉体验
- **现代化界面**：简洁直观的用户界面，操作零学习成本

## 🛠️ 技术栈

- **[Next.js](https://nextjs.org/)** - 现代化 React 框架，支持服务端渲染和静态生成
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的 JavaScript 超集，提升代码质量和可维护性
- **[Tailwind CSS](https://tailwindcss.com/)** - 实用优先的 CSS 框架，快速构建美观的用户界面
- **[shadcn/ui](https://ui.shadcn.com/)** - 可定制的 UI 组件库，提供一致的设计语言
- **[Lucide React](https://lucide.dev/)** - 轻量级图标库，提供丰富的矢量图标

## 🚀 快速开始

### 环境要求
- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动

### 构建生产版本

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```


生成的静态文件将位于 `out` 目录中

## 📁 项目结构

```
├── app/                    # Next.js 应用路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局组件
│   └── page.tsx           # 首页组件
├── components/            # React 组件
│   ├── ui/               # UI 组件库
│   │   └── button.tsx    # 按钮组件
│   └── image-compare.tsx # 图片对比核心组件
├── lib/                  # 工具函数
│   └── utils.ts          # 通用工具函数
├── public/               # 静态资源
│   └── icon.svg          # 应用图标
├── image.png             # 项目截图
├── next.config.js        # Next.js 配置
├── package.json          # 项目依赖配置
├── postcss.config.mjs    # PostCSS 配置
└── tsconfig.json         # TypeScript 配置
```
 
## 📸 项目截图

### 主界面
![图片对比工具主界面](image.png)


## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
