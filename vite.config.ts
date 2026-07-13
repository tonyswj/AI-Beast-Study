import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 加载环境变量（包括从 GitHub Actions 传入的）
  const env = loadEnv(mode, '.', '');

  // GitHub Pages 部署路径配置：
  // - 如果是 GitHub Actions 构建，使用仓库名作为 base 路径
  // - 如果配置了自定义域名，将 base 改为 '/'
  // - 本地开发使用 '/'
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = mode === 'production' && repositoryName
    ? `/${repositoryName}/`
    : '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // 确保构建输出目录干净
      emptyOutDir: true,
      // 生成 sourcemap 便于调试
      sourcemap: true,
    },
  };
});
