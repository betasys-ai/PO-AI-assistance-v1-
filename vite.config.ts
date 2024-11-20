import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env': {},
    'process.env.VITE_AWS_ACCESS_KEY_ID': JSON.stringify(process.env.VITE_AWS_ACCESS_KEY_ID),
    'process.env.VITE_AWS_SECRET_ACCESS_KEY': JSON.stringify(process.env.VITE_AWS_SECRET_ACCESS_KEY),
    'process.env.VITE_AWS_REGION': JSON.stringify(process.env.VITE_AWS_REGION),
    'process.env.VITE_S3_BUCKET_NAME': JSON.stringify(process.env.VITE_S3_BUCKET_NAME),
    'process.env.VITE_RESEND_API_KEY': JSON.stringify(process.env.VITE_RESEND_API_KEY),
  },
  assetsInclude: ['**/*.md'],
});