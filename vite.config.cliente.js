// ============================================================
// Vite config para el build del APK Cliente (Capacitor)
// Genera bundle en dist-cliente/ desde index-cliente.html -> main-cliente.jsx
// ============================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Rutas relativas para que funcionen desde file:// o https://localhost en Capacitor
  base: './',
  build: {
    outDir: 'dist-cliente',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index-cliente.html'),
    },
  },
  // Vite escribe el HTML en dist-cliente/index-cliente.html.
  // Capacitor espera index.html en webDir, por eso lo renombramos via plugin abajo.
  // Solución simple: renombrar tras build con script (ver package.json: build:cliente).
});
