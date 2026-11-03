import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('xlsx') || id.includes('jspdf') || id.includes('html2canvas')) return 'export-libs';
            if (id.includes('@reduxjs') || id.includes('redux')) return 'redux';
            if (id.includes('formik') || id.includes('yup')) return 'forms';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) return 'react-vendor';
            return 'vendor';
          }
          if (id.includes('/features/admin/pages/')) return 'admin-pages';
          if (id.includes('/features/ict/pages/')) return 'ict-pages';
          if (id.includes('/features/alumni/')) return 'alumni-portal';
          if (id.includes('/features/employers/')) return 'employer-portal';
          if (id.includes('/features/registrar/')) return 'registrar-portal';
          if (id.includes('/features/departments/')) return 'department-portal';
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
});
