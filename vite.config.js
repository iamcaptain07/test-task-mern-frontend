import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend-env.eba-drmctxck.eu-north-1.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
