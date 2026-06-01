import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Adds a self-signed HTTPS cert so navigator.mediaDevices (mic) works
    // on ALL devices/IPs on the local network — not just localhost.
    // On the deployed site (Render), real HTTPS is used automatically.
    basicSsl(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    // '::' = all network interfaces → reachable by phones/other devices on same WiFi
    // HTTPS (via basicSsl plugin above) makes microphone work on all of them
    host: '::',
    port: 3500,
    strictPort: true,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
}))