import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Identificador único de cada build: invalida la caché del service worker y del navegador. */
const BUILD_ID = process.env.BUILD_ID || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

function stampServiceWorker(): Plugin {
  return {
    name: 'navidado-sw-stamp',
    apply: 'build',
    closeBundle() {
      const sw = resolve(__dirname, 'dist/client/sw.js');
      if (existsSync(sw)) writeFileSync(sw, readFileSync(sw, 'utf8').replaceAll('__BUILD_ID__', BUILD_ID));
    }
  };
}

export default defineConfig({
  root: 'src/client',
  publicDir: '../../public',
  plugins: [svelte(), stampServiceWorker()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  build: { outDir: '../../dist/client', emptyOutDir: true, chunkSizeWarningLimit: 900 },
  server: {
    host: true,
    port: 5173,
    proxy: { '/socket.io': { target: 'http://localhost:3000', ws: true }, '/health': 'http://localhost:3000' }
  },
  test: { root: '.', include: ['tests/**/*.test.ts'] }
} as any);
