import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
export default defineConfig({ plugins: [react(), tailwindcss()], server: { port: 3100, strictPort: true, proxy: { '/api': { target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:4000', changeOrigin: true } } } });
