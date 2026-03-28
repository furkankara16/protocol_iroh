import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    // Single HTML output — inline everything
    assetsInlineLimit: Infinity
  }
});
