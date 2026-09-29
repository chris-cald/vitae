import { env } from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
