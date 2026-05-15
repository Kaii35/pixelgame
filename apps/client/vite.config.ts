import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': resolve(__dirname, 'src/app'),
      '@features': resolve(__dirname, 'src/features'),
      '@engine': resolve(__dirname, 'src/engine'),
      '@network': resolve(__dirname, 'src/network'),
      '@state': resolve(__dirname, 'src/state'),
      '@api': resolve(__dirname, 'src/api'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@lib': resolve(__dirname, 'src/lib'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
});
