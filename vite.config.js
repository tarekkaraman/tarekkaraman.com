import { defineConfig } from 'vite';

// base './' keeps asset paths relative so the same build works on
// GitHub Pages (/tarek-cv/), Cloudflare Pages, and a custom domain root.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 8192
  }
});
