import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'global': {},
    'process.env': {}
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
  },
  build: {
    commonjsOptions: {
      include: [/@solana\/web3\.js/, /buffer/, /@solana\/spl-token/]
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'solana-web3': ['@solana/web3.js'],
          'solana-spl-token': ['@solana/spl-token']
        }
      }
    }
  }
}));