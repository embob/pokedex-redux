// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),          // React fast‑refresh + TSX transform
    tailwindcss(),    // Tailwind v4 Vite plugin  ← NEW
  ],
});
