import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const externalVitePort = Number(process.env.VITE_PORT ?? 5173);
const viteDevServerUrl = process.env.VITE_DEV_SERVER_URL ?? `http://localhost:${externalVitePort}`;

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Atkinson Hyperlegible', {
                    weights: [400, 700],
                    styles: ['normal', 'italic'],
                    preload: [{ weight: 400 }],
                }),
                bunny('Bricolage Grotesque', {
                    weights: [500, 600, 700, 800],
                    preload: [{ weight: 700 }],
                }),
                bunny('Caveat', {
                    weights: [500, 600, 700],
                    preload: false,
                }),
                bunny('Fraunces', {
                    weights: [600, 700],
                    preload: false,
                }),
            ],
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0',
        port: externalVitePort,
        strictPort: true,
        origin: viteDevServerUrl,
        hmr: {
            host: 'localhost',
            clientPort: externalVitePort,
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
