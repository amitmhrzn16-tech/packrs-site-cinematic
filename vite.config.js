import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
    ],
    build: {
        target: 'es2020',
        cssCodeSplit: true,
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
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
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    },
});
