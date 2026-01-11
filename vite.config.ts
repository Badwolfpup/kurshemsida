import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:5001', // Your backend URL/port
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'https://localhost:5001', // Same backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // build: {
  //   outDir: '../../kursserver/kursserver/wwwroot',
  //   emptyOutDir: true, // This nukes the folder before putting new files in
  // },
})

