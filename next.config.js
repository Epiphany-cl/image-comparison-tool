/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'export' 选项会使 Next.js 构建一个纯静态的 HTML/CSS/JS 应用。
  // 这意味着应用不依赖于 Node.js 服务器，可以部署在任何静态文件托管服务上。
  output: 'export',
  // 优化配置
  images: {
    unoptimized: true,
  },
  // 启用 React 严格模式
  reactStrictMode: true,
};

module.exports = nextConfig;