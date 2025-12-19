import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  envDir: '..',
  
  plugins: [
    react(),
    cesium()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 【关键修复】开启轮询监听，解决 Docker 下代码修改不生效的问题
    watch: {
      usePolling: true,
      interval: 100
    }
  }
});