import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Manual chunks split the heavy 3D + post-processing code from the main bundle
// so Lighthouse first-paint stays under target.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        // Function form is required by rolldown — splits heavy libs into
        // their own cacheable chunks.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('three/') || id.includes('three\\')) return 'three';
          if (id.includes('@react-three/postprocessing') || id.includes('postprocessing')) return 'postfx';
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'r3f';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('gsap')) return 'gsap';
        },
      },
    },
  },
  server: {
    headers: {
      // Long-cache hashed assets in dev too — useful for refresh testing.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
});
