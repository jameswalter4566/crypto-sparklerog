import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'global': {},
    'process.env': {}
  },
  build: {
    rollupOptions: {
      external: [
        "@solana/web3.js",
        "@solana/spl-token"
      ]
    }
  },
  optimizeDeps: {
    include: [
      "@solana/web3.js",
      "@solana/spl-token",
      "buffer"
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  }
});