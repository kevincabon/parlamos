import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  envDir: '.',
  define: {
    'process.env': {}
  },
  build: {
    target: 'esnext'
  }
})
