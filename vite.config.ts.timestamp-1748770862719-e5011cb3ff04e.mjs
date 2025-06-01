// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { ViteImageOptimizer } from "file:///home/project/node_modules/vite-plugin-image-optimizer/dist/index.mjs";
var vite_config_default = defineConfig({
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
    exclude: ["lucide-react"]
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "framer-motion": ["framer-motion"],
          "markdown": ["react-markdown", "rehype-raw", "rehype-katex", "remark-math"],
          "chart": ["chart.js", "react-chartjs-2"],
          "profile": ["/src/buggyprofile/components/ProfileMenu.tsx"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3
  },
  server: {
    headers: {
      "Cache-Control": "public, max-age=31536000"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlSW1hZ2VPcHRpbWl6ZXIgfSBmcm9tICd2aXRlLXBsdWdpbi1pbWFnZS1vcHRpbWl6ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlSW1hZ2VPcHRpbWl6ZXIoe1xuICAgICAgdGVzdDogL1xcLihqcGU/Z3xwbmd8Z2lmfHdlYnApJC9pLFxuICAgICAgaW5jbHVkZVB1YmxpYzogdHJ1ZSxcbiAgICAgIGxvZ1N0YXRzOiB0cnVlLFxuICAgICAgYW5zaUNvbG9yczogdHJ1ZSxcbiAgICAgIHNxdW9vc2g6IHtcbiAgICAgICAgZW5jb2RlT3B0aW9uczoge1xuICAgICAgICAgIG1vempwZWc6IHtcbiAgICAgICAgICAgIHF1YWxpdHk6IDg1XG4gICAgICAgICAgfSxcbiAgICAgICAgICB3ZWJwOiB7XG4gICAgICAgICAgICBsb3NzbGVzczogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYXZpZjoge1xuICAgICAgICAgICAgY3FMZXZlbDogMzNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICdmcmFtZXItbW90aW9uJzogWydmcmFtZXItbW90aW9uJ10sXG4gICAgICAgICAgJ21hcmtkb3duJzogWydyZWFjdC1tYXJrZG93bicsICdyZWh5cGUtcmF3JywgJ3JlaHlwZS1rYXRleCcsICdyZW1hcmstbWF0aCddLFxuICAgICAgICAgICdjaGFydCc6IFsnY2hhcnQuanMnLCAncmVhY3QtY2hhcnRqcy0yJ10sXG4gICAgICAgICAgJ3Byb2ZpbGUnOiBbJy9zcmMvYnVnZ3lwcm9maWxlL2NvbXBvbmVudHMvUHJvZmlsZU1lbnUudHN4J10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ2FjaGUtQ29udHJvbCc6ICdwdWJsaWMsIG1heC1hZ2U9MzE1MzYwMDAnLFxuICAgIH0sXG4gIH0sXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLDBCQUEwQjtBQUVuQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixtQkFBbUI7QUFBQSxNQUNqQixNQUFNO0FBQUEsTUFDTixlQUFlO0FBQUEsTUFDZixVQUFVO0FBQUEsTUFDVixZQUFZO0FBQUEsTUFDWixTQUFTO0FBQUEsUUFDUCxlQUFlO0FBQUEsVUFDYixTQUFTO0FBQUEsWUFDUCxTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0EsTUFBTTtBQUFBLFlBQ0osVUFBVTtBQUFBLFVBQ1o7QUFBQSxVQUNBLE1BQU07QUFBQSxZQUNKLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLEVBQzFCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixnQkFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUNyQyxpQkFBaUIsQ0FBQyxlQUFlO0FBQUEsVUFDakMsWUFBWSxDQUFDLGtCQUFrQixjQUFjLGdCQUFnQixhQUFhO0FBQUEsVUFDMUUsU0FBUyxDQUFDLFlBQVksaUJBQWlCO0FBQUEsVUFDdkMsV0FBVyxDQUFDLDhDQUE4QztBQUFBLFFBQzVEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCxpQkFBaUI7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
