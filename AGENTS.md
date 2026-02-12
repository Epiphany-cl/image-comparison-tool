# AI 代理指南

## 概述
- 本仓库托管一个极简的 Next.js 图片对比工具。
- 本文档为 AI 智能体（如你）在此代码库中安全高效地操作提供了基本准则。

## 1. 构建、代码检查和测试命令

### 核心命令
- **构建**：`npm run build`
  - Next.js 以 'export' 模式构建到 `out/` 目录。
  - 需要配置 `NEXT_PUBLIC_BASE_PATH` 以在 GitHub Pages 上获取正确的资源路径。
- **开发**：`npm run dev`
  - 启动带有 Webpack 的 Next.js 开发服务器。
- **代码检查**：`npm run lint`
  - 使用 ESLint 检查和自动修复代码风格问题。
- **类型检查**：`npx tsc --noEmit`
  - 确保 TypeScript 合规性，不生成输出文件。
- **本地预览**：`npm run start`
  - 使用 `serve` 包提供 `out/` 目录的内容。

### 测试指南
- **当前状态**：`package.json` 中尚未配置自动化测试套件（Jest/Vitest）。
- **推荐设置**：如果添加测试，请使用 Vitest 以与现代技术栈兼容。
- **运行单个测试（模板）**：
  - **Jest**：`npx jest 路径/到/文件.test.ts -t "搜索字符串"`
  - **Vitest**：`npx vitest run 路径/到/文件.test.ts -t "搜索字符串"`

## 2. 代码风格指南

### 一般原则
- **严格 TypeScript**：`tsconfig.json` 中启用了 `strict: true`。避免使用 `any`。对象结构优先使用 `interface`，联合类型/别名优先使用 `type`。
- **路径别名**：始终使用 `@/*` 进行内部导入（例如 `import { cn } from '@/lib/utils'`）。
- **不变性**：优先使用 `const` 而非 `let`。对 React 状态使用函数式更新（`setState(prev => ...)`）。

### 导入和格式化
- **导入顺序**：
  1. 标准的 React/Next.js 钩子和组件。
  2. 外部库（例如 `lucide-react`、`@use-gesture/react`）。
  3. UI 组件（`@/components/ui/...`）。
  4. 本地组件、钩子和工具函数。
- **格式化**：ESLint 负责格式化。确保文件以换行符结尾，并使用 2 空格缩进。

### 命名约定
- **React 组件**：PascalCase（例如 `ImageCompare.tsx`）。
- **文件名**：组件文件使用 kebab-case（例如 `image-compare.tsx`），遵循 `components/` 目录中现有的约定。
- **钩子**：以 `use` 开头（例如 `useI18n`）。
- **工具函数**：camelCase（例如 `calculateBaseScale`）。
- **接口**：描述性强，如果文件中常用则前缀 I，否则仅使用名称（例如 `ViewState`、`ImageInfo`）。

### 组件模式
- **客户端**：由于使用了钩子和 DOM 事件监听器，大多数交互式组件需要 `'use client';`。
- **样式**：使用 Tailwind CSS。利用 `@/lib/utils` 中的 `cn()` 工具函数来合并类。
- **图标**：使用 `lucide-react`。
- **动画/渐变**：查看 `components/ui/liquid-glass.tsx` 以了解项目的标志性玻璃态效果。

### 国际化（i18n）
- **框架**：在 `lib/i18n.ts` 中使用基于 Context 的自定义 i18n。
- **用法**：使用 `useI18n` 钩子来访问翻译键（`t`）。
- **添加键**：添加翻译时，你 **必须** 同时更新：
  - `lib/locales/zh.ts`（中文）
  - `lib/locales/en.ts`（英文）
- 确保两个文件中的键完全匹配。

### 错误处理
- 对异步操作（例如文件读取、剪贴板访问）使用 `try/catch`。
- 使用 `ImageCompare.tsx` 中内置的 `toast` 状态向用户显示错误或成功消息。

## 3. UI 和 UX 标准
- **响应式**：该工具主要针对桌面端优化。在小屏幕上会显示 `MobileNotSupported`。
- **视觉效果**：利用 OKLCH 色彩空间以获得更好的感知渐变。
- **性能**：
  - 当图片被删除或替换时，使用 `URL.revokeObjectURL` 撤销 Blob URL 以防止内存泄漏。
  - 对传递给子组件的事件处理程序使用 `useCallback`。对昂贵的渲染使用 `React.memo`。

## 4. 项目结构
- `/app`：App Router 页面和全局 CSS。
- `/components`：
  - `/ui`：原子组件（按钮、玻璃容器）。
  - 根目录：功能特定组件（ImageCompare、HelpModal）。
- `/lib`：
  - `/locales`：翻译词典。
  - `i18n.ts`：本地化的 Context 和钩子。
  - `utils.ts`：工具函数（例如 `cn`）。
- `/public`：静态资源和 PWA 清单。

## 5. 安全性与可靠性
- **密钥**：切勿硬编码 API 密钥或敏感数据。
- **PWA**：通过 `@ducanh2912/next-pwa` 管理。配置位于 `next.config.js` 中。
- **依赖项**：添加新库之前，请验证它们是否与静态导出环境兼容（不使用仅限 Node.js 的模块）。

## 6. 规则与限制
- **Next.js 导出**：由于项目使用 `output: 'export'`，请勿使用 `getServerSideProps` 或 `API Routes`。
- **Cursor/Copilot 规则**：`.cursor/rules/` 或 `.github/copilot-instructions.md` 中当前没有规则。
- **验证**：在提交 PR 之前，始终运行 `npm run lint` 和 `npx tsc --noEmit`。

## 7. 智能体工作流程示例
1. **分析**：阅读 `lib/locales` 以检查现有的键。
2. **实现**：使用 Tailwind 和 Radix 原语添加新的 UI 逻辑。
3. **本地化**：同时更新 `zh.ts` 和 `en.ts`。
4. **清理**：确保 Blob URL 被正确管理。
5. **验证**：运行构建和代码检查。