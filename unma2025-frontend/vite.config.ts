import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use absolute paths instead of relative
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@heroicons/react'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})
