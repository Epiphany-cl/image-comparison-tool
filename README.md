# 图片对比工具

一款支持同步缩放和平移的图片对比工具，基于 Next.js 和 TypeScript 构建。

## 功能特性

- **双图对比**：同时显示两张图片进行对比
- **同步操作**：支持两张图片同步缩放和平移
- **多种上传方式**：支持拖拽上传和点击选择文件
- **流畅交互**：支持鼠标滚轮缩放和拖拽平移
- **响应式设计**：适配不同屏幕尺寸
- **深色模式**：自动跟随系统主题切换

## 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - React UI 组件库
- [Lucide React](https://lucide.dev/) - 图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

## 使用说明

1. 打开应用后，会看到左右两个面板
2. 在每个面板中，可以通过以下方式上传图片：
   - 拖拽图片文件到面板区域
   - 点击面板区域选择文件
3. 上传图片后，可以使用以下操作：
   - **鼠标滚轮**：缩放图片
   - **鼠标拖拽**：平移图片
   - **缩放按钮**：点击 "+" 放大，点击 "-" 缩小
   - **重置按钮**：重置视图为初始状态
   - **清空按钮**：清空所有图片

## 项目结构

```
├── app/                    # Next.js 应用路由
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # UI 组件
│   └── image-compare.tsx # 图片对比核心组件
├── lib/                  # 工具函数
│   └── utils.ts          # 通用工具
├── public/               # 静态资源
└── styles/               # 全局样式
```

## 开发指南

### 添加新功能

1. 在 `components/` 目录下创建新的组件
2. 如果是UI组件，建议放在 `components/ui/` 目录下
3. 使用 TypeScript 编写组件以获得类型安全

### 样式定制

项目使用 Tailwind CSS 进行样式开发，可以在 `app/globals.css` 中修改主题变量。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License