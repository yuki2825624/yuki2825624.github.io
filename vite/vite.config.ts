import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    base: "/",
    build: {
        rollupOptions: {
            input: {
                "main": "/index.html",
                "about": "/about.html",
                "work": "/work.html",
                "test": "/test.html",
                "work/licu": "/work/licu.html",
                "work/tetris": "/work/tetris.html"
            }
        }
    },
    plugins: [
        tailwindcss()
    ]
});