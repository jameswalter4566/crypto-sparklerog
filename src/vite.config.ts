import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      host: '1ad7b388-a6db-42c6-928c-9d4e057fbc2b.lovableproject.com',
      path: '/ws'
    }
  },
  plugins: [react()],
})