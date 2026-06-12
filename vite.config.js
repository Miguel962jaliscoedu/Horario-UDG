import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer: npm run build -- --mode analyze o ANALYZE=true npm run build
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        // Names manuales para chunks más legibles
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/react')) return 'vendor-react';
          if (id.includes('node_modules/firebase')) return 'vendor-firebase';
          if (id.includes('node_modules/@react-oauth')) return 'vendor-auth';
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) return 'vendor-export';
          if (id.includes('node_modules/axios')) return 'vendor-http';
        },
      },
    },
    // CSS code splitting para evitar cargar CSS no usado
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
})
