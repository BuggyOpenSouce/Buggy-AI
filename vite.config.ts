import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|webp)$/i,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      squoosh: {
        encodeOptions: {
          mozjpeg: {
            quality: 85
          },
          webp: {
            lossless: 1
          },
          avif: {
            cqLevel: 33
          }
        }
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
          'markdown': ['react-markdown', 'rehype-raw', 'rehype-katex', 'remark-math'],
          'chart': ['chart.js', 'react-chartjs-2'],
          'profile': ['/src/buggyprofile/components/ProfileMenu.tsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
});