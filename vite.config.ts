import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // set to true if you want source maps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // removes console.logs from production build
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          aws: [
            '@aws-amplify/auth',
            'aws-amplify',
            '@aws-sdk/client-bedrock-runtime',
            '@aws-sdk/client-dynamodb',
            '@aws-sdk/client-lambda',
            '@aws-sdk/client-s3',
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
