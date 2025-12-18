/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // 配置 PostCSS 以使用 Tailwind CSS 插件
    // Tailwind CSS 插件会处理 @tailwind, @apply 等指令，并将配置文件中的设计系统转换为实际的 CSS。
    '@tailwindcss/postcss': {},
  },
}

export default config
