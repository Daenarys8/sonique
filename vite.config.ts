import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@aws-amplify/auth']
  },
  define: {
    // If you need to use process.env anywhere else
    'process.env': {}
  }
});
