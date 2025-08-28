import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
//     server: {
//     host: true,        // setara --host 0.0.0.0
//     port: 5173,
//     strictPort: true,
//     hmr: {
//       host: '192.168.137.1', // ganti ke IP hotspot laptop lu
//       protocol: 'ws',
//       clientPort: 5173,
//     },
//   },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
