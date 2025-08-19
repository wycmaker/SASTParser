import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/SASTParser/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
