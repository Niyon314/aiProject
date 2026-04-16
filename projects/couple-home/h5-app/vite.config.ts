import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React and core libraries
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
              return 'react-vendor'
            }
            // Recharts for charts
            if (id.includes('/recharts/')) {
              return 'charts-vendor'
            }
            // State management
            if (id.includes('/zustand/')) {
              return 'state-vendor'
            }
            // IndexedDB wrapper
            if (id.includes('/idb/')) {
              return 'utils-vendor'
            }
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'esbuild',
    // Source maps for production debugging (optional, can disable for smaller builds)
    sourcemap: false,
    // Target modern browsers for smaller bundle
    target: 'esnext',
  },
})
