import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    // Single-threaded build: GitHub Pages doesn't send the
                    // COOP/COEP headers required for the multi-threaded one
                    src: 'node_modules/stockfish/bin/stockfish-18-lite-single.js',
                    dest: 'stockfish',
                    rename: { stripBase: 3 }, // strip node_modules/stockfish/bin
                },
                {
                    src: 'node_modules/stockfish/bin/stockfish-18-lite-single.wasm',
                    dest: 'stockfish',
                    rename: { stripBase: 3 },
                },
            ],
        }),
    ],
    assetsInclude: ['**/*.gltf', '**/*.glb'],
});
