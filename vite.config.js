import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Fix para Vercel dev: el proxy reescribe requests a /index.html,
    // y Vite 7 intenta parsearlo como JS en vite:import-analysis.
    // Este middleware reescribe /index.html a / antes de que Vite lo procese.
    {
      name: 'fix-vercel-dev-proxy',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url && (req.url === '/index.html' || req.url.startsWith('/index.html?'))) {
            req.url = '/' + req.url.slice('/index.html'.length);
          }
          next();
        });
      },
    },
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
    target: 'es2020', // Entregar ES2020 para mejor tree-shaking y bundles más pequeños
    rollupOptions: {
      output: {
        // Nombres manuales para chunks más legibles (solo para imports estáticos)
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/react')) return 'vendor-react';
          // firebase/firestore va en chunk separado (lazy, solo cuando se usa)
          if (id.includes('node_modules/firebase/firestore')) return 'vendor-firestore';
          // firebase/app y firebase/auth van en vendor-firebase (eager, se necesita auth en todas las páginas)
          if (id.includes('node_modules/firebase')) return 'vendor-firebase';
          if (id.includes('node_modules/@react-oauth')) return 'vendor-auth';
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) return 'vendor-export';
          if (id.includes('node_modules/axios')) return 'vendor-http';
        },
      },
    },
    // CSS code splitting: carga solo el CSS necesario por página
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    // Minificación CSS con esbuild (incluye eliminación de CSS no usado)
    minify: 'esbuild',
    cssMinify: 'esbuild',
    // Reporte de assets para debugging
    reportCompressedSize: false,
    // No generar modulepreload para chunks dinámicos pesados
    // (ej: jspdf+html2canvas 595kB no deben precargarse en inicio)
    modulePreload: false,
  },
  server: {
    port: 5173,
    // Proxy para API serverless de Vercel en desarrollo
    // Ejecuta 'npx vercel dev' en otra terminal (puerto 3000)
    // para que las funciones api/* funcionen con datos reales de SIIAU
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
})
