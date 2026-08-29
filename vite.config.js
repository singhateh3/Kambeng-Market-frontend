// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    build: {
        // Tailwind 3.4's `darkMode: 'class'` emits selectors wrapped in
        // :is(:where(.dark) ...). esbuild's CSS minifier (the Vite default)
        // corrupts that specific nesting during minification — it strips the
        // leading `:is(:where(` but leaves the matching `)` characters,
        // producing invalid selectors like `.dark) body)` that browsers
        // silently drop, so every dark: rule in the build was a no-op even
        // though Tailwind generated them correctly. JS minification (a
        // separate esbuild pass, build.minify) is unaffected by this and
        // stays on.
        cssMinify: false,
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000', // Your Laravel backend URL
                changeOrigin: true,
            },
        },
    },
});