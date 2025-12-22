# 图片对比工具

[在线预览](https://epiphany-cl.github.io/image-comparison-tool/) | [备用链接](https://image-compare.chenlong716.dpdns.org/)

一款极简的在线图片对比工具，专为桌面端优化，支持同步缩放/平移对比图片。

适用于设计师、摄影师等需要精确比较图片细节的用户。

## 功能特性

- **双图并排实时对比**：左右面板同步操作
- **同步缩放和平移**：鼠标、触控板手势全支持
- **多种上传方式**：拖拽上传、点击选择、Ctrl+V 粘贴图片
- **深色模式支持**：自动跟随系统
- **双语国际化**：简体中文 / English

## 快速开始

### 环境要求

- Node.js 18.x+
- npm 9.x+

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
# 构建生产版本（静态导出到 out/）
npm run build

# 预览生产构建
npm start
```

静态文件将生成在 `out` 目录

## 项目截图

![图片对比工具主界面](image.png)

## 许可证

MIT License - 查看 LICENSE 文件了解详情
