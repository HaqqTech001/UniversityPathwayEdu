<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()], build: { outDir: 'dist' } });
=======
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
export default defineConfig({ plugins: [react(), tailwindcss()] });
>>>>>>> f4df9c6281f56f71ea1b0be1ba7fbca079648305
