import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise warning limit (optional)
    chunkSizeWarningLimit: 1600,

    rollupOptions: {
      output: {
        // ✅ Split out vendor libraries
        manualChunks: {
          react: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/auth"], // split firebase separately
        },
      },
    },
  },
});

