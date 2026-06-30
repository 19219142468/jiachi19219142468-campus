import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

let apiPort = 40000
try {
  const portFile = path.resolve(__dirname, '.api_port')
  if (fs.existsSync(portFile)) {
    apiPort = parseInt(fs.readFileSync(portFile, 'utf-8').trim()) || 40000
  }
} catch {}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        ws: true
      }
    }
  }
})
