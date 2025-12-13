# 图片对比工具

[在线预览](https://epiphany-cl.github.io/image-comparison-tool/)

一款基于 Next.js 和 TypeScript 构建的在线图片对比工具，支持同步缩放、平移和多种上传方式。

适用于设计师、摄影师等需要精确比较图片细节的用户。

## 功能特性

- 双图并排实时对比
- 同步缩放和平移操作
- 支持拖拽上传文件
- 响应式布局
- 深色模式支持
- 简洁直观的界面

## 技术栈

- Next.js - React 框架
- TypeScript - 类型安全
- Tailwind CSS - 样式框架
- shadcn/ui - UI 组件库
- Lucide React - 图标库

## 快速开始

### 环境要求
- Node.js 18.x+

### 安装启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建部署

```bash
# 构建生产版本
npm run build

# 运行生产版本
npm start
```

静态文件将生成在 `out` 目录

## 项目结构

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   └── button.tsx
│   └── image-compare.tsx
├── lib/
│   └── utils.ts
├── public/
│   └── icon.svg
├── next.config.js
├── package.json
└── tsconfig.json
```

## 项目截图

![图片对比工具主界面](image.png)

## 许可证

MIT License - 查看 LICENSE 文件了解详情