import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

export default defineConfig({
  // 【关键修复】告诉 Vite 去上一级目录(根目录)找 .env 文件
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
    port: 5173
  }
});