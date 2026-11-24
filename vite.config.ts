import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  root: 'src/client',
  publicDir: '../../public',
  plugins: [svelte()],
  build: { outDir: '../../dist/client', emptyOutDir: true },
  server: {
    host: true,
    port: 5173,
    proxy: { '/socket.io': { target: 'http://localhost:3000', ws: true }, '/health': 'http://localhost:3000' }
  },
  test: { root: '.', include: ['tests/**/*.test.ts'] }
} as any);
