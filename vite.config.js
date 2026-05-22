import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cenz-s-blog/',
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm', 'sqlite-wasm-http']
  },
  worker: {
    format: 'es'
  },
  server: {
    headers: {
      // Allows testing of high-performance shared memory modes in development
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
