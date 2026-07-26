import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Accept both modern VITE_* vars and legacy REACT_APP_* vars so existing
  // .env files and hosting dashboards keep working unchanged.
  envPrefix: ['VITE_', 'REACT_APP_'],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['recharts'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
