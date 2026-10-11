/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('html2canvas') || id.includes('dompurify') || id.includes('qrcode')) {
              return 'vendor-export'
            }
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd'
            }
            if (id.includes('framer-motion') || id.includes('motion') || id.includes('torph') || id.includes('embla-carousel')) {
              return 'vendor-motion'
            }
            if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('lucide-react')) {
              return 'vendor-ui'
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('@tanstack/react-query')) {
              return 'vendor-core'
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
})
